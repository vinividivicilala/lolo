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

let app = null;
let auth = null;
let db = null;

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
const OnlineDot = ({ color = "#22c55e", size = 8 }: { color?: string; size?: number }) => (
  <span
    style={{
      display: "inline-block",
      width: size,
      height: size,
      borderRadius: "50%",
      backgroundColor: color,
      boxShadow: `0 0 6px ${color}`,
    }}
  />
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
  isAnnouncement?: boolean;
  isBroadcast?: boolean;
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

// ===== TOUR STEP INTERFACE =====
interface TourStep {
  target: string;
  title: string;
  content: string;
  position?: "top" | "bottom" | "left" | "right";
  isLoginStep?: boolean;
}

// ===== PHYSICS MENURU TITLE COMPONENT =====
// Teks "Menuru" 450px warna biru full
// Huruf jatuh dari atas ke bawah dengan physics (slow motion dramatis)
// Setelah jatuh, huruf DIAM di posisi akhir (tidak bergerak lagi)
// Posisi akhir huruf TIDAK rata — tersebar acak
const PhysicsMenuruTitle = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(800);

  // Measure container height on mount & resize
  useEffect(() => {
    if (typeof window === "undefined") return;
    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.offsetHeight);
      }
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!containerRef.current || !textRef.current) return;
    if (containerHeight === 0) return;

    // Split text into chars
    const split = new SplitText(textRef.current, {
      type: "chars",
      charsClass: "physics-char",
    });

    const chars = split.chars;

    // Set initial state: huruf di atas container (di luar viewport), posisi acak
    // Huruf tetap terlihat (opacity 1) — akan jatuh dramatis ke bawah
    chars.forEach((char, i) => {
      gsap.set(char, {
        y: -900 - i * 60, // posisi awal di atas
        x: (i - chars.length / 2) * 60 + (Math.random() - 0.5) * 250,
        rotation: (Math.random() - 0.5) * 120, // rotasi acak
        opacity: 1,
        force3D: true,
      });
    });

    // Timeline utama untuk dramatisir slow motion
    const tl = gsap.timeline({
      delay: 0.3,
      defaults: { ease: "power1.in" }, // mulai lambat, makin cepat (gravity feel)
    });

    // Physics fall animation — slow motion dramatis
    chars.forEach((char, i) => {
      const delay = i * 0.18 + Math.random() * 0.3; // delay antar huruf lebih besar
      const fallDuration = 3.2 + Math.random() * 1.2; // durasi jatuh lebih lama (slow motion)
      
      // Target X & rotation akhir yang tidak beraturan
      const targetX = (i - chars.length / 2) * 70 + (Math.random() - 0.5) * 260;
      const targetRotation = (Math.random() - 0.5) * 90; // rotasi akhir acak ±45°
      
      // Posisi Y akhir: TIDAK RATA — tiap huruf beda ketinggian
      // floorY diukur dari containerHeight, tapi tiap huruf beda offset
      const baseY = containerHeight - 220; // posisi dasar bawah container
      const targetY = baseY + (Math.random() - 0.5) * 200; // variasi ±100px → tidak rata

      // Timeline per huruf (dengan slow motion feel)
      const charTl = gsap.timeline({ delay });

      // 1. VERTICAL FALL — physics2D dengan gravity untuk efek jatuh dramatis
      charTl.to(
        char,
        {
          duration: fallDuration,
          physics2D: {
            velocity: 500 + Math.random() * 300, // velocity sedang (slow motion)
            angle: 90 + (Math.random() - 0.5) * 25,
            gravity: 900 + Math.random() * 400, // gravity lebih rendah → slow motion
          },
          ease: "none",
        },
        0
      );

      // 2. HORIZONTAL DRIFT — gerak ke samping selama jatuh
      charTl.to(
        char,
        {
          duration: fallDuration,
          x: targetX,
          ease: "power1.inOut",
        },
        0
      );

      // 3. ROTATION — berputar selama jatuh (slow rotation)
      charTl.to(
        char,
        {
          duration: fallDuration,
          rotation: targetRotation,
          ease: "power1.inOut",
        },
        0
      );

      // 4. SETTLE — setelah jatuh, huruf "mendarat" tepat di targetY
      //    Ini memastikan huruf benar-benar berhenti (tidak floating)
      charTl.to(
        char,
        {
          duration: 0.8,
          y: targetY,
          rotation: targetRotation,
          x: targetX,
          ease: "power3.out", // mendarat halus
        },
        fallDuration - 0.2
      );

      // 5. Tidak ada micro-movement — huruf DIAM setelah mendarat
      //    (tidak ada repeat: -1 atau yoyo)
    });

    return () => {
      tl.kill();
      if (split) split.revert();
    };
  }, [containerHeight]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "800px", // container tinggi agar huruf jatuh ke bawah
        overflow: "visible", // PENTING: biar huruf tidak terpotong
        position: "relative",
        backgroundColor: "#ffffff", // bg utama
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
      }}
    >
      {/* 
        textRef absolute di tengah-atas container
        Huruf jatuh dari atas container ke bawah container
        Karena container bg putih = bg utama, huruf "nempel" dengan bg
      */}
      <div
        ref={textRef}
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: "450px",
          fontWeight: 700,
          color: "#0D3CFC",
          letterSpacing: "-0.04em",
          lineHeight: 1,
          textAlign: "center",
          userSelect: "none",
          whiteSpace: "nowrap",
          display: "inline-block",
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          pointerEvents: "none",
        }}
      >
        Menuru
      </div>
    </div>
  );
};

// ===== ONBOARDING TOUR COMPONENT =====
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
        if (pos === "bottom" && spaceBelow < tooltipHeight + gap) {
          pos = spaceAbove > spaceBelow ? "top" : "bottom";
        }
        if (pos === "top" && spaceAbove < tooltipHeight + gap) {
          pos = spaceBelow > spaceAbove ? "bottom" : "top";
        }
        if (pos === "right" && spaceRight < tooltipWidth + gap) {
          pos = spaceLeft > spaceRight ? "left" : "right";
        }
        if (pos === "left" && spaceLeft < tooltipWidth + gap) {
          pos = spaceRight > spaceLeft ? "right" : "left";
        }

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
        if (left + tooltipWidth > window.innerWidth - padding) {
          left = window.innerWidth - tooltipWidth - padding;
        }
        if (top < padding) top = padding;
        if (top + tooltipHeight > window.innerHeight - padding) {
          top = window.innerHeight - tooltipHeight - padding;
        }

        setTooltipPos({ top, left });
        setArrowPos(arrow);
      } else {
        setTargetRect(null);
      }
    };

    updateRect();
    const el = document.querySelector(`[data-tour="${step.target}"]`);
    if (el) {
      (el as HTMLElement).scrollIntoView({ behavior: "smooth", block: "center" });
    }
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
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleSkip = () => {
    onComplete();
  };

  const renderArrow = () => {
    const arrowSize = 14;
    const baseStyle: React.CSSProperties = {
      position: "absolute",
      width: 0,
      height: 0,
      borderStyle: "solid",
      pointerEvents: "none",
    };

    if (arrowPos === "top") {
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
    }
    if (arrowPos === "bottom") {
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
    }
    if (arrowPos === "left") {
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
    }
    if (arrowPos === "right") {
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
    }
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
          boxShadow: "none",
          border: "none",
          transition: "all 0.3s ease",
        }}
      >
        {renderArrow()}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
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
            aria-label="Skip tour"
          >
            ×
          </button>
        </div>

        <h4
          style={{
            fontSize: "18px",
            fontWeight: 700,
            color: "#ffffff",
            margin: 0,
            marginBottom: "8px",
          }}
        >
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

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "8px",
          }}
        >
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
            <ArrowRight size={14} color="#0D3CFC" />
          </button>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "5px",
            marginTop: "14px",
          }}
        >
          {steps.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === currentStep ? "18px" : "6px",
                height: "6px",
                borderRadius: "3px",
                backgroundColor:
                  i === currentStep ? "#ffffff" : "rgba(255,255,255,0.35)",
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>
      </div>
    </>
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

  const [onlineAgents, setOnlineAgents] = useState<OnlineUser[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [ticketPreviews, setTicketPreviews] = useState<{ [ticketId: string]: LastMessagePreview[] }>({});
  const [ticketMsgCounts, setTicketMsgCounts] = useState<{ [ticketId: string]: number }>({});
  const [searchQuery, setSearchQuery] = useState("");

  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatMessagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const liveChatTitleRef = useRef<HTMLHeadingElement>(null);

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
      content:
        "Welcome to Live Chat Agent! First, please login to your account so you can start chatting with our support agent.",
      position: "bottom",
      isLoginStep: true,
    },
    {
      target: "livechat-title",
      title: "Live Chat Agent",
      content:
        "This is the Live Chat Agent section. Here you can chat directly with our support team in real time.",
      position: "bottom",
    },
    {
      target: "online-panel",
      title: "Online Agents & Users",
      content:
        "See who is online right now. Agents see online users, and users see online agents — all updated in real time.",
      position: "right",
    },
    {
      target: "chat-list",
      title: "Chat History",
      content:
        "All your conversations appear here. Each ticket shows the last 3 messages preview, message count, and status.",
      position: "right",
    },
    {
      target: "search-bar",
      title: "Search Chats",
      content:
        "Use the search bar to quickly find any chat by name, topic, ticket ID, or message content.",
      position: "bottom",
    },
    {
      target: "start-chat-button",
      title: "Start a New Chat",
      content:
        "Click this button to start a new conversation with our support agent. Pick a topic and we'll connect you.",
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

  const completeTour = () => {
    try {
      localStorage.setItem(TOUR_STORAGE_KEY, "true");
    } catch (e) {
      // ignore
    }
    setShowTour(false);
    setTourStep(0);
  };

  const restartTour = () => {
    setTourStep(0);
    setShowTour(true);
  };

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

  useEffect(() => {
    if (!db || !isMounted) return;
    const q = query(collection(db, "users"), where("online", "==", true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const agents: OnlineUser[] = [];
      const users: OnlineUser[] = [];
      snapshot.forEach((docSnap) => {
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
        if (item.isAgent) agents.push(item);
        else users.push(item);
      });
      setOnlineAgents(agents);
      setOnlineUsers(users);
    });
    return () => unsubscribe();
  }, [db, isMounted]);

  useEffect(() => {
    if (!db || !user || !isMounted) return;

    let q;
    if (isAdmin) {
      q = query(collection(db, "livechat_tickets"), orderBy("createdAt", "desc"));
    } else {
      q = query(
        collection(db, "livechat_tickets"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ticketList: Ticket[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        ticketList.push({ id: docSnap.id, ...data } as Ticket);
      });
      setTickets(ticketList);
      if (selectedTicket) {
        const stillExists = ticketList.some((t) => t.id === selectedTicket.id);
        if (!stillExists) {
          setSelectedTicket(null);
          setMessages([]);
        }
      }
    });
    return () => unsubscribe();
  }, [db, user, isAdmin, selectedTicket, isMounted]);

  useEffect(() => {
    if (!db || !tickets.length || !isMounted) return;
    const unsubscribes: (() => void)[] = [];
    tickets.forEach((ticket) => {
      const q = query(
        collection(db, "livechat_tickets", ticket.id, "messages"),
        orderBy("timestamp", "desc"),
        limit(3)
      );
      const unsub = onSnapshot(q, async (snapshot) => {
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
    const q = query(
      collection(db, "livechat_tickets", selectedTicket.id, "messages"),
      orderBy("timestamp", "asc")
    );
    const unsubscribe = onSnapshot(q, async (snapshot) => {
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
      setMessages(msgList);
      setTimeout(() => scrollToBottom(), 50);
    });
    return () => unsubscribe();
  }, [db, selectedTicket, isMounted]);

  useEffect(() => {
    if (!db || !selectedTicket || !user || !isAdmin || !isMounted) return;
    const unread = messages.filter((m) => m.senderId !== user.uid && !m.read);
    unread.forEach(async (msg) => {
      const msgRef = doc(db, "livechat_tickets", selectedTicket.id, "messages", msg.id);
      await updateDoc(msgRef, { read: true, deliveryStatus: "read" });
    });
  }, [messages, selectedTicket, db, user, isAdmin, isMounted]);

  useEffect(() => {
    if (!user || isAdmin || !isMounted) return;
    const userTickets = tickets.filter((t) => t.userId === user.uid);
    const activeTicket = userTickets.find(
      (t) => t.status === "waiting" || t.status === "active"
    );
    if (activeTicket) setSelectedTicket(activeTicket);
    else if (userTickets.length > 0 && !selectedTicket) setSelectedTicket(userTickets[0]);
    else if (userTickets.length === 0) {
      setSelectedTicket(null);
      setMessages([]);
    }
  }, [tickets, user, isAdmin, selectedTicket, isMounted]);

  const generateTicketId = (createdAt: any): string => {
    if (!createdAt) return "#TICKET-0000";
    const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `#TICKET-${year}${month}${day}${hours}${minutes}`;
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  const scrollToBottom = () => {
    if (chatMessagesContainerRef.current) {
      chatMessagesContainerRef.current.scrollTop =
        chatMessagesContainerRef.current.scrollHeight;
    }
  };

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

  const filterTicketsBySearch = (list: Ticket[]) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter((ticket) => {
      if (ticket.userName?.toLowerCase().includes(q)) return true;
      if (ticket.userEmail?.toLowerCase().includes(q)) return true;
      if (ticket.topic?.toLowerCase().includes(q)) return true;
      if (generateTicketId(ticket.createdAt).toLowerCase().includes(q)) return true;
      const previews = ticketPreviews[ticket.id] || [];
      for (const p of previews) {
        if (p.text.toLowerCase().includes(q)) return true;
      }
      return false;
    });
  };

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
      (t) =>
        t.userId === user.uid &&
        (t.status === "waiting" || t.status === "active") &&
        !t.isAnnouncement &&
        !t.isBroadcast
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
      setSelectedTopic("");
      setShowStartChat(false);
      setBanMessage(null);
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
      await banUserPermanent(
        user.uid,
        user.email || "",
        user.displayName || "User",
        checkResult.reason,
        messageText
      );
      setIsBanned(true);
      setBanReason(checkResult.reason);
      setCanCreateTicket(false);
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
    if (selectedTicket.status === "resolved" || selectedTicket.status === "closed") {
      alert("This chat is finished. Please create a new ticket.");
      return;
    }
    try {
      const ticketRef = doc(db, "livechat_tickets", selectedTicket.id);
      await updateDoc(ticketRef, {
        typing: false,
        typingUserId: null,
        typingUserName: null,
      });
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
      });
      await updateDoc(ticketRef, {
        lastMessage: messageText.trim(),
        lastMessageTime: serverTimestamp(),
        ...(selectedTicket.status === "waiting" && { status: "active" }),
        agentId: isAdmin ? user.uid : selectedTicket.agentId,
        agentName: isAdmin ? AGENT_NAME : selectedTicket.agentName,
      });
      setMessageText("");
      setBanMessage(null);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("An error occurred while sending the message. Please try again.");
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
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(null);
        setMessages([]);
      }
    } catch (error) {
      console.error("Error resolving ticket:", error);
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
        style={{
          width: "260px",
          backgroundColor: "#f9f9f9",
          borderRadius: "12px",
          border: "1px solid #e8e8e8",
          overflowY: "auto",
          flexShrink: 0,
          height: "700px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "14px 16px",
            backgroundColor: "#0D3CFC",
            color: "#fff",
            fontWeight: 600,
            fontSize: "14px",
            fontFamily: FONT_FAMILY,
            borderRadius: "12px 12px 0 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 1,
          }}
        >
          <span>{title}</span>
          <span
            style={{
              fontSize: "11px",
              backgroundColor: "rgba(255,255,255,0.2)",
              padding: "2px 8px",
              borderRadius: "8px",
            }}
          >
            {list.length}
          </span>
        </div>
        <div style={{ overflowY: "auto", flex: 1 }}>
          {list.length === 0 ? (
            <div
              style={{
                padding: "30px 16px",
                textAlign: "center",
                color: "#999",
                fontSize: "13px",
                fontFamily: FONT_FAMILY,
              }}
            >
              {emptyText}
            </div>
          ) : (
            list.map((u) => (
              <div
                key={u.uid}
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid #e8e8e8",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontFamily: FONT_FAMILY,
                }}
              >
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      backgroundColor: "#0D3CFC",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "14px",
                      overflow: "hidden",
                    }}
                  >
                    {u.photoURL ? (
                      <img
                        src={u.photoURL}
                        alt={u.displayName}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      u.displayName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      bottom: "0",
                      right: "0",
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      backgroundColor: "#22c55e",
                      border: "2px solid #f9f9f9",
                    }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#000",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {u.displayName}
                  </div>
                  <div style={{ fontSize: "11px", color: "#22c55e", fontWeight: 500 }}>
                    Online
                  </div>
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
    const userTextColor = "#ffffff";
    const agentTextColor = isAdmin ? "#0D3CFC" : "#ffffff";
    const labelUserColor = isAdmin ? "#888" : "#ffffff";
    const labelAgentColor = isAdmin ? "#0D3CFC" : "#ffffff";
    return (
      <div style={{ marginTop: "6px", display: "flex", flexDirection: "column", gap: "3px" }}>
        {ordered.map((p, i) => (
          <div
            key={i}
            style={{
              fontSize: "11px",
              color: p.isFromAgent ? agentTextColor : userTextColor,
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
            <span
              style={{
                fontWeight: 600,
                color: p.isFromAgent ? labelAgentColor : labelUserColor,
                flexShrink: 0,
              }}
            >
              {p.isFromAgent ? "Agent:" : "User:"}
            </span>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
              {p.text.length > 30 ? p.text.substring(0, 30) + "..." : p.text}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const renderSearchBar = () => {
    const isDark = !isAdmin;
    const bgColor = isDark ? "rgba(255,255,255,0.15)" : "#ffffff";
    const textColor = isDark ? "#ffffff" : "#000";
    const iconColor = isDark ? "#ffffff" : "#666";
    const borderColor = isDark ? "rgba(255,255,255,0.25)" : "#e8e8e8";
    return (
      <div
        data-tour="search-bar"
        style={{
          padding: "10px 14px",
          borderBottom: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e8e8e8",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 12px",
            backgroundColor: bgColor,
            border: `1px solid ${borderColor}`,
            borderRadius: "8px",
          }}
        >
          <SearchIcon size={14} color={iconColor} />
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
              color: textColor,
              fontSize: "12px",
              fontFamily: FONT_FAMILY,
              padding: 0,
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={{
                background: "transparent",
                border: "none",
                color: textColor,
                cursor: "pointer",
                fontSize: "14px",
                padding: 0,
                lineHeight: 1,
                fontFamily: FONT_FAMILY,
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
                backgroundColor: "#0D3CFC",
                borderRadius: "12px",
                padding: "16px 20px",
                color: "#ffffff",
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
                <div style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff" }}>
                  Announcement
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    backgroundColor: "rgba(255,255,255,0.2)",
                    padding: "2px 10px",
                    borderRadius: "8px",
                    color: "#ffffff",
                    fontWeight: 600,
                  }}
                >
                  {announcementTickets.length} active
                </div>
              </div>
              {announcementTickets.slice(0, 3).map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  style={{
                    padding: "8px 0",
                    borderTop: "1px solid rgba(255,255,255,0.15)",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#ffffff",
                      marginBottom: "3px",
                    }}
                  >
                    {t.userName}
                  </div>
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
                backgroundColor: "#0D3CFC",
                borderRadius: "12px",
                padding: "16px 20px",
                color: "#ffffff",
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
                <div style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff" }}>
                  Broadcasting
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    backgroundColor: "rgba(255,255,255,0.2)",
                    padding: "2px 10px",
                    borderRadius: "8px",
                    color: "#ffffff",
                    fontWeight: 600,
                  }}
                >
                  {broadcastTickets.length} active
                </div>
              </div>
              {broadcastTickets.slice(0, 3).map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  style={{
                    padding: "8px 0",
                    borderTop: "1px solid rgba(255,255,255,0.15)",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#ffffff",
                      marginBottom: "3px",
                    }}
                  >
                    {t.userName}
                  </div>
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
      <div style={{ marginTop: "40px", paddingTop: "30px" }}>
        <h3
          style={{
            fontSize: "80px",
            fontWeight: 700,
            color: "#0D3CFC",
            fontFamily: FONT_FAMILY,
            letterSpacing: "-0.03em",
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          Live Chat Agent
        </h3>
        <div
          style={{
            padding: "20px",
            textAlign: "center",
            color: "#666",
            fontFamily: FONT_FAMILY,
          }}
        >
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
        <div style={{ marginTop: "40px", paddingTop: "30px" }}>
          <h3
            ref={liveChatTitleRef}
            data-tour="livechat-title"
            style={{
              fontSize: "80px",
              fontWeight: 700,
              color: "#0D3CFC",
              fontFamily: FONT_FAMILY,
              letterSpacing: "-0.03em",
              margin: 0,
              lineHeight: 1.1,
              marginBottom: "20px",
            }}
          >
            Live Chat Agent
          </h3>
          <p
            style={{
              fontSize: "15px",
              color: "#666",
              fontFamily: FONT_FAMILY,
              marginBottom: "10px",
            }}
          >
            Please login to use Live Chat Agent
          </p>
          <Link href="/" style={{ textDecoration: "none" }}>
            <button
              data-tour="login-button"
              style={{
                padding: "8px 20px",
                backgroundColor: "#0D3CFC",
                color: "#fff",
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
                color: "#0D3CFC",
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

  if (!isAdmin && isBanned) {
    return (
      <div style={{ marginTop: "40px", paddingTop: "30px" }}>
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
              color: "#0D3CFC",
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
              color: "#0D3CFC",
              border: "none",
              fontSize: "20px",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: FONT_FAMILY,
            }}
          >
            <span>Logout</span>
            <ArrowRight size={20} color="#0D3CFC" />
          </button>
        </div>
        <div
          style={{
            color: "#0D3CFC",
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
            color: "#0D3CFC",
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
        <div style={{ marginTop: "40px", paddingTop: "30px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "20px",
            }}
          >
            <h3
              ref={liveChatTitleRef}
              data-tour="livechat-title"
              style={{
                fontSize: "80px",
                fontWeight: 700,
                color: "#0D3CFC",
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
                color: "#0D3CFC",
                border: "none",
                fontSize: "20px",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: FONT_FAMILY,
              }}
            >
              <span>Logout</span>
              <ArrowRight size={20} color="#0D3CFC" />
            </button>
          </div>

          <div style={{ marginBottom: "20px" }} data-tour="online-panel">
            <div
              style={{
                fontSize: "15px",
                fontWeight: 600,
                color: "#0D3CFC",
                fontFamily: FONT_FAMILY,
                marginBottom: "10px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <OnlineDot color="#22c55e" size={10} />
              {onlineAgents.length} Agent{onlineAgents.length !== 1 ? "s" : ""} Online
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {onlineAgents.map((a) => (
                <div
                  key={a.uid}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 14px",
                    backgroundColor: "#f0f4ff",
                    border: "1px solid #0D3CFC",
                    borderRadius: "10px",
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  <OnlineDot color="#22c55e" size={8} />
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#0D3CFC" }}>
                    {a.displayName}
                  </span>
                </div>
              ))}
              {onlineAgents.length === 0 && (
                <span style={{ fontSize: "13px", color: "#999", fontFamily: FONT_FAMILY }}>
                  No agents online
                </span>
              )}
            </div>
          </div>

          <p
            style={{
              fontSize: "15px",
              color: "#666",
              fontFamily: FONT_FAMILY,
              marginBottom: "16px",
            }}
          >
            Need help? Chat directly with our agent.
          </p>
          <button
            data-tour="start-chat-button"
            onClick={() => setShowStartChat(true)}
            style={{
              padding: "10px 24px",
              backgroundColor: "#0D3CFC",
              color: "#fff",
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
                color: "#0D3CFC",
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

  if (!isAdmin && showStartChat) {
    return (
      <div style={{ marginTop: "40px", paddingTop: "30px" }}>
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
              color: "#0D3CFC",
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
              color: "#0D3CFC",
              border: "none",
              fontSize: "20px",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: FONT_FAMILY,
            }}
          >
            <span>Logout</span>
            <ArrowRight size={20} color="#0D3CFC" />
          </button>
        </div>
        <div style={{ maxWidth: "400px" }}>
          <div style={{ fontSize: "15px", marginBottom: "10px", fontFamily: FONT_FAMILY }}>
            Select your issue topic:
          </div>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px",
              border: "2px solid #0D3CFC",
              borderRadius: "8px",
              fontSize: "15px",
              fontFamily: FONT_FAMILY,
              outline: "none",
              backgroundColor: "#fff",
              marginBottom: "14px",
              color: "#0D3CFC",
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
                backgroundColor: selectedTopic ? "#0D3CFC" : "#ccc",
                color: "#fff",
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
  const resolvedTicketsRaw = tickets.filter(
    (t) => t.status === "resolved" || t.status === "closed"
  );
  const waitingTickets = filterTicketsBySearch(waitingTicketsRaw);
  const activeTickets = filterTicketsBySearch(activeTicketsRaw);
  const resolvedTickets = filterTicketsBySearch(resolvedTicketsRaw);
  const typingText = selectedTicket ? getTypingText(selectedTicket) : null;

  return (
    <>
      <OnboardingTour
        steps={tourSteps}
        onComplete={completeTour}
        isActive={showTour}
        currentStep={tourStep}
        setCurrentStep={setTourStep}
      />
      <div style={{ marginTop: "40px", paddingTop: "30px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "20px",
          }}
        >
          <h3
            ref={liveChatTitleRef}
            data-tour="livechat-title"
            style={{
              fontSize: "80px",
              fontWeight: 700,
              color: "#0D3CFC",
              fontFamily: FONT_FAMILY,
              letterSpacing: "-0.03em",
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            Live Chat Agent
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
            <span
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: onlineAgents.length > 0 ? "#0D3CFC" : "#999",
                fontFamily: FONT_FAMILY,
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
                color: "#0D3CFC",
                border: "none",
                fontSize: "20px",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: FONT_FAMILY,
              }}
            >
              <span>Logout</span>
              <ArrowRight size={20} color="#0D3CFC" />
            </button>
            {!isAdmin && (
              <button
                onClick={restartTour}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#0D3CFC",
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
            style={{
              width: "360px",
              backgroundColor: isAdmin ? "#f9f9f9" : "#0D3CFC",
              borderRadius: "12px",
              border: isAdmin ? "1px solid #e8e8e8" : "none",
              overflowY: "auto",
              flexShrink: 0,
              height: "700px",
              color: isAdmin ? "#000" : "#fff",
              fontFamily: FONT_FAMILY,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                padding: "14px 16px",
                borderBottom: isAdmin
                  ? "1px solid #e8e8e8"
                  : "1px solid rgba(255,255,255,0.15)",
                fontWeight: 600,
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: isAdmin ? "#f9f9f9" : "#0D3CFC",
                position: "sticky",
                top: 0,
                zIndex: 2,
              }}
            >
              <span>Chat History</span>
              <span
                style={{
                  fontSize: "11px",
                  backgroundColor: isAdmin ? "#e5e7eb" : "rgba(255,255,255,0.2)",
                  padding: "2px 8px",
                  borderRadius: "8px",
                }}
              >
                {isAdmin ? tickets.length : tickets.filter((t) => t.userId === user.uid).length}
              </span>
            </div>

            {renderSearchBar()}

            <div style={{ overflowY: "auto", flex: 1 }}>
              {isAdmin ? (
                <>
                  {waitingTickets.length > 0 && (
                    <div>
                      <div
                        style={{
                          padding: "10px 16px",
                          backgroundColor: "#fef3c7",
                          fontWeight: 600,
                          fontSize: "12px",
                          color: "#92400e",
                          position: "sticky",
                          top: 0,
                          zIndex: 1,
                        }}
                      >
                        Waiting ({waitingTickets.length})
                      </div>
                      {waitingTickets.map((ticket) => (
                        <div
                          key={ticket.id}
                          onClick={() => {
                            setSelectedTicket(ticket);
                            takeTicket(ticket.id);
                          }}
                          style={{
                            padding: "12px 16px",
                            borderBottom: "1px solid #e8e8e8",
                            cursor: "pointer",
                            backgroundColor:
                              selectedTicket?.id === ticket.id
                                ? "rgba(13,60,252,0.08)"
                                : "transparent",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: "4px",
                            }}
                          >
                            <div
                              style={{ fontWeight: 600, fontSize: "13px", color: "#0D3CFC" }}
                            >
                              {ticket.userName}
                            </div>
                            <span style={{ fontSize: "10px", color: "#999" }}>
                              {ticketMsgCounts[ticket.id] || 0} msgs
                            </span>
                          </div>
                          <div
                            style={{ fontSize: "11px", color: "#666", marginBottom: "4px" }}
                          >
                            {ticket.topic}
                          </div>
                          {renderTicketPreview(ticket.id)}
                        </div>
                      ))}
                    </div>
                  )}
                  {activeTickets.length > 0 && (
                    <div>
                      <div
                        style={{
                          padding: "10px 16px",
                          backgroundColor: "#d1fae5",
                          fontWeight: 600,
                          fontSize: "12px",
                          color: "#065f46",
                          position: "sticky",
                          top: 0,
                          zIndex: 1,
                        }}
                      >
                        Active ({activeTickets.length})
                      </div>
                      {activeTickets.map((ticket) => (
                        <div
                          key={ticket.id}
                          onClick={() => setSelectedTicket(ticket)}
                          style={{
                            padding: "12px 16px",
                            borderBottom: "1px solid #e8e8e8",
                            cursor: "pointer",
                            backgroundColor:
                              selectedTicket?.id === ticket.id
                                ? "rgba(13,60,252,0.08)"
                                : "transparent",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: "4px",
                            }}
                          >
                            <div
                              style={{ fontWeight: 600, fontSize: "13px", color: "#0D3CFC" }}
                            >
                              {ticket.userName}
                            </div>
                            <span style={{ fontSize: "10px", color: "#999" }}>
                              {ticketMsgCounts[ticket.id] || 0} msgs
                            </span>
                          </div>
                          <div
                            style={{ fontSize: "11px", color: "#666", marginBottom: "4px" }}
                          >
                            {ticket.topic}
                          </div>
                          {renderTicketPreview(ticket.id)}
                        </div>
                      ))}
                    </div>
                  )}
                  {resolvedTickets.length > 0 && (
                    <div>
                      <div
                        style={{
                          padding: "10px 16px",
                          backgroundColor: "#e5e7eb",
                          fontWeight: 600,
                          fontSize: "12px",
                          color: "#6b7280",
                          position: "sticky",
                          top: 0,
                          zIndex: 1,
                        }}
                      >
                        Resolved ({resolvedTickets.length})
                      </div>
                      {resolvedTickets.map((ticket) => (
                        <div
                          key={ticket.id}
                          onClick={() => setSelectedTicket(ticket)}
                          style={{
                            padding: "12px 16px",
                            borderBottom: "1px solid #e8e8e8",
                            cursor: "pointer",
                            backgroundColor:
                              selectedTicket?.id === ticket.id
                                ? "rgba(13,60,252,0.08)"
                                : "transparent",
                            opacity: 0.7,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: "4px",
                            }}
                          >
                            <div
                              style={{ fontWeight: 600, fontSize: "13px", color: "#0D3CFC" }}
                            >
                              {ticket.userName}
                            </div>
                            <span style={{ fontSize: "10px", color: "#999" }}>
                              {ticketMsgCounts[ticket.id] || 0} msgs
                            </span>
                          </div>
                          <div
                            style={{ fontSize: "11px", color: "#666", marginBottom: "4px" }}
                          >
                            {ticket.topic}
                          </div>
                          {renderTicketPreview(ticket.id)}
                        </div>
                      ))}
                    </div>
                  )}
                  {waitingTickets.length === 0 &&
                    activeTickets.length === 0 &&
                    resolvedTickets.length === 0 && (
                      <div
                        style={{
                          padding: "30px 16px",
                          textAlign: "center",
                          color: "#999",
                          fontSize: "13px",
                        }}
                      >
                        {searchQuery ? "No results found" : "No incoming chats"}
                      </div>
                    )}
                </>
              ) : (
                <>
                  {filterTicketsBySearch(tickets.filter((t) => t.userId === user.uid)).map(
                    (ticket) => {
                      const ticketId = generateTicketId(ticket.createdAt);
                      const isActive = selectedTicket?.id === ticket.id;
                      const statusLabel =
                        ticket.status === "waiting"
                          ? "Waiting"
                          : ticket.status === "active"
                          ? "Active"
                          : "Resolved";
                      return (
                        <div
                          key={ticket.id}
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setMessages([]);
                          }}
                          style={{
                            padding: "14px 16px",
                            borderLeft: isActive ? "4px solid #fff" : "4px solid transparent",
                            backgroundColor: isActive
                              ? "rgba(255,255,255,0.12)"
                              : "transparent",
                            cursor: "pointer",
                            borderBottom: "1px solid rgba(255,255,255,0.06)",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: "4px",
                            }}
                          >
                            <div style={{ fontWeight: 600, fontSize: "14px", color: "#fff" }}>
                              {ticket.userName}
                            </div>
                            <span style={{ fontSize: "10px", color: "#fff" }}>
                              {ticketMsgCounts[ticket.id] || 0} msgs
                            </span>
                          </div>
                          <div
                            style={{ fontSize: "12px", color: "#fff", marginBottom: "6px" }}
                          >
                            {ticket.topic}
                          </div>
                          {renderTicketPreview(ticket.id)}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              marginTop: "6px",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "10px",
                                backgroundColor:
                                  ticket.status === "waiting"
                                    ? "#fef3c7"
                                    : ticket.status === "active"
                                    ? "#d1fae5"
                                    : "#e5e7eb",
                                color:
                                  ticket.status === "waiting"
                                    ? "#92400e"
                                    : ticket.status === "active"
                                    ? "#065f46"
                                    : "#6b7280",
                                padding: "2px 8px",
                                borderRadius: "8px",
                                fontWeight: 600,
                              }}
                            >
                              {statusLabel}
                            </span>
                            <span style={{ fontSize: "9px", color: "#fff" }}>{ticketId}</span>
                          </div>
                        </div>
                      );
                    }
                  )}
                  {filterTicketsBySearch(tickets.filter((t) => t.userId === user.uid))
                    .length === 0 && (
                    <div
                      style={{
                        padding: "30px 16px",
                        textAlign: "center",
                        color: "#fff",
                        fontSize: "13px",
                      }}
                    >
                      {searchQuery ? "No results found" : "No chats yet"}
                    </div>
                  )}
                </>
              )}
            </div>

            {!isAdmin && (
              <div
                style={{
                  padding: "10px 16px",
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                  position: "sticky",
                  bottom: 0,
                  backgroundColor: "#0D3CFC",
                }}
              >
                <button
                  data-tour="start-chat-button"
                  onClick={() => setShowStartChat(true)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    backgroundColor: "rgba(255,255,255,0.15)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: FONT_FAMILY,
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
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              border: "1px solid #e8e8e8",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              height: "700px",
            }}
          >
            {selectedTicket ? (
              <>
                <div
                  style={{
                    padding: "16px 24px",
                    backgroundColor: "#0D3CFC",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: "17px",
                        color: "#fff",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      {selectedTicket.userName}
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: 400,
                          color: "rgba(255,255,255,0.8)",
                          marginLeft: "8px",
                        }}
                      >
                        {selectedTicket.topic}
                      </span>
                      {selectedTicket.isAnnouncement && (
                        <span
                          style={{
                            fontSize: "12px",
                            color: "#fff",
                            backgroundColor: "rgba(255,255,255,0.2)",
                            padding: "2px 10px",
                            borderRadius: "6px",
                            marginLeft: "10px",
                          }}
                        >
                          Announcement
                        </span>
                      )}
                      {selectedTicket.isBroadcast && (
                        <span
                          style={{
                            fontSize: "12px",
                            color: "#fff",
                            backgroundColor: "rgba(255,255,255,0.2)",
                            padding: "2px 10px",
                            borderRadius: "6px",
                            marginLeft: "10px",
                          }}
                        >
                          Broadcast
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginTop: "4px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "13px",
                          color:
                            selectedTicket.status === "waiting" ? "#fef3c7" : "#d1fae5",
                          fontWeight: 600,
                        }}
                      >
                        {selectedTicket.status === "waiting" ? "Waiting" : "Active"}
                      </span>
                      {selectedTicket.typing && selectedTicket.status !== "resolved" && (
                        <span
                          style={{ fontSize: "13px", color: "#ffd700", fontStyle: "italic" }}
                        >
                          {selectedTicket.typingUserName} is typing...
                        </span>
                      )}
                      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>
                        {generateTicketId(selectedTicket.createdAt)}
                      </span>
                    </div>
                  </div>
                  {isAdmin &&
                    selectedTicket.status !== "resolved" &&
                    selectedTicket.status !== "closed" && (
                      <button
                        onClick={() => resolveTicket(selectedTicket.id)}
                        style={{
                          padding: "8px 18px",
                          backgroundColor: "#22c55e",
                          color: "#fff",
                          border: "none",
                          borderRadius: "8px",
                          fontSize: "13px",
                          fontWeight: 600,
                          cursor: "pointer",
                          fontFamily: FONT_FAMILY,
                        }}
                      >
                        Resolve
                      </button>
                    )}
                </div>

                <div
                  ref={chatMessagesContainerRef}
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    minHeight: 0,
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
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
                        <div
                          key={idx}
                          style={{
                            alignSelf: isMine ? "flex-end" : "flex-start",
                            maxWidth: "70%",
                          }}
                        >
                          <div
                            style={{
                              padding: "12px 16px",
                              borderRadius: "12px",
                              backgroundColor: isMine ? "#0D3CFC" : "#f0f0f0",
                              color: isMine ? "#fff" : "#000",
                              fontSize: "15px",
                              fontFamily: FONT_FAMILY,
                              wordBreak: "break-word",
                            }}
                          >
                            {!isMine && (
                              <div
                                style={{
                                  fontSize: "12px",
                                  fontWeight: 600,
                                  color: "#0D3CFC",
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
                                  color: isMine ? "#ffffff" : "#999",
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
                  <div ref={messagesEndRef} />
                </div>

                {selectedTicket.status !== "resolved" &&
                  selectedTicket.status !== "closed" && (
                    <div
                      style={{
                        padding: "16px 24px",
                        borderTop: "1px solid #e8e8e8",
                        display: "flex",
                        gap: "12px",
                        backgroundColor: "#fff",
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
                          border: "1px solid #e8e8e8",
                          borderRadius: "10px",
                          fontSize: "15px",
                          outline: "none",
                          fontFamily: FONT_FAMILY,
                          backgroundColor:
                            selectedTicket.status === "waiting" && !isAdmin
                              ? "#f5f5f5"
                              : "#fff",
                        }}
                      />
                      <button
                        onClick={sendMessage}
                        disabled={
                          (selectedTicket.status === "waiting" && !isAdmin) ||
                          !messageText.trim()
                        }
                        style={{
                          padding: "12px 24px",
                          backgroundColor:
                            (selectedTicket.status === "waiting" && !isAdmin) ||
                            !messageText.trim()
                              ? "#ccc"
                              : "#0D3CFC",
                          color: "#fff",
                          border: "none",
                          borderRadius: "10px",
                          cursor:
                            (selectedTicket.status === "waiting" && !isAdmin) ||
                            !messageText.trim()
                              ? "not-allowed"
                              : "pointer",
                          fontFamily: FONT_FAMILY,
                          fontSize: "15px",
                          fontWeight: 600,
                        }}
                      >
                        Send
                      </button>
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

  const preloaderRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const menuruFooterRef = useRef<HTMLDivElement>(null);
  const menuruTextRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!auth || !isMounted) return;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
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

  useEffect(() => {
    if (!showMain || !isMounted) return;
    const menuruElement = menuruFooterRef.current;
    const menuruText = menuruTextRef.current;
    if (menuruElement && menuruText) {
      const split = new SplitText(menuruText, { type: "chars", charsClass: "menuru-char" });
      gsap.set(split.chars, { opacity: 0, y: 100, scale: 0.5, rotationX: 90 });
      ScrollTrigger.create({
        trigger: menuruElement,
        start: "top 85%",
        onEnter: () => {
          gsap.to(split.chars, {
            opacity: 1, y: 0, scale: 1, rotationX: 0,
            duration: 1.2, stagger: 0.03, ease: "back.out(1.7)", overwrite: true,
          });
        },
        onLeave: () => {
          gsap.to(split.chars, {
            opacity: 0, y: 100, scale: 0.5, rotationX: 90,
            duration: 0.8, stagger: 0.02, ease: "power2.in", overwrite: true,
          });
        },
        onEnterBack: () => {
          gsap.to(split.chars, {
            opacity: 1, y: 0, scale: 1, rotationX: 0,
            duration: 1.2, stagger: 0.03, ease: "back.out(1.7)", overwrite: true,
          });
        },
      });
    }
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [showMain, isMounted]);

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
              setTimeout(() => ScrollTrigger.refresh(), 200);
            },
          });
        }
      },
    });
    gsap.set(textRef.current, { y: 100, opacity: 0 });
    tl.to(textRef.current, { y: 0, opacity: 1, duration: 0.8, ease: "back.out(1.7)" })
      .to(textRef.current, { duration: 0.6 })
      .to(textRef.current, {
        opacity: 0, y: -20, scale: 0.9, duration: 0.4, ease: "power2.out",
        onComplete: () => {
          if (textRef.current) textRef.current.textContent = "Note";
        },
      })
      .to(textRef.current, {
        opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.7)",
      })
      .to(textRef.current, { duration: 0.8 })
      .to(textRef.current, {
        scale: 0.3, opacity: 0, duration: 0.7, ease: "power2.in",
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
          top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "#ffffff",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 9999, fontFamily: FONT_FAMILY,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "40px", overflow: "hidden" }}>
          <span
            style={{
              fontSize: "100px", fontWeight: 700, color: "#0D3CFC",
              fontFamily: FONT_FAMILY, letterSpacing: "-0.03em",
            }}
          >
            Menuru
          </span>
          <span
            ref={textRef}
            style={{
              fontSize: "50px", fontWeight: 600, color: "#000000",
              fontFamily: FONT_FAMILY, letterSpacing: "-0.02em",
              display: "inline-block", willChange: "transform, opacity",
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
          top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "#ffffff",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 9999, fontFamily: FONT_FAMILY,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "40px", overflow: "hidden" }}>
          <span
            style={{
              fontSize: "100px", fontWeight: 700, color: "#0D3CFC",
              fontFamily: FONT_FAMILY, letterSpacing: "-0.03em",
            }}
          >
            Menuru
          </span>
          <span
            ref={textRef}
            style={{
              fontSize: "50px", fontWeight: 600, color: "#000000",
              fontFamily: FONT_FAMILY, letterSpacing: "-0.02em",
              display: "inline-block", willChange: "transform, opacity",
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
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />
        <meta name="theme-color" content="#0D3CFC" />
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

      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#ffffff",
          margin: 0, padding: 0, position: "relative",
          fontFamily: FONT_FAMILY, overflow: "visible",
        }}
      >
        {/* ===== PHYSICS MENURU TITLE (PALING ATAS) ===== */}
        <PhysicsMenuruTitle />

        {/* LIVE CHAT AGENT */}
        <div style={{ padding: "0 40px", maxWidth: "1600px", margin: "0 auto", width: "100%" }}>
          <LiveChatAgent user={user} isAdmin={isAdmin} db={db} auth={auth} />
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
          <div
            style={{
              position: "absolute", left: "40px", top: "50%",
              transform: "translateY(-50%)",
              width: "200px", height: "auto", opacity: 0.8,
            }}
          >
            <img
              src="/images/p0l.jpg" alt=""
              style={{ width: "100%", height: "auto", display: "block", objectFit: "cover" }}
            />
          </div>
          <div
            style={{
              position: "absolute", right: "40px", top: "50%",
              transform: "translateY(-50%)",
              width: "200px", height: "auto", opacity: 0.8,
            }}
          >
            <img
              src="/images/xxz.jpg" alt=""
              style={{ width: "100%", height: "auto", display: "block", objectFit: "cover" }}
            />
          </div>

          <div
            style={{
              display: "flex", justifyContent: "space-between", alignItems: "flex-start",
              maxWidth: "1400px", margin: "0 auto", gap: "40px",
              flexWrap: "wrap", position: "relative", zIndex: 1,
            }}
          >
            {footerLinks.map((section, idx) => (
              <div key={idx} style={{ flex: "1", minWidth: "200px" }}>
                <h3
                  style={{
                    fontFamily: FONT_FAMILY,
                    fontSize: "28px", fontWeight: 600,
                    color: "#000000", margin: 0, marginBottom: "16px",
                    letterSpacing: "-0.01em", textTransform: "none",
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
                              fontFamily: FONT_FAMILY, fontSize: "20px",
                              fontWeight: 400, color: "#0D3CFC",
                              letterSpacing: "-0.01em", cursor: "pointer",
                              textTransform: "none",
                            }}
                          >
                            {link}
                          </span>
                        </Link>
                        {isAttention && (
                          <span
                            style={{
                              backgroundColor: "#0D3CFC", color: "#ffffff",
                              padding: "2px 10px", borderRadius: "4px",
                              fontSize: "11px", fontWeight: 600,
                              fontFamily: FONT_FAMILY, letterSpacing: "0.3px",
                              display: "inline-block",
                            }}
                          >
                            Updated
                          </span>
                        )}
                        {isStories && (
                          <span
                            style={{
                              backgroundColor: "#0D3CFC", color: "#ffffff",
                              padding: "2px 10px", borderRadius: "4px",
                              fontSize: "11px", fontWeight: 600,
                              fontFamily: FONT_FAMILY, letterSpacing: "0.3px",
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
              maxWidth: "1400px", margin: "40px auto 0 auto",
              paddingTop: "20px", borderTop: "1px solid rgba(0,0,0,0.05)",
              position: "relative", zIndex: 1,
            }}
          >
            <p
              style={{
                fontFamily: FONT_FAMILY, fontSize: "14px", fontWeight: 400,
                color: "#666", margin: 0, textAlign: "center",
                letterSpacing: "0.01em",
              }}
            >
              Terms and conditions apply. By using this website, you agree to our Terms of Use
              and Privacy Policy.
            </p>
          </div>
        </div>

        {/* MENURU Text + Copyright */}
        <div
          ref={menuruFooterRef}
          style={{
            width: "100%", padding: "20px 40px 80px 40px",
            backgroundColor: "#ffffff", overflow: "hidden",
            display: "flex", flexDirection: "column",
            justifyContent: "flex-start", minHeight: "300px",
          }}
        >
          <span
            ref={menuruTextRef}
            style={{
              fontFamily: FONT_FAMILY, fontSize: "450px",
              fontWeight: 700, color: "#0D3CFC",
              letterSpacing: "-0.02em", textTransform: "none",
              lineHeight: "0.8", display: "block",
              textAlign: "left",
              WebkitFontSmoothing: "antialiased",
              MozOsxFontSmoothing: "grayscale",
            }}
          >
            Menuru
          </span>
          <div
            style={{
              marginTop: "30px", width: "100%",
              display: "flex", justifyContent: "flex-start",
            }}
          >
            <span
              style={{
                fontFamily: FONT_FAMILY, fontSize: "16px", fontWeight: 400,
                color: "#0D3CFC", letterSpacing: "0.01em", opacity: 0.8,
              }}
            >
              2024 - 2026 Menuru. All rights reserved.
            </span>
          </div>
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
          margin: 0; padding: 0;
          background-color: #ffffff !important;
          min-height: 100% !important;
          height: auto !important;
        }
        body::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        * { background-color: transparent; }
        .menuru-char {
          display: inline-block;
          will-change: transform, opacity;
        }
        .split-char-livechat {
          display: inline-block;
          will-change: transform, opacity, filter;
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
        .chat-messages-container-admin::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        .chat-messages-container,
        .chat-messages-container-admin {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
      `}</style>
    </>
  );
}
