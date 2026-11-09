#!/usr/bin/env node
/**
 * ตรวจคลังโจทย์ตามเช็กลิสต์ใน .claude/skills/exercise-authoring ข้อ 4-8
 *
 *   npm run audit:exercises
 *
 * ข้อที่ "ผิดแน่ ๆ" (ตัวเลือกไม่ครบ 4 / ซ้ำ / answerIndex เพี้ยน / โจทย์ซ้ำ / published)
 * ถูกบังคับไว้ใน scripts/server.test.mjs แล้ว — สคริปต์นี้รายงานข้อที่ "ควรปรับ"
 * เพิ่มเติม (ขนาดชุด, ตำแหน่งคำตอบกระจุก, ตัวเลือกยาวผิดปกติ) ซึ่งคลังชุดแรก
 * ยังไม่ผ่านทั้งหมด จึงยังไม่ทำให้ build ล้ม
 */

import { registerHooks } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import ts from "typescript";

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

const { starterExercises } = await import("../src/lib/server/seed-exercises.ts");
const sets = starterExercises();

/** ขนาดชุดที่ควรเป็น ตาม SKILL ข้อ 5 */
const sizeRange = (g) => (g <= 2 ? [8, 10] : g <= 4 ? [10, 12] : [12, 15]);

const findings = [];
const note = (set, msg) => findings.push(`[${set.subject} ป.${set.grade}] ${set.title}: ${msg}`);

for (const set of sets) {
  const n = set.questions.length;
  const [lo, hi] = sizeRange(set.grade);
  if (n < lo || n > hi) note(set, `มี ${n} ข้อ แต่ชั้นนี้ควร ${lo}-${hi} ข้อ`);

  const atIndex = [0, 0, 0, 0];
  set.questions.forEach((q, i) => {
    atIndex[q.answerIndex] = (atIndex[q.answerIndex] ?? 0) + 1;

    // SKILL ข้อ 6: โจทย์ ป.1-3 ไม่เกิน 2 บรรทัดบนจอ 360px
    const cap = set.grade <= 3 ? 70 : 110;
    if (q.prompt.length > cap) note(set, `ข้อ ${i + 1} โจทย์ยาว ${q.prompt.length} ตัวอักษร (เพดาน ${cap})`);

    // SKILL ข้อ 4: ตัวเลือกที่ยาวผิดปกติ = เด็กเดาได้ว่าถูก
    const lens = q.choices.map((c) => c.length);
    const longest = Math.max(...lens);
    const rest = lens.filter((l) => l !== longest);
    if (rest.length && longest > Math.max(...rest) * 2.2 && longest > 12) {
      note(set, `ข้อ ${i + 1} ตัวเลือกยาวผิดปกติ (${longest} vs ${Math.max(...rest)} ตัวอักษร)`);
    }
  });

  // SKILL ข้อ 4: ตำแหน่งคำตอบต้องกระจาย
  const most = Math.max(...atIndex);
  if (n >= 8 && most > Math.ceil(n / 2)) note(set, `ตำแหน่งคำตอบกระจุก (ตำแหน่งเดียว ${most}/${n} ข้อ)`);
}

const total = sets.reduce((s, x) => s + x.questions.length, 0);
console.log(`คลังโจทย์: ${sets.length} ชุด · ${total} ข้อ`);

const byGrade = {};
for (const s of sets) (byGrade[`${s.subject} ป.${s.grade}`] ??= []).push(s.questions.length);
console.log(
  Object.entries(byGrade)
    .sort(([a], [b]) => a.localeCompare(b, "th"))
    .map(([k, v]) => `  ${k.padEnd(14)} ${v.length} ชุด (${v.join("+")} ข้อ)`)
    .join("\n"),
);

if (!findings.length) {
  console.log("\n✅ ผ่านทุกข้อที่แนะนำ");
} else {
  console.log(`\n⚠️  ${findings.length} ข้อที่ควรปรับ (ไม่ทำให้ build ล้ม):`);
  for (const f of findings) console.log("  - " + f);
}
