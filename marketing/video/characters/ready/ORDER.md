# ลำดับสั่งสร้างภาพ (สร้างอัตโนมัติ — อย่าแก้ไฟล์นี้ด้วยมือ)

ไฟล์ในโฟลเดอร์นี้สร้างจาก `marketing/video/characters/PROMPTS.md`
แก้ prompt ที่ไฟล์นั้น แล้วรัน `node scripts/build-prompts.mjs` ใหม่

## วิธีสั่ง

1. ทำ **ในแชทเดียวกันทั้งหมด** ไม่งั้นสไตล์หลุด
2. ใบแรก (`kru-kao`) ก๊อป `.txt` วางตรง ๆ
3. ใบที่ 2 เป็นต้นไป วางบรรทัดนี้ก่อน แล้วตามด้วยเนื้อ `.txt`

```
Use the image above as the style reference. Keep the exact same art style, line weight, shading and proportions.
```

4. ได้ภาพที่พอใจ → เซฟเป็น `marketing/video/characters/<slug>.png`
5. ภาพทุกใบผ่าน `content-reviewer` ก่อนใช้

## รายการ

| # | slug | ใช้ทำอะไร |
|---|---|---|
| 1 | `kru-kao` | ครูเก้า (Kru Kao) — MATH · Geometry Mage · male ~30 ⭐ เริ่มที่ตัวนี้ |
| 2 | `dr-phu` | ดร.ภู (Dr. Phu) — SCIENCE · quiet scientist · male ~38 |
| 3 | `kru-mind` | ครูมายด์ (Kru Mind) — ENGLISH · Wayfarer · female ~26 |
| 4 | `kru-jan` | ครูจัน (Kru Jan) — THAI · Storyweaver · female ~55 |
| 5 | `kru-ann` | ครูแอน (Kru Ann) — LANTERNKEEPER · female ~28 |
| 6 | `tonkla` | ผู้เรียนฝึกหัด 4 คน — ต้นกล้า |
| 7 | `boat` | ผู้เรียนฝึกหัด 4 คน — โบ๊ท |
| 8 | `mimi` | ผู้เรียนฝึกหัด 4 คน — มีมี่ |
| 9 | `praew` | ผู้เรียนฝึกหัด 4 คน — แพรว |
| 10 | `manao` | มะนาว (Manao) — cat mascot |
| 11 | `koko` | โกโก้ (Koko) — baby dragon |
| 12 | `team-teachers` | ภาพทีมครู 4 คน (ทำหลังได้ sheet ครบ — แนบทั้ง 4 ใบ) |
| 13 | `banner-panels` | แบนเนอร์แบ่งช่องสี (แบบที่เจ้าของชอบ) |
| 14 | `cover-math` | ปกรายวิชา (1:1 — แนบ sheet ของครูคนนั้น) — คณิต |
| 15 | `cover-thai` | ปกรายวิชา (1:1 — แนบ sheet ของครูคนนั้น) — ไทย |
| 16 | `cover-english` | ปกรายวิชา (1:1 — แนบ sheet ของครูคนนั้น) — อังกฤษ |
| 17 | `cover-science` | ปกรายวิชา (1:1 — แนบ sheet ของครูคนนั้น) — วิทย์ |
| 18 | `avatar-bg_sky` | ชิ้นส่วน avatar (R18 / H1) — bg_sky |
| 19 | `avatar-bg_space` | ชิ้นส่วน avatar (R18 / H1) — bg_space |
| 20 | `avatar-bg_castle` | ชิ้นส่วน avatar (R18 / H1) — bg_castle |
| 21 | `avatar-outfit_uniform` | ชิ้นส่วน avatar (R18 / H1) — outfit_uniform |
| 22 | `avatar-outfit_hero` | ชิ้นส่วน avatar (R18 / H1) — outfit_hero |
| 23 | `avatar-outfit_knight` | ชิ้นส่วน avatar (R18 / H1) — outfit_knight |
| 24 | `avatar-hat_cap` | ชิ้นส่วน avatar (R18 / H1) — hat_cap |
| 25 | `avatar-hat_crown` | ชิ้นส่วน avatar (R18 / H1) — hat_crown |
| 26 | `avatar-hat_wizard` | ชิ้นส่วน avatar (R18 / H1) — hat_wizard |
