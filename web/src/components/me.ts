"use client";

import { createContext, useContext } from "react";

export interface Me {
  role: "owner" | "teacher" | "parent" | "student";
  displayName: string;
  totpEnabled: boolean;
  mustChangePassword: boolean;
}

export const MeContext = createContext<{ me: Me; reload: () => void } | null>(null);
export const useMe = () => useContext(MeContext)!;
