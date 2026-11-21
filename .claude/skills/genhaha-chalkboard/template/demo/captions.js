// Script by shot. One chunk = one subtitle = one voice line of the teacher (a shot = one board idea, 3–9 s, 1–3 chunks).
//   t     subtitle text = what is spoken: numbers as Thai WORDS here ("หนึ่งร้อยเอ็ด"), the board shows the digits; [brackets] = accent words (yellow)
//   key   unique id, used in index.html: T.say("h1") (teacher's mouth), at("h1") line start, end("h1"), atW("h1", "word") when a word is spoken
//   say   (optional) what the voice reads if it differs from t     sfx  (optional) "pop@w:<word>" | "ding@0.4" | ["a", "b@w:…"]
//   pause (optional) extra silence before the line, seconds
// One narrator (the teacher): no `who` needed. `voice` rewrites every start/end from the real voice; the numbers below are only placeholders.
// Demo: "บวก 1 ถึง 100 ใน 5 วินาที" — 1+2+…+100 = 101 × 50 = 5050 (arithmetic); the Gauss school story is a legend → "ว่ากันว่า".
(function () {
  const SHOTS = [
    { id: "hook", start: 0, end: 4.5, chunks: [
      { t: "บวกเลขตั้งแต่หนึ่งถึงหนึ่งร้อย ต้องใช้เวลานานแค่ไหนนะ", key: "h1" },
    ]},
    { id: "timer", start: 4.5, end: 8.5, chunks: [
      { t: "ถ้าเป็นครู [ห้าวินาที]ก็เสร็จ ไม่ต้องกดเครื่องคิดเลขด้วย", key: "t1" },
    ]},
    { id: "pair", start: 8.5, end: 13.5, chunks: [
      { t: "เคล็ดลับคือ [จับคู่]ตัวหน้ากับตัวหลังสุด", key: "p1" },
      { t: "หนึ่งบวกหนึ่งร้อย ได้[หนึ่งร้อยเอ็ด]", key: "p2", sfx: "pop@w:ได้" },
    ]},
    { id: "sum", start: 13.5, end: 18.0, chunks: [
      { t: "สองบวกเก้าสิบเก้า ก็หนึ่งร้อยเอ็ด", key: "s1" },
      { t: "สามบวกเก้าสิบแปด ก็หนึ่งร้อยเอ็ดอีก", key: "s2" },
    ]},
    { id: "count", start: 18.0, end: 22.5, chunks: [
      { t: "ทุกคู่ได้เท่ากันหมด และมีทั้งหมด[ห้าสิบคู่]พอดี", key: "c1", sfx: "blip@w:ห้าสิบ" },
    ]},
    { id: "final", start: 22.5, end: 30.0, chunks: [
      { t: "หนึ่งร้อยเอ็ด คูณห้าสิบ ได้[ห้าพันห้าสิบ]", key: "f1", sfx: "ding@w:ห้าพัน" },
      { t: "ว่ากันว่า เด็กชื่อเกาส์ คิดแบบนี้ได้ตั้งแต่ยังเรียนประถม", key: "f2" },
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
        out.push({ shot: shot.id, key: c.key, text: c.t, say: c.say, who: c.who, voice: c.voice, sfx: c.sfx, pause: c.pause, start: +t.toFixed(2), end: +(t + d).toFixed(2) });
        t += d;
      });
    }
    return out;
  }

  const CAPTIONS = timeCaptions(SHOTS);
  const tts = typeof window !== "undefined" && window.TTS_TIMING;
  if (tts && tts.chunks && tts.chunks.length === CAPTIONS.length) CAPTIONS.forEach((c, i) => Object.assign(c, tts.chunks[i]));
  if (typeof module !== "undefined") module.exports = { SHOTS, CAPTIONS };
  else window.CAPTIONS = CAPTIONS;
})();
// genhaha:781c07c7ad6b
