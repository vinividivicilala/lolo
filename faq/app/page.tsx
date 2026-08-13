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

export default function HomePage(): React.JSX.Element {
  const [showMain, setShowMain] = useState(false);
  const preloaderRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const words = ["Shop", "Note"];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  // Animasi teks berganti (Shop / Note) - modern Awwwards style
  useEffect(() => {
    if (!textRef.current) return;
    let interval: NodeJS.Timeout;
    let tl: gsap.core.Timeline;

    const animateText = () => {
      tl = gsap.timeline();
      tl.to(textRef.current, {
        opacity: 0,
        y: -30,
        scale: 0.8,
        duration: 0.5,
        ease: "power2.out"
      }).to(textRef.current, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        ease: "back.out(1.7)",
        delay: 0.2,
        onComplete: () => {
          setCurrentWordIndex((prev) => (prev + 1) % words.length);
        }
      });
    };

    // Jalankan pertama kali
    const timeout = setTimeout(() => {
      animateText();
    }, 300);

    interval = setInterval(() => {
      animateText();
    }, 2000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
      if (tl) tl.kill();
    };
  }, [words]);

  // Auth listener - tunggu auth selesai, lalu beri delay agar preloader terlihat
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, () => {
      // Setelah auth selesai, biarkan preloader berjalan selama 4 detik
      // agar animasi pergantian teks terlihat beberapa kali
      setTimeout(() => {
        if (preloaderRef.current) {
          gsap.to(preloaderRef.current, {
            opacity: 0,
            duration: 0.8,
            ease: "power2.inOut",
            onComplete: () => {
              setShowMain(true);
            }
          });
        }
      }, 4000);
    });
    return () => unsubscribe();
  }, []);

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
        <div style={{ display: "flex", alignItems: "center", gap: "40px" }}>
          {/* Kiri: MENURU biru 100px */}
          <span
            style={{
              fontSize: "100px",
              fontWeight: 700,
              color: "#0D3CFC",
              fontFamily: FONT_FAMILY,
              letterSpacing: "-0.03em",
            }}
          >
            MENURU
          </span>
          {/* Kanan: teks berganti Shop/Note hitam 50px */}
          <span
            ref={textRef}
            style={{
              fontSize: "50px",
              fontWeight: 600,
              color: "#000000",
              fontFamily: FONT_FAMILY,
              letterSpacing: "-0.02em",
              display: "inline-block",
            }}
          >
            {words[currentWordIndex]}
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
          minHeight: "100vh",
          backgroundColor: "#ffffff",
          margin: 0,
          padding: 0,
          position: "relative",
          fontFamily: FONT_FAMILY,
        }}
      >
        {/* ===== MENURU TITLE - TOP LEFT ===== */}
        <div
          style={{
            position: "absolute",
            top: "40px",
            left: "40px",
            zIndex: 15,
          }}
        >
          <span
            style={{
              fontSize: "48px",
              fontWeight: 700,
              color: "#000000",
              fontFamily: FONT_FAMILY,
              letterSpacing: "-0.03em",
              background: "transparent",
            }}
          >
            Menuru
          </span>
        </div>
      </div>
    </>
  );
}
