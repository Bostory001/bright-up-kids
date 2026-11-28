// vp-kit.js — visual-proof engine. Paints ONE 1080x1920 canvas as a pure function of time from window.VP_SCENE (data only) + CAPTIONS.
//   VPK.boot(tl, SCENE) → { ready }   (index.html calls it; the clock tween redraws once per batch of seeks)
// Scene types: build · rearrange · compare · equation · array · numberline · steps · qed  (vp-validate.js has the full key list)
// Grammar (style spec "visual-proof"): one idea per shot, built never shown whole · colour = meaning (a quantity keeps one ink) ·
// the equation comes out of the picture (terms fly from the shape they measure, strictly left to right) · one thing moves at a time.
(function (W) {
  "use strict";
  const VP = W.VP, VPA = W.VPA, { clamp, lerp, ease, ramp, rgba, mix, BOX, F, PALETTES, INKS } = VP;
  const FADE = 0.4;            // shot cross-fade (s)
  const TRACE = 0.9;           // default build time of one item (s)

  function errorCard(msgs) {
    const d = document.createElement("div"); d.id = "vperr";
    d.textContent = "visual-proof: scene.js has errors\n\n" + msgs.slice(0, 8).map((p) => `• ${p.path}: ${p.msg}${p.fix ? "  → " + p.fix : ""}`).join("\n");
    (document.getElementById("root") || document.body).appendChild(d);
  }

  // ---------- shot timing from <section data-shot> (`visual-proof voice` retimes them) ----------
  function shotTimes(ids, caps) {
    const out = {};
    document.querySelectorAll("section[data-shot]").forEach((s) => { out[s.getAttribute("data-shot")] = { start: +s.getAttribute("data-start") || 0, dur: +s.getAttribute("data-duration") || 4 }; });
    ids.forEach((id, i) => { if (!out[id]) { const cs = caps.filter((c) => c.shot === id); out[id] = cs.length ? { start: i ? cs[0].start - 0.3 : 0, dur: cs[cs.length - 1].end - cs[0].start + 0.6 } : { start: i * 4, dur: 4 }; } });
    return out;
  }

  // ---------- expand one shot into figure items + equation rows ----------
  function inkCycle(i) { return INKS[i % INKS.length]; }
  function expandShot(sh) {
    const s = JSON.parse(JSON.stringify(sh));
    s.items = (s.figure || []).slice();
    if (s.type === "array" && s.array) {
      const A = s.array, n = A.n || 4, as = A.as || "dots", qs = A.q || [], ats = A.at || [], gap = as === "cells" ? 1 : A.gap || 1;
      for (let g = 1; g <= n; g++) s.items.splice(g - 1, 0, { id: `ring${g}`, part: "gnomon", x: 0, y: 0, n: g, as, gap, q: qs[g - 1] || inkCycle(g - 1), at: ats[g - 1], label: Array.isArray(A.labels) ? A.labels[g - 1] : A.labels === true ? String(2 * g - 1) : undefined, sfx: (A.sfx || [])[g - 1] });
      if (!s.view) { const m = as === "cells" ? 0 : 0.6; const lb = A.labels ? 0.9 : 0; s.view = as === "cells" ? [-0.15, -0.15, n + 0.3 + lb, n + 0.3 + lb] : [-0.35, -0.35, (n - 1) * gap + 0.7 + lb, (n - 1) * gap + 0.7 + lb]; }
    }
    if (s.type === "numberline" && s.line) {
      const L = s.line, from = L.from != null ? L.from : 0, to = L.to != null ? L.to : 10, S = 10 / (to - from || 1), X = (v) => (v - from) * S;
      s.items.unshift({ id: "line", part: "numline", x: 0, y: 0, w: 10, from, to, step: L.step || 1, labels: L.labels, q: L.q || "line", at: L.at });
      (s.marks || []).forEach((m, i) => s.items.push({ id: m.id || `mark${i + 1}`, part: "point", x: X(m.v), y: 0, r: 18, name: m.label, dir: 90, q: m.q || inkCycle(i), at: m.at, sfx: m.sfx }));
      (s.jumps || []).forEach((j, i) => s.items.push({ id: j.id || `jump${i + 1}`, part: "jump", a: [X(j.from), -0.25], b: [X(j.to), -0.25], h: j.h != null ? j.h : Math.min(1.6, Math.abs(X(j.to) - X(j.from)) * 0.5), label: j.label, q: j.q || inkCycle(i), at: j.at, sfx: j.sfx }));
      (s.bars || []).forEach((b, i) => s.items.push({ id: b.id || `bar${i + 1}`, part: "bar", x: X(b.from != null ? b.from : from), y: 1.6 + i * 1.3, w: b.w != null ? b.w * S : 10, h: 0.8, parts: b.parts, total: b.total, q: b.q, at: b.at, sfx: b.sfx }));
      if (!s.view) s.view = [-0.45, -2.3, 10.9, (s.bars || []).length ? 2.3 + 1.2 + s.bars.length * 1.3 + 0.3 : 3.4];
    }
    if (s.type === "compare") {
      for (const side of ["left", "right"]) { const sd = s[side] || {}; (sd.figure || []).forEach((it) => s.items.push(Object.assign({}, it, { _side: side }))); }
    }
    return s;
  }

  function boot(tl, SCENE) {
    const caps = (W.CAPTIONS || []).slice();
    const ids = [...new Set(caps.map((c) => c.shot))];
    const shotIds = ids.length ? ids : Object.keys((SCENE && SCENE.shots) || {});
    const probs = W.VPV ? W.VPV.validate(SCENE, caps, shotIds) : [];
    const errs = probs.filter((p) => p.level === "error");
    probs.filter((p) => p.level !== "error").forEach((p) => console.warn(`[visual-proof] ${p.path}: ${p.msg}`));
    if (errs.length) { errorCard(errs); return { ready: Promise.resolve() }; }

    const S = SCENE, pal = PALETTES[S.palette || "navy"], ink = S.ink || {};
    const col = (q) => { if (!q) return pal.line; const name = ink[q] || q; return pal[name] || pal.line; };
    const times = shotTimes(shotIds, caps);
    const shots = shotIds.map((id, i) => {
      const s = expandShot(S.shots[id] || { type: "build" }); s.id = id; s.start = times[id].start; s.end = times[id].start + times[id].dur;
      s.next = null; s.i = i; return s;
    });
    shots.forEach((s, i) => { s.end = shots[i + 1] ? shots[i + 1].start : s.end; s.next = shots[i + 1] || null; s.prev = shots[i - 1] || null; });
    const TOTAL = (() => { const r = document.getElementById("root"); return r ? +r.getAttribute("data-duration") || shots[shots.length - 1].end : shots[shots.length - 1].end; })();
    const at = (v, s, fallback) => { const t = VP.resolveAt(v, caps, s.start); return t == null ? fallback : t; };

    // ---------- per shot: layout, item times, equation token times ----------
    shots.forEach((s) => {
      const n = s.items.length, carry = !!s.carry, step = Math.min(0.9, ((s.end - s.start) * 0.55) / Math.max(1, n));
      s.items.forEach((it, i) => {
        const dur = it.dur || (it.part === "gnomon" || it.part === "dots" || it.part === "cells" ? Math.min(1.6, 0.35 + 0.12 * (it.part === "gnomon" ? 2 * it.n - 1 : (it.cols || 1) * (it.rows || 1))) : it.part === "label" ? 0.5 : TRACE);
        const hook = s.i === 0, t0 = it.at != null ? at(it.at, s, s.start + 0.3 + i * step) : carry ? s.start - 5 : hook ? s.start + 0.1 + i * Math.min(0.32, 1.2 / Math.max(1, n)) : s.start + 0.35 + i * step;   // shot 1 = hook: the whole figure starts building inside 1.5 s
        it._t0 = t0; it._t1 = t0 + dur;
        if (it.until != null) it._u0 = at(it.until, s, null);
        if (it.to) { it._m0 = at(it.to.at != null ? it.to.at : s.move, s, s.start + (s.end - s.start) * 0.4); it._m1 = it._m0 + (it.to.dur || 1.2); }
      });
      s.rows = [s.eq, s.eq2].filter((r) => Array.isArray(r) && r.length).map((row) => timeRow(row, s));
      s.stepRows = (s.steps || []).map((r, i) => ({ r, t0: at(r.at, s, s.start + 0.4 + i * 1.2) }));
      s.focus = (s.focus || []).map((f) => ({ f, t0: at(f.at, s, s.start), t1: f.until != null ? at(f.until, s, s.end) : null }));
      s.focus.forEach((F0, i) => { if (F0.t1 == null) F0.t1 = s.focus[i + 1] ? s.focus[i + 1].t0 : s.end + 1; });
      if (s.type === "compare" && s.sign) s.signT = at(s.signAt, s, s.start + (s.end - s.start) * 0.6);
      if (s.type === "qed") { const lastRow = s.rows[s.rows.length - 1], lastT = lastRow ? lastRow.toks[lastRow.toks.length - 1].t0 : s.start; s.qedT = at(s.markAt, s, Math.min(s.end - 0.6, lastT + 0.8)); s.noteT = at(s.noteAt, s, s.qedT - 0.2); }
    });
    // equation tokens: ops appear with the next term; times never go backwards (fix: the result never lands before its terms)
    function timeRow(row, s) {
      const toks = row.map((tk) => (typeof tk === "object" && tk !== null ? Object.assign({}, tk) : { op: String(tk) }));
      const terms = toks.filter((t) => !t.op), raw = terms.map((t) => (t.at != null ? at(t.at, s, null) : null));
      for (let i = 0; i < terms.length; i++) if (raw[i] == null) raw[i] = i ? raw[i - 1] + 0.22 : (() => { let j = i + 1; while (j < terms.length && raw[j] == null) j++; return j < terms.length ? raw[j] - 0.22 * (j - i) : s.start + 0.5; })();
      let last = -1e9; terms.forEach((t, i) => { t.t0 = Math.max(raw[i], last + 0.18); last = t.t0; });
      // an operator appears when the term after it lands (a flying term lands ~0.8 s after it shows) → "1 +" never waits for a missing term
      const land = (t) => t.t0 + (t.from ? 0.8 : 0);
      toks.forEach((t, i) => { if (!t.op) return; const nx = toks.slice(i + 1).find((x) => !x.op), pv = toks.slice(0, i).reverse().find((x) => !x.op); t.t0 = nx ? land(nx) - 0.1 : pv ? land(pv) + 0.15 : s.start + 0.5; });
      return { toks };
    }
    function mapFor(items, view, box, uFix) {
      let v = view;
      if (!v) { const pts = []; (items || []).forEach((it) => pts.push(...VPA.bbox(it))); if (!pts.length) pts.push([0, 0], [1, 1]); const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]); const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys), w = Math.max(1, x1 - x0), h = Math.max(1, y1 - y0), m = Math.max(w, h) * 0.08; v = [x0 - m, y0 - m, w + 2 * m, h + 2 * m]; }
      const pad = 18, u = uFix || Math.min((box.w - 2 * pad) / v[2], (box.h - 2 * pad) / v[3]), ox = box.x + box.w / 2 - (v[0] + v[2] / 2) * u, oy = box.y + box.h / 2 - (v[1] + v[3] / 2) * u;
      return { u, map: (p) => [ox + p[0] * u, oy + p[1] * u], box, view: v };
    }

    // ---------- canvas ----------
    const stage = document.getElementById("stage"), cv = document.createElement("canvas"); cv.width = 1080; cv.height = 1920; cv.id = "vp-canvas"; stage.appendChild(cv);
    const ctx = cv.getContext("2d");
    // ---------- layout (needs the canvas to measure; rerun once the fonts are in) ----------
    // equation rows sit at the bottom of the band (they wrap at "=" rather than shrink), the figure fills everything above them
    function layoutAll() {
      shots.forEach((s) => {
        const big = s.type === "equation" || s.type === "qed", size = big ? BOX.eqBig.size : BOX.eq.size;
        const L = s.rows.reduce((n, r) => n + VP.layoutLines(ctx, r.toks.map((t) => (t.op != null ? t.op : t)), size, BOX.eq.maxW).lines.length, 0);
        const lh = size * (L > 1 ? 1.0 : 1.1);   // wrapped lines sit tight so the figure keeps its room
        const last = s.type === "steps" ? BOX.eq.last : big ? (s.items.length ? (s.type === "qed" ? 1200 : 1330) : 880 + ((L - 1) * lh) / 2) : BOX.eq.last;
        s.eqSize = size; s.eqLh = lh; s.eqFirst = last - (L - 1) * lh;
        s.box = null; s.map = null; s.sub = null;
        if (s.type === "steps" || !s.items.length) return;
        const bottom = L ? s.eqFirst - size * 0.78 - 22 : 1372, b = { x: BOX.fig.x, y: BOX.fig.y, w: BOX.fig.w, h: Math.max(260, bottom - BOX.fig.y) };
        s.box = b;
        if (s.type === "compare") {
          const half = (b.w - 110) / 2; s.sub = {};
          for (const side of ["left", "right"]) { const its = s.items.filter((it) => it._side === side), sd = s[side] || {}; s.sub[side] = mapFor(its, sd.view, { x: side === "left" ? b.x : b.x + half + 110, y: b.y, w: half, h: b.h - 110 }); }
          const u = Math.min(s.sub.left.u, s.sub.right.u);   // one shared scale, so equal areas look equal
          for (const side of ["left", "right"]) { s.sub[side] = mapFor(null, s.sub[side].view, s.sub[side].box, u); s.items.filter((it) => it._side === side).forEach((it) => (it._map = s.sub[side])); }
        } else s.map = mapFor(s.items.filter((it) => !it._side), s.view, b);
      });
    }
    layoutAll();
    const ground = document.createElement("canvas"); ground.width = 1080; ground.height = 1920;
    { const g = ground.getContext("2d"), lg = g.createLinearGradient(0, 0, 0, 1920); lg.addColorStop(0, pal.bg[0]); lg.addColorStop(1, pal.bg[1]); g.fillStyle = lg; g.fillRect(0, 0, 1080, 1920);
      const rg = g.createRadialGradient(540, 800, 60, 540, 860, 1050); rg.addColorStop(0, rgba(pal.glow, pal.dark ? 0.2 : 0.55)); rg.addColorStop(1, rgba(pal.glow, 0)); g.fillStyle = rg; g.fillRect(0, 0, 1080, 1920);
      const gr = S.ground || "plain";
      if (gr === "grid" || gr === "dots") { g.strokeStyle = g.fillStyle = rgba(pal.grid, pal.dark ? 0.07 : 0.12); g.lineWidth = 1.2; for (let x = 0; x <= 1080; x += 60) for (let y = 0; y <= 1920; y += 60) { if (gr === "dots") { g.beginPath(); g.arc(x, y, 2, 0, 7); g.fill(); } } if (gr === "grid") { g.beginPath(); for (let x = 0; x <= 1080; x += 60) { g.moveTo(x + 0.5, 0); g.lineTo(x + 0.5, 1920); } for (let y = 0; y <= 1920; y += 60) { g.moveTo(0, y + 0.5); g.lineTo(1080, y + 0.5); } g.stroke(); } }
      if (pal.dark) { const vg = g.createRadialGradient(540, 960, 620, 540, 960, 1300); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(2,4,10,0.42)"); g.fillStyle = vg; g.fillRect(0, 0, 1080, 1920); } }

    // ---------- camera (figure layer only; equation, steps and subtitles stay put) ----------
    function cam(s, T) {
      const k = ramp(T, s.start, s.end), c = s.camera || S.camera || "push", box = s.box || BOX.fig, cx = box.x + box.w / 2, cy = box.y + box.h / 2;
      let z = 1, dx = 0, dy = 0, fx = cx, fy = cy;
      if (c === "push") z = lerp(1, 1.08, ease.io(k));
      else if (c === "pull") z = lerp(1.1, 1, ease.io(clamp(k * 1.4)));
      else if (c === "drift") { z = 1.035; dx = lerp(26, -26, ease.io(k)); dy = lerp(-8, 8, ease.io(k)); }
      else if (c === "focus") { const m = s.map; if (m && s.look) { const p = m.map(s.look); fx = p[0]; fy = p[1]; } z = lerp(1, 1.14, ease.io(clamp(k * 1.6))); }
      else if (c === "tilt") { z = 1.02; dy = lerp(-22, 22, ease.io(k)); }
      return { z, tx: fx - z * fx + dx, ty: fy - z * fy + dy };
    }
    const camPt = (cm, p) => [p[0] * cm.z + cm.tx, p[1] * cm.z + cm.ty];

    // ---------- focus (dim the rest, brighten the owner) ----------
    function focusOf(s, T) { for (const F0 of s.focus) if (T >= F0.t0 && T < F0.t1) return { f: F0.f, k: ramp(T, F0.t0, F0.t0 + 0.35) * (1 - ramp(T, F0.t1 - 0.25, F0.t1)) }; return null; }
    const isFocused = (fo, id, q) => !!fo && ((fo.f.ids && id && fo.f.ids.includes(id)) || (fo.f.q && q && (fo.f.q === q || (Array.isArray(fo.f.q) && fo.f.q.includes(q)))));

    // ---------- draw one shot at time T with shot alpha A ----------
    function drawShot(s, T, A, offY) {
      const cm = cam(s, T), fo = focusOf(s, T);
      ctx.save(); ctx.translate(0, offY);
      // title
      if (s.title) { const a = A * ease.out(ramp(T, s.start + 0.05, s.start + 0.45)); if (a > 0.003) { const w = VP.wrapRich(ctx, s.title, (z) => F.th(z, 600), BOX.title.size, 900, 1, 40); ctx.globalAlpha = a; ctx.fillStyle = mix(pal.soft, pal.text, 0.55); ctx.font = F.th(w.size, 600); ctx.textAlign = "center"; ctx.textBaseline = "alphabetic"; ctx.fillText(w.lines[0].map((p) => p.t).join(""), 540, BOX.title.y); ctx.globalAlpha = 1; } }
      // figure
      ctx.save(); ctx.setTransform(cm.z, 0, 0, cm.z, cm.tx, cm.ty + offY);
      for (const it of s.items) {
        const m = it._map || s.map; if (!m) continue;
        const k = ramp(T, it._t0, it._t1), mv = it.to ? ease.io(ramp(T, it._m0, it._m1)) : 0;
        const foc = isFocused(fo, it.id, it.q), dim = (fo && !foc ? 1 - 0.62 * fo.k : 1) * (it._u0 != null ? 1 - ramp(T, it._u0, it._u0 + 0.45) : 1);
        VPA.drawItem(ctx, it, { k, alpha: A * dim, move: mv, glow: foc ? fo.k : 0 }, { map: m.map, u: m.u, col, pal, enter: it.enter || s.enter || S.enter, lineScale: clamp(m.u / 80, 1, 1.9), labelScale: clamp(m.u / 90, 1, 1.45) });
      }
      ctx.restore();
      // compare: side labels + sign
      if (s.type === "compare" && s.sub) {
        for (const side of ["left", "right"]) { const sd = s[side] || {}, b = s.sub[side].box; if (sd.label == null) continue; const t0 = at(sd.labelAt, s, s.start + 0.8), a = A * ease.out(ramp(T, t0, t0 + 0.4)); if (a <= 0.003) continue; drawRichOrMath(sd.label, b.x + b.w / 2, b.y + b.h + 78, 64, col(sd.q || "line"), a, b.w - 20); }
        if (s.sign) { const a = A * ease.out(ramp(T, s.signT, s.signT + 0.35)), sc = 0.7 + 0.3 * ease.back(ramp(T, s.signT, s.signT + 0.45)); if (a > 0.003) { const b = s.sub.left.box, m = VP.measureToken(ctx, s.sign, 150 * sc); ctx.globalAlpha = a; m.draw(ctx, 540 - m.w / 2, b.y + b.h / 2 + 50, col("sum")); ctx.globalAlpha = 1; } }
      }
      // steps
      if (s.type === "steps") drawSteps(s, T, A);
      // equation rows
      let y = s.eqFirst;
      s.rows.forEach((row) => { const RL = VP.layoutLines(ctx, row.toks.map((t) => (t.op != null ? t.op : t)), s.eqSize, BOX.eq.maxW); RL.lines.forEach((ln) => { drawRow(s, row, ln, T, A, cm, fo, y); y += s.eqLh; }); });
      if (s.type === "qed") drawQed(s, T, A, y - s.eqLh);
      ctx.restore();
    }
    function drawRichOrMath(v, cx, y, size, colr, a, maxW) {
      if (typeof v === "object" || (!VP.isThai(v) && v.length < 24)) { const tk = typeof v === "object" ? v : String(v), m = VP.measureToken(ctx, tk, size); ctx.globalAlpha = a; m.draw(ctx, cx - m.w / 2, y, colr); ctx.globalAlpha = 1; return; }
      const w = VP.wrapRich(ctx, v, (z) => F.th(z, 600), size * 0.8, maxW, 2); ctx.globalAlpha = a; ctx.fillStyle = colr; ctx.font = F.th(w.size, 600); ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
      w.lines.forEach((ln, i) => ctx.fillText(ln.map((p) => p.t).join(""), cx, y + i * w.size * 1.35 - (w.lines.length - 1) * w.size * 0.6)); ctx.globalAlpha = 1;
    }
    function drawRow(s, row, ln, T, A, cm, fo, y) {
      const lay = ln.lay;
      lay.items.forEach((li, i) => {
        const t = row.toks[ln.from + i], k = ramp(T, t.t0, t.t0 + (t.from ? 1.0 : 0.35)); if (k <= 0) return;
        const foc = t.op == null && isFocused(fo, t.id, t.q), dim = fo && !foc && t.op == null ? 1 - 0.5 * fo.k : 1, glow = foc ? fo.k : 0;
        let x = li.x, yy = y, sz = lay.size, a = A * dim;
        const c0 = t.op != null ? col("sum") : col(t.q || "sum"), c = glow ? mix(c0, pal.dark ? "#ffffff" : "#000000", 0.3 * glow) : c0;
        if (t.from) { // fly out of the shape it measures
          const src = s.items.find((it) => it.id === t.from); let p = [540, 900];
          if (src && (src._map || s.map)) { const m = src._map || s.map, mv = src.to ? ease.io(ramp(T, src._m0, src._m1)) : 0; p = camPt(cm, VPA.anchorPx(src, { map: m.map, u: m.u }, mv)); }
          const fk = ease.io(clamp((k - 0.28) / 0.72)); a *= ease.out(clamp(k / 0.25));
          x = lerp(p[0] - li.w / 2, li.x, fk); yy = lerp(p[1] + lay.size * 0.3, y, fk); sz = lay.size;
        } else { a *= ease.out(k); yy = y + (1 - ease.out(k)) * 18; }
        const sw = 1 + 0.08 * glow; const m = sw === 1 && sz === lay.size ? li.m : VP.measureToken(ctx, li.tk, sz * sw);
        ctx.globalAlpha = clamp(a); m.draw(ctx, x - (m.w - li.w) / 2, yy, c); ctx.globalAlpha = 1;
      });
    }
    function drawSteps(s, T, A) {
      const B = BOX.steps, n = s.stepRows.length, rowH = n > 1 ? Math.min(B.row, 660 / (n - 1)) : 0, size = n > 4 ? B.size * 0.85 : B.size;
      s.stepRows.forEach((sr, i) => {
        const k = ramp(T, sr.t0, sr.t0 + 0.45); if (k <= 0) return;
        const newer = s.stepRows.slice(i + 1).some((o) => T >= o.t0), a = A * ease.out(k) * (newer ? 0.55 : 1), y = B.y + i * rowH, dx = (1 - ease.out(k)) * 40, r = size * 0.3;
        // number badge
        ctx.globalAlpha = a; ctx.strokeStyle = col(sr.r.q || "soft"); ctx.lineWidth = 3.5; ctx.beginPath(); ctx.arc(B.x + r + dx, y - size * 0.3, r, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = col(sr.r.q || "soft"); ctx.font = F.math(size * 0.42, false); ctx.textAlign = "center"; ctx.textBaseline = "alphabetic"; ctx.fillText(String(i + 1), B.x + r + dx, y - size * 0.3 + size * 0.15);
        const x0 = B.x + 2 * r + 30 + dx, maxW = 960 - 10 - (B.x + 2 * r + 30);
        if (sr.r.eq) { const toks = sr.r.eq.map((t) => (typeof t === "object" ? t : String(t))), lay = VP.layoutRow(ctx, toks, 0, size, maxW); lay.items.forEach((li) => { const t = li.tk; li.m.draw(ctx, x0 + li.x + lay.w / 2, y, typeof t === "object" ? col(t.q || "sum") : col("sum")); }); }
        else if (sr.r.text) { const w = VP.wrapRich(ctx, sr.r.text, (z) => F.th(z, 600), size * 0.5, maxW, 2); ctx.font = F.th(w.size, 600); ctx.textAlign = "left"; w.lines.forEach((ln, li) => { let x = x0; ln.forEach((p) => { ctx.fillStyle = p.accent ? col(S.caption && S.caption.accent || "gold") : col(sr.r.q || "line"); ctx.fillText(p.t, x, y - size * 0.12 + li * w.size * 1.3); x += ctx.measureText(p.t).width; }); }); }
        ctx.globalAlpha = 1;
      });
    }
    function drawQed(s, T, A, yLast) {
      const k = ramp(T, s.qedT, s.qedT + 0.5); if (k > 0) { // underline sweep + ∎
        const a = A * ease.out(k); ctx.globalAlpha = a * 0.8; ctx.strokeStyle = col("sum"); ctx.lineWidth = 3; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(540 - 400 * ease.io(k), yLast + 56); ctx.lineTo(540 + 400 * ease.io(k), yLast + 56); ctx.stroke();
        const s2 = 44 * ease.back(k); ctx.globalAlpha = a; ctx.fillStyle = col("sum"); ctx.fillRect(540 + 400 - s2, yLast + 82, s2, s2); ctx.globalAlpha = 1;
      }
      if (s.note) { const a = A * ease.out(ramp(T, s.noteT, s.noteT + 0.45)); if (a > 0.003) drawRichOrMath(s.note, 540, yLast + 190, 66, col("line"), a, 820); }
    }

    // ---------- subtitles (screen space, one line set at a time) ----------
    const capOn = !(S.caption && S.caption.show === false), accent = (S.caption && S.caption.accent) || "gold";
    function drawCaption(T) {
      if (!capOn || W.__NOSUBS || W.__VP_NOSUBS) return; const c = caps.find((q) => T >= q.start - 0.05 && T < q.end + 0.05); if (!c) return;
      const a = ease.out(ramp(T, c.start - 0.05, c.start + 0.2)) * (1 - ramp(T, c.end - 0.1, c.end + 0.05)); if (a <= 0.003) return;
      const B = BOX.cap, w = VP.wrapRich(ctx, c.cap || c.text, (z) => F.th(z, 600), B.size, B.maxW, 2), lh = w.size * 1.36, top = B.y + (B.h - w.lines.length * lh) / 2 + w.size;
      ctx.globalAlpha = a; ctx.font = F.th(w.size, 600); ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      w.lines.forEach((ln, i) => { const tw = ln.reduce((s, p) => s + ctx.measureText(p.t).width, 0); let x = 540 - tw / 2; ln.forEach((p) => { ctx.fillStyle = p.accent ? col(accent) : pal.text; ctx.fillText(p.t, x, top + i * lh); x += ctx.measureText(p.t).width; }); });
      ctx.globalAlpha = 1;
    }

    // ---------- frame ----------
    const trans = S.transition || "fade";
    function draw(T) {
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.drawImage(ground, 0, 0);
      for (const s of shots) {
        if (T < s.start - 0.01 || T > s.end + FADE) continue;
        const carryNext = s.next && s.next.carry, inK = s.carry || !s.prev ? 1 : ramp(T, s.start, s.start + FADE), outK = s.next ? (carryNext ? (T >= s.end ? 0 : 1) : 1 - ramp(T, s.end, s.end + FADE)) : 1;
        if (outK <= 0) continue;
        let A = Math.min(inK, outK), off = 0;
        if (trans === "cut") A = T >= s.start && (!s.next || T < s.end) ? 1 : 0;
        if (trans === "slide") off = (1 - ease.out(inK)) * 90 - (1 - outK) * 90;
        if (trans === "wipe" && inK < 1) { ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 1080 * ease.io(inK), 1920); ctx.clip(); ctx.drawImage(ground, 0, 0); drawShot(s, T, 1, 0); ctx.restore(); continue; }
        drawShot(s, T, A, off);
      }
      drawCaption(T);
    }

    const clock = { _t: 0, _q: false, get t() { return this._t; }, set t(v) { this._t = v; if (!this._q) { this._q = true; queueMicrotask(() => { this._q = false; draw(this._t); }); } } };
    tl.fromTo(clock, { t: 0 }, { t: TOTAL, duration: TOTAL, ease: "none", immediateRender: false }, 0);
    draw(0);
    const ready = document.fonts && document.fonts.load
      ? Promise.all(['500 60px Newsreader', 'italic 500 60px Newsreader', '600 46px "IBM Plex Sans Thai"', '500 46px "IBM Plex Sans Thai"'].map((f) => document.fonts.load(f, "abn 0123 กขค"))).then(() => { layoutAll(); draw(clock._t); }).catch(() => {})
      : Promise.resolve();
    W.VP_DEBUG = { draw, shots, caps };
    return { ready };
  }

  W.VPK = { boot, expandShot };
})(typeof window !== "undefined" ? window : globalThis);
// genhaha:ed4a029a9d2b
