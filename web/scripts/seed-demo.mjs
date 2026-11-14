// ข้อมูลตัวอย่างไว้ลองใช้ระบบ — ทุกเอกสารมี id ขึ้นต้น "demo-" จึงลบออกทีหลังได้สะอาด
//   npm run seed:demo          ใส่ข้อมูลตัวอย่าง (กดซ้ำได้ ทับของเดิม ไม่เกิดของซ้ำ)
//   npm run seed:demo -- --reset   ลบเฉพาะข้อมูลตัวอย่างทั้งหมด ของจริงไม่แตะ
// เขียนลงที่เก็บเดียวกับที่แอปใช้: ถ้ามี FIREBASE_SERVICE_ACCOUNT ใน .env.local = ลง Firestore จริง
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const WEB = path.resolve(import.meta.dirname, "..");

// โหลด .env.local เองเหมือน check-firestore.mjs (node ไม่ได้โหลดให้เหมือน next)
const envFile = path.join(WEB, ".env.local");
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 1) continue;
    const key = t.slice(0, eq).trim();
    const value = t.slice(eq + 1).trim();
    if (value && process.env[key] === undefined) process.env[key] = value; // ตั้งค่าว่างมาจาก env ถือว่าตั้งใจปิด
  }
}

// รันโค้ด TypeScript ของแอปได้โดยไม่ต้องผ่าน Next (วิธีเดียวกับ scripts/server.test.mjs)
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "server-only") return { url: "data:text/javascript,export{}", shortCircuit: true };
    if (specifier.startsWith(".") && context.parentURL?.endsWith(".ts")) {
      const url = new URL(specifier + ".ts", context.parentURL);
      if (existsSync(fileURLToPath(url))) return { url: url.href, shortCircuit: true };
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url.startsWith("file:") && url.endsWith(".ts")) {
      const source = ts.transpileModule(readFileSync(fileURLToPath(url), "utf8"), {
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
      }).outputText;
      return { format: "module", source, shortCircuit: true };
    }
    return nextLoad(url, context);
  },
});

const { getStore } = await import("../src/lib/server/store.ts");
const { hashSecret } = await import("../src/lib/server/auth.ts");

const store = await getStore();
const RESET = process.argv.includes("--reset");
const COLLECTIONS = [
  "users", "students", "courses", "enrollments", "attendance", "invoices", "slips",
  "expenses", "receipts", "leads", "makeups", "applications", "assignments",
  "attempts", "player_profiles", "redemptions", "rewards", "notifications",
];

console.log(`ที่เก็บข้อมูล: ${store.kind === "firestore" ? "Firestore (ของจริง)" : "ไฟล์ในเครื่อง .data/db.json"}`);

// ---------- ลบข้อมูลตัวอย่าง ----------
if (RESET) {
  let removed = 0;
  for (const col of COLLECTIONS) {
    const docs = await store.list(col);
    for (const d of docs) {
      if (typeof d.id === "string" && d.id.startsWith("demo-")) {
        await store.remove(col, d.id);
        removed++;
      }
    }
  }
  console.log(`✓ ลบข้อมูลตัวอย่าง ${removed} รายการ (ของจริงไม่ถูกแตะ)`);
  process.exit(0);
}

// ---------- วันที่: หาเสาร์/อาทิตย์ย้อนหลัง 4 สัปดาห์ ----------
const bkkNow = new Date(Date.now() + 7 * 3600_000);
const iso = (d) => d.toISOString().slice(0, 10);
const today = iso(bkkNow);
const month = today.slice(0, 7);
const shift = (days) => {
  const d = new Date(bkkNow);
  d.setUTCDate(d.getUTCDate() + days);
  return iso(d);
};
/** วันล่าสุดย้อนหลังที่ตรงกับ weekday (0=อาทิตย์) จำนวน n ครั้ง ใหม่→เก่า */
function pastDates(weekday, n) {
  const out = [];
  const d = new Date(bkkNow);
  while (out.length < n) {
    if (d.getUTCDay() === weekday) out.push(iso(d));
    d.setUTCDate(d.getUTCDate() - 1);
  }
  return out;
}
const now = new Date().toISOString();

// ---------- ครู ----------
const teacher = {
  id: "demo-user-kru-nok",
  role: "teacher",
  username: "demo-kru-nok",
  displayName: "ครูนก (ตัวอย่าง)",
  phone: "0812345001",
  passwordHash: hashSecret("demo-pass-1234"),
  mustChangePassword: true,
  hourlyRate: 400,
  active: true,
  createdAt: now,
};

// ---------- คอร์ส ----------
const courses = [
  { id: "demo-course-math", name: "คณิต ป.1-3 (ตัวอย่าง)", subject: "math", grades: [1, 2, 3], pricePerTerm: 3500, weekday: 6, startTime: "09:00", endTime: "10:30", capacity: 10 },
  { id: "demo-course-eng", name: "อังกฤษ ป.1-3 (ตัวอย่าง)", subject: "english", grades: [1, 2, 3], pricePerTerm: 3500, weekday: 6, startTime: "10:45", endTime: "12:15", capacity: 10 },
  { id: "demo-course-thai", name: "ไทย ป.4-6 (ตัวอย่าง)", subject: "thai", grades: [4, 5, 6], pricePerTerm: 3200, weekday: 0, startTime: "10:00", endTime: "11:30", capacity: 8 },
].map((c) => ({ ...c, teacherId: teacher.id, teacherName: teacher.displayName, active: true }));

// ---------- นักเรียน + ผู้ปกครอง ----------
const kids = [
  ["มายด์", "ด.ญ.มานิดา ใจดี", 2, "demo-course-math", "demo-course-eng"],
  ["ปอนด์", "ด.ช.ปัณณวิชญ์ แสงทอง", 2, "demo-course-math"],
  ["น้ำหวาน", "ด.ญ.นภัสสร วงศ์ไทย", 1, "demo-course-eng"],
  ["ตะวัน", "ด.ช.ธนกฤต อยู่สุข", 3, "demo-course-math", "demo-course-eng"],
  ["เอิร์ธ", "ด.ช.ภูมิพัฒน์ ศรีสุข", 5, "demo-course-thai"],
  ["ฟ้า", "ด.ญ.ฟ้าใส บุญมา", 4, "demo-course-thai"],
  ["กัน", "ด.ช.กันตพงศ์ รุ่งเรือง", 6, "demo-course-thai"],
  ["เบลล์", "ด.ญ.เบญญาภา ทองดี", 3, "demo-course-eng"],
];

const users = [teacher];
const students = [];
const enrollments = [];
kids.forEach(([nickname, fullName, grade, ...courseIds], i) => {
  const n = String(i + 1).padStart(2, "0");
  const parent = {
    id: `demo-user-parent-${n}`,
    role: "parent",
    username: `08100000${n}`,
    displayName: `ผู้ปกครองน้อง${nickname} (ตัวอย่าง)`,
    phone: `08100000${n}`,
    passwordHash: hashSecret("demo-pass-1234"),
    mustChangePassword: true,
    active: true,
    createdAt: now,
  };
  users.push(parent);
  students.push({
    id: `demo-student-${n}`,
    code: `DEMO${n}`,
    pinHash: hashSecret("1234"),
    nickname,
    fullName,
    grade,
    school: "โรงเรียนตัวอย่างบางพลี",
    parentId: parent.id,
    pdpaConsentAt: now,
    active: true,
    createdAt: now,
  });
  for (const courseId of courseIds) {
    enrollments.push({ id: `demo-enroll-${n}-${courseId.slice(12)}`, studentId: `demo-student-${n}`, courseId, term: `${bkkNow.getUTCFullYear()}-T2`, status: "active", createdAt: now });
  }
});

// ---------- เช็กชื่อ 4 สัปดาห์ย้อนหลัง ----------
const attendance = [];
for (const course of courses) {
  for (const date of pastDates(course.weekday, 4)) {
    for (const e of enrollments.filter((x) => x.courseId === course.id)) {
      // ส่วนใหญ่มาเรียน มีขาด/ลา/สายประปราย เพื่อให้หน้าเรียนชดเชยกับรายงานมีข้อมูล
      const seed = (Number(e.studentId.slice(-2)) + Number(date.slice(-2))) % 11;
      const status = seed === 0 ? "absent" : seed === 1 ? "leave" : seed === 2 ? "late" : "present";
      attendance.push({
        id: `${course.id}_${date}_${e.studentId}`,
        courseId: course.id,
        date,
        studentId: e.studentId,
        status,
        checkedBy: teacher.id,
        checkedAt: `${date}T03:30:00.000Z`,
      });
    }
  }
}

// ---------- ค่าเรียน ----------
const invoices = [];
enrollments.forEach((e, i) => {
  const course = courses.find((c) => c.id === e.courseId);
  const n = String(i + 1).padStart(2, "0");
  const mode = i % 4; // จ่ายแล้ว / จ่ายแล้ว / รอตรวจสลิป / ยังไม่จ่าย
  invoices.push({
    id: `demo-invoice-${n}`,
    studentId: e.studentId,
    description: `ค่าเรียน ${course.name} เทอม ${e.term}`,
    amount: course.pricePerTerm,
    dueDate: shift(mode === 3 ? -5 : 10),
    status: mode === 3 ? "unpaid" : mode === 2 ? "slip_uploaded" : "paid",
    paidDate: mode <= 1 ? shift(-(i % 20)) : undefined,
    createdAt: now,
  });
});

// ---------- รายจ่าย ----------
const expenses = [
  { id: "demo-expense-rent", date: `${month}-01`, kind: "operating", category: "rent", detail: "ค่าเช่าอาคารเดือนนี้", amount: 12000, method: "transfer", recurring: true },
  { id: "demo-expense-util", date: `${month}-05`, kind: "operating", category: "utilities", detail: "ค่าไฟ + เน็ต", amount: 1850, method: "transfer", recurring: true },
  { id: "demo-expense-mkt", date: `${month}-03`, kind: "operating", category: "marketing", detail: "บูสต์โพสต์เปิดเทอม", amount: 900, method: "transfer" },
  { id: "demo-expense-paper", date: `${month}-04`, kind: "supply", category: "office", detail: "กระดาษ A4", qty: 5, unitPrice: 120, amount: 600, method: "cash", vendor: "ร้านเครื่องเขียนบางพลี" },
  { id: "demo-expense-water", date: `${month}-06`, kind: "supply", category: "hospitality", detail: "น้ำดื่มขวดเล็ก", qty: 4, unitPrice: 60, amount: 240, method: "cash" },
  { id: "demo-expense-clean", date: `${month}-07`, kind: "supply", category: "cleaning", detail: "ทิชชู + น้ำยาถูพื้น", qty: 2, unitPrice: 95, amount: 190, method: "cash" },
  { id: "demo-expense-pen", date: `${month}-08`, kind: "supply", category: "teaching", detail: "ปากกาไวท์บอร์ด", qty: 6, unitPrice: 35, amount: 210, method: "cash" },
].map((e) => ({ ...e, createdBy: teacher.id, createdAt: now }));

// ---------- ผู้สนใจ (ยังไม่สมัคร) ----------
const leads = [
  { id: "demo-lead-01", parentName: "คุณแม่น้องข้าวปั้น (ตัวอย่าง)", phone: "0899990001", childNickname: "ข้าวปั้น", grade: 1, source: "Facebook", status: "new" },
  { id: "demo-lead-02", parentName: "คุณพ่อน้องโอ๊ต (ตัวอย่าง)", phone: "0899990002", childNickname: "โอ๊ต", grade: 3, source: "ใบปลิว", status: "booked", trialDate: shift(3) },
  { id: "demo-lead-03", parentName: "คุณแม่น้องมิน (ตัวอย่าง)", phone: "0899990003", childNickname: "มิน", grade: 5, source: "เพื่อนแนะนำ", status: "attended" },
].map((l) => ({ ...l, consentAt: now, createdAt: now }));

// ---------- เขียนลงฐานข้อมูล ----------
const groups = [
  ["users", users], ["courses", courses], ["students", students], ["enrollments", enrollments],
  ["attendance", attendance], ["invoices", invoices], ["expenses", expenses], ["leads", leads],
];
for (const [col, docs] of groups) {
  for (const doc of docs) await store.set(col, doc);
  console.log(`  ${col}: ${docs.length}`);
}

console.log(`\n✓ ใส่ข้อมูลตัวอย่างแล้ว (ทุก id ขึ้นต้น demo-)`);
console.log("  เข้าระบบแบบฝึกหัดของเด็ก: รหัสนักเรียน DEMO01-DEMO08 · PIN 1234");
console.log("  ผู้ปกครอง: เบอร์ 0810000001-0810000008 · รหัสผ่าน demo-pass-1234 (ระบบจะให้เปลี่ยนรหัสตอนเข้าครั้งแรก)");
console.log("  ล้างทิ้งเมื่อจะใช้งานจริง: npm run seed:demo -- --reset");
process.exit(0);
