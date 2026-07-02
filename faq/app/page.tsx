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

      {/* Tombol Chat with Menuru + Notifikasi */}
      <div
        style={{
          position: "absolute",
          top: "40px",
          right: "40px",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "12px",
        }}
      >
        {/* Notifikasi - bergulir ke bawah */}
        <div
          style={{
            backgroundColor: "#c5e800",
            padding: "12px 20px",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: 400,
            color: "#000",
            fontFamily: "Inter, 'Inter Fallback'",
            boxShadow: "0 4px 12px rgba(197,232,0,.3)",
            opacity: showNotification ? 1 : 0,
            transform: showNotification ? "translateY(0)" : "translateY(-20px)",
            transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          Fitur sedang dikembangkan, coba lagi nanti!
        </div>

        {/* Tombol Chat */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            backgroundColor: "#c5e800",
            padding: "12px 20px",
            borderRadius: "999px",
            cursor: "pointer",
            transition: "all .25s ease",
            boxShadow: "0 4px 12px rgba(197,232,0,.3)",
            userSelect: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
            e.currentTarget.style.boxShadow =
              "0 8px 24px rgba(197,232,0,.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow =
              "0 4px 12px rgba(197,232,0,.3)";
          }}
          onClick={handleChatClick}
        >
          <span
            style={{
              fontSize: "30px",
              fontWeight: 500,
              color: "#000",
              letterSpacing: "-0.02em",
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
