// ===== SERVICE WORKER - MENURU PWA v1.0.2 =====
// v1.0.1: Tambah handler notifikasi Live Chat Agent
// v1.0.2: Fix push notification parse (support JSON + text + FCM)
const CACHE_NAME = "menuru-pwa-v1.0.2";
const RUNTIME_CACHE = "menuru-runtime-v1.0.2";
const IMAGE_CACHE = "menuru-images-v1.0.2";

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
  console.log("[SW] Installing... v1.0.2");
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
  console.log("[SW] Activating... v1.0.2");
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

  if (request.method !== "GET") return;

  if (
    url.hostname.includes("firebase") ||
    url.hostname.includes("googleapis") ||
    url.hostname.includes("gstatic") ||
    url.hostname.includes("firebaseio") ||
    url.hostname.includes("cloudfunctions")
  ) {
    return;
  }

  if (url.protocol === "chrome-extension:") return;

  // IMAGES: Cache-first
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

  // STATIC ASSETS: Stale-while-revalidate
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

  // HTML / NAVIGATION: Network-first
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

  // DEFAULT: Network-first
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
self.addEventListener("message", (event) => {
  const data = event.data || {};

  if (data.type === "SKIP_WAITING") {
    console.log("[SW] Skip waiting, activating new version");
    self.skipWaiting();
    return;
  }

  if (data.type === "CLEAR_CACHE") {
    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name));
    });
    return;
  }

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
      tag,
      renotify: true,
      requireInteraction,
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

  let data = {
    title: "Menuru",
    body: "Ada notifikasi baru!",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
    url: "/",
  };

  if (event.data) {
    // ===== Coba parse sebagai JSON =====
    try {
      const parsed = event.data.json();
      console.log("[SW] Push parsed as JSON:", parsed);
      data = { ...data, ...parsed };

      // Support format FCM: { notification: { title, body }, data: { url } }
      if (parsed.notification) {
        data.title = parsed.notification.title || data.title;
        data.body = parsed.notification.body || data.body;
        data.icon = parsed.notification.icon || data.icon;
        data.badge = parsed.notification.badge || data.badge;
      }
      if (parsed.data && parsed.data.url) {
        data.url = parsed.data.url;
      }
    } catch (jsonError) {
      // ===== JSON gagal, coba sebagai text biasa =====
      try {
        const textData = event.data.text();
        console.log("[SW] Push parsed as text:", textData);
        data.body = textData || data.body;
        data.title = "Menuru";
      } catch (textError) {
        console.error("[SW] Push parse failed (both JSON & text):", textError);
      }
    }
  }

  console.log("[SW] Final push data:", data);

  const options = {
    body: data.body,
    icon: data.icon || "/icons/icon-192x192.png",
    badge: data.badge || "/icons/icon-192x192.png",
    vibrate: [200, 100, 200],
    tag: data.tag || "push-" + Date.now(),
    renotify: true,
    data: {
      url: data.url || "/",
      ...(data.data || {}),
    },
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "Menuru", options)
  );
});

// ===== NOTIFICATION CLICK =====
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event.notification.tag, "action:", event.action);
  event.notification.close();

  if (event.action === "close") return;

  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            if ("navigate" in client) {
              client.navigate(urlToOpen);
            }
            return client.focus();
          }
        }
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
