"use client";

import { createContext, useContext } from "react";

export interface Me {
  role: "owner" | "teacher" | "parent" | "student";
  displayName: string;
  totpEnabled: boolean;
  mustChangePassword: boolean;
  /** หน้าโปรดใน sidebar (href) เรียงตามที่ผู้ใช้จัด */
  favoriteNavs?: string[];
}

export const MeContext = createContext<{ me: Me; reload: () => void } | null>(null);
export const useMe = () => useContext(MeContext)!;
