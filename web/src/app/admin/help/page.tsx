import Link from "next/link";
import { MODULES } from "@/lib/modules";

const AUDIENCE = { staff: "ครู / เจ้าของ", owner: "เจ้าของเท่านั้น", parent: "ผู้ปกครอง", student: "นักเรียน" };

// คู่มือสร้างจาก lib/modules.ts — เพิ่มหน้าใหม่ที่นั่น คู่มือจะเพิ่มตามเอง
export default function HelpPage() {
  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold">คู่มือการใช้งาน</h1>
      <nav className="flex flex-wrap gap-2 print:hidden">
        {MODULES.map((m) => (
          <a key={m.href} href={`#${m.href}`} className="rounded-full bg-white px-3 py-1 text-sm shadow-sm">
            {m.emoji} {m.title}
          </a>
        ))}
      </nav>
      {MODULES.map((m) => (
        <section key={m.href} id={m.href} className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold">
              {m.emoji} {m.title}
            </h2>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{AUDIENCE[m.audience]}</span>
          </div>
          <p className="mt-1 text-sm text-gray-600">{m.summary}</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
            {m.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <Link href={m.href} className="mt-2 inline-block text-sm text-amber-700 underline print:hidden">
            ไปที่หน้านี้ →
          </Link>
        </section>
      ))}
    </div>
  );
}
