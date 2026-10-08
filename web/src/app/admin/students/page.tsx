"use client";

import QRCode from "qrcode";
import { useState } from "react";
import { Badge, Button, Card, ErrorText, Field, Input, SecretBox, Select, Table } from "@/components/ui";
import { api, useLoad } from "@/lib/client/api";

interface Row {
  id: string;
  code: string;
  nickname: string;
  fullName: string;
  grade: number;
  school?: string;
  active: boolean;
  courseIds: string[];
  parentName?: string;
  parentPhone?: string;
}
type Editing = { id?: string; nickname: string; fullName: string; grade: number; school: string; active: boolean; courseIds: string[]; pdpaConsent: boolean };
const EMPTY: Editing = { nickname: "", fullName: "", grade: 1, school: "", active: true, courseIds: [], pdpaConsent: false };

export default function StudentsPage() {
  const { data, error, reload } = useLoad<{ students: Row[] }>("admin/students");
  const courses = useLoad<{ courses: { id: string; name: string; grades: number[] }[] }>("admin/courses");
  const [editing, setEditing] = useState<Editing | null>(null);
  const [secret, setSecret] = useState<{ code: string; pin: string } | null>(null);
  const [card, setCard] = useState<{ row: Row; qr: string } | null>(null);
  const [formError, setFormError] = useState("");
  const [search, setSearch] = useState("");

  async function run(fn: () => Promise<void>) {
    setFormError("");
    try {
      await fn();
    } catch (err) {
      setFormError((err as Error).message);
    }
  }

  const save = () =>
    run(async () => {
      if (!editing) return;
      let id = editing.id;
      if (id) await api(`admin/students/${id}`, editing, "PATCH");
      else {
        const res = await api("admin/students", editing);
        id = res.student.id as string;
        setSecret({ code: res.student.code, pin: res.pin });
      }
      await api(`admin/students/${id}/courses`, { courseIds: editing.courseIds });
      setEditing(null);
      reload();
    });

  const resetPin = (row: Row) =>
    run(async () => {
      const res = await api(`admin/students/${row.id}/pin`, {});
      setSecret({ code: row.code, pin: res.pin });
    });

  const showCard = (row: Row) =>
    run(async () => {
      const url = `${window.location.origin}/play/login?code=${row.code}`;
      setCard({ row, qr: await QRCode.toDataURL(url, { margin: 1, width: 280 }) });
    });

  const rows = (data?.students ?? []).filter((s) => `${s.code} ${s.nickname} ${s.fullName}`.toLowerCase().includes(search.toLowerCase()));
  const courseName = (id: string) => courses.data?.courses.find((c) => c.id === id)?.name ?? "";

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <h1 className="text-2xl font-bold">นักเรียน</h1>
        <div className="flex gap-2">
          <Input placeholder="ค้นหา รหัส / ชื่อ" value={search} onChange={(e) => setSearch(e.target.value)} className="w-48" />
          <Button onClick={() => setEditing(EMPTY)}>เพิ่มนักเรียน</Button>
        </div>
      </div>
      <ErrorText>{error || formError}</ErrorText>
      {secret && (
        <SecretBox
          title="รหัสเข้าระบบของนักเรียน"
          lines={[
            ["รหัสนักเรียน", secret.code],
            ["PIN", secret.pin],
          ]}
          onClose={() => setSecret(null)}
        />
      )}

      {card && (
        <Card className="mx-auto w-72 text-center">
          <div className="text-lg font-bold text-amber-600">Bright Up Kids</div>
          {/* eslint-disable-next-line @next/next/no-img-element -- data URL */}
          <img src={card.qr} alt="QR เข้าระบบ" className="mx-auto" />
          <div className="text-xl font-bold">น้อง{card.row.nickname}</div>
          <div className="font-mono text-lg">{card.row.code}</div>
          <p className="text-xs text-gray-500">สแกนแล้วใส่ PIN 4 หลัก</p>
          <div className="mt-2 flex justify-center gap-2 print:hidden">
            <Button onClick={() => window.print()}>พิมพ์</Button>
            <Button variant="ghost" onClick={() => setCard(null)}>
              ปิด
            </Button>
          </div>
        </Card>
      )}

      {editing && (
        <Card className="grid gap-3 sm:grid-cols-2 print:hidden">
          <Field label="ชื่อเล่น">
            <Input value={editing.nickname} onChange={(e) => setEditing({ ...editing, nickname: e.target.value })} />
          </Field>
          <Field label="ชื่อ-นามสกุล">
            <Input value={editing.fullName} onChange={(e) => setEditing({ ...editing, fullName: e.target.value })} />
          </Field>
          <Field label="ชั้น">
            <Select value={editing.grade} onChange={(e) => setEditing({ ...editing, grade: Number(e.target.value) })}>
              {[1, 2, 3, 4, 5, 6].map((g) => (
                <option key={g} value={g}>
                  ป.{g}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="โรงเรียน">
            <Input value={editing.school} onChange={(e) => setEditing({ ...editing, school: e.target.value })} />
          </Field>
          <div className="sm:col-span-2">
            <div className="mb-1 text-sm font-medium text-gray-700">คอร์สที่ลง</div>
            <div className="flex flex-wrap gap-3">
              {courses.data?.courses
                .filter((c) => c.grades.includes(editing.grade) || editing.courseIds.includes(c.id))
                .map((c) => (
                  <label key={c.id} className="flex items-center gap-1 text-sm">
                    <input
                      type="checkbox"
                      checked={editing.courseIds.includes(c.id)}
                      onChange={(e) => setEditing({ ...editing, courseIds: e.target.checked ? [...editing.courseIds, c.id] : editing.courseIds.filter((x) => x !== c.id) })}
                    />
                    {c.name}
                  </label>
                ))}
            </div>
          </div>
          {editing.id ? (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} /> ยังเรียนอยู่
            </label>
          ) : (
            <label className="flex items-start gap-2 text-sm sm:col-span-2">
              <input type="checkbox" className="mt-1" checked={editing.pdpaConsent} onChange={(e) => setEditing({ ...editing, pdpaConsent: e.target.checked })} />
              ผู้ปกครองเซ็นยินยอมให้เก็บข้อมูลเด็ก (PDPA) บนเอกสารแล้ว
            </label>
          )}
          <div className="flex gap-2 sm:col-span-2">
            <Button onClick={save}>บันทึก</Button>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              ยกเลิก
            </Button>
          </div>
        </Card>
      )}

      <div className="print:hidden">
        <Table head={["รหัส", "ชื่อเล่น", "ชื่อ-นามสกุล", "ชั้น", "คอร์ส", "ผู้ปกครอง", "สถานะ", ""]}>
          {rows.map((s) => (
            <tr key={s.id}>
              <td className="font-mono">{s.code}</td>
              <td className="font-medium">{s.nickname}</td>
              <td>{s.fullName}</td>
              <td>ป.{s.grade}</td>
              <td>{s.courseIds.map(courseName).filter(Boolean).join(", ")}</td>
              <td>
                {s.parentName} {s.parentPhone}
              </td>
              <td>{s.active ? <Badge color="green">เรียนอยู่</Badge> : <Badge>พัก/ออก</Badge>}</td>
              <td className="flex gap-1">
                <Button variant="ghost" onClick={() => setEditing({ ...EMPTY, ...s, school: s.school ?? "" })}>
                  แก้ไข
                </Button>
                <Button variant="ghost" onClick={() => showCard(s)}>
                  บัตร
                </Button>
                <Button variant="ghost" onClick={() => resetPin(s)}>
                  PIN ใหม่
                </Button>
              </td>
            </tr>
          ))}
        </Table>
      </div>
    </div>
  );
}
