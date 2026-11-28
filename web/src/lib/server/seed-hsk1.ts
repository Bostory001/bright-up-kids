import "server-only";
import type { Exercise, Question, TeachCard } from "../types";
import { GRAMMAR_SETS, GRAMMAR_UNIT } from "./seed-hsk1-grammar";
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

function grammarExercises(startOrder: number): Draft[] {
  return GRAMMAR_SETS.map((set, i) => {
    const r = rng(9700 + i);
    return {
      title: set.title,
      subject: "chinese" as const,
      grade: HSK_GRADE,
      topic: "ไวยากรณ์ HSK1",
      unit: `HSK1 · ${GRAMMAR_UNIT}`,
      order: startOrder + i,
      teach: set.teach,
      questions: set.items.map(([prompt, answer, a, b, c, explain], qi) => {
        // วางคำตอบหมุนเวียนตำแหน่ง 1-4 (เลื่อนตามชุด) ไม่ให้ตำแหน่งกระจุก · ตัวลวงสุ่มลำดับด้วย seed คงที่
        const choices = shuffle(r, [a, b, c]);
        choices.splice((qi + i) % 4, 0, answer);
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
