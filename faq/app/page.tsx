'use client';

import React, { useState, useEffect, useRef, useCallback } from "react";
import { initializeApp, getApps } from "firebase/app";
import { motion, AnimatePresence } from 'framer-motion';
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
  limit,
  increment
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

// Font Family
const FONT_FAMILY = "var(--font-geist-sans), 'GeistSans', 'GeistSans Fallback'";

// Admin Email
const ADMIN_EMAIL = "faridardiansyah061@gmail.com";
const OFFICIAL_EMAIL = "official@menuru.com";
const OFFICIAL_ID = "official_menuru";

// Cooldown untuk prevent spam (3 detik)
const SEND_COOLDOWN = 3000;

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
  isAdmin?: boolean;
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
  delivered: boolean;
  deliveredAt?: any;
  isPinned?: boolean;
  pinnedAt?: any;
  replyTo?: string;
  replyToText?: string;
  replyToSender?: string;
  sharedFrom?: string;
  sharedFromName?: string;
  isShared?: boolean;
  isAdminReply?: boolean;
  adminReplyTo?: string;
  targetUserId?: string;
  targetUserName?: string;
  messageCount?: number;
}

interface ChatRoom {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageTime?: any;
  lastMessageSenderId?: string;
  unreadCount: number;
  isPinned?: boolean;
  hasAdminReply?: boolean;
  messageCount?: number;
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

const ChatIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const AwwwardsDot = ({ color = "#4ade80", isActive = false, size = 10 }: { color?: string; isActive?: boolean; size?: number }) => {
  return (
    <div style={{ 
      position: "relative", 
      display: "inline-flex", 
      alignItems: "center", 
      justifyContent: "center",
      width: `${size}px`,
      height: `${size}px`,
    }}>
      {isActive && (
        <div
          style={{
            position: "absolute",
            width: `${size * 2.8}px`,
            height: `${size * 2.8}px`,
            borderRadius: "50%",
            backgroundColor: color,
            opacity: 0.20,
            animation: "awwwardsPulse 2s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
      )}
      
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: "50%",
          backgroundColor: color,
          position: "relative",
          zIndex: 2,
          transition: "all 0.3s ease",
        }}
      />
    </div>
  );
};

const OnlineIndicator = ({ online, lastSeen }: { online: boolean; lastSeen?: string }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const color = online ? "#4ade80" : "#999";
  
  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        style={{ cursor: "pointer" }}
      >
        <AwwwardsDot color={color} isActive={online} size={8} />
      </div>
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

// Read Status Component dengan 1, 2, 2 biru
const ReadStatus = ({ msg, isMine }: { msg: Message; isMine: boolean }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  if (!isMine) return null;
  
  const status = (() => {
    if (msg.senderId !== auth?.currentUser?.uid) return null;
    if (msg.read && msg.readAt) {
      return { icon: "✓✓", color: "#0095f6", label: "Read" };
    }
    if (msg.delivered && msg.deliveredAt) {
      return { icon: "✓✓", color: "#999", label: "Delivered" };
    }
    return { icon: "✓", color: "#999", label: "Sent" };
  })();
  
  if (!status) return null;
  
  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <span 
        style={{
          fontSize: "10px",
          color: status.color,
          fontWeight: status.label === "Read" ? 600 : 400,
          cursor: "pointer",
          fontFamily: FONT_FAMILY,
          letterSpacing: "0.5px",
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
          border: "1px solid rgba(255,255,255,0.05)",
          fontFamily: FONT_FAMILY,
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
  const [adminReplyMode, setAdminReplyMode] = useState(false);
  const [adminReplyMessage, setAdminReplyMessage] = useState("");
  const [selectedUserForReply, setSelectedUserForReply] = useState<string | null>(null);
  const [selectedUserNameForReply, setSelectedUserNameForReply] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  const [lastSendTime, setLastSendTime] = useState<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const rollingInterval = useRef<NodeJS.Timeout | null>(null);
  const messageIdsSet = useRef<Set<string>>(new Set());
  const allMessagesMap = useRef<Map<string, Message>>(new Map());

  // Banner rolling text
  const [bannerTextIndex, setBannerTextIndex] = useState(0);
  const bannerTexts = [
    "Website sedang dalam pengembangan, Terima kasih",
    "silahkan hubungin official menuru"
  ];

  // Update Page
  const [showUpdate, setShowUpdate] = useState(false);
  const [selectedUpdateId, setSelectedUpdateId] = useState<string | null>(null);
  
  // Privacy Policy
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  // Chat button text
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
      title: "Real-time Chat Feature",
      description: "Added real-time chat feature with Firebase. Users can send and receive messages instantly.",
      date: "10 July 2026",
      status: "live",
      detail: "Real-time chat feature allows users to communicate directly without refreshing the page. Uses Firebase Realtime Database for instant message synchronization. Equipped with online status and typing indicators.",
      link: "https://menuru.com/update/chat-realtime",
      publishedBy: "Menuru Team"
    },
    {
      id: "2",
      title: "Privacy Policy & Update System",
      description: "Added Privacy Policy and Update System pages for service transparency.",
      date: "9 July 2026",
      status: "live",
      detail: "Privacy Policy page explains how user data is collected and used. Update System displays feature update history transparently to users.",
      link: "https://menuru.com/update/privacy-policy",
      publishedBy: "Menuru Team"
    },
    {
      id: "3",
      title: "Pin Message Feature",
      description: "Users can pin important messages in chat. Pinned messages will appear at the top.",
      date: "8 July 2026",
      status: "coming",
      detail: "Pin message feature allows users to pin important messages for easy access. Pinned messages will appear at the top of chat with a special indicator.",
      link: "https://menuru.com/update/pin-message",
      publishedBy: "Menuru Team"
    },
    {
      id: "4",
      title: "Reply & Share Message Feature",
      description: "Users can reply to and forward messages to other users easily.",
      date: "7 July 2026",
      status: "done",
      detail: "Reply feature allows users to reply to specific messages with clear context. Share feature allows users to forward messages to other contacts easily.",
      link: "https://menuru.com/update/reply-share",
      publishedBy: "Menuru Team"
    },
    {
      id: "5",
      title: "Online Status & Typing Indicator",
      description: "Shows user online status and typing indicator.",
      date: "6 July 2026",
      status: "done",
      detail: "Shows user online status in real-time. Typing indicator appears when user is typing a message, providing a more interactive chat experience.",
      link: "https://menuru.com/update/online-status",
      publishedBy: "Menuru Team"
    }
  ];

  const MENURU_OFFICIAL: ChatUser = {
    id: "official_menuru",
    name: "Menuru Official",
    email: "official@menuru.com",
    photoURL: "",
    isOfficial: true,
    isPinned: false,
    bio: "Official Menuru Chat account. Managed by the Menuru team.",
    note: "Official Account"
  };

  const OFFICIAL_MESSAGES = [
    {
      text: "Hello! Welcome to Menuru Chat",
      senderId: "official_menuru",
      senderName: "Menuru Official"
    },
    {
      text: "We are currently improving the chat feature. Please be patient!",
      senderId: "official_menuru",
      senderName: "Menuru Official"
    },
    {
      text: "Pin message and chat history features will be improved soon",
      senderId: "official_menuru",
      senderName: "Menuru Official"
    },
    {
      text: "Don't forget to read our Privacy Policy and Updates",
      senderId: "official_menuru",
      senderName: "Menuru Official"
    },
    {
      text: "Thank you for your understanding!",
      senderId: "official_menuru",
      senderName: "Menuru Official"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setBannerTextIndex((prev) => (prev + 1) % bannerTexts.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const isAdmin = user?.email === ADMIN_EMAIL;
  const isOfficialUser = user?.email === OFFICIAL_EMAIL;

  // Broadcast messages to all users (only once)
  const broadcastMessages = async () => {
    if (!db) return;
    
    try {
      const broadcastRef = doc(db, "system", "broadcast");
      const broadcastSnap = await getDoc(broadcastRef);
      
      if (broadcastSnap.exists() && broadcastSnap.data().messagesSent) {
        return;
      }
      
      const usersRef = collection(db, "users");
      const usersSnap = await getDocs(usersRef);
      
      const broadcastMessage = {
        text: "Don't forget to read our Privacy Policy and Updates",
        senderId: "official_menuru",
        senderName: "Menuru Official"
      };
      
      for (const docSnap of usersSnap.docs) {
        const userId = docSnap.id;
        const userData = docSnap.data();
        
        const chatId = [userId, OFFICIAL_ID].sort().join("_");
        const chatRef = doc(db, "chats", chatId);
        const chatSnap = await getDoc(chatRef);
        
        if (!chatSnap.exists()) {
          await setDoc(chatRef, {
            participants: [userId, OFFICIAL_ID],
            createdAt: serverTimestamp(),
            isPinned: false,
            messageCount: 0
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
          readAt: null,
          delivered: false,
          deliveredAt: null,
          isPinned: false,
          pinnedAt: null,
          replyTo: null,
          replyToText: null,
          replyToSender: null,
          isShared: false,
          isAdminReply: false,
          targetUserId: userId,
          targetUserName: userData.name || "User",
          messageCount: 1
        });
        
        await updateDoc(chatRef, {
          messageCount: increment(1)
        });
      }
      
      await setDoc(broadcastRef, {
        messagesSent: true,
        sentAt: serverTimestamp()
      });
      
      console.log("Broadcast messages sent to all users");
    } catch (error) {
      console.error("Error broadcasting messages:", error);
    }
  };

  useEffect(() => {
    if (!db) return;
    broadcastMessages();
  }, []);

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
              note: "",
              isAdmin: isAdminUser
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
                lastSeen: serverTimestamp(),
                isAdmin: isAdminUser
              });
            }
            
            await updateDoc(userRef, {
              online: true,
              lastSeen: serverTimestamp(),
              isAdmin: isAdminUser
            });
          }
          
          const updatedSnap = await getDoc(userRef);
          const updatedData = updatedSnap.data();
          if (updatedData) {
            setUser((prev: any) => ({
              ...prev,
              photoURL: updatedData.photoURL || prev.photoURL || "",
              displayName: updatedData.name || prev.displayName || prev.email,
              bio: updatedData.bio || "",
              note: updatedData.note || "",
              isAdmin: updatedData.isAdmin || false
            }));
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
    if (!db) return;
    
    try {
      const chatId = [userId, OFFICIAL_ID].sort().join("_");
      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);
      
      if (!chatSnap.exists()) {
        await setDoc(chatRef, {
          participants: [userId, OFFICIAL_ID],
          createdAt: serverTimestamp(),
          isPinned: false,
          messageCount: 0
        });
        
        const messagesRef = collection(db, "chats", chatId, "messages");
        for (let i = 0; i < OFFICIAL_MESSAGES.length; i++) {
          const msg = OFFICIAL_MESSAGES[i];
          await addDoc(messagesRef, {
            text: msg.text,
            senderId: msg.senderId,
            senderName: msg.senderName,
            receiverId: userId,
            timestamp: serverTimestamp(),
            read: false,
            readAt: null,
            delivered: false,
            deliveredAt: null,
            isPinned: false,
            pinnedAt: null,
            replyTo: null,
            replyToText: null,
            replyToSender: null,
            isShared: false,
            isAdminReply: false,
            targetUserId: userId,
            targetUserName: user?.displayName || user?.email || "User",
            messageCount: i + 1
          });
        }
        
        await updateDoc(chatRef, {
          messageCount: OFFICIAL_MESSAGES.length
        });
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
                photoURL: data.photoURL || "",
                isAdmin: data.isAdmin || false
              } as ChatUser);
            }
          });
          
          const selfUser: ChatUser = {
            id: user.uid,
            name: user.displayName || user.email || "Me",
            email: user.email || "",
            photoURL: user.photoURL || "",
            isPinned: false,
            isOfficial: false,
            online: true,
            lastSeen: null,
            typing: false,
            bio: user.bio || "",
            note: user.note || "",
            isAdmin: user.isAdmin || false
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
                note: user.note || userList[index].note || "",
                isAdmin: user.isAdmin || false
              };
            }
          }
          
          const officialExists = userList.some(u => u.id === OFFICIAL_ID);
          if (!officialExists) {
            userList.push({ ...MENURU_OFFICIAL, online: true, typing: false, isAdmin: false });
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
            const qMsg = query(messagesRef, orderBy("timestamp", "desc"), limit(1));
            const msgSnap = await getDocs(qMsg);
            
            let lastMessage = "";
            let lastMessageTime = null;
            let lastMessageSenderId = "";
            let unreadCount = 0;
            let hasAdminReply = false;
            
            if (!msgSnap.empty) {
              const lastMsg = msgSnap.docs[0].data() as Message;
              lastMessage = lastMsg.text;
              lastMessageTime = lastMsg.timestamp;
              lastMessageSenderId = lastMsg.senderId;
              hasAdminReply = lastMsg.isAdminReply || false;
            }
            
            const unreadQuery = query(
              messagesRef, 
              where("read", "==", false),
              where("senderId", "!=", user.uid)
            );
            const unreadSnap = await getDocs(unreadQuery);
            unreadCount = unreadSnap.size;
            totalUnreadCount += unreadCount;
            
            if (unreadCount > 0 && otherUser) {
              const unreadDocs = unreadSnap.docs;
              for (const doc of unreadDocs) {
                const msg = doc.data() as Message;
                newMessages.push(`Message from ${otherUser.name}: ${msg.text.substring(0, 25)}${msg.text.length > 25 ? '...' : ''}`);
              }
            }
            
            rooms.push({
              id: docSnap.id,
              participants: data.participants,
              lastMessage,
              lastMessageTime,
              lastMessageSenderId,
              unreadCount: Math.min(unreadCount, 99),
              isPinned: data.isPinned || false,
              hasAdminReply,
              messageCount: data.messageCount || 0
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
      setTotalUnread(Math.min(totalUnreadCount, 99));

      if (totalUnreadCount > 0 && newMessages.length > 0) {
        setIsIncomingMessage(true);
        setIncomingMessagesList(newMessages.slice(0, 5));
        setCurrentMessageIndex(0);
        setChatButtonText(newMessages[0]);
        
        if (rollingInterval.current) {
          clearInterval(rollingInterval.current);
          rollingInterval.current = null;
        }
        
        let index = 0;
        rollingInterval.current = setInterval(() => {
          index = (index + 1) % Math.min(newMessages.length, 5);
          setCurrentMessageIndex(index);
          setChatButtonText(newMessages[index]);
        }, 3000);
        
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

  // ============ LOAD MESSAGES ============
  // Khusus untuk Admin yang chat dengan Menuru Official
  // Admin melihat SEMUA pesan dari SEMUA user yang chat dengan Menuru Official
  useEffect(() => {
    if (!selectedChat || !user || !db) return;

    // Jika admin dan chat dengan Menuru Official
    if (isAdmin && selectedChat.id === OFFICIAL_ID) {
      // Bersihkan map sebelumnya
      allMessagesMap.current.clear();
      
      // Listener untuk chat admin dengan official
      const adminChatId = [user.uid, OFFICIAL_ID].sort().join("_");
      const adminMessagesRef = collection(db, "chats", adminChatId, "messages");
      const adminQ = query(adminMessagesRef, orderBy("timestamp", "asc"));
      
      const unsubscribeAdmin = onSnapshot(adminQ, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const msg = { id: change.doc.id, ...change.doc.data() } as Message;
          if (change.type === 'added' || change.type === 'modified') {
            allMessagesMap.current.set(msg.id, msg);
          } else if (change.type === 'removed') {
            allMessagesMap.current.delete(msg.id);
          }
        });
        
        // Update messages
        updateAdminMessages();
      });
      
      // Listener untuk setiap user yang chat dengan official
      const allUsers = users.filter(u => u.id !== user.uid && u.id !== OFFICIAL_ID);
      const unsubscribes: (() => void)[] = [];
      
      for (const targetUser of allUsers) {
        const userChatId = [targetUser.id, OFFICIAL_ID].sort().join("_");
        const userMessagesRef = collection(db, "chats", userChatId, "messages");
        const userQ = query(userMessagesRef, orderBy("timestamp", "asc"));
        
        const unsubscribe = onSnapshot(userQ, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            const msg = { id: change.doc.id, ...change.doc.data() } as Message;
            if (!msg.targetUserId) {
              msg.targetUserId = targetUser.id;
              msg.targetUserName = targetUser.name;
            }
            
            if (change.type === 'added' || change.type === 'modified') {
              allMessagesMap.current.set(msg.id, msg);
            } else if (change.type === 'removed') {
              allMessagesMap.current.delete(msg.id);
            }
          });
          
          updateAdminMessages();
        });
        
        unsubscribes.push(unsubscribe);
      }
      
      const updateAdminMessages = () => {
        const sortedMessages = Array.from(allMessagesMap.current.values())
          .sort((a, b) => {
            const timeA = a.timestamp?.seconds || 0;
            const timeB = b.timestamp?.seconds || 0;
            return timeA - timeB;
          })
          .slice(-300);
        
        setMessages(sortedMessages);
        setPinnedMessages(sortedMessages.filter(m => m.isPinned));
        
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      };
      
      return () => {
        unsubscribeAdmin();
        unsubscribes.forEach(unsub => unsub());
        allMessagesMap.current.clear();
      };
    }
    
    // ============ USER BIASA CHAT ============
    const chatId = [user.uid, selectedChat.id].sort().join("_");
    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const messageList: Message[] = [];
      const pinnedList: Message[] = [];
      const uniqueIds = new Set<string>();
      
      snapshot.forEach((doc) => {
        if (!uniqueIds.has(doc.id)) {
          uniqueIds.add(doc.id);
          const msg = { id: doc.id, ...doc.data() } as Message;
          messageList.push(msg);
          if (msg.isPinned) {
            pinnedList.push(msg);
          }
        }
      });
      
      const limitedMessages = messageList.slice(-200);
      setMessages(limitedMessages);
      setPinnedMessages(pinnedList);
      
      // Mark messages sebagai delivered dan read
      const unreadMessages = limitedMessages.filter(m => !m.read && m.senderId !== user.uid);
      const undeliveredMessages = limitedMessages.filter(m => !m.delivered && m.senderId !== user.uid);
      
      for (const msg of undeliveredMessages) {
        const msgRef = doc(db, "chats", chatId, "messages", msg.id);
        await updateDoc(msgRef, {
          delivered: true,
          deliveredAt: serverTimestamp()
        });
      }
      
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
  }, [selectedChat, user, isAdmin, users]);

  // Real-time typing listener untuk semua user
  useEffect(() => {
    if (!db || !user) return;
    
    const usersRef = collection(db, "users");
    const q = query(usersRef);
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const typingMap = new Map<string, boolean>();
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.id && data.id !== user.uid) {
          typingMap.set(data.id, data.typing || false);
        }
      });
      
      setUsers(prev => prev.map(u => {
        if (typingMap.has(u.id)) {
          return { ...u, typing: typingMap.get(u.id) };
        }
        return u;
      }));
    });
    
    return () => unsubscribe();
  }, [user]);

  // Handle login
  const handleLogin = async () => {
    if (!auth) return;
    try {
      await signInWithPopup(auth, googleProvider);
      setShowLogin(false);
      setLoginError("");
    } catch (error) {
      console.error("Login error:", error);
      setLoginError("Login failed. Please try again.");
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
      setLoginError("Wrong email or password.");
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
      setAdminReplyMode(false);
      messageIdsSet.current.clear();
      allMessagesMap.current.clear();
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
      setAdminReplyMode(false);
      setAdminReplyMessage("");
      setSelectedUserForReply(null);
      setSelectedUserNameForReply("");
      messageIdsSet.current.clear();
      allMessagesMap.current.clear();
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
    }, 3000);
    
    setTypingTimeout(newTimeout);
  };

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

  // ============ SEND MESSAGE ============
  // User biasa kirim pesan ke official
  // Admin juga bisa kirim pesan ke official (tapi ini untuk testing)
  const handleSendMessage = async () => {
    if (!selectedChat || !user || !message.trim() || !db) return;
    if (isSending) return;
    
    const now = Date.now();
    if (now - lastSendTime < SEND_COOLDOWN) {
      return;
    }
    
    setIsSending(true);
    setLastSendTime(now);

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { typing: false });
      
      const targetId = selectedChat.id;
      const chatId = [user.uid, targetId].sort().join("_");
      
      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);
      if (!chatSnap.exists()) {
        await setDoc(chatRef, {
          participants: [user.uid, targetId],
          createdAt: serverTimestamp(),
          isPinned: false,
          messageCount: 0
        });
      }
      
      const chatData = chatSnap.data();
      const currentCount = chatData?.messageCount || 0;
      
      const messagesRef = collection(db, "chats", chatId, "messages");
      const msgData: any = {
        text: message.trim(),
        senderId: user.uid,
        senderName: user.displayName || user.email || "User",
        receiverId: targetId,
        timestamp: serverTimestamp(),
        read: false,
        readAt: null,
        delivered: false,
        deliveredAt: null,
        isPinned: false,
        pinnedAt: null,
        isShared: false,
        isAdminReply: false,
        targetUserId: user.uid,
        targetUserName: user.displayName || user.email || "User",
        messageCount: currentCount + 1
      };
      
      if (replyTo) {
        msgData.replyTo = replyTo.id;
        msgData.replyToText = replyTo.text;
        msgData.replyToSender = replyTo.senderName;
      }
      
      await addDoc(messagesRef, msgData);
      
      await updateDoc(chatRef, {
        messageCount: increment(1),
        lastMessage: message.trim(),
        lastMessageTime: serverTimestamp(),
        lastMessageSenderId: user.uid
      });

      setMessage("");
      setReplyTo(null);
      
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
    } finally {
      setTimeout(() => {
        setIsSending(false);
      }, 1000);
    }
  };

  // ============ ADMIN REPLY ============
  // Admin membalas user tertentu melalui Menuru Official
  const handleAdminReplyToUser = async () => {
    if (!isAdmin || !adminReplyMessage.trim() || !selectedUserForReply || !db) return;
    if (isSending) return;
    
    const now = Date.now();
    if (now - lastSendTime < SEND_COOLDOWN) {
      return;
    }
    
    setIsSending(true);
    setLastSendTime(now);
    
    try {
      // Kirim balasan ke chat user dengan official
      const chatId = [selectedUserForReply, OFFICIAL_ID].sort().join("_");
      
      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);
      if (!chatSnap.exists()) {
        await setDoc(chatRef, {
          participants: [selectedUserForReply, OFFICIAL_ID],
          createdAt: serverTimestamp(),
          isPinned: false,
          messageCount: 0
        });
      }
      
      const chatData = chatSnap.data();
      const currentCount = chatData?.messageCount || 0;
      
      const messagesRef = collection(db, "chats", chatId, "messages");
      await addDoc(messagesRef, {
        text: adminReplyMessage.trim(),
        senderId: OFFICIAL_ID, // Kirim sebagai Menuru Official
        senderName: "Menuru Official",
        receiverId: selectedUserForReply,
        timestamp: serverTimestamp(),
        read: false,
        readAt: null,
        delivered: false,
        deliveredAt: null,
        isPinned: false,
        pinnedAt: null,
        isShared: false,
        isAdminReply: true,
        adminReplyTo: selectedUserForReply,
        targetUserId: selectedUserForReply,
        targetUserName: selectedUserNameForReply || "User",
        replyTo: null,
        replyToText: `Balasan untuk ${selectedUserNameForReply || "User"}`,
        replyToSender: "Admin",
        messageCount: currentCount + 1
      });
      
      await updateDoc(chatRef, {
        messageCount: increment(1),
        lastMessage: adminReplyMessage.trim(),
        lastMessageTime: serverTimestamp(),
        lastMessageSenderId: OFFICIAL_ID
      });
      
      // Juga tambahkan ke chat admin untuk visibilitas
      const adminChatId = [user.uid, OFFICIAL_ID].sort().join("_");
      const adminMessagesRef = collection(db, "chats", adminChatId, "messages");
      await addDoc(adminMessagesRef, {
        text: `[Balasan untuk ${selectedUserNameForReply || "User"}] ${adminReplyMessage.trim()}`,
        senderId: OFFICIAL_ID,
        senderName: "Menuru Official",
        receiverId: user.uid,
        timestamp: serverTimestamp(),
        read: true,
        readAt: serverTimestamp(),
        delivered: true,
        deliveredAt: serverTimestamp(),
        isPinned: false,
        pinnedAt: null,
        isShared: false,
        isAdminReply: true,
        adminReplyTo: selectedUserForReply,
        targetUserId: selectedUserForReply,
        targetUserName: selectedUserNameForReply || "User",
        messageCount: 0
      });
      
      setAdminReplyMessage("");
      setAdminReplyMode(false);
      setSelectedUserForReply(null);
      setSelectedUserNameForReply("");
      
    } catch (error) {
      console.error("Error sending admin reply:", error);
    } finally {
      setTimeout(() => {
        setIsSending(false);
      }, 1000);
    }
  };

  const handleShareMessage = async () => {
    if (!shareMessage || !selectedShareUser || !user || !db) return;
    if (isSending) return;
    
    setIsSending(true);
    
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
          isPinned: false,
          messageCount: 0
        });
      }
      
      const messagesRef = collection(db, "chats", chatId, "messages");
      await addDoc(messagesRef, {
        text: `From ${shareMessage.senderName}: ${shareMessage.text}`,
        senderId: user.uid,
        senderName: user.displayName || user.email || "User",
        receiverId: targetUser.id,
        timestamp: serverTimestamp(),
        read: false,
        readAt: null,
        delivered: false,
        deliveredAt: null,
        isPinned: false,
        pinnedAt: null,
        isShared: true,
        sharedFrom: shareMessage.senderId,
        sharedFromName: shareMessage.senderName,
        isAdminReply: false,
        targetUserId: targetUser.id,
        targetUserName: targetUser.name,
        messageCount: 0
      });
      
      setShowShareModal(false);
      setShareMessage(null);
      setSelectedShareUser("");
    } catch (error) {
      console.error("Error sharing message:", error);
    } finally {
      setTimeout(() => {
        setIsSending(false);
      }, 1000);
    }
  };

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

  const handleResendMessage = async (msg: Message) => {
    if (!selectedChat || !user || !db) return;
    if (isSending) return;
    
    setIsSending(true);
    
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
        readAt: null,
        delivered: false,
        deliveredAt: null,
        isPinned: false,
        pinnedAt: null,
        isShared: false,
        replyTo: null,
        replyToText: null,
        replyToSender: null,
        isAdminReply: false,
        targetUserId: user.uid,
        targetUserName: user.displayName || user.email || "User",
        messageCount: 0
      });
      
      setShowMessageMenu(null);
    } catch (error) {
      console.error("Error resending message:", error);
    } finally {
      setTimeout(() => {
        setIsSending(false);
      }, 1000);
    }
  };

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

  const handleAddExistingUser = async () => {
    if (!selectedNewUser || !user || !db) return;
    
    try {
      const targetUser = users.find(u => u.id === selectedNewUser);
      if (!targetUser) {
        setAddUserStatus("User not found");
        return;
      }
      
      const chatId = [user.uid, targetUser.id].sort().join("_");
      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);
      
      if (!chatSnap.exists()) {
        await setDoc(chatRef, {
          participants: [user.uid, targetUser.id],
          createdAt: serverTimestamp(),
          isPinned: false,
          messageCount: 0
        });
        setAddUserStatus(`Chat with ${targetUser.name} created!`);
      } else {
        setAddUserStatus(`Chat with ${targetUser.name} already exists.`);
      }
      
      setSelectedNewUser("");
      setShowAddUser(false);
      
    } catch (error) {
      console.error("Error adding user:", error);
      setAddUserStatus("Failed to add user.");
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
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
    return `Last seen ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const getTypingStatus = (userId: string) => {
    const chatUser = users.find(u => u.id === userId);
    if (!chatUser) return false;
    return chatUser.typing || false;
  };

  const pinnedUsers = users.filter(u => u.isPinned);
  const pinnedChats = chatRooms.filter(r => r.isPinned);
  const unpinnedChats = chatRooms.filter(r => !r.isPinned);
  const availableUsers = users.filter(u => 
    u.id !== user?.uid && !chatRooms.some(room => room.participants.includes(u.id))
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMessageMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        fontFamily: FONT_FAMILY,
      }}>
        <div style={{ fontSize: "18px", color: "#000", fontFamily: FONT_FAMILY }}>Loading...</div>
      </div>
    );
  }

  const selectedUpdate = updates.find(item => item.id === selectedUpdateId);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        margin: 0,
        padding: 0,
        position: "relative",
        fontFamily: FONT_FAMILY,
        overflow: "hidden",
      }}
    >
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
          gap: "12px",
        }}
      >
        <span style={{ color: "#ffffff", display: "flex", alignItems: "center" }}>
          <ChatIcon />
        </span>
        <AnimatePresence mode="wait">
          <motion.span
            key={bannerTextIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            style={{
              fontSize: "18px",
              fontWeight: 400,
              color: "#ffffff",
              fontFamily: FONT_FAMILY,
              letterSpacing: "-0.01em",
              textAlign: "center",
            }}
          >
            {bannerTexts[bannerTextIndex]}
          </motion.span>
        </AnimatePresence>
      </motion.div>

      {/* Menuru - Left Bottom */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        style={{
          position: "absolute",
          top: "70px",
          left: "40px",
          zIndex: 15,
          display: "flex",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: "30px",
            fontWeight: 400,
            color: "#000000",
            fontFamily: FONT_FAMILY,
            letterSpacing: "-0.03em",
            background: "transparent",
          }}
        >
          Menuru
        </span>
      </motion.div>

      {/* User Status */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{
          position: "absolute",
          top: "70px",
          right: "40px",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            padding: "8px 20px",
            backgroundColor: "#f5f5f5",
            borderRadius: "12px",
            fontSize: "20px",
            color: "#000",
            border: "1px solid #e0e0e0",
            fontFamily: FONT_FAMILY,
          }}
        >
          {user ? (
            <>
              {user.photoURL && (
                <motion.img 
                  src={user.photoURL} 
                  alt="avatar" 
                  whileHover={{ scale: 1.05 }}
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
                  fontFamily: FONT_FAMILY,
                }}
                onClick={() => {
                  const selfUser = users.find(u => u.id === user.uid);
                  if (selfUser) handleOpenProfile(selfUser);
                }}
              >
                {user.displayName || user.email}
                {isAdmin && " (Admin)"}
              </span>
              <OnlineIndicator online={true} />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
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
                  fontFamily: FONT_FAMILY,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#e0e0e0";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                Logout
              </motion.button>
            </>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
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
                fontFamily: FONT_FAMILY,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f0f0f0";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              Login
            </motion.button>
          )}
        </motion.div>
      </motion.div>

      {/* Login Modal */}
      <AnimatePresence>
        {showLogin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              style={{
                backgroundColor: "#fff",
                borderRadius: "12px",
                padding: "32px 36px",
                maxWidth: "400px",
                width: "90%",
                border: "1px solid #e0e0e0",
                boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
                fontFamily: FONT_FAMILY,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ fontSize: "24px", fontWeight: 600, color: "#000", marginBottom: "20px", fontFamily: FONT_FAMILY }}>
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
                  fontFamily: FONT_FAMILY,
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
                  fontFamily: FONT_FAMILY,
                  color: "#000",
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleEmailLogin()}
              />
              {loginError && (
                <div style={{ color: "#ef4444", fontSize: "12px", marginBottom: "12px", fontFamily: FONT_FAMILY }}>
                  {loginError}
                </div>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
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
                  fontFamily: FONT_FAMILY,
                }}
              >
                Login with Email
              </motion.button>
              <div style={{ marginTop: "12px", textAlign: "center", fontSize: "14px", color: "#666", fontFamily: FONT_FAMILY }}>
                or
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
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
                  fontFamily: FONT_FAMILY,
                }}
              >
                Login with Google
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && shareMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              style={{
                backgroundColor: "#fff",
                borderRadius: "12px",
                padding: "30px",
                maxWidth: "400px",
                width: "90%",
                border: "1px solid #e0e0e0",
                fontFamily: FONT_FAMILY,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#000", marginBottom: "12px", fontFamily: FONT_FAMILY }}>
                Forward Message
              </h3>
              <div style={{ 
                fontSize: "13px", 
                color: "#666", 
                marginBottom: "16px",
                padding: "10px",
                backgroundColor: "#f5f5f5",
                borderRadius: "8px",
                fontFamily: FONT_FAMILY,
              }}>
                <div style={{ fontWeight: 500, color: "#000", fontFamily: FONT_FAMILY }}>From: {shareMessage.senderName}</div>
                <div style={{ fontFamily: FONT_FAMILY }}>{shareMessage.text}</div>
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
                  fontFamily: FONT_FAMILY,
                  marginBottom: "12px",
                  backgroundColor: "#fff",
                  color: "#000",
                }}
              >
                <option value="">Select user...</option>
                {users.filter(u => u.id !== user.uid && u.id !== shareMessage.senderId).map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} {u.email === ADMIN_EMAIL ? "(Admin)" : ""}
                  </option>
                ))}
              </select>
              <div style={{ display: "flex", gap: "8px" }}>
                <motion.button
                  whileHover={selectedShareUser ? { scale: 1.02 } : {}}
                  whileTap={selectedShareUser ? { scale: 0.98 } : {}}
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
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  Forward
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
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
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", damping: 25 }}
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
                fontFamily: FONT_FAMILY,
              }}
            >
              {/* Header */}
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
                      fontFamily: FONT_FAMILY,
                    }}
                  >
                    {selectedUpdateId && selectedUpdate ? "Update Detail" : (showUpdate ? "Update System" : (showPrivacyPolicy ? "Privacy Policy" : (showProfile ? "Profile" : (selectedChat ? selectedChat.name : "Messages"))))}
                  </span>
                  {!showProfile && !showPrivacyPolicy && !showUpdate && !selectedUpdateId && selectedChat && (
                    <>
                      <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", fontFamily: FONT_FAMILY }}>
                        {selectedChat.email}
                      </span>
                      <OnlineIndicator 
                        online={getOnlineStatus(selectedChat.id)} 
                        lastSeen={getLastSeen(selectedChat.id)}
                      />
                      {getTypingStatus(selectedChat.id) && (
                        <span style={{ fontSize: "9px", color: "#4ade80", fontFamily: FONT_FAMILY, animation: "blink 1s infinite" }}>
                          typing...
                        </span>
                      )}
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
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      {totalUnread}
                    </span>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
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
                </motion.button>
              </div>

              {/* Update Detail Page */}
              {selectedUpdateId && selectedUpdate ? (
                <div
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "28px 32px",
                    backgroundColor: "#ffffff",
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", width: "100%" }}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
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
                        fontFamily: FONT_FAMILY,
                        marginBottom: "16px",
                        padding: "4px 0",
                        transition: "color 0.2s ease",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = "#000"}
                      onMouseLeave={(e) => e.currentTarget.style.color = "#666"}
                    >
                      <BackIcon />
                      <span>Back</span>
                    </motion.button>

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
                          fontFamily: FONT_FAMILY,
                        }}
                      >
                        {selectedUpdate.status === "live" ? "Live" : (selectedUpdate.status === "coming" ? "Coming Soon" : "Done")}
                      </span>
                    </div>

                    <h2
                      style={{
                        fontSize: "22px",
                        fontWeight: 600,
                        color: "#000000",
                        margin: "0 0 8px 0",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      {selectedUpdate.title}
                    </h2>

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
                          fontFamily: FONT_FAMILY,
                        }}
                      >
                        {selectedUpdate.date}
                      </span>
                      <span
                        style={{
                          fontSize: "13px",
                          color: "#999",
                          fontFamily: FONT_FAMILY,
                        }}
                      >
                        • {selectedUpdate.publishedBy}
                      </span>
                    </div>

                    <p
                      style={{
                        fontSize: "15px",
                        color: "#000000",
                        lineHeight: 1.8,
                        margin: "0 0 16px 0",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      {selectedUpdate.description}
                    </p>

                    <div
                      style={{
                        width: "100%",
                        marginBottom: "16px",
                        padding: "16px 20px",
                        backgroundColor: "#f8f8f8",
                        borderRadius: "10px",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      <h3
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#000000",
                          marginBottom: "8px",
                          fontFamily: FONT_FAMILY,
                        }}
                      >
                        Update Detail
                      </h3>
                      <p
                        style={{
                          fontSize: "14px",
                          color: "#333",
                          lineHeight: 1.8,
                          margin: 0,
                          fontFamily: FONT_FAMILY,
                        }}
                      >
                        {selectedUpdate.detail}
                      </p>
                    </div>

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
                          fontFamily: FONT_FAMILY,
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
                          fontFamily: FONT_FAMILY,
                          fontWeight: 500,
                        }}
                      >
                        {selectedUpdate.link}
                      </a>
                    </div>

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
                          fontFamily: FONT_FAMILY,
                        }}
                      >
                        Chat with Menuru v1.0
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          color: "#999",
                          fontFamily: FONT_FAMILY,
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
                    fontFamily: FONT_FAMILY,
                  }}
                >
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
                          fontFamily: FONT_FAMILY,
                        }}
                      >
                        Update System
                      </span>
                    </div>
                    <h2
                      style={{
                        fontSize: "22px",
                        fontWeight: 600,
                        color: "#000000",
                        margin: "0 0 4px 0",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      Chat with Menuru
                    </h2>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#999",
                        margin: "0",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      Update and development history
                    </p>
                  </div>

                  <div style={{ position: "relative", paddingLeft: "28px" }}>
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
                      const isActive = isLive || isComing;
                      
                      return (
                        <motion.div
                          key={item.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          style={{
                            position: "relative",
                            paddingBottom: index === updates.length - 1 ? "0" : "28px",
                            paddingLeft: "24px",
                            cursor: "pointer",
                          }}
                          onClick={() => setSelectedUpdateId(item.id)}
                        >
                          <div
                            style={{
                              position: "absolute",
                              left: "-22px",
                              top: "4px",
                              width: "14px",
                              height: "14px",
                              zIndex: 2,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {isActive && (
                              <div
                                style={{
                                  position: "absolute",
                                  width: "35px",
                                  height: "35px",
                                  borderRadius: "50%",
                                  backgroundColor: dotColor,
                                  opacity: 0.20,
                                  animation: "awwwardsPulse 2s ease-in-out infinite",
                                  pointerEvents: "none",
                                }}
                              />
                            )}
                            
                            <div
                              style={{
                                width: "10px",
                                height: "10px",
                                borderRadius: "50%",
                                backgroundColor: dotColor,
                                position: "relative",
                                zIndex: 3,
                              }}
                            />
                          </div>
                          
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
                          
                          <div style={{ padding: "0" }}>
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
                                  fontFamily: FONT_FAMILY,
                                  letterSpacing: "-0.01em",
                                }}
                              >
                                {item.title}
                              </div>
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
                        </motion.div>
                      );
                    })}
                  </div>

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
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      Chat with Menuru v1.0
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#999",
                        fontFamily: FONT_FAMILY,
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
                    fontFamily: FONT_FAMILY,
                  }}
                >
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
                          fontFamily: FONT_FAMILY,
                        }}
                      >
                        Privacy Policy
                      </span>
                    </div>
                    <h2
                      style={{
                        fontSize: "22px",
                        fontWeight: 600,
                        color: "#000000",
                        margin: "0 0 4px 0",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      Chat with Menuru
                    </h2>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#999",
                        margin: "0",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      Last updated: 9 July 2026
                    </p>
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <h3
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#000000",
                        marginBottom: "6px",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      1. Information We Collect
                    </h3>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#666",
                        lineHeight: 1.7,
                        margin: "0 0 6px 0",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      Chat with Menuru collects the following information to provide optimal chat service:
                    </p>
                    <ul
                      style={{
                        fontSize: "13px",
                        color: "#666",
                        lineHeight: 1.9,
                        paddingLeft: "20px",
                        margin: "0",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      <li>Name and email from your Google account</li>
                      <li>Profile photo from your Google account</li>
                      <li>Messages and chat history you send</li>
                      <li>Online status and chat activity</li>
                    </ul>
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <h3
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#000000",
                        marginBottom: "6px",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      2. How We Use Information
                    </h3>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#666",
                        lineHeight: 1.7,
                        margin: "0 0 6px 0",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      The information we collect is used for:
                    </p>
                    <ul
                      style={{
                        fontSize: "13px",
                        color: "#666",
                        lineHeight: 1.9,
                        paddingLeft: "20px",
                        margin: "0",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      <li>Providing and maintaining chat service</li>
                      <li>Sending messages between users</li>
                      <li>Displaying user online status</li>
                      <li>Storing chat history for future access</li>
                    </ul>
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <h3
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#000000",
                        marginBottom: "6px",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      3. Data Storage
                    </h3>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#666",
                        lineHeight: 1.7,
                        margin: 0,
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      All chat data is stored in Firebase Cloud Firestore database. Your data is secure and can only be accessed by you and the users you chat with.
                    </p>
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <h3
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#000000",
                        marginBottom: "6px",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      4. Security
                    </h3>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#666",
                        lineHeight: 1.7,
                        margin: 0,
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      We use Firebase Authentication for account security and Firestore Security Rules to protect your chat data. All communication is encrypted via HTTPS.
                    </p>
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <h3
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#000000",
                        marginBottom: "6px",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      5. Your Rights
                    </h3>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#666",
                        lineHeight: 1.7,
                        margin: "0 0 6px 0",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      You have the right to:
                    </p>
                    <ul
                      style={{
                        fontSize: "13px",
                        color: "#666",
                        lineHeight: 1.9,
                        paddingLeft: "20px",
                        margin: "0",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      <li>Access your personal data</li>
                      <li>Delete your account and chat data</li>
                      <li>Disable notifications</li>
                    </ul>
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <h3
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#000000",
                        marginBottom: "6px",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      6. Policy Changes
                    </h3>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#666",
                        lineHeight: 1.7,
                        margin: 0,
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      We may update this privacy policy from time to time. Changes will be notified through the chat application.
                    </p>
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <h3
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#000000",
                        marginBottom: "6px",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      7. Contact
                    </h3>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#666",
                        lineHeight: 1.7,
                        margin: "0 0 4px 0",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      If you have questions about this privacy policy, please contact us at:
                    </p>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#000000",
                        marginTop: "4px",
                        fontWeight: 500,
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      support@menuru.com
                    </p>
                  </div>

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
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      Chat with Menuru v1.0
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#999",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      © 2026 Menuru
                    </span>
                  </div>
                </div>
              ) : showProfile && profileUser ? (
                // Profile View
                <div style={{ padding: "24px 28px", overflowY: "auto", flex: 1, maxHeight: "640px", fontFamily: FONT_FAMILY }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", width: "100%" }}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
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
                        fontFamily: FONT_FAMILY,
                        marginBottom: "16px",
                        padding: "4px 0",
                        transition: "color 0.2s ease",
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = "#000"}
                      onMouseLeave={(e) => e.currentTarget.style.color = "#666"}
                    >
                      <BackIcon />
                      <span>Back</span>
                    </motion.button>

                    <div style={{ width: "100%", marginBottom: "0px" }}>
                      <div style={{ 
                        backgroundColor: "#f5f5f5", 
                        borderRadius: "8px",
                        padding: "8px 14px",
                        position: "relative",
                        marginBottom: "8px",
                        maxWidth: "280px",
                        fontFamily: FONT_FAMILY,
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
                            fontFamily: FONT_FAMILY,
                          }}>
                            <span style={{ 
                              display: "inline-block",
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              backgroundColor: "#c5e800",
                              marginRight: "4px",
                            }} />
                            Note
                          </span>
                          {profileUser.id === user?.uid && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
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
                                fontFamily: FONT_FAMILY,
                              }}
                            >
                              <EditIcon />
                              {profileUser.note ? "Edit" : "Add"}
                            </motion.button>
                          )}
                        </div>

                        {editNote && profileUser.id === user?.uid ? (
                          <div style={{ display: "flex", gap: "6px", alignItems: "center", marginTop: "4px" }}>
                            <input
                              type="text"
                              value={noteInput}
                              onChange={(e) => setNoteInput(e.target.value)}
                              placeholder="No note yet"
                              style={{
                                flex: 1,
                                padding: "6px 10px",
                                backgroundColor: "#fff",
                                border: "1px solid #e0e0e0",
                                borderRadius: "4px",
                                color: "#000",
                                fontSize: "12px",
                                outline: "none",
                                fontFamily: FONT_FAMILY,
                              }}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleSaveNote();
                                }
                              }}
                            />
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
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
                                fontFamily: FONT_FAMILY,
                                whiteSpace: "nowrap",
                              }}
                            >
                              Save
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setEditNote(false)}
                              style={{
                                padding: "4px 10px",
                                backgroundColor: "transparent",
                                border: "1px solid #e0e0e0",
                                borderRadius: "4px",
                                color: "#666",
                                fontSize: "11px",
                                cursor: "pointer",
                                fontFamily: FONT_FAMILY,
                              }}
                            >
                              Cancel
                            </motion.button>
                          </div>
                        ) : (
                          <div style={{ 
                            padding: "4px 0",
                            color: profileUser.note ? "#000" : "#999",
                            fontSize: "13px",
                            lineHeight: 1.4,
                            minHeight: "24px",
                            fontFamily: FONT_FAMILY,
                          }}>
                            {profileUser.note || "No note yet"}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px", width: "100%" }}>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
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
                          <span style={{ color: "#000", fontFamily: FONT_FAMILY }}>{profileUser.name?.charAt(0)?.toUpperCase() || "👤"}</span>
                        )}
                      </motion.div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <span style={{ fontSize: "18px", fontWeight: 500, color: "#000", fontFamily: FONT_FAMILY }}>
                            {profileUser.name}
                            {profileUser.isAdmin && " (Admin)"}
                          </span>
                        </div>
                        <span style={{ fontSize: "13px", color: "#999", fontFamily: FONT_FAMILY }}>{profileUser.email}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                          <OnlineIndicator online={getOnlineStatus(profileUser.id)} />
                          <span style={{ fontSize: "12px", color: "#666", fontFamily: FONT_FAMILY }}>
                            {getOnlineStatus(profileUser.id) ? "Online" : getLastSeen(profileUser.id)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ width: "100%", marginBottom: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                        <span style={{ fontSize: "10px", color: "#999", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase", fontFamily: FONT_FAMILY }}>
                          Bio
                        </span>
                        {profileUser.id === user?.uid && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
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
                              fontFamily: FONT_FAMILY,
                            }}
                          >
                            <EditIcon />
                            {profileUser.bio ? "Edit" : "Add"}
                          </motion.button>
                        )}
                      </div>
                      {editBio && profileUser.id === user?.uid ? (
                        <div>
                          <textarea
                            value={bioInput}
                            onChange={(e) => setBioInput(e.target.value)}
                            placeholder="No bio yet"
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
                              fontFamily: FONT_FAMILY,
                              resize: "vertical",
                            }}
                          />
                          <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={handleSaveBio}
                              style={{
                                padding: "4px 14px",
                                backgroundColor: "#000",
                                border: "none",
                                borderRadius: "4px",
                                color: "#fff",
                                fontSize: "12px",
                                cursor: "pointer",
                                fontFamily: FONT_FAMILY,
                              }}
                            >
                              Save
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setEditBio(false)}
                              style={{
                                padding: "4px 14px",
                                backgroundColor: "transparent",
                                border: "1px solid #e0e0e0",
                                borderRadius: "4px",
                                color: "#999",
                                fontSize: "12px",
                                cursor: "pointer",
                                fontFamily: FONT_FAMILY,
                              }}
                            >
                              Cancel
                            </motion.button>
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
                          fontFamily: FONT_FAMILY,
                        }}>
                          {profileUser.bio || "No bio yet"}
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: "8px", width: "100%" }}>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
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
                          fontFamily: FONT_FAMILY,
                          transition: "opacity 0.2s ease",
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                      >
                        Send Message
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
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
                          fontFamily: FONT_FAMILY,
                          transition: "all 0.2s ease",
                        }}
                      >
                        <PinIcon filled={profileUser.isPinned || false} />
                      </motion.button>
                    </div>
                  </div>
                </div>
              ) : !selectedChat ? (
                // Chat List View
                <div style={{ padding: "8px 12px", overflowY: "auto", flex: 1, maxHeight: "640px", fontFamily: FONT_FAMILY }}>
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
                      fontFamily: FONT_FAMILY,
                    }}
                  >
                    <div style={{ fontSize: "20px" }}>📢</div>
                    <div>
                      <div style={{ fontSize: "12px", fontWeight: 500, color: "#000", fontFamily: FONT_FAMILY }}>
                        Announcement
                      </div>
                      <div style={{ fontSize: "11px", color: "#666", fontFamily: FONT_FAMILY }}>
                        Chat feature is under development.
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
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
                      fontFamily: FONT_FAMILY,
                    }}
                  >
                    <span
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
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      New Chat
                    </span>
                  </motion.button>
                  
                  <AnimatePresence>
                    {showAddUser && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{
                          padding: "16px",
                          backgroundColor: "#f8f8f8",
                          borderRadius: "12px",
                          marginBottom: "12px",
                          overflow: "hidden",
                          fontFamily: FONT_FAMILY,
                        }}
                      >
                        <div style={{ fontSize: "13px", fontWeight: 500, color: "#000", marginBottom: "12px", fontFamily: FONT_FAMILY }}>
                          Select user
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
                            fontFamily: FONT_FAMILY,
                            marginBottom: "8px",
                            backgroundColor: "#fff",
                            color: "#000",
                          }}
                        >
                          <option value="">Select user...</option>
                          {availableUsers.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.name}
                            </option>
                          ))}
                        </select>
                        {availableUsers.length === 0 && (
                          <div style={{ fontSize: "11px", color: "#666", marginBottom: "8px", fontFamily: FONT_FAMILY }}>
                            All users are already in chat
                          </div>
                        )}
                        <div style={{ display: "flex", gap: "8px" }}>
                          <motion.button
                            whileHover={selectedNewUser ? { scale: 1.02 } : {}}
                            whileTap={selectedNewUser ? { scale: 0.98 } : {}}
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
                              fontFamily: FONT_FAMILY,
                            }}
                          >
                            Start Chat
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowAddUser(false)}
                            style={{
                              background: "none",
                              border: "none",
                              fontSize: "12px",
                              color: "#666",
                              cursor: "pointer",
                              fontFamily: FONT_FAMILY,
                            }}
                          >
                            Cancel
                          </motion.button>
                        </div>
                        {addUserStatus && (
                          <div style={{ fontSize: "11px", color: "#000", marginTop: "8px", fontFamily: FONT_FAMILY }}>
                            {addUserStatus}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

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
                          fontFamily: FONT_FAMILY,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <PinIcon filled={true} />
                          <span style={{ fontSize: "11px", fontWeight: 500, color: "#666", fontFamily: FONT_FAMILY }}>
                            Pinned Users ({pinnedUsers.length})
                          </span>
                        </div>
                        <PinDropdownIcon isOpen={showPinnedUsers} />
                      </div>
                      <AnimatePresence>
                        {showPinnedUsers && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{ padding: "4px 0", marginTop: "2px", overflow: "hidden" }}
                          >
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
                                  fontFamily: FONT_FAMILY,
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
                                    <span style={{ color: "#000", fontFamily: FONT_FAMILY }}>{u.name?.charAt(0)?.toUpperCase() || "👤"}</span>
                                  )}
                                </div>
                                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "6px" }}>
                                  <div>
                                    <div 
                                      style={{ fontSize: "12px", fontWeight: 500, color: "#000", cursor: "pointer", fontFamily: FONT_FAMILY }}
                                      onClick={() => handleOpenProfile(u)}
                                    >
                                      {u.name}
                                      {u.isAdmin && " (Admin)"}
                                    </div>
                                    <div style={{ fontSize: "9px", color: "#999", fontFamily: FONT_FAMILY }}>
                                      {u.email}
                                    </div>
                                  </div>
                                  <OnlineIndicator online={u.online || false} lastSeen={getLastSeen(u.id)} />
                                </div>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
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
                                </motion.button>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
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
                          fontFamily: FONT_FAMILY,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <PinIcon filled={true} />
                          <span style={{ fontSize: "11px", fontWeight: 500, color: "#666", fontFamily: FONT_FAMILY }}>
                            Pinned Chats ({pinnedChats.length})
                          </span>
                        </div>
                        <PinDropdownIcon isOpen={showPinnedChats} />
                      </div>
                      <AnimatePresence>
                        {showPinnedChats && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{ padding: "4px 0", marginTop: "2px", overflow: "hidden" }}
                          >
                            {pinnedChats.map((room) => {
                              const otherId = room.participants.find(id => id !== user.uid);
                              const otherUser = users.find(u => u.id === otherId);
                              if (!otherUser) return null;
                              return (
                                <motion.div
                                  key={room.id}
                                  whileHover={{ scale: 1.02 }}
                                  onClick={() => setSelectedChat(otherUser)}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    padding: "6px 10px",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    backgroundColor: "#fafafa",
                                    fontFamily: FONT_FAMILY,
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
                                      <span style={{ color: "#000", fontFamily: FONT_FAMILY }}>{otherUser.name?.charAt(0)?.toUpperCase() || "👤"}</span>
                                    )}
                                  </div>
                                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "6px" }}>
                                    <div>
                                      <div 
                                        style={{ fontSize: "12px", fontWeight: 500, color: "#000", cursor: "pointer", fontFamily: FONT_FAMILY }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleOpenProfile(otherUser);
                                        }}
                                      >
                                        {otherUser.name}
                                      </div>
                                      <div style={{ fontSize: "9px", color: "#999", fontFamily: FONT_FAMILY }}>
                                        {room.lastMessage ? room.lastMessage.substring(0, 25) + (room.lastMessage.length > 25 ? "..." : "") : "No messages"}
                                        {room.hasAdminReply && " [Admin replied]"}
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
                                        fontFamily: FONT_FAMILY,
                                      }}
                                    >
                                      {room.unreadCount}
                                    </div>
                                  )}
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
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
                                  </motion.button>
                                </motion.div>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
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
                          fontFamily: FONT_FAMILY,
                        }}
                      >
                        <div style={{ fontSize: "28px", marginBottom: "6px" }}>💬</div>
                        <div>No chat history</div>
                      </div>
                    ) : (
                      unpinnedChats.map((room) => {
                        const otherId = room.participants.find(id => id !== user.uid);
                        const otherUser = users.find(u => u.id === otherId);
                        if (!otherUser) return null;
                        
                        const isLastMessageFromMe = room.lastMessageSenderId === user.uid;
                        
                        return (
                          <motion.div
                            key={room.id}
                            whileHover={{ scale: 1.02 }}
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
                              fontFamily: FONT_FAMILY,
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
                                <span style={{ color: "#000", fontFamily: FONT_FAMILY }}>{otherUser.name?.charAt(0)?.toUpperCase() || "👤"}</span>
                              )}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: "14px", fontWeight: 500, color: "#000", display: "flex", alignItems: "center", gap: "4px", fontFamily: FONT_FAMILY }}>
                                <span 
                                  style={{ cursor: "pointer" }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenProfile(otherUser);
                                  }}
                                >
                                  {otherUser.name}
                                </span>
                                <OnlineIndicator online={otherUser.online || false} lastSeen={getLastSeen(otherUser.id)} />
                              </div>
                              <div style={{ fontSize: "11px", color: "#999", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: FONT_FAMILY }}>
                                {room.lastMessage ? (
                                  <>
                                    {isLastMessageFromMe ? "You: " : ""}
                                    {room.lastMessage}
                                    {room.hasAdminReply && " [Admin replied]"}
                                  </>
                                ) : (
                                  "No messages"
                                )}
                              </div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
                              {room.lastMessageTime && (
                                <span style={{ fontSize: "9px", color: "#bbb", fontFamily: FONT_FAMILY }}>
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
                                      fontFamily: FONT_FAMILY,
                                    }}
                                  >
                                    {room.unreadCount}
                                  </div>
                                )}
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
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
                                </motion.button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </div>
                </div>
              ) : (
                // ============ CHAT VIEW ============
                <div style={{ display: "flex", flexDirection: "column", height: "580px", fontFamily: FONT_FAMILY }}>
                  {/* Chat Header */}
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
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setSelectedChat(null);
                        setReplyTo(null);
                        setAdminReplyMode(false);
                        setSelectedUserForReply(null);
                        setSelectedUserNameForReply("");
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
                    </motion.button>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
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
                        <span style={{ fontFamily: FONT_FAMILY }}>{selectedChat.name?.charAt(0)?.toUpperCase() || "👤"}</span>
                      )}
                    </motion.div>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1px" }}>
                      <div 
                        style={{ display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}
                        onClick={() => handleOpenProfile(selectedChat)}
                      >
                        <span style={{ fontSize: "14px", fontWeight: 500, color: "#ffffff", fontFamily: FONT_FAMILY }}>
                          {selectedChat.name}
                          {selectedChat.isAdmin && " (Admin)"}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <OnlineIndicator 
                          online={getOnlineStatus(selectedChat.id)} 
                          lastSeen={getLastSeen(selectedChat.id)}
                        />
                        {selectedChat.id === OFFICIAL_ID && isAdmin && (
                          <span style={{ fontSize: "9px", color: "#4ade80", fontFamily: FONT_FAMILY }}>
                            Admin - Lihat semua pesan user
                          </span>
                        )}
                        {getOnlineStatus(selectedChat.id) ? (
                          <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.5)", fontFamily: FONT_FAMILY }}>
                            {getTypingStatus(selectedChat.id) ? "typing..." : "Online"}
                          </span>
                        ) : (
                          <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.5)", fontFamily: FONT_FAMILY }}>
                            {getLastSeen(selectedChat.id)}
                          </span>
                        )}
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
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
                    </motion.button>
                  </div>

                  {/* Admin Reply Mode Indicator */}
                  {isAdmin && selectedChat?.id === OFFICIAL_ID && adminReplyMode && (
                    <div
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "rgba(74, 222, 128, 0.1)",
                        borderBottom: "1px solid rgba(74, 222, 128, 0.2)",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      <span style={{ fontSize: "12px", color: "#4ade80", fontFamily: FONT_FAMILY }}>
                        Balas ke {selectedUserNameForReply || "User"}
                      </span>
                      <span style={{ fontSize: "11px", color: "#666", fontFamily: FONT_FAMILY }}>
                        Balasan akan dikirim ke user ini
                      </span>
                    </div>
                  )}

                  {/* Pinned Messages */}
                  {pinnedMessages.length > 0 && (
                    <div
                      style={{
                        padding: "6px 14px",
                        backgroundColor: "rgba(0,0,0,0.02)",
                        borderBottom: "1px solid rgba(0,0,0,0.04)",
                        fontFamily: FONT_FAMILY,
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
                          <span style={{ fontSize: "11px", fontWeight: 500, color: "#666", fontFamily: FONT_FAMILY }}>
                            Pinned Messages ({pinnedMessages.length})
                          </span>
                        </div>
                        <PinDropdownIcon isOpen={showPinnedMessages} />
                      </div>
                      <AnimatePresence>
                        {showPinnedMessages && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            style={{ marginTop: "6px", maxHeight: "120px", overflowY: "auto" }}
                          >
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
                                    fontFamily: FONT_FAMILY,
                                  }}
                                >
                                  <div style={{ flex: 1 }}>
                                    <span style={{ color: "#999", fontSize: "9px", fontFamily: FONT_FAMILY }}>
                                      {isMine ? "You: " : `${msg.targetUserName || msg.senderName}: `}
                                    </span>
                                    <span style={{ color: "#000", fontFamily: FONT_FAMILY }}>
                                      {msg.text.length > 40 ? msg.text.substring(0, 40) + "..." : msg.text}
                                    </span>
                                  </div>
                                  <span style={{ fontSize: "8px", color: "#bbb", marginLeft: "6px", fontFamily: FONT_FAMILY }}>
                                    {formatTime(msg.pinnedAt || msg.timestamp)}
                                  </span>
                                </div>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Reply Indicator */}
                  {replyTo && (
                    <div
                      style={{
                        padding: "4px 14px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <ReplyIcon />
                        <div>
                          <div style={{ fontSize: "10px", color: "#22c55e", fontWeight: 500, fontFamily: FONT_FAMILY }}>
                            Reply: {replyTo.senderName === user?.displayName ? "You" : replyTo.senderName}
                          </div>
                          <div style={{ fontSize: "11px", color: "#666", fontFamily: FONT_FAMILY }}>
                            {replyTo.text.length > 30 ? replyTo.text.substring(0, 30) + "..." : replyTo.text}
                          </div>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
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
                          fontFamily: FONT_FAMILY,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.04)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        ✕
                      </motion.button>
                    </div>
                  )}

                  {/* Messages dengan Read Receipts */}
                  <div
                    style={{
                      flex: 1,
                      padding: "16px 20px",
                      overflowY: "auto",
                      backgroundColor: "#ffffff",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                      fontFamily: FONT_FAMILY,
                    }}
                  >
                    {messages.length === 0 ? (
                      <div
                        style={{
                          textAlign: "center",
                          color: "#bbb",
                          fontSize: "13px",
                          marginTop: "60px",
                          fontFamily: FONT_FAMILY,
                        }}
                      >
                        <div style={{ fontSize: "28px", marginBottom: "6px" }}>💬</div>
                        <div>No messages yet</div>
                      </div>
                    ) : (
                      messages.map((msg, idx) => {
                        const isMine = msg.senderId === user?.uid;
                        const chatId = [user.uid, selectedChat.id].sort().join("_");
                        const showDate = idx === 0 || !messages[idx-1]?.timestamp || 
                          formatDate(msg.timestamp) !== formatDate(messages[idx-1]?.timestamp);
                        
                        const replySenderName = msg.replyToSender === user?.displayName ? "You" : msg.replyToSender;
                        const isBroadcastMessage = msg.senderId === "official_menuru" && msg.text.includes("Privacy Policy");
                        const isAdminReply = msg.isAdminReply || false;
                        
                        // Untuk admin: tampilkan nama pengirim asli
                        const displaySenderName = isAdmin && selectedChat?.id === OFFICIAL_ID && !isMine && !isAdminReply
                          ? (msg.targetUserName || msg.senderName)
                          : null;
                        
                        const isUserMessage = msg.senderId !== OFFICIAL_ID && msg.senderId !== user?.uid;
                        const msgNumber = msg.messageCount || (idx + 1);
                        
                        // Cek apakah pesan ini dari Menuru Official (balasan admin)
                        const isOfficialMessage = msg.senderId === OFFICIAL_ID;
                        
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
                                  fontFamily: FONT_FAMILY,
                                }}
                              >
                                {formatDate(msg.timestamp)}
                              </div>
                            )}
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              transition={{ duration: 0.2 }}
                              style={{
                                alignSelf: isMine ? "flex-end" : "flex-start",
                                maxWidth: "80%",
                                padding: "10px 14px",
                                borderRadius: "12px",
                                backgroundColor: isAdminReply ? "#4ade80" : (isMine ? "#c5e800" : "#f0f0f0"),
                                color: isAdminReply ? "#000" : (isMine ? "#000000" : "#000000"),
                                fontSize: "14px",
                                lineHeight: 1.5,
                                position: "relative",
                                border: msg.isPinned ? "1px solid #c5e800" : "none",
                                boxShadow: msg.isPinned ? "0 0 20px rgba(197,232,0,0.1)" : "none",
                                fontFamily: FONT_FAMILY,
                              }}
                            >
                              {/* Tampilkan nama pengirim untuk admin */}
                              {displaySenderName && isUserMessage && (
                                <div
                                  style={{
                                    fontSize: "11px",
                                    color: "#666",
                                    fontWeight: 600,
                                    marginBottom: "4px",
                                    fontFamily: FONT_FAMILY,
                                  }}
                                >
                                  {displaySenderName}
                                </div>
                              )}
                              
                              {msg.isShared && msg.sharedFromName && (
                                <div
                                  style={{
                                    fontSize: "10px",
                                    color: "rgba(0,0,0,0.4)",
                                    marginBottom: "4px",
                                    fontStyle: "italic",
                                    fontFamily: FONT_FAMILY,
                                  }}
                                >
                                  From {msg.sharedFromName}
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
                                    fontFamily: FONT_FAMILY,
                                  }}
                                >
                                  <span style={{ fontWeight: 500, color: "#22c55e", fontFamily: FONT_FAMILY }}>
                                    {isMine ? `Reply: ${replySenderName}` : `Reply: ${msg.replyToSender}`}
                                  </span>
                                  <span style={{ color: isMine ? "#000" : "#333", fontFamily: FONT_FAMILY }}> {msg.replyToText}</span>
                                </div>
                              )}
                              
                              {isAdminReply && !isMine && (
                                <div
                                  style={{
                                    fontSize: "10px",
                                    color: "#000",
                                    fontWeight: 500,
                                    marginBottom: "4px",
                                    fontFamily: FONT_FAMILY,
                                  }}
                                >
                                  Admin
                                </div>
                              )}
                              
                              {/* Pesan dengan nomor */}
                              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <span style={{ fontFamily: FONT_FAMILY }}>{msg.text}</span>
                                {!isMine && !isAdminReply && (
                                  <span style={{ 
                                    fontSize: "9px", 
                                    color: "rgba(0,0,0,0.3)", 
                                    fontFamily: FONT_FAMILY,
                                  }}>
                                    #{msgNumber}
                                  </span>
                                )}
                              </div>
                              
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  marginTop: "6px",
                                  justifyContent: isMine ? "flex-end" : "flex-start",
                                  flexWrap: "wrap",
                                  fontFamily: FONT_FAMILY,
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: "9px",
                                    color: "rgba(0,0,0,0.4)",
                                    fontWeight: 400,
                                    fontFamily: FONT_FAMILY,
                                  }}
                                >
                                  {formatTime(msg.timestamp)}
                                </span>
                                <ReadStatus msg={msg} isMine={isMine} />
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
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
                                </motion.button>
                                
                                <AnimatePresence>
                                  {showMessageMenu === msg.id && (
                                    <motion.div
                                      ref={menuRef}
                                      initial={{ opacity: 0, scale: 0.9, y: 5 }}
                                      animate={{ opacity: 1, scale: 1, y: 0 }}
                                      exit={{ opacity: 0, scale: 0.9, y: 5 }}
                                      transition={{ duration: 0.15 }}
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
                                        fontFamily: FONT_FAMILY,
                                      }}
                                    >
                                      <motion.button
                                        whileHover={{ backgroundColor: "#f5f5f5" }}
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
                                          fontFamily: FONT_FAMILY,
                                        }}
                                      >
                                        <ReplyIcon />
                                        <span>Reply</span>
                                      </motion.button>
                                      <motion.button
                                        whileHover={{ backgroundColor: "#f5f5f5" }}
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
                                          fontFamily: FONT_FAMILY,
                                        }}
                                      >
                                        <SendIcon />
                                        <span>Resend</span>
                                      </motion.button>
                                      <motion.button
                                        whileHover={{ backgroundColor: "#f5f5f5" }}
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
                                          fontFamily: FONT_FAMILY,
                                        }}
                                      >
                                        <ShareIcon />
                                        <span>Forward</span>
                                      </motion.button>
                                      <motion.button
                                        whileHover={{ backgroundColor: "#f5f5f5" }}
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
                                          fontFamily: FONT_FAMILY,
                                        }}
                                      >
                                        <PinIcon filled={msg.isPinned || false} />
                                        <span>{msg.isPinned ? "Unpin" : "Pin"}</span>
                                      </motion.button>
                                      {/* Tombol Balas User Ini - khusus untuk admin di chat official */}
                                      {isAdmin && selectedChat?.id === OFFICIAL_ID && !isAdminReply && !isMine && isUserMessage && (
                                        <motion.button
                                          whileHover={{ backgroundColor: "#f5f5f5" }}
                                          onClick={() => {
                                            setAdminReplyMode(true);
                                            setSelectedUserForReply(msg.targetUserId || msg.senderId);
                                            setSelectedUserNameForReply(msg.targetUserName || msg.senderName);
                                            setAdminReplyMessage(`Balasan untuk ${msg.targetUserName || msg.senderName}: ${msg.text}`);
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
                                            color: "#4ade80",
                                            fontSize: "12px",
                                            cursor: "pointer",
                                            borderRadius: "6px",
                                            transition: "all .2s ease",
                                            fontFamily: FONT_FAMILY,
                                          }}
                                        >
                                          <ReplyIcon />
                                          <span>Balas User Ini</span>
                                        </motion.button>
                                      )}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </motion.div>
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
                                  fontFamily: FONT_FAMILY,
                                }}
                              >
                                <PinIcon filled={true} />
                                <span>Pin • {formatTime(msg.pinnedAt || msg.timestamp)}</span>
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input dengan Typing Indicator */}
                  <div
                    style={{
                      padding: "10px 14px 14px",
                      borderTop: "1px solid rgba(0,0,0,0.04)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                      backgroundColor: "#ffffff",
                      fontFamily: FONT_FAMILY,
                    }}
                  >
                    {/* Typing indicator */}
                    {selectedChat && (getTypingStatus(selectedChat.id)) && (
                      <div style={{
                        padding: "2px 4px",
                        fontSize: "11px",
                        color: "#666",
                        fontFamily: FONT_FAMILY,
                        fontStyle: "italic",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}>
                        <span style={{ display: "flex", gap: "3px" }}>
                          <span style={{ animation: "typingDot 1.4s infinite", animationDelay: "0s" }}>•</span>
                          <span style={{ animation: "typingDot 1.4s infinite", animationDelay: "0.2s" }}>•</span>
                          <span style={{ animation: "typingDot 1.4s infinite", animationDelay: "0.4s" }}>•</span>
                        </span>
                        <span>{selectedChat.name} typing...</span>
                      </div>
                    )}

                    {isAdmin && selectedChat?.id === OFFICIAL_ID && adminReplyMode ? (
                      // ============ ADMIN REPLY INPUT ============
                      <div style={{ display: "flex", gap: "8px" }}>
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                          <div style={{ fontSize: "11px", color: "#4ade80", fontFamily: FONT_FAMILY }}>
                            Balas ke {selectedUserNameForReply}
                          </div>
                          <input
                            type="text"
                            placeholder="Ketik balasan admin..."
                            value={adminReplyMessage}
                            onChange={(e) => setAdminReplyMessage(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleAdminReplyToUser();
                              }
                            }}
                            style={{
                              width: "100%",
                              padding: "10px 16px",
                              border: "1px solid #4ade80",
                              borderRadius: "8px",
                              fontSize: "14px",
                              outline: "none",
                              fontFamily: FONT_FAMILY,
                              transition: "all .2s ease",
                              backgroundColor: "#f5f5f5",
                              color: "#000",
                            }}
                            onFocus={(e) => {
                              e.currentTarget.style.borderColor = "#4ade80";
                              e.currentTarget.style.backgroundColor = "#ffffff";
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.borderColor = "#4ade80";
                              e.currentTarget.style.backgroundColor = "#f5f5f5";
                            }}
                          />
                        </div>
                        <div style={{ display: "flex", gap: "6px", alignItems: "flex-end" }}>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleAdminReplyToUser}
                            disabled={!adminReplyMessage.trim() || !selectedUserForReply}
                            style={{
                              backgroundColor: adminReplyMessage.trim() && selectedUserForReply ? "#4ade80" : "#ccc",
                              border: "none",
                              padding: "10px 20px",
                              borderRadius: "8px",
                              fontSize: "14px",
                              fontWeight: 500,
                              color: adminReplyMessage.trim() && selectedUserForReply ? "#000" : "#666",
                              cursor: adminReplyMessage.trim() && selectedUserForReply ? "pointer" : "not-allowed",
                              transition: "all .2s ease",
                              whiteSpace: "nowrap",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              fontFamily: FONT_FAMILY,
                            }}
                          >
                            <span>Kirim</span>
                            <SendIcon />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setAdminReplyMode(false);
                              setAdminReplyMessage("");
                              setSelectedUserForReply(null);
                              setSelectedUserNameForReply("");
                            }}
                            style={{
                              backgroundColor: "transparent",
                              border: "1px solid #ddd",
                              padding: "10px 14px",
                              borderRadius: "8px",
                              fontSize: "13px",
                              color: "#666",
                              cursor: "pointer",
                              fontFamily: FONT_FAMILY,
                            }}
                          >
                            Batal
                          </motion.button>
                        </div>
                      </div>
                    ) : (
                      // ============ NORMAL CHAT INPUT ============
                      <div style={{ display: "flex", gap: "8px" }}>
                        <input
                          type="text"
                          placeholder={replyTo ? "Type a reply..." : "Type a message..."}
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
                            fontFamily: FONT_FAMILY,
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
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
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
                            fontFamily: FONT_FAMILY,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#b0d000";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#c5e800";
                          }}
                        >
                          <span>Send</span>
                          <SendIcon />
                        </motion.button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Button */}
        <motion.button
          whileHover={!isChatOpen ? { scale: 1.03 } : {}}
          whileTap={!isChatOpen ? { scale: 0.97 } : {}}
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
            fontFamily: FONT_FAMILY,
            position: "relative",
            maxWidth: "360px",
            overflow: "hidden",
          }}
        >
          {!isChatOpen && (
            <>
              <motion.span
                initial={{ opacity: 1 }}
                animate={{ 
                  opacity: isIncomingMessage ? [1, 0.7, 1] : 1,
                }}
                transition={{ 
                  duration: 0.5,
                  repeat: isIncomingMessage ? Infinity : 0,
                }}
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#ffffff",
                  letterSpacing: "-0.01em",
                  lineHeight: 1,
                  whiteSpace: "nowrap",
                  transition: "all 0.5s ease",
                  fontFamily: FONT_FAMILY,
                }}
              >
                {user ? chatButtonText : "Login to Chat"}
              </motion.span>
              {totalUnread > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 10 }}
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
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  {totalUnread}
                </motion.span>
              )}
            </>
          )}
        </motion.button>
      </div>

      <style jsx>{`
        @keyframes awwwardsPulse {
          0% {
            transform: scale(0.7);
            opacity: 0.25;
          }
          50% {
            transform: scale(1.6);
            opacity: 0.05;
          }
          100% {
            transform: scale(0.7);
            opacity: 0.25;
          }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes typingDot {
          0%, 60%, 100% {
            opacity: 0.3;
            transform: translateY(0);
          }
          30% {
            opacity: 1;
            transform: translateY(-4px);
          }
        }
      `}</style>
    </div>
  );
}
