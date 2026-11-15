"use client";

import { useState } from "react";
import { useMe } from "@/components/me";
import { Badge, Button, Card, ErrorText, Field, Input, Select, Table } from "@/components/ui";
import { api, useLoad } from "@/lib/client/api";
import { GRADES, SUBJECT_TH, gradeLabel } from "@/lib/grade";
import type { Exercise, Question } from "@/lib/types";

const SUBJECTS = SUBJECT_TH;
type Editing = Omit<Exercise, "id" | "createdAt"> & { id?: string };
const EMPTY: Editing = { title: "", subject: "math", grade: 1, topic: "", questions: [], published: false };
const newQuestion = (): Question => ({ prompt: "", choices: ["", "", "", ""], answerIndex: 0, explain: "" });

// วางจาก Excel: แต่ละแถว = โจทย์ [tab] ตัวเลือก1..4 [tab] ลำดับคำตอบที่ถูก (1-4)
function parsePasted(text: string): Question[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.split("\t").map((c) => c.trim()))
    .filter((cells) => cells.length >= 4 && cells[0])
    .map((cells) => {
      const answer = Number(cells[cells.length - 1]);
      const choices = cells.slice(1, -1).filter(Boolean).slice(0, 4);
      return { prompt: cells[0], choices, answerIndex: Number.isInteger(answer) && answer >= 1 && answer <= choices.length ? answer - 1 : 0, explain: "" };
    });
}

export default function ExercisesPage() {
  const { me } = useMe();
  const { data, error, reload } = useLoad<{ exercises: Exercise[] }>("admin/exercises");
  const [editing, setEditing] = useState<Editing | null>(null);
  const [pasted, setPasted] = useState("");
  const [aiCount, setAiCount] = useState(5);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");

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

  function setQuestion(i: number, patch: Partial<Question>) {
    if (!editing) return;
    setEditing({ ...editing, questions: editing.questions.map((q, idx) => (idx === i ? { ...q, ...patch } : q)) });
  }

  const save = () =>
    run(async () => {
      if (!editing) return;
      await api(editing.id ? `admin/exercises/${editing.id}` : "admin/exercises", editing, editing.id ? "PATCH" : "POST");
      setEditing(null);
      reload();
    });

  const aiDraft = () =>
    run(async () => {
      if (!editing) return;
      const res = await api("admin/ai/draft", { subject: editing.subject, grade: editing.grade, topic: editing.topic, count: aiCount });
      setEditing({ ...editing, questions: [...editing.questions, ...res.questions], published: false });
    });

  if (editing) {
    return (
      <div className="grid gap-4">
        <h1 className="text-2xl font-bold">{editing.id ? "แก้ไขชุดแบบฝึกหัด" : "สร้างชุดใหม่"}</h1>
        <Card className="grid gap-3 sm:grid-cols-2">
          <Field label="ชื่อชุด">
            <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
          </Field>
          <Field label="หัวข้อ (ใช้สรุปจุดอ่อน เช่น การบวก)">
            <Input value={editing.topic} onChange={(e) => setEditing({ ...editing, topic: e.target.value })} />
          </Field>
          <Field label="วิชา">
            <Select value={editing.subject} onChange={(e) => setEditing({ ...editing, subject: e.target.value as Exercise["subject"] })}>
              {Object.entries(SUBJECTS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="ชั้น">
            <Select value={editing.grade} onChange={(e) => setEditing({ ...editing, grade: Number(e.target.value) as Exercise["grade"] })}>
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  {gradeLabel(g)}
                </option>
              ))}
            </Select>
          </Field>
        </Card>

        {editing.questions.map((q, i) => (
          <Card key={i} className="grid gap-2">
            <div className="flex items-center justify-between">
              <b>ข้อ {i + 1}</b>
              <Button variant="ghost" onClick={() => setEditing({ ...editing, questions: editing.questions.filter((_, idx) => idx !== i) })}>
                ลบ
              </Button>
            </div>
            <Input placeholder="โจทย์" value={q.prompt} onChange={(e) => setQuestion(i, { prompt: e.target.value })} />
            <div className="grid gap-2 sm:grid-cols-2">
              {[0, 1, 2, 3].map((c) => (
                <label key={c} className="flex items-center gap-2">
                  <input type="radio" name={`answer-${i}`} checked={q.answerIndex === c} onChange={() => setQuestion(i, { answerIndex: c })} title="ข้อที่ถูก" />
                  <Input
                    placeholder={`ตัวเลือก ${c + 1}${c > 1 ? " (เว้นว่างได้)" : ""}`}
                    value={q.choices[c] ?? ""}
                    onChange={(e) => {
                      const choices = [0, 1, 2, 3].map((k) => (k === c ? e.target.value : (q.choices[k] ?? "")));
                      setQuestion(i, { choices });
                    }}
                  />
                </label>
              ))}
            </div>
            <Input placeholder="คำอธิบายเฉลย (ไม่บังคับ)" value={q.explain ?? ""} onChange={(e) => setQuestion(i, { explain: e.target.value })} />
            <p className="text-xs text-gray-500">จุดกลม = ข้อที่ถูก</p>
          </Card>
        ))}

        <Card className="grid gap-3">
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" onClick={() => setEditing({ ...editing, questions: [...editing.questions, newQuestion()] })}>
              + เพิ่มโจทย์
            </Button>
            <Button variant="ghost" disabled={busy || !editing.topic} onClick={aiDraft}>
              🤖 ให้ AI ร่าง
            </Button>
            <Input type="number" min={1} max={20} value={aiCount} onChange={(e) => setAiCount(Number(e.target.value))} className="w-20" />
            <span className="self-center text-sm text-gray-500">ข้อ (ต้องใส่หัวข้อก่อน และครูต้องตรวจทุกข้อ)</span>
          </div>
          <Field label="หรือวางจาก Excel — คอลัมน์: โจทย์ | ตัวเลือก 1-4 | ลำดับคำตอบที่ถูก (1-4)">
            <textarea value={pasted} onChange={(e) => setPasted(e.target.value)} rows={3} className="w-full rounded-xl border border-gray-300 p-2 font-mono text-sm" />
          </Field>
          <Button
            variant="ghost"
            disabled={!pasted.trim()}
            onClick={() => {
              setEditing({ ...editing, questions: [...editing.questions, ...parsePasted(pasted)] });
              setPasted("");
            }}
          >
            นำเข้าที่วางไว้
          </Button>
        </Card>

        <label className="flex items-center gap-2 rounded-2xl bg-white p-4 shadow-sm">
          <input type="checkbox" className="h-5 w-5" checked={editing.published} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} />
          เผยแพร่ให้นักเรียน {gradeLabel(editing.grade)} เห็น (ตรวจโจทย์และเฉลยครบทุกข้อแล้ว)
        </label>
        <ErrorText>{formError}</ErrorText>
        <div className="flex gap-2">
          <Button onClick={save} disabled={busy}>
            บันทึก ({editing.questions.length} ข้อ)
          </Button>
          <Button variant="ghost" onClick={() => setEditing(null)}>
            ยกเลิก
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">แบบฝึกหัด</h1>
        <div className="flex gap-2">
          {me.role === "owner" && (
            <Button
              variant="ghost"
              disabled={busy}
              onClick={() =>
                run(async () => {
                  const res = await api("admin/exercises/seed", {});
                  setNotice(`นำเข้า ${res.added} ชุด เป็นร่าง — ตรวจแล้วกดเผยแพร่ทีละชุด`);
                  reload();
                })
              }
            >
              นำเข้าชุดโจทย์เริ่มต้น
            </Button>
          )}
          <Button onClick={() => setEditing(EMPTY)}>สร้างชุดใหม่</Button>
        </div>
      </div>
      <ErrorText>{error || formError}</ErrorText>
      {notice && <p className="rounded-xl bg-green-50 p-3 text-sm text-green-700">{notice}</p>}
      <Table head={["ชุด", "วิชา", "ชั้น", "หัวข้อ", "ข้อ", "สถานะ", ""]}>
        {data?.exercises.map((e) => (
          <tr key={e.id}>
            <td className="font-medium">{e.title}</td>
            <td>{SUBJECTS[e.subject]}</td>
            <td>{gradeLabel(e.grade)}</td>
            <td>{e.topic}</td>
            <td>{e.questions.length}</td>
            <td>{e.published ? <Badge color="green">เผยแพร่</Badge> : <Badge>ร่าง</Badge>}</td>
            <td className="flex gap-1">
              <Button variant="ghost" onClick={() => setEditing(e)}>
                แก้ไข
              </Button>
              {me.role === "owner" && (
                <Button
                  variant="ghost"
                  onClick={() =>
                    window.confirm(`ลบชุด "${e.title}"?`) &&
                    run(async () => {
                      await api(`admin/exercises/${e.id}`, {}, "DELETE");
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
