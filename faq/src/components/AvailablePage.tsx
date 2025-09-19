import React from "react";

export default function AvailablePage() {
  return (
    <>
      {/* Font Geist */}
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
        .linebox {
          position: relative;
          display: inline-block;
          border: 2px solid rgba(0,0,0,0.4);
          border-radius: 12px;
          overflow: hidden;
          padding: 14px 24px;
          background: rgba(0,0,0,0.25);
        }
        /* hilangin hover effect */
        .linebox::before {
          content: none;
        }
        .footer-link {
          color: white;
          text-decoration: none;
          font-size: 1.2rem;
          font-weight: 600;
        }
        .footer-text {
          color: white;
          font-size: 1.4rem;
          font-weight: 600;
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#000",
          color: "#f1f5f9",
        }}
      >
        {/* Konten Utama (punya kamu tetap ada) */}
        <div style={{ padding: "60px", flex: "1" }}>
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

          {/* Tombol Hero tetap ada */}
          <div className="linebox" style={{ marginTop: "2.5rem" }}>
            <a href="/" className="hero-btn">
              Back to Home
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
        </div>

        {/* Footer dengan background merah tinggi */}
        <div
          style={{
            backgroundColor: "#dc2626",
            padding: "80px 60px", // lebih tinggi
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "30px",
          }}
        >
          {/* Kiri: teks Website ini masih dikembangkan */}
          <div className="linebox">
            <span className="footer-text">Website ini masih dikembangkan</span>
          </div>

          {/* Kanan: link */}
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
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
        </div>
      </div>
    </>
  );
}
