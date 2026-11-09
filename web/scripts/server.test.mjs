import assert from "node:assert/strict";
import { test } from "node:test";
import { registerHooks } from "node:module";
import { existsSync, readFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

// Load the real server modules without Next.js; erase TS only for these tests.
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
      const source = ts.transpileModule(readFileSync(fileURLToPath(url), "utf8"), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
      return { format: "module", source, shortCircuit: true };
    }
    return nextLoad(url, context);
  },
});
const { dateStr, num } = await import("../src/lib/server/util.ts");
const { passwordInput, hashSecret, verifySecret } = await import("../src/lib/server/auth.ts");
const { getStore } = await import("../src/lib/server/store.ts");
const { starterExercises } = await import("../src/lib/server/seed-exercises.ts");

// กฎที่ผิดแล้วชุดโจทย์ใช้ไม่ได้เลย — ดู .claude/skills/exercise-authoring ข้อ 4 และ 8
// ข้อที่ "ควรปรับ" (ขนาดชุด ตำแหน่งคำตอบกระจุก) อยู่ใน npm run audit:exercises
test("every seeded exercise is answerable and unambiguous", () => {
  const sets = starterExercises();
  assert.ok(sets.length > 0, "คลังโจทย์ว่าง");
  // topic ใช้สรุปจุดอ่อนรายคน สะกดเพี้ยนแล้วรายงานแตกเป็นสองหัวข้อเงียบ ๆ
  const topics = new Map();
  for (const set of sets) {
    const where = `${set.subject} ป.${set.grade} ${set.title}`;
    assert.equal(set.published, false, `${where}: ต้องนำเข้าเป็นร่าง`);
    assert.ok(set.questions.length > 0, `${where}: ไม่มีข้อ`);
    assert.ok(set.topic.trim(), `${where}: ไม่มี topic`);
    const key = set.topic.trim().toLowerCase().replace(/\s+/g, "");
    const seen = topics.get(key);
    assert.ok(!seen || seen === set.topic, `${where}: topic "${set.topic}" สะกดไม่ตรงกับ "${seen}" ที่ใช้อยู่แล้ว`);
    topics.set(key, set.topic);

    const prompts = new Set();
    set.questions.forEach((q, i) => {
      const at = `${where} ข้อ ${i + 1}`;
      assert.equal(q.choices.length, 4, `${at}: ต้องมีตัวเลือก 4 ตัว`);
      assert.equal(new Set(q.choices).size, 4, `${at}: ตัวเลือกซ้ำกัน`);
      assert.ok(Number.isInteger(q.answerIndex) && q.answerIndex >= 0 && q.answerIndex < 4, `${at}: answerIndex เพี้ยน`);
      for (const choice of q.choices) assert.ok(String(choice).trim(), `${at}: มีตัวเลือกว่าง`);
      assert.ok(String(q.prompt).trim(), `${at}: ไม่มีโจทย์`);
      assert.ok(!prompts.has(q.prompt), `${at}: โจทย์ซ้ำกับข้ออื่นในชุดเดียวกัน`);
      prompts.add(q.prompt);
    });
  }
});

test("calendar validation rejects impossible dates and accepts leap years", () => {
  for (const value of ["2026-02-29", "2026-04-31", "2026-13-01", "invalid", null]) assert.throws(() => dateStr(value, "date"), { status: 400 });
  for (const value of ["2028-02-29", "2026-12-31"]) assert.equal(dateStr(value, "date"), value);
});
test("numeric fields reject blanks while allowing zero", () => {
  for (const value of ["", "  ", null, false, NaN, Infinity]) assert.throws(() => num(value, "number"), { status: 400 });
  for (const value of [0, "0"]) assert.equal(num(value, "number"), 0);
});
test("password parser preserves exact text", () => {
  const password = "  example password  ";
  const hash = hashSecret(password);
  assert.equal(passwordInput(password), password);
  assert.equal(verifySecret(passwordInput(password), hash), true);
  assert.equal(verifySecret(password.trim(), hash), false);
});
test("Vercel refuses file fallback; isolated storage writes only to its directory", async () => {
  const previous = { VERCEL: process.env.VERCEL, FIREBASE_SERVICE_ACCOUNT: process.env.FIREBASE_SERVICE_ACCOUNT, BUK_DATA_DIR: process.env.BUK_DATA_DIR };
  const dataDir = mkdtempSync(path.join(tmpdir(), "buk-unit-"));
  try {
    delete globalThis.__bukStore;
    process.env.VERCEL = "1";
    process.env.FIREBASE_SERVICE_ACCOUNT = "";
    process.env.BUK_DATA_DIR = dataDir;
    assert.throws(() => getStore(), /FIREBASE_SERVICE_ACCOUNT is required/);
    assert.equal(existsSync(path.join(dataDir, "db.json")), false);
    process.env.VERCEL = "";
    const store = await getStore();
    await store.set("sample", { id: "one", value: 42 });
    assert.equal(JSON.parse(readFileSync(path.join(dataDir, "db.json"), "utf8")).sample.one.value, 42);
    delete globalThis.__bukStore;
    assert.equal((await (await getStore()).get("sample", "one")).value, 42);
  } finally {
    delete globalThis.__bukStore;
    for (const [key, value] of Object.entries(previous)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; }
    if (path.dirname(path.resolve(dataDir)) !== path.resolve(tmpdir()) || !path.basename(dataDir).startsWith("buk-unit-")) throw new Error("Unexpected temporary directory");
    rmSync(dataDir, { recursive: true, force: true });
  }
});

const { visibleExercises, thaiDate } = await import("../src/lib/play-view.ts");
const cards = [
  { id: "done", title: "Animal words", topic: "Animals", subject: "english", count: 3, best: 3, homeworkDue: null },
  { id: "new", title: "บวกเลข", topic: "การบวก", subject: "math", count: 3, best: null, homeworkDue: null },
  { id: "later", title: "ฝึกอ่าน", topic: "สระ", subject: "thai", count: 3, best: 1, homeworkDue: "2026-10-20" },
  { id: "first", title: "บวกเพิ่ม", topic: "การบวก", subject: "math", count: 3, best: 2, homeworkDue: "2026-10-09" },
];
test("exercise filters combine subject, status and search without mutating source", () => {
  const original = JSON.stringify(cards);
  assert.deepEqual(visibleExercises(cards, "math", "new", " การบวก ").map((card) => card.id), ["new"]);
  assert.deepEqual(visibleExercises(cards, "all", "review", "").map((card) => card.id), ["first", "later"]);
  assert.deepEqual(visibleExercises(cards, "all", "homework", "").map((card) => card.id), ["first", "later"]);
  assert.deepEqual(visibleExercises(cards, "all", "all", "ANIMALS").map((card) => card.id), ["done"]);
  assert.equal(visibleExercises(cards, "science", "all", "").length, 0);
  assert.equal(JSON.stringify(cards), original);
});
test("homework order puts earliest deadlines before ordinary exercises", () => {
  assert.deepEqual(visibleExercises(cards, "all", "all", "").slice(0, 2).map((card) => card.id), ["first", "later"]);
  assert.match(thaiDate("2026-10-09"), /2569/);
});
