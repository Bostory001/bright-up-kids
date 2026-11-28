# Prompt ตัวละครครูแต่ละวิชา (ให้แต่ละคนมี "ภาพจำ" ต่างกัน)

หลักการ: **สไตล์ภาพเดียวกัน** (3D กึ่งสมจริง แสงสตูดิโอนุ่ม ครึ่งตัวถึงต้นขา ยิ้มอบอุ่น เหมาะกับเด็ก) แต่ **ทรงผม ชุด สีหลัก ของถือ พื้นหลัง ต่างกันชัด** จนเห็นแค่เงา/สีก็รู้ว่าครูวิชาไหน
ใช้รูปครูคณิต (`web/public/characters/teacher-teach.png`) เป็นรูปอ้างอิงสไตล์ แล้วเปลี่ยนตัวตนตามตารางนี้

| วิชา | ครู | ทรงผม | ชุด / สีหลัก | ของถือ | พื้นหลัง | โฟลเดอร์ |
|---|---|---|---|---|---|---|
| คณิต (มีแล้ว) | หญิง ~28 | ลอนสั้นประบ่า น้ำตาล + กิ๊บเหลือง | คาร์ดิแกนมัสตาร์ด · ผ้าโบว์ครีม · กระโปรงกรม · **แว่นกลม** | สมุดปกน้ำตาล | พีชอ่อน | `characters/` |
| อังกฤษ | หญิง ~27 นักเดินทาง | **หางม้าสูงผมดำตรง** ไม่ใส่แว่น | **แจ็กเก็ตสีฟ้าเทอร์ควอยซ์** · เสื้อยืดขาว · **ผ้าพันคอลายขาวส้ม** · กางเกงสีเบจ | ลูกโลกเล็ก / พาสปอร์ต / แฟลชการ์ด | ฟ้าอ่อน | `characters/english/` |
| วิทยาศาสตร์ | **ชาย ~30** | ผมหยักศกสั้น | **เสื้อกาวน์ขาว** ทับเสื้อโปโลเขียว · **แว่นนิรภัยเลื่อนไว้บนหัว** | บีกเกอร์น้ำเรืองแสงสีเขียว / แว่นขยาย | เขียวมิ้นต์ | `characters/science/` |
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
