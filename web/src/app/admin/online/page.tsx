"use client";

import { useState } from "react";
import { Badge, Button, Card, ErrorText, Input, Table } from "@/components/ui";
import { api, useLoad } from "@/lib/client/api";
import { WEEKDAY_TH } from "@/lib/schedule";

interface Row {
  courseId: string;
  name: string;
  startTime: string;
  endTime: string;
  meetUrl?: string;
}

export default function OnlinePage() {
  const { data, error, reload } = useLoad<{
    today: string;
    sessions: Row[];
    missing: number;
    courses: { id: string; name: string; weekday: number; startTime: string; endTime: string; meetUrl?: string }[];
  }>("admin/online");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");

  async function run(fn: () => Promise<string>) {
    setActionError("");
    setMessage("");
    try {
      setMessage(await fn());
      reload();
    } catch (err) {
      setActionError((err as Error).message);
    }
  }
  const save = (id: string) => run(async () => (await api(`admin/online/${id}/link`, { meetUrl: drafts[id] ?? "" }), "บันทึกลิงก์แล้ว"));
  const send = (id: string) => run(async () => `ส่งลิงก์ให้ผู้ปกครอง ${(await api(`admin/online/${id}/send`, {})).sent} คน (ถ้ายังไม่ตั้งค่า LINE จะค้างส่งที่หน้าแจ้งเตือน)`);

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold">คลาสออนไลน์ (Google Meet)</h1>
      <ErrorText>{error || actionError}</ErrorText>
      {message && <p className="rounded-xl bg-green-50 p-3 text-sm text-green-700">{message}</p>}
      {data && data.missing > 0 && (
        <p className="rounded-xl bg-red-50 p-3 font-medium text-red-700">⚠️ วันนี้มี {data.missing} คาบออนไลน์ที่ยังไม่มีลิงก์ Meet</p>
      )}
      {data && (
        <>
          <section className="grid gap-2">
            <h2 className="text-lg font-bold">วันนี้ ({data.today})</h2>
            {data.sessions.length === 0 && <p className="text-gray-500">วันนี้ไม่มีคาบออนไลน์</p>}
            {data.sessions.map((s) => (
              <Card key={s.courseId} className="flex flex-wrap items-center gap-3">
                <b>
                  {s.startTime}-{s.endTime} {s.name}
                </b>
                {s.meetUrl ? <Badge color="green">มีลิงก์แล้ว</Badge> : <Badge color="red">ยังไม่มีลิงก์</Badge>}
                {s.meetUrl && <Button onClick={() => send(s.courseId)}>ส่งลิงก์ให้ผู้ปกครองตอนนี้</Button>}
              </Card>
            ))}
          </section>
          <section className="grid gap-2">
            <h2 className="text-lg font-bold">คอร์สออนไลน์ทั้งหมด</h2>
            <p className="text-sm text-gray-600">ใช้ลิงก์ Meet ถาวรของคอร์ส วางครั้งเดียว ระบบส่งให้ผู้ปกครองอัตโนมัติก่อนคาบ 30 นาที · เปิดเป็นคอร์สออนไลน์ได้ที่หน้า “คอร์ส”</p>
            <Table head={["คอร์ส", "วันเวลา", "ลิงก์ Meet", ""]}>
              {data.courses.map((c) => (
                <tr key={c.id}>
                  <td className="font-medium">{c.name}</td>
                  <td className="whitespace-nowrap">
                    {WEEKDAY_TH[c.weekday]} {c.startTime}-{c.endTime}
                  </td>
                  <td>
                    <Input value={drafts[c.id] ?? c.meetUrl ?? ""} onChange={(e) => setDrafts({ ...drafts, [c.id]: e.target.value })} placeholder="https://meet.google.com/abc-defg-hij" />
                  </td>
                  <td>
                    <Button onClick={() => save(c.id)}>บันทึก</Button>
                  </td>
                </tr>
              ))}
            </Table>
          </section>
        </>
      )}
    </div>
  );
}
