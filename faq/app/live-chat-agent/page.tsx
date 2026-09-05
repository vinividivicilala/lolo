'use client';

import React, { useState, useEffect, useRef, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, collection, query, where, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, orderBy, getDocs } from "firebase/firestore";
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

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
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
}

const FONT_FAMILY = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
const ADMIN_EMAIL = "faridardiansyah061@gmail.com";
const AGENT_NAME = "Farid Ardiansyah";

// Icons
const SendIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"/>
  </svg>
);

const BroadcastIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8L18 8M6 16L18 16M6 12H18"/>
    <circle cx="12" cy="4" r="2"/>
    <circle cx="4" cy="12" r="2"/>
    <circle cx="20" cy="12" r="2"/>
    <circle cx="12" cy="20" r="2"/>
  </svg>
);

const AnnouncementIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8C18 8 20 9 20 12C20 15 18 16 18 16M15 5L8 9H4C3.44772 9 3 9.44772 3 10V14C3 14.5523 3.44772 15 4 15H8L15 19V5Z"/>
    <path d="M17 7C17 7 19 8 19 12C19 16 17 17 17 17"/>
  </svg>
);

const SearchIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7"/>
    <path d="M16 16L21 21"/>
  </svg>
);

const ChatIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const LogoutIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const BackIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
);

const PulsingDots = ({ active }: { active: boolean }) => {
  if (!active) return <span style={{ color: '#999', fontSize: '10px' }}>● Offline</span>;
  return (
    <span style={{ display: 'inline-flex', gap: '2px', alignItems: 'center' }}>
      <span className="dot" style={{ animationDelay: '0s' }}>●</span>
      <span className="dot" style={{ animationDelay: '0.2s' }}>●</span>
      <span className="dot" style={{ animationDelay: '0.4s' }}>●</span>
      <style>{`
        .dot { animation: blink 1.4s infinite both; font-size: 8px; color: #22c55e; }
        @keyframes blink { 0% { opacity: 0.2; } 20% { opacity: 1; } 100% { opacity: 0.2; } }
      `}</style>
    </span>
  );
};

// Types
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
  isAnnouncement?: boolean;
  isBroadcast?: boolean;
}

// Footer links
const footerLinks = [
  { title: "Get in Touch", links: ["Contact Us", "Instagram", "Live Chat"] },
  { title: "Product", links: ["Shop", "Note", "Calendar", "Blog", "Donation", "Community", "Live Chat Agent"] },
  { title: "Attention", links: ["Kebijakan Privasi", "Ketentuan Kami", "Pusat Bantuan"] }
];

const menuItems = [
  { name: "Community", number: "01" },
  { name: "Blog", number: "02" },
  { name: "Live Chat", number: "03" },
  { name: "Live Chat Agent", number: "04" },
  { name: "Donation", number: "05" },
  { name: "Contact", number: "06" },
  { name: "Note", number: "07" }
];

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
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [announcementMessage, setAnnouncementMessage] = useState("");
  const [activeTab, setActiveTab] = useState<'waiting' | 'active' | 'resolved'>('waiting');
  const [isMobileView, setIsMobileView] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const topics = ["Pertanyaan tentang produk", "Bantuan teknis", "Permasalahan akun", "Donasi", "Kerjasama", "Lainnya"];

  useEffect(() => {
    setIsMounted(true);
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const generateTicketId = (createdAt: any): string => {
    if (!createdAt) return "#TICKET-0000";
    const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `#TICKET-${year}${month}${day}`;
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

  // GSAP animasi
  useEffect(() => {
    if (!isMounted || !containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(containerRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" });
    }, containerRef);
    return () => ctx.revert();
  }, [isMounted]);

  // Fetch agent online status
  useEffect(() => {
    if (!db || !isMounted) return;
    const q = query(collection(db, "users"), where("email", "==", ADMIN_EMAIL));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        setAgentOnline(data.online || false);
      }
    });
    return () => unsubscribe();
  }, [db, isMounted]);

  // Fetch tickets
  useEffect(() => {
    if (!db || !user || !isMounted) return;
    const q = query(
      collection(db, "livechat_tickets"),
      ...(isAdmin ? [] : [where("userId", "==", user.uid)]),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ticketList: Ticket[] = [];
      snapshot.forEach((doc) => {
        ticketList.push({ id: doc.id, ...doc.data() } as Ticket);
      });
      setTickets(ticketList);
      if (selectedTicket) {
        const stillExists = ticketList.some(t => t.id === selectedTicket.id);
        if (!stillExists) { setSelectedTicket(null); setMessages([]); }
      }
    });
    return () => unsubscribe();
  }, [db, user, isAdmin, selectedTicket, isMounted]);

  // Fetch messages
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
      setTimeout(scrollToBottom, 50);
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

  // Auto-select ticket for user
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
      await updateDoc(ticketRef, { typing: true, typingUserId: user.uid, typingUserName: user.displayName || user.email || "User" });
    } else {
      await updateDoc(ticketRef, { typing: false, typingUserId: null, typingUserName: null });
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(async () => {
      await updateDoc(ticketRef, { typing: false, typingUserId: null, typingUserName: null });
    }, 2000);
  };

  const startChat = async () => {
    if (!db || !user || !selectedTopic) return;
    const hasActiveTicket = tickets.some(t => t.status === 'waiting' || t.status === 'active');
    if (hasActiveTicket) { alert("Anda masih memiliki chat aktif."); return; }
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
      alert("Chat ini sudah selesai.");
      return;
    }
    try {
      const ticketRef = doc(db, "livechat_tickets", selectedTicket.id);
      await updateDoc(ticketRef, { typing: false, typingUserId: null, typingUserName: null });
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
      await updateDoc(doc(db, "livechat_tickets", ticketId), { status: "resolved" });
      if (selectedTicket?.id === ticketId) { setSelectedTicket(null); setMessages([]); }
    } catch (error) {
      console.error("Error resolving ticket:", error);
    }
  };

  const getTypingText = (ticket: Ticket | null) => {
    if (!ticket || !ticket.typing) return null;
    return `${ticket.typingUserName || "Seseorang"} mengetik...`;
  };

  const sendBroadcast = async () => {
    if (!db || !isAdmin || !broadcastMessage.trim()) return;
    try {
      const activeTickets = tickets.filter(t => t.status === 'active' || t.status === 'waiting');
      for (const ticket of activeTickets) {
        await addDoc(collection(db, "livechat_tickets", ticket.id, "messages"), {
          senderId: "system",
          senderName: "📢 Broadcast",
          text: broadcastMessage.trim(),
          timestamp: serverTimestamp(),
          read: false,
          isBroadcast: true,
        });
        await updateDoc(doc(db, "livechat_tickets", ticket.id), {
          lastMessage: `📢 ${broadcastMessage.trim()}`,
          lastMessageTime: serverTimestamp(),
        });
      }
      setBroadcastMessage("");
      setShowBroadcastModal(false);
      alert(`Broadcast terkirim ke ${activeTickets.length} chat`);
    } catch (error) {
      console.error("Error sending broadcast:", error);
    }
  };

  const sendAnnouncement = async () => {
    if (!db || !isAdmin || !announcementMessage.trim()) return;
    try {
      const allTickets = tickets.filter(t => t.status !== 'resolved' && t.status !== 'closed');
      for (const ticket of allTickets) {
        await addDoc(collection(db, "livechat_tickets", ticket.id, "messages"), {
          senderId: "system",
          senderName: "📢 Pengumuman",
          text: announcementMessage.trim(),
          timestamp: serverTimestamp(),
          read: false,
          isAnnouncement: true,
        });
        await updateDoc(doc(db, "livechat_tickets", ticket.id), {
          lastMessage: `📢 ${announcementMessage.trim()}`,
          lastMessageTime: serverTimestamp(),
        });
      }
      setAnnouncementMessage("");
      setShowAnnouncementModal(false);
      alert(`Pengumuman terkirim ke ${allTickets.length} chat`);
    } catch (error) {
      console.error("Error sending announcement:", error);
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { online: false, lastSeen: serverTimestamp(), typing: false });
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getStatusDisplay = (ticket: Ticket | null) => {
    if (!ticket) return { label: '', color: '' };
    switch(ticket.status) {
      case 'waiting': return { label: 'Menunggu', color: '#f59e0b' };
      case 'active': return { label: 'Aktif', color: '#10b981' };
      case 'resolved': return { label: 'Selesai', color: '#6b7280' };
      case 'closed': return { label: 'Ditutup', color: '#6b7280' };
      default: return { label: '', color: '' };
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const userName = ticket.userName || '';
    const topic = ticket.topic || '';
    const matchesSearch = userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         topic.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'waiting') return ticket.status === 'waiting' && matchesSearch;
    if (activeTab === 'active') return ticket.status === 'active' && matchesSearch;
    return (ticket.status === 'resolved' || ticket.status === 'closed') && matchesSearch;
  });

  const waitingCount = tickets.filter(t => t.status === 'waiting').length;
  const activeCount = tickets.filter(t => t.status === 'active').length;
  const resolvedCount = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;

  if (!isMounted) return null;

  if (!user) {
    return (
      <div ref={containerRef} style={{ padding: "40px 0" }}>
        <div style={{ maxWidth: "480px", margin: "0 auto", textAlign: "center", padding: "48px 32px", background: "#f8f9fa", borderRadius: "16px" }}>
          <div style={{ width: "56px", height: "56px", margin: "0 auto 16px", background: "rgba(13,60,252,0.08)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ChatIcon size={24} style={{ color: "#0D3CFC" }} />
          </div>
          <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#0D3CFC", fontFamily: FONT_FAMILY, margin: "0 0 8px" }}>
            Live Chat Agent
          </h2>
          <p style={{ fontSize: "14px", color: "#666", fontFamily: FONT_FAMILY, margin: "0 0 20px" }}>
            Silakan login untuk menggunakan Live Chat Agent
          </p>
          <Link href="/" style={{ textDecoration: "none" }}>
            <button style={{ padding: "10px 32px", background: "#0D3CFC", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 500, cursor: "pointer", fontFamily: FONT_FAMILY }}>Login</button>
          </Link>
        </div>
      </div>
    );
  }

  // ===== USER VIEW =====
  if (!isAdmin) {
    if (tickets.length === 0 && !showStartChat) {
      return (
        <div ref={containerRef} style={{ padding: "32px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", padding: "14px 20px", background: "#0D3CFC", borderRadius: "12px", color: "#fff" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {user?.photoURL ? (
                <img src={user.photoURL} alt="" style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: 600 }}>
                  {user?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}
                </div>
              )}
              <div>
                <div style={{ fontSize: "15px", fontWeight: 600 }}>Hi, {user?.displayName || user?.email || "User"} 👋</div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", opacity: 0.8 }}>
                  <PulsingDots active={agentOnline} />
                  <span>{agentOnline ? "Agent Online" : "Agent Offline"}</span>
                </div>
              </div>
            </div>
            <button onClick={handleLogout} style={{ padding: "5px 12px", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "6px", color: "#fff", fontSize: "12px", cursor: "pointer", fontFamily: FONT_FAMILY, display: "flex", alignItems: "center", gap: "4px" }}>
              <LogoutIcon size={14} /> Logout
            </button>
          </div>
          <div style={{ maxWidth: "420px", margin: "0 auto", textAlign: "center", padding: "48px 20px", background: "#f8f9fa", borderRadius: "12px" }}>
            <ChatIcon size={28} style={{ color: "#0D3CFC", opacity: 0.4 }} />
            <p style={{ fontSize: "14px", color: "#666", fontFamily: FONT_FAMILY, margin: "12px 0 16px" }}>Butuh bantuan? Chat langsung dengan agent kami.</p>
            <button onClick={() => setShowStartChat(true)} style={{ padding: "10px 28px", background: "#0D3CFC", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 500, cursor: "pointer", fontFamily: FONT_FAMILY }}>Mulai Live Chat</button>
          </div>
        </div>
      );
    }

    if (showStartChat) {
      return (
        <div ref={containerRef} style={{ padding: "32px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", padding: "12px 18px", background: "#0D3CFC", borderRadius: "12px", color: "#fff" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {user?.photoURL ? (
                <img src={user.photoURL} alt="" style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 600 }}>
                  {user?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}
                </div>
              )}
              <div style={{ fontSize: "14px", fontWeight: 600 }}>Hi, {user?.displayName || user?.email || "User"} 👋</div>
            </div>
            <button onClick={handleLogout} style={{ padding: "4px 10px", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "6px", color: "#fff", fontSize: "12px", cursor: "pointer", fontFamily: FONT_FAMILY }}>Logout</button>
          </div>
          <div style={{ maxWidth: "400px", padding: "24px", background: "#fff", borderRadius: "12px", border: "1px solid #e8e8e8" }}>
            <div style={{ fontSize: "14px", marginBottom: "12px", fontWeight: 500, fontFamily: FONT_FAMILY }}>Pilih topik permasalahan Anda:</div>
            <select value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)} style={{ width: "100%", padding: "10px 14px", border: "2px solid #0D3CFC", borderRadius: "8px", fontSize: "14px", fontFamily: FONT_FAMILY, outline: "none", background: "#fff", marginBottom: "12px", color: "#0D3CFC" }}>
              <option value="">-- Pilih topik --</option>
              {topics.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={startChat} disabled={!selectedTopic} style={{ padding: "8px 20px", background: selectedTopic ? "#0D3CFC" : "#ccc", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 500, cursor: selectedTopic ? "pointer" : "not-allowed", fontFamily: FONT_FAMILY }}>Mulai Chat</button>
              <button onClick={() => setShowStartChat(false)} style={{ padding: "8px 20px", background: "transparent", color: "#666", border: "1px solid #ccc", borderRadius: "8px", fontSize: "13px", cursor: "pointer", fontFamily: FONT_FAMILY }}>Batal</button>
            </div>
          </div>
        </div>
      );
    }

    // User Chat View
    return (
      <div ref={containerRef} style={{ padding: "32px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", padding: "12px 18px", background: "#0D3CFC", borderRadius: "12px", color: "#fff" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }} />
            ) : (
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 600 }}>
                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}
              </div>
            )}
            <div>
              <div style={{ fontSize: "14px", fontWeight: 600 }}>Hi, {user?.displayName || user?.email || "User"} 👋</div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "10px", opacity: 0.8 }}>
                <PulsingDots active={agentOnline} />
                <span>{agentOnline ? "Online" : "Offline"}</span>
              </div>
            </div>
          </div>
          <button onClick={handleLogout} style={{ padding: "4px 10px", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "6px", color: "#fff", fontSize: "12px", cursor: "pointer", fontFamily: FONT_FAMILY }}>Logout</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobileView ? "1fr" : "240px 1fr", gap: "0", background: "#fff", borderRadius: "12px", overflow: "hidden", border: "1px solid #eee", minHeight: "420px", maxHeight: "500px" }}>
          {/* Sidebar */}
          {(!isMobileView || !selectedTicket) && (
            <div style={{ background: "#f8f9fa", borderRight: isMobileView ? "none" : "1px solid #eee", display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div style={{ padding: "10px 14px", background: "#fff", borderBottom: "1px solid #eee" }}>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#111", fontFamily: FONT_FAMILY }}>Riwayat Chat</span>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "2px 0" }}>
                {tickets.map((ticket) => {
                  const isActive = selectedTicket?.id === ticket.id;
                  const status = getStatusDisplay(ticket);
                  return (
                    <div key={ticket.id} onClick={() => { setSelectedTicket(ticket); setMessages([]); if (isMobileView) setIsMobileView(false); }}
                      style={{ display: "flex", alignItems: "center", padding: "8px 12px", cursor: "pointer", background: isActive ? "rgba(13,60,252,0.06)" : "transparent", borderLeft: isActive ? "3px solid #0D3CFC" : "3px solid transparent", transition: "all 0.15s" }}
                      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "#f0f2f5"; }}
                      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                    >
                      <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: ticket.status === 'waiting' ? "#fef3c7" : "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 600, color: ticket.status === 'waiting' ? "#92400e" : "#0D3CFC", flexShrink: 0, marginRight: "10px" }}>
                        {ticket.userName?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "12px", fontWeight: 600, color: "#111", fontFamily: FONT_FAMILY, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100px" }}>
                            {ticket.topic || "Chat"}
                          </span>
                          <span style={{ fontSize: "8px", color: status.color, background: status.color + "15", padding: "1px 6px", borderRadius: "4px" }}>
                            {status.label}
                          </span>
                        </div>
                        <div style={{ fontSize: "10px", color: "#999", fontFamily: FONT_FAMILY, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "120px" }}>
                          {ticket.lastMessage || "Mulai chat..."}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {tickets.length === 0 && (
                  <div style={{ padding: "20px", textAlign: "center", color: "#999", fontSize: "12px" }}>Belum ada chat</div>
                )}
              </div>
            </div>
          )}

          {/* Chat Area */}
          <div style={{ display: "flex", flexDirection: "column", overflow: "hidden", background: "#fafafa" }}>
            {selectedTicket ? (
              <>
                <div style={{ padding: "8px 14px", background: "#fff", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {isMobileView && (
                      <button onClick={() => setIsMobileView(true)} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}>
                        <BackIcon size={18} style={{ color: "#0D3CFC" }} />
                      </button>
                    )}
                    <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 600, color: "#0D3CFC" }}>
                      {selectedTicket.userName?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <div style={{ fontSize: "12px", fontWeight: 600, color: "#111", fontFamily: FONT_FAMILY }}>
                        {selectedTicket.topic}
                      </div>
                      <div style={{ fontSize: "9px", color: "#999", fontFamily: FONT_FAMILY }}>
                        {getStatusDisplay(selectedTicket).label}
                        {selectedTicket.typing && selectedTicket.status !== 'resolved' && (
                          <span style={{ color: "#0D3CFC", fontStyle: "italic", marginLeft: "4px" }}>
                            • {selectedTicket.typingUserName} mengetik...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                    <button onClick={() => resolveTicket(selectedTicket.id)} style={{ padding: "3px 10px", background: "#10b981", color: "#fff", border: "none", borderRadius: "4px", fontSize: "10px", cursor: "pointer", fontFamily: FONT_FAMILY }}>Selesaikan</button>
                  )}
                </div>

                <div ref={chatContainerRef} style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  {messages.length === 0 ? (
                    <div style={{ textAlign: "center", color: "#999", fontSize: "12px", padding: "24px 0" }}>Belum ada pesan</div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isMine = msg.senderId === user.uid;
                      const isSystem = msg.senderId === "system";
                      if (isSystem || msg.isAnnouncement || msg.isBroadcast) {
                        return (
                          <div key={idx} style={{ alignSelf: "center", maxWidth: "80%", padding: "4px 12px", borderRadius: "6px", background: msg.isAnnouncement ? "#fef3c7" : "#e0e7ff", color: msg.isAnnouncement ? "#92400e" : "#1e40af", fontSize: "10px", fontFamily: FONT_FAMILY, textAlign: "center", marginBottom: "4px" }}>
                            <div style={{ fontWeight: 600, fontSize: "9px" }}>{msg.senderName}</div>
                            <div>{msg.text}</div>
                            <div style={{ fontSize: "7px", opacity: 0.6, marginTop: "2px" }}>{formatTime(msg.timestamp)}</div>
                          </div>
                        );
                      }
                      return (
                        <div key={idx} style={{ alignSelf: isMine ? "flex-end" : "flex-start", maxWidth: "75%", padding: "6px 12px", borderRadius: isMine ? "12px 12px 4px 12px" : "12px 12px 12px 4px", background: isMine ? "#0D3CFC" : "#fff", color: isMine ? "#fff" : "#111", fontSize: "12px", fontFamily: FONT_FAMILY, wordBreak: "break-word", boxShadow: "0 1px 2px rgba(0,0,0,0.04)", border: !isMine ? "1px solid #eee" : "none" }}>
                          {!isMine && <div style={{ fontSize: "9px", fontWeight: 500, color: "#0D3CFC", marginBottom: "2px" }}>{msg.senderName}</div>}
                          <div>{msg.text}</div>
                          <div style={{ fontSize: "8px", color: isMine ? "rgba(255,255,255,0.6)" : "#999", marginTop: "3px", textAlign: "right" }}>{formatTime(msg.timestamp)}</div>
                        </div>
                      );
                    })
                  )}
                  {getTypingText(selectedTicket) && selectedTicket.status !== 'resolved' && (
                    <div style={{ alignSelf: "flex-start", fontSize: "10px", color: "#666", fontStyle: "italic", padding: "2px 10px", fontFamily: FONT_FAMILY }}>
                      {getTypingText(selectedTicket)}
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                  <div style={{ padding: "8px 12px", borderTop: "1px solid #eee", display: "flex", gap: "6px", background: "#fff", alignItems: "center", flexShrink: 0 }}>
                    <input type="text" value={messageText} onChange={handleTyping} onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey && messageText.trim()) { e.preventDefault(); sendMessage(); } }}
                      placeholder={selectedTicket.status === 'waiting' ? "Menunggu agent..." : "Ketik pesan..."}
                      disabled={selectedTicket.status === 'waiting'}
                      style={{ flex: 1, padding: "6px 14px", border: "1px solid #e8e8e8", borderRadius: "20px", fontSize: "12px", outline: "none", fontFamily: FONT_FAMILY, background: selectedTicket.status === 'waiting' ? "#f5f5f5" : "#f0f2f5", transition: "all 0.2s" }}
                      onFocus={(e) => { if (selectedTicket.status !== 'waiting') { e.currentTarget.style.borderColor = "#0D3CFC"; e.currentTarget.style.background = "#fff"; } }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "#e8e8e8"; e.currentTarget.style.background = selectedTicket.status === 'waiting' ? "#f5f5f5" : "#f0f2f5"; }} />
                    <button onClick={sendMessage} disabled={selectedTicket.status === 'waiting' || !messageText.trim()} style={{ padding: "6px 14px", background: (selectedTicket.status === 'waiting' || !messageText.trim()) ? "#ccc" : "#0D3CFC", color: "#fff", border: "none", borderRadius: "20px", cursor: (selectedTicket.status === 'waiting' || !messageText.trim()) ? "not-allowed" : "pointer", fontFamily: FONT_FAMILY, fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
                      <SendIcon size={14} /> Kirim
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#999", padding: "24px" }}>
                <ChatIcon size={24} style={{ opacity: 0.3, color: "#0D3CFC" }} />
                <span style={{ fontSize: "13px", color: "#333", fontFamily: FONT_FAMILY, marginTop: "10px" }}>Pilih chat dari daftar di kiri</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ===== ADMIN VIEW =====
  const activeTicketsForBroadcast = tickets.filter(t => t.status === 'active' || t.status === 'waiting');

  return (
    <div ref={containerRef} style={{ padding: "32px 0" }}>
      {/* Agent Profile */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", padding: "14px 20px", background: "#0D3CFC", borderRadius: "12px", color: "#fff", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" style={{ width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,255,255,0.3)" }} />
          ) : (
            <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: 600 }}>{AGENT_NAME.charAt(0)}</div>
          )}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "16px", fontWeight: 600 }}>{AGENT_NAME}</span>
              <span style={{ background: "rgba(255,255,255,0.15)", padding: "2px 10px", borderRadius: "8px", fontSize: "10px", fontWeight: 500 }}>Agent</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", opacity: 0.8 }}>
              <PulsingDots active={agentOnline} />
              <span>{agentOnline ? "Online" : "Offline"}</span>
              <span>• Customer Support</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          <button onClick={() => setShowBroadcastModal(true)} style={{ padding: "5px 12px", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "6px", color: "#fff", fontSize: "12px", cursor: "pointer", fontFamily: FONT_FAMILY, display: "flex", alignItems: "center", gap: "4px" }}>
            <BroadcastIcon size={14} /> Broadcast
          </button>
          <button onClick={() => setShowAnnouncementModal(true)} style={{ padding: "5px 12px", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "6px", color: "#fff", fontSize: "12px", cursor: "pointer", fontFamily: FONT_FAMILY, display: "flex", alignItems: "center", gap: "4px" }}>
            <AnnouncementIcon size={14} /> Pengumuman
          </button>
          <button onClick={handleLogout} style={{ padding: "5px 12px", background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "6px", color: "#fff", fontSize: "12px", cursor: "pointer", fontFamily: FONT_FAMILY, display: "flex", alignItems: "center", gap: "4px" }}>
            <LogoutIcon size={14} /> Logout
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ display: "grid", gridTemplateColumns: isMobileView ? "1fr" : "300px 1fr", gap: "0", background: "#fff", borderRadius: "12px", overflow: "hidden", border: "1px solid #eee", minHeight: "460px", maxHeight: "520px" }}>
        {/* Sidebar */}
        {(!isMobileView || !selectedTicket) && (
          <div style={{ background: "#f8f9fa", borderRight: isMobileView ? "none" : "1px solid #eee", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "10px 14px", background: "#fff", borderBottom: "1px solid #eee" }}>
              <div style={{ display: "flex", alignItems: "center", background: "#f0f2f5", borderRadius: "6px", padding: "4px 10px", gap: "6px" }}>
                <SearchIcon />
                <input type="text" placeholder="Cari chat..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "12px", fontFamily: FONT_FAMILY, color: "#111", padding: "5px 0" }} />
              </div>
            </div>

            <div style={{ display: "flex", padding: "4px 10px", background: "#fff", borderBottom: "1px solid #eee", gap: "2px" }}>
              {[
                { key: 'waiting', label: `Menunggu (${waitingCount})` },
                { key: 'active', label: `Aktif (${activeCount})` },
                { key: 'resolved', label: `Selesai (${resolvedCount})` }
              ].map((tab) => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key as any)} style={{ flex: 1, padding: "4px 0", fontSize: "10px", fontWeight: 600, fontFamily: FONT_FAMILY, border: "none", background: "transparent", cursor: "pointer", color: activeTab === tab.key ? "#0D3CFC" : "#999", borderBottom: activeTab === tab.key ? "2px solid #0D3CFC" : "2px solid transparent" }}>
                  {tab.label}
                </button>
              ))}
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "2px 0" }}>
              {filteredTickets.length === 0 ? (
                <div style={{ padding: "24px 16px", textAlign: "center", color: "#999", fontSize: "12px" }}>{searchQuery ? "Tidak ada hasil" : "Belum ada chat"}</div>
              ) : (
                filteredTickets.map((ticket) => {
                  const isActive = selectedTicket?.id === ticket.id;
                  const status = getStatusDisplay(ticket);
                  return (
                    <div key={ticket.id} onClick={() => { setSelectedTicket(ticket); if (ticket.status === 'waiting') takeTicket(ticket.id); if (isMobileView) setIsMobileView(false); }}
                      style={{ display: "flex", alignItems: "center", padding: "8px 12px", cursor: "pointer", background: isActive ? "rgba(13,60,252,0.06)" : "transparent", borderLeft: isActive ? "3px solid #0D3CFC" : "3px solid transparent", transition: "all 0.15s" }}
                      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "#f0f2f5"; }}
                      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                    >
                      <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: ticket.status === 'waiting' ? "#fef3c7" : "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 600, color: ticket.status === 'waiting' ? "#92400e" : "#0D3CFC", flexShrink: 0, marginRight: "12px" }}>
                        {ticket.userName?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "13px", fontWeight: 600, color: "#111", fontFamily: FONT_FAMILY, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "130px" }}>
                            {ticket.userName || "User"}
                          </span>
                          <span style={{ fontSize: "8px", color: status.color, background: status.color + "15", padding: "1px 6px", borderRadius: "4px" }}>
                            {status.label}
                          </span>
                        </div>
                        <div style={{ fontSize: "11px", color: ticket.typing && ticket.status !== 'resolved' ? "#0D3CFC" : "#999", fontFamily: FONT_FAMILY, fontStyle: ticket.typing ? "italic" : "normal", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "160px" }}>
                          {ticket.typing && ticket.status !== 'resolved' ? `${ticket.typingUserName || "Seseorang"} mengetik...` : (ticket.lastMessage || ticket.topic || "Mulai chat...")}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Chat Area */}
        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden", background: "#fafafa" }}>
          {selectedTicket ? (
            <>
              <div style={{ padding: "8px 16px", background: "#fff", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {isMobileView && (
                    <button onClick={() => setIsMobileView(true)} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}>
                      <BackIcon size={18} style={{ color: "#0D3CFC" }} />
                    </button>
                  )}
                  <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 600, color: "#0D3CFC" }}>
                    {selectedTicket.userName?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#111", fontFamily: FONT_FAMILY }}>
                      {selectedTicket.userName || "User"}
                    </div>
                    <div style={{ fontSize: "10px", color: "#999", fontFamily: FONT_FAMILY, display: "flex", alignItems: "center", gap: "4px" }}>
                      {selectedTicket.topic}
                      <span style={{ color: "#ddd" }}>•</span>
                      {getStatusDisplay(selectedTicket).label}
                      {selectedTicket.typing && selectedTicket.status !== 'resolved' && (
                        <span style={{ color: "#0D3CFC", fontStyle: "italic" }}>• {selectedTicket.typingUserName} mengetik...</span>
                      )}
                    </div>
                  </div>
                </div>
                {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                  <button onClick={() => resolveTicket(selectedTicket.id)} style={{ padding: "4px 12px", background: "#10b981", color: "#fff", border: "none", borderRadius: "6px", fontSize: "11px", cursor: "pointer", fontFamily: FONT_FAMILY }}>Selesaikan</button>
                )}
              </div>

              <div ref={chatContainerRef} style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: "4px" }}>
                {messages.length === 0 ? (
                  <div style={{ textAlign: "center", color: "#999", fontSize: "13px", padding: "32px 0" }}>Belum ada pesan</div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMine = msg.senderId === user.uid;
                    const isSystem = msg.senderId === "system";
                    if (isSystem || msg.isAnnouncement || msg.isBroadcast) {
                      return (
                        <div key={idx} style={{ alignSelf: "center", maxWidth: "80%", padding: "4px 14px", borderRadius: "8px", background: msg.isAnnouncement ? "#fef3c7" : "#e0e7ff", color: msg.isAnnouncement ? "#92400e" : "#1e40af", fontSize: "11px", fontFamily: FONT_FAMILY, textAlign: "center", marginBottom: "4px" }}>
                          <div style={{ fontWeight: 600, fontSize: "10px" }}>{msg.senderName}</div>
                          <div>{msg.text}</div>
                          <div style={{ fontSize: "8px", opacity: 0.6, marginTop: "2px" }}>{formatTime(msg.timestamp)}</div>
                        </div>
                      );
                    }
                    return (
                      <div key={idx} style={{ alignSelf: isMine ? "flex-end" : "flex-start", maxWidth: "70%", padding: "8px 14px", borderRadius: isMine ? "14px 14px 4px 14px" : "14px 14px 14px 4px", background: isMine ? "#0D3CFC" : "#fff", color: isMine ? "#fff" : "#111", fontSize: "13px", fontFamily: FONT_FAMILY, wordBreak: "break-word", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", border: !isMine ? "1px solid #eee" : "none" }}>
                        {!isMine && <div style={{ fontSize: "10px", fontWeight: 500, color: "#0D3CFC", marginBottom: "2px" }}>{msg.senderName}</div>}
                        <div>{msg.text}</div>
                        <div style={{ fontSize: "9px", color: isMine ? "rgba(255,255,255,0.6)" : "#999", marginTop: "4px", textAlign: "right" }}>{formatTime(msg.timestamp)}</div>
                      </div>
                    );
                  })
                )}
                {getTypingText(selectedTicket) && selectedTicket.status !== 'resolved' && (
                  <div style={{ alignSelf: "flex-start", fontSize: "11px", color: "#666", fontStyle: "italic", padding: "2px 12px", fontFamily: FONT_FAMILY }}>
                    {getTypingText(selectedTicket)}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                <div style={{ padding: "8px 14px", borderTop: "1px solid #eee", display: "flex", gap: "8px", background: "#fff", alignItems: "center", flexShrink: 0 }}>
                  <input type="text" value={messageText} onChange={handleTyping} onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey && messageText.trim()) { e.preventDefault(); sendMessage(); } }}
                    placeholder="Ketik balasan..." style={{ flex: 1, padding: "8px 16px", border: "1px solid #e8e8e8", borderRadius: "24px", fontSize: "13px", outline: "none", fontFamily: FONT_FAMILY, background: "#f0f2f5", transition: "all 0.2s" }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "#0D3CFC"; e.currentTarget.style.background = "#fff"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "#e8e8e8"; e.currentTarget.style.background = "#f0f2f5"; }} />
                  <button onClick={sendMessage} disabled={!messageText.trim()} style={{ padding: "8px 16px", background: messageText.trim() ? "#0D3CFC" : "#ccc", color: "#fff", border: "none", borderRadius: "24px", cursor: messageText.trim() ? "pointer" : "not-allowed", fontFamily: FONT_FAMILY, fontSize: "13px", display: "flex", alignItems: "center", gap: "4px" }}>
                    <SendIcon size={14} /> Kirim
                  </button>
                </div>
              )}
            </>
          ) : (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#999", padding: "32px" }}>
              <ChatIcon size={24} style={{ opacity: 0.3, color: "#0D3CFC" }} />
              <span style={{ fontSize: "14px", color: "#333", fontFamily: FONT_FAMILY, marginTop: "10px" }}>Pilih chat dari daftar di kiri</span>
              <span style={{ fontSize: "12px", color: "#999", fontFamily: FONT_FAMILY, marginTop: "4px" }}>{waitingCount > 0 ? `${waitingCount} chat menunggu` : "Belum ada chat masuk"}</span>
            </div>
          )}
        </div>
      </div>

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", maxWidth: "440px", width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <BroadcastIcon size={22} style={{ color: "#0D3CFC" }} />
              <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#0D3CFC", fontFamily: FONT_FAMILY, margin: 0 }}>Broadcast Pesan</h3>
            </div>
            <p style={{ fontSize: "13px", color: "#666", fontFamily: FONT_FAMILY, marginBottom: "14px" }}>Kirim ke {activeTicketsForBroadcast.length} chat aktif</p>
            <textarea value={broadcastMessage} onChange={(e) => setBroadcastMessage(e.target.value)} placeholder="Tulis pesan broadcast..." style={{ width: "100%", height: "100px", padding: "12px", border: "2px solid #e8e8e8", borderRadius: "10px", fontSize: "14px", fontFamily: FONT_FAMILY, outline: "none", resize: "vertical", transition: "border-color 0.2s" }} onFocus={(e) => e.currentTarget.style.borderColor = "#0D3CFC"} onBlur={(e) => e.currentTarget.style.borderColor = "#e8e8e8"} />
            <div style={{ display: "flex", gap: "8px", marginTop: "14px", justifyContent: "flex-end" }}>
              <button onClick={() => setShowBroadcastModal(false)} style={{ padding: "8px 20px", background: "transparent", color: "#666", border: "1px solid #e8e8e8", borderRadius: "8px", fontSize: "13px", cursor: "pointer", fontFamily: FONT_FAMILY }}>Batal</button>
              <button onClick={sendBroadcast} disabled={!broadcastMessage.trim()} style={{ padding: "8px 20px", background: broadcastMessage.trim() ? "#0D3CFC" : "#ccc", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", cursor: broadcastMessage.trim() ? "pointer" : "not-allowed", fontFamily: FONT_FAMILY }}>Kirim Broadcast</button>
            </div>
          </div>
        </div>
      )}

      {/* Announcement Modal */}
      {showAnnouncementModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", maxWidth: "440px", width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <AnnouncementIcon size={22} style={{ color: "#f59e0b" }} />
              <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#f59e0b", fontFamily: FONT_FAMILY, margin: 0 }}>Pengumuman</h3>
            </div>
            <p style={{ fontSize: "13px", color: "#666", fontFamily: FONT_FAMILY, marginBottom: "14px" }}>Kirim ke {tickets.filter(t => t.status !== 'resolved' && t.status !== 'closed').length} chat</p>
            <textarea value={announcementMessage} onChange={(e) => setAnnouncementMessage(e.target.value)} placeholder="Tulis pengumuman..." style={{ width: "100%", height: "100px", padding: "12px", border: "2px solid #e8e8e8", borderRadius: "10px", fontSize: "14px", fontFamily: FONT_FAMILY, outline: "none", resize: "vertical", transition: "border-color 0.2s" }} onFocus={(e) => e.currentTarget.style.borderColor = "#f59e0b"} onBlur={(e) => e.currentTarget.style.borderColor = "#e8e8e8"} />
            <div style={{ display: "flex", gap: "8px", marginTop: "14px", justifyContent: "flex-end" }}>
              <button onClick={() => setShowAnnouncementModal(false)} style={{ padding: "8px 20px", background: "transparent", color: "#666", border: "1px solid #e8e8e8", borderRadius: "8px", fontSize: "13px", cursor: "pointer", fontFamily: FONT_FAMILY }}>Batal</button>
              <button onClick={sendAnnouncement} disabled={!announcementMessage.trim()} style={{ padding: "8px 20px", background: announcementMessage.trim() ? "#f59e0b" : "#ccc", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", cursor: announcementMessage.trim() ? "pointer" : "not-allowed", fontFamily: FONT_FAMILY }}>Kirim Pengumuman</button>
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
  const titleRef = useRef<HTMLHeadingElement>(null);
  const liveChatTitleRef = useRef<HTMLDivElement>(null);
  const menuruFooterRef = useRef<HTMLDivElement>(null);
  const menuruTextRef = useRef<HTMLSpanElement>(null);
  const menuItemsRef = useRef<HTMLDivElement>(null);
  const menuBoxRef = useRef<HTMLDivElement>(null);
  const menuBox2Ref = useRef<HTMLDivElement>(null);
  const menuBox3Ref = useRef<HTMLDivElement>(null);
  const storiesRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

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
          await updateDoc(userRef, { online: true, lastSeen: serverTimestamp() });
        } catch (error) { console.error("Error updating online status:", error); }
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
    const ctx = gsap.context(() => {
      if (liveChatTitleRef.current) {
        const split = new SplitText(liveChatTitleRef.current, { type: "chars", charsClass: "split-char" });
        gsap.fromTo(split.chars, { opacity: 0, y: 30, filter: 'blur(6px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6, stagger: 0.04, ease: "back.out(1.2)", scrollTrigger: { trigger: liveChatTitleRef.current, start: "top 85%", toggleActions: "play none none reverse" } });
      }
    });
    return () => ctx.revert();
  }, [isMounted, showMain]);

  useEffect(() => {
    if (!isMounted || !showMain) return;
    const ctx = gsap.context(() => {
      if (menuruFooterRef.current && menuruTextRef.current) {
        const split = new SplitText(menuruTextRef.current, { type: "chars", charsClass: "menuru-char" });
        gsap.set(split.chars, { opacity: 0, y: 100, scale: 0.5, rotationX: 90 });
        ScrollTrigger.create({
          trigger: menuruFooterRef.current,
          start: "top 85%",
          onEnter: () => { gsap.to(split.chars, { opacity: 1, y: 0, scale: 1, rotationX: 0, duration: 1.2, stagger: 0.03, ease: "back.out(1.7)", overwrite: true }); },
          onLeave: () => { gsap.to(split.chars, { opacity: 0, y: 100, scale: 0.5, rotationX: 90, duration: 0.8, stagger: 0.02, ease: "power2.in", overwrite: true }); },
          onEnterBack: () => { gsap.to(split.chars, { opacity: 1, y: 0, scale: 1, rotationX: 0, duration: 1.2, stagger: 0.03, ease: "back.out(1.7)", overwrite: true }); }
        });
      }
    });
    return () => ctx.revert();
  }, [isMounted, showMain]);

  useEffect(() => {
    if (!menuOverlayRef.current || !isMounted) return;
    if (isMenuOpen) {
      gsap.fromTo(menuOverlayRef.current, { y: '-100%', opacity: 0 }, { y: '0%', opacity: 1, duration: 0.8, ease: 'power3.out', onComplete: () => {
        const items = menuOverlayRef.current?.querySelectorAll('.menu-item');
        if (items) { gsap.fromTo(items, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out' }); }
        [menuBoxRef, menuBox2Ref, menuBox3Ref].forEach((ref, i) => {
          if (ref.current) { gsap.fromTo(ref.current, { opacity: 0, scale: 0.9, x: 20 }, { opacity: 1, scale: 1, x: 0, duration: 0.8, ease: 'power3.out', delay: i * 0.15 }); }
        });
        if (storiesRef.current) { gsap.fromTo(storiesRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }); }
      }});
    } else {
      gsap.to(menuOverlayRef.current, { y: '-100%', opacity: 0, duration: 0.6, ease: 'power3.in' });
    }
  }, [isMenuOpen, isMounted]);

  const startPreloaderAnimation = () => {
    const tl = gsap.timeline({ onComplete: () => {
      if (preloaderRef.current) {
        gsap.to(preloaderRef.current, { opacity: 0, duration: 0.6, ease: "power2.inOut", onComplete: () => { setShowMain(true); setTimeout(() => ScrollTrigger.refresh(), 200); } });
      }
    }});
    gsap.set(textRef.current, { y: 100, opacity: 0 });
    tl.to(textRef.current, { y: 0, opacity: 1, duration: 0.8, ease: "back.out(1.7)" })
      .to(textRef.current, { duration: 0.6 })
      .to(textRef.current, { opacity: 0, y: -20, scale: 0.9, duration: 0.4, ease: "power2.out", onComplete: () => { if (textRef.current) textRef.current.textContent = "Note"; } })
      .to(textRef.current, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.7)" })
      .to(textRef.current, { duration: 0.8 })
      .to(textRef.current, { scale: 0.3, opacity: 0, duration: 0.7, ease: "power2.in" })
      .to(preloaderRef.current, { scale: 0.95, opacity: 0.8, duration: 0.3, ease: "power2.inOut" }, "-=0.3");
  };

  const toggleMenu = () => {
    if (!isMenuOpen) {
      setIsMenuOpen(true);
      if (plusIconRef.current) { gsap.to(plusIconRef.current, { rotation: 45, duration: 0.4, ease: "power2.out" }); }
    } else {
      if (plusIconRef.current) { gsap.to(plusIconRef.current, { rotation: 0, duration: 0.4, ease: "power2.in" }); }
      setIsMenuOpen(false);
    }
  };

  if (!isMounted || loading) {
    return (
      <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, fontFamily: FONT_FAMILY }}>
        <div style={{ display: "flex", alignItems: "center", gap: "32px", overflow: "hidden" }}>
          <span style={{ fontSize: "80px", fontWeight: 700, color: "#0D3CFC", letterSpacing: "-0.03em" }}>Menuru</span>
          <span ref={textRef} style={{ fontSize: "40px", fontWeight: 600, color: "#000000", letterSpacing: "-0.02em", display: "inline-block", willChange: "transform, opacity" }}>Shop</span>
        </div>
      </div>
    );
  }

  if (!showMain) {
    return (
      <div ref={preloaderRef} style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, fontFamily: FONT_FAMILY }}>
        <div style={{ display: "flex", alignItems: "center", gap: "32px", overflow: "hidden" }}>
          <span style={{ fontSize: "80px", fontWeight: 700, color: "#0D3CFC", letterSpacing: "-0.03em" }}>Menuru</span>
          <span ref={textRef} style={{ fontSize: "40px", fontWeight: 600, color: "#000000", letterSpacing: "-0.02em", display: "inline-block", willChange: "transform, opacity" }}>Shop</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Live Chat Agent | Menuru</title>
        <meta name="description" content="Live Chat Agent Menuru" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#0D3CFC" />
        <link rel="icon" href="/images/ai.jpg" type="image/jpeg" />
      </Head>

      <div style={{ minHeight: "100vh", background: "#ffffff", margin: 0, padding: 0, position: "relative", fontFamily: FONT_FAMILY }}>
        {/* HERO */}
        <div ref={heroRef} style={{ padding: "32px 40px", paddingTop: "100px", background: "#ffffff", position: "relative" }}>
          <h1 ref={titleRef} style={{ fontSize: "28px", fontWeight: 700, color: "#000", letterSpacing: "-0.03em", margin: 0, padding: "6px 14px", lineHeight: 1, position: "fixed", top: "32px", left: "32px", zIndex: 15, pointerEvents: "none", backdropFilter: "blur(10px)", background: "rgba(255,255,255,0.7)", borderRadius: "8px" }}>Menuru</h1>

          <div style={{ position: "relative", zIndex: 1, marginTop: "20px" }}>
            <p style={{ fontSize: "40px", fontWeight: 400, color: "#0D3CFC", lineHeight: 1.2, margin: 0, padding: 0, paddingBottom: "16px", whiteSpace: "pre-line" }}>
              {`Chat langsung dengan agent kami\nuntuk bantuan cepat dan tepat`}
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "12px" }}>
              <div style={{ display: "inline-block", border: "2px solid #0D3CFC", borderRadius: "8px", padding: "8px 20px", cursor: "pointer", background: "transparent" }}>
                <span style={{ fontSize: "14px", fontWeight: 500, color: "#0D3CFC" }}>Mulai Chat Sekarang</span>
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", border: "2px solid #0D3CFC", borderRadius: "8px", padding: "6px", cursor: "pointer", background: "#0D3CFC", color: "#fff", width: "38px", height: "38px" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7L17 17M17 7V17H7"/></svg>
              </div>
            </div>

            <div style={{ marginTop: "32px", display: "flex", justifyContent: "flex-start" }}>
              <span ref={liveChatTitleRef} style={{ fontSize: "52px", fontWeight: 700, color: "#0D3CFC", letterSpacing: "-0.02em", lineHeight: 1.1 }}>Live Chat Agent</span>
            </div>

            <div style={{ marginTop: "12px", display: "flex", justifyContent: "flex-start" }}>
              <span style={{ fontSize: "20px", fontWeight: 500, color: "#0D3CFC", letterSpacing: "-0.01em" }}>
                {user ? `Hi, ${user.displayName || user.email || "User"} 👋` : (
                  <>Silakan login untuk melanjutkan
                    <Link href="/" style={{ textDecoration: "none", marginLeft: "10px" }}>
                      <span style={{ fontSize: "16px", fontWeight: 600, color: "#fff", background: "#0D3CFC", padding: "4px 16px", borderRadius: "6px", display: "inline-block" }}>Login</span>
                    </Link>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Live Chat Agent */}
        <div style={{ padding: "0 40px", maxWidth: "1100px", margin: "0 auto", width: "100%" }}>
          <LiveChatAgent user={user} isAdmin={isAdmin} db={db} auth={auth} />
        </div>

        {/* FOOTER */}
        <div style={{ width: "100%", padding: "40px 40px 32px", background: "#ffffff", borderTop: "1px solid rgba(0,0,0,0.04)", marginTop: "32px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", left: "32px", top: "50%", transform: "translateY(-50%)", width: "120px", opacity: 0.4 }}><img src="/images/p0l.jpg" alt="" style={{ width: "100%", height: "auto", display: "block" }} /></div>
          <div style={{ position: "absolute", right: "32px", top: "50%", transform: "translateY(-50%)", width: "120px", opacity: 0.4 }}><img src="/images/xxz.jpg" alt="" style={{ width: "100%", height: "auto", display: "block" }} /></div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", maxWidth: "1100px", margin: "0 auto", gap: "32px", flexWrap: "wrap", position: "relative", zIndex: 1 }}>
            {footerLinks.map((section, idx) => (
              <div key={idx} style={{ flex: "1", minWidth: "150px" }}>
                <h3 style={{ fontSize: "20px", fontWeight: 600, color: "#000", margin: "0 0 10px", letterSpacing: "-0.01em" }}>{section.title}</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {section.links.map((link, linkIdx) => {
                    const href = link === "Live Chat Agent" ? "/live-chat-agent" : link === "Live Chat" ? "/live-chat" : link === "Kebijakan Privasi" ? "/privacy-policy" : link === "Ketentuan Kami" ? "/terms-of-service" : "#";
                    const isAttention = link === "Kebijakan Privasi" || link === "Ketentuan Kami";
                    return (
                      <div key={linkIdx} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Link href={href} style={{ textDecoration: "none" }}><span style={{ fontSize: "16px", fontWeight: 400, color: "#0D3CFC", letterSpacing: "-0.01em", cursor: "pointer" }}>{link}</span></Link>
                        {isAttention && <span style={{ background: "#0D3CFC", color: "#fff", padding: "1px 8px", borderRadius: "4px", fontSize: "9px", fontWeight: 600 }}>Update</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MENURU Text */}
        <div ref={menuruFooterRef} style={{ width: "100%", padding: "16px 40px 48px", background: "#ffffff", overflow: "hidden", display: "flex", justifyContent: "flex-start", minHeight: "200px" }}>
          <span ref={menuruTextRef} style={{ fontSize: "280px", fontWeight: 700, color: "#0D3CFC", letterSpacing: "-0.02em", lineHeight: "0.8", display: "block", textAlign: "left", WebkitFontSmoothing: "antialiased" }}>Menuru</span>
        </div>

        {/* NAVBAR */}
        <div style={{ position: "fixed", top: "32px", right: "32px", zIndex: 100, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px", padding: "12px 16px", borderRadius: "12px", background: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <Link href="/shop"><span style={{ fontSize: "13px", fontWeight: 500, color: "#0D3CFC", cursor: "pointer" }}>Shop</span></Link>
            <Link href="/profile"><span style={{ fontSize: "13px", fontWeight: 500, color: "#0D3CFC", cursor: "pointer" }}>About</span></Link>
            <Link href="/signup"><span style={{ fontSize: "13px", fontWeight: 500, color: "#0D3CFC", cursor: "pointer" }}>Sign Up</span></Link>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}><ShieldCheck size={18} /><span style={{ fontSize: "18px", fontWeight: 500, color: "#0D3CFC" }}>Anti-Fraud</span></div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}><ShieldCheck size={18} /><span style={{ fontSize: "18px", fontWeight: 500, color: "#0D3CFC" }}>Anti-Bot</span></div>
            <Link href="/contact"><div style={{ display: "flex", alignItems: "center", gap: "4px", border: "2px solid #0D3CFC", borderRadius: "6px", padding: "4px 10px", cursor: "pointer" }}><span style={{ fontSize: "12px", fontWeight: 500, color: "#0D3CFC" }}>Get in touch</span><div style={{ background: "#0D3CFC", borderRadius: "4px", padding: "2px", color: "#fff" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M17 17V7H7"/></svg></div></div></Link>
            <Link href="/pusat-bantuan"><div style={{ display: "flex", alignItems: "center", gap: "4px", border: "2px solid #000", borderRadius: "6px", padding: "4px 10px", cursor: "pointer" }}><span style={{ fontSize: "12px", fontWeight: 500, color: "#000" }}>Pusat Bantuan</span><div style={{ background: "#000", borderRadius: "4px", padding: "2px", color: "#fff" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 17L7 7M7 17V7H17"/></svg></div></div></Link>
            <div onClick={toggleMenu} style={{ display: "flex", alignItems: "center", gap: "4px", border: "2px solid #000", borderRadius: "6px", padding: "4px 10px", cursor: "pointer" }}>
              <div style={{ background: "#000", borderRadius: "4px", padding: "2px", color: "#fff" }}><span ref={plusIconRef} style={{ fontSize: isMenuOpen ? "16px" : "20px", fontWeight: isMenuOpen ? 400 : 300, lineHeight: 1, display: "inline-block" }}>{isMenuOpen ? "✕" : "+"}</span></div>
              <span style={{ fontSize: "12px", fontWeight: 500, color: "#000" }}>{isMenuOpen ? "Close" : "Menu"}</span>
            </div>
          </div>
        </div>

        {/* Menu Overlay */}
        <div ref={menuOverlayRef} style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "#0D3CFC", zIndex: 99, display: isMenuOpen ? "flex" : "none", flexDirection: "column", alignItems: "flex-start", justifyContent: "center", transform: "translateY(-100%)", opacity: 0, pointerEvents: isMenuOpen ? "auto" : "none", padding: "48px 64px", boxSizing: "border-box", overflow: "hidden" }}>
          <h1 style={{ position: "absolute", top: "32px", left: "32px", fontSize: "28px", fontWeight: 700, color: "#fff", letterSpacing: "-0.03em", margin: 0, padding: 0, lineHeight: 1, opacity: 0.9 }}>Menuru</h1>

          <div ref={menuItemsRef} style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%", maxWidth: "420px" }}>
            {menuItems.map((item, index) => (
              <Link key={index} href={item.name === "Live Chat Agent" ? "/live-chat-agent" : "/"} style={{ textDecoration: "none" }}>
                <div className="menu-item" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 14px", borderRadius: "6px", cursor: "pointer", background: "transparent", opacity: 0, transform: "translateY(30px)" }}>
                  <span style={{ fontSize: "32px", fontWeight: 600, color: "#fff", letterSpacing: "-0.02em" }}>{item.name}</span>
                  <span style={{ fontSize: "18px", fontWeight: 300, color: "#fff" }}>{item.number}</span>
                </div>
              </Link>
            ))}
          </div>

          <div ref={storiesRef} style={{ position: "absolute", left: "500px", top: "160px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "4px", opacity: 0 }}>
            <span style={{ fontSize: "28px", fontWeight: 300, color: "#fff", letterSpacing: "0.05em" }}>stories</span>
          </div>

          {[
            { ref: menuBoxRef, top: 'auto', bottom: '64px', right: '64px', bg: '#D9FF81', border: '#D9FF81', text: 'Bagaimana website ini', text2: 'bisa berkembang?', sub: 'Dengan dukungan komunitas', img: '/images/10.jpg' },
            { ref: menuBox2Ref, top: '220px', left: '500px', bg: '#C8EEFF', border: '#C8EEFF', text: 'Bagaimana Rasa nya Masuk', text2: 'Kuliah Di Universitas', sub: 'Gunadarma', img: '/images/10.jpg' },
            { ref: menuBox3Ref, top: '400px', left: '500px', bg: '#C8EEFF', border: '#C8EEFF', text: 'Mengapa saya memilih', text2: 'jurusan tersebut?', sub: '', img: '/images/15.jpg' }
          ].map((box, i) => (
            <div key={i} ref={box.ref} style={{
              position: "absolute", top: box.top !== 'auto' ? box.top : 'auto', bottom: box.bottom !== 'auto' ? box.bottom : 'auto',
              right: box.right !== 'auto' ? box.right : 'auto', left: box.left !== 'auto' ? box.left : 'auto',
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px",
              border: `2px solid ${box.border}`, borderRadius: "12px", padding: "14px 20px",
              background: box.bg, cursor: "pointer", opacity: 0, transform: "scale(0.95)",
              maxWidth: "420px", width: "auto", minHeight: "60px"
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1 }}>
                <span style={{ fontSize: "16px", fontWeight: 600, color: "#0D3CFC", lineHeight: 1.3 }}>{box.text}</span>
                {box.text2 && <span style={{ fontSize: "16px", fontWeight: 600, color: "#0D3CFC", lineHeight: 1.3 }}>{box.text2}</span>}
                {box.sub && <span style={{ fontSize: "12px", fontWeight: 400, color: "rgba(13,60,252,0.6)", lineHeight: 1.3 }}>{box.sub}</span>}
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", background: "rgba(13,60,252,0.06)", borderRadius: "6px", padding: "2px", width: "48px", height: "48px", overflow: "hidden", flexShrink: 0 }}>
                <img src={box.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "6px" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        html, body { overflow: auto !important; -ms-overflow-style: none !important; scrollbar-width: none !important; margin: 0; padding: 0; background: #fff !important; }
        html::-webkit-scrollbar, body::-webkit-scrollbar { display: none !important; width: 0 !important; }
        * { background-color: transparent; }
        .menuru-char, .split-char { display: inline-block; will-change: transform, opacity, filter; }
        @media (max-width: 768px) {
          .hero-title { font-size: 28px !important; }
          .hero-sub { font-size: 20px !important; }
          .live-chat-title { font-size: 32px !important; }
          .menu-overlay { padding: 24px !important; }
          .menu-overlay .stories { display: none !important; }
          .menu-overlay .menu-box, .menu-overlay .menu-box2, .menu-overlay .menu-box3 {
            position: relative !important; left: auto !important; right: auto !important;
            top: auto !important; bottom: auto !important; margin-top: 10px !important;
            max-width: 100% !important; width: 100% !important; padding: 8px 12px !important;
            min-height: 40px !important;
          }
          .menu-overlay .menu-box span, .menu-overlay .menu-box2 span, .menu-overlay .menu-box3 span {
            font-size: 13px !important;
          }
          .menu-overlay .menu-box img, .menu-overlay .menu-box2 img, .menu-overlay .menu-box3 img {
            width: 36px !important; height: 36px !important;
          }
        }
        @media (max-width: 480px) {
          .hero-title { font-size: 22px !important; }
          .hero-sub { font-size: 16px !important; }
          .live-chat-title { font-size: 24px !important; }
          .menu-overlay .menu-text { font-size: 22px !important; }
        }
      `}</style>
    </>
  );
}
