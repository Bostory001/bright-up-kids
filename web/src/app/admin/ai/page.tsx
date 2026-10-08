"use client";

import { useState } from "react";
import { Button, Card, ErrorText } from "@/components/ui";
import { api, useLoad } from "@/lib/client/api";

const EXAMPLES = ["ใครค้างค่าเรียนเกินกำหนดบ้าง", "นักเรียนคนไหนควรฝึกเรื่องอะไรเพิ่ม", "สรุปการเข้าเรียนเดือนนี้ ใครขาดบ่อย", "ใครยังไม่ได้ทำแบบฝึกหัดออนไลน์เลย"];

export default function AiPage() {
  const status = useLoad<{ configured: boolean }>("admin/ai/status");
  const [question, setQuestion] = useState("");
  const [log, setLog] = useState<{ q: string; a: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function ask(q: string) {
    if (!q.trim() || busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await api("admin/ai/ask", { question: q });
      setLog((prev) => [{ q, a: res.answer }, ...prev]);
      setQuestion("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold">ผู้ช่วย AI</h1>
      <p className="text-sm text-gray-600">
        ใช้ได้เฉพาะครูและเจ้าของ · AI เห็นแค่รหัสนักเรียน ชื่อเล่น และสถิติ (ไม่เห็นชื่อจริง เบอร์โทร หรือชื่อผู้ปกครอง) · คำตอบเป็นข้อเสนอ ควรตรวจกับข้อมูลจริง
      </p>
      {status.data && !status.data.configured && (
        <ErrorText>ยังไม่ได้ตั้งค่า ANTHROPIC_API_KEY — ใส่ในไฟล์ .env.local แล้วเปิดระบบใหม่ (ดู .env.local.example)</ErrorText>
      )}
      <Card className="grid gap-3">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
          placeholder="พิมพ์คำถามเป็นภาษาไทย"
          className="w-full rounded-xl border border-gray-300 p-3"
        />
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button key={ex} onClick={() => setQuestion(ex)} className="rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-800">
              {ex}
            </button>
          ))}
        </div>
        <Button onClick={() => ask(question)} disabled={busy || !question.trim()}>
          {busy ? "กำลังคิด..." : "ถาม"}
        </Button>
      </Card>
      <ErrorText>{error}</ErrorText>
      {log.map((item, i) => (
        <Card key={log.length - i}>
          <div className="font-bold text-amber-700">ถาม: {item.q}</div>
          <div className="mt-2 whitespace-pre-wrap">{item.a}</div>
        </Card>
      ))}
    </div>
  );
}
