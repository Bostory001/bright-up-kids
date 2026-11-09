# Prompt ภาพโพสต์โซเชียล — Bright Up Kids สาขาวัดหลวงพ่อโต บางพลี

ภาพชุดนี้เป็น **Tier A (hero art — อนิเมะเซลเชดแฟนตาซี "สถาบันโคมไฟ")** ตาม [docs/CHARACTER_SHEET.md](../../docs/CHARACTER_SHEET.md)
ใช้กับ **เสาความรู้ · ปกคลิป · โพสต์วันสำคัญ · พื้นหลังใส่ข้อความ** เท่านั้น
🚫 **ห้ามใช้กับโพสต์ที่เคลมความจริง** (ห้องเรียน ครู ผลลัพธ์ รีวิว) — เสาพวกนั้นใช้รูปถ่ายจริง ดูเหตุผลใน [IMAGE_GUIDE.md](IMAGE_GUIDE.md) ข้อ 1

## วิธีใช้

```bash
node scripts/build-prompts.mjs --src=marketing/social/PROMPTS.md --list
node scripts/build-prompts.mjs --src=marketing/social/PROMPTS.md
```

ได้ไฟล์ `.txt` ทีละใบใน `marketing/social/ready/` + `ORDER.md` บอกลำดับ
**แก้ prompt ที่ไฟล์นี้ที่เดียว** แล้วรันใหม่ · `ready/` ถูกเขียนทับทุกครั้ง อย่าแก้ในนั้น

## กฎ 4 ข้อ ที่ต้องทำตามตอนสั่งภาพ

1. **ใบที่มีตัวละคร ต้องแนบ character sheet เป็น image reference ทุกครั้ง** — ไฟล์อยู่ที่ `marketing/video/characters/*.png`
   (`kru-kao` `dr-pui` `kru-mind` `kru-jan` `kru-ann`) · **ห้ามสร้างตัวละครจากข้อความใหม่** ไม่งั้นหน้าไม่เหมือนกันทุกโพสต์
2. **ทำในแชทเดียวกันทั้งชุด** ใบที่ 2 เป็นต้นไปขึ้นต้นด้วยบรรทัดที่ `ORDER.md` บอกไว้
3. **ภาพทุกใบต้องไม่มีตัวหนังสือ** — ตัวหนังสือไทยใส่ทีหลังใน Canva (IMAGE_GUIDE ข้อ 5) · ถ้าเครื่องมือเขียนตัวอักษรลงในภาพ ให้สั่งใหม่
4. **ทุกใบต้องมีพื้นที่ว่างสำหรับวางข้อความ** — prompt กำหนดไว้แล้วในบล็อก `[LAYOUT]` อย่าตัดออก

---

## 🧩 บล็อกที่ใส่ให้ทุก prompt อัตโนมัติ

### [STYLE]
```
STYLE: modern anime cel-shaded fantasy illustration, clean confident linework
with colored outlines, two-tone cel shading plus a SECOND light source coming
from glowing magic and lantern light, warm luminous palette, Thai-fantasy
setting (kanok flame motifs, woven textiles, Lanna paper lanterns, floating
temple-tower architecture with soft pastel sky), magic rendered as light
ribbons, sparkles and translucent floating shapes — never dark smoke, never
purple-black, high detail on face and costume, studio character-design quality
```

### [LAYOUT]
```
LAYOUT: single social-media poster, 4:5 vertical canvas. The subject sits in
the LOWER 55% of the frame, off-center. The UPPER 45% is a calm, almost empty
area of soft sky, lantern bokeh and gentle gradient — deliberately left clear
so Thai headline text can be placed there afterwards. Keep that upper area
free of faces, props and busy detail. Generous margins on all four sides, no
border, no frame, nothing cropped at the canvas edge.
```

### [SQUARE]
```
LAYOUT: one 1:1 square card for a carousel album. A single simple focal
subject centered in the LEFT or BOTTOM portion, occupying at most 45% of the
canvas. The remaining area is one broad flat zone of soft warm color with very
little detail, deliberately left clear for Thai text to be added afterwards.
Every card in this set uses the SAME framing, the SAME subject scale and the
SAME background treatment. No border, no frame.
```

### [VERTICAL]
```
LAYOUT: vertical 9:16 video cover. The character stands in the BOTTOM-LEFT
third, full body or three-quarter body, facing the viewer. The upper-right two
thirds is open sky with floating lanterns and soft light, kept clear so a
large Thai headline can be placed there afterwards. Nothing important in the
top 15% or bottom 20% of the canvas — those strips get covered by app UI.
```

### [NEGATIVE]
```
DO NOT INCLUDE: any text, letters, words, numbers, runes, labels, captions or
written symbols of any kind, not even on clothing, boards, books, banners or
packaging; logos, watermarks, signatures, speech bubbles; photorealism, 3d
render, clay render; dark or sinister magic, black smoke, purple-black glow,
horror, villains, combat; swords, knives, guns, bows or any weapon; sexualized
clothing, skirts above mid-thigh, bare midriff, makeup-heavy faces; adult
proportions on children; extra fingers, deformed hands; cluttered background;
copyrighted wizarding-school uniforms, house crests, sorting hats, or branded
mascots; real-looking classroom photography.
```

---

# 1. ปกโพสต์ความรู้วันจันทร์ (Monday knowledge cover)

<!-- slug-prefix: post- -->

ใช้เป็น **ใบแรกของอัลบั้มวันจันทร์** — ใบที่ตัดสินว่าพ่อแม่หยุดดูหรือเลื่อนผ่าน
ข้อความพาดหัวใส่ทีหลังในพื้นที่ว่างด้านบน

```
A warm single-character poster of {TEACHER}, shown from the knees up, turned
slightly toward the viewer with a calm, reassuring expression — the look of
someone about to explain something patiently, not someone selling anything.

SCENE: {SCENE}

LIGHT: the teacher's {LANTERN} lantern is the dominant light source, casting
warm colored light across their hands and face, with a few smaller lanterns
drifting out of focus behind them.

[STYLE]

[LAYOUT]

[NEGATIVE]
```

| id | ครู | {TEACHER} | {SCENE} | {LANTERN} |
|---|---|---|---|---|
| `cover-math` | ครูเก้า | ครูเก้า | standing beside a floating slate panel of glowing translucent geometric shapes he has just drawn in the air with his glowing ruler-staff | deep blue |
| `cover-thai` | ครูจัน | ครูจัน | seated on a woven floor cushion on an open temple-tower terrace, her woven fan raised, pink light ribbons curling out of it into the shapes of a bird and a mountain | warm pink-red |
| `cover-english` | ครูมายด์ | ครูมายด์ | standing on a lantern-lit tower balcony at dusk, a translucent map of drifting continents floating beside her, her small blue-and-orange parrot on her shoulder | burnt orange |
| `cover-science` | ดร.ภู | ดร.ภู | leaning over a low stone workbench where a beaker of glowing green vapour rises into slow floating crystals, safety goggles pushed up on his forehead | luminous green |
| `cover-general` | ครูแอน | ครูแอน | crouching to a child's eye level on a lantern-strewn stairway, holding out the large colorless unlit lantern with both hands toward the viewer | mustard yellow |

---

# 2. การ์ดในอัลบั้มความรู้ (album body card)

<!-- slug-prefix: card- -->

ใช้เป็น **ใบที่ 2-5 ของอัลบั้มวันจันทร์** (ใบละ 1 ข้อ) · ไม่มีตัวละคร — เรียบ ๆ ให้ตัวหนังสืออ่านง่าย
ทั้ง 4 ใบต้องดูเป็นชุดเดียวกัน จึงต้องสั่งต่อกันในแชทเดียว

```
A quiet, almost empty illustrated card for a parenting-tips carousel. No
people, no characters, no faces.

SUBJECT: {OBJECT}, rendered simply and warmly, as a single small focal object.

BACKGROUND: one broad flat wash of {TINT}, with two or three small out-of-focus
paper lanterns floating far in the background and nothing else.

[STYLE]

[SQUARE]

[NEGATIVE]
```

| id | ใช้กับ | {OBJECT} | {TINT} |
|---|---|---|---|
| `tip-notebook` | ข้อที่พูดถึงการบ้าน/สมุด | an open school notebook and a pencil resting on it, seen from slightly above | soft cream |
| `tip-lantern-unlit` | ข้อที่พูดถึงเด็กที่ยังไม่เข้าใจ | a single small paper lantern that is not lit yet, sitting on a wooden floor | pale blue-grey |
| `tip-lantern-lit` | ข้อที่เป็นทางแก้/ผลลัพธ์ | a single small paper lantern glowing warmly, lifting just off the ground | warm pale gold |
| `tip-steps` | ข้อที่พูดถึงการแบ่งเป็นขั้น | three glowing translucent stepping stones rising gently from left to right | light mint green |

---

# 3. ปกคลิปสอน (lesson clip cover)

<!-- slug-prefix: -->

ใช้เป็น **ภาพปกของคลิป V2** (ครูสอน 1 ข้อ) · วางพาดหัวคำถามในพื้นที่ว่างมุมขวา

```
A vertical video-cover illustration of {TEACHER}, three-quarter body in the
bottom-left, looking straight at the viewer with an inviting half-smile and
one hand raised as if about to point at something just off-frame — the moment
right before explaining.

MOOD: {MOOD}

LIGHT: strong warm rim light from the {LANTERN} lantern at their waist.

[STYLE]

[VERTICAL]

[NEGATIVE]
```

| id | ครู | {TEACHER} | {MOOD} | {LANTERN} |
|---|---|---|---|---|
| `clip-math` | ครูเก้า | ครูเก้า | patient and precise, glowing blue geometric shapes turning slowly around him | deep blue |
| `clip-thai` | ครูจัน | ครูจัน | gentle and unhurried, soft pink light ribbons drifting from her fan | warm pink-red |
| `clip-english` | ครูมายด์ | ครูมายด์ | cool and confident, a faint orange light trail from her quill-staff hanging in the air | burnt orange |
| `clip-science` | ดร.ภู | ดร.ภู | quietly curious, small glowing green crystals suspended around his hands | luminous green |

---

# 4. ภาพโพสต์วันสำคัญ (occasion art)

<!-- slug-prefix: day- -->

ใช้กับโพสต์อารมณ์ที่ไม่ขายของ — วันพ่อ วันแม่ ปีใหม่ วันเด็ก และโพสต์ซีซั่นสอบเข้า ม.1

```
A warm emotional illustration for a family-audience social post.

SCENE: {SCENE}

MOOD: {MOOD} — tender and hopeful, never sad, never dramatic. No logos and
nothing that looks like an advertisement.

[STYLE]

[LAYOUT]

[NEGATIVE]
```

| id | โอกาส | {SCENE} | {MOOD} |
|---|---|---|---|
| `fathers-day` | วันพ่อ 5 ธ.ค. | a Thai father sitting on the floor beside his primary-school child at a low table, not teaching, just present — his hand resting on the table while the child writes, one shared lantern glowing between them | quiet companionship |
| `mothers-day` | วันแม่ 12 ส.ค. | a Thai mother kneeling to adjust her child's school bag at a doorway at dawn, a small lantern clipped to the bag beginning to glow | everyday devotion |
| `new-year` | ปีใหม่ | many small paper lanterns rising together into a pastel dawn sky above floating temple towers, a few still unlit among them | fresh beginnings |
| `exam-season` | ซีซั่นสอบเข้า ม.1 | an older primary-school child standing at the foot of a long lantern-lit stairway that climbs into soft clouds, their own lantern lit and held up, looking upward with determination | ready, not afraid |

---

# 5. พื้นหลังเปล่าใส่ข้อความ (empty text plate)

<!-- slug-prefix: -->

ใช้กับโพสต์ที่ **ตัวหนังสือคือเนื้อหาทั้งหมด** — ตารางรอบเรียน ที่ว่าง ชวนทดลองเรียน ประกาศรับสมัครครู
ไม่มีตัวละคร ไม่มีของ มีแต่พื้นหลังสวย ๆ ให้วางข้อความได้สบาย

```
An almost empty decorative background plate for a social post where Thai text
will be the main content. No people, no characters, no objects, no focal
subject at all.

COMPOSITION: one broad calm field of {TINT}, with a soft gradient and a loose
cluster of out-of-focus glowing paper lanterns pushed to the {EDGE} edge only.
Delicate kanok flame motifs rendered as faint low-contrast line work along
that same edge. The entire central and opposite area stays flat, quiet and
uncluttered — it must remain fully usable as a text area.

[STYLE]

[LAYOUT]

[NEGATIVE]
```

| id | ใช้กับโพสต์ | {TINT} | {EDGE} |
|---|---|---|---|
| `plate-blue` | โพสต์วิชาคณิต | deep blue deepening to midnight at one corner | bottom-right |
| `plate-green` | โพสต์วิชาวิทยาศาสตร์ | deep teal-green with soft mint highlights | bottom-left |
| `plate-orange` | โพสต์วิชาอังกฤษ | burnt orange fading to warm sand | top-right |
| `plate-pink` | โพสต์วิชาภาษาไทย | warm rose-red fading to blush | bottom-right |
| `plate-yellow` | โพสต์ชวนทดลองเรียน / รับสมัครครู | warm mustard gold fading to cream | bottom-left |
