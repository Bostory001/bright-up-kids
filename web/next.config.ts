import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ตัวชี้ว่าอัปเกรดความปลอดภัยรอบนี้ทำโดยคำสั่ง next upgrade --agent=security แล้ว
  experimental: { agentUpgrade: "security" },
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // ห้ามเว็บอื่นฝังหน้าเราใน iframe (กันหลอกกด) / ห้ามเดาชนิดไฟล์ / ไม่ส่ง URL เต็มไปเว็บอื่น
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      // service worker ต้องไม่ถูก cache ไม่งั้นอัปเดตแอปแล้วเครื่องลูกค้าไม่ได้ของใหม่
      { source: "/sw.js", headers: [{ key: "Cache-Control", value: "no-cache" }] },
    ];
  },
};

export default nextConfig;
