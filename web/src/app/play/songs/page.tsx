"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { SONGS } from "@/lib/songs";
import { HSK1_LESSONS } from "@/lib/hsk1-words";

// หน้าเรียนจีนจากเพลง (ต้นแบบ): วิดีโอ + เนื้อเพลง 3 บรรทัด (จีน/พินอิน/ไทย) ไฮไลต์ตามเวลา แตะบรรทัดเพื่อกระโดด
// ไม่เรียก API ไม่มี XP — คำ HSK1 ในเนื้อเพลงขีดเส้นใต้

const HSK_WORDS = HSK1_LESSONS.flatMap((l) => l.words.map((w) => w.zh.replace(/（.*）/, ""))).sort((a, b) => b.length - a.length);

function Marked({ zh }: { zh: string }) {
  const parts: { t: string; hsk: boolean }[] = [];
  let i = 0;
  while (i < zh.length) {
    const hit = HSK_WORDS.find((w) => w && zh.startsWith(w, i));
    if (hit) { parts.push({ t: hit, hsk: true }); i += hit.length; } else { parts.push({ t: zh[i], hsk: false }); i++; }
  }
  return <>{parts.map((p, k) => (p.hsk ? <u key={k} className="decoration-amber-500 decoration-2 underline-offset-4">{p.t}</u> : <span key={k}>{p.t}</span>))}</>;
}

export default function SongsPage() {
  const [songId, setSongId] = useState(SONGS[0].id);
  const song = SONGS.find((x) => x.id === songId) ?? SONGS[0];
  const vref = useRef<HTMLVideoElement>(null);
  const [now, setNow] = useState(0);
  const [slow, setSlow] = useState(false);
  const [loop, setLoop] = useState(false);
  function pick(id: string) { setSongId(id); setNow(0); setLoop(false); window.scrollTo({ top: 0 }); }
  const active = useMemo(() => song.lines.findIndex((l) => now >= l.start && now < l.end), [now, song]);

  useEffect(() => { if (vref.current) vref.current.playbackRate = slow ? 0.75 : 1; }, [slow]);

  function seek(i: number) {
    const v = vref.current; if (!v) return;
    v.currentTime = song.lines[i].start; void v.play();
  }
  function onTime() {
    const v = vref.current; if (!v) return;
    setNow(v.currentTime);
    if (loop && active >= 0 && v.currentTime >= song.lines[active].end - 0.05) v.currentTime = song.lines[active].start;
  }

  return (
    <main className="mx-auto max-w-4xl p-4">
      <Link href="/play" className="text-sm text-amber-700">← กลับ</Link>
      <h1 className="mt-2 text-xl font-bold">🎵 เรียนจีนจากเพลง</h1>
      <div className="my-2 flex gap-2 overflow-x-auto pb-2">
        {SONGS.map((x, i) => (
          <button key={x.id} onClick={() => pick(x.id)} className={`shrink-0 rounded-full border px-3 py-1 text-sm ${x.id === song.id ? "bg-amber-500 text-white" : "bg-white"}`}>{i + 1}. {x.title.split(" (")[0]}</button>
        ))}
      </div>
      <p className="text-sm text-gray-600">{song.title}</p>
      <p className="mb-2 text-xs text-gray-400">{song.artist}</p>
      <div className="lg:grid lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start lg:gap-6">
        <div className="sticky top-0 z-10 -mx-4 bg-amber-50/95 px-4 pb-1 pt-2 backdrop-blur lg:top-4 lg:mx-0 lg:rounded-2xl lg:px-0">
        <video key={song.id} ref={vref} src={song.video} controls playsInline onTimeUpdate={onTime} className="max-h-[28vh] w-full rounded-2xl bg-black lg:max-h-[60vh]" />
        <div className="my-3 flex gap-2">
          <button onClick={() => setSlow((s) => !s)} className={`rounded-full border px-3 py-1 text-sm ${slow ? "bg-amber-500 text-white" : "bg-white"}`}>🐢 ช้า 0.75x</button>
          <button onClick={() => setLoop((s) => !s)} className={`rounded-full border px-3 py-1 text-sm ${loop ? "bg-amber-500 text-white" : "bg-white"}`}>🔁 วนบรรทัดนี้</button>
        </div>
        </div>
      <ul className="space-y-2">
        {song.lines.map((l, i) => (
          <li key={i}>
            <button onClick={() => seek(i)} className={`w-full rounded-xl border p-3 text-left transition ${i === active ? "border-amber-500 bg-amber-100 shadow" : "bg-white"}`}>
              <div className="text-xl font-semibold"><Marked zh={l.zh} /></div>
              <div className="text-sm text-amber-700">{l.py}</div>
              <div className="text-sm text-gray-700">{l.th}</div>
              {l.check && <div className="mt-1 text-xs text-red-600">⚠ ต้องตรวจเนื้อเพลง</div>}
            </button>
          </li>
        ))}
      </ul>
      </div>
      <p className="mt-4 text-xs text-gray-400">ขีดเส้นใต้ = คำศัพท์ HSK1 · เนื้อ/คำแปลเป็นร่าง รอครูตรวจ</p>
    </main>
  );
}
