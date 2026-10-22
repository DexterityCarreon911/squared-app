const CACHE_NAME = "squared-shell-v3"

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME)
      await cache.addAll([
        "/",
        "/manifest.json",
        "/images/Squared_Logo.svg",
        "/images/squared-icon-192.png",
        "/images/squared-icon-512.png",
      ])
      await self.skipWaiting()
    })()
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys
        .filter((key) => key.startsWith("squared-shell-") && key !== CACHE_NAME)
        .map((key) => caches.delete(key))
    ))
  )
  self.clients.claim()
})

self.addEventListener("fetch", (event) => {
  const request = event.request
  const url = new URL(request.url)
  if (request.method !== "GET" || url.origin !== self.location.origin) return
  if (url.pathname.endsWith(".php") || url.pathname.startsWith("/api/")) return

  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request)
          if (response.ok && (response.headers.get("content-type") || "").includes("text/html")) {
            const copy = response.clone()
            event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put("/index.html", copy)))
          }
          return response
        } catch (error) {
          const cached = await caches.match("/index.html") || await caches.match("/")
          if (cached) return cached
          throw error
        }
      })()
    )
    return
  }

  if (url.pathname.startsWith("/assets/")) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
          }
          return response
        })
        return cached || network
      })
    )
  }
})
