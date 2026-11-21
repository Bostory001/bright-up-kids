// motion.js — timeline helpers for lesson projects (HyperFrames + GSAP): time lookups from captions.js + karaoke subtitles.
//
//   const tl = gsap.timeline({ paused: true });
//   const M = Motion(tl);                       // after timing.js + captions.js
//   const { at, end, atW, S, D, slam, hide } = M;
//   const L = Lesson(tl, M);                    // lesson.js blocks: L.hook / define / tiles / example / compare / steps / tip / outro
//   M.subtitles();                              // karaoke subtitles (word pop-in from timing.js chars)
//   window.__timelines["main"] = tl; tl.seek(0); // keep this line in index.html (hyperframes check looks for it there)
//
// HyperFrames rules: deterministic only (never Math.random / Date.now), animate x / y / scale / opacity of children,
// never tween a .clip element's own opacity or visibility.
(function () {
  window.Motion = function (tl, opts = {}) {
    const $ = (s) => document.querySelector(s);
    const $$ = (s) => Array.from(document.querySelectorAll(s));
    const CAP = opts.captions || window.CAPTIONS;
    const TT = window.TTS_TIMING || {};
    const TOTAL = parseFloat($("#root").dataset.duration);
    const EASE = "power2.out";

    // ---------- time lookups (seconds) ----------
    const cap = (key) => { const c = CAP.find((c) => c.key === key); if (!c) throw new Error(`no caption key "${key}"`); return c; };
    const at = (key) => cap(key).start;            // line starts
    const end = (key) => cap(key).end;             // subtitle ends
    // when a word of a line is spoken (timing.js chars from `pv voice`; else spread over the line)
    const atW = (key, word) => {
      const i = CAP.findIndex((c) => c.key === key), c = CAP[i];
      if (!c) throw new Error(`no caption key "${key}"`);
      const plain = c.text.replace(/[\[\]]/g, ""), idx = plain.indexOf(word);
      if (idx < 0) { console.warn(`atW: "${word}" not in line ${key}`); return c.start; }
      const cps = [...plain.slice(0, idx)].length, ch = (TT.chars || [])[i];
      return ch && ch.length === [...plain].length ? ch[cps] : c.start + (cps / [...plain].length) * (c.end - c.start - 0.25);
    };
    const S = (id) => parseFloat($(`#sc-${id}`).dataset.start);
    const D = (id) => parseFloat($(`#sc-${id}`).dataset.duration);
    const ends = (id) => S(id) + D(id);
    let seed = 7;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };

    // ---------- motion vocabulary for HTML labels ----------
    const reveal = (sel, t, d = 0.6) => tl.fromTo(sel, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: d, ease: EASE, stagger: 0.12 }, t);
    const hide = (sel, t, d = 0.25) => tl.to(sel, { opacity: 0, duration: d, ease: "power1.inOut" }, t);
    const pop = (sel, t) => tl.fromTo(sel, { opacity: 0, x: -30, scale: 0.9 }, { opacity: 1, x: 0, scale: 1, duration: 0.3, ease: "back.out(2)" }, t);
    const slam = (sel, t) => tl.fromTo(sel, { opacity: 0, scale: 1.6 }, { opacity: 1, scale: 1, duration: 0.28, ease: "back.out(2.2)" }, t);
    const shake = (sel, t, amp = 14) => tl.fromTo(sel, { x: 0, y: 0 }, { keyframes: [[amp, -amp * 0.6], [-amp, amp * 0.5], [amp * 0.6, amp * 0.3], [-amp * 0.4, -amp * 0.2], [0, 0]].map(([x, y]) => ({ x, y, duration: 0.05 })) }, t);
    const punch = (sel, t, to = 1.12, d = 0.25) => tl.fromTo(sel, { scale: 1 }, { scale: to, duration: d, ease: "power3.out" }, t);
    const echo = (sel, t, hold = 0.9) => tl.fromTo(sel, { opacity: 0, scale: 1.25 }, { keyframes: [{ opacity: 1, scale: 1, duration: 0.18, ease: "power3.out" }, { opacity: 1, duration: hold }, { opacity: 0, duration: 0.6 }] }, t);
    // number that counts up inside a label: count("#n", 0, 284, t, 1.0)
    const count = (sel, from, to, t, d = 1.0, dec = 0, suffix = "") => { const o = { v: from }; tl.to(o, { v: to, duration: d, ease: "power2.out", onUpdate: () => { $(sel).textContent = o.v.toFixed(dec) + suffix; } }, t); };

    // crossfade for sections that wrap their content in .scene-inner (pixel scenes usually cut inside the canvas instead)
    const scenes = ({ crossfade = 0.2 } = {}) => {
      $$("section.clip").forEach((sec, i) => {
        const inner = sec.querySelector(".scene-inner");
        if (i > 0 && inner) tl.fromTo(inner, { opacity: 0 }, { opacity: 1, duration: crossfade, ease: "power1.inOut" }, parseFloat(sec.dataset.start));
      });
    };

    // ---------- karaoke subtitles: words pop in as they are spoken ----------
    const subtitles = () => {
      // render variable {"subtitles": false} hides them (clean copy)
      const vars = (() => { try { return window.__hyperframes?.getVariables?.() || {}; } catch { return {}; } })();
      if (vars.subtitles === false) $("#captions").style.display = "none";
      const CH = TT.chars || [];
      // Thai: dictionary word segments (punctuation glued to the word before); other languages: split on spaces
      const LANG = document.documentElement.lang || "th";
      const thai = LANG.startsWith("th");
      const seg = new Intl.Segmenter(LANG, { granularity: "word" });
      // [accent] phrases and window.SUB_GLUE words are never split across word pops
      const GLUE = new Set([...(opts.glue || window.SUB_GLUE || []), ...CAP.flatMap((c) => [...String(c.text).matchAll(/\[([^\]]+)\]/g)].map((m) => m[1]))].filter((w) => w && !/\s/.test(w)));
      const tokens = (s) => {
        if (!thai) return s.split(/(\s+)/).filter(Boolean);
        const out = [];
        for (const { segment, isWordLike } of seg.segment(s)) {
          if (!isWordLike && segment.trim() && out.length && out[out.length - 1].trim()) out[out.length - 1] += segment;
          else out.push(segment);
        }
        for (let i = 0; i < out.length; i++) for (let n = Math.min(4, out.length - i); n >= 2; n--) { const j = out.slice(i, i + n).join(""); if (GLUE.has(j)) { out.splice(i, n, j); break; } }
        return out;
      };
      CAP.forEach((c, i) => {
        const plain = [], hl = [];
        let inHl = false;
        for (const ch of c.text) { if (ch === "[") inHl = true; else if (ch === "]") inHl = false; else { plain.push(ch); hl.push(inHl); } }
        const times = CH[i] && CH[i].length === plain.length ? CH[i]
          : plain.map((_, k) => c.start + (k / Math.max(1, plain.length)) * Math.max(0.3, c.end - c.start - 0.25));
        const el = document.createElement("div");
        el.className = "cap"; el.id = `cap-${i}`;
        const line = document.createElement("span");
        line.className = "line";
        let idx = 0;
        const words = [];
        for (const segment of tokens(plain.join(""))) {
          const w = document.createElement("span");
          w.className = "w" + (hl[idx] ? " hl" : "");
          w.textContent = segment;
          line.appendChild(w);
          if (segment.trim()) words.push({ w, t: times[idx] });
          idx += [...segment].length;
        }
        el.appendChild(line);
        $("#captions").appendChild(el);
        tl.fromTo(el, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.2, ease: EASE }, c.start);
        tl.set(el, { opacity: 0 }, c.end);
        // the word being spoken pops in blue, then settles to black ([accent] words stay blue)
        words.forEach(({ w, t }) => {
          const t0 = Math.max(c.start, t - 0.04);
          tl.fromTo(w, { opacity: 0, y: 14, scale: 0.9, color: "#3446e8" }, { opacity: 1, y: 0, scale: 1, color: "#3446e8", duration: 0.14, ease: "back.out(2)" }, t0);
          if (!w.classList.contains("hl")) tl.to(w, { color: "#101114", duration: 0.12, ease: "none" }, t0 + 0.32);
        });
      });
    };

    // thin progress bar (#progress, optional)
    const done = () => { if ($("#progress")) tl.fromTo("#progress", { scaleX: 0 }, { scaleX: 1, duration: TOTAL, ease: "none" }, 0); };

    return { $, $$, CAP, TOTAL, EASE, at, end, atW, S, D, ends, rnd, reveal, hide, pop, slam, shake, punch, echo, count, scenes, subtitles, done };
  };
})();
// genhaha:ed34a05c8342
