"use client";

import { useState } from "react";
import { Button, Card, ErrorText, Field, Input, Select } from "@/components/ui";
import { BRAND, BRANCH } from "@/lib/brand";
import { api, useLoad } from "@/lib/client/api";
import { GRADES, gradeLabel, SUBJECT_KEYS, SUBJECT_TH } from "@/lib/grade";

interface PublicCourse {
  id: string;
  name: string;
  grades: number[];
  pricePerTerm: number;
  schedule: string;
}

const EMPTY = {
  parentName: "",
  phone: "",
  altPhone: "",
  studentFullName: "",
  englishName: "",
  nickname: "",
  grade: "1",
  birthDate: "",
  school: "",
  program: "",
  targetSchool: "",
  email: "",
  lineId: "",
  facebook: "",
  addressLine: "",
  subdistrict: "",
  district: "",
  province: "",
  postcode: "",
  source: "",
  note: "",
};
const SOURCES = ["Facebook / เว็บไซต์", "โบรชัวร์ / ใบปลิว", "เพื่อนแนะนำ", "ป้ายหน้าร้าน", "เดินผ่าน", "อื่น ๆ"];

export default function EnrollPage() {
  const { data } = useLoad<{ courses: PublicCourse[] }>("public/courses");
  const [form, setForm] = useState(EMPTY);
  const [courseIds, setCourseIds] = useState<string[]>([]);
  const [grades, setGrades] = useState<number[]>([1]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [subjectOther, setSubjectOther] = useState("");
  const [consent, setConsent] = useState(false);
  const [photoConsent, setPhotoConsent] = useState(false);
  const [more, setMore] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value });
  const courses = (data?.courses ?? []).filter((c) => c.grades.some((g) => grades.includes(g)));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api("public/enroll", { ...form, grade: grades[0], grades, subjects, subjectOther, courseIds, pdpaConsent: consent, photoConsent });
      setDone(true);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  if (done) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center p-6 text-center">
        <Card>
          <div className="text-5xl">🎉</div>
          <h1 className="mt-2 text-xl font-bold">ส่งใบสมัครแล้ว</h1>
          <p className="mt-2 text-gray-600">สถาบันจะติดต่อกลับทางเบอร์โทรที่ให้ไว้ เพื่อแจ้งรหัสเข้าระบบและค่าเรียน</p>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-md flex-1 p-6">
      <h1 className="text-2xl font-bold text-amber-600">สมัครเรียน {BRAND}</h1>
      <p className="text-sm text-gray-600">{BRANCH}</p>
      <form onSubmit={submit} className="mt-4 grid gap-3">
        <Card className="grid gap-3">
          <div className="font-bold">ผู้ปกครอง</div>
          <Field label="ชื่อผู้ปกครอง">
            <Input value={form.parentName} onChange={set("parentName")} required />
          </Field>
          <Field label="เบอร์โทร (ใช้เข้าระบบผู้ปกครอง)">
            <Input value={form.phone} onChange={set("phone")} inputMode="tel" required />
          </Field>
          <Field label="เบอร์สำรอง / เบอร์บ้าน (ไม่บังคับ)">
            <Input value={form.altPhone} onChange={set("altPhone")} inputMode="tel" />
          </Field>
        </Card>
        <Card className="grid gap-3">
          <div className="font-bold">นักเรียน</div>
          <Field label="ชื่อ-นามสกุล">
            <Input value={form.studentFullName} onChange={set("studentFullName")} required />
          </Field>
          <Field label="ชื่อเล่น">
            <Input value={form.nickname} onChange={set("nickname")} required />
          </Field>
          <Field label="ระดับชั้น (เลือกได้มากกว่า 1)">
            <div className="flex flex-wrap gap-2">
              {GRADES.map((g) => {
                const on = grades.includes(g);
                return (
                  <button
                    type="button"
                    key={g}
                    onClick={() => {
                      setGrades(on ? grades.filter((x) => x !== g) : [...grades, g].sort((a, b) => a - b));
                      setCourseIds([]);
                    }}
                    className={`rounded-xl border px-3 py-2 text-sm font-medium ${on ? "border-amber-500 bg-amber-100 text-amber-900" : "border-gray-300 bg-white text-gray-700"}`}
                  >
                    {gradeLabel(g)}
                  </button>
                );
              })}
            </div>
          </Field>
          <Field label="ชื่อ-นามสกุล ภาษาอังกฤษ (ไม่บังคับ)">
            <Input value={form.englishName} onChange={set("englishName")} placeholder="Manida Jaidee" />
          </Field>
          <Field label="วันเกิด (ไม่บังคับ)">
            <Input type="date" value={form.birthDate} onChange={set("birthDate")} />
          </Field>
          <Field label="โรงเรียนปัจจุบัน (ไม่บังคับ)">
            <Input value={form.school} onChange={set("school")} />
          </Field>
          <Field label="หลักสูตรที่โรงเรียน (ไม่บังคับ)">
            <Select value={form.program} onChange={set("program")}>
              <option value="">— ไม่ระบุ —</option>
              <option value="thai">ภาคสามัญ (ไทย)</option>
              <option value="ep">English Program (EP)</option>
              <option value="inter">Inter</option>
            </Select>
          </Field>
        </Card>
        <Card className="grid gap-3">
          <button type="button" className="text-left font-bold" onClick={() => setMore(!more)}>
            {more ? "▾" : "▸"} ข้อมูลเพิ่มเติม (ไม่บังคับ — กรอกได้ทีหลัง)
          </button>
          {more && (
            <>
              <Field label="ที่อยู่ (บ้านเลขที่ หมู่ ซอย ถนน)">
                <Input value={form.addressLine} onChange={set("addressLine")} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="แขวง / ตำบล">
                  <Input value={form.subdistrict} onChange={set("subdistrict")} />
                </Field>
                <Field label="เขต / อำเภอ">
                  <Input value={form.district} onChange={set("district")} />
                </Field>
                <Field label="จังหวัด">
                  <Input value={form.province} onChange={set("province")} />
                </Field>
                <Field label="รหัสไปรษณีย์">
                  <Input value={form.postcode} onChange={set("postcode")} inputMode="numeric" />
                </Field>
              </div>
              <Field label="อีเมล">
                <Input type="email" value={form.email} onChange={set("email")} />
              </Field>
              <Field label="Line ID">
                <Input value={form.lineId} onChange={set("lineId")} />
              </Field>
              <Field label="Facebook">
                <Input value={form.facebook} onChange={set("facebook")} />
              </Field>
              <Field label="ตั้งใจสอบเข้าโรงเรียน/มหาวิทยาลัยไหน">
                <Input value={form.targetSchool} onChange={set("targetSchool")} />
              </Field>
              <Field label="รู้จักสถาบันจากไหน">
                <Select value={form.source} onChange={set("source")}>
                  <option value="">— ไม่ระบุ —</option>
                  {SOURCES.map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="อยากบอกอะไรกับสถาบันเพิ่มเติม">
                <Input value={form.note} onChange={set("note")} placeholder="เช่น น้องแพ้อาหารทะเล / ต้องการเน้นเรื่องการอ่าน" />
              </Field>
            </>
          )}
        </Card>
        <Card className="grid gap-3">
          <div className="font-bold">วิชาที่สนใจ</div>
          <div className="grid grid-cols-2 gap-2">
            {SUBJECT_KEYS.map((key) => {
              const on = subjects.includes(key);
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => setSubjects(on ? subjects.filter((x) => x !== key) : [...subjects, key])}
                  className={`rounded-xl border px-3 py-3 text-sm font-medium ${on ? "border-amber-500 bg-amber-100 text-amber-900" : "border-gray-300 bg-white text-gray-700"}`}
                >
                  {SUBJECT_TH[key]}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setSubjects(subjects.includes("other") ? subjects.filter((x) => x !== "other") : [...subjects, "other"])}
              className={`col-span-2 rounded-xl border px-3 py-3 text-sm font-medium ${
                subjects.includes("other") ? "border-amber-500 bg-amber-100 text-amber-900" : "border-gray-300 bg-white text-gray-700"
              }`}
            >
              อื่น ๆ (ระบุเอง)
            </button>
          </div>
          {subjects.includes("other") && (
            <Field label="วิชาอื่นที่สนใจ">
              <Input value={subjectOther} onChange={(e) => setSubjectOther(e.target.value)} placeholder="เช่น ติวสอบเข้า ม.1 / ช่วยทำการบ้าน" required />
            </Field>
          )}
          {courses.length > 0 && (
            <>
              <div className="font-bold">คอร์สที่เปิดรับตอนนี้ (ไม่บังคับ)</div>
              {courses.map((c) => (
                <label key={c.id} className="flex items-start gap-3 rounded-xl border border-gray-200 p-3">
                  <input
                    type="checkbox"
                    className="mt-1 h-5 w-5"
                    checked={courseIds.includes(c.id)}
                    onChange={(e) => setCourseIds(e.target.checked ? [...courseIds, c.id] : courseIds.filter((id) => id !== c.id))}
                  />
                  <span>
                    <b>{c.name}</b>
                    <span className="block text-sm text-gray-500">{c.schedule}</span>
                  </span>
                </label>
              ))}
            </>
          )}
          <p className="text-xs text-gray-500">สถาบันจะแจ้งรอบเรียนที่ว่างและค่าเรียนให้ตอนติดต่อกลับ</p>
        </Card>
        <label className="flex items-start gap-3 rounded-2xl bg-white p-4 text-sm shadow-sm">
          <input type="checkbox" className="mt-1 h-5 w-5" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <span>
            ข้าพเจ้าในฐานะผู้ปกครอง ยินยอมให้สถาบันเก็บและใช้ข้อมูลของข้าพเจ้าและบุตรหลาน (ชื่อ ชั้นเรียน เบอร์โทร การเข้าเรียน ผลแบบฝึกหัด
            และการชำระเงิน) เพื่อการจัดการเรียนการสอนและการติดต่อเท่านั้น และสามารถขอดู แก้ไข หรือลบข้อมูลได้โดยแจ้งสถาบัน
          </span>
        </label>
        <label className="flex items-start gap-3 rounded-2xl bg-white p-4 text-sm shadow-sm">
          <input type="checkbox" className="mt-1 h-5 w-5" checked={photoConsent} onChange={(e) => setPhotoConsent(e.target.checked)} />
          <span>
            <b>(ไม่บังคับ)</b> ยินยอมให้สถาบันใช้ภาพนิ่ง/วิดีโอของบุตรหลานขณะเรียน ในสื่อประชาสัมพันธ์ของสถาบัน เช่น เพจ Facebook หรือใบปลิว ·
            ไม่ติ๊กข้อนี้ก็สมัครเรียนได้ตามปกติ และเปลี่ยนใจภายหลังได้โดยแจ้งสถาบัน
          </span>
        </label>
        <ErrorText>{error}</ErrorText>
        <Button type="submit" disabled={!consent || grades.length === 0 || (subjects.length === 0 && courseIds.length === 0)} className="py-3 text-base">
          ส่งใบสมัคร
        </Button>
      </form>
    </main>
  );
}
