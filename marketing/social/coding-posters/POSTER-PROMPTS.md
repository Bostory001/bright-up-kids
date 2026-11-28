# Prompt โปสเตอร์คอร์ส Coding — แบบ "โปสเตอร์เต็มใบ มีตัวหนังสือในภาพ" (v2)

> v1 ([PROMPTS.md](PROMPTS.md)) สั่งห้ามตัวหนังสือ → ได้แค่ภาพประกอบ ไม่ใช่โปสเตอร์ · ไฟล์นี้แก้แล้ว
> ⚠️ ChatGPT สะกดภาษาไทยผิดได้ ข้อความจึงสั้นและใหญ่ที่สุด **ตรวจสะกดทุกใบก่อนโพสต์** ถ้าผิดให้พิมพ์ว่า "fix only the Thai text, keep everything else identical: …" หรือเอาภาพไปแก้ข้อความใน Canva
> ยังไม่ได้ลองรัน v2 กับ ChatGPT จริง

## วิธีใช้
1. เปิดแชทใหม่ → วาง **MASTER v2** 1 ครั้ง
2. วางบล็อกคอร์สทีละคอร์ส (1 บล็อก = 1 โปสเตอร์)
3. ไม่ถูกใจ: "regenerate, same layout, change only: …"

---
## MASTER v2 (วางครั้งเดียว)

```
You are designing a series of 10 matching ADVERTISING POSTERS for a kids' coding
school in Thailand. Each poster announces one course and will be posted on Facebook
and printed. I will send one COURSE block at a time.

FORMAT
Vertical portrait poster, 2:3 (1024x1536). It must look like a finished graphic-design
poster, not a plain illustration. Keep all key content inside the central 4:5 area.

STYLE (very important)
Flat 2D anime-style illustration with clean outlines and cel shading. NOT 3D render,
NOT Pixar-like, NOT photorealistic. Warm Thai-fantasy mood: pastel sky, floating Thai
paper lanterns, glowing teal (#14B8A6) light as the shared "coding color", soft
sunset gradient background. Cheerful, premium, parent-trustworthy.

LAYOUT (same in every poster)
1. TOP 25%: the course TITLE in huge, bold, rounded Thai font, dark navy with a white
   outline for contrast, centered. Under it, the TAGLINE in a smaller font on a soft
   rounded ribbon.
2. MIDDLE 45%: the hero illustration described in the COURSE block.
3. BELOW the illustration: THREE rounded "skill chips" in a row, each with a simple
   icon and the short text from the COURSE block.
4. BOTTOM 18%: a wide rounded info strip with the INFO text, and under it a smaller
   rounded button-shaped box with the text "สอบถามรายละเอียด" on its left half and an
   EMPTY white rounded rectangle on its right half (contact details will be added later).
5. Keep the bottom-right corner empty and clean (a logo will be added later).

TEXT RULES
- Render the Thai text EXACTLY as I give it inside quotes. Copy every character and
  tone mark precisely. Do not translate, rephrase, add, or invent ANY other text,
  numbers, prices, phone numbers, logos or URLs.
- Use large, high-contrast, very legible type. Thai text must be readable at phone size.
- Latin words (Python, Scratch, if, while, list) stay in English exactly as given.

HARD RULES
- No copyrighted characters or mascots (no orange cat mascot, no snake logo, no
  triangle robot). No weapons, nothing scary or dark. No real-looking children's faces;
  prefer no people.
- Do not show the Scratch, ScratchJr or Python logos.

After each image, reply with the course code and "ok" only.
```

---
## บล็อกคอร์ส (วางทีละอัน)

### A1
```
COURSE A1
TITLE: "หุ่นยนต์หาดาว"
TAGLINE: "เรียนคิดเป็นขั้นตอนผ่านเกม"
CHIPS: "สั่งงานเป็นลำดับ" | "ล่าบั๊ก" | "สร้างเขาวงกต"
INFO: "ป.1–2 · 8 คาบ"
HERO: a small round friendly robot (soft round head, big glowing teal eyes, tiny
lantern antenna, not triangular) stepping along a floating path of glowing square
tiles with arrow symbols, toward a big golden star at the far end. Raised stone
blocks as walls. Floating lanterns. Warm amber and sunny yellow palette.
```

### A2
```
COURSE A2
TITLE: "เล่าเรื่องของฉัน"
TAGLINE: "สร้างนิทานเคลื่อนไหวด้วย ScratchJr"
CHIPS: "ตัวละครขยับได้" | "ใส่เสียงพูด" | "เล่าเรื่อง 3 ฉาก"
INFO: "ป.1–2 · 6 คาบ"
HERO: a giant open storybook floating in the sky releasing three tiny glowing
pop-up scenes (a green forest hill, a small Thai-style castle, a blue sea with a
boat) joined by ribbons of teal light; a tablet leaning against the book. Soft pink
and sky blue palette.
```

### B1
```
COURSE B1
TITLE: "แอนิเมชันแรกของฉัน"
TAGLINE: "ทำการ์ดอวยพรเคลื่อนไหวด้วย Scratch"
CHIPS: "ตัวละครเคลื่อนไหว" | "ใส่เสียง" | "เปลี่ยนฉาก"
INFO: "ป.3–6 · 6 คาบ · เรียนออนไลน์ได้"
HERO: a curved floating filmstrip of 5 glowing frames showing a round cartoon fish
swimming upward in slightly different poses, with a chain of colorful rounded
snap-together puzzle blocks (blank, no icons) leading into it. Aqua, orange, lime.
```

### B2
```
COURSE B2
TITLE: "วาดรูปด้วยโค้ด"
TAGLINE: "วาดดาว ดอกไม้ ลายสวยด้วยคำสั่ง"
CHIPS: "รูปหลายเหลี่ยม" | "วนซ้ำ" | "ลายสไปโรกราฟ"
INFO: "ป.4–6 · 6 คาบ · เรียนออนไลน์ได้"
HERO: a glowing teal light-pen floating in mid-air drawing a big spirograph flower of
rotated glowing squares beside a five-pointed star and a hexagon in light lines;
a brass compass and protractor nearby (no numbers). Twilight indigo, gold, magenta.
```

### B3
```
COURSE B3
TITLE: "เกมแรกของฉัน"
TAGLINE: "สร้างเกมที่มีคะแนนและชีวิต"
CHIPS: "ตัวแปร" | "เงื่อนไข" | "เกมเล่นได้จริง"
INFO: "ป.4–6 · 8 คาบ · เรียนออนไลน์ได้"
HERO: glowing red apples falling toward a woven Thai bamboo basket on a floating
platform, one apple caught with a sparkle burst, three glowing heart lights and a
glowing score orb (no digits) beside it. Apple red, leaf green, sunny yellow.
```

### B4
```
COURSE B4
TITLE: "โปรเจกต์เกมใหญ่"
TAGLINE: "ออกแบบเกมหลายฉากด้วยตัวเอง"
CHIPS: "เมนูและฉาก" | "ฟังก์ชัน" | "ทดสอบและแก้บั๊ก"
INFO: "ป.5–6 · 8 คาบ · เรียนออนไลน์ได้"
HERO: three floating game-world islands (meadow, rocky mountain, starry night)
joined by glowing teal light bridges, a glowing arched gate in the center, small gears
and rounded puzzle blocks floating around. Sunrise orange, violet, mint.
```

### C1
```
COURSE C1
TITLE: "Python เริ่มต้น"
TAGLINE: "เขียนโปรแกรมแรกของคุณ"
CHIPS: "ตัวแปร" | "รับค่าและคำนวณ" | "แก้ error"
INFO: "ม.1–3 · 6 คาบ · เรียนออนไลน์ได้"
HERO: an open laptop glowing softly on a desk at dusk (screen shows only an abstract
teal glow, no code), three glass jars floating above it holding a glowing orb, a
tiny star and a miniature lantern, joined to the laptop by teal light threads.
Deep teal, amber, navy. Slightly more mature, cooler mood.
```

### C2
```
COURSE C2
TITLE: "วาดรูปด้วย Python"
TAGLINE: "สร้างลายเรขาคณิตด้วย turtle"
CHIPS: "ลูป for" | "หลายเหลี่ยมและดาว" | "เขียนฟังก์ชัน"
INFO: "ม.1–3 · 6 คาบ · เรียนออนไลน์ได้"
HERO: a cute small sea turtle with a glowing paper lantern on its shell walking across
a dark-navy starry canvas, leaving rainbow light trails that form nested polygons, a
spiral and a star. Navy with rainbow lines, teal glow.
```

### C3
```
COURSE C3
TITLE: "ตัดสินใจและวนซ้ำ"
TAGLINE: "ทำเกมทายเลขของตัวเอง"
CHIPS: "if / else" | "while" | "จัดการข้อมูลผิด"
INFO: "ม.1–3 · 6 คาบ · เรียนออนไลน์ได้"
HERO: a glowing path forking at a crossroads with a blank signpost (arrows only), the
left path leading to a door with a keyhole of light, the right path curling into a
circular looping track where a small lantern-cart circles, leaving a ring of light.
Twilight sky; teal, gold, soft purple.
```

### C4
```
COURSE C4
TITLE: "โปรเจกต์ Python"
TAGLINE: "list ฟังก์ชัน และผลงานจบคอร์ส"
CHIPS: "list" | "ฟังก์ชัน" | "โปรเจกต์ของฉัน"
INFO: "ม.2–3 · 8 คาบ · เรียนออนไลน์ได้"
HERO: a magical workshop shelf with rows of glowing lantern-jars, interlocking brass
gears assembling into a small glowing machine, a rolled blank blueprint scroll, and a
finished little glowing game console on a podium radiating teal light. Warm brass,
deep teal, cream.
```

---
## ก่อนโพสต์ (เช็กทุกใบ)
- [ ] สะกดไทยถูกทุกตัว (ชื่อคอร์ส คำโปรย ชิป แถบข้อมูล) — ตรวจโดยคนอ่านภาษาไทย
- [ ] ไม่มีข้อความ ราคา เบอร์ หรือโลโก้ที่เราไม่ได้ให้
- [ ] ไม่มีโลโก้/แมว Scratch หรืองู Python ในภาพ
- [ ] "เรียนออนไลน์ได้" — ใช้ได้ต่อเมื่อสถาบันตัดสินใจเปิดสอนออนไลน์จริง (ตัดออกจาก INFO ถ้ายัง)
- [ ] ย่อเหลือกว้าง 360px แล้วยังอ่านชื่อคอร์สได้
- [ ] ช่องว่างขวาของปุ่ม "สอบถามรายละเอียด" ใส่เบอร์/LINE ใน Canva
- [ ] โลโก้ Bright Up Kids ใส่ได้ต่อเมื่อ HQ อนุมัติ (B3)
