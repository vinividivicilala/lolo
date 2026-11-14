'use client';

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
import { getFirestore, doc, getDoc } from "firebase/firestore";

// ===== FIRESTORE =====
let _db: any = null;
function getDb() {
  try {
    if (!_db && auth) _db = getFirestore(auth.app);
  } catch {}
  return _db;
}

// ===== KONSTANTA =====
const FONT_FAMILY = "'Plus Jakarta Sans'";
const BLUE = "#0D3CFC";
const WHITE = "#FFFFFF";
const BLACK = "#000000";
const RED = "#DC2626";
const GREEN = "#4ADE80";

// ===== ICON =====
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

const HelpIcon = ({ size = 18, color = BLUE }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <path d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="17" r="1" fill={color} />
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

const ShieldLockIcon = ({ size = 24, color = "#ffffff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2L4 5V11C4 16 8 20 12 22C16 20 20 16 20 11V5L12 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="9" y="11" width="6" height="5" rx="1" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 11V9C10 8 10.5 7 12 7C13.5 7 14 8 14 9V11" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const KeyIcon = ({ size = 24, color = "#ffffff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="8" cy="15" r="4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10.85 12.15L19 4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18 5L20 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15 8L17 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MicrosoftIcon = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ display: "inline-block" }}>
    <path d="M9 3.5C9 2.67157 9.67157 2 10.5 2H13.5C14.3284 2 15 2.67157 15 3.5V5H9V3.5Z" fill="#0078D4" />
    <path d="M4 5H20C20.5523 5 21 5.44772 21 6V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V6C3 5.44772 3.44772 5 4 5Z" fill="#0078D4" />
    <rect x="6" y="8" width="5" height="5" fill="#F25022" />
    <rect x="13" y="8" width="5" height="5" fill="#7FBA00" />
    <rect x="6" y="14" width="5" height="5" fill="#00A4EF" />
    <rect x="13" y="14" width="5" height="5" fill="#FFB900" />
  </svg>
);

const WindowsIcon = ({ size = 20, color = "#ffffff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="2" y="2" width="9" height="9" fill={color} />
    <rect x="13" y="2" width="9" height="9" fill={color} />
    <rect x="2" y="13" width="9" height="9" fill={color} />
    <rect x="13" y="13" width="9" height="9" fill={color} />
  </svg>
);

// ===== NAVBAR BUTTON =====
const NavbarButton = ({
  label, panelTitle, panelDescription, panelImage, panelRightTitle, panelRightDescription, iconType,
  bigPanelWidth = 850, bigPanelHeight = 260, buttonColor = "#0D3CFC", buttonHoverColor = "#000000",
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

  useEffect(() => () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
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
      gsap.fromTo(panelRef.current, { opacity: 0, y: -20, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "power3.out" });
    } else {
      gsap.to(panelRef.current, { opacity: 0, y: -20, scale: 0.96, duration: 0.25, ease: "power2.in" });
    }
  }, [open]);

  const strokeColor = open ? labelTextHoverColor : labelTextColor;

  return (
    <div style={{ position: "relative" }} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 16px", backgroundColor: open ? buttonHoverColor : buttonColor, backdropFilter: "blur(20px)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.18)", boxShadow: open ? "0 8px 24px rgba(0,0,0,0.35)" : `0 8px 24px ${buttonColor}55`, transition: "background-color 0.25s ease", cursor: "pointer", position: "relative", zIndex: 2 }}>
        <span style={{ color: open ? labelTextHoverColor : labelTextColor, fontSize: "14px", fontWeight: 600, letterSpacing: "0.02em", fontFamily: FONT_FAMILY, whiteSpace: "nowrap" }}>{label}</span>
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
        <div ref={panelRef} onMouseEnter={handleEnter} onMouseLeave={handleLeave} style={{ position: "absolute", top: "calc(100% + 10px)", left: "0px", width: `${bigPanelWidth}px`, minHeight: `${bigPanelHeight}px`, backgroundColor: panelColor, backdropFilter: "blur(24px)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.2)", boxShadow: `0 8px 32px ${panelColor}55`, zIndex: 1, fontFamily: FONT_FAMILY, color: titleTextColor, padding: "22px 26px", display: "flex", gap: "20px", alignItems: "flex-start" }}>
          <div style={{ flex: "1 1 0", minWidth: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
            {isResources ? (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <DocsIcon size={22} color={titleTextColor} />
                    <span style={{ fontSize: "16px", fontWeight: 700, fontFamily: FONT_FAMILY, color: titleTextColor }}>Docs</span>
                  </div>
                  <p style={{ fontSize: "12px", lineHeight: 1.5, color: descriptionTextColor, margin: 0, fontFamily: FONT_FAMILY, maxWidth: "340px" }}>Dokumentasi lengkap panduan produk, API, dan tutorial Menuru.</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <BrandIcon size={22} color={titleTextColor} />
                    <span style={{ fontSize: "16px", fontWeight: 700, fontFamily: FONT_FAMILY, color: titleTextColor }}>Brand</span>
                  </div>
                  <p style={{ fontSize: "12px", lineHeight: 1.5, color: descriptionTextColor, margin: 0, fontFamily: FONT_FAMILY, maxWidth: "340px" }}>Aset visual, logo, dan panduan identitas brand Menuru.</p>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {iconComponent ? iconComponent : iconType === "trust" ? <TrustIcon size={26} color={titleTextColor} /> : iconType === "career" ? <CareerIcon size={26} color={titleTextColor} /> : <ResourcesIcon size={26} color={titleTextColor} />}
                  <span style={{ fontSize: "20px", fontWeight: 700, fontFamily: FONT_FAMILY, color: titleTextColor }}>{panelTitle}</span>
                </div>
                <p style={{ fontSize: "13px", lineHeight: 1.5, color: descriptionTextColor, margin: 0, fontFamily: FONT_FAMILY, maxWidth: "340px" }}>{panelDescription}</p>
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
  <div style={{ position: "fixed", top: "64px", left: shifted ? "340px" : "60px", zIndex: 9000, display: "flex", alignItems: "center", gap: "8px", fontFamily: FONT_FAMILY, transition: "left 0.6s cubic-bezier(0.65, 0, 0.35, 1)", willChange: "left" }}>
    <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "12px", marginRight: "16px" }}>
      <img src="/images/gfssa.jpg" alt="Menuru" style={{ height: "60px", width: "auto", maxWidth: "none", objectFit: "contain", display: "block", flexShrink: 0, mixBlendMode: "multiply" }} />
      <span style={{ color: BLUE, fontSize: "60px", fontWeight: 700, letterSpacing: "-0.03em", fontFamily: FONT_FAMILY, lineHeight: 1, whiteSpace: "nowrap" }}>Menuru</span>
    </Link>
    <NavbarButton label="Teams" panelTitle="Trust" panelDescription="Keamanan dan privasi Anda adalah prioritas kami dengan enkripsi end-to-end." panelImage="/images/p0l.jpg" panelRightTitle="Why Trust Us" panelRightDescription="Sistem kami dipantau 24/7 untuk melindungi data Anda." iconType="trust" bigPanelWidth={850} bigPanelHeight={260} />
    <NavbarButton label="Individual" panelTitle="Careers" panelDescription="Bergabunglah dengan tim kami dan bangun karier yang bermakna di lingkungan yang suportif." panelImage="/images/xxz.jpg" panelRightTitle="Life at Menuru" panelRightDescription="Budaya kerja kolaboratif, fleksibel, dan penuh peluang untuk tumbuh bersama." iconType="career" bigPanelWidth={850} bigPanelHeight={260} />
    <NavbarButton label="Resources" panelTitle="Docs & Brand" panelDescription="Akses dokumentasi lengkap dan aset brand Menuru dalam satu tempat." panelImage="/images/p0l.jpg" panelRightTitle="Docs & Brand" panelRightDescription="Panduan, aset visual, dan referensi resmi brand Menuru." iconType="resources" iconComponent={<StriperIcon size={22} color="#ffffff" />} bigPanelWidth={850} bigPanelHeight={340} buttonColor="#0D3CFC" buttonHoverColor="#0D3CFC" panelColor="#000000" iconButtonColor="#000000" iconButtonHoverColor="#000000" panelBoxColor="rgba(255,255,255,0.12)" panelBoxBorder="rgba(255,255,255,0.25)" labelTextColor="#ffffff" labelTextHoverColor="#ffffff" titleTextColor="#ffffff" descriptionTextColor="rgba(255,255,255,0.92)" isResources={true} />
  </div>
);

// ===== RIGHT NAVBAR =====
const RightNavbar = ({ user, auth, onSayHeyToggle, sayHeyOpen, sayHeyUnreadCount, locationText }: any) => {
  const rollingRef = useRef<HTMLDivElement>(null);
  const [rollingIndex, setRollingIndex] = useState(0);
  const displayName = user?.displayName || user?.email?.split("@")[0] || "User";
  const photoURL = user?.photoURL || "";

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => setRollingIndex((p) => (p + 1) % 3), 3000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (!user || !rollingRef.current) return;
    const el = rollingRef.current;
    gsap.killTweensOf(el);
    gsap.fromTo(el, { yPercent: 100, opacity: 0, rotateX: -90, transformOrigin: "50% 100%" }, { yPercent: 0, opacity: 1, rotateX: 0, duration: 0.6, ease: "back.out(1.7)" });
    return () => gsap.killTweensOf(el);
  }, [rollingIndex, user]);

  const handleLogout = async () => {
    if (!auth) return;
    try {
      const { signOut } = await import("firebase/auth");
      await signOut(auth);
    } catch (e) { console.error(e); }
  };

  const SayHeyButton = () => (
    <button onClick={onSayHeyToggle} style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: "10px", padding: "10px 18px", backgroundColor: sayHeyOpen ? BLACK : "#E3FB96", borderRadius: "10px", border: `1px solid ${sayHeyOpen ? BLACK : "#E3FB96"}`, boxShadow: sayHeyOpen ? "0 8px 24px rgba(0,0,0,0.35)" : "0 8px 24px rgba(227,251,150,0.45)", cursor: "pointer", transition: "all 0.2s ease" }}>
      <SayHeyIcon size={18} color={sayHeyOpen ? WHITE : BLACK} />
      <span style={{ color: sayHeyOpen ? WHITE : BLACK, fontSize: "14px", fontWeight: 700, letterSpacing: "0.02em", fontFamily: FONT_FAMILY, whiteSpace: "nowrap" }}>Say Hey</span>
      <NorthEastArrow size={16} color={sayHeyOpen ? WHITE : BLACK} />
      {sayHeyUnreadCount > 0 && !sayHeyOpen && (
        <span style={{ position: "absolute", top: "-6px", right: "-6px", minWidth: "20px", height: "20px", padding: "0 6px", borderRadius: "10px", backgroundColor: BLUE, color: WHITE, fontSize: "11px", fontWeight: 800, fontFamily: FONT_FAMILY, display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${WHITE}`, boxShadow: "0 2px 8px rgba(13,60,252,0.5)" }}>{sayHeyUnreadCount > 99 ? "99+" : sayHeyUnreadCount}</span>
      )}
    </button>
  );

  if (!user) {
    return (
      <div style={{ position: "fixed", top: "64px", right: "24px", zIndex: 9000, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px", fontFamily: FONT_FAMILY }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><SayHeyButton /></div>
        {locationText && <div style={{ fontSize: "20px", fontWeight: 700, color: BLUE, letterSpacing: "-0.02em", fontFamily: FONT_FAMILY, whiteSpace: "nowrap", textAlign: "right" }}>{locationText}</div>}
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", top: "64px", right: "24px", zIndex: 9000, fontFamily: FONT_FAMILY, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <SayHeyButton />
        <div style={{ position: "relative", height: "90px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "flex-end", minWidth: "260px" }}>
          <div ref={rollingRef} style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "12px", width: "100%" }}>
            {rollingIndex === 0 && (
              <>
                <span style={{ color: BLUE, fontSize: "70px", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1, whiteSpace: "nowrap", fontFamily: FONT_FAMILY }}>{displayName}</span>
                <div style={{ width: "70px", height: "70px", borderRadius: "50%", overflow: "hidden", backgroundColor: BLUE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {photoURL ? <img src={photoURL} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} referrerPolicy="no-referrer" /> : <span style={{ fontSize: "30px", fontWeight: 800, color: WHITE }}>{displayName.charAt(0).toUpperCase()}</span>}
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
      {locationText && <div style={{ fontSize: "20px", fontWeight: 700, color: BLUE, letterSpacing: "-0.02em", fontFamily: FONT_FAMILY, whiteSpace: "nowrap", textAlign: "right" }}>{locationText}</div>}
    </div>
  );
};

// ===== SAY HEY =====
const SayHeySection = ({ user, onClose }: { user: any; onClose: () => void }) => {
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<{ id: string; sender: string; text: string; time: string }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!messageText.trim()) return;
    const timeStr = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    setMessages((p) => [...p, { id: Date.now().toString(), sender: user?.displayName || user?.email || "You", text: messageText.trim(), time: timeStr }]);
    setMessageText("");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} transition={{ duration: 0.5 }} style={{ width: "100%", backgroundColor: BLUE, borderRadius: "20px", padding: "40px", fontFamily: FONT_FAMILY, color: WHITE, marginBottom: "40px", minHeight: "400px", position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <SayHeyIcon size={40} color={WHITE} />
          <div>
            <h3 style={{ fontSize: "48px", fontWeight: 700, color: WHITE, margin: 0, letterSpacing: "-0.02em", fontFamily: FONT_FAMILY, lineHeight: 1.1 }}>Say Hey</h3>
            <p style={{ fontSize: "16px", fontWeight: 500, color: WHITE, margin: 0, lineHeight: 1.5, opacity: 0.95, fontFamily: FONT_FAMILY }}>Real-time chat with our team. Your chat is private and encrypted.</p>
          </div>
        </div>
        <button onClick={onClose} style={{ padding: "10px 20px", backgroundColor: WHITE, color: BLUE, border: `2px solid ${WHITE}`, borderRadius: "10px", fontSize: "14px", fontWeight: 800, cursor: "pointer", fontFamily: FONT_FAMILY, letterSpacing: "0.5px", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "8px" }}>
          Close
          <NorthEastArrow size={20} color={BLUE} />
        </button>
      </div>
      {!user ? (
        <div style={{ backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "16px", padding: "40px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <SayHeyIcon size={64} color={WHITE} />
          <p style={{ fontSize: "18px", fontWeight: 500, color: WHITE, margin: 0, maxWidth: "600px", lineHeight: 1.5, fontFamily: FONT_FAMILY }}>Please sign in to your account to start a real-time conversation.</p>
          <Link href="/signin" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "10px", padding: "14px 28px", backgroundColor: WHITE, color: BLUE, borderRadius: "12px", fontSize: "16px", fontWeight: 800, fontFamily: FONT_FAMILY }}>
            Sign In to Continue
            <NorthEastArrow size={20} color={BLUE} />
          </Link>
        </div>
      ) : (
        <div style={{ backgroundColor: WHITE, borderRadius: "16px", overflow: "hidden", display: "flex", flexDirection: "column", height: "400px" }}>
          <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "12px", backgroundColor: "#fafafa" }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: "center", color: "#999", fontSize: "14px", padding: "30px 0", fontFamily: FONT_FAMILY }}>No messages yet. Say hey! 👋</div>
            ) : messages.map((msg) => {
              const isMine = msg.sender === (user?.displayName || user?.email || "You");
              return (
                <div key={msg.id} style={{ alignSelf: isMine ? "flex-end" : "flex-start", maxWidth: "75%" }}>
                  <div style={{ padding: "10px 14px", borderRadius: "12px", backgroundColor: isMine ? BLUE : "#ffffff", color: isMine ? WHITE : BLACK, fontSize: "14px", fontFamily: FONT_FAMILY, wordBreak: "break-word", border: isMine ? "none" : "1px solid rgba(0,0,0,0.06)" }}>
                    {!isMine && <div style={{ fontSize: "11px", fontWeight: 700, color: BLUE, marginBottom: "4px" }}>{msg.sender}</div>}
                    <div>{msg.text}</div>
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "4px" }}><span style={{ fontSize: "10px", color: isMine ? "rgba(255,255,255,0.85)" : "#999" }}>{msg.time}</span></div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
          <div style={{ padding: "14px 20px", borderTop: "1px solid rgba(0,0,0,0.06)", display: "flex", gap: "10px", backgroundColor: WHITE, flexShrink: 0 }}>
            <input type="text" value={messageText} onChange={(e) => setMessageText(e.target.value)} onKeyPress={(e) => { if (e.key === "Enter" && !e.shiftKey && messageText.trim()) { e.preventDefault(); handleSend(); } }} placeholder="Type your message..." style={{ flex: 1, padding: "12px 16px", border: "none", borderRadius: "10px", fontSize: "14px", outline: "none", fontFamily: FONT_FAMILY, backgroundColor: BLUE, color: WHITE }} />
            <button onClick={handleSend} disabled={!messageText.trim()} style={{ padding: "12px 24px", backgroundColor: messageText.trim() ? BLUE : "#ccc", color: WHITE, border: "none", borderRadius: "10px", cursor: messageText.trim() ? "pointer" : "not-allowed", fontFamily: FONT_FAMILY, fontSize: "13px", fontWeight: 800, letterSpacing: "0.5px", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "8px" }}>
              Send
              {messageText.trim() && <NorthEastArrow size={18} color={WHITE} />}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// ===== TOTP HELPERS =====
const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32Decode(input: string): Uint8Array {
  const c = input.replace(/=+$/g, "").toUpperCase();
  const b: number[] = [];
  let bits = 0, value = 0;
  for (let i = 0; i < c.length; i++) {
    const idx = BASE32.indexOf(c[i]);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      b.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return new Uint8Array(b);
}

async function hotp(secret: string, counter: number, digits = 6): Promise<string> {
  const key = base32Decode(secret);
  const cb = new Uint8Array(8);
  let temp = counter;
  for (let i = 7; i >= 0; i--) {
    cb[i] = temp & 0xff;
    temp = Math.floor(temp / 256);
  }
  if (typeof window === "undefined" || !window.crypto || !window.crypto.subtle) {
    let h = 0;
    for (let i = 0; i < key.length; i++) h = (h * 31 + key[i]) >>> 0;
    for (let i = 0; i < 8; i++) h = (h * 31 + cb[i]) >>> 0;
    return String(h % Math.pow(10, digits)).padStart(digits, "0");
  }
  const ck = await window.crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
  const sig = await window.crypto.subtle.sign("HMAC", ck, cb);
  const h = new Uint8Array(sig);
  const off = h[h.length - 1] & 0x0f;
  const code = ((h[off] & 0x7f) << 24) | ((h[off + 1] & 0xff) << 16) | ((h[off + 2] & 0xff) << 8) | (h[off + 3] & 0xff);
  return String(code % Math.pow(10, digits)).padStart(digits, "0");
}

async function totp(secret: string): Promise<string> {
  return hotp(secret, Math.floor(Math.floor(Date.now() / 1000) / 30), 6);
}

async function verifyTotp(secret: string, token: string, w = 1): Promise<boolean> {
  const c = token.replace(/\s+/g, "");
  if (!/^\d{6}$/.test(c)) return false;
  const cnt = Math.floor(Math.floor(Date.now() / 1000) / 30);
  for (let i = -w; i <= w; i++) if ((await hotp(secret, cnt + i, 6)) === c) return true;
  return false;
}

// ===== PASSKEY HELPERS =====
function bufToB64Url(buf: ArrayBuffer): string {
  const b = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < b.byteLength; i++) s += String.fromCharCode(b[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function b64UrlToBuf(b64url: string): ArrayBuffer {
  const b = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const p = b.length % 4 === 0 ? "" : "=".repeat(4 - (b.length % 4));
  const bin = atob(b + p);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

function randomChallenge(len = 32): Uint8Array {
  const c = new Uint8Array(len);
  if (typeof window !== "undefined" && window.crypto) window.crypto.getRandomValues(c);
  else for (let i = 0; i < len; i++) c[i] = Math.floor(Math.random() * 256);
  return c;
}

function supportsWebAuthn(): boolean {
  if (typeof window === "undefined") return false;
  return !!(window.PublicKeyCredential && navigator.credentials);
}

// ===== PIN INPUT (BG BIRU, TEKS PUTIH, NO GREEN, NO SKEW) =====
const PinInput = ({
  value, onChange, onComplete, isNew, confirmValue, onConfirmChange,
}: {
  value: string;
  onChange: (v: string) => void;
  onComplete?: () => void;
  isNew?: boolean;
  confirmValue?: string;
  onConfirmChange?: (v: string) => void;
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const confirmRefs = useRef<(HTMLInputElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const boxes = containerRef.current.querySelectorAll(".pin-box");
    if (!boxes.length) return;
    gsap.fromTo(boxes, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, ease: "power3.out" });
  }, []);

  const handleChange = (index: number, val: string, isConfirm = false) => {
    const numericVal = val.replace(/\D/g, "");
    if (!numericVal) return;
    const current = isConfirm ? confirmValue || "" : value;
    const newVal = current.split("");
    newVal[index] = numericVal[numericVal.length - 1];
    const result = newVal.join("").slice(0, 6);
    if (isConfirm) {
      onConfirmChange?.(result);
    } else {
      onChange(result);
      if (result.length === 6 && onComplete) setTimeout(() => onComplete(), 200);
    }
    if (index < 5 && numericVal) {
      const refs = isConfirm ? confirmRefs : inputRefs;
      setTimeout(() => refs.current[index + 1]?.focus(), 10);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>, isConfirm = false) => {
    const refs = isConfirm ? confirmRefs : inputRefs;
    if (e.key === "Backspace") {
      e.preventDefault();
      const current = isConfirm ? confirmValue || "" : value;
      const newVal = current.split("");
      if (newVal[index]) {
        newVal[index] = "";
        const r = newVal.join("");
        if (isConfirm) onConfirmChange?.(r);
        else onChange(r);
      } else if (index > 0) {
        refs.current[index - 1]?.focus();
        const prev = current.split("");
        prev[index - 1] = "";
        const r = prev.join("");
        if (isConfirm) onConfirmChange?.(r);
        else onChange(r);
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
      <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.input
            key={i}
            ref={(el: any) => { refs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={val[i] || ""}
            onChange={(e) => handleChange(i, e.target.value, isConfirm)}
            onKeyDown={(e) => handleKeyDown(i, e, isConfirm)}
            onFocus={(e) => e.target.select()}
            className="pin-box"
            whileFocus={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 400, damping: 24 }}
            style={{
              width: "84px",
              height: "108px",
              fontSize: "54px",
              fontWeight: 400,
              textAlign: "center",
              backgroundColor: BLUE,
              color: WHITE,
              border: "none",
              borderRadius: "14px",
              outline: "none",
              fontFamily: FONT_FAMILY,
              caretColor: WHITE,
              padding: 0,
              boxShadow: "0 6px 20px rgba(13,60,252,0.25)",
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div ref={containerRef} style={{ display: "flex", flexDirection: "column", gap: "28px", alignItems: "center", width: "100%" }}>
      <div style={{ width: "100%", textAlign: "center" }}>
        <div style={{ display: "inline-block", color: BLUE, fontSize: "20px", fontWeight: 400, fontFamily: FONT_FAMILY, letterSpacing: "0.02em", marginBottom: "22px" }}>
          {isNew ? "Buat PIN 6 Digit" : "Masukkan PIN 6 Digit"}
        </div>
        <div>{renderBoxes(value, false)}</div>
      </div>
      {isNew && confirmValue !== undefined && onConfirmChange && (
        <div style={{ width: "100%", textAlign: "center" }}>
          <div style={{ display: "inline-block", color: BLUE, fontSize: "20px", fontWeight: 400, fontFamily: FONT_FAMILY, letterSpacing: "0.02em", marginBottom: "22px" }}>
            Konfirmasi PIN
          </div>
          <div>{renderBoxes(confirmValue, true)}</div>
        </div>
      )}
    </div>
  );
};

// ===== TERMS =====
const TermsAgreementBox = ({ agreed, onToggle }: { agreed: boolean; onToggle: () => void }) => {
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (boxRef.current) {
      gsap.fromTo(boxRef.current, { opacity: 0, y: 30, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out", delay: 0.3 });
    }
  }, []);

  return (
    <div ref={boxRef} style={{ width: "100%", backgroundColor: BLUE, borderRadius: "16px", padding: "32px 36px", marginBottom: "24px", fontFamily: FONT_FAMILY, color: WHITE }}>
      <h3 style={{ fontSize: "24px", fontWeight: 700, color: WHITE, margin: "0 0 20px 0", letterSpacing: "-0.01em", fontFamily: FONT_FAMILY }}>Persetujuan Layanan</h3>
      <div style={{ fontSize: "15px", lineHeight: 1.8, color: WHITE, fontFamily: FONT_FAMILY, marginBottom: "20px" }}>
        <p style={{ margin: "0 0 14px 0", textIndent: "2em" }}>Dengan melakukan sign in ke akun Menuru, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh Syarat &amp; Ketentuan yang berlaku. Persetujuan ini mencakup penggunaan layanan secara wajar, menjaga kerahasiaan akun, serta tidak menyalahgunakan fitur yang tersedia untuk aktivitas yang melanggar hukum.</p>
        <div style={{ marginBottom: "14px" }}>
          <div style={{ display: "flex", gap: "12px", marginBottom: "8px" }}>
            <span style={{ fontWeight: 700, flexShrink: 0, minWidth: "40px" }}>I.</span>
            <span><strong>Penggunaan Layanan.</strong> Anda setuju untuk menggunakan layanan Menuru hanya untuk tujuan yang sah dan sesuai dengan ketentuan yang berlaku. Segala bentuk penyalahgunaan akan dikenakan sanksi sesuai kebijakan yang berlaku.</span>
          </div>
        </div>
        <div style={{ marginBottom: "14px" }}>
          <div style={{ display: "flex", gap: "12px", marginBottom: "8px" }}>
            <span style={{ fontWeight: 700, flexShrink: 0, minWidth: "40px" }}>II.</span>
            <span><strong>Privasi &amp; Keamanan Data.</strong> Menuru berkomitmen melindungi data pribadi Anda sesuai dengan Kebijakan Privasi yang berlaku. Kami menggunakan enkripsi end-to-end untuk menjaga kerahasiaan percakapan dan tidak akan membagikan data Anda kepada pihak ketiga tanpa izin.</span>
          </div>
        </div>
        <div style={{ marginBottom: "14px" }}>
          <div style={{ display: "flex", gap: "12px", marginBottom: "8px" }}>
            <span style={{ fontWeight: 700, flexShrink: 0, minWidth: "40px" }}>III.</span>
            <span><strong>Tanggung Jawab Pengguna.</strong> Anda bertanggung jawab penuh atas kerahasiaan akun dan PIN Anda. Segala aktivitas yang terjadi melalui akun Anda menjadi tanggung jawab Anda sepenuhnya.</span>
          </div>
        </div>
        <p style={{ margin: "0", textIndent: "2em" }}>Apabila Anda tidak menyetujui ketentuan ini, mohon untuk tidak melanjutkan proses sign in. Dengan mencentang kotak di bawah, Anda secara sadar dan sukarela menyetujui seluruh ketentuan yang tercantum pada <Link href="/terms-of-services" style={{ color: WHITE, textDecoration: "underline", fontWeight: 600 }}>Syarat &amp; Ketentuan</Link> dan <Link href="/privacy-policy" style={{ color: WHITE, textDecoration: "underline", fontWeight: 600 }}>Kebijakan Privasi</Link>.</p>
      </div>
      <label style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer", fontSize: "15px", fontWeight: 600, color: WHITE, fontFamily: FONT_FAMILY, lineHeight: 1.5 }}>
        <input type="checkbox" checked={agreed} onChange={onToggle} style={{ width: "22px", height: "22px", marginTop: "2px", cursor: "pointer", accentColor: WHITE, flexShrink: 0 }} />
        <span>Saya telah membaca dan menyetujui Syarat &amp; Ketentuan serta Kebijakan Privasi Menuru.</span>
      </label>
    </div>
  );
};

// ===== TOP BANNER (biru, verified panel GSAP, SAMA PERSIS HALAMAN UTAMA) =====
const TopBanner = () => {
  const [showPanel, setShowPanel] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const fullPageRef = useRef<HTMLDivElement>(null);
  const closeIconRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [phase, setPhase] = useState<"loading" | "expand" | "fullpage">("loading");

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (showPanel) { setShowPanel(false); return; }
    if (btnRef.current) setAnchorRect(btnRef.current.getBoundingClientRect());
    setShowPanel(true);
  };

  useEffect(() => {
    if (showPanel) {
      setPhase("loading");
      setIsClosing(false);
      const t = setTimeout(() => setPhase("expand"), 1800);
      return () => clearTimeout(t);
    }
  }, [showPanel]);

  useEffect(() => {
    if (phase !== "expand" || !panelRef.current || !fullPageRef.current || !anchorRect) return;
    const p = panelRef.current;
    const f = fullPageRef.current;
    gsap.set(p, { position: "fixed", top: anchorRect.top, left: anchorRect.left, width: anchorRect.width, height: anchorRect.height, borderRadius: "6px", opacity: 1, zIndex: 9800 });
    gsap.set(f, { opacity: 0, zIndex: 9799 });
    const tl = gsap.timeline({ onComplete: () => setPhase("fullpage") });
    tl.to(p, { top: 0, left: 0, width: "100vw", height: "100vh", borderRadius: "0px", duration: 0.7, ease: "power4.inOut" })
      .to(f, { opacity: 1, duration: 0.4, ease: "power2.out" }, "-=0.35");
    return () => tl.kill();
  }, [phase, anchorRect]);

  const handleIconEnter = () => { if (closeIconRef.current && !isClosing) gsap.to(closeIconRef.current, { rotation: 45, scale: 1.2, duration: 0.3, ease: "power2.out" }); };
  const handleIconLeave = () => { if (closeIconRef.current && !isClosing) gsap.to(closeIconRef.current, { rotation: 0, scale: 1, duration: 0.3, ease: "power2.out" }); };
  const handleClose = () => {
    if (isClosing || !fullPageRef.current) return;
    setIsClosing(true);
    if (closeIconRef.current) gsap.to(closeIconRef.current, { rotation: 90, scale: 0, duration: 0.4, ease: "back.in(1.7)" });
    gsap.to(fullPageRef.current, { opacity: 0, y: 40, duration: 0.4, ease: "power3.in", onComplete: () => { setIsClosing(false); setShowPanel(false); } });
  };

  return (
    <>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9100, height: "44px", backgroundColor: BLUE, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 20px", fontFamily: FONT_FAMILY }}>
        <span style={{ color: WHITE, fontSize: "14px", fontWeight: 600, letterSpacing: "0.02em", textAlign: "center", display: "flex", alignItems: "center", gap: "8px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          Website this is build the develope{" "}
          <button ref={btnRef} onClick={handleClick} style={{ color: BLUE, fontWeight: 800, display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: WHITE, padding: "2px 8px", borderRadius: "6px", border: "none", cursor: "pointer", fontFamily: FONT_FAMILY, fontSize: "14px", lineHeight: 1.4 }}>
            Farid Ardiansyah
            <svg width="16" height="16" viewBox="0 0 40 40">
              <path fill={BLUE} d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Zm7.415 11.225 2.254 2.287-11.43 11.5-6.835-6.93 2.244-2.258 4.587 4.581 9.18-9.18Z" />
            </svg>
          </button>
        </span>
      </div>

      {showPanel && (phase === "loading" || phase === "expand") && (
        <div onClick={handleClose} style={{ position: "fixed", inset: 0, zIndex: 9700, background: "rgba(0,0,0,0.25)" }} />
      )}

      {showPanel && (phase === "loading" || phase === "expand") && anchorRect && (
        <div ref={panelRef} style={{ position: "fixed", top: anchorRect.top, left: anchorRect.left, width: anchorRect.width, height: anchorRect.height, backgroundColor: BLUE, border: `2px solid ${WHITE}`, borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(13,60,252,0.55)", zIndex: 9800, overflow: "hidden" }}>
          {phase === "loading" && (
            <div style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="24" height="24" viewBox="0 0 40 40" style={{ animation: "verifiedPop 1.8s ease-in-out forwards" }}>
                <g style={{ transformOrigin: "center center" }}>
                  <path fill={WHITE} d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Z" />
                  <path d="M15 20L18 23L25 16" stroke={BLUE} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" style={{ strokeDasharray: 100, strokeDashoffset: 100, animation: "drawCheck 0.8s ease-out 0.8s forwards" }} />
                </g>
              </svg>
            </div>
          )}
          {phase === "expand" && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              <svg width="18" height="18" viewBox="0 0 40 40">
                <path fill={WHITE} d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Z" />
                <path d="M15 20L18 23L25 16" stroke={BLUE} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
              <span style={{ fontFamily: FONT_FAMILY, fontSize: "11px", fontWeight: 800, color: WHITE, letterSpacing: "0.02em", whiteSpace: "nowrap" }}>Verified</span>
            </div>
          )}
        </div>
      )}

      {showPanel && (phase === "expand" || phase === "fullpage") && (
        <div ref={fullPageRef} style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", backgroundColor: BLUE, zIndex: 9799, display: phase === "fullpage" ? "flex" : "none", flexDirection: "column", fontFamily: FONT_FAMILY, color: WHITE, overflow: "hidden", opacity: 0 }}>
          <div style={{ padding: "24px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <svg width="32" height="32" viewBox="0 0 40 40">
                <path fill={WHITE} d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Z" />
                <path d="M15 20L18 23L25 16" stroke={BLUE} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
              <span style={{ fontSize: "28px", fontWeight: 800, color: WHITE, letterSpacing: "-0.02em" }}>Verified</span>
            </div>
            <button onClick={handleClose} onMouseEnter={handleIconEnter} onMouseLeave={handleIconLeave} disabled={isClosing} style={{ background: WHITE, border: "none", color: BLUE, borderRadius: "50%", width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center", cursor: isClosing ? "not-allowed" : "pointer" }}>
              <div ref={closeIconRef} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                  <line x1="12" y1="5" x2="12" y2="19" stroke={BLUE} strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="5" y1="12" x2="19" y2="12" stroke={BLUE} strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
            </button>
          </div>
          <div style={{ flex: 1, padding: "20px 40px", display: "flex", flexDirection: "column", overflowY: "auto", gap: "24px" }}>
            <div style={{ backgroundColor: WHITE, borderRadius: "24px", padding: "32px", display: "flex", flexDirection: "column", gap: "16px", maxWidth: "900px", boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}>
              <h2 style={{ fontSize: "48px", fontWeight: 800, margin: 0, color: BLUE, letterSpacing: "-0.03em", lineHeight: 1.1 }}>Farid Ardiansyah</h2>
              <p style={{ fontSize: "16px", fontWeight: 500, margin: 0, color: BLUE, lineHeight: 1.6, maxWidth: "700px", opacity: 0.9 }}>Website ini dibangun dan dikembangkan oleh Farid Ardiansyah. Verified developer & owner of Menuru. Semua fitur, sistem, dan infrastruktur di platform ini dikelola secara langsung.</p>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <a href="https://farid-ardiansyah.netlify.app/" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 22px", backgroundColor: BLUE, color: WHITE, borderRadius: "10px", textDecoration: "none", fontSize: "14px", fontWeight: 800, letterSpacing: "0.02em" }}>
                  Kunjungi Portofolio
                  <NorthEastArrow size={16} color={WHITE} />
                </a>
                <a href="mailto:faridardiansyah061@gmail.com" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "12px 22px", backgroundColor: "transparent", border: `2px solid ${BLUE}`, color: BLUE, borderRadius: "10px", textDecoration: "none", fontSize: "14px", fontWeight: 800, letterSpacing: "0.02em" }}>
                  Hubungi Email
                </a>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", maxWidth: "900px" }}>
              {[
                { label: "Nama", value: "Farid Ardiansyah" },
                { label: "Email", value: "faridardiansyah061@gmail.com" },
                { label: "Peran", value: "Founder & Developer" },
                { label: "Status", value: "Verified" },
              ].map((item, i) => (
                <div key={i} style={{ backgroundColor: WHITE, borderRadius: "16px", padding: "18px 20px", display: "flex", flexDirection: "column", gap: "6px", boxShadow: "0 6px 20px rgba(0,0,0,0.12)" }}>
                  <span style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "0.8px", textTransform: "uppercase", color: BLUE, opacity: 0.6 }}>{item.label}</span>
                  <span style={{ fontSize: "16px", fontWeight: 700, color: BLUE, wordBreak: "break-word" }}>{item.value}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "auto", paddingTop: "20px", width: "100%", overflow: "hidden", textAlign: "left", lineHeight: 0.85 }}>
              <span style={{ fontFamily: FONT_FAMILY, fontSize: "450px", fontWeight: 400, color: WHITE, letterSpacing: "-0.05em", lineHeight: 0.85, display: "block", userSelect: "none", whiteSpace: "nowrap" }}>Menuru</span>
            </div>
            <div style={{ width: "100%", overflow: "hidden", textAlign: "left", lineHeight: 0.85, marginBottom: "20px" }}>
              <span style={{ fontFamily: FONT_FAMILY, fontSize: "450px", fontWeight: 400, color: WHITE, letterSpacing: "-0.05em", lineHeight: 0.85, display: "block", userSelect: "none", whiteSpace: "nowrap" }}>2026</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ===== FOOTER CARD =====
const FooterCard = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
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
    return () => ctx.revert();
  }, []);

  const footerLinksData = [
    { title: "Get in Touch", links: ["Contact Us", "Instagram", "Live Chat"] },
    { title: "Product", links: ["Shop", "Note", "Calendar", "Blog", "Donation", "Community", "Live Chat Agent", "Stories"] },
    { title: "Attention", links: ["Privacy Policy", "Terms & Conditions", "About Us", "Terms of Use", "Cookies Policy", "Help Center"] },
  ];

  return (
    <div ref={containerRef} style={{ width: "calc(100% - 40px)", margin: "60px auto 20px auto", backgroundColor: BLUE, borderRadius: "32px", padding: "60px 40px 40px 40px", position: "relative", overflow: "hidden", boxSizing: "border-box", color: WHITE, fontFamily: FONT_FAMILY }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", maxWidth: "1400px", margin: "0 auto", gap: "40px", flexWrap: "wrap", position: "relative", zIndex: 1 }}>
        {footerLinksData.map((section, idx) => (
          <div key={idx} style={{ flex: "1", minWidth: "200px" }}>
            <h3 style={{ fontFamily: FONT_FAMILY, fontSize: "28px", fontWeight: 700, color: WHITE, margin: 0, marginBottom: "16px", letterSpacing: "-0.01em" }}>{section.title}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {section.links.map((link, linkIdx) => {
                let href = "#";
                if (link === "Contact Us") href = "/contact";
                else if (link === "Live Chat") href = "/live-chat";
                else if (link === "Live Chat Agent") href = "/live-chat-agent";
                else if (link === "Help Center") href = "/pusat-bantuan";
                else if (link === "About Us") href = "/profile";
                else if (link === "Privacy Policy") href = "/privacy-policy";
                else if (link === "Terms & Conditions") href = "/terms-of-services";
                else if (link === "Instagram") href = "https://instagram.com/menuru";
                return (
                  <Link key={linkIdx} href={href} style={{ textDecoration: "none" }}>
                    <span style={{ fontFamily: FONT_FAMILY, fontSize: "20px", fontWeight: 500, color: WHITE, letterSpacing: "-0.01em", cursor: "pointer" }}>{link}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
        <div style={{ flex: "0 0 auto", minWidth: "200px" }}>
          <a href="https://apps.microsoft.com/detail/9nv1fg4b6xvn?hl=id-ID&gl=ID" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "10px", textDecoration: "none", cursor: "pointer", padding: "14px 22px", backgroundColor: RED, borderRadius: "12px", boxShadow: "0 6px 24px rgba(220,38,38,0.35)" }}>
            <WindowsIcon size={24} color={WHITE} />
            <span style={{ fontFamily: FONT_FAMILY, fontSize: "18px", fontWeight: 700, color: WHITE, letterSpacing: "-0.01em", lineHeight: 1.2, whiteSpace: "nowrap" }}>Download for Windows</span>
          </a>
        </div>
      </div>
      <div style={{ maxWidth: "1400px", margin: "40px auto 0 auto", paddingTop: "20px", borderTop: "1px solid rgba(255,255,255,0.2)", position: "relative", zIndex: 1 }}>
        <p style={{ fontFamily: FONT_FAMILY, fontSize: "14px", fontWeight: 400, color: WHITE, margin: 0, textAlign: "center", letterSpacing: "0.01em", opacity: 0.8 }}>Terms and conditions apply. By using this website, you agree to our Terms of Use and Privacy Policy.</p>
      </div>
      <div style={{ marginTop: "40px", marginBottom: "24px", position: "relative", zIndex: 1 }}>
        <a href="https://apps.microsoft.com/detail/9nv1fg4b6xvn?hl=id-ID&gl=ID" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "12px", textDecoration: "none", cursor: "pointer", padding: "14px 22px", backgroundColor: WHITE, borderRadius: "14px", boxShadow: "0 6px 24px rgba(0,0,0,0.12)" }}>
          <MicrosoftIcon size={36} />
          <span style={{ fontFamily: FONT_FAMILY, fontSize: "24px", fontWeight: 700, color: BLUE, letterSpacing: "-0.02em", lineHeight: 1.2 }}>Unduh Menuru</span>
        </a>
      </div>
      <div style={{ position: "relative", zIndex: 1 }}>
        <span ref={titleRef} style={{ fontFamily: FONT_FAMILY, fontSize: "600px", fontWeight: 400, color: WHITE, letterSpacing: "-0.05em", lineHeight: "0.85", display: "block", textAlign: "left", whiteSpace: "nowrap", margin: 0, padding: 0, overflow: "visible", pointerEvents: "none" }}>Menuru</span>
        <div style={{ width: "100%", display: "flex", justifyContent: "flex-start", marginTop: "10px" }}>
          <span style={{ fontFamily: FONT_FAMILY, fontSize: "16px", fontWeight: 400, color: WHITE, letterSpacing: "0.01em", opacity: 0.85 }}>2024 - 2026 Menuru. All rights reserved.</span>
        </div>
      </div>
    </div>
  );
};

// ===== PRELOADER =====
const Preloader = ({ onComplete }: { onComplete: () => void }) => {
  const preloaderRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const p = preloaderRef.current, t = textRef.current, c = counterRef.current;
    if (!p || !t || !c) return;
    gsap.set(t, { y: 100, opacity: 0 });
    gsap.set(c, { opacity: 1, scale: 1, y: 0, xPercent: 0 });
    const co = { value: 1 };
    c.textContent = "01";
    const tl = gsap.timeline({ onComplete: () => gsap.to(p, { opacity: 0, duration: 0.6, onComplete }) });
    tl.to(t, { y: 0, opacity: 1, duration: 1.0, ease: "back.out(1.7)" })
      .to(t, { duration: 0.8 })
      .to(t, { opacity: 0, y: -20, scale: 0.9, duration: 0.5, ease: "power2.out", onComplete: () => { t.textContent = "Note"; } })
      .to(t, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "back.out(1.7)" })
      .to(t, { duration: 1.2 });
    tl.to(co, { value: 100, duration: 6.5, ease: "power2.inOut", onUpdate: () => { c.textContent = String(Math.round(co.value)).padStart(2, "0"); } }, 0);
    tl.to(t, { scale: 0.3, opacity: 0, duration: 0.8, ease: "power2.in" })
      .to(c, { scale: 0.6, opacity: 0, duration: 0.8, ease: "power2.in" }, "-=0.8")
      .to(p, { opacity: 0, duration: 0.6 });
  }, [onComplete]);

  return (
    <div ref={preloaderRef} style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: WHITE, zIndex: 9999, fontFamily: FONT_FAMILY, overflow: "hidden" }}>
      <span ref={counterRef} style={{ position: "absolute", top: "10px", right: "40px", fontSize: "400px", fontWeight: 400, color: BLUE, fontFamily: FONT_FAMILY, letterSpacing: "-0.04em", lineHeight: 0.9, display: "inline-block", userSelect: "none", pointerEvents: "none" }}>01</span>
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "40px", overflow: "hidden" }}>
          <span style={{ fontSize: "100px", fontWeight: 400, color: BLUE, fontFamily: FONT_FAMILY, letterSpacing: "-0.03em" }}>Menuru</span>
          <span ref={textRef} style={{ fontSize: "50px", fontWeight: 600, color: BLACK, fontFamily: FONT_FAMILY, letterSpacing: "-0.02em", display: "inline-block" }}>Shop</span>
        </div>
      </div>
    </div>
  );
};

// ===== TWO FACTOR MODAL =====
const TwoFactorModal = ({ user, secret, onSuccess, onClose }: { user: any; secret: string; onSuccess: () => void; onClose: () => void }) => {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState("");
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    if (!secret) return;
    let mounted = true;
    const tick = async () => {
      try { const c = await totp(secret); if (mounted) setPreview(c); } catch {}
      if (mounted) setCountdown(30 - (Math.floor(Date.now() / 1000) % 30));
    };
    tick();
    const i = setInterval(tick, 1000);
    return () => { mounted = false; clearInterval(i); };
  }, [secret]);

  const handleVerify = async () => {
    if (!/^\d{6}$/.test(token)) { setError("Kode harus 6 digit angka."); return; }
    setBusy(true); setError("");
    try {
      const ok = await verifyTotp(secret, token);
      if (!ok) { setError("Kode OTP salah atau kadaluarsa."); setBusy(false); return; }
      onSuccess();
    } finally { setBusy(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.55)", zIndex: 9500, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} style={{ backgroundColor: WHITE, borderRadius: "24px", padding: "32px", maxWidth: "480px", width: "100%", fontFamily: FONT_FAMILY }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "44px", height: "44px", backgroundColor: BLUE, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShieldLockIcon size={24} color={WHITE} />
            </div>
            <h3 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: BLUE }}>Google Authenticator</h3>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: BLUE, fontSize: "22px", fontWeight: 700 }}>×</button>
        </div>
        <p style={{ fontSize: "14px", color: BLUE, opacity: 0.8, margin: "0 0 16px 0", lineHeight: 1.6 }}>
          Masukkan kode 6 digit dari Google Authenticator untuk <strong>{user?.email}</strong>.
        </p>
        {preview && (
          <div style={{ backgroundColor: "#F0F4FF", borderRadius: "12px", padding: "14px 16px", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "11px", color: BLUE, opacity: 0.6, fontWeight: 800, textTransform: "uppercase" }}>Kode saat ini (lokal)</div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: BLUE, letterSpacing: "0.15em" }}>{preview}</div>
            </div>
            <div style={{ color: BLUE, fontWeight: 800, fontSize: "13px" }}>{countdown}s</div>
          </div>
        )}
        <input type="text" value={token} onChange={(e) => setToken(e.target.value.replace(/[^\d\s]/g, "").slice(0, 6))} placeholder="123456" maxLength={6} inputMode="numeric" style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: `2px solid ${BLUE}`, fontSize: "20px", fontFamily: FONT_FAMILY, outline: "none", color: BLUE, fontWeight: 600, letterSpacing: "0.2em", textAlign: "center", backgroundColor: WHITE, marginBottom: "12px" }} />
        {error && <div style={{ color: RED, fontSize: "13px", fontWeight: 600, marginBottom: "12px" }}>{error}</div>}
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={handleVerify} disabled={busy || token.length !== 6} style={{ flex: 1, padding: "12px 18px", backgroundColor: busy || token.length !== 6 ? "#ccc" : BLUE, color: WHITE, border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 700, cursor: busy || token.length !== 6 ? "not-allowed" : "pointer", fontFamily: FONT_FAMILY }}>{busy ? "Memverifikasi..." : "Verifikasi"}</button>
          <button onClick={onClose} style={{ padding: "12px 18px", backgroundColor: "transparent", color: BLUE, border: `2px solid ${BLUE}`, borderRadius: "10px", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: FONT_FAMILY }}>Batal</button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ===== MENURU CENTER CARD =====
const MenuruCenterCard = ({ verified, method }: { verified: boolean; method?: "passkey" | "totp" }) => {
  if (verified) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 22 }}
        style={{ width: "100%", maxWidth: "600px", backgroundColor: WHITE, borderRadius: "24px", padding: "32px", border: `2px solid ${BLUE}`, boxShadow: "0 12px 32px rgba(13,60,252,0.15)", display: "flex", flexDirection: "column", gap: "16px", marginTop: "32px" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "16px", backgroundColor: BLUE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <ShieldLockIcon size={28} color={WHITE} />
          </div>
          <div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: BLUE, letterSpacing: "-0.02em" }}>Menuru Center</div>
            <div style={{ fontSize: "13px", color: BLUE, opacity: 0.7, fontWeight: 600 }}>Security Center</div>
          </div>
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 12px", backgroundColor: "#DCFCE7", borderRadius: "10px", alignSelf: "flex-start" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: GREEN }} />
          <span style={{ fontSize: "13px", fontWeight: 800, color: "#166534" }}>
            Terverifikasi{method === "passkey" ? " via Passkey" : method === "totp" ? " via Google Authenticator" : ""}
          </span>
        </div>
        <p style={{ fontSize: "14px", color: BLUE, opacity: 0.9, lineHeight: 1.6, margin: 0 }}>
          Identitas Anda telah diverifikasi. Anda akan diarahkan ke dashboard dalam beberapa saat.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ width: "100%", maxWidth: "600px", backgroundColor: BLUE, borderRadius: "24px", padding: "28px", boxShadow: "0 12px 32px rgba(13,60,252,0.3)", display: "flex", flexDirection: "column", gap: "16px", marginTop: "32px" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <div style={{ width: "56px", height: "56px", borderRadius: "16px", backgroundColor: WHITE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <ShieldLockIcon size={28} color={BLUE} />
        </div>
        <div>
          <div style={{ fontSize: "22px", fontWeight: 800, color: WHITE, letterSpacing: "-0.02em" }}>Menuru Center</div>
          <div style={{ fontSize: "13px", color: WHITE, opacity: 0.85, fontWeight: 600 }}>Security Verification</div>
        </div>
      </div>
      <p style={{ fontSize: "14px", color: WHITE, opacity: 0.95, lineHeight: 1.6, margin: 0 }}>
        Verifikasi identitas Anda untuk melanjutkan ke dashboard. Gunakan salah satu metode di bawah jika Anda kesulitan login dengan PIN.
      </p>
    </motion.div>
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
  const [sayHeyOpen, setSayHeyOpen] = useState(false);
  const [showPinScreen, setShowPinScreen] = useState(false);
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [pinError, setPinError] = useState("");
  const [isNewPin, setIsNewPin] = useState(false);
  const [tempUser, setTempUser] = useState<any>(null);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [hasPasskey, setHasPasskey] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorSecret, setTwoFactorSecret] = useState("");
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [showPasskeyHelp, setShowPasskeyHelp] = useState(false);
  const [passkeyBusy, setPasskeyBusy] = useState(false);
  const [passkeyError, setPasskeyError] = useState("");
  const [verifiedMethod, setVerifiedMethod] = useState<"passkey" | "totp" | null>(null);
  const router = useRouter();

  useEffect(() => setIsMounted(true), []);
  const handlePreloaderComplete = () => setShowMain(true);

  useEffect(() => {
    if (!showMain) return;
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [showMain]);

  useEffect(() => {
    if (!showMain || !auth) return;
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const idToken = await currentUser.getIdToken();
          const result = await apiRequest<{ user: any }>("/auth/signin", { method: "POST", body: JSON.stringify({ idToken }) });
          if (result.success && result.data) {
            setTempUser(currentUser);
            const d = getDb();
            if (d) {
              try {
                const snap = await getDoc(doc(d, "users", currentUser.uid));
                if (snap.exists()) {
                  const data = snap.data();
                  setHasPasskey(Array.isArray(data.passkeys) && data.passkeys.length > 0);
                  setTwoFactorEnabled(data.twoFactorEnabled === true);
                  setTwoFactorSecret(data.totpSecret || "");
                }
              } catch (e) { console.error(e); }
            }
            if (result.data.user.hasPin) { setShowPinScreen(true); setIsNewPin(false); }
            else { setShowPinScreen(true); setIsNewPin(true); }
            setUser(null);
          }
        } catch (e) { console.error("Auth state error:", e); }
      } else {
        setUser(null);
        setShowPinScreen(false);
        setTempUser(null);
        setShowTwoFactorModal(false);
        setShowPasskeyHelp(false);
        setVerifiedMethod(null);
      }
    });
    return () => unsub();
  }, [showMain]);

  const finishLogin = (method: "passkey" | "totp" | null) => {
    if (method) {
      setVerifiedMethod(method);
      setTimeout(() => {
        setUser(auth?.currentUser || null);
        setShowPinScreen(false);
        setShowTwoFactorModal(false);
        setShowPasskeyHelp(false);
        router.push("/");
      }, 2400);
    } else {
      setUser(auth?.currentUser || null);
      setShowPinScreen(false);
      setShowTwoFactorModal(false);
      router.push("/");
    }
  };

  const handlePinSubmit = async () => {
    if (!auth?.currentUser) { setPinError("Sesi tidak ditemukan."); return; }
    const idToken = await auth.currentUser.getIdToken();
    if (isNewPin) {
      if (pin.length !== 6) { setPinError("PIN harus 6 digit"); return; }
      if (pin !== pinConfirm) { setPinError("PIN tidak cocok"); return; }
      setPinError("");
      const result = await apiRequest("/auth/save-pin", { method: "POST", body: JSON.stringify({ idToken, pin }) });
      if (!result.success) { setPinError(result.error || "Gagal menyimpan PIN"); return; }
      finishLogin(null);
    } else {
      if (pin.length !== 6) { setPinError("PIN harus 6 digit"); return; }
      setPinError("");
      const result = await apiRequest("/auth/verify-pin", { method: "POST", body: JSON.stringify({ idToken, pin }) });
      if (!result.success) { setPinError(result.error || "PIN salah"); return; }
      finishLogin(null);
    }
  };

  const handlePasskeyLogin = async () => {
    if (!supportsWebAuthn()) { setPasskeyError("Browser tidak mendukung passkey."); return; }
    if (!tempUser) { setPasskeyError("Sesi tidak ditemukan."); return; }
    setPasskeyBusy(true); setPasskeyError("");
    try {
      const d = getDb();
      let credIds: string[] = [];
      if (d) {
        const snap = await getDoc(doc(d, "users", tempUser.uid));
        if (snap.exists()) {
          const pk = snap.data().passkeys;
          if (Array.isArray(pk)) credIds = pk.map((p: any) => p.credentialId);
        }
      }
      if (credIds.length === 0) { setPasskeyError("Tidak ada passkey terdaftar."); setPasskeyBusy(false); return; }
      const challenge = randomChallenge(32);
      const publicKey: PublicKeyCredentialRequestOptions = {
        challenge,
        timeout: 60000,
        userVerification: "preferred",
        allowCredentials: credIds.map((id) => ({ id: b64UrlToBuf(id), type: "public-key" as const, transports: ["internal"] as AuthenticatorTransport[] })),
        rpId: window.location.hostname,
      };
      const assertion = (await navigator.credentials.get({ publicKey })) as PublicKeyCredential | null;
      if (!assertion) { setPasskeyError("Passkey dibatalkan."); setPasskeyBusy(false); return; }
      const usedId = bufToB64Url(assertion.rawId);
      if (!credIds.includes(usedId)) { setPasskeyError("Passkey tidak dikenali."); setPasskeyBusy(false); return; }
      setShowPasskeyHelp(false);
      finishLogin("passkey");
    } catch (e: any) {
      console.error(e);
      const msg = e?.message || "";
      if (e?.name === "NotAllowedError" || msg.includes("not allowed")) setPasskeyError("Verifikasi passkey dibatalkan.");
      else setPasskeyError("Passkey gagal: " + (msg || "Unknown"));
    } finally { setPasskeyBusy(false); }
  };

  const handleGoogleLogin = async () => {
    if (!auth) return;
    if (!agreeTerms) { setError("Anda harus menyetujui Syarat & Ketentuan terlebih dahulu."); return; }
    setLoading(true); setError("");
    try { await signInWithPopup(auth, new GoogleAuthProvider()); }
    catch (err: any) { setError(err.message || "Login Google gagal"); }
    finally { setLoading(false); }
  };

  const handleGitHubLogin = async () => {
    if (!auth) return;
    if (!agreeTerms) { setError("Anda harus menyetujui Syarat & Ketentuan terlebih dahulu."); return; }
    setLoading(true); setError("");
    try { await signInWithPopup(auth, new GithubAuthProvider()); }
    catch (err: any) { setError(err.message || "Login GitHub gagal"); }
    finally { setLoading(false); }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;
    if (!agreeTerms) { setError("Anda harus menyetujui Syarat & Ketentuan terlebih dahulu."); return; }
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
      <TopBanner />

      <div style={{ position: "fixed", top: "44px", left: 0, width: "200px", height: "120px", pointerEvents: "none", zIndex: 8500, backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", maskImage: "linear-gradient(to right, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 100%)", WebkitMaskImage: "linear-gradient(to right, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 100%)" }} />
      <div style={{ position: "fixed", top: "44px", right: 0, width: "200px", height: "120px", pointerEvents: "none", zIndex: 8500, backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", maskImage: "linear-gradient(to left, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 100%)", WebkitMaskImage: "linear-gradient(to left, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 100%)" }} />

      <div style={{ paddingTop: "44px" }}>
        <LeftNavbar shifted={false} />
        <RightNavbar user={user} auth={auth} onSayHeyToggle={() => setSayHeyOpen((p) => !p)} sayHeyOpen={sayHeyOpen} sayHeyUnreadCount={0} locationText="" />

        <div style={{ marginTop: "160px", padding: "0 40px 80px", width: "100%", maxWidth: "1400px", marginLeft: "auto", marginRight: "auto", display: "flex", flexDirection: isMobile ? "column" : "row", gap: isMobile ? "40px" : "80px", justifyContent: "center", minHeight: "calc(100vh - 260px)" }}>
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} style={{ flex: isMobile ? "1" : "0 0 55%", maxWidth: isMobile ? "100%" : "900px" }}>
            <AnimatePresence mode="wait">
              {showPinScreen ? (
                <motion.div key="pin" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "30px", flexWrap: "wrap", justifyContent: "center" }}>
                    <h2 style={{ fontSize: isMobile ? "80px" : "250px", fontWeight: 400, color: BLUE, margin: 0, fontFamily: FONT_FAMILY, letterSpacing: "-0.05em", lineHeight: 0.85, whiteSpace: "nowrap" }}>PIN</h2>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: isMobile ? "80px" : "180px", height: isMobile ? "80px" : "180px", backgroundColor: BLUE, borderRadius: "28px", flexShrink: 0 }}>
                      <NorthEastArrow size={isMobile ? 50 : 110} color={WHITE} />
                    </div>
                  </div>

                  <PinInput value={pin} onChange={setPin} isNew={isNewPin} confirmValue={isNewPin ? pinConfirm : undefined} onConfirmChange={isNewPin ? setPinConfirm : undefined} onComplete={() => { if (!isNewPin && pin.length === 6) handlePinSubmit(); }} />

                  {pinError && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ color: BLUE, fontSize: "16px", marginTop: "20px", fontFamily: FONT_FAMILY, fontWeight: 600, textAlign: "center" }}>
                      {pinError}
                    </motion.div>
                  )}

                  <div style={{ display: "flex", gap: "16px", marginTop: "40px" }}>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setPin(""); setPinConfirm(""); setPinError(""); }} style={{ padding: "14px 32px", backgroundColor: BLUE, color: WHITE, border: "none", borderRadius: "12px", fontSize: "16px", cursor: "pointer", fontFamily: FONT_FAMILY, fontWeight: 700, display: "flex", alignItems: "center", gap: "10px" }}>
                      Reset
                      <NorthEastArrow size={22} color={WHITE} />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handlePinSubmit} style={{ padding: "14px 32px", backgroundColor: BLUE, color: "#fff", border: "none", borderRadius: "12px", fontSize: "16px", cursor: "pointer", fontFamily: FONT_FAMILY, fontWeight: 700, display: "flex", alignItems: "center", gap: "10px" }}>
                      {isNewPin ? "Simpan PIN" : "Verifikasi"}
                      <NorthEastArrow size={22} color={WHITE} />
                    </motion.button>
                  </div>

                  {!isNewPin && (hasPasskey || twoFactorEnabled) && !verifiedMethod && (
                    <>
                      <MenuruCenterCard verified={false} />
                      <div style={{ width: "100%", maxWidth: "600px", display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: BLUE, fontSize: "13px", fontWeight: 600 }}>
                          <HelpIcon size={16} color={BLUE} />
                          <span>Kesulitan login? Gunakan metode bantuan di bawah.</span>
                        </div>
                        {hasPasskey && (
                          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowPasskeyHelp(true)} disabled={passkeyBusy} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", backgroundColor: BLUE, color: WHITE, border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: 700, cursor: passkeyBusy ? "not-allowed" : "pointer", fontFamily: FONT_FAMILY }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <KeyIcon size={20} color={WHITE} />
                              <span>Login dengan Passkey (Biometrik)</span>
                            </div>
                            <NorthEastArrow size={18} color={WHITE} />
                          </motion.button>
                        )}
                        {twoFactorEnabled && (
                          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowTwoFactorModal(true)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", backgroundColor: BLUE, color: WHITE, border: "none", borderRadius: "12px", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: FONT_FAMILY }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <ShieldLockIcon size={20} color={WHITE} />
                              <span>Verifikasi dengan Google Authenticator</span>
                            </div>
                            <NorthEastArrow size={18} color={WHITE} />
                          </motion.button>
                        )}
                      </div>
                    </>
                  )}

                  {verifiedMethod && <MenuruCenterCard verified={true} method={verifiedMethod} />}

                  {showPasskeyHelp && hasPasskey && !verifiedMethod && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: "20px", padding: "16px 20px", backgroundColor: BLUE, borderRadius: "14px", color: WHITE, width: "100%", maxWidth: "600px", fontFamily: FONT_FAMILY }}>
                      <div style={{ fontSize: "14px", fontWeight: 700, marginBottom: "6px" }}>Verifikasi Passkey</div>
                      <div style={{ fontSize: "12px", opacity: 0.9, lineHeight: 1.5, marginBottom: "12px" }}>Gunakan biometrik / PIN perangkat untuk memverifikasi identitas Anda.</div>
                      {passkeyError && <div style={{ color: "#FECACA", fontSize: "12px", fontWeight: 600, marginBottom: "8px" }}>{passkeyError}</div>}
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={handlePasskeyLogin} disabled={passkeyBusy} style={{ flex: 1, padding: "10px 16px", backgroundColor: WHITE, color: BLUE, border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 800, cursor: passkeyBusy ? "not-allowed" : "pointer", fontFamily: FONT_FAMILY }}>
                          {passkeyBusy ? "Memproses..." : "Verifikasi Sekarang"}
                        </button>
                        <button onClick={() => { setShowPasskeyHelp(false); setPasskeyError(""); }} style={{ padding: "10px 16px", backgroundColor: "transparent", color: WHITE, border: `1.5px solid ${WHITE}`, borderRadius: "8px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: FONT_FAMILY }}>
                          Batal
                        </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ) : !user ? (
                <motion.div key="signin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "20px", flexWrap: "wrap" }}>
                    <h1 style={{ fontSize: isMobile ? "100px" : "450px", fontWeight: 700, color: BLUE, letterSpacing: "-0.06em", lineHeight: 0.85, margin: 0, fontFamily: FONT_FAMILY, whiteSpace: "nowrap" }}>Sign In</h1>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: isMobile ? "100px" : "220px", height: isMobile ? "100px" : "220px", backgroundColor: BLUE, borderRadius: "32px", flexShrink: 0 }}>
                      <NorthEastArrow size={isMobile ? 60 : 140} color={WHITE} />
                    </div>
                  </div>
                  <p style={{ fontSize: "18px", color: "#666", marginBottom: "32px", fontFamily: FONT_FAMILY }}>Welcome back! Sign in to your account</p>

                  {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: BLUE, fontSize: "15px", marginBottom: "16px", fontFamily: FONT_FAMILY }}>
                      {error}
                    </motion.div>
                  )}

                  <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "32px" }}>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleGoogleLogin} disabled={loading} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", padding: "14px 20px", border: "none", borderRadius: "12px", background: BLUE, cursor: loading ? "not-allowed" : "pointer", width: "100%", fontSize: "16px", color: WHITE, fontFamily: FONT_FAMILY, fontWeight: 600 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <svg width="24" height="24" viewBox="0 0 24 24">
                          <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#ffffff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#ffffff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="#ffffff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span>Continue with Google</span>
                      </div>
                      <NorthEastArrow size={28} color={WHITE} />
                    </motion.button>

                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleGitHubLogin} disabled={loading} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", padding: "14px 20px", border: "none", borderRadius: "12px", background: BLUE, cursor: loading ? "not-allowed" : "pointer", width: "100%", fontSize: "16px", color: WHITE, fontFamily: FONT_FAMILY, fontWeight: 600 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <svg width="24" height="24" viewBox="0 0 24 24">
                          <path fill="#ffffff" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
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

                  <form onSubmit={handleEmailLogin} style={{ width: "100%" }}>
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: "100%", padding: "16px 20px", border: "none", borderRadius: "12px", fontSize: "16px", marginBottom: "16px", outline: "none", fontFamily: FONT_FAMILY, backgroundColor: BLUE, color: WHITE }} />
                    <div style={{ position: "relative", marginBottom: "24px" }}>
                      <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: "100%", padding: "16px 50px 16px 20px", border: "none", borderRadius: "12px", fontSize: "16px", outline: "none", fontFamily: FONT_FAMILY, backgroundColor: BLUE, color: WHITE }} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: WHITE }}>
                        <EyeIcon open={showPassword} color={WHITE} />
                      </button>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px", gap: "12px", flexWrap: "wrap" }}>
                      <button type="button" onClick={() => router.push("/forgot-password")} style={{ background: "none", border: "none", color: BLUE, fontSize: "15px", cursor: "pointer", textDecoration: "underline", fontFamily: FONT_FAMILY, display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <NorthWestArrow size={20} color={BLUE} />
                        Lupa password?
                      </button>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ color: "#666", fontSize: "15px", fontFamily: FONT_FAMILY }}>Belum punya akun?</span>
                        <button type="button" onClick={() => router.push("/signup")} style={{ background: "none", border: "none", color: BLUE, fontSize: "15px", fontWeight: 500, cursor: "pointer", textDecoration: "underline", fontFamily: FONT_FAMILY, display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          Sign up
                          <NorthEastArrow size={20} color={BLUE} />
                        </button>
                      </div>
                    </div>

                    <TermsAgreementBox agreed={agreeTerms} onToggle={() => setAgreeTerms(!agreeTerms)} />

                    <motion.button type="submit" disabled={loading || !agreeTerms} whileHover={!loading && agreeTerms ? { scale: 1.02 } : {}} whileTap={!loading && agreeTerms ? { scale: 0.98 } : {}} style={{ width: "100%", padding: "16px 20px", backgroundColor: loading || !agreeTerms ? "#ccc" : BLUE, color: "#fff", border: "none", borderRadius: "12px", fontSize: "18px", fontWeight: 600, cursor: loading || !agreeTerms ? "not-allowed" : "pointer", fontFamily: FONT_FAMILY, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span>{loading ? "Signing In..." : "Sign In"}</span>
                      {!loading && agreeTerms && <NorthEastArrow size={32} color={WHITE} />}
                    </motion.button>
                  </form>

                  <div style={{ textAlign: "center", marginTop: "30px", paddingTop: "20px", borderTop: "1px solid #f0f0f0" }}>
                    <Link href="/pusat-bantuan" style={{ color: BLUE, fontSize: "15px", display: "inline-flex", alignItems: "center", gap: "6px", textDecoration: "none", fontFamily: FONT_FAMILY }}>
                      <HelpDeskIcon size={18} color={BLUE} />
                      <span>Pusat Bantuan</span>
                      <NorthEastArrow size={20} color={BLUE} />
                    </Link>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        </div>

        {sayHeyOpen && (
          <div style={{ width: "100%", padding: "0 40px", maxWidth: "1400px", margin: "0 auto 40px auto", position: "relative", zIndex: 2 }}>
            <SayHeySection user={user} onClose={() => setSayHeyOpen(false)} />
          </div>
        )}

        <FooterCard />
      </div>

      <AnimatePresence>
        {showTwoFactorModal && twoFactorEnabled && (
          <TwoFactorModal
            user={tempUser}
            secret={twoFactorSecret}
            onSuccess={() => { setShowTwoFactorModal(false); finishLogin("totp"); }}
            onClose={() => setShowTwoFactorModal(false)}
          />
        )}
      </AnimatePresence>

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
        input::placeholder {
          color: rgba(255, 255, 255, 0.75) !important;
        }
        .pin-box {
          transition: box-shadow 0.2s ease;
        }
        @keyframes verifiedPop {
          0% { transform: scale(0.3) rotate(-25deg); opacity: 0; }
          20% { transform: scale(1) rotate(0deg); opacity: 1; }
          40% { transform: scale(1.12) rotate(0deg); }
          60% { transform: scale(1) rotate(0deg); }
          80% { transform: scale(1.18) rotate(0deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes drawCheck {
          0% { stroke-dashoffset: 100; opacity: 0; }
          100% { stroke-dashoffset: 0; opacity: 1; }
        }
      `}</style>
    </div>
  );
}
