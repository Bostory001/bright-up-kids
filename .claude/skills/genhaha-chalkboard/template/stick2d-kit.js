// stick2d-kit.js — 2D stickman kit (classic script; SVG + GSAP + Motion only: no images, no WebGL).
// Two looks in one rig (theme "talk" / "ink"); everything is a pure function of the GSAP timeline, mouths flap on the real per-character TTS timing.
//
//   <script src="stick2d-kit.js"></script>   after motion.js and captions.js, with stick.css; <div id="stage"> must exist (the kit builds an <svg> in it)
//   const S = Stick2D(tl, M, { theme: "talk" });                       // "talk" = flat big-head dialogue guys · "ink" = thick-line black stickman on grey vignette
//   const kid = S.char({ x: 300, y: 1210, s: 0.85, skin: "#e2a66b", shirt: "#fff" });
//   const prof = S.char({ x: 760, y: 1210, s: 0.85, shirt: "#4a4a4a", hair: "einstein", glasses: true, mustache: true, flip: true });
//   kid.say("h1");  kid.face(0.3, "happy");  prof.pose("point", 2.0);       // say(key) = mouth flaps + hand gestures while that caption line is spoken
//
// S.char(o) → character: { root, say(key,{gest}), face(t,name), pose(name|{L:[a,e],R:[a,e]}, t, d), lean(t,deg,d), head(t,deg,d), walk(t0,t1,toX), wave(t,n),
//                          hold(side, svgString), hop(t,h), show(t) hide(t), faceNames }
// Faces: neutral happy grin surprised sad angry smug worried shock think · Poses: idle talk1 talk2 talk3 point pointUp shrug hips up hold facepalm fist grab
// S.blob(o), S.can(o) (ink theme extras), S.layer(name) / S.cut(t, from, to, {swipe}) scenes, S.cam(t, fx, fy, z, d) camera, S.icon(kind, x, y, t, d) bang quest sweat vein heart zzz,
// S.shake(t, amp), S.flash(t, a), S.title(html, t0, t1), S.pop(el, t, cx, cy), S.add(parent, svg), S.world, S.fx, S.T (theme)
(function () {
  window.Stick2D = function (tl, M, opts = {}) {
    const { CAP } = M;
    const NS = "http://www.w3.org/2000/svg";
    const THEMES = {
      talk: { bg: "#78aeb9", line: "#151515", lw: 6.5, skin: "#e8a76c", grain: 0.5 },
      ink: { bg: "#d7d7d7", line: "#0b0b0b", lw: 15, skin: "#f6f6f6", grain: 0.18 },
    };
    const T = Object.assign({}, THEMES[opts.theme || "talk"], opts.palette || {}); T.name = opts.theme || "talk";
    const CH = (window.TTS_TIMING && window.TTS_TIMING.chars) || [];
    let uid = 0;
    const r2 = (n) => Math.round(n * 100) / 100;

    // ---------- svg scaffold ----------
    const stage = document.querySelector("#stage");
    const rootEl = document.querySelector("#root"), FW = +(rootEl && rootEl.dataset.width) || 1080, FH = +(rootEl && rootEl.dataset.height) || 1920;   // frame: 1080x1920 (9:16) or 1920x1080 (16:9)
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", `0 0 ${FW} ${FH}`); svg.setAttribute("width", String(FW)); svg.setAttribute("height", String(FH)); svg.id = "sk";
    svg.innerHTML = `<defs>
      <filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="6"/><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.6 0 0 0 -0.62"/></filter>
      <filter id="blur6" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="9"/></filter>
      <radialGradient id="vig" cx="50%" cy="46%" r="75%"><stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="${T.name === "ink" ? 0.42 : 0.3}"/></radialGradient>
      <radialGradient id="inkbg" cx="50%" cy="48%" r="70%"><stop offset="0" stop-color="#ececec"/><stop offset="1" stop-color="#8d8d8d"/></radialGradient>
      <linearGradient id="shade" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0.35"/><stop offset="0.55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.22"/></linearGradient>
      <radialGradient id="skinshade" cx="38%" cy="34%" r="80%"><stop offset="0" stop-color="#fff" stop-opacity="0.22"/><stop offset="0.7" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.18"/></radialGradient>
    </defs>
    <rect id="bg" width="${FW}" height="${FH}" fill="${T.name === "ink" ? "url(#inkbg)" : T.bg}"/>
    <g id="shk" data-layout-allow-overflow><g id="world"></g></g>
    <rect width="${FW}" height="${FH}" filter="url(#grain)" opacity="${T.grain}" style="mix-blend-mode:multiply" pointer-events="none"/>
    <rect width="${FW}" height="${FH}" fill="url(#vig)" pointer-events="none"/>
    <g id="fx" data-layout-allow-overflow></g>`;
    stage.appendChild(svg);
    const shk = svg.querySelector("#shk"), world = svg.querySelector("#world"), fx = svg.querySelector("#fx"), bg = svg.querySelector("#bg");
    const add = (parent, html, attrs) => { const g = document.createElementNS(NS, "g"); g.innerHTML = html; if (attrs) for (const k in attrs) g.setAttribute(k, attrs[k]); parent.appendChild(g); return g; };
    const stroke = (w = T.lw, col = T.line) => `stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
    const O = (x, y) => ({ svgOrigin: `${x} ${y}` });

    // ---------- faces (100-unit head radius, y down) ----------
    const EX = {
      neutral: { eye: "dot", brow: [[-52, -34, -20, -38], [20, -38, 52, -34]], mouth: "M-20 42 L20 42" },
      happy: { eye: "dot", brow: [[-52, -42, -20, -48], [20, -48, 52, -42]], mouth: "M-30 28 Q0 64 30 28" },
      grin: { eye: "arc", brow: [[-52, -44, -20, -48], [20, -48, 52, -44]], mouth: "M-36 24 Q0 78 36 24 Z", fill: "#3b1212" },
      surprised: { eye: "wide", brow: [[-52, -60, -20, -66], [20, -66, 52, -60]], oval: [0, 46, 11, 15] },
      sad: { eye: "dot", brow: [[-54, -28, -22, -44], [22, -44, 54, -28]], mouth: "M-24 52 Q0 30 24 52" },
      angry: { eye: "dot", brow: [[-58, -52, -12, -20], [12, -20, 58, -52]], mouth: "M-28 48 Q0 30 28 48", clench: true },
      smug: { eye: "lid", brow: [[-52, -30, -20, -34], [20, -52, 52, -42]], mouth: "M-24 38 Q8 46 30 24" },
      worried: { eye: "dot", brow: [[-54, -30, -22, -46], [22, -46, 54, -30]], mouth: "M-28 46 q9 -9 14 0 q9 9 14 0" },
      shock: { eye: "wide", brow: [[-56, -66, -20, -72], [20, -72, 56, -66]], oval: [0, 56, 21, 29] },
      think: { eye: "look", brow: [[-52, -32, -20, -36], [20, -50, 52, -40]], mouth: "M-4 44 L28 38" },
    };
    const faceSVG = (n, R, col, sw) => {
      const e = EX[n], k = R / 100, w = sw / k; let s = "";
      const eyeAt = (x) => {
        if (e.eye === "dot") return `<circle cx="${x}" cy="-6" r="9" fill="${col}"/>`;
        if (e.eye === "arc") return `<path d="M${x - 15} 0 Q${x} -22 ${x + 15} 0" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`;
        if (e.eye === "wide") return `<circle cx="${x}" cy="-6" r="17" fill="#fff" stroke="${col}" stroke-width="${w * 0.8}"/><circle cx="${x}" cy="-6" r="6" fill="${col}"/>`;
        if (e.eye === "lid") return `<circle cx="${x}" cy="-3" r="9" fill="${col}"/><path d="M${x - 16} -9 L${x + 16} -9" stroke="${col}" stroke-width="${w * 1.1}" stroke-linecap="round"/>`;
        return `<circle cx="${x + 5}" cy="-12" r="9" fill="${col}"/>`;                     // look
      };
      s += eyeAt(-36) + eyeAt(36);
      for (const b of e.brow) s += `<path d="M${b[0]} ${b[1]} L${b[2]} ${b[3]}" stroke="${col}" stroke-width="${w * 1.15}" stroke-linecap="round"/>`;
      if (e.mouth) s += `<path d="${e.mouth}" fill="${e.fill || "none"}" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
      if (e.oval) s += `<ellipse cx="${e.oval[0]}" cy="${e.oval[1]}" rx="${e.oval[2]}" ry="${e.oval[3]}" fill="#3b1212" stroke="${col}" stroke-width="${w * 0.8}"/>`;
      return `<g transform="scale(${k})">${s}</g>`;
    };
    const MOUTH = (R, col, sw) => { const k = R / 100, w = sw / k;
      return [`<g transform="scale(${k})"><ellipse cx="0" cy="44" rx="17" ry="9" fill="#3b1212" stroke="${col}" stroke-width="${w * 0.8}"/></g>`,
        `<g transform="scale(${k})"><ellipse cx="0" cy="46" rx="22" ry="21" fill="#3b1212" stroke="${col}" stroke-width="${w * 0.8}"/><ellipse cx="0" cy="58" rx="12" ry="8" fill="#e5646e"/></g>`]; };

    // ---------- poses: [outward angle a, elbow bend e] per arm (left arm = screen left) ----------
    const POSE = {
      idle: { L: [10, 8], R: [10, 8] }, talk1: { L: [10, 8], R: [32, 118] }, talk2: { L: [32, 118], R: [12, 10] }, talk3: { L: [28, 104], R: [28, 104] },
      point: { L: [10, 8], R: [92, 0] }, pointUp: { L: [10, 8], R: [160, 0] }, shrug: { L: [40, 125], R: [40, 125] }, hips: { L: [52, 118], R: [52, 118] },
      up: { L: [150, 6], R: [150, 6] }, hold: { L: [24, 98], R: [24, 98] }, facepalm: { L: [10, 8], R: [14, 158] }, fist: { L: [38, 100], R: [38, 100] },
      grab: { L: [10, 8], R: [88, 12] },
    };
    const GEST = ["talk1", "talk2", "talk3", "idle", "talk2", "talk1"];

    // ---------- character ----------
    const char = (o = {}) => {
      const id = ++uid, ink = (o.style || T.name) === "ink", sc = o.s ?? 1, lw = o.lw ?? T.lw, col = o.line || T.line;
      const G = ink ? { hipY: -300, hipX: 8, shY: -535, shX: 0, up: 140, fo: 140, hy: -625, R: 62, hand: 21, legSplay: 7 }
        : { hipY: -250, hipX: 34, shY: -522, shX: 84, up: 130, fo: 125, hy: -662, R: 125, hand: 11, legSplay: 1 };
      const skin = o.skin || T.skin, shirt = o.shirt || "#fff";
      const root = add(o.layer || world, "");
      root.classList.add("ch");
      gsap.set(root, { x: o.x ?? 540, y: o.y ?? 1200, scaleX: sc * (o.flip ? -1 : 1), scaleY: sc, ...O(0, 0) });
      const parts = {};
      const mk = (name, html, parent = root) => { const g = add(parent, html); parts[name] = g; return g; };
      if (!o.noShadow) mk("shadow", `<ellipse cx="0" cy="4" rx="${ink ? 120 : 110}" ry="${ink ? 16 : 14}" fill="#000" opacity="${ink ? 0.22 : 0.12}" filter="url(#blur6)"/>`);
      // legs (swing around the hip)
      const leg = (side) => {
        const hx = side * G.hipX, len = -G.hipY, ex = side * (ink ? 0 : 0);
        const g = mk(side < 0 ? "legL" : "legR", `<path d="M${hx} ${G.hipY} L${hx + ex} 0" fill="none" ${stroke(lw, col)}/>${ink ? `<ellipse cx="${hx + ex + side * 10}" cy="-8" rx="27" ry="13" fill="${col}"/>` : `<path d="M${hx} -2 l${side * 22} 4" fill="none" ${stroke(lw, col)}/>`}`);
        gsap.set(g, { rotation: side * -G.legSplay, ...O(hx, G.hipY) }); return g;
      };
      leg(-1); leg(1);
      const up = mk("up", "");
      gsap.set(up, O(0, G.hipY));
      // torso
      if (ink) mk("torso", `<path d="M0 ${G.hipY} L0 ${G.shY}" fill="none" ${stroke(lw, col)}/>`, up);
      else mk("torso", `<path d="M-86 -540 C-104 -430 -112 -330 -98 -246 Q0 -224 98 -246 C112 -330 104 -430 86 -540 Q0 -568 -86 -540Z" fill="${shirt}" ${stroke(lw, col)}/><path d="M-86 -540 C-104 -430 -112 -330 -98 -246 Q0 -224 98 -246 C112 -330 104 -430 86 -540 Q0 -568 -86 -540Z" fill="url(#shade)"/>`, up);
      // arms: shoulder group > forearm group (all absolute coords, rotated about svgOrigin)
      const arm = (side) => {
        const sx = side * G.shX, sy = G.shY, ey = sy + G.up, hy = ey + G.fo;
        const sh = mk(side < 0 ? "armL" : "armR", `<path d="M${sx} ${sy} L${sx} ${ey}" fill="none" ${stroke(lw, col)}/>`, up);
        const fo = add(sh, `<path d="M${sx} ${ey} L${sx} ${hy}" fill="none" ${stroke(lw, col)}/><circle cx="${sx}" cy="${hy + (ink ? 0 : 4)}" r="${G.hand}" fill="${ink ? col : skin}" ${ink ? "" : stroke(lw * 0.8, col)}/>`);
        parts[side < 0 ? "foreL" : "foreR"] = fo; fo.dataset.hx = sx; fo.dataset.hy = hy;
        gsap.set(sh, O(sx, sy)); gsap.set(fo, O(sx, ey));
        return sh;
      };
      arm(-1); arm(1);
      // head
      const R = G.R, hy = G.hy;
      const head = mk("head", "", up); gsap.set(head, O(0, hy + R));
      if (o.hair === "einstein") {
        let p = ""; const pts = [];
        for (let a = 150; a <= 390; a += 6) { const t = (a * Math.PI) / 180, rr = R * (1.2 + 0.15 * Math.sin(a * 0.43) + 0.08 * Math.sin(a * 0.97)); pts.push([Math.cos(t) * rr, hy + Math.sin(t) * rr]); }
        p = "M" + pts.map((q) => `${r2(q[0])} ${r2(q[1])}`).join(" L") + ` L${r2(R * 0.9)} ${hy + R * 0.3} L${r2(-R * 0.9)} ${hy + R * 0.3} Z`;
        add(head, `<path d="${p}" fill="#f1f1f1" ${stroke(lw, col)}/>`);
      }
      add(head, `<circle cx="0" cy="${hy}" r="${R}" fill="${ink ? skin : skin}" ${stroke(lw, col)}/>${ink ? "" : `<circle cx="0" cy="${hy}" r="${R}" fill="url(#skinshade)"/>`}`);
      if (o.hair === "einstein") add(head, `<path d="M${-R * 0.95} ${hy - R * 0.35} l${R * 0.28} ${-R * 0.3} l${R * 0.14} ${R * 0.22} l${R * 0.26} ${-R * 0.42} l${R * 0.16} ${R * 0.3} l${R * 0.3} ${-R * 0.4} l${R * 0.14} ${R * 0.34} l${R * 0.3} ${-R * 0.26} l${R * 0.14} ${R * 0.32} l${R * 0.22} ${-R * 0.1} L${R * 0.95} ${hy - R * 0.4} Q0 ${hy - R * 0.95} ${-R * 0.95} ${hy - R * 0.35}Z" fill="#f1f1f1" ${stroke(lw * 0.9, col)}/>`);
      const faceG = add(head, `<g transform="translate(0 ${hy})"></g>`).firstChild;
      const exg = {};
      for (const n of Object.keys(EX)) { const g = add(faceG, faceSVG(n, R, col, lw * (ink ? 0.62 : 0.9))); gsap.set(g, { opacity: 0 }); exg[n] = g; }
      gsap.set(exg[o.face || "neutral"], { opacity: 1 });
      const [m1, m2] = MOUTH(R, col, lw * (ink ? 0.62 : 0.9)).map((h) => { const g = add(faceG, h); gsap.set(g, { opacity: 0 }); return g; });
      if (o.glasses) add(faceG, `<g fill="none" stroke="#a45c1e" stroke-width="${lw * 1.05}"><rect x="${-R * 0.78}" y="${-R * 0.34}" width="${R * 0.66}" height="${R * 0.5}" rx="${R * 0.12}"/><rect x="${R * 0.12}" y="${-R * 0.34}" width="${R * 0.66}" height="${R * 0.5}" rx="${R * 0.12}"/><path d="M${-R * 0.12} ${-R * 0.18} L${R * 0.12} ${-R * 0.18}"/></g>`);
      if (o.mustache) add(faceG, `<path d="M0 ${R * 0.2} C${-R * 0.2} ${R * 0.08} ${-R * 0.55} ${R * 0.12} ${-R * 0.62} ${R * 0.32} C${-R * 0.5} ${R * 0.5} ${-R * 0.2} ${R * 0.42} 0 ${R * 0.38} C${R * 0.2} ${R * 0.42} ${R * 0.5} ${R * 0.5} ${R * 0.62} ${R * 0.32} C${R * 0.55} ${R * 0.12} ${R * 0.2} ${R * 0.08} 0 ${R * 0.2}Z" fill="#f1f1f1" ${stroke(lw * 0.85, col)}/>`);
      if (o.brows === "bushy") add(faceG, `<path d="M${-R * 0.75} ${-R * 0.5} q${R * 0.3} ${-R * 0.2} ${R * 0.62} ${R * 0.02} M${R * 0.13} ${-R * 0.48} q${R * 0.3} ${-R * 0.22} ${R * 0.62} ${-R * 0.02}" fill="none" stroke="#f1f1f1" stroke-width="${R * 0.16}" stroke-linecap="round"/>`);

      const pose0 = (name) => POSE[name] || name;
      const bias = ink ? 14 : 0;                                // one-point shoulders (ink) need more outward swing so the arms clear the spine
      const setPose = (p, t, d, ease = "power2.out") => {
        const P = typeof p === "string" ? POSE[p] : p;
        tl.to(parts.armL, { rotation: P.L[0] + bias, duration: d, ease }, t); tl.to(parts.armR, { rotation: -(P.R[0] + bias), duration: d, ease }, t);
        tl.to(parts.foreL, { rotation: -P.L[1], duration: d, ease }, t); tl.to(parts.foreR, { rotation: P.R[1], duration: d, ease }, t);
      };
      gsap.set(parts.armL, { rotation: POSE.idle.L[0] + bias }); gsap.set(parts.armR, { rotation: -(POSE.idle.R[0] + bias) }); gsap.set(parts.foreL, { rotation: -POSE.idle.L[1] }); gsap.set(parts.foreR, { rotation: POSE.idle.R[1] });

      const api = {
        root, parts, G,
        pose: (p, t, d = 0.32, ease) => setPose(p, t, d, ease),
        face(t, name) { Object.keys(exg).forEach((n) => tl.set(exg[n], { opacity: n === name ? 1 : 0 }, t)); return api; },
        lean(t, deg, d = 0.3) { tl.to(parts.up, { rotation: deg, duration: d, ease: "power2.out" }, t); return api; },
        head(t, deg, d = 0.25) { tl.to(parts.head, { rotation: deg, duration: d, ease: "power2.out" }, t); return api; },
        hop(t, h = 40, d = 0.22) { tl.to(root, { y: `-=${h}`, duration: d, ease: "power2.out", yoyo: true, repeat: 1 }, t); return api; },
        show(t) { tl.set(root, { opacity: 1 }, t); return api; }, hide(t) { tl.set(root, { opacity: 0 }, t); return api; },
        wave(t, n = 4, a = 30) { tl.to(parts.foreR, { rotation: `+=${a}`, duration: 0.16, ease: "sine.inOut", yoyo: true, repeat: n * 2 - 1 }, t); return api; },
        // hold something in a hand: svg (absolute rig coordinates are the hand position: use hand(side) for it)
        hand(side) { const f = parts[side === "L" ? "foreL" : "foreR"]; return { x: +f.dataset.hx, y: +f.dataset.hy, fore: f }; },
        hold(side, html) { const h = api.hand(side); return add(h.fore, `<g transform="translate(${h.x} ${h.y})">${html}</g>`); },
        // gentle idle sway of the head + torso over [t0, t1]
        sway(t0, t1, amp = 1.6, per = 1.5) { const n = Math.max(1, Math.round((t1 - t0) / per)); tl.to(parts.head, { rotation: amp, duration: per, ease: "sine.inOut", yoyo: true, repeat: n * 1 + 1 }, t0); return api; },
        walk(t0, t1, toX, step = 0.34) {
          // the swings fill exactly [t0, t1] (n + 1 half-steps) so the legs are back together when the walk ends (no tween runs past the reset below)
          const x0 = gsap.getProperty(root, "x"), n = Math.max(1, Math.round((t1 - t0) / step)), st = (t1 - t0) / (n + 1);
          tl.fromTo(root, { x: x0 }, { x: toX, duration: t1 - t0, ease: "none" }, t0);
          tl.fromTo(parts.legL, { rotation: -22 }, { rotation: 22, duration: st, ease: "sine.inOut", yoyo: true, repeat: n }, t0);
          tl.fromTo(parts.legR, { rotation: 22 }, { rotation: -22, duration: st, ease: "sine.inOut", yoyo: true, repeat: n }, t0);
          tl.fromTo(parts.up, { y: 0 }, { y: -10, duration: st / 2, ease: "sine.inOut", yoyo: true, repeat: n * 2 + 1 }, t0);
          const E = t1 + 0.05; tl.to(parts.legL, { rotation: -G.legSplay, duration: 0.15 }, E); tl.to(parts.legR, { rotation: G.legSplay, duration: 0.15 }, E);
          tl.to(parts.up, { y: 0, duration: 0.12 }, E);
          return api;
        },
        // mouth flaps on the real per-character timing of caption line `key`; gest cycles hand gestures
        say(key, so = {}) {
          const i = CAP.findIndex((c) => c.key === key), c = CAP[i];
          if (!c) throw new Error(`no caption key "${key}"`);
          const plain = [...c.text.replace(/[\[\]]/g, "")];
          const ts = CH[i] && CH[i].length === plain.length ? CH[i] : plain.map((_, k) => c.start + (k / plain.length) * Math.max(0.3, c.end - c.start - 0.25));
          let last = -9, n = 0; const opens = [];
          plain.forEach((ch, k) => { if (!/[ก-ฮะาำเ-ๆA-Za-z0-9]/.test(ch)) return; if (ts[k] - last >= 0.12) { opens.push(ts[k]); last = ts[k]; } });
          opens.forEach((t, j) => {
            const nxt = opens[j + 1] ?? c.end, big = [1, 0, 1, 1, 0, 1][n++ % 6];
            tl.set(m1, { opacity: big ? 0 : 1 }, t); tl.set(m2, { opacity: big ? 1 : 0 }, t);
            tl.set([m1, m2], { opacity: 0 }, Math.min(nxt - 0.02, t + 0.13));
          });
          tl.set([m1, m2], { opacity: 0 }, c.end);
          if (so.gest !== false) { const g = so.gestures || GEST; let k = (i + (so.offset || 0)) % g.length; for (let t = c.start; t < c.end - 0.4; t += 1.15) { setPose(g[k++ % g.length], t, 0.3); } setPose(so.end || "idle", Math.max(c.start + 0.3, c.end - 0.15), 0.35); }
          return api;
        },
      };
      return api;
    };

    // ---------- ink-style extras ----------
    const blob = (o = {}) => {
      const sc = o.s ?? 1, root = add(o.layer || world, "");
      gsap.set(root, { x: o.x, y: o.y, scaleX: sc, scaleY: sc, ...O(0, 0) });
      const fill = o.fill || T.line;
      const arms = add(root, `<path d="M-34 6 q-30 -10 -34 -34 M34 6 q30 -10 34 -34" fill="none" stroke="${fill}" stroke-width="12" stroke-linecap="round"/>`);
      add(root, `<circle cx="0" cy="0" r="46" fill="${fill}"/><path d="M-30 -22 q8 -14 24 -12" fill="none" stroke="#fff" stroke-opacity="0.18" stroke-width="7" stroke-linecap="round"/>`);
      const eyes = add(root, `<circle cx="-17" cy="-10" r="17" fill="#fff"/><circle cx="17" cy="-10" r="17" fill="#fff"/>`);
      const pup = add(root, `<circle cx="-17" cy="-9" r="7" fill="${fill}"/><circle cx="17" cy="-9" r="7" fill="${fill}"/>`);
      const mouth = add(root, `<path d="M-9 22 Q0 30 9 22" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`);
      const sad = add(root, `<path d="M-9 28 Q0 18 9 28" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`); gsap.set(sad, { opacity: 0 });
      const api = {
        root, arms, eyes, pup,
        look(t, dx, dy = 0) { tl.to(pup, { x: dx, y: dy, duration: 0.12 }, t); return api; },
        mood(t, name) { tl.set(mouth, { opacity: name === "sad" ? 0 : 1 }, t); tl.set(sad, { opacity: name === "sad" ? 1 : 0 }, t); return api; },
        wiggle(t, n = 3, a = 8) { tl.to(arms, { rotation: a, duration: 0.1, yoyo: true, repeat: n * 2 - 1, ...O(0, 0) }, t); return api; },
      };
      return api;
    };
    const can = (o = {}) => {
      const sc = o.s ?? 1, root = add(o.layer || world, "");
      gsap.set(root, { x: o.x, y: o.y, scaleX: sc, scaleY: sc, ...O(0, 0) });
      const body = (c) => `<path d="M-98 -300 L-80 0 Q0 18 80 0 L98 -300 Z" fill="${c}" ${stroke(T.lw * 0.9)}/>`;
      add(root, `<ellipse cx="0" cy="6" rx="130" ry="16" fill="#000" opacity="0.22" filter="url(#blur6)"/>`);
      const back = add(root, `<ellipse cx="0" cy="-300" rx="100" ry="22" fill="#2a2a2a" ${stroke(T.lw * 0.9)}/>`);
      const slot = add(root, "");
      const front = add(root, `${body("#a6a6a6")}<path d="M-98 -300 L-80 0 Q0 18 80 0 L98 -300 Z" fill="url(#shade)"/>${[-66, -36, -6, 24, 54].map((x) => `<path d="M${x * 1.05} -280 L${x * 0.88} -24" stroke="#5c5c5c" stroke-width="7" stroke-linecap="round" opacity="0.8"/>`).join("")}<path d="M-102 -300 Q0 -270 102 -300" fill="none" ${stroke(T.lw * 0.9)}/>`);
      const lid = add(root, `<path d="M-112 -318 Q0 -352 112 -318 Q0 -300 -112 -318Z" fill="#b4b4b4" ${stroke(T.lw * 0.9)}/><path d="M-26 -337 q26 -22 52 0" fill="none" ${stroke(T.lw * 0.9)}/><ellipse cx="0" cy="-344" rx="20" ry="8" fill="#8a8a8a" ${stroke(T.lw * 0.7)}/>`);
      gsap.set(lid, O(-112, -318));
      return { root, slot, lid, back, front,
        lidTo(t, deg, d = 0.2, ease = "power2.out") { tl.to(lid, { rotation: deg, y: deg ? -deg * 0.2 : 0, duration: d, ease }, t); },
        bump(t, a = 6) { tl.to(root, { rotation: a, duration: 0.07, yoyo: true, repeat: 3, ...O(0, 0) }, t); } };
    };

    // ---------- scenes, camera, effects ----------
    const layer = (name) => { const g = add(world, "", { id: "ly-" + name }); gsap.set(g, { opacity: 0 }); return g; };
    const swipeEl = add(fx, `<rect x="-260" y="-100" width="1600" height="2120" fill="#111" transform="skewX(-10)"/>`);
    const swipeR = swipeEl.firstChild; gsap.set(swipeEl, { x: 0 }); gsap.set(swipeR, { x: -2100, ...O(0, 0) });
    const cut = (t, from, to, so = {}) => {
      if (so.swipe !== false) {
        swipeR.setAttribute("fill", so.color || "#111");
        tl.fromTo(swipeR, { x: -2100 }, { x: 0, duration: 0.17, ease: "power2.in" }, t - 0.17);
        tl.to(swipeR, { x: 2100, duration: 0.2, ease: "power2.out" }, t);
      }
      if (from) tl.set(from, { opacity: 0 }, t);
      if (to) tl.set(to, { opacity: 1 }, t);
    };
    const cam = (t, fx0, fy0, z = 1, d = 0.7, ease = "power2.inOut") => tl.to(world, { x: FW / 2 - fx0 * z, y: FH / 2 - fy0 * z, scaleX: z, scaleY: z, duration: d, ease, ...O(0, 0) }, t);
    gsap.set(world, { x: 0, y: 0, scaleX: 1, scaleY: 1, ...O(0, 0) });
    const shake = (t, amp = 14, n = 6) => { for (let i = 0; i < n; i++) tl.to(shk, { x: (i % 2 ? -1 : 1) * amp * (1 - i / n), y: (i % 2 ? 1 : -1) * amp * 0.4 * (1 - i / n), duration: 0.045 }, t + i * 0.045); tl.to(shk, { x: 0, y: 0, duration: 0.04 }, t + n * 0.045); };
    const flashEl = add(fx, `<rect width="${FW}" height="${FH}" fill="#fff"/>`); gsap.set(flashEl, { opacity: 0 });
    const flash = (t, a = 0.8) => { tl.set(flashEl, { opacity: a }, t); tl.to(flashEl, { opacity: 0, duration: 0.25 }, t + 0.02); };
    const pop = (el, t, cx, cy, d = 0.32) => tl.fromTo(el, { opacity: 0, scaleX: 0.1, scaleY: 0.1, ...O(cx, cy) }, { opacity: 1, scaleX: 1, scaleY: 1, duration: d, ease: "back.out(2.6)", ...O(cx, cy) }, t);
    const ICON = {
      bang: `<path d="M0 -70 L14 -20 L0 -10 L-14 -20 Z" fill="#e5352b" ${stroke(6)}/><circle cx="0" cy="12" r="9" fill="#e5352b" ${stroke(5)}/>`,
      quest: `<path d="M-26 -40 Q-26 -74 0 -74 Q28 -74 28 -46 Q28 -26 4 -16 L4 0" fill="none" ${stroke(14)}/><circle cx="4" cy="26" r="9" fill="${T.line}"/>`,
      sweat: `<path d="M0 -34 Q-22 0 0 20 Q22 0 0 -34Z" fill="#8fd3ff" ${stroke(5)}/>`,
      vein: `<g fill="none" stroke="#d6261c" stroke-width="9" stroke-linecap="round"><path d="M-26 -26 Q-4 -20 -8 -4 M26 -26 Q4 -20 8 -4 M-26 26 Q-4 20 -8 4 M26 26 Q4 20 8 4"/></g>`,
      heart: `<path d="M0 28 C-50 -6 -26 -50 0 -22 C26 -50 50 -6 0 28Z" fill="#ff4b6e" ${stroke(6)}/>`,
      zzz: `<g fill="none" ${stroke(7)}><path d="M-30 -30 h26 l-26 30 h26 M10 -64 h20 l-20 24 h20"/></g>`,
    };
    const icon = (kind, x, y, t, d = 1.1, s = 1) => { const g = add(world, `<g transform="scale(${s})">${ICON[kind]}</g>`); gsap.set(g, { x, y, opacity: 0 }); pop(g, t, 0, 0, 0.26); tl.to(g, { y: y - 14, duration: d, ease: "none" }, t); tl.set(g, { opacity: 0 }, t + d); return g; };
    const title = (html, t0, t1, cls = "hl") => { const d = document.createElement("div"); d.className = cls; d.innerHTML = html; stage.appendChild(d); gsap.set(d, { opacity: 0 }); tl.fromTo(d, { opacity: 0, scale: 2.2, rotation: -5 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.3, ease: "back.out(1.8)" }, t0); tl.to(d, { opacity: 0, scale: 0.92, duration: 0.25 }, t1); return d; };   // exits in place (no upward drift past the y 250 safe line)

    return { T, svg, world, fx, bg, char, blob, can, layer, cut, cam, shake, flash, pop, icon, title, add, stroke, O, POSE };
  };
})();
// genhaha:781c07c7ad6b
