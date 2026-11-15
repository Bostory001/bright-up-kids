import "server-only";
import { averageGain, progressOf } from "../../assessment";
import type { Assessment, AssessmentKind, Course, Enrollment, Student, Subject } from "../../types";
import { OWNER, route, STAFF } from "../router";
import { dateStr, HttpError, newId, nowIso, num, oneOf, optStr } from "../util";

// ---------- คะแนนก่อน-หลังเรียน ----------
// ครูบันทึกได้ (เป็นงานประจำของครู) · ลบได้เฉพาะเจ้าของ เพราะเป็นหลักฐานพัฒนาการที่คุยกับผู้ปกครอง

const KINDS = ["pre", "progress", "post"] as const;
const SUBJECTS = ["math", "thai", "english", "science"] as const;

function readAssessment(body: Record<string, unknown>): Omit<Assessment, "id" | "recordedBy" | "createdAt"> {
  const maxScore = num(body.maxScore, "คะแนนเต็ม", 1, 1000);
  const score = num(body.score, "คะแนนที่ได้", 0, 1000);
  if (score > maxScore) throw new HttpError(400, "คะแนนที่ได้มากกว่าคะแนนเต็ม");
  return {
    studentId: String(body.studentId ?? ""),
    courseId: optStr(body.courseId, 40),
    subject: oneOf(body.subject, SUBJECTS, "วิชา") as Subject,
    kind: oneOf(body.kind, KINDS, "ประเภทการวัด") as AssessmentKind,
    date: dateStr(body.date, "วันที่สอบ"),
    score,
    maxScore,
    note: optStr(body.note, 300),
  };
}

// คอร์สหนึ่ง: นักเรียนที่ลงเรียนทุกคน พร้อมคะแนนก่อน-หลังและพัฒนาการ
route("GET", "admin/assessments", STAFF, async ({ store, query }) => {
  const courseId = query.get("courseId") ?? "";
  const [all, students, enrollments, courses] = await Promise.all([
    store.list<Assessment>("assessments"),
    store.list<Student>("students"),
    store.list<Enrollment>("enrollments", { status: "active" }),
    store.list<Course>("courses"),
  ]);
  const course = courses.find((c) => c.id === courseId);
  const inCourse = courseId ? all.filter((a) => a.courseId === courseId) : all;
  const ids = courseId ? enrollments.filter((e) => e.courseId === courseId).map((e) => e.studentId) : students.filter((s) => s.active).map((s) => s.id);

  const rows = ids.map((studentId) => {
    const s = students.find((x) => x.id === studentId);
    return {
      ...progressOf(studentId, inCourse),
      code: s?.code ?? "",
      nickname: s?.nickname ?? "(ถูกลบ)",
      grade: s?.grade ?? 0,
      history: inCourse.filter((a) => a.studentId === studentId).sort((a, b) => b.date.localeCompare(a.date)),
    };
  });

  return {
    courses: courses.filter((c) => c.active).map((c) => ({ id: c.id, name: c.name, subject: c.subject })),
    courseId,
    subject: course?.subject ?? "math",
    rows: rows.sort((a, b) => (b.gain ?? -999) - (a.gain ?? -999) || a.nickname.localeCompare(b.nickname)),
    summary: averageGain(rows),
  };
});

route("POST", "admin/assessments", STAFF, async ({ store, body, me }) => {
  const draft = readAssessment(body);
  const student = await store.get<Student>("students", draft.studentId);
  if (!student) throw new HttpError(404, "ไม่พบนักเรียน");
  const assessment: Assessment = { ...draft, id: newId(), recordedBy: me!.id, createdAt: nowIso() };
  await store.set("assessments", assessment);
  return { assessment };
});

route("PATCH", "admin/assessments/:id", STAFF, async ({ store, body, params }) => {
  const cur = await store.get<Assessment>("assessments", params.id);
  if (!cur) throw new HttpError(404, "ไม่พบรายการ");
  // ค่าเดิมต้องไม่หายถ้าฟอร์มไม่ได้ส่งมา — โดยเฉพาะ courseId ที่ผูกคะแนนกับคอร์ส
  const next: Assessment = { ...cur, ...readAssessment({ courseId: cur.courseId, ...body, studentId: cur.studentId }) };
  await store.set("assessments", next);
  return { assessment: next };
});

route("DELETE", "admin/assessments/:id", OWNER, async ({ store, params }) => {
  await store.remove("assessments", params.id);
  return { ok: true };
});
