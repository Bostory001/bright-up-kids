"use client";

import { useState } from "react";
import { Button, Card, ErrorText, Field, Input, Select } from "@/components/ui";
import { api, todayStr, useLoad } from "@/lib/client/api";

type Status = "present" | "late" | "absent" | "leave";
type Quota = { paid: number | null; used: number; left: number | null; low: boolean; finished: boolean };
const OPTIONS: { value: Status; label: string; on: string }[] = [
  { value: "present", label: "มา", on: "bg-green-500 text-white" },
  { value: "late", label: "สาย", on: "bg-amber-500 text-white" },
  { value: "absent", label: "ขาด", on: "bg-red-500 text-white" },
  { value: "leave", label: "ลา", on: "bg-sky-500 text-white" },
];

export default function AttendancePage() {
  const courses = useLoad<{ courses: { id: string; name: string; active: boolean }[] }>("admin/courses");
  const [courseId, setCourseId] = useState("");
  const [date, setDate] = useState(todayStr);
  const { data, error, reload } = useLoad<{ rows: { studentId: string; code: string; nickname: string; status: Status | null; quota: Quota }[] }>(
    courseId ? `admin/attendance?courseId=${courseId}&date=${date}` : null,
  );
  // เก็บเฉพาะที่ครูแตะเปลี่ยน ผูกกับคอร์ส+วัน เพื่อไม่ให้ค้างข้ามคาบ
  const [edits, setEdits] = useState<{ key: string; marks: Record<string, Status> }>({ key: "", marks: {} });
  const [message, setMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  // กล่องตั้งคาบคงเหลือรายคน (สถาบันขายเป็นแพ็ก คนละจำนวนกัน)
  const [quota, setQuota] = useState<{ studentId: string; nickname: string; value: string } | null>(null);
  const key = `${courseId}_${date}`;
  const marks = edits.key === key ? edits.marks : {};

  async function save() {
    setSaveError("");
    try {
      const res = await api("admin/attendance", { courseId, date, marks: Object.entries(marks).map(([studentId, status]) => ({ studentId, status })) });
      setMessage(`บันทึกแล้ว แจ้งผู้ปกครอง ${res.changed} คน`);
      setEdits({ key: "", marks: {} });
      reload();
    } catch (err) {
      setSaveError((err as Error).message);
    }
  }

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold">เช็กชื่อ</h1>
      <Card className="grid gap-3 sm:grid-cols-2">
        <Field label="คอร์ส">
          <Select value={courseId} onChange={(e) => setCourseId(e.target.value)}>
            <option value="">-- เลือกคอร์ส --</option>
            {courses.data?.courses
              .filter((c) => c.active)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </Select>
        </Field>
        <Field label="วันที่">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
      </Card>
      <ErrorText>{error || saveError}</ErrorText>
      {message && <p className="rounded-xl bg-green-50 p-3 text-sm text-green-700">{message}</p>}

      {quota && (
        <Card className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <Field label={`น้อง${quota.nickname} เหลืออีกกี่คาบในคอร์สนี้ (เว้นว่าง = ไม่จำกัด)`}>
            <Input type="number" inputMode="numeric" value={quota.value} onChange={(e) => setQuota({ ...quota, value: e.target.value })} placeholder="เช่น 4" />
          </Field>
          <div className="flex items-end gap-2">
            <Button
              onClick={async () => {
                setSaveError("");
                try {
                  await api("admin/enrollments/quota", { studentId: quota.studentId, courseId, remaining: quota.value === "" ? null : Number(quota.value) });
                  setQuota(null);
                  setMessage("บันทึกคาบคงเหลือแล้ว");
                  reload();
                } catch (err) {
                  setSaveError((err as Error).message);
                }
              }}
            >
              บันทึก
            </Button>
            <Button variant="ghost" onClick={() => setQuota(null)}>
              ยกเลิก
            </Button>
          </div>
          <p className="text-xs text-gray-500 sm:col-span-2">
            นับเฉพาะคาบที่มาเรียนหรือมาสายเป็นการใช้คาบ · ขาด/ลา ไม่ตัดคาบ · ตัวเลขนี้จะลดลงเองทุกครั้งที่เช็กชื่อว่ามาเรียน
          </p>
        </Card>
      )}
      {data?.rows.length === 0 && <p className="text-gray-500">ยังไม่มีนักเรียนลงคอร์สนี้</p>}
      {data?.rows.map((r) => {
        const current = marks[r.studentId] ?? r.status;
        return (
          <Card key={r.studentId} className="flex flex-wrap items-center gap-3">
            <div className="min-w-32 flex-1">
              <div className="text-lg font-bold">{r.nickname}</div>
              <div className="font-mono text-xs text-gray-500">{r.code}</div>
              {/* คาบคงเหลือก่อนตัดคาบวันนี้ — ครูจะได้ทวงต่อคอร์สได้ถูกจังหวะ */}
              <button
                className={`mt-1 text-xs underline decoration-dotted ${r.quota?.finished ? "font-bold text-red-600" : r.quota?.low ? "font-medium text-amber-600" : "text-gray-500"}`}
                onClick={() => setQuota({ studentId: r.studentId, nickname: r.nickname, value: String(r.quota?.left ?? "") })}
              >
                {r.quota?.left === null || r.quota === undefined ? "ไม่จำกัดคาบ (กดตั้ง)" : `เหลือ ${r.quota.left} จาก ${r.quota.paid} คาบ`}
              </button>
            </div>
            <div className="flex gap-2">
              {OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => {
                    setMessage("");
                    setEdits({ key, marks: { ...marks, [r.studentId]: o.value } });
                  }}
                  className={`h-14 w-14 rounded-2xl text-base font-bold ${current === o.value ? o.on : "bg-gray-100 text-gray-500"}`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </Card>
        );
      })}
      {data && data.rows.length > 0 && (
        <Button onClick={save} disabled={Object.keys(marks).length === 0} className="py-3 text-base">
          บันทึก ({Object.keys(marks).length} คน)
        </Button>
      )}
    </div>
  );
}
