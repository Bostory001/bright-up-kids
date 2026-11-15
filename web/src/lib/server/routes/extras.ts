import "server-only";
import { DEFAULT_SETTINGS } from "../../gamification";
import type { AppUser, Assignment, Attempt, Attendance, Course, Enrollment, Exercise, Grade, Lead, Makeup, Settings, Student } from "../../types";
import { createSession } from "../auth";
import { notifyParent } from "../notify";
import { OWNER, route, STAFF } from "../router";
import { starterExercises } from "../seed-exercises";
import { clearSettingsCache, getSettings } from "../settings";
import { bkkDate, dateStr, HttpError, newId, nowIso, num, oneOf, optStr, str } from "../util";

import { GRADES } from "../../grade";

// ---------- ตั้งค่าสถาบัน ----------

route("GET", "admin/settings", STAFF, async ({ store }) => ({ settings: await getSettings(store), defaults: DEFAULT_SETTINGS }));

route("PATCH", "admin/settings", OWNER, async ({ store, body }) => {
  const current = await getSettings(store);
  const settings: Settings = {
    id: "main",
    dailyLimitQuestions: num(body.dailyLimitQuestions, "จำนวนโจทย์ต่อวัน", 5, 1000),
    dailyLimitMinutes: num(body.dailyLimitMinutes, "เวลาต่อวัน (นาที)", 10, 600),
    rewardBudgetBaht: num(body.rewardBudgetBaht, "งบของรางวัล", 0, 1_000_000),
    royaltyPercent: num(body.royaltyPercent, "อัตรา royalty", 0, 100),
    // ช่องที่เพิ่มทีหลัง: ไม่ส่งมา = ใช้ค่าเดิม เพื่อไม่ให้ฟอร์มรุ่นเก่าพัง
    profitTargetBaht: body.profitTargetBaht === undefined ? current.profitTargetBaht : num(body.profitTargetBaht, "เป้ากำไรต่อเดือน", 0, 10_000_000),
    require2fa: body.require2fa === undefined ? current.require2fa : body.require2fa === true,
  };
  await store.set("settings", settings);
  clearSettingsCache();
  return { settings };
});

// ---------- ชุดโจทย์เริ่มต้น ----------

// นำเข้าเป็นร่างเท่านั้น ข้ามชุดที่มีชื่อ+ชั้นซ้ำ กดซ้ำได้ไม่เกิดของซ้ำ
route("POST", "admin/exercises/seed", OWNER, async ({ store }) => {
  const existing = new Set((await store.list<Exercise>("exercises")).map((e) => `${e.grade}|${e.title}`));
  let added = 0;
  for (const draft of starterExercises()) {
    if (existing.has(`${draft.grade}|${draft.title}`)) continue;
    await store.set("exercises", { ...draft, id: newId(), createdAt: nowIso() } satisfies Exercise);
    added++;
  }
  return { added };
});

// ---------- ผู้สนใจ / ทดลองเรียนฟรี ----------

const LEAD_STATUS = ["new", "contacted", "booked", "attended", "enrolled", "lost"] as const;
const trialHits = new Map<string, number[]>();

function cleanPhone(v: unknown): string {
  const phone = str(v, "เบอร์โทร", 20).replace(/\D/g, "");
  if (phone.length < 9 || phone.length > 10) throw new HttpError(400, "เบอร์โทรไม่ถูกต้อง");
  return phone;
}

route("POST", "public/trial", "public", async ({ store, body, req }) => {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  const recent = (trialHits.get(ip) ?? []).filter((t) => t > Date.now() - 3600_000);
  if (recent.length >= 5) throw new HttpError(429, "ส่งคำขอบ่อยเกินไป กรุณาลองใหม่ภายหลัง");
  trialHits.set(ip, [...recent, Date.now()]);
  if (body.consent !== true) throw new HttpError(400, "ต้องยินยอมให้สถาบันติดต่อกลับก่อน");

  const lead: Lead = {
    id: newId(),
    parentName: str(body.parentName, "ชื่อผู้ปกครอง", 80),
    phone: cleanPhone(body.phone),
    childNickname: str(body.childNickname, "ชื่อเล่นน้อง", 30),
    grade: oneOf(Number(body.grade), GRADES, "ชั้น") as Grade,
    source: optStr(body.source, 60),
    note: optStr(body.note, 300),
    status: "new",
    consentAt: nowIso(),
    createdAt: nowIso(),
  };
  await store.set("leads", lead);
  return { ok: true };
});

route("GET", "admin/leads", STAFF, async ({ store }) => {
  const leads = await store.list<Lead>("leads");
  const count = (s: Lead["status"]) => leads.filter((l) => l.status === s).length;
  return {
    leads: leads.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    // กรวยการขาย: ใช้ดูว่าหลุดที่ขั้นไหน
    funnel: { total: leads.length, booked: count("booked") + count("attended") + count("enrolled"), attended: count("attended") + count("enrolled"), enrolled: count("enrolled") },
  };
});

route("POST", "admin/leads", STAFF, async ({ store, body }) => {
  const lead: Lead = {
    id: newId(),
    parentName: str(body.parentName, "ชื่อผู้ปกครอง", 80),
    phone: cleanPhone(body.phone),
    childNickname: str(body.childNickname, "ชื่อเล่นน้อง", 30),
    grade: oneOf(Number(body.grade), GRADES, "ชั้น") as Grade,
    source: optStr(body.source, 60),
    note: optStr(body.note, 300),
    status: "new",
    consentAt: nowIso(),
    createdAt: nowIso(),
  };
  await store.set("leads", lead);
  return { lead };
});

route("PATCH", "admin/leads/:id", STAFF, async ({ store, body, params }) => {
  const lead = await store.get<Lead>("leads", params.id);
  if (!lead) throw new HttpError(404, "ไม่พบรายการ");
  const next: Lead = {
    ...lead,
    status: oneOf(body.status, LEAD_STATUS, "สถานะ"),
    note: optStr(body.note, 300),
    trialDate: body.trialDate ? dateStr(body.trialDate, "วันนัดทดลองเรียน") : undefined,
  };
  await store.set("leads", next);
  return { lead: next };
});

// ลบข้อมูลผู้สนใจที่ไม่สมัคร (สิทธิ์ตาม PDPA)
route("DELETE", "admin/leads/:id", STAFF, async ({ store, params }) => {
  await store.remove("leads", params.id);
  return { ok: true };
});

// ---------- เรียนชดเชย ----------

route("GET", "admin/makeups", STAFF, async ({ store }) => {
  const since = bkkDate(new Date(Date.now() - 45 * 86_400_000));
  const [attendance, makeups, students, courses] = await Promise.all([
    store.list<Attendance>("attendance"),
    store.list<Makeup>("makeups"),
    store.list<Student>("students"),
    store.list<Course>("courses"),
  ]);
  const describe = (studentId: string, courseId: string) => {
    const s = students.find((x) => x.id === studentId);
    return { studentCode: s?.code, studentNickname: s?.nickname, courseName: courses.find((c) => c.id === courseId)?.name };
  };
  return {
    // คาบที่ขาด/ลาใน 45 วัน ที่ยังไม่ได้นัดชดเชย
    missed: attendance
      .filter((a) => (a.status === "absent" || a.status === "leave") && a.date >= since && !makeups.some((m) => m.id === a.id))
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((a) => ({ attendanceId: a.id, date: a.date, status: a.status, ...describe(a.studentId, a.courseId) })),
    makeups: makeups.sort((a, b) => b.makeupDate.localeCompare(a.makeupDate)).map((m) => ({ ...m, ...describe(m.studentId, m.courseId) })),
  };
});

route("POST", "admin/makeups", STAFF, async ({ store, body }) => {
  const missed = await store.get<Attendance>("attendance", str(body.attendanceId, "คาบที่ขาด", 200));
  if (!missed || (missed.status !== "absent" && missed.status !== "leave")) throw new HttpError(400, "คาบนี้ไม่ได้ขาดหรือลา");
  const makeup: Makeup = {
    id: missed.id,
    studentId: missed.studentId,
    courseId: missed.courseId,
    missedDate: missed.date,
    makeupDate: dateStr(body.makeupDate, "วันชดเชย"),
    status: "planned",
    createdAt: nowIso(),
  };
  await store.set("makeups", makeup);
  const student = await store.get<Student>("students", missed.studentId);
  await notifyParent(store, student?.parentId, "general", `นัดเรียนชดเชยน้อง${student?.nickname ?? ""} (แทนวันที่ ${missed.date}) วันที่ ${makeup.makeupDate}`);
  return { makeup };
});

route("PATCH", "admin/makeups/:id", STAFF, async ({ store, body, params }) => {
  const makeup = await store.get<Makeup>("makeups", params.id);
  if (!makeup) throw new HttpError(404, "ไม่พบนัดชดเชย");
  await store.set("makeups", { ...makeup, status: oneOf(body.status, ["planned", "done", "cancelled"] as const, "สถานะ") });
  return { ok: true };
});

// ---------- การบ้าน ----------

route("GET", "admin/assignments", STAFF, async ({ store }) => {
  const [assignments, enrollments, attempts, courses, exercises, students] = await Promise.all([
    store.list<Assignment>("assignments"),
    store.list<Enrollment>("enrollments", { status: "active" }),
    store.list<Attempt>("attempts", { status: "finished" }),
    store.list<Course>("courses"),
    store.list<Exercise>("exercises"),
    store.list<Student>("students", { active: true }),
  ]);
  return {
    assignments: assignments
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((a) => {
        const roster = enrollments.filter((e) => e.courseId === a.courseId).map((e) => students.find((s) => s.id === e.studentId)).filter((s): s is Student => Boolean(s));
        const done = (s: Student) => attempts.some((t) => t.studentId === s.id && t.exerciseId === a.exerciseId && t.startedAt >= a.createdAt);
        return {
          ...a,
          courseName: courses.find((c) => c.id === a.courseId)?.name,
          exerciseTitle: exercises.find((e) => e.id === a.exerciseId)?.title ?? "(ลบแล้ว)",
          total: roster.length,
          doneCount: roster.filter(done).length,
          notDone: roster.filter((s) => !done(s)).map((s) => s.nickname),
        };
      }),
  };
});

route("POST", "admin/assignments", STAFF, async ({ store, body }) => {
  const course = await store.get<Course>("courses", str(body.courseId, "คอร์ส", 40));
  const exercise = await store.get<Exercise>("exercises", str(body.exerciseId, "แบบฝึกหัด", 40));
  if (!course || !exercise) throw new HttpError(404, "ไม่พบคอร์สหรือแบบฝึกหัด");
  if (!exercise.published) throw new HttpError(400, "ต้องเผยแพร่แบบฝึกหัดก่อนสั่งเป็นการบ้าน");
  if (!course.grades.includes(exercise.grade)) throw new HttpError(400, `แบบฝึกหัดนี้เป็นของ ป.${exercise.grade} ซึ่งคอร์สนี้ไม่ได้สอน นักเรียนจะมองไม่เห็น`);
  const assignment: Assignment = { id: newId(), courseId: course.id, exerciseId: exercise.id, dueDate: dateStr(body.dueDate, "กำหนดส่ง"), createdAt: nowIso() };
  await store.set("assignments", assignment);

  const enrollments = await store.list<Enrollment>("enrollments", { courseId: course.id, status: "active" });
  for (const e of enrollments) {
    const student = await store.get<Student>("students", e.studentId);
    if (student?.active) await notifyParent(store, student.parentId, "general", `การบ้านน้อง${student.nickname}: ${exercise.title} (${course.name}) ส่งภายใน ${assignment.dueDate}`);
  }
  return { assignment };
});

route("DELETE", "admin/assignments/:id", STAFF, async ({ store, params }) => {
  await store.remove("assignments", params.id);
  return { ok: true };
});

// ---------- ผู้ปกครองเข้าผ่าน LINE (LIFF) ----------

// หน้า /parent/line ขอค่า LIFF ID จากที่นี่ (ไม่ใช่ความลับ)
route("GET", "public/config", "public", async () => ({ liffId: process.env.LINE_LIFF_ID || null }));

// รับ ID token จาก LIFF → ให้ LINE ตรวจ → หา users ที่ผูก lineUserId นี้ไว้
// LINE Login channel ต้องอยู่ใน Provider เดียวกับ Messaging API channel ไม่งั้น userId จะไม่ตรงกัน
route("POST", "auth/line", "public", async ({ store, body, setSession }) => {
  const clientId = process.env.LINE_LOGIN_CHANNEL_ID;
  if (!clientId) throw new HttpError(503, "ยังไม่ได้ตั้งค่าการเข้าระบบด้วย LINE");
  const res = await fetch("https://api.line.me/oauth2/v2.1/verify", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ id_token: str(body.idToken, "token", 5000), client_id: clientId }),
  });
  if (!res.ok) throw new HttpError(401, "ยืนยันตัวตนกับ LINE ไม่สำเร็จ");
  const { sub } = (await res.json()) as { sub?: string };
  if (!sub) throw new HttpError(401, "ยืนยันตัวตนกับ LINE ไม่สำเร็จ");

  const [user] = await store.list<AppUser>("users", { lineUserId: sub });
  // เฉพาะผู้ปกครอง — ครู/เจ้าของต้องเข้าด้วยรหัสผ่าน + 2FA เสมอ
  if (!user || !user.active || user.role !== "parent") {
    throw new HttpError(404, "LINE นี้ยังไม่ได้ผูกกับบัญชีผู้ปกครอง กรุณาเข้าด้วยเบอร์โทรก่อน แล้วกด “ผูก LINE”");
  }
  const s = await createSession("parent", user.id);
  setSession(s.token, s.maxAge);
  return { ok: true };
});
