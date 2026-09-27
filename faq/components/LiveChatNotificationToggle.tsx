// components/LiveChatNotificationToggle.tsx
import React, { useState, useEffect } from "react";
import { doc, updateDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { useNotificationPermission } from "../hooks/useNotificationPermission";

const BLUE = "#0D3CFC";
const WHITE = "#FFFFFF";
const FONT_FAMILY = "'Poppins', 'Poppins Fallback', sans-serif";
const FIREBASE_PROJECT_ID = "wawa44-58d1e";

// ===== INDEX URLS =====
const USER_INDEX_URL = `https://console.firebase.google.com/v1/r/project/${FIREBASE_PROJECT_ID}/firestore/indexes?create_composite=ClVwcm9qZWN0cy93YXdhNDQtNThkMWUvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL2xpdmVjaGF0X3RpY2tldHMvaW5kZXhlcy9fEAEaCgoGdXNlcklkEAEaEwoPbGFzdE1lc3NhZ2VUaW1lEAIaDAoIX19uYW1lX18QAg`;

const ADMIN_INDEX_URL = `https://console.firebase.google.com/v1/r/project/${FIREBASE_PROJECT_ID}/firestore/indexes?create_composite=ClVwcm9qZWN0cy93YXdhNDQtNThkMWUvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL2xpdmVjaGF0X3RpY2tldHMvaW5kZXhlcy9fEAEaCgoGc3RhdHVzEAEaEwoPbGFzdE1lc3NhZ2VUaW1lEAIaDAoIX19uYW1lX18QAg`;

interface Props {
  user: any;
  db: any;
}

export default function LiveChatNotificationToggle({ user, db }: Props) {
  const { permission, supported, requestPermission } = useNotificationPermission();
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showIndexHelp, setShowIndexHelp] = useState(false);

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
        const permissionOk = Notification.permission === "granted";
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

      // Test notification
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

  const handleCreateIndex = (role: "user" | "admin") => {
    const url = role === "admin" ? ADMIN_INDEX_URL : USER_INDEX_URL;
    window.open(url, "_blank", "noopener,noreferrer");
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
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
      {/* ===== MAIN TOGGLE BUTTON ===== */}
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

      {/* ===== HELP: BUAT INDEX FIREBASE ===== */}
      <button
        onClick={() => setShowIndexHelp(!showIndexHelp)}
        style={{
          background: "transparent",
          border: "none",
          color: "#666",
          fontSize: "11px",
          fontFamily: FONT_FAMILY,
          cursor: "pointer",
          textDecoration: "underline",
          padding: 0,
        }}
      >
        {showIndexHelp ? "Tutup" : "🔧 Notifikasi tidak jalan? Buat index Firebase"}
      </button>

      {showIndexHelp && (
        <div
          style={{
            backgroundColor: "#FFF8E1",
            border: "1.5px solid #FFB300",
            borderRadius: "10px",
            padding: "14px 16px",
            maxWidth: "340px",
            fontFamily: FONT_FAMILY,
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#E65100" }}>
            ⚠️ Butuh Firebase Composite Index
          </div>
          <div style={{ fontSize: "12px", color: "#333", lineHeight: 1.5 }}>
            Supaya notifikasi Live Chat berfungsi, Anda perlu membuat 2 index di Firebase Console.
            Klik tombol di bawah → halaman auto-create akan terbuka → klik <strong>Create Index</strong> → tunggu 1-3 menit.
          </div>

          <button
            onClick={() => handleCreateIndex("user")}
            style={{
              padding: "8px 14px",
              backgroundColor: BLUE,
              color: WHITE,
              border: "none",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: FONT_FAMILY,
              textAlign: "left",
            }}
          >
            1️⃣ Buat Index USER (userId + lastMessageTime)
          </button>

          <button
            onClick={() => handleCreateIndex("admin")}
            style={{
              padding: "8px 14px",
              backgroundColor: "#E65100",
              color: WHITE,
              border: "none",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: FONT_FAMILY,
              textAlign: "left",
            }}
          >
            2️⃣ Buat Index ADMIN (status + lastMessageTime)
          </button>

          <div style={{ fontSize: "11px", color: "#666", fontStyle: "italic" }}>
            💡 Cukup buat sekali. Setelah "Enabled", notifikasi otomatis berfungsi.
          </div>
        </div>
      )}
    </div>
  );
}
