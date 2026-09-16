'use client';

import React, { useState, useEffect, useRef } from "react";
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
} from "firebase/firestore";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

// Register GSAP plugins
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
const AGENT_NAME = "Farid Ardiansyah";

// ===== ENCRYPTION AES-256-GCM =====
const ENCRYPTION_KEY_BASE64 = "bWVudXJ1LXNlY3JldC1rZXktMjAyNi0zMmJ5dGVzISEh";
const IV_LENGTH = 12;

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

function uint8ArrayToBase64(uint8Array: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < uint8Array.length; i++) binary += String.fromCharCode(uint8Array[i]);
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
    const encrypted = await window.crypto.subtle.encrypt({ name: "AES-GCM", iv, tagLength: 128 }, key, data);
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
      if (encrypted.startsWith("encrypted:")) return decodeURIComponent(escape(atob(encrypted.substring(10))));
      return encrypted;
    }
    if (encrypted.startsWith("plain:")) return decodeURIComponent(escape(atob(encrypted.substring(6))));
    if (!encrypted.startsWith("encrypted:")) return encrypted;
    const base64Data = encrypted.substring(10);
    const combined = base64ToUint8Array(base64Data);
    const iv = combined.slice(0, IV_LENGTH);
    const encryptedData = combined.slice(IV_LENGTH);
    const key = await getCryptoKey();
    const decrypted = await window.crypto.subtle.decrypt({ name: "AES-GCM", iv, tagLength: 128 }, key, encryptedData);
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error("Decryption error:", error);
    if (encrypted.startsWith("encrypted:") || encrypted.startsWith("plain:")) {
      try {
        const encoded = encrypted.includes(":") ? encrypted.split(":")[1] : encrypted;
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
  if (/[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/.test(lowerText)) return { isBanned: true, reason: "Suspicious IP Address" };
  if (/[0-9]{10,}/.test(lowerText)) return { isBanned: true, reason: "Suspicious Number" };
  for (const pattern of [/kirim ke rek/i, /transfer ke/i, /bayar ke/i, /setor ke/i, /minta kirim/i, /mohon kirim/i, /tolong kirim/i]) {
    if (pattern.test(lowerText)) return { isBanned: true, reason: "Transfer/Payment Request" };
  }
  return { isBanned: false, reason: "" };
}

async function banUserPermanent(userId: string, userEmail: string, userName: string, reason: string, message: string) {
  if (!db) return;
  try {
    const now = new Date().toISOString();
    await setDoc(doc(db, "bot_blocks", userId), {
      userId, userEmail, userName, isBlocked: true, blockedAt: now, blockedReason: reason, blockedMessage: message,
      canCreateTicket: false, canSendMessage: false,
      violations: [{ type: "BANNED", reason, timestamp: now, message, confidence: 100 }],
      totalViolations: 1, warningCount: 0, firstViolation: now, lastViolation: now,
    });
    await updateDoc(doc(db, "users", userId), {
      botBlocked: true, botBlockedAt: serverTimestamp(), botBlockedReason: reason, botBlockedMessage: message,
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

async function checkBanStatus(userId: string) {
  if (!db) return { isBanned: false, reason: "", canCreateTicket: true, canSendMessage: true };
  try {
    const botDoc = await getDoc(doc(db, "bot_blocks", userId));
    if (botDoc.exists()) {
      const data = botDoc.data();
      return {
        isBanned: data.isBlocked || false,
        reason: data.blockedReason || "",
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
          canCreateTicket: userData.canCreateTicket !== false,
          canSendMessage: userData.canSendMessage !== false,
        };
      }
    }
    return { isBanned: false, reason: "", canCreateTicket: true, canSendMessage: true };
  } catch (error) {
    console.error("Error checking ban status:", error);
    return { isBanned: false, reason: "", canCreateTicket: true, canSendMessage: true };
  }
}

// ===== SVG ICONS =====
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

const PeopleIcon = ({ size = 20, color = "#ffffff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 21V19C4 16.7909 5.79086 15 8 15H16C18.2091 15 20 16.7909 20 19V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TrustIcon = ({ size = 24, color = "#ffffff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2L4 5V11C4 16 8 20 12 22C16 20 20 16 20 11V5L12 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 12L11 14L15 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CareerIcon = ({ size = 24, color = "#ffffff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="2" y="7" width="20" height="14" rx="2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 7V5C8 3.89543 8.89543 3 10 3H14C15.1046 3 16 3.89543 16 5V7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2 13H22" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ResourcesIcon = ({ size = 24, color = "#ffffff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M4 4H10C11.1046 4 12 4.89543 12 6V20C12 18.8954 11.1046 18 10 18H4V4Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M20 4H14C12.8954 4 12 4.89543 12 6V20C12 18.8954 12.8954 18 14 18H20V4Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DocsIcon = ({ size = 20, color = "#ffffff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 2V8H20" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 13H16" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 17H16" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BrandIcon = ({ size = 20, color = "#ffffff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M20.59 13.41L11 3.83C10.6 3.43 10.06 3.2 9.5 3.2H4C2.9 3.2 2 4.1 2 5.2V10.7C2 11.26 2.22 11.8 2.63 12.2L12.21 21.79C13 22.57 14.27 22.57 15.06 21.79L20.59 16.26C21.37 15.47 21.37 14.2 20.59 13.41Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="7" cy="7" r="1.5" fill={color} />
  </svg>
);

const PlusIcon = ({ size = 16, color = "#ffffff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <line x1="4" y1="12" x2="20" y2="12" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <line x1="12" y1="4" x2="12" y2="20" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const CloseIcon = ({ size = 14, color = "#0D3CFC" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M18 6L6 18" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 6L18 18" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MailIcon = ({ size = 16, color = "#0D3CFC" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="2" y="4" width="20" height="16" rx="2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2 7L12 13L22 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

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
interface Ticket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhoto?: string;
  agentId?: string;
  agentName?: string;
  status: "waiting" | "active" | "resolved" | "closed";
  topic: string;
  createdAt: any;
  lastMessage?: string;
  lastMessageTime?: any;
  unreadCount: number;
  typing: boolean;
  typingUserId?: string | null;
  typingUserName?: string | null;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: any;
  read: boolean;
  isEncrypted?: boolean;
  deliveryStatus?: "sending" | "sent" | "delivered" | "read" | "failed";
}

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
    if (!panelRef.current) return;
    if (open) {
      gsap.fromTo(panelRef.current, { opacity: 0, y: -20, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "power3.out" });
    } else {
      gsap.to(panelRef.current, { opacity: 0, y: -20, scale: 0.96, duration: 0.25, ease: "power2.in" });
    }
  }, [open]);

  return (
    <div style={{ position: "relative" }} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <div
        style={{
          display: "flex", alignItems: "center", gap: "10px", padding: "10px 16px",
          backgroundColor: open ? buttonHoverColor : buttonColor,
          borderRadius: "10px",
          boxShadow: open ? "0 8px 24px rgba(0,0,0,0.35)" : `0 8px 24px ${buttonColor}55`,
          transition: "background-color 0.25s ease, box-shadow 0.25s ease",
          cursor: "pointer", position: "relative", zIndex: 2,
        }}
      >
        <span style={{ color: open ? labelTextHoverColor : labelTextColor, fontSize: "14px", fontWeight: 600, letterSpacing: "0.02em", fontFamily: FONT_FAMILY, whiteSpace: "nowrap", transition: "color 0.25s ease" }}>
          {label}
        </span>
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: "22px", height: "22px",
            backgroundColor: open ? iconButtonHoverColor : iconButtonColor,
            borderRadius: "6px", transition: "background-color 0.25s ease",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <line x1="4" y1="7" x2="20" y2="7" stroke={open ? labelTextHoverColor : labelTextColor} strokeWidth="2.5" strokeLinecap="round" />
            <line x1="4" y1="17" x2="20" y2="17" stroke={open ? labelTextHoverColor : labelTextColor} strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {open && (
        <div
          ref={panelRef}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          style={{
            position: "absolute", top: "calc(100% + 10px)", left: "0px",
            width: `${bigPanelWidth}px`, minHeight: `${bigPanelHeight}px`,
            backgroundColor: panelColor, borderRadius: "10px",
            boxShadow: `0 8px 24px ${panelColor}55`,
            zIndex: 1, fontFamily: FONT_FAMILY, color: titleTextColor,
            padding: "22px 26px", display: "flex", gap: "20px", alignItems: "flex-start",
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
                  <p style={{ fontSize: "12px", fontWeight: 400, lineHeight: 1.5, color: descriptionTextColor, margin: 0, fontFamily: FONT_FAMILY, maxWidth: "340px" }}>
                    Dokumentasi lengkap panduan produk, API, dan tutorial Menuru.
                  </p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <BrandIcon size={22} color={titleTextColor} />
                    <span style={{ fontSize: "16px", fontWeight: 700, fontFamily: FONT_FAMILY, color: titleTextColor }}>Brand</span>
                  </div>
                  <p style={{ fontSize: "12px", fontWeight: 400, lineHeight: 1.5, color: descriptionTextColor, margin: 0, fontFamily: FONT_FAMILY, maxWidth: "340px" }}>
                    Aset visual, logo, dan panduan identitas brand Menuru.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {iconType === "trust" ? <TrustIcon size={26} color={titleTextColor} /> : iconType === "career" ? <CareerIcon size={26} color={titleTextColor} /> : <ResourcesIcon size={26} color={titleTextColor} />}
                  <span style={{ fontSize: "20px", fontWeight: 700, fontFamily: FONT_FAMILY, color: titleTextColor }}>{panelTitle}</span>
                </div>
                <p style={{ fontSize: "13px", fontWeight: 400, lineHeight: 1.5, color: descriptionTextColor, margin: 0, fontFamily: FONT_FAMILY, maxWidth: "340px" }}>
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
                  <p style={{ fontSize: "12px", fontWeight: 400, lineHeight: 1.5, color: descriptionTextColor, margin: 0, fontFamily: FONT_FAMILY }}>Panduan lengkap dan referensi teknis.</p>
                </div>
                <div style={{ backgroundColor: panelBoxColor, border: `1px solid ${panelBoxBorder}`, borderRadius: "12px", padding: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <img src={panelImage} alt="Brand" style={{ width: "100%", height: "120px", objectFit: "contain", display: "block", borderRadius: "8px" }} />
                  <span style={{ fontSize: "14px", fontWeight: 700, fontFamily: FONT_FAMILY, color: titleTextColor }}>Brand Assets</span>
                  <p style={{ fontSize: "12px", fontWeight: 400, lineHeight: 1.5, color: descriptionTextColor, margin: 0, fontFamily: FONT_FAMILY }}>Logo, palet warna, dan identitas visual.</p>
                </div>
              </>
            ) : (
              <div style={{ backgroundColor: panelBoxColor, border: `1px solid ${panelBoxBorder}`, borderRadius: "12px", padding: "14px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <img src={panelImage} alt={panelTitle} style={{ width: "100%", height: "170px", objectFit: "contain", display: "block", borderRadius: "10px" }} />
                <span style={{ fontSize: "15px", fontWeight: 700, fontFamily: FONT_FAMILY, color: titleTextColor }}>{panelRightTitle}</span>
                <p style={{ fontSize: "12px", fontWeight: 400, lineHeight: 1.5, color: descriptionTextColor, margin: 0, fontFamily: FONT_FAMILY }}>{panelRightDescription}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ===== LEFT NAVBAR =====
const LeftNavbar = () => (
  <div style={{ position: "fixed", top: "20px", left: "80px", zIndex: 9000, display: "flex", alignItems: "flex-start", gap: "12px", fontFamily: FONT_FAMILY }}>
    <NavbarButton label="Teams" panelTitle="Trust" panelDescription="Keamanan dan privasi Anda adalah prioritas kami dengan enkripsi end-to-end." panelImage="/images/p0l.jpg" panelRightTitle="Why Trust Us" panelRightDescription="Sistem kami dipantau 24/7 untuk melindungi data Anda." iconType="trust" bigPanelWidth={850} bigPanelHeight={260} />
    <NavbarButton label="Individual" panelTitle="Careers" panelDescription="Bergabunglah dengan tim kami dan bangun karier yang bermakna di lingkungan yang suportif." panelImage="/images/xxz.jpg" panelRightTitle="Life at Menuru" panelRightDescription="Budaya kerja kolaboratif, fleksibel, dan penuh peluang untuk tumbuh bersama." iconType="career" bigPanelWidth={850} bigPanelHeight={260} />
    <NavbarButton label="Resources" panelTitle="Docs & Brand" panelDescription="Akses dokumentasi lengkap dan aset brand Menuru dalam satu tempat." panelImage="/images/p0l.jpg" panelRightTitle="Docs & Brand" panelRightDescription="Panduan, aset visual, dan referensi resmi brand Menuru." iconType="resources" bigPanelWidth={850} bigPanelHeight={340} buttonColor="#F2EA6B" buttonHoverColor="#000000" panelColor="#F04E23" iconButtonColor="#000000" iconButtonHoverColor="#F2EA6B" panelBoxColor="rgba(255,255,255,0.15)" panelBoxBorder="rgba(255,255,255,0.3)" labelTextColor="#000000" labelTextHoverColor="#ffffff" titleTextColor="#ffffff" descriptionTextColor="rgba(255,255,255,0.92)" isResources={true} />
  </div>
);

// ===== RIGHT NAVBAR =====
const RightNavbar = () => (
  <div style={{ position: "fixed", top: "20px", right: "24px", zIndex: 9000, display: "flex", alignItems: "center", gap: "10px", padding: "10px 18px 10px 16px", backgroundColor: "#000000", borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.25)", fontFamily: FONT_FAMILY }}>
    <PeopleIcon size={20} color="#ffffff" />
    <Link href="/signin" style={{ textDecoration: "none", color: "#ffffff", fontSize: "14px", fontWeight: 600, letterSpacing: "0.02em", fontFamily: FONT_FAMILY, whiteSpace: "nowrap" }}>
      Log In
    </Link>
  </div>
);

// ===== WORK EXPERIENCE ITEM =====
const WorkExperienceItem = () => {
  const [expanded, setExpanded] = useState(false);
  const detailRef = useRef<HTMLDivElement>(null);
  const plusWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!detailRef.current) return;
    if (expanded) {
      gsap.fromTo(detailRef.current, { height: 0, opacity: 0 }, { height: "auto", opacity: 1, duration: 0.5, ease: "power3.out" });
    } else {
      gsap.to(detailRef.current, { height: 0, opacity: 0, duration: 0.35, ease: "power2.in" });
    }
  }, [expanded]);

  useEffect(() => {
    if (!plusWrapRef.current) return;
    gsap.to(plusWrapRef.current, { rotate: expanded ? 45 : 0, duration: 0.4, ease: "power2.inOut", transformOrigin: "center center" });
  }, [expanded]);

  return (
    <div style={{ width: "100%", fontFamily: FONT_FAMILY, color: "#ffffff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "22px", fontWeight: 800, color: "#ffffff", lineHeight: 1.1 }}>01 Menuru</div>
          <div style={{ fontSize: "14px", fontWeight: 500, color: "rgba(255,255,255,0.85)" }}>Founder and Developer</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px", flexShrink: 0 }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.85)", whiteSpace: "nowrap" }}>Januari 2024 – Present</div>
          <button
            onClick={() => setExpanded((v) => !v)}
            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 14px", backgroundColor: expanded ? "#ffffff" : "#F2EA6B", color: expanded ? "#0D3CFC" : "#000000", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: FONT_FAMILY, flexShrink: 0 }}
          >
            <div ref={plusWrapRef} style={{ display: "flex", alignItems: "center", transformOrigin: "center center" }}>
              {expanded ? <CloseIcon size={14} color="#0D3CFC" /> : <PlusIcon size={14} color="#000000" />}
            </div>
            <span>{expanded ? "Close" : "More Info"}</span>
          </button>
        </div>
      </div>
      <div ref={detailRef} style={{ height: 0, opacity: 0, overflow: "hidden" }}>
        <div style={{ marginTop: "18px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ fontSize: "14px", fontWeight: 800, color: "#ffffff" }}>Tanggung Jawab :</div>
          <ul style={{ margin: 0, paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              "Membangun dan mengembangkan website digital dari tahap perencanaan hingga deployment.",
              "Mengembangkan fitur menggunakan Next.js, React.js, Firebase, GSAP, Framer Motion.",
              "Mengelola UI/UX, database, authentication, serta integrasi layanan pihak ketiga.",
              "Mengelola hosting, deployment, dan maintenance website.",
              "Mengembangkan strategi digital untuk meningkatkan awareness dan penggunaan platform melalui google search dan instagram stories pribadi.",
            ].map((item, i) => (
              <li key={i} style={{ fontSize: "13px", fontWeight: 400, lineHeight: 1.6, color: "rgba(255,255,255,0.9)", textAlign: "left" }}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

// ===== LIVE CHAT AGENT =====
const LiveChatAgent = ({ user, isAdmin }: { user: any; isAdmin: boolean }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [showStartChat, setShowStartChat] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [isBanned, setIsBanned] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [encryptionReady, setEncryptionReady] = useState(false);
  const [checkingBan, setCheckingBan] = useState(true);
  const [canCreateTicket, setCanCreateTicket] = useState(true);
  const [canSendMessage, setCanSendMessage] = useState(true);
  const [onlineAgents, setOnlineAgents] = useState<any[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);

  const chatMessagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const topics = ["Product Inquiry", "Technical Support", "Account Issues", "Donation", "Partnership", "Other"];

  useEffect(() => {
    setIsMounted(true);
    getCryptoKey().then(() => setEncryptionReady(true)).catch(() => setEncryptionReady(true));
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
          setCanCreateTicket(status.canCreateTicket);
          setCanSendMessage(status.canSendMessage);
        } else {
          setIsBanned(false);
          setBanReason("");
          setCanCreateTicket(true);
          setCanSendMessage(true);
        }
      } catch (error) {
        console.error("Error checking ban:", error);
      } finally {
        setCheckingBan(false);
      }
    };
    checkBan();
  }, [user, isMounted]);

  // Online users
  useEffect(() => {
    if (!db || !isMounted) return;
    const q = query(collection(db, "users"), where("online", "==", true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const agents: any[] = [];
      const users: any[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const item = {
          uid: docSnap.id,
          displayName: data.displayName || data.name || data.email || "User",
          email: data.email || "",
          photoURL: data.photoURL || "",
          online: data.online || false,
          isAgent: data.email === ADMIN_EMAIL,
        };
        if (item.isAgent) agents.push(item);
        else users.push(item);
      });
      setOnlineAgents(agents);
      setOnlineUsers(users);
    });
    return () => unsubscribe();
  }, [db, isMounted]);

  // Tickets
  useEffect(() => {
    if (!db || !user || !isMounted) return;
    let q;
    if (isAdmin) {
      q = query(collection(db, "livechat_tickets"), orderBy("createdAt", "desc"));
    } else {
      q = query(collection(db, "livechat_tickets"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
    }
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ticketList: Ticket[] = [];
      snapshot.forEach((docSnap) => {
        ticketList.push({ id: docSnap.id, ...docSnap.data() } as Ticket);
      });
      setTickets(ticketList);
    });
    return () => unsubscribe();
  }, [db, user, isAdmin, isMounted]);

  // Messages
  useEffect(() => {
    if (!db || !selectedTicket || !isMounted) return;
    const q = query(collection(db, "livechat_tickets", selectedTicket.id, "messages"), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
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
      setMessages(msgList);
      setTimeout(() => {
        if (chatMessagesContainerRef.current) {
          chatMessagesContainerRef.current.scrollTop = chatMessagesContainerRef.current.scrollHeight;
        }
      }, 50);
    });
    return () => unsubscribe();
  }, [db, selectedTicket, isMounted]);

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  const handleTyping = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessageText(value);
    if (!selectedTicket || !user || !db || isBanned) return;
    const ticketRef = doc(db, "livechat_tickets", selectedTicket.id);
    if (value.length > 0) {
      await updateDoc(ticketRef, { typing: true, typingUserId: user.uid, typingUserName: user.displayName || user.email || "User" });
    } else {
      await updateDoc(ticketRef, { typing: false, typingUserId: null, typingUserName: null });
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(async () => {
      await updateDoc(ticketRef, { typing: false, typingUserId: null, typingUserName: null });
    }, 2000);
  };

  const startChat = async () => {
    if (!db || !user || !selectedTopic) return;
    if (!canCreateTicket) return;
    if (!encryptionReady) {
      alert("Encryption is being initialized, please wait a moment.");
      return;
    }
    const hasActiveTicket = tickets.some(
      (t) => t.userId === user.uid && (t.status === "waiting" || t.status === "active")
    );
    if (hasActiveTicket) {
      alert("You still have an active chat with an agent.");
      return;
    }
    try {
      const ticketRef = await addDoc(collection(db, "livechat_tickets"), {
        userId: user.uid,
        userName: user.displayName || user.email || "User",
        userEmail: user.email,
        userPhoto: user.photoURL || "",
        status: "waiting",
        topic: selectedTopic,
        createdAt: serverTimestamp(),
        unreadCount: 0,
        typing: false,
        typingUserId: null,
        typingUserName: null,
      });
      const initialMessage = `Hello, I would like to ask about: ${selectedTopic}`;
      const encryptedMessage = await encryptMessage(initialMessage);
      await addDoc(collection(db, "livechat_tickets", ticketRef.id, "messages"), {
        senderId: user.uid,
        senderName: user.displayName || user.email || "User",
        text: encryptedMessage,
        timestamp: serverTimestamp(),
        read: false,
        isEncrypted: true,
        deliveryStatus: "sent",
      });
      setSelectedTopic("");
      setShowStartChat(false);
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  const sendMessage = async () => {
    if (!db || !selectedTicket || !messageText.trim() || !user) return;
    if (!canSendMessage) {
      setMessageText("");
      return;
    }
    const checkResult = containsBannedContent(messageText);
    if (checkResult.isBanned) {
      await banUserPermanent(user.uid, user.email || "", user.displayName || "User", checkResult.reason, messageText);
      setIsBanned(true);
      setBanReason(checkResult.reason);
      setCanCreateTicket(false);
      setCanSendMessage(false);
      setMessageText("");
      return;
    }
    if (!encryptionReady) {
      alert("Encryption is being initialized.");
      return;
    }
    if (selectedTicket.status === "resolved" || selectedTicket.status === "closed") {
      alert("This chat is finished.");
      return;
    }
    try {
      const ticketRef = doc(db, "livechat_tickets", selectedTicket.id);
      await updateDoc(ticketRef, { typing: false, typingUserId: null, typingUserName: null });
      const senderName = isAdmin ? AGENT_NAME : user.displayName || user.email || "User";
      const encryptedMessage = await encryptMessage(messageText.trim());
      await addDoc(collection(db, "livechat_tickets", selectedTicket.id, "messages"), {
        senderId: user.uid,
        senderName,
        text: encryptedMessage,
        timestamp: serverTimestamp(),
        read: false,
        isEncrypted: true,
        deliveryStatus: "sent",
      });
      await updateDoc(ticketRef, {
        lastMessage: messageText.trim(),
        lastMessageTime: serverTimestamp(),
        ...(selectedTicket.status === "waiting" && { status: "active" }),
        agentId: isAdmin ? user.uid : selectedTicket.agentId,
        agentName: isAdmin ? AGENT_NAME : selectedTicket.agentName,
      });
      setMessageText("");
    } catch (error) {
      console.error("Error sending message:", error);
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
      <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", fontSize: "10px", color: "#ffffff", fontWeight: 500 }}>
        {label}
        {icon}
      </span>
    );
  };

  if (!user) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "16px", padding: "40px 20px", textAlign: "center", fontFamily: FONT_FAMILY }}>
        <div style={{ fontSize: "28px", fontWeight: 700, color: "#0D3CFC", letterSpacing: "-0.02em" }}>Live Chat Agent</div>
        <p style={{ fontSize: "13px", color: "#666", margin: 0 }}>Please login to use Live Chat Agent</p>
        <Link href="/" style={{ textDecoration: "none" }}>
          <button style={{ padding: "8px 20px", backgroundColor: "#0D3CFC", color: "#fff", border: "none", borderRadius: "6px", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: FONT_FAMILY }}>
            Login
          </button>
        </Link>
      </div>
    );
  }

  if (!isAdmin && isBanned) {
    return (
      <div style={{ padding: "40px 20px", textAlign: "center", fontFamily: FONT_FAMILY }}>
        <div style={{ color: "#0D3CFC", fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>YOUR ACCOUNT HAS BEEN PERMANENTLY BANNED</div>
        <div style={{ color: "#0D3CFC", fontSize: "14px" }}>REASON: {banReason || "SUSPICIOUS ACTIVITY"}</div>
      </div>
    );
  }

  if (checkingBan) {
    return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#666", fontFamily: FONT_FAMILY, fontSize: "13px" }}>Checking account status...</div>;
  }

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", fontFamily: FONT_FAMILY, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "14px 20px", borderBottom: "1px solid #e8e8e8", flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: "18px", fontWeight: 700, color: "#0D3CFC" }}>Live Chat Agent</div>
        {!isAdmin && (
          <button
            onClick={() => setShowStartChat(true)}
            style={{ padding: "8px 14px", backgroundColor: "#0D3CFC", color: "#ffffff", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: FONT_FAMILY }}
          >
            + New Chat
          </button>
        )}
      </div>

      {/* Layout: chat list (kiri) + chat area (kanan) */}
      <div style={{ flex: 1, display: "flex", minHeight: 0, overflow: "hidden" }}>
        {/* CHAT LIST — warna biru */}
        <div
          style={{
            width: "200px",
            backgroundColor: "#0D3CFC",
            overflowY: "auto",
            flexShrink: 0,
            color: "#fff",
            display: "flex",
            flexDirection: "column",
          }}
          className="cv-scroll-inner"
        >
          <div style={{ padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,0.15)", fontWeight: 600, fontSize: "12px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
            <span>Chat History</span>
            <span style={{ fontSize: "10px", backgroundColor: "rgba(255,255,255,0.2)", padding: "2px 8px", borderRadius: "6px" }}>{tickets.length}</span>
          </div>
          <div style={{ flex: 1, overflowY: "auto" }} className="cv-scroll-inner">
            {tickets.length === 0 ? (
              <div style={{ padding: "20px 14px", textAlign: "center", color: "#fff", fontSize: "11px", opacity: 0.85 }}>
                No chats yet
              </div>
            ) : (
              tickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  style={{
                    padding: "12px 14px",
                    cursor: "pointer",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    backgroundColor: selectedTicket?.id === t.id ? "rgba(255,255,255,0.12)" : "transparent",
                    borderLeft: selectedTicket?.id === t.id ? "4px solid #fff" : "4px solid transparent",
                  }}
                >
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {t.userName}
                  </div>
                  <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.85)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: "2px" }}>
                    {t.topic}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* CHAT AREA — warna putih */}
        <div style={{ flex: 1, backgroundColor: "#ffffff", display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
          {selectedTicket ? (
            <>
              {/* Header chat */}
              <div style={{ padding: "12px 18px", backgroundColor: "#0D3CFC", flexShrink: 0 }}>
                <div style={{ fontWeight: 600, fontSize: "13px", color: "#fff", fontFamily: FONT_FAMILY }}>
                  {selectedTicket.userName}
                  <span style={{ fontSize: "11px", fontWeight: 400, color: "rgba(255,255,255,0.8)", marginLeft: "6px" }}>
                    {selectedTicket.topic}
                  </span>
                </div>
              </div>

              {/* Messages */}
              <div
                ref={chatMessagesContainerRef}
                className="cv-scroll-inner"
                style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "10px", minHeight: 0 }}
              >
                {messages.length === 0 ? (
                  <div style={{ textAlign: "center", color: "#999", fontSize: "12px", padding: "20px 0" }}>No messages yet</div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMine = msg.senderId === user.uid;
                    return (
                      <div key={idx} style={{ alignSelf: isMine ? "flex-end" : "flex-start", maxWidth: "75%" }}>
                        <div
                          style={{
                            padding: "10px 14px",
                            borderRadius: "12px",
                            backgroundColor: isMine ? "#0D3CFC" : "#f0f0f0",
                            color: isMine ? "#fff" : "#000",
                            fontSize: "12px",
                            fontFamily: FONT_FAMILY,
                            wordBreak: "break-word",
                          }}
                        >
                          {!isMine && (
                            <div style={{ fontSize: "10px", fontWeight: 600, color: "#0D3CFC", marginBottom: "3px" }}>
                              {msg.senderName}
                            </div>
                          )}
                          <div>{msg.text}</div>
                          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                            {renderDeliveryStatus(msg, isMine)}
                            <span style={{ fontSize: "9px", color: isMine ? "#fff" : "#999", opacity: 0.85 }}>
                              {formatTime(msg.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Input — tombol kirim */}
              {selectedTicket.status !== "resolved" && selectedTicket.status !== "closed" && (
                <div style={{ padding: "12px 18px", borderTop: "1px solid #e8e8e8", display: "flex", gap: "10px", flexShrink: 0 }}>
                  <input
                    type="text"
                    value={messageText}
                    onChange={handleTyping}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && messageText.trim()) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Type a message..."
                    style={{
                      flex: 1,
                      padding: "10px 14px",
                      border: "1px solid #e8e8e8",
                      borderRadius: "10px",
                      fontSize: "12px",
                      outline: "none",
                      fontFamily: FONT_FAMILY,
                    }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!messageText.trim()}
                    style={{
                      padding: "10px 20px",
                      backgroundColor: messageText.trim() ? "#0D3CFC" : "#ccc",
                      color: "#fff",
                      border: "none",
                      borderRadius: "10px",
                      cursor: messageText.trim() ? "pointer" : "not-allowed",
                      fontFamily: FONT_FAMILY,
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    Send
                  </button>
                </div>
              )}
            </>
          ) : (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#999", fontSize: "12px", fontFamily: FONT_FAMILY, padding: "20px", textAlign: "center" }}>
              Select a chat or start a new one
            </div>
          )}
        </div>
      </div>

      {/* Modal start chat */}
      {showStartChat && (
        <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ backgroundColor: "#fff", padding: "24px", borderRadius: "12px", width: "100%", maxWidth: "320px", fontFamily: FONT_FAMILY }}>
            <h4 style={{ margin: 0, marginBottom: "14px", color: "#0D3CFC", fontSize: "16px", fontWeight: 700 }}>Select Topic</h4>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              style={{ width: "100%", padding: "10px", border: "2px solid #0D3CFC", borderRadius: "8px", marginBottom: "14px", fontFamily: FONT_FAMILY, fontSize: "13px", color: "#0D3CFC", outline: "none" }}
            >
              <option value="">-- Select --</option>
              {topics.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <button onClick={() => setShowStartChat(false)} style={{ padding: "8px 16px", background: "transparent", border: "1px solid #ccc", borderRadius: "8px", cursor: "pointer", fontFamily: FONT_FAMILY, fontSize: "12px", color: "#666" }}>
                Cancel
              </button>
              <button
                onClick={startChat}
                disabled={!selectedTopic}
                style={{ padding: "8px 18px", background: selectedTopic ? "#0D3CFC" : "#ccc", color: "#fff", border: "none", borderRadius: "8px", cursor: selectedTopic ? "pointer" : "not-allowed", fontFamily: FONT_FAMILY, fontSize: "12px", fontWeight: 600 }}
              >
                Start
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ===== CV PAGE =====
export default function CVPage(): React.JSX.Element {
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const cardWrapperRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLImageElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const plusWrapRef = useRef<HTMLDivElement>(null);
  const textTopRef = useRef<HTMLDivElement>(null);
  const textBottomRef = useRef<HTMLDivElement>(null);
  const textAboutRef = useRef<HTMLDivElement>(null);
  const textParagraphRef = useRef<HTMLDivElement>(null);
  const textWorkRef = useRef<HTMLDivElement>(null);
  const workBlockRef = useRef<HTMLDivElement>(null);
  const contactOverlayRef = useRef<HTMLDivElement>(null);
  const contactContentRef = useRef<HTMLDivElement>(null);
  const contactCloseRef = useRef<HTMLButtonElement>(null);
  const menuruFooterRef = useRef<HTMLDivElement>(null);
  const menuruTextRef = useRef<HTMLSpanElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [contactMounted, setContactMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auth state
  useEffect(() => {
    if (!auth || !isMounted) return;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        setIsAdmin(currentUser.email === ADMIN_EMAIL);
        try {
          await updateDoc(doc(db, "users", currentUser.uid), { online: true, lastSeen: serverTimestamp() });
        } catch (error) {
          console.error("Error updating online status:", error);
        }
      }
    });
    return () => unsubscribe();
  }, [isMounted]);

  // Card entrance
  useEffect(() => {
    if (!isMounted || !cardWrapperRef.current) return;
    gsap.fromTo(cardWrapperRef.current, { opacity: 0, y: 60, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: "power3.out" });
  }, [isMounted]);

  // MENURU footer animation
  useEffect(() => {
    if (!isMounted || !menuruFooterRef.current || !menuruTextRef.current) return;
    const split = new SplitText(menuruTextRef.current, { type: "chars", charsClass: "menuru-char" });
    gsap.set(split.chars, { opacity: 0, y: 100, scale: 0.5, rotationX: 90 });
    ScrollTrigger.create({
      trigger: menuruFooterRef.current,
      start: "top 85%",
      onEnter: () => { gsap.to(split.chars, { opacity: 1, y: 0, scale: 1, rotationX: 0, duration: 1.2, stagger: 0.03, ease: "back.out(1.7)", overwrite: true }); },
      onLeave: () => { gsap.to(split.chars, { opacity: 0, y: 100, scale: 0.5, rotationX: 90, duration: 0.8, stagger: 0.02, ease: "power2.in", overwrite: true }); },
      onEnterBack: () => { gsap.to(split.chars, { opacity: 1, y: 0, scale: 1, rotationX: 0, duration: 1.2, stagger: 0.03, ease: "back.out(1.7)", overwrite: true }); },
    });
    return () => { ScrollTrigger.getAll().forEach((t) => t.kill()); };
  }, [isMounted]);

  // Info button toggle
  useEffect(() => {
    if (!buttonRef.current || !plusWrapRef.current) return;
    if (isOpen) {
      gsap.to(buttonRef.current, { backgroundColor: "#ffffff", color: "#0D3CFC", duration: 0.35, ease: "power2.out" });
    } else {
      gsap.to(buttonRef.current, { backgroundColor: "#0D3CFC", color: "#ffffff", duration: 0.35, ease: "power2.out" });
    }
    gsap.to(plusWrapRef.current, { rotate: isOpen ? 45 : 0, duration: 0.4, ease: "power2.inOut", transformOrigin: "center center" });
  }, [isOpen]);

  // Photo transition
  useEffect(() => {
    if (!photoRef.current) return;
    if (isOpen) {
      gsap.to(photoRef.current, { top: "50%", left: "50%", xPercent: -50, yPercent: -50, width: "92%", height: "92%", objectFit: "contain", borderRadius: "12px", duration: 0.55, ease: "power3.inOut" });
    } else {
      gsap.to(photoRef.current, { top: 0, left: 0, xPercent: 0, yPercent: 0, width: "100%", height: "100%", objectFit: "cover", borderRadius: "20px", duration: 0.55, ease: "power3.inOut" });
    }
  }, [isOpen]);

  // Text animations
  useEffect(() => {
    if (!isOpen) {
      if (textBottomRef.current) {
        gsap.fromTo(textBottomRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", delay: 0.3 });
      }
      return;
    }
    if (textTopRef.current) gsap.fromTo(textTopRef.current, { opacity: 0, y: -24 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", delay: 0.15 });
    if (textAboutRef.current) gsap.fromTo(textAboutRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", delay: 0.3 });
    if (textParagraphRef.current) gsap.fromTo(textParagraphRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", delay: 0.4 });
    if (textWorkRef.current) gsap.fromTo(textWorkRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", delay: 0.5 });
    if (workBlockRef.current) gsap.fromTo(workBlockRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", delay: 0.6 });
  }, [isOpen]);

  // ===== CONTACT OVERLAY + CARD WIDTH TRANSITION =====
  useEffect(() => {
    if (showContact) {
      setContactMounted(true);
      // Perbesar card ke kanan (width bertambah) supaya live chat terlihat
      if (cardWrapperRef.current) {
        gsap.to(cardWrapperRef.current, {
          maxWidth: "780px",
          duration: 0.6,
          ease: "power3.inOut",
        });
      }
    } else if (contactMounted && contactOverlayRef.current) {
      // Kecilkan card kembali ke ukuran semula
      if (cardWrapperRef.current) {
        gsap.to(cardWrapperRef.current, {
          maxWidth: "380px",
          duration: 0.5,
          ease: "power3.inOut",
          delay: 0.1,
        });
      }
      // Overlay keluar ke kiri
      gsap.to(contactOverlayRef.current, {
        x: "-100%",
        duration: 0.5,
        ease: "power3.inOut",
        onComplete: () => {
          setContactMounted(false);
          if (cardRef.current) {
            gsap.to(cardRef.current, { backgroundColor: "#0D3CFC", duration: 0.4, ease: "power2.inOut" });
          }
        },
      });
    }
  }, [showContact, contactMounted]);

  useEffect(() => {
    if (!contactMounted || !contactOverlayRef.current) return;
    gsap.set(contactOverlayRef.current, { x: "-100%" });
    if (cardRef.current) {
      gsap.to(cardRef.current, { backgroundColor: "#F2EA6B", duration: 0.4, ease: "power2.inOut" });
    }
    gsap.to(contactOverlayRef.current, {
      x: "0%",
      duration: 0.55,
      ease: "power3.inOut",
      onComplete: () => {
        if (contactCloseRef.current) {
          gsap.fromTo(contactCloseRef.current, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.5)" });
        }
      },
    });
  }, [contactMounted]);

  if (!isMounted || loading) {
    return <div style={{ minHeight: "100vh", backgroundColor: "#ffffff" }} />;
  }

  return (
    <>
      <Head>
        <title>CV | Menuru Official</title>
        <meta name="description" content="CV - Menuru Official" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#0D3CFC" />
        <link rel="icon" href="/images/ai.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/images/ai.jpg" />
      </Head>

      {/* NAVBAR */}
      <LeftNavbar />
      <RightNavbar />

      {/* CV SECTION */}
      <div
        style={{
          minHeight: "100vh",
          width: "100%",
          backgroundColor: "#ffffff",
          position: "relative",
          fontFamily: FONT_FAMILY,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "140px 24px 60px 24px",
          boxSizing: "border-box",
        }}
      >
        {/* CARD WRAPPER — maxWidth akan dianimasikan oleh GSAP */}
        <div
          ref={cardWrapperRef}
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "380px",
            height: "760px",
            zIndex: 1,
          }}
        >
          {/* CARD */}
          <div
            ref={cardRef}
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "#0D3CFC",
              borderRadius: "20px",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div className="cv-scroll-inner" style={{ width: "100%", height: "100%", overflowY: "auto", overflowX: "hidden", scrollbarWidth: "none", msOverflowStyle: "none" }}>
              <div style={{ position: "relative", width: "100%", minHeight: "100%", display: "flex", flexDirection: "column" }}>
                {/* PHOTO AREA */}
                <div style={{ position: "relative", width: "100%", height: "760px", flexShrink: 0 }}>
                  <img
                    ref={photoRef}
                    src="/images/DSC_0614-min.JPG"
                    alt="CV"
                    style={{
                      position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
                      objectFit: "cover", objectPosition: "center center",
                      display: "block", borderRadius: "20px",
                    }}
                  />

                  {isOpen && (
                    <div ref={textTopRef} style={{ position: "absolute", top: "28px", left: "24px", zIndex: 9, fontFamily: FONT_FAMILY, color: "#ffffff", pointerEvents: "none", lineHeight: 1.1, textAlign: "left" }}>
                      <div style={{ fontSize: "30px", fontWeight: 800 }}>People</div>
                      <div style={{ fontSize: "30px", fontWeight: 800 }}>Menuru</div>
                    </div>
                  )}

                  {!isOpen && (
                    <div ref={textBottomRef} style={{ position: "absolute", bottom: "28px", left: "0", width: "100%", textAlign: "center", zIndex: 9, fontFamily: FONT_FAMILY, color: "#ffffff", pointerEvents: "none", lineHeight: 1.1, padding: "0 16px", boxSizing: "border-box" }}>
                      <div style={{ fontSize: "26px", fontWeight: 800 }}>Curriculum Vitae</div>
                      <div style={{ fontSize: "26px", fontWeight: 800 }}>Actual [ 16.09 ]</div>
                    </div>
                  )}
                </div>

                {/* ABOUT + WORK + CONTACT */}
                {isOpen && (
                  <div style={{ width: "100%", padding: "24px 24px 60px 24px", boxSizing: "border-box", fontFamily: FONT_FAMILY, color: "#ffffff", display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div ref={textAboutRef} style={{ fontSize: "30px", fontWeight: 800, color: "#ffffff" }}>About</div>
                    <div ref={textParagraphRef}>
                      <p style={{ fontSize: "16px", fontWeight: 700, lineHeight: 1.5, color: "#ffffff", margin: 0, letterSpacing: "-0.01em" }}>
                        Lulusan S1 Sistem Komputer Universitas Gunadarma dengan IPK 3,54. Memiliki minat di bidang pengembangan web dan terus mengembangkan kemampuan melalui pembelajaran mandiri menggunakan JavaScript, React.js, Next.js, TypeScript, dan Astro. Memiliki pengalaman mengerjakan proyek berbasis Arduino selama perkuliahan serta memahami dasar penggunaan Firebase. Disiplin, cepat belajar, bertanggung jawab, dan mampu bekerja secara individu maupun dalam tim.
                      </p>
                    </div>
                    <div ref={textWorkRef} style={{ fontSize: "30px", fontWeight: 800, color: "#ffffff", marginTop: "8px" }}>Work Experience</div>
                    <div ref={workBlockRef}><WorkExperienceItem /></div>

                    <button
                      onClick={() => setShowContact(true)}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                        marginTop: "12px", padding: "14px 24px", backgroundColor: "#ffffff", color: "#0D3CFC",
                        border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: 700,
                        cursor: "pointer", fontFamily: FONT_FAMILY, width: "100%",
                      }}
                    >
                      <MailIcon size={18} color="#0D3CFC" />
                      Contact
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* INFO BUTTON */}
            <button
              ref={buttonRef}
              onClick={() => setIsOpen((v) => !v)}
              style={{
                position: "absolute", top: "16px", right: "16px", zIndex: 20,
                padding: "10px 18px", backgroundColor: "#0D3CFC", color: "#ffffff",
                border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 700,
                cursor: "pointer", fontFamily: FONT_FAMILY,
                display: "flex", alignItems: "center", gap: "8px",
              }}
            >
              <div ref={plusWrapRef} style={{ display: "flex", alignItems: "center", transformOrigin: "center center" }}>
                <PlusIcon size={16} color={isOpen ? "#0D3CFC" : "#ffffff"} />
              </div>
              <span>{isOpen ? "Close" : "Info"}</span>
            </button>

            {/* CONTACT OVERLAY — LIVE CHAT AGENT */}
            {contactMounted && (
              <div
                ref={contactOverlayRef}
                style={{
                  position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
                  backgroundColor: "#F2EA6B", zIndex: 30, borderRadius: "20px",
                  overflow: "hidden", display: "flex", flexDirection: "column",
                }}
              >
                {/* CLOSE BUTTON */}
                <button
                  ref={contactCloseRef}
                  onClick={() => setShowContact(false)}
                  style={{
                    position: "absolute", top: "16px", right: "16px", zIndex: 40,
                    display: "flex", alignItems: "center", gap: "8px",
                    padding: "10px 18px", backgroundColor: "#0D3CFC", color: "#ffffff",
                    border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 700,
                    cursor: "pointer", fontFamily: FONT_FAMILY,
                  }}
                >
                  <CloseIcon size={16} color="#ffffff" />
                  <span>Close</span>
                </button>

                {/* CONTENT — LIVE CHAT AGENT */}
                <div
                  ref={contactContentRef}
                  style={{
                    width: "100%", height: "100%",
                    padding: "72px 16px 16px 16px",
                    boxSizing: "border-box",
                    display: "flex", flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      flex: 1, width: "100%",
                      backgroundColor: "#ffffff",
                      borderRadius: "12px",
                      overflow: "hidden",
                      position: "relative",
                      display: "flex", flexDirection: "column",
                      minHeight: 0,
                    }}
                  >
                    <LiveChatAgent user={user} isAdmin={isAdmin} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div
        style={{
          width: "100%", padding: "60px 40px 40px 40px",
          backgroundColor: "#ffffff",
          borderTop: "1px solid rgba(0,0,0,0.05)",
          marginTop: "20px", position: "relative", overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", left: "40px", top: "50%", transform: "translateY(-50%)", width: "200px", opacity: 0.8 }}>
          <img src="/images/p0l.jpg" alt="" style={{ width: "100%", height: "auto", display: "block", objectFit: "cover" }} />
        </div>
        <div style={{ position: "absolute", right: "40px", top: "50%", transform: "translateY(-50%)", width: "200px", opacity: 0.8 }}>
          <img src="/images/xxz.jpg" alt="" style={{ width: "100%", height: "auto", display: "block", objectFit: "cover" }} />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", maxWidth: "1400px", margin: "0 auto", gap: "40px", flexWrap: "wrap", position: "relative", zIndex: 1 }}>
          {footerLinks.map((section, idx) => (
            <div key={idx} style={{ flex: "1", minWidth: "200px" }}>
              <h3 style={{ fontFamily: FONT_FAMILY, fontSize: "28px", fontWeight: 600, color: "#000000", margin: 0, marginBottom: "16px", letterSpacing: "-0.01em" }}>
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
                        <span style={{ fontFamily: FONT_FAMILY, fontSize: "20px", fontWeight: 400, color: "#0D3CFC", letterSpacing: "-0.01em", cursor: "pointer" }}>
                          {link}
                        </span>
                      </Link>
                      {isAttention && (
                        <span style={{ backgroundColor: "#0D3CFC", color: "#ffffff", padding: "2px 10px", borderRadius: "4px", fontSize: "11px", fontWeight: 600, fontFamily: FONT_FAMILY }}>
                          Updated
                        </span>
                      )}
                      {isStories && (
                        <span style={{ backgroundColor: "#0D3CFC", color: "#ffffff", padding: "2px 10px", borderRadius: "4px", fontSize: "11px", fontWeight: 600, fontFamily: FONT_FAMILY }}>
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

        <div style={{ maxWidth: "1400px", margin: "40px auto 0 auto", paddingTop: "20px", borderTop: "1px solid rgba(0,0,0,0.05)", position: "relative", zIndex: 1 }}>
          <p style={{ fontFamily: FONT_FAMILY, fontSize: "14px", fontWeight: 400, color: "#666", margin: 0, textAlign: "center" }}>
            Terms and conditions apply. By using this website, you agree to our Terms of Use and Privacy Policy.
          </p>
        </div>
      </div>

      {/* MENURU FOOTER TEXT */}
      <div
        ref={menuruFooterRef}
        style={{
          width: "100%", padding: "20px 40px 80px 40px",
          backgroundColor: "#ffffff", overflow: "hidden",
          display: "flex", flexDirection: "column", minHeight: "300px",
        }}
      >
        <span
          ref={menuruTextRef}
          style={{
            fontFamily: FONT_FAMILY, fontSize: "450px", fontWeight: 700,
            color: "#0D3CFC", letterSpacing: "-0.02em", lineHeight: "0.8",
            display: "block", textAlign: "left",
          }}
        >
          Menuru
        </span>
        <div style={{ marginTop: "30px", width: "100%", display: "flex", justifyContent: "flex-start" }}>
          <span style={{ fontFamily: FONT_FAMILY, fontSize: "16px", fontWeight: 400, color: "#0D3CFC", opacity: 0.8 }}>
            2024 - 2026 Menuru. All rights reserved.
          </span>
        </div>
      </div>

      <style jsx global>{`
        html { overflow: auto !important; -ms-overflow-style: none !important; scrollbar-width: none !important; height: 100% !important; }
        html::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
        body { overflow: auto !important; -ms-overflow-style: none !important; scrollbar-width: none !important; margin: 0; padding: 0; background-color: #ffffff !important; min-height: 100% !important; height: auto !important; }
        body::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
        * { background-color: transparent; }
        .menuru-char { display: inline-block; will-change: transform, opacity; }
        .cv-scroll-inner::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
        .cv-scroll-inner { scrollbar-width: none !important; -ms-overflow-style: none !important; }
      `}</style>
    </>
  );
}
