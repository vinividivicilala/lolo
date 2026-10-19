'use client';

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Head from "next/head";
import { 
  getAuth, 
  onAuthStateChanged,
  signOut
} from "firebase/auth";
import { 
  getFirestore,
  collection,
  addDoc,
  setDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  deleteDoc,
  updateDoc,
  arrayUnion,
  getDocs,
  where,
  getDoc
} from "firebase/firestore";
import { initializeApp, getApps } from "firebase/app";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

const firebaseConfig = {
  apiKey: "AIzaSyD_htQZ1TClnXKZGRJ4izbMQ02y6V3aNAQ",
  authDomain: "wawa44-58d1e.firebaseapp.com",
  databaseURL: "https://wawa44-58d1e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "wawa44-58d1e",
  storageBucket: "wawa44-58d1e.firebasestorage.app",
  messagingSenderId: "836899520599",
  appId: "1:836899520599:web:b346e4370ecfa9bb89e312",
  measurementId: "G-8LMP7F4BE9"
};

// ===== CONSTANTS =====
const FONT_FAMILY = "'Plus Jakarta Sans'";
const BLUE = "#0D3CFC";
const WHITE = "#FFFFFF";
const BLACK = "#000000";
const LIME = "#E3FB96";

// ===== SVG ICONS =====
const NorthEastArrow = ({ size = 20, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M7 17L17 7M17 7H8M17 7V16" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LogoutIcon = ({ size = 20, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 17L21 12L16 7" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21 12H9" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PeopleIcon = ({ size = 20, color = "#ffffff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="8" r="4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 21V19C4 16.7909 5.79086 15 8 15H16C18.2091 15 20 16.7909 20 19V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

const SayHeyIcon = ({ size = 22, color = "#000000" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 11.5C21 16.1944 16.9706 20 12 20C10.8452 20 9.74371 19.7964 8.73507 19.4276L4 21L5.45177 16.7441C4.53668 15.3762 4 13.7581 4 12C4 7.30558 8.02944 3.5 12 3.5C16.9706 3.5 21 7.30558 21 11.5Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="9" cy="11.5" r="1" fill={color} />
    <circle cx="12" cy="11.5" r="1" fill={color} />
    <circle cx="15" cy="11.5" r="1" fill={color} />
  </svg>
);

// Instagram Verified Badge Component
const InstagramVerifiedBadge = ({ size = 16 }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <span 
      style={{ 
        position: 'relative', 
        display: 'inline-block',
        marginLeft: '4px',
        verticalAlign: 'middle'
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "inline-block", verticalAlign: "middle" }}
      >
        <path
          fill="#0095F6"
          d="M12 2.2C13.6 3.8 16.2 3.8 17.8 2.2C18.6 3.8 20.2 5.4 21.8 6.2C20.2 7.8 20.2 10.4 21.8 12C20.2 13.6 20.2 16.2 21.8 17.8C20.2 18.6 18.6 20.2 17.8 21.8C16.2 20.2 13.6 20.2 12 21.8C10.4 20.2 7.8 20.2 6.2 21.8C5.4 20.2 3.8 18.6 2.2 17.8C3.8 16.2 3.8 13.6 2.2 12C3.8 10.4 3.8 7.8 2.2 6.2C3.8 5.4 5.4 3.8 6.2 2.2C7.8 3.8 10.4 3.8 12 2.2Z"
        />
        <path
          d="M9.2 12.3l2 2 4.6-4.6"
          stroke="white"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      
      {showTooltip && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#333',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          whiteSpace: 'nowrap',
          marginBottom: '5px',
          zIndex: 1000
        }}>
          Akun Resmi
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            borderWidth: '5px',
            borderStyle: 'solid',
            borderColor: '#333 transparent transparent transparent'
          }} />
        </div>
      )}
    </span>
  );
};

// ===== NAVBAR BUTTON =====
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
  buttonColor = "#0D3CFC",
  buttonHoverColor = "#000000",
  panelColor = "#0D3CFC",
  iconButtonColor = "#000000",
  iconButtonHoverColor = "#0D3CFC",
  panelBoxColor = "rgba(255,255,255,0.12)",
  panelBoxBorder = "rgba(255,255,255,0.25)",
  labelTextColor = "#ffffff",
  labelTextHoverColor = "#ffffff",
  titleTextColor = "#ffffff",
  descriptionTextColor = "rgba(255,255,255,0.9)",
  iconComponent = null,
  isResources = false,
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
    closeTimeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 250);
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
          borderRadius: "10px",
          border: "1px solid rgba(255,255,255,0.18)",
          boxShadow: open ? "0 8px 24px rgba(0,0,0,0.35)" : `0 8px 24px ${buttonColor}55`,
          transition: "background-color 0.25s ease",
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
          }}
        >
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
                    <span style={{ fontSize: "16px", fontWeight: 700, fontFamily: FONT_FAMILY, color: titleTextColor }}>
                      Docs
                    </span>
                  </div>
                  <p style={{ fontSize: "12px", lineHeight: 1.5, color: descriptionTextColor, margin: 0, fontFamily: FONT_FAMILY, maxWidth: "340px" }}>
                    Complete documentation of product guides, API, and Menuru tutorials.
                  </p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <BrandIcon size={22} color={titleTextColor} />
                    <span style={{ fontSize: "16px", fontWeight: 700, fontFamily: FONT_FAMILY, color: titleTextColor }}>
                      Brand
                    </span>
                  </div>
                  <p style={{ fontSize: "12px", lineHeight: 1.5, color: descriptionTextColor, margin: 0, fontFamily: FONT_FAMILY, maxWidth: "340px" }}>
                    Visual assets, logos, and Menuru brand identity guidelines.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {iconComponent ? (
                    iconComponent
                  ) : iconType === "trust" ? (
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
                <div
                  style={{
                    backgroundColor: panelBoxColor,
                    border: `1px solid ${panelBoxBorder}`,
                    borderRadius: "12px",
                    padding: "12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <img src={panelImage} alt="Docs" style={{ width: "100%", height: "120px", objectFit: "contain", display: "block", borderRadius: "8px" }} />
                  <span style={{ fontSize: "14px", fontWeight: 700, fontFamily: FONT_FAMILY, color: titleTextColor }}>
                    Docs Guide
                  </span>
                  <p style={{ fontSize: "12px", lineHeight: 1.5, color: descriptionTextColor, margin: 0, fontFamily: FONT_FAMILY }}>
                    Complete guides and technical references.
                  </p>
                </div>
                <div
                  style={{
                    backgroundColor: panelBoxColor,
                    border: `1px solid ${panelBoxBorder}`,
                    borderRadius: "12px",
                    padding: "12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <img src={panelImage} alt="Brand" style={{ width: "100%", height: "120px", objectFit: "contain", display: "block", borderRadius: "8px" }} />
                  <span style={{ fontSize: "14px", fontWeight: 700, fontFamily: FONT_FAMILY, color: titleTextColor }}>
                    Brand Assets
                  </span>
                  <p style={{ fontSize: "12px", lineHeight: 1.5, color: descriptionTextColor, margin: 0, fontFamily: FONT_FAMILY }}>
                    Logos, color palettes, and visual identity.
                  </p>
                </div>
              </>
            ) : (
              <div
                style={{
                  backgroundColor: panelBoxColor,
                  border: `1px solid ${panelBoxBorder}`,
                  borderRadius: "12px",
                  padding: "14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
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
const LeftNavbar = () => {
  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        left: "60px",
        zIndex: 9000,
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontFamily: FONT_FAMILY,
      }}
    >
      <Link
        href="/"
        style={{
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginRight: "16px",
        }}
      >
        <img
          src="/images/nop.jpg"
          alt="Menuru"
          style={{
            height: "60px",
            width: "auto",
            maxWidth: "none",
            objectFit: "contain",
            display: "block",
            flexShrink: 0,
            mixBlendMode: "multiply",
          }}
        />
        <span
          style={{
            color: BLUE,
            fontSize: "60px",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            fontFamily: FONT_FAMILY,
            lineHeight: 1,
            whiteSpace: "nowrap",
          }}
        >
          Menuru
        </span>
      </Link>

      <NavbarButton
        label="Teams"
        panelTitle="Trust"
        panelDescription="Your security and privacy are our top priorities with end-to-end encryption."
        panelImage="/images/p0l.jpg"
        panelRightTitle="Why Trust Us"
        panelRightDescription="Our systems are monitored 24/7 to protect your data."
        iconType="trust"
        bigPanelWidth={850}
        bigPanelHeight={260}
      />
      <NavbarButton
        label="Individual"
        panelTitle="Careers"
        panelDescription="Join our team and build a meaningful career in a supportive environment."
        panelImage="/images/xxz.jpg"
        panelRightTitle="Life at Menuru"
        panelRightDescription="A collaborative, flexible work culture with plenty of opportunities to grow together."
        iconType="career"
        bigPanelWidth={850}
        bigPanelHeight={260}
      />
      <NavbarButton
        label="Resources"
        panelTitle="Docs & Brand"
        panelDescription="Access complete documentation and Menuru brand assets in one place."
        panelImage="/images/p0l.jpg"
        panelRightTitle="Docs & Brand"
        panelRightDescription="Guides, visual assets, and official Menuru brand references."
        iconType="resources"
        iconComponent={<StriperIcon size={22} color="#ffffff" />}
        bigPanelWidth={850}
        bigPanelHeight={340}
        buttonColor="#0D3CFC"
        buttonHoverColor="#0D3CFC"
        panelColor="#000000"
        iconButtonColor="#000000"
        iconButtonHoverColor="#000000"
        panelBoxColor="rgba(255,255,255,0.12)"
        panelBoxBorder="rgba(255,255,255,0.25)"
        labelTextColor="#ffffff"
        labelTextHoverColor="#ffffff"
        titleTextColor="#ffffff"
        descriptionTextColor="rgba(255,255,255,0.92)"
        isResources={true}
      />
    </div>
  );
};

// ===== RIGHT NAVBAR =====
const RightNavbar = ({
  user,
  auth,
  db,
  userDisplayName,
  router,
  onSayHeyToggle,
  sayHeyOpen,
}: {
  user: any;
  auth: any;
  db: any;
  userDisplayName: string;
  router: any;
  onSayHeyToggle: () => void;
  sayHeyOpen: boolean;
}) => {
  const displayName = userDisplayName || user?.displayName || user?.email?.split("@")[0] || "User";
  const photoURL = user?.photoURL || "";

  const handleLogout = async () => {
    if (!auth) return;
    try {
      if (db && user) {
        await updateDoc(doc(db, "users", user.uid), {
          online: false,
          lastSeen: serverTimestamp(),
        });
      }
      await signOut(auth);
      router.push("/notes");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const SayHeyButton = () => (
    <button
      onClick={onSayHeyToggle}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px 18px",
        backgroundColor: sayHeyOpen ? BLACK : LIME,
        borderRadius: "10px",
        border: `1px solid ${sayHeyOpen ? BLACK : LIME}`,
        boxShadow: sayHeyOpen ? "0 8px 24px rgba(0,0,0,0.35)" : "0 8px 24px rgba(227,251,150,0.45)",
        cursor: "pointer",
        transition: "all 0.2s ease",
      }}
    >
      <SayHeyIcon size={18} color={sayHeyOpen ? WHITE : BLACK} />
      <span
        style={{
          color: sayHeyOpen ? WHITE : BLACK,
          fontSize: "14px",
          fontWeight: 700,
          letterSpacing: "0.02em",
          fontFamily: FONT_FAMILY,
          whiteSpace: "nowrap",
        }}
      >
        Say Hey
      </span>
      <NorthEastArrow size={16} color={sayHeyOpen ? WHITE : BLACK} />
    </button>
  );

  if (!user) {
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
          fontFamily: FONT_FAMILY,
        }}
      >
        <SayHeyButton />
        <Link
          href="/signin"
          style={{
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 18px 10px 16px",
            backgroundColor: BLUE,
            borderRadius: "10px",
            border: `1px solid ${BLUE}`,
            boxShadow: "0 8px 24px rgba(13,60,252,0.35)",
            cursor: "pointer",
          }}
        >
          <PeopleIcon size={20} color="#ffffff" />
          <span
            style={{
              color: "#ffffff",
              fontSize: "14px",
              fontWeight: 700,
              letterSpacing: "0.02em",
              fontFamily: FONT_FAMILY,
              whiteSpace: "nowrap",
            }}
          >
            Sign In
          </span>
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "24px",
        zIndex: 9000,
        fontFamily: FONT_FAMILY,
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}
    >
      <SayHeyButton />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "10px 16px",
          backgroundColor: BLUE,
          borderRadius: "10px",
          border: `1px solid ${BLUE}`,
          boxShadow: "0 8px 24px rgba(13,60,252,0.35)",
        }}
      >
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
          {photoURL ? (
            <img
              src={photoURL}
              alt={displayName}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              referrerPolicy="no-referrer"
            />
          ) : (
            <span style={{ fontSize: "16px", fontWeight: 800, color: BLUE }}>
              {displayName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <span
          style={{
            color: WHITE,
            fontSize: "14px",
            fontWeight: 700,
            letterSpacing: "0.02em",
            fontFamily: FONT_FAMILY,
            whiteSpace: "nowrap",
          }}
        >
          {displayName}
        </span>
      </div>
      <button
        onClick={handleLogout}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "10px 16px",
          backgroundColor: BLUE,
          color: WHITE,
          borderRadius: "10px",
          border: `1px solid ${BLUE}`,
          boxShadow: "0 8px 24px rgba(13,60,252,0.35)",
          fontFamily: FONT_FAMILY,
          fontSize: "14px",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Logout
        <LogoutIcon size={16} color={WHITE} />
      </button>
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
      split = new SplitText(title, { type: "chars", charsClass: "footer-menuru-char" });

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
          fontWeight: 400,
          color: BLUE,
          letterSpacing: "-0.05em",
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
  );
};

// ===== FOOTER LINKS =====
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

// ===== FOOTER COMPONENT =====
const FooterSection = () => (
  <>
    <div
      style={{
        width: "100%",
        padding: "60px 40px 40px 40px",
        backgroundColor: WHITE,
        borderTop: "1px solid rgba(0,0,0,0.05)",
        marginTop: "100px",
        position: "relative",
        overflow: "hidden",
      }}
    >
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
                  linkHref = "/notfounds";
                  isAttention = true;
                } else if (link === "Cookies Policy") {
                  linkHref = "/notfounds";
                  isAttention = true;
                } else if (link === "Stories") {
                  linkHref = "/notfounds";
                  isStories = true;
                } else if (link === "Shop") linkHref = "/notfounds";
                else if (link === "Note") linkHref = "/notes";
                else if (link === "Calendar") linkHref = "/notfounds";
                else if (link === "Blog") linkHref = "/notfounds";
                else if (link === "Donation") linkHref = "/notfounds";
                else if (link === "Community") linkHref = "/notfounds";
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
  </>
);

// ===== TOPIC DROPDOWN =====
const TopicDropdown = ({ categories, notesByCategory, selectedTopic, onSelectTopic }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const getNoteCount = (category: string) => notesByCategory[category]?.length || 0;
  const activeCategories = categories.filter((cat: string) => getNoteCount(cat) > 0);
  
  if (activeCategories.length === 0) return null;
  
  return (
    <div style={{ position: 'relative', width: '300px' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '16px 20px',
          backgroundColor: BLUE,
          border: `1px solid ${BLUE}`,
          borderRadius: '8px',
          color: 'white',
          fontSize: '18px',
          fontFamily: FONT_FAMILY,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          outline: 'none'
        }}
      >
        <span>{selectedTopic || 'Pilih Topik Catatan'}</span>
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '4px',
          backgroundColor: BLUE,
          border: `1px solid ${BLUE}`,
          borderRadius: '8px',
          overflow: 'hidden',
          zIndex: 1000
        }}>
          <button
            onClick={() => { onSelectTopic(''); setIsOpen(false); }}
            style={{
              width: '100%',
              padding: '16px 20px',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: `1px solid rgba(255,255,255,0.1)`,
              color: !selectedTopic ? 'white' : 'rgba(255,255,255,0.6)',
              fontSize: '16px',
              fontFamily: FONT_FAMILY,
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span>Semua Topik</span>
            <span style={{
              backgroundColor: WHITE,
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '14px',
              color: BLUE,
              fontWeight: 700
            }}>
              {Object.keys(notesByCategory).reduce((acc, cat) => acc + notesByCategory[cat].length, 0)}
            </span>
          </button>
          
          {activeCategories.map((category: string) => (
            <button
              key={category}
              onClick={() => { onSelectTopic(category); setIsOpen(false); }}
              style={{
                width: '100%',
                padding: '16px 20px',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: `1px solid rgba(255,255,255,0.1)`,
                color: selectedTopic === category ? 'white' : 'rgba(255,255,255,0.6)',
                fontSize: '16px',
                fontFamily: FONT_FAMILY,
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span>{category}</span>
              <span style={{
                backgroundColor: WHITE,
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '14px',
                color: BLUE,
                fontWeight: 700
              }}>
                {getNoteCount(category)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ===== COLLABORATE BADGE =====
const CollaborateBadge = () => (
  <div style={{
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    backgroundColor: BLUE,
    borderRadius: '20px',
    fontSize: '12px',
    color: WHITE,
    letterSpacing: '0.3px',
    marginLeft: '10px',
    fontWeight: 700
  }}>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2z"/>
      <path d="M12 6v6l4 2"/>
    </svg>
    Kolaborasi
  </div>
);

// ===== COLLABORATOR LIST =====
const CollaboratorList = ({ collaborators = [], collaboratorNames = {} }: any) => {
  if (!collaborators || collaborators.length === 0) return null;
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '15px' }}>
      <span style={{
        fontSize: '16px', color: BLUE, fontWeight: '600', fontFamily: FONT_FAMILY,
      }}>
        Kolaborator:
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
        {Object.entries(collaboratorNames || {}).map(([id, name]: any) => (
          <div
            key={id}
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              fontSize: '16px', color: BLUE,
              fontFamily: FONT_FAMILY, fontWeight: 600
            }}
          >
            <span>{name}</span>
            <InstagramVerifiedBadge size={14} />
          </div>
        ))}
      </div>
    </div>
  );
};

// ===== INTERFACES =====
interface Note {
  id?: string;
  title: string;
  category: string;
  link: string;
  description: string;
  userId: string;
  userName: string;
  userEmail: string;
  createdAt: any;
  updatedAt: any;
  savedBy?: string[];
  thumbnail?: string;
  collaborators?: string[];
  collaboratorNames?: {[key: string]: string};
  isCollaborative?: boolean;
}

interface Group {
  id?: string;
  name: string;
  ownerId: string;
  ownerName: string;
  members: string[];
  memberNames?: {[key: string]: string};
  createdAt: any;
}

interface Notification {
  id?: string;
  type: 'group_invite' | 'collaborate_invite';
  groupId?: string;
  groupName?: string;
  noteId?: string;
  noteTitle?: string;
  senderId: string;
  senderName: string;
  senderEmail?: string;
  receiverId: string;
  receiverName?: string;
  receiverEmail?: string;
  status: 'pending' | 'accepted' | 'rejected';
  message: string;
  createdAt: any;
}

export default function NotesPage(): React.JSX.Element {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userDisplayName, setUserDisplayName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewNoteForm, setShowNewNoteForm] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCollaborateModal, setShowCollaborateModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showEditNoteModal, setShowEditNoteModal] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [sayHeyOpen, setSayHeyOpen] = useState(false);
  const [newNote, setNewNote] = useState({ title: "", category: "", link: "", description: "" });
  const [editNote, setEditNote] = useState({ title: "", category: "", link: "", description: "" });
  const [newGroupName, setNewGroupName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [collaborateEmail, setCollaborateEmail] = useState("");
  const [auth, setAuth] = useState<any>(null);
  const [db, setDb] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  
  const preloaderRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const mainPageRef = useRef<HTMLDivElement>(null);

  const categories = [
    "Makanan", "Minuman", "Fotografi", "Coding", "Desain",
    "Musik", "Film", "Buku", "Olahraga", "Travel",
    "Pendidikan", "Bisnis", "Kesehatan", "Teknologi", "Hobi"
  ];

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      let app;
      if (getApps().length === 0) {
        app = initializeApp(firebaseConfig);
      } else {
        app = getApps()[0];
      }
      setAuth(getAuth(app));
      setDb(getFirestore(app));
    } catch (error) {
      console.error('Firebase initialization error:', error);
    }
  }, []);

  // LOAD NOTES MILIK SENDIRI + COLLABORATIVE (TIDAK CAMPUR)
  useEffect(() => {
    if (!db || !isMounted || !user) {
      setNotes([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribes: (() => void)[] = [];

    try {
      // Load notes milik user
      const ownNotesQ = query(
        collection(db, 'userNotes'),
        where('userId', '==', user.uid),
        orderBy('updatedAt', 'desc')
      );

      const unsub1 = onSnapshot(ownNotesQ, (snap: any) => {
        const ownNotes: Note[] = [];
        snap.forEach((docSnap: any) => {
          ownNotes.push({ id: docSnap.id, ...docSnap.data() });
        });

        // Load collaborative notes (notes yang user diundang)
        const collabNotesQ = query(
          collection(db, 'userNotes'),
          where('collaborators', 'array-contains', user.uid)
        );

        getDocs(collabNotesQ).then((collabSnap) => {
          const collabNotes: Note[] = [];
          collabSnap.forEach((docSnap: any) => {
            if (!ownNotes.some(n => n.id === docSnap.id)) {
              collabNotes.push({
                id: docSnap.id,
                ...docSnap.data(),
                isCollaborative: true
              });
            }
          });

          setNotes([...ownNotes, ...collabNotes]);
          setIsLoading(false);
        }).catch((err) => {
          console.error("Error loading collab notes:", err);
          setNotes(ownNotes);
          setIsLoading(false);
        });
      });

      unsubscribes.push(unsub1);
    } catch (error) {
      console.error("Error loading notes:", error);
      setIsLoading(false);
    }

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, [db, isMounted, user]);

  // AUTH STATE
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const name = currentUser.displayName || currentUser.email?.split('@')[0] || 'User';
        const email = currentUser.email || '';
        setUserDisplayName(name);
        setUserEmail(email);
        await saveUserToFirestore(currentUser.uid, name, email);
        loadUserGroups(currentUser.uid);
        loadUserNotifications(currentUser.uid);
      } else {
        setUser(null);
        setUserDisplayName("");
        setUserEmail("");
        setNotes([]);
      }
      setAuthReady(true);
      setLoading(false);
    });
    return () => { if (unsubscribe) unsubscribe(); };
  }, [auth]);

  // PRELOADER ANIMATION
  useEffect(() => {
    if (!isMounted || loading) return;
    let killed = false;
    const preloaderEl = preloaderRef.current;
    const textEl = textRef.current;
    const counterEl = counterRef.current;
    const mainEl = mainPageRef.current;
    if (!preloaderEl || !textEl || !counterEl || !mainEl) return;

    gsap.set(textEl, { y: 100, opacity: 0 });
    gsap.set(counterEl, { opacity: 1, scale: 1, y: 0, xPercent: 0 });
    gsap.set(preloaderEl, { opacity: 1, scale: 1, xPercent: 0, display: "block" });
    gsap.set(mainEl, { xPercent: 100, opacity: 1, display: "flex" });

    const counterObj = { value: 1 };
    counterEl.textContent = "01";
    const tl = gsap.timeline();

    tl.to(textEl, { y: 0, opacity: 1, duration: 1.0, ease: "back.out(1.7)" })
      .to(textEl, { duration: 0.8 })
      .to(textEl, {
        opacity: 0, y: -20, scale: 0.9, duration: 0.5, ease: "power2.out",
        onComplete: () => { if (textEl) textEl.textContent = "Note"; },
      })
      .to(textEl, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "back.out(1.7)" })
      .to(textEl, { duration: 1.2 });

    tl.to(counterObj, {
      value: 100, duration: 6.5, ease: "power2.inOut",
      onUpdate: () => {
        if (counterEl) {
          const val = Math.round(counterObj.value);
          counterEl.textContent = String(val).padStart(2, "0");
        }
      },
    }, 0);

    tl.to(textEl, { scale: 0.3, opacity: 0, duration: 0.8, ease: "power2.in" })
      .to(counterEl, { scale: 0.6, opacity: 0, duration: 0.8, ease: "power2.in" }, "-=0.8")
      .to(preloaderEl, {
        xPercent: -100, duration: 1.2, ease: "power3.inOut",
        onComplete: () => { if (preloaderEl) preloaderEl.style.display = "none"; },
      }, "-=0.2")
      .to(mainEl, {
        xPercent: 0, duration: 1.2, ease: "power3.inOut",
        onComplete: () => {
          if (killed) return;
          gsap.set(mainEl, { clearProps: "transform,willChange" });
          setTimeout(() => ScrollTrigger.refresh(), 300);
        },
      }, "<");

    return () => { killed = true; tl.kill(); };
  }, [isMounted, loading]);

  const saveUserToFirestore = async (userId: string, name: string, email: string) => {
    if (!db) return;
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      const userData = {
        id: userId, name, displayName: name, email: email.toLowerCase(),
        online: true, lastSeen: serverTimestamp(), updatedAt: serverTimestamp()
      };
      if (!userSnap.exists()) {
        await setDoc(userRef, { ...userData, createdAt: serverTimestamp() });
      } else {
        await updateDoc(userRef, userData);
      }
    } catch (error) {
      console.error("Error saving user to Firestore:", error);
    }
  };

  const loadUserGroups = async (userId: string) => {
    if (!db) return;
    try {
      const q = query(collection(db, 'groups'), where('members', 'array-contains', userId));
      const unsubscribe = onSnapshot(q, (querySnapshot: any) => {
        const groupsData: Group[] = [];
        querySnapshot.forEach((docSnap: any) => {
          groupsData.push({ id: docSnap.id, ...docSnap.data() });
        });
        setGroups(groupsData);
        if (groupsData.length > 0 && !currentGroup) setCurrentGroup(groupsData[0]);
      });
      return unsubscribe;
    } catch (error) {
      console.error("Error loading groups:", error);
    }
  };

  const loadUserNotifications = (userId: string) => {
    if (!db) return;
    try {
      const q = query(
        collection(db, 'notifications'),
        where('receiverId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const unsubscribe = onSnapshot(q, async (querySnapshot: any) => {
        const notificationsData: Notification[] = [];
        for (const docSnap of querySnapshot.docs) {
          notificationsData.push({ id: docSnap.id, ...docSnap.data() });
        }
        setNotifications(notificationsData);
      });
      return unsubscribe;
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  const requireLogin = (action: string) => {
    if (!user) {
      if (confirm(`Anda perlu login untuk ${action}. Login sekarang?`)) {
        router.push('/signin');
      }
      return false;
    }
    return true;
  };

  const handleCreateGroup = async () => {
    if (!requireLogin("membuat grup")) return;
    if (!db || !newGroupName.trim()) { alert("Nama grup harus diisi"); return; }
    try {
      await addDoc(collection(db, 'groups'), {
        name: newGroupName.trim(),
        ownerId: user.uid,
        ownerName: userDisplayName,
        members: [user.uid],
        memberNames: { [user.uid]: userDisplayName },
        createdAt: serverTimestamp()
      });
      setNewGroupName("");
      setShowGroupModal(false);
      alert("Grup berhasil dibuat!");
    } catch (error) {
      console.error("Error creating group:", error);
      alert("Gagal membuat grup. Silakan coba lagi.");
    }
  };

  const findUserByEmail = async (email: string) => {
    if (!db || !email) return null;
    try {
      const q = query(collection(db, 'users'), where('email', '==', email.toLowerCase()));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error("Error finding user:", error);
      return null;
    }
  };

  const createUserRecord = async (email: string, name?: string) => {
    if (!db) return null;
    try {
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await setDoc(doc(db, 'users', userId), {
        id: userId,
        email: email.toLowerCase(),
        name: name || email.split('@')[0],
        displayName: name || email.split('@')[0],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return userId;
    } catch (error) {
      console.error("Error creating user record:", error);
      return null;
    }
  };

  const handleInviteCollaborator = async () => {
    if (!requireLogin("mengundang kolaborator")) return;
    if (!db || !currentNote || !collaborateEmail.trim()) { alert("Email harus diisi"); return; }
    try {
      const invitedUser = await findUserByEmail(collaborateEmail.trim());
      let invitedUserId = invitedUser?.id;
      let invitedUserName = invitedUser?.name || collaborateEmail.split('@')[0];
      if (!invitedUser) {
        invitedUserId = await createUserRecord(collaborateEmail.trim());
        if (!invitedUserId) { alert("Gagal membuat user record"); return; }
        invitedUserName = collaborateEmail.split('@')[0];
      }
      if (currentNote.collaborators && currentNote.collaborators.includes(invitedUserId)) {
        alert("User sudah menjadi kolaborator catatan ini");
        return;
      }
      await addDoc(collection(db, 'notifications'), {
        type: 'collaborate_invite',
        noteId: currentNote.id,
        noteTitle: currentNote.title,
        senderId: user.uid,
        senderName: userDisplayName,
        senderEmail: userEmail,
        receiverId: invitedUserId,
        receiverEmail: collaborateEmail.trim().toLowerCase(),
        receiverName: invitedUserName,
        status: 'pending',
        message: `${userDisplayName} mengundang Anda untuk berkolaborasi pada catatan "${currentNote.title}"`,
        createdAt: serverTimestamp()
      });
      setCollaborateEmail("");
      setShowCollaborateModal(false);
      alert(`Undangan kolaborasi telah dikirim ke ${collaborateEmail}`);
    } catch (error) {
      console.error("Error inviting collaborator:", error);
      alert("Gagal mengundang kolaborator.");
    }
  };

  const handleInviteUser = async () => {
    if (!requireLogin("mengundang user")) return;
    if (!db || !currentGroup || !inviteEmail.trim()) { alert("Email harus diisi"); return; }
    try {
      const invitedUser = await findUserByEmail(inviteEmail.trim());
      let invitedUserId = invitedUser?.id;
      let invitedUserName = invitedUser?.name || inviteEmail.split('@')[0];
      if (!invitedUser) {
        invitedUserId = await createUserRecord(inviteEmail.trim());
        if (!invitedUserId) { alert("Gagal membuat user record"); return; }
        invitedUserName = inviteEmail.split('@')[0];
      }
      if (currentGroup.members.includes(invitedUserId)) {
        alert("User sudah menjadi anggota grup ini");
        return;
      }
      await addDoc(collection(db, 'notifications'), {
        type: 'group_invite',
        groupId: currentGroup.id,
        groupName: currentGroup.name,
        senderId: user.uid,
        senderName: userDisplayName,
        senderEmail: userEmail,
        receiverId: invitedUserId,
        receiverEmail: inviteEmail.trim().toLowerCase(),
        receiverName: invitedUserName,
        status: 'pending',
        message: `${userDisplayName} mengundang Anda untuk bergabung dengan grup "${currentGroup.name}"`,
        createdAt: serverTimestamp()
      });
      setInviteEmail("");
      setShowInviteModal(false);
      alert(`Undangan telah dikirim ke ${inviteEmail}`);
    } catch (error) {
      console.error("Error inviting user:", error);
      alert("Gagal mengundang user.");
    }
  };

  const handleNotificationResponse = async (notificationId: string, accept: boolean) => {
    if (!user || !db) return;
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      const notification = notifications.find(n => n.id === notificationId);
      if (!notification) return;
      await updateDoc(notificationRef, {
        status: accept ? 'accepted' : 'rejected',
        message: accept ? 
          notification.type === 'group_invite' ?
            `Anda telah menerima undangan ke grup "${notification.groupName}"` :
            `Anda telah menerima undangan kolaborasi untuk catatan "${notification.noteTitle}"` :
          notification.type === 'group_invite' ?
            `Anda telah menolak undangan ke grup "${notification.groupName}"` :
            `Anda telah menolak undangan kolaborasi untuk catatan "${notification.noteTitle}"`
      });
      if (accept) {
        if (notification.type === 'group_invite' && notification.groupId) {
          await updateDoc(doc(db, 'groups', notification.groupId), {
            members: arrayUnion(user.uid),
            [`memberNames.${user.uid}`]: userDisplayName
          });
          alert(`Anda telah bergabung dengan grup "${notification.groupName}"`);
          loadUserGroups(user.uid);
          await addDoc(collection(db, 'groupMessages'), {
            text: `${userDisplayName} telah bergabung ke grup melalui undangan dari ${notification.senderName}`,
            userId: 'system',
            userName: 'System',
            groupId: notification.groupId,
            type: 'text',
            createdAt: serverTimestamp()
          });
        } else if (notification.type === 'collaborate_invite' && notification.noteId) {
          await updateDoc(doc(db, 'userNotes', notification.noteId), {
            collaborators: arrayUnion(user.uid),
            [`collaboratorNames.${user.uid}`]: userDisplayName,
            isCollaborative: true
          });
          alert(`Anda sekarang dapat berkolaborasi pada catatan "${notification.noteTitle}"`);
        }
      }
      setTimeout(async () => {
        try { await deleteDoc(notificationRef); } catch (e) { console.error(e); }
      }, 3000);
    } catch (error) {
      console.error("Error responding to notification:", error);
      alert("Gagal memproses undangan.");
    }
  };

  const handleCreateNote = async () => {
    if (!requireLogin("membuat catatan")) return;
    if (!db || !newNote.title.trim()) { alert("Judul catatan harus diisi"); return; }
    try {
      await addDoc(collection(db, 'userNotes'), {
        title: newNote.title.trim(),
        category: newNote.category.trim(),
        link: newNote.link.trim(),
        description: newNote.description.trim(),
        userId: user.uid,
        userName: userDisplayName,
        userEmail: userEmail,
        thumbnail: generateThumbnail(newNote.link.trim()),
        savedBy: [],
        collaborators: [],
        collaboratorNames: {},
        isCollaborative: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setNewNote({ title: "", category: "", link: "", description: "" });
      setShowNewNoteForm(false);
    } catch (error) {
      console.error("Error creating note:", error);
      alert("Gagal membuat catatan. Silakan coba lagi.");
    }
  };

  const handleEditNote = async () => {
    if (!user || !db || !currentNote) return;
    try {
      await updateDoc(doc(db, 'userNotes', currentNote.id!), {
        title: editNote.title.trim() || currentNote.title,
        category: editNote.category.trim() || currentNote.category,
        link: editNote.link.trim() || currentNote.link,
        description: editNote.description.trim() || currentNote.description,
        updatedAt: serverTimestamp()
      });
      setShowEditNoteModal(false);
      setCurrentNote(null);
      alert("Catatan berhasil diperbarui!");
    } catch (error) {
      console.error("Error editing note:", error);
      alert("Gagal mengedit catatan.");
    }
  };

  const generateThumbnail = (link: string): string => {
    if (!link) return "";
    try {
      const url = new URL(link);
      if (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
        const videoId = url.searchParams.get('v') || url.pathname.split('/').pop();
        if (videoId) return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
      if (url.hostname.includes('vimeo.com')) {
        const videoId = url.pathname.split('/').pop();
        if (videoId) return `https://i.vimeocdn.com/video/${videoId}_640.jpg`;
      }
      return "";
    } catch { return ""; }
  };

  const handleSaveNote = async (noteId: string) => {
    if (!requireLogin("menyimpan catatan")) return;
    try {
      await updateDoc(doc(db, 'userNotes', noteId), { savedBy: arrayUnion(user.uid) });
      alert("Catatan berhasil disimpan!");
    } catch (error) {
      console.error("Error saving note:", error);
      alert("Gagal menyimpan catatan.");
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!user || !db) return;
    if (confirm("Apakah Anda yakin ingin menghapus catatan ini?")) {
      try { await deleteDoc(doc(db, 'userNotes', noteId)); } 
      catch (error) { console.error(error); alert("Gagal menghapus catatan."); }
    }
  };

  const handleShareToGroup = async (noteId: string) => {
    if (!requireLogin("berbagi catatan")) return;
    if (!currentGroup) { alert("Pilih grup terlebih dahulu untuk berbagi"); return; }
    try {
      const note = notes.find(n => n.id === noteId);
      if (!note) return;
      await addDoc(collection(db, 'groupMessages'), {
        text: note.description || "Catatan yang dibagikan",
        userId: user.uid,
        userName: userDisplayName,
        groupId: currentGroup.id,
        type: 'link',
        link: note.link || "",
        thumbnail: note.thumbnail || "",
        title: note.title,
        createdAt: serverTimestamp()
      });
      alert(`Catatan berhasil dibagikan ke grup "${currentGroup.name}"`);
    } catch (error) {
      console.error("Error sharing note:", error);
      alert("Gagal membagikan catatan.");
    }
  };

  const getVideoEmbedUrl = (link: string) => {
    if (!link) return null;
    try {
      const url = new URL(link);
      if (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
        const videoId = url.searchParams.get('v') || url.pathname.split('/').pop();
        if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&showinfo=0`;
      }
      if (url.hostname.includes('vimeo.com')) {
        const videoId = url.pathname.split('/').pop();
        if (videoId) return `https://player.vimeo.com/video/${videoId}?autoplay=0&title=0&byline=0&portrait=0`;
      }
      if (link.match(/\.(mp4|webm|ogg|mov|avi|wmv|flv|mkv)$/i)) return link;
      return null;
    } catch { return null; }
  };

  const togglePlayPause = (noteId: string) => {
    const video = videoRefs.current[noteId];
    if (video) { video.paused ? video.play() : video.pause(); }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Baru saja";
    const date = timestamp.toDate();
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Hari ini";
    else if (diffDays === 1) return "Kemarin";
    else if (diffDays < 7) return `${diffDays} hari lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const canEditNote = (note: Note) => {
    if (!user) return false;
    return note.userId === user?.uid || (note.collaborators && note.collaborators.includes(user?.uid));
  };

  const isNoteOwner = (note: Note) => {
    if (!user) return false;
    return note.userId === user?.uid;
  };

  const pendingNotifications = notifications.filter(n => n.status === 'pending');
  const notificationCount = pendingNotifications.length;

  const notesByCategory = notes.reduce((acc, note) => {
    const category = note.category || "Lainnya";
    if (!acc[category]) acc[category] = [];
    acc[category].push(note);
    return acc;
  }, {} as { [key: string]: Note[] });

  const filteredNotes = selectedTopic ? notesByCategory[selectedTopic] || [] : notes;

  if (!auth || !db || !isMounted || !authReady) {
    return (
      <div style={{
        minHeight: '100vh', backgroundColor: WHITE,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: BLUE, fontFamily: FONT_FAMILY, fontSize: '20px', fontWeight: 700
      }}>
        Loading...
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Menuru Notes | My Notes</title>
        <meta name="description" content="Notes for the next era of technology system" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content={BLUE} />
      </Head>

      <div style={{ position: "relative", width: "100%", minHeight: "100vh", overflow: "hidden", backgroundColor: WHITE }}>
        {/* PRELOADER */}
        <div
          ref={preloaderRef}
          style={{
            position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
            backgroundColor: WHITE, zIndex: 9999, fontFamily: FONT_FAMILY,
            overflow: "hidden", willChange: "transform",
          }}
        >
          <span ref={counterRef} style={{
            position: "absolute", top: "10px", right: "40px",
            fontSize: "400px", fontWeight: 400, color: BLUE,
            fontFamily: FONT_FAMILY, letterSpacing: "-0.04em", lineHeight: 0.9,
            display: "inline-block", willChange: "transform, opacity",
            userSelect: "none", pointerEvents: "none",
          }}>01</span>

          <div style={{
            position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "40px", overflow: "hidden" }}>
              <span style={{
                fontSize: "100px", fontWeight: 400, color: BLUE,
                fontFamily: FONT_FAMILY, letterSpacing: "-0.03em",
              }}>Menuru</span>
              <span ref={textRef} style={{
                fontSize: "50px", fontWeight: 600, color: BLACK,
                fontFamily: FONT_FAMILY, letterSpacing: "-0.02em",
                display: "inline-block", willChange: "transform, opacity",
              }}>Note</span>
            </div>
          </div>
        </div>

        {/* MAIN PAGE */}
        <div ref={mainPageRef} style={{
          position: "relative", width: "100%", minHeight: "100vh",
          backgroundColor: WHITE, margin: 0, padding: 0,
          fontFamily: FONT_FAMILY, overflow: "visible",
          display: "flex", flexDirection: "column", willChange: "transform",
        }}>
          <div style={{
            position: "fixed", top: 0, left: 0, width: "200px", height: "120px",
            pointerEvents: "none", zIndex: 8500,
            backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
            maskImage: "linear-gradient(to right, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 100%)",
            WebkitMaskImage: "linear-gradient(to right, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 100%)",
          }} />
          <div style={{
            position: "fixed", top: 0, right: 0, width: "200px", height: "120px",
            pointerEvents: "none", zIndex: 8500,
            backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
            maskImage: "linear-gradient(to left, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 100%)",
            WebkitMaskImage: "linear-gradient(to left, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 100%)",
          }} />

          <LeftNavbar />
          <RightNavbar
            user={user}
            auth={auth}
            db={db}
            userDisplayName={userDisplayName}
            router={router}
            onSayHeyToggle={() => setSayHeyOpen((prev) => !prev)}
            sayHeyOpen={sayHeyOpen}
          />

          {/* CONTENT */}
          <div style={{
            width: "100%", padding: "0 40px", maxWidth: "1600px",
            margin: "0 auto", marginTop: "180px",
            position: "relative", zIndex: 2,
          }}>
            {/* Judul Notes */}
            <h2 style={{
              fontFamily: FONT_FAMILY, fontSize: "150px", fontWeight: 700,
              color: BLUE, letterSpacing: "-0.04em", lineHeight: 1,
              margin: 0, marginBottom: "20px", textAlign: "left",
            }}>Notes</h2>

            {/* Deskripsi */}
            <p style={{
              fontFamily: FONT_FAMILY, fontSize: "20px", fontWeight: 500,
              color: BLACK, letterSpacing: "-0.01em", lineHeight: 1.6,
              margin: 0, marginBottom: "40px", maxWidth: "800px", textAlign: "left",
            }}>
              Temukan catatan-catatan menarik dari komunitas Menuru. Semua catatan dikategorikan untuk memudahkan Anda menjelajahi topik yang Anda minati.
            </p>

            {/* ===== LOGOUT STATE: HANYA DESKRIPSI + SURUH LOGIN ===== */}
            {!user ? (
              <div style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '80px 20px', marginTop: '40px',
                gap: '30px', textAlign: 'center',
              }}>
                <div style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: '40px',
                  fontWeight: 700,
                  color: BLUE,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                  maxWidth: '800px',
                }}>
                  Silakan login terlebih dahulu untuk melihat catatan Anda
                </div>
                <p style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: '20px',
                  fontWeight: 500,
                  color: BLACK,
                  letterSpacing: '-0.01em',
                  lineHeight: 1.6,
                  maxWidth: '700px',
                  margin: 0,
                }}>
                  Catatan bersifat pribadi — setiap user hanya dapat melihat catatan miliknya sendiri dan catatan yang dibagikan oleh kolaborator.
                </p>
                <Link
                  href="/signin"
                  style={{
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '18px 36px',
                    backgroundColor: BLUE,
                    color: WHITE,
                    borderRadius: '12px',
                    fontFamily: FONT_FAMILY,
                    fontSize: '20px',
                    fontWeight: 700,
                    letterSpacing: '-0.01em',
                    boxShadow: '0 12px 32px rgba(13,60,252,0.35)',
                    marginTop: '20px',
                  }}
                >
                  Sign In untuk Melanjutkan
                  <NorthEastArrow size={24} color={WHITE} />
                </Link>
              </div>
            ) : (
              <>
                {/* Actions row - hanya muncul kalau sudah login */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  flexWrap: 'wrap', gap: '20px', marginBottom: '40px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                    <TopicDropdown 
                      categories={categories}
                      notesByCategory={notesByCategory}
                      selectedTopic={selectedTopic}
                      onSelectTopic={setSelectedTopic}
                    />

                    <div style={{ position: 'relative' }}>
                      <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        style={{
                          backgroundColor: BLUE, border: 'none', color: WHITE,
                          padding: '12px 16px', cursor: 'pointer', fontSize: '20px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          borderRadius: '10px', position: 'relative',
                          fontFamily: FONT_FAMILY, fontWeight: 700, gap: '8px'
                        }}
                        title="Notifikasi"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
                        </svg>
                        Notifikasi
                        {notificationCount > 0 && (
                          <div style={{
                            position: 'absolute', top: '-5px', right: '-5px',
                            backgroundColor: WHITE, color: BLUE, borderRadius: '50%',
                            width: '22px', height: '22px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '12px', fontWeight: 'bold', border: `2px solid ${BLUE}`
                          }}>
                            {notificationCount}
                          </div>
                        )}
                      </button>

                      {showNotifications && (
                        <div style={{
                          position: 'absolute', top: '60px', right: 0,
                          backgroundColor: BLUE, border: `1px solid ${BLUE}`,
                          borderRadius: '12px', width: '400px', maxHeight: '500px',
                          overflowY: 'auto', zIndex: 1000,
                          boxShadow: '0 4px 20px rgba(13,60,252,0.4)'
                        }}>
                          <div style={{
                            padding: '20px', borderBottom: `1px solid rgba(255,255,255,0.2)`,
                            fontSize: '20px', fontWeight: 'bold', color: WHITE, fontFamily: FONT_FAMILY
                          }}>
                            Notifikasi ({notifications.length})
                          </div>
                          
                          {notifications.length === 0 ? (
                            <div style={{
                              padding: '30px', textAlign: 'center', color: WHITE,
                              fontSize: '18px', fontFamily: FONT_FAMILY, opacity: 0.8
                            }}>Tidak ada notifikasi</div>
                          ) : (
                            <div>
                              {notifications.map((notification) => (
                                <div key={notification.id} style={{
                                  padding: '20px',
                                  borderBottom: `1px solid rgba(255,255,255,0.1)`,
                                  backgroundColor: notification.status === 'pending' ? 'rgba(255,255,255,0.08)' : 'transparent'
                                }}>
                                  <div style={{
                                    fontSize: '16px', marginBottom: '10px',
                                    color: WHITE, fontFamily: FONT_FAMILY
                                  }}>{notification.message}</div>
                                  
                                  <div style={{
                                    fontSize: '13px', color: WHITE, opacity: 0.7,
                                    marginBottom: '10px', fontFamily: FONT_FAMILY
                                  }}>
                                    Dari: {notification.senderName || 'Unknown User'}<br />
                                    Waktu: {formatTime(notification.createdAt)}
                                  </div>
                                  
                                  {notification.status === 'pending' && (
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                      <button
                                        onClick={() => handleNotificationResponse(notification.id!, true)}
                                        style={{
                                          padding: '8px 20px', backgroundColor: WHITE,
                                          border: 'none', color: BLUE, borderRadius: '6px',
                                          cursor: 'pointer', fontSize: '14px', fontWeight: 'bold',
                                          fontFamily: FONT_FAMILY
                                        }}
                                      >Terima</button>
                                      <button
                                        onClick={() => handleNotificationResponse(notification.id!, false)}
                                        style={{
                                          padding: '8px 20px', backgroundColor: 'transparent',
                                          border: `1.5px solid ${WHITE}`, color: WHITE,
                                          borderRadius: '6px', cursor: 'pointer', fontSize: '14px',
                                          fontWeight: 'bold', fontFamily: FONT_FAMILY
                                        }}
                                      >Tolak</button>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => { if (requireLogin("membuat grup")) setShowGroupModal(true); }}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        padding: '12px 20px', backgroundColor: BLUE, color: WHITE,
                        border: 'none', borderRadius: '10px', fontFamily: FONT_FAMILY,
                        fontSize: '15px', fontWeight: 700, cursor: 'pointer',
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14"/>
                      </svg>
                      Buat Grup
                    </button>
                    <button
                      onClick={() => { if (requireLogin("membuat catatan")) setShowNewNoteForm(true); }}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        padding: '12px 20px', backgroundColor: BLUE, color: WHITE,
                        border: 'none', borderRadius: '10px', fontFamily: FONT_FAMILY,
                        fontSize: '15px', fontWeight: 700, cursor: 'pointer',
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14"/>
                      </svg>
                      Buat Catatan
                    </button>
                  </div>
                </div>

                {isLoading ? (
                  <div style={{
                    display: 'flex', justifyContent: 'center', padding: '100px',
                    fontSize: '26px', fontFamily: FONT_FAMILY, color: BLUE, fontWeight: 700
                  }}>Memuat catatan...</div>
                ) : filteredNotes.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '120px 20px', fontFamily: FONT_FAMILY }}>
                    <div style={{
                      fontSize: '32px', color: BLUE, marginBottom: '20px', fontWeight: 700
                    }}>
                      {selectedTopic ? `Belum ada catatan di topik ${selectedTopic}` : 'Belum ada catatan'}
                    </div>
                    <div style={{ fontSize: '20px', color: BLUE, fontWeight: 500 }}>
                      {selectedTopic ? 'Buat catatan pertama di topik ini' : 'Buat catatan pertama Anda'}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '80px', fontFamily: FONT_FAMILY }}>
                    {filteredNotes.map((note) => {
                      const videoEmbedUrl = getVideoEmbedUrl(note.link);
                      const isSaved = note.savedBy && user && note.savedBy.includes(user.uid);
                      const userCanEdit = canEditNote(note);
                      const userIsOwner = isNoteOwner(note);
                      
                      return (
                        <div key={note.id} style={{
                          display: 'flex', flexDirection: 'column', gap: '25px',
                          fontFamily: FONT_FAMILY, position: 'relative'
                        }}>
                          {note.category && (
                            <div style={{
                              fontSize: '28px', color: BLUE, marginBottom: '15px',
                              fontWeight: '700', fontFamily: FONT_FAMILY
                            }}>{note.category}</div>
                          )}

                          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                            <div style={{
                              fontSize: '48px', fontFamily: FONT_FAMILY,
                              lineHeight: '1.3', color: BLUE, fontWeight: '700'
                            }}>{note.title}</div>
                            {note.isCollaborative && <CollaborateBadge />}
                          </div>

                          {note.description && (
                            <div style={{
                              fontSize: '28px', fontFamily: FONT_FAMILY,
                              lineHeight: '1.6', color: BLACK, marginTop: '25px',
                              whiteSpace: 'pre-wrap'
                            }}>{note.description}</div>
                          )}

                          {note.thumbnail && !videoEmbedUrl && (
                            <div style={{ margin: '20px 0' }}>
                              <img src={note.thumbnail} alt="Thumbnail" style={{
                                width: '100%', maxWidth: '600px', height: 'auto', borderRadius: '8px'
                              }} />
                            </div>
                          )}

                          {videoEmbedUrl && (
                            <div style={{ margin: '30px 0', position: 'relative' }}>
                              {videoEmbedUrl.includes('youtube.com/embed') || videoEmbedUrl.includes('vimeo.com') ? (
                                <div style={{
                                  position: 'relative', paddingBottom: '56.25%', height: 0,
                                  overflow: 'hidden', backgroundColor: '#000', borderRadius: '8px'
                                }}>
                                  <iframe src={videoEmbedUrl} style={{
                                    position: 'absolute', top: 0, left: 0,
                                    width: '100%', height: '100%', border: 'none'
                                  }} allowFullScreen />
                                </div>
                              ) : (
                                <div style={{
                                  position: 'relative', backgroundColor: '#000',
                                  borderRadius: '8px', overflow: 'hidden'
                                }}>
                                  <video
                                    ref={(el) => { if (note.id) videoRefs.current[note.id] = el; }}
                                    src={videoEmbedUrl}
                                    style={{
                                      width: '100%', maxWidth: '600px', height: 'auto',
                                      aspectRatio: '16/9', backgroundColor: '#000', cursor: 'pointer'
                                    }}
                                    onClick={() => togglePlayPause(note.id!)}
                                    controls
                                  />
                                </div>
                              )}
                            </div>
                          )}

                          <CollaboratorList 
                            collaborators={note.collaborators}
                            collaboratorNames={note.collaboratorNames}
                          />

                          <div style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            marginTop: '30px', fontFamily: FONT_FAMILY,
                            flexWrap: 'wrap', gap: '15px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                              <span style={{
                                fontSize: '18px', color: BLUE, fontWeight: 600, fontFamily: FONT_FAMILY
                              }}>{formatDate(note.updatedAt)}</span>
                              <span style={{
                                fontSize: '16px', color: BLUE, display: 'flex',
                                alignItems: 'center', gap: '4px',
                                fontFamily: FONT_FAMILY, fontWeight: 600
                              }}>
                                oleh {note.userName}<InstagramVerifiedBadge />
                              </span>
                            </div>
                            
                            <div style={{
                              display: 'flex', alignItems: 'center', gap: '16px',
                              fontFamily: FONT_FAMILY, flexWrap: 'wrap'
                            }}>
                              <button
                                onClick={() => handleSaveNote(note.id!)}
                                style={{
                                  backgroundColor: 'transparent', border: 'none', color: BLUE,
                                  fontSize: '22px', cursor: 'pointer', padding: '5px',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  opacity: isSaved ? 0.5 : 1
                                }}
                                title={isSaved ? "Disimpan" : "Simpan Catatan"}
                              >
                                <svg width="22" height="22" viewBox="0 0 24 24" fill={isSaved ? BLUE : "none"} stroke={BLUE} strokeWidth="2">
                                  <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
                                </svg>
                              </button>

                              {groups.length > 0 && (
                                <button
                                  onClick={() => handleShareToGroup(note.id!)}
                                  style={{
                                    backgroundColor: 'transparent', border: 'none', color: BLUE,
                                    fontSize: '22px', cursor: 'pointer', padding: '5px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                  }}
                                  title="Bagikan ke Grup"
                                >
                                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2">
                                    <circle cx="18" cy="5" r="3"/>
                                    <circle cx="6" cy="12" r="3"/>
                                    <circle cx="18" cy="19" r="3"/>
                                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                                  </svg>
                                </button>
                              )}

                              {userIsOwner && (
                                <button
                                  onClick={() => { setCurrentNote(note); setShowCollaborateModal(true); }}
                                  style={{
                                    backgroundColor: 'transparent', border: 'none', color: BLUE,
                                    fontSize: '22px', cursor: 'pointer', padding: '5px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                  }}
                                  title="Undang Kolaborator"
                                >
                                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2">
                                    <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                                    <circle cx="8.5" cy="7" r="4"/>
                                    <line x1="20" y1="8" x2="20" y2="14"/>
                                    <line x1="23" y1="11" x2="17" y2="11"/>
                                  </svg>
                                </button>
                              )}

                              {userCanEdit && (
                                <button
                                  onClick={() => {
                                    setCurrentNote(note);
                                    setEditNote({
                                      title: note.title, category: note.category,
                                      link: note.link || '', description: note.description || ''
                                    });
                                    setShowEditNoteModal(true);
                                  }}
                                  style={{
                                    backgroundColor: 'transparent', border: 'none', color: BLUE,
                                    fontSize: '22px', cursor: 'pointer', padding: '5px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                  }}
                                  title="Edit Catatan"
                                >
                                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2">
                                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                                  </svg>
                                </button>
                              )}

                              {note.link && (
                                <a href={note.link} target="_blank" rel="noopener noreferrer" style={{
                                  color: BLUE, textDecoration: 'none', display: 'flex',
                                  alignItems: 'center', gap: '8px', fontSize: '16px',
                                  fontFamily: FONT_FAMILY, fontWeight: 700
                                }}>
                                  Buka Link
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2">
                                    <path d="M7 17l9.2-9.2M17 17V7H7"/>
                                  </svg>
                                </a>
                              )}
                              
                              {note.userId === user?.uid && (
                                <button
                                  onClick={() => handleDeleteNote(note.id!)}
                                  style={{
                                    backgroundColor: 'transparent', border: 'none', color: BLUE,
                                    fontSize: '32px', cursor: 'pointer', padding: '0',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    width: '32px', height: '32px'
                                  }}
                                  title="Hapus Catatan"
                                >×</button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          {/* ===== FOOTER DENGAN LABEL + BADGE ===== */}
          <FooterSection />
        </div>
      </div>

      {/* MODALS */}

      {showNewNoteForm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(13,60,252,0.95)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 10000, padding: '30px', fontFamily: FONT_FAMILY
        }}>
          <div style={{
            backgroundColor: WHITE, width: '100%', maxWidth: '700px',
            padding: '60px', borderRadius: '16px', fontFamily: FONT_FAMILY,
          }}>
            <div style={{ marginBottom: '50px' }}>
              <div style={{
                fontSize: '36px', marginBottom: '20px',
                color: BLUE, fontWeight: '700', fontFamily: FONT_FAMILY
              }}>Buat Catatan Baru</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <input
                type="text"
                value={newNote.title}
                onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                placeholder="Judul Catatan"
                style={{
                  width: '100%', padding: '20px', backgroundColor: 'transparent',
                  border: 'none', borderBottom: `2px solid ${BLUE}`,
                  color: BLUE, fontSize: '28px', outline: 'none',
                  fontFamily: FONT_FAMILY, fontWeight: 700
                }}
              />

              <select
                value={newNote.category}
                onChange={(e) => setNewNote({...newNote, category: e.target.value})}
                style={{
                  width: '100%', padding: '16px 20px', backgroundColor: BLUE,
                  border: 'none', color: WHITE, fontSize: '18px',
                  outline: 'none', fontFamily: FONT_FAMILY,
                  cursor: 'pointer', borderRadius: '10px', fontWeight: 600
                }}
              >
                <option value="">Pilih Kategori</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <input
                type="text"
                value={newNote.link}
                onChange={(e) => setNewNote({...newNote, link: e.target.value})}
                placeholder="Link Video/Gambar (YouTube, Vimeo, dll.)"
                style={{
                  width: '100%', padding: '16px 20px', backgroundColor: 'transparent',
                  border: `1.5px solid ${BLUE}`, borderRadius: '10px',
                  color: BLUE, fontSize: '16px', outline: 'none',
                  fontFamily: FONT_FAMILY, fontWeight: 600
                }}
              />

              <textarea
                value={newNote.description}
                onChange={(e) => setNewNote({...newNote, description: e.target.value})}
                placeholder="Deskripsi Catatan"
                rows={8}
                style={{
                  width: '100%', padding: '16px 20px', backgroundColor: 'transparent',
                  border: `1.5px solid ${BLUE}`, borderRadius: '10px',
                  color: BLUE, fontSize: '16px', outline: 'none',
                  fontFamily: FONT_FAMILY, resize: 'none',
                  lineHeight: '1.6', fontWeight: 500
                }}
              />

              <div style={{
                display: 'flex', justifyContent: 'flex-end',
                gap: '20px', marginTop: '30px',
              }}>
                <button
                  onClick={() => setShowNewNoteForm(false)}
                  style={{
                    padding: '14px 28px', backgroundColor: 'transparent',
                    border: `1.5px solid ${BLUE}`, borderRadius: '10px',
                    color: BLUE, fontSize: '16px', cursor: 'pointer',
                    fontFamily: FONT_FAMILY, fontWeight: 700
                  }}
                >Batal</button>
                <button
                  onClick={handleCreateNote}
                  style={{
                    padding: '14px 28px', backgroundColor: BLUE,
                    border: 'none', borderRadius: '10px', color: WHITE,
                    fontSize: '16px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '10px',
                    fontFamily: FONT_FAMILY, fontWeight: 700
                  }}
                >
                  Simpan Catatan
                  <NorthEastArrow size={18} color={WHITE} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditNoteModal && currentNote && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(13,60,252,0.95)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 10000, padding: '30px', fontFamily: FONT_FAMILY
        }}>
          <div style={{
            backgroundColor: WHITE, width: '100%', maxWidth: '700px',
            padding: '60px', borderRadius: '16px', fontFamily: FONT_FAMILY,
          }}>
            <div style={{ marginBottom: '50px' }}>
              <div style={{
                fontSize: '36px', marginBottom: '20px',
                color: BLUE, fontWeight: '700', fontFamily: FONT_FAMILY
              }}>Edit Catatan</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <input
                type="text"
                value={editNote.title}
                onChange={(e) => setEditNote({...editNote, title: e.target.value})}
                placeholder="Judul Catatan"
                style={{
                  width: '100%', padding: '20px', backgroundColor: 'transparent',
                  border: 'none', borderBottom: `2px solid ${BLUE}`,
                  color: BLUE, fontSize: '28px', outline: 'none',
                  fontFamily: FONT_FAMILY, fontWeight: 700
                }}
              />

              <select
                value={editNote.category}
                onChange={(e) => setEditNote({...editNote, category: e.target.value})}
                style={{
                  width: '100%', padding: '16px 20px', backgroundColor: BLUE,
                  border: 'none', color: WHITE, fontSize: '18px',
                  outline: 'none', fontFamily: FONT_FAMILY,
                  cursor: 'pointer', borderRadius: '10px', fontWeight: 600
                }}
              >
                <option value="">Pilih Kategori</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <input
                type="text"
                value={editNote.link}
                onChange={(e) => setEditNote({...editNote, link: e.target.value})}
                placeholder="Link Video/Gambar"
                style={{
                  width: '100%', padding: '16px 20px', backgroundColor: 'transparent',
                  border: `1.5px solid ${BLUE}`, borderRadius: '10px',
                  color: BLUE, fontSize: '16px', outline: 'none',
                  fontFamily: FONT_FAMILY, fontWeight: 600
                }}
              />

              <textarea
                value={editNote.description}
                onChange={(e) => setEditNote({...editNote, description: e.target.value})}
                placeholder="Deskripsi Catatan"
                rows={8}
                style={{
                  width: '100%', padding: '16px 20px', backgroundColor: 'transparent',
                  border: `1.5px solid ${BLUE}`, borderRadius: '10px',
                  color: BLUE, fontSize: '16px', outline: 'none',
                  fontFamily: FONT_FAMILY, resize: 'none',
                  lineHeight: '1.6', fontWeight: 500
                }}
              />

              <div style={{
                display: 'flex', justifyContent: 'flex-end',
                gap: '20px', marginTop: '30px',
              }}>
                <button
                  onClick={() => { setShowEditNoteModal(false); setCurrentNote(null); }}
                  style={{
                    padding: '14px 28px', backgroundColor: 'transparent',
                    border: `1.5px solid ${BLUE}`, borderRadius: '10px',
                    color: BLUE, fontSize: '16px', cursor: 'pointer',
                    fontFamily: FONT_FAMILY, fontWeight: 700
                  }}
                >Batal</button>
                <button
                  onClick={handleEditNote}
                  style={{
                    padding: '14px 28px', backgroundColor: BLUE,
                    border: 'none', borderRadius: '10px', color: WHITE,
                    fontSize: '16px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '10px',
                    fontFamily: FONT_FAMILY, fontWeight: 700
                  }}
                >
                  Update Catatan
                  <NorthEastArrow size={18} color={WHITE} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showGroupModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(13,60,252,0.95)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 10000, padding: '30px', fontFamily: FONT_FAMILY
        }}>
          <div style={{
            backgroundColor: WHITE, width: '100%', maxWidth: '500px',
            padding: '50px', borderRadius: '16px', fontFamily: FONT_FAMILY,
          }}>
            <div style={{ marginBottom: '40px' }}>
              <div style={{
                fontSize: '32px', marginBottom: '20px',
                color: BLUE, fontWeight: '700', fontFamily: FONT_FAMILY
              }}>Buat Grup Baru</div>
              <div style={{
                fontSize: '18px', color: BLUE,
                fontFamily: FONT_FAMILY, opacity: 0.8
              }}>Buat grup untuk berbagi catatan dengan teman-teman</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Nama Grup"
                style={{
                  width: '100%', padding: '16px 20px', backgroundColor: 'transparent',
                  border: `1.5px solid ${BLUE}`, borderRadius: '10px',
                  color: BLUE, fontSize: '18px', outline: 'none',
                  fontFamily: FONT_FAMILY, fontWeight: 600
                }}
              />

              <div style={{
                display: 'flex', justifyContent: 'flex-end',
                gap: '20px', marginTop: '30px'
              }}>
                <button
                  onClick={() => { setShowGroupModal(false); setNewGroupName(""); }}
                  style={{
                    padding: '14px 28px', backgroundColor: 'transparent',
                    border: `1.5px solid ${BLUE}`, borderRadius: '10px',
                    color: BLUE, fontSize: '16px', cursor: 'pointer',
                    fontFamily: FONT_FAMILY, fontWeight: 700
                  }}
                >Batal</button>
                <button
                  onClick={handleCreateGroup}
                  style={{
                    padding: '14px 28px', backgroundColor: BLUE,
                    border: 'none', borderRadius: '10px', color: WHITE,
                    fontSize: '16px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '10px',
                    fontFamily: FONT_FAMILY, fontWeight: 700
                  }}
                >
                  Buat Grup
                  <NorthEastArrow size={18} color={WHITE} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showInviteModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(13,60,252,0.95)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 10000, padding: '30px', fontFamily: FONT_FAMILY
        }}>
          <div style={{
            backgroundColor: WHITE, width: '100%', maxWidth: '500px',
            padding: '50px', borderRadius: '16px', fontFamily: FONT_FAMILY,
          }}>
            <div style={{ marginBottom: '40px' }}>
              <div style={{
                fontSize: '32px', marginBottom: '20px',
                color: BLUE, fontWeight: '700', fontFamily: FONT_FAMILY
              }}>Invite ke Grup</div>
              <div style={{
                fontSize: '18px', color: BLUE,
                fontFamily: FONT_FAMILY, opacity: 0.8
              }}>
                Undang user lain ke grup: <strong>{currentGroup?.name}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Email user yang ingin diundang"
                style={{
                  width: '100%', padding: '16px 20px', backgroundColor: 'transparent',
                  border: `1.5px solid ${BLUE}`, borderRadius: '10px',
                  color: BLUE, fontSize: '16px', outline: 'none',
                  fontFamily: FONT_FAMILY, fontWeight: 600
                }}
              />

              <div style={{
                display: 'flex', justifyContent: 'flex-end',
                gap: '20px', marginTop: '30px'
              }}>
                <button
                  onClick={() => { setShowInviteModal(false); setInviteEmail(""); }}
                  style={{
                    padding: '14px 28px', backgroundColor: 'transparent',
                    border: `1.5px solid ${BLUE}`, borderRadius: '10px',
                    color: BLUE, fontSize: '16px', cursor: 'pointer',
                    fontFamily: FONT_FAMILY, fontWeight: 700
                  }}
                >Batal</button>
                <button
                  onClick={handleInviteUser}
                  style={{
                    padding: '14px 28px', backgroundColor: BLUE,
                    border: 'none', borderRadius: '10px', color: WHITE,
                    fontSize: '16px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '10px',
                    fontFamily: FONT_FAMILY, fontWeight: 700
                  }}
                >
                  Kirim Undangan
                  <NorthEastArrow size={18} color={WHITE} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCollaborateModal && currentNote && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(13,60,252,0.95)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 10000, padding: '30px', fontFamily: FONT_FAMILY
        }}>
          <div style={{
            backgroundColor: WHITE, width: '100%', maxWidth: '500px',
            padding: '50px', borderRadius: '16px', fontFamily: FONT_FAMILY,
          }}>
            <div style={{ marginBottom: '40px' }}>
              <div style={{
                fontSize: '32px', marginBottom: '20px',
                color: BLUE, fontWeight: '700', fontFamily: FONT_FAMILY
              }}>Undang Kolaborator</div>
              <div style={{
                fontSize: '18px', color: BLUE,
                fontFamily: FONT_FAMILY, opacity: 0.8
              }}>
                Undang user lain untuk berkolaborasi pada catatan:<br />
                <strong>"{currentNote.title}"</strong>
              </div>
              
              {currentNote.collaborators && currentNote.collaborators.length > 0 && (
                <div style={{
                  marginTop: '20px', padding: '15px',
                  backgroundColor: 'rgba(13,60,252,0.08)', borderRadius: '8px'
                }}>
                  <div style={{
                    fontSize: '14px', color: BLUE,
                    marginBottom: '10px', fontFamily: FONT_FAMILY, fontWeight: 600
                  }}>Kolaborator saat ini:</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {Object.entries(currentNote.collaboratorNames || {}).map(([id, name]: any) => (
                      <div key={id} style={{
                        display: 'flex', alignItems: 'center',
                        gap: '4px', fontSize: '14px',
                        color: BLUE, fontFamily: FONT_FAMILY, fontWeight: 600
                      }}>
                        <span>{name}</span>
                        <InstagramVerifiedBadge size={14} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <input
                type="email"
                value={collaborateEmail}
                onChange={(e) => setCollaborateEmail(e.target.value)}
                placeholder="Email user yang ingin diundang"
                style={{
                  width: '100%', padding: '16px 20px', backgroundColor: 'transparent',
                  border: `1.5px solid ${BLUE}`, borderRadius: '10px',
                  color: BLUE, fontSize: '16px', outline: 'none',
                  fontFamily: FONT_FAMILY, fontWeight: 600
                }}
              />

              <div style={{
                display: 'flex', justifyContent: 'flex-end',
                gap: '20px', marginTop: '30px'
              }}>
                <button
                  onClick={() => {
                    setShowCollaborateModal(false);
                    setCollaborateEmail("");
                    setCurrentNote(null);
                  }}
                  style={{
                    padding: '14px 28px', backgroundColor: 'transparent',
                    border: `1.5px solid ${BLUE}`, borderRadius: '10px',
                    color: BLUE, fontSize: '16px', cursor: 'pointer',
                    fontFamily: FONT_FAMILY, fontWeight: 700
                  }}
                >Batal</button>
                <button
                  onClick={handleInviteCollaborator}
                  style={{
                    padding: '14px 28px', backgroundColor: BLUE,
                    border: 'none', borderRadius: '10px', color: WHITE,
                    fontSize: '16px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '10px',
                    fontFamily: FONT_FAMILY, fontWeight: 700
                  }}
                >
                  Kirim Undangan Kolaborasi
                  <NorthEastArrow size={18} color={WHITE} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
        .footer-menuru-char {
          display: inline-block;
          will-change: transform, opacity;
          color: #0D3CFC !important;
          transform-origin: 50% 100%;
        }
      `}</style>
    </>
  );
}
