self.addEventListener("install", (event) => {
  console.log("Service Worker instalado.");
  self.skipWaiting(); // <- IMPORTANTE
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker ativado.");
  event.waitUntil(clients.claim()); // <- IMPORTANTE
});

self.addEventListener("fetch", (event) => {
  // Pode ficar vazio por enquanto
});
