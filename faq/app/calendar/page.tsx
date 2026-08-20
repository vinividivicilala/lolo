// app/calendar/page.tsx (Halaman Calendar - MODIFIED FROM CONTACT)
'use client';

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

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
let db = null;
let auth = null;

if (typeof window !== "undefined") {
  app = getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApps()[0];
  db = getFirestore(app);
  auth = getAuth(app);
}

// SVG Icons
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

const NorthEastArrow = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 7L17 17M17 7V17H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const FONT_FAMILY = "'Poppins', 'Poppins Fallback', sans-serif";
const ADMIN_EMAIL = "faridardiansyah061@gmail.com";

// ============================================================
// ===== KOMPONEN UTAMA =====
// ============================================================
export default function CalendarPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuHovered, setIsMenuHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const menuButtonRef = useRef<HTMLDivElement>(null);
  const menuDrawerRef = useRef<HTMLDivElement>(null);
  const plusIconRef = useRef<HTMLSpanElement>(null);
  const calendarTitleRef = useRef<HTMLDivElement>(null);

  // Auth
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Menu drawer animation
  useEffect(() => {
    if (isMenuOpen && menuDrawerRef.current) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      
      gsap.fromTo(menuDrawerRef.current,
        { y: '100%', opacity: 0 },
        {
          y: '0%',
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          display: 'flex',
          onComplete: () => {
            if (menuDrawerRef.current) {
              menuDrawerRef.current.style.overflow = 'hidden';
            }
          }
        }
      );
    } else if (!isMenuOpen && menuDrawerRef.current) {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      
      gsap.to(menuDrawerRef.current, {
        y: '100%',
        opacity: 0,
        duration: 0.6,
        ease: "power3.in",
        onComplete: () => {
          if (menuDrawerRef.current) {
            menuDrawerRef.current.style.display = 'none';
          }
        }
      });
    }
  }, [isMenuOpen]);

  // Menu button hover
  useEffect(() => {
    if (menuButtonRef.current) {
      if (isMenuHovered) {
        gsap.to(menuButtonRef.current, {
          scale: 1.05,
          duration: 0.3,
          ease: "power2.out"
        });
      } else {
        gsap.to(menuButtonRef.current, {
          scale: 1,
          duration: 0.3,
          ease: "power2.out"
        });
      }
    }
  }, [isMenuHovered]);

  // SplitText animation untuk judul Calendar
  useEffect(() => {
    if (calendarTitleRef.current) {
      const splitTitle = new SplitText(calendarTitleRef.current, {
        type: "chars",
        charsClass: "split-char-calendar"
      });

      gsap.fromTo(splitTitle.chars,
        { opacity: 0, x: -50, filter: 'blur(10px)' },
        {
          opacity: 1,
          x: 0,
          filter: 'blur(0px)',
          duration: 1,
          stagger: 0.04,
          ease: "back.out(1.2)",
          scrollTrigger: {
            trigger: calendarTitleRef.current,
            start: "top 85%",
            end: "bottom 70%",
            toggleActions: "play none none reverse",
          }
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const handleMenuClick = () => {
    if (!isMenuOpen) {
      setIsMenuOpen(true);
      if (plusIconRef.current) {
        gsap.to(plusIconRef.current, {
          rotation: 45,
          duration: 0.4,
          ease: "power2.out"
        });
      }
    } else {
      if (menuDrawerRef.current) {
        gsap.to(menuDrawerRef.current, {
          y: '100%',
          opacity: 0,
          duration: 0.6,
          ease: "power3.in",
          onComplete: () => {
            setIsMenuOpen(false);
            if (menuDrawerRef.current) {
              menuDrawerRef.current.style.display = 'none';
            }
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

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#ffffff", fontFamily: FONT_FAMILY }}>
        <div style={{ fontSize: "18px", color: "#000" }}>Loading...</div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        * {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        *::-webkit-scrollbar {
          display: none;
        }
        html, body {
          margin: 0;
          padding: 0;
          background-color: white;
          overflow-x: hidden;
          overflow-y: auto !important;
        }
        .split-char-calendar {
          display: inline-block;
          will-change: transform, opacity, filter;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
      `}</style>
      
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'white',
        margin: 0,
        padding: 0,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: FONT_FAMILY,
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        position: 'relative',
        overflowX: 'hidden',
      }}>
        {/* JUDUL WEBSITE - pojok kiri atas */}
        <div style={{
          position: 'fixed',
          top: '40px',
          left: '40px',
          zIndex: isMenuOpen ? 98 : 100,
          pointerEvents: 'none'
        }}>
          <span style={{
            fontFamily: FONT_FAMILY,
            fontWeight: 700,
            fontSize: '48px',
            color: '#000000',
            letterSpacing: '-0.03em',
            textTransform: 'none',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale'
          }}>
            Menuru
          </span>
        </div>

        {/* NAVBAR - pojok kanan atas */}
        <div style={{
          position: 'fixed',
          top: '40px',
          right: '40px',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '8px 16px',
          borderRadius: '12px',
          backgroundColor: isMenuOpen ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0)',
          backdropFilter: isMenuOpen ? 'blur(20px)' : 'blur(0px)',
          transition: 'all 0.3s ease',
          pointerEvents: 'auto',
          boxShadow: isMenuOpen ? '0 4px 20px rgba(0,0,0,0.1)' : 'none',
        }}>
          {/* Get in Touch - (here) */}
          <Link href="/contact">
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                border: '2px solid #0D3CFC',
                borderRadius: '8px',
                padding: '8px 16px',
                cursor: 'pointer',
                backgroundColor: 'transparent',
              }}
            >
              <span
                style={{
                  fontSize: '16px',
                  fontWeight: 500,
                  color: '#0D3CFC',
                  fontFamily: FONT_FAMILY,
                  display: 'inline-block',
                }}
              >
                (here)
              </span>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#0D3CFC',
                  borderRadius: '4px',
                  padding: '4px',
                  color: '#ffffff',
                }}
              >
                <SouthEastArrow size={24} />
              </div>
            </div>
          </Link>

          {/* Pusat Bantuan */}
          <Link href="/pusat-bantuan">
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                border: '2px solid #000000',
                borderRadius: '8px',
                padding: '8px 16px',
                cursor: 'pointer',
                backgroundColor: 'transparent',
              }}
            >
              <span
                style={{
                  fontSize: '16px',
                  fontWeight: 500,
                  color: '#000000',
                  fontFamily: FONT_FAMILY,
                  display: 'inline-block',
                }}
              >
                Pusat Bantuan
              </span>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#000000',
                  borderRadius: '4px',
                  padding: '4px',
                  color: '#ffffff',
                }}
              >
                <NorthWestArrow size={24} />
              </div>
            </div>
          </Link>

          {/* Menu */}
          <div
            ref={menuButtonRef}
            onClick={handleMenuClick}
            onMouseEnter={() => setIsMenuHovered(true)}
            onMouseLeave={() => setIsMenuHovered(false)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              border: '2px solid #000000',
              borderRadius: '8px',
              padding: '8px 16px',
              cursor: 'pointer',
              backgroundColor: 'transparent',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#000000',
                borderRadius: '4px',
                padding: '4px',
                color: '#ffffff',
              }}
            >
              <span
                ref={plusIconRef}
                style={{
                  fontSize: '28px',
                  fontWeight: 300,
                  fontFamily: FONT_FAMILY,
                  lineHeight: 1,
                  display: 'inline-block',
                  transform: 'rotate(0deg)',
                }}
              >
                +
              </span>
            </div>
            <span
              style={{
                fontSize: '16px',
                fontWeight: 500,
                color: '#000000',
                fontFamily: FONT_FAMILY,
                letterSpacing: '0.02em',
                display: 'inline-block',
              }}
            >
              Menu
            </span>
          </div>
        </div>

        {/* Menu Drawer - BG BIRU #0D3CFC */}
        <div
          ref={menuDrawerRef}
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            width: '100%',
            height: '100%',
            backgroundColor: '#0D3CFC',
            zIndex: 99,
            display: 'none',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'translateY(-100%)',
            opacity: 0,
            pointerEvents: isMenuOpen ? 'auto' : 'none',
            padding: '40px',
            boxSizing: 'border-box',
            overflow: 'hidden'
          }}
        >
          <h1
            style={{
              position: 'absolute',
              top: '40px',
              left: '40px',
              fontSize: '48px',
              fontWeight: 700,
              color: '#ffffff',
              fontFamily: FONT_FAMILY,
              letterSpacing: '-0.03em',
              margin: 0,
              padding: 0,
              lineHeight: 1,
              opacity: 0.9,
            }}
          >
            Menuru
          </h1>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              gap: '30px',
            }}
          >
            <Link href="/" style={{ 
              color: '#ffffff', 
              fontSize: '48px', 
              textDecoration: 'none',
              fontFamily: FONT_FAMILY,
              fontWeight: 500,
              transition: 'opacity 0.3s',
              opacity: 0.8,
            }}>Home</Link>
            <Link href="/about" style={{ 
              color: '#ffffff', 
              fontSize: '48px', 
              textDecoration: 'none',
              fontFamily: FONT_FAMILY,
              fontWeight: 500,
              transition: 'opacity 0.3s',
              opacity: 0.8,
            }}>About</Link>
            <Link href="/contact" style={{ 
              color: '#ffffff', 
              fontSize: '48px', 
              textDecoration: 'none',
              fontFamily: FONT_FAMILY,
              fontWeight: 500,
              transition: 'opacity 0.3s',
              opacity: 0.8,
            }}>Contact</Link>
            <Link href="/pusat-bantuan" style={{ 
              color: '#ffffff', 
              fontSize: '48px', 
              textDecoration: 'none',
              fontFamily: FONT_FAMILY,
              fontWeight: 500,
              transition: 'opacity 0.3s',
              opacity: 0.8,
            }}>Pusat Bantuan</Link>
          </div>
        </div>

        {/* Teks Calendar besar 300px - DIGANTI DARI CONTACT MENJADI CALENDAR */}
        <div style={{
          position: 'relative',
          top: '120px',
          left: '40px',
          zIndex: 10,
          width: 'calc(100% - 80px)',
          marginBottom: '40px'
        }}>
          <div 
            ref={calendarTitleRef}
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: '300px',
              fontWeight: '300',
              color: '#000000',
              textAlign: 'left',
              letterSpacing: '-0.02em',
              textTransform: 'none',
              lineHeight: '1',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale'
            }}>
            Calendar
          </div>
        </div>

        {/* Teks subtitle dan tombol di bawah Calendar */}
        <div style={{
          position: 'relative',
          top: '120px',
          left: '40px',
          zIndex: 10,
          width: 'calc(100% - 80px)',
          marginBottom: '80px'
        }}>
          <p
            style={{
              fontSize: '40px',
              fontWeight: 400,
              color: '#0D3CFC',
              fontFamily: FONT_FAMILY,
              lineHeight: 1.2,
              margin: 0,
              padding: 0,
              paddingBottom: '30px',
              whiteSpace: 'pre-line',
            }}
          >
            {`Plan your schedule, set reminders,\nand never miss an important event`}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '20px' }}>
            <Link href="/signup">
              <div
                style={{
                  display: 'inline-block',
                  border: '2px solid #0D3CFC',
                  borderRadius: '8px',
                  padding: '12px 28px',
                  cursor: 'pointer',
                  backgroundColor: 'transparent',
                }}
              >
                <span
                  style={{
                    fontSize: '18px',
                    fontWeight: 500,
                    color: '#0D3CFC',
                    fontFamily: FONT_FAMILY,
                    letterSpacing: '0.02em',
                  }}
                >
                  Let's build now
                </span>
              </div>
            </Link>

            <Link href="/signup">
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #0D3CFC',
                  borderRadius: '8px',
                  padding: '10px',
                  cursor: 'pointer',
                  backgroundColor: '#0D3CFC',
                  color: '#ffffff',
                  width: '50px',
                  height: '50px',
                }}
              >
                <NorthEastArrow size={24} />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
