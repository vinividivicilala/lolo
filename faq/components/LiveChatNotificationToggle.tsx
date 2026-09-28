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
  const [showBanner, setShowBanner] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const bannerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const acceptBtnRef = useRef<HTMLButtonElement>(null);
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
        const isEnabled = firebaseEnabled && permissionOk;
        setEnabled(isEnabled);

        // Cek apakah banner sudah di-dismiss di session ini
        const dismissed = sessionStorage.getItem("menuru_notif_banner_dismissed");
        if (dismissed === "true") {
          setBannerDismissed(true);
        } else if (!isEnabled) {
          // Tampilkan banner kalau belum aktif
          setTimeout(() => setShowBanner(true), 800);
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

  // ===== GSAP ANIMASI BANNER MASUK =====
  useEffect(() => {
    if (!showBanner || !bannerRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "back.out(1.7)" } });

      if (overlayRef.current) {
        tl.fromTo(
          overlayRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.4, ease: "power2.out" }
        );
      }

      tl.fromTo(
        bannerRef.current,
        { opacity: 0, y: -80, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8 },
        "-=0.2"
      );

      if (titleRef.current) {
        tl.fromTo(
          titleRef.current,
          { opacity: 0, y: -20 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.4"
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

      if (acceptBtnRef.current) {
        tl.fromTo(
          acceptBtnRef.current,
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
  }, [showBanner]);

  // ===== GSAP ANIMASI SAAT TOGGLE BERUBAH =====
  useEffect(() => {
    if (!enabled) return;
    // Kalau baru aktif, tutup banner dengan animasi
    if (bannerRef.current && showBanner) {
      gsap.to(bannerRef.current, {
        opacity: 0,
        y: -80,
        scale: 0.9,
        duration: 0.5,
        ease: "power2.in",
        onComplete: () => setShowBanner(false),
      });
      if (overlayRef.current) {
        gsap.to(overlayRef.current, { opacity: 0, duration: 0.4, delay: 0.1 });
      }
    }
  }, [enabled, showBanner]);

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
      sessionStorage.setItem("menuru_notif_banner_dismissed", "true");

      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: "SHOW_NOTIFICATION",
          payload: {
            title: "from Menuru System",
            body: "Live Chat Agent\nNotifikasi Live Chat Aktif. Anda akan menerima notifikasi saat ada pesan baru.",
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
    if (bannerRef.current) {
      gsap.to(bannerRef.current, {
        opacity: 0,
        y: -80,
        scale: 0.9,
        duration: 0.5,
        ease: "power2.in",
        onComplete: () => setShowBanner(false),
      });
    }
    if (overlayRef.current) {
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.4, delay: 0.1 });
    }
    setBannerDismissed(true);
  };

  const handleEnter = () => {
    if (loading) return;
    if (acceptBtnRef.current) gsap.to(acceptBtnRef.current, { scale: 1.05, duration: 0.25, ease: "power2.out" });
    if (arrowRef.current) gsap.to(arrowRef.current, { x: 4, duration: 0.25, ease: "power2.out" });
  };
  const handleLeave = () => {
    if (loading) return;
    if (acceptBtnRef.current) gsap.to(acceptBtnRef.current, { scale: 1, duration: 0.25, ease: "power2.out" });
    if (arrowRef.current) gsap.to(arrowRef.current, { x: 0, duration: 0.25, ease: "power2.out" });
  };

  // Kalau sudah aktif atau banner sudah di-dismiss, tidak render apa-apa
  if (enabled || bannerDismissed || !showBanner || !supported) return null;

  return (
    <>
      {/* ===== OVERLAY GELAP ===== */}
      <div
        ref={overlayRef}
        onClick={handleDismiss}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          zIndex: 99998,
          opacity: 0,
        }}
      />

      {/* ===== BANNER POPUP DI ATAS TENGAH ===== */}
      <div
        ref={bannerRef}
        style={{
          position: "fixed",
          top: "24px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 99999,
          width: "100%",
          maxWidth: "520px",
          padding: "0 16px",
          fontFamily: FONT_FAMILY,
        }}
      >
        <div
          style={{
            backgroundColor: BLUE,
            borderRadius: "16px",
            padding: "24px 28px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            boxShadow: "0 20px 60px rgba(13,60,252,0.5)",
            border: `1.5px solid ${WHITE}30`,
            position: "relative",
          }}
        >
          {/* Tombol close (X) */}
          <button
            onClick={handleDismiss}
            style={{
              position: "absolute",
              top: "12px",
              right: "14px",
              background: "transparent",
              border: "none",
              color: WHITE,
              fontSize: "22px",
              cursor: "pointer",
              fontFamily: FONT_FAMILY,
              padding: 0,
              lineHeight: 1,
              opacity: 0.75,
            }}
          >
            ×
          </button>

          {/* Judul */}
          <h3
            ref={titleRef}
            style={{
              fontSize: "20px",
              fontWeight: 800,
              color: WHITE,
              margin: 0,
              letterSpacing: "-0.01em",
              lineHeight: 1.2,
            }}
          >
            Aktifkan Notifikasi Live Chat
          </h3>

          {/* Deskripsi */}
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
            Dapatkan notifikasi real-time saat ada pesan baru dari Live Chat Agent. Format notifikasi:
            <br />
            <span style={{ fontWeight: 700 }}>from [Nama User] — Live Chat Agent — [Nama Pesan]</span>
          </p>

          {/* Tombol Accept */}
          <button
            ref={acceptBtnRef}
            onClick={handleAccept}
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
            disabled={loading}
            style={{
              alignSelf: "flex-start",
              display: "inline-flex",
              alignItems: "center",
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
              marginTop: "4px",
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
    </>
  );
}
