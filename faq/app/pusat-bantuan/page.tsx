'use client';

import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import { initializeApp, getApps } from "firebase/app";
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut,
  updateProfile,
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
  updateDoc,
  where,
  getDocs,
  deleteDoc,
  arrayUnion,
  arrayRemove,
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

const FONT_FAMILY = "'Poppins', 'Poppins Fallback', sans-serif";
const ADMIN_EMAIL = "faridardiansyah061@gmail.com";
const AGENT_NAME = "Farid Ardiansyah";

// ===== ICONS =====
const SearchIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M16 16L21 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const EditIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 20H21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16.5 3.5L20.5 7.5L7 21L3 21L3 17L16.5 3.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ShopIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 7L4 20H20L21 7H3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M7 7L8 4H16L17 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 11V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M15 11V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const HelpDeskIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M5 15C5 13.8954 5.89543 13 7 13H8C9.10457 13 10 13.8954 10 15V17C10 18.1046 9.10457 19 8 19H7C5.89543 19 5 18.1046 5 17V15Z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M19 15C19 13.8954 18.1046 13 17 13H16C14.8954 13 14 13.8954 14 15V17C14 18.1046 14.8954 19 16 19H17C18.1046 19 19 18.1046 19 17V15Z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M8 13V11C8 8.79086 9.79086 7 12 7C14.2091 7 16 8.79086 16 11V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const UserAvatarIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M5 20V19C5 15.6863 7.68629 13 11 13H13C16.3137 13 19 15.6863 19 19V20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const StoreIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 7H20M4 7L3 12H21L20 7M4 7L5 20H19L20 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 12V16H15V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const NotificationsIcon = ({ size = 24, hasBadge = false }: { size?: number; hasBadge?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: "relative" }}>
    <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    {hasBadge && (
      <circle cx="19" cy="5" r="5" fill="#ef4444" stroke="white" strokeWidth="2"/>
    )}
  </svg>
);

const ChatIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

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

// ===== SEARCH ROLLING TEXT =====
const searchRollingTexts = [
  "Tentang Note", 
  "Tentang Donasi", 
  "Tentang Blog", 
  "Tentang Shop", 
  "Tentang Pusat bantuan"
];

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 10) return "Selamat pagi";
  if (hour >= 10 && hour < 15) return "Selamat siang";
  if (hour >= 15 && hour < 18) return "Selamat sore";
  return "Selamat malam";
};

// ===== DEFAULT FAQ DATA =====
const defaultFaqData = {
  Blog: [
    { q: "Apa itu Blog Menuru?", a: "Blog Menuru adalah platform untuk berbagi artikel, tips, dan informasi seputar gaya hidup, pengembangan diri, dan teknologi." },
    { q: "Bagaimana cara menulis artikel di Blog Menuru?", a: "Untuk menulis artikel, Anda harus login sebagai kontributor. Hubungi tim admin untuk mendapatkan akses." },
    { q: "Apakah ada biaya untuk membaca blog?", a: "Tidak, semua artikel di Blog Menuru dapat dibaca secara gratis." },
  ],
  Shop: [
    { q: "Produk apa saja yang dijual di Shop Menuru?", a: "Shop Menuru menjual merchandise eksklusif seperti kaos, tas, dan aksesoris dengan desain khas Menuru." },
    { q: "Bagaimana cara melakukan pembelian?", a: "Pilih produk, tambahkan ke keranjang, lalu ikuti proses checkout. Pembayaran melalui transfer bank atau e-wallet." },
    { q: "Apakah tersedia pengiriman internasional?", a: "Saat ini pengiriman hanya untuk wilayah Indonesia. Kami akan segera membuka pengiriman internasional." },
  ],
  Donation: [
    { q: "Bagaimana cara berdonasi?", a: "Anda dapat berdonasi melalui tombol Donasi di halaman utama, atau transfer ke rekening resmi Menuru yang tertera." },
    { q: "Kemana donasi disalurkan?", a: "Donasi disalurkan untuk kegiatan sosial, pendidikan, dan pengembangan komunitas." },
    { q: "Apakah donasi bisa mendapatkan laporan?", a: "Ya, setiap donasi akan dilaporkan secara transparan di halaman Laporan Donasi." },
  ],
  News: [
    { q: "Berita apa saja yang dimuat di News?", a: "News berisi berita terbaru seputar kegiatan Menuru, pencapaian, dan acara mendatang." },
    { q: "Apakah bisa berlangganan newsletter?", a: "Ya, Anda bisa berlangganan newsletter melalui form di halaman News." },
    { q: "Bagaimana cara mengirimkan berita?", a: "Kirimkan berita ke email redaksi@menuru.com untuk dipertimbangkan." },
  ],
  Calendar: [
    { q: "Apa fungsi Calendar?", a: "Calendar menampilkan jadwal acara, webinar, dan kegiatan komunitas Menuru." },
    { q: "Bagaimana cara menambahkan acara ke Calendar?", a: "Acara ditambahkan oleh tim admin. Jika Anda ingin mengusulkan acara, hubungi kami." },
    { q: "Apakah Calendar bisa di-sync ke Google Calendar?", a: "Ya, ada tombol sinkronisasi untuk menambahkan acara ke Google Calendar Anda." },
  ],
  Note: [
    { q: "Apa itu Note?", a: "Note adalah fitur untuk mencatat ide, catatan pribadi, atau hal penting lainnya." },
    { q: "Apakah Note bisa dibagikan?", a: "Saat ini Note bersifat pribadi. Fitur berbagi akan segera hadir." },
    { q: "Bagaimana cara menyimpan Note?", a: "Cukup tulis catatan Anda dan klik simpan. Note akan tersimpan di akun Anda." },
  ]
};

// ============================================================
// ===== KOMPONEN FAQ ITEM =====
// ============================================================
const FaqItem = ({ 
  question, 
  answer, 
  category,
  index,
  isAdmin,
  onEdit,
}: { 
  question: string; 
  answer: string; 
  category: string;
  index: number;
  isAdmin: boolean;
  onEdit: (category: string, index: number, newQ: string, newA: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editQ, setEditQ] = useState(question);
  const [editA, setEditA] = useState(answer);
  const contentRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);

  const toggleFaq = () => {
    setIsOpen(!isOpen);
    if (contentRef.current) {
      if (!isOpen) {
        gsap.fromTo(contentRef.current,
          { height: 0, opacity: 0 },
          { height: 'auto', opacity: 1, duration: 0.4, ease: 'power2.out' }
        );
        gsap.to(iconRef.current, {
          rotate: 45,
          duration: 0.3,
          ease: 'power2.out'
        });
      } else {
        gsap.to(contentRef.current, {
          height: 0,
          opacity: 0,
          duration: 0.3,
          ease: 'power2.in'
        });
        gsap.to(iconRef.current, {
          rotate: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    }
  };

  const handleSaveEdit = () => {
    if (editQ.trim() && editA.trim()) {
      onEdit(category, index, editQ.trim(), editA.trim());
      setIsEditing(false);
    }
  };

  return (
    <div style={{ borderBottom: '1px solid #e8e8e8', padding: '12px 0' }}>
      <div 
        onClick={!isEditing ? toggleFaq : undefined}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: isEditing ? 'default' : 'pointer',
          padding: '4px 0',
        }}
      >
        {isEditing ? (
          <input
            type="text"
            value={editQ}
            onChange={(e) => setEditQ(e.target.value)}
            style={{
              fontSize: '30px',
              fontWeight: 500,
              color: '#0D3CFC',
              fontFamily: FONT_FAMILY,
              border: '2px solid #0D3CFC',
              borderRadius: '8px',
              padding: '4px 12px',
              width: '80%',
              backgroundColor: '#f5f9ff',
              outline: 'none',
            }}
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
        ) : (
          <span style={{
            fontSize: '30px',
            fontWeight: 500,
            color: '#0D3CFC',
            fontFamily: FONT_FAMILY,
          }}>
            {question}
          </span>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isAdmin && !isEditing && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
                setEditQ(question);
                setEditA(answer);
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '4px',
                transition: 'background 0.2s ease',
                color: '#0D3CFC',
                display: 'flex',
                alignItems: 'center',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(13,60,252,0.08)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <EditIcon size={20} />
            </button>
          )}
          {isEditing ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSaveEdit();
                }}
                style={{
                  background: '#0D3CFC',
                  border: 'none',
                  color: '#fff',
                  padding: '4px 16px',
                  borderRadius: '6px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  fontFamily: FONT_FAMILY,
                  fontWeight: 500,
                }}
              >
                Simpan
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(false);
                  setEditQ(question);
                  setEditA(answer);
                }}
                style={{
                  background: 'transparent',
                  border: '1px solid #ccc',
                  color: '#666',
                  padding: '4px 16px',
                  borderRadius: '6px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  fontFamily: FONT_FAMILY,
                }}
              >
                Batal
              </button>
            </div>
          ) : (
            <span ref={iconRef} style={{
              fontSize: '32px',
              fontWeight: 300,
              color: '#0D3CFC',
              transition: 'transform 0.3s ease',
              display: 'inline-block',
            }}>
              +
            </span>
          )}
        </div>
      </div>
      {isEditing ? (
        <div style={{ marginTop: '12px' }}>
          <textarea
            value={editA}
            onChange={(e) => setEditA(e.target.value)}
            style={{
              fontSize: '30px',
              fontWeight: 400,
              color: '#000000',
              fontFamily: FONT_FAMILY,
              border: '2px solid #0D3CFC',
              borderRadius: '8px',
              padding: '8px 12px',
              width: '100%',
              minHeight: '80px',
              backgroundColor: '#f5f9ff',
              outline: 'none',
              resize: 'vertical',
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : (
        <div ref={contentRef} style={{ height: 0, overflow: 'hidden', opacity: 0 }}>
          <div style={{
            padding: '12px 0 8px 0',
            fontSize: '30px',
            color: '#000000',
            fontFamily: FONT_FAMILY,
            lineHeight: 1.6,
          }}>
            {answer}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// ===== LIVE CHAT AGENT INTERFACES =====
// ============================================================
interface LiveChatRoom {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhoto?: string;
  agentId?: string;
  agentName?: string;
  status: 'waiting' | 'active' | 'closed';
  topic: string;
  createdAt: any;
  lastMessage?: string;
  lastMessageTime?: any;
  unreadCount: number;
  typing?: boolean;
  typingUserId?: string;
  typingUserName?: string;
}

interface LiveChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: any;
  read: boolean;
}

// ============================================================
// ===== BLINKING DOTS COMPONENT =====
// ============================================================
const BlinkingDots = ({ active }: { active: boolean }) => {
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

// ============================================================
// ===== LIVE CHAT AGENT COMPONENT (FULLY FIXED) =====
// ============================================================
const LiveChatAgent = ({ user, isAdmin, db, auth }: { user: any; isAdmin: boolean; db: any; auth: any }) => {
  const [rooms, setRooms] = useState<LiveChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<LiveChatRoom | null>(null);
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
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

  // ===== SUBSCRIBE AGENT ONLINE STATUS =====
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

  // ===== LOAD ROOMS =====
  useEffect(() => {
    if (!db || !user) return;
    let q;
    if (isAdmin) {
      // Agent melihat SEMUA room termasuk yang sudah closed (untuk riwayat)
      q = query(collection(db, "livechat_rooms"), orderBy("createdAt", "desc"));
    } else {
      // User melihat room miliknya yang statusnya waiting atau active
      q = query(
        collection(db, "livechat_rooms"),
        where("userId", "==", user.uid),
        where("status", "in", ["waiting", "active"])
      );
    }
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const roomList: LiveChatRoom[] = [];
      snapshot.forEach((doc) => {
        roomList.push({ id: doc.id, ...doc.data() } as LiveChatRoom);
      });
      setRooms(roomList);
    });
    return () => unsubscribe();
  }, [db, user, isAdmin]);

  // ===== LOAD MESSAGES PER ROOM =====
  useEffect(() => {
    if (!db || !selectedRoom) return;
    const q = query(
      collection(db, "livechat_rooms", selectedRoom.id, "messages"),
      orderBy("timestamp", "asc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgList: LiveChatMessage[] = [];
      snapshot.forEach((doc) => {
        msgList.push({ id: doc.id, ...doc.data() } as LiveChatMessage);
      });
      setMessages(msgList);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    });
    return () => unsubscribe();
  }, [db, selectedRoom]);

  // ===== MARK MESSAGES AS READ (for agent) =====
  useEffect(() => {
    if (!db || !selectedRoom || !user || !isAdmin) return;
    const unread = messages.filter(m => m.senderId !== user.uid && !m.read);
    unread.forEach(async (msg) => {
      const msgRef = doc(db, "livechat_rooms", selectedRoom.id, "messages", msg.id);
      await updateDoc(msgRef, { read: true });
    });
  }, [messages, selectedRoom, db, user, isAdmin]);

  // ===== HANDLE TYPING =====
  const handleTyping = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessageText(value);
    if (!selectedRoom || !user || !db) return;
    const roomRef = doc(db, "livechat_rooms", selectedRoom.id);
    if (value.length > 0) {
      await updateDoc(roomRef, {
        typing: true,
        typingUserId: user.uid,
        typingUserName: user.displayName || user.email || "User",
      });
    } else {
      await updateDoc(roomRef, {
        typing: false,
        typingUserId: null,
        typingUserName: null,
      });
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(async () => {
      await updateDoc(roomRef, { typing: false, typingUserId: null, typingUserName: null });
    }, 2000);
  };

  // ===== START CHAT (USER) =====
  const startChat = async () => {
    if (!db || !user || !selectedTopic) return;
    try {
      const roomRef = await addDoc(collection(db, "livechat_rooms"), {
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
      await addDoc(collection(db, "livechat_rooms", roomRef.id, "messages"), {
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

  // ===== SEND MESSAGE (BOTH) =====
  const sendMessage = async () => {
    if (!db || !selectedRoom || !messageText.trim() || !user) return;
    try {
      const roomRef = doc(db, "livechat_rooms", selectedRoom.id);
      await updateDoc(roomRef, { typing: false, typingUserId: null, typingUserName: null });
      
      const senderName = isAdmin ? AGENT_NAME : (user.displayName || user.email || "User");
      
      await addDoc(collection(db, "livechat_rooms", selectedRoom.id, "messages"), {
        senderId: user.uid,
        senderName: senderName,
        text: messageText.trim(),
        timestamp: serverTimestamp(),
        read: false,
      });
      
      await updateDoc(roomRef, {
        lastMessage: messageText.trim(),
        lastMessageTime: serverTimestamp(),
        ...(selectedRoom.status === "waiting" && { status: "active" }),
        agentId: isAdmin ? user.uid : selectedRoom.agentId,
        agentName: isAdmin ? AGENT_NAME : selectedRoom.agentName,
      });
      
      setMessageText("");
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // ===== TAKE ROOM (AGENT) =====
  const takeRoom = async (roomId: string) => {
    if (!db || !isAdmin || !user) return;
    try {
      await updateDoc(doc(db, "livechat_rooms", roomId), {
        agentId: user.uid,
        agentName: AGENT_NAME,
        status: "active",
      });
    } catch (error) {
      console.error("Error taking room:", error);
    }
  };

  // ===== CLOSE ROOM (AGENT) =====
  const closeRoom = async (roomId: string) => {
    if (!db || !isAdmin) return;
    try {
      await updateDoc(doc(db, "livechat_rooms", roomId), { status: "closed" });
      if (selectedRoom?.id === roomId) setSelectedRoom(null);
    } catch (error) {
      console.error("Error closing room:", error);
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getTypingText = (room: LiveChatRoom | null) => {
    if (!room || !room.typing) return null;
    const name = room.typingUserName || "Seseorang";
    return `${name} sedang mengetik...`;
  };

  // ============================================================
  // ===== USER VIEW (bukan admin) =====
  // ============================================================
  if (!isAdmin) {
    const activeRoom = rooms.find(r => r.status === 'active' || r.status === 'waiting');
    const isWaiting = activeRoom?.status === 'waiting';
    const isAgentOnlineNow = agentOnline && activeRoom?.status === 'active';

    // Tampilkan form start chat
    if (!activeRoom && !showStartChat) {
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
                border: "2px solid #e0e0e0",
                borderRadius: "8px",
                fontSize: "16px",
                fontFamily: FONT_FAMILY,
                outline: "none",
                backgroundColor: "#fff",
                marginBottom: "16px",
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

    // ===== USER DALAM CHAT - menampilkan riwayat dari agent =====
    if (activeRoom) {
      const typingText = getTypingText(activeRoom);
      const showAgentName = activeRoom.agentName || AGENT_NAME;

      return (
        <div style={{ marginTop: "40px", borderTop: "1px solid #e8e8e8", paddingTop: "40px" }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <h3 style={{ fontSize: "24px", fontWeight: 600, color: "#0D3CFC", fontFamily: FONT_FAMILY, margin: 0 }}>
                  Live Chat Agent
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <BlinkingDots active={isAgentOnlineNow} />
                  <span style={{ fontSize: '14px', color: isAgentOnlineNow ? '#22c55e' : '#999' }}>
                    {isAgentOnlineNow ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
              <div style={{ fontSize: "14px", color: isWaiting ? "#f59e0b" : "#22c55e", fontFamily: FONT_FAMILY, marginTop: "2px" }}>
                {isWaiting ? "⏳ Menunggu agent..." : `🟢 Agent: ${showAgentName}`}
                {activeRoom.agentName && !isWaiting && <InstagramVerifiedBadge size={14} />}
              </div>
            </div>
            <button
              onClick={() => {
                if (window.confirm("Tutup chat ini?")) {
                  setSelectedRoom(null);
                }
              }}
              style={{
                background: "none",
                border: "none",
                color: "#999",
                cursor: "pointer",
                fontSize: "20px",
                padding: "4px 8px",
                borderRadius: "4px",
                transition: "background 0.2s ease",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.04)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              ✕
            </button>
          </div>

          {/* Chat box dengan riwayat pesan */}
          <div style={{
            backgroundColor: "#f9f9f9",
            borderRadius: "12px",
            border: "1px solid #e8e8e8",
            height: "400px",
            display: "flex",
            flexDirection: "column",
          }}>
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
                  Belum ada pesan. Mulai chat sekarang!
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
                        padding: "10px 14px",
                        borderRadius: "12px",
                        backgroundColor: isMine ? "#0D3CFC" : "#e8e8e8",
                        color: isMine ? "#fff" : "#000",
                        fontSize: "14px",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      {!isMine && (
                        <div style={{ 
                          fontSize: "11px", 
                          fontWeight: 500, 
                          color: "#0D3CFC", 
                          marginBottom: "2px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}>
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
                      }}>
                        {formatTime(msg.timestamp)}
                        {isMine && msg.read && <span style={{ color: "#22c55e" }}>✓✓ Dibaca</span>}
                        {isMine && !msg.read && <span style={{ color: "#999" }}>✓ Terkirim</span>}
                      </div>
                    </div>
                  );
                })
              )}
              {typingText && (
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

            {/* Input pesan - user bisa kirim pesan */}
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
                  if (e.key === 'Enter' && !e.shiftKey && !isWaiting && messageText.trim()) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={isWaiting ? "Menunggu agent..." : "Ketik pesan..."}
                disabled={isWaiting}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  border: "1px solid #e8e8e8",
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none",
                  fontFamily: FONT_FAMILY,
                  backgroundColor: isWaiting ? "#f5f5f5" : "#fff",
                  transition: "border-color 0.2s ease",
                }}
                onFocus={(e) => { if (!isWaiting) e.currentTarget.style.borderColor = "#0D3CFC"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "#e8e8e8"; }}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={sendMessage}
                disabled={isWaiting || !messageText.trim()}
                style={{
                  padding: "10px 20px",
                  backgroundColor: (isWaiting || !messageText.trim()) ? "#ccc" : "#0D3CFC",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: (isWaiting || !messageText.trim()) ? "not-allowed" : "pointer",
                  fontFamily: FONT_FAMILY,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isWaiting && messageText.trim()) e.currentTarget.style.backgroundColor = "#0a2fc9";
                }}
                onMouseLeave={(e) => {
                  if (!isWaiting && messageText.trim()) e.currentTarget.style.backgroundColor = "#0D3CFC";
                }}
              >
                <SendIcon />
                <span>Kirim</span>
              </motion.button>
            </div>
          </div>
        </div>
      );
    }
    return null;
  }

  // ============================================================
  // ===== AGENT VIEW (admin) =====
  // ============================================================
  const waitingRooms = rooms.filter(r => r.status === 'waiting');
  const activeRooms = rooms.filter(r => r.status === 'active');
  const typingText = selectedRoom ? getTypingText(selectedRoom) : null;

  return (
    <div style={{ marginTop: "60px", borderTop: "1px solid #e8e8e8", paddingTop: "40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h2 style={{ fontSize: "30px", fontWeight: 600, color: "#0D3CFC", fontFamily: FONT_FAMILY, margin: 0 }}>
            Live Chat Agent
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "4px" }}>
            <BlinkingDots active={agentOnline} />
            <span style={{ fontSize: "14px", color: agentOnline ? "#22c55e" : "#999" }}>
              {agentOnline ? "Online" : "Offline"}
            </span>
            <span style={{ fontSize: "14px", color: "#999" }}>•</span>
            <span style={{ fontSize: "14px", color: "#666" }}>
              {waitingRooms.length} menunggu • {activeRooms.length} aktif
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
            <div style={{ fontSize: "16px", fontWeight: 600, color: "#000", display: "flex", alignItems: "center", gap: "4px" }}>
              {AGENT_NAME}
              <InstagramVerifiedBadge size={14} />
            </div>
            <div style={{ fontSize: "12px", color: "#999" }}>Agent Support</div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "24px", height: "500px" }}>
        {/* Left: Room list */}
        <div style={{
          width: "300px",
          backgroundColor: "#f9f9f9",
          borderRadius: "12px",
          border: "1px solid #e8e8e8",
          overflowY: "auto",
          flexShrink: 0,
        }}>
          {waitingRooms.length > 0 && (
            <div>
              <div style={{ padding: "12px 16px", backgroundColor: "#fef3c7", fontWeight: 600, fontSize: "14px", color: "#92400e" }}>
                🟡 Menunggu ({waitingRooms.length})
              </div>
              {waitingRooms.map((room) => (
                <div
                  key={room.id}
                  onClick={() => { setSelectedRoom(room); takeRoom(room.id); }}
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #e8e8e8",
                    cursor: "pointer",
                    backgroundColor: selectedRoom?.id === room.id ? "rgba(13,60,252,0.05)" : "transparent",
                    transition: "background 0.2s ease",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(13,60,252,0.03)"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = selectedRoom?.id === room.id ? "rgba(13,60,252,0.05)" : "transparent"}
                >
                  <div style={{ fontWeight: 500, fontSize: "14px", color: "#000" }}>{room.userName}</div>
                  <div style={{ fontSize: "12px", color: "#666" }}>{room.topic}</div>
                  {room.typing && <div style={{ fontSize: "11px", color: "#0D3CFC", fontStyle: "italic" }}>{room.typingUserName} mengetik...</div>}
                </div>
              ))}
            </div>
          )}
          {activeRooms.length > 0 && (
            <div>
              <div style={{ padding: "12px 16px", backgroundColor: "#d1fae5", fontWeight: 600, fontSize: "14px", color: "#065f46" }}>
                🟢 Aktif ({activeRooms.length})
              </div>
              {activeRooms.map((room) => (
                <div
                  key={room.id}
                  onClick={() => setSelectedRoom(room)}
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #e8e8e8",
                    cursor: "pointer",
                    backgroundColor: selectedRoom?.id === room.id ? "rgba(13,60,252,0.05)" : "transparent",
                    transition: "background 0.2s ease",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(13,60,252,0.03)"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = selectedRoom?.id === room.id ? "rgba(13,60,252,0.05)" : "transparent"}
                >
                  <div style={{ fontWeight: 500, fontSize: "14px", color: "#000" }}>{room.userName}</div>
                  <div style={{ fontSize: "12px", color: "#666" }}>{room.topic}</div>
                  {room.typing && <div style={{ fontSize: "11px", color: "#0D3CFC", fontStyle: "italic" }}>{room.typingUserName} mengetik...</div>}
                  {room.lastMessage && <div style={{ fontSize: "11px", color: "#999", marginTop: "2px" }}>{room.lastMessage.substring(0, 40)}{room.lastMessage.length > 40 ? "..." : ""}</div>}
                </div>
              ))}
            </div>
          )}
          {waitingRooms.length === 0 && activeRooms.length === 0 && (
            <div style={{ padding: "40px 16px", textAlign: "center", color: "#999", fontSize: "14px" }}>
              Tidak ada chat masuk
            </div>
          )}
        </div>

        {/* Right: Chat area - HEADER BIRU */}
        <div style={{
          flex: 1,
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          border: "1px solid #e8e8e8",
          display: "flex",
          flexDirection: "column",
        }}>
          {selectedRoom ? (
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
                  <div style={{ fontWeight: 600, fontSize: "16px", color: "#ffffff" }}>
                    {selectedRoom.userName}
                    <span style={{ fontSize: "12px", fontWeight: 400, color: "rgba(255,255,255,0.7)", marginLeft: "8px" }}>
                      {selectedRoom.topic}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "12px", color: selectedRoom.status === 'waiting' ? "#fef3c7" : "#d1fae5" }}>
                      {selectedRoom.status === 'waiting' ? '⏳ Menunggu' : '🟢 Aktif'}
                    </span>
                    {selectedRoom.typing && (
                      <span style={{ fontSize: "11px", color: "#ffd700", fontStyle: "italic" }}>
                        {selectedRoom.typingUserName} mengetik...
                      </span>
                    )}
                  </div>
                </div>
                {selectedRoom.status !== 'closed' && (
                  <button
                    onClick={() => closeRoom(selectedRoom.id)}
                    style={{
                      padding: "6px 14px",
                      backgroundColor: "#ef4444",
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
                    Tutup Chat
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
                {messages.map((msg, idx) => {
                  const isMine = msg.senderId === user.uid;
                  return (
                    <div
                      key={idx}
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
                        <div style={{ fontSize: "11px", fontWeight: 500, color: "#0D3CFC", marginBottom: "2px" }}>
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
                      }}>
                        {formatTime(msg.timestamp)}
                        {!isMine && msg.read && <span style={{ color: "#22c55e" }}>✓✓ Dibaca</span>}
                        {!isMine && !msg.read && <span style={{ color: "#999" }}>✓ Terkirim</span>}
                      </div>
                    </div>
                  );
                })}
                {typingText && (
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
              {selectedRoom.status !== 'closed' && (
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
// ===== KOMPONEN UTAMA =====
// ============================================================
export default function PusatBantuanPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchExpandedRef = useRef<HTMLDivElement>(null);
  const [rollingIndex, setRollingIndex] = useState(0);
  const [rollingText, setRollingText] = useState(searchRollingTexts[0]);
  const rollingRef = useRef<HTMLSpanElement>(null);
  const [greetingText, setGreetingText] = useState(getGreeting());
  const greetingRef = useRef<HTMLSpanElement>(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const [totalUnread, setTotalUnread] = useState(0);
  const [users, setUsers] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [faqData, setFaqData] = useState(defaultFaqData);
  const [lastUpdate, setLastUpdate] = useState<string>("");
  const [authorName, setAuthorName] = useState<string>("");
  const [authorEmail, setAuthorEmail] = useState<string>("");
  const [isAuthorVerified, setIsAuthorVerified] = useState(false);

  // Load FAQ from Firestore
  const loadFaqFromFirestore = async () => {
    if (!db) return;
    try {
      const faqRef = collection(db, "faq");
      const q = query(faqRef);
      const querySnap = await getDocs(q);
      
      if (!querySnap.empty) {
        const data = querySnap.docs[0]?.data();
        if (data) {
          setFaqData(data.faq || defaultFaqData);
          setLastUpdate(data.lastUpdate || new Date().toLocaleString('id-ID', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }));
          setAuthorName(data.authorName || "");
          setAuthorEmail(data.authorEmail || "");
          setIsAuthorVerified(data.authorEmail === ADMIN_EMAIL);
        }
      }
    } catch (error) {
      console.error("Error loading FAQ:", error);
    }
  };

  // Save FAQ to Firestore
  const saveFaqToFirestore = async (newFaqData: any) => {
    if (!db || !isAdmin) return;
    try {
      const faqRef = collection(db, "faq");
      const q = query(faqRef);
      const querySnap = await getDocs(q);
      
      const updateData = {
        faq: newFaqData,
        lastUpdate: new Date().toLocaleString('id-ID', { 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        authorName: user?.displayName || user?.email || "Admin",
        authorEmail: user?.email || "",
        updatedBy: user?.uid || "",
      };
      
      if (querySnap.empty) {
        await setDoc(doc(db, "faq", "main"), updateData);
      } else {
        await updateDoc(doc(db, "faq", "main"), updateData);
      }
      
      setFaqData(newFaqData);
      setLastUpdate(updateData.lastUpdate);
      setAuthorName(updateData.authorName);
      setAuthorEmail(updateData.authorEmail);
      setIsAuthorVerified(updateData.authorEmail === ADMIN_EMAIL);
    } catch (error) {
      console.error("Error saving FAQ:", error);
    }
  };

  // Handle edit FAQ
  const handleEditFaq = (category: string, index: number, newQ: string, newA: string) => {
    const newData = { ...faqData };
    newData[category as keyof typeof faqData][index] = { q: newQ, a: newA };
    saveFaqToFirestore(newData);
  };

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
          const isAdminUser = currentUser.email === ADMIN_EMAIL;
          setIsAdmin(isAdminUser);
          
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              id: currentUser.uid,
              name: googleName,
              email: currentUser.email || "",
              photoURL: googlePhotoURL,
              createdAt: serverTimestamp(),
              isPinned: false,
              isAdmin: isAdminUser,
              online: true,
              lastSeen: serverTimestamp(),
              typing: false,
              blocked: [],
              blockedBy: []
            });
            if (googlePhotoURL && currentUser.photoURL !== googlePhotoURL) {
              await updateProfile(currentUser, {
                photoURL: googlePhotoURL,
                displayName: googleName
              });
            }
          } else {
            const userData = userSnap.data();
            await updateDoc(userRef, {
              online: true,
              lastSeen: serverTimestamp()
            });
          }
        } catch (error) {
          console.error("Error saving user:", error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Load users & unread count
  useEffect(() => {
    if (!db || !user) return;
    const usersRef = collection(db, "users");
    const q = query(usersRef);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userList: any[] = [];
      snapshot.forEach((doc) => {
        if (doc.id !== user.uid) {
          userList.push({ id: doc.id, ...doc.data() });
        }
      });
      setUsers(userList);
    });
    return () => unsubscribe();
  }, [user]);

  // Load unread messages count
  useEffect(() => {
    if (!db || !user) return;
    const chatsRef = collection(db, "chats");
    const q = query(chatsRef);
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      let unread = 0;
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        if (data.participants && data.participants.includes(user.uid)) {
          const messagesRef = collection(db, "chats", docSnap.id, "messages");
          const unreadQuery = query(
            messagesRef,
            where("read", "==", false),
            where("senderId", "!=", user.uid)
          );
          const unreadSnap = await getDocs(unreadQuery);
          unread += unreadSnap.size;
        }
      }
      setTotalUnread(unread);
    });
    return () => unsubscribe();
  }, [user]);

  // Load FAQ from Firestore on mount
  useEffect(() => {
    loadFaqFromFirestore();
  }, []);

  // Rolling text search
  useEffect(() => {
    let isForward = true;
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (isForward) {
        currentIndex++;
        if (currentIndex >= searchRollingTexts.length) {
          currentIndex = searchRollingTexts.length - 2;
          isForward = false;
        }
      } else {
        currentIndex--;
        if (currentIndex < 0) {
          currentIndex = 1;
          isForward = true;
        }
      }
      if (currentIndex >= 0 && currentIndex < searchRollingTexts.length) {
        setRollingIndex(currentIndex);
        setRollingText(searchRollingTexts[currentIndex]);
        if (rollingRef.current) {
          gsap.fromTo(rollingRef.current,
            { y: 10, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
          );
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Search expand
  useEffect(() => {
    if (isSearchOpen && searchExpandedRef.current) {
      gsap.fromTo(searchExpandedRef.current,
        { height: 0, opacity: 0, y: -10 },
        { height: "auto", opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
      );
      setTimeout(() => searchInputRef.current?.focus(), 300);
    }
  }, [isSearchOpen]);

  // Click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
        setSearchQuery("");
        setSearchResults([]);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      setShowProfileDropdown(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#ffffff", fontFamily: FONT_FAMILY }}>
        <div style={{ fontSize: "18px", color: "#000", fontFamily: FONT_FAMILY }}>Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Pusat Bantuan | Menuru</title>
        <meta name="description" content="Pusat Bantuan Menuru - Bantuan dan dukungan" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link rel="icon" href="/images/ai.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/images/ai.jpg" />
      </Head>

      <div style={{
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        margin: 0,
        padding: 0,
        position: "relative",
        fontFamily: FONT_FAMILY,
        overflowX: "hidden",
      }}>
        {/* BANNER */}
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
            gap: "20px",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={0}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              style={{
                fontSize: "24px",
                fontWeight: 600,
                color: "#ffffff",
                fontFamily: FONT_FAMILY,
                letterSpacing: "-0.01em",
                textAlign: "center",
              }}
            >
              Website sedang dalam pengembangan, Terima kasih
            </motion.span>
          </AnimatePresence>
          <div
            style={{
              backgroundColor: "#EB2227",
              padding: "6px 16px",
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "#ffffff",
                fontFamily: FONT_FAMILY,
                letterSpacing: "-0.01em",
              }}
            >
              #lifeatmenuru
            </span>
          </div>
        </motion.div>

        {/* ===== HEADER ===== */}
        <div style={{
          position: "absolute",
          top: "80px",
          left: "40px",
          right: "40px",
          zIndex: 15,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          {/* KIRI: Menuru + Search */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Link href="/" passHref style={{ textDecoration: "none" }}>
              <motion.a
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                style={{
                  fontSize: "48px",
                  fontWeight: 700,
                  color: "#000000",
                  fontFamily: FONT_FAMILY,
                  letterSpacing: "-0.03em",
                  background: "transparent",
                  textDecoration: "none",
                  cursor: "pointer",
                }}
              >
                Menuru
              </motion.a>
            </Link>

            {/* Search */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              ref={searchContainerRef}
              style={{ position: "relative" }}
            >
              <motion.div
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "#0D3CFC",
                  borderRadius: "12px",
                  padding: "4px 8px",
                  border: "none",
                  position: "relative",
                  minWidth: "240px",
                  width: "240px",
                  boxShadow: "0 2px 12px rgba(13,60,252,0.2)",
                  cursor: "pointer",
                }}
                whileHover={{ scale: 1.02, boxShadow: "0 4px 20px rgba(13,60,252,0.3)" }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                onClick={() => {
                  if (!isSearchOpen) {
                    setIsSearchOpen(true);
                    setSearchQuery("");
                    setSearchResults([]);
                  }
                }}
              >
                {!isSearchOpen ? (
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "8px 16px",
                    color: "#ffffff",
                    width: "100%",
                    justifyContent: "space-between",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <SearchIcon size={18} />
                      <span 
                        ref={rollingRef}
                        style={{ 
                          color: "#ffffff",
                          fontWeight: 400,
                          display: "inline-block",
                          fontSize: "14px",
                        }}
                      >
                        {rollingText}
                      </span>
                    </div>
                    <span style={{ 
                      color: "rgba(255,255,255,0.4)", 
                      fontSize: "12px",
                      fontWeight: 300,
                    }}>
                      ⌘K
                    </span>
                  </div>
                ) : null}
              </motion.div>

              {/* Search Expanded */}
              <AnimatePresence>
                {isSearchOpen && (
                  <motion.div
                    ref={searchExpandedRef}
                    initial={{ height: 0, opacity: 0, y: -10 }}
                    animate={{ height: "auto", opacity: 1, y: 0 }}
                    exit={{ height: 0, opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, ease: "power2.out" }}
                    style={{
                      position: "absolute",
                      top: "calc(100% + 8px)",
                      right: "-400px",
                      backgroundColor: "#0D3CFC",
                      borderRadius: "16px",
                      padding: "32px 36px",
                      minWidth: "700px",
                      width: "700px",
                      minHeight: "500px",
                      boxShadow: "0 20px 80px rgba(13,60,252,0.4)",
                      overflow: "hidden",
                      zIndex: 100,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                      marginBottom: "24px",
                      borderBottom: "1px solid rgba(255,255,255,0.15)",
                      paddingBottom: "16px",
                    }}>
                      <SearchIcon size={24} />
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder=""
                        style={{
                          border: "none",
                          outline: "none",
                          backgroundColor: "transparent",
                          fontSize: "20px",
                          fontFamily: FONT_FAMILY,
                          padding: "8px 0",
                          width: "100%",
                          color: "#ffffff",
                          fontWeight: 400,
                        }}
                      />
                      <button
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchQuery("");
                          setSearchResults([]);
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "rgba(255,255,255,0.5)",
                          padding: "4px",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <CloseIcon />
                      </button>
                    </div>

                    <div style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                      minHeight: "200px",
                    }}>
                      <div style={{
                        color: "#ffffff",
                        fontSize: "16px",
                        fontFamily: FONT_FAMILY,
                        padding: "30px 0",
                        textAlign: "center",
                        fontWeight: 400,
                      }}>
                        Tidak ada hasil
                      </div>
                    </div>

                    <div style={{
                      marginTop: "20px",
                      paddingTop: "16px",
                      borderTop: "1px solid rgba(255,255,255,0.08)",
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                    }}>
                      <span style={{
                        color: "rgba(255,255,255,0.3)",
                        fontSize: "12px",
                        fontFamily: FONT_FAMILY,
                      }}>
                        ESC untuk keluar
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* TENGAH: Note Donations News Calendar */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "40px",
              padding: "0 20px",
            }}
          >
            <span style={{
              fontSize: "29px",
              fontWeight: 500,
              color: "#000000",
              fontFamily: FONT_FAMILY,
              letterSpacing: "-0.02em",
            }}>
              Note
            </span>
            <span style={{
              fontSize: "29px",
              fontWeight: 500,
              color: "#000000",
              fontFamily: FONT_FAMILY,
              letterSpacing: "-0.02em",
            }}>
              Donations
            </span>
            <span style={{
              fontSize: "29px",
              fontWeight: 500,
              color: "#000000",
              fontFamily: FONT_FAMILY,
              letterSpacing: "-0.02em",
            }}>
              News
            </span>
            <span style={{
              fontSize: "29px",
              fontWeight: 500,
              color: "#000000",
              fontFamily: FONT_FAMILY,
              letterSpacing: "-0.02em",
            }}>
              Calendar
            </span>
          </motion.div>

          {/* KANAN: Shop + Pusat bantuan (biru) + Notif + Profile */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Shop Button */}
            <Link href="/shop" passHref style={{ textDecoration: "none" }}>
              <motion.a
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#000000",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "16px",
                  fontWeight: 500,
                  fontFamily: FONT_FAMILY,
                  padding: "8px 12px",
                  borderRadius: "30px",
                  transition: "all 0.2s ease",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.04)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                <StoreIcon size={22} />
                <span>Shop</span>
              </motion.a>
            </Link>

            {/* Help Center Button - BIRU, tidak bisa diklik */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              style={{
                background: "transparent",
                border: "none",
                color: "#0D3CFC",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "16px",
                fontWeight: 500,
                fontFamily: FONT_FAMILY,
                padding: "8px 12px",
                borderRadius: "30px",
                cursor: "default",
              }}
            >
              <HelpDeskIcon size={22} />
              <span>Pusat bantuan</span>
            </motion.div>

            {/* Notification Button */}
            <div ref={notificationsRef} style={{ position: "relative" }}>
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#000000",
                  padding: "8px 8px",
                  borderRadius: "8px",
                  position: "relative",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.04)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                <NotificationsIcon size={24} hasBadge={totalUnread > 0} />
                {totalUnread > 0 && (
                  <span style={{
                    position: "absolute",
                    top: "2px",
                    right: "2px",
                    backgroundColor: "#ef4444",
                    color: "#fff",
                    fontSize: "9px",
                    fontWeight: 700,
                    borderRadius: "50%",
                    width: "18px",
                    height: "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: FONT_FAMILY,
                  }}>
                    {totalUnread > 9 ? "9+" : totalUnread}
                  </span>
                )}
              </motion.button>

              {/* Notification Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    style={{
                      position: "absolute",
                      top: "calc(100% + 8px)",
                      right: 0,
                      minWidth: "320px",
                      maxWidth: "380px",
                      maxHeight: "400px",
                      overflowY: "auto",
                      backgroundColor: "#ffffff",
                      borderRadius: "12px",
                      boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
                      border: "1px solid rgba(0,0,0,0.04)",
                      zIndex: 60,
                      fontFamily: FONT_FAMILY,
                      padding: "12px 0",
                    }}
                  >
                    <div style={{ padding: "0 16px 8px 16px", borderBottom: "1px solid #f0f0f0", fontWeight: 600, fontSize: "14px", color: "#000" }}>
                      Notifikasi
                    </div>
                    <div style={{ padding: "24px 16px", textAlign: "center", color: "#999", fontSize: "13px" }}>
                      Tidak ada notifikasi
                    </div>
                    <div style={{ padding: "8px 16px", borderTop: "1px solid #f0f0f0", textAlign: "center" }}>
                      <Link href="/" style={{ background: "none", border: "none", color: "#0D3CFC", fontSize: "12px", cursor: "pointer", fontFamily: FONT_FAMILY, textDecoration: "none" }}>
                        Lihat semua pesan
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile */}
            <div ref={profileDropdownRef} style={{ position: "relative" }}>
              {user ? (
                <>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "8px",
                      backgroundColor: "#f0f0f0",
                      overflow: "hidden",
                      cursor: "pointer",
                      border: "2px solid transparent",
                      transition: "border-color 0.2s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = "#0D3CFC"}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = "transparent"}
                  >
                    {user.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt="avatar" 
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <span style={{ fontSize: "18px", color: "#000", fontFamily: FONT_FAMILY }}>
                        {user.displayName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || "?"}
                      </span>
                    )}
                  </motion.div>

                  <AnimatePresence>
                    {showProfileDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        style={{
                          position: "absolute",
                          top: "calc(100% + 8px)",
                          right: 0,
                          minWidth: "220px",
                          backgroundColor: "#ffffff",
                          borderRadius: "12px",
                          boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
                          border: "1px solid rgba(0,0,0,0.04)",
                          overflow: "hidden",
                          zIndex: 60,
                          fontFamily: FONT_FAMILY,
                        }}
                      >
                        <div style={{ padding: "14px 16px", borderBottom: "1px solid #f0f0f0" }}>
                          <div style={{ fontSize: "13px", color: "#666", display: "flex", alignItems: "center", gap: "4px" }}>
                            <span>Hi,</span>
                            <span ref={greetingRef} style={{ fontWeight: 600, color: "#0D3CFC", display: "inline-block", fontSize: "14px" }}>
                              {greetingText}
                            </span>
                          </div>
                          <div style={{ fontSize: "15px", fontWeight: 600, color: "#000", marginTop: "2px" }}>
                            {user.displayName || user.email}
                          </div>
                          <div style={{ fontSize: "12px", color: "#999" }}>
                            {user.email}
                          </div>
                          {isAdmin && (
                            <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                              <InstagramVerifiedBadge size={14} />
                              <span style={{ fontSize: "11px", color: "#0095F6", fontWeight: 500 }}>Admin</span>
                            </div>
                          )}
                        </div>

                        <motion.button
                          whileHover={{ backgroundColor: "#f5f5f5" }}
                          onClick={() => setShowProfileDropdown(false)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "10px 16px",
                            width: "100%",
                            background: "none",
                            border: "none",
                            color: "#000",
                            fontSize: "14px",
                            cursor: "pointer",
                            textAlign: "left",
                            fontFamily: FONT_FAMILY,
                            transition: "background 0.15s ease",
                          }}
                        >
                          <UserAvatarIcon size={18} />
                          <span>Profil</span>
                        </motion.button>

                        <motion.button
                          whileHover={{ backgroundColor: "#f5f5f5" }}
                          onClick={() => setShowProfileDropdown(false)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "10px 16px",
                            width: "100%",
                            background: "none",
                            border: "none",
                            color: "#000",
                            fontSize: "14px",
                            cursor: "pointer",
                            textAlign: "left",
                            fontFamily: FONT_FAMILY,
                            transition: "background 0.15s ease",
                          }}
                        >
                          <StoreIcon size={18} />
                          <span>Transaksi</span>
                        </motion.button>

                        <motion.button
                          whileHover={{ backgroundColor: "#f5f5f5" }}
                          onClick={handleLogout}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "10px 16px",
                            width: "100%",
                            background: "none",
                            border: "none",
                            borderTop: "1px solid #f0f0f0",
                            color: "#ef4444",
                            fontSize: "14px",
                            cursor: "pointer",
                            textAlign: "left",
                            fontFamily: FONT_FAMILY,
                            transition: "background 0.15s ease",
                          }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                          </svg>
                          <span>Logout</span>
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "8px",
                    backgroundColor: "#f0f0f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid #e0e0e0",
                  }}
                >
                  <UserAvatarIcon size={22} />
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* ===== KONTEN PUSAT BANTUAN ===== */}
        <div style={{
          marginTop: "180px",
          padding: "0 40px 40px",
          width: "100%",
          maxWidth: "1400px",
          marginLeft: "auto",
          marginRight: "auto",
        }}>
          {/* Judul "Pusat Bantuan" 200px biru */}
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
            Pusat Bantuan
          </motion.h1>

          {/* Last Update */}
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

          {/* Author Verified */}
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
          </motion.div>

          {/* ===== KATEGORI: Blog, Shop, Donation, News, Calendar, Note ===== */}
          {Object.keys(faqData).map((category, catIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + catIndex * 0.1 }}
              style={{ marginBottom: "60px" }}
            >
              {/* Judul Kategori 70px biru, align left */}
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
                {category}
              </h2>

              {/* Daftar FAQ - tanpa background */}
              <div style={{
                maxWidth: "100%",
                margin: "0",
              }}>
                {faqData[category as keyof typeof faqData].map((item, idx) => (
                  <FaqItem 
                    key={idx} 
                    question={item.q} 
                    answer={item.a} 
                    category={category}
                    index={idx}
                    isAdmin={isAdmin}
                    onEdit={handleEditFaq}
                  />
                ))}
              </div>
            </motion.div>
          ))}

          {/* ===== LIVE CHAT AGENT ===== */}
          {user && (
            <LiveChatAgent 
              user={user} 
              isAdmin={isAdmin} 
              db={db} 
              auth={auth} 
            />
          )}
        </div>
      </div>
    </>
  );
}
