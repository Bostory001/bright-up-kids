"use client";

import { useState } from "react";
import { Badge, Card, ErrorText } from "@/components/ui";
import { useLoad } from "@/lib/client/api";
import { SUBJECT_SHORT, gradeRange } from "@/lib/grade";
import type { Subject } from "@/lib/types";
import { type Conflict, type TimetableCourse, WEEKDAYS, teacherRows, toMinutes, weeklyGrid } from "@/lib/timetable";
import { WEEK_ORDER } from "@/lib/schedule";

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

const HOUR_PX = 110; // ความกว้างต่อ 1 ชั่วโมงบนแกนเวลา
const LANE_PX = 64;
const NAME_PX = 112;

/** ตารางตามครู: แกน Y = ครู, แกน X = เวลา — แยกการ์ดเสาร์/อาทิตย์ */
function TeacherView({ courses }: { courses: TimetableCourse[] }) {
  const weekend = [6, 0].map((weekday) => ({ weekday, list: courses.filter((c) => c.weekday === weekday) }));
  const all = weekend.flatMap((d) => d.list);
  if (all.length === 0) return <p className="text-gray-500">ยังไม่มีคอร์สวันเสาร์-อาทิตย์</p>;
  // แกนเวลาเดียวกันทั้งสองวัน เพื่อเทียบข้ามวันได้ง่าย
  const startHour = Math.floor(Math.min(...all.map((c) => toMinutes(c.startTime))) / 60);
  const endHour = Math.ceil(Math.max(...all.map((c) => toMinutes(c.endTime))) / 60);
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);
  const x = (time: string) => ((toMinutes(time) - startHour * 60) / 60) * HOUR_PX;

  return (
    <div className="grid gap-4">
      {weekend.map(({ weekday, list }) => {
        const rows = teacherRows(list);
        return (
          <Card key={weekday} className="break-inside-avoid overflow-x-auto">
            <div className="mb-2 flex items-baseline justify-between">
              <h2 className="text-lg font-bold">วัน{WEEKDAYS[weekday]}</h2>
              <span className="text-xs text-gray-500">
                {list.length} คาบ · {rows.length} ครู
              </span>
            </div>
            {rows.length === 0 ? (
              <p className="text-sm text-gray-400">ไม่มีคาบเรียน</p>
            ) : (
              <div style={{ width: NAME_PX + hours.length * HOUR_PX }}>
                <div className="flex border-b border-gray-300 text-xs text-gray-500">
                  <div style={{ width: NAME_PX }} className="shrink-0 py-1 font-semibold">ครู / เวลา</div>
                  {hours.map((h) => (
                    <div key={h} style={{ width: HOUR_PX }} className="shrink-0 border-l border-gray-200 py-1 pl-1">
                      {String(h).padStart(2, "0")}:00
                    </div>
                  ))}
                </div>
                {rows.map((row) => (
                  <div key={row.teacher} className="flex border-b border-gray-200">
                    <div style={{ width: NAME_PX }} className="flex shrink-0 items-center pr-2 text-sm font-semibold">
                      {row.teacher}
                    </div>
                    <div className="relative" style={{ width: hours.length * HOUR_PX, height: row.lanes.length * LANE_PX }}>
                      {hours.map((h, i) => (
                        <div key={h} className="absolute inset-y-0 border-l border-gray-200" style={{ left: i * HOUR_PX }} />
                      ))}
                      {row.lanes.map((lane, li) =>
                        lane.map((c) => (
                          <div
                            key={c.id}
                            title={`${c.name} ${c.startTime}–${c.endTime}`}
                            className={`absolute overflow-hidden rounded-lg border-l-4 px-1.5 py-1 text-xs leading-tight ${SUBJECT_COLOR[c.subject]}`}
                            style={{ left: x(c.startTime) + 1, width: x(c.endTime) - x(c.startTime) - 2, top: li * LANE_PX + 2, height: LANE_PX - 4 }}
                          >
                            <div className="font-semibold">
                              {SUBJECT[c.subject]} · {gradeRange(c.grades)}
                            </div>
                            <div className="truncate">{c.name}</div>
                            <div className="text-gray-600">
                              {c.startTime}–{c.endTime}
                              {c.room ? ` · ${c.room}` : ""} · {c.enrolled}/{c.capacity}
                            </div>
                          </div>
                        )),
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        );
      })}
      <p className="text-xs text-gray-500 print:hidden">คาบที่เวลาทับกันของครูคนเดียวกันจะถูกวางซ้อนเป็นแถวล่าง = เวลาชน ควรแก้ที่หน้า “คอร์ส”</p>
    </div>
  );
}

export default function TimetablePage() {
  const { data, error } = useLoad<Data>("admin/timetable");
  const [view, setView] = useState<"day" | "teacher">("day");
  const open = (data?.courses ?? []).filter((c) => c.active);
  const grid = weeklyGrid(open);
  // วันที่ไม่มีคอร์สเลยไม่ต้องกินที่บนจอ — แต่เสาร์อาทิตย์แสดงเสมอเพราะเป็นวันหลักของสถาบัน
  // เรียงจันทร์ → อาทิตย์ เพื่อให้เสาร์-อาทิตย์ (วันเรียนหลัก) อยู่ติดกันท้ายสัปดาห์
  const days = WEEK_ORDER.map((weekday) => ({ label: WEEKDAYS[weekday], weekday, courses: grid[weekday] })).filter((d) => d.courses.length > 0 || d.weekday === 0 || d.weekday === 6);
  const closed = (data?.courses ?? []).filter((c) => !c.active);

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <h1 className="text-2xl font-bold">ตารางสอน</h1>
        <div className="flex rounded-xl border border-amber-300 p-0.5 text-sm font-semibold">
          {(["day", "teacher"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} className={`rounded-lg px-3 py-1.5 transition ${view === v ? "bg-amber-500 text-white" : "text-amber-700"}`}>
              {v === "day" ? "ตามวัน" : "ตามครู (เสาร์-อาทิตย์)"}
            </button>
          ))}
        </div>
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

      {view === "teacher" && <TeacherView courses={open} />}

      <div className={`grid gap-3 sm:grid-cols-2 xl:grid-cols-3 ${view === "teacher" ? "hidden" : ""}`}>
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
