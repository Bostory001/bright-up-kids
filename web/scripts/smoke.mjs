// ทดสอบ API ทั้งระบบแบบ end-to-end กับฐานข้อมูลเปล่า
// ใช้: ลบ .data/ → เปิด server (npm run dev) → npm run smoke   (ตั้ง BASE_URL ได้ ค่าเริ่มต้น http://localhost:3000)
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
  console.error("ฐานข้อมูลไม่ว่าง — ลบโฟลเดอร์ .data แล้วเปิด server ใหม่ก่อนรัน smoke test");
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

// ---------- รีเซ็ต / ปิดบัญชี ----------
const teacherId = (await owner.call("admin/users")).data.users.find((u) => u.username === "kru-a").id;
await owner.call(`admin/users/${teacherId}/reset`, {});
check("รีเซ็ตครู → session เดิมใช้ไม่ได้", (await teacher.call("admin/students")).status === 401);
r = await owner.call(`admin/students/${student.id}/pin`, {});
check("PIN ใหม่ใช้ได้ PIN เก่าใช้ไม่ได้", (await new Client().call("auth/student", { code: creds.studentCode, pin: r.data.pin })).status === 200 && (r.data.pin === creds.pin || (await new Client().call("auth/student", { code: creds.studentCode, pin: creds.pin })).status === 401));

console.log(`\n${passed} ผ่าน, ${failures.length} ไม่ผ่าน`);
if (failures.length) {
  console.log(failures.map((f) => ` - ${f}`).join("\n"));
  process.exit(1);
}
