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
        return '[Message cannot be decrypted]';
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
    return { isBanned: true, reason: 'Suspicious IP Address' };
  }
  
  const repeatedNumber = /[0-9]{10,}/;
  if (repeatedNumber.test(lowerText)) {
    return { isBanned: true, reason: 'Suspicious Number (bank account/phone)' };
  }
  
  const transferPatterns = [
    /kirim ke rek/i, /transfer ke/i, /bayar ke/i, /setor ke/i,
    /minta kirim/i, /mohon kirim/i, /tolong kirim/i
  ];
  for (const pattern of transferPatterns) {
    if (pattern.test(lowerText)) {
      return { isBanned: true, reason: 'Transfer/Payment Request' };
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
    
    console.log(`✅ User ${userName} (${userId}) has been permanently banned. Reason: ${reason}`);
    console.log(`📌 User ticket remains stored in database`);
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
          reason: userData.botBlockedReason || 'Blocked by system',
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

// Footer links — English only, with new items in Attention
const footerLinks = [
  { title: "Get in Touch", links: ["Contact", "Instagram", "Live Chat"] },
  { title: "Product", links: ["Shop", "Note", "Calendar", "Blog", "Donation", "Community", "Live Chat Agent", "Stories"] },
  { title: "Attention", links: ["Privacy Policy", "Terms & Conditions", "About Us", "Terms of Use", "Help Center"] }
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
  const [banMessage, setBanMessage] = useState<string | null>(null);
  const [isBanned, setIsBanned] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [encryptionReady, setEncryptionReady] = useState(false);
  const [checkingBan, setCheckingBan] = useState(true);
  const [canCreateTicket, setCanCreateTicket] = useState(true);
  const [canSendMessage, setCanSendMessage] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatMessagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const liveChatTitleRef = useRef<HTMLDivElement>(null);

  const topics = [
    "Product Inquiry",
    "Technical Support",
    "Account Issues",
    "Donation",
    "Partnership",
    "Other"
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

  useEffect(() => {
    if (!user || !isMounted) {
      setCheckingBan(false);
      return;
    }
    
    const checkBan = async () => {
      setCheckingBan(true);
      try {
        const status = await checkBanStatus(user.uid);
        console.log('🔍 Checking ban status from database:', status);
        
        if (status.isBanned) {
          setIsBanned(true);
          setBanReason(status.reason);
          setCanCreateTicket(status.canCreateTicket);
          setCanSendMessage(status.canSendMessage);
          setBanMessage(`YOUR ACCOUNT HAS BEEN PERMANENTLY BANNED\n\nReason: ${status.reason}`);
          console.log('🚫 This user is BANNED from database');
        } else {
          setIsBanned(false);
          setBanReason("");
          setCanCreateTicket(true);
          setCanSendMessage(true);
          setBanMessage(null);
          console.log('✅ This user is SAFE (not banned)');
        }
      } catch (error) {
        console.error('Error checking ban:', error);
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
      console.error('Error checking ban before action:', error);
      return false;
    }
  };

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
        ticketList.push({ id: doc.id, ...data } as Ticket);
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
            text = '[Encrypted message]';
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
      await updateDoc(ticketRef, { typing: false, typingUserId: null, typingUserName: null });
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
      setBanMessage(`YOU DO NOT HAVE PERMISSION TO CREATE A NEW TICKET`);
      return;
    }
    
    if (!encryptionReady) {
      alert("Encryption is being initialized, please wait a moment.");
      return;
    }
    
    const hasActiveTicket = tickets.some(t => t.userId === user.uid && (t.status === 'waiting' || t.status === 'active') && !t.isAnnouncement && !t.isBroadcast);
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
        isBroadcast: false
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
        isBotDetected: false
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
      setBanMessage(`YOU DO NOT HAVE PERMISSION TO SEND MESSAGES`);
      setMessageText("");
      return;
    }
    
    const checkResult = containsBannedContent(messageText);
    if (checkResult.isBanned) {
      await banUserPermanent(
        user.uid,
        user.email || '',
        user.displayName || 'User',
        checkResult.reason,
        messageText
      );
      
      setIsBanned(true);
      setBanReason(checkResult.reason);
      setCanCreateTicket(false);
      setCanSendMessage(false);
      setBanMessage(`YOUR ACCOUNT HAS BEEN PERMANENTLY BANNED\n\nReason: ${checkResult.reason}\n\nMessage sent: "${messageText}"`);
      setMessageText("");
      
      const status = await checkBanStatus(user.uid);
      if (status.isBanned) {
        setIsBanned(true);
        setBanReason(status.reason);
        setCanCreateTicket(status.canCreateTicket);
        setCanSendMessage(status.canSendMessage);
        setBanMessage(`YOUR ACCOUNT HAS BEEN PERMANENTLY BANNED\n\nReason: ${status.reason}`);
      }
      
      return;
    }
    
    if (!encryptionReady) {
      alert("Encryption is being initialized, please wait a moment.");
      return;
    }
    
    if (selectedTicket.status === 'resolved' || selectedTicket.status === 'closed') {
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
    const name = ticket.typingUserName || "Someone";
    return `${name} is typing...`;
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

  if (checkingBan) {
    return (
      <div style={{ marginTop: "40px", paddingTop: "30px" }}>
        <h3 style={{
          fontSize: "22px",
          fontWeight: 600,
          color: "#0D3CFC",
          fontFamily: FONT_FAMILY,
        }}>
          Live Chat Agent
        </h3>
        <div style={{
          padding: "20px",
          textAlign: "center",
          color: "#666",
          fontFamily: FONT_FAMILY,
        }}>
          Checking account status...
        </div>
      </div>
    );
  }

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
              Please login to use Live Chat Agent
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

  if (!isAdmin) {
    if (isBanned) {
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
            color: "#0D3CFC",
            fontSize: "50px",
            fontWeight: 700,
            fontFamily: FONT_FAMILY,
            lineHeight: 1.2,
            marginBottom: "12px",
            letterSpacing: "-0.02em",
          }}>
            YOUR ACCOUNT HAS BEEN PERMANENTLY BANNED
          </div>
          
          <div style={{
            color: "#0D3CFC",
            fontSize: "22px",
            fontWeight: 400,
            fontFamily: FONT_FAMILY,
            marginBottom: "6px",
          }}>
            REASON: {banReason || "SUSPICIOUS ACTIVITY"}
          </div>
          
          <div style={{
            color: "#0D3CFC",
            fontSize: "18px",
            fontWeight: 300,
            fontFamily: FONT_FAMILY,
            marginBottom: "20px",
          }}>
            YOU CANNOT USE LIVE CHAT AGENT
          </div>
          
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "16px",
          }}>
            <PulsingDots active={agentOnline} />
            <span style={{ fontSize: "14px", color: agentOnline ? "#0D3CFC" : "#999", fontFamily: FONT_FAMILY }}>
              {agentOnline ? "Agent Online" : "Agent Offline"}
            </span>
          </div>
          
          <div style={{
            color: "#0D3CFC",
            fontSize: "16px",
            fontWeight: 400,
            fontFamily: FONT_FAMILY,
          }}>
            {!canCreateTicket && "CANNOT CREATE NEW TICKET"}
            {!canSendMessage && "  CANNOT SEND MESSAGES"}
          </div>
          
          <div style={{
            color: "#0D3CFC",
            fontSize: "14px",
            fontWeight: 300,
            fontFamily: FONT_FAMILY,
            marginTop: "20px",
          }}>
            CONTACT ADMIN FOR FURTHER INFORMATION
          </div>
        </div>
      );
    }

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
          
          {banMessage && (
            <div style={{
              color: "#0D3CFC",
              fontSize: "20px",
              fontWeight: 500,
              fontFamily: FONT_FAMILY,
              marginBottom: "10px",
            }}>
              {banMessage}
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
            Need help? Chat directly with our agent.
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
            <span>Start Live Chat</span>
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
          
          {banMessage && (
            <div style={{
              color: "#0D3CFC",
              fontSize: "20px",
              fontWeight: 500,
              fontFamily: FONT_FAMILY,
              marginBottom: "10px",
            }}>
              {banMessage}
            </div>
          )}
          
          <div style={{ maxWidth: "360px" }}>
            <div style={{ fontSize: "13px", marginBottom: "8px", fontFamily: FONT_FAMILY }}>
              Select your issue topic:
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
              <option value="">-- Select topic --</option>
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
                Start Chat
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
                Cancel
              </button>
            </div>
          </div>
        </div>
      );
    }

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

        {banMessage && (
          <div style={{
            color: "#0D3CFC",
            fontSize: "20px",
            fontWeight: 500,
            fontFamily: FONT_FAMILY,
            marginBottom: "10px",
          }}>
            {banMessage}
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
              <span>Chat History</span>
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
                const statusLabel = ticket.status === 'waiting' ? 'Waiting' :
                                    ticket.status === 'active' ? 'Active' : 'Resolved';
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
                  No chats yet
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
                + New Chat
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
                        <span style={{ fontSize: "10px", color: "#fcd34d", marginLeft: "5px" }}>📢 Announcement</span>
                      )}
                      {selectedTicket.isBroadcast && (
                        <span style={{ fontSize: "10px", color: "#60a5fa", marginLeft: "5px" }}>📡 Broadcast</span>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <span style={{ fontSize: "9px", color: selectedTicket.status === 'waiting' ? "#fef3c7" : "#d1fae5", fontFamily: FONT_FAMILY }}>
                        {selectedTicket.status === 'waiting' ? 'Waiting' : 'Active'}
                      </span>
                      {selectedTicket.typing && selectedTicket.status !== 'resolved' && (
                        <span style={{ fontSize: "9px", color: "#ffd700", fontStyle: "italic", fontFamily: FONT_FAMILY }}>
                          {selectedTicket.typingUserName} is typing...
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
                      Resolve
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
                        No messages yet
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
                      placeholder={selectedTicket.status === 'waiting' ? "Waiting for agent..." : "Type a message..."}
                      disabled={selectedTicket.status === 'waiting'}
                      style={{
                        flex: 1,
                        padding: "5px 8px",
                        border: "1px solid #e8e8e8",
                        borderRadius: "5px",
                        fontSize: "11px",
                        outline: "none",
                        fontFamily: FONT_FAMILY,
                        backgroundColor: selectedTicket.status === 'waiting' ? "#f5f5f5" : "#fff",
                      }}
                      onFocus={(e) => { if (selectedTicket.status !== 'waiting') e.currentTarget.style.borderColor = "#0D3CFC"; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "#e8e8e8"; }}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={selectedTicket.status === 'waiting' || !messageText.trim()}
                      style={{
                        padding: "5px 10px",
                        backgroundColor: (selectedTicket.status === 'waiting' || !messageText.trim()) ? "#ccc" : "#0D3CFC",
                        color: "#fff",
                        border: "none",
                        borderRadius: "5px",
                        cursor: (selectedTicket.status === 'waiting' || !messageText.trim()) ? "not-allowed" : "pointer",
                        fontFamily: FONT_FAMILY,
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "11px",
                      }}
                    >
                      <SendIcon size={12} />
                      <span>Send</span>
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
                Select a chat from the list on the left
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
                <span>Waiting ({waitingTickets.length})</span>
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
                  {ticket.typing && <div style={{ fontSize: "8px", color: "#0D3CFC", fontStyle: "italic", fontFamily: FONT_FAMILY }}>{ticket.typingUserName} is typing...</div>}
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
                <span>Active ({activeTickets.length})</span>
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
                  {ticket.typing && <div style={{ fontSize: "8px", color: "#0D3CFC", fontStyle: "italic", fontFamily: FONT_FAMILY }}>{ticket.typingUserName} is typing...</div>}
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
                <span>Resolved ({resolvedTickets.length})</span>
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
              No incoming chats
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
                      {selectedTicket.status === 'waiting' ? 'Waiting' : 'Active'}
                    </span>
                    {selectedTicket.typing && selectedTicket.status !== 'resolved' && (
                      <span style={{ fontSize: "9px", color: "#ffd700", fontStyle: "italic", fontFamily: FONT_FAMILY }}>
                        {selectedTicket.typingUserName} is typing...
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
                    Resolve
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
                    placeholder="Type a reply..."
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
                    <span>Send</span>
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
              Select a chat from the list on the left
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

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
                    } else if (link === "Help Center") {
                      linkHref = "/help-center";
                    } else if (link === "Privacy Policy") {
                      linkHref = "/privacy-policy";
                      isAttention = true;
                    } else if (link === "Terms & Conditions") {
                      linkHref = "/terms-conditions";
                      isAttention = true;
                    } else if (link === "About Us") {
                      linkHref = "/about-us";
                      isAttention = true;
                    } else if (link === "Terms of Use") {
                      linkHref = "/terms-of-use";
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
                            Updated
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

          {/* Terms & Conditions Notice */}
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

        {/* MENURU Text + Copyright */}
        <div
          ref={menuruFooterRef}
          style={{
            width: "100%",
            padding: "20px 40px 80px 40px",
            backgroundColor: "#ffffff",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
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

          {/* Copyright */}
          <div
            style={{
              marginTop: "30px",
              width: "100%",
              display: "flex",
              justifyContent: "flex-start",
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
