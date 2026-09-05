'use client';

import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, collection, query, where, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, orderBy } from "firebase/firestore";
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
const AGENT_PHOTO = "/images/ai.jpg";
const BROADCAST_NAME = "Broadcast";
const BROADCAST_PHOTO = "/images/ai.jpg";
const ANNOUNCEMENT_NAME = "Pengumuman";
const ANNOUNCEMENT_PHOTO = "/images/ai.jpg";

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

const SendIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SearchIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CheckIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DoubleCheckIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L7 17L2 12M22 6L11 17L7 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Footer links
const footerLinks = [
  { title: "Get in Touch", links: ["Contact Us", "Instagram"] },
  { title: "Product", links: ["Shop", "Note", "Calendar", "Blog", "Donation", "Community", "Live Chat", "Live Chat Agent"] },
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

// ===== PULSING DOTS =====
const PulsingDots = ({ active }: { active: boolean }) => {
  if (!active) return <span style={{ color: '#999', fontSize: '10px' }}>● Offline</span>;
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

// ===== INTERFACE TYPES =====
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
  isBroadcast?: boolean;
  isAnnouncement?: boolean;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  text: string;
  timestamp: any;
  read: boolean;
  isBroadcast?: boolean;
  isAnnouncement?: boolean;
}

// ===== LIVE CHAT AGENT COMPONENT =====
const LiveChatAgent = ({ user, isAdmin, db, auth }: { user: any; isAdmin: boolean; db: any; auth: any }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [showStartChat, setShowStartChat] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [agentOnline, setAgentOnline] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastText, setBroadcastText] = useState("");
  const [broadcastUsers, setBroadcastUsers] = useState<string[]>([]);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [announcementText, setAnnouncementText] = useState("");
  const [announcementUsers, setAnnouncementUsers] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const getUserPhoto = (email?: string, photoURL?: string) => {
    if (photoURL) return photoURL;
    if (email) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}&background=0D3CFC&color=fff&size=128`;
    }
    return `https://ui-avatars.com/api/?name=User&background=0D3CFC&color=fff&size=128`;
  };

  // Load all users for broadcast/announcement
  useEffect(() => {
    if (!db || !isAdmin || !isMounted) return;
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const users: any[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.email !== ADMIN_EMAIL) {
          users.push({ id: doc.id, ...data });
        }
      });
      setAllUsers(users);
    });
    return () => unsubscribe();
  }, [db, isAdmin, isMounted]);

  // Agent online status
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

  // Create Broadcast ticket for all users
  const createBroadcastTicket = async (userId: string, userName: string, userEmail: string, userPhoto?: string) => {
    if (!db) return null;
    try {
      const existing = tickets.find(t => t.isBroadcast && t.userId === userId);
      if (existing) return existing;
      
      const ticketRef = await addDoc(collection(db, "livechat_tickets"), {
        userId: userId,
        userName: userName,
        userEmail: userEmail,
        userPhoto: userPhoto || "",
        status: "active",
        topic: "Broadcast",
        createdAt: serverTimestamp(),
        unreadCount: 0,
        typing: false,
        isBroadcast: true,
        agentId: user?.uid || "",
        agentName: AGENT_NAME,
      });
      
      await addDoc(collection(db, "livechat_tickets", ticketRef.id, "messages"), {
        senderId: "broadcast",
        senderName: BROADCAST_NAME,
        senderPhoto: BROADCAST_PHOTO,
        text: "📢 Selamat datang di Broadcast! Anda akan menerima informasi terbaru.",
        timestamp: serverTimestamp(),
        read: false,
        isBroadcast: true,
      });
      
      return ticketRef;
    } catch (error) {
      console.error("Error creating broadcast ticket:", error);
      return null;
    }
  };

  // Create Announcement ticket for all users
  const createAnnouncementTicket = async (userId: string, userName: string, userEmail: string, userPhoto?: string) => {
    if (!db) return null;
    try {
      const existing = tickets.find(t => t.isAnnouncement && t.userId === userId);
      if (existing) return existing;
      
      const ticketRef = await addDoc(collection(db, "livechat_tickets"), {
        userId: userId,
        userName: userName,
        userEmail: userEmail,
        userPhoto: userPhoto || "",
        status: "active",
        topic: "Pengumuman",
        createdAt: serverTimestamp(),
        unreadCount: 0,
        typing: false,
        isAnnouncement: true,
        agentId: user?.uid || "",
        agentName: AGENT_NAME,
      });
      
      await addDoc(collection(db, "livechat_tickets", ticketRef.id, "messages"), {
        senderId: "announcement",
        senderName: ANNOUNCEMENT_NAME,
        senderPhoto: ANNOUNCEMENT_PHOTO,
        text: "📢 Selamat datang di Pengumuman! Anda akan menerima informasi terbaru.",
        timestamp: serverTimestamp(),
        read: false,
        isAnnouncement: true,
      });
      
      return ticketRef;
    } catch (error) {
      console.error("Error creating announcement ticket:", error);
      return null;
    }
  };

  // Tickets
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
        if (!isAdmin && data.userId !== user.uid) return;
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

  // Auto create broadcast and announcement for user
  useEffect(() => {
    if (!db || !user || isAdmin || !isMounted || tickets.length === 0) return;
    
    const hasBroadcast = tickets.some(t => t.isBroadcast);
    const hasAnnouncement = tickets.some(t => t.isAnnouncement);
    
    if (!hasBroadcast) {
      createBroadcastTicket(user.uid, user.displayName || user.email || "User", user.email, user.photoURL);
    }
    if (!hasAnnouncement) {
      createAnnouncementTicket(user.uid, user.displayName || user.email || "User", user.email, user.photoURL);
    }
  }, [tickets, user, isAdmin, isMounted]);

  // Messages
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
      setTimeout(scrollToBottom, 100);
    });
    
    return () => unsubscribe();
  }, [db, selectedTicket, isMounted]);

  // Mark messages as read
  useEffect(() => {
    if (!db || !selectedTicket || !user || !isAdmin || !isMounted) return;
    const unread = messages.filter(m => m.senderId !== user.uid && !m.read);
    unread.forEach(async (msg) => {
      const msgRef = doc(db, "livechat_tickets", selectedTicket.id, "messages", msg.id);
      await updateDoc(msgRef, { read: true });
    });
  }, [messages, selectedTicket, db, user, isAdmin, isMounted]);

  // Auto-select ticket
  useEffect(() => {
    if (!user || isAdmin || !isMounted || tickets.length === 0) return;
    
    const broadcastTicket = tickets.find(t => t.isBroadcast);
    const announcementTicket = tickets.find(t => t.isAnnouncement);
    const activeTicket = tickets.find(t => t.status === 'waiting' || t.status === 'active');
    
    if (broadcastTicket && !selectedTicket) {
      setSelectedTicket(broadcastTicket);
    } else if (announcementTicket && !selectedTicket) {
      setSelectedTicket(announcementTicket);
    } else if (activeTicket && !selectedTicket) {
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
        senderPhoto: user.photoURL || "",
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
      const senderPhoto = isAdmin ? AGENT_PHOTO : (user.photoURL || "");
      
      await addDoc(collection(db, "livechat_tickets", selectedTicket.id, "messages"), {
        senderId: user.uid,
        senderName: senderName,
        senderPhoto: senderPhoto,
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
    if (!db) return;
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

  // Send Broadcast to selected users
  const sendBroadcast = async () => {
    if (!db || !user || !broadcastText.trim() || broadcastUsers.length === 0) return;
    try {
      for (const userId of broadcastUsers) {
        // Cari ticket user
        const userTicket = tickets.find(t => t.userId === userId && !t.isBroadcast && !t.isAnnouncement);
        if (userTicket) {
          await addDoc(collection(db, "livechat_tickets", userTicket.id, "messages"), {
            senderId: "broadcast",
            senderName: BROADCAST_NAME,
            senderPhoto: BROADCAST_PHOTO,
            text: `📢 ${broadcastText.trim()}`,
            timestamp: serverTimestamp(),
            read: false,
            isBroadcast: true,
          });
          await updateDoc(doc(db, "livechat_tickets", userTicket.id), {
            lastMessage: `📢 ${broadcastText.trim()}`,
            lastMessageTime: serverTimestamp(),
          });
        }
      }
      setBroadcastText("");
      setBroadcastUsers([]);
      setShowBroadcastModal(false);
    } catch (error) {
      console.error("Error sending broadcast:", error);
    }
  };

  // Send Announcement to selected users
  const sendAnnouncement = async () => {
    if (!db || !user || !announcementText.trim() || announcementUsers.length === 0) return;
    try {
      for (const userId of announcementUsers) {
        const userTicket = tickets.find(t => t.userId === userId && !t.isBroadcast && !t.isAnnouncement);
        if (userTicket) {
          await addDoc(collection(db, "livechat_tickets", userTicket.id, "messages"), {
            senderId: "announcement",
            senderName: ANNOUNCEMENT_NAME,
            senderPhoto: ANNOUNCEMENT_PHOTO,
            text: `📢 ${announcementText.trim()}`,
            timestamp: serverTimestamp(),
            read: false,
            isAnnouncement: true,
          });
          await updateDoc(doc(db, "livechat_tickets", userTicket.id), {
            lastMessage: `📢 ${announcementText.trim()}`,
            lastMessageTime: serverTimestamp(),
          });
        }
      }
      setAnnouncementText("");
      setAnnouncementUsers([]);
      setShowAnnouncementModal(false);
    } catch (error) {
      console.error("Error sending announcement:", error);
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

  // Filter tickets with safe check
  const filteredTickets = tickets.filter(ticket => {
    if (!searchQuery || !searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    const userName = (ticket.userName || '').toLowerCase();
    const topic = (ticket.topic || '').toLowerCase();
    const userEmail = (ticket.userEmail || '').toLowerCase();
    return userName.includes(query) || topic.includes(query) || userEmail.includes(query);
  });

  const isMessageRead = (msg: ChatMessage) => {
    if (msg.senderId === user?.uid) return true;
    return msg.read || false;
  };

  if (!isMounted) return <div style={{ minHeight: "100px" }} />;

  // User not logged in
  if (!user) {
    return (
      <div style={{ 
        maxWidth: "1400px", 
        margin: "40px auto", 
        padding: "60px 40px",
        textAlign: "center",
        backgroundColor: "#f8f9ff",
        borderRadius: "20px",
        border: "1px solid rgba(13,60,252,0.1)",
      }}>
        <div style={{ fontSize: "60px", marginBottom: "20px" }}>💬</div>
        <h2 style={{ 
          fontSize: "28px", 
          fontWeight: 600, 
          color: "#0D3CFC", 
          fontFamily: FONT_FAMILY,
          marginBottom: "10px",
        }}>
          Live Chat Agent
        </h2>
        <p style={{ 
          fontSize: "16px", 
          color: "#666", 
          fontFamily: FONT_FAMILY,
          marginBottom: "20px",
        }}>
          Silakan login untuk menggunakan Live Chat Agent
        </p>
        <Link href="/" style={{ textDecoration: "none" }}>
          <button
            style={{
              padding: "10px 30px",
              backgroundColor: "#0D3CFC",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: FONT_FAMILY,
            }}
          >
            Login
          </button>
        </Link>
      </div>
    );
  }

  // USER VIEW
  if (!isAdmin) {
    if (tickets.length === 0 && !showStartChat) {
      return (
        <div style={{ 
          maxWidth: "1400px", 
          margin: "40px auto", 
          padding: "40px",
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          border: "1px solid rgba(13,60,252,0.1)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <h2 style={{ 
                fontSize: "24px", 
                fontWeight: 600, 
                color: "#0D3CFC", 
                fontFamily: FONT_FAMILY,
                margin: 0,
              }}>
                Live Chat Agent
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                <PulsingDots active={agentOnline} />
                <span style={{ fontSize: "12px", color: agentOnline ? "#0D3CFC" : "#999", fontFamily: FONT_FAMILY }}>
                  {agentOnline ? "Agent Online" : "Agent Offline"}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "6px 16px",
                backgroundColor: "transparent",
                color: "#ef4444",
                border: "1px solid #ef4444",
                borderRadius: "6px",
                fontSize: "13px",
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
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 20px",
            backgroundColor: "#f8f9ff",
            borderRadius: "12px",
          }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>💬</div>
            <p style={{ fontSize: "16px", color: "#666", fontFamily: FONT_FAMILY, marginBottom: "16px" }}>
              Butuh bantuan? Chat langsung dengan agent kami.
            </p>
            <button
              onClick={() => setShowStartChat(true)}
              style={{
                padding: "10px 24px",
                backgroundColor: "#0D3CFC",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: FONT_FAMILY,
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Mulai Live Chat</span>
            </button>
          </div>
        </div>
      );
    }

    if (showStartChat) {
      return (
        <div style={{ 
          maxWidth: "1400px", 
          margin: "40px auto", 
          padding: "40px",
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          border: "1px solid rgba(13,60,252,0.1)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ 
              fontSize: "24px", 
              fontWeight: 600, 
              color: "#0D3CFC", 
              fontFamily: FONT_FAMILY,
              margin: 0,
            }}>
              Mulai Chat Baru
            </h2>
            <button
              onClick={handleLogout}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "6px 16px",
                backgroundColor: "transparent",
                color: "#ef4444",
                border: "1px solid #ef4444",
                borderRadius: "6px",
                fontSize: "13px",
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
          <div style={{ maxWidth: "400px", margin: "0 auto" }}>
            <div style={{ fontSize: "14px", marginBottom: "10px", fontFamily: FONT_FAMILY, color: "#333" }}>
              Pilih topik permasalahan Anda:
            </div>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "2px solid #0D3CFC",
                borderRadius: "8px",
                fontSize: "14px",
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
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={startChat}
                disabled={!selectedTopic}
                style={{
                  padding: "8px 20px",
                  backgroundColor: selectedTopic ? "#0D3CFC" : "#ccc",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "14px",
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
                  padding: "8px 20px",
                  backgroundColor: "transparent",
                  color: "#666",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  fontSize: "14px",
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

    // USER CHAT VIEW
    return (
      <div style={{ 
        maxWidth: "1400px", 
        margin: "40px auto", 
        height: "580px",
        backgroundColor: "#ffffff",
        borderRadius: "20px",
        border: "1px solid rgba(13,60,252,0.1)",
        overflow: "hidden",
        display: "flex",
      }}>
        {/* Sidebar */}
        <div style={{
          width: "300px",
          backgroundColor: "#0D3CFC",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
        }}>
          <div style={{
            padding: "14px 18px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <img
                src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email || "User")}&background=ffffff&color=0D3CFC&size=128`}
                alt={user.displayName || "User"}
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: "13px", color: "#ffffff", fontFamily: FONT_FAMILY }}>
                  {user.displayName || user.email || "User"}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <PulsingDots active={agentOnline} />
                  <span style={{ fontSize: "10px", color: agentOnline ? "#a8d5ff" : "#999", fontFamily: FONT_FAMILY }}>
                    {agentOnline ? "Agent Online" : "Offline"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div style={{
            padding: "8px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "rgba(255,255,255,0.12)",
              borderRadius: "8px",
              padding: "5px 12px",
            }}>
              <SearchIcon size={15} color="rgba(255,255,255,0.6)" />
              <input
                type="text"
                placeholder="Cari chat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#fff",
                  fontSize: "12px",
                  fontFamily: FONT_FAMILY,
                }}
              />
            </div>
          </div>
          
          <div style={{ flex: 1, overflowY: "auto" }}>
            {filteredTickets.map((ticket) => {
              const isActive = selectedTicket?.id === ticket.id;
              const isBroadcast = ticket.isBroadcast;
              const isAnnouncement = ticket.isAnnouncement;
              const statusLabel = ticket.status === 'waiting' ? 'Menunggu' :
                                  ticket.status === 'active' ? 'Aktif' : 'Selesai';
              
              let icon = "";
              let name = ticket.userName;
              if (isBroadcast) { icon = "📢 "; name = BROADCAST_NAME; }
              if (isAnnouncement) { icon = "📢 "; name = ANNOUNCEMENT_NAME; }
              
              return (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  style={{
                    padding: "8px 16px",
                    cursor: "pointer",
                    backgroundColor: isActive ? "rgba(255,255,255,0.15)" : "transparent",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <img
                      src={isBroadcast ? BROADCAST_PHOTO : isAnnouncement ? ANNOUNCEMENT_PHOTO : getUserPhoto(ticket.userEmail, ticket.userPhoto)}
                      alt={name}
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ 
                        fontWeight: isActive ? 600 : 500, 
                        fontSize: "12px", 
                        color: "#ffffff", 
                        fontFamily: FONT_FAMILY,
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}>
                        {icon}{name}
                      </div>
                      <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.6)", fontFamily: FONT_FAMILY }}>
                        {ticket.topic}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                        <span style={{
                          fontSize: "7px",
                          backgroundColor: ticket.status === 'waiting' ? "rgba(254,243,199,0.8)" : 
                                          ticket.status === 'active' ? "rgba(209,250,229,0.8)" : "rgba(229,231,235,0.8)",
                          color: ticket.status === 'waiting' ? "#92400e" :
                                 ticket.status === 'active' ? "#065f46" : "#6b7280",
                          padding: "1px 8px",
                          borderRadius: "10px",
                          fontWeight: 500,
                          fontFamily: FONT_FAMILY,
                        }}>
                          {statusLabel}
                        </span>
                        {ticket.lastMessage && (
                          <span style={{ fontSize: "8px", color: "rgba(255,255,255,0.4)", fontFamily: FONT_FAMILY }}>
                            {ticket.lastMessage.substring(0, 18)}{ticket.lastMessage.length > 18 ? "..." : ""}
                          </span>
                        )}
                      </div>
                    </div>
                    {ticket.status === 'active' && (
                      <div style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        backgroundColor: "#22c55e",
                        flexShrink: 0,
                      }} />
                    )}
                  </div>
                </div>
              );
            })}
            {filteredTickets.length === 0 && (
              <div style={{ padding: "30px 20px", textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: "12px", fontFamily: FONT_FAMILY }}>
                Tidak ada chat
              </div>
            )}
          </div>
          
          <div style={{
            padding: "10px 16px",
            borderTop: "1px solid rgba(255,255,255,0.1)",
          }}>
            <button
              onClick={() => setShowStartChat(true)}
              style={{
                width: "100%",
                padding: "6px",
                backgroundColor: "rgba(255,255,255,0.12)",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: FONT_FAMILY,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.12)"}
            >
              + Chat Baru
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", backgroundColor: "#f0f2f5" }}>
          {selectedTicket ? (
            <>
              <div style={{
                padding: "10px 20px",
                backgroundColor: "#ffffff",
                borderBottom: "1px solid #e8e8e8",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexShrink: 0,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <img
                    src={selectedTicket.isBroadcast ? BROADCAST_PHOTO : selectedTicket.isAnnouncement ? ANNOUNCEMENT_PHOTO : getUserPhoto(selectedTicket.userEmail, selectedTicket.userPhoto)}
                    alt={selectedTicket.isBroadcast ? BROADCAST_NAME : selectedTicket.isAnnouncement ? ANNOUNCEMENT_NAME : selectedTicket.userName}
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "13px", color: "#0D3CFC", fontFamily: FONT_FAMILY }}>
                      {selectedTicket.isBroadcast ? "📢 " + BROADCAST_NAME : selectedTicket.isAnnouncement ? "📢 " + ANNOUNCEMENT_NAME : selectedTicket.userName}
                    </div>
                    <div style={{ fontSize: "10px", color: "#666", fontFamily: FONT_FAMILY }}>
                      {selectedTicket.topic} • {generateTicketId(selectedTicket.createdAt)}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{
                    fontSize: "9px",
                    backgroundColor: selectedTicket.status === 'waiting' ? "#fef3c7" : 
                                    selectedTicket.status === 'active' ? "#d1fae5" : "#e5e7eb",
                    color: selectedTicket.status === 'waiting' ? "#92400e" :
                           selectedTicket.status === 'active' ? "#065f46" : "#6b7280",
                    padding: "2px 12px",
                    borderRadius: "10px",
                    fontWeight: 500,
                    fontFamily: FONT_FAMILY,
                  }}>
                    {selectedTicket.status === 'waiting' ? 'Menunggu' : 
                     selectedTicket.status === 'active' ? 'Aktif' : 'Selesai'}
                  </span>
                  {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && !selectedTicket.isBroadcast && !selectedTicket.isAnnouncement && (
                    <button
                      onClick={() => resolveTicket(selectedTicket.id)}
                      style={{
                        padding: "3px 12px",
                        backgroundColor: "#0D3CFC",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "10px",
                        cursor: "pointer",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      Selesaikan
                    </button>
                  )}
                </div>
              </div>

              <div 
                ref={chatContainerRef}
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "16px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                {messages.length === 0 ? (
                  <div style={{ textAlign: "center", color: "#999", fontSize: "13px", padding: "40px 0", fontFamily: FONT_FAMILY }}>
                    Belum ada pesan
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMine = msg.senderId === user?.uid;
                    const isBroadcast = msg.isBroadcast;
                    const isAnnouncement = msg.isAnnouncement;
                    const isRead = isMessageRead(msg);
                    
                    if (isBroadcast || isAnnouncement) {
                      const label = isBroadcast ? BROADCAST_NAME : ANNOUNCEMENT_NAME;
                      return (
                        <div
                          key={idx}
                          style={{
                            alignSelf: "flex-start",
                            maxWidth: "80%",
                            padding: "8px 16px",
                            borderRadius: "12px",
                            backgroundColor: "#0D3CFC",
                            color: "#ffffff",
                            fontSize: "13px",
                            fontFamily: FONT_FAMILY,
                          }}
                        >
                          <div style={{ 
                            fontSize: "10px", 
                            fontWeight: 600, 
                            color: "rgba(255,255,255,0.7)", 
                            marginBottom: "4px", 
                            fontFamily: FONT_FAMILY,
                          }}>
                            📢 {label}
                          </div>
                          <div>{msg.text}</div>
                          <div style={{ 
                            fontSize: "9px", 
                            color: "rgba(255,255,255,0.5)", 
                            marginTop: "4px",
                            textAlign: "right",
                            fontFamily: FONT_FAMILY,
                          }}>
                            {formatTime(msg.timestamp)}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={idx}
                        style={{
                          alignSelf: isMine ? "flex-end" : "flex-start",
                          maxWidth: "70%",
                          display: "flex",
                          alignItems: "flex-end",
                          gap: "6px",
                        }}
                      >
                        {!isMine && (
                          <img
                            src={msg.senderPhoto || getUserPhoto(undefined, undefined)}
                            alt={msg.senderName}
                            style={{
                              width: "26px",
                              height: "26px",
                              borderRadius: "50%",
                              objectFit: "cover",
                              flexShrink: 0,
                            }}
                          />
                        )}
                        <div
                          style={{
                            padding: "8px 14px",
                            borderRadius: "12px",
                            backgroundColor: isMine ? "#0D3CFC" : "#ffffff",
                            color: isMine ? "#fff" : "#000",
                            fontSize: "13px",
                            fontFamily: FONT_FAMILY,
                            wordBreak: "break-word",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                            border: !isMine ? "1px solid #e8e8e8" : "none",
                            maxWidth: "100%",
                          }}
                        >
                          {!isMine && (
                            <div style={{ 
                              fontSize: "9px", 
                              fontWeight: 500, 
                              color: "#0D3CFC", 
                              marginBottom: "2px", 
                              fontFamily: FONT_FAMILY,
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}>
                              {msg.senderName}
                              {msg.senderName === AGENT_NAME && <InstagramVerifiedBadge size={8} />}
                            </div>
                          )}
                          <div>{msg.text}</div>
                          <div style={{ 
                            fontSize: "9px", 
                            color: isMine ? "rgba(255,255,255,0.6)" : "#999", 
                            marginTop: "4px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            gap: "4px",
                            fontFamily: FONT_FAMILY,
                          }}>
                            {formatTime(msg.timestamp)}
                            {isMine && (
                              isRead ? (
                                <DoubleCheckIcon size={12} color="rgba(255,255,255,0.6)" />
                              ) : (
                                <CheckIcon size={12} color="rgba(255,255,255,0.4)" />
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                {getTypingText(selectedTicket) && selectedTicket.status !== 'resolved' && (
                  <div style={{
                    alignSelf: "flex-start",
                    fontSize: "11px",
                    color: "#666",
                    fontStyle: "italic",
                    padding: "4px 12px",
                    fontFamily: FONT_FAMILY,
                  }}>
                    {getTypingText(selectedTicket)}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                <div style={{
                  padding: "10px 20px",
                  borderTop: "1px solid #e8e8e8",
                  backgroundColor: "#ffffff",
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
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
                    placeholder="Ketik pesan..."
                    style={{
                      flex: 1,
                      padding: "8px 16px",
                      border: "1px solid #e8e8e8",
                      borderRadius: "24px",
                      fontSize: "13px",
                      outline: "none",
                      fontFamily: FONT_FAMILY,
                      backgroundColor: "#f8f9ff",
                      transition: "border-color 0.2s ease",
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = "#0D3CFC"}
                    onBlur={(e) => e.currentTarget.style.borderColor = "#e8e8e8"}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!messageText.trim()}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: messageText.trim() ? "#0D3CFC" : "#ccc",
                      color: "#fff",
                      border: "none",
                      borderRadius: "24px",
                      cursor: messageText.trim() ? "pointer" : "not-allowed",
                      fontFamily: FONT_FAMILY,
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "13px",
                      fontWeight: 500,
                      transition: "all 0.2s ease",
                    }}
                  >
                    <SendIcon size={14} />
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
              flexDirection: "column",
              color: "#999",
              fontSize: "14px",
              fontFamily: FONT_FAMILY,
              gap: "8px",
            }}>
              <div style={{ fontSize: "48px" }}>💬</div>
              <div>Pilih chat dari daftar di kiri</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ===== ADMIN VIEW =====
  const waitingTickets = tickets.filter(t => t.status === 'waiting' && !t.isBroadcast && !t.isAnnouncement);
  const activeTickets = tickets.filter(t => t.status === 'active' && !t.isBroadcast && !t.isAnnouncement);
  const resolvedTickets = tickets.filter(t => (t.status === 'resolved' || t.status === 'closed') && !t.isBroadcast && !t.isAnnouncement);
  const broadcastTickets = tickets.filter(t => t.isBroadcast);
  const announcementTickets = tickets.filter(t => t.isAnnouncement);
  const typingText = selectedTicket ? getTypingText(selectedTicket) : null;

  return (
    <div style={{ 
      maxWidth: "1400px", 
      margin: "40px auto", 
      height: "620px",
      backgroundColor: "#ffffff",
      borderRadius: "20px",
      border: "1px solid rgba(13,60,252,0.1)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Admin Header */}
      <div style={{
        padding: "10px 24px",
        backgroundColor: "#0D3CFC",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img
            src={AGENT_PHOTO}
            alt={AGENT_NAME}
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid rgba(255,255,255,0.3)",
            }}
          />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontWeight: 600, fontSize: "14px", color: "#ffffff", fontFamily: FONT_FAMILY }}>
                {AGENT_NAME}
              </span>
              <InstagramVerifiedBadge size={12} />
              <span style={{
                backgroundColor: "rgba(255,255,255,0.2)",
                color: "#fff",
                fontSize: "8px",
                fontWeight: 600,
                padding: "1px 10px",
                borderRadius: "10px",
                fontFamily: FONT_FAMILY,
              }}>
                Agent
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <PulsingDots active={agentOnline} />
              <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.8)", fontFamily: FONT_FAMILY }}>
                {agentOnline ? "Online" : "Offline"}
              </span>
              <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.5)", fontFamily: FONT_FAMILY }}>
                • {tickets.length} total chat
              </span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={() => setShowBroadcastModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 16px",
              backgroundColor: "transparent",
              color: "#ffffff",
              border: "1px solid #ffffff",
              borderRadius: "6px",
              fontSize: "12px",
              cursor: "pointer",
              fontFamily: FONT_FAMILY,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.15)"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
          >
            📢 Broadcast
          </button>
          <button
            onClick={() => setShowAnnouncementModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 16px",
              backgroundColor: "transparent",
              color: "#ffffff",
              border: "1px solid #ffffff",
              borderRadius: "6px",
              fontSize: "12px",
              cursor: "pointer",
              fontFamily: FONT_FAMILY,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.15)"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
          >
            📢 Pengumuman
          </button>
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "6px 12px",
              backgroundColor: "transparent",
              color: "#ffffff",
              border: "1px solid #ffffff",
              borderRadius: "6px",
              fontSize: "12px",
              cursor: "pointer",
              fontFamily: FONT_FAMILY,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.15)"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
          >
            <LogoutIcon size={14} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        <div style={{
          width: "300px",
          backgroundColor: "#0D3CFC",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
        }}>
          <div style={{
            padding: "8px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "rgba(255,255,255,0.12)",
              borderRadius: "8px",
              padding: "5px 12px",
            }}>
              <SearchIcon size={15} color="rgba(255,255,255,0.6)" />
              <input
                type="text"
                placeholder="Cari chat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#fff",
                  fontSize: "12px",
                  fontFamily: FONT_FAMILY,
                }}
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>
            {/* Broadcast */}
            {broadcastTickets.length > 0 && (
              <div>
                <div style={{
                  padding: "4px 16px",
                  backgroundColor: "transparent",
                  fontWeight: 600,
                  fontSize: "9px",
                  color: "rgba(255,255,255,0.5)",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontFamily: FONT_FAMILY,
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                  letterSpacing: "0.5px",
                }}>
                  📢 Broadcast
                </div>
                {broadcastTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    style={{
                      padding: "6px 16px",
                      cursor: "pointer",
                      backgroundColor: selectedTicket?.id === ticket.id ? "rgba(255,255,255,0.15)" : "transparent",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <img
                        src={BROADCAST_PHOTO}
                        alt="Broadcast"
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 500, fontSize: "12px", color: "#ffffff", fontFamily: FONT_FAMILY }}>
                          📢 {BROADCAST_NAME}
                        </div>
                        <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.6)", fontFamily: FONT_FAMILY }}>
                          {ticket.topic}
                        </div>
                        {ticket.lastMessage && (
                          <div style={{ fontSize: "8px", color: "rgba(255,255,255,0.4)", marginTop: "1px", fontFamily: FONT_FAMILY }}>
                            {ticket.lastMessage.substring(0, 25)}{ticket.lastMessage.length > 25 ? "..." : ""}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Announcement */}
            {announcementTickets.length > 0 && (
              <div>
                <div style={{
                  padding: "4px 16px",
                  backgroundColor: "transparent",
                  fontWeight: 600,
                  fontSize: "9px",
                  color: "rgba(255,255,255,0.5)",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontFamily: FONT_FAMILY,
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                  letterSpacing: "0.5px",
                }}>
                  📢 Pengumuman
                </div>
                {announcementTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    style={{
                      padding: "6px 16px",
                      cursor: "pointer",
                      backgroundColor: selectedTicket?.id === ticket.id ? "rgba(255,255,255,0.15)" : "transparent",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <img
                        src={ANNOUNCEMENT_PHOTO}
                        alt="Pengumuman"
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 500, fontSize: "12px", color: "#ffffff", fontFamily: FONT_FAMILY }}>
                          📢 {ANNOUNCEMENT_NAME}
                        </div>
                        <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.6)", fontFamily: FONT_FAMILY }}>
                          {ticket.topic}
                        </div>
                        {ticket.lastMessage && (
                          <div style={{ fontSize: "8px", color: "rgba(255,255,255,0.4)", marginTop: "1px", fontFamily: FONT_FAMILY }}>
                            {ticket.lastMessage.substring(0, 25)}{ticket.lastMessage.length > 25 ? "..." : ""}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Waiting */}
            {waitingTickets.length > 0 && (
              <div>
                <div style={{
                  padding: "4px 16px",
                  backgroundColor: "transparent",
                  fontWeight: 600,
                  fontSize: "9px",
                  color: "rgba(255,255,255,0.5)",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontFamily: FONT_FAMILY,
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                  letterSpacing: "0.5px",
                }}>
                  ⏳ Menunggu ({waitingTickets.length})
                </div>
                {waitingTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => {
                      setSelectedTicket(ticket);
                      takeTicket(ticket.id);
                    }}
                    style={{
                      padding: "6px 16px",
                      cursor: "pointer",
                      backgroundColor: selectedTicket?.id === ticket.id ? "rgba(255,255,255,0.15)" : "transparent",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <img
                        src={getUserPhoto(ticket.userEmail, ticket.userPhoto)}
                        alt={ticket.userName}
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 500, fontSize: "12px", color: "#ffffff", fontFamily: FONT_FAMILY }}>
                          {ticket.userName}
                        </div>
                        <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.6)", fontFamily: FONT_FAMILY }}>
                          {ticket.topic}
                        </div>
                        {ticket.typing && (
                          <div style={{ fontSize: "8px", color: "#a8d5ff", fontStyle: "italic", fontFamily: FONT_FAMILY }}>
                            {ticket.typingUserName} mengetik...
                          </div>
                        )}
                      </div>
                      <span style={{
                        fontSize: "7px",
                        backgroundColor: "rgba(254,243,199,0.3)",
                        color: "#fef3c7",
                        padding: "1px 8px",
                        borderRadius: "10px",
                        fontWeight: 500,
                        fontFamily: FONT_FAMILY,
                      }}>
                        Baru
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Active */}
            {activeTickets.length > 0 && (
              <div>
                <div style={{
                  padding: "4px 16px",
                  backgroundColor: "transparent",
                  fontWeight: 600,
                  fontSize: "9px",
                  color: "rgba(255,255,255,0.5)",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontFamily: FONT_FAMILY,
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                  letterSpacing: "0.5px",
                }}>
                  💬 Aktif ({activeTickets.length})
                </div>
                {activeTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    style={{
                      padding: "6px 16px",
                      cursor: "pointer",
                      backgroundColor: selectedTicket?.id === ticket.id ? "rgba(255,255,255,0.15)" : "transparent",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <img
                        src={getUserPhoto(ticket.userEmail, ticket.userPhoto)}
                        alt={ticket.userName}
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 500, fontSize: "12px", color: "#ffffff", fontFamily: FONT_FAMILY }}>
                          {ticket.userName}
                        </div>
                        <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.6)", fontFamily: FONT_FAMILY }}>
                          {ticket.topic}
                        </div>
                        {ticket.typing && (
                          <div style={{ fontSize: "8px", color: "#a8d5ff", fontStyle: "italic", fontFamily: FONT_FAMILY }}>
                            {ticket.typingUserName} mengetik...
                          </div>
                        )}
                        {ticket.lastMessage && (
                          <div style={{ fontSize: "8px", color: "rgba(255,255,255,0.4)", marginTop: "1px", fontFamily: FONT_FAMILY }}>
                            {ticket.lastMessage.substring(0, 25)}{ticket.lastMessage.length > 25 ? "..." : ""}
                          </div>
                        )}
                      </div>
                      <div style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        backgroundColor: "#22c55e",
                        flexShrink: 0,
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Resolved */}
            {resolvedTickets.length > 0 && (
              <div>
                <div style={{
                  padding: "4px 16px",
                  backgroundColor: "transparent",
                  fontWeight: 600,
                  fontSize: "9px",
                  color: "rgba(255,255,255,0.3)",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontFamily: FONT_FAMILY,
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                  letterSpacing: "0.5px",
                }}>
                  ✅ Selesai ({resolvedTickets.length})
                </div>
                {resolvedTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    style={{
                      padding: "6px 16px",
                      cursor: "pointer",
                      backgroundColor: selectedTicket?.id === ticket.id ? "rgba(255,255,255,0.08)" : "transparent",
                      borderBottom: "1px solid rgba(255,255,255,0.03)",
                      transition: "all 0.2s ease",
                      opacity: 0.5,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <img
                        src={getUserPhoto(ticket.userEmail, ticket.userPhoto)}
                        alt={ticket.userName}
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          objectFit: "cover",
                          opacity: 0.5,
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 500, fontSize: "12px", color: "rgba(255,255,255,0.5)", fontFamily: FONT_FAMILY }}>
                          {ticket.userName}
                        </div>
                        <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)", fontFamily: FONT_FAMILY }}>
                          {ticket.topic}
                        </div>
                        <div style={{ fontSize: "7px", color: "rgba(255,255,255,0.2)", fontFamily: FONT_FAMILY }}>
                          {generateTicketId(ticket.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {waitingTickets.length === 0 && activeTickets.length === 0 && resolvedTickets.length === 0 && 
             broadcastTickets.length === 0 && announcementTickets.length === 0 && (
              <div style={{ padding: "40px 20px", textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: "12px", fontFamily: FONT_FAMILY }}>
                Tidak ada chat masuk
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", backgroundColor: "#f0f2f5" }}>
          {selectedTicket ? (
            <>
              <div style={{
                padding: "10px 20px",
                backgroundColor: "#ffffff",
                borderBottom: "1px solid #e8e8e8",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexShrink: 0,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <img
                    src={selectedTicket.isBroadcast ? BROADCAST_PHOTO : selectedTicket.isAnnouncement ? ANNOUNCEMENT_PHOTO : getUserPhoto(selectedTicket.userEmail, selectedTicket.userPhoto)}
                    alt={selectedTicket.isBroadcast ? BROADCAST_NAME : selectedTicket.isAnnouncement ? ANNOUNCEMENT_NAME : selectedTicket.userName}
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "13px", color: "#0D3CFC", fontFamily: FONT_FAMILY }}>
                      {selectedTicket.isBroadcast ? "📢 " + BROADCAST_NAME : selectedTicket.isAnnouncement ? "📢 " + ANNOUNCEMENT_NAME : selectedTicket.userName}
                    </div>
                    <div style={{ fontSize: "10px", color: "#666", fontFamily: FONT_FAMILY }}>
                      {selectedTicket.topic} • {generateTicketId(selectedTicket.createdAt)}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{
                    fontSize: "9px",
                    backgroundColor: selectedTicket.status === 'waiting' ? "#fef3c7" : 
                                    selectedTicket.status === 'active' ? "#d1fae5" : "#e5e7eb",
                    color: selectedTicket.status === 'waiting' ? "#92400e" :
                           selectedTicket.status === 'active' ? "#065f46" : "#6b7280",
                    padding: "2px 12px",
                    borderRadius: "10px",
                    fontWeight: 500,
                    fontFamily: FONT_FAMILY,
                  }}>
                    {selectedTicket.status === 'waiting' ? 'Menunggu' : 
                     selectedTicket.status === 'active' ? 'Aktif' : 'Selesai'}
                  </span>
                  {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && !selectedTicket.isBroadcast && !selectedTicket.isAnnouncement && (
                    <button
                      onClick={() => resolveTicket(selectedTicket.id)}
                      style={{
                        padding: "3px 12px",
                        backgroundColor: "#0D3CFC",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "10px",
                        cursor: "pointer",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      Selesaikan
                    </button>
                  )}
                </div>
              </div>

              <div 
                ref={chatContainerRef}
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "16px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                {messages.length === 0 ? (
                  <div style={{ textAlign: "center", color: "#999", fontSize: "13px", padding: "40px 0", fontFamily: FONT_FAMILY }}>
                    Belum ada pesan
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMine = msg.senderId === user?.uid;
                    const isBroadcast = msg.isBroadcast;
                    const isAnnouncement = msg.isAnnouncement;
                    const isRead = isMessageRead(msg);
                    
                    if (isBroadcast || isAnnouncement) {
                      const label = isBroadcast ? BROADCAST_NAME : ANNOUNCEMENT_NAME;
                      return (
                        <div
                          key={idx}
                          style={{
                            alignSelf: "flex-start",
                            maxWidth: "80%",
                            padding: "8px 16px",
                            borderRadius: "12px",
                            backgroundColor: "#0D3CFC",
                            color: "#ffffff",
                            fontSize: "13px",
                            fontFamily: FONT_FAMILY,
                          }}
                        >
                          <div style={{ 
                            fontSize: "10px", 
                            fontWeight: 600, 
                            color: "rgba(255,255,255,0.7)", 
                            marginBottom: "4px", 
                            fontFamily: FONT_FAMILY,
                          }}>
                            📢 {label}
                          </div>
                          <div>{msg.text}</div>
                          <div style={{ 
                            fontSize: "9px", 
                            color: "rgba(255,255,255,0.5)", 
                            marginTop: "4px",
                            textAlign: "right",
                            fontFamily: FONT_FAMILY,
                          }}>
                            {formatTime(msg.timestamp)}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={idx}
                        style={{
                          alignSelf: isMine ? "flex-end" : "flex-start",
                          maxWidth: "70%",
                          display: "flex",
                          alignItems: "flex-end",
                          gap: "6px",
                        }}
                      >
                        {!isMine && (
                          <img
                            src={msg.senderPhoto || getUserPhoto(undefined, undefined)}
                            alt={msg.senderName}
                            style={{
                              width: "26px",
                              height: "26px",
                              borderRadius: "50%",
                              objectFit: "cover",
                              flexShrink: 0,
                            }}
                          />
                        )}
                        <div
                          style={{
                            padding: "8px 14px",
                            borderRadius: "12px",
                            backgroundColor: isMine ? "#0D3CFC" : "#ffffff",
                            color: isMine ? "#fff" : "#000",
                            fontSize: "13px",
                            fontFamily: FONT_FAMILY,
                            wordBreak: "break-word",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                            border: !isMine ? "1px solid #e8e8e8" : "none",
                            maxWidth: "100%",
                          }}
                        >
                          {!isMine && (
                            <div style={{ 
                              fontSize: "9px", 
                              fontWeight: 500, 
                              color: "#0D3CFC", 
                              marginBottom: "2px", 
                              fontFamily: FONT_FAMILY,
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}>
                              {msg.senderName}
                              {msg.senderName === AGENT_NAME && <InstagramVerifiedBadge size={8} />}
                            </div>
                          )}
                          <div>{msg.text}</div>
                          <div style={{ 
                            fontSize: "9px", 
                            color: isMine ? "rgba(255,255,255,0.6)" : "#999", 
                            marginTop: "4px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            gap: "4px",
                            fontFamily: FONT_FAMILY,
                          }}>
                            {formatTime(msg.timestamp)}
                            {isMine && (
                              isRead ? (
                                <DoubleCheckIcon size={12} color="rgba(255,255,255,0.6)" />
                              ) : (
                                <CheckIcon size={12} color="rgba(255,255,255,0.4)" />
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                {typingText && selectedTicket.status !== 'resolved' && (
                  <div style={{
                    alignSelf: "flex-start",
                    fontSize: "11px",
                    color: "#666",
                    fontStyle: "italic",
                    padding: "4px 12px",
                    fontFamily: FONT_FAMILY,
                  }}>
                    {typingText}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                <div style={{
                  padding: "10px 20px",
                  borderTop: "1px solid #e8e8e8",
                  backgroundColor: "#ffffff",
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
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
                      padding: "8px 16px",
                      border: "1px solid #e8e8e8",
                      borderRadius: "24px",
                      fontSize: "13px",
                      outline: "none",
                      fontFamily: FONT_FAMILY,
                      backgroundColor: "#f8f9ff",
                      transition: "border-color 0.2s ease",
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = "#0D3CFC"}
                    onBlur={(e) => e.currentTarget.style.borderColor = "#e8e8e8"}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!messageText.trim()}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: messageText.trim() ? "#0D3CFC" : "#ccc",
                      color: "#fff",
                      border: "none",
                      borderRadius: "24px",
                      cursor: messageText.trim() ? "pointer" : "not-allowed",
                      fontFamily: FONT_FAMILY,
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "13px",
                      fontWeight: 500,
                      transition: "all 0.2s ease",
                    }}
                  >
                    <SendIcon size={14} />
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
              flexDirection: "column",
              color: "#999",
              fontSize: "14px",
              fontFamily: FONT_FAMILY,
              gap: "8px",
            }}>
              <div style={{ fontSize: "48px" }}>💬</div>
              <div>Pilih chat dari daftar di kiri</div>
            </div>
          )}
        </div>
      </div>

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          backdropFilter: "blur(4px)",
        }}>
          <div style={{
            backgroundColor: "#fff",
            borderRadius: "16px",
            padding: "28px",
            maxWidth: "460px",
            width: "90%",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#0D3CFC", fontFamily: FONT_FAMILY, margin: 0 }}>
                📢 Kirim Broadcast
              </h3>
              <button
                onClick={() => setShowBroadcastModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "22px",
                  cursor: "pointer",
                  color: "#999",
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ marginBottom: "12px" }}>
              <label style={{ fontSize: "12px", color: "#666", fontFamily: FONT_FAMILY, display: "block", marginBottom: "4px" }}>
                Pilih User
              </label>
              <div style={{
                maxHeight: "150px",
                overflowY: "auto",
                border: "1px solid #e8e8e8",
                borderRadius: "8px",
                padding: "8px",
              }}>
                {allUsers.map((u) => (
                  <label key={u.id} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "4px 8px",
                    cursor: "pointer",
                    fontFamily: FONT_FAMILY,
                    fontSize: "13px",
                    borderRadius: "4px",
                  }}>
                    <input
                      type="checkbox"
                      checked={broadcastUsers.includes(u.id)}
                      onChange={() => {
                        if (broadcastUsers.includes(u.id)) {
                          setBroadcastUsers(broadcastUsers.filter(id => id !== u.id));
                        } else {
                          setBroadcastUsers([...broadcastUsers, u.id]);
                        }
                      }}
                      style={{ accentColor: "#0D3CFC" }}
                    />
                    <img
                      src={u.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.email || "User")}&background=0D3CFC&color=fff&size=64`}
                      alt={u.email}
                      style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "cover" }}
                    />
                    <span>{u.displayName || u.email || "User"}</span>
                  </label>
                ))}
                {allUsers.length === 0 && (
                  <div style={{ padding: "12px", textAlign: "center", color: "#999", fontSize: "13px", fontFamily: FONT_FAMILY }}>
                    Belum ada user terdaftar
                  </div>
                )}
              </div>
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "12px", color: "#666", fontFamily: FONT_FAMILY, display: "block", marginBottom: "4px" }}>
                Pesan Broadcast
              </label>
              <textarea
                value={broadcastText}
                onChange={(e) => setBroadcastText(e.target.value)}
                placeholder="Tulis pesan broadcast..."
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "2px solid #e8e8e8",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontFamily: FONT_FAMILY,
                  outline: "none",
                  minHeight: "80px",
                  resize: "vertical",
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = "#0D3CFC"}
                onBlur={(e) => e.currentTarget.style.borderColor = "#e8e8e8"}
              />
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowBroadcastModal(false)}
                style={{
                  padding: "6px 18px",
                  backgroundColor: "transparent",
                  color: "#666",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  fontSize: "13px",
                  cursor: "pointer",
                  fontFamily: FONT_FAMILY,
                }}
              >
                Batal
              </button>
              <button
                onClick={sendBroadcast}
                disabled={!broadcastText.trim() || broadcastUsers.length === 0}
                style={{
                  padding: "6px 18px",
                  backgroundColor: (broadcastText.trim() && broadcastUsers.length > 0) ? "#0D3CFC" : "#ccc",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: (broadcastText.trim() && broadcastUsers.length > 0) ? "pointer" : "not-allowed",
                  fontFamily: FONT_FAMILY,
                }}
              >
                Kirim ({broadcastUsers.length} user)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Announcement Modal */}
      {showAnnouncementModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          backdropFilter: "blur(4px)",
        }}>
          <div style={{
            backgroundColor: "#fff",
            borderRadius: "16px",
            padding: "28px",
            maxWidth: "460px",
            width: "90%",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#0D3CFC", fontFamily: FONT_FAMILY, margin: 0 }}>
                📢 Kirim Pengumuman
              </h3>
              <button
                onClick={() => setShowAnnouncementModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "22px",
                  cursor: "pointer",
                  color: "#999",
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ marginBottom: "12px" }}>
              <label style={{ fontSize: "12px", color: "#666", fontFamily: FONT_FAMILY, display: "block", marginBottom: "4px" }}>
                Pilih User
              </label>
              <div style={{
                maxHeight: "150px",
                overflowY: "auto",
                border: "1px solid #e8e8e8",
                borderRadius: "8px",
                padding: "8px",
              }}>
                {allUsers.map((u) => (
                  <label key={u.id} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "4px 8px",
                    cursor: "pointer",
                    fontFamily: FONT_FAMILY,
                    fontSize: "13px",
                    borderRadius: "4px",
                  }}>
                    <input
                      type="checkbox"
                      checked={announcementUsers.includes(u.id)}
                      onChange={() => {
                        if (announcementUsers.includes(u.id)) {
                          setAnnouncementUsers(announcementUsers.filter(id => id !== u.id));
                        } else {
                          setAnnouncementUsers([...announcementUsers, u.id]);
                        }
                      }}
                      style={{ accentColor: "#0D3CFC" }}
                    />
                    <img
                      src={u.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.email || "User")}&background=0D3CFC&color=fff&size=64`}
                      alt={u.email}
                      style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "cover" }}
                    />
                    <span>{u.displayName || u.email || "User"}</span>
                  </label>
                ))}
                {allUsers.length === 0 && (
                  <div style={{ padding: "12px", textAlign: "center", color: "#999", fontSize: "13px", fontFamily: FONT_FAMILY }}>
                    Belum ada user terdaftar
                  </div>
                )}
              </div>
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "12px", color: "#666", fontFamily: FONT_FAMILY, display: "block", marginBottom: "4px" }}>
                Pesan Pengumuman
              </label>
              <textarea
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder="Tulis pengumuman..."
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "2px solid #e8e8e8",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontFamily: FONT_FAMILY,
                  outline: "none",
                  minHeight: "80px",
                  resize: "vertical",
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = "#0D3CFC"}
                onBlur={(e) => e.currentTarget.style.borderColor = "#e8e8e8"}
              />
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowAnnouncementModal(false)}
                style={{
                  padding: "6px 18px",
                  backgroundColor: "transparent",
                  color: "#666",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  fontSize: "13px",
                  cursor: "pointer",
                  fontFamily: FONT_FAMILY,
                }}
              >
                Batal
              </button>
              <button
                onClick={sendAnnouncement}
                disabled={!announcementText.trim() || announcementUsers.length === 0}
                style={{
                  padding: "6px 18px",
                  backgroundColor: (announcementText.trim() && announcementUsers.length > 0) ? "#0D3CFC" : "#ccc",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: (announcementText.trim() && announcementUsers.length > 0) ? "pointer" : "not-allowed",
                  fontFamily: FONT_FAMILY,
                }}
              >
                Kirim ({announcementUsers.length} user)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ===== MAIN PAGE =====
export default function LiveChatPage(): React.JSX.Element {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showMain, setShowMain] = useState(false);
  
  const preloaderRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const plusIconRef = useRef<HTMLSpanElement>(null);
  const menuOverlayRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);
  const menuruFooterRef = useRef<HTMLDivElement>(null);
  const menuruTextRef = useRef<HTMLSpanElement>(null);
  const menuItemsRef = useRef<HTMLDivElement>(null);
  const menuBoxRef = useRef<HTMLDivElement>(null);
  const menuBox2Ref = useRef<HTMLDivElement>(null);
  const menuBox3Ref = useRef<HTMLDivElement>(null);
  const storiesRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const liveChatTitleRef = useRef<HTMLDivElement>(null);

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
    if (!isMounted || !showMain) return;
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
  }, [isMounted, showMain]);

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
    if (!isMounted || !showMain) return;

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
  }, [isMounted, showMain]);

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
        <title>Live Chat Agent | Menuru Official</title>
        <meta name="description" content="Live Chat Agent Menuru - Chat langsung dengan agent kami" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#0D3CFC" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Menuru" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="icon" href="/images/ai.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/images/ai.jpg" />
        <meta property="og:title" content="Live Chat Agent | Menuru Official" />
        <meta property="og:description" content="Live Chat Agent Menuru - Chat langsung dengan agent kami" />
        <meta property="og:image" content="/images/ai.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Live Chat Agent | Menuru Official" />
        <meta name="twitter:description" content="Live Chat Agent Menuru - Chat langsung dengan agent kami" />
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
          }}
        >
          <h1
            ref={titleRef}
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
                {`Chat langsung dengan agent kami\nuntuk bantuan cepat dan tepat`}
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "20px", position: "relative" }}>
              <div
                ref={buttonRef}
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
                  Mulai Chat Sekarang
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
                ref={liveChatTitleRef}
                style={{
                  fontSize: "80px",
                  fontWeight: 700,
                  color: "#0D3CFC",
                  fontFamily: FONT_FAMILY,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.1,
                }}
              >
                Live Chat Agent
              </span>
            </div>

            <div
              style={{
                marginTop: "16px",
                width: "100%",
                display: "flex",
                justifyContent: "flex-start",
              }}
            >
              <span
                style={{
                  fontSize: "28px",
                  fontWeight: 500,
                  color: "#0D3CFC",
                  fontFamily: FONT_FAMILY,
                  letterSpacing: "-0.01em",
                }}
              >
                {user ? (
                  <>
                    Hi, {user.displayName || user.email || "User"} 👋
                  </>
                ) : (
                  <>
                    Silakan login untuk melanjutkan
                    <Link href="/" style={{ textDecoration: "none", marginLeft: "12px" }}>
                      <span
                        style={{
                          fontSize: "20px",
                          fontWeight: 600,
                          color: "#ffffff",
                          backgroundColor: "#0D3CFC",
                          padding: "6px 20px",
                          borderRadius: "8px",
                          display: "inline-block",
                        }}
                      >
                        Login
                      </span>
                    </Link>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        <div style={{ padding: "0 40px 40px 40px" }}>
          <LiveChatAgent user={user} isAdmin={isAdmin} db={db} auth={auth} />
        </div>

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
                    if (link === "Kebijakan Privasi") {
                      linkHref = "/privacy-policy";
                      isAttention = true;
                    } else if (link === "Ketentuan Kami") {
                      linkHref = "/terms-of-service";
                      isAttention = true;
                    } else if (link === "Live Chat Agent") {
                      linkHref = "/live-chat-agent";
                    } else if (link === "Live Chat") {
                      linkHref = "/live-chat";
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
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

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

        <div
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
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", border: "2px solid #0D3CFC", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", backgroundColor: "transparent" }}>
                <span style={{ fontSize: "16px", fontWeight: 500, color: "#0D3CFC", fontFamily: FONT_FAMILY }}>Get in touch</span>
                <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", backgroundColor: "#0D3CFC", borderRadius: "4px", padding: "4px", color: "#ffffff" }}>
                  <SouthEastArrow size={24} color="#ffffff" />
                </div>
              </div>
            </Link>
            <Link href="/pusat-bantuan">
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", border: "2px solid #000000", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", backgroundColor: "transparent" }}>
                <span style={{ fontSize: "16px", fontWeight: 500, color: "#000000", fontFamily: FONT_FAMILY }}>Pusat Bantuan</span>
                <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", backgroundColor: "#000000", borderRadius: "4px", padding: "4px", color: "#ffffff" }}>
                  <NorthWestArrow size={24} color="#ffffff" />
                </div>
              </div>
            </Link>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", border: "2px solid #000000", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", backgroundColor: "transparent" }} onClick={toggleMenu}>
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
                href={item.name === "Live Chat Agent" ? "/live-chat-agent" : "/"}
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
