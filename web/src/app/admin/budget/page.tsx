"use client";

import { useState } from "react";
import { Badge, Button, Card, ErrorText, Input } from "@/components/ui";
import { api, useLoad } from "@/lib/client/api";
import type { BudgetStatus, MonthSummary } from "@/lib/finance";
import type { ExpenseCategory, ExpenseKind } from "@/lib/types";

interface Data {
  month: string;
  source: "month" | "default" | "none";
  amounts: Partial<Record<ExpenseCategory, number>>;
  updatedAt?: string;
  summary: MonthSummary;
  status: BudgetStatus;
  categories: { key: ExpenseCategory; label: string; kind: ExpenseKind }[];
}

const baht = (n: number) => n.toLocaleString("th-TH", { maximumFractionDigits: 0 });
const monthTh = (m: string) => new Date(`${m}-01T00:00:00`).toLocaleDateString("th-TH", { month: "long", year: "numeric" });

function shiftMonth(month: string, by: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + by, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export default function BudgetPage() {
  const [month, setMonth] = useState("");
  const { data, error, reload } = useLoad<Data>(`admin/budget${month ? `?month=${month}` : ""}`);
  const [draft, setDraft] = useState<Record<string, string> | null>(null);
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const current = data?.month ?? "";

  async function run(fn: () => Promise<unknown>) {
    setActionError("");
    setMessage("");
    try {
      await fn();
      reload();
    } catch (err) {
      setActionError((err as Error).message);
    }
  }

  function startEdit() {
    const values: Record<string, string> = {};
    for (const [key, value] of Object.entries(data?.amounts ?? {})) values[key] = String(value);
    setDraft(values);
  }

  function save(scope: "month" | "default") {
    return run(async () => {
      await api("admin/budget", { scope, month: current, amounts: draft }, "PUT");
      setDraft(null);
      setMessage(scope === "default" ? "บันทึกเป็นงบตั้งต้นของทุกเดือนแล้ว" : `บันทึกงบของ${monthTh(current)}แล้ว`);
    });
  }

  const s = data?.status;
  const bar = (line: BudgetStatus["lines"][number]) => {
    const pct = line.usedPercent ?? 0;
    const color = line.over ? "bg-red-500" : pct >= 80 ? "bg-amber-500" : "bg-green-500";
    return (
      <span className="block h-2.5 rounded-full bg-gray-100">
        <span className={`block h-2.5 rounded-full ${color}`} style={{ width: `${Math.min(100, pct)}%` }} />
      </span>
    );
  };

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">งบประมาณ</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" onClick={() => setMonth(shiftMonth(current, -1))}>
            ‹ เดือนก่อน
          </Button>
          <span className="min-w-28 text-center font-semibold">{current && monthTh(current)}</span>
          <Button variant="ghost" onClick={() => setMonth(shiftMonth(current, 1))}>
            เดือนถัดไป ›
          </Button>
          {!draft && <Button onClick={startEdit}>ตั้ง/แก้งบ</Button>}
        </div>
      </div>
      <ErrorText>{error || actionError}</ErrorText>
      {message && <p className="rounded-xl bg-green-50 p-3 text-sm text-green-700">{message}</p>}

      {data && (
        <p className="text-sm text-gray-600">
          {data.source === "month" ? "เดือนนี้ใช้งบที่ตั้งไว้เฉพาะเดือน" : data.source === "default" ? "เดือนนี้ใช้งบตั้งต้นที่ใช้ร่วมทุกเดือน" : "ยังไม่ได้ตั้งงบ — กด “ตั้ง/แก้งบ” เพื่อเริ่ม"}
          {" · "}หมวดที่ไม่ได้ใส่ตัวเลข = ไม่คุมงบ (ไม่ใช่งบศูนย์) · เป้ากำไรต่อเดือนแก้ได้ที่หน้า “ตั้งค่า”
        </p>
      )}

      {s && (
        <Card className="grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
          <div>
            <div className="text-xs text-gray-500">งบรวมที่ตั้งไว้</div>
            <div className="text-xl font-bold">฿{baht(s.budgetTotal)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">ใช้ไปแล้ว (หมวดที่คุมงบ)</div>
            <div className={`text-xl font-bold ${s.spentBudgeted > s.budgetTotal ? "text-red-600" : ""}`}>฿{baht(s.spentBudgeted)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">กำไรเดือนนี้</div>
            <div className={`text-xl font-bold ${s.profit >= 0 ? "text-green-700" : "text-red-600"}`}>฿{baht(s.profit)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">เป้ากำไร ฿{baht(s.profitTarget)}</div>
            <div className={`text-xl font-bold ${(s.targetPercent ?? 0) >= 100 ? "text-green-700" : "text-amber-600"}`}>
              {s.targetPercent === null ? "ยังไม่ตั้งเป้า" : `${s.targetPercent}%`}
            </div>
          </div>
        </Card>
      )}

      {s && (s.overCount > 0 || s.warnCount > 0) && (
        <Card className={`border-2 ${s.overCount ? "border-red-300" : "border-amber-300"}`}>
          <b className={s.overCount ? "text-red-700" : "text-amber-700"}>
            {s.overCount > 0 && `เกินงบ ${s.overCount} หมวด`}
            {s.overCount > 0 && s.warnCount > 0 && " · "}
            {s.warnCount > 0 && `ใกล้เต็มงบ ${s.warnCount} หมวด`}
          </b>
          <ul className="mt-1 text-sm">
            {s.lines
              .filter((l) => l.over || (l.usedPercent ?? 0) >= 80)
              .map((l) => (
                <li key={l.category}>
                  • {l.label}: ใช้ ฿{baht(l.spent)} จากงบ ฿{baht(l.budget ?? 0)} ({l.usedPercent}%){l.over ? ` — เกินงบ ฿${baht(-(l.left ?? 0))}` : ""}
                </li>
              ))}
          </ul>
        </Card>
      )}

      {draft && data && (
        <Card className="grid gap-3">
          <b>ตั้งงบรายหมวด (บาท/เดือน) — เว้นว่างไว้ = ไม่คุมงบหมวดนั้น</b>
          <div className="grid gap-2 sm:grid-cols-2">
            {data.categories.map((c) => (
              <label key={c.key} className="flex items-center gap-2 text-sm">
                <span className="w-48 shrink-0">
                  {c.label}
                  <span className="ml-1 text-xs text-gray-400">{c.kind === "supply" ? "(ของใช้)" : ""}</span>
                </span>
                <Input
                  type="number"
                  inputMode="decimal"
                  className="w-32"
                  value={draft[c.key] ?? ""}
                  onChange={(e) => setDraft({ ...draft, [c.key]: e.target.value })}
                  placeholder="ไม่คุม"
                />
              </label>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => save("month")}>บันทึกเฉพาะ{monthTh(current)}</Button>
            <Button variant="ghost" onClick={() => save("default")}>
              บันทึกเป็นงบตั้งต้นทุกเดือน
            </Button>
            <Button variant="ghost" onClick={() => setDraft(null)}>
              ยกเลิก
            </Button>
            {data.source === "month" && (
              <Button variant="danger" onClick={() => window.confirm(`ลบงบเฉพาะของ${monthTh(current)} แล้วกลับไปใช้งบตั้งต้น?`) && run(() => api(`admin/budget/${current}`, {}, "DELETE"))}>
                ลบงบของเดือนนี้
              </Button>
            )}
          </div>
        </Card>
      )}

      {s && s.lines.length > 0 && (
        <Card className="grid gap-3">
          <b>งบเทียบรายจ่ายจริง</b>
          {s.lines.map((l) => (
            <div key={l.category} className="grid gap-1">
              <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                <span>
                  {l.label}
                  {l.budget === null && (
                    <Badge color="gray">
                      <span className="text-[10px]">ไม่ได้ตั้งงบ</span>
                    </Badge>
                  )}
                </span>
                <span className={l.over ? "font-medium text-red-600" : "text-gray-600"}>
                  ฿{baht(l.spent)}
                  {l.budget !== null && ` / ฿${baht(l.budget)}`}
                  {l.left !== null && (l.left >= 0 ? ` · เหลือ ฿${baht(l.left)}` : ` · เกิน ฿${baht(-l.left)}`)}
                </span>
              </div>
              {l.budget !== null && bar(l)}
            </div>
          ))}
          {s.spentUnbudgeted > 0 && <p className="text-xs text-gray-500">รายจ่ายในหมวดที่ยังไม่ได้ตั้งงบรวม ฿{baht(s.spentUnbudgeted)} — ตั้งงบเพิ่มได้ถ้าอยากคุม</p>}
        </Card>
      )}
    </div>
  );
}
