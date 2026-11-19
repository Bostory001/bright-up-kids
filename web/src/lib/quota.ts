// คาบคงเหลือรายคน — สถาบันขายเป็นแพ็ก (6 ชม. 1,000 บาท) ไม่ใช่รายเทอม
// นักเรียนในคอร์สเดียวกันจึงเหลือคาบไม่เท่ากัน ขึ้นกับว่าซื้อเมื่อไรและมาเรียนไปแล้วกี่ครั้ง
//
// กติกา: นับเฉพาะคาบที่ "มาเรียน" และ "มาสาย" เป็นการใช้คาบ
// ขาด/ลา ไม่ตัดคาบ (เปลี่ยนได้ที่ COUNTS_AS_USED ถ้าสถาบันใช้กติกาอื่น)

import type { Attendance, Enrollment } from "./types";

export const COUNTS_AS_USED: Attendance["status"][] = ["present", "late"];

export interface Quota {
  /** ซื้อมากี่คาบ (null = ไม่ได้จำกัด) */
  paid: number | null;
  used: number;
  /** เหลือกี่คาบ (null = ไม่ได้จำกัด) */
  left: number | null;
  /** เหลือน้อยกว่าหรือเท่ากับ 1 คาบ — ถึงเวลาทวงต่อคอร์ส */
  low: boolean;
  /** ใช้ครบแล้ว */
  finished: boolean;
}

export function quotaOf(enrollment: Pick<Enrollment, "studentId" | "courseId" | "sessionsPaid">, attendance: Pick<Attendance, "studentId" | "courseId" | "status">[]): Quota {
  const used = attendance.filter((a) => a.studentId === enrollment.studentId && a.courseId === enrollment.courseId && COUNTS_AS_USED.includes(a.status)).length;
  const paid = typeof enrollment.sessionsPaid === "number" && enrollment.sessionsPaid > 0 ? enrollment.sessionsPaid : null;
  const left = paid === null ? null : paid - used;
  return { paid, used, left, low: left !== null && left <= 1, finished: left !== null && left <= 0 };
}

/** ผู้ปกครองตั้งว่า "เหลืออีกกี่คาบ" → แปลงกลับเป็นจำนวนคาบที่จ่ายมาทั้งหมด */
export function paidFromRemaining(remaining: number, used: number): number {
  return Math.max(0, Math.round(remaining + used));
}
