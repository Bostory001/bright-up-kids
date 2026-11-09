# Prompt ภาพประกอบเนื้อหา — อังกฤษ ป.1 ภาคเรียนที่ 2

ภาพชุดนี้เป็น **Tier B (flat vector)** ตาม `.claude/skills/illustration-prompting/SKILL.md` ข้อ 1
→ **ไม่มีตัวละคร 11 ตัว ไม่มีเวทมนตร์ ไม่มีประกายแสง** เพราะเด็กต้องนับ/แยกวัตถุให้ออกจริง

## ทำไมภาพคือ "ตัวโจทย์" ไม่ใช่ของประดับ

ตัวชี้วัด **ต 1.1 ป.1/3** คือ *เลือกภาพตรงตามความหมายของคำและกลุ่มคำที่ฟัง* — เด็ก ป.1 ยังอ่านอังกฤษไม่ออก
**ภาพจึงเป็นตัวเลือกทั้ง 4 ตัวในข้อนั้นเลย** ภาพกำกวม = ข้อนั้นเสีย ไม่ใช่แค่ไม่สวย

## หน่วยที่ครอบคลุม (ภาคเรียนที่ 2)

| หน่วย | ชื่อ | ไฟล์ที่ได้ |
|---|---|---|
| 4 | Animals — สัตว์ | 1 แผ่นล็อกสไตล์ + 12 การ์ด |
| 5 | Food — อาหาร | 1 แผ่นล็อกสไตล์ + 12 การ์ด |
| 6 | Colors & Toys — สีและของเล่น | 2 แผ่นล็อกสไตล์ + 8 การ์ดสี + 8 การ์ดของเล่น |
| — | ฉากสำหรับโจทย์ฟัง/นับ | 5 ฉากบุพบท + 4 ฉากนับจำนวน |
| — | ปกชุดโจทย์ | 3 ใบ |

> ⚠️ **โครงหน่วยนี้อ้างจากแผน DLTV/อจท. ป.1 (6 หน่วย/ปี — เทอม 2 = หน่วย 4-6)**
> **ต้องเทียบกับหนังสือที่โรงเรียนในพื้นที่ใช้จริงก่อนปล่อยชุดโจทย์** ตามคำเตือนใน `exercise-authoring` ข้อ 3

## วิธีใช้

```bash
node scripts/build-prompts.mjs --src=marketing/content/english-p1-term2/PROMPTS.md --list
node scripts/build-prompts.mjs --src=marketing/content/english-p1-term2/PROMPTS.md
```

**ลำดับสำคัญ:** สร้าง *แผ่นล็อกสไตล์* ของหน่วยนั้นก่อน 1 ใบ → พอใจแล้วจึงแนบใบนั้นเป็น style reference
ตอนสั่งการ์ดเดี่ยวทุกใบในหน่วยเดียวกัน **ถ้าข้ามขั้นนี้ การ์ด 4 ใบในข้อเดียวกันจะดูไม่เป็นชุด
แล้วเด็กจะเดาคำตอบจากสไตล์ภาพได้ โดยไม่ต้องรู้ศัพท์เลย**

---

## 🧩 บล็อกที่ต้องใส่ทุก prompt

### [STYLE]
```
STYLE: flat vector illustration for a children learning app, friendly rounded
shapes, one single thick uniform outline weight throughout, bright cheerful
flat colors, minimal soft shading, no gradient mesh, no texture, no outline
thinner or thicker anywhere, instantly recognizable when shrunk to 90 pixels
wide, generous negative space
```

### [LAYOUT]
```
LAYOUT: exactly ONE object, centered, filling about 70% of a 1:1 square
canvas, plain very light warm-neutral background, a single soft flat ellipse
shadow under the object and nothing else, no props, no scenery, no border,
no frame. Use the SAME framing, the SAME object height and the SAME outline
weight as every other card in this set.
```

### [SHEET]
```
LAYOUT: one 4:3 landscape canvas split into an even grid of equal cells with
thin white gutters, ONE object centered in each cell, every object drawn at
the same visual weight and the same outline thickness, plain very light
warm-neutral background in every cell, nothing spanning across two cells,
no labels under the cells.
```

### [SCENE]
```
LAYOUT: one simple scene on a 4:3 landscape canvas, flat vector, only the
objects listed below and nothing else, plain pale background, clear empty
space between every object so each one can be counted or located without
overlapping, viewed straight on at child eye level.
```

### [NEGATIVE]
```
DO NOT INCLUDE: any text, letters, words, numbers, numerals, labels, captions
or written symbols of any kind, not even on packaging or on clothing; logos,
watermarks, signatures, speech bubbles; the quantity written as a digit;
photorealism, 3d render, clay render; cute cartoon eyes or smiling faces on
inanimate objects; varying outline weights within one image; scary, sad or
violent content; branded characters or branded packaging; cluttered or
detailed background; the subject cropped or touching the canvas edge.
```

---

# 1. แผ่นล็อกสไตล์ — หน่วย 4 สัตว์ (sheet-animals)

⭐ **สร้างใบนี้ก่อนทุกอย่างในหน่วย 4**

```
[STYLE]

[SHEET]

GRID: 4 columns by 3 rows, 12 cells.

OBJECTS, left to right then top to bottom: a cat, a dog, a small bird, a fish,
a cow, a pig, a duck, an elephant, a hen, a rabbit, a frog, a monkey.
Each animal in clear side view, whole body visible, calm and friendly, no
human clothing, no accessories.

[NEGATIVE]
```

---

# 2. แผ่นล็อกสไตล์ — หน่วย 5 อาหาร (sheet-food)

```
[STYLE]

[SHEET]

GRID: 4 columns by 3 rows, 12 cells.

OBJECTS, left to right then top to bottom: a bowl of cooked white rice, a
whole chicken egg, a clear glass of milk, a clear glass of plain water, a
slice of bread, a banana, a red apple, a ripe mango, a bowl of noodles, a
wrapped sweet, a slice of layer cake, an ice cream cone.
Plain food, nothing decorated, no patterned plates.

[NEGATIVE]
```

---

# 3. แผ่นล็อกสไตล์ — หน่วย 6 สี (sheet-colors)

```
[STYLE]

[SHEET]

GRID: 4 columns by 2 rows, 8 cells.

OBJECTS: the SAME simple round party balloon with a short tied string in every
cell, identical shape, identical size, identical outline — only the balloon
colour changes. In order: red, blue, green, yellow, black, white, pink,
orange. Give the white balloon a mid-grey outline and a faint grey shaded side
so it is still clearly visible on the light background.

[NEGATIVE]
```

⚠️ **ต้องเป็นของชิ้นเดียวกันทุกใบ** ถ้าใช้ของต่างชนิด (กล้วย=เหลือง ใบไม้=เขียว) เด็กตอบถูกจากรูปของ ไม่ได้ตอบจากสี

---

# 4. แผ่นล็อกสไตล์ — หน่วย 6 ของเล่น (sheet-toys)

```
[STYLE]

[SHEET]

GRID: 4 columns by 2 rows, 8 cells.

OBJECTS, left to right then top to bottom: a striped rubber ball, a cloth
doll, a diamond kite with a tail, a small toy car, a teddy bear, a boxy toy
robot, a party balloon, a small toy drum with one stick.
Plain toys, no brand shapes, no faces on the ball or on the car.

[NEGATIVE]
```

---

# 5. การ์ดศัพท์ — หน่วย 4 สัตว์ (card animals)

แนบ `sheet-animals.png` เป็น style reference ทุกใบ

```
[STYLE]

[LAYOUT]

SUBJECT: {OBJECT}

MUST READ UNMISTAKABLY AS THIS ANIMAL: {GUARD}

[NEGATIVE]
```

| id | word | {OBJECT} | {GUARD} |
|---|---|---|---|
| `en-p1-animal-cat` | cat | an orange tabby cat sitting in side view, tail curled around its feet | pointed triangular ears, long thin tail, whiskers — must not look like a dog or a fox |
| `en-p1-animal-dog` | dog | a light brown dog sitting in side view, mouth closed | floppy ears, blunt snout, no collar — must not look like a cat, a wolf or a fox |
| `en-p1-animal-bird` | bird | a small blue songbird perched in side view | small rounded body, short beak, tail short — must not look like a duck, a hen or an owl |
| `en-p1-animal-fish` | fish | a single orange fish in side view, swimming | one fish only, clear tail fin and one visible eye, no tank, no bubbles — must not look like a dolphin or a whale |
| `en-p1-animal-cow` | cow | a white cow with large black patches, standing in side view | short curved horns, black-and-white patches — must not look like a buffalo, a bull or a goat |
| `en-p1-animal-pig` | pig | a pink pig standing in side view | round snout seen from the side, curly tail, small upright ears — must not look like a hippo |
| `en-p1-animal-duck` | duck | a yellow-and-white duck standing in side view | flat wide orange bill and orange webbed feet — must not look like a hen, a goose or a swan, keep the neck short |
| `en-p1-animal-elephant` | elephant | a grey elephant standing in side view, trunk hanging down | large fan ears, long trunk, thick legs — must not look like a rhino |
| `en-p1-animal-hen` | hen | a brown hen standing in side view | small red comb on the head, short pointed beak, short feathered tail held up — must not look like a duck or a long-tailed rooster |
| `en-p1-animal-rabbit` | rabbit | a white rabbit sitting in side view | two long upright ears, round fluffy tail, short front legs — must not look like a cat or a kangaroo |
| `en-p1-animal-frog` | frog | a green frog sitting facing forward | wide mouth, two bulging eyes on top of the head, folded back legs — must not look like a turtle or a lizard |
| `en-p1-animal-monkey` | monkey | a brown monkey sitting in side view, long tail curving up | pale flat face, long curling tail, hands visible — must not look like a bear or a gorilla |

---

# 6. การ์ดศัพท์ — หน่วย 5 อาหาร (card food)

แนบ `sheet-food.png` เป็น style reference ทุกใบ

```
[STYLE]

[LAYOUT]

SUBJECT: {OBJECT}

MUST READ UNMISTAKABLY AS THIS FOOD: {GUARD}

[NEGATIVE]
```

| id | word | {OBJECT} | {GUARD} |
|---|---|---|---|
| `en-p1-food-rice` | rice | a plain white bowl holding a rounded mound of cooked white rice | white grains visible as texture, plain bowl with no pattern, no spoon — must not look like noodles or ice cream |
| `en-p1-food-egg` | egg | one whole uncooked chicken egg standing upright | smooth unbroken pale shell, egg-shaped not round, no nest, no shell pieces — must not look like a ball or a stone |
| `en-p1-food-milk` | milk | a clear drinking glass filled with white milk | opaque flat white liquid with a visible flat surface line, no straw, no carton — must not look like water |
| `en-p1-food-water` | water | a clear drinking glass filled with colourless water | pale blue transparent liquid you can see the back of the glass through — must not look like milk |
| `en-p1-food-bread` | bread | one square slice of white bread with a brown crust edge | flat single slice seen face on, soft pale centre, brown rim — must not look like cake or a sandwich |
| `en-p1-food-banana` | banana | one yellow banana, unpeeled, curving | one single banana not a bunch, brown tip at one end — must not look like a mango or a corn cob |
| `en-p1-food-apple` | apple | one red apple with a short brown stem and one green leaf | round with a dip at the top where the stem sits — must not look like a tomato or a cherry |
| `en-p1-food-mango` | mango | one ripe yellow-orange mango, whole | oval and slightly flattened with a gentle curve on one side — must not look like a banana, a lemon or a peach |
| `en-p1-food-noodles` | noodles | a plain bowl of pale noodles with chopsticks lifting a few strands | long thin strands clearly separate from each other — must not look like rice or clear soup |
| `en-p1-food-candy` | candy | one round sweet in a twisted clear wrapper | twisted ends on both sides, plain wrapper with no writing — must not look like a ball or a flower |
| `en-p1-food-cake` | cake | one triangular slice of layer cake with white cream between two sponge layers | wedge shape seen from the side, visible layers — must not look like bread or cheese |
| `en-p1-food-icecream` | ice cream | one scoop of pale ice cream in a plain cone | round scoop sitting in a pointed waffle cone — must not look like a cupcake or a flower |

---

# 7. การ์ดสี — หน่วย 6 (card colors)

แนบ `sheet-colors.png` เป็น style reference ทุกใบ · **ลูกโป่งต้องรูปร่างเดียวกันเป๊ะทั้ง 8 ใบ**

```
[STYLE]

[LAYOUT]

SUBJECT: one simple round party balloon with a short tied string, colour {COLOR}

The balloon shape, size, outline and string must be IDENTICAL to every other
card in this set. Only the colour changes. {GUARD}

[NEGATIVE]
```

| id | word | {COLOR} | {GUARD} |
|---|---|---|---|
| `en-p1-color-red` | red | clear warm red | keep it clearly separate from the orange and the pink card |
| `en-p1-color-blue` | blue | clear medium blue | not teal and not purple |
| `en-p1-color-green` | green | clear leaf green | not yellow-green and not blue-green |
| `en-p1-color-yellow` | yellow | clear bright yellow | strong enough to read against the light background |
| `en-p1-color-black` | black | solid black | keep a small light highlight so the shape is still readable |
| `en-p1-color-white` | white | white | give it a mid-grey outline and a faint grey shaded side so a white balloon is clearly visible on a near-white canvas |
| `en-p1-color-pink` | pink | clear light pink | clearly lighter and cooler than the red card so the two are not confusable |
| `en-p1-color-orange` | orange | clear orange | clearly between the red and the yellow card, not reddish |

---

# 8. การ์ดของเล่น — หน่วย 6 (card toys)

แนบ `sheet-toys.png` เป็น style reference ทุกใบ

```
[STYLE]

[LAYOUT]

SUBJECT: {OBJECT}

MUST READ UNMISTAKABLY AS THIS TOY: {GUARD}

[NEGATIVE]
```

| id | word | {OBJECT} | {GUARD} |
|---|---|---|---|
| `en-p1-toy-ball` | ball | a rubber play ball with a wide coloured stripe around the middle | perfectly round with the stripe curving to show it is a sphere — must not look like a balloon or a planet |
| `en-p1-toy-doll` | doll | a simple cloth doll with yarn hair and a plain dress, standing | stitched simple face, soft fabric limbs — must not look like a real child or a teddy bear |
| `en-p1-toy-kite` | kite | a diamond kite with a cross spar and a short ribbon tail, seen face on | diamond outline with the tail hanging from the bottom point, string running off the bottom edge — must not look like a flag |
| `en-p1-toy-car` | car | a small chunky toy car in side view | oversized simple wheels and a stubby body, no doors, no driver, no number plate — must not look like a real car |
| `en-p1-toy-teddy` | teddy bear | a brown teddy bear sitting facing forward, arms out | round ears, stitched muzzle, soft stuffed limbs — must not look like a real bear, a dog or a monkey |
| `en-p1-toy-robot` | robot | a boxy toy robot standing facing forward | square head and square body, segmented arms and legs, two round eyes, an antenna — must not look like a person wearing a costume |
| `en-p1-toy-balloon` | balloon | a single party balloon on a string, floating | teardrop balloon shape with a knot at the bottom and a long loose string — the shape must differ clearly from the ball card |
| `en-p1-toy-drum` | drum | a small toy drum with one wooden stick resting beside it | cylinder seen slightly from above so the round drum head is visible, plain side with no pattern — must not look like a bucket or a cake |

---

# 9. ฉากบุพบท — in / on / under / next to / behind (scene prepositions)

ใช้กับโจทย์ฟังแล้วเลือกภาพ · **แมวและกล่องต้องเหมือนกันทั้ง 5 ใบ** เปลี่ยนแค่ตำแหน่ง

```
[STYLE]

[SCENE]

OBJECTS: the same orange tabby cat and the same plain cardboard box in every
image of this set, drawn at the same size and from the same angle.

POSITION: {POSITION}

The position must be obvious at a glance with no overlap hiding it. {GUARD}

[NEGATIVE]
```

| id | word | {POSITION} | {GUARD} |
|---|---|---|---|
| `en-p1-prep-in` | in | the cat sitting inside the open box, head and shoulders above the rim | the box rim must clearly pass in front of the cat body so it reads as inside, not behind |
| `en-p1-prep-on` | on | the cat sitting on top of the closed box | the cat feet must rest on the flat top surface of the box, the whole cat above the box |
| `en-p1-prep-under` | under | the cat lying under a wooden table, the closed box beside the table | the table top must be fully above the cat with clear space, the cat entirely below it |
| `en-p1-prep-nextto` | next to | the cat sitting on the floor directly beside the closed box, both on the same ground line | a clear gap between the cat and the box, neither one overlapping the other |
| `en-p1-prep-behind` | behind | the cat standing behind the closed box, only its head and ears showing above the box | the box must clearly hide the cat body, with the cat head above the box edge |

---

# 10. ฉากนับจำนวน (scene counting)

⚠️ **จำนวนในภาพต้องตรงเป๊ะ** · ภาพนี้สปอยคำตอบได้ง่ายที่สุด — ห้ามมีตัวเลขในภาพเด็ดขาด

```
[STYLE]

[SCENE]

OBJECTS: exactly {COUNT} identical {THING}, and nothing else at all.

Arrange them in a loose scattered group, not a neat row and not a counting
grid, every one of them fully visible and fully separated from the others
with clear background between them. Count them again before finishing:
there must be exactly {COUNT}, no more and no fewer.

[NEGATIVE]
```

| id | {COUNT} | {THING} | ใช้กับคำ |
|---|---|---|---|
| `en-p1-count-3-ducks` | three (3) | yellow ducks standing on grass, all facing the same way | three |
| `en-p1-count-5-apples` | five (5) | red apples lying on a plain wooden table | five |
| `en-p1-count-7-balloons` | seven (7) | blue party balloons floating, each on its own string | seven |
| `en-p1-count-10-fish` | ten (10) | orange fish swimming, all the same size | ten |

---

# 11. ปกชุดโจทย์ (cover)

1:1 สำหรับปุ่มเลือกชุดในแอป · ยังห้ามใส่โลโก้/ชื่อสถาบัน (รอ B3)

```
[STYLE]

LAYOUT: a simple 1:1 square cover illustration, one small group of objects
arranged in the centre with a clear empty band across the bottom third where
Thai text will be added later in code, soft pale background wash, nothing in
the corners.

SUBJECT: {SUBJECT}

[NEGATIVE]
```

| id | หน่วย | {SUBJECT} |
|---|---|---|
| `en-p1-cover-animals` | 4 Animals | a friendly group of a cat, a duck and an elephant standing together on a simple green ground line |
| `en-p1-cover-food` | 5 Food | a bowl of rice, a banana and a glass of milk arranged side by side on a plain table edge |
| `en-p1-cover-colors-toys` | 6 Colors and Toys | four balloons in red, blue, green and yellow floating above a toy ball and a small toy car |

---

## เช็กก่อนเซฟทุกใบ

- [ ] **ไม่มีตัวอักษร/ตัวเลขในภาพเลย** แม้บนกล่อง ถุง หรือเสื้อ
- [ ] **จำนวนวัตถุตรงกับโจทย์เป๊ะ** — นับด้วยตาเองทุกใบ (ภาพนับจำนวนพลาดบ่อยสุด)
- [ ] ไม่สปอยคำตอบ (ไม่มีเลขกำกับ ไม่จัดเรียงให้นับง่ายเกินไป)
- [ ] **การ์ด 4 ใบที่จะใช้เป็นตัวเลือกในข้อเดียวกัน ต้องดูเป็นชุดเดียวกัน** — กรอบ ขนาด ความหนาเส้นเท่ากัน
- [ ] ย่อเหลือกว้าง 90px แล้วยังดูออกว่าเป็นอะไร (เด็กเห็นตัวเลือก 4 ช่องบนจอ 360px)
- [ ] สีไม่ชนกัน — ชมพู/แดง/ส้ม ต้องแยกออกจากกันชัด
- [ ] ไม่มีโลโก้หรือชื่อ Bright Up Kids (รอ B3)
- [ ] ไม่มีแบรนด์/ตัวละครลิขสิทธิ์
- [ ] จด seed + เครื่องมือ + prompt จริงไว้ใน `<id>.md`
- [ ] ส่งต่อ `content-reviewer` ก่อนใช้
