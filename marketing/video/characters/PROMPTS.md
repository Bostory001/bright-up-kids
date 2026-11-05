# Prompt สร้าง Character Sheet — Bright Up Kids (v2 แฟนตาซี)

สเปกตัวละครอยู่ที่ [docs/CHARACTER_SHEET.md](../../../docs/CHARACTER_SHEET.md) · ไฟล์นี้คือ **prompt อังกฤษพร้อมก๊อป**

## วิธีใช้

1. **เริ่มที่ครู 4 คน (ข้อ 1-4)** — ใช้ได้ทันทีกับปก/โพสต์/คลิปทุกวิชา
   แล้วค่อย เด็ก 4 คน (6-9) → มาสคอต (10-11) → ครูแอน (5)
2. ทำ **ในแชทเดียวกันทั้งหมด** · ตัวที่ 2 เป็นต้นไปขึ้นต้นด้วย
   `Use the image above as the style reference. Keep the exact same art style, line weight, shading and proportions.`
3. เซฟ `<ชื่อ>.png` + `<ชื่อ>.md` (prompt จริง · seed · เครื่องมือ)
4. หลังจากนี้ **ห้ามสร้างตัวละครจากข้อความอีก** — ใช้ sheet เป็น image reference เสมอ

⚠️ ถ้าเครื่องมือเขียนตัวอักษรลงในภาพ (แม้เป็น "อักษรเวท") ให้สั่งใหม่

### ทางลัด: ให้สคริปต์แตกเป็นไฟล์พร้อมก๊อป

`scripts/build-prompts.mjs` **ไม่สร้างภาพ ไม่เรียก API ไม่ต้องใช้คีย์** — หน้าที่เดียวคือ
ประกอบบล็อก `[STYLE] [LAYOUT] [NEGATIVE]` และเติมตาราง `{TOKEN}` ให้ครบ
แล้วเขียนเป็นไฟล์ `.txt` ทีละใบใน `ready/` เอาไปวางใน Codex/GPT ได้เลย

```bash
node scripts/build-prompts.mjs
```

```bash
node scripts/build-prompts.mjs --list
```

- ได้ **26 ไฟล์** + `ready/ORDER.md` ที่บอกลำดับและบรรทัดที่ต้องวางนำสำหรับใบที่ 2 เป็นต้นไป
- แก้ prompt **ที่ไฟล์นี้ที่เดียว** แล้วรันใหม่ · `ready/` ถูกเขียนทับทุกครั้ง อย่าแก้ในนั้น
- ช่อง `{TOKEN}` ที่ยังไม่ได้เติม สคริปต์จะข้ามพร้อมเตือน

### สั่ง Codex ให้ไปคุยกับ GPT

เปิด Codex ที่โฟลเดอร์โปรเจกต์ แล้วสั่งประมาณนี้

```bash
codex "อ่าน marketing/video/characters/ready/ORDER.md แล้วทำตามลำดับในนั้น ทีละใบ: ก๊อปเนื้อไฟล์ .txt ไปสั่ง GPT สร้างภาพ ใบที่ 2 เป็นต้นไปให้แนบภาพใบก่อนหน้าเป็น reference และขึ้นต้นด้วยบรรทัด style reference ที่ ORDER.md บอกไว้ เซฟผลเป็น marketing/video/characters/<slug>.png หยุดให้ฉันดูหลังใบแรกก่อน"
```

**หยุดดูใบแรกก่อนเสมอ** — ถ้าสไตล์ใบแรกไม่ใช่ ใบที่เหลือจะผิดตามทั้งชุด

---

## 🧩 บล็อกที่ต้องใส่ทุก prompt

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
LAYOUT: character reference sheet on one canvas, 4:3 landscape.
Top row: full-body turnaround of the SAME character — front, 3/4, side, back —
all at identical height on a shared baseline.
Bottom row: four head-and-shoulders expressions — happy, surprised, thinking
(hand near chin), proud. Evenly spaced, plain light background, no text labels.
```

### [NEGATIVE]
```
DO NOT INCLUDE: any text, letters, numbers, runes or written symbols of any
kind; logos, watermarks, signatures, speech bubbles; photorealism, 3d render;
dark or sinister magic, black smoke, purple-black glow, horror, villains,
combat; swords, knives, guns, bows or any weapon; sexualized clothing, skirts
above mid-thigh, bare midriff, makeup-heavy faces; adult proportions on
children; extra fingers, deformed hands; cluttered background; copyrighted
wizarding-school uniforms, house crests, sorting hats, or branded mascots.
```

---

# 1. ครูเก้า (Kru Kao) — MATH · Geometry Mage · male ~30 ⭐ เริ่มที่ตัวนี้

```
Character reference sheet of a calm, precise male Thai geometry mage who
teaches mathematics. He explains everything step by step and never says a
problem is easy.

CHARACTER: tall and slim, neat black hair with a side part, thin rectangular
eyeglasses, composed face with a small confident smile.
OUTFIT: long deep-navy mage coat with silver kanok flame-motif embroidery
along the edges, inner lining showing a faintly glowing grid pattern, grey
slacks, simple boots. All plain — no emblem, no crest.
MAGIC ITEMS: he holds a glowing RULER-STAFF that leaves a trail of pale blue
light lines hanging in the air; three translucent glowing geometric solids
(triangle, circle, cube) float and rotate slowly around his shoulders; a
small deep-blue paper lantern hangs from his belt; faint glowing chalk dust
on his fingertips.
POSE NOTE: one pose drawing a dividing line in the air with the staff, one
pose with arms folded listening patiently.
ACCENT COLOR: deep blue.

[STYLE] [LAYOUT] [NEGATIVE]
```

# 2. ดร.ปุย (Dr. Pui) — SCIENCE · Alchemist · female ~40

```
Character reference sheet of an excitable female Thai alchemist who teaches
science. Loud, enthusiastic, her experiments fail in funny harmless ways.

CHARACTER: frizzy silver-grey curly hair escaping a loose tie with tiny
harmless sparks drifting around it, big round excited eyes, wide open smile,
sturdy friendly build, a smudge of soot on one cheek.
OUTFIT: short moss-green leather alchemist coat with rolled sleeves, a
leather chest strap holding a row of small glass potion vials, khaki cargo
trousers, leather work gloves, sturdy boots. All plain — no label, no text.
MAGIC ITEMS: brass-rimmed safety goggles pushed UP onto her forehead; she
holds a beaker giving off a soft glowing green vapour with sparkles rising
from it; a green paper lantern hangs at her hip.
POSE NOTE: one pose holding the beaker up to the light with sparkling eyes,
one pose with both arms thrown wide in amazement.
ACCENT COLOR: green.

[STYLE] [LAYOUT] [NEGATIVE]
```

# 3. ครูมายด์ (Kru Mind) — ENGLISH · Wayfarer · female ~26

```
Character reference sheet of a high-energy young female Thai wayfarer who
teaches English. She gets the whole class repeating after her and never lets
anyone stay silent.

CHARACTER: short brown bob with warm orange highlights, wide toothy smile,
petite but always in motion, very expressive hands.
OUTFIT: short burnt-orange traveller's cloak over a simple tunic, a long
trailing scarf caught in the wind, cropped trousers, short leather boots.
All plain — no logo, no slogan.
MAGIC ITEMS: orange crystal headphones worn around her neck that glow softly;
a translucent glowing MAP floating open beside her with NO writing on it,
only glowing routes and dots; a brass compass; an orange paper lantern at
her belt.
COMPANION: a small blue-and-orange parrot perched on her shoulder.
POSE NOTE: one pose with a raised hand cueing the class to repeat after her,
one pose mid-stride as if setting off.
ACCENT COLOR: orange.

[STYLE] [LAYOUT] [NEGATIVE]
```

# 4. ครูจัน (Kru Jan) — THAI · Storyweaver · female ~55

```
Character reference sheet of a gentle senior female Thai storyweaver who
teaches the Thai language. She is the calmest of the team and never raises
her voice.

CHARACTER: white hair in a low bun held by a carved wooden hairpin that has
tiny glowing flowers on it, kind smile with warm laugh lines, small round
eyeglasses hanging from a cord around her neck, graceful upright posture.
OUTFIT: cream cotton mandarin-collar blouse, a hand-woven Thai cloth in deep
rose-red draped over her LEFT shoulder that floats and ripples on its own
with faintly glowing kanok patterns, a plain patterned wrap skirt, sandals.
MAGIC ITEMS: a woven palm-leaf hand fan — where she fans, soft pink ribbons
of light curl out and form the SHAPES of animals, mountains and waves (never
letters, never symbols); a thick cloth-bound book; a rose-red paper lantern
at her waist.
POSE NOTE: one pose seated telling a story with one hand raised gently, one
pose offering the book forward with both hands.
ACCENT COLOR: rose red.

[STYLE] [LAYOUT] [NEGATIVE]
```

# 5. ครูแอน (Kru Ann) — LANTERNKEEPER · female ~28

```
Character reference sheet of a warm, approachable Thai lanternkeeper, about
28 years old. She teaches no single subject — her job is to light the lantern
of a child whose lantern has not lit yet.

CHARACTER: dark-brown long hair in a LOOSE low bun with strands falling beside
her cheeks, rounded-square brown eyeglasses, gentle smile, practical posture.
OUTFIT: white button-up shirt with sleeves rolled to the elbows, a short
mustard-yellow keeper's coat covered in many pockets holding spare lanterns,
oil flasks and matches, blue jeans, short boots. The coat is COMPLETELY PLAIN
— no logo, no text, no emblem.
MAGIC ITEMS: she carries the LARGEST lantern of all, and it is still
COLORLESS and unlit — it belongs to a child who has not found their path yet.
POSE NOTE: one pose crouching to a child's eye level offering the lantern
forward with both hands.
ACCENT COLOR: mustard yellow.

[STYLE] [LAYOUT] [NEGATIVE]
```

---

# 6-9. ผู้เรียนฝึกหัด 4 คน

ใช้โครงเดียวกัน เปลี่ยนเฉพาะ `CHARACTER / OUTFIT / LANTERN`

```
Character reference sheet of a {AGE}-year-old Thai apprentice student at a
floating Thai-fantasy lantern academy. Base clothing is a real Thai school
uniform with a short fantasy cloak over it.

CHARACTER: {CHARACTER}
OUTFIT: {OUTFIT}
LANTERN: a tiny {COLOR} paper lantern hanging from the belt or backpack,
glowing only DIMLY — the child is still learning.
{EXTRA}

[STYLE] [LAYOUT] [NEGATIVE]
```

| # | ตัว | {AGE} | {CHARACTER} | {OUTFIT} | {COLOR} | {EXTRA} |
|---|---|---|---|---|---|---|
| 6 | **ต้นกล้า** | 7 | shortest of the group, dark-brown bowl cut with straight fringe and ONE cowlick strand sticking straight up, big round amber eyes, chubby blushing cheeks | white tee under light-blue denim short overalls, tall white socks, white sneakers, short orange cloak, orange backpack | orange | a light-blue bandage plaster on his LEFT knee; a tiny real sapling growing out of the top of his backpack; one pose with a raised index finger asking a question |
| 7 | **โบ๊ท** | 9 | black hair spiked and fluffy at the front, thick eyebrows, wide open-mouth grin showing teeth | lime-green polo shirt, khaki shorts, red sneakers, short green cloak tied over ONE shoulder | green | a red fabric wristband on his LEFT wrist that glows softly; one pose giving an enthusiastic thumbs-up, one scratching his head while thinking |
| 8 | **มีมี่** | 10 | light-brown chin-length bob with straight fringe, calm bright eyes, tidy posture | white Peter-Pan-collar blouse, navy pleated knee-length skirt, white socks, black school shoes, light-blue short cloak | sky blue | a glowing yellow star hair clip above her RIGHT ear; the pencil behind her ear is a tiny wand with a sparkle at the tip; one pose hugging a notebook, one pose pointing forward explaining |
| 9 | **แพรว** | 12 | tallest of the children, black hair in a HIGH ponytail, confident almond eyes, upright athletic posture | white tee, navy pleated knee-length skirt, purple sneakers, light-purple hooded adventurer's cloak | purple | a purple wristwatch on her LEFT wrist and a CRYSTAL whistle on a cord; her lantern is the BRIGHTEST of the four children — because she works hardest, not because she is the most talented; one pose with arms crossed and a reassuring smile |

---

# 10. มะนาว (Manao) — cat mascot

```
Character reference sheet of a small mascot kitten at a Thai-fantasy lantern
academy.

CHARACTER: chubby orange tabby kitten with white chest, white paws and white
tail tip; big round green eyes with bright highlights; a softly GLOWING blue
circular mark on its forehead; simple enough to redraw at tiny size.
ITEM: a sky-blue scarf around its neck that floats and ripples on its own —
completely blank, no text, no pattern.
POSES: sitting front view, walking side view, back view, jumping with front
paws up; plus four expressions — happy, surprised, sleepy, proud.
Scale: about half the height of a 7-year-old child.

[STYLE] [NEGATIVE]
```

# 11. โกโก้ (Koko) — baby dragon

```
Character reference sheet of a friendly baby dragon at a Thai-fantasy lantern
academy.

CHARACTER: small round mint-green baby dragon with a cream belly, tiny wings
too small to fly well, a short stubby tail, soft rounded horn nubs, big round
golden eyes, and faintly GLOWING scales along its spine. NO fangs, NO fire —
it blows glowing soap bubbles instead. It looks like a plush toy.
POSES: standing front, 3/4, side, back; plus four expressions — happy,
surprised, curious, sleepy.
Scale: about the size of a house cat.

[STYLE] [NEGATIVE]
```

---

# 12. ภาพทีมครู 4 คน (ทำหลังได้ sheet ครบ — แนบทั้ง 4 ใบ)

ภาพหลักของเว็บ/ใบปลิว/ปกคลิป

```
Group illustration of the four teachers from the attached reference sheets,
standing together facing the viewer, in the SAME art style as the references.

ARRANGEMENT left to right: Kru Kao (deep blue, ruler-staff raised, geometric
solids orbiting him), Dr. Pui (green, beaker held up with glowing vapour),
Kru Mind (orange, parrot on her shoulder, floating map beside her), Kru Jan
(rose red, seated slightly forward on a low stool, fan raised with pink light
ribbons curling upward). Their four lanterns are the brightest points of the
image.

BACKGROUND: a floating Thai temple-tower academy at golden hour, kanok-carved
eaves and a tiered roof, dozens of paper lanterns drifting in the air, soft
pastel sky.

Keep every teacher's hair, outfit, accent color, lantern and signature item
exactly as in the reference sheets. Wide 16:9 composition with empty space at
the top for a headline added later in code.

[STYLE] [NEGATIVE]
```

# 13. แบนเนอร์แบ่งช่องสี (แบบที่เจ้าของชอบ)

```
Wide 16:9 banner divided into FIVE vertical panels separated by thin diagonal
light gaps. Each panel has a different deep flat background color and holds
ONE character from the attached reference sheets, waist-up, each in a
different lively pose, each lit by their own glowing lantern.

Panel order and colors:
1. Kru Kao — deep blue
2. Dr. Pui — green
3. Kru Mind — orange
4. Kru Jan — rose red
5. Kru Ann — mustard yellow

Characters must match their reference sheets exactly. Poster-like, no text
anywhere.

[STYLE] [NEGATIVE]
```

# 14. ปกรายวิชา (1:1 — แนบ sheet ของครูคนนั้น)

```
Single-character illustration of {CHARACTER} from the attached reference
sheet, waist-up, {POSE}, lit by their own {COLOR} lantern, on a deep flat
{COLOR} background with simple glowing {PROPS} floating around them. Square
1:1 composition with empty space in the bottom third for a headline added
later in code.

[STYLE] [NEGATIVE]
```

| วิชา | {CHARACTER} | {COLOR} | {PROPS} | {POSE} |
|---|---|---|---|---|
| คณิต | **ครูเก้า** | deep blue #2563EB | translucent geometric solids, abacus beads, light lines | drawing a glowing line in the air with his ruler-staff |
| ไทย | **ครูจัน** | rose red #E11D48 | pink light ribbons, woven cloth, fan, cloth-bound book | fanning gently so light ribbons curl upward |
| อังกฤษ | **ครูมายด์** | orange #F97316 | glowing globe, compass, floating blank map, parrot | waving with one hand raised, parrot on her shoulder |
| วิทย์ | **ดร.ปุย** | green #16A34A | beakers, glowing vapour, leaves, crystals | holding her beaker up with sparkling eyes |

อยากให้มีเด็กในปกด้วย → แนบ sheet ของเด็กเพิ่ม แล้วต่อท้าย prompt ว่า
`Add {ชื่อเด็ก} from the second reference sheet standing beside them, smaller, looking up.`
(คณิต→มีมี่ · ไทย→แพรว · อังกฤษ→โบ๊ท · วิทย์→ต้นกล้า)

🚫 props ห้ามมีตัวเลข/ตัวอักษรบนตัวมัน

---

# 15. ชิ้นส่วน avatar (R18 / H1)

avatar **ไม่ใช่ตัวละคร 11 ตัว** แต่เป็นเด็กกลาง ๆ ที่เด็กแต่งเอง

```
Flat vector game asset, single item, centered on a fully TRANSPARENT
background, 1:1 square canvas, thick clean outlines, bright flat colors,
minimal shading, designed to be layered with other pieces using the same
canvas center and scale.

ITEM: {ITEM}

[NEGATIVE]
```

| id | {ITEM} |
|---|---|
| `bg_sky` | pastel daytime sky with soft clouds and a few floating paper lanterns |
| `bg_space` | night sky with stars and distant floating lanterns |
| `bg_castle` | a floating Thai temple-tower academy with kanok-carved tiered roof |
| `outfit_uniform` | Thai school uniform top with a short neutral-colored cloak |
| `outfit_hero` | bright hero costume with a flowing cape, child-sized, fully covering |
| `outfit_knight` | silver-and-gold knight chest plate with kanok flame engraving |
| `hat_cap` | blue baseball cap, brim forward, hollow at the bottom so hair shows |
| `hat_crown` | small gold crown with three points and red gems |
| `hat_wizard` | purple pointed wizard hat with a glowing star, hollow at the bottom |
| `pet_cat` | **ใช้ sheet ของมะนาว** ท่านั่ง ตัวเล็ก |
| `pet_dragon` | **ใช้ sheet ของโกโก้** ท่านั่ง ตัวเล็ก |

⚠️ หมวกเว้นที่ให้ผมโผล่ · ชุดไม่บังหน้า · ทุกชิ้นกรอบและจุดกึ่งกลางเดียวกัน

---

## เช็กก่อนเซฟทุกใบ

- [ ] ไม่มีตัวอักษร/ตัวเลข/รูน แม้แต่บนแผนที่ สมุด หรือริบบิ้นแสง
- [ ] ไม่มีโลโก้/ชื่อสถาบัน (รอ B3)
- [ ] ไม่มีอาวุธ · เวทมนตร์โทนอุ่น ไม่มีสีดำ-ม่วงมืด
- [ ] โคมไฟอยู่ครบและเป็นสีที่ถูกวิชา
- [ ] จุดจำครบ (แว่น/goggles/หูฟัง/ปิ่นไม้/พลาสเตอร์/ผ้าคาดข้อมือ/กิ๊บดาว/นกหวีด)
- [ ] ชุดสุภาพ ไม่เน้นเรือนร่าง · เด็กเป็นสัดส่วนเด็ก
- [ ] ไม่เหมือนโรงเรียนเวทมนตร์หรือมาสคอตของแบรนด์อื่น
- [ ] ยังดูออกเมื่อย่อเหลือกว้าง 360px
- [ ] จด seed + เครื่องมือ + prompt จริงไว้ใน `<ชื่อ>.md`
