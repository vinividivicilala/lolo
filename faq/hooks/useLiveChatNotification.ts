// hooks/useLiveChatNotification.ts
import { useEffect, useRef } from "react";

interface Options {
  user: any;
  isAdmin: boolean;
  db: any;
  enabled?: boolean;
  currentTicketId?: string | null;
}

// ===== FIREBASE PROJECT ID (dari firebaseConfig) =====
const FIREBASE_PROJECT_ID = "wawa44-58d1e";

// ===== HELPER: Buat URL auto-create index untuk USER =====
function getUserIndexUrl(): string {
  // Index: livechat_tickets (userId ASC, lastMessageTime DESC)
  const encoded = "ClVwcm9qZWN0cy93YXdhNDQtNThkMWUvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL2xpdmVjaGF0X3RpY2tldHMvaW5kZXhlcy9fEAEaCgoGdXNlcklkEAEaEwoPbGFzdE1lc3NhZ2VUaW1lEAIaDAoIX19uYW1lX18QAg";
  return `https://console.firebase.google.com/v1/r/project/${FIREBASE_PROJECT_ID}/firestore/indexes?create_composite=${encoded}`;
}

// ===== HELPER: Buat URL auto-create index untuk ADMIN =====
function getAdminIndexUrl(): string {
  // Index: livechat_tickets (status ASC, lastMessageTime DESC)
  const encoded = "ClVwcm9qZWN0cy93YXdhNDQtNThkMWUvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL2xpdmVjaGF0X3RpY2tldHMvaW5kZXhlcy9fEAEaCgoGc3RhdHVzEAEaEwoPbGFzdE1lc3NhZ2VUaW1lEAIaDAoIX19uYW1lX18QAg";
  return `https://console.firebase.google.com/v1/r/project/${FIREBASE_PROJECT_ID}/firestore/indexes?create_composite=${encoded}`;
}

// ===== HELPER: Print link besar di Console =====
function printIndexBanner(role: "USER" | "ADMIN") {
  const url = role === "ADMIN" ? getAdminIndexUrl() : getUserIndexUrl();

  const banner = `
╔══════════════════════════════════════════════════════════════════╗
║  ⚠️  COMPOSITE INDEX BELUM DIBUAT                                 ║
║  Notifikasi Live Chat TIDAK akan berfungsi sampai index dibuat.   ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  👉 KLIK LINK INI untuk auto-create index (${role}):              ║
║                                                                    ║
║  ${url}
║                                                                    ║
║  ⏱️  Setelah klik, tunggu 1-3 menit sampai status "Enabled".      ║
║  🔄 Hook akan otomatis retry setiap 10 detik.                     ║
║                                                                    ║
╚══════════════════════════════════════════════════════════════════╝
  `;

  console.log(`%c${banner}`, "color: #FF6B00; font-weight: bold; font-size: 11px;");
}

// ===== HELPER: Auto-open index URL (hanya 1x per session) =====
function tryAutoOpenIndex(role: "USER" | "ADMIN") {
  if (typeof window === "undefined") return;

  const key = `menuru_index_opened_${role}`;
  const alreadyOpened = sessionStorage.getItem(key);
  if (alreadyOpened === "true") return;

  const url = role === "ADMIN" ? getAdminIndexUrl() : getUserIndexUrl();

  // Hanya auto-open kalau user setuju (pakai konfirmasi)
  const shouldOpen = window.confirm(
    `⚠️ Notifikasi Live Chat butuh Firebase Composite Index.\n\n` +
    `Klik OK untuk membuka halaman auto-create index (${role}).\n` +
    `Klik Cancel kalau mau copy link manual dari Console.`
  );

  if (shouldOpen) {
    window.open(url, "_blank", "noopener,noreferrer");
    sessionStorage.setItem(key, "true");
    console.log(`[LiveChatNotif] ✅ Index URL dibuka di tab baru untuk ${role}`);
  } else {
    console.log(`[LiveChatNotif] ⏸️ User memilih manual. Link:\n${url}`);
  }
}

export function useLiveChatNotification({
  user,
  isAdmin,
  db,
  enabled = true,
  currentTicketId = null,
}: Options) {
  const currentTicketIdRef = useRef<string | null>(currentTicketId);
  const lastNotifiedRef = useRef<{ [ticketId: string]: number }>({});
  const retryCountRef = useRef(0);
  const isSetupRef = useRef(false);

  useEffect(() => {
    currentTicketIdRef.current = currentTicketId;
  }, [currentTicketId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!user || !db || !enabled) return;
    if (!("serviceWorker" in navigator) || !("Notification" in window)) {
      console.log("[LiveChatNotif] Browser tidak support");
      return;
    }
    if (Notification.permission !== "granted") {
      console.log("[LiveChatNotif] Permission belum granted");
      return;
    }

    // Prevent double-setup
    if (isSetupRef.current) return;
    isSetupRef.current = true;

    console.log("[LiveChatNotif] Setup for", isAdmin ? "ADMIN" : "USER", user.uid);

    let unsubscribe: (() => void) | null = null;
    let isMounted = true;
    let retryTimeout: NodeJS.Timeout | null = null;

    const setupListener = async () => {
      try {
        const { collection, query, where, onSnapshot, orderBy, limit } = await import(
          "firebase/firestore"
        );

        let q;
        if (isAdmin) {
          // ADMIN: pantau ticket waiting & active
          q = query(
            collection(db, "livechat_tickets"),
            where("status", "in", ["waiting", "active"]),
            orderBy("lastMessageTime", "desc"),
            limit(30)
          );
        } else {
          // USER: pantau ticket milik sendiri
          q = query(
            collection(db, "livechat_tickets"),
            where("userId", "==", user.uid),
            orderBy("lastMessageTime", "desc"),
            limit(10)
          );
        }

        console.log("[LiveChatNotif] Query created, attaching listener...");

        unsubscribe = onSnapshot(
          q,
          (snapshot: any) => {
            if (!isMounted) return;
            retryCountRef.current = 0; // reset retry count kalau sukses

            const changes = snapshot.docChanges();
            if (changes.length > 0) {
              console.log("[LiveChatNotif] Snapshot changes:", changes.length);
            }

            changes.forEach((change: any) => {
              if (change.type !== "modified" && change.type !== "added") return;

              const ticket = { id: change.doc.id, ...change.doc.data() } as any;
              if (!ticket.lastMessageTime) return;

              // Skip kalau user lagi buka ticket ini
              if (currentTicketIdRef.current === ticket.id) return;

              // Skip pesan dari diri sendiri
              const myName = isAdmin
                ? "Farid Ardiansyah"
                : user.displayName || user.email || "User";
              if (ticket.lastMessageSender === myName) return;

              let msgTime = 0;
              try {
                msgTime = ticket.lastMessageTime?.toMillis
                  ? ticket.lastMessageTime.toMillis()
                  : new Date(ticket.lastMessageTime).getTime();
              } catch {
                msgTime = Date.now();
              }

              const now = Date.now();
              if (msgTime && now - msgTime > 60000) return;

              if (lastNotifiedRef.current[ticket.id] === msgTime) return;
              lastNotifiedRef.current[ticket.id] = msgTime;

              const senderName = ticket.lastMessageSender || "User";
              const messagePreview = (ticket.lastMessage || "").substring(0, 80);
              const senderPhoto = isAdmin ? ticket.userPhoto || "" : "";

              const title = isAdmin
                ? `💬 ${ticket.userName} — ${ticket.topic || "Pesan Baru"}`
                : `💬 ${senderName}`;

              const body = messagePreview || "Ada pesan baru untuk Anda";
              const url = `/live-chat-agent?ticket=${ticket.id}`;

              console.log("[LiveChatNotif] 🔔 SENDING:", title, "|", body);

              if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({
                  type: "SHOW_NOTIFICATION",
                  payload: {
                    title,
                    body,
                    icon: "/icons/icon-192x192.png",
                    badge: "/icons/icon-192x192.png",
                    senderPhoto,
                    senderName,
                    tag: `livechat-${ticket.id}`,
                    url,
                    requireInteraction: true,
                    silent: false,
                  },
                });
              } else {
                // Fallback: new Notification() kalau SW controller belum ready
                console.log("[LiveChatNotif] No SW controller, fallback ke new Notification()");
                try {
                  const notif = new Notification(title, {
                    body,
                    icon: senderPhoto || "/icons/icon-192x192.png",
                    tag: `livechat-${ticket.id}`,
                    requireInteraction: true,
                  });
                  notif.onclick = () => {
                    window.focus();
                    window.location.href = url;
                    notif.close();
                  };
                } catch (e) {
                  console.warn("[LiveChatNotif] Fallback gagal:", e);
                }
              }
            });
          },
          (error: any) => {
            console.error("[LiveChatNotif] Snapshot error:", error);

            // ===== DETEKSI ERROR INDEX =====
            const isIndexError =
              error?.message?.includes("requires an index") ||
              error?.code === "failed-precondition";

            if (isIndexError) {
              // 1. Print banner besar di Console dengan link
              printIndexBanner(isAdmin ? "ADMIN" : "USER");

              // 2. Auto-open tab Firebase Console (hanya 1x per session)
              tryAutoOpenIndex(isAdmin ? "ADMIN" : "USER");

              // 3. Auto-retry setiap 10 detik sampai index siap
              retryCountRef.current++;
              const retryIn = 10000; // 10 detik

              console.log(
                `[LiveChatNotif] ⏳ Auto-retry #${retryCountRef.current} dalam ${retryIn / 1000}s...`
              );

              if (retryTimeout) clearTimeout(retryTimeout);
              retryTimeout = setTimeout(() => {
                if (!isMounted) return;
                console.log("[LiveChatNotif] 🔄 Retrying query...");
                if (unsubscribe) unsubscribe();
                isSetupRef.current = false; // reset supaya bisa re-setup
                setupListener();
              }, retryIn);
            }
          }
        );
      } catch (err) {
        console.error("[LiveChatNotif] Setup error:", err);
      }
    };

    setupListener();

    return () => {
      isMounted = false;
      isSetupRef.current = false;
      if (unsubscribe) unsubscribe();
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [user, db, isAdmin, enabled]);
}
