// Keeps the app's page on the phone so it opens instantly and offline.
// Shows the saved copy at once and fetches a fresh one in the background (used next time).
const CACHE = 'budget-shell-v2';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return; // data calls to Google go straight to the network
  e.respondWith(caches.open(CACHE).then(async (c) => {
    const key = e.request.mode === 'navigate' ? './index.html' : e.request;
    const saved = await c.match(key, { ignoreSearch: true });
    const fresh = fetch(e.request).then((r) => { if (r.ok) c.put(key, r.clone()); return r; }).catch(() => saved);
    return saved || fresh;
  }));
});
