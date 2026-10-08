"use client";

import { useState } from "react";
import { Button, Card, ErrorText, Field, Input } from "@/components/ui";
import { api, go } from "@/lib/client/api";

export default function SetupPage() {
  const [form, setForm] = useState({ displayName: "", username: "", password: "" });
  const [error, setError] = useState("");
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api("setup", form);
      go("/admin");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center p-6">
      <Card>
        <h1 className="text-xl font-bold">เริ่มใช้งานครั้งแรก</h1>
        <p className="mb-4 text-sm text-gray-600">สร้างบัญชีเจ้าของ (ทำได้ครั้งเดียว) หลังจากนี้ระบบจะให้ตั้ง 2FA</p>
        <form onSubmit={submit} className="grid gap-3">
          <Field label="ชื่อที่แสดง">
            <Input value={form.displayName} onChange={set("displayName")} required />
          </Field>
          <Field label="ชื่อเข้าระบบ">
            <Input value={form.username} onChange={set("username")} autoCapitalize="none" required />
          </Field>
          <Field label="รหัสผ่าน (อย่างน้อย 8 ตัว)">
            <Input type="password" value={form.password} onChange={set("password")} minLength={8} required />
          </Field>
          <ErrorText>{error}</ErrorText>
          <Button type="submit">สร้างบัญชี</Button>
        </form>
      </Card>
    </main>
  );
}
