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
  const [visible, setVisible] = useState(true);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);

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

  // ===== GSAP ANIMASI MASUK (sekali saja, tanpa hover) =====
  useEffect(() => {
    if (!buttonRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        buttonRef.current,
        { opacity: 0, y: -20, scale: 0.94 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "back.out(1.7)", delay: 0.3 }
      );
      if (iconRef.current) {
        gsap.fromTo(
          iconRef.current,
          { rotate: -25, scale: 0.6, opacity: 0 },
          { rotate: 0, scale: 1, opacity: 1, duration: 0.8, ease: "back.out(2)", delay: 0.6 }
        );
      }
    });
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
            title: "Live Chat Agent",
            body: "Notifikasi Live Chat Aktif\nAnda akan menerima notifikasi saat ada pesan baru.",
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

  if (!supported || !visible) return null;

  // Tombol inline dengan BG biru, nyatu sama halaman utama
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT_FAMILY,
      }}
    >
      <button
        ref={buttonRef}
        onClick={enabled ? handleDisable : handleEnable}
        disabled={loading}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          padding: "12px 24px",
          backgroundColor: BLUE,
          color: WHITE,
          border: "none",
          borderRadius: "10px",
          fontSize: "14px",
          fontWeight: 700,
          cursor: loading ? "not-allowed" : "pointer",
          fontFamily: FONT_FAMILY,
          letterSpacing: "0.3px",
          opacity: loading ? 0.7 : 1,
          boxShadow: "0 8px 24px rgba(13,60,252,0.25)",
        }}
      >
        <div ref={iconRef} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          {loading ? (
            <LoadingSpinner size={16} color={WHITE} />
          ) : enabled ? (
            <BellIcon size={18} color={WHITE} />
          ) : (
            <BellOffIcon size={18} color={WHITE} />
          )}
        </div>
        <span style={{ whiteSpace: "nowrap" }}>
          {loading
            ? "Loading..."
            : enabled
            ? "Notifikasi Live Chat Aktif"
            : "Aktifkan Notifikasi Live Chat"}
        </span>
        {!loading && (
          <div ref={arrowRef} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <NorthEastArrow size={16} color={WHITE} />
          </div>
        )}
      </button>
    </div>
  );
}
