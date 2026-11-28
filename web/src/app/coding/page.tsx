import Link from "next/link";
import { BRAND, BRANCH } from "@/lib/brand";

// หน้าแนะนำวิชาโค้ดดิ้ง — เนื้อหามาจาก docs/coding/README.md
// ยังไม่ใส่ราคา/วันเปิดคอร์ส/จำนวนเด็กต่อห้อง (เจ้าของยังไม่ตัดสินใจ) และไม่อ้างชื่อ/โลโก้ Scratch ในหน้าที่เป็นการตลาด
export const metadata = { title: `วิชาโค้ดดิ้ง · ${BRAND}` };

interface Track {
  key: string;
  emoji: string;
  title: string;
  grades: string;
  intro: string;
  courses: { code: string; name: string; sessions: number; result: string }[];
}

const TRACKS: Track[] = [
  {
    key: "A",
    emoji: "🤖",
    title: "สายเริ่มต้น",
    grades: "ป.1–2",
    intro: "เริ่มจากการเคลื่อนไหวและเกม ฝึกคิดเป็นขั้นตอนก่อนแตะคอมพิวเตอร์",
    courses: [
      { code: "A1", name: "หุ่นยนต์หาดาว", sessions: 8, result: "สั่งหุ่นยนต์เดินผ่านเขาวงกตได้" },
      { code: "A2", name: "เล่าเรื่องของฉันบนแท็บเล็ต", sessions: 6, result: "ได้เรื่องเล่าแอนิเมชันของตัวเอง" },
    ],
  },
  {
    key: "B",
    emoji: "🧩",
    title: "สายบล็อกโค้ด",
    grades: "ป.3–6",
    intro: "ต่อบล็อกคำสั่งสร้างแอนิเมชัน ภาพวาด และเกม จากลำดับ ลูป เงื่อนไข ไปจนถึงตัวแปร",
    courses: [
      { code: "B1", name: "แอนิเมชันแรก", sessions: 6, result: "แอนิเมชันสั้นของตัวเอง" },
      { code: "B2", name: "วาดรูปด้วยโค้ด", sessions: 6, result: "ลายวาดจากโค้ดหลายแบบ" },
      { code: "B3", name: "เกมแรก", sessions: 8, result: "เกมที่เล่นได้จริง มีคะแนน" },
      { code: "B4", name: "ฟังก์ชันและโปรเจกต์ใหญ่", sessions: 8, result: "โปรเจกต์จบคอร์สของตัวเอง" },
    ],
  },
  {
    key: "C",
    emoji: "🐍",
    title: "สาย Python",
    grades: "ม.1–3",
    intro: "เขียนโค้ดเป็นตัวอักษรด้วย Python ตั้งแต่พื้นฐานจนถึงโปรเจกต์เล็ก ๆ",
    courses: [
      { code: "C1", name: "Python เริ่มต้น", sessions: 6, result: "โปรแกรมคำนวณง่าย ๆ" },
      { code: "C2", name: "วาดรูปด้วย turtle", sessions: 6, result: "ลายวาดจากโค้ด Python" },
      { code: "C3", name: "ตัดสินใจและวนซ้ำ", sessions: 6, result: "โปรแกรมที่ตัดสินใจและทำซ้ำได้" },
      { code: "C4", name: "list ฟังก์ชัน และโปรเจกต์", sessions: 8, result: "โปรเจกต์จบคอร์สของตัวเอง" },
    ],
  },
];

export default function CodingPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-6">
      <header className="text-center">
        <p className="text-sm font-semibold text-gray-600">{BRAND} · {BRANCH}</p>
        <h1 className="mt-1 text-4xl font-bold text-teal-700">💻 วิชาโค้ดดิ้ง</h1>
        <p className="mt-2 text-gray-700">เรียนคิดเป็นขั้นตอนและสร้างผลงานของตัวเอง ตั้งแต่ ป.1 ถึง ม.3</p>
      </header>

      <section aria-label="จุดเด่น" className="rounded-3xl bg-white p-5 shadow-md">
        <ul className="grid gap-2 text-lg">
          <li>🏃 เริ่มจากการเคลื่อนไหวและกระดาษ แล้วค่อยไปบล็อก แล้วค่อยไปตัวอักษร</li>
          <li>🏁 ทุกคอร์สจบด้วยผลงานที่เอาไปโชว์ได้</li>
          <li>🐞 ผิดพลาดได้ — หา &ldquo;บั๊ก&rdquo; ด้วยกันคือส่วนหนึ่งของการเรียน</li>
          <li>📅 คอร์สละ 6–8 คาบ คาบละ 60 นาที เข้าเรียนตามพื้นฐาน ไม่ต้องเรียนครบทุกคอร์ส</li>
        </ul>
      </section>

      {TRACKS.map((t) => (
        <section key={t.key} aria-label={`${t.title} ${t.grades}`} className="rounded-3xl bg-white p-5 shadow-md">
          <h2 className="flex flex-wrap items-center gap-2 text-2xl font-bold text-teal-700">
            <span aria-hidden="true">{t.emoji}</span>
            {t.title}
            <span className="rounded-full bg-teal-100 px-3 py-1 text-base text-teal-900">{t.grades}</span>
          </h2>
          <p className="mt-1 text-gray-700">{t.intro}</p>
          <ul className="mt-4 grid gap-3">
            {t.courses.map((c) => (
              <li key={c.code} className="rounded-2xl bg-teal-50 p-4">
                <p className="text-lg font-bold">
                  <span className="mr-2 rounded-lg bg-teal-600 px-2 py-0.5 text-base text-white">{c.code}</span>
                  {c.name}
                </p>
                <p className="mt-1 text-sm text-gray-700">{c.sessions} คาบ · ผลงาน: {c.result}</p>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section aria-label="ลองเล่นเกม" className="rounded-3xl bg-white p-5 text-center shadow-md">
        <h2 className="text-xl font-bold">🎮 ลองเล่นเกมหุ่นยนต์หาดาว</h2>
        <p className="mt-1 text-gray-700">เกมประกอบคอร์ส A1 เด็ก ๆ ลองเล่นที่บ้านได้เลย</p>
        <a href="/coding/a1/index.html" className="mt-3 block min-h-16 rounded-2xl bg-teal-600 p-4 text-xl font-bold text-white active:scale-95 focus-visible:outline-4 focus-visible:outline-sky-600">
          เล่นเกมเลย →
        </a>
      </section>

      <div className="rounded-3xl bg-amber-50 p-5 text-center">
        <p className="font-bold">สนใจ? ตอนนี้รับลงชื่อสนใจไว้ก่อน</p>
        <p className="mt-1 text-sm text-gray-700">ราคาและวันเปิดคอร์สจะแจ้งอีกครั้ง</p>
        <Link href="/enroll" className="mt-3 block min-h-16 rounded-2xl bg-amber-500 p-4 text-xl font-bold text-gray-950 active:scale-95 focus-visible:outline-4 focus-visible:outline-sky-600">
          ลงชื่อสนใจเรียนโค้ดดิ้ง →
        </Link>
        <Link href="/" className="mt-3 inline-block font-semibold text-amber-700 underline">← กลับหน้าแรก</Link>
      </div>
    </main>
  );
}
