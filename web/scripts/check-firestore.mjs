// ตรวจว่าเชื่อม Firestore ได้จริงก่อนใช้งาน (ขั้น S1 ใน docs/GO_LIVE.md)
// รัน: npm run check:firestore   (อ่านค่าจาก web/.env.local เอง)
// ปลอดภัยกับ project จริง: เขียน 1 เอกสารใน _healthcheck แล้วลบทิ้งทันที ไม่แตะข้อมูลอื่น
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";

const WEB = path.resolve(import.meta.dirname, "..");
const COLLECTIONS = ["users", "students", "courses", "invoices", "expenses", "attempts"];

function fail(msg, hint) {
  console.error(`\n✗ ${msg}`);
  if (hint) console.error(`  → ${hint}`);
  process.exit(1);
}

// อ่าน .env.local แบบง่าย (node ไม่ได้โหลดให้เหมือน next dev)
function loadEnvLocal() {
  const file = path.join(WEB, ".env.local");
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (value && process.env[key] === undefined) process.env[key] = value; // ตั้งค่าว่างมาจาก env ถือว่าตั้งใจปิด
  }
}

loadEnvLocal();
const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!raw) {
  fail("ยังไม่ได้ตั้ง FIREBASE_SERVICE_ACCOUNT", "คัดลอก web/.env.local.example เป็น web/.env.local แล้ววาง JSON ของ service account เป็นบรรทัดเดียว");
}

let sa;
try {
  sa = JSON.parse(raw);
} catch {
  fail("FIREBASE_SERVICE_ACCOUNT ไม่ใช่ JSON ที่อ่านได้", "ต้องเป็น JSON ทั้งก้อนบรรทัดเดียว (ขึ้นต้น { ลงท้าย }) ห้ามมีการขึ้นบรรทัดใหม่");
}
for (const key of ["project_id", "client_email", "private_key"]) {
  if (!sa[key]) fail(`ใน service account ไม่มีค่า ${key}`, "ดาวน์โหลดคีย์ใหม่ที่ Project settings > Service accounts > Generate new private key");
}
if (!String(sa.private_key).includes("BEGIN PRIVATE KEY")) {
  fail("private_key ผิดรูป", 'ตอนวางเป็นบรรทัดเดียว ขึ้นบรรทัดใหม่ในคีย์ต้องเป็น \\n ไม่ใช่การกด Enter');
}

console.log(`project: ${sa.project_id}`);
console.log(`service account: ${String(sa.client_email).replace(/^[^@]+/, "***")}`);

const { cert, getApps, initializeApp } = await import("firebase-admin/app");
const { getFirestore } = await import("firebase-admin/firestore");
let fs;
try {
  const app = getApps()[0] ?? initializeApp({ credential: cert(sa) });
  fs = getFirestore(app);
  fs.settings({ ignoreUndefinedProperties: true });
} catch (err) {
  fail(`คีย์ใช้ไม่ได้: ${String(err?.message ?? err)}`, "ดาวน์โหลด service account key ใหม่แล้ววางทั้งก้อนอีกครั้ง");
}

// เขียน-อ่าน-ลบ เอกสารทดสอบ 1 ใบ
const id = `check-${randomBytes(6).toString("hex")}`;
const ref = fs.collection("_healthcheck").doc(id);
try {
  await ref.set({ id, at: new Date().toISOString(), note: "ตรวจการเชื่อมต่อจาก npm run check:firestore" });
  const snap = await ref.get();
  if (!snap.exists) fail("เขียนได้แต่อ่านกลับไม่เจอ", "ลองใหม่อีกครั้ง หรือตรวจว่า Firestore database ถูกสร้างแล้ว");
  await ref.delete();
  console.log("✓ เขียน อ่าน และลบเอกสารทดสอบสำเร็จ");
} catch (err) {
  const msg = String(err?.message ?? err);
  if (/NOT_FOUND|database \(default\)/i.test(msg)) {
    fail("ยังไม่ได้สร้าง Firestore database ใน project นี้", "Firebase Console > Build > Firestore Database > Create database (Production · asia-southeast1)");
  }
  if (/PERMISSION_DENIED|IAM|permission/i.test(msg)) {
    fail("service account ไม่มีสิทธิ์เขียน Firestore", "ใช้คีย์จาก project เดียวกัน และต้องมี role Firebase Admin SDK Administrator Service Agent");
  }
  if (/ENOTFOUND|ETIMEDOUT|EAI_AGAIN|network/i.test(msg)) fail("ต่อเน็ตไปหา Firestore ไม่ได้", "ตรวจอินเทอร์เน็ต/ไฟร์วอลล์แล้วลองใหม่");
  fail(`เชื่อม Firestore ไม่สำเร็จ: ${msg}`);
}

// บอกว่า project นี้มีข้อมูลอยู่แล้วหรือยัง — กันเผลอรัน npm run smoke ใส่ของจริง
let total = 0;
const found = [];
for (const col of COLLECTIONS) {
  const snap = await fs.collection(col).limit(50).get();
  if (snap.size) found.push(`${col}=${snap.size}${snap.size === 50 ? "+" : ""}`);
  total += snap.size;
}
console.log(total === 0 ? "project นี้ยังว่าง (ยังไม่มีข้อมูล)" : `มีข้อมูลอยู่แล้ว: ${found.join(", ")}`);
console.log(
  total === 0
    ? "\n✓ พร้อมใช้งาน — รัน npm run dev แล้วเปิด /setup เพื่อสร้างบัญชีเจ้าของ (ข้อมูลจะไปอยู่บน Firestore)"
    : "\n✓ พร้อมใช้งาน — อย่ารัน npm run smoke กับ project นี้ เพราะจะสร้างข้อมูลทดสอบปนของจริง",
);
process.exit(0);
