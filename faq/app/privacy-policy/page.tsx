'use client';

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";

export default function PrivacyPolicyPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const homeButtonRef = useRef<HTMLDivElement>(null);
  const privacyWrapperRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  
  // State untuk cookie consent
  const [showCookiePopup, setShowCookiePopup] = useState(false);

  useEffect(() => {
    // Cek apakah user sudah memberikan consent
    const cookieConsent = localStorage.getItem("cookie-consent");
    if (!cookieConsent) {
      setShowCookiePopup(true);
    }
  }, []);

  // Animasi popup saat muncul
  useEffect(() => {
    if (showCookiePopup && popupRef.current) {
      gsap.fromTo(popupRef.current,
        {
          opacity: 0,
          y: 100,
          scale: 0.9,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: "back.out(0.3)",
        }
      );
    }
  }, [showCookiePopup]);

  const handleCookieAccept = () => {
    // Animasi keluar
    if (popupRef.current) {
      gsap.to(popupRef.current, {
        opacity: 0,
        y: 50,
        scale: 0.8,
        duration: 0.4,
        ease: "power2.in",
        onComplete: () => {
          localStorage.setItem("cookie-consent", "accepted");
          setShowCookiePopup(false);
        }
      });
    } else {
      localStorage.setItem("cookie-consent", "accepted");
      setShowCookiePopup(false);
    }
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
      
      if (currentScroll >= maxScroll - 100) {
        gsap.to(homeButton, {
          x: currentScroll,
          duration: 0.3,
          ease: "power2.out",
        });
      } 
      else if (currentScroll < 200) {
        gsap.to(homeButton, {
          x: 0,
          duration: 0.3,
          ease: "power2.out",
        });
      }
      else {
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

  // Modern Cookie 3D Icon with bite effect
  const ModernCookieIcon = () => (
    <svg
      width="56"
      height="56"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0, filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))" }}
    >
      <defs>
        <linearGradient id="cookieGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F5E6D3" />
          <stop offset="100%" stopColor="#E8D5B7" />
        </linearGradient>
        <linearGradient id="chipGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5C3A1E" />
          <stop offset="100%" stopColor="#3E2510" />
        </linearGradient>
      </defs>
      {/* Cookie body */}
      <circle cx="16" cy="16" r="14" fill="url(#cookieGrad)" stroke="#D4B896" strokeWidth="1.5"/>
      {/* Cookie edge detail */}
      <circle cx="16" cy="16" r="13" fill="none" stroke="#D4B896" strokeWidth="0.5" strokeDasharray="3 3"/>
      {/* Chocolate chips */}
      <circle cx="10" cy="11" r="2.5" fill="url(#chipGrad)" />
      <circle cx="20" cy="10" r="2" fill="url(#chipGrad)" />
      <circle cx="13" cy="20" r="2" fill="url(#chipGrad)" />
      <circle cx="22" cy="19" r="2.2" fill="url(#chipGrad)" />
      <circle cx="8" cy="18" r="1.8" fill="url(#chipGrad)" />
      <circle cx="18" cy="23" r="1.5" fill="url(#chipGrad)" />
      {/* Bite mark */}
      <path
        d="M24 8C25.5 9.5 26 11.5 25.5 13.5C24.5 13 23 13 22 14C21 15 21 16.5 21.5 18C19.5 18.5 17.5 18 16 17C17 15 17.5 13 17 11C16.5 9 15 7.5 13 7C14 5.5 16 4.5 18 5C19 5.5 20 6.5 20.5 8C21.5 7.5 22.5 7.5 24 8Z"
        fill="#D4B896"
        stroke="#C4A87A"
        strokeWidth="0.5"
      />
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
      {/* Modern Cookie Popup - Awwwards Style */}
      {showCookiePopup && (
        <div
          ref={popupRef}
          style={{
            position: "fixed",
            bottom: "40px",
            right: "40px",
            zIndex: 2000,
          }}
        >
          <div
            style={{
              position: "relative",
              background: "rgba(20, 20, 25, 0.85)",
              backdropFilter: "blur(20px)",
              borderRadius: "28px",
              padding: "24px 28px",
              width: "420px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              transition: "all 0.3s ease",
            }}
          >
            {/* Decorative gradient line */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 20,
                right: 20,
                height: "3px",
                background: "linear-gradient(90deg, #FFB347, #FF8C42, #FF6B35)",
                borderRadius: "3px",
              }}
            />
            
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "18px",
                marginBottom: "20px",
              }}
            >
              {/* Animated cookie icon */}
              <div
                style={{
                  animation: "float 3s ease-in-out infinite",
                  transformOrigin: "center",
                }}
              >
                <ModernCookieIcon />
              </div>
              
              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    color: "#ffffff",
                    fontSize: "22px",
                    fontWeight: "600",
                    margin: 0,
                    marginBottom: "6px",
                    letterSpacing: "-0.3px",
                    background: "linear-gradient(135deg, #fff 0%, #e0e0e0 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Cookie Preferences
                </h3>
                <p
                  style={{
                    color: "rgba(255, 255, 255, 0.65)",
                    fontSize: "13.5px",
                    lineHeight: "1.55",
                    margin: 0,
                    letterSpacing: "-0.2px",
                  }}
                >
                  We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.
                </p>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
                marginTop: "8px",
              }}
            >
              <button
                onClick={() => {
                  if (popupRef.current) {
                    gsap.to(popupRef.current, {
                      opacity: 0,
                      y: 50,
                      scale: 0.8,
                      duration: 0.3,
                      ease: "power2.in",
                      onComplete: () => setShowCookiePopup(false)
                    });
                  } else {
                    setShowCookiePopup(false);
                  }
                }}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "rgba(255, 255, 255, 0.7)",
                  padding: "10px 22px",
                  borderRadius: "40px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  fontFamily: "inherit",
                  letterSpacing: "-0.2px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.4)";
                  e.currentTarget.style.color = "#ffffff";
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
                  e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                Decline
              </button>
              <button
                onClick={handleCookieAccept}
                style={{
                  background: "linear-gradient(135deg, #FFB347 0%, #FF8C42 100%)",
                  border: "none",
                  color: "#ffffff",
                  padding: "10px 28px",
                  borderRadius: "40px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  fontFamily: "inherit",
                  letterSpacing: "-0.2px",
                  boxShadow: "0 4px 15px rgba(255, 140, 66, 0.3)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 25px rgba(255, 140, 66, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 15px rgba(255, 140, 66, 0.3)";
                }}
              >
                Accept Cookies
              </button>
            </div>

            {/* Floating particles decoration */}
            <div
              style={{
                position: "absolute",
                bottom: -10,
                left: 20,
                width: "60px",
                height: "60px",
                background: "radial-gradient(circle, rgba(255,140,66,0.15) 0%, transparent 70%)",
                borderRadius: "50%",
                pointerEvents: "none",
                zIndex: -1,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: -10,
                right: 30,
                width: "40px",
                height: "40px",
                background: "radial-gradient(circle, rgba(255,179,71,0.12) 0%, transparent 70%)",
                borderRadius: "50%",
                pointerEvents: "none",
                zIndex: -1,
              }}
            />
          </div>

          <style jsx>{`
            @keyframes float {
              0%, 100% {
                transform: translateY(0px);
              }
              50% {
                transform: translateY(-4px);
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

          {/* Rest of the content sections remain the same */}
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
