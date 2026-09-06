'use client';

import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, collection, query, where, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, orderBy, arrayUnion, arrayRemove, increment } from "firebase/firestore";
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

const FONT_FAMILY = "'Poppins', 'Poppins Fallback', sans-serif";
const ADMIN_EMAIL = "faridardiansyah061@gmail.com";
const AGENT_NAME = "Farid Ardiansyah";
const AGENT_PHOTO = "/images/ai.jpg";

// SVG Icons - Clean Minimal
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

const UserPlus = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 21V19C16 16.7909 14.2091 15 12 15H5C2.79086 15 1 16.7909 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20 8V14M17 11H23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const UsersIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 21V19C17 16.7909 15.2091 15 13 15H5C2.79086 15 1 16.7909 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M23 21V19C22.735 17.112 21.664 15.465 20 14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 3.5C17.669 4.466 18.735 6.112 19 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PlusIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const XIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const LogoutIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ArrowRight = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

interface Chat {
  id: string;
  type: 'user' | 'group' | 'broadcast' | 'announcement';
  name: string;
  photo?: string;
  members?: string[];
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
}

interface User {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  online: boolean;
  lastSeen: any;
  bio?: string;
  status?: string;
  joinedAt: any;
}

const LiveChat = ({ user, isAdmin, db, auth }: { user: any; isAdmin: boolean; db: any; auth: any }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [groupBio, setGroupBio] = useState("");
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [editingChat, setEditingChat] = useState<Chat | null>(null);
  const [showGroupPanel, setShowGroupPanel] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

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
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(email)}&background=0D3CFC&color=fff&size=128&bold=true`;
    }
    return `https://ui-avatars.com/api/?name=User&background=0D3CFC&color=fff&size=128&bold=true`;
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

    let q;
    if (isAdmin) {
      q = query(collection(db, "chats"), orderBy("lastMessageTime", "desc"));
    } else {
      q = query(
        collection(db, "chats"),
        where("members", "array-contains", user.uid),
        orderBy("lastMessageTime", "desc")
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatList: Chat[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        chatList.push({ id: doc.id, ...data } as Chat);
      });
      setChats(chatList);

      // Update unread counts
      const counts: Record<string, number> = {};
      chatList.forEach(chat => {
        if (chat.unreadCount > 0) {
          counts[chat.id] = chat.unreadCount;
        }
      });
      setUnreadCounts(counts);

      if (selectedChat) {
        const stillExists = chatList.some(c => c.id === selectedChat.id);
        if (!stillExists) {
          setSelectedChat(null);
          setMessages([]);
        }
      }
    });
    return () => unsubscribe();
  }, [db, user, isAdmin, selectedChat, isMounted]);

  // Load messages for selected chat
  useEffect(() => {
    if (!db || !selectedChat || !isMounted) return;

    const q = query(
      collection(db, "chats", selectedChat.id, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const msgList: Message[] = [];
      snapshot.forEach((doc) => {
        msgList.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(msgList);

      // Mark messages as read
      if (selectedChat.type !== 'broadcast' && selectedChat.type !== 'announcement') {
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
      }

      setTimeout(scrollToBottom, 100);
    });

    return () => unsubscribe();
  }, [db, selectedChat, isMounted]);

  // Auto-select chat
  useEffect(() => {
    if (!user || !isMounted || chats.length === 0) return;

    const broadcast = chats.find(c => c.type === 'broadcast');
    const announcement = chats.find(c => c.type === 'announcement');
    const activeChat = chats.find(c => c.unreadCount > 0);

    if (broadcast && !selectedChat) {
      setSelectedChat(broadcast);
    } else if (announcement && !selectedChat) {
      setSelectedChat(announcement);
    } else if (activeChat && !selectedChat) {
      setSelectedChat(activeChat);
    } else if (chats.length > 0 && !selectedChat) {
      setSelectedChat(chats[0]);
    } else if (chats.length === 0) {
      setSelectedChat(null);
      setMessages([]);
    }
  }, [chats, user, isMounted, selectedChat]);

  // Create broadcast and announcement for user
  useEffect(() => {
    if (!db || !user || isAdmin || !isMounted || chats.length === 0) return;

    const hasBroadcast = chats.some(c => c.type === 'broadcast');
    const hasAnnouncement = chats.some(c => c.type === 'announcement');

    if (!hasBroadcast) {
      createBroadcastChat();
    }
    if (!hasAnnouncement) {
      createAnnouncementChat();
    }
  }, [chats, user, isAdmin, isMounted]);

  const createBroadcastChat = async () => {
    if (!db || !user) return;
    try {
      const existing = chats.find(c => c.type === 'broadcast');
      if (existing) return existing;

      const chatRef = await addDoc(collection(db, "chats"), {
        type: 'broadcast',
        name: 'Broadcast',
        photo: AGENT_PHOTO,
        members: [user.uid],
        adminId: user.uid,
        createdAt: serverTimestamp(),
        lastMessage: "Welcome to Broadcast Channel",
        lastMessageTime: serverTimestamp(),
        unreadCount: 0,
        typing: [],
        bio: "Official broadcast channel for updates"
      });

      await addDoc(collection(db, "chats", chatRef.id, "messages"), {
        senderId: user.uid,
        senderName: AGENT_NAME,
        senderPhoto: AGENT_PHOTO,
        text: "Welcome to Broadcast! You'll receive important updates here.",
        timestamp: serverTimestamp(),
        read: false,
        readBy: []
      });

      return chatRef;
    } catch (error) {
      console.error("Error creating broadcast chat:", error);
      return null;
    }
  };

  const createAnnouncementChat = async () => {
    if (!db || !user) return;
    try {
      const existing = chats.find(c => c.type === 'announcement');
      if (existing) return existing;

      const chatRef = await addDoc(collection(db, "chats"), {
        type: 'announcement',
        name: 'Announcements',
        photo: AGENT_PHOTO,
        members: [user.uid],
        adminId: user.uid,
        createdAt: serverTimestamp(),
        lastMessage: "Welcome to Announcements",
        lastMessageTime: serverTimestamp(),
        unreadCount: 0,
        typing: [],
        bio: "Official announcements channel"
      });

      await addDoc(collection(db, "chats", chatRef.id, "messages"), {
        senderId: user.uid,
        senderName: AGENT_NAME,
        senderPhoto: AGENT_PHOTO,
        text: "Welcome to Announcements! Stay tuned for important updates.",
        timestamp: serverTimestamp(),
        read: false,
        readBy: []
      });

      return chatRef;
    } catch (error) {
      console.error("Error creating announcement chat:", error);
      return null;
    }
  };

  const sendMessage = async () => {
    if (!db || !selectedChat || !messageText.trim() || !user) return;

    try {
      const chatRef = doc(db, "chats", selectedChat.id);

      await addDoc(collection(db, "chats", selectedChat.id, "messages"), {
        senderId: user.uid,
        senderName: isAdmin ? AGENT_NAME : (user.displayName || user.email || "User"),
        senderPhoto: isAdmin ? AGENT_PHOTO : (user.photoURL || ""),
        text: messageText.trim(),
        timestamp: serverTimestamp(),
        read: false,
        readBy: []
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
        lastMessage: `Group "${groupName.trim()}" created`,
        lastMessageTime: serverTimestamp(),
        unreadCount: 0,
        typing: [],
        bio: groupBio.trim() || "Group chat",
        memberCount: members.length
      });

      setGroupName("");
      setGroupBio("");
      setSelectedUsers([]);
      setShowCreateGroup(false);
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  const addUsersToGroup = async () => {
    if (!db || !editingChat || selectedUsers.length === 0) return;

    try {
      const chatRef = doc(db, "chats", editingChat.id);
      await updateDoc(chatRef, {
        members: arrayUnion(...selectedUsers),
        memberCount: increment(selectedUsers.length)
      });

      setSelectedUsers([]);
      setShowGroupPanel(false);
    } catch (error) {
      console.error("Error adding users:", error);
    }
  };

  const updateGroupBio = async () => {
    if (!db || !editingChat) return;

    try {
      const chatRef = doc(db, "chats", editingChat.id);
      await updateDoc(chatRef, {
        bio: editingChat.bio || "Group chat"
      });
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

  // Get typing users
  const getTypingUsers = (chat: Chat) => {
    if (!chat.typing || chat.typing.length === 0) return null;
    const names = chat.typing.map(t => t.userName);
    if (names.length === 1) return `${names[0]} is typing...`;
    if (names.length === 2) return `${names[0]} and ${names[1]} are typing...`;
    return `${names.length} people are typing...`;
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
  const getUnreadCount = (chatId: string) => {
    return unreadCounts[chatId] || 0;
  };

  // Open user profile
  const openUserProfile = (userId: string) => {
    const userInfo = getUserInfo(userId);
    if (userInfo) {
      setSelectedUser(userInfo);
      setShowUserProfile(true);
      if (panelRef.current) {
        gsap.fromTo(panelRef.current,
          { x: '100%', opacity: 0 },
          { x: '0%', opacity: 1, duration: 0.4, ease: 'power3.out' }
        );
      }
    }
  };

  // Open group panel
  const openGroupPanel = (chat: Chat) => {
    setEditingChat(chat);
    setShowGroupPanel(true);
    if (panelRef.current) {
      gsap.fromTo(panelRef.current,
        { x: '100%', opacity: 0 },
        { x: '0%', opacity: 1, duration: 0.4, ease: 'power3.out' }
      );
    }
  };

  // Close panel
  const closePanel = () => {
    if (panelRef.current) {
      gsap.to(panelRef.current, {
        x: '100%',
        opacity: 0,
        duration: 0.3,
        ease: 'power3.in',
        onComplete: () => {
          setShowUserProfile(false);
          setShowGroupPanel(false);
          setSelectedUser(null);
          setEditingChat(null);
        }
      });
    } else {
      setShowUserProfile(false);
      setShowGroupPanel(false);
      setSelectedUser(null);
      setEditingChat(null);
    }
  };

  if (!isMounted) return <div style={{ minHeight: "100px" }} />;

  if (!user) {
    return (
      <div style={{
        maxWidth: "1400px",
        margin: "40px auto",
        padding: "80px 40px",
        textAlign: "center",
        backgroundColor: "#f8faff",
        borderRadius: "24px",
        border: "1px solid rgba(13,60,252,0.08)",
      }}>
        <div style={{
          fontSize: "72px",
          marginBottom: "24px",
          fontWeight: 300,
          color: "#0D3CFC",
        }}>⌘</div>
        <h2 style={{
          fontSize: "32px",
          fontWeight: 600,
          color: "#0D3CFC",
          fontFamily: FONT_FAMILY,
          marginBottom: "12px",
        }}>
          Live Chat
        </h2>
        <p style={{
          fontSize: "16px",
          color: "#666",
          fontFamily: FONT_FAMILY,
          marginBottom: "32px",
        }}>
          Please sign in to access live chat
        </p>
        <Link href="/" style={{ textDecoration: "none" }}>
          <button
            style={{
              padding: "12px 40px",
              backgroundColor: "#0D3CFC",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: FONT_FAMILY,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            Sign In
          </button>
        </Link>
      </div>
    );
  }

  // User View
  if (!isAdmin) {
    return (
      <div style={{
        maxWidth: "1400px",
        margin: "40px auto",
        height: "680px",
        backgroundColor: "#ffffff",
        borderRadius: "24px",
        border: "1px solid rgba(13,60,252,0.08)",
        overflow: "hidden",
        display: "flex",
        position: "relative",
        boxShadow: "0 4px 24px rgba(13,60,252,0.06)",
      }}>
        {/* Sidebar */}
        <div style={{
          width: "340px",
          backgroundColor: "#0D3CFC",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
        }}>
          {/* Header */}
          <div style={{
            padding: "20px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  cursor: "pointer",
                  backgroundColor: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid rgba(255,255,255,0.2)",
                }}
                onClick={() => openUserProfile(user.uid)}
              >
                <img
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email || "User")}&background=ffffff&color=0D3CFC&size=128&bold=true`}
                  alt={user.displayName || "User"}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontWeight: 600,
                  fontSize: "15px",
                  color: "#ffffff",
                  fontFamily: FONT_FAMILY,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}>
                  {user.displayName || user.email || "User"}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "#22c55e",
                    display: "inline-block",
                  }} />
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", fontFamily: FONT_FAMILY }}>
                    Online
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
                  backgroundColor: "rgba(255,255,255,0.08)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  cursor: "pointer",
                  fontFamily: FONT_FAMILY,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.25)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)"}
              >
                <LogoutIcon size={14} />
              </button>
            </div>
          </div>

          {/* Search */}
          <div style={{
            padding: "12px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              backgroundColor: "rgba(255,255,255,0.1)",
              borderRadius: "10px",
              padding: "8px 14px",
            }}>
              <SearchIcon size={16} color="rgba(255,255,255,0.5)" />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#fff",
                  fontSize: "13px",
                  fontFamily: FONT_FAMILY,
                  placeholder: "rgba(255,255,255,0.4)",
                }}
              />
            </div>
          </div>

          {/* Actions */}
          <div style={{
            padding: "10px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            gap: "8px",
          }}>
            <button
              onClick={() => setShowCreateGroup(true)}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                padding: "8px 12px",
                backgroundColor: "rgba(255,255,255,0.1)",
                color: "#ffffff",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: FONT_FAMILY,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.18)"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)"}
            >
              <PlusIcon size={14} />
              New Group
            </button>
          </div>

          {/* Chat List */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {filteredChats.map((chat) => {
              const isActive = selectedChat?.id === chat.id;
              const unread = getUnreadCount(chat.id);
              const onlineCount = getOnlineMembers(chat);
              const typingText = getTypingUsers(chat);

              return (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  style={{
                    padding: "12px 20px",
                    cursor: "pointer",
                    backgroundColor: isActive ? "rgba(255,255,255,0.12)" : "transparent",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "50%",
                        overflow: "hidden",
                        backgroundColor: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: chat.type === 'group' ? 'pointer' : 'default',
                        flexShrink: 0,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (chat.type === 'group') {
                          openGroupPanel(chat);
                        }
                      }}
                    >
                      <img
                        src={chat.photo || getUserPhoto(undefined, undefined)}
                        alt={chat.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
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
                        {chat.name}
                        {chat.type === 'group' && (
                          <span style={{
                            fontSize: "10px",
                            color: "rgba(255,255,255,0.4)",
                            fontFamily: FONT_FAMILY,
                          }}>
                            ({chat.memberCount || 0})
                          </span>
                        )}
                      </div>
                      <div style={{
                        fontSize: "12px",
                        color: "rgba(255,255,255,0.5)",
                        fontFamily: FONT_FAMILY,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}>
                        {typingText || chat.lastMessage || "Start chatting..."}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                        {chat.type === 'group' && onlineCount > 0 && (
                          <span style={{
                            fontSize: "10px",
                            color: "#22c55e",
                            fontFamily: FONT_FAMILY,
                          }}>
                            ● {onlineCount} online
                          </span>
                        )}
                        {unread > 0 && (
                          <span style={{
                            fontSize: "10px",
                            backgroundColor: "#ffffff",
                            color: "#0D3CFC",
                            padding: "1px 10px",
                            borderRadius: "12px",
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
              <div style={{
                padding: "60px 20px",
                textAlign: "center",
                color: "rgba(255,255,255,0.3)",
                fontSize: "13px",
                fontFamily: FONT_FAMILY,
              }}>
                No chats yet
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", backgroundColor: "#f5f7fb" }}>
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div style={{
                padding: "16px 24px",
                backgroundColor: "#ffffff",
                borderBottom: "1px solid #eef0f4",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexShrink: 0,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px", flex: 1 }}>
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
                      cursor: selectedChat.type === 'group' ? 'pointer' : 'default',
                      border: "2px solid rgba(13,60,252,0.1)",
                    }}
                    onClick={() => {
                      if (selectedChat.type === 'group') {
                        openGroupPanel(selectedChat);
                      }
                    }}
                  >
                    <img
                      src={selectedChat.photo || getUserPhoto(undefined, undefined)}
                      alt={selectedChat.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                  <div>
                    <div style={{
                      fontWeight: 600,
                      fontSize: "15px",
                      color: "#0D3CFC",
                      fontFamily: FONT_FAMILY,
                    }}>
                      {selectedChat.name}
                      {selectedChat.type === 'group' && (
                        <span style={{
                          fontSize: "12px",
                          color: "#999",
                          marginLeft: "8px",
                          fontWeight: 400,
                        }}>
                          ({getOnlineMembers(selectedChat)} online)
                        </span>
                      )}
                    </div>
                    {selectedChat.bio && (
                      <div style={{
                        fontSize: "12px",
                        color: "#999",
                        fontFamily: FONT_FAMILY,
                      }}>
                        {selectedChat.bio}
                      </div>
                    )}
                  </div>
                </div>
                {selectedChat.type === 'group' && (
                  <button
                    onClick={() => openGroupPanel(selectedChat)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "6px 16px",
                      backgroundColor: "#0D3CFC",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: 500,
                      cursor: "pointer",
                      fontFamily: FONT_FAMILY,
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                  >
                    <UsersIcon size={14} />
                    Manage
                  </button>
                )}
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
                  <div style={{
                    textAlign: "center",
                    color: "#999",
                    fontSize: "14px",
                    padding: "60px 0",
                    fontFamily: FONT_FAMILY,
                  }}>
                    No messages yet
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMine = msg.senderId === user?.uid;
                    const isRead = msg.read || false;

                    return (
                      <div
                        key={idx}
                        style={{
                          alignSelf: isMine ? "flex-end" : "flex-start",
                          maxWidth: "72%",
                          display: "flex",
                          alignItems: "flex-end",
                          gap: "8px",
                        }}
                      >
                        {!isMine && (
                          <div
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              overflow: "hidden",
                              backgroundColor: "#fff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              flexShrink: 0,
                              border: "1px solid rgba(13,60,252,0.08)",
                            }}
                            onClick={() => openUserProfile(msg.senderId)}
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
                            padding: "10px 16px",
                            borderRadius: "16px",
                            backgroundColor: isMine ? "#0D3CFC" : "#ffffff",
                            color: isMine ? "#fff" : "#1a1a2e",
                            fontSize: "14px",
                            fontFamily: FONT_FAMILY,
                            wordBreak: "break-word",
                            boxShadow: isMine ? "none" : "0 2px 8px rgba(0,0,0,0.04)",
                            border: isMine ? "none" : "1px solid #eef0f4",
                            maxWidth: "100%",
                            lineHeight: 1.5,
                          }}
                        >
                          {!isMine && (
                            <div
                              style={{
                                fontSize: "11px",
                                fontWeight: 600,
                                color: "#0D3CFC",
                                marginBottom: "4px",
                                fontFamily: FONT_FAMILY,
                                cursor: "pointer",
                              }}
                              onClick={() => openUserProfile(msg.senderId)}
                            >
                              {msg.senderName}
                            </div>
                          )}
                          <div>{msg.text}</div>
                          <div style={{
                            fontSize: "10px",
                            color: isMine ? "rgba(255,255,255,0.5)" : "#999",
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
                                <DoubleCheckIcon size={12} color="rgba(255,255,255,0.5)" />
                              ) : (
                                <CheckIcon size={12} color="rgba(255,255,255,0.3)" />
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                {getTypingUsers(selectedChat) && (
                  <div style={{
                    alignSelf: "flex-start",
                    fontSize: "12px",
                    color: "#666",
                    padding: "4px 12px",
                    fontFamily: FONT_FAMILY,
                    fontStyle: "italic",
                  }}>
                    {getTypingUsers(selectedChat)}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div style={{
                padding: "12px 24px",
                borderTop: "1px solid #eef0f4",
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
                  placeholder="Type a message..."
                  style={{
                    flex: 1,
                    padding: "10px 18px",
                    border: "2px solid #eef0f4",
                    borderRadius: "12px",
                    fontSize: "14px",
                    outline: "none",
                    fontFamily: FONT_FAMILY,
                    backgroundColor: "#f8f9fc",
                    transition: "border-color 0.2s ease",
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = "#0D3CFC"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "#eef0f4"}
                />
                <button
                  onClick={sendMessage}
                  disabled={!messageText.trim()}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "10px 20px",
                    backgroundColor: messageText.trim() ? "#0D3CFC" : "#eef0f4",
                    color: messageText.trim() ? "#fff" : "#999",
                    border: "none",
                    borderRadius: "12px",
                    cursor: messageText.trim() ? "pointer" : "not-allowed",
                    fontFamily: FONT_FAMILY,
                    fontSize: "14px",
                    fontWeight: 500,
                    transition: "all 0.2s ease",
                    gap: "8px",
                  }}
                  onMouseEnter={(e) => {
                    if (messageText.trim()) e.currentTarget.style.transform = "scale(1.02)";
                  }}
                  onMouseLeave={(e) => {
                    if (messageText.trim()) e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  <SendIcon size={16} />
                  Send
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
              fontSize: "15px",
              fontFamily: FONT_FAMILY,
              gap: "12px",
            }}>
              <div style={{
                fontSize: "72px",
                fontWeight: 300,
                color: "#0D3CFC",
                opacity: 0.2,
              }}>⌘</div>
              <div style={{ color: "#666" }}>Select a chat to start messaging</div>
            </div>
          )}
        </div>

        {/* Slide Panel */}
        {(showUserProfile || showGroupPanel) && (
          <div
            ref={panelRef}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "400px",
              height: "100%",
              backgroundColor: "#ffffff",
              boxShadow: "-8px 0 40px rgba(0,0,0,0.06)",
              zIndex: 100,
              overflowY: "auto",
              transform: "translateX(100%)",
              opacity: 0,
            }}
          >
            <div style={{
              padding: "20px 24px",
              borderBottom: "1px solid #eef0f4",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              position: "sticky",
              top: 0,
              backgroundColor: "#ffffff",
              zIndex: 10,
            }}>
              <h3 style={{
                fontSize: "18px",
                fontWeight: 600,
                color: "#0D3CFC",
                fontFamily: FONT_FAMILY,
                margin: 0,
              }}>
                {showUserProfile ? 'Profile' : 'Group Settings'}
              </h3>
              <button
                onClick={closePanel}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#999",
                  padding: "4px",
                }}
              >
                <XIcon size={20} />
              </button>
            </div>

            <div style={{ padding: "24px" }}>
              {showUserProfile && selectedUser && (
                <div>
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                  }}>
                    <div
                      style={{
                        width: "120px",
                        height: "120px",
                        borderRadius: "50%",
                        overflow: "hidden",
                        margin: "0 auto 16px",
                        border: "4px solid #0D3CFC",
                        backgroundColor: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <img
                        src={selectedUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.email || "User")}&background=0D3CFC&color=fff&size=128&bold=true`}
                        alt={selectedUser.displayName || "User"}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                    <h3 style={{
                      fontSize: "20px",
                      fontWeight: 600,
                      color: "#0D3CFC",
                      fontFamily: FONT_FAMILY,
                      margin: "0 0 4px",
                    }}>
                      {selectedUser.displayName || selectedUser.email || "User"}
                    </h3>
                    <p style={{
                      fontSize: "14px",
                      color: "#666",
                      fontFamily: FONT_FAMILY,
                      margin: "0 0 8px",
                    }}>
                      {selectedUser.email}
                    </p>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "8px",
                    }}>
                      <span style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: selectedUser.online ? "#22c55e" : "#d1d5db",
                        display: "inline-block",
                      }} />
                      <span style={{
                        fontSize: "13px",
                        color: selectedUser.online ? "#22c55e" : "#999",
                        fontFamily: FONT_FAMILY,
                      }}>
                        {selectedUser.online ? "Online" : "Offline"}
                      </span>
                    </div>
                    {selectedUser.bio && (
                      <p style={{
                        fontSize: "14px",
                        color: "#666",
                        fontFamily: FONT_FAMILY,
                        margin: "0 0 8px",
                        backgroundColor: "#f5f7fb",
                        padding: "12px 16px",
                        borderRadius: "8px",
                        width: "100%",
                      }}>
                        {selectedUser.bio}
                      </p>
                    )}
                    {selectedUser.status && (
                      <p style={{
                        fontSize: "13px",
                        color: "#999",
                        fontFamily: FONT_FAMILY,
                        margin: "0 0 8px",
                      }}>
                        Status: {selectedUser.status}
                      </p>
                    )}
                    <p style={{
                      fontSize: "12px",
                      color: "#999",
                      fontFamily: FONT_FAMILY,
                      margin: "0",
                    }}>
                      Joined {formatDate(selectedUser.joinedAt)}
                    </p>
                  </div>
                </div>
              )}

              {showGroupPanel && editingChat && (
                <div>
                  {/* Group Name */}
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{
                      fontSize: "13px",
                      color: "#666",
                      fontFamily: FONT_FAMILY,
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: 500,
                    }}>
                      Group Name
                    </label>
                    <input
                      type="text"
                      value={editingChat.name}
                      onChange={(e) => setEditingChat({ ...editingChat, name: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        border: "2px solid #eef0f4",
                        borderRadius: "10px",
                        fontSize: "14px",
                        fontFamily: FONT_FAMILY,
                        outline: "none",
                        transition: "border-color 0.2s ease",
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = "#0D3CFC"}
                      onBlur={(e) => e.currentTarget.style.borderColor = "#eef0f4"}
                    />
                  </div>

                  {/* Group Bio */}
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{
                      fontSize: "13px",
                      color: "#666",
                      fontFamily: FONT_FAMILY,
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: 500,
                    }}>
                      Group Description
                    </label>
                    <input
                      type="text"
                      value={editingChat.bio || ""}
                      onChange={(e) => setEditingChat({ ...editingChat, bio: e.target.value })}
                      onBlur={updateGroupBio}
                      placeholder="What's this group about?"
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        border: "2px solid #eef0f4",
                        borderRadius: "10px",
                        fontSize: "14px",
                        fontFamily: FONT_FAMILY,
                        outline: "none",
                        transition: "border-color 0.2s ease",
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = "#0D3CFC"}
                      onBlur={(e) => e.currentTarget.style.borderColor = "#eef0f4"}
                    />
                  </div>

                  {/* Members */}
                  <div style={{ marginBottom: "20px" }}>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}>
                      <label style={{
                        fontSize: "13px",
                        color: "#666",
                        fontFamily: FONT_FAMILY,
                        fontWeight: 500,
                      }}>
                        Members ({editingChat.members?.length || 0})
                      </label>
                    </div>
                    <div style={{
                      maxHeight: "200px",
                      overflowY: "auto",
                      border: "1px solid #eef0f4",
                      borderRadius: "10px",
                      padding: "4px",
                    }}>
                      {editingChat.members?.map((memberId) => {
                        const member = getUserInfo(memberId);
                        if (!member) return null;
                        return (
                          <div key={memberId} style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "8px 12px",
                            borderRadius: "8px",
                            fontFamily: FONT_FAMILY,
                            fontSize: "13px",
                            cursor: "pointer",
                            transition: "background 0.2s ease",
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f5f7fb"}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                          onClick={() => {
                            closePanel();
                            setTimeout(() => openUserProfile(memberId), 300);
                          }}
                          >
                            <div
                              style={{
                                width: "32px",
                                height: "32px",
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
                                src={member.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.email || "User")}&background=0D3CFC&color=fff&size=64&bold=true`}
                                alt={member.email}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            </div>
                            <span style={{ flex: 1 }}>
                              {member.displayName || member.email || "User"}
                            </span>
                            <span style={{
                              fontSize: "10px",
                              color: member.online ? "#22c55e" : "#999",
                            }}>
                              {member.online ? "Online" : "Offline"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Add Members */}
                  <div>
                    <label style={{
                      fontSize: "13px",
                      color: "#666",
                      fontFamily: FONT_FAMILY,
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: 500,
                    }}>
                      Add Members
                    </label>
                    <div style={{
                      maxHeight: "150px",
                      overflowY: "auto",
                      border: "1px solid #eef0f4",
                      borderRadius: "10px",
                      padding: "4px",
                    }}>
                      {users.filter(u => u.id !== user.uid && !editingChat.members?.includes(u.id)).map((u) => (
                        <label key={u.id} style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "8px 12px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontFamily: FONT_FAMILY,
                          fontSize: "13px",
                          transition: "background 0.2s ease",
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f5f7fb"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                        >
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
                            style={{
                              accentColor: "#0D3CFC",
                              width: "16px",
                              height: "16px",
                              cursor: "pointer",
                            }}
                          />
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
                              src={u.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.email || "User")}&background=0D3CFC&color=fff&size=64&bold=true`}
                              alt={u.email}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          </div>
                          <span>{u.displayName || u.email || "User"}</span>
                        </label>
                      ))}
                      {users.filter(u => u.id !== user.uid && !editingChat.members?.includes(u.id)).length === 0 && (
                        <div style={{
                          padding: "16px",
                          textAlign: "center",
                          color: "#999",
                          fontSize: "13px",
                          fontFamily: FONT_FAMILY,
                        }}>
                          All users are in this group
                        </div>
                      )}
                    </div>
                    {selectedUsers.length > 0 && (
                      <button
                        onClick={addUsersToGroup}
                        style={{
                          marginTop: "12px",
                          padding: "8px 24px",
                          backgroundColor: "#0D3CFC",
                          color: "#fff",
                          border: "none",
                          borderRadius: "10px",
                          fontSize: "14px",
                          fontWeight: 500,
                          cursor: "pointer",
                          fontFamily: FONT_FAMILY,
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
                        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                      >
                        Add {selectedUsers.length} member{selectedUsers.length > 1 ? 's' : ''}
                      </button>
                    )}
                  </div>
                </div>
              )}
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
            backgroundColor: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}>
            <div style={{
              backgroundColor: "#fff",
              borderRadius: "20px",
              padding: "32px",
              maxWidth: "480px",
              width: "90%",
              boxShadow: "0 24px 64px rgba(0,0,0,0.15)",
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
              }}>
                <h3 style={{
                  fontSize: "20px",
                  fontWeight: 600,
                  color: "#0D3CFC",
                  fontFamily: FONT_FAMILY,
                  margin: 0,
                }}>
                  Create Group
                </h3>
                <button
                  onClick={() => setShowCreateGroup(false)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#999",
                    padding: "4px",
                  }}
                >
                  <XIcon size={20} />
                </button>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{
                  fontSize: "13px",
                  color: "#666",
                  fontFamily: FONT_FAMILY,
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: 500,
                }}>
                  Group Name
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter group name..."
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "2px solid #eef0f4",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontFamily: FONT_FAMILY,
                    outline: "none",
                    transition: "border-color 0.2s ease",
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = "#0D3CFC"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "#eef0f4"}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{
                  fontSize: "13px",
                  color: "#666",
                  fontFamily: FONT_FAMILY,
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: 500,
                }}>
                  Description
                </label>
                <input
                  type="text"
                  value={groupBio}
                  onChange={(e) => setGroupBio(e.target.value)}
                  placeholder="What's this group about?"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "2px solid #eef0f4",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontFamily: FONT_FAMILY,
                    outline: "none",
                    transition: "border-color 0.2s ease",
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = "#0D3CFC"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "#eef0f4"}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{
                  fontSize: "13px",
                  color: "#666",
                  fontFamily: FONT_FAMILY,
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: 500,
                }}>
                  Select Members
                </label>
                <div style={{
                  maxHeight: "160px",
                  overflowY: "auto",
                  border: "1px solid #eef0f4",
                  borderRadius: "10px",
                  padding: "4px",
                }}>
                  {users.filter(u => u.id !== user.uid).map((u) => (
                    <label key={u.id} style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontFamily: FONT_FAMILY,
                      fontSize: "13px",
                      transition: "background 0.2s ease",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f5f7fb"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
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
                        style={{
                          accentColor: "#0D3CFC",
                          width: "16px",
                          height: "16px",
                          cursor: "pointer",
                        }}
                      />
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
                          src={u.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.email || "User")}&background=0D3CFC&color=fff&size=64&bold=true`}
                          alt={u.email}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </div>
                      <span>{u.displayName || u.email || "User"}</span>
                    </label>
                  ))}
                  {users.filter(u => u.id !== user.uid).length === 0 && (
                    <div style={{
                      padding: "16px",
                      textAlign: "center",
                      color: "#999",
                      fontSize: "13px",
                      fontFamily: FONT_FAMILY,
                    }}>
                      No other users found
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button
                  onClick={() => setShowCreateGroup(false)}
                  style={{
                    padding: "8px 24px",
                    backgroundColor: "transparent",
                    color: "#666",
                    border: "1px solid #eef0f4",
                    borderRadius: "10px",
                    fontSize: "14px",
                    cursor: "pointer",
                    fontFamily: FONT_FAMILY,
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f5f7fb"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  Cancel
                </button>
                <button
                  onClick={createGroup}
                  disabled={!groupName.trim() || selectedUsers.length === 0}
                  style={{
                    padding: "8px 28px",
                    backgroundColor: (groupName.trim() && selectedUsers.length > 0) ? "#0D3CFC" : "#eef0f4",
                    color: (groupName.trim() && selectedUsers.length > 0) ? "#fff" : "#999",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: 500,
                    cursor: (groupName.trim() && selectedUsers.length > 0) ? "pointer" : "not-allowed",
                    fontFamily: FONT_FAMILY,
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (groupName.trim() && selectedUsers.length > 0) {
                      e.currentTarget.style.transform = "scale(1.02)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (groupName.trim() && selectedUsers.length > 0) {
                      e.currentTarget.style.transform = "scale(1)";
                    }
                  }}
                >
                  Create Group
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Admin View
  return (
    <div style={{
      maxWidth: "1400px",
      margin: "40px auto",
      height: "680px",
      backgroundColor: "#ffffff",
      borderRadius: "24px",
      border: "1px solid rgba(13,60,252,0.08)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      boxShadow: "0 4px 24px rgba(13,60,252,0.06)",
    }}>
      {/* Admin Header */}
      <div style={{
        padding: "14px 24px",
        backgroundColor: "#0D3CFC",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
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
              border: "2px solid rgba(255,255,255,0.2)",
            }}
          >
            <img
              src={AGENT_PHOTO}
              alt={AGENT_NAME}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
          <div>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}>
              <span style={{
                fontWeight: 600,
                fontSize: "15px",
                color: "#ffffff",
                fontFamily: FONT_FAMILY,
              }}>
                {AGENT_NAME}
              </span>
              <span style={{
                backgroundColor: "rgba(255,255,255,0.15)",
                color: "#fff",
                fontSize: "9px",
                fontWeight: 600,
                padding: "2px 12px",
                borderRadius: "12px",
                fontFamily: FONT_FAMILY,
                letterSpacing: "0.5px",
              }}>
                Admin
              </span>
            </div>
            <div style={{
              fontSize: "11px",
              color: "rgba(255,255,255,0.6)",
              fontFamily: FONT_FAMILY,
            }}>
              {chats.length} chats • {users.length} users
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={() => setShowCreateGroup(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 16px",
              backgroundColor: "rgba(255,255,255,0.1)",
              color: "#ffffff",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: FONT_FAMILY,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)"}
          >
            <UserPlus size={14} />
            Group
          </button>
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "6px 14px",
              backgroundColor: "rgba(255,255,255,0.08)",
              color: "#ffffff",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "8px",
              fontSize: "12px",
              cursor: "pointer",
              fontFamily: FONT_FAMILY,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.25)"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)"}
          >
            <LogoutIcon size={14} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden", position: "relative" }}>
        {/* Sidebar */}
        <div style={{
          width: "340px",
          backgroundColor: "#0D3CFC",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
        }}>
          <div style={{
            padding: "12px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              backgroundColor: "rgba(255,255,255,0.1)",
              borderRadius: "10px",
              padding: "8px 14px",
            }}>
              <SearchIcon size={16} color="rgba(255,255,255,0.5)" />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#fff",
                  fontSize: "13px",
                  fontFamily: FONT_FAMILY,
                }}
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>
            {filteredChats.map((chat) => {
              const isActive = selectedChat?.id === chat.id;
              const unread = getUnreadCount(chat.id);
              const onlineCount = getOnlineMembers(chat);

              return (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  style={{
                    padding: "12px 20px",
                    cursor: "pointer",
                    backgroundColor: isActive ? "rgba(255,255,255,0.12)" : "transparent",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "50%",
                        overflow: "hidden",
                        backgroundColor: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: chat.type === 'group' ? 'pointer' : 'default',
                        flexShrink: 0,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (chat.type === 'group') {
                          openGroupPanel(chat);
                        }
                      }}
                    >
                      <img
                        src={chat.photo || getUserPhoto(undefined, undefined)}
                        alt={chat.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
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
                        {chat.name}
                        {chat.type === 'group' && (
                          <span style={{
                            fontSize: "10px",
                            color: "rgba(255,255,255,0.4)",
                            fontFamily: FONT_FAMILY,
                          }}>
                            ({chat.memberCount || 0})
                          </span>
                        )}
                      </div>
                      <div style={{
                        fontSize: "12px",
                        color: "rgba(255,255,255,0.5)",
                        fontFamily: FONT_FAMILY,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}>
                        {chat.lastMessage || "Start chatting..."}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                        {chat.type === 'group' && onlineCount > 0 && (
                          <span style={{
                            fontSize: "10px",
                            color: "#22c55e",
                            fontFamily: FONT_FAMILY,
                          }}>
                            ● {onlineCount} online
                          </span>
                        )}
                        {unread > 0 && (
                          <span style={{
                            fontSize: "10px",
                            backgroundColor: "#ffffff",
                            color: "#0D3CFC",
                            padding: "1px 10px",
                            borderRadius: "12px",
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
              <div style={{
                padding: "60px 20px",
                textAlign: "center",
                color: "rgba(255,255,255,0.3)",
                fontSize: "13px",
                fontFamily: FONT_FAMILY,
              }}>
                No chats available
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", backgroundColor: "#f5f7fb" }}>
          {selectedChat ? (
            <>
              <div style={{
                padding: "16px 24px",
                backgroundColor: "#ffffff",
                borderBottom: "1px solid #eef0f4",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexShrink: 0,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px", flex: 1 }}>
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
                      cursor: selectedChat.type === 'group' ? 'pointer' : 'default',
                      border: "2px solid rgba(13,60,252,0.1)",
                    }}
                    onClick={() => {
                      if (selectedChat.type === 'group') {
                        openGroupPanel(selectedChat);
                      }
                    }}
                  >
                    <img
                      src={selectedChat.photo || getUserPhoto(undefined, undefined)}
                      alt={selectedChat.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                  <div>
                    <div style={{
                      fontWeight: 600,
                      fontSize: "15px",
                      color: "#0D3CFC",
                      fontFamily: FONT_FAMILY,
                    }}>
                      {selectedChat.name}
                      {selectedChat.type === 'group' && (
                        <span style={{
                          fontSize: "12px",
                          color: "#999",
                          marginLeft: "8px",
                          fontWeight: 400,
                        }}>
                          ({getOnlineMembers(selectedChat)} online)
                        </span>
                      )}
                    </div>
                    {selectedChat.bio && (
                      <div style={{
                        fontSize: "12px",
                        color: "#999",
                        fontFamily: FONT_FAMILY,
                      }}>
                        {selectedChat.bio}
                      </div>
                    )}
                  </div>
                </div>
                {selectedChat.type === 'group' && (
                  <button
                    onClick={() => openGroupPanel(selectedChat)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "6px 16px",
                      backgroundColor: "#0D3CFC",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: 500,
                      cursor: "pointer",
                      fontFamily: FONT_FAMILY,
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                  >
                    <UsersIcon size={14} />
                    Manage
                  </button>
                )}
              </div>

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
                  <div style={{
                    textAlign: "center",
                    color: "#999",
                    fontSize: "14px",
                    padding: "60px 0",
                    fontFamily: FONT_FAMILY,
                  }}>
                    No messages yet
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMine = msg.senderId === user?.uid;
                    const isRead = msg.read || false;

                    return (
                      <div
                        key={idx}
                        style={{
                          alignSelf: isMine ? "flex-end" : "flex-start",
                          maxWidth: "72%",
                          display: "flex",
                          alignItems: "flex-end",
                          gap: "8px",
                        }}
                      >
                        {!isMine && (
                          <div
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              overflow: "hidden",
                              backgroundColor: "#fff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              flexShrink: 0,
                              border: "1px solid rgba(13,60,252,0.08)",
                            }}
                            onClick={() => openUserProfile(msg.senderId)}
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
                            padding: "10px 16px",
                            borderRadius: "16px",
                            backgroundColor: isMine ? "#0D3CFC" : "#ffffff",
                            color: isMine ? "#fff" : "#1a1a2e",
                            fontSize: "14px",
                            fontFamily: FONT_FAMILY,
                            wordBreak: "break-word",
                            boxShadow: isMine ? "none" : "0 2px 8px rgba(0,0,0,0.04)",
                            border: isMine ? "none" : "1px solid #eef0f4",
                            maxWidth: "100%",
                            lineHeight: 1.5,
                          }}
                        >
                          {!isMine && (
                            <div
                              style={{
                                fontSize: "11px",
                                fontWeight: 600,
                                color: "#0D3CFC",
                                marginBottom: "4px",
                                fontFamily: FONT_FAMILY,
                                cursor: "pointer",
                              }}
                              onClick={() => openUserProfile(msg.senderId)}
                            >
                              {msg.senderName}
                            </div>
                          )}
                          <div>{msg.text}</div>
                          <div style={{
                            fontSize: "10px",
                            color: isMine ? "rgba(255,255,255,0.5)" : "#999",
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
                                <DoubleCheckIcon size={12} color="rgba(255,255,255,0.5)" />
                              ) : (
                                <CheckIcon size={12} color="rgba(255,255,255,0.3)" />
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                {getTypingUsers(selectedChat) && (
                  <div style={{
                    alignSelf: "flex-start",
                    fontSize: "12px",
                    color: "#666",
                    padding: "4px 12px",
                    fontFamily: FONT_FAMILY,
                    fontStyle: "italic",
                  }}>
                    {getTypingUsers(selectedChat)}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div style={{
                padding: "12px 24px",
                borderTop: "1px solid #eef0f4",
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
                  placeholder="Type a reply..."
                  style={{
                    flex: 1,
                    padding: "10px 18px",
                    border: "2px solid #eef0f4",
                    borderRadius: "12px",
                    fontSize: "14px",
                    outline: "none",
                    fontFamily: FONT_FAMILY,
                    backgroundColor: "#f8f9fc",
                    transition: "border-color 0.2s ease",
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = "#0D3CFC"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "#eef0f4"}
                />
                <button
                  onClick={sendMessage}
                  disabled={!messageText.trim()}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "10px 20px",
                    backgroundColor: messageText.trim() ? "#0D3CFC" : "#eef0f4",
                    color: messageText.trim() ? "#fff" : "#999",
                    border: "none",
                    borderRadius: "12px",
                    cursor: messageText.trim() ? "pointer" : "not-allowed",
                    fontFamily: FONT_FAMILY,
                    fontSize: "14px",
                    fontWeight: 500,
                    transition: "all 0.2s ease",
                    gap: "8px",
                  }}
                  onMouseEnter={(e) => {
                    if (messageText.trim()) e.currentTarget.style.transform = "scale(1.02)";
                  }}
                  onMouseLeave={(e) => {
                    if (messageText.trim()) e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  <SendIcon size={16} />
                  Send
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
              fontSize: "15px",
              fontFamily: FONT_FAMILY,
              gap: "12px",
            }}>
              <div style={{
                fontSize: "72px",
                fontWeight: 300,
                color: "#0D3CFC",
                opacity: 0.2,
              }}>⌘</div>
              <div style={{ color: "#666" }}>Select a chat to start messaging</div>
            </div>
          )}
        </div>

        {/* Slide Panel */}
        {(showUserProfile || showGroupPanel) && (
          <div
            ref={panelRef}
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "400px",
              height: "100%",
              backgroundColor: "#ffffff",
              boxShadow: "-8px 0 40px rgba(0,0,0,0.06)",
              zIndex: 100,
              overflowY: "auto",
              transform: "translateX(100%)",
              opacity: 0,
            }}
          >
            <div style={{
              padding: "20px 24px",
              borderBottom: "1px solid #eef0f4",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              position: "sticky",
              top: 0,
              backgroundColor: "#ffffff",
              zIndex: 10,
            }}>
              <h3 style={{
                fontSize: "18px",
                fontWeight: 600,
                color: "#0D3CFC",
                fontFamily: FONT_FAMILY,
                margin: 0,
              }}>
                {showUserProfile ? 'Profile' : 'Group Settings'}
              </h3>
              <button
                onClick={closePanel}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#999",
                  padding: "4px",
                }}
              >
                <XIcon size={20} />
              </button>
            </div>

            <div style={{ padding: "24px" }}>
              {showUserProfile && selectedUser && (
                <div>
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                  }}>
                    <div
                      style={{
                        width: "120px",
                        height: "120px",
                        borderRadius: "50%",
                        overflow: "hidden",
                        margin: "0 auto 16px",
                        border: "4px solid #0D3CFC",
                        backgroundColor: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <img
                        src={selectedUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.email || "User")}&background=0D3CFC&color=fff&size=128&bold=true`}
                        alt={selectedUser.displayName || "User"}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                    <h3 style={{
                      fontSize: "20px",
                      fontWeight: 600,
                      color: "#0D3CFC",
                      fontFamily: FONT_FAMILY,
                      margin: "0 0 4px",
                    }}>
                      {selectedUser.displayName || selectedUser.email || "User"}
                    </h3>
                    <p style={{
                      fontSize: "14px",
                      color: "#666",
                      fontFamily: FONT_FAMILY,
                      margin: "0 0 8px",
                    }}>
                      {selectedUser.email}
                    </p>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "8px",
                    }}>
                      <span style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: selectedUser.online ? "#22c55e" : "#d1d5db",
                        display: "inline-block",
                      }} />
                      <span style={{
                        fontSize: "13px",
                        color: selectedUser.online ? "#22c55e" : "#999",
                        fontFamily: FONT_FAMILY,
                      }}>
                        {selectedUser.online ? "Online" : "Offline"}
                      </span>
                    </div>
                    {selectedUser.bio && (
                      <p style={{
                        fontSize: "14px",
                        color: "#666",
                        fontFamily: FONT_FAMILY,
                        margin: "0 0 8px",
                        backgroundColor: "#f5f7fb",
                        padding: "12px 16px",
                        borderRadius: "8px",
                        width: "100%",
                      }}>
                        {selectedUser.bio}
                      </p>
                    )}
                    {selectedUser.status && (
                      <p style={{
                        fontSize: "13px",
                        color: "#999",
                        fontFamily: FONT_FAMILY,
                        margin: "0 0 8px",
                      }}>
                        Status: {selectedUser.status}
                      </p>
                    )}
                    <p style={{
                      fontSize: "12px",
                      color: "#999",
                      fontFamily: FONT_FAMILY,
                      margin: "0",
                    }}>
                      Joined {formatDate(selectedUser.joinedAt)}
                    </p>
                  </div>
                </div>
              )}

              {showGroupPanel && editingChat && (
                <div>
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{
                      fontSize: "13px",
                      color: "#666",
                      fontFamily: FONT_FAMILY,
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: 500,
                    }}>
                      Group Name
                    </label>
                    <input
                      type="text"
                      value={editingChat.name}
                      onChange={(e) => setEditingChat({ ...editingChat, name: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        border: "2px solid #eef0f4",
                        borderRadius: "10px",
                        fontSize: "14px",
                        fontFamily: FONT_FAMILY,
                        outline: "none",
                        transition: "border-color 0.2s ease",
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = "#0D3CFC"}
                      onBlur={(e) => e.currentTarget.style.borderColor = "#eef0f4"}
                    />
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <label style={{
                      fontSize: "13px",
                      color: "#666",
                      fontFamily: FONT_FAMILY,
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: 500,
                    }}>
                      Description
                    </label>
                    <input
                      type="text"
                      value={editingChat.bio || ""}
                      onChange={(e) => setEditingChat({ ...editingChat, bio: e.target.value })}
                      onBlur={updateGroupBio}
                      placeholder="What's this group about?"
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        border: "2px solid #eef0f4",
                        borderRadius: "10px",
                        fontSize: "14px",
                        fontFamily: FONT_FAMILY,
                        outline: "none",
                        transition: "border-color 0.2s ease",
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = "#0D3CFC"}
                      onBlur={(e) => e.currentTarget.style.borderColor = "#eef0f4"}
                    />
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}>
                      <label style={{
                        fontSize: "13px",
                        color: "#666",
                        fontFamily: FONT_FAMILY,
                        fontWeight: 500,
                      }}>
                        Members ({editingChat.members?.length || 0})
                      </label>
                    </div>
                    <div style={{
                      maxHeight: "200px",
                      overflowY: "auto",
                      border: "1px solid #eef0f4",
                      borderRadius: "10px",
                      padding: "4px",
                    }}>
                      {editingChat.members?.map((memberId) => {
                        const member = getUserInfo(memberId);
                        if (!member) return null;
                        return (
                          <div key={memberId} style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "8px 12px",
                            borderRadius: "8px",
                            fontFamily: FONT_FAMILY,
                            fontSize: "13px",
                            cursor: "pointer",
                            transition: "background 0.2s ease",
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f5f7fb"}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                          onClick={() => {
                            closePanel();
                            setTimeout(() => openUserProfile(memberId), 300);
                          }}
                          >
                            <div
                              style={{
                                width: "32px",
                                height: "32px",
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
                                src={member.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.email || "User")}&background=0D3CFC&color=fff&size=64&bold=true`}
                                alt={member.email}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            </div>
                            <span style={{ flex: 1 }}>
                              {member.displayName || member.email || "User"}
                            </span>
                            <span style={{
                              fontSize: "10px",
                              color: member.online ? "#22c55e" : "#999",
                            }}>
                              {member.online ? "Online" : "Offline"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label style={{
                      fontSize: "13px",
                      color: "#666",
                      fontFamily: FONT_FAMILY,
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: 500,
                    }}>
                      Add Members
                    </label>
                    <div style={{
                      maxHeight: "150px",
                      overflowY: "auto",
                      border: "1px solid #eef0f4",
                      borderRadius: "10px",
                      padding: "4px",
                    }}>
                      {users.filter(u => u.id !== user.uid && !editingChat.members?.includes(u.id)).map((u) => (
                        <label key={u.id} style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "8px 12px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontFamily: FONT_FAMILY,
                          fontSize: "13px",
                          transition: "background 0.2s ease",
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f5f7fb"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                        >
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
                            style={{
                              accentColor: "#0D3CFC",
                              width: "16px",
                              height: "16px",
                              cursor: "pointer",
                            }}
                          />
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
                              src={u.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.email || "User")}&background=0D3CFC&color=fff&size=64&bold=true`}
                              alt={u.email}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          </div>
                          <span>{u.displayName || u.email || "User"}</span>
                        </label>
                      ))}
                      {users.filter(u => u.id !== user.uid && !editingChat.members?.includes(u.id)).length === 0 && (
                        <div style={{
                          padding: "16px",
                          textAlign: "center",
                          color: "#999",
                          fontSize: "13px",
                          fontFamily: FONT_FAMILY,
                        }}>
                          All users are in this group
                        </div>
                      )}
                    </div>
                    {selectedUsers.length > 0 && (
                      <button
                        onClick={addUsersToGroup}
                        style={{
                          marginTop: "12px",
                          padding: "8px 24px",
                          backgroundColor: "#0D3CFC",
                          color: "#fff",
                          border: "none",
                          borderRadius: "10px",
                          fontSize: "14px",
                          fontWeight: 500,
                          cursor: "pointer",
                          fontFamily: FONT_FAMILY,
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
                        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                      >
                        Add {selectedUsers.length} member{selectedUsers.length > 1 ? 's' : ''}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create Group Modal - Admin */}
        {showCreateGroup && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}>
            <div style={{
              backgroundColor: "#fff",
              borderRadius: "20px",
              padding: "32px",
              maxWidth: "480px",
              width: "90%",
              boxShadow: "0 24px 64px rgba(0,0,0,0.15)",
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
              }}>
                <h3 style={{
                  fontSize: "20px",
                  fontWeight: 600,
                  color: "#0D3CFC",
                  fontFamily: FONT_FAMILY,
                  margin: 0,
                }}>
                  Create Group
                </h3>
                <button
                  onClick={() => setShowCreateGroup(false)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#999",
                    padding: "4px",
                  }}
                >
                  <XIcon size={20} />
                </button>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{
                  fontSize: "13px",
                  color: "#666",
                  fontFamily: FONT_FAMILY,
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: 500,
                }}>
                  Group Name
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter group name..."
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "2px solid #eef0f4",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontFamily: FONT_FAMILY,
                    outline: "none",
                    transition: "border-color 0.2s ease",
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = "#0D3CFC"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "#eef0f4"}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{
                  fontSize: "13px",
                  color: "#666",
                  fontFamily: FONT_FAMILY,
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: 500,
                }}>
                  Description
                </label>
                <input
                  type="text"
                  value={groupBio}
                  onChange={(e) => setGroupBio(e.target.value)}
                  placeholder="What's this group about?"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "2px solid #eef0f4",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontFamily: FONT_FAMILY,
                    outline: "none",
                    transition: "border-color 0.2s ease",
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = "#0D3CFC"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "#eef0f4"}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{
                  fontSize: "13px",
                  color: "#666",
                  fontFamily: FONT_FAMILY,
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: 500,
                }}>
                  Select Members
                </label>
                <div style={{
                  maxHeight: "160px",
                  overflowY: "auto",
                  border: "1px solid #eef0f4",
                  borderRadius: "10px",
                  padding: "4px",
                }}>
                  {users.filter(u => u.id !== user.uid).map((u) => (
                    <label key={u.id} style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontFamily: FONT_FAMILY,
                      fontSize: "13px",
                      transition: "background 0.2s ease",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f5f7fb"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
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
                        style={{
                          accentColor: "#0D3CFC",
                          width: "16px",
                          height: "16px",
                          cursor: "pointer",
                        }}
                      />
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
                          src={u.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.email || "User")}&background=0D3CFC&color=fff&size=64&bold=true`}
                          alt={u.email}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </div>
                      <span>{u.displayName || u.email || "User"}</span>
                    </label>
                  ))}
                  {users.filter(u => u.id !== user.uid).length === 0 && (
                    <div style={{
                      padding: "16px",
                      textAlign: "center",
                      color: "#999",
                      fontSize: "13px",
                      fontFamily: FONT_FAMILY,
                    }}>
                      No other users found
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button
                  onClick={() => setShowCreateGroup(false)}
                  style={{
                    padding: "8px 24px",
                    backgroundColor: "transparent",
                    color: "#666",
                    border: "1px solid #eef0f4",
                    borderRadius: "10px",
                    fontSize: "14px",
                    cursor: "pointer",
                    fontFamily: FONT_FAMILY,
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f5f7fb"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  Cancel
                </button>
                <button
                  onClick={createGroup}
                  disabled={!groupName.trim() || selectedUsers.length === 0}
                  style={{
                    padding: "8px 28px",
                    backgroundColor: (groupName.trim() && selectedUsers.length > 0) ? "#0D3CFC" : "#eef0f4",
                    color: (groupName.trim() && selectedUsers.length > 0) ? "#fff" : "#999",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: 500,
                    cursor: (groupName.trim() && selectedUsers.length > 0) ? "pointer" : "not-allowed",
                    fontFamily: FONT_FAMILY,
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (groupName.trim() && selectedUsers.length > 0) {
                      e.currentTarget.style.transform = "scale(1.02)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (groupName.trim() && selectedUsers.length > 0) {
                      e.currentTarget.style.transform = "scale(1)";
                    }
                  }}
                >
                  Create Group
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main Page
export default function LiveChatPage(): React.JSX.Element {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [showMain, setShowMain] = useState(false);
  const preloaderRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

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

  const startPreloaderAnimation = () => {
    const tl = gsap.timeline({
      onComplete: () => {
        if (preloaderRef.current) {
          gsap.to(preloaderRef.current, {
            opacity: 0,
            duration: 0.6,
            ease: "power2.inOut",
            onComplete: () => setShowMain(true)
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
        if (textRef.current) textRef.current.textContent = "Chat";
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
    });
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
            Live
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
            Live
          </span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Live Chat | Menuru</title>
        <meta name="description" content="Live Chat Menuru - Chat langsung dengan agent" />
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
        overflow: "visible",
      }}>
        <div style={{
          minHeight: "auto",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          padding: "40px 40px 0 40px",
          backgroundColor: "#ffffff",
          position: "relative",
          paddingTop: "40px",
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "40px",
          }}>
            <h1 style={{
              fontSize: "40px",
              fontWeight: 700,
              color: "#0D3CFC",
              fontFamily: FONT_FAMILY,
              letterSpacing: "-0.03em",
              margin: 0,
              lineHeight: 1,
            }}>
              Menuru
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <span style={{
                fontSize: "14px",
                color: "#666",
                fontFamily: FONT_FAMILY,
              }}>
                {user ? (
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: "#22c55e",
                      display: "inline-block",
                    }} />
                    {user.displayName || user.email || "User"}
                  </span>
                ) : (
                  "Guest"
                )}
              </span>
              {!user && (
                <Link href="/" style={{ textDecoration: "none" }}>
                  <button style={{
                    padding: "8px 24px",
                    backgroundColor: "#0D3CFC",
                    color: "#fff",
                    border: "none",
                    borderRadius: "10px",
                    fontSize: "14px",
                    fontWeight: 500,
                    cursor: "pointer",
                    fontFamily: FONT_FAMILY,
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                  >
                    Sign In
                  </button>
                </Link>
              )}
            </div>
          </div>

          <div style={{
            marginBottom: "16px",
          }}>
            <h2 style={{
              fontSize: "32px",
              fontWeight: 600,
              color: "#0D3CFC",
              fontFamily: FONT_FAMILY,
              letterSpacing: "-0.02em",
              margin: 0,
              lineHeight: 1.2,
            }}>
              Live Chat
            </h2>
            <p style={{
              fontSize: "16px",
              color: "#666",
              fontFamily: FONT_FAMILY,
              margin: "4px 0 0 0",
            }}>
              {user ? `Welcome back, ${user.displayName || user.email || "User"}` : "Please sign in to continue"}
            </p>
          </div>
        </div>

        <div style={{ padding: "0 40px 40px 40px" }}>
          <LiveChat user={user} isAdmin={isAdmin} db={db} auth={auth} />
        </div>

        <div style={{
          padding: "40px 40px 80px 40px",
          backgroundColor: "#ffffff",
          borderTop: "1px solid rgba(0,0,0,0.04)",
        }}>
          <div style={{
            maxWidth: "1400px",
            margin: "0 auto",
            textAlign: "center",
          }}>
            <span style={{
              fontSize: "14px",
              color: "#999",
              fontFamily: FONT_FAMILY,
              letterSpacing: "0.5px",
            }}>
              © {new Date().getFullYear()} Menuru. All rights reserved.
            </span>
          </div>
        </div>
      </div>

      <style jsx global>{`
        html {
          overflow: auto !important;
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
        html::-webkit-scrollbar {
          display: none !important;
        }
        body {
          overflow: auto !important;
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
          margin: 0;
          padding: 0;
          background-color: #ffffff !important;
        }
        body::-webkit-scrollbar {
          display: none !important;
        }
        * {
          background-color: transparent;
        }
      `}</style>
    </>
  );
}
