// components/LiveChatNotificationToggle.tsx
import React, { useState, useEffect } from "react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useNotificationPermission } from "@/hooks/useNotificationPermission";

const BLUE = "#0D3CFC";
const WHITE = "#FFFFFF";
const FONT_FAMILY = "'Poppins', 'Poppins Fallback', sans-serif";

export default function LiveChatNotificationToggle({ user, db }: any) {
  const { permission, supported, requestPermission } = useNotificationPermission();
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("menuru_livechat_notif_enabled");
    setEnabled(saved === "true" && permission === "granted");
  }, [permission]);

  const handleEnable = async () => {
    if (!supported) {
      alert("Browser Anda tidak mendukung notifikasi");
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

      localStorage.setItem("menuru_livechat_notif_enabled", "true");
      setEnabled(true);

      if (user && db) {
        try {
          await updateDoc(doc(db, "users", user.uid), {
            liveChatNotifEnabled: true,
            liveChatNotifUpdatedAt: serverTimestamp(),
          });
        } catch (e) {
          console.warn("Save pref error:", e);
        }
      }

      // Test notifikasi
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: "SHOW_NOTIFICATION",
          payload: {
            title: "🔔 Notifikasi Live Chat Aktif",
            body: "Anda akan menerima notifikasi saat ada pesan baru.",
            tag: "test-notif",
            url: "/live-chat-agent",
          },
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    try {
      localStorage.setItem("menuru_livechat_notif_enabled", "false");
      setEnabled(false);

      if (user && db) {
        try {
          await updateDoc(doc(db, "users", user.uid), {
            liveChatNotifEnabled: false,
            liveChatNotifUpdatedAt: serverTimestamp(),
          });
        } catch (e) {
          console.warn("Save pref error:", e);
        }
      }

      // Tutup semua notifikasi live chat
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: "CLOSE_NOTIFICATION",
          tagPrefix: "livechat-",
        });
      }
    } catch (err) {
      console.error(err);
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
        padding: "8px 16px",
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
      }}
    >
      <span>{enabled ? "🔔" : "🔕"}</span>
      <span>{loading ? "Loading..." : enabled ? "Notifikasi Aktif" : "Aktifkan Notifikasi"}</span>
    </button>
  );
}
