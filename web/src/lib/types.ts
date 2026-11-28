// Data model — 1 interface ที่มี @collection = 1 collection ใน Firestore
// หน้า Data Dictionary สร้างจากไฟล์นี้อัตโนมัติ (scripts/gen-data-dictionary.mjs) — เขียน comment ให้คนอ่านรู้เรื่อง
// เวลาเก็บเป็น ISO string, วันที่เป็น "YYYY-MM-DD" (เวลาไทย), เงินเป็นบาท

/** ชั้นเรียน: 1-6 = ป.1-6 · 7-9 = ม.1-3 (ใช้ gradeLabel() ใน lib/grade.ts แปลงเป็นข้อความ) */
export type Grade = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type Subject = "math" | "thai" | "english" | "science" | "chinese";
export type Role = "owner" | "teacher" | "parent" | "student";
export type AssessmentKind = "pre" | "progress" | "post";
/** หลักสูตรที่นักเรียนเรียนอยู่ที่โรงเรียน: สามัญ(ไทย) / English Program / Inter */
export type SchoolProgram = "thai" | "ep" | "inter";
export type ExpenseKind = "operating" | "supply";
export type ExpenseCategory =
  | "teacher"      // ค่าจ้างครู
  | "staff"        // เงินเดือน/ค่าจ้างพนักงาน
  | "rent"         // ค่าเช่าสถานที่
  | "utilities"    // ค่าน้ำ ค่าไฟ อินเทอร์เน็ต
  | "royalty"      // ค่า royalty/RF ส่ง HQ
  | "marketing"    // ค่าโฆษณา ใบปลิว ของแจก
  | "stationery"   // เครื่องเขียน
  | "office"       // กระดาษ หมึกพิมพ์ แฟ้ม
  | "cleaning"     // ของใช้ทำความสะอาด ห้องน้ำ
  | "hospitality"  // น้ำดื่ม แก้ว ขนมรับรอง
  | "teaching"     // อุปกรณ์การสอน ปากกาไวท์บอร์ด
  | "repair"       // ซ่อมแซมเล็กน้อย หลอดไฟ ถ่าน
  | "other";       // อื่น ๆ
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
  /** อัตราค่าสอนต่อชั่วโมง (บาท) — ใช้คิดค่าจ้างครูรายเดือน เฉพาะ role teacher */
  hourlyRate?: number;
  /** หน้าโปรดใน sidebar หลังบ้าน (href เช่น "/admin/timetable") เรียงตามที่ผู้ใช้จัด — เฉพาะ owner/teacher */
  favoriteNavs?: string[];
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
  /** ชั้นที่สนใจทั้งหมด (ผู้ปกครองเลือกได้มากกว่า 1) — grade ด้านบนคือชั้นแรกไว้ใช้ตอนอนุมัติ */
  grades?: Grade[];
  /** วิชาที่สนใจ — คีย์วิชาในระบบ หรือ "other" เมื่อกรอกเอง */
  subjects?: string[];
  /** วิชาอื่นที่ผู้ปกครองพิมพ์เอง */
  subjectOther?: string;
  school?: string;
  /** ชื่อ-สกุลภาษาอังกฤษ (ไว้ออกใบรับรอง/สื่อสารกับโรงเรียนอินเตอร์) */
  englishName?: string;
  /** วันเกิด (YYYY-MM-DD) */
  birthDate?: string;
  email?: string;
  lineId?: string;
  facebook?: string;
  /** หลักสูตรที่เรียนอยู่ที่โรงเรียน */
  program?: SchoolProgram;
  /** โรงเรียน/มหาวิทยาลัยที่ตั้งใจสอบเข้า */
  targetSchool?: string;
  /** ที่อยู่: บ้านเลขที่/หมู่/ซอย/ถนน รวมเป็นบรรทัดเดียว */
  addressLine?: string;
  subdistrict?: string;
  district?: string;
  province?: string;
  postcode?: string;
  /** เบอร์บ้าน หรือเบอร์สำรองของผู้ปกครองอีกคน */
  altPhone?: string;
  /** รู้จักสถาบันจากไหน */
  source?: string;
  note?: string;
  courseIds: string[];
  /** เวลาที่ผู้ปกครองกดยินยอม PDPA */
  pdpaConsentAt: string;
  /** ยินยอมให้ใช้ภาพ/วิดีโอของนักเรียนในสื่อประชาสัมพันธ์ — แยกจากการยินยอมเก็บข้อมูล และไม่บังคับ */
  photoConsentAt?: string;
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
  /** ชั้นอื่นที่เด็กซื้อแพ็กเพิ่ม — เปิดแบบฝึกหัดของชั้นเหล่านี้ให้ด้วย (นอกจาก grade หลัก) */
  extraGrades?: Grade[];
  school?: string;
  /** ชื่อ-สกุลภาษาอังกฤษ (ตามใบสมัคร) */
  englishName?: string;
  /** วันเกิด YYYY-MM-DD */
  birthDate?: string;
  /** หลักสูตรที่โรงเรียน: สามัญ / EP / Inter */
  program?: SchoolProgram;
  /** โรงเรียน/มหาวิทยาลัยที่ตั้งใจสอบเข้า */
  targetSchool?: string;
  /** ที่อยู่ (บ้านเลขที่ หมู่ ซอย) */
  addressLine?: string;
  subdistrict?: string;
  district?: string;
  province?: string;
  postcode?: string;
  lineId?: string;
  facebook?: string;
  /** รู้จักสถาบันจากไหน */
  source?: string;
  /** รหัสใบสมัครกระดาษ เช่น 001 ไว้ย้อนกลับไปหาเอกสารต้นฉบับ */
  formNo?: string;
  note?: string;
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
  /** ครูที่รับผิดชอบคอร์ส (id ใน users) — ใช้คิดชั่วโมงสอน ถ้าไม่ตั้งจะนับจากคนที่เช็กชื่อ */
  teacherId?: string;
  teacherName?: string;
  /** ห้องเรียน เช่น "ห้อง 1" — ใช้ตรวจว่าสองคอร์สจองห้องเดียวกันเวลาชนกันไหม */
  room?: string;
  /** วันเริ่มคอร์ส (เวลาไทย) — ต้องตรงกับ weekday ที่ตั้งไว้ */
  startDate?: string;
  /** เรียนกี่สัปดาห์ถึงจบคอร์ส (1 สัปดาห์ = 1 คาบ) */
  weeks?: number;
  capacity: number;
  active: boolean;
  /** คอร์สนี้เรียนออนไลน์ผ่าน Google Meet — ถ้าเปิดแต่ยังไม่มี meetUrl ระบบจะเตือนแอดมิน */
  online?: boolean;
  /** ลิงก์ Google Meet ถาวรของคอร์ส (https://meet.google.com/...) — ส่งให้ผู้ปกครองก่อนคาบ ห้ามส่งให้คนนอกคอร์ส */
  meetUrl?: string;
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
  /**
   * จำนวนคาบที่ผู้ปกครองจ่ายมาในคอร์สนี้ (แพ็กละ 6 ชม. = 4 คาบถ้าคาบละ 1.5 ชม.)
   * คาบคงเหลือ = sessionsPaid − คาบที่เข้าเรียนไปแล้ว คิดสดทุกครั้ง ไม่เก็บเป็นตัวเลขนิ่ง
   * ไม่ตั้ง = ไม่จำกัดคาบ (ยังไม่ได้ขายเป็นแพ็ก)
   */
  sessionsPaid?: number;
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

/** ภาพประกอบที่ครู/เจ้าของ gen แล้ววางไฟล์ไว้ที่ web/public/img/... (ไม่มีไฟล์ = ซ่อน ไม่พัง) */
export interface LessonImage {
  /** ต้องขึ้นต้นด้วย /img/ เช่น /img/science/p5/l1-c1.webp */
  src: string;
  alt: string;
  caption?: string;
}

export interface Question {
  prompt: string;
  choices: string[];
  /** ลำดับตัวเลือกที่ถูก เริ่มจาก 0 — ไม่ส่งให้เครื่องนักเรียน */
  answerIndex: number;
  explain?: string;
  /** ภาพประกอบโจทย์ (ไม่บังคับ) */
  visual?: Visual;
  /** รูปภาพประกอบโจทย์ที่ gen มา (ไม่บังคับ) */
  image?: LessonImage;
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
  /** เทอม 1 หรือ 2 (เฉพาะชุดที่เป็นบทเรียนตามหลักสูตร) */
  term?: 1 | 2;
  /** ชื่อหน่วยการเรียนรู้ ใช้จัดกลุ่มบทเรียน */
  unit?: string;
  /** ลำดับบทเรียนตลอดทั้งชั้น-วิชา (เริ่ม 1) */
  order?: number;
  /** การ์ดสอนที่นักเรียนอ่านก่อนทำโจทย์ (ไม่มี = ทำโจทย์เลย) */
  teach?: TeachCard[];
  /** เผยแพร่ให้นักเรียนเห็นแล้ว */
  published: boolean;
  /** เปิดให้นักเรียนทุกคนเห็นชุดนี้ ไม่สนชั้น/สถานะเผยแพร่ (คอลัมน์แยกไว้ตรวจเนื้อหา — ปิดก่อนเปิดใช้จริง) */
  openToAll?: boolean;
  createdAt: string;
}

/** การ์ดสอน 1 ใบในบทเรียน */
/** ภาพประกอบบทสอน/โจทย์ ที่วาดเองด้วยโค้ด (ไม่ใช้ไฟล์รูป) */
export type Visual =
  | { type: "groups"; groups: number; each: number; emoji: string; label?: string }
  | { type: "equation"; left: { text: string; label?: string }; right: { text: string; label?: string } }
  /** แผนภาพ SVG วาดด้วยโค้ด (เข็มทิศ เขตเวลา ทรงกลมฟ้า ระบบสุริยะ กลุ่มดาว มุม นาฬิกา เส้นจำนวน แผนภูมิแท่ง ฯลฯ) ดู components/Diagrams.tsx */
  | { type: "diagram"; kind: string; params: Record<string, unknown> };

export interface TeachCard {
  title: string;
  text: string;
  /** ภาพประกอบ (ไม่บังคับ) */
  visual?: Visual;
  /** ตัวอย่างทำให้ดู (ไม่บังคับ) */
  example?: string;
  /** รูปภาพประกอบการ์ดที่ gen มา (ไม่บังคับ) */
  image?: LessonImage;
}

/**
 * คลิปสอน 1 เรื่อง — จัดลำดับชั้น วิชา → ชั้น → เทอม → หน่วย → ลำดับในหน่วย
 * ไฟล์วิดีโออยู่นอกฐานข้อมูล (Firebase Storage หรือ /lessons/ ในเครื่อง) เก็บแค่ลิงก์
 * @collection lessons
 */
export interface Lesson {
  id: string;
  title: string;
  subject: Subject;
  grade: Grade;
  /** เทอม 1 หรือ 2 */
  term: 1 | 2;
  /** ชื่อหน่วยการเรียนรู้ เช่น "สารและการเปลี่ยนแปลงของสาร" */
  unit: string;
  /** ลำดับของคลิปในหน่วย (เริ่มจาก 1) */
  order: number;
  /** ลิงก์ไฟล์ .mp4 — https://... หรือ /lessons/xxx.mp4 */
  videoUrl: string;
  /** ลิงก์ซับไตเติล .srt (ไม่บังคับ) */
  subtitleUrl?: string;
  durationSec?: number;
  /** สรุปสั้น ๆ ให้ครู/เด็กอ่านก่อนดู */
  summary?: string;
  /** หัวข้อ (topic) ของชุดแบบฝึกหัดที่คู่กัน — ใช้ปุ่ม "ไปทำแบบฝึกหัด" */
  exerciseTopic?: string;
  /** เผยแพร่ให้นักเรียนชั้นนั้นเห็นแล้ว */
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
  /** โหมด "ลอง 3 ข้อ": ลำดับข้อในรอบนี้ → เลขข้อจริงในชุดโจทย์ (ไม่มี = ทำครบทั้งชุดตามลำดับ) */
  questionOrder?: number[];
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
  kind: "attendance" | "invoice" | "payment" | "weekly" | "general" | "online";
  text: string;
  status: "sent" | "queued" | "failed";
  error?: string;
  /** กุญแจกันส่งซ้ำ เช่น meet:<courseId>:<วันที่> — ใช้กับ cron ที่ถูกเรียกหลายรอบต่อวัน */
  ref?: string;
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
  /** เป้ากำไรต่อเดือน (บาท) — ใช้วัดว่าเดือนนี้ถึงเป้าหรือยัง */
  profitTargetBaht: number;
  /** บังคับให้เจ้าของ/ครูใช้รหัส 2FA ตอนเข้าระบบ — ปิดได้ชั่วคราว แต่ระบบเก็บข้อมูลเด็ก ควรเปิดไว้ */
  require2fa: boolean;
}

/**
 * งบประมาณรายจ่ายต่อเดือน แยกตามหมวด
 * id = "YYYY-MM" (งบของเดือนนั้น) หรือ "default" (งบตั้งต้นที่ใช้ทุกเดือนที่ไม่ได้ตั้งเอง)
 * @collection budgets
 */
export interface Budget {
  id: string;
  /** หมวดไหนตั้งงบไว้เท่าไร (บาท/เดือน) — หมวดที่ไม่ได้ตั้ง = ไม่คุมงบ */
  amounts: Partial<Record<ExpenseCategory, number>>;
  updatedBy: string;
  updatedAt: string;
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

/**
 * รายจ่ายของสถาบัน — ทั้งค่าใช้จ่ายดำเนินงานและของใช้เบ็ดเตล็ด
 * kind แยกสองกลุ่มไม่ให้นับซ้ำกันในรายงาน
 * @collection expenses
 */
export interface Expense {
  id: string;
  /** วันที่จ่ายเงินจริง (เวลาไทย) — ใช้จัดกลุ่มรายเดือน */
  date: string;
  /** operating = ค่าใช้จ่ายดำเนินงาน · supply = ของใช้เบ็ดเตล็ด/วัสดุสิ้นเปลือง */
  kind: ExpenseKind;
  category: ExpenseCategory;
  /** ชื่อรายการ เช่น "ค่าสอนอังกฤษ 6 ชม." หรือ "กระดาษ A4" */
  detail: string;
  /** จำนวนที่ซื้อ (ของใช้เบ็ดเตล็ด) */
  qty?: number;
  /** ราคาต่อหน่วย (บาท) */
  unitPrice?: number;
  /** ยอดรวมที่จ่ายจริง (บาท) — ของใช้เบ็ดเตล็ดคิดจาก qty × unitPrice */
  amount: number;
  method: "cash" | "transfer";
  /** ร้านค้า/ผู้รับเงิน */
  vendor?: string;
  /** รายจ่ายประจำทุกเดือน (ค่าเช่า เงินเดือน) — ใช้แยกจากรายจ่ายครั้งเดียว */
  recurring?: boolean;
  note?: string;
  /** ค่าจ้างครูที่ระบบสร้างให้: "<teacherId>:<YYYY-MM>" — กันสร้างซ้ำเดือนเดียวกัน */
  payrollRef?: string;
  /** ซื้อของชิ้นนี้เข้าคลัง (id ใน supply_items) — ระบบจะบวกจำนวนเข้าคลังให้อัตโนมัติ */
  supplyItemId?: string;
  /** มีรูปใบเสร็จแนบอยู่ใน collection receipts */
  hasReceipt?: boolean;
  /** id ผู้ใช้ที่บันทึก */
  createdBy: string;
  createdAt: string;
}

/**
 * รูปใบเสร็จของรายจ่าย (id = expenseId) เก็บเป็น data URL ที่ย่อแล้ว
 * แยก collection เพื่อให้รายการรายจ่ายโหลดเร็ว ไม่ลากรูปมาด้วย
 * @collection receipts
 */
export interface Receipt {
  id: string;
  dataUrl: string;
  uploadedBy: string;
  uploadedAt: string;
}

/**
 * คะแนนวัดระดับของนักเรียน — ก่อนเรียน / ระหว่างเรียน / หลังจบคอร์ส
 * ใช้ดูพัฒนาการจริงเทียบจุดเริ่มต้น และให้ผู้ปกครองเห็นว่าจ่ายค่าเรียนแล้วได้อะไร
 * @collection assessments
 */
export interface Assessment {
  id: string;
  studentId: string;
  /** คอร์สที่วัด (ไม่บังคับ เช่น สอบวัดระดับตอนสมัครยังไม่ลงคอร์ส) */
  courseId?: string;
  subject: Subject;
  kind: AssessmentKind;
  /** วันที่สอบ (เวลาไทย) */
  date: string;
  score: number;
  /** คะแนนเต็ม — เก็บไว้เพราะข้อสอบแต่ละชุดเต็มไม่เท่ากัน */
  maxScore: number;
  /** ข้อสังเกตของครู เช่น "อ่านโจทย์ไม่ทัน" */
  note?: string;
  /** id ผู้ใช้ที่บันทึก */
  recordedBy: string;
  createdAt: string;
}

/**
 * ของใช้ในคลัง เช่น กระดาษ A4 ทิชชู ปากกาไวท์บอร์ด
 * จำนวนคงเหลือไม่ได้เก็บไว้ที่นี่ แต่คิดจากผลรวมของ supply_moves เสมอ (กันตัวเลขเพี้ยนสะสม)
 * @collection supply_items
 */
export interface SupplyItem {
  id: string;
  name: string;
  /** หน่วยนับ เช่น รีม ม้วน กล่อง ด้าม */
  unit: string;
  category: ExpenseCategory;
  /** เตือนเมื่อเหลือน้อยกว่าหรือเท่ากับจำนวนนี้ */
  minQty?: number;
  note?: string;
  createdAt: string;
}

/**
 * การเคลื่อนไหวของของใช้: รับเข้า (ซื้อ) หรือเบิกออก (เอาไปใช้)
 * รายการที่มาจากการซื้อ id = "exp-<expenseId>" เพื่อให้แก้/ลบรายจ่ายแล้วคลังตามทันเสมอ
 * @collection supply_moves
 */
export interface SupplyMove {
  id: string;
  itemId: string;
  date: string;
  kind: "in" | "out";
  qty: number;
  /** รายจ่ายที่ทำให้เกิดการรับเข้า */
  expenseId?: string;
  note?: string;
  by: string;
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
