// visual-proof · blank skeleton — DATA ONLY (one assignment, plain data, no functions, no =>). Every name: `visual-proof catalog` · references/visual-proof-craft.md
// One key per shot id in captions.js. Times: "k1" (line k1 starts) · "k1+0.4" · "k1@0.5" (half-way through the spoken line) · a number = seconds into the shot.
window.VP_SCENE = {
  palette: "navy",                                  // navy | charcoal | plum | paper
  ink: { w: "teal", h: "gold", area: "coral" },     // one ink per quantity, kept for the whole clip
  camera: "push", enter: "trace", transition: "fade", ground: "plain",
  caption: { show: true, accent: "gold" },
  shots: {
    s1: { type: "build", title: "พื้นที่สี่เหลี่ยมผืนผ้า",
      figure: [
        { id: "r", part: "cells", x: 0, y: 0, cols: 4, rows: 3, q: "area" },
        { id: "bw", part: "brace", a: [0, -0.3], b: [4, -0.3], label: "4", q: "w", at: "k1@0.4" },
        { id: "bh", part: "brace", a: [-0.3, 3], b: [-0.3, 0], label: "3", q: "h", at: "k1@0.55" } ],
      eq: [{ t: "4", q: "w", from: "bw", at: "k1@0.6" }, "×", { t: "3", q: "h", from: "bh", at: "k1@0.7" }, "=", { t: "12", q: "area", at: "k1@0.9", sfx: "ding" }] },
    s2: { type: "qed", title: "กว้าง × ยาว",
      eq: [{ t: "พื้นที่", q: "area", at: "k2@0.2" }, "=", { t: "a", q: "w" }, "×", { t: "b", q: "h" }],
      note: "นับช่องได้เท่ากับคูณสองด้าน" }
  }
};
// genhaha:ed4a029a9d2b
