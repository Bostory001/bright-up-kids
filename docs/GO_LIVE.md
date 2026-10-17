# ขั้นตอนเปิดใช้งานจริง (S1–S5)

ทำตามลำดับ แต่ละขั้นมีวิธีตรวจว่าสำเร็จ · ค่าทุกตัวใส่ใน `web/.env.local` (ในเครื่อง) และ Vercel > Settings > Environment Variables (ของจริง)
ห้ามส่งค่าเหล่านี้ในแชต/อีเมล และห้าม commit ลง git

## ตรวจในเครื่องก่อนเชื่อมบริการจริง

รันจากโฟลเดอร์ `web`: `npm run test:server`, `npm run lint`, `npm run build`, แล้ว `npm run smoke:isolated`
คำสั่งสุดท้ายเปิด production server บนพอร์ตว่าง สร้างฐานข้อมูลชั่วคราว ปิดการเชื่อมบริการภายนอกสำหรับ process ทดสอบ แล้วปิด server และลบเฉพาะโฟลเดอร์ชั่วคราวนั้นเมื่อเสร็จ ไม่ต้องลบ `web/.data`
ผลในเครื่องยืนยันได้เฉพาะ file adapter; Firestore, LINE, AI และอุปกรณ์จริงยังต้องทดสอบตาม S1–S5

## S1 ฐานข้อมูล Firestore

- [ ] เข้า https://console.firebase.google.com ด้วยบัญชี Google ที่จะเป็นเจ้าของระบบ → Add project (ตั้งชื่อ เช่น `brightup-watluangphoto`) · ไม่ต้องเปิด Analytics
- [ ] Build > Firestore Database > Create database → โหมด **Production** → ตำแหน่ง `asia-southeast1 (Singapore)`
- [ ] แท็บ Rules: วางเนื้อหาจาก `web/firestore.rules` (ปิดทั้งหมด) แล้ว Publish
- [ ] Project settings > Service accounts > **Generate new private key** → ได้ไฟล์ JSON
- [ ] เปิดไฟล์ JSON คัดลอกทั้งหมดเป็น**บรรทัดเดียว** ใส่ใน `FIREBASE_SERVICE_ACCOUNT=` แล้วลบไฟล์ JSON ทิ้ง
- [ ] ตรวจ: `npm run dev` → เปิดหน้าแรก → สร้างบัญชีเจ้าของ → ใน Firebase Console ต้องเห็น collection `users`
- [ ] (แนะนำ) ทดสอบทั้งระบบกับ project ทดลองอีกตัว: ตั้ง env ชี้ไป project ทดลองที่ว่าง แล้วรัน `npm run smoke` ต้องผ่านทุกข้อ — **อย่ารันกับ project จริง** เพราะจะสร้างข้อมูลทดสอบ

หมายเหตุ: บัญชี Firebase อยู่แผน Blaze อยู่แล้ว แต่ project ใหม่เริ่มที่ Spark · ระบบนี้ใช้แค่ Firestore ผ่าน Admin SDK ซึ่งใช้บน Spark ได้ ปริมาณระดับสาขาเดียวอยู่ในโควตาฟรี

## S2 นำขึ้น Vercel

- [ ] สร้าง repo บน GitHub (private) แล้ว push โฟลเดอร์ `BrightUpKids`
- [ ] https://vercel.com > Add New Project > เลือก repo → **Root Directory = `web`**
- [ ] ใส่ Environment Variables ครบตาม `.env.local.example` (อย่างน้อย `FIREBASE_SERVICE_ACCOUNT`) → Deploy
- [ ] ตั้ง `CRON_SECRET` เป็นข้อความสุ่มยาว ๆ (สรุปรายสัปดาห์จะส่งทุกวันอาทิตย์ 18:00 น. เวลาไทย ตาม `web/vercel.json`)
- [ ] ตรวจ: เปิดโดเมนที่ได้ → `/setup` สร้างบัญชีเจ้าของ → ตั้ง 2FA
- [ ] ตรวจ PWA: iPad เปิดด้วย Safari > แชร์ > เพิ่มไปยังหน้าจอโฮม · Android เปิดด้วย Chrome > เมนู > ติดตั้งแอป

ถ้าไม่ตั้ง `FIREBASE_SERVICE_ACCOUNT` บน Vercel ระบบจะปฏิเสธการเริ่มฐานข้อมูลโดยไม่เขียนไฟล์ — ต้องตั้งก่อน deploy

## S3 LINE OA

- [ ] https://manager.line.biz สร้าง LINE Official Account ของสาขา
- [ ] https://developers.line.biz > สร้าง Provider 1 ตัว (ทุก channel ต้องอยู่ใน Provider เดียวกัน)
- [ ] เปิด **Messaging API** ให้ OA → คัดลอก Channel secret → `LINE_CHANNEL_SECRET` · ออก Channel access token (long-lived) → `LINE_CHANNEL_ACCESS_TOKEN`
- [ ] Webhook URL = `https://<โดเมน>/api/line/webhook` → เปิด Use webhook → กด Verify ต้องขึ้น Success
- [ ] ปิดข้อความตอบกลับอัตโนมัติของ OA (ไม่งั้นจะตอบซ้อนกับระบบ)
- [ ] ตรวจ: เข้าหน้าผู้ปกครอง > ผูก LINE > พิมพ์รหัส 6 หลักใน OA → ได้ข้อความยืนยัน → ครูเช็กชื่อ → ผู้ปกครองได้ข้อความ และหน้า "แจ้งเตือน LINE" ขึ้น "ส่งแล้ว"

เข้าระบบด้วย LINE (ไม่บังคับ):

- [ ] ใน Provider เดียวกัน สร้าง **LINE Login** channel → Channel ID → `LINE_LOGIN_CHANNEL_ID`
- [ ] แท็บ LIFF > Add: Endpoint URL = `https://<โดเมน>/parent/line`, Scope = `openid` → ได้ LIFF ID → `LINE_LIFF_ID`
- [ ] ใส่ลิงก์ `https://liff.line.me/<LIFF ID>` ใน rich menu ของ OA
- [ ] ตรวจ: ผู้ปกครองที่ผูก LINE แล้วกดเมนู → เข้าหน้าผู้ปกครองได้โดยไม่ต้องพิมพ์รหัสผ่าน

ค่าใช้จ่าย: ข้อความแบบ push นับโควตาของแพ็กเกจ OA — ตรวจจำนวนข้อความฟรีต่อเดือนของแพ็กเกจปัจจุบันในหน้า LINE OA Manager ก่อนเปิดแจ้งเตือนทุกประเภท

## S4 ผู้ช่วย AI

- [ ] https://console.anthropic.com > API Keys > Create Key → `ANTHROPIC_API_KEY` · ตั้งวงเงินรายเดือน (Limits) กันค่าใช้จ่ายบานปลาย
- [ ] ตรวจ: หลังบ้าน > ผู้ช่วย AI > ถาม "ใครค้างค่าเรียน" ต้องได้คำตอบตรงกับหน้าค่าเรียน
- [ ] ตรวจ: แบบฝึกหัด > สร้างชุดใหม่ > ใส่หัวข้อ > ให้ AI ร่าง → อ่านทุกข้อก่อนเผยแพร่

ข้อมูลที่ส่งให้ AI มีแค่รหัสนักเรียน ชื่อเล่น และสถิติ · ควรแจ้งในเอกสารยินยอมของผู้ปกครองว่ามีการใช้ผู้ช่วย AI ประมวลผลข้อมูลสถิติ

## S5 ทดลองกับเด็กจริง

- [ ] นำเข้าชุดโจทย์เริ่มต้น (แบบฝึกหัด > นำเข้าชุดโจทย์เริ่มต้น) → ครูอ่านตรวจทีละชุด → เผยแพร่
- [ ] พิมพ์บัตร QR ให้เด็ก 3–5 คน ลองบน tablet จริง
- [ ] จดสิ่งที่เด็กติด: หาปุ่มไม่เจอ / อ่านไม่ออก / ช้า / เบื่อ
- [ ] ตั้งราคาของรางวัลด้วยตัวช่วยในหน้า "ตั้งค่า" หลังรู้จำนวนเด็กจริง
- [ ] สำรองข้อมูล: Firebase Console > Firestore > ตั้ง scheduled backup หรือ export เป็นระยะ

## Runtime สำหรับชุดทดสอบ

ชุดตรวจล่าสุดใช้ Node.js 24.16.0; `test:server` ใช้ `node:module.registerHooks` จึงควรรันด้วย Node.js 24 LTS
