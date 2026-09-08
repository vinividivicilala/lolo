'use client';

import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
import { getFirestore, collection, query, where, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, orderBy, getDocs, setDoc, deleteDoc, runTransaction } from "firebase/firestore";
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Image from 'next/image';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, SplitText);
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
  measurementId: "G-8LMP7F4BE9"
};

let app = null;
let auth = null;
let db = null;

if (typeof window !== "undefined") {
  app = getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
}

// ===== ENKRIPSI AES-256-GCM REAL =====
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
  let binary = '';
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
    'raw',
    keyBytes,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
  return cryptoKey;
}

async function encryptMessage(text: string): Promise<string> {
  try {
    if (typeof window === 'undefined' || !window.crypto) {
      return `encrypted:${btoa(unescape(encodeURIComponent(text)))}`;
    }
    const key = await getCryptoKey();
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv, tagLength: 128 },
      key,
      data
    );
    const encryptedArray = new Uint8Array(encrypted);
    const combined = new Uint8Array(iv.length + encryptedArray.length);
    combined.set(iv, 0);
    combined.set(encryptedArray, iv.length);
    return `encrypted:${uint8ArrayToBase64(combined)}`;
  } catch (error) {
    console.error('Encryption error:', error);
    return `plain:${btoa(unescape(encodeURIComponent(text)))}`;
  }
}

async function decryptMessage(encrypted: string): Promise<string> {
  try {
    if (typeof window === 'undefined' || !window.crypto) {
      if (encrypted.startsWith('encrypted:')) {
        const encoded = encrypted.substring('encrypted:'.length);
        return decodeURIComponent(escape(atob(encoded)));
      }
      return encrypted;
    }
    if (encrypted.startsWith('plain:')) {
      const encoded = encrypted.substring('plain:'.length);
      return decodeURIComponent(escape(atob(encoded)));
    }
    if (!encrypted.startsWith('encrypted:')) return encrypted;
    const base64Data = encrypted.substring('encrypted:'.length);
    const combined = base64ToUint8Array(base64Data);
    const iv = combined.slice(0, IV_LENGTH);
    const encryptedData = combined.slice(IV_LENGTH);
    const key = await getCryptoKey();
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv, tagLength: 128 },
      key,
      encryptedData
    );
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    if (encrypted.startsWith('encrypted:') || encrypted.startsWith('plain:')) {
      try {
        const encoded = encrypted.includes(':') ? encrypted.split(':')[1] : encrypted;
        return decodeURIComponent(escape(atob(encoded)));
      } catch {
        return '[Pesan tidak dapat didekripsi]';
      }
    }
    return encrypted;
  }
}

// ===== ANTI-BOT SUPER ADVANCED SYSTEM =====
interface BotScore {
  totalScore: number;
  violations: string[];
  lastViolation: any;
  isBanned: boolean;
  bannedAt: any;
  banReason: string;
}

interface BotDetectionResult {
  isBot: boolean;
  score: number;
  reason: string;
  details: string[];
}

// ===== MACHINE LEARNING-LIKE BOT DETECTION =====
class BotDetector {
  private patterns: { pattern: RegExp; weight: number; category: string }[] = [];
  private history: { text: string; timestamp: number }[] = [];
  private readonly MAX_HISTORY = 50;
  private readonly BAN_THRESHOLD = 50; // Total score >= 50 = BANNED
  private readonly TIME_WINDOW = 60000; // 1 menit

  constructor() {
    // ===== LEVEL 1: HIGH WEIGHT PATTERNS (langsung banned) =====
    this.patterns.push(
      { pattern: /\bbot\b/i, weight: 50, category: 'High Risk' },
      { pattern: /\bscam\b/i, weight: 50, category: 'High Risk' },
      { pattern: /\bphishing\b/i, weight: 50, category: 'High Risk' },
      { pattern: /\bmalware\b/i, weight: 50, category: 'High Risk' },
      { pattern: /\bransomware\b/i, weight: 50, category: 'High Risk' },
      { pattern: /\bkeylogger\b/i, weight: 50, category: 'High Risk' },
      { pattern: /\bspyware\b/i, weight: 50, category: 'High Risk' },
      { pattern: /\badware\b/i, weight: 50, category: 'High Risk' },
      { pattern: /\btrojan\b/i, weight: 50, category: 'High Risk' },
      { pattern: /\bworm\b/i, weight: 50, category: 'High Risk' },
      { pattern: /\brootkit\b/i, weight: 50, category: 'High Risk' },
      { pattern: /\bexploit\b/i, weight: 50, category: 'High Risk' },
      { pattern: /\b0day\b/i, weight: 50, category: 'High Risk' },
      { pattern: /\bcve-\d{4}-\d{4,}\b/i, weight: 50, category: 'High Risk' },
      { pattern: /\bsql injection\b/i, weight: 50, category: 'High Risk' },
      { pattern: /\bxss\b/i, weight: 50, category: 'High Risk' },
      { pattern: /\bcsrf\b/i, weight: 50, category: 'High Risk' }
    );

    // ===== LEVEL 2: MEDIUM WEIGHT PATTERNS =====
    this.patterns.push(
      { pattern: /\bgambling\b/i, weight: 30, category: 'Medium Risk' },
      { pattern: /\bcasino\b/i, weight: 30, category: 'Medium Risk' },
      { pattern: /\blottery\b/i, weight: 30, category: 'Medium Risk' },
      { pattern: /\bjudol\b/i, weight: 30, category: 'Medium Risk' },
      { pattern: /\bjudionline\b/i, weight: 30, category: 'Medium Risk' },
      { pattern: /\bslot\b/i, weight: 30, category: 'Medium Risk' },
      { pattern: /\bpoker\b/i, weight: 30, category: 'Medium Risk' },
      { pattern: /\bbaccarat\b/i, weight: 30, category: 'Medium Risk' },
      { pattern: /\brolet\b/i, weight: 30, category: 'Medium Risk' },
      { pattern: /\bblackjack\b/i, weight: 30, category: 'Medium Risk' },
      { pattern: /\bsabung ayam\b/i, weight: 30, category: 'Medium Risk' },
      { pattern: /\btogel\b/i, weight: 30, category: 'Medium Risk' },
      { pattern: /\b4d\b/i, weight: 30, category: 'Medium Risk' },
      { pattern: /\btoto\b/i, weight: 30, category: 'Medium Risk' },
      { pattern: /\bmagnum\b/i, weight: 30, category: 'Medium Risk' },
      { pattern: /\bdamacai\b/i, weight: 30, category: 'Medium Risk' },
      { pattern: /\bsingaporepools\b/i, weight: 30, category: 'Medium Risk' },
      { pattern: /\bhongkongpools\b/i, weight: 30, category: 'Medium Risk' },
      { pattern: /\bsydneypools\b/i, weight: 30, category: 'Medium Risk' }
    );

    // ===== LEVEL 3: LOW WEIGHT PATTERNS =====
    this.patterns.push(
      { pattern: /\bcrypto\b/i, weight: 15, category: 'Low Risk' },
      { pattern: /\bbitcoin\b/i, weight: 15, category: 'Low Risk' },
      { pattern: /\bethereum\b/i, weight: 15, category: 'Low Risk' },
      { pattern: /\binvestment\b/i, weight: 15, category: 'Low Risk' },
      { pattern: /\bprofit\b/i, weight: 15, category: 'Low Risk' },
      { pattern: /\breturn\b/i, weight: 15, category: 'Low Risk' },
      { pattern: /\bpassive income\b/i, weight: 15, category: 'Low Risk' },
      { pattern: /\bget rich\b/i, weight: 15, category: 'Low Risk' },
      { pattern: /\bmake money\b/i, weight: 15, category: 'Low Risk' },
      { pattern: /\bearn money\b/i, weight: 15, category: 'Low Risk' },
      { pattern: /\bquick cash\b/i, weight: 15, category: 'Low Risk' },
      { pattern: /\bfree money\b/i, weight: 15, category: 'Low Risk' },
      { pattern: /\bclick here\b/i, weight: 15, category: 'Low Risk' }
    );

    // ===== PATTERN DETECTION: SUSPICIOUS LINKS =====
    this.patterns.push(
      { pattern: /https?:\/\/[^\s]*\.(xyz|top|club|online|site|win|bid|loan|date|download|stream|watch|free|click|biz|info|name|pro|tech|store|shop|live|app|dev|work|cloud|host|net|org|com)(\/[^\s]*)?/i, weight: 35, category: 'Suspicious Link' },
      { pattern: /https?:\/\/[^\s]*\.(ru|cn|pl|tk|ml|ga|cf)(\/[^\s]*)?/i, weight: 35, category: 'Suspicious Link' },
      { pattern: /bit\.ly\/[a-zA-Z0-9]+/i, weight: 25, category: 'Shortened Link' },
      { pattern: /tinyurl\.com\/[a-zA-Z0-9]+/i, weight: 25, category: 'Shortened Link' },
      { pattern: /shorturl\.at\/[a-zA-Z0-9]+/i, weight: 25, category: 'Shortened Link' },
      { pattern: /cutt\.ly\/[a-zA-Z0-9]+/i, weight: 25, category: 'Shortened Link' },
      { pattern: /ow\.ly\/[a-zA-Z0-9]+/i, weight: 25, category: 'Shortened Link' }
    );

    // ===== PATTERN DETECTION: REPEATED CHARACTERS =====
    this.patterns.push(
      { pattern: /(.)\1{8,}/i, weight: 20, category: 'Repeated Characters' },
      { pattern: /(..)\1{4,}/i, weight: 20, category: 'Repeated Pattern' }
    );

    // ===== PATTERN DETECTION: ALL CAPS =====
    this.patterns.push(
      { pattern: /^[A-Z\s!?.,]+$/, weight: 10, category: 'All Caps' }
    );

    // ===== PATTERN DETECTION: SUSPICIOUS WORDS =====
    this.patterns.push(
      { pattern: /\bsex\b/i, weight: 25, category: 'Adult Content' },
      { pattern: /\bporn\b/i, weight: 25, category: 'Adult Content' },
      { pattern: /\bxxx\b/i, weight: 25, category: 'Adult Content' },
      { pattern: /\bnsfw\b/i, weight: 25, category: 'Adult Content' },
      { pattern: /\b18\+\b/i, weight: 25, category: 'Adult Content' }
    );

    // ===== PATTERN DETECTION: SPAM KEYWORDS =====
    this.patterns.push(
      { pattern: /\b(viagra|cialis|levitra)\b/i, weight: 30, category: 'Spam' },
      { pattern: /\b(weight loss|diet pill|fat burner)\b/i, weight: 20, category: 'Spam' },
      { pattern: /\b(herbal|organic|natural)\s*(remedy|cure|treatment)\b/i, weight: 20, category: 'Spam' },
      { pattern: /\b(miracle|cure|heal)\s*(cancer|disease|illness)\b/i, weight: 30, category: 'Spam' }
    );
  }

  // ===== ANALYZE TEXT =====
  analyze(text: string, history: { text: string; timestamp: number }[]): BotDetectionResult {
    let totalScore = 0;
    const details: string[] = [];
    let reason = 'Normal';

    // ===== SCAN PATTERNS =====
    for (const p of this.patterns) {
      if (p.pattern.test(text)) {
        totalScore += p.weight;
        details.push(`${p.category}: ${p.pattern.source} (+${p.weight})`);
        if (p.weight >= 50) {
          reason = `HIGH RISK: ${p.category}`;
        }
      }
    }

    // ===== CHECK HISTORY FOR SPAM =====
    const now = Date.now();
    const recentHistory = history.filter(h => (now - h.timestamp) < this.TIME_WINDOW);
    const similarMessages = recentHistory.filter(h => h.text === text);
    
    if (similarMessages.length >= 2) {
      const score = similarMessages.length * 15;
      totalScore += score;
      details.push(`Spam: Pesan sama ${similarMessages.length + 1}x (+${score})`);
      if (similarMessages.length >= 3) {
        reason = 'SPAM DETECTED';
        totalScore += 20;
        details.push(`SPAM: Pesan sama ${similarMessages.length + 1}x (+20)`);
      }
    }

    // ===== CHECK RATE LIMITING =====
    const messageCount = recentHistory.length;
    if (messageCount >= 5) {
      totalScore += 10;
      details.push(`Rate Limiting: ${messageCount} pesan dalam ${this.TIME_WINDOW/1000}s (+10)`);
    }
    if (messageCount >= 10) {
      totalScore += 20;
      details.push(`HIGH RATE: ${messageCount} pesan dalam ${this.TIME_WINDOW/1000}s (+20)`);
      reason = 'RATE LIMIT EXCEEDED';
    }

    // ===== CHECK FOR SUSPICIOUS PATTERNS COMBINATION =====
    const suspiciousCategories = ['Suspicious Link', 'Shortened Link', 'Adult Content', 'High Risk', 'Medium Risk'];
    const categoriesFound = details.filter(d => suspiciousCategories.some(cat => d.includes(cat)));
    if (categoriesFound.length >= 2) {
      totalScore += 15;
      details.push(`Multiple Suspicious Categories: ${categoriesFound.length} (+15)`);
    }

    // ===== DETERMINE RESULT =====
    const isBot = totalScore >= this.BAN_THRESHOLD || reason === 'HIGH RISK: High Risk' || reason === 'SPAM DETECTED';

    return {
      isBot,
      score: totalScore,
      reason: isBot ? `BANNED: ${reason}` : reason,
      details
    };
  }

  // ===== CHECK IF USER IS BANNED =====
  async isUserBanned(userId: string): Promise<{ banned: boolean; reason: string; score: number }> {
    if (!db) return { banned: false, reason: 'No DB', score: 0 };
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDocs(query(collection(db, "users"), where("uid", "==", userId)));
      if (!userSnap.empty) {
        const data = userSnap.docs[0].data();
        if (data.botFlagged === true) {
          return { 
            banned: true, 
            reason: data.botReason || 'Violation detected',
            score: data.botScore || 0
          };
        }
      }
      return { banned: false, reason: 'Clean', score: 0 };
    } catch (error) {
      console.error('Error checking ban status:', error);
      return { banned: false, reason: 'Error', score: 0 };
    }
  }
}

// ===== GLOBAL BOT DETECTOR INSTANCE =====
const botDetector = new BotDetector();

// ===== BAN USER FUNCTION =====
async function banUser(userId: string, userEmail: string, reason: string, score: number, details: string[]) {
  if (!db) return;
  try {
    // Update user document
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      botFlagged: true,
      botReason: `${reason} (Score: ${score})`,
      botScore: score,
      botDetails: details,
      botFlaggedAt: serverTimestamp(),
      bannedAt: serverTimestamp()
    });

    // Log to violations
    await addDoc(collection(db, "bot_violations"), {
      userId,
      userEmail,
      reason,
      score,
      details,
      timestamp: serverTimestamp(),
      resolved: false,
      action: 'AUTO_BAN'
    });

    // Delete all active tickets
    const ticketsSnap = await getDocs(query(collection(db, "livechat_tickets"), where("userId", "==", userId)));
    for (const ticketDoc of ticketsSnap.docs) {
      await deleteDoc(doc(db, "livechat_tickets", ticketDoc.id));
    }

    console.log(`🚫 User BANNED: ${userEmail} - ${reason} (Score: ${score})`);
  } catch (error) {
    console.error('Error banning user:', error);
  }
}

// ===== UPDATE BOT SCORE =====
async function updateBotScore(userId: string, score: number, reason: string) {
  if (!db) return;
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      botScore: score,
      lastViolationReason: reason,
      lastViolationTime: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating score:', error);
  }
}

const FONT_FAMILY = "'Poppins', 'Poppins Fallback', sans-serif";
const ADMIN_EMAIL = "faridardiansyah061@gmail.com";
const AGENT_NAME = "Farid Ardiansyah";

// SVG Icons (sama seperti sebelumnya)
const NorthEastArrow = ({ size = 20, color = "currentColor" }: { size?: number, color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 7L17 17M17 7V17H7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SouthEastArrow = ({ size = 24, color = "currentColor" }: { size?: number, color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 17L17 7M17 17V7H7" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const NorthWestArrow = ({ size = 24, color = "currentColor" }: { size?: number, color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 17L7 7M7 17V7H17" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ShieldCheck = ({ size = 24, color = "#0D3CFC" }: { size?: number, color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L3 6V12C3 16.97 6.84 21.67 12 22C17.16 21.67 21 16.97 21 12V6L12 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 12L11 14L15 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ShoppingBag = ({ size = 20, color = "#0D3CFC" }: { size?: number, color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 6H18L19 18H5L6 6Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 10V6C9 4.34315 10.3431 3 12 3C13.6569 3 15 4.34315 15 6V10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LogoutIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Feature data
const featuresData = [
  { name: "Community" },
  { name: "Blog" },
  { name: "Live Chat" },
  { name: "Live Chat Agent" },
  { name: "Donation" },
  { name: "Contact" },
  { name: "Note" }
];

// Menu items for drawer
const menuItems = [
  { name: "Community", number: "01" },
  { name: "Blog", number: "02" },
  { name: "Live Chat", number: "03" },
  { name: "Live Chat Agent", number: "04" },
  { name: "Donation", number: "05" },
  { name: "Contact", number: "06" },
  { name: "Note", number: "07" }
];

// Footer links
const footerLinks = [
  { title: "Get in Touch", links: ["Contact", "Instagram", "Live Chat", "Live Chat Agent"] },
  { title: "Product", links: ["Shop", "Note", "Calendar", "Blog", "Donation", "Community", "Live Chat Agent", "Stories"] },
  { title: "Attention", links: ["Kebijakan Privasi", "Ketentuan Kami", "Pusat Bantuan"] }
];

// ===== PULSING DOTS =====
const PulsingDots = ({ active }: { active: boolean }) => {
  if (!active) return <span style={{ color: '#999', fontSize: '11px' }}>● Offline</span>;
  return (
    <span style={{ display: 'inline-flex', gap: '3px', alignItems: 'center' }}>
      <span className="dot" style={{ animationDelay: '0s' }}>●</span>
      <span className="dot" style={{ animationDelay: '0.2s' }}>●</span>
      <span className="dot" style={{ animationDelay: '0.4s' }}>●</span>
      <style>{`
        .dot {
          animation: blink 1.4s infinite both;
          font-size: 9px;
          color: #22c55e;
        }
        @keyframes blink {
          0% { opacity: 0.2; }
          20% { opacity: 1; }
          100% { opacity: 0.2; }
        }
      `}</style>
    </span>
  );
};

// ===== INSTAGRAM VERIFIED BADGE =====
const InstagramVerifiedBadge = ({ size = 14 }: { size?: number }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          marginLeft: "3px",
          display: "inline-block",
          verticalAlign: "middle",
          cursor: "pointer",
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <path
          fill="#0095F6"
          d="M12 2.2 C13.6 3.8 16.2 3.8 17.8 2.2 C18.6 3.8 20.2 5.4 21.8 6.2 C20.2 7.8 20.2 10.4 21.8 12 C20.2 13.6 20.2 16.2 21.8 17.8 C20.2 18.6 18.6 20.2 17.8 21.8 C16.2 20.2 13.6 20.2 12 21.8 C10.4 20.2 7.8 20.2 6.2 21.8 C5.4 20.2 3.8 18.6 2.2 17.8 C3.8 16.2 3.8 13.6 2.2 12 C3.8 10.4 3.8 7.8 2.2 6.2 C3.8 5.4 5.4 3.8 6.2 2.2 C7.8 3.8 10.4 3.8 12 2.2 Z"
        />
        <path d="M9.2 12.3l2 2 4.6-4.6" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      {showTooltip && (
        <div style={{
          position: "absolute",
          bottom: "calc(100% + 6px)",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "#1a1a1a",
          color: "#fff",
          padding: "3px 8px",
          borderRadius: "5px",
          fontSize: "10px",
          whiteSpace: "nowrap",
          zIndex: 100,
          fontFamily: FONT_FAMILY,
        }}>
          Official Account
          <div style={{
            position: "absolute",
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            border: "5px solid transparent",
            borderTopColor: "#1a1a1a",
          }} />
        </div>
      )}
    </div>
  );
};

// ===== LIVE CHAT AGENT COMPONENT =====
interface Ticket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhoto?: string;
  agentId?: string;
  agentName?: string;
  status: 'waiting' | 'active' | 'resolved' | 'closed';
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
}

const LiveChatAgent = ({ user, isAdmin, db, auth }: { user: any; isAdmin: boolean; db: any; auth: any }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [showStartChat, setShowStartChat] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [agentOnline, setAgentOnline] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [botWarning, setBotWarning] = useState<string | null>(null);
  const [encryptionReady, setEncryptionReady] = useState(false);
  const [isBanned, setIsBanned] = useState(false);
  const [banReason, setBanReason] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatMessagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const liveChatTitleRef = useRef<HTMLDivElement>(null);
  const userMessageHistory = useRef<{text: string, timestamp: number}[]>([]);

  const topics = [
    "Pertanyaan tentang produk",
    "Bantuan teknis",
    "Permasalahan akun",
    "Donasi",
    "Kerjasama",
    "Lainnya"
  ];

  useEffect(() => {
    setIsMounted(true);
    getCryptoKey().then(() => {
      setEncryptionReady(true);
    }).catch((err) => {
      console.error('Failed to initialize encryption:', err);
      setEncryptionReady(true);
    });
  }, []);

  // ===== CHECK BAN STATUS ON MOUNT =====
  useEffect(() => {
    if (!user || !db || !isMounted) return;
    
    const checkBan = async () => {
      const status = await botDetector.isUserBanned(user.uid);
      if (status.banned) {
        setIsBanned(true);
        setBanReason(status.reason);
        setBotWarning(`🚫 AKUN ANDA TELAH DIBANNED! Alasan: ${status.reason}`);
      }
    };
    checkBan();
  }, [user, db, isMounted]);

  const generateTicketId = (createdAt: any): string => {
    if (!createdAt) return "#TICKET-0000";
    const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `#TICKET-${year}${month}${day}${hours}${minutes}`;
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const WaitingIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );

  const ActiveIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  );

  const ResolvedIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  );

  const ChatIconSmall = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );

  const ChatIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const SendIcon = ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const LiveChatIllustration = () => (
    <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="#0D3CFC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="8" cy="10" r="1" fill="#0D3CFC"/>
      <circle cx="12" cy="10" r="1" fill="#0D3CFC"/>
      <circle cx="16" cy="10" r="1" fill="#0D3CFC"/>
    </svg>
  );

  const scrollToBottom = () => {
    if (chatMessagesContainerRef.current) {
      chatMessagesContainerRef.current.scrollTop = chatMessagesContainerRef.current.scrollHeight;
    }
  };

  // GSAP SplitText untuk judul Live Chat Agent
  useEffect(() => {
    if (!isMounted) return;
    if (liveChatTitleRef.current) {
      const splitTitle = new SplitText(liveChatTitleRef.current, {
        type: "chars",
        charsClass: "split-char-livechat"
      });
      gsap.fromTo(splitTitle.chars,
        { opacity: 0, y: 20, filter: 'blur(8px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.6,
          stagger: 0.04,
          ease: "back.out(1.2)",
          scrollTrigger: {
            trigger: liveChatTitleRef.current,
            start: "top 85%",
            end: "bottom 70%",
            toggleActions: "play none none reverse",
          }
        }
      );
    }
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [isMounted]);

  // ===== ALL useEffect HOOKS =====
  useEffect(() => {
    if (!db || !isMounted) return;
    const q = query(collection(db, "users"), where("email", "==", ADMIN_EMAIL));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const data = doc.data();
        setAgentOnline(data.online || false);
      }
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
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (!isAdmin && (data.isAnnouncement || data.isBroadcast)) {
          if (data.userId === user.uid) {
            ticketList.push({ id: doc.id, ...data } as Ticket);
          }
        } else {
          ticketList.push({ id: doc.id, ...data } as Ticket);
        }
      });
      setTickets(ticketList);
      if (selectedTicket) {
        const stillExists = ticketList.some(t => t.id === selectedTicket.id);
        if (!stillExists) {
          setSelectedTicket(null);
          setMessages([]);
        }
      }
    });
    return () => unsubscribe();
  }, [db, user, isAdmin, selectedTicket, isMounted]);

  useEffect(() => {
    if (!db || !selectedTicket || !isMounted) return;
    const q = query(
      collection(db, "livechat_tickets", selectedTicket.id, "messages"),
      orderBy("timestamp", "asc")
    );
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const msgList: ChatMessage[] = [];
      for (const doc of snapshot.docs) {
        const data = doc.data();
        let text = data.text || '';
        if (data.isEncrypted) {
          try {
            text = await decryptMessage(text);
          } catch (e) {
            console.error('Failed to decrypt message:', e);
            text = '[Pesan terenkripsi]';
          }
        }
        msgList.push({ id: doc.id, ...data, text } as ChatMessage);
      }
      setMessages(msgList);
      setTimeout(() => {
        scrollToBottom();
      }, 50);
    });
    return () => unsubscribe();
  }, [db, selectedTicket, isMounted]);

  useEffect(() => {
    if (!db || !selectedTicket || !user || !isAdmin || !isMounted) return;
    const unread = messages.filter(m => m.senderId !== user.uid && !m.read);
    unread.forEach(async (msg) => {
      const msgRef = doc(db, "livechat_tickets", selectedTicket.id, "messages", msg.id);
      await updateDoc(msgRef, { read: true });
    });
  }, [messages, selectedTicket, db, user, isAdmin, isMounted]);

  useEffect(() => {
    if (!user || isAdmin || !isMounted) return;
    const userTickets = tickets.filter(t => t.userId === user.uid);
    const activeTicket = userTickets.find(t => t.status === 'waiting' || t.status === 'active');
    if (activeTicket) {
      setSelectedTicket(activeTicket);
    } else if (userTickets.length > 0 && !selectedTicket) {
      setSelectedTicket(userTickets[0]);
    } else if (userTickets.length === 0) {
      setSelectedTicket(null);
      setMessages([]);
    }
  }, [tickets, user, isAdmin, selectedTicket, isMounted]);

  // ===== FUNGSI =====
  const handleTyping = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isBanned) {
      setBotWarning(`🚫 ANDA TELAH DIBANNED! ${banReason}`);
      return;
    }
    const value = e.target.value;
    setMessageText(value);
    if (!selectedTicket || !user || !db) return;
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
      await updateDoc(ticketRef, { typing: false, typingUserId: null, typingUserName: null });
    }, 2000);
  };

  const startChat = async () => {
    // ===== CHECK BAN STATUS FIRST =====
    if (isBanned) {
      setBotWarning(`🚫 ANDA TELAH DIBANNED! ${banReason}`);
      return;
    }

    if (!db || !user || !selectedTopic) return;
    if (!encryptionReady) {
      alert("Enkripsi sedang diinisialisasi, silahkan tunggu sebentar.");
      return;
    }

    // Check if user is banned from database
    const status = await botDetector.isUserBanned(user.uid);
    if (status.banned) {
      setIsBanned(true);
      setBanReason(status.reason);
      setBotWarning(`🚫 AKUN ANDA TELAH DIBANNED! Alasan: ${status.reason}`);
      return;
    }

    const hasActiveTicket = tickets.some(t => t.userId === user.uid && (t.status === 'waiting' || t.status === 'active') && !t.isAnnouncement && !t.isBroadcast);
    if (hasActiveTicket) {
      alert("Anda masih memiliki chat aktif dengan agent. Tunggu hingga selesai.");
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
        isBroadcast: false
      });

      const initialMessage = `Halo, saya ingin bertanya tentang: ${selectedTopic}`;
      const encryptedMessage = await encryptMessage(initialMessage);
      await addDoc(collection(db, "livechat_tickets", ticketRef.id, "messages"), {
        senderId: user.uid,
        senderName: user.displayName || user.email || "User",
        text: encryptedMessage,
        timestamp: serverTimestamp(),
        read: false,
        isEncrypted: true,
        isBotDetected: false
      });
      setSelectedTopic("");
      setShowStartChat(false);
      setBotWarning(null);
    } catch (error) {
      console.error("Error starting chat:", error);
      alert("Terjadi kesalahan saat memulai chat. Silahkan coba lagi.");
    }
  };

  const sendMessage = async () => {
    // ===== CHECK BAN STATUS =====
    if (isBanned) {
      setBotWarning(`🚫 ANDA TELAH DIBANNED! ${banReason}`);
      setMessageText("");
      return;
    }

    if (!db || !selectedTicket || !messageText.trim() || !user) return;
    if (!encryptionReady) {
      alert("Enkripsi sedang diinisialisasi, silahkan tunggu sebentar.");
      return;
    }

    // ===== ANTI-BOT DETECTION =====
    const result = botDetector.analyze(messageText, userMessageHistory.current);
    
    console.log('🔍 Anti-Bot Analysis:', {
      score: result.score,
      isBot: result.isBot,
      reason: result.reason,
      details: result.details
    });

    // ===== IF BOT DETECTED =====
    if (result.isBot) {
      // BAN USER IMMEDIATELY
      await banUser(
        user.uid,
        user.email || '',
        result.reason,
        result.score,
        result.details
      );
      
      setIsBanned(true);
      setBanReason(result.reason);
      setBotWarning(`🚫 AKUN ANDA TELAH DIBANNED! Alasan: ${result.reason} (Score: ${result.score})`);
      setMessageText("");
      
      // Delete all tickets
      const ticketsSnap = await getDocs(query(collection(db, "livechat_tickets"), where("userId", "==", user.uid)));
      for (const ticketDoc of ticketsSnap.docs) {
        await deleteDoc(doc(db, "livechat_tickets", ticketDoc.id));
      }
      setSelectedTicket(null);
      setMessages([]);
      
      return;
    }

    // ===== UPDATE SCORE IF SUSPICIOUS =====
    if (result.score > 0) {
      await updateBotScore(user.uid, result.score, result.reason);
    }

    // Update history
    userMessageHistory.current.push({
      text: messageText,
      timestamp: Date.now()
    });
    if (userMessageHistory.current.length > botDetector['MAX_HISTORY']) {
      userMessageHistory.current = userMessageHistory.current.slice(-botDetector['MAX_HISTORY']);
    }

    if (selectedTicket.status === 'resolved' || selectedTicket.status === 'closed') {
      alert("Chat ini sudah selesai. Silahkan buat ticket baru.");
      return;
    }

    try {
      const ticketRef = doc(db, "livechat_tickets", selectedTicket.id);
      await updateDoc(ticketRef, {
        typing: false,
        typingUserId: null,
        typingUserName: null,
      });
      const senderName = isAdmin ? AGENT_NAME : (user.displayName || user.email || "User");
      
      const encryptedMessage = await encryptMessage(messageText.trim());
      
      await addDoc(collection(db, "livechat_tickets", selectedTicket.id, "messages"), {
        senderId: user.uid,
        senderName: senderName,
        text: encryptedMessage,
        timestamp: serverTimestamp(),
        read: false,
        isEncrypted: true,
        isBotDetected: false
      });
      await updateDoc(ticketRef, {
        lastMessage: messageText.trim(),
        lastMessageTime: serverTimestamp(),
        ...(selectedTicket.status === "waiting" && { status: "active" }),
        agentId: isAdmin ? user.uid : selectedTicket.agentId,
        agentName: isAdmin ? AGENT_NAME : selectedTicket.agentName,
      });
      setMessageText("");
      setBotWarning(null);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Terjadi kesalahan saat mengirim pesan. Silahkan coba lagi.");
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
      await updateDoc(doc(db, "livechat_tickets", ticketId), {
        status: "resolved",
      });
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(null);
        setMessages([]);
      }
    } catch (error) {
      console.error("Error resolving ticket:", error);
    }
  };

  const getTypingText = (ticket: Ticket | null) => {
    if (!ticket || !ticket.typing) return null;
    const name = ticket.typingUserName || "Seseorang";
    return `${name} sedang mengetik...`;
  };

  const handleLogout = async () => {
    if (!auth) return;
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        online: false,
        lastSeen: serverTimestamp(),
        typing: false
      });
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // ===== RENDER COMPONENT =====
  if (!isMounted) {
    return <div style={{ minHeight: "100px" }} />;
  }
  
  if (!user) {
    return (
      <div style={{ marginTop: "40px", paddingTop: "30px" }}>
        <h3 ref={liveChatTitleRef} style={{
          fontSize: "22px",
          fontWeight: 600,
          color: "#0D3CFC",
          fontFamily: FONT_FAMILY,
          marginBottom: "12px",
        }}>
          Live Chat Agent
        </h3>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
        }}>
          <div style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(13,60,252,0.06)",
            borderRadius: "10px",
            padding: "10px",
            width: "50px",
            height: "50px",
          }}>
            <LiveChatIllustration />
          </div>
          <div>
            <p style={{
              fontSize: "13px",
              color: "#666",
              fontFamily: FONT_FAMILY,
              marginBottom: "6px",
            }}>
              Silakan login untuk menggunakan Live Chat Agent
            </p>
            <Link href="/" style={{ textDecoration: "none" }}>
              <button
                style={{
                  padding: "5px 16px",
                  backgroundColor: "#0D3CFC",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  fontSize: "12px",
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: FONT_FAMILY,
                }}
              >
                Login
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ===== CHECK IF BANNED - SHOW BANNED STATE =====
  if (isBanned) {
    return (
      <div style={{ marginTop: "40px", paddingTop: "30px" }}>
        <div style={{
          backgroundColor: "#fee2e2",
          border: "2px solid #ef4444",
          borderRadius: "8px",
          padding: "20px",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "10px" }}>🚫</div>
          <h3 style={{
            fontSize: "24px",
            fontWeight: 700,
            color: "#991b1b",
            fontFamily: FONT_FAMILY,
            marginBottom: "8px"
          }}>
            AKUN ANDA TELAH DIBANNED
          </h3>
          <p style={{
            fontSize: "14px",
            color: "#991b1b",
            fontFamily: FONT_FAMILY
          }}>
            Alasan: {banReason}
          </p>
          <p style={{
            fontSize: "12px",
            color: "#991b1b",
            fontFamily: FONT_FAMILY,
            marginTop: "8px"
          }}>
            Anda tidak dapat membuat ticket baru atau mengirim pesan.
            <br />
            Silakan hubungi admin untuk informasi lebih lanjut.
          </p>
          <button
            onClick={handleLogout}
            style={{
              marginTop: "16px",
              padding: "8px 24px",
              backgroundColor: "#ef4444",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: FONT_FAMILY,
            }}
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  // USER VIEW
  if (!isAdmin) {
    const userTickets = tickets.filter(t => t.userId === user.uid);
    const activeTicket = userTickets.find(t => t.status === 'waiting' || t.status === 'active');

    if (userTickets.length === 0 && !showStartChat) {
      return (
        <div style={{ marginTop: "40px", paddingTop: "30px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h3 ref={liveChatTitleRef} style={{
              fontSize: "22px",
              fontWeight: 600,
              color: "#0D3CFC",
              fontFamily: FONT_FAMILY,
              margin: 0,
            }}>
              Live Chat Agent
            </h3>
            <button
              onClick={handleLogout}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "4px 12px",
                backgroundColor: "transparent",
                color: "#ef4444",
                border: "1px solid #ef4444",
                borderRadius: "5px",
                fontSize: "12px",
                cursor: "pointer",
                fontFamily: FONT_FAMILY,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#fef2f2"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
            >
              <LogoutIcon size={14} />
              <span>Logout</span>
            </button>
          </div>
          {botWarning && (
            <div style={{
              backgroundColor: "#fee2e2",
              color: "#991b1b",
              padding: "8px 12px",
              borderRadius: "5px",
              fontSize: "12px",
              marginBottom: "10px",
              fontFamily: FONT_FAMILY,
            }}>
              {botWarning}
            </div>
          )}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "10px",
          }}>
            <PulsingDots active={agentOnline} />
            <span style={{ fontSize: "12px", color: agentOnline ? "#0D3CFC" : "#999", fontFamily: FONT_FAMILY }}>
              {agentOnline ? "Agent Online" : "Agent Offline"}
            </span>
          </div>
          <p style={{ fontSize: "13px", color: "#666", fontFamily: FONT_FAMILY, marginBottom: "10px" }}>
            Butuh bantuan? Chat langsung dengan agent kami.
          </p>
          <button
            onClick={() => setShowStartChat(true)}
            style={{
              padding: "7px 18px",
              backgroundColor: "#0D3CFC",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: FONT_FAMILY,
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <ChatIcon />
            <span>Mulai Live Chat</span>
          </button>
        </div>
      );
    }

    if (showStartChat) {
      return (
        <div style={{ marginTop: "40px", paddingTop: "30px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h3 ref={liveChatTitleRef} style={{
              fontSize: "22px",
              fontWeight: 600,
              color: "#0D3CFC",
              fontFamily: FONT_FAMILY,
              margin: 0,
            }}>
              Live Chat Agent
            </h3>
            <button
              onClick={handleLogout}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "4px 12px",
                backgroundColor: "transparent",
                color: "#ef4444",
                border: "1px solid #ef4444",
                borderRadius: "5px",
                fontSize: "12px",
                cursor: "pointer",
                fontFamily: FONT_FAMILY,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#fef2f2"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
            >
              <LogoutIcon size={14} />
              <span>Logout</span>
            </button>
          </div>
          {botWarning && (
            <div style={{
              backgroundColor: "#fee2e2",
              color: "#991b1b",
              padding: "8px 12px",
              borderRadius: "5px",
              fontSize: "12px",
              marginBottom: "10px",
              fontFamily: FONT_FAMILY,
            }}>
              {botWarning}
            </div>
          )}
          <div style={{ maxWidth: "360px" }}>
            <div style={{ fontSize: "13px", marginBottom: "8px", fontFamily: FONT_FAMILY }}>
              Pilih topik permasalahan Anda:
            </div>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              style={{
                width: "100%",
                padding: "7px 10px",
                border: "2px solid #0D3CFC",
                borderRadius: "5px",
                fontSize: "13px",
                fontFamily: FONT_FAMILY,
                outline: "none",
                backgroundColor: "#fff",
                marginBottom: "10px",
                color: "#0D3CFC",
              }}
            >
              <option value="">-- Pilih topik --</option>
              {topics.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={startChat}
                disabled={!selectedTopic}
                style={{
                  padding: "5px 14px",
                  backgroundColor: selectedTopic ? "#0D3CFC" : "#ccc",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  fontSize: "12px",
                  fontWeight: 500,
                  cursor: selectedTopic ? "pointer" : "not-allowed",
                  fontFamily: FONT_FAMILY,
                }}
              >
                Mulai Chat
              </button>
              <button
                onClick={() => setShowStartChat(false)}
                style={{
                  padding: "5px 14px",
                  backgroundColor: "transparent",
                  color: "#666",
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                  fontSize: "12px",
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: FONT_FAMILY,
                }}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      );
    }

    // USER VIEW - Chat interface
    return (
      <div style={{ marginTop: "40px", paddingTop: "30px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <h3 ref={liveChatTitleRef} style={{
            fontSize: "20px",
            fontWeight: 600,
            color: "#0D3CFC",
            fontFamily: FONT_FAMILY,
            margin: 0,
          }}>
            Live Chat Agent
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <PulsingDots active={agentOnline} />
              <span style={{ fontSize: "11px", color: agentOnline ? "#0D3CFC" : "#999", fontFamily: FONT_FAMILY }}>
                {agentOnline ? "Online" : "Offline"}
              </span>
            </div>
            <button
              onClick={handleLogout}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "4px 10px",
                backgroundColor: "transparent",
                color: "#ef4444",
                border: "1px solid #ef4444",
                borderRadius: "4px",
                fontSize: "11px",
                cursor: "pointer",
                fontFamily: FONT_FAMILY,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#fef2f2"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
            >
              <LogoutIcon size={13} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {botWarning && (
          <div style={{
            backgroundColor: "#fee2e2",
            color: "#991b1b",
            padding: "8px 12px",
            borderRadius: "5px",
            fontSize: "12px",
            marginBottom: "10px",
            fontFamily: FONT_FAMILY,
          }}>
            {botWarning}
          </div>
        )}

        <div style={{ 
          display: "flex", 
          gap: "12px", 
          height: "450px",
          width: "100%",
          overflow: "hidden",
          borderRadius: "8px",
        }}>
          {/* Left sidebar - chat list */}
          <div style={{
            width: "220px",
            backgroundColor: "#0D3CFC",
            borderRadius: "8px",
            padding: "10px 0",
            overflowY: "auto",
            flexShrink: 0,
            color: "#fff",
            fontFamily: FONT_FAMILY,
            height: "450px",
          }}>
            <div style={{
              padding: "0 10px 8px 10px",
              borderBottom: "1px solid rgba(255,255,255,0.15)",
              fontWeight: 600,
              fontSize: "11px",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              color: "#fff",
              position: "sticky",
              top: 0,
              backgroundColor: "#0D3CFC",
              zIndex: 1,
            }}>
              <ChatIconSmall />
              <span>Riwayat Chat</span>
              <span style={{
                marginLeft: "auto",
                fontSize: "9px",
                backgroundColor: "rgba(255,255,255,0.2)",
                padding: "1px 6px",
                borderRadius: "8px",
              }}>{tickets.filter(t => t.userId === user.uid).length}</span>
            </div>
            <div style={{ overflowY: "auto", height: "340px" }}>
              {tickets.filter(t => t.userId === user.uid).map((ticket) => {
                const ticketId = generateTicketId(ticket.createdAt);
                const isActive = selectedTicket?.id === ticket.id;
                const statusLabel = ticket.status === 'waiting' ? 'Menunggu' :
                                    ticket.status === 'active' ? 'Aktif' : 'Selesai';
                const statusColor = ticket.status === 'waiting' ? '#fef3c7' :
                                    ticket.status === 'active' ? '#d1fae5' : '#e5e7eb';
                const statusTextColor = ticket.status === 'waiting' ? '#92400e' :
                                        ticket.status === 'active' ? '#065f46' : '#6b7280';
                return (
                  <div
                    key={ticket.id}
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setMessages([]);
                    }}
                    style={{
                      padding: "8px 10px",
                      borderLeft: isActive ? "3px solid #fff" : "3px solid transparent",
                      backgroundColor: isActive ? "rgba(255,255,255,0.1)" : "transparent",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div style={{ fontWeight: 500, fontSize: "12px", color: "#fff" }}>
                      {ticket.userName}
                    </div>
                    <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.7)" }}>
                      {ticket.topic}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                      <span style={{
                        fontSize: "8px",
                        backgroundColor: statusColor,
                        color: statusTextColor,
                        padding: "1px 6px",
                        borderRadius: "8px",
                        fontWeight: 500,
                      }}>
                        {statusLabel}
                      </span>
                      <span style={{ fontSize: "7px", color: "rgba(255,255,255,0.4)" }}>
                        {ticketId}
                      </span>
                      {ticket.isAnnouncement && (
                        <span style={{ fontSize: "7px", color: "#fcd34d" }}>📢</span>
                      )}
                      {ticket.isBroadcast && (
                        <span style={{ fontSize: "7px", color: "#60a5fa" }}>📡</span>
                      )}
                    </div>
                  </div>
                );
              })}
              {tickets.filter(t => t.userId === user.uid).length === 0 && (
                <div style={{ padding: "20px 10px", textAlign: "center", color: "rgba(255,255,255,0.5)", fontSize: "11px" }}>
                  Belum ada chat
                </div>
              )}
            </div>
            <div style={{ 
              padding: "8px 10px", 
              borderTop: "1px solid rgba(255,255,255,0.1)",
              position: "sticky",
              bottom: 0,
              backgroundColor: "#0D3CFC",
            }}>
              <button
                onClick={() => setShowStartChat(true)}
                style={{
                  width: "100%",
                  padding: "5px",
                  backgroundColor: "rgba(255,255,255,0.15)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  fontSize: "11px",
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: FONT_FAMILY,
                }}
              >
                + Chat Baru
              </button>
            </div>
          </div>

          {/* Right side - chat messages */}
          <div style={{
            flex: 1,
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            border: "1px solid #e8e8e8",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            height: "450px",
          }}>
            {selectedTicket ? (
              <>
                <div style={{
                  padding: "8px 12px",
                  backgroundColor: "#0D3CFC",
                  borderBottom: "1px solid #e8e8e8",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexShrink: 0,
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "13px", color: "#ffffff", fontFamily: FONT_FAMILY }}>
                      {selectedTicket.userName}
                      <span style={{ fontSize: "10px", fontWeight: 400, color: "rgba(255,255,255,0.7)", marginLeft: "5px", fontFamily: FONT_FAMILY }}>
                        {selectedTicket.topic}
                      </span>
                      {selectedTicket.isAnnouncement && (
                        <span style={{ fontSize: "10px", color: "#fcd34d", marginLeft: "5px" }}>📢 Pengumuman</span>
                      )}
                      {selectedTicket.isBroadcast && (
                        <span style={{ fontSize: "10px", color: "#60a5fa", marginLeft: "5px" }}>📡 Broadcast</span>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <span style={{ fontSize: "9px", color: selectedTicket.status === 'waiting' ? "#fef3c7" : "#d1fae5", fontFamily: FONT_FAMILY }}>
                        {selectedTicket.status === 'waiting' ? 'Menunggu' : 'Aktif'}
                      </span>
                      {selectedTicket.typing && selectedTicket.status !== 'resolved' && (
                        <span style={{ fontSize: "9px", color: "#ffd700", fontStyle: "italic", fontFamily: FONT_FAMILY }}>
                          {selectedTicket.typingUserName} mengetik...
                        </span>
                      )}
                      <span style={{ fontSize: "8px", color: "rgba(255,255,255,0.5)" }}>
                        {generateTicketId(selectedTicket.createdAt)}
                      </span>
                    </div>
                  </div>
                  {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                    <button
                      onClick={() => resolveTicket(selectedTicket.id)}
                      style={{
                        padding: "3px 8px",
                        backgroundColor: "#22c55e",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        fontSize: "9px",
                        cursor: "pointer",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      Selesaikan
                    </button>
                  )}
                </div>
                <div 
                  ref={chatMessagesContainerRef}
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "10px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    minHeight: 0,
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                  }}
                >
                  <style>{`
                    .chat-messages-container::-webkit-scrollbar {
                      display: none;
                    }
                  `}</style>
                  <div className="chat-messages-container" style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "10px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    minHeight: 0,
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                  }}>
                    {messages.length === 0 ? (
                      <div style={{ textAlign: "center", color: "#999", fontSize: "11px", padding: "20px 0", fontFamily: FONT_FAMILY }}>
                        Belum ada pesan
                      </div>
                    ) : (
                      messages.map((msg, idx) => {
                        const isMine = msg.senderId === user.uid;
                        const isAgent = !isMine && msg.senderName === AGENT_NAME;
                        return (
                          <div
                            key={idx}
                            style={{
                              alignSelf: isMine ? "flex-end" : "flex-start",
                              maxWidth: "75%",
                              padding: "5px 8px",
                              borderRadius: "6px",
                              backgroundColor: isMine ? "#0D3CFC" : "#e8e8e8",
                              color: isMine ? "#fff" : "#000",
                              fontSize: "11px",
                              fontFamily: FONT_FAMILY,
                              wordBreak: "break-word",
                            }}
                          >
                            {!isMine && (
                              <div style={{ fontSize: "8px", fontWeight: 500, color: "#0D3CFC", marginBottom: "2px", display: "flex", alignItems: "center", gap: "3px" }}>
                                {msg.senderName}
                                {isAgent && <InstagramVerifiedBadge size={9} />}
                              </div>
                            )}
                            <div>
                              {msg.isEncrypted ? '🔒 ' : ''}{msg.text}
                              {msg.isBotDetected && <span style={{ fontSize: "8px", color: "#ef4444", marginLeft: "4px" }}>⚠️</span>}
                            </div>
                            <div style={{ 
                              fontSize: "6px", 
                              color: isMine ? "rgba(255,255,255,0.6)" : "#999", 
                              marginTop: "2px",
                              textAlign: "right",
                            }}>
                              {formatTime(msg.timestamp)}
                              {msg.isEncrypted && <span style={{ marginLeft: "4px" }}>🔐</span>}
                            </div>
                          </div>
                        );
                      })
                    )}
                    {getTypingText(selectedTicket) && selectedTicket.status !== 'resolved' && (
                      <div style={{
                        alignSelf: "flex-start",
                        fontSize: "10px",
                        color: "#666",
                        fontStyle: "italic",
                        padding: "2px 5px",
                        fontFamily: FONT_FAMILY,
                      }}>
                        {getTypingText(selectedTicket)}
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
                {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                  <div style={{
                    padding: "6px 10px",
                    borderTop: "1px solid #e8e8e8",
                    display: "flex",
                    gap: "5px",
                    backgroundColor: "#fff",
                    flexShrink: 0,
                  }}>
                    <input
                      type="text"
                      value={messageText}
                      onChange={handleTyping}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey && messageText.trim()) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      placeholder={selectedTicket.status === 'waiting' ? "Menunggu agent..." : "Ketik pesan..."}
                      disabled={selectedTicket.status === 'waiting' || isBanned}
                      style={{
                        flex: 1,
                        padding: "5px 8px",
                        border: "1px solid #e8e8e8",
                        borderRadius: "5px",
                        fontSize: "11px",
                        outline: "none",
                        fontFamily: FONT_FAMILY,
                        backgroundColor: (selectedTicket.status === 'waiting' || isBanned) ? "#f5f5f5" : "#fff",
                      }}
                      onFocus={(e) => { if (selectedTicket.status !== 'waiting' && !isBanned) e.currentTarget.style.borderColor = "#0D3CFC"; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "#e8e8e8"; }}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={selectedTicket.status === 'waiting' || !messageText.trim() || isBanned}
                      style={{
                        padding: "5px 10px",
                        backgroundColor: (selectedTicket.status === 'waiting' || !messageText.trim() || isBanned) ? "#ccc" : "#0D3CFC",
                        color: "#fff",
                        border: "none",
                        borderRadius: "5px",
                        cursor: (selectedTicket.status === 'waiting' || !messageText.trim() || isBanned) ? "not-allowed" : "pointer",
                        fontFamily: FONT_FAMILY,
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "11px",
                      }}
                    >
                      <SendIcon size={12} />
                      <span>Kirim</span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#999",
                fontSize: "12px",
                fontFamily: FONT_FAMILY,
              }}>
                Pilih chat dari daftar di kiri
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ADMIN VIEW
  const waitingTickets = tickets.filter(t => t.status === 'waiting');
  const activeTickets = tickets.filter(t => t.status === 'active');
  const resolvedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed');
  const typingText = selectedTicket ? getTypingText(selectedTicket) : null;

  return (
    <div style={{ marginTop: "40px", paddingTop: "30px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <h3 ref={liveChatTitleRef} style={{
          fontSize: "20px",
          fontWeight: 600,
          color: "#0D3CFC",
          fontFamily: FONT_FAMILY,
          margin: 0,
        }}>
          Live Chat Agent
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <PulsingDots active={agentOnline} />
            <span style={{ fontSize: "11px", color: agentOnline ? "#0D3CFC" : "#999", fontFamily: FONT_FAMILY }}>
              {agentOnline ? "Online" : "Offline"}
            </span>
          </div>
          <span style={{ fontSize: "11px", color: "#999", fontFamily: FONT_FAMILY }}>•</span>
          <span style={{ fontSize: "11px", color: "#0D3CFC", fontFamily: FONT_FAMILY }}>
            {AGENT_NAME}
          </span>
          <span style={{
            backgroundColor: "#d1fae5",
            color: "#065f46",
            fontSize: "8px",
            fontWeight: 600,
            padding: "1px 6px",
            borderRadius: "8px",
            fontFamily: FONT_FAMILY,
          }}>
            Agent
          </span>
          <InstagramVerifiedBadge size={11} />
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 10px",
              backgroundColor: "transparent",
              color: "#ef4444",
              border: "1px solid #ef4444",
              borderRadius: "4px",
              fontSize: "11px",
              cursor: "pointer",
              fontFamily: FONT_FAMILY,
              transition: "all 0.2s ease",
              marginLeft: "4px",
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#fef2f2"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
          >
            <LogoutIcon size={13} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: "12px", height: "450px" }}>
        <div style={{
          width: "220px",
          backgroundColor: "#f9f9f9",
          borderRadius: "8px",
          border: "1px solid #e8e8e8",
          overflowY: "auto",
          flexShrink: 0,
          height: "450px",
        }}>
          {waitingTickets.length > 0 && (
            <div>
              <div style={{
                padding: "6px 10px",
                backgroundColor: "#fef3c7",
                fontWeight: 600,
                fontSize: "11px",
                color: "#92400e",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontFamily: FONT_FAMILY,
                position: "sticky",
                top: 0,
                zIndex: 1,
              }}>
                <WaitingIcon />
                <span>Menunggu ({waitingTickets.length})</span>
              </div>
              {waitingTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => {
                    setSelectedTicket(ticket);
                    takeTicket(ticket.id);
                  }}
                  style={{
                    padding: "7px 10px",
                    borderBottom: "1px solid #e8e8e8",
                    cursor: "pointer",
                    backgroundColor: selectedTicket?.id === ticket.id ? "rgba(13,60,252,0.08)" : "transparent",
                    transition: "background 0.2s ease",
                  }}
                >
                  <div style={{ fontWeight: 500, fontSize: "11px", color: "#0D3CFC", fontFamily: FONT_FAMILY }}>{ticket.userName}</div>
                  <div style={{ fontSize: "9px", color: "#666", fontFamily: FONT_FAMILY }}>{ticket.topic}</div>
                  {ticket.typing && <div style={{ fontSize: "8px", color: "#0D3CFC", fontStyle: "italic", fontFamily: FONT_FAMILY }}>{ticket.typingUserName} mengetik...</div>}
                </div>
              ))}
            </div>
          )}

          {activeTickets.length > 0 && (
            <div>
              <div style={{
                padding: "6px 10px",
                backgroundColor: "#d1fae5",
                fontWeight: 600,
                fontSize: "11px",
                color: "#065f46",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontFamily: FONT_FAMILY,
                position: "sticky",
                top: 0,
                zIndex: 1,
              }}>
                <ActiveIcon />
                <span>Aktif ({activeTickets.length})</span>
              </div>
              {activeTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  style={{
                    padding: "7px 10px",
                    borderBottom: "1px solid #e8e8e8",
                    cursor: "pointer",
                    backgroundColor: selectedTicket?.id === ticket.id ? "rgba(13,60,252,0.08)" : "transparent",
                    transition: "background 0.2s ease",
                  }}
                >
                  <div style={{ fontWeight: 500, fontSize: "11px", color: "#0D3CFC", fontFamily: FONT_FAMILY }}>{ticket.userName}</div>
                  <div style={{ fontSize: "9px", color: "#666", fontFamily: FONT_FAMILY }}>{ticket.topic}</div>
                  {ticket.typing && <div style={{ fontSize: "8px", color: "#0D3CFC", fontStyle: "italic", fontFamily: FONT_FAMILY }}>{ticket.typingUserName} mengetik...</div>}
                  {ticket.lastMessage && <div style={{ fontSize: "8px", color: "#999", marginTop: "2px", fontFamily: FONT_FAMILY }}>{ticket.lastMessage.substring(0, 25)}{ticket.lastMessage.length > 25 ? "..." : ""}</div>}
                </div>
              ))}
            </div>
          )}

          {resolvedTickets.length > 0 && (
            <div>
              <div style={{
                padding: "6px 10px",
                backgroundColor: "#e5e7eb",
                fontWeight: 600,
                fontSize: "11px",
                color: "#6b7280",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontFamily: FONT_FAMILY,
                position: "sticky",
                top: 0,
                zIndex: 1,
              }}>
                <ResolvedIcon />
                <span>Selesai ({resolvedTickets.length})</span>
              </div>
              {resolvedTickets.map((ticket) => {
                const ticketId = generateTicketId(ticket.createdAt);
                return (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    style={{
                      padding: "7px 10px",
                      borderBottom: "1px solid #e8e8e8",
                      cursor: "pointer",
                      backgroundColor: selectedTicket?.id === ticket.id ? "rgba(13,60,252,0.08)" : "transparent",
                      transition: "background 0.2s ease",
                      opacity: 0.7,
                    }}
                  >
                    <div style={{ fontWeight: 500, fontSize: "11px", color: "#0D3CFC", fontFamily: FONT_FAMILY }}>{ticket.userName}</div>
                    <div style={{ fontSize: "9px", color: "#666", fontFamily: FONT_FAMILY }}>{ticket.topic}</div>
                    <div style={{ fontSize: "8px", color: "#6b7280", fontFamily: FONT_FAMILY }}>{ticketId}</div>
                  </div>
                );
              })}
            </div>
          )}

          {waitingTickets.length === 0 && activeTickets.length === 0 && resolvedTickets.length === 0 && (
            <div style={{ padding: "20px 10px", textAlign: "center", color: "#999", fontSize: "11px", fontFamily: FONT_FAMILY }}>
              Tidak ada chat masuk
            </div>
          )}
        </div>

        <div style={{
          flex: 1,
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          border: "1px solid #e8e8e8",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          height: "450px",
        }}>
          {selectedTicket ? (
            <>
              <div style={{
                padding: "8px 12px",
                backgroundColor: "#0D3CFC",
                borderBottom: "1px solid #e8e8e8",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexShrink: 0,
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "13px", color: "#ffffff", fontFamily: FONT_FAMILY }}>
                    {selectedTicket.userName}
                    <span style={{ fontSize: "10px", fontWeight: 400, color: "rgba(255,255,255,0.7)", marginLeft: "5px", fontFamily: FONT_FAMILY }}>
                      {selectedTicket.topic}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ fontSize: "9px", color: selectedTicket.status === 'waiting' ? "#fef3c7" : "#d1fae5", fontFamily: FONT_FAMILY }}>
                      {selectedTicket.status === 'waiting' ? 'Menunggu' : 'Aktif'}
                    </span>
                    {selectedTicket.typing && selectedTicket.status !== 'resolved' && (
                      <span style={{ fontSize: "9px", color: "#ffd700", fontStyle: "italic", fontFamily: FONT_FAMILY }}>
                        {selectedTicket.typingUserName} mengetik...
                      </span>
                    )}
                    <span style={{ fontSize: "8px", color: "rgba(255,255,255,0.5)" }}>
                      {generateTicketId(selectedTicket.createdAt)}
                    </span>
                  </div>
                </div>
                {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                  <button
                    onClick={() => resolveTicket(selectedTicket.id)}
                    style={{
                      padding: "3px 8px",
                      backgroundColor: "#22c55e",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      fontSize: "9px",
                      cursor: "pointer",
                      fontFamily: FONT_FAMILY,
                    }}
                  >
                    Selesaikan
                  </button>
                )}
              </div>
              <div 
                ref={chatMessagesContainerRef}
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "10px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  minHeight: 0,
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                <style>{`
                  .chat-messages-container-admin::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>
                <div className="chat-messages-container-admin" style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "10px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  minHeight: 0,
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}>
                  {messages.length === 0 ? (
                    <div style={{ textAlign: "center", color: "#999", fontSize: "11px", padding: "20px 0", fontFamily: FONT_FAMILY }}>
                      Belum ada pesan
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isMine = msg.senderId === user.uid;
                      return (
                        <div
                          key={idx}
                          style={{
                            alignSelf: isMine ? "flex-end" : "flex-start",
                            maxWidth: "75%",
                            padding: "5px 8px",
                            borderRadius: "6px",
                            backgroundColor: isMine ? "#0D3CFC" : "#e8e8e8",
                            color: isMine ? "#fff" : "#000",
                            fontSize: "11px",
                            fontFamily: FONT_FAMILY,
                            wordBreak: "break-word",
                          }}
                        >
                          {!isMine && (
                            <div style={{ fontSize: "8px", fontWeight: 500, color: "#0D3CFC", marginBottom: "2px", fontFamily: FONT_FAMILY }}>
                              {msg.senderName}
                            </div>
                          )}
                          <div>
                            {msg.isEncrypted ? '🔒 ' : ''}{msg.text}
                            {msg.isBotDetected && <span style={{ fontSize: "8px", color: "#ef4444", marginLeft: "4px" }}>⚠️</span>}
                          </div>
                          <div style={{ 
                            fontSize: "6px", 
                            color: isMine ? "rgba(255,255,255,0.6)" : "#999", 
                            marginTop: "2px",
                            textAlign: "right",
                          }}>
                            {formatTime(msg.timestamp)}
                            {msg.isEncrypted && <span style={{ marginLeft: "4px" }}>🔐</span>}
                          </div>
                        </div>
                      );
                    })
                  )}
                  {typingText && selectedTicket.status !== 'resolved' && (
                    <div style={{
                      alignSelf: "flex-start",
                      fontSize: "10px",
                      color: "#666",
                      fontStyle: "italic",
                      padding: "2px 5px",
                      fontFamily: FONT_FAMILY,
                    }}>
                      {typingText}
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>
              {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                <div style={{
                  padding: "6px 10px",
                  borderTop: "1px solid #e8e8e8",
                  display: "flex",
                  gap: "5px",
                  backgroundColor: "#fff",
                  flexShrink: 0,
                }}>
                  <input
                    type="text"
                    value={messageText}
                    onChange={handleTyping}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey && messageText.trim()) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Ketik balasan..."
                    style={{
                      flex: 1,
                      padding: "5px 8px",
                      border: "1px solid #e8e8e8",
                      borderRadius: "5px",
                      fontSize: "11px",
                      outline: "none",
                      fontFamily: FONT_FAMILY,
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = "#0D3CFC"}
                    onBlur={(e) => e.currentTarget.style.borderColor = "#e8e8e8"}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!messageText.trim()}
                    style={{
                      padding: "5px 10px",
                      backgroundColor: messageText.trim() ? "#0D3CFC" : "#ccc",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                      cursor: messageText.trim() ? "pointer" : "not-allowed",
                      fontFamily: FONT_FAMILY,
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "11px",
                    }}
                  >
                    <SendIcon size={12} />
                    <span>Kirim</span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#999",
              fontSize: "12px",
              fontFamily: FONT_FAMILY,
            }}>
              Pilih chat dari daftar di kiri
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function HomePage(): React.JSX.Element {
  const [showMain, setShowMain] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFeaturesVisible, setIsFeaturesVisible] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  
  const preloaderRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);
  const menuOverlayRef = useRef<HTMLDivElement>(null);
  const navbarRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const plusIconRef = useRef<HTMLSpanElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const featuresTextRef = useRef<HTMLHeadingElement>(null);
  const featuresContainerRef = useRef<HTMLDivElement>(null);
  const menuruFooterRef = useRef<HTMLDivElement>(null);
  const menuruTextRef = useRef<HTMLSpanElement>(null);
  const menuItemsRef = useRef<HTMLDivElement>(null);
  const menuBoxRef = useRef<HTMLDivElement>(null);
  const menuBox2Ref = useRef<HTMLDivElement>(null);
  const menuBox3Ref = useRef<HTMLDivElement>(null);
  const storiesRef = useRef<HTMLDivElement>(null);

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
          const userRef = doc(db, "users", currentUser.uid);
          await updateDoc(userRef, {
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
    if (videoRef.current && showMain && isMounted) {
      videoRef.current.play().catch(error => {
        console.log("Video autoplay failed:", error);
      });
    }
  }, [showMain, isMounted]);

  useEffect(() => {
    if (!menuOverlayRef.current || !isMounted) return;
    
    if (isMenuOpen) {
      gsap.fromTo(menuOverlayRef.current,
        { y: '-100%', opacity: 0 },
        {
          y: '0%',
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          onComplete: () => {
            const items = menuOverlayRef.current?.querySelectorAll('.menu-item');
            if (items) {
              gsap.fromTo(items,
                { opacity: 0, y: 30 },
                {
                  opacity: 1,
                  y: 0,
                  duration: 0.6,
                  stagger: 0.08,
                  ease: 'power3.out'
                }
              );
            }
            if (menuBoxRef.current) {
              gsap.fromTo(menuBoxRef.current,
                { opacity: 0, scale: 0.9, x: 20 },
                {
                  opacity: 1,
                  scale: 1,
                  x: 0,
                  duration: 0.8,
                  ease: 'power3.out'
                }
              );
            }
            if (storiesRef.current) {
              gsap.fromTo(storiesRef.current,
                { opacity: 0, y: 20 },
                {
                  opacity: 1,
                  y: 0,
                  duration: 0.8,
                  ease: 'power3.out'
                }
              );
            }
            if (menuBox2Ref.current) {
              gsap.fromTo(menuBox2Ref.current,
                { opacity: 0, scale: 0.9, x: 20 },
                {
                  opacity: 1,
                  scale: 1,
                  x: 0,
                  duration: 0.8,
                  ease: 'power3.out',
                  delay: 0.2
                }
              );
            }
            if (menuBox3Ref.current) {
              gsap.fromTo(menuBox3Ref.current,
                { opacity: 0, scale: 0.9, x: 20 },
                {
                  opacity: 1,
                  scale: 1,
                  x: 0,
                  duration: 0.8,
                  ease: 'power3.out',
                  delay: 0.3
                }
              );
            }
          }
        }
      );
    } else {
      gsap.to(menuOverlayRef.current, {
        y: '-100%',
        opacity: 0,
        duration: 0.6,
        ease: 'power3.in'
      });
    }
  }, [isMenuOpen, isMounted]);

  useEffect(() => {
    if (!showMain || !isMounted) return;

    const featuresElement = featuresRef.current;
    const featuresTitle = featuresTextRef.current;

    if (featuresElement) {
      const trigger = ScrollTrigger.create({
        trigger: featuresElement,
        start: "top bottom",
        end: "bottom top",
        onEnter: () => {
          setIsFeaturesVisible(true);
          gsap.to(featuresElement, {
            backgroundColor: "#0D3CFC",
            duration: 0.8,
            ease: "power2.out"
          });
          gsap.to(featuresTitle, {
            color: "#ffffff",
            duration: 0.8,
            ease: "power2.out"
          });
          gsap.utils.toArray('.feature-name').forEach((el: any) => {
            gsap.to(el, {
              color: "#ffffff",
              duration: 0.8,
              ease: "power2.out"
            });
          });
        },
        onLeave: () => {
          setIsFeaturesVisible(false);
          gsap.to(featuresElement, {
            backgroundColor: "#ffffff",
            duration: 0.8,
            ease: "power2.out"
          });
          gsap.to(featuresTitle, {
            color: "#0D3CFC",
            duration: 0.8,
            ease: "power2.out"
          });
          gsap.utils.toArray('.feature-name').forEach((el: any) => {
            gsap.to(el, {
              color: "#0D3CFC",
              duration: 0.8,
              ease: "power2.out"
            });
          });
        },
        onEnterBack: () => {
          setIsFeaturesVisible(true);
          gsap.to(featuresElement, {
            backgroundColor: "#0D3CFC",
            duration: 0.8,
            ease: "power2.out"
          });
          gsap.to(featuresTitle, {
            color: "#ffffff",
            duration: 0.8,
            ease: "power2.out"
          });
          gsap.utils.toArray('.feature-name').forEach((el: any) => {
            gsap.to(el, {
              color: "#ffffff",
              duration: 0.8,
              ease: "power2.out"
            });
          });
        },
        onLeaveBack: () => {
          setIsFeaturesVisible(false);
          gsap.to(featuresElement, {
            backgroundColor: "#ffffff",
            duration: 0.8,
            ease: "power2.out"
          });
          gsap.to(featuresTitle, {
            color: "#0D3CFC",
            duration: 0.8,
            ease: "power2.out"
          });
          gsap.utils.toArray('.feature-name').forEach((el: any) => {
            gsap.to(el, {
              color: "#0D3CFC",
              duration: 0.8,
              ease: "power2.out"
            });
          });
        }
      });
    }

    const menuruElement = menuruFooterRef.current;
    const menuruText = menuruTextRef.current;
    
    if (menuruElement && menuruText) {
      const split = new SplitText(menuruText, {
        type: "chars",
        charsClass: "menuru-char"
      });

      gsap.set(split.chars, {
        opacity: 0,
        y: 100,
        scale: 0.5,
        rotationX: 90
      });

      ScrollTrigger.create({
        trigger: menuruElement,
        start: "top 85%",
        onEnter: () => {
          gsap.to(split.chars, {
            opacity: 1,
            y: 0,
            scale: 1,
            rotationX: 0,
            duration: 1.2,
            stagger: 0.03,
            ease: "back.out(1.7)",
            overwrite: true
          });
        },
        onLeave: () => {
          gsap.to(split.chars, {
            opacity: 0,
            y: 100,
            scale: 0.5,
            rotationX: 90,
            duration: 0.8,
            stagger: 0.02,
            ease: "power2.in",
            overwrite: true
          });
        },
        onEnterBack: () => {
          gsap.to(split.chars, {
            opacity: 1,
            y: 0,
            scale: 1,
            rotationX: 0,
            duration: 1.2,
            stagger: 0.03,
            ease: "back.out(1.7)",
            overwrite: true
          });
        }
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
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
              setTimeout(() => {
                ScrollTrigger.refresh();
              }, 200);
            }
          });
        }
      }
    });

    gsap.set(textRef.current, { y: 100, opacity: 0 });

    tl.to(textRef.current, {
      y: 0,
      opacity: 1,
      duration: 0.8,
      ease: "back.out(1.7)"
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
      }
    })
    .to(textRef.current, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.6,
      ease: "back.out(1.7)"
    })
    .to(textRef.current, { duration: 0.8 })
    .to(textRef.current, {
      scale: 0.3,
      opacity: 0,
      duration: 0.7,
      ease: "power2.in"
    })
    .to(preloaderRef.current, {
      scale: 0.95,
      opacity: 0.8,
      duration: 0.3,
      ease: "power2.inOut"
    }, "-=0.3");
  };

  const toggleMenu = () => {
    if (!isMenuOpen) {
      setIsMenuOpen(true);
      if (plusIconRef.current) {
        gsap.to(plusIconRef.current, {
          rotation: 45,
          duration: 0.4,
          ease: "power2.out"
        });
      }
    } else {
      if (plusIconRef.current) {
        gsap.to(plusIconRef.current, {
          rotation: 0,
          duration: 0.4,
          ease: "power2.in"
        });
      }
      setIsMenuOpen(false);
    }
  };

  // Loading state
  if (!isMounted || loading) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "#ffffff",
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
              color: "#0D3CFC",
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
              color: "#000000",
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
          backgroundColor: "#ffffff",
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
              color: "#0D3CFC",
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
              color: "#000000",
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
          margin: 0,
          padding: 0,
          position: "relative",
          fontFamily: FONT_FAMILY,
          overflow: "visible",
        }}
      >
        {/* HERO SECTION */}
        <div
          ref={heroRef}
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            padding: "40px",
            backgroundColor: "#ffffff",
            position: "relative",
            paddingTop: "120px",
          }}
        >
          <h1
            ref={titleRef}
            className="title"
            style={{
              fontSize: "48px",
              fontWeight: 700,
              color: "#000000",
              fontFamily: FONT_FAMILY,
              letterSpacing: "-0.03em",
              margin: 0,
              padding: "10px 20px",
              lineHeight: 1,
              position: "fixed",
              top: "40px",
              left: "40px",
              zIndex: 15,
              pointerEvents: "none",
              backdropFilter: "blur(10px)",
              backgroundColor: "rgba(255,255,255,0.7)",
              borderRadius: "12px",
            }}
          >
            Menuru
          </h1>

          <div style={{ 
            position: "relative", 
            zIndex: 1,
            marginTop: "60px",
          }}>
            <div
              ref={subtitleRef}
              className="subtitle"
              style={{
                textAlign: "left",
                position: "relative",
              }}
            >
              <p
                style={{
                  fontSize: "60px",
                  fontWeight: 400,
                  color: "#0D3CFC",
                  fontFamily: FONT_FAMILY,
                  lineHeight: 1.2,
                  margin: 0,
                  padding: 0,
                  paddingBottom: "30px",
                  whiteSpace: "pre-line",
                }}
              >
                {`You can take notes, find ideas,\nand donate money to those in need`}
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "20px", position: "relative" }}>
              <div
                ref={buttonRef}
                className="cta-button"
                style={{
                  display: "inline-block",
                  border: "2px solid #0D3CFC",
                  borderRadius: "8px",
                  padding: "12px 28px",
                  cursor: "pointer",
                  backgroundColor: "transparent",
                }}
              >
                <span
                  style={{
                    fontSize: "18px",
                    fontWeight: 500,
                    color: "#0D3CFC",
                    fontFamily: FONT_FAMILY,
                    letterSpacing: "0.02em",
                  }}
                >
                  Let's build now
                </span>
              </div>

              <div
                ref={arrowRef}
                className="arrow-box"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid #0D3CFC",
                  borderRadius: "8px",
                  padding: "10px",
                  cursor: "pointer",
                  backgroundColor: "#0D3CFC",
                  color: "#ffffff",
                  width: "50px",
                  height: "50px",
                }}
              >
                <NorthEastArrow size={24} color="#ffffff" />
              </div>
            </div>

            <div
              style={{
                marginTop: "60px",
                width: "100%",
                display: "flex",
                justifyContent: "flex-start",
              }}
            >
              <span
                style={{
                  fontSize: "48px",
                  fontWeight: 600,
                  color: "#0D3CFC",
                  fontFamily: FONT_FAMILY,
                  letterSpacing: "-0.02em",
                }}
              >
                Showreel 2026
              </span>
            </div>

            <div
              style={{
                marginTop: "20px",
                width: "1500px",
                maxWidth: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginLeft: 0,
              }}
            >
              <video
                ref={videoRef}
                src="/videos/1.mp4"
                autoPlay
                loop
                muted
                playsInline
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  backgroundColor: "transparent",
                }}
                onError={(e) => {
                  console.error("Video failed to load:", e);
                }}
              />
            </div>
          </div>
        </div>

        {/* FEATURES SECTION */}
        <div
          ref={featuresRef}
          style={{
            minHeight: "auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "flex-start",
            padding: "60px 40px",
            backgroundColor: "#ffffff",
            position: "relative",
            paddingTop: "100px",
            paddingBottom: "100px",
          }}
        >
          <h2
            ref={featuresTextRef}
            style={{
              fontSize: "80px",
              fontWeight: 700,
              color: "#0D3CFC",
              fontFamily: FONT_FAMILY,
              letterSpacing: "-0.03em",
              margin: 0,
              padding: 0,
              paddingBottom: "50px",
              textAlign: "left",
            }}
          >
            Our Features
          </h2>

          <div
            ref={featuresContainerRef}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "30px",
              width: "100%",
              maxWidth: "1400px",
            }}
          >
            {featuresData.map((feature, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  padding: "0",
                  transition: "all 0.3s ease",
                }}
              >
                <h3
                  className="feature-name"
                  style={{
                    fontSize: "64px",
                    fontWeight: 600,
                    color: "#0D3CFC",
                    fontFamily: FONT_FAMILY,
                    margin: 0,
                    padding: 0,
                    lineHeight: 1.2,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {feature.name}
                </h3>
              </div>
            ))}
          </div>
        </div>

        {/* LIVE CHAT AGENT */}
        <div style={{ padding: "0 40px", maxWidth: "1400px", margin: "0 auto", width: "100%" }}>
          <LiveChatAgent user={user} isAdmin={isAdmin} db={db} auth={auth} />
        </div>

        {/* FOOTER */}
        <div
          style={{
            width: "100%",
            padding: "60px 40px 40px 40px",
            backgroundColor: "#ffffff",
            borderTop: "1px solid rgba(0,0,0,0.05)",
            marginTop: "20px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Foto Kiri */}
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
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                objectFit: "cover",
              }}
            />
          </div>

          {/* Foto Kanan */}
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
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                objectFit: "cover",
              }}
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
              <div
                key={idx}
                style={{
                  flex: "1",
                  minWidth: "200px",
                }}
              >
                <h3
                  style={{
                    fontFamily: FONT_FAMILY,
                    fontSize: "28px",
                    fontWeight: 600,
                    color: "#000000",
                    margin: 0,
                    marginBottom: "16px",
                    letterSpacing: "-0.01em",
                    textTransform: "none",
                  }}
                >
                  {section.title}
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {section.links.map((link, linkIdx) => {
                    let linkHref = "#";
                    let isAttention = false;
                    let isStories = false;
                    
                    if (link === "Contact") {
                      linkHref = "/contact";
                    } else if (link === "Live Chat") {
                      linkHref = "/live-chat";
                    } else if (link === "Live Chat Agent") {
                      linkHref = "/live-chat-agent";
                    } else if (link === "Pusat Bantuan") {
                      linkHref = "/pusat-bantuan";
                    } else if (link === "Kebijakan Privasi") {
                      linkHref = "/privacy-policy";
                      isAttention = true;
                    } else if (link === "Ketentuan Kami") {
                      linkHref = "/terms-of-service";
                      isAttention = true;
                    } else if (link === "Stories") {
                      linkHref = "/stories";
                      isStories = true;
                    } else if (link === "Shop") {
                      linkHref = "/shop";
                    } else if (link === "Note") {
                      linkHref = "/note";
                    } else if (link === "Calendar") {
                      linkHref = "/calendar";
                    } else if (link === "Blog") {
                      linkHref = "/blog";
                    } else if (link === "Donation") {
                      linkHref = "/donation";
                    } else if (link === "Community") {
                      linkHref = "/community";
                    } else if (link === "Instagram") {
                      linkHref = "https://instagram.com/menuru";
                    }
                    
                    return (
                      <div
                        key={linkIdx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <Link href={linkHref} style={{ textDecoration: "none" }}>
                          <span
                            style={{
                              fontFamily: FONT_FAMILY,
                              fontSize: "20px",
                              fontWeight: 400,
                              color: "#0D3CFC",
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
                              backgroundColor: "#0D3CFC",
                              color: "#ffffff",
                              padding: "2px 10px",
                              borderRadius: "4px",
                              fontSize: "11px",
                              fontWeight: 600,
                              fontFamily: FONT_FAMILY,
                              letterSpacing: "0.3px",
                              display: "inline-block",
                            }}
                          >
                            Update
                          </span>
                        )}
                        {isStories && (
                          <span
                            style={{
                              backgroundColor: "#0D3CFC",
                              color: "#ffffff",
                              padding: "2px 10px",
                              borderRadius: "4px",
                              fontSize: "11px",
                              fontWeight: 600,
                              fontFamily: FONT_FAMILY,
                              letterSpacing: "0.3px",
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
        </div>

        {/* MENURU Text - 450px, left aligned */}
        <div
          ref={menuruFooterRef}
          style={{
            width: "100%",
            padding: "20px 40px 80px 40px",
            backgroundColor: "#ffffff",
            overflow: "hidden",
            display: "flex",
            justifyContent: "flex-start",
            minHeight: "300px",
          }}
        >
          <span
            ref={menuruTextRef}
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: "450px",
              fontWeight: 700,
              color: "#0D3CFC",
              letterSpacing: "-0.02em",
              textTransform: "none",
              lineHeight: "0.8",
              display: "block",
              textAlign: "left",
              WebkitFontSmoothing: "antialiased",
              MozOsxFontSmoothing: "grayscale",
            }}
          >
            Menuru
          </span>
        </div>

        {/* NAVBAR */}
        <div
          ref={navbarRef}
          style={{
            position: "fixed",
            top: "40px",
            right: "40px",
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "8px",
            padding: "16px 20px",
            borderRadius: "16px",
            backgroundColor: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(20px)",
            transition: "all 0.3s ease",
            pointerEvents: "auto",
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            <Link href="/shop">
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                <ShoppingBag size={20} color="#0D3CFC" />
                <span style={{ fontSize: "16px", fontWeight: 500, color: "#0D3CFC", fontFamily: FONT_FAMILY }}>Shop</span>
              </div>
            </Link>
            <Link href="/profile">
              <div style={{ display: "inline-flex", alignItems: "center", cursor: "pointer" }}>
                <span style={{ fontSize: "16px", fontWeight: 500, color: "#0D3CFC", fontFamily: FONT_FAMILY }}>About</span>
              </div>
            </Link>
            <Link href="/signup">
              <div style={{ display: "inline-flex", alignItems: "center", cursor: "pointer" }}>
                <span style={{ fontSize: "16px", fontWeight: 500, color: "#0D3CFC", fontFamily: FONT_FAMILY }}>Sign Up</span>
              </div>
            </Link>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "0" }}>
              <ShieldCheck size={28} color="#0D3CFC" />
              <span style={{ fontSize: "30px", fontWeight: 500, color: "#0D3CFC", fontFamily: FONT_FAMILY, lineHeight: 1 }}>Anti-Fraud</span>
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "0" }}>
              <ShieldCheck size={28} color="#0D3CFC" />
              <span style={{ fontSize: "30px", fontWeight: 500, color: "#0D3CFC", fontFamily: FONT_FAMILY, lineHeight: 1 }}>Anti-Bot</span>
            </div>
            <Link href="/contact">
              <div className="get-in-touch" style={{ display: "inline-flex", alignItems: "center", gap: "8px", border: "2px solid #0D3CFC", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", backgroundColor: "transparent" }}>
                <span style={{ fontSize: "16px", fontWeight: 500, color: "#0D3CFC", fontFamily: FONT_FAMILY }}>Get in touch</span>
                <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", backgroundColor: "#0D3CFC", borderRadius: "4px", padding: "4px", color: "#ffffff" }}>
                  <SouthEastArrow size={24} color="#ffffff" />
                </div>
              </div>
            </Link>
            <Link href="/pusat-bantuan">
              <div className="pusat-bantuan" style={{ display: "inline-flex", alignItems: "center", gap: "8px", border: "2px solid #000000", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", backgroundColor: "transparent" }}>
                <span style={{ fontSize: "16px", fontWeight: 500, color: "#000000", fontFamily: FONT_FAMILY }}>Pusat Bantuan</span>
                <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", backgroundColor: "#000000", borderRadius: "4px", padding: "4px", color: "#ffffff" }}>
                  <NorthWestArrow size={24} color="#ffffff" />
                </div>
              </div>
            </Link>
            <div className="menu-button" style={{ display: "inline-flex", alignItems: "center", gap: "8px", border: "2px solid #000000", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", backgroundColor: "transparent" }} onClick={toggleMenu}>
              <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", backgroundColor: "#000000", borderRadius: "4px", padding: "4px", color: "#ffffff" }}>
                <span ref={plusIconRef} style={{ fontSize: isMenuOpen ? "24px" : "28px", fontWeight: isMenuOpen ? 400 : 300, fontFamily: FONT_FAMILY, lineHeight: 1, display: "inline-block", transform: isMenuOpen ? "rotate(0deg)" : "rotate(0deg)" }}>
                  {isMenuOpen ? "✕" : "+"}
                </span>
              </div>
              <span style={{ fontSize: "16px", fontWeight: 500, color: "#000000", fontFamily: FONT_FAMILY, letterSpacing: "0.02em" }}>
                {isMenuOpen ? "Close" : "Menu"}
              </span>
            </div>
          </div>
        </div>

        {/* Menu Overlay */}
        <div
          ref={menuOverlayRef}
          className="menu-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "#0D3CFC",
            zIndex: 99,
            display: isMenuOpen ? "flex" : "none",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
            transform: "translateY(-100%)",
            opacity: 0,
            pointerEvents: isMenuOpen ? "auto" : "none",
            padding: "60px 80px",
            boxSizing: "border-box",
            overflow: "hidden",
          }}
        >
          <h1
            style={{
              position: "absolute",
              top: "40px",
              left: "40px",
              fontSize: "48px",
              fontWeight: 700,
              color: "#ffffff",
              fontFamily: FONT_FAMILY,
              letterSpacing: "-0.03em",
              margin: 0,
              padding: 0,
              lineHeight: 1,
              opacity: 0.9,
            }}
          >
            Menuru
          </h1>

          <div
            ref={menuItemsRef}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "15px",
              width: "100%",
              maxWidth: "600px",
            }}
          >
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href="/"
                style={{ textDecoration: "none" }}
              >
                <div
                  className="menu-item"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    backgroundColor: "transparent",
                    opacity: 0,
                    transform: "translateY(30px)",
                    transition: "none",
                  }}
                >
                  <span
                    style={{
                      fontSize: "48px",
                      fontWeight: 600,
                      color: "#ffffff",
                      fontFamily: FONT_FAMILY,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {item.name}
                  </span>
                  <span
                    style={{
                      fontSize: "24px",
                      fontWeight: 300,
                      color: "#ffffff",
                      fontFamily: FONT_FAMILY,
                    }}
                  >
                    {item.number}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div
            ref={storiesRef}
            style={{
              position: "absolute",
              left: "720px",  
              top: "180px",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "8px",
              opacity: 0,
            }}
          >
            <span
              style={{
                fontSize: "40px",
                fontWeight: 300,
                color: "#ffffff",
                fontFamily: FONT_FAMILY,
                letterSpacing: "0.05em",
              }}
            >
              stories
            </span>
          </div>

          <div
            ref={menuBoxRef}
            style={{
              position: "absolute",
              right: "80px",
              bottom: "80px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "24px",
              border: "2px solid #D9FF81",
              borderRadius: "12px",
              padding: "20px 32px",
              backgroundColor: "#D9FF81",
              cursor: "pointer",
              opacity: 0,
              transform: "scale(0.95)",
              boxShadow: "0 4px 30px rgba(217, 255, 129, 0.3)",
              maxWidth: "600px",
              width: "auto",
              minHeight: "90px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "2px",
                flex: 1,
              }}
            >
              <span
                style={{
                  fontSize: "20px",
                  fontWeight: 600,
                  color: "#0D3CFC",
                  fontFamily: FONT_FAMILY,
                  letterSpacing: "0.01em",
                  lineHeight: 1.3,
                }}
              >
                Bagaimana website ini
              </span>
              <span
                style={{
                  fontSize: "20px",
                  fontWeight: 600,
                  color: "#0D3CFC",
                  fontFamily: FONT_FAMILY,
                  letterSpacing: "0.01em",
                  lineHeight: 1.3,
                }}
              >
                bisa berkembang?
              </span>
              <span
                style={{
                  fontSize: "15px",
                  fontWeight: 400,
                  color: "rgba(13, 60, 252, 0.7)",
                  fontFamily: FONT_FAMILY,
                  letterSpacing: "0.01em",
                  lineHeight: 1.3,
                }}
              >
                Dengan dukungan komunitas
              </span>
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(13, 60, 252, 0.1)",
                borderRadius: "6px",
                padding: "4px",
                width: "70px",
                height: "70px",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              <img
                src="/images/10.jpg"
                alt="Menuru"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "6px",
                }}
              />
            </div>
          </div>

          <div
            ref={menuBox2Ref}
            style={{
              position: "absolute",
              left: "720px",
              top: "260px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "30px",
              border: "2px solid #C8EEFF",
              borderRadius: "12px",
              padding: "20px 36px",
              backgroundColor: "#C8EEFF",
              cursor: "pointer",
              opacity: 0,
              transform: "scale(0.95)",
              boxShadow: "0 4px 30px rgba(200, 238, 255, 0.3)",
              maxWidth: "750px",
              width: "auto",
              minHeight: "100px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                flex: 1,
              }}
            >
              <span
                style={{
                  fontSize: "22px",
                  fontWeight: 600,
                  color: "#0D3CFC",
                  fontFamily: FONT_FAMILY,
                  letterSpacing: "0.01em",
                  lineHeight: 1.3,
                }}
              >
                Bagaimana Rasa nya Masuk
              </span>
              <span
                style={{
                  fontSize: "22px",
                  fontWeight: 600,
                  color: "#0D3CFC",
                  fontFamily: FONT_FAMILY,
                  letterSpacing: "0.01em",
                  lineHeight: 1.3,
                }}
              >
                Kuliah Di Universitas
              </span>
              <span
                style={{
                  fontSize: "22px",
                  fontWeight: 600,
                  color: "#0D3CFC",
                  fontFamily: FONT_FAMILY,
                  letterSpacing: "0.01em",
                  lineHeight: 1.3,
                }}
              >
                Gunadarma
              </span>
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(13, 60, 252, 0.1)",
                borderRadius: "6px",
                padding: "4px",
                width: "100px",
                height: "100px",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              <img
                src="/images/10.jpg"
                alt="Universitas Gunadarma"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "6px",
                }}
              />
            </div>
          </div>

          <div
            ref={menuBox3Ref}
            style={{
              position: "absolute",
              left: "720px",
              top: "470px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "30px",
              border: "2px solid #C8EEFF",
              borderRadius: "12px",
              padding: "20px 36px",
              backgroundColor: "#C8EEFF",
              cursor: "pointer",
              opacity: 0,
              transform: "scale(0.95)",
              boxShadow: "0 4px 30px rgba(200, 238, 255, 0.3)",
              maxWidth: "750px",
              width: "auto",
              minHeight: "100px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                flex: 1,
              }}
            >
              <span
                style={{
                  fontSize: "22px",
                  fontWeight: 600,
                  color: "#0D3CFC",
                  fontFamily: FONT_FAMILY,
                  letterSpacing: "0.01em",
                  lineHeight: 1.3,
                }}
              >
                Mengapa saya memilih
              </span>
              <span
                style={{
                  fontSize: "22px",
                  fontWeight: 600,
                  color: "#0D3CFC",
                  fontFamily: FONT_FAMILY,
                  letterSpacing: "0.01em",
                  lineHeight: 1.3,
                }}
              >
                jurusan tersebut?
              </span>
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(13, 60, 252, 0.1)",
                borderRadius: "6px",
                padding: "4px",
                width: "100px",
                height: "100px",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              <img
                src="/images/15.jpg"
                alt="Mengapa memilih jurusan"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "6px",
                }}
              />
            </div>
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

        @media (max-width: 1024px) {
          .subtitle p {
            font-size: 48px !important;
          }
          .title {
            font-size: 36px !important;
          }
          .cta-button {
            padding: 10px 22px !important;
          }
          .cta-button span {
            font-size: 16px !important;
          }
          .arrow-box {
            width: 44px !important;
            height: 44px !important;
            padding: 8px !important;
          }
          .get-in-touch {
            padding: 6px 12px !important;
          }
          .get-in-touch span {
            font-size: 14px !important;
          }
          .pusat-bantuan {
            padding: 6px 12px !important;
          }
          .pusat-bantuan span {
            font-size: 14px !important;
          }
          .menu-button {
            padding: 6px 12px !important;
          }
          .menu-button span {
            font-size: 14px !important;
          }
          .menu-overlay {
            padding: 40px 40px !important;
          }
          .menu-overlay .menu-text {
            font-size: 36px !important;
          }
          .menu-overlay .stories {
            right: 40px !important;
            top: 80px !important;
          }
          .menu-overlay .stories span {
            font-size: 30px !important;
          }
          .menu-overlay .menu-box {
            right: 40px !important;
            bottom: 40px !important;
            max-width: 450px !important;
            padding: 16px 24px !important;
            min-height: 70px !important;
          }
          .menu-overlay .menu-box span {
            font-size: 17px !important;
          }
          .menu-overlay .menu-box img {
            width: 55px !important;
            height: 55px !important;
          }
          .menu-overlay .menu-box2 {
            right: 40px !important;
            top: 140px !important;
            max-width: 550px !important;
            padding: 14px 20px !important;
            min-height: 80px !important;
          }
          .menu-overlay .menu-box2 span {
            font-size: 18px !important;
          }
          .menu-overlay .menu-box2 img {
            width: 75px !important;
            height: 75px !important;
          }
          .menu-overlay .menu-box3 {
            right: 40px !important;
            top: 260px !important;
            max-width: 550px !important;
            padding: 14px 20px !important;
            min-height: 80px !important;
          }
          .menu-overlay .menu-box3 span {
            font-size: 18px !important;
          }
          .menu-overlay .menu-box3 img {
            width: 75px !important;
            height: 75px !important;
          }
        }
        @media (max-width: 768px) {
          .subtitle p {
            font-size: 36px !important;
          }
          .title {
            font-size: 28px !important;
          }
          .cta-button {
            padding: 8px 18px !important;
          }
          .cta-button span {
            font-size: 14px !important;
          }
          .arrow-box {
            width: 38px !important;
            height: 38px !important;
            padding: 6px !important;
          }
          .arrow-box svg {
            width: 18px !important;
            height: 18px !important;
          }
          .get-in-touch {
            padding: 4px 10px !important;
          }
          .get-in-touch span {
            font-size: 12px !important;
          }
          .pusat-bantuan {
            padding: 4px 10px !important;
          }
          .pusat-bantuan span {
            font-size: 12px !important;
          }
          .menu-button {
            padding: 4px 10px !important;
          }
          .menu-button span {
            font-size: 12px !important;
          }
          .menu-overlay {
            padding: 30px 20px !important;
            flex-direction: column !important;
          }
          .menu-overlay .menu-text {
            font-size: 28px !important;
          }
          .menu-overlay .menu-items {
            width: 100% !important;
            max-width: 100% !important;
          }
          .menu-overlay .stories {
            position: relative !important;
            right: auto !important;
            top: auto !important;
            margin-top: 10px !important;
            align-items: flex-start !important;
          }
          .menu-overlay .stories span {
            font-size: 24px !important;
          }
          .menu-overlay .menu-box {
            position: relative !important;
            right: auto !important;
            bottom: auto !important;
            margin-top: 20px !important;
            max-width: 100% !important;
            width: 100% !important;
            flex-wrap: wrap !important;
            padding: 14px 20px !important;
            min-height: 60px !important;
          }
          .menu-overlay .menu-box span {
            font-size: 16px !important;
          }
          .menu-overlay .menu-box img {
            width: 50px !important;
            height: 50px !important;
          }
          .menu-overlay .menu-box2 {
            position: relative !important;
            right: auto !important;
            top: auto !important;
            margin-top: 15px !important;
            max-width: 100% !important;
            width: 100% !important;
            flex-wrap: wrap !important;
            padding: 12px 16px !important;
            min-height: 50px !important;
          }
          .menu-overlay .menu-box2 span {
            font-size: 16px !important;
          }
          .menu-overlay .menu-box2 img {
            width: 55px !important;
            height: 55px !important;
          }
          .menu-overlay .menu-box3 {
            position: relative !important;
            right: auto !important;
            top: auto !important;
            margin-top: 15px !important;
            max-width: 100% !important;
            width: 100% !important;
            flex-wrap: wrap !important;
            padding: 12px 16px !important;
            min-height: 50px !important;
          }
          .menu-overlay .menu-box3 span {
            font-size: 16px !important;
          }
          .menu-overlay .menu-box3 img {
            width: 55px !important;
            height: 55px !important;
          }
        }
        @media (max-width: 480px) {
          .subtitle p {
            font-size: 24px !important;
          }
          .title {
            font-size: 22px !important;
          }
          .cta-button {
            padding: 6px 14px !important;
          }
          .cta-button span {
            font-size: 12px !important;
          }
          .arrow-box {
            width: 32px !important;
            height: 32px !important;
            padding: 4px !important;
          }
          .arrow-box svg {
            width: 14px !important;
            height: 14px !important;
          }
          .get-in-touch {
            padding: 4px 8px !important;
          }
          .get-in-touch span {
            font-size: 10px !important;
          }
          .pusat-bantuan {
            padding: 4px 8px !important;
          }
          .pusat-bantuan span {
            font-size: 10px !important;
          }
          .menu-button {
            padding: 4px 8px !important;
          }
          .menu-button span {
            font-size: 10px !important;
          }
          .menu-overlay {
            padding: 20px 15px !important;
          }
          .menu-overlay .menu-text {
            font-size: 22px !important;
          }
          .menu-overlay .stories span {
            font-size: 20px !important;
          }
          .menu-overlay .menu-box span {
            font-size: 14px !important;
          }
          .menu-overlay .menu-box img {
            width: 40px !important;
            height: 40px !important;
          }
          .menu-overlay .menu-box {
            padding: 10px 14px !important;
            min-height: 50px !important;
          }
          .menu-overlay .menu-box2 span {
            font-size: 14px !important;
          }
          .menu-overlay .menu-box2 img {
            width: 45px !important;
            height: 45px !important;
          }
          .menu-overlay .menu-box2 {
            padding: 8px 12px !important;
            min-height: 40px !important;
          }
          .menu-overlay .menu-box3 span {
            font-size: 14px !important;
          }
          .menu-overlay .menu-box3 img {
            width: 45px !important;
            height: 45px !important;
          }
          .menu-overlay .menu-box3 {
            padding: 8px 12px !important;
            min-height: 40px !important;
          }
        }
      `}</style>
    </>
  );
}
