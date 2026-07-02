'use client';

import React, { useState } from "react";

export default function HomePage(): React.JSX.Element {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleChatClick = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        margin: 0,
        padding: 0,
        position: "relative",
        fontFamily: "Inter, 'Inter Fallback'"
      }}
    >
      {/* Logo */}
      <div
        style={{
          position: "absolute",
          top: "40px",
          left: "40px",
          zIndex: 10,
          fontSize: "56px",
          fontWeight: 400,
          color: "#000",
          letterSpacing: "-0.02em",
          lineHeight: 1,
        }}
      >
        Menuru
      </div>

      {/* Chat Button & Chat Box */}
      <div
        style={{
          position: "absolute",
          bottom: "40px",
          right: "40px",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "12px",
        }}
      >
        {/* Chat Box - Muncul saat diklik */}
        {isChatOpen && (
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              padding: "24px",
              width: "320px",
              boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
              animation: "slideUp 0.3s ease",
              border: "1px solid #f0f0f0",
            }}
          >
            <div
              style={{
                fontSize: "16px",
                fontWeight: 500,
                color: "#000",
                marginBottom: "12px",
              }}
            >
              💬 Chat dengan Menuru
            </div>
            <div
              style={{
                fontSize: "14px",
                fontWeight: 400,
                color: "#666",
                lineHeight: 1.6,
                marginBottom: "16px",
              }}
            >
              Fitur ini sedang dalam pengembangan. Silahkan coba lagi nanti.
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              style={{
                backgroundColor: "#c5e800",
                border: "none",
                padding: "10px 20px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 500,
                color: "#000",
                cursor: "pointer",
                width: "100%",
                transition: "all .2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#b0d000";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#c5e800";
              }}
            >
              Tutup
            </button>
          </div>
        )}

        {/* Tombol Chat - Style Instagram Messenger */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            backgroundColor: isChatOpen ? "#e0e0e0" : "#0095f6",
            padding: "12px 24px",
            borderRadius: "24px",
            cursor: "pointer",
            transition: "all .3s ease",
            boxShadow: isChatOpen ? "none" : "0 4px 12px rgba(0,149,246,0.35)",
            userSelect: "none",
          }}
          onMouseEnter={(e) => {
            if (!isChatOpen) {
              e.currentTarget.style.transform = "scale(1.04)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,149,246,0.45)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isChatOpen) {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,149,246,0.35)";
            }
          }}
          onClick={handleChatClick}
        >
          <span
            style={{
              fontSize: "16px",
              fontWeight: 600,
              color: isChatOpen ? "#000" : "#ffffff",
              letterSpacing: "-0.01em",
              lineHeight: 1,
              whiteSpace: "nowrap",
            }}
          >
            {isChatOpen ? "Tutup Chat" : "Chat with Menuru"}
          </span>
        </div>
      </div>

      {/* Animasi CSS */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
