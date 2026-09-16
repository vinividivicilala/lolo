'use client';

import React, { useEffect, useRef, useState } from "react";
import Head from "next/head";
import gsap from "gsap";

const FONT_FAMILY = "'Poppins', 'Poppins Fallback', sans-serif";

// ===== CV PAGE =====
export default function CVPage(): React.JSX.Element {
  const cardRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLImageElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Animasi GSAP masuk card
  useEffect(() => {
    if (!isMounted) return;
    if (!cardRef.current) return;

    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 60, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: "power3.out" }
    );
  }, [isMounted]);

  // Animasi GSAP tombol (warna transisi)
  useEffect(() => {
    if (!isMounted) return;
    if (!buttonRef.current) return;

    if (isOpen) {
      gsap.to(buttonRef.current, {
        backgroundColor: "#ffffff",
        color: "#0D3CFC",
        duration: 0.35,
        ease: "power2.out",
      });
    } else {
      gsap.to(buttonRef.current, {
        backgroundColor: "#0D3CFC",
        color: "#ffffff",
        duration: 0.35,
        ease: "power2.out",
      });
    }
  }, [isOpen, isMounted]);

  // Animasi GSAP foto: dari full menutupi card → ke tengah ukuran lebih besar
  useEffect(() => {
    if (!isMounted) return;
    if (!photoRef.current) return;

    if (isOpen) {
      gsap.to(photoRef.current, {
        top: "50%",
        left: "50%",
        xPercent: -50,
        yPercent: -50,
        width: "92%",
        height: "92%",
        objectFit: "contain",
        borderRadius: "12px",
        duration: 0.55,
        ease: "power3.inOut",
      });
    } else {
      gsap.to(photoRef.current, {
        top: 0,
        left: 0,
        xPercent: 0,
        yPercent: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        borderRadius: "20px",
        duration: 0.55,
        ease: "power3.inOut",
      });
    }
  }, [isOpen, isMounted]);

  // Animasi GSAP teks (fade + slide + warna)
  useEffect(() => {
    if (!isMounted) return;
    if (!textRef.current) return;

    // Fade out dulu
    gsap.to(textRef.current, {
      opacity: 0,
      y: -14,
      duration: 0.25,
      ease: "power2.in",
      onComplete: () => {
        if (!textRef.current) return;
        // Ganti teks via React state (di-render ulang), lalu fade in
        gsap.fromTo(
          textRef.current,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
        );
      },
    });
  }, [isOpen, isMounted]);

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
          minHeight: "200vh",
          width: "100%",
          backgroundColor: "#ffffff",
          position: "relative",
          fontFamily: FONT_FAMILY,
        }}
      >
        {/* ===== BG BIRU FIXED DI TENGAH + FOTO ===== */}
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "100%",
            maxWidth: "380px",
            height: "760px",
            zIndex: 1,
            pointerEvents: "auto",
          }}
        >
          {/* Card bg biru */}
          <div
            ref={cardRef}
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "#0D3CFC",
              borderRadius: "20px",
              boxShadow: "0 20px 60px rgba(13,60,252,0.35)",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* Foto di dalam card */}
            <img
              ref={photoRef}
              src="/images/DSC_0614-min.JPG"
              alt="CV"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center center",
                display: "block",
                borderRadius: "20px",
              }}
            />

            {/* ===== TEKS DI ATAS FOTO ===== */}
            <div
              ref={textRef}
              style={{
                position: "absolute",
                top: "24px",
                left: "0",
                width: "100%",
                textAlign: "center",
                zIndex: 9,
                fontFamily: FONT_FAMILY,
                fontSize: "18px",
                fontWeight: 700,
                letterSpacing: "0.04em",
                color: isOpen ? "#ffffff" : "#0D3CFC",
                pointerEvents: "none",
                textShadow: isOpen
                  ? "0 2px 8px rgba(0,0,0,0.35)"
                  : "0 2px 8px rgba(255,255,255,0.5)",
              }}
            >
              {isOpen ? "People Menuru" : "Curriculum Vitae Actual [ 16.09 ]"}
            </div>

            {/* ===== TOMBOL INFO / CLOSE DI ATAS KANAN ===== */}
            <button
              ref={buttonRef}
              onClick={() => setIsOpen((v) => !v)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                zIndex: 10,
                padding: "10px 20px",
                backgroundColor: "#0D3CFC",
                color: "#ffffff",
                border: "none",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: FONT_FAMILY,
                letterSpacing: "0.02em",
                boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
              }}
            >
              {isOpen ? "Close" : "Info"}
            </button>
          </div>
        </div>
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
