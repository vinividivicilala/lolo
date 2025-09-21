import React, { useState, useEffect } from "react";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { 
  getFirestore, collection, addDoc, onSnapshot, serverTimestamp, query, orderBy,
  deleteDoc, getDoc, writeBatch, setDoc, doc, updateDoc, where, getDocs, documentId,
  limit, increment, getCountFromServer, arrayUnion, arrayRemove, deleteField, runTransaction
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { 
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, 
  signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider, 
  setPersistence, browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

export default function AvailablePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const openAbout = () => setIsAboutOpen(true);
  const closeAbout = () => setIsAboutOpen(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  ...
}


// Tambahkan state untuk ulasan
const [reviews, setReviews] = useState([]);
const [newReview, setNewReview] = useState({
  name: "",
  position: "",
  comment: ""
});

// Fungsi untuk mengambil data ulasan dari Firebase
useEffect(() => {
  const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const reviewsData = [];
    querySnapshot.forEach((doc) => {
      reviewsData.push({ id: doc.id, ...doc.data() });
    });
    setReviews(reviewsData);
  });
  
  return () => unsubscribe();
}, []);

// Fungsi untuk menambah ulasan baru
const addReview = async () => {
  if (newReview.name && newReview.comment) {
    try {
      await addDoc(collection(db, "reviews"), {
        name: newReview.name,
        position: newReview.position,
        comment: newReview.comment,
        createdAt: serverTimestamp()
      });
      setNewReview({ name: "", position: "", comment: "" });
    } catch (error) {
      console.error("Error adding review: ", error);
    }
  }
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
        }
        .hero-btn:hover {
          background: rgba(255,255,255,0.1);
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

/* Halaman Tentang Saya (overlay penuh) */
.about-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 60px 30px;
  z-index: 9999;
  overflow-y: auto;
}

.about-header {
  font-size: 2.5rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 1.5rem;
}

.about-linebox {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 15px 20px;
  margin-bottom: 20px;
  color: #e5e5e5;
  max-width: 700px;
  text-align: center;
}

.about-close {
  position: absolute;
  top: 20px;
  right: 25px;
  font-size: 2rem;
  background: transparent;
  border: none;
  color: #fff;
  cursor: pointer;
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
          <span style={{ fontSize: "1.3rem", fontWeight: "700", color: "#fff" }}>
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


          <div className="icon-item" onClick={openAbout} style={{ cursor: "pointer" }}>
  <div className="icon-circle">
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"
      viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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


{isAboutOpen && (
  <div className="about-overlay">
    <button className="about-close" onClick={closeAbout}>×</button>
    
    <h2 className="about-header">Tentang Saya</h2>

    {/* Nama Panjang di atas Timeline Box */}
    <div style={{
      marginLeft: "60px",
      marginBottom: "40px",
      fontSize: "1.8rem",
      fontWeight: "700",
      color: "#fff"
    }}>
      Farid Ardiansyah
    </div>

    {/* Timeline Container */}
    <div style={{ 
      marginLeft: "60px", 
      marginBottom: "40px", 
      position: "relative",
      paddingLeft: "30px"
    }}>
      {/* Garis putus-putus vertikal utama */}
      <div style={{
        position: "absolute",
        left: "0",
        top: "0",
        height: "100%",
        borderLeft: "2px dashed rgba(255, 255, 255, 0.3)"
      }}></div>
      
      {/* Item Timeline 1 - dengan animasi kedap-kedip */}
      <div style={{ 
        display: "flex", 
        alignItems: "flex-start",
        marginBottom: "50px",
        position: "relative"
      }}>
        {/* Titik kiri dengan animasi kedap-kedip */}
        <div style={{
          position: "absolute",
          left: "-41px",
          top: "15px",
          width: "16px",
          height: "16px",
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 0 0 4px rgba(255, 255, 255, 0.4)",
          animation: "pulse 1.5s infinite",
          zIndex: "2"
        }}></div>
        
        {/* Garis penghubung horizontal */}
        <div className="timeline-connector" style={{
          position: "absolute",
          left: "-30px",
          top: "23px",
          width: "28px",
          height: "2px",
          background: "rgba(255, 255, 255, 0.3)"
        }}></div>

        {/* Konten Timeline */}
        <div style={{ flex: "1" }}>
          <div style={{
            fontSize: "1.1rem",
            color: "#94a3b8",
            fontWeight: "700",
            marginBottom: "5px"
          }}>2025-09-19</div>
          
          <div style={{
            fontSize: "1.8rem",
            fontWeight: "700",
            color: "#fff",
            marginBottom: "10px"
          }}>Rilis Website</div>
          
          <div style={{
            display: "inline-block",
            padding: "6px 12px",
            borderRadius: "6px",
            fontSize: "1rem",
            fontWeight: "700",
            background: "rgba(255, 255, 255, 0.1)",
            color: "#fff",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            marginBottom: "20px"
          }}>VERSI PRODUKSI</div>
          
          <div style={{
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            borderRadius: "8px",
            padding: "25px",
            color: "#e5e5e5",
            fontSize: "1.2rem",
            lineHeight: "1.6",
            fontWeight: "600"
          }}>
            Peluncuran versi pertama website portfolio dengan desain minimalis dan interaktif.
          </div>
        </div>
      </div>
      
      {/* Item Timeline 2 - dengan animasi kedap-kedip */}
      <div style={{ 
        display: "flex", 
        alignItems: "flex-start",
        marginBottom: "50px",
        position: "relative"
      }}>
        {/* Titik kiri dengan animasi kedap-kedip */}
        <div style={{
          position: "absolute",
          left: "-41px",
          top: "15px",
          width: "16px",
          height: "16px",
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 0 0 4px rgba(255, 255, 255, 0.4)",
          animation: "pulse 1.5s infinite",
          zIndex: "2"
        }}></div>
        
        {/* Garis penghubung horizontal */}
        <div className="timeline-connector" style={{
          position: "absolute",
          left: "-30px",
          top: "23px",
          width: "28px",
          height: "2px",
          background: "rgba(255, 255, 255, 0.3)"
        }}></div>

        {/* Konten Timeline */}
        <div style={{ flex: "1" }}>
          <div style={{
            fontSize: "1.1rem",
            color: "#94a3b8",
            fontWeight: "700",
            marginBottom: "5px"
          }}>2025-08-10</div>
          
          <div style={{
            fontSize: "1.8rem",
            fontWeight: "700",
            color: "#fff",
            marginBottom: "10px"
          }}>Uji Coba Firebase</div>
          
          <div style={{
            display: "inline-block",
            padding: "6px 12px",
            borderRadius: "6px",
            fontSize: "1rem",
            fontWeight: "700",
            background: "rgba(255, 255, 255, 0.1)",
            color: "#fff",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            marginBottom: "20px"
          }}>BACKEND</div>
          
          <div style={{
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            borderRadius: "8px",
            padding: "25px",
            color: "#e5e5e5",
            fontSize: "1.2rem",
            lineHeight: "1.6",
            fontWeight: "600"
          }}>
            Menerapkan autentikasi dan penyimpanan data real-time menggunakan Firebase.
          </div>
        </div>
      </div>
      
      {/* Item Timeline 3 - dengan animasi kedap-kedip */}
      <div style={{ 
        display: "flex", 
        alignItems: "flex-start",
        marginBottom: "20px",
        position: "relative"
      }}>
        {/* Titik kiri dengan animasi kedap-kedip */}
        <div style={{
          position: "absolute",
          left: "-41px",
          top: "15px",
          width: "16px",
          height: "16px",
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 0 0 4px rgba(255, 255, 255, 0.4)",
          animation: "pulse 1.5s infinite",
          zIndex: "2"
        }}></div>
        
        {/* Garis penghubung horizontal */}
        <div className="timeline-connector" style={{
          position: "absolute",
          left: "-30px",
          top: "23px",
          width: "28px",
          height: "2px",
          background: "rgba(255, 255, 255, 0.3)"
        }}></div>

        {/* Konten Timeline */}
        <div style={{ flex: "1" }}>
          <div style={{
            fontSize: "1.1rem",
            color: "#94a3b8",
            fontWeight: "700",
            marginBottom: "5px"
          }}>2025-07-05</div>
          
          <div style={{
            fontSize: "1.8rem",
            fontWeight: "700",
            color: "#fff",
            marginBottom: "10px"
          }}>Desain UI</div>
          
          <div style={{
            display: "inline-block",
            padding: "6px 12px",
            borderRadius: "6px",
            fontSize: "1rem",
            fontWeight: "700",
            background: "rgba(255, 255, 255, 0.1)",
            color: "#fff",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            marginBottom: "20px"
          }}>FRONTEND</div>
          
          <div style={{
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            borderRadius: "8px",
            padding: "25px",
            color: "#e5e5e5",
            fontSize: "1.2rem",
            lineHeight: "1.6",
            fontWeight: "600"
          }}>
            Membuat desain UI tipografi-based dan minimalist UI untuk tampilan website.
          </div>
        </div>
      </div>
    </div>

    {/* Tambahkan style untuk animasi pulse */}
    <style>{`
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
    `}</style>
  </div>
)}

{isAboutOpen && (
  <div className="about-overlay">
    <button className="about-close" onClick={closeAbout}>×</button>
    
    <h2 className="about-header">Tentang Saya</h2>

    {/* Nama Panjang di atas Timeline Box */}
    <div style={{
      marginLeft: "60px",
      marginBottom: "40px",
      fontSize: "1.8rem",
      fontWeight: "700",
      color: "#fff"
    }}>
      Farid Ardiansyah
    </div>

    {/* Timeline Container */}
    <div style={{ 
      marginLeft: "60px", 
      marginBottom: "40px", 
      position: "relative",
      paddingLeft: "30px"
    }}>
      {/* Garis putus-putus vertikal utama */}
      <div style={{
        position: "absolute",
        left: "0",
        top: "0",
        height: "100%",
        borderLeft: "2px dashed rgba(255, 255, 255, 0.3)"
      }}></div>
      
      {/* Item Timeline 1 - dengan animasi kedap-kedip */}
      <div style={{ 
        display: "flex", 
        alignItems: "flex-start",
        marginBottom: "50px",
        position: "relative"
      }}>
        {/* Titik kiri dengan animasi kedap-kedip */}
        <div style={{
          position: "absolute",
          left: "-41px",
          top: "15px",
          width: "16px",
          height: "16px",
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 0 0 4px rgba(255, 255, 255, 0.4)",
          animation: "pulse 1.5s infinite",
          zIndex: "2"
        }}></div>
        
        {/* Garis penghubung horizontal */}
        <div className="timeline-connector" style={{
          position: "absolute",
          left: "-30px",
          top: "23px",
          width: "28px",
          height: "2px",
          background: "rgba(255, 255, 255, 0.3)"
        }}></div>

        {/* Konten Timeline */}
        <div style={{ flex: "1" }}>
          <div style={{
            fontSize: "1.1rem",
            color: "#94a3b8",
            fontWeight: "700",
            marginBottom: "5px"
          }}>2025-09-19</div>
          
          <div style={{
            fontSize: "1.8rem",
            fontWeight: "700",
            color: "#fff",
            marginBottom: "10px"
          }}>Rilis Website</div>
          
          <div style={{
            display: "inline-block",
            padding: "6px 12px",
            borderRadius: "6px",
            fontSize: "1rem",
            fontWeight: "700",
            background: "rgba(255, 255, 255, 0.1)",
            color: "#fff",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            marginBottom: "20px"
          }}>VERSI PRODUKSI</div>
          
          <div style={{
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            borderRadius: "8px",
            padding: "25px",
            color: "#e5e5e5",
            fontSize: "1.2rem",
            lineHeight: "1.6",
            fontWeight: "600"
          }}>
            Peluncuran versi pertama website portfolio dengan desain minimalis dan interaktif.
          </div>
        </div>
      </div>
      
      {/* Item Timeline 2 - dengan animasi kedap-kedip */}
      <div style={{ 
        display: "flex", 
        alignItems: "flex-start",
        marginBottom: "50px",
        position: "relative"
      }}>
        {/* Titik kiri dengan animasi kedap-kedip */}
        <div style={{
          position: "absolute",
          left: "-41px",
          top: "15px",
          width: "16px",
          height: "16px",
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 0 0 4px rgba(255, 255, 255, 0.4)",
          animation: "pulse 1.5s infinite",
          zIndex: "2"
        }}></div>
        
        {/* Garis penghubung horizontal */}
        <div className="timeline-connector" style={{
          position: "absolute",
          left: "-30px",
          top: "23px",
          width: "28px",
          height: "2px",
          background: "rgba(255, 255, 255, 0.3)"
        }}></div>

        {/* Konten Timeline */}
        <div style={{ flex: "1" }}>
          <div style={{
            fontSize: "1.1rem",
            color: "#94a3b8",
            fontWeight: "700",
            marginBottom: "5px"
          }}>2025-08-10</div>
          
          <div style={{
            fontSize: "1.8rem",
            fontWeight: "700",
            color: "#fff",
            marginBottom: "10px"
          }}>Uji Coba Firebase</div>
          
          <div style={{
            display: "inline-block",
            padding: "6px 12px",
            borderRadius: "6px",
            fontSize: "1rem",
            fontWeight: "700",
            background: "rgba(255, 255, 255, 0.1)",
            color: "#fff",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            marginBottom: "20px"
          }}>BACKEND</div>
          
          <div style={{
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            borderRadius: "8px",
            padding: "25px",
            color: "#e5e5e5",
            fontSize: "1.2rem",
            lineHeight: "1.6",
            fontWeight: "600"
          }}>
            Menerapkan autentikasi dan penyimpanan data real-time menggunakan Firebase.
          </div>
        </div>
      </div>
      
      {/* Item Timeline 3 - dengan animasi kedap-kedip */}
      <div style={{ 
        display: "flex", 
        alignItems: "flex-start",
        marginBottom: "50px",
        position: "relative"
      }}>
        {/* Titik kiri dengan animasi kedap-kedip */}
        <div style={{
          position: "absolute",
          left: "-41px",
          top: "15px",
          width: "16px",
          height: "16px",
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 0 0 4px rgba(255, 255, 255, 0.4)",
          animation: "pulse 1.5s infinite",
          zIndex: "2"
        }}></div>
        
        {/* Garis penghubung horizontal */}
        <div className="timeline-connector" style={{
          position: "absolute",
          left: "-30px",
          top: "23px",
          width: "28px",
          height: "2px",
          background: "rgba(255, 255, 255, 0.3)"
        }}></div>

        {/* Konten Timeline */}
        <div style={{ flex: "1" }}>
          <div style={{
            fontSize: "1.1rem",
            color: "#94a3b8",
            fontWeight: "700",
            marginBottom: "5px"
          }}>2025-07-05</div>
          
          <div style={{
            fontSize: "1.8rem",
            fontWeight: "700",
            color: "#fff",
            marginBottom: "10px"
          }}>Desain UI</div>
          
          <div style={{
            display: "inline-block",
            padding: "6px 12px",
            borderRadius: "6px",
            fontSize: "1rem",
            fontWeight: "700",
            background: "rgba(255, 255, 255, 0.1)",
            color: "#fff",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            marginBottom: "20px"
          }}>FRONTEND</div>
          
          <div style={{
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            borderRadius: "8px",
            padding: "25px",
            color: "#e5e5e5",
            fontSize: "1.2rem",
            lineHeight: "1.6",
            fontWeight: "600"
          }}>
            Membuat desain UI tipografi-based dan minimalist UI untuk tampilan website.
          </div>
        </div>
      </div>
    </div>

    {/* Bagian Ulasan */}
    <div style={{ 
      marginLeft: "60px", 
      marginBottom: "40px",
      position: "relative",
      paddingLeft: "30px"
    }}>
      <h3 style={{
        fontSize: "2rem",
        fontWeight: "700",
        color: "#fff",
        marginBottom: "30px",
        position: "relative"
      }}>
        Ulasan
        {/* Garis horizontal di bawah judul Ulasan */}
        <div style={{
          position: "absolute",
          bottom: "-10px",
          left: "0",
          width: "100px",
          height: "3px",
          background: "rgba(255, 255, 255, 0.3)",
          borderRadius: "2px"
        }}></div>
      </h3>

      {/* Container untuk daftar ulasan */}
      <div style={{ marginLeft: "30px" }}>
        {/* Ulasan 1 */}
        <div style={{ 
          display: "flex", 
          alignItems: "flex-start",
          marginBottom: "30px",
          position: "relative"
        }}>
          {/* Titik kiri */}
          <div style={{
            position: "absolute",
            left: "-41px",
            top: "15px",
            width: "16px",
            height: "16px",
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.4)",
            border: "2px solid rgba(255, 255, 255, 0.8)",
            zIndex: "2"
          }}></div>
          
          {/* Garis penghubung horizontal */}
          <div style={{
            position: "absolute",
            left: "-30px",
            top: "23px",
            width: "28px",
            height: "2px",
            background: "rgba(255, 255, 255, 0.3)",
            zIndex: "1"
          }}></div>

          {/* Konten Ulasan */}
          <div style={{ flex: "1" }}>
            <div style={{
              display: "inline-block",
              padding: "8px 14px",
              borderRadius: "6px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              marginBottom: "15px",
              color: "#fff",
              fontSize: "1.1rem",
              fontWeight: "600"
            }}>
              <div style={{ fontWeight: "700", marginBottom: "5px" }}>Budi Santoso</div>
              <div style={{ fontSize: "0.9rem", color: "#94a3b8" }}>Project Manager di TechCorp</div>
            </div>
            
            <div style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "8px",
              padding: "20px",
              color: "#e5e5e5",
              fontSize: "1.1rem",
              lineHeight: "1.6"
            }}>
              "Farid adalah developer yang sangat berbakat. Desain website yang dibuatnya sangat modern dan fungsional. Sangat recomended untuk project web development!"
            </div>
          </div>
        </div>

        {/* Ulasan 2 */}
        <div style={{ 
          display: "flex", 
          alignItems: "flex-start",
          marginBottom: "30px",
          position: "relative"
        }}>
          {/* Titik kiri */}
          <div style={{
            position: "absolute",
            left: "-41px",
            top: "15px",
            width: "16px",
            height: "16px",
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.4)",
            border: "2px solid rgba(255, 255, 255, 0.8)",
            zIndex: "2"
          }}></div>
          
          {/* Garis penghubung horizontal */}
          <div style={{
            position: "absolute",
            left: "-30px",
            top: "23px",
            width: "28px",
            height: "2px",
            background: "rgba(255, 255, 255, 0.3)",
            zIndex: "1"
          }}></div>

          {/* Konten Ulasan */}
          <div style={{ flex: "1" }}>
            <div style={{
              display: "inline-block",
              padding: "8px 14px",
              borderRadius: "6px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              marginBottom: "15px",
              color: "#fff",
              fontSize: "1.1rem",
              fontWeight: "600"
            }}>
              <div style={{ fontWeight: "700", marginBottom: "5px" }}>Siti Rahayu</div>
              <div style={{ fontSize: "0.9rem", color: "#94a3b8" }}>UI/UX Designer di CreativeStudio</div>
            </div>
            
            <div style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "8px",
              padding: "20px",
              color: "#e5e5e5",
              fontSize: "1.1rem",
              lineHeight: "1.6"
            }}>
              "Kolaborasi dengan Farid sangat menyenangkan. Ia cepat memahami kebutuhan desain dan menerapkannya dengan tepat dalam kode. Hasilnya selalu memuaskan!"
            </div>
          </div>
        </div>

        {/* Form untuk menambah ulasan baru */}
        <div style={{ 
          background: "rgba(255, 255, 255, 0.05)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          borderRadius: "8px",
          padding: "25px",
          marginTop: "40px"
        }}>
          <h4 style={{
            fontSize: "1.4rem",
            fontWeight: "700",
            color: "#fff",
            marginBottom: "20px"
          }}>Tambah Ulasan Baru</h4>
          
          <div style={{ display: "grid", gap: "15px" }}>
            <input 
              type="text" 
              placeholder="Nama"
              style={{
                padding: "12px 15px",
                borderRadius: "6px",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                background: "rgba(255, 255, 255, 0.05)",
                color: "#fff",
                fontSize: "1rem"
              }}
            />
            
            <input 
              type="text" 
              placeholder="Jabatan/Perusahaan"
              style={{
                padding: "12px 15px",
                borderRadius: "6px",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                background: "rgba(255, 255, 255, 0.05)",
                color: "#fff",
                fontSize: "1rem"
              }}
            />
            
            <textarea 
              placeholder="Ulasan Anda"
              rows="4"
              style={{
                padding: "12px 15px",
                borderRadius: "6px",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                background: "rgba(255, 255, 255, 0.05)",
                color: "#fff",
                fontSize: "1rem",
                resize: "vertical"
              }}
            ></textarea>
            
            <button 
              style={{
                padding: "12px 20px",
                borderRadius: "6px",
                border: "none",
                background: "rgba(255, 255, 255, 0.1)",
                color: "#fff",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "background 0.3s"
              }}
              onMouseOver={(e) => e.target.style.background = "rgba(255, 255, 255, 0.2)"}
              onMouseOut={(e) => e.target.style.background = "rgba(255, 255, 255, 0.1)"}
            >
              Kirim Ulasan
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* Tambahkan style untuk animasi pulse */}
    <style>{`
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
    `}</style>
  </div>
)}

            

            
            

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







