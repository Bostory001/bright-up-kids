import type { Achievement, AvatarItem, PlayerProfile } from "./types";

// กติกาเกมทั้งหมดอยู่ไฟล์นี้ไฟล์เดียว (pure function) — ปรับสมดุลที่นี่
// หมายเหตุ: ตอนต่อ Firestore จริง ต้องคำนวณฝั่ง server เท่านั้น ไม่งั้นเด็กแก้ XP เองได้

export const XP_PER_CORRECT = 10;
export const XP_PERFECT_BONUS = 20;
export const COINS_PER_EXERCISE = 5;

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
  { id: "streak_3", name: "ขยัน 3 วันติด", description: "เข้ามาฝึก 3 วันติดกัน", emoji: "🔥", coins: 15, check: (p) => p.dayStreak >= 3 },
  { id: "streak_7", name: "ขยัน 7 วันติด", description: "เข้ามาฝึก 7 วันติดกัน", emoji: "🌟", coins: 40, check: (p) => p.dayStreak >= 7 },
  { id: "q_100", name: "ร้อยข้อ", description: "ตอบคำถามครบ 100 ข้อ", emoji: "📚", coins: 30, check: (p) => p.questionsAnswered >= 100 },
  { id: "level_5", name: "พลังระดับ 5", description: "เลเวลถึง 5", emoji: "⚡", coins: 25, check: (p) => levelFromXp(p.xp) >= 5 },
];

export const AVATAR_ITEMS: AvatarItem[] = [
  { id: "body_default", slot: "body", name: "น้องไบรท์", emoji: "🧒", unlock: {} },
  { id: "hat_cap", slot: "hat", name: "หมวกแก๊ป", emoji: "🧢", unlock: { level: 2 } },
  { id: "pet_cat", slot: "pet", name: "แมวเหมียว", emoji: "🐱", unlock: { achievementId: "first_step" } },
  { id: "hat_crown", slot: "hat", name: "มงกุฎ", emoji: "👑", unlock: { achievementId: "perfect" } },
  { id: "outfit_hero", slot: "outfit", name: "ชุดฮีโร่", emoji: "🦸", unlock: { level: 4 } },
  { id: "pet_dragon", slot: "pet", name: "มังกรน้อย", emoji: "🐲", unlock: { achievementId: "streak_7" } },
];

export function newProfile(studentId: string): PlayerProfile {
  return {
    studentId,
    xp: 0,
    coins: 0,
    questionsAnswered: 0,
    exercisesDone: 0,
    perfectRuns: 0,
    dayStreak: 0,
    achievementIds: [],
    ownedItemIds: ["body_default"],
    equipped: { body: "body_default" },
  };
}

function dayDiff(from: string, to: string): number {
  return Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000);
}

export interface RunResult {
  profile: PlayerProfile;
  xpEarned: number;
  coinsEarned: number;
  leveledUp: boolean;
  newAchievements: Achievement[];
  newItems: AvatarItem[];
}

// คิดผลหลังทำแบบฝึกหัดจบ 1 ชุด: XP, เหรียญ, streak, achievement ใหม่, ไอเทมที่ปลดล็อก
export function applyRun(prev: PlayerProfile, correct: number, total: number, today: string): RunResult {
  const perfect = total > 0 && correct === total;
  const xpEarned = correct * XP_PER_CORRECT + (perfect ? XP_PERFECT_BONUS : 0);

  let dayStreak = prev.dayStreak;
  if (prev.lastPlayedDate !== today) {
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

  return { profile, xpEarned, coinsEarned, leveledUp: level > levelFromXp(prev.xp), newAchievements, newItems };
}
