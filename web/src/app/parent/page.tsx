"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Card, ErrorText } from "@/components/ui";
import { api, go, useLoad } from "@/lib/client/api";
import type { Invoice } from "@/lib/types";
import { gradeLabel } from "@/lib/grade";

const ATT = { present: ["green", "มาเรียน"], late: ["amber", "มาสาย"], absent: ["red", "ขาดเรียน"], leave: ["blue", "ลา"] } as const;
const INV = { unpaid: ["red", "ยังไม่จ่าย"], slip_uploaded: ["amber", "รอตรวจสลิป"], paid: ["green", "จ่ายแล้ว"], void: ["gray", "ยกเลิก"] } as const;
type AttStatus = keyof typeof ATT;

interface Child {
  id: string;
  code: string;
  nickname: string;
  grade: number;
  summary?: { level: number; exercisesDone: number; accuracy: number | null; topics: { topic: string; percent: number }[]; unpaidAmount: number };
  today: { course: string; status: AttStatus }[];
  recentAttendance: { date: string; course: string; status: AttStatus }[];
  invoices: Invoice[];
  progress: { course: string; prePercent: number | null; postPercent: number | null; gain: number | null }[];
  schedule: {
    course: string;
    quota?: { paid: number | null; used: number; left: number | null; low: boolean; finished: boolean };
    weekdayName: string;
    startTime: string;
    endTime: string;
    room?: string;
    online?: boolean;
    meetUrl?: string;
    planned: boolean;
    total: number;
    done: number;
    left: number;
    startDate?: string;
    endDate?: string;
    nextDate?: string;
    finished: boolean;
    upcoming: string[];
  }[];
}

const thaiDay = (d?: string) => (d ? new Date(`${d}T00:00:00`).toLocaleDateString("th-TH", { weekday: "short", day: "numeric", month: "short" }) : "—");

// ย่อรูปสลิปในเครื่องก่อนส่ง (ด้านยาว ≤ 1000px, JPEG) ให้เล็กพอเก็บในฐานข้อมูล
async function shrinkImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1000 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.7);
}

export default function ParentPage() {
  const me = useLoad<{ me: { role: string; displayName: string; mustChangePassword: boolean; lineLinked: boolean } | null }>("me");
  const isParent = me.data?.me?.role === "parent";
  const { data, error, reload } = useLoad<{ lineConfigured: boolean; children: Child[] }>(isParent ? "parent/overview" : null);
  const [lineCode, setLineCode] = useState("");
  const [pw, setPw] = useState({ current: "", next: "" });
  const [message, setMessage] = useState("");
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    if (me.data && !isParent) go(me.data.me ? "/admin" : "/login");
  }, [me.data, isParent]);

  async function run(fn: () => Promise<void>) {
    setActionError("");
    setMessage("");
    try {
      await fn();
    } catch (err) {
      setActionError((err as Error).message);
    }
  }

  if (!isParent || !me.data?.me) return <main className="flex-1 p-6 text-center text-gray-500">กำลังโหลด...</main>;
  const user = me.data.me;

  return (
    <main className="mx-auto grid w-full max-w-2xl flex-1 content-start gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">สวัสดีค่ะ คุณ{user.displayName}</h1>
        <button
          className="text-sm text-gray-500 underline"
          onClick={async () => {
            await api("auth/logout", {});
            go("/");
          }}
        >
          ออกจากระบบ
        </button>
      </div>
      <ErrorText>{error || actionError}</ErrorText>
      {message && <p className="rounded-xl bg-green-50 p-3 text-sm text-green-700">{message}</p>}

      {user.mustChangePassword && (
        <Card className="grid gap-2 border-2 border-amber-400">
          <b>ตั้งรหัสผ่านใหม่</b>
          <p className="text-sm text-gray-600">คุณยังใช้รหัสผ่านชั่วคราวจากสถาบัน</p>
          <input type="password" placeholder="รหัสผ่านชั่วคราว" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} className="rounded-xl border border-gray-300 px-3 py-2" />
          <input type="password" placeholder="รหัสผ่านใหม่ (อย่างน้อย 8 ตัว)" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} className="rounded-xl border border-gray-300 px-3 py-2" />
          <Button
            onClick={() =>
              run(async () => {
                await api("auth/password", pw);
                setMessage("เปลี่ยนรหัสผ่านแล้ว");
                me.reload();
              })
            }
          >
            บันทึก
          </Button>
        </Card>
      )}

      {data?.children.length === 0 && <p className="text-gray-500">ยังไม่มีข้อมูลนักเรียนในบัญชีนี้</p>}
      {data?.children.map((c) => (
        <Card key={c.id} className="grid gap-3">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-bold">
              น้อง{c.nickname} <span className="text-sm font-normal text-gray-500">{gradeLabel(c.grade)}</span>
            </h2>
            <span className="font-mono text-xs text-gray-500">{c.code}</span>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-600">วันนี้</div>
            {c.today.length === 0 ? (
              <p className="text-sm text-gray-500">ยังไม่มีการเช็กชื่อวันนี้</p>
            ) : (
              c.today.map((t) => (
                <div key={t.course} className="text-sm">
                  {t.course} <Badge color={ATT[t.status][0]}>{ATT[t.status][1]}</Badge>
                </div>
              ))
            )}
          </div>

          <div>
            <div className="text-sm font-medium text-gray-600">แบบฝึกหัดออนไลน์ 7 วันล่าสุด (Lv.{c.summary?.level ?? 1})</div>
            {c.summary?.exercisesDone ? (
              <p className="text-sm">
                ทำ {c.summary.exercisesDone} ชุด ตอบถูก {c.summary.accuracy}%
                {c.summary.topics.filter((t) => t.percent < 70).length > 0 && (
                  <span className="block text-amber-700">
                    ควรฝึกเพิ่ม:{" "}
                    {c.summary.topics
                      .filter((t) => t.percent < 70)
                      .map((t) => `${t.topic} (${t.percent}%)`)
                      .join(", ")}
                  </span>
                )}
              </p>
            ) : (
              <p className="text-sm text-gray-500">ยังไม่ได้ทำแบบฝึกหัดในสัปดาห์นี้</p>
            )}
          </div>

          <div>
            <div className="text-sm font-medium text-gray-600">ค่าเรียน</div>
            {c.invoices.length === 0 && <p className="text-sm text-gray-500">ไม่มีใบแจ้ง</p>}
            {c.invoices.map((i) => (
              <div key={i.id} className="mt-1 rounded-xl border border-gray-200 p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <b>{i.amount.toLocaleString()} บาท</b>
                  <Badge color={INV[i.status][0]}>{INV[i.status][1]}</Badge>
                </div>
                <div className="text-gray-600">
                  {i.description} · ครบกำหนด {i.dueDate}
                </div>
                {(i.status === "unpaid" || i.status === "slip_uploaded") && (
                  <label className="mt-2 inline-block cursor-pointer rounded-xl bg-amber-500 px-4 py-2 font-semibold text-white">
                    {i.status === "unpaid" ? "แนบสลิป" : "แนบสลิปใหม่"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        run(async () => {
                          await api(`parent/invoices/${i.id}/slip`, { dataUrl: await shrinkImage(file) });
                          setMessage("ส่งสลิปแล้ว รอสถาบันตรวจสอบ");
                          reload();
                        });
                      }}
                    />
                  </label>
                )}
              </div>
            ))}
          </div>

          {c.schedule.length > 0 && (
            <div className="rounded-xl bg-sky-50 p-3">
              <b className="text-sm">ตารางเรียนของน้อง{c.nickname}</b>
              {c.schedule.map((s) => (
                <div key={s.course} className="mt-2 text-sm">
                  <div className="font-medium">
                    {s.course} · ทุกวัน{s.weekdayName} {s.startTime}–{s.endTime}
                    {s.room ? ` · ${s.room}` : ""}
                  </div>
                  {s.online && (
                    <div className="text-sm">
                      {s.meetUrl ? (
                        <a href={s.meetUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-sky-700 underline">
                          เรียนออนไลน์ — กดเข้าห้อง Google Meet
                        </a>
                      ) : (
                        <span className="text-gray-500">เรียนออนไลน์ — สถาบันจะส่งลิงก์ให้ก่อนเรียน</span>
                      )}
                    </div>
                  )}
                  {s.quota?.left !== null && s.quota !== undefined && (
                    <div className={`text-sm ${s.quota.finished ? "font-medium text-red-600" : s.quota.low ? "font-medium text-amber-600" : "text-gray-700"}`}>
                      คาบคงเหลือ {s.quota.left} จาก {s.quota.paid} คาบ
                      {s.quota.finished ? " · ครบแล้ว ติดต่อสถาบันเพื่อต่อคอร์ส" : s.quota.low ? " · ใกล้ครบแล้ว" : ""}
                    </div>
                  )}
                  {s.planned ? (
                    <>
                      <div className="text-gray-700">
                        {s.finished
                          ? `เรียนครบ ${s.total} สัปดาห์แล้ว (จบ ${thaiDay(s.endDate)})`
                          : `เรียนแล้ว ${s.done}/${s.total} สัปดาห์ · เหลืออีก ${s.left} สัปดาห์ · จบคอร์ส ${thaiDay(s.endDate)}`}
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-white">
                        <div className="h-2 rounded-full bg-sky-500" style={{ width: `${s.total ? Math.min(100, (s.done / s.total) * 100) : 0}%` }} />
                      </div>
                      {!s.finished && s.upcoming.length > 0 && <div className="mt-1 text-xs text-gray-600">วันเรียนถัดไป: {s.upcoming.map(thaiDay).join(" · ")}</div>}
                    </>
                  ) : (
                    <div className="text-xs text-gray-500">ยังไม่ได้กำหนดวันเริ่มคอร์ส</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {c.progress.some((p) => p.prePercent !== null || p.postPercent !== null) && (
            <div className="rounded-xl bg-amber-50 p-3">
              <b className="text-sm">พัฒนาการจากการวัดผล</b>
              {c.progress
                .filter((p) => p.prePercent !== null || p.postPercent !== null)
                .map((p) => (
                  <div key={p.course} className="mt-1 text-sm">
                    <span className="text-gray-700">{p.course}: </span>
                    <span>ก่อนเรียน {p.prePercent === null ? "—" : `${p.prePercent}%`}</span>
                    <span> → หลังเรียน {p.postPercent === null ? "ยังไม่ได้วัด" : `${p.postPercent}%`}</span>
                    {p.gain !== null && <b className={p.gain > 0 ? " text-green-700" : " text-red-600"}> ({p.gain > 0 ? "+" : ""}{p.gain} จุด)</b>}
                  </div>
                ))}
            </div>
          )}

          <details>
            <summary className="cursor-pointer text-sm font-medium text-gray-600">ประวัติการเข้าเรียนล่าสุด</summary>
            {c.recentAttendance.map((a) => (
              <div key={`${a.date}${a.course}`} className="mt-1 flex justify-between text-sm">
                <span>
                  {a.date} · {a.course}
                </span>
                <Badge color={ATT[a.status][0]}>{ATT[a.status][1]}</Badge>
              </div>
            ))}
          </details>
        </Card>
      ))}

      <Card className="grid gap-2">
        <b>รับแจ้งเตือนทาง LINE</b>
        {user.lineLinked ? (
          <p className="text-sm text-green-700">✅ ผูก LINE แล้ว</p>
        ) : data && !data.lineConfigured ? (
          <p className="text-sm text-gray-500">สถาบันยังไม่ได้เปิดใช้การแจ้งเตือนทาง LINE</p>
        ) : lineCode ? (
          <p className="text-sm">
            พิมพ์รหัส <b className="font-mono text-xl">{lineCode}</b> ส่งในแชต LINE ของสถาบันภายใน 15 นาที
          </p>
        ) : (
          <Button variant="ghost" onClick={() => run(async () => setLineCode((await api("parent/line-code", {})).code))}>
            ผูก LINE
          </Button>
        )}
      </Card>
    </main>
  );
}
