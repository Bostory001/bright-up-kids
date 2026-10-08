import type { AvatarSlot } from "@/lib/types";

// Avatar วาดด้วย SVG ซ้อนชั้น: พื้นหลัง → ชุด → ตัว/หน้า → หมวก → สัตว์เลี้ยง
// id ต้องตรงกับ AVATAR_ITEMS ใน lib/gamification.ts

const BACKGROUNDS: Record<string, React.ReactNode> = {
  bg_sky: (
    <>
      <rect width="200" height="200" fill="#bae6fd" />
      <circle cx="160" cy="40" r="20" fill="#fde047" />
      <ellipse cx="50" cy="45" rx="28" ry="12" fill="#fff" />
      <ellipse cx="70" cy="38" rx="20" ry="12" fill="#fff" />
      <rect y="170" width="200" height="30" fill="#86efac" />
    </>
  ),
  bg_space: (
    <>
      <rect width="200" height="200" fill="#1e1b4b" />
      {[[30, 30], [170, 50], [60, 70], [150, 20], [20, 120], [180, 130], [110, 15]].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="2.5" fill="#fef9c3" />
      ))}
      <circle cx="165" cy="95" r="14" fill="#f97316" />
      <ellipse cx="165" cy="95" rx="24" ry="5" fill="none" stroke="#fdba74" strokeWidth="3" />
    </>
  ),
  bg_castle: (
    <>
      <rect width="200" height="200" fill="#fed7aa" />
      <path d="M10 200V110h20V95h10v15h20V80h10v-15h10v15h10v30h20V95h10v15h20v90z" fill="#a8a29e" opacity="0.55" />
      <rect y="175" width="200" height="25" fill="#84cc16" />
    </>
  ),
};

const OUTFITS: Record<string, React.ReactNode> = {
  outfit_uniform: (
    <>
      <path d="M55 200v-45q0-30 45-30t45 30v45z" fill="#fff" stroke="#cbd5e1" strokeWidth="2" />
      <path d="M85 126l15 18 15-18" fill="none" stroke="#1d4ed8" strokeWidth="5" />
    </>
  ),
  outfit_hero: (
    <>
      <path d="M45 200l15-70h80l15 70z" fill="#b91c1c" />
      <path d="M55 200v-45q0-30 45-30t45 30v45z" fill="#2563eb" />
      <path d="M100 145l8 14h-16z" fill="#fde047" />
      <circle cx="100" cy="165" r="12" fill="#fde047" />
    </>
  ),
  outfit_knight: (
    <>
      <path d="M55 200v-45q0-30 45-30t45 30v45z" fill="#94a3b8" stroke="#475569" strokeWidth="3" />
      <path d="M100 135v65M70 150h60" stroke="#475569" strokeWidth="3" />
      <circle cx="100" cy="150" r="7" fill="#fde047" />
    </>
  ),
};

const HATS: Record<string, React.ReactNode> = {
  hat_cap: (
    <>
      <path d="M62 68q38-42 76 0z" fill="#2563eb" />
      <path d="M128 66q28-4 34 10-22-2-36-2z" fill="#1d4ed8" />
    </>
  ),
  hat_crown: <path d="M66 66l-4-34 20 16 18-24 18 24 20-16-4 34z" fill="#facc15" stroke="#ca8a04" strokeWidth="2" />,
  hat_wizard: (
    <>
      <path d="M100 0l34 64H66z" fill="#7c3aed" />
      <ellipse cx="100" cy="64" rx="46" ry="9" fill="#6d28d9" />
      <path d="M100 26l3 7h7l-6 5 2 8-6-5-6 5 2-8-6-5h7z" fill="#fde047" />
    </>
  ),
};

const PETS: Record<string, React.ReactNode> = {
  pet_cat: (
    <g transform="translate(150 158)">
      <path d="M-18-14l4-14 10 10zM18-14l-4-14-10 10z" fill="#fb923c" />
      <circle r="20" fill="#fb923c" />
      <circle cx="-7" cy="-3" r="2.5" />
      <circle cx="7" cy="-3" r="2.5" />
      <path d="M-4 5q4 4 8 0" fill="none" stroke="#000" strokeWidth="1.5" />
    </g>
  ),
  pet_dragon: (
    <g transform="translate(150 155)">
      <path d="M-20-6l-12-16 16 6zM20-6l12-16-16 6z" fill="#15803d" />
      <ellipse rx="22" ry="20" fill="#22c55e" />
      <path d="M-8-22l4 8 4-8 4 8 4-8" fill="none" stroke="#15803d" strokeWidth="3" />
      <circle cx="-8" cy="-4" r="3" />
      <circle cx="8" cy="-4" r="3" />
      <path d="M-6 8h12" stroke="#14532d" strokeWidth="2" />
      <path d="M10 10q10 2 8 12" fill="none" stroke="#f97316" strokeWidth="3" />
    </g>
  ),
};

export function AvatarSvg({ equipped, size = 160 }: { equipped: Partial<Record<AvatarSlot, string>>; size?: number }) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} className="rounded-3xl" role="img" aria-label="avatar">
      {BACKGROUNDS[equipped.background ?? ""] ?? <rect width="200" height="200" fill="#fde68a" />}
      {OUTFITS[equipped.outfit ?? ""] ?? <path d="M55 200v-45q0-30 45-30t45 30v45z" fill="#fbbf24" />}
      {/* หัว */}
      <circle cx="100" cy="88" r="40" fill="#fcd9b6" />
      <path d="M61 84q-2-42 39-42t39 42q-12-22-39-22T61 84z" fill="#3f2a1d" />
      <circle cx="86" cy="92" r="4.5" fill="#1f2937" />
      <circle cx="114" cy="92" r="4.5" fill="#1f2937" />
      <circle cx="76" cy="103" r="6" fill="#fda4af" opacity="0.6" />
      <circle cx="124" cy="103" r="6" fill="#fda4af" opacity="0.6" />
      <path d="M88 106q12 11 24 0" fill="none" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" />
      {HATS[equipped.hat ?? ""]}
      {PETS[equipped.pet ?? ""]}
    </svg>
  );
}
