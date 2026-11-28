"use client";

import { useEffect, useState } from "react";
import { Button, ErrorText } from "@/components/ui";
import { api, todayStr, useLoad } from "@/lib/client/api";
import { addDays, weekdayOf } from "@/lib/schedule";

type Status = "present" | "late" | "absent" | "leave";
interface Row { studentId: string; code: string; nickname: string; status: Status | null }
const OPTIONS: { value: Status; label: string; on: string }[] = [
  { value: "present", label: "มา", on: "bg-green-500 text-white" },
  { value: "late", label: "สาย", on: "bg-amber-500 text-white" },
  { value: "absent", label: "ขาด", on: "bg-red-500 text-white" },
  { value: "leave", label: "ลา", on: "bg-sky-500 text-white" },
];

/** วันที่เช็กชื่อตั้งต้น: วันนี้ถ้าตรงกับวันเรียนของคอร์ส ไม่งั้นใช้ครั้งล่าสุดที่ผ่านมา */
function defaultDate(weekday: number): string {
  let d = todayStr();
  for (let i = 0; i < 7 && weekdayOf(d) !== weekday; i++) d = addDays(d, -1);
  return d;
}

/** แผงรายชื่อนักเรียนของคอร์ส เปิดจากตารางสอน — เห็นชื่อเล่น แตะเช็กชื่อ แล้วกดบันทึกครั้งเดียว (แจ้งผู้ปกครองครั้งเดียว ไม่ใช่ทุกครั้งที่แตะ) */
export function ClassRoster({ course, onClose }: { course: { id: string; name: string; weekday: number; startTime: string; endTime: string }; onClose: () => void }) {
  const [date, setDate] = useState(() => defaultDate(course.weekday));
  const { data, error, reload } = useLoad<{ rows: Row[] }>(`admin/attendance?courseId=${course.id}&date=${date}`);
  const [marks, setMarks] = useState<Record<string, Status>>({});
  const [message, setMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setMarks({});
    setMessage("");
  }, [date]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const rows = data?.rows ?? [];
  const current = (r: Row) => marks[r.studentId] ?? r.status;
  const counted = rows.filter((r) => current(r) === "present" || current(r) === "late").length;
  const pending = Object.keys(marks).length;

  async function save() {
    setSaveError("");
    setBusy(true);
    try {
      const res = await api("admin/attendance", { courseId: course.id, date, marks: Object.entries(marks).map(([studentId, status]) => ({ studentId, status })) });
      setMessage(`บันทึกแล้ว แจ้งผู้ปกครอง ${res.changed} คน`);
      setMarks({});
      reload();
    } catch (err) {
      setSaveError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4 print:hidden" onClick={onClose} role="presentation">
      <div role="dialog" aria-modal="true" aria-label={`เช็กชื่อ ${course.name}`} className="flex max-h-[88vh] w-full max-w-md flex-col rounded-t-3xl bg-white shadow-xl sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-2 border-b border-gray-100 p-4">
          <div>
            <h2 className="text-lg font-bold leading-snug">{course.name}</h2>
            <p className="text-sm text-gray-500">{course.startTime}–{course.endTime}</p>
          </div>
          <button onClick={onClose} aria-label="ปิด" className="rounded-full px-3 py-1 text-2xl text-gray-500 hover:bg-gray-100">×</button>
        </div>
        <div className="flex flex-wrap items-center gap-2 px-4 pt-3">
          <label className="text-sm font-semibold text-gray-600" htmlFor="roster-date">วันที่เช็กชื่อ</label>
          <input id="roster-date" type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} className="rounded-xl border border-gray-300 px-3 py-1.5 text-sm" />
          <span className="ml-auto text-sm text-gray-600">มาเรียน {counted}/{rows.length} คน</span>
        </div>
        <div className="grid gap-2 overflow-y-auto p-4">
          <ErrorText>{error || saveError}</ErrorText>
          {!data && !error && <p className="text-sm text-gray-500">กำลังโหลดรายชื่อ...</p>}
          {data && rows.length === 0 && <p className="text-gray-500">ยังไม่มีนักเรียนลงคอร์สนี้</p>}
          {rows.map((r) => (
            <div key={r.studentId} className="flex items-center gap-2 rounded-2xl bg-gray-50 p-2">
              <div className="min-w-0 flex-1 truncate pl-1 text-base font-bold">{r.nickname}</div>
              <div className="flex gap-1.5">
                {OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    aria-pressed={current(r) === o.value}
                    onClick={() => { setMessage(""); setMarks({ ...marks, [r.studentId]: o.value }); }}
                    className={`h-11 w-11 rounded-xl text-sm font-bold ${current(r) === o.value ? o.on : "bg-white text-gray-500 ring-1 ring-gray-200"}`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="grid gap-2 border-t border-gray-100 p-4">
          {message && <p className="rounded-xl bg-green-50 p-2 text-center text-sm text-green-700">{message}</p>}
          <Button onClick={save} disabled={busy || pending === 0} className="py-3 text-base">
            {busy ? "กำลังบันทึก..." : `บันทึกการเช็กชื่อ (${pending} คน)`}
          </Button>
        </div>
      </div>
    </div>
  );
}
