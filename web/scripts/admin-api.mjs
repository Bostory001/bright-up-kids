// เครื่องมือยิง API ของระบบในฐานะเจ้าของ — ให้คน (หรือ AI agent ตัวไหนก็ได้) แก้ข้อมูลจริงได้
// โดยผ่าน validation และสิทธิ์ของระบบเอง แทนการเขียน Firestore ตรง ๆ
//
//   node scripts/admin-api.mjs GET   admin/students
//   node scripts/admin-api.mjs GET   "admin/calendar?month=2026-12"
//   node scripts/admin-api.mjs POST  admin/students '{"nickname":"มินนี่","fullName":"...","grade":5,"pdpaConsent":true}'
//   node scripts/admin-api.mjs PATCH admin/courses/<id> '{...ฟิลด์เดิมครบ...}'
//
// ค่าเชื่อมต่ออ่านจาก web/.env.local:
//   ADMIN_BASE_URL=https://....hosted.app   (ไม่ตั้ง = http://localhost:3000)
//   ADMIN_USERNAME=...
//   ADMIN_PASSWORD=...
//   ADMIN_TOTP=123456   (ใส่เฉพาะตอนเปิดบังคับ 2FA)
// หรือส่งทาง env ตอนรันก็ได้
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const WEB = path.resolve(import.meta.dirname, "..");
const envFile = path.join(WEB, ".env.local");
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 1) continue;
    const key = t.slice(0, eq).trim();
    const value = t.slice(eq + 1).trim();
    if (value && process.env[key] === undefined) process.env[key] = value;
  }
}

const [method, apiPath, rawBody] = process.argv.slice(2);
if (!method || !apiPath) {
  console.error(`ใช้: node scripts/admin-api.mjs <GET|POST|PATCH|PUT|DELETE> <เส้นทาง api> ['<json>']

ตัวอย่าง:
  node scripts/admin-api.mjs GET admin/students
  node scripts/admin-api.mjs GET admin/timetable
  node scripts/admin-api.mjs PATCH admin/students/<id> '{"nickname":"มินนี่","fullName":"...","grade":5}'

หมายเหตุ: PATCH/POST ต้องส่งฟิลด์ที่ handler ต้องการมาครบ (อ่านของเดิมด้วย GET ก่อน)`);
  process.exit(1);
}

const BASE = (process.env.ADMIN_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const USER = process.env.ADMIN_USERNAME;
const PASS = process.env.ADMIN_PASSWORD;
if (!USER || !PASS) {
  console.error("ยังไม่ได้ตั้ง ADMIN_USERNAME / ADMIN_PASSWORD (ใส่ใน web/.env.local หรือส่งทาง env)");
  process.exit(1);
}

let cookie = "";
async function call(p, body, m) {
  const res = await fetch(`${BASE}/api/${p}`, {
    method: m ?? (body === undefined ? "GET" : "POST"),
    headers: {
      ...(body === undefined ? {} : { "content-type": "application/json" }),
      ...(cookie ? { cookie } : {}),
      // ด่านกัน CSRF ยอมรับคำขอจากโดเมนเดียวกัน
      origin: BASE,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const set = res.headers.get("set-cookie");
  if (set) cookie = set.split(";")[0];
  return { status: res.status, data: await res.json().catch(() => ({})) };
}

const login = await call("auth/login", { username: USER, password: PASS, code: process.env.ADMIN_TOTP });
if (login.data?.needsCode) {
  console.error("บัญชีนี้เปิด 2FA อยู่ — ใส่รหัส 6 หลักผ่าน ADMIN_TOTP=xxxxxx แล้วรันใหม่ (รหัสหมดอายุใน 30 วินาที)");
  process.exit(1);
}
if (login.status !== 200) {
  console.error("ล็อกอินไม่ผ่าน:", JSON.stringify(login.data));
  process.exit(1);
}

let body;
if (rawBody !== undefined) {
  try {
    body = JSON.parse(rawBody);
  } catch {
    console.error("อาร์กิวเมนต์ที่ 3 ต้องเป็น JSON");
    process.exit(1);
  }
}

const verb = method.toUpperCase();
const r = await call(apiPath.replace(/^\//, ""), verb === "GET" ? undefined : (body ?? {}), verb);
console.log(JSON.stringify(r.data, null, 2));
process.exit(r.status === 200 ? 0 : 1);
