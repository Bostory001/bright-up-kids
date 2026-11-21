// Script by shot. One chunk = one spoken line (35-60 Thai characters, SPOKEN Thai, numbers as Thai words). Keys must be unique; scene.js points at them: "@key:word".
(function () {
  const SHOTS = [
    { id: "e1", start: 0.0, end: 4.2, chunks: [{ t: "ลองนึกถึงน้ำเกลือ น้ำหวาน น้ำอัดลม ทั้งหมดนี้คือ[สารละลาย]", key: "e1", sfx: "pop@w:สารละลาย" }] },
    { id: "e2", start: 4.2, end: 8.4, chunks: [{ t: "สารละลาย คือสารเนื้อเดียว ที่เกิดจากสาร[สองชนิดขึ้นไป]มารวมกัน", key: "e2", sfx: "pop@w:สองชนิดขึ้นไป" }] },
    { id: "e3", start: 8.4, end: 12.6, chunks: [{ t: "และมีสมบัติ[เหมือนกัน]ทุกส่วน จึงดูเป็นเนื้อเดียว", key: "e3", sfx: "pop@w:เหมือนกัน" }] },
    { id: "e4", start: 12.6, end: 16.8, chunks: [{ t: "สารละลายมีสองส่วน คือ[ตัวละลาย]กับตัวทำละลาย", key: "e4", sfx: "pop@w:ตัวละลาย" }] },
    { id: "e5", start: 16.8, end: 21.0, chunks: [{ t: "ตัวทำละลายคือสารที่ละลายสารอื่น ส่วนตัวละลายคือสารที่[ถูกละลาย]", key: "e5", sfx: "pop@w:ถูกละลาย" }] },
    { id: "e6", start: 21.0, end: 25.2, chunks: [{ t: "เช่น น้ำตาลทรายละลายน้ำ น้ำเป็น[ตัวทำละลาย] น้ำตาลเป็นตัวละลาย", key: "e6", sfx: "pop@w:ตัวทำละลาย" }] },
    { id: "e7", start: 25.2, end: 29.4, chunks: [{ t: "ถ้าสารสองอย่างเป็นสถานะเดียวกัน สารที่ปริมาณ[มากกว่า] จะเป็นตัวทำละลาย", key: "e7", sfx: "pop@w:มากกว่า" }] },
    { id: "e8", start: 29.4, end: 33.6, chunks: [{ t: "เช่น แอลกอฮอล์ล้างแผล มีแอลกอฮอล์[เจ็ดสิบ] น้ำสามสิบ แอลกอฮอล์จึงเป็นตัวทำละลาย", key: "e8", sfx: "pop@w:เจ็ดสิบ" }] },
    { id: "e9", start: 33.6, end: 37.8, chunks: [{ t: "ถ้าสถานะต่างกัน ตัวทำละลายจะมีสถานะ[เดียวกับสารละลาย] เช่น น้ำเชื่อมที่เป็นของเหลว", key: "e9", sfx: "pop@w:เดียวกับสารละลาย" }] },
    { id: "e10", start: 37.8, end: 42.0, chunks: [{ t: "สารละลายแบ่งตามสถานะได้ เป็น[ของแข็ง] ของเหลว และแก๊ส", key: "e10", sfx: "pop@w:ของแข็ง" }] },
    { id: "e11", start: 42.0, end: 46.2, chunks: [{ t: "สารละลายของแข็ง เช่น[ทองเหลือง] คือทองแดงผสมสังกะสี ทองแดงเป็นตัวทำละลาย", key: "e11", sfx: "pop@w:ทองเหลือง" }] },
    { id: "e12", start: 46.2, end: 50.4, chunks: [{ t: "ทองสัมฤทธิ์คือทองแดงผสมดีบุก ส่วนนากคือโลหะผสมของทองคำ ทองแดง และเงิน", key: "e12", sfx: "pop@w:ทองสัมฤทธิ์" }] },
    { id: "e13", start: 50.4, end: 54.6, chunks: [{ t: "สารละลายของเหลว เช่น น้ำเกลือ น้ำส้มสายชู น้ำเชื่อม ล้วน[มีน้ำ]เป็นตัวทำละลาย", key: "e13", sfx: "pop@w:มีน้ำ" }] },
    { id: "e14", start: 54.6, end: 58.8, chunks: [{ t: "สารละลายแก๊ส เช่น อากาศ มีแก๊สไนโตรเจนเป็น[ตัวทำละลาย]", key: "e14", sfx: "pop@w:ตัวทำละลาย" }] },
    { id: "e15", start: 58.8, end: 63.0, chunks: [{ t: "ถ้าจำแนกตามปริมาณตัวละลาย จะมี[สารละลายอิ่มตัว] กับสารละลายไม่อิ่มตัว", key: "e15", sfx: "pop@w:สารละลายอิ่มตัว" }] },
    { id: "e16", start: 63.0, end: 67.2, chunks: [{ t: "อิ่มตัวคือ ตัวละลายละลายเพิ่มในตัวทำละลายได้[ไม่ได้อีก] ถ้าอุณหภูมิไม่เปลี่ยน", key: "e16", sfx: "pop@w:ไม่ได้อีก" }] },
    { id: "e17", start: 67.2, end: 71.4, chunks: [{ t: "ส่วนสารละลายไม่อิ่มตัว ยังละลายตัวละลาย[เพิ่ม]ได้อีก", key: "e17", sfx: "pop@w:เพิ่ม" }] },
    { id: "e18", start: 71.4, end: 75.6, chunks: [{ t: "ถ้าจำแนกตามความเข้มข้น มี[สารละลายเข้มข้น] และสารละลายเจือจาง", key: "e18", sfx: "pop@w:สารละลายเข้มข้น" }] },
    { id: "e19", start: 75.6, end: 79.8, chunks: [{ t: "เข้มข้นมี[ตัวละลายมาก] ส่วนเจือจางมีตัวละลายน้อย", key: "e19", sfx: "pop@w:ตัวละลายมาก" }] },
    { id: "e20", start: 79.8, end: 84.0, chunks: [{ t: "ลองสังเกตตอนชงน้ำหวาน ใส่น้ำตาลมากก็[เข้มข้นขึ้น]", key: "e20", sfx: "ding@w:เข้มข้นขึ้น" }] },
  ];
  function timeCaptions(shots) {
    const out = [];
    for (const shot of shots) {
      const weights = shot.chunks.map((c) => c.t.replace(/[\[\]\s]/g, "").length + 6);
      const total = weights.reduce((a, b) => a + b, 0);
      let t = shot.start;
      shot.chunks.forEach((c, i) => {
        const d = ((shot.end - shot.start) * weights[i]) / total;
        out.push({ shot: shot.id, key: c.key, text: c.t, cap: c.cap, en: c.en, hi: c.hi, emo: c.emo, say: c.say, sfx: c.sfx, pause: c.pause, start: +t.toFixed(2), end: +(t + d).toFixed(2) });
        t += d;
      });
    }
    return out;
  }
  const CAPTIONS = timeCaptions(SHOTS);
  const tts = typeof window !== "undefined" && window.TTS_TIMING;
  if (tts && tts.chunks.length === CAPTIONS.length) CAPTIONS.forEach((c, i) => Object.assign(c, tts.chunks[i]));
  if (typeof module !== "undefined") module.exports = { SHOTS, CAPTIONS };
  else window.CAPTIONS = CAPTIONS;
})();
// genhaha:4846ca29f0d0
