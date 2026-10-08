"use client";

import { useEffect } from "react";

// ลงทะเบียน service worker เฉพาะ production — ตอน dev จะ cache ไฟล์เก่าจนสับสน
export function RegisterSw() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}
