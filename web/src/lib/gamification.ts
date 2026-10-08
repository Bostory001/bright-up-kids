import type { Achievement, AvatarItem, PlayerProfile } from "./types";

// กติกาเกมทั้งหมดอยู่ไฟล์นี้ไฟล์เดียว (pure function) — ปรับสมดุลที่นี่
// เรียกจาก server เท่านั้นตอนคิดคะแนน (lib/server/play.ts) ฝั่ง client ใช้แค่แสดงผล

export const XP_PER_CORRECT = 10;
export const XP_PERFECT_BONUS = 20;
export const COINS_PER_EXERCISE = 5;

// ลิมิตรายวัน: ถึงเพดานข้อใดข้อหนึ่งแล้วยังทำต่อได้ แต่ไม่นับ XP/เหรียญ/สถิติ
export const DAILY_LIMIT_SECONDS = 3 * 60 * 60;
export const DAILY_LIMIT_QUESTIONS = 100; // ค่าเริ่มต้น รอเจ้าของยืนยัน

// งบของรางวัล: ครูอนุมัติแลกได้ไม่เกินยอดนี้ต่อเดือน
export const MONTHLY_REWARD_BUDGET_BAHT = 3000;

// ค่า royalty ที่ต้องส่ง HQ คิดจากยอดรับค่าเรียน — ตรวจกับสัญญาก่อนใช้จริง
export const ROYALTY_RATE = 0.23;

export function canApproveRedemption(spentThisMonthBaht: number, rewardCostBaht: number): boolean {
  return spentThisMonthBaht + rewardCostBaht <= MONTHLY_REWARD_BUDGET_BAHT;
}

export function isDailyLimitReached(p: PlayerProfile, today: string): boolean {
  if (p.lastPlayedDate !== today) return false;
  return p.todaySeconds >= DAILY_LIMIT_SECONDS || p.todayQuestions >= DAILY_LIMIT_QUESTIONS;
}

// เลเวล n ต้องใช้ XP สะสม 50 * (n-1)^2 → Lv2=50, Lv3=200, Lv4=450, Lv5=800
export function levelFromXp(xp: number): number {
  return Math.floor(Math.sqrt(xp / 50)) + 1;
}

export function xpForLevel(level: number): number {
  return 50 * (level - 1) ** 2;
}

export function levelProgress(xp: number) {
  const level = levelFromXp(xp);
  const floor = xpForLevel(level);
  const next = xpForLevel(level + 1);
  return { level, current: xp - floor, needed: next - floor, percent: ((xp - floor) / (next - floor)) * 100 };
}

export const POWER_TITLES = ["นักเรียนฝึกหัด", "นักสู้ตัวจิ๋ว", "ผู้กล้า", "อัศวิน", "จอมเวท", "ตำนาน"];

export function powerTitle(level: number): string {
  return POWER_TITLES[Math.min(Math.floor((level - 1) / 2), POWER_TITLES.length - 1)];
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first_step", name: "ก้าวแรก", description: "ทำแบบฝึกหัดครบ 1 ชุด", emoji: "👣", coins: 5, check: (p) => p.exercisesDone >= 1 },
  { id: "perfect", name: "เต็มร้อย", description: "ตอบถูกทุกข้อใน 1 ชุด", emoji: "💯", coins: 10, check: (p) => p.perfectRuns >= 1 },
  { id: "perfect_5", name: "เทพเต็มร้อย", description: "ตอบถูกทุกข้อครบ 5 ชุด", emoji: "🏆", coins: 30, check: (p) => p.perfectRuns >= 5 },
  { id: "streak_3", name: "ขยัน 3 วันติด", description: "เข้ามาฝึก 3 วันติดกัน", emoji: "🔥", coins: 15, check: (p) => p.dayStreak >= 3 },
  { id: "streak_7", name: "ขยัน 7 วันติด", description: "เข้ามาฝึก 7 วันติดกัน", emoji: "🌟", coins: 40, check: (p) => p.dayStreak >= 7 },
  { id: "q_100", name: "ร้อยข้อ", description: "ตอบคำถามครบ 100 ข้อ", emoji: "📚", coins: 30, check: (p) => p.questionsAnswered >= 100 },
  { id: "level_5", name: "พลังระดับ 5", description: "เลเวลถึง 5", emoji: "⚡", coins: 25, check: (p) => levelFromXp(p.xp) >= 5 },
];

// รูปจริงวาดใน components/AvatarSvg.tsx ตาม id — เพิ่มไอเทมต้องเพิ่มทั้งสองที่
export const AVATAR_ITEMS: AvatarItem[] = [
  { id: "bg_sky", slot: "background", name: "ท้องฟ้า", emoji: "🌤️", unlock: {} },
  { id: "outfit_uniform", slot: "outfit", name: "ชุดนักเรียน", emoji: "👕", unlock: {} },
  { id: "hat_cap", slot: "hat", name: "หมวกแก๊ป", emoji: "🧢", unlock: { level: 2 } },
  { id: "pet_cat", slot: "pet", name: "แมวเหมียว", emoji: "🐱", unlock: { achievementId: "first_step" } },
  { id: "bg_space", slot: "background", name: "อวกาศ", emoji: "🌌", unlock: { level: 3 } },
  { id: "hat_crown", slot: "hat", name: "มงกุฎ", emoji: "👑", unlock: { achievementId: "perfect" } },
  { id: "outfit_hero", slot: "outfit", name: "ชุดฮีโร่", emoji: "🦸", unlock: { level: 4 } },
  { id: "hat_wizard", slot: "hat", name: "หมวกจอมเวท", emoji: "🧙", unlock: { achievementId: "q_100" } },
  { id: "outfit_knight", slot: "outfit", name: "เกราะอัศวิน", emoji: "🛡️", unlock: { level: 6 } },
  { id: "bg_castle", slot: "background", name: "ปราสาท", emoji: "🏰", unlock: { achievementId: "perfect_5" } },
  { id: "pet_dragon", slot: "pet", name: "มังกรน้อย", emoji: "🐲", unlock: { achievementId: "streak_7" } },
];

export function newProfile(studentId: string): PlayerProfile {
  return {
    id: studentId,
    xp: 0,
    coins: 0,
    questionsAnswered: 0,
    exercisesDone: 0,
    perfectRuns: 0,
    dayStreak: 0,
    todayQuestions: 0,
    todaySeconds: 0,
    achievementIds: [],
    ownedItemIds: ["bg_sky", "outfit_uniform"],
    equipped: { background: "bg_sky", outfit: "outfit_uniform" },
  };
}

function dayDiff(from: string, to: string): number {
  return Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000);
}

export interface RunResult {
  profile: PlayerProfile;
  counted: boolean; // false = เกินลิมิตรายวัน รอบนี้ไม่นับ
  xpEarned: number;
  coinsEarned: number;
  leveledUp: boolean;
  newAchievementIds: string[];
  newItemIds: string[];
}

// คิดผลหลังทำแบบฝึกหัดจบ 1 ชุด: XP, เหรียญ, streak, achievement ใหม่, ไอเทมที่ปลดล็อก
export function applyRun(prev: PlayerProfile, correct: number, total: number, durationSec: number, today: string): RunResult {
  const sameDay = prev.lastPlayedDate === today;
  const todayQuestions = (sameDay ? prev.todayQuestions : 0) + total;
  const todaySeconds = (sameDay ? prev.todaySeconds : 0) + durationSec;

  if (isDailyLimitReached(prev, today)) {
    return {
      profile: { ...prev, todayQuestions, todaySeconds },
      counted: false,
      xpEarned: 0,
      coinsEarned: 0,
      leveledUp: false,
      newAchievementIds: [],
      newItemIds: [],
    };
  }

  const perfect = total > 0 && correct === total;
  const xpEarned = correct * XP_PER_CORRECT + (perfect ? XP_PERFECT_BONUS : 0);

  let dayStreak = prev.dayStreak;
  if (!sameDay) {
    dayStreak = prev.lastPlayedDate && dayDiff(prev.lastPlayedDate, today) === 1 ? prev.dayStreak + 1 : 1;
  }

  const profile: PlayerProfile = {
    ...prev,
    xp: prev.xp + xpEarned,
    questionsAnswered: prev.questionsAnswered + total,
    exercisesDone: prev.exercisesDone + 1,
    perfectRuns: prev.perfectRuns + (perfect ? 1 : 0),
    dayStreak,
    lastPlayedDate: today,
    todayQuestions,
    todaySeconds,
  };

  const newAchievements = ACHIEVEMENTS.filter((a) => !prev.achievementIds.includes(a.id) && a.check(profile));
  profile.achievementIds = [...prev.achievementIds, ...newAchievements.map((a) => a.id)];

  const coinsEarned = COINS_PER_EXERCISE + newAchievements.reduce((sum, a) => sum + a.coins, 0);
  profile.coins = prev.coins + coinsEarned;

  const level = levelFromXp(profile.xp);
  const newItems = AVATAR_ITEMS.filter(
    (item) =>
      !prev.ownedItemIds.includes(item.id) &&
      (item.unlock.level === undefined || level >= item.unlock.level) &&
      (item.unlock.achievementId === undefined || profile.achievementIds.includes(item.unlock.achievementId)),
  );
  profile.ownedItemIds = [...prev.ownedItemIds, ...newItems.map((i) => i.id)];

  return {
    profile,
    counted: true,
    xpEarned,
    coinsEarned,
    leveledUp: level > levelFromXp(prev.xp),
    newAchievementIds: newAchievements.map((a) => a.id),
    newItemIds: newItems.map((i) => i.id),
  };
}
