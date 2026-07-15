'use client';

import React, { useState, useEffect, useRef } from "react";
import { initializeApp, getApps } from "firebase/app";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
  where,
  getDocs,
  updateDoc,
  onDisconnect
} from "firebase/firestore";

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

const googleProvider = new GoogleAuthProvider();

// Language Type
type Language = 'id' | 'en';

// Font Family
const FONT_FAMILY = "var(--font-geist), 'Geist', sans-serif";


// Get initial language from URL
const getInitialLanguage = (): Language => {
  if (typeof window === 'undefined') return 'id';
  const path = window.location.pathname;
  if (path.startsWith('/en/') || path === '/en') return 'en';
  if (path.startsWith('/id/') || path === '/id') return 'id';
  return 'id';
};

// Change language and update URL
const changeLanguage = (lang: Language) => {
  if (typeof window === 'undefined') return;
  const currentPath = window.location.pathname;
  const currentSearch = window.location.search;
  const currentHash = window.location.hash;
  
  let newPath = currentPath;
  
  // Remove existing language prefix
  if (currentPath.startsWith('/en/') || currentPath === '/en') {
    newPath = currentPath.replace(/^\/en/, '');
  } else if (currentPath.startsWith('/id/') || currentPath === '/id') {
    newPath = currentPath.replace(/^\/id/, '');
  }
  
  // If newPath is empty or just '/', set to '/'
  if (!newPath || newPath === '') {
    newPath = '/';
  }
  
  // Add new language prefix
  if (lang === 'en') {
    newPath = `/en${newPath}`;
  } else {
    newPath = `/id${newPath}`;
  }
  
  // Navigate to new URL
  window.history.pushState({}, '', `${newPath}${currentSearch}${currentHash}`);
  
  // Dispatch popstate event to notify components
  window.dispatchEvent(new PopStateEvent('popstate'));
};

// Translations
const translations = {
  id: {
    // Header
    'chatWithMenuru': 'Chat dengan Menuru',
    'login': 'Masuk',
    'logout': 'Keluar',
    'profile': 'Profil',
    'online': 'Online',
    'offline': 'Offline',
    'lastSeen': 'Terakhir online',
    'typing': 'sedang mengetik...',
    
    // Chat
    'messages': 'Pesan',
    'noMessages': 'Belum ada pesan',
    'typeMessage': 'Ketik pesan...',
    'typeReply': 'Ketik balasan...',
    'send': 'Kirim',
    'newChat': 'Chat Baru',
    'selectUser': 'Pilih user...',
    'startChat': 'Mulai Chat',
    'cancel': 'Batal',
    'allUsersChatted': 'Semua user sudah di-chat',
    'noChatHistory': 'Belum ada riwayat chat',
    
    // Profile
    'note': 'Catatan',
    'addNote': 'Tambah',
    'editNote': 'Edit',
    'save': 'Simpan',
    'bio': 'Bio',
    'addBio': 'Tambah',
    'editBio': 'Edit',
    'noBio': 'Belum ada bio',
    'noNote': 'Belum ada catatan',
    'sendMessage': 'Kirim Pesan',
    'back': 'Kembali',
    
    // Pinned
    'pinnedUsers': 'User Pinned',
    'pinnedChats': 'Chat Pinned',
    'pinnedMessages': 'Pesan Pinned',
    'unpin': 'Lepas Pin',
    'pin': 'Pin',
    
    // Update
    'updateSystem': 'Update Sistem',
    'updateHistory': 'Riwayat pembaruan dan pengembangan',
    'updateDetail': 'Detail Update',
    'live': 'Live',
    'comingSoon': 'Coming Soon',
    'done': 'Selesai',
    'link': 'Link',
    
    // Privacy Policy
    'privacyPolicy': 'Kebijakan Privasi',
    'lastUpdated': 'Terakhir diperbarui',
    
    // Buttons
    'reply': 'Balas',
    'resend': 'Kirim Ulang',
    'forward': 'Teruskan',
    'share': 'Bagikan',
    'close': 'Tutup',
    'more': 'Lainnya',
    
    // Modal
    'loginTitle': 'Masuk',
    'email': 'Email',
    'password': 'Kata Sandi',
    'loginWithEmail': 'Masuk dengan Email',
    'or': 'atau',
    'loginWithGoogle': 'Masuk dengan Google',
    'loginFailed': 'Login gagal. Silahkan coba lagi.',
    'wrongCredentials': 'Email atau password salah.',
    
    // Announcement
    'announcement': 'Pengumuman',
    'announcementText': 'Fitur chat sedang dalam tahap pengembangan.',
    
    // Status
    'read': 'Dibaca',
    'sent': 'Terkirim',
    'officialAccount': 'Akun Resmi',
    
    // Share Modal
    'forwardMessage': 'Teruskan Pesan',
    'from': 'Dari',
    'selectUserToShare': 'Pilih user...',
    'forwardButton': 'Teruskan',
    
    // Chat Button
    'chatWithMenuru': 'Chat dengan Menuru',
    'loginToChat': 'Masuk untuk Chat',
    
    // Update status labels
    'statusLive': 'Live',
    'statusComing': 'Coming Soon',
    'statusDone': 'Done',
  },
  en: {
    // Header
    'chatWithMenuru': 'Chat with Menuru',
    'login': 'Login',
    'logout': 'Logout',
    'profile': 'Profile',
    'online': 'Online',
    'offline': 'Offline',
    'lastSeen': 'Last seen',
    'typing': 'typing...',
    
    // Chat
    'messages': 'Messages',
    'noMessages': 'No messages yet',
    'typeMessage': 'Type a message...',
    'typeReply': 'Type a reply...',
    'send': 'Send',
    'newChat': 'New Chat',
    'selectUser': 'Select user...',
    'startChat': 'Start Chat',
    'cancel': 'Cancel',
    'allUsersChatted': 'All users are already in chat',
    'noChatHistory': 'No chat history',
    
    // Profile
    'note': 'Note',
    'addNote': 'Add',
    'editNote': 'Edit',
    'save': 'Save',
    'bio': 'Bio',
    'addBio': 'Add',
    'editBio': 'Edit',
    'noBio': 'No bio yet',
    'noNote': 'No note yet',
    'sendMessage': 'Send Message',
    'back': 'Back',
    
    // Pinned
    'pinnedUsers': 'Pinned Users',
    'pinnedChats': 'Pinned Chats',
    'pinnedMessages': 'Pinned Messages',
    'unpin': 'Unpin',
    'pin': 'Pin',
    
    // Update
    'updateSystem': 'Update System',
    'updateHistory': 'Update and development history',
    'updateDetail': 'Update Detail',
    'live': 'Live',
    'comingSoon': 'Coming Soon',
    'done': 'Done',
    'link': 'Link',
    
    // Privacy Policy
    'privacyPolicy': 'Privacy Policy',
    'lastUpdated': 'Last updated',
    
    // Buttons
    'reply': 'Reply',
    'resend': 'Resend',
    'forward': 'Forward',
    'share': 'Share',
    'close': 'Close',
    'more': 'More',
    
    // Modal
    'loginTitle': 'Login',
    'email': 'Email',
    'password': 'Password',
    'loginWithEmail': 'Login with Email',
    'or': 'or',
    'loginWithGoogle': 'Login with Google',
    'loginFailed': 'Login failed. Please try again.',
    'wrongCredentials': 'Wrong email or password.',
    
    // Announcement
    'announcement': 'Announcement',
    'announcementText': 'Chat feature is under development.',
    
    // Status
    'read': 'Read',
    'sent': 'Sent',
    'officialAccount': 'Official Account',
    
    // Share Modal
    'forwardMessage': 'Forward Message',
    'from': 'From',
    'selectUserToShare': 'Select user...',
    'forwardButton': 'Forward',
    
    // Chat Button
    'chatWithMenuru': 'Chat with Menuru',
    'loginToChat': 'Login to Chat',
    
    // Update status labels
    'statusLive': 'Live',
    'statusComing': 'Coming Soon',
    'statusDone': 'Done',
  }
};

// Language Selector Component with URL-based routing
const LanguageSelector = ({ language, setLanguage }: { language: Language; setLanguage: (lang: Language) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    changeLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: "none",
          border: "1px solid #e0e0e0",
          borderRadius: "8px",
          padding: "6px 12px",
          fontSize: "13px",
          fontWeight: 500,
          color: "#000",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontFamily: FONT_FAMILY,
          backgroundColor: "#f5f5f5",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#e8e8e8";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#f5f5f5";
        }}
      >
        <span style={{ fontSize: "16px" }}>{language === 'id' ? '🇮🇩' : '🇬🇧'}</span>
        <span>{language === 'id' ? 'ID' : 'EN'}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}>
          <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              backgroundColor: "#ffffff",
              borderRadius: "8px",
              boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
              border: "1px solid #e0e0e0",
              overflow: "hidden",
              minWidth: "140px",
              zIndex: 1000,
            }}
          >
            <button
              onClick={() => handleLanguageChange('id')}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 16px",
                width: "100%",
                border: "none",
                background: language === 'id' ? "#f0f0f0" : "transparent",
                cursor: "pointer",
                fontSize: "14px",
                color: "#000",
                fontFamily: FONT_FAMILY,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f5f5f5";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = language === 'id' ? "#f0f0f0" : "transparent";
              }}
            >
              <span style={{ fontSize: "18px" }}>🇮🇩</span>
              <span>Indonesia</span>
              {language === 'id' && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginLeft: "auto" }}>
                  <path d="M20 6L9 17L4 12" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
            <button
              onClick={() => handleLanguageChange('en')}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 16px",
                width: "100%",
                border: "none",
                background: language === 'en' ? "#f0f0f0" : "transparent",
                cursor: "pointer",
                fontSize: "14px",
                color: "#000",
                fontFamily: FONT_FAMILY,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f5f5f5";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = language === 'en' ? "#f0f0f0" : "transparent";
              }}
            >
              <span style={{ fontSize: "18px" }}>🇬🇧</span>
              <span>English</span>
              {language === 'en' && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginLeft: "auto" }}>
                  <path d="M20 6L9 17L4 12" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface ChatUser {
  id: string;
  name: string;
  email: string;
  photoURL: string;
  createdAt?: any;
  isPinned?: boolean;
  isOfficial?: boolean;
  online?: boolean;
  lastSeen?: any;
  typing?: boolean;
  bio?: string;
  note?: string;
}

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  timestamp: any;
  read: boolean;
  readAt?: any;
  isPinned?: boolean;
  pinnedAt?: any;
  replyTo?: string;
  replyToText?: string;
  replyToSender?: string;
  sharedFrom?: string;
  sharedFromName?: string;
  isShared?: boolean;
}

interface ChatRoom {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageTime?: any;
  lastMessageSenderId?: string;
  unreadCount: number;
  isPinned?: boolean;
}

interface UpdateItem {
  id: string;
  title: string;
  description: string;
  date: string;
  status: "live" | "coming" | "done";
  detail: string;
  link: string;
  publishedBy: string;
}

// SVG Icons
const PinIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <path d="M12 2L15 9H21L16 14L18 21L12 17L6 21L8 14L3 9H9L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill={filled ? "currentColor" : "none"} />
  </svg>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PinDropdownIcon = ({ isOpen = false }: { isOpen?: boolean }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}>
    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ReplyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <path d="M3 10L10 3V7C15 7 19 9 21 13C19 11 15 10 10 10V14L3 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);

const ShareIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M8.5 10.5L15.5 6.5M8.5 13.5L15.5 17.5" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const MoreIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="5" r="1.5" fill="currentColor"/>
    <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
    <circle cx="12" cy="19" r="1.5" fill="currentColor"/>
  </svg>
);

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Awwwards Style Dot Indicator
const AwwwardsDot = ({ color = "#4ade80", isActive = false, size = 10 }: { color?: string; isActive?: boolean; size?: number }) => {
  return (
    <div style={{ 
      position: "relative", 
      display: "inline-flex", 
      alignItems: "center", 
      justifyContent: "center",
      width: `${size}px`,
      height: `${size}px`,
    }}>
      {isActive && (
        <div
          style={{
            position: "absolute",
            width: `${size * 2.8}px`,
            height: `${size * 2.8}px`,
            borderRadius: "50%",
            backgroundColor: color,
            opacity: 0.20,
            animation: "awwwardsPulse 2s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
      )}
      
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "50%",
          backgroundColor: color,
          position: "relative",
          zIndex: 2,
          transition: "all 0.3s ease",
        }}
      />
    </div>
  );
};

// Online Status Indicator
const OnlineIndicator = ({ online, lastSeen, language }: { online: boolean; lastSeen?: string; language: Language }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const color = online ? "#4ade80" : "#999";
  const t = translations[language];
  
  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        style={{ cursor: "pointer" }}
      >
        <AwwwardsDot color={color} isActive={online} size={8} />
      </div>
      {showTooltip && (
        <div style={{
          position: "absolute",
          bottom: "calc(100% + 8px)",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "#1a1a1a",
          color: "#fff",
          padding: "4px 10px",
          borderRadius: "6px",
          fontSize: "11px",
          whiteSpace: "nowrap",
          zIndex: 100,
          border: "1px solid rgba(255,255,255,0.05)",
          fontFamily: FONT_FAMILY,
        }}>
          {online ? t.online : (lastSeen || t.offline)}
          <div style={{
            position: "absolute",
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            border: "6px solid transparent",
            borderTopColor: "#1a1a1a",
          }} />
        </div>
      )}
    </div>
  );
};

// Read Status
const ReadStatus = ({ msg, isMine, language }: { msg: Message; isMine: boolean; language: Language }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const t = translations[language];
  
  if (!isMine) return null;
  
  const status = (() => {
    if (msg.senderId !== auth?.currentUser?.uid) return null;
    if (msg.read && msg.readAt) {
      return { icon: "✓✓", color: "#0095f6", label: t.read };
    }
    return { icon: "✓", color: "#999", label: t.sent };
  })();
  
  if (!status) return null;
  
  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <span 
        style={{
          fontSize: "10px",
          color: status.color,
          fontWeight: status.label === t.read ? 600 : 400,
          cursor: "pointer",
          fontFamily: FONT_FAMILY,
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {status.icon}
      </span>
      {showTooltip && (
        <div style={{
          position: "absolute",
          bottom: "calc(100% + 8px)",
          right: 0,
          backgroundColor: "#1a1a1a",
          color: "#fff",
          padding: "4px 10px",
          borderRadius: "6px",
          fontSize: "11px",
          whiteSpace: "nowrap",
          zIndex: 100,
          border: "1px solid rgba(255,255,255,0.05)",
          fontFamily: FONT_FAMILY,
        }}>
          {status.label}
          <div style={{
            position: "absolute",
            top: "100%",
            right: "10px",
            border: "6px solid transparent",
            borderTopColor: "#1a1a1a",
          }} />
        </div>
      )}
    </div>
  );
};

// Instagram Verified Badge
const InstagramVerifiedBadge = ({ size = 16, language }: { size?: number; language: Language }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const t = translations[language];
  
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          marginLeft: "4px",
          display: "inline-block",
          verticalAlign: "-2px",
          cursor: "pointer",
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <path
          fill="#0095F6"
          d="
            M12 2.2
            C13.6 3.8 16.2 3.8 17.8 2.2
            C18.6 3.8 20.2 5.4 21.8 6.2
            C20.2 7.8 20.2 10.4 21.8 12
            C20.2 13.6 20.2 16.2 21.8 17.8
            C20.2 18.6 18.6 20.2 17.8 21.8
            C16.2 20.2 13.6 20.2 12 21.8
            C10.4 20.2 7.8 20.2 6.2 21.8
            C5.4 20.2 3.8 18.6 2.2 17.8
            C3.8 16.2 3.8 13.6 2.2 12
            C3.8 10.4 3.8 7.8 2.2 6.2
            C3.8 5.4 5.4 3.8 6.2 2.2
            C7.8 3.8 10.4 3.8 12 2.2
            Z
          "
        />
        <path
          d="M9.2 12.3l2 2 4.6-4.6"
          stroke="white"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {showTooltip && (
        <div style={{
          position: "absolute",
          bottom: "calc(100% + 8px)",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "#1a1a1a",
          color: "#fff",
          padding: "4px 10px",
          borderRadius: "6px",
          fontSize: "11px",
          whiteSpace: "nowrap",
          zIndex: 100,
          border: "1px solid rgba(255,255,255,0.05)",
          fontFamily: FONT_FAMILY,
        }}>
          {t.officialAccount}
          <div style={{
            position: "absolute",
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            border: "6px solid transparent",
            borderTopColor: "#1a1a1a",
          }} />
        </div>
      )}
    </div>
  );
};

export default function HomePage(): React.JSX.Element {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);
  const t = translations[language];
  
  const [user, setUser] = useState<any>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<ChatUser | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [totalUnread, setTotalUnread] = useState(0);
  const [showPinnedUsers, setShowPinnedUsers] = useState(false);
  const [showPinnedChats, setShowPinnedChats] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [selectedNewUser, setSelectedNewUser] = useState("");
  const [addUserStatus, setAddUserStatus] = useState("");
  const [pinnedMessages, setPinnedMessages] = useState<Message[]>([]);
  const [showPinnedMessages, setShowPinnedMessages] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareMessage, setShareMessage] = useState<Message | null>(null);
  const [selectedShareUser, setSelectedShareUser] = useState("");
  const [showMessageMenu, setShowMessageMenu] = useState<string | null>(null);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [profileUser, setProfileUser] = useState<ChatUser | null>(null);
  const [editBio, setEditBio] = useState(false);
  const [bioInput, setBioInput] = useState("");
  const [editNote, setEditNote] = useState(false);
  const [noteInput, setNoteInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const rollingInterval = useRef<NodeJS.Timeout | null>(null);

  // Update Page
  const [showUpdate, setShowUpdate] = useState(false);
  const [selectedUpdateId, setSelectedUpdateId] = useState<string | null>(null);
  
  // Privacy Policy
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  // Chat button text - rolling text
  const [chatButtonText, setChatButtonText] = useState(t.chatWithMenuru);
  const [incomingMessagesList, setIncomingMessagesList] = useState<string[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isIncomingMessage, setIsIncomingMessage] = useState(false);
  const chatTexts = [
    t.chatWithMenuru,
    t.chatWithMenuru,
    t.chatWithMenuru,
    t.chatWithMenuru
  ];
  let chatTextIndex = 0;

  // Update Data
  const updates: UpdateItem[] = [
    {
      id: "1",
      title: language === 'id' ? "Fitur Chat Real-time" : "Real-time Chat Feature",
      description: language === 'id' ? "Menambahkan fitur chat real-time dengan Firebase. Pengguna dapat mengirim dan menerima pesan secara instan." : "Added real-time chat feature with Firebase. Users can send and receive messages instantly.",
      date: "10 Juli 2026",
      status: "live",
      detail: language === 'id' ? "Fitur chat real-time memungkinkan pengguna untuk berkomunikasi secara langsung tanpa perlu refresh halaman. Menggunakan Firebase Realtime Database untuk sinkronisasi pesan secara instan. Dilengkapi dengan indikator status online dan typing indicator." : "Real-time chat feature allows users to communicate directly without refreshing the page. Uses Firebase Realtime Database for instant message synchronization. Equipped with online status and typing indicators.",
      link: "https://menuru.com/update/chat-realtime",
      publishedBy: "Tim Menuru"
    },
    {
      id: "2",
      title: language === 'id' ? "Privacy Policy & Update System" : "Privacy Policy & Update System",
      description: language === 'id' ? "Menambahkan halaman Privacy Policy dan Update System untuk transparansi layanan." : "Added Privacy Policy and Update System pages for service transparency.",
      date: "9 Juli 2026",
      status: "live",
      detail: language === 'id' ? "Halaman Privacy Policy menjelaskan bagaimana data pengguna dikumpulkan dan digunakan. Update System menampilkan riwayat pembaruan fitur secara transparan kepada pengguna." : "Privacy Policy page explains how user data is collected and used. Update System displays feature update history transparently to users.",
      link: "https://menuru.com/update/privacy-policy",
      publishedBy: "Tim Menuru"
    },
    {
      id: "3",
      title: language === 'id' ? "Fitur Pin Message" : "Pin Message Feature",
      description: language === 'id' ? "Pengguna dapat menyematkan pesan penting di dalam chat. Pesan yang disematkan akan muncul di bagian atas." : "Users can pin important messages in chat. Pinned messages will appear at the top.",
      date: "8 Juli 2026",
      status: "coming",
      detail: language === 'id' ? "Fitur pin message memungkinkan pengguna untuk menyematkan pesan penting agar mudah diakses. Pesan yang dipin akan muncul di bagian atas chat dengan indikator khusus." : "Pin message feature allows users to pin important messages for easy access. Pinned messages will appear at the top of chat with a special indicator.",
      link: "https://menuru.com/update/pin-message",
      publishedBy: "Tim Menuru"
    },
    {
      id: "4",
      title: language === 'id' ? "Fitur Reply & Share Message" : "Reply & Share Message Feature",
      description: language === 'id' ? "Pengguna dapat membalas dan meneruskan pesan ke pengguna lain dengan mudah." : "Users can reply to and forward messages to other users easily.",
      date: "7 Juli 2026",
      status: "done",
      detail: language === 'id' ? "Fitur reply memungkinkan pengguna untuk membalas pesan tertentu dengan konteks yang jelas. Fitur share memungkinkan pengguna meneruskan pesan ke kontak lain dengan mudah." : "Reply feature allows users to reply to specific messages with clear context. Share feature allows users to forward messages to other contacts easily.",
      link: "https://menuru.com/update/reply-share",
      publishedBy: "Tim Menuru"
    },
    {
      id: "5",
      title: language === 'id' ? "Online Status & Typing Indicator" : "Online Status & Typing Indicator",
      description: language === 'id' ? "Menampilkan status online pengguna dan indikator ketika sedang mengetik." : "Shows user online status and typing indicator.",
      date: "6 Juli 2026",
      status: "done",
      detail: language === 'id' ? "Menampilkan status online pengguna secara real-time. Indikator typing muncul ketika pengguna sedang mengetik pesan, memberikan pengalaman chat yang lebih interaktif." : "Shows user online status in real-time. Typing indicator appears when user is typing a message, providing a more interactive chat experience.",
      link: "https://menuru.com/update/online-status",
      publishedBy: "Tim Menuru"
    }
  ];

  // Listen to popstate for browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const newLang = getInitialLanguage();
      setLanguage(newLang);
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update chatTexts when language changes
  useEffect(() => {
    setChatButtonText(t.chatWithMenuru);
    if (typeof window !== 'undefined') {
      const currentLang = getInitialLanguage();
      if (currentLang !== language) {
        changeLanguage(language);
      }
    }
  }, [language]);

  const MENURU_OFFICIAL: ChatUser = {
    id: "official_menuru",
    name: language === 'id' ? "Menuru Official" : "Menuru Official",
    email: "official@menuru.com",
    photoURL: "",
    isOfficial: true,
    isPinned: false,
    bio: language === 'id' ? "Akun resmi Menuru Chat. Dikelola oleh tim Menuru." : "Official Menuru Chat account. Managed by the Menuru team.",
    note: language === 'id' ? "Akun Resmi" : "Official Account"
  };

  const OFFICIAL_MESSAGES = [
    {
      text: language === 'id' ? "Halo! Selamat datang di Menuru Chat 👋" : "Hello! Welcome to Menuru Chat 👋",
      senderId: "official_menuru",
      senderName: "Menuru Official"
    },
    {
      text: language === 'id' ? "Kami sedang melakukan perbaikan fitur chat. Mohon bersabar ya! 🙏" : "We are currently improving the chat feature. Please be patient! 🙏",
      senderId: "official_menuru",
      senderName: "Menuru Official"
    },
    {
      text: language === 'id' ? "Fitur pin message dan riwayat chat akan segera ditingkatkan ✨" : "Pin message and chat history features will be improved soon ✨",
      senderId: "official_menuru",
      senderName: "Menuru Official"
    },
    {
      text: language === 'id' ? "Jangan lupa baca Privacy Policy dan Update kami 👇" : "Don't forget to read our Privacy Policy and Updates 👇",
      senderId: "official_menuru",
      senderName: "Menuru Official"
    },
    {
      text: language === 'id' ? "Terima kasih atas pengertiannya! 😊" : "Thank you for your understanding! 😊",
      senderId: "official_menuru",
      senderName: "Menuru Official"
    }
  ];

  // Broadcast messages to all users
  const broadcastMessages = async () => {
    if (!db) return;
    
    const broadcastRef = doc(db, "system", "broadcast");
    const broadcastSnap = await getDoc(broadcastRef);
    
    if (broadcastSnap.exists() && broadcastSnap.data().messagesSent) {
      console.log("Messages already broadcasted");
      return;
    }
    
    try {
      const usersRef = collection(db, "users");
      const usersSnap = await getDocs(usersRef);
      
      const broadcastMessage = {
        text: language === 'id' ? "Jangan lupa baca Privacy Policy dan Update kami 👇" : "Don't forget to read our Privacy Policy and Updates 👇",
        senderId: "official_menuru",
        senderName: "Menuru Official"
      };
      
      for (const docSnap of usersSnap.docs) {
        const userId = docSnap.id;
        
        const chatId = [userId, MENURU_OFFICIAL.id].sort().join("_");
        const chatRef = doc(db, "chats", chatId);
        const chatSnap = await getDoc(chatRef);
        
        if (!chatSnap.exists()) {
          await setDoc(chatRef, {
            participants: [userId, MENURU_OFFICIAL.id],
            createdAt: serverTimestamp(),
            isPinned: false
          });
        }
        
        const messagesRef = collection(db, "chats", chatId, "messages");
        await addDoc(messagesRef, {
          text: broadcastMessage.text,
          senderId: broadcastMessage.senderId,
          senderName: broadcastMessage.senderName,
          receiverId: userId,
          timestamp: serverTimestamp(),
          read: false,
          isPinned: false,
          pinnedAt: null,
          replyTo: null,
          replyToText: null,
          replyToSender: null,
          isShared: false
        });
      }
      
      await setDoc(broadcastRef, {
        messagesSent: true,
        sentAt: serverTimestamp()
      });
      
      console.log("Broadcast messages sent to all users");
    } catch (error) {
      console.error("Error broadcasting messages:", error);
    }
  };

  useEffect(() => {
    if (!db) return;
    broadcastMessages();
  }, [language]);

  // Auth Listener
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);
          
          const googlePhotoURL = currentUser.photoURL || "";
          const googleName = currentUser.displayName || currentUser.email || "";
          
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              id: currentUser.uid,
              name: googleName,
              email: currentUser.email || "",
              photoURL: googlePhotoURL,
              createdAt: serverTimestamp(),
              isPinned: false,
              isOfficial: false,
              online: true,
              lastSeen: serverTimestamp(),
              typing: false,
              bio: "",
              note: ""
            });
            
            if (googlePhotoURL && currentUser.photoURL !== googlePhotoURL) {
              await updateProfile(currentUser, {
                photoURL: googlePhotoURL,
                displayName: googleName
              });
            }
          } else {
            const userData = userSnap.data();
            const currentPhotoURL = userData?.photoURL || "";
            
            if (googlePhotoURL && currentPhotoURL !== googlePhotoURL) {
              await updateDoc(userRef, {
                photoURL: googlePhotoURL,
                name: googleName,
                lastSeen: serverTimestamp()
              });
            }
            
            await updateDoc(userRef, {
              online: true,
              lastSeen: serverTimestamp()
            });
            
            try {
              const disconnectRef = doc(db, "users", currentUser.uid);
              await onDisconnect(disconnectRef).update({
                online: false,
                lastSeen: serverTimestamp(),
                typing: false
              });
            } catch (err) {
              console.log("Disconnect handler not available, skipping");
            }
          }
          
          const updatedSnap = await getDoc(userRef);
          const updatedData = updatedSnap.data();
          if (updatedData) {
            setUser((prev: any) => ({
              ...prev,
              photoURL: updatedData.photoURL || prev.photoURL || "",
              displayName: updatedData.name || prev.displayName || prev.email,
              bio: updatedData.bio || "",
              note: updatedData.note || ""
            }));
          }
          
          await checkAndSendOfficialMessages(currentUser.uid);
          
        } catch (error) {
          console.error("Error saving user:", error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const checkAndSendOfficialMessages = async (userId: string) => {
    if (!db) return;
    
    try {
      const chatId = [userId, MENURU_OFFICIAL.id].sort().join("_");
      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);
      
      if (!chatSnap.exists()) {
        await setDoc(chatRef, {
          participants: [userId, MENURU_OFFICIAL.id],
          createdAt: serverTimestamp(),
          isPinned: false
        });
        
        const messagesRef = collection(db, "chats", chatId, "messages");
        for (const msg of OFFICIAL_MESSAGES) {
          await addDoc(messagesRef, {
            text: msg.text,
            senderId: msg.senderId,
            senderName: msg.senderName,
            receiverId: userId,
            timestamp: serverTimestamp(),
            read: false,
            isPinned: false,
            pinnedAt: null,
            replyTo: null,
            replyToText: null,
            replyToSender: null,
            isShared: false
          });
        }
      }
    } catch (error) {
      console.error("Error sending official messages:", error);
    }
  };

  // Load users
  useEffect(() => {
    if (!db || !user) return;
    const loadUsers = async () => {
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef);
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const userList: ChatUser[] = [];
          snapshot.forEach((doc) => {
            if (doc.id !== user.uid) {
              const data = doc.data();
              userList.push({ 
                id: doc.id, 
                ...data,
                online: data.online || false,
                lastSeen: data.lastSeen || null,
                typing: data.typing || false,
                bio: data.bio || "",
                note: data.note || "",
                photoURL: data.photoURL || ""
              } as ChatUser);
            }
          });
          
          const selfUser: ChatUser = {
            id: user.uid,
            name: user.displayName || user.email || "Saya",
            email: user.email || "",
            photoURL: user.photoURL || "",
            isPinned: false,
            isOfficial: false,
            online: true,
            lastSeen: null,
            typing: false,
            bio: user.bio || "",
            note: user.note || ""
          };
          
          const selfExists = userList.some(u => u.id === user.uid);
          if (!selfExists) {
            userList.push(selfUser);
          } else {
            const index = userList.findIndex(u => u.id === user.uid);
            if (index !== -1) {
              userList[index] = {
                ...userList[index],
                photoURL: user.photoURL || userList[index].photoURL || "",
                name: user.displayName || userList[index].name || "",
                bio: user.bio || userList[index].bio || "",
                note: user.note || userList[index].note || ""
              };
            }
          }
          
          const officialExists = userList.some(u => u.id === MENURU_OFFICIAL.id);
          if (!officialExists) {
            userList.push({ ...MENURU_OFFICIAL, online: true, typing: false });
          }
          
          userList.sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return 0;
          });
          setUsers(userList);
        });
        return () => unsubscribe();
      } catch (error) {
        console.error("Error loading users:", error);
      }
    };
    loadUsers();
  }, [user]);

  // Load chat rooms
  useEffect(() => {
    if (!user || !db) return;

    const chatsRef = collection(db, "chats");
    const q = query(chatsRef);
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const rooms: ChatRoom[] = [];
      let totalUnreadCount = 0;
      const newMessages: string[] = [];
      
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        if (data.participants && data.participants.includes(user.uid)) {
          const otherId = data.participants.find((id: string) => id !== user.uid);
          const otherUser = users.find(u => u.id === otherId);
          
          if (otherUser) {
            const messagesRef = collection(db, "chats", docSnap.id, "messages");
            const qMsg = query(messagesRef, orderBy("timestamp", "desc"));
            const msgSnap = await getDocs(qMsg);
            
            let lastMessage = "";
            let lastMessageTime = null;
            let lastMessageSenderId = "";
            let unreadCount = 0;
            
            if (!msgSnap.empty) {
              const lastMsg = msgSnap.docs[0].data() as Message;
              lastMessage = lastMsg.text;
              lastMessageTime = lastMsg.timestamp;
              lastMessageSenderId = lastMsg.senderId;
            }
            
            const unreadQuery = query(
              messagesRef, 
              where("read", "==", false),
              where("senderId", "!=", user.uid)
            );
            const unreadSnap = await getDocs(unreadQuery);
            unreadCount = unreadSnap.size;
            totalUnreadCount += unreadCount;
            
            if (unreadCount > 0 && otherUser) {
              const unreadDocs = unreadSnap.docs;
              for (const doc of unreadDocs) {
                const msg = doc.data() as Message;
                newMessages.push(`${t.messages} dari ${otherUser.name}: ${msg.text.substring(0, 25)}${msg.text.length > 25 ? '...' : ''}`);
              }
            }
            
            rooms.push({
              id: docSnap.id,
              participants: data.participants,
              lastMessage,
              lastMessageTime,
              lastMessageSenderId,
              unreadCount,
              isPinned: data.isPinned || false
            });
          }
        }
      }
      
      rooms.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        if (a.lastMessageTime && b.lastMessageTime) {
          return b.lastMessageTime.seconds - a.lastMessageTime.seconds;
        }
        return 0;
      });
      
      setChatRooms(rooms);
      setTotalUnread(totalUnreadCount);

      if (totalUnreadCount > 0 && newMessages.length > 0) {
        setIsIncomingMessage(true);
        setIncomingMessagesList(newMessages);
        setCurrentMessageIndex(0);
        setChatButtonText(newMessages[0]);
        
        if (rollingInterval.current) {
          clearInterval(rollingInterval.current);
          rollingInterval.current = null;
        }
        
        let index = 0;
        rollingInterval.current = setInterval(() => {
          index = (index + 1) % newMessages.length;
          setCurrentMessageIndex(index);
          setChatButtonText(newMessages[index]);
        }, 3000);
        
        setTimeout(() => {
          if (rollingInterval.current) {
            clearInterval(rollingInterval.current);
            rollingInterval.current = null;
          }
          setIsIncomingMessage(false);
          setChatButtonText(chatTexts[chatTextIndex % chatTexts.length]);
          chatTextIndex++;
        }, 12000);
      } else {
        if (!isIncomingMessage) {
          setChatButtonText(chatTexts[chatTextIndex % chatTexts.length]);
        }
      }
    });

    return () => {
      unsubscribe();
      if (rollingInterval.current) {
        clearInterval(rollingInterval.current);
        rollingInterval.current = null;
      }
    };
  }, [user, users, language]);

  // Load messages
  useEffect(() => {
    if (!selectedChat || !user || !db) return;

    const chatId = [user.uid, selectedChat.id].sort().join("_");
    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const messageList: Message[] = [];
      const pinnedList: Message[] = [];
      
      snapshot.forEach((doc) => {
        const msg = { id: doc.id, ...doc.data() } as Message;
        messageList.push(msg);
        if (msg.isPinned) {
          pinnedList.push(msg);
        }
      });
      
      setMessages(messageList);
      setPinnedMessages(pinnedList);
      
      const unreadMessages = messageList.filter(m => !m.read && m.senderId !== user.uid);
      for (const msg of unreadMessages) {
        const msgRef = doc(db, "chats", chatId, "messages", msg.id);
        await updateDoc(msgRef, {
          read: true,
          readAt: serverTimestamp()
        });
      }
      
      if (unreadMessages.length > 0) {
        setChatRooms(prev => prev.map(room => {
          if (room.id === chatId) {
            return { ...room, unreadCount: 0 };
          }
          return room;
        }));
        setTotalUnread(prev => Math.max(0, prev - unreadMessages.length));
      }
      
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    });

    return () => unsubscribe();
  }, [selectedChat, user]);

  // Handle login
  const handleLogin = async () => {
    if (!auth) return;
    try {
      await signInWithPopup(auth, googleProvider);
      setShowLogin(false);
      setLoginError("");
    } catch (error) {
      console.error("Login error:", error);
      setLoginError(t.loginFailed);
    }
  };

  const handleEmailLogin = async () => {
    if (!auth || !loginEmail || !loginPassword) return;
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      setShowLogin(false);
      setLoginEmail("");
      setLoginPassword("");
      setLoginError("");
    } catch (error) {
      console.error("Login error:", error);
      setLoginError(t.wrongCredentials);
    }
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
      setIsChatOpen(false);
      setSelectedChat(null);
      setChatRooms([]);
      setTotalUnread(0);
      setShowProfile(false);
      setProfileUser(null);
      setShowPrivacyPolicy(false);
      setShowUpdate(false);
      setSelectedUpdateId(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleChatToggle = () => {
    if (!user) {
      setShowLogin(true);
      return;
    }
    setIsChatOpen(!isChatOpen);
    if (!isChatOpen) {
      setSelectedChat(null);
      setShowAddUser(false);
      setReplyTo(null);
      setShowProfile(false);
      setProfileUser(null);
      setShowPrivacyPolicy(false);
      setShowUpdate(false);
      setSelectedUpdateId(null);
    }
  };

  // Handle typing
  const handleTyping = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);
    
    if (!selectedChat || !user || !db) return;
    
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      typing: value.length > 0
    });
    
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    const newTimeout = setTimeout(async () => {
      const userRef2 = doc(db, "users", user.uid);
      await updateDoc(userRef2, {
        typing: false
      });
    }, 2000);
    
    setTypingTimeout(newTimeout);
  };

  // Handle open profile
  const handleOpenProfile = (chatUser: ChatUser) => {
    setProfileUser(chatUser);
    setShowProfile(true);
    setBioInput(chatUser.bio || "");
    setNoteInput(chatUser.note || "");
    setEditBio(false);
    setEditNote(false);
  };

  const handleCloseProfile = () => {
    setShowProfile(false);
    setProfileUser(null);
    setEditBio(false);
    setEditNote(false);
  };

  // Handle save bio
  const handleSaveBio = async () => {
    if (!profileUser || !db) return;
    try {
      const userRef = doc(db, "users", profileUser.id);
      await updateDoc(userRef, {
        bio: bioInput
      });
      setProfileUser({ ...profileUser, bio: bioInput });
      setEditBio(false);
      
      setUsers(prev => prev.map(u => {
        if (u.id === profileUser.id) {
          return { ...u, bio: bioInput };
        }
        return u;
      }));
      
      if (profileUser.id === user.uid) {
        setUser((prev: any) => ({
          ...prev,
          bio: bioInput
        }));
      }
    } catch (error) {
      console.error("Error saving bio:", error);
    }
  };

  // Handle save note
  const handleSaveNote = async () => {
    if (!profileUser || !db) return;
    try {
      const userRef = doc(db, "users", profileUser.id);
      await updateDoc(userRef, {
        note: noteInput
      });
      setProfileUser({ ...profileUser, note: noteInput });
      setEditNote(false);
      
      setUsers(prev => prev.map(u => {
        if (u.id === profileUser.id) {
          return { ...u, note: noteInput };
        }
        return u;
      }));
      
      if (profileUser.id === user.uid) {
        setUser((prev: any) => ({
          ...prev,
          note: noteInput
        }));
      }
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  // Send message
  const handleSendMessage = async () => {
    if (!selectedChat || !user || !message.trim() || !db) return;

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { typing: false });
      
      const chatId = [user.uid, selectedChat.id].sort().join("_");
      
      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);
      if (!chatSnap.exists()) {
        await setDoc(chatRef, {
          participants: [user.uid, selectedChat.id],
          createdAt: serverTimestamp(),
          isPinned: false
        });
      }
      
      const messagesRef = collection(db, "chats", chatId, "messages");
      const msgData: any = {
        text: message.trim(),
        senderId: user.uid,
        senderName: user.displayName || user.email || "User",
        receiverId: selectedChat.id,
        timestamp: serverTimestamp(),
        read: false,
        isPinned: false,
        pinnedAt: null,
        isShared: false
      };
      
      if (replyTo) {
        msgData.replyTo = replyTo.id;
        msgData.replyToText = replyTo.text;
        msgData.replyToSender = replyTo.senderName;
      }
      
      await addDoc(messagesRef, msgData);

      setMessage("");
      setReplyTo(null);
      
      if (rollingInterval.current) {
        clearInterval(rollingInterval.current);
        rollingInterval.current = null;
      }
      setIsIncomingMessage(false);
      setChatButtonText(chatTexts[chatTextIndex % chatTexts.length]);
      chatTextIndex++;
      
      if (typingTimeout) {
        clearTimeout(typingTimeout);
        setTypingTimeout(null);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Share message
  const handleShareMessage = async () => {
    if (!shareMessage || !selectedShareUser || !user || !db) return;
    
    try {
      const targetUser = users.find(u => u.id === selectedShareUser);
      if (!targetUser) return;
      
      const chatId = [user.uid, targetUser.id].sort().join("_");
      
      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);
      if (!chatSnap.exists()) {
        await setDoc(chatRef, {
          participants: [user.uid, targetUser.id],
          createdAt: serverTimestamp(),
          isPinned: false
        });
      }
      
      const messagesRef = collection(db, "chats", chatId, "messages");
      await addDoc(messagesRef, {
        text: `${t.from} ${shareMessage.senderName}: ${shareMessage.text}`,
        senderId: user.uid,
        senderName: user.displayName || user.email || "User",
        receiverId: targetUser.id,
        timestamp: serverTimestamp(),
        read: false,
        isPinned: false,
        pinnedAt: null,
        isShared: true,
        sharedFrom: shareMessage.senderId,
        sharedFromName: shareMessage.senderName
      });
      
      setShowShareModal(false);
      setShareMessage(null);
      setSelectedShareUser("");
    } catch (error) {
      console.error("Error sharing message:", error);
    }
  };

  // Pin/Unpin message
  const handlePinMessage = async (chatId: string, messageId: string, currentPinned: boolean) => {
    if (!db) return;
    try {
      const msgRef = doc(db, "chats", chatId, "messages", messageId);
      await updateDoc(msgRef, {
        isPinned: !currentPinned,
        pinnedAt: !currentPinned ? serverTimestamp() : null
      });
      setShowMessageMenu(null);
    } catch (error) {
      console.error("Error pinning message:", error);
    }
  };

  // Resend message
  const handleResendMessage = async (msg: Message) => {
    if (!selectedChat || !user || !db) return;
    
    try {
      const chatId = [user.uid, selectedChat.id].sort().join("_");
      const messagesRef = collection(db, "chats", chatId, "messages");
      
      await addDoc(messagesRef, {
        text: msg.text,
        senderId: user.uid,
        senderName: user.displayName || user.email || "User",
        receiverId: selectedChat.id,
        timestamp: serverTimestamp(),
        read: false,
        isPinned: false,
        pinnedAt: null,
        isShared: false,
        replyTo: null,
        replyToText: null,
        replyToSender: null
      });
      
      setShowMessageMenu(null);
    } catch (error) {
      console.error("Error resending message:", error);
    }
  };

  // Pin/Unpin chat room
  const handlePinChat = async (chatId: string, currentPinned: boolean) => {
    if (!db) return;
    try {
      const chatRef = doc(db, "chats", chatId);
      await updateDoc(chatRef, {
        isPinned: !currentPinned
      });
      
      setChatRooms(prev => prev.map(room => {
        if (room.id === chatId) {
          return { ...room, isPinned: !currentPinned };
        }
        return room;
      }));
    } catch (error) {
      console.error("Error pinning chat:", error);
    }
  };

  // Pin/Unpin user
  const handlePinUser = async (userId: string, currentPinned: boolean) => {
    if (!db) return;
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        isPinned: !currentPinned
      });
      
      setUsers(prev => prev.map(u => {
        if (u.id === userId) {
          return { ...u, isPinned: !currentPinned };
        }
        return u;
      }));
    } catch (error) {
      console.error("Error pinning user:", error);
    }
  };

  // Add existing user to chat
  const handleAddExistingUser = async () => {
    if (!selectedNewUser || !user || !db) return;
    
    try {
      const targetUser = users.find(u => u.id === selectedNewUser);
      if (!targetUser) {
        setAddUserStatus("User tidak ditemukan");
        return;
      }
      
      const chatId = [user.uid, targetUser.id].sort().join("_");
      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);
      
      if (!chatSnap.exists()) {
        await setDoc(chatRef, {
          participants: [user.uid, targetUser.id],
          createdAt: serverTimestamp(),
          isPinned: false
        });
        setAddUserStatus(`✅ Chat dengan ${targetUser.name} berhasil dibuat!`);
      } else {
        setAddUserStatus(`ℹ️ Chat dengan ${targetUser.name} sudah ada.`);
      }
      
      setSelectedNewUser("");
      setShowAddUser(false);
      
    } catch (error) {
      console.error("Error adding user:", error);
      setAddUserStatus("❌ Gagal menambahkan user.");
    }
  };

  // Format time
  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString(language === 'id' ? 'id-ID' : 'en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return language === 'id' ? "Hari ini" : "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return language === 'id' ? "Kemarin" : "Yesterday";
    } else {
      return date.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    }
  };

  const getOnlineStatus = (userId: string) => {
    const chatUser = users.find(u => u.id === userId);
    if (!chatUser) return false;
    if (chatUser.id === user?.uid) return true;
    return chatUser.online || false;
  };

  const getLastSeen = (userId: string) => {
    const chatUser = users.find(u => u.id === userId);
    if (!chatUser || !chatUser.lastSeen) return "";
    if (chatUser.id === user?.uid) return t.online;
    const date = chatUser.lastSeen.toDate ? chatUser.lastSeen.toDate() : new Date(chatUser.lastSeen);
    return `${t.lastSeen} ${date.toLocaleTimeString(language === 'id' ? 'id-ID' : 'en-US', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const getTypingStatus = (userId: string) => {
    const chatUser = users.find(u => u.id === userId);
    if (!chatUser) return false;
    if (chatUser.id === user?.uid) return false;
    return chatUser.typing || false;
  };

  const pinnedUsers = users.filter(u => u.isPinned);
  const pinnedChats = chatRooms.filter(r => r.isPinned);
  const unpinnedChats = chatRooms.filter(r => !r.isPinned);
  const availableUsers = users.filter(u => 
    u.id !== user?.uid && !chatRooms.some(room => room.participants.includes(u.id))
  );

  // Close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMessageMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Animate chat button text
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isChatOpen && user && !isIncomingMessage) {
        setChatButtonText(chatTexts[chatTextIndex % chatTexts.length]);
        chatTextIndex++;
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [isChatOpen, user, isIncomingMessage, language]);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffffff",
        fontFamily: FONT_FAMILY,
      }}>
        <div style={{ fontSize: "18px", color: "#000", fontFamily: FONT_FAMILY }}>Loading...</div>
      </div>
    );
  }

  const selectedUpdate = updates.find(item => item.id === selectedUpdateId);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        margin: 0,
        padding: 0,
        position: "relative",
        fontFamily: FONT_FAMILY,
        overflow: "hidden",
      }}
    >
      {/* BANNER DEVELOPMENT */}
<motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: 0.1 }}
  style={{
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    width: "100%",
    backgroundColor: "#0D3CFC",
    padding: "14px 20px",
    zIndex: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderBottom: "none",
  }}
>
  <span
    style={{
      fontSize: "18px",
      fontWeight: 700,
      color: "#ffffff",
      fontFamily: FONT_FAMILY,
      letterSpacing: "-0.01em",
      textAlign: "center",
    }}
  >
    {language === 'id' ? "Website sedang dalam pengembangan, Terima kasih" : "Website is under development, Thank you"}
  </span>
</motion.div>

{/* Menuru - Sisi Kiri Bawah Banner */}
<motion.div
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.5, delay: 0.3 }}
  style={{
    position: "absolute",
    top: "70px",
    left: "40px",
    zIndex: 15,
    display: "flex",
    alignItems: "center",
  }}
>
  <span
    style={{
      fontSize: "28px",
      fontWeight: 800,
      color: "#000000",
      fontFamily: FONT_FAMILY,
      letterSpacing: "-0.03em",
      background: "transparent",
    }}
  >
    Menuru
  </span>
</motion.div>


         
      {/* User Status */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{
          position: "absolute",
          top: "70px",
          right: "40px",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <LanguageSelector language={language} setLanguage={setLanguage} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            padding: "8px 20px",
            backgroundColor: "#f5f5f5",
            borderRadius: "12px",
            fontSize: "20px",
            color: "#000",
            border: "1px solid #e0e0e0",
            fontFamily: FONT_FAMILY,
          }}
        >
          {user ? (
            <>
              {user.photoURL && (
                <motion.img 
                  src={user.photoURL} 
                  alt="avatar" 
                  whileHover={{ scale: 1.05 }}
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "6px",
                    objectFit: "cover",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    const selfUser = users.find(u => u.id === user.uid);
                    if (selfUser) handleOpenProfile(selfUser);
                  }}
                />
              )}
              <span 
                style={{ 
                  fontWeight: 500, 
                  color: "#000",
                  cursor: "pointer",
                  fontFamily: FONT_FAMILY,
                }}
                onClick={() => {
                  const selfUser = users.find(u => u.id === user.uid);
                  if (selfUser) handleOpenProfile(selfUser);
                }}
              >
                {user.displayName || user.email}
              </span>
              <OnlineIndicator online={true} language={language} />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                style={{
                  background: "none",
                  border: "none",
                  color: "#000",
                  cursor: "pointer",
                  fontSize: "14px",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  transition: "all .2s ease",
                  fontFamily: FONT_FAMILY,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#e0e0e0";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                {t.logout}
              </motion.button>
            </>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowLogin(true)}
              style={{
                background: "none",
                border: "none",
                color: "#000",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 500,
                padding: "4px 12px",
                borderRadius: "20px",
                transition: "all .2s ease",
                fontFamily: FONT_FAMILY,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f0f0f0";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              {t.login}
            </motion.button>
          )}
        </motion.div>
      </motion.div>

      {/* Login Modal */}
      <AnimatePresence>
        {showLogin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0,0,0,0.5)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={() => setShowLogin(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              style={{
                backgroundColor: "#fff",
                borderRadius: "12px",
                padding: "32px 36px",
                maxWidth: "400px",
                width: "90%",
                border: "1px solid #e0e0e0",
                boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
                fontFamily: FONT_FAMILY,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ fontSize: "24px", fontWeight: 600, color: "#000", marginBottom: "20px", fontFamily: FONT_FAMILY }}>
                {t.loginTitle}
              </h2>
              <input
                type="email"
                placeholder={t.email}
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  marginBottom: "12px",
                  fontSize: "14px",
                  outline: "none",
                  fontFamily: FONT_FAMILY,
                  color: "#000",
                }}
              />
              <input
                type="password"
                placeholder={t.password}
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  marginBottom: "16px",
                  fontSize: "14px",
                  outline: "none",
                  fontFamily: FONT_FAMILY,
                  color: "#000",
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleEmailLogin()}
              />
              {loginError && (
                <div style={{ color: "#ef4444", fontSize: "12px", marginBottom: "12px", fontFamily: FONT_FAMILY }}>
                  {loginError}
                </div>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleEmailLogin}
                style={{
                  width: "100%",
                  backgroundColor: "#000",
                  color: "#fff",
                  border: "none",
                  padding: "12px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all .2s ease",
                  fontFamily: FONT_FAMILY,
                }}
              >
                {t.loginWithEmail}
              </motion.button>
              <div style={{ marginTop: "12px", textAlign: "center", fontSize: "14px", color: "#666", fontFamily: FONT_FAMILY }}>
                {t.or}
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogin}
                style={{
                  width: "100%",
                  backgroundColor: "#4285f4",
                  color: "#fff",
                  border: "none",
                  padding: "12px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                  marginTop: "8px",
                  transition: "all .2s ease",
                  fontFamily: FONT_FAMILY,
                }}
              >
                {t.loginWithGoogle}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && shareMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0,0,0,0.5)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              style={{
                backgroundColor: "#fff",
                borderRadius: "12px",
                padding: "30px",
                maxWidth: "400px",
                width: "90%",
                border: "1px solid #e0e0e0",
                fontFamily: FONT_FAMILY,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#000", marginBottom: "12px", fontFamily: FONT_FAMILY }}>
                {t.forwardMessage}
              </h3>
              <div style={{ 
                fontSize: "13px", 
                color: "#666", 
                marginBottom: "16px",
                padding: "10px",
                backgroundColor: "#f5f5f5",
                borderRadius: "8px",
                fontFamily: FONT_FAMILY,
              }}>
                <div style={{ fontWeight: 500, color: "#000", fontFamily: FONT_FAMILY }}>{t.from}: {shareMessage.senderName}</div>
                <div style={{ fontFamily: FONT_FAMILY }}>{shareMessage.text}</div>
              </div>
              <select
                value={selectedShareUser}
                onChange={(e) => setSelectedShareUser(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  fontSize: "13px",
                  outline: "none",
                  fontFamily: FONT_FAMILY,
                  marginBottom: "12px",
                  backgroundColor: "#fff",
                  color: "#000",
                }}
              >
                <option value="">{t.selectUserToShare}</option>
                {users.filter(u => u.id !== user.uid && u.id !== shareMessage.senderId).map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} {u.isOfficial && <InstagramVerifiedBadge size={14} language={language} />}
                  </option>
                ))}
              </select>
              <div style={{ display: "flex", gap: "8px" }}>
                <motion.button
                  whileHover={selectedShareUser ? { scale: 1.02 } : {}}
                  whileTap={selectedShareUser ? { scale: 0.98 } : {}}
                  onClick={handleShareMessage}
                  disabled={!selectedShareUser}
                  style={{
                    backgroundColor: selectedShareUser ? "#000" : "#ccc",
                    color: "#fff",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    cursor: selectedShareUser ? "pointer" : "not-allowed",
                    fontWeight: 500,
                    flex: 1,
                    transition: "all .2s ease",
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  {t.forwardButton}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowShareModal(false);
                    setShareMessage(null);
                    setSelectedShareUser("");
                  }}
                  style={{
                    background: "none",
                    border: "1px solid #ddd",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    color: "#666",
                    cursor: "pointer",
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  {t.cancel}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Box */}
      <div
        style={{
          position: "fixed",
          bottom: "40px",
          right: "40px",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "16px",
        }}
      >
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", damping: 25 }}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "16px",
                width: "620px",
                maxHeight: "760px",
                boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
                border: "1px solid rgba(0,0,0,0.04)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                fontFamily: FONT_FAMILY,
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: "none",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: "#000000",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span
                    style={{
                      fontSize: "15px",
                      fontWeight: 500,
                      color: "#ffffff",
                      letterSpacing: "-0.01em",
                      fontFamily: FONT_FAMILY,
                    }}
                  >
                    {selectedUpdateId && selectedUpdate ? t.updateDetail : (showUpdate ? t.updateSystem : (showPrivacyPolicy ? t.privacyPolicy : (showProfile ? t.profile : (selectedChat ? selectedChat.name : t.messages))))}
                  </span>
                  {!showProfile && !showPrivacyPolicy && !showUpdate && !selectedUpdateId && selectedChat && (
                    <>
                      <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", fontFamily: FONT_FAMILY }}>
                        {selectedChat.email}
                      </span>
                      <OnlineIndicator 
                        online={getOnlineStatus(selectedChat.id)} 
                        lastSeen={getLastSeen(selectedChat.id)}
                        language={language}
                      />
                    </>
                  )}
                  {!showProfile && !showPrivacyPolicy && !showUpdate && !selectedUpdateId && !selectedChat && totalUnread > 0 && (
                    <span
                      style={{
                        backgroundColor: "#c5e800",
                        color: "#000000",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontSize: "10px",
                        fontWeight: 600,
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      {totalUnread}
                    </span>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    if (selectedUpdateId) {
                      setSelectedUpdateId(null);
                    } else if (showUpdate) {
                      setShowUpdate(false);
                    } else if (showPrivacyPolicy) {
                      setShowPrivacyPolicy(false);
                    } else if (showProfile) {
                      handleCloseProfile();
                    } else {
                      setIsChatOpen(false);
                    }
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "rgba(255,255,255,0.5)",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    transition: "all .2s ease",
                    display: "flex",
                    alignItems: "center",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
                    e.currentTarget.style.color = "#ffffff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                  }}
                >
                  <CloseIcon />
                </motion.button>
              </div>

              {/* Content - Update Detail Page */}
              {selectedUpdateId && selectedUpdate ? (
                <div
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "28px 32px",
                    backgroundColor: "#ffffff",
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", width: "100%" }}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedUpdateId(null)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#666",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "13px",
                        fontFamily: FONT_FAMILY,
                        marginBottom: "16px",
                        padding: "4px 0",
                        transition: "color 0.2s ease",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = "#000"}
                      onMouseLeave={(e) => e.currentTarget.style.color = "#666"}
                    >
                      <BackIcon />
                      <span>{t.back}</span>
                    </motion.button>

                    <div
                      style={{
                        display: "inline-block",
                        padding: "4px 14px",
                        backgroundColor: selectedUpdate.status === "live" ? "#3b82f6" : (selectedUpdate.status === "coming" ? "#ef4444" : "#000000"),
                        borderRadius: "20px",
                        marginBottom: "12px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 600,
                          color: "#ffffff",
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                          fontFamily: FONT_FAMILY,
                        }}
                      >
                        {selectedUpdate.status === "live" ? t.statusLive : (selectedUpdate.status === "coming" ? t.statusComing : t.statusDone)}
                      </span>
                    </div>

                    <h2
                      style={{
                        fontSize: "22px",
                        fontWeight: 600,
                        color: "#000000",
                        margin: "0 0 8px 0",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      {selectedUpdate.title}
                    </h2>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        marginBottom: "16px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "13px",
                          color: "#999",
                          fontFamily: FONT_FAMILY,
                        }}
                      >
                        {selectedUpdate.date}
                      </span>
                      <span
                        style={{
                          fontSize: "13px",
                          color: "#999",
                          fontFamily: FONT_FAMILY,
                        }}
                      >
                        • {selectedUpdate.publishedBy}
                      </span>
                    </div>

                    <p
                      style={{
                        fontSize: "15px",
                        color: "#000000",
                        lineHeight: 1.8,
                        margin: "0 0 16px 0",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      {selectedUpdate.description}
                    </p>

                    <div
                      style={{
                        width: "100%",
                        marginBottom: "16px",
                        padding: "16px 20px",
                        backgroundColor: "#f8f8f8",
                        borderRadius: "10px",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      <h3
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#000000",
                          marginBottom: "8px",
                          fontFamily: FONT_FAMILY,
                        }}
                      >
                        {t.updateDetail}
                      </h3>
                      <p
                        style={{
                          fontSize: "14px",
                          color: "#333",
                          lineHeight: 1.8,
                          margin: 0,
                          fontFamily: FONT_FAMILY,
                        }}
                      >
                        {selectedUpdate.detail}
                      </p>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "20px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "14px",
                          color: "#666",
                          fontFamily: FONT_FAMILY,
                        }}
                      >
                        {t.link}:
                      </span>
                      <a
                        href={selectedUpdate.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: "14px",
                          color: "#3b82f6",
                          textDecoration: "underline",
                          fontFamily: FONT_FAMILY,
                          fontWeight: 500,
                        }}
                      >
                        {selectedUpdate.link}
                      </a>
                    </div>

                    <div
                      style={{
                        width: "100%",
                        paddingTop: "14px",
                        borderTop: "1px solid #f0f0f0",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "11px",
                          color: "#999",
                          fontFamily: FONT_FAMILY,
                        }}
                      >
                        Chat with Menuru v1.0
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          color: "#999",
                          fontFamily: FONT_FAMILY,
                        }}
                      >
                        © 2026 Menuru
                      </span>
                    </div>
                  </div>
                </div>
              ) : showUpdate ? (
                // Update List Page
                <div
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "28px 32px",
                    backgroundColor: "#ffffff",
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  <div style={{ marginBottom: "28px" }}>
                    <div
                      style={{
                        display: "inline-block",
                        padding: "4px 14px",
                        backgroundColor: "#000000",
                        borderRadius: "20px",
                        marginBottom: "12px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 600,
                          color: "#ffffff",
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                          fontFamily: FONT_FAMILY,
                        }}
                      >
                        {t.updateSystem}
                      </span>
                    </div>
                    <h2
                      style={{
                        fontSize: "22px",
                        fontWeight: 600,
                        color: "#000000",
                        margin: "0 0 4px 0",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      Chat with Menuru
                    </h2>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#999",
                        margin: "0",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      {t.updateHistory}
                    </p>
                  </div>

                  <div style={{ position: "relative", paddingLeft: "28px" }}>
                    <div
                      style={{
                        position: "absolute",
                        left: "6px",
                        top: "6px",
                        bottom: "6px",
                        width: "2px",
                        borderLeft: "2px dotted #d0d0d0",
                        zIndex: 0,
                      }}
                    />

                    {updates.map((item, index) => {
                      const isLive = item.status === "live";
                      const isComing = item.status === "coming";
                      const isDone = item.status === "done";
                      
                      const dotColor = isLive ? "#3b82f6" : (isComing ? "#ef4444" : "#000000");
                      const isActive = isLive || isComing;
                      
                      return (
                        <motion.div
                          key={item.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          style={{
                            position: "relative",
                            paddingBottom: index === updates.length - 1 ? "0" : "28px",
                            paddingLeft: "24px",
                            cursor: "pointer",
                          }}
                          onClick={() => setSelectedUpdateId(item.id)}
                        >
                          <div
                            style={{
                              position: "absolute",
                              left: "-22px",
                              top: "4px",
                              width: "14px",
                              height: "14px",
                              zIndex: 2,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {isActive && (
                              <div
                                style={{
                                  position: "absolute",
                                  width: "35px",
                                  height: "35px",
                                  borderRadius: "50%",
                                  backgroundColor: dotColor,
                                  opacity: 0.20,
                                  animation: "awwwardsPulse 2s ease-in-out infinite",
                                  pointerEvents: "none",
                                }}
                              />
                            )}
                            
                            <div
                              style={{
                                width: "10px",
                                height: "10px",
                                borderRadius: "50%",
                                backgroundColor: dotColor,
                                position: "relative",
                                zIndex: 3,
                              }}
                            />
                          </div>
                          
                          <div
                            style={{
                              position: "absolute",
                              left: "-6px",
                              top: "18px",
                              width: "20px",
                              height: "1px",
                              borderTop: "2px dotted #d0d0d0",
                              zIndex: 0,
                            }}
                          />
                          
                          <div style={{ padding: "0" }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                gap: "12px",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: "18px",
                                  fontWeight: 700,
                                  color: "#000000",
                                  fontFamily: FONT_FAMILY,
                                  letterSpacing: "-0.01em",
                                }}
                              >
                                {item.title}
                              </div>
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                style={{
                                  flexShrink: 0,
                                  color: "#000000",
                                }}
                              >
                                <path
                                  d="M9 6L15 12L9 18"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  <div
                    style={{
                      marginTop: "20px",
                      paddingTop: "14px",
                      borderTop: "1px solid #f0f0f0",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#999",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      Chat with Menuru v1.0
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#999",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      © 2026 Menuru
                    </span>
                  </div>
                </div>
              ) : showPrivacyPolicy ? (
                // Privacy Policy Page
                <div
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "28px 32px",
                    backgroundColor: "#ffffff",
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  <div style={{ marginBottom: "24px" }}>
                    <div
                      style={{
                        display: "inline-block",
                        padding: "4px 14px",
                        backgroundColor: "#000000",
                        borderRadius: "20px",
                        marginBottom: "12px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 600,
                          color: "#ffffff",
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                          fontFamily: FONT_FAMILY,
                        }}
                      >
                        {t.privacyPolicy}
                      </span>
                    </div>
                    <h2
                      style={{
                        fontSize: "22px",
                        fontWeight: 600,
                        color: "#000000",
                        margin: "0 0 4px 0",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      Chat with Menuru
                    </h2>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#999",
                        margin: "0",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      {t.lastUpdated}: 9 Juli 2026
                    </p>
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <h3
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#000000",
                        marginBottom: "6px",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      {language === 'id' ? "1. Informasi yang Kami Kumpulkan" : "1. Information We Collect"}
                    </h3>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#666",
                        lineHeight: 1.7,
                        margin: "0 0 6px 0",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      {language === 'id' ? "Chat with Menuru mengumpulkan informasi berikut untuk memberikan layanan chat yang optimal:" : "Chat with Menuru collects the following information to provide optimal chat service:"}
                    </p>
                    <ul
                      style={{
                        fontSize: "13px",
                        color: "#666",
                        lineHeight: 1.9,
                        paddingLeft: "20px",
                        margin: "0",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      <li>{language === 'id' ? "Nama dan email dari akun Google Anda" : "Name and email from your Google account"}</li>
                      <li>{language === 'id' ? "Foto profil dari akun Google Anda" : "Profile photo from your Google account"}</li>
                      <li>{language === 'id' ? "Pesan dan riwayat chat yang Anda kirim" : "Messages and chat history you send"}</li>
                      <li>{language === 'id' ? "Status online dan aktivitas chat" : "Online status and chat activity"}</li>
                    </ul>
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <h3
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#000000",
                        marginBottom: "6px",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      {language === 'id' ? "2. Bagaimana Kami Menggunakan Informasi" : "2. How We Use Information"}
                    </h3>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#666",
                        lineHeight: 1.7,
                        margin: "0 0 6px 0",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      {language === 'id' ? "Informasi yang kami kumpulkan digunakan untuk:" : "The information we collect is used for:"}
                    </p>
                    <ul
                      style={{
                        fontSize: "13px",
                        color: "#666",
                        lineHeight: 1.9,
                        paddingLeft: "20px",
                        margin: "0",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      <li>{language === 'id' ? "Menyediakan dan memelihara layanan chat" : "Providing and maintaining chat service"}</li>
                      <li>{language === 'id' ? "Mengirimkan pesan antar pengguna" : "Sending messages between users"}</li>
                      <li>{language === 'id' ? "Menampilkan status online pengguna" : "Displaying user online status"}</li>
                      <li>{language === 'id' ? "Menyimpan riwayat chat untuk akses di masa depan" : "Storing chat history for future access"}</li>
                    </ul>
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <h3
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#000000",
                        marginBottom: "6px",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      {language === 'id' ? "3. Penyimpanan Data" : "3. Data Storage"}
                    </h3>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#666",
                        lineHeight: 1.7,
                        margin: 0,
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      {language === 'id' ? "Semua data chat disimpan di database Firebase Cloud Firestore. Data Anda aman dan hanya dapat diakses oleh Anda dan pengguna yang Anda ajak chat." : "All chat data is stored in Firebase Cloud Firestore database. Your data is secure and can only be accessed by you and the users you chat with."}
                    </p>
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <h3
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#000000",
                        marginBottom: "6px",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      {language === 'id' ? "4. Keamanan" : "4. Security"}
                    </h3>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#666",
                        lineHeight: 1.7,
                        margin: 0,
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      {language === 'id' ? "Kami menggunakan Firebase Authentication untuk keamanan akun dan Firestore Security Rules untuk melindungi data chat Anda. Semua komunikasi dienkripsi melalui HTTPS." : "We use Firebase Authentication for account security and Firestore Security Rules to protect your chat data. All communication is encrypted via HTTPS."}
                    </p>
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <h3
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#000000",
                        marginBottom: "6px",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      {language === 'id' ? "5. Hak Anda" : "5. Your Rights"}
                    </h3>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#666",
                        lineHeight: 1.7,
                        margin: "0 0 6px 0",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      {language === 'id' ? "Anda memiliki hak untuk:" : "You have the right to:"}
                    </p>
                    <ul
                      style={{
                        fontSize: "13px",
                        color: "#666",
                        lineHeight: 1.9,
                        paddingLeft: "20px",
                        margin: "0",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      <li>{language === 'id' ? "Mengakses data pribadi Anda" : "Access your personal data"}</li>
                      <li>{language === 'id' ? "Menghapus akun dan data chat Anda" : "Delete your account and chat data"}</li>
                      <li>{language === 'id' ? "Menonaktifkan notifikasi" : "Disable notifications"}</li>
                    </ul>
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <h3
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#000000",
                        marginBottom: "6px",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      {language === 'id' ? "6. Perubahan Kebijakan" : "6. Policy Changes"}
                    </h3>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#666",
                        lineHeight: 1.7,
                        margin: 0,
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      {language === 'id' ? "Kami dapat memperbarui kebijakan privasi ini dari waktu ke waktu. Perubahan akan diinformasikan melalui aplikasi chat." : "We may update this privacy policy from time to time. Changes will be notified through the chat application."}
                    </p>
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <h3
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#000000",
                        marginBottom: "6px",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      {language === 'id' ? "7. Kontak" : "7. Contact"}
                    </h3>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#666",
                        lineHeight: 1.7,
                        margin: "0 0 4px 0",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      {language === 'id' ? "Jika Anda memiliki pertanyaan tentang kebijakan privasi ini, silakan hubungi kami melalui:" : "If you have questions about this privacy policy, please contact us at:"}
                    </p>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#000000",
                        marginTop: "4px",
                        fontWeight: 500,
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      support@menuru.com
                    </p>
                  </div>

                  <div
                    style={{
                      marginTop: "8px",
                      paddingTop: "14px",
                      borderTop: "1px solid #f0f0f0",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#999",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      Chat with Menuru v1.0
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#999",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      © 2026 Menuru
                    </span>
                  </div>
                </div>
              ) : showProfile && profileUser ? (
                // Profile View
                <div style={{ padding: "24px 28px", overflowY: "auto", flex: 1, maxHeight: "640px", fontFamily: FONT_FAMILY }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", width: "100%" }}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCloseProfile}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#666",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "13px",
                        fontFamily: FONT_FAMILY,
                        marginBottom: "16px",
                        padding: "4px 0",
                        transition: "color 0.2s ease",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = "#000"}
                      onMouseLeave={(e) => e.currentTarget.style.color = "#666"}
                    >
                      <BackIcon />
                      <span>{t.back}</span>
                    </motion.button>

                    <div style={{ width: "100%", marginBottom: "0px" }}>
                      <div style={{ 
                        backgroundColor: "#f5f5f5", 
                        borderRadius: "8px",
                        padding: "8px 14px",
                        position: "relative",
                        marginBottom: "8px",
                        maxWidth: "280px",
                        fontFamily: FONT_FAMILY,
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ 
                            fontSize: "10px", 
                            color: "#666", 
                            fontWeight: 500, 
                            letterSpacing: "0.05em", 
                            textTransform: "uppercase",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            fontFamily: FONT_FAMILY,
                          }}>
                            <span style={{ 
                              display: "inline-block",
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              backgroundColor: "#c5e800",
                              marginRight: "4px",
                            }} />
                            {t.note}
                          </span>
                          {profileUser.id === user?.uid && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setEditNote(!editNote)}
                              style={{
                                background: "none",
                                border: "none",
                                color: "#666",
                                fontSize: "10px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                fontFamily: FONT_FAMILY,
                              }}
                            >
                              <EditIcon />
                              {profileUser.note ? t.editNote : t.addNote}
                            </motion.button>
                          )}
                        </div>

                        {editNote && profileUser.id === user?.uid ? (
                          <div style={{ display: "flex", gap: "6px", alignItems: "center", marginTop: "4px" }}>
                            <input
                              type="text"
                              value={noteInput}
                              onChange={(e) => setNoteInput(e.target.value)}
                              placeholder={t.noNote}
                              style={{
                                flex: 1,
                                padding: "6px 10px",
                                backgroundColor: "#fff",
                                border: "1px solid #e0e0e0",
                                borderRadius: "4px",
                                color: "#000",
                                fontSize: "12px",
                                outline: "none",
                                fontFamily: FONT_FAMILY,
                              }}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleSaveNote();
                                }
                              }}
                            />
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={handleSaveNote}
                              style={{
                                padding: "4px 12px",
                                backgroundColor: "#c5e800",
                                border: "none",
                                borderRadius: "4px",
                                color: "#000",
                                fontSize: "11px",
                                fontWeight: 500,
                                cursor: "pointer",
                                fontFamily: FONT_FAMILY,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {t.save}
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setEditNote(false)}
                              style={{
                                padding: "4px 10px",
                                backgroundColor: "transparent",
                                border: "1px solid #e0e0e0",
                                borderRadius: "4px",
                                color: "#666",
                                fontSize: "11px",
                                cursor: "pointer",
                                fontFamily: FONT_FAMILY,
                              }}
                            >
                              {t.cancel}
                            </motion.button>
                          </div>
                        ) : (
                          <div style={{ 
                            padding: "4px 0",
                            color: profileUser.note ? "#000" : "#999",
                            fontSize: "13px",
                            lineHeight: 1.4,
                            minHeight: "24px",
                            fontFamily: FONT_FAMILY,
                          }}>
                            {profileUser.note || t.noNote}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px", width: "100%" }}>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        style={{
                          width: "64px",
                          height: "64px",
                          borderRadius: "8px",
                          backgroundColor: "#f0f0f0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "28px",
                          overflow: "hidden",
                          border: "1px solid #e8e8e8",
                          flexShrink: 0,
                          position: "relative",
                        }}
                      >
                        {profileUser.photoURL ? (
                          <img src={profileUser.photoURL} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <span style={{ color: "#000", fontFamily: FONT_FAMILY }}>{profileUser.name?.charAt(0)?.toUpperCase() || "👤"}</span>
                        )}
                        {profileUser.isOfficial && (
                          <div style={{ position: "absolute", bottom: -2, right: -2 }}>
                            <InstagramVerifiedBadge size={16} language={language} />
                          </div>
                        )}
                      </motion.div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <span style={{ fontSize: "18px", fontWeight: 500, color: "#000", fontFamily: FONT_FAMILY }}>
                            {profileUser.name}
                          </span>
                          {profileUser.isOfficial && <InstagramVerifiedBadge size={16} language={language} />}
                        </div>
                        <span style={{ fontSize: "13px", color: "#999", fontFamily: FONT_FAMILY }}>{profileUser.email}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                          <OnlineIndicator online={getOnlineStatus(profileUser.id)} language={language} />
                          <span style={{ fontSize: "12px", color: "#666", fontFamily: FONT_FAMILY }}>
                            {getOnlineStatus(profileUser.id) ? t.online : getLastSeen(profileUser.id)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ width: "100%", marginBottom: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                        <span style={{ fontSize: "10px", color: "#999", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", fontFamily: FONT_FAMILY }}>
                          {t.bio}
                        </span>
                        {profileUser.id === user?.uid && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setEditBio(!editBio)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#999",
                              fontSize: "10px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              fontFamily: FONT_FAMILY,
                            }}
                          >
                            <EditIcon />
                            {profileUser.bio ? t.editBio : t.addBio}
                          </motion.button>
                        )}
                      </div>
                      {editBio && profileUser.id === user?.uid ? (
                        <div>
                          <textarea
                            value={bioInput}
                            onChange={(e) => setBioInput(e.target.value)}
                            placeholder={t.noBio}
                            rows={2}
                            style={{
                              width: "100%",
                              padding: "8px 12px",
                              backgroundColor: "#f5f5f5",
                              border: "1px solid #e8e8e8",
                              borderRadius: "6px",
                              color: "#000",
                              fontSize: "13px",
                              outline: "none",
                              fontFamily: FONT_FAMILY,
                              resize: "vertical",
                            }}
                          />
                          <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={handleSaveBio}
                              style={{
                                padding: "4px 14px",
                                backgroundColor: "#000",
                                border: "none",
                                borderRadius: "4px",
                                color: "#fff",
                                fontSize: "12px",
                                cursor: "pointer",
                                fontFamily: FONT_FAMILY,
                              }}
                            >
                              {t.save}
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setEditBio(false)}
                              style={{
                                padding: "4px 14px",
                                backgroundColor: "transparent",
                                border: "1px solid #e0e0e0",
                                borderRadius: "4px",
                                color: "#999",
                                fontSize: "12px",
                                cursor: "pointer",
                                fontFamily: FONT_FAMILY,
                              }}
                            >
                              {t.cancel}
                            </motion.button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ 
                          padding: "8px 12px", 
                          backgroundColor: "#f8f8f8", 
                          borderRadius: "6px",
                          fontSize: "13px",
                          color: profileUser.bio ? "#000" : "#ccc",
                          lineHeight: 1.5,
                          fontFamily: FONT_FAMILY,
                        }}>
                          {profileUser.bio || t.noBio}
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: "8px", width: "100%" }}>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          handleCloseProfile();
                          setSelectedChat(profileUser);
                        }}
                        style={{
                          flex: 1,
                          padding: "10px",
                          backgroundColor: "#000",
                          border: "none",
                          borderRadius: "8px",
                          color: "#fff",
                          fontSize: "14px",
                          fontWeight: 500,
                          cursor: "pointer",
                          fontFamily: FONT_FAMILY,
                          transition: "opacity 0.2s ease",
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                      >
                        {t.sendMessage}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePinUser(profileUser.id, profileUser.isPinned || false)}
                        style={{
                          padding: "10px 16px",
                          backgroundColor: "transparent",
                          border: "1px solid #e0e0e0",
                          borderRadius: "8px",
                          color: profileUser.isPinned ? "#000" : "#999",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          fontFamily: FONT_FAMILY,
                          transition: "all 0.2s ease",
                        }}
                      >
                        <PinIcon filled={profileUser.isPinned || false} />
                      </motion.button>
                    </div>
                  </div>
                </div>
              ) : !selectedChat ? (
                // Chat List View
                <div style={{ padding: "8px 12px", overflowY: "auto", flex: 1, maxHeight: "640px", fontFamily: FONT_FAMILY }}>
                  {/* Announcement */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 14px",
                      backgroundColor: "#f8f8f8",
                      borderRadius: "8px",
                      marginBottom: "10px",
                      border: "none",
                      fontFamily: FONT_FAMILY,
                    }}
                  >
                    <div style={{ fontSize: "20px" }}>📢</div>
                    <div>
                      <div style={{ fontSize: "12px", fontWeight: 500, color: "#000", fontFamily: FONT_FAMILY }}>
                        {t.announcement}
                      </div>
                      <div style={{ fontSize: "11px", color: "#666", fontFamily: FONT_FAMILY }}>
                        {t.announcementText}
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAddUser(!showAddUser)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "8px 0",
                      backgroundColor: "transparent",
                      border: "none",
                      cursor: "pointer",
                      width: "100%",
                      marginBottom: "12px",
                      fontFamily: FONT_FAMILY,
                    }}
                  >
                    <span
                      style={{
                        fontSize: "32px",
                        fontWeight: 300,
                        display: "inline-block",
                        lineHeight: 1,
                        transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                        color: "#000000",
                        transform: showAddUser ? "rotate(45deg)" : "rotate(0deg)",
                      }}
                    >
                      +
                    </span>
                    <span
                      style={{
                        fontSize: "18px",
                        fontWeight: 500,
                        color: "#000000",
                        letterSpacing: "-0.01em",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      {t.newChat}
                    </span>
                  </motion.button>
                  
                  <AnimatePresence>
                    {showAddUser && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{
                          padding: "16px",
                          backgroundColor: "#f8f8f8",
                          borderRadius: "12px",
                          marginBottom: "12px",
                          overflow: "hidden",
                          fontFamily: FONT_FAMILY,
                        }}
                      >
                        <div style={{ fontSize: "13px", fontWeight: 500, color: "#000", marginBottom: "12px", fontFamily: FONT_FAMILY }}>
                          {t.selectUser}
                        </div>
                        <select
                          value={selectedNewUser}
                          onChange={(e) => setSelectedNewUser(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "10px 14px",
                            border: "1px solid #e0e0e0",
                            borderRadius: "8px",
                            fontSize: "13px",
                            outline: "none",
                            fontFamily: FONT_FAMILY,
                            marginBottom: "8px",
                            backgroundColor: "#fff",
                            color: "#000",
                          }}
                        >
                          <option value="">{t.selectUser}</option>
                          {availableUsers.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.name} {u.isOfficial && <InstagramVerifiedBadge size={12} language={language} />}
                            </option>
                          ))}
                        </select>
                        {availableUsers.length === 0 && (
                          <div style={{ fontSize: "11px", color: "#666", marginBottom: "8px", fontFamily: FONT_FAMILY }}>
                            {t.allUsersChatted}
                          </div>
                        )}
                        <div style={{ display: "flex", gap: "8px" }}>
                          <motion.button
                            whileHover={selectedNewUser ? { scale: 1.02 } : {}}
                            whileTap={selectedNewUser ? { scale: 0.98 } : {}}
                            onClick={handleAddExistingUser}
                            disabled={!selectedNewUser}
                            style={{
                              backgroundColor: selectedNewUser ? "#000" : "#ccc",
                              color: "#fff",
                              border: "none",
                              padding: "8px 16px",
                              borderRadius: "8px",
                              fontSize: "12px",
                              cursor: selectedNewUser ? "pointer" : "not-allowed",
                              fontWeight: 500,
                              transition: "all .2s ease",
                              fontFamily: FONT_FAMILY,
                            }}
                          >
                            {t.startChat}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowAddUser(false)}
                            style={{
                              background: "none",
                              border: "none",
                              fontSize: "12px",
                              color: "#666",
                              cursor: "pointer",
                              fontFamily: FONT_FAMILY,
                            }}
                          >
                            {t.cancel}
                          </motion.button>
                        </div>
                        {addUserStatus && (
                          <div style={{ fontSize: "11px", color: "#000", marginTop: "8px", fontFamily: FONT_FAMILY }}>
                            {addUserStatus}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Pinned Users */}
                  {pinnedUsers.length > 0 && (
                    <div style={{ marginBottom: "10px" }}>
                      <div
                        onClick={() => setShowPinnedUsers(!showPinnedUsers)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "6px 10px",
                          cursor: "pointer",
                          backgroundColor: "transparent",
                          borderRadius: "6px",
                          fontFamily: FONT_FAMILY,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <PinIcon filled={true} />
                          <span style={{ fontSize: "11px", fontWeight: 500, color: "#666", fontFamily: FONT_FAMILY }}>
                            {t.pinnedUsers} ({pinnedUsers.length})
                          </span>
                        </div>
                        <PinDropdownIcon isOpen={showPinnedUsers} />
                      </div>
                      <AnimatePresence>
                        {showPinnedUsers && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{ padding: "4px 0", marginTop: "2px", overflow: "hidden" }}
                          >
                            {pinnedUsers.map((u) => (
                              <div
                                key={u.id}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "10px",
                                  padding: "6px 10px",
                                  borderRadius: "6px",
                                  backgroundColor: "#fafafa",
                                  fontFamily: FONT_FAMILY,
                                }}
                              >
                                <div
                                  style={{
                                    width: "32px",
                                    height: "32px",
                                    borderRadius: "6px",
                                    backgroundColor: "#f0f0f0",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "14px",
                                    overflow: "hidden",
                                    flexShrink: 0,
                                  }}
                                >
                                  {u.photoURL ? (
                                    <img src={u.photoURL} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                  ) : (
                                    <span style={{ color: "#000", fontFamily: FONT_FAMILY }}>{u.name?.charAt(0)?.toUpperCase() || "👤"}</span>
                                  )}
                                </div>
                                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "6px" }}>
                                  <div>
                                    <div 
                                      style={{ fontSize: "12px", fontWeight: 500, color: "#000", cursor: "pointer", fontFamily: FONT_FAMILY }}
                                      onClick={() => handleOpenProfile(u)}
                                    >
                                      {u.name}
                                      {u.isOfficial && <InstagramVerifiedBadge size={12} language={language} />}
                                    </div>
                                    <div style={{ fontSize: "9px", color: "#999", fontFamily: FONT_FAMILY }}>
                                      {u.email}
                                    </div>
                                  </div>
                                  <OnlineIndicator online={u.online || false} lastSeen={getLastSeen(u.id)} language={language} />
                                </div>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handlePinUser(u.id, true)}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    color: "#c5e800",
                                    padding: "2px 4px",
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  <PinIcon filled={true} />
                                </motion.button>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Pinned Chats */}
                  {pinnedChats.length > 0 && (
                    <div style={{ marginBottom: "10px" }}>
                      <div
                        onClick={() => setShowPinnedChats(!showPinnedChats)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "6px 10px",
                          cursor: "pointer",
                          backgroundColor: "transparent",
                          borderRadius: "6px",
                          fontFamily: FONT_FAMILY,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <PinIcon filled={true} />
                          <span style={{ fontSize: "11px", fontWeight: 500, color: "#666", fontFamily: FONT_FAMILY }}>
                            {t.pinnedChats} ({pinnedChats.length})
                          </span>
                        </div>
                        <PinDropdownIcon isOpen={showPinnedChats} />
                      </div>
                      <AnimatePresence>
                        {showPinnedChats && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{ padding: "4px 0", marginTop: "2px", overflow: "hidden" }}
                          >
                            {pinnedChats.map((room) => {
                              const otherId = room.participants.find(id => id !== user.uid);
                              const otherUser = users.find(u => u.id === otherId);
                              if (!otherUser) return null;
                              return (
                                <motion.div
                                  key={room.id}
                                  whileHover={{ scale: 1.02 }}
                                  onClick={() => setSelectedChat(otherUser)}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    padding: "6px 10px",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    backgroundColor: "#fafafa",
                                    fontFamily: FONT_FAMILY,
                                  }}
                                >
                                  <div
                                    style={{
                                      width: "32px",
                                      height: "32px",
                                      borderRadius: "6px",
                                      backgroundColor: "#f0f0f0",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontSize: "14px",
                                      overflow: "hidden",
                                      flexShrink: 0,
                                    }}
                                  >
                                    {otherUser.photoURL ? (
                                      <img src={otherUser.photoURL} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    ) : (
                                      <span style={{ color: "#000", fontFamily: FONT_FAMILY }}>{otherUser.name?.charAt(0)?.toUpperCase() || "👤"}</span>
                                    )}
                                  </div>
                                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "6px" }}>
                                    <div>
                                      <div 
                                        style={{ fontSize: "12px", fontWeight: 500, color: "#000", cursor: "pointer", fontFamily: FONT_FAMILY }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleOpenProfile(otherUser);
                                        }}
                                      >
                                        {otherUser.name}
                                        {otherUser.isOfficial && <InstagramVerifiedBadge size={12} language={language} />}
                                      </div>
                                      <div style={{ fontSize: "9px", color: "#999", fontFamily: FONT_FAMILY }}>
                                        {room.lastMessage ? room.lastMessage.substring(0, 25) + (room.lastMessage.length > 25 ? "..." : "") : t.noMessages}
                                      </div>
                                    </div>
                                    <OnlineIndicator online={otherUser.online || false} lastSeen={getLastSeen(otherUser.id)} language={language} />
                                  </div>
                                  {room.unreadCount > 0 && (
                                    <div
                                      style={{
                                        backgroundColor: "#c5e800",
                                        color: "#000",
                                        padding: "0 6px",
                                        borderRadius: "4px",
                                        fontSize: "9px",
                                        fontWeight: 600,
                                        lineHeight: "18px",
                                        height: "18px",
                                        minWidth: "18px",
                                        textAlign: "center",
                                        fontFamily: FONT_FAMILY,
                                      }}
                                    >
                                      {room.unreadCount}
                                    </div>
                                  )}
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePinChat(room.id, true);
                                    }}
                                    style={{
                                      background: "none",
                                      border: "none",
                                      cursor: "pointer",
                                      color: "#c5e800",
                                      padding: "2px 4px",
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    <PinIcon filled={true} />
                                  </motion.button>
                                </motion.div>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  <div style={{ padding: "4px 0" }}>
                    {unpinnedChats.length === 0 && pinnedChats.length === 0 ? (
                      <div
                        style={{
                          textAlign: "center",
                          color: "#999",
                          fontSize: "13px",
                          padding: "40px 0",
                          fontFamily: FONT_FAMILY,
                        }}
                      >
                        <div style={{ fontSize: "28px", marginBottom: "6px" }}>💬</div>
                        <div>{t.noChatHistory}</div>
                      </div>
                    ) : (
                      unpinnedChats.map((room) => {
                        const otherId = room.participants.find(id => id !== user.uid);
                        const otherUser = users.find(u => u.id === otherId);
                        if (!otherUser) return null;
                        
                        const isLastMessageFromMe = room.lastMessageSenderId === user.uid;
                        
                        return (
                          <motion.div
                            key={room.id}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => setSelectedChat(otherUser)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                              padding: "10px 12px",
                              borderRadius: "8px",
                              cursor: "pointer",
                              transition: "all .2s ease",
                              marginBottom: "2px",
                              backgroundColor: room.unreadCount > 0 ? "rgba(197,232,0,0.06)" : "transparent",
                              fontFamily: FONT_FAMILY,
                            }}
                          >
                            <div
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "6px",
                                backgroundColor: "#f0f0f0",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "16px",
                                flexShrink: 0,
                                overflow: "hidden",
                                position: "relative",
                              }}
                            >
                              {otherUser.photoURL ? (
                                <img 
                                  src={otherUser.photoURL} 
                                  alt="avatar" 
                                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                              ) : (
                                <span style={{ color: "#000", fontFamily: FONT_FAMILY }}>{otherUser.name?.charAt(0)?.toUpperCase() || "👤"}</span>
                              )}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: "14px", fontWeight: 500, color: "#000", display: "flex", alignItems: "center", gap: "4px", fontFamily: FONT_FAMILY }}>
                                <span 
                                  style={{ cursor: "pointer" }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenProfile(otherUser);
                                  }}
                                >
                                  {otherUser.name}
                                </span>
                                {otherUser.isOfficial && <InstagramVerifiedBadge size={12} language={language} />}
                                <OnlineIndicator online={otherUser.online || false} lastSeen={getLastSeen(otherUser.id)} language={language} />
                              </div>
                              <div style={{ fontSize: "11px", color: "#999", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: FONT_FAMILY }}>
                                {room.lastMessage ? (
                                  <>
                                    {isLastMessageFromMe && `${t.messages}: `}
                                    {room.lastMessage}
                                  </>
                                ) : (
                                  t.noMessages
                                )}
                              </div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
                              {room.lastMessageTime && (
                                <span style={{ fontSize: "9px", color: "#bbb", fontFamily: FONT_FAMILY }}>
                                  {formatTime(room.lastMessageTime)}
                                </span>
                              )}
                              <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                                {room.unreadCount > 0 && (
                                  <div
                                    style={{
                                      backgroundColor: "#c5e800",
                                      color: "#000",
                                      padding: "0 6px",
                                      borderRadius: "4px",
                                      fontSize: "9px",
                                      fontWeight: 600,
                                      lineHeight: "18px",
                                      height: "18px",
                                      minWidth: "18px",
                                      textAlign: "center",
                                      fontFamily: FONT_FAMILY,
                                    }}
                                  >
                                    {room.unreadCount}
                                  </div>
                                )}
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePinChat(room.id, room.isPinned || false);
                                  }}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    color: room.isPinned ? "#c5e800" : "#ddd",
                                    padding: "2px 4px",
                                    display: "flex",
                                    alignItems: "center",
                                    transition: "all .2s ease",
                                  }}
                                >
                                  <PinIcon filled={room.isPinned || false} />
                                </motion.button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </div>
                </div>
              ) : (
                // Chat View
                <div style={{ display: "flex", flexDirection: "column", height: "580px", fontFamily: FONT_FAMILY }}>
                  {/* Chat Header */}
                  <div
                    style={{
                      padding: "10px 16px",
                      borderBottom: "none",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      backgroundColor: "#000000",
                    }}
                  >
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setSelectedChat(null);
                        setReplyTo(null);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "rgba(255,255,255,0.5)",
                        padding: "4px 6px",
                        borderRadius: "4px",
                        transition: "all .2s ease",
                        display: "flex",
                        alignItems: "center",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
                        e.currentTarget.style.color = "#ffffff";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                      }}
                    >
                      <BackIcon />
                    </motion.button>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "6px",
                        backgroundColor: "rgba(255,255,255,0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "14px",
                        overflow: "hidden",
                        color: "#fff",
                        position: "relative",
                        cursor: "pointer",
                      }}
                      onClick={() => handleOpenProfile(selectedChat)}
                    >
                      {selectedChat.photoURL ? (
                        <img 
                          src={selectedChat.photoURL} 
                          alt="avatar" 
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <span style={{ fontFamily: FONT_FAMILY }}>{selectedChat.name?.charAt(0)?.toUpperCase() || "👤"}</span>
                      )}
                    </motion.div>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1px" }}>
                      <div 
                        style={{ display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}
                        onClick={() => handleOpenProfile(selectedChat)}
                      >
                        <span style={{ fontSize: "14px", fontWeight: 500, color: "#ffffff", fontFamily: FONT_FAMILY }}>
                          {selectedChat.name}
                        </span>
                        {selectedChat.isOfficial && <InstagramVerifiedBadge size={12} language={language} />}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <OnlineIndicator 
                          online={getOnlineStatus(selectedChat.id)} 
                          lastSeen={getLastSeen(selectedChat.id)}
                          language={language}
                        />
                        {getOnlineStatus(selectedChat.id) ? (
                          <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.5)", fontFamily: FONT_FAMILY }}>
                            {getTypingStatus(selectedChat.id) ? t.typing : t.online}
                          </span>
                        ) : (
                          <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.5)", fontFamily: FONT_FAMILY }}>
                            {getLastSeen(selectedChat.id)}
                          </span>
                        )}
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handlePinUser(selectedChat.id, selectedChat.isPinned || false)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: selectedChat.isPinned ? "#c5e800" : "rgba(255,255,255,0.3)",
                        padding: "4px 6px",
                        borderRadius: "4px",
                        display: "flex",
                        alignItems: "center",
                        transition: "all .2s ease",
                      }}
                    >
                      <PinIcon filled={selectedChat.isPinned || false} />
                    </motion.button>
                  </div>

                  {/* Pinned Messages */}
                  {pinnedMessages.length > 0 && (
                    <div
                      style={{
                        padding: "6px 14px",
                        backgroundColor: "rgba(0,0,0,0.02)",
                        borderBottom: "1px solid rgba(0,0,0,0.04)",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      <div
                        onClick={() => setShowPinnedMessages(!showPinnedMessages)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          cursor: "pointer",
                          color: "#999",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <PinIcon filled={true} />
                          <span style={{ fontSize: "11px", fontWeight: 500, color: "#666", fontFamily: FONT_FAMILY }}>
                            {t.pinnedMessages} ({pinnedMessages.length})
                          </span>
                        </div>
                        <PinDropdownIcon isOpen={showPinnedMessages} />
                      </div>
                      <AnimatePresence>
                        {showPinnedMessages && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{ marginTop: "6px", maxHeight: "120px", overflowY: "auto" }}
                          >
                            {pinnedMessages.map((msg) => {
                              const isMine = msg.senderId === user?.uid;
                              return (
                                <div
                                  key={msg.id}
                                  style={{
                                    padding: "4px 8px",
                                    marginBottom: "2px",
                                    borderRadius: "4px",
                                    backgroundColor: isMine ? "rgba(197,232,0,0.08)" : "rgba(0,0,0,0.04)",
                                    fontSize: "11px",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    fontFamily: FONT_FAMILY,
                                  }}
                                >
                                  <div style={{ flex: 1 }}>
                                    <span style={{ color: "#999", fontSize: "9px", fontFamily: FONT_FAMILY }}>
                                      {isMine ? `${t.messages}: ` : `${msg.senderName}: `}
                                    </span>
                                    <span style={{ color: "#000", fontFamily: FONT_FAMILY }}>
                                      {msg.text.length > 40 ? msg.text.substring(0, 40) + "..." : msg.text}
                                    </span>
                                  </div>
                                  <span style={{ fontSize: "8px", color: "#bbb", marginLeft: "6px", fontFamily: FONT_FAMILY }}>
                                    {formatTime(msg.pinnedAt || msg.timestamp)}
                                  </span>
                                </div>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Reply Indicator */}
                  {replyTo && (
                    <div
                      style={{
                        padding: "4px 14px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <ReplyIcon />
                        <div>
                          <div style={{ fontSize: "10px", color: "#22c55e", fontWeight: 500, fontFamily: FONT_FAMILY }}>
                            {t.reply}: {replyTo.senderName === user?.displayName ? "Anda" : replyTo.senderName}
                          </div>
                          <div style={{ fontSize: "11px", color: "#666", fontFamily: FONT_FAMILY }}>
                            {replyTo.text.length > 30 ? replyTo.text.substring(0, 30) + "..." : replyTo.text}
                          </div>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setReplyTo(null)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#999",
                          cursor: "pointer",
                          fontSize: "14px",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          transition: "all 0.2s ease",
                          fontFamily: FONT_FAMILY,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.04)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        ✕
                      </motion.button>
                    </div>
                  )}

                  {/* Messages */}
                  <div
                    style={{
                      flex: 1,
                      padding: "16px 20px",
                      overflowY: "auto",
                      backgroundColor: "#ffffff",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                      fontFamily: FONT_FAMILY,
                    }}
                  >
                    {messages.length === 0 ? (
                      <div
                        style={{
                          textAlign: "center",
                          color: "#bbb",
                          fontSize: "13px",
                          marginTop: "60px",
                          fontFamily: FONT_FAMILY,
                        }}
                      >
                        <div style={{ fontSize: "28px", marginBottom: "6px" }}>💬</div>
                        <div>{t.noMessages}</div>
                      </div>
                    ) : (
                      messages.map((msg, idx) => {
                        const isMine = msg.senderId === user?.uid;
                        const chatId = [user.uid, selectedChat.id].sort().join("_");
                        const showDate = idx === 0 || !messages[idx-1]?.timestamp || 
                          formatDate(msg.timestamp) !== formatDate(messages[idx-1]?.timestamp);
                        
                        const replySenderName = msg.replyToSender === user?.displayName ? "Anda" : msg.replyToSender;
                        const isBroadcastMessage = msg.senderId === "official_menuru" && msg.text.includes("Privacy Policy");
                        
                        return (
                          <React.Fragment key={idx}>
                            {showDate && (
                              <div
                                style={{
                                  textAlign: "center",
                                  color: "#ccc",
                                  fontSize: "10px",
                                  padding: "6px 0 10px 0",
                                  fontWeight: 400,
                                  letterSpacing: "0.03em",
                                  fontFamily: FONT_FAMILY,
                                }}
                              >
                                {formatDate(msg.timestamp)}
                              </div>
                            )}
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              transition={{ duration: 0.2 }}
                              style={{
                                alignSelf: isMine ? "flex-end" : "flex-start",
                                maxWidth: "80%",
                                padding: "10px 14px",
                                borderRadius: "12px",
                                backgroundColor: isMine ? "#c5e800" : "#f0f0f0",
                                color: "#000000",
                                fontSize: "14px",
                                lineHeight: 1.5,
                                position: "relative",
                                border: msg.isPinned ? "1px solid #c5e800" : "none",
                                boxShadow: msg.isPinned ? "0 0 20px rgba(197,232,0,0.1)" : "none",
                                fontFamily: FONT_FAMILY,
                              }}
                            >
                              {msg.isShared && msg.sharedFromName && (
                                <div
                                  style={{
                                    fontSize: "10px",
                                    color: "rgba(0,0,0,0.4)",
                                    marginBottom: "4px",
                                    fontStyle: "italic",
                                    fontFamily: FONT_FAMILY,
                                  }}
                                >
                                  {t.from} {msg.sharedFromName}
                                </div>
                              )}
                              
                              {msg.replyTo && msg.replyToText && (
                                <div
                                  style={{
                                    fontSize: "11px",
                                    color: isMine ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.5)",
                                    padding: "4px 8px",
                                    borderLeft: `2px solid ${isMine ? "#000" : "#999"}`,
                                    marginBottom: "6px",
                                    backgroundColor: isMine ? "rgba(0,0,0,0.06)" : "rgba(0,0,0,0.04)",
                                    borderRadius: "4px",
                                    fontFamily: FONT_FAMILY,
                                  }}
                                >
                                  <span style={{ fontWeight: 500, color: "#22c55e", fontFamily: FONT_FAMILY }}>
                                    {isMine ? `${t.reply}: ${replySenderName}` : `${t.reply}: ${msg.replyToSender}`}
                                  </span>
                                  <span style={{ color: isMine ? "#000" : "#333", fontFamily: FONT_FAMILY }}> {msg.replyToText}</span>
                                </div>
                              )}
                              
                              {isBroadcastMessage ? (
                                <span style={{ fontFamily: FONT_FAMILY }}>
                                  {language === 'id' ? "Jangan lupa baca" : "Don't forget to read"}{' '}
                                  <span
                                    onClick={() => setShowPrivacyPolicy(true)}
                                    style={{
                                      color: "#0095f6",
                                      textDecoration: "underline",
                                      cursor: "pointer",
                                      fontWeight: 500,
                                      fontFamily: FONT_FAMILY,
                                    }}
                                  >
                                    {t.privacyPolicy}
                                  </span>
                                  {' '}{language === 'id' ? "dan" : "and"}{' '}
                                  <span
                                    onClick={() => setShowUpdate(true)}
                                    style={{
                                      color: "#0095f6",
                                      textDecoration: "underline",
                                      cursor: "pointer",
                                      fontWeight: 500,
                                      fontFamily: FONT_FAMILY,
                                    }}
                                  >
                                    {t.updateSystem}
                                  </span>
                                  {' '}{language === 'id' ? "kami 👇" : "👇"}
                                </span>
                              ) : (
                                <span style={{ fontFamily: FONT_FAMILY }}>{msg.text}</span>
                              )}
                              
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  marginTop: "6px",
                                  justifyContent: isMine ? "flex-end" : "flex-start",
                                  flexWrap: "wrap",
                                  fontFamily: FONT_FAMILY,
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: "9px",
                                    color: "rgba(0,0,0,0.4)",
                                    fontWeight: 400,
                                    fontFamily: FONT_FAMILY,
                                  }}
                                >
                                  {formatTime(msg.timestamp)}
                                </span>
                                <ReadStatus msg={msg} isMine={isMine} language={language} />
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => setShowMessageMenu(showMessageMenu === msg.id ? null : msg.id)}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    color: "rgba(0,0,0,0.3)",
                                    padding: "2px 4px",
                                    display: "flex",
                                    alignItems: "center",
                                    transition: "all .2s ease",
                                    borderRadius: "4px",
                                  }}
                                  title={t.more}
                                >
                                  <MoreIcon />
                                </motion.button>
                                
                                <AnimatePresence>
                                  {showMessageMenu === msg.id && (
                                    <motion.div
                                      ref={menuRef}
                                      initial={{ opacity: 0, scale: 0.9, y: 5 }}
                                      animate={{ opacity: 1, scale: 1, y: 0 }}
                                      exit={{ opacity: 0, scale: 0.9, y: 5 }}
                                      transition={{ duration: 0.15 }}
                                      style={{
                                        position: "absolute",
                                        bottom: "calc(100% + 6px)",
                                        right: isMine ? 0 : "auto",
                                        left: isMine ? "auto" : 0,
                                        backgroundColor: "#ffffff",
                                        borderRadius: "8px",
                                        padding: "4px",
                                        minWidth: "140px",
                                        boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
                                        zIndex: 50,
                                        border: "1px solid rgba(0,0,0,0.04)",
                                        fontFamily: FONT_FAMILY,
                                      }}
                                    >
                                      <motion.button
                                        whileHover={{ backgroundColor: "#f5f5f5" }}
                                        onClick={() => {
                                          setReplyTo(msg);
                                          setShowMessageMenu(null);
                                        }}
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: "8px",
                                          padding: "6px 12px",
                                          width: "100%",
                                          background: "none",
                                          border: "none",
                                          color: "#000",
                                          fontSize: "12px",
                                          cursor: "pointer",
                                          borderRadius: "6px",
                                          transition: "all .2s ease",
                                          fontFamily: FONT_FAMILY,
                                        }}
                                      >
                                        <ReplyIcon />
                                        <span>{t.reply}</span>
                                      </motion.button>
                                      <motion.button
                                        whileHover={{ backgroundColor: "#f5f5f5" }}
                                        onClick={() => {
                                          handleResendMessage(msg);
                                        }}
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: "8px",
                                          padding: "6px 12px",
                                          width: "100%",
                                          background: "none",
                                          border: "none",
                                          color: "#000",
                                          fontSize: "12px",
                                          cursor: "pointer",
                                          borderRadius: "6px",
                                          transition: "all .2s ease",
                                          fontFamily: FONT_FAMILY,
                                        }}
                                      >
                                        <SendIcon />
                                        <span>{t.resend}</span>
                                      </motion.button>
                                      <motion.button
                                        whileHover={{ backgroundColor: "#f5f5f5" }}
                                        onClick={() => {
                                          setShareMessage(msg);
                                          setShowShareModal(true);
                                          setShowMessageMenu(null);
                                        }}
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: "8px",
                                          padding: "6px 12px",
                                          width: "100%",
                                          background: "none",
                                          border: "none",
                                          color: "#000",
                                          fontSize: "12px",
                                          cursor: "pointer",
                                          borderRadius: "6px",
                                          transition: "all .2s ease",
                                          fontFamily: FONT_FAMILY,
                                        }}
                                      >
                                        <ShareIcon />
                                        <span>{t.forward}</span>
                                      </motion.button>
                                      <motion.button
                                        whileHover={{ backgroundColor: "#f5f5f5" }}
                                        onClick={() => handlePinMessage(chatId, msg.id, msg.isPinned || false)}
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: "8px",
                                          padding: "6px 12px",
                                          width: "100%",
                                          background: "none",
                                          border: "none",
                                          color: msg.isPinned ? "#c5e800" : "#000",
                                          fontSize: "12px",
                                          cursor: "pointer",
                                          borderRadius: "6px",
                                          transition: "all .2s ease",
                                          fontFamily: FONT_FAMILY,
                                        }}
                                      >
                                        <PinIcon filled={msg.isPinned || false} />
                                        <span>{msg.isPinned ? t.unpin : t.pin}</span>
                                      </motion.button>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </motion.div>
                            {msg.isPinned && (
                              <div
                                style={{
                                  alignSelf: isMine ? "flex-end" : "flex-start",
                                  fontSize: "9px",
                                  color: "#c5e800",
                                  marginTop: "-2px",
                                  marginBottom: "4px",
                                  padding: "0 4px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  fontWeight: 500,
                                  fontFamily: FONT_FAMILY,
                                }}
                              >
                                <PinIcon filled={true} />
                                <span>{t.pin} • {formatTime(msg.pinnedAt || msg.timestamp)}</span>
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div
                    style={{
                      padding: "10px 14px 14px",
                      borderTop: "1px solid rgba(0,0,0,0.04)",
                      display: "flex",
                      gap: "8px",
                      backgroundColor: "#ffffff",
                      fontFamily: FONT_FAMILY,
                    }}
                  >
                    <input
                      type="text"
                      placeholder={replyTo ? t.typeReply : t.typeMessage}
                      value={message}
                      onChange={handleTyping}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      style={{
                        flex: 1,
                        padding: "10px 16px",
                        border: "1px solid #e8e8e8",
                        borderRadius: "8px",
                        fontSize: "14px",
                        outline: "none",
                        fontFamily: FONT_FAMILY,
                        transition: "all .2s ease",
                        backgroundColor: "#f5f5f5",
                        color: "#000",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "#c5e800";
                        e.currentTarget.style.backgroundColor = "#ffffff";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "#e8e8e8";
                        e.currentTarget.style.backgroundColor = "#f5f5f5";
                      }}
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSendMessage}
                      style={{
                        backgroundColor: "#c5e800",
                        border: "none",
                        padding: "10px 20px",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#000",
                        cursor: "pointer",
                        transition: "all .2s ease",
                        whiteSpace: "nowrap",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontFamily: FONT_FAMILY,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#b0d000";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#c5e800";
                      }}
                    >
                      <span>{t.send}</span>
                      <SendIcon />
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Button */}
        <motion.button
          whileHover={!isChatOpen ? { scale: 1.03 } : {}}
          whileTap={!isChatOpen ? { scale: 0.97 } : {}}
          onClick={handleChatToggle}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: isChatOpen ? "transparent" : "#000000",
            padding: isChatOpen ? "0" : "12px 24px",
            borderRadius: "60px",
            border: "none",
            cursor: "pointer",
            transition: "all .4s cubic-bezier(0.34, 1.56, 0.64, 1)",
            boxShadow: isChatOpen ? "none" : "0 4px 20px rgba(0,0,0,0.08)",
            userSelect: "none",
            fontFamily: FONT_FAMILY,
            position: "relative",
            maxWidth: "360px",
            overflow: "hidden",
          }}
        >
          {!isChatOpen && (
            <>
              <motion.span
                initial={{ opacity: 1 }}
                animate={{ 
                  opacity: isIncomingMessage ? [1, 0.7, 1] : 1,
                }}
                transition={{ 
                  duration: 0.5,
                  repeat: isIncomingMessage ? Infinity : 0,
                }}
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#ffffff",
                  letterSpacing: "-0.01em",
                  lineHeight: 1,
                  whiteSpace: "nowrap",
                  transition: "all 0.5s ease",
                  fontFamily: FONT_FAMILY,
                }}
              >
                {user ? chatButtonText : t.loginToChat}
              </motion.span>
              {totalUnread > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 10 }}
                  style={{
                    backgroundColor: "#c5e800",
                    color: "#000000",
                    padding: "0 6px",
                    borderRadius: "4px",
                    fontSize: "10px",
                    fontWeight: 600,
                    lineHeight: "18px",
                    height: "18px",
                    minWidth: "18px",
                    textAlign: "center",
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  {totalUnread}
                </motion.span>
              )}
            </>
          )}
        </motion.button>
      </div>

      <style jsx>{`
        @keyframes awwwardsPulse {
          0% {
            transform: scale(0.7);
            opacity: 0.25;
          }
          50% {
            transform: scale(1.6);
            opacity: 0.05;
          }
          100% {
            transform: scale(0.7);
            opacity: 0.25;
          }
        }
      `}</style>
    </div>
  );
}
