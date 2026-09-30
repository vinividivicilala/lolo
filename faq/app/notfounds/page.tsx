'use client';

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";

const FONT_FAMILY = "'Plus Jakarta Sans'";
const BLUE = "#0D3CFC";
const WHITE = "#FFFFFF";
const BLACK = "#000000";

// ===== SVG ICONS =====
const NorthEastArrow = ({ size = 20, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M7 17L17 7M17 7H8M17 7V16" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ===== EYE COMPONENT (follows mouse) =====
const Eye = ({
  mouseX,
  mouseY,
  eyeRef,
  size = 60,
}: {
  mouseX: number;
  mouseY: number;
  eyeRef: React.RefObject<HTMLDivElement>;
  size?: number;
}) => {
  const pupilRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!eyeRef.current) return;
    const rect = eyeRef.current.getBoundingClientRect();
    const eyeCenterX = rect.left + rect.width / 2;
    const eyeCenterY = rect.top + rect.height / 2;

    const dx = mouseX - eyeCenterX;
    const dy = mouseY - eyeCenterY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const maxOffset = size * 0.22;
    const angle = Math.atan2(dy, dx);
    const clampedDist = Math.min(dist, maxOffset * 4);
    const moveX = (Math.cos(angle) * Math.min(clampedDist, maxOffset)) / 2;
    const moveY = (Math.sin(angle) * Math.min(clampedDist, maxOffset)) / 2;

    setOffset({ x: moveX, y: moveY });
  }, [mouseX, mouseY, eyeRef, size]);

  useEffect(() => {
    if (!pupilRef.current) return;
    gsap.to(pupilRef.current, {
      x: offset.x,
      y: offset.y,
      duration: 0.35,
      ease: "power2.out",
    });
  }, [offset]);

  return (
    <div
      ref={eyeRef}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        backgroundColor: WHITE,
        position: "relative",
        overflow: "hidden",
        boxShadow: "inset 0 4px 12px rgba(0,0,0,0.15)",
        flexShrink: 0,
      }}
    >
      <div
        ref={pupilRef}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: `${size * 0.42}px`,
          height: `${size * 0.42}px`,
          borderRadius: "50%",
          backgroundColor: BLACK,
          transform: "translate(-50%, -50%)",
          willChange: "transform",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "20%",
            width: `${size * 0.14}px`,
            height: `${size * 0.14}px`,
            borderRadius: "50%",
            backgroundColor: WHITE,
            opacity: 0.9,
          }}
        />
      </div>
    </div>
  );
};

// ===== 404 PAGE =====
export default function Page404(): React.JSX.Element {
  const [isMounted, setIsMounted] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const char1Ref = useRef<HTMLSpanElement>(null);
  const emoticonRef = useRef<HTMLDivElement>(null);
  const char3Ref = useRef<HTMLSpanElement>(null);
  const eyeLeftRef = useRef<HTMLDivElement>(null);
  const eyeRightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    if (!char1Ref.current || !emoticonRef.current || !char3Ref.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.2 });

      gsap.set([char1Ref.current, emoticonRef.current, char3Ref.current], {
        yPercent: -800,
        opacity: 0,
        rotation: -180,
      });

      tl.to(char1Ref.current, {
        yPercent: 0,
        opacity: 1,
        rotation: 0,
        duration: 1.6,
        ease: "bounce.out",
      });

      tl.to(
        emoticonRef.current,
        {
          yPercent: 0,
          opacity: 1,
          rotation: 0,
          duration: 1.6,
          ease: "bounce.out",
        },
        "-=1.3"
      );

      tl.to(
        char3Ref.current,
        {
          yPercent: 0,
          opacity: 1,
          rotation: 0,
          duration: 1.6,
          ease: "bounce.out",
        },
        "-=1.3"
      );

      tl.to(
        containerRef.current,
        {
          keyframes: [
            { y: 8, duration: 0.06 },
            { y: -6, duration: 0.06 },
            { y: 4, duration: 0.06 },
            { y: -2, duration: 0.06 },
            { y: 0, duration: 0.08 },
          ],
          ease: "power2.out",
        },
        "-=0.2"
      );

      if (titleRef.current) {
        const children = titleRef.current.querySelectorAll(".fade-in-item");
        gsap.set(children, { y: 30, opacity: 0 });
        tl.to(
          children,
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out",
          },
          "-=0.4"
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [isMounted]);

  if (!isMounted) {
    return <div style={{ minHeight: "100vh", backgroundColor: WHITE }} />;
  }

  return (
    <div
      ref={containerRef}
      style={{
        minHeight: "100vh",
        width: "100%",
        backgroundColor: WHITE,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT_FAMILY,
        padding: "40px 20px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        ref={titleRef}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "clamp(8px, 2vw, 24px)",
          lineHeight: 0.85,
          marginBottom: "60px",
          userSelect: "none",
          flexWrap: "nowrap",
        }}
      >
        <span
          ref={char1Ref}
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: "clamp(180px, 40vw, 700px)",
            fontWeight: 700,
            color: BLUE,
            letterSpacing: "-0.06em",
            display: "inline-block",
            willChange: "transform, opacity",
            lineHeight: 0.85,
          }}
        >
          4
        </span>

        <div
          ref={emoticonRef}
          style={{
            width: "clamp(180px, 40vw, 700px)",
            height: "clamp(180px, 40vw, 700px)",
            borderRadius: "50%",
            border: `clamp(8px, 2vw, 26px) solid ${BLUE}`,
            backgroundColor: WHITE,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "clamp(10px, 4%, 40px)",
            position: "relative",
            boxSizing: "border-box",
            willChange: "transform, opacity",
            flexShrink: 0,
          }}
        >
          <Eye
            mouseX={mousePos.x}
            mouseY={mousePos.y}
            eyeRef={eyeLeftRef}
            size={Math.round(700 * 0.16)}
          />
          <Eye
            mouseX={mousePos.x}
            mouseY={mousePos.y}
            eyeRef={eyeRightRef}
            size={Math.round(700 * 0.16)}
          />
        </div>

        <span
          ref={char3Ref}
          style={{
            fontFamily: FONT_FAMILY,
            fontSize: "clamp(180px, 40vw, 700px)",
            fontWeight: 700,
            color: BLUE,
            letterSpacing: "-0.06em",
            display: "inline-block",
            willChange: "transform, opacity",
            lineHeight: 0.85,
          }}
        >
          4
        </span>
      </div>

      <h1
        className="fade-in-item"
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: "clamp(20px, 2.4vw, 36px)",
          fontWeight: 700,
          color: BLUE,
          letterSpacing: "-0.02em",
          margin: 0,
          marginBottom: "16px",
          textAlign: "center",
        }}
      >
        Halaman tidak ditemukan
      </h1>

      <p
        className="fade-in-item"
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: "clamp(14px, 1.2vw, 18px)",
          fontWeight: 400,
          color: "#666",
          lineHeight: 1.6,
          maxWidth: "520px",
          textAlign: "center",
          margin: 0,
          marginBottom: "40px",
        }}
      >
        Sepertinya halaman yang Anda cari sudah dipindahkan, dihapus, atau tidak pernah ada.
      </p>

      <div className="fade-in-item">
        <Link href="/" style={{ textDecoration: "none" }}>
          <button
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              padding: "14px 28px",
              backgroundColor: BLUE,
              color: WHITE,
              border: "none",
              borderRadius: "12px",
              fontFamily: FONT_FAMILY,
              fontSize: "15px",
              fontWeight: 700,
              letterSpacing: "0.02em",
              cursor: "pointer",
              transition: "transform 0.2s ease, background-color 0.25s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = BLACK;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = BLUE;
            }}
          >
            <span>Kembali ke Home</span>
            <NorthEastArrow size={18} color={WHITE} />
          </button>
        </Link>
      </div>
    </div>
  );
}
