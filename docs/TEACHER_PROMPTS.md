# Prompt ตัวละครครูแต่ละวิชา (ให้แต่ละคนมี "ภาพจำ" ต่างกัน)

หลักการ: **สไตล์ภาพเดียวกัน** (3D กึ่งสมจริง แสงสตูดิโอนุ่ม ครึ่งตัวถึงต้นขา ยิ้มอบอุ่น เหมาะกับเด็ก) แต่ **ทรงผม ชุด สีหลัก ของถือ พื้นหลัง ต่างกันชัด** จนเห็นแค่เงา/สีก็รู้ว่าครูวิชาไหน
ใช้รูปครูคณิต (`web/public/characters/teacher-teach.png`) เป็นรูปอ้างอิงสไตล์ แล้วเปลี่ยนตัวตนตามตารางนี้

| วิชา | ครู | ทรงผม | ชุด / สีหลัก | ของถือ | พื้นหลัง | โฟลเดอร์ |
|---|---|---|---|---|---|---|
| คณิต (มีแล้ว) | หญิง ~28 | ลอนสั้นประบ่า น้ำตาล + กิ๊บเหลือง | คาร์ดิแกนมัสตาร์ด · ผ้าโบว์ครีม · กระโปรงกรม · **แว่นกลม** | สมุดปกน้ำตาล | พีชอ่อน | `characters/` |
| อังกฤษ | หญิง ~27 นักเดินทาง | **หางม้าสูงผมดำตรง** ไม่ใส่แว่น | **แจ็กเก็ตสีฟ้าเทอร์ควอยซ์** · เสื้อยืดขาว · **ผ้าพันคอลายขาวส้ม** · กางเกงสีเบจ | ลูกโลกเล็ก / พาสปอร์ต / แฟลชการ์ด | ฟ้าอ่อน | `characters/english/` |
| วิทยาศาสตร์ | **ดร.ภู** ชาย ~38 (ตาม `CHARACTER_SHEET.md`) | ผมดำตรงสั้น ตาคมเทาเข้ม รอยคล้ำใต้ตาเล็กน้อย **หน้านิ่งขรึม** | **เสื้อกาวน์ขาวยาวถึงเข่า** ทับเชิ้ตเขียวเข้ม + เนคไทเทา · **แว่นนิรภัยกรอบทองเหลืองดันขึ้นหน้าผาก** | บีกเกอร์ควันเขียวเรืองแสง / สมุดบันทึกเล่มเล็ก | เขียวมิ้นต์ | `characters/science/` |
| ภาษาไทย | หญิง ~50 ใจดี | **มวยต่ำ** ผมดำแซมเทา | **เสื้อผ้าฝ้ายทอสีเลือดหมู** · ผ้าคล้องไหล่ลายไทยเรียบ · ผ้าซิ่นสีเข้ม | สมุดกลอน / พัดสาน | ชมพูกลีบกุหลาบ | `characters/thai/` |
| ภาษาจีน | หญิง ~35 | **บ๊อบสั้นเรียบ** กิ๊บหยก | **เสื้อคอจีนสีแดงเข้ม** ลายปักทอง · กางเกงขาตรงครีม | พู่กันจีน / การ์ดอักษรจีน | ครีมอมเขียวหยก | `characters/chinese/` |

ครูทุกคน: ห้ามชุดนักเรียน ห้ามรัดรูป ห้ามอาวุธ ห้ามใส่โลโก้/ตัวหนังสือในภาพ ใบหน้าอายุ 25–50 ปี ท่าทางสุภาพ

---

## Prompt ครูอังกฤษ (คัดลอกไปใช้ได้เลย)

```
A friendly young Thai woman English teacher, about 27 years old, in the exact same stylized 3D
character-render style as the reference image (soft semi-realistic skin, warm genuine smile, clean
studio lighting, shallow depth of field, high detail). Upper body to thighs, centered.

Identity: long straight black hair in a HIGH PONYTAIL with a small orange hair tie, NO glasses,
small gold hoop earrings, bright cheerful traveler energy.
Outfit: a turquoise-teal zip jacket over a plain white t-shirt, a red-and-white striped scarf
loosely around the neck, beige chino trousers. Colour story: teal + white + warm orange accents.
Prop (changes per pose): a small desktop globe, or a passport, or a stack of English flash cards.
Background: plain soft sky-blue (#CFE8F5) studio backdrop, no text, no objects.
Mood: encouraging, playful, kid-friendly, clearly a teacher.

Negative prompt: school uniform, tight or revealing clothes, weapons, text, logos, watermark,
celebrity likeness, extra or missing fingers, cartoon/flat 2D style, the math teacher's yellow
cardigan or round glasses.
```

## 8 ท่า (ชื่อไฟล์ PNG กว้าง ~900px ไฟล์เดียวกับครูคณิต)

| ไฟล์ | ท่า |
|---|---|
| `teacher-wave.png` | โบกมือทักทาย ยิ้มกว้าง |
| `teacher-teach.png` | ยื่นมือเปิดออกด้านข้างเหมือนแนะนำ ถือลูกโลก/การ์ดอีกมือ |
| `teacher-ask.png` | ยกนิ้วชี้ ทำหน้าถามสนุกๆ |
| `teacher-correct.png` | ยกนิ้วโป้ง ยิ้มภูมิใจ |
| `teacher-wrong.png` | ยิ้มให้กำลังใจ เอียงคอเล็กน้อย โบกมือให้ลองใหม่ (ไม่เศร้า ไม่ดุ) |
| `teacher-think.png` | มือแตะคางเหมือนกำลังคิด |
| `teacher-celebrate.png` | ยกสองมือฉลอง |
| `teacher-point.png` | ชี้ไปด้านข้างให้ดูโจทย์ |

วางไฟล์ที่ `web/public/characters/english/` แล้ว push (หรือบอกให้ผม commit) หน้าเรียนวิชาอังกฤษจะเปลี่ยนเป็นครูคนนี้เอง
ครูวิชาอื่นขอ prompt เพิ่มได้ ใช้ตารางด้านบนเป็นแกน


---

## Prompt ครูวิทย์ — ดร.ภู (ตามภาพอ้างอิง `docs/CHARACTER_SHEET.md` หัวข้อ ดร.ภู)

รูปร่างหน้าตาและชุดยึดตาม character sheet ทุกข้อ ส่วน **สไตล์การเรนเดอร์** ให้ตรงกับครูคณิตในแอป (3D กึ่งสมจริง ฉากเรียบ) เพื่อให้ทีมครูดูเป็นชุดเดียวกัน
ถ้าอยากได้สไตล์อนิเมะเซลเชดแบบ sheet (Hero art ระดับ A) ให้เปลี่ยนบรรทัด "Render style" ตามคอมเมนต์ท้าย prompt

```
Dr. Phu, a quiet Thai male scientist-teacher, about 38 years old, tall and slim. Short, straight
black hair; sharp dark-grey eyes with very faint dark circles from working late; calm serious face
that does not smile easily, but warm, never stern or scary to children (a barely-there smile at one
corner of the mouth).
Outfit: a plain white knee-length lab coat with long sleeves (NO logo, NO name tag), over a dark
green shirt with a plain grey tie, grey trousers, thin blue lab gloves. Brass-framed safety
goggles pushed up onto his forehead (his signature silhouette). A small notebook in the chest
pocket. A small green glowing lantern clipped at the waist.
Props (one per pose): a beaker with soft glowing green vapour, a tiny glowing crystal floating
beside him, a small field notebook.
Render style: same stylized 3D character render as the reference math-teacher image (soft
semi-realistic skin, clean warm studio lighting, upper body to thighs, centered).
Background: plain soft mint-green studio backdrop (#D6F0E0), no text, no objects.
Colour story: white + deep green + brass gold + warm green glow.

Negative prompt: weapons, sharp tools, text, logos, watermark, name tag, dark purple or black
magic smoke, horror or mad-scientist look, angry face, tight or revealing clothes, school
uniform, celebrity likeness, extra or missing fingers, 2D flat style.
```

(ถ้าใช้สไตล์ sheet แทน: ใส่ "Render style: anime cel-shaded Thai fantasy hero art, clean dark-teal outline, two-tone shading, warm lantern light as a second light source, floating pastel sky and a Thai-style tower in the far background" และห้ามมีตัวหนังสือในภาพ)

### 8 ท่าของ ดร.ภู
| ไฟล์ | ท่า (ขรึมแต่เป็นมิตร) |
|---|---|
| `teacher-wave.png` | ยกมือเล็กน้อยทัก พยักหน้า ยิ้มมุมปากนิดเดียว |
| `teacher-teach.png` | ถือบีกเกอร์ควันเขียวมือหนึ่ง อีกมือเปิดออกข้างเหมือนแนะนำ |
| `teacher-ask.png` | เอียงศีรษะ ยกนิ้วชี้ ถามกลับ (ท่าประจำตัว: ไม่บอกคำตอบ ถามกลับ) |
| `teacher-correct.png` | ยิ้มมุมปากชัดขึ้นเล็กน้อย พยักหน้าภูมิใจ ผลึกเรืองแสงลอยข้างตัว |
| `teacher-wrong.png` | ยิ้มบางๆ ให้กำลังใจ ชี้สมุดบันทึกเหมือนบอกให้ลองใหม่ ไม่ดุ |
| `teacher-think.png` | มือแตะคาง ผลึกเรืองแสงลอยรอบตัว |
| `teacher-celebrate.png` | ยกบีกเกอร์ควันเขียวขึ้นเล็กน้อย ยิ้มมุมปาก ประกายแสงเขียว |
| `teacher-point.png` | ชี้ด้านข้างไปที่โจทย์ ถือสมุดอีกมือ |

วางไฟล์ที่ `web/public/characters/science/` (ระบบรองรับแล้ว)

---

## Prompt ครูจีน (ใช้ "หน้าตาหลัก" ของคุณเป็นรูปอ้างอิงใบหน้า)

ใส่รูปหน้าตาหลักเป็น **face/identity reference** แล้วใช้ prompt นี้ เปลี่ยนทรงผม ชุด สี ของถือ พื้นหลัง ให้ต่างจากครูคนอื่นชัดเจน
(ถ้าใบหน้าเดียวกับครูคณิต/อังกฤษ ให้ต่างกันที่ **ทรงผม + แว่น/ไม่แว่น + สีชุด + พื้นหลัง** และถ้าได้ ขยับอายุหรือโครงหน้าเล็กน้อย เด็กจะได้ไม่เห็นเป็นคนเดียวกัน)

```
Use the attached reference image ONLY for the face identity (same facial features and warm friendly
expression). A friendly Thai-Chinese woman Chinese-language teacher, about 35 years old, in the same
stylized 3D character-render style as the other teachers (soft semi-realistic skin, clean studio
lighting, upper body to thighs, centered, shallow depth of field, high detail).

Hair: sleek SHORT BOB, chin-length, straight black with a soft centre-left part, a small jade-green
hairpin on one side. No glasses (or very thin gold-rim glasses, optional).
Outfit: a deep crimson-red jacket with a mandarin (stand-up) collar and frog-button closure, subtle
gold embroidered cloud pattern at the collar and cuffs (pattern only, no text or characters),
cream straight-leg trousers. Small jade bracelet. Colour story: crimson + gold + cream + jade green.
Props (one per pose): a Chinese calligraphy brush with a little ink, or a blank cream flash card
with a red tassel, or a small folding fan. Do NOT draw any Chinese characters or letters.
Background: plain soft cream-jade studio backdrop (#EAF3E6), no text, no objects.
Mood: elegant, patient, warm, kid-friendly, clearly a teacher.

Negative prompt: any text or Chinese characters or letters, logos, watermark, school uniform,
tight or revealing clothes, weapons, caricature or stereotyped costume, geisha/kimono, celebrity
likeness, extra or missing fingers, 2D flat style, yellow cardigan, round glasses, high ponytail.
```

### 8 ท่าของครูจีน
| ไฟล์ | ท่า |
|---|---|
| `teacher-wave.png` | ประสานมือทักทายเบาๆ หรือโบกมือ ยิ้มอ่อนโยน |
| `teacher-teach.png` | ถือพู่กันมือหนึ่ง อีกมือยื่นออกข้างเหมือนแนะนำ |
| `teacher-ask.png` | ยกนิ้วชี้ ทำหน้าถามอย่างสนใจ ถือการ์ดเปล่าอีกมือ |
| `teacher-correct.png` | ยิ้มกว้าง ยกนิ้วโป้ง หรือปรบมือเบาๆ |
| `teacher-wrong.png` | ยิ้มให้กำลังใจ เอียงคอเล็กน้อย โบกมือให้ลองใหม่ (ไม่ดุ) |
| `teacher-think.png` | มือแตะคาง ถือพู่กันอีกมือ |
| `teacher-celebrate.png` | ยกการ์ดเปล่าหรือสองมือขึ้นฉลอง มีพู่สีแดงปลิว |
| `teacher-point.png` | ชี้ไปด้านข้างด้วยพู่กัน |

วางไฟล์ที่ `web/public/characters/chinese/` (ระบบรองรับแล้ว)
