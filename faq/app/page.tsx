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
} from "firebase/firestore";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Physics2DPlugin } from "gsap/Physics2DPlugin";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, Physics2DPlugin);
}

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

const FONT_FAMILY = "'Poppins', 'Poppins Fallback', sans-serif";
const ADMIN_EMAIL = "faridardiansyah061@gmail.com";
const AGENT_NAME = "Farid Ardiansyah";
const TOUR_STORAGE_KEY = "menuru_livechat_tour_completed_v1";
const COOKIE_CONSENT_STORAGE_KEY = "menuru_cookie_consent_v1";

// ===== CORE COLORS =====
const BLUE = "#0D3CFC";
const WHITE = "#FFFFFF";
const BLACK = "#000000";

// ===== STATUS STYLES =====
const STATUS_STYLES: {
  [key: string]: {
    label: string;
    bg: string;
    text: string;
    border: string;
  };
} = {
  waiting: { label: "Waiting", bg: WHITE, text: BLUE, border: BLUE },
  active: { label: "Active", bg: BLACK, text: WHITE, border: WHITE },
  resolved: { label: "Resolved", bg: WHITE, text: BLUE, border: BLUE },
  closed: { label: "Closed", bg: BLACK, text: WHITE, border: WHITE },
};

// ===== TOPIC STYLES =====
const TOPIC_STYLES: {
  [key: string]: { bg: string; text: string; border: string };
} = {
  "Product Inquiry": { bg: WHITE, text: BLUE, border: BLUE },
  "Technical Support": { bg: BLACK, text: WHITE, border: WHITE },
  "Account Issues": { bg: WHITE, text: BLUE, border: BLUE },
  "Donation": { bg: BLACK, text: WHITE, border: WHITE },
  "Partnership": { bg: WHITE, text: BLUE, border: BLUE },
  "Other": { bg: BLACK, text: WHITE, border: WHITE },
};

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

const ReplyIcon = ({ size = 14, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M9 17L4 12L9 7" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 12H14C17.3137 12 20 14.6863 20 18V19" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ShieldBanIcon = ({ size = 20, color = "#ffffff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2L4 5V11C4 16 8 20 12 22C16 20 20 16 20 11V5L12 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 9L15 15" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M15 9L9 15" stroke={color} strokeWidth="2" strokeLinecap="round" />
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
  lastMessageSender?: string;
  unreadCount: number;
  typing: boolean;
  typingUserId?: string | null;
  typingUserName?: string | null;
  isAnnouncement?: boolean;
  isBroadcast?: boolean;
  isBanned?: boolean;
  banReason?: string;
  banMessage?: string;
}

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
  replyTo?: {
    messageId: string;
    senderName: string;
    text: string;
  } | null;
}

interface OnlineUser {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  online: boolean;
  lastSeen?: any;
  isAgent?: boolean;
}

interface LastMessagePreview {
  text: string;
  senderName: string;
  timestamp: any;
  isFromAgent: boolean;
}

interface TourStep {
  target: string;
  title: string;
  content: string;
  position?: "top" | "bottom" | "left" | "right";
  isLoginStep?: boolean;
}

interface AppealMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: any;
  read: boolean;
  isEncrypted?: boolean;
  deliveryStatus?: "sending" | "sent" | "delivered" | "read" | "failed";
  replyTo?: {
    messageId: string;
    senderName: string;
    text: string;
  } | null;
}

interface AppealTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhoto?: string;
  agentId?: string;
  agentName?: string;
  status: "waiting" | "active" | "resolved" | "closed";
  topic: string;
  banReason: string;
  banMessage: string;
  createdAt: any;
  lastMessage?: string;
  lastMessageTime?: any;
  lastMessageSender?: string;
  unreadCount: number;
  typing: boolean;
  typingUserId?: string | null;
  typingUserName?: string | null;
}

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
          end: "+=900",
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
        height: "1100px",
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
      document.fonts.ready.then(() => {
        setTimeout(setup, 50);
      });
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

// ===== COOKIE CONSENT POPUP =====
const CookieConsentPopup = ({
  user,
  db,
  isMounted,
}: {
  user: any;
  db: any;
  isMounted: boolean;
}) => {
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMounted) return;
    let cancelled = false;

    const checkConsent = async () => {
      if (user && db) {
        try {
          const userRef = doc(db, "users", user.uid);
          const snap = await getDoc(userRef);
          if (!cancelled && snap.exists()) {
            const data = snap.data();
            const consent = data?.cookieConsent;
            if (consent?.accepted === true) {
              setVisible(false);
              return;
            }
          }
        } catch (err) {
          console.error("Error checking cookie consent in Firestore:", err);
        }
      }

      try {
        const local = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
        if (local === "accepted") {
          if (!cancelled) setVisible(false);
          return;
        }
      } catch (e) {
        // ignore
      }

      if (!cancelled) setVisible(true);
    };

    checkConsent();
    return () => {
      cancelled = true;
    };
  }, [user, db, isMounted]);

  useEffect(() => {
    if (visible && cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 40, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power3.out" }
      );
    }
  }, [visible]);

  const handleAccept = async () => {
    if (saving) return;
    setSaving(true);

    const nowIso = new Date().toISOString();
    const consentPayload = {
      accepted: true,
      acceptedAt: nowIso,
      policyVersion: "v1",
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
    };

    if (user && db) {
      try {
        const userRef = doc(db, "users", user.uid);
        await setDoc(
          userRef,
          {
            cookieConsent: consentPayload,
            cookieConsentUpdatedAt: serverTimestamp(),
          },
          { merge: true }
        );

        try {
          await addDoc(collection(db, "cookie_consents_log"), {
            userId: user.uid,
            userEmail: user.email || "",
            userName: user.displayName || "",
            ...consentPayload,
            timestamp: serverTimestamp(),
          });
        } catch (logErr) {
          console.error("Error writing cookie consent log:", logErr);
        }
      } catch (err) {
        console.error("Error saving cookie consent to Firestore:", err);
      }
    }

    try {
      localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, "accepted");
    } catch (e) {
      // ignore
    }

    if (cardRef.current) {
      gsap.to(cardRef.current, {
        opacity: 0,
        y: 40,
        scale: 0.96,
        duration: 0.35,
        ease: "power2.in",
        onComplete: () => setVisible(false),
      });
    } else {
      setVisible(false);
    }
    setSaving(false);
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        right: "24px",
        bottom: "24px",
        zIndex: 9500,
        maxWidth: "380px",
        width: "calc(100% - 48px)",
        fontFamily: FONT_FAMILY,
      }}
    >
      <div
        ref={cardRef}
        style={{
          backgroundColor: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRadius: "16px",
          border: "1px solid rgba(255,255,255,0.5)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
          padding: "20px 22px",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              backgroundColor: "#0D3CFC",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#ffffff" strokeWidth="2" />
              <circle cx="9" cy="10" r="1.4" fill="#ffffff" />
              <circle cx="15" cy="9" r="1.2" fill="#ffffff" />
              <circle cx="14" cy="15" r="1.4" fill="#ffffff" />
              <circle cx="9.5" cy="15.5" r="1" fill="#ffffff" />
            </svg>
          </div>
          <span style={{ fontSize: "15px", fontWeight: 700, color: "#000000", letterSpacing: "-0.01em" }}>
            Cookies
          </span>
        </div>

        <p style={{ fontSize: "13px", lineHeight: 1.55, color: "#333333", margin: 0 }}>
          We use cookies to improve your experience and analyse site usage.{" "}
          <Link href="/cookie-policy" style={{ color: "#0D3CFC", textDecoration: "underline", fontWeight: 600 }}>
            Cookie Policy
          </Link>
        </p>

        <button
          onClick={handleAccept}
          disabled={saving}
          style={{
            alignSelf: "flex-end",
            padding: "10px 24px",
            backgroundColor: saving ? "#7d97f7" : "#0D3CFC",
            color: "#ffffff",
            border: "none",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: 700,
            cursor: saving ? "not-allowed" : "pointer",
            fontFamily: FONT_FAMILY,
            transition: "background-color 0.2s ease, transform 0.15s ease",
          }}
          onMouseEnter={(e) => {
            if (!saving) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#000000";
          }}
          onMouseLeave={(e) => {
            if (!saving) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#0D3CFC";
          }}
        >
          {saving ? "Saving..." : "Accept"}
        </button>
      </div>
    </div>
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
  iconComponent,
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
  iconComponent?: React.ReactNode;
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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
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
                  {iconComponent ? iconComponent : iconType === "trust" ? (
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

// ===== RIGHT NAVBAR (Login / User dengan Rolling Text GSAP) =====
const RightNavbar = ({ user, auth, db }: { user: any; auth: any; db: any }) => {
  const rollingRef = useRef<HTMLDivElement>(null);
  const [rollingIndex, setRollingIndex] = useState(0);

  const displayName = user?.displayName || user?.email?.split("@")[0] || "User";
  const photoURL = user?.photoURL || "";

  useEffect(() => {
    if (!user) return;
    if (!rollingRef.current) return;

    const interval = setInterval(() => {
      setRollingIndex((prev) => (prev + 1) % 3);
    }, 3000);

    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    if (!rollingRef.current) return;

    const el = rollingRef.current;
    gsap.killTweensOf(el);

    gsap.fromTo(
      el,
      { yPercent: 100, opacity: 0, rotateX: -90, transformOrigin: "50% 100%" },
      { yPercent: 0, opacity: 1, rotateX: 0, duration: 0.6, ease: "back.out(1.7)" }
    );

    return () => {
      gsap.killTweensOf(el);
    };
  }, [rollingIndex, user]);

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
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

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
      <div
        style={{
          position: "relative",
          height: "90px",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          minWidth: "260px",
        }}
      >
        <div
          ref={rollingRef}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "12px",
            width: "100%",
          }}
        >
          {rollingIndex === 0 && (
            <>
              <span
                style={{
                  color: BLUE,
                  fontSize: "70px",
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                  whiteSpace: "nowrap",
                  fontFamily: FONT_FAMILY,
                }}
              >
                {displayName}
              </span>
              <div
                style={{
                  width: "70px",
                  height: "70px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  backgroundColor: BLUE,
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
                  <span style={{ fontSize: "30px", fontWeight: 800, color: WHITE }}>
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </>
          )}

          {rollingIndex === 1 && (
            <Link
              href="/dashboard"
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                whiteSpace: "nowrap",
              }}
            >
              <span
                style={{
                  color: BLUE,
                  fontSize: "70px",
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                  fontFamily: FONT_FAMILY,
                }}
              >
                Dashboard
              </span>
              <NorthEastArrow size={50} color={BLUE} />
            </Link>
          )}

          {rollingIndex === 2 && (
            <button
              onClick={handleLogout}
              style={{
                background: "transparent",
                border: "none",
                padding: 0,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                whiteSpace: "nowrap",
                fontFamily: FONT_FAMILY,
              }}
            >
              <span
                style={{
                  color: BLUE,
                  fontSize: "70px",
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                }}
              >
                Logout
              </span>
              <LogoutIcon size={50} color={BLUE} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ===== ONBOARDING TOUR =====
const OnboardingTour = ({
  steps,
  onComplete,
  isActive,
  currentStep,
  setCurrentStep,
}: {
  steps: TourStep[];
  onComplete: () => void;
  isActive: boolean;
  currentStep: number;
  setCurrentStep: (n: number) => void;
}) => {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const [arrowPos, setArrowPos] = useState<"top" | "bottom" | "left" | "right">("bottom");

  const step = steps[currentStep];

  useEffect(() => {
    if (!isActive || !step) return;

    const updateRect = () => {
      const el = document.querySelector(`[data-tour="${step.target}"]`);
      if (el) {
        const rect = el.getBoundingClientRect();
        setTargetRect(rect);

        const tooltipWidth = 340;
        const tooltipHeight = 200;
        const arrowSize = 14;
        const gap = 14;
        let top = 0;
        let left = 0;
        let arrow: "top" | "bottom" | "left" | "right" = "bottom";

        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const spaceRight = window.innerWidth - rect.right;
        const spaceLeft = rect.left;

        let pos = step.position || "bottom";
        if (pos === "bottom" && spaceBelow < tooltipHeight + gap) pos = spaceAbove > spaceBelow ? "top" : "bottom";
        if (pos === "top" && spaceAbove < tooltipHeight + gap) pos = spaceBelow > spaceAbove ? "bottom" : "top";
        if (pos === "right" && spaceRight < tooltipWidth + gap) pos = spaceLeft > spaceRight ? "left" : "right";
        if (pos === "left" && spaceLeft < tooltipWidth + gap) pos = spaceRight > spaceLeft ? "right" : "left";

        if (pos === "bottom") {
          top = rect.bottom + gap + arrowSize;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          arrow = "top";
        } else if (pos === "top") {
          top = rect.top - tooltipHeight - gap - arrowSize;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          arrow = "bottom";
        } else if (pos === "left") {
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.left - tooltipWidth - gap - arrowSize;
          arrow = "right";
        } else if (pos === "right") {
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.right + gap + arrowSize;
          arrow = "left";
        }

        const padding = 12;
        if (left < padding) left = padding;
        if (left + tooltipWidth > window.innerWidth - padding) left = window.innerWidth - tooltipWidth - padding;
        if (top < padding) top = padding;
        if (top + tooltipHeight > window.innerHeight - padding) top = window.innerHeight - tooltipHeight - padding;

        setTooltipPos({ top, left });
        setArrowPos(arrow);
      } else {
        setTargetRect(null);
      }
    };

    updateRect();
    const el = document.querySelector(`[data-tour="${step.target}"]`);
    if (el) (el as HTMLElement).scrollIntoView({ behavior: "smooth", block: "center" });
    const timeout = setTimeout(updateRect, 400);

    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
      clearTimeout(timeout);
    };
  }, [isActive, currentStep, step]);

  if (!isActive || !step) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
    else onComplete();
  };
  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };
  const handleSkip = () => onComplete();

  const renderArrow = () => {
    const arrowSize = 14;
    const baseStyle: React.CSSProperties = {
      position: "absolute",
      width: 0,
      height: 0,
      borderStyle: "solid",
      pointerEvents: "none",
    };

    if (arrowPos === "top") return <div style={{ ...baseStyle, top: -arrowSize, left: "50%", marginLeft: -arrowSize, borderWidth: `0 ${arrowSize}px ${arrowSize}px ${arrowSize}px`, borderColor: `transparent transparent #0D3CFC transparent` }} />;
    if (arrowPos === "bottom") return <div style={{ ...baseStyle, bottom: -arrowSize, left: "50%", marginLeft: -arrowSize, borderWidth: `${arrowSize}px ${arrowSize}px 0 ${arrowSize}px`, borderColor: `#0D3CFC transparent transparent transparent` }} />;
    if (arrowPos === "left") return <div style={{ ...baseStyle, left: -arrowSize, top: "50%", marginTop: -arrowSize, borderWidth: `${arrowSize}px ${arrowSize}px ${arrowSize}px 0`, borderColor: `transparent #0D3CFC transparent transparent` }} />;
    if (arrowPos === "right") return <div style={{ ...baseStyle, right: -arrowSize, top: "50%", marginTop: -arrowSize, borderWidth: `${arrowSize}px 0 ${arrowSize}px ${arrowSize}px`, borderColor: `transparent transparent transparent #0D3CFC` }} />;
    return null;
  };

  return (
    <>
      <div onClick={handleSkip} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 9998, pointerEvents: "auto" }} />

      {targetRect && (
        <div
          style={{
            position: "fixed",
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
            borderRadius: "12px",
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.6), 0 0 0 3px #0D3CFC",
            zIndex: 9999,
            pointerEvents: "none",
            transition: "all 0.3s ease",
          }}
        />
      )}

      <div
        style={{
          position: "fixed",
          top: tooltipPos.top,
          left: tooltipPos.left,
          width: "340px",
          backgroundColor: "#0D3CFC",
          borderRadius: "14px",
          padding: "22px 24px",
          zIndex: 10000,
          fontFamily: FONT_FAMILY,
          boxShadow: "none",
          border: "none",
          transition: "all 0.3s ease",
        }}
      >
        {renderArrow()}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#ffffff", letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.9 }}>
            Step {currentStep + 1} of {steps.length}
          </span>
          <button onClick={handleSkip} style={{ background: "transparent", border: "none", color: "#ffffff", cursor: "pointer", fontSize: "18px", fontFamily: FONT_FAMILY, padding: 0, lineHeight: 1, opacity: 0.9 }} aria-label="Skip tour">
            ×
          </button>
        </div>

        <h4 style={{ fontSize: "18px", fontWeight: 700, color: "#ffffff", margin: 0, marginBottom: "8px" }}>{step.title}</h4>
        <p style={{ fontSize: "13px", fontWeight: 400, color: "#ffffff", margin: 0, marginBottom: "18px", lineHeight: 1.5, opacity: 0.95 }}>
          {step.content}
        </p>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            style={{
              padding: "7px 14px",
              backgroundColor: "transparent",
              color: currentStep === 0 ? "rgba(255,255,255,0.4)" : "#ffffff",
              border: currentStep === 0 ? "1px solid rgba(255,255,255,0.2)" : "1px solid #ffffff",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: currentStep === 0 ? "not-allowed" : "pointer",
              fontFamily: FONT_FAMILY,
            }}
          >
            Back
          </button>
          <button onClick={handleSkip} style={{ padding: "7px 14px", backgroundColor: "transparent", color: "#ffffff", border: "none", borderRadius: "8px", fontSize: "12px", fontWeight: 500, cursor: "pointer", fontFamily: FONT_FAMILY, opacity: 0.8 }}>
            Skip Tour
          </button>
          <button
            onClick={handleNext}
            style={{
              padding: "7px 18px",
              backgroundColor: "#ffffff",
              color: "#0D3CFC",
              border: "none",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: FONT_FAMILY,
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {currentStep === steps.length - 1 ? "Finish" : "Next"}
            <NorthEastArrow size={14} color="#0D3CFC" />
          </button>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "5px", marginTop: "14px" }}>
          {steps.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === currentStep ? "18px" : "6px",
                height: "6px",
                borderRadius: "3px",
                backgroundColor: i === currentStep ? "#ffffff" : "rgba(255,255,255,0.35)",
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
};

// ===== ROLLING NEW MESSAGE =====
const RollingNewMessage = ({
  senderName,
  message,
  isFromAgent,
}: {
  senderName: string;
  message: string;
  isFromAgent: boolean;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const prevMessageRef = useRef<string>("");

  useEffect(() => {
    if (!containerRef.current || !textRef.current) return;
    if (message === prevMessageRef.current) return;
    prevMessageRef.current = message;

    const container = containerRef.current;
    const textEl = textRef.current;

    gsap.killTweensOf([container, textEl]);

    gsap.set(container, { height: 0, opacity: 0 });
    gsap.set(textEl, { yPercent: 120, opacity: 0, rotateX: -90, transformOrigin: "50% 100%" });

    const tl = gsap.timeline();
    tl.to(container, {
      height: 24,
      opacity: 1,
      duration: 0.4,
      ease: "power2.out",
    }).to(
      textEl,
      {
        yPercent: 0,
        opacity: 1,
        rotateX: 0,
        duration: 0.6,
        ease: "back.out(1.7)",
      },
      "-=0.2"
    );

    return () => {
      tl.kill();
    };
  }, [message]);

  const safeMessage = typeof message === "string" ? message : "";

  return (
    <div
      ref={containerRef}
      style={{
        overflow: "hidden",
        height: 0,
        opacity: 0,
        marginTop: 0,
        display: "flex",
        alignItems: "center",
        gap: "6px",
        fontFamily: FONT_FAMILY,
        fontSize: "13px",
        whiteSpace: "nowrap",
        paddingLeft: "4px",
      }}
    >
      <div ref={textRef} style={{ display: "flex", alignItems: "center", gap: "6px", overflow: "hidden", width: "100%" }}>
        <span style={{ fontWeight: 700, color: "#0D3CFC", flexShrink: 0 }}>{senderName}</span>
        <span style={{ color: "#666", flexShrink: 0 }}>from</span>
        <span
          style={{
            color: "#0D3CFC",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontStyle: "italic",
            fontWeight: 500,
          }}
        >
          {safeMessage.length > 60 ? safeMessage.substring(0, 60) + "..." : safeMessage}
        </span>
      </div>
    </div>
  );
};

// ===== CLOSE BUTTON WITH GSAP =====
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
      gsap.timeline()
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
        backgroundColor: BLACK,
        border: `1.5px solid ${BLACK}`,
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

// ===== BANNED INFO BANNER (BODY CHAT) =====
const BannedInfoBanner = ({
  banReason,
  banMessage,
  onAppeal,
  hasAppeal,
}: {
  banReason: string;
  banMessage: string;
  onAppeal: () => void;
  hasAppeal: boolean;
}) => {
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bannerRef.current) {
      gsap.fromTo(
        bannerRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
      );
    }
  }, []);

  return (
    <div
      ref={bannerRef}
      style={{
        backgroundColor: BLUE,
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        borderBottom: `2px solid ${WHITE}`,
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <ShieldBanIcon size={28} color={WHITE} />
        <span
          style={{
            fontSize: "18px",
            fontWeight: 800,
            color: WHITE,
            fontFamily: FONT_FAMILY,
            letterSpacing: "0.5px",
            textTransform: "uppercase",
          }}
        >
          Account Permanently Banned
        </span>
      </div>
      <div
        style={{
          fontSize: "14px",
          color: WHITE,
          fontFamily: FONT_FAMILY,
          lineHeight: 1.5,
          opacity: 0.95,
        }}
      >
        <strong>Reason:</strong> {banReason || "Suspicious Activity"}
      </div>
      {banMessage && (
        <div
          style={{
            fontSize: "13px",
            color: WHITE,
            fontFamily: FONT_FAMILY,
            lineHeight: 1.5,
            opacity: 0.9,
            padding: "10px 14px",
            backgroundColor: "rgba(255,255,255,0.15)",
            borderRadius: "8px",
            border: `1px solid rgba(255,255,255,0.3)`,
          }}
        >
          {banMessage}
        </div>
      )}
      {!hasAppeal && (
        <button
          onClick={onAppeal}
          style={{
            alignSelf: "flex-start",
            padding: "10px 20px",
            backgroundColor: WHITE,
            color: BLUE,
            border: `2px solid ${WHITE}`,
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 800,
            cursor: "pointer",
            fontFamily: FONT_FAMILY,
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            marginTop: "4px",
          }}
        >
          Ajukan Banding
        </button>
      )}
      {hasAppeal && (
        <div
          style={{
            alignSelf: "flex-start",
            padding: "8px 16px",
            backgroundColor: "rgba(255,255,255,0.2)",
            color: WHITE,
            border: `1.5px solid rgba(255,255,255,0.5)`,
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: 700,
            fontFamily: FONT_FAMILY,
            letterSpacing: "0.5px",
            textTransform: "uppercase",
          }}
        >
          Banding Sedang Diproses
        </div>
      )}
    </div>
  );
};

// ===== APPEAL CHAT ROOM (BANDING) =====
const AppealChatRoom = ({
  user,
  isAdmin,
  db,
  appealTicket,
  onClose,
}: {
  user: any;
  isAdmin: boolean;
  db: any;
  appealTicket: AppealTicket;
  onClose: () => void;
}) => {
  const [messages, setMessages] = useState<AppealMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [replyTo, setReplyTo] = useState<AppealMessage | null>(null);
  const [encryptionReady, setEncryptionReady] = useState(false);
  const [typing, setTyping] = useState(false);
  const [typingUserName, setTypingUserName] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatMessagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevMessagesLenRef = useRef<number>(0);

  useEffect(() => {
    getCryptoKey()
      .then(() => setEncryptionReady(true))
      .catch(() => setEncryptionReady(true));
  }, []);

  useEffect(() => {
    if (!db || !appealTicket) return;
    const q = query(
      collection(db, "appeal_tickets", appealTicket.id, "messages"),
      orderBy("timestamp", "asc")
    );
    const unsubscribe = onSnapshot(q, async (snapshot: any) => {
      const msgList: AppealMessage[] = [];
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
        msgList.push({ id: docSnap.id, ...data, text } as AppealMessage);
      }
      prevMessagesLenRef.current = msgList.length;
      setMessages(msgList);
      requestAnimationFrame(() => {
        if (chatMessagesContainerRef.current) {
          chatMessagesContainerRef.current.scrollTop = chatMessagesContainerRef.current.scrollHeight;
        }
      });
    });
    return () => unsubscribe();
  }, [db, appealTicket]);

  // Mark as read
  useEffect(() => {
    if (!db || !appealTicket || !user) return;
    const unread = messages.filter((m) => m.senderId !== user.uid && !m.read);
    unread.forEach(async (msg) => {
      const msgRef = doc(db, "appeal_tickets", appealTicket.id, "messages", msg.id);
      await updateDoc(msgRef, { read: true, deliveryStatus: "read" });
    });
  }, [messages, appealTicket, db, user]);

  // Typing indicator
  useEffect(() => {
    if (!db || !appealTicket) return;
    const ticketRef = doc(db, "appeal_tickets", appealTicket.id);
    const unsub = onSnapshot(ticketRef, (snap: any) => {
      if (snap.exists()) {
        const data = snap.data();
        setTyping(data.typing || false);
        setTypingUserName(data.typingUserName || null);
      }
    });
    return () => unsub();
  }, [db, appealTicket]);

  const handleTyping = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessageText(value);
    if (!appealTicket || !user || !db) return;
    const ticketRef = doc(db, "appeal_tickets", appealTicket.id);
    if (value.length > 0) {
      await updateDoc(ticketRef, {
        typing: true,
        typingUserId: user.uid,
        typingUserName: user.displayName || user.email || "User",
      });
    } else {
      await updateDoc(ticketRef, {
        typing: false,
        typingUserId: null,
        typingUserName: null,
      });
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(async () => {
      await updateDoc(ticketRef, {
        typing: false,
        typingUserId: null,
        typingUserName: null,
      });
    }, 2000);
  };

  const sendMessage = async () => {
    if (!db || !appealTicket || !messageText.trim() || !user) return;
    if (!encryptionReady) {
      alert("Encryption is being initialized, please wait a moment.");
      return;
    }
    try {
      const ticketRef = doc(db, "appeal_tickets", appealTicket.id);
      await updateDoc(ticketRef, { typing: false, typingUserId: null, typingUserName: null });
      const senderName = isAdmin ? AGENT_NAME : user.displayName || user.email || "User";
      const encryptedMessage = await encryptMessage(messageText.trim());
      await addDoc(collection(db, "appeal_tickets", appealTicket.id, "messages"), {
        senderId: user.uid,
        senderName: senderName,
        text: encryptedMessage,
        timestamp: serverTimestamp(),
        read: false,
        isEncrypted: true,
        deliveryStatus: "sent",
        replyTo: replyTo
          ? {
              messageId: replyTo.id,
              senderName: replyTo.senderName,
              text: replyTo.text.length > 50 ? replyTo.text.substring(0, 50) + "..." : replyTo.text,
            }
          : null,
      });
      await updateDoc(ticketRef, {
        lastMessage: messageText.trim(),
        lastMessageTime: serverTimestamp(),
        lastMessageSender: senderName,
        status: "active",
        agentId: isAdmin ? user.uid : appealTicket.agentId,
        agentName: isAdmin ? AGENT_NAME : appealTicket.agentName,
      });
      setMessageText("");
      setReplyTo(null);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    } catch (error) {
      console.error("Error sending appeal message:", error);
      alert("An error occurred while sending the message. Please try again.");
    }
  };

  const renderDeliveryStatus = (msg: AppealMessage, isMine: boolean) => {
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

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: WHITE,
        borderRadius: "12px",
        overflow: "hidden",
        border: `2px solid ${BLUE}`,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 20px",
          backgroundColor: BLUE,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <div>
          <div style={{ fontWeight: 700, fontSize: "17px", color: WHITE, fontFamily: FONT_FAMILY, marginBottom: "4px" }}>
            {isAdmin ? `Banding: ${appealTicket.userName}` : "Chat Banding dengan Admin"}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <StabiloBadge
              label="Banding"
              bg={WHITE}
              text={BLUE}
              border={WHITE}
              size="sm"
            />
            {typing && (
              <span style={{ fontSize: "12px", color: WHITE, fontStyle: "italic", fontWeight: 700 }}>
                {typingUserName} is typing...
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: `1.5px solid ${WHITE}`,
            color: WHITE,
            borderRadius: "8px",
            padding: "6px 14px",
            fontSize: "12px",
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: FONT_FAMILY,
          }}
        >
          Tutup
        </button>
      </div>

      {/* Ban Info */}
      <div
        style={{
          padding: "12px 20px",
          backgroundColor: "rgba(13,60,252,0.08)",
          borderBottom: `1px solid ${BLUE}30`,
          flexShrink: 0,
        }}
      >
        <div style={{ fontSize: "12px", color: BLUE, fontFamily: FONT_FAMILY, fontWeight: 600 }}>
          <strong>Alasan banned:</strong> {appealTicket.banReason || "Suspicious Activity"}
        </div>
        {appealTicket.banMessage && (
          <div style={{ fontSize: "11px", color: BLUE, fontFamily: FONT_FAMILY, marginTop: "4px", opacity: 0.8 }}>
            {appealTicket.banMessage}
          </div>
        )}
      </div>

      {/* Messages */}
      <div
        ref={chatMessagesContainerRef}
        className="chat-messages-container"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          minHeight: 0,
        }}
      >
        {messages.length === 0 ? (
          <div style={{ textAlign: "center", color: "#999", fontSize: "14px", padding: "30px 0", fontFamily: FONT_FAMILY }}>
            Belum ada pesan. Mulai percakapan banding.
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMine = msg.senderId === user?.uid;
            return (
              <div key={msg.id || idx} style={{ alignSelf: isMine ? "flex-end" : "flex-start", maxWidth: "75%" }}>
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: "12px",
                    backgroundColor: isMine ? BLUE : "#f4f4f5",
                    color: isMine ? WHITE : BLACK,
                    fontSize: "14px",
                    fontFamily: FONT_FAMILY,
                    wordBreak: "break-word",
                    border: isMine ? "none" : "1px solid rgba(0,0,0,0.05)",
                  }}
                >
                  {!isMine && (
                    <div style={{ fontSize: "12px", fontWeight: 700, color: BLUE, marginBottom: "4px" }}>
                      {msg.senderName}
                    </div>
                  )}
                  {msg.replyTo && (
                    <div
                      style={{
                        padding: "6px 10px",
                        backgroundColor: isMine ? "rgba(255,255,255,0.2)" : "rgba(13,60,252,0.1)",
                        borderLeft: `3px solid ${isMine ? WHITE : BLUE}`,
                        borderRadius: "4px",
                        marginBottom: "6px",
                        fontSize: "11px",
                        color: isMine ? WHITE : BLUE,
                        fontStyle: "italic",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      <strong>{msg.replyTo.senderName}:</strong> {msg.replyTo.text}
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
                    <span style={{ fontSize: "10px", color: isMine ? WHITE : "#999" }}>
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                </div>
                {/* Reply button */}
                <button
                  onClick={() => setReplyTo(msg)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: BLUE,
                    fontSize: "10px",
                    cursor: "pointer",
                    fontFamily: FONT_FAMILY,
                    fontWeight: 700,
                    marginTop: "2px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    alignSelf: isMine ? "flex-end" : "flex-start",
                  }}
                >
                  <ReplyIcon size={10} color={BLUE} />
                  Reply
                </button>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Preview */}
      {replyTo && (
        <div
          style={{
            padding: "8px 20px",
            backgroundColor: "rgba(13,60,252,0.06)",
            borderTop: `1px solid ${BLUE}20`,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexShrink: 0,
          }}
        >
          <ReplyIcon size={14} color={BLUE} />
          <div style={{ flex: 1, fontSize: "12px", color: BLUE, fontFamily: FONT_FAMILY, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            <strong>{replyTo.senderName}:</strong> {replyTo.text.length > 50 ? replyTo.text.substring(0, 50) + "..." : replyTo.text}
          </div>
          <button
            onClick={() => setReplyTo(null)}
            style={{
              background: "transparent",
              border: "none",
              color: BLUE,
              cursor: "pointer",
              fontSize: "16px",
              fontFamily: FONT_FAMILY,
              padding: 0,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Input */}
      <div
        style={{
          padding: "14px 20px",
          borderTop: `1px solid ${BLUE}20`,
          display: "flex",
          gap: "10px",
          backgroundColor: WHITE,
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
          placeholder="Tulis pesan banding..."
          style={{
            flex: 1,
            padding: "12px 16px",
            border: `1px solid ${BLUE}40`,
            borderRadius: "10px",
            fontSize: "14px",
            outline: "none",
            fontFamily: FONT_FAMILY,
            backgroundColor: WHITE,
            color: BLUE,
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!messageText.trim()}
          style={{
            padding: "12px 24px",
            backgroundColor: messageText.trim() ? BLUE : "#ccc",
            color: WHITE,
            border: "none",
            borderRadius: "10px",
            cursor: messageText.trim() ? "pointer" : "not-allowed",
            fontFamily: FONT_FAMILY,
            fontSize: "13px",
            fontWeight: 800,
            letterSpacing: "0.5px",
            textTransform: "uppercase",
          }}
        >
          Kirim
        </button>
      </div>
    </div>
  );
};

// ===== LIVE CHAT AGENT COMPONENT =====
const LiveChatAgent = ({
  user,
  isAdmin,
  db,
  auth,
}: {
  user: any;
  isAdmin: boolean;
  db: any;
  auth: any;
}) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [showStartChat, setShowStartChat] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [banMessage, setBanMessage] = useState<string | null>(null);
  const [isBanned, setIsBanned] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [encryptionReady, setEncryptionReady] = useState(false);
  const [checkingBan, setCheckingBan] = useState(true);
  const [canCreateTicket, setCanCreateTicket] = useState(true);
  const [canSendMessage, setCanSendMessage] = useState(true);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);

  // Appeal states
  const [appealTickets, setAppealTickets] = useState<AppealTicket[]>([]);
  const [selectedAppealTicket, setSelectedAppealTicket] = useState<AppealTicket | null>(null);
  const [showAppealChat, setShowAppealChat] = useState(false);
  const [hasAppeal, setHasAppeal] = useState(false);

  // Admin chat states
  const [onlineAdmins, setOnlineAdmins] = useState<OnlineUser[]>([]);
  const [selectedAdmin, setSelectedAdmin] = useState<OnlineUser | null>(null);
  const [adminChatMessages, setAdminChatMessages] = useState<ChatMessage[]>([]);
  const [adminChatText, setAdminChatText] = useState("");
  const [showAdminChat, setShowAdminChat] = useState(false);
  const [adminChatReplyTo, setAdminChatReplyTo] = useState<ChatMessage | null>(null);

  const [onlineAgents, setOnlineAgents] = useState<OnlineUser[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [ticketPreviews, setTicketPreviews] = useState<{ [ticketId: string]: LastMessagePreview[] }>({});
  const [ticketMsgCounts, setTicketMsgCounts] = useState<{ [ticketId: string]: number }>({});
  const [searchQuery, setSearchQuery] = useState("");

  const [latestRollingMessage, setLatestRollingMessage] = useState<LastMessagePreview | null>(null);
  const [rollingKey, setRollingKey] = useState(0);

  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatMessagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const liveChatTitleRef = useRef<HTMLHeadingElement>(null);
  const prevMessagesLenRef = useRef<number>(0);

  const messagesCacheRef = useRef<{ [ticketId: string]: ChatMessage[] }>({});

  const topics = [
    "Product Inquiry",
    "Technical Support",
    "Account Issues",
    "Donation",
    "Partnership",
    "Other",
  ];

  const tourSteps: TourStep[] = [
    {
      target: "login-button",
      title: "Login First",
      content: "Welcome to Live Chat Agent! First, please login to your account so you can start chatting with our support agent.",
      position: "bottom",
      isLoginStep: true,
    },
    {
      target: "livechat-title",
      title: "Live Chat Agent",
      content: "This is the Live Chat Agent section. Here you can chat directly with our support team in real time.",
      position: "bottom",
    },
    {
      target: "online-panel",
      title: "Online Agents & Users",
      content: "See who is online right now. Agents see online users, and users see online agents — all updated in real time.",
      position: "right",
    },
    {
      target: "chat-list",
      title: "Chat History",
      content: "All your conversations appear here. Each ticket shows the last 3 messages preview, message count, and status.",
      position: "right",
    },
    {
      target: "search-bar",
      title: "Search Chats",
      content: "Use the search bar to quickly find any chat by name, topic, ticket ID, or message content.",
      position: "bottom",
    },
    {
      target: "start-chat-button",
      title: "Start a New Chat",
      content: "Click this button to start a new conversation with our support agent. Pick a topic and we'll connect you.",
      position: "top",
    },
  ];

  useEffect(() => {
    setIsMounted(true);
    getCryptoKey()
      .then(() => setEncryptionReady(true))
      .catch((err) => {
        console.error("Failed to initialize encryption:", err);
        setEncryptionReady(true);
      });
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    if (isAdmin) return;
    try {
      const completed = localStorage.getItem(TOUR_STORAGE_KEY);
      if (!completed) {
        const t = setTimeout(() => {
          setTourStep(0);
          setShowTour(true);
        }, 1500);
        return () => clearTimeout(t);
      }
    } catch (e) {
      // ignore
    }
  }, [isMounted, isAdmin]);

  const completeTour = useCallback(() => {
    try {
      localStorage.setItem(TOUR_STORAGE_KEY, "true");
    } catch (e) {
      // ignore
    }
    setShowTour(false);
    setTourStep(0);
  }, []);

  const restartTour = useCallback(() => {
    setTourStep(0);
    setShowTour(true);
  }, []);

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
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [isMounted]);

  // Check ban status
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
          setBanMessage(`YOUR ACCOUNT HAS BEEN PERMANENTLY BANNED\n\nReason: ${status.reason}`);
        } else {
          setIsBanned(false);
          setBanReason("");
          setCanCreateTicket(true);
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

  // Check appeal status
  useEffect(() => {
    if (!db || !user || !isMounted) return;
    const q = query(
      collection(db, "appeal_tickets"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(1)
    );
    const unsub = onSnapshot(q, (snapshot: any) => {
      if (!snapshot.empty) {
        setHasAppeal(true);
      } else {
        setHasAppeal(false);
      }
    });
    return () => unsub();
  }, [db, user, isMounted]);

  // Load appeal tickets for user or admin
  useEffect(() => {
    if (!db || !user || !isMounted) return;
    let q;
    if (isAdmin) {
      q = query(collection(db, "appeal_tickets"), orderBy("createdAt", "desc"));
    } else {
      q = query(collection(db, "appeal_tickets"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
    }
    const unsub = onSnapshot(q, (snapshot: any) => {
      const list: AppealTicket[] = [];
      snapshot.forEach((docSnap: any) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as AppealTicket);
      });
      setAppealTickets(list);
      setSelectedAppealTicket((prev) => {
        if (!prev) return prev;
        return list.find((t) => t.id === prev.id) || prev;
      });
    });
    return () => unsub();
  }, [db, user, isAdmin, isMounted]);

  // Load online admins
  useEffect(() => {
    if (!db || !isMounted) return;
    const q = query(collection(db, "users"), where("online", "==", true));
    const unsub = onSnapshot(q, (snapshot: any) => {
      const admins: OnlineUser[] = [];
      const agents: OnlineUser[] = [];
      const users: OnlineUser[] = [];
      snapshot.forEach((docSnap: any) => {
        const data = docSnap.data();
        const item: OnlineUser = {
          uid: docSnap.id,
          displayName: data.displayName || data.name || data.email || "User",
          email: data.email || "",
          photoURL: data.photoURL || "",
          online: data.online || false,
          lastSeen: data.lastSeen,
          isAgent: data.email === ADMIN_EMAIL,
        };
        if (item.isAgent) {
          admins.push(item);
          agents.push(item);
        } else {
          users.push(item);
        }
      });
      setOnlineAdmins(admins);
      setOnlineAgents(agents);
      setOnlineUsers(users);
    });
    return () => unsub();
  }, [db, isMounted]);

  // Load livechat tickets
  useEffect(() => {
    if (!db || !user || !isMounted) return;

    let q;
    if (isAdmin) {
      q = query(collection(db, "livechat_tickets"), orderBy("createdAt", "desc"));
    } else {
      q = query(collection(db, "livechat_tickets"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
    }

    const unsubscribe = onSnapshot(q, (snapshot: any) => {
      const ticketList: Ticket[] = [];
      snapshot.forEach((docSnap: any) => {
        const data = docSnap.data();
        ticketList.push({ id: docSnap.id, ...data } as Ticket);
      });
      setTickets(ticketList);
      setSelectedTicket((prev) => {
        if (!prev) return prev;
        const updated = ticketList.find((t) => t.id === prev.id);
        return updated || prev;
      });
    });
    return () => unsubscribe();
  }, [db, user, isAdmin, isMounted]);

  // Load ticket previews
  useEffect(() => {
    if (!db || !tickets.length || !isMounted) return;
    const unsubscribes: (() => void)[] = [];
    tickets.forEach((ticket) => {
      const q = query(
        collection(db, "livechat_tickets", ticket.id, "messages"),
        orderBy("timestamp", "desc"),
        limit(3)
      );
      const unsub = onSnapshot(q, async (snapshot: any) => {
        const count = snapshot.size;
        setTicketMsgCounts((prev) => ({ ...prev, [ticket.id]: count }));
        const previews: LastMessagePreview[] = [];
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
          previews.push({
            text,
            senderName: data.senderName || "User",
            timestamp: data.timestamp,
            isFromAgent: data.senderName === AGENT_NAME,
          });
        }
        setTicketPreviews((prev) => ({ ...prev, [ticket.id]: previews }));
      });
      unsubscribes.push(unsub);
    });
    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, [db, tickets, isMounted]);

  // Load messages for selected ticket
  useEffect(() => {
    if (!db || !selectedTicket || !isMounted) return;

    const ticketId = selectedTicket.id;

    if (messagesCacheRef.current[ticketId]) {
      setMessages(messagesCacheRef.current[ticketId]);
      prevMessagesLenRef.current = messagesCacheRef.current[ticketId].length;
    }

    const q = query(
      collection(db, "livechat_tickets", ticketId, "messages"),
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
          } catch (e) {
            console.error("Failed to decrypt message:", e);
            text = "[Encrypted message]";
          }
        }
        msgList.push({ id: docSnap.id, ...data, text } as ChatMessage);
      }

      const newLen = msgList.length;
      if (prevMessagesLenRef.current > 0 && newLen > prevMessagesLenRef.current) {
        const newestMsg = msgList[newLen - 1];
        if (newestMsg) {
          const isFromAgentMsg = newestMsg.senderName === AGENT_NAME;
          setLatestRollingMessage({
            text: newestMsg.text,
            senderName: newestMsg.senderName || "User",
            timestamp: newestMsg.timestamp,
            isFromAgent: isFromAgentMsg,
          });
          setRollingKey((k) => k + 1);
        }
      }
      prevMessagesLenRef.current = newLen;

      messagesCacheRef.current[ticketId] = msgList;
      setMessages(msgList);

      requestAnimationFrame(() => {
        if (chatMessagesContainerRef.current) {
          chatMessagesContainerRef.current.scrollTop = chatMessagesContainerRef.current.scrollHeight;
        }
      });
    });
    return () => unsubscribe();
  }, [db, selectedTicket, isMounted]);

  // Reset rolling message on ticket change
  useEffect(() => {
    setLatestRollingMessage(null);
    prevMessagesLenRef.current = messagesCacheRef.current[selectedTicket?.id || ""]?.length || 0;
    setShowCloseConfirm(false);
    setReplyTo(null);
  }, [selectedTicket?.id]);

  // Mark messages as read
  useEffect(() => {
    if (!db || !selectedTicket || !user || !isAdmin || !isMounted) return;
    const unread = messages.filter((m) => m.senderId !== user.uid && !m.read);
    unread.forEach(async (msg) => {
      const msgRef = doc(db, "livechat_tickets", selectedTicket.id, "messages", msg.id);
      await updateDoc(msgRef, { read: true, deliveryStatus: "read" });
    });
  }, [messages, selectedTicket, db, user, isAdmin, isMounted]);

  // Auto select ticket for user
  const hasAutoSelectedRef = useRef(false);
  useEffect(() => {
    if (!user || isAdmin || !isMounted) return;
    if (hasAutoSelectedRef.current) return;
    if (selectedTicket) {
      hasAutoSelectedRef.current = true;
      return;
    }
    const userTickets = tickets.filter((t) => t.userId === user.uid);
    if (userTickets.length === 0) return;
    const activeTicket = userTickets.find((t) => t.status === "waiting" || t.status === "active");
    if (activeTicket) {
      setSelectedTicket(activeTicket);
      hasAutoSelectedRef.current = true;
    } else if (userTickets.length > 0) {
      setSelectedTicket(userTickets[0]);
      hasAutoSelectedRef.current = true;
    }
  }, [tickets, user, isAdmin, selectedTicket, isMounted]);

  // Load admin chat messages
  useEffect(() => {
    if (!db || !user || !selectedAdmin || !isMounted) return;
    const chatId = [user.uid, selectedAdmin.uid].sort().join("_");
    const q = query(
      collection(db, "admin_chats", chatId, "messages"),
      orderBy("timestamp", "asc")
    );
    const unsub = onSnapshot(q, async (snapshot: any) => {
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
      setAdminChatMessages(msgList);
    });
    return () => unsub();
  }, [db, user, selectedAdmin, isMounted]);

  const generateTicketId = useCallback((createdAt: any): string => {
    if (!createdAt) return "#TICKET-0000";
    const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `#TICKET-${year}${month}${day}${hours}${minutes}`;
  }, []);

  const formatTime = useCallback((timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  }, []);

  const getTypingText = (ticket: Ticket | null) => {
    if (!ticket || !ticket.typing) return null;
    const name = ticket.typingUserName || "Someone";
    return `${name} is typing...`;
  };

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await updateDoc(doc(db, "users", user.uid), {
        online: false,
        lastSeen: serverTimestamp(),
        typing: false,
      });
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const filterTicketsBySearch = useCallback(
    (list: Ticket[]) => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return list;
      return list.filter((ticket) => {
        if (ticket.userName?.toLowerCase().includes(q)) return true;
        if (ticket.userEmail?.toLowerCase().includes(q)) return true;
        if (ticket.topic?.toLowerCase().includes(q)) return true;
        if (generateTicketId(ticket.createdAt).toLowerCase().includes(q)) return true;
        const previews = ticketPreviews[ticket.id] || [];
        for (const p of previews) {
          if (p.text?.toLowerCase().includes(q)) return true;
        }
        return false;
      });
    },
    [searchQuery, ticketPreviews, generateTicketId]
  );

  const handleTyping = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessageText(value);
    if (!selectedTicket || !user || !db || isBanned) return;
    const ticketRef = doc(db, "livechat_tickets", selectedTicket.id);
    if (value.length > 0) {
      await updateDoc(ticketRef, {
        typing: true,
        typingUserId: user.uid,
        typingUserName: user.displayName || user.email || "User",
      });
    } else {
      await updateDoc(ticketRef, {
        typing: false,
        typingUserId: null,
        typingUserName: null,
      });
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(async () => {
      await updateDoc(ticketRef, {
        typing: false,
        typingUserId: null,
        typingUserName: null,
      });
    }, 2000);
  };

  const checkBanBeforeAction = async (): Promise<boolean> => {
    if (!user) return true;
    try {
      const status = await checkBanStatus(user.uid);
      if (status.isBanned) {
        setIsBanned(true);
        setBanReason(status.reason);
        setCanCreateTicket(status.canCreateTicket);
        setCanSendMessage(status.canSendMessage);
        setBanMessage(`YOUR ACCOUNT HAS BEEN PERMANENTLY BANNED\n\nReason: ${status.reason}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error checking ban before action:", error);
      return false;
    }
  };

  const startChat = async () => {
    if (!db || !user || !selectedTopic) return;
    const isBannedNow = await checkBanBeforeAction();
    if (isBannedNow) {
      setShowStartChat(false);
      return;
    }
    if (!canCreateTicket) {
      setBanMessage("YOU DO NOT HAVE PERMISSION TO CREATE A NEW TICKET");
      return;
    }
    if (!encryptionReady) {
      alert("Encryption is being initialized, please wait a moment.");
      return;
    }
    const hasActiveTicket = tickets.some(
      (t) => t.userId === user.uid && (t.status === "waiting" || t.status === "active") && !t.isAnnouncement && !t.isBroadcast
    );
    if (hasActiveTicket) {
      alert("You still have an active chat with an agent. Please wait until it is finished.");
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
        isAnnouncement: false,
        isBroadcast: false,
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
        isBotDetected: false,
        deliveryStatus: "sent",
      });
      await updateDoc(ticketRef, {
        lastMessage: initialMessage,
        lastMessageTime: serverTimestamp(),
        lastMessageSender: user.displayName || user.email || "User",
      });
      setSelectedTopic("");
      setShowStartChat(false);
      setBanMessage(null);
      hasAutoSelectedRef.current = false;
    } catch (error) {
      console.error("Error starting chat:", error);
      alert("An error occurred while starting the chat. Please try again.");
    }
  };

  const sendMessage = async () => {
    if (!db || !selectedTicket || !messageText.trim() || !user) return;
    const isBannedNow = await checkBanBeforeAction();
    if (isBannedNow) {
      setMessageText("");
      return;
    }
    if (!canSendMessage) {
      setBanMessage("YOU DO NOT HAVE PERMISSION TO SEND MESSAGES");
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
      setBanMessage(`YOUR ACCOUNT HAS BEEN PERMANENTLY BANNED\n\nReason: ${checkResult.reason}\n\nMessage sent: "${messageText}"`);
      setMessageText("");
      return;
    }
    if (!encryptionReady) {
      alert("Encryption is being initialized, please wait a moment.");
      return;
    }
    if (selectedTicket.status === "resolved" || selectedTicket.status === "closed") {
      alert("This chat is finished. Please create a new ticket.");
      return;
    }
    try {
      const ticketRef = doc(db, "livechat_tickets", selectedTicket.id);
      await updateDoc(ticketRef, { typing: false, typingUserId: null, typingUserName: null });
      const senderName = isAdmin ? AGENT_NAME : user.displayName || user.email || "User";
      const encryptedMessage = await encryptMessage(messageText.trim());
      await addDoc(collection(db, "livechat_tickets", selectedTicket.id, "messages"), {
        senderId: user.uid,
        senderName: senderName,
        text: encryptedMessage,
        timestamp: serverTimestamp(),
        read: false,
        isEncrypted: true,
        isBotDetected: false,
        deliveryStatus: "sent",
        replyTo: replyTo
          ? {
              messageId: replyTo.id,
              senderName: replyTo.senderName,
              text: replyTo.text.length > 50 ? replyTo.text.substring(0, 50) + "..." : replyTo.text,
            }
          : null,
      });
      await updateDoc(ticketRef, {
        lastMessage: messageText.trim(),
        lastMessageTime: serverTimestamp(),
        lastMessageSender: senderName,
        ...(selectedTicket.status === "waiting" && { status: "active" }),
        agentId: isAdmin ? user.uid : selectedTicket.agentId,
        agentName: isAdmin ? AGENT_NAME : selectedTicket.agentName,
      });
      setMessageText("");
      setBanMessage(null);
      setReplyTo(null);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("An error occurred while sending the message. Please try again.");
    }
  };

  const sendAdminChatMessage = async () => {
    if (!db || !selectedAdmin || !adminChatText.trim() || !user) return;
    try {
      const chatId = [user.uid, selectedAdmin.uid].sort().join("_");
      const chatRef = doc(db, "admin_chats", chatId);
      const chatSnap = await getDoc(chatRef);
      if (!chatSnap.exists()) {
        await setDoc(chatRef, {
          participants: [user.uid, selectedAdmin.uid],
          createdAt: serverTimestamp(),
        });
      }
      const encryptedMessage = await encryptMessage(adminChatText.trim());
      await addDoc(collection(db, "admin_chats", chatId, "messages"), {
        senderId: user.uid,
        senderName: user.displayName || user.email || "User",
        text: encryptedMessage,
        timestamp: serverTimestamp(),
        read: false,
        isEncrypted: true,
        deliveryStatus: "sent",
        replyTo: adminChatReplyTo
          ? {
              messageId: adminChatReplyTo.id,
              senderName: adminChatReplyTo.senderName,
              text: adminChatReplyTo.text.length > 50 ? adminChatReplyTo.text.substring(0, 50) + "..." : adminChatReplyTo.text,
            }
          : null,
      });
      setAdminChatText("");
      setAdminChatReplyTo(null);
    } catch (error) {
      console.error("Error sending admin chat message:", error);
    }
  };

  const takeTicket = async (ticketId: string) => {
    if (!db || !isAdmin || !user) return;
    try {
      await updateDoc(doc(db, "livechat_tickets", ticketId), {
        agentId: user.uid,
        agentName: AGENT_NAME,
        status: "active",
      });
    } catch (error) {
      console.error("Error taking ticket:", error);
    }
  };

  const resolveTicket = async (ticketId: string) => {
    if (!db || !isAdmin) return;
    try {
      await updateDoc(doc(db, "livechat_tickets", ticketId), { status: "resolved" });
    } catch (error) {
      console.error("Error resolving ticket:", error);
    }
  };

  const handleCloseRoom = async () => {
    if (!db || !selectedTicket) return;
    try {
      await updateDoc(doc(db, "livechat_tickets", selectedTicket.id), { status: "closed" });
      setShowCloseConfirm(true);
      setTimeout(() => setShowCloseConfirm(false), 2200);
    } catch (error) {
      console.error("Error closing ticket:", error);
    }
  };

  const createAppealTicket = async () => {
    if (!db || !user || !isBanned) return;
    try {
      const existingAppeal = appealTickets.find((t) => t.userId === user.uid && t.status !== "closed" && t.status !== "resolved");
      if (existingAppeal) {
        setSelectedAppealTicket(existingAppeal);
        setShowAppealChat(true);
        return;
      }
      const ticketRef = await addDoc(collection(db, "appeal_tickets"), {
        userId: user.uid,
        userName: user.displayName || user.email || "User",
        userEmail: user.email,
        userPhoto: user.photoURL || "",
        status: "waiting",
        topic: "Banding Banned",
        banReason: banReason,
        banMessage: banMessage || "",
        createdAt: serverTimestamp(),
        unreadCount: 0,
        typing: false,
        typingUserId: null,
        typingUserName: null,
      });
      const initialMessage = `Saya mengajukan banding atas banned akun saya.\n\nAlasan banned: ${banReason}\n\nMohon ditinjau kembali. Terima kasih.`;
      const encryptedMessage = await encryptMessage(initialMessage);
      await addDoc(collection(db, "appeal_tickets", ticketRef.id, "messages"), {
        senderId: user.uid,
        senderName: user.displayName || user.email || "User",
        text: encryptedMessage,
        timestamp: serverTimestamp(),
        read: false,
        isEncrypted: true,
        deliveryStatus: "sent",
      });
      await updateDoc(ticketRef, {
        lastMessage: initialMessage,
        lastMessageTime: serverTimestamp(),
        lastMessageSender: user.displayName || user.email || "User",
      });
      const newTicket: AppealTicket = {
        id: ticketRef.id,
        userId: user.uid,
        userName: user.displayName || user.email || "User",
        userEmail: user.email,
        userPhoto: user.photoURL || "",
        status: "waiting",
        topic: "Banding Banned",
        banReason: banReason,
        banMessage: banMessage || "",
        createdAt: new Date(),
        unreadCount: 0,
        typing: false,
      };
      setSelectedAppealTicket(newTicket);
      setShowAppealChat(true);
      setHasAppeal(true);
    } catch (error) {
      console.error("Error creating appeal ticket:", error);
      alert("Gagal membuat tiket banding. Silakan coba lagi.");
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

  const renderOnlinePanel = () => {
    const list = isAdmin ? onlineUsers : onlineAgents;
    const title = isAdmin ? "Online Users" : "Online Agents";
    const emptyText = isAdmin ? "No users online" : "No agents online";
    return (
      <div
        data-tour="online-panel"
        className="online-panel-container"
        style={{
          width: "260px",
          backgroundColor: "#ffffff",
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
          <span>{title}</span>
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
            {list.length}
          </span>
        </div>
        <div style={{ overflowY: "auto", flex: 1, minHeight: 0 }}>
          {list.length === 0 ? (
            <div style={{ padding: "30px 16px", textAlign: "center", color: "#999", fontSize: "13px", fontFamily: FONT_FAMILY }}>
              {emptyText}
            </div>
          ) : (
            list.map((u) => (
              <div
                key={u.uid}
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid #f0f0f0",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontFamily: FONT_FAMILY,
                }}
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
                  {u.photoURL ? (
                    <img src={u.photoURL} alt={u.displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    (u.displayName || "U").charAt(0).toUpperCase()
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#000",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      marginBottom: "3px",
                    }}
                  >
                    {u.displayName}
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
    );
  };

  const renderTicketPreview = (ticketId: string) => {
    const previews = ticketPreviews[ticketId] || [];
    if (previews.length === 0) return null;
    const ordered = [...previews].reverse();
    return (
      <div style={{ marginTop: "6px", display: "flex", flexDirection: "column", gap: "3px" }}>
        {ordered.map((p, i) => {
          const safeText = typeof p.text === "string" ? p.text : "";
          return (
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
              <span style={{ fontWeight: 700, color: "#ffffff", flexShrink: 0 }}>{p.senderName}:</span>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", color: "#ffffff" }}>
                {safeText.length > 30 ? safeText.substring(0, 30) + "..." : safeText}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderSearchBar = () => {
    const isAgentSearch = isAdmin;
    return (
      <div
        data-tour="search-bar"
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
            backgroundColor: isAgentSearch ? "rgba(255,255,255,0.15)" : "#ffffff",
            border: isAgentSearch ? "1px solid rgba(255,255,255,0.25)" : "1px solid #ffffff",
            borderRadius: "8px",
          }}
        >
          <SearchIcon size={14} color={isAgentSearch ? "#ffffff" : BLUE} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats or messages..."
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: isAgentSearch ? "#ffffff" : BLUE,
              fontSize: "12px",
              fontFamily: FONT_FAMILY,
              padding: 0,
              caretColor: isAgentSearch ? "#ffffff" : BLUE,
              fontWeight: 600,
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={{
                background: "transparent",
                border: "none",
                color: isAgentSearch ? "#ffffff" : BLUE,
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
    );
  };

  const renderAnnouncementBroadcastSection = () => {
    if (!isAdmin) return null;
    const announcementTickets = tickets.filter((t) => t.isAnnouncement && !t.isBroadcast);
    const broadcastTickets = tickets.filter((t) => t.isBroadcast);
    if (announcementTickets.length === 0 && broadcastTickets.length === 0) return null;
    return (
      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {announcementTickets.length > 0 && (
            <div
              style={{
                flex: "1 1 300px",
                backgroundColor: BLUE,
                borderRadius: "12px",
                padding: "16px 20px",
                color: WHITE,
                fontFamily: FONT_FAMILY,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
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
                  {announcementTickets.length} ACTIVE
                </div>
              </div>
              {announcementTickets.slice(0, 3).map((t) => (
                <div key={t.id} onClick={() => setSelectedTicket(t)} style={{ padding: "8px 0", borderTop: "1px solid rgba(255,255,255,0.15)", cursor: "pointer" }}>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: WHITE, marginBottom: "3px" }}>{t.userName}</div>
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.85)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {t.topic}
                  </div>
                </div>
              ))}
            </div>
          )}
          {broadcastTickets.length > 0 && (
            <div
              style={{
                flex: "1 1 300px",
                backgroundColor: BLUE,
                borderRadius: "12px",
                padding: "16px 20px",
                color: WHITE,
                fontFamily: FONT_FAMILY,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
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
                  {broadcastTickets.length} ACTIVE
                </div>
              </div>
              {broadcastTickets.slice(0, 3).map((t) => (
                <div key={t.id} onClick={() => setSelectedTicket(t)} style={{ padding: "8px 0", borderTop: "1px solid rgba(255,255,255,0.15)", cursor: "pointer" }}>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: WHITE, marginBottom: "3px" }}>{t.userName}</div>
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.85)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {t.topic}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (checkingBan) {
    return (
      <div style={{ marginTop: "80px", paddingTop: "30px" }}>
        <h3 style={{ fontSize: "80px", fontWeight: 700, color: BLUE, fontFamily: FONT_FAMILY, letterSpacing: "-0.03em", margin: 0, lineHeight: 1.1 }}>
          Live Chat Agent
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
      <>
        <OnboardingTour steps={tourSteps} onComplete={completeTour} isActive={showTour} currentStep={tourStep} setCurrentStep={setTourStep} />
        <div style={{ marginTop: "80px", paddingTop: "30px" }}>
          <h3
            ref={liveChatTitleRef}
            data-tour="livechat-title"
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
            Live Chat Agent
          </h3>
          <p style={{ fontSize: "15px", color: "#666", fontFamily: FONT_FAMILY, marginBottom: "10px" }}>
            Please login to use Live Chat Agent
          </p>
          <Link href="/" style={{ textDecoration: "none" }}>
            <button
              data-tour="login-button"
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
          <div style={{ marginTop: "16px" }}>
            <button
              onClick={restartTour}
              style={{
                background: "transparent",
                border: "none",
                color: BLUE,
                fontSize: "13px",
                fontFamily: FONT_FAMILY,
                cursor: "pointer",
                textDecoration: "underline",
                padding: 0,
              }}
            >
              Restart Tour
            </button>
          </div>
        </div>
      </>
    );
  }

  // ===== BANNED USER VIEW (USER & AGENT SAMA) =====
  // Jika user atau agent terkena banned, tampilkan banner banned + appeal chat
  // di posisi yang sama seperti user biasa (di bawah Live Chat Agent title).
  if (!isAdmin && isBanned) {
    return (
      <div style={{ marginTop: "80px", paddingTop: "30px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
          <h3 style={{ fontSize: "80px", fontWeight: 700, color: BLUE, fontFamily: FONT_FAMILY, letterSpacing: "-0.03em", margin: 0, lineHeight: 1.1 }}>
            Live Chat Agent
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
            <NorthEastArrow size={20} color={BLUE} />
          </button>
        </div>

        {/* Banned Info Banner in Body */}
        <BannedInfoBanner
          banReason={banReason}
          banMessage={banMessage || ""}
          onAppeal={createAppealTicket}
          hasAppeal={hasAppeal}
        />

        {/* Appeal Chat Room - SAME DESIGN FOR USER & AGENT */}
        {showAppealChat && selectedAppealTicket && (
          <div style={{ marginTop: "20px", height: "500px" }}>
            <AppealChatRoom
              user={user}
              isAdmin={false}
              db={db}
              appealTicket={selectedAppealTicket}
              onClose={() => setShowAppealChat(false)}
            />
          </div>
        )}

        {!showAppealChat && appealTickets.length > 0 && (
          <div style={{ marginTop: "20px" }}>
            <div style={{ fontSize: "16px", fontWeight: 700, color: BLUE, fontFamily: FONT_FAMILY, marginBottom: "12px" }}>
              Tiket Banding Anda
            </div>
            {appealTickets.map((t) => (
              <div
                key={t.id}
                onClick={() => {
                  setSelectedAppealTicket(t);
                  setShowAppealChat(true);
                }}
                style={{
                  padding: "14px 16px",
                  backgroundColor: BLUE,
                  borderRadius: "10px",
                  marginBottom: "8px",
                  cursor: "pointer",
                  fontFamily: FONT_FAMILY,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: WHITE }}>
                    Banding #{t.id.slice(-6)}
                  </span>
                  <StabiloBadge
                    label={t.status === "waiting" ? "Waiting" : t.status === "active" ? "Active" : "Closed"}
                    bg={WHITE}
                    text={BLUE}
                    border={WHITE}
                    size="sm"
                  />
                </div>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)", marginTop: "4px" }}>
                  {t.lastMessage || "Belum ada pesan"}
                </div>
              </div>
            ))}
          </div>
        )}

        {!showAppealChat && appealTickets.length === 0 && (
          <div style={{ marginTop: "20px", padding: "30px", textAlign: "center", color: "#999", fontFamily: FONT_FAMILY }}>
            Klik tombol "Ajukan Banding" di atas untuk memulai proses banding.
          </div>
        )}
      </div>
    );
  }

  const userTickets = tickets.filter((t) => t.userId === user.uid);

  if (!isAdmin && userTickets.length === 0 && !showStartChat) {
    return (
      <>
        <OnboardingTour steps={tourSteps} onComplete={completeTour} isActive={showTour} currentStep={tourStep} setCurrentStep={setTourStep} />
        <div style={{ marginTop: "80px", paddingTop: "30px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
            <h3
              ref={liveChatTitleRef}
              data-tour="livechat-title"
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
              Live Chat Agent
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
              <NorthEastArrow size={20} color={BLUE} />
            </button>
          </div>

          {/* Chat with Admin section */}
          {onlineAdmins.length > 0 && (
            <div style={{ marginBottom: "24px" }}>
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: BLUE,
                  fontFamily: FONT_FAMILY,
                  marginBottom: "12px",
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}
              >
                Chat with Admin ({onlineAdmins.length} Online)
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {onlineAdmins.map((a) => (
                  <button
                    key={a.uid}
                    onClick={() => {
                      setSelectedAdmin(a);
                      setShowAdminChat(true);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 16px",
                      backgroundColor: BLUE,
                      border: `1.5px solid ${BLUE}`,
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontFamily: FONT_FAMILY,
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
                      {a.photoURL ? (
                        <img src={a.photoURL} alt={a.displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <span style={{ fontSize: "14px", fontWeight: 800, color: BLUE }}>
                          {a.displayName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: WHITE }}>{a.displayName}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginBottom: "20px" }} data-tour="online-panel">
            <div
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: BLUE,
                fontFamily: FONT_FAMILY,
                marginBottom: "12px",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
              }}
            >
              {onlineAgents.length} Agent{onlineAgents.length !== 1 ? "s" : ""} Online
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {onlineAgents.map((a) => (
                <div
                  key={a.uid}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "8px 14px",
                    backgroundColor: BLUE,
                    border: `1.5px solid ${BLUE}`,
                    borderRadius: "8px",
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  <span style={{ fontSize: "13px", fontWeight: 700, color: WHITE }}>{a.displayName}</span>
                  <span style={{ fontSize: "10px", fontWeight: 800, color: WHITE, letterSpacing: "0.5px" }}>ONLINE</span>
                </div>
              ))}
              {onlineAgents.length === 0 && (
                <span style={{ fontSize: "13px", color: "#999", fontFamily: FONT_FAMILY }}>No agents online</span>
              )}
            </div>
          </div>

          <p style={{ fontSize: "15px", color: "#666", fontFamily: FONT_FAMILY, marginBottom: "16px" }}>
            Need help? Chat directly with our agent.
          </p>
          <button
            data-tour="start-chat-button"
            onClick={() => setShowStartChat(true)}
            style={{
              padding: "10px 24px",
              backgroundColor: BLUE,
              color: WHITE,
              border: "none",
              borderRadius: "8px",
              fontSize: "15px",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: FONT_FAMILY,
            }}
          >
            Start Live Chat
          </button>
          <div style={{ marginTop: "16px" }}>
            <button
              onClick={restartTour}
              style={{
                background: "transparent",
                border: "none",
                color: BLUE,
                fontSize: "13px",
                fontFamily: FONT_FAMILY,
                cursor: "pointer",
                textDecoration: "underline",
                padding: 0,
              }}
            >
              Restart Tour
            </button>
          </div>
        </div>

        {/* Admin Chat Modal */}
        {showAdminChat && selectedAdmin && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0,0,0,0.5)",
              zIndex: 10001,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "600px",
                height: "600px",
                backgroundColor: WHITE,
                borderRadius: "16px",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
              }}
            >
              <div
                style={{
                  padding: "16px 20px",
                  backgroundColor: BLUE,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "16px", fontWeight: 700, color: WHITE, fontFamily: FONT_FAMILY }}>
                  Chat with {selectedAdmin.displayName}
                </span>
                <button
                  onClick={() => {
                    setShowAdminChat(false);
                    setSelectedAdmin(null);
                    setAdminChatMessages([]);
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: WHITE,
                    fontSize: "20px",
                    cursor: "pointer",
                    fontFamily: FONT_FAMILY,
                    padding: 0,
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </div>
              <div
                className="chat-messages-container"
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  backgroundColor: "#fafafa",
                }}
              >
                {adminChatMessages.length === 0 ? (
                  <div style={{ textAlign: "center", color: "#999", fontSize: "14px", fontFamily: FONT_FAMILY, padding: "30px 0" }}>
                    Mulai percakapan dengan admin
                  </div>
                ) : (
                  adminChatMessages.map((msg, idx) => {
                    const isMine = msg.senderId === user?.uid;
                    return (
                      <div key={msg.id || idx} style={{ alignSelf: isMine ? "flex-end" : "flex-start", maxWidth: "75%" }}>
                        <div
                          style={{
                            padding: "10px 14px",
                            borderRadius: "12px",
                            backgroundColor: isMine ? BLUE : WHITE,
                            color: isMine ? WHITE : BLACK,
                            fontSize: "14px",
                            fontFamily: FONT_FAMILY,
                            border: isMine ? "none" : "1px solid rgba(0,0,0,0.08)",
                            wordBreak: "break-word",
                          }}
                        >
                          {!isMine && (
                            <div style={{ fontSize: "11px", fontWeight: 700, color: BLUE, marginBottom: "3px" }}>
                              {msg.senderName}
                            </div>
                          )}
                          {msg.text}
                          <div style={{ display: "flex", justifyContent: "flex-end", gap: "4px", marginTop: "4px" }}>
                            <span style={{ fontSize: "9px", color: isMine ? "rgba(255,255,255,0.7)" : "#999" }}>
                              {formatTime(msg.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div
                style={{
                  padding: "12px 16px",
                  borderTop: "1px solid rgba(0,0,0,0.08)",
                  display: "flex",
                  gap: "10px",
                  backgroundColor: WHITE,
                }}
              >
                <input
                  type="text"
                  value={adminChatText}
                  onChange={(e) => setAdminChatText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && adminChatText.trim()) {
                      e.preventDefault();
                      sendAdminChatMessage();
                    }
                  }}
                  placeholder="Tulis pesan..."
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    border: `1px solid ${BLUE}40`,
                    borderRadius: "10px",
                    fontSize: "14px",
                    outline: "none",
                    fontFamily: FONT_FAMILY,
                  }}
                />
                <button
                  onClick={sendAdminChatMessage}
                  disabled={!adminChatText.trim()}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: adminChatText.trim() ? BLUE : "#ccc",
                    color: WHITE,
                    border: "none",
                    borderRadius: "10px",
                    cursor: adminChatText.trim() ? "pointer" : "not-allowed",
                    fontFamily: FONT_FAMILY,
                    fontSize: "13px",
                    fontWeight: 700,
                  }}
                >
                  Kirim
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  if (!isAdmin && showStartChat) {
    return (
      <div style={{ marginTop: "80px", paddingTop: "30px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
          <h3 style={{ fontSize: "80px", fontWeight: 700, color: BLUE, fontFamily: FONT_FAMILY, letterSpacing: "-0.03em", margin: 0, lineHeight: 1.1 }}>
            Live Chat Agent
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
            <NorthEastArrow size={20} color={BLUE} />
          </button>
        </div>
        <div style={{ maxWidth: "400px" }}>
          <div style={{ fontSize: "15px", marginBottom: "10px", fontFamily: FONT_FAMILY, fontWeight: 700, color: BLUE }}>Select your issue topic:</div>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px",
              border: `2px solid ${BLUE}`,
              borderRadius: "8px",
              fontSize: "15px",
              fontFamily: FONT_FAMILY,
              outline: "none",
              backgroundColor: WHITE,
              marginBottom: "14px",
              color: BLUE,
              fontWeight: 600,
            }}
          >
            <option value="">-- Select topic --</option>
            {topics.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={startChat}
              disabled={!selectedTopic}
              style={{
                padding: "8px 20px",
                backgroundColor: selectedTopic ? BLUE : "#ccc",
                color: WHITE,
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: selectedTopic ? "pointer" : "not-allowed",
                fontFamily: FONT_FAMILY,
              }}
            >
              Start Chat
            </button>
            <button
              onClick={() => setShowStartChat(false)}
              style={{
                padding: "8px 20px",
                backgroundColor: "transparent",
                color: "#666",
                border: "1px solid #ccc",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: FONT_FAMILY,
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  const waitingTicketsRaw = tickets.filter((t) => t.status === "waiting");
  const activeTicketsRaw = tickets.filter((t) => t.status === "active");
  const resolvedTicketsRaw = tickets.filter((t) => t.status === "resolved" || t.status === "closed");
  const waitingTickets = filterTicketsBySearch(waitingTicketsRaw);
  const activeTickets = filterTicketsBySearch(activeTicketsRaw);
  const resolvedTickets = filterTicketsBySearch(resolvedTicketsRaw);
  const typingText = selectedTicket ? getTypingText(selectedTicket) : null;

  // Admin: filter banned users in waiting
  const bannedUsersInWaiting = waitingTickets.filter((t) => t.isBanned);

  const renderChatListItem = (ticket: Ticket, options?: { onExtraClick?: () => void }) => {
    const isActive = selectedTicket?.id === ticket.id;
    const ticketId = generateTicketId(ticket.createdAt);
    const statusStyle = STATUS_STYLES[ticket.status] || STATUS_STYLES.active;
    const topicStyle = TOPIC_STYLES[ticket.topic] || TOPIC_STYLES["Other"];

    return (
      <div
        key={ticket.id}
        onClick={() => {
          setSelectedTicket(ticket);
          if (options?.onExtraClick) options.onExtraClick();
        }}
        style={{
          padding: "14px 16px",
          borderLeft: isActive ? `3px solid ${WHITE}` : "3px solid transparent",
          backgroundColor: isActive ? "rgba(255,255,255,0.14)" : "transparent",
          cursor: "pointer",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          transition: "background-color 0.2s ease",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px", gap: "8px", flexWrap: "wrap" }}>
          <div style={{ fontWeight: 700, fontSize: "14px", color: WHITE, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: "1 1 auto" }}>
            {ticket.userName}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
            {ticket.isBanned && (
              <StabiloBadge
                label="BANNED"
                bg={WHITE}
                text={BLUE}
                border={WHITE}
                size="sm"
              />
            )}
            <StabiloBadge
              label={statusStyle.label}
              bg={statusStyle.bg}
              text={statusStyle.text}
              border={statusStyle.border}
              size="sm"
            />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px", flexWrap: "wrap" }}>
          <StabiloBadge
            label={ticket.topic}
            bg={topicStyle.bg}
            text={topicStyle.text}
            border={topicStyle.border}
            size="sm"
          />
          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.75)", fontWeight: 700 }}>
            {ticketMsgCounts[ticket.id] || 0} msgs
          </span>
        </div>
        {renderTicketPreview(ticket.id)}
        <div style={{ marginTop: "6px" }}>
          <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.65)", fontWeight: 700, letterSpacing: "0.3px" }}>{ticketId}</span>
        </div>
      </div>
    );
  };

  return (
    <>
      <OnboardingTour steps={tourSteps} onComplete={completeTour} isActive={showTour} currentStep={tourStep} setCurrentStep={setTourStep} />

      <div style={{ marginTop: "80px", paddingTop: "30px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
          <h3
            ref={liveChatTitleRef}
            data-tour="livechat-title"
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
            Live Chat Agent
          </h3>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px", paddingTop: "10px" }}>
            <span
              style={{
                fontSize: "13px",
                fontWeight: 800,
                color: onlineAgents.length > 0 ? WHITE : "#999",
                backgroundColor: onlineAgents.length > 0 ? BLUE : "transparent",
                fontFamily: FONT_FAMILY,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                padding: onlineAgents.length > 0 ? "4px 10px" : "0",
                borderRadius: "4px",
              }}
            >
              {onlineAgents.length > 0
                ? `${onlineAgents.length} Agent${onlineAgents.length !== 1 ? "s" : ""} Online`
                : "No Agents Online"}
            </span>
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
              <NorthEastArrow size={20} color={BLUE} />
            </button>
            {!isAdmin && (
              <button
                onClick={restartTour}
                style={{
                  background: "transparent",
                  border: "none",
                  color: BLUE,
                  fontSize: "12px",
                  fontFamily: FONT_FAMILY,
                  cursor: "pointer",
                  textDecoration: "underline",
                  padding: 0,
                }}
              >
                Restart Tour
              </button>
            )}
          </div>
        </div>

        {renderAnnouncementBroadcastSection()}

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
          {renderOnlinePanel()}

          <div
            data-tour="chat-list"
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
            }}
          >
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
                {isAdmin ? tickets.length : tickets.filter((t) => t.userId === user.uid).length}
              </span>
            </div>

            {renderSearchBar()}

            <div style={{ overflowY: "auto", flex: 1, minHeight: 0 }}>
              {isAdmin ? (
                <>
                  {bannedUsersInWaiting.length > 0 && (
                    <div>
                      <div
                        style={{
                          padding: "10px 16px",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          borderBottom: "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        <StabiloBadge
                          label={`Banned (${bannedUsersInWaiting.length})`}
                          bg={WHITE}
                          text={BLUE}
                          border={WHITE}
                          size="md"
                        />
                      </div>
                      {bannedUsersInWaiting.map((ticket) => renderChatListItem(ticket))}
                    </div>
                  )}
                  {waitingTickets.length > 0 && (
                    <div>
                      <div
                        style={{
                          padding: "10px 16px",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          borderBottom: "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        <StabiloBadge
                          label={`Waiting (${waitingTickets.length})`}
                          bg={STATUS_STYLES.waiting.bg}
                          text={STATUS_STYLES.waiting.text}
                          border={STATUS_STYLES.waiting.border}
                          size="md"
                        />
                      </div>
                      {waitingTickets.map((ticket) =>
                        renderChatListItem(ticket, { onExtraClick: () => takeTicket(ticket.id) })
                      )}
                    </div>
                  )}
                  {activeTickets.length > 0 && (
                    <div>
                      <div
                        style={{
                          padding: "10px 16px",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          borderBottom: "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        <StabiloBadge
                          label={`Active (${activeTickets.length})`}
                          bg={STATUS_STYLES.active.bg}
                          text={STATUS_STYLES.active.text}
                          border={STATUS_STYLES.active.border}
                          size="md"
                        />
                      </div>
                      {activeTickets.map((ticket) => renderChatListItem(ticket))}
                    </div>
                  )}
                  {resolvedTickets.length > 0 && (
                    <div>
                      <div
                        style={{
                          padding: "10px 16px",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          borderBottom: "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        <StabiloBadge
                          label={`Resolved (${resolvedTickets.length})`}
                          bg={STATUS_STYLES.resolved.bg}
                          text={STATUS_STYLES.resolved.text}
                          border={STATUS_STYLES.resolved.border}
                          size="md"
                        />
                      </div>
                      {resolvedTickets.map((ticket) => renderChatListItem(ticket))}
                    </div>
                  )}
                  {waitingTickets.length === 0 && activeTickets.length === 0 && resolvedTickets.length === 0 && bannedUsersInWaiting.length === 0 && (
                    <div style={{ padding: "30px 16px", textAlign: "center", color: WHITE, fontSize: "13px" }}>
                      {searchQuery ? "No results found" : "No incoming chats"}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {filterTicketsBySearch(tickets.filter((t) => t.userId === user.uid)).map((ticket) =>
                    renderChatListItem(ticket)
                  )}
                  {filterTicketsBySearch(tickets.filter((t) => t.userId === user.uid)).length === 0 && (
                    <div style={{ padding: "30px 16px", textAlign: "center", color: WHITE, fontSize: "13px" }}>
                      {searchQuery ? "No results found" : "No chats yet"}
                    </div>
                  )}
                </>
              )}

              {/* Appeal Tickets for Admin */}
              {isAdmin && appealTickets.length > 0 && (
                <div style={{ marginTop: "20px" }}>
                  <div
                    style={{
                      padding: "10px 16px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      borderBottom: "1px solid rgba(255,255,255,0.1)",
                      borderTop: "1px solid rgba(255,255,255,0.15)",
                    }}
                  >
                    <StabiloBadge
                      label={`Banding (${appealTickets.length})`}
                      bg={WHITE}
                      text={BLUE}
                      border={WHITE}
                      size="md"
                    />
                  </div>
                  {appealTickets.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => {
                        setSelectedAppealTicket(t);
                        setShowAppealChat(true);
                      }}
                      style={{
                        padding: "14px 16px",
                        borderBottom: "1px solid rgba(255,255,255,0.08)",
                        cursor: "pointer",
                        backgroundColor: selectedAppealTicket?.id === t.id ? "rgba(255,255,255,0.14)" : "transparent",
                        borderLeft: selectedAppealTicket?.id === t.id ? `3px solid ${WHITE}` : "3px solid transparent",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <span style={{ fontSize: "14px", fontWeight: 700, color: WHITE }}>
                          {t.userName}
                        </span>
                        <StabiloBadge
                          label={t.status === "waiting" ? "Waiting" : t.status === "active" ? "Active" : "Closed"}
                          bg={t.status === "waiting" ? STATUS_STYLES.waiting.bg : t.status === "active" ? STATUS_STYLES.active.bg : STATUS_STYLES.resolved.bg}
                          text={t.status === "waiting" ? STATUS_STYLES.waiting.text : t.status === "active" ? STATUS_STYLES.active.text : STATUS_STYLES.resolved.text}
                          border={t.status === "waiting" ? STATUS_STYLES.waiting.border : t.status === "active" ? STATUS_STYLES.active.border : STATUS_STYLES.resolved.border}
                          size="sm"
                        />
                      </div>
                      <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.75)", fontFamily: FONT_FAMILY }}>
                        {t.banReason || "Banding Banned"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {!isAdmin && (
              <div
                style={{
                  padding: "10px 16px",
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                  flexShrink: 0,
                  backgroundColor: BLUE,
                }}
              >
                <button
                  data-tour="start-chat-button"
                  onClick={() => setShowStartChat(true)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    backgroundColor: WHITE,
                    color: BLUE,
                    border: `1.5px solid ${WHITE}`,
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 800,
                    cursor: "pointer",
                    fontFamily: FONT_FAMILY,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                  }}
                >
                  + New Chat
                </button>
              </div>
            )}
          </div>

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
            {/* If Appeal Chat is selected for admin, show appeal chat */}
            {isAdmin && showAppealChat && selectedAppealTicket ? (
              <AppealChatRoom
                user={user}
                isAdmin={isAdmin}
                db={db}
                appealTicket={selectedAppealTicket}
                onClose={() => {
                  setShowAppealChat(false);
                  setSelectedAppealTicket(null);
                }}
              />
            ) : selectedTicket ? (
              <>
                <div
                  style={{
                    padding: "16px 20px",
                    backgroundColor: BLUE,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexShrink: 0,
                    gap: "12px",
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "17px", color: WHITE, fontFamily: FONT_FAMILY, marginBottom: "6px" }}>
                      {selectedTicket.userName}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <StabiloBadge
                        label={(STATUS_STYLES[selectedTicket.status] || STATUS_STYLES.active).label}
                        bg={(STATUS_STYLES[selectedTicket.status] || STATUS_STYLES.active).bg}
                        text={(STATUS_STYLES[selectedTicket.status] || STATUS_STYLES.active).text}
                        border={(STATUS_STYLES[selectedTicket.status] || STATUS_STYLES.active).border}
                        size="sm"
                      />
                      <StabiloBadge
                        label={selectedTicket.topic}
                        bg={(TOPIC_STYLES[selectedTicket.topic] || TOPIC_STYLES["Other"]).bg}
                        text={(TOPIC_STYLES[selectedTicket.topic] || TOPIC_STYLES["Other"]).text}
                        border={(TOPIC_STYLES[selectedTicket.topic] || TOPIC_STYLES["Other"]).border}
                        size="sm"
                      />
                      {selectedTicket.isBanned && (
                        <StabiloBadge
                          label="BANNED"
                          bg={WHITE}
                          text={BLUE}
                          border={WHITE}
                          size="sm"
                        />
                      )}
                      {selectedTicket.typing && selectedTicket.status !== "resolved" && (
                        <span style={{ fontSize: "12px", color: WHITE, fontStyle: "italic", fontWeight: 700 }}>
                          {selectedTicket.typingUserName} is typing...
                        </span>
                      )}
                      <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.75)", fontWeight: 700, letterSpacing: "0.3px" }}>
                        {generateTicketId(selectedTicket.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                    {isAdmin && selectedTicket.status !== "resolved" && selectedTicket.status !== "closed" && (
                      <button
                        onClick={() => resolveTicket(selectedTicket.id)}
                        style={{
                          padding: "8px 16px",
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
                      >
                        Resolve
                      </button>
                    )}
                    {selectedTicket.status !== "closed" && (
                      <CloseRoomButton onConfirm={handleCloseRoom} />
                    )}
                  </div>
                </div>

                {showCloseConfirm && (
                  <div
                    style={{
                      padding: "10px 20px",
                      backgroundColor: WHITE,
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
                        border: `1.5px solid ${BLUE}`,
                        backgroundColor: WHITE,
                        color: BLUE,
                        fontSize: "10px",
                        fontWeight: 800,
                        letterSpacing: "0.5px",
                        borderRadius: "4px",
                        textTransform: "uppercase",
                      }}
                    >
                      Peringatan
                    </span>
                    <span style={{ fontSize: "13px", color: BLUE, fontWeight: 600 }}>
                      Room chat berhasil ditutup. Buat room baru untuk melanjutkan.
                    </span>
                  </div>
                )}

                {/* Banned Info Banner in Body Chat - untuk user/agent yang di-ban saat di dalam room */}
                {!isAdmin && isBanned && (
                  <BannedInfoBanner
                    banReason={banReason}
                    banMessage={banMessage || ""}
                    onAppeal={createAppealTicket}
                    hasAppeal={hasAppeal}
                  />
                )}

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
                  {messages.length === 0 ? (
                    <div
                      style={{
                        textAlign: "center",
                        color: "#999",
                        fontSize: "15px",
                        padding: "30px 0",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      No messages yet
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isMine = msg.senderId === user.uid;
                      return (
                        <div key={msg.id || idx} style={{ alignSelf: isMine ? "flex-end" : "flex-start", maxWidth: "70%" }}>
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
                              <div style={{ fontSize: "12px", fontWeight: 700, color: BLUE, marginBottom: "5px" }}>
                                {msg.senderName}
                              </div>
                            )}
                            {msg.replyTo && (
                              <div
                                style={{
                                  padding: "6px 10px",
                                  backgroundColor: isMine ? "rgba(255,255,255,0.2)" : "rgba(13,60,252,0.1)",
                                  borderLeft: `3px solid ${isMine ? WHITE : BLUE}`,
                                  borderRadius: "4px",
                                  marginBottom: "6px",
                                  fontSize: "11px",
                                  color: isMine ? WHITE : BLUE,
                                  fontStyle: "italic",
                                  fontFamily: FONT_FAMILY,
                                }}
                              >
                                <strong>{msg.replyTo.senderName}:</strong> {msg.replyTo.text}
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
                              <span style={{ fontSize: "10px", color: isMine ? WHITE : "#999" }}>
                                {formatTime(msg.timestamp)}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => setReplyTo(msg)}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: BLUE,
                              fontSize: "10px",
                              cursor: "pointer",
                              fontFamily: FONT_FAMILY,
                              fontWeight: 700,
                              marginTop: "2px",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              alignSelf: isMine ? "flex-end" : "flex-start",
                            }}
                          >
                            <ReplyIcon size={10} color={BLUE} />
                            Reply
                          </button>
                        </div>
                      );
                    })
                  )}
                  {typingText && selectedTicket.status !== "resolved" && (
                    <div
                      style={{
                        alignSelf: "flex-start",
                        fontSize: "14px",
                        color: "#666",
                        fontStyle: "italic",
                        padding: "5px 10px",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      {typingText}
                    </div>
                  )}

                  {latestRollingMessage && (
                    <div
                      style={{
                        alignSelf: "flex-start",
                        maxWidth: "100%",
                        width: "100%",
                        borderTop: `1px dashed ${BLUE}40`,
                        paddingTop: "10px",
                        marginTop: "6px",
                        flexShrink: 0,
                      }}
                    >
                      <RollingNewMessage
                        key={rollingKey}
                        senderName={latestRollingMessage.senderName}
                        message={latestRollingMessage.text}
                        isFromAgent={latestRollingMessage.isFromAgent}
                      />
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {selectedTicket.status !== "resolved" && selectedTicket.status !== "closed" ? (
                  <>
                    {replyTo && (
                      <div
                        style={{
                          padding: "8px 24px",
                          backgroundColor: "rgba(13,60,252,0.06)",
                          borderTop: `1px solid ${BLUE}20`,
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          flexShrink: 0,
                        }}
                      >
                        <ReplyIcon size={14} color={BLUE} />
                        <div style={{ flex: 1, fontSize: "12px", color: BLUE, fontFamily: FONT_FAMILY, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          <strong>{replyTo.senderName}:</strong> {replyTo.text.length > 50 ? replyTo.text.substring(0, 50) + "..." : replyTo.text}
                        </div>
                        <button
                          onClick={() => setReplyTo(null)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: BLUE,
                            cursor: "pointer",
                            fontSize: "16px",
                            fontFamily: FONT_FAMILY,
                            padding: 0,
                            lineHeight: 1,
                          }}
                        >
                          ×
                        </button>
                      </div>
                    )}
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
                        onChange={handleTyping}
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && !e.shiftKey && messageText.trim()) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                        placeholder={
                          selectedTicket.status === "waiting" && !isAdmin ? "Waiting for agent..." : "Type a message..."
                        }
                        disabled={selectedTicket.status === "waiting" && !isAdmin}
                        style={{
                          flex: 1,
                          padding: "12px 16px",
                          border: "1px solid rgba(0,0,0,0.1)",
                          borderRadius: "10px",
                          fontSize: "15px",
                          outline: "none",
                          fontFamily: FONT_FAMILY,
                          backgroundColor: selectedTicket.status === "waiting" && !isAdmin ? "#f5f5f5" : WHITE,
                        }}
                      />
                      <button
                        onClick={sendMessage}
                        disabled={(selectedTicket.status === "waiting" && !isAdmin) || !messageText.trim()}
                        style={{
                          padding: "12px 24px",
                          backgroundColor:
                            (selectedTicket.status === "waiting" && !isAdmin) || !messageText.trim() ? "#ccc" : BLUE,
                          color: WHITE,
                          border: "none",
                          borderRadius: "10px",
                          cursor:
                            (selectedTicket.status === "waiting" && !isAdmin) || !messageText.trim() ? "not-allowed" : "pointer",
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
                      padding: "14px 24px",
                      borderTop: "1px solid rgba(0,0,0,0.06)",
                      backgroundColor: "#fafafa",
                      textAlign: "center",
                      fontFamily: FONT_FAMILY,
                      fontSize: "13px",
                      color: BLUE,
                      flexShrink: 0,
                      fontWeight: 700,
                    }}
                  >
                    Room ini telah {selectedTicket.status === "closed" ? "ditutup" : "diselesaikan"}. Buat room baru untuk melanjutkan.
                  </div>
                )}
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
                }}
              >
                Select a chat from the list on the left
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// ===== MAIN PAGE =====
export default function HomePage(): React.JSX.Element {
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
        <title>Menuru Official | Home</title>
        <meta name="description" content="Menuru Brand from Love yourself" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content={BLUE} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Menuru" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="icon" href="/images/ai.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/images/ai.jpg" />
        <meta property="og:title" content="Menuru Official | Home" />
        <meta property="og:description" content="Menuru Brand from Love yourself" />
        <meta property="og:image" content="/images/ai.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Menuru Official | Home" />
        <meta name="twitter:description" content="Menuru Brand from Love yourself" />
        <meta name="twitter:image" content="/images/ai.jpg" />
      </Head>

      <LeftNavbar shifted={navbarShifted} />
      <RightNavbar user={user} auth={auth} db={db} />

      <CookieConsentPopup user={user} db={db} isMounted={isMounted} />

      <div
        style={{
          minHeight: "100vh",
          backgroundColor: WHITE,
          margin: 0,
          padding: 0,
          position: "relative",
          fontFamily: FONT_FAMILY,
          overflow: "visible",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <HeroMenuruTitle onNavbarShiftChange={setNavbarShifted} />

        {/* ===== FEATURES + 01 NOTES TRUST + BG KOTAK BIRU ===== */}
        <div
          style={{
            padding: "0 40px",
            maxWidth: "1600px",
            margin: "0 auto",
            width: "100%",
            position: "relative",
            zIndex: 2,
            marginTop: "-40px",
          }}
        >
          <h2
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: "80px",
              fontWeight: 700,
              color: BLUE,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              margin: 0,
              marginBottom: "30px",
              textAlign: "left",
              WebkitFontSmoothing: "antialiased",
              MozOsxFontSmoothing: "grayscale",
            }}
          >
            Features
          </h2>

          {/* ===== BARIS 01 NOTES TRUST ===== */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              flexWrap: "wrap",
              position: "relative",
              zIndex: 2,
              marginBottom: "40px",
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: "140px" }}>
              <span
                style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: "90px",
                  fontWeight: 700,
                  color: BLUE,
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                }}
              >
                01
              </span>
              <span
                style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: "90px",
                  fontWeight: 700,
                  color: BLACK,
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                }}
              >
                Notes
              </span>
            </div>

            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "6px 16px",
                backgroundColor: BLUE,
                color: WHITE,
                borderRadius: "4px",
                fontSize: "16px",
                fontWeight: 800,
                letterSpacing: "0.8px",
                textTransform: "uppercase",
                fontFamily: FONT_FAMILY,
                lineHeight: 1.3,
                marginLeft: "auto",
                marginRight: "360px",
                marginTop: "-45px",
                whiteSpace: "nowrap",
              }}
            >
              Trust            </span>
          </div>

          {/* ===== TEKS BARU DI BAWAH TRUST ===== */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              width: "100%",
              marginBottom: "20px",
              position: "relative",
              zIndex: 2,
            }}
          >
            <div
              style={{
                marginLeft: "auto",
                marginRight: "360px",
                maxWidth: "420px",
                textAlign: "right",
                marginTop: "-20px",
              }}
            >
              <p
                style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: "18px",
                  fontWeight: 600,
                  color: BLUE,
                  letterSpacing: "-0.01em",
                  lineHeight: 1.4,
                  margin: 0,
                  textTransform: "none",
                }}
              >
                Notes for the next era of techology system
              </p>
            </div>

            <div
              style={{
                position: "absolute",
                right: "40px",
                top: "0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "120px",
                height: "120px",
                backgroundColor: BLUE,
                borderRadius: "20px",
                flexShrink: 0,
              }}
            >
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <path
                  d="M7 17L17 7M17 7H8M17 7V16"
                  stroke={WHITE}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* ===== BG KOTAK BIRU ===== */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: "420px",
              marginBottom: "60px",
              zIndex: 1,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "0px",
                left: "260px",
                right: "360px",
                height: "420px",
                backgroundColor: BLUE,
                borderRadius: "24px",
                border: `2px solid ${BLUE}`,
              }}
            />
          </div>
        </div>

        <div
          style={{
            position: "relative",
            zIndex: 1,
            flex: "1 0 auto",
            backgroundColor: WHITE,
          }}
        >
          <div style={{ padding: "0 40px", maxWidth: "1600px", margin: "0 auto", width: "100%" }}>
            <LiveChatAgent user={user} isAdmin={isAdmin} db={db} auth={auth} />
          </div>

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
        .physics-char {
          display: inline-block;
          will-change: transform, opacity;
          color: #0D3CFC !important;
          transform-origin: center center;
          opacity: 1 !important;
          visibility: visible !important;
        }
        .chat-messages-container::-webkit-scrollbar,
        .chat-list-container::-webkit-scrollbar,
        .chat-list-container > div::-webkit-scrollbar,
        .online-panel-container::-webkit-scrollbar,
        .online-panel-container > div::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
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
