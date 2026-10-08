"use client";

import { useState } from "react";
import { Badge, Button, Card, ErrorText, SecretBox } from "@/components/ui";
import { api, useLoad } from "@/lib/client/api";
import type { Application } from "@/lib/types";

const STATUS = { pending: ["amber", "รออนุมัติ"], approved: ["green", "อนุมัติแล้ว"], rejected: ["gray", "ปฏิเสธ"] } as const;

export default function ApplicationsPage() {
  const { data, error, reload } = useLoad<{ applications: Application[]; defaultTerm: string }>("admin/applications");
  const courses = useLoad<{ courses: { id: string; name: string }[] }>("admin/courses");
  const [result, setResult] = useState<{ studentCode: string; pin: string; parentUsername: string; tempPassword?: string } | null>(null);
  const [actionError, setActionError] = useState("");

  async function act(id: string, action: "approve" | "reject") {
    setActionError("");
    try {
      const res = await api(`admin/applications/${id}/${action}`, { term: data?.defaultTerm });
      if (action === "approve") setResult(res);
      reload();
    } catch (err) {
      setActionError((err as Error).message);
    }
  }

  const courseName = (id: string) => courses.data?.courses.find((c) => c.id === id)?.name ?? id;
  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold">ใบสมัคร</h1>
      <p className="text-sm text-gray-600">
        ฟอร์มสมัครสำหรับผู้ปกครอง: <code className="rounded bg-white px-2 py-1">/enroll</code> · เทอมที่จะลงทะเบียน: {data?.defaultTerm}
      </p>
      <ErrorText>{error || actionError}</ErrorText>
      {result && (
        <SecretBox
          title="อนุมัติแล้ว — ส่งข้อมูลนี้ให้ผู้ปกครอง"
          lines={[
            ["รหัสนักเรียน", result.studentCode],
            ["PIN นักเรียน", result.pin],
            ["ผู้ปกครองเข้าระบบด้วย", result.parentUsername],
            ["รหัสผ่านชั่วคราว", result.tempPassword ?? "(ใช้บัญชีเดิม)"],
          ]}
          onClose={() => setResult(null)}
        />
      )}
      {data?.applications.length === 0 && <p className="text-gray-500">ยังไม่มีใบสมัคร</p>}
      {data?.applications.map((a) => (
        <Card key={a.id} className="grid gap-2">
          <div className="flex items-center justify-between gap-2">
            <b>
              น้อง{a.nickname} · ป.{a.grade}
            </b>
            <Badge color={STATUS[a.status][0]}>{STATUS[a.status][1]}</Badge>
          </div>
          <div className="text-sm text-gray-600">
            {a.studentFullName} {a.school && `· ${a.school}`}
            <br />
            ผู้ปกครอง: {a.parentName} · {a.phone}
            <br />
            คอร์ส: {a.courseIds.map(courseName).join(", ")}
            <br />
            สมัครเมื่อ {new Date(a.createdAt).toLocaleString("th-TH")} · ยินยอม PDPA แล้ว
          </div>
          {a.status === "pending" && (
            <div className="flex gap-2">
              <Button onClick={() => act(a.id, "approve")}>อนุมัติ</Button>
              <Button variant="ghost" onClick={() => act(a.id, "reject")}>
                ปฏิเสธ
              </Button>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
