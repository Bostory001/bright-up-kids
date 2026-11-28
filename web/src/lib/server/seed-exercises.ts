import "server-only";
import type { Exercise, Grade, Question, Subject } from "../types";
import { hsk1Exercises } from "./seed-hsk1";

// ชุดโจทย์เริ่มต้น — แต่งขึ้นเองทั้งหมด ไม่ได้คัดลอกจากหนังสือหรือเอกสารของ HQ
// คณิต: สุ่มตัวเลขด้วย seed คงที่ (ได้ชุดเดิมทุกครั้ง) คำตอบคำนวณจากสูตร จึงถูกโดยโครงสร้าง
// อังกฤษ/ไทย: สร้างจากรายการคู่คำด้านล่าง · วิทย์: เขียนมือ
// นำเข้าเป็น "ร่าง" เสมอ ครูต้องตรวจแล้วกดเผยแพร่เอง

type Draft = Omit<Exercise, "id" | "createdAt">;
type Rng = () => number;

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
const int = (r: Rng, min: number, max: number) => min + Math.floor(r() * (max - min + 1));
const pick = <T>(r: Rng, list: readonly T[]) => list[int(r, 0, list.length - 1)];
function shuffle<T>(r: Rng, list: T[]): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = int(r, 0, i);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function withChoices(r: Rng, prompt: string, answer: string, wrong: string[]): Question {
  const choices = shuffle(r, [answer, ...wrong.slice(0, 3)]);
  return { prompt, choices, answerIndex: choices.indexOf(answer) };
}

// โจทย์ตัวเลข: ตัวลวงคือคำตอบที่คลาดไปเล็กน้อย
function numeric(r: Rng, prompt: string, answer: number, fmt: (n: number) => string = String): Question {
  const wrong: number[] = [];
  for (const off of shuffle(r, [1, -1, 2, -2, 10, -10, 5, -5, 3])) {
    const v = answer + off;
    if (v >= 0 && !wrong.includes(v)) wrong.push(v);
    if (wrong.length === 3) break;
  }
  return withChoices(r, prompt, fmt(answer), wrong.map(fmt));
}

const tenths = (n: number) => (n / 10).toFixed(1);
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);

interface MathSpec {
  grade: Grade;
  title: string;
  topic: string;
  make: (r: Rng) => Question;
}

const MATH: MathSpec[] = [
  { grade: 1, title: "บวกเลขไม่เกิน 10", topic: "การบวก", make: (r) => { const a = int(r, 1, 5), b = int(r, 1, 5); return numeric(r, `${a} + ${b} = ?`, a + b); } },
  { grade: 1, title: "ลบเลขไม่เกิน 10", topic: "การลบ", make: (r) => { const a = int(r, 5, 10), b = int(r, 1, a - 1); return numeric(r, `${a} − ${b} = ?`, a - b); } },
  { grade: 1, title: "บวกเลขไม่เกิน 20", topic: "การบวก", make: (r) => { const a = int(r, 6, 12), b = int(r, 3, 8); return numeric(r, `${a} + ${b} = ?`, a + b); } },
  { grade: 1, title: "ลบเลขไม่เกิน 20", topic: "การลบ", make: (r) => { const a = int(r, 11, 20), b = int(r, 2, 9); return numeric(r, `${a} − ${b} = ?`, a - b); } },
  { grade: 1, title: "จำนวนที่หายไป", topic: "แบบรูป", make: (r) => { const s = int(r, 1, 10), k = pick(r, [1, 2, 5]); return numeric(r, `${s}, ${s + k}, ${s + 2 * k}, __ จำนวนถัดไปคืออะไร`, s + 3 * k); } },

  { grade: 2, title: "บวกเลขสองหลัก", topic: "การบวก", make: (r) => { const a = int(r, 11, 60), b = int(r, 11, 39); return numeric(r, `${a} + ${b} = ?`, a + b); } },
  { grade: 2, title: "ลบเลขสองหลัก", topic: "การลบ", make: (r) => { const a = int(r, 40, 99), b = int(r, 11, 39); return numeric(r, `${a} − ${b} = ?`, a - b); } },
  { grade: 2, title: "สูตรคูณแม่ 2-5", topic: "การคูณ", make: (r) => { const a = int(r, 2, 5), b = int(r, 2, 12); return numeric(r, `${a} × ${b} = ?`, a * b); } },
  { grade: 2, title: "สูตรคูณแม่ 6-9", topic: "การคูณ", make: (r) => { const a = int(r, 6, 9), b = int(r, 2, 12); return numeric(r, `${a} × ${b} = ?`, a * b); } },
  { grade: 2, title: "หารลงตัว", topic: "การหาร", make: (r) => { const d = int(r, 2, 5), q = int(r, 2, 10); return numeric(r, `${d * q} ÷ ${d} = ?`, q); } },

  { grade: 3, title: "บวกเลขสามหลัก", topic: "การบวก", make: (r) => { const a = int(r, 100, 600), b = int(r, 100, 399); return numeric(r, `${a} + ${b} = ?`, a + b); } },
  { grade: 3, title: "ลบเลขสามหลัก", topic: "การลบ", make: (r) => { const a = int(r, 500, 999), b = int(r, 100, 499); return numeric(r, `${a} − ${b} = ?`, a - b); } },
  { grade: 3, title: "คูณสองหลักกับหนึ่งหลัก", topic: "การคูณ", make: (r) => { const a = int(r, 11, 40), b = int(r, 2, 9); return numeric(r, `${a} × ${b} = ?`, a * b); } },
  { grade: 3, title: "หารสองหลัก", topic: "การหาร", make: (r) => { const d = int(r, 3, 9), q = int(r, 4, 12); return numeric(r, `${d * q} ÷ ${d} = ?`, q); } },
  { grade: 3, title: "ครึ่งหนึ่งของจำนวน", topic: "เศษส่วน", make: (r) => { const n = int(r, 5, 49) * 2; return numeric(r, `ครึ่งหนึ่งของ ${n} คือเท่าไร`, n / 2); } },

  { grade: 4, title: "บวกเลขหลักพัน", topic: "การบวก", make: (r) => { const a = int(r, 1000, 5000), b = int(r, 1000, 4000); return numeric(r, `${a.toLocaleString("en")} + ${b.toLocaleString("en")} = ?`, a + b, (n) => n.toLocaleString("en")); } },
  { grade: 4, title: "คูณสองหลักกับสองหลัก", topic: "การคูณ", make: (r) => { const a = int(r, 11, 30), b = int(r, 11, 25); return numeric(r, `${a} × ${b} = ?`, a * b); } },
  { grade: 4, title: "หารเลขสามหลัก", topic: "การหาร", make: (r) => { const d = int(r, 3, 9), q = int(r, 20, 99); return numeric(r, `${d * q} ÷ ${d} = ?`, q); } },
  { grade: 4, title: "บวกทศนิยมหนึ่งตำแหน่ง", topic: "ทศนิยม", make: (r) => { const a = int(r, 11, 89), b = int(r, 11, 89); return numeric(r, `${tenths(a)} + ${tenths(b)} = ?`, a + b, tenths); } },
  { grade: 4, title: "ความยาวรอบรูปสี่เหลี่ยมผืนผ้า", topic: "เรขาคณิต", make: (r) => { const w = int(r, 2, 9), l = w + int(r, 1, 8); return numeric(r, `สี่เหลี่ยมผืนผ้ากว้าง ${w} ซม. ยาว ${l} ซม. มีความยาวรอบรูปกี่ ซม.`, 2 * (w + l)); } },

  { grade: 5, title: "ร้อยละของจำนวน", topic: "ร้อยละ", make: (r) => { const p = pick(r, [10, 20, 25, 50, 75]), n = int(r, 1, 20) * 20; return numeric(r, `${p}% ของ ${n} เท่ากับเท่าไร`, (n * p) / 100); } },
  { grade: 5, title: "พื้นที่สี่เหลี่ยมผืนผ้า", topic: "เรขาคณิต", make: (r) => { const w = int(r, 3, 12), l = w + int(r, 1, 8); return numeric(r, `สี่เหลี่ยมผืนผ้ากว้าง ${w} ซม. ยาว ${l} ซม. มีพื้นที่กี่ ตร.ซม.`, w * l); } },
  { grade: 5, title: "ค่าเฉลี่ย", topic: "สถิติ", make: (r) => { const avg = int(r, 10, 40), d = int(r, 1, 8); const nums = [avg - d, avg, avg + d]; return numeric(r, `ค่าเฉลี่ยของ ${nums.join(", ")} คือเท่าไร`, avg); } },
  { grade: 5, title: "คูณทศนิยมกับจำนวนนับ", topic: "ทศนิยม", make: (r) => { const a = int(r, 11, 49), k = int(r, 2, 9); return numeric(r, `${tenths(a)} × ${k} = ?`, a * k, tenths); } },
  { grade: 5, title: "บวกเศษส่วนตัวส่วนเท่ากัน", topic: "เศษส่วน", make: (r) => {
    const d = int(r, 5, 12), a = int(r, 1, d - 3), b = int(r, 1, d - a - 1);
    const answer = `${a + b}/${d}`;
    const wrong = [`${a + b}/${2 * d}`, `${a + b + 1}/${d}`, `${a * b}/${d}`, `${a + b}/${d + 1}`].filter((w, i, all) => w !== answer && all.indexOf(w) === i);
    return withChoices(r, `${a}/${d} + ${b}/${d} = ?`, answer, wrong);
  } },

  { grade: 6, title: "ห.ร.ม.", topic: "ตัวประกอบ", make: (r) => { const g = int(r, 2, 9); let m = int(r, 2, 7), n = int(r, 2, 7); while (gcd(m, n) !== 1) { m = int(r, 2, 7); n = int(r, 2, 7); } return numeric(r, `ห.ร.ม. ของ ${g * m} และ ${g * n} คือเท่าไร`, g); } },
  { grade: 6, title: "ค.ร.น.", topic: "ตัวประกอบ", make: (r) => { const a = int(r, 2, 12); let b = int(r, 2, 12); while (b === a) b = int(r, 2, 12); return numeric(r, `ค.ร.น. ของ ${a} และ ${b} คือเท่าไร`, (a * b) / gcd(a, b)); } },
  { grade: 6, title: "ราคาหลังลด", topic: "ร้อยละ", make: (r) => { const price = int(r, 2, 20) * 100, p = pick(r, [10, 20, 25, 50]); return numeric(r, `สินค้าราคา ${price.toLocaleString("en")} บาท ลดราคา ${p}% ต้องจ่ายกี่บาท`, (price * (100 - p)) / 100, (n) => n.toLocaleString("en")); } },
  { grade: 6, title: "พื้นที่สามเหลี่ยม", topic: "เรขาคณิต", make: (r) => { const b = int(r, 2, 10) * 2, h = int(r, 3, 12); return numeric(r, `สามเหลี่ยมฐานยาว ${b} ซม. สูง ${h} ซม. มีพื้นที่กี่ ตร.ซม.`, (b * h) / 2); } },
  { grade: 6, title: "อัตราส่วนที่เท่ากัน", topic: "อัตราส่วน", make: (r) => { const a = int(r, 2, 9); let b = int(r, 2, 9); while (b === a) b = int(r, 2, 9); const k = int(r, 2, 6); return numeric(r, `${a} : ${b} = ? : ${b * k}`, a * k); } },
];

function mathSets(): Draft[] {
  return MATH.map((spec, i) => {
    const r = rng(1000 + i);
    const questions: Question[] = [];
    for (let tries = 0; questions.length < 10 && tries < 200; tries++) {
      const q = spec.make(r);
      if (q.choices.length === 4 && !questions.some((x) => x.prompt === q.prompt)) questions.push(q);
    }
    return { title: spec.title, subject: "math", grade: spec.grade, topic: spec.topic, questions, published: false };
  });
}

// ---------- ชุดจับคู่คำ (อังกฤษ / ไทย) ----------

interface PairSet {
  grade: Grade;
  subject: Subject;
  title: string;
  topic: string;
  ask: (word: string) => string;
  pairs: [string, string][];
}

const meaning = (w: string) => `คำว่า "${w}" แปลว่าอะไร`;
const opposite = (w: string) => `คำใดมีความหมายตรงข้ามกับ "${w}"`;
const classifier = (w: string) => `ลักษณนามของ "${w}" คือคำใด`;
const synonym = (w: string) => `คำใดมีความหมายเหมือน "${w}"`;
const past = (w: string) => `รูปอดีต (past tense) ของ "${w}" คือคำใด`;

const PAIR_SETS: PairSet[] = [
  { grade: 1, subject: "english", title: "Animals สัตว์", topic: "คำศัพท์", ask: meaning, pairs: [["cat", "แมว"], ["dog", "สุนัข"], ["bird", "นก"], ["fish", "ปลา"], ["cow", "วัว"], ["pig", "หมู"], ["duck", "เป็ด"], ["ant", "มด"]] },
  { grade: 1, subject: "english", title: "Colors สี", topic: "คำศัพท์", ask: meaning, pairs: [["red", "สีแดง"], ["blue", "สีน้ำเงิน"], ["green", "สีเขียว"], ["yellow", "สีเหลือง"], ["black", "สีดำ"], ["white", "สีขาว"], ["pink", "สีชมพู"], ["orange", "สีส้ม"]] },
  { grade: 1, subject: "english", title: "Numbers ตัวเลข", topic: "คำศัพท์", ask: meaning, pairs: [["one", "หนึ่ง"], ["two", "สอง"], ["three", "สาม"], ["four", "สี่"], ["five", "ห้า"], ["six", "หก"], ["seven", "เจ็ด"], ["eight", "แปด"]] },
  { grade: 2, subject: "english", title: "Fruits ผลไม้", topic: "คำศัพท์", ask: meaning, pairs: [["apple", "แอปเปิล"], ["banana", "กล้วย"], ["mango", "มะม่วง"], ["orange", "ส้ม"], ["grape", "องุ่น"], ["watermelon", "แตงโม"], ["papaya", "มะละกอ"], ["pineapple", "สับปะรด"]] },
  { grade: 2, subject: "english", title: "My Body ร่างกาย", topic: "คำศัพท์", ask: meaning, pairs: [["head", "ศีรษะ"], ["hand", "มือ"], ["foot", "เท้า"], ["eye", "ตา"], ["ear", "หู"], ["nose", "จมูก"], ["mouth", "ปาก"], ["leg", "ขา"]] },
  { grade: 2, subject: "english", title: "Family ครอบครัว", topic: "คำศัพท์", ask: meaning, pairs: [["father", "พ่อ"], ["mother", "แม่"], ["brother", "พี่ชายหรือน้องชาย"], ["sister", "พี่สาวหรือน้องสาว"], ["grandfather", "ปู่หรือตา"], ["grandmother", "ย่าหรือยาย"], ["baby", "ทารก"], ["friend", "เพื่อน"]] },
  { grade: 3, subject: "english", title: "At School ที่โรงเรียน", topic: "คำศัพท์", ask: meaning, pairs: [["book", "หนังสือ"], ["pencil", "ดินสอ"], ["ruler", "ไม้บรรทัด"], ["eraser", "ยางลบ"], ["bag", "กระเป๋า"], ["desk", "โต๊ะเรียน"], ["chair", "เก้าอี้"], ["teacher", "ครู"]] },
  { grade: 3, subject: "english", title: "Days วันในสัปดาห์", topic: "คำศัพท์", ask: meaning, pairs: [["Monday", "วันจันทร์"], ["Tuesday", "วันอังคาร"], ["Wednesday", "วันพุธ"], ["Thursday", "วันพฤหัสบดี"], ["Friday", "วันศุกร์"], ["Saturday", "วันเสาร์"], ["Sunday", "วันอาทิตย์"], ["today", "วันนี้"]] },
  { grade: 3, subject: "english", title: "Food อาหาร", topic: "คำศัพท์", ask: meaning, pairs: [["rice", "ข้าว"], ["egg", "ไข่"], ["milk", "นม"], ["water", "น้ำ"], ["bread", "ขนมปัง"], ["chicken", "ไก่"], ["soup", "ซุป"], ["sugar", "น้ำตาล"]] },
  { grade: 4, subject: "english", title: "Jobs อาชีพ", topic: "คำศัพท์", ask: meaning, pairs: [["doctor", "แพทย์"], ["nurse", "พยาบาล"], ["farmer", "ชาวนา"], ["police officer", "ตำรวจ"], ["driver", "คนขับรถ"], ["soldier", "ทหาร"], ["dentist", "ทันตแพทย์"], ["singer", "นักร้อง"]] },
  { grade: 4, subject: "english", title: "Weather สภาพอากาศ", topic: "คำศัพท์", ask: meaning, pairs: [["sunny", "แดดออก"], ["rainy", "ฝนตก"], ["cloudy", "มีเมฆมาก"], ["windy", "ลมแรง"], ["hot", "ร้อน"], ["cold", "หนาว"], ["storm", "พายุ"], ["rainbow", "รุ้งกินน้ำ"]] },
  { grade: 4, subject: "english", title: "Places สถานที่", topic: "คำศัพท์", ask: meaning, pairs: [["school", "โรงเรียน"], ["hospital", "โรงพยาบาล"], ["market", "ตลาด"], ["temple", "วัด"], ["park", "สวนสาธารณะ"], ["library", "ห้องสมุด"], ["bank", "ธนาคาร"], ["zoo", "สวนสัตว์"]] },
  { grade: 5, subject: "english", title: "Action Verbs คำกริยา", topic: "คำศัพท์", ask: meaning, pairs: [["run", "วิ่ง"], ["swim", "ว่ายน้ำ"], ["read", "อ่าน"], ["write", "เขียน"], ["sing", "ร้องเพลง"], ["cook", "ทำอาหาร"], ["sleep", "นอนหลับ"], ["jump", "กระโดด"]] },
  { grade: 5, subject: "english", title: "Adjectives คำคุณศัพท์", topic: "คำศัพท์", ask: meaning, pairs: [["big", "ใหญ่"], ["small", "เล็ก"], ["tall", "สูง"], ["long", "ยาว"], ["fast", "เร็ว"], ["slow", "ช้า"], ["happy", "มีความสุข"], ["clean", "สะอาด"]] },
  { grade: 5, subject: "english", title: "Transport การเดินทาง", topic: "คำศัพท์", ask: meaning, pairs: [["car", "รถยนต์"], ["bus", "รถประจำทาง"], ["train", "รถไฟ"], ["plane", "เครื่องบิน"], ["boat", "เรือ"], ["bicycle", "จักรยาน"], ["motorcycle", "รถจักรยานยนต์"], ["truck", "รถบรรทุก"]] },
  { grade: 6, subject: "english", title: "Nature ธรรมชาติ", topic: "คำศัพท์", ask: meaning, pairs: [["mountain", "ภูเขา"], ["river", "แม่น้ำ"], ["forest", "ป่า"], ["sea", "ทะเล"], ["island", "เกาะ"], ["desert", "ทะเลทราย"], ["waterfall", "น้ำตก"], ["sky", "ท้องฟ้า"]] },
  { grade: 6, subject: "english", title: "Feelings ความรู้สึก", topic: "คำศัพท์", ask: meaning, pairs: [["angry", "โกรธ"], ["tired", "เหนื่อย"], ["hungry", "หิว"], ["thirsty", "กระหายน้ำ"], ["afraid", "กลัว"], ["excited", "ตื่นเต้น"], ["bored", "เบื่อ"], ["proud", "ภูมิใจ"]] },
  { grade: 6, subject: "english", title: "Past Tense กริยาช่อง 2", topic: "ไวยากรณ์", ask: past, pairs: [["go", "went"], ["eat", "ate"], ["see", "saw"], ["come", "came"], ["buy", "bought"], ["run", "ran"], ["write", "wrote"], ["drink", "drank"]] },

  { grade: 1, subject: "thai", title: "คำตรงข้าม ชุดที่ 1", topic: "คำตรงข้าม", ask: opposite, pairs: [["ใหญ่", "เล็ก"], ["สูง", "เตี้ย"], ["ร้อน", "เย็น"], ["มืด", "สว่าง"], ["เร็ว", "ช้า"], ["หนัก", "เบา"], ["ขึ้น", "ลง"], ["เปิด", "ปิด"]] },
  { grade: 2, subject: "thai", title: "คำตรงข้าม ชุดที่ 2", topic: "คำตรงข้าม", ask: opposite, pairs: [["ขยัน", "เกียจคร้าน"], ["สะอาด", "สกปรก"], ["ยาก", "ง่าย"], ["ใกล้", "ไกล"], ["กว้าง", "แคบ"], ["หนา", "บาง"], ["ดีใจ", "เสียใจ"], ["รวย", "จน"]] },
  { grade: 3, subject: "thai", title: "ลักษณนาม ชุดที่ 1", topic: "ลักษณนาม", ask: classifier, pairs: [["ช้างบ้าน", "เชือก"], ["ปากกา", "ด้าม"], ["หนังสือ", "เล่ม"], ["รถยนต์", "คัน"], ["บ้าน", "หลัง"], ["พระสงฆ์", "รูป"], ["แหวน", "วง"], ["เลื่อย", "ปื้น"]] },
  { grade: 4, subject: "thai", title: "ลักษณนาม ชุดที่ 2", topic: "ลักษณนาม", ask: classifier, pairs: [["ขลุ่ย", "เลา"], ["ร่ม", "คัน"], ["ไข่", "ฟอง"], ["จดหมาย", "ฉบับ"], ["ปืน", "กระบอก"], ["ดินสอ", "แท่ง"], ["กระดาษ", "แผ่น"], ["เทียน", "เล่ม"]] },
  { grade: 5, subject: "thai", title: "คำพ้องความหมาย ชุดที่ 1", topic: "คำพ้องความหมาย", ask: synonym, pairs: [["ดวงอาทิตย์", "ตะวัน"], ["ดวงจันทร์", "ศศิ"], ["ช้าง", "คชสาร"], ["ม้า", "อาชา"], ["น้ำ", "วารี"], ["ป่า", "ไพร"], ["ดอกไม้", "บุปผา"], ["ท้องฟ้า", "นภา"]] },
  { grade: 6, subject: "thai", title: "คำพ้องความหมาย ชุดที่ 2", topic: "คำพ้องความหมาย", ask: synonym, pairs: [["ภูเขา", "บรรพต"], ["ไฟ", "อัคคี"], ["ลม", "วายุ"], ["แผ่นดิน", "ปฐพี"], ["ผู้หญิง", "สตรี"], ["นก", "ปักษา"], ["ปลา", "มัจฉา"], ["ทอง", "สุวรรณ"]] },
];

function pairSets(): Draft[] {
  return PAIR_SETS.map((set, i) => {
    const r = rng(5000 + i);
    const questions = set.pairs.map(([word, answer]) => {
      const wrong = shuffle(r, set.pairs.map(([, a]) => a).filter((a) => a !== answer));
      return withChoices(r, set.ask(word), answer, wrong);
    });
    return { title: set.title, subject: set.subject, grade: set.grade, topic: set.topic, questions, published: false };
  });
}

// ---------- วิทยาศาสตร์ (เขียนมือ: คำตอบที่ถูกอยู่ตัวแรก แล้วสลับตอนสร้าง) ----------

const SCIENCE: { grade: Grade; title: string; topic: string; items: [string, string, string, string, string][] }[] = [
  {
    grade: 2,
    title: "สิ่งมีชีวิตรอบตัว",
    topic: "สิ่งมีชีวิต",
    items: [
      ["พืชใช้ส่วนใดดูดน้ำจากดิน", "ราก", "ใบ", "ดอก", "ผล"],
      ["สัตว์ชนิดใดออกลูกเป็นไข่", "ไก่", "สุนัข", "แมว", "วัว"],
      ["อวัยวะใดใช้ในการมองเห็น", "ตา", "หู", "จมูก", "ลิ้น"],
      ["สิ่งใดเป็นสิ่งมีชีวิต", "ต้นไม้", "ก้อนหิน", "โต๊ะ", "รถยนต์"],
      ["พืชต้องการสิ่งใดในการสร้างอาหาร", "แสงแดด", "ความมืด", "เสียง", "ทราย"],
      ["อวัยวะใดใช้ในการฟังเสียง", "หู", "ตา", "มือ", "จมูก"],
    ],
  },
  {
    grade: 4,
    title: "โลกและท้องฟ้า",
    topic: "โลกและอวกาศ",
    items: [
      ["ดวงอาทิตย์ขึ้นทางทิศใด", "ทิศตะวันออก", "ทิศตะวันตก", "ทิศเหนือ", "ทิศใต้"],
      ["โลกหมุนรอบตัวเอง 1 รอบ ใช้เวลาประมาณเท่าใด", "1 วัน", "1 สัปดาห์", "1 เดือน", "1 ปี"],
      ["โลกโคจรรอบดวงอาทิตย์ 1 รอบ ใช้เวลาประมาณเท่าใด", "1 ปี", "1 วัน", "1 สัปดาห์", "1 เดือน"],
      ["น้ำเมื่อได้รับความร้อนจนเดือดจะกลายเป็นอะไร", "ไอน้ำ", "น้ำแข็ง", "เกลือ", "ก้อนหิน"],
      ["น้ำแข็งเป็นน้ำในสถานะใด", "ของแข็ง", "ของเหลว", "แก๊ส", "ไอน้ำ"],
      ["ดาวเคราะห์ที่เราอาศัยอยู่คือดาวใด", "โลก", "ดาวอังคาร", "ดาวศุกร์", "ดาวพฤหัสบดี"],
    ],
  },
  {
    grade: 6,
    title: "ร่างกายและพลังงาน",
    topic: "ร่างกายและแรง",
    items: [
      ["อวัยวะใดทำหน้าที่สูบฉีดเลือดไปทั่วร่างกาย", "หัวใจ", "ปอด", "ตับ", "ไต"],
      ["อวัยวะใดทำหน้าที่แลกเปลี่ยนแก๊สเมื่อเราหายใจ", "ปอด", "หัวใจ", "กระเพาะอาหาร", "ตับ"],
      ["พืชใช้แก๊สใดในการสังเคราะห์ด้วยแสง", "คาร์บอนไดออกไซด์", "ออกซิเจน", "ไนโตรเจน", "ไฮโดรเจน"],
      ["แก๊สที่มนุษย์ต้องใช้ในการหายใจคือแก๊สใด", "ออกซิเจน", "คาร์บอนไดออกไซด์", "ไนโตรเจน", "ฮีเลียม"],
      ["วัสดุใดนำไฟฟ้าได้ดี", "ทองแดง", "ยาง", "ไม้แห้ง", "พลาสติก"],
      ["แรงที่ดึงดูดวัตถุให้ตกลงสู่พื้นโลกคือแรงใด", "แรงโน้มถ่วง", "แรงแม่เหล็ก", "แรงเสียดทาน", "แรงลม"],
    ],
  },
];

function scienceSets(): Draft[] {
  return SCIENCE.map((set, i) => {
    const r = rng(9000 + i);
    return {
      title: set.title,
      subject: "science",
      grade: set.grade,
      topic: set.topic,
      questions: set.items.map(([prompt, answer, ...wrong]) => withChoices(r, prompt, answer, wrong)),
      published: false,
    };
  });
}

// ---------- เขียนมือพร้อมคำอธิบาย ----------
// เติมช่องว่างของคลัง: คลังเดิมมีอังกฤษแต่ชุด "คำศัพท์" แปลคำเดี่ยวอย่างเดียว
// แต่แผนที่หัวข้อใน .claude/skills/exercise-authoring ข้อ 3 ระบุว่า
//   ป.3 ต้องมี "ประโยคสั้น" · ป.4 ต้องมี "Present Simple + คำถาม Wh-"
//   ป.5 ต้องมี "Past Simple + คำคุณศัพท์เปรียบเทียบ"  ← ยังไม่มีเลยทั้งหมด
// ป.1 เทอม 2 อิงหน่วย 4-6 (Animals / Food / Colors & Toys) ของแผน DLTV
// ตัวลวงทุกตัวคือ "คำตอบที่เด็กจะได้ถ้าคิดผิดแบบที่เด็กผิดจริง" ตาม SKILL ข้อ 4
// รูปแบบ: [โจทย์, คำตอบถูก, ตัวลวง, ตัวลวง, ตัวลวง, คำอธิบายเฉลย]

type WrittenItem = [string, string, string, string, string, string];

interface WrittenSet {
  grade: Grade;
  subject: Subject;
  title: string;
  topic: string;
  items: WrittenItem[];
}

const toEnglish = (w: string) => `คำว่า "${w}" ภาษาอังกฤษคือคำใด`;

const WRITTEN: WrittenSet[] = [
  // ===== ป.1 เทอม 2 · หน่วย 5 Food =====
  {
    grade: 1,
    subject: "english",
    title: "Food and Drink อาหารและเครื่องดื่ม",
    topic: "คำศัพท์",
    items: [
      [meaning("rice"), "ข้าว", "ขนมปัง", "ไข่", "นม", "rice คือ ข้าว · ขนมปัง คือ bread"],
      [meaning("egg"), "ไข่", "ไก่", "ปลา", "ข้าว", "egg คือ ไข่ · ไก่ คือ chicken"],
      [meaning("milk"), "นม", "น้ำ", "น้ำตาล", "น้ำผลไม้", "milk คือ นม · น้ำเปล่า คือ water — สองคำนี้เด็กสลับกันบ่อย"],
      [meaning("water"), "น้ำ", "นม", "น้ำแข็ง", "น้ำตาล", "water คือ น้ำเปล่า · นม คือ milk"],
      [meaning("bread"), "ขนมปัง", "เค้ก", "ข้าว", "คุกกี้", "bread คือ ขนมปัง · เค้ก คือ cake"],
      [meaning("banana"), "กล้วย", "มะม่วง", "ส้ม", "แอปเปิล", "banana คือ กล้วย"],
      [meaning("apple"), "แอปเปิล", "ส้ม", "องุ่น", "มะม่วง", "apple คือ แอปเปิล · ส้ม คือ orange"],
      [meaning("mango"), "มะม่วง", "กล้วย", "มะละกอ", "ส้ม", "mango คือ มะม่วง · มะละกอ คือ papaya"],
      [meaning("noodles"), "ก๋วยเตี๋ยว", "ข้าว", "ซุป", "ขนมปัง", "noodles คือ ก๋วยเตี๋ยว เติม -s เพราะมีหลายเส้น"],
      [meaning("cake"), "เค้ก", "ขนมปัง", "คุกกี้", "ไอศกรีม", "cake คือ เค้ก · ขนมปัง คือ bread"],
    ],
  },
  // ===== ป.1 เทอม 2 · หน่วย 6 Toys =====
  {
    grade: 1,
    subject: "english",
    title: "Toys ของเล่น",
    topic: "คำศัพท์",
    items: [
      [meaning("ball"), "ลูกบอล", "ลูกโป่ง", "ตุ๊กตา", "ว่าว", "ball คือ ลูกบอล · ลูกโป่ง คือ balloon — สองคำนี้ขึ้นต้น bal เหมือนกัน ต้องดูให้ดี"],
      [meaning("doll"), "ตุ๊กตา", "หุ่นยนต์", "ลูกบอล", "กลอง", "doll คือ ตุ๊กตา · หุ่นยนต์ คือ robot"],
      [meaning("kite"), "ว่าว", "ลูกโป่ง", "ธง", "ร่ม", "kite คือ ว่าว"],
      [meaning("balloon"), "ลูกโป่ง", "ลูกบอล", "ว่าว", "ร่ม", "balloon คือ ลูกโป่ง · ลูกบอล คือ ball"],
      [meaning("robot"), "หุ่นยนต์", "ตุ๊กตา", "รถยนต์", "เครื่องบิน", "robot คือ หุ่นยนต์"],
      [meaning("drum"), "กลอง", "ขลุ่ย", "กีตาร์", "ระฆัง", "drum คือ กลอง"],
      [meaning("teddy bear"), "ตุ๊กตาหมี", "หุ่นยนต์", "ว่าว", "กลอง", "teddy bear คือ ตุ๊กตาหมี · bear เฉย ๆ คือ หมีจริง"],
      [meaning("toy car"), "รถของเล่น", "รถไฟ", "จักรยาน", "เรือ", "car คือ รถยนต์ · เติม toy ข้างหน้าแปลว่าเป็นของเล่น"],
    ],
  },
  // ===== ป.1 เทอม 2 · ไทย → อังกฤษ (ตัวลวงสะกดใกล้กัน) =====
  {
    grade: 1,
    subject: "english",
    title: "ไทยเป็นอังกฤษ สีและของเล่น",
    topic: "คำศัพท์",
    items: [
      [toEnglish("สีแดง"), "red", "read", "bed", "rod", "red คือ สีแดง · read คือ อ่าน เขียนคล้ายกันมาก"],
      [toEnglish("สีดำ"), "black", "block", "back", "blue", "black คือ สีดำ · block คือ ก้อนหรือบล็อก"],
      [toEnglish("สีขาว"), "white", "write", "wide", "light", "white คือ สีขาว · write คือ เขียน อ่านออกเสียงเหมือนกันเลย"],
      [toEnglish("สีน้ำเงิน"), "blue", "black", "blow", "glue", "blue คือ สีน้ำเงิน · glue คือ กาว"],
      [toEnglish("สีเขียว"), "green", "grey", "queen", "groan", "green คือ สีเขียว · queen คือ ราชินี"],
      [toEnglish("สีเหลือง"), "yellow", "yell", "hello", "willow", "yellow คือ สีเหลือง · yell คือ ตะโกน"],
      [toEnglish("สีชมพู"), "pink", "pig", "pine", "drink", "pink คือ สีชมพู · pig คือ หมู ต่างกันแค่ตัวท้าย"],
      [toEnglish("ลูกบอล"), "ball", "bell", "bowl", "tall", "ball คือ ลูกบอล · bowl คือ ชาม · bell คือ ระฆัง"],
      [toEnglish("ตุ๊กตา"), "doll", "dog", "dull", "ball", "doll คือ ตุ๊กตา · dog คือ สุนัข ต่างกันแค่ตัวท้าย"],
      [toEnglish("ว่าว"), "kite", "kit", "cake", "bike", "kite คือ ว่าว · kit คือ ชุดอุปกรณ์ ต่างกันแค่ตัว e ท้ายคำ"],
    ],
  },
  // ===== ป.1 เทอม 2 · บุพบทบอกตำแหน่ง =====
  {
    grade: 1,
    subject: "english",
    title: "Where is it? บอกตำแหน่ง",
    topic: "ไวยากรณ์",
    items: [
      ["แมวอยู่ในกล่อง · The cat is ___ the box.", "in", "on", "under", "next to", "in คือ อยู่ข้างใน"],
      ["แมวอยู่บนกล่อง · The cat is ___ the box.", "on", "in", "under", "behind", "on คือ อยู่บนผิวหน้า · in คือ อยู่ข้างใน"],
      ["แมวอยู่ใต้โต๊ะ · The cat is ___ the table.", "under", "on", "in", "next to", "under คือ อยู่ข้างใต้"],
      ["หนังสืออยู่บนโต๊ะ · The book is ___ the table.", "on", "in", "under", "behind", "วางอยู่บนหน้าโต๊ะ ใช้ on"],
      ["ลูกบอลอยู่ในกระเป๋า · The ball is ___ the bag.", "in", "on", "under", "next to", "อยู่ข้างในกระเป๋า ใช้ in"],
      ["แมวอยู่ข้างกล่อง · The cat is ___ the box.", "next to", "in", "on", "under", "next to คือ อยู่ติดข้าง ๆ"],
      ["แมวอยู่หลังกล่อง · The cat is ___ the box.", "behind", "in front of", "under", "on", "behind คือ อยู่ข้างหลัง · in front of คือ อยู่ข้างหน้า"],
      ["Where is the cat? แปลว่าอะไร", "แมวอยู่ที่ไหน", "แมวชื่ออะไร", "แมวทำอะไร", "แมวสีอะไร", "Where คือ ที่ไหน ใช้ถามสถานที่"],
    ],
  },
  // ===== ป.1 เทอม 2 · นับจำนวนและพหูพจน์ =====
  {
    grade: 1,
    subject: "english",
    title: "How many? นับจำนวน",
    topic: "ไวยากรณ์",
    items: [
      ["How many ... ? ใช้ถามเรื่องอะไร", "จำนวนเท่าไร", "อยู่ที่ไหน", "สีอะไร", "ชื่ออะไร", "How many คือ ถามจำนวน · Where คือ ถามที่"],
      ["three คือเลขอะไร", "3", "2", "4", "13", "three คือ 3 · thirteen คือ 13 ออกเสียงคล้ายกัน"],
      ["seven คือเลขอะไร", "7", "6", "8", "11", "seven คือ 7"],
      ["ten คือเลขอะไร", "10", "2", "12", "100", "ten คือ 10 · twelve คือ 12"],
      ["เป็ด 1 ตัว · ___ duck", "one", "two", "three", "many", "มี 1 ตัว ใช้ one และคำนามไม่เติม -s"],
      ["เป็ด 3 ตัว · three ___", "ducks", "duck", "duckes", "ducked", "มากกว่า 1 ตัว เติม -s เป็น ducks"],
      ["แอปเปิล 5 ลูก · five ___", "apples", "apple", "applees", "appled", "มากกว่า 1 ลูก เติม -s เป็น apples"],
      ["ลูกโป่ง 7 ใบ · seven ___", "balloons", "balloon", "balloones", "ballooned", "เติม -s ท้ายคำได้เลย ไม่ต้องเติม -es"],
    ],
  },

  // ===== ป.3 · ประโยคสั้น =====
  {
    grade: 3,
    subject: "english",
    title: "Short Sentences ประโยคสั้น",
    topic: "ไวยากรณ์",
    items: [
      ["หนังสือ 1 เล่ม เขียนอย่างไร", "a book", "an book", "a books", "an books", "คำนามเอกพจน์ใช้ a · ใช้ an เฉพาะคำที่เริ่มด้วยเสียงสระ a e i o u"],
      ["แอปเปิล 1 ลูก เขียนอย่างไร", "an apple", "a apple", "an apples", "a apples", "apple เริ่มด้วยเสียงสระ จึงใช้ an ไม่ใช่ a"],
      ["นี่คือแมวของฉัน", "This is my cat.", "This my cat is.", "This cat is my.", "This is me cat.", "เรียง ประธาน + is + ส่วนขยาย · เจ้าของใช้ my ไม่ใช่ me"],
      ["นั่นคือหนังสือของเธอ", "That is her book.", "That her book is.", "That is she book.", "That book is her.", "ไกลตัวใช้ That · เจ้าของผู้หญิงใช้ her ไม่ใช่ she"],
      ["ฉันมีสุนัข 1 ตัว", "I have a dog.", "I has a dog.", "I have dog.", "I am have a dog.", "I ใช้ have ไม่ใช่ has · สุนัข 1 ตัวต้องมี a"],
      ["เขาผู้ชายมีแมว 2 ตัว", "He has two cats.", "He have two cats.", "He has two cat.", "He is have two cats.", "He ใช้ has · 2 ตัวต้องเติม -s เป็น cats"],
      ["มีหนังสือ 1 เล่มอยู่บนโต๊ะ", "There is a book on the table.", "There are a book on the table.", "There is a books on the table.", "There have a book on the table.", "ของชิ้นเดียวใช้ There is · ของหลายชิ้นใช้ There are"],
      ["มีแมว 3 ตัวอยู่ในกล่อง", "There are three cats in the box.", "There is three cats in the box.", "There are three cat in the box.", "There have three cats in the box.", "3 ตัวเป็นพหูพจน์ ต้องใช้ There are และเติม -s"],
      ["เธอไม่ใช่ครูของฉัน", "She is not my teacher.", "She not is my teacher.", "She is no my teacher.", "She not my teacher.", "ปฏิเสธคือวาง not ไว้หลัง is"],
      ["พวกเขาเป็นเพื่อนของฉัน", "They are my friends.", "They is my friends.", "They are my friend.", "They am my friends.", "They ใช้ are · เพื่อนหลายคนเติม -s"],
    ],
  },

  // ===== ป.4 · Present Simple =====
  {
    grade: 4,
    subject: "english",
    title: "Present Simple เหตุการณ์ปัจจุบัน",
    topic: "ไวยากรณ์",
    items: [
      ["I ___ to school every day.", "go", "goes", "going", "went", "I ใช้กริยารูปปกติ · goes ใช้กับ he she it เท่านั้น"],
      ["She ___ to school every day.", "goes", "go", "going", "gone", "She เป็นเอกพจน์บุรุษที่ 3 ต้องเติม -es เป็น goes"],
      ["He ___ rice every morning.", "eats", "eat", "eating", "ate", "He ต้องเติม -s · ate เป็นรูปอดีต ใช้กับ every morning ไม่ได้"],
      ["We ___ English on Monday.", "study", "studies", "studying", "studied", "We ใช้รูปปกติ · studies ใช้กับ he she it"],
      ["My mother ___ dinner every evening.", "cooks", "cook", "cooking", "cooked", "My mother แทนด้วย she ได้ จึงต้องเติม -s"],
      ["They ___ football after school.", "play", "plays", "playing", "played", "They เป็นพหูพจน์ ใช้รูปปกติ ไม่เติม -s"],
      ["The cat ___ milk every day.", "drinks", "drink", "drinking", "drank", "The cat แทนด้วย it ได้ จึงต้องเติม -s"],
      ["___ you like mango?", "Do", "Does", "Is", "Are", "ถามด้วยกริยาทั่วไปกับ you ใช้ Do"],
      ["___ she like mango?", "Does", "Do", "Is", "Are", "ถามกับ he she it ใช้ Does แล้วกริยาหลักกลับเป็นรูปปกติ"],
      ["He ___ not like fish.", "does", "do", "is", "are", "ปฏิเสธกับ he ใช้ does not แล้วตามด้วย like รูปปกติ"],
      ["ประโยคใดเติมท้ายกริยาถูกต้อง", "She watches TV.", "She watchs TV.", "She watch TV.", "She watching TV.", "คำที่ลงท้าย ch ต้องเติม -es เป็น watches"],
      ["ประโยคใดเขียนรูปปฏิเสธถูกต้อง", "I do not have a pen.", "I does not have a pen.", "I not have a pen.", "I am not have a pen.", "I ใช้ do not · does not ใช้กับ he she it"],
    ],
  },

  // ===== ป.4 · คำถาม Wh- =====
  {
    grade: 4,
    subject: "english",
    title: "Wh- Questions คำถามขึ้นต้นด้วย Wh",
    topic: "ไวยากรณ์",
    items: [
      ["What แปลว่าอะไร", "อะไร", "ที่ไหน", "ใคร", "เมื่อไร", "What คือ อะไร ใช้ถามสิ่งของหรือเรื่องราว"],
      ["Where แปลว่าอะไร", "ที่ไหน", "อะไร", "ใคร", "อย่างไร", "Where คือ ที่ไหน ใช้ถามสถานที่"],
      ["Who แปลว่าอะไร", "ใคร", "อะไร", "ที่ไหน", "ทำไม", "Who คือ ใคร ใช้ถามคน"],
      ["When แปลว่าอะไร", "เมื่อไร", "ที่ไหน", "ทำไม", "อย่างไร", "When คือ เมื่อไร ใช้ถามเวลา"],
      ["Why แปลว่าอะไร", "ทำไม", "อย่างไร", "เมื่อไร", "ใคร", "Why คือ ทำไม ใช้ถามเหตุผล ตอบด้วย Because"],
      ["How แปลว่าอะไร", "อย่างไร", "ทำไม", "ที่ไหน", "ใคร", "How คือ อย่างไร ใช้ถามวิธีหรืออาการ"],
      ["___ is your name? (ถามชื่อ)", "What", "Where", "When", "Why", "ถามชื่อใช้ What ไม่ใช่ Who"],
      ["___ do you live? (ถามที่อยู่)", "Where", "What", "When", "Who", "ถามสถานที่ใช้ Where"],
      ["___ is your teacher? (ถามว่าเป็นคนไหน)", "Who", "What", "Where", "When", "ถามคนใช้ Who"],
      ["___ are you sad? (ถามเหตุผล)", "Why", "What", "Where", "When", "ถามเหตุผลใช้ Why"],
    ],
  },

  // ===== ป.5 · Past Simple =====
  {
    grade: 5,
    subject: "english",
    title: "Past Simple เหตุการณ์ที่ผ่านไปแล้ว",
    topic: "ไวยากรณ์",
    items: [
      ["Yesterday I ___ to the market.", "went", "go", "goes", "going", "yesterday บอกว่าเป็นอดีต go เปลี่ยนรูปเป็น went"],
      ["She ___ rice for dinner last night.", "cooked", "cook", "cooks", "cooking", "last night เป็นอดีต กริยาปกติเติม -ed"],
      ["We ___ a movie last Sunday.", "watched", "watch", "watches", "watching", "last Sunday เป็นอดีต เติม -ed เป็น watched"],
      ["He ___ his homework yesterday.", "did", "do", "does", "doing", "รูปอดีตของ do คือ did"],
      ["They ___ at home last week.", "stayed", "stay", "stays", "staying", "stay ลงท้ายสระ y ที่มีสระนำ เติม -ed ได้เลย"],
      ["Last Friday I ___ my friend.", "met", "meet", "meets", "meeting", "รูปอดีตของ meet คือ met ไม่ใช่ meeted"],
      ["รูปอดีตของ study คือคำใด", "studied", "studyed", "studys", "studing", "คำลงท้าย y ที่มีพยัญชนะนำ เปลี่ยน y เป็น i แล้วเติม -ed"],
      ["รูปอดีตของ stop คือคำใด", "stopped", "stoped", "stopping", "stops", "สระสั้นตามด้วยพยัญชนะตัวเดียว ต้องเพิ่มพยัญชนะอีกตัวก่อนเติม -ed"],
      ["รูปอดีตของ take คือคำใด", "took", "taked", "taken", "takes", "take เป็นกริยาไม่ปกติ อดีตคือ took · taken เป็นช่องที่ 3"],
      ["รูปอดีตของ give คือคำใด", "gave", "gived", "given", "gives", "give เป็นกริยาไม่ปกติ อดีตคือ gave · given เป็นช่องที่ 3"],
      ["ประโยคใดเขียนรูปปฏิเสธถูกต้อง", "I did not go to school.", "I did not went to school.", "I was not go to school.", "I not go to school.", "มี did แล้ว กริยาหลักกลับเป็นรูปปกติ go ไม่ใช่ went"],
      ["ประโยคใดเขียนรูปคำถามถูกต้อง", "Did you eat breakfast?", "Did you ate breakfast?", "Do you ate breakfast?", "Did you eating breakfast?", "ถามอดีตใช้ Did แล้วกริยาหลักเป็นรูปปกติ eat"],
    ],
  },

  // ===== ป.5 · คำคุณศัพท์เปรียบเทียบ =====
  {
    grade: 5,
    subject: "english",
    title: "Comparatives คำคุณศัพท์เปรียบเทียบ",
    topic: "ไวยากรณ์",
    items: [
      ["An elephant is ___ than a cat.", "bigger", "big", "biggest", "more big", "เทียบ 2 สิ่ง ใช้ขั้นกว่า big เป็น bigger"],
      ["A mouse is ___ than a dog.", "smaller", "small", "smallest", "more small", "คำสั้นเติม -er ไม่ใช้ more"],
      ["My brother is ___ than me.", "taller", "tall", "tallest", "more tall", "tall เป็นคำสั้น เติม -er เป็น taller"],
      ["คำใดใช้ต่อหลังคำเปรียบเทียบขั้นกว่า", "than", "then", "that", "from", "ขั้นกว่าตามด้วย than · then แปลว่า แล้วก็ สะกดต่างกันตัวเดียว"],
      ["ขั้นกว่าของ happy คือคำใด", "happier", "happyer", "happiest", "happily", "ลงท้าย y ที่มีพยัญชนะนำ เปลี่ยน y เป็น i แล้วเติม -er"],
      ["ขั้นกว่าของ big คือคำใด", "bigger", "biger", "biggest", "more big", "สระสั้นพยัญชนะเดียว ต้องเพิ่ม g อีกตัวก่อนเติม -er"],
      ["ขั้นกว่าของ beautiful คือคำใด", "more beautiful", "beautifuler", "most beautiful", "beautifullest", "คำยาว 3 พยางค์ขึ้นไป ใช้ more ข้างหน้า ไม่เติม -er"],
      ["ขั้นกว่าของ good คือคำใด", "better", "gooder", "best", "more good", "good เป็นคำพิเศษ ขั้นกว่าคือ better · best เป็นขั้นสูงสุด"],
      ["ขั้นกว่าของ bad คือคำใด", "worse", "badder", "worst", "more bad", "bad เป็นคำพิเศษ ขั้นกว่าคือ worse · worst เป็นขั้นสูงสุด"],
      ["ขั้นสูงสุดของ big คือคำใด", "the biggest", "the bigger", "the most big", "the biggiest", "ขั้นสูงสุดเติม -est และมี the นำหน้า"],
      ["ขั้นสูงสุดของ beautiful คือคำใด", "the most beautiful", "the beautifulest", "the more beautiful", "the beautifuler", "คำยาวใช้ the most ข้างหน้า"],
      ["ประโยคใดเปรียบเทียบถูกต้อง", "She is taller than her sister.", "She is more taller than her sister.", "She is taller then her sister.", "She is tall than her sister.", "ใช้ -er อย่างเดียว ห้ามใส่ more ซ้ำ และต้องเป็น than"],
    ],
  },
];

function writtenSets(): Draft[] {
  return WRITTEN.map((set, i) => {
    const r = rng(11000 + i);
    return {
      title: set.title,
      subject: set.subject,
      grade: set.grade,
      topic: set.topic,
      questions: set.items.map(([prompt, answer, a, b, c, explain]) => ({
        ...withChoices(r, prompt, answer, [a, b, c]),
        explain,
      })),
      published: false,
    };
  });
}

export function starterExercises(): Draft[] {
  return [...mathSets(), ...pairSets(), ...scienceSets(), ...writtenSets(), ...hsk1Exercises()];
}
