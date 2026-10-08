"use client";

import { useState } from "react";
import { Button, Card, ErrorText, Field, Input, Select } from "@/components/ui";
import { api, useLoad } from "@/lib/client/api";
import type { Lead } from "@/lib/types";

const STATUS: Record<Lead["status"], string> = {
  new: "ใหม่ ยังไม่ได้ติดต่อ",
  contacted: "ติดต่อแล้ว",
  booked: "นัดทดลองเรียนแล้ว",
  attended: "มาทดลองเรียนแล้ว",
  enrolled: "สมัครเรียนแล้ว",
  lost: "ไม่สนใจ",
};
const EMPTY = { parentName: "", phone: "", childNickname: "", grade: "1", source: "", note: "" };

export default function LeadsPage() {
  const { data, error, reload } = useLoad<{ leads: Lead[]; funnel: { total: number; booked: number; attended: number; enrolled: number } }>("admin/leads");
  const [form, setForm] = useState<typeof EMPTY | null>(null);
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
  const patch = (lead: Lead, change: Partial<Lead>) => run(() => api(`admin/leads/${lead.id}`, { ...lead, ...change }, "PATCH"));
  const f = data?.funnel;
  const pct = (n: number) => (f && f.total ? ` (${Math.round((n / f.total) * 100)}%)` : "");

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ผู้สนใจ / ทดลองเรียน</h1>
        <Button onClick={() => setForm(EMPTY)}>เพิ่มเอง</Button>
      </div>
      <p className="text-sm text-gray-600">
        ฟอร์มขอทดลองเรียนฟรีสำหรับใส่ในโพสต์/ใบปลิว: <code className="rounded bg-white px-2 py-1">/trial</code>
      </p>
      <ErrorText>{error || actionError}</ErrorText>
      {f && (
        <Card className="grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
          {[
            ["ผู้สนใจทั้งหมด", String(f.total)],
            ["นัดทดลองเรียน", `${f.booked}${pct(f.booked)}`],
            ["มาทดลองจริง", `${f.attended}${pct(f.attended)}`],
            ["สมัครเรียน", `${f.enrolled}${pct(f.enrolled)}`],
          ].map(([label, value]) => (
            <div key={label}>
              <div className="text-xs text-gray-500">{label}</div>
              <div className="text-xl font-bold">{value}</div>
            </div>
          ))}
        </Card>
      )}

      {form && (
        <Card className="grid gap-3 sm:grid-cols-2">
          <Field label="ชื่อผู้ปกครอง">
            <Input value={form.parentName} onChange={(e) => setForm({ ...form, parentName: e.target.value })} />
          </Field>
          <Field label="เบอร์โทร">
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
          <Field label="ชื่อเล่นน้อง">
            <Input value={form.childNickname} onChange={(e) => setForm({ ...form, childNickname: e.target.value })} />
          </Field>
          <Field label="ชั้น">
            <Select value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })}>
              {[1, 2, 3, 4, 5, 6].map((g) => (
                <option key={g} value={g}>
                  ป.{g}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="รู้จักจากช่องทางไหน">
            <Input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="Facebook / ใบปลิว / เพื่อนแนะนำ / เดินผ่าน" />
          </Field>
          <Field label="บันทึก">
            <Input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </Field>
          <div className="flex gap-2 sm:col-span-2">
            <Button
              onClick={() =>
                run(async () => {
                  await api("admin/leads", { ...form, grade: Number(form.grade) });
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

      {data?.leads.length === 0 && <p className="text-gray-500">ยังไม่มีผู้สนใจ</p>}
      {data?.leads.map((lead) => (
        <Card key={lead.id} className="grid gap-2 sm:grid-cols-[1fr_auto]">
          <div className="text-sm">
            <b className="text-base">
              น้อง{lead.childNickname} · ป.{lead.grade}
            </b>
            <div className="text-gray-600">
              {lead.parentName} ·{" "}
              <a href={`tel:${lead.phone}`} className="text-amber-700 underline">
                {lead.phone}
              </a>
              {lead.source && ` · จาก ${lead.source}`}
            </div>
            <div className="text-xs text-gray-500">แจ้งเมื่อ {new Date(lead.createdAt).toLocaleString("th-TH")}</div>
            <Input
              key={lead.note}
              defaultValue={lead.note ?? ""}
              placeholder="บันทึกการติดต่อ (กดนอกช่องเพื่อบันทึก)"
              className="mt-2 text-sm"
              onBlur={(e) => e.target.value !== (lead.note ?? "") && patch(lead, { note: e.target.value })}
            />
          </div>
          <div className="grid content-start gap-2">
            <Select value={lead.status} onChange={(e) => patch(lead, { status: e.target.value as Lead["status"] })}>
              {Object.entries(STATUS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
            <Input type="date" value={lead.trialDate ?? ""} onChange={(e) => patch(lead, { trialDate: e.target.value || undefined })} title="วันนัดทดลองเรียน" />
            <button className="text-left text-xs text-gray-400 underline" onClick={() => window.confirm("ลบข้อมูลผู้สนใจรายนี้?") && run(() => api(`admin/leads/${lead.id}`, {}, "DELETE"))}>
              ลบข้อมูล
            </button>
          </div>
        </Card>
      ))}
    </div>
  );
}
