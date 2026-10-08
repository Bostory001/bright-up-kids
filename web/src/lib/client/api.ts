"use client";

import { useCallback, useEffect, useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- รูปร่างข้อมูลกำหนดโดยแต่ละ route ฝั่ง server
export async function api<T = any>(path: string, body?: unknown, method?: string): Promise<T> {
  const res = await fetch(`/api/${path}`, {
    method: method ?? (body === undefined ? "GET" : "POST"),
    headers: body === undefined ? undefined : { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({ error: "ระบบขัดข้อง" }));
  if (!res.ok) throw new Error(data.error ?? "ระบบขัดข้อง");
  return data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useLoad<T = any>(path: string | null) {
  const [state, setState] = useState<{ path?: string; data?: T; error?: string }>({});
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!path) return;
    let alive = true;
    api<T>(path).then(
      (data) => alive && setState({ path, data }),
      (err: Error) => alive && setState({ path, error: err.message }),
    );
    return () => {
      alive = false;
    };
  }, [path, tick]);
  const reload = useCallback(() => setTick((t) => t + 1), []);
  // ข้อมูลของ path เก่าไม่เอามาแสดงกับ path ใหม่
  const current = state.path === path ? state : {};
  return { data: current.data, error: current.error, reload };
}

export function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// เปลี่ยนหน้าแบบโหลดใหม่ทั้งหน้า — ใช้หลัง login/logout เพื่อล้าง state ของผู้ใช้คนก่อน
export function go(path: string) {
  window.location.assign(path);
}
