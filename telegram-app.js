/* Telegram Mini App — اتصال داشبورد به WebApp SDK تلگرام
   - اگر صفحه داخل تلگرام باز شود: آماده‌سازی نمایش، دکمهٔ بازگشت تلگرام، باز کردن لینک‌های بیرونی داخل تلگرام
   - اگر بیرون از تلگرام (مرورگر معمولی / PWA) باز شود: هیچ کاری نمی‌کند و رفتار قبلی حفظ می‌شود */
(function () {
  'use strict';

  var tg = window.Telegram && window.Telegram.WebApp;
  /* بیرون از تلگرام، platform برابر 'unknown' است */
  if (!tg || !tg.platform || tg.platform === 'unknown') return;

  window.__IN_TELEGRAM = true;
  document.documentElement.classList.add('tg-app');

  function safe(fn) { try { fn(); } catch (e) { /* نسخه‌های قدیمی‌تر تلگرام بعضی متدها را ندارند */ } }

  /* آماده‌سازی: اعلام آمادگی، تمام‌صفحه، و رنگ هدر/پس‌زمینه هماهنگ با داشبورد */
  safe(function () { tg.ready(); });
  safe(function () { tg.expand(); });
  safe(function () { tg.setHeaderColor('#000000'); });
  safe(function () { tg.setBackgroundColor('#000000'); });
  /* جلوگیری از بسته شدن اپ با کشیدن انگشت به پایین هنگام اسکرول نمودارها */
  safe(function () { if (tg.disableVerticalSwipes) tg.disableVerticalSwipes(); });

  /* دکمهٔ بازگشت تلگرام: فقط در صفحه‌های جزئیات (copper/silver/gold/coin) نشان داده می‌شود */
  var path = location.pathname;
  var isHome = !/\.html$/i.test(path) || /\/index\.html$/i.test(path);
  if (!isHome && tg.BackButton) {
    safe(function () {
      tg.BackButton.show();
      tg.BackButton.onClick(function () { location.href = 'index.html'; });
    });
  }

  /* لینک‌های بیرونی (TGJU، chartix، cdn.ime و…) داخل تلگرام با مرورگر پیش‌فرض باز شوند */
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a || !/^https?:\/\//i.test(a.getAttribute('href') || '')) return;
    if (a.origin === location.origin) return;
    if (tg.openLink) {
      e.preventDefault();
      safe(function () { tg.openLink(a.href); });
    }
  }, true);
})();
