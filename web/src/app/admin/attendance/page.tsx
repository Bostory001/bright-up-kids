"use client";

import { useState } from "react";
import { Button, Card, ErrorText, Field, Input, Select } from "@/components/ui";
import { api, todayStr, useLoad } from "@/lib/client/api";

type Status = "present" | "late" | "absent" | "leave";
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
  const { data, error, reload } = useLoad<{ rows: { studentId: string; code: string; nickname: string; status: Status | null }[] }>(
    courseId ? `admin/attendance?courseId=${courseId}&date=${date}` : null,
  );
  // เก็บเฉพาะที่ครูแตะเปลี่ยน ผูกกับคอร์ส+วัน เพื่อไม่ให้ค้างข้ามคาบ
  const [edits, setEdits] = useState<{ key: string; marks: Record<string, Status> }>({ key: "", marks: {} });
  const [message, setMessage] = useState("");
  const [saveError, setSaveError] = useState("");
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

      {data?.rows.length === 0 && <p className="text-gray-500">ยังไม่มีนักเรียนลงคอร์สนี้</p>}
      {data?.rows.map((r) => {
        const current = marks[r.studentId] ?? r.status;
        return (
          <Card key={r.studentId} className="flex flex-wrap items-center gap-3">
            <div className="min-w-32 flex-1">
              <div className="text-lg font-bold">{r.nickname}</div>
              <div className="font-mono text-xs text-gray-500">{r.code}</div>
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
