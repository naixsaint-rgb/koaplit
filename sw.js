/* KOAPLIT — service worker v2 */
const CACHE = 'koaplit-v2.1.1';
const ARCHIVOS = [
  './',
  './index.html',
  './styles.css?v=201',
  './fonts.css?v=200',
  './i18n.js?v=201',
  './nucleo.js?v=201',
  './graficos.js?v=201',
  './sync.js?v=201',
  './notificaciones.js?v=201',
  './ocr.js?v=201',
  './ui.js?v=202',
  './vendor/mqtt.min.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ARCHIVOS.map(u => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(claves => Promise.all(claves.filter(k => k !== CACHE && k.startsWith('koaplit')).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // API de tasas, Firebase… van directas a la red

  // navegación: red primero (los despliegues nuevos llegan), caché como respaldo offline
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(resp => {
        const copia = resp.clone();
        if (resp.ok) caches.open(CACHE).then(c => c.put('./index.html', copia));
        return resp;
      }).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // OCR (archivos grandes): caché en el primer uso
  if (url.pathname.includes('/vendor/tesseract/')) {
    e.respondWith(
      caches.match(req).then(res => res || fetch(req).then(resp => {
        const copia = resp.clone();
        if (resp.ok) caches.open(CACHE).then(c => c.put(req, copia));
        return resp;
      }))
    );
    return;
  }

  // resto de recursos: caché primero (URLs versionadas con ?v=)
  e.respondWith(
    caches.match(req).then(res => res || fetch(req).then(resp => {
      const copia = resp.clone();
      if (resp.ok) caches.open(CACHE).then(c => c.put(req, copia));
      return resp;
    }))
  );
});
