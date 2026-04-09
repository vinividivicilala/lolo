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
  const contentRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

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

  // Animasi scroll konten
  useEffect(() => {
    if (!contentRef.current) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      const delta = e.deltaY > 0 ? 0.05 : -0.05;
      let newProgress = scrollProgress + delta;
      newProgress = Math.max(0, Math.min(1, newProgress));
      
      setScrollProgress(newProgress);
      
      // Animasi konten bergerak ke atas
      gsap.to(contentRef.current, {
        y: -newProgress * 500,
        duration: 0.5,
        ease: "power2.out"
      });
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [scrollProgress]);

  return (
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
      
      {/* Teks MENURU besar - TIDAK BERGERAK */}
      <div style={{
        position: 'fixed',
        top: 'calc(2rem + 80px)',
        left: 'calc(2rem + 20px)',
        zIndex: 2,
        pointerEvents: 'none'
      }}>
        <span style={{
          fontFamily: 'a2g, monospace, sans-serif',
          fontWeight: 400,
          fontStyle: 'normal',
          color: 'rgb(140, 0, 0)',
          fontSize: isMobile ? '100px' : '337px',
          lineHeight: isMobile ? '120px' : '412px',
          textAlign: 'left'
        }}>
          MENURU
        </span>
      </div>
      
      {/* Konten yang BISA DISCROLL */}
      <div 
        ref={contentRef}
        style={{
          position: 'relative',
          zIndex: 3,
          width: '100%',
          marginTop: isMobile ? '400px' : '600px',
          padding: '2rem',
          boxSizing: 'border-box',
          transform: 'translateY(0)'
        }}
      >
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          color: 'rgb(0, 20, 70)'
        }}>
          <h2 style={{
            fontFamily: 'ev-light, sans-serif',
            fontSize: '2rem',
            marginBottom: '2rem'
          }}>
            Welcome to MENURU
          </h2>
          
          <p style={{
            fontFamily: 'ev-light, sans-serif',
            fontSize: '1.2rem',
            lineHeight: '1.8',
            marginBottom: '2rem'
          }}>
            This is a scrolling content area. Scroll down to see more content.
          </p>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem'
          }}>
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} style={{
                padding: '2rem',
                backgroundColor: 'rgba(0, 20, 70, 0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(0, 20, 70, 0.1)'
              }}>
                <h3 style={{
                  fontSize: '1.5rem',
                  marginBottom: '1rem'
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
        opacity: 1 - scrollProgress,
        transition: 'opacity 0.3s ease',
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

      <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }
      `}</style>
    </div>
  );
}
