// นำเข้าเนื้อหาบทเรียนจาก web/content/<วิชา>/<ชั้น>.json เป็น "ร่าง" ผ่าน admin API (ไม่เขียน Firestore ตรง)
//   node scripts/import-content.mjs                       dry-run ทุกไฟล์ (ไม่เขียนอะไร)
//   node scripts/import-content.mjs content/math/p1.json  dry-run ไฟล์เดียว
//   node scripts/import-content.mjs --apply [ไฟล์...]      เขียนจริง
// ชุดที่ชื่อ+ชั้น+วิชาตรงกันจะถูกอัปเดตเนื้อหา แต่ "สถานะเผยแพร่คงเดิม" · ชุดใหม่ = ร่าง (published=false) เสมอ
// ค่าเชื่อมต่ออ่านจาก web/.env.local (ADMIN_BASE_URL/ADMIN_USERNAME/ADMIN_PASSWORD) — ดู docs/DATA_EDITING.md
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { listFiles, validateFile } from "./validate-content.mjs";

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

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const files = listFiles(args.filter((a) => !a.startsWith("--")));

// ตรวจก่อนทุกไฟล์ — ผิดแม้ไฟล์เดียว = ไม่นำเข้าอะไรเลย
let invalid = 0;
const plans = [];
for (const f of files) {
  const { errs, data } = validateFile(f);
  if (errs.length) {
    invalid += errs.length;
    console.error(`✗ ${path.basename(f)}: ${errs.length} ข้อผิด (รัน npm run validate:content)`);
    continue;
  }
  for (const l of data.lessons) plans.push({ file: path.basename(f), grade: data.grade, subject: data.subject, lesson: l });
}
if (invalid) process.exit(1);

const BASE = (process.env.ADMIN_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
console.log(`${apply ? "นำเข้าจริง" : "dry-run"} → ${BASE} · ${plans.length} บทเรียนจาก ${files.length} ไฟล์`);

const USER = process.env.ADMIN_USERNAME;
const PASS = process.env.ADMIN_PASSWORD;
if (!USER || !PASS) {
  console.error("ยังไม่ได้ตั้ง ADMIN_USERNAME / ADMIN_PASSWORD");
  process.exit(1);
}
let cookie = "";
async function call(p, body, m) {
  const res = await fetch(`${BASE}/api/${p}`, {
    method: m ?? (body === undefined ? "GET" : "POST"),
    headers: { ...(body === undefined ? {} : { "content-type": "application/json" }), ...(cookie ? { cookie } : {}), origin: BASE },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const set = res.headers.get("set-cookie");
  if (set) cookie = set.split(";")[0];
  return { status: res.status, data: await res.json().catch(() => ({})) };
}
const login = await call("auth/login", { username: USER, password: PASS, code: process.env.ADMIN_TOTP });
if (login.data?.needsCode) {
  console.error("บัญชีนี้เปิด 2FA — ใส่ ADMIN_TOTP=xxxxxx แล้วรันใหม่");
  process.exit(1);
}
if (login.status !== 200) {
  console.error("ล็อกอินไม่ผ่าน:", JSON.stringify(login.data));
  process.exit(1);
}

const existing = (await call("admin/exercises")).data.exercises ?? [];
const key = (g, s, t) => `${g}|${s}|${t}`;
const byKey = new Map(existing.map((e) => [key(e.grade, e.subject, e.title), e]));

let created = 0;
let updated = 0;
let failed = 0;
for (const { grade, subject, lesson: l } of plans) {
  const payload = {
    title: l.title,
    subject,
    grade,
    topic: l.topic,
    term: l.term,
    unit: l.unit,
    order: l.order,
    teach: l.teach,
    questions: l.questions,
  };
  const prev = byKey.get(key(grade, subject, l.title));
  const label = `${subject} ป.${grade} #${l.order} ${l.title}`;
  if (!apply) {
    console.log(`  ${prev ? "อัปเดต" : "สร้างร่าง"}: ${label}`);
    if (prev) updated++;
    else created++;
    continue;
  }
  const r = prev
    ? await call(`admin/exercises/${prev.id}`, { ...payload, published: prev.published }, "PATCH")
    : await call("admin/exercises", { ...payload, published: false });
  if (r.status === 200) {
    if (prev) updated++;
    else created++;
    console.log(`  ✓ ${prev ? "อัปเดต" : "สร้างร่าง"}: ${label}`);
  } else {
    failed++;
    console.error(`  ✗ ${label}: ${r.status} ${JSON.stringify(r.data)}`);
  }
}
console.log(`\nสร้าง ${created} · อัปเดต ${updated} · ล้มเหลว ${failed}${apply ? "" : "  (dry-run — ใส่ --apply เพื่อเขียนจริง)"}`);
process.exit(failed ? 1 : 0);
