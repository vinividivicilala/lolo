'use client';

import React, { useState } from "react";

export default function HomePage(): React.JSX.Element {
  const [showNotification, setShowNotification] = useState(false);

  const handleChatClick = () => {
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
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

      {/* Chat Button - Style Instagram Messenger */}
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
        {/* Notifikasi - seperti messenger */}
        <div
          style={{
            backgroundColor: "#ffffff",
            padding: "14px 20px",
            borderRadius: "20px",
            fontSize: "14px",
            fontWeight: 400,
            color: "#000",
            fontFamily: "Inter, 'Inter Fallback'",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            opacity: showNotification ? 1 : 0,
            transform: showNotification ? "translateY(0) scale(1)" : "translateY(10px) scale(0.95)",
            transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            position: "relative",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "16px" }}>💬</span>
            Fitur sedang dikembangkan, coba lagi nanti!
          </span>
          {/* Segitiga kecil di bawah notifikasi */}
          <div
            style={{
              position: "absolute",
              bottom: "-8px",
              right: "20px",
              width: 0,
              height: 0,
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
              borderTop: "8px solid #ffffff",
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.05))",
            }}
          />
        </div>

        {/* Tombol Chat - Style Instagram Messenger */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            backgroundColor: "#0095f6",
            padding: "12px 24px",
            borderRadius: "24px",
            cursor: "pointer",
            transition: "all .2s ease",
            boxShadow: "0 4px 12px rgba(0,149,246,0.35)",
            userSelect: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.04)";
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,149,246,0.45)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,149,246,0.35)";
          }}
          onClick={handleChatClick}
        >
          {/* Icon Messenger */}
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ flexShrink: 0 }}
          >
            <path
              d="M12 2C6.477 2 2 6.477 2 12C2 14.477 3.028 16.719 4.667 18.314L4 22L7.845 20.125C9.123 20.675 10.531 21 12 21C17.523 21 22 16.523 22 12C22 6.477 17.523 2 12 2Z"
              fill="#ffffff"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
            <path
              d="M8 10L11 13L16 8"
              stroke="#0095f6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <span
            style={{
              fontSize: "16px",
              fontWeight: 600,
              color: "#ffffff",
              letterSpacing: "-0.01em",
              lineHeight: 1,
              whiteSpace: "nowrap",
            }}
          >
            Chat with Menuru
          </span>
        </div>
      </div>
    </div>
  );
}
