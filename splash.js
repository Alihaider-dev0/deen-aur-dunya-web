// Start-up splash steps and service-worker registration. A file, not inline script, so the Content Security
// Policy in index.html can forbid inline scripts (QUALITY_DESIGN_PROMPT §4 web hardening, audit 2026-10-19).
// Steps: 1 page parsed, 2 app code loaded, 3 engine ready, 4 Quran data opened (from Dart). The bar only moves
// forward; the app removes the splash after its first real frame (lib/core/web_splash_web.dart).
(function () {
  var widths = { 1: '12%', 2: '40%', 3: '65%', 4: '90%' };
  var step = 1;
  window.setSplashStep = function (n) {
    if (n <= step || !widths[n]) return;
    step = n;
    var bar = document.getElementById('splash-bar');
    if (bar) bar.style.width = widths[n];
  };
  window.removeSplash = function () {
    var el = document.getElementById('splash');
    if (!el) return;
    var bar = document.getElementById('splash-bar');
    if (bar) bar.style.width = '100%';
    el.classList.add('gone');
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 260);
  };
  // Safety net: never hide the page for ever if start-up fails.
  setTimeout(window.removeSplash, 120000);
  // Offline support (sw.js). Registered after load so it never delays the first paint.
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js'); });
  }
})();
