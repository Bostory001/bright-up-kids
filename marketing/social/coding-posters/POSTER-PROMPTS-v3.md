# Prompt โปสเตอร์คอร์ส Coding — v3 (ตามสไตล์โปสเตอร์จริงของสถาบัน)

> อิงโปสเตอร์ตัวอย่าง "รีวิวจากผู้ปกครอง" ที่เจ้าของส่งมา: พื้นหลังห้องเรียนสว่างเบลอ · เด็กยิ้มชูนิ้วมุมขวาล่าง · ป้ายหัวข้อกรมท่าขอบขาวตัวใหญ่ · ฟองคำพูดคำโปรยเน้นคำสีชมพู/ฟ้า · โลโก้ + ป้ายเหลือง "สถาบันกวดวิชา" มุมซ้ายบน
> แทนที่ [v1](PROMPTS.md) (ไม่มีตัวหนังสือ) และ [v2](POSTER-PROMPTS.md) (แนวแฟนตาซี ไม่ตรงสไตล์สถาบัน)
> ยังไม่ได้ลองรันกับ ChatGPT จริง

## ต้องเตรียม 2 ไฟล์แนบ
1. **ไฟล์โลโก้ Bright Up Kids** (PNG พื้นโปร่ง ตัวเต็มพร้อมป้าย "สถาบันกวดวิชา" ถ้ามี) — AI วาดโลโก้เองจะเพี้ยน ต้องแนบให้
2. **โปสเตอร์ตัวอย่าง "รีวิวจากผู้ปกครอง"** (ภาพที่ส่งมา) — เป็นภาพอ้างอิงสไตล์/เลย์เอาต์

## วิธีใช้
1. แชทใหม่ใน ChatGPT → แนบ 2 ไฟล์ข้างบน → วาง **MASTER v3** 1 ครั้ง
2. วางบล็อกคอร์สทีละอัน → 1 บล็อก = 1 โปสเตอร์
3. ไม่ถูกใจ: "regenerate, same layout, change only: …"

---
## MASTER v3 (วางครั้งเดียว พร้อมแนบ 2 ไฟล์)

```
I attached two files: (1) our school's LOGO, (2) a finished poster from our school used
as the STYLE and LAYOUT REFERENCE. Create a series of 10 advertising posters, one per
course, that look like they belong to the same family as the reference poster. I will
send one COURSE block at a time.

FORMAT
Vertical 4:5 portrait (1080x1350), Facebook-ad ready. Keep all key content inside the
frame with comfortable margins.

COPY THE REFERENCE'S LOOK
- Bright, warm, softly blurred school/classroom background (window light, bookshelves,
  white and yellow tones). Polished semi-realistic illustration quality, soft lighting.
- One smiling Thai child in the lower right, in a white polo with yellow collar and
  yellow trim, doing a friendly pose. A generic AI-generated child, not a real person.
- A huge, bold, rounded Thai headline inside a dark-navy rounded badge with a thick white
  outline and small pink/yellow sparkle accents (like the reference "รีวิวจากผู้ปกครอง").
- A white rounded speech-bubble with a navy outline holding the tagline; highlight the
  key words in pink and blue, add a hand-drawn yellow underline (like the reference).
- Brand colors: navy blue, sunny yellow, pink, white. Friendly, trustworthy, premium.
- Logo: place the attached logo exactly as provided at the top-left, with the small
  rounded yellow pill reading "สถาบันกวดวิชา" under it exactly like the reference.
  Do not redraw or alter the logo.

LAYOUT FOR EVERY POSTER
1. Top-left: logo. Top-right: the TITLE badge.
2. Right-middle: the TAGLINE speech bubble.
3. Left and center: a large phone/tablet/laptop mockup (as in the reference's phone)
   showing the SCREEN picture from the COURSE block. The screen shows only
   illustrations and abstract shapes, never readable text or code.
4. Around the device: the PROPS floating as cute 3D-sticker style icons.
5. Lower right: the CHILD from the COURSE block.
6. Lower left, above the bottom strip: three small rounded colorful sticker-chips with
   the CHIPS text.
7. Bottom strip (full width, rounded, white with navy text): the INFO text, and under it
   a smaller line "สาขาวัดหลวงพ่อโต บางพลี". Next to it a rounded button-shaped box
   with "สอบถามรายละเอียด" and an EMPTY white rounded rectangle (contact details added later).

TEXT RULES
- Render every Thai string EXACTLY as written in quotes, every character and tone mark.
  Do not rephrase or invent ANY other text, numbers, prices, phone numbers or URLs.
- Large, high-contrast, very legible Thai type, readable at phone size.
- Latin words (Python, Scratch, if, while, list, error) stay exactly as given.

HARD RULES
- Do not show the Scratch, ScratchJr or Python logos, and no copyrighted characters or
  mascots (no orange cat mascot, no snake logo, no triangle robot).
- Nothing scary or dark; no weapons.
- Never show any real child's photo or identifiable personal data.

After each image, reply with the course code and "ok" only.
```

---
## บล็อกคอร์ส

### A1
```
COURSE A1
TITLE: "หุ่นยนต์หาดาว"
TAGLINE: "เรียนคิดเป็นขั้นตอนผ่านเกม" (highlight "คิดเป็นขั้นตอน" in pink and "เกม" in blue)
CHIPS: "สั่งงานเป็นลำดับ" | "ล่าบั๊ก" | "สร้างเขาวงกต"
INFO: "ป.1–2 · 8 คาบ"
SCREEN: a tablet showing a cute game scene: a small round friendly robot (not
triangular) on a grid of glowing tiles with arrow symbols heading to a golden star.
PROPS: floating golden star, arrow tiles, a small round robot toy, sparkles.
CHILD: a smiling 7-year-old boy holding a tablet corner with a thumbs-up.
```

### A2
```
COURSE A2
TITLE: "เล่าเรื่องของฉัน"
TAGLINE: "สร้างนิทานเคลื่อนไหวด้วย ScratchJr" (highlight "นิทานเคลื่อนไหว" in pink)
CHIPS: "ตัวละครขยับได้" | "ใส่เสียงพูด" | "เล่าเรื่อง 3 ฉาก"
INFO: "ป.1–2 · 6 คาบ"
SCREEN: a tablet showing a colorful storybook scene: green hill, castle and sea with a
little boat, in three small panels.
PROPS: floating open storybook, musical notes, speech bubbles (blank), stars.
CHILD: a smiling 7-year-old girl hugging a tablet, one hand giving a thumbs-up.
```

### B1
```
COURSE B1
TITLE: "แอนิเมชันแรกของฉัน"
TAGLINE: "ทำการ์ดอวยพรเคลื่อนไหวด้วย Scratch" (highlight "การ์ดอวยพร" in pink)
CHIPS: "ตัวละครเคลื่อนไหว" | "ใส่เสียง" | "เปลี่ยนฉาก"
INFO: "ป.3–6 · 6 คาบ · เรียนออนไลน์ได้"
SCREEN: a laptop showing a bright cartoon scene of a round fish swimming in an
aquarium with a blank greeting card shape, plus colorful rounded puzzle blocks (no icons)
on the left side of the screen.
PROPS: floating filmstrip, colorful puzzle blocks, bubbles, music notes.
CHILD: a smiling 10-year-old girl at a desk beside the laptop giving a thumbs-up.
```

### B2
```
COURSE B2
TITLE: "วาดรูปด้วยโค้ด"
TAGLINE: "วาดดาว ดอกไม้ ลายสวยด้วยคำสั่ง" (highlight "ลายสวย" in pink)
CHIPS: "รูปหลายเหลี่ยม" | "วนซ้ำ" | "ลายสไปโรกราฟ"
INFO: "ป.4–6 · 6 คาบ · เรียนออนไลน์ได้"
SCREEN: a laptop showing a dark-blue canvas with a colorful glowing spirograph flower,
a star and a hexagon drawn in neon lines.
PROPS: floating compass and protractor (no numbers), glowing pen, stars.
CHILD: a smiling 10-year-old boy holding a pencil, thumbs-up.
```

### B3
```
COURSE B3
TITLE: "เกมแรกของฉัน"
TAGLINE: "สร้างเกมที่มีคะแนนและชีวิต" (highlight "เกม" in pink)
CHIPS: "ตัวแปร" | "เงื่อนไข" | "เกมเล่นได้จริง"
INFO: "ป.4–6 · 8 คาบ · เรียนออนไลน์ได้"
SCREEN: a laptop showing a cheerful arcade game: red apples falling into a bamboo
basket, three heart icons, a glowing score orb (no digits).
PROPS: floating apples, hearts, star, game controller.
CHILD: a smiling 11-year-old boy with a laptop, thumbs-up.
```

### B4
```
COURSE B4
TITLE: "โปรเจกต์เกมใหญ่"
TAGLINE: "ออกแบบเกมหลายฉากด้วยตัวเอง" (highlight "หลายฉาก" in pink)
CHIPS: "เมนูและฉาก" | "ฟังก์ชัน" | "ทดสอบและแก้บั๊ก"
INFO: "ป.5–6 · 8 คาบ · เรียนออนไลน์ได้"
SCREEN: a laptop showing a game with three connected island levels (meadow, mountain,
starry night) joined by glowing bridges.
PROPS: floating gears, puzzle blocks, a trophy, flags.
CHILD: a smiling 12-year-old girl proudly pointing at the screen, thumbs-up.
```

### C1
```
COURSE C1
TITLE: "Python เริ่มต้น"
TAGLINE: "เขียนโปรแกรมแรกของคุณ" (highlight "โปรแกรมแรก" in pink)
CHIPS: "ตัวแปร" | "รับค่าและคำนวณ" | "แก้ error"
INFO: "ม.1–3 · 6 คาบ · เรียนออนไลน์ได้"
SCREEN: a laptop showing a soft teal-and-navy code-editor-like window made of abstract
colored lines (no readable text) and a small cheerful result bubble.
PROPS: floating glass jars with glowing orbs, a lightbulb, a keyboard keycap, sparkles.
CHILD: a smiling 13-year-old boy at a laptop, thumbs-up (older-looking, still the same polo).
```

### C2
```
COURSE C2
TITLE: "วาดรูปด้วย Python"
TAGLINE: "สร้างลายเรขาคณิตด้วย turtle" (highlight "ลายเรขาคณิต" in pink)
CHIPS: "ลูป for" | "หลายเหลี่ยมและดาว" | "เขียนฟังก์ชัน"
INFO: "ม.1–3 · 6 คาบ · เรียนออนไลน์ได้"
SCREEN: a laptop showing a dark canvas with a cute small turtle drawing rainbow
nested polygons and a spiral.
PROPS: floating turtle sticker, geometric shapes, stars.
CHILD: a smiling 13-year-old girl at a laptop, thumbs-up.
```

### C3
```
COURSE C3
TITLE: "ตัดสินใจและวนซ้ำ"
TAGLINE: "ทำเกมทายเลขของตัวเอง" (highlight "เกมทายเลข" in pink)
CHIPS: "if / else" | "while" | "จัดการข้อมูลผิด"
INFO: "ม.1–3 · 6 คาบ · เรียนออนไลน์ได้"
SCREEN: a laptop showing a number-guessing game scene: a door with a glowing keyhole, a
fork in the road and a circular loop path (arrows only, no text).
PROPS: floating question-mark shape, a key, loop arrows, dice.
CHILD: a smiling 14-year-old boy with a laptop, thumbs-up.
```

### C4
```
COURSE C4
TITLE: "โปรเจกต์ Python"
TAGLINE: "list ฟังก์ชัน และผลงานจบคอร์ส" (highlight "ผลงานจบคอร์ส" in pink)
CHIPS: "list" | "ฟังก์ชัน" | "โปรเจกต์ของฉัน"
INFO: "ม.2–3 · 8 คาบ · เรียนออนไลน์ได้"
SCREEN: a laptop showing a finished colorful mini-game or app made of abstract shapes
with a "completed" star badge (no text).
PROPS: floating gears, rows of jars, a trophy, a rolled blueprint.
CHILD: a smiling 14-year-old girl proudly presenting the laptop, thumbs-up.
```

---
## ตรวจก่อนโพสต์
- [ ] สะกดไทยถูกทุกตัว (ChatGPT พลาดได้) — ผิดให้สั่ง "fix only the Thai text …" หรือแก้ใน Canva
- [ ] โลโก้ตรงกับของจริง ไม่เพี้ยน (ถ้าเพี้ยน ให้ลบแล้ววางโลโก้จริงทับใน Canva)
- [ ] ไม่มีโลโก้/แมว Scratch งู Python ในภาพ
- [ ] "เรียนออนไลน์ได้" ใส่ได้ต่อเมื่อสถาบันเปิดสอนออนไลน์จริง (ตัดออกจาก INFO ถ้ายัง)
- [ ] ไม่มีข้อความ ราคา เบอร์ ที่เราไม่ได้ให้ · ช่องว่างข้างปุ่ม "สอบถามรายละเอียด" ใส่เบอร์/LINE ใน Canva
- [ ] ชุดทั้ง 10 ใบดูเป็นครอบครัวเดียวกัน · ย่อเหลือกว้าง 360px แล้วอ่านชื่อคอร์สได้
- [ ] สิทธิ์การใช้โลโก้/ชื่อแบรนด์: ผมไม่ทราบสถานะการอนุมัติจาก HQ (B3) เจ้าของยืนยันเอง

## หมายเหตุเรื่องโปสเตอร์รีวิวผู้ปกครองในตัวอย่าง (ไม่เกี่ยวกับชุดนี้ แต่ควรระวัง)
- ภาพแชทของผู้ปกครองที่เห็นชื่อ/รูปโปรไฟล์ ควรได้ความยินยอมจากเจ้าของแชทหรือปิดชื่อก่อนโพสต์ (PDPA)
- เด็กในภาพเป็นภาพ AI ที่ไม่ใช่เด็กจริงในสาขา — ถ้าเปลี่ยนเป็นรูปเด็กจริง ต้องขออนุญาตผู้ปกครองก่อน
