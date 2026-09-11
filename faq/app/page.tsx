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

// ===== BAN USER PERMANEN =====
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

const ArrowRight = ({ size = 20, color = "currentColor" }: { size?: number, color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Footer links
const footerLinks = [
  { title: "Get in Touch", links: ["Contact", "Instagram", "Live Chat"] },
  { title: "Product", links: ["Shop", "Note", "Calendar", "Blog", "Donation", "Community", "Stories"] },
  { title: "Attention", links: ["Privacy Policy", "Terms & Conditions", "About Us", "Terms of Use", "Help Center"] }
];

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
  const [isMounted, setIsMounted] = useState(false);
  const [banMessage, setBanMessage] = useState<string | null>(null);
  const [isBanned, setIsBanned] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [encryptionReady, setEncryptionReady] = useState(false);
  const [checkingBan, setCheckingBan] = useState(true);
  const [canCreateTicket, setCanCreateTicket] = useState(true);
  const [canSendMessage, setCanSendMessage] = useState(true);
  const [adminOnline, setAdminOnline] = useState(false);
  const [adminName, setAdminName] = useState(AGENT_NAME);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatMessagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // ===== CEK STATUS BAN =====
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

  const scrollToBottom = () => {
    if (chatMessagesContainerRef.current) {
      chatMessagesContainerRef.current.scrollTop = chatMessagesContainerRef.current.scrollHeight;
    }
  };

  // ===== REALTIME ADMIN STATUS =====
  useEffect(() => {
    if (!db || !isMounted) return;
    const q = query(collection(db, "users"), where("email", "==", ADMIN_EMAIL));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const data = doc.data();
        setAdminOnline(data.online || false);
        setAdminName(data.displayName || data.name || AGENT_NAME);
      }
    });
    return () => unsubscribe();
  }, [db, isMounted]);

  // ===== QUERY TICKET =====
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
        <h3 style={{
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

  // USER VIEW
  if (!isAdmin) {
    if (isBanned) {
      return (
        <div style={{ marginTop: "40px", paddingTop: "30px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h3 style={{
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
                gap: "6px",
                padding: "0",
                backgroundColor: "transparent",
                color: "#0D3CFC",
                border: "none",
                fontSize: "18px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: FONT_FAMILY,
              }}
            >
              <span>Logout</span>
              <ArrowRight size={18} color="#0D3CFC" />
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
            fontSize: "16px",
            fontWeight: 500,
            color: adminOnline ? "#0D3CFC" : "#999",
            fontFamily: FONT_FAMILY,
            marginBottom: "8px",
          }}>
            {adminOnline ? `${adminName} - Online` : "Agent Offline"}
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

    if (userTickets.length === 0 && !showStartChat) {
      return (
        <div style={{ marginTop: "40px", paddingTop: "30px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h3 style={{
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
                gap: "6px",
                padding: "0",
                backgroundColor: "transparent",
                color: "#0D3CFC",
                border: "none",
                fontSize: "18px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: FONT_FAMILY,
              }}
            >
              <span>Logout</span>
              <ArrowRight size={18} color="#0D3CFC" />
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
            fontSize: "16px",
            fontWeight: 500,
            color: adminOnline ? "#0D3CFC" : "#999",
            fontFamily: FONT_FAMILY,
            marginBottom: "10px",
          }}>
            {adminOnline ? `${adminName} - Online` : "Agent Offline"}
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
            }}
          >
            Start Live Chat
          </button>
        </div>
      );
    }

    if (showStartChat) {
      return (
        <div style={{ marginTop: "40px", paddingTop: "30px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h3 style={{
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
                gap: "6px",
                padding: "0",
                backgroundColor: "transparent",
                color: "#0D3CFC",
                border: "none",
                fontSize: "18px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: FONT_FAMILY,
              }}
            >
              <span>Logout</span>
              <ArrowRight size={18} color="#0D3CFC" />
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

    // USER CHAT INTERFACE - LARGER LAYOUT
    return (
      <div style={{ marginTop: "40px", paddingTop: "30px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <h3 style={{
            fontSize: "24px",
            fontWeight: 600,
            color: "#0D3CFC",
            fontFamily: FONT_FAMILY,
            margin: 0,
          }}>
            Live Chat Agent
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{
              fontSize: "15px",
              fontWeight: 500,
              color: adminOnline ? "#0D3CFC" : "#999",
              fontFamily: FONT_FAMILY,
            }}>
              {adminOnline ? `${adminName} - Online` : "Agent Offline"}
            </span>
            <button
              onClick={handleLogout}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "0",
                backgroundColor: "transparent",
                color: "#0D3CFC",
                border: "none",
                fontSize: "18px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: FONT_FAMILY,
              }}
            >
              <span>Logout</span>
              <ArrowRight size={18} color="#0D3CFC" />
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
          gap: "16px", 
          height: "700px",
          width: "100%",
          overflow: "hidden",
          borderRadius: "12px",
        }}>
          {/* CHAT LIST - LARGER */}
          <div style={{
            width: "320px",
            backgroundColor: "#0D3CFC",
            borderRadius: "12px",
            padding: "14px 0",
            overflowY: "auto",
            flexShrink: 0,
            color: "#fff",
            fontFamily: FONT_FAMILY,
            height: "700px",
          }}>
            <div style={{
              padding: "0 14px 12px 14px",
              borderBottom: "1px solid rgba(255,255,255,0.15)",
              fontWeight: 600,
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#fff",
              position: "sticky",
              top: 0,
              backgroundColor: "#0D3CFC",
              zIndex: 1,
            }}>
              <span>Chat History</span>
              <span style={{
                marginLeft: "auto",
                fontSize: "11px",
                backgroundColor: "rgba(255,255,255,0.2)",
                padding: "2px 8px",
                borderRadius: "8px",
              }}>{tickets.filter(t => t.userId === user.uid).length}</span>
            </div>
            <div style={{ overflowY: "auto", height: "560px" }}>
              {tickets.filter(t => t.userId === user.uid).map((ticket) => {
                const ticketId = generateTicketId(ticket.createdAt);
                const isActive = selectedTicket?.id === ticket.id;
                const statusLabel = ticket.status === 'waiting' ? 'Waiting' :
                                    ticket.status === 'active' ? 'Active' : 'Resolved';
                return (
                  <div
                    key={ticket.id}
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setMessages([]);
                    }}
                    style={{
                      padding: "12px 14px",
                      borderLeft: isActive ? "4px solid #fff" : "4px solid transparent",
                      backgroundColor: isActive ? "rgba(255,255,255,0.12)" : "transparent",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: "14px", color: "#fff", marginBottom: "3px" }}>
                      {ticket.userName}
                    </div>
                    <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", marginBottom: "5px" }}>
                      {ticket.topic}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{
                        fontSize: "10px",
                        backgroundColor: ticket.status === 'waiting' ? '#fef3c7' :
                                        ticket.status === 'active' ? '#d1fae5' : '#e5e7eb',
                        color: ticket.status === 'waiting' ? '#92400e' :
                               ticket.status === 'active' ? '#065f46' : '#6b7280',
                        padding: "2px 8px",
                        borderRadius: "8px",
                        fontWeight: 600,
                      }}>
                        {statusLabel}
                      </span>
                      <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.5)" }}>
                        {ticketId}
                      </span>
                      {ticket.isAnnouncement && (
                        <span style={{
                          fontSize: "9px",
                          color: "#fff",
                          backgroundColor: "rgba(255,255,255,0.2)",
                          padding: "1px 6px",
                          borderRadius: "6px",
                        }}>Announcement</span>
                      )}
                      {ticket.isBroadcast && (
                        <span style={{
                          fontSize: "9px",
                          color: "#fff",
                          backgroundColor: "rgba(255,255,255,0.2)",
                          padding: "1px 6px",
                          borderRadius: "6px",
                        }}>Broadcast</span>
                      )}
                    </div>
                  </div>
                );
              })}
              {tickets.filter(t => t.userId === user.uid).length === 0 && (
                <div style={{ padding: "30px 14px", textAlign: "center", color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>
                  No chats yet
                </div>
              )}
            </div>
            <div style={{ 
              padding: "10px 14px", 
              borderTop: "1px solid rgba(255,255,255,0.1)",
              position: "sticky",
              bottom: 0,
              backgroundColor: "#0D3CFC",
            }}>
              <button
                onClick={() => setShowStartChat(true)}
                style={{
                  width: "100%",
                  padding: "8px",
                  backgroundColor: "rgba(255,255,255,0.15)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: FONT_FAMILY,
                }}
              >
                + New Chat
              </button>
            </div>
          </div>

          {/* CHAT MESSAGES - LARGER */}
          <div style={{
            flex: 1,
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            border: "1px solid #e8e8e8",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            height: "700px",
          }}>
            {selectedTicket ? (
              <>
                <div style={{
                  padding: "14px 20px",
                  backgroundColor: "#0D3CFC",
                  borderBottom: "1px solid #e8e8e8",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexShrink: 0,
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "16px", color: "#ffffff", fontFamily: FONT_FAMILY }}>
                      {selectedTicket.userName}
                      <span style={{ fontSize: "13px", fontWeight: 400, color: "rgba(255,255,255,0.8)", marginLeft: "8px", fontFamily: FONT_FAMILY }}>
                        {selectedTicket.topic}
                      </span>
                      {selectedTicket.isAnnouncement && (
                        <span style={{
                          fontSize: "12px",
                          color: "#fff",
                          backgroundColor: "rgba(255,255,255,0.2)",
                          padding: "2px 8px",
                          borderRadius: "6px",
                          marginLeft: "8px",
                        }}>Announcement</span>
                      )}
                      {selectedTicket.isBroadcast && (
                        <span style={{
                          fontSize: "12px",
                          color: "#fff",
                          backgroundColor: "rgba(255,255,255,0.2)",
                          padding: "2px 8px",
                          borderRadius: "6px",
                          marginLeft: "8px",
                        }}>Broadcast</span>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "3px" }}>
                      <span style={{ fontSize: "12px", color: selectedTicket.status === 'waiting' ? "#fef3c7" : "#d1fae5", fontFamily: FONT_FAMILY, fontWeight: 500 }}>
                        {selectedTicket.status === 'waiting' ? 'Waiting' : 'Active'}
                      </span>
                      {selectedTicket.typing && selectedTicket.status !== 'resolved' && (
                        <span style={{ fontSize: "12px", color: "#ffd700", fontStyle: "italic", fontFamily: FONT_FAMILY }}>
                          {selectedTicket.typingUserName} is typing...
                        </span>
                      )}
                      <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.6)" }}>
                        {generateTicketId(selectedTicket.createdAt)}
                      </span>
                    </div>
                  </div>
                  {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                    <button
                      onClick={() => resolveTicket(selectedTicket.id)}
                      style={{
                        padding: "6px 16px",
                        backgroundColor: "#22c55e",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "12px",
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
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
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
                    padding: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    minHeight: 0,
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                  }}>
                    {messages.length === 0 ? (
                      <div style={{ textAlign: "center", color: "#999", fontSize: "14px", padding: "30px 0", fontFamily: FONT_FAMILY }}>
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
                              padding: "10px 14px",
                              borderRadius: "10px",
                              backgroundColor: isMine ? "#0D3CFC" : "#f0f0f0",
                              color: isMine ? "#fff" : "#000",
                              fontSize: "14px",
                              fontFamily: FONT_FAMILY,
                              wordBreak: "break-word",
                            }}
                          >
                            {!isMine && (
                              <div style={{ fontSize: "11px", fontWeight: 600, color: "#0D3CFC", marginBottom: "4px" }}>
                                {msg.senderName}
                              </div>
                            )}
                            <div>
                              {msg.text}
                              {msg.isBotDetected && <span style={{ fontSize: "11px", color: "#ef4444", marginLeft: "6px" }}>!</span>}
                            </div>
                            <div style={{ 
                              fontSize: "10px", 
                              color: isMine ? "rgba(255,255,255,0.7)" : "#999", 
                              marginTop: "4px",
                              textAlign: "right",
                            }}>
                              {formatTime(msg.timestamp)}
                            </div>
                          </div>
                        );
                      })
                    )}
                    {getTypingText(selectedTicket) && selectedTicket.status !== 'resolved' && (
                      <div style={{
                        alignSelf: "flex-start",
                        fontSize: "13px",
                        color: "#666",
                        fontStyle: "italic",
                        padding: "4px 8px",
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
                    padding: "12px 20px",
                    borderTop: "1px solid #e8e8e8",
                    display: "flex",
                    gap: "10px",
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
                        padding: "10px 14px",
                        border: "1px solid #e8e8e8",
                        borderRadius: "8px",
                        fontSize: "14px",
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
                        padding: "10px 20px",
                        backgroundColor: (selectedTicket.status === 'waiting' || !messageText.trim()) ? "#ccc" : "#0D3CFC",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        cursor: (selectedTicket.status === 'waiting' || !messageText.trim()) ? "not-allowed" : "pointer",
                        fontFamily: FONT_FAMILY,
                        fontSize: "14px",
                        fontWeight: 600,
                      }}
                    >
                      Send
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
                fontSize: "14px",
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

  // ADMIN VIEW - LARGER LAYOUT
  const waitingTickets = tickets.filter(t => t.status === 'waiting');
  const activeTickets = tickets.filter(t => t.status === 'active');
  const resolvedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed');
  const typingText = selectedTicket ? getTypingText(selectedTicket) : null;

  return (
    <div style={{ marginTop: "40px", paddingTop: "30px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
        <h3 style={{
          fontSize: "24px",
          fontWeight: 600,
          color: "#0D3CFC",
          fontFamily: FONT_FAMILY,
          margin: 0,
        }}>
          Live Chat Agent
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{
            fontSize: "15px",
            fontWeight: 500,
            color: adminOnline ? "#0D3CFC" : "#999",
            fontFamily: FONT_FAMILY,
          }}>
            {adminOnline ? `${adminName} - Online` : "Agent Offline"}
          </span>
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "0",
              backgroundColor: "transparent",
              color: "#0D3CFC",
              border: "none",
              fontSize: "18px",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: FONT_FAMILY,
            }}
          >
            <span>Logout</span>
            <ArrowRight size={18} color="#0D3CFC" />
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: "16px", height: "700px" }}>
        {/* TICKET LIST - LARGER */}
        <div style={{
          width: "320px",
          backgroundColor: "#f9f9f9",
          borderRadius: "12px",
          border: "1px solid #e8e8e8",
          overflowY: "auto",
          flexShrink: 0,
          height: "700px",
        }}>
          {waitingTickets.length > 0 && (
            <div>
              <div style={{
                padding: "10px 14px",
                backgroundColor: "#fef3c7",
                fontWeight: 600,
                fontSize: "13px",
                color: "#92400e",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontFamily: FONT_FAMILY,
                position: "sticky",
                top: 0,
                zIndex: 1,
              }}>
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
                    padding: "12px 14px",
                    borderBottom: "1px solid #e8e8e8",
                    cursor: "pointer",
                    backgroundColor: selectedTicket?.id === ticket.id ? "rgba(13,60,252,0.08)" : "transparent",
                    transition: "background 0.2s ease",
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: "14px", color: "#0D3CFC", fontFamily: FONT_FAMILY, marginBottom: "3px" }}>{ticket.userName}</div>
                  <div style={{ fontSize: "12px", color: "#666", fontFamily: FONT_FAMILY }}>{ticket.topic}</div>
                  {ticket.typing && <div style={{ fontSize: "11px", color: "#0D3CFC", fontStyle: "italic", fontFamily: FONT_FAMILY, marginTop: "3px" }}>{ticket.typingUserName} is typing...</div>}
                </div>
              ))}
            </div>
          )}

          {activeTickets.length > 0 && (
            <div>
              <div style={{
                padding: "10px 14px",
                backgroundColor: "#d1fae5",
                fontWeight: 600,
                fontSize: "13px",
                color: "#065f46",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontFamily: FONT_FAMILY,
                position: "sticky",
                top: 0,
                zIndex: 1,
              }}>
                <span>Active ({activeTickets.length})</span>
              </div>
              {activeTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  style={{
                    padding: "12px 14px",
                    borderBottom: "1px solid #e8e8e8",
                    cursor: "pointer",
                    backgroundColor: selectedTicket?.id === ticket.id ? "rgba(13,60,252,0.08)" : "transparent",
                    transition: "background 0.2s ease",
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: "14px", color: "#0D3CFC", fontFamily: FONT_FAMILY, marginBottom: "3px" }}>{ticket.userName}</div>
                  <div style={{ fontSize: "12px", color: "#666", fontFamily: FONT_FAMILY }}>{ticket.topic}</div>
                  {ticket.typing && <div style={{ fontSize: "11px", color: "#0D3CFC", fontStyle: "italic", fontFamily: FONT_FAMILY, marginTop: "3px" }}>{ticket.typingUserName} is typing...</div>}
                  {ticket.lastMessage && <div style={{ fontSize: "11px", color: "#999", marginTop: "4px", fontFamily: FONT_FAMILY }}>{ticket.lastMessage.substring(0, 35)}{ticket.lastMessage.length > 35 ? "..." : ""}</div>}
                </div>
              ))}
            </div>
          )}

          {resolvedTickets.length > 0 && (
            <div>
              <div style={{
                padding: "10px 14px",
                backgroundColor: "#e5e7eb",
                fontWeight: 600,
                fontSize: "13px",
                color: "#6b7280",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontFamily: FONT_FAMILY,
                position: "sticky",
                top: 0,
                zIndex: 1,
              }}>
                <span>Resolved ({resolvedTickets.length})</span>
              </div>
              {resolvedTickets.map((ticket) => {
                const ticketId = generateTicketId(ticket.createdAt);
                return (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    style={{
                      padding: "12px 14px",
                      borderBottom: "1px solid #e8e8e8",
                      cursor: "pointer",
                      backgroundColor: selectedTicket?.id === ticket.id ? "rgba(13,60,252,0.08)" : "transparent",
                      transition: "background 0.2s ease",
                      opacity: 0.7,
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: "14px", color: "#0D3CFC", fontFamily: FONT_FAMILY, marginBottom: "3px" }}>{ticket.userName}</div>
                    <div style={{ fontSize: "12px", color: "#666", fontFamily: FONT_FAMILY }}>{ticket.topic}</div>
                    <div style={{ fontSize: "10px", color: "#6b7280", fontFamily: FONT_FAMILY, marginTop: "3px" }}>{ticketId}</div>
                  </div>
                );
              })}
            </div>
          )}

          {waitingTickets.length === 0 && activeTickets.length === 0 && resolvedTickets.length === 0 && (
            <div style={{ padding: "30px 14px", textAlign: "center", color: "#999", fontSize: "13px", fontFamily: FONT_FAMILY }}>
              No incoming chats
            </div>
          )}
        </div>

        {/* CHAT MESSAGES - LARGER */}
        <div style={{
          flex: 1,
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          border: "1px solid #e8e8e8",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          height: "700px",
        }}>
          {selectedTicket ? (
            <>
              <div style={{
                padding: "14px 20px",
                backgroundColor: "#0D3CFC",
                borderBottom: "1px solid #e8e8e8",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexShrink: 0,
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "16px", color: "#ffffff", fontFamily: FONT_FAMILY }}>
                    {selectedTicket.userName}
                    <span style={{ fontSize: "13px", fontWeight: 400, color: "rgba(255,255,255,0.8)", marginLeft: "8px", fontFamily: FONT_FAMILY }}>
                      {selectedTicket.topic}
                    </span>
                    {selectedTicket.isAnnouncement && (
                      <span style={{
                        fontSize: "12px",
                        color: "#fff",
                        backgroundColor: "rgba(255,255,255,0.2)",
                        padding: "2px 8px",
                        borderRadius: "6px",
                        marginLeft: "8px",
                      }}>Announcement</span>
                    )}
                    {selectedTicket.isBroadcast && (
                      <span style={{
                        fontSize: "12px",
                        color: "#fff",
                        backgroundColor: "rgba(255,255,255,0.2)",
                        padding: "2px 8px",
                        borderRadius: "6px",
                        marginLeft: "8px",
                      }}>Broadcast</span>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "3px" }}>
                    <span style={{ fontSize: "12px", color: selectedTicket.status === 'waiting' ? "#fef3c7" : "#d1fae5", fontFamily: FONT_FAMILY, fontWeight: 500 }}>
                      {selectedTicket.status === 'waiting' ? 'Waiting' : 'Active'}
                    </span>
                    {selectedTicket.typing && selectedTicket.status !== 'resolved' && (
                      <span style={{ fontSize: "12px", color: "#ffd700", fontStyle: "italic", fontFamily: FONT_FAMILY }}>
                        {selectedTicket.typingUserName} is typing...
                      </span>
                    )}
                    <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.6)" }}>
                      {generateTicketId(selectedTicket.createdAt)}
                    </span>
                  </div>
                </div>
                {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                  <button
                    onClick={() => resolveTicket(selectedTicket.id)}
                    style={{
                      padding: "6px 16px",
                      backgroundColor: "#22c55e",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "12px",
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
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
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
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  minHeight: 0,
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}>
                  {messages.length === 0 ? (
                    <div style={{ textAlign: "center", color: "#999", fontSize: "14px", padding: "30px 0", fontFamily: FONT_FAMILY }}>
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
                            padding: "10px 14px",
                            borderRadius: "10px",
                            backgroundColor: isMine ? "#0D3CFC" : "#f0f0f0",
                            color: isMine ? "#fff" : "#000",
                            fontSize: "14px",
                            fontFamily: FONT_FAMILY,
                            wordBreak: "break-word",
                          }}
                        >
                          {!isMine && (
                            <div style={{ fontSize: "11px", fontWeight: 600, color: "#0D3CFC", marginBottom: "4px" }}>
                              {msg.senderName}
                            </div>
                          )}
                          <div>
                            {msg.text}
                            {msg.isBotDetected && <span style={{ fontSize: "11px", color: "#ef4444", marginLeft: "6px" }}>!</span>}
                          </div>
                          <div style={{ 
                            fontSize: "10px", 
                            color: isMine ? "rgba(255,255,255,0.7)" : "#999", 
                            marginTop: "4px",
                            textAlign: "right",
                          }}>
                            {formatTime(msg.timestamp)}
                          </div>
                        </div>
                      );
                    })
                  )}
                  {typingText && selectedTicket.status !== 'resolved' && (
                    <div style={{
                      alignSelf: "flex-start",
                      fontSize: "13px",
                      color: "#666",
                      fontStyle: "italic",
                      padding: "4px 8px",
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
                  padding: "12px 20px",
                  borderTop: "1px solid #e8e8e8",
                  display: "flex",
                  gap: "10px",
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
                      padding: "10px 14px",
                      border: "1px solid #e8e8e8",
                      borderRadius: "8px",
                      fontSize: "14px",
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
                      padding: "10px 20px",
                      backgroundColor: messageText.trim() ? "#0D3CFC" : "#ccc",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      cursor: messageText.trim() ? "pointer" : "not-allowed",
                      fontFamily: FONT_FAMILY,
                      fontSize: "14px",
                      fontWeight: 600,
                    }}
                  >
                    Send
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
              fontSize: "14px",
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
        <div style={{ padding: "0 40px", maxWidth: "1600px", margin: "0 auto", width: "100%" }}>
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
                      linkHref = "/pusat-bantuan";
                    } else if (link === "About Us") {
                      linkHref = "/profile";
                      isAttention = true;
                    } else if (link === "Privacy Policy") {
                      linkHref = "/privacy-policy";
                      isAttention = true;
                    } else if (link === "Terms & Conditions") {
                      linkHref = "/terms-of-services";
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
