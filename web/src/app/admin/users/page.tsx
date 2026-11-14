"use client";

import { useState } from "react";
import { Badge, Button, Card, ErrorText, Field, Input, SecretBox, Table } from "@/components/ui";
import { api, useLoad } from "@/lib/client/api";

interface UserRow {
  id: string;
  role: "owner" | "teacher" | "parent";
  username: string;
  displayName: string;
  totpEnabled: boolean;
  hourlyRate?: number;
  lineLinked: boolean;
  active: boolean;
}
const ROLE = { owner: "เจ้าของ", teacher: "ครู", parent: "ผู้ปกครอง" };

export default function UsersPage() {
  const { data, error, reload } = useLoad<{ users: UserRow[] }>("admin/users");
  const [form, setForm] = useState<{ displayName: string; username: string } | null>(null);
  const [secret, setSecret] = useState<{ username: string; tempPassword: string } | null>(null);
  const [actionError, setActionError] = useState("");

  async function run(fn: () => Promise<void>) {
    setActionError("");
    try {
      await fn();
      reload();
    } catch (err) {
      setActionError((err as Error).message);
    }
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ผู้ใช้</h1>
        <Button onClick={() => setForm({ displayName: "", username: "" })}>เพิ่มครู</Button>
      </div>
      <ErrorText>{error || actionError}</ErrorText>
      {secret && (
        <SecretBox
          title="รหัสผ่านชั่วคราว"
          lines={[
            ["ชื่อเข้าระบบ", secret.username],
            ["รหัสผ่านชั่วคราว", secret.tempPassword],
          ]}
          onClose={() => setSecret(null)}
        />
      )}
      {form && (
        <Card className="grid gap-3 sm:grid-cols-2">
          <Field label="ชื่อที่แสดง">
            <Input value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
          </Field>
          <Field label="ชื่อเข้าระบบ">
            <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} autoCapitalize="none" />
          </Field>
          <div className="flex gap-2 sm:col-span-2">
            <Button
              onClick={() =>
                run(async () => {
                  const res = await api("admin/users", { ...form, role: "teacher" });
                  setSecret({ username: res.user.username, tempPassword: res.tempPassword });
                  setForm(null);
                })
              }
            >
              สร้างบัญชี
            </Button>
            <Button variant="ghost" onClick={() => setForm(null)}>
              ยกเลิก
            </Button>
          </div>
        </Card>
      )}
      <Table head={["ชื่อ", "ชื่อเข้าระบบ", "บทบาท", "ค่าสอน/ชม.", "2FA", "LINE", "สถานะ", ""]}>
        {data?.users.map((u) => (
          <tr key={u.id}>
            <td className="font-medium">{u.displayName}</td>
            <td className="font-mono">{u.username}</td>
            <td>{ROLE[u.role]}</td>
            <td>
              {u.role === "parent" ? (
                "-"
              ) : (
                <Input
                  key={u.hourlyRate}
                  type="number"
                  defaultValue={u.hourlyRate ?? ""}
                  placeholder="บาท"
                  className="w-24 text-sm"
                  title="อัตราค่าสอนต่อชั่วโมง ใช้คิดค่าจ้างรายเดือน (กดนอกช่องเพื่อบันทึก)"
                  onBlur={(e) => Number(e.target.value || 0) !== (u.hourlyRate ?? 0) && run(() => api(`admin/users/${u.id}/rate`, { hourlyRate: e.target.value }, "PATCH"))}
                />
              )}
            </td>
            <td>{u.role === "parent" ? "-" : u.totpEnabled ? <Badge color="green">เปิด</Badge> : <Badge color="red">ยังไม่ตั้ง</Badge>}</td>
            <td>{u.role !== "parent" ? "-" : u.lineLinked ? <Badge color="green">ผูกแล้ว</Badge> : <Badge>ยังไม่ผูก</Badge>}</td>
            <td>{u.active ? <Badge color="green">ใช้งาน</Badge> : <Badge>ปิด</Badge>}</td>
            <td className="flex gap-1">
              <Button
                variant="ghost"
                onClick={() =>
                  window.confirm(`รีเซ็ตรหัสผ่าน${u.role === "parent" ? "" : "และ 2FA"} ของ ${u.displayName}?`) &&
                  run(async () => {
                    const res = await api(`admin/users/${u.id}/reset`, {});
                    setSecret({ username: u.username, tempPassword: res.tempPassword });
                  })
                }
              >
                รีเซ็ต
              </Button>
              {u.role !== "owner" && (
                <Button variant="ghost" onClick={() => run(() => api(`admin/users/${u.id}/active`, { active: !u.active }))}>
                  {u.active ? "ปิดบัญชี" : "เปิดบัญชี"}
                </Button>
              )}
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
