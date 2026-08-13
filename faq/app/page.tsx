'use client';

import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
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

export default function HomePage(): React.JSX.Element {
  const [showMain, setShowMain] = useState(false);
  const preloaderRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  // Auth listener - mulai animasi preloader setelah auth selesai
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, () => {
      // Beri sedikit delay agar preloader terlihat
      setTimeout(() => {
        startPreloaderAnimation();
      }, 500);
    });
    return () => unsubscribe();
  }, []);

  const startPreloaderAnimation = () => {
    const tl = gsap.timeline({
      onComplete: () => {
        // Fade out preloader
        if (preloaderRef.current) {
          gsap.to(preloaderRef.current, {
            opacity: 0,
            duration: 0.6,
            ease: "power2.inOut",
            onComplete: () => {
              setShowMain(true);
              // Inisialisasi ScrollTrigger setelah halaman muncul
              initScrollAnimation();
            }
          });
        }
      }
    });

    // Reset posisi teks kanan
    gsap.set(textRef.current, { y: 100, opacity: 0 });

    // 1. Muncul dari bawah ke tengah (Shop)
    tl.to(textRef.current, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: "back.out(1.7)"
    });

    // Tunggu sebentar
    tl.to(textRef.current, {
      duration: 0.6
    });

    // 2. Ganti teks ke "Note" dengan animasi
    tl.to(textRef.current, {
      opacity: 0,
      y: -20,
      scale: 0.9,
      duration: 0.4,
      ease: "power2.out",
      onComplete: () => {
        if (textRef.current) {
          textRef.current.textContent = "Note";
        }
      }
    });

    tl.to(textRef.current, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.6,
      ease: "back.out(1.7)"
    });

    // Tunggu sebentar
    tl.to(textRef.current, {
      duration: 0.8
    });

    // 3. Hilang ke belakang (zoom out + fade)
    tl.to(textRef.current, {
      scale: 0.3,
      opacity: 0,
      duration: 0.7,
      ease: "power2.in"
    });

    // 4. Efek preloader sedikit mengecil
    tl.to(preloaderRef.current, {
      scale: 0.95,
      opacity: 0.8,
      duration: 0.3,
      ease: "power2.inOut"
    }, "-=0.3");
  };

  // Inisialisasi GSAP ScrollTrigger untuk animasi judul
  const initScrollAnimation = () => {
    if (!titleRef.current) return;

    // Buat timeline untuk judul
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 1.2,
        invalidateOnRefresh: true,
      }
    });

    // Animasi ukuran font dari 48px ke 400px
    tl.to(titleRef.current, {
      fontSize: "400px",
      fontWeight: 400, // tidak tebal
      duration: 1,
      ease: "power2.inOut",
    });
  };

  // Jika preloader masih muncul
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
          {/* Kiri: Menuru biru 100px */}
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
          {/* Kanan: teks berganti Shop/Note */}
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

  // Halaman utama setelah preloader hilang
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
        <meta property="og:image:alt" content="Menuru Official" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Menuru Official | Home" />
        <meta name="twitter:description" content="Menuru Brand from Love yourself" />
        <meta name="twitter:image" content="/images/ai.jpg" />
      </Head>

      <div
        style={{
          minHeight: "200vh", // tinggi agar bisa scroll
          backgroundColor: "#ffffff",
          margin: 0,
          padding: 0,
          position: "relative",
          fontFamily: FONT_FAMILY,
          overflow: "hidden", // scrollbar disembunyikan, tapi tetap bisa scroll
        }}
      >
        {/* Judul Menuru di kiri atas - ukuran akan berubah via GSAP */}
        <div
          style={{
            position: "fixed",
            top: "20px", // diberi jarak agar tidak terlalu ke pinggir
            left: "40px",
            zIndex: 15,
          }}
        >
          <h1
            ref={titleRef}
            style={{
              fontSize: "48px",
              fontWeight: 700, // awal tebal, nanti akan menjadi 400 (tidak tebal) saat besar
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

        {/* Tambahan konten dummy untuk memberi ruang scroll */}
        <div style={{ height: "100vh" }} />
        <div style={{ height: "50vh", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.1 }}>
          <span style={{ fontSize: "24px", color: "#ccc" }}>Scroll lebih banyak</span>
        </div>
      </div>
    </>
  );
}
