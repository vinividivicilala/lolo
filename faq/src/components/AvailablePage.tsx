import React from "react";

export default function AvailablePage() {
  return (
    <>
      {/* Import font modern */}
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        body, html, #root {
          margin: 0;
          padding: 0;
          height: 100%;
          background-color: #000;
          font-family: 'Poppins', sans-serif;
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "flex-end", // rata kanan
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
            textAlign: "right",
          }}
        >
          AVAILABLE FOR WORK
        </h1>

        {/* Deskripsi */}
        <p
          style={{
            fontSize: "1.4rem",
            lineHeight: "1.8",
            maxWidth: "700px",
            textAlign: "right",
            fontWeight: "300",
          }}
        >
          Halo! 👋 Saya adalah individu yang penuh semangat, kreatif, dan selalu
          haus akan pengalaman baru ✨. Saya terbuka untuk
          <span
            style={{
              backgroundColor: "#3b82f6",
              padding: "2px 6px",
              borderRadius: "6px",
              fontWeight: "600",
              color: "#fff",
              margin: "0 6px",
            }}
          >
            peluang kerja
          </span>
          maupun
          <span
            style={{
              backgroundColor: "#22c55e",
              padding: "2px 6px",
              borderRadius: "6px",
              fontWeight: "600",
              color: "#fff",
              margin: "0 6px",
            }}
          >
            project kreatif
          </span>
          yang menantang 🚀. Jika tertarik berkolaborasi, hubungi saya lewat
          <span
            style={{
              backgroundColor: "#ef4444",
              padding: "2px 6px",
              borderRadius: "6px",
              fontWeight: "600",
              color: "#fff",
              marginLeft: "6px",
            }}
          >
            kontak
          </span>
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
