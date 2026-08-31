/* Service Worker — داشبورد فلزات (نسخهٔ ۱)
   استراتژی:
   - صفحه‌ها (navigate): اول شبکه، اگر نبود آخرین نسخهٔ کش‌شده (آفلاین هم باز می‌شود)
   - فایل‌های ثابت (css/js/icons): اول کش، بعد آپدیت در پس‌زمینه
   - درخواست‌های بیرونی مثل TGJU اصلاً دست نمی‌خورند */
var CACHE = 'flz-v1';
var CORE = [
  './',
  './index.html',
  './silver.html',
  './gold.html',
  './coin.html',
  './copper.html',
  './fonts.css',
  './metals-bootstrap.js',
  './manifest.json',
  './pwa.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(CORE); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (ks) {
        return Promise.all(ks.filter(function (k) { return k !== CACHE; })
          .map(function (k) { return caches.delete(k); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  /* فقط درخواست‌های همین سایت — TGJU و بقیهٔ خارجی دست‌نخورده */
  if (req.url.indexOf(self.location.origin) !== 0) return;

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(function (res) {
        if (res && res.ok) {
          var cp = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, cp); });
        }
        return res;
      }).catch(function () {
        return caches.match(req).then(function (hit) {
          return hit || caches.match('./index.html');
        });
      })
    );
    return;
  }

  /* فایل ثابت: کش اول — آپدیت در پس‌زمینه */
  e.respondWith(
    caches.match(req).then(function (hit) {
      var net = fetch(req).then(function (res) {
        if (res && res.ok) {
          var cp = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, cp); });
        }
        return res;
      }).catch(function () { return hit; });
      return hit || net;
    })
  );
});
