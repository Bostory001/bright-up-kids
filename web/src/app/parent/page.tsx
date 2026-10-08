import Link from "next/link";

export default function ParentPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 p-6">
      <Link href="/" className="text-sm text-amber-700">← หน้าแรก</Link>
      <h1 className="mt-2 text-2xl font-bold">ผู้ปกครอง</h1>
      <p className="mt-4 rounded-2xl bg-white p-4 text-gray-600 shadow-sm">
        ยังไม่ทำ — แผน: เข้าผ่าน LINE (LIFF) ดูการเข้าเรียน ผลแบบฝึกหัด และใบแจ้งค่าเรียนของลูก
      </p>
    </main>
  );
}
