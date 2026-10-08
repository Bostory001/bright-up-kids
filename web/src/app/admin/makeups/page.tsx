"use client";

import { useState } from "react";
import { Badge, Button, ErrorText, Input, Table } from "@/components/ui";
import { api, useLoad } from "@/lib/client/api";
import type { Makeup } from "@/lib/types";

interface Names {
  studentCode?: string;
  studentNickname?: string;
  courseName?: string;
}
const STATUS = { planned: ["amber", "นัดแล้ว"], done: ["green", "เรียนแล้ว"], cancelled: ["gray", "ยกเลิก"] } as const;

export default function MakeupsPage() {
  const { data, error, reload } = useLoad<{
    missed: ({ attendanceId: string; date: string; status: "absent" | "leave" } & Names)[];
    makeups: (Makeup & Names)[];
  }>("admin/makeups");
  const [dates, setDates] = useState<Record<string, string>>({});
  const [actionError, setActionError] = useState("");

  async function run(fn: () => Promise<unknown>) {
    setActionError("");
    try {
      await fn();
      reload();
    } catch (err) {
      setActionError((err as Error).message);
    }
  }

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold">เรียนชดเชย</h1>
      <ErrorText>{error || actionError}</ErrorText>

      <h2 className="text-lg font-bold">คาบที่ขาด/ลา ยังไม่ได้นัดชดเชย (45 วันล่าสุด)</h2>
      <Table head={["วันที่ขาด", "นักเรียน", "คอร์ส", "สาเหตุ", "นัดชดเชยวันที่", ""]}>
        {data?.missed.map((m) => (
          <tr key={m.attendanceId}>
            <td className="whitespace-nowrap">{m.date}</td>
            <td>
              <span className="font-mono text-xs text-gray-500">{m.studentCode}</span> {m.studentNickname}
            </td>
            <td>{m.courseName}</td>
            <td>{m.status === "absent" ? "ขาด" : "ลา"}</td>
            <td>
              <Input type="date" value={dates[m.attendanceId] ?? ""} onChange={(e) => setDates({ ...dates, [m.attendanceId]: e.target.value })} />
            </td>
            <td>
              <Button disabled={!dates[m.attendanceId]} onClick={() => run(() => api("admin/makeups", { attendanceId: m.attendanceId, makeupDate: dates[m.attendanceId] }))}>
                นัด + แจ้งผู้ปกครอง
              </Button>
            </td>
          </tr>
        ))}
      </Table>
      {data?.missed.length === 0 && <p className="text-sm text-gray-500">ไม่มีคาบค้างชดเชย</p>}

      <h2 className="text-lg font-bold">นัดชดเชย</h2>
      <Table head={["วันชดเชย", "นักเรียน", "คอร์ส", "แทนวันที่", "สถานะ", ""]}>
        {data?.makeups.map((m) => (
          <tr key={m.id}>
            <td className="whitespace-nowrap font-medium">{m.makeupDate}</td>
            <td>
              <span className="font-mono text-xs text-gray-500">{m.studentCode}</span> {m.studentNickname}
            </td>
            <td>{m.courseName}</td>
            <td>{m.missedDate}</td>
            <td>
              <Badge color={STATUS[m.status][0]}>{STATUS[m.status][1]}</Badge>
            </td>
            <td className="flex gap-1">
              {m.status === "planned" && (
                <>
                  <Button onClick={() => run(() => api(`admin/makeups/${m.id}`, { status: "done" }, "PATCH"))}>มาเรียนแล้ว</Button>
                  <Button variant="ghost" onClick={() => run(() => api(`admin/makeups/${m.id}`, { status: "cancelled" }, "PATCH"))}>
                    ยกเลิก
                  </Button>
                </>
              )}
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
