"use client";

import { useState } from "react";
import { Badge, Button, Card, ErrorText, Table } from "@/components/ui";
import { api, useLoad } from "@/lib/client/api";
import type { Notification } from "@/lib/types";

const STATUS = { sent: ["green", "ส่งแล้ว"], queued: ["amber", "ค้างส่ง"], failed: ["red", "ส่งไม่สำเร็จ"] } as const;

export default function NotificationsPage() {
  const { data, error, reload } = useLoad<{
    lineConfigured: boolean;
    linkedParents: number;
    totalParents: number;
    notifications: (Notification & { parentName?: string })[];
  }>("admin/notifications");
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");

  async function weekly() {
    setActionError("");
    try {
      const res = await api("admin/notify/weekly", {});
      setMessage(`สร้างสรุปรายสัปดาห์ ${res.sent} คน`);
      reload();
    } catch (err) {
      setActionError((err as Error).message);
    }
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">แจ้งเตือน LINE</h1>
        <Button onClick={weekly}>ส่งสรุปรายสัปดาห์</Button>
      </div>
      <ErrorText>{error || actionError}</ErrorText>
      {message && <p className="rounded-xl bg-green-50 p-3 text-sm text-green-700">{message}</p>}
      {data && (
        <Card className="text-sm">
          <div>
            สถานะ LINE OA: {data.lineConfigured ? <Badge color="green">ตั้งค่าแล้ว</Badge> : <Badge color="red">ยังไม่ได้ตั้งค่า</Badge>} · ผู้ปกครองผูก LINE แล้ว{" "}
            {data.linkedParents}/{data.totalParents} คน
          </div>
          {!data.lineConfigured && (
            <p className="mt-2 text-gray-600">
              ข้อความจะถูกบันทึกเป็น “ค้างส่ง” จนกว่าจะใส่ LINE_CHANNEL_ACCESS_TOKEN และ LINE_CHANNEL_SECRET ใน .env.local และตั้ง Webhook URL ใน LINE
              Developers เป็น <code>/api/line/webhook</code>
            </p>
          )}
        </Card>
      )}
      <Table head={["เวลา", "ผู้ปกครอง", "ข้อความ", "สถานะ"]}>
        {data?.notifications.map((n) => (
          <tr key={n.id}>
            <td className="whitespace-nowrap text-xs text-gray-500">{new Date(n.createdAt).toLocaleString("th-TH")}</td>
            <td className="whitespace-nowrap">{n.parentName}</td>
            <td className="whitespace-pre-wrap">{n.text}</td>
            <td>
              <Badge color={STATUS[n.status][0]}>{STATUS[n.status][1]}</Badge>
              {n.error && <div className="text-xs text-gray-500">{n.error}</div>}
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
