// Service worker mínimo: hace la app instalable y permite abrirla sin conexión.
// Las prendas viven en IndexedDB, así que solo hace falta cachear la interfaz.
const CACHE = "armario-v1";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  // Red primero; si no hay conexión, lo último que se guardó.
  event.respondWith(
    fetch(request)
      .then((res) => {
        if (res.ok) {
          const copia = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copia));
        }
        return res;
      })
      .catch(() => caches.match(request).then((r) => r ?? caches.match("/"))),
  );
});
