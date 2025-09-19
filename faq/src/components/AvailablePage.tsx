import React from "react";

export default function AvailablePage() {
  return (
    <>
      {/* Font Inter */}
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
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
          font-weight: 700;
          font-size: 1.6rem; /* teks lebih besar */
          padding: 14px 28px;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          text-decoration: none; /* hilangin underline */
          transition: color 0.3s ease;
          position: relative;
          z-index: 1;
        }
        .hero-btn:hover {
          color: #60a5fa;
        }
        .hero-btn svg {
          width: 26px;
          height: 26px;
          stroke: currentColor;
          transition: transform 0.3s ease;
        }
        .hero-btn:hover svg {
          transform: translateX(4px); /* panah geser saat hover */
        }
        .footer-link {
          color: white;
          text-decoration: none;
          padding: 8px 16px;
          font-size: 0.9rem;
        }
        .footer-link:hover {
          color: #d1d5db;
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
          position: "relative",
          paddingBottom: "120px", // Memberikan ruang untuk footer
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

        {/* Tombol Hero UI dengan linebox */}
        <div className="linebox" style={{ marginTop: "2.5rem" }}>
          <a href="/" className="hero-btn">
            Back to Home
            {/* Panah serong kanan SVG */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 17L17 7M7 7h10v10"
              />
            </svg>
          </a>
        </div>

        {/* Footer dengan background merah */}
        <div style={{
          position: "fixed",
          bottom: "0",
          left: "0",
          width: "100%",
          backgroundColor: "#dc2626", // Warna merah
          padding: "20px 60px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          color: "white",
          fontSize: "0.9rem",
          gap: "15px"
        }}>
          {/* Tautan dengan linebox */}
          <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
            <div className="linebox">
              <a href="#" className="footer-link">
                Kebijakan Privasi
              </a>
            </div>
            <div className="linebox">
              <a href="#" className="footer-link">
                Syarat & Ketentuan
              </a>
            </div>
            <div className="linebox">
              <a href="#" className="footer-link">
                Berikan Masukan
              </a>
            </div>
          </div>
          
          {/* Teks dengan linebox dan icon */}
          <div className="linebox" style={{ display: "flex", alignItems: "center", padding: "8px 16px" }}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              style={{ marginRight: "8px" }}
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <span>Website ini masih dikembangkan</span>
          </div>
          
          {/* Hak cipta */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <div>@ AVAILABLE FOR WORK</div>
            <div>® 2023 Astro Example. All rights reserved.</div>
          </div>
        </div>
      </div>
    </>
  );
}
