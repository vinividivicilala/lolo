'use client';

import React, { useEffect, useRef, useState } from "react";
import Head from "next/head";
import gsap from "gsap";

const FONT_FAMILY = "'Poppins', 'Poppins Fallback', sans-serif";

// ===== SVG ICON PLUS =====
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
    <line ref={lineRef1} x1="4" y1="12" x2="20" y2="12" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <line ref={lineRef2} x1="12" y1="4" x2="12" y2="20" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

// ===== SVG ICON CLOSE (X) =====
const CloseIcon = ({ size = 14, color = "#0D3CFC" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 6L18 18" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ===== SVG ICON MAIL =====
const MailIcon = ({ size = 16, color = "#0D3CFC" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="4" width="20" height="16" rx="2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2 7L12 13L22 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ===== WORK EXPERIENCE ITEM COMPONENT =====
const WorkExperienceItem = () => {
  const [expanded, setExpanded] = useState(false);
  const detailRef = useRef<HTMLDivElement>(null);
  const plusWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!detailRef.current) return;

    if (expanded) {
      gsap.fromTo(
        detailRef.current,
        { height: 0, opacity: 0 },
        { height: "auto", opacity: 1, duration: 0.5, ease: "power3.out" }
      );
    } else {
      gsap.to(detailRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.35,
        ease: "power2.in",
      });
    }
  }, [expanded]);

  useEffect(() => {
    if (!plusWrapRef.current) return;

    gsap.to(plusWrapRef.current, {
      rotate: expanded ? 45 : 0,
      duration: 0.4,
      ease: "power2.inOut",
      transformOrigin: "center center",
    });
  }, [expanded]);

  return (
    <div style={{ width: "100%", fontFamily: FONT_FAMILY, color: "#ffffff" }}>
      {/* Header row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        {/* Sisi kiri */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: "22px",
              fontWeight: 800,
              letterSpacing: "-0.01em",
              color: "#ffffff",
              lineHeight: 1.1,
              fontFamily: FONT_FAMILY,
            }}
          >
            01 Menuru
          </div>
          <div
            style={{
              fontSize: "14px",
              fontWeight: 500,
              color: "rgba(255,255,255,0.85)",
              fontFamily: FONT_FAMILY,
              letterSpacing: "0.01em",
            }}
          >
            Founder and Developer
          </div>
        </div>

        {/* Sisi kanan */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "8px",
            flexShrink: 0,
          }}
        >
          {/* Tanggal */}
          <div
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "rgba(255,255,255,0.85)",
              fontFamily: FONT_FAMILY,
              letterSpacing: "0.01em",
              whiteSpace: "nowrap",
            }}
          >
            Januari 2024 – Present
          </div>

          {/* Tombol More Info */}
          <button
            onClick={() => setExpanded((v) => !v)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 14px",
              backgroundColor: expanded ? "#ffffff" : "#F2EA6B",
              color: expanded ? "#0D3CFC" : "#000000",
              border: "none",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: FONT_FAMILY,
              letterSpacing: "0.02em",
              transition: "background-color 0.25s ease, color 0.25s ease",
              flexShrink: 0,
            }}
          >
            <div
              ref={plusWrapRef}
              style={{ display: "flex", alignItems: "center", transformOrigin: "center center" }}
            >
              {expanded ? (
                <CloseIcon size={14} color="#0D3CFC" />
              ) : (
                <PlusIcon size={14} color="#000000" />
              )}
            </div>
            <span>{expanded ? "Close" : "More Info"}</span>
          </button>
        </div>
      </div>

      {/* Detail expandable */}
      <div ref={detailRef} style={{ height: 0, opacity: 0, overflow: "hidden" }}>
        <div
          style={{
            marginTop: "18px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              fontWeight: 800,
              color: "#ffffff",
              fontFamily: FONT_FAMILY,
              letterSpacing: "0.01em",
            }}
          >
            Tanggung Jawab :
          </div>

          <ul
            style={{
              margin: 0,
              paddingLeft: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {[
              "Membangun dan mengembangkan website digital dari tahap perencanaan hingga deployment.",
              "Mengembangkan fitur menggunakan Next.js, React.js, Firebase, GSAP, Framer Motion.",
              "Mengelola UI/UX, database, authentication, serta integrasi layanan pihak ketiga.",
              "Mengelola hosting, deployment, dan maintenance website.",
              "Mengembangkan strategi digital untuk meningkatkan awareness dan penggunaan platform melalui google search dan instagram stories pribadi.",
            ].map((item, i) => (
              <li
                key={i}
                style={{
                  fontSize: "13px",
                  fontWeight: 400,
                  lineHeight: 1.6,
                  color: "rgba(255,255,255,0.9)",
                  fontFamily: FONT_FAMILY,
                  textAlign: "left",
                }}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

// ===== CV PAGE =====
export default function CVPage(): React.JSX.Element {
  const cardRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLImageElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const plusWrapRef = useRef<HTMLDivElement>(null);
  const plusLine1Ref = useRef<SVGLineElement>(null);
  const plusLine2Ref = useRef<SVGLineElement>(null);
  const textTopRef = useRef<HTMLDivElement>(null);
  const textBottomRef = useRef<HTMLDivElement>(null);
  const textParagraphRef = useRef<HTMLDivElement>(null);
  const textAboutRef = useRef<HTMLDivElement>(null);
  const textWorkRef = useRef<HTMLDivElement>(null);
  const workBlockRef = useRef<HTMLDivElement>(null);
  const contactButtonRef = useRef<HTMLButtonElement>(null);
  const contactPageRef = useRef<HTMLDivElement>(null);
  const contactContentRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showContact, setShowContact] = useState(false);

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

  // Animasi GSAP tombol Info/Close
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

  // Animasi GSAP icon plus → ×
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

  // Teks bawah (default)
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

  // Teks atas (open)
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

  // About
  useEffect(() => {
    if (!isMounted) return;
    if (!textAboutRef.current) return;
    if (!isOpen) return;

    gsap.fromTo(
      textAboutRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", delay: 0.3 }
    );
  }, [isOpen, isMounted]);

  // Paragraf
  useEffect(() => {
    if (!isMounted) return;
    if (!textParagraphRef.current) return;
    if (!isOpen) return;

    gsap.fromTo(
      textParagraphRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", delay: 0.4 }
    );
  }, [isOpen, isMounted]);

  // Work title
  useEffect(() => {
    if (!isMounted) return;
    if (!textWorkRef.current) return;
    if (!isOpen) return;

    gsap.fromTo(
      textWorkRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", delay: 0.5 }
    );
  }, [isOpen, isMounted]);

  // Work block
  useEffect(() => {
    if (!isMounted) return;
    if (!workBlockRef.current) return;
    if (!isOpen) return;

    gsap.fromTo(
      workBlockRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", delay: 0.6 }
    );
  }, [isOpen, isMounted]);

  // ===== ANIMASI TRANSISI HALAMAN: CV → CONTACT =====
  useEffect(() => {
    if (!isMounted) return;

    if (showContact) {
      // Contact page fade + slide in
      if (contactPageRef.current) {
        gsap.fromTo(
          contactPageRef.current,
          { opacity: 0, scale: 1.05 },
          { opacity: 1, scale: 1, duration: 0.5, ease: "power3.out" }
        );
      }
      // Content stagger in
      if (contactContentRef.current) {
        const items = contactContentRef.current.querySelectorAll("[data-contact-item]");
        gsap.fromTo(
          items,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out", delay: 0.2 }
        );
      }
    }
  }, [showContact, isMounted]);

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
          position: "relative",
          fontFamily: FONT_FAMILY,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "24px",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {/* ===== CV CARD (HALAMAN UTAMA) ===== */}
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "380px",
            height: "760px",
            zIndex: 1,
            opacity: showContact ? 0 : 1,
            pointerEvents: showContact ? "none" : "auto",
            transition: "opacity 0.4s ease",
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
            {/* ===== AREA SCROLL ===== */}
            <div
              ref={scrollRef}
              className="cv-scroll-inner"
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
              {/* Wrapper isi */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  minHeight: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Area foto */}
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "760px",
                    flexShrink: 0,
                  }}
                >
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

                  {/* Teks atas (open) */}
                  {isOpen && (
                    <div
                      ref={textTopRef}
                      style={{
                        position: "absolute",
                        top: "28px",
                        left: "24px",
                        zIndex: 9,
                        fontFamily: FONT_FAMILY,
                        color: "#ffffff",
                        pointerEvents: "none",
                        lineHeight: 1.1,
                        textAlign: "left",
                      }}
                    >
                      <div style={{ fontSize: "30px", fontWeight: 800, letterSpacing: "-0.01em", fontFamily: FONT_FAMILY }}>
                        People
                      </div>
                      <div style={{ fontSize: "30px", fontWeight: 800, letterSpacing: "-0.01em", fontFamily: FONT_FAMILY }}>
                        Menuru
                      </div>
                    </div>
                  )}

                  {/* Teks bawah (default) */}
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
                      <div style={{ fontSize: "26px", fontWeight: 800, letterSpacing: "-0.01em", fontFamily: FONT_FAMILY }}>
                        Curriculum Vitae
                      </div>
                      <div style={{ fontSize: "26px", fontWeight: 800, letterSpacing: "-0.01em", fontFamily: FONT_FAMILY }}>
                        Actual [ 16.09 ]
                      </div>
                    </div>
                  )}
                </div>

                {/* ===== ABOUT + PARAGRAF + WORK EXPERIENCE ===== */}
                {isOpen && (
                  <div
                    style={{
                      width: "100%",
                      padding: "24px 24px 60px 24px",
                      boxSizing: "border-box",
                      fontFamily: FONT_FAMILY,
                      color: "#ffffff",
                      display: "flex",
                      flexDirection: "column",
                      gap: "20px",
                    }}
                  >
                    <div
                      ref={textAboutRef}
                      style={{
                        fontSize: "30px",
                        fontWeight: 800,
                        letterSpacing: "-0.01em",
                        color: "#ffffff",
                        fontFamily: FONT_FAMILY,
                        lineHeight: 1.1,
                      }}
                    >
                      About
                    </div>

                    <div ref={textParagraphRef}>
                      <p
                        style={{
                          fontSize: "16px",
                          fontWeight: 700,
                          lineHeight: 1.5,
                          color: "#ffffff",
                          margin: 0,
                          fontFamily: FONT_FAMILY,
                          textAlign: "left",
                          letterSpacing: "-0.01em",
                        }}
                      >
                        Lulusan S1 Sistem Komputer Universitas Gunadarma dengan IPK 3,54. Memiliki minat di bidang pengembangan web dan terus mengembangkan kemampuan melalui pembelajaran mandiri menggunakan JavaScript, React.js, Next.js, TypeScript, dan Astro. Memiliki pengalaman mengerjakan proyek berbasis Arduino selama perkuliahan serta memahami dasar penggunaan Firebase. Disiplin, cepat belajar, bertanggung jawab, dan mampu bekerja secara individu maupun dalam tim.
                      </p>
                    </div>

                    <div
                      ref={textWorkRef}
                      style={{
                        fontSize: "30px",
                        fontWeight: 800,
                        letterSpacing: "-0.01em",
                        color: "#ffffff",
                        fontFamily: FONT_FAMILY,
                        lineHeight: 1.1,
                        marginTop: "8px",
                      }}
                    >
                      Work Experience
                    </div>

                    <div ref={workBlockRef}>
                      <WorkExperienceItem />
                    </div>

                    {/* ===== TOMBOL CONTACT ===== */}
                    <button
                      ref={contactButtonRef}
                      onClick={() => setShowContact(true)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "10px",
                        marginTop: "12px",
                        padding: "14px 24px",
                        backgroundColor: "#ffffff",
                        color: "#0D3CFC",
                        border: "none",
                        borderRadius: "12px",
                        fontSize: "15px",
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: FONT_FAMILY,
                        letterSpacing: "0.02em",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                        width: "100%",
                        transition: "transform 0.2s ease",
                      }}
                    >
                      <MailIcon size={18} color="#0D3CFC" />
                      Contact
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ===== TOMBOL INFO / CLOSE ===== */}
            <button
              ref={buttonRef}
              onClick={() => setIsOpen((v) => !v)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                zIndex: 20,
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

        {/* ===== HALAMAN CONTACT (OVERLAY) ===== */}
        {showContact && (
          <div
            ref={contactPageRef}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "#F2EA6B",
              zIndex: 100,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px",
              boxSizing: "border-box",
              fontFamily: FONT_FAMILY,
            }}
          >
            {/* Konten Contact */}
            <div
              ref={contactContentRef}
              style={{
                width: "100%",
                maxWidth: "420px",
                display: "flex",
                flexDirection: "column",
                gap: "24px",
                color: "#0D3CFC",
              }}
            >
              {/* Judul */}
              <div
                data-contact-item
                style={{
                  fontSize: "52px",
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  color: "#0D3CFC",
                  lineHeight: 1.05,
                  fontFamily: FONT_FAMILY,
                }}
              >
                Contact
              </div>

              {/* Sub-judul */}
              <div
                data-contact-item
                style={{
                  fontSize: "15px",
                  fontWeight: 500,
                  color: "rgba(13,60,252,0.85)",
                  fontFamily: FONT_FAMILY,
                  lineHeight: 1.6,
                }}
              >
                Mari terhubung! Saya terbuka untuk kolaborasi, proyek freelance, atau
                sekadar berdiskusi tentang teknologi dan desain.
              </div>

              {/* List kontak */}
              <div
                data-contact-item
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {[
                  { label: "Email", value: "farid@menuru.com" },
                  { label: "Phone", value: "+62 812-3456-7890" },
                  { label: "Instagram", value: "@menuru" },
                  { label: "Website", value: "menuru.com" },
                ].map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "16px",
                      padding: "16px 20px",
                      backgroundColor: "rgba(255,255,255,0.4)",
                      border: "1px solid rgba(13,60,252,0.25)",
                      borderRadius: "12px",
                      fontFamily: FONT_FAMILY,
                    }}
                  >
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "rgba(13,60,252,0.75)",
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                      }}
                    >
                      {item.label}
                    </span>
                    <span
                      style={{
                        fontSize: "15px",
                        fontWeight: 700,
                        color: "#0D3CFC",
                        textAlign: "right",
                        wordBreak: "break-all",
                      }}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Tombol Back */}
              <button
                data-contact-item
                onClick={() => setShowContact(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  padding: "14px 24px",
                  backgroundColor: "#0D3CFC",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "15px",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: FONT_FAMILY,
                  letterSpacing: "0.02em",
                  boxShadow: "0 8px 24px rgba(13,60,252,0.35)",
                  marginTop: "8px",
                }}
              >
                ← Back to CV
              </button>
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
          overflow: hidden;
          height: 100%;
          width: 100%;
        }
        html::-webkit-scrollbar,
        body::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
        .cv-scroll-inner::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
        .cv-scroll-inner {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
      `}</style>
    </>
  );
}
