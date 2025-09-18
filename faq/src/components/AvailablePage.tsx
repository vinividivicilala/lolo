import React from "react";

export default function AvailablePage() {
  return (
    <>
      {/* Import font Geist */}
      <link
        href="https://fonts.googleapis.com/css2?family=Geist:wght@400;600;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        body, html, #root {
          margin: 0;
          padding: 0;
          height: 100%;
          background-color: #000;
          font-family: 'Geist', sans-serif;
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start", // posisikan ke atas
          alignItems: "stretch", // biar deskripsi full lebar
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
            textAlign: "right", // judul rata kanan
          }}
        >
          AVAILABLE FOR WORK
        </h1>

        {/* Deskripsi */}
        <p
          style={{
            fontSize: "1.4rem",
            lineHeight: "1.8",
            maxWidth: "100%", // ambil penuh
            textAlign: "right", // teks rata kanan
            marginBottom: "2rem",
          }}
        >
          Saya terbuka untuk{" "}
          <span
            style={{
              backgroundColor: "#3b82f6",
              padding: "2px 6px",
              borderRadius: "4px",
              fontWeight: "600",
              color: "#fff",
            }}
          >
            peluang kerja
          </span>{" "}
          baru 🚀 <br />
          Jika tertarik untuk berkolaborasi, silakan hubungi saya melalui{" "}
          <span
            style={{
              backgroundColor: "#ef4444",
              padding: "2px 6px",
              borderRadius: "4px",
              fontWeight: "600",
              color: "#fff",
            }}
          >
            kontak
          </span>{" "}
          yang tersedia. Saya juga menyukai{" "}
          <span
            style={{
              backgroundColor: "#22c55e",
              padding: "2px 6px",
              borderRadius: "4px",
              fontWeight: "600",
              color: "#fff",
            }}
          >
            project kreatif
          </span>{" "}
          yang menantang.
        </p>

        {/* Tombol */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <a
            href="/"
            style={{
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
      </div>
    </>
  );
}
