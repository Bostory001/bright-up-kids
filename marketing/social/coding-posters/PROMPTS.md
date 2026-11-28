# Prompt โปสเตอร์คอร์ส Coding (10 คอร์ส) — สั่งผ่าน ChatGPT (สร้างภาพ)

วิธีใช้ใน 3 ขั้น:
1. เปิดแชทใหม่ใน ChatGPT → วาง **MASTER PROMPT** (ด้านล่าง) 1 ครั้ง
2. ทีละคอร์ส: วางบล็อก `COURSE` ของคอร์สนั้น → ได้ 1 โปสเตอร์ (ถ้าไม่ถูกใจพิมพ์ "regenerate, same rules, change only: …")
3. นำภาพไปใส่ตัวหนังสือ/โลโก้ทีหลังด้วย Canva หรือเครื่องมือออกแบบ (ข้อความไทยตามตาราง "ข้อความที่ใส่ทีหลัง" ท้ายไฟล์)

> สถานะ: ยังไม่ได้ลองรัน prompt กับ ChatGPT จริง — ผลภาพอาจต้องปรับถ้อยคำ
> ตามกฎของโปรเจกต์ ([illustration-prompting](../../../.claude/skills/illustration-prompting/SKILL.md), [CHARACTER_SHEET](../../../docs/CHARACTER_SHEET.md)): **ไม่มีตัวอักษรในภาพ · ไม่มีโลโก้/ชื่อ Bright Up Kids จนกว่า HQ อนุมัติ (B3) · ไม่ใช้ตัวละครประจำจนกว่าจะมี character sheet** — ชุดนี้จึงเป็นภาพ "ฉาก + ของ" ล้วน

---

## MASTER PROMPT (วางครั้งเดียวต้นแชท)

```
You are creating a series of 10 matching course posters for a kids' coding school
(ages 6-15). I will send one COURSE block at a time. For every poster, ALWAYS apply
these rules:

STYLE
Modern anime cel-shaded fantasy illustration, clean colored linework (outlines darker
than the fill, never pure black), two-tone cel shading plus a second warm light source
from glowing lanterns and magic. Warm luminous palette. Thai-fantasy world: floating
temple-tower architecture with kanok (Thai flame pattern) motifs, woven textiles,
Lanna paper lanterns drifting in the air. Magic is shown only as ribbons of light,
sparkles and translucent floating shapes. Every poster in the series shares:
a pastel sky, floating lanterns, and ONE signature teal (#14B8A6) glow as the
"coding color". Friendly, safe, cheerful, premium, not cluttered.

LAYOUT
Portrait 2:3 (1024x1536). Keep all important content inside the central 4:5 area so
it can be cropped to 1080x1350. Leave the TOP 28% as calm, low-detail sky (a title
will be added later). Hero scene in the middle and lower-middle. Leave the BOTTOM
18% calm and uncluttered, and keep the bottom-right corner completely empty (a logo
will be added later). One clear focal point, strong silhouette readable at thumbnail size.

HARD RULES
- Absolutely NO text, letters, numbers, code, labels, logos, watermarks or signatures
  anywhere in the image, not even decorative or "magic" writing. Screens, signs,
  books, scrolls and boards must be blank or show only abstract shapes.
- No characters from existing franchises, no copied mascots (no orange cat mascot,
  no snake logo, no triangle robot mascot). No real brands.
- No weapons, no dark or scary mood, no black or purple-black smoke.
- No human faces of real-looking individual children; if a child appears it must be a
  generic stylized anime child seen from behind or in soft silhouette. Prefer NO
  people at all unless the COURSE block asks for one.
- Child-safe, inclusive, cheerful.

NEGATIVE (never include)
text, letters, numbers, watermark, logo, signature, realistic photo, dark mood, scary,
violence, gore, cluttered background, 3d render, extra limbs, deformed hands,
adult content, code on screens

After each image, reply with one line: the course code and "ok". Do not add text to
the image. Wait for the next COURSE block.
```

---

## COURSE blocks (วางทีละบล็อก)

### A1 · หุ่นยนต์หาดาว (ป.1–2) — โทนอุ่น เรียบง่ายสุด
```
COURSE A1. Audience: ages 6-8. Mood: playful, very simple, warm, big shapes.
Hero scene: a small round, friendly, rounded-square-bodied robot (soft round head, big
glowing teal eyes, tiny antenna with a lantern bulb, NOT triangular) standing on a
floating path of glowing 5x5 square stone tiles that stretches across a pastel sky.
Some tiles are raised blocks (walls), a few tiles show simple glowing arrow symbols
(only arrow shapes, no letters). At the far corner of the path a large golden star
floats and glows. Lanterns drift around. The robot looks toward the star, one foot
lifted mid-step. Accent color: warm amber and sunny yellow with teal glow on the robot.
Composition: path leads the eye diagonally from lower-left to the star at upper-right.
```

### A2 · ScratchJr เล่าเรื่องของฉัน (ป.1–2)
```
COURSE A2. Audience: ages 6-8. Mood: storybook, imaginative, cozy.
Hero scene: a giant open storybook floating in the sky, its blank pages releasing
three tiny glowing diorama scenes that rise like pop-ups: a green forest hill, a small
Thai-style castle, and a blue sea with a little boat. Ribbons of teal light connect
the three scenes in order like a story path. A blank tablet with a softly glowing
screen leans against the book. Lanterns and stars around. Accent: soft pink and
sky blue with teal light ribbons. No characters, no text on the book pages.
```

### B1 · Scratch แอนิเมชันแรกของฉัน (ป.3–6)
```
COURSE B1. Audience: ages 8-12. Mood: energetic, colorful, creative.
Hero scene: a floating filmstrip made of 5 glowing frames curving through the sky,
showing the same round little fish (generic cartoon fish, not a brand mascot) swimming
upward across the frames in slightly different poses, like a flipbook animation.
Below, a chain of colorful rounded snap-together puzzle blocks (blue, orange, green,
purple; blank, no icons) leads into the first frame. Paper lanterns and bubbles drift
around. Accent: bright aqua, orange and lime with teal glow.
```

### B2 · Scratch วาดรูปด้วยโค้ด (ป.4–6)
```
COURSE B2. Audience: ages 9-12. Mood: magical geometry, wonder.
Hero scene: a glowing teal light-pen floating in mid-air drawing a large, perfect
spirograph flower made of overlapping glowing squares rotated in a ring, next to a
five-pointed star and a hexagon drawn in light lines. Small brass drafting tools
(compass and protractor, with no numbers or markings) hover nearby. Deep twilight
blue sky with warm lanterns. Accent: indigo, gold, magenta light lines with teal glow.
```

### B3 · Scratch เกมแรกของฉัน (ป.4–6)
```
COURSE B3. Audience: ages 9-12. Mood: fun arcade, rewarding.
Hero scene: glowing red apples falling from the top of the sky toward a woven Thai
bamboo basket held up on a small floating platform; one apple is just being caught
with a sparkle burst. Beside the basket, a column of three glowing heart-shaped
lights and a floating glowing orb (a score orb, with no digits). Lanterns and star
sparkles. Accent: apple red, leaf green, sunny yellow with teal glow.
```

### B4 · Scratch โปรเจกต์ใหญ่ (ป.5–6)
```
COURSE B4. Audience: ages 10-12. Mood: ambitious, "I built this myself".
Hero scene: three floating game-world islands at different heights, each a different
miniature level (a grassy meadow, a rocky mountain, a night sky with stars), joined by
glowing teal light bridges. In the center, a glowing arched gate between worlds. A few
rounded colorful puzzle blocks and small gears float around the bridges like
construction parts. A glowing flag on the top island. Accent: sunrise orange, violet,
mint with teal glow.
```

### C1 · Python เริ่มต้น (ม.1–3)
```
COURSE C1. Audience: ages 12-15. Mood: cool, calm, a bit more mature, still friendly.
Hero scene: an open laptop glowing softly at the center of a wooden desk at dusk
(screen shows only an abstract soft teal glow, no text or code). Above it float three
glass jars, each holding a different glowing thing: a number-like light orb, a tiny
star, and a miniature lantern, like labeled variables but with NO labels. Thin teal
light threads connect the jars to the laptop. A tall window shows a Thai-fantasy
floating tower at sunset. Accent: deep teal, amber, navy.
```

### C2 · Python วาดรูปด้วย turtle (ม.1–3)
```
COURSE C2. Audience: ages 12-15. Mood: elegant, generative art.
Hero scene: a cute small generic sea turtle with a paper lantern glowing on its shell,
walking across a dark-navy starry night canvas and leaving behind glowing trails that
form a large symmetrical pattern: nested polygons, a spiral and a star in rainbow-colored
light lines, curving back toward the viewer. A few floating lanterns. Accent:
rainbow light lines on navy, teal glow on the turtle's shell lantern.
```

### C3 · Python ตัดสินใจและวนซ้ำ (ม.1–3)
```
COURSE C3. Audience: ages 12-15. Mood: puzzle-adventure.
Hero scene: a glowing path that forks at a crossroads with a blank wooden signpost
(arrows only, no words) pointing left and right; the left path leads up to a door
with a keyhole of light, the right path curls into a circular looping track on which a
small lantern-cart travels around repeatedly, leaving a ring of light trails. A
floating glowing question-mark-shaped light (shape only, no real letters) hovers
above the crossroads. Twilight sky with lanterns. Accent: teal, gold, soft purple.
```

### C4 · Python list ฟังก์ชัน โปรเจกต์ (ม.2–3)
```
COURSE C4. Audience: ages 13-15. Mood: workshop, craftsmanship, finished product.
Hero scene: a magical workshop shelf with neat rows of glowing lantern-jars arranged like a
list; in the center, interlocking brass gears assembling into a small glowing machine
labeled by nothing (no text); at the right a rolled blueprint scroll with abstract
blank diagrams, and a finished little glowing game console on a podium radiating teal
light as the final product. Warm workshop lighting and floating lanterns. Accent: warm
brass, deep teal, cream.
```

---

## ข้อความที่ใส่ทีหลัง (Canva) — ห้ามให้ AI วาดตัวหนังสือ

| คอร์ส | หัวข้อ | คำโปรย | บรรทัดข้อมูล |
|---|---|---|---|
| A1 | หุ่นยนต์หาดาว | สั่งหุ่นยนต์ด้วยลูกศร เรียนคิดเป็นขั้นตอนแบบเล่นเกม | ป.1–2 · 8 คาบ · มีเกมให้เล่นต่อที่บ้าน |
| A2 | เล่าเรื่องของฉัน | สร้างนิทานเคลื่อนไหวด้วย ScratchJr | ป.1–2 · 6 คาบ |
| B1 | แอนิเมชันแรกของฉัน | ทำการ์ดอวยพรเคลื่อนไหวด้วย Scratch | ป.3–6 · 6 คาบ · เรียนออนไลน์ได้ |
| B2 | วาดรูปด้วยโค้ด | วาดดาว ดอกไม้ ลายสวยด้วยคำสั่ง | ป.4–6 · 6 คาบ · เรียนออนไลน์ได้ |
| B3 | เกมแรกของฉัน | สร้างเกมเก็บของที่มีคะแนนและชีวิต | ป.4–6 · 8 คาบ · เรียนออนไลน์ได้ |
| B4 | โปรเจกต์เกมใหญ่ | ออกแบบเกมหลายฉากด้วยฟังก์ชัน | ป.5–6 · 8 คาบ · เรียนออนไลน์ได้ |
| C1 | Python เริ่มต้น | เขียนโปรแกรมแรกของคุณ | ม.1–3 · 6 คาบ · เรียนออนไลน์ได้ |
| C2 | วาดรูปด้วย Python | สร้างลายเรขาคณิตด้วย turtle | ม.1–3 · 6 คาบ · เรียนออนไลน์ได้ |
| C3 | ตัดสินใจและวนซ้ำ | ทำเกมทายเลขของตัวเอง | ม.1–3 · 6 คาบ · เรียนออนไลน์ได้ |
| C4 | โปรเจกต์ Python | list ฟังก์ชัน และผลงานจบคอร์ส | ม.2–3 · 8 คาบ · เรียนออนไลน์ได้ |

- **ยังไม่ใส่:** ราคา วันเวลาเปิดคอร์ส เบอร์ติดต่อ โลโก้ Bright Up Kids (รอเจ้าของตัดสินใจ/HQ อนุมัติ)
- ชื่อ Scratch / ScratchJr / Python ในข้อความ: ใช้เป็นชื่อเครื่องมือได้ แต่ **อย่าใช้โลโก้หรือแมว Scratch** — ตรวจเงื่อนไขของ Scratch ก่อนโฆษณาเชิงพาณิชย์ (ยังไม่เคลียร์ ดู [TOOLS.md](../../../docs/coding/TOOLS.md))
- เสนอให้ A2 ใส่ "ผู้ปกครองช่วยได้" และ A1 ใส่ "ผู้ปกครองนั่งด้วยตอนเรียนออนไลน์"

## ตรวจก่อนใช้ (ทุกใบ)
- [ ] ไม่มีตัวอักษร/ตัวเลข/โค้ดในภาพ (รวมบนจอ หน้าหนังสือ ป้าย)
- [ ] ไม่มีตัวละครหรือมาสคอตที่คล้ายของเจ้าอื่น (แมว Scratch, งู Python, หุ่นยนต์สามเหลี่ยม)
- [ ] เหลือที่ว่างด้านบน 28% และมุมขวาล่างว่าง
- [ ] อ่านออกเมื่อย่อเหลือกว้าง 360px
- [ ] ชุดทั้ง 10 ใบดูเป็นชุดเดียวกัน (ท้องฟ้า โคม แสงสีเขียวน้ำเงิน teal)
- [ ] ส่ง `content-reviewer` ก่อนเผยแพร่

## ถ้าอยากใส่ตัวละครประจำ (ภายหลัง)
ต้องสร้าง character sheet ก่อน ([PROMPTS.md ตัวละคร](../../video/characters/PROMPTS.md)) แล้วแนบ sheet เป็นภาพอ้างอิงทุกครั้ง ห้ามสร้างตัวละครจากข้อความล้วน · คอร์ส Coding ยังไม่มีครูประจำ/สีโคมของตัวเอง (ในตัวละครมี 4 วิชา: คณิต ไทย อังกฤษ วิทย์) ต้องให้เจ้าของตัดสินใจ
