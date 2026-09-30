'use client';

import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const FONT_FAMILY = "'Plus Jakarta Sans'";
const BLUE = "#0D3CFC";
const WHITE = "#FFFFFF";
const BLACK = "#000000";

const footerLinks = [
  { title: "Get in Touch", links: ["Contact Us", "Instagram", "Live Chat"] },
  {
    title: "Product",
    links: ["Shop", "Note", "Calendar", "Blog", "Donation", "Community", "Live Chat Agent", "Stories"],
  },
  {
    title: "Attention",
    links: ["Privacy Policy", "Terms & Conditions", "About Us", "Terms of Use", "Cookies Policy", "Help Center"],
  },
];

export default function NotFoundPage(): React.JSX.Element {
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const char4Ref = useRef<HTMLSpanElement>(null);
  const eyesRef = useRef<HTMLDivElement>(null);
  const char4bRef = useRef<HTMLSpanElement>(null);
  const eyeLeftRef = useRef<HTMLDivElement>(null);
  const eyeRightRef = useRef<HTMLDivElement>(null);
  const pupilLeftRef = useRef<HTMLDivElement>(null);
  const pupilRightRef = useRef<HTMLDivElement>(null);
  const mouthRef = useRef<HTMLDivElement>(null);
  const teethTopRef = useRef<HTMLDivElement>(null);
  const teethBottomRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ===== Falling animation untuk karakter 4, (mata), 4 =====
  useEffect(() => {
    if (!isMounted) return;
    if (!char4Ref.current || !eyesRef.current || !char4bRef.current) return;

    const ctx = gsap.context(() => {
      const chars = [char4Ref.current, eyesRef.current, char4bRef.current];

      gsap.set(chars, {
        yPercent: -200,
        opacity: 0,
        rotate: -180,
        scale: 0.3,
        transformOrigin: "50% 0%",
        force3D: true,
      });

      const tl = gsap.timeline({ delay: 0.2 });

      tl.to(chars[0], {
        yPercent: 0,
        opacity: 1,
        rotate: 0,
        scale: 1,
        duration: 1.2,
        ease: "bounce.out",
      })
        .to(
          chars[1],
          {
            yPercent: 0,
            opacity: 1,
            rotate: 0,
            scale: 1,
            duration: 1.2,
            ease: "bounce.out",
          },
          "-=0.9"
        )
        .to(
          chars[2],
          {
            yPercent: 0,
            opacity: 1,
            rotate: 0,
            scale: 1,
            duration: 1.2,
            ease: "bounce.out",
          },
          "-=0.9"
        )
        .to(
          chars,
          {
            keyframes: [
              { scaleY: 0.94, scaleX: 1.04, duration: 0.08 },
              { scaleY: 1, scaleX: 1, duration: 0.22, ease: "power2.out" },
            ],
          },
          "-=0.2"
        );
    }, containerRef);

    return () => ctx.revert();
  }, [isMounted]);

  // ===== Pupil + mulut + gigi mengikuti cursor mouse =====
  useEffect(() => {
    if (!isMounted) return;

    const updateMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const tick = () => {
      const eyeL = eyeLeftRef.current;
      const eyeR = eyeRightRef.current;
      const pupilL = pupilLeftRef.current;
      const pupilR = pupilRightRef.current;
      const mouth = mouthRef.current;
      const teethTop = teethTopRef.current;
      const teethBottom = teethBottomRef.current;

      // ===== Pupil mengikuti cursor =====
      if (eyeL && pupilL) {
        const rect = eyeL.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = mouseRef.current.x - cx;
        const dy = mouseRef.current.y - cy;
        const maxMove = rect.width * 0.26;
        const dist = Math.hypot(dx, dy);
        const angle = Math.atan2(dy, dx);
        const moveX = Math.cos(angle) * Math.min(dist, maxMove);
        const moveY = Math.sin(angle) * Math.min(dist, maxMove);
        gsap.set(pupilL, { x: moveX, y: moveY });
      }

      if (eyeR && pupilR) {
        const rect = eyeR.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = mouseRef.current.x - cx;
        const dy = mouseRef.current.y - cy;
        const maxMove = rect.width * 0.26;
        const dist = Math.hypot(dx, dy);
        const angle = Math.atan2(dy, dx);
        const moveX = Math.cos(angle) * Math.min(dist, maxMove);
        const moveY = Math.sin(angle) * Math.min(dist, maxMove);
        gsap.set(pupilR, { x: moveX, y: moveY });
      }

      // ===== Mulut & gigi mengikuti jarak cursor =====
      if (mouth) {
        const rect = mouth.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = mouseRef.current.x - cx;
        const dy = mouseRef.current.y - cy;
        const dist = Math.hypot(dx, dy);
        const viewportDiag = Math.hypot(window.innerWidth, window.innerHeight);

        // 0 = dekat (tertutup rapat), 1 = jauh (terbuka lebar)
        const openness = Math.min(dist / (viewportDiag * 0.45), 1);

        // height mulut: dari 8% (tertutup) → 42% (buka lebar)
        const mouthHeight = 8 + openness * 34;

        gsap.to(mouth, {
          height: mouthHeight + "%",
          duration: 0.35,
          ease: "power2.out",
          overwrite: true,
        });

        // Gigi atas turun saat mulut terbuka
        if (teethTop) {
          gsap.to(teethTop, {
            y: openness * 14,
            duration: 0.35,
            ease: "power2.out",
            overwrite: true,
          });
        }
        // Gigi bawah naik saat mulut terbuka
        if (teethBottom) {
          gsap.to(teethBottom, {
            y: -openness * 14,
            duration: 0.35,
            ease: "power2.out",
            overwrite: true,
          });
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", updateMouse);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", updateMouse);
      cancelAnimationFrame(rafRef.current);
    };
  }, [isMounted]);

  if (!isMounted) {
    return <div style={{ minHeight: "100vh", backgroundColor: WHITE, overflow: "hidden" }} />;
  }

  return (
    <>
      <Head>
        <title>404 | Menuru</title>
        <meta name="description" content="Page not found" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />
        <meta name="theme-color" content={BLUE} />
      </Head>

      {/* ===== WRAPPER utama ===== */}
      <div
        style={{
          width: "100%",
          minHeight: "100vh",
          backgroundColor: WHITE,
          fontFamily: FONT_FAMILY,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflowX: "hidden",
        }}
      >
        {/* ===== SECTION 404 (fullscreen, tanpa sidebar & garis) ===== */}
        <div
          ref={containerRef}
          style={{
            width: "100%",
            height: "100vh",
            backgroundColor: WHITE,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            position: "relative",
            flexShrink: 0,
            padding: "20px",
          }}
        >
          {/* ===== Teks "Sorry..." di tengah atas — 2 baris, 100px, biru ===== */}
          <p
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: "100px",
              fontWeight: 700,
              color: BLUE,
              lineHeight: 1,
              letterSpacing: "-0.04em",
              margin: 0,
              marginBottom: "clamp(20px, 4vh, 60px)",
              textAlign: "center",
            }}
          >
            Sorry, we can&apos;t find
            <br />
            the page you&apos;re looking for.
          </p>

          {/* ===== Teks 404 di tengah ===== */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "1vw",
              flexWrap: "nowrap",
              userSelect: "none",
              lineHeight: 0.85,
            }}
          >
            {/* Karakter "4" pertama */}
            <span
              ref={char4Ref}
              style={{
                fontFamily: FONT_FAMILY,
                fontSize: "clamp(120px, 26vw, 400px)",
                fontWeight: 400,
                color: BLUE,
                lineHeight: 0.85,
                letterSpacing: "-0.06em",
                display: "inline-block",
                willChange: "transform, opacity",
              }}
            >
              4
            </span>

            {/* Karakter "0" = 2 mata + alis + mulut dengan gigi bergerak */}
            <div
              ref={eyesRef}
              style={{
                position: "relative",
                width: "clamp(160px, 26vw, 380px)",
                height: "clamp(200px, 34vw, 500px)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                willChange: "transform, opacity",
                gap: "6%",
              }}
            >
              {/* ===== Baris mata ===== */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "20%",
                }}
              >
                {/* Mata kiri + alis */}
                <div
                  style={{
                    position: "relative",
                    width: "38%",
                    aspectRatio: "1 / 1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg
                    width="100%"
                    height="40%"
                    viewBox="0 0 100 40"
                    style={{
                      position: "absolute",
                      top: "-32%",
                      left: 0,
                      overflow: "visible",
                      pointerEvents: "none",
                    }}
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M 6 36 Q 50 2 94 36"
                      fill="none"
                      stroke={BLUE}
                      strokeWidth="6"
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>

                  <div
                    ref={eyeLeftRef}
                    style={{
                      width: "100%",
                      aspectRatio: "1 / 1",
                      borderRadius: "50%",
                      border: "clamp(3px, 0.4vw, 6px) solid " + BLUE,
                      backgroundColor: "transparent",
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      ref={pupilLeftRef}
                      style={{
                        width: "44%",
                        height: "44%",
                        borderRadius: "50%",
                        backgroundColor: BLUE,
                        willChange: "transform",
                      }}
                    />
                  </div>
                </div>

                {/* Mata kanan + alis */}
                <div
                  style={{
                    position: "relative",
                    width: "38%",
                    aspectRatio: "1 / 1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg
                    width="100%"
                    height="40%"
                    viewBox="0 0 100 40"
                    style={{
                      position: "absolute",
                      top: "-32%",
                      left: 0,
                      overflow: "visible",
                      pointerEvents: "none",
                    }}
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M 6 36 Q 50 2 94 36"
                      fill="none"
                      stroke={BLUE}
                      strokeWidth="6"
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>

                  <div
                    ref={eyeRightRef}
                    style={{
                      width: "100%",
                      aspectRatio: "1 / 1",
                      borderRadius: "50%",
                      border: "clamp(3px, 0.4vw, 6px) solid " + BLUE,
                      backgroundColor: "transparent",
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      ref={pupilRightRef}
                      style={{
                        width: "44%",
                        height: "44%",
                        borderRadius: "50%",
                        backgroundColor: BLUE,
                        willChange: "transform",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* ===== Mulut dengan gigi (bergerak sesuai jarak cursor) ===== */}
              <div
                ref={mouthRef}
                style={{
                  position: "relative",
                  width: "70%",
                  height: "10%",
                  border: "clamp(3px, 0.4vw, 6px) solid " + BLUE,
                  borderRadius: "999px",
                  backgroundColor: "transparent",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  willChange: "height",
                }}
              >
                {/* Gigi atas */}
                <div
                  ref={teethTopRef}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "6%",
                    paddingTop: "2%",
                    willChange: "transform",
                  }}
                >
                  <div
                    style={{
                      width: "18%",
                      height: "clamp(10px, 1.2vw, 18px)",
                      border: "clamp(2px, 0.3vw, 4px) solid " + BLUE,
                      borderTop: "none",
                      borderBottomLeftRadius: "6px",
                      borderBottomRightRadius: "6px",
                    }}
                  />
                  <div
                    style={{
                      width: "18%",
                      height: "clamp(10px, 1.2vw, 18px)",
                      border: "clamp(2px, 0.3vw, 4px) solid " + BLUE,
                      borderTop: "none",
                      borderBottomLeftRadius: "6px",
                      borderBottomRightRadius: "6px",
                    }}
                  />
                  <div
                    style={{
                      width: "18%",
                      height: "clamp(10px, 1.2vw, 18px)",
                      border: "clamp(2px, 0.3vw, 4px) solid " + BLUE,
                      borderTop: "none",
                      borderBottomLeftRadius: "6px",
                      borderBottomRightRadius: "6px",
                    }}
                  />
                </div>

                {/* Lidah minimalist */}
                <div
                  style={{
                    alignSelf: "center",
                    width: "32%",
                    height: "30%",
                    borderRadius: "0 0 999px 999px",
                    border: "clamp(2px, 0.3vw, 4px) solid " + BLUE,
                    borderTop: "none",
                    backgroundColor: "transparent",
                  }}
                />

                {/* Gigi bawah */}
                <div
                  ref={teethBottomRef}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "6%",
                    paddingBottom: "2%",
                    willChange: "transform",
                  }}
                >
                  <div
                    style={{
                      width: "18%",
                      height: "clamp(10px, 1.2vw, 18px)",
                      border: "clamp(2px, 0.3vw, 4px) solid " + BLUE,
                      borderBottom: "none",
                      borderTopLeftRadius: "6px",
                      borderTopRightRadius: "6px",
                    }}
                  />
                  <div
                    style={{
                      width: "18%",
                      height: "clamp(10px, 1.2vw, 18px)",
                      border: "clamp(2px, 0.3vw, 4px) solid " + BLUE,
                      borderBottom: "none",
                      borderTopLeftRadius: "6px",
                      borderTopRightRadius: "6px",
                    }}
                  />
                  <div
                    style={{
                      width: "18%",
                      height: "clamp(10px, 1.2vw, 18px)",
                      border: "clamp(2px, 0.3vw, 4px) solid " + BLUE,
                      borderBottom: "none",
                      borderTopLeftRadius: "6px",
                      borderTopRightRadius: "6px",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Karakter "4" kedua */}
            <span
              ref={char4bRef}
              style={{
                fontFamily: FONT_FAMILY,
                fontSize: "clamp(120px, 26vw, 400px)",
                fontWeight: 400,
                color: BLUE,
                lineHeight: 0.85,
                letterSpacing: "-0.06em",
                display: "inline-block",
                willChange: "transform, opacity",
              }}
            >
              4
            </span>
          </div>
        </div>

        {/* ===== FOOTER LENGKAP (tanpa borderTop di atas) ===== */}
        <div
          style={{
            width: "100%",
            padding: "60px 40px 40px 40px",
            backgroundColor: WHITE,
            position: "relative",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "40px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "200px",
              height: "auto",
              opacity: 0.8,
            }}
          >
            <img src="/images/p0l.jpg" alt="" style={{ width: "100%", height: "auto", display: "block", objectFit: "cover" }} />
          </div>
          <div
            style={{
              position: "absolute",
              right: "40px",
              top: "50%",
              transform: "translateY(-50%)",
              width: "200px",
              height: "auto",
              opacity: 0.8,
            }}
          >
            <img src="/images/xxz.jpg" alt="" style={{ width: "100%", height: "auto", display: "block", objectFit: "cover" }} />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              maxWidth: "1400px",
              margin: "0 auto",
              gap: "40px",
              flexWrap: "wrap",
              position: "relative",
              zIndex: 1,
            }}
          >
            {footerLinks.map((section, idx) => (
              <div key={idx} style={{ flex: "1", minWidth: "200px" }}>
                <h3
                  style={{
                    fontFamily: FONT_FAMILY,
                    fontSize: "28px",
                    fontWeight: 600,
                    color: BLACK,
                    margin: 0,
                    marginBottom: "16px",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {section.title}
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {section.links.map((link, linkIdx) => {
                    let linkHref = "#";
                    let isAttention = false;
                    let isStories = false;
                    if (link === "Contact Us") linkHref = "/contact";
                    else if (link === "Live Chat") linkHref = "/live-chat";
                    else if (link === "Live Chat Agent") linkHref = "/live-chat-agent";
                    else if (link === "Help Center") linkHref = "/pusat-bantuan";
                    else if (link === "About Us") {
                      linkHref = "/profile";
                      isAttention = true;
                    } else if (link === "Privacy Policy") {
                      linkHref = "/privacy-policy";
                      isAttention = true;
                    } else if (link === "Terms & Conditions") {
                      linkHref = "/terms-of-services";
                      isAttention = true;
                    } else if (link === "Terms of Use") {
                      linkHref = "/terms-of-use";
                      isAttention = true;
                    } else if (link === "Cookies Policy") {
                      linkHref = "/cookie-policy";
                      isAttention = true;
                    } else if (link === "Stories") {
                      linkHref = "/stories";
                      isStories = true;
                    } else if (link === "Shop") linkHref = "/shop";
                    else if (link === "Note") linkHref = "/note";
                    else if (link === "Calendar") linkHref = "/calendar";
                    else if (link === "Blog") linkHref = "/blog";
                    else if (link === "Donation") linkHref = "/donation";
                    else if (link === "Community") linkHref = "/community";
                    else if (link === "Instagram") linkHref = "https://instagram.com/menuru";

                    return (
                      <div key={linkIdx} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <Link href={linkHref} style={{ textDecoration: "none" }}>
                          <span
                            style={{
                              fontFamily: FONT_FAMILY,
                              fontSize: "20px",
                              fontWeight: 400,
                              color: BLUE,
                              letterSpacing: "-0.01em",
                              cursor: "pointer",
                            }}
                          >
                            {link}
                          </span>
                        </Link>
                        {isAttention && (
                          <span
                            style={{
                              backgroundColor: WHITE,
                              border: `1.5px solid ${BLUE}`,
                              color: BLUE,
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontSize: "10px",
                              fontWeight: 800,
                              fontFamily: FONT_FAMILY,
                              letterSpacing: "0.5px",
                              textTransform: "uppercase",
                              display: "inline-block",
                            }}
                          >
                            Updated
                          </span>
                        )}
                        {isStories && (
                          <span
                            style={{
                              backgroundColor: WHITE,
                              border: `1.5px solid ${BLUE}`,
                              color: BLUE,
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontSize: "10px",
                              fontWeight: 800,
                              fontFamily: FONT_FAMILY,
                              letterSpacing: "0.5px",
                              textTransform: "uppercase",
                              display: "inline-block",
                            }}
                          >
                            New
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              maxWidth: "1400px",
              margin: "40px auto 0 auto",
              position: "relative",
              zIndex: 1,
            }}
          >
            <p
              style={{
                fontFamily: FONT_FAMILY,
                fontSize: "14px",
                fontWeight: 400,
                color: "#666",
                margin: 0,
                textAlign: "center",
                letterSpacing: "0.01em",
              }}
            >
              Terms and conditions apply. By using this website, you agree to our Terms of Use and Privacy Policy.
            </p>
          </div>
        </div>

        {/* ===== FOOTER MENURU besar + copyright ===== */}
        <div
          style={{
            width: "100%",
            padding: "0 40px 20px 40px",
            backgroundColor: WHITE,
            overflow: "visible",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            position: "relative",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: "clamp(120px, 40vw, 600px)",
              fontWeight: 400,
              color: BLUE,
              letterSpacing: "-0.05em",
              lineHeight: "0.85",
              display: "block",
              textAlign: "left",
              WebkitFontSmoothing: "antialiased",
              whiteSpace: "nowrap",
              margin: 0,
              padding: 0,
            }}
          >
            Menuru
          </span>
          <div style={{ width: "100%", display: "flex", justifyContent: "flex-start", marginTop: "10px" }}>
            <span
              style={{
                fontFamily: FONT_FAMILY,
                fontSize: "16px",
                fontWeight: 400,
                color: BLUE,
                letterSpacing: "0.01em",
                opacity: 0.8,
              }}
            >
              2024 - 2026 Menuru. All rights reserved.
            </span>
          </div>
        </div>
      </div>

      <style jsx global>{`
        html,
        body {
          margin: 0;
          padding: 0;
          background-color: #ffffff;
          width: 100%;
          min-height: 100%;
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        html::-webkit-scrollbar,
        body::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        * {
          box-sizing: border-box;
        }
      `}</style>
    </>
  );
}
