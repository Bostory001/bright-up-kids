// Script + subtitles, grouped by shot. One chunk = one subtitle line = one voice line.
//   t      subtitle text; [brackets] = accent words (blue, never split across word pops)
//   key    unique id, used by B("a1") / B("a1","word") in index.html
//   say    (optional) what the voice reads if it differs from t (numbers, abbreviations) — keep it close to t
//   voice  (optional) edge-tts voice for this line only: "en" = video.json → voice.english (English example sentences), or a full name
//   sfx    (optional) soft sound on a word: "pop@w:<word>" | "tick@0.4" (seconds after the line starts) | ["a", "b@w:…"]
//          add "|L" / "|R" for pan, "*1.5" for gain. Sounds: `lesson sfx --list`
//   pause  (optional) extra silence before the line, seconds
// `lesson voice` rewrites every start/end from the real voice; the numbers below are placeholders.
(function () {
  const SHOTS = [
    { id: "hook", start: 0, end: 1, chunks: [ { t: "[am] [is] [are] ใช้ยังไง?", key: "a1", sfx: "pop@0.1" } ]},
    { id: "i1", start: 0, end: 1, chunks: [
      { t: "[am] ใช้กับ I เท่านั้น", key: "b1" },
      { t: "I [am] a student.", key: "b1x", voice: "en", pause: 0.9, sfx: "pop@0.05" },
    ]},
    { id: "i2", start: 0, end: 1, chunks: [
      { t: "[is] ใช้กับ คนเดียว หรือ สิ่งเดียว", key: "b2" },
      { t: "She [is] my teacher.", key: "b2x", voice: "en", pause: 0.9, sfx: "pop@0.05" },
    ]},
    { id: "i3", start: 0, end: 1, chunks: [
      { t: "[are] ใช้กับ หลายคน และ คนที่เราคุยด้วย", key: "b3" },
      { t: "They [are] my friends.", key: "b3x", voice: "en", pause: 0.9, sfx: "pop@0.05" },
    ]},
    { id: "tip", start: 0, end: 1, chunks: [
      { t: "ปฏิเสธ ให้เติม [not] หลัง be", key: "g1", sfx: "ding@0.3" },
      { t: "ถามคำถาม ให้ย้าย be ไปไว้หน้าประโยค", key: "g2", pause: 0.4 },
    ]},
    { id: "end", start: 0, end: 1, chunks: [ { t: "เซฟไว้ทบทวน แล้วกดฟอลโลว์นะ", key: "h1", pause: 0.6, sfx: "chime@0.1" } ]},
  ];

  function timeCaptions(shots) {
    const out = [];
    for (const shot of shots) {
      const weights = shot.chunks.map((c) => c.t.replace(/[\[\]\s]/g, "").length + 6);
      const total = weights.reduce((a, b) => a + b, 0);
      let t = shot.start;
      shot.chunks.forEach((c, i) => {
        const d = ((shot.end - shot.start) * weights[i]) / total;
        out.push({ shot: shot.id, key: c.key, text: c.t, say: c.say, voice: c.voice, sfx: c.sfx, pause: c.pause, start: +t.toFixed(2), end: +(t + d).toFixed(2) });
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
// genhaha:ed34a05c8342
