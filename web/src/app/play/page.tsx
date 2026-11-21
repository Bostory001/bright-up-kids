"use client";

import { useEffect, useRef, useState } from "react";
import { thaiDate, visibleExercises, type ExerciseCard, type ExerciseFilter } from "@/lib/play-view";
import { AvatarSvg } from "@/components/AvatarSvg";
import { LessonsView } from "@/components/LessonsView";
import { api, go, useLoad } from "@/lib/client/api";
import type { AvatarSlot, PlayerProfile, Redemption } from "@/lib/types";
import { SUBJECT_SHORT, gradeLabel } from "@/lib/grade";

interface Home {
  student: { nickname: string; code: string; grade: number };
  profile: PlayerProfile;
  level: { level: number; current: number; needed: number; percent: number; title: string };
  limitReached: boolean;
  todayQuestions: number;
  dailyLimitQuestions: number;
  exercises: ExerciseCard[];
  today: string;
  recentAttempts: { id: string; title: string; correct: number; total: number; date: string; xpEarned: number; counted: boolean }[];
  achievements: { id: string; name: string; description: string; emoji: string; coins: number; done: boolean }[];
  items: { id: string; slot: AvatarSlot; name: string; emoji: string; owned: boolean; unlock: { level?: number; achievementId?: string } }[];
}
interface QuestionReview {
  prompt: string;
  picked: string;
  correctAnswer: string;
  correct: boolean;
  explain?: string;
}
interface Run {
  exerciseId: string;
  selected: number | null;
  review: QuestionReview[];
  attemptId: string;
  title: string;
  questions: { prompt: string; choices: string[] }[];
  index: number;
  feedback: { picked: number; correct: boolean; answerIndex: number; explain?: string } | null;
}
interface Result {
  exerciseId: string;
  title: string;
  review: QuestionReview[];
  correct: number;
  total: number;
  counted: boolean;
  xpEarned: number;
  coinsEarned: number;
  leveledUp: boolean;
  level: number;
  newAchievements: { name: string; emoji: string }[];
  newItems: { name: string; emoji: string }[];
}
interface Shop {
  coins: number;
  rewards: { id: string; name: string; costCoins: number; stock: number }[];
  redemptions: Pick<Redemption, "id" | "rewardName" | "status" | "costCoins" | "requestedAt">[];
}

const SUBJECT_EMOJI: Record<string, string> = { math: "🔢", thai: "📖", english: "🔤", science: "🔬", chinese: "🀄" };
const SUBJECT_NAMES: Record<string, string> = SUBJECT_SHORT;
const RED = { requested: "รอรับที่สถาบัน", handed_over: "รับแล้ว", rejected: "ไม่อนุมัติ (คืนเหรียญแล้ว)" };
const BIG = "min-h-16 rounded-3xl p-4 text-xl font-bold shadow-md active:scale-95 disabled:opacity-50 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-sky-600";
// แนะนำการใช้งานครั้งแรก — แสดงจนกว่าจะทำแบบฝึกหัดชุดแรกเสร็จ
const TUTORIAL = [
  { emoji: "✏️", text: "เลือกแบบฝึกหัด แตะคำตอบ แล้วกดยืนยัน" },
  { emoji: "⚡", text: "ตอบถูกได้พลัง (XP) พลังเต็มหลอดแล้วเลเวลอัป!" },
  { emoji: "👕", text: "เลเวลสูงขึ้น ได้ชุดและสัตว์เลี้ยงใหม่ไว้แต่งตัว" },
  { emoji: "🎁", text: "เก็บเหรียญ 🪙 ไว้แลกของรางวัลจริงที่สถาบัน" },
];

export default function PlayPage() {
  const me = useLoad<{ me: { role: string } | null }>("me");
  const isStudent = me.data?.me?.role === "student";
  const home = useLoad<Home>(isStudent ? "play/home" : null);
  const [tab, setTab] = useState<"learn" | "lessons" | "wardrobe" | "shop">("learn");
  const shop = useLoad<Shop>(isStudent && tab === "shop" ? "play/rewards" : null);
  const [run, setRun] = useState<Run | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [subject, setSubject] = useState("all");
  const [filter, setFilter] = useState<ExerciseFilter>("all");
  const [search, setSearch] = useState("");
  const [exitRequested, setExitRequested] = useState(false);
  const exitCancel = useRef<HTMLButtonElement>(null);
  const actionPending = useRef(false);
  const questionHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!run) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [run]);

  useEffect(() => {
    if (exitRequested) exitCancel.current?.focus();
    else questionHeading.current?.focus();
  }, [run?.attemptId, run?.index, exitRequested]);

  useEffect(() => {
    if (me.data && !isStudent) go("/play/login");
  }, [me.data, isStudent]);

  async function act(fn: () => Promise<void>) {
    if (actionPending.current) return;
    actionPending.current = true;
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      actionPending.current = false;
      setBusy(false);
    }
  }

  const start = (exerciseId: string) =>
    act(async () => {
      const res = await api("play/start", { exerciseId });
      setResult(null);
      setRun({ ...res, exerciseId, index: 0, selected: null, feedback: null, review: [] });
    });

  const answer = () =>
    act(async () => {
      if (!run || run.feedback || run.selected === null) return;
      const choice = run.selected;
      const res = await api<{ correct: boolean; answerIndex: number; explain?: string }>("play/answer", { attemptId: run.attemptId, index: run.index, choice });
      const question = run.questions[run.index];
      setRun({ ...run, feedback: { picked: choice, ...res }, review: [...run.review, {
        prompt: question.prompt,
        picked: question.choices[choice],
        correctAnswer: question.choices[res.answerIndex],
        correct: res.correct,
        explain: res.explain,
      }] });
    });

  const next = () =>
    act(async () => {
      if (!run || !run.feedback) return;
      if (run.index + 1 < run.questions.length) return setRun({ ...run, index: run.index + 1, selected: null, feedback: null });
      const outcome = await api("play/finish", { attemptId: run.attemptId });
      setResult({ ...outcome, exerciseId: run.exerciseId, title: run.title, review: run.review });
      setRun(null);
      home.reload();
    });

  const leaveExercise = () => {
    if (busy) return;
    setExitRequested(true);
  };

  const equip = (slot: AvatarSlot, itemId: string | null) =>
    act(async () => {
      await api("play/equip", { slot, itemId });
      home.reload();
    });

  const redeem = (rewardId: string, name: string) =>
    window.confirm(`แลก "${name}" ใช่ไหม?`) &&
    act(async () => {
      await api("play/redeem", { rewardId });
      shop.reload();
      home.reload();
    });

  if (!isStudent || !home.data) return <main className="flex-1 p-6 text-center text-gray-600">
    <p role="status">{me.error ?? home.error ?? "กำลังโหลด..."}</p>
    {(me.error || home.error) && <button className={BIG + " mt-4 bg-white"} onClick={() => { me.reload(); home.reload(); }}>ลองโหลดใหม่</button>}
  </main>;
  const h = home.data;
  const shown = visibleExercises(h.exercises, subject, filter, search);

  // ---------- สรุปผล ----------
  if (result) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center gap-4 p-6 text-center">
        <AvatarSvg equipped={h.profile.equipped} />
        <p className="text-sm font-bold text-gray-600">{result.title}</p>
        <p className="text-5xl" aria-hidden="true">{result.correct === result.total ? "🏆" : "🌟"}</p>
        <h1 className="text-3xl font-bold">
          ถูก {result.correct} / {result.total} ข้อ
        </h1>
        <p className="text-gray-700">{result.correct === result.total ? "ครบทุกข้อเลย เก่งมาก!" : "ทำจบแล้ว! ทบทวนอีกนิด เก่งขึ้นได้ทุกวัน"}</p>
        {result.counted ? (
          <p className="text-2xl text-amber-600">
            +{result.xpEarned} XP · +{result.coinsEarned} 🪙
          </p>
        ) : (
          <p className="rounded-2xl bg-sky-100 p-3 text-sky-800">วันนี้เก็บพลังครบแล้ว รอบนี้เป็นการฝึกเพิ่ม ไม่นับคะแนน</p>
        )}
        {result.leveledUp && <p className="text-2xl font-bold text-pink-600">⚡ เลเวลอัป! Lv.{result.level}</p>}
        {result.newAchievements.map((a) => (
          <p key={a.name} className="w-full rounded-2xl bg-white p-3 shadow-sm">
            {a.emoji} ปลดล็อกความสำเร็จ: <b>{a.name}</b>
          </p>
        ))}
        {result.newItems.map((i) => (
          <p key={i.name} className="w-full rounded-2xl bg-white p-3 shadow-sm">
            {i.emoji} ได้ของแต่งตัวใหม่: <b>{i.name}</b>
          </p>
        ))}
        <section className="w-full text-left" aria-label="ทบทวนคำตอบ">
          <h2 className="mb-3 text-xl font-bold">ทบทวนคำตอบ</h2>
          <ol className="grid gap-3">
            {result.review.map((question, i) => (
              <li key={i} className={"rounded-2xl border-2 bg-white p-4 " + (question.correct ? "border-emerald-200" : "border-amber-300")}>
                <p className="font-bold">{question.correct ? "✓" : "↻"} ข้อ {i + 1}: {question.prompt}</p>
                <p className="mt-2 text-sm">คำตอบของเรา: {question.picked} · {question.correct ? "ถูกต้อง" : "ลองทบทวน"}</p>
                {!question.correct && <p className="mt-1 font-bold text-emerald-800">คำตอบที่ถูก: {question.correctAnswer}</p>}
                {question.explain && <p className="mt-2 text-sm text-gray-700">{question.explain}</p>}
              </li>
            ))}
          </ol>
        </section>
        {error && <p role="alert" className="text-red-700">{error}</p>}
        <button disabled={busy} onClick={() => start(result.exerciseId)} className={BIG + " mt-2 w-full bg-amber-500 text-gray-950"}>
          {busy ? "กำลังเตรียมโจทย์..." : "ลองชุดนี้อีกครั้ง ↻"}
        </button>
        <button disabled={busy} onClick={() => { setResult(null); setError(""); }} className={BIG + " w-full bg-white"}>
          เลือกแบบฝึกหัดชุดอื่น
        </button>
      </main>
    );
  }

  // ---------- กำลังทำแบบฝึกหัด ----------
  if (run) {
    const q = run.questions[run.index];
    const fb = run.feedback;
    const completed = run.index + (fb ? 1 : 0);
    if (exitRequested) return (
      <main className="mx-auto flex w-full max-w-xl flex-1 items-start p-6">
        <section role="alertdialog" aria-modal="true" aria-labelledby="exit-title" aria-describedby="exit-description" className="mt-8 w-full rounded-3xl bg-white p-6 text-center shadow-md" onKeyDown={(event) => { if (event.key === "Escape") setExitRequested(false); }}>
          <p className="text-5xl" aria-hidden="true">🌱</p>
          <h1 id="exit-title" className="mt-4 text-2xl font-bold">กลับไปเลือกชุดใหม่ไหม?</h1>
          <p id="exit-description" className="mt-3 text-gray-700">รอบนี้ยังไม่ได้คะแนน ถ้าเริ่มใหม่จะต้องทำตั้งแต่ข้อแรก</p>
          <button ref={exitCancel} onClick={() => setExitRequested(false)} className={BIG + " mt-6 w-full bg-sky-700 text-white"}>ทำต่อ</button>
          <button onClick={() => { setExitRequested(false); setRun(null); setError(""); }} className={BIG + " mt-3 w-full bg-amber-100 text-amber-950"}>กลับไปเลือกชุด</button>
        </section>
      </main>
    );
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 p-4 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <button onClick={leaveExercise} disabled={busy} className={BIG + " bg-white text-base"}>← เลือกชุดอื่น</button>
          <span className="rounded-full bg-amber-100 px-4 py-2 text-sm font-bold text-amber-900">ข้อ {run.index + 1} / {run.questions.length}</span>
        </div>
        <div>
          <p className="mb-2 font-bold text-gray-700">{run.title}</p>
          <div role="progressbar" aria-label="ความคืบหน้าแบบฝึกหัด" aria-valuemin={0} aria-valuemax={run.questions.length} aria-valuenow={completed} className="h-3 overflow-hidden rounded-full bg-amber-100">
            <div className="h-full rounded-full bg-amber-500 transition-all motion-reduce:transition-none" style={{ width: completed / run.questions.length * 100 + "%" }} />
          </div>
          <p className="mt-2 text-sm text-gray-600">ตอบแล้ว {completed} ข้อ · ค่อย ๆ คิด ไม่ต้องรีบ</p>
        </div>
        <h1 ref={questionHeading} tabIndex={-1} className="rounded-3xl border border-amber-100 bg-white px-5 py-8 text-center text-2xl font-bold shadow-md outline-none sm:text-3xl">{q.prompt}</h1>
        <p id="choice-help" className="text-center text-sm text-gray-600">{fb ? "อ่านเฉลย แล้วไปข้อต่อไปได้เลย" : "แตะคำตอบที่เลือก แล้วกด ยืนยันคำตอบ"}</p>
        <div className="grid grid-cols-2 gap-3" role="group" aria-label="ตัวเลือกคำตอบ" aria-describedby="choice-help">
          {q.choices.map((choice, i) => {
            const selected = run.selected === i;
            const color = fb ? (i === fb.answerIndex ? "border-emerald-600 bg-emerald-50" : i === fb.picked ? "border-amber-600 bg-amber-50" : "border-gray-100 bg-white text-gray-500") : selected ? "border-sky-600 bg-sky-50 text-sky-950" : "border-white bg-white";
            return (
              <button key={i} aria-pressed={selected} disabled={Boolean(fb) || busy} onClick={() => setRun({ ...run, selected: i })} className={"min-h-24 break-words rounded-2xl border-4 p-4 text-xl font-bold shadow-sm focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-sky-600 sm:text-2xl " + color}>
                <span className="mb-1 block text-xs font-medium text-gray-600">{["ก", "ข", "ค", "ง"][i]}</span>
                {choice}
                {fb && i === fb.answerIndex && <span className="mt-2 block text-sm text-emerald-800">✓ คำตอบที่ถูก</span>}
                {fb && i === fb.picked && i !== fb.answerIndex && <span className="mt-2 block text-sm text-amber-900">คำตอบของเรา</span>}
                {!fb && selected && <span className="mt-2 block text-sm">✓ เลือกแล้ว</span>}
              </button>
            );
          })}
        </div>
        {!fb && <button onClick={answer} disabled={busy || run.selected === null} className={BIG + " bg-sky-700 text-white"}>{busy ? "กำลังตรวจคำตอบ..." : "ยืนยันคำตอบ ✓"}</button>}
        {fb && (
          <>
            <div role="status" aria-live="polite" className={"rounded-2xl p-4 text-center text-xl font-bold " + (fb.correct ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-950")}>
              <p>{fb.correct ? "ถูกต้อง! 🎉" : "อีกนิดเดียว มาดูเฉลยกัน"}</p>
              {!fb.correct && <p className="mt-2">คำตอบที่ถูกคือ {q.choices[fb.answerIndex]}</p>}
              {fb.explain && <p className="mt-2 text-base font-normal text-gray-800">{fb.explain}</p>}
            </div>
            <button onClick={next} disabled={busy} className={BIG + " bg-amber-500 text-gray-950"}>{busy ? "กำลังบันทึก..." : run.index + 1 < run.questions.length ? "ข้อต่อไป →" : "ดูผล 🎉"}</button>
          </>
        )}
        {error && <p role="alert" className="rounded-2xl bg-red-50 p-3 text-center text-red-700">{error}</p>}
      </main>
    );
  }

  // ---------- หน้าหลัก ----------
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-5 p-4">
      <section className="flex items-center gap-4 rounded-3xl bg-white p-4 shadow-md">
        <AvatarSvg equipped={h.profile.equipped} size={120} />
        <div className="flex-1">
          <div className="text-xl font-bold">น้อง{h.student.nickname}</div>
          <div className="font-bold text-amber-600">
            Lv.{h.level.level} {h.level.title}
          </div>
          <div role="progressbar" aria-label="พลังเลเวล" aria-valuemin={0} aria-valuemax={h.level.needed} aria-valuenow={h.level.current} className="mt-2 h-4 overflow-hidden rounded-full bg-gray-200">
            <div className="h-full bg-amber-400" style={{ width: `${h.level.percent}%` }} />
          </div>
          <div className="mt-1 text-sm text-gray-500">
            พลัง {h.level.current}/{h.level.needed} XP
          </div>
          <div className="text-sm">
            🪙 {h.profile.coins} · 🔥 {h.profile.dayStreak} วัน
          </div>
        </div>
      </section>

      {h.profile.exercisesDone === 0 && tutorialStep < TUTORIAL.length && (
        <section className="rounded-3xl border-4 border-amber-300 bg-white p-5 text-center shadow-md">
          <div className="text-6xl">{TUTORIAL[tutorialStep].emoji}</div>
          <p className="mt-2 text-xl font-bold">{TUTORIAL[tutorialStep].text}</p>
          <div className="mt-3 flex justify-center gap-2">
            {TUTORIAL.map((t, i) => (
              <span key={t.emoji} className={`h-3 w-3 rounded-full ${i === tutorialStep ? "bg-amber-500" : "bg-gray-300"}`} />
            ))}
          </div>
          <button onClick={() => setTutorialStep(tutorialStep + 1)} className={`${BIG} mt-3 w-full bg-amber-500 text-white`}>
            {tutorialStep + 1 < TUTORIAL.length ? "ต่อไป →" : "เริ่มเลย! 🚀"}
          </button>
        </section>
      )}

      <nav aria-label="เมนูนักเรียน" className="grid grid-cols-4 gap-2">
        {(
          [
            ["learn", "✏️ ฝึก"],
            ["lessons", "🎬 คลิปสอน"],
            ["wardrobe", "👕 แต่งตัว"],
            ["shop", "🎁 แลกของ"],
          ] as const
        ).map(([key, label]) => (
          <button key={key} aria-pressed={tab === key} onClick={() => setTab(key)} className={`min-h-16 rounded-2xl p-3 text-lg font-bold ${tab === key ? "bg-amber-500 text-white" : "bg-white"}`}>
            {label}
          </button>
        ))}
      </nav>
      {error && <p className="rounded-2xl bg-red-50 p-3 text-center text-red-700">{error}</p>}

      {tab === "lessons" && (
        <LessonsView
          onPractice={(topic) => {
            setSubject("all");
            setFilter("all");
            setSearch(topic);
            setTab("learn");
          }}
        />
      )}

      {tab === "learn" && (
        <>
          {h.limitReached ? (
            <p className="rounded-2xl bg-sky-100 p-4 text-center text-sky-800">🌙 วันนี้เก็บพลังครบแล้ว! ฝึกต่อได้ แต่จะไม่ได้ XP และเหรียญเพิ่ม พรุ่งนี้มาใหม่นะ</p>
          ) : (
            <p className="text-center text-sm text-gray-500">
              วันนี้ทำไปแล้ว {h.todayQuestions}/{h.dailyLimitQuestions} ข้อ
            </p>
          )}
          <section className="rounded-3xl bg-white p-4 shadow-sm" aria-label="ค้นหาแบบฝึกหัด">
            <h1 className="text-2xl font-bold">วันนี้อยากฝึกอะไร?</h1>
            <p className="mt-1 text-sm text-gray-600">แบบฝึกหัด {gradeLabel(h.student.grade)} · เลือกฝึกทีละชุดได้เลย</p>
            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5" role="group" aria-label="เลือกวิชา">
              {["all", ...Object.keys(SUBJECT_NAMES)].map((key) => <button key={key} aria-pressed={subject === key} onClick={() => setSubject(key)} className={"min-h-16 rounded-2xl border-2 px-2 py-3 text-sm font-bold focus-visible:outline-4 focus-visible:outline-sky-600 " + (subject === key ? "border-sky-700 bg-sky-50 text-sky-900" : "border-gray-100 bg-white")}>
                {key === "all" ? "📚 ทั้งหมด" : SUBJECT_EMOJI[key] + " " + SUBJECT_NAMES[key]}
              </button>)}
            </div>
            <label className="mt-4 block text-sm font-bold" htmlFor="exercise-search">ค้นหาชื่อชุดหรือหัวข้อ</label>
            <input id="exercise-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="เช่น การบวก หรือ Animals" className="mt-2 min-h-16 w-full rounded-2xl border-2 border-gray-200 bg-white px-4 focus:border-sky-600 focus:outline-none" />
            <label className="mt-3 block text-sm font-bold" htmlFor="exercise-filter">เลือกงานที่อยากทำ</label>
            <select id="exercise-filter" value={filter} onChange={(event) => setFilter(event.target.value as ExerciseFilter)} className="mt-2 min-h-16 w-full rounded-2xl border-2 border-gray-200 bg-white px-4">
              <option value="all">ทุกชุด</option><option value="homework">📌 การบ้าน</option><option value="new">✨ ยังไม่เคยทำ</option><option value="review">↻ ชุดที่ยังได้คะแนนไม่เต็ม</option>
            </select>
          </section>
          <p role="status" className="text-sm text-gray-600">พบ {shown.length} ชุด{filter === "homework" ? " · เรียงตามวันส่ง" : " · การบ้านขึ้นก่อน"}</p>
          <section className="grid gap-3" aria-label="รายการแบบฝึกหัด">
            {shown.length === 0 && <div className="rounded-3xl bg-white p-6 text-center">
              <p className="text-3xl" aria-hidden="true">🔎</p>
              <p className="mt-2 font-bold">{h.exercises.length ? "ยังไม่พบชุดที่ตรงกับที่เลือก" : "ครูกำลังเตรียมแบบฝึกหัดให้เรา"}</p>
              <button onClick={() => { setSubject("all"); setFilter("all"); setSearch(""); }} className={BIG + " mt-4 bg-sky-50 text-sky-900"}>ดูทุกชุด</button>
            </div>}
            {shown.map((ex) => (
              <button key={ex.id} disabled={busy} onClick={() => start(ex.id)} className={"flex min-h-24 items-center gap-3 rounded-3xl border-2 bg-white p-4 text-left shadow-sm active:scale-95 focus-visible:outline-4 focus-visible:outline-sky-600 " + (ex.homeworkDue ? "border-pink-300" : "border-transparent")}>
                <span className="text-4xl" aria-hidden="true">{SUBJECT_EMOJI[ex.subject]}</span>
                <span className="min-w-0 flex-1">
                  {ex.homeworkDue && <span className="mb-1 block text-sm font-bold text-pink-800">📌 {ex.homeworkDue < h.today ? "เลยกำหนดแล้ว · " : ex.homeworkDue === h.today ? "ส่งวันนี้ · " : "ส่งภายใน "}{thaiDate(ex.homeworkDue)}</span>}
                  <span className="block text-lg font-bold">{ex.title}</span>
                  <span className="block text-sm text-gray-600">{ex.topic} · {ex.count} ข้อ</span>
                  <span className="mt-2 block text-sm font-bold text-sky-800">{ex.best === null ? "✨ ยังไม่เคยทำ" : ex.best === ex.count ? "🏆 เคยทำได้เต็มแล้ว" : "คะแนนดีที่สุด " + ex.best + "/" + ex.count}</span>
                </span>
                <span aria-hidden="true" className="text-2xl text-gray-500">→</span>
              </button>
            ))}
          </section>
          <section className="rounded-3xl bg-white p-4 shadow-sm" aria-label="ประวัติการฝึก">
            <h2 className="text-xl font-bold">ฝึกล่าสุดของเรา</h2>
            {h.recentAttempts.length === 0 ? <p className="mt-3 text-sm text-gray-600">ทำจบชุดแรกเมื่อไร ผลจะมาอยู่ตรงนี้นะ</p> : <ol className="mt-3 divide-y divide-gray-100">
              {h.recentAttempts.map((attempt) => <li key={attempt.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0"><p className="font-bold">{attempt.title}</p><p className="text-xs text-gray-600">{thaiDate(attempt.date)} · {attempt.counted ? "+" + attempt.xpEarned + " XP" : "ฝึกเพิ่ม ไม่นับคะแนน"}</p></div>
                <span className="shrink-0 rounded-xl bg-sky-50 px-3 py-2 font-bold text-sky-900">{attempt.correct}/{attempt.total}</span>
              </li>)}
            </ol>}
            {h.recentAttempts.length > 0 && <p className="mt-2 text-xs text-gray-500">แสดงไม่เกิน 10 รอบล่าสุด</p>}
          </section>
          <section>
            <h2 className="mb-2 text-lg font-bold">ความสำเร็จของเรา</h2>
            <ul className="grid gap-2">
              {h.achievements.map((a) => (
                <li key={a.id} className={`flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ${a.done ? "" : "opacity-50"}`}>
                  <span className="text-2xl">{a.done ? a.emoji : "🔒"}</span>
                  <span className="flex-1">
                    <b>{a.name}</b>
                    <span className="block text-xs text-gray-500">{a.description}</span>
                  </span>
                  <span className="text-sm">+{a.coins} 🪙</span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      {tab === "wardrobe" && (
        <section className="grid grid-cols-3 gap-3">
          {h.items.map((item) => {
            const on = h.profile.equipped[item.slot] === item.id;
            const how = item.unlock.level ? `Lv.${item.unlock.level}` : h.achievements.find((a) => a.id === item.unlock.achievementId)?.name;
            return (
              <button
                key={item.id}
                disabled={!item.owned || busy}
                onClick={() => equip(item.slot, on ? null : item.id)}
                aria-pressed={on}
                className={`min-h-16 rounded-2xl p-3 text-center shadow-sm ${on ? "bg-amber-200" : "bg-white"} ${item.owned ? "active:scale-95" : "opacity-50"}`}
              >
                <div className="text-4xl">{item.owned ? item.emoji : "🔒"}</div>
                <div className="text-sm font-medium">{item.name}</div>
                {!item.owned && how && <div className="text-xs text-gray-500">ปลดล็อก: {how}</div>}
              </button>
            );
          })}
        </section>
      )}

      {tab === "shop" && (
        <section className="grid gap-3">
          <p className="text-center text-lg">
            มี <b>{shop.data?.coins ?? h.profile.coins}</b> 🪙
          </p>
          {shop.data?.rewards.length === 0 && <p className="text-center text-gray-500">ยังไม่มีของรางวัลให้แลก</p>}
          {shop.data?.rewards.map((r) => (
            <div key={r.id} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
              <span className="flex-1">
                <b className="text-lg">{r.name}</b>
                <span className="block text-sm text-gray-500">เหลือ {r.stock} ชิ้น</span>
              </span>
              <button disabled={busy || shop.data!.coins < r.costCoins} onClick={() => redeem(r.id, r.name)} className="min-h-16 rounded-2xl bg-amber-500 px-4 py-3 font-bold text-gray-950 active:scale-95 disabled:opacity-40">
                {r.costCoins} 🪙
              </button>
            </div>
          ))}
          {shop.data && shop.data.redemptions.length > 0 && (
            <>
              <h2 className="mt-2 text-lg font-bold">ของที่แลกไว้</h2>
              {shop.data.redemptions.map((r) => (
                <div key={r.id} className="flex justify-between rounded-2xl bg-white p-3 text-sm shadow-sm">
                  <span>{r.rewardName}</span>
                  <span className="text-gray-600">{RED[r.status]}</span>
                </div>
              ))}
            </>
          )}
        </section>
      )}

      <button
        className="min-h-16 text-sm text-gray-600 underline"
        onClick={async () => {
          await api("auth/logout", {});
          go("/play/login");
        }}
      >
        ออกจากระบบ
      </button>
    </main>
  );
}
