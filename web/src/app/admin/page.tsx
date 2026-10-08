"use client";

import Link from "next/link";
import { Card, ErrorText } from "@/components/ui";
import { useLoad } from "@/lib/client/api";

export default function DashboardPage() {
  const { data: d, error } = useLoad("admin/dashboard");
  if (error) return <ErrorText>{error}</ErrorText>;
  if (!d) return <p className="text-gray-500">กำลังโหลด...</p>;

  const cards = [
    { href: "/admin/students", label: "นักเรียนที่เรียนอยู่", value: d.students, unit: "คน" },
    { href: "/admin/applications", label: "ใบสมัครรออนุมัติ", value: d.pendingApplications, unit: "ใบ", alert: d.pendingApplications > 0 },
    { href: "/admin/invoices", label: "สลิปรอตรวจ", value: d.slipsToCheck, unit: "ใบ", alert: d.slipsToCheck > 0 },
    { href: "/admin/invoices", label: `ค้างชำระ ${d.unpaidCount} ใบ`, value: d.unpaidAmount.toLocaleString(), unit: "บาท" },
    { href: "/admin/rewards", label: "ของรางวัลรอส่งมอบ", value: d.pendingRedemptions, unit: "รายการ", alert: d.pendingRedemptions > 0 },
    { href: "/admin/rewards", label: "งบของรางวัลเดือนนี้", value: `${d.rewardSpent.toLocaleString()} / ${d.rewardBudget.toLocaleString()}`, unit: "บาท" },
  ];
  return (
    <>
      <h1 className="mb-4 text-2xl font-bold">ภาพรวม</h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.label} href={c.href}>
            <Card className={c.alert ? "border-2 border-amber-400" : ""}>
              <div className="text-sm text-gray-500">{c.label}</div>
              <div className="mt-1 text-2xl font-bold">
                {c.value} <span className="text-sm font-normal text-gray-500">{c.unit}</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
