// สรุปการเงินของสถาบัน: รายรับค่าเรียน − รายจ่าย − royalty = กำไร
// คิดฝั่ง server เท่านั้น (กฎข้อ 3) · ใช้ร่วมกันระหว่าง API หน้ารายจ่าย, แดชบอร์ด และรายงาน

import type { Expense, ExpenseCategory, ExpenseKind, Invoice } from "./types";

export const EXPENSE_KINDS: Record<ExpenseKind, string> = {
  operating: "ค่าใช้จ่ายดำเนินงาน",
  supply: "ของใช้เบ็ดเตล็ด/วัสดุสิ้นเปลือง",
};

// หมวดที่เลือกได้ แยกตาม kind — ของใช้เบ็ดเตล็ดต้องมี "จำนวน × ราคาต่อหน่วย"
export const EXPENSE_CATEGORIES: Record<ExpenseCategory, { label: string; kind: ExpenseKind; example: string }> = {
  teacher: { label: "ค่าจ้างครู", kind: "operating", example: "ค่าสอนอังกฤษ 6 ชม." },
  staff: { label: "เงินเดือน/ค่าจ้างพนักงาน", kind: "operating", example: "ค่าจ้างแอดมินรายเดือน" },
  rent: { label: "ค่าเช่าสถานที่", kind: "operating", example: "ค่าเช่าเดือน พ.ย." },
  utilities: { label: "ค่าน้ำ ค่าไฟ เน็ต", kind: "operating", example: "ค่าไฟเดือน พ.ย." },
  royalty: { label: "royalty / RF ส่ง HQ", kind: "operating", example: "RF เดือน ต.ค." },
  marketing: { label: "การตลาด/โฆษณา", kind: "operating", example: "บูสต์โพสต์ Facebook" },
  stationery: { label: "เครื่องเขียน", kind: "supply", example: "ปากกา ดินสอ ยางลบ" },
  office: { label: "อุปกรณ์สำนักงาน", kind: "supply", example: "กระดาษ A4 หมึกพิมพ์" },
  cleaning: { label: "ของใช้ทำความสะอาด/ห้องน้ำ", kind: "supply", example: "น้ำยาถูพื้น ทิชชู" },
  hospitality: { label: "ของใช้รับรอง", kind: "supply", example: "น้ำดื่ม แก้วกระดาษ ขนม" },
  teaching: { label: "อุปกรณ์การสอน", kind: "supply", example: "ปากกาไวท์บอร์ด กระดาษกิจกรรม" },
  repair: { label: "ซ่อมแซมเล็กน้อย", kind: "supply", example: "หลอดไฟ ถ่านไฟฉาย" },
  other: { label: "อื่น ๆ", kind: "operating", example: "ค่าใช้จ่ายที่ไม่เข้าหมวดอื่น" },
};

export const EXPENSE_CATEGORY_KEYS = Object.keys(EXPENSE_CATEGORIES) as ExpenseCategory[];

export interface MonthSummary {
  month: string;
  /** รายรับค่าเรียนที่ยืนยันรับเงินแล้วในเดือนนี้ */
  revenue: number;
  /** รายจ่ายดำเนินงาน (ไม่รวมของใช้เบ็ดเตล็ด) */
  operating: number;
  /** ของใช้เบ็ดเตล็ด/วัสดุสิ้นเปลือง */
  supply: number;
  /** รายจ่ายรวมที่บันทึกไว้ = operating + supply (ไม่นับซ้ำ) */
  expense: number;
  /** royalty ที่ต้องส่ง HQ คิดจากรายรับของเดือนนี้ */
  royaltyDue: number;
  /** royalty ที่บันทึกจ่ายไปแล้วในเดือนนี้ (อยู่ในรายจ่ายดำเนินงานแล้ว) */
  royaltyPaid: number;
  /** กำไรประมาณการ = รายรับ − รายจ่ายรวม − royalty ส่วนที่ยังไม่ได้บันทึกจ่าย */
  profit: number;
  byCategory: { category: ExpenseCategory; label: string; kind: ExpenseKind; amount: number }[];
}

/** เดือนปัจจุบันของวันที่ไทย เช่น "2026-11" */
export const monthOf = (date: string) => date.slice(0, 7);

/**
 * สรุปเดือนเดียว — ส่ง invoices/expenses ทั้งหมดเข้ามาได้ ฟังก์ชันกรองเดือนเอง
 * royalty: ถ้ายังไม่ได้บันทึกรายจ่ายหมวด royalty ของเดือนนั้น จะหักส่วนต่างให้เห็นกำไรที่แท้จริง
 */
export function summarizeMonth(month: string, invoices: Invoice[], expenses: Expense[], royaltyPercent: number): MonthSummary {
  const revenue = invoices
    .filter((i) => i.status === "paid" && i.paidDate && monthOf(i.paidDate) === month)
    .reduce((s, i) => s + i.amount, 0);

  const inMonth = expenses.filter((e) => monthOf(e.date) === month);
  const sum = (list: Expense[]) => list.reduce((s, e) => s + e.amount, 0);
  const operating = sum(inMonth.filter((e) => e.kind === "operating"));
  const supply = sum(inMonth.filter((e) => e.kind === "supply"));
  const royaltyPaid = sum(inMonth.filter((e) => e.category === "royalty"));
  const royaltyDue = Math.round(revenue * royaltyPercent) / 100;

  const byCategory = EXPENSE_CATEGORY_KEYS.map((category) => ({
    category,
    label: EXPENSE_CATEGORIES[category].label,
    kind: EXPENSE_CATEGORIES[category].kind,
    amount: sum(inMonth.filter((e) => e.category === category)),
  })).filter((c) => c.amount > 0);

  const expense = operating + supply;
  // royalty ที่ค้างส่ง = ยอดที่ต้องส่งลบที่บันทึกจ่ายแล้ว (ไม่ให้ติดลบ กันกรณีจ่ายเหลื่อมเดือน)
  const royaltyUnpaid = Math.max(0, royaltyDue - royaltyPaid);
  return {
    month,
    revenue,
    operating,
    supply,
    expense,
    royaltyDue,
    royaltyPaid,
    profit: revenue - expense - royaltyUnpaid,
    byCategory: byCategory.sort((a, b) => b.amount - a.amount),
  };
}

/** รายเดือนย้อนหลัง ใหม่อยู่บนสุด — ใช้ในรายงานกำไร-ขาดทุน */
export function summarizeRange(from: string, to: string, invoices: Invoice[], expenses: Expense[], royaltyPercent: number): MonthSummary[] {
  const months = new Set<string>();
  for (const i of invoices) if (i.status === "paid" && i.paidDate && i.paidDate >= from && i.paidDate <= to) months.add(monthOf(i.paidDate));
  for (const e of expenses) if (e.date >= from && e.date <= to) months.add(monthOf(e.date));
  return [...months]
    .sort((a, b) => b.localeCompare(a))
    .map((m) => {
      const inv = invoices.filter((i) => i.paidDate && i.paidDate >= from && i.paidDate <= to);
      const exp = expenses.filter((e) => e.date >= from && e.date <= to);
      return summarizeMonth(m, inv, exp, royaltyPercent);
    });
}
