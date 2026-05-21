self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Graceful fallback for failed network requests
  event.respondWith(
    fetch(event.request).catch(() => {
      // If navigation request, serve a simple offline page if cached
      if (event.request.mode === 'navigate') {
        return caches.match('/offline.html') || new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
      }
      // For other requests, return empty response
      return new Response('', { status: 504, statusText: 'Gateway Timeout' });
    })
  );
});
