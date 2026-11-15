import "server-only";
import { budgetStatus, summarizeMonth } from "../../finance";
import { GRADES, SUBJECT_KEYS } from "../../grade";
import { WEEKDAY_TH, weekdayOf } from "../../schedule";
import { getSettings } from "../settings";
import type { AppUser, AuthSession, Application, Attendance, Budget, Course, Enrollment, Expense, Grade, Invoice, Redemption, Slip, Student } from "../../types";
import { hashSecret, publicStudent } from "../auth";
import { notifyParent } from "../notify";
import { type Ctx, OWNER, route, STAFF, staffUser } from "../router";
import type { Store } from "../store";
import { bkkDate, dateStr, HttpError, newId, nowIso, num, oneOf, optStr, randomDigits, str } from "../util";

// ชั้นที่รับ: ป.1-6 และ ม.1-3 (ดู lib/grade.ts)
const PROGRAMS = ["thai", "ep", "inter"] as const;
// รายชื่อวิชาอยู่ที่ lib/grade.ts ที่เดียว (SUBJECT_KEYS)
const WEEKDAYS = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
const STATUS_TH: Record<Attendance["status"], string> = { present: "มาเรียน", late: "มาสาย", absent: "ขาดเรียน", leave: "ลา" };

function defaultTerm(): string {
  const [y, m] = bkkDate().split("-").map(Number);
  return `${y}-T${m >= 5 && m <= 10 ? 1 : 2}`;
}

async function nextStudentCode(store: Store): Promise<string> {
  const counters = await store.update<{ id: string; student: number }>("meta", "counters", (cur) => ({
    id: "counters",
    student: (cur?.student ?? 0) + 1,
  }));
  return `BUK${String(counters!.student).padStart(4, "0")}`;
}

async function createStudent(store: Store, data: Pick<Student, "nickname" | "fullName" | "grade" | "school" | "parentId" | "pdpaConsentAt">) {
  if (data.parentId) {
    const parent = await store.get<AppUser>("users", data.parentId);
    if (!parent || parent.role !== "parent" || !parent.active) throw new HttpError(400, "ไม่พบบัญชีผู้ปกครองที่ใช้งานได้");
  }
  const pin = randomDigits(4);
  const student: Student = {
    id: newId(),
    code: await nextStudentCode(store),
    pinHash: hashSecret(pin),
    ...data,
    active: true,
    createdAt: nowIso(),
  };
  await store.set("students", student);
  return { student, pin };
}

// ---------- คอร์ส ----------

function courseFrom(body: Ctx["body"], id: string): Course {
  const grades = Array.isArray(body.grades) ? body.grades.map((g: unknown) => oneOf(Number(g), GRADES, "ชั้น")) : [];
  if (!grades.length) throw new HttpError(400, "เลือกชั้นอย่างน้อย 1 ชั้น");
  const startTime = str(body.startTime, "เวลาเริ่ม", 5);
  const endTime = str(body.endTime, "เวลาเลิก", 5);
  const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
  if (!timePattern.test(startTime) || !timePattern.test(endTime) || endTime <= startTime) {
    throw new HttpError(400, "เวลาเรียนไม่ถูกต้อง เวลาเลิกต้องอยู่หลังเวลาเริ่ม");
  }
  const weekday = num(body.weekday, "วันเรียน", 0, 6);
  const capacity = num(body.capacity, "จำนวนที่รับ", 1, 500);
  if (!Number.isInteger(weekday) || !Number.isInteger(capacity)) throw new HttpError(400, "วันเรียนและจำนวนที่รับต้องเป็นจำนวนเต็ม");
  // วันเริ่มคอร์สต้องตรงกับวันเรียนประจำสัปดาห์ ไม่งั้นปฏิทินจะเพี้ยนทั้งคอร์ส
  const startDate = body.startDate ? dateStr(body.startDate, "วันเริ่มคอร์ส") : undefined;
  if (startDate && weekdayOf(startDate) !== weekday) {
    throw new HttpError(400, `วันเริ่มคอร์สต้องเป็นวัน${WEEKDAY_TH[weekday]} ให้ตรงกับวันเรียน`);
  }
  const weeks = body.weeks === undefined || body.weeks === "" ? undefined : num(body.weeks, "จำนวนสัปดาห์", 1, 52);
  if (weeks !== undefined && !Number.isInteger(weeks)) throw new HttpError(400, "จำนวนสัปดาห์ต้องเป็นจำนวนเต็ม");
  return {
    id,
    name: str(body.name, "ชื่อคอร์ส", 100),
    startDate,
    weeks,
    subject: oneOf(body.subject, SUBJECT_KEYS, "วิชา"),
    grades,
    pricePerTerm: num(body.pricePerTerm, "ค่าเรียน", 0, 1_000_000),
    weekday,
    startTime,
    endTime,
    teacherId: optStr(body.teacherId, 40),
    teacherName: optStr(body.teacherName, 80),
    room: optStr(body.room, 40),
    capacity,
    active: body.active !== false,
  };
}

route("GET", "admin/courses", STAFF, async ({ store }) => ({ courses: await store.list<Course>("courses") }));
route("POST", "admin/courses", OWNER, async ({ store, body }) => {
  const course = courseFrom(body, newId());
  await store.set("courses", course);
  return { course };
});
route("PATCH", "admin/courses/:id", OWNER, async ({ store, body, params }) => {
  if (!(await store.get("courses", params.id))) throw new HttpError(404, "ไม่พบคอร์ส");
  const course = courseFrom(body, params.id);
  await store.set("courses", course);
  return { course };
});

// ---------- สมัครเรียน (ฟอร์มสาธารณะ) ----------

route("GET", "public/courses", "public", async ({ store }) => {
  const courses = await store.list<Course>("courses", { active: true });
  return {
    courses: courses.map((c) => ({
      id: c.id,
      name: c.name,
      grades: c.grades,
      pricePerTerm: c.pricePerTerm,
      schedule: `วัน${WEEKDAYS[c.weekday]} ${c.startTime}-${c.endTime}`,
    })),
  };
});

// กันสแปมแบบง่าย: จำกัดจำนวนใบสมัครต่อ IP ต่อชั่วโมง (อยู่ในหน่วยความจำของ instance)
const enrollHits = new Map<string, number[]>();

route("POST", "public/enroll", "public", async ({ store, body, req }) => {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  const recent = (enrollHits.get(ip) ?? []).filter((t) => t > Date.now() - 3600_000);
  if (recent.length >= 5) throw new HttpError(429, "ส่งใบสมัครบ่อยเกินไป กรุณาลองใหม่ภายหลัง");
  enrollHits.set(ip, [...recent, Date.now()]);

  if (body.pdpaConsent !== true) throw new HttpError(400, "ต้องยินยอมการเก็บข้อมูลก่อนสมัคร");
  const phone = str(body.phone, "เบอร์โทร", 20).replace(/\D/g, "");
  if (phone.length < 9 || phone.length > 10) throw new HttpError(400, "เบอร์โทรไม่ถูกต้อง");
  const courseIds: string[] = Array.isArray(body.courseIds) ? body.courseIds.filter((c: unknown) => typeof c === "string").slice(0, 10) : [];
  for (const id of courseIds) if (!(await store.get("courses", id))) throw new HttpError(400, "คอร์สไม่ถูกต้อง");
  // ชั้นที่สนใจ เลือกได้มากกว่า 1 (ครอบครัวมีลูกหลายคน หรือยังไม่แน่ใจว่าจะลงชั้นไหน)
  const rawGrades: unknown[] = Array.isArray(body.grades) && body.grades.length ? body.grades : [body.grade];
  const checked = rawGrades.map((g) => oneOf(Number(g), GRADES, "ชั้น") as Grade);
  const grades: Grade[] = [...new Set<Grade>(checked)].slice(0, 9);
  // วิชาที่สนใจ: คีย์วิชาในระบบ หรือ "other" แล้วพิมพ์เอง
  const subjects = (Array.isArray(body.subjects) ? body.subjects : [])
    .filter((x: unknown) => typeof x === "string")
    .map((x: string) => oneOf(x, [...SUBJECT_KEYS, "other"], "วิชาที่สนใจ"))
    .slice(0, 10);
  const subjectOther = optStr(body.subjectOther, 100);
  if (subjects.includes("other") && !subjectOther) throw new HttpError(400, "เลือก “อื่น ๆ” แล้วต้องระบุวิชาด้วย");
  if (!courseIds.length && !subjects.length) throw new HttpError(400, "เลือกวิชาที่สนใจหรือคอร์สอย่างน้อย 1 อย่าง");

  const application: Application = {
    id: newId(),
    parentName: str(body.parentName, "ชื่อผู้ปกครอง", 80),
    phone,
    studentFullName: str(body.studentFullName, "ชื่อ-นามสกุลนักเรียน", 100),
    nickname: str(body.nickname, "ชื่อเล่น", 30),
    grade: grades[0],
    grades,
    subjects,
    subjectOther,
    school: optStr(body.school, 100),
    englishName: optStr(body.englishName, 100),
    birthDate: body.birthDate ? dateStr(body.birthDate, "วันเกิด") : undefined,
    email: optStr(body.email, 120),
    lineId: optStr(body.lineId, 60),
    facebook: optStr(body.facebook, 120),
    program: body.program ? oneOf(body.program, PROGRAMS, "หลักสูตรที่โรงเรียน") : undefined,
    targetSchool: optStr(body.targetSchool, 150),
    addressLine: optStr(body.addressLine, 200),
    subdistrict: optStr(body.subdistrict, 80),
    district: optStr(body.district, 80),
    province: optStr(body.province, 80),
    postcode: optStr(body.postcode, 10),
    altPhone: optStr(body.altPhone, 20),
    source: optStr(body.source, 80),
    note: optStr(body.note, 500),
    courseIds,
    pdpaConsentAt: nowIso(),
    // ยินยอมเรื่องภาพแยกต่างหาก ไม่ยินยอมก็สมัครได้ (PDPA: ห้ามมัดรวมกับการยินยอมหลัก)
    photoConsentAt: body.photoConsent === true ? nowIso() : undefined,
    status: "pending",
    createdAt: nowIso(),
  };
  await store.set("applications", application);
  return { ok: true };
});

route("GET", "admin/applications", STAFF, async ({ store }) => {
  const applications = await store.list<Application>("applications");
  return { applications: applications.sort((a, b) => b.createdAt.localeCompare(a.createdAt)), defaultTerm: defaultTerm() };
});

// อนุมัติ: สร้างบัญชีผู้ปกครอง (ถ้ายังไม่มี) + นักเรียน + ลงทะเบียน + ใบแจ้งค่าเรียน
route("POST", "admin/applications/:id/approve", STAFF, async ({ store, params, body }) => {
  const app = await store.get<Application>("applications", params.id);
  if (!app || app.status !== "pending") throw new HttpError(400, "ใบสมัครนี้ดำเนินการไปแล้ว");
  const term = optStr(body.term, 20) ?? defaultTerm();

  let [parent] = await store.list<AppUser>("users", { username: app.phone });
  let tempPassword: string | undefined;
  if (!parent) {
    tempPassword = `buk-${randomDigits(6)}`;
    parent = {
      id: newId(),
      role: "parent",
      username: app.phone,
      displayName: app.parentName,
      phone: app.phone,
      passwordHash: hashSecret(tempPassword),
      mustChangePassword: true,
      active: true,
      createdAt: nowIso(),
    };
    await store.set("users", parent);
  }
  if (parent.role !== "parent") throw new HttpError(400, "เบอร์โทรนี้ถูกใช้เป็นบัญชีครู/เจ้าของ");

  const { student, pin } = await createStudent(store, {
    nickname: app.nickname,
    fullName: app.studentFullName,
    grade: app.grade,
    school: app.school,
    parentId: parent.id,
    pdpaConsentAt: app.pdpaConsentAt,
  });

  let total = 0;
  const names: string[] = [];
  for (const courseId of app.courseIds) {
    const course = await store.get<Course>("courses", courseId);
    if (!course) continue;
    const enrollment: Enrollment = { id: newId(), studentId: student.id, courseId, term, status: "active", createdAt: nowIso() };
    await store.set("enrollments", enrollment);
    total += course.pricePerTerm;
    names.push(course.name);
  }
  if (total > 0) {
    const due = bkkDate(new Date(Date.now() + 7 * 86_400_000));
    const invoice: Invoice = {
      id: newId(),
      studentId: student.id,
      description: `ค่าเรียนเทอม ${term}: ${names.join(", ")}`,
      amount: total,
      dueDate: due,
      status: "unpaid",
      createdAt: nowIso(),
    };
    await store.set("invoices", invoice);
    await notifyParent(store, parent.id, "invoice", `ใบแจ้งค่าเรียนน้อง${student.nickname} ${total.toLocaleString()} บาท ครบกำหนด ${due}`);
  }
  await store.set("applications", { ...app, status: "approved" });
  // รหัสผ่านชั่วคราวและ PIN แสดงครั้งเดียว ให้ครูจดส่งผู้ปกครอง
  return { studentCode: student.code, pin, parentUsername: parent.username, tempPassword };
});

route("POST", "admin/applications/:id/reject", STAFF, async ({ store, params }) => {
  const app = await store.get<Application>("applications", params.id);
  if (!app || app.status !== "pending") throw new HttpError(400, "ใบสมัครนี้ดำเนินการไปแล้ว");
  await store.set("applications", { ...app, status: "rejected" });
  return { ok: true };
});

// ---------- นักเรียน ----------

route("GET", "admin/students", STAFF, async ({ store }) => {
  const [students, enrollments, parents] = await Promise.all([
    store.list<Student>("students"),
    store.list<Enrollment>("enrollments", { status: "active" }),
    store.list<AppUser>("users", { role: "parent" }),
  ]);
  return {
    students: students
      .sort((a, b) => a.code.localeCompare(b.code))
      .map((s) => ({
        ...publicStudent(s),
        courseIds: enrollments.filter((e) => e.studentId === s.id).map((e) => e.courseId),
        parentName: parents.find((p) => p.id === s.parentId)?.displayName,
        parentPhone: parents.find((p) => p.id === s.parentId)?.phone,
      })),
  };
});

// เพิ่มนักเรียนเอง (กรณีสมัครหน้าร้าน ผู้ปกครองเซ็นยินยอมบนกระดาษ)
route("POST", "admin/students", STAFF, async ({ store, body }) => {
  if (body.pdpaConsent !== true) throw new HttpError(400, "ต้องยืนยันว่าผู้ปกครองยินยอมการเก็บข้อมูลแล้ว");
  const { student, pin } = await createStudent(store, {
    nickname: str(body.nickname, "ชื่อเล่น", 30),
    fullName: str(body.fullName, "ชื่อ-นามสกุล", 100),
    grade: oneOf(Number(body.grade), GRADES, "ชั้น") as Grade,
    school: optStr(body.school, 100),
    parentId: optStr(body.parentId, 40),
    pdpaConsentAt: nowIso(),
  });
  return { student: publicStudent(student), pin };
});

route("PATCH", "admin/students/:id", STAFF, async ({ store, body, params }) => {
  const student = await store.get<Student>("students", params.id);
  if (!student) throw new HttpError(404, "ไม่พบนักเรียน");
  const next: Student = {
    ...student,
    nickname: str(body.nickname, "ชื่อเล่น", 30),
    fullName: str(body.fullName, "ชื่อ-นามสกุล", 100),
    grade: oneOf(Number(body.grade), GRADES, "ชั้น") as Grade,
    school: optStr(body.school, 100),
    active: body.active !== false,
  };
  await store.set("students", next);
  return { student: publicStudent(next) };
});

route("POST", "admin/students/:id/pin", STAFF, async ({ store, params }) => {
  const student = await store.get<Student>("students", params.id);
  if (!student) throw new HttpError(404, "ไม่พบนักเรียน");
  const pin = randomDigits(4);
  await store.set("students", { ...student, pinHash: hashSecret(pin), failedLogins: 0, lockedUntil: undefined });
  for (const session of await store.list<AuthSession>("auth_sessions", { subjectId: student.id, role: "student" })) {
    await store.remove("auth_sessions", session.id);
  }
  return { pin };
});

// ลง/ถอนคอร์สของนักเรียน
route("POST", "admin/students/:id/courses", STAFF, async ({ store, params, body }) => {
  const student = await store.get<Student>("students", params.id);
  if (!student) throw new HttpError(404, "ไม่พบนักเรียน");
  const wanted: string[] = Array.isArray(body.courseIds) ? body.courseIds : [];
  const current = await store.list<Enrollment>("enrollments", { studentId: student.id });
  for (const e of current) {
    if (e.status === "active" && !wanted.includes(e.courseId)) await store.set("enrollments", { ...e, status: "cancelled" });
  }
  for (const courseId of wanted) {
    if (current.some((e) => e.courseId === courseId && e.status === "active")) continue;
    if (!(await store.get("courses", courseId))) continue;
    await store.set("enrollments", { id: newId(), studentId: student.id, courseId, term: defaultTerm(), status: "active", createdAt: nowIso() } satisfies Enrollment);
  }
  return { ok: true };
});

// ---------- เช็กชื่อ ----------

route("GET", "admin/attendance", STAFF, async ({ store, query }) => {
  const courseId = str(query.get("courseId"), "คอร์ส", 40);
  const date = dateStr(query.get("date"), "วันที่");
  const [enrollments, students, marks] = await Promise.all([
    store.list<Enrollment>("enrollments", { courseId, status: "active" }),
    store.list<Student>("students"),
    store.list<Attendance>("attendance", { courseId, date }),
  ]);
  return {
    rows: enrollments
      .map((e) => students.find((s) => s.id === e.studentId))
      .filter((s): s is Student => Boolean(s?.active))
      .map((s) => ({ studentId: s.id, code: s.code, nickname: s.nickname, status: marks.find((m) => m.studentId === s.id)?.status ?? null })),
  };
});

route("POST", "admin/attendance", STAFF, async (ctx) => {
  const { store, body } = ctx;
  const courseId = str(body.courseId, "คอร์ส", 40);
  const date = dateStr(body.date, "วันที่");
  const course = await store.get<Course>("courses", courseId);
  if (!course) throw new HttpError(404, "ไม่พบคอร์ส");
  const marks: { studentId: string; status: Attendance["status"] }[] = Array.isArray(body.marks) ? body.marks : [];
  let notified = 0;
  for (const m of marks.slice(0, 500)) {
    const status = oneOf(m.status, ["present", "late", "absent", "leave"] as const, "สถานะ");
    const student = await store.get<Student>("students", str(m.studentId, "นักเรียน", 40));
    if (!student) continue;
    const id = `${courseId}_${date}_${student.id}`;
    const prev = await store.get<Attendance>("attendance", id);
    if (prev?.status === status) continue;
    await store.set("attendance", { id, courseId, date, studentId: student.id, status, checkedBy: staffUser(ctx).id, checkedAt: nowIso() } satisfies Attendance);
    await notifyParent(store, student.parentId, "attendance", `น้อง${student.nickname} ${STATUS_TH[status]} คอร์ส ${course.name} วันที่ ${date}`);
    notified++;
  }
  return { ok: true, changed: notified };
});

// ---------- ค่าเรียน ----------

route("GET", "admin/invoices", STAFF, async ({ store }) => {
  const [invoices, students] = await Promise.all([store.list<Invoice>("invoices"), store.list<Student>("students")]);
  return {
    invoices: invoices
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((i) => {
        const s = students.find((st) => st.id === i.studentId);
        return { ...i, studentCode: s?.code, studentNickname: s?.nickname };
      }),
  };
});

route("POST", "admin/invoices", STAFF, async ({ store, body }) => {
  const student = await store.get<Student>("students", str(body.studentId, "นักเรียน", 40));
  if (!student) throw new HttpError(404, "ไม่พบนักเรียน");
  const invoice: Invoice = {
    id: newId(),
    studentId: student.id,
    description: str(body.description, "รายการ", 200),
    amount: num(body.amount, "จำนวนเงิน", 1, 1_000_000),
    dueDate: dateStr(body.dueDate, "วันครบกำหนด"),
    status: "unpaid",
    createdAt: nowIso(),
  };
  await store.set("invoices", invoice);
  await notifyParent(store, student.parentId, "invoice", `ใบแจ้งค่าเรียนน้อง${student.nickname}: ${invoice.description} ${invoice.amount.toLocaleString()} บาท ครบกำหนด ${invoice.dueDate}`);
  return { invoice };
});

route("POST", "admin/invoices/:id/pay", STAFF, async ({ store, params }) => {
  const invoice = await store.get<Invoice>("invoices", params.id);
  if (!invoice || invoice.status === "paid" || invoice.status === "void") throw new HttpError(400, "ใบแจ้งนี้ยืนยันไม่ได้");
  await store.set("invoices", { ...invoice, status: "paid", paidDate: bkkDate() });
  const student = await store.get<Student>("students", invoice.studentId);
  await notifyParent(store, student?.parentId, "payment", `ได้รับค่าเรียน ${invoice.amount.toLocaleString()} บาท (${invoice.description}) เรียบร้อยแล้ว ขอบคุณค่ะ`);
  return { ok: true };
});

route("POST", "admin/invoices/:id/void", OWNER, async ({ store, params }) => {
  const invoice = await store.get<Invoice>("invoices", params.id);
  if (!invoice) throw new HttpError(404, "ไม่พบใบแจ้ง");
  await store.set("invoices", { ...invoice, status: "void", paidDate: undefined });
  return { ok: true };
});

// เตือนใบแจ้งที่ยังไม่จ่ายและครบกำหนดภายใน 3 วัน (หรือเลยกำหนดแล้ว)
route("POST", "admin/invoices/remind", STAFF, async ({ store }) => {
  const soon = bkkDate(new Date(Date.now() + 3 * 86_400_000));
  const unpaid = (await store.list<Invoice>("invoices", { status: "unpaid" })).filter((i) => i.dueDate <= soon);
  for (const i of unpaid) {
    const student = await store.get<Student>("students", i.studentId);
    await notifyParent(store, student?.parentId, "invoice", `แจ้งเตือนค่าเรียนน้อง${student?.nickname ?? ""} ${i.amount.toLocaleString()} บาท ครบกำหนด ${i.dueDate}`);
  }
  return { reminded: unpaid.length };
});

// ดูสลิป: ครู/เจ้าของ หรือผู้ปกครองของนักเรียนคนนั้น
route("GET", "slips/:invoiceId", ["owner", "teacher", "parent"], async ({ store, params, me }) => {
  const invoice = await store.get<Invoice>("invoices", params.invoiceId);
  const slip = await store.get<Slip>("slips", params.invoiceId);
  if (!invoice || !slip) throw new HttpError(404, "ไม่พบสลิป");
  if (me?.role === "parent") {
    const student = await store.get<Student>("students", invoice.studentId);
    if (student?.parentId !== me.id) throw new HttpError(403, "ไม่มีสิทธิ์");
  }
  return { dataUrl: slip.dataUrl, uploadedAt: slip.uploadedAt };
});

// ---------- แดชบอร์ด ----------

route("GET", "admin/dashboard", STAFF, async ({ store }) => {
  const month = bkkDate().slice(0, 7);
  const [students, applications, invoices, redemptions, expenses, settings] = await Promise.all([
    store.list<Student>("students", { active: true }),
    store.list<Application>("applications", { status: "pending" }),
    store.list<Invoice>("invoices"),
    store.list<Redemption>("redemptions"),
    store.list<Expense>("expenses"),
    getSettings(store),
  ]);
  const open = invoices.filter((i) => i.status === "unpaid" || i.status === "slip_uploaded");
  return {
    students: students.length,
    pendingApplications: applications.length,
    unpaidCount: open.length,
    unpaidAmount: open.reduce((s, i) => s + i.amount, 0),
    slipsToCheck: invoices.filter((i) => i.status === "slip_uploaded").length,
    pendingRedemptions: redemptions.filter((r) => r.status === "requested").length,
    rewardSpent: redemptions.filter((r) => r.status === "handed_over" && r.handledDate?.startsWith(month)).reduce((s, r) => s + r.costBaht, 0),
    rewardBudget: settings.rewardBudgetBaht,
    // การเงินเดือนนี้ — เจ้าของเปิดหน้าเดียวเห็นกำไร
    finance: summarizeMonth(month, invoices, expenses, settings.royaltyPercent),
    budget: budgetStatus(
      summarizeMonth(month, invoices, expenses, settings.royaltyPercent),
      (await store.get<Budget>("budgets", month))?.amounts ?? (await store.get<Budget>("budgets", "default"))?.amounts ?? {},
      settings.profitTargetBaht,
    ),
  };
});
