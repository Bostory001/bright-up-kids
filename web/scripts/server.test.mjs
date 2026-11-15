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
const { summarizeMonth, summarizeRange, EXPENSE_CATEGORIES, payrollForMonth, courseHours } = await import("../src/lib/finance.ts");
const { overlaps, findConflicts, weeklyGrid } = await import("../src/lib/timetable.ts");

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
test("Vercel and App Hosting refuse file fallback; isolated storage writes only to its directory", async () => {
  const previous = { VERCEL: process.env.VERCEL, K_SERVICE: process.env.K_SERVICE, FIREBASE_SERVICE_ACCOUNT: process.env.FIREBASE_SERVICE_ACCOUNT, BUK_DATA_DIR: process.env.BUK_DATA_DIR };
  const dataDir = mkdtempSync(path.join(tmpdir(), "buk-unit-"));
  try {
    delete globalThis.__bukStore;
    process.env.VERCEL = "1";
    process.env.FIREBASE_SERVICE_ACCOUNT = "";
    process.env.BUK_DATA_DIR = dataDir;
    assert.throws(() => getStore(), /FIREBASE_SERVICE_ACCOUNT is required/);
    assert.equal(existsSync(path.join(dataDir, "db.json")), false);
    process.env.VERCEL = "";
    // Firebase App Hosting (Cloud Run): ไม่มีคีย์ก็ต้องไป Firestore ด้วย ADC ห้ามตกมาเขียนไฟล์
    process.env.K_SERVICE = "web";
    delete globalThis.__bukStore;
    try {
      await getStore();
    } catch {
      // เครื่องนี้ไม่มี ADC จึงต่อไม่ได้ — ถือว่าถูกต้อง ขอแค่ไม่ตกไปใช้ไฟล์
    }
    assert.equal(existsSync(path.join(dataDir, "db.json")), false, "บน App Hosting ต้องไม่เขียนฐานข้อมูลไฟล์");
    process.env.K_SERVICE = "";
    delete globalThis.__bukStore;
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

// กำไรที่คิดผิดทำให้เจ้าของตัดสินใจผิดทั้งเดือน — ของใช้เบ็ดเตล็ดต้องไม่ถูกนับซ้ำ
// และ royalty ที่บันทึกจ่ายแล้วต้องไม่ถูกหักสองรอบ
test("monthly profit counts supplies once and royalty only once", () => {
  const invoices = [
    { id: "a", status: "paid", paidDate: "2026-11-05", amount: 60000 },
    { id: "b", status: "paid", paidDate: "2026-11-20", amount: 40000 },
    { id: "c", status: "paid", paidDate: "2026-10-20", amount: 99999 }, // เดือนอื่น ต้องไม่นับ
    { id: "d", status: "unpaid", amount: 5000 }, // ยังไม่จ่าย ต้องไม่นับ
  ];
  const expenses = [
    { id: "1", date: "2026-11-01", kind: "operating", category: "rent", amount: 12000 },
    { id: "2", date: "2026-11-10", kind: "operating", category: "teacher", amount: 25000 },
    { id: "3", date: "2026-11-12", kind: "supply", category: "office", amount: 600 },
    { id: "4", date: "2026-11-13", kind: "supply", category: "cleaning", amount: 400 },
    { id: "5", date: "2026-10-02", kind: "operating", category: "rent", amount: 12000 }, // เดือนอื่น
  ];
  const m = summarizeMonth("2026-11", invoices, expenses, 23);
  assert.equal(m.revenue, 100000);
  assert.equal(m.operating, 37000);
  assert.equal(m.supply, 1000);
  assert.equal(m.expense, 38000, "รายจ่ายรวมต้องเป็น operating + supply ครั้งเดียว");
  assert.equal(m.royaltyDue, 23000);
  assert.equal(m.royaltyPaid, 0);
  assert.equal(m.profit, 100000 - 38000 - 23000);
  assert.equal(m.byCategory[0].category, "teacher", "หมวดที่จ่ายมากสุดต้องอยู่บนสุด");
  assert.ok(!m.byCategory.some((c) => c.amount === 0), "หมวดที่ไม่มีรายการต้องไม่ขึ้น");

  // บันทึกจ่าย royalty แล้ว: อยู่ในรายจ่ายดำเนินงานแล้ว ห้ามหักซ้ำอีกรอบ
  const withRf = summarizeMonth("2026-11", invoices, [...expenses, { id: "6", date: "2026-11-28", kind: "operating", category: "royalty", amount: 23000 }], 23);
  assert.equal(withRf.royaltyPaid, 23000);
  assert.equal(withRf.expense, 61000);
  assert.equal(withRf.profit, m.profit, "กำไรต้องเท่ากันกับก่อนบันทึกจ่าย royalty");

  // จ่าย royalty เหลื่อมเดือน (จ่ายเกินของเดือนนั้น) ต้องไม่ทำให้กำไรบวมขึ้น
  const over = summarizeMonth("2026-11", invoices, [{ id: "7", date: "2026-11-03", kind: "operating", category: "royalty", amount: 30000 }], 23);
  assert.equal(over.profit, 100000 - 30000);

  const months = summarizeRange("2026-10-01", "2026-11-30", invoices, expenses, 23);
  assert.deepEqual(months.map((x) => x.month), ["2026-11", "2026-10"], "เดือนใหม่ต้องอยู่บนสุด");
  assert.equal(months[1].revenue, 99999);
});

test("every expense category has a label, a kind and an example", () => {
  const labels = new Set();
  for (const [key, c] of Object.entries(EXPENSE_CATEGORIES)) {
    assert.ok(c.label.trim(), `${key}: ไม่มีชื่อหมวด`);
    assert.ok(["operating", "supply"].includes(c.kind), `${key}: kind เพี้ยน`);
    assert.ok(c.example.trim(), `${key}: ไม่มีตัวอย่างรายการ`);
    assert.ok(!labels.has(c.label), `${key}: ชื่อหมวดซ้ำกับหมวดอื่น`);
    labels.add(c.label);
  }
});

// ค่าจ้างครูคิดจากคาบที่เช็กชื่อ — นับซ้ำ 1 คาบต่อคอร์สต่อวัน ไม่ใช่ต่อนักเรียน
test("teacher pay counts one session per course per day", () => {
  assert.equal(courseHours("09:00", "10:30"), 1.5);
  assert.equal(courseHours("10:00", "11:00"), 1);

  const courses = [
    { id: "cA", name: "คณิต ป.2", startTime: "09:00", endTime: "10:30", teacherId: "t1" },
    { id: "cB", name: "อังกฤษ ป.1", startTime: "10:00", endTime: "11:00" }, // ไม่ผูกครู → ใช้คนเช็กชื่อ
  ];
  const attendance = [
    { courseId: "cA", date: "2026-11-07", checkedBy: "t2" }, // ผูกครูไว้แล้ว ต้องเป็นของ t1 ไม่ใช่คนเช็ก
    { courseId: "cA", date: "2026-11-07", checkedBy: "t2" }, // นักเรียนคนที่ 2 ในคาบเดียวกัน ต้องไม่นับเพิ่ม
    { courseId: "cA", date: "2026-11-07", checkedBy: "t2" },
    { courseId: "cA", date: "2026-11-14", checkedBy: "t1" },
    { courseId: "cB", date: "2026-11-08", checkedBy: "t2" },
    { courseId: "cA", date: "2026-10-31", checkedBy: "t1" }, // เดือนอื่น ต้องไม่นับ
    { courseId: "ลบไปแล้ว", date: "2026-11-09", checkedBy: "t1" }, // คอร์สถูกลบ ต้องข้าม ไม่พัง
  ];
  const staff = [
    { id: "t1", displayName: "ครูเอ", hourlyRate: 400 },
    { id: "t2", displayName: "ครูบี" }, // ยังไม่ตั้งอัตรา
  ];

  const pay = payrollForMonth("2026-11", attendance, courses, staff, []);
  const a = pay.find((p) => p.teacherId === "t1");
  const b = pay.find((p) => p.teacherId === "t2");
  assert.equal(a.sessions, 2, "3 นักเรียนในคาบเดียวต้องนับเป็น 1 คาบ");
  assert.equal(a.hours, 3);
  assert.equal(a.amount, 1200);
  assert.equal(a.paid, false);
  assert.equal(b.sessions, 1, "คอร์สที่ไม่ผูกครู ต้องเป็นของคนที่เช็กชื่อ");
  assert.equal(b.hours, 1);
  assert.equal(b.amount, 0, "ยังไม่ตั้งอัตรา ต้องได้ 0 ไม่ใช่ NaN");

  // บันทึกจ่ายแล้วต้องขึ้นสถานะ paid พร้อมยอดที่จ่ายจริง (อาจต่างจากที่คำนวณ เช่นหักลา)
  const paid = payrollForMonth("2026-11", attendance, courses, staff, [
    { id: "e1", date: "2026-11-30", kind: "operating", category: "teacher", amount: 1100, payrollRef: "t1:2026-11" },
  ]);
  const a2 = paid.find((p) => p.teacherId === "t1");
  assert.equal(a2.paid, true);
  assert.equal(a2.paidAmount, 1100);
});

// ตารางชนกันแล้วไม่เตือน = ครูไปโผล่สองห้องพร้อมกันในวันเปิดเรียน
test("timetable flags teacher and room clashes but not back-to-back classes", () => {
  assert.equal(overlaps({ startTime: "09:00", endTime: "10:30" }, { startTime: "10:00", endTime: "11:00" }), true);
  assert.equal(overlaps({ startTime: "09:00", endTime: "10:30" }, { startTime: "10:30", endTime: "12:00" }), false, "คาบติดกันพอดีไม่ถือว่าชน");
  assert.equal(overlaps({ startTime: "09:00", endTime: "10:00" }, { startTime: "08:00", endTime: "09:30" }), true);

  const base = { subject: "math", grades: [1], pricePerTerm: 0, capacity: 10, active: true };
  const courses = [
    { ...base, id: "c1", name: "คณิต เสาร์เช้า", weekday: 6, startTime: "09:00", endTime: "10:30", teacherId: "t1", room: "ห้อง 1" },
    { ...base, id: "c2", name: "อังกฤษ เสาร์เช้า", weekday: 6, startTime: "10:00", endTime: "11:00", teacherId: "t1", room: "ห้อง 2" },
    { ...base, id: "c3", name: "ไทย เสาร์สาย", weekday: 6, startTime: "10:30", endTime: "12:00", teacherId: "t2", room: "ห้อง 1" },
    { ...base, id: "c4", name: "วิทย์ อาทิตย์", weekday: 0, startTime: "09:00", endTime: "10:30", teacherId: "t1", room: "ห้อง 1" },
    { ...base, id: "c5", name: "คอร์สปิดแล้ว", weekday: 6, startTime: "09:00", endTime: "10:30", teacherId: "t1", room: "ห้อง 1", active: false },
  ];
  const names = { t1: "ครูเอ", t2: "ครูบี" };
  const conflicts = findConflicts(courses, (id) => names[id] ?? "");

  assert.equal(conflicts.length, 1, JSON.stringify(conflicts));
  assert.equal(conflicts[0].kind, "teacher");
  assert.equal(conflicts[0].who, "ครูเอ");
  assert.deepEqual(conflicts[0].courses, ["คณิต เสาร์เช้า", "อังกฤษ เสาร์เช้า"]);
  assert.ok(!conflicts.some((c) => c.courses.includes("คอร์สปิดแล้ว")), "คอร์สที่ปิดรับแล้วต้องไม่ถูกนับว่าชน");
  assert.ok(!conflicts.some((c) => c.courses.includes("วิทย์ อาทิตย์")), "คนละวันต้องไม่ชน");

  // ห้องเดียวกันซ้อนเวลา ต้องเตือนแม้คนละครู
  const roomClash = findConflicts(
    [courses[0], { ...courses[2], startTime: "10:00" }],
    (id) => names[id] ?? "",
  );
  assert.equal(roomClash.length, 1);
  assert.equal(roomClash[0].kind, "room");
  assert.equal(roomClash[0].who, "ห้อง 1");

  const grid = weeklyGrid(courses.filter((c) => c.active).map((c) => ({ ...c, teacherName: names[c.teacherId], enrolled: 0 })));
  assert.equal(grid[0].length, 1, "อาทิตย์มี 1 คาบ");
  assert.equal(grid[6].length, 3, "เสาร์มี 3 คาบ");
  assert.deepEqual(grid[6].map((c) => c.startTime), ["09:00", "10:00", "10:30"], "ต้องเรียงตามเวลาเริ่ม");
});
