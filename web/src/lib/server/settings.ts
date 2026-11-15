import "server-only";
import { DEFAULT_SETTINGS } from "../gamification";
import type { Settings } from "../types";
import type { Store } from "./store";

export async function getSettings(store: Store): Promise<Settings> {
  return { ...DEFAULT_SETTINGS, ...(await store.get<Settings>("settings", "main")) };
}

// ด่านตรวจสิทธิ์เรียกทุก request จึงจำค่าไว้สั้น ๆ ไม่ให้ยิง Firestore ทุกครั้ง
// (แก้ตั้งค่าแล้วมีผลช้าสุด 10 วินาที)
let cached: { at: number; settings: Settings } | null = null;

export async function getSettingsCached(store: Store): Promise<Settings> {
  if (!cached || Date.now() - cached.at > 10_000) cached = { at: Date.now(), settings: await getSettings(store) };
  return cached.settings;
}

export function clearSettingsCache() {
  cached = null;
}
