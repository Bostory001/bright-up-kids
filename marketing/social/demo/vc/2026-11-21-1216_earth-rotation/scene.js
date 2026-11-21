// variety-captions - "โลกหมุนรอบตัวเอง เกิดอะไรขึ้นบ้าง" (ป.4-6 วิทย์): hook, 24 ชม., กลางวัน-กลางคืน, อาทิตย์ขึ้น-ตก, เงา, อุณหภูมิ, ดาวเคลื่อน, สรุป
// DATA ONLY.
window.VC_SCENE = {
  palette: "pop", bg: "rays", cam: "punch", seed: 7, flash: true,
  lines: {
    e1: { cap: ["รู้ไหมว่าโลกหมุน", "รอบตัวเองอยู่ตลอดเวลา", "แล้วมันทำให้เกิดอะไรบ้าง"] },
    e2: { cap: ["โลกหมุนจากทิศตะวันตก", "ไปทิศตะวันออก", "ครบหนึ่งรอบใช้เวลาประมาณ", ["24 ชั่วโมง", "ยี่สิบสี่ชั่วโมง"]] },
    e3: { cap: ["ข้อ 1 ด้านที่หันหาดวงอาทิตย์", "เป็นกลางวัน", "ด้านที่หันหนีเป็นกลางคืน"] },
    e4: { cap: ["ข้อ 2 เราเห็นดวงอาทิตย์", "ขึ้นทางทิศตะวันออก", "แล้วตกทางทิศตะวันตก"] },
    e5: { cap: ["ข้อ 3 เงาของต้นไม้", "เปลี่ยนทิศทางและความยาว", "ไปตลอดวัน"] },
    e6: { cap: ["ข้อ 4 อุณหภูมิเปลี่ยนไปตามเวลา", "กลางวันร้อน", "กลางคืนเย็นลง"] },
    e7: { cap: ["ข้อ 5 ดาวดูเหมือนเคลื่อนที่", "ไปทางตะวันตก", "ทั้งที่จริงโลกต่างหากที่หมุน"] },
    e8: { cap: ["สรุปคือ โลกหมุนรอบตัวเอง", "จึงมีกลางวันกลางคืน", "พรุ่งนี้ลองสังเกตเงาตัวเองดูนะ"] },
  },
  shots: {
    e1: { cam: "punch", items: [
      { art: "ring", x: 540, y: 1040, s: 2.6, color: "blue", at: 0.1 },
      { art: "arrowcurve", x: 540, y: 1040, s: 2.0, color: "yellow", anim: "spin", idle: "spin", at: 0.2 },
      { cap: "โลกหมุน!", kind: "bounce", y: 440, size: 230, color: "yellow", at: "@e1:โลกหมุน" },
      { cap: "รู้ไหมว่า", kind: "aside", y: 320, size: 80, color: "pink", at: 0.15, until: "@e1:โลกหมุน-0.1" },
      { fx: "sparkles", x: 540, y: 1040, r: 380, at: "@e1:อะไรบ้าง" } ] },
    e2: { cam: "whip", bg: "dots", items: [
      { art: "clock", x: 540, y: 1030, s: 2.6, anim: "pop", at: 0.1 },
      { cap: "ตะวันตก → ตะวันออก", kind: "aside", y: 320, size: 72, color: "blue", at: 0.15, until: "@e2:ยี่สิบสี่-0.1" },
      { cap: "24 ชั่วโมง", kind: "counter", y: 560, size: 200, color: "yellow", from: 0, to: 24, dur: 0.7, suffix: " ชม.", at: "@e2:ยี่สิบสี่" } ] },
    e3: { cam: "punch", bg: "rays", items: [
      { art: "sun", x: 330, y: 1170, s: 1.9, face: "happy", anim: "pop", at: 0.1 },
      { art: "moon", x: 780, y: 1130, s: 2.2, anim: "pop", at: "@e3:กลางคืน-0.3" },
      { cap: "ข้อ 1", kind: "tilt", y: 385, size: 110, color: "yellow", at: 0.15, until: "@e3:กลางวัน-0.1" },
      { cap: "กลางวัน", kind: "burst", y: 470, size: 150, color: "orange", at: "@e3:กลางวัน" },
      { cap: "กลางคืน", kind: "stamp", y: 800, size: 130, color: "purple", at: "@e3:กลางคืน" } ] },
    e4: { cam: "push", bg: "waves", items: [
      { art: "sun", x: 540, y: 1040, s: 2.6, face: "wink", anim: "slide-l", at: 0.1 },
      { art: "arrow", x: 800, y: 1000, s: 0.9, color: "red", at: "@e4:ตก" },
      { cap: "ข้อ 2", kind: "tilt", y: 385, size: 110, color: "yellow", at: 0.15, until: "@e4:เห็น-0.1" },
      { cap: "ขึ้น ตะวันออก", kind: "swipe", y: 520, size: 120, color: "yellow", at: "@e4:ขึ้นทาง" },
      { cap: "ตก ตะวันตก", kind: "swipe", y: 720, size: 120, color: "pink", at: "@e4:ตกทาง" } ] },
    e5: { cam: "drift", bg: "stripes", items: [
      { art: "sun", x: 300, y: 1130, s: 1.5, face: "smirk", at: 0.1 },
      { art: "arrowcurve", x: 700, y: 1180, s: 1.6, color: "white", anim: "pop", idle: "wiggle", at: "@e5:เปลี่ยน" },
      { cap: "ข้อ 3", kind: "tilt", y: 385, size: 110, color: "yellow", at: 0.15, until: "@e5:เงา-0.1" },
      { cap: "เงาเปลี่ยน!", kind: "shake", y: 520, size: 190, color: "blue", at: "@e5:เงา" },
      { cap: "ทิศทาง|ความยาว", kind: "stack", y: 760, size: 120, colors: ["yellow", "lime"], at: ["@e5:ทิศทาง", "@e5:ความยาว"] } ] },
    e6: { cam: "whip", bg: "checker", items: [
      { art: "flame", x: 330, y: 1170, s: 2.0, face: "happy", anim: "pop", idle: "pulse", at: "@e6:ร้อน-0.2" },
      { art: "snowflake", x: 770, y: 1170, s: 2.0, color: "blue", anim: "spin", idle: "float", at: "@e6:เย็น-0.2" },
      { cap: "ข้อ 4", kind: "tilt", y: 385, size: 110, color: "yellow", at: 0.15, until: "@e6:ร้อน-0.1" },
      { cap: "กลางวันร้อน", kind: "burst", y: 470, size: 140, color: "orange", at: "@e6:ร้อน" },
      { cap: "กลางคืนเย็น", kind: "swipe", y: 780, size: 120, color: "blue", at: "@e6:เย็นลง-0.2" } ] },
    e7: { cam: "push", bg: "dots", items: [
      { art: "star", x: 300, y: 1150, s: 1.4, anim: "pop", idle: "pulse", at: 0.1 },
      { art: "star", x: 560, y: 1080, s: 0.9, anim: "pop", idle: "pulse", at: 0.3 },
      { art: "star", x: 800, y: 1200, s: 1.2, anim: "pop", idle: "pulse", at: 0.5 },
      { art: "sparkle", x: 540, y: 1230, s: 1.4, idle: "spin", at: 0.4 },
      { cap: "ข้อ 5", kind: "tilt", y: 385, size: 110, color: "yellow", at: 0.15, until: "@e7:ดาว-0.1" },
      { cap: "ดาวเคลื่อนที่?", kind: "shake", y: 540, size: 150, color: "pink", at: "@e7:ดาว" },
      { cap: "โลกต่างหาก!", kind: "stamp", y: 740, size: 140, color: "lime", at: "@e7:ต่างหาก" } ] },
    e8: { cam: "pull", bg: "rays", items: [
      { art: "sun", x: 330, y: 1040, s: 1.7, face: "happy", anim: "pop", at: 0.1 },
      { art: "moon", x: 780, y: 1040, s: 2.2, anim: "pop", at: 0.3 },
      { cap: "สรุป", kind: "aside", y: 320, size: 80, color: "yellow", at: 0.15, until: "@e8:จึงมี-0.1" },
      { cap: "กลางวัน|กลางคืน", kind: "stack", y: 560, size: 150, colors: ["orange", "purple"], at: ["@e8:กลางวัน", "@e8:กลางคืน"] },
      { fx: "confetti", at: "@e8:ลอง" } ] },
  },
};
