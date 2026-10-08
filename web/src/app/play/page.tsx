"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ACHIEVEMENTS,
  AVATAR_ITEMS,
  applyRun,
  isDailyLimitReached,
  levelProgress,
  newProfile,
  powerTitle,
  type RunResult,
} from "@/lib/gamification";
import { SAMPLE_EXERCISES } from "@/lib/sample-data";
import type { AvatarItem, Exercise, PlayerProfile } from "@/lib/types";

// DEMO: เก็บ profile ใน localStorage ของเครื่อง — รอบ R6 จะย้ายไป Firestore + คิดคะแนนฝั่ง server
const STORAGE_KEY = "buk-demo-profile";

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function Avatar({ profile }: { profile: PlayerProfile }) {
  const equipped = Object.values(profile.equipped)
    .map((id) => AVATAR_ITEMS.find((i) => i.id === id))
    .filter((i): i is AvatarItem => Boolean(i));
  return <div className="text-6xl">{equipped.map((i) => i.emoji).join("")}</div>;
}

export default function PlayPage() {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [result, setResult] = useState<RunResult | null>(null);
  const [startedAt, setStartedAt] = useState(0);

  useEffect(() => {
    let saved: PlayerProfile | null = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) saved = JSON.parse(raw);
    } catch {}
    // eslint-disable-next-line react-hooks/set-state-in-effect -- โหลดจาก localStorage หลัง hydrate
    setProfile(saved ?? newProfile("demo"));
  }, []);

  function save(next: PlayerProfile) {
    setProfile(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }

  function start(ex: Exercise) {
    setExercise(ex);
    setIndex(0);
    setCorrect(0);
    setPicked(null);
    setResult(null);
    setStartedAt(Date.now());
  }

  function next() {
    if (!exercise || !profile || picked === null) return;
    const nowCorrect = correct + (picked === exercise.questions[index].answerIndex ? 1 : 0);
    if (index + 1 < exercise.questions.length) {
      setCorrect(nowCorrect);
      setIndex(index + 1);
      setPicked(null);
      return;
    }
    const durationSec = Math.round((Date.now() - startedAt) / 1000);
    const run = applyRun(profile, nowCorrect, exercise.questions.length, durationSec, today());
    setCorrect(nowCorrect);
    setResult(run);
    save(run.profile);
  }

  function equip(item: AvatarItem) {
    if (!profile) return;
    const equipped = { ...profile.equipped };
    if (equipped[item.slot] === item.id && item.slot !== "body") delete equipped[item.slot];
    else equipped[item.slot] = item.id;
    save({ ...profile, equipped });
  }

  if (!profile) return <main className="flex-1 p-6 text-center">กำลังโหลด...</main>;

  const progress = levelProgress(profile.xp);

  // ---------- สรุปผล ----------
  if (exercise && result) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center gap-4 p-6 text-center">
        <Avatar profile={result.profile} />
        <h1 className="text-3xl font-bold">
          ถูก {correct} / {exercise.questions.length} ข้อ
        </h1>
        {result.counted ? (
          <p className="text-xl text-amber-600">
            +{result.xpEarned} XP · +{result.coinsEarned} 🪙
          </p>
        ) : (
          <p className="text-gray-500">วันนี้เก็บพลังครบแล้ว รอบนี้เป็นการฝึกเพิ่ม ไม่นับคะแนน</p>
        )}
        {result.leveledUp && <p className="text-2xl font-bold text-pink-600">⚡ เลเวลอัป! Lv.{levelProgress(result.profile.xp).level}</p>}
        {result.newAchievements.map((a) => (
          <p key={a.id} className="w-full rounded-2xl bg-white p-3 shadow-sm">
            {a.emoji} ปลดล็อก achievement: <b>{a.name}</b>
          </p>
        ))}
        {result.newItems.map((i) => (
          <p key={i.id} className="w-full rounded-2xl bg-white p-3 shadow-sm">
            {i.emoji} ได้ของแต่งตัวใหม่: <b>{i.name}</b>
          </p>
        ))}
        <button onClick={() => setExercise(null)} className="mt-4 w-full rounded-2xl bg-amber-500 p-4 text-xl font-bold text-white active:scale-95">
          กลับหน้าหลัก
        </button>
      </main>
    );
  }

  // ---------- กำลังทำแบบฝึกหัด ----------
  if (exercise) {
    const q = exercise.questions[index];
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 p-6">
        <div className="text-sm text-gray-500">
          {exercise.title} · ข้อ {index + 1}/{exercise.questions.length}
        </div>
        <h1 className="rounded-3xl bg-white p-8 text-center text-3xl font-bold shadow-md">{q.prompt}</h1>
        <div className="grid grid-cols-2 gap-3">
          {q.choices.map((choice, i) => {
            const state =
              picked === null ? "bg-white" : i === q.answerIndex ? "bg-green-200" : i === picked ? "bg-red-200" : "bg-white opacity-50";
            return (
              <button
                key={i}
                disabled={picked !== null}
                onClick={() => setPicked(i)}
                className={`min-h-20 rounded-2xl p-4 text-2xl font-bold shadow-sm active:scale-95 ${state}`}
              >
                {choice}
              </button>
            );
          })}
        </div>
        {picked !== null && (
          <button onClick={next} className="rounded-2xl bg-amber-500 p-4 text-xl font-bold text-white active:scale-95">
            {index + 1 < exercise.questions.length ? "ข้อต่อไป →" : "ดูผล 🎉"}
          </button>
        )}
      </main>
    );
  }

  // ---------- หน้าหลักนักเรียน ----------
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 p-6">
      <Link href="/" className="text-sm text-amber-700">← หน้าแรก</Link>

      <section className="rounded-3xl bg-white p-6 text-center shadow-md">
        <Avatar profile={profile} />
        <div className="mt-2 text-xl font-bold">
          Lv.{progress.level} {powerTitle(progress.level)}
        </div>
        <div className="mt-3 h-4 overflow-hidden rounded-full bg-gray-200">
          <div className="h-full bg-amber-400" style={{ width: `${progress.percent}%` }} />
        </div>
        <div className="mt-1 text-sm text-gray-500">
          พลัง {progress.current}/{progress.needed} XP · 🪙 {profile.coins} · 🔥 {profile.dayStreak} วัน
        </div>
      </section>

      {isDailyLimitReached(profile, today()) && (
        <p className="rounded-2xl bg-sky-100 p-4 text-center text-sky-800">
          🌙 วันนี้เก็บพลังครบแล้ว! ฝึกต่อได้ แต่จะไม่ได้ XP และเหรียญเพิ่ม พรุ่งนี้มาใหม่นะ
        </p>
      )}

      <section>
        <h2 className="mb-2 text-lg font-bold">แบบฝึกหัด</h2>
        <div className="grid gap-3">
          {SAMPLE_EXERCISES.map((ex) => (
            <button key={ex.id} onClick={() => start(ex)} className="rounded-2xl bg-white p-4 text-left shadow-sm active:scale-95">
              <div className="text-lg font-bold">{ex.title}</div>
              <div className="text-sm text-gray-500">
                ป.{ex.grade} · {ex.questions.length} ข้อ
              </div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-bold">ตู้เสื้อผ้า</h2>
        <div className="grid grid-cols-3 gap-3">
          {AVATAR_ITEMS.map((item) => {
            const owned = profile.ownedItemIds.includes(item.id);
            const on = profile.equipped[item.slot] === item.id;
            return (
              <button
                key={item.id}
                disabled={!owned}
                onClick={() => equip(item)}
                className={`rounded-2xl p-3 text-center shadow-sm ${on ? "bg-amber-200" : "bg-white"} ${owned ? "active:scale-95" : "opacity-40"}`}
              >
                <div className="text-3xl">{owned ? item.emoji : "🔒"}</div>
                <div className="text-xs">{item.name}</div>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-lg font-bold">Achievement</h2>
        <ul className="grid gap-2">
          {ACHIEVEMENTS.map((a) => {
            const done = profile.achievementIds.includes(a.id);
            return (
              <li key={a.id} className={`flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ${done ? "" : "opacity-50"}`}>
                <span className="text-2xl">{done ? a.emoji : "🔒"}</span>
                <span className="flex-1">
                  <b>{a.name}</b>
                  <span className="block text-xs text-gray-500">{a.description}</span>
                </span>
                <span className="text-sm">+{a.coins} 🪙</span>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
