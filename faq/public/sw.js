// ===== SERVICE WORKER - MENURU PWA v1.0.1 =====
// v1.0.1: Tambah handler notifikasi Live Chat Agent
const CACHE_NAME = "menuru-pwa-v1.0.1";
const RUNTIME_CACHE = "menuru-runtime-v1.0.1";
const IMAGE_CACHE = "menuru-images-v1.0.1";

// File yang di-cache saat install (offline-first)
const PRECACHE_URLS = [
  "/",
  "/offline.html",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// ===== INSTALL EVENT =====
self.addEventListener("install", (event) => {
  console.log("[SW] Installing... v1.0.1");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Pre-caching app shell");
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
      .catch((err) => console.error("[SW] Pre-cache failed:", err))
  );
});

// ===== ACTIVATE EVENT =====
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating... v1.0.1");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              return (
                name !== CACHE_NAME &&
                name !== RUNTIME_CACHE &&
                name !== IMAGE_CACHE
              );
            })
            .map((name) => {
              console.log("[SW] Deleting old cache:", name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// ===== FETCH EVENT =====
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip Firebase & external API calls (biar tidak error)
  if (
    url.hostname.includes("firebase") ||
    url.hostname.includes("googleapis") ||
    url.hostname.includes("gstatic") ||
    url.hostname.includes("firebaseio") ||
    url.hostname.includes("cloudfunctions")
  ) {
    return;
  }

  // Skip Chrome extensions
  if (url.protocol === "chrome-extension:") return;

  // ===== IMAGES: Cache-first =====
  if (
    request.destination === "image" ||
    /\.(png|jpg|jpeg|gif|webp|svg|ico)$/i.test(url.pathname)
  ) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          return fetch(request)
            .then((response) => {
              if (response && response.status === 200) {
                cache.put(request, response.clone());
              }
              return response;
            })
            .catch(() => caches.match("/icons/icon-192x192.png"));
        });
      })
    );
    return;
  }

  // ===== STATIC ASSETS (JS, CSS): Stale-while-revalidate =====
  if (
    request.destination === "script" ||
    request.destination === "style" ||
    /\.(js|css|woff|woff2|ttf|eot)$/i.test(url.pathname)
  ) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => cachedResponse);
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // ===== HTML / NAVIGATION: Network-first, fallback ke cache =====
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || caches.match("/offline.html");
          });
        })
    );
    return;
  }

  // ===== DEFAULT: Network-first dengan cache fallback =====
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});

// ===== MESSAGE EVENT =====
// Handle: SKIP_WAITING, CLEAR_CACHE, SHOW_NOTIFICATION, CLOSE_NOTIFICATION, GET_NOTIFICATIONS
self.addEventListener("message", (event) => {
  const data = event.data || {};

  // ----- SKIP WAITING (update SW) -----
  if (data.type === "SKIP_WAITING") {
    console.log("[SW] Skip waiting, activating new version");
    self.skipWaiting();
    return;
  }

  // ----- CLEAR CACHE -----
  if (data.type === "CLEAR_CACHE") {
    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name));
    });
    return;
  }

  // ----- SHOW NOTIFICATION (Live Chat Agent) -----
  if (data.type === "SHOW_NOTIFICATION") {
    const payload = data.payload || {};
    const {
      title = "Menuru Live Chat",
      body = "Ada pesan baru",
      icon = "/icons/icon-192x192.png",
      badge = "/icons/icon-192x192.png",
      tag = "livechat-" + Date.now(),
      url = "/live-chat-agent",
      requireInteraction = false,
      silent = false,
      senderName = "",
      senderPhoto = "",
    } = payload;

    console.log("[SW] Show notification:", title, "|", body);

    const options = {
      body,
      icon: senderPhoto || icon,
      badge,
      tag, // tag sama = notifikasi replace, tidak menumpuk
      renotify: true, // tetap getar walau tag sama
      requireInteraction, // true = notifikasi tidak auto-hilang
      silent,
      vibrate: [200, 100, 200],
      data: {
        url,
        senderName,
        timestamp: Date.now(),
      },
      actions: [
        { action: "open", title: "💬 Buka Chat" },
        { action: "close", title: "Tutup" },
      ],
    };

    event.waitUntil(self.registration.showNotification(title, options));
    return;
  }

  // ----- CLOSE NOTIFICATION (by tag prefix) -----
  if (data.type === "CLOSE_NOTIFICATION") {
    const tagPrefix = data.tagPrefix || "livechat-";
    event.waitUntil(
      self.registration.getNotifications().then((notifications) => {
        notifications.forEach((n) => {
          if (n.tag && n.tag.startsWith(tagPrefix)) {
            console.log("[SW] Closing notification:", n.tag);
            n.close();
          }
        });
      })
    );
    return;
  }

  // ----- GET NOTIFICATIONS (debug) -----
  if (data.type === "GET_NOTIFICATIONS") {
    event.waitUntil(
      self.registration.getNotifications().then((notifications) => {
        console.log("[SW] Active notifications:", notifications.length);
        notifications.forEach((n) => {
          console.log("[SW] -", n.tag, "|", n.title);
        });
      })
    );
    return;
  }
});

// ===== PUSH NOTIFICATION (dari server, opsional) =====
self.addEventListener("push", (event) => {
  console.log("[SW] Push received");
  let data = { title: "Menuru", body: "Ada notifikasi baru!" };
  try {
    if (event.data) data = event.data.json();
  } catch (e) {
    console.error("[SW] Push parse error:", e);
  }
  const options = {
    body: data.body,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
    vibrate: [200, 100, 200],
    data: { url: data.url || "/" },
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

// ===== NOTIFICATION CLICK =====
// Handle: cari tab existing → fokus + navigasi. Kalau tidak ada → buka tab baru.
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event.notification.tag, "action:", event.action);
  event.notification.close();

  // Kalau user klik tombol "Tutup", jangan buka apa-apa
  if (event.action === "close") return;

  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Cari tab Menuru yang sudah terbuka
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            // Fokus ke tab itu, lalu navigasi ke URL yang diminta
            if ("navigate" in client) {
              client.navigate(urlToOpen);
            }
            return client.focus();
          }
        }
        // Kalau tidak ada tab yang terbuka, buka tab baru
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// ===== NOTIFICATION CLOSE (cleanup) =====
self.addEventListener("notificationclose", (event) => {
  console.log("[SW] Notification closed by user:", event.notification.tag);
});
