import React from "react";

export default function AvailablePage() {
  return (
    <>
      {/* Font Space Mono */}
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        body, html, #root {
          margin: 0;
          padding: 0;
          height: 100%;
          background-color: #000;
          font-family: 'Space Mono', monospace;
        }


        .timeline {
  position: relative;
  margin-left: 20px;
  padding-left: 30px;
  border-left: 2px dashed rgba(255,255,255,0.3);
}

.timeline-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 2rem;
  position: relative;
}

.timeline-left {
  flex: 0 0 180px; /* sisi kiri lebih rapi */
  text-align: left;
  color: #fff;
  padding-right: 20px;
}

.timeline-date {
  display: block;
  font-size: 0.9rem;
  color: #94a3b8;
}

.timeline-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-top: 0.3rem;
}

.timeline-right {
  flex: 1;
  color: #e5e5e5;
  font-size: 1rem;
  line-height: 1.6;
}

/* Titik animasi */
.timeline-item::before {
  content: "";
  position: absolute;
  left: -42px;
  top: 8px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: rgba(255,255,255,0.4);
  border: 2px solid rgba(255,255,255,0.8);
}

/* Titik aktif - berkedip */
.timeline-item.active::before {
  background: #3b82f6;
  box-shadow: 0 0 10px #3b82f6;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.3); opacity: 0.6; }
}











        
        .linebox {
          position: relative;
          display: inline-flex;
          align-items: center;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 6px; /* agak kotak */
          background: rgba(255,255,255,0.05);
          padding: 8px 14px;
          font-size: 1rem;
          font-weight: 600;
          color: #fff;
          gap: 8px;
          width: fit-content; /* ngepas konten */
        }
        .hero-btn {
          background: transparent;
          color: #3b82f6;
          font-weight: 700;
          font-size: 1.2rem;
          padding: 8px 14px;  /* lebih kecil, biar nggak panjang */
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          text-decoration: none;
        }
        .hero-btn svg {
          width: 22px;
          height: 22px;
          stroke: currentColor;
        }
        .footer-container {
          background-color: #000;
          padding: 50px 60px;
          color: white;
        }
        .footer-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
        }
        .footer-right {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
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

          {/* Tombol Back to Home dengan linebox pendek */}
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M7 7h10v10" />
              </svg>
            </a>
          </div>
        </div>

   {/* Nama Panjang */}
<div className="linebox" style={{ marginTop: "1.5rem", marginLeft: "60px" }}>
  <span style={{ fontSize: "1.3rem", fontWeight: "700" }}>
    Farid Ardiansyah
  </span>
</div>

{/* Deskripsi */}
<div className="linebox" style={{ marginTop: "1rem", marginLeft: "60px", maxWidth: "700px" }}>
  <p style={{ margin: 0, fontSize: "1rem", fontWeight: "400", color: "#e5e5e5" }}>
    Seorang web developer yang berfokus pada desain minimalis, tipografi,
    serta membangun aplikasi modern berbasis Firebase dan React.
  </p>
</div>


        {/* Timeline Box */}
<div style={{ marginTop: "3rem", paddingLeft: "60px" }}>
  <div className="timeline">
    {/* Kegiatan 1 - Aktif */}
    <div className="timeline-item active">
      <div className="timeline-left">
        <span className="timeline-date">2025-09-19</span>
        <span className="timeline-title">Rilis Website</span>
      </div>
      <div className="timeline-right">
        <p>Peluncuran versi pertama website portfolio dengan desain minimalis dan interaktif.</p>
      </div>
    </div>

    {/* Kegiatan 2 - Nonaktif */}
    <div className="timeline-item">
      <div className="timeline-left">
        <span className="timeline-date">2025-08-10</span>
        <span className="timeline-title">Uji Coba Firebase</span>
      </div>
      <div className="timeline-right">
        <p>Menerapkan autentikasi dan penyimpanan data real-time menggunakan Firebase.</p>
      </div>
    </div>

    {/* Kegiatan 3 - Nonaktif */}
    <div className="timeline-item">
      <div className="timeline-left">
        <span className="timeline-date">2025-07-05</span>
        <span className="timeline-title">Desain UI</span>
      </div>
      <div className="timeline-right">
        <p>Membuat desain UI tipografi-based dan minimalist UI untuk tampilan website.</p>
      </div>
    </div>
  </div>
</div>


        {/* Footer */}
        <div className="footer-container">
          <div className="footer-content">
            {/* Kiri */}
            <div className="footer-left">
              <div className="linebox">
                {/* Icon alert-triangle */}
                <svg xmlns="http://www.w3.org/2000/svg"
                     fill="none"
                     viewBox="0 0 24 24"
                     strokeWidth="2"
                     stroke="currentColor"
                     style={{ width: "20px", height: "20px" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86l-7.3 12.61A1 1 0 004 19h16a1 1 0 00.87-1.5l-7.3-12.61a1 1 0 00-1.74 0z" />
                </svg>
                <span>Website ini masih dikembangkan</span>
              </div>
            </div>

            {/* Kanan */}
            <div className="footer-right">
              <div className="linebox"><span>Kebijakan Privasi</span></div>
              <div className="linebox"><span>Syarat & Ketentuan</span></div>
              <div className="linebox"><span>Berikan Masukan</span></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}




