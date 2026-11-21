// Script by shot. One chunk = one spoken line (35-60 Thai characters, SPOKEN Thai, numbers as Thai words). Keys must be unique; scene.js points at them: "@key:word".
(function () {
  const SHOTS = [
    { id: "e1", start: 0.0, end: 4.2, chunks: [{ t: "การนำไฟฟ้า คือสมบัติที่ยอมให้[กระแสไฟฟ้า]ไหลผ่านได้", key: "e1", sfx: "pop@w:กระแสไฟฟ้า" }] },
    { id: "e2", start: 4.2, end: 8.4, chunks: [{ t: "สารที่กระแสไฟฟ้าผ่านได้ดี เรียกว่า[ตัวนำไฟฟ้า]", key: "e2", sfx: "pop@w:ตัวนำไฟฟ้า" }] },
    { id: "e3", start: 8.4, end: 12.6, chunks: [{ t: "ตัวนำไฟฟ้าส่วนใหญ่เป็นโลหะ เช่น เงิน ทองแดง เหล็ก และอะลูมิเนียม", key: "e3", sfx: "pop@w:ทองแดง" }] },
    { id: "e4", start: 12.6, end: 16.8, chunks: [{ t: "เราจึงใช้[ทองแดง]ทำสายไฟ และไส้หลอดไฟ ก็ทำจากโลหะ", key: "e4", sfx: "pop@w:ทองแดง" }] },
    { id: "e5", start: 16.8, end: 21.0, chunks: [{ t: "สารที่กระแสไฟฟ้าผ่านไม่ได้ เรียกว่า[ฉนวนไฟฟ้า]", key: "e5", sfx: "pop@w:ฉนวนไฟฟ้า" }] },
    { id: "e6", start: 21.0, end: 25.2, chunks: [{ t: "ฉนวนไฟฟ้าส่วนใหญ่เป็นอโลหะ เช่น[พลาสติก] ไม้ แก้ว และกระดาษ", key: "e6", sfx: "pop@w:พลาสติก" }] },
    { id: "e7", start: 25.2, end: 29.4, chunks: [{ t: "เรานำฉนวนมาหุ้มปลั๊กไฟและ[สวิตช์ไฟ] เพื่อป้องกันไฟดูดและไฟรั่ว", key: "e7", sfx: "pop@w:สวิตช์ไฟ" }] },
    { id: "e8", start: 29.4, end: 33.6, chunks: [{ t: "ต่อมาคือ[การนำความร้อน] คือการถ่ายเทพลังงานความร้อนจากอนุภาคหนึ่งสู่อีกอนุภาค", key: "e8", sfx: "pop@w:การนำความร้อน" }] },
    { id: "e9", start: 33.6, end: 37.8, chunks: [{ t: "ความร้อนจะ[ถ่ายทอด]ต่อกัน จากอนุภาคสู่อนุภาค ไปทั่วเนื้อสาร", key: "e9", sfx: "pop@w:ถ่ายทอด" }] },
    { id: "e10", start: 37.8, end: 42.0, chunks: [{ t: "สารที่นำความร้อนได้ดี เรียกว่า[สารนำความร้อน] ส่วนใหญ่เป็นโลหะ", key: "e10", sfx: "pop@w:สารนำความร้อน" }] },
    { id: "e11", start: 42.0, end: 46.2, chunks: [{ t: "เช่น เหล็ก ทองแดง ทองเหลือง และอะลูมิเนียม เรานำมาทำ[กระทะ] กาต้มน้ำ", key: "e11", sfx: "pop@w:กระทะ" }] },
    { id: "e12", start: 46.2, end: 50.4, chunks: [{ t: "สารที่นำความร้อนได้น้อย เรียกว่า[สารไม่นำความร้อน] ส่วนใหญ่เป็นอโลหะ", key: "e12", sfx: "pop@w:สารไม่นำความร้อน" }] },
    { id: "e13", start: 50.4, end: 54.6, chunks: [{ t: "เช่น ผ้า ไม้ ยาง พลาสติก กระดาษ และ[กระเบื้อง] จึงใช้ทำด้ามหม้อได้", key: "e13", sfx: "pop@w:กระเบื้อง" }] },
    { id: "e14", start: 54.6, end: 58.8, chunks: [{ t: "ทายสิ ช้อนโลหะกับช้อนพลาสติก อันไหน[ร้อนเร็ว]กว่า", key: "e14", sfx: "pop@w:ร้อนเร็ว" }] },
    { id: "e15", start: 58.8, end: 63.0, chunks: [{ t: "ช้อน[โลหะ]ร้อนเร็วกว่า เพราะโลหะนำความร้อนได้ดี", key: "e15", sfx: "ding@w:โลหะ" }] },
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
