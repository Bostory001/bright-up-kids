"use client";

import { useState } from "react";
import { Button, Card, ErrorText, Field, Input, Select } from "@/components/ui";
import { api, todayStr, useLoad } from "@/lib/client/api";

type Row = Record<string, string | number>;
interface Report {
  columns: { key: string; label: string }[];
  rows: Row[];
}

function monthStart(): string {
  return `${todayStr().slice(0, 8)}01`;
}

function downloadCsv(name: string, columns: Report["columns"], rows: Row[]) {
  const cell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = [columns.map((c) => cell(c.label)).join(","), ...rows.map((r) => columns.map((c) => cell(r[c.key] ?? "")).join(","))];
  // BOM ให้ Excel อ่านภาษาไทยถูก
  const blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${name}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function ReportsPage() {
  const list = useLoad<{ datasets: { key: string; label: string; usesDates: boolean }[] }>("admin/reports");
  const [dataset, setDataset] = useState("students");
  const [from, setFrom] = useState(monthStart);
  const [to, setTo] = useState(todayStr);
  const [report, setReport] = useState<Report | null>(null);
  const [hidden, setHidden] = useState<string[]>([]);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const meta = list.data?.datasets.find((d) => d.key === dataset);

  async function load() {
    setError("");
    try {
      setReport(await api("admin/reports", { dataset, from, to }));
      setHidden([]);
      setFilters({});
    } catch (err) {
      setError((err as Error).message);
    }
  }

  const columns = report?.columns.filter((c) => !hidden.includes(c.key)) ?? [];
  const rows = (report?.rows ?? []).filter((r) =>
    Object.entries(filters).every(([key, text]) => !text || String(r[key] ?? "").toLowerCase().includes(text.toLowerCase())),
  );
  const numericTotals = columns.map((c) => (rows.length && rows.every((r) => typeof r[c.key] === "number") ? rows.reduce((s, r) => s + (r[c.key] as number), 0) : null));

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold print:hidden">รายงาน</h1>
      <Card className="grid gap-3 sm:grid-cols-4 print:hidden">
        <Field label="ชุดข้อมูล">
          <Select
            value={dataset}
            onChange={(e) => {
              setDataset(e.target.value);
              setReport(null);
            }}
          >
            {list.data?.datasets.map((d) => (
              <option key={d.key} value={d.key}>
                {d.label}
              </option>
            ))}
          </Select>
        </Field>
        {meta?.usesDates && (
          <>
            <Field label="ตั้งแต่">
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </Field>
            <Field label="ถึง">
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </Field>
          </>
        )}
        <div className="self-end">
          <Button onClick={load}>ดึงข้อมูล</Button>
        </div>
      </Card>
      <ErrorText>{list.error || error}</ErrorText>

      {report && (
        <>
          <Card className="grid gap-3 print:hidden">
            <div className="text-sm font-medium">เลือกคอลัมน์</div>
            <div className="flex flex-wrap gap-3 text-sm">
              {report.columns.map((c) => (
                <label key={c.key} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={!hidden.includes(c.key)}
                    onChange={(e) => setHidden(e.target.checked ? hidden.filter((k) => k !== c.key) : [...hidden, c.key])}
                  />
                  {c.label}
                </label>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={() => downloadCsv(`${meta?.label ?? dataset}_${todayStr()}`, columns, rows)}>Export Excel (CSV)</Button>
              <Button variant="ghost" onClick={() => window.print()}>
                พิมพ์ / PDF
              </Button>
              <span className="text-sm text-gray-500">
                {rows.length} จาก {report.rows.length} แถว
              </span>
            </div>
          </Card>

          <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
            <h2 className="hidden p-3 text-lg font-bold print:block">
              {meta?.label} {meta?.usesDates && `(${from} ถึง ${to})`}
            </h2>
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((c) => (
                    <th key={c.key} className="px-3 py-2 align-top font-medium">
                      <div className="whitespace-nowrap">{c.label}</div>
                      <input
                        placeholder="กรอง"
                        value={filters[c.key] ?? ""}
                        onChange={(e) => setFilters({ ...filters, [c.key]: e.target.value })}
                        className="mt-1 w-full min-w-16 rounded border border-gray-300 px-1 py-0.5 text-xs font-normal print:hidden"
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((r, i) => (
                  <tr key={i}>
                    {columns.map((c) => (
                      <td key={c.key} className="px-3 py-1.5">
                        {typeof r[c.key] === "number" ? (r[c.key] as number).toLocaleString() : r[c.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              {numericTotals.some((t) => t !== null) && (
                <tfoot className="bg-gray-50 font-bold">
                  <tr>
                    {columns.map((c, i) => (
                      <td key={c.key} className="px-3 py-2">
                        {numericTotals[i] !== null ? numericTotals[i]!.toLocaleString() : i === 0 ? "รวม" : ""}
                      </td>
                    ))}
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </>
      )}
    </div>
  );
}
