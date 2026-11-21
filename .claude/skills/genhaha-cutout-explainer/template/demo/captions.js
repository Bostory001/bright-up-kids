// Script by shot. One chunk = one spoken line = one karaoke line; the SPOKEN Thai goes here (numbers as Thai words).
// Spaces inside a line are phrase breaks: a phrase is never cut across two subtitle rows, the spoken word lights up. Keep a line <= ~22 Thai characters (max 2 rows).
// Shots >= 3 s each (4-6 s is good): `cutout voice` speaks about 14.4 Thai characters per second, retimes the shots to the voice and measures the loudness the mouth follows.
// Per line: key (used by at("key") / atW("key","word") / hero.say("key")), t (shown + spoken), say (spoken text if different), pause (s of silence before), sfx ("boom" | "pop@w:word" | [..]; names: cutout sfx --list).
// "[word]" in t = accent colour in the subtitle (not spoken differently).
(function () {
  const SHOTS = [
    { id: "hook", start: 0, end: 6.0, chunks: [
      { t: "ตื่นเช้ามา ไฟดับ", key: "h1", emo: "worried", pause: 0.6, sfx: "pop" },
      { t: "แล้วมือถือ ก็ดับด้วย", key: "h2", emo: "shocked", pause: 0.3 },
    ]},
    { id: "phone", start: 6.0, end: 11.0, chunks: [
      { t: "ไม่มีเน็ต ไม่มีโทรศัพท์", key: "p1", emo: "playful", pause: 0.4 },
      { t: "ติดต่อใคร ไม่ได้เลย", key: "p2", emo: "worried", pause: 0.3 },
      { t: "ข้อความ ก็ไม่เด้ง ด้วย", key: "p3", emo: "playful", pause: 0.4 },
    ]},
    { id: "fridge", start: 11.0, end: 17.0, chunks: [
      { t: "ตู้เย็น หยุดทำงาน", key: "f1", emo: "dramatic", pause: 0.5 },
      { t: "ของสด เริ่มเน่า", key: "f2", emo: "shocked", pause: 0.3, sfx: "boom" },
    ]},
    { id: "tap", start: 17.0, end: 22.0, chunks: [
      { t: "เปิดก๊อก ไม่มีน้ำ", key: "w1", emo: "worried", pause: 0.4 },
      { t: "เพราะปั๊มน้ำ ใช้ไฟฟ้า", key: "w2", emo: "dramatic", pause: 0.3, sfx: "pop" },
    ]},
    { id: "road", start: 22.0, end: 27.0, chunks: [
      { t: "ไฟจราจร ดับหมด", key: "r1", emo: "excited", pause: 0.4 },
      { t: "รถติด ยาวสุดสาย", key: "r2", emo: "playful", pause: 0.3 },
      { t: "ทุกคน ยืนงง กลางถนน", key: "r3", emo: "deadpan", pause: 0.5 },
    ]},
    { id: "split", start: 27.0, end: 33.0, chunks: [
      { t: "ตู้เอทีเอ็ม กดเงินไม่ได้", key: "s1", emo: "deadpan", pause: 0.4 },
      { t: "โรงพยาบาล ใช้ไฟสำรอง", key: "s2", emo: "warm", pause: 0.3, sfx: "ding" },
      { t: "ไฟสำรอง จึงสำคัญ มาก", key: "s3", emo: "warm", pause: 0.4 },
    ]},
    { id: "candle", start: 33.0, end: 38.0, chunks: [
      { t: "ค่ำแล้ว ก็จุดเทียน", key: "k1", emo: "warm", pause: 0.4 },
      { t: "แสงเทียน โรแมนติก ไปอีก", key: "k2", emo: "playful", pause: 0.3 },
      { t: "ไม่มีทีวี ก็คุยกัน แทน", key: "k3", emo: "warm", pause: 0.5 },
    ]},
    { id: "city", start: 38.0, end: 44.0, chunks: [
      { t: "ทั้งเมือง มืดสนิท", key: "m1", emo: "dramatic", pause: 0.7 },
      { t: "แต่ได้เห็น ดาวเต็มฟ้า", key: "m2", emo: "excited", pause: 0.5, sfx: "sparkle" },
      { t: "เมืองไม่หลับ ได้พักบ้าง", key: "m3", emo: "warm", pause: 0.6 },
    ]},
    { id: "four", start: 44.0, end: 50.0, chunks: [
      { t: "ไฟฟ้า คือ แสงสว่าง ความเย็น", key: "g1", emo: "playful", pause: 0.3 },
      { t: "การสื่อสาร และการเดินทาง", key: "g2", emo: "excited", pause: 0.3 },
      { t: "ทุกอย่าง พึ่งไฟฟ้า หมดเลย", key: "g3", emo: "playful", pause: 0.4 },
    ]},
    { id: "outro", start: 50.0, end: 56.0, chunks: [
      { t: "ตัดทิ้งได้ อย่างเดียว", key: "o1", emo: "playful", pause: 0.6 },
      { t: "คุณเลือก อะไร คอมเมนต์เลย", key: "o2", emo: "excited", pause: 0.3, sfx: "ding" },
    ]},
  ];

  function timeCaptions(shots) {
    const out = [];
    for (const shot of shots) {
      const weights = shot.chunks.map((c) => c.t.replace(/[\[\]\s]/g, "").length + 6);
      const total = weights.reduce((a, b) => a + b, 0);
      let t = shot.start;
      shot.chunks.forEach((c, i) => {
        const d = ((shot.end - shot.start) * weights[i]) / total;
        out.push({ shot: shot.id, key: c.key, text: c.t, sub: c.sub, emo: c.emo, tag: c.tag, say: c.say, who: c.who, pose: c.pose, face: c.face, act: c.act, sfx: c.sfx, pause: c.pause, start: +t.toFixed(2), end: +(t + d).toFixed(2) });
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
// genhaha:5f8f980bb7f3
