"use client";

import { useState } from "react";
import { useMe } from "@/components/me";
import { Badge, Button, Card, ErrorText, Field, Input, Select, Table } from "@/components/ui";
import { api, useLoad } from "@/lib/client/api";
import { GRADES, SUBJECT_KEYS, SUBJECT_TH, gradeLabel, gradeRange } from "@/lib/grade";
import type { Course, Subject } from "@/lib/types";

const WEEKDAYS = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
const SUBJECTS = SUBJECT_TH;
const EMPTY: Omit<Course, "id"> = {
  name: "",
  subject: "math",
  grades: [1],
  pricePerTerm: 0,
  weekday: 6,
  startTime: "09:00",
  endTime: "10:30",
  teacherName: "",
  room: "",
  capacity: 10,
  active: true,
};

export default function CoursesPage() {
  // รายชื่อครู — ใช้ผูกคอร์สกับครู เพื่อให้หน้า "ค่าจ้างครู" รวมชั่วโมงได้ถูกคน
  const teachers = useLoad<{ teachers: { id: string; displayName: string }[] }>("admin/teachers");
  const { me } = useMe();
  const { data, error, reload } = useLoad<{ courses: Course[] }>("admin/courses");
  const [editing, setEditing] = useState<(Omit<Course, "id"> & { id?: string }) | null>(null);
  const [formError, setFormError] = useState("");
  const canEdit = me.role === "owner";

  async function save() {
    if (!editing) return;
    setFormError("");
    try {
      await api(editing.id ? `admin/courses/${editing.id}` : "admin/courses", editing, editing.id ? "PATCH" : "POST");
      setEditing(null);
      reload();
    } catch (err) {
      setFormError((err as Error).message);
    }
  }

  // จัดกลุ่มตามวิชา — ภายในกลุ่มเรียงตามวันและเวลา
  const grouped = SUBJECT_KEYS.map((key): [Subject, Course[]] => [
    key,
    (data?.courses ?? []).filter((c) => c.subject === key).sort((a, b) => a.weekday - b.weekday || a.startTime.localeCompare(b.startTime)),
  ]).filter(([, list]) => list.length > 0);

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">คอร์ส</h1>
        {canEdit && <Button onClick={() => setEditing(EMPTY)}>เพิ่มคอร์ส</Button>}
      </div>
      <ErrorText>{error}</ErrorText>

      {editing && (
        <Card className="grid gap-3 sm:grid-cols-2">
          <Field label="ชื่อคอร์ส">
            <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
          </Field>
          <Field label="วิชา">
            <Select value={editing.subject} onChange={(e) => setEditing({ ...editing, subject: e.target.value as Course["subject"] })}>
              {Object.entries(SUBJECTS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="ชั้นที่รับ">
            <div className="flex flex-wrap gap-3 py-2">
              {GRADES.map((g) => (
                <label key={g} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={editing.grades.includes(g)}
                    onChange={(e) => setEditing({ ...editing, grades: e.target.checked ? [...editing.grades, g].sort() : editing.grades.filter((x) => x !== g) })}
                  />
                  {gradeLabel(g)}
                </label>
              ))}
            </div>
          </Field>
          <Field label="ค่าเรียนต่อเทอม (บาท)">
            <Input type="number" value={editing.pricePerTerm} onChange={(e) => setEditing({ ...editing, pricePerTerm: Number(e.target.value) })} />
          </Field>
          <Field label="วันเรียน">
            <Select value={editing.weekday} onChange={(e) => setEditing({ ...editing, weekday: Number(e.target.value) })}>
              {WEEKDAYS.map((d, i) => (
                <option key={d} value={i}>
                  {d}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="เริ่ม">
              <Input type="time" value={editing.startTime} onChange={(e) => setEditing({ ...editing, startTime: e.target.value })} />
            </Field>
            <Field label="เลิก">
              <Input type="time" value={editing.endTime} onChange={(e) => setEditing({ ...editing, endTime: e.target.value })} />
            </Field>
          </div>
          <Field label="ครูผู้สอน">
            <Select
              value={editing.teacherId ?? ""}
              onChange={(e) => {
                const teacherId = e.target.value;
                setEditing({ ...editing, teacherId, teacherName: teachers.data?.teachers.find((t) => t.id === teacherId)?.displayName ?? "" });
              }}
            >
              <option value="">— ยังไม่ระบุ —</option>
              {(teachers.data?.teachers ?? []).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.displayName}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="วันเริ่มคอร์ส">
            <Input type="date" value={editing.startDate ?? ""} onChange={(e) => setEditing({ ...editing, startDate: e.target.value })} />
          </Field>
          <Field label="เรียนกี่สัปดาห์">
            <Input type="number" value={editing.weeks ?? ""} onChange={(e) => setEditing({ ...editing, weeks: e.target.value === "" ? undefined : Number(e.target.value) })} placeholder="12" />
          </Field>
          <Field label="ห้องเรียน">
            <Input value={editing.room ?? ""} onChange={(e) => setEditing({ ...editing, room: e.target.value })} placeholder="ห้อง 1" />
          </Field>
          <Field label="จำนวนที่รับ">
            <Input type="number" value={editing.capacity} onChange={(e) => setEditing({ ...editing, capacity: Number(e.target.value) })} />
          </Field>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} /> เปิดรับสมัคร
          </label>
          <div className="flex gap-2 sm:col-span-2">
            <Button onClick={save}>บันทึก</Button>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              ยกเลิก
            </Button>
          </div>
          <div className="sm:col-span-2">
            <ErrorText>{formError}</ErrorText>
          </div>
        </Card>
      )}

      {grouped.length === 0 && <p className="text-gray-500">ยังไม่มีคอร์ส</p>}
      {grouped.map(([subject, list]) => (
        <section key={subject} className="grid gap-2">
          <h2 className="flex items-baseline gap-2 text-lg font-bold">
            {SUBJECTS[subject]}
            <span className="text-sm font-normal text-gray-500">
              {list.length} คอร์ส · เปิดรับ {list.filter((c) => c.active).length}
            </span>
          </h2>
          <Table head={["คอร์ส", "ชั้น", "วันเวลา", "ห้อง", "ค่าเรียน", "รับ", "สถานะ", ""]}>
            {list.map((c) => (
              <tr key={c.id}>
                <td className="font-medium">
                  {c.name}
                  {c.teacherName && <div className="text-xs font-normal text-gray-500">{c.teacherName}</div>}
                </td>
                <td>{gradeRange(c.grades)}</td>
                <td className="whitespace-nowrap">
                  {WEEKDAYS[c.weekday]} {c.startTime}-{c.endTime}
                </td>
                <td className="whitespace-nowrap text-gray-600">{c.room ?? "—"}</td>
                <td>{c.pricePerTerm.toLocaleString()}</td>
                <td>{c.capacity}</td>
                <td>{c.active ? <Badge color="green">เปิดรับ</Badge> : <Badge>ปิด</Badge>}</td>
                <td>
                  {canEdit && (
                    <Button variant="ghost" onClick={() => setEditing(c)}>
                      แก้ไข
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </Table>
        </section>
      ))}
    </div>
  );
}
