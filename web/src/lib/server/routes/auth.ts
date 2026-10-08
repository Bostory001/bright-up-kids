import "server-only";
import QRCode from "qrcode";
import type { AppUser, AuthSession, Student } from "../../types";
import {
  assertNotLocked,
  checkPasswordStrength,
  createSession,
  destroySession,
  hashSecret,
  newTotpSecret,
  passwordInput,
  publicStudent,
  publicUser,
  registerFailure,
  totpUri,
  verifySecret,
  verifyTotp,
} from "../auth";
import { OWNER, route, STAFF, staffUser } from "../router";
import { HttpError, newId, nowIso, oneOf, optStr, randomDigits, rateLimit, str } from "../util";

const ANY_USER = ["owner", "teacher", "parent"] as const;
const normalize = (username: string) => username.trim().toLowerCase();

route("GET", "status", "public", async ({ store }) => {
  const users = await store.list<AppUser>("users");
  return { needsSetup: users.length === 0, store: store.kind };
});

// ตั้งค่าครั้งแรก: สร้างบัญชีเจ้าของ ทำได้เฉพาะตอนยังไม่มีผู้ใช้เลย
route("POST", "setup", "public", async ({ store, body, setSession }) => {
  if ((await store.list<AppUser>("users")).length > 0) throw new HttpError(403, "ตั้งค่าระบบไปแล้ว");
  const user: AppUser = {
    id: newId(),
    role: "owner",
    username: normalize(str(body.username, "ชื่อเข้าระบบ", 50)),
    displayName: str(body.displayName, "ชื่อที่แสดง", 80),
    passwordHash: hashSecret(checkPasswordStrength(body.password)),
    active: true,
    createdAt: nowIso(),
  };
  await store.set("users", user);
  const s = await createSession("owner", user.id);
  setSession(s.token, s.maxAge);
  return { ok: true };
});

route("POST", "auth/login", "public", async ({ store, body, setSession, req }) => {
  rateLimit(req, "login", 40, 10 * 60_000);
  const username = normalize(str(body.username, "ชื่อเข้าระบบ", 50));
  const password = passwordInput(body.password);
  const [user] = await store.list<AppUser>("users", { username });
  if (!user || !user.active) throw new HttpError(401, "ชื่อเข้าระบบหรือรหัสผ่านไม่ถูกต้อง");
  assertNotLocked(user);

  if (!verifySecret(password, user.passwordHash)) {
    await store.set("users", registerFailure(user));
    throw new HttpError(401, "ชื่อเข้าระบบหรือรหัสผ่านไม่ถูกต้อง");
  }
  if (user.totpEnabled && user.totpSecret) {
    if (!body.code) return { needsCode: true };
    if (!verifyTotp(user.totpSecret, body.code)) {
      await store.set("users", registerFailure(user));
      throw new HttpError(401, "รหัส 2FA ไม่ถูกต้อง");
    }
  }
  await store.set("users", { ...user, failedLogins: 0, lockedUntil: undefined });
  const s = await createSession(user.role, user.id);
  setSession(s.token, s.maxAge);
  return { ok: true, role: user.role };
});

// นักเรียน: รหัสนักเรียน (หรือสแกน QR บนบัตร) + PIN 4 หลัก
route("POST", "auth/student", "public", async ({ store, body, setSession, req }) => {
  rateLimit(req, "student-login", 60, 10 * 60_000);
  const code = str(body.code, "รหัสนักเรียน", 20).toUpperCase();
  const pin = str(body.pin, "PIN", 10);
  const [student] = await store.list<Student>("students", { code });
  if (!student || !student.active) throw new HttpError(401, "รหัสนักเรียนหรือ PIN ไม่ถูกต้อง");
  assertNotLocked(student);
  if (!verifySecret(pin, student.pinHash)) {
    await store.set("students", registerFailure(student));
    throw new HttpError(401, "รหัสนักเรียนหรือ PIN ไม่ถูกต้อง");
  }
  await store.set("students", { ...student, failedLogins: 0, lockedUntil: undefined });
  const s = await createSession("student", student.id);
  setSession(s.token, s.maxAge);
  return { ok: true };
});

route("POST", "auth/logout", "public", async ({ token, clearSession }) => {
  if (token) await destroySession(token);
  clearSession();
  return { ok: true };
});

route("GET", "me", "public", async ({ me }) => {
  if (!me) return { me: null };
  if (me.role === "student") return { me: { role: "student", ...publicStudent(me.student) } };
  return { me: publicUser(me.user) };
});

// ---------- 2FA ----------

route(
  "POST",
  "auth/2fa/begin",
  STAFF,
  async (ctx) => {
    const user = staffUser(ctx);
    if (user.totpEnabled) throw new HttpError(400, "เปิดใช้ 2FA อยู่แล้ว");
    const secret = newTotpSecret();
    await ctx.store.set("users", { ...user, totpSecret: secret });
    const uri = totpUri(secret, user.username);
    return { secret, qr: await QRCode.toDataURL(uri, { margin: 1, width: 240 }) };
  },
  { allowWithout2fa: true },
);

route(
  "POST",
  "auth/2fa/enable",
  STAFF,
  async (ctx) => {
    const user = staffUser(ctx);
    if (!user.totpSecret) throw new HttpError(400, "ยังไม่ได้เริ่มตั้งค่า 2FA");
    if (!verifyTotp(user.totpSecret, ctx.body.code)) throw new HttpError(400, "รหัสไม่ถูกต้อง ลองใหม่อีกครั้ง");
    await ctx.store.set("users", { ...user, totpEnabled: true });
    return { ok: true };
  },
  { allowWithout2fa: true },
);

route(
  "POST",
  "auth/password",
  ANY_USER,
  async (ctx) => {
    const user = staffUser(ctx);
    if (!verifySecret(passwordInput(ctx.body.current), user.passwordHash)) throw new HttpError(400, "รหัสผ่านเดิมไม่ถูกต้อง");
    await ctx.store.set("users", {
      ...user,
      passwordHash: hashSecret(checkPasswordStrength(ctx.body.next)),
      mustChangePassword: false,
    });
    for (const session of await ctx.store.list<AuthSession>("auth_sessions", { subjectId: user.id, role: user.role })) {
      await ctx.store.remove("auth_sessions", session.id);
    }
    const session = await createSession(user.role, user.id);
    ctx.setSession(session.token, session.maxAge);
    return { ok: true };
  },
  { allowWithout2fa: true },
);

// ---------- จัดการผู้ใช้ (เจ้าของเท่านั้น) ----------

route("GET", "admin/users", OWNER, async ({ store }) => {
  const users = await store.list<AppUser>("users");
  return { users: users.map(publicUser).sort((a, b) => a.role.localeCompare(b.role)) };
});

route("POST", "admin/users", OWNER, async ({ store, body }) => {
  const username = normalize(str(body.username, "ชื่อเข้าระบบ", 50));
  if ((await store.list<AppUser>("users", { username })).length) throw new HttpError(400, "ชื่อเข้าระบบนี้ถูกใช้แล้ว");
  const tempPassword = `buk-${randomDigits(6)}`;
  const user: AppUser = {
    id: newId(),
    role: oneOf(body.role, ["teacher", "parent"] as const, "บทบาท"),
    username,
    displayName: str(body.displayName, "ชื่อที่แสดง", 80),
    phone: optStr(body.phone, 20),
    passwordHash: hashSecret(tempPassword),
    mustChangePassword: true,
    active: true,
    createdAt: nowIso(),
  };
  await store.set("users", user);
  return { user: publicUser(user), tempPassword };
});

// รีเซ็ตรหัสผ่าน + ล้าง 2FA (กรณีทำมือถือหาย) / เปิด-ปิดบัญชี
route("POST", "admin/users/:id/reset", OWNER, async ({ store, params }) => {
  const user = await store.get<AppUser>("users", params.id);
  if (!user) throw new HttpError(404, "ไม่พบผู้ใช้");
  const tempPassword = `buk-${randomDigits(6)}`;
  await store.set("users", {
    ...user,
    passwordHash: hashSecret(tempPassword),
    mustChangePassword: true,
    totpEnabled: false,
    totpSecret: undefined,
    failedLogins: 0,
    lockedUntil: undefined,
  });
  // เตะ session เดิมออกทั้งหมด
  for (const s of await store.list<AuthSession>("auth_sessions", { subjectId: user.id })) await store.remove("auth_sessions", s.id);
  return { tempPassword };
});

route("POST", "admin/users/:id/active", OWNER, async (ctx) => {
  const user = await ctx.store.get<AppUser>("users", ctx.params.id);
  if (!user) throw new HttpError(404, "ไม่พบผู้ใช้");
  if (user.id === staffUser(ctx).id) throw new HttpError(400, "ปิดบัญชีตัวเองไม่ได้");
  await ctx.store.set("users", { ...user, active: Boolean(ctx.body.active) });
  return { ok: true };
});
