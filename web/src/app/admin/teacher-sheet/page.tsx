"use client";

import { useState } from "react";
import { useMe } from "@/components/me";
import { Badge, Button, Card, ErrorText, Select } from "@/components/ui";
import { useLoad } from "@/lib/client/api";
import { gradeLabel, gradeRange } from "@/lib/grade";

interface StudentRow {
  code: string;
  nickname: string;
  fullName: string;
  grade: number;
  school?: string;
  parentPhone: string;
  absences: number;
}
interface CourseRow {
  id: string;
  name: string;
  subject: "math" | "thai" | "english" | "science";
  grades: number[];
  weekdayName: string;
  startTime: string;
  endTime: string;
  room?: string;
  planned: boolean;
  total: number;
  done: number;
  left: number;
  endDate?: string;
  upcoming: string[];
  students: StudentRow[];
}
interface Data {
  teacherId: string;
  teacherName: string;
  teachers: { id: string; displayName: string }[];
  today: string;
  courses: CourseRow[];
}

const SUBJECT = { math: "คณิต", thai: "ภาษาไทย", english: "ภาษาอังกฤษ", science: "วิทยาศาสตร์" };
const thaiDate = (d?: string) => (d ? new Date(`${d}T00:00:00`).toLocaleDateString("th-TH", { weekday: "short", day: "numeric", month: "short" }) : "—");

export default function TeacherSheetPage() {
  const { me } = useMe();
  const [teacherId, setTeacherId] = useState("");
  const { data, error } = useLoad<Data>(`admin/teacher-sheet${teacherId ? `?teacherId=${teacherId}` : ""}`);
  const isOwner = me.role === "owner";

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <h1 className="text-2xl font-bold">ใบตารางสอนของครู</h1>
        <div className="flex flex-wrap items-center gap-2">
          {isOwner && (
            <Select value={data?.teacherId ?? ""} onChange={(e) => setTeacherId(e.target.value)} className="w-56">
              {(data?.teachers ?? []).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.displayName}
                </option>
              ))}
            </Select>
          )}
          <Button onClick={() => window.print()}>พิมพ์ / ส่งให้ครู (PDF)</Button>
        </div>
      </div>
      <ErrorText>{error}</ErrorText>

      <div className="hidden print:block">
        <h1 className="text-xl font-bold">ใบตารางสอน — {data?.teacherName}</h1>
        <p className="text-xs text-gray-500">Bright Up Kids สาขาวัดหลวงพ่อโต บางพลี · พิมพ์เมื่อ {thaiDate(data?.today)}</p>
      </div>

      {data && data.courses.length === 0 && (
        <Card>
          <b>{data.teacherName} ยังไม่ได้รับผิดชอบคอร์สไหน</b>
          <p className="text-sm text-gray-600">ผูกครูกับคอร์สที่หน้า “คอร์ส” ช่องครูผู้สอน แล้วตารางนี้จะขึ้นเอง</p>
        </Card>
      )}

      {data?.courses.map((c) => (
        <Card key={c.id} className="grid gap-3 break-inside-avoid">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b pb-2">
            <div>
              <h2 className="text-lg font-bold">{c.name}</h2>
              <div className="text-sm text-gray-600">
                {SUBJECT[c.subject]} · {gradeRange(c.grades)} · <b>ทุกวัน{c.weekdayName} {c.startTime}–{c.endTime}</b>
                {c.room ? ` · ${c.room}` : ""}
              </div>
            </div>
            <div className="text-right text-sm">
              {c.planned ? (
                <>
                  <div>
                    สัปดาห์ที่ {c.done}/{c.total} · เหลือ {c.left}
                  </div>
                  <div className="text-gray-500">จบคอร์ส {thaiDate(c.endDate)}</div>
                </>
              ) : (
                <Badge color="amber">ยังไม่กำหนดวันเริ่ม</Badge>
              )}
            </div>
          </div>

          {c.upcoming.length > 0 && <div className="text-sm text-gray-600">วันสอนถัดไป: {c.upcoming.map(thaiDate).join(" · ")}</div>}

          <div>
            <div className="mb-1 text-sm font-medium">นักเรียนในคาบนี้ {c.students.length} คน</div>
            {c.students.length === 0 && <p className="text-sm text-gray-400">ยังไม่มีนักเรียนลงเรียน</p>}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs text-gray-600">
                  <tr>
                    {["ชื่อเล่น", "ชื่อ-สกุล", "ชั้น", "โรงเรียน", "เบอร์ผู้ปกครอง", "ขาด/ลา"].map((h) => (
                      <th key={h} className="whitespace-nowrap px-2 py-1 font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {c.students.map((s) => (
                    <tr key={s.code}>
                      <td className="px-2 py-1 font-medium">{s.nickname}</td>
                      <td className="px-2 py-1">{s.fullName}</td>
                      <td className="px-2 py-1">{gradeLabel(s.grade)}</td>
                      <td className="px-2 py-1 text-gray-600">{s.school ?? "—"}</td>
                      <td className="whitespace-nowrap px-2 py-1">{s.parentPhone || "—"}</td>
                      <td className={`px-2 py-1 ${s.absences >= 3 ? "font-medium text-red-600" : "text-gray-500"}`}>{s.absences || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      ))}

      <p className="text-xs text-gray-500 print:hidden">
        ครูที่เข้าระบบเองจะเห็นเฉพาะตารางของตัวเองทันที · เจ้าของเลือกดูของครูคนไหนก็ได้แล้วกดพิมพ์ส่งให้ · ช่อง “ขาด/ลา” นับจากที่เช็กชื่อไว้ในคอร์สนั้น
      </p>
    </div>
  );
}
