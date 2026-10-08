import "server-only";
import { MONTHLY_REWARD_BUDGET_BAHT } from "../../gamification";
import type { AppUser, Application, Attendance, Course, Enrollment, Grade, Invoice, Redemption, Slip, Student } from "../../types";
import { hashSecret, publicStudent } from "../auth";
import { notifyParent } from "../notify";
import { type Ctx, OWNER, route, STAFF, staffUser } from "../router";
import type { Store } from "../store";
import { bkkDate, dateStr, HttpError, newId, nowIso, num, oneOf, optStr, randomDigits, str } from "../util";

const GRADES = [1, 2, 3, 4, 5, 6] as const;
const SUBJECTS = ["math", "thai", "english", "science"] as const;
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
  return {
    id,
    name: str(body.name, "ชื่อคอร์ส", 100),
    subject: oneOf(body.subject, SUBJECTS, "วิชา"),
    grades,
    pricePerTerm: num(body.pricePerTerm, "ค่าเรียน", 0, 1_000_000),
    weekday: num(body.weekday, "วันเรียน", 0, 6),
    startTime: str(body.startTime, "เวลาเริ่ม", 5),
    endTime: str(body.endTime, "เวลาเลิก", 5),
    teacherName: optStr(body.teacherName, 80),
    capacity: num(body.capacity, "จำนวนที่รับ", 1, 500),
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
  if (!courseIds.length) throw new HttpError(400, "เลือกคอร์สอย่างน้อย 1 คอร์ส");
  for (const id of courseIds) if (!(await store.get("courses", id))) throw new HttpError(400, "คอร์สไม่ถูกต้อง");

  const application: Application = {
    id: newId(),
    parentName: str(body.parentName, "ชื่อผู้ปกครอง", 80),
    phone,
    studentFullName: str(body.studentFullName, "ชื่อ-นามสกุลนักเรียน", 100),
    nickname: str(body.nickname, "ชื่อเล่น", 30),
    grade: oneOf(Number(body.grade), GRADES, "ชั้น") as Grade,
    school: optStr(body.school, 100),
    courseIds,
    pdpaConsentAt: nowIso(),
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
  const [students, applications, invoices, redemptions] = await Promise.all([
    store.list<Student>("students", { active: true }),
    store.list<Application>("applications", { status: "pending" }),
    store.list<Invoice>("invoices"),
    store.list<Redemption>("redemptions"),
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
    rewardBudget: MONTHLY_REWARD_BUDGET_BAHT,
  };
});
