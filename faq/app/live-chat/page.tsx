'use client';

import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, collection, query, where, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, orderBy, getDoc, setDoc, arrayUnion, arrayRemove, increment } from "firebase/firestore";
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

const UserAddIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 21V19C16 16.7909 14.2091 15 12 15H5C2.79086 15 1 16.7909 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20 8V14M23 11H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const GroupIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M23 21V19C22.735 17.3766 21.884 15.9009 20.629 14.966" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 3C17.262 3.151 18.401 3.971 19 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const InfoIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="12" y1="16" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="12" y1="8" x2="12.01" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
interface ChatUser {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  online: boolean;
  lastSeen?: any;
  bio?: string;
  joinedAt?: any;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  text: string;
  timestamp: any;
  read: boolean;
  readBy?: string[];
  type?: 'broadcast' | 'announcement' | 'group';
}

interface ChatRoom {
  id: string;
  type: 'individual' | 'group' | 'broadcast' | 'announcement';
  name: string;
  photo?: string;
  participants: string[];
  admins?: string[];
  createdAt: any;
  lastMessage?: string;
  lastMessageTime?: any;
  unreadCount: number;
  typing: boolean;
  typingUsers?: string[];
  bio?: string;
}

// ===== LIVE CHAT COMPONENT =====
const LiveChat = ({ user, isAdmin, db, auth }: { user: any; isAdmin: boolean; db: any; auth: any }) => {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [showStartChat, setShowStartChat] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [agentOnline, setAgentOnline] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [profileUser, setProfileUser] = useState<ChatUser | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastText, setBroadcastText] = useState("");
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [announcementText, setAnnouncementText] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Hari ini';
    if (days === 1) return 'Kemarin';
    if (days < 7) return `${days} hari lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
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

  // Load all users
  useEffect(() => {
    if (!db || !isMounted) return;
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const userList: ChatUser[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        userList.push({
          id: doc.id,
          name: data.displayName || data.email || "User",
          email: data.email || "",
          photoURL: data.photoURL || "",
          online: data.online || false,
          lastSeen: data.lastSeen || null,
          bio: data.bio || "",
          joinedAt: data.joinedAt || null,
        });
      });
      setUsers(userList);
    });
    return () => unsubscribe();
  }, [db, isMounted]);

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

  // Load chat rooms
  useEffect(() => {
    if (!db || !user || !isMounted) return;
    
    const q = query(
      collection(db, "chat_rooms"),
      where("participants", "array-contains", user.uid),
      orderBy("lastMessageTime", "desc")
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const roomList: ChatRoom[] = [];
      snapshot.forEach((doc) => {
        roomList.push({ id: doc.id, ...doc.data() } as ChatRoom);
      });
      setRooms(roomList);
    });
    return () => unsubscribe();
  }, [db, user, isMounted]);

  // Load messages for selected room
  useEffect(() => {
    if (!db || !selectedRoom || !isMounted) return;
    
    const q = query(
      collection(db, "chat_rooms", selectedRoom.id, "messages"),
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
  }, [db, selectedRoom, isMounted]);

  // Mark messages as read
  useEffect(() => {
    if (!db || !selectedRoom || !user || !isMounted) return;
    const unread = messages.filter(m => m.senderId !== user.uid && !m.read);
    if (unread.length === 0) return;
    
    unread.forEach(async (msg) => {
      const msgRef = doc(db, "chat_rooms", selectedRoom.id, "messages", msg.id);
      await updateDoc(msgRef, { 
        read: true,
        readBy: arrayUnion(user.uid)
      });
    });
  }, [messages, selectedRoom, db, user, isMounted]);

  // Auto-select first room
  useEffect(() => {
    if (!user || !isMounted || rooms.length === 0) return;
    if (!selectedRoom) {
      setSelectedRoom(rooms[0]);
    }
  }, [rooms, user, selectedRoom, isMounted]);

  const handleTyping = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessageText(value);
    if (!selectedRoom || !user || !db) return;
    const roomRef = doc(db, "chat_rooms", selectedRoom.id);
    if (value.length > 0) {
      await updateDoc(roomRef, {
        typing: true,
        typingUsers: arrayUnion(user.uid)
      });
    } else {
      await updateDoc(roomRef, {
        typing: false,
        typingUsers: arrayRemove(user.uid)
      });
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(async () => {
      await updateDoc(roomRef, {
        typing: false,
        typingUsers: arrayRemove(user.uid)
      });
    }, 2000);
  };

  const sendMessage = async () => {
    if (!db || !selectedRoom || !messageText.trim() || !user) return;
    
    try {
      const roomRef = doc(db, "chat_rooms", selectedRoom.id);
      await updateDoc(roomRef, {
        typing: false,
        typingUsers: arrayRemove(user.uid)
      });
      
      const senderName = user.displayName || user.email || "User";
      const senderPhoto = user.photoURL || "";
      
      await addDoc(collection(db, "chat_rooms", selectedRoom.id, "messages"), {
        senderId: user.uid,
        senderName: senderName,
        senderPhoto: senderPhoto,
        text: messageText.trim(),
        timestamp: serverTimestamp(),
        read: false,
        readBy: [user.uid],
      });
      
      await updateDoc(roomRef, {
        lastMessage: messageText.trim(),
        lastMessageTime: serverTimestamp(),
        unreadCount: increment(1),
      });
      
      setMessageText("");
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const createIndividualChat = async (targetUserId: string) => {
    if (!db || !user) return;
    try {
      const roomData = {
        type: 'individual',
        name: users.find(u => u.id === targetUserId)?.name || "User",
        participants: [user.uid, targetUserId],
        createdAt: serverTimestamp(),
        lastMessageTime: serverTimestamp(),
        unreadCount: 0,
        typing: false,
        typingUsers: [],
      };
      const docRef = await addDoc(collection(db, "chat_rooms"), roomData);
      const newRoom = { id: docRef.id, ...roomData } as ChatRoom;
      setSelectedRoom(newRoom);
      setShowStartChat(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  const createGroupChat = async () => {
    if (!db || !user || !groupName.trim() || selectedUsers.length === 0) return;
    try {
      const roomData = {
        type: 'group',
        name: groupName.trim(),
        participants: [user.uid, ...selectedUsers],
        admins: [user.uid],
        createdAt: serverTimestamp(),
        lastMessageTime: serverTimestamp(),
        unreadCount: 0,
        typing: false,
        typingUsers: [],
        bio: "",
      };
      const docRef = await addDoc(collection(db, "chat_rooms"), roomData);
      const newRoom = { id: docRef.id, ...roomData } as ChatRoom;
      setSelectedRoom(newRoom);
      setShowCreateGroup(false);
      setGroupName("");
      setSelectedUsers([]);
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  const sendBroadcast = async () => {
    if (!db || !user || !broadcastText.trim()) return;
    try {
      const roomData = {
        type: 'broadcast',
        name: '📢 Broadcast',
        participants: users.filter(u => u.id !== user.uid).map(u => u.id),
        createdAt: serverTimestamp(),
        lastMessageTime: serverTimestamp(),
        unreadCount: 0,
        typing: false,
        typingUsers: [],
      };
      const docRef = await addDoc(collection(db, "chat_rooms"), roomData);
      
      await addDoc(collection(db, "chat_rooms", docRef.id, "messages"), {
        senderId: user.uid,
        senderName: "📢 Broadcast",
        senderPhoto: "/images/ai.jpg",
        text: `📢 ${broadcastText.trim()}`,
        timestamp: serverTimestamp(),
        read: false,
        readBy: [user.uid],
        type: 'broadcast',
      });
      
      setBroadcastText("");
      setShowBroadcastModal(false);
    } catch (error) {
      console.error("Error sending broadcast:", error);
    }
  };

  const sendAnnouncement = async () => {
    if (!db || !user || !announcementText.trim()) return;
    try {
      const roomData = {
        type: 'announcement',
        name: '📢 Pengumuman',
        participants: users.filter(u => u.id !== user.uid).map(u => u.id),
        createdAt: serverTimestamp(),
        lastMessageTime: serverTimestamp(),
        unreadCount: 0,
        typing: false,
        typingUsers: [],
      };
      const docRef = await addDoc(collection(db, "chat_rooms"), roomData);
      
      await addDoc(collection(db, "chat_rooms", docRef.id, "messages"), {
        senderId: user.uid,
        senderName: "📢 Pengumuman",
        senderPhoto: "/images/ai.jpg",
        text: `📢 ${announcementText.trim()}`,
        timestamp: serverTimestamp(),
        read: false,
        readBy: [user.uid],
        type: 'announcement',
      });
      
      setAnnouncementText("");
      setShowAnnouncementModal(false);
    } catch (error) {
      console.error("Error sending announcement:", error);
    }
  };

  const getTypingUsers = (room: ChatRoom | null) => {
    if (!room || !room.typingUsers || room.typingUsers.length === 0) return null;
    const typingNames = room.typingUsers
      .filter(id => id !== user?.uid)
      .map(id => users.find(u => u.id === id)?.name || "Seseorang");
    if (typingNames.length === 0) return null;
    if (typingNames.length === 1) return `${typingNames[0]} sedang mengetik...`;
    if (typingNames.length === 2) return `${typingNames[0]} dan ${typingNames[1]} sedang mengetik...`;
    return `${typingNames.length} orang sedang mengetik...`;
  };

  const handleLogout = async () => {
    if (!auth) return;
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        online: false,
        lastSeen: serverTimestamp(),
      });
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const filteredRooms = rooms.filter(room => {
    if (!searchQuery || !searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    const name = (room.name || '').toLowerCase();
    return name.includes(query);
  });

  const isMessageRead = (msg: ChatMessage) => {
    if (msg.senderId === user?.uid) return true;
    return msg.read || false;
  };

  const getRoomPhoto = (room: ChatRoom) => {
    if (room.type === 'broadcast' || room.type === 'announcement') {
      return "/images/ai.jpg";
    }
    if (room.type === 'individual') {
      const otherId = room.participants.find(id => id !== user?.uid);
      const otherUser = users.find(u => u.id === otherId);
      return getUserPhoto(otherUser?.email, otherUser?.photoURL);
    }
    return room.photo || "/images/ai.jpg";
  };

  const getRoomName = (room: ChatRoom) => {
    if (room.type === 'broadcast') return '📢 Broadcast';
    if (room.type === 'announcement') return '📢 Pengumuman';
    if (room.type === 'individual') {
      const otherId = room.participants.find(id => id !== user?.uid);
      const otherUser = users.find(u => u.id === otherId);
      return otherUser?.name || "User";
    }
    return room.name;
  };

  const getRoomStatus = (room: ChatRoom) => {
    if (room.type === 'broadcast') return 'Broadcast';
    if (room.type === 'announcement') return 'Pengumuman';
    if (room.type === 'group') {
      const activeMembers = room.participants.filter(id => {
        const u = users.find(user => user.id === id);
        return u?.online;
      });
      return `${activeMembers.length} aktif dari ${room.participants.length} anggota`;
    }
    const otherId = room.participants.find(id => id !== user?.uid);
    const otherUser = users.find(u => u.id === otherId);
    return otherUser?.online ? 'Online' : 'Offline';
  };

  const getRoomMemberCount = (room: ChatRoom) => {
    if (room.type !== 'group') return 0;
    return room.participants.length;
  };

  const getActiveMembers = (room: ChatRoom) => {
    if (room.type !== 'group') return [];
    return room.participants.filter(id => {
      const u = users.find(user => user.id === id);
      return u?.online;
    });
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
          Live Chat
        </h2>
        <p style={{ 
          fontSize: "16px", 
          color: "#666", 
          fontFamily: FONT_FAMILY,
          marginBottom: "20px",
        }}>
          Silakan login untuk menggunakan Live Chat
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

  // MAIN CHAT VIEW
  return (
    <div style={{ 
      maxWidth: "100%", 
      margin: "0 auto", 
      height: "calc(100vh - 200px)",
      minHeight: "600px",
      backgroundColor: "#ffffff",
      borderRadius: "0",
      overflow: "hidden",
      display: "flex",
      border: "none",
    }}>
      {/* Sidebar */}
      <div style={{
        width: "380px",
        backgroundColor: "#0D3CFC",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        height: "100%",
      }}>
        {/* Header Sidebar */}
        <div style={{
          padding: "20px 24px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img
              src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email || "User")}&background=ffffff&color=0D3CFC&size=128`}
              alt={user.displayName || "User"}
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid rgba(255,255,255,0.2)",
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ 
                fontWeight: 600, 
                fontSize: "16px", 
                color: "#ffffff", 
                fontFamily: FONT_FAMILY,
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}>
                Hi, {user.displayName || user.email || "User"} 👋
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <PulsingDots active={agentOnline} />
                <span style={{ fontSize: "11px", color: agentOnline ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.4)", fontFamily: FONT_FAMILY }}>
                  {agentOnline ? "Agent Online" : "Offline"}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "6px 14px",
                backgroundColor: "transparent",
                color: "rgba(255,255,255,0.7)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "6px",
                fontSize: "12px",
                cursor: "pointer",
                fontFamily: FONT_FAMILY,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
            >
              <LogoutIcon size={14} />
              <span>Logout</span>
            </button>
          </div>
        </div>
        
        {/* Search */}
        <div style={{
          padding: "12px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            backgroundColor: "rgba(255,255,255,0.10)",
            borderRadius: "10px",
            padding: "8px 14px",
          }}>
            <SearchIcon size={16} color="rgba(255,255,255,0.5)" />
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
                color: "#ffffff",
                fontSize: "13px",
                fontFamily: FONT_FAMILY,
                placeholderColor: "rgba(255,255,255,0.4)",
              }}
            />
          </div>
        </div>
        
        {/* Action Buttons */}
        <div style={{
          padding: "10px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          flexShrink: 0,
        }}>
          <button
            onClick={() => setShowStartChat(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              backgroundColor: "rgba(255,255,255,0.10)",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              fontSize: "12px",
              cursor: "pointer",
              fontFamily: FONT_FAMILY,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.20)"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.10)"}
          >
            <UserAddIcon size={14} />
            <span>Chat Baru</span>
          </button>
          <button
            onClick={() => setShowCreateGroup(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              backgroundColor: "rgba(255,255,255,0.10)",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              fontSize: "12px",
              cursor: "pointer",
              fontFamily: FONT_FAMILY,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.20)"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.10)"}
          >
            <GroupIcon size={14} />
            <span>Grup</span>
          </button>
          <button
            onClick={() => setShowBroadcastModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              backgroundColor: "rgba(255,255,255,0.10)",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              fontSize: "12px",
              cursor: "pointer",
              fontFamily: FONT_FAMILY,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.20)"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.10)"}
          >
            📢 Broadcast
          </button>
          <button
            onClick={() => setShowAnnouncementModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              backgroundColor: "rgba(255,255,255,0.10)",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              fontSize: "12px",
              cursor: "pointer",
              fontFamily: FONT_FAMILY,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.20)"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.10)"}
          >
            📢 Pengumuman
          </button>
        </div>
        
        {/* Chat List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "4px 0" }}>
          {filteredRooms.map((room) => {
            const isActive = selectedRoom?.id === room.id;
            const roomName = getRoomName(room);
            const roomPhoto = getRoomPhoto(room);
            const status = getRoomStatus(room);
            const isBroadcast = room.type === 'broadcast';
            const isAnnouncement = room.type === 'announcement';
            const isGroup = room.type === 'group';
            
            return (
              <div
                key={room.id}
                onClick={() => setSelectedRoom(room)}
                style={{
                  padding: "10px 20px",
                  cursor: "pointer",
                  backgroundColor: isActive ? "rgba(255,255,255,0.12)" : "transparent",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ position: "relative" }}>
                    <img
                      src={roomPhoto}
                      alt={roomName}
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: isBroadcast ? "2px solid #22c55e" : 
                                isAnnouncement ? "2px solid #f59e0b" : 
                                isGroup ? "2px solid rgba(255,255,255,0.3)" : "none",
                      }}
                    />
                    {room.type === 'individual' && (
                      <div style={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        backgroundColor: status === 'Online' ? "#22c55e" : "#999",
                        border: "2px solid #0D3CFC",
                      }} />
                    )}
                    {isGroup && (
                      <div style={{
                        position: "absolute",
                        bottom: -2,
                        right: -2,
                        backgroundColor: "#0D3CFC",
                        borderRadius: "50%",
                        padding: "2px",
                        fontSize: "10px",
                      }}>
                        👥
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      fontWeight: isActive ? 600 : 500, 
                      fontSize: "14px", 
                      color: "#ffffff", 
                      fontFamily: FONT_FAMILY,
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}>
                      {isBroadcast && "📢 "}
                      {isAnnouncement && "📢 "}
                      {roomName}
                    </div>
                    <div style={{ 
                      fontSize: "11px", 
                      color: "rgba(255,255,255,0.6)", 
                      fontFamily: FONT_FAMILY,
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}>
                      {isGroup && `👥 ${getRoomMemberCount(room)} anggota • `}
                      {status}
                    </div>
                    {room.lastMessage && (
                      <div style={{ 
                        fontSize: "11px", 
                        color: "rgba(255,255,255,0.4)", 
                        fontFamily: FONT_FAMILY,
                        marginTop: "2px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: "200px",
                      }}>
                        {room.lastMessage.substring(0, 30)}{room.lastMessage.length > 30 ? "..." : ""}
                      </div>
                    )}
                  </div>
                  {room.unreadCount > 0 && (
                    <div style={{
                      backgroundColor: "#ffffff",
                      color: "#0D3CFC",
                      fontSize: "10px",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "12px",
                      minWidth: "20px",
                      textAlign: "center",
                    }}>
                      {room.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {filteredRooms.length === 0 && (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: "13px", fontFamily: FONT_FAMILY }}>
              Tidak ada chat
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", backgroundColor: "#f0f2f5", height: "100%" }}>
        {selectedRoom ? (
          <>
            {/* Chat Header */}
            <div style={{
              padding: "14px 24px",
              backgroundColor: "#ffffff",
              borderBottom: "1px solid #e8e8e8",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexShrink: 0,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px", flex: 1 }}>
                <div 
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    if (selectedRoom.type === 'individual') {
                      const otherId = selectedRoom.participants.find(id => id !== user?.uid);
                      const otherUser = users.find(u => u.id === otherId);
                      if (otherUser) {
                        setProfileUser(otherUser);
                        setShowUserProfile(true);
                      }
                    }
                  }}
                >
                  <img
                    src={getRoomPhoto(selectedRoom)}
                    alt={getRoomName(selectedRoom)}
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: selectedRoom.type === 'broadcast' ? "2px solid #22c55e" : 
                              selectedRoom.type === 'announcement' ? "2px solid #f59e0b" : 
                              selectedRoom.type === 'group' ? "2px solid rgba(13,60,252,0.2)" : "none",
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontWeight: 600, 
                    fontSize: "15px", 
                    color: "#0D3CFC", 
                    fontFamily: FONT_FAMILY,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}>
                    {getRoomName(selectedRoom)}
                    {selectedRoom.type === 'broadcast' && <span style={{ fontSize: "10px", color: "#22c55e", fontWeight: 400 }}>Broadcast</span>}
                    {selectedRoom.type === 'announcement' && <span style={{ fontSize: "10px", color: "#f59e0b", fontWeight: 400 }}>Pengumuman</span>}
                    {selectedRoom.type === 'group' && <span style={{ fontSize: "10px", color: "#666", fontWeight: 400 }}>👥 {getRoomMemberCount(selectedRoom)} anggota</span>}
                  </div>
                  <div style={{ 
                    fontSize: "11px", 
                    color: "#666", 
                    fontFamily: FONT_FAMILY,
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}>
                    {selectedRoom.type === 'group' && (
                      <>
                        <span>{getActiveMembers(selectedRoom).length} aktif</span>
                        <span style={{ color: "#ddd" }}>•</span>
                      </>
                    )}
                    <span>{getRoomStatus(selectedRoom)}</span>
                  </div>
                </div>
                {selectedRoom.type === 'individual' && (
                  <button
                    onClick={() => {
                      const otherId = selectedRoom.participants.find(id => id !== user?.uid);
                      const otherUser = users.find(u => u.id === otherId);
                      if (otherUser) {
                        setProfileUser(otherUser);
                        setShowUserProfile(true);
                      }
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#0D3CFC",
                      cursor: "pointer",
                      padding: "4px",
                    }}
                  >
                    <InfoIcon size={20} />
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div 
              ref={chatContainerRef}
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "20px 24px",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              {messages.length === 0 ? (
                <div style={{ textAlign: "center", color: "#999", fontSize: "14px", padding: "60px 0", fontFamily: FONT_FAMILY }}>
                  Belum ada pesan. Mulai percakapan sekarang!
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMine = msg.senderId === user?.uid;
                  const isBroadcast = msg.type === 'broadcast';
                  const isAnnouncement = msg.type === 'announcement';
                  const isRead = isMessageRead(msg);
                  const isGroup = selectedRoom.type === 'group';
                  
                  if (isBroadcast || isAnnouncement) {
                    const label = isBroadcast ? "Broadcast" : "Pengumuman";
                    return (
                      <div
                        key={idx}
                        style={{
                          alignSelf: "center",
                          maxWidth: "85%",
                          padding: "10px 20px",
                          borderRadius: "12px",
                          backgroundColor: isBroadcast ? "rgba(34,197,94,0.10)" : "rgba(245,158,11,0.10)",
                          color: isBroadcast ? "#065f46" : "#92400e",
                          fontSize: "14px",
                          fontFamily: FONT_FAMILY,
                          textAlign: "center",
                          border: isBroadcast ? "1px solid rgba(34,197,94,0.2)" : "1px solid rgba(245,158,11,0.2)",
                        }}
                      >
                        <div style={{ fontSize: "11px", fontWeight: 600, marginBottom: "4px" }}>
                          📢 {label}
                        </div>
                        <div>{msg.text}</div>
                        <div style={{ fontSize: "10px", color: "#999", marginTop: "6px" }}>
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
                        gap: "8px",
                      }}
                    >
                      {!isMine && (
                        <img
                          src={msg.senderPhoto || getUserPhoto(undefined, undefined)}
                          alt={msg.senderName}
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            objectFit: "cover",
                            flexShrink: 0,
                          }}
                          onClick={() => {
                            const targetUser = users.find(u => u.name === msg.senderName || u.email === msg.senderName);
                            if (targetUser) {
                              setProfileUser(targetUser);
                              setShowUserProfile(true);
                            }
                          }}
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            objectFit: "cover",
                            flexShrink: 0,
                            cursor: "pointer",
                          }}
                        />
                      )}
                      <div
                        style={{
                          padding: "10px 16px",
                          borderRadius: "14px",
                          backgroundColor: isMine ? "#0D3CFC" : "#ffffff",
                          color: isMine ? "#ffffff" : "#000000",
                          fontSize: "14px",
                          fontFamily: FONT_FAMILY,
                          wordBreak: "break-word",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                          border: !isMine ? "1px solid #e8e8e8" : "none",
                          maxWidth: "100%",
                        }}
                      >
                        {!isMine && isGroup && (
                          <div style={{ 
                            fontSize: "11px", 
                            fontWeight: 500, 
                            color: "#0D3CFC", 
                            marginBottom: "4px", 
                            fontFamily: FONT_FAMILY,
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            const targetUser = users.find(u => u.name === msg.senderName || u.email === msg.senderName);
                            if (targetUser) {
                              setProfileUser(targetUser);
                              setShowUserProfile(true);
                            }
                          }}
                          >
                            {msg.senderName}
                            {msg.senderName === AGENT_NAME && <InstagramVerifiedBadge size={10} />}
                          </div>
                        )}
                        <div>{msg.text}</div>
                        <div style={{ 
                          fontSize: "10px", 
                          color: isMine ? "rgba(255,255,255,0.6)" : "#999", 
                          marginTop: "6px",
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
              {getTypingUsers(selectedRoom) && (
                <div style={{
                  alignSelf: "flex-start",
                  fontSize: "12px",
                  color: "#666",
                  fontStyle: "italic",
                  padding: "4px 12px",
                  fontFamily: FONT_FAMILY,
                }}>
                  {getTypingUsers(selectedRoom)}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{
              padding: "12px 24px",
              borderTop: "1px solid #e8e8e8",
              backgroundColor: "#ffffff",
              display: "flex",
              gap: "12px",
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
                  padding: "10px 18px",
                  border: "1px solid #e8e8e8",
                  borderRadius: "24px",
                  fontSize: "14px",
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
                  padding: "10px 20px",
                  backgroundColor: messageText.trim() ? "#0D3CFC" : "#ccc",
                  color: "#fff",
                  border: "none",
                  borderRadius: "24px",
                  cursor: messageText.trim() ? "pointer" : "not-allowed",
                  fontFamily: FONT_FAMILY,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "14px",
                  fontWeight: 500,
                  transition: "all 0.2s ease",
                }}
              >
                <SendIcon size={16} />
                <span>Kirim</span>
              </button>
            </div>
          </>
        ) : (
          <div style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            color: "#999",
            fontSize: "16px",
            fontFamily: FONT_FAMILY,
            gap: "12px",
          }}>
            <div style={{ fontSize: "60px" }}>💬</div>
            <div>Pilih chat atau mulai percakapan baru</div>
            <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
              <button
                onClick={() => setShowStartChat(true)}
                style={{
                  padding: "8px 20px",
                  backgroundColor: "#0D3CFC",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "13px",
                  cursor: "pointer",
                  fontFamily: FONT_FAMILY,
                }}
              >
                <UserAddIcon size={14} /> Chat Baru
              </button>
              <button
                onClick={() => setShowCreateGroup(true)}
                style={{
                  padding: "8px 20px",
                  backgroundColor: "transparent",
                  color: "#0D3CFC",
                  border: "1px solid #0D3CFC",
                  borderRadius: "8px",
                  fontSize: "13px",
                  cursor: "pointer",
                  fontFamily: FONT_FAMILY,
                }}
              >
                <GroupIcon size={14} /> Buat Grup
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Start Chat Modal */}
      {showStartChat && (
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
            padding: "32px",
            maxWidth: "460px",
            width: "90%",
            maxHeight: "80vh",
            overflowY: "auto",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: 600, color: "#0D3CFC", fontFamily: FONT_FAMILY, margin: 0 }}>
                <UserAddIcon size={20} /> Chat Baru
              </h3>
              <button
                onClick={() => setShowStartChat(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#999",
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ marginBottom: "8px" }}>
              <label style={{ fontSize: "13px", color: "#666", fontFamily: FONT_FAMILY, display: "block", marginBottom: "6px" }}>
                Pilih User
              </label>
              <div style={{
                maxHeight: "300px",
                overflowY: "auto",
                border: "1px solid #e8e8e8",
                borderRadius: "8px",
                padding: "8px",
              }}>
                {users.filter(u => u.id !== user.uid).map((u) => (
                  <div
                    key={u.id}
                    onClick={() => {
                      setSelectedUser(u);
                      createIndividualChat(u.id);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "8px 12px",
                      cursor: "pointer",
                      borderRadius: "6px",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f0f4ff"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <img
                      src={getUserPhoto(u.email, u.photoURL)}
                      alt={u.name}
                      style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }}
                    />
                    <div>
                      <div style={{ fontWeight: 500, fontSize: "14px", fontFamily: FONT_FAMILY }}>{u.name}</div>
                      <div style={{ fontSize: "12px", color: "#999", fontFamily: FONT_FAMILY }}>
                        {u.online ? '🟢 Online' : '⚪ Offline'}
                      </div>
                    </div>
                  </div>
                ))}
                {users.filter(u => u.id !== user.uid).length === 0 && (
                  <div style={{ padding: "20px", textAlign: "center", color: "#999", fontSize: "13px", fontFamily: FONT_FAMILY }}>
                    Belum ada user lain
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateGroup && (
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
            padding: "32px",
            maxWidth: "460px",
            width: "90%",
            maxHeight: "80vh",
            overflowY: "auto",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: 600, color: "#0D3CFC", fontFamily: FONT_FAMILY, margin: 0 }}>
                <GroupIcon size={20} /> Buat Grup
              </h3>
              <button
                onClick={() => setShowCreateGroup(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#999",
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ marginBottom: "12px" }}>
              <label style={{ fontSize: "13px", color: "#666", fontFamily: FONT_FAMILY, display: "block", marginBottom: "4px" }}>
                Nama Grup
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Masukkan nama grup..."
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "2px solid #e8e8e8",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontFamily: FONT_FAMILY,
                  outline: "none",
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = "#0D3CFC"}
                onBlur={(e) => e.currentTarget.style.borderColor = "#e8e8e8"}
              />
            </div>
            <div style={{ marginBottom: "12px" }}>
              <label style={{ fontSize: "13px", color: "#666", fontFamily: FONT_FAMILY, display: "block", marginBottom: "4px" }}>
                Pilih Anggota ({selectedUsers.length})
              </label>
              <div style={{
                maxHeight: "200px",
                overflowY: "auto",
                border: "1px solid #e8e8e8",
                borderRadius: "8px",
                padding: "8px",
              }}>
                {users.filter(u => u.id !== user.uid).map((u) => (
                  <label key={u.id} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "6px 10px",
                    cursor: "pointer",
                    fontFamily: FONT_FAMILY,
                    fontSize: "13px",
                    borderRadius: "4px",
                  }}>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(u.id)}
                      onChange={() => {
                        if (selectedUsers.includes(u.id)) {
                          setSelectedUsers(selectedUsers.filter(id => id !== u.id));
                        } else {
                          setSelectedUsers([...selectedUsers, u.id]);
                        }
                      }}
                      style={{ accentColor: "#0D3CFC" }}
                    />
                    <img
                      src={getUserPhoto(u.email, u.photoURL)}
                      alt={u.name}
                      style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover" }}
                    />
                    <span>{u.name}</span>
                  </label>
                ))}
                {users.filter(u => u.id !== user.uid).length === 0 && (
                  <div style={{ padding: "12px", textAlign: "center", color: "#999", fontSize: "13px", fontFamily: FONT_FAMILY }}>
                    Belum ada user lain
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowCreateGroup(false)}
                style={{
                  padding: "8px 20px",
                  backgroundColor: "transparent",
                  color: "#666",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  fontSize: "13px",
                  cursor: "pointer",
                  fontFamily: FONT_FAMILY,
                }}
              >
                Batal
              </button>
              <button
                onClick={createGroupChat}
                disabled={!groupName.trim() || selectedUsers.length === 0}
                style={{
                  padding: "8px 20px",
                  backgroundColor: (groupName.trim() && selectedUsers.length > 0) ? "#0D3CFC" : "#ccc",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: (groupName.trim() && selectedUsers.length > 0) ? "pointer" : "not-allowed",
                  fontFamily: FONT_FAMILY,
                }}
              >
                Buat Grup
              </button>
            </div>
          </div>
        </div>
      )}

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
            padding: "32px",
            maxWidth: "460px",
            width: "90%",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: 600, color: "#0D3CFC", fontFamily: FONT_FAMILY, margin: 0 }}>
                📢 Kirim Broadcast
              </h3>
              <button
                onClick={() => setShowBroadcastModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#999",
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "13px", color: "#666", fontFamily: FONT_FAMILY, display: "block", marginBottom: "4px" }}>
                Pesan Broadcast
              </label>
              <textarea
                value={broadcastText}
                onChange={(e) => setBroadcastText(e.target.value)}
                placeholder="Tulis pesan broadcast..."
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "2px solid #e8e8e8",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontFamily: FONT_FAMILY,
                  outline: "none",
                  minHeight: "100px",
                  resize: "vertical",
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = "#0D3CFC"}
                onBlur={(e) => e.currentTarget.style.borderColor = "#e8e8e8"}
              />
              <div style={{ fontSize: "12px", color: "#999", marginTop: "4px", fontFamily: FONT_FAMILY }}>
                Pesan akan dikirim ke semua user
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowBroadcastModal(false)}
                style={{
                  padding: "8px 20px",
                  backgroundColor: "transparent",
                  color: "#666",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  fontSize: "13px",
                  cursor: "pointer",
                  fontFamily: FONT_FAMILY,
                }}
              >
                Batal
              </button>
              <button
                onClick={sendBroadcast}
                disabled={!broadcastText.trim()}
                style={{
                  padding: "8px 20px",
                  backgroundColor: broadcastText.trim() ? "#0D3CFC" : "#ccc",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: broadcastText.trim() ? "pointer" : "not-allowed",
                  fontFamily: FONT_FAMILY,
                }}
              >
                Kirim Broadcast
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
            padding: "32px",
            maxWidth: "460px",
            width: "90%",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: 600, color: "#0D3CFC", fontFamily: FONT_FAMILY, margin: 0 }}>
                📢 Kirim Pengumuman
              </h3>
              <button
                onClick={() => setShowAnnouncementModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#999",
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "13px", color: "#666", fontFamily: FONT_FAMILY, display: "block", marginBottom: "4px" }}>
                Pesan Pengumuman
              </label>
              <textarea
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder="Tulis pengumuman..."
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "2px solid #e8e8e8",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontFamily: FONT_FAMILY,
                  outline: "none",
                  minHeight: "100px",
                  resize: "vertical",
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = "#0D3CFC"}
                onBlur={(e) => e.currentTarget.style.borderColor = "#e8e8e8"}
              />
              <div style={{ fontSize: "12px", color: "#999", marginTop: "4px", fontFamily: FONT_FAMILY }}>
                Pesan akan dikirim ke semua user
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowAnnouncementModal(false)}
                style={{
                  padding: "8px 20px",
                  backgroundColor: "transparent",
                  color: "#666",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  fontSize: "13px",
                  cursor: "pointer",
                  fontFamily: FONT_FAMILY,
                }}
              >
                Batal
              </button>
              <button
                onClick={sendAnnouncement}
                disabled={!announcementText.trim()}
                style={{
                  padding: "8px 20px",
                  backgroundColor: announcementText.trim() ? "#0D3CFC" : "#ccc",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: announcementText.trim() ? "pointer" : "not-allowed",
                  fontFamily: FONT_FAMILY,
                }}
              >
                Kirim Pengumuman
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      {showUserProfile && profileUser && (
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
            padding: "32px",
            maxWidth: "400px",
            width: "90%",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            textAlign: "center",
          }}>
            <div style={{ position: "relative", display: "inline-block" }}>
              <img
                src={getUserPhoto(profileUser.email, profileUser.photoURL)}
                alt={profileUser.name}
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "3px solid #0D3CFC",
                }}
              />
              {profileUser.online && (
                <div style={{
                  position: "absolute",
                  bottom: 4,
                  right: 4,
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  backgroundColor: "#22c55e",
                  border: "2px solid #fff",
                }} />
              )}
            </div>
            <h3 style={{ fontSize: "20px", fontWeight: 600, color: "#0D3CFC", fontFamily: FONT_FAMILY, marginTop: "16px", marginBottom: "4px" }}>
              {profileUser.name}
            </h3>
            <div style={{ fontSize: "13px", color: "#666", fontFamily: FONT_FAMILY, marginBottom: "4px" }}>
              {profileUser.email}
            </div>
            <div style={{ fontSize: "13px", color: profileUser.online ? "#22c55e" : "#999", fontFamily: FONT_FAMILY, marginBottom: "8px" }}>
              {profileUser.online ? '🟢 Online' : '⚪ Offline'}
            </div>
            {profileUser.bio && (
              <div style={{ fontSize: "14px", color: "#333", fontFamily: FONT_FAMILY, marginBottom: "8px", padding: "8px", backgroundColor: "#f8f9ff", borderRadius: "8px" }}>
                {profileUser.bio}
              </div>
            )}
            {profileUser.joinedAt && (
              <div style={{ fontSize: "12px", color: "#999", fontFamily: FONT_FAMILY }}>
                Bergabung {formatDate(profileUser.joinedAt)}
              </div>
            )}
            <div style={{ marginTop: "20px" }}>
              <button
                onClick={() => {
                  const existingRoom = rooms.find(r => 
                    r.type === 'individual' && 
                    r.participants.includes(profileUser.id) && 
                    r.participants.includes(user.uid)
                  );
                  if (existingRoom) {
                    setSelectedRoom(existingRoom);
                  } else {
                    createIndividualChat(profileUser.id);
                  }
                  setShowUserProfile(false);
                }}
                style={{
                  padding: "8px 24px",
                  backgroundColor: "#0D3CFC",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: FONT_FAMILY,
                }}
              >
                💬 Chat
              </button>
              <button
                onClick={() => setShowUserProfile(false)}
                style={{
                  padding: "8px 24px",
                  backgroundColor: "transparent",
                  color: "#666",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  fontSize: "14px",
                  marginLeft: "8px",
                  cursor: "pointer",
                  fontFamily: FONT_FAMILY,
                }}
              >
                Tutup
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
        <title>Live Chat | Menuru Official</title>
        <meta name="description" content="Live Chat Menuru - Chat dengan komunitas" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#0D3CFC" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Menuru" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="icon" href="/images/ai.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/images/ai.jpg" />
        <meta property="og:title" content="Live Chat | Menuru Official" />
        <meta property="og:description" content="Live Chat Menuru - Chat dengan komunitas" />
        <meta property="og:image" content="/images/ai.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Live Chat | Menuru Official" />
        <meta name="twitter:description" content="Live Chat Menuru - Chat dengan komunitas" />
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
                {`Chat dengan komunitas Menuru\nuntuk berbagi ide dan informasi`}
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
                Live Chat
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

        {/* LIVE CHAT */}
        <div style={{ padding: "0 40px 40px 40px" }}>
          <LiveChat user={user} isAdmin={isAdmin} db={db} auth={auth} />
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

        {/* MENURU Text */}
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

        {/* NAVBAR */}
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
                href={item.name === "Live Chat Agent" ? "/live-chat-agent" : item.name === "Live Chat" ? "/live-chat" : "/"}
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
