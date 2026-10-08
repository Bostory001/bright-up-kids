"use client";

import { useState } from "react";
import { Badge, Button, Card, ErrorText, Field, Input, Table } from "@/components/ui";
import { api, useLoad } from "@/lib/client/api";
import type { Redemption, Reward } from "@/lib/types";

type Editing = Omit<Reward, "id"> & { id?: string };
const EMPTY: Editing = { name: "", costCoins: 50, costBaht: 10, stock: 10, active: true };
const STATUS = { requested: ["amber", "รอส่งมอบ"], handed_over: ["green", "ส่งมอบแล้ว"], rejected: ["gray", "ปฏิเสธ"] } as const;

export default function RewardsPage() {
  const rewards = useLoad<{ rewards: Reward[] }>("admin/rewards");
  const red = useLoad<{ spent: number; budget: number; redemptions: (Redemption & { studentCode?: string; studentNickname?: string })[] }>("admin/redemptions");
  const [editing, setEditing] = useState<Editing | null>(null);
  const [actionError, setActionError] = useState("");

  async function run(fn: () => Promise<unknown>) {
    setActionError("");
    try {
      await fn();
      rewards.reload();
      red.reload();
    } catch (err) {
      setActionError((err as Error).message);
    }
  }

  const spent = red.data?.spent ?? 0;
  const budget = red.data?.budget ?? 1;
  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold">ของรางวัล</h1>
      <Card>
        <div className="flex justify-between text-sm">
          <span>งบของรางวัลเดือนนี้ (นับจากที่ส่งมอบแล้ว)</span>
          <b>
            {spent.toLocaleString()} / {budget.toLocaleString()} บาท
          </b>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-gray-200">
          <div className={`h-full ${spent / budget > 0.9 ? "bg-red-500" : "bg-amber-400"}`} style={{ width: `${Math.min(100, (spent / budget) * 100)}%` }} />
        </div>
      </Card>
      <ErrorText>{rewards.error || red.error || actionError}</ErrorText>

      <h2 className="text-lg font-bold">คำขอแลก</h2>
      <Table head={["วันที่ขอ", "นักเรียน", "ของรางวัล", "เหรียญ", "ต้นทุน", "สถานะ", ""]}>
        {red.data?.redemptions.map((r) => (
          <tr key={r.id}>
            <td className="whitespace-nowrap">{new Date(r.requestedAt).toLocaleDateString("th-TH")}</td>
            <td>
              <span className="font-mono text-xs text-gray-500">{r.studentCode}</span> {r.studentNickname}
            </td>
            <td>{r.rewardName}</td>
            <td>{r.costCoins}</td>
            <td>{r.costBaht}</td>
            <td>
              <Badge color={STATUS[r.status][0]}>{STATUS[r.status][1]}</Badge>
            </td>
            <td className="flex gap-1">
              {r.status === "requested" && (
                <>
                  <Button onClick={() => run(() => api(`admin/redemptions/${r.id}/handover`, {}))}>ส่งมอบ</Button>
                  <Button variant="ghost" onClick={() => run(() => api(`admin/redemptions/${r.id}/reject`, {}))}>
                    ปฏิเสธ
                  </Button>
                </>
              )}
            </td>
          </tr>
        ))}
      </Table>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">รายการของรางวัล</h2>
        <Button onClick={() => setEditing(EMPTY)}>เพิ่มของรางวัล</Button>
      </div>
      {editing && (
        <Card className="grid gap-3 sm:grid-cols-2">
          <Field label="ชื่อของรางวัล">
            <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
          </Field>
          <Field label="ราคา (เหรียญ)">
            <Input type="number" value={editing.costCoins} onChange={(e) => setEditing({ ...editing, costCoins: Number(e.target.value) })} />
          </Field>
          <Field label="ต้นทุนจริง (บาท)">
            <Input type="number" value={editing.costBaht} onChange={(e) => setEditing({ ...editing, costBaht: Number(e.target.value) })} />
          </Field>
          <Field label="จำนวนคงเหลือ">
            <Input type="number" value={editing.stock} onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })} />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} /> เปิดให้แลก
          </label>
          <div className="flex gap-2 sm:col-span-2">
            <Button
              onClick={() =>
                run(async () => {
                  await api(editing.id ? `admin/rewards/${editing.id}` : "admin/rewards", editing, editing.id ? "PATCH" : "POST");
                  setEditing(null);
                })
              }
            >
              บันทึก
            </Button>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              ยกเลิก
            </Button>
          </div>
        </Card>
      )}
      <Table head={["ของรางวัล", "เหรียญ", "ต้นทุน (บาท)", "คงเหลือ", "สถานะ", ""]}>
        {rewards.data?.rewards.map((r) => (
          <tr key={r.id}>
            <td className="font-medium">{r.name}</td>
            <td>{r.costCoins}</td>
            <td>{r.costBaht}</td>
            <td>{r.stock}</td>
            <td>{r.active ? <Badge color="green">เปิด</Badge> : <Badge>ปิด</Badge>}</td>
            <td>
              <Button variant="ghost" onClick={() => setEditing(r)}>
                แก้ไข
              </Button>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
