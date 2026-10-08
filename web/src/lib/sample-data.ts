import type { Exercise } from "./types";

// ข้อมูลตัวอย่างสำหรับ demo เท่านั้น — เนื้อหาจริงต้องเคลียร์สิทธิ์กับ HQ ก่อน (ดู CLAUDE.md)
export const SAMPLE_EXERCISES: Exercise[] = [
  {
    id: "demo-math-p2-add",
    title: "บวกเลขสองหลัก",
    subject: "math",
    grade: 2,
    published: true,
    questions: [
      { id: "q1", prompt: "12 + 7 = ?", choices: ["17", "19", "20", "21"], answerIndex: 1 },
      { id: "q2", prompt: "25 + 14 = ?", choices: ["39", "38", "41", "49"], answerIndex: 0 },
      { id: "q3", prompt: "30 + 45 = ?", choices: ["65", "70", "75", "85"], answerIndex: 2 },
      { id: "q4", prompt: "18 + 18 = ?", choices: ["26", "34", "38", "36"], answerIndex: 3 },
      { id: "q5", prompt: "47 + 6 = ?", choices: ["51", "53", "52", "43"], answerIndex: 1 },
    ],
  },
  {
    id: "demo-eng-p1-animals",
    title: "Animals คำศัพท์สัตว์",
    subject: "english",
    grade: 1,
    published: true,
    questions: [
      { id: "q1", prompt: "🐶 ภาษาอังกฤษคือ?", choices: ["cat", "dog", "bird", "fish"], answerIndex: 1 },
      { id: "q2", prompt: "🐱 ภาษาอังกฤษคือ?", choices: ["cat", "cow", "pig", "duck"], answerIndex: 0 },
      { id: "q3", prompt: "🐟 ภาษาอังกฤษคือ?", choices: ["frog", "bird", "fish", "ant"], answerIndex: 2 },
      { id: "q4", prompt: "🐘 ภาษาอังกฤษคือ?", choices: ["lion", "horse", "tiger", "elephant"], answerIndex: 3 },
    ],
  },
];
