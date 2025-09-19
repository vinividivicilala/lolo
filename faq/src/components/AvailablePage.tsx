import React from "react";

export default function AvailablePage() {
  return (
    <>
      {/* Import font Inter */}
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        body, html, #root {
          margin: 0;
          padding: 0;
          height: 100%;
          background-color: #000;
          font-family: 'Inter', sans-serif;
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "flex-start", // tetap normal di kiri
          backgroundColor: "#000",
          color: "#f1f5f9",
          padding: "60px",
        }}
      >
        {/* Judul */}
        <h1
          style={{
            fontSize: "4rem",
            fontWeight: "700",
            marginBottom: "1.5rem",
            letterSpacing: "-1px",
          }}
        >
          AVAILABLE FOR WORK
        </h1>

        {/* Deskripsi */}
        <p
          style={{
            fontSize: "1.4rem",
            lineHeight: "1.8",
            width: "100%", // biar memanjang penuh ke kanan
            fontWeight: "300",
          }}
        >
          Halo! 👋 Saya adalah individu yang penuh semangat, kreatif, dan selalu
          haus akan pengalaman baru ✨. Saya terbuka untuk{" "}
          <span
            style={{
              backgroundColor: "#3b82f6",
              padding: "2px 6px",
              borderRadius: "6px",
              fontWeight: "600",
              color: "#fff",
            }}
          >
            peluang kerja
          </span>{" "}
          maupun{" "}
          <span
            style={{
              backgroundColor: "#22c55e",
              padding: "2px 6px",
              borderRadius: "6px",
              fontWeight: "600",
              color: "#fff",
            }}
          >
            project kreatif
          </span>{" "}
          yang menantang 🚀. Jika tertarik berkolaborasi, hubungi saya lewat{" "}
          <span
            style={{
              backgroundColor: "#ef4444",
              padding: "2px 6px",
              borderRadius: "6px",
              fontWeight: "600",
              color: "#fff",
            }}
          >
            kontak
          </span>{" "}
          yang tersedia. Mari kita bikin sesuatu yang luar biasa bareng-bareng 🔥
        </p>

        {/* Tombol */}
        <a
          href="/"
          style={{
            marginTop: "2.5rem",
            padding: "12px 24px",
            border: "2px solid #3b82f6",
            borderRadius: "6px",
            color: "#3b82f6",
            textDecoration: "none",
            fontWeight: "bold",
            transition: "all 0.3s ease",
          }}
        >
          ⬅ Back to Home
        </a>
      </div>
    </>
  );
}
