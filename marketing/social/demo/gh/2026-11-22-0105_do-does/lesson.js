// lesson.js — scene building blocks for "study card" lesson clips (HyperFrames + GSAP). Every block is a pure function of
// time: it builds its DOM inside a <section> and adds tweens to the paused timeline. No Math.random, no Date.now.
//
//   const tl = gsap.timeline({ paused: true });  const M = Motion(tl);  const L = Lesson(tl, M);
//   const B = (k, w) => (w ? M.atW(k, w) : M.at(k));        // B("a1") line start · B("a1","and") the moment a word is spoken
//   L.hook("#sc-hook", { eyebrow: "GRAMMAR · 1 MIN", a: "and", b: "but" });
//
// `sec` = a <section> selector ("#sc-x"). Times (`t`, `tb`, …) are absolute seconds; default `t` = the section start + 0.3 s.
// Every block fades out ~0.5 s before its section ends (the next scene's fade-in follows), except the last section.
// Text may use [brackets] to colour a word. Keep content above y 1250 (subtitle lane below). Blocks:
//   hook    { eyebrow, a, b, sub?, t, tb, ts, y, size }                       two huge words, 2nd in blue
//   define  { eyebrow, term, tone:"blue"|"ink", meaning, sub?, chips?:[{text,t,line?}], example?:{…}, t, tm, ts, y, size }
//   tiles   { eyebrow, title?, items:[{k, label?, t, lt?}], kind:"letters"|"chips", t, y }     letter tiles / word chips, per-item reveal
//   example { eyebrow?, label:"EXAMPLE", text:"I like tea [and] coffee.", gloss?, hit?:time|[times], t, y }   sentence card (hard shadow)
//   compare { eyebrow, title?, a:{term,meaning,example?}, b:{…}, t, tb, y }                A vs B
//   steps   { eyebrow, title?, items:[{text, sub?, t}], t, y }                             1-2-3
//   tip     { eyebrow:"TIP", title, sub?, card?:{label,text,gloss?,hit?,t?}, t, y }        callout
//   outro   { eyebrow:"SAVE & FOLLOW", word, sub?, pills?:["SAVE","FOLLOW"], t, y }
//   dots(["#sc-a","#sc-b",…])  progress dots · grid()  slow graph-paper drift
(function () {
  window.Lesson = function (tl, M) {
    const $ = M.$, TOTAL = M.TOTAL;
    const INK = "#101114", BLUE = "#3446e8", HIT = "#e8553a", GREY = "rgba(16,17,20,0.16)";
    const mk = (cls, parent, tag = "div") => { const e = document.createElement(tag); if (cls) e.className = cls; if (parent) parent.appendChild(e); return e; };
    const txt = (cls, parent, text) => { const e = mk(cls, parent); e.textContent = text; return e; };
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    // "a [b] c" → text + <span class=cls> for the bracketed part; returns the spans
    const rich = (el, text, cls) => { const spans = [];
      String(text).split(/(\[[^\]]*\])/).forEach((p) => { if (!p) return; if (p[0] === "[") { const s = mk(cls, el, "span"); s.textContent = p.slice(1, -1); spans.push(s); } else el.appendChild(document.createTextNode(p)); });
      return spans; };
    const plain = (s) => String(s ?? "").replace(/[\[\]]/g, "");
    // font size so that the longest word fits the 840 px column
    const fit = (words, max, min = 70) => clamp(Math.floor(840 / (Math.max(...words.map((w) => [...plain(w)].length)) * 0.62)), min, max);

    // section context: block layer, default start, end, and whether it is the last scene
    const ctx = (sel) => { const s = typeof sel === "string" ? $(sel) : sel; if (!s) throw new Error(`Lesson: no section ${sel}`);
      const a = parseFloat(s.dataset.start), d = parseFloat(s.dataset.duration), blk = mk("blk", s);
      return { s, blk, t0: a <= 0.01 ? 0.05 : a + 0.3, end: a + d, last: a + d >= TOTAL - 0.05 }; };
    const IN = {
      up: [{ opacity: 0, y: 34 }, { opacity: 1, y: 0, duration: 0.38, ease: "power3.out" }],
      pop: [{ opacity: 0, scale: 0.55 }, { opacity: 1, scale: 1, duration: 0.34, ease: "back.out(2.4)" }],
      slam: [{ opacity: 0, scale: 1.3, y: 10 }, { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: "back.out(1.7)" }],
      left: [{ opacity: 0, x: -80 }, { opacity: 1, x: 0, duration: 0.4, ease: "power3.out" }],
      right: [{ opacity: 0, x: 80 }, { opacity: 1, x: 0, duration: 0.4, ease: "power3.out" }],
      fade: [{ opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power1.out" }],
    };
    const show = (el, t, kind = "up") => tl.fromTo(el, IN[kind][0], { ...IN[kind][1] }, t);
    const leave = (c) => { if (!c.last) tl.to(c.blk, { opacity: 0, y: -16, duration: 0.22, ease: "power1.in" }, c.end - 0.55); };
    const eyebrow = (c, text, t) => { if (!text) return; const e = txt("eb", c.blk, text); show(e, t, "fade"); return e; };
    const column = (c, y) => { const col = mk("col", c.blk); col.style.top = `${y}px`; return col; };
    const sized = (el, px) => { el.style.fontSize = `${px}px`; return el; };

    // sentence card; returns the element
    const card = (parent, o, t, tipClass) => {
      const el = mk("card" + (tipClass ? " tipc" : ""), parent);
      if (o.label !== false) txt("lab", el, o.label ?? "EXAMPLE");
      const sen = mk("sen", el); const spans = rich(sen, o.text, "hit");
      if (o.gloss) txt("gloss", el, o.gloss);
      const hits = [].concat(o.hit ?? []);
      spans.forEach((s, i) => tl.fromTo(s, { color: INK }, { color: HIT, duration: 0.18, ease: "power1.out" }, hits[i] ?? hits[0] ?? t + 0.45));
      show(el, t, "up");
      return el;
    };

    const api = {
      hook(sel, o) { const c = ctx(sel), t = o.t ?? c.t0;
        eyebrow(c, o.eyebrow, t);
        const col = column(c, o.y ?? 520), fs = o.size ?? fit([o.a, o.b], 250, 110);
        const a = sized(txt("kw", col, o.a), fs), b = sized(txt("kw blue", col, o.b), fs);
        show(a, t + 0.05, "slam"); show(b, o.tb ?? t + 0.5, "slam");
        if (o.sub) show(txt("sub", col, o.sub), o.ts ?? t + 1.0, "up");
        leave(c); return c; },

      define(sel, o) { const c = ctx(sel), t = o.t ?? c.t0;
        eyebrow(c, o.eyebrow, t);
        const col = column(c, o.y ?? 470), fs = o.size ?? fit([o.term], 210, 90);
        const term = sized(txt("kw" + (o.tone === "ink" ? "" : " blue"), col, o.term), fs);
        show(term, t + 0.05, "slam");
        if (o.meaning) show(txt("mean", col, `= ${o.meaning}`), o.tm ?? t + 0.4, "up");
        if (o.sub) show(txt("sub", col, o.sub), o.ts ?? t + 0.8, "up");
        if (o.chips) { const row = mk("chips", col); o.chips.forEach((ch, i) => show(txt("chip" + (ch.line ? " line" : ""), row, ch.text), ch.t ?? t + 1 + i * 0.4, "pop")); }
        if (o.example) { const w = mk("", col); w.style.marginTop = "70px"; card(w, o.example, o.example.t ?? t + 1.4); }
        leave(c); return c; },

      tiles(sel, o) { const c = ctx(sel), t = o.t ?? c.t0;
        eyebrow(c, o.eyebrow, t);
        const col = column(c, o.y ?? 520);
        if (o.title) show(sized(txt("kw", col, o.title), o.titleSize ?? 72), t + 0.05, "up");
        const n = o.items.length;
        if (o.kind === "chips") { const row = mk("wchips", col);
          o.items.forEach((it, i) => { const e = txt("wchip" + (it.blue ? " blue" : ""), row, it.k); show(e, it.t ?? t + 0.5 + i * 0.3, "pop"); }); }
        else { const row = mk("tiles", col), w = Math.min(108, Math.floor((840 - 14 * (n - 1)) / n));
          o.items.forEach((it, i) => { const tile = mk("tile", row); tile.style.width = `${w}px`;
            const box = txt("t", tile, it.k); box.style.height = `${Math.round(w * 1.22)}px`; box.style.fontSize = `${Math.round(w * 0.78)}px`;
            const lab = txt("l", tile, it.label ?? " "); if (!it.label) lab.style.visibility = "hidden";
            const ti = it.t ?? t + 0.4 + i * 0.25;
            tl.fromTo(box, IN.pop[0], { ...IN.pop[1] }, ti);
            if (it.label) show(lab, it.lt ?? ti + 0.1, "fade"); }); }
        leave(c); return c; },

      example(sel, o) { const c = ctx(sel), t = o.t ?? c.t0;
        eyebrow(c, o.eyebrow, t);
        const col = column(c, o.y ?? 560); card(col, o, t + 0.05);
        leave(c); return c; },

      compare(sel, o) { const c = ctx(sel), t = o.t ?? c.t0;
        eyebrow(c, o.eyebrow, t);
        const col = column(c, o.y ?? 470);
        if (o.title) { show(sized(txt("kw", col, o.title), o.titleSize ?? 72), t + 0.05, "up"); }
        const row = mk("cmp", col); row.style.marginTop = o.title ? "50px" : "10px";
        const side = (s) => { const d = mk("side", row); const fs = fit([s.term], 100, 60); sized(txt("kw" + (s.tone === "ink" ? "" : " blue"), d, s.term), fs);
          if (s.meaning) txt("m", d, s.meaning); if (s.example) txt("e", d, s.example); return d; };
        const A = side(o.a), Bs = side(o.b), vs = txt("vs", row, "VS");
        show(A, o.ta ?? t + 0.4, "left"); show(Bs, o.tb ?? t + 1.0, "right"); show(vs, o.tb ?? t + 1.0, "pop");
        leave(c); return c; },

      steps(sel, o) { const c = ctx(sel), t = o.t ?? c.t0;
        eyebrow(c, o.eyebrow, t);
        const col = column(c, o.y ?? 470);
        if (o.title) show(sized(txt("kw", col, o.title), o.titleSize ?? 72), t + 0.05, "up");
        const list = mk("steps", col);
        o.items.forEach((it, i) => { const r = mk("step", list); txt("n", r, String(i + 1)); const b = mk("", r); const tx = mk("tx", b); rich(tx, it.text, "blue"); if (it.sub) txt("sb", b, it.sub);
          show(r, it.t ?? t + 0.4 + i * 0.5, "left"); });
        leave(c); return c; },

      tip(sel, o) { const c = ctx(sel), t = o.t ?? c.t0;
        eyebrow(c, o.eyebrow ?? "TIP", t);
        const col = column(c, o.y ?? 450);
        show(sized(txt("kw", col, o.title), o.titleSize ?? 72), t + 0.05, "up");
        if (o.sub) show(txt("sub", col, o.sub), o.ts ?? t + 0.35, "up");
        if (o.card) { const w = mk("", col); w.style.marginTop = "70px"; card(w, { label: "CLAUSE", ...o.card }, o.card.t ?? t + 0.8, true); }
        leave(c); return c; },

      outro(sel, o) { const c = ctx(sel), t = o.t ?? c.t0;
        eyebrow(c, o.eyebrow ?? "SAVE & FOLLOW", t);
        const col = column(c, o.y ?? 540), fs = o.size ?? fit([o.word], 230, 90);
        show(sized(txt("kw blue", col, o.word), fs), t + 0.05, "slam");
        if (o.sub) show(txt("sub", col, o.sub), o.ts ?? t + 0.5, "up");
        if (o.pills) { const row = mk("pills", col); o.pills.forEach((p, i) => show(txt("pill" + (i === o.pills.length - 1 ? " fill" : ""), row, p), (o.tp ?? t + 1.0) + i * 0.25, "pop")); }
        leave(c); return c; },

      // progress dots: one per section, filled from that section's start on
      dots(sels) { const root = $("#dots") || mk("", $("#root")); root.id = "dots";
        sels.forEach((s) => { const i = mk("", root, "i"), a = parseFloat($(s).dataset.start);
          tl.fromTo(i, { backgroundColor: GREY }, { backgroundColor: BLUE, duration: 0.2, ease: "none" }, a <= 0.01 ? 0.05 : a + 0.3); }); },

      grid() { tl.fromTo("#grid", { x: 0, y: 0 }, { x: -72, y: -144, duration: TOTAL, ease: "none" }, 0); },
    };
    return api;
  };
})();
// genhaha:ed34a05c8342
