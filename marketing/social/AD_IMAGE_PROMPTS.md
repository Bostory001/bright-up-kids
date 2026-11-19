# prompt สร้างรูปสำหรับแอด 15 วิ (6 คัท)

ใช้คู่กับ [AD_RECRUIT_VIDEO.md](AD_RECRUIT_VIDEO.md) · คลิปต้นฉบับ [demo/video-src/ad-recruit.html](demo/video-src/ad-recruit.html)

เอา prompt ไปวางใน ChatGPT / Gemini / Midjourney ก็ได้ แล้ว **เซฟลงที่**

```
E:\Work\BrightUpKids\marketing\social\demo\video-src\assets\
```

ตั้งชื่อตามคอลัมน์ "ไฟล์" เป๊ะ ๆ แล้วสั่งเรนเดอร์รอบเดียวจบ ภาพจะเข้าคัทเองอัตโนมัติ
**ถ้ามีรูปถ่ายจริงของสาขาอยู่แล้ว ใช้รูปจริงดีกว่าเสมอ** — ผู้ปกครองแถวบางพลีดูออกว่าอันไหนของจริง รูป AI ใช้เฉพาะคัทที่ยังไม่มีรูปถ่าย

## กฎร่วมของทุกใบ (ต่อท้าย prompt ทุกอัน)

```
vertical 9:16 aspect ratio, 1080x1920, photorealistic, natural daylight, soft bright color grading,
Thai people, shallow depth of field, clean uncluttered background,
leave the upper third and lower third visually simple for text overlay,
absolutely no text, no letters, no signage, no logos, no watermark in the image
```

> ห้ามให้ AI ใส่ตัวหนังสือในรูปเด็ดขาด — ตัวหนังสือไทยที่ AI สร้างสะกดผิดเสมอ
> ในคลิปนี้ตัวหนังสือทุกตัวเป็นโค้ด จึงสะกดถูก 100% และแก้ราคา/เบอร์ได้ทีหลัง

## 6 ใบ

| คัท | ไฟล์ | เนื้อรูป |
|---|---|---|
| 1 ฮุก | `ad-01-hook.jpg` | เด็กรอหลังเลิกเรียน |
| 2 ดูแลการบ้าน | `ad-02-homework.jpg` | ครูนั่งติวการบ้าน |
| 3 อังกฤษ | `ad-03-english.jpg` | ครูต่างชาติสอนโฟนิค |
| 4 วิชา | `ad-04-subjects.jpg` | ห้องเรียนมุมกว้าง |
| 5 โปร | `ad-05-promo.jpg` | เด็กดีใจ |
| 6 ปิด | `ad-06-cta.jpg` | ครูกับเด็กยิ้มเข้ากล้อง |

### 1 · `ad-01-hook.jpg` — เด็กรอหลังเลิกเรียน

```
A Thai elementary school boy about 9 years old in a white school uniform with a backpack,
sitting alone on a bench near the school gate in late afternoon golden light,
looking down at his shoes, waiting, a little bored and lonely but not sad or distressed,
empty schoolyard softly blurred behind him, warm 4pm sunlight
```

ทำไมใบนี้: ฮุกของคลิปคือ "เลิกเรียนแล้ว ลูกไปทำการบ้านที่ไหน" — ภาพต้องตรงกับคำถามนั้นทันทีใน 2 วินาทีแรก

### 2 · `ad-02-homework.jpg` — ครูนั่งติวการบ้าน

```
A friendly young Thai female teacher in a light blue polo shirt sitting beside two Thai
elementary students at a wooden study table, pointing at an exercise book and explaining,
both children looking at the page and smiling, bright modern tutoring room,
pastel blue and yellow walls, pencils and notebooks on the table, warm natural light from a window
```

### 3 · `ad-03-english.jpg` — ครูต่างชาติสอนโฟนิค

```
A Western male native English teacher in his fifties, short grey hair, light blue shirt,
standing and teaching phonics to a small group of Thai elementary students in a bright classroom,
he is pronouncing a sound with an open mouth, children watching him attentively and copying,
colorful alphabet cards on the wall softly out of focus, cheerful friendly atmosphere
```

### 4 · `ad-04-subjects.jpg` — ห้องเรียนมุมกว้าง

```
Wide shot of a small bright tutoring classroom with four Thai elementary students
in white school uniforms sitting at individual desks working on exercise books,
a teacher walking between the desks, large windows with daylight,
pastel blue and white walls, tidy shelves of books, calm focused mood
```

### 5 · `ad-05-promo.jpg` — เด็กดีใจ

```
A Thai elementary school girl about 8 years old in a white school uniform,
raising both arms in the air celebrating with a big genuine happy smile,
holding an exercise book in one hand, bright clean classroom softly blurred behind her,
confetti-free, pure joyful energy, vivid colors
```

### 6 · `ad-06-cta.jpg` — ครูกับเด็กยิ้มเข้ากล้อง

```
A warm group portrait of a young Thai female teacher standing with three Thai elementary
students in white school uniforms, all smiling directly at the camera,
arms around each other's shoulders, bright modern tutoring room with pastel blue and yellow walls,
friendly welcoming feeling, soft even daylight
```

## สั่งเรนเดอร์หลังใส่รูปแล้ว

```bash
node capture.mjs --page=ad-recruit.html "%TEMP%/probe" 30 probe
```

```bash
node capture.mjs --page=ad-recruit.html "%TEMP%/frames" 30
```

ภาพใบไหนยังไม่มี คลิปจะใช้แผงกราฟิกแทนให้อัตโนมัติ ไม่พัง — ใส่ทีละใบแล้วเรนเดอร์ดูก็ได้
