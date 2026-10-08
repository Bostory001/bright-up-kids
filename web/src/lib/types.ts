// Data model — 1 interface ที่มี @collection = 1 collection ใน Firestore
// หน้า Data Dictionary สร้างจากไฟล์นี้อัตโนมัติ (scripts/gen-data-dictionary.mjs) — เขียน comment ให้คนอ่านรู้เรื่อง
// เวลาเก็บเป็น ISO string, วันที่เป็น "YYYY-MM-DD" (เวลาไทย), เงินเป็นบาท

export type Grade = 1 | 2 | 3 | 4 | 5 | 6;
export type Subject = "math" | "thai" | "english" | "science";
export type Role = "owner" | "teacher" | "parent" | "student";
export type AvatarSlot = "background" | "outfit" | "hat" | "pet";

/**
 * ผู้ใช้ระบบ (เจ้าของ ครู ผู้ปกครอง) — นักเรียนไม่อยู่ที่นี่ ใช้รหัสนักเรียน + PIN
 * @collection users
 */
export interface AppUser {
  id: string;
  role: "owner" | "teacher" | "parent";
  /** ชื่อเข้าระบบ — ผู้ปกครองใช้เบอร์โทร */
  username: string;
  displayName: string;
  phone?: string;
  /** รหัสผ่านที่ hash แล้ว (scrypt) ไม่ส่งออก API */
  passwordHash: string;
  /** ต้องเปลี่ยนรหัสผ่านเมื่อเข้าครั้งแรก */
  mustChangePassword?: boolean;
  /** กุญแจ 2FA (TOTP) ไม่ส่งออก API */
  totpSecret?: string;
  /** เปิดใช้ 2FA แล้ว — บังคับสำหรับเจ้าของและครู */
  totpEnabled?: boolean;
  /** จำนวนครั้งที่ใส่รหัสผิดติดกัน */
  failedLogins?: number;
  /** ล็อกบัญชีถึงเวลานี้ */
  lockedUntil?: string;
  /** LINE userId ที่ผูกไว้สำหรับรับแจ้งเตือน */
  lineUserId?: string;
  /** รหัส 6 หลักสำหรับผูก LINE (หมดอายุตาม lineLinkExpires) */
  lineLinkCode?: string;
  lineLinkExpires?: string;
  active: boolean;
  createdAt: string;
}

/**
 * session การเข้าระบบ (id = sha256 ของ token ใน cookie)
 * @collection auth_sessions
 */
export interface AuthSession {
  id: string;
  role: Role;
  /** id ของ users หรือ students ตาม role */
  subjectId: string;
  expiresAt: string;
}

/**
 * ใบสมัครเรียนจากฟอร์มออนไลน์ รอครูอนุมัติ
 * @collection applications
 */
export interface Application {
  id: string;
  parentName: string;
  phone: string;
  studentFullName: string;
  nickname: string;
  grade: Grade;
  school?: string;
  courseIds: string[];
  /** เวลาที่ผู้ปกครองกดยินยอม PDPA */
  pdpaConsentAt: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

/**
 * นักเรียน
 * @collection students
 */
export interface Student {
  id: string;
  /** รหัสนักเรียน เช่น BUK0001 ใช้เข้าระบบแบบฝึกหัด */
  code: string;
  /** PIN 4 หลักที่ hash แล้ว ไม่ส่งออก API */
  pinHash: string;
  nickname: string;
  fullName: string;
  grade: Grade;
  school?: string;
  /** id ผู้ปกครองใน users */
  parentId?: string;
  /** เวลาที่ผู้ปกครองยินยอมให้เก็บข้อมูลเด็ก */
  pdpaConsentAt?: string;
  failedLogins?: number;
  lockedUntil?: string;
  active: boolean;
  createdAt: string;
}

/**
 * คอร์สเรียน
 * @collection courses
 */
export interface Course {
  id: string;
  name: string;
  subject: Subject;
  /** ชั้นที่รับ เช่น [1,2] */
  grades: Grade[];
  /** ค่าเรียนต่อเทอม (บาท) */
  pricePerTerm: number;
  /** วันเรียน 0=อาทิตย์ ... 6=เสาร์ */
  weekday: number;
  startTime: string;
  endTime: string;
  teacherName?: string;
  capacity: number;
  active: boolean;
}

/**
 * การลงทะเบียนเรียนของนักเรียนในคอร์ส
 * @collection enrollments
 */
export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  /** เทอม เช่น 2026-T2 */
  term: string;
  status: "active" | "cancelled";
  createdAt: string;
}

/**
 * การเช็กชื่อ 1 คน 1 คาบ (id = courseId_date_studentId)
 * @collection attendance
 */
export interface Attendance {
  id: string;
  courseId: string;
  date: string;
  studentId: string;
  status: "present" | "late" | "absent" | "leave";
  checkedBy: string;
  checkedAt: string;
}

/**
 * ใบแจ้งค่าเรียน
 * @collection invoices
 */
export interface Invoice {
  id: string;
  studentId: string;
  description: string;
  amount: number;
  dueDate: string;
  status: "unpaid" | "slip_uploaded" | "paid" | "void";
  /** วันที่ยืนยันรับเงิน — ใช้คิดยอดรับรายเดือน/royalty */
  paidDate?: string;
  createdAt: string;
}

/**
 * รูปสลิปโอนเงิน (id = invoiceId) เก็บเป็น data URL ที่ย่อแล้ว
 * @collection slips
 */
export interface Slip {
  id: string;
  dataUrl: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface Question {
  prompt: string;
  choices: string[];
  /** ลำดับตัวเลือกที่ถูก เริ่มจาก 0 — ไม่ส่งให้เครื่องนักเรียน */
  answerIndex: number;
  explain?: string;
}

/**
 * ชุดแบบฝึกหัด (โจทย์แต่งเองทั้งหมด)
 * @collection exercises
 */
export interface Exercise {
  id: string;
  title: string;
  subject: Subject;
  grade: Grade;
  /** หัวข้อ เช่น "การบวก" ใช้สรุปจุดอ่อนรายคน */
  topic: string;
  questions: Question[];
  /** เผยแพร่ให้นักเรียนเห็นแล้ว */
  published: boolean;
  createdAt: string;
}

/**
 * การทำแบบฝึกหัด 1 รอบ — คิดคะแนนฝั่ง server
 * @collection attempts
 */
export interface Attempt {
  id: string;
  studentId: string;
  exerciseId: string;
  /** คำตอบที่เลือกแต่ละข้อ (null = ยังไม่ตอบ) */
  answers: (number | null)[];
  status: "started" | "finished";
  correct: number;
  total: number;
  /** false = เกินลิมิตรายวัน รอบนี้ไม่นับคะแนน */
  counted: boolean;
  xpEarned: number;
  coinsEarned: number;
  durationSec: number;
  startedAt: string;
  finishedAt?: string;
  /** วันที่ทำ (เวลาไทย) */
  date: string;
}

/**
 * ข้อมูลเกมของนักเรียน (id = studentId) — เขียนได้จาก server เท่านั้น
 * @collection player_profiles
 */
export interface PlayerProfile {
  id: string;
  xp: number;
  /** เหรียญสำหรับแลกของรางวัลจากสถาบัน */
  coins: number;
  questionsAnswered: number;
  exercisesDone: number;
  perfectRuns: number;
  /** จำนวนวันที่เข้ามาฝึกติดกัน */
  dayStreak: number;
  lastPlayedDate?: string;
  /** ตัวนับลิมิตรายวัน — รีเซ็ตเมื่อ lastPlayedDate เปลี่ยน */
  todayQuestions: number;
  todaySeconds: number;
  achievementIds: string[];
  ownedItemIds: string[];
  /** ของแต่งตัวที่ใส่อยู่ แยกตามช่อง */
  equipped: Partial<Record<AvatarSlot, string>>;
}

/**
 * ของรางวัลที่แลกได้ด้วยเหรียญ
 * @collection rewards
 */
export interface Reward {
  id: string;
  name: string;
  costCoins: number;
  /** ต้นทุนจริง (บาท) ใช้คุมงบของรางวัลรายเดือน */
  costBaht: number;
  stock: number;
  active: boolean;
}

/**
 * คำขอแลกของรางวัล — ครูเป็นคนกดส่งมอบที่สถาบัน
 * @collection redemptions
 */
export interface Redemption {
  id: string;
  studentId: string;
  rewardId: string;
  rewardName: string;
  costCoins: number;
  costBaht: number;
  status: "requested" | "handed_over" | "rejected";
  requestedAt: string;
  handledBy?: string;
  /** วันที่ส่งมอบ — ใช้คิดงบรายเดือน */
  handledDate?: string;
}

/**
 * ข้อความแจ้งเตือนถึงผู้ปกครอง (LINE) — ถ้ายังไม่ตั้งค่า LINE จะค้างสถานะ queued
 * @collection notifications
 */
export interface Notification {
  id: string;
  parentId: string;
  kind: "attendance" | "invoice" | "payment" | "weekly" | "general";
  text: string;
  status: "sent" | "queued" | "failed";
  error?: string;
  createdAt: string;
}

/**
 * ค่าตั้งของสถาบัน (มีเอกสารเดียว id = main) แก้ได้เฉพาะเจ้าของ
 * @collection settings
 */
export interface Settings {
  id: string;
  /** จำนวนโจทย์ต่อวันที่นับคะแนน */
  dailyLimitQuestions: number;
  /** เวลาทำโจทย์ต่อวันที่นับคะแนน (นาที) */
  dailyLimitMinutes: number;
  /** งบของรางวัลต่อเดือน (บาท) */
  rewardBudgetBaht: number;
  /** อัตรา royalty ที่ส่ง HQ เป็นเปอร์เซ็นต์ของยอดรับค่าเรียน */
  royaltyPercent: number;
}

/**
 * ผู้สนใจ / ขอทดลองเรียนฟรี จากฟอร์ม /trial หรือครูกรอกเอง
 * @collection leads
 */
export interface Lead {
  id: string;
  parentName: string;
  phone: string;
  childNickname: string;
  grade: Grade;
  /** รู้จักสถาบันจากช่องทางไหน เช่น Facebook, ใบปลิว, เพื่อนแนะนำ */
  source?: string;
  note?: string;
  /** วันที่นัดทดลองเรียน */
  trialDate?: string;
  status: "new" | "contacted" | "booked" | "attended" | "enrolled" | "lost";
  /** เวลาที่ผู้ปกครองยินยอมให้ติดต่อกลับ */
  consentAt: string;
  createdAt: string;
}

/**
 * นัดเรียนชดเชยของคาบที่ขาด/ลา (id = attendanceId)
 * @collection makeups
 */
export interface Makeup {
  id: string;
  studentId: string;
  courseId: string;
  missedDate: string;
  makeupDate: string;
  status: "planned" | "done" | "cancelled";
  createdAt: string;
}

/**
 * การบ้าน: มอบหมายชุดแบบฝึกหัดให้นักเรียนทั้งคอร์ส
 * @collection assignments
 */
export interface Assignment {
  id: string;
  courseId: string;
  exerciseId: string;
  dueDate: string;
  createdAt: string;
}

// ---------- ใช้ในโค้ดเท่านั้น ไม่ใช่ collection ----------

export interface AvatarItem {
  id: string;
  slot: AvatarSlot;
  name: string;
  emoji: string;
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
