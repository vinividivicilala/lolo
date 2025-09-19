import React from "react";

export default function AvailablePage() {
  return (
    <>
      {/* Font: Prioritaskan Geist, fallback ke Inter */}
      <link
        href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Inter:wght@400;600;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        body, html, #root {
          margin: 0;
          padding: 0;
          height: 100%;
          background-color: #000;
          font-family: 'Geist', 'Inter', sans-serif; /* Gunakan Geist dulu */
        }
        .linebox {
          position: relative;
          display: inline-block;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 12px;
          overflow: hidden;
          transition: border 0.3s ease;
        }
        .linebox::before {
          content: "";
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0.05);
          pointer-events: none;
        }
        .linebox:hover {
          border-color: rgba(59,130,246,0.6);
        }
        .hero-btn {
          background: transparent;
          color: #3b82f6;
          font-weight: 700;
          font-size: 1.6rem;
          padding: 14px 28px;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          text-decoration: none;
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
          transform: translateX(4px);
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
          justifyContent: "space-between",
          backgroundColor: "#000",
          color: "#f1f5f9",
        }}
      >
        {/* Konten Utama */}
        <div style={{
          padding: "60px",
          flex: "1",
        }}>
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

        {/* Footer Merah (tinggi lebih kecil) */}
        <div style={{
          backgroundColor: "#dc2626",
          padding: "30px 60px",
          color: "white",
          fontFamily: "'Geist', sans-serif",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          gap: "20px",
        }}>
          {/* Baris Atas: Tautan */}
          <div style={{
            display: "flex",
            gap: "15px",
            flexWrap: "wrap",
            alignSelf: "flex-start",
          }}>
            {["Kebijakan Privasi", "Syarat & Ketentuan", "Berikan Masukan"].map((text) => (
              <div
                key={text}
                className="linebox"
                style={{
                  border: "1px solid rgba(255,255,255,0.3)",
                  borderRadius: "8px",
                }}
              >
                <a
                  href="#"
                  className="footer-link"
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: "500",
                    padding: "8px 16px",
                    color: "white",
                  }}
                >
                  {text}
                </a>
              </div>
            ))}
          </div>

          {/* Baris Tengah: Info Pengembangan (tengah bawah) */}
          <div
            className="linebox"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px 20px",
              backgroundColor: "rgba(0, 0, 0, 0.2)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "12px",
              fontSize: "1rem",
              fontWeight: "500",
              width: "fit-content",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            <span style={{ marginRight: "8px", fontSize: "1.2rem" }}>⚠️</span>
            Website ini masih dikembangkan
          </div>

          {/* Baris Bawah: Tombol + Hak Cipta */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            marginTop: "10px",
          }}>
            {/* Kiri: Kosong */}
            <div></div>

            {/* Kanan: Tombol & Copyright */}
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "6px",
            }}>
              {/* Tombol Available for Work */}
              <button
                style={{
                  backgroundColor: "transparent",
                  border: "2px solid #3b82f6",
                  borderRadius: "30px",
                  padding: "10px 24px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "1.1rem",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  color: "#3b82f6",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              >
                <span
                  style={{
                    width: "10px",
                    height: "10px",
                    backgroundColor: "#3b82f6",
                    borderRadius: "50%",
                  }}
                ></span>
                available for work
              </button>
              {/* Hak Cipta */}
              <div style={{
                fontSize: "0.85rem",
                color: "rgba(255,255,255,0.7)",
                textAlign: "right",
              }}>
                ® 2023 Astro Example. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
