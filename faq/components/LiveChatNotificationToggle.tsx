// components/LiveChatNotificationToggle.tsx
import React, { useState, useEffect } from "react";
import { doc, updateDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { useNotificationPermission } from "../hooks/useNotificationPermission";

const BLUE = "#0D3CFC";
const WHITE = "#FFFFFF";
const FONT_FAMILY = "'Poppins', 'Poppins Fallback', sans-serif";

interface Props {
  user: any;
  db: any;
}

export default function LiveChatNotificationToggle({ user, db }: Props) {
  const { permission, supported, requestPermission } = useNotificationPermission();
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load preferensi dari Firebase (bukan localStorage)
  useEffect(() => {
    if (!user || !db) return;
    let cancelled = false;

    const loadPref = async () => {
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (cancelled || !snap.exists()) return;
        const data = snap.data();
        const firebaseEnabled = data?.liveChatNotifEnabled === true;
        const permissionOk = Notification.permission === "granted";
        setEnabled(firebaseEnabled && permissionOk);
      } catch (e) {
        console.warn("Load notif pref error:", e);
      }
    };
    loadPref();
    return () => { cancelled = true; };
  }, [user, db]);

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

      // Simpan preferensi ke FIREBASE (bukan localStorage)
      await updateDoc(doc(db, "users", user.uid), {
        liveChatNotifEnabled: true,
        liveChatNotifUpdatedAt: serverTimestamp(),
      });

      setEnabled(true);

      // Test notifikasi
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: "SHOW_NOTIFICATION",
          payload: {
            title: "🔔 Notifikasi Live Chat Aktif",
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
          fontSize: "12px",
          color: "#999",
          fontFamily: FONT_FAMILY,
          padding: "8px 12px",
          backgroundColor: "#f5f5f5",
          borderRadius: "8px",
        }}
      >
        Browser tidak mendukung notifikasi
      </div>
    );
  }

  return (
    <button
      onClick={enabled ? handleDisable : handleEnable}
      disabled={loading}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "10px 18px",
        backgroundColor: enabled ? BLUE : WHITE,
        color: enabled ? WHITE : BLUE,
        border: `1.5px solid ${BLUE}`,
        borderRadius: "8px",
        fontSize: "13px",
        fontWeight: 700,
        cursor: loading ? "not-allowed" : "pointer",
        fontFamily: FONT_FAMILY,
        letterSpacing: "0.3px",
        opacity: loading ? 0.6 : 1,
        transition: "all 0.2s ease",
      }}
    >
      <span style={{ fontSize: "16px" }}>{enabled ? "🔔" : "🔕"}</span>
      <span>
        {loading
          ? "Loading..."
          : enabled
          ? "Notifikasi Aktif"
          : "Aktifkan Notifikasi"}
      </span>
    </button>
  );
}
