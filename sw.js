// Service worker sederhana — hanya meng-cache "kerangka" aplikasi (HTML/manifest/ikon),
// supaya aplikasi tetap bisa terbuka walau koneksi TV sempat putus sesaat.
// Data JSON (tv-display.json) SENGAJA TIDAK di-cache di sini karena harus selalu diambil
// dari jaringan agar datanya paling baru — fallback data lama sudah ditangani lewat
// localStorage langsung di index.html.
const CACHE_NAME='masjid-tv-shell-v1';
const SHELL_FILES=['./index.html','./manifest.json','./icon-192.png','./icon-512.png'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(SHELL_FILES)));
  self.skipWaiting();
});
self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k))))
  );
  self.clients.claim();
});
self.addEventListener('fetch',e=>{
  const url=new URL(e.request.url);
  // Jangan campur tangani permintaan ke file data JSON / API GitHub — biarkan selalu ke jaringan.
  if(url.pathname.endsWith('.json') && !SHELL_FILES.some(f=>url.pathname.endsWith(f.replace('./','')))) return;
  e.respondWith(
    caches.match(e.request).then(cached=>cached||fetch(e.request))
  );
});
