import Link from "next/link";

// โครงเมนูหลังบ้าน — แต่ละข้อคือ 1 รอบงานใน ROADMAP.md
const MODULES = [
  { emoji: "📝", title: "สมัครเรียน", round: "R2" },
  { emoji: "📅", title: "ตารางเรียน + เช็กชื่อ", round: "R3" },
  { emoji: "💰", title: "ค่าเรียน / ใบแจ้งหนี้", round: "R4" },
  { emoji: "💬", title: "แจ้งเตือน LINE", round: "R5" },
  { emoji: "✏️", title: "คลังแบบฝึกหัด", round: "R6" },
  { emoji: "🎁", title: "ของรางวัล / อนุมัติแลก", round: "R7" },
];

export default function AdminPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 p-6">
      <Link href="/" className="text-sm text-amber-700">← หน้าแรก</Link>
      <h1 className="mt-2 text-2xl font-bold">หลังบ้าน (ครู / เจ้าของ)</h1>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {MODULES.map((m) => (
          <li key={m.title} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
            <span className="text-3xl">{m.emoji}</span>
            <span className="flex-1 font-medium">{m.title}</span>
            <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-500">ยังไม่ทำ · {m.round}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
