import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { AppUser, Assessment, Attendance, Course, Enrollment, Invoice, Notification, Slip, Student } from "../../types";
import { publicStudent } from "../auth";
import { progressOf } from "../../assessment";
import { quotaOf } from "../../quota";
import { courseProgress, sessionDates, WEEKDAY_TH } from "../../schedule";
import { notifyParent } from "../notify";
import { route, STAFF } from "../router";
import type { Store } from "../store";
import { summarizeStudents, weeklyText } from "../summary";
import { bkkDate, HttpError, nowIso, randomDigits, str } from "../util";

const PARENT = ["parent"] as const;

route("GET", "parent/overview", PARENT, async ({ store, me }) => {
  const children = (await store.list<Student>("students", { parentId: me!.id })).filter((s) => s.active);
  const [summaries, invoices, attendance, courses, assessments, enrollments] = await Promise.all([
    summarizeStudents(store, children, 7),
    store.list<Invoice>("invoices"),
    store.list<Attendance>("attendance"),
    store.list<Course>("courses"),
    store.list<Assessment>("assessments"),
    store.list<Enrollment>("enrollments", { status: "active" }),
  ]);
  const today = bkkDate();
  return {
    lineConfigured: Boolean(process.env.LINE_CHANNEL_ACCESS_TOKEN),
    children: children.map((s) => ({
      ...publicStudent(s),
      summary: summaries.find((x) => x.studentId === s.id),
      // ตารางเรียน: คอร์สที่ลงไว้ เรียนวันไหน กี่โมง และอีกกี่สัปดาห์จบคอร์ส
      schedule: enrollments
        .filter((e) => e.studentId === s.id)
        .map((e) => courses.find((c) => c.id === e.courseId))
        .filter((c): c is Course => Boolean(c))
        .map((c) => ({
          course: c.name,
          // คาบคงเหลือของลูกในคอร์สนี้ — ผู้ปกครองจะได้รู้ว่าต้องต่อคอร์สเมื่อไร
          quota: quotaOf(enrollments.find((e) => e.studentId === s.id && e.courseId === c.id)!, attendance),
          weekday: c.weekday,
          weekdayName: WEEKDAY_TH[c.weekday],
          startTime: c.startTime,
          endTime: c.endTime,
          room: c.room,
          ...courseProgress(c, today),
          // วันเรียนครั้งถัด ๆ ไป ไว้ให้ผู้ปกครองวางแผน
          upcoming: sessionDates(c).filter((d) => d >= today).slice(0, 6),
        }))
        .sort((a, b) => a.weekday - b.weekday || a.startTime.localeCompare(b.startTime)),
      // พัฒนาการจากคะแนนวัดระดับ แยกตามคอร์ส — ผู้ปกครองเห็นว่าจ่ายค่าเรียนแล้วลูกดีขึ้นแค่ไหน
      progress: [...new Set(assessments.filter((a) => a.studentId === s.id).map((a) => a.courseId ?? ""))].map((courseId) => ({
        course: courses.find((c) => c.id === courseId)?.name ?? "วัดระดับทั่วไป",
        ...progressOf(
          s.id,
          assessments.filter((a) => a.studentId === s.id && (a.courseId ?? "") === courseId),
        ),
      })),
      today: attendance
        .filter((a) => a.studentId === s.id && a.date === today)
        .map((a) => ({ course: courses.find((c) => c.id === a.courseId)?.name ?? "", status: a.status })),
      recentAttendance: attendance
        .filter((a) => a.studentId === s.id)
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 10)
        .map((a) => ({ date: a.date, course: courses.find((c) => c.id === a.courseId)?.name ?? "", status: a.status })),
      invoices: invoices
        .filter((i) => i.studentId === s.id && i.status !== "void")
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 10),
    })),
  };
});

// ผู้ปกครองแนบสลิป — เครื่องผู้ปกครองย่อรูปก่อนส่ง (shrinkImage ใน app/parent/page.tsx)
route("POST", "parent/invoices/:id/slip", PARENT, async ({ store, params, body, me }) => {
  const invoice = await store.get<Invoice>("invoices", params.id);
  const student = invoice && (await store.get<Student>("students", invoice.studentId));
  if (!invoice || student?.parentId !== me!.id) throw new HttpError(404, "ไม่พบใบแจ้ง");
  if (invoice.status === "paid" || invoice.status === "void") throw new HttpError(400, "ใบแจ้งนี้ปิดไปแล้ว");
  const dataUrl = str(body.dataUrl, "รูปสลิป", 700_000);
  if (!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(dataUrl)) throw new HttpError(400, "ไฟล์ต้องเป็นรูปภาพ");
  await store.set("slips", { id: invoice.id, dataUrl, uploadedBy: me!.id, uploadedAt: nowIso() } satisfies Slip);
  await store.set("invoices", { ...invoice, status: "slip_uploaded" });
  return { ok: true };
});

// ---------- ผูก LINE ----------

// ผู้ปกครองขอรหัส 6 หลัก แล้วพิมพ์รหัสนี้ส่งใน LINE OA ของสถาบัน
route("POST", "parent/line-code", PARENT, async ({ store, me }) => {
  const user = await store.get<AppUser>("users", me!.id);
  if (!user) throw new HttpError(404, "ไม่พบผู้ใช้");
  const code = randomDigits(6);
  await store.set("users", { ...user, lineLinkCode: code, lineLinkExpires: new Date(Date.now() + 15 * 60_000).toISOString() });
  return { code, expiresInMinutes: 15 };
});

async function lineReply(replyToken: string, text: string) {
  await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}` },
    body: JSON.stringify({ replyToken, messages: [{ type: "text", text }] }),
  });
}

// Webhook จาก LINE: ตรวจลายเซ็นก่อนเสมอ
route("POST", "line/webhook", "public", async ({ store, req, rawBody, body }) => {
  const secret = process.env.LINE_CHANNEL_SECRET;
  if (!secret) throw new HttpError(503, "ยังไม่ได้ตั้งค่า LINE");
  const expected = createHmac("sha256", secret).update(rawBody).digest();
  const given = Buffer.from(req.headers.get("x-line-signature") ?? "", "base64");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) throw new HttpError(401, "ลายเซ็นไม่ถูกต้อง");

  for (const event of Array.isArray(body.events) ? body.events : []) {
    const text: unknown = event?.message?.text;
    const lineUserId: unknown = event?.source?.userId;
    if (event?.type !== "message" || typeof text !== "string" || typeof lineUserId !== "string") continue;
    const code = text.trim();
    if (!/^\d{6}$/.test(code)) continue;
    const [user] = await store.list<AppUser>("users", { lineLinkCode: code });
    if (!user || !user.lineLinkExpires || Date.parse(user.lineLinkExpires) < Date.now()) {
      await lineReply(event.replyToken, "รหัสไม่ถูกต้องหรือหมดอายุ กรุณาขอรหัสใหม่ในหน้าผู้ปกครอง");
      continue;
    }
    await store.set("users", { ...user, lineUserId, lineLinkCode: undefined, lineLinkExpires: undefined });
    await lineReply(event.replyToken, `ผูกบัญชีคุณ${user.displayName}เรียบร้อย จะได้รับแจ้งเตือนทางนี้ค่ะ`);
  }
  return { ok: true };
});

// ---------- แจ้งเตือน (ครูดู) + สรุปรายสัปดาห์ ----------

route("GET", "admin/notifications", STAFF, async ({ store }) => {
  const [notes, users] = await Promise.all([store.list<Notification>("notifications"), store.list<AppUser>("users", { role: "parent" })]);
  return {
    lineConfigured: Boolean(process.env.LINE_CHANNEL_ACCESS_TOKEN),
    linkedParents: users.filter((u) => u.lineUserId).length,
    totalParents: users.length,
    notifications: notes
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 200)
      .map((n) => ({ ...n, parentName: users.find((u) => u.id === n.parentId)?.displayName })),
  };
});

async function sendWeekly(store: Store): Promise<number> {
  const students = (await store.list<Student>("students", { active: true })).filter((s) => s.parentId);
  const summaries = await summarizeStudents(store, students, 7);
  for (const s of summaries) {
    await notifyParent(store, students.find((st) => st.id === s.studentId)?.parentId, "weekly", weeklyText(s));
  }
  return summaries.length;
}

route("POST", "admin/notify/weekly", STAFF, async ({ store }) => ({ sent: await sendWeekly(store) }));

// Vercel Cron เรียกทุกสัปดาห์ (ดู vercel.json) — ต้องส่ง Authorization: Bearer CRON_SECRET
route("GET", "cron/weekly", "public", async ({ store, req }) => {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) throw new HttpError(401, "ไม่ได้รับอนุญาต");
  return { sent: await sendWeekly(store) };
});
