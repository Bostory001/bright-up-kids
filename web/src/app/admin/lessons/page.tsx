"use client";

import { useState } from "react";
import { useMe } from "@/components/me";
import { Badge, Button, Card, ErrorText, Field, Input, Select, Table } from "@/components/ui";
import { api, useLoad } from "@/lib/client/api";
import { GRADES, SUBJECT_TH, gradeLabel } from "@/lib/grade";
import { formatDuration } from "@/lib/lessons";
import type { Lesson } from "@/lib/types";

type Editing = Omit<Lesson, "id" | "createdAt"> & { id?: string };
const EMPTY: Editing = { title: "", subject: "science", grade: 5, term: 1, unit: "", order: 1, videoUrl: "", published: false };

export default function LessonsAdminPage() {
  const { me } = useMe();
  const { data, error, reload } = useLoad<{ lessons: Lesson[] }>("admin/lessons");
  const [editing, setEditing] = useState<Editing | null>(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [gradeFilter, setGradeFilter] = useState(0);

  async function run(fn: () => Promise<void>) {
    setFormError("");
    setBusy(true);
    try {
      await fn();
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const save = () =>
    run(async () => {
      if (!editing) return;
      await api(editing.id ? `admin/lessons/${editing.id}` : "admin/lessons", editing, editing.id ? "PATCH" : "POST");
      setEditing(null);
      reload();
    });

  // เผยแพร่/ซ่อนจากตารางได้เลย ไม่ต้องเข้าหน้าแก้ไข
  const togglePublish = (l: Lesson) =>
    run(async () => {
      await api(`admin/lessons/${l.id}`, { ...l, published: !l.published }, "PATCH");
      reload();
    });

  if (editing) {
    const set = (patch: Partial<Editing>) => setEditing({ ...editing, ...patch });
    return (
      <div className="grid gap-4">
        <h1 className="text-2xl font-bold">{editing.id ? "แก้ไขคลิปสอน" : "เพิ่มคลิปสอน"}</h1>
        <Card className="grid gap-3 sm:grid-cols-2">
          <Field label="ชื่อคลิป">
            <Input value={editing.title} onChange={(e) => set({ title: e.target.value })} />
          </Field>
          <Field label="หน่วยการเรียนรู้ (คลิปชื่อหน่วยเดียวกันจะอยู่กลุ่มเดียวกัน)">
            <Input value={editing.unit} onChange={(e) => set({ unit: e.target.value })} />
          </Field>
          <Field label="วิชา">
            <Select value={editing.subject} onChange={(e) => set({ subject: e.target.value as Lesson["subject"] })}>
              {Object.entries(SUBJECT_TH).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </Select>
          </Field>
          <Field label="ชั้น">
            <Select value={editing.grade} onChange={(e) => set({ grade: Number(e.target.value) as Lesson["grade"] })}>
              {GRADES.map((g) => (
                <option key={g} value={g}>{gradeLabel(g)}</option>
              ))}
            </Select>
          </Field>
          <Field label="เทอม">
            <Select value={editing.term} onChange={(e) => set({ term: Number(e.target.value) as 1 | 2 })}>
              <option value={1}>เทอม 1</option>
              <option value={2}>เทอม 2</option>
            </Select>
          </Field>
          <Field label="ลำดับในหน่วย (1 = ดูก่อน)">
            <Input type="number" min={1} value={editing.order} onChange={(e) => set({ order: Number(e.target.value) })} />
          </Field>
          <Field label="ลิงก์วิดีโอ (https://... หรือ /lessons/ชื่อไฟล์.mp4)">
            <Input value={editing.videoUrl} onChange={(e) => set({ videoUrl: e.target.value })} />
          </Field>
          <Field label="ลิงก์ซับไตเติล .vtt (ไม่บังคับ)">
            <Input value={editing.subtitleUrl ?? ""} onChange={(e) => set({ subtitleUrl: e.target.value })} />
          </Field>
          <Field label="ความยาว (วินาที)">
            <Input type="number" min={1} value={editing.durationSec ?? ""} onChange={(e) => set({ durationSec: e.target.value ? Number(e.target.value) : undefined })} />
          </Field>
          <Field label="หัวข้อแบบฝึกหัดที่คู่กัน (ตรงกับช่อง “หัวข้อ” ของชุดโจทย์)">
            <Input value={editing.exerciseTopic ?? ""} onChange={(e) => set({ exerciseTopic: e.target.value })} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="สรุปสั้น ๆ ให้เด็กอ่านก่อนดู">
              <textarea value={editing.summary ?? ""} onChange={(e) => set({ summary: e.target.value })} rows={3} className="w-full rounded-xl border border-gray-300 p-2" />
            </Field>
          </div>
        </Card>
        <label className="flex items-center gap-2 rounded-2xl bg-white p-4 shadow-sm">
          <input type="checkbox" className="h-5 w-5" checked={editing.published} onChange={(e) => set({ published: e.target.checked })} />
          เผยแพร่ให้นักเรียน {gradeLabel(editing.grade)} เห็น (ตรวจเนื้อหากับเสียงพากย์แล้ว)
        </label>
        <ErrorText>{formError}</ErrorText>
        <div className="flex gap-2">
          <Button onClick={save} disabled={busy}>บันทึก</Button>
          <Button variant="ghost" onClick={() => setEditing(null)}>ยกเลิก</Button>
        </div>
      </div>
    );
  }

  const shown = (data?.lessons ?? []).filter((l) => !gradeFilter || l.grade === gradeFilter);
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">คลิปสอน</h1>
        <div className="flex gap-2">
          <Select value={gradeFilter} onChange={(e) => setGradeFilter(Number(e.target.value))} aria-label="กรองตามชั้น">
            <option value={0}>ทุกชั้น</option>
            {GRADES.map((g) => (
              <option key={g} value={g}>{gradeLabel(g)}</option>
            ))}
          </Select>
          <Button onClick={() => setEditing(EMPTY)}>เพิ่มคลิป</Button>
        </div>
      </div>
      <p className="text-sm text-gray-600">เรียงตาม วิชา → ชั้น → เทอม → หน่วย → ลำดับ · นำเข้าไฟล์ทีละหลายคลิปด้วย <code>npm run import:lessons</code></p>
      <ErrorText>{error || formError}</ErrorText>
      <Table head={["วิชา", "ชั้น", "เทอม", "หน่วย", "#", "คลิป", "ยาว", "สถานะ", ""]}>
        {shown.map((l) => (
          <tr key={l.id}>
            <td>{SUBJECT_TH[l.subject]}</td>
            <td>{gradeLabel(l.grade)}</td>
            <td>{l.term}</td>
            <td>{l.unit}</td>
            <td>{l.order}</td>
            <td className="font-medium">{l.title}</td>
            <td>{formatDuration(l.durationSec)}</td>
            <td>{l.published ? <Badge color="green">เผยแพร่</Badge> : <Badge>ร่าง</Badge>}</td>
            <td className="flex gap-1">
              <Button variant="ghost" disabled={busy} onClick={() => togglePublish(l)}>{l.published ? "ซ่อน" : "เผยแพร่"}</Button>
              <Button variant="ghost" onClick={() => setEditing(l)}>แก้ไข</Button>
              {me.role === "owner" && (
                <Button
                  variant="ghost"
                  onClick={() =>
                    window.confirm(`ลบคลิป "${l.title}"? (ไฟล์วิดีโอไม่ถูกลบ)`) &&
                    run(async () => {
                      await api(`admin/lessons/${l.id}`, {}, "DELETE");
                      reload();
                    })
                  }
                >
                  ลบ
                </Button>
              )}
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
