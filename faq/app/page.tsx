'use client';

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  getFirestore, 
  collection, 
  query, 
  orderBy, 
  onSnapshot,
  doc,
  updateDoc,
  Timestamp,
  arrayUnion,
  arrayRemove,
  increment as firestoreIncrement
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { initializeApp, getApps } from "firebase/app";

// Register GSAP ScrollTrigger
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Konfigurasi Firebase
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

export default function HomePage(): React.JSX.Element {
  const [isMobile, setIsMobile] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const loadingOverlayRef = useRef<HTMLDivElement>(null);
  const welcomeTextRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Sembunyikan scrollbar
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';

    // Animasi Loading Overlay dengan GSAP
    const tl = gsap.timeline({
      onComplete: () => {
        setShowContent(true);
      }
    });

    gsap.set(loadingOverlayRef.current, { y: '100%' });

    tl.to(loadingOverlayRef.current, {
      y: '0%',
      duration: 0.8,
      ease: "power3.inOut"
    });

    tl.fromTo(welcomeTextRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
      "-=0.3"
    );

    tl.to({}, { duration: 1.2 });

    tl.to(welcomeTextRef.current, {
      opacity: 0,
      y: -20,
      duration: 0.5,
      ease: "power2.in"
    });

    tl.to(loadingOverlayRef.current, {
      y: '100%',
      duration: 0.8,
      ease: "power3.inOut"
    });

    return () => {
      document.body.style.overflow = '';
      document.body.style.height = '';
    };
  }, []);

  useEffect(() => {
    if (!showContent) return;

    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    // Animasi ScrollTrigger untuk sections (fade in)
    sectionsRef.current.forEach((section, index) => {
      if (!section) return;
      
      gsap.fromTo(section,
        {
          opacity: 0,
          y: 50
        },
        {
          scrollTrigger: {
            trigger: section,
            start: "top 85%",
            end: "top 50%",
            scrub: 1,
            toggleActions: "play none none reverse"
          },
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out"
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [showContent]);

  return (
    <>
      {/* Loading Overlay */}
      <div 
        ref={loadingOverlayRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: '#dbd6c9',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          transform: 'translateY(100%)'
        }}
      >
        <div 
          ref={welcomeTextRef}
          style={{
            fontFamily: 'ev-light, sans-serif',
            fontWeight: 400,
            fontStyle: 'normal',
            color: 'rgb(0, 20, 70)',
            fontSize: '13px',
            lineHeight: '13px',
            letterSpacing: '2px',
            opacity: 0
          }}
        >
          WELCOME BACK
        </div>
      </div>

      {/* Main Content */}
      {showContent && (
        <div style={{
          minHeight: '100vh',
          backgroundColor: 'black',
          margin: 0,
          padding: 0,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          fontFamily: 'ev-light, sans-serif',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          position: 'relative',
          overflow: 'hidden'
        }}>
          
          {/* Background Utama - Hitam */}
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'black',
            zIndex: 0
          }} />
          
          {/* Framed Layout - Area krem (#dbd6c9) */}
          <div style={{
            position: 'fixed',
            top: '2rem',
            left: '2rem',
            right: '2rem',
            bottom: '2rem',
            backgroundColor: '#dbd6c9',
            borderRadius: '20px',
            zIndex: 1,
            pointerEvents: 'none',
            overflow: 'hidden'
          }} />
          
          {/* Teks MENURU kecil di pojok kiri atas frame */}
          <div style={{
            position: 'fixed',
            top: 'calc(2rem + 16px)',
            left: 'calc(2rem + 20px)',
            zIndex: 3,
            pointerEvents: 'none'
          }}>
            <span style={{
              fontFamily: 'ev-light, sans-serif',
              fontWeight: 400,
              fontStyle: 'normal',
              color: 'rgb(0, 20, 70)',
              fontSize: '13px',
              lineHeight: '13px'
            }}>
              MENURU
            </span>
          </div>
          
          {/* Konten Utama - scrollable tanpa scrollbar */}
          <div style={{
            position: 'relative',
            zIndex: 2,
            width: '100%',
            overflowY: 'auto',
            overflowX: 'hidden',
            height: '100vh',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
          className="hide-scrollbar"
          >
            {/* Spacer atas */}
            <div style={{
              height: isMobile ? '120px' : '160px'
            }} />
            
            {/* Teks MENURU besar */}
            <div style={{
              position: 'relative',
              paddingLeft: 'calc(2rem + 20px)',
              paddingRight: '2rem',
              boxSizing: 'border-box',
              marginBottom: '1rem'
            }}>
              <span 
                id="menuru-big-text"
                style={{
                  fontFamily: "'Impact', 'Arial Black', 'Helvetica Black', 'Franklin Gothic Heavy', 'a2g', monospace, sans-serif",
                  fontWeight: 900,
                  fontStyle: 'normal',
                  color: 'rgb(140, 0, 0)',
                  fontSize: isMobile ? '150px' : '550px',
                  lineHeight: '0.85',
                  textAlign: 'left',
                  display: 'inline-block',
                  whiteSpace: 'nowrap',
                  letterSpacing: '-10px',
                  textTransform: 'uppercase',
                  cursor: 'text'
                }}>
                MENURU
              </span>
            </div>

            {/* Teks subtitle di bawah teks besar dengan font B */}
            <div style={{
              position: 'relative',
              paddingLeft: 'calc(2rem + 20px)',
              paddingRight: '2rem',
              boxSizing: 'border-box',
              marginBottom: '4rem'
            }}>
              <span style={{
                fontFamily: 'B',
                fontWeight: 400,
                fontStyle: 'normal',
                color: 'rgb(206, 0, 25)',
                fontSize: isMobile ? '30px' : '50px',
                lineHeight: isMobile ? '30px' : '50px',
                display: 'block'
              }}>
                Creative Designer / Developer. Founder
              </span>
            </div>
            
            {/* Konten sections */}
            <div style={{
              position: 'relative',
              width: '100%',
              padding: '2rem',
              paddingBottom: '10rem',
              boxSizing: 'border-box'
            }}>
              <div style={{
                maxWidth: '800px',
                margin: '0 auto',
                color: 'rgb(0, 20, 70)'
              }}>
                <div 
                  ref={el => { if (el) sectionsRef.current[0] = el; }}
                  style={{
                    marginBottom: '4rem',
                    padding: '2rem',
                    backgroundColor: 'rgba(0, 20, 70, 0.03)',
                    borderRadius: '16px',
                    border: '1px solid rgba(0, 20, 70, 0.1)',
                    opacity: 0,
                    transform: 'translateY(50px)'
                  }}
                >
                  <h2 style={{
                    fontFamily: 'ev-light, sans-serif',
                    fontSize: '2rem',
                    marginBottom: '1rem',
                    fontWeight: 400
                  }}>
                    Welcome to MENURU
                  </h2>
                  <p style={{
                    fontFamily: 'ev-light, sans-serif',
                    fontSize: '1.2rem',
                    lineHeight: '1.8'
                  }}>
                    Scroll ke bawah. Teks MENURU besar ikut scroll biasa, sections muncul dengan animasi GSAP ScrollTrigger.
                  </p>
                </div>

                {[2, 3, 4, 5, 6, 7, 8].map((item, idx) => (
                  <div 
                    key={item}
                    ref={el => { if (el) sectionsRef.current[item - 1] = el; }}
                    style={{
                      marginBottom: '3rem',
                      padding: '2rem',
                      backgroundColor: 'rgba(0, 20, 70, 0.03)',
                      borderRadius: '16px',
                      border: '1px solid rgba(0, 20, 70, 0.1)',
                      opacity: 0,
                      transform: 'translateY(50px)'
                    }}
                  >
                    <h3 style={{
                      fontSize: '1.5rem',
                      marginBottom: '1rem',
                      fontWeight: 400
                    }}>
                      Section {item}
                    </h3>
                    <p style={{
                      lineHeight: '1.6'
                    }}>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                      Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                      Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Scroll indicator */}
          <div style={{
            position: 'fixed',
            bottom: 'calc(2rem + 30px)',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
            pointerEvents: 'none'
          }}>
            <span style={{
              fontFamily: 'ev-light, sans-serif',
              fontSize: '11px',
              color: 'rgb(0, 20, 70)',
              letterSpacing: '2px'
            }}>
              SCROLL
            </span>
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="rgb(0, 20, 70)" 
              strokeWidth="2"
              style={{
                animation: 'bounce 1.5s infinite'
              }}
            >
              <path d="M12 5v14M19 12l-7 7-7-7"/>
            </svg>
          </div>

          <style jsx global>{`
            .hide-scrollbar {
              scrollbar-width: none;
              -ms-overflow-style: none;
            }
            
            .hide-scrollbar::-webkit-scrollbar {
              display: none;
            }
            
            body {
              overflow: hidden;
            }
            
            #menuru-big-text::selection {
              background-color: rgb(140, 0, 0) !important;
              color: #dbd6c9 !important;
            }
            
            #menuru-big-text::-moz-selection {
              background-color: rgb(140, 0, 0) !important;
              color: #dbd6c9 !important;
            }
            
            @keyframes bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(8px); }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
