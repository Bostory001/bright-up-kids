import "server-only";
import { EXPENSE_CATEGORIES, EXPENSE_KINDS, summarizeRange } from "../../finance";
import { getSettings } from "../settings";
import type { AppUser, Attempt, Attendance, Course, Enrollment, Exercise, Expense, Invoice, Redemption, Student } from "../../types";
import { route, STAFF } from "../router";
import type { Store } from "../store";
import { bkkDate, dateStr, HttpError } from "../util";

// รายงาน: server คืนคอลัมน์ + แถวตามช่วงวันที่ → หน้าจอให้เลือกคอลัมน์/กรอง แล้ว export เอง
type Row = Record<string, string | number>;
interface Report {
  columns: { key: string; label: string }[];
  rows: Row[];
}
interface Dataset {
  label: string;
  ownerOnly?: boolean;
  usesDates: boolean;
  build(store: Store, from: string, to: string): Promise<Report>;
}

const col = (key: string, label: string) => ({ key, label });
const ATT_TH = { present: "มาเรียน", late: "มาสาย", absent: "ขาดเรียน", leave: "ลา" };
const INV_TH = { unpaid: "ยังไม่จ่าย", slip_uploaded: "รอตรวจสลิป", paid: "จ่ายแล้ว", void: "ยกเลิก" };
const RED_TH = { requested: "รอส่งมอบ", handed_over: "ส่งมอบแล้ว", rejected: "ปฏิเสธ" };
const SUBJ_TH = { math: "คณิต", thai: "ไทย", english: "อังกฤษ", science: "วิทย์" };

export const DATASETS: Record<string, Dataset> = {
  students: {
    label: "ทะเบียนนักเรียน",
    usesDates: false,
    async build(store) {
      const [students, enrollments, courses, parents] = await Promise.all([
        store.list<Student>("students"),
        store.list<Enrollment>("enrollments", { status: "active" }),
        store.list<Course>("courses"),
        store.list<AppUser>("users", { role: "parent" }),
      ]);
      return {
        columns: [col("code", "รหัส"), col("nickname", "ชื่อเล่น"), col("fullName", "ชื่อ-นามสกุล"), col("grade", "ชั้น"), col("school", "โรงเรียน"), col("parent", "ผู้ปกครอง"), col("phone", "เบอร์โทร"), col("courses", "คอร์ส"), col("active", "สถานะ")],
        rows: students
          .sort((a, b) => a.code.localeCompare(b.code))
          .map((s) => {
            const parent = parents.find((p) => p.id === s.parentId);
            return {
              code: s.code,
              nickname: s.nickname,
              fullName: s.fullName,
              grade: `ป.${s.grade}`,
              school: s.school ?? "",
              parent: parent?.displayName ?? "",
              phone: parent?.phone ?? "",
              courses: enrollments.filter((e) => e.studentId === s.id).map((e) => courses.find((c) => c.id === e.courseId)?.name).filter(Boolean).join(", "),
              active: s.active ? "เรียนอยู่" : "พัก/ออก",
            };
          }),
      };
    },
  },
  attendance: {
    label: "การเข้าเรียน",
    usesDates: true,
    async build(store, from, to) {
      const [marks, students, courses] = await Promise.all([store.list<Attendance>("attendance"), store.list<Student>("students"), store.list<Course>("courses")]);
      return {
        columns: [col("date", "วันที่"), col("course", "คอร์ส"), col("code", "รหัส"), col("nickname", "ชื่อเล่น"), col("status", "สถานะ")],
        rows: marks
          .filter((m) => m.date >= from && m.date <= to)
          .sort((a, b) => a.date.localeCompare(b.date))
          .map((m) => {
            const s = students.find((st) => st.id === m.studentId);
            return { date: m.date, course: courses.find((c) => c.id === m.courseId)?.name ?? "", code: s?.code ?? "", nickname: s?.nickname ?? "", status: ATT_TH[m.status] };
          }),
      };
    },
  },
  invoices: {
    label: "ค่าเรียน",
    usesDates: true,
    async build(store, from, to) {
      const [invoices, students] = await Promise.all([store.list<Invoice>("invoices"), store.list<Student>("students")]);
      return {
        columns: [col("created", "วันที่ออก"), col("code", "รหัส"), col("nickname", "ชื่อเล่น"), col("description", "รายการ"), col("amount", "จำนวนเงิน"), col("dueDate", "ครบกำหนด"), col("status", "สถานะ"), col("paidDate", "วันที่รับเงิน")],
        rows: invoices
          .map((i) => ({ i, created: bkkDate(new Date(i.createdAt)) }))
          .filter(({ created }) => created >= from && created <= to)
          .sort((a, b) => a.created.localeCompare(b.created))
          .map(({ i, created }) => {
            const s = students.find((st) => st.id === i.studentId);
            return { created, code: s?.code ?? "", nickname: s?.nickname ?? "", description: i.description, amount: i.amount, dueDate: i.dueDate, status: INV_TH[i.status], paidDate: i.paidDate ?? "" };
          }),
      };
    },
  },
  attempts: {
    label: "ผลแบบฝึกหัด",
    usesDates: true,
    async build(store, from, to) {
      const [attempts, students, exercises] = await Promise.all([store.list<Attempt>("attempts", { status: "finished" }), store.list<Student>("students"), store.list<Exercise>("exercises")]);
      return {
        columns: [col("date", "วันที่"), col("code", "รหัส"), col("nickname", "ชื่อเล่น"), col("exercise", "ชุด"), col("subject", "วิชา"), col("topic", "หัวข้อ"), col("correct", "ถูก"), col("total", "เต็ม"), col("percent", "%"), col("minutes", "นาที"), col("counted", "นับคะแนน")],
        rows: attempts
          .filter((a) => a.date >= from && a.date <= to)
          .sort((a, b) => a.date.localeCompare(b.date))
          .map((a) => {
            const s = students.find((st) => st.id === a.studentId);
            const e = exercises.find((ex) => ex.id === a.exerciseId);
            return {
              date: a.date,
              code: s?.code ?? "",
              nickname: s?.nickname ?? "",
              exercise: e?.title ?? "(ลบแล้ว)",
              subject: e ? SUBJ_TH[e.subject] : "",
              topic: e?.topic ?? "",
              correct: a.correct,
              total: a.total,
              percent: a.total ? Math.round((a.correct / a.total) * 100) : 0,
              minutes: Math.round(a.durationSec / 6) / 10,
              counted: a.counted ? "นับ" : "เกินลิมิต",
            };
          }),
      };
    },
  },
  rewards: {
    label: "การแลกของรางวัล",
    usesDates: true,
    async build(store, from, to) {
      const [redemptions, students] = await Promise.all([store.list<Redemption>("redemptions"), store.list<Student>("students")]);
      return {
        columns: [col("date", "วันที่ขอ"), col("code", "รหัส"), col("nickname", "ชื่อเล่น"), col("reward", "ของรางวัล"), col("coins", "เหรียญ"), col("baht", "ต้นทุน (บาท)"), col("status", "สถานะ"), col("handled", "วันที่ดำเนินการ")],
        rows: redemptions
          .map((r) => ({ r, date: bkkDate(new Date(r.requestedAt)) }))
          .filter(({ date }) => date >= from && date <= to)
          .sort((a, b) => a.date.localeCompare(b.date))
          .map(({ r, date }) => {
            const s = students.find((st) => st.id === r.studentId);
            return { date, code: s?.code ?? "", nickname: s?.nickname ?? "", reward: r.rewardName, coins: r.costCoins, baht: r.costBaht, status: RED_TH[r.status], handled: r.handledDate ?? "" };
          }),
      };
    },
  },
  royalty: {
    label: "ยอดรับรายเดือน + royalty",
    ownerOnly: true,
    usesDates: true,
    async build(store, from, to) {
      const paid = (await store.list<Invoice>("invoices", { status: "paid" })).filter((i) => i.paidDate && i.paidDate >= from && i.paidDate <= to);
      const byMonth = new Map<string, { count: number; amount: number }>();
      for (const i of paid) {
        const month = i.paidDate!.slice(0, 7);
        const m = byMonth.get(month) ?? { count: 0, amount: 0 };
        byMonth.set(month, { count: m.count + 1, amount: m.amount + i.amount });
      }
      const { royaltyPercent } = await getSettings(store);
      return {
        columns: [col("month", "เดือน"), col("count", "จำนวนใบ"), col("amount", "ยอดรับ"), col("royalty", `royalty ${royaltyPercent}%`), col("net", "คงเหลือ")],
        rows: [...byMonth.entries()]
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([month, m]) => {
            const royalty = Math.round(m.amount * royaltyPercent) / 100;
            return { month, count: m.count, amount: m.amount, royalty, net: m.amount - royalty };
          }),
      };
    },
  },
  expenses: {
    label: "รายจ่ายของสถาบัน",
    ownerOnly: true,
    usesDates: true,
    async build(store, from, to) {
      const expenses = (await store.list<Expense>("expenses")).filter((e) => e.date >= from && e.date <= to);
      const users = await store.list<AppUser>("users");
      return {
        columns: [
          col("date", "วันที่"),
          col("kind", "กลุ่ม"),
          col("category", "หมวด"),
          col("detail", "รายละเอียด"),
          col("qty", "จำนวน"),
          col("unitPrice", "ราคา/หน่วย"),
          col("amount", "ยอดจ่าย"),
          col("method", "ช่องทาง"),
          col("vendor", "ร้านค้า"),
          col("recurring", "ประจำ"),
          col("receipt", "ใบเสร็จ"),
          col("by", "ผู้บันทึก"),
        ],
        rows: expenses
          .sort((a, b) => a.date.localeCompare(b.date))
          .map((e) => ({
            date: e.date,
            kind: EXPENSE_KINDS[e.kind],
            category: EXPENSE_CATEGORIES[e.category].label,
            detail: e.detail,
            qty: e.qty ?? "",
            unitPrice: e.unitPrice ?? "",
            amount: e.amount,
            method: e.method === "cash" ? "เงินสด" : "โอนเงิน",
            vendor: e.vendor ?? "",
            recurring: e.recurring ? "ประจำ" : "ครั้งเดียว",
            receipt: e.hasReceipt ? "มี" : "",
            by: users.find((u) => u.id === e.createdBy)?.displayName ?? "",
          })),
      };
    },
  },
  pl: {
    label: "กำไร–ขาดทุนรายเดือน",
    ownerOnly: true,
    usesDates: true,
    async build(store, from, to) {
      const [invoices, expenses, settings] = await Promise.all([
        store.list<Invoice>("invoices"),
        store.list<Expense>("expenses"),
        getSettings(store),
      ]);
      const months = summarizeRange(from, to, invoices, expenses, settings.royaltyPercent);
      return {
        columns: [
          col("month", "เดือน"),
          col("revenue", "รายรับค่าเรียน"),
          col("operating", "ค่าใช้จ่ายดำเนินงาน"),
          col("supply", "ของใช้เบ็ดเตล็ด"),
          col("royaltyDue", `royalty ${settings.royaltyPercent}%`),
          col("royaltyPaid", "royalty ที่จ่ายแล้ว"),
          col("profit", "กำไรประมาณการ"),
          col("margin", "% กำไร"),
        ],
        rows: months.map((m) => ({
          month: m.month,
          revenue: m.revenue,
          operating: m.operating,
          supply: m.supply,
          royaltyDue: m.royaltyDue,
          royaltyPaid: m.royaltyPaid,
          profit: m.profit,
          margin: m.revenue ? `${Math.round((m.profit / m.revenue) * 100)}%` : "",
        })),
      };
    },
  },
};

route("GET", "admin/reports", STAFF, async ({ me }) => ({
  datasets: Object.entries(DATASETS)
    .filter(([, d]) => !d.ownerOnly || me?.role === "owner")
    .map(([key, d]) => ({ key, label: d.label, usesDates: d.usesDates })),
}));

route("POST", "admin/reports", STAFF, async ({ store, body, me }) => {
  const dataset = DATASETS[String(body.dataset)];
  if (!dataset) throw new HttpError(400, "ไม่พบรายงานนี้");
  if (dataset.ownerOnly && me?.role !== "owner") throw new HttpError(403, "รายงานนี้ดูได้เฉพาะเจ้าของ");
  const from = dataset.usesDates ? dateStr(body.from, "วันที่เริ่ม") : "";
  const to = dataset.usesDates ? dateStr(body.to, "วันที่สิ้นสุด") : "";
  return dataset.build(store, from, to);
});
