"use client";

import { useState } from "react";
import { useLoad } from "@/lib/client/api";
import { SUBJECT_SHORT } from "@/lib/grade";
import { formatDuration, groupLessons } from "@/lib/lessons";
import type { Subject } from "@/lib/types";

// หน้า "คลิปสอน" ของนักเรียน: วิชา → เทอม → หน่วย → คลิป (ปุ่มใหญ่ ข้อความสั้น)

interface PlayLesson {
  id: string;
  title: string;
  subject: Subject;
  term: 1 | 2;
  unit: string;
  order: number;
  videoUrl: string;
  subtitleUrl: string | null;
  durationSec: number | null;
  summary: string | null;
  exerciseTopic: string | null;
}

const SUBJECT_EMOJI: Record<string, string> = { math: "🔢", thai: "📖", english: "🔤", science: "🔬", chinese: "🀄", coding: "💻" };
const BIG = "min-h-16 rounded-2xl p-3 text-lg font-bold focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-sky-600";

export function LessonsView({ onPractice }: { onPractice: (topic: string) => void }) {
  const { data, error, reload } = useLoad<{ lessons: PlayLesson[] }>("play/lessons");
  const [subject, setSubject] = useState<string>("");
  const [playing, setPlaying] = useState<PlayLesson | null>(null);

  if (error) {
    return (
      <div className="text-center">
        <p role="alert" className="rounded-2xl bg-red-50 p-3 text-red-700">{error}</p>
        <button onClick={reload} className={BIG + " mt-3 bg-white"}>ลองโหลดใหม่</button>
      </div>
    );
  }
  if (!data) return <p role="status" className="text-center text-gray-600">กำลังโหลด...</p>;
  if (data.lessons.length === 0) return <p className="rounded-2xl bg-white p-6 text-center text-gray-600 shadow-sm">ยังไม่มีคลิปสอนสำหรับชั้นนี้ เดี๋ยวครูเอามาเพิ่มให้นะ 🎬</p>;

  const tree = groupLessons(data.lessons);

  if (playing) {
    return (
      <section className="grid gap-3" aria-label="ดูคลิปสอน">
        <button onClick={() => setPlaying(null)} className={BIG + " bg-white text-base"}>← กลับไปเลือกคลิป</button>
        <h1 className="text-xl font-bold">{playing.title}</h1>
        <video key={playing.id} controls playsInline preload="metadata" className="mx-auto max-h-[70vh] w-auto rounded-2xl bg-black" src={playing.videoUrl}>
          {playing.subtitleUrl && <track kind="subtitles" srcLang="th" label="ไทย" src={playing.subtitleUrl} default />}
        </video>
        {playing.summary && <p className="rounded-2xl bg-white p-4 text-gray-700 shadow-sm">{playing.summary}</p>}
        {playing.exerciseTopic && (
          <button onClick={() => onPractice(playing.exerciseTopic!)} className={BIG + " bg-amber-500 text-gray-950"}>
            ✏️ ไปทำแบบฝึกหัดเรื่องนี้
          </button>
        )}
      </section>
    );
  }

  const current = tree.find((s) => s.subject === subject) ?? tree[0];
  return (
    <section className="grid gap-4" aria-label="คลิปสอน">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5" role="group" aria-label="เลือกวิชา">
        {tree.map((s) => (
          <button key={s.subject} aria-pressed={current.subject === s.subject} onClick={() => setSubject(s.subject)} className={BIG + " border-2 text-sm " + (current.subject === s.subject ? "border-sky-700 bg-sky-50 text-sky-900" : "border-gray-100 bg-white")}>
            {SUBJECT_EMOJI[s.subject]} {SUBJECT_SHORT[s.subject]}
          </button>
        ))}
      </div>
      {current.terms.map((t) => (
        <div key={t.term} className="grid gap-3">
          <h2 className="text-xl font-bold">เทอม {t.term}</h2>
          {t.units.map((u) => (
            <div key={u.unit} className="rounded-3xl bg-white p-4 shadow-sm">
              <h3 className="font-bold text-sky-900">{u.unit}</h3>
              <ol className="mt-3 grid gap-2">
                {u.lessons.map((l, i) => (
                  <li key={l.id}>
                    <button
                      onClick={() => setPlaying(l)}
                      className={BIG + " flex w-full items-center gap-3 bg-amber-50 text-left"}
                    >
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-amber-400 text-gray-950">{i + 1}</span>
                      <span className="flex-1">
                        {l.title}
                        {l.durationSec ? <span className="block text-xs font-normal text-gray-600">▶ {formatDuration(l.durationSec)}</span> : null}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}
