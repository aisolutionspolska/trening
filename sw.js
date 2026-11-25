// Service worker: aplikacja działa bez internetu (np. na siłowni).
const VERSION = 'trening-v6';
const SHELL = [
  './', './index.html', './manifest.webmanifest', './css/app.css',
  './js/app.js', './js/db.js', './js/plan.js', './js/logic.js', './js/food.js', './js/sync.js',
  './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  // Baza produktów: zawsze z sieci (bez zapisywania).
  if (url.hostname.endsWith('openfoodfacts.org')) return;
  // Fonty: zapisz przy pierwszym użyciu, potem z pamięci.
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    e.respondWith(caches.open(VERSION + '-fonts').then(async c => {
      const hit = await c.match(e.request); if (hit) return hit;
      const res = await fetch(e.request); if (res.ok || res.type === 'opaque') c.put(e.request, res.clone()); return res;
    }));
    return;
  }
  if (url.origin !== location.origin) return;
  // Pliki aplikacji: najpierw sieć (świeża wersja), bez sieci – z pamięci.
  e.respondWith(fetch(e.request, { cache: 'no-cache' }).then(res => {
    const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); return res;
  }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))));
});
