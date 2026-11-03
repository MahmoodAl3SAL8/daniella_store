// Service Worker لمتجر دانييلا: يخلّي الموقع يتثبّت كتطبيق، ويدعم إشعارات لوحة التحكم.
// الاستراتيجية: الشبكة أولاً (عشان الأقمشة والأسعار تضل محدّثة)، والكاش فقط إذا انقطع النت.
// طلبات Supabase والمكتبات الخارجية بتمرّ مباشرة بدون كاش.
const CACHE = "daniella-v1";
const PRECACHE = ["offline.html", "icons/icon-192.png", "icons/icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin) return;
  // لوحة التحكم ما بتنخزّن أبداً
  if (url.pathname.endsWith("/admin.html")) return;

  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then((hit) => hit || (req.mode === "navigate" ? caches.match("offline.html") : Response.error()))
      )
  );
});

// الضغط على الإشعار بيفتح اللوحة أو يرجّع التركيز عليها
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      if (list.length) return list[0].focus();
      return self.clients.openWindow("./");
    })
  );
});
