// components/LiveChatNotificationToggle.tsx
import React, { useState, useEffect, useRef } from "react";
import { doc, updateDoc, getDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
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
    <path d="M13.73 21A2 2 0 0 1 10.27 21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18.63 13A17.89 17.89 0 0 1 18 8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6.26 6.26A5.86 5.86 0 0 0 6 8C6 15 3 17 3 17H14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18 8A6 6 0 0 0 9.33 3.62" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
  const { supported, requestPermission } = useNotificationPermission();
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [preview, setPreview] = useState<{
    senderName: string;
    ticketName: string;
    messageText: string;
  } | null>(null);

  const bannerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dismissBtnRef = useRef<HTMLButtonElement>(null);

  // ===== LOAD PREFERENSI DARI FIRESTORE (bukan localStorage) =====
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

        // Cek flag dismiss dari Firestore juga
        if (data?.notifBannerDismissed === true) {
          setDismissed(true);
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

  // ===== LISTENER REALTIME: Notif banner data dari Firestore =====
  useEffect(() => {
    if (!user || !db || !enabled) return;
    let cancelled = false;

    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (cancelled || !snap.exists()) return;
      const data = snap.data();
      if (data?.notifBannerData) {
        setPreview({
          senderName: data.notifBannerData.senderName || "User",
          ticketName: data.notifBannerData.ticketName || "Live Chat",
          messageText: data.notifBannerData.messageText || "",
        });
        if (contentRef.current) {
          gsap.fromTo(
            contentRef.current,
            { opacity: 0, y: -10 },
            { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
          );
        }
      }
    });
    return () => {
      cancelled = true;
      unsub();
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
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", delay: 0.9 }
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
        notifBannerDismissed: false,
      });

      setEnabled(true);

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
      handleDismiss();
    } else {
      handleEnable();
    }
  };

  const handleDismiss = async () => {
    if (bannerRef.current) {
      gsap.to(bannerRef.current, {
        opacity: 0,
        y: -80,
        duration: 0.6,
        ease: "power2.in",
        onComplete: () => setDismissed(true),
      });
    }
    // Simpan flag dismiss ke Firestore
    if (user && db) {
      try {
        await updateDoc(doc(db, "users", user.uid), {
          notifBannerDismissed: true,
        });
      } catch (e) {
        console.warn("Save dismiss flag error:", e);
      }
    }
  };

  const handleEnter = () => {
    if (loading) return;
    if (buttonRef.current) gsap.to(buttonRef.current, { scale: 1.05, duration: 0.25, ease: "power2.out" });
    if (dismissBtnRef.current) gsap.to(dismissBtnRef.current, { scale: 1.03, duration: 0.25, ease: "power2.out" });
  };
  const handleLeave = () => {
    if (loading) return;
    if (buttonRef.current) gsap.to(buttonRef.current, { scale: 1, duration: 0.25, ease: "power2.out" });
    if (dismissBtnRef.current) gsap.to(dismissBtnRef.current, { scale: 1, duration: 0.25, ease: "power2.out" });
  };

  if (!supported || !user || dismissed) return null;

  return (
    <>
      {/* ===== BANNER IN-APP NOTIFIKASI ===== */}
      <div
        ref={bannerRef}
        style={{
          position: "fixed",
          top: "clamp(72px, 12vh, 96px)",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9500,
          width: "calc(100% - 24px)",
          maxWidth: "820px",
          backgroundColor: BLUE,
          color: WHITE,
          borderRadius: "16px",
          padding: "clamp(14px, 3vw, 22px) clamp(16px, 4vw, 26px)",
          boxShadow: "0 16px 48px rgba(13,60,252,0.45)",
          fontFamily: FONT_FAMILY,
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          gap: "clamp(10px, 2.5vw, 18px)",
          opacity: 0,
          flexWrap: "wrap",
        }}
      >
        {/* Icon */}
        <div
          ref={iconRef}
          style={{
            width: "clamp(40px, 10vw, 52px)",
            height: "clamp(40px, 10vw, 52px)",
            borderRadius: "12px",
            backgroundColor: "rgba(255,255,255,0.15)",
            border: `1.5px solid ${WHITE}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {enabled ? (
            <BellIcon size={26} color={WHITE} />
          ) : (
            <BellOffIcon size={26} color={WHITE} />
          )}
        </div>

        {/* Content */}
        <div
          ref={contentRef}
          style={{
            flex: "1 1 320px",
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >
          <div
            style={{
              fontSize: "clamp(15px, 3.5vw, 18px)",
              fontWeight: 800,
              color: WHITE,
              letterSpacing: "-0.01em",
              lineHeight: 1.25,
            }}
          >
            {enabled ? "Notifikasi Live Chat Aktif" : "Aktifkan Notifikasi Live Chat"}
          </div>
          <div
            style={{
              fontSize: "clamp(12px, 2.8vw, 13.5px)",
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
          {enabled && preview && (
            <div
              style={{
                marginTop: "6px",
                padding: "10px 14px",
                backgroundColor: "rgba(255,255,255,0.12)",
                border: `1px solid rgba(255,255,255,0.3)`,
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                flexWrap: "wrap",
                fontSize: "clamp(11px, 2.6vw, 12.5px)",
                color: WHITE,
                lineHeight: 1.4,
              }}
            >
              <span style={{ fontWeight: 700, color: WHITE }}>from</span>
              <span style={{ fontWeight: 800, color: WHITE }}>
                {preview.senderName}
              </span>
              <span style={{ opacity: 0.7 }}>•</span>
              <span style={{ fontWeight: 700, color: WHITE }}>
                {preview.ticketName}
              </span>
              <span style={{ opacity: 0.7 }}>•</span>
              <span
                style={{
                  fontStyle: "italic",
                  color: "rgba(255,255,255,0.95)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "100%",
                  flex: "1 1 auto",
                }}
              >
                {preview.messageText.length > 60
                  ? preview.messageText.substring(0, 60) + "..."
                  : preview.messageText}
              </span>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "8px",
            flexShrink: 0,
            alignItems: "center",
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
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
              padding: "clamp(9px, 2vw, 11px) clamp(16px, 3.5vw, 22px)",
              backgroundColor: WHITE,
              color: BLUE,
              border: `1.5px solid ${WHITE}`,
              borderRadius: "10px",
              fontSize: "clamp(12px, 2.8vw, 13.5px)",
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
              ref={dismissBtnRef}
              onClick={handleDismiss}
              onMouseEnter={handleEnter}
              onMouseLeave={handleLeave}
              style={{
                background: "transparent",
                border: "none",
                color: WHITE,
                fontSize: "clamp(11px, 2.5vw, 12px)",
                fontFamily: FONT_FAMILY,
                cursor: "pointer",
                textDecoration: "underline",
                opacity: 0.85,
                padding: "6px 8px",
                whiteSpace: "nowrap",
              }}
            >
              Nanti saja
            </button>
          )}
        </div>
      </div>
    </>
  );
}
