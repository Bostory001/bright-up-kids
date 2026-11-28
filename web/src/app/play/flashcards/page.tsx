"use client";

import Link from "next/link";
import { useState } from "react";
import { HSK1_EXAMPLES } from "@/lib/hsk1-examples";
import { HSK1_LESSONS, type Word } from "@/lib/hsk1-words";

// Flashcard ท่องศัพท์ HSK1 — ข้อมูลคำไม่ใช่ความลับ จึงอ่านจากไฟล์ในแอปตรง ๆ ไม่เรียก API
// สถานะ "จำได้/ยังไม่จำ" เก็บแค่ในหน้านี้ (ไม่บันทึกข้อมูลเด็ก ไม่ให้เหรียญ/XP)

const BIG = "min-h-16 rounded-2xl px-4 text-lg font-bold shadow-sm active:scale-95 focus-visible:outline-4 focus-visible:outline-sky-600";

function shuffled<T>(list: T[]): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function speakZh(text: string) {
  try {
    const s = window.speechSynthesis;
    if (!s) return;
    s.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/（.*?）/g, ""));
    u.lang = "zh-CN";
    u.rate = 0.8;
    s.speak(u);
  } catch { /* เครื่องไม่รองรับเสียงจีนก็แค่ไม่ดัง */ }
}

function Deck({ title, words, onBack }: { title: string; words: Word[]; onBack: () => void }) {
  const [queue, setQueue] = useState<Word[]>(() => shuffled(words));
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const total = words.length;
  const card = queue[0];

  function answer(gotIt: boolean) {
    setFlipped(false);
    if (gotIt) setKnown((k) => k + 1);
    // ยังไม่จำ = ส่งไปท้ายกอง วนมาถามใหม่จนกว่าจะจำได้ทุกใบ
    setQueue((q) => (gotIt ? q.slice(1) : [...q.slice(1), q[0]]));
  }
  function restart() {
    setQueue(shuffled(words));
    setKnown(0);
    setFlipped(false);
  }

  return (
    <div className="mx-auto grid max-w-xl gap-4 p-4">
      <button onClick={onBack} className="justify-self-start text-sky-800 underline">← เลือกบทอื่น</button>
      <h1 className="text-xl font-bold">{title}</h1>
      <div role="progressbar" aria-label="ความคืบหน้า" aria-valuemin={0} aria-valuemax={total} aria-valuenow={known} className="h-4 overflow-hidden rounded-full bg-gray-200">
        <div className="h-full bg-emerald-500" style={{ width: `${(known / total) * 100}%` }} />
      </div>
      <p className="text-center text-sm text-gray-600">จำได้แล้ว {known}/{total} คำ</p>

      {card ? (
        <>
          <button
            onClick={() => { setFlipped(!flipped); if (!flipped) speakZh(card.zh); }}
            aria-label={flipped ? "ซ่อนคำตอบ" : "แตะเพื่อดูคำตอบ"}
            className="grid min-h-72 place-items-center rounded-3xl border-4 border-red-200 bg-white p-6 text-center shadow-md active:scale-[0.98] focus-visible:outline-4 focus-visible:outline-sky-600"
          >
            {flipped ? (
              <span className="grid gap-3">
                <span className="text-4xl font-bold text-red-800">{card.zh}</span>
                <span className="text-3xl text-sky-800">{card.py}</span>
                <span className="text-2xl text-gray-900">{card.th}</span>
                {(HSK1_EXAMPLES[card.zh] ?? []).slice(0, 1).map((e) => (
                  <span key={e.zh} className="mt-2 grid gap-1 rounded-2xl bg-amber-50 p-3 text-left">
                    <span className="text-xl text-red-900">{e.zh}</span>
                    <span className="text-base text-sky-800">{e.py}</span>
                    <span className="text-base text-gray-700">{e.th}</span>
                  </span>
                ))}
              </span>
            ) : (
              <span className="grid gap-3">
                <span className="text-8xl font-bold text-red-800">{card.zh}</span>
                <span className="text-base text-gray-500">แตะเพื่อดูพินอิน + ความหมาย 👆</span>
              </span>
            )}
          </button>
          <button onClick={() => speakZh(card.zh)} className={BIG + " bg-amber-200 text-amber-950"}>🔊 ฟังเสียงจีน</button>
          {flipped ? (
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => answer(false)} className={BIG + " bg-rose-100 text-rose-900"}>🔁 ยังไม่จำ</button>
              <button onClick={() => answer(true)} className={BIG + " bg-emerald-500 text-white"}>✅ จำได้</button>
            </div>
          ) : (
            <p className="text-center text-sm text-gray-500">ลองนึกความหมายในใจก่อน แล้วค่อยแตะการ์ด</p>
          )}
        </>
      ) : (
        <div className="grid gap-3 rounded-3xl bg-white p-6 text-center shadow-md">
          <div className="text-6xl">🎉</div>
          <p className="text-xl font-bold">เก่งมาก! จำครบ {total} คำแล้ว</p>
          <button onClick={restart} className={BIG + " bg-amber-500 text-gray-950"}>ท่องอีกรอบ</button>
          <button onClick={onBack} className={BIG + " bg-white text-sky-900 border-2 border-sky-200"}>เลือกบทอื่น</button>
        </div>
      )}
    </div>
  );
}

export default function FlashcardsPage() {
  const [pick, setPick] = useState<number | "all" | null>(null);

  if (pick !== null) {
    const words = pick === "all" ? HSK1_LESSONS.flatMap((l) => l.words) : HSK1_LESSONS[pick].words;
    const title = pick === "all" ? "ทุกบท (150 คำ)" : HSK1_LESSONS[pick].title;
    // key เปลี่ยนเมื่อเลือกบทใหม่ เพื่อรีเซ็ตกองการ์ด
    return <Deck key={String(pick)} title={title} words={words} onBack={() => setPick(null)} />;
  }

  return (
    <div className="mx-auto grid max-w-xl gap-3 p-4">
      <Link href="/play" className="justify-self-start text-sky-800 underline">← กลับหน้าเรียน</Link>
      <h1 className="text-2xl font-bold">🀄 Flashcard ท่องศัพท์ HSK1</h1>
      <p className="text-gray-600">เลือกบทที่อยากท่อง · ฝึกเล่นได้ไม่จำกัด ไม่นับโควตาโจทย์ประจำวัน</p>
      <button onClick={() => setPick("all")} className={BIG + " bg-amber-500 text-gray-950"}>ท่องทุกบท (150 คำ) 🎲</button>
      {HSK1_LESSONS.map((l, i) => (
        <button key={l.title} onClick={() => setPick(i)} className={BIG + " flex items-center justify-between bg-white text-left"}>
          <span>{l.title.replace("HSK1 ", "")}</span>
          <span className="text-sm font-normal text-gray-500">{l.words.length} คำ</span>
        </button>
      ))}
    </div>
  );
}
