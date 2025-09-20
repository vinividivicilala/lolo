import React, { useState } from "react";

export default function AvailablePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

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
        }

        /* Garis putus-putus statis untuk timeline */
        .timeline::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          border-left: 2px dashed rgba(255, 255, 255, 0.3);
        }

        .timeline-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 2.5rem;
          position: relative;
        }

        .timeline-left {
          flex: 0 0 220px;
          text-align: left;
          color: #fff;
          padding-right: 20px;
        }

        .timeline-date {
          display: block;
          font-size: 1.1rem;
          color: #94a3b8;
          font-weight: 700;
          margin-bottom: 5px;
        }

        .timeline-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin-top: 0.3rem;
          margin-bottom: 10px;
        }

        /* Blok warna di bawah title */
        .timeline-tag {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: 700;
          margin-top: 5px;
        }

        .timeline-right {
          flex: 1;
          color: #e5e5e5;
          font-size: 1.1rem;
          line-height: 1.6;
          font-weight: 600;
        }

        /* Container untuk timeline content */
        .timeline-content-box {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          padding: 20px;
          margin-top: 10px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          position: relative;
        }

        /* Garis horizontal yang nyambung dari titik ke kotak */
        .timeline-connector {
          position: absolute;
          left: -30px;
          top: 23px;
          width: 28px;
          height: 2px;
          background: rgba(255, 255, 255, 0.3);
        }

        /* Garis putus-putus dengan animasi untuk item aktif */
        .timeline-item.active .timeline-connector {
          background: transparent;
          border-top: 2px dashed #3b82f6;
          animation: dash-move 1s linear infinite;
        }

        @keyframes dash-move {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 10px 0;
          }
        }

        /* Titik animasi */
        .timeline-item::before {
          content: "";
          position: absolute;
          left: -41px;
          top: 15px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.4);
          border: 2px solid rgba(255, 255, 255, 0.8);
          z-index: 2;
        }

        /* Titik aktif - berkedip */
        .timeline-item.active::before {
          background: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.4);
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
          }
          70% {
            transform: scale(1.1);
            box-shadow: 0 0 0 12px rgba(59, 130, 246, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
          }
        }

        .linebox {
          position: relative;
          display: inline-flex;
          align-items: center;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 6px;
          background: rgba(255,255,255,0.05);
          padding: 8px 14px;
          font-size: 1rem;
          font-weight: 600;
          color: #fff;
          gap: 8px;
          width: fit-content;
        }
        .hero-btn {
          background: transparent;
          color: #3b82f6;
          font-weight: 700;
          font-size: 1.2rem;
          padding: 8px 14px;
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

        .banner-ujicoba {
          position: fixed;
          top: 0;
          left: 50%;
          transform: translateX(-50%) rotateX(5deg);
          background: linear-gradient(135deg, #3b82f6, #06b6d4);
          color: #fff;
          padding: 12px 24px;
          font-size: 1.1rem;
          font-weight: 600;
          border-radius: 12px;
          box-shadow: 0 8px 20px rgba(0,0,0,0.4);
          z-index: 9999;
          display: flex;
          gap: 12px;
          align-items: center;
          animation: floatBanner 3s ease-in-out infinite;
        }

        .banner-ujicoba a {
          color: #fff;
          font-weight: 700;
          text-decoration: underline;
          transition: color 0.3s;
          cursor: pointer;
        }

        .banner-ujicoba a:hover {
          color: #ffdd57;
        }

        @keyframes floatBanner {
          0%, 100% {
            transform: translateX(-50%) translateY(0) rotateX(5deg);
          }
          50% {
            transform: translateX(-50%) translateY(-6px) rotateX(5deg);
          }
        }

        /* Modal styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.9);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 10000;
          padding: 20px;
        }

        .modal-content {
          background: #111;
          border: 2px solid rgba(59, 130, 246, 0.3);
          border-radius: 12px;
          max-width: 800px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          padding: 30px;
          position: relative;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        }

        .modal-close {
          position: absolute;
          top: 15px;
          right: 15px;
          background: transparent;
          border: none;
          color: #fff;
          font-size: 1.5rem;
          cursor: pointer;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background 0.3s;
        }

        .modal-close:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .modal-header {
          text-align: center;
          margin-bottom: 25px;
        }

        .modal-title {
          font-size: 2.2rem;
          font-weight: 700;
          color: #3b82f6;
          margin-bottom: 15px;
        }

        .modal-image {
          width: 100%;
          height: 200px;
          background: linear-gradient(135deg, #1e40af, #3b82f6);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 25px;
          overflow: hidden;
        }

        .modal-image-content {
          font-size: 4rem;
          color: white;
        }

        .modal-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 25px;
          flex-wrap: wrap;
          gap: 15px;
        }

        .modal-date {
          display: flex;
          flex-direction: column;
        }

        .modal-date-label {
          font-size: 0.9rem;
          color: #94a3b8;
          margin-bottom: 5px;
        }

        .modal-date-value {
          font-size: 1.1rem;
          font-weight: 700;
          color: #fff;
        }

        .modal-links {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
          margin-bottom: 25px;
        }

        .modal-link {
          display: block;
          padding: 15px;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 8px;
          color: #3b82f6;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s;
          text-align: center;
        }

        .modal-link:hover {
          background: rgba(59, 130, 246, 0.2);
          border-color: #3b82f6;
          transform: translateY(-2px);
        }

        .modal-description {
          color: #e5e5e5;
          line-height: 1.6;
          margin-bottom: 25px;
          font-size: 1.1rem;
        }

        /* Icon styles */
        .icon-wrapper {
          display: flex;
          gap: 25px;
          margin: 30px 0 40px 60px;
        }

        .icon-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          color: #e5e5e5;
          transition: transform 0.3s, color 0.3s;
        }

        .icon-item:hover {
          transform: translateY(-5px);
          color: #3b82f6;
        }

        .icon-circle {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: rgba(59, 130, 246, 0.1);
          border: 2px solid rgba(59, 130, 246, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
          transition: all 0.3s;
        }

        .icon-item:hover .icon-circle {
          background: rgba(59, 130, 246, 0.2);
          border-color: #3b82f6;
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.7);
        }

        .icon-label {
          font-size: 1rem;
          font-weight: 700;
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

          {/* Banner Uji Coba */}
          <div className="banner-ujicoba">
            <span>🚧 Website ini lagi ujicoba 🚧 </span>
            <a onClick={openModal} style={{ cursor: 'pointer' }}>
              Baca Selengkapnya
            </a>
          </div>  

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

        {/* Icon Notifikasi, Pesan, dan Komunitas - DI ATAS TIMELINE */}
        <div className="icon-wrapper">
          <div className="icon-item">
            <div className="icon-circle">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
            </div>
            <span className="icon-label">Notifikasi</span>
          </div>
          
          <div className="icon-item">
            <div className="icon-circle">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <span className="icon-label">Pesan</span>
          </div>
          
          <div className="icon-item">
            <div className="icon-circle">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <span className="icon-label">Komunitas</span>
          </div>
        </div>

        {/* Timeline Box - Layout Sejajar ke Samping */}
        <div style={{ marginTop: "2rem", paddingLeft: "60px", marginBottom: "3rem" }}>
          <div className="timeline">
            {/* Kegiatan 1 - Aktif */}
            <div className="timeline-item active">
              <div className="timeline-connector"></div>
              <div className="timeline-left">
                <span className="timeline-date">2025-09-19</span>
                <span className="timeline-title">Rilis Website</span>
                <div className="timeline-tag" style={{ backgroundColor: "rgba(59, 130, 246, 0.2)", color: "#3b82f6", border: "1px solid rgba(59, 130, 246, 0.5)" }}>
                  VERSI PRODUKSI
                </div>
              </div>
              <div className="timeline-right">
                <div className="timeline-content-box">
                  <p>Peluncuran versi pertama website portfolio dengan desain minimalis dan interaktif.</p>
                </div>
              </div>
            </div>

            {/* Kegiatan 2 - Nonaktif */}
            <div className="timeline-item">
              <div className="timeline-connector"></div>
              <div className="timeline-left">
                <span className="timeline-date">2025-08-10</span>
                <span className="timeline-title">Uji Coba Firebase</span>
                <div className="timeline-tag" style={{ backgroundColor: "rgba(16, 185, 129, 0.2)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.5)" }}>
                  BACKEND
                </div>
              </div>
              <div className="timeline-right">
                <div className="timeline-content-box">
                  <p>Menerapkan autentikasi dan penyimpanan data real-time menggunakan Firebase.</p>
                </div>
              </div>
            </div>

            {/* Kegiatan 3 - Nonaktif */}
            <div className="timeline-item">
              <div className="timeline-connector"></div>
              <div className="timeline-left">
                <span className="timeline-date">2025-07-05</span>
                <span className="timeline-title">Desain UI</span>
                <div className="timeline-tag" style={{ backgroundColor: "rgba(245, 158, 11, 0.2)", color: "#f59e0b", border: "1px solid rgba(245, 158, 11, 0.5)" }}>
                  FRONTEND
                </div>
              </div>
              <div className="timeline-right">
                <div className="timeline-content-box">
                  <p>Membuat desain UI tipografi-based dan minimalist UI untuk tampilan website.</p>
                </div>
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

        {/* Modal Uji Coba */}
        {isModalOpen && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={closeModal}>×</button>
              
              <div className="modal-header">
                <h2 className="modal-title">🚧 Website Dalam Masa Uji Coba 🚧</h2>
                <div className="linebox">
                  <span>Status: Development</span>
                </div>
              </div>
              
              <div className="modal-image">
                <div className="modal-image-content">🛠️</div>
              </div>
              
              <div className="modal-info">
                <div className="modal-date">
                  <span className="modal-date-label">Tanggal Mulai</span>
                  <span className="modal-date-value">15 September 2025</span>
                </div>
                <div className="modal-date">
                  <span className="modal-date-label">Update Terakhir</span>
                  <span className="modal-date-value">19 September 2025</span>
                </div>
                <div className="modal-date">
                  <span className="modal-date-label">Versi</span>
                  <span className="modal-date-value">v1.0.0-beta</span>
                </div>
              </div>
              
              <div className="modal-description">
                <p>Website ini sedang dalam tahap pengembangan dan uji coba. Beberapa fitur mungkin belum berfungsi dengan sempurna atau masih dalam proses penyempurnaan. Terima kasih atas pengertiannya.</p>
              </div>
              
              <div className="modal-links">
                <a href="https://github.com/example" className="modal-link" target="_blank" rel="noopener noreferrer">
                  Repository GitHub
                </a>
                <a href="https://documentation.example.com" className="modal-link" target="_blank" rel="noopener noreferrer">
                  Dokumentasi
                </a>
                <a href="https://feedback.example.com" className="modal-link" target="_blank" rel="noopener noreferrer">
                  Berikan Masukan
                </a>
                <a href="https://status.example.com" className="modal-link" target="_blank" rel="noopener noreferrer">
                  Status Website
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
