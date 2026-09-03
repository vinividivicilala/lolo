'use client';

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import gsap from "gsap";

export default function PrivacyPolicyPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const homeButtonRef = useRef<HTMLDivElement>(null);
  const privacyWrapperRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const privacyTextRef = useRef<HTMLDivElement>(null);
  
  const [showCookiePopup, setShowCookiePopup] = useState(false);

  useEffect(() => {
    const cookieConsent = localStorage.getItem("cookie-consent");
    if (!cookieConsent) {
      setShowCookiePopup(true);
    }
  }, []);

  useEffect(() => {
    if (showCookiePopup && popupRef.current) {
      gsap.fromTo(popupRef.current,
        {
          opacity: 0,
          y: 30,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: "power2.out",
        }
      );
    }
  }, [showCookiePopup]);

  const handleCookieAccept = () => {
    if (popupRef.current) {
      gsap.to(popupRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.3,
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

  // Animate Privacy Policy text on load
  useEffect(() => {
    if (privacyTextRef.current) {
      gsap.fromTo(privacyTextRef.current,
        {
          opacity: 0,
          y: 50,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          delay: 0.3,
        }
      );
    }
  }, []);

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

  // Minimalist Cookie SVG Icon
  const MinimalCookieIcon = () => (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      <circle cx="12" cy="12" r="10" stroke="#ffffff" strokeWidth="1.5" fill="none"/>
      <circle cx="8.5" cy="9.5" r="1" fill="#ffffff" />
      <circle cx="14.5" cy="8.5" r="1" fill="#ffffff" />
      <circle cx="10.5" cy="14.5" r="1" fill="#ffffff" />
      <circle cx="15.5" cy="13.5" r="1" fill="#ffffff" />
      <path d="M18 8L20 6" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );

  // Navbar items
  const navItems = ["Shop", "Note", "Calendar", "Blog", "Donation", "Community", "Live Chat Agent", "Live Chat"];

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
      {/* Minimalist Cookie Popup */}
      {showCookiePopup && (
        <div
          ref={popupRef}
          style={{
            position: "fixed",
            bottom: "30px",
            right: "30px",
            zIndex: 2000,
          }}
        >
          <div
            style={{
              background: "#1a1a1a",
              borderRadius: "12px",
              padding: "16px 20px",
              width: "320px",
              border: "1px solid #333333",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "12px",
              }}
            >
              <MinimalCookieIcon />
              <span
                style={{
                  color: "#ffffff",
                  fontSize: "14px",
                  fontWeight: "500",
                  letterSpacing: "0.3px",
                }}
              >
                Cookie settings
              </span>
            </div>
            
            <p
              style={{
                color: "#999999",
                fontSize: "13px",
                lineHeight: "1.5",
                margin: "0 0 16px 0",
              }}
            >
              This website uses cookies to ensure you get the best experience.
            </p>

            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setShowCookiePopup(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#666666",
                  fontSize: "13px",
                  fontWeight: "400",
                  cursor: "pointer",
                  padding: "6px 12px",
                  fontFamily: "inherit",
                  transition: "color 0.2s ease",
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#999999"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#666666"}
              >
                Decline
              </button>
              <button
                onClick={handleCookieAccept}
                style={{
                  background: "#ffffff",
                  border: "none",
                  color: "#000000",
                  fontSize: "13px",
                  fontWeight: "500",
                  cursor: "pointer",
                  padding: "6px 16px",
                  borderRadius: "6px",
                  fontFamily: "inherit",
                  transition: "opacity 0.2s ease",
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
                onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NAVBAR - Like main page */}
      <div
        style={{
          position: "fixed",
          top: "40px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          gap: "24px",
          padding: "12px 24px",
          borderRadius: "16px",
          backgroundColor: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.08)",
          transition: "all 0.3s ease",
          pointerEvents: "auto",
        }}
      >
        <Link href="/shop">
          <span style={{ fontSize: "14px", fontWeight: 500, color: "#ffffff", cursor: "pointer", fontFamily: "Helvetica, Arial, sans-serif", opacity: 0.7, transition: "opacity 0.2s" }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
            onMouseLeave={(e) => e.currentTarget.style.opacity = "0.7"}
          >Shop</span>
        </Link>
        <Link href="/note">
          <span style={{ fontSize: "14px", fontWeight: 500, color: "#ffffff", cursor: "pointer", fontFamily: "Helvetica, Arial, sans-serif", opacity: 0.7, transition: "opacity 0.2s" }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
            onMouseLeave={(e) => e.currentTarget.style.opacity = "0.7"}
          >Note</span>
        </Link>
        <Link href="/calendar">
          <span style={{ fontSize: "14px", fontWeight: 500, color: "#ffffff", cursor: "pointer", fontFamily: "Helvetica, Arial, sans-serif", opacity: 0.7, transition: "opacity 0.2s" }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
            onMouseLeave={(e) => e.currentTarget.style.opacity = "0.7"}
          >Calendar</span>
        </Link>
        <Link href="/blog">
          <span style={{ fontSize: "14px", fontWeight: 500, color: "#ffffff", cursor: "pointer", fontFamily: "Helvetica, Arial, sans-serif", opacity: 0.7, transition: "opacity 0.2s" }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
            onMouseLeave={(e) => e.currentTarget.style.opacity = "0.7"}
          >Blog</span>
        </Link>
        <Link href="/donation">
          <span style={{ fontSize: "14px", fontWeight: 500, color: "#ffffff", cursor: "pointer", fontFamily: "Helvetica, Arial, sans-serif", opacity: 0.7, transition: "opacity 0.2s" }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
            onMouseLeave={(e) => e.currentTarget.style.opacity = "0.7"}
          >Donation</span>
        </Link>
        <Link href="/community">
          <span style={{ fontSize: "14px", fontWeight: 500, color: "#ffffff", cursor: "pointer", fontFamily: "Helvetica, Arial, sans-serif", opacity: 0.7, transition: "opacity 0.2s" }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
            onMouseLeave={(e) => e.currentTarget.style.opacity = "0.7"}
          >Community</span>
        </Link>
        <Link href="/live-chat-agent">
          <span style={{ fontSize: "14px", fontWeight: 500, color: "#ffffff", cursor: "pointer", fontFamily: "Helvetica, Arial, sans-serif", opacity: 0.7, transition: "opacity 0.2s" }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
            onMouseLeave={(e) => e.currentTarget.style.opacity = "0.7"}
          >Live Chat Agent</span>
        </Link>
        <Link href="/live-chat">
          <span style={{ fontSize: "14px", fontWeight: 500, color: "#ffffff", cursor: "pointer", fontFamily: "Helvetica, Arial, sans-serif", opacity: 0.7, transition: "opacity 0.2s" }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
            onMouseLeave={(e) => e.currentTarget.style.opacity = "0.7"}
          >Live Chat</span>
        </Link>
      </div>

      {/* MAIN CONTENT - Horizontal scroll */}
      <div
        ref={containerRef}
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          willChange: "transform",
          paddingTop: "80px",
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

            {/* Teks PRIVACY POLICY yang besar - 450px */}
            <div
              ref={privacyTextRef}
              style={{
                fontWeight: "700",
                fontSize: "450px",
                lineHeight: "0.9",
                color: "#ffffff",
                whiteSpace: "nowrap",
              }}
            >
              PRIVACY POLICY
            </div>
          </div>

          {/* KONTEN PRIVACY POLICY dengan format makalah */}
          <div
            style={{
              width: "800px",
              flexShrink: 0,
              padding: "40px 0",
            }}
          >
            {/* 1. Pendahuluan */}
            <div style={{ marginBottom: "50px" }}>
              <h2 style={{ 
                fontWeight: "600", 
                fontSize: "42px", 
                margin: "0 0 24px 0",
                color: "#ffffff",
                letterSpacing: "-0.02em",
              }}>
                1. Pendahuluan
              </h2>
              
              <h3 style={{
                fontWeight: "500",
                fontSize: "22px",
                color: "#ffffff",
                margin: "0 0 12px 0",
                opacity: 0.9,
              }}>
                1.1. Latar Belakang
              </h3>
              <p style={{ 
                fontWeight: "400",
                fontSize: "16px",
                lineHeight: "1.8",
                color: "rgba(255, 255, 255, 0.8)",
                marginBottom: "20px",
              }}>
                Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, mengungkapkan, dan melindungi informasi pribadi Anda saat menggunakan layanan, situs web, dan aplikasi kami. Privasi Anda adalah prioritas utama kami.
              </p>
              
              <h3 style={{
                fontWeight: "500",
                fontSize: "22px",
                color: "#ffffff",
                margin: "0 0 12px 0",
                opacity: 0.9,
              }}>
                1.2. Ruang Lingkup
              </h3>
              <p style={{ 
                fontWeight: "400",
                fontSize: "16px",
                lineHeight: "1.8",
                color: "rgba(255, 255, 255, 0.8)",
                marginBottom: "0",
              }}>
                Kebijakan ini berlaku untuk semua pengguna yang mengakses atau menggunakan Layanan kami, termasuk situs web, aplikasi mobile, dan fitur-fitur lainnya yang terkait dengan platform kami.
              </p>
            </div>

            {/* 2. Informasi yang Dikumpulkan */}
            <div style={{ marginBottom: "50px" }}>
              <h2 style={{ 
                fontWeight: "600", 
                fontSize: "42px", 
                margin: "0 0 24px 0",
                color: "#ffffff",
                letterSpacing: "-0.02em",
              }}>
                2. Informasi yang Dikumpulkan
              </h2>
              
              <h3 style={{
                fontWeight: "500",
                fontSize: "22px",
                color: "#ffffff",
                margin: "0 0 12px 0",
                opacity: 0.9,
              }}>
                2.1. Informasi Pribadi
              </h3>
              <p style={{ 
                fontWeight: "400",
                fontSize: "16px",
                lineHeight: "1.8",
                color: "rgba(255, 255, 255, 0.8)",
                marginBottom: "12px",
              }}>
                Kami mengumpulkan informasi yang Anda berikan secara langsung, termasuk:
              </p>
              <ul style={{ 
                fontWeight: "400",
                fontSize: "16px",
                lineHeight: "1.8",
                color: "rgba(255, 255, 255, 0.8)",
                marginBottom: "20px",
                paddingLeft: "2rem",
              }}>
                <li><strong style={{ color: "#ffffff" }}>2.1.1.</strong> Nama lengkap dan alamat email</li>
                <li><strong style={{ color: "#ffffff" }}>2.1.2.</strong> Kata sandi yang dienkripsi</li>
                <li><strong style={{ color: "#ffffff" }}>2.1.3.</strong> Foto profil dan informasi biografi</li>
                <li><strong style={{ color: "#ffffff" }}>2.1.4.</strong> Komentar, interaksi, dan reaksi pada konten</li>
                <li><strong style={{ color: "#ffffff" }}>2.1.5.</strong> Komunikasi dengan tim dukungan kami</li>
              </ul>
              
              <h3 style={{
                fontWeight: "500",
                fontSize: "22px",
                color: "#ffffff",
                margin: "0 0 12px 0",
                opacity: 0.9,
              }}>
                2.2. Informasi Otomatis
              </h3>
              <p style={{ 
                fontWeight: "400",
                fontSize: "16px",
                lineHeight: "1.8",
                color: "rgba(255, 255, 255, 0.8)",
                marginBottom: "12px",
              }}>
                Kami juga mengumpulkan informasi secara otomatis saat Anda menggunakan Layanan:
              </p>
              <ul style={{ 
                fontWeight: "400",
                fontSize: "16px",
                lineHeight: "1.8",
                color: "rgba(255, 255, 255, 0.8)",
                marginBottom: "0",
                paddingLeft: "2rem",
              }}>
                <li><strong style={{ color: "#ffffff" }}>2.2.1.</strong> Data penggunaan (waktu akses, fitur yang digunakan)</li>
                <li><strong style={{ color: "#ffffff" }}>2.2.2.</strong> Informasi perangkat (tipe perangkat, sistem operasi, versi browser)</li>
                <li><strong style={{ color: "#ffffff" }}>2.2.3.</strong> Alamat IP dan data lokasi umum</li>
                <li><strong style={{ color: "#ffffff" }}>2.2.4.</strong> Cookie dan teknologi pelacakan serupa</li>
              </ul>
            </div>

            {/* 3. Penggunaan Informasi */}
            <div style={{ marginBottom: "50px" }}>
              <h2 style={{ 
                fontWeight: "600", 
                fontSize: "42px", 
                margin: "0 0 24px 0",
                color: "#ffffff",
                letterSpacing: "-0.02em",
              }}>
                3. Penggunaan Informasi
              </h2>
              
              <h3 style={{
                fontWeight: "500",
                fontSize: "22px",
                color: "#ffffff",
                margin: "0 0 12px 0",
                opacity: 0.9,
              }}>
                3.1. Tujuan Penggunaan
              </h3>
              <p style={{ 
                fontWeight: "400",
                fontSize: "16px",
                lineHeight: "1.8",
                color: "rgba(255, 255, 255, 0.8)",
                marginBottom: "12px",
              }}>
                Informasi yang kami kumpulkan digunakan untuk:
              </p>
              <ul style={{ 
                fontWeight: "400",
                fontSize: "16px",
                lineHeight: "1.8",
                color: "rgba(255, 255, 255, 0.8)",
                marginBottom: "20px",
                paddingLeft: "2rem",
              }}>
                <li><strong style={{ color: "#ffffff" }}>3.1.1.</strong> Menyediakan, memelihara, dan meningkatkan Layanan</li>
                <li><strong style={{ color: "#ffffff" }}>3.1.2.</strong> Mengirimkan notifikasi dan pembaruan penting</li>
                <li><strong style={{ color: "#ffffff" }}>3.1.3.</strong> Menanggapi komentar, pertanyaan, dan permintaan Anda</li>
                <li><strong style={{ color: "#ffffff" }}>3.1.4.</strong> Memonitor dan menganalisis tren, penggunaan, dan aktivitas</li>
                <li><strong style={{ color: "#ffffff" }}>3.1.5.</strong> Mendeteksi, mencegah, dan mengatasi masalah teknis atau keamanan</li>
                <li><strong style={{ color: "#ffffff" }}>3.1.6.</strong> Mematuhi kewajiban hukum yang berlaku</li>
              </ul>
              
              <h3 style={{
                fontWeight: "500",
                fontSize: "22px",
                color: "#ffffff",
                margin: "0 0 12px 0",
                opacity: 0.9,
              }}>
                3.2. Dasar Hukum
              </h3>
              <p style={{ 
                fontWeight: "400",
                fontSize: "16px",
                lineHeight: "1.8",
                color: "rgba(255, 255, 255, 0.8)",
                marginBottom: "0",
              }}>
                Kami memproses informasi pribadi Anda berdasarkan persetujuan Anda, pelaksanaan kontrak, kepatuhan terhadap kewajiban hukum, dan kepentingan sah kami dalam menyediakan Layanan yang aman dan efektif.
              </p>
            </div>

            {/* 4. Penyimpanan dan Keamanan */}
            <div style={{ marginBottom: "50px" }}>
              <h2 style={{ 
                fontWeight: "600", 
                fontSize: "42px", 
                margin: "0 0 24px 0",
                color: "#ffffff",
                letterSpacing: "-0.02em",
              }}>
                4. Penyimpanan dan Keamanan Data
              </h2>
              
              <h3 style={{
                fontWeight: "500",
                fontSize: "22px",
                color: "#ffffff",
                margin: "0 0 12px 0",
                opacity: 0.9,
              }}>
                4.1. Metode Penyimpanan
              </h3>
              <p style={{ 
                fontWeight: "400",
                fontSize: "16px",
                lineHeight: "1.8",
                color: "rgba(255, 255, 255, 0.8)",
                marginBottom: "20px",
              }}>
                Kami menggunakan layanan Firebase dari Google untuk menyimpan data Anda. Data disimpan di server yang aman dengan enkripsi dan protokol keamanan industri standar. Kami menerapkan langkah-langkah keamanan yang tepat untuk melindungi terhadap akses, perubahan, pengungkapan, atau penghancuran data yang tidak sah.
              </p>
              
              <h3 style={{
                fontWeight: "500",
                fontSize: "22px",
                color: "#ffffff",
                margin: "0 0 12px 0",
                opacity: 0.9,
              }}>
                4.2. Retensi Data
              </h3>
              <p style={{ 
                fontWeight: "400",
                fontSize: "16px",
                lineHeight: "1.8",
                color: "rgba(255, 255, 255, 0.8)",
                marginBottom: "0",
              }}>
                Kami akan menyimpan informasi pribadi Anda selama diperlukan untuk memenuhi tujuan yang diuraikan dalam Kebijakan Privasi ini, kecuali periode penyimpanan yang lebih lama diperlukan atau diizinkan oleh hukum. Setelah tujuan penggunaan selesai, kami akan menghapus atau menganonimkan data Anda.
              </p>
            </div>

            {/* 5. Berbagi Informasi */}
            <div style={{ marginBottom: "50px" }}>
              <h2 style={{ 
                fontWeight: "600", 
                fontSize: "42px", 
                margin: "0 0 24px 0",
                color: "#ffffff",
                letterSpacing: "-0.02em",
              }}>
                5. Berbagi Informasi
              </h2>
              
              <h3 style={{
                fontWeight: "500",
                fontSize: "22px",
                color: "#ffffff",
                margin: "0 0 12px 0",
                opacity: 0.9,
              }}>
                5.1. Pihak Ketiga
              </h3>
              <p style={{ 
                fontWeight: "400",
                fontSize: "16px",
                lineHeight: "1.8",
                color: "rgba(255, 255, 255, 0.8)",
                marginBottom: "12px",
              }}>
                Kami tidak menjual, memperdagangkan, atau menyewakan informasi pribadi Anda kepada pihak ketiga. Namun, kami dapat berbagi informasi dalam situasi berikut:
              </p>
              <ul style={{ 
                fontWeight: "400",
                fontSize: "16px",
                lineHeight: "1.8",
                color: "rgba(255, 255, 255, 0.8)",
                marginBottom: "20px",
                paddingLeft: "2rem",
              }}>
                <li><strong style={{ color: "#ffffff" }}>5.1.1.</strong> Dengan penyedia layanan pihak ketiga yang membantu kami mengoperasikan Layanan</li>
                <li><strong style={{ color: "#ffffff" }}>5.1.2.</strong> Jika diwajibkan oleh hukum atau untuk merespons proses hukum</li>
                <li><strong style={{ color: "#ffffff" }}>5.1.3.</strong> Untuk melindungi hak, properti, atau keselamatan kami atau orang lain</li>
                <li><strong style={{ color: "#ffffff" }}>5.1.4.</strong> Dengan persetujuan eksplisit Anda</li>
              </ul>
              
              <h3 style={{
                fontWeight: "500",
                fontSize: "22px",
                color: "#ffffff",
                margin: "0 0 12px 0",
                opacity: 0.9,
              }}>
                5.2. Transfer Internasional
              </h3>
              <p style={{ 
                fontWeight: "400",
                fontSize: "16px",
                lineHeight: "1.8",
                color: "rgba(255, 255, 255, 0.8)",
                marginBottom: "0",
              }}>
                Informasi Anda dapat ditransfer ke dan disimpan di server yang berlokasi di luar negara Anda. Kami memastikan bahwa transfer tersebut dilindungi oleh perjanjian yang sesuai dan mematuhi standar perlindungan data yang berlaku.
              </p>
            </div>

            {/* 6. Hak Privasi */}
            <div style={{ marginBottom: "50px" }}>
              <h2 style={{ 
                fontWeight: "600", 
                fontSize: "42px", 
                margin: "0 0 24px 0",
                color: "#ffffff",
                letterSpacing: "-0.02em",
              }}>
                6. Hak Privasi Anda
              </h2>
              
              <h3 style={{
                fontWeight: "500",
                fontSize: "22px",
                color: "#ffffff",
                margin: "0 0 12px 0",
                opacity: 0.9,
              }}>
                6.1. Hak Pengguna
              </h3>
              <p style={{ 
                fontWeight: "400",
                fontSize: "16px",
                lineHeight: "1.8",
                color: "rgba(255, 255, 255, 0.8)",
                marginBottom: "12px",
              }}>
                Tergantung pada lokasi Anda, Anda mungkin memiliki hak tertentu terkait informasi pribadi Anda, termasuk:
              </p>
              <ul style={{ 
                fontWeight: "400",
                fontSize: "16px",
                lineHeight: "1.8",
                color: "rgba(255, 255, 255, 0.8)",
                marginBottom: "20px",
                paddingLeft: "2rem",
              }}>
                <li><strong style={{ color: "#ffffff" }}>6.1.1.</strong> Hak untuk mengakses informasi pribadi Anda</li>
                <li><strong style={{ color: "#ffffff" }}>6.1.2.</strong> Hak untuk memperbaiki informasi yang tidak akurat</li>
                <li><strong style={{ color: "#ffffff" }}>6.1.3.</strong> Hak untuk menghapus informasi pribadi Anda</li>
                <li><strong style={{ color: "#ffffff" }}>6.1.4.</strong> Hak untuk membatasi atau menolak pemrosesan</li>
                <li><strong style={{ color: "#ffffff" }}>6.1.5.</strong> Hak untuk portabilitas data</li>
              </ul>
              
              <h3 style={{
                fontWeight: "500",
                fontSize: "22px",
                color: "#ffffff",
                margin: "0 0 12px 0",
                opacity: 0.9,
              }}>
                6.2. Cara Menggunakan Hak
              </h3>
              <p style={{ 
                fontWeight: "400",
                fontSize: "16px",
                lineHeight: "1.8",
                color: "rgba(255, 255, 255, 0.8)",
                marginBottom: "0",
              }}>
                Untuk menggunakan hak-hak ini, silakan hubungi kami melalui informasi kontak yang tercantum di bagian 9. Kami akan merespons permintaan Anda dalam waktu 30 hari sesuai dengan peraturan yang berlaku.
              </p>
            </div>

            {/* 7. Cookie dan Teknologi Pelacakan */}
            <div style={{ marginBottom: "50px" }}>
              <h2 style={{ 
                fontWeight: "600", 
                fontSize: "42px", 
                margin: "0 0 24px 0",
                color: "#ffffff",
                letterSpacing: "-0.02em",
              }}>
                7. Cookie dan Teknologi Pelacakan
              </h2>
              
              <h3 style={{
                fontWeight: "500",
                fontSize: "22px",
                color: "#ffffff",
                margin: "0 0 12px 0",
                opacity: 0.9,
              }}>
                7.1. Jenis Cookie
              </h3>
              <p style={{ 
                fontWeight: "400",
                fontSize: "16px",
                lineHeight: "1.8",
                color: "rgba(255, 255, 255, 0.8)",
                marginBottom: "12px",
              }}>
                Kami menggunakan berbagai jenis cookie untuk meningkatkan pengalaman Anda:
              </p>
              <ul style={{ 
                fontWeight: "400",
                fontSize: "16px",
                lineHeight: "1.8",
                color: "rgba(255, 255, 255, 0.8)",
                marginBottom: "20px",
                paddingLeft: "2rem",
              }}>
                <li><strong style={{ color: "#ffffff" }}>7.1.1.</strong> <strong>Cookie Esensial:</strong> Diperlukan untuk fungsi dasar Layanan</li>
                <li><strong style={{ color: "#ffffff" }}>7.1.2.</strong> <strong>Cookie Preferensi:</strong> Mengingat pengaturan dan preferensi Anda</li>
                <li><strong style={{ color: "#ffffff" }}>7.1.3.</strong> <strong>Cookie Analitik:</strong> Membantu kami memahami bagaimana Anda menggunakan Layanan</li>
                <li><strong style={{ color: "#ffffff" }}>7.1.4.</strong> <strong>Cookie Pemasaran:</strong> Digunakan untuk menampilkan konten yang relevan</li>
              </ul>
              
              <h3 style={{
                fontWeight: "500",
                fontSize: "22px",
                color: "#ffffff",
                margin: "0 0 12px 0",
                opacity: 0.9,
              }}>
                7.2. Kontrol Cookie
              </h3>
              <p style={{ 
                fontWeight: "400",
                fontSize: "16px",
                lineHeight: "1.8",
                color: "rgba(255, 255, 255, 0.8)",
                marginBottom: "0",
              }}>
                Anda dapat menginstruksikan browser Anda untuk menolak semua cookie atau untuk menunjukkan kapan cookie dikirim. Namun, jika Anda tidak menerima cookie, beberapa bagian dari Layanan kami mungkin tidak berfungsi dengan baik. Anda juga dapat mengelola preferensi cookie melalui pengaturan browser Anda.
              </p>
            </div>

            {/* 8. Perubahan Kebijakan */}
            <div style={{ marginBottom: "50px" }}>
              <h2 style={{ 
                fontWeight: "600", 
                fontSize: "42px", 
                margin: "0 0 24px 0",
                color: "#ffffff",
                letterSpacing: "-0.02em",
              }}>
                8. Perubahan Kebijakan
              </h2>
              
              <h3 style={{
                fontWeight: "500",
                fontSize: "22px",
                color: "#ffffff",
                margin: "0 0 12px 0",
                opacity: 0.9,
              }}>
                8.1. Pembaruan Kebijakan
              </h3>
              <p style={{ 
                fontWeight: "400",
                fontSize: "16px",
                lineHeight: "1.8",
                color: "rgba(255, 255, 255, 0.8)",
                marginBottom: "20px",
              }}>
                Kami dapat memperbarui Kebijakan Privasi kami dari waktu ke waktu. Kami akan memberi tahu Anda tentang perubahan dengan memposting Kebijakan Privasi baru di halaman ini dan memperbarui tanggal "Terakhir diperbarui".
              </p>
              
              <h3 style={{
                fontWeight: "500",
                fontSize: "22px",
                color: "#ffffff",
                margin: "0 0 12px 0",
                opacity: 0.9,
              }}>
                8.2. Pemberitahuan
              </h3>
              <p style={{ 
                fontWeight: "400",
                fontSize: "16px",
                lineHeight: "1.8",
                color: "rgba(255, 255, 255, 0.8)",
                marginBottom: "0",
              }}>
                Anda disarankan untuk meninjau Kebijakan Privasi ini secara berkala untuk setiap perubahan. Perubahan akan berlaku efektif segera setelah diposting di halaman ini. Penggunaan Layanan Anda yang berkelanjutan setelah perubahan tersebut merupakan penerimaan Anda terhadap Kebijakan Privasi yang diperbarui.
              </p>
            </div>

            {/* 9. Hubungi Kami */}
            <div style={{ marginBottom: "0" }}>
              <h2 style={{ 
                fontWeight: "600", 
                fontSize: "42px", 
                margin: "0 0 24px 0",
                color: "#ffffff",
                letterSpacing: "-0.02em",
              }}>
                9. Hubungi Kami
              </h2>
              
              <h3 style={{
                fontWeight: "500",
                fontSize: "22px",
                color: "#ffffff",
                margin: "0 0 12px 0",
                opacity: 0.9,
              }}>
                9.1. Informasi Kontak
              </h3>
              <p style={{ 
                fontWeight: "400",
                fontSize: "16px",
                lineHeight: "1.8",
                color: "rgba(255, 255, 255, 0.8)",
                marginBottom: "12px",
              }}>
                Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, silakan hubungi kami melalui:
              </p>
              <ul style={{ 
                fontWeight: "400",
                fontSize: "16px",
                lineHeight: "1.8",
                color: "rgba(255, 255, 255, 0.8)",
                marginBottom: "20px",
                paddingLeft: "2rem",
              }}>
                <li><strong style={{ color: "#ffffff" }}>9.1.1.</strong> <strong>Email:</strong> privacy@wawa44.com</li>
                <li><strong style={{ color: "#ffffff" }}>9.1.2.</strong> <strong>Alamat:</strong> Jl. Contoh No. 123, Jakarta, Indonesia</li>
                <li><strong style={{ color: "#ffffff" }}>9.1.3.</strong> <strong>Telepon:</strong> +62 21 1234 5678</li>
              </ul>
              
              <h3 style={{
                fontWeight: "500",
                fontSize: "22px",
                color: "#ffffff",
                margin: "0 0 12px 0",
                opacity: 0.9,
              }}>
                9.2. Jam Operasional
              </h3>
              <p style={{ 
                fontWeight: "400",
                fontSize: "16px",
                lineHeight: "1.8",
                color: "rgba(255, 255, 255, 0.8)",
                marginBottom: "0",
              }}>
                Tim dukungan kami tersedia Senin-Jumat, 09.00-17.00 WIB. Kami akan merespons pertanyaan Anda dalam waktu 2x24 jam kerja.
              </p>
            </div>
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

      {/* FOOTER - Like main page */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "20px 40px",
          backgroundColor: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          zIndex: 50,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "32px",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "14px", fontWeight: 600, color: "#ffffff", fontFamily: "Helvetica, Arial, sans-serif" }}>
            © 2026 Menuru
          </span>
          <Link href="/privacy-policy">
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontFamily: "Helvetica, Arial, sans-serif", transition: "color 0.2s" }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#ffffff"}
              onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}
            >Privacy Policy</span>
          </Link>
          <Link href="/terms">
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontFamily: "Helvetica, Arial, sans-serif", transition: "color 0.2s" }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#ffffff"}
              onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}
            >Terms of Service</span>
          </Link>
          <Link href="/cookies">
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontFamily: "Helvetica, Arial, sans-serif", transition: "color 0.2s" }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#ffffff"}
              onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}
            >Cookies Policy</span>
          </Link>
        </div>
        <div
          style={{
            display: "flex",
            gap: "20px",
            alignItems: "center",
          }}
        >
          <Link href="/contact">
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontFamily: "Helvetica, Arial, sans-serif", transition: "color 0.2s" }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#ffffff"}
              onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}
            >Contact</span>
          </Link>
          <Link href="/about">
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontFamily: "Helvetica, Arial, sans-serif", transition: "color 0.2s" }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#ffffff"}
              onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.5)"}
            >About</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
