// คะแนนก่อน-หลังเรียน: คิดเป็นเปอร์เซ็นต์ก่อนเทียบ เพราะข้อสอบแต่ละชุดคะแนนเต็มไม่เท่ากัน
// (ได้ 15/20 กับ 30/50 เทียบกันตรง ๆ ไม่ได้)

import type { Assessment, AssessmentKind } from "./types";

export const ASSESSMENT_KINDS: Record<AssessmentKind, string> = {
  pre: "ก่อนเรียน",
  progress: "ระหว่างเรียน",
  post: "หลังจบคอร์ส",
};

/** คะแนนเป็นเปอร์เซ็นต์ ปัดทศนิยม 1 ตำแหน่ง · คะแนนเต็ม 0 ถือว่าใช้ไม่ได้ */
export function percent(score: number, maxScore: number): number | null {
  if (!maxScore || maxScore <= 0) return null;
  return Math.round((score / maxScore) * 1000) / 10;
}

export interface Progress {
  studentId: string;
  pre: Assessment | null;
  post: Assessment | null;
  latest: Assessment | null;
  prePercent: number | null;
  postPercent: number | null;
  /** ส่วนต่างเป็นจุดเปอร์เซ็นต์ เช่น 45% → 80% = +35 */
  gain: number | null;
  count: number;
}

const newest = (list: Assessment[]) =>
  list.length ? list.reduce((a, b) => (a.date.localeCompare(b.date) >= 0 ? a : b)) : null;
const oldest = (list: Assessment[]) =>
  list.length ? list.reduce((a, b) => (a.date.localeCompare(b.date) <= 0 ? a : b)) : null;

/**
 * พัฒนาการของนักเรียน 1 คน จากรายการคะแนนที่กรองมาแล้ว (คอร์ส/วิชาเดียวกัน)
 * ก่อนเรียน = ใบแรกสุดที่เป็น pre · หลังเรียน = ใบล่าสุดที่เป็น post
 */
export function progressOf(studentId: string, assessments: Assessment[]): Progress {
  const mine = assessments.filter((a) => a.studentId === studentId);
  const pre = oldest(mine.filter((a) => a.kind === "pre"));
  const post = newest(mine.filter((a) => a.kind === "post"));
  const prePercent = pre ? percent(pre.score, pre.maxScore) : null;
  const postPercent = post ? percent(post.score, post.maxScore) : null;
  return {
    studentId,
    pre,
    post,
    latest: newest(mine),
    prePercent,
    postPercent,
    gain: prePercent !== null && postPercent !== null ? Math.round((postPercent - prePercent) * 10) / 10 : null,
    count: mine.length,
  };
}

/** ค่าเฉลี่ยพัฒนาการของทั้งคอร์ส — นับเฉพาะคนที่มีทั้งก่อนและหลัง */
export function averageGain(rows: Progress[]): { average: number | null; counted: number; improved: number } {
  const withGain = rows.filter((r) => r.gain !== null);
  return {
    average: withGain.length ? Math.round((withGain.reduce((s, r) => s + (r.gain ?? 0), 0) / withGain.length) * 10) / 10 : null,
    counted: withGain.length,
    improved: withGain.filter((r) => (r.gain ?? 0) > 0).length,
  };
}
