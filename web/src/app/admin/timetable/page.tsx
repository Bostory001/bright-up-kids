"use client";

import { Badge, Card, ErrorText } from "@/components/ui";
import { useLoad } from "@/lib/client/api";
import { SUBJECT_SHORT, gradeRange } from "@/lib/grade";
import type { Subject } from "@/lib/types";
import { type Conflict, type TimetableCourse, WEEKDAYS, weeklyGrid } from "@/lib/timetable";

interface Data {
  courses: TimetableCourse[];
  conflicts: Conflict[];
  withoutTeacher: string[];
}

const SUBJECT = SUBJECT_SHORT;
const SUBJECT_COLOR: Record<Subject, string> = {
  math: "border-amber-400 bg-amber-50",
  thai: "border-rose-400 bg-rose-50",
  english: "border-sky-400 bg-sky-50",
  science: "border-emerald-400 bg-emerald-50",
  chinese: "border-violet-400 bg-violet-50",
};

export default function TimetablePage() {
  const { data, error } = useLoad<Data>("admin/timetable");
  const open = (data?.courses ?? []).filter((c) => c.active);
  const grid = weeklyGrid(open);
  // วันที่ไม่มีคอร์สเลยไม่ต้องกินที่บนจอ — แต่เสาร์อาทิตย์แสดงเสมอเพราะเป็นวันหลักของสถาบัน
  const days = WEEKDAYS.map((label, weekday) => ({ label, weekday, courses: grid[weekday] })).filter((d) => d.courses.length > 0 || d.weekday === 0 || d.weekday === 6);
  const closed = (data?.courses ?? []).filter((c) => !c.active);

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <h1 className="text-2xl font-bold">ตารางสอน</h1>
        <button className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition active:scale-95" onClick={() => window.print()}>
          พิมพ์ / บันทึก PDF
        </button>
      </div>
      <ErrorText>{error}</ErrorText>

      {!!data?.conflicts.length && (
        <Card className="border-2 border-red-300">
          <div className="font-bold text-red-700">เวลาชนกัน {data.conflicts.length} จุด</div>
          <ul className="mt-1 grid gap-1 text-sm text-red-700">
            {data.conflicts.map((c) => (
              <li key={`${c.kind}-${c.who}-${c.courses.join()}`}>
                • {c.detail} ({c.courses.join(" / ")})
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-gray-600">แก้ที่หน้า “คอร์ส” โดยเปลี่ยนเวลา ครู หรือห้องเรียน</p>
        </Card>
      )}

      {!!data?.withoutTeacher.length && (
        <Card className="print:hidden">
          <div className="text-sm">
            <b>ยังไม่ได้ระบุครูประจำคอร์ส:</b> {data.withoutTeacher.join(" · ")}
          </div>
          <p className="text-xs text-gray-600">ชั่วโมงสอนของคาบเหล่านี้จะไปเข้าชื่อคนที่กดเช็กชื่อ ซึ่งอาจไม่ใช่คนสอนจริง</p>
        </Card>
      )}

      {open.length === 0 && <p className="text-gray-500">ยังไม่มีคอร์สที่เปิดรับ</p>}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {days.map((day) => (
          <Card key={day.weekday} className="break-inside-avoid">
            <div className="mb-2 flex items-baseline justify-between">
              <h2 className="text-lg font-bold">วัน{day.label}</h2>
              <span className="text-xs text-gray-500">{day.courses.length} คาบ</span>
            </div>
            {day.courses.length === 0 && <p className="text-sm text-gray-400">ไม่มีคาบเรียน</p>}
            <div className="grid gap-2">
              {day.courses.map((c) => (
                <div key={c.id} className={`rounded-xl border-l-4 p-2 ${SUBJECT_COLOR[c.subject]}`}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-semibold">
                      {c.startTime}–{c.endTime}
                    </span>
                    <Badge>{SUBJECT[c.subject]}</Badge>
                  </div>
                  <div className="text-sm">{c.name}</div>
                  <div className="text-xs text-gray-600">
                    {gradeRange(c.grades)}
                    {c.teacherName ? ` · ${c.teacherName}` : " · ยังไม่ระบุครู"}
                    {c.room ? ` · ${c.room}` : ""}
                  </div>
                  <div className={`text-xs ${c.enrolled >= c.capacity ? "font-medium text-red-600" : "text-gray-500"}`}>
                    {c.enrolled}/{c.capacity} คน{c.enrolled >= c.capacity ? " · เต็มแล้ว" : ""}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {closed.length > 0 && <p className="text-xs text-gray-500 print:hidden">คอร์สที่ปิดรับแล้วไม่แสดงในตาราง: {closed.map((c) => c.name).join(" · ")}</p>}
    </div>
  );
}
