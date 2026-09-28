// hooks/useLiveChatNotification.ts
import { useEffect, useRef } from "react";

interface Options {
  user: any;
  isAdmin: boolean;
  db: any;
  enabled?: boolean;
  currentTicketId?: string | null;
}

const AGENT_NAME = "Farid Ardiansyah";

// ===== HELPER: Generate nama room ticket otomatis =====
function generateRoomName(ticket: any): string {
  if (ticket?.topic) return ticket.topic;
  if (ticket?.id) return `#TICKET-${ticket.id.slice(-6).toUpperCase()}`;
  return "Live Chat Agent";
}

// ===== IN-APP TOAST (render di kanan layar) =====
function showInAppToast({
  senderName,
  roomName,
  messageText,
  url,
}: {
  senderName: string;
  roomName: string;
  messageText: string;
  url: string;
}) {
  if (typeof document === "undefined") return;

  const BLUE = "#0D3CFC";
  const WHITE = "#FFFFFF";
  const FONT_FAMILY = "'Poppins', 'Poppins Fallback', sans-serif";

  // Container utama untuk semua toast (kalau belum ada, buat)
  let container = document.getElementById("menuru-livechat-toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "menuru-livechat-toast-container";
    Object.assign(container.style, {
      position: "fixed",
      top: "80px",
      right: "24px",
      zIndex: "99997",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      pointerEvents: "none",
      maxWidth: "380px",
      width: "calc(100% - 48px)",
    });
    document.body.appendChild(container);
  }

  // Buat toast element
  const toast = document.createElement("div");
  toast.style.pointerEvents = "auto";
  toast.style.backgroundColor = BLUE;
  toast.style.color = WHITE;
  toast.style.borderRadius = "14px";
  toast.style.padding = "16px 20px";
  toast.style.display = "flex";
  toast.style.flexDirection = "column";
  toast.style.gap = "6px";
  toast.style.boxShadow = "0 16px 48px rgba(13,60,252,0.45)";
  toast.style.border = "1.5px solid rgba(255,255,255,0.18)";
  toast.style.fontFamily = FONT_FAMILY;
  toast.style.cursor = "pointer";
  toast.style.position = "relative";

  // Baris 1: Nama User / Agent
  const line1 = document.createElement("div");
  line1.textContent = senderName;
  Object.assign(line1.style, {
    fontSize: "15px",
    fontWeight: "800",
    color: WHITE,
    letterSpacing: "-0.01em",
    lineHeight: "1.3",
    paddingRight: "24px",
  });

  // Baris 2: Nama Ticket Room
  const line2 = document.createElement("div");
  line2.textContent = roomName;
  Object.assign(line2.style, {
    fontSize: "12px",
    fontWeight: "700",
    color: WHITE,
    letterSpacing: "0.3px",
    textTransform: "uppercase",
    opacity: "0.85",
    lineHeight: "1.3",
  });

  // Baris 3: Nama Pesan
  const line3 = document.createElement("div");
  line3.textContent =
    messageText.length > 90 ? messageText.substring(0, 90) + "..." : messageText;
  Object.assign(line3.style, {
    fontSize: "13px",
    fontWeight: "400",
    color: WHITE,
    lineHeight: "1.5",
    opacity: "0.95",
    wordBreak: "break-word",
  });

  // Tombol close (X) di kanan atas
  const closeBtn = document.createElement("button");
  closeBtn.textContent = "×";
  Object.assign(closeBtn.style, {
    position: "absolute",
    top: "10px",
    right: "12px",
    background: "transparent",
    border: "none",
    color: WHITE,
    fontSize: "18px",
    cursor: "pointer",
    fontFamily: FONT_FAMILY,
    padding: "0",
    lineHeight: "1",
    opacity: "0.7",
  });

  toast.appendChild(line1);
  toast.appendChild(line2);
  toast.appendChild(line3);
  toast.appendChild(closeBtn);
  container.appendChild(toast);

  // Klik toast → buka chat
  toast.addEventListener("click", (e) => {
    if (e.target === closeBtn) return;
    window.focus();
    window.location.href = url;
  });

  // Klik X → tutup
  closeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    animateOut();
  });

  // Animasi masuk dengan GSAP (kalau tersedia), fallback CSS transition
  const animateIn = () => {
    if ((window as any).gsap) {
      (window as any).gsap.fromTo(
        toast,
        { opacity: 0, x: 60, scale: 0.94 },
        { opacity: 1, x: 0, scale: 1, duration: 0.6, ease: "back.out(1.7)" }
      );
    } else {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(60px)";
      requestAnimationFrame(() => {
        toast.style.transition = "all 0.4s cubic-bezier(0.34,1.56,0.64,1)";
        toast.style.opacity = "1";
        toast.style.transform = "translateX(0)";
      });
    }
  };

  const animateOut = () => {
    if ((window as any).gsap) {
      (window as any).gsap.to(toast, {
        opacity: 0,
        x: 60,
        scale: 0.94,
        duration: 0.4,
        ease: "power2.in",
        onComplete: () => {
          toast.remove();
          if (container && container.childNodes.length === 0) {
            container.remove();
          }
        },
      });
    } else {
      toast.style.transition = "all 0.3s ease";
      toast.style.opacity = "0";
      toast.style.transform = "translateX(60px)";
      setTimeout(() => {
        toast.remove();
        if (container && container.childNodes.length === 0) {
          container.remove();
        }
      }, 300);
    }
  };

  animateIn();

  // Auto-dismiss setelah 8 detik
  setTimeout(() => {
    if (toast.parentNode) animateOut();
  }, 8000);
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
    if (!("Notification" in window)) {
      console.log("[LiveChatNotif] Browser tidak support Notification API");
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
          // AGENT: pantau ticket waiting & active dari user
          q = query(
            collection(db, "livechat_tickets"),
            where("status", "in", ["waiting", "active"]),
            orderBy("lastMessageTime", "desc"),
            limit(30)
          );
        } else {
          // USER BIASA: pantau ticket milik sendiri (untuk pesan dari agent)
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

            changes.forEach((change: any) => {
              if (change.type !== "modified" && change.type !== "added") return;

              const ticket = { id: change.doc.id, ...change.doc.data() } as any;
              if (!ticket.lastMessageTime) return;

              // Skip kalau user sedang buka ticket ini
              if (currentTicketIdRef.current === ticket.id) return;

              // Nama diri sendiri
              const myName = isAdmin
                ? AGENT_NAME
                : user.displayName || user.email || "User";

              // Skip pesan dari diri sendiri
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

              // ===== FORMAT NOTIFIKASI 3 BARIS =====
              // Baris 1: Nama User biasa ATAU Nama Agent
              // Baris 2: Nama Ticket Room (otomatis dari topic / ID)
              // Baris 3: Nama Pesan
              const senderName =
                ticket.lastMessageSender || (isAdmin ? "User" : AGENT_NAME);
              const roomName = generateRoomName(ticket);
              const messageText =
                (ticket.lastMessage || "").substring(0, 120) || "Ada pesan baru";
              const url = `/live-chat-agent?ticket=${ticket.id}`;

              console.log("[LiveChatNotif] SENDING:", senderName, "|", roomName, "|", messageText);

              // 1. IN-APP TOAST di kanan layar (PC/laptop & HP)
              showInAppToast({
                senderName,
                roomName,
                messageText,
                url,
              });

              // 2. OS NOTIFICATION lewat Service Worker (kalau tersedia)
              if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({
                  type: "SHOW_NOTIFICATION",
                  payload: {
                    senderName,
                    roomName,
                    messageText,
                    tag: `livechat-${ticket.id}`,
                    url,
                    icon: "/icons/icon-192x192.png",
                    badge: "/icons/icon-192x192.png",
                    requireInteraction: true,
                    silent: false,
                  },
                });
              } else {
                // Fallback: new Notification() kalau SW belum ready
                try {
                  const notif = new Notification(senderName, {
                    body: `${roomName}\n${messageText}`,
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
