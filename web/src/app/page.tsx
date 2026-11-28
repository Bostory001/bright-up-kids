"use client";

import { useState } from "react";
import Link from "next/link";
import { BRAND, BRANCH, TAGLINE } from "@/lib/brand";
import { GRADES, gradeLabel } from "@/lib/grade";
import { useLoad } from "@/lib/client/api";

const PORTALS = [
  { href: "/play", emoji: "🎮", title: "นักเรียน", desc: "ทำแบบฝึกหัด เก็บพลัง ปลดล็อก avatar" },
  { href: "/parent", emoji: "👨‍👩‍👧", title: "ผู้ปกครอง", desc: "ดูผลการเรียน การเข้าเรียน ค่าเรียน" },
  { href: "/admin", emoji: "🏫", title: "ครู / เจ้าของ", desc: "สมัครเรียน เช็กชื่อ ค่าเรียน ของรางวัล" },
];

// ตัวช่วยเลือกระดับชั้นสำหรับผู้ปกครองใหม่ — แตะชั้นแล้วไปฟอร์มทดลองเรียนที่เลือกชั้นไว้ให้
function LevelPicker() {
  const [grade, setGrade] = useState<number | null>(null);
  return (
    <section aria-label="เลือกระดับชั้น" className="rounded-3xl bg-white p-5 shadow-md">
      <h2 className="text-center text-xl font-bold">สวัสดีค่ะ น้องเรียนชั้นไหนคะ? 👋</h2>
      <p className="mt-1 text-center text-sm text-gray-600">แตะเลือกชั้น ใช้เวลาไม่ถึง 1 นาที</p>
      <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-9" role="group" aria-label="ชั้นเรียน">
        {GRADES.map((g) => (
          <button key={g} aria-pressed={grade === g} onClick={() => setGrade(g)} className={"min-h-16 rounded-2xl border-2 px-2 text-lg font-bold focus-visible:outline-4 focus-visible:outline-sky-600 " + (grade === g ? "border-amber-500 bg-amber-100" : "border-gray-100 bg-white")}>
            {gradeLabel(g)}
          </button>
        ))}
      </div>
      {grade !== null && (
        <div role="status" className="mt-4 rounded-2xl bg-amber-50 p-4 text-center">
          <p className="font-bold">เริ่มจากทดลองเรียน {gradeLabel(grade)} ฟรีก่อนได้เลย</p>
          <p className="mt-1 text-sm text-gray-600">ตอบผิดไม่เป็นไร ครูจะอธิบายวิธีคิดให้ ไม่ต้องกดดัน</p>
          <Link href={`/trial?grade=${grade}`} className="mt-3 block min-h-16 rounded-2xl bg-amber-500 p-4 text-xl font-bold text-gray-950 active:scale-95">
            ขอทดลองเรียนฟรี {gradeLabel(grade)} →
          </Link>
        </div>
      )}
    </section>
  );
}

export default function Home() {
  const { data } = useLoad<{ needsSetup: boolean }>("status");
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-8 p-6">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-amber-600">{BRAND}</h1>
        <p className="mt-1 text-gray-600">{BRANCH}</p>
        <p className="mt-1 text-gray-600">{TAGLINE}</p>
      </header>
      {data?.needsSetup && (
        <Link href="/setup" className="rounded-2xl bg-amber-500 p-4 text-center font-bold text-white">
          เริ่มใช้งานครั้งแรก → สร้างบัญชีเจ้าของ
        </Link>
      )}
      <LevelPicker />
      <div className="grid gap-4 sm:grid-cols-3">
        {PORTALS.map((p) => (
          <Link key={p.href} href={p.href} className="rounded-3xl bg-white p-6 text-center shadow-md transition active:scale-95">
            <div className="text-5xl">{p.emoji}</div>
            <div className="mt-3 text-xl font-bold">{p.title}</div>
            <div className="mt-1 text-sm text-gray-500">{p.desc}</div>
          </Link>
        ))}
      </div>
      <div className="flex justify-center gap-6 font-semibold text-amber-700">
        <Link href="/trial" className="underline">
          ทดลองเรียนฟรี
        </Link>
        <Link href="/enroll" className="underline">
          สมัครเรียนออนไลน์
        </Link>
        <Link href="/coding" className="underline">
          💻 วิชาโค้ดดิ้ง
        </Link>
      </div>
    </main>
  );
}
