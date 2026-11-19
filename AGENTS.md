# คู่มือสำหรับ AI agent ทุกตัวที่มาแก้โปรเจกต์นี้ (Codex / Claude Code / อื่น ๆ)

ไฟล์นี้คือกติกากลาง · Claude Code อ่าน `CLAUDE.md` ซึ่งมีรายละเอียดธุรกิจเพิ่ม — **กฎทางเทคนิคในสองไฟล์ต้องตรงกันเสมอ แก้ที่ไหนแก้ให้ครบทั้งคู่**

## โปรเจกต์นี้คืออะไร

ระบบบริหารสถาบันกวดวิชา **Bright Up Kids สาขาวัดหลวงพ่อโต บางพลี** (ป.1 – ม.3)
เปิดใช้งานจริงแล้ว มีนักเรียนจริง ครูจริง และข้อมูลเด็กจริงอยู่ในระบบ — **ไม่ใช่โปรเจกต์ทดลอง**

- เว็บจริง: https://bright-up-kids--brightupkids-watluangphoto.asia-southeast1.hosted.app
- โฮสต์: Firebase App Hosting (Cloud Run, asia-southeast1) · ฐานข้อมูล Firestore ใน project เดียวกัน
- repo: `Bostory001/bright-up-kids` branch `main` · **push ขึ้น main = deploy ขึ้นเว็บจริง**

## โครงไฟล์

| ที่ | อะไร |
|---|---|
| `web/` | แอป Next.js 16 (App Router, TS, Tailwind 4) — โค้ดทั้งหมดอยู่ที่นี่ |
| `web/src/lib/types.ts` | data model · 1 interface ที่มี `@collection` = 1 collection ใน Firestore |
| `web/src/lib/server/routes/*.ts` | API ทุกเส้น · แต่ละ route ประกาศสิทธิ์ไว้ข้าง handler |
| `web/src/lib/grade.ts` | **ที่เดียว**ที่กำหนดชั้นเรียน (ป.1-ม.3) และรายชื่อวิชา |
| `web/src/lib/{finance,schedule,assessment,supplies,timetable}.ts` | ตรรกะที่ทดสอบได้ตรง ๆ (ไม่มี state) |
| `web/scripts/` | เทสต์ + สคริปต์ดูแลระบบ |
| `ROADMAP.md` / `BACKLOG.md` | สิ่งที่ทำไปแล้ว / สิ่งที่ยังไม่ทำ — **อัปเดตทุกครั้งที่ปิดงาน** |
| `docs/GO_LIVE.md` | ขั้นตอนต่อบริการภายนอก (Firestore, LINE, AI, cron) |

## คำสั่ง (รันจาก `web/`)

```bash
npm install
npm run dev              # http://localhost:3000
npm run lint
npm run build
npm run test:server      # unit test (node:test)
npm run smoke:isolated   # ยิง API ทั้งระบบกับฐานข้อมูลชั่วคราว ปลอดภัยเสมอ
npm run check:firestore  # ตรวจว่าเชื่อม Firestore จริงได้
npm run seed:demo        # ใส่ข้อมูลตัวอย่าง (ทุก id ขึ้นต้น demo-)
npm run seed:demo -- --reset   # ล้างเฉพาะข้อมูลตัวอย่าง
node scripts/admin-api.mjs GET admin/students   # อ่าน/แก้ข้อมูลจริงผ่าน API (ดูด้านล่าง)
```

## กฎที่ห้ามพลาด

1. **จบงานทุกรอบต้องผ่านครบ 4 อย่าง**: `npm run test:server` + `npm run lint` + `npm run build` + `npm run smoke:isolated` แล้วค่อย commit
2. **วิเคราะห์ผลกระทบก่อนแก้** — เจ้าของ/ครู/ผู้ปกครอง/นักเรียน ใช้ข้อมูลชุดเดียวกัน แก้ `types.ts` ต้องไล่เช็กทุก route และทุกหน้า
3. **ทุก route ประกาศสิทธิ์ให้แคบที่สุด** และห้ามส่ง `passwordHash`, `pinHash`, `totpSecret`, `answerIndex` (ให้นักเรียน), `costBaht` (ให้นักเรียน) ออก API
4. **คะแนน เหรียญ เงิน คิดฝั่ง server เท่านั้น**
5. **ข้อมูลเด็ก (PDPA)** — เก็บเท่าที่จำเป็น ต้องมีการยินยอมของผู้ปกครองก่อนสร้างนักเรียน **ห้ามใส่ข้อมูลเด็กจริงลง repo หรือลงเทสต์** (ใช้ชื่อสมมติเท่านั้น)
6. **ห้าม commit ความลับ** — `web/.env.local` (คีย์ Firebase), `.cron-secret.txt`, ไฟล์รหัสผ่าน ถูก gitignore ไว้แล้ว อย่าแก้ .gitignore ให้หลุด
7. **ชั้นเรียนกับวิชา**: ห้ามเขียน `ป.${grade}` หรือรายชื่อวิชาทับเอง ให้ import จาก `lib/grade.ts` (ไม่งั้น ม.1 จะแสดงเป็น "ป.7")
8. **UI เด็ก** ปุ่มสูง ≥ 64px ข้อความสั้น ภาษาไทย ออกแบบ tablet แนวตั้งก่อน
9. **เพิ่มหน้าใหม่** = เพิ่มใน `web/src/lib/modules.ts` ด้วย (เมนูและคู่มือสร้างจากที่นั่น) · **เพิ่ม collection** = เพิ่ม interface พร้อม `@collection` ใน `types.ts`
10. **Next.js 16** — อ่าน `web/AGENTS.md` และ docs ใน `node_modules/next/dist/docs/` ก่อนใช้ API ที่ไม่แน่ใจ · ESLint เข้ม (ห้าม `Date.now()` ใน component, ห้าม setState ตรง ๆ ใน effect)

## แก้ข้อมูลจริง (นักเรียน คอร์ส ตาราง เงิน)

**คุณแก้ข้อมูลจริงได้** แต่ต้องอ่าน **[docs/DATA_EDITING.md](docs/DATA_EDITING.md)** ก่อนลงมือ — ในนั้นมีคำสั่งพร้อมใช้ ฟิลด์บังคับของทุก entity และรายการ API ทั้งหมด

สรุป 4 ข้อที่พลาดไม่ได้:

1. **ยิงผ่าน API ของระบบ** ด้วย `node scripts/admin-api.mjs <METHOD> <path> '<json>'` (รันจาก `web/`) ไม่เขียน Firestore ตรง ๆ
   ตั้งค่าใน `web/.env.local`: `ADMIN_BASE_URL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD` (+`ADMIN_TOTP` ถ้าเปิด 2FA) · ไม่ตั้ง BASE_URL = ยิง localhost
2. **PATCH ต้องส่งฟิลด์เดิมมาครบ** handler ไม่ merge — GET ของเดิมมาก่อนทุกครั้ง ไม่งั้นช่องที่ไม่ส่งจะหาย
3. **เงินกับข้อมูลเด็ก ต้องให้เจ้าของสั่งตรง ๆ** — ใบแจ้งค่าเรียน (สร้าง/รับชำระ/ยกเลิก/ลบ/ทวง) · สร้างหรือปิดนักเรียน · รีเซ็ต PIN/รหัสผ่าน · ส่งแจ้งเตือนเข้า LINE · `admin/settings`
   **คำถามไม่ใช่คำสั่ง** — "ทำไมยอดไม่เป็น 0" คือคำถาม ให้ตอบและเสนอทางเลือก ห้ามลงมือแก้ข้อมูลการเงินจากการตีความ
4. **ลองกับของปลอมก่อน** `npm run smoke:isolated` ปลอดภัยเสมอ · **ห้ามรัน `npm run smoke`** (ไม่มี `:isolated`) ใส่เซิร์ฟเวอร์ที่ต่อ Firestore จริง มันจะสร้างนักเรียน/ใบแจ้งค่าเรียนปลอมปนของจริง

ข้อมูลตัวอย่างทุกชิ้น id ขึ้นต้น `demo-` ล้างได้ด้วย `npm run seed:demo -- --reset`

## deploy

push ขึ้น `main` แล้ว Firebase App Hosting จะ build เองประมาณ 5-8 นาที
ถ้าไม่ขยับให้สั่งเอง: `firebase apphosting:rollouts:create bright-up-kids -b main -f --project brightupkids-watluangphoto`

**ยืนยันว่าขึ้นจริงด้วยสิ่งที่วัดได้** (ยิง API ดูค่าที่เปลี่ยน) อย่าเชื่อว่า push แล้วคือขึ้นแล้ว — หน้าเว็บเป็น client component ข้อความใหม่จะไม่โผล่ใน HTML ตอน curl

## ทำงานร่วมกันหลาย agent

- **ก่อนเริ่ม `git pull` เสมอ** และก่อน push ตรวจว่าไม่มีใครแก้ไฟล์เดียวกันค้างอยู่
- งานใหญ่ให้แตก branch หรือ `git worktree` แยก แล้วค่อย merge (ตัวอย่าง: `git worktree add ../BrightUpKids-xxx -b xxx`)
- **อย่าให้สอง agent แก้ไฟล์ชุดเดียวกันพร้อมกัน** — คนหลังจะทับงานคนแรกเงียบ ๆ
- เขียน commit message เป็นภาษาไทย บอก "แก้อะไร เพราะอะไร" และถ้าเทสต์จับบั๊กได้ให้เขียนไว้ด้วย
- ปิดงานแล้วอัปเดต `ROADMAP.md` / `BACKLOG.md`

## สิ่งที่ยังค้างอยู่ (ดูรายละเอียดใน BACKLOG.md)

- ระบบนับ**ชั่วโมงคงเหลือ**รายคน (สถาบันขายเป็นแพ็ก 6 ชม. 1,000 บาท ไม่ใช่รายเทอม) — ของที่มีตอนนี้นับเป็นสัปดาห์
- ต่อ LINE OA (S3) · ผู้ช่วย AI (S4) · Cloud Scheduler ให้สรุปรายสัปดาห์ทำงาน
- หลายคอร์สยังไม่ได้ตั้งครู ค่าเรียน วันเริ่ม และจำนวนสัปดาห์
