// ตรวจไฟล์เนื้อหาบทเรียน web/content/<วิชา>/<ชั้น>.json ก่อนนำเข้า
//   node scripts/validate-content.mjs            ตรวจทุกไฟล์
//   node scripts/validate-content.mjs content/math/p1.json
// รูปแบบไฟล์อยู่ที่ docs/CONTENT_SPEC.md
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../content");
const SUBJECTS = ["math", "thai", "english", "science", "chinese", "coding"];

export function listFiles(args) {
  if (args.length) return args.map((a) => path.resolve(a));
  const out = [];
  for (const dir of readdirSync(ROOT)) {
    const full = path.join(ROOT, dir);
    if (!statSync(full).isDirectory()) continue;
    for (const f of readdirSync(full)) if (f.endsWith(".json")) out.push(path.join(full, f));
  }
  return out;
}

// ภาพประกอบ (ไม่บังคับ) ต้องตรงกับที่ server รับ: play.ts visualFrom
function checkVisual(v, where, e) {
  if (v === undefined) return;
  const bad = (m) => e(`${where}: visual ${m}`);
  if (!v || typeof v !== "object" || Array.isArray(v)) return bad("รูปแบบไม่ถูกต้อง");
  if (v.type === "groups") {
    if (!Number.isInteger(v.groups) || v.groups < 1 || v.groups > 6) bad("groups ต้องจำนวนเต็ม 1-6");
    if (!Number.isInteger(v.each) || v.each < 1 || v.each > 10) bad("each ต้องจำนวนเต็ม 1-10");
    if (typeof v.emoji !== "string" || !v.emoji || v.emoji.length > 8) bad("emoji ว่างหรือยาวเกิน 8");
    if (v.label !== undefined && (typeof v.label !== "string" || v.label.length > 40)) bad("label ยาวเกิน 40");
  } else if (v.type === "equation") {
    for (const side of ["left", "right"]) {
      const s = v[side];
      if (!s || typeof s.text !== "string" || !s.text || s.text.length > 20) bad(`${side}.text ว่างหรือยาวเกิน 20`);
      else if (s.label !== undefined && (typeof s.label !== "string" || s.label.length > 30)) bad(`${side}.label ยาวเกิน 30`);
    }
  } else if (v.type === "diagram") {
    if (!["compass", "skydome", "timezone", "earth", "solar", "stars", "angle", "clock", "numline", "bars", "states", "tree", "table", "apparatus", "objects", "blocks", "fracbar", "array", "pgrid", "money", "ruler", "shape", "addsub"].includes(v.kind)) bad("diagram kind ไม่รู้จัก");
    if (!v.params || typeof v.params !== "object" || Array.isArray(v.params)) bad("diagram ต้องมี params เป็น object");
  } else bad("type ต้องเป็น groups, equation หรือ diagram");
}

export function validateFile(file) {
  const errs = [];
  const warn = [];
  let data;
  try {
    data = JSON.parse(readFileSync(file, "utf8"));
  } catch (e) {
    return { errs: [`อ่าน JSON ไม่ได้: ${e.message}`], warn, lessons: [] };
  }
  if (!SUBJECTS.includes(data.subject)) errs.push(`subject ไม่ถูก: ${data.subject}`);
  if (!Number.isInteger(data.grade) || data.grade < 1 || data.grade > 9) errs.push(`grade ไม่ถูก: ${data.grade}`);
  const lessons = Array.isArray(data.lessons) ? data.lessons : [];
  if (!lessons.length) errs.push("ไม่มี lessons");
  const orders = new Set();
  const titles = new Set();
  lessons.forEach((l, li) => {
    const at = `บทที่ ${li + 1} "${l.title ?? "?"}"`;
    const e = (m) => errs.push(`${at}: ${m}`);
    if (![1, 2].includes(l.term)) e("term ต้องเป็น 1 หรือ 2");
    if (!l.unit || String(l.unit).length > 80) e("unit ว่างหรือยาวเกิน 80");
    if (!Number.isInteger(l.order) || l.order < 1) e("order ต้องเป็นจำนวนเต็ม ≥ 1");
    else if (orders.has(l.order)) e(`order ซ้ำ (${l.order})`);
    else orders.add(l.order);
    if (!l.title || l.title.length > 100) e("title ว่างหรือยาวเกิน 100");
    else if (titles.has(l.title)) e("title ซ้ำในไฟล์");
    else titles.add(l.title);
    if (!l.topic || l.topic.length > 60) e("topic ว่างหรือยาวเกิน 60");
    const teach = Array.isArray(l.teach) ? l.teach : [];
    if (teach.length < 3 || teach.length > 6) e(`teach ต้อง 3-6 การ์ด (มี ${teach.length})`);
    const checkImage = (im, where) => {
      if (im === undefined) return;
      if (!im || typeof im.src !== "string" || !/^[/]img[/][a-zA-Z0-9_/-]+[.](png|jpe?g|webp)$/.test(im.src) || im.src.includes("..")) e(`${where}: image.src ต้องเป็น /img/....png|jpg|webp`);
      if (!im?.alt || String(im.alt).length > 120) e(`${where}: image.alt ว่างหรือยาวเกิน 120`);
    };
    teach.forEach((c, i) => {
      checkImage(c.image, `teach ${i + 1}`);
      if (!c.title || c.title.length > 60) e(`teach ${i + 1}: title ว่างหรือยาวเกิน 60`);
      if (!c.text || c.text.length > 400) e(`teach ${i + 1}: text ว่างหรือยาวเกิน 400`);
      if (c.example !== undefined && (typeof c.example !== "string" || c.example.length > 200)) e(`teach ${i + 1}: example ยาวเกิน 200`);
      checkVisual(c.visual, `teach ${i + 1}`, e);
    });
    const qs = Array.isArray(l.questions) ? l.questions : [];
    if (qs.length < 8 || qs.length > 12) e(`questions ต้อง 8-12 ข้อ (มี ${qs.length})`);
    const prompts = new Set();
    const spread = new Set();
    qs.forEach((q, i) => {
      const qe = (m) => e(`ข้อ ${i + 1}: ${m}`);
      if (!q.prompt || q.prompt.length > 500) qe("prompt ว่างหรือยาวเกิน 500");
      else if (prompts.has(q.prompt)) qe("prompt ซ้ำ");
      else prompts.add(q.prompt);
      const ch = Array.isArray(q.choices) ? q.choices.map((c) => String(c).trim()) : [];
      if (ch.length !== 4) qe(`ต้องมี 4 ตัวเลือก (มี ${ch.length})`);
      if (ch.some((c) => !c || c.length > 200)) qe("ตัวเลือกว่างหรือยาวเกิน 200");
      if (new Set(ch).size !== ch.length) qe("ตัวเลือกซ้ำกัน");
      if (!Number.isInteger(q.answerIndex) || q.answerIndex < 0 || q.answerIndex > 3) qe("answerIndex ต้อง 0-3");
      else spread.add(q.answerIndex);
      if (!q.explain || q.explain.length > 500) qe("explain ว่างหรือยาวเกิน 500");
      checkVisual(q.visual, `ข้อ ${i + 1}`, e);
      checkImage(q.image, `ข้อ ${i + 1}`);
    });
    if (qs.length >= 8 && spread.size < 3) e(`คำตอบที่ถูกกระจุกอยู่ที่ตำแหน่ง ${[...spread]} (ต้องกระจายอย่างน้อย 3 ตำแหน่ง)`);
  });
  const sorted = [...orders].sort((a, b) => a - b);
  if (sorted.some((o, i) => o !== i + 1)) warn.push("order ไม่ต่อเนื่องจาก 1");
  return { errs, warn, lessons, data };
}

if (process.argv[1]?.endsWith("validate-content.mjs")) {
  let bad = 0;
  let totalL = 0;
  let totalQ = 0;
  for (const f of listFiles(process.argv.slice(2))) {
    const { errs, warn, lessons } = validateFile(f);
    totalL += lessons.length;
    totalQ += lessons.reduce((n, l) => n + (l.questions?.length ?? 0), 0);
    console.log(`${errs.length ? "✗" : "✓"} ${path.relative(ROOT, f)} — ${lessons.length} บท`);
    for (const m of errs) console.log("   ✗ " + m);
    for (const m of warn) console.log("   ! " + m);
    bad += errs.length;
  }
  console.log(`\nรวม ${totalL} บทเรียน · ${totalQ} โจทย์ · ผิด ${bad}`);
  process.exit(bad ? 1 : 0);
}
