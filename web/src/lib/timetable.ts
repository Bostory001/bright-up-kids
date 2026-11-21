// ตารางสอนรายสัปดาห์ + ตรวจเวลาชน
// คอร์สเก็บ weekday/startTime/endTime อยู่แล้ว ไฟล์นี้แค่จัดเรียงและหาคู่ที่ชนกัน
// ไม่มี state ของตัวเอง → ทดสอบได้ตรง ๆ และใช้ได้ทั้งฝั่ง server และหน้าจอ

import type { Course } from "./types";

export const WEEKDAYS = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];

export const toMinutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));

/** สองช่วงเวลาทับกันไหม — ติดกันพอดี (จบ 10:30 เริ่ม 10:30) ไม่ถือว่าชน */
export function overlaps(a: { startTime: string; endTime: string }, b: { startTime: string; endTime: string }): boolean {
  return toMinutes(a.startTime) < toMinutes(b.endTime) && toMinutes(b.startTime) < toMinutes(a.endTime);
}

export interface Conflict {
  kind: "teacher" | "room";
  /** ชื่อครูหรือห้องที่ชน */
  who: string;
  weekday: number;
  courses: [string, string];
  detail: string;
}

/**
 * หาคู่คอร์สที่ชนกันในวันเดียวกัน
 * - ครูคนเดียวกันสอนสองที่พร้อมกัน
 * - ห้องเดียวกันถูกจองซ้อน
 * เทียบเฉพาะคอร์สที่ยังเปิดอยู่ (active)
 */
export function findConflicts(courses: Course[], teacherName: (id?: string) => string): Conflict[] {
  const open = courses.filter((c) => c.active);
  const out: Conflict[] = [];
  for (let i = 0; i < open.length; i++) {
    for (let j = i + 1; j < open.length; j++) {
      const a = open[i];
      const b = open[j];
      if (a.weekday !== b.weekday || !overlaps(a, b)) continue;
      const when = `${WEEKDAYS[a.weekday]} ${a.startTime}-${a.endTime} กับ ${b.startTime}-${b.endTime}`;
      if (a.teacherId && a.teacherId === b.teacherId) {
        out.push({ kind: "teacher", who: teacherName(a.teacherId), weekday: a.weekday, courses: [a.name, b.name], detail: `${teacherName(a.teacherId)} ถูกจัดสอนสองคอร์สพร้อมกัน ${when}` });
      }
      const room = a.room?.trim();
      if (room && room === b.room?.trim()) {
        out.push({ kind: "room", who: room, weekday: a.weekday, courses: [a.name, b.name], detail: `${room} ถูกใช้สองคอร์สพร้อมกัน ${when}` });
      }
    }
  }
  return out;
}

export interface TimetableCourse {
  id: string;
  name: string;
  /** 0=อาทิตย์ ... 6=เสาร์ */
  weekday: number;
  subject: Course["subject"];
  grades: number[];
  startTime: string;
  endTime: string;
  teacherName: string;
  room?: string;
  enrolled: number;
  capacity: number;
  active: boolean;
}

export interface TeacherRow {
  teacher: string;
  /** แต่ละ lane คือแถวย่อย — คอร์สของครูคนเดียวกันที่เวลาทับกันจะถูกแยกลง lane ถัดไปแทนที่จะวาดซ้อนกัน */
  lanes: TimetableCourse[][];
}

export const NO_TEACHER = "ยังไม่ระบุครู";

/** จัดคอร์สของวันเดียวเป็นแถวตามครู (แกน Y = ครู, แกน X = เวลา) เรียงชื่อครู แถว "ยังไม่ระบุครู" ไว้ท้ายสุด */
export function teacherRows(dayCourses: TimetableCourse[]): TeacherRow[] {
  const byTeacher = new Map<string, TimetableCourse[]>();
  for (const c of dayCourses) {
    const key = c.teacherName?.trim() || NO_TEACHER;
    byTeacher.set(key, [...(byTeacher.get(key) ?? []), c]);
  }
  const rows: TeacherRow[] = [];
  for (const [teacher, list] of byTeacher) {
    const sorted = [...list].sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));
    const lanes: TimetableCourse[][] = [];
    for (const c of sorted) {
      const lane = lanes.find((l) => !overlaps(l[l.length - 1], c));
      if (lane) lane.push(c);
      else lanes.push([c]);
    }
    rows.push({ teacher, lanes });
  }
  return rows.sort((a, b) => (a.teacher === NO_TEACHER ? 1 : b.teacher === NO_TEACHER ? -1 : a.teacher.localeCompare(b.teacher, "th")));
}

/** จัดคอร์สลงช่องวันในสัปดาห์ (อาทิตย์ = 0) เรียงตามเวลาเริ่ม */
export function weeklyGrid(courses: TimetableCourse[]): TimetableCourse[][] {
  const grid: TimetableCourse[][] = WEEKDAYS.map(() => []);
  for (const c of courses) grid[c.weekday]?.push(c);
  for (const day of grid) day.sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime) || a.name.localeCompare(b.name));
  return grid;
}
