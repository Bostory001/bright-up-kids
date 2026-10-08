import "server-only";
import { levelFromXp } from "../gamification";
import type { Attempt, Attendance, Exercise, Invoice, PlayerProfile, Student } from "../types";
import type { Store } from "./store";
import { bkkDate } from "./util";

export interface StudentSummary {
  studentId: string;
  code: string;
  nickname: string;
  grade: number;
  level: number;
  attendance: Record<Attendance["status"], number>; // 30 วันล่าสุด
  exercisesDone: number; // ตามช่วงวันที่ขอ
  accuracy: number | null; // % ตอบถูก
  topics: { topic: string; correct: number; total: number; percent: number }[]; // เรียงจากอ่อนสุด
  unpaidAmount: number;
}

// สรุปรายคน ใช้ร่วมกัน: หน้าผู้ปกครอง, สรุปรายสัปดาห์ทาง LINE, ผู้ช่วย AI
export async function summarizeStudents(store: Store, students: Student[], days: number): Promise<StudentSummary[]> {
  const since = bkkDate(new Date(Date.now() - days * 86_400_000));
  const since30 = bkkDate(new Date(Date.now() - 30 * 86_400_000));
  const [attempts, attendance, exercises, invoices, profiles] = await Promise.all([
    store.list<Attempt>("attempts", { status: "finished" }),
    store.list<Attendance>("attendance"),
    store.list<Exercise>("exercises"),
    store.list<Invoice>("invoices"),
    store.list<PlayerProfile>("player_profiles"),
  ]);
  const topicOf = new Map(exercises.map((e) => [e.id, e.topic]));

  return students.map((s) => {
    const mine = attempts.filter((a) => a.studentId === s.id && a.date >= since);
    const byTopic = new Map<string, { correct: number; total: number }>();
    for (const a of mine) {
      const topic = topicOf.get(a.exerciseId) ?? "อื่น ๆ";
      const t = byTopic.get(topic) ?? { correct: 0, total: 0 };
      byTopic.set(topic, { correct: t.correct + a.correct, total: t.total + a.total });
    }
    const correct = mine.reduce((sum, a) => sum + a.correct, 0);
    const total = mine.reduce((sum, a) => sum + a.total, 0);
    const att = { present: 0, late: 0, absent: 0, leave: 0 };
    for (const a of attendance) if (a.studentId === s.id && a.date >= since30) att[a.status]++;

    return {
      studentId: s.id,
      code: s.code,
      nickname: s.nickname,
      grade: s.grade,
      level: levelFromXp(profiles.find((p) => p.id === s.id)?.xp ?? 0),
      attendance: att,
      exercisesDone: mine.length,
      accuracy: total ? Math.round((correct / total) * 100) : null,
      topics: [...byTopic.entries()]
        .map(([topic, t]) => ({ topic, ...t, percent: Math.round((t.correct / t.total) * 100) }))
        .sort((a, b) => a.percent - b.percent),
      unpaidAmount: invoices
        .filter((i) => i.studentId === s.id && (i.status === "unpaid" || i.status === "slip_uploaded"))
        .reduce((sum, i) => sum + i.amount, 0),
    };
  });
}

export function weeklyText(s: StudentSummary): string {
  const lines = [`สรุปประจำสัปดาห์ น้อง${s.nickname} (Lv.${s.level})`];
  lines.push(s.exercisesDone ? `ทำแบบฝึกหัด ${s.exercisesDone} ชุด ตอบถูก ${s.accuracy}%` : "สัปดาห์นี้ยังไม่ได้ทำแบบฝึกหัดออนไลน์");
  const weak = s.topics.filter((t) => t.percent < 70).slice(0, 2);
  if (weak.length) lines.push(`ควรฝึกเพิ่ม: ${weak.map((t) => `${t.topic} (${t.percent}%)`).join(", ")}`);
  if (s.unpaidAmount > 0) lines.push(`ค่าเรียนค้างชำระ ${s.unpaidAmount.toLocaleString()} บาท`);
  return lines.join("\n");
}
