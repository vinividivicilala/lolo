'use client';

import React, { useEffect, useRef, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import gsap from "gsap";

const FONT_FAMILY = "'Poppins', 'Poppins Fallback', sans-serif";

// ===== SVG ICONS =====
const MailIcon = ({ size = 18, color = "#ffffff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="2" y="4" width="20" height="16" rx="2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2 7L12 13L22 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PhoneIcon = ({ size = 18, color = "#ffffff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M22 16.92V19.92C22 20.4704 21.5523 20.9202 21 20.9302C20.35 20.9402 19.7 20.8802 19.06 20.7502C15.35 20.0202 12.13 18.1502 9.75 15.7702C7.37 13.3902 5.5 10.1702 4.77 6.46017C4.64 5.82017 4.58 5.17017 4.59 4.52017C4.6 3.97017 5.05 3.52017 5.6 3.52017H8.6C9.14 3.52017 9.6 3.93017 9.65 4.47017C9.72 5.26017 9.86 6.04017 10.08 6.79017C10.24 7.34017 10.09 7.93017 9.68 8.34017L8.41 9.61017C9.9 12.1502 12.29 14.5402 14.83 16.0302L16.1 14.7602C16.51 14.3502 17.1 14.2002 17.65 14.3602C18.4 14.5802 19.18 14.7202 19.97 14.7902C20.52 14.8402 20.93 15.3102 20.93 15.8502V16.9202Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MapPinIcon = ({ size = 18, color = "#ffffff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="10" r="3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LinkIcon = ({ size = 18, color = "#ffffff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M10 13C10.4295 13.5741 10.9774 14.0491 11.6066 14.3929C12.2357 14.7367 12.9315 14.9411 13.6467 14.9923C14.3618 15.0435 15.0796 14.9403 15.7513 14.6897C16.4231 14.4392 17.0331 14.047 17.54 13.54L20.54 10.54C21.4508 9.59695 21.9548 8.33394 21.9434 7.02296C21.932 5.71198 21.4061 4.45791 20.4791 3.53087C19.5521 2.60383 18.298 2.07799 16.987 2.0666C15.676 2.0552 14.413 2.55918 13.47 3.47L11.75 5.18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 11C13.5705 10.4259 13.0226 9.95083 12.3934 9.60704C11.7643 9.26325 11.0685 9.05886 10.3533 9.00769C9.63816 8.95652 8.92036 9.05971 8.24867 9.31026C7.57697 9.56081 6.96694 9.953 6.46 10.46L3.46 13.46C2.54918 14.403 2.0452 15.666 2.0566 16.977C2.068 18.288 2.59384 19.5421 3.52087 20.4691C4.44791 21.3962 5.70198 21.922 7.01296 21.9334C8.32394 21.9448 9.58695 21.4408 10.53 20.53L12.24 18.82" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BriefcaseIcon = ({ size = 18, color = "#ffffff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="2" y="7" width="20" height="14" rx="2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 7V5C8 3.89543 8.89543 3 10 3H14C15.1046 3 16 3.89543 16 5V7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2 13H22" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const GraduationIcon = ({ size = 18, color = "#ffffff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M22 10L12 5L2 10L12 15L22 10Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 12V17C6 17 9 20 12 20C15 20 18 17 18 17V12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const StarIcon = ({ size = 16, color = "#ffffff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill={color} />
  </svg>
);

const DownloadIcon = ({ size = 18, color = "#0D3CFC" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 10L12 15L17 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 15V3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ArrowLeft = ({ size = 20, color = "#0D3CFC" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ===== CV PAGE =====
export default function CVPage(): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
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

    if (containerRef.current) {
      const sections = containerRef.current.querySelectorAll("[data-cv-section]");
      gsap.fromTo(
        sections,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: "power2.out",
          delay: 0.4,
        }
      );
    }
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
        {/* ===== BG BIRU KOTAK PANJANG BESAR KE BAWAH DI TENGAH ===== */}
        <div
          ref={cardRef}
          style={{
            width: "100%",
            maxWidth: "900px",
            backgroundColor: "#0D3CFC",
            borderRadius: "20px",
            boxShadow: "0 20px 60px rgba(13,60,252,0.35)",
            padding: "48px 48px 56px 48px",
            color: "#ffffff",
            display: "flex",
            flexDirection: "column",
            gap: "32px",
            position: "relative",
          }}
        >
          {/* ===== TOMBOL BACK ===== */}
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              textDecoration: "none",
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: 600,
              fontFamily: FONT_FAMILY,
              alignSelf: "flex-start",
              padding: "8px 16px",
              backgroundColor: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: "10px",
            }}
          >
            <ArrowLeft size={16} color="#ffffff" />
            Back to Home
          </Link>

          {/* ===== HEADER: FOTO + NAMA + TITLE ===== */}
          <div
            data-cv-section
            style={{
              display: "flex",
              alignItems: "center",
              gap: "28px",
              flexWrap: "wrap",
            }}
          >
            {/* Foto profil */}
            <div
              style={{
                width: "140px",
                height: "140px",
                borderRadius: "20px",
                overflow: "hidden",
                border: "4px solid rgba(255,255,255,0.3)",
                flexShrink: 0,
                backgroundColor: "rgba(255,255,255,0.1)",
              }}
            >
              <img
                src="/images/ai.jpg"
                alt="Profile"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>

            {/* Nama + Title + Kontak */}
            <div style={{ flex: 1, minWidth: "260px" }}>
              <h1
                style={{
                  fontSize: "42px",
                  fontWeight: 700,
                  color: "#ffffff",
                  margin: 0,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.1,
                  fontFamily: FONT_FAMILY,
                }}
              >
                Farid Ardiansyah
              </h1>
              <p
                style={{
                  fontSize: "18px",
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.9)",
                  margin: "8px 0 16px 0",
                  letterSpacing: "0.02em",
                  fontFamily: FONT_FAMILY,
                }}
              >
                Full Stack Developer & UI Designer
              </p>

              {/* Kontak */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "14px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "rgba(255,255,255,0.9)", fontFamily: FONT_FAMILY }}>
                  <MailIcon size={16} color="#ffffff" />
                  farid@menuru.com
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "rgba(255,255,255,0.9)", fontFamily: FONT_FAMILY }}>
                  <PhoneIcon size={16} color="#ffffff" />
                  +62 812-3456-7890
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "rgba(255,255,255,0.9)", fontFamily: FONT_FAMILY }}>
                  <MapPinIcon size={16} color="#ffffff" />
                  Jakarta, Indonesia
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "rgba(255,255,255,0.9)", fontFamily: FONT_FAMILY }}>
                  <LinkIcon size={16} color="#ffffff" />
                  menuru.com
                </div>
              </div>
            </div>
          </div>

          {/* ===== GARIS PEMISAH ===== */}
          <div data-cv-section style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.25)", width: "100%" }} />

          {/* ===== TENTANG SAYA ===== */}
          <div data-cv-section style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: "#ffffff",
                margin: 0,
                letterSpacing: "0.02em",
                fontFamily: FONT_FAMILY,
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <StarIcon size={18} color="#ffffff" />
              About Me
            </h2>
            <p
              style={{
                fontSize: "14px",
                fontWeight: 400,
                lineHeight: 1.7,
                color: "rgba(255,255,255,0.9)",
                margin: 0,
                fontFamily: FONT_FAMILY,
              }}
            >
              Saya adalah seorang Full Stack Developer dengan pengalaman lebih dari 5 tahun dalam
              membangun aplikasi web modern. Fokus saya adalah menciptakan pengalaman digital yang
              cepat, aman, dan mudah digunakan. Saya senang bekerja dalam tim kolaboratif dan terus
              belajar teknologi baru untuk memberikan solusi terbaik.
            </p>
          </div>

          {/* ===== PENGALAMAN KERJA ===== */}
          <div data-cv-section style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: "#ffffff",
                margin: 0,
                letterSpacing: "0.02em",
                fontFamily: FONT_FAMILY,
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <BriefcaseIcon size={18} color="#ffffff" />
              Work Experience
            </h2>

            {[
              {
                role: "Senior Full Stack Developer",
                company: "Menuru Official",
                period: "2022 - Sekarang",
                desc: "Memimpin pengembangan platform e-commerce dengan Next.js, Firebase, dan sistem pembayaran terintegrasi.",
              },
              {
                role: "Frontend Developer",
                company: "Tech Innovate Studio",
                period: "2020 - 2022",
                desc: "Membangun UI/UX responsif untuk klien enterprise menggunakan React, TypeScript, dan Tailwind CSS.",
              },
              {
                role: "Junior Web Developer",
                company: "Digital Kreatif Agency",
                period: "2019 - 2020",
                desc: "Mengembangkan website company profile dan landing page untuk berbagai klien UMKM.",
              },
            ].map((exp, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "12px",
                  padding: "16px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                  <span
                    style={{
                      fontSize: "16px",
                      fontWeight: 700,
                      color: "#ffffff",
                      fontFamily: FONT_FAMILY,
                    }}
                  >
                    {exp.role}
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "rgba(255,255,255,0.85)",
                      fontFamily: FONT_FAMILY,
                    }}
                  >
                    {exp.period}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "rgba(255,255,255,0.95)",
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  {exp.company}
                </span>
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: 400,
                    lineHeight: 1.6,
                    color: "rgba(255,255,255,0.85)",
                    margin: 0,
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  {exp.desc}
                </p>
              </div>
            ))}
          </div>

          {/* ===== PENDIDIKAN ===== */}
          <div data-cv-section style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: "#ffffff",
                margin: 0,
                letterSpacing: "0.02em",
                fontFamily: FONT_FAMILY,
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <GraduationIcon size={18} color="#ffffff" />
              Education
            </h2>

            <div
              style={{
                backgroundColor: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "12px",
                padding: "16px 20px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                <span style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", fontFamily: FONT_FAMILY }}>
                  S1 Teknik Informatika
                </span>
                <span style={{ fontSize: "13px", fontWeight: 500, color: "rgba(255,255,255,0.85)", fontFamily: FONT_FAMILY }}>
                  2015 - 2019
                </span>
              </div>
              <span style={{ fontSize: "14px", fontWeight: 500, color: "rgba(255,255,255,0.95)", fontFamily: FONT_FAMILY }}>
                Universitas Indonesia
              </span>
              <p style={{ fontSize: "13px", fontWeight: 400, lineHeight: 1.6, color: "rgba(255,255,255,0.85)", margin: 0, fontFamily: FONT_FAMILY }}>
                Fokus pada pengembangan perangkat lunak dan sistem informasi. IPK 3.75/4.00.
              </p>
            </div>
          </div>

          {/* ===== SKILLS ===== */}
          <div data-cv-section style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: "#ffffff",
                margin: 0,
                letterSpacing: "0.02em",
                fontFamily: FONT_FAMILY,
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <StarIcon size={18} color="#ffffff" />
              Skills
            </h2>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {[
                "JavaScript", "TypeScript", "React", "Next.js", "Node.js",
                "Firebase", "Tailwind CSS", "GSAP", "Figma", "Git", "REST API", "MongoDB",
              ].map((skill, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#ffffff",
                    backgroundColor: "rgba(255,255,255,0.15)",
                    border: "1px solid rgba(255,255,255,0.3)",
                    borderRadius: "20px",
                    padding: "8px 16px",
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* ===== TOMBOL DOWNLOAD CV ===== */}
          <div data-cv-section style={{ display: "flex", justifyContent: "flex-start", marginTop: "8px" }}>
            <button
              onClick={() => window.print()}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 24px",
                backgroundColor: "#ffffff",
                color: "#0D3CFC",
                border: "none",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: FONT_FAMILY,
                boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
              }}
            >
              <DownloadIcon size={18} color="#0D3CFC" />
              Download CV (Print)
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
        @media print {
          body {
            background-color: #ffffff;
          }
          a, button {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
