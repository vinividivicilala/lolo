'use client';

import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, SplitText);
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

const SouthEastArrow = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 17L17 7M17 17V7H7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const NorthWestArrow = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 17L7 7M7 17V7H17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ShieldCheck = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L3 6V12C3 16.97 6.84 21.67 12 22C17.16 21.67 21 16.97 21 12V6L12 2Z" stroke="#0D3CFC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 12L11 14L15 10" stroke="#0D3CFC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ShoppingBag = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 6H18L19 18H5L6 6Z" stroke="#0D3CFC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 10V6C9 4.34315 10.3431 3 12 3C13.6569 3 15 4.34315 15 6V10" stroke="#0D3CFC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function ProfilePage(): React.JSX.Element {
  const [showMain, setShowMain] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const preloaderRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLHeadingElement>(null);
  const menuOverlayRef = useRef<HTMLDivElement>(null);
  const navbarRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const plusIconRef = useRef<HTMLSpanElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const goalRef = useRef<HTMLDivElement>(null);
  const teamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, () => {
      setTimeout(() => startPreloaderAnimation(), 500);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (showMain) {
      setTimeout(() => {
        initAnimations();
      }, 300);
    }
  }, [showMain]);

  const initAnimations = () => {
    // Split text animations for all sections
    const elements = [
      ...(aboutRef.current?.querySelectorAll('.about-title, .about-text, .about-since') || []),
      ...(goalRef.current?.querySelectorAll('.goal-title, .goal-text') || []),
      ...(teamRef.current?.querySelectorAll('.team-title, .team-text') || [])
    ];

    elements.forEach(el => {
      if (el.textContent) {
        const split = new SplitText(el, {
          type: 'lines',
          linesClass: 'split-line'
        });
        
        gsap.from(split.lines, {
          y: 60,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el.closest('.section-wrapper'),
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        });
      }
    });

    ScrollTrigger.refresh();
  };

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
              setTimeout(() => {
                ScrollTrigger.refresh();
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

  const toggleMenu = () => {
    if (!isMenuOpen) {
      setIsMenuOpen(true);
      if (menuOverlayRef.current) {
        gsap.fromTo(menuOverlayRef.current,
          { y: "-100%", opacity: 0 },
          { y: "0%", opacity: 1, duration: 0.6, ease: "power2.out" }
        );
      }
      if (plusIconRef.current) {
        gsap.to(plusIconRef.current, {
          rotation: 45,
          duration: 0.4,
          ease: "power2.out"
        });
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
      if (plusIconRef.current) {
        gsap.to(plusIconRef.current, {
          rotation: 0,
          duration: 0.4,
          ease: "power2.in"
        });
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
        <title>Menuru Official | Profiles</title>
        <meta name="description" content="Menuru Brand from Love yourself" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#0D3CFC" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Menuru" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="icon" href="/images/ai.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/images/ai.jpg" />
        <meta property="og:title" content="Menuru Official | Profiles" />
        <meta property="og:description" content="Menuru Brand from Love yourself" />
        <meta property="og:image" content="/images/ai.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Menuru Official | Profiles" />
        <meta name="twitter:description" content="Menuru Brand from Love yourself" />
        <meta name="twitter:image" content="/images/ai.jpg" />
      </Head>

      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#ffffff",
          margin: 0,
          padding: 0,
          position: "relative",
          fontFamily: FONT_FAMILY,
          overflow: "visible",
        }}
      >
        {/* HERO SECTION */}
        <div
          ref={heroRef}
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            padding: "40px",
            backgroundColor: "#ffffff",
            position: "relative",
            paddingTop: "120px",
          }}
        >
          {/* Judul - FIXED di posisi */}
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
              position: "fixed",
              top: "40px",
              left: "40px",
              zIndex: 15,
              pointerEvents: "none",
            }}
          >
            Menuru
          </h1>

          <div style={{ 
            position: "relative", 
            zIndex: 1,
            marginTop: "60px",
          }}>
            {/* Profiles - font 400px, warna biru */}
            <div
              ref={profileRef}
              className="profile-title"
              style={{
                textAlign: "left",
                position: "relative",
              }}
            >
              <h2
                style={{
                  fontSize: "400px",
                  fontWeight: 700,
                  color: "#0D3CFC",
                  fontFamily: FONT_FAMILY,
                  lineHeight: 1,
                  margin: 0,
                  padding: 0,
                  paddingBottom: "30px",
                  letterSpacing: "-0.03em",
                }}
              >
                Profiles
              </h2>
            </div>

            {/* Subtitle */}
            <div
              ref={subtitleRef}
              className="subtitle"
              style={{
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

            {/* Tombol dan Arrow */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "20px", position: "relative" }}>
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

            {/* ABOUT MENURU SECTION - with Since 2024 on the left */}
            <div
              ref={aboutRef}
              className="section-wrapper"
              style={{
                marginTop: "80px",
                paddingTop: "40px",
              }}
            >
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 2fr",
                gap: "60px",
                alignItems: "flex-start",
              }}>
                {/* Left side - "About Menuru" and "Since 2024" */}
                <div>
                  <h3
                    className="about-title"
                    style={{
                      fontSize: "72px",
                      fontWeight: 700,
                      color: "#0D3CFC",
                      fontFamily: FONT_FAMILY,
                      lineHeight: 1,
                      margin: 0,
                      padding: 0,
                      letterSpacing: "-0.03em",
                    }}
                  >
                    About Menuru
                  </h3>
                  <p
                    className="about-since"
                    style={{
                      fontSize: "24px",
                      fontWeight: 400,
                      color: "#0D3CFC",
                      fontFamily: FONT_FAMILY,
                      margin: "16px 0 0 0",
                      padding: 0,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Since 2024
                  </p>
                </div>

                {/* Right side - Description */}
                <div>
                  <p
                    className="about-text"
                    style={{
                      fontSize: "20px",
                      fontWeight: 400,
                      color: "#0D3CFC",
                      fontFamily: FONT_FAMILY,
                      lineHeight: 1.8,
                      margin: 0,
                      padding: 0,
                      maxWidth: "100%",
                    }}
                  >
                    Menuru Studio is a non-profit brand born from the founder's vision to assist the public at no cost. Established in 2024, the brand originated from the founder's own experiences—specifically, the challenges they faced with note-taking and scheduling after graduating from university. At its core, Menuru Studio embodies the founder's commitment to helping the community.
                  </p>
                </div>
              </div>
            </div>

            {/* OUR GOAL SECTION */}
            <div
              ref={goalRef}
              className="section-wrapper"
              style={{
                marginTop: "60px",
                paddingTop: "40px",
              }}
            >
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 2fr",
                gap: "60px",
                alignItems: "flex-start",
              }}>
                {/* Left side - "Our goal" */}
                <div>
                  <h3
                    className="goal-title"
                    style={{
                      fontSize: "72px",
                      fontWeight: 700,
                      color: "#0D3CFC",
                      fontFamily: FONT_FAMILY,
                      lineHeight: 1,
                      margin: 0,
                      padding: 0,
                      letterSpacing: "-0.03em",
                    }}
                  >
                    Our goal
                  </h3>
                </div>

                {/* Right side - Description */}
                <div>
                  <p
                    className="goal-text"
                    style={{
                      fontSize: "20px",
                      fontWeight: 400,
                      color: "#0D3CFC",
                      fontFamily: FONT_FAMILY,
                      lineHeight: 1.8,
                      margin: 0,
                      padding: 0,
                      maxWidth: "100%",
                    }}
                  >
                    Since our brand was established, we have helped people find exceptional solutions for their activities and created memorable features. Our expertise has continued to grow over the years, and this accumulated experience enables us to develop features that truly meet the highest standards.
                  </p>
                </div>
              </div>
            </div>

            {/* MEET OUR TEAM SECTION */}
            <div
              ref={teamRef}
              className="section-wrapper"
              style={{
                marginTop: "60px",
                paddingTop: "40px",
              }}
            >
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 2fr",
                gap: "60px",
                alignItems: "flex-start",
              }}>
                {/* Left side - "Meet our team" */}
                <div>
                  <h3
                    className="team-title"
                    style={{
                      fontSize: "72px",
                      fontWeight: 700,
                      color: "#0D3CFC",
                      fontFamily: FONT_FAMILY,
                      lineHeight: 1,
                      margin: 0,
                      padding: 0,
                      letterSpacing: "-0.03em",
                    }}
                  >
                    Meet our team
                  </h3>
                </div>

                {/* Right side - Team members */}
                <div
                  className="team-text"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "30px",
                  }}
                >
                  {/* Founder */}
                  <div style={{ width: "100%" }}>
                    <div style={{ 
                      display: "grid", 
                      gridTemplateColumns: "1fr 1fr",
                      gap: "40px",
                      width: "100%",
                    }}>
                      <span style={{ 
                        fontSize: "24px", 
                        fontWeight: 600, 
                        color: "#0D3CFC",
                        fontFamily: FONT_FAMILY,
                      }}>
                        Founder
                      </span>
                      <span style={{ 
                        fontSize: "24px", 
                        fontWeight: 400, 
                        color: "#0D3CFC",
                        fontFamily: FONT_FAMILY,
                      }}>
                        Farid Ardiansyah
                      </span>
                    </div>
                  </div>

                  {/* Developer */}
                  <div style={{ width: "100%" }}>
                    <div style={{ 
                      display: "grid", 
                      gridTemplateColumns: "1fr 1fr",
                      gap: "40px",
                      width: "100%",
                    }}>
                      <span style={{ 
                        fontSize: "24px", 
                        fontWeight: 600, 
                        color: "#0D3CFC",
                        fontFamily: FONT_FAMILY,
                      }}>
                        Developer
                      </span>
                      <span style={{ 
                        fontSize: "24px", 
                        fontWeight: 400, 
                        color: "#0D3CFC",
                        fontFamily: FONT_FAMILY,
                      }}>
                        Farid Ardiansyah
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* NAVBAR */}
        <div
          ref={navbarRef}
          style={{
            position: "fixed",
            top: "40px",
            right: "40px",
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "8px",
            padding: "0 16px",
            borderRadius: "12px",
            backgroundColor: isMenuOpen ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0)",
            backdropFilter: isMenuOpen ? "blur(20px)" : "blur(0px)",
            transition: "all 0.3s ease",
            pointerEvents: "auto",
            boxShadow: isMenuOpen ? "0 4px 20px rgba(0,0,0,0.1)" : "none",
          }}
        >
          {/* Baris atas: Shop, Profile (bg biru, teks putih), Sign Up */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            <Link href="/shop">
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                <ShoppingBag size={20} />
                <span style={{ fontSize: "16px", fontWeight: 500, color: "#0D3CFC", fontFamily: FONT_FAMILY }}>Shop</span>
              </div>
            </Link>
            
            {/* Profile - bg biru, teks putih, tanpa link */}
            <div style={{ 
              display: "inline-flex", 
              alignItems: "center", 
              backgroundColor: "#0D3CFC",
              padding: "6px 16px",
              borderRadius: "8px",
              cursor: "default",
            }}>
              <span style={{ 
                fontSize: "16px", 
                fontWeight: 500, 
                color: "#ffffff", 
                fontFamily: FONT_FAMILY 
              }}>
                Profile
              </span>
            </div>
            
            <Link href="/signup">
              <div style={{ display: "inline-flex", alignItems: "center", cursor: "pointer" }}>
                <span style={{ fontSize: "16px", fontWeight: 500, color: "#0D3CFC", fontFamily: FONT_FAMILY }}>Sign Up</span>
              </div>
            </Link>
          </div>

          {/* Baris bawah: Anti-Fraud, Anti-Bot, Get in touch, Pusat Bantuan, Menu */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "0" }}>
              <ShieldCheck size={28} />
              <span style={{ fontSize: "30px", fontWeight: 500, color: "#0D3CFC", fontFamily: FONT_FAMILY, lineHeight: 1 }}>Anti-Fraud</span>
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "0" }}>
              <ShieldCheck size={28} />
              <span style={{ fontSize: "30px", fontWeight: 500, color: "#0D3CFC", fontFamily: FONT_FAMILY, lineHeight: 1 }}>Anti-Bot</span>
            </div>
            <Link href="/contact">
              <div className="get-in-touch" style={{ display: "inline-flex", alignItems: "center", gap: "8px", border: "2px solid #0D3CFC", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", backgroundColor: "transparent" }}>
                <span style={{ fontSize: "16px", fontWeight: 500, color: "#0D3CFC", fontFamily: FONT_FAMILY }}>Get in touch</span>
                <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", backgroundColor: "#0D3CFC", borderRadius: "4px", padding: "4px", color: "#ffffff" }}>
                  <SouthEastArrow size={24} />
                </div>
              </div>
            </Link>
            <Link href="/pusat-bantuan">
              <div className="pusat-bantuan" style={{ display: "inline-flex", alignItems: "center", gap: "8px", border: "2px solid #000000", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", backgroundColor: "transparent" }}>
                <span style={{ fontSize: "16px", fontWeight: 500, color: "#000000", fontFamily: FONT_FAMILY }}>Pusat Bantuan</span>
                <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", backgroundColor: "#000000", borderRadius: "4px", padding: "4px", color: "#ffffff" }}>
                  <NorthWestArrow size={24} />
                </div>
              </div>
            </Link>
            <div className="menu-button" style={{ display: "inline-flex", alignItems: "center", gap: "8px", border: "2px solid #000000", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", backgroundColor: "transparent" }} onClick={toggleMenu}>
              <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", backgroundColor: "#000000", borderRadius: "4px", padding: "4px", color: "#ffffff" }}>
                <span ref={plusIconRef} style={{ fontSize: isMenuOpen ? "24px" : "28px", fontWeight: isMenuOpen ? 400 : 300, fontFamily: FONT_FAMILY, lineHeight: 1, display: "inline-block", transform: isMenuOpen ? "rotate(0deg)" : "rotate(0deg)" }}>
                  {isMenuOpen ? "✕" : "+"}
                </span>
              </div>
              <span style={{ fontSize: "16px", fontWeight: 500, color: "#000000", fontFamily: FONT_FAMILY, letterSpacing: "0.02em" }}>
                {isMenuOpen ? "Close" : "Menu"}
              </span>
            </div>
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
            alignItems: "flex-start",
            justifyContent: "flex-start",
            transform: "translateY(-100%)",
            opacity: 0,
            pointerEvents: isMenuOpen ? "auto" : "none",
            padding: "40px",
          }}
        >
          <h1
            style={{
              fontSize: "48px",
              fontWeight: 700,
              color: "#ffffff",
              fontFamily: FONT_FAMILY,
              letterSpacing: "-0.03em",
              margin: 0,
              padding: 0,
              lineHeight: 1,
              opacity: 0.9,
              position: "absolute",
              top: "40px",
              left: "40px",
            }}
          >
            Menuru
          </h1>
        </div>
      </div>

      <style jsx global>{`
        html {
          overflow: auto !important;
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
          height: 100% !important;
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
          min-height: 100% !important;
          height: auto !important;
        }
        body::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }

        * {
          background-color: transparent;
        }

        .split-line {
          overflow: hidden;
          display: block;
        }

        @media (max-width: 1400px) {
          .profile-title h2 {
            font-size: 300px !important;
          }
          .about-title,
          .goal-title,
          .team-title {
            font-size: 56px !important;
          }
          .about-text,
          .goal-text {
            font-size: 18px !important;
          }
          .about-since {
            font-size: 20px !important;
          }
          .team-text span {
            font-size: 20px !important;
          }
        }
        @media (max-width: 1024px) {
          .profile-title h2 {
            font-size: 200px !important;
          }
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
          .pusat-bantuan {
            padding: 6px 12px !important;
          }
          .pusat-bantuan span {
            font-size: 14px !important;
          }
          .menu-button {
            padding: 6px 12px !important;
          }
          .menu-button span {
            font-size: 14px !important;
          }
          .about-section,
          .goal-section,
          .team-section {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          .about-title,
          .goal-title,
          .team-title {
            font-size: 48px !important;
          }
          .about-text,
          .goal-text {
            font-size: 16px !important;
            line-height: 1.6 !important;
          }
          .about-since {
            font-size: 18px !important;
          }
          .team-text span {
            font-size: 18px !important;
          }
          .team-text div {
            grid-template-columns: 1fr 1fr !important;
            gap: 20px !important;
          }
        }
        @media (max-width: 768px) {
          .profile-title h2 {
            font-size: 120px !important;
          }
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
          .pusat-bantuan {
            padding: 4px 10px !important;
          }
          .pusat-bantuan span {
            font-size: 12px !important;
          }
          .menu-button {
            padding: 4px 10px !important;
          }
          .menu-button span {
            font-size: 12px !important;
          }
          .about-section,
          .goal-section,
          .team-section {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .about-title,
          .goal-title,
          .team-title {
            font-size: 36px !important;
          }
          .about-text,
          .goal-text {
            font-size: 14px !important;
            line-height: 1.6 !important;
          }
          .about-since {
            font-size: 16px !important;
          }
          .team-text span {
            font-size: 16px !important;
          }
          .team-text div {
            grid-template-columns: 1fr 1fr !important;
            gap: 12px !important;
          }
        }
        @media (max-width: 480px) {
          .profile-title h2 {
            font-size: 80px !important;
          }
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
          .pusat-bantuan {
            padding: 4px 8px !important;
          }
          .pusat-bantuan span {
            font-size: 10px !important;
          }
          .menu-button {
            padding: 4px 8px !important;
          }
          .menu-button span {
            font-size: 10px !important;
          }
          .about-section,
          .goal-section,
          .team-section {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          .about-title,
          .goal-title,
          .team-title {
            font-size: 28px !important;
          }
          .about-text,
          .goal-text {
            font-size: 12px !important;
            line-height: 1.5 !important;
          }
          .about-since {
            font-size: 14px !important;
          }
          .team-text span {
            font-size: 14px !important;
          }
          .team-text div {
            grid-template-columns: 1fr !important;
            gap: 4px !important;
          }
        }
      `}</style>
    </>
  );
}
