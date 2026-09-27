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

  useEffect(() => {
    currentTicketIdRef.current = currentTicketId;
  }, [currentTicketId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!user || !db || !enabled) return;
    if (!("serviceWorker" in navigator) || !("Notification" in window)) return;
    if (Notification.permission !== "granted") {
      console.log("[Notif] Permission belum granted");
      return;
    }

    let unsubscribe: (() => void) | null = null;
    let isMounted = true;

    const setupListener = async () => {
      const { collection, query, where, onSnapshot, orderBy, limit } = await import(
        "firebase/firestore"
      );

      let q;
      if (isAdmin) {
        // Admin: pantau ticket waiting + active
        q = query(
          collection(db, "livechat_tickets"),
          where("status", "in", ["waiting", "active"]),
          orderBy("lastMessageTime", "desc"),
          limit(20)
        );
      } else {
        // User: pantau ticket milik sendiri
        q = query(
          collection(db, "livechat_tickets"),
          where("userId", "==", user.uid),
          orderBy("lastMessageTime", "desc"),
          limit(5)
        );
      }

      unsubscribe = onSnapshot(q, (snapshot: any) => {
        if (!isMounted) return;

        snapshot.docChanges().forEach((change: any) => {
          if (change.type !== "modified" && change.type !== "added") return;

          const ticket = { id: change.doc.id, ...change.doc.data() } as any;

          if (!ticket.lastMessageTime) return;
          if (currentTicketIdRef.current === ticket.id) return;

          const myName = isAdmin ? "Farid Ardiansyah" : user.displayName || user.email || "User";
          if (ticket.lastMessageSender === myName) return;

          const msgTime = ticket.lastMessageTime?.toMillis
            ? ticket.lastMessageTime.toMillis()
            : new Date(ticket.lastMessageTime).getTime();

          // Skip pesan lama (> 30 detik lalu)
          const now = Date.now();
          if (now - msgTime > 30000) return;

          // Skip kalau sudah pernah notif untuk pesan yang sama
          if (lastNotifiedRef.current[ticket.id] === msgTime) return;
          lastNotifiedRef.current[ticket.id] = msgTime;

          // ===== TRIGGER NOTIFIKASI =====
          const senderName = ticket.lastMessageSender || "User";
          const messagePreview = (ticket.lastMessage || "").substring(0, 80);
          const senderPhoto = isAdmin
            ? ticket.userPhoto || ""
            : "/icons/icon-192x192.png";

          const title = isAdmin
            ? `💬 ${ticket.userName} — ${ticket.topic}`
            : `💬 ${senderName}`;

          const body = messagePreview || "Ada pesan baru";
          const url = `/live-chat-agent?ticket=${ticket.id}`;

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
                requireInteraction: false,
                silent: false,
              },
            });
          } else {
            // Fallback: notifikasi langsung dari browser
            try {
              const notif = new Notification(title, {
                body,
                icon: senderPhoto || "/icons/icon-192x192.png",
                tag: `livechat-${ticket.id}`,
              });
              notif.onclick = () => {
                window.focus();
                window.location.href = url;
                notif.close();
              };
            } catch (e) {
              console.warn("[Notif] Fallback gagal:", e);
            }
          }
        });
      });
    };

    setupListener();

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, [user, db, isAdmin, enabled]);
}
