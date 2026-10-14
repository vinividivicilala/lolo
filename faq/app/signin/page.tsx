'use client';

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { apiRequest } from "@/lib/apiClient";
import gsap from "gsap";

// ===== FONT =====
const FONT_FAMILY = "'Plus Jakarta Sans'";

// ===== WARNA =====
const BLUE = "#0D3CFC";
const WHITE = "#FFFFFF";
const BLACK = "#000000";
const LIME = "#E3FB96";
const GREEN = "#4ADE80";

// ===== SVG ICONS =====
const NorthEastArrow = ({ size = 24, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M7 17L17 7M17 7H8M17 7V16" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const NorthWestArrow = ({ size = 24, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M17 17L7 7M7 17V7H17" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const EyeIcon = ({ open, color = WHITE }: { open: boolean; color?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    {open ? (
      <>
        <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke={color} strokeWidth="1.5" />
        <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.5" />
      </>
    ) : (
      <>
        <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke={color} strokeWidth="1.5" />
        <path d="M3 3L21 21" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </>
    )}
  </svg>
);

const HelpDeskIcon = ({ size = 24, color = BLUE }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12V15" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M5 15C5 13.8954 5.89543 13 7 13H8C9.10457 13 10 13.8954 10 15V17C10 18.1046 9.10457 19 8 19H7C5.89543 19 5 18.1046 5 17V15Z" stroke={color} strokeWidth="1.5" />
    <path d="M19 15C19 13.8954 18.1046 13 17 13H16C14.8954 13 14 13.8954 14 15V17C14 18.1046 14.8954 19 16 19H17C18.1046 19 19 18.1046 19 17V15Z" stroke={color} strokeWidth="1.5" />
  </svg>
);

const PeopleIcon = ({ size = 20, color = "#ffffff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="8" r="4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 21V19C4 16.7909 5.79086 15 8 15H16C18.2091 15 20 16.7909 20 19V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SayHeyIcon = ({ size = 22, color = "#000000" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 11.5C21 16.1944 16.9706 20 12 20C10.8452 20 9.74371 19.7964 8.73507 19.4276L4 21L5.45177 16.7441C4.53668 15.3762 4 13.7581 4 12C4 7.30558 8.02944 3.5 12 3.5C16.9706 3.5 21 7.30558 21 11.5Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="9" cy="11.5" r="1" fill={color} />
    <circle cx="12" cy="11.5" r="1" fill={color} />
    <circle cx="15" cy="11.5" r="1" fill={color} />
  </svg>
);

const StriperIcon = ({ size = 22, color = "#ffffff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 6H21" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
    <path d="M3 12H21" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
    <path d="M3 18H21" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
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

// ===== NAVBAR BUTTON =====
const NavbarButton = ({
  label, panelTitle, panelDescription, panelImage, panelRightTitle, panelRightDescription,
  iconType, bigPanelWidth = 850, bigPanelHeight = 260, buttonColor = "#0D3CFC", buttonHoverColor = "#000000",
  panelColor = "#0D3CFC", iconButtonColor = "#000000", iconButtonHoverColor = "#0D3CFC",
  panelBoxColor = "rgba(255,255,255,0.12)", panelBoxBorder = "rgba(255,255,255,0.25)",
  labelTextColor = "#ffffff", labelTextHoverColor = "#ffffff", titleTextColor = "#ffffff",
  descriptionTextColor = "rgba(255,255,255,0.9)", iconComponent = null, isResources = false,
}: any) => {
  const [open, setOpen] = useState(false);
  const linesTopRef = useRef<SVGLineElement>(null);
  const linesBottomRef = useRef<SVGLineElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleEnter = () => {
    if (closeTimeoutRef.current) { clearTimeout(closeTimeoutRef.current); closeTimeoutRef.current = null; }
    setOpen(true);
  };
  const handleLeave = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => setOpen(false), 250);
  };

  useEffect(() => () => { if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current); }, []);

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
      gsap.fromTo(panelRef.current, { opacity: 0, y: -20, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "power3.out" });
    } else {
      gsap.to(panelRef.current, { opacity: 0, y: -20, scale: 0.96, duration: 0.25, ease: "power2.in" });
    }
  }, [open]);

  const strokeColor = open ? labelTextHoverColor : labelTextColor;

  return (
    <div style={{ position: "relative" }} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <div style={{
        display: "flex", alignItems: "center", gap: "10px", padding: "10px 16px",
        backgroundColor: open ? buttonHoverColor : buttonColor, backdropFilter: "blur(20px)",
        borderRadius: "10px", border: "1px solid rgba(255,255,255,0.18)",
        boxShadow: open ? "0 8px 24px rgba(0,0,0,0.35)" : `0 8px 24px ${buttonColor}55`,
        transition: "background-color 0.25s ease", cursor: "pointer", position: "relative", zIndex: 2,
      }}>
        <span style={{ color: open ? labelTextHoverColor : labelTextColor, fontSize: "14px", fontWeight: 600, letterSpacing: "0.02em", fontFamily: FONT_FAMILY, whiteSpace: "nowrap" }}>
          {label}
        </span>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "22px", height: "22px", backgroundColor: open ? iconButtonHoverColor : iconButtonColor, borderRadius: "6px" }}>
          {iconComponent ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <StriperIcon size={14} color={strokeColor} />
            </div>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ display: "block" }}>
              <line ref={linesTopRef} x1="4" y1="7" x2="20" y2="7" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
              <line ref={linesBottomRef} x1="4" y1="17" x2="20" y2="17" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          )}
        </div>
      </div>

      {open && (
        <div ref={panelRef} onMouseEnter={handleEnter} onMouseLeave={handleLeave} style={{
          position: "absolute", top: "calc(100% + 10px)", left: "0px",
          width: `${bigPanelWidth}px`, minHeight: `${bigPanelHeight}px`,
          backgroundColor: panelColor, backdropFilter: "blur(24px)", borderRadius: "10px",
          border: "1px solid rgba(255,255,255,0.2)", boxShadow: `0 8px 32px ${panelColor}55`,
          zIndex: 1, fontFamily: FONT_FAMILY, color: titleTextColor, padding: "22px 26px",
          display: "flex", gap: "20px", alignItems: "flex-start",
        }}>
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
                  {iconComponent ? iconComponent : iconType === "trust" ? <TrustIcon size={26} color={titleTextColor} /> : iconType === "career" ? <CareerIcon size={26} color={titleTextColor} /> : <ResourcesIcon size={26} color={titleTextColor} />}
                  <span style={{ fontSize: "20px", fontWeight: 700, fontFamily: FONT_FAMILY, color: titleTextColor }}>{panelTitle}</span>
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
                  <p style={{ fontSize: "12px", lineHeight: 1.5, color: descriptionTextColor, margin: 0, fontFamily: FONT_FAMILY }}>Panduan lengkap dan referensi teknis.</p>
                </div>
                <div style={{ backgroundColor: panelBoxColor, border: `1px solid ${panelBoxBorder}`, borderRadius: "12px", padding: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <img src={panelImage} alt="Brand" style={{ width: "100%", height: "120px", objectFit: "contain", display: "block", borderRadius: "8px" }} />
                  <span style={{ fontSize: "14px", fontWeight: 700, fontFamily: FONT_FAMILY, color: titleTextColor }}>Brand Assets</span>
                  <p style={{ fontSize: "12px", lineHeight: 1.5, color: descriptionTextColor, margin: 0, fontFamily: FONT_FAMILY }}>Logo, palet warna, dan identitas visual.</p>
                </div>
              </>
            ) : (
              <div style={{ backgroundColor: panelBoxColor, border: `1px solid ${panelBoxBorder}`, borderRadius: "12px", padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <img src={panelImage} alt={panelTitle} style={{ width: "100%", height: "170px", objectFit: "contain", display: "block", borderRadius: "10px" }} />
                <span style={{ fontSize: "15px", fontWeight: 700, fontFamily: FONT_FAMILY, color: titleTextColor }}>{panelRightTitle}</span>
                <p style={{ fontSize: "12px", lineHeight: 1.5, color: descriptionTextColor, margin: 0, fontFamily: FONT_FAMILY }}>{panelRightDescription}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ===== LEFT NAVBAR =====
const LeftNavbar = ({ shifted }: { shifted: boolean }) => (
  <div style={{
    position: "fixed", top: "20px", left: shifted ? "340px" : "60px", zIndex: 9000,
    display: "flex", alignItems: "center", gap: "8px", fontFamily: FONT_FAMILY,
    transition: "left 0.6s cubic-bezier(0.65, 0, 0.35, 1)", willChange: "left",
  }}>
    <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "12px", marginRight: "16px" }}>
      <img src="/images/nop.jpg" alt="Menuru" style={{ height: "60px", width: "auto", maxWidth: "none", objectFit: "contain", display: "block", flexShrink: 0, mixBlendMode: "multiply" }} />
      <span style={{ color: BLUE, fontSize: "60px", fontWeight: 700, letterSpacing: "-0.03em", fontFamily: FONT_FAMILY, lineHeight: 1, whiteSpace: "nowrap" }}>Menuru</span>
    </Link>

    <NavbarButton label="Teams" panelTitle="Trust" panelDescription="Keamanan dan privasi Anda adalah prioritas kami dengan enkripsi end-to-end." panelImage="/images/p0l.jpg" panelRightTitle="Why Trust Us" panelRightDescription="Sistem kami dipantau 24/7 untuk melindungi data Anda." iconType="trust" bigPanelWidth={850} bigPanelHeight={260} />
    <NavbarButton label="Individual" panelTitle="Careers" panelDescription="Bergabunglah dengan tim kami dan bangun karier yang bermakna di lingkungan yang suportif." panelImage="/images/xxz.jpg" panelRightTitle="Life at Menuru" panelRightDescription="Budaya kerja kolaboratif, fleksibel, dan penuh peluang untuk tumbuh bersama." iconType="career" bigPanelWidth={850} bigPanelHeight={260} />
    <NavbarButton label="Resources" panelTitle="Docs & Brand" panelDescription="Akses dokumentasi lengkap dan aset brand Menuru dalam satu tempat." panelImage="/images/p0l.jpg" panelRightTitle="Docs & Brand" panelRightDescription="Panduan, aset visual, dan referensi resmi brand Menuru." iconType="resources" iconComponent={<StriperIcon size={22} color="#ffffff" />} bigPanelWidth={850} bigPanelHeight={340} buttonColor="#0D3CFC" buttonHoverColor="#0D3CFC" panelColor="#000000" iconButtonColor="#000000" iconButtonHoverColor="#000000" panelBoxColor="rgba(255,255,255,0.12)" panelBoxBorder="rgba(255,255,255,0.25)" labelTextColor="#ffffff" labelTextHoverColor="#ffffff" titleTextColor="#ffffff" descriptionTextColor="rgba(255,255,255,0.92)" isResources={true} />
  </div>
);

// ===== RIGHT NAVBAR =====
const RightNavbar = ({
  user, auth, db, onSayHeyToggle, sayHeyOpen, sayHeyUnreadCount, locationText,
}: {
  user: any; auth: any; db: any;
  onSayHeyToggle: () => void; sayHeyOpen: boolean; sayHeyUnreadCount: number; locationText: string;
}) => {
  const rollingRef = useRef<HTMLDivElement>(null);
  const [rollingIndex, setRollingIndex] = useState(0);
  const displayName = user?.displayName || user?.email?.split("@")[0] || "User";
  const photoURL = user?.photoURL || "";

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => setRollingIndex((prev) => (prev + 1) % 3), 3000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (!user || !rollingRef.current) return;
    const el = rollingRef.current;
    gsap.killTweensOf(el);
    gsap.fromTo(el,
      { yPercent: 100, opacity: 0, rotateX: -90, transformOrigin: "50% 100%" },
      { yPercent: 0, opacity: 1, rotateX: 0, duration: 0.6, ease: "back.out(1.7)" }
    );
    return () => { gsap.killTweensOf(el); };
  }, [rollingIndex, user]);

  const handleLogout = async () => {
    if (!auth) return;
    try {
      if (db && user) {
        const { updateDoc, doc, serverTimestamp } = await import("firebase/firestore");
        await updateDoc(doc(db, "users", user.uid), { online: false, lastSeen: serverTimestamp() });
      }
      const { signOut } = await import("firebase/auth");
      await signOut(auth);
    } catch (error) { console.error("Logout error:", error); }
  };

  const SayHeyButton = () => (
    <button onClick={onSayHeyToggle} style={{
      position: "relative", display: "inline-flex", alignItems: "center", gap: "10px",
      padding: "10px 18px", backgroundColor: sayHeyOpen ? BLACK : LIME, borderRadius: "10px",
      border: `1px solid ${sayHeyOpen ? BLACK : LIME}`,
      boxShadow: sayHeyOpen ? "0 8px 24px rgba(0,0,0,0.35)" : "0 8px 24px rgba(227,251,150,0.45)",
      cursor: "pointer", transition: "all 0.2s ease",
    }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.05)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
    >
      <SayHeyIcon size={18} color={sayHeyOpen ? WHITE : BLACK} />
      <span style={{ color: sayHeyOpen ? WHITE : BLACK, fontSize: "14px", fontWeight: 700, letterSpacing: "0.02em", fontFamily: FONT_FAMILY, whiteSpace: "nowrap" }}>Say Hey</span>
      <NorthEastArrow size={16} color={sayHeyOpen ? WHITE : BLACK} />
      {sayHeyUnreadCount > 0 && !sayHeyOpen && (
        <span style={{
          position: "absolute", top: "-6px", right: "-6px", minWidth: "20px", height: "20px",
          padding: "0 6px", borderRadius: "10px", backgroundColor: BLUE, color: WHITE,
          fontSize: "11px", fontWeight: 800, fontFamily: FONT_FAMILY,
          display: "flex", alignItems: "center", justifyContent: "center",
          border: `2px solid ${WHITE}`, boxShadow: "0 2px 8px rgba(13,60,252,0.5)",
        }}>
          {sayHeyUnreadCount > 99 ? "99+" : sayHeyUnreadCount}
        </span>
      )}
    </button>
  );

  if (!user) {
    return (
      <div style={{
        position: "fixed", top: "20px", right: "24px", zIndex: 9000,
        display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px", fontFamily: FONT_FAMILY,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <SayHeyButton />
          <Link href="/signin" style={{
            textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "10px",
            padding: "10px 18px 10px 16px", backgroundColor: BLUE, borderRadius: "10px",
            border: `1px solid ${BLUE}`, boxShadow: "0 8px 24px rgba(13,60,252,0.35)",
            cursor: "pointer", transition: "transform 0.2s ease",
          }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1.05)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1)"; }}
          >
            <PeopleIcon size={20} color="#ffffff" />
            <span style={{ color: "#ffffff", fontSize: "14px", fontWeight: 700, letterSpacing: "0.02em", fontFamily: FONT_FAMILY, whiteSpace: "nowrap" }}>Sign In</span>
          </Link>
        </div>
        {locationText && (
          <div style={{ fontSize: "20px", fontWeight: 700, color: BLUE, letterSpacing: "-0.02em", fontFamily: FONT_FAMILY, whiteSpace: "nowrap", textAlign: "right" }}>{locationText}</div>
        )}
      </div>
    );
  }

  return (
    <div style={{
      position: "fixed", top: "20px", right: "24px", zIndex: 9000, fontFamily: FONT_FAMILY,
      display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <SayHeyButton />
        <div style={{ position: "relative", height: "90px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "flex-end", minWidth: "260px" }}>
          <div ref={rollingRef} style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "12px", width: "100%" }}>
            {rollingIndex === 0 && (
              <>
                <span style={{ color: BLUE, fontSize: "70px", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1, whiteSpace: "nowrap", fontFamily: FONT_FAMILY }}>{displayName}</span>
                <div style={{ width: "70px", height: "70px", borderRadius: "50%", overflow: "hidden", backgroundColor: BLUE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {photoURL ? (
                    <img src={photoURL} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} referrerPolicy="no-referrer" />
                  ) : (
                    <span style={{ fontSize: "30px", fontWeight: 800, color: WHITE }}>{displayName.charAt(0).toUpperCase()}</span>
                  )}
                </div>
              </>
            )}
            {rollingIndex === 1 && (
              <Link href="/dashboard" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "12px", whiteSpace: "nowrap" }}>
                <span style={{ color: BLUE, fontSize: "70px", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1, fontFamily: FONT_FAMILY }}>Dashboard</span>
                <NorthEastArrow size={50} color={BLUE} />
              </Link>
            )}
            {rollingIndex === 2 && (
              <button onClick={handleLogout} style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", whiteSpace: "nowrap", fontFamily: FONT_FAMILY }}>
                <span style={{ color: BLUE, fontSize: "70px", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1 }}>Logout</span>
                <svg width="50" height="50" viewBox="0 0 24 24" fill="none">
                  <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke={BLUE} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M16 17L21 12L16 7" stroke={BLUE} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M21 12H9" stroke={BLUE} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
      {locationText && (
        <div style={{ fontSize: "20px", fontWeight: 700, color: BLUE, letterSpacing: "-0.02em", fontFamily: FONT_FAMILY, whiteSpace: "nowrap", textAlign: "right" }}>{locationText}</div>
      )}
    </div>
  );
};

// ===== SAY HEY SECTION (SEDERHANA UNTUK SIGN IN PAGE) =====
const SayHeySection = ({ user, onClose }: { user: any; onClose: () => void }) => {
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<{ id: string; sender: string; text: string; time: string }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = () => {
    if (!messageText.trim()) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    setMessages((prev) => [...prev, { id: Date.now().toString(), sender: user?.displayName || user?.email || "You", text: messageText.trim(), time: timeStr }]);
    setMessageText("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      transition={{ duration: 0.5 }}
      style={{
        width: "100%", backgroundColor: BLUE, borderRadius: "20px", padding: "40px",
        fontFamily: FONT_FAMILY, color: WHITE, marginBottom: "40px", minHeight: "400px",
        position: "relative",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <SayHeyIcon size={40} color={WHITE} />
          <div>
            <h3 style={{ fontSize: "48px", fontWeight: 700, color: WHITE, margin: 0, letterSpacing: "-0.02em", fontFamily: FONT_FAMILY, lineHeight: 1.1 }}>
              Say Hey
            </h3>
            <p style={{ fontSize: "16px", fontWeight: 500, color: WHITE, margin: 0, lineHeight: 1.5, opacity: 0.95, fontFamily: FONT_FAMILY }}>
              Real-time chat with our team. Your chat is private and encrypted.
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            padding: "10px 20px", backgroundColor: WHITE, color: BLUE,
            border: `2px solid ${WHITE}`, borderRadius: "10px", fontSize: "14px",
            fontWeight: 800, cursor: "pointer", fontFamily: FONT_FAMILY,
            letterSpacing: "0.5px", textTransform: "uppercase",
            display: "flex", alignItems: "center", gap: "8px",
          }}
        >
          Close
          <NorthEastArrow size={20} color={BLUE} />
        </button>
      </div>

      {!user ? (
        <div style={{ backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "16px", padding: "40px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <SayHeyIcon size={64} color={WHITE} />
          <p style={{ fontSize: "18px", fontWeight: 500, color: WHITE, margin: 0, maxWidth: "600px", lineHeight: 1.5, fontFamily: FONT_FAMILY }}>
            Please sign in to your account to start a real-time conversation.
          </p>
          <Link href="/signin" style={{
            textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "10px",
            padding: "14px 28px", backgroundColor: WHITE, color: BLUE, borderRadius: "12px",
            fontSize: "16px", fontWeight: 800, fontFamily: FONT_FAMILY, letterSpacing: "0.02em",
          }}>
            Sign In to Continue
            <NorthEastArrow size={20} color={BLUE} />
          </Link>
        </div>
      ) : (
        <div style={{ backgroundColor: WHITE, borderRadius: "16px", overflow: "hidden", display: "flex", flexDirection: "column", height: "400px" }}>
          <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "12px", backgroundColor: "#fafafa" }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: "center", color: "#999", fontSize: "14px", padding: "30px 0", fontFamily: FONT_FAMILY }}>
                No messages yet. Say hey! 👋
              </div>
            ) : (
              messages.map((msg) => {
                const isMine = msg.sender === (user?.displayName || user?.email || "You");
                return (
                  <div key={msg.id} style={{ alignSelf: isMine ? "flex-end" : "flex-start", maxWidth: "75%" }}>
                    <div style={{
                      padding: "10px 14px", borderRadius: "12px",
                      backgroundColor: isMine ? BLUE : "#ffffff",
                      color: isMine ? WHITE : BLACK, fontSize: "14px",
                      fontFamily: FONT_FAMILY, wordBreak: "break-word",
                      border: isMine ? "none" : "1px solid rgba(0,0,0,0.06)",
                      boxShadow: isMine ? "none" : "0 2px 6px rgba(0,0,0,0.04)",
                    }}>
                      {!isMine && <div style={{ fontSize: "11px", fontWeight: 700, color: BLUE, marginBottom: "4px" }}>{msg.sender}</div>}
                      <div>{msg.text}</div>
                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "4px" }}>
                        <span style={{ fontSize: "10px", color: isMine ? "rgba(255,255,255,0.85)" : "#999" }}>{msg.time}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
          <div style={{ padding: "14px 20px", borderTop: "1px solid rgba(0,0,0,0.06)", display: "flex", gap: "10px", backgroundColor: WHITE, flexShrink: 0 }}>
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={(e) => { if (e.key === "Enter" && !e.shiftKey && messageText.trim()) { e.preventDefault(); handleSend(); } }}
              placeholder="Type your message..."
              style={{
                flex: 1, padding: "12px 16px", border: `2px solid ${BLUE}`,
                borderRadius: "10px", fontSize: "14px", outline: "none",
                fontFamily: FONT_FAMILY, backgroundColor: BLUE, color: WHITE,
              }}
            />
            <button
              onClick={handleSend}
              disabled={!messageText.trim()}
              style={{
                padding: "12px 24px", backgroundColor: messageText.trim() ? BLUE : "#ccc",
                color: WHITE, border: "none", borderRadius: "10px",
                cursor: messageText.trim() ? "pointer" : "not-allowed",
                fontFamily: FONT_FAMILY, fontSize: "13px", fontWeight: 800,
                letterSpacing: "0.5px", textTransform: "uppercase",
                display: "flex", alignItems: "center", gap: "8px",
              }}
            >
              Send
              {messageText.trim() && <NorthEastArrow size={18} color={WHITE} />}
            </button>
          </div>
        </div>
      )}
    </motion.div>
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
    const chars = title.textContent?.split("") || [];
    title.innerHTML = chars.map((ch) => `<span style="display:inline-block">${ch}</span>`).join("");

    const spans = title.querySelectorAll("span");
    const ctx = gsap.context(() => {
      gsap.set(spans, { yPercent: 120, opacity: 0, rotationX: -90, transformOrigin: "50% 100%", force3D: true });
      gsap.to(spans, {
        yPercent: 0, opacity: 1, rotationX: 0, duration: 1, stagger: 0.08, ease: "back.out(1.7)",
        scrollTrigger: { trigger: containerRef.current, start: "top 90%", end: "top 40%", scrub: 1, toggleActions: "play none none reverse", invalidateOnRefresh: true },
      });
    }, containerRef);

    return () => { ctx.revert(); };
  }, []);

  return (
    <div ref={containerRef} style={{ width: "100%", padding: "0 40px 20px 40px", backgroundColor: "#ffffff", overflow: "visible", display: "flex", flexDirection: "column", justifyContent: "flex-start", position: "relative" }}>
      <span ref={titleRef} style={{ fontFamily: FONT_FAMILY, fontSize: "600px", fontWeight: 400, color: BLUE, letterSpacing: "-0.05em", lineHeight: "0.85", display: "block", textAlign: "left", WebkitFontSmoothing: "antialiased", MozOsxFontSmoothing: "grayscale", willChange: "transform, opacity", whiteSpace: "nowrap", margin: 0, padding: 0, overflow: "visible", position: "relative" }}>
        Menuru
      </span>
      <div style={{ width: "100%", display: "flex", justifyContent: "flex-start", marginTop: "10px" }}>
        <span style={{ fontFamily: FONT_FAMILY, fontSize: "16px", fontWeight: 400, color: BLUE, letterSpacing: "0.01em", opacity: 0.8 }}>
          2024 - 2026 Menuru. All rights reserved.
        </span>
      </div>
    </div>
  );
};

// ===== FOOTER LINKS =====
const footerLinks = [
  { title: "Get in Touch", links: ["Contact Us", "Instagram", "Live Chat"] },
  { title: "Product", links: ["Shop", "Note", "Calendar", "Blog", "Donation", "Community", "Live Chat Agent", "Stories"] },
  { title: "Attention", links: ["Privacy Policy", "Terms & Conditions", "About Us", "Terms of Use", "Cookies Policy", "Help Center"] },
];

// ===== PRELOADER =====
const Preloader = ({ onComplete }: { onComplete: () => void }) => {
  const preloaderRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        if (preloaderRef.current) {
          gsap.to(preloaderRef.current, { opacity: 0, duration: 0.6, onComplete });
        }
      },
    });
    gsap.set(textRef.current, { y: 100, opacity: 0 });
    tl.to(textRef.current, { y: 0, opacity: 1, duration: 0.8, ease: "back.out(1.7)" })
      .to(textRef.current, { duration: 0.6 })
      .to(textRef.current, { opacity: 0, y: -20, scale: 0.9, duration: 0.4, onComplete: () => { if (textRef.current) textRef.current.textContent = "Note"; } })
      .to(textRef.current, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.7)" })
      .to(textRef.current, { duration: 0.8 })
      .to(textRef.current, { scale: 0.3, opacity: 0, duration: 0.7 })
      .to(preloaderRef.current, { scale: 0.95, opacity: 0.8, duration: 0.3 }, "-=0.3");
  }, [onComplete]);

  return (
    <div ref={preloaderRef} style={{
      position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
      backgroundColor: "#ffffff", display: "flex", alignItems: "center",
      justifyContent: "center", zIndex: 9999, fontFamily: FONT_FAMILY,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "40px" }}>
        <span style={{ fontSize: "100px", fontWeight: 400, color: BLUE, fontFamily: FONT_FAMILY, letterSpacing: "-0.03em" }}>Menuru</span>
        <span ref={textRef} style={{ fontSize: "50px", fontWeight: 600, color: BLACK, fontFamily: FONT_FAMILY, display: "inline-block" }}>Shop</span>
      </div>
    </div>
  );
};

// ===== PIN INPUT (6 KOLOM TERPISAH) =====
const PinInput = ({
  value, onChange, onComplete, isNew, confirmValue, onConfirmChange,
}: {
  value: string; onChange: (v: string) => void; onComplete?: () => void;
  isNew?: boolean; confirmValue?: string; onConfirmChange?: (v: string) => void;
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const confirmRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, val: string, isConfirm: boolean = false) => {
    const numericVal = val.replace(/\D/g, "");
    if (!numericVal) return;

    const current = isConfirm ? (confirmValue || "") : value;
    const newVal = current.split("");
    newVal[index] = numericVal[numericVal.length - 1];
    const result = newVal.join("").slice(0, 6);

    if (isConfirm) {
      onConfirmChange?.(result);
    } else {
      onChange(result);
      if (result.length === 6 && onComplete) {
        setTimeout(() => onComplete(), 200);
      }
    }

    // Auto focus next
    if (index < 5 && numericVal) {
      const refs = isConfirm ? confirmRefs : inputRefs;
      setTimeout(() => refs.current[index + 1]?.focus(), 10);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>, isConfirm: boolean = false) => {
    const refs = isConfirm ? confirmRefs : inputRefs;
    if (e.key === "Backspace") {
      e.preventDefault();
      const current = isConfirm ? (confirmValue || "") : value;
      const newVal = current.split("");
      if (newVal[index]) {
        newVal[index] = "";
        const result = newVal.join("");
        if (isConfirm) onConfirmChange?.(result);
        else onChange(result);
      } else if (index > 0) {
        refs.current[index - 1]?.focus();
        const prevVal = current.split("");
        prevVal[index - 1] = "";
        const result = prevVal.join("");
        if (isConfirm) onConfirmChange?.(result);
        else onChange(result);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      refs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      refs.current[index + 1]?.focus();
    }
  };

  const renderBoxes = (val: string, isConfirm: boolean) => {
    const refs = isConfirm ? confirmRefs : inputRefs;
    return (
      <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            type="password"
            inputMode="numeric"
            maxLength={1}
            value={val[i] || ""}
            onChange={(e) => handleChange(i, e.target.value, isConfirm)}
            onKeyDown={(e) => handleKeyDown(i, e, isConfirm)}
            onFocus={(e) => e.target.select()}
            style={{
              width: "56px",
              height: "68px",
              fontSize: "28px",
              fontWeight: 700,
              textAlign: "center",
              backgroundColor: BLUE,
              color: WHITE,
              border: "none",
              borderRadius: "12px",
              outline: "none",
              fontFamily: FONT_FAMILY,
              caretColor: WHITE,
              transition: "all 0.2s ease",
            }}
            onFocusCapture={(e) => {
              e.currentTarget.style.transform = "scale(1.08)";
              e.currentTarget.style.boxShadow = `0 0 0 3px ${LIME}`;
            }}
            onBlurCapture={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", alignItems: "center", width: "100%" }}>
      <div>
        <label style={{ fontSize: "14px", color: "#666", display: "block", marginBottom: "10px", fontFamily: FONT_FAMILY, textAlign: "center", fontWeight: 600 }}>
          {isNew ? "Buat PIN 6 Digit" : "Masukkan PIN 6 Digit"}
        </label>
        {renderBoxes(value, false)}
      </div>

      {isNew && confirmValue !== undefined && onConfirmChange && (
        <div>
          <label style={{ fontSize: "14px", color: "#666", display: "block", marginBottom: "10px", fontFamily: FONT_FAMILY, textAlign: "center", fontWeight: 600 }}>
            Konfirmasi PIN
          </label>
          {renderBoxes(confirmValue, true)}
        </div>
      )}
    </div>
  );
};

// ===== MAIN SIGN IN PAGE =====
export default function SignInPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState("");
  const [showMain, setShowMain] = useState(false);
  const [navbarShifted, setNavbarShifted] = useState(false);
  const [sayHeyOpen, setSayHeyOpen] = useState(false);
  const [sayHeyUnreadCount, setSayHeyUnreadCount] = useState(0);
  const [locationText, setLocationText] = useState<string>("");
  const [showPinScreen, setShowPinScreen] = useState(false);
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [pinError, setPinError] = useState("");
  const [isNewPin, setIsNewPin] = useState(false);
  const [tempUser, setTempUser] = useState<any>(null);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const router = useRouter();

  useEffect(() => { setIsMounted(true); }, []);
  const handlePreloaderComplete = () => setShowMain(true);

  useEffect(() => {
    if (!showMain) return;
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [showMain]);

  // ===== AUTH STATE LISTENER =====
  useEffect(() => {
    if (!showMain || !auth) return;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const idToken = await currentUser.getIdToken();
          const result = await apiRequest<{ user: any }>("/auth/signin", {
            method: "POST", body: JSON.stringify({ idToken }),
          });
          if (result.success && result.data) {
            setTempUser(currentUser);
            if (result.data.user.hasPin) { setShowPinScreen(true); setIsNewPin(false); }
            else { setShowPinScreen(true); setIsNewPin(true); }
            setUser(null);
          }
        } catch (error) { console.error("Auth state error:", error); }
      } else {
        setUser(null); setShowPinScreen(false); setTempUser(null);
      }
    });
    return () => unsubscribe();
  }, [showMain]);

  // ===== HANDLE PIN SUBMIT =====
  const handlePinSubmit = async () => {
    if (!auth?.currentUser) { setPinError("Sesi tidak ditemukan. Silakan login ulang."); return; }
    const idToken = await auth.currentUser.getIdToken();

    if (isNewPin) {
      if (pin.length !== 6) { setPinError("PIN harus 6 digit"); return; }
      if (pin !== pinConfirm) { setPinError("PIN tidak cocok"); return; }
      setPinError("");
      const result = await apiRequest("/auth/save-pin", { method: "POST", body: JSON.stringify({ idToken, pin }) });
      if (!result.success) { setPinError(result.error || "Gagal menyimpan PIN"); return; }
      setUser(auth.currentUser); setShowPinScreen(false); router.push("/");
    } else {
      if (pin.length !== 6) { setPinError("PIN harus 6 digit"); return; }
      setPinError("");
      const result = await apiRequest("/auth/verify-pin", { method: "POST", body: JSON.stringify({ idToken, pin }) });
      if (!result.success) { setPinError(result.error || "PIN salah"); return; }
      setUser(auth.currentUser); setShowPinScreen(false); router.push("/");
    }
  };

  const handleGoogleLogin = async () => {
    if (!auth) return;
    if (!agreeTerms) { setError("Anda harus menyetujui Syarat & Ketentuan serta Kebijakan Privasi terlebih dahulu."); return; }
    setLoading(true); setError("");
    try { await signInWithPopup(auth, new GoogleAuthProvider()); }
    catch (err: any) { setError(err.message || "Login Google gagal"); }
    finally { setLoading(false); }
  };

  const handleGitHubLogin = async () => {
    if (!auth) return;
    if (!agreeTerms) { setError("Anda harus menyetujui Syarat & Ketentuan serta Kebijakan Privasi terlebih dahulu."); return; }
    setLoading(true); setError("");
    try { await signInWithPopup(auth, new GithubAuthProvider()); }
    catch (err: any) { setError(err.message || "Login GitHub gagal"); }
    finally { setLoading(false); }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    if (!agreeTerms) { setError("Anda harus menyetujui Syarat & Ketentuan serta Kebijakan Privasi terlebih dahulu."); return; }
    setLoading(true); setError("");
    try { await signInWithEmailAndPassword(auth, email, password); }
    catch (err: any) {
      const map: Record<string, string> = {
        "auth/invalid-email": "Email tidak valid",
        "auth/user-not-found": "Akun tidak ditemukan",
        "auth/wrong-password": "Password salah",
        "auth/invalid-credential": "Email atau password salah",
      };
      setError(map[err.code] || "Login gagal");
    } finally { setLoading(false); }
  };

  if (!isMounted || !showMain) return <Preloader onComplete={handlePreloaderComplete} />;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#ffffff", fontFamily: FONT_FAMILY, position: "relative", overflow: "hidden" }}>
      {/* BLUR OVERLAY */}
      <div style={{ position: "fixed", top: 0, left: 0, width: "200px", height: "120px", pointerEvents: "none", zIndex: 8500, backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", maskImage: "linear-gradient(to right, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 100%)", WebkitMaskImage: "linear-gradient(to right, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 100%)" }} />
      <div style={{ position: "fixed", top: 0, right: 0, width: "200px", height: "120px", pointerEvents: "none", zIndex: 8500, backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", maskImage: "linear-gradient(to left, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 100%)", WebkitMaskImage: "linear-gradient(to left, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 100%)" }} />

      {/* NAVBAR */}
      <LeftNavbar shifted={navbarShifted} />
      <RightNavbar
        user={user} auth={auth} db={null}
        onSayHeyToggle={() => setSayHeyOpen((prev) => !prev)}
        sayHeyOpen={sayHeyOpen} sayHeyUnreadCount={sayHeyUnreadCount}
        locationText={locationText}
      />

      {/* KONTEN */}
      <div style={{
        marginTop: "180px", padding: "0 40px 80px", width: "100%", maxWidth: "1400px",
        marginLeft: "auto", marginRight: "auto",
        display: "flex", flexDirection: isMobile ? "column" : "row",
        gap: isMobile ? "40px" : "80px", justifyContent: "center", minHeight: "calc(100vh - 260px)",
      }}>
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          style={{ flex: isMobile ? "1" : "0 0 55%", maxWidth: isMobile ? "100%" : "600px" }}
        >
          {!showPinScreen && !user ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "10px" }}>
                <h1 style={{
                  fontSize: isMobile ? "80px" : "200px", fontWeight: 700, color: BLUE,
                  letterSpacing: "-0.05em", lineHeight: 1, margin: 0, wordBreak: "break-word",
                  fontFamily: FONT_FAMILY,
                }}>
                  Sign In
                </h1>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: isMobile ? "60px" : "120px", height: isMobile ? "60px" : "120px", backgroundColor: BLUE, borderRadius: "20px", flexShrink: 0 }}>
                  <NorthEastArrow size={isMobile ? 40 : 80} color={WHITE} />
                </div>
              </div>

              <p style={{ fontSize: "18px", color: "#666", marginBottom: "32px", fontFamily: FONT_FAMILY }}>
                Welcome back! Sign in to your account
              </p>

              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ color: BLUE, fontSize: "15px", marginBottom: "16px", fontFamily: FONT_FAMILY }}>
                  {error}
                </motion.div>
              )}

              {/* TOMBOL SOSIAL - BIRU FULL, HOVER HIJAU */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "32px" }}>
                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: GREEN }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    gap: "12px", padding: "14px 20px", border: "none",
                    borderRadius: "12px", background: BLUE,
                    cursor: loading ? "not-allowed" : "pointer", width: "100%",
                    fontSize: "16px", color: WHITE, fontFamily: FONT_FAMILY, fontWeight: 600,
                    transition: "background-color 0.25s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24">
                      <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#ffffff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#ffffff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#ffffff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </div>
                  <NorthEastArrow size={28} color={WHITE} />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: GREEN }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGitHubLogin}
                  disabled={loading}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    gap: "12px", padding: "14px 20px", border: "none",
                    borderRadius: "12px", background: BLUE,
                    cursor: loading ? "not-allowed" : "pointer", width: "100%",
                    fontSize: "16px", color: WHITE, fontFamily: FONT_FAMILY, fontWeight: 600,
                    transition: "background-color 0.25s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24">
                      <path fill="#ffffff" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                    </svg>
                    <span>Continue with GitHub</span>
                  </div>
                  <NorthEastArrow size={28} color={WHITE} />
                </motion.button>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
                <div style={{ flex: 1, height: "1px", backgroundColor: "#e8e8e8" }} />
                <span style={{ color: "#999", fontSize: "14px", fontFamily: FONT_FAMILY }}>or</span>
                <div style={{ flex: 1, height: "1px", backgroundColor: "#e8e8e8" }} />
              </div>

              {/* FORM EMAIL - INPUT BIRU FULL TEKS PUTIH TANPA BORDER */}
              <form onSubmit={handleEmailLogin} style={{ width: "100%" }}>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "16px 20px",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "16px",
                    marginBottom: "16px",
                    outline: "none",
                    fontFamily: FONT_FAMILY,
                    backgroundColor: BLUE,
                    color: WHITE,
                  }}
                />

                <div style={{ position: "relative", marginBottom: "24px" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      padding: "16px 50px 16px 20px",
                      border: "none",
                      borderRadius: "12px",
                      fontSize: "16px",
                      outline: "none",
                      fontFamily: FONT_FAMILY,
                      backgroundColor: BLUE,
                      color: WHITE,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute", right: "14px", top: "50%",
                      transform: "translateY(-50%)", background: "none",
                      border: "none", cursor: "pointer", color: WHITE,
                    }}
                  >
                    <EyeIcon open={showPassword} color={WHITE} />
                  </button>
                </div>

                {/* TOMBOL SIGN IN DENGAN HOVER */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={!loading ? { scale: 1.02, backgroundColor: BLACK } : {}}
                  whileTap={!loading ? { scale: 0.98 } : {}}
                  style={{
                    width: "100%",
                    padding: "16px 20px",
                    backgroundColor: loading ? "#ccc" : BLUE,
                    color: "#fff",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "18px",
                    fontWeight: 600,
                    cursor: loading ? "not-allowed" : "pointer",
                    fontFamily: FONT_FAMILY,
                    transition: "background-color 0.25s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span>{loading ? "Signing In..." : "Sign In"}</span>
                  {!loading && <NorthEastArrow size={32} color={WHITE} />}
                </motion.button>
              </form>

              {/* PERNYATAAN PERSETUJUAN LAYANAN DENGAN UNDERLINE */}
              <div style={{ marginTop: "20px", fontFamily: FONT_FAMILY, fontSize: "14px", color: "#666", lineHeight: 1.6, textAlign: "center" }}>
                By signing in, you agree to our{" "}
                <Link href="/terms-of-services" style={{ color: BLUE, textDecoration: "underline", fontWeight: 600 }}>
                  Terms &amp; Conditions
                </Link>
                {" "}and{" "}
                <Link href="/privacy-policy" style={{ color: BLUE, textDecoration: "underline", fontWeight: 600 }}>
                  Privacy Policy
                </Link>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px", gap: "12px", flexWrap: "wrap" }}>
                <button
                  onClick={() => router.push("/forgot-password")}
                  style={{
                    background: "none", border: "none", color: BLUE, fontSize: "15px",
                    cursor: "pointer", textDecoration: "underline", fontFamily: FONT_FAMILY,
                    display: "inline-flex", alignItems: "center", gap: "6px",
                  }}
                >
                  <NorthWestArrow size={20} color={BLUE} />
                  Forgot password?
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#666", fontSize: "15px", fontFamily: FONT_FAMILY }}>Don't have an account?</span>
                  <button
                    onClick={() => router.push("/signup")}
                    style={{
                      background: "none", border: "none", color: BLUE, fontSize: "15px",
                      fontWeight: 500, cursor: "pointer", textDecoration: "underline",
                      fontFamily: FONT_FAMILY, display: "inline-flex", alignItems: "center", gap: "6px",
                    }}
                  >
                    Sign up
                    <NorthEastArrow size={20} color={BLUE} />
                  </button>
                </div>
              </div>

              <div style={{ textAlign: "center", marginTop: "30px", paddingTop: "20px", borderTop: "1px solid #f0f0f0" }}>
                <Link href="/pusat-bantuan" style={{ color: BLUE, fontSize: "15px", display: "inline-flex", alignItems: "center", gap: "6px", textDecoration: "none", fontFamily: FONT_FAMILY }}>
                  <HelpDeskIcon size={18} color={BLUE} />
                  <span>Pusat Bantuan</span>
                  <NorthEastArrow size={20} color={BLUE} />
                </Link>
              </div>
            </>
          ) : (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
                <h2 style={{ fontSize: isMobile ? "32px" : "48px", fontWeight: 700, color: BLUE, margin: 0, fontFamily: FONT_FAMILY, letterSpacing: "-0.02em" }}>
                  {isNewPin ? "Buat PIN" : "Masukkan PIN"}
                </h2>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "60px", height: "60px", backgroundColor: BLUE, borderRadius: "16px" }}>
                  <NorthEastArrow size={40} color={WHITE} />
                </div>
              </div>
              <p style={{ fontSize: "16px", color: "#666", marginBottom: "32px", fontFamily: FONT_FAMILY, textAlign: "center" }}>
                {isNewPin ? "Buat PIN 6 digit untuk keamanan tambahan akun Anda" : "Masukkan PIN 6 digit akun Anda"}
              </p>

              <PinInput
                value={pin}
                onChange={setPin}
                isNew={isNewPin}
                confirmValue={isNewPin ? pinConfirm : undefined}
                onConfirmChange={isNewPin ? setPinConfirm : undefined}
                onComplete={() => { if (!isNewPin && pin.length === 6) handlePinSubmit(); }}
              />

              {pinError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ color: BLUE, fontSize: "16px", marginTop: "20px", fontFamily: FONT_FAMILY, fontWeight: 600, textAlign: "center" }}
                >
                  {pinError}
                </motion.div>
              )}

              <div style={{ display: "flex", gap: "16px", marginTop: "32px" }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setPin(""); setPinConfirm(""); setPinError(""); }}
                  style={{
                    padding: "12px 28px", backgroundColor: "transparent", color: "#666",
                    border: "2px solid #ddd", borderRadius: "10px", fontSize: "16px",
                    cursor: "pointer", fontFamily: FONT_FAMILY, fontWeight: 600,
                  }}
                >
                  Reset
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: BLACK }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePinSubmit}
                  style={{
                    padding: "12px 28px", backgroundColor: BLUE, color: "#fff",
                    border: "none", borderRadius: "10px", fontSize: "16px",
                    cursor: "pointer", fontFamily: FONT_FAMILY, fontWeight: 700,
                    display: "flex", alignItems: "center", gap: "8px",
                    transition: "background-color 0.25s ease",
                  }}
                >
                  {isNewPin ? "Simpan PIN" : "Verifikasi"}
                  <NorthEastArrow size={22} color={WHITE} />
                </motion.button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* SAY HEY SECTION */}
      {sayHeyOpen && (
        <div style={{ width: "100%", padding: "0 40px", maxWidth: "1400px", margin: "0 auto 40px auto", position: "relative", zIndex: 2 }}>
          <SayHeySection user={user} onClose={() => setSayHeyOpen(false)} />
        </div>
      )}

      {/* FOOTER */}
      <div style={{ width: "100%", padding: "60px 40px 40px 40px", backgroundColor: WHITE, borderTop: "1px solid rgba(0,0,0,0.05)", marginTop: "20px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: "40px", top: "50%", transform: "translateY(-50%)", width: "200px", height: "auto", opacity: 0.8 }}>
          <img src="/images/p0l.jpg" alt="" style={{ width: "100%", height: "auto", display: "block", objectFit: "cover" }} />
        </div>
        <div style={{ position: "absolute", right: "40px", top: "50%", transform: "translateY(-50%)", width: "200px", height: "auto", opacity: 0.8 }}>
          <img src="/images/xxz.jpg" alt="" style={{ width: "100%", height: "auto", display: "block", objectFit: "cover" }} />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", maxWidth: "1400px", margin: "0 auto", gap: "40px", flexWrap: "wrap", position: "relative", zIndex: 1 }}>
          {footerLinks.map((section, idx) => (
            <div key={idx} style={{ flex: "1", minWidth: "200px" }}>
              <h3 style={{ fontFamily: FONT_FAMILY, fontSize: "28px", fontWeight: 600, color: BLACK, margin: 0, marginBottom: "16px", letterSpacing: "-0.01em" }}>
                {section.title}
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {section.links.map((link, linkIdx) => {
                  let linkHref = "#";
                  if (link === "Contact Us") linkHref = "/contact";
                  else if (link === "Live Chat") linkHref = "/live-chat";
                  else if (link === "Live Chat Agent") linkHref = "/live-chat-agent";
                  else if (link === "Help Center") linkHref = "/pusat-bantuan";
                  else if (link === "About Us") linkHref = "/profile";
                  else if (link === "Privacy Policy") linkHref = "/privacy-policy";
                  else if (link === "Terms & Conditions") linkHref = "/terms-of-services";
                  else if (link === "Instagram") linkHref = "https://instagram.com/menuru";

                  return (
                    <Link key={linkIdx} href={linkHref} style={{ textDecoration: "none" }}>
                      <span style={{ fontFamily: FONT_FAMILY, fontSize: "20px", fontWeight: 400, color: BLUE, letterSpacing: "-0.01em", cursor: "pointer" }}>
                        {link}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div style={{ maxWidth: "1400px", margin: "40px auto 0 auto", paddingTop: "20px", borderTop: "1px solid rgba(0,0,0,0.05)", position: "relative", zIndex: 1 }}>
          <p style={{ fontFamily: FONT_FAMILY, fontSize: "14px", fontWeight: 400, color: "#666", margin: 0, textAlign: "center", letterSpacing: "0.01em" }}>
            Terms and conditions apply. By using this website, you agree to our Terms of Use and Privacy Policy.
          </p>
        </div>
      </div>

      <FooterMenuruTitle />

      <style jsx global>{`
        html {
          overflow: auto !important;
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
          height: 100% !important;
        }
        html::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
        body {
          overflow: auto !important;
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
          margin: 0; padding: 0;
          background-color: #ffffff !important;
          min-height: 100% !important;
          height: auto !important;
        }
        body::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
        * { background-color: transparent; }
        input::placeholder { color: rgba(255,255,255,0.75) !important; }
      `}</style>
    </div>
  );
}
