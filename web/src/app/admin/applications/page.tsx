"use client";

import { useState } from "react";
import { Badge, Button, Card, ErrorText, SecretBox } from "@/components/ui";
import { api, useLoad } from "@/lib/client/api";
import { gradeRange, SUBJECT_TH } from "@/lib/grade";
import type { Application, Subject } from "@/lib/types";

const STATUS = { pending: ["amber", "รออนุมัติ"], approved: ["green", "อนุมัติแล้ว"], rejected: ["gray", "ปฏิเสธ"] } as const;
const PROGRAM = { thai: "ภาคสามัญ (ไทย)", ep: "English Program", inter: "Inter" };

// วิชาที่ผู้ปกครองติ๊กมา + วิชาที่พิมพ์เองในช่อง "อื่น ๆ"
function subjectText(a: Application): string {
  const names = (a.subjects ?? []).map((s) => (s === "other" ? a.subjectOther || "อื่น ๆ" : SUBJECT_TH[s as Subject] ?? s));
  return names.join(", ");
}

// ช่องที่ผู้ปกครองกรอกเพิ่มในใบสมัคร — แสดงเฉพาะช่องที่กรอกมาจริง
function detailLines(a: Application): [string, string][] {
  const address = [a.addressLine, a.subdistrict, a.district, a.province, a.postcode].filter(Boolean).join(" ");
  return ([
    ["ชื่ออังกฤษ", a.englishName],
    ["วันเกิด", a.birthDate],
    ["หลักสูตรที่โรงเรียน", a.program ? PROGRAM[a.program] : undefined],
    ["ตั้งใจสอบเข้า", a.targetSchool],
    ["ที่อยู่", address || undefined],
    ["อีเมล", a.email],
    ["Line ID", a.lineId],
    ["Facebook", a.facebook],
    ["เบอร์สำรอง", a.altPhone],
    ["รู้จักจาก", a.source],
    ["หมายเหตุจากผู้ปกครอง", a.note],
  ] as [string, string | undefined][]).filter((x): x is [string, string] => Boolean(x[1]));
}

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
              น้อง{a.nickname} · {gradeRange(a.grades?.length ? a.grades : [a.grade])}
            </b>
            <Badge color={STATUS[a.status][0]}>{STATUS[a.status][1]}</Badge>
          </div>
          <div className="text-sm text-gray-600">
            {a.studentFullName} {a.school && `· ${a.school}`}
            <br />
            ผู้ปกครอง: {a.parentName} · {a.phone}
            <br />
            วิชาที่สนใจ: {subjectText(a) || "—"}
            <br />
            คอร์สที่เลือก: {a.courseIds.length ? a.courseIds.map(courseName).join(", ") : "ยังไม่ได้เลือก (รอสถาบันแนะนำรอบ)"}
            <br />
            สมัครเมื่อ {new Date(a.createdAt).toLocaleString("th-TH")} · ยินยอม PDPA แล้ว
            {a.photoConsentAt ? " · ยินยอมให้ใช้ภาพในสื่อ" : " · ไม่ยินยอมให้ใช้ภาพในสื่อ"}
          </div>
          {detailLines(a).length > 0 && (
            <details className="text-sm">
              <summary className="cursor-pointer font-medium text-gray-600">ข้อมูลเพิ่มเติมจากใบสมัคร</summary>
              <dl className="mt-1 grid grid-cols-[9rem_1fr] gap-x-3 gap-y-0.5 text-gray-700">
                {detailLines(a).map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="text-gray-500">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            </details>
          )}
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
