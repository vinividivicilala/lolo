'use client';

import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
import { getFirestore, collection, query, where, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, orderBy, getDocs, deleteDoc, runTransaction, increment } from "firebase/firestore";
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
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    return '[Pesan tidak dapat didekripsi]';
  }
}

// ===== ANTI-BOT SYSTEM =====

// 1. Rate Limit & Throttling
interface RateLimit {
  count: number;
  firstAttempt: number;
  lastAttempt: number;
  windowStart: number;
}

const RATE_LIMITS = {
  MESSAGE: { max: 10, window: 60000 }, // 10 pesan per menit
  TICKET: { max: 3, window: 3600000 }, // 3 ticket per jam
  NEW_USER: { max: 1, window: 600000 }, // 1 ticket per 10 menit untuk user baru
};

// 2. Strike System
interface Strike {
  count: number;
  reasons: string[];
  timestamps: number[];
  lastStrike: number;
}

const STRIKE_CONFIG = {
  MAX_STRIKES: 3,
  STRIKE_DECAY: 86400000, // 24 jam
  BAN_DURATION: 86400000 * 7, // 7 hari
};

// 3. User Session
interface UserSession {
  sessionId: string;
  userId: string;
  startTime: number;
  lastActivity: number;
  messageCount: number;
  ticketCount: number;
  ipHash: string;
  userAgent: string;
  isSuspicious: boolean;
  trustScore: number;
}

// ===== ANTI-BOT FUNCTIONS =====

// Generate session ID
function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
}

// Hash IP (simple hash untuk demo)
function hashIP(ip: string): string {
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    hash = ((hash << 5) - hash) + ip.charCodeAt(i);
    hash |= 0;
  }
  return `ip_${hash}`;
}

// Proof-of-Work (simple untuk demo)
async function proofOfWork(challenge: string, difficulty: number = 4): Promise<string> {
  // Simulasi PoW dengan delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return `pow_${challenge}_${Date.now()}`;
}

// Behavior Analysis
function analyzeBehavior(messages: string[], timestamps: number[]): {
  isSuspicious: boolean;
  reason: string;
  score: number;
} {
  let score = 0;
  let reasons: string[] = [];

  // Cek kecepatan mengetik (lebih dari 10 pesan dalam 30 detik)
  if (messages.length >= 10) {
    const timeDiff = timestamps[timestamps.length - 1] - timestamps[0];
    if (timeDiff < 30000) {
      score += 20;
      reasons.push('Kecepatan mengirim pesan terlalu tinggi');
    }
  }

  // Cek variasi panjang pesan
  const lengths = messages.map(m => m.length);
  const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((a, b) => a + Math.pow(b - avgLength, 2), 0) / lengths.length;
  if (variance < 10 && lengths.every(l => l > 5)) {
    score += 15;
    reasons.push('Pola panjang pesan terlalu seragam');
  }

  // Cek kosakata berulang
  const words = messages.join(' ').toLowerCase().split(/\s+/);
  const wordCount: Record<string, number> = {};
  words.forEach(w => { wordCount[w] = (wordCount[w] || 0) + 1; });
  const repeatedWords = Object.entries(wordCount).filter(([_, count]) => count > 5);
  if (repeatedWords.length > 0) {
    score += 10;
    reasons.push(`Kata berulang: ${repeatedWords.map(([w]) => w).join(', ')}`);
  }

  // Cek pola karakter
  const charPatterns = /(.)\1{4,}/;
  if (charPatterns.test(messages.join(' '))) {
    score += 10;
    reasons.push('Pola karakter berulang terdeteksi');
  }

  return {
    isSuspicious: score >= 30,
    reason: reasons.join('; ') || 'Normal',
    score: score
  };
}

// Get IP (simulasi)
function getClientIP(): string {
  // Dalam production, dapat dari request headers
  return '127.0.0.1';
}

// ===== ANTI-BOT MANAGER CLASS =====
class AntiBotManager {
  private rateLimits: Map<string, RateLimit> = new Map();
  private strikes: Map<string, Strike> = new Map();
  private sessions: Map<string, UserSession> = new Map();
  private bannedUsers: Set<string> = new Set();
  private honeypotTokens: Map<string, number> = new Map();
  private userMessageHistory: Map<string, {text: string, timestamp: number}[]> = new Map();

  constructor() {
    // Cleanup expired sessions setiap 5 menit
    setInterval(() => this.cleanup(), 300000);
  }

  // Generate honeypot token
  generateHoneypotToken(): string {
    const token = `hp_${Math.random().toString(36).substring(2, 15)}`;
    this.honeypotTokens.set(token, Date.now() + 300000); // 5 menit expired
    return token;
  }

  // Verify honeypot
  verifyHoneypot(token: string): boolean {
    if (!this.honeypotTokens.has(token)) return false;
    const expiry = this.honeypotTokens.get(token)!;
    if (Date.now() > expiry) {
      this.honeypotTokens.delete(token);
      return false;
    }
    this.honeypotTokens.delete(token);
    return true;
  }

  // Check rate limit
  checkRateLimit(key: string, type: 'MESSAGE' | 'TICKET' | 'NEW_USER'): { allowed: boolean; remaining: number; resetIn: number } {
    const limit = RATE_LIMITS[type];
    const now = Date.now();
    
    if (!this.rateLimits.has(key)) {
      this.rateLimits.set(key, {
        count: 1,
        firstAttempt: now,
        lastAttempt: now,
        windowStart: now
      });
      return { allowed: true, remaining: limit.max - 1, resetIn: limit.window };
    }

    const data = this.rateLimits.get(key)!;
    
    // Reset window jika sudah lewat
    if (now - data.windowStart > limit.window) {
      data.count = 1;
      data.windowStart = now;
      data.firstAttempt = now;
      this.rateLimits.set(key, data);
      return { allowed: true, remaining: limit.max - 1, resetIn: limit.window };
    }

    data.count++;
    data.lastAttempt = now;
    this.rateLimits.set(key, data);

    if (data.count > limit.max) {
      const resetIn = limit.window - (now - data.windowStart);
      return { allowed: false, remaining: 0, resetIn: Math.max(0, resetIn) };
    }

    return { 
      allowed: true, 
      remaining: limit.max - data.count, 
      resetIn: limit.window - (now - data.windowStart) 
    };
  }

  // Add strike
  async addStrike(userId: string, reason: string): Promise<{ banned: boolean; strikeCount: number }> {
    const now = Date.now();
    
    if (!this.strikes.has(userId)) {
      this.strikes.set(userId, {
        count: 1,
        reasons: [reason],
        timestamps: [now],
        lastStrike: now
      });
      
      // Simpan ke Firebase
      await this.saveStrikeToFirebase(userId, reason, 1);
      return { banned: false, strikeCount: 1 };
    }

    const data = this.strikes.get(userId)!;
    
    // Clean expired strikes
    const validTimestamps = data.timestamps.filter(t => now - t < STRIKE_CONFIG.STRIKE_DECAY);
    data.timestamps = validTimestamps;
    data.count = validTimestamps.length + 1;
    data.reasons.push(reason);
    data.timestamps.push(now);
    data.lastStrike = now;
    
    this.strikes.set(userId, data);
    
    // Simpan ke Firebase
    await this.saveStrikeToFirebase(userId, reason, data.count);

    // Cek apakah perlu auto-ban
    if (data.count >= STRIKE_CONFIG.MAX_STRIKES) {
      await this.banUser(userId, `Mencapai ${data.count} strikes: ${data.reasons.join(', ')}`);
      return { banned: true, strikeCount: data.count };
    }

    return { banned: false, strikeCount: data.count };
  }

  // Save strike to Firebase
  async saveStrikeToFirebase(userId: string, reason: string, count: number) {
    if (!db) return;
    try {
      await addDoc(collection(db, "bot_strikes"), {
        userId,
        reason,
        count,
        timestamp: serverTimestamp(),
        isResolved: false
      });
    } catch (error) {
      console.error("Error saving strike:", error);
    }
  }

  // Ban user
  async banUser(userId: string, reason: string) {
    if (!db) return;
    try {
      this.bannedUsers.add(userId);
      
      // Update user di Firebase
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        botBanned: true,
        botBanReason: reason,
        botBannedAt: serverTimestamp(),
        botBanExpiry: new Date(Date.now() + STRIKE_CONFIG.BAN_DURATION),
        botFlagged: true
      });

      // Log ban
      await addDoc(collection(db, "bot_bans"), {
        userId,
        reason,
        timestamp: serverTimestamp(),
        expiresAt: new Date(Date.now() + STRIKE_CONFIG.BAN_DURATION),
        isActive: true
      });

      // Update user sessions
      this.sessions.forEach((session, key) => {
        if (session.userId === userId) {
          session.isSuspicious = true;
          this.sessions.set(key, session);
        }
      });

      console.log(`User ${userId} banned: ${reason}`);
    } catch (error) {
      console.error("Error banning user:", error);
    }
  }

  // Check if user is banned
  isUserBanned(userId: string): boolean {
    return this.bannedUsers.has(userId);
  }

  // Check if user is banned (from Firebase)
  async checkUserBanned(userId: string): Promise<{ banned: boolean; reason: string }> {
    if (!db) return { banned: false, reason: '' };
    try {
      const userSnap = await getDocs(query(collection(db, "users"), where("uid", "==", userId)));
      if (!userSnap.empty) {
        const data = userSnap.docs[0].data();
        if (data.botBanned === true) {
          // Cek expiry
          if (data.botBanExpiry) {
            const expiry = data.botBanExpiry.toDate ? data.botBanExpiry.toDate() : new Date(data.botBanExpiry);
            if (expiry > new Date()) {
              return { banned: true, reason: data.botBanReason || 'Banned' };
            } else {
              // Ban expired, unban
              await this.unbanUser(userId);
              return { banned: false, reason: '' };
            }
          }
          return { banned: true, reason: data.botBanReason || 'Banned' };
        }
      }
      // Cek local cache
      if (this.bannedUsers.has(userId)) {
        return { banned: true, reason: 'Banned' };
      }
      return { banned: false, reason: '' };
    } catch (error) {
      console.error("Error checking user ban:", error);
      return { banned: false, reason: '' };
    }
  }

  // Unban user
  async unbanUser(userId: string) {
    if (!db) return;
    try {
      this.bannedUsers.delete(userId);
      
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        botBanned: false,
        botBanReason: null,
        botBannedAt: null,
        botBanExpiry: null,
        botFlagged: false
      });

      // Update ban log
      const bansSnap = await getDocs(query(collection(db, "bot_bans"), where("userId", "==", userId), where("isActive", "==", true)));
      bansSnap.forEach(async (doc) => {
        await updateDoc(doc.ref, { isActive: false });
      });

      // Reset strikes
      this.strikes.delete(userId);
      
      console.log(`User ${userId} unbanned`);
    } catch (error) {
      console.error("Error unbanning user:", error);
    }
  }

  // Create session
  createSession(userId: string): string {
    const sessionId = generateSessionId();
    const ip = getClientIP();
    
    this.sessions.set(sessionId, {
      sessionId,
      userId,
      startTime: Date.now(),
      lastActivity: Date.now(),
      messageCount: 0,
      ticketCount: 0,
      ipHash: hashIP(ip),
      userAgent: navigator.userAgent || 'unknown',
      isSuspicious: false,
      trustScore: 100
    });

    return sessionId;
  }

  // Update session activity
  updateSession(sessionId: string, type: 'MESSAGE' | 'TICKET') {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.lastActivity = Date.now();
    if (type === 'MESSAGE') session.messageCount++;
    if (type === 'TICKET') session.ticketCount++;

    // Update trust score
    session.trustScore = Math.max(0, session.trustScore - 1);
    if (session.messageCount > 50) session.trustScore = Math.max(0, session.trustScore - 10);
    if (session.ticketCount > 5) session.trustScore = Math.max(0, session.trustScore - 20);

    // Check suspicious activity
    if (session.trustScore < 50) {
      session.isSuspicious = true;
    }

    this.sessions.set(sessionId, session);
  }

  // Get session
  getSession(sessionId: string): UserSession | undefined {
    return this.sessions.get(sessionId);
  }

  // Velocity detection
  detectVelocity(messages: {text: string, timestamp: number}[]): { isSuspicious: boolean; speed: number } {
    if (messages.length < 5) return { isSuspicious: false, speed: 0 };
    
    const now = Date.now();
    const recent = messages.filter(m => now - m.timestamp < 60000); // 1 menit
    const speed = recent.length;
    
    return {
      isSuspicious: speed > 15, // Lebih dari 15 pesan per menit
      speed
    };
  }

  // Cleanup expired data
  cleanup() {
    const now = Date.now();
    
    // Clean sessions yang tidak aktif > 30 menit
    this.sessions.forEach((session, key) => {
      if (now - session.lastActivity > 1800000) {
        this.sessions.delete(key);
      }
    });

    // Clean expired rate limits
    this.rateLimits.forEach((data, key) => {
      if (now - data.lastAttempt > 3600000) {
        this.rateLimits.delete(key);
      }
    });

    // Clean expired honeypot tokens
    this.honeypotTokens.forEach((expiry, key) => {
      if (now > expiry) {
        this.honeypotTokens.delete(key);
      }
    });
  }

  // Add message to history
  addMessageHistory(userId: string, text: string) {
    if (!this.userMessageHistory.has(userId)) {
      this.userMessageHistory.set(userId, []);
    }
    const history = this.userMessageHistory.get(userId)!;
    history.push({ text, timestamp: Date.now() });
    // Keep only last 100 messages
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
  }

  // Get message history
  getMessageHistory(userId: string): {text: string, timestamp: number}[] {
    return this.userMessageHistory.get(userId) || [];
  }
}

// Initialize Anti-Bot Manager
const antiBot = new AntiBotManager();

const FONT_FAMILY = "'Poppins', 'Poppins Fallback', sans-serif";
const ADMIN_EMAIL = "faridardiansyah061@gmail.com";
const AGENT_NAME = "Farid Ardiansyah";

// SVG Icons
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
  isBlocked?: boolean;
  blockReason?: string;
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
  const [sessionId, setSessionId] = useState<string>("");
  const [rateLimitInfo, setRateLimitInfo] = useState<{ remaining: number; resetIn: number } | null>(null);
  const [honeypotToken, setHoneypotToken] = useState<string>("");
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState("");
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
    }).catch(() => setEncryptionReady(true));
    
    // Init session
    if (user) {
      const sid = antiBot.createSession(user.uid);
      setSessionId(sid);
      const token = antiBot.generateHoneypotToken();
      setHoneypotToken(token);
    }
  }, [user]);

  // Check if user is banned
  useEffect(() => {
    if (!user || !isMounted) return;
    
    const checkBan = async () => {
      const result = await antiBot.checkUserBanned(user.uid);
      if (result.banned) {
        setIsBlocked(true);
        setBlockReason(result.reason);
        setBotWarning(`🚫 Akun Anda telah diblokir: ${result.reason}`);
      } else {
        setIsBlocked(false);
        setBlockReason("");
      }
    };
    checkBan();

    // Real-time ban check
    const unsubscribe = onSnapshot(doc(db, "users", user.uid), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (data.botBanned === true) {
          setIsBlocked(true);
          setBlockReason(data.botBanReason || 'Banned');
          setBotWarning(`🚫 Akun Anda telah diblokir: ${data.botBanReason || 'Banned'}`);
        } else {
          setIsBlocked(false);
          setBlockReason("");
          setBotWarning(null);
        }
      }
    });

    return () => unsubscribe();
  }, [user, isMounted]);

  // Update rate limit info periodically
  useEffect(() => {
    if (!user || !isMounted) return;
    
    const interval = setInterval(() => {
      const key = `user_${user.uid}`;
      const result = antiBot.checkRateLimit(key, 'MESSAGE');
      setRateLimitInfo({
        remaining: result.remaining,
        resetIn: Math.ceil(result.resetIn / 1000)
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [user, isMounted]);

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

  // ===== ANTI-BOT CHECK FUNCTIONS =====

  // Check if message should be blocked
  const checkMessageBlock = async (text: string): Promise<{ blocked: boolean; reason: string }> => {
    if (!user) return { blocked: false, reason: '' };

    // 1. Check if user is blocked
    if (isBlocked) {
      return { blocked: true, reason: `Akun diblokir: ${blockReason}` };
    }

    // 2. Check rate limit
    const key = `user_${user.uid}`;
    const rateResult = antiBot.checkRateLimit(key, 'MESSAGE');
    if (!rateResult.allowed) {
      return { 
        blocked: true, 
        reason: `Rate limit exceeded. Coba lagi dalam ${Math.ceil(rateResult.resetIn / 1000)} detik` 
      };
    }

    // 3. Check message patterns
    const patterns = [
      /bot/i, /spam/i, /scam/i, /phishing/i, /malware/i,
      /virus/i, /hack/i, /crack/i, /keygen/i, /serial/i,
      /warez/i, /porn/i, /xxx/i, /gambling/i, /casino/i,
      /lottery/i, /prize/i, /winner/i, /click here/i,
      /free money/i, /earn money/i, /make money/i,
      /quick cash/i, /investment/i, /crypto/i, /bitcoin/i,
      /ethereum/i, /blockchain/i, /mining/i, /nft/i,
      /metaverse/i
    ];

    for (const pattern of patterns) {
      if (pattern.test(text)) {
        // Add strike
        const result = await antiBot.addStrike(user.uid, `Kata mencurigakan: ${pattern.source}`);
        
        if (result.banned) {
          setIsBlocked(true);
          setBlockReason(`Auto-ban setelah ${result.strikeCount} strikes`);
          return { 
            blocked: true, 
            reason: `🚫 Akun telah di-ban otomatis setelah ${result.strikeCount} pelanggaran` 
          };
        }
        
        return { 
          blocked: true, 
          reason: `⚠️ Aktivitas mencurigakan (Strike ${result.strikeCount}/${STRIKE_CONFIG.MAX_STRIKES})` 
        };
      }
    }

    // 4. Check repeated characters
    const repeatedPattern = /(.)\1{5,}/;
    if (repeatedPattern.test(text)) {
      const result = await antiBot.addStrike(user.uid, 'Spam karakter berulang');
      if (result.banned) {
        setIsBlocked(true);
        setBlockReason(`Auto-ban setelah ${result.strikeCount} strikes`);
        return { 
          blocked: true, 
          reason: `🚫 Akun telah di-ban otomatis setelah ${result.strikeCount} pelanggaran` 
        };
      }
      return { 
        blocked: true, 
        reason: `⚠️ Spam karakter berulang (Strike ${result.strikeCount}/${STRIKE_CONFIG.MAX_STRIKES})` 
      };
    }

    // 5. Check suspicious links
    const suspiciousLinks = /(http|https):\/\/(?!.*(menuru|wawa44|gunadarma|instagram|youtube|twitter|facebook|linkedin|github|google|microsoft|apple|amazon|netflix|spotify)).*\.(xyz|top|club|online|site|win|bid|loan|date|download|stream|watch|free|click|biz|info|name|pro|tech|store|shop|live|app|dev|work|cloud|host|net|org|com)/i;
    if (suspiciousLinks.test(text)) {
      const result = await antiBot.addStrike(user.uid, 'Link mencurigakan');
      if (result.banned) {
        setIsBlocked(true);
        setBlockReason(`Auto-ban setelah ${result.strikeCount} strikes`);
        return { 
          blocked: true, 
          reason: `🚫 Akun telah di-ban otomatis setelah ${result.strikeCount} pelanggaran` 
        };
      }
      return { 
        blocked: true, 
        reason: `⚠️ Link mencurigakan (Strike ${result.strikeCount}/${STRIKE_CONFIG.MAX_STRIKES})` 
      };
    }

    // 6. Check message history (spam detection)
    const history = antiBot.getMessageHistory(user.uid);
    const recentMessages = history.filter(h => Date.now() - h.timestamp < 300000); // 5 menit
    const similarMessages = recentMessages.filter(h => h.text === text);
    
    if (similarMessages.length >= 2) {
      const result = await antiBot.addStrike(user.uid, 'Pesan berulang (spam)');
      if (result.banned) {
        setIsBlocked(true);
        setBlockReason(`Auto-ban setelah ${result.strikeCount} strikes`);
        return { 
          blocked: true, 
          reason: `🚫 Akun telah di-ban otomatis setelah ${result.strikeCount} pelanggaran` 
        };
      }
      return { 
        blocked: true, 
        reason: `⚠️ Pesan berulang (Spam) (Strike ${result.strikeCount}/${STRIKE_CONFIG.MAX_STRIKES})` 
      };
    }

    // 7. Velocity detection
    const velocity = antiBot.detectVelocity(history);
    if (velocity.isSuspicious) {
      const result = await antiBot.addStrike(user.uid, `Kecepatan pesan tinggi (${velocity.speed}/menit)`);
      if (result.banned) {
        setIsBlocked(true);
        setBlockReason(`Auto-ban setelah ${result.strikeCount} strikes`);
        return { 
          blocked: true, 
          reason: `🚫 Akun telah di-ban otomatis setelah ${result.strikeCount} pelanggaran` 
        };
      }
      return { 
        blocked: true, 
        reason: `⚠️ Terlalu cepat mengirim pesan (Strike ${result.strikeCount}/${STRIKE_CONFIG.MAX_STRIKES})` 
      };
    }

    // 8. Behavior analysis
    const behavior = analyzeBehavior(
      history.map(h => h.text),
      history.map(h => h.timestamp)
    );
    if (behavior.isSuspicious) {
      const result = await antiBot.addStrike(user.uid, `Perilaku mencurigakan: ${behavior.reason}`);
      if (result.banned) {
        setIsBlocked(true);
        setBlockReason(`Auto-ban setelah ${result.strikeCount} strikes`);
        return { 
          blocked: true, 
          reason: `🚫 Akun telah di-ban otomatis setelah ${result.strikeCount} pelanggaran` 
        };
      }
      return { 
        blocked: true, 
        reason: `⚠️ Perilaku mencurigakan (Strike ${result.strikeCount}/${STRIKE_CONFIG.MAX_STRIKES})` 
      };
    }

    return { blocked: false, reason: '' };
  };

  // Check if ticket can be created
  const checkTicketBlock = async (): Promise<{ blocked: boolean; reason: string }> => {
    if (!user) return { blocked: false, reason: '' };

    // 1. Check if user is blocked
    if (isBlocked) {
      return { blocked: true, reason: `Akun diblokir: ${blockReason}` };
    }

    // 2. Check ticket rate limit
    const key = `ticket_${user.uid}`;
    const rateResult = antiBot.checkRateLimit(key, 'TICKET');
    if (!rateResult.allowed) {
      return { 
        blocked: true, 
        reason: `Terlalu banyak membuat ticket. Coba lagi dalam ${Math.ceil(rateResult.resetIn / 60000)} menit` 
      };
    }

    // 3. Check new user rate limit
    const userSnap = await getDocs(query(collection(db, "users"), where("uid", "==", user.uid)));
    if (!userSnap.empty) {
      const userData = userSnap.docs[0].data();
      const createdAt = userData.createdAt?.toDate?.() || new Date();
      const age = Date.now() - createdAt.getTime();
      if (age < 600000) { // 10 menit
        const newUserKey = `new_${user.uid}`;
        const newUserRate = antiBot.checkRateLimit(newUserKey, 'NEW_USER');
        if (!newUserRate.allowed) {
          return { 
            blocked: true, 
            reason: 'User baru hanya bisa membuat 1 ticket dalam 10 menit' 
          };
        }
      }
    }

    return { blocked: false, reason: '' };
  };

  // ===== CHAT FUNCTIONS =====

  const handleTyping = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
    if (!db || !user || !selectedTopic) return;
    if (!encryptionReady) {
      alert("Enkripsi sedang diinisialisasi, silahkan tunggu sebentar.");
      return;
    }

    // Check if user can create ticket
    const ticketCheck = await checkTicketBlock();
    if (ticketCheck.blocked) {
      setBotWarning(`🚫 ${ticketCheck.reason}`);
      return;
    }

    // Verify honeypot
    if (!antiBot.verifyHoneypot(honeypotToken)) {
      setBotWarning('🚫 Verifikasi keamanan gagal. Silahkan refresh halaman.');
      return;
    }

    // Check if user is banned
    const banCheck = await antiBot.checkUserBanned(user.uid);
    if (banCheck.banned) {
      setIsBlocked(true);
      setBlockReason(banCheck.reason);
      setBotWarning(`🚫 Akun Anda telah diblokir: ${banCheck.reason}`);
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
        isBlocked: false,
        blockReason: null
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

      // Update session
      antiBot.updateSession(sessionId, 'TICKET');

      setSelectedTopic("");
      setShowStartChat(false);
      setBotWarning(null);
      
      // Generate new honeypot token
      setHoneypotToken(antiBot.generateHoneypotToken());
    } catch (error) {
      console.error("Error starting chat:", error);
      alert("Terjadi kesalahan saat memulai chat. Silahkan coba lagi.");
    }
  };

  const sendMessage = async () => {
    if (!db || !selectedTicket || !messageText.trim() || !user) return;
    if (!encryptionReady) {
      alert("Enkripsi sedang diinisialisasi, silahkan tunggu sebentar.");
      return;
    }

    // Check if message should be blocked
    const blockCheck = await checkMessageBlock(messageText);
    if (blockCheck.blocked) {
      setBotWarning(blockCheck.reason);
      setMessageText("");
      return;
    }

    // Check if ticket is blocked
    if (selectedTicket.isBlocked) {
      setBotWarning(`🚫 Ticket ini telah diblokir: ${selectedTicket.blockReason}`);
      setMessageText("");
      return;
    }

    // Update session
    antiBot.updateSession(sessionId, 'MESSAGE');

    // Add to history
    antiBot.addMessageHistory(user.uid, messageText);

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

  const blockTicket = async (ticketId: string, reason: string) => {
    if (!db || !isAdmin) return;
    try {
      await updateDoc(doc(db, "livechat_tickets", ticketId), {
        isBlocked: true,
        blockReason: reason,
        status: "closed"
      });
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(null);
        setMessages([]);
      }
    } catch (error) {
      console.error("Error blocking ticket:", error);
    }
  };

  const unblockTicket = async (ticketId: string) => {
    if (!db || !isAdmin) return;
    try {
      await updateDoc(doc(db, "livechat_tickets", ticketId), {
        isBlocked: false,
        blockReason: null,
        status: "waiting"
      });
    } catch (error) {
      console.error("Error unblocking ticket:", error);
    }
  };

  const unbanUser = async (userId: string) => {
    if (!db || !isAdmin) return;
    try {
      await antiBot.unbanUser(userId);
      setIsBlocked(false);
      setBlockReason("");
      setBotWarning(null);
      alert('✅ User berhasil di-unban');
    } catch (error) {
      console.error("Error unbanning user:", error);
      alert('Gagal meng-unban user');
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

  // ===== RENDER =====
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

  // USER VIEW
  if (!isAdmin) {
    const userTickets = tickets.filter(t => t.userId === user.uid && !t.isBlocked);
    const activeTicket = userTickets.find(t => t.status === 'waiting' || t.status === 'active');

    // Show blocked message if user is blocked
    if (isBlocked) {
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
          <div style={{
            backgroundColor: "#fee2e2",
            color: "#991b1b",
            padding: "16px 20px",
            borderRadius: "8px",
            fontSize: "14px",
            fontFamily: FONT_FAMILY,
            border: "1px solid #fecaca",
          }}>
            <div style={{ fontWeight: 600, marginBottom: "8px" }}>🚫 Akun Anda Diblokir</div>
            <div>{blockReason}</div>
            <div style={{ fontSize: "12px", marginTop: "8px", color: "#dc2626" }}>
              Hubungi admin untuk informasi lebih lanjut.
            </div>
          </div>
        </div>
      );
    }

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
          {rateLimitInfo && (
            <div style={{
              fontSize: "11px",
              color: rateLimitInfo.remaining > 3 ? "#22c55e" : "#ef4444",
              fontFamily: FONT_FAMILY,
              marginBottom: "8px",
            }}>
              📊 Sisa pesan: {rateLimitInfo.remaining} | Reset: {rateLimitInfo.resetIn}s
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
          {rateLimitInfo && (
            <div style={{
              fontSize: "11px",
              color: rateLimitInfo.remaining > 3 ? "#22c55e" : "#ef4444",
              fontFamily: FONT_FAMILY,
              marginBottom: "8px",
            }}>
              📊 Sisa pesan: {rateLimitInfo.remaining} | Reset: {rateLimitInfo.resetIn}s
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
            {rateLimitInfo && (
              <span style={{
                fontSize: "10px",
                color: rateLimitInfo.remaining > 3 ? "#22c55e" : "#ef4444",
                fontFamily: FONT_FAMILY,
              }}>
                📊 {rateLimitInfo.remaining}
              </span>
            )}
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
              }}>{userTickets.length}</span>
            </div>
            <div style={{ overflowY: "auto", height: "340px" }}>
              {userTickets.map((ticket) => {
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
                      {ticket.isBlocked && (
                        <span style={{ fontSize: "7px", color: "#ef4444" }}>🔒</span>
                      )}
                    </div>
                  </div>
                );
              })}
              {userTickets.length === 0 && (
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
                disabled={isBlocked}
                style={{
                  width: "100%",
                  padding: "5px",
                  backgroundColor: isBlocked ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.15)",
                  color: isBlocked ? "rgba(255,255,255,0.3)" : "#fff",
                  border: "none",
                  borderRadius: "5px",
                  fontSize: "11px",
                  fontWeight: 500,
                  cursor: isBlocked ? "not-allowed" : "pointer",
                  fontFamily: FONT_FAMILY,
                }}
              >
                {isBlocked ? '🔒 Diblokir' : '+ Chat Baru'}
              </button>
            </div>
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
                  backgroundColor: selectedTicket.isBlocked ? "#ef4444" : "#0D3CFC",
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
                      {selectedTicket.isBlocked && (
                        <span style={{ fontSize: "10px", color: "#fca5a5", marginLeft: "5px" }}>🔒 Diblokir</span>
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
                  {selectedTicket.isBlocked && (
                    <span style={{
                      padding: "2px 10px",
                      backgroundColor: "#dc2626",
                      color: "#fff",
                      borderRadius: "4px",
                      fontSize: "9px",
                      fontFamily: FONT_FAMILY,
                    }}>
                      Diblokir
                    </span>
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
                    {getTypingText(selectedTicket) && selectedTicket.status !== 'resolved' && !selectedTicket.isBlocked && (
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
                {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && !selectedTicket.isBlocked && (
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
                      disabled={selectedTicket.status === 'waiting' || isBlocked}
                      style={{
                        flex: 1,
                        padding: "5px 8px",
                        border: "1px solid #e8e8e8",
                        borderRadius: "5px",
                        fontSize: "11px",
                        outline: "none",
                        fontFamily: FONT_FAMILY,
                        backgroundColor: (selectedTicket.status === 'waiting' || isBlocked) ? "#f5f5f5" : "#fff",
                      }}
                      onFocus={(e) => { if (selectedTicket.status !== 'waiting' && !isBlocked) e.currentTarget.style.borderColor = "#0D3CFC"; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "#e8e8e8"; }}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={selectedTicket.status === 'waiting' || !messageText.trim() || isBlocked}
                      style={{
                        padding: "5px 10px",
                        backgroundColor: (selectedTicket.status === 'waiting' || !messageText.trim() || isBlocked) ? "#ccc" : "#0D3CFC",
                        color: "#fff",
                        border: "none",
                        borderRadius: "5px",
                        cursor: (selectedTicket.status === 'waiting' || !messageText.trim() || isBlocked) ? "not-allowed" : "pointer",
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
                {selectedTicket.isBlocked && (
                  <div style={{
                    padding: "10px",
                    backgroundColor: "#fef2f2",
                    borderTop: "1px solid #fecaca",
                    textAlign: "center",
                    fontSize: "12px",
                    color: "#dc2626",
                    fontFamily: FONT_FAMILY,
                  }}>
                    🔒 Ticket ini telah diblokir oleh admin
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
  const waitingTickets = tickets.filter(t => t.status === 'waiting' && !t.isBlocked);
  const activeTickets = tickets.filter(t => t.status === 'active' && !t.isBlocked);
  const blockedTickets = tickets.filter(t => t.isBlocked === true);
  const resolvedTickets = tickets.filter(t => (t.status === 'resolved' || t.status === 'closed') && !t.isBlocked);
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

          {blockedTickets.length > 0 && (
            <div>
              <div style={{
                padding: "6px 10px",
                backgroundColor: "#fee2e2",
                fontWeight: 600,
                fontSize: "11px",
                color: "#991b1b",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontFamily: FONT_FAMILY,
                position: "sticky",
                top: 0,
                zIndex: 1,
              }}>
                <span>🔒</span>
                <span>Diblokir ({blockedTickets.length})</span>
              </div>
              {blockedTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  style={{
                    padding: "7px 10px",
                    borderBottom: "1px solid #e8e8e8",
                    cursor: "pointer",
                    backgroundColor: selectedTicket?.id === ticket.id ? "rgba(239,68,68,0.08)" : "transparent",
                    transition: "background 0.2s ease",
                  }}
                >
                  <div style={{ fontWeight: 500, fontSize: "11px", color: "#dc2626", fontFamily: FONT_FAMILY }}>{ticket.userName}</div>
                  <div style={{ fontSize: "9px", color: "#666", fontFamily: FONT_FAMILY }}>{ticket.topic}</div>
                  <div style={{ fontSize: "8px", color: "#dc2626", fontFamily: FONT_FAMILY }}>🔒 {ticket.blockReason || 'Diblokir'}</div>
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

          {waitingTickets.length === 0 && activeTickets.length === 0 && blockedTickets.length === 0 && resolvedTickets.length === 0 && (
            <div style={{ padding: "20px 10px", textAlign: "center", color: "#999", fontSize: "11px", fontFamily: FONT_FAMILY }}>
              Tidak ada chat
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
                backgroundColor: selectedTicket.isBlocked ? "#ef4444" : "#0D3CFC",
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
                    {selectedTicket.isBlocked && (
                      <span style={{ fontSize: "9px", color: "#fca5a5", fontWeight: 600 }}>🔒 Diblokir</span>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "4px" }}>
                  {selectedTicket.isBlocked ? (
                    <button
                      onClick={() => unblockTicket(selectedTicket.id)}
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
                      Unblock
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          const reason = prompt('Alasan memblokir ticket:');
                          if (reason && selectedTicket.id) {
                            blockTicket(selectedTicket.id, reason);
                          }
                        }}
                        style={{
                          padding: "3px 8px",
                          backgroundColor: "#ef4444",
                          color: "#fff",
                          border: "none",
                          borderRadius: "4px",
                          fontSize: "9px",
                          cursor: "pointer",
                          fontFamily: FONT_FAMILY,
                        }}
                      >
                        Block
                      </button>
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
                    </>
                  )}
                </div>
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
                  {typingText && selectedTicket.status !== 'resolved' && !selectedTicket.isBlocked && (
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
              {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && !selectedTicket.isBlocked && (
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
              {selectedTicket.isBlocked && (
                <div style={{
                  padding: "10px",
                  backgroundColor: "#fef2f2",
                  borderTop: "1px solid #fecaca",
                  textAlign: "center",
                  fontSize: "12px",
                  color: "#dc2626",
                  fontFamily: FONT_FAMILY,
                }}>
                  🔒 Ticket ini telah diblokir
                  {selectedTicket.blockReason && `: ${selectedTicket.blockReason}`}
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
                              color: isStories ? "#0D3CFC" : "#0D3CFC",
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

        {/* MENURU Text */}
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
