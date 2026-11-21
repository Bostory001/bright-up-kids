// จัดกลุ่มคลิปสอนเป็นลำดับชั้น วิชา → เทอม → หน่วย → คลิป (ใช้ทั้ง server และหน้าจอ)

import { SUBJECT_KEYS } from "./grade";
import type { Lesson, Subject } from "./types";

type Sortable = Pick<Lesson, "subject" | "grade" | "term" | "unit" | "order" | "title">;

/** เรียงตามวิชา → ชั้น → เทอม → หน่วย → ลำดับในหน่วย */
export function sortLessons<T extends Sortable>(lessons: T[]): T[] {
  return [...lessons].sort(
    (a, b) =>
      SUBJECT_KEYS.indexOf(a.subject) - SUBJECT_KEYS.indexOf(b.subject) ||
      a.grade - b.grade ||
      a.term - b.term ||
      a.unit.localeCompare(b.unit, "th") ||
      a.order - b.order ||
      a.title.localeCompare(b.title, "th"),
  );
}

export interface LessonUnit<T> {
  unit: string;
  lessons: T[];
}
export interface LessonTerm<T> {
  term: 1 | 2;
  units: LessonUnit<T>[];
}
export interface LessonSubject<T> {
  subject: Subject;
  terms: LessonTerm<T>[];
}

/** รับรายการที่เรียงแล้ว (sortLessons) คืนเป็นต้นไม้ วิชา → เทอม → หน่วย */
export function groupLessons<T extends Pick<Lesson, "subject" | "term" | "unit">>(sorted: T[]): LessonSubject<T>[] {
  const out: LessonSubject<T>[] = [];
  for (const l of sorted) {
    let s = out.find((x) => x.subject === l.subject);
    if (!s) out.push((s = { subject: l.subject, terms: [] }));
    let t = s.terms.find((x) => x.term === l.term);
    if (!t) s.terms.push((t = { term: l.term, units: [] }));
    let u = t.units.find((x) => x.unit === l.unit);
    if (!u) t.units.push((u = { unit: l.unit, lessons: [] }));
    u.lessons.push(l);
  }
  return out;
}

export function formatDuration(sec?: number | null): string {
  if (!sec) return "";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m ? `${m}:${String(s).padStart(2, "0")} นาที` : `${s} วินาที`;
}
