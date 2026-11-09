# ลำดับสั่งสร้างภาพ (สร้างอัตโนมัติ — อย่าแก้ไฟล์นี้ด้วยมือ)

ไฟล์ในโฟลเดอร์นี้สร้างจาก `marketing/content/english-p1-term2/PROMPTS.md`
แก้ prompt ที่ไฟล์นั้น แล้วรัน `node scripts/build-prompts.mjs --src=marketing/content/english-p1-term2/PROMPTS.md` ใหม่

## วิธีสั่ง

1. ทำ **ในแชทเดียวกันทั้งหมด** ไม่งั้นสไตล์หลุด
2. ใบแรก (`sheet-animals`) ก๊อป `.txt` วางตรง ๆ
3. ใบที่ 2 เป็นต้นไป วางบรรทัดนี้ก่อน แล้วตามด้วยเนื้อ `.txt`

```
Use the image above as the style reference. Keep the exact same art style, line weight, shading and proportions.
```

4. ได้ภาพที่พอใจ → เซฟเป็น `marketing/content/english-p1-term2/<slug>.png`
5. ภาพทุกใบผ่าน `content-reviewer` ก่อนใช้

## รายการ

| # | slug | ใช้ทำอะไร |
|---|---|---|
| 1 | `sheet-animals` | แผ่นล็อกสไตล์ — หน่วย 4 สัตว์ (sheet-animals) |
| 2 | `sheet-food` | แผ่นล็อกสไตล์ — หน่วย 5 อาหาร (sheet-food) |
| 3 | `sheet-colors` | แผ่นล็อกสไตล์ — หน่วย 6 สี (sheet-colors) |
| 4 | `sheet-toys` | แผ่นล็อกสไตล์ — หน่วย 6 ของเล่น (sheet-toys) |
| 5 | `en-p1-animal-cat` | การ์ดศัพท์ — หน่วย 4 สัตว์ (card animals) — en-p1-animal-cat |
| 6 | `en-p1-animal-dog` | การ์ดศัพท์ — หน่วย 4 สัตว์ (card animals) — en-p1-animal-dog |
| 7 | `en-p1-animal-bird` | การ์ดศัพท์ — หน่วย 4 สัตว์ (card animals) — en-p1-animal-bird |
| 8 | `en-p1-animal-fish` | การ์ดศัพท์ — หน่วย 4 สัตว์ (card animals) — en-p1-animal-fish |
| 9 | `en-p1-animal-cow` | การ์ดศัพท์ — หน่วย 4 สัตว์ (card animals) — en-p1-animal-cow |
| 10 | `en-p1-animal-pig` | การ์ดศัพท์ — หน่วย 4 สัตว์ (card animals) — en-p1-animal-pig |
| 11 | `en-p1-animal-duck` | การ์ดศัพท์ — หน่วย 4 สัตว์ (card animals) — en-p1-animal-duck |
| 12 | `en-p1-animal-elephant` | การ์ดศัพท์ — หน่วย 4 สัตว์ (card animals) — en-p1-animal-elephant |
| 13 | `en-p1-animal-hen` | การ์ดศัพท์ — หน่วย 4 สัตว์ (card animals) — en-p1-animal-hen |
| 14 | `en-p1-animal-rabbit` | การ์ดศัพท์ — หน่วย 4 สัตว์ (card animals) — en-p1-animal-rabbit |
| 15 | `en-p1-animal-frog` | การ์ดศัพท์ — หน่วย 4 สัตว์ (card animals) — en-p1-animal-frog |
| 16 | `en-p1-animal-monkey` | การ์ดศัพท์ — หน่วย 4 สัตว์ (card animals) — en-p1-animal-monkey |
| 17 | `en-p1-food-rice` | การ์ดศัพท์ — หน่วย 5 อาหาร (card food) — en-p1-food-rice |
| 18 | `en-p1-food-egg` | การ์ดศัพท์ — หน่วย 5 อาหาร (card food) — en-p1-food-egg |
| 19 | `en-p1-food-milk` | การ์ดศัพท์ — หน่วย 5 อาหาร (card food) — en-p1-food-milk |
| 20 | `en-p1-food-water` | การ์ดศัพท์ — หน่วย 5 อาหาร (card food) — en-p1-food-water |
| 21 | `en-p1-food-bread` | การ์ดศัพท์ — หน่วย 5 อาหาร (card food) — en-p1-food-bread |
| 22 | `en-p1-food-banana` | การ์ดศัพท์ — หน่วย 5 อาหาร (card food) — en-p1-food-banana |
| 23 | `en-p1-food-apple` | การ์ดศัพท์ — หน่วย 5 อาหาร (card food) — en-p1-food-apple |
| 24 | `en-p1-food-mango` | การ์ดศัพท์ — หน่วย 5 อาหาร (card food) — en-p1-food-mango |
| 25 | `en-p1-food-noodles` | การ์ดศัพท์ — หน่วย 5 อาหาร (card food) — en-p1-food-noodles |
| 26 | `en-p1-food-candy` | การ์ดศัพท์ — หน่วย 5 อาหาร (card food) — en-p1-food-candy |
| 27 | `en-p1-food-cake` | การ์ดศัพท์ — หน่วย 5 อาหาร (card food) — en-p1-food-cake |
| 28 | `en-p1-food-icecream` | การ์ดศัพท์ — หน่วย 5 อาหาร (card food) — en-p1-food-icecream |
| 29 | `en-p1-color-red` | การ์ดสี — หน่วย 6 (card colors) — en-p1-color-red |
| 30 | `en-p1-color-blue` | การ์ดสี — หน่วย 6 (card colors) — en-p1-color-blue |
| 31 | `en-p1-color-green` | การ์ดสี — หน่วย 6 (card colors) — en-p1-color-green |
| 32 | `en-p1-color-yellow` | การ์ดสี — หน่วย 6 (card colors) — en-p1-color-yellow |
| 33 | `en-p1-color-black` | การ์ดสี — หน่วย 6 (card colors) — en-p1-color-black |
| 34 | `en-p1-color-white` | การ์ดสี — หน่วย 6 (card colors) — en-p1-color-white |
| 35 | `en-p1-color-pink` | การ์ดสี — หน่วย 6 (card colors) — en-p1-color-pink |
| 36 | `en-p1-color-orange` | การ์ดสี — หน่วย 6 (card colors) — en-p1-color-orange |
| 37 | `en-p1-toy-ball` | การ์ดของเล่น — หน่วย 6 (card toys) — en-p1-toy-ball |
| 38 | `en-p1-toy-doll` | การ์ดของเล่น — หน่วย 6 (card toys) — en-p1-toy-doll |
| 39 | `en-p1-toy-kite` | การ์ดของเล่น — หน่วย 6 (card toys) — en-p1-toy-kite |
| 40 | `en-p1-toy-car` | การ์ดของเล่น — หน่วย 6 (card toys) — en-p1-toy-car |
| 41 | `en-p1-toy-teddy` | การ์ดของเล่น — หน่วย 6 (card toys) — en-p1-toy-teddy |
| 42 | `en-p1-toy-robot` | การ์ดของเล่น — หน่วย 6 (card toys) — en-p1-toy-robot |
| 43 | `en-p1-toy-balloon` | การ์ดของเล่น — หน่วย 6 (card toys) — en-p1-toy-balloon |
| 44 | `en-p1-toy-drum` | การ์ดของเล่น — หน่วย 6 (card toys) — en-p1-toy-drum |
| 45 | `en-p1-prep-in` | ฉากบุพบท — in / on / under / next to / behind (scene prepositions) — en-p1-prep-in |
| 46 | `en-p1-prep-on` | ฉากบุพบท — in / on / under / next to / behind (scene prepositions) — en-p1-prep-on |
| 47 | `en-p1-prep-under` | ฉากบุพบท — in / on / under / next to / behind (scene prepositions) — en-p1-prep-under |
| 48 | `en-p1-prep-nextto` | ฉากบุพบท — in / on / under / next to / behind (scene prepositions) — en-p1-prep-nextto |
| 49 | `en-p1-prep-behind` | ฉากบุพบท — in / on / under / next to / behind (scene prepositions) — en-p1-prep-behind |
| 50 | `en-p1-count-3-ducks` | ฉากนับจำนวน (scene counting) — en-p1-count-3-ducks |
| 51 | `en-p1-count-5-apples` | ฉากนับจำนวน (scene counting) — en-p1-count-5-apples |
| 52 | `en-p1-count-7-balloons` | ฉากนับจำนวน (scene counting) — en-p1-count-7-balloons |
| 53 | `en-p1-count-10-fish` | ฉากนับจำนวน (scene counting) — en-p1-count-10-fish |
| 54 | `en-p1-cover-animals` | ปกชุดโจทย์ (cover) — en-p1-cover-animals |
| 55 | `en-p1-cover-food` | ปกชุดโจทย์ (cover) — en-p1-cover-food |
| 56 | `en-p1-cover-colors-toys` | ปกชุดโจทย์ (cover) — en-p1-cover-colors-toys |
