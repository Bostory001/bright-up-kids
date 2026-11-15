import "server-only";
import type { AppUser, Role, Student } from "../types";
import { type Principal, resolveSession, SESSION_COOKIE } from "./auth";
import { getStore, type Store } from "./store";
import { HttpError } from "./util";

// API ทั้งหมดวิ่งผ่าน app/api/[...path]/route.ts → dispatch() ที่นี่
// แต่ละ route ประกาศสิทธิ์ไว้ที่เดียวกับ handler เพื่อให้ตรวจง่าย

export type Access = "public" | readonly Role[];
export const STAFF = ["owner", "teacher"] as const;
export const OWNER = ["owner"] as const;

export interface Ctx {
  req: Request;
  params: Record<string, string>;
  query: URLSearchParams;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- body มาจากภายนอก แต่ละ handler ตรวจเองด้วย str()/num()
  body: any;
  rawBody: string;
  me: Principal | null;
  store: Store;
  token?: string;
  setSession(token: string, maxAge: number): void;
  clearSession(): void;
}

type Handler = (ctx: Ctx) => Promise<unknown>;

interface Route {
  method: string;
  segments: string[];
  access: Access;
  handler: Handler;
  allowWithout2fa: boolean;
}

const routes: Route[] = [];

export function route(method: string, pattern: string, access: Access, handler: Handler, opts?: { allowWithout2fa?: boolean }) {
  routes.push({
    method,
    segments: pattern.split("/").filter(Boolean),
    access,
    handler,
    allowWithout2fa: opts?.allowWithout2fa ?? false,
  });
}

export function staffUser(ctx: Ctx): AppUser {
  if (!ctx.me || ctx.me.role === "student") throw new HttpError(403, "ไม่มีสิทธิ์");
  return ctx.me.user;
}

export function studentOf(ctx: Ctx): Student {
  if (ctx.me?.role !== "student") throw new HttpError(403, "ไม่มีสิทธิ์");
  return ctx.me.student;
}

function match(r: Route, method: string, path: string[]): Record<string, string> | null {
  if (r.method !== method || r.segments.length !== path.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < path.length; i++) {
    const seg = r.segments[i];
    if (seg.startsWith(":")) params[seg.slice(1)] = path[i];
    else if (seg !== path[i]) return null;
  }
  return params;
}

function readCookie(req: Request, name: string): string | undefined {
  for (const part of (req.headers.get("cookie") ?? "").split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) {
      try { return decodeURIComponent(v.join("=")); }
      catch { return undefined; }
    }
  }
}

export async function dispatch(req: Request, path: string[]): Promise<Response> {
  const headers = new Headers({ "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  const json = (status: number, data: unknown) => new Response(JSON.stringify(data), { status, headers });
  const secure = new URL(req.url).protocol === "https:" ? "; Secure" : "";

  try {
    let found: { route: Route; params: Record<string, string> } | null = null;
    for (const r of routes) {
      const params = match(r, req.method, path);
      if (params) {
        found = { route: r, params };
        break;
      }
    }
    if (!found) throw new HttpError(404, "ไม่พบ API นี้");

    // กัน CSRF: คำขอที่แก้ข้อมูลจากเบราว์เซอร์ต้องมาจากโดเมนเดียวกัน
    const origin = req.headers.get("origin");
    if (req.method !== "GET" && origin) {
      let sameOrigin = false;
      try {
        const source = new URL(origin);
        // หลัง reverse proxy (Cloud Run / Vercel) TLS ถูกตัดที่ edge: เบราว์เซอร์เห็น https แต่ req.url ข้างในเป็น http
        // จึงต้องเทียบกับ x-forwarded-proto ไม่งั้นคำขอของผู้ใช้จริงจะถูกปฏิเสธว่า "มาจากโดเมนอื่น"
        const forwarded = req.headers.get("x-forwarded-proto")?.split(",")[0].trim();
        const expectedProtocol = forwarded ? `${forwarded}:` : new URL(req.url).protocol;
        // บาง proxy ส่ง host ของ service ภายในมาใน header host และเก็บโดเมนจริงไว้ที่ x-forwarded-host
        // จึงยอมรับได้ทั้งสองตัว — ยังเทียบกับโดเมนที่ผู้ใช้เปิดจริง ด่านกันข้ามโดเมนจึงยังอยู่ครบ
        const hosts = [req.headers.get("x-forwarded-host")?.split(",")[0].trim(), req.headers.get("host")].filter(Boolean);
        sameOrigin = hosts.includes(source.host) && source.protocol === expectedProtocol;
      } catch { /* Invalid origin. */ }
      if (!sameOrigin) throw new HttpError(403, "คำขอมาจากโดเมนอื่น");
    }

    const token = readCookie(req, SESSION_COOKIE);
    const me = await resolveSession(token);
    const { access } = found.route;
    if (access !== "public") {
      if (!me) throw new HttpError(401, "กรุณาเข้าสู่ระบบ");
      if (!access.includes(me.role)) throw new HttpError(403, "ไม่มีสิทธิ์ใช้งานส่วนนี้");
      const needs2fa = (me.role === "owner" || me.role === "teacher") && !me.user.totpEnabled;
      if (needs2fa && !found.route.allowWithout2fa) throw new HttpError(403, "ต้องเปิดใช้ 2FA ก่อน");
    }

    const rawBody = req.method === "GET" ? "" : await req.text();
    let body: unknown = {};
    if (rawBody) {
      try {
        body = JSON.parse(rawBody);
        if (body === null || typeof body !== "object" || Array.isArray(body)) {
          throw new Error("Expected a JSON object");
        }
      } catch {
        throw new HttpError(400, "รูปแบบข้อมูลไม่ถูกต้อง");
      }
    }

    const result = await found.route.handler({
      req,
      params: found.params,
      query: new URL(req.url).searchParams,
      body,
      rawBody,
      me,
      token,
      store: await getStore(),
      setSession: (t, maxAge) =>
        headers.append("set-cookie", `${SESSION_COOKIE}=${t}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`),
      clearSession: () => headers.append("set-cookie", `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`),
    });
    return json(200, result ?? { ok: true });
  } catch (err) {
    if (err instanceof HttpError) return json(err.status, { error: err.message });
    console.error("[api]", req.method, path.join("/"), err);
    return json(500, { error: "ระบบขัดข้อง กรุณาลองใหม่" });
  }
}
