# ลำดับสั่งสร้างภาพ (สร้างอัตโนมัติ — อย่าแก้ไฟล์นี้ด้วยมือ)

ไฟล์ในโฟลเดอร์นี้สร้างจาก `marketing/social/PROMPTS.md`
แก้ prompt ที่ไฟล์นั้น แล้วรัน `node scripts/build-prompts.mjs --src=marketing/social/PROMPTS.md` ใหม่

## วิธีสั่ง

1. ทำ **ในแชทเดียวกันทั้งหมด** ไม่งั้นสไตล์หลุด
2. ใบแรก (`post-cover-math`) ก๊อป `.txt` วางตรง ๆ
3. ใบที่ 2 เป็นต้นไป วางบรรทัดนี้ก่อน แล้วตามด้วยเนื้อ `.txt`

```
Use the image above as the style reference. Keep the exact same art style, line weight, shading and proportions.
```

4. ได้ภาพที่พอใจ → เซฟเป็น `marketing/social/<slug>.png`
5. ภาพทุกใบผ่าน `content-reviewer` ก่อนใช้

## รายการ

| # | slug | ใช้ทำอะไร |
|---|---|---|
| 1 | `post-cover-math` | ปกโพสต์ความรู้วันจันทร์ (Monday knowledge cover) — ครูเก้า |
| 2 | `post-cover-thai` | ปกโพสต์ความรู้วันจันทร์ (Monday knowledge cover) — ครูจัน |
| 3 | `post-cover-english` | ปกโพสต์ความรู้วันจันทร์ (Monday knowledge cover) — ครูมายด์ |
| 4 | `post-cover-science` | ปกโพสต์ความรู้วันจันทร์ (Monday knowledge cover) — ดร.ภู |
| 5 | `post-cover-general` | ปกโพสต์ความรู้วันจันทร์ (Monday knowledge cover) — ครูแอน |
| 6 | `card-tip-notebook` | การ์ดในอัลบั้มความรู้ (album body card) — tip-notebook |
| 7 | `card-tip-lantern-unlit` | การ์ดในอัลบั้มความรู้ (album body card) — tip-lantern-unlit |
| 8 | `card-tip-lantern-lit` | การ์ดในอัลบั้มความรู้ (album body card) — tip-lantern-lit |
| 9 | `card-tip-steps` | การ์ดในอัลบั้มความรู้ (album body card) — tip-steps |
| 10 | `clip-math` | ปกคลิปสอน (lesson clip cover) — ครูเก้า |
| 11 | `clip-thai` | ปกคลิปสอน (lesson clip cover) — ครูจัน |
| 12 | `clip-english` | ปกคลิปสอน (lesson clip cover) — ครูมายด์ |
| 13 | `clip-science` | ปกคลิปสอน (lesson clip cover) — ดร.ภู |
| 14 | `day-fathers-day` | ภาพโพสต์วันสำคัญ (occasion art) — fathers-day |
| 15 | `day-mothers-day` | ภาพโพสต์วันสำคัญ (occasion art) — mothers-day |
| 16 | `day-new-year` | ภาพโพสต์วันสำคัญ (occasion art) — new-year |
| 17 | `day-exam-season` | ภาพโพสต์วันสำคัญ (occasion art) — exam-season |
| 18 | `plate-blue` | พื้นหลังเปล่าใส่ข้อความ (empty text plate) — plate-blue |
| 19 | `plate-green` | พื้นหลังเปล่าใส่ข้อความ (empty text plate) — plate-green |
| 20 | `plate-orange` | พื้นหลังเปล่าใส่ข้อความ (empty text plate) — plate-orange |
| 21 | `plate-pink` | พื้นหลังเปล่าใส่ข้อความ (empty text plate) — plate-pink |
| 22 | `plate-yellow` | พื้นหลังเปล่าใส่ข้อความ (empty text plate) — plate-yellow |
