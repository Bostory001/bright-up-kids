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
const { summarizeMonth, summarizeRange, EXPENSE_CATEGORIES, payrollForMonth, courseHours, budgetStatus } = await import("../src/lib/finance.ts");
const { overlaps, findConflicts, weeklyGrid } = await import("../src/lib/timetable.ts");
const { percent, progressOf, averageGain } = await import("../src/lib/assessment.ts");
const { stockOf, stockLines } = await import("../src/lib/supplies.ts");
const { quotaOf, paidFromRemaining } = await import("../src/lib/quota.ts");
const { sessionDates, courseProgress, monthGrid, addDays } = await import("../src/lib/schedule.ts");
const { gradeLabel, gradeRange, GRADES, SUBJECT_KEYS, gradeLabelEn, gradeRangeEn, SUBJECT_EN } = await import("../src/lib/grade.ts");

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

// พัฒนาการต้องเทียบเป็นเปอร์เซ็นต์ เพราะข้อสอบก่อน-หลังคะแนนเต็มไม่เท่ากัน
test("progress compares pre and post as percentages, not raw scores", () => {
  assert.equal(percent(15, 20), 75);
  assert.equal(percent(30, 50), 60);
  assert.equal(percent(1, 3), 33.3);
  assert.equal(percent(5, 0), null, "คะแนนเต็ม 0 ต้องไม่หารศูนย์");

  const a = [
    { id: "1", studentId: "s1", kind: "pre", date: "2026-08-01", score: 9, maxScore: 20 }, // 45%
    { id: "2", studentId: "s1", kind: "progress", date: "2026-09-15", score: 13, maxScore: 20 },
    { id: "3", studentId: "s1", kind: "post", date: "2026-10-30", score: 40, maxScore: 50 }, // 80% คนละคะแนนเต็ม
    { id: "4", studentId: "s2", kind: "pre", date: "2026-08-01", score: 18, maxScore: 20 },
    { id: "5", studentId: "s3", kind: "pre", date: "2026-08-02", score: 10, maxScore: 20 },
    { id: "6", studentId: "s3", kind: "post", date: "2026-10-30", score: 8, maxScore: 20 }, // แย่ลง
  ];

  const p1 = progressOf("s1", a);
  assert.equal(p1.prePercent, 45);
  assert.equal(p1.postPercent, 80);
  assert.equal(p1.gain, 35, "9/20 → 40/50 คือ +35 จุด ไม่ใช่ +31 คะแนน");
  assert.equal(p1.count, 3);
  assert.equal(p1.latest.id, "3", "ล่าสุดต้องดูจากวันที่ ไม่ใช่ลำดับในอาร์เรย์");

  const p2 = progressOf("s2", a);
  assert.equal(p2.gain, null, "มีแต่ก่อนเรียน ยังสรุปพัฒนาการไม่ได้");
  assert.equal(progressOf("ไม่มีคนนี้", a).count, 0);

  // ใบ pre หลายครั้ง ต้องยึดใบแรกสุดเป็นจุดเริ่มต้น
  const twoPre = progressOf("s1", [...a, { id: "7", studentId: "s1", kind: "pre", date: "2026-09-01", score: 12, maxScore: 20 }]);
  assert.equal(twoPre.prePercent, 45);

  const avg = averageGain([p1, p2, progressOf("s3", a)]);
  assert.equal(avg.counted, 2, "คนที่มีแต่ก่อนเรียนต้องไม่ถูกนับในค่าเฉลี่ย");
  assert.equal(avg.improved, 1);
  assert.equal(avg.average, 12.5, "(+35 และ -10) / 2");
});

// ผู้ปกครองวางแผนจากตัวเลขนี้ — นับสัปดาห์ผิดคือบอกวันจบคอร์สผิด
test("course runs weekly from its start date and counts weeks left", () => {
  assert.equal(addDays("2026-11-28", 7), "2026-12-05", "ข้ามสิ้นเดือนต้องไม่เพี้ยน");
  assert.equal(addDays("2026-12-28", 7), "2027-01-04", "ข้ามปีต้องไม่เพี้ยน");

  const course = { startDate: "2026-10-03", weeks: 12 }; // เสาร์
  const dates = sessionDates(course);
  assert.equal(dates.length, 12);
  assert.equal(dates[0], "2026-10-03");
  assert.equal(dates[11], "2026-12-19");
  assert.ok(dates.every((d) => new Date(`${d}T00:00:00.000Z`).getUTCDay() === 6), "ทุกคาบต้องเป็นวันเสาร์");

  const mid = courseProgress(course, "2026-11-15");
  assert.equal(mid.planned, true);
  assert.equal(mid.done, 7, "ถึง 15 พ.ย. เรียนไปแล้ว 7 คาบ");
  assert.equal(mid.left, 5);
  assert.equal(mid.endDate, "2026-12-19");
  assert.equal(mid.nextDate, "2026-11-21");
  assert.equal(mid.finished, false);

  const onSessionDay = courseProgress(course, "2026-10-03");
  assert.equal(onSessionDay.done, 1, "วันเรียนวันแรกนับเป็นเรียนแล้ว");
  assert.equal(onSessionDay.nextDate, "2026-10-03", "คาบถัดไปคือวันนี้");

  const after = courseProgress(course, "2027-01-01");
  assert.equal(after.finished, true);
  assert.equal(after.left, 0);
  assert.equal(after.nextDate, undefined);

  assert.equal(courseProgress({}, "2026-11-15").planned, false, "ยังไม่ตั้งวันเริ่ม ต้องไม่เดา");
  assert.equal(sessionDates({ startDate: "2026-10-03" }).length, 0);

  // ปฏิทินเดือน: ช่องว่างหน้า-หลัง และจำนวนช่องต้องหารด้วย 7 ลงตัว
  const grid = monthGrid("2026-11"); // 1 พ.ย. 2026 เป็นวันอาทิตย์ · ปฏิทินเริ่มวันจันทร์ จึงเว้น 6 ช่องก่อน
  assert.equal(grid.length % 7, 0);
  assert.equal(grid[6], "2026-11-01");
  assert.equal(grid[0], null);
  assert.equal(grid.filter(Boolean).length, 30);
  const feb = monthGrid("2028-02"); // ปีอธิกสุรทิน
  assert.equal(feb.filter(Boolean).length, 29);
});

// งบที่ไม่ได้ตั้ง ต้องไม่ถูกมองว่าเป็นงบ 0 ไม่งั้นทุกหมวดจะขึ้นแดงตั้งแต่วันแรก
test("budget compares only the categories the owner chose to cap", () => {
  const invoices = [{ id: "a", status: "paid", paidDate: "2026-11-05", amount: 100000 }];
  const expenses = [
    { id: "1", date: "2026-11-01", kind: "operating", category: "rent", amount: 12000 },
    { id: "2", date: "2026-11-10", kind: "operating", category: "teacher", amount: 26000 },
    { id: "3", date: "2026-11-12", kind: "supply", category: "office", amount: 900 },
    { id: "4", date: "2026-11-14", kind: "operating", category: "marketing", amount: 3000 },
  ];
  const summary = summarizeMonth("2026-11", invoices, expenses, 23);
  const status = budgetStatus(summary, { rent: 12000, teacher: 25000, office: 2000 }, 50000);

  const line = (c) => status.lines.find((l) => l.category === c);
  assert.equal(line("teacher").over, true, "จ่าย 26,000 จากงบ 25,000 ต้องขึ้นเกินงบ");
  assert.equal(line("teacher").left, -1000);
  assert.equal(line("rent").over, false, "จ่ายเท่างบพอดี ยังไม่ถือว่าเกิน");
  assert.equal(line("rent").usedPercent, 100);
  assert.equal(line("office").usedPercent, 45);
  assert.equal(line("marketing").budget, null, "หมวดที่ไม่ได้ตั้งงบต้องเป็น null ไม่ใช่ 0");
  assert.equal(line("marketing").over, false, "หมวดที่ไม่ได้ตั้งงบต้องไม่ขึ้นเกินงบ");
  assert.equal(status.overCount, 1);
  assert.equal(status.warnCount, 1, "ค่าเช่าใช้ 100% นับเป็นใกล้เต็มงบ");
  assert.equal(status.budgetTotal, 39000);
  assert.equal(status.spentBudgeted, 38900);
  assert.equal(status.spentUnbudgeted, 3000);
  assert.ok(!status.lines.some((l) => l.budget === null && l.spent === 0), "หมวดที่ไม่มีทั้งงบและรายจ่าย ต้องไม่รกตาราง");

  // เป้ากำไร
  assert.equal(status.profit, summary.profit);
  assert.equal(status.targetPercent, Math.round((summary.profit / 50000) * 1000) / 10);
  assert.equal(budgetStatus(summary, {}, 0).targetPercent, null, "ยังไม่ตั้งเป้า ต้องไม่หารศูนย์");
  assert.equal(budgetStatus(summary, {}, 0).lines.every((l) => l.budget === null), true);
});

// ของคงเหลือคิดจากรับเข้า-เบิกออกเสมอ ไม่เก็บตัวเลขนิ่ง ๆ ที่จะเพี้ยนเมื่อแก้รายจ่ายย้อนหลัง
test("supply stock sums movements and flags low items", () => {
  const item = { id: "paper", name: "กระดาษ A4", unit: "รีม", category: "office", minQty: 2, createdAt: "" };
  const moves = [
    { id: "exp-1", itemId: "paper", date: "2026-10-20", kind: "in", qty: 5, expenseId: "1" },
    { id: "m2", itemId: "paper", date: "2026-11-01", kind: "out", qty: 1 },
    { id: "m3", itemId: "paper", date: "2026-11-10", kind: "out", qty: 2 },
    { id: "m4", itemId: "อื่น", date: "2026-11-10", kind: "out", qty: 99 }, // ของชิ้นอื่น ต้องไม่ปน
  ];
  const line = stockOf(item, moves, "2026-11-15");
  assert.equal(line.totalIn, 5);
  assert.equal(line.totalOut, 3);
  assert.equal(line.qty, 2);
  assert.equal(line.low, true, "เหลือ 2 เท่ากับจุดเตือน ต้องนับว่าใกล้หมด");
  assert.equal(line.usedLast30, 3, "เบิก 1+2 ใน 30 วันล่าสุด");
  assert.equal(line.daysLeft, 20, "เหลือ 2 รีม ใช้วันละ 0.1 รีม = 20 วัน");
  assert.equal(line.lastMoveDate, "2026-11-10");

  // ลบรายจ่ายที่ซื้อเข้ามา = ลบ move ทิ้ง ของต้องลดลงทันที ไม่ต้องไปแก้ตัวเลขที่ไหนอีก
  const afterDelete = stockOf(item, moves.filter((m) => m.id !== "exp-1"), "2026-11-15");
  assert.equal(afterDelete.qty, -3, "ของติดลบแปลว่ามีคนเบิกของที่ไม่เคยบันทึกซื้อ — ต้องเห็นได้ ไม่ใช่ซ่อนเป็น 0");

  const noUse = stockOf({ ...item, minQty: undefined }, [{ id: "a", itemId: "paper", date: "2026-01-01", kind: "in", qty: 10 }], "2026-11-15");
  assert.equal(noUse.daysLeft, null, "ยังไม่เคยเบิก ต้องไม่เดาว่าจะหมดเมื่อไร");
  assert.equal(noUse.low, false, "ไม่ได้ตั้งจุดเตือน ต้องไม่ขึ้นใกล้หมด");

  const lines = stockLines([{ ...item, id: "b", name: "ทิชชู", minQty: 0 }, item], moves, "2026-11-15");
  assert.equal(lines[0].item.name, "กระดาษ A4", "ของใกล้หมดต้องอยู่บนสุด");
});

// ชั้นเรียนขยายถึง ม.3 — ที่ไหนเขียน "ป." ทับเองจะแสดงผิดทันทีเมื่อมีนักเรียน ม.ต้น
test("grade labels cover primary and lower secondary", () => {
  assert.equal(gradeLabel(1), "ป.1");
  assert.equal(gradeLabel(6), "ป.6");
  assert.equal(gradeLabel(7), "ม.1");
  assert.equal(gradeLabel(9), "ม.3");
  assert.deepEqual([...GRADES], [1, 2, 3, 4, 5, 6, 7, 8, 9]);
  assert.equal(gradeRange([1, 2, 3]), "ป.1-ป.3", "ช่วงต่อเนื่องย่อเป็นช่วง");
  assert.equal(gradeRange([4, 5, 6, 7, 8, 9]), "ป.4-ม.3", "ข้ามจาก ป. ไป ม. ได้");
  assert.equal(gradeRange([1, 6]), "ป.1, ป.6", "ไม่ต่อเนื่องให้ขึ้นทีละชั้น");
  assert.equal(gradeRange([9, 7, 8]), "ม.1-ม.3", "เรียงให้เองก่อนย่อ");
  assert.equal(gradeRange([]), "-");
  assert.ok(SUBJECT_KEYS.includes("chinese"), "ต้องมีภาษาจีนในรายการวิชา");
  assert.equal(SUBJECT_KEYS.length, 5);

  // ฉบับภาษาอังกฤษสำหรับใบตารางสอนของครูต่างชาติ
  assert.equal(gradeLabelEn(3), "P.3");
  assert.equal(gradeLabelEn(8), "M.2");
  assert.equal(gradeRangeEn([1, 2, 3]), "P.1-P.3");
  assert.equal(gradeRangeEn([5, 9]), "P.5, M.3");
  assert.equal(SUBJECT_EN.chinese, "Chinese");
  assert.equal(Object.keys(SUBJECT_EN).length, SUBJECT_KEYS.length, "วิชาใหม่ต้องมีชื่ออังกฤษด้วยเสมอ");
});

// คาบคงเหลือเป็นรายคน ไม่ใช่รายคอร์ส — ในคอร์สเดียวกันแต่ละคนซื้อคนละแพ็ก
test("session quota counts per student and only for classes they attended", () => {
  const attendance = [
    { studentId: "a", courseId: "c1", status: "present" },
    { studentId: "a", courseId: "c1", status: "late" },   // มาสายก็นับว่าใช้คาบ
    { studentId: "a", courseId: "c1", status: "absent" }, // ขาด ไม่ตัดคาบ
    { studentId: "a", courseId: "c1", status: "leave" },  // ลา ไม่ตัดคาบ
    { studentId: "a", courseId: "c2", status: "present" },// คนละคอร์ส ไม่นับ
    { studentId: "b", courseId: "c1", status: "present" },// คนละคน ไม่นับ
  ];
  const a = quotaOf({ studentId: "a", courseId: "c1", sessionsPaid: 6 }, attendance);
  assert.equal(a.used, 2, "มา + สาย = ใช้ไป 2 คาบ");
  assert.equal(a.left, 4);
  assert.equal(a.low, false);
  assert.equal(a.finished, false);

  const b = quotaOf({ studentId: "b", courseId: "c1", sessionsPaid: 2 }, attendance);
  assert.equal(b.left, 1, "คนละคนในคอร์สเดียวกัน เหลือไม่เท่ากัน");
  assert.equal(b.low, true, "เหลือ 1 คาบ ต้องเตือนให้ต่อคอร์ส");

  const none = quotaOf({ studentId: "a", courseId: "c1" }, attendance);
  assert.equal(none.paid, null, "ไม่ได้ตั้งแพ็ก = ไม่จำกัดคาบ");
  assert.equal(none.left, null);
  assert.equal(none.low, false, "ไม่จำกัดคาบต้องไม่ขึ้นเตือนว่าใกล้หมด");

  const done = quotaOf({ studentId: "a", courseId: "c1", sessionsPaid: 2 }, attendance);
  assert.equal(done.left, 0);
  assert.equal(done.finished, true);

  // ครูกรอกว่า "เหลือ 4" ทั้งที่มาเรียนไปแล้ว 2 → แปลว่าซื้อมา 6
  assert.equal(paidFromRemaining(4, 2), 6);
  assert.equal(paidFromRemaining(0, 3), 3);
  assert.equal(paidFromRemaining(-5, 1), 0, "ติดลบต้องกลายเป็น 0 ไม่ใช่ค่าติดลบ");
});
