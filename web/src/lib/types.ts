// Data model — 1 interface = 1 Firestore collection (ชื่อ collection อยู่ใน COLLECTIONS ด้านล่าง)
// เวลาเก็บเป็น ISO string, เงินเก็บเป็นบาท (จำนวนเต็ม)

export type Grade = 1 | 2 | 3 | 4 | 5 | 6; // ป.1-6
export type Subject = "math" | "thai" | "english" | "science";
export type Role = "owner" | "teacher" | "parent" | "student";

export const COLLECTIONS = {
  users: "users",
  students: "students",
  courses: "courses",
  enrollments: "enrollments",
  sessions: "sessions",
  attendance: "attendance",
  invoices: "invoices",
  exercises: "exercises",
  attempts: "attempts",
  playerProfiles: "player_profiles",
  rewards: "rewards",
  redemptions: "redemptions",
} as const;

// ---------- คน ----------

export interface AppUser {
  uid: string;
  role: Role;
  displayName: string;
  phone?: string;
  lineUserId?: string; // ผูก LINE OA สำหรับแจ้งเตือนผู้ปกครอง
  studentIds?: string[]; // parent → ลูก
}

export interface Student {
  id: string;
  nickname: string;
  fullName: string;
  grade: Grade;
  school?: string;
  parentUid: string;
  pdpaConsentAt?: string; // ผู้ปกครองยินยอมเก็บข้อมูลเด็ก — ต้องมีก่อนเปิดใช้ระบบแบบฝึกหัด
  active: boolean;
  createdAt: string;
}

// ---------- หลังบ้าน: คอร์ส / ตารางเรียน / เช็กชื่อ / ค่าเรียน ----------

export interface Course {
  id: string;
  name: string;
  subject: Subject;
  grades: Grade[];
  pricePerTerm: number;
  weekday: number; // 0=อาทิตย์
  startTime: string; // "16:30"
  endTime: string;
  teacherUid: string;
  capacity: number;
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  term: string; // "2026-T2"
  status: "pending" | "active" | "cancelled";
  createdAt: string;
}

export interface ClassSession {
  id: string;
  courseId: string;
  date: string; // "2026-11-02"
  topic?: string;
}

export interface Attendance {
  id: string; // `${sessionId}_${studentId}`
  sessionId: string;
  studentId: string;
  status: "present" | "late" | "absent" | "leave";
  checkedByUid: string;
  checkedAt: string;
  lineNotifiedAt?: string;
}

export interface Invoice {
  id: string;
  studentId: string;
  enrollmentIds: string[];
  amount: number;
  dueDate: string;
  status: "unpaid" | "slip_uploaded" | "paid" | "void";
  slipUrl?: string;
  paidAt?: string;
}

// ---------- แบบฝึกหัดออนไลน์ ----------

export interface Question {
  id: string;
  prompt: string;
  choices: string[];
  answerIndex: number;
  explain?: string;
}

export interface Exercise {
  id: string;
  title: string;
  subject: Subject;
  grade: Grade;
  questions: Question[];
  published: boolean;
}

export interface Attempt {
  id: string;
  studentId: string;
  exerciseId: string;
  correct: number;
  total: number;
  xpEarned: number;
  durationSec: number;
  finishedAt: string;
}

// ---------- เกม: พลัง / achievement / avatar / ของรางวัล ----------

export interface PlayerProfile {
  studentId: string;
  xp: number;
  coins: number; // ใช้แลกของรางวัลจากสถาบัน
  questionsAnswered: number;
  exercisesDone: number;
  perfectRuns: number;
  dayStreak: number;
  lastPlayedDate?: string; // "2026-11-02"
  todayQuestions: number; // ตัวนับลิมิตรายวัน — รีเซ็ตเมื่อ lastPlayedDate เปลี่ยน
  todaySeconds: number;
  achievementIds: string[];
  ownedItemIds: string[];
  equipped: Partial<Record<AvatarSlot, string>>;
}

export type AvatarSlot = "body" | "hat" | "outfit" | "pet" | "background";

export interface AvatarItem {
  id: string;
  slot: AvatarSlot;
  name: string;
  emoji: string; // placeholder จนกว่าจะมีไฟล์ภาพจริง
  unlock: { level?: number; achievementId?: string };
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  coins: number;
  check: (p: PlayerProfile) => boolean;
}

export interface Reward {
  id: string;
  name: string; // เช่น สติกเกอร์, ดินสอ, ขนม
  costCoins: number;
  costBaht: number; // ต้นทุนจริง — ใช้คุมงบของรางวัลรายเดือน
  stock: number;
  active: boolean;
}

export interface Redemption {
  id: string;
  studentId: string;
  rewardId: string;
  costCoins: number;
  status: "requested" | "handed_over" | "rejected"; // ครูเป็นคนกดส่งมอบที่สถาบัน
  requestedAt: string;
  handledByUid?: string;
}
