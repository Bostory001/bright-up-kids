import "server-only";
import type { Exercise, Question, TeachCard } from "../types";
import { HSK1_EXAMPLES } from "../hsk1-examples";
import { HSK1_LESSONS, type Word } from "../hsk1-words";

// หลักสูตร HSK 1 (新HSK 一级 · 150 คำ) — แบ่งเป็น 15 บทเรียน จัดตามหมวดหมู่ ไม่ใช่ตามตัวอักษร
// ที่มาของคำ+พินอิน: HSK-1-vocab.pdf (ตารางคำศัพท์จีน-ไทย) · ความหมายไทยย่อเอง · ยังไม่ใส่ประโยคตัวอย่าง (รอบถัดไป)
// นำเข้าเป็น "ร่าง" เสมอ ครูต้องตรวจแล้วกดเผยแพร่เอง (กติกา content-reviewer)

type Draft = Omit<Exercise, "id" | "createdAt">;
type Rng = () => number;

/** HSK ไม่ผูกชั้นเรียน — ใส่ ป.4 เป็นค่าตั้งต้น และเปิด openToAll ให้นักเรียนทุกชั้นเห็นเมื่อครูเผยแพร่ */
const HSK_GRADE = 4;

function rng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(r: Rng, list: T[]): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** สร้างข้อ 4 ตัวเลือก: ตัวลวงดึงจากคำอื่นในบทเดียวกัน ตัดตัวที่ซ้ำกับคำตอบ */
function ask(r: Rng, prompt: string, answer: string, pool: string[], explain: string): Question {
  const wrong = shuffle(r, [...new Set(pool)].filter((p) => p !== answer)).slice(0, 3);
  const choices = shuffle(r, [answer, ...wrong]);
  return { prompt, choices, answerIndex: choices.indexOf(answer), explain };
}

function lessonQuestions(r: Rng, words: Word[]): Question[] {
  const qs: Question[] = [];
  words.forEach((w, i) => {
    const note = `${w.zh} (${w.py}) = ${w.th}`;
    qs.push(ask(r, `คำว่า "${w.zh}" แปลว่าอะไร`, w.th, words.map((x) => x.th), note));
    qs.push(ask(r, `"${w.th}" ภาษาจีนคือคำใด`, w.zh, words.map((x) => x.zh), note));
    // ถามพินอินสลับข้อ (คู่ที่พินอินเหมือนกัน เช่น 他/她 ถูกตัดจากตัวลวงอัตโนมัติ)
    if (i % 2 === 0) qs.push(ask(r, `"${w.zh}" อ่านว่าอะไร (พินอิน)`, w.py, words.map((x) => x.py), note));
  });
  return qs;
}

function teachCards(words: Word[]): TeachCard[] {
  const cards: TeachCard[] = [];
  for (let i = 0; i < words.length; i += 2) {
    const pair = words.slice(i, i + 2);
    cards.push({
      title: pair.map((w) => w.zh).join(" · "),
      text: pair.map((w) => `${w.zh}  ${w.py}  =  ${w.th}`).join("\n"),
      example: pair
        .flatMap((w) => (HSK1_EXAMPLES[w.zh] ?? []).slice(0, 1).map((e) => `${e.zh} (${e.py}) = ${e.th}`))
        .join("\n"),
    });
  }
  return cards;
}

type GItem = [prompt: string, answer: string, w1: string, w2: string, w3: string, explain: string];
interface GrammarSet {
  title: string;
  unit: string;
  teach: TeachCard[];
  items: GItem[];
}

// ไวยากรณ์ HSK1 — โจทย์เติมคำ/เรียงประโยค แต่งเองทั้งหมด ใช้เฉพาะคำใน 150 คำ
const GRAMMAR: GrammarSet[] = [
  {
    title: "HSK1 ไวยากรณ์ 1 是 · 不 · 有 · 没有",
    unit: "คำกริยาพื้นฐาน",
    teach: [
      { title: "是 = เป็น / คือ", text: "ใช้เชื่อมคนหรือสิ่งของกับคำนาม  我是学生。 = ฉันเป็นนักเรียน", example: "ปฏิเสธใช้ 不是  他不是老师。 = เขาไม่ใช่ครู" },
      { title: "有 = มี  ·  没有 = ไม่มี", text: "有 ปฏิเสธด้วย 没有 เท่านั้น  ห้ามพูด 不有", example: "我有书。→ 我没有书。" },
    ],
    items: [
      ["我___学生。", "是", "有", "在", "很", "是 เชื่อม 我 กับ 学生 = ฉันเป็นนักเรียน"],
      ["他___是老师。(เขาไม่ใช่ครู)", "不", "没", "很", "吗", "ปฏิเสธ 是 ใช้ 不 → 不是"],
      ["我___一个朋友。(ฉันมีเพื่อนหนึ่งคน)", "有", "是", "在", "不", "有 = มี"],
      ["我___钱。(ฉันไม่มีเงิน)", "没有", "不有", "不是", "没是", "ปฏิเสธ 有 ต้องใช้ 没有 ไม่มี 不有"],
      ["桌子上___书。(บนโต๊ะมีหนังสือ)", "有", "是", "很", "都", "บอกว่าที่ไหนมีอะไร ใช้ 有"],
    ],
  },
  {
    title: "HSK1 ไวยากรณ์ 2 คำถาม 吗 · 呢 · 什么 · 谁 · 几 · 哪儿",
    unit: "ประโยคคำถาม",
    teach: [
      { title: "吗 และ 呢", text: "吗 ต่อท้ายประโยคเพื่อถามว่า ใช่ไหม  你是学生吗？\n呢 ใช้ถามต่อ  我很好，你呢？ = ฉันสบายดี แล้วคุณล่ะ" },
      { title: "คำถามที่ไม่ใช้ 吗", text: "什么 = อะไร · 谁 = ใคร · 几 = กี่ · 哪儿 = ที่ไหน  ใส่ตรงตำแหน่งของคำตอบ  ห้ามเติม 吗 ซ้ำ", example: "你叫什么名字？" },
    ],
    items: [
      ["你是学生___？", "吗", "呢", "了", "的", "ถามว่าใช่ไหม ใช้ 吗 ท้ายประโยค"],
      ["我很好，你___？(แล้วคุณล่ะ)", "呢", "吗", "了", "的", "ถามต่อจากประโยคที่พูดไปแล้ว ใช้ 呢"],
      ["你叫___名字？", "什么", "谁", "几", "哪儿", "ถามชื่อ = 你叫什么名字？"],
      ["___是你的老师？", "谁", "什么", "几", "哪儿", "ถามว่าใคร ใช้ 谁"],
      ["你家有___个人？", "几", "谁", "哪儿", "什么", "ถามจำนวนน้อย ๆ ใช้ 几"],
      ["你住在___？", "哪儿", "谁", "几", "什么", "ถามสถานที่ ใช้ 哪儿"],
    ],
  },
  {
    title: "HSK1 ไวยากรณ์ 3 很 · 太 · 都 · 和",
    unit: "คำขยายและคำเชื่อม",
    teach: [
      { title: "很 และ 太", text: "很 + คำคุณศัพท์ = ...มาก  今天很热。\n太 + คำคุณศัพท์ + 了 = ...เกินไป  太大了！" },
      { title: "都 และ 和", text: "都 = ทั้งหมด วางหน้ากริยา  我们都是学生。\n和 = และ/กับ เชื่อมคำนาม  爸爸和妈妈" },
    ],
    items: [
      ["今天___热。(วันนี้ร้อนมาก)", "很", "是", "有", "吗", "คำคุณศัพท์มักมี 很 นำหน้า ไม่ใช้ 是"],
      ["这个苹果___大了！(ใหญ่เกินไป)", "太", "都", "和", "有", "太...了 = ...เกินไป / ...จริง ๆ"],
      ["我们___是学生。(เราเป็นนักเรียนทุกคน)", "都", "和", "太", "了", "都 = ทั้งหมด วางหน้า 是"],
      ["我有爸爸___妈妈。", "和", "都", "很", "吗", "和 เชื่อมคำนาม 2 คำ = พ่อและแม่"],
    ],
  },
  {
    title: "HSK1 ไวยากรณ์ 4 的 · 了 · 在 · 会",
    unit: "คำช่วยและกริยาช่วย",
    teach: [
      { title: "的 และ 了", text: "的 = ของ  这是我的书。\n了 ต่อท้ายกริยา = ทำเสร็จแล้ว  我吃了。" },
      { title: "在 และ 会", text: "在 = อยู่ที่  爸爸在家。\n会 = ทำเป็น (ทักษะที่เรียนมา)  我会说汉语。" },
    ],
    items: [
      ["这是我___书。(นี่คือหนังสือของฉัน)", "的", "了", "吗", "呢", "แสดงความเป็นเจ้าของใช้ 的"],
      ["我吃___。(ฉันกินแล้ว)", "了", "的", "吗", "呢", "了 ต่อท้ายกริยาแสดงว่าเสร็จแล้ว"],
      ["爸爸___家。(พ่ออยู่บ้าน)", "在", "很", "吗", "的", "บอกว่าอยู่ที่ไหน ใช้ 在"],
      ["我___说汉语。(ฉันพูดภาษาจีนได้)", "会", "的", "了", "吗", "会 = ทำได้เพราะเรียนมา"],
      ["你___写汉字吗？(คุณเขียนอักษรจีนเป็นไหม)", "会", "的", "了", "呢", "ถามว่าทำเป็นไหม ใช้ 会"],
    ],
  },
  {
    title: "HSK1 ไวยากรณ์ 5 เรียงคำเป็นประโยค",
    unit: "ลำดับคำ",
    teach: [
      { title: "ลำดับคำพื้นฐาน", text: "ผู้กระทำ + กริยา + กรรม  我吃苹果。\nคำปฏิเสธ 不 วางหน้ากริยา  我不去。", example: "คำบอกเวลา (今天/明天) มักวางหลังผู้กระทำหรือต้นประโยค" },
    ],
    items: [
      ["เลือกประโยค: ฉันชอบกินแอปเปิล", "我喜欢吃苹果。", "我吃喜欢苹果。", "喜欢我苹果吃。", "苹果我吃喜欢。", "ผู้กระทำ + 喜欢 + กริยา + กรรม"],
      ["เลือกประโยค: เขาไม่ใช่ครู", "他不是老师。", "他是不老师。", "老师不是他。", "他老师不是。", "不 วางหน้า 是"],
      ["เลือกประโยค: วันนี้ฉันไม่ไป", "今天我不去。", "去不今天我。", "今天不我去。", "我去不今天。", "เวลา + ผู้กระทำ + 不 + กริยา"],
      ["เลือกประโยค: คุณชื่ออะไร", "你叫什么名字？", "你什么叫名字？", "叫你什么名字？", "你名字什么叫？", "你 + 叫 + 什么名字"],
      ["เลือกประโยค: ตอนนี้กี่โมง", "现在几点？", "几点现在？", "现在点几？", "几现在点？", "现在 + 几 + 点"],
      ["เลือกประโยค: ฉันอยู่ที่ปักกิ่ง", "我住在北京。", "我在住北京。", "北京住在我。", "我北京住在。", "我 + 住在 + สถานที่"],
    ],
  },
];

function grammarExercises(startOrder: number): Draft[] {
  return GRAMMAR.map((set, i) => {
    const r = rng(9500 + i);
    return {
      title: set.title,
      subject: "chinese" as const,
      grade: HSK_GRADE,
      topic: "ไวยากรณ์ HSK1",
      unit: `HSK1 · ${set.unit}`,
      order: startOrder + i,
      teach: set.teach,
      questions: set.items.map(([prompt, answer, a, b, c, explain]) => {
        const choices = shuffle(r, [answer, a, b, c]);
        return { prompt, choices, answerIndex: choices.indexOf(answer), explain };
      }),
      published: false,
      openToAll: true,
    };
  });
}

export function hsk1Exercises(): Draft[] {
  const lessons: Draft[] = HSK1_LESSONS.map((lesson, i) => ({
    title: lesson.title,
    subject: "chinese" as const,
    grade: HSK_GRADE,
    topic: "คำศัพท์ HSK1",
    unit: `HSK1 · ${lesson.unit}`,
    order: i + 1,
    teach: teachCards(lesson.words),
    questions: lessonQuestions(rng(9100 + i), lesson.words),
    published: false,
    openToAll: true,
  }));
  return [...lessons, ...grammarExercises(HSK1_LESSONS.length + 1)];
}
