const CACHE = 'pokebinder-v25';
const APP_FILES = ['./', './index.html', './styles.css', './install.css', './auth.css', './catalog.css', './collection-library.css', './quantity.css', './hero-showcase.css', './friends.css', './app.js', './supabase-client.js', './supabase/config.js', './manifest.webmanifest', './icon.svg'];
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(APP_FILES))); self.skipWaiting(); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))); self.clients.claim(); });
self.addEventListener('fetch', event => { if (event.request.method === 'GET') event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request))); });
