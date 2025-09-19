import React from "react";

export default function AvailablePage() {
  return (
    <>
      {/* Font Inter */}
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
        .linebox {
          position: relative;
          display: inline-block;
          border: 1px solid rgba(255,255,255,0.2); /* putih pudar */
          border-radius: 12px;
          overflow: hidden;
          transition: border 0.3s ease;
        }
        .linebox::before {
          content: "";
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0.05); /* lapisan putih transparan */
          pointer-events: none;
        }
        .linebox:hover {
          border-color: rgba(59,130,246,0.6); /* biru saat hover */
        }
        .hero-btn {
          background: transparent;
          color: #3b82f6;
          font-weight: 600;
          font-size: 1rem;
          padding: 12px 24px;
          border: none;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          z-index: 1;
          position: relative;
        }
        .hero-btn svg {
          width: 20px;
          height: 20px;
          stroke: currentColor;
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "flex-start",
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
            width: "100%",
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

        {/* Tombol Hero UI + linebox + panah SVG */}
        <div className="linebox" style={{ marginTop: "2.5rem" }}>
          <a href="/" className="hero-btn">
            ⬅ Back to Home
            {/* Panah serong kanan SVG */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M7 7h10v10" />
            </svg>
          </a>
        </div>
      </div>
    </>
  );
}
