"use client";

import { useState } from "react";
import { useMe } from "@/components/me";
import { Badge, Button, Card, ErrorText, Field, Input, Select, Table } from "@/components/ui";
import { api, todayStr, useLoad } from "@/lib/client/api";
import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_KEYS, type MonthSummary } from "@/lib/finance";
import type { Expense, ExpenseCategory } from "@/lib/types";

interface Data {
  month: string;
  royaltyPercent: number;
  summary: MonthSummary;
  months: string[];
  expenses: Expense[];
}

const EMPTY = { date: "", category: "rent" as ExpenseCategory, detail: "", qty: "1", unitPrice: "", amount: "", method: "cash", vendor: "", recurring: false, note: "" };
type Form = typeof EMPTY & { id?: string };

const baht = (n: number) => n.toLocaleString("th-TH", { maximumFractionDigits: 2 });
const monthTh = (m: string) => new Date(`${m}-01T00:00:00`).toLocaleDateString("th-TH", { month: "long", year: "numeric" });

// ย่อรูปใบเสร็จในเครื่องก่อนส่ง (ด้านยาว ≤ 1000px, JPEG) ให้เล็กพอเก็บในฐานข้อมูล
async function shrinkImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1000 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.7);
}

export default function ExpensesPage() {
  const { me } = useMe();
  const [month, setMonth] = useState("");
  const { data, error, reload } = useLoad<Data>(`admin/expenses${month ? `?month=${month}` : ""}`);
  const [form, setForm] = useState<Form | null>(null);
  const [receipt, setReceipt] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  async function run(fn: () => Promise<void>) {
    setActionError("");
    try {
      await fn();
      reload();
    } catch (err) {
      setActionError((err as Error).message);
    }
  }

  const s = data?.summary;
  const isSupply = form ? EXPENSE_CATEGORIES[form.category].kind === "supply" : false;
  const lineTotal = form && isSupply ? Math.round(Number(form.qty || 0) * Number(form.unitPrice || 0) * 100) / 100 : 0;

  function save(f: Form) {
    const payload = {
      date: f.date,
      category: f.category,
      detail: f.detail,
      qty: Number(f.qty),
      unitPrice: Number(f.unitPrice || 0),
      amount: Number(f.amount || 0),
      method: f.method,
      vendor: f.vendor,
      recurring: f.recurring,
      note: f.note,
    };
    return run(async () => {
      if (f.id) await api(`admin/expenses/${f.id}`, payload, "PATCH");
      else await api("admin/expenses", payload);
      setForm(null);
    });
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">รายจ่าย</h1>
        <div className="flex flex-wrap gap-2">
          <Select value={data?.month ?? ""} onChange={(e) => setMonth(e.target.value)} className="w-44">
            {(data?.months ?? []).map((m) => (
              <option key={m} value={m}>
                {monthTh(m)}
              </option>
            ))}
          </Select>
          <Button onClick={() => setForm({ ...EMPTY, date: todayStr() })}>บันทึกรายจ่าย</Button>
        </div>
      </div>
      <ErrorText>{error || actionError}</ErrorText>

      {s && data && (
        <Card className="grid grid-cols-2 gap-3 text-center sm:grid-cols-5">
          {[
            ["รายรับค่าเรียน", baht(s.revenue), "text-green-700"],
            ["ค่าใช้จ่ายดำเนินงาน", baht(s.operating), ""],
            ["ของใช้เบ็ดเตล็ด", baht(s.supply), ""],
            [`royalty ${data.royaltyPercent}%`, baht(s.royaltyDue), ""],
            ["กำไรประมาณการ", baht(s.profit), s.profit >= 0 ? "text-green-700" : "text-red-600"],
          ].map(([label, value, color]) => (
            <div key={label}>
              <div className="text-xs text-gray-500">{label}</div>
              <div className={`text-xl font-bold ${color}`}>฿{value}</div>
            </div>
          ))}
          <p className="col-span-2 text-xs text-gray-500 sm:col-span-5">
            กำไร = รายรับ − รายจ่ายที่บันทึกไว้ − royalty ส่วนที่ยังไม่ได้บันทึกจ่าย (บันทึกจ่ายแล้ว ฿{baht(s.royaltyPaid)}) · รายรับนับเฉพาะใบแจ้งที่ยืนยันรับเงินในเดือนนี้ · อัตรา royalty แก้ได้ที่หน้า
            “ตั้งค่า”
          </p>
        </Card>
      )}

      {s && s.byCategory.length > 0 && (
        <Card className="grid gap-2">
          <div className="font-semibold">สัดส่วนรายจ่ายเดือนนี้</div>
          {s.byCategory.map((c) => (
            <div key={c.category} className="grid grid-cols-[9rem_1fr_6rem] items-center gap-2 text-sm">
              <span className="truncate">{c.label}</span>
              <span className="h-3 rounded-full bg-gray-100">
                <span
                  className={`block h-3 rounded-full ${c.kind === "supply" ? "bg-sky-400" : "bg-amber-500"}`}
                  style={{ width: `${s.expense ? (c.amount / s.expense) * 100 : 0}%` }}
                />
              </span>
              <span className="text-right font-medium">฿{baht(c.amount)}</span>
            </div>
          ))}
        </Card>
      )}

      {form && (
        <Card className="grid gap-3 sm:grid-cols-2">
          <Field label="วันที่จ่าย">
            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </Field>
          <Field label="หมวดค่าใช้จ่าย">
            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ExpenseCategory })}>
              <optgroup label="ค่าใช้จ่ายดำเนินงาน">
                {EXPENSE_CATEGORY_KEYS.filter((k) => EXPENSE_CATEGORIES[k].kind === "operating").map((k) => (
                  <option key={k} value={k}>
                    {EXPENSE_CATEGORIES[k].label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="ของใช้เบ็ดเตล็ด/วัสดุสิ้นเปลือง">
                {EXPENSE_CATEGORY_KEYS.filter((k) => EXPENSE_CATEGORIES[k].kind === "supply").map((k) => (
                  <option key={k} value={k}>
                    {EXPENSE_CATEGORIES[k].label}
                  </option>
                ))}
              </optgroup>
            </Select>
          </Field>
          <Field label={isSupply ? "ชื่อสิ่งของ" : "รายละเอียด"}>
            <Input value={form.detail} onChange={(e) => setForm({ ...form, detail: e.target.value })} placeholder={EXPENSE_CATEGORIES[form.category].example} />
          </Field>
          <Field label="ร้านค้า / ผู้รับเงิน">
            <Input value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} />
          </Field>
          {isSupply ? (
            <>
              <Field label="จำนวน">
                <Input type="number" inputMode="decimal" value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} />
              </Field>
              <Field label="ราคาต่อหน่วย (บาท)">
                <Input type="number" inputMode="decimal" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} />
              </Field>
              <div className="self-end text-sm text-gray-600 sm:col-span-2">
                ยอดรวมรายการ <b className="text-lg">฿{baht(lineTotal)}</b>
              </div>
            </>
          ) : (
            <Field label="จำนวนเงิน (บาท)">
              <Input type="number" inputMode="decimal" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </Field>
          )}
          <Field label="ช่องทางชำระเงิน">
            <Select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
              <option value="cash">เงินสด</option>
              <option value="transfer">โอนเงิน</option>
            </Select>
          </Field>
          <Field label="บันทึกเพิ่มเติม">
            <Input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </Field>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" className="h-5 w-5" checked={form.recurring} onChange={(e) => setForm({ ...form, recurring: e.target.checked })} />
            รายจ่ายประจำทุกเดือน (ค่าเช่า เงินเดือน)
          </label>
          <div className="flex gap-2 sm:col-span-2">
            <Button onClick={() => save(form)}>{form.id ? "บันทึกการแก้ไข" : "บันทึก"}</Button>
            <Button variant="ghost" onClick={() => setForm(null)}>
              ยกเลิก
            </Button>
          </div>
        </Card>
      )}

      {receipt && (
        <Card className="grid justify-items-start gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element -- รูปใบเสร็จเป็น data URL จากฐานข้อมูล ไม่ผ่าน image optimizer */}
          <img src={receipt} alt="ใบเสร็จ" className="max-h-[70vh] rounded-xl" />
          <Button variant="ghost" onClick={() => setReceipt(null)}>
            ปิด
          </Button>
        </Card>
      )}

      {data?.expenses.length === 0 && <p className="text-gray-500">เดือนนี้ยังไม่มีรายการ</p>}
      {!!data?.expenses.length && (
        <Table head={["วันที่", "หมวด", "รายละเอียด", "ยอดจ่าย", "ช่องทาง", "ใบเสร็จ", ""]}>
          {data.expenses.map((e) => (
            <tr key={e.id}>
              <td className="whitespace-nowrap">
                {e.date.slice(8)}/{e.date.slice(5, 7)}
              </td>
              <td>
                <Badge color={EXPENSE_CATEGORIES[e.category].kind === "supply" ? "blue" : "amber"}>{EXPENSE_CATEGORIES[e.category].label}</Badge>
                {e.recurring && <span className="ml-1 text-xs text-gray-400">ประจำ</span>}
              </td>
              <td>
                {e.detail}
                {e.qty != null && (
                  <span className="text-xs text-gray-500">
                    {" "}
                    ({e.qty} × ฿{baht(e.unitPrice ?? 0)})
                  </span>
                )}
                {e.vendor && <div className="text-xs text-gray-500">{e.vendor}</div>}
                {e.note && <div className="text-xs text-gray-400">{e.note}</div>}
              </td>
              <td className="whitespace-nowrap font-medium">฿{baht(e.amount)}</td>
              <td className="whitespace-nowrap">{e.method === "cash" ? "เงินสด" : "โอน"}</td>
              <td className="whitespace-nowrap">
                {e.hasReceipt ? (
                  <button className="text-sm text-amber-700 underline" onClick={() => run(async () => setReceipt((await api(`admin/expenses/${e.id}/receipt`)).dataUrl))}>
                    ดูใบเสร็จ
                  </button>
                ) : (
                  <label className="cursor-pointer text-sm text-gray-500 underline">
                    แนบรูป
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(ev) => {
                        const file = ev.target.files?.[0];
                        if (file) run(async () => void (await api(`admin/expenses/${e.id}/receipt`, { dataUrl: await shrinkImage(file) })));
                      }}
                    />
                  </label>
                )}
              </td>
              <td className="whitespace-nowrap">
                <button
                  className="text-sm text-gray-500 underline"
                  onClick={() =>
                    setForm({
                      id: e.id,
                      date: e.date,
                      category: e.category,
                      detail: e.detail,
                      qty: String(e.qty ?? 1),
                      unitPrice: String(e.unitPrice ?? ""),
                      amount: String(e.amount),
                      method: e.method,
                      vendor: e.vendor ?? "",
                      recurring: e.recurring ?? false,
                      note: e.note ?? "",
                    })
                  }
                >
                  แก้
                </button>
                {me.role === "owner" && (
                  <button
                    className="ml-2 text-sm text-red-600 underline"
                    onClick={() => window.confirm(`ลบรายการ "${e.detail}" ฿${baht(e.amount)}?`) && run(() => api(`admin/expenses/${e.id}`, {}, "DELETE"))}
                  >
                    ลบ
                  </button>
                )}
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
