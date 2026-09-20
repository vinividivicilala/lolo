'use client';

import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import {
  getFirestore,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyD_htQZ1TClnXKZGRJ4izbMQ02y6V3aNAQ",
  authDomain: "wawa44-58d1e.firebaseapp.com",
  databaseURL: "https://wawa44-58d1e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "wawa44-58d1e",
  storageBucket: "wawa44-58d1e.firebasestorage.app",
  messagingSenderId: "836899520599",
  appId: "1:836899520599:web:b346e4370ecfa9bb89e312",
  measurementId: "G-8LMP7F4BE9",
};

let app: any = null;
let auth: any = null;
let db: any = null;

if (typeof window !== "undefined") {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
}

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

const FONT_FAMILY = "'Poppins', 'Poppins Fallback', sans-serif";
const ADMIN_EMAIL = "faridardiansyah061@gmail.com";

// ===== COLORS =====
const BLUE = "#0D3CFC";
const WHITE = "#FFFFFF";
const BLACK = "#000000";

// ===== SVG ICONS =====
const PeopleIcon = ({ size = 20, color = "#ffffff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="8" r="4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 21V19C4 16.7909 5.79086 15 8 15H16C18.2091 15 20 16.7909 20 19V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TrustIcon = ({ size = 24, color = "#ffffff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L4 5V11C4 16 8 20 12 22C16 20 20 16 20 11V5L12 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 12L11 14L15 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CareerIcon = ({ size = 24, color = "#ffffff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="7" width="20" height="14" rx="2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 7V5C8 3.89543 8.89543 3 10 3H14C15.1046 3 16 3.89543 16 5V7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2 13H22" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ResourcesIcon = ({ size = 24, color = "#ffffff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 4H10C11.1046 4 12 4.89543 12 6V20C12 18.8954 11.1046 18 10 18H4V4Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M20 4H14C12.8954 4 12 4.89543 12 6V20C12 18.8954 12.8954 18 14 18H20V4Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DocsIcon = ({ size = 20, color = "#ffffff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 2V8H20" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 13H16" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 17H16" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BrandIcon = ({ size = 20, color = "#ffffff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.59 13.41L11 3.83C10.6 3.43 10.06 3.2 9.5 3.2H4C2.9 3.2 2 4.1 2 5.2V10.7C2 11.26 2.22 11.8 2.63 12.2L12.21 21.79C13 22.57 14.27 22.57 15.06 21.79L20.59 16.26C21.37 15.47 21.37 14.2 20.59 13.41Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="7" cy="7" r="1.5" fill={color} />
  </svg>
);

// ===== NAVBAR BUTTON COMPONENT =====
const NavbarButton = ({
  label,
  panelTitle,
  panelDescription,
  panelImage,
  panelRightTitle,
  panelRightDescription,
  iconType,
  bigPanelWidth = 850,
  bigPanelHeight = 260,
  buttonColor = BLUE,
  buttonHoverColor = BLACK,
  panelColor = BLUE,
  iconButtonColor = BLACK,
  iconButtonHoverColor = BLUE,
  panelBoxColor = "rgba(255,255,255,0.12)",
  panelBoxBorder = "rgba(255,255,255,0.25)",
  labelTextColor = WHITE,
  labelTextHoverColor = WHITE,
  titleTextColor = WHITE,
  descriptionTextColor = "rgba(255,255,255,0.9)",
  isResources = false,
}: {
  label: string;
  panelTitle: string;
  panelDescription: string;
  panelImage: string;
  panelRightTitle: string;
  panelRightDescription: string;
  iconType: "trust" | "career" | "resources";
  bigPanelWidth?: number;
  bigPanelHeight?: number;
  buttonColor?: string;
  buttonHoverColor?: string;
  panelColor?: string;
  iconButtonColor?: string;
  iconButtonHoverColor?: string;
  panelBoxColor?: string;
  panelBoxBorder?: string;
  labelTextColor?: string;
  labelTextHoverColor?: string;
  titleTextColor?: string;
  descriptionTextColor?: string;
  isResources?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const linesTopRef = useRef<SVGLineElement>(null);
  const linesBottomRef = useRef<SVGLineElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setOpen(true);
  };

  const handleLeave = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => setOpen(false), 250);
  };

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!linesTopRef.current || !linesBottomRef.current) return;
    if (open) {
      gsap.to(linesTopRef.current, { y: 2, duration: 0.35, ease: "power2.out" });
      gsap.to(linesBottomRef.current, { y: -2, duration: 0.35, ease: "power2.out" });
    } else {
      gsap.to(linesTopRef.current, { y: 0, duration: 0.35, ease: "power2.out" });
      gsap.to(linesBottomRef.current, { y: 0, duration: 0.35, ease: "power2.out" });
    }
  }, [open]);

  useEffect(() => {
    if (!panelRef.current) return;
    if (open) {
      gsap.fromTo(
        panelRef.current,
        { opacity: 0, y: -20, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "power3.out" }
      );
    } else {
      gsap.to(panelRef.current, {
        opacity: 0,
        y: -20,
        scale: 0.96,
        duration: 0.25,
        ease: "power2.in",
      });
    }
  }, [open]);

  const strokeColor = open ? labelTextHoverColor : labelTextColor;

  return (
    <div style={{ position: "relative" }} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "10px 16px",
          backgroundColor: open ? buttonHoverColor : buttonColor,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRadius: "10px",
          border: "1px solid rgba(255,255,255,0.18)",
          boxShadow: open ? "0 8px 24px rgba(0,0,0,0.35)" : `0 8px 24px ${buttonColor}55`,
          transition: "background-color 0.25s ease, box-shadow 0.25s ease",
          cursor: "pointer",
          position: "relative",
          zIndex: 2,
        }}
      >
        <span
          style={{
            color: open ? labelTextHoverColor : labelTextColor,
            fontSize: "14px",
            fontWeight: 600,
            letterSpacing: "0.02em",
            fontFamily: FONT_FAMILY,
            whiteSpace: "nowrap",
            transition: "color 0.25s ease",
          }}
        >
          {label}
        </span>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "22px",
            height: "22px",
            backgroundColor: open ? iconButtonHoverColor : iconButtonColor,
            borderRadius: "6px",
            transition: "background-color 0.25s ease",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ display: "block" }}>
            <line ref={linesTopRef} x1="4" y1="7" x2="20" y2="7" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
            <line ref={linesBottomRef} x1="4" y1="17" x2="20" y2="17" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {open && (
        <div
          ref={panelRef}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            left: "0px",
            width: `${bigPanelWidth}px`,
            minHeight: `${bigPanelHeight}px`,
            backgroundColor: panelColor,
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.2)",
            boxShadow: `0 8px 32px ${panelColor}55`,
            zIndex: 1,
            fontFamily: FONT_FAMILY,
            color: titleTextColor,
            padding: "22px 26px",
            display: "flex",
            gap: "20px",
            alignItems: "flex-start",
          }}
        >
          <div style={{ flex: "1 1 0", minWidth: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
            {isResources ? (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <DocsIcon size={22} color={titleTextColor} />
                    <span style={{ fontSize: "16px", fontWeight: 700, fontFamily: FONT_FAMILY, color: titleTextColor }}>Docs</span>
                  </div>
                  <p style={{ fontSize: "12px", lineHeight: 1.5, color: descriptionTextColor, margin: 0, fontFamily: FONT_FAMILY, maxWidth: "340px" }}>
                    Dokumentasi lengkap panduan produk, API, dan tutorial Menuru.
                  </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <BrandIcon size={22} color={titleTextColor} />
                    <span style={{ fontSize: "16px", fontWeight: 700, fontFamily: FONT_FAMILY, color: titleTextColor }}>Brand</span>
                  </div>
                  <p style={{ fontSize: "12px", lineHeight: 1.5, color: descriptionTextColor, margin: 0, fontFamily: FONT_FAMILY, maxWidth: "340px" }}>
                    Aset visual, logo, dan panduan identitas brand Menuru.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {iconType === "trust" ? (
                    <TrustIcon size={26} color={titleTextColor} />
                  ) : iconType === "career" ? (
                    <CareerIcon size={26} color={titleTextColor} />
                  ) : (
                    <ResourcesIcon size={26} color={titleTextColor} />
                  )}
                  <span style={{ fontSize: "20px", fontWeight: 700, fontFamily: FONT_FAMILY, color: titleTextColor }}>
                    {panelTitle}
                  </span>
                </div>

                <p style={{ fontSize: "13px", lineHeight: 1.5, color: descriptionTextColor, margin: 0, fontFamily: FONT_FAMILY, maxWidth: "340px" }}>
                  {panelDescription}
                </p>
              </>
            )}
          </div>

          <div style={{ flex: "0 0 380px", display: "flex", flexDirection: "column", gap: "12px" }}>
            {isResources ? (
              <>
                <div style={{ backgroundColor: panelBoxColor, border: `1px solid ${panelBoxBorder}`, borderRadius: "12px", padding: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <img src={panelImage} alt="Docs" style={{ width: "100%", height: "120px", objectFit: "contain", display: "block", borderRadius: "8px" }} />
                  <span style={{ fontSize: "14px", fontWeight: 700, fontFamily: FONT_FAMILY, color: titleTextColor }}>Docs Guide</span>
                  <p style={{ fontSize: "12px", lineHeight: 1.5, color: descriptionTextColor, margin: 0, fontFamily: FONT_FAMILY }}>
                    Panduan lengkap dan referensi teknis.
                  </p>
                </div>

                <div style={{ backgroundColor: panelBoxColor, border: `1px solid ${panelBoxBorder}`, borderRadius: "12px", padding: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <img src={panelImage} alt="Brand" style={{ width: "100%", height: "120px", objectFit: "contain", display: "block", borderRadius: "8px" }} />
                  <span style={{ fontSize: "14px", fontWeight: 700, fontFamily: FONT_FAMILY, color: titleTextColor }}>Brand Assets</span>
                  <p style={{ fontSize: "12px", lineHeight: 1.5, color: descriptionTextColor, margin: 0, fontFamily: FONT_FAMILY }}>
                    Logo, palet warna, dan identitas visual.
                  </p>
                </div>
              </>
            ) : (
              <div style={{ backgroundColor: panelBoxColor, border: `1px solid ${panelBoxBorder}`, borderRadius: "12px", padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <img src={panelImage} alt={panelTitle} style={{ width: "100%", height: "170px", objectFit: "contain", display: "block", borderRadius: "10px" }} />
                <span style={{ fontSize: "15px", fontWeight: 700, fontFamily: FONT_FAMILY, color: titleTextColor }}>
                  {panelRightTitle}
                </span>
                <p style={{ fontSize: "12px", lineHeight: 1.5, color: descriptionTextColor, margin: 0, fontFamily: FONT_FAMILY }}>
                  {panelRightDescription}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ===== LEFT NAVBAR =====
const LeftNavbar = ({ shifted }: { shifted: boolean }) => {
  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        left: shifted ? "340px" : "60px",
        zIndex: 9000,
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontFamily: FONT_FAMILY,
        transition: "left 0.6s cubic-bezier(0.65, 0, 0.35, 1)",
        willChange: "left",
      }}
    >
      <NavbarButton
        label="Teams"
        panelTitle="Trust"
        panelDescription="Keamanan dan privasi Anda adalah prioritas kami dengan enkripsi end-to-end."
        panelImage="/images/p0l.jpg"
        panelRightTitle="Why Trust Us"
        panelRightDescription="Sistem kami dipantau 24/7 untuk melindungi data Anda."
        iconType="trust"
        bigPanelWidth={850}
        bigPanelHeight={260}
      />

      <NavbarButton
        label="Individual"
        panelTitle="Careers"
        panelDescription="Bergabunglah dengan tim kami dan bangun karier yang bermakna di lingkungan yang suportif."
        panelImage="/images/xxz.jpg"
        panelRightTitle="Life at Menuru"
        panelRightDescription="Budaya kerja kolaboratif, fleksibel, dan penuh peluang untuk tumbuh bersama."
        iconType="career"
        bigPanelWidth={850}
        bigPanelHeight={260}
      />

      <NavbarButton
        label="Resources"
        panelTitle="Docs & Brand"
        panelDescription="Akses dokumentasi lengkap dan aset brand Menuru dalam satu tempat."
        panelImage="/images/p0l.jpg"
        panelRightTitle="Docs & Brand"
        panelRightDescription="Panduan, aset visual, dan referensi resmi brand Menuru."
        iconType="resources"
        bigPanelWidth={850}
        bigPanelHeight={340}
        buttonColor="#F2EA6B"
        buttonHoverColor="#000000"
        panelColor="#F04E23"
        iconButtonColor="#000000"
        iconButtonHoverColor="#F2EA6B"
        panelBoxColor="rgba(255,255,255,0.15)"
        panelBoxBorder="rgba(255,255,255,0.3)"
        labelTextColor="#000000"
        labelTextHoverColor="#ffffff"
        titleTextColor="#ffffff"
        descriptionTextColor="rgba(255,255,255,0.92)"
        isResources={true}
      />
    </div>
  );
};

// ===== RIGHT NAVBAR =====
const RightNavbar = () => {
  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "24px",
        zIndex: 9000,
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px 18px 10px 16px",
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRadius: "10px",
        border: "1px solid rgba(255,255,255,0.15)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
        fontFamily: FONT_FAMILY,
      }}
    >
      <PeopleIcon size={20} color="#ffffff" />
      <Link
        href="/signin"
        style={{
          textDecoration: "none",
          color: "#ffffff",
          fontSize: "14px",
          fontWeight: 600,
          letterSpacing: "0.02em",
          fontFamily: FONT_FAMILY,
          whiteSpace: "nowrap",
        }}
      >
        Log In
      </Link>
    </div>
  );
};

// ===== HERO MENURU TITLE =====
const HeroMenuruTitle = ({
  onNavbarShiftChange,
}: {
  onNavbarShiftChange: (shifted: boolean) => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    if (!containerRef.current || !titleRef.current) return;

    const container = containerRef.current;
    const title = titleRef.current;

    const NAV_TOP = 10;
    const NAV_LEFT = 40;
    const NAV_FONT_SIZE = 70;
    const NAV_HEIGHT = 60;

    const ctx = gsap.context(() => {
      const split = new SplitText(title, {
        type: "chars",
        charsClass: "hero-menuru-char",
      });

      gsap.set(split.chars, {
        opacity: 0,
        y: 220,
        rotationX: -90,
        scale: 0.4,
        transformOrigin: "50% 100%",
        force3D: true,
      });

      gsap.to(split.chars, {
        opacity: 1,
        y: 0,
        rotationX: 0,
        scale: 1,
        duration: 1.4,
        stagger: 0.09,
        ease: "back.out(1.8)",
        delay: 0.2,
      });

      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top top",
          end: "+=500",
          scrub: 0.8,
          pin: false,
          onUpdate: (self) => {
            onNavbarShiftChange(self.progress > 0.35);
          },
          onLeave: () => onNavbarShiftChange(true),
          onEnterBack: () => onNavbarShiftChange(false),
        },
      });

      scrollTl.to(
        title,
        {
          position: "fixed",
          top: `${NAV_TOP}px`,
          left: `${NAV_LEFT}px`,
          fontSize: `${NAV_FONT_SIZE}px`,
          fontWeight: 700,
          letterSpacing: "-0.03em",
          lineHeight: 1,
          height: `${NAV_HEIGHT}px`,
          display: "flex",
          alignItems: "center",
          transform: "translateX(0px) translateY(0px)",
          duration: 1,
          ease: "power2.inOut",
        },
        0
      );

      scrollTl.to(
        container,
        {
          height: "80px",
          duration: 1,
          ease: "power2.inOut",
        },
        0
      );

      return () => {
        if (split) split.revert();
      };
    }, containerRef);

    return () => ctx.revert();
  }, [isMounted, onNavbarShiftChange]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "650px",
        backgroundColor: "#ffffff",
        overflow: "visible",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        paddingTop: "110px",
      }}
    >
      <h1
        ref={titleRef}
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: "600px",
          fontWeight: 700,
          color: BLUE,
          letterSpacing: "-0.05em",
          lineHeight: 0.85,
          margin: 0,
          textAlign: "center",
          userSelect: "none",
          whiteSpace: "nowrap",
          display: "inline-block",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
          willChange: "transform, font-size, top, left",
          zIndex: 8999,
        }}
      >
        Menuru
      </h1>
    </div>
  );
};

// ===== FOOTER MENURU TITLE =====
const FooterMenuruTitle = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!titleRef.current || !containerRef.current) return;

    const title = titleRef.current;
    let split: any = null;
    let ctx: any = null;

    const setup = () => {
      split = new SplitText(title, {
        type: "chars",
        charsClass: "footer-menuru-char",
      });

      ctx = gsap.context(() => {
        gsap.set(split.chars, {
          yPercent: 120,
          opacity: 0,
          rotationX: -90,
          transformOrigin: "50% 100%",
          force3D: true,
        });

        gsap.to(split.chars, {
          yPercent: 0,
          opacity: 1,
          rotationX: 0,
          duration: 1,
          stagger: 0.08,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 90%",
            end: "top 40%",
            scrub: 1,
            toggleActions: "play none none reverse",
            invalidateOnRefresh: true,
          },
        });
      }, containerRef);
    };

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => setTimeout(setup, 50));
    } else {
      setTimeout(setup, 200);
    }

    return () => {
      if (ctx) ctx.revert();
      if (split && split.revert) split.revert();
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    const t1 = setTimeout(() => ScrollTrigger.refresh(), 600);
    const t2 = setTimeout(() => ScrollTrigger.refresh(), 1500);
    return () => {
      window.removeEventListener("load", onLoad);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        padding: "0 40px 20px 40px",
        backgroundColor: "#ffffff",
        overflow: "visible",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        position: "relative",
      }}
    >
      <span
        ref={titleRef}
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: "600px",
          fontWeight: 700,
          color: BLUE,
          letterSpacing: "-0.05em",
          textTransform: "none",
          lineHeight: "0.85",
          display: "block",
          textAlign: "left",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
          willChange: "transform, opacity",
          whiteSpace: "nowrap",
          margin: 0,
          padding: 0,
          overflow: "visible",
          position: "relative",
        }}
      >
        Menuru
      </span>

      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "flex-start",
          marginTop: "10px",
        }}
      >
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
  );
};

// ===== FOOTER LINKS =====
const footerLinks = [
  { title: "Get in Touch", links: ["Contact", "Instagram", "Live Chat"] },
  {
    title: "Product",
    links: ["Shop", "Note", "Calendar", "Blog", "Donation", "Community", "Live Chat Agent", "Stories"],
  },
  { title: "Attention", links: ["Privacy Policy", "Terms & Conditions", "About Us", "Terms of Use", "Help Center"] },
];

// ===== MAIN PAGE =====
export default function LiveChatPage(): React.JSX.Element {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [showMain, setShowMain] = useState(false);
  const [navbarShifted, setNavbarShifted] = useState(false);

  const preloaderRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!auth || !isMounted) return;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser: any) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        try {
          await updateDoc(doc(db, "users", currentUser.uid), {
            online: true,
            lastSeen: serverTimestamp(),
          });
        } catch (error) {
          console.error("Error updating online status:", error);
        }
      }
    });
    return () => unsubscribe();
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted || loading) return;
    setTimeout(() => startPreloaderAnimation(), 500);
  }, [isMounted, loading]);

  const startPreloaderAnimation = () => {
    const tl = gsap.timeline({
      onComplete: () => {
        if (preloaderRef.current) {
          gsap.to(preloaderRef.current, {
            opacity: 0,
            duration: 0.6,
            ease: "power2.inOut",
            onComplete: () => {
              setShowMain(true);
              setTimeout(() => ScrollTrigger.refresh(), 300);
            },
          });
        }
      },
    });
    gsap.set(textRef.current, { y: 100, opacity: 0 });
    tl.to(textRef.current, { y: 0, opacity: 1, duration: 0.8, ease: "back.out(1.7)" })
      .to(textRef.current, { duration: 0.6 })
      .to(textRef.current, {
        opacity: 0,
        y: -20,
        scale: 0.9,
        duration: 0.4,
        ease: "power2.out",
        onComplete: () => {
          if (textRef.current) textRef.current.textContent = "Note";
        },
      })
      .to(textRef.current, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.7)" })
      .to(textRef.current, { duration: 0.8 })
      .to(textRef.current, { scale: 0.3, opacity: 0, duration: 0.7, ease: "power2.in" })
      .to(preloaderRef.current, { scale: 0.95, opacity: 0.8, duration: 0.3, ease: "power2.inOut" }, "-=0.3");
  };

  if (!isMounted || loading) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: WHITE,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          fontFamily: FONT_FAMILY,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "40px", overflow: "hidden" }}>
          <span style={{ fontSize: "100px", fontWeight: 700, color: BLUE, fontFamily: FONT_FAMILY, letterSpacing: "-0.03em" }}>
            Menuru
          </span>
          <span
            ref={textRef}
            style={{
              fontSize: "50px",
              fontWeight: 600,
              color: BLACK,
              fontFamily: FONT_FAMILY,
              letterSpacing: "-0.02em",
              display: "inline-block",
              willChange: "transform, opacity",
            }}
          >
            Shop
          </span>
        </div>
      </div>
    );
  }

  if (!showMain) {
    return (
      <div
        ref={preloaderRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: WHITE,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          fontFamily: FONT_FAMILY,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "40px", overflow: "hidden" }}>
          <span style={{ fontSize: "100px", fontWeight: 700, color: BLUE, fontFamily: FONT_FAMILY, letterSpacing: "-0.03em" }}>
            Menuru
          </span>
          <span
            ref={textRef}
            style={{
              fontSize: "50px",
              fontWeight: 600,
              color: BLACK,
              fontFamily: FONT_FAMILY,
              letterSpacing: "-0.02em",
              display: "inline-block",
              willChange: "transform, opacity",
            }}
          >
            Shop
          </span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Live Chat Agent | Menuru Official</title>
        <meta name="description" content="Live Chat Agent Menuru" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content={BLUE} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Menuru" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="icon" href="/images/ai.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/images/ai.jpg" />
        <meta property="og:title" content="Live Chat Agent | Menuru Official" />
        <meta property="og:description" content="Live Chat Agent Menuru" />
        <meta property="og:image" content="/images/ai.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Live Chat Agent | Menuru Official" />
        <meta name="twitter:description" content="Live Chat Agent Menuru" />
        <meta name="twitter:image" content="/images/ai.jpg" />
      </Head>

      <LeftNavbar shifted={navbarShifted} />
      <RightNavbar />

      <div
        style={{
          minHeight: "100vh",
          backgroundColor: WHITE,
          margin: 0,
          padding: 0,
          position: "relative",
          fontFamily: FONT_FAMILY,
          overflow: "visible",
        }}
      >
        {/* HERO */}
        <HeroMenuruTitle onNavbarShiftChange={setNavbarShifted} />

        {/* KONTEN — placeholder, design live chat telah dihapus */}
        <div style={{ padding: "0 40px", maxWidth: "1600px", margin: "0 auto", width: "100%" }}>
          {/* Tempat untuk konten baru nantinya */}
        </div>

        {/* FOOTER */}
        <div
          style={{
            width: "100%",
            padding: "60px 40px 40px 40px",
            backgroundColor: WHITE,
            borderTop: "1px solid rgba(0,0,0,0.05)",
            marginTop: "20px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", left: "40px", top: "50%", transform: "translateY(-50%)", width: "200px", height: "auto", opacity: 0.8 }}>
            <img src="/images/p0l.jpg" alt="" style={{ width: "100%", height: "auto", display: "block", objectFit: "cover" }} />
          </div>
          <div style={{ position: "absolute", right: "40px", top: "50%", transform: "translateY(-50%)", width: "200px", height: "auto", opacity: 0.8 }}>
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
                    textTransform: "none",
                  }}
                >
                  {section.title}
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {section.links.map((link, linkIdx) => {
                    let linkHref = "#";
                    let isAttention = false;
                    let isStories = false;
                    if (link === "Contact") linkHref = "/contact";
                    else if (link === "Live Chat") linkHref = "/live-chat";
                    else if (link === "Live Chat Agent") linkHref = "/live-chat-agent";
                    else if (link === "Help Center") linkHref = "/pusat-bantuan";
                    else if (link === "About Us") { linkHref = "/profile"; isAttention = true; }
                    else if (link === "Privacy Policy") { linkHref = "/privacy-policy"; isAttention = true; }
                    else if (link === "Terms & Conditions") { linkHref = "/terms-of-services"; isAttention = true; }
                    else if (link === "Terms of Use") { linkHref = "/terms-of-use"; isAttention = true; }
                    else if (link === "Stories") { linkHref = "/stories"; isStories = true; }
                    else if (link === "Shop") linkHref = "/shop";
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
                              textTransform: "none",
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
                              backgroundColor: BLACK,
                              border: `1.5px solid ${BLACK}`,
                              color: WHITE,
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
              paddingTop: "20px",
              borderTop: "1px solid rgba(0,0,0,0.05)",
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

        <FooterMenuruTitle />
      </div>

      <style jsx global>{`
        html {
          overflow: auto !important;
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
          height: 100% !important;
        }
        html::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        body {
          overflow: auto !important;
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
          margin: 0;
          padding: 0;
          background-color: #ffffff !important;
          min-height: 100% !important;
          height: auto !important;
        }
        body::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        * {
          background-color: transparent;
        }
        .menuru-char {
          display: inline-block;
          will-change: transform, opacity;
        }
        .hero-menuru-char {
          display: inline-block;
          will-change: transform, opacity;
          color: #0D3CFC !important;
          transform-origin: 50% 100%;
        }
        .footer-menuru-char {
          display: inline-block;
          will-change: transform, opacity;
          color: #0D3CFC !important;
          transform-origin: 50% 100%;
        }
        .split-char-livechat {
          display: inline-block;
          will-change: transform, opacity, filter;
        }
      `}</style>
    </>
  );
}
