// vp-lib.js — visual-proof shared helpers: maths, easing, palettes, layout boxes, fonts, Thai wrapping, math typesetting.
// Loaded before vp-art.js / vp-validate.js / vp-kit.js (in the page and in node via scripts/lib/vp.mjs). Writes window.VP.
(function (W) {
  "use strict";
  const VP = (W.VP = W.VP || {});
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = {
    io: (k) => { k = clamp(k); return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; },
    out: (k) => { k = clamp(k); return 1 - Math.pow(1 - k, 3); },
    back: (k) => { k = clamp(k); const c = 1.5; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); },
  };
  const ramp = (T, t0, t1) => (t1 <= t0 ? (T >= t0 ? 1 : 0) : clamp((T - t0) / (t1 - t0)));
  const hexRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const rgba = (h, a) => { const c = hexRgb(h); return `rgba(${c[0]},${c[1]},${c[2]},${clamp(a)})`; };
  const mix = (h, to, e) => { const a = hexRgb(h), b = hexRgb(to); return "#" + a.map((v, i) => Math.round(lerp(v, b[i], clamp(e))).toString(16).padStart(2, "0")).join(""); };

  // ---- palettes: one ground + neutrals + six inks. Ink NAMES are the same in every palette, so a scene can switch palette freely. ----
  // fill = alpha of translucent shape fills (spec: 20–35 %); dark = true for dark grounds (brighten = mix toward white, else toward black)
  const PALETTES = {
    navy:     { bg: ["#161d33", "#0f1526"], glow: "#46609a", grid: "#9fb2e0", line: "#d9e1f4", sum: "#f3f6fc", text: "#e6ebf7", soft: "#8d99b8", fill: 0.26, dark: true,
                teal: "#3fd0c0", gold: "#f5b94a", coral: "#ff7b8a", violet: "#a98bff", sky: "#5ab8ff", lime: "#9be36b" },
    charcoal: { bg: ["#1d1c21", "#121115"], glow: "#5a5248", grid: "#d8cfc0", line: "#e6e1d8", sum: "#fbf8f2", text: "#efeae2", soft: "#9a948b", fill: 0.25, dark: true,
                teal: "#4fd1b5", gold: "#f2c14e", coral: "#f47c6a", violet: "#b49cff", sky: "#6cc4f0", lime: "#b5dd6b" },
    plum:     { bg: ["#24182f", "#140d1b"], glow: "#6a4a8a", grid: "#d7c3ea", line: "#e9ddf2", sum: "#fbf6ff", text: "#f1e8f8", soft: "#a593b6", fill: 0.27, dark: true,
                teal: "#52d6c6", gold: "#ffc65c", coral: "#ff8aa0", violet: "#c3a3ff", sky: "#7cc7ff", lime: "#a6e87a" },
    paper:    { bg: ["#f7f3ea", "#ebe5d7"], glow: "#ffffff", grid: "#7b7464", line: "#2d313c", sum: "#14161b", text: "#1d2028", soft: "#6f6a60", fill: 0.22, dark: false,
                teal: "#10877b", gold: "#b47500", coral: "#cf4757", violet: "#6a4fd0", sky: "#1f74bd", lime: "#4c8a1a" },
  };
  const INKS = ["teal", "gold", "coral", "violet", "sky", "lime"];
  const NEUTRALS = ["line", "sum", "soft"];

  // ---- layout boxes (px, 1080x1920). Text lives in y 250–1520; nothing below y 900 goes right of x 960. ----
  const FRAME = { w: 1080, h: 1920, fps: 30 };
  const BOX = {
    title: { y: 330, size: 52 },                             // scene title (one line, readable on a phone)
    fig: { x: 70, y: 372, w: 940 },                          // figure band: from under the title down to the equation (height set per shot)
    eq: { size: 168, last: 1318, maxW: 840 },                // equation rows: last baseline sits just above the subtitles; wraps at "=" when too long
    eqBig: { size: 196, maxW: 840 },                         // big equation (equation / qed)
    cap: { y: 1392, h: 132, maxW: 860, size: 50 },           // subtitle block (2 lines max), centred
    steps: { x: 96, y: 560, size: 118, row: 210 },           // step list: first baseline, row pitch
  };

  // ---- fonts ----
  const F = {
    th: (size, w = 600) => `${w} ${size}px "IBM Plex Sans Thai", "Noto Sans Thai", sans-serif`,
    math: (size, italic) => `${italic ? "italic " : ""}500 ${size}px Newsreader, "Times New Roman", serif`,
  };
  const isThai = (s) => /[฀-๿]/.test(String(s));

  // ---- Thai-aware wrapping ([word] = accent) ----
  let SEG = null;
  const words = (s) => { try { SEG = SEG || new Intl.Segmenter("th", { granularity: "word" }); return [...SEG.segment(s)].map((x) => x.segment); } catch (e) { return String(s).split(/(\s+)/); } };
  // returns { lines: [[{t, accent}]], size }
  function wrapRich(ctx, text, fontFn, size, maxW, maxLines = 2, minSize = size * 0.7) {
    const parts = []; let acc = false;
    for (const piece of String(text).split(/(\[|\])/)) { if (piece === "[") acc = true; else if (piece === "]") acc = false; else if (piece) for (const w of words(piece)) parts.push({ t: w, accent: acc }); }
    for (let s = size; s >= minSize; s -= 2) {
      ctx.font = fontFn(s); const lines = [[]]; let w = 0;
      for (const p of parts) {
        if (p.t === "|") { lines.push([]); w = 0; continue; }
        const pw = ctx.measureText(p.t).width;
        if (w + pw > maxW && lines[lines.length - 1].length && !/^\s+$/.test(p.t)) { lines.push([]); w = 0; if (/^\s+$/.test(p.t)) continue; }
        if (!lines[lines.length - 1].length && /^\s+$/.test(p.t)) continue;
        lines[lines.length - 1].push(p); w += pw;
      }
      if (lines.length <= maxLines || s - 2 < minSize) return { lines, size: s };
    }
    return { lines: [parts], size: minSize };
  }

  // ---- math typesetting on canvas ----
  // token: "+" | "=" | "−" | "×" | "÷" | "(" | ")" | "…" | "∎" | "?" | number string | { t, sup, sub, frac: [num, den], q, at, from, it }
  const OPS = { "+": "+", "-": "−", "−": "−", "=": "=", "x": "×", "×": "×", "*": "×", "÷": "÷", "/": "/", "(": "(", ")": ")", "...": "…", "…": "…", "<": "<", ">": ">", "≠": "≠", "≈": "≈", "∎": "∎", "?": "?", ",": ",", "→": "→" };
  const isOp = (tk) => typeof tk === "string" && Object.prototype.hasOwnProperty.call(OPS, tk.trim());
  const italicOf = (s, it) => (it != null ? !!it : /^[A-Za-z]{1,2}$/.test(String(s)) || /^[α-ω]$/.test(String(s)));
  // measure one token → { w, asc, desc, draw(ctx, x, baseline, colour) }
  function measureToken(ctx, tk, size) {
    if (typeof tk === "number") tk = String(tk);
    if (typeof tk === "string") {
      const s = isOp(tk) ? OPS[tk.trim()] : tk; const thai = isThai(s);
      const font = thai ? F.th(size * 0.62, 600) : F.math(size, italicOf(s)); ctx.font = font;
      const pad = isOp(tk) && !/[(),]/.test(s) ? size * 0.16 : 0; const w = ctx.measureText(s).width + pad * 2;
      return { w, asc: size * 0.72, desc: size * 0.2, draw(c, x, y, col) { c.font = font; c.fillStyle = col; c.textAlign = "left"; c.textBaseline = "alphabetic"; c.fillText(s, x + pad, y); } };
    }
    if (tk.frac) {
      const n = measureToken(ctx, String(tk.frac[0]), size * 0.62), d = measureToken(ctx, String(tk.frac[1]), size * 0.62);
      const w = Math.max(n.w, d.w) + size * 0.24, bar = size * 0.3;
      return { w, asc: size * 0.95, desc: size * 0.55, draw(c, x, y, col) {
        n.draw(c, x + (w - n.w) / 2, y - bar - size * 0.12, col); d.draw(c, x + (w - d.w) / 2, y - bar + size * 0.5, col);
        c.fillStyle = col; c.fillRect(x + size * 0.06, y - bar - size * 0.03, w - size * 0.12, Math.max(2, size * 0.045)); } };
    }
    const base = String(tk.t == null ? "" : tk.t), thai = isThai(base);
    const bf = thai ? F.th(size * 0.62, 600) : F.math(size, italicOf(base, tk.it)); ctx.font = bf; const bw = ctx.measureText(base).width;
    const ss = size * 0.58; let sw = 0, subw = 0;
    if (tk.sup != null) { ctx.font = F.math(ss, italicOf(tk.sup)); sw = ctx.measureText(String(tk.sup)).width + size * 0.04; }
    if (tk.sub != null) { ctx.font = F.math(ss, italicOf(tk.sub)); subw = ctx.measureText(String(tk.sub)).width + size * 0.04; }
    const w = bw + Math.max(sw, subw) + (italicOf(base, tk.it) && (sw || subw) ? size * 0.04 : 0);
    return { w, asc: size * (tk.sup != null ? 0.95 : 0.72), desc: size * (tk.sub != null ? 0.38 : 0.2), draw(c, x, y, col) {
      c.fillStyle = col; c.textAlign = "left"; c.textBaseline = "alphabetic"; c.font = bf; c.fillText(base, x, y);
      const xs = x + bw + (italicOf(base, tk.it) ? size * 0.06 : size * 0.03);
      if (tk.sup != null) { c.font = F.math(ss, italicOf(tk.sup)); c.fillText(String(tk.sup), xs, y - size * 0.42); }
      if (tk.sub != null) { c.font = F.math(ss, italicOf(tk.sub)); c.fillText(String(tk.sub), xs, y + size * 0.2); } } };
  }
  // lay a row centred on cx; shrink until it fits maxW. → { size, items: [{ tk, x, w, cx, m }] }
  function layoutRow(ctx, tokens, cx, size, maxW, gap = 0.14) {
    for (let s = size; s > 30; s -= 4) {
      const ms = tokens.map((tk) => measureToken(ctx, tk, s)), g = s * gap;
      const total = ms.reduce((a, m) => a + m.w, 0) + g * Math.max(0, ms.length - 1);
      if (total <= maxW || s - 4 <= 30) { let x = cx - total / 2; const items = ms.map((m, i) => { const it = { tk: tokens[i], x, w: m.w, cx: x + m.w / 2, m }; x += m.w + g; return it; }); return { size: s, items, w: total }; }
    }
  }

  // a row that does not fit at ≥ 80 % of its size breaks before its last "=" (two big lines beat one small line)
  function layoutLines(ctx, tokens, size, maxW) {
    const one = layoutRow(ctx, tokens, 540, size, maxW);
    let k = -1; tokens.forEach((t, i) => { if (i > 0 && typeof t === "string" && t.trim() === "=") k = i; });
    if (one.size >= size * 0.8 || k <= 0) return { size: one.size, lines: [{ lay: one, from: 0 }] };
    const a = tokens.slice(0, k), b = tokens.slice(k), sz = Math.min(layoutRow(ctx, a, 540, size, maxW).size, layoutRow(ctx, b, 540, size, maxW).size);
    if (sz <= one.size) return { size: one.size, lines: [{ lay: one, from: 0 }] };
    return { size: sz, lines: [{ lay: layoutRow(ctx, a, 540, sz, maxW), from: 0 }, { lay: layoutRow(ctx, b, 540, sz, maxW), from: k }] };
  }

  // ---- "at" times: "key", "key+0.4", "key-0.2", "key@0.5" (fraction of the spoken line), or a number (seconds into the scene) ----
  const AT_RE = /^([A-Za-z][A-Za-z0-9_]*)(?:([+-]\d*\.?\d+)|@(\d*\.?\d+))?$/;
  function resolveAt(v, caps, sceneStart) {
    if (v == null) return null;
    if (typeof v === "number") return sceneStart + v;
    const m = String(v).trim().match(AT_RE); if (!m) return null;
    const c = caps.find((q) => q.key === m[1]); if (!c) return null;
    if (m[3] != null) { const end = c.said != null ? c.said : c.end; return c.start + (end - c.start) * Number(m[3]); }
    return c.start + (m[2] ? Number(m[2]) : 0);
  }

  Object.assign(VP, { clamp, lerp, ease, ramp, hexRgb, rgba, mix, PALETTES, INKS, NEUTRALS, FRAME, BOX, F, isThai, words, wrapRich, OPS, isOp, measureToken, layoutRow, layoutLines, AT_RE, resolveAt });
})(typeof window !== "undefined" ? window : globalThis);
// genhaha:ed4a029a9d2b
