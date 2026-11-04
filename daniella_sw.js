/* daniella_sw.js
 * - ما بيخزّن الصفحات بالكاش أبداً، فالزبون دايماً بيشوف آخر نسخة
 * - بيمسح أي كاش قديم تركته النسخ السابقة
 * - بيدعم الإشعارات (صفحة الأدمن)
 */
const SW_VERSION = "dn-sw-2026-11-04-1"; // غيّره مع كل نشر إذا بدك تجبر المتصفحات تحدّث الـ SW

self.addEventListener("install", () => {
  self.skipWaiting(); // فعّل النسخة الجديدة فوراً
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    // احذف كل الكاشات القديمة
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
    await self.clients.claim(); // سيطر على الصفحات المفتوحة
  })());
});

// دايماً من الشبكة، وتجاوز كاش المتصفح للصفحات (HTML)
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  // لا تتدخل بطلبات Supabase أو أي دومين ثاني
  if (url.origin !== self.location.origin) return;

  if (req.mode === "navigate" || req.destination === "document") {
    event.respondWith(fetch(req, { cache: "no-store" }).catch(() => fetch(req)));
  }
  // باقي الملفات (صور، manifest...) بتمشي طبيعي بدون تدخل
});

// الضغط على الإشعار بيفتح/بيرجّع الصفحة
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil((async () => {
    const list = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of list) {
      if ("focus" in c) return c.focus();
    }
    if (self.clients.openWindow) return self.clients.openWindow("./");
  })());
});
