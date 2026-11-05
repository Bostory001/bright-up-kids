#!/usr/bin/env node
/**
 * สร้าง character sheet จาก marketing/video/characters/PROMPTS.md
 *
 * หลักการ: **ไฟล์ PROMPTS.md คือความจริงฉบับเดียว** สคริปต์นี้อ่านทุกอย่างจากไฟล์นั้น
 * (บล็อก [STYLE] [LAYOUT] [NEGATIVE] และตารางเติมช่อง {TOKEN}) ไม่มี prompt ฝังในโค้ด
 * แก้ prompt ที่ไฟล์ .md ที่เดียว สคริปต์ตามอัตโนมัติ
 *
 *   node scripts/gen-characters.mjs --list
 *   node scripts/gen-characters.mjs --dry-run --only=kru-kao
 *   OPENAI_API_KEY=... node scripts/gen-characters.mjs --only=kru-kao
 *
 * ⚠️ ก่อนรันจริง: ตรวจชื่อโมเดลกับ docs ของ OpenAI แล้วตั้ง OPENAI_IMAGE_MODEL
 *    ค่าเริ่มต้นด้านล่างอาจไม่ใช่โมเดลล่าสุด
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PROMPTS_PATH = path.join(ROOT, "marketing", "video", "characters", "PROMPTS.md");
const OUT_DIR = path.dirname(PROMPTS_PATH);

const MODEL = process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1";
const SIZE = process.env.OPENAI_IMAGE_SIZE ?? "1536x1024"; // sheet เป็นแนวนอน 4:3
const QUALITY = process.env.OPENAI_IMAGE_QUALITY ?? "medium";

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(`--${name}`);
const value = (name) => argv.find((a) => a.startsWith(`--${name}=`))?.split("=").slice(1).join("=");

const LIST = flag("list");
const DRY = flag("dry-run");
const ONLY = value("only");
const REF = value("ref");

/** ชื่อไฟล์ผลลัพธ์ — ไทย → slug (ภาษาไทยทำเป็นชื่อไฟล์ไม่ได้) */
const SLUGS = {
  "ครูเก้า": "kru-kao", "ดร.ปุย": "dr-pui", "ครูมายด์": "kru-mind", "ครูจัน": "kru-jan",
  "ครูแอน": "kru-ann", "ต้นกล้า": "tonkla", "โบ๊ท": "boat", "มีมี่": "mimi", "แพรว": "praew",
  "มะนาว": "manao", "โกโก้": "koko",
  "คณิต": "cover-math", "ไทย": "cover-thai", "อังกฤษ": "cover-english", "วิทย์": "cover-science",
};

/** ชื่อที่ส่งเข้า prompt — โมเดลอ่านไทยไม่ออก ต้องเป็นอังกฤษ */
const DISPLAY = {
  "ครูเก้า": "Kru Kao, the geometry mage who teaches math",
  "ดร.ปุย": "Dr. Pui, the alchemist who teaches science",
  "ครูมายด์": "Kru Mind, the wayfarer who teaches English",
  "ครูจัน": "Kru Jan, the storyweaver who teaches Thai",
  "ครูแอน": "Kru Ann, the lanternkeeper",
  "ต้นกล้า": "Tonkla", "โบ๊ท": "Boat", "มีมี่": "Mimi", "แพรว": "Praew",
  "มะนาว": "Manao the kitten", "โกโก้": "Koko the baby dragon",
};

/** หัวข้อที่ไม่มีชื่อภาษาอังกฤษในวงเล็บ */
const SECTION_SLUGS = { 12: "team-teachers", 13: "banner-panels" };

const clean = (s) => s.replace(/\*\*/g, "").replace(/`/g, "").replace(/\s*\(\+[^)]*\)/g, "").trim();
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function parseBlocks(md) {
  const out = {};
  for (const m of md.matchAll(/^### \[([A-Z]+)\][ \t]*\r?\n```\r?\n([\s\S]*?)\r?\n```/gm)) {
    out[m[1]] = m[2].trim();
  }
  for (const key of ["STYLE", "LAYOUT", "NEGATIVE"]) {
    if (!out[key]) throw new Error(`ไม่พบบล็อก [${key}] ใน PROMPTS.md — ต้องเขียนเป็น "### [${key}]" แล้วตามด้วย code fence`);
  }
  return out;
}

function parseSections(md) {
  const heads = [...md.matchAll(/^# (\d+)(?:-\d+)?\.[ \t]*(.+)$/gm)];
  return heads.map((m, i) => ({
    number: Number(m[1]),
    title: m[2].trim(),
    body: md.slice(m.index, heads[i + 1]?.index ?? md.length),
  }));
}

/** ตารางเติมช่อง: หัวตารางต้องมีคอลัมน์ที่เป็น {TOKEN} */
function parseTable(text) {
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex((l, i) => l.trim().startsWith("|") && /\{[A-Z_]+\}/.test(l) && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1] ?? ""));
  if (start === -1) return null;
  const cells = (l) => l.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
  const header = cells(lines[start]);
  const rows = [];
  for (let i = start + 2; i < lines.length; i++) {
    if (!lines[i].trim().startsWith("|")) break;
    rows.push(cells(lines[i]));
  }
  return { header, rows };
}

function jobsFrom(section, blocks) {
  const fence = section.body.match(/```\r?\n([\s\S]*?)\r?\n```/);
  if (!fence) return [];
  const template = fence[1].trim();
  const table = parseTable(section.body.slice(fence.index + fence[0].length));

  const fill = (tpl, values = {}) => {
    let out = tpl;
    for (const [k, v] of Object.entries(values)) out = out.replaceAll(`{${k}}`, v);
    // บล็อกต้องขึ้นบรรทัดใหม่เสมอ ไม่งั้น [STYLE] [LAYOUT] ที่เขียนติดกันจะกลายเป็นย่อหน้าเดียว
    for (const [k, v] of Object.entries(blocks)) out = out.replaceAll(`[${k}]`, `\n\n${v}\n\n`);
    return out.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  };

  if (!table) {
    const en = section.title.match(/\(([A-Za-z][A-Za-z .'-]+)\)/)?.[1];
    const slug = SECTION_SLUGS[section.number] ?? (en ? slugify(en) : `section-${section.number}`);
    return [{ slug, title: section.title, prompt: fill(template) }];
  }

  const jobs = [];
  for (const row of table.rows) {
    const values = {};
    table.header.forEach((h, i) => {
      const token = h.match(/\{([A-Z_]+)\}/)?.[1];
      if (token) values[token] = clean(row[i] ?? "");
    });
    if (Object.values(values).some((v) => v.includes("ใช้ sheet"))) continue; // แถวที่บอกให้ใช้ sheet เดิม

    const plain = (i) => !/\{[A-Z_]+\}/.test(table.header[i] ?? "");
    const label = clean(
      row.find((c, i) => plain(i) && SLUGS[clean(c)]) ??
        row.find((c, i) => plain(i) && clean(c) && !/^\d+$/.test(clean(c))) ??
        "",
    );
    const idInBackticks = (row[0] ?? "").match(/`([a-z_]+)`/)?.[1];
    const slug = idInBackticks ? `avatar-${idInBackticks}` : (SLUGS[label] || slugify(label) || `section-${section.number}`);

    for (const [k, v] of Object.entries(values)) if (DISPLAY[clean(v)]) values[k] = DISPLAY[clean(v)];
    jobs.push({ slug, title: `${section.title} — ${label || slug}`, prompt: fill(template, values) });
  }
  return jobs;
}

async function callImageAPI(prompt, referencePath) {
  if (!process.env.OPENAI_API_KEY) throw new Error("ยังไม่ได้ตั้ง OPENAI_API_KEY");
  const headers = { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` };
  let response;
  if (referencePath) {
    const form = new FormData();
    form.append("model", MODEL);
    form.append("prompt", prompt);
    form.append("size", SIZE);
    form.append("quality", QUALITY);
    const bytes = await readFile(referencePath);
    form.append("image[]", new Blob([bytes], { type: "image/png" }), path.basename(referencePath));
    response = await fetch("https://api.openai.com/v1/images/edits", { method: "POST", headers, body: form });
  } else {
    response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ model: MODEL, prompt, size: SIZE, quality: QUALITY }),
    });
  }
  const body = await response.json();
  if (!response.ok) throw new Error(`${response.status}: ${JSON.stringify(body)}`);
  const b64 = body.data?.[0]?.b64_json;
  if (!b64) throw new Error("ผลลัพธ์ไม่มี data[0].b64_json");
  return Buffer.from(b64, "base64");
}

async function main() {
  const md = await readFile(PROMPTS_PATH, "utf8");
  const blocks = parseBlocks(md);
  const all = parseSections(md).flatMap((s) => jobsFrom(s, blocks));
  const jobs = ONLY ? all.filter((j) => j.slug === ONLY || j.slug.includes(ONLY)) : all;

  if (!jobs.length) throw new Error(ONLY ? `ไม่มีงานชื่อ "${ONLY}" — ดูรายชื่อด้วย --list` : "ไม่พบ prompt ใน PROMPTS.md");

  if (LIST) {
    for (const j of all) {
      const missing = j.prompt.match(/\{[A-Z_]+\}/g);
      console.log(`${j.slug.padEnd(22)} ${missing ? `⚠️ ยังไม่ได้เติม ${[...new Set(missing)].join(" ")}  ` : ""}${j.title}`);
    }
    console.log(`\nรวม ${all.length} งาน · โมเดล: ${MODEL} · ขนาด: ${SIZE}`);
    return;
  }

  // ใช้ภาพแรกเป็น "หลักสไตล์" ตลอดรอบ (ไม่ไล่ต่อกันไปเรื่อย ๆ เพราะสไตล์จะเพี้ยนสะสม)
  let anchor = REF ? path.resolve(REF) : null;
  if (anchor && !existsSync(anchor)) throw new Error(`ไม่พบไฟล์อ้างอิง: ${anchor}`);

  await mkdir(OUT_DIR, { recursive: true });
  for (const job of jobs) {
    const missing = job.prompt.match(/\{[A-Z_]+\}/g);
    if (missing) {
      console.warn(`⏭️  ข้าม ${job.slug} — ยังมีช่องที่ไม่ได้เติม: ${[...new Set(missing)].join(" ")}`);
      continue;
    }
    if (DRY) {
      console.log(`\n=== ${job.slug} === (อ้างอิง: ${anchor ? path.basename(anchor) : "ไม่มี"})\n${job.prompt}\n`);
      continue;
    }
    const imagePath = path.join(OUT_DIR, `${job.slug}.png`);
    const bytes = await callImageAPI(job.prompt, anchor);
    await writeFile(imagePath, bytes);
    await writeFile(
      path.join(OUT_DIR, `${job.slug}.md`),
      [
        `# ${job.title}`,
        "",
        `- โมเดล: \`${MODEL}\` · ขนาด ${SIZE} · คุณภาพ ${QUALITY}`,
        `- Endpoint: ${anchor ? "POST /v1/images/edits (ส่ง sheet หลักเป็น reference)" : "POST /v1/images/generations"}`,
        `- ภาพอ้างอิง: ${anchor ? path.basename(anchor) : "ไม่มี (ใบนี้เป็นหลักสไตล์)"}`,
        `- Seed: Images API ไม่คืน seed — ทำซ้ำเป๊ะไม่ได้ ให้เก็บ .png ไว้เป็นต้นฉบับ`,
        `- สร้างเมื่อ: ${new Date().toISOString()}`,
        "",
        "## Prompt ที่ใช้จริง",
        "",
        "```",
        job.prompt,
        "```",
        "",
      ].join("\n"),
    );
    console.log(`✅ ${imagePath}`);
    anchor ??= imagePath;
  }
}

main().catch((error) => {
  console.error(`❌ ${error.message}`);
  process.exitCode = 1;
});
