// app/contact/page.tsx (Halaman Contact - FINAL FIXED)
'use client';

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { initializeApp, getApps } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
  where,
  getDocs,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

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
let db = null;
let auth = null;

if (typeof window !== "undefined") {
  app = getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApps()[0];
  db = getFirestore(app);
  auth = getAuth(app);
}

// SVG Icons
const SouthEastArrow = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 17L17 7M17 17V7H7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const NorthWestArrow = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 17L7 7M7 17V7H17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const NorthEastArrow = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 7L17 17M17 7V17H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SendIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const FONT_FAMILY = "'Poppins', 'Poppins Fallback', sans-serif";
const ADMIN_EMAIL = "faridardiansyah061@gmail.com";
const AGENT_NAME = "Farid Ardiansyah";

// ===== LIVE CHAT AGENT INTERFACES =====
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

// ===== FEEDBACK INTERFACE =====
interface Feedback {
  id: string;
  name: string;
  message: string;
  createdAt: any;
  userId?: string;
  userEmail?: string;
}

// ============================================================
// ===== PULSING DOTS =====
// ============================================================
const PulsingDots = ({ active }: { active: boolean }) => {
  if (!active) return <span style={{ color: '#999', fontSize: '12px' }}>● Offline</span>;
  return (
    <span style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
      <span className="dot" style={{ animationDelay: '0s' }}>●</span>
      <span className="dot" style={{ animationDelay: '0.2s' }}>●</span>
      <span className="dot" style={{ animationDelay: '0.4s' }}>●</span>
      <style>{`
        .dot {
          animation: blink 1.4s infinite both;
          font-size: 10px;
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
          Official Account
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

// ============================================================
// ===== LIVE CHAT AGENT COMPONENT =====
// ============================================================
const LiveChatAgent = ({ user, isAdmin, db, auth }: { user: any; isAdmin: boolean; db: any; auth: any }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [showStartChat, setShowStartChat] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [agentOnline, setAgentOnline] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
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

  const WaitingIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  );

  const ActiveIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  );

  const ResolvedIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  );

  const ChatIconSmall = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );

  const ChatIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const LiveChatIllustration = () => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="#0D3CFC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="8" cy="10" r="1" fill="#0D3CFC"/>
      <circle cx="12" cy="10" r="1" fill="#0D3CFC"/>
      <circle cx="16" cy="10" r="1" fill="#0D3CFC"/>
    </svg>
  );

  // GSAP SplitText untuk judul Live Chat Agent
  useEffect(() => {
    if (liveChatTitleRef.current) {
      const splitTitle = new SplitText(liveChatTitleRef.current, {
        type: "chars",
        charsClass: "split-char-livechat"
      });
      gsap.fromTo(splitTitle.chars,
        { opacity: 0, y: 30, filter: 'blur(10px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.8,
          stagger: 0.05,
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
  }, []);

  // ===== ALL useEffect HOOKS =====
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

  // ===== FUNGSI =====
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

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getTypingText = (ticket: Ticket | null) => {
    if (!ticket || !ticket.typing) return null;
    const name = ticket.typingUserName || "Seseorang";
    return `${name} sedang mengetik...`;
  };

  // ============================================================
  // ===== RENDER COMPONENT =====
  // ============================================================
  
  if (!user) {
    return (
      <div style={{
        marginTop: "40px",
        borderTop: "1px solid #e8e8e8",
        paddingTop: "30px",
      }}>
        <h3 ref={liveChatTitleRef} style={{
          fontSize: "24px",
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
            borderRadius: "12px",
            padding: "12px",
            width: "60px",
            height: "60px",
          }}>
            <LiveChatIllustration />
          </div>
          <div>
            <p style={{
              fontSize: "14px",
              color: "#666",
              fontFamily: FONT_FAMILY,
              marginBottom: "8px",
            }}>
              Silakan login untuk menggunakan Live Chat Agent
            </p>
            <Link href="/" style={{ textDecoration: "none" }}>
              <button
                style={{
                  padding: "6px 20px",
                  backgroundColor: "#0D3CFC",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "13px",
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
    const activeTicket = tickets.find(t => t.status === 'waiting' || t.status === 'active');

    if (tickets.length === 0 && !showStartChat) {
      return (
        <div style={{ marginTop: "40px", borderTop: "1px solid #e8e8e8", paddingTop: "30px" }}>
          <h3 ref={liveChatTitleRef} style={{
            fontSize: "24px",
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
            gap: "12px",
            marginBottom: "12px",
          }}>
            <PulsingDots active={agentOnline} />
            <span style={{ fontSize: "13px", color: agentOnline ? "#0D3CFC" : "#999", fontFamily: FONT_FAMILY }}>
              {agentOnline ? "Agent Online" : "Agent Offline"}
            </span>
          </div>
          <p style={{ fontSize: "14px", color: "#666", fontFamily: FONT_FAMILY, marginBottom: "12px" }}>
            Butuh bantuan? Chat langsung dengan agent kami.
          </p>
          <button
            onClick={() => setShowStartChat(true)}
            style={{
              padding: "8px 20px",
              backgroundColor: "#0D3CFC",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
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
        <div style={{ marginTop: "40px", borderTop: "1px solid #e8e8e8", paddingTop: "30px" }}>
          <h3 ref={liveChatTitleRef} style={{
            fontSize: "24px",
            fontWeight: 600,
            color: "#0D3CFC",
            fontFamily: FONT_FAMILY,
            marginBottom: "12px",
          }}>
            Live Chat Agent
          </h3>
          <div style={{ maxWidth: "380px" }}>
            <div style={{ fontSize: "14px", marginBottom: "10px", fontFamily: FONT_FAMILY }}>
              Pilih topik permasalahan Anda:
            </div>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "2px solid #0D3CFC",
                borderRadius: "6px",
                fontSize: "14px",
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
                  padding: "6px 16px",
                  backgroundColor: selectedTopic ? "#0D3CFC" : "#ccc",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "13px",
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
                  padding: "6px 16px",
                  backgroundColor: "transparent",
                  color: "#666",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  fontSize: "13px",
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

    // USER VIEW - DENGAN JUDUL DAN NAMA AGENT
    return (
      <div style={{ marginTop: "40px", borderTop: "1px solid #e8e8e8", paddingTop: "30px" }}>
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
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <PulsingDots active={agentOnline} />
            <span style={{ fontSize: "12px", color: agentOnline ? "#0D3CFC" : "#999", fontFamily: FONT_FAMILY }}>
              {agentOnline ? "Online" : "Offline"}
            </span>
            <span style={{ fontSize: "12px", color: "#999", fontFamily: FONT_FAMILY }}>•</span>
            <span style={{ fontSize: "12px", color: "#0D3CFC", fontFamily: FONT_FAMILY }}>
              {AGENT_NAME}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "16px", height: "480px", maxHeight: "480px" }}>
          <div style={{
            width: "240px",
            backgroundColor: "#0D3CFC",
            borderRadius: "10px",
            padding: "12px 0",
            overflowY: "auto",
            flexShrink: 0,
            color: "#fff",
            fontFamily: FONT_FAMILY,
            boxShadow: "0 2px 12px rgba(13,60,252,0.12)",
            maxHeight: "480px",
          }}>
            <div style={{
              padding: "0 14px 10px 14px",
              borderBottom: "1px solid rgba(255,255,255,0.15)",
              fontWeight: 600,
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
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
                fontSize: "10px",
                backgroundColor: "rgba(255,255,255,0.2)",
                padding: "1px 8px",
                borderRadius: "10px",
              }}>{tickets.length}</span>
            </div>
            <div style={{ overflowY: "auto", maxHeight: "400px" }}>
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
                      padding: "10px 14px",
                      borderLeft: isActive ? "3px solid #fff" : "3px solid transparent",
                      backgroundColor: isActive ? "rgba(255,255,255,0.12)" : "transparent",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div style={{ fontWeight: 500, fontSize: "13px", color: "#fff" }}>
                      {ticket.userName}
                    </div>
                    <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)" }}>
                      {ticket.topic}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                      <span style={{
                        fontSize: "9px",
                        backgroundColor: statusColor,
                        color: statusTextColor,
                        padding: "1px 8px",
                        borderRadius: "10px",
                        fontWeight: 500,
                      }}>
                        {statusLabel}
                      </span>
                      <span style={{ fontSize: "8px", color: "rgba(255,255,255,0.4)" }}>
                        {ticketId}
                      </span>
                    </div>
                  </div>
                );
              })}
              {tickets.length === 0 && (
                <div style={{ padding: "30px 14px", textAlign: "center", color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>
                  Belum ada chat
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
                  padding: "6px",
                  backgroundColor: "rgba(255,255,255,0.15)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "12px",
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
            borderRadius: "10px",
            border: "1px solid #e8e8e8",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            maxHeight: "480px",
          }}>
            {selectedTicket ? (
              <>
                <div style={{
                  padding: "10px 14px",
                  backgroundColor: "#0D3CFC",
                  borderBottom: "1px solid #e8e8e8",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexShrink: 0,
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "14px", color: "#ffffff", fontFamily: FONT_FAMILY }}>
                      {selectedTicket.userName}
                      <span style={{ fontSize: "11px", fontWeight: 400, color: "rgba(255,255,255,0.7)", marginLeft: "6px", fontFamily: FONT_FAMILY }}>
                        {selectedTicket.topic}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <span style={{ fontSize: "10px", color: selectedTicket.status === 'waiting' ? "#fef3c7" : "#d1fae5", fontFamily: FONT_FAMILY }}>
                        {selectedTicket.status === 'waiting' ? 'Menunggu' : 'Aktif'}
                      </span>
                      {selectedTicket.typing && selectedTicket.status !== 'resolved' && (
                        <span style={{ fontSize: "10px", color: "#ffd700", fontStyle: "italic", fontFamily: FONT_FAMILY }}>
                          {selectedTicket.typingUserName} mengetik...
                        </span>
                      )}
                      <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.5)" }}>
                        {generateTicketId(selectedTicket.createdAt)}
                      </span>
                    </div>
                  </div>
                  {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                    <button
                      onClick={() => resolveTicket(selectedTicket.id)}
                      style={{
                        padding: "4px 10px",
                        backgroundColor: "#22c55e",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        fontSize: "10px",
                        cursor: "pointer",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      Selesaikan
                    </button>
                  )}
                </div>
                <div 
                  ref={messagesContainerRef}
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    minHeight: "200px",
                    maxHeight: "380px",
                  }}
                >
                  {messages.length === 0 ? (
                    <div style={{ textAlign: "center", color: "#999", fontSize: "12px", padding: "30px 0", fontFamily: FONT_FAMILY }}>
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
                            padding: "6px 10px",
                            borderRadius: "8px",
                            backgroundColor: isMine ? "#0D3CFC" : "#e8e8e8",
                            color: isMine ? "#fff" : "#000",
                            fontSize: "12px",
                            fontFamily: FONT_FAMILY,
                          }}
                        >
                          {!isMine && (
                            <div style={{ fontSize: "9px", fontWeight: 500, color: "#0D3CFC", marginBottom: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
                              {msg.senderName}
                              {isAgent && <InstagramVerifiedBadge size={10} />}
                            </div>
                          )}
                          <div>{msg.text}</div>
                          <div style={{ 
                            fontSize: "7px", 
                            color: isMine ? "rgba(255,255,255,0.6)" : "#999", 
                            marginTop: "2px",
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
                      fontSize: "11px",
                      color: "#666",
                      fontStyle: "italic",
                      padding: "2px 6px",
                      fontFamily: FONT_FAMILY,
                    }}>
                      {getTypingText(selectedTicket)}
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                  <div style={{
                    padding: "8px 12px",
                    borderTop: "1px solid #e8e8e8",
                    display: "flex",
                    gap: "6px",
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
                        padding: "6px 10px",
                        border: "1px solid #e8e8e8",
                        borderRadius: "6px",
                        fontSize: "12px",
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
                        padding: "6px 12px",
                        backgroundColor: (selectedTicket.status === 'waiting' || !messageText.trim()) ? "#ccc" : "#0D3CFC",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: (selectedTicket.status === 'waiting' || !messageText.trim()) ? "not-allowed" : "pointer",
                        fontFamily: FONT_FAMILY,
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "12px",
                      }}
                    >
                      <SendIcon />
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
                fontSize: "13px",
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
    <div style={{ marginTop: "40px", borderTop: "1px solid #e8e8e8", paddingTop: "30px" }}>
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
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <PulsingDots active={agentOnline} />
          <span style={{ fontSize: "12px", color: agentOnline ? "#0D3CFC" : "#999", fontFamily: FONT_FAMILY }}>
            {agentOnline ? "Online" : "Offline"}
          </span>
          <span style={{ fontSize: "12px", color: "#999", fontFamily: FONT_FAMILY }}>•</span>
          <span style={{ fontSize: "12px", color: "#0D3CFC", fontFamily: FONT_FAMILY }}>
            {AGENT_NAME}
          </span>
          <span style={{
            backgroundColor: "#d1fae5",
            color: "#065f46",
            fontSize: "9px",
            fontWeight: 600,
            padding: "1px 8px",
            borderRadius: "10px",
            fontFamily: FONT_FAMILY,
          }}>
            Agent
          </span>
          <InstagramVerifiedBadge size={12} />
        </div>
      </div>

      <div style={{ display: "flex", gap: "16px", height: "480px", maxHeight: "480px" }}>
        <div style={{
          width: "260px",
          backgroundColor: "#f9f9f9",
          borderRadius: "10px",
          border: "1px solid #e8e8e8",
          overflowY: "auto",
          flexShrink: 0,
          maxHeight: "480px",
        }}>
          {waitingTickets.length > 0 && (
            <div>
              <div style={{
                padding: "8px 12px",
                backgroundColor: "#fef3c7",
                fontWeight: 600,
                fontSize: "12px",
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
                    padding: "8px 12px",
                    borderBottom: "1px solid #e8e8e8",
                    cursor: "pointer",
                    backgroundColor: selectedTicket?.id === ticket.id ? "rgba(13,60,252,0.08)" : "transparent",
                    transition: "background 0.2s ease",
                  }}
                >
                  <div style={{ fontWeight: 500, fontSize: "12px", color: "#0D3CFC", fontFamily: FONT_FAMILY }}>{ticket.userName}</div>
                  <div style={{ fontSize: "10px", color: "#666", fontFamily: FONT_FAMILY }}>{ticket.topic}</div>
                  {ticket.typing && <div style={{ fontSize: "9px", color: "#0D3CFC", fontStyle: "italic", fontFamily: FONT_FAMILY }}>{ticket.typingUserName} mengetik...</div>}
                </div>
              ))}
            </div>
          )}

          {activeTickets.length > 0 && (
            <div>
              <div style={{
                padding: "8px 12px",
                backgroundColor: "#d1fae5",
                fontWeight: 600,
                fontSize: "12px",
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
                    padding: "8px 12px",
                    borderBottom: "1px solid #e8e8e8",
                    cursor: "pointer",
                    backgroundColor: selectedTicket?.id === ticket.id ? "rgba(13,60,252,0.08)" : "transparent",
                    transition: "background 0.2s ease",
                  }}
                >
                  <div style={{ fontWeight: 500, fontSize: "12px", color: "#0D3CFC", fontFamily: FONT_FAMILY }}>{ticket.userName}</div>
                  <div style={{ fontSize: "10px", color: "#666", fontFamily: FONT_FAMILY }}>{ticket.topic}</div>
                  {ticket.typing && <div style={{ fontSize: "9px", color: "#0D3CFC", fontStyle: "italic", fontFamily: FONT_FAMILY }}>{ticket.typingUserName} mengetik...</div>}
                  {ticket.lastMessage && <div style={{ fontSize: "9px", color: "#999", marginTop: "2px", fontFamily: FONT_FAMILY }}>{ticket.lastMessage.substring(0, 30)}{ticket.lastMessage.length > 30 ? "..." : ""}</div>}
                </div>
              ))}
            </div>
          )}

          {resolvedTickets.length > 0 && (
            <div>
              <div style={{
                padding: "8px 12px",
                backgroundColor: "#e5e7eb",
                fontWeight: 600,
                fontSize: "12px",
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
                      padding: "8px 12px",
                      borderBottom: "1px solid #e8e8e8",
                      cursor: "pointer",
                      backgroundColor: selectedTicket?.id === ticket.id ? "rgba(13,60,252,0.08)" : "transparent",
                      transition: "background 0.2s ease",
                      opacity: 0.7,
                    }}
                  >
                    <div style={{ fontWeight: 500, fontSize: "12px", color: "#0D3CFC", fontFamily: FONT_FAMILY }}>{ticket.userName}</div>
                    <div style={{ fontSize: "10px", color: "#666", fontFamily: FONT_FAMILY }}>{ticket.topic}</div>
                    <div style={{ fontSize: "9px", color: "#6b7280", fontFamily: FONT_FAMILY }}>{ticketId}</div>
                  </div>
                );
              })}
            </div>
          )}

          {waitingTickets.length === 0 && activeTickets.length === 0 && resolvedTickets.length === 0 && (
            <div style={{ padding: "30px 12px", textAlign: "center", color: "#999", fontSize: "12px", fontFamily: FONT_FAMILY }}>
              Tidak ada chat masuk
            </div>
          )}
        </div>

        <div style={{
          flex: 1,
          backgroundColor: "#ffffff",
          borderRadius: "10px",
          border: "1px solid #e8e8e8",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          maxHeight: "480px",
        }}>
          {selectedTicket ? (
            <>
              <div style={{
                padding: "10px 14px",
                backgroundColor: "#0D3CFC",
                borderBottom: "1px solid #e8e8e8",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexShrink: 0,
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "14px", color: "#ffffff", fontFamily: FONT_FAMILY }}>
                    {selectedTicket.userName}
                    <span style={{ fontSize: "11px", fontWeight: 400, color: "rgba(255,255,255,0.7)", marginLeft: "6px", fontFamily: FONT_FAMILY }}>
                      {selectedTicket.topic}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ fontSize: "10px", color: selectedTicket.status === 'waiting' ? "#fef3c7" : "#d1fae5", fontFamily: FONT_FAMILY }}>
                      {selectedTicket.status === 'waiting' ? 'Menunggu' : 'Aktif'}
                    </span>
                    {selectedTicket.typing && selectedTicket.status !== 'resolved' && (
                      <span style={{ fontSize: "10px", color: "#ffd700", fontStyle: "italic", fontFamily: FONT_FAMILY }}>
                        {selectedTicket.typingUserName} mengetik...
                      </span>
                    )}
                    <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.5)" }}>
                      {generateTicketId(selectedTicket.createdAt)}
                    </span>
                  </div>
                </div>
                {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                  <button
                    onClick={() => resolveTicket(selectedTicket.id)}
                    style={{
                      padding: "4px 10px",
                      backgroundColor: "#22c55e",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      fontSize: "10px",
                      cursor: "pointer",
                      fontFamily: FONT_FAMILY,
                    }}
                  >
                    Selesaikan
                  </button>
                )}
              </div>
              <div 
                ref={messagesContainerRef}
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  minHeight: "200px",
                  maxHeight: "380px",
                }}
              >
                {messages.length === 0 ? (
                  <div style={{ textAlign: "center", color: "#999", fontSize: "12px", padding: "30px 0", fontFamily: FONT_FAMILY }}>
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
                          padding: "6px 10px",
                          borderRadius: "8px",
                          backgroundColor: isMine ? "#0D3CFC" : "#e8e8e8",
                          color: isMine ? "#fff" : "#000",
                          fontSize: "12px",
                          fontFamily: FONT_FAMILY,
                        }}
                      >
                        {!isMine && (
                          <div style={{ fontSize: "9px", fontWeight: 500, color: "#0D3CFC", marginBottom: "2px", fontFamily: FONT_FAMILY }}>
                            {msg.senderName}
                          </div>
                        )}
                        <div>{msg.text}</div>
                        <div style={{ 
                          fontSize: "7px", 
                          color: isMine ? "rgba(255,255,255,0.6)" : "#999", 
                          marginTop: "2px",
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
                    fontSize: "11px",
                    color: "#666",
                    fontStyle: "italic",
                    padding: "2px 6px",
                    fontFamily: FONT_FAMILY,
                  }}>
                    {typingText}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                <div style={{
                  padding: "8px 12px",
                  borderTop: "1px solid #e8e8e8",
                  display: "flex",
                  gap: "6px",
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
                      padding: "6px 10px",
                      border: "1px solid #e8e8e8",
                      borderRadius: "6px",
                      fontSize: "12px",
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
                      padding: "6px 12px",
                      backgroundColor: messageText.trim() ? "#0D3CFC" : "#ccc",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      cursor: messageText.trim() ? "pointer" : "not-allowed",
                      fontFamily: FONT_FAMILY,
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "12px",
                    }}
                  >
                    <SendIcon />
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
              fontSize: "13px",
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
// ===== KRITIK & SARAN COMPONENT =====
// ============================================================
const FeedbackSection = ({ db, user }: { db: any; user: any }) => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const SendIconFeedback = ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "feedbacks"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Feedback[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Feedback);
      });
      setFeedbacks(list);
    });
    return () => unsubscribe();
  }, [db]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 3000);
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "feedbacks"), {
        name: name.trim(),
        message: message.trim(),
        createdAt: serverTimestamp(),
        userId: user?.uid || null,
        userEmail: user?.email || null,
      });
      setName("");
      setMessage("");
      setSubmitStatus('success');
      setTimeout(() => setSubmitStatus('idle'), 3000);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (timestamp: any) => {
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

  return (
    <div style={{ marginTop: "40px", borderTop: "1px solid #e8e8e8", paddingTop: "30px" }}>
      <h3 style={{ fontSize: "24px", fontWeight: 600, color: "#0D3CFC", fontFamily: FONT_FAMILY, marginBottom: "6px" }}>
        Kritik & Saran
      </h3>
      <p style={{ fontSize: "14px", color: "#666", fontFamily: FONT_FAMILY, marginBottom: "20px" }}>
        Kirimkan kritik dan saran Anda untuk pengembangan Menuru menjadi lebih baik.
      </p>

      <form onSubmit={handleSubmit} style={{ maxWidth: "500px", marginBottom: "30px" }}>
        <div style={{ marginBottom: "12px" }}>
          <label style={{ fontSize: "13px", fontWeight: 500, color: "#000", fontFamily: FONT_FAMILY, display: "block", marginBottom: "3px" }}>
            Nama
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Masukkan nama Anda"
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "2px solid #e8e8e8",
              borderRadius: "8px",
              fontSize: "14px",
              fontFamily: FONT_FAMILY,
              outline: "none",
              transition: "border-color 0.2s ease",
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = "#0D3CFC"}
            onBlur={(e) => e.currentTarget.style.borderColor = "#e8e8e8"}
          />
        </div>
        <div style={{ marginBottom: "12px" }}>
          <label style={{ fontSize: "13px", fontWeight: 500, color: "#000", fontFamily: FONT_FAMILY, display: "block", marginBottom: "3px" }}>
            Keterangan / Saran
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tulis kritik atau saran Anda..."
            rows={3}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "2px solid #e8e8e8",
              borderRadius: "8px",
              fontSize: "14px",
              fontFamily: FONT_FAMILY,
              outline: "none",
              resize: "vertical",
              minHeight: "80px",
              transition: "border-color 0.2s ease",
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = "#0D3CFC"}
            onBlur={(e) => e.currentTarget.style.borderColor = "#e8e8e8"}
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: "8px 28px",
            backgroundColor: "#0D3CFC",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 500,
            cursor: isSubmitting ? "not-allowed" : "pointer",
            fontFamily: FONT_FAMILY,
            opacity: isSubmitting ? 0.7 : 1,
            transition: "background 0.2s ease",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
          onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.backgroundColor = "#0a2fc9"; }}
          onMouseLeave={(e) => { if (!isSubmitting) e.currentTarget.style.backgroundColor = "#0D3CFC"; }}
        >
          <SendIconFeedback />
          <span>{isSubmitting ? "Mengirim..." : "Kirim Kritik & Saran"}</span>
        </button>
        {submitStatus === 'success' && (
          <p style={{ color: "#22c55e", fontSize: "13px", marginTop: "6px", fontFamily: FONT_FAMILY }}>
            ✓ Kritik & saran berhasil dikirim! Terima kasih.
          </p>
        )}
        {submitStatus === 'error' && (
          <p style={{ color: "#ef4444", fontSize: "13px", marginTop: "6px", fontFamily: FONT_FAMILY }}>
            ⚠️ Gagal mengirim. Silakan coba lagi.
          </p>
        )}
      </form>

      {feedbacks.length > 0 && (
        <div style={{ 
          position: "relative", 
          padding: "16px 16px 16px 36px",
          backgroundColor: "#0D3CFC",
          borderRadius: "12px",
          maxWidth: "700px",
        }}>
          <div style={{
            position: "absolute",
            left: "16px",
            top: "16px",
            bottom: "16px",
            width: "2px",
            borderLeft: "2px dashed rgba(255,255,255,0.3)",
          }} />
          
          {feedbacks.length > 0 && (
            <div style={{
              position: "absolute",
              left: "10px",
              top: "16px",
              width: "14px",
              height: "14px",
              borderRadius: "50%",
              backgroundColor: "#000000",
              border: "2px solid #ffffff",
              zIndex: 2,
            }} />
          )}

          {feedbacks.map((item, index) => (
            <div key={item.id} style={{ 
              position: "relative", 
              paddingBottom: index < feedbacks.length - 1 ? "16px" : "0", 
              paddingLeft: "16px",
              paddingTop: index === 0 ? "0" : "4px",
            }}>
              {index > 0 && (
                <div style={{
                  position: "absolute",
                  left: "-12px",
                  top: "6px",
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: "#ffffff",
                  border: "2px solid #0D3CFC",
                  boxShadow: "0 0 0 2px #ffffff",
                  zIndex: 2,
                }} />
              )}
              
              <div style={{
                backgroundColor: "rgba(255,255,255,0.08)",
                borderRadius: "8px",
                padding: "10px 14px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px", flexWrap: "wrap", gap: "4px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 600, color: "#ffffff", fontFamily: FONT_FAMILY }}>
                    #{index + 1} {item.name}
                  </span>
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", fontFamily: FONT_FAMILY }}>
                    {formatDate(item.createdAt)}
                  </span>
                </div>
                <p style={{ fontSize: "13px", color: "#ffffff", fontFamily: FONT_FAMILY, margin: 0, lineHeight: 1.5, opacity: 0.9 }}>
                  {item.message}
                </p>
              </div>
            </div>
          ))}

          <div style={{
            position: "absolute",
            left: "6px",
            bottom: "12px",
            width: "18px",
            height: "18px",
            borderRadius: "50%",
            backgroundColor: "#0D3CFC",
            border: "2px solid #ffffff",
            boxShadow: "0 0 0 2px #0D3CFC",
            zIndex: 2,
            animation: "pulse-blink 1.5s ease-in-out infinite",
          }} />
        </div>
      )}
      <style>{`
        @keyframes pulse-blink {
          0%, 100% { box-shadow: 0 0 0 2px #0D3CFC, 0 0 0 4px rgba(255,255,255,0.3); }
          50% { box-shadow: 0 0 0 4px #0D3CFC, 0 0 0 8px rgba(255,255,255,0.15); }
        }
      `}</style>
    </div>
  );
};

// FAQ Data
const faqData = [
  {
    id: 'shop',
    question: 'Shop',
    answer: 'Kamu bisa membeli produk-produk menarik dari komunitas Menuru. Tersedia berbagai merchandise eksklusif dan produk kreatif dari para creator.',
  },
  {
    id: 'blog',
    question: 'Blog',
    answer: 'Temukan artikel-artikel inspiratif, tutorial, dan berita terbaru seputar kreativitas, teknologi, dan pengembangan diri di blog Menuru.',
  },
  {
    id: 'donation',
    question: 'Donation',
    answer: 'Salurkan donasi Anda untuk membantu mereka yang membutuhkan. Setiap donasi akan disalurkan dengan transparan dan tepat sasaran.',
  },
  {
    id: 'note',
    question: 'Note',
    answer: 'Catat ide-ide kreatif Anda dengan mudah. Fitur note memungkinkan Anda menyimpan, mengatur, dan berbagi inspirasi kapan saja.',
  },
  {
    id: 'community',
    question: 'Community',
    answer: 'Bergabunglah dengan komunitas kreatif Menuru. Temukan teman baru, kolaborasi, dan dukungan untuk mengembangkan potensi Anda.',
  },
  {
    id: 'calendar',
    question: 'Calendar',
    answer: 'Atur jadwal Anda dengan mudah. Fitur calendar membantu Anda merencanakan aktivitas, deadline, dan event penting.',
  },
];

export default function ContactPage(): React.JSX.Element {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isMenuHovered, setIsMenuHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const contactTitleRef = useRef<HTMLDivElement>(null);
  const menuruFooterRef = useRef<HTMLDivElement>(null);
  
  const item01Ref = useRef<HTMLDivElement>(null);
  const item02Ref = useRef<HTMLDivElement>(null);
  const item03Ref = useRef<HTMLDivElement>(null);
  const item04Ref = useRef<HTMLDivElement>(null);
  const item05Ref = useRef<HTMLDivElement>(null);
  const hoverText01Ref = useRef<HTMLDivElement>(null);
  const hoverText02Ref = useRef<HTMLDivElement>(null);
  const hoverText03Ref = useRef<HTMLDivElement>(null);
  const hoverText04Ref = useRef<HTMLDivElement>(null);
  const hoverText05Ref = useRef<HTMLDivElement>(null);
  
  const menuButtonRef = useRef<HTMLDivElement>(null);
  const menuDrawerRef = useRef<HTMLDivElement>(null);
  const plusIconRef = useRef<HTMLSpanElement>(null);

  const createTicketFromItem = async (itemName: string) => {
    if (!user) {
      alert("Silakan login terlebih dahulu");
      return;
    }
    if (!db) {
      alert("Database tidak tersedia");
      return;
    }
    
    try {
      const q = query(
        collection(db, "livechat_tickets"),
        where("userId", "==", user.uid),
        where("status", "in", ["waiting", "active"])
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        alert("Anda masih memiliki chat aktif dengan agent. Tunggu hingga selesai.");
        return;
      }

      const ticketRef = await addDoc(collection(db, "livechat_tickets"), {
        userId: user.uid,
        userName: user.displayName || user.email || "User",
        userEmail: user.email,
        userPhoto: user.photoURL || "",
        status: "waiting",
        topic: `Tentang ${itemName}`,
        createdAt: serverTimestamp(),
        unreadCount: 0,
        typing: false,
        typingUserId: null,
        typingUserName: null,
      });
      await addDoc(collection(db, "livechat_tickets", ticketRef.id, "messages"), {
        senderId: user.uid,
        senderName: user.displayName || user.email || "User",
        text: `Halo, saya ingin bertanya tentang: ${itemName}`,
        timestamp: serverTimestamp(),
        read: false,
      });
      alert(`Ticket untuk "${itemName}" berhasil dibuat!`);
      
      const liveChatElement = document.getElementById('live-chat-section');
      if (liveChatElement) {
        liveChatElement.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      console.error("Error creating ticket:", error);
      alert("Gagal membuat ticket. Silakan coba lagi.");
    }
  };

  // Auth
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        setIsAdmin(currentUser.email === ADMIN_EMAIL);
      }
    });
    return () => unsubscribe();
  }, []);

  // Menu drawer animation - HANYA JUDUL DAN NAVBAR
  useEffect(() => {
    if (isMenuOpen && menuDrawerRef.current) {
      gsap.fromTo(menuDrawerRef.current,
        { y: '100%', opacity: 0 },
        {
          y: '0%',
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          display: 'flex',
          onComplete: () => {
            if (menuDrawerRef.current) {
              menuDrawerRef.current.style.overflow = 'hidden';
            }
          }
        }
      );
    } else if (!isMenuOpen && menuDrawerRef.current) {
      gsap.to(menuDrawerRef.current, {
        y: '100%',
        opacity: 0,
        duration: 0.6,
        ease: "power3.in",
        onComplete: () => {
          if (menuDrawerRef.current) {
            menuDrawerRef.current.style.display = 'none';
          }
        }
      });
    }
  }, [isMenuOpen]);

  // Menu button hover
  useEffect(() => {
    if (menuButtonRef.current) {
      if (isMenuHovered) {
        gsap.to(menuButtonRef.current, {
          scale: 1.05,
          duration: 0.3,
          ease: "power2.out"
        });
      } else {
        gsap.to(menuButtonRef.current, {
          scale: 1,
          duration: 0.3,
          ease: "power2.out"
        });
      }
    }
  }, [isMenuHovered]);

  // Hover effects for items 01-05
  useEffect(() => {
    const itemRefs = [item01Ref, item02Ref, item03Ref, item04Ref, item05Ref];
    const textRefs = [hoverText01Ref, hoverText02Ref, hoverText03Ref, hoverText04Ref, hoverText05Ref];
    
    itemRefs.forEach((itemRef, index) => {
      const id = String(index + 1).padStart(2, '0');
      const textRef = textRefs[index];
      
      if (hoveredItem === id && textRef.current && itemRef.current) {
        gsap.fromTo(textRef.current,
          { opacity: 0, x: -20, filter: 'blur(5px)' },
          { opacity: 1, x: 0, filter: 'blur(0px)', duration: 0.4, ease: "power2.out" }
        );
        gsap.to(itemRef.current, {
          scale: 1.02,
          duration: 0.3,
          ease: "power2.out"
        });
      } else if (hoveredItem !== id && textRef.current) {
        gsap.to(textRef.current, {
          opacity: 0,
          duration: 0.2,
          ease: "power2.in"
        });
        if (itemRef.current) {
          gsap.to(itemRef.current, {
            scale: 1,
            duration: 0.3,
            ease: "power2.out"
          });
        }
      }
    });
  }, [hoveredItem]);

  // SplitText animation untuk judul Contact
  useEffect(() => {
    if (contactTitleRef.current) {
      const splitContact = new SplitText(contactTitleRef.current, {
        type: "chars",
        charsClass: "split-char-contact"
      });

      gsap.fromTo(splitContact.chars,
        { opacity: 0, x: -50, filter: 'blur(10px)' },
        {
          opacity: 1,
          x: 0,
          filter: 'blur(0px)',
          duration: 1,
          stagger: 0.04,
          ease: "back.out(1.2)",
          scrollTrigger: {
            trigger: contactTitleRef.current,
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
  }, []);

  const handleMenuClick = () => {
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
      if (menuDrawerRef.current) {
        gsap.to(menuDrawerRef.current, {
          y: '100%',
          opacity: 0,
          duration: 0.6,
          ease: "power3.in",
          onComplete: () => {
            setIsMenuOpen(false);
            if (menuDrawerRef.current) {
              menuDrawerRef.current.style.display = 'none';
            }
          }
        });
      } else {
        setIsMenuOpen(false);
      }
      if (plusIconRef.current) {
        gsap.to(plusIconRef.current, {
          rotation: 0,
          duration: 0.4,
          ease: "power2.in"
        });
      }
    }
  };

  const toggleFaq = (id: string) => {
    if (activeFaq === id) {
      setActiveFaq(null);
    } else {
      setActiveFaq(id);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#ffffff", fontFamily: FONT_FAMILY }}>
        <div style={{ fontSize: "18px", color: "#000" }}>Loading...</div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        * {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        *::-webkit-scrollbar {
          display: none;
        }
        html, body {
          margin: 0;
          padding: 0;
          background-color: white;
          overflow-x: hidden;
          overflow-y: auto !important;
        }
        .split-char-contact {
          display: inline-block;
          will-change: transform, opacity, filter;
        }
        .split-char-livechat {
          display: inline-block;
          will-change: transform, opacity, filter;
        }
        .menuru-footer-char {
          display: inline-block;
          will-change: transform, opacity;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
      `}</style>
      
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'white',
        margin: 0,
        padding: 0,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: FONT_FAMILY,
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        position: 'relative',
        overflowX: 'hidden',
      }}>
        {/* JUDUL WEBSITE - pojok kiri atas */}
        <div style={{
          position: 'fixed',
          top: '40px',
          left: '40px',
          zIndex: isMenuOpen ? 98 : 100,
          pointerEvents: 'none'
        }}>
          <span style={{
            fontFamily: FONT_FAMILY,
            fontWeight: 700,
            fontSize: '48px',
            color: '#000000',
            letterSpacing: '-0.03em',
            textTransform: 'none',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale'
          }}>
            Menuru
          </span>
        </div>

        {/* NAVBAR - pojok kanan atas */}
        <div style={{
          position: 'fixed',
          top: '40px',
          right: '40px',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '8px 16px',
          borderRadius: '12px',
          backgroundColor: isMenuOpen ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0)',
          backdropFilter: isMenuOpen ? 'blur(20px)' : 'blur(0px)',
          transition: 'all 0.3s ease',
          pointerEvents: 'auto',
          boxShadow: isMenuOpen ? '0 4px 20px rgba(0,0,0,0.1)' : 'none',
        }}>
          {/* Get in Touch - (here) */}
          <Link href="/contact">
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                border: '2px solid #0D3CFC',
                borderRadius: '8px',
                padding: '8px 16px',
                cursor: 'pointer',
                backgroundColor: 'transparent',
              }}
            >
              <span
                style={{
                  fontSize: '16px',
                  fontWeight: 500,
                  color: '#0D3CFC',
                  fontFamily: FONT_FAMILY,
                  display: 'inline-block',
                }}
              >
                (here)
              </span>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#0D3CFC',
                  borderRadius: '4px',
                  padding: '4px',
                  color: '#ffffff',
                }}
              >
                <SouthEastArrow size={24} />
              </div>
            </div>
          </Link>

          {/* Pusat Bantuan */}
          <Link href="/pusat-bantuan">
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                border: '2px solid #000000',
                borderRadius: '8px',
                padding: '8px 16px',
                cursor: 'pointer',
                backgroundColor: 'transparent',
              }}
            >
              <span
                style={{
                  fontSize: '16px',
                  fontWeight: 500,
                  color: '#000000',
                  fontFamily: FONT_FAMILY,
                  display: 'inline-block',
                }}
              >
                Pusat Bantuan
              </span>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#000000',
                  borderRadius: '4px',
                  padding: '4px',
                  color: '#ffffff',
                }}
              >
                <NorthWestArrow size={24} />
              </div>
            </div>
          </Link>

          {/* Menu */}
          <div
            ref={menuButtonRef}
            onClick={handleMenuClick}
            onMouseEnter={() => setIsMenuHovered(true)}
            onMouseLeave={() => setIsMenuHovered(false)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              border: '2px solid #000000',
              borderRadius: '8px',
              padding: '8px 16px',
              cursor: 'pointer',
              backgroundColor: 'transparent',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#000000',
                borderRadius: '4px',
                padding: '4px',
                color: '#ffffff',
              }}
            >
              <span
                ref={plusIconRef}
                style={{
                  fontSize: '28px',
                  fontWeight: 300,
                  fontFamily: FONT_FAMILY,
                  lineHeight: 1,
                  display: 'inline-block',
                  transform: 'rotate(0deg)',
                }}
              >
                +
              </span>
            </div>
            <span
              style={{
                fontSize: '16px',
                fontWeight: 500,
                color: '#000000',
                fontFamily: FONT_FAMILY,
                letterSpacing: '0.02em',
                display: 'inline-block',
              }}
            >
              Menu
            </span>
          </div>
        </div>

        {/* Menu Drawer - HANYA JUDUL DAN NAVBAR */}
        <div
          ref={menuDrawerRef}
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            width: '100%',
            height: '100%',
            backgroundColor: '#0D3CFC',
            zIndex: 99,
            display: 'none',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'translateY(-100%)',
            opacity: 0,
            pointerEvents: isMenuOpen ? 'auto' : 'none',
            padding: '40px',
            boxSizing: 'border-box',
            overflow: 'hidden'
          }}
        >
          <h1
            style={{
              position: 'absolute',
              top: '40px',
              left: '40px',
              fontSize: '48px',
              fontWeight: 700,
              color: '#ffffff',
              fontFamily: FONT_FAMILY,
              letterSpacing: '-0.03em',
              margin: 0,
              padding: 0,
              lineHeight: 1,
            }}
          >
            Menuru
          </h1>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              gap: '30px',
            }}
          >
            <Link href="/" style={{ 
              color: '#ffffff', 
              fontSize: '48px', 
              textDecoration: 'none',
              fontFamily: FONT_FAMILY,
              fontWeight: 500,
              transition: 'opacity 0.3s',
              opacity: 0.8,
            }}>Home</Link>
            <Link href="/about" style={{ 
              color: '#ffffff', 
              fontSize: '48px', 
              textDecoration: 'none',
              fontFamily: FONT_FAMILY,
              fontWeight: 500,
              transition: 'opacity 0.3s',
              opacity: 0.8,
            }}>About</Link>
            <Link href="/contact" style={{ 
              color: '#ffffff', 
              fontSize: '48px', 
              textDecoration: 'none',
              fontFamily: FONT_FAMILY,
              fontWeight: 500,
              transition: 'opacity 0.3s',
              opacity: 0.8,
            }}>Contact</Link>
            <Link href="/pusat-bantuan" style={{ 
              color: '#ffffff', 
              fontSize: '48px', 
              textDecoration: 'none',
              fontFamily: FONT_FAMILY,
              fontWeight: 500,
              transition: 'opacity 0.3s',
              opacity: 0.8,
            }}>Pusat Bantuan</Link>
          </div>
        </div>

        {/* Teks Contact besar 300px - dengan GSAP SplitText */}
        <div style={{
          position: 'relative',
          top: '120px',
          left: '40px',
          zIndex: 10,
          width: 'calc(100% - 80px)',
          marginBottom: '40px'
        }}>
          <div 
            ref={contactTitleRef}
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: '300px',
              fontWeight: '300',
              color: '#000000',
              textAlign: 'left',
              letterSpacing: '-0.02em',
              textTransform: 'none',
              lineHeight: '1',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale'
            }}>
            Contact
          </div>
        </div>

        {/* Teks subtitle dan tombol di bawah Contact */}
        <div style={{
          position: 'relative',
          top: '120px',
          left: '40px',
          zIndex: 10,
          width: 'calc(100% - 80px)',
          marginBottom: '80px'
        }}>
          <p
            style={{
              fontSize: '40px',
              fontWeight: 400,
              color: '#0D3CFC',
              fontFamily: FONT_FAMILY,
              lineHeight: 1.2,
              margin: 0,
              padding: 0,
              paddingBottom: '30px',
              whiteSpace: 'pre-line',
            }}
          >
            {`You can take notes, find ideas,\nand donate money to those in need`}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '20px' }}>
            <Link href="/signup">
              <div
                style={{
                  display: 'inline-block',
                  border: '2px solid #0D3CFC',
                  borderRadius: '8px',
                  padding: '12px 28px',
                  cursor: 'pointer',
                  backgroundColor: 'transparent',
                }}
              >
                <span
                  style={{
                    fontSize: '18px',
                    fontWeight: 500,
                    color: '#0D3CFC',
                    fontFamily: FONT_FAMILY,
                    letterSpacing: '0.02em',
                  }}
                >
                  Let's build now
                </span>
              </div>
            </Link>

            <Link href="/signup">
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #0D3CFC',
                  borderRadius: '8px',
                  padding: '10px',
                  cursor: 'pointer',
                  backgroundColor: '#0D3CFC',
                  color: '#ffffff',
                  width: '50px',
                  height: '50px',
                }}
              >
                <NorthEastArrow size={24} />
              </div>
            </Link>
          </div>
        </div>

        {/* 01-05 Items */}
        <div style={{
          position: 'relative',
          top: '150px',
          left: '40px',
          right: '40px',
          zIndex: 10,
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '30px',
            marginLeft: '80px',
            marginBottom: '40px',
            maxWidth: '900px',
          }}>
            {/* 01 - Note */}
            <div
              ref={item01Ref}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                cursor: 'pointer',
                transition: 'transform 0.3s ease'
              }}
              onMouseEnter={() => setHoveredItem('01')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <span style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: '60px',
                  fontWeight: '300',
                  color: '#000000',
                  letterSpacing: '-0.02em',
                  lineHeight: '1'
                }}>
                  01
                </span>
                <span style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: '160px',
                  fontWeight: '300',
                  color: '#000000',
                  letterSpacing: '-0.02em'
                }}>
                  Note
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    createTicketFromItem('Note');
                  }}
                  style={{
                    fontFamily: FONT_FAMILY,
                    fontSize: '16px',
                    fontWeight: '500',
                    color: '#ffffff',
                    backgroundColor: '#0D3CFC',
                    padding: '8px 20px',
                    borderRadius: '8px',
                    border: '2px solid #0D3CFC',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#000000';
                    e.currentTarget.style.borderColor = '#000000';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#0D3CFC';
                    e.currentTarget.style.borderColor = '#0D3CFC';
                  }}
                >
                  Ticket
                </button>
                {hoveredItem === '01' && (
                  <div
                    ref={hoverText01Ref}
                    style={{
                      fontFamily: FONT_FAMILY,
                      fontSize: '18px',
                      fontWeight: '400',
                      color: '#000000',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    / kamu bisa mencatat apa yang kamu inginkan
                  </div>
                )}
              </div>
            </div>

            {/* 02 - Calendar */}
            <div
              ref={item02Ref}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                cursor: 'pointer',
                transition: 'transform 0.3s ease'
              }}
              onMouseEnter={() => setHoveredItem('02')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <span style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: '60px',
                  fontWeight: '300',
                  color: '#000000',
                  letterSpacing: '-0.02em',
                  lineHeight: '1'
                }}>
                  02
                </span>
                <span style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: '160px',
                  fontWeight: '300',
                  color: '#000000',
                  letterSpacing: '-0.02em'
                }}>
                  Calendar
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    createTicketFromItem('Calendar');
                  }}
                  style={{
                    fontFamily: FONT_FAMILY,
                    fontSize: '16px',
                    fontWeight: '500',
                    color: '#ffffff',
                    backgroundColor: '#0D3CFC',
                    padding: '8px 20px',
                    borderRadius: '8px',
                    border: '2px solid #0D3CFC',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#000000';
                    e.currentTarget.style.borderColor = '#000000';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#0D3CFC';
                    e.currentTarget.style.borderColor = '#0D3CFC';
                  }}
                >
                  Ticket
                </button>
                {hoveredItem === '02' && (
                  <div
                    ref={hoverText02Ref}
                    style={{
                      fontFamily: FONT_FAMILY,
                      fontSize: '18px',
                      fontWeight: '400',
                      color: '#000000',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    / kamu bisa memikirkan jadwal apa yang kamu inginkan
                  </div>
                )}
              </div>
            </div>

            {/* 03 - Donation */}
            <div
              ref={item03Ref}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                cursor: 'pointer',
                transition: 'transform 0.3s ease'
              }}
              onMouseEnter={() => setHoveredItem('03')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <span style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: '60px',
                  fontWeight: '300',
                  color: '#000000',
                  letterSpacing: '-0.02em',
                  lineHeight: '1'
                }}>
                  03
                </span>
                <span style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: '160px',
                  fontWeight: '300',
                  color: '#000000',
                  letterSpacing: '-0.02em'
                }}>
                  Donation
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    createTicketFromItem('Donation');
                  }}
                  style={{
                    fontFamily: FONT_FAMILY,
                    fontSize: '16px',
                    fontWeight: '500',
                    color: '#ffffff',
                    backgroundColor: '#0D3CFC',
                    padding: '8px 20px',
                    borderRadius: '8px',
                    border: '2px solid #0D3CFC',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#000000';
                    e.currentTarget.style.borderColor = '#000000';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#0D3CFC';
                    e.currentTarget.style.borderColor = '#0D3CFC';
                  }}
                >
                  Ticket
                </button>
                {hoveredItem === '03' && (
                  <div
                    ref={hoverText03Ref}
                    style={{
                      fontFamily: FONT_FAMILY,
                      fontSize: '18px',
                      fontWeight: '400',
                      color: '#000000',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    / kamu bisa membagikan uang apa yang kamu inginkan
                  </div>
                )}
              </div>
            </div>

            {/* 04 - Community */}
            <div
              ref={item04Ref}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                cursor: 'pointer',
                transition: 'transform 0.3s ease'
              }}
              onMouseEnter={() => setHoveredItem('04')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <span style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: '60px',
                  fontWeight: '300',
                  color: '#000000',
                  letterSpacing: '-0.02em',
                  lineHeight: '1'
                }}>
                  04
                </span>
                <span style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: '160px',
                  fontWeight: '300',
                  color: '#000000',
                  letterSpacing: '-0.02em'
                }}>
                  Community
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    createTicketFromItem('Community');
                  }}
                  style={{
                    fontFamily: FONT_FAMILY,
                    fontSize: '16px',
                    fontWeight: '500',
                    color: '#ffffff',
                    backgroundColor: '#0D3CFC',
                    padding: '8px 20px',
                    borderRadius: '8px',
                    border: '2px solid #0D3CFC',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#000000';
                    e.currentTarget.style.borderColor = '#000000';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#0D3CFC';
                    e.currentTarget.style.borderColor = '#0D3CFC';
                  }}
                >
                  Ticket
                </button>
                {hoveredItem === '04' && (
                  <div
                    ref={hoverText04Ref}
                    style={{
                      fontFamily: FONT_FAMILY,
                      fontSize: '18px',
                      fontWeight: '400',
                      color: '#000000',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    / kamu bisa mencari apa yang kamu inginkan
                  </div>
                )}
              </div>
            </div>

            {/* 05 - Shop */}
            <div
              ref={item05Ref}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                cursor: 'pointer',
                transition: 'transform 0.3s ease'
              }}
              onMouseEnter={() => setHoveredItem('05')}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <span style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: '60px',
                  fontWeight: '300',
                  color: '#000000',
                  letterSpacing: '-0.02em',
                  lineHeight: '1'
                }}>
                  05
                </span>
                <span style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: '160px',
                  fontWeight: '300',
                  color: '#000000',
                  letterSpacing: '-0.02em'
                }}>
                  Shop
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    createTicketFromItem('Shop');
                  }}
                  style={{
                    fontFamily: FONT_FAMILY,
                    fontSize: '16px',
                    fontWeight: '500',
                    color: '#ffffff',
                    backgroundColor: '#0D3CFC',
                    padding: '8px 20px',
                    borderRadius: '8px',
                    border: '2px solid #0D3CFC',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#000000';
                    e.currentTarget.style.borderColor = '#000000';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#0D3CFC';
                    e.currentTarget.style.borderColor = '#0D3CFC';
                  }}
                >
                  Ticket
                </button>
                {hoveredItem === '05' && (
                  <div
                    ref={hoverText05Ref}
                    style={{
                      fontFamily: FONT_FAMILY,
                      fontSize: '18px',
                      fontWeight: '400',
                      color: '#000000',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    / kamu bisa membeli apa yang kamu inginkan
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginLeft: '80px',
            marginTop: '30px',
            maxWidth: '1100px',
            gap: '40px',
          }}>
            <div style={{
              flex: '0 0 350px',
              position: 'sticky',
              top: '200px',
            }}>
              <h2 style={{
                fontFamily: FONT_FAMILY,
                fontSize: '50px',
                fontWeight: '600',
                color: '#000000',
                margin: 0,
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}>
                FAQ
              </h2>
              <p style={{
                fontFamily: FONT_FAMILY,
                fontSize: '50px',
                fontWeight: '400',
                color: '#0D3CFC',
                margin: 0,
                marginTop: '20px',
                letterSpacing: '-0.01em',
                lineHeight: 1.2,
              }}>
                Apakah kamu punya kesulitan?
              </p>
            </div>

            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
            }}>
              {faqData.map((item) => (
                <div
                  key={item.id}
                  style={{
                    borderBottom: '1px solid #e8e8e8',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    onClick={() => toggleFaq(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      padding: '15px 0',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.7';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                  >
                    <span style={{
                      fontFamily: FONT_FAMILY,
                      fontSize: '50px',
                      fontWeight: '500',
                      color: '#0D3CFC',
                      letterSpacing: '-0.02em',
                      lineHeight: '1.2',
                    }}>
                      {item.question}
                    </span>
                    <motion.div
                      animate={{
                        rotate: activeFaq === item.id ? 45 : 0,
                      }}
                      transition={{ duration: 0.3 }}
                      style={{
                        fontSize: '30px',
                        fontWeight: 300,
                        color: '#0D3CFC',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      +
                    </motion.div>
                  </div>

                  <AnimatePresence>
                    {activeFaq === item.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: 'easeInOut' }}
                        style={{
                          overflow: 'hidden',
                        }}
                      >
                        <p style={{
                          fontFamily: FONT_FAMILY,
                          fontSize: '30px',
                          fontWeight: '300',
                          color: '#000000',
                          padding: '0 0 20px 0',
                          margin: 0,
                          lineHeight: 1.5,
                          letterSpacing: '-0.01em',
                        }}>
                          {item.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          {/* FOOTER */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginLeft: '80px',
            marginTop: '50px',
            maxWidth: '1100px',
            gap: '40px',
            paddingTop: '40px',
          }}>
            <div style={{
              flex: '0 0 30%',
            }}>
              <h3 style={{
                fontFamily: FONT_FAMILY,
                fontSize: '28px',
                fontWeight: '600',
                color: '#000000',
                margin: 0,
                marginBottom: '16px',
                letterSpacing: '-0.01em',
              }}>
                Get in Touch
              </h3>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}>
                  <span style={{
                    fontFamily: FONT_FAMILY,
                    fontSize: '20px',
                    fontWeight: '400',
                    color: '#0D3CFC',
                    letterSpacing: '-0.01em',
                    cursor: 'pointer',
                  }}>
                    Contact Us
                  </span>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#0D3CFC',
                      animation: 'blink 1s ease-in-out infinite',
                      display: 'inline-block',
                    }} />
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#0D3CFC',
                      animation: 'blink 1s ease-in-out infinite 0.3s',
                      display: 'inline-block',
                    }} />
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#0D3CFC',
                      animation: 'blink 1s ease-in-out infinite 0.6s',
                      display: 'inline-block',
                    }} />
                  </div>
                  <Link href="/contact">
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#0D3CFC',
                        padding: '4px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        border: '1px solid #0D3CFC',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#000000';
                        e.currentTarget.style.borderColor = '#000000';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#0D3CFC';
                        e.currentTarget.style.borderColor = '#0D3CFC';
                      }}
                    >
                      <span style={{
                        fontFamily: FONT_FAMILY,
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#ffffff',
                        letterSpacing: '0.02em',
                      }}>
                        →
                      </span>
                    </div>
                  </Link>
                </div>

                <span style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: '20px',
                  fontWeight: '400',
                  color: '#0D3CFC',
                  letterSpacing: '-0.01em',
                  cursor: 'pointer',
                }}>
                  Instagram
                </span>
                <span style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: '20px',
                  fontWeight: '400',
                  color: '#0D3CFC',
                  letterSpacing: '-0.01em',
                  cursor: 'pointer',
                }}>
                  Live Chat
                </span>
              </div>
            </div>

            <div style={{
              flex: '0 0 30%',
            }}>
              <h3 style={{
                fontFamily: FONT_FAMILY,
                fontSize: '28px',
                fontWeight: '600',
                color: '#000000',
                margin: 0,
                marginBottom: '16px',
                letterSpacing: '-0.01em',
              }}>
                Product
              </h3>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}>
                <span style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: '20px',
                  fontWeight: '400',
                  color: '#0D3CFC',
                  letterSpacing: '-0.01em',
                  cursor: 'pointer',
                }}>
                  Shop
                </span>
                <span style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: '20px',
                  fontWeight: '400',
                  color: '#0D3CFC',
                  letterSpacing: '-0.01em',
                  cursor: 'pointer',
                }}>
                  Note
                </span>
                <span style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: '20px',
                  fontWeight: '400',
                  color: '#0D3CFC',
                  letterSpacing: '-0.01em',
                  cursor: 'pointer',
                }}>
                  Calendar
                </span>
                <span style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: '20px',
                  fontWeight: '400',
                  color: '#0D3CFC',
                  letterSpacing: '-0.01em',
                  cursor: 'pointer',
                }}>
                  Blog
                </span>
                <span style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: '20px',
                  fontWeight: '400',
                  color: '#0D3CFC',
                  letterSpacing: '-0.01em',
                  cursor: 'pointer',
                }}>
                  Donation
                </span>
              </div>
            </div>

            <div style={{
              flex: '0 0 30%',
            }}>
              <h3 style={{
                fontFamily: FONT_FAMILY,
                fontSize: '28px',
                fontWeight: '600',
                color: '#000000',
                margin: 0,
                marginBottom: '16px',
                letterSpacing: '-0.01em',
              }}>
                Attention
              </h3>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}>
                <span style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: '20px',
                  fontWeight: '400',
                  color: '#0D3CFC',
                  letterSpacing: '-0.01em',
                  cursor: 'pointer',
                }}>
                  Kebijakan Privasi
                </span>
                <span style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: '20px',
                  fontWeight: '400',
                  color: '#0D3CFC',
                  letterSpacing: '-0.01em',
                  cursor: 'pointer',
                }}>
                  Ketentuan Kami
                </span>
                <span style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: '20px',
                  fontWeight: '400',
                  color: '#0D3CFC',
                  letterSpacing: '-0.01em',
                  cursor: 'pointer',
                }}>
                  Pusat Bantuan
                </span>
              </div>
            </div>
          </div>

          {/* ===== LIVE CHAT AGENT ===== */}
          <div id="live-chat-section">
            <LiveChatAgent user={user} isAdmin={isAdmin} db={db} auth={auth} />
          </div>

          {/* ===== KRITIK & SARAN ===== */}
          <FeedbackSection db={db} user={user} />

          {/* Teks MENURU 400px warna biru di kanan */}
          <div
            ref={menuruFooterRef}
            style={{
              marginLeft: '80px',
              marginTop: '60px',
              maxWidth: '1100px',
              overflow: 'hidden',
              paddingBottom: '40px',
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <span
              style={{
                fontFamily: FONT_FAMILY,
                fontSize: '400px',
                fontWeight: '700',
                color: '#0D3CFC',
                letterSpacing: '-0.02em',
                textTransform: 'none',
                lineHeight: '0.8',
                display: 'block',
                textAlign: 'right',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
              }}
            >
              {'MENURU'.split('').map((char, index) => (
                <motion.span
                  key={index}
                  className="menuru-footer-char"
                  style={{
                    display: 'inline-block',
                    opacity: 0,
                    y: 200,
                    scale: 0.3,
                  }}
                  initial={{ opacity: 0, y: 200, scale: 0.3 }}
                  whileInView={{ 
                    opacity: 1, 
                    y: 0, 
                    scale: 1,
                    transition: {
                      duration: 1.2,
                      delay: index * 0.04,
                      ease: [0.16, 1, 0.3, 1],
                    }
                  }}
                  viewport={{ once: true, amount: 0.3 }}
                >
                  {char}
                </motion.span>
              ))}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
