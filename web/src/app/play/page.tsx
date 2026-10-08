"use client";

import { useEffect, useState } from "react";
import { AvatarSvg } from "@/components/AvatarSvg";
import { api, go, useLoad } from "@/lib/client/api";
import type { AvatarSlot, PlayerProfile, Redemption } from "@/lib/types";

interface Home {
  student: { nickname: string; code: string; grade: number };
  profile: PlayerProfile;
  level: { level: number; current: number; needed: number; percent: number; title: string };
  limitReached: boolean;
  todayQuestions: number;
  dailyLimitQuestions: number;
  exercises: { id: string; title: string; subject: string; topic: string; count: number; best: number | null }[];
  achievements: { id: string; name: string; description: string; emoji: string; coins: number; done: boolean }[];
  items: { id: string; slot: AvatarSlot; name: string; emoji: string; owned: boolean; unlock: { level?: number; achievementId?: string } }[];
}
interface Run {
  attemptId: string;
  title: string;
  questions: { prompt: string; choices: string[] }[];
  index: number;
  feedback: { picked: number; correct: boolean; answerIndex: number; explain?: string } | null;
}
interface Result {
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
  redemptions: Redemption[];
}

const SUBJECT_EMOJI: Record<string, string> = { math: "🔢", thai: "📖", english: "🔤", science: "🔬" };
const RED = { requested: "รอรับที่สถาบัน", handed_over: "รับแล้ว", rejected: "ไม่อนุมัติ (คืนเหรียญแล้ว)" };
const BIG = "rounded-3xl p-4 text-xl font-bold shadow-md active:scale-95 disabled:opacity-40";

export default function PlayPage() {
  const me = useLoad<{ me: { role: string } | null }>("me");
  const isStudent = me.data?.me?.role === "student";
  const home = useLoad<Home>(isStudent ? "play/home" : null);
  const [tab, setTab] = useState<"learn" | "wardrobe" | "shop">("learn");
  const shop = useLoad<Shop>(isStudent && tab === "shop" ? "play/rewards" : null);
  const [run, setRun] = useState<Run | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (me.data && !isStudent) go("/play/login");
  }, [me.data, isStudent]);

  async function act(fn: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const start = (exerciseId: string) =>
    act(async () => {
      const res = await api("play/start", { exerciseId });
      setResult(null);
      setRun({ ...res, index: 0, feedback: null });
    });

  const answer = (choice: number) =>
    act(async () => {
      if (!run || run.feedback) return;
      const res = await api("play/answer", { attemptId: run.attemptId, index: run.index, choice });
      setRun({ ...run, feedback: { picked: choice, ...res } });
    });

  const next = () =>
    act(async () => {
      if (!run) return;
      if (run.index + 1 < run.questions.length) return setRun({ ...run, index: run.index + 1, feedback: null });
      setResult(await api("play/finish", { attemptId: run.attemptId }));
      setRun(null);
      home.reload();
    });

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

  if (!isStudent || !home.data) return <main className="flex-1 p-6 text-center text-gray-500">{home.error ?? "กำลังโหลด..."}</main>;
  const h = home.data;

  // ---------- สรุปผล ----------
  if (result) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center gap-4 p-6 text-center">
        <AvatarSvg equipped={h.profile.equipped} />
        <h1 className="text-3xl font-bold">
          ถูก {result.correct} / {result.total} ข้อ
        </h1>
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
            {a.emoji} ปลดล็อก achievement: <b>{a.name}</b>
          </p>
        ))}
        {result.newItems.map((i) => (
          <p key={i.name} className="w-full rounded-2xl bg-white p-3 shadow-sm">
            {i.emoji} ได้ของแต่งตัวใหม่: <b>{i.name}</b>
          </p>
        ))}
        <button onClick={() => setResult(null)} className={`${BIG} mt-4 w-full bg-amber-500 text-white`}>
          กลับหน้าหลัก
        </button>
      </main>
    );
  }

  // ---------- กำลังทำแบบฝึกหัด ----------
  if (run) {
    const q = run.questions[run.index];
    const fb = run.feedback;
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 p-6">
        <div className="text-sm text-gray-500">
          {run.title} · ข้อ {run.index + 1}/{run.questions.length}
        </div>
        <h1 className="rounded-3xl bg-white p-8 text-center text-3xl font-bold shadow-md">{q.prompt}</h1>
        <div className="grid grid-cols-2 gap-3">
          {q.choices.map((choice, i) => {
            const color = !fb ? "bg-white" : i === fb.answerIndex ? "bg-green-200" : i === fb.picked ? "bg-red-200" : "bg-white opacity-50";
            return (
              <button key={i} disabled={Boolean(fb) || busy} onClick={() => answer(i)} className={`min-h-20 rounded-2xl p-4 text-2xl font-bold shadow-sm active:scale-95 ${color}`}>
                {choice}
              </button>
            );
          })}
        </div>
        {fb && (
          <>
            <p className={`rounded-2xl p-3 text-center text-xl font-bold ${fb.correct ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {fb.correct ? "ถูกต้อง! 🎉" : "ยังไม่ถูก ลองดูเฉลยนะ"}
              {fb.explain && <span className="mt-1 block text-base font-normal text-gray-700">{fb.explain}</span>}
            </p>
            <button onClick={next} disabled={busy} className={`${BIG} bg-amber-500 text-white`}>
              {run.index + 1 < run.questions.length ? "ข้อต่อไป →" : "ดูผล 🎉"}
            </button>
          </>
        )}
        {error && <p className="text-center text-red-600">{error}</p>}
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
          <div className="mt-2 h-4 overflow-hidden rounded-full bg-gray-200">
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

      <nav className="grid grid-cols-3 gap-2">
        {(
          [
            ["learn", "✏️ ฝึก"],
            ["wardrobe", "👕 แต่งตัว"],
            ["shop", "🎁 แลกของ"],
          ] as const
        ).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} className={`rounded-2xl p-3 text-lg font-bold ${tab === key ? "bg-amber-500 text-white" : "bg-white"}`}>
            {label}
          </button>
        ))}
      </nav>
      {error && <p className="rounded-2xl bg-red-50 p-3 text-center text-red-700">{error}</p>}

      {tab === "learn" && (
        <>
          {h.limitReached ? (
            <p className="rounded-2xl bg-sky-100 p-4 text-center text-sky-800">🌙 วันนี้เก็บพลังครบแล้ว! ฝึกต่อได้ แต่จะไม่ได้ XP และเหรียญเพิ่ม พรุ่งนี้มาใหม่นะ</p>
          ) : (
            <p className="text-center text-sm text-gray-500">
              วันนี้ทำไปแล้ว {h.todayQuestions}/{h.dailyLimitQuestions} ข้อ
            </p>
          )}
          <section className="grid gap-3">
            {h.exercises.length === 0 && <p className="text-center text-gray-500">ยังไม่มีแบบฝึกหัดสำหรับ ป.{h.student.grade}</p>}
            {h.exercises.map((ex) => (
              <button key={ex.id} disabled={busy} onClick={() => start(ex.id)} className="flex items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-sm active:scale-95">
                <span className="text-4xl">{SUBJECT_EMOJI[ex.subject]}</span>
                <span className="flex-1">
                  <span className="block text-lg font-bold">{ex.title}</span>
                  <span className="text-sm text-gray-500">
                    {ex.topic} · {ex.count} ข้อ
                  </span>
                </span>
                {ex.best !== null && (
                  <span className="text-sm font-bold text-green-600">
                    {ex.best === ex.count ? "💯" : `${ex.best}/${ex.count}`}
                  </span>
                )}
              </button>
            ))}
          </section>
          <section>
            <h2 className="mb-2 text-lg font-bold">Achievement</h2>
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
                className={`rounded-2xl p-3 text-center shadow-sm ${on ? "bg-amber-200" : "bg-white"} ${item.owned ? "active:scale-95" : "opacity-50"}`}
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
              <button disabled={busy || shop.data!.coins < r.costCoins} onClick={() => redeem(r.id, r.name)} className="rounded-2xl bg-amber-500 px-4 py-3 font-bold text-white active:scale-95 disabled:opacity-40">
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
        className="text-sm text-gray-400 underline"
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
