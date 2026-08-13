'use client';

import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
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
  const subtitleRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

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

  const initScrollAnimations = () => {
    if (titleRef.current) {
      gsap.to(titleRef.current, {
        fontSize: "400px",
        fontWeight: 400,
        ease: "none",
        scrollTrigger: {
          trigger: "body",
          start: "top top",
          end: "bottom bottom",
          scrub: 1.2,
          invalidateOnRefresh: true,
        }
      });
    }
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
        style={{
          minHeight: "200vh",
          backgroundColor: "#ffffff",
          margin: 0,
          padding: 0,
          position: "relative",
          fontFamily: FONT_FAMILY,
          overflow: "hidden",
        }}
      >
        {/* Judul di kiri atas - berubah ukuran saat scroll */}
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

        {/* Subtitle - 2 baris, di bawah judul, rata kiri, warna biru */}
        <div
          ref={subtitleRef}
          className="subtitle"
          style={{
            position: "fixed",
            top: "150px",
            left: "40px",
            zIndex: 15,
            textAlign: "left",
          }}
        >
          <p
            style={{
              fontSize: "60px",
              fontWeight: 400,
              color: "#0D3CFC",
              fontFamily: FONT_FAMILY,
              lineHeight: 1.2,
              margin: 0,
              padding: 0,
              paddingBottom: "30px",
              whiteSpace: "pre-line",
            }}
          >
            {`You can take notes, find ideas,\nand donate money to those in need`}
          </p>
        </div>

        {/* Button / CTA - kotak border biru, tanpa panah */}
        <div
          ref={buttonRef}
          className="cta-button"
          style={{
            position: "fixed",
            top: "400px",
            left: "40px",
            zIndex: 15,
            display: "inline-block",
            border: "2px solid #0D3CFC",
            borderRadius: "8px",
            padding: "16px 40px",
            cursor: "pointer",
            transition: "all 0.3s ease",
            backgroundColor: "transparent",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#0D3CFC";
            e.currentTarget.style.color = "#ffffff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "#0D3CFC";
          }}
        >
          <span
            style={{
              fontSize: "24px",
              fontWeight: 500,
              color: "#0D3CFC",
              fontFamily: FONT_FAMILY,
              letterSpacing: "0.02em",
              transition: "color 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#ffffff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#0D3CFC";
            }}
          >
            Let's build now
          </span>
        </div>

        <div style={{ height: "100vh" }} />
        <div
          style={{
            height: "50vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0.1,
          }}
        >
          <span style={{ fontSize: "24px", color: "#ccc" }}>Scroll lebih banyak</span>
        </div>
      </div>

      <style jsx global>{`
        body {
          overflow: hidden !important;
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        body::-webkit-scrollbar {
          display: none;
        }

        @media (max-width: 1024px) {
          .subtitle p {
            font-size: 48px !important;
          }
          .subtitle {
            top: 130px !important;
          }
          .title {
            font-size: 36px !important;
          }
          .cta-button {
            top: 350px !important;
            padding: 14px 32px !important;
          }
          .cta-button span {
            font-size: 20px !important;
          }
        }
        @media (max-width: 768px) {
          .subtitle p {
            font-size: 36px !important;
          }
          .subtitle {
            top: 110px !important;
            left: 20px !important;
          }
          .title {
            font-size: 28px !important;
            top: 20px !important;
            left: 20px !important;
          }
          .cta-button {
            top: 280px !important;
            left: 20px !important;
            padding: 12px 24px !important;
          }
          .cta-button span {
            font-size: 18px !important;
          }
        }
        @media (max-width: 480px) {
          .subtitle p {
            font-size: 24px !important;
          }
          .subtitle {
            top: 90px !important;
            left: 16px !important;
          }
          .title {
            font-size: 22px !important;
            top: 16px !important;
            left: 16px !important;
          }
          .cta-button {
            top: 220px !important;
            left: 16px !important;
            padding: 10px 20px !important;
          }
          .cta-button span {
            font-size: 16px !important;
          }
        }
      `}</style>
    </>
  );
}
