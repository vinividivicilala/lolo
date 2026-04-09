'use client';

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const menuruBigRef = useRef<HTMLSpanElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Sembunyikan scrollbar
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';

    return () => {
      document.body.style.overflow = '';
      document.body.style.height = '';
    };
  }, []);

  // Animasi scroll ke bawah tanpa scrollbar
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      if (isAnimating) return;
      
      const delta = e.deltaY > 0 ? 1 : -1;
      let newScrollY = scrollY + delta;
      
      // Batasan scroll (max 100)
      newScrollY = Math.max(0, Math.min(100, newScrollY));
      
      if (newScrollY === scrollY) return;
      
      setIsAnimating(true);
      setScrollY(newScrollY);
      
      // Animasi GSAP untuk teks MENURU
      if (menuruBigRef.current) {
        const progress = newScrollY / 100;
        
        gsap.to(menuruBigRef.current, {
          x: -800 * progress,
          opacity: 1 - progress,
          scale: 1 - (progress * 0.7),
          rotate: -10 * progress,
          duration: 0.8,
          ease: "power2.out",
          onComplete: () => {
            setIsAnimating(false);
          }
        });
      } else {
        setTimeout(() => setIsAnimating(false), 800);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [scrollY, isAnimating]);

  return (
    <div 
      ref={containerRef}
      style={{
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
        overflow: 'hidden',
        position: 'relative'
      }}>
      
      {/* Framed Layout */}
      <div style={{
        position: 'fixed',
        top: '2rem',
        left: '2rem',
        right: '2rem',
        bottom: '2rem',
        backgroundColor: '#dbd6c9',
        borderRadius: '20px',
        zIndex: 1,
        pointerEvents: 'none'
      }} />
      
      {/* Teks MENURU kecil di pojok kiri atas frame */}
      <div style={{
        position: 'fixed',
        top: 'calc(2rem + 16px)',
        left: 'calc(2rem + 20px)',
        zIndex: 2,
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
      
      {/* Teks MENURU besar dengan animasi scroll */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        padding: '2rem',
        paddingTop: 'calc(2rem + 80px)',
        boxSizing: 'border-box',
        width: '100%',
        overflow: 'hidden'
      }}>
        <span 
          ref={menuruBigRef}
          style={{
            fontFamily: "'Impact', 'Arial Black', 'Helvetica Black', 'Franklin Gothic Heavy', 'a2g', monospace, sans-serif",
            fontWeight: 900,
            fontStyle: 'normal',
            color: 'rgb(140, 0, 0)',
            fontSize: isMobile ? '180px' : '900px',
            lineHeight: '0.8',
            textAlign: 'left',
            display: 'inline-block',
            whiteSpace: 'nowrap',
            letterSpacing: '-15px',
            textTransform: 'uppercase',
            textShadow: '8px 8px 0px rgba(0,0,0,0.3)',
            WebkitTextStroke: '2px rgba(140,0,0,0.3)'
          }}>
          MENURU
        </span>
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
        opacity: 1 - (scrollY / 100),
        transition: 'opacity 0.3s ease'
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

      <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }
      `}</style>
    </div>
  );
}
