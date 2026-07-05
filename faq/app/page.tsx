'use client';

import React, { useState, useEffect, useRef } from "react";
import { initializeApp, getApps } from "firebase/app";
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword
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
  deleteDoc,
  onDisconnect,
  runTransaction
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

// SVG Icons Minimalist
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

const AddUserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
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

// Announcement SVG Icon - Sorak/Megaphone
const AnnouncementIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <path d="M4 11L17 5V19L4 13V11Z" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <path d="M17 5L20 3V7L17 5Z" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <path d="M4 11L2 9V15L4 13" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <path d="M20 9C21 10 21.5 11.5 21.5 13C21.5 14.5 21 16 20 17" stroke="#000" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <path d="M22 7C23.5 9 24 11 24 13C24 15 23.5 17 22 19" stroke="#000" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <circle cx="18" cy="12" r="1.5" fill="#000" stroke="none"/>
  </svg>
);

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [officialMessagesSent, setOfficialMessagesSent] = useState(false);

  const MENURU_OFFICIAL: ChatUser = {
    id: "official_menuru",
    name: "Menuru Official",
    email: "official@menuru.com",
    photoURL: "",
    isOfficial: true,
    isPinned: false
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
      text: "Terima kasih atas pengertiannya! 😊",
      senderId: "official_menuru",
      senderName: "Menuru Official"
    }
  ];

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
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              id: currentUser.uid,
              name: currentUser.displayName || currentUser.email,
              email: currentUser.email,
              photoURL: currentUser.photoURL || "",
              createdAt: serverTimestamp(),
              isPinned: false,
              isOfficial: false,
              online: true,
              lastSeen: serverTimestamp()
            });
          } else {
            // Update online status
            await updateDoc(userRef, {
              online: true,
              lastSeen: serverTimestamp()
            });
            
            // Set offline on disconnect
            const disconnectRef = doc(db, "users", currentUser.uid);
            onDisconnect(disconnectRef).update({
              online: false,
              lastSeen: serverTimestamp()
            });
          }
          
          await checkAndSendOfficialMessages(currentUser.uid);
          
        } catch (error) {
          console.error("Error saving user:", error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const checkAndSendOfficialMessages = async (userId: string) => {
    if (!db || officialMessagesSent) return;
    
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
        
        setOfficialMessagesSent(true);
      } else {
        setOfficialMessagesSent(true);
      }
    } catch (error) {
      console.error("Error sending official messages:", error);
    }
  };

  // Load users + online status
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
                lastSeen: data.lastSeen || null
              } as ChatUser);
            }
          });
          
          const officialExists = userList.some(u => u.id === MENURU_OFFICIAL.id);
          if (!officialExists) {
            userList.push({ ...MENURU_OFFICIAL, online: true });
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
    });

    return () => unsubscribe();
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
        lastSeen: serverTimestamp()
      });
      
      await signOut(auth);
      setIsChatOpen(false);
      setSelectedChat(null);
      setChatRooms([]);
      setTotalUnread(0);
      setOfficialMessagesSent(false);
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
    }
  };

  // Send message with reply
  const handleSendMessage = async () => {
    if (!selectedChat || !user || !message.trim() || !db) return;

    try {
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
      
      // Add reply data if replying
      if (replyTo) {
        msgData.replyTo = replyTo.id;
        msgData.replyToText = replyTo.text;
        msgData.replyToSender = replyTo.senderName;
      }
      
      await addDoc(messagesRef, msgData);

      setMessage("");
      setReplyTo(null);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Share message to another user
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
        text: `📤 Dibagikan dari ${shareMessage.senderName}: ${shareMessage.text}`,
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
    } catch (error) {
      console.error("Error pinning message:", error);
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

  const getMessageStatus = (msg: Message) => {
    if (msg.senderId !== user?.uid) return null;
    if (msg.read && msg.readAt) {
      return { icon: "✓✓", color: "#0095f6", label: "Dibaca" };
    }
    return { icon: "✓", color: "#999", label: "Terkirim" };
  };

  const getOnlineStatus = (userId: string) => {
    const chatUser = users.find(u => u.id === userId);
    if (!chatUser) return false;
    return chatUser.online || false;
  };

  const getLastSeen = (userId: string) => {
    const chatUser = users.find(u => u.id === userId);
    if (!chatUser || !chatUser.lastSeen) return "";
    const date = chatUser.lastSeen.toDate ? chatUser.lastSeen.toDate() : new Date(chatUser.lastSeen);
    return `Terakhir online ${date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const pinnedUsers = users.filter(u => u.isPinned);
  const pinnedChats = chatRooms.filter(r => r.isPinned);
  const unpinnedChats = chatRooms.filter(r => !r.isPinned);
  const availableUsers = users.filter(u => 
    !chatRooms.some(room => room.participants.includes(u.id))
  );

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
      {/* Logo - Kiri Atas */}
      <div
        style={{
          position: "absolute",
          top: "40px",
          left: "40px",
          zIndex: 10,
          fontSize: "56px",
          fontWeight: 400,
          color: "#000",
          letterSpacing: "-0.02em",
          lineHeight: 1,
        }}
      >
        Menuru
      </div>

      {/* Teks "menuru" besar */}
      <div
        style={{
          position: "absolute",
          top: "120px",
          right: "-80px",
          zIndex: 1,
          fontSize: "300px",
          fontWeight: 400,
          color: "#000",
          letterSpacing: "-0.02em",
          lineHeight: 0.9,
          fontFamily: "Inter, 'Inter Fallback'",
          userSelect: "none",
          pointerEvents: "none",
          textAlign: "right",
          textTransform: "lowercase",
          whiteSpace: "nowrap",
        }}
      >
        menuru
      </div>

      {/* User Status */}
      <div
        style={{
          position: "absolute",
          top: "40px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: "16px",
          padding: "8px 20px",
          backgroundColor: "#f5f5f5",
          borderRadius: "60px",
          fontSize: "14px",
          color: "#000",
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
                  borderRadius: "50%",
                  objectFit: "cover"
                }}
              />
            )}
            <span style={{ fontWeight: 500, color: "#000" }}>{user.displayName || user.email}</span>
            <span style={{ fontSize: "10px", color: "#4ade80" }}>● Online</span>
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
              borderRadius: "20px",
              padding: "40px",
              maxWidth: "400px",
              width: "90%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: "24px", fontWeight: 600, color: "#000", marginBottom: "20px" }}>
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
              borderRadius: "20px",
              padding: "30px",
              maxWidth: "400px",
              width: "90%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#000", marginBottom: "12px" }}>
              Bagikan Pesan
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
                  {u.name} {u.isOfficial ? "⭐ Official" : ""}
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
                }}
              >
                Bagikan
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
                }}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Box */}
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
              borderRadius: "20px",
              width: "560px",
              maxHeight: "700px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
              border: "1px solid rgba(0,0,0,0.04)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "18px 24px",
                borderBottom: "1px solid rgba(0,0,0,0.04)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "#000",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#fff",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {selectedChat ? selectedChat.name : "Pesan"}
                </span>
                {selectedChat && (
                  <>
                    <span style={{ fontSize: "10px", color: "#999" }}>
                      {selectedChat.email}
                    </span>
                    <span style={{ 
                      fontSize: "10px", 
                      color: getOnlineStatus(selectedChat.id) ? "#4ade80" : "#666",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}>
                      <span style={{ 
                        display: "inline-block",
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: getOnlineStatus(selectedChat.id) ? "#4ade80" : "#666"
                      }} />
                      {getOnlineStatus(selectedChat.id) ? "Online" : getLastSeen(selectedChat.id)}
                    </span>
                  </>
                )}
                {!selectedChat && totalUnread > 0 && (
                  <span
                    style={{
                      backgroundColor: "#c5e800",
                      color: "#000",
                      borderRadius: "50%",
                      padding: "2px 8px",
                      fontSize: "10px",
                      fontWeight: 700,
                    }}
                  >
                    {totalUnread}
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#fff",
                  padding: "4px 8px",
                  borderRadius: "8px",
                  transition: "all .2s ease",
                  opacity: 0.6,
                  display: "flex",
                  alignItems: "center",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
                  e.currentTarget.style.opacity = "1";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.opacity = "0.6";
                }}
              >
                <CloseIcon />
              </button>
            </div>

            {/* Content */}
            {!selectedChat ? (
              <div style={{ padding: "8px 12px", overflowY: "auto", flex: 1, maxHeight: "600px" }}>
                {/* Announcement */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 16px",
                    backgroundColor: "#f8f8f8",
                    borderRadius: "12px",
                    marginBottom: "12px",
                    border: "1px solid #e8e8e8",
                  }}
                >
                  <AnnouncementIcon />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#000" }}>
                      Pengumuman
                    </div>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      Fitur chat sedang dalam tahap pengembangan. 
                      Mohon maaf atas ketidaknyamanannya.
                    </div>
                  </div>
                </div>

                {/* Add User Button */}
                <button
                  onClick={() => setShowAddUser(!showAddUser)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 16px",
                    backgroundColor: "#f8f8f8",
                    border: "1px dashed #ccc",
                    borderRadius: "12px",
                    cursor: "pointer",
                    width: "100%",
                    marginBottom: "12px",
                    transition: "all .2s ease",
                    color: "#000",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f0f0f0";
                    e.currentTarget.style.borderColor = "#c5e800";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#f8f8f8";
                    e.currentTarget.style.borderColor = "#ccc";
                  }}
                >
                  <AddUserIcon />
                  <span style={{ fontSize: "13px", fontWeight: 500, color: "#000" }}>Chat Baru</span>
                </button>

                {showAddUser && (
                  <div
                    style={{
                      padding: "16px",
                      backgroundColor: "#f8f8f8",
                      borderRadius: "12px",
                      marginBottom: "12px",
                    }}
                  >
                    <div style={{ fontSize: "14px", fontWeight: 500, color: "#000", marginBottom: "12px" }}>
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
                      <option value="" style={{ color: "#000" }}>Pilih user...</option>
                      {availableUsers.map((u) => (
                        <option key={u.id} value={u.id} style={{ color: "#000" }}>
                          {u.name} {u.isOfficial ? "⭐ Official" : ""} ({u.online ? "🟢 Online" : "⚪ Offline"})
                        </option>
                      ))}
                    </select>
                    {availableUsers.length === 0 && (
                      <div style={{ fontSize: "12px", color: "#666", marginBottom: "8px" }}>
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
                        }}
                      >
                        Batal
                      </button>
                    </div>
                    {addUserStatus && (
                      <div style={{ fontSize: "12px", color: "#000", marginTop: "8px" }}>
                        {addUserStatus}
                      </div>
                    )}
                  </div>
                )}

                {/* Pinned Users */}
                {pinnedUsers.length > 0 && (
                  <div style={{ marginBottom: "12px" }}>
                    <div
                      onClick={() => setShowPinnedUsers(!showPinnedUsers)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 12px",
                        cursor: "pointer",
                        backgroundColor: "#f8f8f8",
                        borderRadius: "8px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <PinIcon filled={true} />
                        <span style={{ fontSize: "12px", fontWeight: 500, color: "#000" }}>
                          User Pinned ({pinnedUsers.length})
                        </span>
                      </div>
                      <PinDropdownIcon isOpen={showPinnedUsers} />
                    </div>
                    {showPinnedUsers && (
                      <div style={{ padding: "4px 0", marginTop: "4px" }}>
                        {pinnedUsers.map((u) => (
                          <div
                            key={u.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                              padding: "8px 12px",
                              borderRadius: "8px",
                              backgroundColor: "#fafafa",
                            }}
                          >
                            <div
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                backgroundColor: "#f0f0f0",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "14px",
                                overflow: "hidden",
                              }}
                            >
                              {u.photoURL ? (
                                <img src={u.photoURL} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              ) : (
                                <span style={{ color: "#000" }}>{u.name?.charAt(0)?.toUpperCase() || "👤"}</span>
                              )}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: "13px", fontWeight: 500, color: "#000" }}>
                                {u.name}
                                {u.isOfficial && (
                                  <span style={{ 
                                    fontSize: "9px", 
                                    color: "#c5e800", 
                                    marginLeft: "6px",
                                    fontWeight: 600,
                                    backgroundColor: "rgba(197,232,0,0.1)",
                                    padding: "2px 6px",
                                    borderRadius: "4px"
                                  }}>
                                    Official
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: "10px", color: "#666" }}>
                                {u.email} • {u.online ? "🟢 Online" : "⚪ Offline"}
                              </div>
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
                  <div style={{ marginBottom: "12px" }}>
                    <div
                      onClick={() => setShowPinnedChats(!showPinnedChats)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 12px",
                        cursor: "pointer",
                        backgroundColor: "#f8f8f8",
                        borderRadius: "8px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <PinIcon filled={true} />
                        <span style={{ fontSize: "12px", fontWeight: 500, color: "#000" }}>
                          Chat Pinned ({pinnedChats.length})
                        </span>
                      </div>
                      <PinDropdownIcon isOpen={showPinnedChats} />
                    </div>
                    {showPinnedChats && (
                      <div style={{ padding: "4px 0", marginTop: "4px" }}>
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
                                gap: "12px",
                                padding: "8px 12px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                backgroundColor: "#fafafa",
                              }}
                            >
                              <div
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  borderRadius: "50%",
                                  backgroundColor: "#f0f0f0",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "14px",
                                  overflow: "hidden",
                                }}
                              >
                                {otherUser.photoURL ? (
                                  <img src={otherUser.photoURL} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                ) : (
                                  <span style={{ color: "#000" }}>{otherUser.name?.charAt(0)?.toUpperCase() || "👤"}</span>
                                )}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: "13px", fontWeight: 500, color: "#000" }}>
                                  {otherUser.name}
                                  {otherUser.isOfficial && (
                                    <span style={{ 
                                      fontSize: "9px", 
                                      color: "#c5e800", 
                                      marginLeft: "6px",
                                      fontWeight: 600,
                                      backgroundColor: "rgba(197,232,0,0.1)",
                                      padding: "2px 6px",
                                      borderRadius: "4px"
                                    }}>
                                      Official
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontSize: "10px", color: "#666" }}>
                                  {otherUser.online ? "🟢 Online" : "⚪ Offline"} • {room.lastMessage ? room.lastMessage.substring(0, 30) + (room.lastMessage.length > 30 ? "..." : "") : "Belum ada pesan"}
                                </div>
                              </div>
                              {room.unreadCount > 0 && (
                                <div
                                  style={{
                                    backgroundColor: "#c5e800",
                                    color: "#000",
                                    borderRadius: "50%",
                                    minWidth: "18px",
                                    height: "18px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "9px",
                                    fontWeight: 700,
                                    padding: "0 4px",
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

                {/* Chat Rooms List */}
                <div style={{ padding: "4px 0" }}>
                  {unpinnedChats.length === 0 && pinnedChats.length === 0 ? (
                    <div
                      style={{
                        textAlign: "center",
                        color: "#666",
                        fontSize: "13px",
                        padding: "40px 0",
                      }}
                    >
                      <div style={{ fontSize: "28px", marginBottom: "8px" }}>💬</div>
                      <div style={{ color: "#666" }}>Belum ada riwayat chat</div>
                      <div style={{ fontSize: "12px", marginTop: "4px", color: "#999" }}>
                        Mulai chat dengan user lain
                      </div>
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
                            gap: "12px",
                            padding: "12px 14px",
                            borderRadius: "12px",
                            cursor: "pointer",
                            transition: "all .2s ease",
                            marginBottom: "2px",
                            backgroundColor: room.unreadCount > 0 ? "rgba(197,232,0,0.08)" : "transparent",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = room.unreadCount > 0 ? "rgba(197,232,0,0.15)" : "#f5f5f5";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = room.unreadCount > 0 ? "rgba(197,232,0,0.08)" : "transparent";
                          }}
                        >
                          <div
                            style={{
                              width: "44px",
                              height: "44px",
                              borderRadius: "50%",
                              backgroundColor: "#f0f0f0",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "18px",
                              flexShrink: 0,
                              overflow: "hidden",
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
                            <div
                              style={{
                                position: "absolute",
                                bottom: 0,
                                right: 0,
                                width: "12px",
                                height: "12px",
                                borderRadius: "50%",
                                backgroundColor: getOnlineStatus(otherUser.id) ? "#4ade80" : "#666",
                                border: "2px solid #fff",
                              }}
                            />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "15px", fontWeight: 500, color: "#000" }}>
                              {otherUser.name}
                              {otherUser.isOfficial && (
                                <span style={{ 
                                  fontSize: "9px", 
                                  color: "#c5e800", 
                                  marginLeft: "6px",
                                  fontWeight: 600,
                                  backgroundColor: "rgba(197,232,0,0.1)",
                                  padding: "2px 6px",
                                  borderRadius: "4px"
                                }}>
                                  Official
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: "12px", color: "#666", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
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
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                            {room.lastMessageTime && (
                              <span style={{ fontSize: "10px", color: "#999" }}>
                                {formatTime(room.lastMessageTime)}
                              </span>
                            )}
                            <div style={{ display: "flex", gap: "4px" }}>
                              {room.unreadCount > 0 && (
                                <div
                                  style={{
                                    backgroundColor: "#c5e800",
                                    color: "#000",
                                    borderRadius: "50%",
                                    minWidth: "20px",
                                    height: "20px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "10px",
                                    fontWeight: 700,
                                    padding: "0 6px",
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
                                  color: room.isPinned ? "#c5e800" : "#ccc",
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
              // Chat View - Diperbesar
              <div style={{ display: "flex", flexDirection: "column", height: "560px" }}>
                {/* Chat Header */}
                <div
                  style={{
                    padding: "12px 20px",
                    borderBottom: "1px solid rgba(0,0,0,0.04)",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    backgroundColor: "#000",
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
                      color: "#fff",
                      padding: "4px 6px",
                      borderRadius: "8px",
                      transition: "all .2s ease",
                      opacity: 0.6,
                      display: "flex",
                      alignItems: "center",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
                      e.currentTarget.style.opacity = "1";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.opacity = "0.6";
                    }}
                  >
                    <BackIcon />
                  </button>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      backgroundColor: "#2a2a2a",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "16px",
                      overflow: "hidden",
                      color: "#fff",
                      position: "relative",
                    }}
                  >
                    {selectedChat.photoURL ? (
                      <img 
                        src={selectedChat.photoURL} 
                        alt="avatar" 
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <span style={{ color: "#fff" }}>{selectedChat.name?.charAt(0)?.toUpperCase() || "👤"}</span>
                    )}
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        backgroundColor: getOnlineStatus(selectedChat.id) ? "#4ade80" : "#666",
                        border: "2px solid #000",
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "15px", fontWeight: 500, color: "#fff" }}>
                      {selectedChat.name}
                      {selectedChat.isOfficial && (
                        <span style={{ 
                          fontSize: "9px", 
                          color: "#c5e800", 
                          marginLeft: "6px",
                          fontWeight: 600
                        }}>
                          Official
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "10px", color: "#999" }}>
                      {selectedChat.online ? "🟢 Online" : `⚪ ${getLastSeen(selectedChat.id)}`}
                    </div>
                  </div>
                  <button
                    onClick={() => handlePinUser(selectedChat.id, selectedChat.isPinned || false)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: selectedChat.isPinned ? "#c5e800" : "#666",
                      padding: "4px 8px",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      transition: "all .2s ease",
                    }}
                  >
                    <PinIcon filled={selectedChat.isPinned || false} />
                  </button>
                </div>

                {/* Reply Indicator */}
                {replyTo && (
                  <div
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#0a0a0a",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <ReplyIcon />
                      <div>
                        <div style={{ fontSize: "11px", color: "#c5e800", fontWeight: 500 }}>
                          Membalas {replyTo.senderName === user.displayName ? "diri sendiri" : replyTo.senderName}
                        </div>
                        <div style={{ fontSize: "12px", color: "#999" }}>
                          {replyTo.text.length > 40 ? replyTo.text.substring(0, 40) + "..." : replyTo.text}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setReplyTo(null)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#666",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* Messages - Background hitam */}
                <div
                  style={{
                    flex: 1,
                    padding: "20px",
                    overflowY: "auto",
                    backgroundColor: "#000000",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  {messages.length === 0 ? (
                    <div
                      style={{
                        textAlign: "center",
                        color: "#666",
                        fontSize: "13px",
                        marginTop: "60px",
                      }}
                    >
                      <div style={{ fontSize: "28px", marginBottom: "8px" }}>💬</div>
                      <div style={{ color: "#888" }}>Belum ada pesan</div>
                      <div style={{ fontSize: "11px", marginTop: "4px", color: "#555" }}>
                        Kirim pesan pertama
                      </div>
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isMine = msg.senderId === user?.uid;
                      const status = getMessageStatus(msg);
                      const chatId = [user.uid, selectedChat.id].sort().join("_");
                      const showDate = idx === 0 || !messages[idx-1]?.timestamp || 
                        formatDate(msg.timestamp) !== formatDate(messages[idx-1]?.timestamp);
                      
                      return (
                        <React.Fragment key={idx}>
                          {showDate && (
                            <div
                              style={{
                                textAlign: "center",
                                color: "#fff",
                                fontSize: "11px",
                                padding: "8px 0 12px 0",
                                fontWeight: 500,
                                letterSpacing: "0.03em",
                                backgroundColor: "rgba(255,255,255,0.05)",
                                borderRadius: "4px",
                                marginBottom: "4px",
                              }}
                            >
                              {formatDate(msg.timestamp)}
                            </div>
                          )}
                          <div
                            style={{
                              alignSelf: isMine ? "flex-end" : "flex-start",
                              maxWidth: "85%",
                              padding: "12px 16px",
                              borderRadius: isMine ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                              backgroundColor: isMine ? "#c5e800" : "#2a2a2a",
                              color: isMine ? "#000" : "#fff",
                              fontSize: "15px",
                              lineHeight: 1.6,
                              position: "relative",
                              border: msg.isPinned ? "2px solid #c5e800" : "none",
                            }}
                          >
                            {/* Reply preview */}
                            {msg.replyTo && msg.replyToText && (
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: isMine ? "rgba(0,0,0,0.5)" : "#888",
                                  padding: "4px 8px",
                                  borderLeft: `2px solid ${isMine ? "#000" : "#555"}`,
                                  marginBottom: "6px",
                                  backgroundColor: isMine ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)",
                                  borderRadius: "4px",
                                }}
                              >
                                <span style={{ fontWeight: 500 }}>
                                  {msg.replyToSender === user.displayName ? "Anda" : msg.replyToSender}:
                                </span>
                                {msg.replyToText}
                              </div>
                            )}
                            
                            {msg.text}
                            
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                marginTop: "6px",
                                justifyContent: isMine ? "flex-end" : "flex-start",
                                flexWrap: "wrap",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "9px",
                                  color: isMine ? "rgba(0,0,0,0.4)" : "#666",
                                }}
                              >
                                {formatTime(msg.timestamp)}
                              </span>
                              {isMine && status && (
                                <span
                                  style={{
                                    fontSize: "10px",
                                    color: status.color,
                                    fontWeight: status.label === "Dibaca" ? 700 : 400,
                                  }}
                                >
                                  {status.icon}
                                </span>
                              )}
                              <button
                                onClick={() => setReplyTo(msg)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  color: isMine ? "rgba(0,0,0,0.4)" : "#666",
                                  padding: "2px 4px",
                                  display: "flex",
                                  alignItems: "center",
                                  transition: "all .2s ease",
                                }}
                                title="Reply"
                              >
                                <ReplyIcon />
                              </button>
                              <button
                                onClick={() => {
                                  setShareMessage(msg);
                                  setShowShareModal(true);
                                }}
                                style={{
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  color: isMine ? "rgba(0,0,0,0.4)" : "#666",
                                  padding: "2px 4px",
                                  display: "flex",
                                  alignItems: "center",
                                  transition: "all .2s ease",
                                }}
                                title="Share"
                              >
                                <ShareIcon />
                              </button>
                              <button
                                onClick={() => handlePinMessage(chatId, msg.id, msg.isPinned || false)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  color: msg.isPinned ? "#c5e800" : "#555",
                                  padding: "2px 4px",
                                  display: "flex",
                                  alignItems: "center",
                                  transition: "all .2s ease",
                                }}
                                title={msg.isPinned ? "Unpin message" : "Pin message"}
                              >
                                <PinIcon filled={msg.isPinned || false} />
                              </button>
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
                                fontWeight: 600,
                                letterSpacing: "0.03em",
                              }}
                            >
                              <PinIcon filled={true} />
                              <span style={{ color: "#c5e800" }}>Pinned • {formatTime(msg.pinnedAt || msg.timestamp)}</span>
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
                    padding: "12px 16px 16px",
                    borderTop: "1px solid rgba(0,0,0,0.04)",
                    display: "flex",
                    gap: "10px",
                    backgroundColor: "#ffffff",
                  }}
                >
                  <input
                    type="text"
                    placeholder={replyTo ? "Ketik balasan..." : "Ketik pesan..."}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: "12px 18px",
                      border: replyTo ? "2px solid #c5e800" : "1px solid #e8e8e8",
                      borderRadius: "60px",
                      fontSize: "15px",
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
                      e.currentTarget.style.borderColor = replyTo ? "#c5e800" : "#e8e8e8";
                      e.currentTarget.style.backgroundColor = "#f5f5f5";
                    }}
                  />
                  <button
                    onClick={handleSendMessage}
                    style={{
                      backgroundColor: "#c5e800",
                      border: "none",
                      padding: "12px 24px",
                      borderRadius: "60px",
                      fontSize: "15px",
                      fontWeight: 500,
                      color: "#000",
                      cursor: "pointer",
                      transition: "all .2s ease",
                      whiteSpace: "nowrap",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#b0d000";
                      e.currentTarget.style.transform = "scale(1.02)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#c5e800";
                      e.currentTarget.style.transform = "scale(1)";
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
            gap: "10px",
            backgroundColor: isChatOpen ? "transparent" : "#000",
            padding: isChatOpen ? "0" : "14px 28px",
            borderRadius: "60px",
            border: "none",
            cursor: "pointer",
            transition: "all .4s cubic-bezier(0.34, 1.56, 0.64, 1)",
            boxShadow: isChatOpen ? "none" : "0 8px 32px rgba(0,0,0,0.12)",
            userSelect: "none",
            fontFamily: "Inter, 'Inter Fallback'",
            position: "relative",
          }}
          onMouseEnter={(e) => {
            if (!isChatOpen) {
              e.currentTarget.style.transform = "scale(1.04)";
              e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.18)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isChatOpen) {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.12)";
            }
          }}
        >
          {!isChatOpen && (
            <>
              <span
                style={{
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "#ffffff",
                  letterSpacing: "-0.01em",
                  lineHeight: 1,
                  whiteSpace: "nowrap",
                }}
              >
                {user ? "Chat with Menuru" : "Login to Chat"}
              </span>
              {totalUnread > 0 && (
                <span
                  style={{
                    backgroundColor: "#c5e800",
                    color: "#000",
                    borderRadius: "50%",
                    minWidth: "20px",
                    height: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "10px",
                    fontWeight: 700,
                    padding: "0 6px",
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
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
