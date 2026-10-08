"use client";

import { useEffect, useState } from "react";
import { ErrorText } from "@/components/ui";
import { api, go } from "@/lib/client/api";

// เข้าระบบนักเรียน: สแกน QR บนบัตร (เปิดหน้านี้พร้อม ?code=) หรือพิมพ์รหัสเอง แล้วกด PIN 4 หลัก
export default function StudentLoginPage() {
  const [code, setCode] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fromQr = new URLSearchParams(window.location.search).get("code");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- อ่านค่าจาก URL หลัง hydrate
    if (fromQr) setCode(fromQr.toUpperCase());
  }, []);

  async function press(digit: string) {
    if (pin.length >= 4) return;
    const next = pin + digit;
    setPin(next);
    setError("");
    if (next.length < 4) return;
    try {
      await api("auth/student", { code, pin: next });
      go("/play");
    } catch (err) {
      setError((err as Error).message);
      setPin("");
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-4 p-6 text-center">
      <h1 className="text-3xl font-bold text-amber-600">สวัสดีจ้า 👋</h1>
      <input
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="รหัสนักเรียน เช่น BUK0001"
        autoCapitalize="characters"
        className="rounded-2xl border-2 border-amber-300 bg-white p-4 text-center font-mono text-2xl outline-none"
      />
      <div className="text-lg">ใส่ PIN 4 หลัก</div>
      <div className="flex justify-center gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`h-5 w-5 rounded-full ${i < pin.length ? "bg-amber-500" : "bg-gray-300"}`} />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <button key={d} onClick={() => press(d)} disabled={!code} className="h-20 rounded-3xl bg-white text-3xl font-bold shadow-md active:scale-95 disabled:opacity-40">
            {d}
          </button>
        ))}
        <span />
        <button onClick={() => press("0")} disabled={!code} className="h-20 rounded-3xl bg-white text-3xl font-bold shadow-md active:scale-95 disabled:opacity-40">
          0
        </button>
        <button onClick={() => setPin(pin.slice(0, -1))} className="h-20 rounded-3xl bg-gray-100 text-2xl shadow-md active:scale-95">
          ⌫
        </button>
      </div>
      <ErrorText>{error}</ErrorText>
    </main>
  );
}
