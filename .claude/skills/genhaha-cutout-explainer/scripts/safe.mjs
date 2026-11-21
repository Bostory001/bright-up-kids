// cutout safe — phone safe-area check (Reels / TikTok / Shorts UI covers parts of a 1080×1920 frame):
//   top    y < 250              status bar + app header         → no text
//   bottom y > 1520             caption, username, nav bar       → no text 
//   right  x > 960 and y > 900  like / comment / share buttons   → no text
// Plays the composition in headless Chrome, samples every --step seconds, measures each visible text element.
//   cutout safe [--project <dir>] [--step 0.5] [--at 1,4.5] [--json]      exit 1 when something is outside
import fs from "node:fs";
import path from "node:path";
import { parseArgs, projectDir } from "./lib/common.mjs";
import { openComposition } from "./lib/browser.mjs";

export const SAFE = { top: 250, bottom: 1520, right: 960, rightFromY: 900, subBottom: 1520 };   // subtitles live at y 1236–1366; the same bottom limit applies

export async function check(root, { step = 0.5, at = null } = {}) {
  const pg = await openComposition(root);
  try {
    const times = at || Array.from({ length: Math.floor(pg.duration / step) }, (_, i) => +(i * step + step / 2).toFixed(2));
    const hits = [];
    for (const t of times) {
      await pg.seek(t);
      const h = await pg.evaluate(`(() => { const SAFE = ${JSON.stringify(SAFE)}, out = [];
        const opac = (el) => { let o = 1; for (let e = el; e && e.nodeType === 1; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden') return 0; o *= Number(cs.opacity); } return o; };
        const label = (el) => el.id ? '#' + el.id : el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className ? '.' + el.className.trim().split(/\\s+/).join('.') : '');
        const els = [...document.querySelectorAll('body *')].filter((el) => !['SCRIPT', 'STYLE', 'TITLE'].includes(el.tagName) && [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()));
        for (const el of els) {
          if (opac(el) < 0.05) continue;
          const rg = document.createRange(); rg.selectNodeContents(el); const r = rg.getBoundingClientRect();
          if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.top > 1920 || r.right < 0 || r.left > 1080) continue;
          const why = [];
          if (r.top < SAFE.top) why.push('top ' + Math.round(r.top) + ' < ' + SAFE.top);
          const lim = el.closest('.cap') ? SAFE.subBottom : SAFE.bottom; if (r.bottom > lim) why.push('bottom ' + Math.round(r.bottom) + ' > ' + lim);
          if (r.right > SAFE.right && r.bottom > SAFE.rightFromY) why.push('right ' + Math.round(r.right) + ' > ' + SAFE.right + ' (below y ' + SAFE.rightFromY + ')');
          if (!why.length) continue;
          const owner = el.closest('.cap, .lbl, [id]:not(.clip):not(section)') || el;
          out.push({ t: ${t}, el: label(owner), text: owner.textContent.trim().slice(0, 40), why: why.join(', ') });
        }
        return out; })()`);
      hits.push(...h);
    }
    const by = new Map();
    for (const h of hits) { const k = h.el + "|" + h.text; const g = by.get(k); if (!g) by.set(k, { ...h, from: h.t, to: h.t }); else g.to = h.t; }
    return { samples: times.length, groups: [...by.values()], errors: pg.errors };
  } finally { await pg.close(); }
}

export async function run(argv) {
  const args = parseArgs(argv);
  const root = projectDir(args);
  if (!fs.existsSync(path.join(root, "index.html"))) throw new Error("no index.html");
  const { samples, groups, errors } = await check(root, { step: Number(args.step ?? 0.5), at: args.at ? String(args.at).split(",").map(Number) : null });
  if (errors.length) console.log(`  page errors: ${[...new Set(errors)].join(" | ")}`);
  if (args.json) console.log(JSON.stringify(groups, null, 1));
  else if (!groups.length) console.log(`✓ safe area: all text inside y ${SAFE.top}–${SAFE.bottom}, nothing right of x ${SAFE.right} below y ${SAFE.rightFromY} (${samples} samples)`);
  else { console.log(`✗ ${groups.length} text element(s) outside the safe area (${samples} samples):`);
    for (const g of groups) console.log(`  ${g.from.toFixed(1)}–${g.to.toFixed(1)} s  ${g.el}  "${g.text}"  ${g.why}`); }
  return groups.length ? 1 : 0;
}
// genhaha:5f8f980bb7f3
