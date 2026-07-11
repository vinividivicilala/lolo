'use client';

import React, { useState, useEffect, useRef } from "react";
import { initializeApp, getApps } from "firebase/app";
import gsap from 'gsap';
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

interface Track {
  artist: string;
  title: string;
  embedUrl: string;
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

// Music Icons
const MusicPlayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
    <polygon points="5,3 19,12 5,21" />
  </svg>
);

const MusicPauseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
  </svg>
);

// Instagram Verified Badge
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
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          border: "1px solid rgba(255,255,255,0.05)",
        }}>
          Akun Resmi
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

// Online Status Indicator
const OnlineIndicator = ({ online, lastSeen }: { online: boolean; lastSeen?: string }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <span 
        style={{ 
          display: "inline-block",
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          backgroundColor: online ? "#4ade80" : "#999",
          boxShadow: online ? "0 0 8px rgba(74, 222, 128, 0.4)" : "none",
          flexShrink: 0,
          transition: "all 0.3s ease",
          cursor: "pointer",
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      />
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
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          border: "1px solid rgba(255,255,255,0.05)",
        }}>
          {online ? "Online" : (lastSeen || "Offline")}
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
const ReadStatus = ({ msg, isMine }: { msg: Message; isMine: boolean }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  if (!isMine) return null;
  
  const status = (() => {
    if (msg.senderId !== auth?.currentUser?.uid) return null;
    if (msg.read && msg.readAt) {
      return { icon: "✓✓", color: "#0095f6", label: "Dibaca" };
    }
    return { icon: "✓", color: "#999", label: "Terkirim" };
  })();
  
  if (!status) return null;
  
  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <span 
        style={{
          fontSize: "10px",
          color: status.color,
          fontWeight: status.label === "Dibaca" ? 600 : 400,
          cursor: "pointer",
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
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          border: "1px solid rgba(255,255,255,0.05)",
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

export default function HomePage(): React.JSX.Element {
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
  const [officialMessagesSent, setOfficialMessagesSent] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const rollingInterval = useRef<NodeJS.Timeout | null>(null);

  // Report GSAP Refs
  const reportContainerRef = useRef<HTMLDivElement | null>(null);
  const reportRef = useRef<HTMLDivElement | null>(null);
  const reportTextRef = useRef<HTMLSpanElement | null>(null);
  const reportIconRef = useRef<HTMLSpanElement | null>(null);
  const logoRef = useRef<HTMLDivElement | null>(null);
  const [isReportExpanded, setIsReportExpanded] = useState(false);

  const [isExpanded, setIsExpanded] = useState(false);

  // GSAP Animation for Add User Button
  const addUserButtonRef = useRef<HTMLButtonElement | null>(null);
  const plusIconRef = useRef<HTMLSpanElement | null>(null);

  // Privacy Policy
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  
  // Update Page
  const [showUpdate, setShowUpdate] = useState(false);
  const [selectedUpdateId, setSelectedUpdateId] = useState<string | null>(null);

  // Chat button text - rolling text
  const [chatButtonText, setChatButtonText] = useState("Chat with Menuru");
  const [incomingMessagesList, setIncomingMessagesList] = useState<string[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isIncomingMessage, setIsIncomingMessage] = useState(false);
  const chatTexts = [
    "Chat with Menuru",
    "Chat with Menuru",
    "Chat with Menuru",
    "Chat with Menuru"
  ];
  let chatTextIndex = 0;

  // Update Data
  const updates: UpdateItem[] = [
    {
      id: "1",
      title: "Fitur Chat Real-time",
      description: "Menambahkan fitur chat real-time dengan Firebase. Pengguna dapat mengirim dan menerima pesan secara instan.",
      date: "10 Juli 2026",
      status: "live",
      detail: "Fitur chat real-time memungkinkan pengguna untuk berkomunikasi secara langsung tanpa perlu refresh halaman. Menggunakan Firebase Realtime Database untuk sinkronisasi pesan secara instan. Dilengkapi dengan indikator status online dan typing indicator.",
      link: "https://menuru.com/update/chat-realtime",
      publishedBy: "Tim Menuru"
    },
    {
      id: "2",
      title: "Privacy Policy & Update System",
      description: "Menambahkan halaman Privacy Policy dan Update System untuk transparansi layanan.",
      date: "9 Juli 2026",
      status: "live",
      detail: "Halaman Privacy Policy menjelaskan bagaimana data pengguna dikumpulkan dan digunakan. Update System menampilkan riwayat pembaruan fitur secara transparan kepada pengguna.",
      link: "https://menuru.com/update/privacy-policy",
      publishedBy: "Tim Menuru"
    },
    {
      id: "3",
      title: "Fitur Pin Message",
      description: "Pengguna dapat menyematkan pesan penting di dalam chat. Pesan yang disematkan akan muncul di bagian atas.",
      date: "8 Juli 2026",
      status: "coming",
      detail: "Fitur pin message memungkinkan pengguna untuk menyematkan pesan penting agar mudah diakses. Pesan yang dipin akan muncul di bagian atas chat dengan indikator khusus.",
      link: "https://menuru.com/update/pin-message",
      publishedBy: "Tim Menuru"
    },
    {
      id: "4",
      title: "Fitur Reply & Share Message",
      description: "Pengguna dapat membalas dan meneruskan pesan ke pengguna lain dengan mudah.",
      date: "7 Juli 2026",
      status: "done",
      detail: "Fitur reply memungkinkan pengguna untuk membalas pesan tertentu dengan konteks yang jelas. Fitur share memungkinkan pengguna meneruskan pesan ke kontak lain dengan mudah.",
      link: "https://menuru.com/update/reply-share",
      publishedBy: "Tim Menuru"
    },
    {
      id: "5",
      title: "Online Status & Typing Indicator",
      description: "Menampilkan status online pengguna dan indikator ketika sedang mengetik.",
      date: "6 Juli 2026",
      status: "done",
      detail: "Menampilkan status online pengguna secara real-time. Indikator typing muncul ketika pengguna sedang mengetik pesan, memberikan pengalaman chat yang lebih interaktif.",
      link: "https://menuru.com/update/online-status",
      publishedBy: "Tim Menuru"
    }
  ];

  // Music Player States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track>({
    artist: "Feast",
    title: "Nina",
    embedUrl: "https://open.spotify.com/embed/track/0daEJMXc3b4ZMTnvtHpuTt?utm_source=generator&si=af642931b9f4461f"
  });
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Playlist Data dengan embed Spotify asli
  const playlist: Track[] = [
    { 
      artist: "Feast", 
      title: "Nina",
      embedUrl: "https://open.spotify.com/embed/track/0daEJMXc3b4ZMTnvtHpuTt?utm_source=generator&si=af642931b9f4461f"
    },
    { 
      artist: "Feast", 
      title: "Kami Belum Tentu",
      embedUrl: "https://open.spotify.com/embed/track/38yM3PwNtTSsb8UqEgqaUl?utm_source=generator&si=41bc38b2a7db4bcf"
    }
  ];

  // Select Track from Playlist
  const selectTrack = (track: Track) => {
    setCurrentTrack(track);
    setShowPlaylist(false);
    setShowMusicPlayer(true);
  };

  const MENURU_OFFICIAL: ChatUser = {
    id: "official_menuru",
    name: "Menuru Official",
    email: "official@menuru.com",
    photoURL: "",
    isOfficial: true,
    isPinned: false,
    bio: "Akun resmi Menuru Chat. Dikelola oleh tim Menuru.",
    note: "Official Account"
  };

  const OFFICIAL_MESSAGES = [
    {
      text: "Halo! Selamat datang di Menuru Chat 👋",
      senderId: "official_menuru",
      senderName: "Menuru Official"
    },
    {
      text: "Kami sedang melakukan perbaikan fitur chat. Mohon bersabar ya! 🙏",
      senderId: "official_menuru",
      senderName: "Menuru Official"
    },
    {
      text: "Fitur pin message dan riwayat chat akan segera ditingkatkan ✨",
      senderId: "official_menuru",
      senderName: "Menuru Official"
    },
    {
      text: "Jangan lupa baca Privacy Policy dan Update kami 👇",
      senderId: "official_menuru",
      senderName: "Menuru Official"
    },
    {
      text: "Terima kasih atas pengertiannya! 😊",
      senderId: "official_menuru",
      senderName: "Menuru Official"
    }
  ];

  // Broadcast messages to all users (tanpa sistem login)
  const broadcastMessages = async () => {
    if (!db) return;
    
    // Cek apakah sudah pernah broadcast
    const broadcastRef = doc(db, "system", "broadcast");
    const broadcastSnap = await getDoc(broadcastRef);
    
    if (broadcastSnap.exists() && broadcastSnap.data().messagesSent) {
      console.log("Messages already broadcasted");
      return;
    }
    
    try {
      // Get all users
      const usersRef = collection(db, "users");
      const usersSnap = await getDocs(usersRef);
      
      const broadcastMessage = {
        text: "Jangan lupa baca Privacy Policy dan Update kami 👇",
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
      
      // Tandai sudah broadcast
      await setDoc(broadcastRef, {
        messagesSent: true,
        sentAt: serverTimestamp()
      });
      
      console.log("Broadcast messages sent to all users");
    } catch (error) {
      console.error("Error broadcasting messages:", error);
    }
  };

  // Panggil broadcast saat aplikasi pertama kali dijalankan (tanpa login)
  useEffect(() => {
    if (!db) return;
    broadcastMessages();
  }, []);

  // GSAP Animation for Add User Button
  useEffect(() => {
    if (typeof window !== "undefined" && addUserButtonRef.current) {
      // Import GSAP dynamically
      import('gsap').then((gsapModule) => {
        const gsap = gsapModule.default;
        
        // Animasi hover untuk tombol
        const button = addUserButtonRef.current;
        const plusIcon = plusIconRef.current;
        
        if (button && plusIcon) {
          // Hover animation
          button.addEventListener('mouseenter', () => {
            gsap.to(button, {
              scale: 1.02,
              duration: 0.3,
              ease: "power2.out",
              backgroundColor: "#000000",
              color: "#ffffff",
            });
            gsap.to(plusIcon, {
              rotation: 90,
              duration: 0.4,
              ease: "back.out(1.7)",
              scale: 1.2,
            });
          });
          
          button.addEventListener('mouseleave', () => {
            gsap.to(button, {
              scale: 1,
              duration: 0.3,
              ease: "power2.out",
              backgroundColor: "transparent",
              color: "#000000",
            });
            gsap.to(plusIcon, {
              rotation: 0,
              duration: 0.4,
              ease: "back.out(1.7)",
              scale: 1,
            });
          });
          
          // Click animation
          button.addEventListener('click', () => {
            gsap.to(button, {
              scale: 0.95,
              duration: 0.15,
              ease: "power2.out",
              onComplete: () => {
                gsap.to(button, {
                  scale: 1,
                  duration: 0.3,
                  ease: "elastic.out(1, 0.5)",
                });
              }
            });
            
            gsap.to(plusIcon, {
              rotation: 90,
              duration: 0.4,
              ease: "back.out(1.7)",
              scale: 1.3,
              onComplete: () => {
                gsap.to(plusIcon, {
                  rotation: 90,
                  duration: 0.3,
                  ease: "power2.out",
                  scale: 1,
                });
              }
            });
          });
        }
      });
    }
  }, [addUserButtonRef, plusIconRef]);



  // GSAP Animation untuk Read the Report - VERSI SEDERHANA
useEffect(() => {
  if (typeof window === "undefined") return;

  const container = reportContainerRef.current;
  const report = reportRef.current;
  const text = reportTextRef.current;
  const icon = reportIconRef.current;
  const logo = logoRef.current;

  if (!container || !report || !text || !icon || !logo) {
    console.log("Refs not ready");
    return;
  }

  console.log("GSAP Report initialized");

  // Text variants untuk hover
  const textVariants = ["Read the Report", "Baca Laporan", "Read More", "Lihat Laporan"];
  let textIndex = 0;
  let hoverTimeout: NodeJS.Timeout | null = null;
  let isHovering = false;

  // Hover animation
  const startTextHover = () => {
    if (!isReportExpanded) {
      isHovering = true;
      textIndex = 0;
      
      // Scale effect
      gsap.to(text, {
        scale: 1.05,
        duration: 0.2,
        ease: "power2.out",
      });
      gsap.to(icon, {
        rotation: 90,
        duration: 0.4,
        ease: "back.out(1.7)",
        scale: 1.2,
      });

      // Ganti teks setiap 600ms
      if (!hoverTimeout) {
        hoverTimeout = setInterval(() => {
          if (text && isHovering && !isReportExpanded) {
            textIndex = (textIndex + 1) % textVariants.length;
            gsap.to(text, {
              opacity: 0,
              y: -5,
              duration: 0.15,
              ease: "power2.out",
              onComplete: () => {
                if (text && isHovering && !isReportExpanded) {
                  text.textContent = textVariants[textIndex];
                  gsap.to(text, {
                    opacity: 1,
                    y: 0,
                    duration: 0.15,
                    ease: "power2.out",
                  });
                }
              }
            });
          }
        }, 600);
      }
    }
  };

  const stopTextHover = () => {
    isHovering = false;
    if (hoverTimeout) {
      clearInterval(hoverTimeout);
      hoverTimeout = null;
    }
    if (!isReportExpanded) {
      gsap.to(text, {
        scale: 1,
        duration: 0.2,
        ease: "power2.out",
      });
      gsap.to(icon, {
        rotation: 0,
        duration: 0.4,
        ease: "back.out(1.7)",
        scale: 1,
      });
      if (text && text.textContent !== textVariants[0]) {
        gsap.to(text, {
          opacity: 0,
          y: -5,
          duration: 0.15,
          ease: "power2.out",
          onComplete: () => {
            if (text && !isReportExpanded) {
              text.textContent = textVariants[0];
              gsap.to(text, {
                opacity: 1,
                y: 0,
                duration: 0.15,
                ease: "power2.out",
              });
            }
          }
        });
      }
    }
  };

  // Hover events
  report.addEventListener('mouseenter', startTextHover);
  report.addEventListener('mouseleave', stopTextHover);

  // Cleanup
  return () => {
    report.removeEventListener('mouseenter', startTextHover);
    report.removeEventListener('mouseleave', stopTextHover);
    if (hoverTimeout) {
      clearInterval(hoverTimeout);
    }
  };
}, [isReportExpanded]);

// Fungsi untuk handle expand/collapse
const handleReportToggle = () => {
  console.log("Toggle clicked, current state:", isReportExpanded);
  
  const container = reportContainerRef.current;
  const report = reportRef.current;
  const text = reportTextRef.current;
  const icon = reportIconRef.current;
  const logo = logoRef.current;

  if (!container || !report || !text || !icon || !logo) {
    console.log("Refs not ready for toggle");
    return;
  }

  if (!isReportExpanded) {
    // EXPAND - dari kanan ke kiri
    console.log("Expanding...");
    
    // Set initial state
    gsap.set(container, {
      width: "auto",
      height: "auto",
      position: "absolute",
      top: "0px",
      left: "0px",
      zIndex: 10,
      backgroundColor: "transparent",
    });

    // Animate container ke full screen
    gsap.to(container, {
      width: "100vw",
      height: "100vh",
      duration: 0.8,
      ease: "power3.inOut",
      backgroundColor: "#FE7141",
      position: "fixed",
      top: 0,
      left: 0,
      zIndex: 100,
      borderRadius: 0,
      transformOrigin: "right center",
    });

    // Animate report
    gsap.to(report, {
      width: "100%",
      height: "100vh",
      padding: "40px 60px",
      justifyContent: "flex-start",
      gap: "20px",
      backgroundColor: "#FE7141",
      duration: 0.6,
      ease: "power3.out",
      minWidth: "100%",
      position: "relative",
      borderRadius: 0,
    });

    // Hide logo
    gsap.to(logo, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.out",
      pointerEvents: "none",
    });

    // Perbesar teks
    gsap.to(text, {
      fontSize: "40px",
      fontWeight: 700,
      duration: 0.4,
      ease: "power2.out",
      color: "#000000",
      scale: 1,
    });

    // Rotasi icon
    gsap.to(icon, {
      fontSize: "40px",
      rotation: 45,
      duration: 0.4,
      ease: "back.out(1.7)",
      scale: 1.2,
    });

    // Update teks icon
    icon.textContent = "✕";

    setIsReportExpanded(true);
  } else {
    // COLLAPSE
    console.log("Collapsing...");

    // Kembalikan container
    gsap.to(container, {
      width: "auto",
      height: "auto",
      duration: 0.7,
      ease: "power3.inOut",
      backgroundColor: "transparent",
      position: "absolute",
      top: "0px",
      left: "0px",
      zIndex: 10,
    });

    // Kembalikan report
    gsap.to(report, {
      width: "auto",
      height: "48px",
      padding: "6px 35px 6px 200px",
      justifyContent: "flex-end",
      gap: "6px",
      backgroundColor: "#FE7141",
      duration: 0.5,
      ease: "power3.out",
      minWidth: "450px",
      position: "relative",
      borderRadius: 0,
    });

    // Tampilkan logo
    gsap.to(logo, {
      opacity: 1,
      duration: 0.3,
      ease: "power2.out",
      pointerEvents: "auto",
    });

    // Kembalikan teks
    gsap.to(text, {
      fontSize: "18px",
      fontWeight: 600,
      duration: 0.4,
      ease: "power2.out",
      color: "#000000",
      scale: 1,
    });

    // Kembalikan icon
    gsap.to(icon, {
      fontSize: "30px",
      rotation: 0,
      duration: 0.4,
      ease: "back.out(1.7)",
      scale: 1,
    });

    // Update teks icon
    icon.textContent = "+";

    // Kembalikan teks report ke awal
    if (text.textContent !== "Read the Report") {
      text.textContent = "Read the Report";
    }

    setIsReportExpanded(false);
  }
};

// Fungsi untuk handle click di luar
const handleClickOutside = (e: MouseEvent) => {
  const container = reportContainerRef.current;
  if (container && !container.contains(e.target as Node)) {
    if (isReportExpanded) {
      handleReportToggle();
    }
  }
};

// Pasang event listener untuk click outside
useEffect(() => {
  document.addEventListener('click', handleClickOutside);
  return () => document.removeEventListener('click', handleClickOutside);
}, [isReportExpanded]);






  



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
          
          // Send official messages to current user
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
            
            // Kumpulkan semua pesan masuk dari semua pengirim
            if (unreadCount > 0 && otherUser) {
              const unreadDocs = unreadSnap.docs;
              for (const doc of unreadDocs) {
                const msg = doc.data() as Message;
                newMessages.push(`Pesan dari ${otherUser.name}: ${msg.text.substring(0, 25)}${msg.text.length > 25 ? '...' : ''}`);
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

      // Update chat button text dengan rolling messages
      if (totalUnreadCount > 0 && newMessages.length > 0) {
        setIsIncomingMessage(true);
        setIncomingMessagesList(newMessages);
        setCurrentMessageIndex(0);
        setChatButtonText(newMessages[0]);
        
        // Clear previous interval
        if (rollingInterval.current) {
          clearInterval(rollingInterval.current);
          rollingInterval.current = null;
        }
        
        // Auto-rotate through incoming messages - berganti setiap 3 detik
        let index = 0;
        rollingInterval.current = setInterval(() => {
          index = (index + 1) % newMessages.length;
          setCurrentMessageIndex(index);
          setChatButtonText(newMessages[index]);
        }, 3000);
        
        // After 12 seconds, revert to normal text
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
        // If no unread messages, show normal text
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
  }, [user, users]);

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
      setLoginError("Login gagal. Silahkan coba lagi.");
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
      setLoginError("Email atau password salah.");
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
      
      // Reset rolling text setelah mengirim pesan
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
        text: `Diteruskan dari ${shareMessage.senderName}: ${shareMessage.text}`,
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
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Hari ini";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Kemarin";
    } else {
      return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
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
    if (chatUser.id === user?.uid) return "Online";
    const date = chatUser.lastSeen.toDate ? chatUser.lastSeen.toDate() : new Date(chatUser.lastSeen);
    return `Terakhir online ${date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
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
  }, [isChatOpen, user, isIncomingMessage]);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffffff",
        fontFamily: "Inter, 'Inter Fallback'"
      }}>
        <div style={{ fontSize: "18px", color: "#000" }}>Loading...</div>
      </div>
    );
  }

  // Get selected update item
  const selectedUpdate = updates.find(item => item.id === selectedUpdateId);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        margin: 0,
        padding: 0,
        position: "relative",
        fontFamily: "Inter, 'Inter Fallback'",
        overflow: "hidden",
      }}
    >
      {/* Logo Menuru'26 + Read the Report - Sejajar Sampingan */}
<div
  ref={reportContainerRef}
  style={{
    position: "absolute",
    top: "0px",
    left: "0px",
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    gap: "0px",
    overflow: "hidden",
    backgroundColor: "transparent",
  }}
>
  {/* Logo Menuru'26 - Background Hitam */}
  <div
    ref={logoRef}
    style={{
      display: "flex",
      alignItems: "center",
      backgroundColor: "#000000",
      padding: "6px 18px",
      borderRadius: "0px",
      boxShadow: "none",
      height: "48px",
      flexShrink: 0,
    }}
  >
    <span
      style={{
        fontSize: "30px",
        fontWeight: 600,
        color: "#ffffff",
        letterSpacing: "-0.015em",
        fontFamily: "Inter, 'Inter Fallback'",
        lineHeight: 1.2,
      }}
    >
      Menuru'26
    </span>
  </div>

  {/* Read the Report - Background #FE7141 */}
  <div
    ref={reportRef}
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      backgroundColor: "#FE7141",
      padding: "6px 35px 6px 200px",
      borderRadius: "0px",
      boxShadow: "none",
      gap: "6px",
      cursor: "pointer",
      height: "48px",
      minWidth: "450px",
      flexShrink: 0,
      position: "relative",
      zIndex: 20,
      transition: "background-color 0.3s ease",
    }}
    onMouseEnter={(e) => {
      if (!isReportExpanded) {
        e.currentTarget.style.backgroundColor = "#e8653a";
      }
    }}
    onMouseLeave={(e) => {
      if (!isReportExpanded) {
        e.currentTarget.style.backgroundColor = "#FE7141";
      }
    }}
    onClick={() => {
      if (isReportExpanded) {
        handleReportToggle();
      }
    }}
  >
    {/* Teks di sisi kanan */}
    <span
      ref={reportTextRef}
      style={{
        fontSize: "18px",
        fontWeight: 600,
        color: "#000000",
        letterSpacing: "-0.01em",
        fontFamily: "Inter, 'Inter Fallback'",
        lineHeight: 1.2,
        whiteSpace: "nowrap",
        display: "inline-block",
        position: "relative",
        zIndex: 2,
      }}
    >
      Read the Report
    </span>
    {/* Icon + di sisi kanan (klik untuk expand) */}
    <span
      ref={reportIconRef}
      style={{
        fontSize: "30px",
        fontWeight: 300,
        color: "#000000",
        lineHeight: 1,
        display: "inline-block",
        position: "relative",
        zIndex: 30,
        cursor: "pointer",
        pointerEvents: "auto",
        userSelect: "none",
      }}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        handleReportToggle();
      }}
    >
      {isReportExpanded ? "✕" : "+"}
    </span>
  </div>
</div>
      {/* User Status & Music Widget - Pojok Kanan Atas */}
      <div
        style={{
          position: "absolute",
          top: "40px",
          right: "40px",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        {/* Music Widget */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "6px 16px 6px 6px",
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            border: "1px solid #e0e0e0",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            transition: "all 0.3s ease",
            maxWidth: "260px",
            cursor: "pointer",
          }}
          onClick={() => setShowMusicPlayer(true)}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "8px",
              overflow: "hidden",
              flexShrink: 0,
              backgroundColor: "#f0f0f0",
              border: "1px solid #e8e8e8",
              position: "relative",
            }}
          >
            <img
              src={`https://ui-avatars.com/api/?name=${currentTrack.artist.replace(/ /g, '+')}&background=000000&color=ffffff&size=40&font-size=0.5`}
              alt={currentTrack.artist}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%23f0f0f0'/%3E%3Ctext x='20' y='25' text-anchor='middle' font-size='18' fill='%23666' font-family='sans-serif'%3E🎵%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>

          <div
            style={{
              flex: 1,
              overflow: "hidden",
              minWidth: 0,
            }}
          >
            <div style={{ overflow: "hidden", position: "relative" }}>
              <div
                style={{
                  display: "inline-block",
                  animation: "marquee 12s linear infinite",
                  paddingLeft: "100%",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#000000",
                  letterSpacing: "-0.01em",
                  whiteSpace: "nowrap",
                }}
              >
                {currentTrack.artist} - {currentTrack.title}
                <span style={{ paddingLeft: "50px", color: "#ccc" }}>●</span>
              </div>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowPlaylist(!showPlaylist);
            }}
            style={{
              background: "none",
              border: "none",
              color: "#666",
              cursor: "pointer",
              padding: "4px 8px",
              fontSize: "18px",
              fontWeight: 300,
              borderRadius: "4px",
              transition: "all 0.2s ease",
              lineHeight: 1,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f0f0f0"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
          >
            ⋮
          </button>
        </div>

        {/* User Status */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            padding: "8px 20px",
            backgroundColor: "#f5f5f5",
            borderRadius: "12px",
            fontSize: "14px",
            color: "#000",
            border: "1px solid #e0e0e0",
          }}
        >
          {user ? (
            <>
              {user.photoURL && (
                <img 
                  src={user.photoURL} 
                  alt="avatar" 
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
                }}
                onClick={() => {
                  const selfUser = users.find(u => u.id === user.uid);
                  if (selfUser) handleOpenProfile(selfUser);
                }}
              >
                {user.displayName || user.email}
              </span>
              <OnlineIndicator online={true} />
              <button
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
                  fontFamily: "Inter, 'Inter Fallback'",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#e0e0e0";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <button
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
                fontFamily: "Inter, 'Inter Fallback'",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f0f0f0";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              Login
            </button>
          )}
        </div>
      </div>

      {/* Music Player Modal */}
      {showMusicPlayer && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.6)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setShowMusicPlayer(false)}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              padding: "24px",
              maxWidth: "420px",
              width: "90%",
              border: "1px solid #e0e0e0",
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "8px",
                    overflow: "hidden",
                    backgroundColor: "#f0f0f0",
                    border: "1px solid #e8e8e8",
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={`https://ui-avatars.com/api/?name=${currentTrack.artist.replace(/ /g, '+')}&background=000000&color=ffffff&size=40&font-size=0.5`}
                    alt={currentTrack.artist}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: "16px", fontWeight: 600, color: "#000" }}>
                    {currentTrack.title}
                  </div>
                  <div style={{ fontSize: "13px", color: "#666" }}>
                    {currentTrack.artist}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowMusicPlayer(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#666",
                  padding: "4px",
                }}
              >
                <CloseIcon />
              </button>
            </div>

            <div style={{ borderRadius: "12px", overflow: "hidden" }}>
              <iframe
                style={{ borderRadius: "12px", border: "none", width: "100%" }}
                src={currentTrack.embedUrl}
                height="352"
                frameBorder="0"
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
              />
            </div>

            <div style={{ marginTop: "12px", display: "flex", gap: "8px", justifyContent: "center" }}>
              {playlist.map((track) => (
                <button
                  key={track.title}
                  onClick={() => {
                    setCurrentTrack(track);
                    const iframe = document.querySelector('iframe[src*="open.spotify.com"]') as HTMLIFrameElement;
                    if (iframe) {
                      iframe.src = track.embedUrl;
                    }
                  }}
                  style={{
                    padding: "6px 16px",
                    borderRadius: "20px",
                    border: currentTrack.title === track.title ? "2px solid #000" : "1px solid #e0e0e0",
                    backgroundColor: currentTrack.title === track.title ? "#f0f0f0" : "transparent",
                    color: "#000",
                    fontSize: "12px",
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    fontFamily: "Inter, 'Inter Fallback'",
                  }}
                >
                  {track.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Playlist Dropdown */}
      {showPlaylist && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            padding: "24px 28px",
            maxWidth: "380px",
            width: "90%",
            zIndex: 1000,
            boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
            border: "1px solid #e0e0e0",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <span style={{ fontSize: "16px", fontWeight: 600, color: "#000" }}>
              Daftar Lagu
            </span>
            <button
              onClick={() => setShowPlaylist(false)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#666",
                fontSize: "20px",
                padding: "0 4px",
              }}
            >
              ✕
            </button>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {playlist.map((track, index) => {
              const isActive = currentTrack.title === track.title && currentTrack.artist === track.artist;
              return (
                <div
                  key={index}
                  onClick={() => {
                    selectTrack(track);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    backgroundColor: isActive ? "#f0f0f0" : "transparent",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    border: isActive ? "1px solid #000" : "1px solid transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = "#f8f8f8";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
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
                      fontSize: "12px",
                      flexShrink: 0,
                      color: "#666",
                    }}
                  >
                    ♫
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "14px", fontWeight: 500, color: "#000" }}>
                      {track.title}
                    </div>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      {track.artist}
                    </div>
                  </div>
                  {isActive && (
                    <span style={{ fontSize: "11px", color: "#000", fontWeight: 600 }}>
                      ▶
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLogin && (
        <div
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
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "12px",
              padding: "32px 36px",
              maxWidth: "400px",
              width: "90%",
              border: "1px solid #e0e0e0",
              boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: "24px", fontWeight: 600, color: "#000", marginBottom: "20px", fontFamily: "Inter, 'Inter Fallback'" }}>
              Login
            </h2>
            <input
              type="email"
              placeholder="Email"
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
                fontFamily: "Inter, 'Inter Fallback'",
                color: "#000",
              }}
            />
            <input
              type="password"
              placeholder="Password"
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
                fontFamily: "Inter, 'Inter Fallback'",
                color: "#000",
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleEmailLogin()}
            />
            {loginError && (
              <div style={{ color: "#ef4444", fontSize: "12px", marginBottom: "12px" }}>
                {loginError}
              </div>
            )}
            <button
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
                fontFamily: "Inter, 'Inter Fallback'",
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
            >
              Login with Email
            </button>
            <div style={{ marginTop: "12px", textAlign: "center", fontSize: "14px", color: "#666" }}>
              atau
            </div>
            <button
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
                fontFamily: "Inter, 'Inter Fallback'",
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
            >
              Login with Google
            </button>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && shareMessage && (
        <div
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
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "12px",
              padding: "30px",
              maxWidth: "400px",
              width: "90%",
              border: "1px solid #e0e0e0",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#000", marginBottom: "12px", fontFamily: "Inter, 'Inter Fallback'" }}>
              Teruskan Pesan
            </h3>
            <div style={{ 
              fontSize: "13px", 
              color: "#666", 
              marginBottom: "16px",
              padding: "10px",
              backgroundColor: "#f5f5f5",
              borderRadius: "8px"
            }}>
              <div style={{ fontWeight: 500, color: "#000" }}>Dari: {shareMessage.senderName}</div>
              <div>{shareMessage.text}</div>
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
                fontFamily: "Inter, 'Inter Fallback'",
                marginBottom: "12px",
                backgroundColor: "#fff",
                color: "#000",
              }}
            >
              <option value="">Pilih user...</option>
              {users.filter(u => u.id !== user.uid && u.id !== shareMessage.senderId).map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} {u.isOfficial && <InstagramVerifiedBadge size={14} />}
                </option>
              ))}
            </select>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
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
                  fontFamily: "Inter, 'Inter Fallback'",
                }}
              >
                Teruskan
              </button>
              <button
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
                  fontFamily: "Inter, 'Inter Fallback'",
                }}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Box - Kode lengkap seperti sebelumnya */}
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
        {isChatOpen && (
          <div
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
              animation: "slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            {/* Header - Hitam dengan teks cerah */}
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
                  }}
                >
                  {selectedUpdateId && selectedUpdate ? "Update Detail" : (showUpdate ? "Update" : (showPrivacyPolicy ? "Privacy Policy" : (showProfile ? "Profil" : (selectedChat ? selectedChat.name : "Pesan"))))}
                </span>
                {!showProfile && !showPrivacyPolicy && !showUpdate && !selectedUpdateId && selectedChat && (
                  <>
                    <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>
                      {selectedChat.email}
                    </span>
                    <OnlineIndicator 
                      online={getOnlineStatus(selectedChat.id)} 
                      lastSeen={getLastSeen(selectedChat.id)}
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
                    }}
                  >
                    {totalUnread}
                  </span>
                )}
              </div>
              <button
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
              </button>
            </div>

            {/* Content - Update Detail Page (seperti halaman profile) */}
            {selectedUpdateId && selectedUpdate ? (
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "28px 32px",
                  backgroundColor: "#ffffff",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", width: "100%" }}>
                  {/* Back Button */}
                  <button
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
                      fontFamily: "Inter, 'Inter Fallback'",
                      marginBottom: "16px",
                      padding: "4px 0",
                      transition: "color 0.2s ease",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "#000"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "#666"}
                  >
                    <BackIcon />
                    <span>Kembali</span>
                  </button>

                  {/* Badge Status */}
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
                        fontFamily: "Inter, 'Inter Fallback'",
                      }}
                    >
                      {selectedUpdate.status === "live" ? "Live" : (selectedUpdate.status === "coming" ? "Coming Soon" : "Done")}
                    </span>
                  </div>

                  {/* Title */}
                  <h2
                    style={{
                      fontSize: "22px",
                      fontWeight: 600,
                      color: "#000000",
                      margin: "0 0 8px 0",
                      fontFamily: "Inter, 'Inter Fallback'",
                    }}
                  >
                    {selectedUpdate.title}
                  </h2>

                  {/* Date & Published By */}
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
                        fontFamily: "Inter, 'Inter Fallback'",
                      }}
                    >
                      {selectedUpdate.date}
                    </span>
                    <span
                      style={{
                        fontSize: "13px",
                        color: "#999",
                        fontFamily: "Inter, 'Inter Fallback'",
                      }}
                    >
                      • {selectedUpdate.publishedBy}
                    </span>
                  </div>

                  {/* Description */}
                  <p
                    style={{
                      fontSize: "15px",
                      color: "#000000",
                      lineHeight: 1.8,
                      margin: "0 0 16px 0",
                      fontFamily: "Inter, 'Inter Fallback'",
                    }}
                  >
                    {selectedUpdate.description}
                  </p>

                  {/* Detail */}
                  <div
                    style={{
                      width: "100%",
                      marginBottom: "16px",
                      padding: "16px 20px",
                      backgroundColor: "#f8f8f8",
                      borderRadius: "10px",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#000000",
                        marginBottom: "8px",
                        fontFamily: "Inter, 'Inter Fallback'",
                      }}
                    >
                      Detail Update
                    </h3>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#333",
                        lineHeight: 1.8,
                        margin: 0,
                        fontFamily: "Inter, 'Inter Fallback'",
                      }}
                    >
                      {selectedUpdate.detail}
                    </p>
                  </div>

                  {/* Link */}
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
                        fontFamily: "Inter, 'Inter Fallback'",
                      }}
                    >
                      Link:
                    </span>
                    <a
                      href={selectedUpdate.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: "14px",
                        color: "#3b82f6",
                        textDecoration: "underline",
                        fontFamily: "Inter, 'Inter Fallback'",
                        fontWeight: 500,
                      }}
                    >
                      {selectedUpdate.link}
                    </a>
                  </div>

                  {/* Footer */}
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
                        fontFamily: "Inter, 'Inter Fallback'",
                      }}
                    >
                      Chat with Menuru v1.0
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#999",
                        fontFamily: "Inter, 'Inter Fallback'",
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
                }}
              >
                {/* Header Update */}
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
                        fontFamily: "Inter, 'Inter Fallback'",
                      }}
                    >
                      Update Sistem
                    </span>
                  </div>
                  <h2
                    style={{
                      fontSize: "22px",
                      fontWeight: 600,
                      color: "#000000",
                      margin: "0 0 4px 0",
                      fontFamily: "Inter, 'Inter Fallback'",
                    }}
                  >
                    Chat with Menuru
                  </h2>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#999",
                      margin: "0",
                      fontFamily: "Inter, 'Inter Fallback'",
                    }}
                  >
                    Riwayat pembaruan dan pengembangan
                  </p>
                </div>

                {/* Timeline */}
                <div style={{ position: "relative", paddingLeft: "28px" }}>
                  {/* Garis vertikal titik-titik */}
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
                    const glowColor = isLive ? "rgba(59, 130, 246, 0.8)" : "none";
                    const isPulsing = isLive;
                    
                    return (
                      <div
                        key={item.id}
                        style={{
                          position: "relative",
                          paddingBottom: index === updates.length - 1 ? "0" : "28px",
                          paddingLeft: "24px",
                          cursor: "pointer",
                        }}
                        onClick={() => setSelectedUpdateId(item.id)}
                      >
                        {/* Titik bulat dengan efek pemancar */}
                        <div
                          style={{
                            position: "absolute",
                            left: "-22px",
                            top: "4px",
                            width: "14px",
                            height: "14px",
                            borderRadius: "50%",
                            backgroundColor: dotColor,
                            border: "2px solid #ffffff",
                            boxShadow: isPulsing ? `0 0 20px ${glowColor}, 0 0 40px ${glowColor}` : "0 0 4px rgba(0,0,0,0.1)",
                            animation: isPulsing ? "pulseTransmitter 1.5s ease-in-out infinite" : "none",
                            zIndex: 1,
                          }}
                        />
                        
                        {/* Garis titik-titik dari titik ke judul */}
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
                        
                        {/* Card Update */}
                        <div
                          style={{
                            padding: "0",
                          }}
                        >
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
                                fontFamily: "Inter, 'Inter Fallback'",
                                letterSpacing: "-0.01em",
                              }}
                            >
                              {item.title}
                            </div>
                            {/* Panah SVG */}
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
                      </div>
                    );
                  })}
                </div>

                {/* Footer */}
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
                      fontFamily: "Inter, 'Inter Fallback'",
                    }}
                  >
                    Chat with Menuru v1.0
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#999",
                      fontFamily: "Inter, 'Inter Fallback'",
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
                }}
              >
                {/* Badge dan Title */}
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
                        fontFamily: "Inter, 'Inter Fallback'",
                      }}
                    >
                      Kebijakan Privasi
                    </span>
                  </div>
                  <h2
                    style={{
                      fontSize: "22px",
                      fontWeight: 600,
                      color: "#000000",
                      margin: "0 0 4px 0",
                      fontFamily: "Inter, 'Inter Fallback'",
                    }}
                  >
                    Chat with Menuru
                  </h2>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#999",
                      margin: "0",
                      fontFamily: "Inter, 'Inter Fallback'",
                    }}
                  >
                    Terakhir diperbarui: 9 Juli 2026
                  </p>
                </div>

                {/* Section 1 */}
                <div style={{ marginBottom: "20px" }}>
                  <h3
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#000000",
                      marginBottom: "6px",
                      fontFamily: "Inter, 'Inter Fallback'",
                    }}
                  >
                    1. Informasi yang Kami Kumpulkan
                  </h3>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#666",
                      lineHeight: 1.7,
                      margin: "0 0 6px 0",
                      fontFamily: "Inter, 'Inter Fallback'",
                    }}
                  >
                    Chat with Menuru mengumpulkan informasi berikut untuk memberikan layanan chat yang optimal:
                  </p>
                  <ul
                    style={{
                      fontSize: "13px",
                      color: "#666",
                      lineHeight: 1.9,
                      paddingLeft: "20px",
                      margin: "0",
                      fontFamily: "Inter, 'Inter Fallback'",
                    }}
                  >
                    <li>Nama dan email dari akun Google Anda</li>
                    <li>Foto profil dari akun Google Anda</li>
                    <li>Pesan dan riwayat chat yang Anda kirim</li>
                    <li>Status online dan aktivitas chat</li>
                  </ul>
                </div>

                {/* Section 2 */}
                <div style={{ marginBottom: "20px" }}>
                  <h3
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#000000",
                      marginBottom: "6px",
                      fontFamily: "Inter, 'Inter Fallback'",
                    }}
                  >
                    2. Bagaimana Kami Menggunakan Informasi
                  </h3>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#666",
                      lineHeight: 1.7,
                      margin: "0 0 6px 0",
                      fontFamily: "Inter, 'Inter Fallback'",
                    }}
                  >
                    Informasi yang kami kumpulkan digunakan untuk:
                  </p>
                  <ul
                    style={{
                      fontSize: "13px",
                      color: "#666",
                      lineHeight: 1.9,
                      paddingLeft: "20px",
                      margin: "0",
                      fontFamily: "Inter, 'Inter Fallback'",
                    }}
                  >
                    <li>Menyediakan dan memelihara layanan chat</li>
                    <li>Mengirimkan pesan antar pengguna</li>
                    <li>Menampilkan status online pengguna</li>
                    <li>Menyimpan riwayat chat untuk akses di masa depan</li>
                  </ul>
                </div>

                {/* Section 3 */}
                <div style={{ marginBottom: "20px" }}>
                  <h3
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#000000",
                      marginBottom: "6px",
                      fontFamily: "Inter, 'Inter Fallback'",
                    }}
                  >
                    3. Penyimpanan Data
                  </h3>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#666",
                      lineHeight: 1.7,
                      margin: 0,
                      fontFamily: "Inter, 'Inter Fallback'",
                    }}
                  >
                    Semua data chat disimpan di database Firebase Cloud Firestore. Data Anda aman dan hanya dapat diakses oleh Anda dan pengguna yang Anda ajak chat.
                  </p>
                </div>

                {/* Section 4 */}
                <div style={{ marginBottom: "20px" }}>
                  <h3
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#000000",
                      marginBottom: "6px",
                      fontFamily: "Inter, 'Inter Fallback'",
                    }}
                  >
                    4. Keamanan
                  </h3>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#666",
                      lineHeight: 1.7,
                      margin: 0,
                      fontFamily: "Inter, 'Inter Fallback'",
                    }}
                  >
                    Kami menggunakan Firebase Authentication untuk keamanan akun dan Firestore Security Rules untuk melindungi data chat Anda. Semua komunikasi dienkripsi melalui HTTPS.
                  </p>
                </div>

                {/* Section 5 */}
                <div style={{ marginBottom: "20px" }}>
                  <h3
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#000000",
                      marginBottom: "6px",
                      fontFamily: "Inter, 'Inter Fallback'",
                    }}
                  >
                    5. Hak Anda
                  </h3>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#666",
                      lineHeight: 1.7,
                      margin: "0 0 6px 0",
                      fontFamily: "Inter, 'Inter Fallback'",
                    }}
                  >
                    Anda memiliki hak untuk:
                  </p>
                  <ul
                    style={{
                      fontSize: "13px",
                      color: "#666",
                      lineHeight: 1.9,
                      paddingLeft: "20px",
                      margin: "0",
                      fontFamily: "Inter, 'Inter Fallback'",
                    }}
                  >
                    <li>Mengakses data pribadi Anda</li>
                    <li>Menghapus akun dan data chat Anda</li>
                    <li>Menonaktifkan notifikasi</li>
                  </ul>
                </div>

                {/* Section 6 */}
                <div style={{ marginBottom: "20px" }}>
                  <h3
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#000000",
                      marginBottom: "6px",
                      fontFamily: "Inter, 'Inter Fallback'",
                    }}
                  >
                    6. Perubahan Kebijakan
                  </h3>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#666",
                      lineHeight: 1.7,
                      margin: 0,
                      fontFamily: "Inter, 'Inter Fallback'",
                    }}
                  >
                    Kami dapat memperbarui kebijakan privasi ini dari waktu ke waktu. Perubahan akan diinformasikan melalui aplikasi chat.
                  </p>
                </div>

                {/* Section 7 */}
                <div style={{ marginBottom: "20px" }}>
                  <h3
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#000000",
                      marginBottom: "6px",
                      fontFamily: "Inter, 'Inter Fallback'",
                    }}
                  >
                    7. Kontak
                  </h3>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#666",
                      lineHeight: 1.7,
                      margin: "0 0 4px 0",
                      fontFamily: "Inter, 'Inter Fallback'",
                    }}
                  >
                    Jika Anda memiliki pertanyaan tentang kebijakan privasi ini, silakan hubungi kami melalui:
                  </p>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#000000",
                      marginTop: "4px",
                      fontWeight: 500,
                      fontFamily: "Inter, 'Inter Fallback'",
                    }}
                  >
                    support@menuru.com
                  </p>
                </div>

                {/* Footer */}
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
                      fontFamily: "Inter, 'Inter Fallback'",
                    }}
                  >
                    Chat with Menuru v1.0
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#999",
                      fontFamily: "Inter, 'Inter Fallback'",
                    }}
                  >
                    © 2026 Menuru
                  </span>
                </div>
              </div>
            ) : showProfile && profileUser ? (
              // Profile View
              <div style={{ padding: "24px 28px", overflowY: "auto", flex: 1, maxHeight: "640px" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", width: "100%" }}>
                  <button
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
                      fontFamily: "Inter, 'Inter Fallback'",
                      marginBottom: "16px",
                      padding: "4px 0",
                      transition: "color 0.2s ease",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "#000"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "#666"}
                  >
                    <BackIcon />
                    <span>Kembali</span>
                  </button>

                  <div style={{ width: "100%", marginBottom: "0px" }}>
                    <div style={{ 
                      backgroundColor: "#f5f5f5", 
                      borderRadius: "8px",
                      padding: "8px 14px",
                      position: "relative",
                      marginBottom: "8px",
                      maxWidth: "280px",
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
                        }}>
                          <span style={{ 
                            display: "inline-block",
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            backgroundColor: "#c5e800",
                            marginRight: "4px",
                          }} />
                          Catatan
                        </span>
                        {profileUser.id === user?.uid && (
                          <button
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
                              fontFamily: "Inter, 'Inter Fallback'",
                            }}
                          >
                            <EditIcon />
                            {profileUser.note ? "Edit" : "Tambah"}
                          </button>
                        )}
                      </div>

                      {editNote && profileUser.id === user?.uid ? (
                        <div style={{ display: "flex", gap: "6px", alignItems: "center", marginTop: "4px" }}>
                          <input
                            type="text"
                            value={noteInput}
                            onChange={(e) => setNoteInput(e.target.value)}
                            placeholder="Tulis catatan..."
                            style={{
                              flex: 1,
                              padding: "6px 10px",
                              backgroundColor: "#fff",
                              border: "1px solid #e0e0e0",
                              borderRadius: "4px",
                              color: "#000",
                              fontSize: "12px",
                              outline: "none",
                              fontFamily: "Inter, 'Inter Fallback'",
                            }}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleSaveNote();
                              }
                            }}
                          />
                          <button
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
                              fontFamily: "Inter, 'Inter Fallback'",
                              whiteSpace: "nowrap",
                            }}
                          >
                            Simpan
                          </button>
                          <button
                            onClick={() => setEditNote(false)}
                            style={{
                              padding: "4px 10px",
                              backgroundColor: "transparent",
                              border: "1px solid #e0e0e0",
                              borderRadius: "4px",
                              color: "#666",
                              fontSize: "11px",
                              cursor: "pointer",
                              fontFamily: "Inter, 'Inter Fallback'",
                            }}
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <div style={{ 
                          padding: "4px 0",
                          color: profileUser.note ? "#000" : "#999",
                          fontSize: "13px",
                          lineHeight: 1.4,
                          minHeight: "24px",
                        }}>
                          {profileUser.note || "Belum ada catatan"}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px", width: "100%" }}>
                    <div
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
                        <span style={{ color: "#000" }}>{profileUser.name?.charAt(0)?.toUpperCase() || "👤"}</span>
                      )}
                      {profileUser.isOfficial && (
                        <div style={{ position: "absolute", bottom: -2, right: -2 }}>
                          <InstagramVerifiedBadge size={16} />
                        </div>
                      )}
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <span style={{ fontSize: "18px", fontWeight: 500, color: "#000" }}>
                          {profileUser.name}
                        </span>
                        {profileUser.isOfficial && <InstagramVerifiedBadge size={16} />}
                      </div>
                      <span style={{ fontSize: "13px", color: "#999" }}>{profileUser.email}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                        <OnlineIndicator online={getOnlineStatus(profileUser.id)} />
                        <span style={{ fontSize: "12px", color: "#666" }}>
                          {getOnlineStatus(profileUser.id) ? "Online" : getLastSeen(profileUser.id)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ width: "100%", marginBottom: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <span style={{ fontSize: "10px", color: "#999", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                        Bio
                      </span>
                      {profileUser.id === user?.uid && (
                        <button
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
                            fontFamily: "Inter, 'Inter Fallback'",
                          }}
                        >
                          <EditIcon />
                          {profileUser.bio ? "Edit" : "Tambah"}
                        </button>
                      )}
                    </div>
                    {editBio && profileUser.id === user?.uid ? (
                      <div>
                        <textarea
                          value={bioInput}
                          onChange={(e) => setBioInput(e.target.value)}
                          placeholder="Tulis bio..."
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
                            fontFamily: "Inter, 'Inter Fallback'",
                            resize: "vertical",
                          }}
                        />
                        <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
                          <button
                            onClick={handleSaveBio}
                            style={{
                              padding: "4px 14px",
                              backgroundColor: "#000",
                              border: "none",
                              borderRadius: "4px",
                              color: "#fff",
                              fontSize: "12px",
                              cursor: "pointer",
                              fontFamily: "Inter, 'Inter Fallback'",
                            }}
                          >
                            Simpan
                          </button>
                          <button
                            onClick={() => setEditBio(false)}
                            style={{
                              padding: "4px 14px",
                              backgroundColor: "transparent",
                              border: "1px solid #e0e0e0",
                              borderRadius: "4px",
                              color: "#999",
                              fontSize: "12px",
                              cursor: "pointer",
                              fontFamily: "Inter, 'Inter Fallback'",
                            }}
                          >
                            Batal
                          </button>
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
                      }}>
                        {profileUser.bio || "Belum ada bio"}
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: "8px", width: "100%" }}>
                    <button
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
                        fontFamily: "Inter, 'Inter Fallback'",
                        transition: "opacity 0.2s ease",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                    >
                      Kirim Pesan
                    </button>
                    <button
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
                        fontFamily: "Inter, 'Inter Fallback'",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <PinIcon filled={profileUser.isPinned || false} />
                    </button>
                  </div>
                </div>
              </div>
            ) : !selectedChat ? (
              // Chat List View
              <div style={{ padding: "8px 12px", overflowY: "auto", flex: 1, maxHeight: "640px" }}>
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
                  }}
                >
                  <div style={{ fontSize: "20px" }}>📢</div>
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 500, color: "#000" }}>
                      Pengumuman
                    </div>
                    <div style={{ fontSize: "11px", color: "#666" }}>
                      Fitur chat sedang dalam tahap pengembangan.
                    </div>
                  </div>
                </div>

                {/* Chat Baru Button dengan GSAP Animation */}
                <button
                  ref={addUserButtonRef}
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
                    fontFamily: "Inter, 'Inter Fallback'",
                  }}
                >
                  <span
                    ref={plusIconRef}
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
                    }}
                  >
                    Chat Baru
                  </span>
                </button>
                
                {showAddUser && (
                  <div
                    style={{
                      padding: "16px",
                      backgroundColor: "#f8f8f8",
                      borderRadius: "12px",
                      marginBottom: "12px",
                      animation: "slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    }}
                  >
                    <div style={{ fontSize: "13px", fontWeight: 500, color: "#000", marginBottom: "12px", fontFamily: "Inter, 'Inter Fallback'" }}>
                      Pilih User untuk Chat
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
                        fontFamily: "Inter, 'Inter Fallback'",
                        marginBottom: "8px",
                        backgroundColor: "#fff",
                        color: "#000",
                      }}
                    >
                      <option value="">Pilih user...</option>
                      {availableUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} {u.isOfficial && <InstagramVerifiedBadge size={12} />}
                        </option>
                      ))}
                    </select>
                    {availableUsers.length === 0 && (
                      <div style={{ fontSize: "11px", color: "#666", marginBottom: "8px" }}>
                        Semua user sudah di-chat
                      </div>
                    )}
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
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
                          fontFamily: "Inter, 'Inter Fallback'",
                        }}
                      >
                        Mulai Chat
                      </button>
                      <button
                        onClick={() => setShowAddUser(false)}
                        style={{
                          background: "none",
                          border: "none",
                          fontSize: "12px",
                          color: "#666",
                          cursor: "pointer",
                          fontFamily: "Inter, 'Inter Fallback'",
                        }}
                      >
                        Batal
                      </button>
                    </div>
                    {addUserStatus && (
                      <div style={{ fontSize: "11px", color: "#000", marginTop: "8px" }}>
                        {addUserStatus}
                      </div>
                    )}
                  </div>
                )}

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
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <PinIcon filled={true} />
                        <span style={{ fontSize: "11px", fontWeight: 500, color: "#666" }}>
                          User Pinned ({pinnedUsers.length})
                        </span>
                      </div>
                      <PinDropdownIcon isOpen={showPinnedUsers} />
                    </div>
                    {showPinnedUsers && (
                      <div style={{ padding: "4px 0", marginTop: "2px" }}>
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
                                <span style={{ color: "#000" }}>{u.name?.charAt(0)?.toUpperCase() || "👤"}</span>
                              )}
                            </div>
                            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "6px" }}>
                              <div>
                                <div 
                                  style={{ fontSize: "12px", fontWeight: 500, color: "#000", cursor: "pointer" }}
                                  onClick={() => handleOpenProfile(u)}
                                >
                                  {u.name}
                                  {u.isOfficial && <InstagramVerifiedBadge size={12} />}
                                </div>
                                <div style={{ fontSize: "9px", color: "#999" }}>
                                  {u.email}
                                </div>
                              </div>
                              <OnlineIndicator online={u.online || false} lastSeen={getLastSeen(u.id)} />
                            </div>
                            <button
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
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
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
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <PinIcon filled={true} />
                        <span style={{ fontSize: "11px", fontWeight: 500, color: "#666" }}>
                          Chat Pinned ({pinnedChats.length})
                        </span>
                      </div>
                      <PinDropdownIcon isOpen={showPinnedChats} />
                    </div>
                    {showPinnedChats && (
                      <div style={{ padding: "4px 0", marginTop: "2px" }}>
                        {pinnedChats.map((room) => {
                          const otherId = room.participants.find(id => id !== user.uid);
                          const otherUser = users.find(u => u.id === otherId);
                          if (!otherUser) return null;
                          return (
                            <div
                              key={room.id}
                              onClick={() => setSelectedChat(otherUser)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "6px 10px",
                                borderRadius: "6px",
                                cursor: "pointer",
                                backgroundColor: "#fafafa",
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
                                  <span style={{ color: "#000" }}>{otherUser.name?.charAt(0)?.toUpperCase() || "👤"}</span>
                                )}
                              </div>
                              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "6px" }}>
                                <div>
                                  <div 
                                    style={{ fontSize: "12px", fontWeight: 500, color: "#000", cursor: "pointer" }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenProfile(otherUser);
                                    }}
                                  >
                                    {otherUser.name}
                                    {otherUser.isOfficial && <InstagramVerifiedBadge size={12} />}
                                  </div>
                                  <div style={{ fontSize: "9px", color: "#999" }}>
                                    {room.lastMessage ? room.lastMessage.substring(0, 25) + (room.lastMessage.length > 25 ? "..." : "") : "Belum ada pesan"}
                                  </div>
                                </div>
                                <OnlineIndicator online={otherUser.online || false} lastSeen={getLastSeen(otherUser.id)} />
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
                                  }}
                                >
                                  {room.unreadCount}
                                </div>
                              )}
                              <button
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
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
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
                      }}
                    >
                      <div style={{ fontSize: "28px", marginBottom: "6px" }}>💬</div>
                      <div>Belum ada riwayat chat</div>
                    </div>
                  ) : (
                    unpinnedChats.map((room) => {
                      const otherId = room.participants.find(id => id !== user.uid);
                      const otherUser = users.find(u => u.id === otherId);
                      if (!otherUser) return null;
                      
                      const isLastMessageFromMe = room.lastMessageSenderId === user.uid;
                      
                      return (
                        <div
                          key={room.id}
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
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = room.unreadCount > 0 ? "rgba(197,232,0,0.12)" : "#f5f5f5";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = room.unreadCount > 0 ? "rgba(197,232,0,0.06)" : "transparent";
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
                              <span style={{ color: "#000" }}>{otherUser.name?.charAt(0)?.toUpperCase() || "👤"}</span>
                            )}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "14px", fontWeight: 500, color: "#000", display: "flex", alignItems: "center", gap: "4px" }}>
                              <span 
                                style={{ cursor: "pointer" }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenProfile(otherUser);
                                }}
                              >
                                {otherUser.name}
                              </span>
                              {otherUser.isOfficial && <InstagramVerifiedBadge size={12} />}
                              <OnlineIndicator online={otherUser.online || false} lastSeen={getLastSeen(otherUser.id)} />
                            </div>
                            <div style={{ fontSize: "11px", color: "#999", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {room.lastMessage ? (
                                <>
                                  {isLastMessageFromMe && "Anda: "}
                                  {room.lastMessage}
                                </>
                              ) : (
                                "Belum ada pesan"
                              )}
                            </div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
                            {room.lastMessageTime && (
                              <span style={{ fontSize: "9px", color: "#bbb" }}>
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
                                  }}
                                >
                                  {room.unreadCount}
                                </div>
                              )}
                              <button
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
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              // Chat View
              <div style={{ display: "flex", flexDirection: "column", height: "580px" }}>
                {/* Chat Header - Hitam dengan teks cerah */}
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
                  <button
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
                  </button>
                  <div
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
                      <span>{selectedChat.name?.charAt(0)?.toUpperCase() || "👤"}</span>
                    )}
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1px" }}>
                    <div 
                      style={{ display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}
                      onClick={() => handleOpenProfile(selectedChat)}
                    >
                      <span style={{ fontSize: "14px", fontWeight: 500, color: "#ffffff" }}>
                        {selectedChat.name}
                      </span>
                      {selectedChat.isOfficial && <InstagramVerifiedBadge size={12} />}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <OnlineIndicator 
                        online={getOnlineStatus(selectedChat.id)} 
                        lastSeen={getLastSeen(selectedChat.id)}
                      />
                      {getOnlineStatus(selectedChat.id) ? (
                        <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.5)" }}>
                          {getTypingStatus(selectedChat.id) ? "sedang mengetik..." : "Online"}
                        </span>
                      ) : (
                        <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.5)" }}>
                          {getLastSeen(selectedChat.id)}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
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
                  </button>
                </div>

                {/* Riwayat Pin Message */}
                {pinnedMessages.length > 0 && (
                  <div
                    style={{
                      padding: "6px 14px",
                      backgroundColor: "rgba(0,0,0,0.02)",
                      borderBottom: "1px solid rgba(0,0,0,0.04)",
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
                        <span style={{ fontSize: "11px", fontWeight: 500, color: "#666" }}>
                          Pesan Pinned ({pinnedMessages.length})
                        </span>
                      </div>
                      <PinDropdownIcon isOpen={showPinnedMessages} />
                    </div>
                    {showPinnedMessages && (
                      <div style={{ marginTop: "6px", maxHeight: "120px", overflowY: "auto" }}>
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
                              }}
                            >
                              <div style={{ flex: 1 }}>
                                <span style={{ color: "#999", fontSize: "9px" }}>
                                  {isMine ? "Anda: " : `${msg.senderName}: `}
                                </span>
                                <span style={{ color: "#000" }}>
                                  {msg.text.length > 40 ? msg.text.substring(0, 40) + "..." : msg.text}
                                </span>
                              </div>
                              <span style={{ fontSize: "8px", color: "#bbb", marginLeft: "6px" }}>
                                {formatTime(msg.pinnedAt || msg.timestamp)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Reply Indicator - Tanpa border dan background */}
                {replyTo && (
                  <div
                    style={{
                      padding: "4px 14px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <ReplyIcon />
                      <div>
                        <div style={{ fontSize: "10px", color: "#22c55e", fontWeight: 500 }}>
                          Balas: {replyTo.senderName === user?.displayName ? "Anda" : replyTo.senderName}
                        </div>
                        <div style={{ fontSize: "11px", color: "#666" }}>
                          {replyTo.text.length > 30 ? replyTo.text.substring(0, 30) + "..." : replyTo.text}
                        </div>
                      </div>
                    </div>
                    <button
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
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.04)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      ✕
                    </button>
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
                  }}
                >
                  {messages.length === 0 ? (
                    <div
                      style={{
                        textAlign: "center",
                        color: "#bbb",
                        fontSize: "13px",
                        marginTop: "60px",
                      }}
                    >
                      <div style={{ fontSize: "28px", marginBottom: "6px" }}>💬</div>
                      <div>Belum ada pesan</div>
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
                              }}
                            >
                              {formatDate(msg.timestamp)}
                            </div>
                          )}
                          <div
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
                            }}
                          >
                            {msg.isShared && msg.sharedFromName && (
                              <div
                                style={{
                                  fontSize: "10px",
                                  color: "rgba(0,0,0,0.4)",
                                  marginBottom: "4px",
                                  fontStyle: "italic",
                                }}
                              >
                                Diteruskan dari {msg.sharedFromName}
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
                                }}
                              >
                                <span style={{ fontWeight: 500, color: "#22c55e" }}>
                                  {isMine ? `Balas: ${replySenderName}` : `Balas: ${msg.replyToSender}`}
                                </span>
                                <span style={{ color: isMine ? "#000" : "#333" }}> {msg.replyToText}</span>
                              </div>
                            )}
                            
                            {isBroadcastMessage ? (
                              <span>
                                Jangan lupa baca{' '}
                                <span
                                  onClick={() => setShowPrivacyPolicy(true)}
                                  style={{
                                    color: "#0095f6",
                                    textDecoration: "underline",
                                    cursor: "pointer",
                                    fontWeight: 500,
                                  }}
                                >
                                  Privacy Policy
                                </span>
                                {' dan '}
                                <span
                                  onClick={() => setShowUpdate(true)}
                                  style={{
                                    color: "#0095f6",
                                    textDecoration: "underline",
                                    cursor: "pointer",
                                    fontWeight: 500,
                                  }}
                                >
                                  Update
                                </span>
                                {' '}kami 👇
                              </span>
                            ) : (
                              <span>{msg.text}</span>
                            )}
                            
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                                marginTop: "6px",
                                justifyContent: isMine ? "flex-end" : "flex-start",
                                flexWrap: "wrap",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "9px",
                                  color: "rgba(0,0,0,0.4)",
                                  fontWeight: 400,
                                }}
                              >
                                {formatTime(msg.timestamp)}
                              </span>
                              <ReadStatus msg={msg} isMine={isMine} />
                              <button
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
                                title="More"
                              >
                                <MoreIcon />
                              </button>
                              
                              {showMessageMenu === msg.id && (
                                <div
                                  ref={menuRef}
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
                                  }}
                                >
                                  <button
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
                                      fontFamily: "Inter, 'Inter Fallback'",
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = "#f5f5f5";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = "transparent";
                                    }}
                                  >
                                    <ReplyIcon />
                                    <span>Balas</span>
                                  </button>
                                  <button
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
                                      fontFamily: "Inter, 'Inter Fallback'",
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = "#f5f5f5";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = "transparent";
                                    }}
                                  >
                                    <SendIcon />
                                    <span>Kirim Ulang</span>
                                  </button>
                                  <button
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
                                      fontFamily: "Inter, 'Inter Fallback'",
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = "#f5f5f5";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = "transparent";
                                    }}
                                  >
                                    <ShareIcon />
                                    <span>Teruskan</span>
                                  </button>
                                  <button
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
                                      fontFamily: "Inter, 'Inter Fallback'",
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = "#f5f5f5";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = "transparent";
                                    }}
                                  >
                                    <PinIcon filled={msg.isPinned || false} />
                                    <span>{msg.isPinned ? "Unpin" : "Pin"}</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
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
                              }}
                            >
                              <PinIcon filled={true} />
                              <span>Pinned • {formatTime(msg.pinnedAt || msg.timestamp)}</span>
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
                  }}
                >
                  <input
                    type="text"
                    placeholder={replyTo ? "Ketik balasan..." : "Ketik pesan..."}
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
                      fontFamily: "Inter, 'Inter Fallback'",
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
                  <button
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
                      fontFamily: "Inter, 'Inter Fallback'",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#b0d000";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#c5e800";
                    }}
                  >
                    <span>Kirim</span>
                    <SendIcon />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Chat Button */}
        <button
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
            fontFamily: "Inter, 'Inter Fallback'",
            position: "relative",
            maxWidth: "360px",
            overflow: "hidden",
          }}
          onMouseEnter={(e) => {
            if (!isChatOpen) {
              e.currentTarget.style.transform = "scale(1.03)";
              e.currentTarget.style.boxShadow = "0 6px 28px rgba(0,0,0,0.12)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isChatOpen) {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)";
            }
          }}
        >
          {!isChatOpen && (
            <>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#ffffff",
                  letterSpacing: "-0.01em",
                  lineHeight: 1,
                  whiteSpace: "nowrap",
                  transition: "all 0.5s ease",
                  animation: isIncomingMessage ? "fadeInOut 0.5s ease" : "none",
                }}
              >
                {user ? chatButtonText : "Login to Chat"}
              </span>
              {totalUnread > 0 && (
                <span
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
                  }}
                >
                  {totalUnread}
                </span>
              )}
            </>
          )}
        </button>
      </div>

      <style jsx>{`
        @keyframes marqueeMundur {
          0% {
            transform: translateX(0%);
          }
          50% {
            transform: translateX(-30%);
          }
          100% {
            transform: translateX(0%);
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
        }
        @keyframes pulseTransmitter {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.4), 0 0 40px rgba(59, 130, 246, 0.2);
          }
          50% {
            transform: scale(1.2);
            box-shadow: 0 0 40px rgba(59, 130, 246, 0.8), 0 0 80px rgba(59, 130, 246, 0.4);
          }
        }
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        @keyframes fadeInOut {
          0% {
            opacity: 0.7;
            transform: scale(0.98);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
