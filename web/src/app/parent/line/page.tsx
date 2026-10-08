"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui";
import { api, go } from "@/lib/client/api";

// ผู้ปกครองเข้าระบบด้วย LINE (LIFF) — ใช้ลิงก์หน้านี้เป็น Endpoint URL ของ LIFF app และใส่ใน rich menu ของ LINE OA
// ยังไม่ได้ทดสอบกับ LINE จริง (ต้องมี LINE Login channel + LIFF ID) ดู docs/GO_LIVE.md
interface Liff {
  init(opts: { liffId: string }): Promise<void>;
  isLoggedIn(): boolean;
  login(): void;
  getIDToken(): string | null;
}

function loadLiff(): Promise<Liff> {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://static.line-scdn.net/liff/edge/2/sdk.js";
    script.onload = () => resolve((window as unknown as { liff: Liff }).liff);
    script.onerror = () => reject(new Error("โหลด LINE ไม่สำเร็จ ตรวจการเชื่อมต่ออินเทอร์เน็ต"));
    document.head.appendChild(script);
  });
}

export default function ParentLinePage() {
  const [message, setMessage] = useState("กำลังเข้าสู่ระบบด้วย LINE...");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { liffId } = await api<{ liffId: string | null }>("public/config");
      if (!liffId) throw new Error("สถาบันยังไม่ได้เปิดใช้การเข้าระบบด้วย LINE");
      const liff = await loadLiff();
      await liff.init({ liffId });
      if (!liff.isLoggedIn()) return liff.login();
      await api("auth/line", { idToken: liff.getIDToken() });
      go("/parent");
    })().catch((err: Error) => {
      if (!alive) return;
      setMessage(err.message);
      setFailed(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center p-6 text-center">
      <Card>
        <p>{message}</p>
        {failed && (
          <Link href="/login" className="mt-3 inline-block font-semibold text-amber-700 underline">
            เข้าด้วยเบอร์โทรและรหัสผ่าน
          </Link>
        )}
      </Card>
    </main>
  );
}
