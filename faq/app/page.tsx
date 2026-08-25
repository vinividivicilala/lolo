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

export default function HomePage(): React.JSX.Element {
  const [showMain, setShowMain] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const preloaderRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);
  const menuOverlayRef = useRef<HTMLDivElement>(null);
  const navbarRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const plusIconRef = useRef<HTMLSpanElement>(null);

  // Refs untuk stacked cards
  const cardsSectionRef = useRef<HTMLDivElement>(null);
  const cardsPinnedRef = useRef<HTMLDivElement>(null);
  const [card1Ref, setCard1Ref] = useState<HTMLDivElement | null>(null);
  const [card2Ref, setCard2Ref] = useState<HTMLDivElement | null>(null);
  const [card3Ref, setCard3Ref] = useState<HTMLDivElement | null>(null);
  const [card4Ref, setCard4Ref] = useState<HTMLDivElement | null>(null);
  const [card5Ref, setCard5Ref] = useState<HTMLDivElement | null>(null);
  const [hasCardsAnimated, setHasCardsAnimated] = useState(false);

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

  // Animasi stacked cards
  useEffect(() => {
    if (!showMain) return;

    if (!card1Ref || !card2Ref || !card3Ref || !card4Ref || !card5Ref) return;
    if (!cardsSectionRef.current || !cardsPinnedRef.current) return;

    // Bersihkan ScrollTrigger sebelumnya
    ScrollTrigger.getAll().forEach(trigger => {
      if (trigger.vars && trigger.trigger === cardsSectionRef.current) {
        trigger.kill();
      }
    });

    // Set posisi awal - jarak 120px antar card agar 5 card terlihat
    gsap.set(card1Ref, { y: 0, zIndex: 5, opacity: 1 });
    gsap.set(card2Ref, { y: 120, zIndex: 6, opacity: 0.9 });
    gsap.set(card3Ref, { y: 240, zIndex: 7, opacity: 0.8 });
    gsap.set(card4Ref, { y: 360, zIndex: 8, opacity: 0.7 });
    gsap.set(card5Ref, { y: 480, zIndex: 9, opacity: 0.6 });

    const section = cardsSectionRef.current;
    const pinWrap = cardsPinnedRef.current;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "+=1000%",
        pin: pinWrap,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      }
    });

    // Animasi card bergerak ke atas - kecepatan normal
    tl.to(card2Ref, { y: 0, duration: 1, ease: "power2.inOut" }, 0)
      .to(card3Ref, { y: 120, duration: 1, ease: "power2.inOut" }, 0.8)
      .to(card4Ref, { y: 240, duration: 1, ease: "power2.inOut" }, 1.6)
      .to(card5Ref, { y: 360, duration: 1, ease: "power2.inOut" }, 2.4);

    setHasCardsAnimated(true);

    return () => {
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars && trigger.trigger === cardsSectionRef.current) {
          trigger.kill();
        }
      });
    };
  }, [showMain, card1Ref, card2Ref, card3Ref, card4Ref, card5Ref]);

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

          {/* Content Wrapper */}
          <div style={{ 
            position: "relative", 
            zIndex: 1,
            marginTop: "60px",
          }}>
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

            {/* STACKED CARDS SECTION - di bawah tombol */}
            <div
              ref={cardsSectionRef}
              style={{
                width: '100%',
                minHeight: '500vh', // tinggi cukup untuk animasi pin
                position: 'relative',
                backgroundColor: 'transparent',
                marginTop: '40px',
                marginBottom: '0',
              }}
            >
              {/* JUDUL COMMUNITY - 80px tanpa garis */}
              <div style={{
                position: 'sticky',
                top: '0',
                zIndex: 20,
                width: '100%',
                backgroundColor: 'transparent',
                padding: '30px 0 0 0',
                boxSizing: 'border-box',
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  paddingBottom: '10px',
                }}>
                  <div style={{
                    fontFamily: FONT_FAMILY,
                    fontSize: '80px',
                    fontWeight: '700',
                    letterSpacing: '-0.02em',
                    lineHeight: '0.9',
                    color: '#000000',
                    textTransform: 'uppercase',
                  }}>
                    COMMUNITY
                  </div>
                  <div style={{
                    marginBottom: '10px',
                  }}>
                    <NorthEastArrow size={40} />
                  </div>
                </div>
              </div>

              {/* STACKED CARDS CONTAINER - di sisi kiri */}
              <div
                ref={cardsPinnedRef}
                style={{
                  width: '100%',
                  height: '80vh',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  overflow: 'visible',
                  marginTop: '20px',
                  marginBottom: '50px',
                  paddingLeft: '40px',
                }}
              >
                <div style={{
                  position: 'relative',
                  width: '90%',
                  maxWidth: '900px',
                  height: '80vh',
                  margin: '0',
                }}>
                  
                  {/* CARD 1 - NOTE - ukuran kecil */}
                  <div
                    ref={setCard1Ref}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%) translateY(0px)',
                      width: '100%',
                      height: '60%',
                      backgroundColor: '#ffffff',
                      border: '2px solid #000000',
                      borderRadius: '0px',
                      boxShadow: 'none',
                      overflow: 'hidden',
                      zIndex: 5,
                      display: 'flex',
                      flexDirection: 'column',
                      color: '#000000',
                    }}
                  >
                    <div style={{
                      padding: '25px 35px 0 35px',
                      borderBottom: '2px solid #000000',
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                        marginBottom: '20px',
                      }}>
                        <div style={{
                          fontSize: '60px',
                          fontFamily: FONT_FAMILY,
                          fontWeight: '700',
                          letterSpacing: '-0.02em',
                          lineHeight: '1',
                          color: '#000000',
                        }}>
                          NOTE
                        </div>
                        <button style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          background: 'transparent',
                          border: '1.5px solid #000000',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontFamily: FONT_FAMILY,
                          color: '#000000',
                          padding: '10px 20px',
                          marginBottom: '8px',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#000000';
                          e.currentTarget.style.color = '#ffffff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#000000';
                        }}>
                          <span>VIEW</span>
                          <NorthEastArrow size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div style={{
                      padding: '30px 35px 25px 35px',
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}>
                      <div>
                        <p style={{
                          fontFamily: "'Questrial', sans-serif",
                          fontSize: '16px',
                          lineHeight: '1.5',
                          color: '#333333',
                          marginBottom: '20px',
                          maxWidth: '80%',
                        }}>
                          Catat ide-ide brilian dan inspirasi harian dengan mudah.
                        </p>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                          <span style={{ padding: '4px 16px', background: '#f0f0f0', fontSize: '12px', fontFamily: "'Questrial', sans-serif" }}>Rich Text</span>
                          <span style={{ padding: '4px 16px', background: '#f0f0f0', fontSize: '12px', fontFamily: "'Questrial', sans-serif" }}>Tagging</span>
                          <span style={{ padding: '4px 16px', background: '#f0f0f0', fontSize: '12px', fontFamily: "'Questrial', sans-serif" }}>Search</span>
                        </div>
                      </div>
                      <div style={{
                        marginTop: '20px',
                        paddingTop: '15px',
                        borderTop: '1px solid #e0e0e0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                        <span style={{ fontSize: '12px', fontFamily: FONT_FAMILY, color: '#999999' }}>MENURU</span>
                        <span style={{ fontSize: '12px', fontFamily: FONT_FAMILY, color: '#999999' }}>01 / 05</span>
                      </div>
                    </div>
                  </div>

                  {/* CARD 2 - BLOG */}
                  <div
                    ref={setCard2Ref}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%) translateY(120px)',
                      width: '95%',
                      height: '56%',
                      backgroundColor: '#ffffff',
                      border: '2px solid #000000',
                      borderRadius: '0px',
                      boxShadow: 'none',
                      overflow: 'hidden',
                      zIndex: 6,
                      display: 'flex',
                      flexDirection: 'column',
                      color: '#000000',
                      willChange: 'transform',
                    }}
                  >
                    <div style={{
                      padding: '22px 32px 0 32px',
                      borderBottom: '2px solid #000000',
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                        marginBottom: '18px',
                      }}>
                        <div style={{
                          fontSize: '55px',
                          fontFamily: FONT_FAMILY,
                          fontWeight: '700',
                          letterSpacing: '-0.02em',
                          lineHeight: '1',
                          color: '#000000',
                        }}>
                          BLOG
                        </div>
                        <button style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '9px',
                          background: 'transparent',
                          border: '1.5px solid #000000',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontFamily: FONT_FAMILY,
                          color: '#000000',
                          padding: '9px 18px',
                          marginBottom: '7px',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#000000';
                          e.currentTarget.style.color = '#ffffff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#000000';
                        }}>
                          <span>VIEW</span>
                          <NorthEastArrow size={15} />
                        </button>
                      </div>
                    </div>
                    
                    <div style={{
                      padding: '28px 32px 22px 32px',
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}>
                      <div>
                        <p style={{
                          fontFamily: "'Questrial', sans-serif",
                          fontSize: '15px',
                          lineHeight: '1.5',
                          color: '#333333',
                          marginBottom: '18px',
                          maxWidth: '78%',
                        }}>
                          Publikasikan artikel dan tutorial inspiratif.
                        </p>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ padding: '4px 14px', background: '#f0f0f0', fontSize: '11px', fontFamily: "'Questrial', sans-serif" }}>SEO</span>
                          <span style={{ padding: '4px 14px', background: '#f0f0f0', fontSize: '11px', fontFamily: "'Questrial', sans-serif" }}>Analytics</span>
                          <span style={{ padding: '4px 14px', background: '#f0f0f0', fontSize: '11px', fontFamily: "'Questrial', sans-serif" }}>Comments</span>
                        </div>
                      </div>
                      <div style={{
                        marginTop: '18px',
                        paddingTop: '14px',
                        borderTop: '1px solid #e0e0e0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                        <span style={{ fontSize: '12px', fontFamily: FONT_FAMILY, color: '#999999' }}>PUBLISHING</span>
                        <span style={{ fontSize: '12px', fontFamily: FONT_FAMILY, color: '#999999' }}>02 / 05</span>
                      </div>
                    </div>
                  </div>

                  {/* CARD 3 - CALENDAR */}
                  <div
                    ref={setCard3Ref}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%) translateY(240px)',
                      width: '90%',
                      height: '52%',
                      backgroundColor: '#ffffff',
                      border: '2px solid #000000',
                      borderRadius: '0px',
                      boxShadow: 'none',
                      overflow: 'hidden',
                      zIndex: 7,
                      display: 'flex',
                      flexDirection: 'column',
                      color: '#000000',
                      willChange: 'transform',
                    }}
                  >
                    <div style={{
                      padding: '20px 30px 0 30px',
                      borderBottom: '2px solid #000000',
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                        marginBottom: '16px',
                      }}>
                        <div style={{
                          fontSize: '50px',
                          fontFamily: FONT_FAMILY,
                          fontWeight: '700',
                          letterSpacing: '-0.02em',
                          lineHeight: '1',
                          color: '#000000',
                        }}>
                          CALENDAR
                        </div>
                        <button style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          background: 'transparent',
                          border: '1.5px solid #000000',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontFamily: FONT_FAMILY,
                          color: '#000000',
                          padding: '8px 16px',
                          marginBottom: '6px',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#000000';
                          e.currentTarget.style.color = '#ffffff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#000000';
                        }}>
                          <span>VIEW</span>
                          <NorthEastArrow size={14} />
                        </button>
                      </div>
                    </div>
                    
                    <div style={{
                      padding: '25px 30px 20px 30px',
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}>
                      <div>
                        <p style={{
                          fontFamily: "'Questrial', sans-serif",
                          fontSize: '14px',
                          lineHeight: '1.5',
                          color: '#333333',
                          marginBottom: '16px',
                          maxWidth: '75%',
                        }}>
                          Kelola jadwal dan event dengan kalender interaktif.
                        </p>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ padding: '4px 14px', background: '#f0f0f0', fontSize: '11px', fontFamily: "'Questrial', sans-serif" }}>Sync</span>
                          <span style={{ padding: '4px 14px', background: '#f0f0f0', fontSize: '11px', fontFamily: "'Questrial', sans-serif" }}>Reminders</span>
                          <span style={{ padding: '4px 14px', background: '#f0f0f0', fontSize: '11px', fontFamily: "'Questrial', sans-serif" }}>Recurring</span>
                        </div>
                      </div>
                      <div style={{
                        marginTop: '16px',
                        paddingTop: '12px',
                        borderTop: '1px solid #e0e0e0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                        <span style={{ fontSize: '12px', fontFamily: FONT_FAMILY, color: '#999999' }}>SCHEDULE</span>
                        <span style={{ fontSize: '12px', fontFamily: FONT_FAMILY, color: '#999999' }}>03 / 05</span>
                      </div>
                    </div>
                  </div>

                  {/* CARD 4 - TASK */}
                  <div
                    ref={setCard4Ref}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%) translateY(360px)',
                      width: '85%',
                      height: '48%',
                      backgroundColor: '#ffffff',
                      border: '2px solid #000000',
                      borderRadius: '0px',
                      boxShadow: 'none',
                      overflow: 'hidden',
                      zIndex: 8,
                      display: 'flex',
                      flexDirection: 'column',
                      color: '#000000',
                      willChange: 'transform',
                    }}
                  >
                    <div style={{
                      padding: '18px 28px 0 28px',
                      borderBottom: '2px solid #000000',
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                        marginBottom: '14px',
                      }}>
                        <div style={{
                          fontSize: '45px',
                          fontFamily: FONT_FAMILY,
                          fontWeight: '700',
                          letterSpacing: '-0.02em',
                          lineHeight: '1',
                          color: '#000000',
                        }}>
                          TASK
                        </div>
                        <button style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '7px',
                          background: 'transparent',
                          border: '1.5px solid #000000',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontFamily: FONT_FAMILY,
                          color: '#000000',
                          padding: '7px 14px',
                          marginBottom: '5px',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#000000';
                          e.currentTarget.style.color = '#ffffff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#000000';
                        }}>
                          <span>VIEW</span>
                          <NorthEastArrow size={13} />
                        </button>
                      </div>
                    </div>
                    
                    <div style={{
                      padding: '22px 28px 18px 28px',
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}>
                      <div>
                        <p style={{
                          fontFamily: "'Questrial', sans-serif",
                          fontSize: '14px',
                          lineHeight: '1.5',
                          color: '#333333',
                          marginBottom: '14px',
                          maxWidth: '75%',
                        }}>
                          Kelola tugas dengan prioritas dan deadline.
                        </p>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ padding: '4px 14px', background: '#f0f0f0', fontSize: '11px', fontFamily: "'Questrial', sans-serif" }}>Priority</span>
                          <span style={{ padding: '4px 14px', background: '#f0f0f0', fontSize: '11px', fontFamily: "'Questrial', sans-serif" }}>Deadline</span>
                          <span style={{ padding: '4px 14px', background: '#f0f0f0', fontSize: '11px', fontFamily: "'Questrial', sans-serif" }}>Progress</span>
                        </div>
                      </div>
                      <div style={{
                        marginTop: '14px',
                        paddingTop: '10px',
                        borderTop: '1px solid #e0e0e0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                        <span style={{ fontSize: '12px', fontFamily: FONT_FAMILY, color: '#999999' }}>PRODUCTIVITY</span>
                        <span style={{ fontSize: '12px', fontFamily: FONT_FAMILY, color: '#999999' }}>04 / 05</span>
                      </div>
                    </div>
                  </div>

                  {/* CARD 5 - REMINDER */}
                  <div
                    ref={setCard5Ref}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%) translateY(480px)',
                      width: '80%',
                      height: '44%',
                      backgroundColor: '#ffffff',
                      border: '2px solid #000000',
                      borderRadius: '0px',
                      boxShadow: 'none',
                      overflow: 'hidden',
                      zIndex: 9,
                      display: 'flex',
                      flexDirection: 'column',
                      color: '#000000',
                      willChange: 'transform',
                    }}
                  >
                    <div style={{
                      padding: '16px 26px 0 26px',
                      borderBottom: '2px solid #000000',
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                        marginBottom: '12px',
                      }}>
                        <div style={{
                          fontSize: '40px',
                          fontFamily: FONT_FAMILY,
                          fontWeight: '700',
                          letterSpacing: '-0.02em',
                          lineHeight: '1',
                          color: '#000000',
                        }}>
                          REMINDER
                        </div>
                        <button style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: 'transparent',
                          border: '1.5px solid #000000',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontFamily: FONT_FAMILY,
                          color: '#000000',
                          padding: '6px 12px',
                          marginBottom: '4px',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#000000';
                          e.currentTarget.style.color = '#ffffff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#000000';
                        }}>
                          <span>VIEW</span>
                          <NorthEastArrow size={12} />
                        </button>
                      </div>
                    </div>
                    
                    <div style={{
                      padding: '20px 26px 16px 26px',
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}>
                      <div>
                        <p style={{
                          fontFamily: "'Questrial', sans-serif",
                          fontSize: '13px',
                          lineHeight: '1.5',
                          color: '#333333',
                          marginBottom: '12px',
                          maxWidth: '75%',
                        }}>
                          Notifikasi cerdas untuk jadwal dan deadline.
                        </p>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{ padding: '3px 12px', background: '#f0f0f0', fontSize: '10px', fontFamily: "'Questrial', sans-serif" }}>Push Notif</span>
                          <span style={{ padding: '3px 12px', background: '#f0f0f0', fontSize: '10px', fontFamily: "'Questrial', sans-serif" }}>Email</span>
                          <span style={{ padding: '3px 12px', background: '#f0f0f0', fontSize: '10px', fontFamily: "'Questrial', sans-serif" }}>Custom</span>
                        </div>
                      </div>
                      <div style={{
                        marginTop: '12px',
                        paddingTop: '8px',
                        borderTop: '1px solid #e0e0e0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                        <span style={{ fontSize: '11px', fontFamily: FONT_FAMILY, color: '#999999' }}>NOTIFICATION</span>
                        <span style={{ fontSize: '11px', fontFamily: FONT_FAMILY, color: '#999999' }}>05 / 05</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Indikator scroll */}
              <div
                style={{
                  position: 'relative',
                  textAlign: 'center',
                  marginTop: '20px',
                  color: '#999999',
                  fontSize: '14px',
                  fontFamily: FONT_FAMILY,
                }}
              >
                <span>Scroll untuk melihat semua fitur</span>
                <div style={{ marginTop: '8px' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5V19M12 19L19 12M12 19L5 12" stroke="#0D3CFC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* NAVBAR - FIXED di atas */}
        <div
          ref={navbarRef}
          style={{
            position: "fixed",
            top: "40px",
            right: "40px",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "8px 16px",
            borderRadius: "12px",
            backgroundColor: isMenuOpen ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0)",
            backdropFilter: isMenuOpen ? "blur(20px)" : "blur(0px)",
            transition: "all 0.3s ease",
            pointerEvents: "auto",
            boxShadow: isMenuOpen ? "0 4px 20px rgba(0,0,0,0.1)" : "none",
          }}
        >
          {/* Anti-Fraud Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "0",
            }}
          >
            <ShieldCheck size={28} />
            <span
              style={{
                fontSize: "30px",
                fontWeight: 500,
                color: "#0D3CFC",
                fontFamily: FONT_FAMILY,
                lineHeight: 1,
              }}
            >
              Anti-Fraud
            </span>
          </div>

          {/* Get in Touch */}
          <Link href="/contact">
            <div
              className="get-in-touch"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
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
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#0D3CFC",
                  borderRadius: "4px",
                  padding: "4px",
                  color: "#ffffff",
                }}
              >
                <SouthEastArrow size={24} />
              </div>
            </div>
          </Link>

          {/* Pusat Bantuan */}
          <Link href="/pusat-bantuan">
            <div
              className="pusat-bantuan"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                border: "2px solid #000000",
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
                  color: "#000000",
                  fontFamily: FONT_FAMILY,
                  display: "inline-block",
                }}
              >
                Pusat Bantuan
              </span>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#000000",
                  borderRadius: "4px",
                  padding: "4px",
                  color: "#ffffff",
                }}
              >
                <NorthWestArrow size={24} />
              </div>
            </div>
          </Link>

          {/* Menu */}
          <div
            className="menu-button"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              border: "2px solid #000000",
              borderRadius: "8px",
              padding: "8px 16px",
              cursor: "pointer",
              backgroundColor: "transparent",
            }}
            onClick={toggleMenu}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#000000",
                borderRadius: "4px",
                padding: "4px",
                color: "#ffffff",
              }}
            >
              <span
                ref={plusIconRef}
                style={{
                  fontSize: isMenuOpen ? "24px" : "28px",
                  fontWeight: isMenuOpen ? 400 : 300,
                  fontFamily: FONT_FAMILY,
                  lineHeight: 1,
                  display: "inline-block",
                  transform: isMenuOpen ? "rotate(0deg)" : "rotate(0deg)",
                }}
              >
                {isMenuOpen ? "✕" : "+"}
              </span>
            </div>
            <span
              style={{
                fontSize: "16px",
                fontWeight: 500,
                color: "#000000",
                fontFamily: FONT_FAMILY,
                letterSpacing: "0.02em",
                display: "inline-block",
              }}
            >
              {isMenuOpen ? "Close" : "Menu"}
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
        }
      `}</style>
    </>
  );
}
