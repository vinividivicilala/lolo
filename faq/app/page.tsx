'use client';

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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

// Data gambar untuk cursor trail - 10 foto berbeda
const cursorImages = [
  { id: 1, src: "images/1.jpg" },
  { id: 2, src: "images/2.jpg" },
  { id: 3, src: "images/3.jpg" },
  { id: 4, src: "images/4.jpg" },
  { id: 5, src: "images/5.jpg" },
  { id: 6, src: "images/6.jpg" },
  { id: 7, src: "images/7.jpg" },
  { id: 8, src: "images/8.jpg" },
  { id: 9, src: "images/9.jpg" },
  { id: 10, src: "images/10.jpg" }
];

// Komponen Image Trail dengan 10 foto portrait ukuran sedang
const ImageTrail = () => {
  const [images, setImages] = useState<{ id: number; x: number; y: number; src: string; index: number }[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastPositionRef = useRef({ x: 0, y: 0 });
  const imageIndexRef = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const currentX = e.clientX;
      const currentY = e.clientY;
      
      // Hitung jarak pergerakan cursor
      const dx = Math.abs(currentX - lastPositionRef.current.x);
      const dy = Math.abs(currentY - lastPositionRef.current.y);
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Update posisi terakhir
      lastPositionRef.current = { x: currentX, y: currentY };
      
      // Hanya tambahkan gambar jika cursor bergerak cukup jauh (untuk efisiensi)
      if (distance < 10) return;
      
      // Clear timeout sebelumnya
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      
      // Tambahkan gambar baru ke trail
      const newImage = {
        id: Date.now() + Math.random(),
        x: currentX,
        y: currentY,
        src: cursorImages[imageIndexRef.current % cursorImages.length].src,
        index: imageIndexRef.current
      };
      
      setImages(prev => [newImage, ...prev].slice(0, 10)); // Maksimal 10 gambar
      imageIndexRef.current++;
      
      // Hapus gambar setelah 2 detik (slow fade)
      timeoutRef.current = setTimeout(() => {
        setImages(prev => prev.filter(img => img.id !== newImage.id));
      }, 2000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 9998,
      overflow: 'visible'
    }}>
      <AnimatePresence>
        {images.map((image, idx) => (
          <motion.div
            key={image.id}
            initial={{ 
              opacity: 0,
              scale: 0.3,
              x: image.x - 40,
              y: image.y - 50,
              rotate: -10
            }}
            animate={{ 
              opacity: 1,
              scale: 1,
              x: image.x - 40 + (idx * 8),
              y: image.y - 50 - (idx * 12),
              rotate: idx * 2
            }}
            exit={{ 
              opacity: 0,
              scale: 0.5,
              transition: { duration: 0.5 }
            }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 20,
              mass: 0.5,
              opacity: { duration: 0.3 }
            }}
            style={{
              position: 'fixed',
              width: '80px',
              height: '100px',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 15px 35px rgba(0,0,0,0.25), 0 5px 10px rgba(0,0,0,0.15)',
              border: '2px solid rgba(255,255,255,0.4)',
              transformOrigin: 'center center',
              backgroundColor: '#fff',
              backdropFilter: 'blur(2px)'
            }}
          >
            <img 
              src={image.src} 
              alt="trail"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block'
              }}
              onError={(e) => {
                const target = e.currentTarget;
                target.style.backgroundColor = '#2a2a2a';
                target.style.display = 'flex';
                target.style.alignItems = 'center';
                target.style.justifyContent = 'center';
                target.style.color = 'white';
                target.style.fontSize = '12px';
                target.style.fontFamily = 'monospace';
                // @ts-ignore
                target.innerHTML = `${image.index + 1}`;
              }}
            />
            {/* Frame overlay effect */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.2)',
              borderRadius: '8px',
              pointerEvents: 'none'
            }} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default function HomePage(): React.JSX.Element {
  const [isMobile, setIsMobile] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const loadingOverlayRef = useRef<HTMLDivElement>(null);
  const welcomeTextRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<(HTMLDivElement | null)[]>([]);
  const menuruFullRef = useRef<HTMLSpanElement>(null);
  const menuruLetterMRef = useRef<HTMLSpanElement>(null);

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

  return (
    <>
      {/* Image Trail Effect - 10 foto portrait ukuran sedang */}
      {showContent && <ImageTrail />}

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
          
          {/* Judul Website */}
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
                    Gerakkan cursor untuk melihat efek Image Trail dengan 10 foto portrait.
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
