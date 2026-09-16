'use client';

import React, { useEffect, useRef, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import gsap from "gsap";

const FONT_FAMILY = "'Poppins', 'Poppins Fallback', sans-serif";

// ===== SVG ICONS =====
const ArrowLeft = ({ size = 20, color = "#0D3CFC" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ===== CV PAGE =====
export default function CVPage(): React.JSX.Element {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Animasi GSAP masuk
  useEffect(() => {
    if (!isMounted) return;
    if (!cardRef.current) return;

    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 60, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: "power3.out" }
    );
  }, [isMounted]);

  if (!isMounted) {
    return <div style={{ minHeight: "100vh", backgroundColor: "#ffffff" }} />;
  }

  return (
    <>
      <Head>
        <title>CV | Menuru Official</title>
        <meta name="description" content="CV - Menuru Official" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#0D3CFC" />
        <link rel="icon" href="/images/ai.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/images/ai.jpg" />
      </Head>

      {/* ===== BACKGROUND ===== */}
      <div
        style={{
          minHeight: "100vh",
          width: "100%",
          backgroundColor: "#ffffff",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "80px 24px 80px 24px",
          fontFamily: FONT_FAMILY,
          boxSizing: "border-box",
        }}
      >
        {/* ===== BG BIRU KOSONG — seukuran foto tapi lebih lebar & panjang ke bawah ===== */}
        <div
          ref={cardRef}
          style={{
            width: "100%",
            maxWidth: "560px",
            minHeight: "1400px",
            backgroundColor: "#0D3CFC",
            borderRadius: "20px",
            boxShadow: "0 20px 60px rgba(13,60,252,0.35)",
            padding: "0",
            position: "relative",
            display: "block",
          }}
        />
      </div>

      <style jsx global>{`
        html, body {
          margin: 0;
          padding: 0;
          background-color: #ffffff;
          font-family: ${FONT_FAMILY};
        }
        body::-webkit-scrollbar {
          width: 8px;
        }
        body::-webkit-scrollbar-thumb {
          background-color: #0D3CFC;
          border-radius: 4px;
        }
        body::-webkit-scrollbar-track {
          background-color: #f1f1f1;
        }
      `}</style>
    </>
  );
}
