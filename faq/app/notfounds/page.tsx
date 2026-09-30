'use client';

import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const FONT_FAMILY = "'Plus Jakarta Sans'";
const BLUE = "#0D3CFC";
const WHITE = "#FFFFFF";

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
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT_FAMILY,
          overflow: "hidden",
          position: "fixed",
          top: 0,
          left: 0,
        }}
      >
        {/* ===== Teks "Sorry" di kiri atas — 2 baris ===== */}
        <p
          style={{
            position: "absolute",
            top: "clamp(20px, 3vh, 40px)",
            left: "clamp(20px, 3vw, 40px)",
            fontFamily: FONT_FAMILY,
            fontSize: "100px",
            fontWeight: 700,
            color: BLUE,
            lineHeight: 1,
            letterSpacing: "-0.04em",
            margin: 0,
            textAlign: "left",
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

          {/* Karakter "0" diganti 2 mata + alis melengkung terpisah */}
          <div
            ref={eyesRef}
            style={{
              position: "relative",
              width: "clamp(140px, 24vw, 360px)",
              height: "clamp(140px, 24vw, 360px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              willChange: "transform, opacity",
            }}
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "20%",
              }}
            >
              {/* ===== Mata kiri + alis terpisah di atasnya ===== */}
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
                {/* Alis melengkung — terpisah di atas bola mata */}
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

                {/* Bola mata */}
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

              {/* ===== Mata kanan + alis terpisah di atasnya ===== */}
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
                {/* Alis melengkung — terpisah di atas bola mata */}
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

                {/* Bola mata */}
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
