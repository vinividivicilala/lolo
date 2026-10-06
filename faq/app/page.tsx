'use client';

import React, { useState, useEffect, useRef, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import Script from "next/script";
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

// ===== PWA NOTIFIKASI LIVE CHAT (IMPORT) =====
import LiveChatNotificationToggle from "../components/LiveChatNotificationToggle";
import { useLiveChatNotification } from "../hooks/useLiveChatNotification";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, Physics2DPlugin);
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

// ===== ENCRYPTION =====
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
    if (!encrypted.startsWith("encrypted:")) return encrypted;

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
async function checkBanStatus(userId: string): Promise<any> {
  if (!db) {
    return { isBanned: false, reason: "", message: "", canCreateTicket: true, canSendMessage: true };
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
    return { isBanned: false, reason: "", message: "", canCreateTicket: true, canSendMessage: true };
  } catch (error) {
    console.error("Error checking ban:", error);
    return { isBanned: false, reason: "", message: "", canCreateTicket: true, canSendMessage: true };
  }
}

// ===== CONSTANTS =====
const FONT_FAMILY = "'Plus Jakarta Sans'";
const ADMIN_EMAIL = "faridardiansyah061@gmail.com";
const AGENT_NAME = "Farid Ardiansyah";
const OWNER_NAME = "Farid Ardiansyah";
const OWNER_EMAIL = "faridardiansyah061@gmail.com";
const TOUR_STORAGE_KEY = "menuru_livechat_tour_completed_v1";
const COOKIE_CONSENT_STORAGE_KEY = "menuru_cookie_consent_v1";
const BLUE = "#0D3CFC";
const WHITE = "#FFFFFF";
const BLACK = "#000000";
const LIME = "#E3FB96";
const GREEN = "#4ADE80";

const STATUS_STYLES: any = {
  waiting: { label: "Waiting", bg: WHITE, text: BLUE, border: BLUE },
  active: { label: "Active", bg: WHITE, text: BLUE, border: BLUE },
  resolved: { label: "Resolved", bg: WHITE, text: BLUE, border: BLUE },
  closed: { label: "Closed", bg: WHITE, text: BLUE, border: BLUE },
};

const TOPIC_STYLES: any = {
  "Product Inquiry": { bg: WHITE, text: BLUE, border: BLUE },
  "Technical Support": { bg: WHITE, text: BLUE, border: BLUE },
  "Account Issues": { bg: WHITE, text: BLUE, border: BLUE },
  "Donation": { bg: WHITE, text: BLUE, border: BLUE },
  "Partnership": { bg: WHITE, text: BLUE, border: BLUE },
  "Other": { bg: WHITE, text: BLUE, border: BLUE },
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

// ===== AGENT ICON SVG =====
const AgentIcon = ({ size = 20, color = "#ffffff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 21V19C5 16.7909 6.79086 15 9 15H15C17.2091 15 19 16.7909 19 19V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 3L18 5L16 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18 5H14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ===== STRIPER ICON =====
const StriperIcon = ({ size = 22, color = "#ffffff" }: { size?: number; color?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
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

// ===== SAY HEY ICON =====
const SayHeyIcon = ({ size = 22, color = "#000000" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 11.5C21 16.1944 16.9706 20 12 20C10.8452 20 9.74371 19.7964 8.73507 19.4276L4 21L5.45177 16.7441C4.53668 15.3762 4 13.7581 4 12C4 7.30558 8.02944 3.5 12 3.5C16.9706 3.5 21 7.30558 21 11.5Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="9" cy="11.5" r="1" fill={color} />
    <circle cx="12" cy="11.5" r="1" fill={color} />
    <circle cx="15" cy="11.5" r="1" fill={color} />
  </svg>
);

// ===== BLINKING DOT =====
const BlinkingDot = ({ size = 10, color = BLUE }: { size?: number; color?: string }) => (
  <span
    style={{
      display: "inline-block",
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: "50%",
      backgroundColor: color,
      flexShrink: 0,
      animation: "blinking-dot 1s ease-in-out infinite",
    }}
  />
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
  replyTo?: { messageId: string; senderName: string; text: string } | null;
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
  replyTo?: { messageId: string; senderName: string; text: string } | null;
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

interface NoteEntry {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhoto?: string;
  text?: string;
  createdAt: any;
}

// ===== SAY HEY INTERFACES =====
interface SayHeyTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhoto?: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhoto?: string;
  status: "waiting" | "active" | "closed";
  createdAt: any;
  lastMessage?: string;
  lastMessageTime?: any;
  lastMessageSender?: string;
  typing: boolean;
  typingUserId?: string | null;
  typingUserName?: string | null;
  userUnreadCount: number;
  ownerUnreadCount: number;
}

interface SayHeyMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: any;
  read: boolean;
  isEncrypted?: boolean;
  deliveryStatus?: "sending" | "sent" | "delivered" | "read" | "failed";
}

// ===== PWA: SERVICE WORKER REGISTER =====
const ServiceWorkerRegister = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) {
      console.warn("[PWA] Service Worker tidak didukung browser ini");
      return;
    }

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });
        console.log("[PWA] Service Worker registered:", registration);

        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.onstatechange = () => {
            if (installingWorker.state === "installed") {
              if (navigator.serviceWorker.controller) {
                console.log("[PWA] New content available, please refresh.");
                setUpdateAvailable(true);
                setWaitingWorker(installingWorker);
              } else {
                console.log("[PWA] Content cached for offline use.");
              }
            }
          };
        };
      } catch (error) {
        console.error("[PWA] Service Worker registration failed:", error);
      }
    };

    registerSW();

    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
      setUpdateAvailable(false);
    }
  };

  if (!updateAvailable) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 99999,
        backgroundColor: BLUE,
        color: WHITE,
        padding: "14px 24px",
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        gap: "14px",
        boxShadow: "0 12px 40px rgba(13,60,252,0.4)",
        fontFamily: FONT_FAMILY,
        fontSize: "14px",
        fontWeight: 600,
      }}
    >
      <span>Versi baru tersedia!</span>
      <button
        onClick={handleUpdate}
        style={{
          padding: "8px 16px",
          backgroundColor: WHITE,
          color: BLUE,
          border: "none",
          borderRadius: "8px",
          fontSize: "13px",
          fontWeight: 800,
          cursor: "pointer",
          fontFamily: FONT_FAMILY,
        }}
      >
        Refresh
      </button>
    </div>
  );
};

// ===== PWA: INSTALL PROMPT =====
const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const dismissed = localStorage.getItem("pwa_install_dismissed");
    if (dismissed === "true") return;

    const iOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    if (iOS) {
      const isStandalone = (window.navigator as any).standalone === true;
      if (!isStandalone) {
        setTimeout(() => setShowPrompt(true), 3000);
      }
      return;
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    window.addEventListener("appinstalled", () => {
      console.log("[PWA] App installed");
      setShowPrompt(false);
      setDeferredPrompt(null);
      localStorage.setItem("pwa_install_dismissed", "true");
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log("[PWA] User choice:", outcome);
      if (outcome === "accepted") {
        setShowPrompt(false);
        localStorage.setItem("pwa_install_dismissed", "true");
      }
      setDeferredPrompt(null);
    } catch (error) {
      console.error("[PWA] Install error:", error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa_install_dismissed", "true");
  };

  if (!showPrompt) return null;

  if (showIOSGuide) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.7)",
          zIndex: 99999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          fontFamily: FONT_FAMILY,
        }}
        onClick={() => setShowIOSGuide(false)}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: WHITE,
            borderRadius: "16px",
            padding: "28px 24px",
            maxWidth: "380px",
            width: "100%",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>📱</div>
          <h3
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: BLACK,
              marginBottom: "8px",
            }}
          >
            Install Menuru di iPhone
          </h3>
          <p
            style={{
              fontSize: "14px",
              color: "#666",
              lineHeight: 1.6,
              marginBottom: "20px",
            }}
          >
            Untuk install di iPhone/iPad:
            <br />
            1. Tap ikon <strong>Share</strong> ⬆️ di Safari
            <br />
            2. Pilih <strong>&quot;Add to Home Screen&quot;</strong>
            <br />
            3. Tap <strong>&quot;Add&quot;</strong>
          </p>
          <button
            onClick={() => setShowIOSGuide(false)}
            style={{
              padding: "10px 24px",
              backgroundColor: BLUE,
              color: WHITE,
              border: "none",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: FONT_FAMILY,
            }}
          >
            Mengerti
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        left: "24px",
        right: "24px",
        maxWidth: "420px",
        margin: "0 auto",
        zIndex: 99998,
        backgroundColor: BLUE,
        color: WHITE,
        borderRadius: "16px",
        padding: "18px 20px",
        display: "flex",
        alignItems: "center",
        gap: "14px",
        boxShadow: "0 12px 40px rgba(13,60,252,0.4)",
        fontFamily: FONT_FAMILY,
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "12px",
          backgroundColor: WHITE,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        <img
          src="/images/ai.jpg"
          alt="Menuru"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "2px" }}>
          Install Menuru
        </div>
        <div style={{ fontSize: "12px", opacity: 0.9 }}>
          Akses cepat dari home screen Anda
        </div>
      </div>
      <button
        onClick={handleInstall}
        style={{
          padding: "8px 16px",
          backgroundColor: WHITE,
          color: BLUE,
          border: "none",
          borderRadius: "8px",
          fontSize: "13px",
          fontWeight: 800,
          cursor: "pointer",
          fontFamily: FONT_FAMILY,
          flexShrink: 0,
        }}
      >
        Install
      </button>
      <button
        onClick={handleDismiss}
        style={{
          background: "transparent",
          border: "none",
          color: WHITE,
          fontSize: "20px",
          cursor: "pointer",
          padding: 0,
          lineHeight: 1,
          opacity: 0.7,
          flexShrink: 0,
        }}
      >
        ×
      </button>
    </div>
  );
};

// ===== HERO MENURU TITLE (static, no GSAP) =====
const HeroMenuruTitle = () => {
  return (
    <div
      style={{
        width: "100%",
        paddingTop: "180px",
        paddingBottom: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        backgroundColor: WHITE,
      }}
    >
      <h1
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: "600px",
          fontWeight: 400,
          color: BLUE,
          letterSpacing: "-0.05em",
          lineHeight: 0.85,
          margin: 0,
          textAlign: "center",
          userSelect: "none",
          whiteSpace: "nowrap",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
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
          fontWeight: 400,
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
      <div style={{ width: "100%", display: "flex", justifyContent: "flex-start", marginTop: "10px" }}>
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
const CookieConsentPopup = ({ user, db, isMounted }: { user: any; db: any; isMounted: boolean }) => {
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
          console.error("Error:", err);
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
          { cookieConsent: consentPayload, cookieConsentUpdatedAt: serverTimestamp() },
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
          console.error(logErr);
        }
      } catch (err) {
        console.error(err);
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
          <span style={{ fontSize: "15px", fontWeight: 700, color: "#000000" }}>Cookies</span>
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
          }}
        >
          {saving ? "Saving..." : "Accept"}
        </button>
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
                  <img src={panelImage} alt="Brand" style={{ width: "100%", height: "120px", objectFit: "contain", display: "block", borderRadius: "8px" }} />
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


// ===== LEFT NAVBAR: Logo Menuru (biru) + foto dxzb.jpg + tombol Teams/Individual/Resources =====
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
      {/* ===== LOGO MENURU + FOTO dxzb.jpg ===== */}
      <Link
        href="/"
        style={{
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginRight: "12px",
        }}
      >
        <img
          src="/images/dxzb.jpg"
          alt="Menuru"
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            objectFit: "cover",
            display: "block",
            flexShrink: 0,
          }}
        />
        <span
          style={{
            color: BLUE,
            fontSize: "22px",
            fontWeight: 800,
            letterSpacing: "-0.02em",
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
  onSayHeyToggle,
  sayHeyOpen,
  sayHeyUnreadCount,
}: {
  user: any;
  auth: any;
  db: any;
  onSayHeyToggle: () => void;
  sayHeyOpen: boolean;
  sayHeyUnreadCount: number;
}) => {
  const rollingRef = useRef<HTMLDivElement>(null);
  const [rollingIndex, setRollingIndex] = useState(0);
  const displayName = user?.displayName || user?.email?.split("@")[0] || "User";
  const photoURL = user?.photoURL || "";

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      setRollingIndex((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (!user || !rollingRef.current) return;
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
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.05)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
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

      {sayHeyUnreadCount > 0 && !sayHeyOpen && (
        <span
          style={{
            position: "absolute",
            top: "-6px",
            right: "-6px",
            minWidth: "20px",
            height: "20px",
            padding: "0 6px",
            borderRadius: "10px",
            backgroundColor: BLUE,
            color: WHITE,
            fontSize: "11px",
            fontWeight: 800,
            fontFamily: FONT_FAMILY,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: `2px solid ${WHITE}`,
            boxShadow: "0 2px 8px rgba(13,60,252,0.5)",
            animation: "badge-pop 0.4s ease-out",
          }}
        >
          {sayHeyUnreadCount > 99 ? "99+" : sayHeyUnreadCount}
        </span>
      )}
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
            transition: "transform 0.2s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1)";
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
              <span style={{ color: BLUE, fontSize: "70px", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1 }}>
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

// ===== SAY HEY SECTION =====
const SayHeySection = ({
  user,
  db,
  isAdmin,
  onUnreadCountChange,
}: {
  user: any;
  db: any;
  isAdmin: boolean;
  onUnreadCountChange?: (count: number) => void;
}) => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any | null>(null);
  const [ticket, setTicket] = useState<SayHeyTicket | null>(null);
  const [messages, setMessages] = useState<SayHeyMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [encryptionReady, setEncryptionReady] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isOwner = isAdmin;

  useEffect(() => {
    getCryptoKey()
      .then(() => setEncryptionReady(true))
      .catch(() => setEncryptionReady(true));
  }, []);

  useEffect(() => {
    if (!db || !user) return;
    let q;
    if (isOwner) {
      q = query(collection(db, "users"), where("online", "==", true));
    } else {
      q = query(
        collection(db, "users"),
        where("online", "==", true),
        where("email", "==", OWNER_EMAIL)
      );
    }
    const unsub = onSnapshot(q, (snapshot: any) => {
      const list: any[] = [];
      snapshot.forEach((docSnap: any) => {
        const data = docSnap.data();
        if (isOwner) {
          if (docSnap.id === user.uid) return;
          if (data.email === ADMIN_EMAIL) return;
        }
        list.push({
          uid: docSnap.id,
          displayName: data.displayName || data.name || data.email || "User",
          email: data.email || "",
          photoURL: data.photoURL || "",
          online: data.online || false,
          lastSeen: data.lastSeen,
        });
      });
      setContacts(list);
    });
    return () => unsub();
  }, [db, user, isOwner]);

  useEffect(() => {
    if (!db || !user) return;
    let q;
    if (isOwner) {
      q = query(
        collection(db, "sayhey_tickets"),
        where("ownerId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
    } else {
      q = query(
        collection(db, "sayhey_tickets"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
    }
    const unsub = onSnapshot(q, (snapshot: any) => {
      const ticketMap: { [uid: string]: SayHeyTicket } = {};
      snapshot.forEach((docSnap: any) => {
        const data = docSnap.data();
        const otherId = isOwner ? data.userId : data.ownerId;
        ticketMap[otherId] = { id: docSnap.id, ...data } as SayHeyTicket;
      });
      setContacts((prev) =>
        prev.map((c) => ({ ...c, ticket: ticketMap[c.uid] || null }))
      );
      if (selectedContact && ticketMap[selectedContact.uid]) {
        setTicket(ticketMap[selectedContact.uid]);
      }
    });
    return () => unsub();
  }, [db, user, isOwner, selectedContact]);

  useEffect(() => {
    if (!db || !ticket) return;
    const q = query(
      collection(db, "sayhey_tickets", ticket.id, "messages"),
      orderBy("timestamp", "asc")
    );
    const unsub = onSnapshot(q, async (snapshot: any) => {
      const list: SayHeyMessage[] = [];
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
        list.push({ id: docSnap.id, ...data, text } as SayHeyMessage);
      }
      setMessages(list);
      requestAnimationFrame(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      });
    });
    return () => unsub();
  }, [db, ticket]);

  useEffect(() => {
    if (!db || !user) return;
    const q = isOwner
      ? query(collection(db, "sayhey_tickets"), where("ownerId", "==", user.uid))
      : query(collection(db, "sayhey_tickets"), where("userId", "==", user.uid));
    const unsub = onSnapshot(q, (snapshot: any) => {
      let total = 0;
      snapshot.forEach((docSnap: any) => {
        const data = docSnap.data();
        const unread = isOwner ? data.ownerUnreadCount || 0 : data.userUnreadCount || 0;
        total += unread;
      });
      if (onUnreadCountChange) onUnreadCountChange(total);
    });
    return () => unsub();
  }, [db, user, isOwner, onUnreadCountChange]);

  useEffect(() => {
    if (!db || !ticket || !user) return;
    const unread = messages.filter((m) => m.senderId !== user.uid && !m.read);
    if (unread.length === 0) return;
    unread.forEach(async (msg) => {
      const msgRef = doc(db, "sayhey_tickets", ticket.id, "messages", msg.id);
      await updateDoc(msgRef, { read: true, deliveryStatus: "read" });
    });
    const ticketRef = doc(db, "sayhey_tickets", ticket.id);
    if (isOwner) {
      updateDoc(ticketRef, { ownerUnreadCount: 0 }).catch(() => {});
    } else {
      updateDoc(ticketRef, { userUnreadCount: 0 }).catch(() => {});
    }
  }, [messages, ticket, db, user, isOwner]);

  const openChatWith = async (contact: any) => {
    if (!db || !user) return;
    setSelectedContact(contact);
    try {
      const existingQ = isOwner
        ? query(
            collection(db, "sayhey_tickets"),
            where("userId", "==", contact.uid),
            where("ownerId", "==", user.uid)
          )
        : query(
            collection(db, "sayhey_tickets"),
            where("userId", "==", user.uid),
            where("ownerId", "==", contact.uid)
          );
      const existingSnap = await new Promise<any>((resolve) => {
        const unsub = onSnapshot(existingQ, (snap: any) => {
          unsub();
          resolve(snap);
        });
      });
      if (!existingSnap.empty) {
        const docSnap = existingSnap.docs[0];
        setTicket({ id: docSnap.id, ...docSnap.data() } as SayHeyTicket);
        return;
      }
      const ticketRef = await addDoc(collection(db, "sayhey_tickets"), {
        userId: isOwner ? contact.uid : user.uid,
        userName: isOwner
          ? contact.displayName || contact.email || "User"
          : user.displayName || user.email || "User",
        userEmail: isOwner ? contact.email || "" : user.email || "",
        userPhoto: isOwner ? contact.photoURL || "" : user.photoURL || "",
        ownerId: isOwner ? user.uid : contact.uid,
        ownerName: isOwner
          ? user.displayName || OWNER_NAME
          : contact.displayName || OWNER_NAME,
        ownerEmail: isOwner ? user.email || OWNER_EMAIL : contact.email || OWNER_EMAIL,
        ownerPhoto: isOwner ? user.photoURL || "" : contact.photoURL || "",
        status: "active",
        createdAt: serverTimestamp(),
        lastMessage: "",
        lastMessageTime: serverTimestamp(),
        lastMessageSender: "",
        typing: false,
        typingUserId: null,
        typingUserName: null,
        userUnreadCount: 0,
        ownerUnreadCount: 0,
      });
      const initialMessage = `Hey! 👋`;
      const encryptedMessage = await encryptMessage(initialMessage);
      await addDoc(collection(db, "sayhey_tickets", ticketRef.id, "messages"), {
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
      const newTicketSnap = await getDoc(ticketRef);
      setTicket({ id: newTicketSnap.id, ...newTicketSnap.data() } as SayHeyTicket);
    } catch (error) {
      console.error(error);
    }
  };

  const handleTyping = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessageText(value);
    if (!ticket || !user || !db) return;
    const ticketRef = doc(db, "sayhey_tickets", ticket.id);
    if (value.length > 0) {
      await updateDoc(ticketRef, {
        typing: true,
        typingUserId: user.uid,
        typingUserName: user.displayName || user.email || "User",
      });
    } else {
      await updateDoc(ticketRef, { typing: false, typingUserId: null, typingUserName: null });
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(async () => {
      await updateDoc(ticketRef, { typing: false, typingUserId: null, typingUserName: null });
    }, 2000);
  };

  const sendMessage = async () => {
    if (!db || !ticket || !messageText.trim() || !user || !encryptionReady) return;
    try {
      const ticketRef = doc(db, "sayhey_tickets", ticket.id);
      await updateDoc(ticketRef, { typing: false, typingUserId: null, typingUserName: null });
      const senderName = user.displayName || user.email || "User";
      const encryptedMessage = await encryptMessage(messageText.trim());
      await addDoc(collection(db, "sayhey_tickets", ticket.id, "messages"), {
        senderId: user.uid,
        senderName,
        text: encryptedMessage,
        timestamp: serverTimestamp(),
        read: false,
        isEncrypted: true,
        deliveryStatus: "sent",
      });

      const updatePayload: any = {
        lastMessage: messageText.trim(),
        lastMessageTime: serverTimestamp(),
        lastMessageSender: senderName,
      };
      if (isOwner) {
        const currentUserUnread = ticket.userUnreadCount || 0;
        updatePayload.userUnreadCount = currentUserUnread + 1;
      } else {
        const currentOwnerUnread = ticket.ownerUnreadCount || 0;
        updatePayload.ownerUnreadCount = currentOwnerUnread + 1;
      }
      await updateDoc(ticketRef, updatePayload);

      setMessageText("");
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    } catch (error) {
      console.error(error);
    }
  };

  const renderDeliveryStatus = (msg: SayHeyMessage, isMine: boolean) => {
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

  if (!user) {
    return (
      <div
        style={{
          width: "100%",
          backgroundColor: BLUE,
          borderRadius: "20px",
          padding: "60px 40px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "20px",
          fontFamily: FONT_FAMILY,
          color: WHITE,
          marginBottom: "40px",
          minHeight: "300px",
        }}
      >
        <SayHeyIcon size={64} color={WHITE} />
        <h3
          style={{
            fontSize: "48px",
            fontWeight: 700,
            color: WHITE,
            margin: 0,
            letterSpacing: "-0.02em",
            textAlign: "center",
            fontFamily: FONT_FAMILY,
          }}
        >
          Say Hey
        </h3>
        <p
          style={{
            fontSize: "18px",
            fontWeight: 500,
            color: WHITE,
            margin: 0,
            textAlign: "center",
            maxWidth: "600px",
            lineHeight: 1.5,
            opacity: 0.95,
            fontFamily: FONT_FAMILY,
          }}
        >
          Please sign in to your account to start a real-time conversation. Your chat is private and encrypted end-to-end.
        </p>
        <Link
          href="/signin"
          style={{
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            padding: "14px 28px",
            backgroundColor: WHITE,
            color: BLUE,
            borderRadius: "12px",
            fontSize: "16px",
            fontWeight: 800,
            fontFamily: FONT_FAMILY,
            letterSpacing: "0.02em",
            marginTop: "10px",
          }}
        >
          Sign In to Continue
          <NorthEastArrow size={20} color={BLUE} />
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        backgroundColor: BLUE,
        borderRadius: "20px",
        padding: "40px",
        fontFamily: FONT_FAMILY,
        color: WHITE,
        marginBottom: "40px",
        minHeight: "600px",
      }}
    >
      <div style={{ marginBottom: "30px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "12px" }}>
          <SayHeyIcon size={40} color={WHITE} />
          <h3
            style={{
              fontSize: "48px",
              fontWeight: 700,
              color: WHITE,
              margin: 0,
              letterSpacing: "-0.02em",
              fontFamily: FONT_FAMILY,
            }}
          >
            Say Hey
          </h3>
        </div>
        <p
          style={{
            fontSize: "16px",
            fontWeight: 500,
            color: WHITE,
            margin: 0,
            lineHeight: 1.5,
            opacity: 0.95,
            fontFamily: FONT_FAMILY,
          }}
        >
          {ticket
            ? "You are now connected in a real-time chat."
            : isOwner
            ? "Select an online user below to start a real-time conversation."
            : "Select the owner below to start a real-time conversation."}
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: "20px",
          minHeight: "500px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            width: "300px",
            flexShrink: 0,
            backgroundColor: GREEN,
            borderRadius: "16px",
            border: `1px solid ${GREEN}`,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            height: "500px",
            boxShadow: "0 8px 24px rgba(74,222,128,0.35)",
          }}
        >
          <div
            style={{
              padding: "16px 20px",
              backgroundColor: LIME,
              borderBottom: `1px solid ${LIME}`,
              fontSize: "14px",
              fontWeight: 800,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              color: BLACK,
              fontFamily: FONT_FAMILY,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>{isOwner ? "Users Online" : "Owners Online"}</span>
            <span
              style={{
                fontSize: "11px",
                color: BLACK,
                padding: "2px 8px",
                borderRadius: "4px",
                backgroundColor: WHITE,
                fontWeight: 800,
                letterSpacing: "0.5px",
              }}
            >
              {contacts.length}
            </span>
          </div>
          <div style={{ overflowY: "auto", flex: 1, minHeight: 0 }}>
            {contacts.length === 0 ? (
              <div
                style={{
                  padding: "40px 20px",
                  textAlign: "center",
                  fontSize: "13px",
                  color: BLACK,
                  fontFamily: FONT_FAMILY,
                  lineHeight: 1.5,
                  opacity: 0.85,
                }}
              >
                {isOwner ? "No users online." : "Owner is currently offline."}
                <br />
                Please check back later.
              </div>
            ) : (
              contacts.map((c) => {
                const cTicket = c.ticket;
                const unread = cTicket
                  ? isOwner
                    ? cTicket.ownerUnreadCount || 0
                    : cTicket.userUnreadCount || 0
                  : 0;
                return (
                  <div
                    key={c.uid}
                    onClick={() => openChatWith(c)}
                    style={{
                      padding: "14px 20px",
                      borderBottom: `1px solid rgba(0,0,0,0.08)`,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      backgroundColor:
                        selectedContact?.uid === c.uid ? "rgba(0,0,0,0.12)" : "transparent",
                      transition: "background-color 0.2s ease",
                    }}
                  >
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "12px",
                        overflow: "hidden",
                        backgroundColor: WHITE,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {c.photoURL ? (
                        <img
                          src={c.photoURL}
                          alt={c.displayName}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <span style={{ fontSize: "18px", fontWeight: 800, color: BLUE }}>
                          {c.displayName.charAt(0).toUpperCase()}
                        </span>
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
                          fontFamily: FONT_FAMILY,
                        }}
                      >
                        {c.displayName}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: BLACK,
                          fontFamily: FONT_FAMILY,
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontWeight: 600,
                          opacity: 0.85,
                        }}
                      >
                        <BlinkingDot size={8} color={BLUE} />
                        {c.online ? "Online" : "Offline"}
                      </div>
                    </div>
                    {unread > 0 && (
                      <span
                        style={{
                          minWidth: "20px",
                          height: "20px",
                          padding: "0 6px",
                          borderRadius: "10px",
                          backgroundColor: BLUE,
                          color: WHITE,
                          fontSize: "11px",
                          fontWeight: 800,
                          fontFamily: FONT_FAMILY,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {unread > 99 ? "99+" : unread}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div
          style={{
            flex: 1,
            minWidth: "300px",
            backgroundColor: WHITE,
            borderRadius: "16px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            height: "500px",
            color: BLACK,
          }}
        >
          {!ticket || !selectedContact ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: "12px",
                color: "#999",
                fontSize: "15px",
                fontFamily: FONT_FAMILY,
                padding: "20px",
                textAlign: "center",
              }}
            >
              <SayHeyIcon size={48} color="#ccc" />
              <span>
                {isOwner
                  ? "Select an online user on the left to start chatting"
                  : "Select the owner on the left to start chatting"}
              </span>
            </div>
          ) : (
            <>
              <div
                style={{
                  padding: "16px 20px",
                  backgroundColor: LIME,
                  color: BLACK,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  flexShrink: 0,
                  borderBottom: `1px solid ${LIME}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                  <div                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      overflow: "hidden",
                      backgroundColor: WHITE,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {selectedContact.photoURL ? (
                      <img
                        src={selectedContact.photoURL}
                        alt={selectedContact.displayName}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <span style={{ fontSize: "16px", fontWeight: 800, color: BLUE }}>
                        {(selectedContact.displayName || "U").charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "15px",
                        fontWeight: 800,
                        color: BLACK,
                        fontFamily: FONT_FAMILY,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {selectedContact.displayName}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: BLACK,
                        fontFamily: FONT_FAMILY,
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontWeight: 600,
                        opacity: 0.85,
                      }}
                    >
                      <BlinkingDot size={8} color={BLUE} />
                      {selectedContact.online ? "Online" : "Offline"}
                    </div>
                  </div>
                </div>
              </div>

              <div
                ref={chatContainerRef}
                className="chat-messages-container"
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  minHeight: 0,
                  backgroundColor: "#fafafa",
                }}
              >
                {messages.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      color: "#999",
                      fontSize: "14px",
                      padding: "30px 0",
                      fontFamily: FONT_FAMILY,
                    }}
                  >
                    No messages yet. Say hey! 👋
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMine = msg.senderId === user?.uid;
                    return (
                      <div
                        key={msg.id || idx}
                        style={{ alignSelf: isMine ? "flex-end" : "flex-start", maxWidth: "75%" }}
                      >
                        <div
                          style={{
                            padding: "10px 14px",
                            borderRadius: "12px",
                            backgroundColor: isMine ? BLUE : "#ffffff",
                            color: isMine ? WHITE : BLACK,
                            fontSize: "14px",
                            fontFamily: FONT_FAMILY,
                            wordBreak: "break-word",
                            border: isMine ? "none" : "1px solid rgba(0,0,0,0.06)",
                            boxShadow: isMine ? "none" : "0 2px 6px rgba(0,0,0,0.04)",
                          }}
                        >
                          {!isMine && (
                            <div
                              style={{
                                fontSize: "11px",
                                fontWeight: 700,
                                color: BLUE,
                                marginBottom: "4px",
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
                              marginTop: "4px",
                            }}
                          >
                            {renderDeliveryStatus(msg, isMine)}
                            <span
                              style={{
                                fontSize: "10px",
                                color: isMine ? "rgba(255,255,255,0.85)" : "#999",
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
                {ticket.typing && ticket.typingUserId !== user?.uid && (
                  <div
                    style={{
                      alignSelf: "flex-start",
                      fontSize: "13px",
                      color: "#666",
                      fontStyle: "italic",
                      fontFamily: FONT_FAMILY,
                      padding: "4px 10px",
                    }}
                  >
                    {ticket.typingUserName} is typing...
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div
                style={{
                  padding: "14px 20px",
                  borderTop: "1px solid rgba(0,0,0,0.06)",
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
                  placeholder="Type your message..."
                  style={{
                    flex: 1,
                    padding: "12px 16px",
                    border: "1px solid rgba(0,0,0,0.1)",
                    borderRadius: "10px",
                    fontSize: "14px",
                    outline: "none",
                    fontFamily: FONT_FAMILY,
                    backgroundColor: WHITE,
                    color: BLACK,
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
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ===== ONBOARDING TOUR =====
const OnboardingTour = ({ steps, onComplete, isActive, currentStep, setCurrentStep }: any) => {
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
    if (arrowPos === "top")
      return (
        <div
          style={{
            ...baseStyle,
            top: -arrowSize,
            left: "50%",
            marginLeft: -arrowSize,
            borderWidth: `0 ${arrowSize}px ${arrowSize}px ${arrowSize}px`,
            borderColor: `transparent transparent #0D3CFC transparent`,
          }}
        />
      );
    if (arrowPos === "bottom")
      return (
        <div
          style={{
            ...baseStyle,
            bottom: -arrowSize,
            left: "50%",
            marginLeft: -arrowSize,
            borderWidth: `${arrowSize}px ${arrowSize}px 0 ${arrowSize}px`,
            borderColor: `#0D3CFC transparent transparent transparent`,
          }}
        />
      );
    if (arrowPos === "left")
      return (
        <div
          style={{
            ...baseStyle,
            left: -arrowSize,
            top: "50%",
            marginTop: -arrowSize,
            borderWidth: `${arrowSize}px ${arrowSize}px ${arrowSize}px 0`,
            borderColor: `transparent #0D3CFC transparent transparent`,
          }}
        />
      );
    if (arrowPos === "right")
      return (
        <div
          style={{
            ...baseStyle,
            right: -arrowSize,
            top: "50%",
            marginTop: -arrowSize,
            borderWidth: `${arrowSize}px 0 ${arrowSize}px ${arrowSize}px`,
            borderColor: `transparent transparent transparent #0D3CFC`,
          }}
        />
      );
    return null;
  };

  return (
    <>
      <div
        onClick={handleSkip}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.6)",
          zIndex: 9998,
          pointerEvents: "auto",
        }}
      />
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
          transition: "all 0.3s ease",
        }}
      >
        {renderArrow()}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              opacity: 0.9,
            }}
          >
            Step {currentStep + 1} of {steps.length}
          </span>
          <button
            onClick={handleSkip}
            style={{
              background: "transparent",
              border: "none",
              color: "#ffffff",
              cursor: "pointer",
              fontSize: "18px",
              fontFamily: FONT_FAMILY,
              padding: 0,
              lineHeight: 1,
              opacity: 0.9,
            }}
          >
            ×
          </button>
        </div>
        <h4 style={{ fontSize: "18px", fontWeight: 700, color: "#ffffff", margin: 0, marginBottom: "8px" }}>
          {step.title}
        </h4>
        <p
          style={{
            fontSize: "13px",
            fontWeight: 400,
            color: "#ffffff",
            margin: 0,
            marginBottom: "18px",
            lineHeight: 1.5,
            opacity: 0.95,
          }}
        >
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
          <button
            onClick={handleSkip}
            style={{
              padding: "7px 14px",
              backgroundColor: "transparent",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: FONT_FAMILY,
              opacity: 0.8,
            }}
          >
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
          {steps.map((_: any, i: number) => (
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
    tl.to(container, { height: 24, opacity: 1, duration: 0.4, ease: "power2.out" }).to(
      textEl,
      { yPercent: 0, opacity: 1, rotateX: 0, duration: 0.6, ease: "back.out(1.7)" },
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

// ===== CLOSE BUTTON =====
const CloseRoomButton = ({ onConfirm, disabled }: { onConfirm: () => void; disabled?: boolean }) => {
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
    if (btnRef.current) gsap.to(btnRef.current, { scale: 1.08, duration: 0.25, ease: "power2.out" });
    if (iconRef.current) gsap.to(iconRef.current, { rotate: "+=90", duration: 0.35, ease: "power2.out" });
  };

  const handleLeave = () => {
    if (disabled) return;
    if (btnRef.current) gsap.to(btnRef.current, { scale: 1, duration: 0.25, ease: "power2.out" });
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
      style={{
        width: "36px",
        height: "36px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: WHITE,
        border: `1.5px solid ${WHITE}`,
        borderRadius: "8px",
        cursor: disabled ? "not-allowed" : "pointer",
        padding: 0,
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <div ref={iconRef} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CloseIcon size={16} color={BLUE} />
      </div>
    </button>
  );
};

// ===== BANNED INFO BANNER =====
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
      gsap.fromTo(bannerRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" });
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
      <div style={{ fontSize: "14px", color: WHITE, fontFamily: FONT_FAMILY, lineHeight: 1.5, opacity: 0.95 }}>
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
            backgroundColor: WHITE,
            color: BLUE,
            border: `1.5px solid ${WHITE}`,
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

// ===== APPEAL CHAT ROOM =====
const AppealChatRoom = ({ user, isAdmin, db, appealTicket, onClose }: any) => {
  const [messages, setMessages] = useState<AppealMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [replyTo, setReplyTo] = useState<AppealMessage | null>(null);
  const [encryptionReady, setEncryptionReady] = useState(false);
  const [typing, setTyping] = useState(false);
  const [typingUserName, setTypingUserName] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatMessagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    getCryptoKey()
      .then(() => setEncryptionReady(true))
      .catch(() => setEncryptionReady(true));
  }, []);

  useEffect(() => {
    if (!db || !appealTicket) return;
    const q = query(collection(db, "appeal_tickets", appealTicket.id, "messages"), orderBy("timestamp", "asc"));
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
      setMessages(msgList);
      requestAnimationFrame(() => {
        if (chatMessagesContainerRef.current) {
          chatMessagesContainerRef.current.scrollTop = chatMessagesContainerRef.current.scrollHeight;
        }
      });
    });
    return () => unsubscribe();
  }, [db, appealTicket]);

  useEffect(() => {
    if (!db || !appealTicket || !user) return;
    const unread = messages.filter((m) => m.senderId !== user.uid && !m.read);
    unread.forEach(async (msg) => {
      const msgRef = doc(db, "appeal_tickets", appealTicket.id, "messages", msg.id);
      await updateDoc(msgRef, { read: true, deliveryStatus: "read" });
    });
  }, [messages, appealTicket, db, user]);

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
      await updateDoc(ticketRef, { typing: false, typingUserId: null, typingUserName: null });
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(async () => {
      await updateDoc(ticketRef, { typing: false, typingUserId: null, typingUserName: null });
    }, 2000);
  };

  const sendMessage = async () => {
    if (!db || !appealTicket || !messageText.trim() || !user) return;
    if (!encryptionReady) {
      alert("Encryption is being initialized.");
      return;
    }
    try {
      const ticketRef = doc(db, "appeal_tickets", appealTicket.id);
      await updateDoc(ticketRef, { typing: false, typingUserId: null, typingUserName: null });
      const senderName = isAdmin ? AGENT_NAME : user.displayName || user.email || "User";
      const encryptedMessage = await encryptMessage(messageText.trim());
      await addDoc(collection(db, "appeal_tickets", appealTicket.id, "messages"), {
        senderId: user.uid,
        senderName,
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
      console.error(error);
      alert("An error occurred.");
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
            <StabiloBadge label="Banding" bg={WHITE} text={BLUE} border={WHITE} size="sm" />
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
      <div style={{ padding: "12px 20px", backgroundColor: "rgba(13,60,252,0.08)", borderBottom: `1px solid ${BLUE}30`, flexShrink: 0 }}>
        <div style={{ fontSize: "12px", color: BLUE, fontFamily: FONT_FAMILY, fontWeight: 600 }}>
          <strong>Alasan banned:</strong> {appealTicket.banReason || "Suspicious Activity"}
        </div>
        {appealTicket.banMessage && (
          <div style={{ fontSize: "11px", color: BLUE, fontFamily: FONT_FAMILY, marginTop: "4px", opacity: 0.8 }}>
            {appealTicket.banMessage}
          </div>
        )}
      </div>
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
                    <div style={{ fontSize: "12px", fontWeight: 700, color: BLUE, marginBottom: "4px" }}>{msg.senderName}</div>
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
                  <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "6px", marginTop: "5px" }}>
                    {renderDeliveryStatus(msg, isMine)}
                    <span style={{ fontSize: "10px", color: isMine ? WHITE : "#999" }}>{formatTime(msg.timestamp)}</span>
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
        <div ref={messagesEndRef} />
      </div>
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
          <div
            style={{
              flex: 1,
              fontSize: "12px",
              color: BLUE,
              fontFamily: FONT_FAMILY,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            <strong>{replyTo.senderName}:</strong> {replyTo.text}
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

// ===== LIVE CHAT AGENT =====
const LiveChatAgent = ({ user, isAdmin, db, auth, onOpenAppealChat, onOpenBannedAppealChat }: any) => {
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
  const [appealTickets, setAppealTickets] = useState<AppealTicket[]>([]);
  const [hasAppeal, setHasAppeal] = useState(false);
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

  const [notifEnabled, setNotifEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("menuru_livechat_notif_enabled");
    setNotifEnabled(saved === "true" && Notification.permission === "granted");
  }, []);

  useLiveChatNotification({
    user,
    isAdmin,
    db,
    enabled: notifEnabled,
    currentTicketId: selectedTicket?.id || null,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!tickets.length) return;

    const params = new URLSearchParams(window.location.search);
    const ticketId = params.get("ticket");
    if (!ticketId) return;

    const target = tickets.find((t) => t.id === ticketId);
    if (target) {
      setSelectedTicket(target);
      window.history.replaceState({}, "", "/live-chat-agent");
    }
  }, [tickets]);

  const topics = ["Product Inquiry", "Technical Support", "Account Issues", "Donation", "Partnership", "Other"];

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
        console.error("Failed to init encryption:", err);
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

  useEffect(() => {
    if (!isMounted) return;
    if (liveChatTitleRef.current) {
      const splitTitle = new SplitText(liveChatTitleRef.current, { type: "chars", charsClass: "split-char-livechat" });
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

  useEffect(() => {
    if (!db || !user || !isMounted) return;
    const q = query(
      collection(db, "appeal_tickets"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(1)
    );
    const unsub = onSnapshot(q, (snapshot: any) => {
      if (!snapshot.empty) setHasAppeal(true);
      else setHasAppeal(false);
    });
    return () => unsub();
  }, [db, user, isMounted]);

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
    });
    return () => unsub();
  }, [db, user, isAdmin, isMounted]);

  useEffect(() => {
    if (!db || !isMounted) return;
    const q = query(collection(db, "users"), where("online", "==", true));
    const unsub = onSnapshot(q, (snapshot: any) => {
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
        if (!item.isAgent) {
          users.push(item);
        }
      });
      setOnlineUsers(users);
    });
    return () => unsub();
  }, [db, isMounted]);

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

  useEffect(() => {
    if (!db || !tickets.length || !isMounted) return;
    const unsubscribes: (() => void)[] = [];
    tickets.forEach((ticket) => {
      const q = query(collection(db, "livechat_tickets", ticket.id, "messages"), orderBy("timestamp", "desc"), limit(3));
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

  useEffect(() => {
    if (!db || !selectedTicket || !isMounted) return;
    const ticketId = selectedTicket.id;
    if (messagesCacheRef.current[ticketId]) {
      setMessages(messagesCacheRef.current[ticketId]);
      prevMessagesLenRef.current = messagesCacheRef.current[ticketId].length;
    }
    const q = query(collection(db, "livechat_tickets", ticketId, "messages"), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, async (snapshot: any) => {
      const msgList: ChatMessage[] = [];
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        let text = data.text || "";
        if (data.isEncrypted) {
          try {
            text = await decryptMessage(text);
          } catch (e) {
            console.error("Failed to decrypt:", e);
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

  useEffect(() => {
    setLatestRollingMessage(null);
    prevMessagesLenRef.current = messagesCacheRef.current[selectedTicket?.id || ""]?.length || 0;
    setShowCloseConfirm(false);
    setReplyTo(null);
  }, [selectedTicket?.id]);

  useEffect(() => {
    if (!db || !selectedTicket || !user || !isAdmin || !isMounted) return;
    const unread = messages.filter((m) => m.senderId !== user.uid && !m.read);
    unread.forEach(async (msg) => {
      const msgRef = doc(db, "livechat_tickets", selectedTicket.id, "messages", msg.id);
      await updateDoc(msgRef, { read: true, deliveryStatus: "read" });
    });
  }, [messages, selectedTicket, db, user, isAdmin, isMounted]);

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
        typingUserName: isAdmin ? AGENT_NAME : user.displayName || user.email || "User",
      });
    } else {
      await updateDoc(ticketRef, { typing: false, typingUserId: null, typingUserName: null });
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(async () => {
      await updateDoc(ticketRef, { typing: false, typingUserId: null, typingUserName: null });
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
      console.error("Error checking ban:", error);
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
      alert("Encryption is being initialized.");
      return;
    }
    const hasActiveTicket = tickets.some(
      (t) =>
        t.userId === user.uid &&
        (t.status === "waiting" || t.status === "active") &&
        !t.isAnnouncement &&
        !t.isBroadcast
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
      console.error(error);
      alert("An error occurred.");
    }
  };

  const sendMessage = async () => {
    if (!db || !selectedTicket || !messageText.trim() || !user) return;

    if (!isAdmin) {
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
        ...(isAdmin && {
          agentId: user.uid,
          agentName: AGENT_NAME,
          status: selectedTicket.status === "waiting" ? "active" : selectedTicket.status,
        }),
      });
      setMessageText("");
      setBanMessage(null);
      setReplyTo(null);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    } catch (error) {
      console.error(error);
      alert("An error occurred.");
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
      console.error(error);
    }
  };

  const resolveTicket = async (ticketId: string) => {
    if (!db || !isAdmin) return;
    try {
      await updateDoc(doc(db, "livechat_tickets", ticketId), { status: "resolved" });
    } catch (error) {
      console.error(error);
    }
  };

  const handleCloseRoom = async () => {
    if (!db || !selectedTicket) return;
    try {
      await updateDoc(doc(db, "livechat_tickets", selectedTicket.id), { status: "closed" });
      setShowCloseConfirm(true);
      setTimeout(() => setShowCloseConfirm(false), 2200);
    } catch (error) {
      console.error(error);
    }
  };

  const createAppealTicket = async () => {
    if (!db || !user || !isBanned) return;
    try {
      const existingAppeal = appealTickets.find(
        (t) => t.userId === user.uid && t.status !== "closed" && t.status !== "resolved"
      );
      if (existingAppeal) {
        onOpenBannedAppealChat(existingAppeal);
        return;
      }
      const ticketRef = await addDoc(collection(db, "appeal_tickets"), {
        userId: user.uid,
        userName: user.displayName || user.email || "User",
        userEmail: user.email,
        userPhoto: user.photoURL || "",
        status: "waiting",
        topic: "Banding Banned",
        banReason,
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
        banReason,
        banMessage: banMessage || "",
        createdAt: new Date(),
        unreadCount: 0,
        typing: false,
      };
      onOpenBannedAppealChat(newTicket);
      setHasAppeal(true);
    } catch (error) {
      console.error(error);
      alert("Gagal membuat tiket banding.");
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
    if (!isAdmin) return null;

    const list = onlineUsers;
    const title = "Online Users";
    const emptyText = "No users online";
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
              color: BLUE,
              padding: "2px 8px",
              borderRadius: "4px",
              backgroundColor: WHITE,
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
                    <AgentIcon size={20} color={WHITE} />
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
            backgroundColor: "#ffffff",
            border: "1px solid #ffffff",
            borderRadius: "8px",
          }}
        >
          <SearchIcon size={14} color={BLUE} />
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
                <div
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  style={{ padding: "8px 0", borderTop: "1px solid rgba(255,255,255,0.15)", cursor: "pointer" }}
                >
                  <div style={{ fontSize: "13px", fontWeight: 600, color: WHITE, marginBottom: "3px" }}>{t.userName}</div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "rgba(255,255,255,0.85)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
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
                <div
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  style={{ padding: "8px 0", borderTop: "1px solid rgba(255,255,255,0.15)", cursor: "pointer" }}
                >
                  <div style={{ fontSize: "13px", fontWeight: 600, color: WHITE, marginBottom: "3px" }}>{t.userName}</div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "rgba(255,255,255,0.85)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
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
        <OnboardingTour
          steps={tourSteps}
          onComplete={completeTour}
          isActive={showTour}
          currentStep={tourStep}
          setCurrentStep={setTourStep}
        />
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
        </div>
      </>
    );
  }

  if (!isAdmin && isBanned) {
    return (
      <div style={{ marginTop: "80px", paddingTop: "30px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
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
            Live Chat Agent
          </h3>
        </div>
        <BannedInfoBanner
          banReason={banReason}
          banMessage={banMessage || ""}
          onAppeal={createAppealTicket}
          hasAppeal={hasAppeal}
        />
        {appealTickets.length > 0 && (
          <div style={{ marginTop: "20px" }}>
            <div style={{ fontSize: "16px", fontWeight: 700, color: BLUE, fontFamily: FONT_FAMILY, marginBottom: "12px" }}>
              Tiket Banding Anda
            </div>
            {appealTickets.map((t) => (
              <div
                key={t.id}
                onClick={() => onOpenBannedAppealChat(t)}
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
                  <span style={{ fontSize: "14px", fontWeight: 700, color: WHITE }}>Banding #{t.id.slice(-6)}</span>
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
        {appealTickets.length === 0 && (
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
        <OnboardingTour
          steps={tourSteps}
          onComplete={completeTour}
          isActive={showTour}
          currentStep={tourStep}
          setCurrentStep={setTourStep}
        />
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
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px" }}>
              {user && <LiveChatNotificationToggle user={user} db={db} />}
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
        </div>
      </>
    );
  }

  if (!isAdmin && showStartChat) {
    return (
      <div style={{ marginTop: "80px", paddingTop: "30px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
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
            Live Chat Agent
          </h3>
        </div>
        <div style={{ maxWidth: "400px" }}>
          <div style={{ fontSize: "15px", marginBottom: "10px", fontFamily: FONT_FAMILY, fontWeight: 700, color: BLUE }}>
            Select your issue topic:
          </div>
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
              <option key={t} value={t}>
                {t}
              </option>
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
            }}
          >
            {ticket.userName}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
            {ticket.isBanned && <StabiloBadge label="BANNED" bg={WHITE} text={BLUE} border={WHITE} size="sm" />}
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
          <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.65)", fontWeight: 700, letterSpacing: "0.3px" }}>
            {ticketId}
          </span>
        </div>
      </div>
    );
  };

  return (
    <>
      <OnboardingTour
        steps={tourSteps}
        onComplete={completeTour}
        isActive={showTour}
        currentStep={tourStep}
        setCurrentStep={setTourStep}
      />
      <div style={{ marginTop: "80px", paddingTop: "30px" }}>
        {user && (
          <div style={{ marginBottom: "16px", width: "100%" }}>
            <LiveChatNotificationToggle user={user} db={db} />
          </div>
        )}

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
        </div>

        {renderAnnouncementBroadcastSection()}

        <div style={{ display: "flex", gap: "16px", height: "700px", width: "100%", overflow: "hidden", borderRadius: "12px" }}>
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
                  color: BLUE,
                  padding: "2px 8px",
                  borderRadius: "4px",
                  backgroundColor: WHITE,
                  border: `1.5px solid ${WHITE}`,
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
                  {waitingTickets.length === 0 &&
                    activeTickets.length === 0 &&
                    resolvedTickets.length === 0 &&
                    bannedUsersInWaiting.length === 0 && (
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
                      onClick={() => onOpenAppealChat(t)}
                      style={{
                        padding: "14px 16px",
                        borderBottom: "1px solid rgba(255,255,255,0.08)",
                        cursor: "pointer",
                        backgroundColor: "transparent",
                        borderLeft: "3px solid transparent",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "6px",
                        }}
                      >
                        <span style={{ fontSize: "14px", fontWeight: 700, color: WHITE }}>{t.userName}</span>
                        <StabiloBadge
                          label={t.status === "waiting" ? "Waiting" : t.status === "active" ? "Active" : "Closed"}
                          bg={WHITE}
                          text={BLUE}
                          border={WHITE}
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
            {selectedTicket ? (
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
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "17px",
                        color: WHITE,
                        fontFamily: FONT_FAMILY,
                        marginBottom: "6px",
                      }}
                    >
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
                        <StabiloBadge label="BANNED" bg={WHITE} text={BLUE} border={WHITE} size="sm" />
                      )}
                      {selectedTicket.typing && selectedTicket.status !== "resolved" && (
                        <span style={{ fontSize: "12px", color: WHITE, fontStyle: "italic", fontWeight: 700 }}>
                          {selectedTicket.typingUserName} is typing...
                        </span>
                      )}
                      <span
                        style={{
                          fontSize: "10px",
                          color: "rgba(255,255,255,0.75)",
                          fontWeight: 700,
                          letterSpacing: "0.3px",
                        }}
                      >
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
                    {selectedTicket.status !== "closed" && <CloseRoomButton onConfirm={handleCloseRoom} />}
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
                        message={latestRollingMessage.message || latestRollingMessage.text}
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
                        <div
                          style={{
                            flex: 1,
                            fontSize: "12px",
                            color: BLUE,
                            fontFamily: FONT_FAMILY,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          <strong>{replyTo.senderName}:</strong> {replyTo.text}
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
                          selectedTicket.status === "waiting" && !isAdmin
                            ? "Waiting for agent..."
                            : "Type a message..."
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
                          backgroundColor:
                            selectedTicket.status === "waiting" && !isAdmin ? "#f5f5f5" : WHITE,
                        }}
                      />
                      <button
                        onClick={sendMessage}
                        disabled={(selectedTicket.status === "waiting" && !isAdmin) || !messageText.trim()}
                        style={{
                          padding: "12px 24px",
                          backgroundColor:
                            (selectedTicket.status === "waiting" && !isAdmin) || !messageText.trim()
                              ? "#ccc"
                              : BLUE,
                          color: WHITE,
                          border: "none",
                          borderRadius: "10px",
                          cursor:
                            (selectedTicket.status === "waiting" && !isAdmin) || !messageText.trim()
                              ? "not-allowed"
                              : "pointer",
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
  const [noteHovered, setNoteHovered] = useState(false);
  const [sayHeyOpen, setSayHeyOpen] = useState(false);
  const [sayHeyUnreadCount, setSayHeyUnreadCount] = useState(0);

  const [registeredUsers, setRegisteredUsers] = useState<NoteEntry[]>([]);
  const [hasSubmittedNote, setHasSubmittedNote] = useState(false);
  const [activeNoteUser, setActiveNoteUser] = useState<string | null>(null);

  const [adminAppealTicket, setAdminAppealTicket] = useState<AppealTicket | null>(null);
  const [showAdminAppealSection, setShowAdminAppealSection] = useState(false);
  const [bannedAppealTicket, setBannedAppealTicket] = useState<AppealTicket | null>(null);
  const [showBannedAppealSection, setShowBannedAppealSection] = useState(false);

  const preloaderRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const mainPageRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const noteJoinRef = useRef<HTMLDivElement>(null);

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
    if (!db || !isMounted) return;
    const q = query(collection(db, "users"), orderBy("lastSeen", "desc"), limit(50));
    const unsub = onSnapshot(q, (snapshot: any) => {
      const list: NoteEntry[] = [];
      snapshot.forEach((docSnap: any) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          userId: docSnap.id,
          userName: data.displayName || data.name || data.email?.split("@")[0] || "User",
          userEmail: data.email || "",
          userPhoto: data.photoURL || "",
          text: data.text || "",
          createdAt: data.createdAt || data.lastSeen || null,
        } as NoteEntry);
      });
      setRegisteredUsers(list);
    });
    return () => unsub();
  }, [db, isMounted]);

  useEffect(() => {
    if (!db || !user || !isMounted) return;
    const q = query(collection(db, "notes"), where("userId", "==", user.uid), limit(1));
    const unsub = onSnapshot(q, (snapshot: any) => {
      if (!snapshot.empty) setHasSubmittedNote(true);
      else setHasSubmittedNote(false);
    });
    return () => unsub();
  }, [db, user, isMounted]);

  // ===== PRELOADER -> MAIN PAGE slide from RIGHT =====
  useEffect(() => {
    if (!isMounted || loading) return;

    let killed = false;
    const preloaderEl = preloaderRef.current;
    const textEl = textRef.current;
    const counterEl = counterRef.current;
    const mainEl = mainPageRef.current;

    if (!preloaderEl || !textEl || !counterEl || !mainEl) return;

    setShowMain(true);

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
        opacity: 0,
        y: -20,
        scale: 0.9,
        duration: 0.5,
        ease: "power2.out",
        onComplete: () => {
          if (textEl) textEl.textContent = "Note";
        },
      })
      .to(textEl, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "back.out(1.7)" })
      .to(textEl, { duration: 1.2 });

    tl.to(
      counterObj,
      {
        value: 100,
        duration: 6.5,
        ease: "power2.inOut",
        onUpdate: () => {
          if (counterEl) {
            const val = Math.round(counterObj.value);
            counterEl.textContent = String(val).padStart(2, "0");
          }
        },
      },
      0
    );

    tl.to(textEl, {
      scale: 0.3,
      opacity: 0,
      duration: 0.8,
      ease: "power2.in",
    })
      .to(
        counterEl,
        {
          scale: 0.6,
          opacity: 0,
          duration: 0.8,
          ease: "power2.in",
        },
        "-=0.8"
      )
      .to(
        preloaderEl,
        {
          xPercent: -100,
          duration: 1.2,
          ease: "power3.inOut",
          onComplete: () => {
            if (preloaderEl) preloaderEl.style.display = "none";
          },
        },
        "-=0.2"
      )
      .to(
        mainEl,
        {
          xPercent: 0,
          duration: 1.2,
          ease: "power3.inOut",
          onComplete: () => {
            if (killed) return;
            gsap.set(mainEl, { clearProps: "transform,willChange" });
            setTimeout(() => ScrollTrigger.refresh(), 300);
          },
        },
        "<"
      );

    return () => {
      killed = true;
      tl.kill();
    };
  }, [isMounted, loading]);

  useEffect(() => {
    if (!isMounted || !showMain) return;
    if (!noteJoinRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        noteJoinRef.current,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: noteJoinRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
            once: true,
          },
        }
      );
    }, noteJoinRef);

    return () => ctx.revert();
  }, [isMounted, showMain]);

  useEffect(() => {
    if (!isMounted || !showMain) return;
    const items = document.querySelectorAll(".note-user-fp");
    if (items.length === 0) return;
    gsap.fromTo(
      items,
      { opacity: 0, scale: 0.5 },
      { opacity: 1, scale: 1, duration: 0.6, stagger: 0.08, ease: "back.out(1.7)" }
    );
  }, [isMounted, showMain, registeredUsers]);

  useEffect(() => {
    if (!activeNoteUser) return;
    const el = document.querySelector(`.note-user-name-${activeNoteUser}`);
    if (el) {
      gsap.fromTo(
        el,
        { opacity: 0, x: -30, scale: 0.8 },
        { opacity: 1, x: 0, scale: 1, duration: 0.5, ease: "back.out(1.7)" }
      );
    }
  }, [activeNoteUser]);

  useEffect(() => {
    if (!sayHeyOpen) return;
    const el = document.getElementById("sayhey-section");
    if (el) {
      setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    }
  }, [sayHeyOpen]);

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
          <span style={{ fontSize: "100px", fontWeight: 400, color: BLUE, fontFamily: FONT_FAMILY, letterSpacing: "-0.03em" }}>
            Menuru
          </span>
          <span
            style={{
              fontSize: "50px",
              fontWeight: 600,
              color: BLACK,
              fontFamily: FONT_FAMILY,
              letterSpacing: "-0.02em",
              display: "inline-block",
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
        <link rel="manifest" href="/manifest.json" />
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

      <Script
        id="gtm-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-MRD7N2G4');`,
        }}
      />

      <Script
        id="adsbygoogle-init"
        async
        strategy="afterInteractive"
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6198767676395468"
        crossOrigin="anonymous"
      />

      <Script
        id="gtag-js"
        async
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=G-GEE1R59BDE"
      />
      <Script
        id="gtag-config"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-GEE1R59BDE');
          `,
        }}
      />

      <noscript>
        <iframe
          src="https://www.googletagmanager.com/ns.html?id=GTM-MRD7N2G4"
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
        />
      </noscript>

      <div
        ref={wrapperRef}
        style={{
          position: "relative",
          width: "100%",
          minHeight: "100vh",
          overflow: "hidden",
          backgroundColor: WHITE,
        }}
      >
        <div
          ref={preloaderRef}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: WHITE,
            zIndex: 9999,
            fontFamily: FONT_FAMILY,
            overflow: "hidden",
            willChange: "transform",
          }}
        >
          <span
            ref={counterRef}
            style={{
              position: "absolute",
              top: "10px",
              right: "40px",
              fontSize: "400px",
              fontWeight: 400,
              color: BLUE,
              fontFamily: FONT_FAMILY,
              letterSpacing: "-0.04em",
              lineHeight: 0.9,
              display: "inline-block",
              willChange: "transform, opacity",
              userSelect: "none",
              pointerEvents: "none",
            }}
          >
            01
          </span>

          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "40px", overflow: "hidden" }}>
              <span
                style={{
                  fontSize: "100px",
                  fontWeight: 400,
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
        </div>

        <div
          ref={mainPageRef}
          style={{
            position: "relative",
            width: "100%",
            minHeight: "100vh",
            backgroundColor: WHITE,
            margin: 0,
            padding: 0,
            fontFamily: FONT_FAMILY,
            overflow: "visible",
            display: "flex",
            flexDirection: "column",
            willChange: "transform",
          }}
        >
          <LeftNavbar shifted={navbarShifted} />
          <RightNavbar
            user={user}
            auth={auth}
            db={db}
            onSayHeyToggle={() => setSayHeyOpen((prev) => !prev)}
            sayHeyOpen={sayHeyOpen}
            sayHeyUnreadCount={sayHeyUnreadCount}
          />
          <CookieConsentPopup user={user} db={db} isMounted={isMounted} />

          {/* ===== HERO "MENURU" BESAR (static, no GSAP, di bawah navbar) ===== */}
          <HeroMenuruTitle />

          {/* ===== BRAND IDENTITIES & CAMPAIGNS (di bawah Menuru besar) ===== */}
          <div
            style={{
              width: "100%",
              padding: "0 40px",
              maxWidth: "1600px",
              margin: "0 auto",
              marginTop: "40px",
              position: "relative",
              zIndex: 2,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "60px",
                flexWrap: "wrap",
              }}
            >
              <div style={{ flexShrink: 0, textAlign: "left" }}>
                <div
                  style={{
                    fontFamily: FONT_FAMILY,
                    fontSize: "90px",
                    fontWeight: 700,
                    color: BLUE,
                    letterSpacing: "-0.04em",
                    lineHeight: 1.05,
                    whiteSpace: "nowrap",
                  }}
                >
                  Brand Identities
                </div>
                <div
                  style={{
                    fontFamily: FONT_FAMILY,
                    fontSize: "90px",
                    fontWeight: 700,
                    color: BLUE,
                    letterSpacing: "-0.04em",
                    lineHeight: 1.05,
                    whiteSpace: "nowrap",
                  }}
                >
                  &amp; Campaigns
                </div>
              </div>

              <div
                style={{
                  flex: "1 1 0",
                  minWidth: "300px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  textAlign: "left",
                  paddingTop: "20px",
                }}
              >
                <div
                  style={{
                    fontFamily: FONT_FAMILY,
                    fontSize: "25px",
                    fontWeight: 600,
                    color: BLACK,
                    letterSpacing: "-0.01em",
                    lineHeight: 1.35,
                    maxWidth: "700px",
                  }}
                >
                  Menuru Studio is a non-profit brand born from the founder&apos;s vision to assist the public at no cost
                </div>
                <div
                  style={{
                    fontFamily: FONT_FAMILY,
                    fontSize: "25px",
                    fontWeight: 600,
                    color: BLACK,
                    letterSpacing: "-0.01em",
                    lineHeight: 1.35,
                    maxWidth: "700px",
                    marginTop: "4px",
                  }}
                >
                  Since our brand was established, we have helped people find exceptional solutions for their activities and created memorable features
                </div>
              </div>
            </div>
          </div>

          {sayHeyOpen && (
            <div
              id="sayhey-section"
              style={{
                width: "100%",
                padding: "0 40px",
                maxWidth: "1600px",
                margin: "40px auto 0 auto",
                marginBottom: "40px",
                position: "relative",
                zIndex: 2,
              }}
            >
              <SayHeySection
                user={user}
                db={db}
                isAdmin={isAdmin}
                onUnreadCountChange={setSayHeyUnreadCount}
              />
            </div>
          )}

          <div
            style={{
              padding: "0 40px",
              maxWidth: "1600px",
              margin: "0 auto",
              width: "100%",
              position: "relative",
              zIndex: 2,
              marginTop: "80px",
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

            <div style={{ width: "100%", position: "relative", zIndex: 2, marginBottom: "40px" }}>
              <div style={{ display: "flex", alignItems: "center", width: "100%", flexWrap: "wrap" }}>
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
                <div
                  style={{
                    marginLeft: "auto",
                    marginRight: "360px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: "8px",
                    marginTop: "-45px",
                  }}
                >
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
                      whiteSpace: "nowrap",
                    }}
                  >
                    Trust
                  </span>
                  <p
                    style={{
                      fontFamily: FONT_FAMILY,
                      fontSize: "18px",
                      fontWeight: 600,
                      color: BLUE,
                      letterSpacing: "-0.01em",
                      lineHeight: 1.4,
                      margin: 0,
                      maxWidth: "420px",
                      textAlign: "left",
                    }}
                  >
                    Notes for the next era of technology system
                  </p>
                </div>
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
                  <path d="M7 17L17 7M17 7H8M17 7V16" stroke={WHITE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            <div
              style={{ position: "relative", width: "100%", height: "420px", marginBottom: "60px", zIndex: 1 }}
              onMouseEnter={() => setNoteHovered(true)}
              onMouseLeave={() => setNoteHovered(false)}
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
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src="/images/plj.JPG"
                  alt="Note"
                  style={{
                    maxWidth: "95%",
                    maxHeight: "95%",
                    width: "auto",
                    height: "auto",
                    objectFit: "contain",
                    mixBlendMode: "screen",
                    display: "block",
                    opacity: noteHovered ? 0.35 : 1,
                    transition: "opacity 0.4s ease",
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    overflow: "hidden",
                    pointerEvents: "none",
                    opacity: noteHovered ? 1 : 0,
                    transition: "opacity 0.4s ease",
                  }}
                >
                  <div
                    style={{
                      display: "inline-flex",
                      whiteSpace: "nowrap",
                      animation: noteHovered ? "comingsoon-marquee 8s linear infinite" : "none",
                      fontFamily: FONT_FAMILY,
                      fontSize: "140px",
                      fontWeight: 800,
                      color: WHITE,
                      letterSpacing: "-0.04em",
                      textTransform: "uppercase",
                      lineHeight: 1,
                    }}
                  >
                    <span style={{ paddingRight: "80px" }}>Comingsoon</span>
                    <span style={{ paddingRight: "80px" }}>Comingsoon</span>
                    <span style={{ paddingRight: "80px" }}>Comingsoon</span>
                    <span style={{ paddingRight: "80px" }}>Comingsoon</span>
                  </div>
                </div>
              </div>
            </div>

            <div
              ref={noteJoinRef}
              style={{
                width: "100%",
                marginTop: "0px",
                marginBottom: "60px",
                paddingLeft: "260px",
                paddingRight: "360px",
                fontFamily: FONT_FAMILY,
                position: "relative",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "24px",
                  marginBottom: "24px",
                  flexWrap: "wrap",
                }}
              >
                <h3
                  style={{
                    fontFamily: FONT_FAMILY,
                    fontSize: "35px",
                    fontWeight: 700,
                    color: BLUE,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.1,
                    margin: 0,
                  }}
                >
                  Bergabung bersama kami di fitur Note
                </h3>
                <button
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 18px",
                    backgroundColor: BLUE,
                    color: WHITE,
                    border: "none",
                    borderRadius: "10px",
                    fontFamily: FONT_FAMILY,
                    fontSize: "35px",
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.1,
                    cursor: "pointer",
                    transition: "background-color 0.25s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = BLACK;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = BLUE;
                  }}
                >
                  <span>Bergabung</span>
                  <NorthEastArrow size={32} color={WHITE} />
                </button>
              </div>

              <div
                style={{
                  width: "100%",
                  backgroundColor: BLUE,
                  borderRadius: "12px",
                  padding: "16px 24px",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  flexWrap: "wrap",
                  minHeight: "70px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  {registeredUsers.length === 0 && (
                    <span style={{ fontSize: "35px", fontWeight: 700, color: WHITE, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                      Belum ada yang bergabung
                    </span>
                  )}

                  {registeredUsers.map((n) => {
                    const isCurrentUser = user && n.userId === user.uid;
                    return (
                      <div
                        key={n.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        {isCurrentUser && (
                          <>
                            <span
                              style={{
                                fontSize: "35px",
                                fontWeight: 600,
                                color: WHITE,
                                letterSpacing: "-0.02em",
                                lineHeight: 1.1,
                              }}
                            >
                              from
                            </span>
                            <span
                              style={{
                                fontSize: "35px",
                                fontWeight: 700,
                                color: WHITE,
                                letterSpacing: "-0.02em",
                                lineHeight: 1.1,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {n.userName || n.userEmail?.split("@")[0] || "User"}
                            </span>
                          </>
                        )}

                        <div
                          className="note-user-fp"
                          onClick={() => setActiveNoteUser(activeNoteUser === n.id ? null : n.id)}
                          style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "50%",
                            overflow: "hidden",
                            backgroundColor: WHITE,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            cursor: "pointer",
                            transition: "transform 0.2s ease",
                            border: isCurrentUser ? `3px solid ${WHITE}` : "none",
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLDivElement).style.transform = "scale(1.15)";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLDivElement).style.transform = "scale(1)";
                          }}
                        >
                          {n.userPhoto ? (
                            <img
                              src={n.userPhoto}
                              alt="User"
                              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <span style={{ fontSize: "20px", fontWeight: 800, color: BLUE }}>
                              {(n.userName || n.userEmail || "U").charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>

                        {isCurrentUser && (
                          <span
                            style={{
                              fontSize: "35px",
                              fontWeight: 700,
                              color: WHITE,
                              letterSpacing: "-0.02em",
                              lineHeight: 1.1,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {hasSubmittedNote ? "✓ Sudah bergabung" : "Belum bergabung"}
                          </span>
                        )}

                        {!isCurrentUser && activeNoteUser === n.id && (
                          <span
                            className={`note-user-name-${n.id}`}
                            style={{
                              fontSize: "35px",
                              fontWeight: 700,
                              color: WHITE,
                              letterSpacing: "-0.02em",
                              lineHeight: 1.1,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {n.userName || n.userEmail?.split("@")[0] || "User"}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div style={{ position: "relative", zIndex: 1, flex: "1 0 auto", backgroundColor: WHITE }}>
            <div style={{ padding: "0 40px", maxWidth: "1600px", margin: "0 auto", width: "100%" }}>
              <LiveChatAgent
                user={user}
                isAdmin={isAdmin}
                db={db}
                auth={auth}
                onOpenAppealChat={(ticket: AppealTicket) => {
                  setAdminAppealTicket(ticket);
                  setShowAdminAppealSection(true);
                }}
                onOpenBannedAppealChat={(ticket: AppealTicket) => {
                  setBannedAppealTicket(ticket);
                  setShowBannedAppealSection(true);
                }}
              />

              {isAdmin && showAdminAppealSection && adminAppealTicket && (
                <div style={{ marginTop: "30px", height: "600px" }}>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 800,
                      color: BLUE,
                      fontFamily: FONT_FAMILY,
                      letterSpacing: "0.5px",
                      textTransform: "uppercase",
                      marginBottom: "12px",
                    }}
                  >
                    Chat Ajukan Banding
                  </div>
                  <AppealChatRoom
                    user={user}
                    isAdmin={true}
                    db={db}
                    appealTicket={adminAppealTicket}
                    onClose={() => {
                      setShowAdminAppealSection(false);
                      setAdminAppealTicket(null);
                    }}
                  />
                </div>
              )}

              {!isAdmin && showBannedAppealSection && bannedAppealTicket && (
                <div style={{ marginTop: "30px", height: "600px" }}>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 800,
                      color: BLUE,
                      fontFamily: FONT_FAMILY,
                      letterSpacing: "0.5px",
                      textTransform: "uppercase",
                      marginBottom: "12px",
                    }}
                  >
                    Chat Ajukan Banding
                  </div>
                  <AppealChatRoom
                    user={user}
                    isAdmin={false}
                    db={db}
                    appealTicket={bannedAppealTicket}
                    onClose={() => {
                      setShowBannedAppealSection(false);
                      setBannedAppealTicket(null);
                    }}
                  />
                </div>
              )}
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
                <img src="/images/p0l.jpg" alt="" style={{ width: "100%", height: "auto", display: "block", objectFit: "cover" }} />
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
                        else if (link === "Note") linkHref = "/notfounds";
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
          </div>
        </div>
      </div>

      <ServiceWorkerRegister />
      <PWAInstallPrompt />

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
        @keyframes comingsoon-marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        @keyframes blinking-dot {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.3;
            transform: scale(0.75);
          }
        }
        @keyframes badge-pop {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
