// Service worker: ให้แอปเปิดติดแม้เน็ตหลุด (แสดงหน้าออฟไลน์) และโหลดไฟล์หน้าจอจาก cache ให้เร็วขึ้น
// ไม่ cache /api เลย — คะแนน เหรียญ และข้อมูลนักเรียนต้องมาจาก server เสมอ
const CACHE = "buk-v1";
const OFFLINE_URL = "/offline";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll([OFFLINE_URL, "/icon.svg"])));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  // ไฟล์ build มี hash ในชื่อ ไม่เปลี่ยนเนื้อหา → cache ได้ถาวร
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ??
          fetch(request).then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(CACHE).then((cache) => cache.put(request, copy));
            }
            return res;
          }),
      ),
    );
    return;
  }

  // เปิดหน้า: เอาจากเน็ตก่อน ถ้าไม่มีเน็ตแสดงหน้าออฟไลน์
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_URL)));
  }
});
