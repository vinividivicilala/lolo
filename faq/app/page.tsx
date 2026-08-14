'use client';

import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import gsap from 'gsap';

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

// Section data - 4 sections dengan warna bergantian
const sections = [
  { id: 0, bg: '#ffffff', titleColor: '#000000', menuColor: '#0D3CFC', textColor: '#000000', dotColor: '#0D3CFC' },
  { id: 1, bg: '#0D3CFC', titleColor: '#ffffff', menuColor: '#ffffff', textColor: '#ffffff', dotColor: '#ffffff' },
  { id: 2, bg: '#ffffff', titleColor: '#000000', menuColor: '#0D3CFC', textColor: '#000000', dotColor: '#0D3CFC' },
  { id: 3, bg: '#0D3CFC', titleColor: '#ffffff', menuColor: '#ffffff', textColor: '#ffffff', dotColor: '#ffffff' },
];

export default function HomePage(): React.JSX.Element {
  const [showMain, setShowMain] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const preloaderRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const menuButtonRef = useRef<HTMLDivElement>(null);
  const menuOverlayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<(HTMLDivElement | null)[]>([]);
  const sectionContentRef = useRef<(HTMLDivElement | null)[]>([]);

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
              initFooterAnimation();
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

  const initFooterAnimation = () => {
    if (!footerRef.current) return;

    // Footer animation - muncul dari bawah ke atas
    gsap.fromTo(footerRef.current,
      { y: 100, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top bottom",
          end: "top center",
          scrub: 1,
        }
      }
    );

    // Animasi elemen dalam footer dengan stagger
    const footerChildren = footerRef.current.querySelectorAll('.footer-content > *');
    gsap.fromTo(footerChildren,
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top bottom",
          end: "top center",
          scrub: 1,
        }
      }
    );
  };

  const initScrollAnimations = () => {
    // Setup scroll listener untuk deteksi section
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const totalHeight = document.documentElement.scrollHeight - windowHeight;
      
      // Deteksi footer visible
      const footerVisible = scrollY > totalHeight - windowHeight * 0.5;
      setIsFooterVisible(footerVisible);

      // Deteksi section
      const sectionIndex = Math.min(Math.round(scrollY / windowHeight), sections.length - 1);
      
      if (sectionIndex !== currentSection) {
        setCurrentSection(sectionIndex);
        updateColors(sectionIndex);
        animateSectionContent(sectionIndex);
      }
    };

    window.addEventListener('scroll', handleScroll);

    // Initial update
    updateColors(0);
    animateSectionContent(0);

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  };

  const updateColors = (index: number) => {
    const section = sections[index];
    if (!section) return;

    // Update background
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        backgroundColor: section.bg,
        duration: 0.8,
        ease: "power2.inOut",
      });
    }

    // Update title color
    if (titleRef.current) {
      gsap.to(titleRef.current, {
        color: section.titleColor,
        duration: 0.8,
        ease: "power2.inOut",
      });
    }

    // Update menu button color
    if (menuButtonRef.current) {
      const menuSpan = menuButtonRef.current.querySelectorAll('span');
      menuSpan.forEach((span) => {
        gsap.to(span, {
          color: section.menuColor,
          duration: 0.8,
          ease: "power2.inOut",
        });
      });
      gsap.to(menuButtonRef.current, {
        borderColor: section.menuColor,
        duration: 0.8,
        ease: "power2.inOut",
      });
    }

    // Update dot indicators
    const dots = document.querySelectorAll('.section-dot');
    dots.forEach((dot, idx) => {
      const el = dot as HTMLElement;
      if (idx === index) {
        gsap.to(el, {
          backgroundColor: section.dotColor,
          borderColor: section.dotColor,
          duration: 0.4,
          ease: "power2.inOut",
        });
      } else {
        gsap.to(el, {
          backgroundColor: 'transparent',
          borderColor: 'rgba(0,0,0,0.2)',
          duration: 0.4,
          ease: "power2.inOut",
        });
      }
    });
  };

  const animateSectionContent = (index: number) => {
    // Animate section content dengan fade
    sectionsRef.current.forEach((sectionEl, idx) => {
      if (sectionEl) {
        if (idx === index) {
          gsap.to(sectionEl, {
            opacity: 1,
            duration: 0.6,
            ease: "power2.out",
          });
        } else {
          gsap.to(sectionEl, {
            opacity: 0.2,
            duration: 0.4,
            ease: "power2.in",
          });
        }
      }
    });
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

  const scrollToSection = (index: number) => {
    window.scrollTo({
      top: index * window.innerHeight,
      behavior: 'smooth'
    });
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
        ref={containerRef}
        style={{
          minHeight: `${(sections.length + 1) * 100}vh`,
          backgroundColor: "#ffffff",
          margin: 0,
          padding: 0,
          position: "relative",
          fontFamily: FONT_FAMILY,
          transition: "background-color 0.8s ease",
        }}
      >
        {/* Fixed Elements - Judul di kiri atas */}
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

        {/* Fixed Elements - Menu Button */}
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
            backgroundColor: "transparent",
          }}
          onClick={toggleMenu}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#0D3CFC";
            const spans = e.currentTarget.querySelectorAll('span');
            spans.forEach(span => span.style.color = "#ffffff");
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            const spans = e.currentTarget.querySelectorAll('span');
            spans.forEach(span => span.style.color = "#0D3CFC");
          }}
        >
          <span
            style={{
              fontSize: "40px",
              fontWeight: 300,
              color: "#0D3CFC",
              fontFamily: FONT_FAMILY,
              transform: isMenuOpen ? "rotate(45deg)" : "rotate(0deg)",
              lineHeight: 1,
              transition: "transform 0.3s ease",
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
            }}
          >
            Menu
          </span>
        </div>

        {/* Section Indicators */}
        <div style={{
          position: "fixed",
          right: "40px",
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 30,
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}>
          {sections.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToSection(index)}
              className="section-dot"
              style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                border: currentSection === index ? "2px solid #0D3CFC" : "2px solid rgba(0,0,0,0.2)",
                background: currentSection === index ? "#0D3CFC" : "transparent",
                cursor: "pointer",
                transition: "all 0.3s ease",
                padding: 0,
              }}
            />
          ))}
        </div>

        {/* Sections */}
        {sections.map((section, index) => (
          <div
            key={index}
            ref={(el) => { sectionsRef.current[index] = el; }}
            style={{
              height: "100vh",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "40px",
              opacity: index === 0 ? 1 : 0.2,
              pointerEvents: index === 0 ? "auto" : "none",
              transition: "opacity 0.6s ease",
              position: "relative",
            }}
          >
            <div 
              ref={(el) => { sectionContentRef.current[index] = el; }}
              style={{ 
                textAlign: "center", 
                maxWidth: "900px",
              }}
            >
              {index === 0 && (
                <div>
                  <h2 style={{ fontSize: "72px", fontWeight: 700, color: "#000000", fontFamily: FONT_FAMILY, marginBottom: "20px" }}>
                    Welcome
                  </h2>
                  <p style={{ fontSize: "24px", color: "#666666", fontFamily: FONT_FAMILY, lineHeight: 1.6 }}>
                    Start your journey with Menuru today.
                  </p>
                </div>
              )}
              {index === 1 && (
                <div>
                  <h2 style={{ fontSize: "72px", fontWeight: 700, color: "#ffffff", fontFamily: FONT_FAMILY, marginBottom: "20px" }}>
                    Explore
                  </h2>
                  <p style={{ fontSize: "24px", color: "rgba(255,255,255,0.8)", fontFamily: FONT_FAMILY, lineHeight: 1.6 }}>
                    Discover new ideas and opportunities.
                  </p>
                </div>
              )}
              {index === 2 && (
                <div>
                  <h2 style={{ fontSize: "72px", fontWeight: 700, color: "#000000", fontFamily: FONT_FAMILY, marginBottom: "20px" }}>
                    Create
                  </h2>
                  <p style={{ fontSize: "24px", color: "#666666", fontFamily: FONT_FAMILY, lineHeight: 1.6 }}>
                    Turn your ideas into reality.
                  </p>
                </div>
              )}
              {index === 3 && (
                <div>
                  <h2 style={{ fontSize: "72px", fontWeight: 700, color: "#ffffff", fontFamily: FONT_FAMILY, marginBottom: "20px" }}>
                    Donate
                  </h2>
                  <p style={{ fontSize: "24px", color: "rgba(255,255,255,0.8)", fontFamily: FONT_FAMILY, lineHeight: 1.6 }}>
                    Make a difference today.
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Footer Section - muncul dari bawah */}
        <div
          ref={footerRef}
          style={{
            height: "100vh",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px",
            backgroundColor: "#0D3CFC",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div className="footer-content" style={{ 
            textAlign: "center", 
            maxWidth: "900px",
            color: "white",
          }}>
            <div style={{ marginBottom: "40px" }}>
              <h2 style={{ 
                fontSize: "72px", 
                fontWeight: 700, 
                fontFamily: FONT_FAMILY,
                margin: 0,
                background: "linear-gradient(135deg, #ffffff 0%, #a8c0ff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                Menuru
              </h2>
              <p style={{ 
                fontSize: "24px", 
                color: "rgba(255,255,255,0.8)",
                fontFamily: FONT_FAMILY,
                marginTop: "20px",
              }}>
                Where creativity meets generosity
              </p>
            </div>
            
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(3, 1fr)", 
              gap: "40px",
              marginBottom: "40px",
            }}>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 600, color: "white", fontFamily: FONT_FAMILY, marginBottom: "12px" }}>
                  About
                </h3>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", fontFamily: FONT_FAMILY }}>
                  Our story
                </p>
              </div>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 600, color: "white", fontFamily: FONT_FAMILY, marginBottom: "12px" }}>
                  Features
                </h3>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", fontFamily: FONT_FAMILY }}>
                  What we offer
                </p>
              </div>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 600, color: "white", fontFamily: FONT_FAMILY, marginBottom: "12px" }}>
                  Donate
                </h3>
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", fontFamily: FONT_FAMILY }}>
                  Make a difference
                </p>
              </div>
            </div>

            <div style={{ 
              borderTop: "1px solid rgba(255,255,255,0.1)",
              paddingTop: "20px",
            }}>
              <p style={{ 
                fontSize: "14px", 
                color: "rgba(255,255,255,0.4)",
                fontFamily: FONT_FAMILY,
              }}>
                © 2026 Menuru. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          overflow-y: scroll;
        }
        body::-webkit-scrollbar {
          display: none;
        }
        body {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        @media (max-width: 1024px) {
          .title {
            font-size: 36px !important;
          }
          .menu-button {
            top: 30px !important;
            right: 30px !important;
            padding: 6px 12px !important;
          }
          .menu-button span {
            font-size: 32px !important;
          }
          .footer-content h2 {
            font-size: 48px !important;
          }
        }
        @media (max-width: 768px) {
          .title {
            font-size: 28px !important;
            top: 20px !important;
            left: 20px !important;
          }
          .menu-button {
            top: 20px !important;
            right: 20px !important;
            padding: 4px 10px !important;
          }
          .menu-button span {
            font-size: 28px !important;
          }
          .section-content h2 {
            font-size: 48px !important;
          }
          .section-content p {
            font-size: 20px !important;
          }
          .footer-content h2 {
            font-size: 36px !important;
          }
          .footer-content div[style*="grid"] {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
        }
        @media (max-width: 480px) {
          .title {
            font-size: 22px !important;
            top: 16px !important;
            left: 16px !important;
          }
          .menu-button {
            top: 16px !important;
            right: 16px !important;
            padding: 4px 8px !important;
          }
          .menu-button span {
            font-size: 24px !important;
          }
          .section-content h2 {
            font-size: 36px !important;
          }
          .section-content p {
            font-size: 16px !important;
          }
          .footer-content h2 {
            font-size: 28px !important;
          }
        }
      `}</style>
    </>
  );
}
