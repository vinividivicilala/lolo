'use client';

import React, { useState, useEffect, useRef, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
  orderBy,
  arrayUnion,
  arrayRemove,
  increment,
  getDoc,
  setDoc,
  writeBatch,
  getDocs,
  limit,
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

const SearchIcon = ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21 21L16.65 16.65" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SendIcon = ({ size = 18, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ArrowRight = ({ size = 20, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LogoutIcon = ({ size = 18, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="16 17 21 12 16 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="21" y1="12" x2="9" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const UserPlusIcon = ({ size = 20, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 21V19C16 16.7909 14.2091 15 12 15H5C2.79086 15 1 16.7909 1 19V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M20 8V14M17 11H23" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const GroupIcon = ({ size = 20, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M23 21V19C22.7356 17.1124 21.7405 15.3591 20.1747 14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 3.12891C17.5659 3.48813 18.9993 4.29577 20.1747 5.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ===== NAVBAR BUTTON COMPONENT (sama seperti halaman utama) =====
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

// ===== HERO MENURU TITLE (sama seperti halaman utama) =====
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

// ===== FOOTER LINKS (sama halaman utama) =====
const footerLinks = [
  { title: "Get in Touch", links: ["Contact", "Instagram", "Live Chat"] },
  {
    title: "Product",
    links: ["Shop", "Note", "Calendar", "Blog", "Donation", "Community", "Live Chat Agent", "Stories"],
  },
  { title: "Attention", links: ["Privacy Policy", "Terms & Conditions", "About Us", "Terms of Use", "Help Center"] },
];

// ===== INTERFACES =====
interface Chat {
  id: string;
  type: "user" | "group" | "broadcast" | "announcement";
  name: string;
  photo?: string;
  members: string[];
  adminId?: string;
  createdAt: any;
  lastMessage?: string;
  lastMessageTime?: any;
  unreadCount: number;
  typing: { userId: string; userName: string }[];
  bio?: string;
  memberCount?: number;
  lastMessageSender?: string;
  lastMessageSenderId?: string;
  isBroadcast?: boolean;
  isAnnouncement?: boolean;
  targetUsers?: string[];
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  text: string;
  timestamp: any;
  read: boolean;
  readBy?: string[];
  delivered?: boolean;
}

interface User {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  online: boolean;
  lastSeen: any;
  bio?: string;
  joinedAt: any;
}

// ===== PROFILE PAGE =====
const ProfilePage = ({
  user,
  db,
  onClose,
  isGroup = false,
  chatData = null,
}: {
  user: any;
  db: any;
  onClose: () => void;
  isGroup?: boolean;
  chatData?: any;
}) => {
  const [profileUser, setProfileUser] = useState<any>(null);
  const [groupMembers, setGroupMembers] = useState<User[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!db || !isMounted) return;

    if (!isGroup && user) {
      const userRef = doc(db, "users", user.id || user.uid);
      const unsubscribe = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          setProfileUser({ id: doc.id, ...doc.data() });
        }
      });
      return () => unsubscribe();
    } else if (isGroup && chatData) {
      const memberIds = chatData.members || [];
      const unsubscribes: (() => void)[] = [];

      memberIds.forEach((memberId: string) => {
        const userRef = doc(db, "users", memberId);
        const unsubscribe = onSnapshot(userRef, (doc) => {
          if (doc.exists()) {
            setGroupMembers((prev) => {
              const exists = prev.some((m) => m.id === doc.id);
              if (!exists) return [...prev, { id: doc.id, ...doc.data() }];
              return prev.map((m) => (m.id === doc.id ? { id: doc.id, ...doc.data() } : m));
            });
          }
        });
        unsubscribes.push(unsubscribe);
      });

      setProfileUser(chatData);
      return () => {
        unsubscribes.forEach((unsub) => unsub());
      };
    }
  }, [db, user, isGroup, chatData, isMounted]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Belum tersedia";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  };

  if (!isMounted) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: BLUE,
        zIndex: 10,
        padding: "20px",
        overflowY: "auto",
        animation: "slideIn 0.3s ease",
      }}
    >
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "20px",
          paddingBottom: "16px",
          borderBottom: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: WHITE,
            fontSize: "24px",
            cursor: "pointer",
            padding: "4px 8px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span>←</span>
          <span style={{ fontSize: "16px", fontWeight: 500 }}>Kembali</span>
        </button>
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: WHITE, fontFamily: FONT_FAMILY, margin: 0, marginLeft: "8px" }}>
          {isGroup ? "Informasi Grup" : "Profil"}
        </h2>
      </div>

      {!isGroup && profileUser ? (
        <div style={{ backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "12px", padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                overflow: "hidden",
                backgroundColor: WHITE,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                border: "3px solid rgba(255,255,255,0.2)",
              }}
            >
              <img
                src={profileUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileUser.displayName || profileUser.email || "User")}&background=ffffff&color=0D3CFC&size=128`}
                alt={profileUser.displayName || "User"}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div>
              <div style={{ fontSize: "24px", fontWeight: 700, color: WHITE, fontFamily: FONT_FAMILY }}>
                {profileUser.displayName || profileUser.email || "User"}
              </div>
              <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", fontFamily: FONT_FAMILY }}>
                {profileUser.email || "Email tidak tersedia"}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  color: profileUser.online ? WHITE : "rgba(255,255,255,0.5)",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  marginTop: "4px",
                }}
              >
                {profileUser.online ? "Online" : "Offline"}
              </div>
            </div>
          </div>

          <div style={{ padding: "12px 0", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", fontFamily: FONT_FAMILY, marginBottom: "4px" }}>Bio</div>
            <div style={{ fontSize: "16px", color: WHITE, fontFamily: FONT_FAMILY }}>{profileUser.bio || "Belum ada bio"}</div>
          </div>

          <div style={{ padding: "12px 0", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", fontFamily: FONT_FAMILY, marginBottom: "4px" }}>Bergabung</div>
            <div style={{ fontSize: "16px", color: WHITE, fontFamily: FONT_FAMILY }}>{formatDate(profileUser.joinedAt)}</div>
          </div>
        </div>
      ) : isGroup && profileUser ? (
        <div style={{ backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "12px", padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                overflow: "hidden",
                backgroundColor: WHITE,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                border: "3px solid rgba(255,255,255,0.2)",
              }}
            >
              <img
                src={profileUser.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileUser.name || "Group")}&background=ffffff&color=0D3CFC&size=128`}
                alt={profileUser.name || "Group"}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div>
              <div style={{ fontSize: "24px", fontWeight: 700, color: WHITE, fontFamily: FONT_FAMILY }}>{profileUser.name || "Grup"}</div>
              <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", fontFamily: FONT_FAMILY }}>
                {profileUser.memberCount || 0} anggota
              </div>
            </div>
          </div>

          <div style={{ padding: "12px 0", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", fontFamily: FONT_FAMILY, marginBottom: "4px" }}>Bio Grup</div>
            <div style={{ fontSize: "16px", color: WHITE, fontFamily: FONT_FAMILY }}>{profileUser.bio || "Belum ada bio grup"}</div>
          </div>

          <div style={{ padding: "12px 0", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", fontFamily: FONT_FAMILY, marginBottom: "8px" }}>
              Anggota ({groupMembers.length})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {groupMembers.map((member) => (
                <div key={member.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 12px", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "8px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "50%", overflow: "hidden", backgroundColor: WHITE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <img
                      src={member.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.displayName || member.email || "User")}&background=ffffff&color=0D3CFC&size=128`}
                      alt={member.displayName || "User"}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 500, color: WHITE, fontFamily: FONT_FAMILY }}>
                      {member.displayName || member.email || "User"}
                    </div>
                    <div style={{ fontSize: "10px", fontWeight: 800, color: member.online ? WHITE : "rgba(255,255,255,0.5)", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                      {member.online ? "Online" : "Offline"}
                    </div>
                  </div>
                  {profileUser.adminId === member.id && (
                    <span style={{ fontSize: "10px", backgroundColor: "rgba(255,255,255,0.2)", color: WHITE, padding: "2px 10px", borderRadius: "4px", fontFamily: FONT_FAMILY, marginLeft: "auto" }}>
                      Admin
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: "12px 0", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", fontFamily: FONT_FAMILY, marginBottom: "4px" }}>Dibuat</div>
            <div style={{ fontSize: "16px", color: WHITE, fontFamily: FONT_FAMILY }}>{formatDate(profileUser.createdAt)}</div>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: "center", color: "rgba(255,255,255,0.5)", fontFamily: FONT_FAMILY, padding: "40px 0" }}>Loading...</div>
      )}
    </div>
  );
};

// ===== LIVE CHAT COMPONENT (design disamakan halaman utama) =====
const LiveChat = ({ user, db, auth }: { user: any; db: any; auth: any }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [messageSearchQuery, setMessageSearchQuery] = useState("");
  const [userBio, setUserBio] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showBroadcastInput, setShowBroadcastInput] = useState(false);
  const [showAnnouncementInput, setShowAnnouncementInput] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [announcementMessage, setAnnouncementMessage] = useState("");
  const [selectedBroadcastUsers, setSelectedBroadcastUsers] = useState<string[]>([]);
  const [showProfile, setShowProfile] = useState(false);
  const [profileUser, setProfileUser] = useState<any>(null);
  const [isGroupProfile, setIsGroupProfile] = useState(false);
  const [profileChatData, setProfileChatData] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (user && user.email) {
      setIsAdmin(user.email === ADMIN_EMAIL);
    }
  }, [user]);

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const getUserPhoto = (email?: string, photoURL?: string) => {
    if (photoURL) return photoURL;
    if (email) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}&background=0D3CFC&color=fff&size=128`;
    }
    return `https://ui-avatars.com/api/?name=User&background=0D3CFC&color=fff&size=128`;
  };

  useEffect(() => {
    if (!db || !isMounted) return;
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const userList: User[] = [];
      snapshot.forEach((doc) => {
        userList.push({ id: doc.id, ...doc.data() } as User);
      });
      setUsers(userList);
    });
    return () => unsubscribe();
  }, [db, isMounted]);

  useEffect(() => {
    if (!db || !user || !isMounted) return;

    const q = query(
      collection(db, "chats"),
      where("members", "array-contains", user.uid),
      orderBy("lastMessageTime", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatList: Chat[] = [];
      snapshot.forEach((doc) => {
        chatList.push({ id: doc.id, ...doc.data() } as Chat);
      });
      setChats(chatList);

      if (selectedChat) {
        const stillExists = chatList.some((c) => c.id === selectedChat.id);
        if (!stillExists) {
          setSelectedChat(null);
          setMessages([]);
        }
      }
    });
    return () => unsubscribe();
  }, [db, user, selectedChat, isMounted]);

  useEffect(() => {
    if (!db || !selectedChat || !isMounted) return;

    const q = query(collection(db, "chats", selectedChat.id, "messages"), orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgList: Message[] = [];
      snapshot.forEach((doc) => {
        msgList.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(msgList);
      markChatAsRead(selectedChat.id);
      setTimeout(scrollToBottom, 100);
    });

    return () => unsubscribe();
  }, [db, selectedChat, isMounted]);

  const markChatAsRead = async (chatId: string) => {
    if (!db || !user) return;
    try {
      const q = query(
        collection(db, "chats", chatId, "messages"),
        where("read", "==", false),
        where("senderId", "!=", user.uid)
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) return;
      const batch = writeBatch(db);
      snapshot.forEach((doc) => {
        batch.update(doc.ref, { read: true, readBy: arrayUnion(user.uid) });
      });
      await batch.commit();
      await updateDoc(doc(db, "chats", chatId), { unreadCount: 0 });
    } catch (error) {
      console.error("Error marking chat as read:", error);
    }
  };

  useEffect(() => {
    if (!user || !isMounted || chats.length === 0) return;
    if (!selectedChat || !chats.some((c) => c.id === selectedChat.id)) {
      setSelectedChat(chats[0]);
    }
  }, [chats, user, selectedChat, isMounted]);

  useEffect(() => {
    if (user && user.bio) setUserBio(user.bio);
  }, [user]);

  const sendMessage = async () => {
    if (!db || !selectedChat || !messageText.trim() || !user) return;
    try {
      const chatRef = doc(db, "chats", selectedChat.id);
      await addDoc(collection(db, "chats", selectedChat.id, "messages"), {
        senderId: user.uid,
        senderName: user.displayName || user.email || "User",
        senderPhoto: user.photoURL || "",
        text: messageText.trim(),
        timestamp: serverTimestamp(),
        read: false,
        readBy: [],
        delivered: true,
      });
      await updateDoc(chatRef, {
        lastMessage: messageText.trim(),
        lastMessageTime: serverTimestamp(),
        lastMessageSender: user.displayName || user.email || "User",
        lastMessageSenderId: user.uid,
        unreadCount: increment(1),
      });
      setMessageText("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleTyping = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessageText(value);
    if (!selectedChat || !user || !db) return;
    const chatRef = doc(db, "chats", selectedChat.id);
    const typingList = selectedChat.typing || [];
    const userTyping = typingList.find((t) => t.userId === user.uid);
    if (value.length > 0 && !userTyping) {
      await updateDoc(chatRef, { typing: arrayUnion({ userId: user.uid, userName: user.displayName || user.email || "User" }) });
    } else if (value.length === 0 && userTyping) {
      await updateDoc(chatRef, { typing: typingList.filter((t) => t.userId !== user.uid) });
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(async () => {
      const currentChat = chats.find((c) => c.id === selectedChat.id);
      if (currentChat) {
        await updateDoc(chatRef, { typing: (currentChat.typing || []).filter((t) => t.userId !== user.uid) });
      }
    }, 3000);
  };

  const createGroup = async () => {
    if (!db || !user || !groupName.trim() || selectedUsers.length === 0) return;
    try {
      const members = [user.uid, ...selectedUsers];
      await addDoc(collection(db, "chats"), {
        type: "group",
        name: groupName.trim(),
        photo: "",
        members: members,
        adminId: user.uid,
        createdAt: serverTimestamp(),
        lastMessage: `Grup "${groupName.trim()}" dibuat`,
        lastMessageTime: serverTimestamp(),
        lastMessageSender: user.displayName || user.email || "User",
        lastMessageSenderId: user.uid,
        unreadCount: 0,
        typing: [],
        bio: "",
        memberCount: members.length,
      });
      setGroupName("");
      setSelectedUsers([]);
      setShowCreateGroup(false);
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  const createNewChat = async (targetUserId: string) => {
    if (!db || !user || !targetUserId) return;
    try {
      const existingChat = chats.find(
        (c) => c.type === "user" && c.members.includes(user.uid) && c.members.includes(targetUserId)
      );
      if (existingChat) {
        setSelectedChat(existingChat);
        setShowNewChat(false);
        return;
      }
      const targetUser = users.find((u) => u.id === targetUserId);
      if (!targetUser) return;
      const chatRef = await addDoc(collection(db, "chats"), {
        type: "user",
        name: targetUser.displayName || targetUser.email || "User",
        photo: targetUser.photoURL || "",
        members: [user.uid, targetUserId],
        adminId: user.uid,
        createdAt: serverTimestamp(),
        lastMessage: "Chat dimulai",
        lastMessageTime: serverTimestamp(),
        lastMessageSender: user.displayName || user.email || "User",
        lastMessageSenderId: user.uid,
        unreadCount: 0,
        typing: [],
        bio: "",
        memberCount: 2,
      });
      setShowNewChat(false);
      setSelectedChat({
        id: chatRef.id,
        type: "user",
        name: targetUser.displayName || targetUser.email || "User",
        photo: targetUser.photoURL || "",
        members: [user.uid, targetUserId],
        adminId: user.uid,
        createdAt: serverTimestamp(),
        lastMessage: "Chat dimulai",
        lastMessageTime: serverTimestamp(),
        lastMessageSender: user.displayName || user.email || "User",
        lastMessageSenderId: user.uid,
        unreadCount: 0,
        typing: [],
        bio: "",
        memberCount: 2,
      });
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  const updateUserBio = async () => {
    if (!db || !user) return;
    try {
      await updateDoc(doc(db, "users", user.uid), { bio: userBio });
    } catch (error) {
      console.error("Error updating bio:", error);
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await updateDoc(doc(db, "users", user.uid), { online: false, lastSeen: serverTimestamp() });
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
    if (chat.id) markChatAsRead(chat.id);
    setShowProfile(false);
  };

  const sendBroadcast = async () => {
    if (!db || !user || !broadcastMessage.trim() || selectedBroadcastUsers.length === 0) return;
    try {
      const adminName = user.displayName || user.email || "Admin";
      const adminPhoto = user.photoURL || "";

      const existingBroadcastQuery = query(
        collection(db, "chats"),
        where("isBroadcast", "==", true),
        where("adminId", "==", user.uid)
      );
      const existingBroadcastSnapshot = await getDocs(existingBroadcastQuery);

      let broadcastChatId: string;
      if (!existingBroadcastSnapshot.empty) {
        broadcastChatId = existingBroadcastSnapshot.docs[0].id;
        const existingMembers = existingBroadcastSnapshot.docs[0].data().members || [];
        const newMembers = [...new Set([...existingMembers, ...selectedBroadcastUsers, user.uid])];
        await updateDoc(doc(db, "chats", broadcastChatId), {
          members: newMembers,
          memberCount: newMembers.length,
          lastMessage: broadcastMessage.trim(),
          lastMessageTime: serverTimestamp(),
          lastMessageSender: adminName,
          lastMessageSenderId: user.uid,
          unreadCount: increment(1),
        });
      } else {
        const members = [user.uid, ...selectedBroadcastUsers];
        const chatRef = await addDoc(collection(db, "chats"), {
          type: "broadcast",
          name: "Broadcast",
          photo: "",
          members: members,
          adminId: user.uid,
          createdAt: serverTimestamp(),
          lastMessage: broadcastMessage.trim(),
          lastMessageTime: serverTimestamp(),
          lastMessageSender: adminName,
          lastMessageSenderId: user.uid,
          unreadCount: 0,
          typing: [],
          bio: "Pesan broadcast dari admin",
          memberCount: members.length,
          isBroadcast: true,
          targetUsers: selectedBroadcastUsers,
        });
        broadcastChatId = chatRef.id;
      }

      await addDoc(collection(db, "chats", broadcastChatId, "messages"), {
        senderId: user.uid,
        senderName: adminName,
        senderPhoto: adminPhoto,
        text: broadcastMessage.trim(),
        timestamp: serverTimestamp(),
        read: false,
        readBy: [],
        delivered: true,
      });

      setBroadcastMessage("");
      setSelectedBroadcastUsers([]);
      setShowBroadcastInput(false);
      alert("Broadcast berhasil dikirim!");
    } catch (error) {
      console.error("Error sending broadcast:", error);
      alert("Gagal mengirim broadcast.");
    }
  };

  const sendAnnouncement = async () => {
    if (!db || !user || !announcementMessage.trim()) return;
    try {
      const adminName = user.displayName || user.email || "Admin";
      const adminPhoto = user.photoURL || "";
      const allUserIds = users.map((u) => u.id);

      const existingAnnouncementQuery = query(
        collection(db, "chats"),
        where("isAnnouncement", "==", true),
        where("adminId", "==", user.uid)
      );
      const existingAnnouncementSnapshot = await getDocs(existingAnnouncementQuery);

      let announcementChatId: string;
      if (!existingAnnouncementSnapshot.empty) {
        announcementChatId = existingAnnouncementSnapshot.docs[0].id;
        const existingMembers = existingAnnouncementSnapshot.docs[0].data().members || [];
        const newMembers = [...new Set([...existingMembers, ...allUserIds, user.uid])];
        await updateDoc(doc(db, "chats", announcementChatId), {
          members: newMembers,
          memberCount: newMembers.length,
          lastMessage: announcementMessage.trim(),
          lastMessageTime: serverTimestamp(),
          lastMessageSender: adminName,
          lastMessageSenderId: user.uid,
          unreadCount: increment(1),
        });
      } else {
        const members = [user.uid, ...allUserIds];
        const chatRef = await addDoc(collection(db, "chats"), {
          type: "announcement",
          name: "Pengumuman",
          photo: "",
          members: members,
          adminId: user.uid,
          createdAt: serverTimestamp(),
          lastMessage: announcementMessage.trim(),
          lastMessageTime: serverTimestamp(),
          lastMessageSender: adminName,
          lastMessageSenderId: user.uid,
          unreadCount: 0,
          typing: [],
          bio: "Pengumuman dari admin",
          memberCount: members.length,
          isAnnouncement: true,
          targetUsers: allUserIds,
        });
        announcementChatId = chatRef.id;
      }

      await addDoc(collection(db, "chats", announcementChatId, "messages"), {
        senderId: user.uid,
        senderName: adminName,
        senderPhoto: adminPhoto,
        text: announcementMessage.trim(),
        timestamp: serverTimestamp(),
        read: false,
        readBy: [],
        delivered: true,
      });

      setAnnouncementMessage("");
      setShowAnnouncementInput(false);
      alert("Pengumuman berhasil dikirim!");
    } catch (error) {
      console.error("Error sending announcement:", error);
      alert("Gagal mengirim pengumuman.");
    }
  };

  const toggleBroadcastUser = (userId: string) => {
    setSelectedBroadcastUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const openUserProfile = (userId: string) => {
    const userData = users.find((u) => u.id === userId);
    if (userData) {
      setProfileUser(userData);
      setIsGroupProfile(false);
      setProfileChatData(null);
      setShowProfile(true);
    }
  };

  const openGroupProfile = (chat: Chat) => {
    setProfileChatData(chat);
    setIsGroupProfile(true);
    setProfileUser(null);
    setShowProfile(true);
  };

  const filteredChats = chats.filter((chat) => {
    if (!searchQuery || !searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    return (chat.name || "").toLowerCase().includes(query);
  });

  const filteredMessages = messages.filter((msg) => {
    if (!messageSearchQuery || !messageSearchQuery.trim()) return true;
    const query = messageSearchQuery.toLowerCase().trim();
    return (msg.text || "").toLowerCase().includes(query);
  });

  const getTypingUsers = (chat: Chat) => {
    if (!chat.typing || chat.typing.length === 0) return null;
    const names = chat.typing.map((t) => t.userName).filter((name) => name !== (user?.displayName || user?.email || "User"));
    if (names.length === 0) return null;
    if (names.length === 1) return `${names[0]} sedang mengetik...`;
    if (names.length === 2) return `${names[0]} dan ${names[1]} sedang mengetik...`;
    return `${names.length} orang sedang mengetik...`;
  };

  const getOnlineMembers = (chat: Chat) => {
    if (!chat.members) return 0;
    return chat.members.filter((id) => {
      const u = users.find((user) => user.id === id);
      return u && u.online;
    }).length;
  };

  const getUserInfo = (userId: string) => users.find((u) => u.id === userId);

  const getUnreadCount = (chat: Chat) => chat.unreadCount || 0;

  const getOtherParticipant = (chat: Chat) => {
    if (chat.type !== "user") return null;
    const otherId = chat.members.find((id) => id !== user?.uid);
    return otherId ? getUserInfo(otherId) : null;
  };

  const getMessageStatus = (msg: Message) => {
    if (msg.senderId !== user?.uid) return null;
    if (!msg.delivered) return "Mengirim...";
    if (msg.read) return "Dibaca";
    return "Terkirim";
  };

  if (!isMounted) return <div style={{ minHeight: "100px" }} />;

  if (!user) {
    return (
      <div
        style={{
          maxWidth: "1400px",
          margin: "40px auto",
          padding: "60px 40px",
          textAlign: "center",
          backgroundColor: WHITE,
          borderRadius: "20px",
          border: `1px solid ${BLUE}1A`,
        }}
      >
        <h2 style={{ fontSize: "28px", fontWeight: 600, color: BLUE, fontFamily: FONT_FAMILY, marginBottom: "10px" }}>
          Live Chat
        </h2>
        <p style={{ fontSize: "16px", color: "#666", fontFamily: FONT_FAMILY, marginBottom: "20px" }}>
          Silakan login untuk menggunakan Live Chat
        </p>
        <Link href="/" style={{ textDecoration: "none" }}>
          <button
            style={{
              padding: "10px 30px",
              backgroundColor: BLUE,
              color: WHITE,
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: FONT_FAMILY,
            }}
          >
            Login
          </button>
        </Link>
      </div>
    );
  }

  // ===== MAIN USER VIEW =====
  return (
    <div
      style={{
        maxWidth: "1400px",
        margin: "40px auto",
        height: "700px",
        backgroundColor: WHITE,
        borderRadius: "20px",
        border: `1px solid ${BLUE}1A`,
        overflow: "hidden",
        display: "flex",
        position: "relative",
      }}
    >
      {showProfile && (
        <ProfilePage
          user={profileUser}
          db={db}
          onClose={() => setShowProfile(false)}
          isGroup={isGroupProfile}
          chatData={profileChatData}
        />
      )}

      {/* Sidebar */}
      <div
        style={{
          width: "360px",
          backgroundColor: BLUE,
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          borderRight: "1px solid rgba(255,255,255,0.1)",
          position: "relative",
        }}
      >
        {/* User Profile Header */}
        <div
          style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.1)", cursor: "pointer" }}
          onClick={() => {
            setProfileUser(user);
            setIsGroupProfile(false);
            setProfileChatData(null);
            setShowProfile(true);
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                overflow: "hidden",
                backgroundColor: WHITE,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <img
                src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email || "User")}&background=ffffff&color=0D3CFC&size=128`}
                alt={user.displayName || "User"}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: "15px", color: WHITE, fontFamily: FONT_FAMILY }}>
                {user.displayName || user.email || "User"}
              </div>
              <div style={{ fontSize: "10px", fontWeight: 800, color: WHITE, letterSpacing: "0.5px", textTransform: "uppercase" }}>
                Online
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLogout();
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "4px 10px",
                backgroundColor: "rgba(255,255,255,0.1)",
                color: WHITE,
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "6px",
                fontSize: "11px",
                cursor: "pointer",
                fontFamily: FONT_FAMILY,
                flexShrink: 0,
              }}
            >
              <LogoutIcon size={13} color={WHITE} />
              <span>Logout</span>
            </button>
          </div>
          <div style={{ marginTop: "8px", display: "flex", gap: "6px" }}>
            <input
              type="text"
              placeholder="Tulis bio..."
              value={userBio}
              onChange={(e) => setUserBio(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              style={{
                flex: 1,
                padding: "4px 10px",
                backgroundColor: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "6px",
                color: WHITE,
                fontSize: "12px",
                fontFamily: FONT_FAMILY,
                outline: "none",
              }}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                updateUserBio();
              }}
              style={{
                padding: "4px 12px",
                backgroundColor: WHITE,
                color: BLUE,
                border: "none",
                borderRadius: "6px",
                fontSize: "11px",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: FONT_FAMILY,
              }}
            >
              Submit
            </button>
          </div>
        </div>

        {/* Search + Actions */}
        <div
          style={{
            padding: "10px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "rgba(255,255,255,0.12)",
              borderRadius: "8px",
              padding: "6px 12px",
            }}
          >
            <SearchIcon size={16} color={WHITE} />
            <input
              type="text"
              placeholder="Cari chat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                color: WHITE,
                fontSize: "13px",
                fontFamily: FONT_FAMILY,
                caretColor: WHITE,
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              onClick={() => {
                setShowNewChat(!showNewChat);
                setShowCreateGroup(false);
              }}
              style={{
                flex: 1,
                padding: "6px 12px",
                backgroundColor: "rgba(255,255,255,0.15)",
                color: WHITE,
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "6px",
                fontSize: "12px",
                cursor: "pointer",
                fontFamily: FONT_FAMILY,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
              }}
            >
              <UserPlusIcon size={16} color={WHITE} />
              Chat Baru
            </button>
            <button
              onClick={() => {
                setShowCreateGroup(!showCreateGroup);
                setShowNewChat(false);
              }}
              style={{
                flex: 1,
                padding: "6px 12px",
                backgroundColor: "rgba(255,255,255,0.15)",
                color: WHITE,
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "6px",
                fontSize: "12px",
                cursor: "pointer",
                fontFamily: FONT_FAMILY,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
              }}
            >
              <GroupIcon size={16} color={WHITE} />
              Grup Baru
            </button>
          </div>

          {isAdmin && (
            <div
              style={{
                display: "flex",
                gap: "8px",
                marginTop: "4px",
                borderTop: "1px solid rgba(255,255,255,0.15)",
                paddingTop: "8px",
              }}
            >
              <button
                onClick={() => setShowBroadcastInput(!showBroadcastInput)}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  backgroundColor: WHITE,
                  color: BLUE,
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "12px",
                  cursor: "pointer",
                  fontFamily: FONT_FAMILY,
                  fontWeight: 700,
                }}
              >
                Broadcast
              </button>
              <button
                onClick={() => setShowAnnouncementInput(!showAnnouncementInput)}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  backgroundColor: WHITE,
                  color: BLUE,
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "12px",
                  cursor: "pointer",
                  fontFamily: FONT_FAMILY,
                  fontWeight: 700,
                }}
              >
                Pengumuman
              </button>
            </div>
          )}

          {showBroadcastInput && isAdmin && (
            <div style={{ backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "8px", padding: "10px", marginTop: "4px" }}>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", marginBottom: "6px", fontFamily: FONT_FAMILY }}>
                Pilih user untuk broadcast:
              </div>
              <div style={{ maxHeight: "100px", overflowY: "auto", marginBottom: "8px" }}>
                {users.filter((u) => u.id !== user.uid).map((u) => (
                  <label key={u.id} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "2px 4px", cursor: "pointer", fontFamily: FONT_FAMILY, fontSize: "11px", color: WHITE }}>
                    <input
                      type="checkbox"
                      checked={selectedBroadcastUsers.includes(u.id)}
                      onChange={() => toggleBroadcastUser(u.id)}
                      style={{ accentColor: BLUE }}
                    />
                    <span>{u.displayName || u.email || "User"}</span>
                  </label>
                ))}
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <input
                  type="text"
                  placeholder="Tulis broadcast..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "6px 10px",
                    backgroundColor: "rgba(255,255,255,0.15)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "6px",
                    color: WHITE,
                    fontSize: "12px",
                    fontFamily: FONT_FAMILY,
                    outline: "none",
                  }}
                />
                <button
                  onClick={sendBroadcast}
                  disabled={!broadcastMessage.trim() || selectedBroadcastUsers.length === 0}
                  style={{
                    padding: "6px 14px",
                    backgroundColor: broadcastMessage.trim() && selectedBroadcastUsers.length > 0 ? WHITE : "#666",
                    color: broadcastMessage.trim() && selectedBroadcastUsers.length > 0 ? BLUE : WHITE,
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: 700,
                    cursor: broadcastMessage.trim() && selectedBroadcastUsers.length > 0 ? "pointer" : "not-allowed",
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  Kirim
                </button>
              </div>
            </div>
          )}

          {showAnnouncementInput && isAdmin && (
            <div style={{ backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "8px", padding: "10px", marginTop: "4px" }}>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", marginBottom: "6px", fontFamily: FONT_FAMILY }}>
                Pengumuman akan dikirim ke semua user:
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <input
                  type="text"
                  placeholder="Tulis pengumuman..."
                  value={announcementMessage}
                  onChange={(e) => setAnnouncementMessage(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "6px 10px",
                    backgroundColor: "rgba(255,255,255,0.15)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "6px",
                    color: WHITE,
                    fontSize: "12px",
                    fontFamily: FONT_FAMILY,
                    outline: "none",
                  }}
                />
                <button
                  onClick={sendAnnouncement}
                  disabled={!announcementMessage.trim()}
                  style={{
                    padding: "6px 14px",
                    backgroundColor: announcementMessage.trim() ? WHITE : "#666",
                    color: announcementMessage.trim() ? BLUE : WHITE,
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: 700,
                    cursor: announcementMessage.trim() ? "pointer" : "not-allowed",
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  Kirim
                </button>
              </div>
            </div>
          )}
        </div>

        {showNewChat && (
          <div
            style={{
              padding: "10px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              backgroundColor: "rgba(255,255,255,0.05)",
              maxHeight: "200px",
              overflowY: "auto",
            }}
          >
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", fontFamily: FONT_FAMILY, marginBottom: "6px" }}>
              Pilih user untuk chat
            </div>
            {users.filter((u) => u.id !== user.uid).map((u) => (
              <div
                key={u.id}
                onClick={() => createNewChat(u.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "6px 10px",
                  cursor: "pointer",
                  borderRadius: "6px",
                }}
              >
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    backgroundColor: WHITE,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={u.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.email || "User")}&background=ffffff&color=0D3CFC&size=128`}
                    alt={u.email}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: "12px", color: WHITE, fontFamily: FONT_FAMILY }}>{u.displayName || u.email || "User"}</div>
                  <div style={{ fontSize: "10px", fontWeight: 800, color: u.online ? WHITE : "rgba(255,255,255,0.5)", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                    {u.online ? "Online" : "Offline"}
                  </div>
                </div>
              </div>
            ))}
            {users.filter((u) => u.id !== user.uid).length === 0 && (
              <div style={{ padding: "10px", textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: "12px", fontFamily: FONT_FAMILY }}>
                Belum ada user lain
              </div>
            )}
          </div>
        )}

        {showCreateGroup && (
          <div
            style={{
              padding: "10px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              backgroundColor: "rgba(255,255,255,0.05)",
              maxHeight: "250px",
              overflowY: "auto",
            }}
          >
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", fontFamily: FONT_FAMILY, marginBottom: "6px" }}>
              Buat grup baru
            </div>
            <div style={{ display: "flex", gap: "6px", marginBottom: "6px" }}>
              <input
                type="text"
                placeholder="Nama grup..."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                style={{
                  flex: 1,
                  padding: "4px 10px",
                  backgroundColor: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "6px",
                  color: WHITE,
                  fontSize: "12px",
                  fontFamily: FONT_FAMILY,
                  outline: "none",
                }}
              />
              <button
                onClick={createGroup}
                disabled={!groupName.trim() || selectedUsers.length === 0}
                style={{
                  padding: "4px 16px",
                  backgroundColor: groupName.trim() && selectedUsers.length > 0 ? WHITE : "#666",
                  color: groupName.trim() && selectedUsers.length > 0 ? BLUE : WHITE,
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: 700,
                  cursor: groupName.trim() && selectedUsers.length > 0 ? "pointer" : "not-allowed",
                  fontFamily: FONT_FAMILY,
                }}
              >
                Buat
              </button>
            </div>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", fontFamily: FONT_FAMILY, marginBottom: "4px" }}>
              Pilih anggota ({selectedUsers.length})
            </div>
            {users.filter((u) => u.id !== user.uid).map((u) => (
              <label key={u.id} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "4px 8px", cursor: "pointer", fontFamily: FONT_FAMILY, fontSize: "12px", color: WHITE }}>
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(u.id)}
                  onChange={() => {
                    if (selectedUsers.includes(u.id)) {
                      setSelectedUsers(selectedUsers.filter((id) => id !== u.id));
                    } else {
                      setSelectedUsers([...selectedUsers, u.id]);
                    }
                  }}
                  style={{ accentColor: BLUE }}
                />
                <span>{u.displayName || u.email || "User"}</span>
              </label>
            ))}
          </div>
        )}

        {/* Chat List */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {filteredChats.map((chat) => {
            const isActive = selectedChat?.id === chat.id;
            const unread = getUnreadCount(chat);
            const otherUser = chat.type === "user" ? getOtherParticipant(chat) : null;
            const displayName = chat.type === "user" && otherUser ? otherUser.displayName || otherUser.email || "User" : chat.name;
            const displayPhoto =
              chat.type === "user" && otherUser
                ? otherUser.photoURL || getUserPhoto(otherUser.email)
                : chat.photo || getUserPhoto();
            const isOnline = chat.type === "user" && otherUser ? otherUser.online : false;
            const typingText = getTypingUsers(chat);

            return (
              <div
                key={chat.id}
                onClick={() => handleChatSelect(chat)}
                style={{
                  padding: "10px 16px",
                  cursor: "pointer",
                  backgroundColor: isActive ? "rgba(255,255,255,0.15)" : "transparent",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      overflow: "hidden",
                      backgroundColor: WHITE,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <img src={displayPhoto} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: isActive ? 600 : 500, fontSize: "13px", color: WHITE, fontFamily: FONT_FAMILY }}>
                      {displayName}
                      {chat.type === "group" && (
                        <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", marginLeft: "4px" }}>
                          ({chat.memberCount || 0})
                        </span>
                      )}
                    </div>
                    {typingText && (
                      <div style={{ fontSize: "11px", color: WHITE, fontFamily: FONT_FAMILY, fontStyle: "italic" }}>{typingText}</div>
                    )}
                    <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", fontFamily: FONT_FAMILY }}>
                      {chat.lastMessage || "Mulai chat..."}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px", flexWrap: "wrap" }}>
                      {chat.type === "user" ? (
                        <div style={{ fontSize: "10px", fontWeight: 800, color: WHITE, letterSpacing: "0.5px", textTransform: "uppercase" }}>
                          {isOnline ? "Online" : "Offline"}
                        </div>
                      ) : (
                        <span style={{ fontSize: "10px", fontWeight: 800, color: WHITE, letterSpacing: "0.5px", textTransform: "uppercase" }}>
                          {getOnlineMembers(chat)} online
                        </span>
                      )}
                      {unread > 0 && (
                        <span
                          style={{
                            fontSize: "9px",
                            backgroundColor: WHITE,
                            color: BLUE,
                            padding: "1px 8px",
                            borderRadius: "10px",
                            fontWeight: 700,
                            fontFamily: FONT_FAMILY,
                          }}
                        >
                          {unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredChats.length === 0 && (
            <div style={{ padding: "30px 20px", textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: "13px", fontFamily: FONT_FAMILY }}>
              Tidak ada chat
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", backgroundColor: "#f0f2f5" }}>
        {selectedChat ? (
          <>
            <div
              style={{
                padding: "12px 20px",
                backgroundColor: BLUE,
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    backgroundColor: WHITE,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={
                      selectedChat.type === "user" && getOtherParticipant(selectedChat)
                        ? getOtherParticipant(selectedChat)?.photoURL || getUserPhoto(getOtherParticipant(selectedChat)?.email)
                        : selectedChat.photo || getUserPhoto()
                    }
                    alt={selectedChat.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "14px", color: WHITE, fontFamily: FONT_FAMILY }}>
                    {selectedChat.type === "user" && getOtherParticipant(selectedChat)
                      ? getOtherParticipant(selectedChat)?.displayName || getOtherParticipant(selectedChat)?.email || "User"
                      : selectedChat.name}
                    {selectedChat.type === "group" && (
                      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", marginLeft: "6px" }}>
                        ({getOnlineMembers(selectedChat)} online)
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "10px", fontWeight: 800, color: WHITE, letterSpacing: "0.5px", textTransform: "uppercase" }}>
                    {selectedChat.type === "user" && getOtherParticipant(selectedChat)
                      ? getOtherParticipant(selectedChat)?.online
                        ? "Online"
                        : "Offline"
                      : `${selectedChat.memberCount || 0} anggota`}
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                padding: "8px 20px",
                backgroundColor: WHITE,
                borderBottom: "1px solid #e8e8e8",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flexShrink: 0,
              }}
            >
              <SearchIcon size={14} color={BLUE} />
              <input
                type="text"
                placeholder="Cari pesan..."
                value={messageSearchQuery}
                onChange={(e) => setMessageSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: BLUE,
                  fontSize: "12px",
                  fontFamily: FONT_FAMILY,
                }}
              />
            </div>

            <div
              ref={chatContainerRef}
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "16px 20px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                minHeight: 0,
              }}
            >
              {filteredMessages.length === 0 ? (
                <div style={{ textAlign: "center", color: "#999", fontSize: "13px", padding: "40px 0", fontFamily: FONT_FAMILY }}>
                  {messageSearchQuery ? "Tidak ada pesan yang ditemukan" : "Belum ada pesan"}
                </div>
              ) : (
                filteredMessages.map((msg, idx) => {
                  const isMine = msg.senderId === user?.uid;
                  const status = getMessageStatus(msg);
                  return (
                    <div
                      key={idx}
                      style={{
                        alignSelf: isMine ? "flex-end" : "flex-start",
                        maxWidth: "70%",
                        display: "flex",
                        alignItems: "flex-end",
                        gap: "6px",
                      }}
                    >
                      {!isMine && (
                        <div
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            overflow: "hidden",
                            backgroundColor: WHITE,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <img
                            src={msg.senderPhoto || getUserPhoto()}
                            alt={msg.senderName}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        </div>
                      )}
                      <div
                        style={{
                          padding: "8px 14px",
                          borderRadius: "12px",
                          backgroundColor: isMine ? BLUE : WHITE,
                          color: isMine ? WHITE : BLACK,
                          fontSize: "13px",
                          fontFamily: FONT_FAMILY,
                          wordBreak: "break-word",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                          border: !isMine ? "1px solid #e8e8e8" : "none",
                          maxWidth: "100%",
                        }}
                      >
                        {!isMine && (
                          <div style={{ fontSize: "9px", fontWeight: 500, color: BLUE, marginBottom: "2px", fontFamily: FONT_FAMILY }}>
                            {msg.senderName}
                          </div>
                        )}
                        <div>{msg.text}</div>
                        <div
                          style={{
                            fontSize: "9px",
                            color: isMine ? "rgba(255,255,255,0.7)" : "#999",
                            marginTop: "4px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            gap: "4px",
                            fontFamily: FONT_FAMILY,
                          }}
                        >
                          {formatTime(msg.timestamp)}
                          {isMine && status && (
                            <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "8px", fontWeight: 500 }}>{status}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div
              style={{
                padding: "10px 20px",
                borderTop: "1px solid #e8e8e8",
                backgroundColor: WHITE,
                display: "flex",
                gap: "10px",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              <input
                type="text"
                value={messageText}
                onChange={handleTyping}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && messageText.trim()) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Ketik pesan..."
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  border: "1px solid #e8e8e8",
                  borderRadius: "24px",
                  fontSize: "14px",
                  outline: "none",
                  fontFamily: FONT_FAMILY,
                  backgroundColor: "#f8f9ff",
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!messageText.trim()}
                style={{
                  padding: "10px 18px",
                  backgroundColor: messageText.trim() ? BLUE : "#ccc",
                  color: WHITE,
                  border: "none",
                  borderRadius: "24px",
                  cursor: messageText.trim() ? "pointer" : "not-allowed",
                  fontFamily: FONT_FAMILY,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                <SendIcon size={16} color={WHITE} />
                <span>Kirim</span>
              </button>
            </div>
          </>
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              color: "#999",
              fontSize: "14px",
              fontFamily: FONT_FAMILY,
              gap: "8px",
            }}
          >
            <div style={{ fontSize: "48px" }}>💬</div>
            <div>Pilih chat dari daftar di kiri</div>
          </div>
        )}
      </div>
    </div>
  );
};

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

        {/* LIVE CHAT CONTENT */}
        <div style={{ padding: "0 40px", maxWidth: "1600px", margin: "0 auto", width: "100%" }}>
          <LiveChat user={user} db={db} auth={auth} />
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
