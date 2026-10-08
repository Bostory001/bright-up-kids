"use client";

import { useState } from "react";
import { useMe } from "@/components/me";
import { Badge, Button, Card, ErrorText, Field, Input, Select, Table } from "@/components/ui";
import { api, todayStr, useLoad } from "@/lib/client/api";
import type { Invoice } from "@/lib/types";

type Row = Invoice & { studentCode?: string; studentNickname?: string };
const STATUS = { unpaid: ["red", "ยังไม่จ่าย"], slip_uploaded: ["amber", "รอตรวจสลิป"], paid: ["green", "จ่ายแล้ว"], void: ["gray", "ยกเลิก"] } as const;

export default function InvoicesPage() {
  const { me } = useMe();
  const { data, error, reload } = useLoad<{ invoices: Row[] }>("admin/invoices");
  const students = useLoad<{ students: { id: string; code: string; nickname: string; active: boolean }[] }>("admin/students");
  const [form, setForm] = useState<{ studentId: string; description: string; amount: string; dueDate: string } | null>(null);
  const [slip, setSlip] = useState<string | null>(null);
  const [filter, setFilter] = useState("open");
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");

  async function run(fn: () => Promise<void>) {
    setActionError("");
    setMessage("");
    try {
      await fn();
      reload();
    } catch (err) {
      setActionError((err as Error).message);
    }
  }

  const rows = (data?.invoices ?? []).filter((i) => (filter === "open" ? i.status === "unpaid" || i.status === "slip_uploaded" : filter === "all" || i.status === filter));

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">ค่าเรียน</h1>
        <div className="flex flex-wrap gap-2">
          <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="w-40">
            <option value="open">ค้างชำระ</option>
            <option value="slip_uploaded">รอตรวจสลิป</option>
            <option value="paid">จ่ายแล้ว</option>
            <option value="all">ทั้งหมด</option>
          </Select>
          <Button
            variant="ghost"
            onClick={() =>
              run(async () => {
                const res = await api("admin/invoices/remind", {});
                setMessage(`ส่งเตือน ${res.reminded} ใบ`);
              })
            }
          >
            เตือนค้างชำระ
          </Button>
          <Button onClick={() => setForm({ studentId: "", description: "", amount: "", dueDate: todayStr() })}>ออกใบแจ้ง</Button>
        </div>
      </div>
      <ErrorText>{error || actionError}</ErrorText>
      {message && <p className="rounded-xl bg-green-50 p-3 text-sm text-green-700">{message}</p>}

      {form && (
        <Card className="grid gap-3 sm:grid-cols-2">
          <Field label="นักเรียน">
            <Select value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })}>
              <option value="">-- เลือก --</option>
              {students.data?.students
                .filter((s) => s.active)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} {s.nickname}
                  </option>
                ))}
            </Select>
          </Field>
          <Field label="รายการ">
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
          <Field label="จำนวนเงิน (บาท)">
            <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          </Field>
          <Field label="ครบกำหนด">
            <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          </Field>
          <div className="flex gap-2 sm:col-span-2">
            <Button
              onClick={() =>
                run(async () => {
                  await api("admin/invoices", { ...form, amount: Number(form.amount) });
                  setForm(null);
                })
              }
            >
              บันทึก
            </Button>
            <Button variant="ghost" onClick={() => setForm(null)}>
              ยกเลิก
            </Button>
          </div>
        </Card>
      )}

      {slip && (
        <Card className="text-center">
          {/* eslint-disable-next-line @next/next/no-img-element -- data URL */}
          <img src={slip} alt="สลิป" className="mx-auto max-h-[70vh]" />
          <Button variant="ghost" className="mt-2" onClick={() => setSlip(null)}>
            ปิด
          </Button>
        </Card>
      )}

      <Table head={["นักเรียน", "รายการ", "จำนวนเงิน", "ครบกำหนด", "สถานะ", ""]}>
        {rows.map((i) => (
          <tr key={i.id}>
            <td className="whitespace-nowrap">
              <span className="font-mono text-xs text-gray-500">{i.studentCode}</span> {i.studentNickname}
            </td>
            <td>{i.description}</td>
            <td className="font-medium">{i.amount.toLocaleString()}</td>
            <td className="whitespace-nowrap">{i.dueDate}</td>
            <td>
              <Badge color={STATUS[i.status][0]}>{STATUS[i.status][1]}</Badge>
              {i.paidDate && <div className="text-xs text-gray-500">{i.paidDate}</div>}
            </td>
            <td className="flex gap-1">
              {i.status === "slip_uploaded" && (
                <Button variant="ghost" onClick={() => run(async () => setSlip((await api(`slips/${i.id}`)).dataUrl))}>
                  ดูสลิป
                </Button>
              )}
              {(i.status === "unpaid" || i.status === "slip_uploaded") && <Button onClick={() => run(() => api(`admin/invoices/${i.id}/pay`, {}))}>ยืนยันรับเงิน</Button>}
              {me.role === "owner" && i.status !== "void" && (
                <Button variant="ghost" onClick={() => window.confirm("ยกเลิกใบแจ้งนี้?") && run(() => api(`admin/invoices/${i.id}/void`, {}))}>
                  ยกเลิก
                </Button>
              )}
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
