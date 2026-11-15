"use client";

import { useState } from "react";
import { useMe } from "@/components/me";
import { Badge, Button, Card, ErrorText, Field, Input, Select, Table } from "@/components/ui";
import { api, todayStr, useLoad } from "@/lib/client/api";
import type { StockLine } from "@/lib/supplies";
import type { ExpenseCategory, SupplyMove } from "@/lib/types";

interface Data {
  lines: StockLine[];
  lowCount: number;
  categories: { key: ExpenseCategory; label: string }[];
  recent: (SupplyMove & { itemName: string })[];
}

const EMPTY = { name: "", unit: "ชิ้น", category: "office" as ExpenseCategory, minQty: "", note: "" };

export default function SuppliesPage() {
  const { me } = useMe();
  const { data, error, reload } = useLoad<Data>("admin/supplies");
  const [form, setForm] = useState<(typeof EMPTY & { id?: string }) | null>(null);
  const [take, setTake] = useState<{ id: string; name: string; unit: string; qty: string; note: string } | null>(null);
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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">คลังของใช้</h1>
        <Button onClick={() => setForm(EMPTY)}>เพิ่มของใช้</Button>
      </div>
      <p className="text-sm text-gray-600">
        ของเข้าคลังอัตโนมัติเมื่อบันทึกรายจ่ายหมวดของใช้แล้วเลือกช่อง “ตัดเข้าคลัง” · เบิกใช้กดที่ปุ่ม “เบิก” · จำนวนคงเหลือคิดจากรับเข้า−เบิกออกเสมอ แก้รายจ่ายย้อนหลังแล้วคลังตามทันที
      </p>
      <ErrorText>{error || actionError}</ErrorText>

      {!!data?.lowCount && (
        <Card className="border-2 border-red-300">
          <b className="text-red-700">ของใกล้หมด {data.lowCount} รายการ</b>
          <div className="text-sm text-gray-700">
            {data.lines
              .filter((l) => l.low)
              .map((l) => `${l.item.name} เหลือ ${l.qty} ${l.item.unit}`)
              .join(" · ")}
          </div>
        </Card>
      )}

      {form && (
        <Card className="grid gap-3 sm:grid-cols-2">
          <Field label="ชื่อของใช้">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="กระดาษ A4" />
          </Field>
          <Field label="หน่วยนับ">
            <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="รีม / ม้วน / กล่อง" />
          </Field>
          <Field label="หมวด">
            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ExpenseCategory })}>
              {(data?.categories ?? []).map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="เตือนเมื่อเหลือน้อยกว่า (เว้นว่าง = ไม่เตือน)">
            <Input type="number" value={form.minQty} onChange={(e) => setForm({ ...form, minQty: e.target.value })} placeholder="2" />
          </Field>
          <div className="flex gap-2 sm:col-span-2">
            <Button
              onClick={() =>
                run(async () => {
                  if (form.id) await api(`admin/supplies/${form.id}`, form, "PATCH");
                  else await api("admin/supplies", form);
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

      {take && (
        <Card className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <Field label={`เบิก ${take.name} (${take.unit})`}>
            <Input type="number" inputMode="decimal" value={take.qty} onChange={(e) => setTake({ ...take, qty: e.target.value })} />
          </Field>
          <Field label="เอาไปใช้ทำอะไร">
            <Input value={take.note} onChange={(e) => setTake({ ...take, note: e.target.value })} placeholder="เติมห้องเรียน 1" />
          </Field>
          <div className="flex items-end gap-2">
            <Button
              onClick={() =>
                run(async () => {
                  await api(`admin/supplies/${take.id}/move`, { kind: "out", qty: Number(take.qty), date: todayStr(), note: take.note });
                  setTake(null);
                })
              }
            >
              บันทึกเบิก
            </Button>
            <Button variant="ghost" onClick={() => setTake(null)}>
              ยกเลิก
            </Button>
          </div>
        </Card>
      )}

      {data?.lines.length === 0 && <p className="text-gray-500">ยังไม่มีของใช้ในคลัง — กด “เพิ่มของใช้” เพื่อเริ่ม</p>}
      {!!data?.lines.length && (
        <Table head={["ของใช้", "คงเหลือ", "จุดเตือน", "ใช้ 30 วัน", "จะหมดใน", "เคลื่อนไหวล่าสุด", ""]}>
          {data.lines.map((l) => (
            <tr key={l.item.id}>
              <td className="font-medium">
                {l.item.name}
                {l.low && (
                  <Badge color="red">
                    <span className="ml-1 text-[10px]">ใกล้หมด</span>
                  </Badge>
                )}
              </td>
              <td className={`font-medium ${l.low ? "text-red-600" : ""}`}>
                {l.qty} {l.item.unit}
              </td>
              <td className="text-gray-500">{l.item.minQty ?? "—"}</td>
              <td className="text-gray-500">{l.usedLast30 || "—"}</td>
              <td className={l.daysLeft !== null && l.daysLeft <= 14 ? "text-amber-600" : "text-gray-500"}>{l.daysLeft === null ? "—" : `~${l.daysLeft} วัน`}</td>
              <td className="text-gray-500">{l.lastMoveDate ?? "—"}</td>
              <td className="whitespace-nowrap">
                <Button variant="ghost" onClick={() => setTake({ id: l.item.id, name: l.item.name, unit: l.item.unit, qty: "1", note: "" })}>
                  เบิก
                </Button>
                <button
                  className="ml-2 text-sm text-gray-500 underline"
                  onClick={() => setForm({ id: l.item.id, name: l.item.name, unit: l.item.unit, category: l.item.category, minQty: String(l.item.minQty ?? ""), note: l.item.note ?? "" })}
                >
                  แก้
                </button>
                {me.role === "owner" && (
                  <button
                    className="ml-2 text-sm text-red-600 underline"
                    onClick={() => window.confirm(`ลบ "${l.item.name}" พร้อมประวัติทั้งหมด?`) && run(() => api(`admin/supplies/${l.item.id}`, {}, "DELETE"))}
                  >
                    ลบ
                  </button>
                )}
              </td>
            </tr>
          ))}
        </Table>
      )}

      {!!data?.recent.length && (
        <Card className="grid gap-1">
          <b>เคลื่อนไหวล่าสุด</b>
          {data.recent.map((m) => (
            <div key={m.id} className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
              <span>{m.date}</span>
              <Badge color={m.kind === "in" ? "green" : "amber"}>{m.kind === "in" ? "รับเข้า" : "เบิกออก"}</Badge>
              <span>
                {m.itemName} {m.qty}
              </span>
              {m.note && <span className="text-gray-400">· {m.note}</span>}
              {m.expenseId && <span className="text-xs text-gray-400">(จากรายจ่าย)</span>}
              {!m.expenseId && (
                <button className="text-xs text-red-600 underline" onClick={() => window.confirm("ลบรายการเคลื่อนไหวนี้?") && run(() => api(`admin/supplies/moves/${m.id}`, {}, "DELETE"))}>
                  ลบ
                </button>
              )}
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
