import "server-only";
import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { AppUser, AuthSession, Role, Student } from "../types";
import { getStore } from "./store";
import { HttpError } from "./util";

export const SESSION_COOKIE = "buk_session";
const MAX_FAILS = 5;
const LOCK_MINUTES = 10;
const SESSION_HOURS: Record<Role, number> = { owner: 12, teacher: 12, student: 12, parent: 24 * 30 };

// ---------- รหัสผ่าน / PIN ----------

export function hashSecret(secret: string): string {
  const salt = randomBytes(16);
  return `${salt.toString("hex")}:${scryptSync(secret, salt, 32).toString("hex")}`;
}

export function verifySecret(secret: string, stored: string): boolean {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(secret, Buffer.from(saltHex, "hex"), expected.length);
  return timingSafeEqual(actual, expected);
}

export function checkPasswordStrength(pw: unknown): string {
  if (typeof pw !== "string" || pw.length < 8) throw new HttpError(400, "รหัสผ่านต้องยาวอย่างน้อย 8 ตัวอักษร");
  if (pw.length > 100) throw new HttpError(400, "รหัสผ่านยาวเกินไป");
  return pw;
}

// ---------- TOTP (RFC 6238: SHA1, 30 วินาที, 6 หลัก) ----------

const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function newTotpSecret(): string {
  let bits = "";
  for (const byte of randomBytes(20)) bits += byte.toString(2).padStart(8, "0");
  let out = "";
  for (let i = 0; i < bits.length; i += 5) out += B32[parseInt(bits.slice(i, i + 5), 2)];
  return out;
}

function base32Decode(s: string): Buffer {
  let bits = "";
  for (const ch of s.replace(/=+$/, "").toUpperCase()) {
    const v = B32.indexOf(ch);
    if (v >= 0) bits += v.toString(2).padStart(5, "0");
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(bytes);
}

export function totpCode(secret: string, timeMs: number = Date.now()): string {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(timeMs / 30_000)));
  const hmac = createHmac("sha1", base32Decode(secret)).update(counter).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const code = (hmac.readUInt32BE(offset) & 0x7fffffff) % 1_000_000;
  return String(code).padStart(6, "0");
}

export function verifyTotp(secret: string, code: unknown): boolean {
  if (typeof code !== "string" || !/^\d{6}$/.test(code)) return false;
  const now = Date.now();
  // ยอมให้นาฬิกาคลาดได้ ±30 วินาที
  return [-1, 0, 1].some((step) => {
    const expected = Buffer.from(totpCode(secret, now + step * 30_000));
    return timingSafeEqual(expected, Buffer.from(code));
  });
}

export function totpUri(secret: string, username: string): string {
  const label = encodeURIComponent(`Bright Up Kids:${username}`);
  return `otpauth://totp/${label}?secret=${secret}&issuer=${encodeURIComponent("Bright Up Kids")}`;
}

// ---------- กันเดารหัส ----------

interface Lockable {
  failedLogins?: number;
  lockedUntil?: string;
}

export function assertNotLocked(target: Lockable) {
  if (target.lockedUntil && Date.parse(target.lockedUntil) > Date.now()) {
    throw new HttpError(429, `ใส่รหัสผิดหลายครั้ง กรุณารอ ${LOCK_MINUTES} นาทีแล้วลองใหม่`);
  }
}

export function registerFailure<T extends Lockable>(target: T): T {
  const fails = (target.failedLogins ?? 0) + 1;
  return fails >= MAX_FAILS
    ? { ...target, failedLogins: 0, lockedUntil: new Date(Date.now() + LOCK_MINUTES * 60_000).toISOString() }
    : { ...target, failedLogins: fails };
}

// ---------- session ----------

const tokenId = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createSession(role: Role, subjectId: string) {
  const token = randomBytes(32).toString("base64url");
  const maxAge = SESSION_HOURS[role] * 3600;
  const session: AuthSession = {
    id: tokenId(token),
    role,
    subjectId,
    expiresAt: new Date(Date.now() + maxAge * 1000).toISOString(),
  };
  const store = await getStore();
  // เก็บกวาด session ที่หมดอายุของคนนี้ ไม่ให้สะสม
  for (const old of await store.list<AuthSession>("auth_sessions", { subjectId })) {
    if (Date.parse(old.expiresAt) < Date.now()) await store.remove("auth_sessions", old.id);
  }
  await store.set("auth_sessions", session);
  return { token, maxAge };
}

export async function destroySession(token: string) {
  await (await getStore()).remove("auth_sessions", tokenId(token));
}

export type Principal =
  | { role: "owner" | "teacher" | "parent"; id: string; user: AppUser }
  | { role: "student"; id: string; student: Student };

export async function resolveSession(token: string | undefined): Promise<Principal | null> {
  if (!token) return null;
  const store = await getStore();
  const session = await store.get<AuthSession>("auth_sessions", tokenId(token));
  if (!session) return null;
  if (Date.parse(session.expiresAt) < Date.now()) {
    await store.remove("auth_sessions", session.id);
    return null;
  }
  if (session.role === "student") {
    const student = await store.get<Student>("students", session.subjectId);
    return student?.active ? { role: "student", id: student.id, student } : null;
  }
  const user = await store.get<AppUser>("users", session.subjectId);
  return user?.active ? { role: user.role, id: user.id, user } : null;
}

export function publicUser(u: AppUser) {
  return {
    id: u.id,
    role: u.role,
    username: u.username,
    displayName: u.displayName,
    phone: u.phone,
    totpEnabled: Boolean(u.totpEnabled),
    mustChangePassword: Boolean(u.mustChangePassword),
    lineLinked: Boolean(u.lineUserId),
    active: u.active,
    createdAt: u.createdAt,
  };
}

export function publicStudent(s: Student) {
  return omit(s, ["pinHash", "failedLogins", "lockedUntil"]);
}

export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const copy = { ...obj };
  for (const k of keys) delete copy[k];
  return copy;
}