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
import { motion, AnimatePresence } from "framer-motion";

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
const AGENT_NAME = "Farid Ardiansyah";

// ===== COLORS =====
const BLUE = "#0D3CFC";
const WHITE = "#FFFFFF";
const BLACK = "#000000";

// ===== ENCRYPTION AES-256-GCM =====
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
      { name: "AES-GCM", iv: iv, tagLength: 128 },
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
      { name: "AES-GCM", iv: iv, tagLength: 128 },
      key,
      encryptedData
    );
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
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
    if (lowerText.includes(keyword)) return { isBanned: true, reason: `Online Gambling (${keyword})` };
  }
  for (const keyword of BAN_KEYWORDS.PHISHING) {
    if (lowerText.includes(keyword)) return { isBanned: true, reason: `Phishing/Scam (${keyword})` };
  }
  for (const keyword of BAN_KEYWORDS.MALICIOUS) {
    if (lowerText.includes(keyword)) return { isBanned: true, reason: `Malicious Content (${keyword})` };
  }
  for (const keyword of BAN_KEYWORDS.SUSPICIOUS_LINKS) {
    if (lowerText.includes(keyword)) return { isBanned: true, reason: `Suspicious Link (${keyword})` };
  }
  const ipPattern = /[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/;
  if (ipPattern.test(lowerText)) return { isBanned: true, reason: "Suspicious IP Address" };
  const repeatedNumber = /[0-9]{10,}/;
  if (repeatedNumber.test(lowerText)) return { isBanned: true, reason: "Suspicious Number" };
  const transferPatterns = [
    /kirim ke rek/i, /transfer ke/i, /bayar ke/i, /setor ke/i,
    /minta kirim/i, /mohon kirim/i, /tolong kirim/i,
  ];
  for (const pattern of transferPatterns) {
    if (pattern.test(lowerText)) return { isBanned: true, reason: "Transfer/Payment Request" };
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
      userId, userEmail, userName,
      isBlocked: true, blockedAt: now, blockedReason: reason, blockedMessage: message,
      canCreateTicket: false, canSendMessage: false,
      violations: [{ type: "BANNED", reason, timestamp: now, message, confidence: 100 }],
      totalViolations: 1, warningCount: 0, firstViolation: now, lastViolation: now,
    });
    await updateDoc(doc(db, "users", userId), {
      botBlocked: true, botBlockedAt: serverTimestamp(),
      botBlockedReason: reason, botBlockedMessage: message,
      canCreateTicket: false, canSendMessage: false,
    });
    await addDoc(collection(db, "bot_violations_log"), {
      userId, userEmail, userName,
      violation: { type: "BANNED", reason, timestamp: now, message, confidence: 100 },
      timestamp: serverTimestamp(), resolved: false, isBan: true,
    });
  } catch (error) {
    console.error("Error banning user:", error);
  }
}

// ===== CHECK BAN STATUS =====
async function checkBanStatus(userId: string): Promise<{
  isBanned: boolean; reason: string; message: string;
  canCreateTicket: boolean; canSendMessage: boolean;
}> {
  if (!db) return { isBanned: false, reason: "", message: "", canCreateTicket: true, canSendMessage: true };
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
    return { isBanned: false, reason: "", message: "", canCreateTicket: true, canSendMessage: true };
  } catch (error) {
    console.error("Error checking ban status:", error);
    return { isBanned: false, reason: "", message: "", canCreateTicket: true, canSendMessage: true };
  }
}

// ===== STATUS STYLES =====
const STATUS_STYLES: {
  [key: string]: {
    label: string;
    bg: string;
    text: string;
    border: string;
  };
} = {
  waiting: {
    label: "Waiting",
    bg: WHITE,
    text: BLUE,
    border: BLUE,
  },
  active: {
    label: "Active",
    bg: BLACK,
    text: WHITE,
    border: WHITE,
  },
  resolved: {
    label: "Resolved",
    bg: WHITE,
    text: BLUE,
    border: BLUE,
  },
  closed: {
    label: "Closed",
    bg: BLACK,
    text: WHITE,
    border: WHITE,
  },
};

// ===== SVG ICONS =====
const ArrowRight = ({ size = 20, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const CheckIcon = ({ size = 12, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M20 6L9 17L4 12" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const DoubleCheckIcon = ({ size = 12, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M1 12L5 16L13 8" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M11 12L15 16L23 8" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ClockIcon = ({ size = 12, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2.5" />
    <path d="M12 6V12L16 14" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
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
    <path d="M6 6L18 18M18 6L6 18" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const PeopleIcon = ({ size = 20, color = "#ffffff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="8" r="4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 21V19C4 16.7909 5.79086 15 8 15H16C18.2091 15 20 16.7909 20 19V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const TrashIcon = ({ size = 14, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M3 6H5H21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 6V4C8 2.89543 8.89543 2 10 2H14C15.1046 2 16 2.89543 16 4V6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M19 6L18 20C18 21.1046 17.1046 22 16 22H8C6.89543 22 6 21.1046 6 20L5 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const UserPlusIcon = ({ size = 20, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M16 21V19C16 16.7909 14.2091 15 12 15H5C2.79086 15 1 16.7909 1 19V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="8.5" cy="7" r="4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M20 8V14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M23 11H17" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

// ===== STABILO BADGE =====
const StabiloBadge = ({
  label,
  bg,
  text,
  border,
  size = "sm",
}: {
  label: string;
  bg: string;
  text: string;
  border: string;
  size?: "sm" | "md";
}) => {
  const isSmall = size === "sm";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: isSmall ? "3px 9px" : "4px 11px",
        borderRadius: "4px",
        border: `1.5px solid ${border}`,
        backgroundColor: bg,
        color: text,
        fontSize: isSmall ? "10px" : "11px",
        fontWeight: 800,
        letterSpacing: "0.6px",
        textTransform: "uppercase",
        fontFamily: FONT_FAMILY,
        lineHeight: 1.3,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
};

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

// ===== INTERFACES =====
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
  ownerId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhoto?: string;
  addedAt: any;
}

// ===== LIVE CHAT VIEW COMPONENT =====
function LiveChatView({
  user,
  isAdmin,
  db,
  auth,
}: {
  user: any;
  isAdmin: boolean;
  db: any;
  auth: any;
}) {
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [encryptionReady, setEncryptionReady] = useState(false);
  const [checkingBan, setCheckingBan] = useState(true);
  const [isBanned, setIsBanned] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [canSendMessage, setCanSendMessage] = useState(true);

  // Add user form (inline)
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState(false);
  const [addingUser, setAddingUser] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLenRef = useRef<number>(0);
  const messagesCacheRef = useRef<{ [contactId: string]: ChatMessage[] }>({});

  const addFormRef = useRef<HTMLDivElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const contactItemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    setIsMounted(true);
    getCryptoKey()
      .then(() => setEncryptionReady(true))
      .catch(() => setEncryptionReady(true));
  }, []);

  // Check ban
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
        } else {
          setIsBanned(false);
          setCanSendMessage(true);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setCheckingBan(false);
      }
    };
    checkBan();
  }, [user, isMounted]);

  // GSAP: animate add user form on mount
  useEffect(() => {
    if (!isMounted || !addFormRef.current) return;
    gsap.fromTo(
      addFormRef.current,
      { y: 40, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, duration: 0.9, ease: "back.out(1.4)", delay: 0.3 }
    );
  }, [isMounted]);

  // GSAP: animate contacts when added
  useEffect(() => {
    if (!isMounted) return;
    contacts.forEach((c) => {
      const el = contactItemRefs.current[c.id];
      if (el && !el.dataset.animated) {
        el.dataset.animated = "true";
        gsap.fromTo(
          el,
          { x: -60, opacity: 0, scale: 0.9 },
          { x: 0, opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.4)" }
        );
      }
    });
  }, [contacts, isMounted]);

  // Load contacts from Firebase
  useEffect(() => {
    if (!db || !user || !isMounted) return;
    const q = query(
      collection(db, "chat_contacts"),
      where("ownerId", "==", user.uid),
      orderBy("addedAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot: any) => {
      const list: ChatContact[] = [];
      snapshot.forEach((docSnap: any) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as ChatContact);
      });
      setContacts(list);
    });
    return () => unsubscribe();
  }, [db, user, isMounted]);

  // Load messages for selected contact
  useEffect(() => {
    if (!db || !selectedContact || !user || !isMounted) return;

    const chatId = [user.uid, selectedContact.userId].sort().join("_");

    if (messagesCacheRef.current[chatId]) {
      setMessages(messagesCacheRef.current[chatId]);
      prevMessagesLenRef.current = messagesCacheRef.current[chatId].length;
    }

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
            text = "[Encrypted]";
          }
        }
        msgList.push({ id: docSnap.id, ...data, text } as ChatMessage);
      }

      const newLen = msgList.length;
      if (prevMessagesLenRef.current > 0 && newLen > prevMessagesLenRef.current) {
        setTimeout(() => {
          const els = chatContainerRef.current?.querySelectorAll("[data-msg-id]");
          if (els && els.length > 0) {
            const last = els[els.length - 1];
            gsap.fromTo(
              last,
              { y: 30, opacity: 0, scale: 0.95 },
              { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.4)" }
            );
          }
        }, 50);
      }
      prevMessagesLenRef.current = newLen;

      messagesCacheRef.current[chatId] = msgList;
      setMessages(msgList);

      requestAnimationFrame(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      });
    });

    return () => unsubscribe();
  }, [db, selectedContact, user, isMounted]);

  // Mark messages as read
  useEffect(() => {
    if (!db || !selectedContact || !user || !isMounted) return;
    const chatId = [user.uid, selectedContact.userId].sort().join("_");
    const unread = messages.filter((m) => m.senderId !== user.uid && !m.read);
    unread.forEach(async (msg) => {
      try {
        await updateDoc(doc(db, "direct_messages", chatId, "messages", msg.id), {
          read: true,
          deliveryStatus: "read",
        });
      } catch (e) {
        console.error(e);
      }
    });
  }, [messages, selectedContact, db, user, isMounted]);

  // Add contact
  const handleAddContact = async () => {
    if (!db || !user) return;
    setAddError("");
    if (!newName.trim()) {
      setAddError("Name is required");
      return;
    }
    if (!newEmail.trim() || !newEmail.includes("@")) {
      setAddError("Valid email is required");
      return;
    }
    const existing = contacts.find(
      (c) => c.userEmail.toLowerCase() === newEmail.trim().toLowerCase()
    );
    if (existing) {
      setAddError("This contact already exists");
      return;
    }
    setAddingUser(true);
    try {
      // Try to find registered user by email
      const usersQ = query(
        collection(db, "users"),
        where("email", "==", newEmail.trim().toLowerCase()),
        limit(1)
      );
      const usersSnap = await new Promise<any>((resolve) => {
        const unsub = onSnapshot(usersQ, (s: any) => {
          unsub();
          resolve(s);
        });
      });

      let targetUserId = `guest_${newEmail.trim().toLowerCase()}`;
      let targetPhoto = "";

      if (usersSnap && !usersSnap.empty) {
        const uDoc = usersSnap.docs[0];
        targetUserId = uDoc.id;
        targetPhoto = uDoc.data().photoURL || "";
      }

      await addDoc(collection(db, "chat_contacts"), {
        ownerId: user.uid,
        userId: targetUserId,
        userName: newName.trim(),
        userEmail: newEmail.trim().toLowerCase(),
        userPhoto: targetPhoto,
        addedAt: serverTimestamp(),
      });

      setAddSuccess(true);
      setNewName("");
      setNewEmail("");
      setTimeout(() => setAddSuccess(false), 1500);

      if (addButtonRef.current) {
        gsap.fromTo(
          addButtonRef.current,
          { scale: 0.95 },
          { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.5)" }
        );
      }
    } catch (e) {
      console.error("Error adding contact:", e);
      setAddError("Failed to add user. Try again.");
    } finally {
      setAddingUser(false);
    }
  };

  // Delete contact
  const handleDeleteContact = async (contact: ChatContact) => {
    if (!db) return;
    const el = contactItemRefs.current[contact.id];
    const remove = async () => {
      try {
        await deleteDoc(doc(db, "chat_contacts", contact.id));
        if (selectedContact?.id === contact.id) setSelectedContact(null);
      } catch (e) {
        console.error(e);
      }
    };
    if (el) {
      gsap.to(el, {
        x: 120,
        opacity: 0,
        scale: 0.85,
        duration: 0.4,
        ease: "power2.in",
        onComplete: remove,
      });
    } else {
      remove();
    }
  };

  // Send message
  const handleSendMessage = async () => {
    if (!db || !selectedContact || !user || !messageText.trim()) return;
    if (isBanned) return;
    if (!canSendMessage) return;

    const check = containsBannedContent(messageText);
    if (check.isBanned) {
      await banUserPermanent(user.uid, user.email || "", user.displayName || "User", check.reason, messageText);
      setIsBanned(true);
      setBanReason(check.reason);
      setCanSendMessage(false);
      setMessageText("");
      return;
    }

    if (!encryptionReady) {
      alert("Encryption initializing, please wait.");
      return;
    }

    const text = messageText.trim();
    setMessageText("");

    try {
      const chatId = [user.uid, selectedContact.userId].sort().join("_");
      const encrypted = await encryptMessage(text);

      // ensure chat room doc exists
      await setDoc(
        doc(db, "direct_messages", chatId),
        {
          participants: [user.uid, selectedContact.userId],
          participantNames: {
            [user.uid]: user.displayName || user.email || "User",
            [selectedContact.userId]: selectedContact.userName,
          },
          lastMessage: text,
          lastMessageTime: serverTimestamp(),
          lastMessageSender: user.uid,
        },
        { merge: true }
      );

      await addDoc(collection(db, "direct_messages", chatId, "messages"), {
        senderId: user.uid,
        senderName: user.displayName || user.email || "User",
        text: encrypted,
        timestamp: serverTimestamp(),
        read: false,
        isEncrypted: true,
        deliveryStatus: "sent",
      });
    } catch (e) {
      console.error("Send error:", e);
      alert("Failed to send message.");
      setMessageText(text);
    }
  };

  const formatTime = (ts: any) => {
    if (!ts) return "";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  const filteredContacts = contacts.filter((c) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      c.userName.toLowerCase().includes(q) ||
      c.userEmail.toLowerCase().includes(q)
    );
  });

  if (!isMounted || checkingBan) {
    return (
      <div style={{ paddingTop: "120px", minHeight: "100vh", fontFamily: FONT_FAMILY }}>
        <div style={{ textAlign: "center", color: "#666", fontSize: "16px" }}>
          {checkingBan ? "Checking account status..." : "Loading..."}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ paddingTop: "120px", minHeight: "100vh", fontFamily: FONT_FAMILY, maxWidth: "1200px", margin: "0 auto", padding: "120px 40px 60px" }}>
        <h1 style={{ fontSize: "72px", fontWeight: 700, color: BLUE, letterSpacing: "-0.03em", margin: 0, marginBottom: "20px", lineHeight: 1.05 }}>
          Live Chat
        </h1>
        <p style={{ fontSize: "16px", color: "#666", marginBottom: "20px" }}>
          Please login to use Live Chat.
        </p>
        <Link href="/signin" style={{ textDecoration: "none" }}>
          <button
            style={{
              padding: "12px 28px",
              backgroundColor: BLUE,
              color: WHITE,
              border: "none",
              borderRadius: "10px",
              fontSize: "15px",
              fontWeight: 700,
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
      <div style={{ paddingTop: "120px", minHeight: "100vh", fontFamily: FONT_FAMILY, maxWidth: "1200px", margin: "0 auto", padding: "120px 40px 60px" }}>
        <h1 style={{ fontSize: "72px", fontWeight: 700, color: BLUE, letterSpacing: "-0.03em", margin: 0, marginBottom: "20px", lineHeight: 1.05 }}>
          Live Chat
        </h1>
        <div style={{ color: BLUE, fontSize: "40px", fontWeight: 700, marginBottom: "12px", letterSpacing: "-0.02em" }}>
          YOUR ACCOUNT HAS BEEN BANNED
        </div>
        <div style={{ color: BLUE, fontSize: "18px", fontWeight: 400 }}>
          Reason: {banReason || "Suspicious activity"}
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: "100px", paddingBottom: "60px", minHeight: "100vh" }}>
      {/* HEADER */}
      <div style={{ marginBottom: "32px" }}>
        <h1
          style={{
            fontSize: "72px",
            fontWeight: 700,
            color: BLUE,
            letterSpacing: "-0.03em",
            margin: 0,
            lineHeight: 1.05,
          }}
        >
          Live Chat
        </h1>
        <p style={{ fontSize: "16px", color: "#666", marginTop: "8px", margin: 0 }}>
          Chat with anyone. Add users by name and email.
        </p>
      </div>

      {/* ADD USER FORM - INLINE, IN PAGE BODY */}
      <div
        ref={addFormRef}
        style={{
          backgroundColor: WHITE,
          border: `2px solid ${BLUE}`,
          borderRadius: "16px",
          padding: "28px 32px",
          marginBottom: "32px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: `linear-gradient(90deg, ${BLUE}, #6B8CFF, ${BLUE})`,
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              backgroundColor: BLUE,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <UserPlusIcon size={22} color={WHITE} />
          </div>
          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 700, color: BLUE, margin: 0, letterSpacing: "-0.02em" }}>
              Add User
            </h2>
            <p style={{ fontSize: "13px", color: "#666", margin: 0 }}>
              Save user to your contact list.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: "1 1 200px", minWidth: "180px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>
              Name
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter full name"
              style={{
                width: "100%",
                padding: "12px 14px",
                border: `1.5px solid rgba(13,60,252,0.2)`,
                borderRadius: "10px",
                fontSize: "15px",
                fontFamily: FONT_FAMILY,
                outline: "none",
                color: BLUE,
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = BLUE;
                e.target.style.boxShadow = `0 0 0 3px rgba(13,60,252,0.1)`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(13,60,252,0.2)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <div style={{ flex: "1 1 260px", minWidth: "220px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: BLUE, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "6px" }}>
              Email
            </label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="user@example.com"
              style={{
                width: "100%",
                padding: "12px 14px",
                border: `1.5px solid rgba(13,60,252,0.2)`,
                borderRadius: "10px",
                fontSize: "15px",
                fontFamily: FONT_FAMILY,
                outline: "none",
                color: BLUE,
                boxSizing: "border-box",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = BLUE;
                e.target.style.boxShadow = `0 0 0 3px rgba(13,60,252,0.1)`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(13,60,252,0.2)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <button
            ref={addButtonRef}
            onClick={handleAddContact}
            disabled={addingUser}
            style={{
              padding: "12px 28px",
              backgroundColor: addingUser ? "#ccc" : BLUE,
              color: WHITE,
              border: "none",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: 800,
              cursor: addingUser ? "not-allowed" : "pointer",
              fontFamily: FONT_FAMILY,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              height: "46px",
            }}
          >
            {addingUser ? "Adding..." : "Add User"}
          </button>
        </div>

        {addError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: "14px",
              padding: "10px 14px",
              backgroundColor: "rgba(255,0,0,0.06)",
              border: "1px solid rgba(255,0,0,0.2)",
              borderRadius: "8px",
              fontSize: "13px",
              color: "#d32f2f",
              fontWeight: 600,
            }}
          >
            {addError}
          </motion.div>
        )}

        {addSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: "14px",
              padding: "10px 14px",
              backgroundColor: "rgba(13,60,252,0.06)",
              border: `1px solid ${BLUE}`,
              borderRadius: "8px",
              fontSize: "13px",
              color: BLUE,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <CheckIcon size={14} color={BLUE} />
            User added successfully!
          </motion.div>
        )}
      </div>

      {/* TWO COLUMN: CONTACTS + CHAT */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "340px 1fr",
          gap: "20px",
          height: "640px",
        }}
      >
        {/* CONTACTS LIST */}
        <div
          style={{
            backgroundColor: WHITE,
            border: "1px solid rgba(0,0,0,0.08)",
            borderRadius: "16px",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "16px 18px",
              backgroundColor: BLUE,
              color: WHITE,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontWeight: 700, fontSize: "15px" }}>Contacts</span>
            <span
              style={{
                fontSize: "11px",
                padding: "2px 8px",
                borderRadius: "4px",
                border: `1.5px solid ${WHITE}`,
                fontWeight: 800,
              }}
            >
              {contacts.length}
            </span>
          </div>

          <div style={{ padding: "10px 12px", borderBottom: "1px solid #f0f0f0" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 12px",
                backgroundColor: "#f5f7ff",
                borderRadius: "8px",
              }}
            >
              <SearchIcon size={14} color={BLUE} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search contacts..."
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: BLUE,
                  fontSize: "13px",
                  fontFamily: FONT_FAMILY,
                  fontWeight: 600,
                }}
              />
            </div>
          </div>

          <div className="chat-scroll" style={{ flex: 1, overflowY: "auto" }}>
            {filteredContacts.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center", color: "#999", fontSize: "13px" }}>
                {searchQuery ? "No results" : "No contacts yet. Add one above."}
              </div>
            ) : (
              <AnimatePresence>
                {filteredContacts.map((c) => {
                  const isActive = selectedContact?.id === c.id;
                  return (
                    <motion.div
                      key={c.id}
                      ref={(el) => {
                        contactItemRefs.current[c.id] = el as HTMLDivElement | null;
                      }}
                      initial={{ opacity: 0, x: -40 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 60 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      onClick={() => setSelectedContact(c)}
                      style={{
                        padding: "12px 16px",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        cursor: "pointer",
                        borderLeft: isActive ? `3px solid ${BLUE}` : "3px solid transparent",
                        backgroundColor: isActive ? "rgba(13,60,252,0.06)" : "transparent",
                        borderBottom: "1px solid #f5f5f5",
                      }}
                    >
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "10px",
                          backgroundColor: BLUE,
                          color: WHITE,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 800,
                          fontSize: "15px",
                          flexShrink: 0,
                          overflow: "hidden",
                        }}
                      >
                        {c.userPhoto ? (
                          <img src={c.userPhoto} alt={c.userName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          c.userName.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: "14px",
                            fontWeight: 700,
                            color: BLACK,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            marginBottom: "2px",
                          }}
                        >
                          {c.userName}
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#888",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {c.userEmail}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteContact(c);
                        }}
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          padding: "6px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "6px",
                          opacity: 0.5,
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.5")}
                      >
                        <TrashIcon size={14} color={BLUE} />
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* CHAT VIEW */}
        <div
          style={{
            backgroundColor: WHITE,
            border: "1px solid rgba(0,0,0,0.08)",
            borderRadius: "16px",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {selectedContact ? (
            <>
              <div
                style={{
                  padding: "16px 20px",
                  backgroundColor: BLUE,
                  color: WHITE,
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "10px",
                    backgroundColor: WHITE,
                    color: BLUE,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: "16px",
                    overflow: "hidden",
                  }}
                >
                  {selectedContact.userPhoto ? (
                    <img src={selectedContact.userPhoto} alt={selectedContact.userName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    selectedContact.userName.charAt(0).toUpperCase()
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "16px", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {selectedContact.userName}
                  </div>
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {selectedContact.userEmail}
                  </div>
                </div>
              </div>

              <div
                ref={chatContainerRef}
                className="chat-scroll"
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  backgroundColor: "#fafbff",
                }}
              >
                {messages.length === 0 ? (
                  <div style={{ textAlign: "center", color: "#999", fontSize: "14px", padding: "40px 0" }}>
                    Start the conversation with {selectedContact.userName}
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMine = msg.senderId === user.uid;
                    return (
                      <div
                        key={msg.id || idx}
                        data-msg-id={msg.id || idx}
                        style={{
                          alignSelf: isMine ? "flex-end" : "flex-start",
                          maxWidth: "70%",
                        }}
                      >
                        <div
                          style={{
                            padding: "12px 16px",
                            borderRadius: "14px",
                            backgroundColor: isMine ? BLUE : WHITE,
                            color: isMine ? WHITE : BLACK,
                            fontSize: "15px",
                            fontFamily: FONT_FAMILY,
                            wordBreak: "break-word",
                            border: isMine ? "none" : "1px solid rgba(0,0,0,0.06)",
                            boxShadow: isMine ? "0 2px 8px rgba(13,60,252,0.25)" : "0 1px 3px rgba(0,0,0,0.04)",
                          }}
                        >
                          <div>{msg.text}</div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "flex-end",
                              alignItems: "center",
                              gap: "5px",
                              marginTop: "5px",
                            }}
                          >
                            {isMine && (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "10px", color: WHITE, fontWeight: 500 }}>
                                {msg.read ? (
                                  <>
                                    Read <DoubleCheckIcon size={11} color={WHITE} />
                                  </>
                                ) : msg.deliveryStatus === "delivered" ? (
                                  <>
                                    Delivered <DoubleCheckIcon size={11} color={WHITE} />
                                  </>
                                ) : msg.deliveryStatus === "sending" ? (
                                  <>
                                    Sending <ClockIcon size={11} color={WHITE} />
                                  </>
                                ) : msg.deliveryStatus === "failed" ? (
                                  <>
                                    Failed <ErrorIcon size={11} color={WHITE} />
                                  </>
                                ) : (
                                  <>
                                    Sent <CheckIcon size={11} color={WHITE} />
                                  </>
                                )}
                              </span>
                            )}
                            <span style={{ fontSize: "10px", color: isMine ? "rgba(255,255,255,0.85)" : "#999" }}>
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

              <div
                style={{
                  padding: "14px 18px",
                  borderTop: "1px solid rgba(0,0,0,0.06)",
                  display: "flex",
                  gap: "10px",
                  backgroundColor: WHITE,
                }}
              >
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && messageText.trim()) {
                      e.preventDefault();
                      handleSendMessage();
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
                    color: BLACK,
                  }}
                />
                <button
                  onClick={handleSendMessage}
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
                textAlign: "center",
                padding: "40px",
              }}
            >
              Select a contact to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ===== MAIN PAGE =====
export default function LiveChatMain(): React.JSX.Element {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
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
    tl.to(textRef.current, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: "back.out(1.7)",
    })
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
      .to(textRef.current, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        ease: "back.out(1.7)",
      })
      .to(textRef.current, { duration: 0.8 })
      .to(textRef.current, {
        scale: 0.3,
        opacity: 0,
        duration: 0.7,
        ease: "power2.in",
      })
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
        <title>Live Chat | Menuru Official</title>
        <meta name="description" content="Live Chat Menuru" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
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
        {/* HERO */}
        <HeroMenuruTitle onNavbarShiftChange={setNavbarShifted} />

        {/* KONTEN — LIVE CHAT */}
        <div style={{ padding: "0 40px", maxWidth: "1600px", margin: "0 auto", width: "100%" }}>
          <LiveChatView user={user} isAdmin={isAdmin} db={db} auth={auth} />
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
        .chat-scroll::-webkit-scrollbar,
        .chat-list-container::-webkit-scrollbar,
        .chat-list-container > div::-webkit-scrollbar,
        .online-panel-container::-webkit-scrollbar,
        .online-panel-container > div::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        .chat-scroll,
        .chat-messages-container,
        .chat-list-container,
        .chat-list-container > div,
        .online-panel-container,
        .online-panel-container > div {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
      `}</style>
    </>
  );
}
