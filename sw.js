// Offline support for the web/PWA build (spec section 6: works offline).
// Strategy: precache the app shell, then cache-first for every same-origin GET (engine, fonts, Quran pack),
// so after one full online visit the app opens and works without internet. A new build changes VERSION,
// which installs a fresh cache and deletes the old one.
const VERSION = 'a5b824e4718a';
const CACHE = `deen-aur-dunya-${VERSION}`;
const SHELL = ['./', 'index.html', 'flutter_bootstrap.js', 'main.dart.js', 'manifest.json', 'favicon.png', 'sqlite3.wasm'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('deen-aur-dunya-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  // Navigations: network first (fresh index.html), fall back to the cached shell when offline.
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put('index.html', copy));
      return res;
    }).catch(() => caches.match('index.html')));
    return;
  }
  event.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok && res.type === 'basic') {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
      }
      return res;
    })),
  );
});
