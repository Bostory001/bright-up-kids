import "server-only";
import { randomBytes, randomInt } from "node:crypto";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

// จำกัดความถี่ต่อ IP แบบง่าย (อยู่ในหน่วยความจำของ instance — บน Vercel แต่ละ instance นับแยกกัน)
// การล็อกบัญชีเมื่อผิด 5 ครั้งยังเป็นด่านหลัก อันนี้กันการไล่เดาข้ามหลายบัญชี
const hits = new Map<string, number[]>();

export function rateLimit(req: Request, bucket: string, max: number, windowMs: number) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  const key = `${bucket}:${ip}`;
  const recent = (hits.get(key) ?? []).filter((t) => t > Date.now() - windowMs);
  if (recent.length >= max) throw new HttpError(429, "ลองบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่");
  hits.set(key, [...recent, Date.now()]);
}

export function newId(): string {
  return randomBytes(9).toString("base64url");
}

export function nowIso(): string {
  return new Date().toISOString();
}

// วันที่ตามเวลาไทย (UTC+7) — server บน Vercel เป็น UTC ห้ามใช้ toISOString ตรง ๆ
export function bkkDate(d: Date = new Date()): string {
  return new Date(d.getTime() + 7 * 3600_000).toISOString().slice(0, 10);
}

export function randomDigits(n: number): string {
  return Array.from({ length: n }, () => randomInt(10)).join("");
}

export function str(v: unknown, field: string, max = 200): string {
  if (typeof v !== "string" || !v.trim()) throw new HttpError(400, `กรุณากรอก ${field}`);
  if (v.length > max) throw new HttpError(400, `${field} ยาวเกินไป`);
  return v.trim();
}

export function optStr(v: unknown, max = 200): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim().slice(0, max) : undefined;
}

export function num(v: unknown, field: string, min = 0, max = 1e9): number {
  if (typeof v === "string" && !v.trim()) throw new HttpError(400, `${field} ไม่ถูกต้อง`);
  const n = typeof v === "string" ? Number(v) : v;
  if (typeof n !== "number" || !Number.isFinite(n) || n < min || n > max) throw new HttpError(400, `${field} ไม่ถูกต้อง`);
  return n;
}

export function oneOf<T extends string | number>(v: unknown, options: readonly T[], field: string): T {
  if (!options.includes(v as T)) throw new HttpError(400, `${field} ไม่ถูกต้อง`);
  return v as T;
}

export function dateStr(v: unknown, field: string): string {
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v)) throw new HttpError(400, `${field} ต้องเป็นวันที่`);
  const parsed = new Date(`${v}T00:00:00.000Z`);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== v) {
    throw new HttpError(400, `${field} ต้องเป็นวันที่ที่มีอยู่จริง`);
  }
  return v;
}
