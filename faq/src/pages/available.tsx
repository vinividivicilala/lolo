import React from "react";

// Komponen halaman
export default function AvailablePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0f172a",
        color: "#f1f5f9",
        fontFamily: "sans-serif",
        textAlign: "center",
        padding: "40px",
      }}
    >
      <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>
        AVAILABLE FOR WORK
      </h1>
      <p style={{ fontSize: "1.2rem", maxWidth: "600px", lineHeight: "1.6" }}>
        Saya terbuka untuk peluang kerja baru 🚀 <br />
        Jika tertarik untuk berkolaborasi, silakan hubungi saya melalui kontak
        yang tersedia.
      </p>
      <a
        href="/"
        style={{
          marginTop: "2rem",
          padding: "12px 20px",
          border: "2px solid #3b82f6",
          borderRadius: "6px",
          color: "#3b82f6",
          textDecoration: "none",
          fontWeight: "bold",
          transition: "all 0.3s ease",
        }}
        onMouseOver={(e) => {
          (e.target as HTMLAnchorElement).style.background = "#3b82f6";
          (e.target as HTMLAnchorElement).style.color = "#fff";
        }}
        onMouseOut={(e) => {
          (e.target as HTMLAnchorElement).style.background = "transparent";
          (e.target as HTMLAnchorElement).style.color = "#3b82f6";
        }}
      >
        ⬅ Back to Home
      </a>
    </div>
  );
}
