'use client';

import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

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
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
}

const FONT_FAMILY = "'Poppins', 'Poppins Fallback', sans-serif";

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
  const sectionsRef = useRef<(HTMLDivElement | null)[]>([]);
  const mainContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, () => {
      setTimeout(() => {
        if (preloaderRef.current) {
          preloaderRef.current.style.opacity = "0";
          preloaderRef.current.style.transition = "opacity 0.6s ease";
          setTimeout(() => {
            setShowMain(true);
            initScrollAnimations();
          }, 600);
        }
      }, 1500);
    });
    return () => unsubscribe();
  }, []);

  const initScrollAnimations = () => {
    // Smooth scroll with GSAP
    gsap.to(window, {
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 1.5,
        onUpdate: (self) => {
          // Tidak perlu melakukan apa-apa, hanya untuk smooth scroll
        }
      }
    });

    // Animasi section background berubah menjadi biru saat scroll
    const sections = sectionsRef.current.filter(s => s !== null);
    sections.forEach((section, index) => {
      if (!section) return;
      
      const isEven = index % 2 === 0;
      
      gsap.to(section, {
        backgroundColor: isEven ? "#0D3CFC" : "#ffffff",
        color: isEven ? "#ffffff" : "#000000",
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "top top",
          scrub: 1.5,
          invalidateOnRefresh: true,
        }
      });

      // Animasi teks di dalam section
      const textElements = section.querySelectorAll('.section-text');
      textElements.forEach((el) => {
        gsap.to(el, {
          color: isEven ? "#ffffff" : "#0D3CFC",
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "top top",
            scrub: 1.5,
            invalidateOnRefresh: true,
          }
        });
      });
    });
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
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
          <span style={{ fontSize: "100px", fontWeight: 700, color: "#0D3CFC", fontFamily: FONT_FAMILY, letterSpacing: "-0.03em" }}>Menuru</span>
          <span ref={textRef} style={{ fontSize: "50px", fontWeight: 600, color: "#000000", fontFamily: FONT_FAMILY, letterSpacing: "-0.02em", display: "inline-block" }}>Shop</span>
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
        ref={mainContainerRef}
        style={{
          minHeight: "100vh",
          backgroundColor: "#ffffff",
          margin: 0,
          padding: 0,
          position: "relative",
          fontFamily: FONT_FAMILY,
          overflowX: "hidden",
        }}
      >
        {/* JUDUL - FIXED TOP LEFT */}
        <div style={{ position: "fixed", top: "40px", left: "40px", zIndex: 15 }}>
          <h1 ref={titleRef} style={{ fontSize: "48px", fontWeight: 700, color: "#000000", fontFamily: FONT_FAMILY, letterSpacing: "-0.03em", margin: 0, padding: 0, lineHeight: 1 }}>Menuru</h1>
        </div>

        {/* MENU BUTTON - FIXED TOP RIGHT */}
        <div
          ref={menuButtonRef}
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
            backgroundColor: isMenuOpen ? "#0D3CFC" : "transparent",
            transition: "all 0.3s ease",
          }}
          onClick={toggleMenu}
        >
          <span style={{ fontSize: "40px", fontWeight: 300, color: isMenuOpen ? "#ffffff" : "#0D3CFC", fontFamily: FONT_FAMILY, transition: "transform 0.4s ease, color 0.3s ease", transform: isMenuOpen ? "rotate(45deg)" : "rotate(0deg)", lineHeight: 1 }}>+</span>
          <span style={{ fontSize: "40px", fontWeight: 500, color: isMenuOpen ? "#ffffff" : "#0D3CFC", fontFamily: FONT_FAMILY, letterSpacing: "0.02em", display: "inline-block", transition: "color 0.3s ease" }}>Menu</span>
        </div>

        {/* MENU OVERLAY - FULL BLUE */}
        {isMenuOpen && (
          <div
            ref={menuOverlayRef}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "#0D3CFC",
              zIndex: 19,
              animation: "slideDown 0.6s ease forwards",
            }}
          />
        )}

        {/* SECTION 1 - HITAM PUTIH */}
        <div
          ref={(el) => { if (el) sectionsRef.current[0] = el; }}
          style={{
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px",
            backgroundColor: "#ffffff",
            transition: "background-color 0.3s ease",
          }}
        >
          <div style={{ maxWidth: "900px", textAlign: "left" }}>
            <p className="section-text" style={{ fontSize: "60px", fontWeight: 400, color: "#0D3CFC", fontFamily: FONT_FAMILY, lineHeight: 1.2, margin: 0, whiteSpace: "pre-line" }}>
              {`You can take notes, find ideas,\nand donate money to those in need`}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "20px", marginTop: "40px" }}>
              <div
                ref={buttonRef}
                style={{
                  display: "inline-block",
                  border: "2px solid #0D3CFC",
                  borderRadius: "8px",
                  padding: "12px 28px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  backgroundColor: "transparent",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#0D3CFC"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                <span className="section-text" style={{ fontSize: "18px", fontWeight: 500, color: "#0D3CFC", fontFamily: FONT_FAMILY, letterSpacing: "0.02em", transition: "color 0.3s ease" }} onMouseEnter={(e) => e.currentTarget.style.color = "#ffffff"} onMouseLeave={(e) => e.currentTarget.style.color = "#0D3CFC"}>Let's build now</span>
              </div>
              <div
                ref={arrowRef}
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
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#0D3CFC"; e.currentTarget.style.color = "#ffffff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#0D3CFC"; }}
              >
                <NorthEastArrow size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2 - BIRU */}
        <div
          ref={(el) => { if (el) sectionsRef.current[1] = el; }}
          style={{
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px",
            backgroundColor: "#0D3CFC",
            transition: "background-color 0.3s ease",
          }}
        >
          <div style={{ maxWidth: "900px", textAlign: "left" }}>
            <p className="section-text" style={{ fontSize: "60px", fontWeight: 400, color: "#ffffff", fontFamily: FONT_FAMILY, lineHeight: 1.2, margin: 0 }}>
              Explore More
            </p>
            <p className="section-text" style={{ fontSize: "24px", fontWeight: 300, color: "rgba(255,255,255,0.8)", fontFamily: FONT_FAMILY, marginTop: "20px" }}>
              Discover new features and opportunities
            </p>
          </div>
        </div>

        {/* SECTION 3 - PUTIH */}
        <div
          ref={(el) => { if (el) sectionsRef.current[2] = el; }}
          style={{
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px",
            backgroundColor: "#ffffff",
            transition: "background-color 0.3s ease",
          }}
        >
          <div style={{ maxWidth: "900px", textAlign: "left" }}>
            <p className="section-text" style={{ fontSize: "60px", fontWeight: 400, color: "#0D3CFC", fontFamily: FONT_FAMILY, lineHeight: 1.2, margin: 0 }}>
              Join Our Community
            </p>
            <p className="section-text" style={{ fontSize: "24px", fontWeight: 300, color: "#666", fontFamily: FONT_FAMILY, marginTop: "20px" }}>
              Be part of something bigger
            </p>
          </div>
        </div>

        {/* SECTION 4 - BIRU */}
        <div
          ref={(el) => { if (el) sectionsRef.current[3] = el; }}
          style={{
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px",
            backgroundColor: "#0D3CFC",
            transition: "background-color 0.3s ease",
          }}
        >
          <div style={{ maxWidth: "900px", textAlign: "left" }}>
            <p className="section-text" style={{ fontSize: "60px", fontWeight: 400, color: "#ffffff", fontFamily: FONT_FAMILY, lineHeight: 1.2, margin: 0 }}>
              Get Started Today
            </p>
            <p className="section-text" style={{ fontSize: "24px", fontWeight: 300, color: "rgba(255,255,255,0.8)", fontFamily: FONT_FAMILY, marginTop: "20px" }}>
              Start your journey with Menuru
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0%);
            opacity: 1;
          }
        }
        body {
          overflow: auto !important;
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        body::-webkit-scrollbar {
          display: none;
        }
        html {
          scroll-behavior: smooth;
        }

        @media (max-width: 1024px) {
          .section-text {
            font-size: 48px !important;
          }
          .title {
            font-size: 36px !important;
          }
          .menu-button span {
            font-size: 32px !important;
          }
        }
        @media (max-width: 768px) {
          .section-text {
            font-size: 36px !important;
          }
          .title {
            font-size: 28px !important;
          }
          .menu-button span {
            font-size: 28px !important;
          }
          .cta-button {
            padding: 8px 18px !important;
          }
          .cta-button span {
            font-size: 14px !important;
          }
          .arrow-box {
            width: 40px !important;
            height: 40px !important;
            padding: 8px !important;
          }
          .arrow-box svg {
            width: 18px !important;
            height: 18px !important;
          }
        }
        @media (max-width: 480px) {
          .section-text {
            font-size: 24px !important;
          }
          .title {
            font-size: 22px !important;
          }
          .menu-button span {
            font-size: 24px !important;
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
            padding: 6px !important;
          }
          .arrow-box svg {
            width: 14px !important;
            height: 14px !important;
          }
        }
      `}</style>
    </>
  );
}
