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

// Register GSAP plugin
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
  const menuruBigRef = useRef<HTMLSpanElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Animasi GSAP Scroll untuk teks MENURU besar - efek brutal
    if (menuruBigRef.current) {
      gsap.fromTo(menuruBigRef.current,
        {
          x: 0,
          opacity: 1,
          scale: 1,
          rotate: 0
        },
        {
          x: -800,
          opacity: 0,
          scale: 0.5,
          rotate: -10,
          duration: 2,
          ease: "power4.inOut",
          scrollTrigger: {
            trigger: menuruBigRef.current,
            start: "top top",
            end: "bottom center",
            scrub: 1.5,
            pin: false
          }
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div style={{
      minHeight: '200vh',
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
      MozOsxFontSmoothing: 'grayscale'
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
      
      {/* Teks MENURU besar dengan gaya BRUTAL */}
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
      
      {/* Area konten tambahan untuk scroll */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        width: '100%',
        height: '100vh',
        padding: '2rem',
        boxSizing: 'border-box',
        marginTop: '50vh'
      }} />
    </div>
  );
}
