import "server-only";
import { courseProgress, monthGrid, sessionsInMonth } from "../../schedule";
import type { Attendance, Course, Enrollment, Student } from "../../types";
import { route, STAFF } from "../router";
import { bkkDate, HttpError } from "../util";

// ---------- ปฏิทินการเรียน ----------
// มุมมองรวมของสถาบัน (ครู/เจ้าของ) — ของผู้ปกครองอยู่ใน parent/overview แยกเฉพาะลูกตัวเอง

function monthParam(v: string | null): string {
  if (!v) return bkkDate().slice(0, 7);
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(v)) throw new HttpError(400, "เดือนไม่ถูกต้อง");
  return v;
}

route("GET", "admin/calendar", STAFF, async ({ store, query }) => {
  const month = monthParam(query.get("month"));
  const today = bkkDate();
  const [courses, enrollments, attendance, students] = await Promise.all([
    store.list<Course>("courses"),
    store.list<Enrollment>("enrollments", { status: "active" }),
    store.list<Attendance>("attendance"),
    store.list<Student>("students"),
  ]);
  const open = courses.filter((c) => c.active);

  // วันเรียนทุกคอร์สที่ตกในเดือนนี้ → รวมเป็นรายวัน
  const byDate = new Map<string, { courseId: string; name: string; startTime: string; endTime: string; room?: string; week: number; total: number; enrolled: number; checked: number }[]>();
  for (const c of open) {
    const dates = sessionsInMonth(c, month);
    const all = courseProgress(c, today);
    const enrolled = enrollments.filter((e) => e.courseId === c.id).length;
    dates.forEach((date) => {
      const week = all.planned ? Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${all.startDate}T00:00:00Z`)) / 604_800_000) + 1 : 0;
      const entry = {
        courseId: c.id,
        name: c.name,
        startTime: c.startTime,
        endTime: c.endTime,
        room: c.room,
        week,
        total: all.total,
        enrolled,
        checked: attendance.filter((a) => a.courseId === c.id && a.date === date).length,
      };
      byDate.set(date, [...(byDate.get(date) ?? []), entry]);
    });
  }
  for (const list of byDate.values()) list.sort((a, b) => a.startTime.localeCompare(b.startTime));

  return {
    month,
    today,
    cells: monthGrid(month).map((date) => ({ date, sessions: date ? (byDate.get(date) ?? []) : [] })),
    courses: open
      .map((c) => ({
        id: c.id,
        name: c.name,
        weekday: c.weekday,
        startTime: c.startTime,
        endTime: c.endTime,
        room: c.room,
        enrolled: enrollments.filter((e) => e.courseId === c.id).length,
        capacity: c.capacity,
        ...courseProgress(c, today),
      }))
      .sort((a, b) => a.weekday - b.weekday || a.startTime.localeCompare(b.startTime)),
    // คอร์สที่ยังไม่ได้ตั้งวันเริ่ม/จำนวนสัปดาห์ → ปฏิทินกับการแจ้งผู้ปกครองยังไม่ครบ
    unplanned: open.filter((c) => !c.startDate || !c.weeks).map((c) => c.name),
    studentCount: students.filter((s) => s.active).length,
  };
});
