"use client";

import { useState } from "react";
import { Badge, Button, Card, ErrorText, Input, Select, Table } from "@/components/ui";
import { api, useLoad } from "@/lib/client/api";
import type { TeacherPay } from "@/lib/finance";

interface Data {
  month: string;
  teachers: TeacherPay[];
  totalHours: number;
  totalAmount: number;
  months: string[];
}

const baht = (n: number) => n.toLocaleString("th-TH", { maximumFractionDigits: 2 });
const monthTh = (m: string) => new Date(`${m}-01T00:00:00`).toLocaleDateString("th-TH", { month: "long", year: "numeric" });

export default function PayrollPage() {
  const [month, setMonth] = useState("");
  const { data, error, reload } = useLoad<Data>(`admin/payroll${month ? `?month=${month}` : ""}`);
  const [open, setOpen] = useState<string | null>(null);
  const [edit, setEdit] = useState<Record<string, string>>({});
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

  const rows = data?.teachers ?? [];
  const unpaid = rows.filter((t) => !t.paid && t.amount > 0);

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">ค่าจ้างครู</h1>
        <Select value={data?.month ?? ""} onChange={(e) => setMonth(e.target.value)} className="w-44">
          {(data?.months ?? []).map((m) => (
            <option key={m} value={m}>
              {monthTh(m)}
            </option>
          ))}
        </Select>
      </div>
      <p className="text-sm text-gray-600">
        นับจากคาบที่<b>เช็กชื่อแล้ว</b>: 1 คอร์ส 1 วัน = 1 คาบ · ชั่วโมงคิดจากเวลาเริ่ม-เลิกของคอร์ส · ครูของคาบมาจากครูประจำคอร์ส ถ้าไม่ได้ตั้งจะนับเป็นคนที่เช็กชื่อ ·
        อัตราค่าสอนตั้งที่หน้า “ผู้ใช้”
      </p>
      <ErrorText>{error || actionError}</ErrorText>

      {data && (
        <Card className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-xs text-gray-500">ชั่วโมงสอนรวมเดือนนี้</div>
            <div className="text-xl font-bold">{baht(data.totalHours)} ชม.</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">ค่าจ้างรวม</div>
            <div className="text-xl font-bold">฿{baht(data.totalAmount)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">ยังไม่ได้บันทึกจ่าย</div>
            <div className={`text-xl font-bold ${unpaid.length ? "text-amber-600" : "text-green-700"}`}>{unpaid.length} คน</div>
          </div>
        </Card>
      )}

      {rows.length === 0 && <p className="text-gray-500">เดือนนี้ยังไม่มีคาบที่เช็กชื่อ</p>}
      {rows.length > 0 && (
        <Table head={["ครู", "คาบ", "ชั่วโมง", "อัตรา/ชม.", "ค่าจ้าง", "สถานะ", ""]}>
          {rows.map((t) => (
            <tr key={t.teacherId}>
              <td className="font-medium">
                <button className="underline decoration-dotted" onClick={() => setOpen(open === t.teacherId ? null : t.teacherId)}>
                  {t.name}
                </button>
                {open === t.teacherId && (
                  <div className="mt-1 grid gap-0.5 text-xs text-gray-500">
                    {t.detail.map((s) => (
                      <div key={`${s.courseId}-${s.date}`}>
                        {s.date.slice(8)}/{s.date.slice(5, 7)} · {s.courseName} · {s.hours} ชม.
                      </div>
                    ))}
                  </div>
                )}
              </td>
              <td>{t.sessions}</td>
              <td>{baht(t.hours)}</td>
              <td>{t.hourlyRate ? `฿${baht(t.hourlyRate)}` : <Badge color="red">ยังไม่ตั้ง</Badge>}</td>
              <td className="font-medium">฿{baht(t.paid ? (t.paidAmount ?? 0) : t.amount)}</td>
              <td>{t.paid ? <Badge color="green">บันทึกจ่ายแล้ว</Badge> : <Badge color="amber">ยังไม่จ่าย</Badge>}</td>
              <td className="whitespace-nowrap">
                {!t.paid && t.hourlyRate > 0 && (
                  <span className="flex items-center gap-1">
                    <Input
                      type="number"
                      className="w-24 text-sm"
                      value={edit[t.teacherId] ?? String(t.amount)}
                      title="แก้ยอดได้ถ้ามีหักลาหรือโบนัส"
                      onChange={(e) => setEdit({ ...edit, [t.teacherId]: e.target.value })}
                    />
                    <Button
                      onClick={() =>
                        window.confirm(`บันทึกค่าจ้าง ${t.name} เดือน ${data?.month} เป็นรายจ่าย ฿${baht(Number(edit[t.teacherId] ?? t.amount))}?`) &&
                        run(() => api("admin/payroll", { teacherId: t.teacherId, month: data?.month, amount: edit[t.teacherId] ?? t.amount }))
                      }
                    >
                      บันทึกจ่าย
                    </Button>
                  </span>
                )}
              </td>
            </tr>
          ))}
        </Table>
      )}
      <p className="text-xs text-gray-500">
        กด “บันทึกจ่าย” = สร้างรายการในหน้า <b>รายจ่าย</b> หมวดค่าจ้างครู (กดซ้ำไม่เกิดรายการซ้ำ) · ถ้าจ่ายไปแล้วแต่อยากแก้ยอด ให้ไปแก้/ลบที่หน้ารายจ่าย
      </p>
    </div>
  );
}
