// ทดสอบ API ทั้งระบบแบบ end-to-end กับฐานข้อมูลเปล่า
// แนะนำ: npm run build แล้ว npm run smoke:isolated (สร้างฐานข้อมูลชั่วคราวให้เอง)
// npm run smoke ใช้กับ server ทดสอบที่ว่างเท่านั้น (BASE_URL ค่าเริ่มต้น http://localhost:3000)
import { createHmac } from "node:crypto";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
let passed = 0;
const failures = [];

function check(name, ok, detail = "") {
  if (ok) passed++;
  else failures.push(`${name} ${detail}`);
  console.log(`${ok ? "✓" : "✗"} ${name}${ok ? "" : ` — ${detail}`}`);
}

class Client {
  cookie = "";
  async call(path, body, method, headers = {}) {
    const res = await fetch(`${BASE}/api/${path}`, {
      method: method ?? (body === undefined ? "GET" : "POST"),
      headers: { ...(body === undefined ? {} : { "content-type": "application/json" }), ...(this.cookie ? { cookie: this.cookie } : {}), ...headers },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const set = res.headers.get("set-cookie");
    if (set) this.cookie = set.split(";")[0];
    return { status: res.status, data: await res.json().catch(() => ({})) };
  }
}

function totp(secret) {
  const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const ch of secret) bits += B32.indexOf(ch).toString(2).padStart(5, "0");
  const key = Buffer.from(bits.match(/.{8}/g).map((b) => parseInt(b, 2)));
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30000)));
  const h = createHmac("sha1", key).update(counter).digest();
  const o = h[h.length - 1] & 0xf;
  return String((h.readUInt32BE(o) & 0x7fffffff) % 1e6).padStart(6, "0");
}

const today = new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10);
const owner = new Client();
const anon = new Client();
let r;

// ---------- R2: setup / login / 2FA / สิทธิ์ ----------
r = await anon.call("status");
if (!r.data.needsSetup) {
  console.error("ฐานข้อมูลไม่ว่าง — ใช้ npm run smoke:isolated เพื่อทดสอบกับฐานข้อมูลชั่วคราว");
  process.exit(2);
}
check("ยังไม่ login เรียก admin → 401", (await anon.call("admin/dashboard")).status === 401);
check("รหัสผ่านสั้น → 400", (await anon.call("setup", { displayName: "x", username: "boss", password: "123" })).status === 400);
r = await owner.call("setup", { displayName: "เจ้าของ", username: "Boss", password: "owner-pass-1" });
check("setup เจ้าของ", r.status === 200);
check("setup ซ้ำ → 403", (await anon.call("setup", { displayName: "x", username: "hack", password: "12345678" })).status === 403);
check("ยังไม่ตั้ง 2FA → admin ถูกกัน 403", (await owner.call("admin/dashboard")).status === 403);
r = await owner.call("auth/2fa/begin", {});
const ownerSecret = r.data.secret;
check("2FA begin ได้ secret + QR", Boolean(ownerSecret) && r.data.qr?.startsWith("data:image/png"));
check("2FA รหัสผิด → 400", (await owner.call("auth/2fa/enable", { code: "000000" })).status === 400);
check("2FA enable", (await owner.call("auth/2fa/enable", { code: totp(ownerSecret) })).status === 200);
check("ตั้ง 2FA แล้วเข้า dashboard ได้", (await owner.call("admin/dashboard")).status === 200);
await owner.call("auth/logout", {});
check("logout แล้ว → 401", (await owner.call("admin/dashboard")).status === 401);
check("login รหัสผิด → 401", (await owner.call("auth/login", { username: "boss", password: "wrong-pass" })).status === 401);
r = await owner.call("auth/login", { username: "BOSS", password: "owner-pass-1" });
check("login ไม่มีรหัส 2FA → ขอรหัส ไม่ให้ session", r.data.needsCode === true && (await owner.call("admin/dashboard")).status === 401);
check("login รหัส 2FA ผิด → 401", (await owner.call("auth/login", { username: "boss", password: "owner-pass-1", code: "123456" })).status === 401);
r = await owner.call("auth/login", { username: "boss", password: "owner-pass-1", code: totp(ownerSecret) });
check("login + 2FA", r.status === 200 && r.data.role === "owner");
check("CSRF: Origin โดเมนอื่น → 403", (await owner.call("admin/courses", { name: "x" }, "POST", { origin: "https://evil.example" })).status === 403);

// ครู
r = await owner.call("admin/users", { displayName: "ครูเอ", username: "kru-a", role: "teacher" });
const teacher = new Client();
check("สร้างครู", r.status === 200 && Boolean(r.data.tempPassword));
await teacher.call("auth/login", { username: "kru-a", password: r.data.tempPassword });
check("ครูยังไม่ตั้ง 2FA → 403", (await teacher.call("admin/students")).status === 403);
r = await teacher.call("auth/2fa/begin", {});
await teacher.call("auth/2fa/enable", { code: totp(r.data.secret) });
check("ครูตั้ง 2FA แล้วใช้งานได้", (await teacher.call("admin/students")).status === 200);
check("ครูจัดการผู้ใช้ไม่ได้ → 403", (await teacher.call("admin/users")).status === 403);
check("ครูสร้างคอร์สไม่ได้ → 403", (await teacher.call("admin/courses", { name: "x" })).status === 403);

// ---------- R3: คอร์ส + สมัครเรียน ----------
r = await owner.call("admin/courses", { name: "คณิต ป.2 เสาร์", subject: "math", grades: [2], pricePerTerm: 3500, weekday: 6, startTime: "09:00", endTime: "10:30", capacity: 10 });
const courseId = r.data.course?.id;
check("สร้างคอร์ส", Boolean(courseId));
r = await anon.call("public/courses");
check("ฟอร์มสาธารณะเห็นคอร์ส", r.data.courses?.length === 1);
const application = { parentName: "แม่มะลิ", phone: "081-234-5678", studentFullName: "ด.ญ.ทดสอบ ระบบ", nickname: "มายด์", grade: 2, courseIds: [courseId] };
check("สมัครโดยไม่ยินยอม PDPA → 400", (await anon.call("public/enroll", application)).status === 400);
check("สมัครเรียน", (await anon.call("public/enroll", { ...application, pdpaConsent: true })).status === 200);
r = await teacher.call("admin/applications");
const appId = r.data.applications?.[0]?.id;
r = await teacher.call(`admin/applications/${appId}/approve`, {});
const creds = r.data;
check("อนุมัติใบสมัคร ได้รหัสนักเรียน/PIN/รหัสผ่านผู้ปกครอง", /^BUK\d{4}$/.test(creds.studentCode) && /^\d{4}$/.test(creds.pin) && Boolean(creds.tempPassword));
check("อนุมัติซ้ำ → 400", (await teacher.call(`admin/applications/${appId}/approve`, {})).status === 400);
r = await teacher.call("admin/students");
const student = r.data.students[0];
check("นักเรียนลงคอร์สแล้ว และ API ไม่ส่ง pinHash", student.courseIds.includes(courseId) && !("pinHash" in student));

// ---------- R7: แบบฝึกหัด ----------
const questions = [
  { prompt: "1 + 1 = ?", choices: ["1", "2", "3", "4"], answerIndex: 1, explain: "หนึ่งกับหนึ่งรวมเป็นสอง" },
  { prompt: "2 + 3 = ?", choices: ["5", "6"], answerIndex: 0 },
  { prompt: "4 + 4 = ?", choices: ["6", "7", "8"], answerIndex: 2 },
];
r = await teacher.call("admin/exercises", { title: "บวกเลข", subject: "math", grade: 2, topic: "การบวก", questions, published: true });
const exerciseId = r.data.exercise?.id;
check("สร้างแบบฝึกหัด", Boolean(exerciseId));
check("ตัวเลือกเว้นว่างตรงกลาง → 400", (await teacher.call("admin/exercises", { title: "x", subject: "math", grade: 2, topic: "t", questions: [{ prompt: "p", choices: ["a", "", "c"], answerIndex: 2 }] })).status === 400);
await teacher.call("admin/exercises", { title: "ของ ป.5", subject: "math", grade: 5, topic: "เศษส่วน", questions, published: true });
await teacher.call("admin/exercises", { title: "ยังร่าง", subject: "math", grade: 2, topic: "การลบ", questions, published: false });

const kid = new Client();
check("นักเรียน PIN ผิด → 401", (await kid.call("auth/student", { code: creds.studentCode, pin: creds.pin === "0000" ? "1111" : "0000" })).status === 401);
check("นักเรียน login", (await kid.call("auth/student", { code: creds.studentCode.toLowerCase(), pin: creds.pin })).status === 200);
check("นักเรียนเรียก admin → 403", (await kid.call("admin/students")).status === 403);
check("นักเรียนเรียก AI → 403", (await kid.call("admin/ai/ask", { question: "hi" })).status === 403);
r = await kid.call("play/home");
check("เห็นเฉพาะชุดที่เผยแพร่ของชั้นตัวเอง", r.data.exercises?.length === 1 && r.data.exercises[0].id === exerciseId);

async function playRun(answers) {
  const start = await kid.call("play/start", { exerciseId });
  const results = [];
  for (let i = 0; i < answers.length; i++) results.push((await kid.call("play/answer", { attemptId: start.data.attemptId, index: i, choice: answers[i] })).data);
  return { start, results, attemptId: start.data.attemptId };
}

let run = await playRun([1, 0, 2]);
check("โจทย์ที่ส่งให้นักเรียนไม่มีเฉลย", !JSON.stringify(run.start.data).includes("answerIndex"));
check("ตอบแล้วได้เฉลย + คำอธิบาย", run.results[0].correct === true && run.results[0].explain?.includes("สอง"));
check("ตอบซ้ำข้อเดิม → 400", (await kid.call("play/answer", { attemptId: run.attemptId, index: 0, choice: 0 })).status === 400);
r = await kid.call("play/finish", { attemptId: run.attemptId });
check("จบชุด: 3/3 ได้ 50 XP, 20 เหรียญ, เลเวลอัป", r.data.correct === 3 && r.data.xpEarned === 50 && r.data.coinsEarned === 20 && r.data.leveledUp === true, JSON.stringify(r.data));
check("ปลดล็อก achievement 2 อัน + ไอเทม 3 ชิ้น", r.data.newAchievements?.length === 2 && r.data.newItems?.length === 3, JSON.stringify(r.data));
check("กดจบซ้ำ → 400 (ไม่ได้คะแนนสองรอบ)", (await kid.call("play/finish", { attemptId: run.attemptId })).status === 400);
check("ใส่ไอเทมที่มี", (await kid.call("play/equip", { slot: "hat", itemId: "hat_cap" })).status === 200);
check("ใส่ไอเทมที่ยังไม่ปลดล็อก → 400", (await kid.call("play/equip", { slot: "pet", itemId: "pet_dragon" })).status === 400);

run = await playRun([0, 0, 0]);
r = await kid.call("play/finish", { attemptId: run.attemptId });
check("ตอบถูก 1/3 ได้ 10 XP, 5 เหรียญ", r.data.correct === 1 && r.data.xpEarned === 10 && r.data.coinsEarned === 5, JSON.stringify(r.data));

// ---------- R8: ของรางวัล + งบ ----------
r = await teacher.call("admin/rewards", { name: "ชุดเครื่องเขียน", costCoins: 5, costBaht: 2000, stock: 3 });
const rewardId = r.data.reward?.id;
r = await kid.call("play/rewards");
check("ร้านแลกของไม่บอกต้นทุนบาท", r.data.rewards?.length === 1 && !("costBaht" in r.data.rewards[0]) && r.data.coins === 25, JSON.stringify(r.data));
await kid.call("play/redeem", { rewardId });
r = await kid.call("play/redeem", { rewardId });
check("แลก 2 ชิ้น หักเหรียญถูก", r.data.coins === 15, JSON.stringify(r.data));
await teacher.call("admin/rewards", { name: "ของแพง", costCoins: 9999, costBaht: 10, stock: 1 });
const pricey = (await kid.call("play/rewards")).data.rewards.find((x) => x.costCoins === 9999);
check("เหรียญไม่พอ → 400 และคืนสต็อก", (await kid.call("play/redeem", { rewardId: pricey.id })).status === 400 && (await kid.call("play/rewards")).data.rewards.find((x) => x.id === pricey.id).stock === 1);
r = await teacher.call("admin/redemptions");
const [red1, red2] = r.data.redemptions;
check("ส่งมอบชิ้นแรก (2,000 บาท)", (await teacher.call(`admin/redemptions/${red1.id}/handover`, {})).status === 200);
r = await teacher.call(`admin/redemptions/${red2.id}/handover`, {});
check("ส่งมอบชิ้นที่สองเกินงบ 3,000 → 400", r.status === 400, JSON.stringify(r.data));
check("ปฏิเสธ → คืนเหรียญ", (await teacher.call(`admin/redemptions/${red2.id}/reject`, {})).status === 200 && (await kid.call("play/rewards")).data.coins === 20);

// ---------- R4: เช็กชื่อ ----------
r = await teacher.call(`admin/attendance?courseId=${courseId}&date=${today}`);
check("รายชื่อเช็กชื่อมีนักเรียน", r.data.rows?.length === 1 && r.data.rows[0].status === null);
r = await teacher.call("admin/attendance", { courseId, date: today, marks: [{ studentId: student.id, status: "present" }] });
check("บันทึกเช็กชื่อ", r.data.changed === 1);
r = await teacher.call("admin/attendance", { courseId, date: today, marks: [{ studentId: student.id, status: "present" }] });
check("บันทึกซ้ำสถานะเดิม ไม่แจ้งซ้ำ", r.data.changed === 0);

// ---------- R5: ค่าเรียน + ผู้ปกครอง ----------
const parent = new Client();
check("ผู้ปกครอง login", (await parent.call("auth/login", { username: "0812345678", password: creds.tempPassword })).data.role === "parent");
check("ผู้ปกครองเรียก admin → 403", (await parent.call("admin/invoices")).status === 403);
r = await parent.call("parent/overview");
const child = r.data.children?.[0];
const invoice = child?.invoices?.[0];
check("ผู้ปกครองเห็นลูก + ใบแจ้ง 3,500 + เช็กชื่อวันนี้ + ผลฝึก", child?.code === creds.studentCode && invoice?.amount === 3500 && child.today[0]?.status === "present" && child.summary.exercisesDone === 2, JSON.stringify(child));
check("สลิปที่ไม่ใช่รูป → 400", (await parent.call(`parent/invoices/${invoice.id}/slip`, { dataUrl: "data:text/html;base64,PGI+" })).status === 400);
check("แนบสลิป", (await parent.call(`parent/invoices/${invoice.id}/slip`, { dataUrl: "data:image/jpeg;base64,/9j/4AAQ" })).status === 200);
check("ครูดูสลิปได้", (await teacher.call(`slips/${invoice.id}`)).data.dataUrl?.startsWith("data:image/jpeg"));
check("นักเรียนดูสลิปไม่ได้ → 403", (await kid.call(`slips/${invoice.id}`)).status === 403);
check("ยืนยันรับเงิน", (await teacher.call(`admin/invoices/${invoice.id}/pay`, {})).status === 200);
check("ยืนยันซ้ำ → 400", (await teacher.call(`admin/invoices/${invoice.id}/pay`, {})).status === 400);
check("ผู้ปกครองเปลี่ยนรหัสผ่าน", (await parent.call("auth/password", { current: creds.tempPassword, next: "parent-new-pass" })).status === 200);

// ---------- R6: แจ้งเตือน ----------
check("ผู้ปกครองขอรหัสผูก LINE", /^\d{6}$/.test((await parent.call("parent/line-code", {})).data.code));
check("webhook ยังไม่ตั้งค่า LINE → 503", (await anon.call("line/webhook", { events: [] })).status === 503);
check("cron ไม่มี secret → 401", (await anon.call("cron/weekly")).status === 401);
check("ส่งสรุปรายสัปดาห์", (await teacher.call("admin/notify/weekly", {})).data.sent === 1);
r = await teacher.call("admin/notifications");
const kinds = new Set(r.data.notifications.map((n) => n.kind));
check("มีแจ้งเตือน invoice/attendance/payment/weekly ค้างส่ง (ยังไม่ตั้ง LINE)", ["invoice", "attendance", "payment", "weekly"].every((k) => kinds.has(k)) && r.data.notifications.every((n) => n.status === "queued"), [...kinds].join(","));

// ---------- R10: รายงาน ----------
r = await owner.call("admin/reports", { dataset: "royalty", from: `${today.slice(0, 8)}01`, to: today });
check("รายงาน royalty: รับ 3,500 → 805", r.data.rows?.[0]?.amount === 3500 && r.data.rows[0].royalty === 805, JSON.stringify(r.data.rows));
check("ครูดูรายงาน royalty ไม่ได้ → 403", (await teacher.call("admin/reports", { dataset: "royalty", from: today, to: today })).status === 403);
r = await teacher.call("admin/reports", { dataset: "attempts", from: today, to: today });
check("รายงานผลแบบฝึกหัด 2 แถว", r.data.rows?.length === 2 && r.data.columns?.length > 5);
check("รายงานทะเบียนนักเรียน", (await teacher.call("admin/reports", { dataset: "students" })).data.rows?.[0]?.phone === "0812345678");

// ---------- R11: AI (ยังไม่ตั้ง key) ----------
check("AI ยังไม่ตั้งค่า → status false, ask 503", (await teacher.call("admin/ai/status")).data.configured === false && (await teacher.call("admin/ai/ask", { question: "ใครค้างค่าเรียน" })).status === 503);

// ---------- ลิมิตรายวัน 100 ข้อ ----------
let last;
for (let i = 0; i < 32; i++) {
  run = await playRun([1, 0, 2]);
  last = (await kid.call("play/finish", { attemptId: run.attemptId })).data;
}
check("ทำครบ 102 ข้อ รอบสุดท้ายก่อนถึงเพดานยังนับ", last.counted === true, JSON.stringify(last));
const before = (await kid.call("play/home")).data;
check("ถึงลิมิตรายวันแล้ว", before.limitReached === true && before.todayQuestions === 102, String(before.todayQuestions));
run = await playRun([1, 0, 2]);
last = (await kid.call("play/finish", { attemptId: run.attemptId })).data;
const after = (await kid.call("play/home")).data;
check("เกินลิมิต: เล่นได้แต่ไม่ได้ XP/เหรียญ", last.counted === false && last.xpEarned === 0 && after.profile.xp === before.profile.xp && after.profile.coins === before.profile.coins, JSON.stringify(last));

// ---------- R13: ตั้งค่า ----------
check("ครูแก้ตั้งค่าไม่ได้ → 403", (await teacher.call("admin/settings", { dailyLimitQuestions: 5 }, "PATCH")).status === 403);
r = await owner.call("admin/settings", { dailyLimitQuestions: 200, dailyLimitMinutes: 180, rewardBudgetBaht: 5000, royaltyPercent: 20 }, "PATCH");
check("เจ้าของแก้ตั้งค่า", r.data.settings?.dailyLimitQuestions === 200);
check("เพิ่มลิมิตเป็น 200 → เด็กกลับมาได้คะแนน", (await kid.call("play/home")).data.limitReached === false);
check("งบใหม่ 5,000 มีผลกับหน้าของรางวัล", (await teacher.call("admin/redemptions")).data.budget === 5000);
r = await owner.call("admin/reports", { dataset: "royalty", from: `${today.slice(0, 8)}01`, to: today });
check("royalty ใช้อัตราใหม่ 20% → 700", r.data.rows?.[0]?.royalty === 700, JSON.stringify(r.data.rows));

// ---------- R46: รายจ่าย + กำไรขาดทุน (royaltyPercent = 20 จากขั้นก่อน, รายรับเดือนนี้ 3,500) ----------
r = await teacher.call("admin/expenses", { date: today, category: "rent", detail: "ค่าเช่าเดือนนี้", amount: 12000, method: "transfer", recurring: true });
check("บันทึกค่าเช่า 12,000 เป็นรายจ่ายดำเนินงาน", r.data.expense?.amount === 12000 && r.data.expense?.kind === "operating", JSON.stringify(r.data));
const rentId = r.data.expense?.id;
r = await teacher.call("admin/expenses", { date: today, category: "office", detail: "กระดาษ A4", qty: 5, unitPrice: 120, method: "cash" });
check("ของใช้เบ็ดเตล็ด 5 × 120 → 600", r.data.expense?.amount === 600 && r.data.expense?.kind === "supply", JSON.stringify(r.data));
const paperId = r.data.expense?.id;
check("ไม่ใส่จำนวนเงิน → 400", (await teacher.call("admin/expenses", { date: today, category: "rent", detail: "ลืมใส่เงิน", method: "cash" })).status === 400);
check("หมวดที่ไม่มีจริง → 400", (await teacher.call("admin/expenses", { date: today, category: "ไม่มีหมวดนี้", detail: "x", amount: 10, method: "cash" })).status === 400);
check("เดือนผิดรูปแบบ → 400", (await teacher.call("admin/expenses?month=2026-13")).status === 400);
r = await teacher.call("admin/expenses");
check("สรุปเดือนนี้: รับ 3,500 − จ่าย 12,600 − royalty 700 = ขาดทุน 9,800", r.data.summary?.revenue === 3500 && r.data.summary?.expense === 12600 && r.data.summary?.royaltyDue === 700 && r.data.summary?.profit === -9800, JSON.stringify(r.data.summary));
await teacher.call("admin/expenses", { date: today, category: "royalty", detail: "RF เดือนนี้", amount: 700, method: "transfer" });
r = await teacher.call("admin/expenses");
check("บันทึกจ่าย royalty แล้วไม่หักซ้ำ (ขาดทุนเท่าเดิม)", r.data.summary?.royaltyPaid === 700 && r.data.summary?.profit === -9800, JSON.stringify(r.data.summary));
const png = "data:image/png;base64,iVBORw0KGgo=";
check("แนบรูปใบเสร็จ", (await teacher.call(`admin/expenses/${paperId}/receipt`, { dataUrl: png })).status === 200);
check("ไฟล์ที่ไม่ใช่รูป → 400", (await teacher.call(`admin/expenses/${paperId}/receipt`, { dataUrl: "data:text/html;base64,PGI+eDwvYj4=" })).status === 400);
check("อ่านรูปใบเสร็จได้ และรายการขึ้นว่ามีใบเสร็จ", (await teacher.call(`admin/expenses/${paperId}/receipt`)).data.dataUrl === png && (await teacher.call("admin/expenses")).data.expenses.find((e) => e.id === paperId)?.hasReceipt === true);
check("ครูลบรายจ่ายไม่ได้ → 403", (await teacher.call(`admin/expenses/${rentId}`, {}, "DELETE")).status === 403);
check("เจ้าของลบรายจ่ายได้", (await owner.call(`admin/expenses/${rentId}`, {}, "DELETE")).status === 200);
r = await owner.call("admin/expenses");
check("ลบค่าเช่าแล้ว: จ่าย 1,300 กำไร 2,200", r.data.summary?.expense === 1300 && r.data.summary?.profit === 2200, JSON.stringify(r.data.summary));
check("แดชบอร์ดแสดงกำไรเดือนนี้", (await owner.call("admin/dashboard")).data.finance?.profit === 2200);
r = await owner.call("admin/reports", { dataset: "pl", from: `${today.slice(0, 8)}01`, to: today });
check("รายงานกำไร–ขาดทุนรายเดือน", r.data.rows?.[0]?.revenue === 3500 && r.data.rows?.[0]?.profit === 2200 && r.data.rows?.[0]?.supply === 600, JSON.stringify(r.data.rows));
check("ครูดูรายงานกำไรไม่ได้ → 403", (await teacher.call("admin/reports", { dataset: "pl", from: today, to: today })).status === 403);
r = await owner.call("admin/reports", { dataset: "expenses", from: `${today.slice(0, 8)}01`, to: today });
check("รายงานรายจ่าย 2 แถว พร้อมคอลัมน์ใบเสร็จ", r.data.rows?.length === 2 && r.data.rows.some((x) => x.receipt === "มี"), JSON.stringify(r.data.rows));

// ---------- I1: ชั่วโมงสอน + ค่าจ้างครู (คอร์ส 09:00-10:30 = 1.5 ชม. เช็กชื่อแล้ว 1 คาบ) ----------
const kruId = (await owner.call("admin/users")).data.users.find((u) => u.username === "kru-a").id;
check("ครูตั้งอัตราค่าสอนเองไม่ได้ → 403", (await teacher.call(`admin/users/${kruId}/rate`, { hourlyRate: 999 }, "PATCH")).status === 403);
check("ครูดูค่าจ้างไม่ได้ → 403", (await teacher.call("admin/payroll")).status === 403);
r = await owner.call("admin/payroll");
check("ยังไม่ตั้งอัตรา: นับชั่วโมงได้แต่ค่าจ้าง 0", r.data.teachers?.[0]?.hours === 1.5 && r.data.teachers?.[0]?.sessions === 1 && r.data.teachers?.[0]?.amount === 0, JSON.stringify(r.data.teachers));
check("ยังไม่ตั้งอัตรา กดบันทึกจ่ายไม่ได้ → 400", (await owner.call("admin/payroll", { teacherId: kruId, month: today.slice(0, 7) })).status === 400);
check("ตั้งอัตรา 400 บาท/ชม.", (await owner.call(`admin/users/${kruId}/rate`, { hourlyRate: 400 }, "PATCH")).data.user?.hourlyRate === 400);
check("อัตราติดลบ → 400", (await owner.call(`admin/users/${kruId}/rate`, { hourlyRate: -5 }, "PATCH")).status === 400);
r = await owner.call("admin/payroll");
const kruPay = r.data.teachers?.find((t) => t.teacherId === kruId);
check("ค่าจ้าง 1.5 ชม. × 400 = 600", kruPay?.amount === 600 && kruPay?.paid === false && kruPay?.detail?.length === 1, JSON.stringify(kruPay));
check("เดือนที่ไม่มีคาบสอน → ไม่มีรายชื่อ", (await owner.call("admin/payroll?month=2020-01")).data.teachers?.length === 0);
check("เดือนผิดรูปแบบ → 400", (await owner.call("admin/payroll?month=ไม่ใช่เดือน")).status === 400);
r = await owner.call("admin/payroll", { teacherId: kruId, month: today.slice(0, 7) });
check("บันทึกจ่ายเป็นรายจ่ายหมวดค่าจ้างครู", r.data.expense?.category === "teacher" && r.data.expense?.amount === 600 && r.data.expense?.kind === "operating", JSON.stringify(r.data.expense));
check("กดบันทึกจ่ายซ้ำ → 400 (ไม่เกิดรายการซ้ำ)", (await owner.call("admin/payroll", { teacherId: kruId, month: today.slice(0, 7) })).status === 400);
r = await owner.call("admin/payroll");
check("สถานะเปลี่ยนเป็นจ่ายแล้ว", r.data.teachers?.find((t) => t.teacherId === kruId)?.paid === true && r.data.totalAmount === 600);
r = await owner.call("admin/expenses");
check("ค่าจ้างไปรวมในรายจ่าย: 1,300 + 600 = 1,900 กำไรเหลือ 1,600", r.data.summary?.expense === 1900 && r.data.summary?.profit === 1600, JSON.stringify(r.data.summary));
check("ครูเห็นรายชื่อครูได้ (ไว้ผูกคอร์ส) แต่ไม่เห็นอัตรา", (await teacher.call("admin/teachers")).data.teachers?.every((t) => t.hourlyRate === undefined) === true);

// ---------- I2: ตารางสอน ----------
r = await teacher.call("admin/timetable");
check("ตารางสอน: คอร์สเดียว เสาร์ 09:00-10:30 มีนักเรียน 1 คน", r.data.courses?.length === 1 && r.data.courses[0].weekday === 6 && r.data.courses[0].enrolled === 1 && r.data.conflicts?.length === 0, JSON.stringify(r.data.courses));
check("คอร์สที่ยังไม่ผูกครู ขึ้นเตือน", r.data.withoutTeacher?.length === 1);
await owner.call("admin/courses", { name: "อังกฤษ ป.2 เสาร์ (ชนเวลา)", subject: "english", grades: [2], pricePerTerm: 3000, weekday: 6, startTime: "10:00", endTime: "11:00", capacity: 10, room: "ห้อง 1", teacherId: kruId });
await owner.call(`admin/courses/${courseId}`, { name: "คณิต ป.2 เสาร์", subject: "math", grades: [2], pricePerTerm: 3500, weekday: 6, startTime: "09:00", endTime: "10:30", capacity: 10, room: "ห้อง 1", teacherId: kruId, active: true }, "PATCH");
r = await teacher.call("admin/timetable");
check("จัดครูคนเดียวสอนสองคอร์สเวลาชน → เตือนทั้งครูและห้อง", r.data.conflicts?.length === 2 && r.data.conflicts.some((c) => c.kind === "teacher") && r.data.conflicts.some((c) => c.kind === "room"), JSON.stringify(r.data.conflicts));
// คาบนี้เริ่ม 11:00 พอดีตอนคอร์สอังกฤษเลิก — ต่อกันสนิท ไม่ควรนับว่าชน
await owner.call("admin/courses", { name: "ไทย ป.2 เสาร์ (ต่อคาบพอดี)", subject: "thai", grades: [2], pricePerTerm: 3000, weekday: 6, startTime: "11:00", endTime: "12:00", capacity: 10, room: "ห้อง 1", teacherId: kruId });
r = await teacher.call("admin/timetable");
check("คาบต่อกันพอดี ไม่นับว่าชน (ยังเท่าเดิม 2 จุด)", r.data.conflicts?.length === 2, JSON.stringify(r.data.conflicts?.map((c) => c.detail)));

// ---------- I3: คะแนนก่อน-หลังเรียน ----------
check("คะแนนเกินคะแนนเต็ม → 400", (await teacher.call("admin/assessments", { studentId: student.id, courseId, subject: "math", kind: "pre", date: today, score: 30, maxScore: 20 })).status === 400);
check("นักเรียนไม่มีจริง → 404", (await teacher.call("admin/assessments", { studentId: "ไม่มีคนนี้", courseId, subject: "math", kind: "pre", date: today, score: 5, maxScore: 20 })).status === 404);
r = await teacher.call("admin/assessments", { studentId: student.id, courseId, subject: "math", kind: "pre", date: today, score: 9, maxScore: 20, note: "ยังไม่คล่องการคูณ" });
const preId = r.data.assessment?.id;
check("ครูบันทึกคะแนนก่อนเรียนได้", r.status === 200 && r.data.assessment?.kind === "pre");
await teacher.call("admin/assessments", { studentId: student.id, courseId, subject: "math", kind: "post", date: today, score: 40, maxScore: 50 });
r = await teacher.call(`admin/assessments?courseId=${courseId}`);
const row = r.data.rows?.find((x) => x.studentId === student.id);
check("9/20 → 40/50 = 45% → 80% (+35 จุด)", row?.prePercent === 45 && row?.postPercent === 80 && row?.gain === 35, JSON.stringify(row && { pre: row.prePercent, post: row.postPercent, gain: row.gain }));
check("สรุปทั้งคอร์ส: วัดครบ 1 คน ดีขึ้น 1 คน", r.data.summary?.counted === 1 && r.data.summary?.improved === 1 && r.data.summary?.average === 35);
check("ผู้ปกครองเห็นพัฒนาการของลูก", (await parent.call("parent/overview")).data.children?.[0]?.progress?.some((p) => p.gain === 35) === true);
check("ครูลบคะแนนไม่ได้ → 403", (await teacher.call(`admin/assessments/${preId}`, {}, "DELETE")).status === 403);
r = await teacher.call(`admin/assessments/${preId}`, { score: 11, maxScore: 20, subject: "math", kind: "pre", date: today }, "PATCH");
check("แก้คะแนนแล้วพัฒนาการคิดใหม่", r.data.assessment?.score === 11 && (await teacher.call(`admin/assessments?courseId=${courseId}`)).data.rows.find((x) => x.studentId === student.id)?.gain === 25);
check("เจ้าของลบคะแนนได้", (await owner.call(`admin/assessments/${preId}`, {}, "DELETE")).status === 200);
check("ลบใบก่อนเรียนแล้ว สรุปพัฒนาการไม่ได้", (await owner.call(`admin/assessments?courseId=${courseId}`)).data.rows.find((x) => x.studentId === student.id)?.gain === null);

// ---------- R14: ชุดโจทย์เริ่มต้น ----------
check("ครูนำเข้าชุดเริ่มต้นไม่ได้ → 403", (await teacher.call("admin/exercises/seed", {})).status === 403);
r = await owner.call("admin/exercises/seed", {});
// ตัวเลขนี้ต้องแก้ตามจำนวนชุดใน seed-exercises.ts ทุกครั้งที่เติมคลัง (ดู npm run audit:exercises)
check("นำเข้าชุดโจทย์เริ่มต้น 67 ชุด", r.data.added === 67, String(r.data.added));
check("นำเข้าซ้ำ → 0 ชุด", (await owner.call("admin/exercises/seed", {})).data.added === 0);
const all = (await owner.call("admin/exercises")).data.exercises;
const seeded = all.filter((e) => !["บวกเลข", "ของ ป.5", "ยังร่าง"].includes(e.title));
const badShape = seeded.flatMap((e) => e.questions.filter((q) => q.choices.length !== 4 || new Set(q.choices).size !== 4 || !(q.answerIndex >= 0 && q.answerIndex < 4)).map((q) => `${e.title}: ${q.prompt}`));
check("ทุกข้อมี 4 ตัวเลือกไม่ซ้ำ และมีคำตอบ", badShape.length === 0, badShape.slice(0, 3).join(" | "));
check("ชุดเริ่มต้นเป็นร่างทั้งหมด และคณิตมีชุดละ 10 ข้อ", seeded.every((e) => !e.published) && seeded.filter((e) => e.subject === "math").every((e) => e.questions.length === 10));
// ตรวจคำตอบเลขคณิตพื้นฐานซ้ำด้วยการคำนวณอิสระ
let arithmetic = 0;
const wrongMath = [];
for (const e of seeded.filter((x) => x.subject === "math")) {
  for (const q of e.questions) {
    const m = q.prompt.replace(/,/g, "").match(/^([\d.]+) ([+−×÷]) ([\d.]+) = \?$/);
    if (!m) continue;
    const [a, b] = [Number(m[1]), Number(m[3])];
    const expected = { "+": a + b, "−": a - b, "×": a * b, "÷": a / b }[m[2]];
    arithmetic++;
    if (Math.abs(Number(q.choices[q.answerIndex].replace(/,/g, "")) - expected) > 1e-9) wrongMath.push(`${q.prompt} → ${q.choices[q.answerIndex]}`);
  }
}
check(`เฉลยเลขคณิต ${arithmetic} ข้อ ตรงกับที่คำนวณเอง`, arithmetic > 150 && wrongMath.length === 0, wrongMath.slice(0, 3).join(" | "));

// ---------- R16: ผู้สนใจ / ชดเชย / การบ้าน ----------
check("ขอทดลองเรียนโดยไม่ยินยอม → 400", (await anon.call("public/trial", { parentName: "ก", phone: "0811111111", childNickname: "ข", grade: 3 })).status === 400);
check("ขอทดลองเรียน", (await anon.call("public/trial", { parentName: "คุณสนใจ", phone: "0811111111", childNickname: "ต้นกล้า", grade: 3, source: "Facebook", consent: true })).status === 200);
check("คนนอกดูรายชื่อผู้สนใจไม่ได้ → 401", (await anon.call("admin/leads")).status === 401);
r = await teacher.call("admin/leads");
const lead = r.data.leads?.[0];
check("ครูเห็นผู้สนใจ", lead?.childNickname === "ต้นกล้า" && r.data.funnel.total === 1);
await teacher.call(`admin/leads/${lead.id}`, { status: "booked", trialDate: today, note: "นัดเสาร์นี้" }, "PATCH");
r = await teacher.call("admin/leads");
check("อัปเดตสถานะ + กรวยการขาย", r.data.leads[0].status === "booked" && r.data.funnel.booked === 1 && r.data.funnel.enrolled === 0);
check("ลบข้อมูลผู้สนใจ", (await teacher.call(`admin/leads/${lead.id}`, {}, "DELETE")).status === 200 && (await teacher.call("admin/leads")).data.leads.length === 0);

const yesterday = new Date(Date.parse(today) - 86_400_000).toISOString().slice(0, 10);
await teacher.call("admin/attendance", { courseId, date: yesterday, marks: [{ studentId: student.id, status: "absent" }] });
r = await teacher.call("admin/makeups");
check("คาบที่ขาดขึ้นในรายการรอชดเชย", r.data.missed?.length === 1 && r.data.missed[0].date === yesterday);
check("นัดชดเชย", (await teacher.call("admin/makeups", { attendanceId: r.data.missed[0].attendanceId, makeupDate: today })).status === 200);
r = await teacher.call("admin/makeups");
check("นัดแล้วหายจากรายการรอ", r.data.missed.length === 0 && r.data.makeups[0].status === "planned");
await teacher.call(`admin/makeups/${r.data.makeups[0].id}`, { status: "done" }, "PATCH");
check("บันทึกมาเรียนชดเชยแล้ว", (await teacher.call("admin/makeups")).data.makeups[0].status === "done");

const draft = all.find((e) => e.title === "ยังร่าง");
const grade5 = all.find((e) => e.title === "ของ ป.5");
check("สั่งการบ้านด้วยชุดที่ยังไม่เผยแพร่ → 400", (await teacher.call("admin/assignments", { courseId, exerciseId: draft.id, dueDate: today })).status === 400);
check("สั่งการบ้านผิดชั้น → 400", (await teacher.call("admin/assignments", { courseId, exerciseId: grade5.id, dueDate: today })).status === 400);
check("สั่งการบ้าน", (await teacher.call("admin/assignments", { courseId, exerciseId, dueDate: today })).status === 200);
r = await kid.call("play/home");
check("นักเรียนเห็นป้ายการบ้าน", r.data.exercises.find((e) => e.id === exerciseId)?.homeworkDue === today);
r = await teacher.call("admin/assignments");
check("ครูเห็นว่ายังไม่มีใครทำ", r.data.assignments[0].doneCount === 0 && r.data.assignments[0].notDone[0] === "มายด์");
run = await playRun([1, 0, 2]);
await kid.call("play/finish", { attemptId: run.attemptId });
r = await teacher.call("admin/assignments");
check("ทำแล้ว → ครูเห็น 1/1 และป้ายการบ้านหาย", r.data.assignments[0].doneCount === 1 && (await kid.call("play/home")).data.exercises.find((e) => e.id === exerciseId).homeworkDue === null);

// ---------- R15: เข้าด้วย LINE (ยังไม่ตั้งค่า) ----------
check("LIFF ยังไม่ตั้งค่า → config null, auth 503", (await anon.call("public/config")).data.liffId === null && (await anon.call("auth/line", { idToken: "x" })).status === 503);

// ---------- R34–R45: student experience and scoring ----------
for (const badQuestions of [ [null], [{ prompt: "bad index", choices: ["a", "b"], answerIndex: 0.5 }] ]) {
  check("Malformed exercise rejected", (await teacher.call("admin/exercises", { title: "bad", subject: "math", grade: 2, topic: "test", questions: badQuestions, published: true })).status === 400);
}
const partialRun = (await kid.call("play/start", { exerciseId })).data;
const beforeIncomplete = (await kid.call("play/home")).data.profile;
check("Cannot finish unanswered exercise", (await kid.call("play/finish", { attemptId: partialRun.attemptId })).status === 400);
for (const answer of [{ index: 0.5, choice: 1 }, { index: 0, choice: 0.5 }, { index: 1, choice: 3 }]) {
  check("Invalid choice rejected: " + JSON.stringify(answer), (await kid.call("play/answer", { attemptId: partialRun.attemptId, ...answer })).status === 400);
}
check("Answer remains available after invalid request", (await kid.call("play/answer", { attemptId: partialRun.attemptId, index: 0, choice: 1 })).status === 200);
check("Cannot finish partially answered exercise", (await kid.call("play/finish", { attemptId: partialRun.attemptId })).status === 400);
const afterIncomplete = (await kid.call("play/home")).data;
check("Incomplete exercise does not award XP or coins", afterIncomplete.profile.xp === beforeIncomplete.xp && afterIncomplete.profile.coins === beforeIncomplete.coins);
check("Incomplete exercise not in recent results", !afterIncomplete.recentAttempts.some((attempt) => attempt.id === partialRun.attemptId));
const secondStudent = (await owner.call("admin/students", { nickname: "ทดสอบสอง", fullName: "ข้อมูลสมมติคนที่สอง", grade: 2, pdpaConsent: true })).data;
const secondKid = new Client();
await secondKid.call("auth/student", { code: secondStudent.student.code, pin: secondStudent.pin });
check("New student cannot see other student's recent results", (await secondKid.call("play/home")).data.recentAttempts.length === 0);
check("Other student cannot answer this attempt", (await secondKid.call("play/answer", { attemptId: partialRun.attemptId, index: 1, choice: 0 })).status === 400);
check("Other student cannot finish this attempt", (await secondKid.call("play/finish", { attemptId: partialRun.attemptId })).status === 404);
await kid.call("play/answer", { attemptId: partialRun.attemptId, index: 1, choice: 0 });
await kid.call("play/answer", { attemptId: partialRun.attemptId, index: 2, choice: 2 });
check("Can complete after rejected early finish", (await kid.call("play/finish", { attemptId: partialRun.attemptId })).data.correct === 3);
const recent = (await kid.call("play/home")).data.recentAttempts;
check("Recent results show latest score and are capped at 10", recent.length === 10 && recent[0].id === partialRun.attemptId && recent[0].correct === 3);
check("Recent results expose no answers or other student identifiers", recent.every((attempt) => !('answers' in attempt) && !('studentId' in attempt) && !('answerIndex' in attempt)));
const rewardView = (await kid.call("play/rewards")).data;
check("Reward history keeps name and status", rewardView.redemptions.length > 0 && Boolean(rewardView.redemptions[0].rewardName) && Boolean(rewardView.redemptions[0].status));
check("Neither reward list nor redemption history expose costs", !JSON.stringify(rewardView).includes("costBaht") && !JSON.stringify(rewardView).includes("handledBy"));

// ---------- R22–R33: regression checks ----------
for (const body of [null, [], 1, true, "text"]) {
  check("JSON body must be object: " + JSON.stringify(body), (await anon.call("auth/login", body)).status === 400);
}
check("Malformed cookie is ignored", (await anon.call("me", undefined, "GET", { cookie: "buk_session=%ZZ" })).status === 200);
for (const origin of ["null", "not-a-url", BASE.replace(/^http:/, "https:")]) {
  check("Reject invalid or cross-scheme origin: " + origin, (await anon.call("auth/logout", {}, "POST", { origin })).status === 403);
}
check("Accept same-origin request", (await anon.call("auth/logout", {}, "POST", { origin: new URL(BASE).origin })).status === 200);
for (const date of ["2026-02-29", "2026-04-31", "2026-13-01", "2026-00-10"]) {
  check("Reject invalid calendar date: " + date, (await teacher.call("admin/attendance?courseId=" + courseId + "&date=" + date)).status === 400);
}
check("Accept leap day", (await teacher.call("admin/attendance?courseId=" + courseId + "&date=2028-02-29")).status === 200);
const validCourse = { name: "Validation", subject: "math", grades: [2], pricePerTerm: 3500, weekday: 6, startTime: "09:00", endTime: "10:30", capacity: 10 };
for (const fields of [{ pricePerTerm: "" }, { pricePerTerm: "   " }, { startTime: "25:00" }, { startTime: "9:00" }, { endTime: "08:00" }, { endTime: "09:00" }, { weekday: 1.5 }, { capacity: 2.5 }]) {
  check("Reject invalid course: " + JSON.stringify(fields), (await owner.call("admin/courses", { ...validCourse, ...fields })).status === 400);
}
const beforeStudents = (await owner.call("admin/students")).data.students.length;
const allUsers = (await owner.call("admin/users")).data.users;
const parentIdForValidation = allUsers.find((u) => u.role === "parent").id;
await owner.call("admin/users/" + parentIdForValidation + "/active", { active: false });
for (const parentId of ["missing-parent", allUsers.find((u) => u.role === "teacher").id, parentIdForValidation]) {
  check("Reject invalid parent: " + parentId, (await owner.call("admin/students", { nickname: "test", fullName: "test student", grade: 2, pdpaConsent: true, parentId })).status === 400);
}
await owner.call("admin/users/" + parentIdForValidation + "/active", { active: true });
check("Invalid parent did not create a student", (await owner.call("admin/students")).data.students.length === beforeStudents);
const otherOwner = new Client();
await otherOwner.call("auth/login", { username: "boss", password: "owner-pass-1", code: totp(ownerSecret) });
const staleOwner = new Client();
staleOwner.cookie = owner.cookie;
check("Change password with spaces", (await owner.call("auth/password", { current: "owner-pass-1", next: "  owner-pass-2  " })).status === 200);
check("Password change rotates current session", owner.cookie !== staleOwner.cookie && (await owner.call("admin/dashboard")).status === 200);
check("Old current session revoked", (await staleOwner.call("admin/dashboard")).status === 401);
check("Other device session revoked", (await otherOwner.call("admin/dashboard")).status === 401);
check("Old password rejected", (await otherOwner.call("auth/login", { username: "boss", password: "owner-pass-1", code: totp(ownerSecret) })).status === 401);
check("Trimmed password rejected", (await otherOwner.call("auth/login", { username: "boss", password: "owner-pass-2", code: totp(ownerSecret) })).status === 401);
check("Exact password with spaces works", (await otherOwner.call("auth/login", { username: "boss", password: "  owner-pass-2  ", code: totp(ownerSecret) })).status === 200);
check("Change password accepts exact current password", (await owner.call("auth/password", { current: "  owner-pass-2  ", next: "owner-pass-3" })).status === 200);

// ---------- รีเซ็ต / ปิดบัญชี ----------
const teacherId = (await owner.call("admin/users")).data.users.find((u) => u.username === "kru-a").id;
await owner.call(`admin/users/${teacherId}/reset`, {});
check("รีเซ็ตครู → session เดิมใช้ไม่ได้", (await teacher.call("admin/students")).status === 401);
r = await owner.call(`admin/students/${student.id}/pin`, {});
check("PIN reset revokes existing student session", (await kid.call("play/home")).status === 401);
check("PIN ใหม่ใช้ได้ PIN เก่าใช้ไม่ได้", (await new Client().call("auth/student", { code: creds.studentCode, pin: r.data.pin })).status === 200 && (r.data.pin === creds.pin || (await new Client().call("auth/student", { code: creds.studentCode, pin: creds.pin })).status === 401));

console.log(`\n${passed} ผ่าน, ${failures.length} ไม่ผ่าน`);
if (failures.length) {
  console.log(failures.map((f) => ` - ${f}`).join("\n"));
  process.exit(1);
}
