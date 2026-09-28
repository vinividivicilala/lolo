// hooks/useLiveChatNotification.ts
import { useEffect, useRef } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

interface Options {
  user: any;
  isAdmin: boolean;
  db: any;
  enabled?: boolean;
  currentTicketId?: string | null;
}

// ===== HELPER: Simpan data notif banner ke Firestore =====
async function saveBannerData(
  db: any,
  userId: string,
  data: { senderName: string; ticketName: string; messageText: string }
) {
  if (!db || !userId) return;
  try {
    await setDoc(
      doc(db, "users", userId),
      {
        notifBannerData: {
          senderName: data.senderName,
          ticketName: data.ticketName,
          messageText: data.messageText,
          updatedAt: new Date().toISOString(),
        },
      },
      { merge: true }
    );
  } catch (e) {
    console.warn("[LiveChatNotif] Save banner data error:", e);
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
  const isSetupRef = useRef(false);

  useEffect(() => {
    currentTicketIdRef.current = currentTicketId;
  }, [currentTicketId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!user || !db || !enabled) return;
    if (!("serviceWorker" in navigator) || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

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

        unsubscribe = onSnapshot(
          q,
          (snapshot: any) => {
            if (!isMounted) return;

            snapshot.docChanges().forEach((change: any) => {
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
              const ticketName = ticket.topic || "Live Chat";
              const messagePreview = (ticket.lastMessage || "").substring(0, 80);
              const senderPhoto = isAdmin ? ticket.userPhoto || "" : "";

              // ===== SIMPAN KE FIRESTORE (banner data) =====
              saveBannerData(db, user.uid, {
                senderName,
                ticketName,
                messageText: messagePreview || "Ada pesan baru untuk Anda",
              });

              const title = isAdmin
                ? `${ticket.userName} — ${ticketName}`
                : senderName;

              const body = messagePreview || "Ada pesan baru untuk Anda";
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
                    ticketName,
                    tag: `livechat-${ticket.id}`,
                    url,
                    requireInteraction: true,
                    silent: false,
                  },
                });
              } else {
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

            const isIndexError =
              error?.message?.includes("requires an index") ||
              error?.code === "failed-precondition";

            if (isIndexError) {
              console.warn(
                "[LiveChatNotif] ⚠️ Composite index belum dibuat. " +
                  "Buka Firebase Console → Firestore → Indexes untuk membuat index untuk koleksi livechat_tickets."
              );
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
    };
  }, [user, db, isAdmin, enabled]);
}
