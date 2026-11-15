"use client";

import { useState } from "react";
import { useMe } from "@/components/me";
import { Badge, Button, Card, ErrorText, Field, Input, Select, Table } from "@/components/ui";
import { ASSESSMENT_KINDS, percent, type Progress } from "@/lib/assessment";
import { api, todayStr, useLoad } from "@/lib/client/api";
import type { Assessment, AssessmentKind, Subject } from "@/lib/types";

type Row = Progress & { code: string; nickname: string; grade: number; history: Assessment[] };
interface Data {
  courses: { id: string; name: string; subject: Subject }[];
  courseId: string;
  subject: Subject;
  rows: Row[];
  summary: { average: number | null; counted: number; improved: number };
}

const EMPTY = { id: "", studentId: "", kind: "pre" as AssessmentKind, date: "", score: "", maxScore: "20", note: "" };
type Form = typeof EMPTY;

export default function AssessmentsPage() {
  const { me } = useMe();
  const [courseId, setCourseId] = useState("");
  const { data, error, reload } = useLoad<Data>(`admin/assessments${courseId ? `?courseId=${courseId}` : ""}`);
  const [form, setForm] = useState<Form | null>(null);
  const [open, setOpen] = useState<string | null>(null);
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

  function save(f: Form) {
    const payload = {
      studentId: f.studentId,
      courseId: data?.courseId || undefined,
      subject: data?.subject ?? "math",
      kind: f.kind,
      date: f.date,
      score: Number(f.score),
      maxScore: Number(f.maxScore),
      note: f.note,
    };
    return run(async () => {
      if (f.id) await api(`admin/assessments/${f.id}`, payload, "PATCH");
      else await api("admin/assessments", payload);
      setForm(null);
    });
  }

  const pct = (n: number | null) => (n === null ? "—" : `${n}%`);
  const gainBadge = (g: number | null) => {
    if (g === null) return <span className="text-gray-400">ยังไม่ครบ</span>;
    if (g > 0) return <Badge color="green">+{g} จุด</Badge>;
    if (g < 0) return <Badge color="red">{g} จุด</Badge>;
    return <Badge>เท่าเดิม</Badge>;
  };

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">คะแนนก่อน-หลังเรียน</h1>
        <Select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="w-60">
          <option value="">ทุกคน (ไม่แยกคอร์ส)</option>
          {(data?.courses ?? []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>
      <p className="text-sm text-gray-600">
        เทียบเป็น<b>เปอร์เซ็นต์</b>เสมอ เพราะข้อสอบแต่ละชุดคะแนนเต็มไม่เท่ากัน · “+35 จุด” หมายถึงจาก 45% เป็น 80% · เลือกคอร์สก่อนบันทึกคะแนน เพื่อให้พัฒนาการผูกกับคอร์สนั้น
      </p>
      <ErrorText>{error || actionError}</ErrorText>

      {data?.summary.counted ? (
        <Card className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-xs text-gray-500">พัฒนาการเฉลี่ย</div>
            <div className={`text-xl font-bold ${(data.summary.average ?? 0) > 0 ? "text-green-700" : "text-red-600"}`}>
              {data.summary.average === null ? "—" : `${data.summary.average > 0 ? "+" : ""}${data.summary.average} จุด`}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">วัดครบก่อน-หลัง</div>
            <div className="text-xl font-bold">{data.summary.counted} คน</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">คะแนนดีขึ้น</div>
            <div className="text-xl font-bold text-green-700">{data.summary.improved} คน</div>
          </div>
        </Card>
      ) : null}

      {form && (
        <Card className="grid gap-3 sm:grid-cols-2">
          <Field label="ประเภทการวัด">
            <Select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as AssessmentKind })}>
              {Object.entries(ASSESSMENT_KINDS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="วันที่สอบ">
            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </Field>
          <Field label="คะแนนที่ได้">
            <Input type="number" inputMode="decimal" value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} />
          </Field>
          <Field label="คะแนนเต็ม">
            <Input type="number" inputMode="decimal" value={form.maxScore} onChange={(e) => setForm({ ...form, maxScore: e.target.value })} />
          </Field>
          <Field label="ข้อสังเกตของครู">
            <Input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="เช่น อ่านโจทย์ไม่ทัน แต่คิดเลขแม่น" />
          </Field>
          <div className="self-end text-sm text-gray-600">
            คิดเป็น <b className="text-lg">{pct(percent(Number(form.score || 0), Number(form.maxScore || 0)))}</b>
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <Button onClick={() => save(form)}>{form.id ? "บันทึกการแก้ไข" : "บันทึกคะแนน"}</Button>
            <Button variant="ghost" onClick={() => setForm(null)}>
              ยกเลิก
            </Button>
          </div>
        </Card>
      )}

      {data?.rows.length === 0 && <p className="text-gray-500">{courseId ? "คอร์สนี้ยังไม่มีนักเรียนลงเรียน" : "ยังไม่มีนักเรียน"}</p>}
      {!!data?.rows.length && (
        <Table head={["นักเรียน", "ก่อนเรียน", "หลังเรียน", "พัฒนาการ", "ครั้งที่วัด", ""]}>
          {data.rows.map((r) => (
            <tr key={r.studentId}>
              <td className="font-medium">
                <button className="underline decoration-dotted" onClick={() => setOpen(open === r.studentId ? null : r.studentId)}>
                  {r.nickname}
                </button>
                <span className="ml-1 text-xs text-gray-500">ป.{r.grade}</span>
                {open === r.studentId && (
                  <div className="mt-1 grid gap-0.5 text-xs text-gray-600">
                    {r.history.length === 0 && <span className="text-gray-400">ยังไม่มีคะแนน</span>}
                    {r.history.map((a) => (
                      <div key={a.id} className="flex flex-wrap items-center gap-1">
                        <span>
                          {a.date} · {ASSESSMENT_KINDS[a.kind]} · {a.score}/{a.maxScore} ({percent(a.score, a.maxScore)}%)
                        </span>
                        {a.note && <span className="text-gray-400">· {a.note}</span>}
                        <button
                          className="underline"
                          onClick={() => setForm({ id: a.id, studentId: a.studentId, kind: a.kind, date: a.date, score: String(a.score), maxScore: String(a.maxScore), note: a.note ?? "" })}
                        >
                          แก้
                        </button>
                        {me.role === "owner" && (
                          <button className="text-red-600 underline" onClick={() => window.confirm(`ลบคะแนนวันที่ ${a.date}?`) && run(() => api(`admin/assessments/${a.id}`, {}, "DELETE"))}>
                            ลบ
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </td>
              <td>{pct(r.prePercent)}</td>
              <td>{pct(r.postPercent)}</td>
              <td>{gainBadge(r.gain)}</td>
              <td>{r.count}</td>
              <td>
                <Button variant="ghost" onClick={() => setForm({ ...EMPTY, studentId: r.studentId, kind: r.pre ? "post" : "pre", date: todayStr() })}>
                  + คะแนน
                </Button>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
