import { ImageResponse } from "next/og";

// ไอคอนสำหรับ "เพิ่มไปยังหน้าจอโฮม" บน iPad / iPhone (ต้องเป็น PNG)
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#f59e0b" }}>
      <div style={{ width: 110, height: 110, borderRadius: 55, background: "#fffbeb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64 }}>
        B
      </div>
    </div>,
    size,
  );
}
