import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { Application, Course, Invoice, Student } from "../../types";
import { omit } from "../auth";
import { route, STAFF } from "../router";
import { summarizeStudents } from "../summary";
import { bkkDate, HttpError, num, oneOf, str } from "../util";

// ผู้ช่วย AI ใช้ได้เฉพาะครู/เจ้าของ — ห้ามเปิด route นี้ให้ role student (ข้อตัดสินใจของเจ้าของ)
// ข้อมูลที่ส่งออกไปหา AI: รหัสนักเรียน + ชื่อเล่น + สถิติ เท่านั้น ไม่ส่งชื่อจริง เบอร์โทร หรือชื่อผู้ปกครอง

const MODEL = "claude-opus-5-5";
const SUBJECT_TH = { math: "คณิตศาสตร์", thai: "ภาษาไทย", english: "ภาษาอังกฤษ", science: "วิทยาศาสตร์" };

function client(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) throw new HttpError(503, "ยังไม่ได้ตั้งค่า ANTHROPIC_API_KEY ใน .env.local");
  return new Anthropic();
}

function aiError(err: unknown): never {
  if (err instanceof HttpError) throw err;
  if (err instanceof Anthropic.AuthenticationError) throw new HttpError(503, "ANTHROPIC_API_KEY ไม่ถูกต้อง");
  if (err instanceof Anthropic.RateLimitError) throw new HttpError(429, "ใช้งาน AI ถี่เกินไป รอสักครู่แล้วลองใหม่");
  if (err instanceof Anthropic.APIError) throw new HttpError(502, `AI ขัดข้อง (${err.status ?? "เชื่อมต่อไม่ได้"})`);
  throw err;
}

route("GET", "admin/ai/status", STAFF, async () => ({ configured: Boolean(process.env.ANTHROPIC_API_KEY) }));

route("POST", "admin/ai/ask", STAFF, async ({ store, body }) => {
  const question = str(body.question, "คำถาม", 1000);
  const students = await store.list<Student>("students", { active: true });
  const [summaries, courses, invoices, applications] = await Promise.all([
    summarizeStudents(store, students, 30),
    store.list<Course>("courses"),
    store.list<Invoice>("invoices"),
    store.list<Application>("applications", { status: "pending" }),
  ]);
  const data = {
    today: bkkDate(),
    note: "attendance นับ 30 วันล่าสุด, topics/accuracy นับ 30 วันล่าสุด เรียงจากหัวข้อที่อ่อนสุด",
    students: summaries.map((s) => omit(s, ["studentId"])),
    courses: courses.map((c) => ({ name: c.name, subject: c.subject, grades: c.grades, pricePerTerm: c.pricePerTerm, active: c.active })),
    overdueInvoices: invoices
      .filter((i) => i.status === "unpaid" && i.dueDate < bkkDate())
      .map((i) => ({ student: students.find((s) => s.id === i.studentId)?.code, amount: i.amount, dueDate: i.dueDate })),
    pendingApplications: applications.length,
  };

  try {
    const response = await client().beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      output_config: { effort: "medium" },
      // ถ้าตัวกรองความปลอดภัยปฏิเสธ ให้ API ลองรุ่นสำรองให้อัตโนมัติ
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system:
        "คุณคือผู้ช่วยของครูและเจ้าของสถาบันเรียนพิเศษระดับประถม (ป.1-6) ตอบเป็นภาษาไทย กระชับ ใช้ข้อมูลใน JSON ที่ให้มาเท่านั้น " +
        "อ้างถึงนักเรียนด้วยชื่อเล่นและรหัส ถ้าข้อมูลไม่พอให้บอกตรง ๆ ว่าไม่มีข้อมูล ห้ามเดาตัวเลข " +
        "เมื่อพูดถึงจุดอ่อนของเด็ก ให้เสนอสิ่งที่ครูทำได้จริง 1-2 ข้อ",
      messages: [{ role: "user", content: `ข้อมูลสถาบัน:\n${JSON.stringify(data)}\n\nคำถาม: ${question}` }],
    });
    if (response.stop_reason === "refusal") throw new HttpError(422, "AI ไม่สามารถตอบคำถามนี้ได้");
    const answer = response.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("\n");
    return { answer };
  } catch (err) {
    aiError(err);
  }
});

const DraftSchema = z.object({
  questions: z.array(
    z.object({
      prompt: z.string(),
      choices: z.array(z.string()),
      answerIndex: z.number(),
      explain: z.string(),
    }),
  ),
});

// ร่างโจทย์ให้ครูตรวจ — ไม่บันทึกเอง ครูต้องแก้/ยืนยันในหน้าคลังแบบฝึกหัดก่อนเผยแพร่
route("POST", "admin/ai/draft", STAFF, async ({ body }) => {
  const subject = oneOf(body.subject, ["math", "thai", "english", "science"] as const, "วิชา");
  const grade = num(body.grade, "ชั้น", 1, 6);
  const topic = str(body.topic, "หัวข้อ", 100);
  const count = num(body.count, "จำนวนข้อ", 1, 20);

  try {
    const response = await client().messages.parse({
      model: MODEL,
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      output_config: { effort: "medium", format: zodOutputFormat(DraftSchema) },
      system:
        "คุณคือครูประถมไทยที่แต่งโจทย์ปรนัยขึ้นใหม่เอง ห้ามคัดลอกจากหนังสือหรือข้อสอบที่มีอยู่ " +
        "ใช้ภาษาที่เด็กชั้นนั้นอ่านเข้าใจ แต่ละข้อมีตัวเลือก 4 ตัว มีคำตอบถูกข้อเดียว answerIndex เริ่มนับจาก 0 " +
        "สลับตำแหน่งคำตอบที่ถูก และเขียน explain สั้น ๆ 1 ประโยคให้เด็กเข้าใจว่าทำไมถูก",
      messages: [{ role: "user", content: `แต่งโจทย์วิชา${SUBJECT_TH[subject]} ชั้น ป.${grade} หัวข้อ "${topic}" จำนวน ${count} ข้อ` }],
    });
    if (response.stop_reason === "refusal" || !response.parsed_output) throw new HttpError(422, "AI ร่างโจทย์ไม่สำเร็จ ลองเปลี่ยนหัวข้อ");
    const questions = response.parsed_output.questions.filter(
      (q) => q.choices.length >= 2 && q.choices.length <= 4 && Number.isInteger(q.answerIndex) && q.answerIndex >= 0 && q.answerIndex < q.choices.length,
    );
    return { questions };
  } catch (err) {
    aiError(err);
  }
});
