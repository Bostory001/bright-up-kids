"use client";

import { useState } from "react";
import { Button, Card, ErrorText, Field, Input, Select } from "@/components/ui";
import { api, todayStr, useLoad } from "@/lib/client/api";
import type { Assignment, Course, Exercise } from "@/lib/types";

type Row = Assignment & { courseName?: string; exerciseTitle: string; total: number; doneCount: number; notDone: string[] };

export default function HomeworkPage() {
  const { data, error, reload } = useLoad<{ assignments: Row[] }>("admin/assignments");
  const courses = useLoad<{ courses: Course[] }>("admin/courses");
  const exercises = useLoad<{ exercises: Exercise[] }>("admin/exercises");
  const [form, setForm] = useState({ courseId: "", exerciseId: "", dueDate: todayStr() });
  const [actionError, setActionError] = useState("");

  async function run(fn: () => Promise<unknown>) {
    setActionError("");
    try {
      await fn();
      reload();
    } catch (err) {
      setActionError((err as Error).message);
    }
  }

  const course = courses.data?.courses.find((c) => c.id === form.courseId);
  // เลือกได้เฉพาะชุดที่เผยแพร่แล้วและตรงชั้นของคอร์ส (ชั้นอื่นเด็กมองไม่เห็น)
  const options = (exercises.data?.exercises ?? []).filter((e) => e.published && course?.grades.includes(e.grade));

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold">การบ้าน</h1>
      <ErrorText>{error || actionError}</ErrorText>
      <Card className="grid gap-3 sm:grid-cols-4">
        <Field label="คอร์ส">
          <Select value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value, exerciseId: "" })}>
            <option value="">-- เลือก --</option>
            {courses.data?.courses
              .filter((c) => c.active)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </Select>
        </Field>
        <Field label="แบบฝึกหัด (เผยแพร่แล้ว ตรงชั้น)">
          <Select value={form.exerciseId} onChange={(e) => setForm({ ...form, exerciseId: e.target.value })} disabled={!course}>
            <option value="">-- เลือก --</option>
            {options.map((e) => (
              <option key={e.id} value={e.id}>
                ป.{e.grade} {e.title}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="กำหนดส่ง">
          <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
        </Field>
        <div className="self-end">
          <Button
            disabled={!form.courseId || !form.exerciseId}
            onClick={() =>
              run(async () => {
                await api("admin/assignments", form);
                setForm({ ...form, exerciseId: "" });
              })
            }
          >
            สั่งการบ้าน + แจ้งผู้ปกครอง
          </Button>
        </div>
      </Card>

      {data?.assignments.length === 0 && <p className="text-gray-500">ยังไม่มีการบ้าน</p>}
      {data?.assignments.map((a) => (
        <Card key={a.id} className="grid gap-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <b>{a.exerciseTitle}</b>
            <span className="text-sm text-gray-500">
              {a.courseName} · ส่งภายใน {a.dueDate}
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-gray-200">
            <div className="h-full bg-green-500" style={{ width: `${a.total ? (a.doneCount / a.total) * 100 : 0}%` }} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span>
              ทำแล้ว {a.doneCount}/{a.total} คน
              {a.notDone.length > 0 && <span className="text-amber-700"> · ยังไม่ทำ: {a.notDone.join(", ")}</span>}
            </span>
            <button className="text-xs text-gray-400 underline" onClick={() => window.confirm("ลบการบ้านนี้?") && run(() => api(`admin/assignments/${a.id}`, {}, "DELETE"))}>
              ลบ
            </button>
          </div>
        </Card>
      ))}
    </div>
  );
}
