'use client';

import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, collection, query, where, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, orderBy, getDoc, setDoc } from "firebase/firestore";
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

const EditIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SaveIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16L21 8V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 21V13H7V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 3V8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Instagram Verified Badge
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

// ===== PRELOADER - 1x putaran Shop dan Note =====
const Preloader = ({ onComplete }: { onComplete: () => void }) => {
  const preloaderRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const animationDoneRef = useRef(false);

  useEffect(() => {
    if (animationDoneRef.current) return;
    animationDoneRef.current = true;

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

    // Shop muncul 1x
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
    // Note muncul 1x
    .to(textRef.current, {
      y: 0,
      opacity: 1,
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
          Shop
        </span>
      </div>
    </div>
  );
};

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
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: any;
  read: boolean;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatMessagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const liveChatTitleRef = useRef<HTMLDivElement>(null);

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
  }, []);

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
  }, [db, user, isAdmin, selectedTicket, isMounted]);

  useEffect(() => {
    if (!db || !selectedTicket || !isMounted) return;
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
    const activeTicket = tickets.find(t => t.status === 'waiting' || t.status === 'active');
    if (activeTicket) {
      setSelectedTicket(activeTicket);
    } else if (tickets.length > 0 && !selectedTicket) {
      setSelectedTicket(tickets[0]);
    } else if (tickets.length === 0) {
      setSelectedTicket(null);
      setMessages([]);
    }
  }, [tickets, user, isAdmin, selectedTicket, isMounted]);

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

  if (!isAdmin) {
    const activeTicket = tickets.find(t => t.status === 'waiting' || t.status === 'active');

    if (tickets.length === 0 && !showStartChat) {
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
              }}>{tickets.length}</span>
            </div>
            <div style={{ overflowY: "auto", height: "340px" }}>
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
                    </div>
                  </div>
                );
              })}
              {tickets.length === 0 && (
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
                            <div>{msg.text}</div>
                            <div style={{ 
                              fontSize: "6px", 
                              color: isMine ? "rgba(255,255,255,0.6)" : "#999", 
                              marginTop: "2px",
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
                          <div>{msg.text}</div>
                          <div style={{ 
                            fontSize: "6px", 
                            color: isMine ? "rgba(255,255,255,0.6)" : "#999", 
                            marginTop: "2px",
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
              Pilih chat dari daftar di kiri            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ===== MAIN PAGE COMPONENT =====
export default function PrivacyPolicyPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showMain, setShowMain] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [isAuthorVerified, setIsAuthorVerified] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  
  const preloaderRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);
  const navbarRef = useRef<HTMLDivElement>(null);
  const plusIconRef = useRef<HTMLSpanElement>(null);
  const menuOverlayRef = useRef<HTMLDivElement>(null);
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
  const sidebarRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Default Privacy Policy Content - 17 section
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
  useEffect(() => {
    if (!db || !isMounted) return;
    const loadContent = async () => {
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
          if (data.adminName) {
            setAdminName(data.adminName);
          }
          if (data.adminEmail) {
            setAdminEmail(data.adminEmail);
          }
          if (data.adminEmail === ADMIN_EMAIL) {
            setIsAuthorVerified(true);
          }
        }
        if (!lastUpdate) {
          const now = new Date();
          setLastUpdate(now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }));
        }
        if (!adminName) {
          setAdminName("Farid Ardiansyah");
        }
        if (!adminEmail) {
          setAdminEmail(ADMIN_EMAIL);
        }
      } catch (error) {
        console.error("Error loading privacy content:", error);
        const now = new Date();
        setLastUpdate(now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }));
        setAdminName("Farid Ardiansyah");
        setAdminEmail(ADMIN_EMAIL);
      }
    };
    loadContent();
  }, [db, isMounted]);

  // Save content to Firestore
  const saveContent = async () => {
    if (!db || !isAdmin) return;
    try {
      const docRef = doc(db, "settings", "privacyPolicy");
      const now = new Date();
      const dateStr = now.toLocaleDateString('id-ID', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      await setDoc(docRef, {
        content: privacyContent,
        lastUpdate: dateStr,
        adminName: user?.displayName || "Farid Ardiansyah",
        adminEmail: user?.email || ADMIN_EMAIL,
        updatedAt: serverTimestamp()
      });
      setLastUpdate(dateStr);
      setAdminName(user?.displayName || "Farid Ardiansyah");
      setAdminEmail(user?.email || ADMIN_EMAIL);
      setIsAuthorVerified(user?.email === ADMIN_EMAIL);
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
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              id: currentUser.uid,
              name: currentUser.displayName || currentUser.email || "",
              email: currentUser.email || "",
              photoURL: currentUser.photoURL || "",
              createdAt: serverTimestamp(),
              isAdmin: isAdminUser,
              online: true,
              lastSeen: serverTimestamp(),
              typing: false,
              blocked: [],
              blockedBy: []
            });
          } else {
            await updateDoc(userRef, {
              online: true,
              lastSeen: serverTimestamp(),
            });
          }
        } catch (error) {
          console.error("Error updating user:", error);
        }
      }
    });
    return () => unsubscribe();
  }, [isMounted]);

  // Handle preloader complete
  const handlePreloaderComplete = () => {
    setShowMain(true);
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 200);
  };

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
  }, [isMenuOpen, isMounted, loading, showMain]);

  // Scroll spy untuk sidebar - mendeteksi judul dan sub judul (scroll bawah dan atas)
  useEffect(() => {
    if (!isMounted || loading || !showMain) return;

    const handleScroll = () => {
      const sectionElements = sectionRefs.current;
      const scrollPosition = window.scrollY + 150;

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const section = sectionElements[i];
        if (section) {
          const offsetTop = section.offsetTop;
          if (scrollPosition >= offsetTop) {
            setActiveSection(i);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMounted, loading, showMain, privacyContent]);

  // GSAP animation for content
  useEffect(() => {
    if (!isMounted || loading || !showMain) return;

    // Animasi subtitle
    const subtitle = subtitleRef.current;
    if (subtitle) {
      gsap.fromTo(subtitle,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          delay: 0.3
        }
      );
    }

    // Animasi privacy title
    const privacyTitle = privacyTitleRef.current;
    if (privacyTitle) {
      gsap.fromTo(privacyTitle,
        { opacity: 0, scale: 0.8, y: 30 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 1,
          ease: "back.out(1.7)",
          delay: 0.5
        }
      );
    }

    // Animasi tombol
    const button = buttonRef.current;
    if (button) {
      gsap.fromTo(button,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          delay: 0.6
        }
      );
    }

    // Animasi arrow
    const arrow = arrowRef.current;
    if (arrow) {
      gsap.fromTo(arrow,
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: "back.out(1.7)",
          delay: 0.7
        }
      );
    }

    // Animasi sidebar
    const sidebar = sidebarRef.current;
    if (sidebar) {
      gsap.fromTo(sidebar,
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: "power2.out",
          delay: 0.8
        }
      );
    }

    // Animasi edit button
    const editButton = editButtonRef.current;
    if (editButton && isAdmin) {
      gsap.fromTo(editButton,
        { opacity: 0, x: 20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          ease: "power2.out",
          delay: 0.9
        }
      );
    }

    // GSAP SplitText + ScrollTrigger for "Menuru" at bottom
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
  }, [isMounted, loading, showMain, isAdmin]);

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

  // Scroll ke section
  const scrollToSection = (index: number) => {
    const section = sectionRefs.current[index];
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Menu items
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
    { title: "Get in Touch", links: ["Contact Us", "Instagram", "Live Chat"] },
    { title: "Product", links: ["Shop", "Note", "Calendar", "Blog", "Donation", "Community", "Live Chat Agent"] },
    { title: "Attention", links: ["Kebijakan Privasi", "Ketentuan Kami", "Pusat Bantuan"] }
  ];

  // Jika belum siap, tampilkan preloader
  if (!isMounted || loading || !showMain) {
    return <Preloader onComplete={handlePreloaderComplete} />;
  }

  return (
    <>
      <Head>
        <title>Kebijakan Privasi | Menuru</title>
        <meta name="description" content="Kebijakan Privasi Menuru - Perlindungan data pribadi Anda" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#0D3CFC" />
        <link rel="icon" href="/images/ai.jpg" type="image/jpeg" />
      </Head>

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

        .content-section {
          opacity: 1;
        }

        .sub-section {
          opacity: 1;
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

        .sidebar-scroll {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        .sidebar-scroll::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
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
          /* Sidebar hidden on mobile */
          .sidebar-scroll {
            display: none !important;
          }
          /* Content margin di mobile */
          .content-with-sidebar {
            margin-left: 0 !important;
            padding: 0 16px !important;
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
          /* Sidebar hidden on mobile */
          .sidebar-scroll {
            display: none !important;
          }
          /* Content margin di mobile */
          .content-with-sidebar {
            margin-left: 0 !important;
            padding: 0 12px !important;
          }
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
          overflow: "visible",
        }}
      >
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

        {/* HERO SECTION */}
        <div
          style={{
            minHeight: "auto",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            padding: "40px",
            backgroundColor: "#ffffff",
            position: "relative",
            paddingTop: "120px",
            paddingBottom: "20px",
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
            marginTop: "0px",
          }}>
            <div
              ref={subtitleRef}
              style={{
                textAlign: "left",
                position: "relative",
                opacity: 0,
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
                  paddingBottom: "20px",
                  whiteSpace: "pre-line",
                }}
              >
                {`You can take notes, find ideas,\nand donate money to those in need`}
              </p>
            </div>

            {/* Tombol Let's build now dan Arrow */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "10px", position: "relative" }}>
              <div
                ref={buttonRef}
                style={{
                  display: "inline-block",
                  border: "2px solid #0D3CFC",
                  borderRadius: "8px",
                  padding: "12px 28px",
                  cursor: "pointer",
                  backgroundColor: "transparent",
                  opacity: 0,
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
                  opacity: 0,
                }}
              >
                <NorthEastArrow size={24} color="#ffffff" />
              </div>

              {/* Tombol Edit untuk Admin */}
              {isAdmin && (
                <div
                  ref={editButtonRef}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 16px",
                    border: "2px solid #0D3CFC",
                    borderRadius: "8px",
                    cursor: "pointer",
                    backgroundColor: isEditing ? "#0D3CFC" : "transparent",
                    color: isEditing ? "#ffffff" : "#0D3CFC",
                    opacity: 0,
                    marginLeft: "auto",
                  }}
                  onClick={() => {
                    if (isEditing) {
                      saveContent();
                    } else {
                      setIsEditing(true);
                    }
                  }}
                >
                  {isEditing ? (
                    <>
                      <SaveIcon size={18} color="#ffffff" />
                      <span style={{ fontSize: "16px", fontWeight: 500 }}>Simpan</span>
                    </>
                  ) : (
                    <>
                      <EditIcon size={18} color="#0D3CFC" />
                      <span style={{ fontSize: "16px", fontWeight: 500 }}>Edit</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* PRIVACY POLICY TITLE - 250px */}
            <div
              ref={privacyTitleRef}
              style={{
                width: "100%",
                padding: "20px 0 10px 0",
                backgroundColor: "#ffffff",
                overflow: "hidden",
                display: "flex",
                justifyContent: "flex-start",
                opacity: 0,
              }}
            >
              <span
                style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: "250px",
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
                Privacy Policy
              </span>
            </div>
          </div>
        </div>

        {/* CONTENT WITH SIDEBAR - Sidebar fixed di kiri bawah */}
        <div style={{
          display: "flex",
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "0 40px",
          gap: "40px",
          marginTop: "0px",
          position: "relative",
        }}>
          {/* SIDEBAR - KIRI - Fixed position, turun ke bawah */}
          <div
            ref={sidebarRef}
            style={{
              width: "280px",
              flexShrink: 0,
              position: "fixed",
              top: "55%",
              left: "40px",
              transform: "translateY(-50%)",
              paddingRight: "20px",
              opacity: 0,
              maxHeight: "65vh",
              overflowY: "auto",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              zIndex: 40,
            }}
            className="sidebar-scroll"
          >
            <style>{`
              .sidebar-scroll::-webkit-scrollbar {
                display: none !important;
                width: 0 !important;
                height: 0 !important;
              }
            `}</style>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {privacyContent.map((section, index) => (
                <div key={index}>
                  {/* Judul Utama */}
                  <div
                    onClick={() => scrollToSection(index)}
                    style={{
                      padding: "6px 0",
                      cursor: "pointer",
                      fontFamily: FONT_FAMILY,
                      fontSize: activeSection === index ? "18px" : "15px",
                      fontWeight: activeSection === index ? 700 : 400,
                      color: activeSection === index ? "#0D3CFC" : "#444",
                      transition: "color 0.2s ease, font-size 0.2s ease",
                    }}
                  >
                    {index + 1}. {section.title}
                  </div>
                  {/* Sub Judul */}
                  {section.subs?.map((sub, subIdx) => (
                    <div
                      key={`${index}-${subIdx}`}
                      onClick={() => scrollToSection(index)}
                      style={{
                        padding: "3px 0 3px 16px",
                        cursor: "pointer",
                        fontFamily: FONT_FAMILY,
                        fontSize: activeSection === index ? "14px" : "12px",
                        fontWeight: activeSection === index ? 500 : 300,
                        color: activeSection === index ? "#0D3CFC" : "#888",
                        transition: "color 0.2s ease, font-size 0.2s ease",
                      }}
                    >
                      {sub.sub}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* CONTENT - KANAN */}
          <div
            ref={contentRef}
            className="content-with-sidebar"
            style={{
              flex: 1,
              paddingBottom: "60px",
              marginLeft: "320px",
              paddingTop: "0px",
            }}
          >
            {/* Last Update dan Author - Nama Admin bukan email */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "40px",
              fontFamily: FONT_FAMILY,
              flexWrap: "wrap",
              gap: "8px",
            }}>
              <div style={{
                color: "#0D3CFC",
                fontSize: "14px",
                fontStyle: "italic",
                fontWeight: 500,
              }}>
                Last Update: {lastUpdate || "Belum diperbarui"}
              </div>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#666",
                fontSize: "14px",
              }}>
                <span>Author by</span>
                <span style={{ fontWeight: 600, color: "#0D3CFC" }}>
                  {adminName || "Farid Ardiansyah"}
                </span>
                {isAuthorVerified && <InstagramVerifiedBadge size={16} />}
                <span style={{ fontSize: "12px", color: "#999" }}>
                  ({adminEmail || ADMIN_EMAIL})
                </span>
              </div>
              {isAdmin && isEditing && (
                <div style={{
                  color: "#0D3CFC",
                  fontSize: "14px",
                  fontWeight: 500,
                }}>
                  Mode Edit Aktif
                </div>
              )}
            </div>

            {privacyContent.map((section, index) => (
              <div
                key={index}
                ref={(el) => {
                  sectionRefs.current[index] = el;
                }}
                id={`section-${index}`}
                className="content-section"
                style={{
                  marginBottom: "50px",
                  scrollMarginTop: "100px",
                }}
              >
                {isEditing && isAdmin ? (
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => handleTitleChange(index, e.target.value)}
                    style={{
                      fontSize: "36px",
                      fontWeight: 700,
                      color: "#0D3CFC",
                      fontFamily: FONT_FAMILY,
                      marginBottom: "24px",
                      letterSpacing: "-0.02em",
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
                    fontSize: "36px",
                    fontWeight: 700,
                    color: "#0D3CFC",
                    fontFamily: FONT_FAMILY,
                    marginBottom: "24px",
                    letterSpacing: "-0.02em",
                  }}>
                    {index + 1}. {section.title}
                  </h2>
                )}
                {section.subs.map((sub, subIndex) => (
                  <div key={subIndex} className="sub-section" style={{ marginBottom: "20px" }}>
                    {isEditing && isAdmin ? (
                      <>
                        <input
                          type="text"
                          value={sub.sub}
                          onChange={(e) => handleContentChange(index, subIndex, 'sub', e.target.value)}
                          style={{
                            fontSize: "22px",
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
                          fontSize: "22px",
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
              </div>
            ))}
          </div>
        </div>

        {/* LIVE CHAT AGENT */}
        <div style={{ padding: "0 40px", maxWidth: "1400px", margin: "0 auto", width: "100%" }}>
          <LiveChatAgent user={user} isAdmin={isAdmin} db={db} auth={auth} />
        </div>

        {/* FOOTER with Images */}
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
    </>
  );
}
