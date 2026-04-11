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
  const [currentCardColor, setCurrentCardColor] = useState<'yellow' | 'green' | 'blue'>('yellow');
  const [cardName, setCardName] = useState('');
  const [cardDescription, setCardDescription] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [displayDescription, setDisplayDescription] = useState('');
  const loadingOverlayRef = useRef<HTMLDivElement>(null);
  const welcomeTextRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<(HTMLDivElement | null)[]>([]);
  const menuruFullRef = useRef<HTMLSpanElement>(null);
  const menuruLetterMRef = useRef<HTMLSpanElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const colorSchemes = {
    yellow: {
      bg: '#F5E6CA',
      border: '#D4A857',
      text: '#8B6914',
      accent: '#E8C872'
    },
    green: {
      bg: '#D9E8D5',
      border: '#6B8E5E',
      text: '#2D5A27',
      accent: '#A8C3A0'
    },
    blue: {
      bg: '#D0E5F0',
      border: '#5B8EB3',
      text: '#1C4E70',
      accent: '#8FB8D4'
    }
  };

  const colors = ['yellow', 'green', 'blue'] as const;

  // Random card setiap 10 detik
  useEffect(() => {
    if (!showContent) return;

    const interval = setInterval(() => {
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      setCurrentCardColor(randomColor);
      
      // Animasi card change
      if (cardRef.current) {
        gsap.fromTo(cardRef.current,
          { scale: 0.95, opacity: 0.8, rotateX: -10 },
          { scale: 1, opacity: 1, rotateX: 0, duration: 0.6, ease: "back.out(0.5)" }
        );
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [showContent]);

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cardName.trim() && cardDescription.trim()) {
      setDisplayName(cardName);
      setDisplayDescription(cardDescription);
      setCardName('');
      setCardDescription('');
      
      // Animasi saat data ditampilkan
      if (cardRef.current) {
        gsap.fromTo(cardRef.current,
          { scale: 0.9, opacity: 0.7, y: 20 },
          { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
        );
      }
    }
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';

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

    const menuruFull = menuruFullRef.current;
    const letterM = menuruLetterMRef.current;

    if (menuruFull && letterM) {
      gsap.set(menuruFull, {
        y: 20,
        opacity: 0,
        display: 'none'
      });

      const handleMouseEnter = () => {
        gsap.set(menuruFull, {
          display: 'inline-block',
          y: 20,
          opacity: 0
        });
        gsap.to(menuruFull, {
          y: 0,
          opacity: 1,
          duration: 0.4,
          ease: "back.out(0.7)"
        });
      };

      const handleMouseLeave = () => {
        gsap.to(menuruFull, {
          y: 20,
          opacity: 0,
          duration: 0.3,
          ease: "power2.in",
          onComplete: () => {
            gsap.set(menuruFull, { display: 'none' });
          }
        });
      };

      letterM.addEventListener('mouseenter', handleMouseEnter);
      letterM.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        letterM.removeEventListener('mouseenter', handleMouseEnter);
        letterM.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, [showContent]);

  useEffect(() => {
    if (!showContent) return;

    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

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

  const currentColor = colorSchemes[currentCardColor];

  return (
    <>
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
          
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'black',
            zIndex: 0
          }} />
          
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
          
          {/* Judul Website - Huruf M */}
          <div style={{
            position: 'fixed',
            top: 'calc(2rem + 16px)',
            left: 'calc(2rem + 20px)',
            zIndex: 3,
            pointerEvents: 'auto',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <span 
              ref={menuruLetterMRef}
              style={{
                fontFamily: 'ev-light, sans-serif',
                fontWeight: 400,
                fontStyle: 'normal',
                color: 'rgb(0, 20, 70)',
                fontSize: '40px',
                lineHeight: '40px',
                display: 'inline-block'
              }}
            >
              M
            </span>
            <span 
              ref={menuruFullRef}
              style={{
                fontFamily: 'ev-light, sans-serif',
                fontWeight: 400,
                fontStyle: 'normal',
                color: 'rgb(0, 20, 70)',
                fontSize: '40px',
                lineHeight: '40px',
                display: 'none',
                whiteSpace: 'nowrap'
              }}
            >
              ENURU
            </span>
          </div>
          
          {/* Tilted Card - Pojok Kanan Bawah */}
          <div style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            zIndex: 3,
            pointerEvents: 'auto',
            maxWidth: '320px',
            width: '100%'
          }}>
            <div
              ref={cardRef}
              style={{
                backgroundColor: currentColor.bg,
                border: `2px solid ${currentColor.border}`,
                borderRadius: '16px',
                padding: '1.5rem',
                transform: 'rotate(-2deg) translateY(-10px)',
                boxShadow: `8px 8px 0px ${currentColor.border}`,
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                gsap.to(e.currentTarget, {
                  rotate: '0deg',
                  y: '-15px',
                  duration: 0.3,
                  ease: "power2.out"
                });
              }}
              onMouseLeave={(e) => {
                gsap.to(e.currentTarget, {
                  rotate: '-2deg',
                  y: '-10px',
                  duration: 0.3,
                  ease: "power2.in"
                });
              }}
            >
              {displayName && displayDescription ? (
                <>
                  <h3 style={{
                    fontFamily: 'ev-light, sans-serif',
                    fontSize: '1.3rem',
                    fontWeight: 600,
                    color: currentColor.text,
                    marginBottom: '0.5rem'
                  }}>
                    {displayName}
                  </h3>
                  <p style={{
                    fontFamily: 'ev-light, sans-serif',
                    fontSize: '0.9rem',
                    color: currentColor.text,
                    lineHeight: 1.5,
                    marginBottom: '1rem'
                  }}>
                    {displayDescription}
                  </p>
                  <div style={{
                    fontSize: '0.7rem',
                    color: currentColor.text,
                    opacity: 0.7,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span>✨ Card berubah warna setiap 10 detik</span>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: currentColor.border,
                      display: 'inline-block'
                    }} />
                  </div>
                </>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <input
                    type="text"
                    placeholder="Nama Anda"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    style={{
                      padding: '0.8rem 1rem',
                      backgroundColor: 'transparent',
                      border: `1px solid ${currentColor.border}`,
                      borderRadius: '8px',
                      color: currentColor.text,
                      fontSize: '0.9rem',
                      fontFamily: 'ev-light, sans-serif',
                      outline: 'none'
                    }}
                  />
                  <textarea
                    placeholder="Deskripsi"
                    value={cardDescription}
                    onChange={(e) => setCardDescription(e.target.value)}
                    rows={3}
                    style={{
                      padding: '0.8rem 1rem',
                      backgroundColor: 'transparent',
                      border: `1px solid ${currentColor.border}`,
                      borderRadius: '8px',
                      color: currentColor.text,
                      fontSize: '0.9rem',
                      fontFamily: 'ev-light, sans-serif',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      padding: '0.8rem 1rem',
                      backgroundColor: currentColor.border,
                      border: 'none',
                      borderRadius: '8px',
                      color: currentColor.bg,
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'ev-light, sans-serif',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      gsap.to(e.currentTarget, { scale: 1.02, duration: 0.2 });
                    }}
                    onMouseLeave={(e) => {
                      gsap.to(e.currentTarget, { scale: 1, duration: 0.2 });
                    }}
                  >
                    Tampilkan Card
                  </button>
                </form>
              )}
            </div>
          </div>
          
          {/* Konten Utama */}
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
            <div style={{
              height: isMobile ? '120px' : '160px'
            }} />
            
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
                    Hover ke huruf "M" di pojok kiri atas. Lihat Tilted Card di pojok kanan bawah yang berubah warna setiap 10 detik!
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
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
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
