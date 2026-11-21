import "server-only";
import { GRADES, SUBJECT_KEYS } from "../../grade";
import { sortLessons } from "../../lessons";
import type { Grade, Lesson } from "../../types";
import { type Ctx, OWNER, route, STAFF, studentOf } from "../router";
import { HttpError, newId, nowIso, num, oneOf, optStr, str } from "../util";

// ---------- คลิปสอน ----------
// ไฟล์วิดีโอไม่เก็บใน Firestore (เกิน 1 MB ต่อเอกสาร) เก็บแค่ลิงก์ — อัปโหลดไฟล์ด้วย scripts/import-lessons.mjs

const STUDENT = ["student"] as const;

/** รับเฉพาะ https://... หรือ /lessons/... กัน javascript: และลิงก์แปลก ๆ */
function urlOf(v: unknown, field: string, required: boolean): string | undefined {
  const s = optStr(v, 500);
  if (!s) {
    if (required) throw new HttpError(400, `ต้องใส่${field}`);
    return undefined;
  }
  if (!/^(https:\/\/[^\s]+|\/lessons\/[^\s]+)$/.test(s)) throw new HttpError(400, `${field}ต้องขึ้นต้นด้วย https:// หรือ /lessons/`);
  return s;
}

function lessonFrom(body: Ctx["body"], id: string, createdAt: string): Lesson {
  return {
    id,
    title: str(body.title, "ชื่อคลิป", 120),
    subject: oneOf(body.subject, SUBJECT_KEYS, "วิชา"),
    grade: oneOf(Number(body.grade), GRADES, "ชั้น") as Grade,
    term: oneOf(Number(body.term), [1, 2] as const, "เทอม"),
    unit: str(body.unit, "หน่วยการเรียนรู้", 120),
    order: Math.round(num(body.order, "ลำดับ", 1, 999)),
    videoUrl: urlOf(body.videoUrl, "ลิงก์วิดีโอ", true)!,
    subtitleUrl: urlOf(body.subtitleUrl, "ลิงก์ซับไตเติล", false),
    durationSec: body.durationSec === undefined || body.durationSec === "" ? undefined : Math.round(num(body.durationSec, "ความยาว", 1, 7200)),
    summary: optStr(body.summary, 600),
    exerciseTopic: optStr(body.exerciseTopic, 60),
    published: body.published === true,
    createdAt,
  };
}

route("GET", "admin/lessons", STAFF, async ({ store }) => ({ lessons: sortLessons(await store.list<Lesson>("lessons")) }));

route("POST", "admin/lessons", STAFF, async ({ store, body }) => {
  const lesson = lessonFrom(body, newId(), nowIso());
  await store.set("lessons", lesson);
  return { lesson };
});

route("PATCH", "admin/lessons/:id", STAFF, async ({ store, body, params }) => {
  const prev = await store.get<Lesson>("lessons", params.id);
  if (!prev) throw new HttpError(404, "ไม่พบคลิปนี้");
  const lesson = lessonFrom(body, prev.id, prev.createdAt);
  await store.set("lessons", lesson);
  return { lesson };
});

route("DELETE", "admin/lessons/:id", OWNER, async ({ store, params }) => {
  await store.remove("lessons", params.id);
  return { ok: true };
});

// นักเรียนเห็นเฉพาะคลิปที่เผยแพร่แล้วของชั้นตัวเอง
route("GET", "play/lessons", STUDENT, async (ctx) => {
  const student = studentOf(ctx);
  const lessons = await ctx.store.list<Lesson>("lessons", { grade: student.grade, published: true });
  return {
    lessons: sortLessons(lessons).map((l) => ({
      id: l.id,
      title: l.title,
      subject: l.subject,
      term: l.term,
      unit: l.unit,
      order: l.order,
      videoUrl: l.videoUrl,
      subtitleUrl: l.subtitleUrl ?? null,
      durationSec: l.durationSec ?? null,
      summary: l.summary ?? null,
      exerciseTopic: l.exerciseTopic ?? null,
    })),
  };
});
