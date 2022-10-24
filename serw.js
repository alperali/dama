self.addEventListener('install', () => {
  self.skipWaiting();
  console.log('serw install.');
});

self.addEventListener("activate", () => console.log('serw activate.'));

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.open('c-damalper').then(c => {
      return fetch(e.request)
              .then(resp => {
                  c.put(e.request, resp.clone());
                  return resp;
               })
              .catch(() => c.match(e.request));
      })
  );
});
