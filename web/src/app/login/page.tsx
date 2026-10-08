"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, Card, ErrorText, Field, Input } from "@/components/ui";
import { api, go } from "@/lib/client/api";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [needsCode, setNeedsCode] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const res = await api("auth/login", { username, password, code: needsCode ? code : undefined });
      if (res.needsCode) return setNeedsCode(true);
      go(res.role === "parent" ? "/parent" : "/admin");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center p-6">
      <Card>
        <h1 className="mb-4 text-xl font-bold">เข้าสู่ระบบ ครู / ผู้ปกครอง</h1>
        <form onSubmit={submit} className="grid gap-3">
          <Field label="ชื่อเข้าระบบ (ผู้ปกครองใช้เบอร์โทร)">
            <Input value={username} onChange={(e) => setUsername(e.target.value)} autoCapitalize="none" disabled={needsCode} required />
          </Field>
          <Field label="รหัสผ่าน">
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={needsCode} required />
          </Field>
          {needsCode && (
            <Field label="รหัส 6 หลักจากแอป Authenticator">
              <Input value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" maxLength={6} autoFocus required />
            </Field>
          )}
          <ErrorText>{error}</ErrorText>
          <Button type="submit">{needsCode ? "ยืนยัน" : "เข้าสู่ระบบ"}</Button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-500">
          นักเรียนเข้าที่ <Link href="/play" className="text-amber-700 underline">หน้านักเรียน</Link>
        </p>
      </Card>
    </main>
  );
}
