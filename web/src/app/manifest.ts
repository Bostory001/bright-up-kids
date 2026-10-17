import type { MetadataRoute } from "next";
import { BRAND, BRAND_FULL, TAGLINE } from "@/lib/brand";

// PWA: ให้ติดตั้งเป็นไอคอนบนหน้าจอ iPad / tablet / มือถือ / PC แล้วเปิดเต็มจอ
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND_FULL,
    short_name: BRAND,
    description: `แบบฝึกหัดออนไลน์และระบบ${TAGLINE}`,
    start_url: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#fffbeb",
    theme_color: "#f59e0b",
    lang: "th",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
    shortcuts: [
      { name: "นักเรียน", url: "/play" },
      { name: "ผู้ปกครอง", url: "/parent" },
      { name: "ครู / เจ้าของ", url: "/admin" },
    ],
  };
}
