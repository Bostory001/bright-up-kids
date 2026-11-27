// คลาสออนไลน์ผ่าน Google Meet: กติกาที่ใช้ร่วมกันฝั่ง server และเทสต์ (ไม่แตะ Google/LINE)

import { sessionDates, weekdayOf } from "./schedule";
import type { Course } from "./types";

const MEET_URL = /^https:\/\/meet\.google\.com\/[a-z0-9-]{3,40}(\?[A-Za-z0-9=&_%.-]{0,100})?$/i;

/** ตรวจลิงก์ Meet — ว่าง = ยังไม่ตั้ง · ต้องเป็น https://meet.google.com/... เท่านั้น กันวางลิงก์ผิดที่ส่งต่อให้ผู้ปกครอง */
export function meetUrlFrom(value: unknown): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const url = String(value).trim();
  if (!MEET_URL.test(url)) throw new Error("ลิงก์ Google Meet ต้องขึ้นต้นด้วย https://meet.google.com/");
  return url;
}

/** วันนี้คอร์สนี้มีคาบหรือไม่ — มีวันเริ่ม/สัปดาห์ใช้ตารางจริง ไม่มีก็ถือว่าเรียนทุกสัปดาห์ตามวันเรียน */
export function hasSessionOn(course: Pick<Course, "weekday" | "startDate" | "weeks">, date: string): boolean {
  const dates = sessionDates(course);
  return dates.length ? dates.includes(date) : weekdayOf(date) === course.weekday;
}

export interface OnlineSession {
  courseId: string;
  name: string;
  startTime: string;
  endTime: string;
  meetUrl?: string;
}

/** คาบออนไลน์ของวันที่กำหนด เรียงตามเวลา */
export function onlineSessionsOn(courses: Course[], date: string): OnlineSession[] {
  return courses
    .filter((c) => c.active && c.online && hasSessionOn(c, date))
    .map((c) => ({ courseId: c.id, name: c.name, startTime: c.startTime, endTime: c.endTime, meetUrl: c.meetUrl }))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
}

/** นาทีก่อนเริ่มคาบที่ระบบส่งลิงก์ให้ผู้ปกครองอัตโนมัติ */
export const SEND_BEFORE_MINUTES = 30;

export const minutesOf = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));

export function meetMessage(nickname: string, s: OnlineSession): string {
  return `วันนี้น้อง${nickname}มีเรียนออนไลน์ ${s.name} เวลา ${s.startTime}-${s.endTime}\nเข้าห้องเรียน: ${s.meetUrl}`;
}
