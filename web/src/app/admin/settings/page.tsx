"use client";

import { useState } from "react";
import { useMe } from "@/components/me";
import { Button, Card, ErrorText, Field, Input, Table } from "@/components/ui";
import { api, useLoad } from "@/lib/client/api";
import { EST_COINS_PER_RUN } from "@/lib/gamification";
import type { Reward, Settings } from "@/lib/types";

type Form = Omit<Settings, "id">;

export default function SettingsPage() {
  const { me } = useMe();
  const { data, error, reload } = useLoad<{ settings: Settings }>("admin/settings");
  const rewards = useLoad<{ rewards: Reward[] }>("admin/rewards");
  const students = useLoad<{ students: { active: boolean }[] }>("admin/students");
  const [edits, setEdits] = useState<Partial<Form>>({});
  const [kids, setKids] = useState<number | null>(null);
  const [runsPerWeek, setRunsPerWeek] = useState(5);
  const [message, setMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  if (!data) return <ErrorText>{error}</ErrorText>;

  const form: Form = { ...data.settings, ...edits };
  const isOwner = me.role === "owner";
  // ช่องตัวเลขเท่านั้น — ค่าแบบเปิด/ปิดใช้สวิตช์ด้านล่างแทน
  const field = (key: keyof Form, label: string) => (
    <Field label={label}>
      <Input type="number" value={Number(form[key] ?? 0)} disabled={!isOwner} onChange={(e) => setEdits({ ...edits, [key]: Number(e.target.value) })} />
    </Field>
  );

  async function save() {
    setSaveError("");
    try {
      await api("admin/settings", form, "PATCH");
      setEdits({});
      setMessage("บันทึกแล้ว");
      reload();
    } catch (err) {
      setSaveError((err as Error).message);
    }
  }

  // ตัวช่วยคิดราคาของรางวัล: เหรียญที่เด็กทั้งสถาบันหาได้ต่อเดือน เทียบกับงบ
  const kidCount = kids ?? students.data?.students.filter((s) => s.active).length ?? 0;
  const coinsPerMonth = Math.round(kidCount * runsPerWeek * 4.3 * EST_COINS_PER_RUN);
  const bahtPerCoin = coinsPerMonth > 0 ? form.rewardBudgetBaht / coinsPerMonth : 0;

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-bold">ตั้งค่า</h1>
      <ErrorText>{error || saveError}</ErrorText>
      {message && <p className="rounded-xl bg-green-50 p-3 text-sm text-green-700">{message}</p>}
      <Card className="grid gap-3 sm:grid-cols-2">
        {field("dailyLimitQuestions", "จำนวนโจทย์ต่อวันที่นับคะแนน (ข้อ)")}
        {field("dailyLimitMinutes", "เวลาทำโจทย์ต่อวันที่นับคะแนน (นาที)")}
        {field("rewardBudgetBaht", "งบของรางวัลต่อเดือน (บาท)")}
        {field("royaltyPercent", "อัตรา royalty ส่ง HQ (% ของยอดรับ)")}
        {field("profitTargetBaht", "เป้ากำไรต่อเดือน (บาท)")}
        <label className="flex items-start gap-3 rounded-xl border-2 border-amber-300 bg-amber-50 p-3 text-sm sm:col-span-2">
          <input
            type="checkbox"
            className="mt-1 h-5 w-5"
            checked={form.require2fa !== false}
            disabled={!isOwner}
            onChange={(e) => setEdits({ ...edits, require2fa: e.target.checked })}
          />
          <span>
            <b>บังคับใช้รหัส 2FA สำหรับเจ้าของและครู</b>
            <span className="block text-gray-600">
              ปิดได้ชั่วคราวเวลาเข้าแอป Authenticator ไม่ได้ แต่ระบบนี้เก็บข้อมูลเด็กและเบอร์ผู้ปกครอง ถ้าปิดไว้ ใครรู้รหัสผ่านก็เข้าได้ทันที — เปิดกลับทันทีที่สะดวก
            </span>
          </span>
        </label>
        <p className="text-sm text-gray-500 sm:col-span-2">
          ถึงเพดานโจทย์หรือเวลาข้อใดข้อหนึ่งแล้ว เด็กยังฝึกต่อได้แต่ไม่ได้ XP และเหรียญ · อัตรา royalty ควรตรวจกับสัญญาแฟรนไชส์
        </p>
        {isOwner ? (
          <div>
            <Button onClick={save} disabled={Object.keys(edits).length === 0}>
              บันทึก
            </Button>
          </div>
        ) : (
          <p className="text-sm text-gray-500">แก้ไขได้เฉพาะเจ้าของ</p>
        )}
      </Card>

      <Card className="grid gap-3">
        <h2 className="font-bold">ตัวช่วยตั้งราคาของรางวัล</h2>
        <p className="text-sm text-gray-600">
          ประมาณว่าเด็ก 1 คนได้ราว {EST_COINS_PER_RUN} เหรียญต่อชุด ถ้าเด็กแลกเหรียญทั้งหมดที่หาได้ ราคาที่แนะนำจะทำให้ต้นทุนรวมพอดีงบ — ตั้งราคาสูงกว่านี้ได้เพื่อเผื่อ
          ตั้งต่ำกว่านี้จะมีของที่แลกแล้วส่งมอบไม่ได้เพราะเกินงบ
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="จำนวนนักเรียนที่ใช้ระบบ (คน)">
            <Input type="number" value={kidCount} onChange={(e) => setKids(Number(e.target.value))} />
          </Field>
          <Field label="ทำแบบฝึกหัดเฉลี่ยกี่ชุดต่อสัปดาห์ต่อคน">
            <Input type="number" value={runsPerWeek} onChange={(e) => setRunsPerWeek(Number(e.target.value))} />
          </Field>
        </div>
        {coinsPerMonth > 0 ? (
          <>
            <p className="text-sm">
              เหรียญที่แจกทั้งสถาบัน ≈ <b>{coinsPerMonth.toLocaleString()}</b> เหรียญ/เดือน → งบ {form.rewardBudgetBaht.toLocaleString()} บาท เท่ากับ{" "}
              <b>{bahtPerCoin.toFixed(2)} บาทต่อเหรียญ</b>
            </p>
            <Table head={["ของรางวัล", "ต้นทุน (บาท)", "ราคาตอนนี้ (เหรียญ)", "ราคาที่แนะนำ (เหรียญ)", ""]}>
              {rewards.data?.rewards.map((r) => {
                const suggested = Math.max(1, Math.ceil(r.costBaht / bahtPerCoin));
                return (
                  <tr key={r.id}>
                    <td>{r.name}</td>
                    <td>{r.costBaht}</td>
                    <td>{r.costCoins}</td>
                    <td className="font-bold">{suggested}</td>
                    <td>{r.costCoins < suggested ? <span className="text-red-600">ถูกเกินไป เสี่ยงเกินงบ</span> : <span className="text-green-700">อยู่ในงบ</span>}</td>
                  </tr>
                );
              })}
            </Table>
            {rewards.data?.rewards.length === 0 && <p className="text-sm text-gray-500">ยังไม่มีของรางวัล เพิ่มได้ที่หน้า “ของรางวัล”</p>}
          </>
        ) : (
          <p className="text-sm text-gray-500">ใส่จำนวนนักเรียนเพื่อคำนวณ</p>
        )}
      </Card>
    </div>
  );
}
