// แผนภาพคณิตศาสตร์ วาดด้วย SVG — ใช้ผ่าน Diagram kind: blocks fracbar array pgrid money ruler shape
type P = Record<string, unknown>;
const n = (p: P, k: string, d: number) => (typeof p[k] === "number" && Number.isFinite(p[k] as number) ? (p[k] as number) : d);
const s = (p: P, k: string, d = "") => (typeof p[k] === "string" ? (p[k] as string) : d);
const arr = (p: P, k: string): unknown[] => (Array.isArray(p[k]) ? (p[k] as unknown[]) : []);
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, Math.floor(x)));
const INK = "#78350f";
const BLUE = "#0369a1";
const ORANGE = "#ea580c";

function Frame({ vb, label, children }: { vb: string; label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-sky-50 p-2">
      <svg viewBox={vb} role="img" aria-label={label} className="mx-auto block h-auto w-full max-w-xl" fontFamily="inherit">
        {children}
      </svg>
    </div>
  );
}
const T = ({ x, y, t, size = 14, color = INK, anchor = "middle" }: { x: number; y: number; t: string; size?: number; color?: string; anchor?: "start" | "middle" | "end" }) => (
  <text x={x} y={y} fontSize={size} fontWeight="800" fill={color} textAnchor={anchor}>{t}</text>
);

// ---------- บล็อกค่าประจำหลัก ----------
export function Blocks({ p }: { p: P }) {
  const v = clamp(n(p, "n", 0), 0, 9999);
  const digits = String(v).padStart(String(v).length, "0").split("").map(Number);
  const names = ["หน่วย", "สิบ", "ร้อย", "พัน"];
  const cols = digits.length;
  const W = 130;
  const vbW = Math.max(cols * W, 260);
  return (
    <Frame vb={`0 0 ${vbW} 215`} label={s(p, "caption", `บล็อกแสดงค่าประจำหลักของ ${v}`)}>
      {digits.map((d, i) => {
        const place = cols - 1 - i;
        const x0 = i * W + 10;
        const items = Array.from({ length: d }, (_, k) => k);
        return (
          <g key={i}>
            <rect x={x0} y="8" width={W - 20} height="196" rx="12" fill="#fff" stroke="#bae6fd" strokeWidth="2" />
            <T x={x0 + (W - 20) / 2} y={30} t={names[place]} size={15} color={BLUE} />
            <T x={x0 + (W - 20) / 2} y={192} t={String(d)} size={24} color={ORANGE} />
            {items.map((k) => {
              if (place >= 2) {
                const size = place === 3 ? 30 : 26;
                const cx = x0 + 10 + (k % 3) * (size + 6), cy = 42 + Math.floor(k / 3) * (size + 6);
                return (
                  <g key={k}>
                    <rect x={cx} y={cy} width={size} height={size} rx="3" fill={place === 3 ? "#fb923c" : "#60a5fa"} stroke="#fff" strokeWidth="1.5" />
                    <path d={`M ${cx + size / 3} ${cy} v ${size} M ${cx + (2 * size) / 3} ${cy} v ${size} M ${cx} ${cy + size / 3} h ${size} M ${cx} ${cy + (2 * size) / 3} h ${size}`} stroke="#fff" strokeWidth="1" opacity="0.7" />
                  </g>
                );
              }
              if (place === 1) {
                const cx = x0 + 8 + (k % 9) * 11;
                return <g key={k}><rect x={cx} y="46" width="9" height="96" rx="2" fill="#34d399" stroke="#fff" strokeWidth="1" />{[1, 2, 3, 4, 5, 6, 7, 8, 9].map((q) => <line key={q} x1={cx} x2={cx + 9} y1={46 + q * 9.6} y2={46 + q * 9.6} stroke="#fff" strokeWidth="1" />)}</g>;
              }
              const cx = x0 + 14 + (k % 3) * 28, cy = 46 + Math.floor(k / 3) * 28;
              return <rect key={k} x={cx} y={cy} width="22" height="22" rx="3" fill="#facc15" stroke="#fff" strokeWidth="1.5" />;
            })}
          </g>
        );
      })}
    </Frame>
  );
}

// ---------- แถบเศษส่วน ----------
export function FracBar({ p }: { p: P }) {
  const fr = arr(p, "fracs")
    .filter(Array.isArray)
    .map((q) => q as unknown[])
    .filter((q) => typeof q[0] === "number" && typeof q[1] === "number" && (q[1] as number) >= 1 && (q[1] as number) <= 24)
    .slice(0, 3) as [number, number][];
  const H = 60;
  return (
    <Frame vb={`0 0 520 ${fr.length * H + 14}`} label={s(p, "caption", "แถบแสดงเศษส่วน")}>
      {fr.map(([a, b], r) => {
        const x0 = 90, w = 410, cw = w / b, y = 10 + r * H;
        return (
          <g key={r}>
            <T x={44} y={y + 30} t={`${a}/${b}`} size={20} color={ORANGE} />
            {Array.from({ length: b }, (_, i) => (
              <rect key={i} x={x0 + i * cw} y={y} width={cw} height="42" fill={i < a ? "#fdba74" : "#fff"} stroke={BLUE} strokeWidth="2" />
            ))}
          </g>
        );
      })}
    </Frame>
  );
}

// ---------- ตารางจุด (การคูณ) ----------
export function ArrayDots({ p }: { p: P }) {
  const r = clamp(n(p, "rows", 2), 1, 10), c = clamp(n(p, "cols", 5), 1, 12);
  const gap = Math.min(34, Math.floor(420 / c), Math.floor(170 / r));
  const x0 = 260 - ((c - 1) * gap) / 2, y0 = 30;
  return (
    <Frame vb={`0 0 520 ${r * gap + 90}`} label={s(p, "caption", `${r} แถว แถวละ ${c}`)}>
      {Array.from({ length: r * c }, (_, i) => (
        <circle key={i} cx={x0 + (i % c) * gap} cy={y0 + Math.floor(i / c) * gap} r={gap * 0.36} fill={Math.floor(i / c) % 2 ? "#fb923c" : "#38bdf8"} stroke="#fff" strokeWidth="2" />
      ))}
      <T x={260} y={y0 + (r - 1) * gap + 42} t={`${r} แถว × แถวละ ${c} = ${r * c}`} size={16} />
    </Frame>
  );
}

// ---------- ตาราง 100 ช่อง (ร้อยละ/ทศนิยม) ----------
export function PGrid({ p }: { p: P }) {
  const v = clamp(n(p, "n", 25), 0, 100);
  return (
    <Frame vb="0 0 520 250" label={s(p, "caption", `ตาราง 100 ช่อง แรเงา ${v} ช่อง`)}>
      {Array.from({ length: 100 }, (_, i) => {
        const col = i % 10, row = Math.floor(i / 10);
        return <rect key={i} x={140 + col * 24} y={8 + row * 22} width="24" height="22" fill={i < v ? "#fdba74" : "#fff"} stroke={BLUE} strokeWidth="1.2" />;
      })}
      <T x={70} y={104} t={`${v}`} size={30} color={ORANGE} />
      <T x={70} y={128} t="ส่วนจาก 100" size={13} />
      <T x={260} y={246} t={s(p, "note", `แรเงา ${v} จาก 100 ช่อง`)} size={13} color="#475569" />
    </Frame>
  );
}

// ---------- เงิน ----------
const DEN = [100, 50, 20, 10, 5, 2, 1];
export function Money({ p }: { p: P }) {
  let rest = clamp(n(p, "amount", 20), 1, 999);
  const total = rest;
  const items: number[] = [];
  for (const d of DEN) while (rest >= d && items.length < 14) { items.push(d); rest -= d; }
  const note = (d: number) => (d === 100 ? "#fca5a5" : d === 50 ? "#93c5fd" : "#86efac");
  const per = 7;
  return (
    <Frame vb={`0 0 520 ${Math.ceil(items.length / per) * 78 + 58}`} label={s(p, "caption", `เงิน ${total} บาท`)}>
      {items.map((d, i) => {
        const x = 40 + (i % per) * 68, y = 14 + Math.floor(i / per) * 78;
        return d >= 20 ? (
          <g key={i}><rect x={x - 6} y={y + 6} width="62" height="40" rx="6" fill={note(d)} stroke="#475569" strokeWidth="2" /><T x={x + 25} y={y + 34} t={String(d)} size={18} /></g>
        ) : (
          <g key={i}><circle cx={x + 25} cy={y + 26} r={d >= 5 ? 22 : 18} fill={d >= 10 ? "#fde68a" : "#e2e8f0"} stroke="#78716c" strokeWidth="2.5" /><T x={x + 25} y={y + 32} t={String(d)} size={d >= 5 ? 16 : 15} /></g>
        );
      })}
      <T x={260} y={Math.ceil(items.length / per) * 78 + 40} t={`รวม ${total} บาท`} size={17} color={ORANGE} />
    </Frame>
  );
}

// ---------- ไม้บรรทัด ----------
export function Ruler({ p }: { p: P }) {
  const len = clamp(n(p, "cm", 10), 1, 30);
  const max = Math.min(30, Math.max(10, len + 2));
  const cw = 460 / max;
  return (
    <Frame vb="0 0 520 170" label={s(p, "caption", `วัดความยาว ${len} เซนติเมตร`)}>
      <rect x="25" y="20" width={cw * len} height="30" rx="6" fill="#fcd34d" stroke="#b45309" strokeWidth="2.5" />
      <polygon points={`${25 + cw * len},20 ${25 + cw * len + 22},35 ${25 + cw * len},50`} fill="#fde68a" stroke="#b45309" strokeWidth="2.5" />
      <rect x="25" y="70" width={cw * max} height="56" rx="4" fill="#e0f2fe" stroke={BLUE} strokeWidth="2.5" />
      {Array.from({ length: max + 1 }, (_, i) => (
        <g key={i}>
          <line x1={25 + i * cw} y1="70" x2={25 + i * cw} y2="96" stroke={BLUE} strokeWidth="2" />
          <T x={25 + i * cw} y={116} t={String(i)} size={12} />
        </g>
      ))}
      <line x1={25 + cw * len} y1="50" x2={25 + cw * len} y2="70" stroke={ORANGE} strokeWidth="2.5" strokeDasharray="4 3" />
      <T x={260} y={158} t={s(p, "label", `ยาว ${len} เซนติเมตร`)} size={16} color={ORANGE} />
    </Frame>
  );
}

// ---------- รูปทรง ----------
export function Shape({ p }: { p: P }) {
  const k = s(p, "shape", "square");
  const fill = "#bae6fd", stroke = BLUE;
  const g: Record<string, React.ReactNode> = {
    square: <rect x="190" y="30" width="140" height="140" fill={fill} stroke={stroke} strokeWidth="4" />,
    rect: <rect x="150" y="50" width="220" height="110" fill={fill} stroke={stroke} strokeWidth="4" />,
    circle: <circle cx="260" cy="100" r="76" fill={fill} stroke={stroke} strokeWidth="4" />,
    semicircle: <path d="M 160 140 A 100 100 0 0 1 360 140 Z" fill={fill} stroke={stroke} strokeWidth="4" />,
    triangle: <polygon points="260,24 360,170 160,170" fill={fill} stroke={stroke} strokeWidth="4" />,
    parallelogram: <polygon points="200,50 390,50 330,160 140,160" fill={fill} stroke={stroke} strokeWidth="4" />,
    cube: (
      <g stroke={stroke} strokeWidth="3.5" strokeLinejoin="round">
        <polygon points="200,70 300,70 300,170 200,170" fill={fill} />
        <polygon points="200,70 240,32 340,32 300,70" fill="#e0f2fe" />
        <polygon points="300,70 340,32 340,132 300,170" fill="#7dd3fc" />
      </g>
    ),
    prism: (
      <g stroke={stroke} strokeWidth="3.5" strokeLinejoin="round">
        <polygon points="170,150 230,50 290,150" fill={fill} />
        <polygon points="230,50 330,50 390,150 290,150" fill="#7dd3fc" />
        <polygon points="230,50 330,50 270,150 170,150" fill="none" opacity="0" />
      </g>
    ),
  };
  return (
    <Frame vb="0 0 520 200" label={s(p, "caption", "รูปทรง")}>
      {g[k] ?? g.square}
      {s(p, "label") && <T x={260} y={192} t={s(p, "label")} size={15} color={ORANGE} />}
    </Frame>
  );
}

// ---------- บวก/ลบด้วยจุด ----------
export function AddSub({ p }: { p: P }) {
  const a = clamp(n(p, "a", 3), 0, 20), b = clamp(n(p, "b", 2), 0, 20);
  const sub = s(p, "op", "+") === "-";
  const total = sub ? a : a + b;
  const per = 10, gap = 38;
  const rows = Math.ceil(total / per) || 1;
  const res = sub ? a - b : a + b;
  return (
    <Frame vb={`0 0 520 ${rows * gap + 70}`} label={s(p, "caption", sub ? `${a} ลบ ${b} เหลือ ${res}` : `${a} บวก ${b} เป็น ${res}`)}>
      {Array.from({ length: total }, (_, i) => {
        const x = 260 - ((Math.min(total, per) - 1) * gap) / 2 + (i % per) * gap, y = 24 + Math.floor(i / per) * gap;
        const second = sub ? i >= a - b : i >= a;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r="14" fill={second ? (sub ? "#e2e8f0" : "#fb923c") : "#38bdf8"} stroke="#fff" strokeWidth="2" />
            {sub && second && <path d={`M ${x - 9} ${y - 9} L ${x + 9} ${y + 9} M ${x + 9} ${y - 9} L ${x - 9} ${y + 9}`} stroke="#ef4444" strokeWidth="3" />}
          </g>
        );
      })}
      <T x={260} y={rows * gap + 48} t={sub ? `${a} − ${b} = ${res}` : `${a} + ${b} = ${res}`} size={20} color={ORANGE} />
    </Frame>
  );
}

// ---------- ตั้งบวก/ลบ แสดงการทด/การยืม ----------
export function Column({ p }: { p: P }) {
  const a = clamp(n(p, "a", 0), 0, 99999), b = clamp(n(p, "b", 0), 0, 99999);
  const sub = s(p, "op", "+") === "-";
  const res = sub ? a - b : a + b;
  if (res < 0) return null;
  const ad = String(a).split("").map(Number).reverse(), bd = String(b).split("").map(Number).reverse();
  const len = Math.max(ad.length, bd.length, String(res).length);
  const marks: string[] = Array(len + 1).fill("");
  // ทด/ยืม ทีละหลักจากขวา
  let carry = 0;
  const top = [...ad], low = [...bd];
  for (let i = 0; i < len; i++) {
    const x = (top[i] ?? 0), y = (low[i] ?? 0);
    if (!sub) {
      const t = x + y + carry;
      carry = t >= 10 ? 1 : 0;
      if (carry) marks[i + 1] = "ทด 1";
    } else {
      const t = x - carry - y;
      if (t < 0) { marks[i] = "+10"; marks[i + 1] = marks[i + 1] ? marks[i + 1] : "−1"; carry = 1; } else carry = 0;
    }
  }
  const W = 44, x0 = 260 + (len * W) / 2 - W / 2;
  const colX = (i: number) => x0 - i * W;
  const fmt = (d: number[], i: number) => (i < d.length ? String(d[i]) : "");
  const rd = String(res).split("").map(Number).reverse();
  return (
    <Frame vb="0 0 520 215" label={s(p, "caption", `${a} ${sub ? "ลบ" : "บวก"} ${b} เท่ากับ ${res}`)}>
      {Array.from({ length: len + 1 }, (_, i) => marks[i] && i <= len ? <T key={"m" + i} x={colX(i)} y={34} t={marks[i]} size={12} color={ORANGE} /> : null)}
      {Array.from({ length: len }, (_, i) => <T key={"a" + i} x={colX(i)} y={78} t={fmt(ad, i)} size={30} />)}
      <T x={colX(len) - 6} y={122} t={sub ? "−" : "+"} size={30} color={BLUE} />
      {Array.from({ length: len }, (_, i) => <T key={"b" + i} x={colX(i)} y={122} t={fmt(bd, i)} size={30} />)}
      <line x1={colX(len - 1) - 28} x2={colX(0) + 28} y1="136" y2="136" stroke={INK} strokeWidth="3" />
      {Array.from({ length: len }, (_, i) => <T key={"r" + i} x={colX(i)} y={176} t={fmt(rd, i)} size={30} color={ORANGE} />)}
    </Frame>
  );
}

// ---------- หาร: แบ่งของเป็นกลุ่ม ----------
export function Divide({ p }: { p: P }) {
  const t = clamp(n(p, "total", 12), 1, 40), g = clamp(n(p, "groups", 3), 1, 10);
  const q = Math.floor(t / g), r = t % g;
  if (q > 12) return null;
  const cols = Math.min(g, 5), rows = Math.ceil(g / cols), cw = 100, ch = 86;
  const vbW = Math.max(cols * cw + 20, 300);
  return (
    <Frame vb={`0 0 ${vbW} ${rows * ch + (r ? 110 : 66)}`} label={s(p, "caption", `${t} หาร ${g} ได้ ${q}${r ? ` เศษ ${r}` : ""}`)}>
      {Array.from({ length: g }, (_, k) => {
        const cx = 10 + (k % cols) * cw, cy = 8 + Math.floor(k / cols) * ch;
        return (
          <g key={k}>
            <rect x={cx} y={cy} width={cw - 10} height={ch - 10} rx="12" fill="#fff" stroke="#bae6fd" strokeWidth="2.5" />
            {Array.from({ length: q }, (_, i) => <circle key={i} cx={cx + 16 + (i % 4) * 20} cy={cy + 18 + Math.floor(i / 4) * 20} r="8" fill="#38bdf8" stroke="#fff" strokeWidth="1.5" />)}
          </g>
        );
      })}
      {r > 0 && Array.from({ length: r }, (_, i) => <circle key={"r" + i} cx={30 + i * 24} cy={rows * ch + 24} r="9" fill="#fb923c" stroke="#fff" strokeWidth="1.5" />)}
      {r > 0 && <T x={vbW / 2} y={rows * ch + 60} t={`เหลือเศษ ${r}`} size={14} color={ORANGE} />}
      <T x={vbW / 2} y={rows * ch + (r ? 96 : 50)} t={`${t} ÷ ${g} = ${q}${r ? ` เศษ ${r}` : ""}`} size={18} color={ORANGE} />
    </Frame>
  );
}

// ---------- เปรียบเทียบด้วยแท่ง ----------
export function CmpBars({ p }: { p: P }) {
  const a = Math.max(0, n(p, "a", 3)), b = Math.max(0, n(p, "b", 2));
  const mx = Math.max(a, b, 1), la = s(p, "la", String(a)), lb = s(p, "lb", String(b));
  const sym = a > b ? ">" : a < b ? "<" : "=";
  return (
    <Frame vb="0 0 520 150" label={s(p, "caption", `${a} ${sym} ${b}`)}>
      <rect x="110" y="14" width={Math.max(4, (360 * a) / mx)} height="38" rx="8" fill="#38bdf8" stroke="#fff" strokeWidth="2" />
      <rect x="110" y="64" width={Math.max(4, (360 * b) / mx)} height="38" rx="8" fill="#fb923c" stroke="#fff" strokeWidth="2" />
      <T x={100} y={40} t={la} size={16} anchor="end" />
      <T x={100} y={90} t={lb} size={16} anchor="end" />
      <T x={260} y={136} t={`${a} ${sym} ${b}`} size={20} color={ORANGE} />
    </Frame>
  );
}

// ---------- แบบรูป (อีโมจิ) ----------
export function EmojiSeq({ p }: { p: P }) {
  const seq = arr(p, "seq").filter((x): x is string => typeof x === "string").slice(0, 10);
  const w = Math.min(64, Math.floor(480 / Math.max(seq.length, 1)));
  const x0 = 260 - (seq.length * w) / 2;
  return (
    <Frame vb="0 0 520 110" label={s(p, "caption", "แบบรูป")}>
      {seq.map((e, i) => (
        <g key={i}>
          <rect x={x0 + i * w + 3} y="20" width={w - 6} height="64" rx="10" fill={e === "❓" ? "#fef3c7" : "#fff"} stroke={e === "❓" ? ORANGE : "#bae6fd"} strokeWidth="2.5" strokeDasharray={e === "❓" ? "6 4" : "0"} />
          <text x={x0 + i * w + w / 2} y="64" fontSize={w * 0.5} textAnchor="middle">{e}</text>
        </g>
      ))}
    </Frame>
  );
}

const PALETTE = ["#38bdf8", "#fb923c", "#4ade80", "#f472b6", "#a78bfa", "#facc15"];
const labelsOf = (p: P) => arr(p, "labels").filter((x): x is string => typeof x === "string").slice(0, 8);
const valuesOf = (p: P, k = "values") => arr(p, k).map((x) => (typeof x === "number" && Number.isFinite(x) ? x : 0)).slice(0, 8);

// ---------- แผนภูมิเส้น ----------
export function LineChart({ p }: { p: P }) {
  const labels = labelsOf(p), vals = valuesOf(p);
  const k = Math.min(labels.length, vals.length);
  if (k < 2) return null;
  const mx = Math.max(...vals.slice(0, k)), lowest = Math.min(...vals.slice(0, k));
  const mn = lowest > 0.4 * mx ? Math.max(0, Math.floor(lowest / 5) * 5 - 5) : Math.min(0, lowest);
  const stepv = Math.max(1, Math.ceil((mx - mn) / 4));
  const top = mn + 4 * stepv;
  const x0 = 70, x1 = 490, y0 = 190, y1 = 30;
  const px = (i: number) => x0 + ((x1 - x0) * i) / (k - 1);
  const py = (v: number) => y0 - ((y0 - y1) * (v - mn)) / (top - mn);
  const mi = vals.indexOf(mx);
  return (
    <Frame vb="0 0 520 240" label={s(p, "caption", "แผนภูมิเส้น")}>
      {[0, 1, 2, 3, 4].map((g) => {
        const v = mn + ((top - mn) * g) / 4;
        return <g key={g}><line x1={x0} x2={x1} y1={py(v)} y2={py(v)} stroke="#bae6fd" strokeWidth="1.5" /><T x={x0 - 8} y={py(v) + 4} t={String(Math.round(v * 10) / 10)} size={11} anchor="end" color="#475569" /></g>;
      })}
      <polyline points={labels.slice(0, k).map((_, i) => `${px(i)},${py(vals[i])}`).join(" ")} fill="none" stroke={BLUE} strokeWidth="4" strokeLinejoin="round" />
      {labels.slice(0, k).map((l, i) => (
        <g key={i}>
          <circle cx={px(i)} cy={py(vals[i])} r={i === mi ? 8 : 6} fill={i === mi ? ORANGE : "#fff"} stroke={BLUE} strokeWidth="3" />
          <T x={px(i)} y={py(vals[i]) - 12} t={String(vals[i])} size={12} color={i === mi ? ORANGE : INK} />
          <T x={px(i)} y={212} t={l} size={12} />
        </g>
      ))}
      {s(p, "unit") && <T x={x0 - 8} y={20} t={s(p, "unit")} size={12} anchor="end" color="#475569" />}
      <T x={260} y={234} t={s(p, "note", "จุดสีส้ม = ค่าสูงสุด")} size={11} color="#475569" />
    </Frame>
  );
}

// ---------- แผนภูมิวงกลม ----------
export function Pie({ p }: { p: P }) {
  const labels = labelsOf(p), vals = valuesOf(p);
  const k = Math.min(labels.length, vals.length);
  const tot = vals.slice(0, k).reduce((a, b) => a + b, 0);
  if (k < 2 || tot <= 0) return null;
  let ang = -Math.PI / 2;
  const cx = 150, cy = 120, R = 100;
  const slices = vals.slice(0, k).map((v, i) => {
    const a2 = ang + (2 * Math.PI * v) / tot;
    const large = a2 - ang > Math.PI ? 1 : 0;
    const d = `M ${cx} ${cy} L ${cx + R * Math.cos(ang)} ${cy + R * Math.sin(ang)} A ${R} ${R} 0 ${large} 1 ${cx + R * Math.cos(a2)} ${cy + R * Math.sin(a2)} Z`;
    const mid = (ang + a2) / 2;
    ang = a2;
    return { d, i, tx: cx + R * 0.62 * Math.cos(mid), ty: cy + R * 0.62 * Math.sin(mid), pct: Math.round((v / tot) * 100) };
  });
  return (
    <Frame vb="0 0 520 240" label={s(p, "caption", "แผนภูมิวงกลม")}>
      {slices.map((sl) => <path key={sl.i} d={sl.d} fill={PALETTE[sl.i % PALETTE.length]} stroke="#fff" strokeWidth="3" />)}
      {slices.map((sl) => sl.pct >= 8 && <T key={"t" + sl.i} x={sl.tx} y={sl.ty + 5} t={`${sl.pct}%`} size={14} color="#fff" />)}
      {labels.slice(0, k).map((l, i) => (
        <g key={i}>
          <rect x="300" y={50 + i * 34} width="22" height="22" rx="5" fill={PALETTE[i % PALETTE.length]} />
          <T x={332} y={67 + i * 34} t={`${l} ${vals[i]}${s(p, "unit")}`} size={15} anchor="start" />
        </g>
      ))}
    </Frame>
  );
}

// ---------- แผนภูมิแท่งสองชุดข้อมูล ----------
export function GroupBars({ p }: { p: P }) {
  const labels = labelsOf(p), a = valuesOf(p, "a"), b = valuesOf(p, "b");
  const k = Math.min(labels.length, a.length, b.length);
  if (k < 1) return null;
  const mx = Math.max(...a.slice(0, k), ...b.slice(0, k), 1);
  const top = 4 * Math.max(1, Math.ceil(mx / 4));
  const x0 = 60, W = 430, gw = W / k, y0 = 190, H = 150;
  return (
    <Frame vb="0 0 520 250" label={s(p, "caption", "แผนภูมิแท่งสองชุดข้อมูล")}>
      {[0, 1, 2, 3, 4].map((g) => <g key={g}><line x1={x0} x2={x0 + W} y1={y0 - (H * g) / 4} y2={y0 - (H * g) / 4} stroke="#bae6fd" strokeWidth="1.5" /><T x={x0 - 8} y={y0 - (H * g) / 4 + 4} t={String(Math.round((top * g) / 4 * 10) / 10)} size={11} anchor="end" color="#475569" /></g>)}
      {labels.slice(0, k).map((l, i) => {
        const gx = x0 + i * gw + gw / 2;
        const bw = Math.min(30, gw / 3);
        return (
          <g key={i}>
            <rect x={gx - bw - 2} y={y0 - (H * a[i]) / top} width={bw} height={(H * a[i]) / top} rx="3" fill={PALETTE[0]} />
            <rect x={gx + 2} y={y0 - (H * b[i]) / top} width={bw} height={(H * b[i]) / top} rx="3" fill={PALETTE[1]} />
            <T x={gx - bw / 2 - 2} y={y0 - (H * a[i]) / top - 4} t={String(a[i])} size={11} />
            <T x={gx + bw / 2 + 2} y={y0 - (H * b[i]) / top - 4} t={String(b[i])} size={11} />
            <T x={gx} y={y0 + 18} t={l} size={12} />
          </g>
        );
      })}
      <rect x="150" y="224" width="14" height="14" rx="3" fill={PALETTE[0]} /><T x={170} y={236} t={s(p, "la", "ชุดที่ 1")} size={12} anchor="start" />
      <rect x="290" y="224" width="14" height="14" rx="3" fill={PALETTE[1]} /><T x={310} y={236} t={s(p, "lb", "ชุดที่ 2")} size={12} anchor="start" />
    </Frame>
  );
}
