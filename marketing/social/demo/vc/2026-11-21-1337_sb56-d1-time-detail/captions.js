// Script by shot. One chunk = one spoken line (35-60 Thai characters, SPOKEN Thai, numbers as Thai words). Keys must be unique; scene.js points at them: "@key:word".
(function () {
  const SHOTS = [
    { id: "e1", start: 0.0, end: 4.2, chunks: [{ t: "[เวลาบนโลก]มีหลายแบบ วันนี้มาเรียนแบบละเอียดกัน", key: "e1", sfx: "pop@w:เวลาบนโลก" }] },
    { id: "e2", start: 4.2, end: 8.4, chunks: [{ t: "โลกหมุนรอบตัวเองครบรอบ ใช้เวลา[ยี่สิบสี่ชั่วโมง]", key: "e2", sfx: "pop@w:ยี่สิบสี่" }] },
    { id: "e3", start: 8.4, end: 12.6, chunks: [{ t: "เราจึงแบ่งโลกเป็น[ยี่สิบสี่เขต] ตามเส้นลองจิจูด", key: "e3", sfx: "pop@w:ยี่สิบสี่เขต" }] },
    { id: "e4", start: 12.6, end: 16.8, chunks: [{ t: "แต่ละเขตกว้างสิบห้าองศา เพราะสามร้อยหกสิบ[หาร]ยี่สิบสี่ได้สิบห้า", key: "e4", sfx: "pop@w:หาร" }] },
    { id: "e5", start: 16.8, end: 21.0, chunks: [{ t: "ข้ามหนึ่งเขต เวลาจะต่างกัน[หนึ่งชั่วโมง]", key: "e5", sfx: "pop@w:หนึ่งชั่วโมง" }] },
    { id: "e6", start: 21.0, end: 25.2, chunks: [{ t: "เขตแรกมีเส้นเมอริเดียนแรก คือลองจิจูด[ศูนย์องศา]", key: "e6", sfx: "pop@w:ศูนย์องศา" }] },
    { id: "e7", start: 25.2, end: 29.4, chunks: [{ t: "เวลามีสามแบบ แบบแรกคือ[เวลามาตรฐาน] ของแต่ละประเทศ", key: "e7", sfx: "pop@w:เวลามาตรฐาน" }] },
    { id: "e8", start: 29.4, end: 33.6, chunks: [{ t: "ไทยใช้ลองจิจูดหนึ่งร้อยห้าองศาตะวันออก เร็วกว่าสากล[เจ็ดชั่วโมง]", key: "e8", sfx: "pop@w:เจ็ดชั่วโมง" }] },
    { id: "e9", start: 33.6, end: 37.8, chunks: [{ t: "ประเทศใหญ่มากอย่างรัสเซียกับอเมริกา มี[หลายเวลา] ตามพื้นที่", key: "e9", sfx: "pop@w:หลายเวลา" }] },
    { id: "e10", start: 37.8, end: 42.0, chunks: [{ t: "แบบที่สองคือ[เวลามาตรฐานสากล] ใช้ลองจิจูดศูนย์องศา ตามเวลากรีนิช", key: "e10", sfx: "pop@w:เวลามาตรฐานสากล" }] },
    { id: "e11", start: 42.0, end: 46.2, chunks: [{ t: "แบบที่สามคือ[เวลาท้องถิ่น] นับตามลองจิจูดของที่นั่นจริงๆ", key: "e11", sfx: "pop@w:เวลาท้องถิ่น" }] },
    { id: "e12", start: 46.2, end: 50.4, chunks: [{ t: "เช่นอุบลราชธานี อยู่ราวหนึ่งร้อยห้าองศา จึงเร็วกว่าสากลราว[เจ็ดชั่วโมง]", key: "e12", sfx: "pop@w:เจ็ดชั่วโมง" }] },
    { id: "e13", start: 50.4, end: 54.6, chunks: [{ t: "สรุป เวลามีสามแบบ คือ[มาตรฐาน] สากล และท้องถิ่น", key: "e13", sfx: "pop@w:มาตรฐาน" }] },
    { id: "e14", start: 54.6, end: 58.8, chunks: [{ t: "ลองถามครูดูสิ ว่าตอนนี้ที่[ลอนดอน]เป็นกี่โมงแล้ว", key: "e14", sfx: "ding@w:ลอนดอน" }] },
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
