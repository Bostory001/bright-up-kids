---
name: brightup-dev
description: สถาปัตยกรรม กฎการแก้โค้ด และ checklist ปิดงานของ web/ (Next.js 16 + TS + Tailwind 4 + Firestore) ใช้โดย next-dev impact-analyst และ qa-runner ทุกครั้งก่อนแตะโค้ด
---

# คู่มือแก้โค้ด Bright Up Kids (`web/`)

## 1. สถาปัตยกรรม

```
หน้าจอ (client component)
  └─ lib/client/api.ts  →  api() / useLoad()
       └─ app/api/[...path]/route.ts
            └─ lib/server/router.ts
                 └─ lib/server/routes/*.ts   ← ประกาศสิทธิ์ที่เดียวกับ handler
                      └─ lib/server/store.ts ← 2 adapter interface เดียวกัน
                           ├─ ไม่ตั้ง env  → web/.data/db.json (ทดลองในเครื่อง · ใช้บน Vercel ไม่ได้)
                           └─ FIREBASE_SERVICE_ACCOUNT → Firestore (Admin SDK)
```

- **ทุกหน้าเป็น client component** เรียก JSON API ของเราเอง
- **client ห้ามแตะ Firestore ตรง ๆ** — `firestore.rules` ปิดทั้งหมด
- **Login เขียนเอง** (`lib/server/auth.ts`) — scrypt, session cookie httpOnly, TOTP 2FA, ล็อก 10 นาทีเมื่อผิด 5 ครั้ง · ไม่ได้ใช้ Firebase Auth เพราะเด็กเข้าด้วย PIN/QR
- **ผู้ใช้ 4 แบบ:** owner, teacher (บังคับ 2FA) · parent (เบอร์โทร + รหัสผ่าน) · student (รหัสนักเรียน + PIN 4 หลัก)

## 2. ไฟล์ที่ต้องรู้

| ไฟล์ | หน้าที่ |
|---|---|
| `src/lib/types.ts` | data model — **comment ในไฟล์นี้กลายเป็นหน้า Data Dictionary อัตโนมัติ** |
| `src/lib/gamification.ts` | กติกาเกม (XP, เลเวล, achievement, ไอเทม) + ค่าเริ่มต้นลิมิต/งบ/royalty |
| `src/lib/server/settings.ts` | อ่านค่าจริงที่เจ้าของตั้งไว้ (collection `settings`) — **ใช้ตัวนี้ ไม่ใช่ค่าคงที่** |
| `src/lib/server/seed-exercises.ts` | ชุดโจทย์เริ่มต้น 57 ชุด |
| `src/lib/modules.ts` | ทะเบียนหน้าจอ — สร้างทั้งเมนูหลังบ้านและหน้าคู่มือ |
| `src/components/AvatarSvg.tsx` | รูป avatar (id ต้องตรงกับ `AVATAR_ITEMS`) |
| `scripts/smoke.mjs` | ทดสอบ API ทั้งระบบ |
| `docs/GO_LIVE.md` | ขั้นตอนต่อ Firestore / Vercel / LINE / AI ของจริง |
| `web/AGENTS.md` | กฎ Next.js 16 (อ่านก่อนใช้ API ที่ไม่แน่ใจ) |

## 3. กฎที่ผิดไม่ได้

| # | กฎ | เหตุผล |
|---|---|---|
| 1 | **วิเคราะห์ผลกระทบก่อนแก้** — 4 กลุ่มผู้ใช้ใช้ข้อมูลร่วมกัน แก้ `types.ts` ต้องเช็กทุก route และทุกหน้า | ระบบพันกัน |
| 2 | ทุก route **ประกาศสิทธิ์แคบที่สุด** ที่เดียวกับ handler (`"public"`, `STAFF`, `OWNER`, `["parent"]`, `["student"]`) | ความปลอดภัย |
| 3 | ห้ามส่งออก API: `passwordHash` · `pinHash` · `totpSecret` | ความปลอดภัย |
| 4 | ห้ามส่งให้เครื่องนักเรียน: `answerIndex` · `costBaht` | เด็กจะเห็นเฉลย/ต้นทุนของรางวัล |
| 5 | **คะแนน เหรียญ ของรางวัล คิดฝั่ง server เท่านั้น** | เหรียญแลกของจริงได้ |
| 6 | **PDPA** — เก็บเท่าที่จำเป็น · ต้องมีความยินยอมผู้ปกครองก่อนสร้างนักเรียน · **ห้ามใส่ข้อมูลเด็กจริงใน repo** · ข้อมูลที่ส่งให้ AI มีแค่ รหัส + ชื่อเล่น + สถิติ | กฎหมาย |
| 7 | **UI เด็ก** — ปุ่มสูง ≥ 64px · ข้อความสั้น · ภาษาไทย · **ออกแบบมือถือ 360px ก่อน** แล้วค่อยขยายไป tablet | EPIC E: ครอบครัวที่ไม่มี tablet คือกลุ่มเป้าหมายหลัก |
| 8 | **เพิ่มหน้าใหม่** = เพิ่มใน `lib/modules.ts` ด้วย (เมนู + คู่มือ) | ไม่งั้นหน้าหาย |
| 9 | **เพิ่ม collection** = เพิ่ม interface พร้อม `@collection` และ comment ใน `types.ts` | Data Dictionary สร้างจากตรงนี้ |
| 10 | **Next.js 16** — อ่าน `web/AGENTS.md` + `node_modules/next/dist/docs/` ก่อนใช้ API ที่ไม่แน่ใจ | ไม่เหมือนเวอร์ชันที่โมเดลจำมา |
| 11 | ESLint เข้ม — ห้าม `Date.now()` ใน component · ห้าม setState ตรง ๆ ใน effect | กฎ repo |
| 12 | **เด็กห้ามคุยกับ AI** — AI ใช้เฉพาะฝั่งครู/เจ้าของ | กฎเจ้าของ |

## 4. ลำดับงานมาตรฐาน

```
impact-analyst (วิเคราะห์ ไม่แก้)
   → next-dev (แก้)
      → รันชุดตรวจ
         → qa-runner (ตรวจซ้ำ ไม่แก้)
            → commit
               → ติ๊ก BACKLOG.md
```

## 5. ชุดตรวจปิดงาน (ต้องผ่านครบ 4)

```bash
cd web
npm run test:server      # unit tests
npm run lint             # ESLint
npm run build            # production build
npm run smoke:isolated   # เปิด production server บนพอร์ตว่าง + ฐานข้อมูลชั่วคราว แล้วเก็บกวาดให้
```

`npm run smoke` ใช้เฉพาะเมื่อมี server ทดสอบที่ฐานข้อมูลว่างอยู่แล้ว

**คำสั่งอื่น:**
```bash
npm run dev    # http://localhost:3000 → ครั้งแรกเข้า /setup สร้างบัญชีเจ้าของ
```
ตั้งค่าบริการภายนอก: คัดลอก `web/.env.local.example` → `web/.env.local`

## 6. รายงานผลตามจริง

- ถ้าเทสต์ตก → **บอกว่าตก พร้อมข้อความ error จริง** ห้ามรายงานว่าผ่าน
- ถ้ายังไม่ได้ลองบนของจริง (Firestore / LINE / iPad จริง) → **ต้องบอกทุกครั้ง**
- ROADMAP เดิมมีหลายข้อที่ "โค้ดเสร็จแต่ไม่เคยลองของจริง" — อย่าให้เกิดซ้ำ

## 7. เส้นที่ห้ามข้าม

- 🚫 แก้เทสต์ให้ผ่านแทนการแก้โค้ดให้ถูก
- 🚫 ใส่ข้อมูลเด็กจริงใน repo แม้ใน fixture
- 🚫 คัดลอกโจทย์จากที่อื่นมาใส่ seed (ขอจาก `exercise-writer`)
- 🚫 ข้าม `impact-analyst` เมื่องานแตะ `types.ts` / route / สิทธิ์ / collection
- ⚠️ เจองานที่ชนข้อจำกัดแฟรนไชส์หรือ PDPA → **หยุดและรายงานเจ้าของ** ไม่ต้องหาทางเลี่ยง
