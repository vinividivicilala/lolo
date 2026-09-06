'use client';

import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, collection, query, where, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, orderBy, arrayUnion, arrayRemove, increment, getDoc, setDoc } from "firebase/firestore";
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

const UserPlusIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 21V19C16 16.7909 14.2091 15 12 15H5C2.79086 15 1 16.7909 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20 8V14M17 11H23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const GroupIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M23 21V19C22.7356 17.1124 21.7405 15.3591 20.1747 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 3.12891C17.5659 3.48813 18.9993 4.29577 20.1747 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const AddUserIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// Blinking Dots Component
const BlinkingDots = ({ active }: { active: boolean }) => {
  return (
    <span style={{ display: 'inline-flex', gap: '2px', alignItems: 'center' }}>
      <span className="dot" style={{ animationDelay: '0s', color: active ? '#000000' : '#ffffff' }}>●</span>
      <span className="dot" style={{ animationDelay: '0.2s', color: active ? '#000000' : '#ffffff' }}>●</span>
      <span className="dot" style={{ animationDelay: '0.4s', color: active ? '#000000' : '#ffffff' }}>●</span>
      <style>{`
        .dot {
          animation: blink 1.4s infinite both;
          font-size: 8px;
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

// Status Text Component
const StatusText = ({ active }: { active: boolean }) => {
  return (
    <span style={{ 
      fontSize: "10px", 
      color: active ? "#000000" : "#ffffff", 
      fontFamily: FONT_FAMILY,
      fontWeight: 500,
    }}>
      {active ? "Online" : "Offline"}
    </span>
  );
};

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
  { name: "Donation", number: "04" },
  { name: "Contact", number: "05" },
  { name: "Note", number: "06" }
];

// ===== INTERFACE TYPES =====
interface Chat {
  id: string;
  type: 'user' | 'group';
  name: string;
  photo?: string;
  members: string[];
  adminId?: string;
  createdAt: any;
  lastMessage?: string;
  lastMessageTime?: any;
  unreadCount: number;
  typing: { userId: string; userName: string }[];
  bio?: string;
  memberCount?: number;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  text: string;
  timestamp: any;
  read: boolean;
  readBy?: string[];
  delivered?: boolean;
}

interface User {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  online: boolean;
  lastSeen: any;
  bio?: string;
  joinedAt: any;
}

// ===== LIVE CHAT COMPONENT =====
const LiveChat = ({ user, db, auth }: { user: any; db: any; auth: any }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [messageSearchQuery, setMessageSearchQuery] = useState("");
  const [showAddUser, setShowAddUser] = useState(false);
  const [userBio, setUserBio] = useState("");
  
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
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
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

  // Load users
  useEffect(() => {
    if (!db || !isMounted) return;
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const userList: User[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        userList.push({ id: doc.id, ...data } as User);
      });
      setUsers(userList);
    });
    return () => unsubscribe();
  }, [db, isMounted]);

  // Load chats
  useEffect(() => {
    if (!db || !user || !isMounted) return;
    
    const q = query(
      collection(db, "chats"),
      where("members", "array-contains", user.uid),
      orderBy("lastMessageTime", "desc")
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatList: Chat[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        chatList.push({ id: doc.id, ...data } as Chat);
      });
      setChats(chatList);
      
      if (selectedChat) {
        const stillExists = chatList.some(c => c.id === selectedChat.id);
        if (!stillExists) {
          setSelectedChat(null);
          setMessages([]);
        }
      }
    });
    return () => unsubscribe();
  }, [db, user, selectedChat, isMounted]);

  // Load messages for selected chat
  useEffect(() => {
    if (!db || !selectedChat || !isMounted) return;
    
    const q = query(
      collection(db, "chats", selectedChat.id, "messages"),
      orderBy("timestamp", "asc")
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgList: Message[] = [];
      snapshot.forEach((doc) => {
        msgList.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(msgList);
      
      // Mark messages as read
      const markAsRead = async () => {
        const unread = msgList.filter(m => m.senderId !== user.uid && !m.read);
        if (unread.length > 0) {
          for (const msg of unread) {
            const msgRef = doc(db, "chats", selectedChat.id, "messages", msg.id);
            await updateDoc(msgRef, { 
              read: true,
              readBy: arrayUnion(user.uid)
            });
          }
          await updateDoc(doc(db, "chats", selectedChat.id), {
            unreadCount: 0
          });
        }
      };
      markAsRead();
      
      setTimeout(scrollToBottom, 100);
    });
    
    return () => unsubscribe();
  }, [db, selectedChat, isMounted]);

  // Auto-select first chat
  useEffect(() => {
    if (!user || !isMounted || chats.length === 0) return;
    
    if (!selectedChat || !chats.some(c => c.id === selectedChat.id)) {
      setSelectedChat(chats[0]);
    }
  }, [chats, user, selectedChat, isMounted]);

  // Set user bio
  useEffect(() => {
    if (user && user.bio) {
      setUserBio(user.bio);
    }
  }, [user]);

  const sendMessage = async () => {
    if (!db || !selectedChat || !messageText.trim() || !user) return;
    
    try {
      const chatRef = doc(db, "chats", selectedChat.id);
      
      await addDoc(collection(db, "chats", selectedChat.id, "messages"), {
        senderId: user.uid,
        senderName: user.displayName || user.email || "User",
        senderPhoto: user.photoURL || "",
        text: messageText.trim(),
        timestamp: serverTimestamp(),
        read: false,
        readBy: [],
        delivered: true
      });
      
      await updateDoc(chatRef, {
        lastMessage: messageText.trim(),
        lastMessageTime: serverTimestamp(),
        unreadCount: increment(1)
      });
      
      setMessageText("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleTyping = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessageText(value);
    if (!selectedChat || !user || !db) return;
    
    const chatRef = doc(db, "chats", selectedChat.id);
    const typingList = selectedChat.typing || [];
    const userTyping = typingList.find(t => t.userId === user.uid);
    
    if (value.length > 0 && !userTyping) {
      await updateDoc(chatRef, {
        typing: arrayUnion({ userId: user.uid, userName: user.displayName || user.email || "User" })
      });
    } else if (value.length === 0 && userTyping) {
      await updateDoc(chatRef, {
        typing: typingList.filter(t => t.userId !== user.uid)
      });
    }
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(async () => {
      const currentChat = chats.find(c => c.id === selectedChat.id);
      if (currentChat) {
        await updateDoc(chatRef, {
          typing: (currentChat.typing || []).filter(t => t.userId !== user.uid)
        });
      }
    }, 3000);
  };

  const createGroup = async () => {
    if (!db || !user || !groupName.trim() || selectedUsers.length === 0) return;
    
    try {
      const members = [user.uid, ...selectedUsers];
      await addDoc(collection(db, "chats"), {
        type: 'group',
        name: groupName.trim(),
        photo: "",
        members: members,
        adminId: user.uid,
        createdAt: serverTimestamp(),
        lastMessage: `Grup "${groupName.trim()}" dibuat`,
        lastMessageTime: serverTimestamp(),
        unreadCount: 0,
        typing: [],
        bio: "",
        memberCount: members.length
      });
      
      setGroupName("");
      setSelectedUsers([]);
      setShowCreateGroup(false);
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  const createNewChat = async (targetUserId: string) => {
    if (!db || !user || !targetUserId) return;
    
    try {
      const existingChat = chats.find(c => 
        c.type === 'user' && 
        c.members.includes(user.uid) && 
        c.members.includes(targetUserId)
      );
      
      if (existingChat) {
        setSelectedChat(existingChat);
        setShowNewChat(false);
        return;
      }
      
      const targetUser = users.find(u => u.id === targetUserId);
      if (!targetUser) return;
      
      const chatRef = await addDoc(collection(db, "chats"), {
        type: 'user',
        name: targetUser.displayName || targetUser.email || "User",
        photo: targetUser.photoURL || "",
        members: [user.uid, targetUserId],
        adminId: user.uid,
        createdAt: serverTimestamp(),
        lastMessage: "Chat dimulai",
        lastMessageTime: serverTimestamp(),
        unreadCount: 0,
        typing: [],
        bio: "",
        memberCount: 2
      });
      
      setShowNewChat(false);
      setSelectedChat({ id: chatRef.id, type: 'user', name: targetUser.displayName || targetUser.email || "User", photo: targetUser.photoURL || "", members: [user.uid, targetUserId], adminId: user.uid, createdAt: serverTimestamp(), lastMessage: "Chat dimulai", lastMessageTime: serverTimestamp(), unreadCount: 0, typing: [], bio: "", memberCount: 2 });
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  const addUserToGroup = async (chatId: string, userId: string) => {
    if (!db || !user) return;
    try {
      const chatRef = doc(db, "chats", chatId);
      await updateDoc(chatRef, {
        members: arrayUnion(userId),
        memberCount: increment(1)
      });
      setShowAddUser(false);
    } catch (error) {
      console.error("Error adding user to group:", error);
    }
  };

  const updateUserBio = async () => {
    if (!db || !user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { bio: userBio });
    } catch (error) {
      console.error("Error updating bio:", error);
    }
  };

  const updateGroupBio = async (chatId: string, bio: string) => {
    if (!db || !user) return;
    try {
      const chatRef = doc(db, "chats", chatId);
      await updateDoc(chatRef, { bio });
    } catch (error) {
      console.error("Error updating group bio:", error);
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        online: false,
        lastSeen: serverTimestamp()
      });
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Filter chats
  const filteredChats = chats.filter(chat => {
    if (!searchQuery || !searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    return (chat.name || '').toLowerCase().includes(query);
  });

  // Filter messages
  const filteredMessages = messages.filter(msg => {
    if (!messageSearchQuery || !messageSearchQuery.trim()) return true;
    const query = messageSearchQuery.toLowerCase().trim();
    return (msg.text || '').toLowerCase().includes(query);
  });

  // Get typing users
  const getTypingUsers = (chat: Chat) => {
    if (!chat.typing || chat.typing.length === 0) return null;
    const names = chat.typing.map(t => t.userName).filter(name => name !== (user?.displayName || user?.email || "User"));
    if (names.length === 0) return null;
    if (names.length === 1) return `${names[0]} sedang mengetik...`;
    if (names.length === 2) return `${names[0]} dan ${names[1]} sedang mengetik...`;
    return `${names.length} orang sedang mengetik...`;
  };

  // Get online members count
  const getOnlineMembers = (chat: Chat) => {
    if (!chat.members) return 0;
    return chat.members.filter(id => {
      const u = users.find(user => user.id === id);
      return u && u.online;
    }).length;
  };

  // Get user info
  const getUserInfo = (userId: string) => {
    return users.find(u => u.id === userId);
  };

  // Get unread count
  const getUnreadCount = (chat: Chat) => {
    return chat.unreadCount || 0;
  };

  // Get other participant in user chat
  const getOtherParticipant = (chat: Chat) => {
    if (chat.type !== 'user') return null;
    const otherId = chat.members.find(id => id !== user?.uid);
    return otherId ? getUserInfo(otherId) : null;
  };

  // Get message status
  const getMessageStatus = (msg: Message) => {
    if (msg.senderId !== user?.uid) return null;
    if (!msg.delivered) return "Mengirim...";
    if (msg.read) return "Dibaca";
    return "Terkirim";
  };

  if (!isMounted) return <div style={{ minHeight: "100px" }} />;

  if (!user) {
    return (
      <div style={{ 
        maxWidth: "1400px", 
        margin: "40px auto", 
        padding: "60px 40px",
        textAlign: "center",
        backgroundColor: "#ffffff",
        borderRadius: "20px",
        border: "1px solid rgba(13,60,252,0.1)",
      }}>
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

  // USER VIEW
  return (
    <div style={{ 
      maxWidth: "1400px", 
      margin: "40px auto", 
      height: "700px",
      backgroundColor: "#ffffff",
      borderRadius: "20px",
      border: "1px solid rgba(13,60,252,0.1)",
      overflow: "hidden",
      display: "flex",
      position: "relative",
    }}>
      {/* Sidebar - Chat List */}
      <div style={{
        width: "360px",
        backgroundColor: "#0D3CFC",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        borderRight: "1px solid rgba(255,255,255,0.1)",
      }}>
        {/* User Profile Header */}
        <div style={{
          padding: "16px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                overflow: "hidden",
                backgroundColor: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <img
                src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email || "User")}&background=ffffff&color=0D3CFC&size=128`}
                alt={user.displayName || "User"}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: "15px", color: "#ffffff", fontFamily: FONT_FAMILY }}>
                {user.displayName || user.email || "User"}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <BlinkingDots active={true} />
                <StatusText active={true} />
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                padding: "4px 10px",
                backgroundColor: "rgba(255,255,255,0.1)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "6px",
                fontSize: "11px",
                cursor: "pointer",
                fontFamily: FONT_FAMILY,
                transition: "all 0.2s ease",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.3)"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)"}
            >
              <LogoutIcon size={13} />
              <span>Logout</span>
            </button>
          </div>
          {/* User Bio - bisa di ketik dan submit */}
          <div style={{ marginTop: "8px", display: "flex", gap: "6px" }}>
            <input
              type="text"
              placeholder="Tulis bio..."
              value={userBio}
              onChange={(e) => setUserBio(e.target.value)}
              style={{
                flex: 1,
                padding: "4px 10px",
                backgroundColor: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "6px",
                color: "#ffffff",
                fontSize: "12px",
                fontFamily: FONT_FAMILY,
                outline: "none",
              }}
            />
            <button
              onClick={updateUserBio}
              style={{
                padding: "4px 12px",
                backgroundColor: "#0D3CFC",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                fontSize: "11px",
                cursor: "pointer",
                fontFamily: FONT_FAMILY,
              }}
            >
              Submit
            </button>
          </div>
        </div>
        
        {/* Search - text color biru */}
        <div style={{
          padding: "10px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "rgba(255,255,255,0.12)",
            borderRadius: "8px",
            padding: "6px 12px",
          }}>
            <SearchIcon size={16} color="#0D3CFC" />
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
                color: "#0D3CFC",
                fontSize: "13px",
                fontFamily: FONT_FAMILY,
              }}
            />
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => {
                setShowNewChat(!showNewChat);
                setShowCreateGroup(false);
              }}
              style={{
                flex: 1,
                padding: "6px 12px",
                backgroundColor: "#0D3CFC",
                color: "#ffffff",
                border: "1px solid #0D3CFC",
                borderRadius: "6px",
                fontSize: "12px",
                cursor: "pointer",
                fontFamily: FONT_FAMILY,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                transition: "all 0.2s ease",
              }}
            >
              <UserPlusIcon size={16} />
              Chat Baru
            </button>
            <button
              onClick={() => {
                setShowCreateGroup(!showCreateGroup);
                setShowNewChat(false);
              }}
              style={{
                flex: 1,
                padding: "6px 12px",
                backgroundColor: "#0D3CFC",
                color: "#ffffff",
                border: "1px solid #0D3CFC",
                borderRadius: "6px",
                fontSize: "12px",
                cursor: "pointer",
                fontFamily: FONT_FAMILY,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                transition: "all 0.2s ease",
              }}
            >
              <GroupIcon size={16} />
              Grup Baru
            </button>
          </div>
        </div>

        {/* Chat Baru List - No Modal */}
        {showNewChat && (
          <div style={{
            padding: "10px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            backgroundColor: "rgba(255,255,255,0.05)",
            maxHeight: "200px",
            overflowY: "auto",
          }}>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", fontFamily: FONT_FAMILY, marginBottom: "6px" }}>
              Pilih user untuk chat
            </div>
            {users.filter(u => u.id !== user.uid).map((u) => (
              <div
                key={u.id}
                onClick={() => createNewChat(u.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "6px 10px",
                  cursor: "pointer",
                  borderRadius: "6px",
                  transition: "background 0.2s ease",
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    backgroundColor: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    position: "relative",
                  }}
                >
                  <img
                    src={u.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.email || "User")}&background=ffffff&color=0D3CFC&size=128`}
                    alt={u.email}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  {u.online && (
                    <span style={{
                      position: "absolute",
                      bottom: "1px",
                      right: "1px",
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: "#22c55e",
                      border: "2px solid #0D3CFC",
                    }} />
                  )}
                </div>
                <div>
                  <div style={{ fontSize: "12px", color: "#ffffff", fontFamily: FONT_FAMILY }}>
                    {u.displayName || u.email || "User"}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <BlinkingDots active={u.online} />
                    <StatusText active={u.online} />
                  </div>
                </div>
              </div>
            ))}
            {users.filter(u => u.id !== user.uid).length === 0 && (
              <div style={{ padding: "10px", textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: "12px", fontFamily: FONT_FAMILY }}>
                Belum ada user lain
              </div>
            )}
          </div>
        )}

        {/* Grup Baru - No Modal */}
        {showCreateGroup && (
          <div style={{
            padding: "10px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            backgroundColor: "rgba(255,255,255,0.05)",
            maxHeight: "250px",
            overflowY: "auto",
          }}>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", fontFamily: FONT_FAMILY, marginBottom: "6px" }}>
              Buat grup baru
            </div>
            <div style={{ display: "flex", gap: "6px", marginBottom: "6px" }}>
              <input
                type="text"
                placeholder="Nama grup..."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                style={{
                  flex: 1,
                  padding: "4px 10px",
                  backgroundColor: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "6px",
                  color: "#ffffff",
                  fontSize: "12px",
                  fontFamily: FONT_FAMILY,
                  outline: "none",
                }}
              />
              <button
                onClick={createGroup}
                disabled={!groupName.trim() || selectedUsers.length === 0}
                style={{
                  padding: "4px 16px",
                  backgroundColor: (groupName.trim() && selectedUsers.length > 0) ? "#0D3CFC" : "#666",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "11px",
                  cursor: (groupName.trim() && selectedUsers.length > 0) ? "pointer" : "not-allowed",
                  fontFamily: FONT_FAMILY,
                }}
              >
                Buat
              </button>
            </div>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", fontFamily: FONT_FAMILY, marginBottom: "4px" }}>
              Pilih anggota ({selectedUsers.length})
            </div>
            {users.filter(u => u.id !== user.uid).map((u) => (
              <label key={u.id} style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "4px 8px",
                cursor: "pointer",
                fontFamily: FONT_FAMILY,
                fontSize: "12px",
                color: "#ffffff",
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
                <span>{u.displayName || u.email || "User"}</span>
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "4px" }}>
                  <BlinkingDots active={u.online} />
                  <StatusText active={u.online} />
                </div>
              </label>
            ))}
          </div>
        )}
        
        {/* Chat List - Menampilkan riwayat chat baru otomatis */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {filteredChats.map((chat) => {
            const isActive = selectedChat?.id === chat.id;
            const unread = getUnreadCount(chat);
            const onlineCount = getOnlineMembers(chat);
            const typingText = getTypingUsers(chat);
            const otherUser = chat.type === 'user' ? getOtherParticipant(chat) : null;
            const displayName = chat.type === 'user' && otherUser ? (otherUser.displayName || otherUser.email || "User") : chat.name;
            const displayPhoto = chat.type === 'user' && otherUser ? (otherUser.photoURL || getUserPhoto(otherUser.email)) : (chat.photo || getUserPhoto());
            const isOnline = chat.type === 'user' && otherUser ? otherUser.online : false;
            const chatBio = chat.type === 'user' && otherUser ? otherUser.bio : chat.bio;
            
            return (
              <div
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                style={{
                  padding: "10px 16px",
                  cursor: "pointer",
                  backgroundColor: isActive ? "rgba(255,255,255,0.15)" : "transparent",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      overflow: "hidden",
                      backgroundColor: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      position: "relative",
                    }}
                  >
                    <img
                      src={displayPhoto}
                      alt={displayName}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    {chat.type === 'user' && isOnline && (
                      <span style={{
                        position: "absolute",
                        bottom: "2px",
                        right: "2px",
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        backgroundColor: "#22c55e",
                        border: "2px solid #0D3CFC",
                      }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      fontWeight: isActive ? 600 : 500, 
                      fontSize: "13px", 
                      color: "#ffffff", 
                      fontFamily: FONT_FAMILY,
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}>
                      {displayName}
                      {chat.type === 'group' && (
                        <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)" }}>
                          ({chat.memberCount || 0})
                        </span>
                      )}
                      {chat.type === 'group' && chat.adminId === user.uid && (
                        <span style={{ fontSize: "8px", color: "#ffffff", fontFamily: FONT_FAMILY }}>
                          Admin
                        </span>
                      )}
                    </div>
                    {/* Typing indicator in chat list */}
                    {typingText && (
                      <div style={{ fontSize: "11px", color: "#ffffff", fontFamily: FONT_FAMILY, fontStyle: "italic" }}>
                        {typingText}
                      </div>
                    )}
                    {/* Last message - riwayat chat baru otomatis */}
                    <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", fontFamily: FONT_FAMILY }}>
                      {chat.lastMessage || "Mulai chat..."}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px", flexWrap: "wrap" }}>
                      {chat.type === 'user' ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <BlinkingDots active={isOnline} />
                          <StatusText active={isOnline} />
                        </div>
                      ) : (
                        onlineCount > 0 && (
                          <span style={{ fontSize: "9px", color: "#ffffff", fontFamily: FONT_FAMILY }}>
                            ● {onlineCount} online
                          </span>
                        )
                      )}
                      {unread > 0 && (
                        <span style={{
                          fontSize: "9px",
                          backgroundColor: "#ffffff",
                          color: "#0D3CFC",
                          padding: "1px 8px",
                          borderRadius: "10px",
                          fontWeight: 600,
                          fontFamily: FONT_FAMILY,
                        }}>
                          {unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredChats.length === 0 && (
            <div style={{ padding: "30px 20px", textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: "13px", fontFamily: FONT_FAMILY }}>
              Tidak ada chat
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", backgroundColor: "#f0f2f5" }}>
        {selectedChat ? (
          <>
            {/* Chat Header - Full Blue */}
            <div style={{
              padding: "12px 20px",
              backgroundColor: "#0D3CFC",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexShrink: 0,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    backgroundColor: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    position: "relative",
                  }}
                >
                  <img
                    src={selectedChat.type === 'user' && getOtherParticipant(selectedChat) 
                      ? (getOtherParticipant(selectedChat)?.photoURL || getUserPhoto(getOtherParticipant(selectedChat)?.email))
                      : (selectedChat.photo || getUserPhoto())}
                    alt={selectedChat.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  {selectedChat.type === 'user' && getOtherParticipant(selectedChat)?.online && (
                    <span style={{
                      position: "absolute",
                      bottom: "1px",
                      right: "1px",
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      backgroundColor: "#22c55e",
                      border: "2px solid #0D3CFC",
                    }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "14px", color: "#ffffff", fontFamily: FONT_FAMILY, display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                    {selectedChat.type === 'user' && getOtherParticipant(selectedChat) 
                      ? (getOtherParticipant(selectedChat)?.displayName || getOtherParticipant(selectedChat)?.email || "User")
                      : selectedChat.name}
                    {selectedChat.type === 'group' && (
                      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)" }}>
                        ({getOnlineMembers(selectedChat)} online)
                      </span>
                    )}
                    {selectedChat.type === 'group' && selectedChat.adminId === user.uid && (
                      <span style={{ fontSize: "9px", color: "#ffffff", fontFamily: FONT_FAMILY }}>
                        Admin
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                    {selectedChat.type === 'user' && getOtherParticipant(selectedChat) && (
                      <>
                        <BlinkingDots active={getOtherParticipant(selectedChat)?.online || false} />
                        <StatusText active={getOtherParticipant(selectedChat)?.online || false} />
                      </>
                    )}
                    {selectedChat.type === 'group' && (
                      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.8)", fontFamily: FONT_FAMILY }}>
                        {selectedChat.memberCount || 0} anggota
                      </span>
                    )}
                  </div>
                  {/* Typing indicator in header */}
                  {getTypingUsers(selectedChat) && (
                    <div style={{ fontSize: "10px", color: "#ffffff", fontFamily: FONT_FAMILY, fontStyle: "italic" }}>
                      {getTypingUsers(selectedChat)}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  {selectedChat.type === 'group' && selectedChat.adminId === user.uid && (
                    <button
                      onClick={() => setShowAddUser(!showAddUser)}
                      style={{
                        padding: "4px 10px",
                        backgroundColor: "rgba(255,255,255,0.15)",
                        color: "#ffffff",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "6px",
                        fontSize: "11px",
                        cursor: "pointer",
                        fontFamily: FONT_FAMILY,
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <AddUserIcon size={14} />
                      Add User
                    </button>
                  )}
                  {selectedChat.type === 'group' && (
                    <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                      <input
                        type="text"
                        placeholder="Bio grup..."
                        value={selectedChat.bio || ""}
                        onChange={(e) => updateGroupBio(selectedChat.id, e.target.value)}
                        style={{
                          padding: "4px 10px",
                          backgroundColor: "rgba(255,255,255,0.15)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "6px",
                          color: "#ffffff",
                          fontSize: "11px",
                          fontFamily: FONT_FAMILY,
                          outline: "none",
                          maxWidth: "120px",
                        }}
                      />
                      <button
                        onClick={() => updateGroupBio(selectedChat.id, selectedChat.bio || "")}
                        style={{
                          padding: "4px 10px",
                          backgroundColor: "#0D3CFC",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "6px",
                          fontSize: "10px",
                          cursor: "pointer",
                          fontFamily: FONT_FAMILY,
                        }}
                      >
                        Submit
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Add User to Group - Expandable */}
            {showAddUser && selectedChat.type === 'group' && selectedChat.adminId === user.uid && (
              <div style={{
                padding: "8px 20px",
                backgroundColor: "#ffffff",
                borderBottom: "1px solid #e8e8e8",
                maxHeight: "150px",
                overflowY: "auto",
              }}>
                <div style={{ fontSize: "11px", color: "#666", fontFamily: FONT_FAMILY, marginBottom: "4px" }}>
                  Tambah user ke grup
                </div>
                {users.filter(u => u.id !== user.uid && !selectedChat.members.includes(u.id)).map((u) => (
                  <div
                    key={u.id}
                    onClick={() => addUserToGroup(selectedChat.id, u.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "4px 10px",
                      cursor: "pointer",
                      borderRadius: "4px",
                      transition: "background 0.2s ease",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f0f2f5"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        overflow: "hidden",
                        backgroundColor: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <img
                        src={u.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.email || "User")}&background=ffffff&color=0D3CFC&size=128`}
                        alt={u.email}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                    <span style={{ fontSize: "12px", color: "#0D3CFC", fontFamily: FONT_FAMILY }}>
                      {u.displayName || u.email || "User"}
                    </span>
                    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "4px" }}>
                      <BlinkingDots active={u.online} />
                      <StatusText active={u.online} />
                    </div>
                  </div>
                ))}
                {users.filter(u => u.id !== user.uid && !selectedChat.members.includes(u.id)).length === 0 && (
                  <div style={{ padding: "10px", textAlign: "center", color: "#999", fontSize: "12px", fontFamily: FONT_FAMILY }}>
                    Semua user sudah di grup
                  </div>
                )}
              </div>
            )}

            {/* Message Search - text color biru */}
            <div style={{
              padding: "8px 20px",
              backgroundColor: "#ffffff",
              borderBottom: "1px solid #e8e8e8",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexShrink: 0,
            }}>
              <SearchIcon size={14} color="#0D3CFC" />
              <input
                type="text"
                placeholder="Cari pesan..."
                value={messageSearchQuery}
                onChange={(e) => setMessageSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#0D3CFC",
                  fontSize: "12px",
                  fontFamily: FONT_FAMILY,
                }}
              />
            </div>

            {/* Messages */}
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
              {filteredMessages.length === 0 ? (
                <div style={{ textAlign: "center", color: "#999", fontSize: "13px", padding: "40px 0", fontFamily: FONT_FAMILY }}>
                  {messageSearchQuery ? "Tidak ada pesan yang ditemukan" : "Belum ada pesan"}
                </div>
              ) : (
                filteredMessages.map((msg, idx) => {
                  const isMine = msg.senderId === user?.uid;
                  const isRead = msg.read || false;
                  const status = getMessageStatus(msg);
                  
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
                        <div
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "50%",
                            overflow: "hidden",
                            backgroundColor: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <img
                            src={msg.senderPhoto || getUserPhoto(undefined, undefined)}
                            alt={msg.senderName}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </div>
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
                          }}>
                            {msg.senderName}
                          </div>
                        )}
                        <div>{msg.text}</div>
                        <div style={{ 
                          fontSize: "9px", 
                          color: isMine ? "rgba(255,255,255,0.7)" : "#999", 
                          marginTop: "4px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-end",
                          gap: "4px",
                          fontFamily: FONT_FAMILY,
                        }}>
                          {formatTime(msg.timestamp)}
                          {isMine && status && (
                            <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "8px", fontWeight: 500 }}>
                              {status}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
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
                  padding: "10px 16px",
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
                  padding: "10px 18px",
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
};

// ===== MAIN PAGE =====
export default function LiveChatPage(): React.JSX.Element {
  const [user, setUser] = useState<any>(null);
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
        <meta name="description" content="Live Chat Menuru - Chat langsung dengan teman" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#0D3CFC" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Menuru" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="icon" href="/images/ai.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/images/ai.jpg" />
        <meta property="og:title" content="Live Chat | Menuru Official" />
        <meta property="og:description" content="Live Chat Menuru - Chat langsung dengan teman" />
        <meta property="og:image" content="/images/ai.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Live Chat | Menuru Official" />
        <meta name="twitter:description" content="Live Chat Menuru - Chat langsung dengan teman" />
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
                  fontSize: "48px",
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
                {`Chat langsung dengan teman\nuntuk obrolan seru`}
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

        <div style={{ padding: "0 40px 40px 40px" }}>
          <LiveChat user={user} db={db} auth={auth} />
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
                    } else if (link === "Live Chat") {
                      linkHref = "/live-chat";
                    } else if (link === "Live Chat Agent") {
                      linkHref = "/live-chat";
                    } else if (link === "Contact Us") {
                      linkHref = "/contact";
                    } else if (link === "Instagram") {
                      linkHref = "https://instagram.com";
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
                href={item.name === "Live Chat" ? "/live-chat" : "/"}
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
