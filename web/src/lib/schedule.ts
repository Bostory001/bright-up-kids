// ปฏิทินการเรียน: คอร์สเรียนสัปดาห์ละครั้งในวันเดิม ตั้งแต่ startDate ไปอีก weeks สัปดาห์
// ใช้ตอบคำถามของผู้ปกครองว่า "น้องเรียนวันไหน กี่โมง และอีกกี่สัปดาห์จบคอร์ส"

import type { Course } from "./types";

export const WEEKDAY_TH = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];

const DAY_MS = 86_400_000;
const parse = (date: string) => new Date(`${date}T00:00:00.000Z`);
const fmt = (d: Date) => d.toISOString().slice(0, 10);

/** บวกวัน (ปลอดภัยกับเวลาไทยเพราะคิดเป็น UTC ล้วน) */
export function addDays(date: string, days: number): string {
  return fmt(new Date(parse(date).getTime() + days * DAY_MS));
}

export const weekdayOf = (date: string) => parse(date).getUTCDay();

/** วันเรียนทั้งหมดของคอร์ส — ว่างเมื่อยังไม่ได้ตั้งวันเริ่มหรือจำนวนสัปดาห์ */
export function sessionDates(course: Pick<Course, "startDate" | "weeks">): string[] {
  if (!course.startDate || !course.weeks || course.weeks < 1) return [];
  return Array.from({ length: Math.min(course.weeks, 104) }, (_, i) => addDays(course.startDate!, i * 7));
}

export interface CourseProgress {
  /** ตั้งวันเริ่ม + จำนวนสัปดาห์ครบหรือยัง */
  planned: boolean;
  total: number;
  /** คาบที่ผ่านไปแล้ว (นับรวมวันนี้) */
  done: number;
  left: number;
  startDate?: string;
  endDate?: string;
  /** วันเรียนครั้งถัดไป (รวมวันนี้) */
  nextDate?: string;
  /** เรียนจบคอร์สแล้ว */
  finished: boolean;
}

export function courseProgress(course: Pick<Course, "startDate" | "weeks">, today: string): CourseProgress {
  const dates = sessionDates(course);
  if (!dates.length) return { planned: false, total: 0, done: 0, left: 0, finished: false };
  const done = dates.filter((d) => d <= today).length;
  return {
    planned: true,
    total: dates.length,
    done,
    left: dates.length - done,
    startDate: dates[0],
    endDate: dates[dates.length - 1],
    nextDate: dates.find((d) => d >= today),
    finished: done >= dates.length,
  };
}

/** วันเรียนของคอร์สที่ตกอยู่ในเดือนนั้น (YYYY-MM) */
export function sessionsInMonth(course: Pick<Course, "startDate" | "weeks">, month: string): string[] {
  return sessionDates(course).filter((d) => d.slice(0, 7) === month);
}

/** ช่องวันของปฏิทินรายเดือน เริ่มสัปดาห์วันอาทิตย์ · null = ช่องว่างก่อน/หลังเดือน */
export function monthGrid(month: string): (string | null)[] {
  const first = `${month}-01`;
  const daysInMonth = new Date(Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0)).getUTCDate();
  const lead = weekdayOf(first);
  const cells: (string | null)[] = Array.from({ length: lead }, () => null);
  for (let i = 0; i < daysInMonth; i++) cells.push(addDays(first, i));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

/** ข้อความสั้นสำหรับผู้ปกครอง เช่น "เรียนแล้ว 7/12 สัปดาห์ · เหลืออีก 5 สัปดาห์ · จบ 20 ธ.ค." */
export function progressText(p: CourseProgress, thaiDate: (d: string) => string): string {
  if (!p.planned) return "ยังไม่ได้กำหนดวันเริ่มคอร์ส";
  if (p.finished) return `เรียนครบ ${p.total} สัปดาห์แล้ว (จบ ${thaiDate(p.endDate!)})`;
  return `เรียนแล้ว ${p.done}/${p.total} สัปดาห์ · เหลืออีก ${p.left} สัปดาห์ · จบ ${thaiDate(p.endDate!)}`;
}
