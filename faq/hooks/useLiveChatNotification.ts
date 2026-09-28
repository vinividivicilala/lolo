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

    if (isSetupRef.current) return;
    isSetupRef.current = true;

    console.log("[LiveChatNotif] Setup for", isAdmin ? "ADMIN" : "USER", user.uid);

    let unsubscribe: (() => void) | null = null;
    let isMounted = true;

    const setupListener = async () => {
      try {
        const { collection, query, where, onSnapshot, orderBy, limit } = await import(
          "firebase/firestore"
        );

        let q;
        if (isAdmin) {
          q = query(
            collection(db, "livechat_tickets"),
            where("status", "in", ["waiting", "active"]),
            orderBy("lastMessageTime", "desc"),
            limit(30)
          );
        } else {
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

            const changes = snapshot.docChanges();
            if (changes.length > 0) {
              console.log("[LiveChatNotif] Snapshot changes:", changes.length);
            }

            changes.forEach((change: any) => {
              if (change.type !== "modified" && change.type !== "added") return;

              const ticket = { id: change.doc.id, ...change.doc.data() } as any;
              if (!ticket.lastMessageTime) return;

              if (currentTicketIdRef.current === ticket.id) return;

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

              // ===== FORMAT NOTIFIKASI BARU =====
              // from [Nama User] — [Nama Room Live Chat Agent] — [Nama Pesan]
              const senderName = ticket.lastMessageSender || "User";
              const roomName = "Live Chat Agent";
              const messagePreview = (ticket.lastMessage || "").substring(0, 80) || "Ada pesan baru";

              const title = `from ${senderName}`;
              const body = `${roomName}\n${messagePreview}`;
              const url = `/live-chat-agent?ticket=${ticket.id}`;

              console.log("[LiveChatNotif] SENDING:", title, "|", body);

              if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({
                  type: "SHOW_NOTIFICATION",
                  payload: {
                    title,
                    body,
                    icon: "/icons/icon-192x192.png",
                    badge: "/icons/icon-192x192.png",
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
                    icon: "/icons/icon-192x192.png",
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
    };
  }, [user, db, isAdmin, enabled]);
}
