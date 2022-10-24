self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('c-damalper')
    .then(c => c.addAll(['./index.html', './css/style.css',
                         './img/icons.svg', './img/tahta.svg',
                         './img/favicon-192.png', './img/favicon.ico', './img/ikon.png', './img/ikon-apple.png',
                         './js/dama.js', './js/gorsel.js']))
  );
});

self.addEventListener("activate", e => console.log("serw activate."));

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.open('c-damalper').then(c => c.match(e.request))
                             .then(resp => resp ?? fetch(e.request))
  );
});