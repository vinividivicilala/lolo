import React, { useState, useRef, useEffect } from "react";

export default function AvailablePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const aboutRef = useRef(null);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const toggleAbout = () => {
    setIsAboutOpen(!isAboutOpen);
  };

  useEffect(() => {
    if (isAboutOpen && aboutRef.current) {
      aboutRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [isAboutOpen]);

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
          color: #fff;
        }

        /* Blok warna di bawah title */
        .timeline-tag {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: 700;
          margin-top: 5px;
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.3);
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
          border-top: 2px dashed #fff;
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
          background: #fff;
          box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.4);
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
          }
          70% {
            transform: scale(1.1);
            box-shadow: 0 0 0 12px rgba(255, 255, 255, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
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
          transition: all 0.3s ease;
        }
        
        /* Warna cerah untuk linebox */
        .linebox.primary {
          border: 1px solid rgba(74, 144, 226, 0.5);
          background: rgba(74, 144, 226, 0.15);
          box-shadow: 0 0 15px rgba(74, 144, 226, 0.3);
        }
        
        .linebox.secondary {
          border: 1px solid rgba(159, 122, 234, 0.5);
          background: rgba(159, 122, 234, 0.15);
          box-shadow: 0 0 15px rgba(159, 122, 234, 0.3);
        }
        
        .linebox.accent {
          border: 1px solid rgba(236, 72, 153, 0.5);
          background: rgba(236, 72, 153, 0.15);
          box-shadow: 0 0 15px rgba(236, 72, 153, 0.3);
        }
        
        .linebox.success {
          border: 1px solid rgba(16, 185, 129, 0.5);
          background: rgba(16, 185, 129, 0.15);
          box-shadow: 0 0 15px rgba(16, 185, 129, 0.3);
        }
        
        .linebox.warning {
          border: 1px solid rgba(245, 158, 11, 0.5);
          background: rgba(245, 158, 11, 0.15);
          box-shadow: 0 0 15px rgba(245, 158, 11, 0.3);
        }

        .hero-btn {
          background: transparent;
          color: #fff;
          font-weight: 700;
          font-size: 1.2rem;
          padding: 8px 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          text-decoration: none;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 6px;
          transition: all 0.3s ease;
        }
        
        .hero-btn.primary {
          border: 1px solid rgba(74, 144, 226, 0.5);
          background: rgba(74, 144, 226, 0.15);
        }
        
        .hero-btn:hover {
          background: rgba(255,255,255,0.1);
          transform: translateY(-2px);
        }
        
        .hero-btn.primary:hover {
          background: rgba(74, 144, 226, 0.25);
          box-shadow: 0 0 15px rgba(74, 144, 226, 0.4);
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
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
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
          border: 1px solid rgba(255,255,255,0.2);
        }

        .banner-ujicoba a {
          color: #fff;
          font-weight: 700;
          text-decoration: underline;
          transition: color 0.3s;
          cursor: pointer;
        }

        .banner-ujicoba a:hover {
          color: #e5e5e5;
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
          border: 2px solid rgba(255, 255, 255, 0.2);
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
          color: #fff;
          margin-bottom: 15px;
        }

        .modal-image {
          width: 100%;
          height: 200px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 25px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.1);
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
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: #fff;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s;
          text-align: center;
        }

        .modal-link:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: #fff;
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
          flex-wrap: wrap;
        }

        .icon-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          color: #e5e5e5;
          transition: transform 0.3s, color 0.3s;
          min-width: 80px;
          cursor: pointer;
        }

        .icon-item:hover {
          transform: translateY(-5px);
          color: #fff;
        }

        .icon-circle {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
          transition: all 0.3s;
        }

        .icon-item:hover .icon-circle {
          background: rgba(255, 255, 255, 0.1);
          border-color: #fff;
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
        }

        .icon-label {
          font-size: 1rem;
          font-weight: 700;
          text-align: center;
          color: #fff;
        }

        /* Gelar sarjana */
        .degree-container {
          display: flex;
          align-items: center;
          margin-top: 15px;
          margin-left: 60px;
          gap: 10px;
        }

        .degree-icon {
          width: 24px;
          height: 24px;
          color: #fff;
        }

        .degree-text {
          font-size: 1rem;
          color: #94a3b8;
          font-weight: 600;
        }

        .degree-highlight {
          color: #fff;
          font-weight: 700;
        }

        /* Highlight text dalam paragraf */
        .highlight {
          background: rgba(255, 255, 255, 0.1);
          padding: 2px 6px;
          border-radius: 6px;
          font-weight: 600;
          color: #fff;
        }
        
        /* About Section Styles */
        .about-section {
          margin: 60px;
          padding: 40px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.5s ease;
          opacity: ${isAboutOpen ? 1 : 0};
          transform: ${isAboutOpen ? 'translateY(0)' : 'translateY(20px)'};
          display: ${isAboutOpen ? 'block' : 'none'};
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }
        
        .about-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }
        
        .about-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #fff;
          margin: 0;
        }
        
        .about-close {
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
        
        .about-close:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .about-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
        }
        
        .about-left {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .about-right {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .about-box {
          padding: 20px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .about-box-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 15px;
        }
        
        .about-box-content {
          color: #e5e5e5;
          line-height: 1.6;
        }
        
        .skill-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 10px;
        }
        
        .skill-item {
          padding: 6px 12px;
          border-radius: 20px;
          background: rgba(74, 144, 226, 0.2);
          border: 1px solid rgba(74, 144, 226, 0.5);
          color: #fff;
          font-size: 0.9rem;
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
        {/* Konten Utama */}
        <div style={{ padding: "60px", flex: "1" }}>
          <h1
            style={{
              fontSize: "4rem",
              fontWeight: "700",
              marginBottom: "1.5rem",
              letterSpacing: "-1px",
              color: "#fff",
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
              color: "#e5e5e5",
            }}
          >
            Halo! 👋 Saya adalah individu yang penuh semangat, kreatif, dan selalu
            haus akan pengalaman baru ✨. Saya terbuka untuk{" "}
            <span className="highlight">
              peluang kerja
            </span>{" "}
            maupun{" "}
            <span className="highlight">
              project kreatif
            </span>{" "}
            yang menantang 🚀. Jika tertarik berkolaborasi, hubungi saya lewat{" "}
            <span className="highlight">
              kontak
            </span>{" "}
            yang tersedia. Mari kita bikin sesuatu yang luar biasa bareng-bareng 🔥
          </p>

          {/* Tombol Back to Home dengan linebox pendek */}
          <div className="linebox primary" style={{ marginTop: "2.5rem" }}>
            <a href="/" className="hero-btn primary">
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
        <div className="linebox secondary" style={{ marginTop: "1.5rem", marginLeft: "60px" }}>
          <span style={{ fontSize: "1.3rem", fontWeight: "700", color: "#fff" }}>
            Farid Ardiansyah
          </span>
        </div>

        {/* Deskripsi */}
        <div className="linebox accent" style={{ marginTop: "1rem", marginLeft: "60px", maxWidth: "700px" }}>
          <p style={{ margin: 0, fontSize: "1rem", fontWeight: "400", color: "#e5e5e5" }}>
            Seorang web developer yang berfokus pada desain minimalis, tipografi,
            serta membangun aplikasi modern berbasis Firebase dan React.
          </p>
        </div>

        {/* Gelar Sarjana */}
        <div className="degree-container">
          <svg className="degree-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 14l9-5-9-5-9 5 9 5z"></path>
            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path>
            <path d="M12 14v6"></path>
            <path d="M12 8.5V14"></path>
          </svg>
          <span className="degree-text">
            Bergelar <span className="degree-highlight">Sarjana Komputer</span> dari Universitas Teknologi Digital
          </span>
        </div>

        {/* Icon Notifikasi, Pesan, Komunitas, Meeting, Project, Postingan, Tentang */}
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

          <div className="icon-item">
            <div className="icon-circle">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="16" rx="2" ry="2"></rect>
                <line x1="8" y1="10" x2="16" y2="10"></line>
                <line x1="8" y1="14" x2="14" y2="14"></line>
                <line x1="8" y1="18" x2="12" y2="18"></line>
                <line x1="3" y1="8" x2="21" y2="8"></line>
              </svg>
            </div>
            <span className="icon-label">Postingan</span>
          </div>

          <div className="icon-item" onClick={toggleAbout}>
            <div className="icon-circle">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 00-3-3.87"></path>
                <path d="M16 3.13a4 4 0 010 7.75"></path>
              </svg>
            </div>
            <span className="icon-label">Tentang Saya</span>
          </div>

          <div className="icon-item">
            <div className="icon-circle">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
            </div>
            <span className="icon-label">Meeting</span>
          </div>

          <div className="icon-item">
            <div className="icon-circle">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6"></polyline>
                <polyline points="8 6 2 12 8 18"></polyline>
              </svg>
            </div>
            <span className="icon-label">Daftar Project</span>
          </div>
        </div>

        {/* About Section */}
        <div ref={aboutRef} className="about-section">
          <div className="about-header">
            <h2 className="about-title">Tentang Saya</h2>
            <button className="about-close" onClick={toggleAbout}>×</button>
          </div>
          
          <div className="about-content">
            <div className="about-left">
              <div className="about-box">
                <h3 className="about-box-title">Profil</h3>
                <p className="about-box-content">
                  Saya adalah seorang Web Developer dengan passion dalam menciptakan pengalaman digital yang menarik dan fungsional. 
                  Dengan latar belakang pendidikan di bidang Ilmu Komputer, saya memiliki fondasi yang kuat dalam pengembangan perangkat lunak.
                </p>
              </div>
              
              <div className="about-box">
                <h3 className="about-box-title">Pendidikan</h3>
                <p className="about-box-content">
                  <strong>Sarjana Komputer</strong><br/>
                  Universitas Teknologi Digital<br/>
                  Lulus dengan predikat Cum Laude
                </p>
              </div>
            </div>
            
            <div className="about-right">
              <div className="about-box">
                <h3 className="about-box-title">Keahlian</h3>
                <div className="skill-list">
                  <span className="skill-item">React</span>
                  <span className="skill-item">JavaScript</span>
                  <span className="skill-item">Firebase</span>
                  <span className="skill-item">HTML/CSS</span>
                  <span className="skill-item">UI/UX Design</span>
                  <span className="skill-item">Responsive Design</span>
                </div>
              </div>
              
              <div className="about-box">
                <h3 className="about-box-title">Pengalaman</h3>
                <p className="about-box-content">
                  <strong>Frontend Developer</strong> - Perusahaan Teknologi XYZ (2022-Sekarang)<br/>
                  <strong>Web Developer Intern</strong> - Startup ABC (2021-2022)<br/>
                  <strong>Freelance Web Designer</strong> (2020-2021)
                </p>
              </div>
            </div>
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
                <div className="timeline-tag">
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
                <div className="timeline-tag">
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
                <div className="timeline-tag">
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
              <div className="linebox warning">
                {/* Icon alert-triangle */}
                <svg xmlns="http://www.w3.org/2000/svg"
                     fill="none"
                     viewBox="0 0 24 24"
                     strokeWidth="2"
                     stroke="currentColor"
                     width="20"
                     height="20">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span style={{ fontSize: "1rem", fontWeight: "600", color: "#fff" }}>
                  Status: Available for Work
                </span>
              </div>
            </div>

            {/* Kanan */}
            <div className="footer-right">
              <div className="linebox success">
                <svg xmlns="http://www.w3.org/2000/svg"
                     fill="none"
                     viewBox="0 0 24 24"
                     strokeWidth="2"
                     stroke="currentColor"
                     width="20"
                     height="20">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span style={{ fontSize: "1rem", fontWeight: "600", color: "#fff" }}>
                  Email
                </span>
              </div>

              <div className="linebox accent">
                <svg xmlns="http://www.w3.org/2000/svg"
                     fill="none"
                     viewBox="0 0 24 24"
                     strokeWidth="2"
                     stroke="currentColor"
                     width="20"
                     height="20">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span style={{ fontSize: "1rem", fontWeight: "600", color: "#fff" }}>
                  Komunitas
                </span>
              </div>

              <div className="linebox primary">
                <svg xmlns="http://www.w3.org/2000/svg"
                     fill="none"
                     viewBox="0 0 24 24"
                     strokeWidth="2"
                     stroke="currentColor"
                     width="20"
                     height="20">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span style={{ fontSize: "1rem", fontWeight: "600", color: "#fff" }}>
                  Linktree
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>
            
            <div className="modal-header">
              <h2 className="modal-title">Website dalam Uji Coba</h2>
            </div>
            
            <div className="modal-image">
              <div className="modal-image-content">🚧</div>
            </div>
            
            <div className="modal-info">
              <div className="modal-date">
                <span className="modal-date-label">Dimulai</span>
                <span className="modal-date-value">19 September 2025</span>
              </div>
              
              <div className="modal-date">
                <span className="modal-date-label">Estimasi Selesai</span>
                <span className="modal-date-value">30 September 2025</span>
              </div>
            </div>
            
            <div className="modal-links">
              <a href="#" className="modal-link">Lihat Progress Development</a>
              <a href="#" className="modal-link">Berikan Feedback</a>
              <a href="#" className="modal-link">Lihat Portfolio Lainnya</a>
              <a href="#" className="modal-link">Hubungi Saya</a>
            </div>
            
            <div className="modal-description">
              <p>
                Website ini sedang dalam tahap pengembangan dan uji coba. Beberapa fitur mungkin belum berfungsi dengan sempurna.
                Saya terus melakukan perbaikan dan penambahan fitur untuk memberikan pengalaman terbaik.
              </p>
              
              <p>
                Jika Anda menemukan bug atau memiliki saran, jangan ragu untuk menghubungi saya melalui kontak yang tersedia.
                Terima kasih atas pengertian dan dukungannya!
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
