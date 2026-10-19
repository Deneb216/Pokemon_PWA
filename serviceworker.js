const CACHE_NAME = "pokedex-static-v5"; // ¡Sube este número!
const DYNAMIC_CACHE = "pokedex-dynamic-v1"; // <--- ¡ESTA ES LA LÍNEA QUE TE FALTA!

const assets = [
  "./",
  "./index.html",
  "./detalles.html",       // <--- NUEVO ARCHIVO
  "./Css/style.css",
  "./Js/app.js",
  "./Js/detalles.js",      // <--- NUEVO SCRIPT
  "./manifest.json"
];
// (Mantén el resto de tu código de Service Worker exactamente igual)

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(assets))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME && key !== DYNAMIC_CACHE)
            .map(key => caches.delete(key))
      );
    })
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;

  // 1. ESTRATEGIA PARA LA API EXTERNA Y SUS IMÁGENES (Caché Dinámico)
  // Si la URL empieza con "http" y no es de nuestro propio dominio...
  if (request.url.startsWith('http') && !request.url.includes(self.location.hostname)) {
    event.respondWith(
      caches.match(request).then(cachedResponse => {
        // Devuelve desde el caché dinámico si ya existe (Offline)
        if (cachedResponse) {
          return cachedResponse; 
        }
        // Si no existe, lo descarga de internet y lo guarda (Online)
        return fetch(request).then(networkResponse => {
          return caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // 2. ESTRATEGIA PARA ARCHIVOS LOCALES (Network First)
  event.respondWith(
    fetch(request)
      .then(networkResponse => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => caches.match(request, { ignoreSearch: true }))
  );
});