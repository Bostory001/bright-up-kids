// หน้าเด็ก: มือถือ/แท็บเล็ตขนาดเดิม · จอกว้าง (คอม) ขยายทั้งหน้าให้ตัวอักษร การ์ด ปุ่มใหญ่ขึ้นตามจอ
export default function PlayLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh md:[zoom:1.15] lg:[zoom:1.3] xl:[zoom:1.45]">{children}</div>;
}
