// components/LiveChatNotificationToggle.tsx
import React, { useState, useEffect, useRef } from "react";
import { doc, updateDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { useNotificationPermission } from "../hooks/useNotificationPermission";
import gsap from "gsap";

const BLUE = "#0D3CFC";
const WHITE = "#FFFFFF";
const FONT_FAMILY = "'Poppins', 'Poppins Fallback', sans-serif";

// ===== SVG ICONS =====
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

  const bannerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
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

        const dismissedLocal = sessionStorage.getItem("menuru_notif_banner_dismissed");
        if (dismissedLocal === "true") setDismissed(true);
      } catch (e) {
        console.warn("Load notif pref error:", e);
      }
    };
    loadPref();
    return () => {
      cancelled = true;
    };
  }, [user, db]);

  // ===== GSAP ANIMASI BANNER MASUK =====
  useEffect(() => {
    if (!bannerRef.current) return;
    if (enabled || dismissed) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "back.out(1.7)" } });

      tl.fromTo(
        bannerRef.current,
        { opacity: 0, y: -40, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8 }
      );

      if (titleRef.current) {
        tl.fromTo(
          titleRef.current,
          { opacity: 0, y: -20 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.5"
        );
      }
      if (descRef.current) {
        tl.fromTo(
          descRef.current,
          { opacity: 0, y: -15 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.4"
        );
      }
      if (buttonRef.current) {
        tl.fromTo(
          buttonRef.current,
          { opacity: 0, scale: 0.8 },
          { opacity: 1, scale: 1, duration: 0.6 },
          "-=0.3"
        );
      }
      if (arrowRef.current) {
        tl.fromTo(
          arrowRef.current,
          { opacity: 0, x: -10 },
          { opacity: 1, x: 0, duration: 0.5 },
          "-=0.4"
        );
      }
    }, bannerRef);

    return () => ctx.revert();
  }, [enabled, dismissed]);

  const handleAccept = async () => {
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
            senderName: "Live Chat Agent",
            roomName: "Notifikasi Aktif",
            messageText: "Anda akan menerima notifikasi saat ada pesan baru.",
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

  const handleDismiss = () => {
    sessionStorage.setItem("menuru_notif_banner_dismissed", "true");
    setDismissed(true);
  };

  // Kalau sudah aktif atau di-dismiss, tidak render
  if (enabled || dismissed || !supported) return null;

  // Banner inline — nyatu sama body halaman utama (bukan fixed, bukan overlay)
  return (
    <div
      ref={bannerRef}
      style={{
        width: "100%",
        maxWidth: "1600px",
        margin: "0 auto 30px auto",
        padding: "0 40px",
        fontFamily: FONT_FAMILY,
      }}
    >
      <div
        style={{
          backgroundColor: BLUE,
          borderRadius: "16px",
          padding: "24px 28px",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "24px",
          boxShadow: "0 12px 40px rgba(13,60,252,0.25)",
          border: `1.5px solid rgba(255,255,255,0.15)`,
          position: "relative",
          flexWrap: "wrap",
        }}
      >
        {/* Tombol close (X) */}
        <button
          onClick={handleDismiss}
          style={{
            position: "absolute",
            top: "10px",
            right: "14px",
            background: "transparent",
            border: "none",
            color: WHITE,
            fontSize: "20px",
            cursor: "pointer",
            fontFamily: FONT_FAMILY,
            padding: 0,
            lineHeight: 1,
            opacity: 0.7,
          }}
        >
          ×
        </button>

        {/* Kiri: Judul + Deskripsi */}
        <div style={{ flex: "1 1 400px", minWidth: 0 }}>
          <h3
            ref={titleRef}
            style={{
              fontSize: "20px",
              fontWeight: 800,
              color: WHITE,
              margin: 0,
              marginBottom: "8px",
              letterSpacing: "-0.01em",
              lineHeight: 1.2,
            }}
          >
            Aktifkan Notifikasi Live Chat
          </h3>
          <p
            ref={descRef}
            style={{
              fontSize: "14px",
              fontWeight: 400,
              color: WHITE,
              margin: 0,
              lineHeight: 1.6,
              opacity: 0.95,
            }}
          >
            Dapatkan notifikasi real-time saat ada pesan baru. Format notifikasi:{" "}
            <span style={{ fontWeight: 700 }}>[Nama User atau Agent] — [Nama Ticket Room] — [Nama Pesan]</span>
          </p>
        </div>

        {/* Kanan: Tombol Accept */}
        <button
          ref={buttonRef}
          onClick={handleAccept}
          disabled={loading}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            padding: "12px 24px",
            backgroundColor: WHITE,
            color: BLUE,
            border: `1.5px solid ${WHITE}`,
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: 800,
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: FONT_FAMILY,
            letterSpacing: "0.3px",
            opacity: loading ? 0.7 : 1,
            flexShrink: 0,
          }}
        >
          {loading ? (
            <LoadingSpinner size={16} color={BLUE} />
          ) : (
            <span>{loading ? "Loading..." : "Accept"}</span>
          )}
          {!loading && (
            <div ref={arrowRef} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <NorthEastArrow size={16} color={BLUE} />
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
