import "server-only";
import { courseProgress, monthGrid, sessionDates, sessionsInMonth, WEEKDAY_TH } from "../../schedule";
import type { AppUser, Attendance, Course, Enrollment, Student } from "../../types";
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

// ---------- ใบตารางสอนรายครู ----------
// ส่งให้ครูรู้ว่า "สอนอะไร สอนใคร เวลาไหน" · ครูเปิดดูของตัวเองได้ เจ้าของดูของทุกคนได้
// ไม่มีข้อมูลการเงิน จึงไม่ใช่ OWNER

route("GET", "admin/teacher-sheet", STAFF, async ({ store, query, me }) => {
  const today = bkkDate();
  const [courses, enrollments, students, users, attendance] = await Promise.all([
    store.list<Course>("courses"),
    store.list<Enrollment>("enrollments", { status: "active" }),
    store.list<Student>("students"),
    store.list<AppUser>("users"),
    store.list<Attendance>("attendance"),
  ]);
  const teachers = users.filter((u) => (u.role === "teacher" || u.role === "owner") && u.active);
  // ครูเห็นของตัวเองเป็นค่าเริ่มต้น · เจ้าของที่ไม่ได้สอนเอง ให้เปิดมาเจอครูคนแรกที่มีคอร์สเลย
  const asked = query.get("teacherId");
  const teaches = (id: string) => courses.some((c) => c.active && c.teacherId === id);
  const teacherId = asked || (teaches(me!.id) ? me!.id : (teachers.find((t) => teaches(t.id))?.id ?? me!.id));
  const teacher = teachers.find((t) => t.id === teacherId);

  const mine = courses.filter((c) => c.active && c.teacherId === teacherId);
  return {
    teacherId,
    teacherName: teacher?.displayName ?? "",
    teachers: teachers.map((t) => ({ id: t.id, displayName: t.displayName })),
    today,
    courses: mine
      .map((c) => {
        const ids = enrollments.filter((e) => e.courseId === c.id).map((e) => e.studentId);
        const progress = courseProgress(c, today);
        return {
          id: c.id,
          name: c.name,
          subject: c.subject,
          grades: c.grades,
          weekday: c.weekday,
          weekdayName: WEEKDAY_TH[c.weekday],
          startTime: c.startTime,
          endTime: c.endTime,
          room: c.room,
          ...progress,
          upcoming: sessionDates(c).filter((d) => d >= today).slice(0, 4),
          students: ids
            .map((id) => students.find((s) => s.id === id))
            .filter((s): s is Student => Boolean(s) && s!.active)
            .map((s) => ({
              code: s.code,
              nickname: s.nickname,
              fullName: s.fullName,
              grade: s.grade,
              school: s.school,
              // เบอร์ผู้ปกครองไว้ติดต่อฉุกเฉินระหว่างสอน
              parentPhone: users.find((u) => u.id === s.parentId)?.phone ?? "",
              // ขาดเรียนบ่อยไหม ไว้ให้ครูรู้ล่วงหน้า
              absences: attendance.filter((a) => a.studentId === s.id && a.courseId === c.id && (a.status === "absent" || a.status === "leave")).length,
            }))
            .sort((a, b) => a.nickname.localeCompare(b.nickname)),
        };
      })
      .sort((a, b) => a.weekday - b.weekday || a.startTime.localeCompare(b.startTime)),
  };
});

