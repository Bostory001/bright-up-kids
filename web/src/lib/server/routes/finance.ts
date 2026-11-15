import "server-only";
import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_KEYS, payrollForMonth, summarizeMonth } from "../../finance";
import { findConflicts } from "../../timetable";
import type { AppUser, Attendance, Course, Enrollment, Expense, Invoice, Receipt } from "../../types";
import { OWNER, route, STAFF } from "../router";
import { getSettings } from "../settings";
import { bkkDate, dateStr, HttpError, newId, nowIso, num, oneOf, optStr, str } from "../util";

// ---------- รายจ่ายของสถาบัน + กำไรขาดทุน ----------
// ค่าใช้จ่ายดำเนินงาน (ค่าเช่า ค่าจ้างครู RF) และของใช้เบ็ดเตล็ด (กระดาษ ทิชชู น้ำดื่ม) อยู่ collection เดียว
// แยกด้วย kind เพื่อไม่ให้รายงานนับซ้ำ · รูปใบเสร็จแยกไว้ที่ collection receipts

function monthParam(v: string | null): string {
  if (!v) return bkkDate().slice(0, 7);
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(v)) throw new HttpError(400, "เดือนไม่ถูกต้อง");
  return v;
}

// รับค่าจากฟอร์ม → Expense ที่ตรวจแล้ว · ของใช้เบ็ดเตล็ดคิดยอดจาก จำนวน × ราคาต่อหน่วย
function readExpense(body: Record<string, unknown>): Omit<Expense, "id" | "createdBy" | "createdAt" | "hasReceipt"> {
  const category = oneOf(body.category, EXPENSE_CATEGORY_KEYS, "หมวดค่าใช้จ่าย");
  const kind = EXPENSE_CATEGORIES[category].kind;
  const qty = kind === "supply" ? num(body.qty, "จำนวน", 0.01, 100_000) : undefined;
  const unitPrice = kind === "supply" ? num(body.unitPrice, "ราคาต่อหน่วย", 0, 1_000_000) : undefined;
  const amount = kind === "supply" ? Math.round(qty! * unitPrice! * 100) / 100 : num(body.amount, "จำนวนเงิน", 0, 10_000_000);
  if (amount <= 0) throw new HttpError(400, "จำนวนเงินต้องมากกว่า 0");
  return {
    date: dateStr(body.date, "วันที่จ่าย"),
    kind,
    category,
    detail: str(body.detail, "รายละเอียด", 120),
    qty,
    unitPrice,
    amount,
    method: oneOf(body.method, ["cash", "transfer"] as const, "ช่องทางชำระเงิน"),
    vendor: optStr(body.vendor, 80),
    recurring: body.recurring === true,
    note: optStr(body.note, 300),
  };
}

route("GET", "admin/expenses", STAFF, async ({ store, query }) => {
  const month = monthParam(query.get("month"));
  const [expenses, invoices, settings] = await Promise.all([
    store.list<Expense>("expenses"),
    store.list<Invoice>("invoices"),
    getSettings(store),
  ]);
  return {
    month,
    royaltyPercent: settings.royaltyPercent,
    summary: summarizeMonth(month, invoices, expenses, settings.royaltyPercent),
    // เดือนที่มีรายการ ให้หน้าจอทำตัวเลือกย้อนหลังได้
    months: [...new Set([month, ...expenses.map((e) => e.date.slice(0, 7))])].sort((a, b) => b.localeCompare(a)),
    expenses: expenses
      .filter((e) => e.date.slice(0, 7) === month)
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)),
  };
});

route("POST", "admin/expenses", STAFF, async ({ store, body, me }) => {
  const expense: Expense = { ...readExpense(body), id: newId(), createdBy: me!.id, createdAt: nowIso() };
  await store.set("expenses", expense);
  return { expense };
});

route("PATCH", "admin/expenses/:id", STAFF, async ({ store, body, params }) => {
  const cur = await store.get<Expense>("expenses", params.id);
  if (!cur) throw new HttpError(404, "ไม่พบรายการ");
  const next: Expense = { ...cur, ...readExpense(body) };
  await store.set("expenses", next);
  return { expense: next };
});

// ลบได้เฉพาะเจ้าของ — ตัวเลขกำไรของเดือนที่ปิดไปแล้วจะเปลี่ยนตาม
route("DELETE", "admin/expenses/:id", OWNER, async ({ store, params }) => {
  await store.remove("expenses", params.id);
  await store.remove("receipts", params.id);
  return { ok: true };
});

// รูปใบเสร็จ — เครื่องที่ถ่ายย่อรูปก่อนส่ง (shrinkImage ในหน้า /admin/expenses)
route("POST", "admin/expenses/:id/receipt", STAFF, async ({ store, body, params, me }) => {
  const expense = await store.get<Expense>("expenses", params.id);
  if (!expense) throw new HttpError(404, "ไม่พบรายการ");
  const dataUrl = str(body.dataUrl, "รูปใบเสร็จ", 700_000);
  if (!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(dataUrl)) throw new HttpError(400, "ไฟล์ต้องเป็นรูปภาพ");
  await store.set("receipts", { id: expense.id, dataUrl, uploadedBy: me!.id, uploadedAt: nowIso() } satisfies Receipt);
  await store.set("expenses", { ...expense, hasReceipt: true });
  return { ok: true };
});

route("GET", "admin/expenses/:id/receipt", STAFF, async ({ store, params }) => {
  const receipt = await store.get<Receipt>("receipts", params.id);
  if (!receipt) throw new HttpError(404, "ไม่พบรูปใบเสร็จ");
  return { dataUrl: receipt.dataUrl, uploadedAt: receipt.uploadedAt };
});

// ---------- ค่าจ้างครูรายเดือน ----------
// ข้อมูลค่าจ้างเป็นเรื่องส่วนตัวของแต่ละคน → เจ้าของเท่านั้น (ครูเห็นของคนอื่นไม่ได้)

// รายชื่อครูสำหรับช่องเลือกครูประจำคอร์ส — ส่งแค่ชื่อกับอัตรา ไม่มีข้อมูลบัญชี
route("GET", "admin/teachers", STAFF, async ({ store, me }) => {
  const users = await store.list<AppUser>("users");
  return {
    teachers: users
      .filter((u) => (u.role === "teacher" || u.role === "owner") && u.active)
      .map((u) => ({ id: u.id, displayName: u.displayName, hourlyRate: me?.role === "owner" ? u.hourlyRate : undefined }))
      .sort((a, b) => a.displayName.localeCompare(b.displayName)),
  };
});

route("GET", "admin/payroll", OWNER, async ({ store, query }) => {
  const month = monthParam(query.get("month"));
  const [attendance, courses, users, expenses] = await Promise.all([
    store.list<Attendance>("attendance"),
    store.list<Course>("courses"),
    store.list<AppUser>("users"),
    store.list<Expense>("expenses"),
  ]);
  const teachers = payrollForMonth(month, attendance, courses, users, expenses);
  return {
    month,
    teachers,
    totalHours: Math.round(teachers.reduce((s, t) => s + t.hours, 0) * 100) / 100,
    totalAmount: teachers.reduce((s, t) => s + (t.paid ? (t.paidAmount ?? 0) : t.amount), 0),
    months: [...new Set([month, ...attendance.map((a) => a.date.slice(0, 7))])].sort((a, b) => b.localeCompare(a)),
  };
});

// บันทึกค่าจ้างของครู 1 คนเป็นรายจ่ายหมวด "ค่าจ้างครู" — กดซ้ำไม่เกิดรายการซ้ำ
route("POST", "admin/payroll", OWNER, async ({ store, body, me }) => {
  const month = monthParam(str(body.month, "เดือน", 7));
  const teacherId = str(body.teacherId, "ครู", 40);
  const payrollRef = `${teacherId}:${month}`;
  const expenses = await store.list<Expense>("expenses");
  if (expenses.some((e) => e.payrollRef === payrollRef)) throw new HttpError(400, "บันทึกค่าจ้างของครูคนนี้ในเดือนนี้ไปแล้ว");

  const [attendance, courses, users] = await Promise.all([
    store.list<Attendance>("attendance"),
    store.list<Course>("courses"),
    store.list<AppUser>("users"),
  ]);
  const pay = payrollForMonth(month, attendance, courses, users, expenses).find((t) => t.teacherId === teacherId);
  if (!pay) throw new HttpError(404, "เดือนนี้ครูคนนี้ไม่มีคาบสอน");
  if (!pay.hourlyRate) throw new HttpError(400, "ยังไม่ได้ตั้งอัตราค่าสอนต่อชั่วโมงของครูคนนี้ (ตั้งที่หน้า “ผู้ใช้”)");
  // แก้ยอดได้ เช่น หักลา/เพิ่มโบนัส แต่ต้องไม่เกิน 2 เท่าของที่คำนวณได้ กันพิมพ์ผิด
  const amount = body.amount === undefined || body.amount === "" ? pay.amount : num(body.amount, "จำนวนเงิน", 1, Math.max(pay.amount * 2, 1000));

  const expense: Expense = {
    id: newId(),
    date: body.date ? dateStr(body.date, "วันที่จ่าย") : bkkDate(),
    kind: "operating",
    category: "teacher",
    detail: `ค่าสอน ${pay.name} เดือน ${month} · ${pay.sessions} คาบ ${pay.hours} ชม. × ฿${pay.hourlyRate}`,
    amount,
    method: body.method === "cash" ? "cash" : "transfer",
    vendor: pay.name,
    payrollRef,
    createdBy: me!.id,
    createdAt: nowIso(),
  };
  await store.set("expenses", expense);
  return { expense };
});

// ---------- ตารางสอนรายสัปดาห์ ----------
// อยู่ไฟล์นี้เพราะใช้ข้อมูลครูชุดเดียวกับค่าจ้าง · ครูดูได้ (ไม่มีเรื่องเงิน)

route("GET", "admin/timetable", STAFF, async ({ store }) => {
  const [courses, enrollments, users] = await Promise.all([
    store.list<Course>("courses"),
    store.list<Enrollment>("enrollments", { status: "active" }),
    store.list<AppUser>("users"),
  ]);
  const nameOf = (id?: string) => users.find((u) => u.id === id)?.displayName ?? "";
  return {
    courses: courses
      .map((c) => ({
        id: c.id,
        name: c.name,
        weekday: c.weekday,
        subject: c.subject,
        grades: c.grades,
        startTime: c.startTime,
        endTime: c.endTime,
        // ครูที่ผูกไว้มาก่อนชื่อที่พิมพ์มือ (ของเก่าก่อนมีการผูกบัญชี)
        teacherName: nameOf(c.teacherId) || c.teacherName || "",
        room: c.room,
        enrolled: enrollments.filter((e) => e.courseId === c.id).length,
        capacity: c.capacity,
        active: c.active,
      }))
      .sort((a, b) => a.weekday - b.weekday || a.startTime.localeCompare(b.startTime)),
    conflicts: findConflicts(courses, (id) => nameOf(id) || "ครูที่ยังไม่ระบุชื่อ"),
    // คอร์สที่เปิดอยู่แต่ยังไม่ได้ผูกครู → ชั่วโมงสอนจะไปเข้าคนที่เช็กชื่อแทน
    withoutTeacher: courses.filter((c) => c.active && !c.teacherId).map((c) => c.name),
  };
});
