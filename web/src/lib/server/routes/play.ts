import "server-only";
import {
  ACHIEVEMENTS,
  applyRun,
  AVATAR_ITEMS,
  canApproveRedemption,
  DAILY_LIMIT_QUESTIONS,
  isDailyLimitReached,
  levelProgress,
  MONTHLY_REWARD_BUDGET_BAHT,
  newProfile,
  powerTitle,
} from "../../gamification";
import type { Attempt, AvatarSlot, Exercise, Grade, PlayerProfile, Question, Redemption, Reward, Student } from "../../types";
import { omit } from "../auth";
import { type Ctx, OWNER, route, STAFF, staffUser, studentOf } from "../router";
import type { Store } from "../store";
import { bkkDate, HttpError, newId, nowIso, num, oneOf, optStr, str } from "../util";

const STUDENT = ["student"] as const;
const SUBJECTS = ["math", "thai", "english", "science"] as const;
const SLOTS: AvatarSlot[] = ["background", "outfit", "hat", "pet"];
const MAX_RUN_SECONDS = 30 * 60; // กันเปิดทิ้งไว้แล้วเวลาวิ่งจนชนลิมิต

async function getProfile(store: Store, studentId: string): Promise<PlayerProfile> {
  return (await store.get<PlayerProfile>("player_profiles", studentId)) ?? newProfile(studentId);
}

// ---------- คลังแบบฝึกหัด (ครู) ----------

function exerciseFrom(body: Ctx["body"], id: string, createdAt: string): Exercise {
  const raw: unknown[] = Array.isArray(body.questions) ? body.questions : [];
  if (raw.length < 1 || raw.length > 50) throw new HttpError(400, "ต้องมีโจทย์ 1-50 ข้อ");
  const questions = raw.map((q, i): Question => {
    const item = q as Record<string, unknown>;
    const choices = Array.isArray(item.choices) ? item.choices.map((c) => String(c ?? "").trim()) : [];
    // ตัดช่องว่างท้ายได้ แต่ห้ามเว้นตรงกลาง ไม่งั้นลำดับคำตอบที่ถูกจะเลื่อน
    while (choices.length && !choices[choices.length - 1]) choices.pop();
    if (choices.some((c) => !c)) throw new HttpError(400, `ข้อ ${i + 1}: ตัวเลือกห้ามเว้นว่างตรงกลาง`);
    if (choices.length < 2 || choices.length > 4) throw new HttpError(400, `ข้อ ${i + 1}: ต้องมีตัวเลือก 2-4 ตัว`);
    return {
      prompt: str(item.prompt, `โจทย์ข้อ ${i + 1}`, 500),
      choices: choices.map((c) => c.slice(0, 200)),
      answerIndex: num(item.answerIndex, `คำตอบข้อ ${i + 1}`, 0, choices.length - 1),
      explain: optStr(item.explain, 500),
    };
  });
  return {
    id,
    title: str(body.title, "ชื่อชุด", 100),
    subject: oneOf(body.subject, SUBJECTS, "วิชา"),
    grade: oneOf(Number(body.grade), [1, 2, 3, 4, 5, 6] as const, "ชั้น") as Grade,
    topic: str(body.topic, "หัวข้อ", 60),
    questions,
    published: body.published === true,
    createdAt,
  };
}

route("GET", "admin/exercises", STAFF, async ({ store }) => {
  const exercises = await store.list<Exercise>("exercises");
  return { exercises: exercises.sort((a, b) => a.grade - b.grade || a.title.localeCompare(b.title)) };
});
route("POST", "admin/exercises", STAFF, async ({ store, body }) => {
  const exercise = exerciseFrom(body, newId(), nowIso());
  await store.set("exercises", exercise);
  return { exercise };
});
route("PATCH", "admin/exercises/:id", STAFF, async ({ store, body, params }) => {
  const prev = await store.get<Exercise>("exercises", params.id);
  if (!prev) throw new HttpError(404, "ไม่พบแบบฝึกหัด");
  const exercise = exerciseFrom(body, prev.id, prev.createdAt);
  await store.set("exercises", exercise);
  return { exercise };
});
route("DELETE", "admin/exercises/:id", OWNER, async ({ store, params }) => {
  await store.remove("exercises", params.id);
  return { ok: true };
});

// ---------- นักเรียนเล่น ----------

route("GET", "play/home", STUDENT, async (ctx) => {
  const student = studentOf(ctx);
  const today = bkkDate();
  const [profile, exercises, attempts] = await Promise.all([
    getProfile(ctx.store, student.id),
    ctx.store.list<Exercise>("exercises", { grade: student.grade, published: true }),
    ctx.store.list<Attempt>("attempts", { studentId: student.id, status: "finished" }),
  ]);
  const progress = levelProgress(profile.xp);
  return {
    student: { nickname: student.nickname, code: student.code, grade: student.grade },
    profile,
    level: { ...progress, title: powerTitle(progress.level) },
    limitReached: isDailyLimitReached(profile, today),
    todayQuestions: profile.lastPlayedDate === today ? profile.todayQuestions : 0,
    dailyLimitQuestions: DAILY_LIMIT_QUESTIONS,
    exercises: exercises.map((e) => {
      const mine = attempts.filter((a) => a.exerciseId === e.id);
      return {
        id: e.id,
        title: e.title,
        subject: e.subject,
        topic: e.topic,
        count: e.questions.length,
        best: mine.length ? Math.max(...mine.map((a) => a.correct)) : null,
      };
    }),
    achievements: ACHIEVEMENTS.map((a) => ({ ...omit(a, ["check"]), done: profile.achievementIds.includes(a.id) })),
    items: AVATAR_ITEMS.map((i) => ({ ...i, owned: profile.ownedItemIds.includes(i.id) })),
  };
});

route("POST", "play/start", STUDENT, async (ctx) => {
  const student = studentOf(ctx);
  const exercise = await ctx.store.get<Exercise>("exercises", str(ctx.body.exerciseId, "แบบฝึกหัด", 40));
  if (!exercise || !exercise.published || exercise.grade !== student.grade) throw new HttpError(404, "ไม่พบแบบฝึกหัด");
  const attempt: Attempt = {
    id: newId(),
    studentId: student.id,
    exerciseId: exercise.id,
    answers: exercise.questions.map(() => null),
    status: "started",
    correct: 0,
    total: exercise.questions.length,
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
    // ไม่ส่ง answerIndex ให้เครื่องนักเรียน
    questions: exercise.questions.map((q) => ({ prompt: q.prompt, choices: q.choices })),
  };
});

// ตอบทีละข้อ: server บันทึกคำตอบแล้วค่อยเฉลย ตอบซ้ำข้อเดิมไม่ได้
route("POST", "play/answer", STUDENT, async (ctx) => {
  const student = studentOf(ctx);
  const index = num(ctx.body.index, "ข้อ", 0, 49);
  const choice = num(ctx.body.choice, "ตัวเลือก", 0, 3);
  const attemptId = str(ctx.body.attemptId, "รอบ", 40);
  const current = await ctx.store.get<Attempt>("attempts", attemptId);
  if (!current || current.studentId !== student.id || current.status !== "started") throw new HttpError(400, "รอบนี้จบไปแล้ว");
  const exercise = await ctx.store.get<Exercise>("exercises", current.exerciseId);
  const question = exercise?.questions[index];
  if (!question) throw new HttpError(400, "ไม่พบโจทย์ข้อนี้");

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
  const closed = await ctx.store.update<Attempt>("attempts", attemptId, (a) =>
    a && a.status === "started" ? { ...a, status: "finished", finishedAt } : null,
  );
  if (!closed) throw new HttpError(400, "รอบนี้จบไปแล้ว");

  const correct = closed.answers.filter((ans, i) => ans === exercise.questions[i]?.answerIndex).length;
  const durationSec = Math.min(MAX_RUN_SECONDS, Math.max(0, Math.round((Date.parse(finishedAt) - Date.parse(closed.startedAt)) / 1000)));
  const today = bkkDate();

  let run = applyRun(newProfile(student.id), 0, 0, 0, today);
  const profile = await ctx.store.update<PlayerProfile>("player_profiles", student.id, (cur) => {
    run = applyRun(cur ?? newProfile(student.id), correct, closed.total, durationSec, today);
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
    redemptions: redemptions.sort((a, b) => b.requestedAt.localeCompare(a.requestedAt)).slice(0, 20),
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
    budget: MONTHLY_REWARD_BUDGET_BAHT,
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
  if (!canApproveRedemption(spentThisMonth(all), target.costBaht)) {
    throw new HttpError(400, `เกินงบของรางวัลเดือนนี้ (${MONTHLY_REWARD_BUDGET_BAHT.toLocaleString()} บาท) — ส่งมอบเดือนหน้าหรือปฏิเสธเพื่อคืนเหรียญ`);
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
