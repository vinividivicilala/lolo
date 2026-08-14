'use client';

import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyD_htQZ1TClnXKZGRJ4izbMQ02y6V3aNAQ",
  authDomain: "wawa44-58d1e.firebaseapp.com",
  databaseURL: "https://wawa44-58d1e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "wawa44-58d1e",
  storageBucket: "wawa44-58d1e.firebasestorage.app",
  messagingSenderId: "836899520599",
  appId: "1:836899520599:web:b346e4370ecfa9bb89e312",
  measurementId: "G-8LMP7F4BE9"
};

let app = null;
let auth = null;
let db = null;

if (typeof window !== "undefined") {
  app = getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApps()[0];

  auth = getAuth(app);
  db = getFirestore(app);
}

const FONT_FAMILY = "'Poppins', 'Poppins Fallback', sans-serif";

// SVG Icons
const NorthEastArrow = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 7L17 17M17 7V17H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function HomePage(): React.JSX.Element {
  const [showMain, setShowMain] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const preloaderRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLDivElement>(null);
  const menuOverlayRef = useRef<HTMLDivElement>(null);
  const aboutBoxRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  // Auth listener - mulai animasi preloader
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, () => {
      setTimeout(() => startPreloaderAnimation(), 500);
    });
    return () => unsubscribe();
  }, []);

  const startPreloaderAnimation = () => {
    const tl = gsap.timeline({
      onComplete: () => {
        if (preloaderRef.current) {
          gsap.to(preloaderRef.current, {
            opacity: 0,
            duration: 0.6,
            ease: "power2.inOut",
            onComplete: () => {
              setShowMain(true);
              initScrollAnimations();
            }
          });
        }
      }
    });

    gsap.set(textRef.current, { y: 100, opacity: 0 });

    tl.to(textRef.current, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: "back.out(1.7)"
    })
    .to(textRef.current, { duration: 0.6 })
    .to(textRef.current, {
      opacity: 0,
      y: -20,
      scale: 0.9,
      duration: 0.4,
      ease: "power2.out",
      onComplete: () => {
        if (textRef.current) textRef.current.textContent = "Note";
      }
    })
    .to(textRef.current, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.6,
      ease: "back.out(1.7)"
    })
    .to(textRef.current, { duration: 0.8 })
    .to(textRef.current, {
      scale: 0.3,
      opacity: 0,
      duration: 0.7,
      ease: "power2.in"
    })
    .to(preloaderRef.current, {
      scale: 0.95,
      opacity: 0.8,
      duration: 0.3,
      ease: "power2.inOut"
    }, "-=0.3");
  };

  const initScrollAnimations = () => {
    // Animasi judul: dari 48px ke 400px
    if (titleRef.current) {
      gsap.to(titleRef.current, {
        fontSize: "400px",
        fontWeight: 400,
        ease: "none",
        scrollTrigger: {
          trigger: "body",
          start: "top top",
          end: "bottom bottom",
          scrub: 1.2,
          invalidateOnRefresh: true,
        }
      });
    }

    // Scroll-driven text color reveal untuk highlightRef
    if (highlightRef.current) {
      const words = highlightRef.current.querySelectorAll('.word-highlight');
      words.forEach((word) => {
        const el = word as HTMLElement;
        gsap.fromTo(el,
          { color: "#666666" },
          {
            color: "#0D3CFC",
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top 80%",
              end: "top 40%",
              scrub: 1,
            }
          }
        );
      });
    }
  };

  const toggleMenu = () => {
    if (!isMenuOpen) {
      setIsMenuOpen(true);
      if (menuOverlayRef.current) {
        gsap.fromTo(menuOverlayRef.current,
          { y: "-100%", opacity: 0 },
          { y: "0%", opacity: 1, duration: 0.6, ease: "power2.out" }
        );
      }
    } else {
      if (menuOverlayRef.current) {
        gsap.to(menuOverlayRef.current, {
          y: "-100%",
          opacity: 0,
          duration: 0.5,
          ease: "power2.in",
          onComplete: () => {
            setIsMenuOpen(false);
          }
        });
      } else {
        setIsMenuOpen(false);
      }
    }
  };

  if (!showMain) {
    return (
      <div
        ref={preloaderRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          fontFamily: FONT_FAMILY,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "40px", overflow: "hidden" }}>
          <span
            style={{
              fontSize: "100px",
              fontWeight: 700,
              color: "#0D3CFC",
              fontFamily: FONT_FAMILY,
              letterSpacing: "-0.03em",
            }}
          >
            Menuru
          </span>
          <span
            ref={textRef}
            style={{
              fontSize: "50px",
              fontWeight: 600,
              color: "#000000",
              fontFamily: FONT_FAMILY,
              letterSpacing: "-0.02em",
              display: "inline-block",
              willChange: "transform, opacity",
            }}
          >
            Shop
          </span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Menuru Official | Home</title>
        <meta name="description" content="Menuru Brand from Love yourself" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#0D3CFC" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Menuru" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="icon" href="/images/ai.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/images/ai.jpg" />
        <meta property="og:title" content="Menuru Official | Home" />
        <meta property="og:description" content="Menuru Brand from Love yourself" />
        <meta property="og:image" content="/images/ai.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Menuru Official | Home" />
        <meta name="twitter:description" content="Menuru Brand from Love yourself" />
        <meta name="twitter:image" content="/images/ai.jpg" />
      </Head>

      <div
        style={{
          minHeight: "300vh",
          backgroundColor: "#ffffff",
          margin: 0,
          padding: 0,
          position: "relative",
          fontFamily: FONT_FAMILY,
          overflow: "visible",
        }}
      >

        {/* ===== LEFT SIDE: About Us Box (fixed) ===== */}
        <div
          ref={aboutBoxRef}
          style={{
            position: "fixed",
            left: "40px",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 15,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid #0D3CFC",
            borderRadius: "8px",
            padding: "16px 20px",
            backgroundColor: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(4px)",
            cursor: "pointer",
            transition: "background-color 0.3s ease, color 0.3s ease",
            writingMode: "vertical-rl",
            letterSpacing: "0.1em",
            userSelect: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#0D3CFC";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.85)";
          }}
        >
          <span
            style={{
              fontSize: "20px",
              fontWeight: 600,
              color: "#0D3CFC",
              fontFamily: FONT_FAMILY,
              transition: "color 0.3s ease",
              writingMode: "vertical-rl",
              letterSpacing: "0.15em",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#ffffff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#0D3CFC";
            }}
          >
            About Us
          </span>
        </div>

        {/* ===== RIGHT-CENTER: Scroll-driven text ===== */}
        <div
          ref={highlightRef}
          style={{
            position: "absolute",
            top: "110vh",
            right: "5%",
            width: "55%",
            maxWidth: "900px",
            textAlign: "left",
            padding: "60px 20px",
            fontFamily: FONT_FAMILY,
            pointerEvents: "none",
          }}
        >
          {/* Baris 1: "About note, shop, and donasi" dengan highlight */}
          <div style={{ fontSize: "56px", fontWeight: 400, lineHeight: 1.3, marginBottom: "24px" }}>
            <span style={{ color: "#666666" }}>About </span>
            <span className="word-highlight" style={{ color: "#666666", transition: "color 0.3s" }}>note</span>
            <span style={{ color: "#666666" }}>, </span>
            <span className="word-highlight" style={{ color: "#666666", transition: "color 0.3s" }}>shop</span>
            <span style={{ color: "#666666" }}>, and </span>
            <span className="word-highlight" style={{ color: "#666666", transition: "color 0.3s" }}>donasi</span>
          </div>

          {/* Baris 2: paragraf deskriptif */}
          <div style={{ fontSize: "28px", fontWeight: 300, lineHeight: 1.6, color: "#666666" }}>
            <p style={{ margin: 0, padding: 0 }}>
              We provide a platform for you to take notes, find ideas,
              <br />
              and donate money to those in need.
            </p>
            <p style={{ margin: "16px 0 0 0", padding: 0, fontSize: "24px", fontWeight: 300, color: "#888888" }}>
              Menuru is a place where creativity meets generosity.
            </p>
          </div>
        </div>

        {/* ===== Judul di kiri atas ===== */}
        <div
          style={{
            position: "fixed",
            top: "40px",
            left: "40px",
            zIndex: 15,
          }}
        >
          <h1
            ref={titleRef}
            className="title"
            style={{
              fontSize: "48px",
              fontWeight: 700,
              color: "#000000",
              fontFamily: FONT_FAMILY,
              letterSpacing: "-0.03em",
              margin: 0,
              padding: 0,
              lineHeight: 1,
              transformOrigin: "left center",
            }}
          >
            Menuru
          </h1>
        </div>

        {/* ===== Subtitle - 2 baris ===== */}
        <div
          ref={subtitleRef}
          className="subtitle"
          style={{
            position: "fixed",
            top: "150px",
            left: "40px",
            zIndex: 15,
            textAlign: "left",
          }}
        >
          <p
            style={{
              fontSize: "60px",
              fontWeight: 400,
              color: "#0D3CFC",
              fontFamily: FONT_FAMILY,
              lineHeight: 1.2,
              margin: 0,
              padding: 0,
              paddingBottom: "30px",
              whiteSpace: "pre-line",
            }}
          >
            {`You can take notes, find ideas,\nand donate money to those in need`}
          </p>
        </div>

        {/* ===== Tombol "Let's build now" + Arrow ===== */}
        <div
          style={{
            position: "fixed",
            top: "400px",
            left: "40px",
            zIndex: 15,
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          {/* Button */}
          <div
            ref={buttonRef}
            className="cta-button"
            style={{
              display: "inline-block",
              border: "2px solid #0D3CFC",
              borderRadius: "8px",
              padding: "12px 28px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              backgroundColor: "transparent",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#0D3CFC";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <span
              style={{
                fontSize: "18px",
                fontWeight: 500,
                color: "#0D3CFC",
                fontFamily: FONT_FAMILY,
                letterSpacing: "0.02em",
                transition: "color 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#ffffff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#0D3CFC";
              }}
            >
              Let's build now
            </span>
          </div>

          {/* Arrow box */}
          <div
            ref={arrowRef}
            className="arrow-box"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #0D3CFC",
              borderRadius: "8px",
              padding: "10px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              backgroundColor: "transparent",
              color: "#0D3CFC",
              width: "50px",
              height: "50px",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#0D3CFC";
              e.currentTarget.style.color = "#ffffff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#0D3CFC";
            }}
          >
            <NorthEastArrow size={24} />
          </div>
        </div>

        {/* ===== Menu Button ===== */}
        <div
          ref={menuButtonRef}
          className="menu-button"
          style={{
            position: "fixed",
            top: "40px",
            right: "40px",
            zIndex: 20,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            border: "2px solid #0D3CFC",
            borderRadius: "8px",
            padding: "8px 16px",
            transition: "all 0.3s ease",
            backgroundColor: "transparent",
          }}
          onClick={toggleMenu}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#0D3CFC";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <span
            style={{
              fontSize: "40px",
              fontWeight: 300,
              color: "#0D3CFC",
              fontFamily: FONT_FAMILY,
              transition: "transform 0.4s ease, color 0.3s ease",
              transform: isMenuOpen ? "rotate(45deg)" : "rotate(0deg)",
              lineHeight: 1,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#ffffff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#0D3CFC";
            }}
          >
            +
          </span>
          <span
            style={{
              fontSize: "40px",
              fontWeight: 500,
              color: "#0D3CFC",
              fontFamily: FONT_FAMILY,
              letterSpacing: "0.02em",
              display: "inline-block",
              transition: "color 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#ffffff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#0D3CFC";
            }}
          >
            Menu
          </span>
        </div>

        {/* ===== Menu Overlay ===== */}
        <div
          ref={menuOverlayRef}
          className="menu-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "#0D3CFC",
            zIndex: 19,
            display: isMenuOpen ? "flex" : "none",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            transform: "translateY(-100%)",
            opacity: 0,
          }}
        />

        {/* ===== DUMMY TEXT DI BAWAH (biar bisa scroll) ===== */}
        <div
          style={{
            position: "absolute",
            bottom: "60px",
            left: "50%",
            transform: "translateX(-50%)",
            textAlign: "center",
            color: "#ccc",
            fontSize: "18px",
            fontFamily: FONT_FAMILY,
            opacity: 0.4,
            padding: "40px 20px",
            width: "100%",
            maxWidth: "800px",
            pointerEvents: "none",
          }}
        >
          <p style={{ margin: "0 0 12px 0", fontSize: "22px", fontWeight: 300, letterSpacing: "0.05em" }}>
            ——— scroll more ———
          </p>
          <p style={{ margin: "0 0 6px 0", fontSize: "16px", fontWeight: 300 }}>
            © 2026 Menuru. All rights reserved.
          </p>
          <p style={{ margin: "0", fontSize: "14px", fontWeight: 300, color: "#ddd" }}>
            Built with ❤️ from Love yourself
          </p>
          <div style={{ marginTop: "24px", display: "flex", justifyContent: "center", gap: "32px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "13px", color: "#d0d0d0" }}>Privacy Policy</span>
            <span style={{ fontSize: "13px", color: "#d0d0d0" }}>Terms of Service</span>
            <span style={{ fontSize: "13px", color: "#d0d0d0" }}>Contact</span>
          </div>
          <div style={{ marginTop: "12px", display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "12px", color: "#d5d5d5" }}>Instagram</span>
            <span style={{ fontSize: "12px", color: "#d5d5d5" }}>Twitter</span>
            <span style={{ fontSize: "12px", color: "#d5d5d5" }}>YouTube</span>
          </div>
        </div>

        {/* Spacer besar agar scroll panjang */}
        <div style={{ height: "220vh" }} />
      </div>

      <style jsx global>{`
        body {
          overflow: auto !important;
          -ms-overflow-style: none;
          scrollbar-width: thin;
        }
        body::-webkit-scrollbar {
          width: 6px;
        }
        body::-webkit-scrollbar-track {
          background: #f0f0f0;
        }
        body::-webkit-scrollbar-thumb {
          background: #0D3CFC;
          border-radius: 4px;
        }

        @media (max-width: 1024px) {
          .subtitle p {
            font-size: 48px !important;
          }
          .subtitle {
            top: 130px !important;
          }
          .title {
            font-size: 36px !important;
          }
          [ref="highlightRef"] {
            width: 50% !important;
            right: 4% !important;
          }
          [ref="highlightRef"] div:first-child {
            font-size: 42px !important;
          }
          [ref="highlightRef"] div:last-child {
            font-size: 22px !important;
          }
          [ref="highlightRef"] div:last-child p:last-child {
            font-size: 20px !important;
          }
          .cta-button {
            padding: 10px 22px !important;
          }
          .cta-button span {
            font-size: 16px !important;
          }
          .arrow-box {
            width: 44px !important;
            height: 44px !important;
            padding: 8px !important;
          }
          .menu-button {
            top: 30px !important;
            right: 30px !important;
            padding: 6px 12px !important;
          }
          .menu-button span {
            font-size: 32px !important;
          }
          [ref="aboutBoxRef"] {
            left: 24px !important;
            padding: 12px 14px !important;
          }
          [ref="aboutBoxRef"] span {
            font-size: 16px !important;
          }
        }

        @media (max-width: 768px) {
          .subtitle p {
            font-size: 36px !important;
          }
          .subtitle {
            top: 110px !important;
            left: 20px !important;
          }
          .title {
            font-size: 28px !important;
            top: 20px !important;
            left: 20px !important;
          }
          [ref="highlightRef"] {
            width: 65% !important;
            right: 3% !important;
            top: 100vh !important;
          }
          [ref="highlightRef"] div:first-child {
            font-size: 32px !important;
          }
          [ref="highlightRef"] div:last-child {
            font-size: 18px !important;
          }
          [ref="highlightRef"] div:last-child p:last-child {
            font-size: 16px !important;
          }
          .cta-button {
            padding: 8px 18px !important;
          }
          .cta-button span {
            font-size: 14px !important;
          }
          .arrow-box {
            width: 38px !important;
            height: 38px !important;
            padding: 6px !important;
          }
          .arrow-box svg {
            width: 18px !important;
            height: 18px !important;
          }
          .menu-button {
            top: 20px !important;
            right: 20px !important;
            padding: 4px 10px !important;
          }
          .menu-button span {
            font-size: 28px !important;
          }
          [ref="aboutBoxRef"] {
            left: 16px !important;
            padding: 10px 12px !important;
          }
          [ref="aboutBoxRef"] span {
            font-size: 14px !important;
          }
          div[style*="position: fixed; top: 400px; left: 40px;"] {
            top: 290px !important;
            left: 20px !important;
            gap: 8px !important;
          }
        }

        @media (max-width: 480px) {
          .subtitle p {
            font-size: 24px !important;
          }
          .subtitle {
            top: 90px !important;
            left: 16px !important;
          }
          .title {
            font-size: 22px !important;
            top: 16px !important;
            left: 16px !important;
          }
          [ref="highlightRef"] {
            width: 78% !important;
            right: 2% !important;
            top: 95vh !important;
          }
          [ref="highlightRef"] div:first-child {
            font-size: 24px !important;
          }
          [ref="highlightRef"] div:last-child {
            font-size: 15px !important;
          }
          [ref="highlightRef"] div:last-child p:last-child {
            font-size: 14px !important;
          }
          .cta-button {
            padding: 6px 14px !important;
          }
          .cta-button span {
            font-size: 12px !important;
          }
          .arrow-box {
            width: 32px !important;
            height: 32px !important;
            padding: 4px !important;
          }
          .arrow-box svg {
            width: 14px !important;
            height: 14px !important;
          }
          .menu-button {
            top: 16px !important;
            right: 16px !important;
            padding: 4px 8px !important;
          }
          .menu-button span {
            font-size: 24px !important;
          }
          [ref="aboutBoxRef"] {
            left: 12px !important;
            padding: 8px 10px !important;
          }
          [ref="aboutBoxRef"] span {
            font-size: 12px !important;
          }
          div[style*="position: fixed; top: 400px; left: 40px;"] {
            top: 230px !important;
            left: 16px !important;
            gap: 6px !important;
          }
        }
      `}</style>
    </>
  );
}
