'use client';

import React, { useEffect, useRef, useState } from "react";
import Head from "next/head";
import gsap from "gsap";

const FONT_FAMILY = "'Poppins', 'Poppins Fallback', sans-serif";

// ===== SVG ICON PLUS =====
const PlusIcon = ({
  size = 16,
  color = "#ffffff",
}: {
  size?: number;
  color?: string;
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="4" y1="12" x2="20" y2="12" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <line x1="12" y1="4" x2="12" y2="20" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

// ===== CV PAGE =====
export default function CVPage(): React.JSX.Element {
  const cardRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLImageElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const plusWrapRef = useRef<HTMLDivElement>(null);
  const textTopRef = useRef<HTMLDivElement>(null);
  const textBottomRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLDivElement>(null);
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

  // Animasi GSAP icon plus → × (rotate 45°)
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
        height: "420px",
        objectFit: "cover",
        borderRadius: "0px",
        duration: 0.55,
        ease: "power3.inOut",
      });
    } else {
      gsap.to(photoRef.current, {
        height: "520px",
        objectFit: "cover",
        borderRadius: "0px",
        duration: 0.55,
        ease: "power3.inOut",
      });
    }
  }, [isOpen, isMounted]);

  // Animasi GSAP teks bawah (mode default)
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

  // Animasi GSAP teks atas (mode open) — di sisi KIRI
  useEffect(() => {
    if (!isMounted) return;
    if (!textTopRef.current) return;
    if (!isOpen) return;

    gsap.fromTo(
      textTopRef.current,
      { opacity: 0, x: -24 },
      { opacity: 1, x: 0, duration: 0.6, ease: "power2.out", delay: 0.15 }
    );
  }, [isOpen, isMounted]);

  // Animasi GSAP deskripsi bawah foto (mode open)
  useEffect(() => {
    if (!isMounted) return;
    if (!descRef.current) return;
    if (!isOpen) return;

    gsap.fromTo(
      descRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.7, ease: "power2.out", delay: 0.35 }
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
          {/* Card bg biru dengan scroll di dalam */}
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
            {/* Scrollable content di dalam card */}
            <div
              ref={scrollRef}
              className="cv-scroll"
              style={{
                width: "100%",
                height: "100%",
                overflowY: "auto",
                overflowX: "hidden",
                position: "relative",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {/* Foto */}
              <img
                ref={photoRef}
                src="/images/DSC_0614-min.JPG"
                alt="CV"
                style={{
                  width: "100%",
                  height: "520px",
                  objectFit: "cover",
                  objectPosition: "center center",
                  display: "block",
                  transition: "none",
                }}
              />

              {/* ===== TEKS DI ATAS FOTO (MODE OPEN) — SISI KIRI ===== */}
              {isOpen && (
                <div
                  ref={textTopRef}
                  style={{
                    position: "absolute",
                    top: "28px",
                    left: "24px",
                    textAlign: "left",
                    zIndex: 9,
                    fontFamily: FONT_FAMILY,
                    color: "#ffffff",
                    pointerEvents: "none",
                    lineHeight: 1.1,
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

              {/* ===== TEKS DI BAWAH FOTO (MODE DEFAULT) ===== */}
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

              {/* ===== DESKRIPSI BAWAH FOTO (MODE OPEN) ===== */}
              {isOpen && (
                <div
                  ref={descRef}
                  style={{
                    padding: "24px 24px 40px 24px",
                    fontFamily: FONT_FAMILY,
                    color: "#ffffff",
                    fontSize: "13px",
                    fontWeight: 400,
                    lineHeight: 1.7,
                    letterSpacing: "0.005em",
                    textAlign: "left",
                  }}
                >
                  Lulusan S1 Sistem Komputer Universitas Gunadarma dengan IPK 3,54.
                  Memiliki minat di bidang pengembangan web dan terus mengembangkan
                  kemampuan melalui pembelajaran mandiri menggunakan JavaScript,
                  React.js, Next.js, TypeScript, dan Astro. Memiliki pengalaman
                  mengerjakan proyek berbasis Arduino selama perkuliahan serta
                  memahami dasar penggunaan Firebase. Disiplin, cepat belajar,
                  bertanggung jawab, dan mampu bekerja secara individu maupun
                  dalam tim.
                </div>
              )}
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
                <PlusIcon size={16} color={isOpen ? "#0D3CFC" : "#ffffff"} />
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
          overflow-x: hidden;
        }
        /* Hapus scrollbar di sisi kanan window */
        html::-webkit-scrollbar,
        body::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
        html, body {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        /* Hapus scrollbar di dalam bg biru */
        .cv-scroll::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
        .cv-scroll {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
}
