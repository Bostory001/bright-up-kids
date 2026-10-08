"use client";

import { useState } from "react";
import { Button, Card, ErrorText, Field, Input, Select } from "@/components/ui";
import { api } from "@/lib/client/api";

const EMPTY = { parentName: "", phone: "", childNickname: "", grade: "1", source: "", note: "" };

// ฟอร์มขอทดลองเรียนฟรี — ลิงก์นี้ใช้ในโพสต์ ใบปลิว และ QR หน้าร้าน
export default function TrialPage() {
  const [form, setForm] = useState(EMPTY);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api("public/trial", { ...form, grade: Number(form.grade), consent });
      setDone(true);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  if (done) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center p-6 text-center">
        <Card>
          <div className="text-5xl">🙌</div>
          <h1 className="mt-2 text-xl font-bold">ได้รับข้อมูลแล้ว</h1>
          <p className="mt-2 text-gray-600">สถาบันจะโทรกลับเพื่อนัดวันทดลองเรียนค่ะ</p>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-md flex-1 p-6">
      <h1 className="text-2xl font-bold text-amber-600">ทดลองเรียนฟรี</h1>
      <p className="mt-1 text-gray-600">กรอกข้อมูลสั้น ๆ แล้วเราจะติดต่อกลับเพื่อนัดวัน</p>
      <form onSubmit={submit} className="mt-4 grid gap-3">
        <Card className="grid gap-3">
          <Field label="ชื่อผู้ปกครอง">
            <Input value={form.parentName} onChange={set("parentName")} required />
          </Field>
          <Field label="เบอร์โทร">
            <Input value={form.phone} onChange={set("phone")} inputMode="tel" required />
          </Field>
          <Field label="ชื่อเล่นน้อง">
            <Input value={form.childNickname} onChange={set("childNickname")} required />
          </Field>
          <Field label="ชั้น">
            <Select value={form.grade} onChange={set("grade")}>
              {[1, 2, 3, 4, 5, 6].map((g) => (
                <option key={g} value={g}>
                  ป.{g}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="รู้จักเราจากช่องทางไหน (ไม่บังคับ)">
            <Select value={form.source} onChange={set("source")}>
              <option value="">-- เลือก --</option>
              {["Facebook", "TikTok", "Instagram", "LINE", "ใบปลิว", "เพื่อนแนะนำ", "เดินผ่านหน้าร้าน"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
          </Field>
          <Field label="อยากให้เน้นเรื่องอะไร (ไม่บังคับ)">
            <Input value={form.note} onChange={set("note")} />
          </Field>
        </Card>
        <label className="flex items-start gap-3 rounded-2xl bg-white p-4 text-sm shadow-sm">
          <input type="checkbox" className="mt-1 h-5 w-5" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <span>ยินยอมให้สถาบันใช้ข้อมูลนี้เพื่อติดต่อกลับเรื่องการทดลองเรียนเท่านั้น และขอให้ลบข้อมูลได้ทุกเมื่อ</span>
        </label>
        <ErrorText>{error}</ErrorText>
        <Button type="submit" disabled={!consent} className="py-3 text-base">
          ขอทดลองเรียนฟรี
        </Button>
      </form>
    </main>
  );
}
