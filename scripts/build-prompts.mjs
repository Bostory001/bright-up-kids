#!/usr/bin/env node
/**
 * แตก prompt จาก marketing/video/characters/PROMPTS.md ออกเป็นไฟล์ "พร้อมก๊อปวาง"
 *
 * สคริปต์นี้ **ไม่เรียก API ไม่สร้างภาพ ไม่ต้องใช้คีย์** — หน้าที่เดียวคือ
 * ประกอบบล็อก [STYLE] [LAYOUT] [NEGATIVE] และเติมตาราง {TOKEN} ให้ครบ
 * แล้วเขียนเป็นไฟล์ .txt ทีละใบ เอาไปให้ Codex/GPT สั่งสร้างภาพเอง
 *
 * PROMPTS.md คือความจริงฉบับเดียว — ไม่มี prompt ฝังในโค้ดนี้
 *
 *   node scripts/build-prompts.mjs            # เขียนไฟล์ทั้งหมดลง ready/
 *   node scripts/build-prompts.mjs --list     # ดูรายชื่องาน
 *   node scripts/build-prompts.mjs --only=kru-kao --print
 */

import { mkdir, readFile, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PROMPTS_PATH = path.join(ROOT, "marketing", "video", "characters", "PROMPTS.md");

const argv = process.argv.slice(2);
const flag = (n) => argv.includes(`--${n}`);
const value = (n) => argv.find((a) => a.startsWith(`--${n}=`))?.split("=").slice(1).join("=");

const LIST = flag("list");
const PRINT = flag("print");
const ONLY = value("only");
const OUT_DIR = path.resolve(ROOT, value("out") ?? path.join("marketing", "video", "characters", "ready"));

/** ชื่อไฟล์ผลลัพธ์ — ภาษาไทยใช้เป็นชื่อไฟล์ไม่ได้ */
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

const SECTION_SLUGS = { 12: "team-teachers", 13: "banner-panels" };

const clean = (s) => s.replace(/\*\*/g, "").replace(/`/g, "").replace(/\s*\(\+[^)]*\)/g, "").trim();
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function parseBlocks(md) {
  const out = {};
  for (const m of md.matchAll(/^### \[([A-Z]+)\][ \t]*\r?\n```\r?\n([\s\S]*?)\r?\n```/gm)) out[m[1]] = m[2].trim();
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

const REFERENCE_LINE =
  "Use the image above as the style reference. Keep the exact same art style, line weight, shading and proportions.";

function orderFile(jobs) {
  return [
    "# ลำดับสั่งสร้างภาพ (สร้างอัตโนมัติ — อย่าแก้ไฟล์นี้ด้วยมือ)",
    "",
    "ไฟล์ในโฟลเดอร์นี้สร้างจาก `marketing/video/characters/PROMPTS.md`",
    "แก้ prompt ที่ไฟล์นั้น แล้วรัน `node scripts/build-prompts.mjs` ใหม่",
    "",
    "## วิธีสั่ง",
    "",
    "1. ทำ **ในแชทเดียวกันทั้งหมด** ไม่งั้นสไตล์หลุด",
    "2. ใบแรก (`kru-kao`) ก๊อป `.txt` วางตรง ๆ",
    "3. ใบที่ 2 เป็นต้นไป วางบรรทัดนี้ก่อน แล้วตามด้วยเนื้อ `.txt`",
    "",
    "```",
    REFERENCE_LINE,
    "```",
    "",
    "4. ได้ภาพที่พอใจ → เซฟเป็น `marketing/video/characters/<slug>.png`",
    "5. ภาพทุกใบผ่าน `content-reviewer` ก่อนใช้",
    "",
    "## รายการ",
    "",
    "| # | slug | ใช้ทำอะไร |",
    "|---|---|---|",
    ...jobs.map((j, i) => `| ${i + 1} | \`${j.slug}\` | ${j.title.replace(/\|/g, "/")} |`),
    "",
  ].join("\n");
}

async function main() {
  const md = await readFile(PROMPTS_PATH, "utf8");
  const blocks = parseBlocks(md);
  const all = parseSections(md).flatMap((s) => jobsFrom(s, blocks));
  const jobs = ONLY ? all.filter((j) => j.slug === ONLY || j.slug.includes(ONLY)) : all;
  if (!jobs.length) throw new Error(ONLY ? `ไม่มีงานชื่อ "${ONLY}" — ดูรายชื่อด้วย --list` : "ไม่พบ prompt ใน PROMPTS.md");

  const unfilled = (p) => [...new Set(p.match(/\{[A-Z_]+\}/g) ?? [])];

  if (LIST) {
    for (const j of all) {
      const miss = unfilled(j.prompt);
      console.log(`${j.slug.padEnd(22)} ${miss.length ? `⚠️ ยังไม่ได้เติม ${miss.join(" ")}  ` : ""}${j.title}`);
    }
    console.log(`\nรวม ${all.length} งาน`);
    return;
  }

  if (PRINT) {
    for (const j of jobs) console.log(`\n=== ${j.slug} ===\n${j.prompt}\n`);
    return;
  }

  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });
  let written = 0;
  let skipped = 0;
  for (const job of jobs) {
    const miss = unfilled(job.prompt);
    if (miss.length) {
      console.warn(`⏭️  ข้าม ${job.slug} — ยังมีช่องที่ไม่ได้เติมใน PROMPTS.md: ${miss.join(" ")}`);
      skipped++;
      continue;
    }
    await writeFile(path.join(OUT_DIR, `${job.slug}.txt`), `${job.prompt}\n`, "utf8");
    written++;
  }
  await writeFile(path.join(OUT_DIR, "ORDER.md"), orderFile(jobs.filter((j) => !unfilled(j.prompt).length)), "utf8");
  console.log(`✅ เขียน ${written} ไฟล์ลง ${path.relative(ROOT, OUT_DIR)}${skipped ? ` (ข้าม ${skipped})` : ""}`);
  console.log(`   ลำดับการสั่ง: ${path.relative(ROOT, path.join(OUT_DIR, "ORDER.md"))}`);
}

main().catch((error) => {
  console.error(`❌ ${error.message}`);
  process.exitCode = 1;
});
