// chalk-kit.js — chalkboard kit (classic script; SVG + GSAP + Motion + Stick2D only: no images, no WebGL).
// Everything is a pure function of the GSAP timeline: chalk strokes are SVG paths revealed with stroke-dashoffset, jitter comes from a seeded hash (never Math.random).
//
//   <script src="stick2d-kit.js"></script><script src="chalk-kit.js"></script>   after gsap.min.js + timing.js + captions.js + motion.js, with look.css + chalk.css; <div id="stage"> must exist
//   const C = Chalk(tl, M);                                   // builds the board (frame, tray, eraser ghosts) and a "chalk" layer with the rough-chalk filter
//   C.page("p1");                                             // a page = one group of writing that C.erase() can wipe off (new pages start empty)
//   C.write("1+2+3+…+100", 80, 440, 100, 1.0, 2.4, { color: C.P.white });   // digits/operators are drawn stroke by stroke with a chalk stub + dust; other text (Thai) is wiped in
//   C.line / C.arrow / C.arc / C.circle / C.underline / C.box / C.brace / C.path    all reveal with dash-offset over (t, dur)
//   C.erase(t, 1.1);   C.dust(x, y, t, n);   C.sparkle(x, y, t, size, color);   C.ground(x1, x2, y)
//   const T = C.teacher({ x: 900, y: 1230, s: 0.55 });        // chalk-drawn Stick2D "ink" teacher inside the chalk layer: T.enter(t) · T.say("key") lip-sync · T.pose("point", t) · T.face(t, "smug")
// Returned by write(): { x0, x1, w, end } so the next line can start where this one ended.
// window.__chalk = { writes: [{ text, x0, x1, top, bottom, t, thai }], said: [keys], teacher: { x0, x1, top, bottom } } is read by `chalkboard check` (board text lanes, every line said).
(function () {
  window.Chalk = function (tl, M, opts = {}) {
    const NS = "http://www.w3.org/2000/svg";
    const rootEl = document.querySelector("#root"), FW = +(rootEl && rootEl.dataset.width) || 1080, FH = +(rootEl && rootEl.dataset.height) || 1920, WIDE = FW > FH;
    document.documentElement.classList.add(WIDE ? "wide" : "tall");
    // frame layout. 9:16 (1080x1920): writing area y 270–1000, teacher at the right edge (feet y 1232), subtitles from y 1262, chalk tray y ≈ 1530.
    // 16:9 (1920x1080): wide classroom board — writing area x 70–1850, y 70–800 (teacher x ≈ 1740 stands at the right, feet y 800, nothing of the writing below y 330 right of x 1590),
    // subtitles y 840–990 on the board, chalk tray along the bottom edge (y 1008).
    const FR = WIDE ? { x0: 40, x1: 1880, y0: 70, y1: 800, sub: 840, tray: 1008, teacherX: 1740, teacherY: 800, teacherS: 0.62 }
                    : { x0: 40, x1: 1040, y0: 270, y1: 1000, sub: 1262, tray: 1560, teacherX: 905, teacherY: 1232, teacherS: 0.55 };
    const LOG = window.__chalk = { writes: [], said: [], teacher: null, frame: Object.assign({ w: FW, h: FH, wide: WIDE }, FR) };
    const P = Object.assign({ board: "#27483d", white: "#f4f1e6", yellow: "#ffe27a", pink: "#ff9db8", blue: "#8fd3ff", green: "#b6f0a8" }, opts.palette || {});
    const S = Stick2D(tl, M, { theme: "ink", palette: { bg: P.board, line: P.white, skin: P.board, lw: 9, grain: 0 } });
    const svg = S.svg, shk = svg.querySelector("#shk");
    const r2 = (n) => Math.round(n * 100) / 100;
    const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };   // seeded 0..1
    const el = (parent, name, attrs, html) => { const e = document.createElementNS(NS, name); for (const k in attrs || {}) e.setAttribute(k, attrs[k]); if (html != null) e.innerHTML = html; parent.appendChild(e); return e; };

    // ---------- single-stroke handwriting glyphs (100-unit tall box, y down) ----------
    const GLY = {
      "0": { a: 78, p: ["M50 5 C20 5 15 35 15 50 C15 70 25 95 50 95 C75 95 85 70 85 50 C85 30 75 5 50 5"] },
      "1": { a: 58, p: ["M22 30 L50 6 L50 95"] },
      "2": { a: 78, p: ["M18 30 C18 5 80 5 80 32 C80 55 25 75 15 95 L85 95"] },
      "3": { a: 78, p: ["M18 15 C50 -2 82 15 70 38 C65 48 50 50 40 50 C60 50 85 58 80 78 C75 100 35 102 15 82"] },
      "4": { a: 80, p: ["M70 95 L70 5 L12 68 L90 68"] },
      "5": { a: 78, p: ["M78 8 L28 8 L22 48 C45 35 82 45 80 70 C78 98 35 102 14 84"] },
      "6": { a: 78, p: ["M72 8 C40 10 18 40 18 68 C18 100 80 100 80 68 C80 42 40 40 20 62"] },
      "7": { a: 76, p: ["M15 8 L85 8 L40 95"] },
      "8": { a: 78, p: ["M50 50 C20 45 25 5 50 5 C75 5 80 45 50 50 C15 55 15 95 50 95 C85 95 85 55 50 50"] },
      "9": { a: 78, p: ["M78 35 C70 -2 20 5 20 32 C20 60 70 62 78 35 C80 60 70 95 30 95"] },
      "+": { a: 84, p: ["M50 27 L50 73", "M27 50 L73 50"] },
      "=": { a: 84, p: ["M22 38 L78 38", "M22 64 L78 62"] },
      "×": { a: 84, p: ["M27 27 L73 73", "M73 27 L27 73"] },
      "?": { a: 70, p: ["M22 30 C22 0 78 0 76 32 C74 56 50 58 50 76", "M50 94 L51 94"] },
      "…": { a: 104, p: ["M18 92 L19 92", "M50 92 L51 92", "M82 92 L83 92"] },
      ".": { a: 36, p: ["M16 92 L17 92"] },
      "-": { a: 60, p: ["M15 52 L65 52"] },
      " ": { a: 40, p: [] },
    };
    const isG = (ch) => ch in GLY;
    const COMB = /[ัิีึืุูํ็่้๊๋์]/g;
    const runsOf = (text, size) => {
      const runs = []; let cur = null;
      for (const ch of [...text]) {
        const g = isG(ch) ? "g" : "t";
        if (!cur || cur.type !== g) { cur = { type: g, str: "" }; runs.push(cur); }
        cur.str += ch;
      }
      const k = size / 100;
      runs.forEach((r) => { r.w = r.type === "g" ? [...r.str].reduce((a, c) => a + GLY[c].a, 0) * k : r.str.replace(COMB, "").length * size * 0.82 * 0.5; });
      return runs;
    };
    const measure = (text, size) => runsOf(text, size).reduce((a, r) => a + r.w, 0);

    // ---------- board (behind the chalk layer) ----------
    svg.querySelector("defs").insertAdjacentHTML("beforeend", `
      <filter id="chalkF" filterUnits="userSpaceOnUse" x="0" y="0" width="${FW}" height="${FH}">
        <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="3" result="w"/>
        <feDisplacementMap in="SourceGraphic" in2="w" scale="5" xChannelSelector="R" yChannelSelector="G" result="d"/>
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="8" result="g"/>
        <feColorMatrix in="g" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  2.7 0 0 0 -0.45" result="m"/>
        <feComposite in="d" in2="m" operator="in"/>
      </filter>
      <filter id="smudgeF" filterUnits="userSpaceOnUse" x="-100" y="-100" width="${FW + 220}" height="${FH + 200}"><feGaussianBlur stdDeviation="16"/></filter>
      <filter id="ghostF" filterUnits="userSpaceOnUse" x="0" y="0" width="${FW}" height="${FH}"><feGaussianBlur stdDeviation="2.4"/></filter>
      <radialGradient id="boardG" cx="50%" cy="42%" r="75%"><stop offset="0" stop-color="#34594c"/><stop offset="0.7" stop-color="${P.board}"/><stop offset="1" stop-color="#1a352c"/></radialGradient>
      <linearGradient id="woodG" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#a9743b"/><stop offset="0.5" stop-color="#8a5a2b"/><stop offset="1" stop-color="#5e3a1b"/></linearGradient>
      <linearGradient id="woodH" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#5e3a1b"/><stop offset="0.5" stop-color="#93602f"/><stop offset="1" stop-color="#5e3a1b"/></linearGradient>`);
    const deco = el(svg, "g", { id: "board", "data-layout-allow-overflow": "" }); svg.insertBefore(deco, shk);   // blurred smudges reach past the edges on purpose
    el(deco, "rect", { width: FW, height: FH, fill: "url(#boardG)" });
    // eraser ghosts: big pale smudge swipes + faint half-wiped old writing
    const smudge = el(deco, "g", { filter: "url(#smudgeF)", opacity: 0.55 });
    (WIDE ? [[160, 150, 640, 70, -4], [900, 700, 720, 80, 5], [100, 560, 420, 60, 8], [1000, 120, 460, 50, -6], [300, 430, 800, 64, 2], [700, 880, 640, 60, -2]]
           : [[120, 330, 520, 70, -4], [560, 1010, 620, 80, 5], [60, 880, 360, 60, 8], [640, 300, 380, 50, -6], [200, 1120, 700, 64, 2]]).forEach(([x, y, w, h, a]) =>
      el(smudge, "rect", { x, y, width: w, height: h, rx: h / 2, fill: "#d9e6dd", opacity: 0.1, transform: `rotate(${a} ${x + w / 2} ${y + h / 2})` }));
    const ghostG = el(deco, "g", { filter: "url(#ghostF)", opacity: 0.1 });
    const ghost = (str, x, y, size, rot) => { const g = el(ghostG, "g", { transform: `translate(${x} ${y}) rotate(${rot} 0 0) scale(${size / 100})` }); let cx = 0;
      for (const ch of str) { const d = GLY[ch]; if (!d) continue; d.p.forEach((p) => el(g, "path", { d: p, transform: `translate(${cx} 0)`, fill: "none", stroke: P.white, "stroke-width": 8, "stroke-linecap": "round", "stroke-linejoin": "round" })); cx += d.a; } };
    if (WIDE) { ghost("2+2=4", 110, 96, 60, -3); ghost("7×8=56", 1180, 560, 64, 2); ghost("9-4=5", 150, 905, 54, -2); ghost("12÷3", 1180, 915, 50, 2); }   // ghosts kept off the teacher (x > 1590)
    else { ghost("2+2=4", 70, 290, 60, -3); ghost("7×8=56", 440, 1120, 64, 2); ghost("9-4=5", 90, 1150, 54, -2); }   // ghosts kept left of the teacher (x ≈ 780–1040)
    // wooden frame, chalk tray and base
    if (WIDE) {   // wooden frame, a deep chalk ledge along the bottom edge
      el(deco, "rect", { x: 0, y: 0, width: FW, height: 30, fill: "url(#woodG)" });
      el(deco, "rect", { x: 0, y: 0, width: 30, height: 1020, fill: "url(#woodH)" });
      el(deco, "rect", { x: FW - 30, y: 0, width: 30, height: 1020, fill: "url(#woodH)" });
      el(deco, "rect", { x: 0, y: 1008, width: FW, height: 72, fill: "#4a2f19" });
      el(deco, "rect", { x: 0, y: 1008, width: FW, height: 16, fill: "#b07d45" });
      el(deco, "rect", { x: 10, y: 1024, width: FW - 20, height: 40, rx: 8, fill: "url(#woodG)" });
      el(deco, "rect", { x: 30, y: 1004, width: FW - 60, height: 8, fill: "#3b2512", opacity: 0.55 });
      for (let i = 0; i < 4; i++) el(deco, "path", { d: `M0 ${1030 + i * 14} q480 ${6 - (i % 3) * 5} 960 0 t960 ${(i % 2) * 4}`, fill: "none", stroke: "#000", "stroke-opacity": 0.12, "stroke-width": 2 });
      [[140, "#f4f1e6", 30], [190, "#ffe27a", 24], [240, "#ff9db8", 28]].forEach(([x, c, w], i) => el(deco, "rect", { x, y: 982, width: w + 14, height: 22, rx: 8, fill: c, stroke: "#00000033", "stroke-width": 2, transform: `rotate(${(i - 1) * 7} ${x} 990)` }));
      el(deco, "rect", { x: 1250, y: 958, width: 150, height: 44, rx: 8, fill: "#3a3a3a" }); el(deco, "rect", { x: 1250, y: 958, width: 150, height: 20, rx: 8, fill: "#c79a5c" });
    } else {
    el(deco, "rect", { x: 0, y: 0, width: 1080, height: 38, fill: "url(#woodG)" });
    el(deco, "rect", { x: 0, y: 0, width: 36, height: 1570, fill: "url(#woodH)" });
    el(deco, "rect", { x: 1044, y: 0, width: 36, height: 1570, fill: "url(#woodH)" });
    el(deco, "rect", { x: 0, y: 1560, width: 1080, height: 360, fill: "#4a2f19" });
    el(deco, "rect", { x: 0, y: 1560, width: 1080, height: 26, fill: "#b07d45" });
    el(deco, "rect", { x: 14, y: 1584, width: 1052, height: 48, rx: 8, fill: "url(#woodG)" });
    el(deco, "rect", { x: 36, y: 1556, width: 1008, height: 10, fill: "#3b2512", opacity: 0.55 });
    for (let i = 0; i < 16; i++) el(deco, "path", { d: `M0 ${1650 + i * 17} q270 ${6 - (i % 3) * 5} 540 0 t540 ${(i % 2) * 4}`, fill: "none", stroke: "#000", "stroke-opacity": 0.12, "stroke-width": 2 });
    [[110, "#f4f1e6", 30], [150, "#ffe27a", 24], [190, "#ff9db8", 28]].forEach(([x, c, w], i) => el(deco, "rect", { x, y: 1532, width: w + 14, height: 22, rx: 8, fill: c, stroke: "#00000033", "stroke-width": 2, transform: `rotate(${(i - 1) * 7} ${x} 1540)` }));
    el(deco, "rect", { x: 820, y: 1514, width: 150, height: 44, rx: 8, fill: "#3a3a3a" }); el(deco, "rect", { x: 820, y: 1514, width: 150, height: 20, rx: 8, fill: "#c79a5c" });
    }
    const ghostBands = el(deco, "g", { filter: "url(#smudgeF)" });                                   // light streaks left by erase()

    // ---------- chalk layer ----------
    const chalk = S.add(S.world, ""); chalk.setAttribute("filter", "url(#chalkF)");
    let pageN = 0, cur = null, strokeN = 0;
    const page = (id) => { const g = el(chalk, "g", { id: "pg-" + (id || ++pageN) }); cur = g; return g; };
    page("p0");
    const fx = el(chalk, "g", {});                                                                   // dust + sparkles + chalk stub live above the pages and survive erase()

    // ---------- reveal helper: path drawn with dashoffset 1 → 0 ----------
    const draw = (parent, d, t, dur, o = {}) => {
      const e = el(parent, "path", { d, fill: "none", stroke: o.color || P.white, "stroke-width": o.w ?? 7, "stroke-linecap": "round", "stroke-linejoin": "round", pathLength: 1, "stroke-dasharray": "1 2", "stroke-dashoffset": 1, opacity: o.opacity ?? 0.94 });
      tl.fromTo(e, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: Math.max(0.05, dur), ease: o.ease || "none" }, t);
      return e;
    };
    // chalk stub that follows sample points of a stroke, plus little dust puffs
    const stubs = [];
    const stub = () => { const g = el(fx, "g", { opacity: 0 }); el(g, "rect", { x: -5, y: -4, width: 10, height: 30, rx: 4, fill: P.white, transform: "rotate(32)" }); stubs.push(g); return g; };
    const dust = (x, y, t, n = 3, spread = 14, o = {}) => {
      for (let i = 0; i < n; i++) {
        const s = ++strokeN, dx = (rnd(s) - 0.5) * spread * 2, dy = 12 + rnd(s + 9) * 22, r = 2 + rnd(s + 4) * 3.5;
        const c = el(fx, "circle", { cx: x + (rnd(s + 2) - 0.5) * spread, cy: y + (rnd(s + 3) - 0.5) * spread * 0.5, r, fill: o.color || P.white, opacity: 0 });
        tl.fromTo(c, { opacity: 0.75, x: 0, y: 0 }, { opacity: 0, x: dx, y: dy, duration: o.dur ?? 0.55, ease: "power1.out", immediateRender: false }, t + i * 0.04);
        tl.set(c, { opacity: 0 }, t + (o.dur ?? 0.55) + i * 0.04 + 0.02);
      }
    };
    const follow = (st, pathEl, t, dur, map) => {
      const L = pathEl.getTotalLength(), N = 7;
      for (let i = 0; i <= N; i++) {
        const p = pathEl.getPointAtLength((L * i) / N), q = map(p.x, p.y);
        if (i === 0) tl.set(st, { x: q[0], y: q[1] }, t); else tl.to(st, { x: q[0], y: q[1], duration: dur / N, ease: "none" }, t + ((i - 1) * dur) / N);
      }
    };

    // ---------- write ----------
    const write = (text, x, y, size, t, dur, o = {}) => {
      const k = size / 100, col = o.color || P.white, w = (o.w ?? Math.max(4, size * 0.085)) / k, parent = o.page || cur;
      const runs = runsOf(text, size), W = runs.reduce((a, r) => a + r.w, 0);
      let cx = o.anchor === "middle" ? x - W / 2 : o.anchor === "end" ? x - W : x;
      const x0 = cx;
      const weight = (r) => (r.type === "g" ? [...r.str].reduce((a, c) => a + Math.max(0, GLY[c].p.length) * 1 + (c === " " ? 0.3 : 0), 0) : Math.max(1, r.str.replace(COMB, "").length * 0.9));
      const total = runs.reduce((a, r) => a + weight(r), 0) || 1;
      const st = o.stub === false ? null : stub();
      if (st) tl.set(st, { opacity: 1 }, t);
      let tt = t;
      runs.forEach((r) => {
        if (r.type === "g") {
          for (const ch of r.str) {
            const d = GLY[ch], n = d.p.length, id = ++strokeN, gdur = (dur * weight({ type: "g", str: ch })) / total;
            if (!n) { cx += d.a * k; tt += gdur; continue; }
            const jx = (rnd(id) - 0.5) * size * 0.03, jy = (rnd(id + 5) - 0.5) * size * 0.05, rot = (rnd(id + 11) - 0.5) * 5;
            const gx = cx + jx, gy = y + jy;
            const g = el(parent, "g", { transform: `translate(${r2(gx)} ${r2(gy)}) scale(${r2(k * 1000) / 1000}) rotate(${r2(rot)} 40 50)` });
            d.p.forEach((p, i) => {
              const sd = gdur / n, e = draw(g, p, tt + i * sd, sd, { color: col, w, opacity: o.opacity });
              if (st) follow(st, e, tt + i * sd, sd, (px, py) => [gx + (px - 40) * k + 40 * k, gy + (py - 50) * k + 50 * k]);
            });
            if (!o.noDust && ch !== " ") dust(gx + 40 * k, gy + 92 * k, tt + gdur * 0.6, 2, size * 0.18);
            cx += d.a * k; tt += gdur;
          }
        } else {
          const fs = size * 0.82, tdur = (dur * weight(r)) / total, id = ++strokeN;
          const cid = "cl" + id;
          const cp = el(svg.querySelector("defs"), "clipPath", { id: cid }); const cr = el(cp, "rect", { x: cx - 10, y: y - size * 0.35, width: 0, height: size * 1.8 });
          const tx = el(parent, "text", { x: cx, y: y + size * 0.88, "font-family": "Kanit, sans-serif", "font-weight": 600, "font-size": fs, fill: col, "clip-path": `url(#${cid})`, opacity: o.opacity ?? 0.94 }, r.str);
          tl.fromTo(cr, { attr: { width: 0 } }, { attr: { width: r.w + 24 }, duration: Math.max(0.05, tdur), ease: "none" }, tt);
          if (st) { tl.set(st, { x: cx, y: y + size * 0.72 }, tt); tl.to(st, { x: cx + r.w, duration: Math.max(0.05, tdur), ease: "none" }, tt); }
          const nd = Math.max(2, Math.round(tdur * 6));
          for (let i = 0; i < nd; i++) dust(cx + (r.w * (i + 0.5)) / nd, y + size * 0.85, tt + (tdur * (i + 0.5)) / nd, 1, size * 0.15);
          cx += r.w; tt += tdur;
        }
      });
      if (st) tl.set(st, { opacity: 0 }, t + dur + 0.04);
      const thai = runs.filter((r) => r.type === "t").map((r) => r.str).join("");
      LOG.writes.push({ text, x0: r2(x0), x1: r2(x0 + W), top: r2(thai ? y - size * 0.05 : y), bottom: r2(thai ? y + size * 1.15 : y + size), t: r2(t), thai });
      return { x0, x1: x0 + W, w: W, end: t + dur };
    };

    // ---------- shapes ----------
    const wob = (n, a) => (rnd(++strokeN + n) - 0.5) * a;
    const path = (d, t, dur, o = {}) => draw(o.page || cur, d, t, dur, o);
    const line = (x1, y1, x2, y2, t, dur, o = {}) => path(`M${x1} ${y1} Q${r2((x1 + x2) / 2 + wob(1, 5))} ${r2((y1 + y2) / 2 + wob(2, 5))} ${x2} ${y2}`, t, dur, o);
    const arrow = (x1, y1, x2, y2, t, dur, o = {}) => {
      line(x1, y1, x2, y2, t, dur * 0.75, o);
      const a = Math.atan2(y2 - y1, x2 - x1), h = o.head ?? 26, p = (da) => `${r2(x2 - Math.cos(a + da) * h)} ${r2(y2 - Math.sin(a + da) * h)}`;
      return path(`M${p(0.5)} L${x2} ${y2} L${p(-0.5)}`, t + dur * 0.75, dur * 0.25, o);
    };
    const arc = (x1, y1, x2, y2, lift, t, dur, o = {}) => {
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, n = Math.hypot(dx, dy) || 1;
      return path(`M${x1} ${y1} Q${r2(mx + (dy / n) * lift)} ${r2(my - (dx / n) * lift)} ${x2} ${y2}`, t, dur, o);
    };
    const circle = (cx, cy, rx, ry, t, dur, o = {}) => {
      const n = 48, id = ++strokeN, pts = [];
      for (let i = 0; i <= n; i++) { const a = (-2.2 + (i / n) * 6.55), rr = 1 + (rnd(id + i) - 0.5) * 0.04 + (i > n - 6 ? 0.04 : 0); pts.push(`${r2(cx + Math.cos(a) * rx * rr)} ${r2(cy + Math.sin(a) * ry * rr)}`); }
      return path("M" + pts.join(" L"), t, dur, o);
    };
    const underline = (x, y, w, t, dur, o = {}) => { const seg = 4, parts = [`M${x} ${y}`]; for (let i = 0; i < seg; i++) parts.push(`Q${r2(x + ((i + 0.5) * w) / seg)} ${r2(y + (i % 2 ? 7 : -7) + wob(i, 3))} ${r2(x + ((i + 1) * w) / seg)} ${r2(y + wob(i + 4, 3))}`); return path(parts.join(" "), t, dur, o); };
    const box = (x, y, w, h, t, dur, o = {}) => {
      const e = path(`M${x + 10} ${y + 2} L${x + w + 8} ${y} L${x + w} ${y + h} L${x - 2} ${y + h + 4} L${x + 3} ${y - 12}`, t, dur, o);
      if (o.double !== false) path(`M${x - 6} ${y + 10} L${x + w - 8} ${y - 6} L${x + w + 6} ${y + h - 6} L${x + 10} ${y + h + 8}`, t + dur * 0.6, dur * 0.5, Object.assign({}, o, { opacity: 0.6, w: (o.w ?? 7) * 0.7 }));
      return e;
    };
    const brace = (x1, x2, y, h, t, dur, o = {}) => {
      const xm = (x1 + x2) / 2, r = Math.min(h * 0.55, 46), m = y + h / 2;
      return path(`M${x1} ${y} Q${x1} ${m} ${x1 + r} ${m} L${xm - r} ${m} Q${xm} ${m} ${xm} ${y + h} Q${xm} ${m} ${xm + r} ${m} L${x2 - r} ${m} Q${x2} ${m} ${x2} ${y}`, t, dur, o);
    };
    const ground = (x1, x2, y, o = {}) => { const e = el(chalk, "path", { d: `M${x1} ${y} Q${(x1 + x2) / 2} ${y + 6} ${x2} ${y - 2}`, fill: "none", stroke: P.white, "stroke-width": 6, "stroke-linecap": "round", opacity: 0.55 }); return e; };
    const sparkle = (x, y, t, size = 40, col = P.yellow) => {
      const s = size, o = el(fx, "g", { transform: `translate(${x} ${y})` }), g = el(o, "g", { opacity: 0 });
      el(g, "path", { d: `M0 ${-s} Q0 0 ${s} 0 Q0 0 0 ${s} Q0 0 ${-s} 0 Q0 0 0 ${-s}Z`, fill: col, stroke: col, "stroke-width": 2, "stroke-linejoin": "round" });
      tl.fromTo(g, { opacity: 1, scaleX: 0.1, scaleY: 0.1, rotation: -30, svgOrigin: "0 0" }, { scaleX: 1, scaleY: 1, rotation: 20, duration: 0.3, ease: "back.out(2.4)", svgOrigin: "0 0", immediateRender: false }, t);
      tl.to(g, { opacity: 0, scaleX: 0.2, scaleY: 0.2, duration: 0.3, svgOrigin: "0 0" }, t + 0.42);
      return g;
    };

    // ---------- erase: a felt eraser zig-zags over the current page; pale streaks stay on the board ----------
    const erase = (t, dur = 1.2, o = {}) => {
      const nb = o.bands ?? 3, pg = cur, id = ++strokeN, y0 = o.y0 ?? FR.y0, bandH = o.bandH ?? (WIDE ? 245 : 260), x0 = FR.x0, x1 = FR.x1;
      const mid = "em" + id, mk = el(svg.querySelector("defs"), "mask", { id: mid, maskUnits: "userSpaceOnUse", x: 0, y: 0, width: FW, height: FH });
      el(mk, "rect", { x: 0, y: 0, width: FW, height: FH, fill: "#fff" });
      pg.setAttribute("mask", `url(#${mid})`);
      const eraser = el(shk, "g", { opacity: 0 }); el(eraser, "rect", { x: -80, y: -34, width: 160, height: 68, rx: 12, fill: "#3b3b3b" }); el(eraser, "rect", { x: -80, y: -34, width: 160, height: 28, rx: 12, fill: "#c79a5c" });
      const each = dur / nb;
      for (let i = 0; i < nb; i++) {
        const y = y0 + i * bandH, ltr = i % 2 === 0, ts = t + i * each;
        const b = el(mk, "rect", { x: ltr ? x0 : x1, y, width: 0, height: bandH + 6, fill: "#000" });
        const sm = el(ghostBands, "rect", { x: ltr ? x0 : x1, y: y + 40, width: 0, height: bandH - 70, rx: 60, fill: "#e4efe8", opacity: 0.05 });
        tl.fromTo([b, sm], { attr: { width: 0, x: ltr ? x0 : x1 } }, { attr: { width: x1 - x0, x: x0 }, duration: each, ease: "none" }, ts);
        tl.fromTo(eraser, { x: ltr ? x0 : x1, y: y + bandH / 2, rotation: ltr ? -6 : 6 }, { x: ltr ? x1 : x0, rotation: ltr ? 6 : -6, duration: each, ease: "none" }, ts);
        for (let s = 0; s < 4; s++) dust(ltr ? x0 + ((s + 0.5) * (x1 - x0)) / 4 : x1 - ((s + 0.5) * (x1 - x0)) / 4, y + bandH / 2 + 30, ts + ((s + 0.5) * each) / 4, 3, 60, { dur: 0.7 });
      }
      tl.set(eraser, { opacity: 1 }, t); tl.set(eraser, { opacity: 0 }, t + dur + 0.02);
      tl.set(pg, { opacity: 0 }, t + dur + 0.02);
      page();                                                                                         // next writes go to a fresh page
      return t + dur;
    };

    // ---------- teacher ----------
    const teacher = (o = {}) => {
      o = Object.assign({ x: FR.teacherX, y: FR.teacherY }, o);
      const sc = o.s ?? FR.teacherS, ch = S.char(Object.assign({ style: "ink", noShadow: true, layer: chalk, s: sc, flip: true, face: "happy" }, o));
      gsap.set(ch.root, { opacity: 0 });
      ch.enter = (t, d = 0.4) => { tl.fromTo(ch.root, { opacity: 0, scaleX: -0.05 * sc * (o.flip === false ? -1 : 1), scaleY: 0.05 * sc }, { opacity: 1, scaleX: sc * (o.flip === false ? 1 : -1), scaleY: sc, duration: d, ease: "back.out(2)" }, t); return ch; };
      const say0 = ch.say; ch.say = (key, so) => { LOG.said.push(key); return say0(key, so); };
      const x = o.x, y = o.y; LOG.teacher = { x0: r2(x - 200 * sc), x1: r2(x + 200 * sc), top: r2(y - 700 * sc), bottom: y };
      ch.stick = (len = 190) => ch.hold("R", `<path d="M0 -6 L0 ${len}" stroke="#d9b36c" stroke-width="9" stroke-linecap="round" fill="none"/>`);
      return ch;
    };

    return { W: FW, H: FH, wide: WIDE, area: FR, P, S, svg, chalk, page, write, measure, path, line, arrow, arc, circle, underline, box, brace, erase, dust, sparkle, ground, teacher, rnd, GLY };
  };
})();
// genhaha:781c07c7ad6b
