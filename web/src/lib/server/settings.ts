import "server-only";
import { DEFAULT_SETTINGS } from "../gamification";
import type { Settings } from "../types";
import type { Store } from "./store";

export async function getSettings(store: Store): Promise<Settings> {
  return { ...DEFAULT_SETTINGS, ...(await store.get<Settings>("settings", "main")) };
}
