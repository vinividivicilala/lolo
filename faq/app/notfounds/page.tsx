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

export default function NotFoundPage(): React.JSX.Element {
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const char4Ref = useRef<HTMLSpanElement>(null);
  const char0Ref = useRef<HTMLDivElement>(null);
  const char4bRef = useRef<HTMLSpanElement>(null);
  const eyeLeftRef = useRef<HTMLDivElement>(null);
  const eyeRightRef = useRef<HTMLDivElement>(null);
  const pupilLeftRef = useRef<HTMLDivElement>(null);
  const pupilRightRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ===== Falling animation untuk karakter 4, 0, 4 =====
  useEffect(() => {
    if (!isMounted) return;
    if (!char4Ref.current || !char0Ref.current || !char4bRef.current) return;

    const ctx = gsap.context(() => {
      const chars = [char4Ref.current, char0Ref.current, char4bRef.current];

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

  // ===== Pupil mengikuti cursor mouse =====
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

      <div
        ref={containerRef}
        style={{
          width: "100vw",
          height: "100vh",
          backgroundColor: WHITE,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT_FAMILY,
          overflow: "hidden",
          position: "fixed",
          top: 0,
          left: 0,
          padding: "20px",
        }}
      >
        {/* ===== Teks 404 ===== */}
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
              fontSize: "clamp(200px, 40vw, 900px)",
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

          {/* Karakter "0" diganti emoticon garis minimalist */}
          <div
            ref={char0Ref}
            style={{
              position: "relative",
              width: "clamp(180px, 36vw, 810px)",
              height: "clamp(180px, 36vw, 810px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              willChange: "transform, opacity",
            }}
          >
            {/* Lingkaran luar "0" — outline saja */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                border: "clamp(4px, 0.6vw, 10px) solid " + BLUE,
                backgroundColor: "transparent",
              }}
            />

            {/* Wajah di dalam lingkaran */}
            <div
              style={{
                position: "relative",
                width: "76%",
                height: "76%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "6%",
              }}
            >
              {/* Dua mata */}
              <div
                style={{
                  display: "flex",
                  gap: "14%",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                {/* Mata kiri */}
                <div
                  ref={eyeLeftRef}
                  style={{
                    width: "32%",
                    aspectRatio: "1 / 1",
                    borderRadius: "50%",
                    backgroundColor: "transparent",
                    border: "clamp(3px, 0.5vw, 8px) solid " + BLUE,
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
                      width: "48%",
                      height: "48%",
                      borderRadius: "50%",
                      backgroundColor: BLUE,
                      willChange: "transform",
                    }}
                  />
                </div>

                {/* Mata kanan */}
                <div
                  ref={eyeRightRef}
                  style={{
                    width: "32%",
                    aspectRatio: "1 / 1",
                    borderRadius: "50%",
                    backgroundColor: "transparent",
                    border: "clamp(3px, 0.5vw, 8px) solid " + BLUE,
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
                      width: "48%",
                      height: "48%",
                      borderRadius: "50%",
                      backgroundColor: BLUE,
                      willChange: "transform",
                    }}
                  />
                </div>
              </div>

              {/* Mulut kecil (opsional) — garis sederhana */}
              <div
                style={{
                  width: "26%",
                  height: "clamp(3px, 0.5vw, 8px)",
                  borderRadius: "999px",
                  backgroundColor: BLUE,
                  marginTop: "4%",
                  opacity: 0.85,
                }}
              />
            </div>
          </div>

          {/* Karakter "4" kedua */}
          <span
            ref={char4bRef}
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: "clamp(200px, 40vw, 900px)",
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

        {/* ===== Subtitle ===== */}
        <h2
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: "clamp(18px, 2vw, 28px)",
            fontWeight: 700,
            color: BLACK,
            letterSpacing: "-0.02em",
            margin: 0,
            marginTop: "clamp(20px, 3vh, 40px)",
            textAlign: "center",
          }}
        >
          Halaman tidak ditemukan
        </h2>
        <p
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: "clamp(13px, 1.1vw, 16px)",
            fontWeight: 400,
            color: "#666",
            margin: 0,
            marginTop: "12px",
            textAlign: "center",
            maxWidth: "520px",
          }}
        >
          Sepertinya halaman yang kamu cari sudah pindah atau tidak pernah ada.
        </p>

        {/* ===== Tombol kembali ke home ===== */}
        <Link href="/" style={{ textDecoration: "none", marginTop: "clamp(20px, 3vh, 36px)" }}>
          <button
            style={{
              padding: "14px 32px",
              backgroundColor: BLUE,
              color: WHITE,
              border: "none",
              borderRadius: "12px",
              fontFamily: FONT_FAMILY,
              fontSize: "15px",
              fontWeight: 700,
              letterSpacing: "0.02em",
              cursor: "pointer",
              transition: "background-color 0.25s ease, transform 0.2s ease",
              boxShadow: "0 12px 32px rgba(13,60,252,0.35)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = BLACK;
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = BLUE;
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
            }}
          >
            Kembali ke Home
          </button>
        </Link>
      </div>

      <style jsx global>{`
        html,
        body {
          margin: 0;
          padding: 0;
          background-color: #ffffff;
          width: 100%;
          height: 100%;
          overflow: hidden !important;
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
        #__next {
          overflow: hidden;
        }
      `}</style>
    </>
  );
}
