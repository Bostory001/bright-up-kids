import "server-only";
import { meetMessage, meetUrlFrom, minutesOf, onlineSessionsOn, SEND_BEFORE_MINUTES } from "../../online";
import type { AppUser, Course, Enrollment, Notification, Student } from "../../types";
import { notifyParent } from "../notify";
import { route, STAFF } from "../router";
import type { Store } from "../store";
import { bkkDate, HttpError } from "../util";

// ---------- คลาสออนไลน์ (Google Meet) ----------
// ลิงก์ Meet ถาวรต่อคอร์ส แอดมินวางเอง ระบบส่งให้ผู้ปกครองทาง LINE ก่อนคาบ และเตือนแอดมินถ้าคาบวันนี้ยังไม่มีลิงก์
// ข้อมูลเด็กที่ส่งออกมีแค่ชื่อเล่น + ชื่อคอร์ส + เวลา + ลิงก์ (PDPA)

const bkkMinutes = (d = new Date()) => {
  const t = new Date(d.getTime() + 7 * 3_600_000);
  return t.getUTCHours() * 60 + t.getUTCMinutes();
};

// ส่งลิงก์ของคอร์สให้ผู้ปกครองของเด็กที่ลงทะเบียนอยู่ — กันส่งซ้ำด้วย ref (ปุ่มกดมือ force = ส่งซ้ำได้)
async function sendLink(store: Store, course: Course, date: string, force: boolean): Promise<number> {
  if (!course.meetUrl) throw new HttpError(400, "คอร์สนี้ยังไม่มีลิงก์ Meet");
  const ref = `meet:${course.id}:${date}`;
  const [enrollments, students, done] = await Promise.all([
    store.list<Enrollment>("enrollments", { courseId: course.id, status: "active" }),
    store.list<Student>("students", { active: true }),
    force ? Promise.resolve([] as Notification[]) : store.list<Notification>("notifications", { ref }),
  ]);
  const session = { courseId: course.id, name: course.name, startTime: course.startTime, endTime: course.endTime, meetUrl: course.meetUrl };
  let sent = 0;
  const seen = new Set<string>();
  for (const e of enrollments) {
    const s = students.find((x) => x.id === e.studentId);
    if (!s?.parentId || seen.has(s.id) || done.some((n) => n.parentId === s.parentId)) continue;
    seen.add(s.id);
    await notifyParent(store, s.parentId, "online", meetMessage(s.nickname, session), ref);
    sent++;
  }
  return sent;
}

// คาบออนไลน์วันนี้ + สถานะลิงก์ — หน้า "คลาสออนไลน์" ของแอดมิน/ครู
route("GET", "admin/online", STAFF, async ({ store }) => {
  const today = bkkDate();
  const courses = await store.list<Course>("courses", { active: true });
  const sessions = onlineSessionsOn(courses, today);
  return {
    today,
    sessions,
    missing: sessions.filter((s) => !s.meetUrl).length,
    // คอร์สออนไลน์ทั้งหมด ไว้วางลิงก์ล่วงหน้า
    courses: courses
      .filter((c) => c.online)
      .map((c) => ({ id: c.id, name: c.name, weekday: c.weekday, startTime: c.startTime, endTime: c.endTime, meetUrl: c.meetUrl }))
      .sort((a, b) => a.weekday - b.weekday || a.startTime.localeCompare(b.startTime)),
  };
});

// แอดมินวางลิงก์ Meet ให้คอร์ส (แก้เฉพาะ 2 ช่องนี้ ไม่แตะราคา/ตาราง จึงเปิดให้ STAFF)
route("POST", "admin/online/:id/link", STAFF, async ({ store, params, body }) => {
  const course = await store.get<Course>("courses", params.id);
  if (!course) throw new HttpError(404, "ไม่พบคอร์ส");
  let meetUrl: string | undefined;
  try {
    meetUrl = meetUrlFrom(body.meetUrl);
  } catch (err) {
    throw new HttpError(400, (err as Error).message);
  }
  await store.set("courses", { ...course, online: true, meetUrl });
  return { ok: true };
});

route("POST", "admin/online/:id/send", STAFF, async ({ store, params }) => {
  const course = await store.get<Course>("courses", params.id);
  if (!course?.online) throw new HttpError(404, "ไม่พบคอร์สออนไลน์");
  return { sent: await sendLink(store, course, bkkDate(), true) };
});

// Cloud Scheduler เรียกทุก 15-30 นาทีวันธรรมดา — ต้องส่ง Authorization: Bearer CRON_SECRET
//  1) คาบวันนี้ที่เริ่มในอีก ≤30 นาที และมีลิงก์ → ส่งให้ผู้ปกครอง (ครั้งเดียวต่อคาบ)
//  2) คาบวันนี้ที่ยังไม่มีลิงก์ → เตือนเจ้าของ/ครู (วันละครั้งต่อคอร์ส)
route("GET", "cron/online-check", "public", async ({ store, req }) => {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) throw new HttpError(401, "ไม่ได้รับอนุญาต");
  const today = bkkDate();
  const now = bkkMinutes();
  const courses = await store.list<Course>("courses", { active: true });
  const sessions = onlineSessionsOn(courses, today).filter((s) => minutesOf(s.endTime) > now);
  let linksSent = 0;
  let reminded = 0;
  const staff = (await store.list<AppUser>("users")).filter((u) => u.active && (u.role === "owner" || u.role === "teacher"));
  for (const s of sessions) {
    const course = courses.find((c) => c.id === s.courseId)!;
    const untilStart = minutesOf(s.startTime) - now;
    if (s.meetUrl) {
      if (untilStart <= SEND_BEFORE_MINUTES) linksSent += await sendLink(store, course, today, false);
      continue;
    }
    const ref = `meetmissing:${s.courseId}:${today}`;
    if ((await store.list<Notification>("notifications", { ref })).length) continue;
    const text = `⚠️ คลาสออนไลน์ ${s.name} วันนี้ ${s.startTime} ยังไม่มีลิงก์ Google Meet — วางลิงก์ที่หน้า "คลาสออนไลน์"`;
    for (const u of staff.filter((x) => x.role === "owner")) await notifyParent(store, u.id, "online", text, ref);
    reminded++;
  }
  return { linksSent, reminded };
});
