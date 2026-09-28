// components/LiveChatNotificationToggle.tsx
import React, { useState, useEffect, useRef } from "react";
import { doc, updateDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { useNotificationPermission } from "../hooks/useNotificationPermission";
import gsap from "gsap";

const BLUE = "#0D3CFC";
const WHITE = "#FFFFFF";
const FONT_FAMILY = "'Poppins', 'Poppins Fallback', sans-serif";

// ===== SVG ICONS =====
const BellIcon = ({ size = 18, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M18 8A6 6 0 0 0 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.73 21A2 2 0 0 1 10.27 21"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const BellOffIcon = ({ size = 18, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M13.73 21A2 2 0 0 1 10.27 21"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18.63 13A17.89 17.89 0 0 1 18 8"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6.26 6.26A5.86 5.86 0 0 0 6 8C6 15 3 17 3 17H14"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18 8A6 6 0 0 0 9.33 3.62"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M1 1L23 23" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const NorthEastArrow = ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M7 17L17 7M17 7H8M17 7V16"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const LoadingSpinner = ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="3" strokeOpacity="0.25" />
    <path d="M22 12A10 10 0 0 0 12 2" stroke={color} strokeWidth="3" strokeLinecap="round" />
  </svg>
);

interface Props {
  user: any;
  db: any;
}

export default function LiveChatNotificationToggle({ user, db }: Props) {
  const { permission, supported, requestPermission } = useNotificationPermission();
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [lastMessagePreview, setLastMessagePreview] = useState<{
    senderName: string;
    ticketName: string;
    messageText: string;
  } | null>(null);

  const bannerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Load preferensi dari Firebase
  useEffect(() => {
    if (!user || !db) return;
    let cancelled = false;

    const loadPref = async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (cancelled || !snap.exists()) return;
        const data = snap.data();
        const firebaseEnabled = data?.liveChatNotifEnabled === true;
        const permissionOk =
          typeof Notification !== "undefined" && Notification.permission === "granted";
        setEnabled(firebaseEnabled && permissionOk);

        // Cek apakah sudah pernah dismiss banner
        if (typeof window !== "undefined") {
          const dismissedFlag = localStorage.getItem("menuru_notif_banner_dismissed");
          if (dismissedFlag === "true") setDismissed(true);
        }
      } catch (e) {
        console.warn("Load notif pref error:", e);
      }
    };
    loadPref();
    return () => {
      cancelled = true;
    };
  }, [user, db]);

  // ===== LISTENER: Update banner preview dengan pesan terbaru =====
  useEffect(() => {
    if (!user || !db || !enabled) return;
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    // Listen ke BroadcastChannel jika ada (untuk update pesan terbaru di banner)
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("menuru_livechat_notif");
      bc.onmessage = (event) => {
        const data = event.data || {};
        if (data.type === "NEW_MESSAGE") {
          setLastMessagePreview({
            senderName: data.senderName || "User",
            ticketName: data.ticketName || "Live Chat",
            messageText: data.messageText || "",
          });
          if (contentRef.current) {
            gsap.fromTo(
              contentRef.current,
              { opacity: 0, y: -10 },
              { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
            );
          }
        }
      };
    } catch {
      // BroadcastChannel tidak didukung, abaikan
    }

    return () => {
      if (bc) bc.close();
    };
  }, [user, db, enabled]);

  // ===== GSAP ANIMASI MASUK BANNER =====
  useEffect(() => {
    if (dismissed) return;
    if (!bannerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        bannerRef.current,
        { opacity: 0, y: -80, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: "back.out(1.6)", delay: 0.4 }
      );
      if (iconRef.current) {
        gsap.fromTo(
          iconRef.current,
          { rotate: -25, scale: 0.5, opacity: 0 },
          { rotate: 0, scale: 1, opacity: 1, duration: 0.9, ease: "back.out(2)", delay: 0.7 }
        );
      }
      if (buttonRef.current) {
        gsap.fromTo(
          buttonRef.current,
          { opacity: 0, x: 20 },
          { opacity: 1, x: 0, duration: 0.7, ease: "power3.out", delay: 0.9 }
        );
      }
    }, bannerRef);
    return () => ctx.revert();
  }, [dismissed]);

  // ===== GSAP ANIMASI SAAT TOGGLE BERUBAH =====
  useEffect(() => {
    if (!buttonRef.current || !iconRef.current) return;
    gsap.killTweensOf([buttonRef.current, iconRef.current]);
    gsap.fromTo(
      iconRef.current,
      { rotate: -180, scale: 0.5 },
      { rotate: 0, scale: 1, duration: 0.6, ease: "back.out(1.8)" }
    );
    gsap.fromTo(buttonRef.current, { scale: 0.96 }, { scale: 1, duration: 0.4, ease: "back.out(2)" });
  }, [enabled]);

  const handleEnable = async () => {
    if (!supported) {
      alert("Browser Anda tidak mendukung notifikasi");
      return;
    }
    if (!user || !db) {
      alert("Silakan login dulu");
      return;
    }

    setLoading(true);
    try {
      const result = await requestPermission();
      if (result !== "granted") {
        alert("Izin notifikasi ditolak. Buka pengaturan browser untuk mengaktifkan.");
        setLoading(false);
        return;
      }

      await updateDoc(doc(db, "users", user.uid), {
        liveChatNotifEnabled: true,
        liveChatNotifUpdatedAt: serverTimestamp(),
      });

      setEnabled(true);

      if (typeof window !== "undefined") {
        localStorage.setItem("menuru_livechat_notif_enabled", "true");
        localStorage.removeItem("menuru_notif_banner_dismissed");
      }

      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: "SHOW_NOTIFICATION",
          payload: {
            title: "Notifikasi Live Chat Aktif",
            body: "Anda akan menerima notifikasi saat ada pesan baru.",
            tag: "test-notif-" + Date.now(),
            url: "/live-chat-agent",
            requireInteraction: false,
          },
        });
      }

      // Auto-hide banner setelah 2 detik
      setTimeout(() => {
        if (bannerRef.current) {
          gsap.to(bannerRef.current, {
            opacity: 0,
            y: -80,
            duration: 0.6,
            ease: "power2.in",
            onComplete: () => setDismissed(true),
          });
        }
      }, 2000);
    } catch (err) {
      console.error("Enable error:", err);
      alert("Gagal mengaktifkan notifikasi");
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    try {
      if (user && db) {
        await updateDoc(doc(db, "users", user.uid), {
          liveChatNotifEnabled: false,
          liveChatNotifUpdatedAt: serverTimestamp(),
        });
      }
      setEnabled(false);

      if (typeof window !== "undefined") {
        localStorage.setItem("menuru_livechat_notif_enabled", "false");
      }

      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: "CLOSE_NOTIFICATION",
          tagPrefix: "livechat-",
        });
      }
    } catch (err) {
      console.error("Disable error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = () => {
    if (enabled) {
      // Kalau sudah aktif, tombol menjadi "Tutup"
      if (bannerRef.current) {
        gsap.to(bannerRef.current, {
          opacity: 0,
          y: -80,
          duration: 0.6,
          ease: "power2.in",
          onComplete: () => setDismissed(true),
        });
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("menuru_notif_banner_dismissed", "true");
      }
    } else {
      handleEnable();
    }
  };

  const handleDismiss = () => {
    if (bannerRef.current) {
      gsap.to(bannerRef.current, {
        opacity: 0,
        y: -80,
        duration: 0.5,
        ease: "power2.in",
        onComplete: () => setDismissed(true),
      });
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("menuru_notif_banner_dismissed", "true");
    }
  };

  const handleEnter = () => {
    if (loading) return;
    if (buttonRef.current) gsap.to(buttonRef.current, { scale: 1.05, duration: 0.25, ease: "power2.out" });
  };
  const handleLeave = () => {
    if (loading) return;
    if (buttonRef.current) gsap.to(buttonRef.current, { scale: 1, duration: 0.25, ease: "power2.out" });
  };

  // Jangan render kalau: tidak support, user belum login, atau sudah dismissed
  if (!supported || !user || dismissed) return null;

  return (
    <div
      ref={bannerRef}
      style={{
        position: "fixed",
        top: "90px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9500,
        width: "calc(100% - 48px)",
        maxWidth: "820px",
        backgroundColor: BLUE,
        color: WHITE,
        borderRadius: "16px",
        padding: "20px 24px",
        boxShadow: "0 16px 48px rgba(13,60,252,0.45)",
        fontFamily: FONT_FAMILY,
        display: "flex",
        alignItems: "flex-start",
        gap: "16px",
        opacity: 0,
      }}
    >
      {/* Icon */}
      <div
        ref={iconRef}
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "12px",
          backgroundColor: "rgba(255,255,255,0.15)",
          border: `1.5px solid ${WHITE}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {enabled ? <BellIcon size={24} color={WHITE} /> : <BellOffIcon size={24} color={WHITE} />}
      </div>

      {/* Content */}
      <div ref={contentRef} style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
        <div
          style={{
            fontSize: "17px",
            fontWeight: 800,
            color: WHITE,
            letterSpacing: "-0.01em",
            lineHeight: 1.2,
          }}
        >
          {enabled ? "Notifikasi Live Chat Aktif" : "Aktifkan Notifikasi Live Chat"}
        </div>
        <div
          style={{
            fontSize: "13px",
            color: "rgba(255,255,255,0.92)",
            lineHeight: 1.5,
            fontWeight: 500,
          }}
        >
          {enabled
            ? "Anda akan menerima notifikasi real-time saat ada pesan baru masuk dari agent atau user."
            : "Dapatkan notifikasi real-time saat ada pesan baru masuk dari agent atau user di Live Chat."}
        </div>

        {/* Preview pesan terbaru (kalau ada) */}
        {enabled && lastMessagePreview && (
          <div
            style={{
              marginTop: "6px",
              padding: "10px 14px",
              backgroundColor: "rgba(255,255,255,0.12)",
              border: `1px solid rgba(255,255,255,0.3)`,
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
              fontSize: "12px",
              color: WHITE,
            }}
          >
            <span style={{ fontWeight: 700, color: WHITE }}>from</span>
            <span style={{ fontWeight: 800, color: WHITE }}>{lastMessagePreview.senderName}</span>
            <span style={{ opacity: 0.7 }}>•</span>
            <span style={{ fontWeight: 700, color: WHITE }}>{lastMessagePreview.ticketName}</span>
            <span style={{ opacity: 0.7 }}>•</span>
            <span
              style={{
                fontStyle: "italic",
                color: "rgba(255,255,255,0.95)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "100%",
              }}
            >
              {lastMessagePreview.messageText.length > 60
                ? lastMessagePreview.messageText.substring(0, 60) + "..."
                : lastMessagePreview.messageText}
            </span>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0 }}>
        <button
          ref={buttonRef}
          onClick={handleAccept}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          disabled={loading}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            padding: "10px 20px",
            backgroundColor: WHITE,
            color: BLUE,
            border: `1.5px solid ${WHITE}`,
            borderRadius: "10px",
            fontSize: "13px",
            fontWeight: 800,
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: FONT_FAMILY,
            letterSpacing: "0.3px",
            opacity: loading ? 0.7 : 1,
            whiteSpace: "nowrap",
          }}
        >
          {loading ? (
            <LoadingSpinner size={14} color={BLUE} />
          ) : (
            <span>{enabled ? "Tutup" : "Accept"}</span>
          )}
          {!loading && <NorthEastArrow size={14} color={BLUE} />}
        </button>

        {!enabled && (
          <button
            onClick={handleDismiss}
            style={{
              background: "transparent",
              border: "none",
              color: WHITE,
              fontSize: "11px",
              fontFamily: FONT_FAMILY,
              cursor: "pointer",
              textDecoration: "underline",
              opacity: 0.8,
              padding: 0,
            }}
          >
            Nanti saja
          </button>
        )}
      </div>
    </div>
  );
}
