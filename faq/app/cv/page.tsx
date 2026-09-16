'use client';

import React, { useEffect, useRef, useState } from "react";
import Head from "next/head";
import gsap from "gsap";

const FONT_FAMILY = "'Poppins', 'Poppins Fallback', sans-serif";

// ===== SVG ICON PLUS (dengan 2 garis yang bisa dianimasikan) =====
const PlusIcon = ({
  size = 16,
  color = "#ffffff",
  lineRef1,
  lineRef2,
}: {
  size?: number;
  color?: string;
  lineRef1?: React.RefObject<SVGLineElement>;
  lineRef2?: React.RefObject<SVGLineElement>;
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line
      ref={lineRef1}
      x1="4"
      y1="12"
      x2="20"
      y2="12"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      ref={lineRef2}
      x1="12"
      y1="4"
      x2="12"
      y2="20"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

// ===== CV PAGE =====
export default function CVPage(): React.JSX.Element {
  const cardRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLImageElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const plusWrapRef = useRef<HTMLDivElement>(null);
  const plusLine1Ref = useRef<SVGLineElement>(null);
  const plusLine2Ref = useRef<SVGLineElement>(null);
  const textTopRef = useRef<HTMLDivElement>(null);
  const textBottomRef = useRef<HTMLDivElement>(null);
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

  // Animasi GSAP tombol (bg + teks)
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

  // Animasi GSAP icon plus → jadi × (rotate 45°) saat open
  useEffect(() => {
    if (!isMounted) return;
    if (!plusWrapRef.current) return;

    gsap.to(plusWrapRef.current, {
      rotate: isOpen ? 45 : 0,
      duration: 0.4,
      ease: "power2.inOut",
      transformOrigin: "center center",
    });
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

  // Animasi GSAP teks bawah (mode default) — warna putih di dalam card
  useEffect(() => {
    if (!isMounted) return;
    if (!textBottomRef.current) return;
    if (isOpen) return;

    gsap.fromTo(
      textBottomRef.current,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", delay: 0.3 }
    );
  }, [isOpen, isMounted]);

  // Animasi GSAP teks atas (mode open) — tetap DI DALAM card, warna putih
  useEffect(() => {
    if (!isMounted) return;
    if (!textTopRef.current) return;
    if (!isOpen) return;

    gsap.fromTo(
      textTopRef.current,
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

            {/* ===== TEKS DI ATAS (MODE OPEN) — DI DALAM CARD, WARNA PUTIH ===== */}
            {isOpen && (
              <div
                ref={textTopRef}
                style={{
                  position: "absolute",
                  top: "28px",
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

            {/* ===== TEKS DI BAWAH (MODE DEFAULT) — DI DALAM CARD, WARNA PUTIH ===== */}
            {!isOpen && (
              <div
                ref={textBottomRef}
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

            {/* ===== TOMBOL INFO / CLOSE DI ATAS KANAN DENGAN ICON PLUS ===== */}
            <button
              ref={buttonRef}
              onClick={() => setIsOpen((v) => !v)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                zIndex: 10,
                padding: "10px 18px",
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
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div
                ref={plusWrapRef}
                style={{ display: "flex", alignItems: "center", transformOrigin: "center center" }}
              >
                <PlusIcon
                  size={16}
                  color={isOpen ? "#0D3CFC" : "#ffffff"}
                  lineRef1={plusLine1Ref}
                  lineRef2={plusLine2Ref}
                />
              </div>
              <span>{isOpen ? "Close" : "Info"}</span>
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
