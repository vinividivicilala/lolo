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
  getDoc,
  setDoc,
  limit,
  deleteDoc,
} from "firebase/firestore";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

// ===== REGISTER GSAP PLUGINS =====
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

// ===== FIREBASE CONFIG =====
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

// ===== CONSTANTS =====
const FONT_FAMILY = "'Poppins', 'Poppins Fallback', sans-serif";
const ADMIN_EMAIL = "faridardiansyah061@gmail.com";
const BLUE = "#0D3CFC";
const WHITE = "#FFFFFF";
const BLACK = "#000000";

// ===== ENCRYPTION (AES-256-GCM) =====
const ENCRYPTION_KEY_BASE64 = "bWVudXJ1LXNlY3JldC1rZXktMjAyNi0zMmJ5dGVzISEh";
const IV_LENGTH = 12;

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function uint8ArrayToBase64(uint8Array: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary);
}

let cryptoKey: CryptoKey | null = null;

async function getCryptoKey(): Promise<CryptoKey> {
  if (cryptoKey) return cryptoKey;
  const keyData = base64ToUint8Array(ENCRYPTION_KEY_BASE64);
  const keyBytes = keyData.slice(0, 32);
  cryptoKey = await window.crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
  return cryptoKey;
}

async function encryptMessage(text: string): Promise<string> {
  try {
    if (typeof window === "undefined" || !window.crypto) {
      return `encrypted:${btoa(unescape(encodeURIComponent(text)))}`;
    }
    const key = await getCryptoKey();
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const encrypted = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv, tagLength: 128 },
      key,
      data
    );
    const encryptedArray = new Uint8Array(encrypted);
    const combined = new Uint8Array(iv.length + encryptedArray.length);
    combined.set(iv, 0);
    combined.set(encryptedArray, iv.length);
    return `encrypted:${uint8ArrayToBase64(combined)}`;
  } catch (error) {
    console.error("Encryption error:", error);
    return `plain:${btoa(unescape(encodeURIComponent(text)))}`;
  }
}

async function decryptMessage(encrypted: string): Promise<string> {
  try {
    if (typeof window === "undefined" || !window.crypto) {
      if (encrypted.startsWith("encrypted:")) {
        const encoded = encrypted.substring("encrypted:".length);
        return decodeURIComponent(escape(atob(encoded)));
      }
      return encrypted;
    }
    if (encrypted.startsWith("plain:")) {
      const encoded = encrypted.substring("plain:".length);
      return decodeURIComponent(escape(atob(encoded)));
    }
    if (!encrypted.startsWith("encrypted:")) {
      return encrypted;
    }
    const base64Data = encrypted.substring("encrypted:".length);
    const combined = base64ToUint8Array(base64Data);
    const iv = combined.slice(0, IV_LENGTH);
    const encryptedData = combined.slice(IV_LENGTH);
    const key = await getCryptoKey();
    const decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv, tagLength: 128 },
      key,
      encryptedData
    );
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error("Decryption error:", error);
    if (encrypted.startsWith("encrypted:") || encrypted.startsWith("plain:")) {
      try {
        const encoded = encrypted.includes(":")
          ? encrypted.split(":")[1]
          : encrypted;
        return decodeURIComponent(escape(atob(encoded)));
      } catch {
        return "[Message cannot be decrypted]";
      }
    }
    return encrypted;
  }
}

// ===== ANTI-BOT KEYWORDS =====
const BAN_KEYWORDS = {
  JUDOL: [
    "judi", "slot", "poker", "casino", "roulette", "blackjack", "baccarat",
    "togel", "toto", "4d", "3d", "2d", "colok", "macau", "singapore",
    "hongkong", "sydney", "bandar", "bookie", "odds", "bet", "taruhan",
    "jackpot", "progressive", "bonus", "deposit", "withdraw", "wd",
    "live casino", "online casino", "gambling", "judol", "slot online",
    "maxwin", "scatter", "wild", "free spin", "situs judi", "agen judi",
    "bo", "qq", "domino", "capsa", "ceme", "taruhan bola", "sportsbook",
    "parlay", "mix parlay", "over under", "handicap", "1x2",
  ],
  PHISHING: [
    "phishing", "scam", "fraud", "penipuan", "tipu", "rekening", "transfer",
    "minta uang", "pinjam uang", "kartu kredit", "kartu atm", "pin", "password",
    "otp", "verifikasi", "validasi", "konfirmasi", "akun bank", "nomor rekening",
    "no rek", "rek", "minta kirim", "kirim ke", "bayar ke", "setor ke",
    "investasi bodong", "money game", "ponzi", "phising", "pishing",
    "data pribadi", "informasi pribadi", "ktp", "nik", "kk", "akte",
    "ijazah", "transkrip", "password bank", "m-banking", "mobile banking",
    "internet banking", "i-banking", "e-banking",
  ],
  MALICIOUS: [
    "<script", "javascript:", "onclick", "onload", "eval(", "document.",
    "window.", "alert(", "prompt(", "confirm(", "function", "var ",
    "const ", "let ", "=>", "===", "!==", "localStorage", "sessionStorage",
    "document.cookie", "fetch(", "XMLHttpRequest", "$.ajax", "axios.",
    "require(", "import ", "export ", "module.exports",
  ],
  SUSPICIOUS_LINKS: [
    "bit.ly", "tinyurl", "shorturl", "rb.gy", "cutt.ly", "t.co", "ow.ly",
    "buff.ly", "adf.ly", "shorte.st", "goo.gl", "is.gd", "v.gd", "migre.me",
    "tiny.cc", "short.link", ".xyz", ".top", ".club", ".online", ".site",
    ".win", ".bid", ".loan", ".date", ".download", ".stream", ".watch",
    ".free", ".click", ".biz", ".info", ".name", ".pro", ".tech", ".store",
    ".shop", ".live", ".app", ".dev", ".work", ".cloud", ".host",
  ],
};

function containsBannedContent(text: string): { isBanned: boolean; reason: string } {
  const lowerText = text.toLowerCase();
  for (const keyword of BAN_KEYWORDS.JUDOL) {
    if (lowerText.includes(keyword)) {
      return { isBanned: true, reason: `Online Gambling (${keyword})` };
    }
  }
  for (const keyword of BAN_KEYWORDS.PHISHING) {
    if (lowerText.includes(keyword)) {
      return { isBanned: true, reason: `Phishing/Scam (${keyword})` };
    }
  }
  for (const keyword of BAN_KEYWORDS.MALICIOUS) {
    if (lowerText.includes(keyword)) {
      return { isBanned: true, reason: `Malicious Content (${keyword})` };
    }
  }
  for (const keyword of BAN_KEYWORDS.SUSPICIOUS_LINKS) {
    if (lowerText.includes(keyword)) {
      return { isBanned: true, reason: `Suspicious Link (${keyword})` };
    }
  }
  const ipPattern = /[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/;
  if (ipPattern.test(lowerText)) {
    return { isBanned: true, reason: "Suspicious IP Address" };
  }
  const repeatedNumber = /[0-9]{10,}/;
  if (repeatedNumber.test(lowerText)) {
    return { isBanned: true, reason: "Suspicious Number" };
  }
  const transferPatterns = [
    /kirim ke rek/i,
    /transfer ke/i,
    /bayar ke/i,
    /setor ke/i,
    /minta kirim/i,
    /mohon kirim/i,
    /tolong kirim/i,
  ];
  for (const pattern of transferPatterns) {
    if (pattern.test(lowerText)) {
      return { isBanned: true, reason: "Transfer/Payment Request" };
    }
  }
  return { isBanned: false, reason: "" };
}

// ===== BAN USER PERMANENT =====
async function banUserPermanent(
  userId: string,
  userEmail: string,
  userName: string,
  reason: string,
  message: string
) {
  if (!db) return;
  try {
    const now = new Date().toISOString();
    await setDoc(doc(db, "bot_blocks", userId), {
      userId,
      userEmail,
      userName,
      isBlocked: true,
      blockedAt: now,
      blockedReason: reason,
      blockedMessage: message,
      canCreateTicket: false,
      canSendMessage: false,
      violations: [{ type: "BANNED", reason, timestamp: now, message, confidence: 100 }],
      totalViolations: 1,
      warningCount: 0,
      firstViolation: now,
      lastViolation: now,
    });
    await updateDoc(doc(db, "users", userId), {
      botBlocked: true,
      botBlockedAt: serverTimestamp(),
      botBlockedReason: reason,
      botBlockedMessage: message,
      canCreateTicket: false,
      canSendMessage: false,
    });
    await addDoc(collection(db, "bot_violations_log"), {
      userId,
      userEmail,
      userName,
      violation: { type: "BANNED", reason, timestamp: now, message, confidence: 100 },
      timestamp: serverTimestamp(),
      resolved: false,
      isBan: true,
    });
  } catch (error) {
    console.error("Error banning user:", error);
  }
}

// ===== CHECK BAN STATUS =====
async function checkBanStatus(userId: string): Promise<{
  isBanned: boolean;
  reason: string;
  message: string;
  canCreateTicket: boolean;
  canSendMessage: boolean;
}> {
  if (!db) {
    return {
      isBanned: false,
      reason: "",
      message: "",
      canCreateTicket: true,
      canSendMessage: true,
    };
  }
  try {
    const botDoc = await getDoc(doc(db, "bot_blocks", userId));
    if (botDoc.exists()) {
      const data = botDoc.data();
      return {
        isBanned: data.isBlocked || false,
        reason: data.blockedReason || "",
        message: data.blockedMessage || "",
        canCreateTicket: data.canCreateTicket !== false,
        canSendMessage: data.canSendMessage !== false,
      };
    }
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      if (userData.botBlocked === true) {
        return {
          isBanned: true,
          reason: userData.botBlockedReason || "Blocked by system",
          message: userData.botBlockedMessage || "",
          canCreateTicket: userData.canCreateTicket !== false,
          canSendMessage: userData.canSendMessage !== false,
        };
      }
    }
    return {
      isBanned: false,
      reason: "",
      message: "",
      canCreateTicket: true,
      canSendMessage: true,
    };
  } catch (error) {
    console.error("Error checking ban status:", error);
    return {
      isBanned: false,
      reason: "",
      message: "",
      canCreateTicket: true,
      canSendMessage: true,
    };
  }
}

// ===== TYPES / INTERFACES =====
interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: any;
  read: boolean;
  isEncrypted?: boolean;
  isBotDetected?: boolean;
  deliveryStatus?: "sending" | "sent" | "delivered" | "read" | "failed";
}

interface ChatContact {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhoto?: string;
  online?: boolean;
  lastSeen?: any;
}

interface ChatGroup {
  id: string;
  groupName: string;
  description: string;
  members: string[];
  createdBy: string;
  createdAt: any;
}

interface LastMessagePreview {
  text: string;
  senderName: string;
  timestamp: any;
  isFromMe: boolean;
}

interface RollingMessageItem {
  id: string;
  senderName: string;
  text: string;
  timestamp: any;
  isMine: boolean;
}

interface AnnouncementItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  topic: string;
  text: string;
  title: string;
  createdAt: any;
  isEncrypted?: boolean;
}

interface BroadcastItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  topic: string;
  text: string;
  title: string;
  createdAt: any;
  isEncrypted?: boolean;
}

// ===== SVG ICONS =====
const ArrowRight = ({ size = 20, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M5 12H19M19 12L12 5M19 12L12 19"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CheckIcon = ({ size = 12, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M20 6L9 17L4 12"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DoubleCheckIcon = ({ size = 12, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M1 12L5 16L13 8"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11 12L15 16L23 8"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ClockIcon = ({ size = 12, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2.5" />
    <path
      d="M12 6V12L16 14"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ErrorIcon = ({ size = 12, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2.5" />
    <path d="M12 8V12" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="12" cy="16" r="1" fill={color} />
  </svg>
);

const SearchIcon = ({ size = 16, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21 21L16.65 16.65" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CloseIcon = ({ size = 18, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M6 6L18 18M18 6L6 18"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PlusIcon = ({ size = 20, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M12 5V19M5 12H19"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PeopleIcon = ({ size = 20, color = "#ffffff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path
      d="M4 21V19C4 16.7909 5.79086 15 8 15H16C18.2091 15 20 16.7909 20 19V21"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TrustIcon = ({ size = 24, color = "#ffffff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M12 2L4 5V11C4 16 8 20 12 22C16 20 20 16 20 11V5L12 2Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 12L11 14L15 10"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CareerIcon = ({ size = 24, color = "#ffffff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect
      x="2"
      y="7"
      width="20"
      height="14"
      rx="2"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 7V5C8 3.89543 8.89543 3 10 3H14C15.1046 3 16 3.89543 16 5V7"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M2 13H22" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ResourcesIcon = ({ size = 24, color = "#ffffff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M4 4H10C11.1046 4 12 4.89543 12 6V20C12 18.8954 11.1046 18 10 18H4V4Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M20 4H14C12.8954 4 12 4.89543 12 6V20C12 18.8954 12.8954 18 14 18H20V4Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DocsIcon = ({ size = 20, color = "#ffffff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14 2V8H20"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M8 13H16" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 17H16" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BrandIcon = ({ size = 20, color = "#ffffff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M20.59 13.41L11 3.83C10.6 3.43 10.06 3.2 9.5 3.2H4C2.9 3.2 2 4.1 2 5.2V10.7C2 11.26 2.22 11.8 2.63 12.2L12.21 21.79C13 22.57 14.27 22.57 15.06 21.79L20.59 16.26C21.37 15.47 21.37 14.2 20.59 13.41Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="7" cy="7" r="1.5" fill={color} />
  </svg>
);

// ===== FOOTER LINKS =====
const footerLinks = [
  { title: "Get in Touch", links: ["Contact", "Instagram", "Live Chat"] },
  {
    title: "Product",
    links: ["Shop", "Note", "Calendar", "Blog", "Donation", "Community", "Live Chat Agent", "Stories"],
  },
  {
    title: "Attention",
    links: ["Privacy Policy", "Terms & Conditions", "About Us", "Terms of Use", "Help Center"],
  },
];

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
          onUpdate: (self) => onNavbarShiftChange(self.progress > 0.35),
          onLeave: () => onNavbarShiftChange(true),
          onEnterBack: () => onNavbarShiftChange(false),
        },
      });

      scrollTl.to(
        title,
        {
          position: "fixed",
          top: "10px",
          left: "40px",
          fontSize: "70px",
          fontWeight: 700,
          letterSpacing: "-0.03em",
          lineHeight: 1,
          height: "60px",
          display: "flex",
          alignItems: "center",
          transform: "translateX(0px) translateY(0px)",
          duration: 1,
          ease: "power2.inOut",
        },
        0
      );

      scrollTl.to(container, { height: "80px", duration: 1, ease: "power2.inOut" }, 0);

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
          color: "#0D3CFC",
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
          color: "#0D3CFC",
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
            color: "#0D3CFC",
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
            <line
              ref={linesTopRef}
              x1="4"
              y1="7"
              x2="20"
              y2="7"
              stroke={strokeColor}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <line
              ref={linesBottomRef}
              x1="4"
              y1="17"
              x2="20"
              y2="17"
              stroke={strokeColor}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
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
                    <span style={{ fontSize: "16px", fontWeight: 700, fontFamily: FONT_FAMILY, color: titleTextColor }}>
                      Docs
                    </span>
                  </div>
                  <p style={{ fontSize: "12px", lineHeight: 1.5, color: descriptionTextColor, margin: 0, fontFamily: FONT_FAMILY, maxWidth: "340px" }}>
                    Dokumentasi lengkap panduan produk, API, dan tutorial Menuru.
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
                  <img
                    src={panelImage}
                    alt="Docs"
                    style={{ width: "100%", height: "120px", objectFit: "contain", display: "block", borderRadius: "8px" }}
                  />
                  <span style={{ fontSize: "14px", fontWeight: 700, fontFamily: FONT_FAMILY, color: titleTextColor }}>
                    Docs Guide
                  </span>
                  <p style={{ fontSize: "12px", lineHeight: 1.5, color: descriptionTextColor, margin: 0, fontFamily: FONT_FAMILY }}>
                    Panduan lengkap dan referensi teknis.
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
                  <img
                    src={panelImage}
                    alt="Brand"
                    style={{ width: "100%", height: "120px", objectFit: "contain", display: "block", borderRadius: "8px" }}
                  />
                  <span style={{ fontSize: "14px", fontWeight: 700, fontFamily: FONT_FAMILY, color: titleTextColor }}>
                    Brand Assets
                  </span>
                  <p style={{ fontSize: "12px", lineHeight: 1.5, color: descriptionTextColor, margin: 0, fontFamily: FONT_FAMILY }}>
                    Logo, palet warna, dan identitas visual.
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
                <img
                  src={panelImage}
                  alt={panelTitle}
                  style={{ width: "100%", height: "170px", objectFit: "contain", display: "block", borderRadius: "10px" }}
                />
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

// ===== CLOSE ROOM BUTTON (BG BIRU, ICON PUTIH) =====
const CloseRoomButton = ({
  onConfirm,
  disabled,
}: {
  onConfirm: () => void;
  disabled?: boolean;
}) => {
  const btnRef = useRef<HTMLButtonElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (iconRef.current) {
      gsap.fromTo(
        iconRef.current,
        { rotate: 0, scale: 0.7, opacity: 0 },
        { rotate: 360, scale: 1, opacity: 1, duration: 0.7, ease: "back.out(1.6)" }
      );
    }
  }, []);

  const handleEnter = () => {
    if (disabled) return;
    if (btnRef.current) {
      gsap.to(btnRef.current, { scale: 1.08, duration: 0.25, ease: "power2.out" });
    }
    if (iconRef.current) {
      gsap.to(iconRef.current, { rotate: "+=90", duration: 0.35, ease: "power2.out" });
    }
  };

  const handleLeave = () => {
    if (disabled) return;
    if (btnRef.current) {
      gsap.to(btnRef.current, { scale: 1, duration: 0.25, ease: "power2.out" });
    }
  };

  const handleClick = () => {
    if (disabled) return;
    if (btnRef.current) {
      gsap
        .timeline()
        .to(btnRef.current, { scale: 0.92, duration: 0.12, ease: "power2.in" })
        .to(btnRef.current, { scale: 1, duration: 0.2, ease: "back.out(2)" });
    }
    onConfirm();
  };

  return (
    <button
      ref={btnRef}
      onClick={handleClick}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      disabled={disabled}
      title="Close room"
      aria-label="Close room"
      style={{
        width: "36px",
        height: "36px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: BLUE,
        border: `1.5px solid ${WHITE}`,
        borderRadius: "8px",
        cursor: disabled ? "not-allowed" : "pointer",
        padding: 0,
        opacity: disabled ? 0.4 : 1,
        transition: "background-color 0.2s ease",
      }}
    >
      <div ref={iconRef} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CloseIcon size={16} color={WHITE} />
      </div>
    </button>
  );
};

// ===== ROLLING MESSAGE ITEM =====
const RollingMessageItemComponent = ({ item }: { item: RollingMessageItem; index: number }) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const senderRef = useRef<HTMLSpanElement>(null);
  const fromRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!itemRef.current) return;
    const tl = gsap.timeline();

    tl.fromTo(
      itemRef.current,
      { opacity: 0, x: -60, scale: 0.9, height: 0 },
      { opacity: 1, x: 0, scale: 1, height: "auto", duration: 0.5, ease: "back.out(1.4)" }
    );

    if (senderRef.current) {
      tl.fromTo(
        senderRef.current,
        { yPercent: 120, opacity: 0, rotateX: -90, transformOrigin: "50% 100%" },
        { yPercent: 0, opacity: 1, rotateX: 0, duration: 0.5, ease: "back.out(1.7)" },
        "-=0.3"
      );
    }
    if (fromRef.current) {
      tl.fromTo(
        fromRef.current,
        { opacity: 0, scale: 0.6 },
        { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2)" },
        "-=0.25"
      );
    }
    if (textRef.current) {
      tl.fromTo(
        textRef.current,
        { yPercent: 100, opacity: 0, rotateX: -60, transformOrigin: "50% 100%" },
        { yPercent: 0, opacity: 1, rotateX: 0, duration: 0.6, ease: "back.out(1.7)" },
        "-=0.3"
      );
    }

    return () => {
      tl.kill();
    };
  }, [item.id]);

  return (
    <div
      ref={itemRef}
      data-rolling-id={item.id}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "8px 12px",
        backgroundColor: item.isMine ? BLUE : WHITE,
        border: `1.5px solid ${BLUE}`,
        borderRadius: "8px",
        fontFamily: FONT_FAMILY,
        fontSize: "13px",
        overflow: "hidden",
        marginBottom: "6px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "6px", overflow: "hidden", width: "100%" }}>
        <span
          ref={senderRef}
          style={{
            fontWeight: 700,
            color: item.isMine ? WHITE : BLUE,
            flexShrink: 0,
            display: "inline-block",
          }}
        >
          {item.senderName}
        </span>
        <span
          ref={fromRef}
          style={{
            color: item.isMine ? WHITE : BLUE,
            flexShrink: 0,
            fontStyle: "italic",
            opacity: 0.85,
          }}
        >
          from
        </span>
        <span
          ref={textRef}
          style={{
            color: item.isMine ? WHITE : BLUE,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontStyle: "italic",
            fontWeight: 500,
            display: "inline-block",
            flex: 1,
            minWidth: 0,
          }}
        >
          {item.text.length > 80 ? item.text.substring(0, 80) + "..." : item.text}
        </span>
      </div>
    </div>
  );
};

// ===== LIVE CHAT COMPONENT =====
const LiveChat = ({
  user,
  db,
  auth,
  isAdmin,
}: {
  user: any;
  db: any;
  auth: any;
  isAdmin: boolean;
}) => {
  // ===== CHAT STATE =====
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<ChatGroup | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [banMessage, setBanMessage] = useState<string | null>(null);
  const [isBanned, setIsBanned] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [encryptionReady, setEncryptionReady] = useState(false);
  const [checkingBan, setCheckingBan] = useState(true);
  const [canSendMessage, setCanSendMessage] = useState(true);

  // ===== CONTACTS / GROUPS =====
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [groups, setGroups] = useState<ChatGroup[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageSearchQuery, setMessageSearchQuery] = useState("");
  const [chatPreviews, setChatPreviews] = useState<{ [chatId: string]: LastMessagePreview[] }>({});
  const [sentCounts, setSentCounts] = useState<{ [chatId: string]: number }>({});
  const [rollingMessages, setRollingMessages] = useState<RollingMessageItem[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<ChatContact[]>([]);

  // ===== ADD USER =====
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [allUsers, setAllUsers] = useState<ChatContact[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [addingUserId, setAddingUserId] = useState<string | null>(null);

  // ===== ADD GROUP =====
  const [showAddGroupForm, setShowAddGroupForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [addingGroup, setAddingGroup] = useState(false);
  const [groupError, setGroupError] = useState("");

  // ===== CLOSE ROOM =====
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  // ===== ANNOUNCEMENT & BROADCAST =====
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [broadcasts, setBroadcasts] = useState<BroadcastItem[]>([]);
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<string | null>(null);
  const [selectedBroadcastId, setSelectedBroadcastId] = useState<string | null>(null);

  // ===== REFS =====
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatMessagesContainerRef = useRef<HTMLDivElement>(null);
  const liveChatTitleRef = useRef<HTMLHeadingElement>(null);
  const addUserBtnRef = useRef<HTMLButtonElement>(null);
  const addGroupBtnRef = useRef<HTMLButtonElement>(null);
  const addUserFormRef = useRef<HTMLDivElement>(null);
  const addGroupFormRef = useRef<HTMLDivElement>(null);
  const contactItemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const groupItemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const onlineUserItemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const messagesCacheRef = useRef<{ [chatId: string]: ChatMessage[] }>({});
  const prevMessagesLenRef = useRef<number>(0);
  const rollingCacheRef = useRef<{ [chatId: string]: RollingMessageItem[] }>({});

  // ===== INIT =====
  useEffect(() => {
    setIsMounted(true);
    getCryptoKey()
      .then(() => setEncryptionReady(true))
      .catch(() => setEncryptionReady(true));
  }, []);

  // ===== GSAP ANIMATIONS =====
  useEffect(() => {
    if (!isMounted) return;
    if (liveChatTitleRef.current) {
      const splitTitle = new SplitText(liveChatTitleRef.current, {
        type: "chars",
        charsClass: "split-char-livechat",
      });
      gsap.fromTo(
        splitTitle.chars,
        { opacity: 0, y: 30, filter: "blur(8px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.8,
          stagger: 0.05,
          ease: "back.out(1.2)",
          scrollTrigger: {
            trigger: liveChatTitleRef.current,
            start: "top 85%",
            end: "bottom 70%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }
    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    if (addUserBtnRef.current) {
      gsap.fromTo(
        addUserBtnRef.current,
        { scale: 0, rotation: -180, opacity: 0 },
        { scale: 1, rotation: 0, opacity: 1, duration: 0.8, ease: "back.out(1.7)", delay: 0.4 }
      );
    }
    if (addGroupBtnRef.current) {
      gsap.fromTo(
        addGroupBtnRef.current,
        { scale: 0, rotation: -180, opacity: 0 },
        { scale: 1, rotation: 0, opacity: 1, duration: 0.8, ease: "back.out(1.7)", delay: 0.5 }
      );
    }
  }, [isMounted]);

  useEffect(() => {
    if (!addUserFormRef.current) return;
    if (showAddUserForm) {
      gsap.set(addUserFormRef.current, { display: "block" });
      gsap.fromTo(
        addUserFormRef.current,
        { height: 0, opacity: 0, y: -20 },
        { height: "auto", opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.4)" }
      );
    } else {
      gsap.to(addUserFormRef.current, {
        height: 0,
        opacity: 0,
        y: -20,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          if (addUserFormRef.current) gsap.set(addUserFormRef.current, { display: "none" });
        },
      });
    }
  }, [showAddUserForm]);

  useEffect(() => {
    if (!addGroupFormRef.current) return;
    if (showAddGroupForm) {
      gsap.set(addGroupFormRef.current, { display: "block" });
      gsap.fromTo(
        addGroupFormRef.current,
        { height: 0, opacity: 0, y: -20 },
        { height: "auto", opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.4)" }
      );
    } else {
      gsap.to(addGroupFormRef.current, {
        height: 0,
        opacity: 0,
        y: -20,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          if (addGroupFormRef.current) gsap.set(addGroupFormRef.current, { display: "none" });
        },
      });
    }
  }, [showAddGroupForm]);

  useEffect(() => {
    if (!isMounted) return;
    onlineUsers.forEach((u) => {
      const el = onlineUserItemRefs.current[u.id];
      if (el && !el.dataset.animated) {
        el.dataset.animated = "true";
        gsap.fromTo(el, { x: -40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: "back.out(1.4)" });
      }
    });
  }, [onlineUsers, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    contacts.forEach((c) => {
      const el = contactItemRefs.current[c.id];
      if (el && !el.dataset.animated) {
        el.dataset.animated = "true";
        gsap.fromTo(
          el,
          { x: -60, opacity: 0, scale: 0.9 },
          { x: 0, opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.4)" }
        );
      }
    });
    groups.forEach((g) => {
      const el = groupItemRefs.current[g.id];
      if (el && !el.dataset.animated) {
        el.dataset.animated = "true";
        gsap.fromTo(
          el,
          { x: -60, opacity: 0, scale: 0.9 },
          { x: 0, opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.4)" }
        );
      }
    });
  }, [contacts, groups, isMounted]);

  // ===== CHECK BAN STATUS =====
  useEffect(() => {
    if (!user || !isMounted) {
      setCheckingBan(false);
      return;
    }
    const checkBan = async () => {
      setCheckingBan(true);
      try {
        const status = await checkBanStatus(user.uid);
        if (status.isBanned) {
          setIsBanned(true);
          setBanReason(status.reason);
          setCanSendMessage(status.canSendMessage);
          setBanMessage(`YOUR ACCOUNT HAS BEEN PERMANENTLY BANNED\n\nReason: ${status.reason}`);
        } else {
          setIsBanned(false);
          setCanSendMessage(true);
          setBanMessage(null);
        }
      } catch (error) {
        console.error("Error checking ban:", error);
      } finally {
        setCheckingBan(false);
      }
    };
    checkBan();
  }, [user, isMounted]);

  // ===== LOAD ALL USERS =====
  useEffect(() => {
    if (!db || !user || !isMounted) return;
    const q = query(collection(db, "users"), orderBy("displayName", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot: any) => {
      const userList: ChatContact[] = [];
      snapshot.forEach((docSnap: any) => {
        const data = docSnap.data();
        if (docSnap.id !== user.uid) {
          userList.push({
            id: docSnap.id,
            userId: docSnap.id,
            userName: data.displayName || data.name || data.email || "User",
            userEmail: data.email || "",
            userPhoto: data.photoURL || "",
            online: data.online || false,
            lastSeen: data.lastSeen,
          });
        }
      });
      setAllUsers(userList);
    });
    return () => unsubscribe();
  }, [db, user, isMounted]);

  // ===== LOAD ONLINE USERS =====
  useEffect(() => {
    if (!db || !user || !isMounted) return;
    const q = query(collection(db, "users"), where("online", "==", true));
    const unsubscribe = onSnapshot(q, (snapshot: any) => {
      const list: ChatContact[] = [];
      snapshot.forEach((docSnap: any) => {
        const data = docSnap.data();
        if (docSnap.id !== user.uid) {
          list.push({
            id: docSnap.id,
            userId: docSnap.id,
            userName: data.displayName || data.name || data.email || "User",
            userEmail: data.email || "",
            userPhoto: data.photoURL || "",
            online: true,
            lastSeen: data.lastSeen,
          });
        }
      });
      setOnlineUsers(list);
    });
    return () => unsubscribe();
  }, [db, user, isMounted]);

  // ===== LOAD MY CONTACTS =====
  useEffect(() => {
    if (!db || !user || !isMounted) return;
    const q = query(
      collection(db, "user_contacts"),
      where("ownerId", "==", user.uid),
      orderBy("addedAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot: any) => {
      const contactList: ChatContact[] = [];
      snapshot.forEach((docSnap: any) => {
        const data = docSnap.data();
        contactList.push({
          id: docSnap.id,
          userId: data.contactId,
          userName: data.contactName,
          userEmail: data.contactEmail,
          userPhoto: data.contactPhoto || "",
          online: data.online || false,
          lastSeen: data.lastSeen,
        });
      });
      setContacts(contactList);
    });
    return () => unsubscribe();
  }, [db, user, isMounted]);

  // ===== LOAD GROUPS =====
  useEffect(() => {
    if (!db || !user || !isMounted) return;
    const q = query(
      collection(db, "chat_groups"),
      where("members", "array-contains", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot: any) => {
      const groupList: ChatGroup[] = [];
      snapshot.forEach((docSnap: any) => {
        groupList.push({ id: docSnap.id, ...docSnap.data() } as ChatGroup);
      });
      setGroups(groupList);
    });
    return () => unsubscribe();
  }, [db, user, isMounted]);

  // ===== LOAD ANNOUNCEMENTS =====
  useEffect(() => {
    if (!db || !user || !isMounted) return;
    const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"), limit(20));
    const unsubscribe = onSnapshot(
      q,
      async (snapshot: any) => {
        const list: AnnouncementItem[] = [];
        for (const docSnap of snapshot.docs) {
          const data = docSnap.data();
          let text = data.text || data.message || "";
          if (data.isEncrypted && text) {
            try {
              text = await decryptMessage(text);
            } catch {
              text = "[Encrypted]";
            }
          }
          list.push({
            id: docSnap.id,
            userId: data.userId || data.senderId || data.createdBy || "",
            userName: data.userName || data.senderName || data.title || "Admin",
            userEmail: data.userEmail || data.senderEmail || "",
            topic: data.topic || "Announcement",
            text: text || data.title || "",
            title: data.title || "Announcement",
            createdAt: data.createdAt || data.timestamp,
            isEncrypted: data.isEncrypted || false,
          });
        }
        setAnnouncements(list);
      },
      (error) => console.warn("Announcements listener error:", error)
    );
    return () => unsubscribe();
  }, [db, user, isMounted]);

  // ===== LOAD BROADCASTS =====
  useEffect(() => {
    if (!db || !user || !isMounted) return;
    const q = query(collection(db, "broadcasts"), orderBy("createdAt", "desc"), limit(20));
    const unsubscribe = onSnapshot(
      q,
      async (snapshot: any) => {
        const list: BroadcastItem[] = [];
        for (const docSnap of snapshot.docs) {
          const data = docSnap.data();
          let text = data.text || data.message || "";
          if (data.isEncrypted && text) {
            try {
              text = await decryptMessage(text);
            } catch {
              text = "[Encrypted]";
            }
          }
          list.push({
            id: docSnap.id,
            userId: data.userId || data.senderId || data.createdBy || "",
            userName: data.userName || data.senderName || data.title || "Admin",
            userEmail: data.userEmail || data.senderEmail || "",
            topic: data.topic || "Broadcast",
            text: text || data.title || "",
            title: data.title || "Broadcast",
            createdAt: data.createdAt || data.timestamp,
            isEncrypted: data.isEncrypted || false,
          });
        }
        setBroadcasts(list);
      },
      (error) => console.warn("Broadcasts listener error:", error)
    );
    return () => unsubscribe();
  }, [db, user, isMounted]);

  // ===== AUTO PREVIEWS + COUNTERS =====
  useEffect(() => {
    if (!db || !user || !isMounted) return;
    const unsubscribes: (() => void)[] = [];

    contacts.forEach((contact) => {
      const chatId = [user.uid, contact.userId].sort().join("_");
      const key = `c_${contact.id}`;
      const q = query(
        collection(db, "direct_messages", chatId, "messages"),
        orderBy("timestamp", "desc"),
        limit(20)
      );
      const unsub = onSnapshot(q, async (snapshot: any) => {
        const previews: LastMessagePreview[] = [];
        let sentCount = 0;
        for (const docSnap of snapshot.docs) {
          const data = docSnap.data();
          let text = data.text || "";
          if (data.isEncrypted) {
            try {
              text = await decryptMessage(text);
            } catch {
              text = "[Encrypted]";
            }
          }
          if (data.senderId === user.uid) sentCount++;
          if (previews.length < 3) {
            previews.push({
              text,
              senderName: data.senderName || "User",
              timestamp: data.timestamp,
              isFromMe: data.senderId === user.uid,
            });
          }
        }
        setChatPreviews((prev) => ({ ...prev, [key]: previews }));
        setSentCounts((prev) => ({ ...prev, [key]: sentCount }));
      });
      unsubscribes.push(unsub);
    });

    groups.forEach((group) => {
      const key = `g_${group.id}`;
      const q = query(
        collection(db, "chat_groups", group.id, "messages"),
        orderBy("timestamp", "desc"),
        limit(20)
      );
      const unsub = onSnapshot(q, async (snapshot: any) => {
        const previews: LastMessagePreview[] = [];
        let sentCount = 0;
        for (const docSnap of snapshot.docs) {
          const data = docSnap.data();
          let text = data.text || "";
          if (data.isEncrypted) {
            try {
              text = await decryptMessage(text);
            } catch {
              text = "[Encrypted]";
            }
          }
          if (data.senderId === user.uid) sentCount++;
          if (previews.length < 3) {
            previews.push({
              text,
              senderName: data.senderName || "User",
              timestamp: data.timestamp,
              isFromMe: data.senderId === user.uid,
            });
          }
        }
        setChatPreviews((prev) => ({ ...prev, [key]: previews }));
        setSentCounts((prev) => ({ ...prev, [key]: sentCount }));
      });
      unsubscribes.push(unsub);
    });

    return () => unsubscribes.forEach((unsub) => unsub());
  }, [db, contacts, groups, user, isMounted]);

  // ===== DIRECT CHAT MESSAGES =====
  useEffect(() => {
    if (!db || !selectedContact || !user || !isMounted) return;

    const chatId = [user.uid, selectedContact.userId].sort().join("_");
    const key = `c_${selectedContact.id}`;

    if (messagesCacheRef.current[chatId]) {
      setMessages(messagesCacheRef.current[chatId]);
      prevMessagesLenRef.current = messagesCacheRef.current[chatId].length;
    }
    setRollingMessages(rollingCacheRef.current[key] || []);

    const q = query(
      collection(db, "direct_messages", chatId, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, async (snapshot: any) => {
      const msgList: ChatMessage[] = [];
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        let text = data.text || "";
        if (data.isEncrypted) {
          try {
            text = await decryptMessage(text);
          } catch {
            text = "[Encrypted message]";
          }
        }
        msgList.push({ id: docSnap.id, ...data, text } as ChatMessage);
      }

      const myRollingMessages: RollingMessageItem[] = msgList
        .filter((m) => m.senderId === user.uid)
        .map((m) => ({
          id: m.id,
          senderName: m.senderName || "User",
          text: m.text,
          timestamp: m.timestamp,
          isMine: true,
        }));

      rollingCacheRef.current[key] = myRollingMessages;
      setRollingMessages(myRollingMessages);

      const newLen = msgList.length;
      if (prevMessagesLenRef.current > 0 && newLen > prevMessagesLenRef.current) {
        setTimeout(() => {
          if (chatMessagesContainerRef.current) {
            chatMessagesContainerRef.current.scrollTop =
              chatMessagesContainerRef.current.scrollHeight;
          }
        }, 50);
      }
      prevMessagesLenRef.current = newLen;
      messagesCacheRef.current[chatId] = msgList;
      setMessages(msgList);
    });
    return () => unsubscribe();
  }, [db, selectedContact, user, isMounted]);

  // ===== GROUP CHAT MESSAGES =====
  useEffect(() => {
    if (!db || !selectedGroup || !user || !isMounted) return;

    const chatId = `g_${selectedGroup.id}`;
    const key = `g_${selectedGroup.id}`;

    if (messagesCacheRef.current[chatId]) {
      setMessages(messagesCacheRef.current[chatId]);
      prevMessagesLenRef.current = messagesCacheRef.current[chatId].length;
    }
    setRollingMessages(rollingCacheRef.current[key] || []);

    const q = query(
      collection(db, "chat_groups", selectedGroup.id, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, async (snapshot: any) => {
      const msgList: ChatMessage[] = [];
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        let text = data.text || "";
        if (data.isEncrypted) {
          try {
            text = await decryptMessage(text);
          } catch {
            text = "[Encrypted message]";
          }
        }
        msgList.push({ id: docSnap.id, ...data, text } as ChatMessage);
      }

      const myRollingMessages: RollingMessageItem[] = msgList
        .filter((m) => m.senderId === user.uid)
        .map((m) => ({
          id: m.id,
          senderName: m.senderName || "User",
          text: m.text,
          timestamp: m.timestamp,
          isMine: true,
        }));

      rollingCacheRef.current[key] = myRollingMessages;
      setRollingMessages(myRollingMessages);

      const newLen = msgList.length;
      if (prevMessagesLenRef.current > 0 && newLen > prevMessagesLenRef.current) {
        setTimeout(() => {
          if (chatMessagesContainerRef.current) {
            chatMessagesContainerRef.current.scrollTop =
              chatMessagesContainerRef.current.scrollHeight;
          }
        }, 50);
      }
      prevMessagesLenRef.current = newLen;
      messagesCacheRef.current[chatId] = msgList;
      setMessages(msgList);
    });
    return () => unsubscribe();
  }, [db, selectedGroup, user, isMounted]);

  // ===== RESET ON CHAT CHANGE =====
  useEffect(() => {
    const chatId = selectedContact
      ? [user?.uid, selectedContact.userId].sort().join("_")
      : selectedGroup
      ? `g_${selectedGroup.id}`
      : "";
    prevMessagesLenRef.current = messagesCacheRef.current[chatId]?.length || 0;

    const key = selectedContact
      ? `c_${selectedContact.id}`
      : selectedGroup
      ? `g_${selectedGroup.id}`
      : "";
    setRollingMessages(rollingCacheRef.current[key] || []);
    setShowCloseConfirm(false);
    setMessageSearchQuery("");
    setSelectedAnnouncementId(null);
    setSelectedBroadcastId(null);
  }, [selectedContact?.id, selectedGroup?.id, user?.uid]);

  // ===== MARK MESSAGES AS READ =====
  useEffect(() => {
    if (!db || !user || !isMounted) return;
    const chatRef = selectedContact
      ? collection(
          db,
          "direct_messages",
          [user.uid, selectedContact.userId].sort().join("_"),
          "messages"
        )
      : selectedGroup
      ? collection(db, "chat_groups", selectedGroup.id, "messages")
      : null;
    if (!chatRef) return;
    const unread = messages.filter((m) => m.senderId !== user.uid && !m.read);
    unread.forEach(async (msg) => {
      try {
        await updateDoc(doc(chatRef, msg.id), { read: true, deliveryStatus: "read" });
      } catch (e) {}
    });
  }, [messages, selectedContact, selectedGroup, db, user, isMounted]);

  // ===== ADD USER TO CONTACTS =====
  const handleAddUserToContacts = async (pickedUser: ChatContact) => {
    if (!db || !user) return;
    setAddingUserId(pickedUser.id);
    try {
      const existing = contacts.find((c) => c.userId === pickedUser.userId);
      if (!existing) {
        await addDoc(collection(db, "user_contacts"), {
          ownerId: user.uid,
          contactId: pickedUser.userId,
          contactName: pickedUser.userName,
          contactEmail: pickedUser.userEmail,
          contactPhoto: pickedUser.userPhoto || "",
          addedAt: serverTimestamp(),
        });
      }
      setSelectedContact(pickedUser);
      setSelectedGroup(null);
      setShowAddUserForm(false);
      setUserSearchQuery("");
    } catch (error) {
      console.error("Error adding user to contacts:", error);
    } finally {
      setAddingUserId(null);
    }
  };

  // ===== DELETE CONTACT =====
  const handleDeleteContact = async (contactId: string) => {
    if (!db) return;
    const el = contactItemRefs.current[contactId];
    if (el) {
      gsap.to(el, {
        x: 100,
        opacity: 0,
        scale: 0.8,
        duration: 0.4,
        ease: "power2.in",
        onComplete: async () => {
          try {
            await deleteDoc(doc(db, "user_contacts", contactId));
          } catch (e) {}
        },
      });
    } else {
      try {
        await deleteDoc(doc(db, "user_contacts", contactId));
      } catch (e) {}
    }
  };

  // ===== ADD GROUP =====
  const handleAddGroup = async () => {
    if (!db || !user) return;
    setGroupError("");
    if (!newGroupName.trim()) {
      setGroupError("Group name is required");
      return;
    }
    if (!newGroupDesc.trim()) {
      setGroupError("Description is required");
      return;
    }
    if (selectedMembers.length === 0) {
      setGroupError("Select at least one member");
      return;
    }
    setAddingGroup(true);
    try {
      const members = [user.uid, ...selectedMembers];
      await addDoc(collection(db, "chat_groups"), {
        groupName: newGroupName.trim(),
        description: newGroupDesc.trim(),
        members,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      });
      setNewGroupName("");
      setNewGroupDesc("");
      setSelectedMembers([]);
      setShowAddGroupForm(false);
    } catch (error) {
      console.error("Error creating group:", error);
      setGroupError("Failed to create group. Please try again.");
    } finally {
      setAddingGroup(false);
    }
  };

  const toggleMember = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  // ===== CLICK ANNOUNCEMENT → OPEN CHAT =====
  const handleAnnouncementClick = async (ann: AnnouncementItem) => {
    setSelectedAnnouncementId(ann.id);
    setSelectedBroadcastId(null);

    let sender = allUsers.find(
      (u) => u.userId === ann.userId || u.userEmail === ann.userEmail
    );
    if (!sender && ann.userId) {
      sender = {
        id: `virtual_${ann.userId}`,
        userId: ann.userId,
        userName: ann.userName,
        userEmail: ann.userEmail,
        userPhoto: "",
        online: false,
      };
    }
    if (sender) {
      const existing = contacts.find((c) => c.userId === sender!.userId);
      if (!existing && sender.userId !== user?.uid && db && user) {
        try {
          await addDoc(collection(db, "user_contacts"), {
            ownerId: user.uid,
            contactId: sender.userId,
            contactName: sender.userName,
            contactEmail: sender.userEmail,
            contactPhoto: sender.userPhoto || "",
            addedAt: serverTimestamp(),
          });
        } catch (e) {
          console.error(e);
        }
      }
      setSelectedContact(sender);
      setSelectedGroup(null);
    }
  };

  // ===== CLICK BROADCAST → OPEN CHAT =====
  const handleBroadcastClick = async (bc: BroadcastItem) => {
    setSelectedBroadcastId(bc.id);
    setSelectedAnnouncementId(null);

    let sender = allUsers.find(
      (u) => u.userId === bc.userId || u.userEmail === bc.userEmail
    );
    if (!sender && bc.userId) {
      sender = {
        id: `virtual_${bc.userId}`,
        userId: bc.userId,
        userName: bc.userName,
        userEmail: bc.userEmail,
        userPhoto: "",
        online: false,
      };
    }
    if (sender) {
      const existing = contacts.find((c) => c.userId === sender!.userId);
      if (!existing && sender.userId !== user?.uid && db && user) {
        try {
          await addDoc(collection(db, "user_contacts"), {
            ownerId: user.uid,
            contactId: sender.userId,
            contactName: sender.userName,
            contactEmail: sender.userEmail,
            contactPhoto: sender.userPhoto || "",
            addedAt: serverTimestamp(),
          });
        } catch (e) {
          console.error(e);
        }
      }
      setSelectedContact(sender);
      setSelectedGroup(null);
    }
  };

  // ===== SEND MESSAGE =====
  const sendMessage = async () => {
    if (!db || !messageText.trim() || !user) return;

    if (user) {
      try {
        const status = await checkBanStatus(user.uid);
        if (status.isBanned) {
          setIsBanned(true);
          setBanReason(status.reason);
          setBanMessage(`YOUR ACCOUNT HAS BEEN PERMANENTLY BANNED\n\nReason: ${status.reason}`);
          setMessageText("");
          return;
        }
      } catch {}
    }

    if (!canSendMessage) {
      setBanMessage("YOU DO NOT HAVE PERMISSION TO SEND MESSAGES");
      setMessageText("");
      return;
    }

    const checkResult = containsBannedContent(messageText);
    if (checkResult.isBanned) {
      await banUserPermanent(
        user.uid,
        user.email || "",
        user.displayName || "User",
        checkResult.reason,
        messageText
      );
      setIsBanned(true);
      setBanReason(checkResult.reason);
      setCanSendMessage(false);
      setBanMessage(
        `YOUR ACCOUNT HAS BEEN PERMANENTLY BANNED\n\nReason: ${checkResult.reason}\n\nMessage sent: "${messageText}"`
      );
      setMessageText("");
      return;
    }

    if (!encryptionReady) {
      alert("Encryption is being initialized, please wait a moment.");
      return;
    }

    try {
      const senderName = user.displayName || user.email || "User";
      const encryptedMessage = await encryptMessage(messageText.trim());

      if (selectedContact) {
        const chatId = [user.uid, selectedContact.userId].sort().join("_");
        await addDoc(collection(db, "direct_messages", chatId, "messages"), {
          senderId: user.uid,
          senderName,
          text: encryptedMessage,
          timestamp: serverTimestamp(),
          read: false,
          isEncrypted: true,
          deliveryStatus: "sent",
        });
      } else if (selectedGroup) {
        await addDoc(collection(db, "chat_groups", selectedGroup.id, "messages"), {
          senderId: user.uid,
          senderName,
          text: encryptedMessage,
          timestamp: serverTimestamp(),
          read: false,
          isEncrypted: true,
          deliveryStatus: "sent",
        });
      }

      setMessageText("");
      setBanMessage(null);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("An error occurred while sending the message. Please try again.");
    }
  };

  const formatTime = useCallback((timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  }, []);

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await updateDoc(doc(db, "users", user.uid), {
        online: false,
        lastSeen: serverTimestamp(),
      });
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const renderDeliveryStatus = (msg: ChatMessage, isMine: boolean) => {
    if (!isMine) return null;
    let label = "Sent";
    let icon = <CheckIcon size={11} color="#ffffff" />;
    if (msg.read) {
      label = "Read";
      icon = <DoubleCheckIcon size={11} color="#ffffff" />;
    } else if (msg.deliveryStatus === "delivered") {
      label = "Delivered";
      icon = <DoubleCheckIcon size={11} color="#ffffff" />;
    } else if (msg.deliveryStatus === "sending") {
      label = "Sending";
      icon = <ClockIcon size={11} color="#ffffff" />;
    } else if (msg.deliveryStatus === "failed") {
      label = "Failed";
      icon = <ErrorIcon size={11} color="#ffffff" />;
    }
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "3px",
          fontSize: "10px",
          color: "#ffffff",
          fontFamily: FONT_FAMILY,
          fontWeight: 500,
        }}
      >
        {label}
        {icon}
      </span>
    );
  };

  const filteredContacts = contacts.filter(
    (c) =>
      c.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredGroups = groups.filter(
    (g) =>
      g.groupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredAllUsers = allUsers.filter(
    (u) =>
      u.userName.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.userEmail.toLowerCase().includes(userSearchQuery.toLowerCase())
  );
  const filteredMessages = messageSearchQuery.trim()
    ? messages.filter(
        (m) =>
          m.text.toLowerCase().includes(messageSearchQuery.toLowerCase()) ||
          m.senderName.toLowerCase().includes(messageSearchQuery.toLowerCase())
      )
    : messages;

  // ===== RENDER ANNOUNCEMENT & BROADCAST =====
  const renderAnnouncementBroadcastSection = () => {
    if (announcements.length === 0 && broadcasts.length === 0) return null;

    return (
      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {/* ANNOUNCEMENT */}
          {announcements.length > 0 && (
            <div
              style={{
                flex: "1 1 340px",
                backgroundColor: BLUE,
                borderRadius: "12px",
                padding: "16px 20px",
                color: WHITE,
                fontFamily: FONT_FAMILY,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <div style={{ fontSize: "16px", fontWeight: 700, color: WHITE }}>Announcement</div>
                <div
                  style={{
                    fontSize: "10px",
                    border: `1.5px solid ${WHITE}`,
                    backgroundColor: WHITE,
                    color: BLUE,
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontWeight: 800,
                    letterSpacing: "0.5px",
                  }}
                >
                  {announcements.length} ACTIVE
                </div>
              </div>
              <div style={{ maxHeight: "180px", overflowY: "auto" }} className="announcement-list-scroll">
                {announcements.slice(0, 5).map((a) => {
                  const isSelected = selectedAnnouncementId === a.id;
                  return (
                    <div
                      key={a.id}
                      onClick={() => handleAnnouncementClick(a)}
                      style={{
                        padding: "10px 12px",
                        borderTop: "1px solid rgba(255,255,255,0.15)",
                        cursor: "pointer",
                        borderRadius: "8px",
                        backgroundColor: isSelected ? "rgba(255,255,255,0.18)" : "transparent",
                        transition: "background-color 0.2s",
                        marginTop: "4px",
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLDivElement).style.backgroundColor =
                          "rgba(255,255,255,0.12)")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLDivElement).style.backgroundColor = isSelected
                          ? "rgba(255,255,255,0.18)"
                          : "transparent")
                      }
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "4px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: 700,
                            color: WHITE,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {a.userName}
                        </div>
                        <span
                          style={{
                            fontSize: "9px",
                            fontWeight: 800,
                            color: BLUE,
                            backgroundColor: WHITE,
                            padding: "2px 6px",
                            borderRadius: "4px",
                            letterSpacing: "0.5px",
                            textTransform: "uppercase",
                            flexShrink: 0,
                          }}
                        >
                          {a.topic}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "rgba(255,255,255,0.95)",
                          lineHeight: 1.4,
                          wordBreak: "break-word",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {a.text}
                      </div>
                      <div
                        style={{
                          fontSize: "10px",
                          color: "rgba(255,255,255,0.7)",
                          marginTop: "4px",
                          fontStyle: "italic",
                        }}
                      >
                        Tap to reply →
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* BROADCAST */}
          {broadcasts.length > 0 && (
            <div
              style={{
                flex: "1 1 340px",
                backgroundColor: BLUE,
                borderRadius: "12px",
                padding: "16px 20px",
                color: WHITE,
                fontFamily: FONT_FAMILY,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <div style={{ fontSize: "16px", fontWeight: 700, color: WHITE }}>Broadcasting</div>
                <div
                  style={{
                    fontSize: "10px",
                    border: `1.5px solid ${WHITE}`,
                    backgroundColor: WHITE,
                    color: BLUE,
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontWeight: 800,
                    letterSpacing: "0.5px",
                  }}
                >
                  {broadcasts.length} ACTIVE
                </div>
              </div>
              <div style={{ maxHeight: "180px", overflowY: "auto" }} className="broadcast-list-scroll">
                {broadcasts.slice(0, 5).map((b) => {
                  const isSelected = selectedBroadcastId === b.id;
                  return (
                    <div
                      key={b.id}
                      onClick={() => handleBroadcastClick(b)}
                      style={{
                        padding: "10px 12px",
                        borderTop: "1px solid rgba(255,255,255,0.15)",
                        cursor: "pointer",
                        borderRadius: "8px",
                        backgroundColor: isSelected ? "rgba(255,255,255,0.18)" : "transparent",
                        transition: "background-color 0.2s",
                        marginTop: "4px",
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLDivElement).style.backgroundColor =
                          "rgba(255,255,255,0.12)")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLDivElement).style.backgroundColor = isSelected
                          ? "rgba(255,255,255,0.18)"
                          : "transparent")
                      }
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "4px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: 700,
                            color: WHITE,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {b.userName}
                        </div>
                        <span
                          style={{
                            fontSize: "9px",
                            fontWeight: 800,
                            color: BLUE,
                            backgroundColor: WHITE,
                            padding: "2px 6px",
                            borderRadius: "4px",
                            letterSpacing: "0.5px",
                            textTransform: "uppercase",
                            flexShrink: 0,
                          }}
                        >
                          {b.topic}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "rgba(255,255,255,0.95)",
                          lineHeight: 1.4,
                          wordBreak: "break-word",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {b.text}
                      </div>
                      <div
                        style={{
                          fontSize: "10px",
                          color: "rgba(255,255,255,0.7)",
                          marginTop: "4px",
                          fontStyle: "italic",
                        }}
                      >
                        Tap to reply →
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ===== RENDER CHAT LIST ITEM =====
  const renderChatListItem = (item: ChatContact | ChatGroup, type: "contact" | "group") => {
    const isContact = type === "contact";
    const contact = item as ChatContact;
    const group = item as ChatGroup;
    const isActive = isContact
      ? selectedContact?.id === contact.id
      : selectedGroup?.id === group.id;
    const key = isContact ? `c_${contact.id}` : `g_${group.id}`;
    const previews = chatPreviews[key] || [];
    const sentCount = sentCounts[key] || 0;
    const displayName = isContact ? contact.userName : group.groupName;

    return (
      <div
        key={isContact ? contact.id : group.id}
        ref={(el) => {
          if (isContact) contactItemRefs.current[contact.id] = el;
          else groupItemRefs.current[group.id] = el;
        }}
        onClick={() => {
          if (isContact) {
            setSelectedContact(contact);
            setSelectedGroup(null);
          } else {
            setSelectedGroup(group);
            setSelectedContact(null);
          }
        }}
        style={{
          padding: "14px 16px",
          borderLeft: isActive ? `3px solid ${WHITE}` : "3px solid transparent",
          backgroundColor: isActive ? "rgba(255,255,255,0.14)" : "transparent",
          cursor: "pointer",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          transition: "background-color 0.2s ease",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "6px",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: "14px",
              color: WHITE,
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flex: "1 1 auto",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {displayName}
            {isContact && contact.online && (
              <span
                style={{
                  display: "inline-block",
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: "#4CAF50",
                  flexShrink: 0,
                }}
              />
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
            <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.75)", fontWeight: 700 }}>
              {isContact ? `${sentCount} sent` : `${group.members.length} members`}
            </span>
            {isContact && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteContact(contact.id);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "2px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0.6,
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.6")}
              >
                <CloseIcon size={12} color={WHITE} />
              </button>
            )}
          </div>
        </div>

        {previews.length > 0 ? (
          <div style={{ marginTop: "6px", display: "flex", flexDirection: "column", gap: "3px" }}>
            {[...previews].reverse().map((p, i) => (
              <div
                key={i}
                style={{
                  fontSize: "11px",
                  color: "#ffffff",
                  fontStyle: "italic",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontFamily: FONT_FAMILY,
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span style={{ fontWeight: 700, color: "#ffffff", flexShrink: 0 }}>
                  {p.senderName}:
                </span>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", color: "#ffffff" }}>
                  {p.text.length > 30 ? p.text.substring(0, 30) + "..." : p.text}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              fontSize: "11px",
              color: "rgba(255,255,255,0.65)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontFamily: FONT_FAMILY,
            }}
          >
            {isContact
              ? contact.userEmail
              : `${group.members.length} members · ${group.description}`}
          </div>
        )}
      </div>
    );
  };

  // ===== EARLY RETURNS =====
  if (checkingBan) {
    return (
      <div style={{ marginTop: "80px", paddingTop: "30px" }}>
        <h3
          style={{
            fontSize: "80px",
            fontWeight: 700,
            color: BLUE,
            fontFamily: FONT_FAMILY,
            letterSpacing: "-0.03em",
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          Live Chat
        </h3>
        <div style={{ padding: "20px", textAlign: "center", color: "#666", fontFamily: FONT_FAMILY }}>
          Checking account status...
        </div>
      </div>
    );
  }
  if (!isMounted) return <div style={{ minHeight: "100px" }} />;

  if (!user) {
    return (
      <div style={{ marginTop: "80px", paddingTop: "30px" }}>
        <h3
          ref={liveChatTitleRef}
          style={{
            fontSize: "80px",
            fontWeight: 700,
            color: BLUE,
            fontFamily: FONT_FAMILY,
            letterSpacing: "-0.03em",
            margin: 0,
            lineHeight: 1.1,
            marginBottom: "20px",
          }}
        >
          Live Chat
        </h3>
        <p style={{ fontSize: "15px", color: "#666", fontFamily: FONT_FAMILY, marginBottom: "10px" }}>
          Please login to use Live Chat
        </p>
        <Link href="/" style={{ textDecoration: "none" }}>
          <button
            style={{
              padding: "8px 20px",
              backgroundColor: BLUE,
              color: WHITE,
              border: "none",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: 600,
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

  if (isBanned) {
    return (
      <div style={{ marginTop: "80px", paddingTop: "30px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "20px",
          }}
        >
          <h3
            style={{
              fontSize: "80px",
              fontWeight: 700,
              color: BLUE,
              fontFamily: FONT_FAMILY,
              letterSpacing: "-0.03em",
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            Live Chat
          </h3>
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "0",
              backgroundColor: "transparent",
              color: BLUE,
              border: "none",
              fontSize: "20px",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: FONT_FAMILY,
            }}
          >
            <span>Logout</span>
            <ArrowRight size={20} color={BLUE} />
          </button>
        </div>
        <div
          style={{
            color: BLUE,
            fontSize: "50px",
            fontWeight: 700,
            fontFamily: FONT_FAMILY,
            lineHeight: 1.2,
            marginBottom: "12px",
            letterSpacing: "-0.02em",
          }}
        >
          YOUR ACCOUNT HAS BEEN PERMANENTLY BANNED
        </div>
        <div
          style={{
            color: BLUE,
            fontSize: "22px",
            fontWeight: 400,
            fontFamily: FONT_FAMILY,
            marginBottom: "6px",
          }}
        >
          REASON: {banReason || "SUSPICIOUS ACTIVITY"}
        </div>
      </div>
    );
  }

  // ===== MAIN RENDER =====
  return (
    <div style={{ marginTop: "80px", paddingTop: "30px" }}>
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <h3
          ref={liveChatTitleRef}
          style={{
            fontSize: "80px",
            fontWeight: 700,
            color: BLUE,
            fontFamily: FONT_FAMILY,
            letterSpacing: "-0.03em",
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          Live Chat
        </h3>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "10px",
            paddingTop: "10px",
          }}
        >
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "0",
              backgroundColor: "transparent",
              color: BLUE,
              border: "none",
              fontSize: "20px",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: FONT_FAMILY,
            }}
          >
            <span>Logout</span>
            <ArrowRight size={20} color={BLUE} />
          </button>
        </div>
      </div>

      {/* ANNOUNCEMENT & BROADCAST */}
      {renderAnnouncementBroadcastSection()}

      {/* MAIN LAYOUT */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          height: "700px",
          width: "100%",
          overflow: "hidden",
          borderRadius: "12px",
        }}
      >
        {/* ONLINE USERS PANEL */}
        <div
          className="online-panel-container"
          style={{
            width: "240px",
            backgroundColor: WHITE,
            borderRadius: "12px",
            border: "1px solid rgba(0,0,0,0.08)",
            flexShrink: 0,
            height: "700px",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "14px 16px",
              backgroundColor: BLUE,
              color: WHITE,
              fontWeight: 700,
              fontSize: "14px",
              fontFamily: FONT_FAMILY,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
            }}
          >
            <span>Online Users</span>
            <span
              style={{
                fontSize: "11px",
                color: WHITE,
                padding: "2px 8px",
                borderRadius: "4px",
                border: `1.5px solid ${WHITE}`,
                fontWeight: 700,
                letterSpacing: "0.5px",
              }}
            >
              {onlineUsers.length}
            </span>
          </div>
          <div style={{ overflowY: "auto", flex: 1, minHeight: 0 }}>
            {onlineUsers.length === 0 ? (
              <div
                style={{
                  padding: "30px 16px",
                  textAlign: "center",
                  color: "#999",
                  fontSize: "13px",
                  fontFamily: FONT_FAMILY,
                }}
              >
                No users online
              </div>
            ) : (
              onlineUsers.map((u) => (
                <div
                  key={u.id}
                  ref={(el) => {
                    onlineUserItemRefs.current[u.id] = el;
                  }}
                  onClick={() => {
                    setSelectedContact(u);
                    setSelectedGroup(null);
                  }}
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #f0f0f0",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontFamily: FONT_FAMILY,
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLDivElement).style.backgroundColor = "rgba(13,60,252,0.05)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLDivElement).style.backgroundColor = "transparent")
                  }
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "8px",
                      backgroundColor: BLUE,
                      color: WHITE,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: "14px",
                      overflow: "hidden",
                      flexShrink: 0,
                    }}
                  >
                    {u.userPhoto ? (
                      <img
                        src={u.userPhoto}
                        alt={u.userName}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      u.userName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: BLACK,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        marginBottom: "3px",
                      }}
                    >
                      {u.userName}
                    </div>
                    <span
                      style={{
                        display: "inline-block",
                        fontSize: "10px",
                        fontWeight: 800,
                        color: BLUE,
                        letterSpacing: "0.5px",
                        textTransform: "uppercase",
                      }}
                    >
                      Online
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* SIDEBAR — CHAT LIST */}
        <div
          className="chat-list-container"
          style={{
            width: "360px",
            backgroundColor: BLUE,
            borderRadius: "12px",
            border: "none",
            overflow: "hidden",
            flexShrink: 0,
            height: "700px",
            color: WHITE,
            fontFamily: FONT_FAMILY,
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          {/* HEADER */}
          <div
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.15)",
              fontWeight: 700,
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: BLUE,
              flexShrink: 0,
            }}
          >
            <span style={{ color: WHITE, letterSpacing: "0.3px" }}>Chat History</span>
            <span
              style={{
                fontSize: "11px",
                color: WHITE,
                padding: "2px 8px",
                borderRadius: "4px",
                border: `1.5px solid ${WHITE}`,
                backgroundColor: "rgba(255,255,255,0.12)",
                fontWeight: 800,
                letterSpacing: "0.5px",
              }}
            >
              {contacts.length + groups.length}
            </span>
          </div>

          {/* SEARCH */}
          <div
            style={{
              padding: "10px 14px",
              borderBottom: "1px solid rgba(255,255,255,0.15)",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 12px",
                backgroundColor: WHITE,
                border: `1.5px solid ${WHITE}`,
                borderRadius: "8px",
              }}
            >
              <SearchIcon size={14} color={BLUE} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats..."
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: BLUE,
                  fontSize: "12px",
                  fontFamily: FONT_FAMILY,
                  padding: 0,
                  caretColor: BLUE,
                  fontWeight: 600,
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: BLUE,
                    cursor: "pointer",
                    fontSize: "14px",
                    padding: 0,
                    lineHeight: 1,
                    fontFamily: FONT_FAMILY,
                    fontWeight: 700,
                  }}
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* CHAT LIST */}
          <div style={{ overflowY: "auto", flex: 1, minHeight: 0 }}>
            {filteredGroups.length > 0 && (
              <>
                <div
                  style={{
                    padding: "10px 16px 6px",
                    fontSize: "10px",
                    fontWeight: 800,
                    color: "rgba(255,255,255,0.6)",
                    letterSpacing: "0.8px",
                    textTransform: "uppercase",
                  }}
                >
                  Groups
                </div>
                {filteredGroups.map((g) => renderChatListItem(g, "group"))}
              </>
            )}

            {filteredContacts.length > 0 && (
              <>
                <div
                  style={{
                    padding: "10px 16px 6px",
                    fontSize: "10px",
                    fontWeight: 800,
                    color: "rgba(255,255,255,0.6)",
                    letterSpacing: "0.8px",
                    textTransform: "uppercase",
                  }}
                >
                  Contacts
                </div>
                {filteredContacts.map((c) => renderChatListItem(c, "contact"))}
              </>
            )}

            {filteredContacts.length === 0 && filteredGroups.length === 0 && (
              <div
                style={{
                  padding: "30px 16px",
                  textAlign: "center",
                  color: WHITE,
                  fontSize: "13px",
                }}
              >
                {searchQuery ? "No results found" : "No contacts yet. Add a user to start chatting."}
              </div>
            )}
          </div>

          {/* ADD USER / ADD GROUP */}
          <div
            style={{
              padding: "12px 16px",
              borderTop: "1px solid rgba(255,255,255,0.1)",
              flexShrink: 0,
              backgroundColor: BLUE,
            }}
          >
            <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
              <button
                ref={addUserBtnRef}
                onClick={() => {
                  setShowAddUserForm(!showAddUserForm);
                  setShowAddGroupForm(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  flex: 1,
                  padding: "10px 8px",
                  backgroundColor: WHITE,
                  color: BLUE,
                  border: `1.5px solid ${WHITE}`,
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 800,
                  cursor: "pointer",
                  fontFamily: FONT_FAMILY,
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}
                onMouseEnter={(e) =>
                  gsap.to(e.currentTarget, {
                    scale: 1.03,
                    boxShadow: "0 0 20px rgba(255,255,255,0.3)",
                    duration: 0.3,
                  })
                }
                onMouseLeave={(e) =>
                  gsap.to(e.currentTarget, {
                    scale: 1,
                    boxShadow: "0 0 0px rgba(255,255,255,0)",
                    duration: 0.3,
                  })
                }
              >
                <PlusIcon size={14} color={BLUE} />
                Add User
              </button>

              <button
                ref={addGroupBtnRef}
                onClick={() => {
                  setShowAddGroupForm(!showAddGroupForm);
                  setShowAddUserForm(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  flex: 1,
                  padding: "10px 8px",
                  backgroundColor: WHITE,
                  color: BLUE,
                  border: `1.5px solid ${WHITE}`,
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 800,
                  cursor: "pointer",
                  fontFamily: FONT_FAMILY,
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}
                onMouseEnter={(e) =>
                  gsap.to(e.currentTarget, {
                    scale: 1.03,
                    boxShadow: "0 0 20px rgba(255,255,255,0.3)",
                    duration: 0.3,
                  })
                }
                onMouseLeave={(e) =>
                  gsap.to(e.currentTarget, {
                    scale: 1,
                    boxShadow: "0 0 0px rgba(255,255,255,0)",
                    duration: 0.3,
                  })
                }
              >
                <PlusIcon size={14} color={BLUE} />
                Add Group
              </button>
            </div>

            {/* ADD USER FORM */}
            {showAddUserForm && (
              <div
                ref={addUserFormRef}
                style={{
                  backgroundColor: WHITE,
                  borderRadius: "10px",
                  padding: "12px",
                  border: `1.5px solid ${WHITE}`,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    color: BLUE,
                    marginBottom: "8px",
                    fontWeight: 800,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                  }}
                >
                  Select User ({allUsers.length} available)
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 10px",
                    backgroundColor: WHITE,
                    border: `1.5px solid ${BLUE}`,
                    borderRadius: "6px",
                    marginBottom: "8px",
                  }}
                >
                  <SearchIcon size={12} color={BLUE} />
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Search user..."
                    style={{
                      flex: 1,
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      color: BLUE,
                      fontSize: "12px",
                      fontFamily: FONT_FAMILY,
                      padding: 0,
                      caretColor: BLUE,
                      fontWeight: 600,
                    }}
                  />
                </div>
                <div
                  style={{
                    maxHeight: "200px",
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  {filteredAllUsers.length === 0 ? (
                    <div style={{ padding: "14px", textAlign: "center", color: BLUE, fontSize: "12px" }}>
                      No users found
                    </div>
                  ) : (
                    filteredAllUsers.map((u) => {
                      const alreadyAdded = contacts.some((c) => c.userId === u.userId);
                      return (
                        <div
                          key={u.id}
                          onClick={() => {
                            if (addingUserId) return;
                            handleAddUserToContacts(u);
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "8px 10px",
                            borderRadius: "6px",
                            cursor: addingUserId ? "wait" : "pointer",
                            backgroundColor: WHITE,
                            border: `1px solid ${BLUE}`,
                          }}
                          onMouseEnter={(e) =>
                            ((e.currentTarget as HTMLDivElement).style.backgroundColor =
                              "rgba(13,60,252,0.08)")
                          }
                          onMouseLeave={(e) =>
                            ((e.currentTarget as HTMLDivElement).style.backgroundColor = WHITE)
                          }
                        >
                          <div
                            style={{
                              width: "30px",
                              height: "30px",
                              borderRadius: "6px",
                              backgroundColor: BLUE,
                              color: WHITE,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 800,
                              fontSize: "12px",
                              flexShrink: 0,
                              overflow: "hidden",
                            }}
                          >
                            {u.userPhoto ? (
                              <img
                                src={u.userPhoto}
                                alt={u.userName}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            ) : (
                              u.userName.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: "12px",
                                fontWeight: 700,
                                color: BLUE,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {u.userName}
                            </div>
                            <div
                              style={{
                                fontSize: "10px",
                                color: BLUE,
                                opacity: 0.7,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {u.userEmail}
                            </div>
                          </div>
                          {alreadyAdded && (
                            <span
                              style={{
                                fontSize: "9px",
                                fontWeight: 800,
                                color: WHITE,
                                backgroundColor: BLUE,
                                padding: "2px 6px",
                                borderRadius: "4px",
                                letterSpacing: "0.5px",
                                textTransform: "uppercase",
                                flexShrink: 0,
                              }}
                            >
                              Added
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* ADD GROUP FORM */}
            {showAddGroupForm && (
              <div
                ref={addGroupFormRef}
                style={{
                  backgroundColor: WHITE,
                  borderRadius: "10px",
                  padding: "14px",
                  border: `1.5px solid ${WHITE}`,
                  overflow: "hidden",
                }}
              >
                <div style={{ marginBottom: "10px" }}>
                  <input
                    type="text"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Group name"
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "6px",
                      border: `1.5px solid ${BLUE}`,
                      backgroundColor: WHITE,
                      color: BLUE,
                      fontSize: "13px",
                      fontFamily: FONT_FAMILY,
                      outline: "none",
                      boxSizing: "border-box",
                      fontWeight: 600,
                    }}
                  />
                </div>
                <div style={{ marginBottom: "10px" }}>
                  <textarea
                    value={newGroupDesc}
                    onChange={(e) => setNewGroupDesc(e.target.value)}
                    placeholder="Description"
                    rows={2}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "6px",
                      border: `1.5px solid ${BLUE}`,
                      backgroundColor: WHITE,
                      color: BLUE,
                      fontSize: "13px",
                      fontFamily: FONT_FAMILY,
                      outline: "none",
                      resize: "none",
                      boxSizing: "border-box",
                      fontWeight: 600,
                    }}
                  />
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: BLUE,
                    marginBottom: "6px",
                    fontWeight: 800,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                  }}
                >
                  Select Members ({selectedMembers.length})
                </div>
                <div
                  style={{
                    maxHeight: "120px",
                    overflowY: "auto",
                    marginBottom: "10px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  {allUsers.map((c) => (
                    <label
                      key={c.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "4px 6px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                        color: BLUE,
                        backgroundColor: selectedMembers.includes(c.userId)
                          ? "rgba(13,60,252,0.1)"
                          : WHITE,
                        border: `1px solid ${BLUE}`,
                        fontWeight: 600,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(c.userId)}
                        onChange={() => toggleMember(c.userId)}
                        style={{ accentColor: BLUE }}
                      />
                      {c.userName}
                    </label>
                  ))}
                </div>
                {groupError && (
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#d32f2f",
                      marginBottom: "8px",
                      fontWeight: 600,
                    }}
                  >
                    {groupError}
                  </div>
                )}
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => {
                      setShowAddGroupForm(false);
                      setGroupError("");
                    }}
                    style={{
                      flex: 1,
                      padding: "8px",
                      backgroundColor: WHITE,
                      color: BLUE,
                      border: `1.5px solid ${BLUE}`,
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 800,
                      cursor: "pointer",
                      fontFamily: FONT_FAMILY,
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddGroup}
                    disabled={addingGroup}
                    style={{
                      flex: 1,
                      padding: "8px",
                      backgroundColor: WHITE,
                      color: BLUE,
                      border: `1.5px solid ${BLUE}`,
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 800,
                      cursor: addingGroup ? "not-allowed" : "pointer",
                      fontFamily: FONT_FAMILY,
                      opacity: addingGroup ? 0.6 : 1,
                    }}
                  >
                    {addingGroup ? "..." : "Create"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CHAT VIEW */}
        <div
          style={{
            flex: 1,
            backgroundColor: WHITE,
            borderRadius: "12px",
            border: "1px solid rgba(0,0,0,0.06)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            height: "700px",
            minWidth: 0,
          }}
        >
          {selectedContact || selectedGroup ? (
            <>
              {/* CHAT HEADER */}
              <div
                style={{
                  padding: "16px 20px",
                  backgroundColor: BLUE,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexShrink: 0,
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "17px",
                      color: WHITE,
                      fontFamily: FONT_FAMILY,
                      marginBottom: "4px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    {selectedContact ? selectedContact.userName : selectedGroup?.groupName}
                    {selectedContact && selectedContact.online && (
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 800,
                          color: WHITE,
                          backgroundColor: "rgba(76,175,80,0.9)",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          letterSpacing: "0.5px",
                          textTransform: "uppercase",
                        }}
                      >
                        Online
                      </span>
                    )}
                    {(selectedAnnouncementId || selectedBroadcastId) && (
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 800,
                          color: BLUE,
                          backgroundColor: WHITE,
                          padding: "2px 8px",
                          borderRadius: "4px",
                          letterSpacing: "0.5px",
                          textTransform: "uppercase",
                        }}
                      >
                        {selectedAnnouncementId ? "Announcement" : "Broadcast"}
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "rgba(255,255,255,0.75)",
                      fontWeight: 600,
                    }}
                  >
                    {selectedContact
                      ? selectedContact.userEmail
                      : `${selectedGroup?.members.length} members · ${selectedGroup?.description}`}
                  </div>
                </div>

                {/* SEARCH IN CHAT */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 12px",
                    backgroundColor: WHITE,
                    border: `1.5px solid ${WHITE}`,
                    borderRadius: "8px",
                    minWidth: "220px",
                  }}
                >
                  <SearchIcon size={14} color={BLUE} />
                  <input
                    type="text"
                    value={messageSearchQuery}
                    onChange={(e) => setMessageSearchQuery(e.target.value)}
                    placeholder="Search in chat..."
                    style={{
                      flex: 1,
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      color: BLUE,
                      fontSize: "12px",
                      fontFamily: FONT_FAMILY,
                      padding: 0,
                      caretColor: BLUE,
                      fontWeight: 600,
                    }}
                  />
                  {messageSearchQuery && (
                    <button
                      onClick={() => setMessageSearchQuery("")}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: BLUE,
                        cursor: "pointer",
                        fontSize: "14px",
                        padding: 0,
                        lineHeight: 1,
                        fontFamily: FONT_FAMILY,
                        fontWeight: 700,
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>

                <CloseRoomButton
                  onConfirm={() => {
                    setShowCloseConfirm(true);
                    setTimeout(() => setShowCloseConfirm(false), 2200);
                  }}
                />
              </div>

              {/* INFO TOAST */}
              {showCloseConfirm && (
                <div
                  style={{
                    padding: "10px 20px",
                    backgroundColor: BLUE,
                    borderBottom: `1.5px solid ${BLUE}`,
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontFamily: FONT_FAMILY,
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      padding: "3px 9px",
                      border: `1.5px solid ${WHITE}`,
                      backgroundColor: WHITE,
                      color: BLUE,
                      fontSize: "10px",
                      fontWeight: 800,
                      letterSpacing: "0.5px",
                      borderRadius: "4px",
                      textTransform: "uppercase",
                    }}
                  >
                    Info
                  </span>
                  <span style={{ fontSize: "13px", color: WHITE, fontWeight: 600 }}>
                    Room chat siap ditutup. Fitur close room tidak menghapus history.
                  </span>
                </div>
              )}

              {/* ROLLING MESSAGES */}
              {rollingMessages.length > 0 && (
                <div
                  style={{
                    padding: "12px 16px",
                    borderBottom: `1.5px solid ${BLUE}`,
                    backgroundColor: "#f8f9ff",
                    flexShrink: 0,
                    maxHeight: "220px",
                    overflowY: "auto",
                  }}
                  className="rolling-messages-container"
                >
                  <div
                    style={{
                      fontSize: "10px",
                      fontWeight: 800,
                      color: BLUE,
                      letterSpacing: "0.8px",
                      textTransform: "uppercase",
                      marginBottom: "8px",
                      fontFamily: FONT_FAMILY,
                    }}
                  >
                    Your Sent Messages ({rollingMessages.length})
                  </div>
                  {rollingMessages.map((item) => (
                    <RollingMessageItemComponent key={item.id} item={item} index={0} />
                  ))}
                </div>
              )}

              {/* MESSAGES BODY */}
              <div
                ref={chatMessagesContainerRef}
                className="chat-messages-container"
                style={{
                  flex: 1,
                  overflowY: "auto",
                  overflowX: "hidden",
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  minHeight: 0,
                }}
              >
                {filteredMessages.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      color: "#999",
                      fontSize: "15px",
                      padding: "30px 0",
                      fontFamily: FONT_FAMILY,
                    }}
                  >
                    {messageSearchQuery ? "No messages found" : "No messages yet"}
                  </div>
                ) : (
                  filteredMessages.map((msg, idx) => {
                    const isMine = msg.senderId === user.uid;
                    return (
                      <div
                        key={msg.id || idx}
                        style={{
                          alignSelf: isMine ? "flex-end" : "flex-start",
                          maxWidth: "70%",
                        }}
                      >
                        <div
                          style={{
                            padding: "12px 16px",
                            borderRadius: "12px",
                            backgroundColor: isMine ? BLUE : "#f4f4f5",
                            color: isMine ? WHITE : BLACK,
                            fontSize: "15px",
                            fontFamily: FONT_FAMILY,
                            wordBreak: "break-word",
                            border: isMine ? "none" : "1px solid rgba(0,0,0,0.05)",
                          }}
                        >
                          {!isMine && (
                            <div
                              style={{
                                fontSize: "12px",
                                fontWeight: 700,
                                color: BLUE,
                                marginBottom: "5px",
                              }}
                            >
                              {msg.senderName}
                            </div>
                          )}
                          <div>{msg.text}</div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "flex-end",
                              alignItems: "center",
                              gap: "6px",
                              marginTop: "5px",
                            }}
                          >
                            {renderDeliveryStatus(msg, isMine)}
                            <span
                              style={{
                                fontSize: "10px",
                                color: isMine ? WHITE : "#999",
                              }}
                            >
                              {formatTime(msg.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* INPUT */}
              <div
                style={{
                  padding: "16px 24px",
                  borderTop: "1px solid rgba(0,0,0,0.06)",
                  display: "flex",
                  gap: "12px",
                  backgroundColor: WHITE,
                  flexShrink: 0,
                }}
              >
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && messageText.trim()) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    border: "1px solid rgba(0,0,0,0.1)",
                    borderRadius: "10px",
                    fontSize: "15px",
                    outline: "none",
                    fontFamily: FONT_FAMILY,
                    backgroundColor: WHITE,
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!messageText.trim()}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: !messageText.trim() ? "#ccc" : BLUE,
                    color: WHITE,
                    border: "none",
                    borderRadius: "10px",
                    cursor: !messageText.trim() ? "not-allowed" : "pointer",
                    fontFamily: FONT_FAMILY,
                    fontSize: "14px",
                    fontWeight: 800,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                  }}
                >
                  Send
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
                color: "#999",
                fontSize: "15px",
                fontFamily: FONT_FAMILY,
                padding: "20px",
                textAlign: "center",
              }}
            >
              Select a chat from the list on the left, or click an announcement / broadcast above
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ===== MAIN PAGE =====
export default function LiveChatPage(): React.JSX.Element {
  const [showMain, setShowMain] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
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
        setIsAdmin(currentUser.email === ADMIN_EMAIL);
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
      .to(
        preloaderRef.current,
        { scale: 0.95, opacity: 0.8, duration: 0.3, ease: "power2.inOut" },
        "-=0.3"
      );
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
          <span
            style={{
              fontSize: "100px",
              fontWeight: 700,
              color: BLUE,
              fontFamily: FONT_FAMILY,
              letterSpacing: "-0.03em",
            }}
          >
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
          <span
            style={{
              fontSize: "100px",
              fontWeight: 700,
              color: BLUE,
              fontFamily: FONT_FAMILY,
              letterSpacing: "-0.03em",
            }}
          >
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
        <title>Live Chat | Menuru Official</title>
        <meta name="description" content="Live Chat Menuru" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />
        <meta name="theme-color" content={BLUE} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Menuru" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="icon" href="/images/ai.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/images/ai.jpg" />
        <meta property="og:title" content="Live Chat | Menuru Official" />
        <meta property="og:description" content="Live Chat Menuru" />
        <meta property="og:image" content="/images/ai.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Live Chat | Menuru Official" />
        <meta name="twitter:description" content="Live Chat Menuru" />
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
        <HeroMenuruTitle onNavbarShiftChange={setNavbarShifted} />

        <div style={{ padding: "0 40px", maxWidth: "1600px", margin: "0 auto", width: "100%" }}>
          <LiveChat user={user} isAdmin={isAdmin} db={db} auth={auth} />
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
            <img
              src="/images/p0l.jpg"
              alt=""
              style={{ width: "100%", height: "auto", display: "block", objectFit: "cover" }}
            />
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
            <img
              src="/images/xxz.jpg"
              alt=""
              style={{ width: "100%", height: "auto", display: "block", objectFit: "cover" }}
            />
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

      {/* GLOBAL STYLES */}
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
        .split-char-livechat {
          display: inline-block;
          will-change: transform, opacity, filter;
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
        .chat-messages-container::-webkit-scrollbar,
        .chat-list-container::-webkit-scrollbar,
        .chat-list-container > div::-webkit-scrollbar,
        .online-panel-container::-webkit-scrollbar,
        .online-panel-container > div::-webkit-scrollbar,
        .rolling-messages-container::-webkit-scrollbar,
        .announcement-list-scroll::-webkit-scrollbar,
        .broadcast-list-scroll::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        .chat-messages-container,
        .chat-list-container,
        .chat-list-container > div,
        .online-panel-container,
        .online-panel-container > div,
        .rolling-messages-container,
        .announcement-list-scroll,
        .broadcast-list-scroll {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
      `}</style>
    </>
  );
}
