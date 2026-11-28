// vp-art.js — visual-proof primitive library: 29 flat 2D parts drawn as clean strokes + translucent fills on canvas.
// Every part is DATA in figure units (y grows downward, angles in degrees counter-clockwise as seen on screen).
//   VPA.PARTS[name] = { g: group, req: [required keys], opt: [optional keys], geo(item, u) → { lines, fills, dots, labels, anchor } }
//   VPA.drawItem(ctx, item, state, env)   state = { k: build 0..1, alpha, move: 0..1, glow: 0..1 }, env = { map, u, col(q), pal, enter }
// Lines can be partially traced (k), so every part "builds" by drawing itself; dots pop in one by one.
(function (W) {
  "use strict";
  const VP = W.VP, { clamp, lerp, ease, rgba, mix } = VP;
  const D2R = Math.PI / 180;
  const pol = (x, y, r, deg) => [x + r * Math.cos(deg * D2R), y - r * Math.sin(deg * D2R)];
  const arcPts = (x, y, r, a0, a1, n) => { const out = [], m = n || Math.max(12, Math.ceil(Math.abs(a1 - a0) / 4)); for (let i = 0; i <= m; i++) out.push(pol(x, y, r, lerp(a0, a1, i / m))); return out; };
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
  const len = (v) => Math.hypot(v[0], v[1]);
  const nrm = (v) => { const l = len(v) || 1; return [v[0] / l, v[1] / l]; };
  const perpL = (v) => [v[1], -v[0]];   // left of the direction a→b as seen on screen (y down)
  const add = (a, b, s = 1) => [a[0] + b[0] * s, a[1] + b[1] * s];
  const cen = (pts) => [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length];
  const lab = (p, text, o = {}) => ({ p, text, dx: o.dx || 0, dy: o.dy || 0, size: o.size || 56, q: o.q });
  // side label: put text outside a segment (away from the shape centre c), dist in px
  const sideLab = (a, b, c, text, u, q, size, dist = 44) => { if (text == null || text === "") return null; const m = mid(a, b), n = nrm(perpL(sub(b, a))), out = len(sub(add(m, n, 0.01), c)) > len(sub(m, c)) ? n : [-n[0], -n[1]]; return lab(add(m, out, dist / u), text, { q, size }); };
  const FN = { x: (x) => x, x2: (x) => x * x, x3: (x) => x * x * x, sqrt: (x) => (x < 0 ? NaN : Math.sqrt(x)), sin: Math.sin, cos: Math.cos, exp: Math.exp, inv: (x) => (Math.abs(x) < 1e-3 ? NaN : 1 / x), abs: Math.abs };

  const P = {};
  const def = (name, g, req, opt, geo) => { P[name] = { g, req, opt, geo }; };

  // ---------- lines ----------
  def("seg", "line", ["a", "b"], ["label", "dash"], (it, u) => ({ lines: [{ pts: [it.a, it.b], dash: it.dash }], labels: [sideLab(it.a, it.b, add(mid(it.a, it.b), [0, 1]), it.label, u, it.q, it.size)].filter(Boolean), anchor: mid(it.a, it.b) }));
  def("arrow", "line", ["a", "b"], ["label", "dash"], (it, u) => ({ lines: [{ pts: [it.a, it.b], head: true, dash: it.dash }], labels: [sideLab(it.a, it.b, add(mid(it.a, it.b), [0, 1]), it.label, u, it.q, it.size)].filter(Boolean), anchor: mid(it.a, it.b) }));
  def("poly", "shape", ["pts"], ["fill", "open", "labels"], (it, u) => { const c = cen(it.pts); return { lines: [{ pts: it.pts, closed: !it.open }], fills: it.open ? [] : [{ pts: it.pts }], labels: (it.labels || []).map((t, i) => sideLab(it.pts[i], it.pts[(i + 1) % it.pts.length], c, t, u, it.q, it.size)).filter(Boolean), anchor: c }; });
  def("tri", "shape", ["pts"], ["fill", "labels", "qs"], (it, u) => { const c = cen(it.pts), q = it.qs || []; return { lines: [0, 1, 2].map((i) => ({ pts: [it.pts[i], it.pts[(i + 1) % 3]], q: q[i] })), fills: [{ pts: it.pts }], labels: (it.labels || []).map((t, i) => sideLab(it.pts[i], it.pts[(i + 1) % 3], c, t, u, q[i] || it.q, it.size)).filter(Boolean), anchor: c }; });
  // right triangle: right angle at (x,y), leg a along rot, leg b along rot+90; qa/qb/qc colour each side; la/lb/lc label them
  def("rtri", "shape", ["x", "y", "a", "b"], ["rot", "qa", "qb", "qc", "la", "lb", "lc", "mark", "fill"], (it, u) => {
    const r = it.rot || 0, R = [it.x, it.y], A = pol(it.x, it.y, it.a, r), B = pol(it.x, it.y, it.b, r + 90), c = cen([R, A, B]), m = 0.22 * Math.min(it.a, it.b, 1.2 * 28 / u * 4);
    const s = Math.min(26 / u, Math.min(it.a, it.b) * 0.3), e1 = pol(it.x, it.y, s, r), e2 = pol(it.x, it.y, s, r + 90), e3 = add(e1, sub(e2, R));
    return { lines: [{ pts: [R, A], q: it.qa }, { pts: [A, B], q: it.qc }, { pts: [B, R], q: it.qb }].concat(it.mark === false ? [] : [{ pts: [e1, e3, e2], thin: true, q: "line" }]), fills: [{ pts: [R, A, B] }],
      labels: [sideLab(R, A, c, it.la, u, it.qa, it.size), sideLab(B, R, c, it.lb, u, it.qb, it.size), sideLab(A, B, c, it.lc, u, it.qc, it.size)].filter(Boolean), anchor: c, _m: m };
  });
  def("square", "shape", ["x", "y", "s"], ["rot", "label", "fill"], (it, u) => { const r = it.rot || 0, A = [it.x, it.y], B = pol(it.x, it.y, it.s, r), C = add(B, sub(pol(it.x, it.y, it.s, r - 90), A)), Dd = pol(it.x, it.y, it.s, r - 90), pts = [A, B, C, Dd], c = cen(pts); return { lines: [{ pts, closed: true }], fills: [{ pts }], labels: it.label != null ? [lab(c, it.label, { q: it.q, size: it.size || 64 })] : [], anchor: c }; });
  // square erected on segment a→b (side "left" or "right" of the direction as seen on screen)
  def("sqside", "shape", ["a", "b"], ["side", "label", "fill"], (it, u) => { const v = sub(it.b, it.a), n = perpL(v), s = it.side === "right" ? -1 : 1, C = add(it.b, n, s), Dd = add(it.a, n, s), pts = [it.a, it.b, C, Dd], c = cen(pts); return { lines: [{ pts, closed: true }], fills: [{ pts }], labels: it.label != null ? [lab(c, it.label, { q: it.q, size: it.size || 64 })] : [], anchor: c }; });
  def("rect", "shape", ["x", "y", "w", "h"], ["label", "fill"], (it) => { const pts = [[it.x, it.y], [it.x + it.w, it.y], [it.x + it.w, it.y + it.h], [it.x, it.y + it.h]], c = cen(pts); return { lines: [{ pts, closed: true }], fills: [{ pts }], labels: it.label != null ? [lab(c, it.label, { q: it.q, size: it.size || 60 })] : [], anchor: c }; });
  def("circle", "shape", ["x", "y", "r"], ["label", "fill"], (it) => { const pts = arcPts(it.x, it.y, it.r, 90, 450, 96); return { lines: [{ pts }], fills: [{ pts }], labels: it.label != null ? [lab([it.x, it.y], it.label, { q: it.q, size: it.size || 60 })] : [], anchor: [it.x, it.y] }; });
  def("ngon", "shape", ["x", "y", "r", "n"], ["rot", "label", "fill"], (it) => { const pts = []; for (let i = 0; i < it.n; i++) pts.push(pol(it.x, it.y, it.r, 90 + (it.rot || 0) + (360 * i) / it.n)); return { lines: [{ pts, closed: true }], fills: [{ pts }], labels: it.label != null ? [lab([it.x, it.y], it.label, { q: it.q, size: it.size || 60 })] : [], anchor: [it.x, it.y] }; });
  def("arc", "line", ["x", "y", "r", "from", "to"], ["label"], (it, u) => ({ lines: [{ pts: arcPts(it.x, it.y, it.r, it.from, it.to) }], labels: it.label != null ? [lab(pol(it.x, it.y, it.r + 40 / u, (it.from + it.to) / 2), it.label, { q: it.q, size: it.size })] : [], anchor: pol(it.x, it.y, it.r, (it.from + it.to) / 2) }));
  def("sector", "shape", ["x", "y", "r", "from", "to"], ["label", "fill"], (it, u) => { const pts = [[it.x, it.y]].concat(arcPts(it.x, it.y, it.r, it.from, it.to)); return { lines: [{ pts, closed: true }], fills: [{ pts }], labels: it.label != null ? [lab(pol(it.x, it.y, it.r * 0.6, (it.from + it.to) / 2), it.label, { q: it.q, size: it.size })] : [], anchor: pol(it.x, it.y, it.r * 0.5, (it.from + it.to) / 2) }; });

  // ---------- marks ----------
  def("angle", "mark", ["x", "y", "from", "to"], ["r", "label", "fill"], (it, u) => { const r = it.r || 70 / u, pts = arcPts(it.x, it.y, r, it.from, it.to, 24); return { lines: [{ pts }], fills: it.fill === false ? [] : [{ pts: [[it.x, it.y]].concat(pts) }], labels: it.label != null ? [lab(pol(it.x, it.y, r + 42 / u, (it.from + it.to) / 2), it.label, { q: it.q, size: it.size || 50 })] : [], anchor: pol(it.x, it.y, r, (it.from + it.to) / 2) }; });
  def("right", "mark", ["x", "y"], ["rot", "s"], (it, u) => { const s = it.s || 26 / u, R = [it.x, it.y], e1 = pol(it.x, it.y, s, it.rot || 0), e2 = pol(it.x, it.y, s, (it.rot || 0) + 90); return { lines: [{ pts: [e1, add(e1, sub(e2, R)), e2], thin: true }], anchor: R }; });
  def("brace", "mark", ["a", "b"], ["label", "side"], (it, u) => {
    const v = sub(it.b, it.a), L = len(v), t = nrm(v), n0 = perpL(t), n = it.side === "right" ? [-n0[0], -n0[1]] : n0, h = 26 / u, pts = [];
    for (let i = 0; i <= 40; i++) { const s = i / 40, off = h * (Math.min(1, Math.min(s, 1 - s) * 10) * 0.55 + (Math.abs(s - 0.5) < 0.05 ? (1 - Math.abs(s - 0.5) / 0.05) * 0.9 : 0)); pts.push(add(add(it.a, t, L * s), n, off)); }
    return { lines: [{ pts, thin: true }], labels: it.label != null ? [lab(add(mid(it.a, it.b), n, h + 46 / u), it.label, { q: it.q, size: it.size || 54 })] : [], anchor: mid(it.a, it.b) };
  });
  def("dim", "mark", ["a", "b"], ["label", "off"], (it, u) => { const t = nrm(sub(it.b, it.a)), n = perpL(t), o = it.off != null ? it.off : 0.5, a = add(it.a, n, o), b = add(it.b, n, o), k = 14 / u; return { lines: [{ pts: [a, b], thin: true }, { pts: [add(a, n, -k), add(a, n, k)], thin: true }, { pts: [add(b, n, -k), add(b, n, k)], thin: true }], labels: it.label != null ? [lab(add(mid(a, b), n, 40 / u), it.label, { q: it.q, size: it.size || 52 })] : [], anchor: mid(a, b) }; });
  def("ticks", "mark", ["a", "b"], ["n"], (it, u) => { const m = mid(it.a, it.b), t = nrm(sub(it.b, it.a)), n = perpL(t), k = 16 / u, g = 10 / u, cnt = it.n || 1, lines = []; for (let i = 0; i < cnt; i++) { const c = add(m, t, (i - (cnt - 1) / 2) * g); lines.push({ pts: [add(c, n, -k), add(c, n, k)], thin: true }); } return { lines, anchor: m }; });
  def("mark", "mark", ["x", "y", "kind"], ["size"], (it, u) => { const s = (it.size || 60) / u / 2, x = it.x, y = it.y; const lines = it.kind === "check" ? [{ pts: [[x - s, y], [x - s * 0.3, y + s * 0.7], [x + s, y - s * 0.8]] }] : it.kind === "cross" ? [{ pts: [[x - s, y - s], [x + s, y + s]] }, { pts: [[x + s, y - s], [x - s, y + s]] }] : []; const fills = it.kind === "qed" ? [{ pts: [[x - s, y - s], [x + s, y - s], [x + s, y + s], [x - s, y + s]], solid: true }] : []; return { lines, fills, anchor: [x, y] }; });
  def("label", "mark", ["x", "y", "text"], ["size"], (it) => ({ labels: [lab([it.x, it.y], it.text, { q: it.q, size: it.size || 56 })], anchor: [it.x, it.y] }));
  def("point", "mark", ["x", "y"], ["name", "dir", "r"], (it, u) => ({ dots: [{ p: [it.x, it.y], r: it.r || 12, px: true }], labels: it.name != null ? [lab(pol(it.x, it.y, 44 / u, it.dir != null ? it.dir : 45), it.name, { q: it.q, size: it.size || 52 })] : [], anchor: [it.x, it.y] }));
  def("dot", "mark", ["x", "y"], ["r"], (it) => ({ dots: [{ p: [it.x, it.y], r: it.r || 12, px: true }], anchor: [it.x, it.y] }));

  // ---------- grids, counts ----------
  def("grid", "grid", ["x", "y", "w", "h"], ["step"], (it) => { const s = it.step || 1, lines = []; for (let i = 0; i <= it.w / s + 1e-6; i++) lines.push({ pts: [[it.x + i * s, it.y], [it.x + i * s, it.y + it.h]], thin: true }); for (let j = 0; j <= it.h / s + 1e-6; j++) lines.push({ pts: [[it.x, it.y + j * s], [it.x + it.w, it.y + j * s]], thin: true }); return { lines, anchor: [it.x + it.w / 2, it.y + it.h / 2], faint: true }; });
  def("dots", "grid", ["x", "y", "cols", "rows"], ["gap", "r"], (it) => { const g = it.gap || 1, dots = []; for (let j = 0; j < it.rows; j++) for (let i = 0; i < it.cols; i++) dots.push({ p: [it.x + i * g, it.y + j * g], r: it.r || Math.max(9, 0.2 * g * u) }); return { dots, anchor: [it.x + (it.cols - 1) * g / 2, it.y + (it.rows - 1) * g / 2] }; });
  const cell = (x, y, p) => { const q = [[x + p, y + p], [x + 1 - p, y + p], [x + 1 - p, y + 1 - p], [x + p, y + 1 - p]]; return q; };
  def("cells", "grid", ["x", "y", "cols", "rows"], ["label", "fill"], (it) => { const fills = [], lines = []; for (let j = 0; j < it.rows; j++) for (let i = 0; i < it.cols; i++) { const q = cell(it.x + i, it.y + j, 0.06); fills.push({ pts: q }); lines.push({ pts: q, closed: true, thin: true }); } const c = [it.x + it.cols / 2, it.y + it.rows / 2]; return { lines, fills, labels: it.label != null ? [lab(c, it.label, { q: it.q, size: it.size || 60 })] : [], anchor: c, seq: true }; });
  // L-shaped ring n of an n×n square whose corner is (x,y): the 2n−1 cells/dots with max(i,j) = n−1 (sum of odd numbers, square numbers)
  def("gnomon", "grid", ["x", "y", "n"], ["as", "gap", "r", "label"], (it, u) => {
    const n = it.n, cellsIdx = []; for (let j = 0; j < n; j++) cellsIdx.push([n - 1, j]); for (let i = n - 2; i >= 0; i--) cellsIdx.push([i, n - 1]);
    const g = it.gap || 1, labels = it.label != null ? [lab([it.x + (n - 1) * g + (it.as === "cells" ? 1 : 0) + 0.25 + 40 / u, it.y + (n - 1) * g + (it.as === "cells" ? 1 : 0) + 40 / u], it.label, { q: it.q, size: it.size || 52 })] : [];
    if (it.as === "cells") { const fills = [], lines = []; for (const [i, j] of cellsIdx) { const q = cell(it.x + i, it.y + j, 0.06); fills.push({ pts: q }); lines.push({ pts: q, closed: true, thin: true }); } return { lines, fills, labels, anchor: [it.x + n - 0.5, it.y + n - 0.5], seq: true }; }
    return { dots: cellsIdx.map(([i, j]) => ({ p: [it.x + i * g, it.y + j * g], r: it.r || Math.max(9, 0.2 * g * u) })), labels, anchor: [it.x + (n - 1) * g, it.y + (n - 1) * g] };
  });
  // ratio bar: parts [{ v, q, label }] split w by value
  def("bar", "grid", ["x", "y", "w", "h", "parts"], ["total"], (it, u) => { const tot = it.total || it.parts.reduce((s, p) => s + (+p.v || 0), 0) || 1; let x = it.x; const fills = [], lines = [], labels = []; for (const p of it.parts) { const w = (it.w * (+p.v || 0)) / tot, q = [[x, it.y], [x + w, it.y], [x + w, it.y + it.h], [x, it.y + it.h]]; fills.push({ pts: q, q: p.q }); lines.push({ pts: q, closed: true, q: p.q }); if (p.label != null) labels.push(lab([x + w / 2, it.y + it.h / 2], p.label, { q: p.q, size: it.size || 50 })); x += w; } return { lines, fills, labels, anchor: [it.x + it.w / 2, it.y + it.h / 2], seq: true }; });
  // number line from..to over x..x+w at height y; labels "all" | "none" | [values]
  def("numline", "grid", ["x", "y", "w", "from", "to"], ["step", "labels"], (it, u) => { const st = it.step || 1, sx = (v) => it.x + ((v - it.from) / (it.to - it.from)) * it.w, lines = [{ pts: [[it.x - 0.3, it.y], [it.x + it.w + 0.3, it.y]], head: true }], labels = []; const want = it.labels == null || it.labels === "all" ? null : it.labels; for (let v = it.from; v <= it.to + 1e-6; v += st) { const vv = +v.toFixed(6), k = 14 / u; lines.push({ pts: [[sx(vv), it.y - k], [sx(vv), it.y + k]], thin: true }); if (it.labels !== "none" && (!want || want.includes(vv))) labels.push(lab([sx(vv), it.y + 62 / u], String(vv), { q: it.q || "soft", size: it.size || 54 })); } return { lines, labels, anchor: [it.x + it.w / 2, it.y] }; });
  // jump arrow on a number line: from value a to value b (needs the line's x,w,from,to) or from point a to point b
  def("jump", "line", ["a", "b"], ["h", "label"], (it, u) => { const h = it.h != null ? it.h : len(sub(it.b, it.a)) * 0.45, m = mid(it.a, it.b), n = perpL(nrm(sub(it.b, it.a))), c = add(m, n, h), pts = []; for (let i = 0; i <= 28; i++) { const s = i / 28, p = add(add(it.a, sub(c, it.a), 2 * s * (1 - s)), sub(it.b, it.a), s * s); pts.push(p); } return { lines: [{ pts, head: true }], labels: it.label != null ? [lab(add(m, n, h * 0.5 + 44 / u), it.label, { q: it.q, size: it.size || 48 })] : [], anchor: add(m, n, h * 0.5) }; });
  def("axes", "grid", ["x", "y", "w", "h"], ["xr", "yr", "step", "labels"], (it, u) => { const xr = it.xr || [0, 1], yr = it.yr || [0, 1], X = (v) => it.x + ((v - xr[0]) / (xr[1] - xr[0])) * it.w, Y = (v) => it.y + it.h - ((v - yr[0]) / (yr[1] - yr[0])) * it.h, x0 = X(clamp(0, xr[0], xr[1])), y0 = Y(clamp(0, yr[0], yr[1])); const lines = [{ pts: [[it.x, y0], [it.x + it.w + 0.2, y0]], head: true }, { pts: [[x0, it.y + it.h], [x0, it.y - 0.2]], head: true }]; const labels = []; if (it.labels) for (const [t, p] of [["x", [it.x + it.w + 0.2 + 30 / u, y0]], ["y", [x0, it.y - 0.2 - 30 / u]]]) labels.push(lab(p, it.labels === true ? t : it.labels[t === "x" ? 0 : 1], { q: it.q || "soft", size: it.size || 46 })); return { lines, labels, anchor: [it.x + it.w / 2, it.y + it.h / 2] }; });
  // graph of y = a·f(b·x) + c inside the box x,y,w,h mapped to xr × yr (same numbers as the axes part)
  def("graph", "line", ["fn", "x", "y", "w", "h"], ["a", "b", "c", "xr", "yr", "label"], (it, u) => { const f = FN[it.fn] || FN.x, xr = it.xr || [0, 1], yr = it.yr || [0, 1], A = it.a != null ? it.a : 1, B = it.b != null ? it.b : 1, C = it.c || 0, segs = [[]]; for (let i = 0; i <= 160; i++) { const xv = lerp(xr[0], xr[1], i / 160), yv = A * f(B * xv) + C; if (!isFinite(yv) || yv < yr[0] - 1e-6 || yv > yr[1] + 1e-6) { if (segs[segs.length - 1].length) segs.push([]); continue; } segs[segs.length - 1].push([it.x + ((xv - xr[0]) / (xr[1] - xr[0])) * it.w, it.y + it.h - ((yv - yr[0]) / (yr[1] - yr[0])) * it.h]); } const lines = segs.filter((s) => s.length > 1).map((pts) => ({ pts })); const last = lines.length ? lines[lines.length - 1].pts.slice(-1)[0] : [it.x, it.y]; return { lines, labels: it.label != null ? [lab(add(last, [0, 0]), it.label, { q: it.q, size: it.size || 48, dx: 10, dy: -40 })] : [], anchor: last }; });

  // ---------- drawing ----------
  const geoCache = new WeakMap();
  function geoOf(it, u) { let g = geoCache.get(it); if (!g || g.u !== u) { g = Object.assign({ lines: [], fills: [], dots: [], labels: [] }, P[it.part].geo(it, u)); g.u = u; geoCache.set(it, g); } return g; }
  const pivCache = new WeakMap();
  function pivotOf(it) { let v = pivCache.get(it); if (!v) { v = P[it.part].geo(it, 60).anchor || [0, 0]; pivCache.set(it, v); } return v; }
  function tfPoint(p, it, s) { // move: rotate around pivot then translate (units)
    const to = it.to; if (!to || s <= 0) return p; const pv = to.pivot || pivotOf(it), th = -(to.rot || 0) * s * D2R, co = Math.cos(th), si = Math.sin(th);
    const dx = p[0] - pv[0], dy = p[1] - pv[1]; return [pv[0] + dx * co - dy * si + (to.dx || 0) * s, pv[1] + dx * si + dy * co + (to.dy || 0) * s];
  }
  function drawLabel(ctx, L, x, y, col, alpha, sc = 1) { if (alpha <= 0.003) return; const sz = L.size * sc, tk = typeof L.text === "object" ? L.text : String(L.text), m = VP.measureToken(ctx, tk, sz); ctx.globalAlpha = alpha; m.draw(ctx, x + L.dx - m.w / 2, y + L.dy + sz * 0.3, col); ctx.globalAlpha = 1; }
  // state.k: 0..1 build; enter: trace | grow | drop | fade
  function drawItem(ctx, it, st, env) {
    const g = geoOf(it, env.u), enter = it.enter || env.enter || "trace", k = clamp(st.k), a0 = clamp(st.alpha == null ? 1 : st.alpha);
    if (k <= 0 || a0 <= 0.003) return;
    const pal = env.pal, base = env.col(it.q || "line"), glow = st.glow || 0, colOf = (q) => { const c = q ? env.col(q) : base; return glow ? mix(c, pal.dark ? "#ffffff" : "#000000", 0.25 * glow) : c; };
    const tr = enter === "trace" ? ease.io(clamp(k / 0.75)) : 1, fillK = enter === "trace" ? ease.io(clamp((k - 0.45) / 0.55)) : ease.out(k);
    const alpha = a0 * (enter === "trace" ? 1 : ease.out(k)), pre = enter === "grow" ? 0.6 + 0.4 * ease.back(k) : 1, dropY = enter === "drop" ? (1 - ease.out(k)) * -60 : 0;
    const anc = env.map(tfPoint(g.anchor || [0, 0], it, st.move || 0));
    const M = (p) => { const q = env.map(tfPoint(p, it, st.move || 0)); return pre === 1 && !dropY ? q : [anc[0] + (q[0] - anc[0]) * pre, anc[1] + (q[1] - anc[1]) * pre + dropY]; };
    const lw = (it.w || (g.faint ? 1.6 : 3)) * (env.lineScale || 1), fa = it.fill === false ? 0 : it.fill != null && it.fill !== true ? +it.fill : pal.fill;
    // fills
    for (let i = 0; i < g.fills.length; i++) { const f = g.fills[i], seqK = g.seq ? clamp(k * g.fills.length - i) : fillK; if (seqK <= 0) continue; ctx.globalAlpha = alpha * (f.solid ? 1 : fa * (1 + 0.5 * glow)) * (g.seq ? ease.out(seqK) : seqK); ctx.fillStyle = colOf(f.q); ctx.beginPath(); f.pts.forEach((p, j) => { const q = M(p); j ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); ctx.closePath(); ctx.fill(); }
    // strokes, traced in order by length
    const ls = g.lines.map((l) => { const pts = (l.closed ? l.pts.concat([l.pts[0]]) : l.pts).map(M); let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return { l, pts, L }; });
    const total = ls.reduce((s, x) => s + x.L, 0); let budget = g.seq ? Infinity : tr * total;
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    ls.forEach((x, idx) => {
      if (g.seq) { const sk = clamp(k * ls.length - idx); if (sk <= 0) return; ctx.globalAlpha = alpha * ease.out(sk) * (g.faint ? 0.35 : 1); } else { if (budget <= 0) return; ctx.globalAlpha = alpha * (g.faint ? 0.35 : 1); }
      ctx.strokeStyle = colOf(x.l.q); ctx.lineWidth = x.l.thin ? Math.max(1.5, lw * 0.66) : lw; ctx.setLineDash(x.l.dash ? [14, 12] : []);
      ctx.beginPath(); ctx.moveTo(x.pts[0][0], x.pts[0][1]); let left = g.seq ? Infinity : budget, end = x.pts[0], dir = [1, 0];
      for (let i = 1; i < x.pts.length; i++) { const a = x.pts[i - 1], b = x.pts[i], d = Math.hypot(b[0] - a[0], b[1] - a[1]); if (d <= 1e-6) continue; dir = [(b[0] - a[0]) / d, (b[1] - a[1]) / d]; if (left >= d) { ctx.lineTo(b[0], b[1]); left -= d; end = b; } else { end = [a[0] + dir[0] * left, a[1] + dir[1] * left]; ctx.lineTo(end[0], end[1]); left = 0; break; } }
      ctx.stroke(); ctx.setLineDash([]);
      if (x.l.head && (g.seq || budget >= x.L - 0.5)) { const h = 22 * (env.lineScale || 1), wv = 11 * (env.lineScale || 1); ctx.fillStyle = colOf(x.l.q); ctx.beginPath(); ctx.moveTo(end[0], end[1]); ctx.lineTo(end[0] - dir[0] * h - dir[1] * wv, end[1] - dir[1] * h + dir[0] * wv); ctx.lineTo(end[0] - dir[0] * h + dir[1] * wv, end[1] - dir[1] * h - dir[0] * wv); ctx.closePath(); ctx.fill(); }
      if (!g.seq) budget -= x.L;
    });
    // dots pop in one by one
    g.dots.forEach((d, i) => { const dk = g.dots.length > 1 ? clamp(k * (g.dots.length + 2) / 1 - i * 1) / 1 : k, s = ease.back(clamp(dk)); if (s <= 0) return; const q = M(d.p); ctx.globalAlpha = alpha * clamp(dk * 2); ctx.fillStyle = colOf(); ctx.beginPath(); ctx.arc(q[0], q[1], Math.max(0.1, d.r * (d.px ? env.lineScale || 1 : 1) * s * (1 + 0.15 * glow)), 0, Math.PI * 2); ctx.fill(); });
    // labels after the shape
    const lk = clamp((k - 0.7) / 0.3);
    for (const L of g.labels) { const q = M(L.p); drawLabel(ctx, L, q[0], q[1], colOf(L.q), alpha * ease.out(lk), env.labelScale || 1); }
    ctx.globalAlpha = 1;
  }
  const anchorPx = (it, env, s) => env.map(tfPoint(geoOf(it, env.u).anchor || [0, 0], it, s || 0));
  // bounding box of an item in units (for auto view)
  function bbox(it) { const g = P[it.part].geo(it, 60), pts = []; g.lines && g.lines.forEach((l) => pts.push(...l.pts)); g.fills && g.fills.forEach((f) => pts.push(...f.pts)); g.dots && g.dots.forEach((d) => pts.push(d.p)); g.labels && g.labels.forEach((l) => pts.push(l.p)); if (g.anchor) pts.push(g.anchor);
    if (it.to) { const more = pts.map((p) => tfPoint(p, it, 1)); pts.push(...more); } return pts; }

  W.VPA = { PARTS: P, FN, drawItem, anchorPx, bbox, geoOf, pol };
})(typeof window !== "undefined" ? window : globalThis);
// genhaha:ed4a029a9d2b
