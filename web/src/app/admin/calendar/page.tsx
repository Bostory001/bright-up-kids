"use client";

import { useState } from "react";
import { Badge, Button, Card, ErrorText, Select, Table } from "@/components/ui";
import { useLoad } from "@/lib/client/api";
import { WEEKDAY_TH, WEEK_ORDER } from "@/lib/schedule";

interface Session {
  courseId: string;
  name: string;
  startTime: string;
  endTime: string;
  room?: string;
  week: number;
  total: number;
  enrolled: number;
  checked: number;
}
interface CourseRow {
  id: string;
  name: string;
  weekday: number;
  startTime: string;
  endTime: string;
  room?: string;
  enrolled: number;
  capacity: number;
  planned: boolean;
  total: number;
  done: number;
  left: number;
  startDate?: string;
  endDate?: string;
  nextDate?: string;
  finished: boolean;
}
interface Data {
  month: string;
  today: string;
  cells: { date: string | null; sessions: Session[] }[];
  courses: CourseRow[];
  unplanned: string[];
}

const thaiDate = (d?: string) => (d ? new Date(`${d}T00:00:00`).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" }) : "—");
const monthTh = (m: string) => new Date(`${m}-01T00:00:00`).toLocaleDateString("th-TH", { month: "long", year: "numeric" });

function shiftMonth(month: string, by: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + by, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export default function CalendarPage() {
  const [month, setMonth] = useState("");
  const [courseId, setCourseId] = useState("");
  const { data, error } = useLoad<Data>(`admin/calendar${month ? `?month=${month}` : ""}`);
  const current = data?.month ?? "";
  const cells = (data?.cells ?? []).map((c) => ({ ...c, sessions: courseId ? c.sessions.filter((s) => s.courseId === courseId) : c.sessions }));

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <h1 className="text-2xl font-bold">ปฏิทินการเรียน</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="w-56">
            <option value="">ทุกคอร์ส (ภาพรวมสถาบัน)</option>
            {(data?.courses ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Button variant="ghost" onClick={() => setMonth(shiftMonth(current, -1))}>
            ‹ เดือนก่อน
          </Button>
          <span className="min-w-28 text-center font-semibold">{current && monthTh(current)}</span>
          <Button variant="ghost" onClick={() => setMonth(shiftMonth(current, 1))}>
            เดือนถัดไป ›
          </Button>
          <Button onClick={() => window.print()}>พิมพ์ / PDF</Button>
        </div>
      </div>
      <ErrorText>{error}</ErrorText>

      {!!data?.unplanned.length && (
        <Card className="border-2 border-amber-400 print:hidden">
          <b className="text-sm">ยังไม่ได้กำหนดวันเริ่ม/จำนวนสัปดาห์: {data.unplanned.join(" · ")}</b>
          <p className="text-xs text-gray-600">คอร์สเหล่านี้จะไม่ขึ้นในปฏิทินและผู้ปกครองจะไม่เห็นว่าเหลืออีกกี่สัปดาห์ — ตั้งได้ที่หน้า “คอร์ส”</p>
        </Card>
      )}

      <Card>
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500">
          {WEEK_ORDER.map((w) => (
            <div key={w} className="py-1">
              {WEEKDAY_TH[w].slice(0, 2)}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, i) => (
            <div
              key={cell.date ?? `empty-${i}`}
              className={`min-h-20 rounded-lg border p-1 text-xs ${
                !cell.date ? "border-transparent" : cell.date === data?.today ? "border-amber-400 bg-amber-50" : "border-gray-100"
              }`}
            >
              {cell.date && <div className="text-right text-gray-400">{Number(cell.date.slice(8))}</div>}
              {cell.sessions.map((s) => (
                <div key={`${s.courseId}-${cell.date}`} className="mt-0.5 rounded bg-sky-100 px-1 py-0.5 leading-tight text-sky-900">
                  <div className="font-medium">{s.startTime}</div>
                  <div className="truncate">{s.name}</div>
                  <div className="text-[10px] text-sky-700">
                    สัปดาห์ {s.week}/{s.total} · {s.enrolled} คน{s.checked > 0 ? " ✓" : ""}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Card>

      <h2 className="text-lg font-bold">คอร์สที่เปิดอยู่ · เหลืออีกกี่สัปดาห์</h2>
      <Table head={["คอร์ส", "วันเวลา", "ห้อง", "เริ่ม", "จบคอร์ส", "ความคืบหน้า", "คาบถัดไป", "นักเรียน"]}>
        {(data?.courses ?? []).map((c) => (
          <tr key={c.id}>
            <td className="font-medium">{c.name}</td>
            <td className="whitespace-nowrap">
              {WEEKDAY_TH[c.weekday]} {c.startTime}–{c.endTime}
            </td>
            <td>{c.room ?? "—"}</td>
            <td className="whitespace-nowrap">{thaiDate(c.startDate)}</td>
            <td className="whitespace-nowrap">{thaiDate(c.endDate)}</td>
            <td className="whitespace-nowrap">
              {!c.planned ? (
                <Badge color="amber">ยังไม่กำหนด</Badge>
              ) : c.finished ? (
                <Badge color="gray">จบคอร์สแล้ว</Badge>
              ) : (
                <>
                  <span className="font-medium">
                    {c.done}/{c.total}
                  </span>{" "}
                  <span className="text-gray-500">เหลือ {c.left} สัปดาห์</span>
                </>
              )}
            </td>
            <td className="whitespace-nowrap">{thaiDate(c.nextDate)}</td>
            <td className={c.enrolled >= c.capacity ? "font-medium text-red-600" : ""}>
              {c.enrolled}/{c.capacity}
            </td>
          </tr>
        ))}
      </Table>
      <p className="text-xs text-gray-500 print:hidden">
        ต้องการเป็น Excel: ไปหน้า <b>รายงาน</b> → เลือก “ตารางเรียนรายคน (เหลือกี่สัปดาห์)” หรือ “ปฏิทินคาบเรียน (ตามช่วงวันที่)” → Export Excel
      </p>
    </div>
  );
}
