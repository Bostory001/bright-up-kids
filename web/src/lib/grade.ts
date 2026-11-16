// ชั้นเรียนกับวิชา — ที่เดียวที่กำหนด ห้ามเขียน "ป." หรือรายชื่อวิชาทับเองในหน้าอื่น
// สาขานี้เริ่มจาก ป.1-6 แล้วขยายถึง ม.3 (ม.1 = 7, ม.2 = 8, ม.3 = 9)

import type { Grade, Subject } from "./types";

export const GRADES: readonly Grade[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

/** "ป.1" … "ป.6", "ม.1" … "ม.3" */
export function gradeLabel(grade: number): string {
  return grade >= 7 ? `ม.${grade - 6}` : `ป.${grade}`;
}

/** รายชื่อชั้นแบบอ่านง่าย เช่น "ป.1, ป.2" หรือ "ป.4-ม.3" เมื่อเป็นช่วงต่อเนื่อง */
export function gradeRange(grades: number[]): string {
  const sorted = [...new Set(grades)].sort((a, b) => a - b);
  if (sorted.length === 0) return "-";
  const continuous = sorted.every((g, i) => i === 0 || g === sorted[i - 1] + 1);
  return continuous && sorted.length > 2 ? `${gradeLabel(sorted[0])}-${gradeLabel(sorted[sorted.length - 1])}` : sorted.map(gradeLabel).join(", ");
}

export const SUBJECT_TH: Record<Subject, string> = {
  math: "คณิตศาสตร์",
  english: "ภาษาอังกฤษ",
  science: "วิทยาศาสตร์",
  thai: "ภาษาไทย",
  chinese: "ภาษาจีน",
};

/** ชื่อสั้นไว้ใช้ในตาราง/ป้าย */
export const SUBJECT_SHORT: Record<Subject, string> = {
  math: "คณิต",
  english: "อังกฤษ",
  science: "วิทย์",
  thai: "ไทย",
  chinese: "จีน",
};

export const SUBJECT_KEYS = Object.keys(SUBJECT_TH) as Subject[];

// ---------- ฉบับภาษาอังกฤษ (ใบตารางสอนของครูต่างชาติ) ----------

/** "P.1" … "P.6", "M.1" … "M.3" */
export function gradeLabelEn(grade: number): string {
  return grade >= 7 ? `M.${grade - 6}` : `P.${grade}`;
}

export function gradeRangeEn(grades: number[]): string {
  const sorted = [...new Set(grades)].sort((a, b) => a - b);
  if (sorted.length === 0) return "-";
  const continuous = sorted.every((g, i) => i === 0 || g === sorted[i - 1] + 1);
  return continuous && sorted.length > 2 ? `${gradeLabelEn(sorted[0])}-${gradeLabelEn(sorted[sorted.length - 1])}` : sorted.map(gradeLabelEn).join(", ");
}

export const SUBJECT_EN: Record<Subject, string> = {
  math: "Mathematics",
  english: "English",
  science: "Science",
  thai: "Thai",
  chinese: "Chinese",
};

export const WEEKDAY_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
