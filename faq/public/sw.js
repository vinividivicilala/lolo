// ===== SERVICE WORKER - MENURU PWA v2.1.0 =====
// v2.1.0: Notifikasi tanpa emoticon + title/body format "from [Nama] • [Ticket] • [Pesan]"
const CACHE_NAME = "menuru-pwa-v2.1.0";
const RUNTIME_CACHE = "menuru-runtime-v2.1.0";
const IMAGE_CACHE = "menuru-images-v2.1.0";

const PRECACHE_URLS = [
  "/",
  "/offline.html",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// ===== INSTALL =====
self.addEventListener("install", (event) => {
  console.log("[SW] Installing v2.1.0...");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
      .catch((err) => console.error("[SW] Pre-cache failed:", err))
  );
});

// ===== ACTIVATE =====
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating v2.1.0...");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter(
              (name) =>
                name !== CACHE_NAME &&
                name !== RUNTIME_CACHE &&
                name !== IMAGE_CACHE
            )
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ===== FETCH =====
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET") return;

  if (
    url.hostname.includes("firebase") ||
    url.hostname.includes("googleapis") ||
    url.hostname.includes("gstatic") ||
    url.hostname.includes("firebaseio") ||
    url.hostname.includes("cloudfunctions") ||
    url.hostname.includes("firestore")
  ) {
    return;
  }

  if (url.protocol === "chrome-extension:") return;

  if (
    request.destination === "image" ||
    /\.(png|jpg|jpeg|gif|webp|svg|ico)$/i.test(url.pathname)
  ) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request)
            .then((response) => {
              if (response && response.status === 200) cache.put(request, response.clone());
              return response;
            })
            .catch(() => caches.match("/icons/icon-192x192.png"));
        })
      )
    );
    return;
  }

  if (
    request.destination === "script" ||
    request.destination === "style" ||
    /\.(js|css|woff|woff2|ttf|eot)$/i.test(url.pathname)
  ) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          const fetchPromise = fetch(request)
            .then((res) => {
              if (res && res.status === 200) cache.put(request, res.clone());
              return res;
            })
            .catch(() => cached);
          return cached || fetchPromise;
        })
      )
    );
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match("/offline.html"))
        )
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// ===== MESSAGE =====
self.addEventListener("message", (event) => {
  const data = event.data || {};

  if (data.type === "SKIP_WAITING") {
    self.skipWaiting();
    return;
  }

  if (data.type === "CLEAR_CACHE") {
    caches.keys().then((names) => names.forEach((n) => caches.delete(n)));
    return;
  }

  if (data.type === "SHOW_NOTIFICATION") {
    const payload = data.payload || {};
    const senderName = payload.senderName || "User";
    const ticketName = payload.ticketName || "Live Chat";
    const messageText = payload.body || "Ada pesan baru";

    // Format title: "from [Nama] • [Ticket]"
    const title = `from ${senderName} • ${ticketName}`;

    // Format body: pesan masuk
    const body = messageText;

    const tag = payload.tag || "livechat-" + Date.now();
    const url = payload.url || "/live-chat-agent";
    const icon = payload.icon || "/icons/icon-192x192.png";
    const badge = payload.badge || "/icons/icon-192x192.png";
    const senderPhoto = payload.senderPhoto || icon;

    console.log("[SW] Show notification:", title, "|", body);

    const options = {
      body,
      icon: senderPhoto,
      badge,
      tag,
      renotify: true,
      requireInteraction: true,
      vibrate: [200, 100, 200, 100, 200],
      data: {
        url,
        senderName,
        ticketName,
        timestamp: Date.now(),
      },
      actions: [
        { action: "open", title: "Buka Chat" },
        { action: "close", title: "Tutup" },
      ],
    };

    event.waitUntil(
      self.registration
        .showNotification(title, options)
        .then(() => console.log("[SW] Notification shown OK"))
        .catch((err) => console.error("[SW] showNotification error:", err))
    );
    return;
  }

  if (data.type === "CLOSE_NOTIFICATION") {
    const tagPrefix = data.tagPrefix || "livechat-";
    event.waitUntil(
      self.registration.getNotifications().then((notifications) => {
        notifications.forEach((n) => {
          if (n.tag && n.tag.startsWith(tagPrefix)) n.close();
        });
      })
    );
    return;
  }

  if (data.type === "GET_NOTIFICATIONS") {
    event.waitUntil(
      self.registration.getNotifications().then((notifications) => {
        console.log("[SW] Active notifications:", notifications.length);
        notifications.forEach((n) => console.log("[SW] -", n.tag, n.title));
      })
    );
    return;
  }
});

// ===== NOTIFICATION CLICK =====
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event.notification.tag, "action:", event.action);
  event.notification.close();

  if (event.action === "close") return;

  const urlToOpen = event.notification.data?.url || "/live-chat-agent";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          if ("navigate" in client) client.navigate(urlToOpen);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(urlToOpen);
    })
  );
});

self.addEventListener("notificationclose", (event) => {
  console.log("[SW] Notification closed:", event.notification.tag);
});

// ===== PUSH (fallback, tanpa FCM/VAPID) =====
self.addEventListener("push", (event) => {
  let data = { title: "Menuru", body: "Ada notifikasi baru!", url: "/" };
  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      try {
        data.body = event.data.text();
      } catch (_) {}
    }
  }
  const options = {
    body: data.body,
    icon: data.icon || "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
    vibrate: [200, 100, 200],
    tag: data.tag || "push-" + Date.now(),
    renotify: true,
    data: { url: data.url || "/" },
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});
