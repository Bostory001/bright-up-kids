// หน้านี้ถูก service worker เก็บไว้ในเครื่อง แสดงเมื่อเปิดแอปตอนไม่มีอินเทอร์เน็ต
export default function OfflinePage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
      <div className="text-6xl">📡</div>
      <h1 className="text-2xl font-bold">ไม่มีอินเทอร์เน็ต</h1>
      <p className="text-gray-600">ต่อ Wi-Fi หรือเน็ตมือถือ แล้วลองใหม่อีกครั้งนะ</p>
      {/* ใช้ <a> ธรรมดาเพื่อให้โหลดหน้าใหม่จาก server จริง */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a href="/" className="rounded-2xl bg-amber-500 px-6 py-3 text-lg font-bold text-white">
        ลองใหม่
      </a>
    </main>
  );
}
