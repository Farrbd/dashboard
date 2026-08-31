/* پشتیبانی اپلیکیشن (PWA) — دکمهٔ «نصب اپ»، راهنمای نصب، ثبت Service Worker */
(function () {
  'use strict';
  var deferred = null;

  function $(s) { return document.querySelector(s); }
  function $$(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }

  /* ---- استایل دکمه و راهنما (تزریق خودکار، بدون دست زدن به CSS هر صفحه) ---- */
  var st = document.createElement('style');
  st.textContent =
    '.install-btn{display:inline-block;background:linear-gradient(135deg,#f3b33c,#e8834a);border:0;color:#241505;' +
    'font:inherit;font-size:12.5px;font-weight:800;border-radius:999px;padding:7px 15px;cursor:pointer;' +
    'box-shadow:0 3px 12px rgba(243,179,60,.35);transition:transform .15s,box-shadow .2s}';
  st.textContent += '.install-btn:hover{transform:translateY(-1px);box-shadow:0 5px 16px rgba(243,179,60,.5)}';
  st.textContent += '.install-help{position:fixed;inset:0;background:rgba(4,9,14,.74);display:none;align-items:center;justify-content:center;z-index:999;padding:18px}';
  st.textContent += '.install-help.open{display:flex}';
  st.textContent += '.install-help .box{background:#141d27;border:1px solid #2e4051;border-radius:18px;max-width:440px;width:100%;padding:22px;color:#eaf2f7;line-height:2.1;box-shadow:0 24px 70px rgba(0,0,0,.55)}';
  st.textContent += '.install-help h3{margin:0 0 10px;color:#f3c95c;font-size:17px}';
  st.textContent += '.install-help .k{display:inline-block;background:#0d141d;border:1px solid #2e4051;border-radius:7px;padding:0 9px;margin:0 2px;color:#bfe8e5;font-size:12.5px}';
  st.textContent += '.install-help .close{margin-top:12px;background:#0b918d;border:0;color:#04110f;font:inherit;font-weight:800;border-radius:9px;padding:8px 22px;cursor:pointer;width:100%}';
  st.textContent += '.pwa-toast{position:fixed;bottom:18px;left:50%;transform:translateX(-50%);background:#14251f;border:1px solid #2e7d5b;color:#a9f0d0;padding:10px 18px;border-radius:12px;font-size:13px;z-index:1000;box-shadow:0 8px 30px rgba(0,0,0,.5);transition:opacity .4s}';
  document.head.appendChild(st);

  function isStandalone() {
    return window.matchMedia && window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
  }

  function toast(msg) {
    var t = document.createElement('div');
    t.className = 'pwa-toast'; t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.style.opacity = '0'; setTimeout(function () { t.remove(); }, 450); }, 3400);
  }

  /* ---- کادر راهنما ---- */
  function showHelp() {
    var m = $('#installHelp');
    if (!m) {
      m = document.createElement('div');
      m.id = 'installHelp'; m.className = 'install-help';
      m.innerHTML =
        '<div class="box"><h3>📲 نصب اپ روی گوشی</h3>' +
        '<b>اندروید (کروم):</b> بالای صفحه دکمهٔ <span class="k">⋮</span> را باز کنید و ' +
        '<span class="k">افزودن به صفحهٔ اصلی</span> یا <span class="k">نصب برنامه</span> را بزنید.<br>' +
        '<b>آیفون (سافاری):</b> دکمهٔ اشتراک <span class="k">⬆</span> را بزنید و ' +
        '<span class="k">Add to Home Screen</span> را انتخاب کنید.<br>' +
        '<span style="color:#95a6b7;font-size:12.5px">بعد از نصب، آیکونِ داشبورد روی صفحهٔ گوشی است؛ ' +
        'مثل یک اپ واقعی تمام‌صفحه باز می‌شود و حتی بدون اینترنت هم آخرین قیمت‌ها را نشان می‌دهد.</span><br>' +
        '<button class="close" type="button">فهمیدم، بستن</button></div>';
      document.body.appendChild(m);
      m.querySelector('.close').addEventListener('click', function () { m.classList.remove('open'); });
      m.addEventListener('click', function (e) { if (e.target === m) m.classList.remove('open'); });
    }
    m.classList.add('open');
  }

  /* ---- دکمهٔ نصب (به ردیف اول meta-row اضافه می‌شود) ---- */
  function makeBtn() {
    if ($('#installBtn')) return;
    var row = $('.meta-row');
    if (!row) return;
    var b = document.createElement('button');
    b.id = 'installBtn'; b.className = 'install-btn'; b.type = 'button';
    b.textContent = '📲 نصب اپ';
    b.addEventListener('click', function () {
      if (deferred) {
        deferred.prompt();
        deferred.userChoice.then(function (c) {
          deferred = null;
          if (c.outcome === 'accepted') { hideBtn(); } else { showHelp(); }
        });
      } else {
        showHelp();
      }
    });
    row.appendChild(b);
  }
  function hideBtn() { var b = $('#installBtn'); if (b) b.style.display = 'none'; }
  function showBtn() { var b = $('#installBtn'); if (b) b.style.display = 'inline-block'; }

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferred = e;
    makeBtn(); showBtn();
  });
  window.addEventListener('appinstalled', function () {
    hideBtn();
    toast('✅ اپ نصب شد — آیکونش روی صفحهٔ گوشی است');
  });

  var mq = window.matchMedia ? window.matchMedia('(display-mode: standalone)') : null;
  function onMode() { if (isStandalone()) hideBtn(); }
  if (mq) {
    if (mq.addEventListener) mq.addEventListener('change', onMode);
    else if (mq.addListener) mq.addListener(onMode);
  }

  /* همیشه دکمه را نشان بده (حتی اگر هنوز installable نباشد) — کلیکش راهنما را باز می‌کند */
  if (isStandalone()) { hideBtn(); } else { makeBtn(); }

  /* ---- ثبت Service Worker ---- */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () { /* بی‌صدا */ });
    });
  }
})();
