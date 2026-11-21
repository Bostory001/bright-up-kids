// motion.js — timeline helpers for the cutout engine: caption-time lookups and karaoke subtitles.
//   const M = Motion(tl);  const { at, atW, end } = M;
//   at("h1")            start of the caption line with key "h1" (seconds)         end("h1")  its end
//   atW("h1", "ดับ")     the moment the word "ดับ" is spoken (per-character times from `cutout voice`; spread over the line before a voice exists)
//   M.subtitles()       karaoke subtitles: whole phrases stay together, never more than 2 rows, the spoken word lights up
//   M.levelAt(t)        voice loudness 0..1 at time t (null before `cutout voice`) — the presenter's mouth reads it
// Wrong keys / words are recorded as named errors (validate.js) and return 0 instead of crashing.
(function () {
  window.Motion = function (tl, opts = {}) {
    const $ = (s) => document.querySelector(s);
    const CAP = opts.captions || window.CAPTIONS || [];
    const TT = window.TTS_TIMING || {};
    const TOTAL = parseFloat($("#root").dataset.duration);
    const EASE = "power2.out";
    const keys = CAP.map((c) => c.key);
    const dym = window.CutoutDYM || (() => ""), err = window.CutoutErr || (() => {}), warn = window.CutoutWarn || (() => {});
    const line = (fn, key) => {
      const c = CAP.find((c) => c.key === key);
      if (!c) err(`${fn}("${key}"): no caption line with key "${key}" in captions.js. ${dym(key, keys)}Keys: ${keys.join(" ")}`);
      return c;
    };
    const at = (key) => { const c = line("at", key); return c ? c.start : 0; };
    const end = (key) => { const c = line("end", key); return c ? c.end : 0; };
    const atW = (key, word) => {
      const i = CAP.findIndex((c) => c.key === key), c = CAP[i];
      if (!line("atW", key)) return 0;
      const plain = c.text.replace(/[\[\]]/g, ""), idx = plain.indexOf(word);
      if (idx < 0) { warn(`atW("${key}", "${word}"): the word is not in the line "${plain}" — using the start of the line`); return c.start; }
      const cps = [...plain.slice(0, idx)].length, ch = (TT.chars || [])[i];
      return ch && ch.length === [...plain].length ? ch[cps] : c.start + (cps / [...plain].length) * (c.end - c.start - 0.25);
    };
    const S = (id) => parseFloat($(`#sc-${id}`).dataset.start);
    const D = (id) => parseFloat($(`#sc-${id}`).dataset.duration);
    const ends = (id) => S(id) + D(id);

    // ---------- voice loudness (written by `cutout voice` as TTS_TIMING.envelope, 30 samples per second) ----------
    const env = Array.isArray(TT.envelope) && TT.envelope.length ? TT.envelope : null, erate = TT.envelopeRate || 30;
    const levelAt = env ? (t) => env[Math.max(0, Math.min(env.length - 1, Math.round(t * erate)))] || 0 : null;

    // ---------- karaoke subtitles ----------
    // Rules: author-placed spaces in the line are phrase breaks; a phrase is never cut unless it is wider than a row, then it breaks between dictionary words.
    // Rows are measured in the real font; if a line needs more than 2 rows the text shrinks (70 -> 50 px). Row width 840 px (safe area: nothing right of x 960).
    const SIZES = [70, 64, 58, 52, 46], MAXW = 840;
    const subtitles = () => {
      const vars = (() => { try { return window.__hyperframes?.getVariables?.() || {}; } catch { return {}; } })();
      const host = $("#captions");
      if (vars.subtitles === false) { host.style.display = "none"; return; }
      const CH = TT.chars || [];
      const LANG = document.documentElement.lang || "th";
      const seg = new Intl.Segmenter(LANG, { granularity: "word" });
      const glyphs = (s) => [...s].filter((ch) => !/[ัิ-ฺ็-๎]/.test(ch)).length;   // base letters only (vowel / tone marks take no width)
      const pieces = (s) => {   // dictionary words of one phrase (punctuation glued to the word before), merged to units of >= 4 letters so the reveal never shows a stub like "การ"
        if (LANG !== "th") return [s];
        const raw = [];
        for (const { segment, isWordLike } of seg.segment(s)) {
          if (!isWordLike && segment.trim() && raw.length) raw[raw.length - 1] += segment; else raw.push(segment);
        }
        const out = [];
        let cur = "";
        for (const p of raw) { cur += p; if (glyphs(cur) >= 4) { out.push(cur); cur = ""; } }
        if (cur) { if (out.length) out[out.length - 1] += cur; else out.push(cur); }
        return out;
      };
      const els = [];
      CAP.forEach((c, i) => {
        const src = c.sub ?? c.text, plain = [], hl = [];
        let inHl = false;
        for (const ch of src) { if (ch === "[") inHl = true; else if (ch === "]") inHl = false; else { plain.push(ch); hl.push(inHl); } }
        const times = c.sub == null && CH[i] && CH[i].length === plain.length ? CH[i]
          : plain.map((_, k) => c.start + (k / Math.max(1, plain.length)) * Math.max(0.3, c.end - c.start - 0.25));
        const el = document.createElement("div"); el.className = "cap"; el.id = `cap-${i}`;
        const row = document.createElement("span"); row.className = "line";
        const words = [];
        // split into phrases at whitespace; keep each phrase's index range so word times stay exact
        let idx = 0;
        const phrases = plain.join("").split(/(\s+)/);
        for (const ph of phrases) {
          const n = [...ph].length;
          if (!ph.trim()) { idx += n; continue; }
          const box = document.createElement("span"); box.className = "ph";
          let k = idx;
          for (const piece of pieces(ph)) {
            const w = document.createElement("span"); w.className = "w" + (hl[k] ? " hl" : ""); w.textContent = piece; box.appendChild(w);
            words.push({ w, t: times[k] }); k += [...piece].length;
          }
          row.appendChild(box); idx += n;
        }
        el.appendChild(row); host.appendChild(el);
        tl.fromTo(el, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.2, ease: EASE }, c.start);
        tl.set(el, { opacity: 0 }, c.end);
        words.forEach(({ w, t }, k) => {
          const t0 = Math.max(c.start, t - 0.04), nt = k + 1 < words.length ? Math.max(t0 + 0.12, words[k + 1].t - 0.04) : Math.min(c.end, t0 + 0.45);
          tl.fromTo(w, { opacity: 0, y: 14, scale: 0.85 }, { opacity: 1, y: 0, scale: 1, duration: 0.14, ease: "back.out(2.2)" }, t0);
          if (!w.classList.contains("hl")) { tl.set(w, { color: "var(--accent)" }, t0); tl.set(w, { color: "#fff" }, nt); }   // the word being spoken lights up, then settles to white
        });
        els.push({ el, row });
      });
      // fit: at most 2 rows, never wider than a row. Runs now and again when the font has loaded (static styles only — no time dependence).
      const fit = () => {
        for (const { el, row } of els) {
          let ok = false;
          for (const mode of ["phrase", "word"]) {
            row.classList.toggle("wordwrap", mode === "word");
            for (const px of SIZES) {
              row.style.fontSize = px + "px";
              const ws = [...row.querySelectorAll(".w")], tops = new Set(ws.map((w) => Math.round(w.offsetTop / 20)));
              const wide = Math.max(...[...row.querySelectorAll(".ph")].map((p) => p.getBoundingClientRect().width), 0) > MAXW + 2 && mode === "phrase";
              if (tops.size <= 2 && !wide) { ok = true; break; }
            }
            if (ok) break;
          }
        }
      };
      fit();
      if (document.fonts) { document.fonts.load('800 70px Kanit').catch(() => {}); document.fonts.ready.then(fit); }
    };

    return { $, CAP, TOTAL, EASE, at, end, atW, S, D, ends, levelAt, subtitles };
  };
})();
// genhaha:5f8f980bb7f3
