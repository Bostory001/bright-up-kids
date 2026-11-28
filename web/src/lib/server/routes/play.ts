import "server-only";
import { GRADES, SUBJECT_KEYS } from "../../grade";
import {
  ACHIEVEMENTS,
  applyRun,
  AVATAR_ITEMS,
  canApproveRedemption,
  isDailyLimitReached,
  levelProgress,
  newProfile,
  powerTitle,
} from "../../gamification";
import type { Assignment, Attempt, AvatarSlot, Enrollment, Exercise, Grade, LessonImage, PlayerProfile, Question, Redemption, TeachCard, Reward, Student, Visual } from "../../types";
import { omit } from "../auth";
import { type Ctx, OWNER, route, STAFF, staffUser, studentOf } from "../router";
import { getSettings } from "../settings";
import type { Store } from "../store";
import { bkkDate, HttpError, newId, nowIso, num, oneOf, optStr, str } from "../util";

const STUDENT = ["student"] as const;
// รายชื่อวิชาอยู่ที่ lib/grade.ts ที่เดียว (SUBJECT_KEYS)
const SLOTS: AvatarSlot[] = ["background", "outfit", "hat", "pet"];
const MAX_RUN_SECONDS = 30 * 60; // กันเปิดทิ้งไว้แล้วเวลาวิ่งจนชนลิมิต

async function getProfile(store: Store, studentId: string): Promise<PlayerProfile> {
  return (await store.get<PlayerProfile>("player_profiles", studentId)) ?? newProfile(studentId);
}

// ---------- คลังแบบฝึกหัด (ครู) ----------

const DIAGRAM_KINDS = ["compass", "skydome", "timezone", "earth", "solar", "stars", "angle", "clock", "numline", "bars", "states", "tree", "table", "apparatus", "objects", "blocks", "fracbar", "array", "pgrid", "money", "ruler", "shape", "addsub"];

/** กรองพารามิเตอร์แผนภาพ: ยอมรับเฉพาะ ตัวเลข ข้อความสั้น จริง/เท็จ และรายการซ้อนไม่เกิน 3 ชั้น — ไม่รับ HTML/สคริปต์ */
function cleanParams(raw: unknown, depth = 0): unknown {
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : 0;
  if (typeof raw === "boolean") return raw;
  if (typeof raw === "string") return raw.slice(0, 60);
  if (Array.isArray(raw) && depth < 3) return raw.slice(0, 40).map((x) => cleanParams(x, depth + 1));
  if (raw && typeof raw === "object" && !Array.isArray(raw) && depth < 1) {
    return Object.fromEntries(Object.entries(raw as Record<string, unknown>).slice(0, 20).filter(([k]) => /^[a-zA-Z]{1,20}$/.test(k)).map(([k, v]) => [k, cleanParams(v, depth + 1)]));
  }
  return null;
}

const IMG_SRC = new RegExp("^/img/[a-zA-Z0-9_\\-/]+\\.(png|jpe?g|webp)$");

function imageFrom(raw: unknown, where: string): LessonImage | undefined {
  if (raw === undefined || raw === null) return undefined;
  if (typeof raw !== "object" || Array.isArray(raw)) throw new HttpError(400, `${where}: รูปภาพไม่ถูกต้อง`);
  const o = raw as Record<string, unknown>;
  const src = str(o.src, `${where}: ที่อยู่รูป`, 120);
  // ไฟล์ต้องอยู่ใต้ /img/ เท่านั้น ห้ามลิงก์ภายนอก/โปรโตคอลอื่น
  if (!IMG_SRC.test(src) || src.includes("..")) throw new HttpError(400, `${where}: ที่อยู่รูปต้องเป็น /img/....png|jpg|webp`);
  const caption = optStr(o.caption, 120);
  return { src, alt: str(o.alt, `${where}: คำอธิบายรูป`, 120), ...(caption ? { caption } : {}) };
}

function visualFrom(raw: unknown, where: string): Visual | undefined {
  if (raw === undefined || raw === null) return undefined;
  if (typeof raw !== "object" || Array.isArray(raw)) throw new HttpError(400, `${where}: ภาพประกอบรูปแบบไม่ถูกต้อง`);
  const v = raw as Record<string, unknown>;
  if (v.type === "groups") {
    const groups = num(v.groups, `${where}: จำนวนกลุ่ม`, 1, 6);
    const each = num(v.each, `${where}: จำนวนต่อกลุ่ม`, 1, 10);
    if (!Number.isInteger(groups) || !Number.isInteger(each)) throw new HttpError(400, `${where}: จำนวนกลุ่มต้องเป็นจำนวนเต็ม`);
    const label = optStr(v.label, 40);
    return { type: "groups", groups, each, emoji: str(v.emoji, `${where}: emoji`, 8), ...(label ? { label } : {}) };
  }
  if (v.type === "equation") {
    const side = (s: unknown, name: string) => {
      if (!s || typeof s !== "object" || Array.isArray(s)) throw new HttpError(400, `${where}: ${name} ไม่ถูกต้อง`);
      const o = s as Record<string, unknown>;
      const label = optStr(o.label, 30);
      return { text: str(o.text, `${where}: ${name}`, 20), ...(label ? { label } : {}) };
    };
    return { type: "equation", left: side(v.left, "ซ้าย"), right: side(v.right, "ขวา") };
  }
  if (v.type === "diagram") {
    if (typeof v.kind !== "string" || !DIAGRAM_KINDS.includes(v.kind)) throw new HttpError(400, `${where}: ชนิดแผนภาพไม่รู้จัก`);
    const params = cleanParams(v.params ?? {});
    if (!params || typeof params !== "object" || Array.isArray(params)) throw new HttpError(400, `${where}: พารามิเตอร์แผนภาพไม่ถูกต้อง`);
    return { type: "diagram", kind: v.kind, params: params as Record<string, unknown> };
  }
  throw new HttpError(400, `${where}: ชนิดภาพประกอบไม่รู้จัก`);
}

function teachFrom(raw: unknown): TeachCard[] | undefined {
  if (raw === undefined || raw === null) return undefined;
  if (!Array.isArray(raw) || raw.length > 8) throw new HttpError(400, "การ์ดสอนต้องเป็นรายการไม่เกิน 8 ใบ");
  return raw.map((c, i): TeachCard => {
    if (!c || typeof c !== "object" || Array.isArray(c)) throw new HttpError(400, `การ์ดสอนใบที่ ${i + 1}: รูปแบบไม่ถูกต้อง`);
    const item = c as Record<string, unknown>;
    const example = optStr(item.example, 200);
    const visual = visualFrom(item.visual, `การ์ดสอนใบที่ ${i + 1}`);
    const image = imageFrom(item.image, `การ์ดสอนใบที่ ${i + 1}`);
    return { ...(image ? { image } : {}), title: str(item.title, `หัวข้อการ์ด ${i + 1}`, 60), text: str(item.text, `เนื้อหาการ์ด ${i + 1}`, 400), ...(example ? { example } : {}), ...(visual ? { visual } : {}) };
  });
}

// ฟิลด์บทเรียนตามหลักสูตร (term/unit/order/teach) — ถ้า body ไม่ส่งมา ให้คงค่าเดิม ไม่งั้น PATCH จะทำของหาย
function lessonFields(body: Ctx["body"], prev?: Exercise): Pick<Exercise, "term" | "unit" | "order" | "teach"> {
  const out: Pick<Exercise, "term" | "unit" | "order" | "teach"> = {};
  const term = body.term === undefined ? prev?.term : body.term === null ? undefined : (oneOf(Number(body.term), [1, 2], "เทอม") as 1 | 2);
  const unit = body.unit === undefined ? prev?.unit : optStr(body.unit, 80);
  const order = body.order === undefined ? prev?.order : body.order === null ? undefined : num(body.order, "ลำดับบท", 1, 999);
  const teach = body.teach === undefined ? prev?.teach : teachFrom(body.teach);
  if (term) out.term = term;
  if (unit) out.unit = unit;
  if (order !== undefined && Number.isInteger(order)) out.order = order;
  if (teach?.length) out.teach = teach;
  return out;
}

function exerciseFrom(body: Ctx["body"], id: string, createdAt: string, prev?: Exercise): Exercise {
  const raw: unknown[] = Array.isArray(body.questions) ? body.questions : [];
  if (raw.length < 1 || raw.length > 50) throw new HttpError(400, "ต้องมีโจทย์ 1-50 ข้อ");
  const questions = raw.map((q, i): Question => {
    if (!q || typeof q !== "object" || Array.isArray(q)) throw new HttpError(400, `ข้อ ${i + 1}: รูปแบบโจทย์ไม่ถูกต้อง`);
    const item = q as Record<string, unknown>;
    const choices = Array.isArray(item.choices) ? item.choices.map((c) => String(c ?? "").trim()) : [];
    // ตัดช่องว่างท้ายได้ แต่ห้ามเว้นตรงกลาง ไม่งั้นลำดับคำตอบที่ถูกจะเลื่อน
    while (choices.length && !choices[choices.length - 1]) choices.pop();
    if (choices.some((c) => !c)) throw new HttpError(400, `ข้อ ${i + 1}: ตัวเลือกห้ามเว้นว่างตรงกลาง`);
    if (choices.length < 2 || choices.length > 4) throw new HttpError(400, `ข้อ ${i + 1}: ต้องมีตัวเลือก 2-4 ตัว`);
    const answerIndex = num(item.answerIndex, `คำตอบข้อ ${i + 1}`, 0, choices.length - 1);
    if (!Number.isInteger(answerIndex)) throw new HttpError(400, `ข้อ ${i + 1}: คำตอบต้องเป็นลำดับจำนวนเต็ม`);
    return {
      prompt: str(item.prompt, `โจทย์ข้อ ${i + 1}`, 500),
      choices: choices.map((c) => c.slice(0, 200)),
      answerIndex,
      explain: optStr(item.explain, 500),
      visual: visualFrom(item.visual, `ข้อ ${i + 1}`),
      image: imageFrom(item.image, `ข้อ ${i + 1}`),
    };
  });
  return {
    id,
    title: str(body.title, "ชื่อชุด", 100),
    subject: oneOf(body.subject, SUBJECT_KEYS, "วิชา"),
    grade: oneOf(Number(body.grade), GRADES, "ชั้น") as Grade,
    topic: str(body.topic, "หัวข้อ", 60),
    questions,
    ...lessonFields(body, prev),
    published: body.published === true,
    openToAll: body.openToAll === undefined ? prev?.openToAll === true : body.openToAll === true,
    createdAt,
  };
}

route("GET", "admin/exercises", STAFF, async ({ store }) => {
  const exercises = await store.list<Exercise>("exercises");
  return { exercises: exercises.sort((a, b) => a.grade - b.grade || a.title.localeCompare(b.title)) };
});
// เปิด/ปิดคอลัมน์ "เปิดดูทุกชั้น" ให้ทุกชุดพร้อมกัน (เจ้าของ) ไว้ตรวจเนื้อหาบนหน้าเด็กก่อนเผยแพร่
route("POST", "admin/exercises/open-all", OWNER, async ({ store, body }) => {
  const open = body.open === true;
  const all = await store.list<Exercise>("exercises");
  let changed = 0;
  for (const e of all) {
    if ((e.openToAll === true) === open) continue;
    await store.set("exercises", { ...e, openToAll: open });
    changed++;
  }
  return { changed, open };
});
route("POST", "admin/exercises", STAFF, async ({ store, body }) => {
  const exercise = exerciseFrom(body, newId(), nowIso());
  await store.set("exercises", exercise);
  return { exercise };
});
route("PATCH", "admin/exercises/:id", STAFF, async ({ store, body, params }) => {
  const prev = await store.get<Exercise>("exercises", params.id);
  if (!prev) throw new HttpError(404, "ไม่พบแบบฝึกหัด");
  const exercise = exerciseFrom(body, prev.id, prev.createdAt, prev);
  await store.set("exercises", exercise);
  return { exercise };
});
route("DELETE", "admin/exercises/:id", OWNER, async ({ store, params }) => {
  await store.remove("exercises", params.id);
  return { ok: true };
});

// ---------- นักเรียนเล่น ----------

/** เด็กเข้าชั้นนี้ได้ไหม: ชั้นหลัก + ชั้นที่ซื้อแพ็กเพิ่ม */
const hasGrade = (s: { grade: number; extraGrades?: number[] }, g: number) => s.grade === g || Boolean(s.extraGrades?.includes(g));
/** เห็นชุดนี้ได้ไหม: เผยแพร่แล้วและตรงชั้น หรือเจ้าของตั้งคอลัมน์ "เปิดดูทุกชั้น" (openToAll) ไว้ */
const canSee = (s: { grade: number; extraGrades?: number[] }, e: Exercise) => e.openToAll === true || (e.published && hasGrade(s, e.grade));

route("GET", "play/home", STUDENT, async (ctx) => {
  const student = studentOf(ctx);
  const today = bkkDate();
  const [profile, exercises, attempts, settings, enrollments, assignments] = await Promise.all([
    getProfile(ctx.store, student.id),
    ctx.store.list<Exercise>("exercises").then((all) => all.filter((e) => canSee(student, e))),
    ctx.store.list<Attempt>("attempts", { studentId: student.id, status: "finished" }),
    getSettings(ctx.store),
    ctx.store.list<Enrollment>("enrollments", { studentId: student.id, status: "active" }),
    ctx.store.list<Assignment>("assignments"),
  ]);
  const progress = levelProgress(profile.xp);
  // การบ้านของคอร์สที่ลงไว้ ที่ยังไม่ได้ทำหลังครูสั่ง
  const myCourses = new Set(enrollments.map((e) => e.courseId));
  const homeworkDue = new Map<string, string>();
  for (const a of assignments) {
    if (!myCourses.has(a.courseId)) continue;
    const done = attempts.some((t) => t.exerciseId === a.exerciseId && t.startedAt >= a.createdAt);
    if (!done && (!homeworkDue.has(a.exerciseId) || a.dueDate < homeworkDue.get(a.exerciseId)!)) homeworkDue.set(a.exerciseId, a.dueDate);
  }
  return {
    student: { nickname: student.nickname, code: student.code, grade: student.grade, grades: [...new Set([student.grade, ...(student.extraGrades ?? []), ...exercises.map((e) => e.grade)])].sort((a, b) => a - b) },
    profile,
    level: { ...progress, title: powerTitle(progress.level) },
    limitReached: isDailyLimitReached(profile, today, settings),
    todayQuestions: profile.lastPlayedDate === today ? profile.todayQuestions : 0,
    dailyLimitQuestions: settings.dailyLimitQuestions,
    today,
    recentAttempts: [...attempts]
      .sort((a, b) => (b.finishedAt ?? b.startedAt).localeCompare(a.finishedAt ?? a.startedAt) || b.id.localeCompare(a.id))
      .slice(0, 10)
      .map((a) => ({
        id: a.id,
        title: exercises.find((e) => e.id === a.exerciseId)?.title ?? "แบบฝึกหัดที่ไม่เปิดให้ฝึกแล้ว",
        correct: a.correct,
        total: a.total,
        date: a.date,
        xpEarned: a.xpEarned,
        counted: a.counted,
      })),
    exercises: exercises.map((e) => {
      const mine = attempts.filter((a) => a.exerciseId === e.id);
      return {
        id: e.id,
        homeworkDue: homeworkDue.get(e.id) ?? null,
        title: e.title,
        grade: e.grade,
        draft: !e.published,
        subject: e.subject,
        topic: e.topic,
        count: e.questions.length,
        term: e.term ?? null,
        unit: e.unit ?? null,
        order: e.order ?? null,
        hasTeach: Boolean(e.teach?.length),
        best: mine.length ? Math.max(...mine.map((a) => a.correct)) : null,
      };
    }),
    achievements: ACHIEVEMENTS.map((a) => ({ ...omit(a, ["check"]), done: profile.achievementIds.includes(a.id) })),
    items: AVATAR_ITEMS.map((i) => ({ ...i, owned: profile.ownedItemIds.includes(i.id) })),
  };
});

const MINI_QUESTIONS = 3;

/** สุ่ม 3 เลขข้อไม่ซ้ำ เรียงตามลำดับในชุด (ให้อ่านต่อเนื่อง) */
function pickMiniOrder(total: number): number[] {
  const pool = Array.from({ length: total }, (_, i) => i);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, MINI_QUESTIONS).sort((a, b) => a - b);
}

route("POST", "play/start", STUDENT, async (ctx) => {
  const student = studentOf(ctx);
  const exercise = await ctx.store.get<Exercise>("exercises", str(ctx.body.exerciseId, "แบบฝึกหัด", 40));
  if (!exercise || !canSee(student, exercise)) throw new HttpError(404, "ไม่พบแบบฝึกหัด");
  // โหมด "ลอง 3 ข้อ": สุ่ม 3 ข้อจากชุด (ชุดที่มี ≤ 3 ข้อ = ทำครบทั้งชุดเหมือนปกติ)
  const mini = ctx.body.mini === true && exercise.questions.length > MINI_QUESTIONS;
  const order = mini ? pickMiniOrder(exercise.questions.length) : null;
  const picked = order ? order.map((i) => exercise.questions[i]) : exercise.questions;
  const attempt: Attempt = {
    id: newId(),
    studentId: student.id,
    exerciseId: exercise.id,
    answers: picked.map(() => null),
    ...(order ? { questionOrder: order } : {}),
    status: "started",
    correct: 0,
    total: picked.length,
    counted: false,
    xpEarned: 0,
    coinsEarned: 0,
    durationSec: 0,
    startedAt: nowIso(),
    date: bkkDate(),
  };
  await ctx.store.set("attempts", attempt);
  return {
    attemptId: attempt.id,
    title: exercise.title,
    teach: exercise.teach ?? [],
    // ไม่ส่ง answerIndex ให้เครื่องนักเรียน
    questions: picked.map((q) => ({ prompt: q.prompt, choices: q.choices, ...(q.visual ? { visual: q.visual } : {}), ...(q.image ? { image: q.image } : {}) })),
  };
});

// ตอบทีละข้อ: server บันทึกคำตอบแล้วค่อยเฉลย ตอบซ้ำข้อเดิมไม่ได้
route("POST", "play/answer", STUDENT, async (ctx) => {
  const student = studentOf(ctx);
  const index = num(ctx.body.index, "ข้อ", 0, 49);
  const choice = num(ctx.body.choice, "ตัวเลือก", 0, 3);
  if (!Number.isInteger(index) || !Number.isInteger(choice)) throw new HttpError(400, "ข้อและตัวเลือกต้องเป็นจำนวนเต็ม");
  const attemptId = str(ctx.body.attemptId, "รอบ", 40);
  const current = await ctx.store.get<Attempt>("attempts", attemptId);
  if (!current || current.studentId !== student.id || current.status !== "started") throw new HttpError(400, "รอบนี้จบไปแล้ว");
  const exercise = await ctx.store.get<Exercise>("exercises", current.exerciseId);
  const question = exercise?.questions[current.questionOrder?.[index] ?? index];
  if (!question) throw new HttpError(400, "ไม่พบโจทย์ข้อนี้");
  if (choice >= question.choices.length) throw new HttpError(400, "ไม่พบตัวเลือกนี้");

  const saved = await ctx.store.update<Attempt>("attempts", attemptId, (a) => {
    if (!a || a.status !== "started" || a.answers[index] !== null) return null;
    a.answers[index] = choice;
    return a;
  });
  if (!saved) throw new HttpError(400, "ข้อนี้ตอบไปแล้ว");
  return { correct: choice === question.answerIndex, answerIndex: question.answerIndex, explain: question.explain };
});

route("POST", "play/finish", STUDENT, async (ctx) => {
  const student = studentOf(ctx);
  const attemptId = str(ctx.body.attemptId, "รอบ", 40);
  const started = await ctx.store.get<Attempt>("attempts", attemptId);
  if (!started || started.studentId !== student.id) throw new HttpError(404, "ไม่พบรอบนี้");
  const exercise = await ctx.store.get<Exercise>("exercises", started.exerciseId);
  if (!exercise) throw new HttpError(404, "ไม่พบแบบฝึกหัด");

  // ปิดรอบแบบ atomic กันกดจบซ้ำเพื่อรับคะแนนสองรอบ
  const finishedAt = nowIso();
  const closed = await ctx.store.update<Attempt>("attempts", attemptId, (a) => {
    if (!a || a.status !== "started") return null;
    if (a.answers.length !== a.total || a.answers.some((answer) => answer === null)) {
      throw new HttpError(400, "ตอบให้ครบทุกข้อก่อนดูผลนะ");
    }
    return { ...a, status: "finished", finishedAt };
  });
  if (!closed) throw new HttpError(400, "รอบนี้จบไปแล้ว");

  const correct = closed.answers.filter((ans, i) => ans === exercise.questions[closed.questionOrder?.[i] ?? i]?.answerIndex).length;
  const durationSec = Math.min(MAX_RUN_SECONDS, Math.max(0, Math.round((Date.parse(finishedAt) - Date.parse(closed.startedAt)) / 1000)));
  const today = bkkDate();

  const settings = await getSettings(ctx.store);
  let run = applyRun(newProfile(student.id), 0, 0, 0, today);
  const profile = await ctx.store.update<PlayerProfile>("player_profiles", student.id, (cur) => {
    run = applyRun(cur ?? newProfile(student.id), correct, closed.total, durationSec, today, settings);
    return run.profile;
  });
  await ctx.store.set("attempts", { ...closed, correct, durationSec, counted: run.counted, xpEarned: run.xpEarned, coinsEarned: run.coinsEarned });

  const progress = levelProgress(profile!.xp);
  return {
    correct,
    total: closed.total,
    counted: run.counted,
    xpEarned: run.xpEarned,
    coinsEarned: run.coinsEarned,
    leveledUp: run.leveledUp,
    level: progress.level,
    newAchievements: ACHIEVEMENTS.filter((a) => run.newAchievementIds.includes(a.id)).map((a) => ({ name: a.name, emoji: a.emoji })),
    newItems: AVATAR_ITEMS.filter((i) => run.newItemIds.includes(i.id)).map((i) => ({ name: i.name, emoji: i.emoji })),
  };
});

route("POST", "play/equip", STUDENT, async (ctx) => {
  const student = studentOf(ctx);
  const slot = oneOf(ctx.body.slot, SLOTS, "ช่อง");
  const itemId: string | null = ctx.body.itemId ?? null;
  const profile = await ctx.store.update<PlayerProfile>("player_profiles", student.id, (cur) => {
    const p = cur ?? newProfile(student.id);
    if (itemId === null) {
      delete p.equipped[slot];
      return p;
    }
    const item = AVATAR_ITEMS.find((i) => i.id === itemId && i.slot === slot);
    if (!item || !p.ownedItemIds.includes(item.id)) return null;
    p.equipped[slot] = item.id;
    return p;
  });
  if (!profile) throw new HttpError(400, "ยังไม่ได้ปลดล็อกไอเทมนี้");
  return { equipped: profile.equipped };
});

// ---------- ของรางวัล ----------

route("GET", "play/rewards", STUDENT, async (ctx) => {
  const student = studentOf(ctx);
  const [rewards, redemptions, profile] = await Promise.all([
    ctx.store.list<Reward>("rewards", { active: true }),
    ctx.store.list<Redemption>("redemptions", { studentId: student.id }),
    getProfile(ctx.store, student.id),
  ]);
  return {
    coins: profile.coins,
    rewards: rewards.filter((r) => r.stock > 0).sort((a, b) => a.costCoins - b.costCoins).map((r) => omit(r, ["costBaht"])),
    redemptions: redemptions.sort((a, b) => b.requestedAt.localeCompare(a.requestedAt)).slice(0, 20)
      .map((r) => ({ id: r.id, rewardName: r.rewardName, status: r.status, costCoins: r.costCoins, requestedAt: r.requestedAt })),
  };
});

route("POST", "play/redeem", STUDENT, async (ctx) => {
  const student = studentOf(ctx);
  const rewardId = str(ctx.body.rewardId, "ของรางวัล", 40);
  // จองของก่อน แล้วค่อยหักเหรียญ ถ้าเหรียญไม่พอคืนของ
  const reward = await ctx.store.update<Reward>("rewards", rewardId, (r) => (r && r.active && r.stock > 0 ? { ...r, stock: r.stock - 1 } : null));
  if (!reward) throw new HttpError(400, "ของรางวัลนี้หมดแล้ว");
  const profile = await ctx.store.update<PlayerProfile>("player_profiles", student.id, (p) =>
    p && p.coins >= reward.costCoins ? { ...p, coins: p.coins - reward.costCoins } : null,
  );
  if (!profile) {
    await ctx.store.update<Reward>("rewards", rewardId, (r) => (r ? { ...r, stock: r.stock + 1 } : null));
    throw new HttpError(400, "เหรียญไม่พอ");
  }
  const redemption: Redemption = {
    id: newId(),
    studentId: student.id,
    rewardId,
    rewardName: reward.name,
    costCoins: reward.costCoins,
    costBaht: reward.costBaht,
    status: "requested",
    requestedAt: nowIso(),
  };
  await ctx.store.set("redemptions", redemption);
  return { coins: profile.coins };
});

function rewardFrom(body: Ctx["body"], id: string): Reward {
  return {
    id,
    name: str(body.name, "ชื่อของรางวัล", 80),
    costCoins: num(body.costCoins, "ราคา (เหรียญ)", 1, 100_000),
    costBaht: num(body.costBaht, "ต้นทุน (บาท)", 0, 100_000),
    stock: num(body.stock, "จำนวนคงเหลือ", 0, 100_000),
    active: body.active !== false,
  };
}

route("GET", "admin/rewards", STAFF, async ({ store }) => ({ rewards: await store.list<Reward>("rewards") }));
route("POST", "admin/rewards", STAFF, async ({ store, body }) => {
  const reward = rewardFrom(body, newId());
  await store.set("rewards", reward);
  return { reward };
});
route("PATCH", "admin/rewards/:id", STAFF, async ({ store, body, params }) => {
  if (!(await store.get("rewards", params.id))) throw new HttpError(404, "ไม่พบของรางวัล");
  const reward = rewardFrom(body, params.id);
  await store.set("rewards", reward);
  return { reward };
});

function spentThisMonth(redemptions: Redemption[]): number {
  const month = bkkDate().slice(0, 7);
  return redemptions.filter((r) => r.status === "handed_over" && r.handledDate?.startsWith(month)).reduce((s, r) => s + r.costBaht, 0);
}

route("GET", "admin/redemptions", STAFF, async ({ store }) => {
  const [redemptions, students] = await Promise.all([store.list<Redemption>("redemptions"), store.list<Student>("students")]);
  return {
    spent: spentThisMonth(redemptions),
    budget: (await getSettings(store)).rewardBudgetBaht,
    redemptions: redemptions
      .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt))
      .slice(0, 200)
      .map((r) => {
        const s = students.find((st) => st.id === r.studentId);
        return { ...r, studentCode: s?.code, studentNickname: s?.nickname };
      }),
  };
});

route("POST", "admin/redemptions/:id/handover", STAFF, async (ctx) => {
  const all = await ctx.store.list<Redemption>("redemptions");
  const target = all.find((r) => r.id === ctx.params.id);
  if (!target || target.status !== "requested") throw new HttpError(400, "รายการนี้ดำเนินการไปแล้ว");
  const budget = (await getSettings(ctx.store)).rewardBudgetBaht;
  if (!canApproveRedemption(spentThisMonth(all), target.costBaht, budget)) {
    throw new HttpError(400, `เกินงบของรางวัลเดือนนี้ (${budget.toLocaleString()} บาท) — ส่งมอบเดือนหน้าหรือปฏิเสธเพื่อคืนเหรียญ`);
  }
  const done = await ctx.store.update<Redemption>("redemptions", target.id, (r) =>
    r && r.status === "requested" ? { ...r, status: "handed_over", handledBy: staffUser(ctx).id, handledDate: bkkDate() } : null,
  );
  if (!done) throw new HttpError(400, "รายการนี้ดำเนินการไปแล้ว");
  return { ok: true };
});

// ปฏิเสธ = คืนเหรียญและคืนของเข้าสต็อก
route("POST", "admin/redemptions/:id/reject", STAFF, async (ctx) => {
  const done = await ctx.store.update<Redemption>("redemptions", ctx.params.id, (r) =>
    r && r.status === "requested" ? { ...r, status: "rejected", handledBy: staffUser(ctx).id, handledDate: bkkDate() } : null,
  );
  if (!done) throw new HttpError(400, "รายการนี้ดำเนินการไปแล้ว");
  await ctx.store.update<PlayerProfile>("player_profiles", done.studentId, (p) => (p ? { ...p, coins: p.coins + done.costCoins } : null));
  await ctx.store.update<Reward>("rewards", done.rewardId, (r) => (r ? { ...r, stock: r.stock + 1 } : null));
  return { ok: true };
});
