---
name: illustration-prompting
description: วิธีเขียน prompt ภาพประกอบและตัวละครให้สื่อการสอนเด็ก ป.1-6 ดูเป็นชุดเดียวกันและทำซ้ำได้ ใช้กับภาพประกอบโจทย์ avatar ภาพในคลิป และภาพการตลาด
---

# เขียน prompt ภาพ Bright Up Kids

> 📌 **อ่านก่อนเขียน prompt ที่มีตัวละคร:** [docs/CHARACTER_SHEET.md](../../../docs/CHARACTER_SHEET.md) (สเปกหน้าตา)
> และ [marketing/video/characters/PROMPTS.md](../../../marketing/video/characters/PROMPTS.md) (prompt พร้อมใช้ + บล็อกสไตล์เต็ม)

## 1. Style guide — มี 2 ระดับ ใช้ให้ถูกงาน

**A — Hero art (ปกคลิป · โพสต์ · ใบปลิว · ภาพเปิดบท · avatar):** อนิเมะเซลเชด **แฟนตาซี** ตาม `docs/CHARACTER_SHEET.md`

```
modern anime cel-shaded fantasy illustration, clean colored linework, two-tone
cel shading plus a second light source from glowing magic and lantern light,
warm luminous palette, Thai-fantasy setting (kanok motifs, woven textiles,
Lanna paper lanterns, floating temple-tower architecture), magic as light
ribbons and translucent floating shapes — never dark smoke or purple-black
```

🚫 ห้ามอาวุธ · ห้ามเวทมนตร์โทนมืด · ห้ามตัวอักษร/รูน แม้เป็นอักษรเวท

**B — Flat vector (ภาพประกอบโจทย์: แอปเปิล นาฬิกา รูปทรง):** ไม่ต้องมีตัวละคร

> 📦 **ชุดที่เขียนเสร็จแล้ว ใช้เป็นแม่แบบได้:** อังกฤษ ป.1 เทอม 2 (56 ใบ) ที่
> [marketing/content/english-p1-term2/PROMPTS.md](../../../marketing/content/english-p1-term2/PROMPTS.md)
> มีบล็อก `[SHEET]` `[SCENE]` เพิ่มจากที่นี่ และกติกา **"การ์ด 4 ใบในข้อเดียวกันต้องดูเป็นชุดเดียวกัน"**

```
flat vector illustration, friendly rounded shapes, thick clean outlines,
bright cheerful palette, soft pastel background, no gradients mesh,
child-friendly, centered composition, plenty of negative space
```

**Negative prompt มาตรฐาน:**
```
text, letters, numbers, watermark, logo, signature, realistic photo,
dark mood, scary, violence, gore, cluttered background, 3d render,
extra limbs, deformed hands, adult content
```

> ⚠️ **ห้ามมีตัวอักษรในภาพ** — เครื่องมือสร้างภาพสะกดภาษาไทยผิดเสมอ · ตัวหนังสือทั้งหมดให้ใส่ทีหลังด้วยโค้ด/เครื่องมือออกแบบ

## 2. ล็อกตัวละคร (กฎสำคัญที่สุด)

**ถ้ามี character sheet อยู่แล้ว → ใช้เป็น image reference เสมอ ห้ามสร้างใหม่จากข้อความ**

1. สร้าง **character sheet** 1 ใบต่อตัว: ยืนตรง + 3/4 + หันข้าง + หันหลัง + สีหน้า 4 แบบ
2. เก็บไฟล์ไว้ที่ `marketing/video/characters/<ชื่อ>.png` + `<ชื่อ>.md` (prompt จริง + seed + เครื่องมือ)
3. ภาพต่อ ๆ ไป **ส่ง character sheet เป็น reference ทุกครั้ง** แล้ว prompt แค่ท่าทาง/ฉาก

**ตัวละครประจำ 11 ตัว (สเปกเต็มใน `docs/CHARACTER_SHEET.md`) — โลก "สถาบันโคมไฟ" 1 วิชา = 1 ครู = 1 สีโคม**

| ครูผู้ถือโคม | วิชา/สี | เด็ก | มาสคอต |
|---|---|---|---|
| ครูเก้า นักเวทเรขาคณิต | คณิต · น้ำเงิน | ต้นกล้า ป.1 (ส้ม) | มะนาว (`pet_cat`) |
| ดร.ภู นักวิทยาศาสตร์เงียบ | วิทย์ · เขียว | โบ๊ท ป.3 (เขียว) | โกโก้ (`pet_dragon`) |
| ครูมายด์ นักเดินทางข้ามแดน | อังกฤษ · ส้ม | มีมี่ ป.4 (ฟ้า) | |
| ครูจัน ผู้ถักทอเรื่องเล่า | ไทย · ชมพูแดง | แพรว ป.6 (ม่วง) | |
| ครูแอน ผู้ดูแลโคม (เหลือง) | ไม่ผูกวิชา | | |

## 3. สัดส่วนภาพตามการใช้งาน

| ใช้ที่ไหน | สัดส่วน | ขนาด | หมายเหตุ |
|---|---|---|---|
| ภาพประกอบโจทย์ | 4:3 | 800×600 | ต้องอ่านออกบนจอ 360px |
| avatar แต่ละชิ้น (R18/H1) | 1:1 | 512×512 | พื้นหลังโปร่ง · ต้องซ้อนชั้นกันได้ |
| ภาพในคลิปสอน | 9:16 | 1080×1920 | แนวตั้ง |
| ปกคลิป / โพสต์เพจ | 1:1 หรือ 4:5 | 1080×1080 | เว้นที่ใส่ข้อความทีหลัง |
| ใบปลิว | A5 | 300 dpi | รอ HQ อนุมัติก่อนใช้แบรนด์ |

## 4. ภาพประกอบโจทย์ — กฎเฉพาะ

- ❌ **ห้ามสปอยคำตอบ** — โจทย์ถาม "มีแอปเปิลกี่ลูก" ภาพต้องไม่เขียนเลขไว้ หรือจัดกองให้นับง่ายเกินไปจนไม่ต้องคิด
- ✅ ภาพช่วย "เห็นสถานการณ์" ไม่ใช่ "ให้คำตอบ"
- ✅ จำนวนวัตถุในภาพต้องตรงกับโจทย์เป๊ะ (ถ้าโจทย์บอก 5 ลูก ภาพต้องมี 5 ลูกจริง) — **ตรวจด้วยตาทุกใบ**
- ✅ สิ่งของในภาพต้องเป็นของที่เด็กไทยรู้จัก

## 5. avatar (R18/H1) — ข้อจำกัดทางเทคนิค

ระบบใช้ SVG ซ้อนชั้น 4 ช่อง: `background` · `outfit` · `hat` · `pet` (ดู `web/src/components/AvatarSvg.tsx`)

- id ของภาพ **ต้องตรงกับ `AVATAR_ITEMS`** ใน `gamification.ts`
- แต่ละชิ้นต้องซ้อนกับชิ้นอื่นได้โดยไม่ทับกันผิดที่ → ใช้ **กรอบและจุดกึ่งกลางเดียวกันทุกชิ้น**
- พื้นหลังโปร่ง (PNG alpha หรือ SVG)
- หมวกต้องเว้นที่ให้ผมโผล่ · ชุดต้องไม่บังหน้า

## 6. รูปแบบส่งมอบ

| ชื่อไฟล์ | ใช้ที่ไหน | prompt | negative | สัดส่วน | ภาพอ้างอิง |
|---|---|---|---|---|---|
| `math-p2-apples.png` | โจทย์ ป.2 การบวก | `flat vector illustration, 5 red apples on a wooden table, ...` | (มาตรฐาน) | 4:3 | — |

ส่งพร้อมหมายเหตุว่าภาพไหน **ห้ามแสดงอะไร** (กันสปอยคำตอบ)

## 7. เส้นที่ห้ามข้าม

- 🚫 สไตล์/ตัวละคร/มาสคอตที่มีลิขสิทธิ์ของเจ้าอื่น
- 🚫 โลโก้หรือชื่อ Bright Up Kids ในภาพ **จนกว่า B3 (HQ อนุมัติ) จะเสร็จ**
- 🚫 ภาพที่อ้างอิงหน้าตาเด็กจริงในสาขา (PDPA)
- 🚫 ภาพที่สื่อความรุนแรง ความกลัว หรือการแบ่งแยกฐานะ/เพศ/เชื้อชาติ

## 8. ก่อนส่ง — ตรวจเอง

- [ ] ไม่มีตัวอักษรในภาพ
- [ ] จำนวนวัตถุตรงกับโจทย์
- [ ] ไม่สปอยคำตอบ
- [ ] อ่านออกเมื่อย่อเหลือความกว้าง 360px
- [ ] ตัวละครตรงกับ character sheet
- [ ] ส่งต่อ `content-reviewer`
