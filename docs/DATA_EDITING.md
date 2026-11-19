# คู่มือแก้ข้อมูลจริงในระบบ (สำหรับ AI agent ทุกตัว: Codex / Claude Code / อื่น ๆ)

ระบบนี้**เปิดใช้งานจริงแล้ว** มีนักเรียนจริง ผู้ปกครองจริง และเงินจริงอยู่ในฐานข้อมูล
คุณ (agent) **แก้ข้อมูลได้** แต่ต้องทำตามกติกาในไฟล์นี้ทุกข้อ

---

## 3 กฎที่ห้ามพลาด

### 1. ยิงผ่าน API ของระบบ ห้ามเขียน Firestore ตรง ๆ

ใช้ `web/scripts/admin-api.mjs` เท่านั้น เพราะมันผ่าน validation + สิทธิ์ + แจ้งเตือนผู้ปกครองครบ
เขียน Firestore ตรงด้วย Admin SDK = ข้ามด่านตรวจทั้งหมด ข้อมูลเสียรูปเงียบ ๆ
(ยกเว้นงานที่ API ไม่มีให้ — ดูหัวข้อ "เมื่อ API ไม่มีให้" ท้ายไฟล์)

### 2. PATCH ต้องส่งฟิลด์เดิมมาครบทุกช่อง

handler สร้าง object ใหม่จาก body ทั้งก้อน **ไม่ได้ merge** — ช่องที่ไม่ส่ง = ข้อมูลหาย
ดังนั้น **GET ของเดิมมาก่อนทุกครั้ง** แล้วแก้เฉพาะช่องที่ต้องการ

### 3. ข้อมูลเงิน และข้อมูลเด็ก ต้องให้เจ้าของสั่งชัดเจนก่อน

| ห้ามทำเองเด็ดขาด ถ้าเจ้าของไม่ได้สั่งตรง ๆ | เหตุผล |
|---|---|
| สร้าง / ยกเลิก / ลบใบแจ้งค่าเรียน (invoices) | เป็นเงินจริงที่เจ้าของกรอกเอง |
| กดรับชำระเงิน (`invoices/:id/pay`) | ผูกกับรายรับและรายงานภาษี |
| ลบนักเรียน ปิดการใช้งานนักเรียน ลบคอร์ส | กระทบผู้ปกครองและตารางสอนทันที |
| รีเซ็ต PIN นักเรียน / รหัสผ่านผู้ใช้ | เด็กและครูเข้าระบบไม่ได้ |
| ส่งแจ้งเตือน (`invoices/remind`, `notify/weekly`) | ยิงข้อความเข้า LINE ผู้ปกครองจริง |

**คำถามไม่ใช่คำสั่ง** — ถ้าเจ้าของถามว่า "ทำไมยอดยังไม่เป็น 0" นั่นคือ*คำถาม* ให้ตอบและเสนอทางเลือก
**ห้ามลงมือแก้ข้อมูลการเงินจากการตีความคำถาม** (บทเรียนจริงจากเหตุการณ์ 19 พ.ย. 2569 — agent ไปยกเลิกใบแจ้งค่าเรียน 5 ใบที่เจ้าของเพิ่งกรอก)

---

## เตรียมเครื่องมือ (ทำครั้งเดียว)

ใส่ใน `web/.env.local` (ไฟล์นี้ถูก gitignore ไว้แล้ว ห้าม commit):

```
ADMIN_BASE_URL=https://bright-up-kids--brightupkids-watluangphoto.asia-southeast1.hosted.app
ADMIN_USERNAME=<ชื่อผู้ใช้เจ้าของ>
ADMIN_PASSWORD=<รหัสผ่านเจ้าของ>
# ADMIN_TOTP=123456   ใส่เฉพาะเมื่อเปิดบังคับ 2FA (รหัสหมดอายุ 30 วิ)
```

ถ้าไม่ตั้ง `ADMIN_BASE_URL` จะยิงไปที่ `http://localhost:3000` (ปลอดภัยกว่า ใช้ลองก่อนได้)

วิธีใช้:

```bash
cd web
node scripts/admin-api.mjs GET   admin/students
node scripts/admin-api.mjs POST  admin/courses '{...}'
node scripts/admin-api.mjs PATCH admin/students/<id> '{...}'
```

---

## งานที่ทำบ่อย

### แก้ข้อมูลนักเรียน

```bash
node scripts/admin-api.mjs GET admin/students          # หา id ก่อน
node scripts/admin-api.mjs PATCH admin/students/<id> '{
  "nickname":"ไข่มุก","fullName":"ด.ญ.สร้อยสุวรรณ จันทร์เจริญ","grade":5,
  "school":"วัดบางพลีใหญ่กลาง","parentPhone":"0984791464","parentName":"น.ส.เพ็ญพรรณ ดวงจันทร์",
  "active":true
}'
```

บังคับ: `nickname`, `fullName`, `grade` (1-9 · 7-9 = ม.1-3)
ไม่บังคับ: `school englishName birthDate program targetSchool addressLine subdistrict district province postcode lineId facebook parentPhone parentName source note active`
ใส่ `parentPhone` ที่ยังไม่มีในระบบ = สร้างบัญชีผู้ปกครองใหม่ให้อัตโนมัติ (คืน `parentTempPassword` มาด้วย — ส่งให้เจ้าของ ห้ามเขียนลงไฟล์ใน repo)

### เพิ่มนักเรียนใหม่

```bash
node scripts/admin-api.mjs POST admin/students '{"nickname":"...","fullName":"...","grade":5,"pdpaConsent":true}'
```
ต้องมี `pdpaConsent: true` — ใส่ได้เฉพาะเมื่อผู้ปกครองเซ็นยินยอมบนกระดาษแล้วจริง

### แก้คอร์ส / ตั้งครู / ตั้งวันเริ่ม

```bash
node scripts/admin-api.mjs GET admin/courses
node scripts/admin-api.mjs PATCH admin/courses/<id> '{
  "name":"อังกฤษ ป.5","subject":"english","grades":[5],"pricePerTerm":1000,
  "weekday":6,"startTime":"10:00","endTime":"11:30","capacity":8,
  "startDate":"2026-11-07","weeks":4,"teacherId":"<id ครู>","teacherName":"ครูวิวเลียม","active":true
}'
```

บังคับ: `name subject grades weekday startTime endTime pricePerTerm capacity`
`subject` = `math|english|science|thai|chinese|other` · `weekday` 0=อาทิตย์ … 6=เสาร์
**`startDate` ต้องตรงกับ `weekday`** ไม่งั้น API ตีกลับ (ปฏิทินจะเพี้ยนทั้งคอร์ส)
ชื่อชั้นเรียนกับรายชื่อวิชาอยู่ที่ `web/src/lib/grade.ts` ที่เดียว — ห้าม hardcode

### ลง/ถอนคอร์สของนักเรียน

ส่ง **รายการคอร์สทั้งหมดที่ต้องการให้เหลือ** (ของที่ไม่อยู่ในรายการจะถูกยกเลิก)

```bash
node scripts/admin-api.mjs POST admin/students/<id>/courses '{"courseIds":["c1","c2"]}'
```

### ตั้ง "เหลืออีกกี่คาบ" รายคน

```bash
node scripts/admin-api.mjs POST admin/enrollments/quota '{"studentId":"<id>","courseId":"<id>","remaining":2}'
node scripts/admin-api.mjs POST admin/enrollments/quota '{"studentId":"<id>","courseId":"<id>","remaining":null}'  # ยกเลิกการจำกัดคาบ
```
ระบบคิด `sessionsPaid = remaining + คาบที่ใช้ไปแล้ว` ให้เอง (คาบที่ใช้ = เช็กชื่อว่า "มาเรียน" หรือ "มาสาย")

### ดูข้อมูลอย่างเดียว (ปลอดภัย ทำได้เสมอ)

```
GET admin/dashboard  admin/students  admin/courses  admin/timetable  admin/teacher-sheet
GET admin/calendar?month=2026-12    admin/attendance   admin/invoices   admin/expenses
GET admin/payroll    admin/budget   admin/supplies   admin/assessments  admin/reports
GET admin/applications  admin/leads  admin/teachers  admin/users  admin/settings
```

---

## รายการ API ทั้งหมด

เส้นที่แก้ข้อมูล (เรียงตามความเสี่ยง — แถวล่างต้องขออนุญาตก่อน):

| ปลอดภัย (แก้ได้เลยถ้าเจ้าของสั่งงานนั้นอยู่) |
|---|
| `POST/PATCH admin/courses` · `PATCH admin/students/:id` · `POST admin/students/:id/courses` |
| `POST admin/enrollments/quota` · `POST/PATCH/DELETE admin/supplies` · `POST admin/supplies/:id/move` |
| `POST/PATCH/DELETE admin/assessments` · `POST/PATCH/DELETE admin/exercises` · `POST admin/exercises/seed` |
| `POST/PATCH/DELETE admin/expenses` · `PUT/DELETE admin/budget` · `POST/PATCH/DELETE admin/leads` |
| `POST/PATCH admin/makeups` · `POST/PATCH admin/rewards` · `POST admin/attendance` · `POST admin/assignments` |

| ต้องให้เจ้าของสั่งตรง ๆ |
|---|
| `POST admin/invoices` · `POST admin/invoices/:id/pay` · `POST admin/invoices/:id/void` · `POST admin/invoices/remind` |
| `POST admin/students` (สร้างนักเรียน) · `POST admin/students/:id/pin` |
| `POST admin/users` · `POST admin/users/:id/active` · `POST admin/users/:id/reset` · `PATCH admin/users/:id/rate` |
| `PATCH admin/settings` · `POST admin/notify/weekly` · `POST admin/payroll` |
| `POST admin/applications/:id/approve` / `reject` · `POST admin/redemptions/:id/handover` / `reject` |

---

## ทดลองก่อนแตะของจริง

```bash
cd web
npm run smoke:isolated   # ยิง API ทั้งระบบกับฐานข้อมูลชั่วคราว ปลอดภัยเสมอ (289 เช็ก)
npm run dev              # แล้วไม่ตั้ง ADMIN_BASE_URL = ยิงเข้า localhost
```

**ห้ามรัน `npm run smoke`** (ตัวไม่มี `:isolated`) ใส่เซิร์ฟเวอร์ที่ต่อ Firestore จริง — มันจะสร้างนักเรียนและใบแจ้งค่าเรียนปลอมปนของจริง

---

## เมื่อ API ไม่มีให้

บางอย่างระบบตั้งใจไม่เปิดให้ลบ เช่น **ลบใบแจ้งค่าเรียนถาวร** (มีแต่ "ยกเลิก" = void เพื่อเก็บประวัติ)
ถ้าจำเป็นต้องทำจริง:

1. **ขออนุญาตเจ้าของก่อน** บอกให้ชัดว่าจะลบอะไร กี่รายการ และกู้คืนไม่ได้
2. เขียนสคริปต์ Admin SDK ไว้ใน scratchpad (ไม่ใช่ใน repo) อ่านคีย์จาก `web/.env.local` ช่อง `FIREBASE_SERVICE_ACCOUNT`
3. ลบของที่เกี่ยวข้องให้ครบ ไม่ใช่แค่ตัวหลัก — ตัวอย่าง: ลบ invoice ต้องลบ `slips/<invoiceId>` และ `notifications` ที่ `kind` เป็น `invoice`/`payment` ด้วย ไม่งั้นพอต่อ LINE OA จะยิงข้อความเก่าไปหาผู้ปกครอง
4. รายงานผลเป็นรายการ ว่าลบอะไรไปกี่ชิ้น และอะไรที่ยังอยู่

---

## ก่อนปิดงานทุกครั้ง

```bash
cd web && npm run test:server && npm run lint && npm run build && npm run smoke:isolated
```

ครบ 4 อย่างแล้วค่อย commit · อัปเดต `ROADMAP.md` / `BACKLOG.md` · อ่าน `AGENTS.md` สำหรับกฎการเขียนโค้ด
