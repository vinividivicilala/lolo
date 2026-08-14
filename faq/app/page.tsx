'use client';

import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
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

const ArrowRight = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ArrowDown = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 5V19M12 19L19 12M12 19L5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
  const timelineRef = useRef<HTMLDivElement>(null);
  const timelineItemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const aboutRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

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
              // Refresh ScrollTrigger setelah showMain
              setTimeout(() => {
                ScrollTrigger.refresh();
                initScrollAnimations();
                initTimelineAnimations();
              }, 200);
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
    // Animasi judul: dari 48px ke 400px saat scroll ke bawah
    if (titleRef.current) {
      gsap.to(titleRef.current, {
        fontSize: "400px",
        fontWeight: 400,
        ease: "none",
        scrollTrigger: {
          trigger: "body",
          start: "top top",
          end: "bottom bottom",
          scrub: 1.5,
          invalidateOnRefresh: true,
        }
      });
    }
  };

  const initTimelineAnimations = () => {
    const items = timelineItemsRef.current.filter(el => el !== null);
    if (items.length === 0 || !timelineRef.current) return;

    // Set initial positions
    gsap.set(items[0], { y: 0, opacity: 1, scale: 1 });
    gsap.set(items[1], { y: 100, opacity: 0.6, scale: 0.9 });
    gsap.set(items[2], { y: 200, opacity: 0.3, scale: 0.8 });

    // Create timeline with ScrollTrigger
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: timelineRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 1.5,
        pin: true,
        invalidateOnRefresh: true,
      }
    });

    // Item 1 stays in place, Item 2 moves up to Item 1 position
    tl.to(items[1], {
      y: 0,
      opacity: 1,
      scale: 1,
      duration: 1,
      ease: "power2.inOut"
    }, 0)
    // Item 3 moves up to Item 1 position
    .to(items[2], {
      y: 0,
      opacity: 1,
      scale: 1,
      duration: 1,
      ease: "power2.inOut"
    }, 0.5)
    // Item 1 moves up and fades out slightly
    .to(items[0], {
      y: -50,
      opacity: 0.3,
      scale: 0.8,
      duration: 1,
      ease: "power2.inOut"
    }, 0.7)
    // Reset all to final positions
    .to([items[0], items[1], items[2]], {
      y: 0,
      opacity: 1,
      scale: 1,
      duration: 0.5,
      ease: "power2.inOut"
    }, 1.5);
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

      {/* MAIN CONTAINER - semua halaman warna putih */}
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#ffffff",
          margin: 0,
          padding: 0,
          position: "relative",
          fontFamily: FONT_FAMILY,
        }}
      >
        {/* HERO SECTION - Konten yang ikut scroll */}
        <div
          ref={heroRef}
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingLeft: "40px",
            paddingRight: "40px",
            backgroundColor: "#ffffff",
          }}
        >
          {/* Judul - ikut scroll tapi tetap di posisi */}
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
              position: "relative",
              top: "0",
              left: "0",
            }}
          >
            Menuru
          </h1>

          {/* Subtitle */}
          <div
            ref={subtitleRef}
            className="subtitle"
            style={{
              marginTop: "30px",
              textAlign: "left",
              position: "relative",
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

          {/* Tombol dan Arrow - ikut scroll */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "20px" }}>
            <div
              ref={buttonRef}
              className="cta-button"
              style={{
                display: "inline-block",
                border: "2px solid #0D3CFC",
                borderRadius: "8px",
                padding: "12px 28px",
                cursor: "pointer",
                backgroundColor: "transparent",
              }}
            >
              <span
                style={{
                  fontSize: "18px",
                  fontWeight: 500,
                  color: "#0D3CFC",
                  fontFamily: FONT_FAMILY,
                  letterSpacing: "0.02em",
                }}
              >
                Let's build now
              </span>
            </div>

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
                backgroundColor: "#0D3CFC",
                color: "#ffffff",
                width: "50px",
                height: "50px",
              }}
            >
              <NorthEastArrow size={24} />
            </div>
          </div>
        </div>

        {/* NAVBAR - FIXED di atas */}
        <div
          style={{
            position: "fixed",
            top: "40px",
            right: "40px",
            left: "40px",
            zIndex: 100,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "20px",
            pointerEvents: "none",
          }}
        >
          {/* Get in Touch */}
          <Link href="/contact" style={{ pointerEvents: "auto" }}>
            <div
              className="get-in-touch"
              style={{
                display: "inline-block",
                border: "2px solid #0D3CFC",
                borderRadius: "8px",
                padding: "8px 16px",
                cursor: "pointer",
                backgroundColor: "transparent",
              }}
            >
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: 500,
                  color: "#0D3CFC",
                  fontFamily: FONT_FAMILY,
                  display: "inline-block",
                }}
              >
                Get in touch
              </span>
            </div>
          </Link>

          {/* Arrow Right box */}
          <Link href="/contact" style={{ pointerEvents: "auto" }}>
            <div
              className="arrow-right-box"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid #0D3CFC",
                borderRadius: "8px",
                padding: "10px",
                cursor: "pointer",
                backgroundColor: "#0D3CFC",
                color: "#ffffff",
                width: "40px",
                height: "40px",
              }}
            >
              <ArrowRight size={20} />
            </div>
          </Link>

          {/* Pusat Bantuan */}
          <Link href="/pusat-bantuan" style={{ pointerEvents: "auto" }}>
            <div
              className="pusat-bantuan"
              style={{
                display: "inline-block",
                border: "2px solid #0D3CFC",
                borderRadius: "8px",
                padding: "8px 16px",
                cursor: "pointer",
                backgroundColor: "transparent",
              }}
            >
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: 500,
                  color: "#0D3CFC",
                  fontFamily: FONT_FAMILY,
                  display: "inline-block",
                }}
              >
                Pusat Bantuan
              </span>
            </div>
          </Link>

          {/* Menu Text */}
          <div
            className="menu-button-text"
            style={{
              display: "inline-block",
              border: "2px solid #0D3CFC",
              borderRadius: "8px",
              padding: "8px 16px",
              cursor: "pointer",
              backgroundColor: "transparent",
              pointerEvents: "auto",
            }}
            onClick={toggleMenu}
          >
            <span
              style={{
                fontSize: "16px",
                fontWeight: 500,
                color: "#0D3CFC",
                fontFamily: FONT_FAMILY,
                letterSpacing: "0.02em",
                display: "inline-block",
              }}
            >
              Menu
            </span>
          </div>

          {/* Plus box */}
          <div
            className="plus-box"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #0D3CFC",
              borderRadius: "8px",
              padding: "10px",
              cursor: "pointer",
              backgroundColor: "#0D3CFC",
              color: "#ffffff",
              width: "40px",
              height: "40px",
              pointerEvents: "auto",
            }}
            onClick={toggleMenu}
          >
            <span
              style={{
                fontSize: "32px",
                fontWeight: 300,
                fontFamily: FONT_FAMILY,
                transition: "transform 0.4s ease",
                transform: isMenuOpen ? "rotate(45deg)" : "rotate(0deg)",
                lineHeight: 1,
              }}
            >
              +
            </span>
          </div>
        </div>

        {/* Menu Overlay */}
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
            zIndex: 99,
            display: isMenuOpen ? "flex" : "none",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            transform: "translateY(-100%)",
            opacity: 0,
          }}
        />

        {/* SPACER - agar konten bisa di-scroll */}
        <div style={{ height: "100vh" }} />

        {/* ABOUT SECTION - warna putih */}
        <div
          ref={aboutRef}
          style={{
            position: "relative",
            padding: "100px 40px",
            backgroundColor: "#ffffff",
            width: "100%",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
              width: "100%",
              textAlign: "center",
            }}
          >
            <h2
              style={{
                fontSize: "80px",
                fontWeight: 700,
                color: "#0D3CFC",
                fontFamily: FONT_FAMILY,
                letterSpacing: "-0.03em",
                margin: 0,
                marginBottom: "20px",
                lineHeight: 1,
              }}
            >
              About
            </h2>
            
            <div
              style={{
                width: "80px",
                height: "4px",
                backgroundColor: "#0D3CFC",
                margin: "20px auto",
                borderRadius: "2px",
              }}
            />

            <p
              style={{
                fontSize: "24px",
                fontWeight: 300,
                color: "#333333",
                fontFamily: FONT_FAMILY,
                lineHeight: 1.8,
                maxWidth: "800px",
                margin: "30px auto",
                padding: "0 20px",
              }}
            >
              Menuru adalah platform yang menggabungkan kreativitas dan kepedulian sosial. 
              Kami menyediakan ruang bagi Anda untuk mencatat ide-ide brilian, menemukan inspirasi, 
              dan berkontribusi melalui donasi untuk mereka yang membutuhkan. 
              Bergabunglah dengan komunitas Menuru dan jadilah bagian dari perubahan positif.
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: "40px",
                marginTop: "50px",
              }}
            >
              <div
                style={{
                  flex: "1 1 200px",
                  maxWidth: "250px",
                  padding: "30px 20px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "12px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                  border: "1px solid #e8e8e8",
                }}
              >
                <div
                  style={{
                    fontSize: "40px",
                    fontWeight: 700,
                    color: "#0D3CFC",
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  01
                </div>
                <h3
                  style={{
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "#000000",
                    fontFamily: FONT_FAMILY,
                    margin: "12px 0 8px",
                  }}
                >
                  Note
                </h3>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#666666",
                    fontFamily: FONT_FAMILY,
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  Catat ide-ide kreatif dan inspirasi Anda
                </p>
              </div>

              <div
                style={{
                  flex: "1 1 200px",
                  maxWidth: "250px",
                  padding: "30px 20px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "12px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                  border: "1px solid #e8e8e8",
                }}
              >
                <div
                  style={{
                    fontSize: "40px",
                    fontWeight: 700,
                    color: "#0D3CFC",
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  02
                </div>
                <h3
                  style={{
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "#000000",
                    fontFamily: FONT_FAMILY,
                    margin: "12px 0 8px",
                  }}
                >
                  Donasi
                </h3>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#666666",
                    fontFamily: FONT_FAMILY,
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  Salurkan bantuan untuk mereka yang membutuhkan
                </p>
              </div>

              <div
                style={{
                  flex: "1 1 200px",
                  maxWidth: "250px",
                  padding: "30px 20px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "12px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                  border: "1px solid #e8e8e8",
                }}
              >
                <div
                  style={{
                    fontSize: "40px",
                    fontWeight: 700,
                    color: "#0D3CFC",
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  03
                </div>
                <h3
                  style={{
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "#000000",
                    fontFamily: FONT_FAMILY,
                    margin: "12px 0 8px",
                  }}
                >
                  Shop
                </h3>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#666666",
                    fontFamily: FONT_FAMILY,
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  Temukan produk menarik dari komunitas
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SPACER */}
        <div style={{ height: "50vh" }} />

        {/* TIMELINE SECTION - warna putih */}
        <div
          ref={timelineRef}
          style={{
            position: "relative",
            height: "100vh",
            backgroundColor: "#ffffff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            borderTop: "1px solid #e8e8e8",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "800px",
              height: "500px",
            }}
          >
            <div
              ref={(el) => { timelineItemsRef.current[0] = el; }}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "90%",
                maxWidth: "600px",
                padding: "40px",
                backgroundColor: "#ffffff",
                borderRadius: "16px",
                boxShadow: "0 10px 40px rgba(13, 60, 252, 0.15)",
                border: "2px solid #0D3CFC",
                willChange: "transform, opacity",
                textAlign: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "20px", marginBottom: "16px" }}>
                <span style={{ fontSize: "48px", fontWeight: 700, color: "#0D3CFC" }}>01</span>
                <ArrowDown size={32} style={{ color: "#0D3CFC" }} />
                <span style={{ fontSize: "32px", fontWeight: 600, color: "#000000" }}>Note</span>
              </div>
              <p style={{ fontSize: "18px", color: "#666666", margin: 0 }}>
                Catat ide-ide kreatifmu dengan mudah
              </p>
            </div>

            <div
              ref={(el) => { timelineItemsRef.current[1] = el; }}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "90%",
                maxWidth: "600px",
                padding: "40px",
                backgroundColor: "#ffffff",
                borderRadius: "16px",
                boxShadow: "0 10px 40px rgba(13, 60, 252, 0.15)",
                border: "2px solid #0D3CFC",
                willChange: "transform, opacity",
                textAlign: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "20px", marginBottom: "16px" }}>
                <span style={{ fontSize: "48px", fontWeight: 700, color: "#0D3CFC" }}>02</span>
                <ArrowDown size={32} style={{ color: "#0D3CFC" }} />
                <span style={{ fontSize: "32px", fontWeight: 600, color: "#000000" }}>Donasi</span>
              </div>
              <p style={{ fontSize: "18px", color: "#666666", margin: 0 }}>
                Salurkan bantuan untuk mereka yang membutuhkan
              </p>
            </div>

            <div
              ref={(el) => { timelineItemsRef.current[2] = el; }}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "90%",
                maxWidth: "600px",
                padding: "40px",
                backgroundColor: "#ffffff",
                borderRadius: "16px",
                boxShadow: "0 10px 40px rgba(13, 60, 252, 0.15)",
                border: "2px solid #0D3CFC",
                willChange: "transform, opacity",
                textAlign: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "20px", marginBottom: "16px" }}>
                <span style={{ fontSize: "48px", fontWeight: 700, color: "#0D3CFC" }}>03</span>
                <ArrowDown size={32} style={{ color: "#0D3CFC" }} />
                <span style={{ fontSize: "32px", fontWeight: 600, color: "#000000" }}>Shop</span>
              </div>
              <p style={{ fontSize: "18px", color: "#666666", margin: 0 }}>
                Temukan produk-produk menarik dari komunitas
              </p>
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              bottom: "40px",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
              color: "#999999",
              fontSize: "14px",
            }}
          >
            <span>Scroll untuk melihat timeline</span>
            <ArrowDown size={24} style={{ color: "#0D3CFC" }} />
          </div>
        </div>

        {/* SPACER */}
        <div style={{ height: "30vh" }} />

        {/* DUMMY CONTENT - warna putih */}
        <div
          style={{
            padding: "80px 40px",
            backgroundColor: "#ffffff",
            width: "100%",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontSize: "48px",
              fontWeight: 600,
              color: "#0D3CFC",
              fontFamily: FONT_FAMILY,
              marginBottom: "30px",
            }}
          >
            Bergabunglah dengan Komunitas Menuru
          </h2>
          <p
            style={{
              fontSize: "20px",
              color: "#666666",
              fontFamily: FONT_FAMILY,
              maxWidth: "700px",
              margin: "0 auto",
              lineHeight: 1.8,
            }}
          >
            Ribuan kreator telah bergabung dan menciptakan perubahan. 
            Mulai perjalanan Anda hari ini dan jadilah bagian dari gerakan 
            yang menggabungkan kreativitas dengan kepedulian.
          </p>
          
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "60px",
              marginTop: "50px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={{ fontSize: "48px", fontWeight: 700, color: "#0D3CFC" }}>10K+</div>
              <div style={{ fontSize: "16px", color: "#999999" }}>Pengguna Aktif</div>
            </div>
            <div>
              <div style={{ fontSize: "48px", fontWeight: 700, color: "#0D3CFC" }}>5K+</div>
              <div style={{ fontSize: "16px", color: "#999999" }}>Ide Tercatat</div>
            </div>
            <div>
              <div style={{ fontSize: "48px", fontWeight: 700, color: "#0D3CFC" }}>Rp 2M+</div>
              <div style={{ fontSize: "16px", color: "#999999" }}>Donasi Terkumpul</div>
            </div>
          </div>
        </div>

        {/* SPACER */}
        <div style={{ height: "20vh" }} />

        {/* Footer - warna putih */}
        <div
          style={{
            position: "relative",
            bottom: 0,
            left: 0,
            width: "100%",
            textAlign: "center",
            color: "#999999",
            fontSize: "16px",
            fontFamily: FONT_FAMILY,
            padding: "60px 40px",
            backgroundColor: "#ffffff",
            borderTop: "1px solid #e8e8e8",
          }}
        >
          <p style={{ margin: 0, fontWeight: 500 }}>© 2026 Menuru. All rights reserved.</p>
          <p style={{ marginTop: "8px", fontSize: "14px", color: "#bbb" }}>
            Made with ❤️ for creativity and generosity
          </p>
        </div>
      </div>

      <style jsx global>{`
        /* HIDE SCROLLBAR tapi tetap bisa scroll */
        html {
          overflow: auto !important;
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
        html::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        body {
          overflow: auto !important;
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
          margin: 0;
          padding: 0;
          background-color: #ffffff !important;
        }
        body::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }

        /* Semua halaman warna putih */
        * {
          background-color: transparent;
        }

        @media (max-width: 1024px) {
          .subtitle p {
            font-size: 48px !important;
          }
          .title {
            font-size: 36px !important;
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
          .get-in-touch {
            padding: 6px 12px !important;
          }
          .get-in-touch span {
            font-size: 14px !important;
          }
          .arrow-right-box {
            width: 36px !important;
            height: 36px !important;
            padding: 8px !important;
          }
          .arrow-right-box svg {
            width: 18px !important;
            height: 18px !important;
          }
          .pusat-bantuan {
            padding: 6px 12px !important;
          }
          .pusat-bantuan span {
            font-size: 14px !important;
          }
          .menu-button-text {
            padding: 6px 12px !important;
          }
          .menu-button-text span {
            font-size: 14px !important;
          }
          .plus-box {
            width: 36px !important;
            height: 36px !important;
            padding: 8px !important;
          }
          .plus-box span {
            font-size: 28px !important;
          }
        }
        @media (max-width: 768px) {
          .subtitle p {
            font-size: 36px !important;
          }
          .title {
            font-size: 28px !important;
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
          .get-in-touch {
            padding: 4px 10px !important;
          }
          .get-in-touch span {
            font-size: 12px !important;
          }
          .arrow-right-box {
            width: 32px !important;
            height: 32px !important;
            padding: 6px !important;
          }
          .arrow-right-box svg {
            width: 16px !important;
            height: 16px !important;
          }
          .pusat-bantuan {
            padding: 4px 10px !important;
          }
          .pusat-bantuan span {
            font-size: 12px !important;
          }
          .menu-button-text {
            padding: 4px 10px !important;
          }
          .menu-button-text span {
            font-size: 12px !important;
          }
          .plus-box {
            width: 32px !important;
            height: 32px !important;
            padding: 6px !important;
          }
          .plus-box span {
            font-size: 24px !important;
          }
        }
        @media (max-width: 480px) {
          .subtitle p {
            font-size: 24px !important;
          }
          .title {
            font-size: 22px !important;
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
          .get-in-touch {
            padding: 4px 8px !important;
          }
          .get-in-touch span {
            font-size: 10px !important;
          }
          .arrow-right-box {
            width: 28px !important;
            height: 28px !important;
            padding: 4px !important;
          }
          .arrow-right-box svg {
            width: 14px !important;
            height: 14px !important;
          }
          .pusat-bantuan {
            padding: 4px 8px !important;
          }
          .pusat-bantuan span {
            font-size: 10px !important;
          }
          .menu-button-text {
            padding: 4px 8px !important;
          }
          .menu-button-text span {
            font-size: 10px !important;
          }
          .plus-box {
            width: 28px !important;
            height: 28px !important;
            padding: 4px !important;
          }
          .plus-box span {
            font-size: 20px !important;
          }
        }
      `}</style>
    </>
  );
}
