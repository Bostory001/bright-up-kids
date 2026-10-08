"use client";

import Link from "next/link";
import { useLoad } from "@/lib/client/api";

const PORTALS = [
  { href: "/play", emoji: "🎮", title: "นักเรียน", desc: "ทำแบบฝึกหัด เก็บพลัง ปลดล็อก avatar" },
  { href: "/parent", emoji: "👨‍👩‍👧", title: "ผู้ปกครอง", desc: "ดูผลการเรียน การเข้าเรียน ค่าเรียน" },
  { href: "/admin", emoji: "🏫", title: "ครู / เจ้าของ", desc: "สมัครเรียน เช็กชื่อ ค่าเรียน ของรางวัล" },
];

export default function Home() {
  const { data } = useLoad<{ needsSetup: boolean }>("status");
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-8 p-6">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-amber-600">Bright Up Kids</h1>
        <p className="mt-2 text-gray-600">สถาบันเรียนพิเศษ ป.1-6</p>
      </header>
      {data?.needsSetup && (
        <Link href="/setup" className="rounded-2xl bg-amber-500 p-4 text-center font-bold text-white">
          เริ่มใช้งานครั้งแรก → สร้างบัญชีเจ้าของ
        </Link>
      )}
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
      </div>
    </main>
  );
}
