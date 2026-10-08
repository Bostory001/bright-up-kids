import "server-only";
import type { AppUser, Notification } from "../types";
import type { Store } from "./store";
import { newId, nowIso } from "./util";

// ส่งข้อความถึงผู้ปกครองทาง LINE OA (Messaging API push)
// ถ้ายังไม่ตั้ง LINE_CHANNEL_ACCESS_TOKEN หรือผู้ปกครองยังไม่ผูก LINE → บันทึกเป็น queued ให้ครูเห็นในหน้า "แจ้งเตือน"
export async function notifyParent(store: Store, parentId: string | undefined, kind: Notification["kind"], text: string) {
  if (!parentId) return;
  const note: Notification = { id: newId(), parentId, kind, text, status: "queued", createdAt: nowIso() };
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const parent = await store.get<AppUser>("users", parentId);

  if (token && parent?.lineUserId) {
    try {
      const res = await fetch("https://api.line.me/v2/bot/message/push", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ to: parent.lineUserId, messages: [{ type: "text", text }] }),
      });
      if (res.ok) note.status = "sent";
      else {
        note.status = "failed";
        note.error = `LINE ตอบ ${res.status}`;
      }
    } catch (err) {
      note.status = "failed";
      note.error = err instanceof Error ? err.message : "ส่งไม่สำเร็จ";
    }
  } else {
    note.error = token ? "ผู้ปกครองยังไม่ผูก LINE" : "ยังไม่ได้ตั้งค่า LINE";
  }
  await store.set("notifications", note);
}
