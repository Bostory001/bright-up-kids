"use client";

import { useState } from "react";
import { api } from "@/lib/client/api";
import { Button, Card, ErrorText, Field, Input } from "./ui";

// ตั้ง 2FA + เปลี่ยนรหัสผ่าน — ใช้ทั้งหน้า /admin/security และตอนบังคับตั้งค่าครั้งแรก
export function SecurityPanel({ totpEnabled, onChanged }: { totpEnabled: boolean; onChanged: () => void }) {
  const [setup, setSetup] = useState<{ secret: string; qr: string } | null>(null);
  const [code, setCode] = useState("");
  const [pw, setPw] = useState({ current: "", next: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function run(fn: () => Promise<void>) {
    setError("");
    setMessage("");
    try {
      await fn();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="grid gap-4">
      <Card className="grid gap-3">
        <h2 className="font-bold">ยืนยันตัวตน 2 ขั้น (2FA)</h2>
        {totpEnabled ? (
          <p className="text-green-700">✅ เปิดใช้แล้ว — ทุกครั้งที่เข้าระบบต้องกรอกรหัส 6 หลักจากแอป</p>
        ) : !setup ? (
          <>
            <p className="text-sm text-gray-600">
              ครูและเจ้าของต้องเปิด 2FA ก่อนใช้งาน เพราะเห็นข้อมูลเด็กและการเงิน ติดตั้งแอป Google Authenticator หรือ Microsoft Authenticator
              บนมือถือก่อน แล้วกดปุ่มด้านล่าง
            </p>
            <Button onClick={() => run(async () => setSetup(await api("auth/2fa/begin", {})))}>เริ่มตั้งค่า 2FA</Button>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-600">1) เปิดแอป Authenticator แล้วสแกน QR นี้ (หรือพิมพ์กุญแจด้านล่าง)</p>
            {/* eslint-disable-next-line @next/next/no-img-element -- data URL จาก server */}
            <img src={setup.qr} alt="QR สำหรับตั้งค่า 2FA" className="mx-auto h-48 w-48" />
            <code className="break-all rounded-lg bg-gray-100 p-2 text-center text-xs">{setup.secret}</code>
            <Field label="2) กรอกรหัส 6 หลักที่แอปแสดง">
              <Input value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" maxLength={6} />
            </Field>
            <Button
              onClick={() =>
                run(async () => {
                  await api("auth/2fa/enable", { code });
                  setSetup(null);
                  onChanged();
                })
              }
            >
              เปิดใช้ 2FA
            </Button>
          </>
        )}
      </Card>

      <Card className="grid gap-3">
        <h2 className="font-bold">เปลี่ยนรหัสผ่าน</h2>
        <Field label="รหัสผ่านเดิม">
          <Input type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
        </Field>
        <Field label="รหัสผ่านใหม่ (อย่างน้อย 8 ตัว)">
          <Input type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
        </Field>
        <Button
          variant="ghost"
          onClick={() =>
            run(async () => {
              await api("auth/password", pw);
              setPw({ current: "", next: "" });
              setMessage("เปลี่ยนรหัสผ่านแล้ว");
              onChanged();
            })
          }
        >
          บันทึกรหัสผ่านใหม่
        </Button>
      </Card>
      <ErrorText>{error}</ErrorText>
      {message && <p className="rounded-xl bg-green-50 p-3 text-sm text-green-700">{message}</p>}
    </div>
  );
}
