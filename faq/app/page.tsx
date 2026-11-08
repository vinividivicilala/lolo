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

// ===== GEOLOCATION VIA IP =====
async function getPublicIPViaWebRTC(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  if (!window.RTCPeerConnection) return null;
  return new Promise((resolve) => {
    try {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      const ips: string[] = [];
      let resolved = false;

      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          try { pc.close(); } catch (e) {}
          const publicIp = ips.find(
            (ip) =>
              /^\d+\.\d+\.\d+\.\d+$/.test(ip) &&
              !/^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|127\.|169\.254\.)/.test(ip)
          );
          resolve(publicIp || ips[0] || null);
        }
      }, 2500);

      pc.onicecandidate = (event) => {
        if (!event.candidate) return;
        const cand = event.candidate.candidate;
        const match = cand.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/);
        if (match) {
          const ip = match[1];
          if (!ips.includes(ip)) ips.push(ip);
        }
      };

      pc.createDataChannel("");
      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .catch(() => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeout);
            try { pc.close(); } catch (e) {}
            resolve(null);
          }
        });
    } catch (e) {
      resolve(null);
    }
  });
}

function getTimezoneCity(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    const parts = tz.split("/");
    const city = parts[parts.length - 1] || "";
    if (!city) return "Indonesia";
    return city
      .replace(/_/g, " ")
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  } catch {
    return "Indonesia";
  }
}

async function detectLocationName(): Promise<string> {
  try {
    const ip = await getPublicIPViaWebRTC();
    const tzCity = getTimezoneCity();

    if (tzCity && tzCity !== "Indonesia") {
      return `${tzCity}, Indonesia`;
    }

    if (ip) {
      return "Indonesia";
    }

    return "Indonesia";
  } catch (e) {
    return "Indonesia";
  }
}

async function saveUserLocation(user: any) {
  if (!db) return;
  try {
    const locName = await detectLocationName();
    const locationId = user?.uid || `anon_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const displayName = user?.displayName || user?.email?.split("@")[0] || "Guest";
    const now = new Date().toISOString();

    await setDoc(
      doc(db, "user_locations", locationId),
      {
        userId: user?.uid || null,
        displayName,
        locationName: locName,
        lastSeen: serverTimestamp(),
        lastSeenIso: now,
        email: user?.email || "",
        photoURL: user?.photoURL || "",
      },
      { merge: true }
    );
  } catch (e) {
    console.error("saveUserLocation error:", e);
  }
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

// ===== DETEKSI KENDALA (untuk tag Admin otomatis) =====
const KENDALA_KEYWORDS = [
  "kendala", "masalah", "error", "bug", "tidak bisa", "gagal", "rusak",
  "bermasalah", "terkendala", "help", "tolong", "bantuan", "issue",
  "crash", "not working", "tidak berfungsi", "stuck", "macet", "lemot",
  "lambat", "susah", "sulit", "bingung", "tidak jelas", "tidak paham",
  "butuh bantuan", "mohon bantuan", "problem", "trouble", "fail", "failed",
];

function containsKendala(text: string): boolean {
  const lowerText = text.toLowerCase();
  return KENDALA_KEYWORDS.some((keyword) => lowerText.includes(keyword));
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
const MINT = "#00E3AA";
const RED = "#DC2626";

// ===== NOTES CATEGORIES =====
const NOTES_CATEGORIES = [
  "Makanan",
  "Minuman",
  "Coding",
  "Teknologi",
  "Pendidikan",
  "Kesehatan",
  "Olahraga",
  "Seni",
  "Musik",
  "Bisnis",
  "Keuangan",
  "Traveling",
  "Otomotif",
  "Game",
  "Fashion",
];

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

const AgentIcon = ({ size = 20, color = "#ffffff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 21V19C5 16.7909 6.79086 15 9 15H15C17.2091 15 19 16.7909 19 19V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 3L18 5L16 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18 5H14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

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

const SayHeyIcon = ({ size = 22, color = "#000000" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 11.5C21 16.1944 16.9706 20 12 20C10.8452 20 9.74371 19.7964 8.73507 19.4276L4 21L5.45177 16.7441C4.53668 15.3762 4 13.7581 4 12C4 7.30558 8.02944 3.5 12 3.5C16.9706 3.5 21 7.30558 21 11.5Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="9" cy="11.5" r="1" fill={color} />
    <circle cx="12" cy="11.5" r="1" fill={color} />
    <circle cx="15" cy="11.5" r="1" fill={color} />
  </svg>
);

const InviteIcon = ({ size = 20, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M16 21V19C16 16.7909 14.2091 15 12 15H5C2.79086 15 1 16.7909 1 19V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="8.5" cy="7" r="4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M20 8V14" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M23 11H17" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const AdminTagIcon = ({ size = 14, color = "#ffffff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2L4 5V11C4 16 8 20 12 22C16 20 20 16 20 11V5L12 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 12L11 14L15 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

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
  category?: string;
  hasKendala?: boolean;
  adminTagged?: boolean;
  createdAt: any;
}

interface InviteUser {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
}

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

// ===== HERO MENURU TITLE =====
const HeroMenuruTitle = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    if (!titleRef.current) return;

    const title = titleRef.current;
    const ctx = gsap.context(() => {
      const split = new SplitText(title, { type: "chars", charsClass: "hero-menuru-char" });

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

      return () => {
        if (split) split.revert();
      };
    }, containerRef);

    return () => ctx.revert();
  }, [isMounted]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        paddingTop: "20px",
        paddingBottom: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        backgroundColor: WHITE,
      }}
    >
      <h1
        ref={titleRef}
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
          display: "inline-block",
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

// ===== NAVBAR BUTTON (ENGLISH CONTENT) =====
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

// ===== FIXED NAVBAR WITH BLUE BANNER & TEXT =====
const FixedNavbar = ({ shifted, user, auth, db, userDisplayName, router, onSayHeyToggle, sayHeyOpen, sayHeyUnreadCount }: any) => {
  const displayName = user?.displayName || user?.email?.split("@")[0] || "User";
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
        gap: "8px",
        padding: "8px 14px",
        backgroundColor: sayHeyOpen ? BLACK : LIME,
        borderRadius: "8px",
        border: `1px solid ${sayHeyOpen ? BLACK : LIME}`,
        boxShadow: sayHeyOpen ? "0 4px 12px rgba(0,0,0,0.25)" : "0 4px 12px rgba(227,251,150,0.35)",
        cursor: "pointer",
        transition: "all 0.2s ease",
      }}
    >
      <SayHeyIcon size={16} color={sayHeyOpen ? WHITE : BLACK} />
      <span
        style={{
          color: sayHeyOpen ? WHITE : BLACK,
          fontSize: "13px",
          fontWeight: 700,
          letterSpacing: "0.02em",
          fontFamily: FONT_FAMILY,
          whiteSpace: "nowrap",
        }}
      >
        Say Hey
      </span>

      {sayHeyUnreadCount > 0 && !sayHeyOpen && (
        <span
          style={{
            position: "absolute",
            top: "-6px",
            right: "-6px",
            minWidth: "18px",
            height: "18px",
            padding: "0 4px",
            borderRadius: "9px",
            backgroundColor: BLUE,
            color: WHITE,
            fontSize: "10px",
            fontWeight: 800,
            fontFamily: FONT_FAMILY,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: `2px solid ${WHITE}`,
          }}
        >
          {sayHeyUnreadCount > 99 ? "99+" : sayHeyUnreadCount}
        </span>
      )}
    </button>
  );

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9000,
        backgroundColor: BLUE,
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 4px 20px rgba(13,60,252,0.25)",
      }}
    >
      {/* Banner Biru Atas dengan Teks Request */}
      <div
        style={{
          width: "100%",
          padding: "8px 24px",
          backgroundColor: BLUE,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT_FAMILY,
          fontSize: "13px",
          fontWeight: 600,
          color: WHITE,
          textAlign: "center",
          borderBottom: "1px solid rgba(255,255,255,0.15)",
          letterSpacing: "0.02em",
        }}
      >
        Website this is build the develope&nbsp;
        <a
          href="https://farid-ardiansyah.netlify.app/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: WHITE,
            textDecoration: "underline",
            fontWeight: 700,
            marginLeft: "4px",
          }}
        >
          Farid Ardiansyah
        </a>
      </div>

      {/* Navbar Utama */}
      <div
        style={{
          height: "80px",
          backgroundColor: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 40px",
          fontFamily: FONT_FAMILY,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Link
            href="/"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginRight: "14px",
            }}
          >
            <img
              src="/images/nop.jpg"
              alt="Menuru"
              style={{
                height: "44px",
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
                fontSize: "38px",
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

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <SayHeyButton />

          {!user ? (
            <Link
              href="/signin"
              style={{
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 14px",
                backgroundColor: BLUE,
                borderRadius: "8px",
                border: `1px solid ${BLUE}`,
                boxShadow: "0 4px 12px rgba(13,60,252,0.25)",
                cursor: "pointer",
              }}
            >
              <PeopleIcon size={18} color="#ffffff" />
              <span
                style={{
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: 700,
                  letterSpacing: "0.02em",
                  fontFamily: FONT_FAMILY,
                  whiteSpace: "nowrap",
                }}
              >
                Sign In
              </span>
            </Link>
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 12px",
                  backgroundColor: BLUE,
                  borderRadius: "8px",
                  border: `1px solid ${BLUE}`,
                  boxShadow: "0 4px 12px rgba(13,60,252,0.25)",
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
                  {photoURL ? (
                    <img
                      src={photoURL}
                      alt={displayName}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span style={{ fontSize: "13px", fontWeight: 800, color: BLUE }}>
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <span
                  style={{
                    color: WHITE,
                    fontSize: "12px",
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
                  gap: "6px",
                  padding: "8px 14px",
                  backgroundColor: BLUE,
                  color: WHITE,
                  borderRadius: "8px",
                  border: `1px solid ${BLUE}`,
                  boxShadow: "0 4px 12px rgba(13,60,252,0.25)",
                  fontFamily: FONT_FAMILY,
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Logout
                <LogoutIcon size={14} color={WHITE} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ===== SAY HEY SECTION (GAYA DESIGN WARTZ.TXT) =====
function SayHeySection({
  user,
  db,
  isAdmin,
  onUnreadCountChange,
}: {
  user: any;
  db: any;
  isAdmin: boolean;
  onUnreadCountChange?: (count: number) => void;
}) {
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any | null>(null);
  const [ticket, setTicket] = useState<SayHeyTicket | null>(null);
  const [messages, setMessages] = useState<SayHeyMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [encryptionReady, setEncryptionReady] = useState(false);

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
        });
      });
      setContacts(list);
    });
    return () => unsub();
  }, [db, user, isOwner]);

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
        userName: isOwner ? contact.displayName : user.displayName,
        userEmail: isOwner ? contact.email : user.email,
        userPhoto: isOwner ? contact.photoURL : user.photoURL,
        ownerId: isOwner ? user.uid : contact.uid,
        ownerName: isOwner ? user.displayName : contact.displayName,
        ownerEmail: isOwner ? user.email : contact.email,
        ownerPhoto: isOwner ? user.photoURL : contact.photoURL,
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
      const initialMessage = `Hey!`;
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

  const sendMessage = async () => {
    if (!db || !ticket || !messageText.trim() || !user || !encryptionReady) return;
    try {
      const ticketRef = doc(db, "sayhey_tickets", ticket.id);
      const senderName = isAdmin ? `${OWNER_NAME} (Admin)` : user.displayName || user.email || "User";
      const encryptedMessage = await encryptMessage(messageText.trim());
      await addDoc(collection(db, "sayhey_tickets", ticket.id, "messages"), {
        senderId: user.uid,
        senderName,
        text: encryptedMessage,
        timestamp: serverTimestamp(),
        read: false,
        isEncrypted: true,
        deliveryStatus: "sent",
        isAdmin,
      });
      const updatePayload: any = {
        lastMessage: messageText.trim(),
        lastMessageTime: serverTimestamp(),
        lastMessageSender: senderName,
      };
      if (isOwner) updatePayload.userUnreadCount = (ticket.userUnreadCount || 0) + 1;
      else updatePayload.ownerUnreadCount = (ticket.ownerUnreadCount || 0) + 1;
      await updateDoc(ticketRef, updatePayload);
      setMessageText("");
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    } catch (error) {
      console.error(error);
    }
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
          Please sign in to your account to start a real-time conversation.
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
        padding: "20px",
        fontFamily: FONT_FAMILY,
        color: WHITE,
        marginBottom: "40px",
        minHeight: "600px",
      }}
    >
      <div style={{ marginBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <SayHeyIcon size={32} color={WHITE} />
          <h3
            style={{
              fontSize: "32px",
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
      </div>
      <div style={{ display: "flex", gap: "12px", minHeight: "700px", flexWrap: "wrap" }}>
        <div
          style={{
            width: "340px",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            backgroundColor: WHITE,
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
          }}
        >
          <div
            style={{
              padding: "10px 12px",
              backgroundColor: BLUE,
              color: WHITE,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontSize: "13px",
                fontWeight: 800,
                color: WHITE,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                fontFamily: FONT_FAMILY,
              }}
            >
              Kontak
            </span>
            <span
              style={{
                fontSize: "10px",
                color: BLUE,
                padding: "2px 7px",
                borderRadius: "8px",
                backgroundColor: WHITE,
                fontWeight: 800,
              }}
            >
              {contacts.length}
            </span>
          </div>
          <div style={{ flex: 1, overflowY: "auto", backgroundColor: WHITE, padding: "8px 10px" }}>
            {contacts.length === 0 ? (
              <div
                style={{
                  padding: "14px",
                  textAlign: "center",
                  fontSize: "11px",
                  color: BLUE,
                  fontFamily: FONT_FAMILY,
                  opacity: 0.7,
                }}
              >
                {isOwner ? "No users online." : "Owner is currently offline."}
              </div>
            ) : (
              contacts.map((c) => (
                <div
                  key={c.uid}
                  onClick={() => openChatWith(c)}
                  style={{
                    padding: "8px 6px",
                    borderBottom: `1px solid rgba(0,0,0,0.05)`,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    backgroundColor: selectedContact?.uid === c.uid ? "rgba(13,60,252,0.08)" : "transparent",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      overflow: "hidden",
                      backgroundColor: BLUE,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {c.photoURL ? (
                      <img src={c.photoURL} alt={c.displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <span style={{ fontSize: "14px", fontWeight: 800, color: WHITE }}>
                        {c.displayName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        marginBottom: "2px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: 700,
                          color: BLUE,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          fontFamily: FONT_FAMILY,
                        }}
                      >
                        {c.displayName}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: BLUE,
                        fontFamily: FONT_FAMILY,
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontWeight: 600,
                        opacity: 0.85,
                      }}
                    >
                      <BlinkingDot size={6} color={BLUE} />
                      {c.online ? "Online" : "Offline"}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div
          style={{
            flex: 1,
            minWidth: "300px",
            backgroundColor: WHITE,
            borderRadius: "12px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            height: "700px",
            color: BLACK,
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
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
                fontSize: "14px",
                fontFamily: FONT_FAMILY,
                padding: "20px",
                textAlign: "center",
              }}
            >
              <SayHeyIcon size={40} color="#ccc" />
              <span>{isOwner ? "Pilih user online untuk mulai chat" : "Pilih owner untuk mulai chat"}</span>
            </div>
          ) : (
            <>
              <div
                style={{
                  padding: "12px 16px",
                  backgroundColor: BLUE,
                  color: WHITE,
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    overflow: "hidden",
                    backgroundColor: WHITE,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {selectedContact.photoURL ? (
                    <img src={selectedContact.photoURL} alt={selectedContact.displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ fontSize: "14px", fontWeight: 800, color: BLUE }}>
                      {(selectedContact.displayName || "U").charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 800,
                    color: WHITE,
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  {selectedContact.displayName}
                </div>
              </div>

              <div
                ref={chatContainerRef}
                className="chat-messages-container"
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  minHeight: 0,
                  backgroundColor: WHITE,
                }}
              >
                {messages.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      color: "#999",
                      fontSize: "13px",
                      padding: "30px 0",
                      fontFamily: FONT_FAMILY,
                    }}
                  >
                    No messages yet. Say hey!
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMine = msg.senderId === user?.uid;
                    const msgIsAdmin = msg.isAdmin || msg.senderName?.includes("(Admin)");
                    return (
                      <div key={msg.id || idx} style={{ alignSelf: isMine ? "flex-end" : "flex-start", maxWidth: "75%" }}>
                        <div
                          style={{
                            padding: "10px 14px",
                            borderRadius: "10px",
                            backgroundColor: msgIsAdmin ? "#FEF3C7" : isMine ? BLUE : "#ffffff",
                            color: msgIsAdmin ? BLACK : isMine ? WHITE : BLACK,
                            fontSize: "13px",
                            fontFamily: FONT_FAMILY,
                            wordBreak: "break-word",
                            border: msgIsAdmin ? `1.5px solid #F59E0B` : isMine ? "none" : "1px solid rgba(0,0,0,0.06)",
                          }}
                        >
                          {!isMine && (
                            <div
                              style={{
                                fontSize: "11px",
                                fontWeight: 700,
                                color: msgIsAdmin ? "#92400E" : BLUE,
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
                              gap: "5px",
                              marginTop: "4px",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "9px",
                                color: msgIsAdmin ? "#92400E" : isMine ? "rgba(255,255,255,0.85)" : "#999",
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
              </div>

              <div
                style={{
                  padding: "12px 16px",
                  borderTop: "1px solid rgba(0,0,0,0.06)",
                  display: "flex",
                  gap: "8px",
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
                  placeholder="Type your message..."
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    border: "1px solid rgba(0,0,0,0.1)",
                    borderRadius: "8px",
                    fontSize: "13px",
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
                    padding: "10px 20px",
                    backgroundColor: messageText.trim() ? BLUE : "#ccc",
                    color: WHITE,
                    border: "none",
                    borderRadius: "8px",
                    cursor: messageText.trim() ? "pointer" : "not-allowed",
                    fontFamily: FONT_FAMILY,
                    fontSize: "12px",
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
}

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
  const [locationText, setLocationText] = useState<string>("");
  const [showNotesSection, setShowNotesSection] = useState(false);
  const [notes, setNotes] = useState<NoteEntry[]>([]);
  const [inviteUsers, setInviteUsers] = useState<InviteUser[]>([]);
  const [showInvitePanel, setShowInvitePanel] = useState(false);
  const [inviteSearch, setInviteSearch] = useState("");
  const [invitedUsers, setInvitedUsers] = useState<{ [uid: string]: boolean }>({});
  const [inviteToast, setInviteToast] = useState<string | null>(null);

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
  const notesSectionRef = useRef<HTMLDivElement>(null);

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
          category: data.category || "",
          createdAt: data.createdAt || data.lastSeen || null,
        } as NoteEntry);
      });
      setRegisteredUsers(list);
    });
    return () => unsub();
  }, [db, isMounted]);

  // ===== LOAD INVITE USERS (semua akun user dari Firebase) =====
  useEffect(() => {
    if (!db || !isMounted) return;
    const q = query(collection(db, "users"), orderBy("lastSeen", "desc"), limit(200));
    const unsub = onSnapshot(q, (snapshot: any) => {
      const list: InviteUser[] = [];
      snapshot.forEach((docSnap: any) => {
        const data = docSnap.data();
        list.push({
          uid: docSnap.id,
          displayName: data.displayName || data.name || data.email?.split("@")[0] || "User",
          email: data.email || "",
          photoURL: data.photoURL || "",
        });
      });
      setInviteUsers(list);
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

  // ===== NOTES FROM FIREBASE =====
  useEffect(() => {
    if (!db || !isMounted) return;
    const q = query(collection(db, "notes"), orderBy("createdAt", "desc"), limit(100));
    const unsub = onSnapshot(q, (snapshot: any) => {
      const list: NoteEntry[] = [];
      snapshot.forEach((docSnap: any) => {
        const data = docSnap.data();
        const text = data.text || "";
        const hasKendala = containsKendala(text);
        list.push({
          id: docSnap.id,
          userId: data.userId || docSnap.id,
          userName: data.userName || data.userEmail?.split("@")[0] || "User",
          userEmail: data.userEmail || "",
          userPhoto: data.userPhoto || "",
          text: text,
          category: data.category || "",
          hasKendala: hasKendala,
          adminTagged: data.adminTagged || hasKendala,
          createdAt: data.createdAt || null,
        } as NoteEntry);
      });
      setNotes(list);
    });
    return () => unsub();
  }, [db, isMounted]);

  // ===== LOCATION TRACKING =====
  useEffect(() => {
    if (!db || !isMounted) return;
    saveUserLocation(user);
    const t = setTimeout(() => saveUserLocation(user), 3000);

    const q = query(
      collection(db, "user_locations"),
      orderBy("lastSeen", "desc"),
      limit(1)
    );
    const unsub = onSnapshot(q, (snapshot: any) => {
      if (snapshot.empty) {
        setLocationText("Memuat lokasi...");
        return;
      }
      const docSnap = snapshot.docs[0];
      const data = docSnap.data();
      const loc = data.locationName || "Indonesia";
      setLocationText(loc);
    });

    return () => {
      clearTimeout(t);
      unsub();
    };
  }, [db, isMounted, user]);

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

  // ===== ANIMASI NOTES SECTION =====
  useEffect(() => {
    if (!showNotesSection || !notesSectionRef.current) return;
    const el = notesSectionRef.current;
    gsap.fromTo(
      el,
      { opacity: 0, y: 80 },
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
    );
  }, [showNotesSection]);

  // ===== HANDLE INVITE USER =====
  const handleInviteUser = async (inviteUser: InviteUser) => {
    if (!user) {
      setInviteToast("Silakan sign in terlebih dahulu untuk mengundang");
      setTimeout(() => setInviteToast(null), 2500);
      return;
    }
    try {
      const inviteUrl = `${window.location.origin}${window.location.pathname}?invite=${inviteUser.uid}#notes-invite`;
      if (navigator.share) {
        await navigator.share({
          title: "Menuru Notes Invitation",
          text: `Hai ${inviteUser.displayName}, bergabunglah bersama kami di fitur Note Menuru!`,
          url: inviteUrl,
        });
      } else {
        await navigator.clipboard.writeText(inviteUrl);
      }
      setInvitedUsers((prev) => ({ ...prev, [inviteUser.uid]: true }));
      setInviteToast(`Undangan terkirim ke ${inviteUser.displayName}`);
      setTimeout(() => setInviteToast(null), 2500);
    } catch (error) {
      console.error("Invite error:", error);
      try {
        const inviteUrl = `${window.location.origin}${window.location.pathname}?invite=${inviteUser.uid}#notes-invite`;
        await navigator.clipboard.writeText(inviteUrl);
        setInvitedUsers((prev) => ({ ...prev, [inviteUser.uid]: true }));
        setInviteToast(`Link undangan untuk ${inviteUser.displayName} tersalin`);
        setTimeout(() => setInviteToast(null), 2500);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const filteredInviteUsers = inviteUsers.filter((u) => {
    if (user && u.uid === user.uid) return false;
    const q = inviteSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      u.displayName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

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
          {/* ===== BLUR OVERLAY ===== */}
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "200px",
              height: "120px",
              pointerEvents: "none",
              zIndex: 8500,
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              maskImage: "linear-gradient(to right, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 100%)",
              WebkitMaskImage: "linear-gradient(to right, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 100%)",
            }}
          />
          <div
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              width: "200px",
              height: "120px",
              pointerEvents: "none",
              zIndex: 8500,
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              maskImage: "linear-gradient(to left, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 100%)",
              WebkitMaskImage: "linear-gradient(to left, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 100%)",
            }}
          />

          <FixedNavbar
            shifted={navbarShifted}
            user={user}
            auth={auth}
            db={db}
            userDisplayName={user?.displayName || ""}
            router={{}}
            onSayHeyToggle={() => setSayHeyOpen((prev) => !prev)}
            sayHeyOpen={sayHeyOpen}
            sayHeyUnreadCount={sayHeyUnreadCount}
          />

          <CookieConsentPopup user={user} db={db} isMounted={isMounted} />

          <div style={{ marginTop: "140px" }}>
            <HeroMenuruTitle />
          </div>

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
                  onClick={() => setShowNotesSection(true)}
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

            {/* ===== NOTES SECTION ===== */}
            {showNotesSection && (
              <div
                ref={notesSectionRef}
                id="notes-invite"
                style={{
                  width: "100%",
                  marginTop: "60px",
                  marginBottom: "60px",
                  fontFamily: FONT_FAMILY,
                }}
              >
                <h2
                  style={{
                    fontFamily: FONT_FAMILY,
                    fontSize: "150px",
                    fontWeight: 700,
                    color: BLUE,
                    letterSpacing: "-0.04em",
                    lineHeight: 1,
                    margin: 0,
                    marginBottom: "20px",
                    textAlign: "left",
                  }}
                >
                  Notes
                </h2>

                <p
                  style={{
                    fontFamily: FONT_FAMILY,
                    fontSize: "20px",
                    fontWeight: 500,
                    color: BLACK,
                    letterSpacing: "-0.01em",
                    lineHeight: 1.6,
                    margin: 0,
                    marginBottom: "40px",
                    maxWidth: "800px",
                    textAlign: "left",
                  }}
                >
                  Temukan catatan-catatan menarik dari komunitas Menuru. Semua catatan dikategorikan untuk memudahkan Anda menjelajahi topik yang Anda minati.
                </p>

                {/* Tombol Invite via Firebase Auth users */}
                <div style={{ marginBottom: "40px", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                  <button
                    onClick={() => setShowInvitePanel((prev) => !prev)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "12px 24px",
                      backgroundColor: BLUE,
                      color: WHITE,
                      border: "none",
                      borderRadius: "10px",
                      fontFamily: FONT_FAMILY,
                      fontSize: "18px",
                      fontWeight: 700,
                      letterSpacing: "-0.01em",
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
                    <InviteIcon size={22} color={WHITE} />
                    <span>{showInvitePanel ? "Tutup Undangan" : "Undang Orang Lain"}</span>
                  </button>
                  <span
                    style={{
                      fontFamily: FONT_FAMILY,
                      fontSize: "15px",
                      fontWeight: 500,
                      color: BLUE,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Pilih user dari Firebase untuk diundang ke Notes Menuru
                  </span>
                </div>

                {/* Invite Panel */}
                {showInvitePanel && (
                  <div
                    style={{
                      marginBottom: "40px",
                      backgroundColor: BLUE,
                      borderRadius: "16px",
                      padding: "24px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                      maxWidth: "700px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "12px",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: FONT_FAMILY,
                          fontSize: "20px",
                          fontWeight: 700,
                          color: WHITE,
                          letterSpacing: "-0.01em",
                        }}
                      >
                        Daftar User ({filteredInviteUsers.length})
                      </span>
                      <input
                        type="text"
                        value={inviteSearch}
                        onChange={(e) => setInviteSearch(e.target.value)}
                        placeholder="Cari user..."
                        style={{
                          padding: "8px 14px",
                          borderRadius: "8px",
                          border: `1.5px solid ${WHITE}`,
                          backgroundColor: WHITE,
                          color: BLUE,
                          fontFamily: FONT_FAMILY,
                          fontSize: "13px",
                          fontWeight: 600,
                          outline: "none",
                          minWidth: "200px",
                        }}
                      />
                    </div>

                    <div
                      style={{
                        maxHeight: "300px",
                        overflowY: "auto",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                    >
                      {filteredInviteUsers.length === 0 && (
                        <div
                          style={{
                            padding: "20px",
                            textAlign: "center",
                            fontFamily: FONT_FAMILY,
                            fontSize: "14px",
                            color: WHITE,
                            opacity: 0.8,
                          }}
                        >
                          Tidak ada user ditemukan
                        </div>
                      )}
                      {filteredInviteUsers.map((iu) => {
                        const isInvited = invitedUsers[iu.uid];
                        return (
                          <div
                            key={iu.uid}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                              padding: "10px 14px",
                              backgroundColor: WHITE,
                              borderRadius: "10px",
                            }}
                          >
                            <div
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%",
                                overflow: "hidden",
                                backgroundColor: BLUE,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              {iu.photoURL ? (
                                <img
                                  src={iu.photoURL}
                                  alt={iu.displayName}
                                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <span style={{ fontSize: "16px", fontWeight: 800, color: WHITE }}>
                                  {iu.displayName.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div
                                style={{
                                  fontFamily: FONT_FAMILY,
                                  fontSize: "14px",
                                  fontWeight: 700,
                                  color: BLUE,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {iu.displayName}
                              </div>
                              <div
                                style={{
                                  fontFamily: FONT_FAMILY,
                                  fontSize: "11px",
                                  fontWeight: 500,
                                  color: BLUE,
                                  opacity: 0.75,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {iu.email}
                              </div>
                            </div>
                            <button
                              onClick={() => handleInviteUser(iu)}
                              style={{
                                padding: "8px 16px",
                                backgroundColor: isInvited ? BLACK : BLUE,
                                color: WHITE,
                                border: "none",
                                borderRadius: "8px",
                                fontFamily: FONT_FAMILY,
                                fontSize: "12px",
                                fontWeight: 800,
                                letterSpacing: "0.5px",
                                cursor: "pointer",
                                textTransform: "uppercase",
                                flexShrink: 0,
                              }}
                            >
                              {isInvited ? "Invited" : "Invite"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Toast */}
                {inviteToast && (
                  <div
                    style={{
                      marginBottom: "20px",
                      padding: "12px 20px",
                      backgroundColor: BLUE,
                      color: WHITE,
                      borderRadius: "10px",
                      fontFamily: FONT_FAMILY,
                      fontSize: "14px",
                      fontWeight: 600,
                      display: "inline-block",
                    }}
                  >
                    {inviteToast}
                  </div>
                )}

                {/* Kategori - Sejajar ke Bawah */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "24px",
                    marginBottom: "50px",
                  }}
                >
                  {NOTES_CATEGORIES.map((cat) => {
                    const categoryNotes = notes.filter((n) => n.category === cat);
                    return (
                      <div
                        key={cat}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: FONT_FAMILY,
                            fontSize: "32px",
                            fontWeight: 700,
                            color: BLUE,
                            letterSpacing: "-0.02em",
                            lineHeight: 1.2,
                            cursor: "default",
                          }}
                        >
                          {cat}
                        </span>
                        {categoryNotes.length > 0 ? (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "8px",
                              paddingLeft: "20px",
                            }}
                          >
                            {categoryNotes.map((note) => (
                              <div
                                key={note.id}
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "4px",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    flexWrap: "wrap",
                                  }}
                                >
                                  <span
                                    style={{
                                      fontFamily: FONT_FAMILY,
                                      fontSize: "16px",
                                      fontWeight: 700,
                                      color: BLUE,
                                    }}
                                  >
                                    {note.userName}
                                  </span>
                                  {note.adminTagged && (
                                    <span
                                      style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "4px",
                                        padding: "3px 10px",
                                        backgroundColor: BLUE,
                                        color: WHITE,
                                        borderRadius: "4px",
                                        fontSize: "10px",
                                        fontWeight: 800,
                                        letterSpacing: "0.5px",
                                        textTransform: "uppercase",
                                        fontFamily: FONT_FAMILY,
                                      }}
                                    >
                                      <AdminTagIcon size={12} color={WHITE} />
                                      Admin
                                    </span>
                                  )}
                                </div>
                                <span
                                  style={{
                                    fontFamily: FONT_FAMILY,
                                    fontSize: "15px",
                                    fontWeight: 400,
                                    color: BLACK,
                                    lineHeight: 1.5,
                                    paddingLeft: "10px",
                                  }}
                                >
                                  {note.text}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span
                            style={{
                              fontFamily: FONT_FAMILY,
                              fontSize: "14px",
                              fontWeight: 500,
                              color: "#999",
                              paddingLeft: "20px",
                              fontStyle: "italic",
                              animation: "loading-blink 1.2s ease-in-out infinite",
                            }}
                          >
                            Memuat catatan...
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Aktivitas Terbaru */}
                <div style={{ marginTop: "40px" }}>
                  <h3
                    style={{
                      fontFamily: FONT_FAMILY,
                      fontSize: "28px",
                      fontWeight: 700,
                      color: BLUE,
                      letterSpacing: "-0.02em",
                      lineHeight: 1.2,
                      margin: 0,
                      marginBottom: "20px",
                    }}
                  >
                    Aktivitas Terbaru
                  </h3>
                  {notes.length === 0 ? (
                    <div
                      style={{
                        padding: "40px",
                        textAlign: "center",
                        color: "#999",
                        fontFamily: FONT_FAMILY,
                        fontSize: "16px",
                        fontStyle: "italic",
                        animation: "loading-blink 1.2s ease-in-out infinite",
                      }}
                    >
                      Memuat catatan...
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {notes.map((note) => (
                        <div
                          key={note.id}
                          style={{
                            padding: "16px 20px",
                            backgroundColor: BLUE,
                            borderRadius: "12px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "6px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                              flexWrap: "wrap",
                            }}
                          >
                            <span
                              style={{
                                fontFamily: FONT_FAMILY,
                                fontSize: "15px",
                                fontWeight: 700,
                                color: WHITE,
                              }}
                            >
                              {note.userName}
                            </span>
                            {note.category && (
                              <span
                                style={{
                                  fontFamily: FONT_FAMILY,
                                  fontSize: "12px",
                                  fontWeight: 700,
                                  color: BLUE,
                                  backgroundColor: WHITE,
                                  padding: "2px 10px",
                                  borderRadius: "4px",
                                  letterSpacing: "0.5px",
                                  textTransform: "uppercase",
                                }}
                              >
                                {note.category}
                              </span>
                            )}
                            {note.adminTagged && (
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  padding: "3px 10px",
                                  backgroundColor: WHITE,
                                  color: BLUE,
                                  borderRadius: "4px",
                                  fontSize: "10px",
                                  fontWeight: 800,
                                  letterSpacing: "0.5px",
                                  textTransform: "uppercase",
                                  fontFamily: FONT_FAMILY,
                                }}
                              >
                                <AdminTagIcon size={12} color={BLUE} />
                                Admin
                              </span>
                            )}
                          </div>
                          <div
                            style={{
                              fontFamily: FONT_FAMILY,
                              fontSize: "14px",
                              fontWeight: 400,
                              color: WHITE,
                              lineHeight: 1.5,
                              opacity: 0.95,
                            }}
                          >
                            {note.text}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
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

            {/* ===== FOOTER CARD SEPERTI WARTZ.TXT ===== */}
            <div
              style={{
                width: "calc(100% - 40px)",
                margin: "100px auto 20px auto",
                backgroundColor: MINT,
                borderRadius: "32px",
                padding: "60px 40px 40px 40px",
                position: "relative",
                overflow: "hidden",
                boxSizing: "border-box",
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
                        fontWeight: 700,
                        color: BLUE,
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
                                  fontWeight: 500,
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
                  borderTop: `1px solid ${BLUE}20`,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <p
                  style={{
                    fontFamily: FONT_FAMILY,
                    fontSize: "14px",
                    fontWeight: 400,
                    color: BLUE,
                    margin: 0,
                    textAlign: "center",
                    letterSpacing: "0.01em",
                    opacity: 0.8,
                  }}
                >
                  Terms and conditions apply. By using this website, you agree to our Terms of Use and Privacy Policy.
                </p>
              </div>

              <div style={{ marginTop: "40px", marginBottom: "24px", position: "relative", zIndex: 1 }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "14px 22px",
                    backgroundColor: WHITE,
                    borderRadius: "14px",
                    boxShadow: "0 6px 24px rgba(0,0,0,0.12)",
                  }}
                >
                  <span style={{ fontFamily: FONT_FAMILY, fontSize: "24px", fontWeight: 700, color: BLUE, letterSpacing: "-0.02em" }}>
                    Unduh Menuru
                  </span>
                </span>
              </div>

              <div style={{ position: "relative", zIndex: 1 }}>
                <span
                  style={{
                    fontFamily: FONT_FAMILY,
                    fontSize: "600px",
                    fontWeight: 400,
                    color: BLUE,
                    letterSpacing: "-0.05em",
                    lineHeight: "0.85",
                    display: "block",
                    textAlign: "left",
                    whiteSpace: "nowrap",
                    margin: 0,
                    padding: 0,
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
                      opacity: 0.85,
                    }}
                  >
                    2024 - 2026 Menuru. All rights reserved.
                  </span>
                </div>
              </div>
            </div>
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
        @keyframes loading-blink {
          0%, 100% {
            opacity: 0.35;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
