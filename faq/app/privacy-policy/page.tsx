'use client';

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";

export default function PrivacyPolicyPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const homeButtonRef = useRef<HTMLDivElement>(null);
  const privacyWrapperRef = useRef<HTMLDivElement>(null);
  
  // State untuk cookie consent
  const [showCookiePopup, setShowCookiePopup] = useState(false);

  useEffect(() => {
    // Cek apakah user sudah memberikan consent
    const cookieConsent = localStorage.getItem("cookie-consent");
    if (!cookieConsent) {
      setShowCookiePopup(true);
    }
  }, []);

  const handleCookieAccept = () => {
    // Simpan consent ke localStorage
    localStorage.setItem("cookie-consent", "accepted");
    setShowCookiePopup(false);
  };

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    const homeButton = homeButtonRef.current;
    const privacyWrapper = privacyWrapperRef.current;

    if (!container || !content || !homeButton || !privacyWrapper) return;

    let isDragging = false;
    let startX = 0;
    let scrollLeft = 0;

    const getMaxScroll = () => {
      return content.scrollWidth - window.innerWidth;
    };

    const updateHomeButtonPosition = (currentScroll: number) => {
      const maxScroll = getMaxScroll();
      
      // Jika scroll sudah mencapai akhir (atau mendekati akhir)
      if (currentScroll >= maxScroll - 100) {
        // Home button tetap di posisi kiri layar
        gsap.to(homeButton, {
          x: currentScroll,
          duration: 0.3,
          ease: "power2.out",
        });
      } 
      // Jika scroll balik ke kiri (mendekati posisi awal)
      else if (currentScroll < 200) {
        // Home button kembali ke posisi aslinya (di atas PRIVACY POLICY)
        gsap.to(homeButton, {
          x: 0,
          duration: 0.3,
          ease: "power2.out",
        });
      }
      else {
        // Di area tengah, home button mengikuti scroll normal
        gsap.to(homeButton, {
          x: 0,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const maxScroll = getMaxScroll();
      let newScrollLeft = scrollLeft + e.deltaY;
      
      if (newScrollLeft < 0) newScrollLeft = 0;
      if (newScrollLeft > maxScroll) newScrollLeft = maxScroll;
      
      scrollLeft = newScrollLeft;
      
      // Update posisi home button
      updateHomeButtonPosition(scrollLeft);
      
      gsap.to(container, {
        x: -scrollLeft,
        duration: 0.5,
        ease: "power2.out",
      });
    };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      startX = e.pageX - (container.getBoundingClientRect().left + scrollLeft);
      container.style.cursor = "grabbing";
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - container.getBoundingClientRect().left;
      const walk = (x - startX) * 1.5;
      let newScrollLeft = scrollLeft - walk;
      const maxScroll = getMaxScroll();
      
      if (newScrollLeft < 0) newScrollLeft = 0;
      if (newScrollLeft > maxScroll) newScrollLeft = maxScroll;
      
      scrollLeft = newScrollLeft;
      
      // Update posisi home button untuk drag
      updateHomeButtonPosition(scrollLeft);
      
      gsap.to(container, {
        x: -scrollLeft,
        duration: 0,
        ease: "none",
      });
    };

    const handleMouseUp = () => {
      isDragging = false;
      container.style.cursor = "grab";
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    container.style.cursor = "grab";

    return () => {
      window.removeEventListener("wheel", handleWheel);
      container.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // SVG Arrow Components
  const NorthEastArrow = () => (
    <svg
      width="80"
      height="80"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      <path
        d="M7 17L17 7M17 7H7M17 7V17"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const NorthWestArrow = () => (
    <svg
      width="50"
      height="50"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ marginRight: "15px" }}
    >
      <path
        d="M17 17L7 7M7 7H17M7 7V17"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  // Cookie SVG Icon
  const CookieIcon = () => (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      <path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
        fill="#ffffff"
      />
      <circle cx="8" cy="10" r="1.5" fill="#000000" />
      <circle cx="12" cy="8" r="1.5" fill="#000000" />
      <circle cx="16" cy="10" r="1.5" fill="#000000" />
      <circle cx="10" cy="14" r="1.5" fill="#000000" />
      <circle cx="14" cy="14" r="1.5" fill="#000000" />
      <circle cx="12" cy="18" r="1.5" fill="#000000" />
    </svg>
  );

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        backgroundColor: "#000000",
        fontFamily: "Helvetica, Arial, sans-serif",
        position: "relative",
      }}
    >
      {/* Cookie Popup */}
      {showCookiePopup && (
        <div
          style={{
            position: "fixed",
            bottom: "100px",
            right: "30px",
            zIndex: 2000,
            animation: "slideIn 0.5s ease-out",
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(30, 30, 30, 0.95)",
              backdropFilter: "blur(10px)",
              borderRadius: "16px",
              padding: "20px 25px",
              maxWidth: "380px",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                marginBottom: "15px",
              }}
            >
              <CookieIcon />
              <h3
                style={{
                  color: "#ffffff",
                  fontSize: "20px",
                  fontWeight: "600",
                  margin: 0,
                }}
              >
                Cookie Settings
              </h3>
            </div>
            <p
              style={{
                color: "rgba(255, 255, 255, 0.8)",
                fontSize: "14px",
                lineHeight: "1.6",
                marginBottom: "20px",
              }}
            >
              We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking "OK", you consent to our use of cookies.
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={handleCookieAccept}
                style={{
                  backgroundColor: "#ffffff",
                  color: "#000000",
                  border: "none",
                  padding: "10px 30px",
                  borderRadius: "30px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  fontFamily: "inherit",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#dddddd";
                  e.currentTarget.style.transform = "scale(1.02)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#ffffff";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                OK
              </button>
            </div>
          </div>
          <style jsx>{`
            @keyframes slideIn {
              from {
                opacity: 0;
                transform: translateX(50px);
              }
              to {
                opacity: 1;
                transform: translateX(0);
              }
            }
          `}</style>
        </div>
      )}

      <div
        ref={containerRef}
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          willChange: "transform",
        }}
      >
        <div
          ref={contentRef}
          style={{
            display: "flex",
            gap: "100px",
            alignItems: "center",
            padding: "0 100px",
          }}
        >
          {/* Wrapper untuk PRIVACY POLICY dan Halaman Utama */}
          <div
            ref={privacyWrapperRef}
            style={{
              position: "relative",
              display: "inline-block",
            }}
          >
            {/* Teks Halaman Utama di atas PRIVACY POLICY */}
            <div
              ref={homeButtonRef}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                color: "#ffffff",
                fontSize: "50px",
                fontWeight: "400",
                letterSpacing: "0.05em",
                whiteSpace: "nowrap",
                cursor: "pointer",
                zIndex: 10,
                marginBottom: "20px",
                justifyContent: "flex-end",
              }}
              onClick={() => {
                // Scroll back to start
                const container = containerRef.current;
                const homeButton = homeButtonRef.current;
                if (container && homeButton) {
                  gsap.to(container, {
                    x: 0,
                    duration: 0.8,
                    ease: "power2.out",
                  });
                  gsap.to(homeButton, {
                    x: 0,
                    duration: 0.8,
                    ease: "power2.out",
                  });
                }
              }}
            >
              <NorthWestArrow />
              <span>Halaman Utama</span>
            </div>

            {/* Teks PRIVACY POLICY yang besar */}
            <div
              style={{
                fontWeight: "700",
                fontSize: "700px",
                lineHeight: "1",
                color: "#ffffff",
                whiteSpace: "nowrap",
              }}
            >
              PRIVACY POLICY
            </div>
          </div>

          {/* Section 1 - Pendahuluan */}
          <div
            style={{
              width: "650px",
              flexShrink: 0,
            }}
          >
            <h2 style={{ 
              fontWeight: "600", 
              fontSize: "64px", 
              margin: "0 0 2rem 0",
              color: "#ffffff",
            }}>
              1. Pendahuluan
            </h2>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: "1.5rem",
            }}>
              Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, mengungkapkan, dan melindungi informasi pribadi Anda saat menggunakan layanan, situs web, dan aplikasi kami.
            </p>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: 0,
            }}>
              Dengan mengakses atau menggunakan Layanan kami, Anda menyetujui pengumpulan dan penggunaan informasi sesuai dengan Kebijakan Privasi ini. Jika Anda tidak setuju dengan bagian mana pun, Anda tidak boleh mengakses layanan.
            </p>
          </div>

          {/* Section 2 - Informasi yang Dikumpulkan */}
          <div
            style={{
              width: "650px",
              flexShrink: 0,
            }}
          >
            <h2 style={{ 
              fontWeight: "600", 
              fontSize: "64px", 
              margin: "0 0 2rem 0",
              color: "#ffffff",
            }}>
              2. Informasi yang Kami Kumpulkan
            </h2>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: "1rem",
            }}>
              <strong style={{ color: "#ffffff" }}>Informasi yang Anda Berikan:</strong>
            </p>
            <ul style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: "1.5rem",
              paddingLeft: "2rem",
            }}>
              <li>Informasi akun (nama, email, kata sandi)</li>
              <li>Profil dan foto profil</li>
              <li>Komentar dan interaksi dalam notifikasi</li>
              <li>Reaksi dan like pada konten</li>
              <li>Komunikasi dengan tim dukungan</li>
            </ul>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: "1rem",
            }}>
              <strong style={{ color: "#ffffff" }}>Informasi yang Dikumpulkan Secara Otomatis:</strong>
            </p>
            <ul style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: 0,
              paddingLeft: "2rem",
            }}>
              <li>Data penggunaan (waktu akses, fitur yang digunakan)</li>
              <li>Informasi perangkat (tipe perangkat, sistem operasi)</li>
              <li>Alamat IP dan data lokasi umum</li>
              <li>Cookie dan teknologi pelacakan serupa</li>
            </ul>
          </div>

          {/* Section 3 - Penggunaan Informasi */}
          <div
            style={{
              width: "650px",
              flexShrink: 0,
            }}
          >
            <h2 style={{ 
              fontWeight: "600", 
              fontSize: "64px", 
              margin: "0 0 2rem 0",
              color: "#ffffff",
            }}>
              3. Penggunaan Informasi
            </h2>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: "1rem",
            }}>
              Kami menggunakan informasi yang dikumpulkan untuk:
            </p>
            <ul style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: 0,
              paddingLeft: "2rem",
            }}>
              <li>Menyediakan, memelihara, dan meningkatkan Layanan</li>
              <li>Mengirimkan notifikasi dan pembaruan penting</li>
              <li>Menanggapi komentar, pertanyaan, dan permintaan Anda</li>
              <li>Memantau dan menganalisis tren, penggunaan, dan aktivitas</li>
              <li>Mendeteksi, mencegah, dan mengatasi masalah teknis atau keamanan</li>
              <li>Mematuhi kewajiban hukum</li>
            </ul>
          </div>

          {/* Section 4 - Penyimpanan dan Keamanan */}
          <div
            style={{
              width: "650px",
              flexShrink: 0,
            }}
          >
            <h2 style={{ 
              fontWeight: "600", 
              fontSize: "64px", 
              margin: "0 0 2rem 0",
              color: "#ffffff",
            }}>
              4. Penyimpanan dan Keamanan Data
            </h2>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: "1.5rem",
            }}>
              Kami menggunakan layanan Firebase dari Google untuk menyimpan data Anda. Data disimpan di server yang aman dengan enkripsi dan protokol keamanan industri standar. Namun, tidak ada metode transmisi melalui internet atau metode penyimpanan elektronik yang 100% aman.
            </p>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: 0,
            }}>
              Kami akan menyimpan informasi pribadi Anda selama diperlukan untuk memenuhi tujuan yang diuraikan dalam Kebijakan Privasi ini, kecuali periode penyimpanan yang lebih lama diperlukan atau diizinkan oleh hukum.
            </p>
          </div>

          {/* Section 5 - Berbagi Informasi */}
          <div
            style={{
              width: "650px",
              flexShrink: 0,
            }}
          >
            <h2 style={{ 
              fontWeight: "600", 
              fontSize: "64px", 
              margin: "0 0 2rem 0",
              color: "#ffffff",
            }}>
              5. Berbagi Informasi
            </h2>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: "1rem",
            }}>
              Kami tidak menjual, memperdagangkan, atau menyewakan informasi pribadi Anda kepada pihak ketiga. Kami dapat berbagi informasi dalam situasi berikut:
            </p>
            <ul style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: 0,
              paddingLeft: "2rem",
            }}>
              <li>Dengan penyedia layanan pihak ketiga yang membantu kami mengoperasikan Layanan</li>
              <li>Jika diwajibkan oleh hukum atau untuk merespons proses hukum</li>
              <li>Untuk melindungi hak, properti, atau keselamatan kami atau orang lain</li>
              <li>Dengan persetujuan Anda</li>
            </ul>
          </div>

          {/* Section 6 - Hak Privasi */}
          <div
            style={{
              width: "650px",
              flexShrink: 0,
            }}
          >
            <h2 style={{ 
              fontWeight: "600", 
              fontSize: "64px", 
              margin: "0 0 2rem 0",
              color: "#ffffff",
            }}>
              6. Hak Privasi Anda
            </h2>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: "1rem",
            }}>
              Tergantung pada lokasi Anda, Anda mungkin memiliki hak tertentu terkait informasi pribadi Anda, termasuk:
            </p>
            <ul style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: "1.5rem",
              paddingLeft: "2rem",
            }}>
              <li>Hak untuk mengakses informasi pribadi Anda</li>
              <li>Hak untuk memperbaiki informasi yang tidak akurat</li>
              <li>Hak untuk menghapus informasi pribadi Anda</li>
              <li>Hak untuk membatasi atau menolak pemrosesan</li>
              <li>Hak untuk portabilitas data</li>
            </ul>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: 0,
            }}>
              Untuk menggunakan hak-hak ini, silakan hubungi kami di privacy@wawa44.com
            </p>
          </div>

          {/* Section 7 - Cookie */}
          <div
            style={{
              width: "650px",
              flexShrink: 0,
            }}
          >
            <h2 style={{ 
              fontWeight: "600", 
              fontSize: "64px", 
              margin: "0 0 2rem 0",
              color: "#ffffff",
            }}>
              7. Cookie dan Teknologi Pelacakan
            </h2>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: 0,
            }}>
              Kami menggunakan cookie dan teknologi serupa untuk melacak aktivitas di Layanan kami dan menyimpan informasi tertentu. Anda dapat menginstruksikan browser Anda untuk menolak semua cookie atau untuk menunjukkan kapan cookie dikirim. Namun, jika Anda tidak menerima cookie, beberapa bagian dari Layanan kami mungkin tidak berfungsi dengan baik.
            </p>
          </div>

          {/* Section 8 - Perubahan Kebijakan */}
          <div
            style={{
              width: "650px",
              flexShrink: 0,
            }}
          >
            <h2 style={{ 
              fontWeight: "600", 
              fontSize: "64px", 
              margin: "0 0 2rem 0",
              color: "#ffffff",
            }}>
              8. Perubahan Kebijakan
            </h2>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: 0,
            }}>
              Kami dapat memperbarui Kebijakan Privasi kami dari waktu ke waktu. Kami akan memberi tahu Anda tentang perubahan dengan memposting Kebijakan Privasi baru di halaman ini dan memperbarui tanggal "Terakhir diperbarui". Anda disarankan untuk meninjau Kebijakan Privasi ini secara berkala untuk setiap perubahan.
            </p>
          </div>

          {/* Section 9 - Kontak */}
          <div
            style={{
              width: "650px",
              flexShrink: 0,
            }}
          >
            <h2 style={{ 
              fontWeight: "600", 
              fontSize: "64px", 
              margin: "0 0 2rem 0",
              color: "#ffffff",
            }}>
              9. Hubungi Kami
            </h2>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: "1rem",
            }}>
              Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, silakan hubungi kami:
            </p>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: "0.5rem",
            }}>
              <strong>Email:</strong> privacy@wawa44.com
            </p>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: "0.5rem",
            }}>
              <strong>Alamat:</strong> Jl. Contoh No. 123, Jakarta, Indonesia
            </p>
            <p style={{ 
              fontWeight: "400",
              fontSize: "18px",
              lineHeight: "1.7",
              color: "rgba(255, 255, 255, 0.85)",
              marginBottom: 0,
            }}>
              <strong>Telepon:</strong> +62 21 1234 5678
            </p>
          </div>

          {/* Arrow dan Teks Policy Lainnya */}
          <NorthEastArrow />
          
          <div
            style={{
              fontWeight: "700",
              fontSize: "200px",
              lineHeight: "1",
              color: "#ffffff",
              whiteSpace: "nowrap",
            }}
          >
            COOKIES POLICY
          </div>

          <NorthEastArrow />
          
          <div
            style={{
              fontWeight: "700",
              fontSize: "200px",
              lineHeight: "1",
              color: "#ffffff",
              whiteSpace: "nowrap",
            }}
          >
            TERMS OF SERVICE
          </div>

          <NorthEastArrow />
          
          <div
            style={{
              fontWeight: "700",
              fontSize: "200px",
              lineHeight: "1",
              color: "#ffffff",
              whiteSpace: "nowrap",
            }}
          >
            PRIVACY POLICY
          </div>

          {/* Teks MENURU di akhir */}
          <div
            style={{
              fontWeight: "700",
              fontSize: "700px",
              lineHeight: "1",
              color: "#ffffff",
              whiteSpace: "nowrap",
            }}
          >
            MENURU
          </div>
        </div>
      </div>
    </div>
  );
}
