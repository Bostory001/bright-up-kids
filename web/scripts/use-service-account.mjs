// เอาไฟล์ service account JSON ที่โหลดจาก Firebase Console มาใส่ web/.env.local ให้ถูกรูปแบบ
// รัน: npm run firebase:key -- "C:\\Users\\User\\Downloads\\brightupkids-xxxx.json"
// ไม่ต้องคัดลอก/วางเอง (บรรทัดใหม่ในคีย์คือสาเหตุที่พังบ่อยที่สุด) · ไม่พิมพ์ค่าคีย์ออกหน้าจอ
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const WEB = path.resolve(import.meta.dirname, "..");
const ENV = path.join(WEB, ".env.local");
const EXAMPLE = path.join(WEB, ".env.local.example");

const src = process.argv[2];
if (!src) {
  console.error('วิธีใช้: npm run firebase:key -- "<ที่อยู่ไฟล์ JSON ที่โหลดมา>"');
  process.exit(1);
}
if (!existsSync(src)) {
  console.error(`✗ ไม่พบไฟล์: ${src}`);
  process.exit(1);
}

let sa;
try {
  sa = JSON.parse(readFileSync(src, "utf8"));
} catch {
  console.error("✗ ไฟล์นี้ไม่ใช่ JSON — ต้องเป็นไฟล์ที่ได้จาก Project settings > Service accounts > Generate new private key");
  process.exit(1);
}
for (const key of ["project_id", "client_email", "private_key", "type"]) {
  if (!sa[key]) {
    console.error(`✗ ในไฟล์ไม่มีค่า ${key} — น่าจะไม่ใช่ service account key`);
    process.exit(1);
  }
}

// JSON.stringify ทำให้ขึ้นบรรทัดใหม่ในคีย์กลายเป็นอักขระ backslash-n ในบรรทัดเดียว ซึ่งเป็นรูปแบบที่ store.ts อ่านได้
const line = `FIREBASE_SERVICE_ACCOUNT=${JSON.stringify(sa)}`;
const hadEnv = existsSync(ENV);
const base = hadEnv ? readFileSync(ENV, "utf8") : readFileSync(EXAMPLE, "utf8");
if (hadEnv) writeFileSync(`${ENV}.bak`, base, "utf8");
const lines = base.split(/\r?\n/);
const at = lines.findIndex((l) => l.startsWith("FIREBASE_SERVICE_ACCOUNT="));
if (at >= 0) lines[at] = line;
else lines.push(line);
writeFileSync(ENV, lines.join("\n"), "utf8");

console.log(`✓ ใส่คีย์ของ project ${sa.project_id} ลงใน web/.env.local แล้ว${hadEnv ? " (สำรองของเดิมไว้ที่ .env.local.bak)" : ""}`);
console.log(`→ ลบไฟล์ ${path.basename(src)} ที่โหลดมาทิ้งได้เลย แล้วรัน: npm run check:firestore`);
