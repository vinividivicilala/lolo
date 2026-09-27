// hooks/useLiveChatNotification.ts
import { useEffect, useRef } from "react";

interface Options {
  user: any;
  isAdmin: boolean;
  db: any;
  enabled?: boolean;
  currentTicketId?: string | null;
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

    console.log("[LiveChatNotif] Setup listener for", isAdmin ? "ADMIN" : "USER", user.uid);

    let unsubscribe: (() => void) | null = null;
    let isMounted = true;

    const setupListener = async () => {
      try {
        const { collection, query, where, onSnapshot, orderBy, limit } = await import(
          "firebase/firestore"
        );

        let q;
        if (isAdmin) {
          // Admin: pantau SEMUA ticket status waiting/active
          q = query(
            collection(db, "livechat_tickets"),
            where("status", "in", ["waiting", "active"]),
            orderBy("lastMessageTime", "desc"),
            limit(30)
          );
        } else {
          // User: pantau ticket milik sendiri
          q = query(
            collection(db, "livechat_tickets"),
            where("userId", "==", user.uid),
            orderBy("lastMessageTime", "desc"),
            limit(10)
          );
        }

        console.log("[LiveChatNotif] Query created, waiting for snapshot...");

        unsubscribe = onSnapshot(
          q,
          (snapshot: any) => {
            if (!isMounted) return;

            const changes = snapshot.docChanges();
            console.log("[LiveChatNotif] Snapshot received, changes:", changes.length);

            changes.forEach((change: any) => {
              // Hanya proses modified atau added
              if (change.type !== "modified" && change.type !== "added") return;

              const ticket = { id: change.doc.id, ...change.doc.data() } as any;

              console.log("[LiveChatNotif] Change:", change.type, ticket.id, ticket.lastMessageSender);

              if (!ticket.lastMessageTime) return;

              // Skip kalau user lagi buka ticket ini
              if (currentTicketIdRef.current === ticket.id) {
                console.log("[LiveChatNotif] Skip - user buka ticket ini");
                return;
              }

              // Skip kalau pesan dari diri sendiri
              const myName = isAdmin
                ? "Farid Ardiansyah"
                : user.displayName || user.email || "User";
              if (ticket.lastMessageSender === myName) {
                console.log("[LiveChatNotif] Skip - pesan dari diri sendiri");
                return;
              }

              // Convert timestamp
              let msgTime = 0;
              try {
                msgTime = ticket.lastMessageTime?.toMillis
                  ? ticket.lastMessageTime.toMillis()
                  : new Date(ticket.lastMessageTime).getTime();
              } catch {
                msgTime = Date.now();
              }

              // Skip pesan lama (> 60 detik lalu) — hanya notif pesan baru
              const now = Date.now();
              if (msgTime && now - msgTime > 60000) {
                console.log("[LiveChatNotif] Skip - pesan lama");
                return;
              }

              // Skip kalau sudah pernah notif untuk pesan yang sama
              if (lastNotifiedRef.current[ticket.id] === msgTime) return;
              lastNotifiedRef.current[ticket.id] = msgTime;

              // ===== TRIGGER NOTIFIKASI =====
              const senderName = ticket.lastMessageSender || "User";
              const messagePreview = (ticket.lastMessage || "").substring(0, 80);
              const senderPhoto = isAdmin ? ticket.userPhoto || "" : "";

              const title = isAdmin
                ? `💬 ${ticket.userName} — ${ticket.topic || "Pesan Baru"}`
                : `💬 ${senderName}`;

              const body = messagePreview || "Ada pesan baru untuk Anda";
              const url = `/live-chat-agent?ticket=${ticket.id}`;

              console.log("[LiveChatNotif] SENDING NOTIFICATION:", title, "|", body);

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
                // Fallback: notif langsung browser
                console.log("[LiveChatNotif] Fallback ke new Notification()");
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
            isSetupRef.current = false;
          }
        );
      } catch (err) {
        console.error("[LiveChatNotif] Setup error:", err);
        isSetupRef.current = false;
      }
    };

    setupListener();

    return () => {
      isMounted = false;
      isSetupRef.current = false;
      if (unsubscribe) unsubscribe();
    };
  }, [user, db, isAdmin, enabled]);
}
