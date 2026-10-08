import "server-only";
import type { Exercise, Grade, Question, Subject } from "../types";

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

export function starterExercises(): Draft[] {
  return [...mathSets(), ...pairSets(), ...scienceSets()];
}
