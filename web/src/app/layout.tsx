import type { Metadata, Viewport } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import { RegisterSw } from "@/components/RegisterSw";
import "./globals.css";

const notoThai = Noto_Sans_Thai({
  variable: "--font-noto-thai",
  subsets: ["thai", "latin"],
});

export const metadata: Metadata = {
  title: "Bright Up Kids",
  description: "ระบบสถาบันเรียนพิเศษ ป.1-6 — แบบฝึกหัดออนไลน์ เช็กชื่อ ค่าเรียน",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f59e0b",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`${notoThai.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <RegisterSw />
      </body>
    </html>
  );
}
