"use client";

import { useState } from "react";
import { Button, Card, ErrorText, Field, Input, Select } from "@/components/ui";
import { api, useLoad } from "@/lib/client/api";

interface PublicCourse {
  id: string;
  name: string;
  grades: number[];
  pricePerTerm: number;
  schedule: string;
}

const EMPTY = { parentName: "", phone: "", studentFullName: "", nickname: "", grade: "1", school: "" };

export default function EnrollPage() {
  const { data } = useLoad<{ courses: PublicCourse[] }>("public/courses");
  const [form, setForm] = useState(EMPTY);
  const [courseIds, setCourseIds] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value });
  const courses = (data?.courses ?? []).filter((c) => c.grades.includes(Number(form.grade)));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api("public/enroll", { ...form, grade: Number(form.grade), courseIds, pdpaConsent: consent });
      setDone(true);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  if (done) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center p-6 text-center">
        <Card>
          <div className="text-5xl">🎉</div>
          <h1 className="mt-2 text-xl font-bold">ส่งใบสมัครแล้ว</h1>
          <p className="mt-2 text-gray-600">สถาบันจะติดต่อกลับทางเบอร์โทรที่ให้ไว้ เพื่อแจ้งรหัสเข้าระบบและค่าเรียน</p>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-md flex-1 p-6">
      <h1 className="text-2xl font-bold text-amber-600">สมัครเรียน Bright Up Kids</h1>
      <form onSubmit={submit} className="mt-4 grid gap-3">
        <Card className="grid gap-3">
          <div className="font-bold">ผู้ปกครอง</div>
          <Field label="ชื่อผู้ปกครอง">
            <Input value={form.parentName} onChange={set("parentName")} required />
          </Field>
          <Field label="เบอร์โทร (ใช้เข้าระบบผู้ปกครอง)">
            <Input value={form.phone} onChange={set("phone")} inputMode="tel" required />
          </Field>
        </Card>
        <Card className="grid gap-3">
          <div className="font-bold">นักเรียน</div>
          <Field label="ชื่อ-นามสกุล">
            <Input value={form.studentFullName} onChange={set("studentFullName")} required />
          </Field>
          <Field label="ชื่อเล่น">
            <Input value={form.nickname} onChange={set("nickname")} required />
          </Field>
          <Field label="ชั้น">
            <Select
              value={form.grade}
              onChange={(e) => {
                set("grade")(e);
                setCourseIds([]);
              }}
            >
              {[1, 2, 3, 4, 5, 6].map((g) => (
                <option key={g} value={g}>
                  ป.{g}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="โรงเรียน (ไม่บังคับ)">
            <Input value={form.school} onChange={set("school")} />
          </Field>
        </Card>
        <Card className="grid gap-2">
          <div className="font-bold">คอร์สที่สนใจ</div>
          {courses.length === 0 && <p className="text-sm text-gray-500">ยังไม่มีคอร์สสำหรับชั้นนี้</p>}
          {courses.map((c) => (
            <label key={c.id} className="flex items-start gap-3 rounded-xl border border-gray-200 p-3">
              <input
                type="checkbox"
                className="mt-1 h-5 w-5"
                checked={courseIds.includes(c.id)}
                onChange={(e) => setCourseIds(e.target.checked ? [...courseIds, c.id] : courseIds.filter((id) => id !== c.id))}
              />
              <span>
                <b>{c.name}</b>
                <span className="block text-sm text-gray-500">
                  {c.schedule} · {c.pricePerTerm.toLocaleString()} บาท/เทอม
                </span>
              </span>
            </label>
          ))}
        </Card>
        <label className="flex items-start gap-3 rounded-2xl bg-white p-4 text-sm shadow-sm">
          <input type="checkbox" className="mt-1 h-5 w-5" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <span>
            ข้าพเจ้าในฐานะผู้ปกครอง ยินยอมให้สถาบันเก็บและใช้ข้อมูลของข้าพเจ้าและบุตรหลาน (ชื่อ ชั้นเรียน เบอร์โทร การเข้าเรียน ผลแบบฝึกหัด
            และการชำระเงิน) เพื่อการจัดการเรียนการสอนและการติดต่อเท่านั้น และสามารถขอดู แก้ไข หรือลบข้อมูลได้โดยแจ้งสถาบัน
          </span>
        </label>
        <ErrorText>{error}</ErrorText>
        <Button type="submit" disabled={!consent || courseIds.length === 0} className="py-3 text-base">
          ส่งใบสมัคร
        </Button>
      </form>
    </main>
  );
}
