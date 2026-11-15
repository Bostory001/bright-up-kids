import { dispatch } from "@/lib/server/router";
import "@/lib/server/routes/auth";
import "@/lib/server/routes/school";
import "@/lib/server/routes/play";
import "@/lib/server/routes/parent";
import "@/lib/server/routes/reports";
import "@/lib/server/routes/ai";
import "@/lib/server/routes/extras";
import "@/lib/server/routes/finance";
import "@/lib/server/routes/assessments";
import "@/lib/server/routes/calendar";

// API ทั้งหมดอยู่ใน lib/server/routes/* — ไฟล์นี้แค่ส่งต่อ
async function handle(req: Request, ctx: RouteContext<"/api/[...path]">) {
  return dispatch(req, (await ctx.params).path);
}

export { handle as DELETE, handle as GET, handle as PATCH, handle as POST, handle as PUT };
