'use client';

import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
import { getFirestore, collection, query, where, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, orderBy, getDoc, setDoc, getDocs } from "firebase/firestore";
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { motion, AnimatePresence } from 'framer-motion';

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
    <path d="M17 7L7 17M7 7H17M17 7V17" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
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

const EditIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 20H21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16.5 3.5L20.5 7.5L7 21L3 21L3 17L16.5 3.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SaveIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16L21 8V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 21V13H7V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 3V8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Footer links
const footerLinks = [
  { title: "Get in Touch", links: ["Contact Us", "Instagram", "Live Chat"] },
  { title: "Product", links: ["Shop", "Note", "Calendar", "Blog", "Donation", "Community", "Live Chat Agent"] },
  { title: "Attention", links: ["Kebijakan Privasi", "Ketentuan Kami", "Pusat Bantuan"] }
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

// ===== INSTAGRAM VERIFIED BADGE =====
const InstagramVerifiedBadge = ({ size = 16 }: { size?: number }) => {
  const [showTooltip, setShowTooltip] = useState(false);
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
          Verified Author
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

// ===== PRELOADER =====
const Preloader = ({ onComplete }: { onComplete: () => void }) => {
  const preloaderRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        if (preloaderRef.current) {
          gsap.to(preloaderRef.current, {
            opacity: 0,
            duration: 0.6,
            ease: "power2.inOut",
            onComplete: onComplete
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
  }, [onComplete]);

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
          Policy
        </span>
      </div>
    </div>
  );
};

// ===== SIDEBAR NAVIGATION =====
const SidebarNav = ({ activeIndex, sections }: { activeIndex: number; sections: any[] }) => {
  return (
    <div style={{
      position: "fixed",
      left: "40px",
      top: "50%",
      transform: "translateY(-50%)",
      zIndex: 50,
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      gap: "6px",
    }}>
      {sections.map((section, idx) => {
        const number = String(idx + 1).padStart(2, '0');
        const isActive = idx === activeIndex;
        return (
          <div
            key={idx}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0",
              padding: "3px 0",
              opacity: isActive ? 1 : 0.5,
              transition: "opacity 0.3s ease, transform 0.3s ease",
              cursor: "pointer",
              transform: isActive ? "scale(1.05)" : "scale(1)",
            }}
            onClick={() => {
              const element = document.getElementById(`section-${number}`);
              if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }}
          >
            <span style={{
              fontSize: isActive ? "24px" : "18px",
              fontWeight: isActive ? 700 : 400,
              color: isActive ? "#0D3CFC" : "#999",
              fontFamily: FONT_FAMILY,
              letterSpacing: "0.02em",
              transition: "all 0.3s ease",
              lineHeight: 1.2,
            }}>
              {number}. {section.title}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// ===== LIVE CHAT AGENT =====
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
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: any;
  read: boolean;
}

const PulsingDots = ({ active }: { active: boolean }) => {
  if (!active) return <span style={{ color: '#999', fontSize: '14px' }}>● Offline</span>;
  return (
    <span style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
      <span className="dot" style={{ animationDelay: '0s' }}>●</span>
      <span className="dot" style={{ animationDelay: '0.2s' }}>●</span>
      <span className="dot" style={{ animationDelay: '0.4s' }}>●</span>
      <style>{`
        .dot {
          animation: blink 1.4s infinite both;
          font-size: 12px;
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

const LiveChatAgent = ({ user, isAdmin, db, auth }: { user: any; isAdmin: boolean; db: any; auth: any }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [showStartChat, setShowStartChat] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [agentOnline, setAgentOnline] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const topics = [
    "Pertanyaan tentang produk",
    "Bantuan teknis",
    "Permasalahan akun",
    "Donasi",
    "Kerjasama",
    "Lainnya"
  ];

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

  const formatReceivedDate = (timestamp: any): string => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const WaitingIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );

  const ActiveIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  );

  const ResolvedIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  );

  const ChatIconSmall = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );

  const ChatIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const SendIcon = ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const LiveChatIllustration = () => (
    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="#0D3CFC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="8" cy="10" r="1" fill="#0D3CFC"/>
      <circle cx="12" cy="10" r="1" fill="#0D3CFC"/>
      <circle cx="16" cy="10" r="1" fill="#0D3CFC"/>
    </svg>
  );

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "users"), where("email", "==", ADMIN_EMAIL));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const data = doc.data();
        setAgentOnline(data.online || false);
      }
    });
    return () => unsubscribe();
  }, [db]);

  useEffect(() => {
    if (!db || !user) return;
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
        ticketList.push({ id: doc.id, ...doc.data() } as Ticket);
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
  }, [db, user, isAdmin, selectedTicket]);

  useEffect(() => {
    if (!db || !selectedTicket) return;
    const q = query(
      collection(db, "livechat_tickets", selectedTicket.id, "messages"),
      orderBy("timestamp", "asc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgList: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        msgList.push({ id: doc.id, ...doc.data() } as ChatMessage);
      });
      setMessages(msgList);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    });
    return () => unsubscribe();
  }, [db, selectedTicket]);

  useEffect(() => {
    if (!db || !selectedTicket || !user || !isAdmin) return;
    const unread = messages.filter(m => m.senderId !== user.uid && !m.read);
    unread.forEach(async (msg) => {
      const msgRef = doc(db, "livechat_tickets", selectedTicket.id, "messages", msg.id);
      await updateDoc(msgRef, { read: true });
    });
  }, [messages, selectedTicket, db, user, isAdmin]);

  useEffect(() => {
    if (!user || isAdmin) return;
    const activeTicket = tickets.find(t => t.status === 'waiting' || t.status === 'active');
    if (activeTicket) {
      setSelectedTicket(activeTicket);
    } else if (tickets.length > 0 && !selectedTicket) {
      setSelectedTicket(tickets[0]);
    } else if (tickets.length === 0) {
      setSelectedTicket(null);
      setMessages([]);
    }
  }, [tickets, user, isAdmin, selectedTicket]);

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
    const hasActiveTicket = tickets.some(t => t.status === 'waiting' || t.status === 'active');
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
      });
      await addDoc(collection(db, "livechat_tickets", ticketRef.id, "messages"), {
        senderId: user.uid,
        senderName: user.displayName || user.email || "User",
        text: `Halo, saya ingin bertanya tentang: ${selectedTopic}`,
        timestamp: serverTimestamp(),
        read: false,
      });
      setSelectedTopic("");
      setShowStartChat(false);
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  const sendMessage = async () => {
    if (!db || !selectedTicket || !messageText.trim() || !user) return;
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
      await addDoc(collection(db, "livechat_tickets", selectedTicket.id, "messages"), {
        senderId: user.uid,
        senderName: senderName,
        text: messageText.trim(),
        timestamp: serverTimestamp(),
        read: false,
      });
      await updateDoc(ticketRef, {
        lastMessage: messageText.trim(),
        lastMessageTime: serverTimestamp(),
        ...(selectedTicket.status === "waiting" && { status: "active" }),
        agentId: isAdmin ? user.uid : selectedTicket.agentId,
        agentName: isAdmin ? AGENT_NAME : selectedTicket.agentName,
      });
      setMessageText("");
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    } catch (error) {
      console.error("Error sending message:", error);
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

  if (!user) {
    return (
      <div style={{
        marginTop: "60px",
        borderTop: "1px solid #e8e8e8",
        paddingTop: "40px",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "24px",
          flexWrap: "wrap",
        }}>
          <div style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(13,60,252,0.06)",
            borderRadius: "16px",
            padding: "20px",
            width: "120px",
            height: "120px",
          }}>
            <LiveChatIllustration />
          </div>
          <div style={{
            textAlign: "left",
            flex: 1,
            minWidth: "200px",
          }}>
            <h3 style={{
              fontSize: "28px",
              fontWeight: 600,
              color: "#0D3CFC",
              fontFamily: FONT_FAMILY,
              marginBottom: "8px",
            }}>
              Live Chat Agent
            </h3>
            <p style={{
              fontSize: "16px",
              color: "#0D3CFC",
              fontFamily: FONT_FAMILY,
              marginBottom: "16px",
              opacity: 0.8,
            }}>
              Silakan login untuk menggunakan Live Chat Agent
            </p>
            <Link href="/" style={{ textDecoration: "none" }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  padding: "10px 32px",
                  backgroundColor: "#0D3CFC",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: FONT_FAMILY,
                  transition: "background 0.2s ease",
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#0a2fc9"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#0D3CFC"}
              >
                Login
              </motion.button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    const activeTicket = tickets.find(t => t.status === 'waiting' || t.status === 'active');
    if (tickets.length === 0 && !showStartChat) {
      return (
        <div style={{ marginTop: "40px", borderTop: "1px solid #e8e8e8", paddingTop: "40px" }}>
          <h3 style={{ fontSize: "30px", fontWeight: 600, color: "#0D3CFC", fontFamily: FONT_FAMILY, marginBottom: "20px" }}>
            Live Chat Agent
          </h3>
          <p style={{ fontSize: "16px", color: "#666", fontFamily: FONT_FAMILY, marginBottom: "16px" }}>
            Butuh bantuan? Chat langsung dengan agent kami.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowStartChat(true)}
            style={{
              padding: "14px 32px",
              backgroundColor: "#0D3CFC",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              fontSize: "18px",
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: FONT_FAMILY,
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <ChatIcon />
            <span>Mulai Live Chat</span>
          </motion.button>
        </div>
      );
    }

    if (showStartChat) {
      return (
        <div style={{ marginTop: "40px", borderTop: "1px solid #e8e8e8", paddingTop: "40px" }}>
          <h3 style={{ fontSize: "30px", fontWeight: 600, color: "#0D3CFC", fontFamily: FONT_FAMILY, marginBottom: "20px" }}>
            Live Chat Agent
          </h3>
          <div style={{ maxWidth: "500px" }}>
            <div style={{ fontSize: "18px", marginBottom: "16px", fontFamily: FONT_FAMILY }}>
              Pilih topik permasalahan Anda:
            </div>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "2px solid #0D3CFC",
                borderRadius: "8px",
                fontSize: "16px",
                fontFamily: FONT_FAMILY,
                outline: "none",
                backgroundColor: "#fff",
                marginBottom: "16px",
                color: "#0D3CFC",
              }}
            >
              <option value="">-- Pilih topik --</option>
              {topics.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <div style={{ display: "flex", gap: "12px" }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startChat}
                disabled={!selectedTopic}
                style={{
                  padding: "10px 24px",
                  backgroundColor: selectedTopic ? "#0D3CFC" : "#ccc",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: 500,
                  cursor: selectedTopic ? "pointer" : "not-allowed",
                  fontFamily: FONT_FAMILY,
                }}
              >
                Mulai Chat
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowStartChat(false)}
                style={{
                  padding: "10px 24px",
                  backgroundColor: "transparent",
                  color: "#666",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: FONT_FAMILY,
                }}
              >
                Batal
              </motion.button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div style={{ marginTop: "40px", borderTop: "1px solid #e8e8e8", paddingTop: "40px" }}>
        <div style={{ display: "flex", gap: "24px", height: "500px" }}>
          <div style={{
            width: "280px",
            backgroundColor: "#0D3CFC",
            borderRadius: "12px",
            padding: "16px 0",
            overflowY: "auto",
            flexShrink: 0,
            color: "#fff",
            fontFamily: FONT_FAMILY,
            boxShadow: "0 4px 20px rgba(13,60,252,0.15)",
          }}>
            <div style={{
              padding: "0 16px 12px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.15)",
              fontWeight: 600,
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#fff",
            }}>
              <ChatIconSmall />
              <span>Riwayat Chat</span>
              <span style={{
                marginLeft: "auto",
                fontSize: "11px",
                backgroundColor: "rgba(255,255,255,0.2)",
                padding: "2px 10px",
                borderRadius: "12px",
              }}>{tickets.length}</span>
            </div>
            {tickets.map((ticket) => {
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
                    padding: "12px 16px",
                    borderLeft: isActive ? "3px solid #fff" : "3px solid transparent",
                    backgroundColor: isActive ? "rgba(255,255,255,0.15)" : "transparent",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <div style={{ fontWeight: 500, fontSize: "14px", color: "#fff" }}>
                    {ticket.userName}
                  </div>
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)" }}>
                    {ticket.topic}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                    <span style={{
                      fontSize: "10px",
                      backgroundColor: statusColor,
                      color: statusTextColor,
                      padding: "1px 10px",
                      borderRadius: "12px",
                      fontWeight: 500,
                    }}>
                      {statusLabel}
                    </span>
                    <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>
                      {ticketId}
                    </span>
                  </div>
                  {ticket.status === 'resolved' && (
                    <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", marginTop: "2px" }}>
                      Diterima: {formatReceivedDate(ticket.createdAt)}
                    </div>
                  )}
                </div>
              );
            })}
            {tickets.length === 0 && (
              <div style={{ padding: "40px 16px", textAlign: "center", color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>
                Belum ada chat
              </div>
            )}
            <div style={{ padding: "16px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowStartChat(true)}
                style={{
                  width: "100%",
                  padding: "10px",
                  backgroundColor: "rgba(255,255,255,0.15)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: FONT_FAMILY,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "background 0.2s ease",
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.25)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.15)"}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Chat Baru
              </motion.button>
            </div>
          </div>

          <div style={{
            flex: 1,
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            border: "1px solid #e8e8e8",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}>
            {selectedTicket ? (
              <>
                <div style={{
                  padding: "12px 16px",
                  backgroundColor: "#0D3CFC",
                  borderBottom: "1px solid #e8e8e8",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderRadius: "12px 12px 0 0",
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "16px", color: "#ffffff", fontFamily: FONT_FAMILY }}>
                      {selectedTicket.userName}
                      <span style={{ fontSize: "12px", fontWeight: 400, color: "rgba(255,255,255,0.7)", marginLeft: "8px", fontFamily: FONT_FAMILY }}>
                        {selectedTicket.topic}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "12px", color: selectedTicket.status === 'waiting' ? "#fef3c7" : selectedTicket.status === 'resolved' ? "#e5e7eb" : "#d1fae5", fontFamily: FONT_FAMILY }}>
                        {selectedTicket.status === 'waiting' ? 'Menunggu' : selectedTicket.status === 'resolved' ? 'Selesai' : 'Aktif'}
                      </span>
                      {selectedTicket.typing && selectedTicket.status !== 'resolved' && (
                        <span style={{ fontSize: "11px", color: "#ffd700", fontStyle: "italic", fontFamily: FONT_FAMILY }}>
                          {selectedTicket.typingUserName} mengetik...
                        </span>
                      )}
                      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", fontFamily: FONT_FAMILY }}>
                        {generateTicketId(selectedTicket.createdAt)}
                      </span>
                    </div>
                  </div>
                  {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                    <button
                      onClick={() => resolveTicket(selectedTicket.id)}
                      style={{
                        padding: "6px 14px",
                        backgroundColor: "#22c55e",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "12px",
                        cursor: "pointer",
                        fontFamily: FONT_FAMILY,
                        transition: "opacity 0.2s ease",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                    >
                      Selesaikan
                    </button>
                  )}
                </div>
                <div style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}>
                  {messages.length === 0 ? (
                    <div style={{ textAlign: "center", color: "#999", fontSize: "14px", padding: "40px 0", fontFamily: FONT_FAMILY }}>
                      Belum ada pesan
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isMine = msg.senderId === user.uid;
                      const isAgent = !isMine && msg.senderName === AGENT_NAME;
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.2 }}
                          style={{
                            alignSelf: isMine ? "flex-end" : "flex-start",
                            maxWidth: "75%",
                            padding: "10px 14px",
                            borderRadius: "12px",
                            backgroundColor: isMine ? "#0D3CFC" : "#e8e8e8",
                            color: isMine ? "#fff" : "#000",
                            fontSize: "14px",
                            fontFamily: FONT_FAMILY,
                          }}
                        >
                          {!isMine && (
                            <div style={{ fontSize: "11px", fontWeight: 500, color: "#0D3CFC", marginBottom: "2px", fontFamily: FONT_FAMILY, display: "flex", alignItems: "center", gap: "4px" }}>
                              {msg.senderName}
                              {isAgent && <InstagramVerifiedBadge size={12} />}
                            </div>
                          )}
                          <div>{msg.text}</div>
                          <div style={{ 
                            fontSize: "9px", 
                            color: isMine ? "rgba(255,255,255,0.6)" : "#999", 
                            marginTop: "4px",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            fontFamily: FONT_FAMILY,
                          }}>
                            {formatTime(msg.timestamp)}
                            {isMine && msg.read && <span style={{ color: "#22c55e", fontWeight: 600 }}>✓✓ Dibaca</span>}
                            {isMine && !msg.read && <span style={{ color: "#22c55e", fontWeight: 400 }}>✓ Terkirim</span>}
                            {!isMine && msg.read && <span style={{ color: "#22c55e", fontWeight: 600 }}>✓✓ Dibaca</span>}
                            {!isMine && !msg.read && <span style={{ color: "#999" }}>✓ Terkirim</span>}
                          </div>
                        </motion.div>
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
                {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                  <div style={{
                    padding: "12px 16px",
                    borderTop: "1px solid #e8e8e8",
                    display: "flex",
                    gap: "8px",
                    backgroundColor: "#fff",
                    borderRadius: "0 0 12px 12px",
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
                      disabled={selectedTicket.status === 'waiting'}
                      style={{
                        flex: 1,
                        padding: "10px 14px",
                        border: "1px solid #e8e8e8",
                        borderRadius: "8px",
                        fontSize: "14px",
                        outline: "none",
                        fontFamily: FONT_FAMILY,
                        transition: "border-color 0.2s ease",
                        backgroundColor: selectedTicket.status === 'waiting' ? "#f5f5f5" : "#fff",
                      }}
                      onFocus={(e) => { if (selectedTicket.status !== 'waiting') e.currentTarget.style.borderColor = "#0D3CFC"; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "#e8e8e8"; }}
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
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
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        if (selectedTicket.status !== 'waiting' && messageText.trim()) {
                          e.currentTarget.style.backgroundColor = "#0a2fc9";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedTicket.status !== 'waiting' && messageText.trim()) {
                          e.currentTarget.style.backgroundColor = "#0D3CFC";
                        }
                      }}
                    >
                      <SendIcon />
                      <span>Kirim</span>
                    </motion.button>
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
                fontSize: "16px",
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

  // Admin view
  const waitingTickets = tickets.filter(t => t.status === 'waiting');
  const activeTickets = tickets.filter(t => t.status === 'active');
  const resolvedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed');
  const typingText = selectedTicket ? getTypingText(selectedTicket) : null;

  return (
    <div style={{ marginTop: "60px", borderTop: "1px solid #e8e8e8", paddingTop: "40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2 style={{ fontSize: "30px", fontWeight: 600, color: "#0D3CFC", fontFamily: FONT_FAMILY, margin: 0 }}>
            Live Chat Agent
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "4px" }}>
            <PulsingDots active={agentOnline} />
            <span style={{ fontSize: "14px", color: agentOnline ? "#0D3CFC" : "#999", fontFamily: FONT_FAMILY }}>
              {agentOnline ? "Online" : "Offline"}
            </span>
            <span style={{ fontSize: "14px", color: "#999" }}>•</span>
            <span style={{ fontSize: "14px", color: "#0D3CFC", fontFamily: FONT_FAMILY }}>
              {waitingTickets.length} menunggu • {activeTickets.length} aktif
            </span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Agent" style={{ width: "40px", height: "40px", borderRadius: "50%" }} />
          ) : (
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#0D3CFC", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 600, fontSize: "18px" }}>
              {AGENT_NAME.charAt(0)}
            </div>
          )}
          <div>
            <div style={{ fontSize: "16px", fontWeight: 600, color: "#000", display: "flex", alignItems: "center", gap: "6px", fontFamily: FONT_FAMILY }}>
              {AGENT_NAME}
              <span style={{
                backgroundColor: "#d1fae5",
                color: "#065f46",
                fontSize: "10px",
                fontWeight: 600,
                padding: "2px 10px",
                borderRadius: "12px",
                letterSpacing: "0.3px",
                fontFamily: FONT_FAMILY,
              }}>
                Agent
              </span>
              <InstagramVerifiedBadge size={14} />
            </div>
            <div style={{ fontSize: "12px", color: "#999", fontFamily: FONT_FAMILY }}>Support</div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "24px", height: "500px" }}>
        <div style={{
          width: "320px",
          backgroundColor: "#f9f9f9",
          borderRadius: "12px",
          border: "1px solid #e8e8e8",
          overflowY: "auto",
          flexShrink: 0,
        }}>
          {waitingTickets.length > 0 && (
            <div>
              <div style={{
                padding: "12px 16px",
                backgroundColor: "#fef3c7",
                fontWeight: 600,
                fontSize: "14px",
                color: "#92400e",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontFamily: FONT_FAMILY,
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
                    padding: "12px 16px",
                    borderBottom: "1px solid #e8e8e8",
                    cursor: "pointer",
                    backgroundColor: selectedTicket?.id === ticket.id ? "rgba(13,60,252,0.08)" : "transparent",
                    transition: "background 0.2s ease",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(13,60,252,0.04)"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = selectedTicket?.id === ticket.id ? "rgba(13,60,252,0.08)" : "transparent"}
                >
                  <div style={{ fontWeight: 500, fontSize: "14px", color: "#0D3CFC", fontFamily: FONT_FAMILY }}>{ticket.userName}</div>
                  <div style={{ fontSize: "12px", color: "#666", fontFamily: FONT_FAMILY }}>{ticket.topic}</div>
                  {ticket.typing && <div style={{ fontSize: "11px", color: "#0D3CFC", fontStyle: "italic", fontFamily: FONT_FAMILY }}>{ticket.typingUserName} mengetik...</div>}
                </div>
              ))}
            </div>
          )}

          {activeTickets.length > 0 && (
            <div>
              <div style={{
                padding: "12px 16px",
                backgroundColor: "#d1fae5",
                fontWeight: 600,
                fontSize: "14px",
                color: "#065f46",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontFamily: FONT_FAMILY,
              }}>
                <ActiveIcon />
                <span>Aktif ({activeTickets.length})</span>
              </div>
              {activeTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #e8e8e8",
                    cursor: "pointer",
                    backgroundColor: selectedTicket?.id === ticket.id ? "rgba(13,60,252,0.08)" : "transparent",
                    transition: "background 0.2s ease",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(13,60,252,0.04)"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = selectedTicket?.id === ticket.id ? "rgba(13,60,252,0.08)" : "transparent"}
                >
                  <div style={{ fontWeight: 500, fontSize: "14px", color: "#0D3CFC", fontFamily: FONT_FAMILY }}>{ticket.userName}</div>
                  <div style={{ fontSize: "12px", color: "#666", fontFamily: FONT_FAMILY }}>{ticket.topic}</div>
                  {ticket.typing && <div style={{ fontSize: "11px", color: "#0D3CFC", fontStyle: "italic", fontFamily: FONT_FAMILY }}>{ticket.typingUserName} mengetik...</div>}
                  {ticket.lastMessage && <div style={{ fontSize: "11px", color: "#999", marginTop: "2px", fontFamily: FONT_FAMILY }}>{ticket.lastMessage.substring(0, 40)}{ticket.lastMessage.length > 40 ? "..." : ""}</div>}
                </div>
              ))}
            </div>
          )}

          {resolvedTickets.length > 0 && (
            <div>
              <div style={{
                padding: "12px 16px",
                backgroundColor: "#e5e7eb",
                fontWeight: 600,
                fontSize: "14px",
                color: "#6b7280",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontFamily: FONT_FAMILY,
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
                      padding: "12px 16px",
                      borderBottom: "1px solid #e8e8e8",
                      cursor: "pointer",
                      backgroundColor: selectedTicket?.id === ticket.id ? "rgba(13,60,252,0.08)" : "transparent",
                      transition: "background 0.2s ease",
                      opacity: 0.7,
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(13,60,252,0.04)"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = selectedTicket?.id === ticket.id ? "rgba(13,60,252,0.08)" : "transparent"}
                  >
                    <div style={{ fontWeight: 500, fontSize: "14px", color: "#0D3CFC", fontFamily: FONT_FAMILY }}>{ticket.userName}</div>
                    <div style={{ fontSize: "12px", color: "#666", fontFamily: FONT_FAMILY }}>{ticket.topic}</div>
                    <div style={{ fontSize: "11px", color: "#6b7280", fontFamily: FONT_FAMILY }}>{ticketId} • Diterima pada: {formatReceivedDate(ticket.createdAt)}</div>
                  </div>
                );
              })}
            </div>
          )}

          {waitingTickets.length === 0 && activeTickets.length === 0 && resolvedTickets.length === 0 && (
            <div style={{ padding: "40px 16px", textAlign: "center", color: "#999", fontSize: "14px", fontFamily: FONT_FAMILY }}>
              Tidak ada chat masuk
            </div>
          )}
        </div>

        <div style={{
          flex: 1,
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          border: "1px solid #e8e8e8",
          display: "flex",
          flexDirection: "column",
        }}>
          {selectedTicket ? (
            <>
              <div style={{
                padding: "12px 16px",
                backgroundColor: "#0D3CFC",
                borderBottom: "1px solid #e8e8e8",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderRadius: "12px 12px 0 0",
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "16px", color: "#ffffff", fontFamily: FONT_FAMILY }}>
                    {selectedTicket.userName}
                    <span style={{ fontSize: "12px", fontWeight: 400, color: "rgba(255,255,255,0.7)", marginLeft: "8px", fontFamily: FONT_FAMILY }}>
                      {selectedTicket.topic}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "12px", color: selectedTicket.status === 'waiting' ? "#fef3c7" : selectedTicket.status === 'resolved' ? "#e5e7eb" : "#d1fae5", fontFamily: FONT_FAMILY }}>
                      {selectedTicket.status === 'waiting' ? 'Menunggu' : selectedTicket.status === 'resolved' ? 'Selesai' : 'Aktif'}
                    </span>
                    {selectedTicket.typing && selectedTicket.status !== 'resolved' && (
                      <span style={{ fontSize: "11px", color: "#ffd700", fontStyle: "italic", fontFamily: FONT_FAMILY }}>
                        {selectedTicket.typingUserName} mengetik...
                      </span>
                    )}
                    <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", fontFamily: FONT_FAMILY }}>
                      {generateTicketId(selectedTicket.createdAt)}
                    </span>
                  </div>
                </div>
                {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                  <button
                    onClick={() => resolveTicket(selectedTicket.id)}
                    style={{
                      padding: "6px 14px",
                      backgroundColor: "#22c55e",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "12px",
                      cursor: "pointer",
                      fontFamily: FONT_FAMILY,
                      transition: "opacity 0.2s ease",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                  >
                    Selesaikan
                  </button>
                )}
              </div>
              <div style={{
                flex: 1,
                overflowY: "auto",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}>
                {messages.length === 0 ? (
                  <div style={{ textAlign: "center", color: "#999", fontSize: "14px", padding: "40px 0", fontFamily: FONT_FAMILY }}>
                    Belum ada pesan
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMine = msg.senderId === user.uid;
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          alignSelf: isMine ? "flex-end" : "flex-start",
                          maxWidth: "75%",
                          padding: "10px 14px",
                          borderRadius: "12px",
                          backgroundColor: isMine ? "#0D3CFC" : "#e8e8e8",
                          color: isMine ? "#fff" : "#000",
                          fontSize: "14px",
                          fontFamily: FONT_FAMILY,
                        }}
                      >
                        {!isMine && (
                          <div style={{ fontSize: "11px", fontWeight: 500, color: "#0D3CFC", marginBottom: "2px", fontFamily: FONT_FAMILY }}>
                            {msg.senderName}
                          </div>
                        )}
                        <div>{msg.text}</div>
                        <div style={{ 
                          fontSize: "9px", 
                          color: isMine ? "rgba(255,255,255,0.6)" : "#999", 
                          marginTop: "4px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          fontFamily: FONT_FAMILY,
                        }}>
                          {formatTime(msg.timestamp)}
                          {!isMine && msg.read && <span style={{ color: "#22c55e", fontWeight: 600 }}>✓✓ Dibaca</span>}
                          {!isMine && !msg.read && <span style={{ color: "#999" }}>✓ Terkirim</span>}
                        </div>
                      </motion.div>
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
              {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                <div style={{
                  padding: "12px 16px",
                  borderTop: "1px solid #e8e8e8",
                  display: "flex",
                  gap: "8px",
                  backgroundColor: "#fff",
                  borderRadius: "0 0 12px 12px",
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
                      padding: "10px 14px",
                      border: "1px solid #e8e8e8",
                      borderRadius: "8px",
                      fontSize: "14px",
                      outline: "none",
                      fontFamily: FONT_FAMILY,
                      transition: "border-color 0.2s ease",
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = "#0D3CFC"}
                    onBlur={(e) => e.currentTarget.style.borderColor = "#e8e8e8"}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
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
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (messageText.trim()) e.currentTarget.style.backgroundColor = "#0a2fc9";
                    }}
                    onMouseLeave={(e) => {
                      if (messageText.trim()) e.currentTarget.style.backgroundColor = "#0D3CFC";
                    }}
                  >
                    <SendIcon />
                    <span>Kirim</span>
                  </motion.button>
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
              fontSize: "16px",
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

// ============================================================
// ===== MAIN PAGE COMPONENT =====
// ============================================================
export default function PrivacyPolicyPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [showMain, setShowMain] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [isAuthorVerified, setIsAuthorVerified] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  
  // Navbar state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuOverlayRef = useRef<HTMLDivElement>(null);
  const plusIconRef = useRef<HTMLSpanElement>(null);
  
  const preloaderRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);
  const navbarRef = useRef<HTMLDivElement>(null);
  const menuItemsRef = useRef<HTMLDivElement>(null);
  const menuBoxRef = useRef<HTMLDivElement>(null);
  const menuBox2Ref = useRef<HTMLDivElement>(null);
  const menuBox3Ref = useRef<HTMLDivElement>(null);
  const storiesRef = useRef<HTMLDivElement>(null);
  const menuruFooterRef = useRef<HTMLDivElement>(null);
  const menuruTextRef = useRef<HTMLSpanElement>(null);
  const privacyTitleRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const editButtonRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Default Privacy Policy Content
  const defaultPrivacyContent = [
    {
      title: "Pendahuluan",
      subs: [
        { sub: "1.1 Latar Belakang", content: "Kebijakan Privasi ini dibuat untuk melindungi data pribadi pengguna yang menggunakan layanan Menuru. Kami berkomitmen untuk menjaga kerahasiaan dan keamanan informasi pribadi Anda sesuai dengan peraturan perlindungan data yang berlaku." },
        { sub: "1.2 Ruang Lingkup", content: "Kebijakan ini berlaku untuk semua layanan yang disediakan oleh Menuru, termasuk website dan fitur-fitur yang tersedia di dalamnya. Kebijakan ini mencakup semua pengguna, baik yang terdaftar maupun pengunjung." },
        { sub: "1.3 Persetujuan", content: "Dengan menggunakan layanan Menuru, Anda menyetujui pengumpulan dan penggunaan informasi pribadi Anda sesuai dengan Kebijakan Privasi ini. Jika Anda tidak setuju, Anda tidak diperkenankan menggunakan layanan kami." }
      ]
    },
    {
      title: "Informasi yang Kami Kumpulkan",
      subs: [
        { sub: "2.1 Informasi Akun", content: "Kami mengumpulkan informasi yang Anda berikan saat mendaftar, termasuk nama lengkap, alamat email, kata sandi, dan nomor telepon. Informasi ini diperlukan untuk membuat dan mengelola akun Anda." },
        { sub: "2.2 Informasi Profil", content: "Kami mengumpulkan data profil seperti foto profil, biografi, dan preferensi pengguna. Informasi ini digunakan untuk personalisasi pengalaman Anda di platform." },
        { sub: "2.3 Informasi Transaksi", content: "Untuk fitur Shop dan Donation, kami mengumpulkan data transaksi seperti riwayat pembelian, metode pembayaran, dan alamat pengiriman. Semua data transaksi dilindungi dengan enkripsi." },
        { sub: "2.4 Informasi Interaksi", content: "Kami mengumpulkan data interaksi Anda dengan fitur-fitur seperti Note, Calendar, Blog, Community, dan Live Chat. Ini termasuk catatan yang Anda buat, jadwal, komentar, dan percakapan chat." },
        { sub: "2.5 Informasi Teknis", content: "Kami secara otomatis mengumpulkan informasi teknis seperti alamat IP, jenis perangkat, sistem operasi, browser, dan data penggunaan. Informasi ini digunakan untuk analisis dan peningkatan layanan." }
      ]
    },
    {
      title: "Penggunaan Informasi",
      subs: [
        { sub: "3.1 Penyediaan Layanan", content: "Informasi pribadi Anda digunakan untuk menyediakan, memelihara, dan meningkatkan layanan Menuru. Ini termasuk mengelola akun, memproses transaksi, dan memberikan dukungan pelanggan." },
        { sub: "3.2 Personalisasi", content: "Kami menggunakan data untuk mempersonalisasi pengalaman Anda, seperti merekomendasikan konten yang relevan di Blog, menyesuaikan antarmuka, dan memberikan notifikasi yang dipersonalisasi." },
        { sub: "3.3 Komunikasi", content: "Kami menggunakan informasi kontak Anda untuk mengirimkan notifikasi penting, pembaruan layanan, dan komunikasi terkait akun. Anda dapat mengatur preferensi notifikasi di pengaturan akun." },
        { sub: "3.4 Analisis dan Peningkatan", content: "Data penggunaan dianalisis untuk memahami perilaku pengguna, mengidentifikasi tren, dan meningkatkan fungsionalitas layanan. Kami menggunakan analitik untuk mengoptimalkan pengalaman pengguna." },
        { sub: "3.5 Keamanan", content: "Informasi digunakan untuk mendeteksi, mencegah, dan mengatasi aktivitas mencurigakan atau pelanggaran keamanan. Kami memantau aktivitas untuk melindungi akun dan data pengguna." }
      ]
    },
    {
      title: "Penyimpanan dan Keamanan Data",
      subs: [
        { sub: "4.1 Metode Penyimpanan", content: "Data Anda disimpan di server Firebase yang aman dengan enkripsi standar industri. Kami menggunakan protokol keamanan untuk melindungi data dari akses tidak sah." },
        { sub: "4.2 Enkripsi", content: "Semua data sensitif, termasuk kata sandi dan informasi transaksi, dienkripsi menggunakan teknologi enkripsi terkini. Ini memastikan bahwa data Anda tetap aman selama transmisi dan penyimpanan." },
        { sub: "4.3 Periode Penyimpanan", content: "Kami menyimpan data Anda selama akun Anda aktif atau selama diperlukan untuk memenuhi tujuan yang diuraikan dalam Kebijakan ini. Data akan dihapus setelah permintaan penghapusan akun." },
        { sub: "4.4 Cadangan Data", content: "Kami melakukan pencadangan data secara rutin untuk mencegah kehilangan data. Cadangan disimpan dengan aman dan hanya dapat diakses oleh personel yang berwenang." }
      ]
    },
    {
      title: "Berbagi Informasi",
      subs: [
        { sub: "5.1 Penyedia Layanan", content: "Kami dapat berbagi data dengan penyedia layanan pihak ketiga yang membantu kami mengoperasikan layanan, seperti hosting, pembayaran, dan analitik. Semua pihak ketiga terikat dengan perjanjian kerahasiaan." },
        { sub: "5.2 Kewajiban Hukum", content: "Kami dapat mengungkapkan informasi jika diwajibkan oleh hukum atau untuk merespons proses hukum yang sah, seperti surat perintah pengadilan atau panggilan pengadilan." },
        { sub: "5.3 Perlindungan Hak", content: "Kami dapat berbagi informasi untuk melindungi hak, properti, atau keselamatan Menuru, pengguna kami, atau orang lain. Ini termasuk penegakan syarat dan ketentuan kami." },
        { sub: "5.4 Persetujuan Pengguna", content: "Kami tidak akan membagikan informasi pribadi Anda kepada pihak ketiga untuk tujuan pemasaran tanpa persetujuan eksplisit Anda." }
      ]
    },
    {
      title: "Hak Privasi Anda",
      subs: [
        { sub: "6.1 Hak Akses", content: "Anda berhak mengakses informasi pribadi yang kami miliki tentang Anda. Anda dapat melihat dan mengunduh data Anda melalui pengaturan akun." },
        { sub: "6.2 Hak Perbaikan", content: "Anda berhak memperbaiki informasi pribadi yang tidak akurat atau tidak lengkap. Anda dapat memperbarui profil Anda kapan saja di pengaturan akun." },
        { sub: "6.3 Hak Penghapusan", content: "Anda berhak meminta penghapusan informasi pribadi Anda. Kami akan menghapus data Anda sesuai dengan permintaan, kecuali jika diperlukan untuk kepatuhan hukum." },
        { sub: "6.4 Hak Pembatasan", content: "Anda berhak membatasi pemrosesan informasi pribadi Anda dalam keadaan tertentu, seperti jika Anda mempertanyakan keakuratan data." },
        { sub: "6.5 Hak Portabilitas", content: "Anda berhak menerima data Anda dalam format terstruktur dan dapat dibaca mesin. Anda dapat meminta ekspor data Anda melalui pengaturan akun." }
      ]
    },
    {
      title: "Cookie dan Teknologi Pelacakan",
      subs: [
        { sub: "7.1 Penggunaan Cookie", content: "Kami menggunakan cookie untuk meningkatkan pengalaman pengguna, menyimpan preferensi, dan melacak aktivitas di situs. Cookie membantu kami memahami bagaimana Anda berinteraksi dengan layanan." },
        { sub: "7.2 Jenis Cookie", content: "Kami menggunakan cookie sesi (sementara) dan cookie persisten (tetap) untuk berbagai tujuan, termasuk autentikasi, analitik, dan personalisasi konten." },
        { sub: "7.3 Kontrol Cookie", content: "Anda dapat mengatur preferensi cookie melalui pengaturan browser. Anda dapat menolak semua cookie, tetapi ini dapat mempengaruhi fungsionalitas beberapa fitur." },
        { sub: "7.4 Pihak Ketiga", content: "Kami menggunakan layanan analitik pihak ketiga yang juga menggunakan cookie untuk mengumpulkan data penggunaan. Data ini digunakan secara agregat untuk meningkatkan layanan." }
      ]
    },
    {
      title: "Shop",
      subs: [
        { sub: "8.1 Data Transaksi", content: "Fitur Shop mengumpulkan data transaksi termasuk produk yang dibeli, jumlah, harga, metode pembayaran, dan alamat pengiriman. Semua data transaksi dilindungi dengan enkripsi." },
        { sub: "8.2 Riwayat Pembelian", content: "Kami menyimpan riwayat pembelian Anda untuk memudahkan pelacakan pesanan, pengembalian barang, dan memberikan rekomendasi produk yang relevan." },
        { sub: "8.3 Keamanan Pembayaran", content: "Kami menggunakan gateway pembayaran yang aman dan terverifikasi. Informasi kartu kredit tidak disimpan di server kami dan diproses langsung oleh penyedia pembayaran." }
      ]
    },
    {
      title: "Note",
      subs: [
        { sub: "9.1 Penyimpanan Catatan", content: "Fitur Note menyimpan catatan pribadi Anda di server yang aman. Semua catatan dienkripsi dan hanya dapat diakses oleh Anda menggunakan akun terdaftar." },
        { sub: "9.2 Privasi Catatan", content: "Kami tidak memiliki akses ke konten catatan Anda. Catatan Anda bersifat pribadi dan tidak dibagikan dengan pengguna lain atau pihak ketiga." },
        { sub: "9.3 Sinkronisasi", content: "Catatan Anda disinkronkan secara real-time di semua perangkat yang terhubung dengan akun Anda, memastikan akses yang konsisten di mana saja." }
      ]
    },
    {
      title: "Calendar",
      subs: [
        { sub: "10.1 Manajemen Jadwal", content: "Fitur Calendar mengelola jadwal dan pengingat Anda. Data kalender disimpan dengan aman dan hanya digunakan untuk memberikan notifikasi yang Anda minta." },
        { sub: "10.2 Pengingat", content: "Kami menggunakan data kalender untuk mengirimkan pengingat dan notifikasi tentang acara yang akan datang. Anda dapat mengatur preferensi notifikasi di pengaturan." },
        { sub: "10.3 Integrasi", content: "Calendar dapat diintegrasikan dengan kalender eksternal (Google Calendar, Outlook) dengan izin Anda. Kami tidak menyimpan kredensial kalender eksternal Anda." }
      ]
    },
    {
      title: "Blog",
      subs: [
        { sub: "11.1 Interaksi Konten", content: "Fitur Blog mengumpulkan data interaksi seperti komentar, like, dan waktu baca. Data ini digunakan untuk meningkatkan pengalaman membaca dan merekomendasikan konten yang relevan." },
        { sub: "11.2 Konten Publik", content: "Komentar dan interaksi di Blog bersifat publik. Mohon pertimbangkan informasi yang Anda bagikan di ruang publik ini." },
        { sub: "11.3 Rekomendasi", content: "Kami menggunakan data pembacaan untuk merekomendasikan artikel yang relevan dengan minat Anda. Ini membantu Anda menemukan konten yang lebih personal." }
      ]
    },
    {
      title: "Donation",
      subs: [
        { sub: "12.1 Data Donor", content: "Fitur Donation melindungi data donor termasuk nama, email, dan jumlah donasi. Informasi ini digunakan untuk mengirimkan konfirmasi dan laporan donasi." },
        { sub: "12.2 Transaksi Aman", content: "Semua transaksi donasi diproses melalui gateway pembayaran yang aman dan terverifikasi. Kami tidak menyimpan informasi kartu kredit di server kami." },
        { sub: "12.3 Transparansi", content: "Kami menyediakan laporan donasi yang transparan dan dapat diakses oleh donor. Penggunaan dana donasi dilaporkan secara berkala." }
      ]
    },
    {
      title: "Community",
      subs: [
        { sub: "13.1 Aktivitas Sosial", content: "Fitur Community mengumpulkan data aktivitas seperti posting, komentar, dan interaksi sosial. Data ini digunakan untuk membangun pengalaman komunitas yang positif." },
        { sub: "13.2 Konten Publik", content: "Posting dan komentar di Community bersifat publik dan dapat dilihat oleh pengguna lain. Kami mendorong pengguna untuk berbagi dengan bijak." },
        { sub: "13.3 Keamanan Komunitas", content: "Kami memoderasi konten untuk menjaga lingkungan yang aman dan positif. Pelanggaran dapat mengakibatkan penghapusan konten atau sanksi akun." }
      ]
    },
    {
      title: "Live Chat Agent",
      subs: [
        { sub: "14.1 Percakapan Terenkripsi", content: "Fitur Live Chat Agent melindungi percakapan Anda dengan enkripsi end-to-end. Hanya Anda dan agen yang dapat membaca pesan." },
        { sub: "14.2 Riwayat Chat", content: "Riwayat chat disimpan untuk keperluan pelacakan dan peningkatan layanan. Anda dapat meminta penghapusan riwayat chat kapan saja." },
        { sub: "14.3 Kualitas Layanan", content: "Chat dianalisis secara agregat untuk meningkatkan kualitas layanan dukungan. Data pribadi tidak digunakan dalam analisis ini." }
      ]
    },
    {
      title: "Live Chat",
      subs: [
        { sub: "15.1 Komunikasi Real-time", content: "Fitur Live Chat memungkinkan komunikasi real-time antara pengguna. Semua pesan dilindungi dengan enkripsi untuk menjaga kerahasiaan." },
        { sub: "15.2 Penyimpanan Pesan", content: "Pesan disimpan sementara untuk fungsionalitas chat. Pesan dapat dihapus secara permanen atas permintaan pengguna." },
        { sub: "15.3 Moderasi", content: "Kami memantau chat untuk mencegah penyalahgunaan dan menjaga lingkungan yang aman bagi semua pengguna." }
      ]
    },
    {
      title: "Perubahan Kebijakan",
      subs: [
        { sub: "16.1 Pembaruan Kebijakan", content: "Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Perubahan akan diberitahukan melalui email atau notifikasi di platform." },
        { sub: "16.2 Tanggal Efektif", content: "Tanggal efektif pembaruan akan dicantumkan di bagian atas Kebijakan. Perubahan berlaku segera setelah dipublikasikan." },
        { sub: "16.3 Pemberitahuan", content: "Kami akan memberikan pemberitahuan tentang perubahan penting setidaknya 30 hari sebelum berlaku. Anda dapat meninjau perubahan sebelum menyetujui." }
      ]
    },
    {
      title: "Hubungi Kami",
      subs: [
        { sub: "17.1 Kontak Dukungan", content: "Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, silakan hubungi tim dukungan kami melalui email atau form kontak." },
        { sub: "17.2 Email", content: "Anda dapat menghubungi kami di privacy@wawa44.com untuk pertanyaan terkait privasi dan perlindungan data." },
        { sub: "17.3 Alamat", content: "Jl. Contoh No. 123, Jakarta, Indonesia. Kami siap membantu Anda dengan segala pertanyaan terkait privasi." }
      ]
    }
  ];

  const [privacyContent, setPrivacyContent] = useState(defaultPrivacyContent);

  // Load saved content from Firestore
  const loadContentFromFirestore = async () => {
    if (!db) return;
    try {
      const docRef = doc(db, "settings", "privacyPolicy");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.content) {
          setPrivacyContent(data.content);
        }
        if (data.lastUpdate) {
          setLastUpdate(data.lastUpdate);
        }
        if (data.authorName) {
          setAuthorName(data.authorName);
        }
        if (data.authorEmail) {
          setAuthorEmail(data.authorEmail);
          setIsAuthorVerified(data.authorEmail === ADMIN_EMAIL);
        }
      } else {
        // Set default date
        const now = new Date();
        setLastUpdate(now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }));
        setAuthorName("Admin");
        setAuthorEmail("admin@menuru.com");
      }
    } catch (error) {
      console.error("Error loading privacy content:", error);
      const now = new Date();
      setLastUpdate(now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }));
    }
  };

  // Save content to Firestore
  const saveContentToFirestore = async (newContent: any) => {
    if (!db || !isAdmin) return;
    try {
      const docRef = doc(db, "settings", "privacyPolicy");
      const now = new Date();
      const dateStr = now.toLocaleDateString('id-ID', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
      const userEmail = user?.email || "admin@menuru.com";
      const userName = user?.displayName || user?.email || "Admin";
      
      await setDoc(docRef, {
        content: newContent,
        lastUpdate: dateStr,
        authorName: userName,
        authorEmail: userEmail,
        updatedAt: serverTimestamp()
      });
      
      setLastUpdate(dateStr);
      setAuthorName(userName);
      setAuthorEmail(userEmail);
      setIsAuthorVerified(userEmail === ADMIN_EMAIL);
      setIsEditing(false);
      alert("Konten Privacy Policy berhasil disimpan!");
    } catch (error) {
      console.error("Error saving privacy content:", error);
      alert("Gagal menyimpan konten. Silakan coba lagi.");
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auth
  useEffect(() => {
    if (!auth || !isMounted) return;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        const isAdminUser = currentUser.email === ADMIN_EMAIL;
        setIsAdmin(isAdminUser);
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

  // Load content after auth and mount
  useEffect(() => {
    if (!isMounted || loading) return;
    loadContentFromFirestore();
  }, [isMounted, loading]);

  // Preloader
  useEffect(() => {
    if (!isMounted || loading) return;
    setTimeout(() => {
      // Preloader akan selesai setelah animasi
    }, 500);
  }, [isMounted, loading]);

  // GSAP animation for menu drawer opening
  useEffect(() => {
    if (!menuOverlayRef.current || !isMounted || loading || !showMain) return;
    
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
  }, [isMenuOpen, isMounted, loading, showMain]);

  // Scroll detection for sidebar
  useEffect(() => {
    if (!showMain || !isMounted || loading) return;
    
    const handleScroll = () => {
      for (let i = privacyContent.length - 1; i >= 0; i--) {
        const number = String(i + 1).padStart(2, '0');
        const element = document.getElementById(`section-${number}`);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 250) {
            setActiveSection(i);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    setTimeout(handleScroll, 500);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showMain, isMounted, loading, privacyContent]);

  // Handle preloader complete
  const handlePreloaderComplete = () => {
    setShowMain(true);
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 200);
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

  // Handle content edit
  const handleContentChange = (sectionIndex: number, subIndex: number, field: 'sub' | 'content', value: string) => {
    const newContent = [...privacyContent];
    newContent[sectionIndex].subs[subIndex][field] = value;
    setPrivacyContent(newContent);
  };

  const handleTitleChange = (sectionIndex: number, value: string) => {
    const newContent = [...privacyContent];
    newContent[sectionIndex].title = value;
    setPrivacyContent(newContent);
  };

  const handleSaveContent = () => {
    saveContentToFirestore(privacyContent);
  };

  // Scroll to section
  const scrollToSection = (index: number) => {
    const number = String(index + 1).padStart(2, '0');
    const element = document.getElementById(`section-${number}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Loading state
  if (!isMounted || loading) {
    return <Preloader onComplete={handlePreloaderComplete} />;
  }

  if (!showMain) {
    return <Preloader onComplete={handlePreloaderComplete} />;
  }

  return (
    <>
      <Head>
        <title>Kebijakan Privasi | Menuru</title>
        <meta name="description" content="Kebijakan Privasi Menuru - Perlindungan data pribadi Anda" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link rel="icon" href="/images/ai.jpg" type="image/jpeg" />
      </Head>

      <style jsx global>{`
        body {
          overflow-y: scroll;
          scrollbar-width: none;
          -ms-overflow-style: none;
          scroll-behavior: smooth;
          margin: 0;
          padding: 0;
          background-color: #ffffff !important;
        }
        body::-webkit-scrollbar {
          display: none;
        }
        * {
          scrollbar-width: none;
        }
        *::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div
        ref={containerRef}
        style={{
          minHeight: "100vh",
          backgroundColor: "#ffffff",
          margin: 0,
          padding: 0,
          position: "relative",
          fontFamily: FONT_FAMILY,
          overflowX: "hidden",
          overflowY: "auto",
        }}
      >
        {/* ===== HEADER / NAVBAR ===== */}
        <div style={{
          position: "fixed",
          top: "40px",
          left: "40px",
          right: "40px",
          zIndex: 101,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pointerEvents: "none",
        }}>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "16px", 
            pointerEvents: "auto",
            opacity: isMenuOpen ? 0 : 1,
            transition: "opacity 0.3s ease",
          }}>
            <Link href="/" passHref style={{ textDecoration: "none" }}>
              <h1
                style={{
                  fontSize: "48px",
                  fontWeight: 700,
                  color: "#000000",
                  fontFamily: FONT_FAMILY,
                  letterSpacing: "-0.03em",
                  margin: 0,
                  padding: 0,
                  lineHeight: 1,
                  cursor: "pointer",
                  background: "transparent",
                }}
              >
                Menuru
              </h1>
            </Link>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "8px",
              padding: "0 16px",
              borderRadius: "12px",
              backgroundColor: isMenuOpen ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0)",
              backdropFilter: isMenuOpen ? "blur(20px)" : "blur(0px)",
              transition: "all 0.3s ease",
              pointerEvents: "auto",
              boxShadow: isMenuOpen ? "0 4px 20px rgba(0,0,0,0.1)" : "none",
              position: "relative",
              zIndex: 102,
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
                  <ShoppingBag size={20} />
                  <span style={{ fontSize: "16px", fontWeight: 500, color: "#0D3CFC", fontFamily: FONT_FAMILY }}>Shop</span>
                </div>
              </Link>
              <Link href="/profile">
                <div style={{ display: "inline-flex", alignItems: "center", cursor: "pointer" }}>
                  <span style={{ fontSize: "16px", fontWeight: 500, color: "#0D3CFC", fontFamily: FONT_FAMILY }}>About</span>
                </div>
              </Link>
              <Link href="/signin">
                <div style={{ display: "inline-flex", alignItems: "center", cursor: "pointer" }}>
                  <span style={{ fontSize: "16px", fontWeight: 500, color: "#0D3CFC", fontFamily: FONT_FAMILY }}>Sign In</span>
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
                <ShieldCheck size={28} />
                <span style={{ fontSize: "30px", fontWeight: 500, color: "#0D3CFC", fontFamily: FONT_FAMILY, lineHeight: 1 }}>Anti-Fraud</span>
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "0" }}>
                <ShieldCheck size={28} />
                <span style={{ fontSize: "30px", fontWeight: 500, color: "#0D3CFC", fontFamily: FONT_FAMILY, lineHeight: 1 }}>Anti-Bot</span>
              </div>
              <Link href="/contact">
                <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", border: "2px solid #0D3CFC", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", backgroundColor: "transparent" }}>
                  <span style={{ fontSize: "16px", fontWeight: 500, color: "#0D3CFC", fontFamily: FONT_FAMILY }}>Get in touch</span>
                  <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", backgroundColor: "#0D3CFC", borderRadius: "4px", padding: "4px", color: "#ffffff" }}>
                    <SouthEastArrow size={24} />
                  </div>
                </div>
              </Link>
              <Link href="/pusat-bantuan">
                <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", border: "2px solid #000000", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", backgroundColor: "transparent" }}>
                  <span style={{ fontSize: "16px", fontWeight: 500, color: "#000000", fontFamily: FONT_FAMILY }}>Pusat Bantuan</span>
                  <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", backgroundColor: "#000000", borderRadius: "4px", padding: "4px", color: "#ffffff" }}>
                    <NorthWestArrow size={24} />
                  </div>
                </div>
              </Link>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", border: "2px solid #000000", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", backgroundColor: "transparent" }} onClick={toggleMenu}>
                <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", backgroundColor: "#000000", borderRadius: "4px", padding: "4px", color: "#ffffff" }}>
                  <span ref={plusIconRef} style={{ fontSize: isMenuOpen ? "24px" : "28px", fontWeight: isMenuOpen ? 400 : 300, fontFamily: FONT_FAMILY, lineHeight: 1, display: "inline-block" }}>
                    {isMenuOpen ? "✕" : "+"}
                  </span>
                </div>
                <span style={{ fontSize: "16px", fontWeight: 500, color: "#000000", fontFamily: FONT_FAMILY, letterSpacing: "0.02em" }}>
                  {isMenuOpen ? "Close" : "Menu"}
                </span>
              </div>
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
            zIndex: 100,
            display: isMenuOpen ? "flex" : "none",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "flex-start",
            transform: "translateY(-100%)",
            opacity: 0,
            pointerEvents: isMenuOpen ? "auto" : "none",
            padding: "40px",
          }}
        >
          <h1
            style={{
              fontSize: "48px",
              fontWeight: 700,
              color: "#ffffff",
              fontFamily: FONT_FAMILY,
              letterSpacing: "-0.03em",
              margin: 0,
              padding: 0,
              lineHeight: 1,
              opacity: 0.9,
              position: "absolute",
              top: "40px",
              left: "40px",
            }}
          >
            Menuru
          </h1>
        </div>

        {/* ===== SIDEBAR NAVIGATION ===== */}
        <SidebarNav activeIndex={activeSection} sections={privacyContent} />

        {/* ===== KONTEN PRIVACY POLICY ===== */}
        <div style={{
          marginTop: "180px",
          padding: "0 40px 40px",
          paddingLeft: "180px",
          width: "100%",
          maxWidth: "1400px",
          marginLeft: "auto",
          marginRight: "auto",
          paddingBottom: "80px",
          position: "relative",
          zIndex: 1,
        }}>
          <motion.h1
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "power3.out" }}
            style={{
              fontSize: "200px",
              fontWeight: 700,
              color: "#0D3CFC",
              fontFamily: FONT_FAMILY,
              letterSpacing: "-0.05em",
              lineHeight: 1,
              margin: "0 0 10px 0",
              textAlign: "left",
              wordBreak: "break-word",
            }}
          >
            Privacy Policy
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{
              fontSize: "18px",
              color: "#0D3CFC",
              fontFamily: FONT_FAMILY,
              marginBottom: "8px",
              textAlign: "left",
              fontWeight: 400,
            }}
          >
            Last Update: {lastUpdate || "Belum diperbarui"}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{
              fontSize: "18px",
              color: "#0D3CFC",
              fontFamily: FONT_FAMILY,
              marginBottom: "40px",
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            <span>Author by</span>
            <span style={{ fontWeight: 600 }}>
              {authorName || "Admin"}
            </span>
            {isAuthorVerified && <InstagramVerifiedBadge size={18} />}
            <span style={{ fontSize: "14px", color: "#666" }}>
              ({authorEmail || "admin@menuru.com"})
            </span>
            {isAdmin && (
              <button
                onClick={() => {
                  if (isEditing) {
                    handleSaveContent();
                  } else {
                    setIsEditing(true);
                  }
                }}
                style={{
                  marginLeft: "16px",
                  padding: "6px 16px",
                  backgroundColor: isEditing ? "#22c55e" : "#0D3CFC",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: FONT_FAMILY,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "0.8";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                }}
              >
                {isEditing ? (
                  <>
                    <SaveIcon size={16} />
                    <span>Simpan</span>
                  </>
                ) : (
                  <>
                    <EditIcon size={16} />
                    <span>Edit</span>
                  </>
                )}
              </button>
            )}
            {isAdmin && isEditing && (
              <span style={{
                fontSize: "14px",
                color: "#ef4444",
                fontWeight: 500,
                marginLeft: "8px",
              }}>
                * Mode Edit Aktif
              </span>
            )}
          </motion.div>

          {privacyContent.map((section, index) => {
            const number = String(index + 1).padStart(2, '0');
            return (
              <motion.div
                key={index}
                id={`section-${number}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.05 }}
                style={{ marginBottom: "50px" }}
              >
                {isEditing && isAdmin ? (
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => handleTitleChange(index, e.target.value)}
                    style={{
                      fontSize: "70px",
                      fontWeight: 700,
                      color: "#0D3CFC",
                      fontFamily: FONT_FAMILY,
                      letterSpacing: "-0.03em",
                      lineHeight: 1.2,
                      marginBottom: "24px",
                      border: "2px solid #0D3CFC",
                      borderRadius: "8px",
                      padding: "8px 16px",
                      width: "100%",
                      backgroundColor: "rgba(13,60,252,0.05)",
                      outline: "none",
                    }}
                  />
                ) : (
                  <h2 style={{
                    fontSize: "70px",
                    fontWeight: 700,
                    color: "#0D3CFC",
                    fontFamily: FONT_FAMILY,
                    letterSpacing: "-0.03em",
                    lineHeight: 1.2,
                    margin: "0 0 20px 0",
                    textAlign: "left",
                    wordBreak: "break-word",
                  }}>
                    {number}. {section.title}
                  </h2>
                )}
                {section.subs.map((sub, subIndex) => (
                  <div key={subIndex} style={{ marginBottom: "20px" }}>
                    {isEditing && isAdmin ? (
                      <>
                        <input
                          type="text"
                          value={sub.sub}
                          onChange={(e) => handleContentChange(index, subIndex, 'sub', e.target.value)}
                          style={{
                            fontSize: "24px",
                            fontWeight: 600,
                            color: "#0D3CFC",
                            fontFamily: FONT_FAMILY,
                            marginBottom: "8px",
                            border: "2px solid #0D3CFC",
                            borderRadius: "8px",
                            padding: "6px 12px",
                            width: "100%",
                            backgroundColor: "rgba(13,60,252,0.05)",
                            outline: "none",
                          }}
                        />
                        <textarea
                          value={sub.content}
                          onChange={(e) => handleContentChange(index, subIndex, 'content', e.target.value)}
                          style={{
                            fontSize: "18px",
                            lineHeight: "1.8",
                            color: "#333",
                            fontFamily: FONT_FAMILY,
                            marginBottom: 0,
                            padding: "12px 16px",
                            paddingLeft: "20px",
                            border: "2px solid #0D3CFC",
                            borderRadius: "8px",
                            width: "100%",
                            minHeight: "80px",
                            backgroundColor: "rgba(13,60,252,0.05)",
                            outline: "none",
                            resize: "vertical",
                          }}
                        />
                      </>
                    ) : (
                      <>
                        <h3 style={{
                          fontSize: "24px",
                          fontWeight: 600,
                          color: "#0D3CFC",
                          fontFamily: FONT_FAMILY,
                          marginBottom: "8px",
                        }}>
                          {sub.sub}
                        </h3>
                        <p style={{
                          fontSize: "18px",
                          lineHeight: "1.8",
                          color: "#333",
                          fontFamily: FONT_FAMILY,
                          marginBottom: 0,
                          paddingLeft: "20px",
                        }}>
                          {sub.content}
                        </p>
                      </>
                    )}
                  </div>
                ))}
              </motion.div>
            );
          })}

          {/* ===== LIVE CHAT AGENT ===== */}
          <LiveChatAgent 
            user={user} 
            isAdmin={isAdmin} 
            db={db} 
            auth={auth} 
          />

          {/* ===== FOOTER with Images ===== */}
          <div
            style={{
              width: "100%",
              padding: "60px 0 40px 0",
              backgroundColor: "#ffffff",
              borderTop: "1px solid rgba(0,0,0,0.05)",
              marginTop: "40px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Foto Kiri */}
            <div
              style={{
                position: "absolute",
                left: "0px",
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
                right: "0px",
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
                paddingLeft: "40px",
                paddingRight: "40px",
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
                    {section.links.map((link, linkIdx) => (
                      <span
                        key={linkIdx}
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
                    ))}
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
        </div>
      </div>
    </>
  );
}
