'use client';

import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
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
  getDocs, 
  setDoc, 
  getDoc, 
  deleteDoc,
  runTransaction,
  writeBatch
} from "firebase/firestore";
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

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

// ===== ENKRIPSI AES-256-GCM =====
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
      {
        name: 'AES-GCM',
        iv: iv,
        tagLength: 128
      },
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
    
    if (!encrypted.startsWith('encrypted:')) {
      return encrypted;
    }
    
    const base64Data = encrypted.substring('encrypted:'.length);
    const combined = base64ToUint8Array(base64Data);
    
    const iv = combined.slice(0, IV_LENGTH);
    const encryptedData = combined.slice(IV_LENGTH);
    
    const key = await getCryptoKey();
    
    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
        tagLength: 128
      },
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

// ===== ANTI-BOT - DIRECT BAN =====
const BAN_KEYWORDS = {
  JUDOL: [
    'judi', 'slot', 'poker', 'casino', 'roulette', 'blackjack', 'baccarat',
    'togel', 'toto', '4d', '3d', '2d', 'colok', 'macau', 'singapore',
    'hongkong', 'sydney', 'bandar', 'bookie', 'odds', 'bet', 'taruhan',
    'jackpot', 'progressive', 'bonus', 'deposit', 'withdraw', 'wd',
    'live casino', 'online casino', 'gambling', 'judol', 'slot online',
    'maxwin', 'scatter', 'wild', 'free spin', 'situs judi', 'agen judi',
    'bo', 'qq', 'domino', 'capsa', 'ceme', 'taruhan bola', 'sportsbook',
    'parlay', 'mix parlay', 'over under', 'handicap', '1x2'
  ],
  PHISHING: [
    'phishing', 'scam', 'fraud', 'penipuan', 'tipu', 'rekening', 'transfer',
    'minta uang', 'pinjam uang', 'kartu kredit', 'kartu atm', 'pin', 'password',
    'otp', 'verifikasi', 'validasi', 'konfirmasi', 'akun bank', 'nomor rekening',
    'no rek', 'rek', 'minta kirim', 'kirim ke', 'bayar ke', 'setor ke',
    'investasi bodong', 'money game', 'ponzi', 'phising', 'pishing',
    'data pribadi', 'informasi pribadi', 'ktp', 'nik', 'kk', 'akte',
    'ijazah', 'transkrip', 'password bank', 'm-banking', 'mobile banking',
    'internet banking', 'i-banking', 'e-banking'
  ],
  MALICIOUS: [
    '<script', 'javascript:', 'onclick', 'onload', 'eval(', 'document.',
    'window.', 'alert(', 'prompt(', 'confirm(', 'function', 'var ',
    'const ', 'let ', '=>', '===', '!==', 'localStorage', 'sessionStorage',
    'document.cookie', 'fetch(', 'XMLHttpRequest', '$.ajax', 'axios.',
    'require(', 'import ', 'export ', 'module.exports'
  ],
  SUSPICIOUS_LINKS: [
    'bit.ly', 'tinyurl', 'shorturl', 'rb.gy', 'cutt.ly', 't.co', 'ow.ly',
    'buff.ly', 'adf.ly', 'shorte.st', 'goo.gl', 'is.gd', 'v.gd', 'migre.me',
    'tiny.cc', 'short.link', '.xyz', '.top', '.club', '.online', '.site',
    '.win', '.bid', '.loan', '.date', '.download', '.stream', '.watch',
    '.free', '.click', '.biz', '.info', '.name', '.pro', '.tech', '.store',
    '.shop', '.live', '.app', '.dev', '.work', '.cloud', '.host'
  ]
};

function containsBannedContent(text: string): { isBanned: boolean; reason: string } {
  const lowerText = text.toLowerCase();
  
  for (const keyword of BAN_KEYWORDS.JUDOL) {
    if (lowerText.includes(keyword)) {
      return { isBanned: true, reason: `Judi Online (${keyword})` };
    }
  }
  
  for (const keyword of BAN_KEYWORDS.PHISHING) {
    if (lowerText.includes(keyword)) {
      return { isBanned: true, reason: `Phishing/Scam (${keyword})` };
    }
  }
  
  for (const keyword of BAN_KEYWORDS.MALICIOUS) {
    if (lowerText.includes(keyword)) {
      return { isBanned: true, reason: `Konten Berbahaya (${keyword})` };
    }
  }
  
  for (const keyword of BAN_KEYWORDS.SUSPICIOUS_LINKS) {
    if (lowerText.includes(keyword)) {
      return { isBanned: true, reason: `Link Mencurigakan (${keyword})` };
    }
  }
  
  const ipPattern = /[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/;
  if (ipPattern.test(lowerText)) {
    return { isBanned: true, reason: 'IP Address mencurigakan' };
  }
  
  const repeatedNumber = /[0-9]{10,}/;
  if (repeatedNumber.test(lowerText)) {
    return { isBanned: true, reason: 'Nomor mencurigakan (rekening/telepon)' };
  }
  
  const transferPatterns = [
    /kirim ke rek/i, /transfer ke/i, /bayar ke/i, /setor ke/i,
    /minta kirim/i, /mohon kirim/i, /tolong kirim/i
  ];
  for (const pattern of transferPatterns) {
    if (pattern.test(lowerText)) {
      return { isBanned: true, reason: 'Permintaan transfer/pembayaran' };
    }
  }
  
  return { isBanned: false, reason: '' };
}

// ===== BAN USER PERMANEN - TIDAK HAPUS TICKET =====
async function banUserPermanent(userId: string, userEmail: string, userName: string, reason: string, message: string) {
  if (!db) return;
  
  try {
    const now = new Date().toISOString();
    
    const botRef = doc(db, "bot_blocks", userId);
    await setDoc(botRef, {
      userId,
      userEmail,
      userName,
      isBlocked: true,
      blockedAt: now,
      blockedReason: reason,
      blockedMessage: message,
      canCreateTicket: false,
      canSendMessage: false,
      violations: [{
        type: 'BANNED',
        reason: reason,
        timestamp: now,
        message: message,
        confidence: 100
      }],
      totalViolations: 1,
      warningCount: 0,
      firstViolation: now,
      lastViolation: now
    });
    
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      botBlocked: true,
      botBlockedAt: serverTimestamp(),
      botBlockedReason: reason,
      botBlockedMessage: message,
      canCreateTicket: false,
      canSendMessage: false
    });
    
    await addDoc(collection(db, "bot_violations_log"), {
      userId,
      userEmail,
      userName,
      violation: {
        type: 'BANNED',
        reason: reason,
        timestamp: now,
        message: message,
        confidence: 100
      },
      timestamp: serverTimestamp(),
      resolved: false,
      isBan: true
    });
    
    console.log(`✅ User ${userName} (${userId}) telah dibanned permanen. Alasan: ${reason}`);
    console.log(`📌 Ticket user tetap tersimpan di database`);
  } catch (error) {
    console.error("Error banning user:", error);
  }
}

// ===== CEK STATUS BAN =====
async function checkBanStatus(userId: string): Promise<{ 
  isBanned: boolean; 
  reason: string; 
  message: string;
  canCreateTicket: boolean;
  canSendMessage: boolean;
}> {
  if (!db) return { 
    isBanned: false, 
    reason: '', 
    message: '',
    canCreateTicket: true,
    canSendMessage: true
  };
  
  try {
    const botRef = doc(db, "bot_blocks", userId);
    const botDoc = await getDoc(botRef);
    
    if (botDoc.exists()) {
      const data = botDoc.data();
      return {
        isBanned: data.isBlocked || false,
        reason: data.blockedReason || '',
        message: data.blockedMessage || '',
        canCreateTicket: data.canCreateTicket !== false,
        canSendMessage: data.canSendMessage !== false
      };
    }
    
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      if (userData.botBlocked === true) {
        return {
          isBanned: true,
          reason: userData.botBlockedReason || 'Diblokir oleh sistem',
          message: userData.botBlockedMessage || '',
          canCreateTicket: userData.canCreateTicket !== false,
          canSendMessage: userData.canSendMessage !== false
        };
      }
    }
    
    return { 
      isBanned: false, 
      reason: '', 
      message: '',
      canCreateTicket: true,
      canSendMessage: true
    };
  } catch (error) {
    console.error("Error checking ban status:", error);
    return { 
      isBanned: false, 
      reason: '', 
      message: '',
      canCreateTicket: true,
      canSendMessage: true
    };
  }
}

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

// Footer links — Live Chat Agent dihapus dari "Get in Touch"
const footerLinks = [
  { title: "Get in Touch", links: ["Contact", "Instagram", "Live Chat"] },
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
    if (!showMain || !isMounted) return;

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
