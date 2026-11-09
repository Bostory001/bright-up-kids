# Bright Up Kids สาขาวัดหลวงพ่อโต บางพลี (สถาบันเรียนพิเศษ ป.1-6)

สาขาแฟรนไชส์ภายใต้ HQ Bright Up Center by P'Jeng · ชื่อที่ใช้กับลูกค้า = **Bright Up Kids สาขาวัดหลวงพ่อโต บางพลี** · ชื่อในโค้ดแก้ที่ `web/src/lib/brand.ts` ที่เดียว

สถานะ: **เปิดสาขาแล้ว** (ยืนยัน 8 พ.ย. 2569) · กำลังรับสมัครครูพาร์ตไทม์ทุกวิชา ต้องได้คนภายใน 1-2 สัปดาห์ → ดู [docs/HIRING.md](docs/HIRING.md) · โค้ดรอบ R1-R45 เสร็จแล้ว (ยกเว้น R18) ยังไม่ได้ต่อบริการภายนอกจริง (ดู "ยังไม่ได้ทดสอบกับของจริง" ใน ROADMAP.md)

## โครงโฟลเดอร์

| โฟลเดอร์ | เนื้อหา |
|---|---|
| `web/` | แอป Next.js 16 (App Router, TS, Tailwind 4) |
| `marketing/` | แผนการตลาด, brief โบรชัวร์ · **แผนคอนเทนต์ที่ใช้จริง = [marketing/content-roadmap-daily.md](marketing/content-roadmap-daily.md)** (วันละ 1 โพสต์ · `content-4-weeks.md` เป็นแผนก่อนเปิด เลิกใช้แล้ว) |
| `marketing/social/` | **ไกด์ทำคอนเทนต์เพจ** — [IMAGE_GUIDE.md](marketing/social/IMAGE_GUIDE.md) (ภาพ 3 เลน: รูปถ่ายจริง / Tier A / Tier B) · [VIDEO_GUIDE.md](marketing/social/VIDEO_GUIDE.md) (แม่แบบคลิป V1-V5) · `PROMPTS.md` → `node scripts/build-prompts.mjs --src=marketing/social/PROMPTS.md` ได้ 22 ใบ |
| `marketing/content/<วิชา-ชั้น-เทอม>/` | **prompt ภาพประกอบเนื้อหา (Tier B flat vector)** — มีชุดแรกแล้ว: `english-p1-term2` · สร้างไฟล์พร้อมก๊อปด้วย `node scripts/build-prompts.mjs --src=<ไฟล์ PROMPTS.md>` |
| `docs/` | เอกสารธุรกิจ/ระบบ (ฟีเจอร์, ข้อตัดสินใจ, ทีม agent) |
| `docs/BENCHMARK_ONION.md` | สำรวจ Onion Academy (洋葱学园) — โครงที่เอามาใช้ได้ / ที่ยังไม่ต้องสนใจ (งาน B4) |
| `docs/CHARACTER_SHEET.md` | **หน้าตาตัวละครฉบับเดียว** (ต้นกล้า โบ๊ท มีมี่ แพรว ครูแอน มะนาว โกโก้) — prompt พร้อมใช้อยู่ที่ `marketing/video/characters/PROMPTS.md` |
| `ROADMAP.md` | รอบงานที่ทำไปแล้ว R1-R45 + ขั้นเปิดระบบจริง S1-S5 — "ทำต่อไป" = ทำข้อถัดไปที่ยังไม่ติ๊ก |
| `BACKLOG.md` | **งานข้างหน้าทั้งหมด** แบ่งเป็น EPIC A-H + แผน sprint + PIC (agent ที่รับผิดชอบแต่ละ task) |
| `.claude/agents/` | agent 10 ตัว — แผนผังทีมและสายงานอยู่ที่ [docs/AGENT_TEAM.md](docs/AGENT_TEAM.md) |
| `.claude/skills/` | ความรู้ที่ agent โหลด: `exercise-authoring` `lesson-storytelling` `illustration-prompting` `content-review-gate` `challenge-design` `brightup-dev` |

## สถาปัตยกรรม (web/)

- **หน้าจอทั้งหมดเป็น client component** เรียก JSON API ของเราเองผ่าน `lib/client/api.ts` (`api()`, `useLoad()`)
- **API ทั้งหมด** เข้าทาง `app/api/[...path]/route.ts` → `lib/server/router.ts` → `lib/server/routes/*.ts`
  แต่ละ route ประกาศสิทธิ์ (`"public"`, `STAFF`, `OWNER`, `["parent"]`, `["student"]`) ไว้ที่เดียวกับ handler
- **ที่เก็บข้อมูล** `lib/server/store.ts` มี 2 adapter ใช้ interface เดียวกัน
  - ไม่ตั้ง env → ไฟล์ `web/.data/db.json` (ทดลองในเครื่องเท่านั้น ใช้บน Vercel ไม่ได้)
  - ตั้ง `FIREBASE_SERVICE_ACCOUNT` → Firestore ผ่าน Admin SDK
  - client ไม่แตะ Firestore ตรง ๆ → `firestore.rules` ปิดทั้งหมด
- **Login เขียนเอง** (`lib/server/auth.ts`): รหัสผ่าน/PIN hash ด้วย scrypt, session cookie httpOnly, 2FA แบบ TOTP, ล็อก 10 นาทีเมื่อผิด 5 ครั้ง — ไม่ได้ใช้ Firebase Auth เพราะเด็กต้องเข้าด้วย PIN/QR
- **ผู้ใช้ 4 แบบ**: owner, teacher (บังคับ 2FA) · parent (เบอร์โทร + รหัสผ่าน) · student (รหัสนักเรียน + PIN 4 หลัก)

ไฟล์ที่ต้องรู้:

| ไฟล์ | หน้าที่ |
|---|---|
| `src/lib/types.ts` | data model — comment ในไฟล์นี้กลายเป็นหน้า Data Dictionary อัตโนมัติ |
| `src/lib/gamification.ts` | กติกาเกม (XP, เลเวล, achievement, ไอเทม) + ค่าเริ่มต้นของลิมิต/งบ/royalty — ค่าจริงเจ้าของแก้ที่หน้า "ตั้งค่า" (collection `settings`) อ่านผ่าน `lib/server/settings.ts` |
| `src/lib/server/seed-exercises.ts` | ชุดโจทย์เริ่มต้น 57 ชุด (แต่งเอง นำเข้าเป็นร่าง) |
| `src/lib/modules.ts` | ทะเบียนหน้าจอ — สร้างทั้งเมนูหลังบ้านและหน้าคู่มือ |
| `src/components/AvatarSvg.tsx` | รูป avatar (id ต้องตรงกับ `AVATAR_ITEMS`) |
| `scripts/smoke.mjs` | ทดสอบ API ทั้งระบบ (รันผ่าน `npm run smoke:isolated`) |
| `docs/GO_LIVE.md` | ขั้นตอนต่อ Firestore / Vercel / LINE / AI ของจริง |

## กฎการพัฒนา

1. **วิเคราะห์ผลกระทบก่อนแก้** — 3 กลุ่มผู้ใช้ใช้ข้อมูลร่วมกัน แก้ `types.ts` ต้องเช็กทุก route และทุกหน้า
2. **ทุก route ต้องประกาศสิทธิ์ให้แคบที่สุด** และห้ามส่ง `passwordHash`, `pinHash`, `totpSecret`, `answerIndex` (ให้นักเรียน), `costBaht` (ให้นักเรียน) ออก API
3. **คะแนน/เหรียญ/ของรางวัล คิดฝั่ง server เท่านั้น** — เหรียญแลกของจริงได้
4. **ข้อมูลเด็ก (PDPA)** — เก็บเท่าที่จำเป็น, ต้องมีการยินยอมของผู้ปกครองก่อนสร้างนักเรียน, ห้ามใส่ข้อมูลเด็กจริงใน repo, ข้อมูลที่ส่งให้ AI มีแค่รหัส+ชื่อเล่น+สถิติ
5. **UI เด็ก** — ปุ่มใหญ่ (สูง ≥ 64px), ข้อความสั้น, ออกแบบ tablet แนวตั้งก่อน, ภาษาไทย
6. **เพิ่มหน้าใหม่** = เพิ่มใน `lib/modules.ts` ด้วย (เมนู + คู่มือ) · **เพิ่ม collection** = เพิ่ม interface พร้อม `@collection` และ comment ใน `types.ts`
7. **Next.js 16** — อ่าน `web/AGENTS.md` + docs ใน `node_modules/next/dist/docs/` ก่อนใช้ API ที่ไม่แน่ใจ · ESLint เข้ม (ห้าม `Date.now()` ใน component, ห้าม setState ตรง ๆ ใน effect)
8. จบงานแต่ละรอบ: `npm run test:server` + `npm run lint` + `npm run build` + `npm run smoke:isolated` ผ่าน → commit → ติ๊ก ROADMAP.md
9. ตอบเป็นภาษาไทย รูปแบบ checklist กระชับ

## ข้อจำกัดจากแฟรนไชส์ (ต้องเคลียร์กับ HQ ก่อนใช้จริง)

- ชื่อ/โลโก้ Bright Up Kids เป็นของ HQ — สื่อการตลาดและแอปที่ใช้แบรนด์ต้องได้รับอนุญาต
- เนื้อหาแบบฝึกหัดของ HQ มีลิขสิทธิ์ — **โจทย์ในระบบแต่งเองทั้งหมด** ห้ามคัดลอกจากเอกสาร HQ หรือหนังสือแบบฝึกหัดอื่น
- ค่า royalty คิดจากค่าเรียน — รายงาน "ยอดรับรายเดือน + royalty" ใช้ `ROYALTY_RATE` (23%) ต้องตรวจกับสัญญา

## ข้อตัดสินใจของเจ้าของ (รายละเอียดใน docs/FEATURES.md ข้อ C)

- งบของรางวัล 3,000 บาท/เดือน — ระบบกันส่งมอบเกินงบ
- ลิมิตรายวัน 3 ชม. หรือครบจำนวนโจทย์ — เกินแล้วเล่นต่อได้แต่ไม่นับคะแนน
- AI ใช้เฉพาะฝั่งครู/เจ้าของ ห้ามทำฟีเจอร์ให้เด็กคุยกับ AI

## คำสั่ง

```bash
cd web
npm install
npm run dev      # http://localhost:3000 → ครั้งแรกเข้า /setup สร้างบัญชีเจ้าของ
npm run lint
npm run build
npm run test:server
npm run smoke:isolated # หลัง build: เปิด server + ฐานข้อมูลชั่วคราว แล้วเก็บกวาดอัตโนมัติ
npm run smoke          # ใช้เฉพาะ server ทดสอบที่มีฐานข้อมูลว่างอยู่แล้ว
```

ตั้งค่าบริการภายนอก: คัดลอก `web/.env.local.example` เป็น `web/.env.local`
