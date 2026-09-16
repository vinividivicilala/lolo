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
  const textInsideRef = useRef<HTMLDivElement>(null); // teks di dalam/bawah foto (mode default)
  const textAboveRef = useRef<HTMLDivElement>(null);  // teks di atas foto (mode open)
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

  // Animasi GSAP tombol
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

  // Animasi GSAP foto
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

  // Animasi GSAP teks di bawah foto (mode default) — 2 baris
  useEffect(() => {
    if (!isMounted) return;
    if (!textInsideRef.current) return;
    if (isOpen) return; // hanya muncul saat mode default

    gsap.fromTo(
      textInsideRef.current,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", delay: 0.3 }
    );
  }, [isOpen, isMounted]);

  // Animasi GSAP teks di atas foto (mode open)
  useEffect(() => {
    if (!isMounted) return;
    if (!textAboveRef.current) return;
    if (!isOpen) return; // hanya muncul saat mode open

    gsap.fromTo(
      textAboveRef.current,
      { opacity: 0, y: -24 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", delay: 0.15 }
    );
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

            {/* ===== TEKS DI BAWAH FOTO (MODE DEFAULT) — 2 BARIS ===== */}
            {!isOpen && (
              <div
                ref={textInsideRef}
                style={{
                  position: "absolute",
                  bottom: "28px",
                  left: "0",
                  width: "100%",
                  textAlign: "center",
                  zIndex: 9,
                  fontFamily: FONT_FAMILY,
                  color: "#ffffff",
                  pointerEvents: "none",
                  lineHeight: 1.1,
                  textShadow: "0 4px 16px rgba(0,0,0,0.55)",
                  padding: "0 16px",
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    fontSize: "26px",
                    fontWeight: 800,
                    letterSpacing: "-0.01em",
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  Curriculum Vitae
                </div>
                <div
                  style={{
                    fontSize: "26px",
                    fontWeight: 800,
                    letterSpacing: "-0.01em",
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  Actual [ 16.09 ]
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ===== TEKS DI ATAS FOTO (MODE OPEN) — DI LUAR CARD ===== */}
        {isOpen && (
          <div
            ref={textAboveRef}
            style={{
              position: "fixed",
              top: "calc(50% - 380px - 40px)",
              left: "50%",
              transform: "translateX(-50%)",
              width: "100%",
              maxWidth: "380px",
              textAlign: "center",
              zIndex: 2,
              fontFamily: FONT_FAMILY,
              color: "#0D3CFC",
              pointerEvents: "none",
              lineHeight: 1.1,
              padding: "0 16px",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                fontSize: "30px",
                fontWeight: 800,
                letterSpacing: "-0.01em",
                fontFamily: FONT_FAMILY,
              }}
            >
              People
            </div>
            <div
              style={{
                fontSize: "30px",
                fontWeight: 800,
                letterSpacing: "-0.01em",
                fontFamily: FONT_FAMILY,
              }}
            >
              Menuru
            </div>
          </div>
        )}
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
