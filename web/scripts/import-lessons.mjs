// นำเข้าคลิปสอนจาก marketing/social/demo/vc/* เข้าระบบ (collection lessons) ผ่าน API ของระบบเอง
//
//   npm run import:lessons              # ดูก่อนว่าจะทำอะไร (dry-run) ไม่แตะอะไรเลย
//   npm run import:lessons -- --apply   # คัดลอกไฟล์ไป web/public/lessons/ + สร้าง/อัปเดตรายการเป็น "ร่าง" (ใช้กับเครื่องตัวเอง)
//   npm run import:lessons -- --apply --storage   # อัปโหลดไฟล์ขึ้น Firebase Storage (ใช้กับเว็บจริง) ต้องเปิด Storage ใน Console ก่อน
//
// ใช้ค่าเชื่อมต่อชุดเดียวกับ admin-api.mjs (ADMIN_BASE_URL / ADMIN_USERNAME / ADMIN_PASSWORD ใน .env.local)
// ทำซ้ำได้ปลอดภัย: เจอคลิปเดิม (ลิงก์ไฟล์เดียวกัน) จะอัปเดตข้อมูลหน่วย/ลำดับให้ แต่ไม่แตะสถานะเผยแพร่
// เทอม/หน่วย/ลำดับ ตั้งเป็นค่าเริ่มต้นตาม MANIFEST ด้านล่าง — ตรวจแล้วแก้ที่หน้า /admin/lessons ได้
import { randomUUID } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const WEB = path.resolve(import.meta.dirname, "..");
const VC = path.resolve(WEB, "..", "marketing", "social", "demo", "vc");
const OUT = path.join(WEB, "public", "lessons");
const APPLY = process.argv.includes("--apply");
const STORAGE = process.argv.includes("--storage");

// กติกาจัดหน่วย/ลำดับจากชื่อ slug — วิทยาศาสตร์ ป.5 (เทอมยังเดาไม่ได้จากหนังสือ จึงตั้งเทอม 1 ไว้ก่อน ให้เจ้าของยืนยัน)
const SB56 = "ปรากฏการณ์จากการหมุนรอบตัวเองของโลก";
const SB57 = "สารและการเปลี่ยนแปลงของสาร";
function classify(slug) {
  let m;
  if (slug === "earth-rotation") return { unit: SB56, order: 1 };
  if ((m = slug.match(/^sb56-d(\d+)-/))) return { unit: SB56, order: 9 + Number(m[1]) };
  if ((m = slug.match(/^sb56-(\d+)-/))) return { unit: SB56, order: 1 + Number(m[1]) };
  if ((m = slug.match(/^sb57-(\d+)-/))) return { unit: SB57, order: Number(m[1]) };
  return null;
}

// อ่านค่าเชื่อมต่อจาก .env.local (เหมือน admin-api.mjs)
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

// รวบรวมคลิป: ข้ามโฟลเดอร์ตัวอย่างเสียงหญิง (-f) และโฟลเดอร์ที่ยังไม่มี mp4
const clips = [];
for (const dir of readdirSync(VC, { withFileTypes: true })) {
  if (!dir.isDirectory()) continue;
  const slug = dir.name.replace(/^\d{4}-\d{2}-\d{2}-\d{4}_/, "");
  if (slug.endsWith("-f")) continue;
  const info = classify(slug);
  if (!info) continue;
  const mp4 = path.join(VC, dir.name, "renders", `${slug}-final.mp4`);
  if (!existsSync(mp4)) continue;
  const read = (f) => (existsSync(f) ? JSON.parse(readFileSync(f, "utf8")) : {});
  const meta = read(path.join(VC, dir.name, "video.json"));
  const summary = read(path.join(VC, dir.name, "renders", `${slug}-summary.json`));
  clips.push({
    slug,
    mp4,
    title: meta.title || slug,
    durationSec: summary.video?.duration_s ? Math.round(summary.video.duration_s) : undefined,
    ...info,
  });
}
clips.sort((a, b) => a.unit.localeCompare(b.unit, "th") || a.order - b.order);

console.log(`พบ ${clips.length} คลิป ${APPLY ? "(นำเข้าจริง)" : "(dry-run — ใส่ --apply เพื่อนำเข้าจริง)"}`);
for (const c of clips) console.log(`  [${c.unit.slice(0, 12)}…] #${String(c.order).padStart(2)}  ${c.title}  (${c.durationSec ?? "?"} วิ)  ← ${c.slug}`);
if (!APPLY) process.exit(0);

const BASE = (process.env.ADMIN_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
  console.error("ยังไม่ได้ตั้ง ADMIN_USERNAME / ADMIN_PASSWORD (ใส่ใน web/.env.local)");
  process.exit(1);
}
let cookie = "";
async function call(p, body, method) {
  const res = await fetch(`${BASE}/api/${p}`, {
    method: method ?? (body === undefined ? "GET" : "POST"),
    headers: { ...(body === undefined ? {} : { "content-type": "application/json" }), ...(cookie ? { cookie } : {}), origin: BASE },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const set = res.headers.get("set-cookie");
  if (set) cookie = set.split(";")[0];
  return { status: res.status, data: await res.json().catch(() => ({})) };
}
const login = await call("auth/login", { username: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD, code: process.env.ADMIN_TOTP });
if (login.status !== 200 || login.data?.needsCode) {
  console.error("ล็อกอินไม่ผ่าน (ถ้าเปิด 2FA ใส่ ADMIN_TOTP=รหัส 6 หลัก):", JSON.stringify(login.data));
  process.exit(1);
}

// อัปโหลดขึ้น Firebase Storage แล้วคืนลิงก์ https แบบมี token (เดาไม่ได้) — ไฟล์เดิมที่ขนาดเท่ากันจะข้าม
let bucket;
if (STORAGE) {
  let raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    console.error("ต้องมี FIREBASE_SERVICE_ACCOUNT ใน .env.local เพื่ออัปโหลดขึ้น Storage");
    process.exit(1);
  }
  if (!raw.trim().startsWith("{")) raw = Buffer.from(raw, "base64").toString("utf8");
  const sa = JSON.parse(raw);
  const { cert, initializeApp } = await import("firebase-admin/app");
  const { getStorage } = await import("firebase-admin/storage");
  initializeApp({ credential: cert(sa) });
  for (const name of [process.env.STORAGE_BUCKET, `${sa.project_id}.firebasestorage.app`, `${sa.project_id}.appspot.com`].filter(Boolean)) {
    const b = getStorage().bucket(name);
    if ((await b.exists())[0]) { bucket = b; break; }
  }
  if (!bucket) {
    console.error("ไม่พบ bucket — เปิด Firebase Storage ก่อน (Console > Build > Storage > Get started, region asia-southeast1) หรือตั้ง STORAGE_BUCKET=ชื่อ bucket");
    process.exit(1);
  }
}
async function storageUrl(c) {
  const dest = `lessons/${c.slug}.mp4`;
  const file = bucket.file(dest);
  const [exists] = await file.exists();
  let token;
  if (exists) {
    const [meta] = await file.getMetadata();
    token = meta.metadata?.firebaseStorageDownloadTokens;
    if (token && Number(meta.size) === statSync(c.mp4).size) return urlOf(bucket.name, dest, token);
  }
  token = randomUUID();
  await bucket.upload(c.mp4, { destination: dest, metadata: { contentType: "video/mp4", cacheControl: "public, max-age=31536000", metadata: { firebaseStorageDownloadTokens: token } } });
  return urlOf(bucket.name, dest, token);
}
const urlOf = (b, dest, token) => `https://firebasestorage.googleapis.com/v0/b/${b}/o/${encodeURIComponent(dest)}?alt=media&token=${token}`;

if (!STORAGE) mkdirSync(OUT, { recursive: true });
const existing = (await call("admin/lessons")).data.lessons ?? [];
let created = 0;
let updated = 0;
for (const c of clips) {
  let videoUrl = `/lessons/${c.slug}.mp4`;
  if (STORAGE) videoUrl = await storageUrl(c);
  else copyFileSync(c.mp4, path.join(OUT, `${c.slug}.mp4`));
  // หาคลิปเดิมจากชื่อไฟล์ (ลิงก์ Storage มี token จึงเทียบทั้งลิงก์ไม่ได้)
  const prev = existing.find((l) => l.videoUrl === videoUrl || l.videoUrl.includes(`${c.slug}.mp4`) || l.videoUrl.includes(`${c.slug}.mp4`.replace("/", "%2F")));
  const body = {
    ...(prev ?? { published: false, summary: "", exerciseTopic: "" }),
    title: c.title,
    subject: "science",
    grade: 5,
    term: prev?.term ?? 1,
    unit: c.unit,
    order: c.order,
    videoUrl,
    durationSec: c.durationSec,
  };
  const r = prev ? await call(`admin/lessons/${prev.id}`, body, "PATCH") : await call("admin/lessons", body, "POST");
  if (r.status !== 200) {
    console.error(`✗ ${c.slug}: ${r.data?.error ?? r.status}`);
    process.exit(1);
  }
  if (prev) updated++;
  else created++;
}
console.log(`เสร็จ: สร้างใหม่ ${created} · อัปเดต ${updated} · ${STORAGE ? "ไฟล์อยู่ใน Firebase Storage" : `ไฟล์อยู่ที่ ${OUT}`} · ทุกคลิปเป็น "ร่าง" ตรวจที่ /admin/lessons แล้วกดเผยแพร่`);
