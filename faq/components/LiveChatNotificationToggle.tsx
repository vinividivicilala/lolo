// components/LiveChatNotificationToggle.tsx
import React, { useState, useEffect, useRef } from "react";
import { doc, updateDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { useNotificationPermission } from "../hooks/useNotificationPermission";
import gsap from "gsap";

const BLUE = "#0D3CFC";
const WHITE = "#FFFFFF";
const BLACK = "#000000";
const FONT_FAMILY = "'Plus Jakarta Sans'";

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
  const { permission, supported, requestPermission } = useNotificationPermission();
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

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
        const permissionOk = typeof Notification !== "undefined" && Notification.permission === "granted";
        setEnabled(firebaseEnabled && permissionOk);
      } catch (e) {
        console.warn("Load notif pref error:", e);
      }
    };
    loadPref();
    return () => {
      cancelled = true;
    };
  }, [user, db]);

  // ===== GSAP ANIMASI MASUK =====
  useEffect(() => {
    if (!containerRef.current || !buttonRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: -30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
      );
      if (buttonRef.current) {
        gsap.fromTo(
          buttonRef.current,
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)", delay: 0.3 }
        );
      }
      if (iconRef.current) {
        gsap.fromTo(
          iconRef.current,
          { rotate: -25, scale: 0.6, opacity: 0 },
          { rotate: 0, scale: 1, opacity: 1, duration: 0.8, ease: "back.out(2)", delay: 0.5 }
        );
      }
    }, containerRef);
    return () => ctx.revert();
  }, []);

  // ===== GSAP ANIMASI SAAT TOGGLE BERUBAH =====
  useEffect(() => {
    if (!buttonRef.current || !iconRef.current) return;
    gsap.killTweensOf([buttonRef.current, iconRef.current]);
    gsap.fromTo(
      iconRef.current,
      { rotate: -180, scale: 0.5 },
      { rotate: 0, scale: 1, duration: 0.6, ease: "back.out(1.8)" }
    );
    gsap.fromTo(
      buttonRef.current,
      { scale: 0.96 },
      { scale: 1, duration: 0.4, ease: "back.out(2)" }
    );
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

  if (!supported) {
    return (
      <div
        style={{
          width: "100%",
          backgroundColor: WHITE,
          borderRadius: "12px",
          padding: "16px 24px",
          fontFamily: FONT_FAMILY,
          fontSize: "12px",
          color: BLUE,
          textAlign: "center",
          border: `1.5px solid ${BLUE}30`,
        }}
      >
        Browser tidak mendukung notifikasi
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        backgroundColor: WHITE,
        borderRadius: "12px",
        padding: "18px 28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "20px",
        fontFamily: FONT_FAMILY,
        flexWrap: "wrap",
      }}
    >
      {/* ===== JUDUL + DESKRIPSI (kiri) ===== */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: "32px",
            fontWeight: 400,
            color: BLUE,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
        >
          Notifikasi Live Chat
        </div>
        <div
          style={{
            fontSize: "13px",
            fontWeight: 500,
            color: BLUE,
            letterSpacing: "0.01em",
            lineHeight: 1.4,
          }}
        >
          Aktifkan notifikasi agar Anda tidak ketinggalan pesan dari customer atau agent.
        </div>
      </div>

      {/* ===== TOGGLE BUTTON (kanan) ===== */}
      <button
        ref={buttonRef}
        onClick={enabled ? handleDisable : handleEnable}
        disabled={loading}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          padding: "12px 26px",
          backgroundColor: WHITE,
          color: BLUE,
          border: `2px solid ${BLUE}`,
          borderRadius: "10px",
          fontSize: "14px",
          fontWeight: 800,
          cursor: loading ? "not-allowed" : "pointer",
          fontFamily: FONT_FAMILY,
          letterSpacing: "0.3px",
          opacity: loading ? 0.6 : 1,
          flexShrink: 0,
        }}
      >
        <div ref={iconRef} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          {loading ? (
            <LoadingSpinner size={16} color={BLUE} />
          ) : enabled ? (
            <BellIcon size={18} color={BLUE} />
          ) : (
            <BellOffIcon size={18} color={BLUE} />
          )}
        </div>
        <span ref={textRef} style={{ whiteSpace: "nowrap" }}>
          {loading
            ? "Loading..."
            : enabled
            ? "Notifikasi Aktif"
            : "Aktifkan Notifikasi"}
        </span>
        {!loading && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <NorthEastArrow size={16} color={BLUE} />
          </div>
        )}
      </button>
    </div>
  );
}
