"use client";

import { useState } from "react";
import { useMe } from "@/components/me";
import { Badge, Button, Card, ErrorText, Select } from "@/components/ui";
import { useLoad } from "@/lib/client/api";
import { gradeRange, gradeRangeEn, SUBJECT_EN, SUBJECT_SHORT, WEEKDAY_EN, gradeLabel, gradeLabelEn } from "@/lib/grade";
import { WEEKDAY_TH } from "@/lib/schedule";
import type { Subject } from "@/lib/types";

interface StudentRow {
  code: string;
  nickname: string;
  fullName: string;
  englishName?: string;
  grade: number;
  school?: string;
  parentPhone: string;
  absences: number;
}
interface CourseRow {
  id: string;
  name: string;
  subject: Subject;
  grades: number[];
  weekday: number;
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

// ข้อความทั้งหน้าอยู่ที่เดียว เพิ่มภาษาใหม่ก็เติมคอลัมน์
const T = {
  th: {
    title: "ใบตารางสอนของครู",
    print: "พิมพ์ / ส่งให้ครู (PDF)",
    printedOn: "พิมพ์เมื่อ",
    branch: "Bright Up Kids สาขาวัดหลวงพ่อโต บางพลี",
    noCourse: "ยังไม่ได้รับผิดชอบคอร์สไหน",
    noCourseHelp: "ผูกครูกับคอร์สที่หน้า “คอร์ส” ช่องครูผู้สอน แล้วตารางนี้จะขึ้นเอง",
    every: (d: string) => `ทุกวัน${d}`,
    week: "สัปดาห์ที่",
    left: "เหลือ",
    ends: "จบคอร์ส",
    notPlanned: "ยังไม่กำหนดวันเริ่ม",
    next: "วันสอนถัดไป",
    studentsIn: (n: number) => `นักเรียนในคาบนี้ ${n} คน`,
    noStudents: "ยังไม่มีนักเรียนลงเรียน",
    cols: ["ชื่อเล่น", "ชื่อ-สกุล", "ชั้น", "โรงเรียน", "เบอร์ผู้ปกครอง", "ขาด/ลา"],
    footer: "ครูที่เข้าระบบเองจะเห็นเฉพาะตารางของตัวเอง · เจ้าของเลือกดูของครูคนไหนก็ได้แล้วกดพิมพ์ส่งให้",
  },
  en: {
    title: "Teaching Schedule",
    print: "Print / Save as PDF",
    printedOn: "Printed on",
    branch: "Bright Up Kids — Wat Luang Phor Toh Branch, Bang Phli",
    noCourse: "No courses assigned yet",
    noCourseHelp: "Assign a teacher to a course on the Courses page and it will appear here.",
    every: (d: string) => `Every ${d}`,
    week: "Week",
    left: "left",
    ends: "Ends",
    notPlanned: "Start date not set",
    next: "Next classes",
    studentsIn: (n: number) => `${n} student${n === 1 ? "" : "s"} in this class`,
    noStudents: "No students enrolled yet",
    cols: ["Nickname", "Full name", "Grade", "School", "Parent phone", "Absent/Leave"],
    footer: "Teachers see only their own schedule when they sign in. The owner can switch teachers and print this sheet.",
  },
};

export default function TeacherSheetPage() {
  const { me } = useMe();
  const [teacherId, setTeacherId] = useState("");
  const [lang, setLang] = useState<"th" | "en">("th");
  const { data, error } = useLoad<Data>(`admin/teacher-sheet${teacherId ? `?teacherId=${teacherId}` : ""}`);
  const isOwner = me.role === "owner";
  const t = T[lang];

  const dayName = (weekday: number) => (lang === "th" ? WEEKDAY_TH[weekday] : WEEKDAY_EN[weekday]);
  const subject = (s: Subject) => (lang === "th" ? SUBJECT_SHORT[s] : SUBJECT_EN[s]);
  const grades = (list: number[]) => (lang === "th" ? gradeRange(list) : gradeRangeEn(list));
  const grade = (g: number) => (lang === "th" ? gradeLabel(g) : gradeLabelEn(g));
  const date = (d?: string) =>
    d
      ? new Date(`${d}T00:00:00`).toLocaleDateString(lang === "th" ? "th-TH" : "en-GB", { weekday: "short", day: "numeric", month: "short" })
      : "—";

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <h1 className="text-2xl font-bold">{t.title}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex overflow-hidden rounded-xl border border-gray-300">
            {(["th", "en"] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLang(code)}
                className={`px-3 py-2 text-sm font-medium ${lang === code ? "bg-amber-500 text-white" : "bg-white text-gray-700"}`}
              >
                {code === "th" ? "ไทย" : "EN"}
              </button>
            ))}
          </div>
          {isOwner && (
            <Select value={data?.teacherId ?? ""} onChange={(e) => setTeacherId(e.target.value)} className="w-56">
              {(data?.teachers ?? []).map((x) => (
                <option key={x.id} value={x.id}>
                  {x.displayName}
                </option>
              ))}
            </Select>
          )}
          <Button onClick={() => window.print()}>{t.print}</Button>
        </div>
      </div>
      <ErrorText>{error}</ErrorText>

      <div className="hidden print:block">
        <h1 className="text-xl font-bold">
          {t.title} — {data?.teacherName}
        </h1>
        <p className="text-xs text-gray-500">
          {t.branch} · {t.printedOn} {date(data?.today)}
        </p>
      </div>

      {data && data.courses.length === 0 && (
        <Card>
          <b>
            {data.teacherName} — {t.noCourse}
          </b>
          <p className="text-sm text-gray-600">{t.noCourseHelp}</p>
        </Card>
      )}

      {data?.courses.map((c) => (
        <Card key={c.id} className="grid gap-3 break-inside-avoid">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b pb-2">
            <div>
              <h2 className="text-lg font-bold">{c.name}</h2>
              <div className="text-sm text-gray-600">
                {subject(c.subject)} · {grades(c.grades)} ·{" "}
                <b>
                  {t.every(dayName(c.weekday))} {c.startTime}–{c.endTime}
                </b>
                {c.room ? ` · ${c.room}` : ""}
              </div>
            </div>
            <div className="text-right text-sm">
              {c.planned ? (
                <>
                  <div>
                    {t.week} {c.done}/{c.total} · {t.left} {c.left}
                  </div>
                  <div className="text-gray-500">
                    {t.ends} {date(c.endDate)}
                  </div>
                </>
              ) : (
                <Badge color="amber">{t.notPlanned}</Badge>
              )}
            </div>
          </div>

          {c.upcoming.length > 0 && (
            <div className="text-sm text-gray-600">
              {t.next}: {c.upcoming.map(date).join(" · ")}
            </div>
          )}

          <div>
            <div className="mb-1 text-sm font-medium">{t.studentsIn(c.students.length)}</div>
            {c.students.length === 0 && <p className="text-sm text-gray-400">{t.noStudents}</p>}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs text-gray-600">
                  <tr>
                    {t.cols.map((h) => (
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
                      {/* ครูต่างชาติอ่านชื่อไทยไม่ออก — ถ้ามีชื่ออังกฤษในใบสมัครให้ใช้ก่อน */}
                      <td className="px-2 py-1">{lang === "en" ? s.englishName || s.fullName : s.fullName}</td>
                      <td className="px-2 py-1">{grade(s.grade)}</td>
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

      <p className="text-xs text-gray-500 print:hidden">{t.footer}</p>
    </div>
  );
}
