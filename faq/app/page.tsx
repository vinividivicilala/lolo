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
  where,
  getDocs,
  updateDoc,
  arrayUnion,
  arrayRemove,
  deleteDoc
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

// Font Family - POPPINS
const FONT_FAMILY = "'Poppins', 'Poppins Fallback', sans-serif";

// Admin Email
const ADMIN_EMAIL = "faridardiansyah061@gmail.com";

// ===== ENKRIPSI SEDERHANA =====
const encryptMessage = (text: string, key: string = "menuru-secret-2026"): string => {
  let result = "";
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    result += String.fromCharCode(charCode);
  }
  return btoa(result);
};

const decryptMessage = (encrypted: string, key: string = "menuru-secret-2026"): string => {
  try {
    const decoded = atob(encrypted);
    let result = "";
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  } catch {
    return encrypted;
  }
};

// ===== GET GREETING BASED ON TIMEZONE =====
const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 10) return "Selamat pagi";
  if (hour >= 10 && hour < 15) return "Selamat siang";
  if (hour >= 15 && hour < 18) return "Selamat sore";
  return "Selamat malam";
};

interface ChatUser {
  id: string;
  name: string;
  email: string;
  photoURL: string;
  createdAt?: any;
  isPinned?: boolean;
  isAdmin?: boolean;
  online?: boolean;
  lastSeen?: any;
  typing?: boolean;
  blocked?: string[];
  blockedBy?: string[];
  isGroup?: boolean;
  groupName?: string;
  groupDescription?: string;
  groupMembers?: string[];
  groupAdmins?: string[];
  createdBy?: string;
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
  isGroupMessage?: boolean;
  groupId?: string | null;
  isSaved?: boolean;
  savedAt?: any;
  savedBy?: string[];
  encrypted?: boolean;
}

interface ChatRoom {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageTime?: any;
  lastMessageSenderId?: string;
  unreadCount: number;
  isPinned?: boolean;
  typingUsers?: string[];
  typingUsersId?: string[];
  isBlocked?: boolean;
  isGroup?: boolean;
  groupName?: string;
  groupDescription?: string;
  groupMembers?: string[];
  groupAdmins?: string[];
  createdBy?: string;
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

interface SavedMessage {
  id: string;
  messageId: string;
  chatId: string;
  text: string;
  senderName: string;
  senderId: string;
  timestamp: any;
  savedAt: any;
  isGroupMessage?: boolean;
  groupName?: string;
}

// ===== SVG ICONS =====
const NorthEastArrow = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 7L17 17M17 7V17H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

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

const ChatBubbleIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SearchIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M16 16L21 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const StoreIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 7H20M4 7L3 12H21L20 7M4 7L5 20H19L20 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 12V16H15V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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

const NotificationsIcon = ({ size = 24, hasBadge = false }: { size?: number; hasBadge?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: "relative" }}>
    <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    {hasBadge && (
      <circle cx="19" cy="5" r="5" fill="#ef4444" stroke="white" strokeWidth="2"/>
    )}
  </svg>
);

const SaveIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <path d="M19 21L12 16L5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill={filled ? "currentColor" : "none"} />
  </svg>
);

const GooglePinIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <path d="M12 2L15 9H21L16 14L18 21L12 17L6 21L8 14L3 9H9L12 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill={filled ? "currentColor" : "none"} />
  </svg>
);

const UserAvatarIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M5 20V19C5 15.6863 7.68629 13 11 13H13C16.3137 13 19 15.6863 19 19V20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
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
          verticalAlign: "middle",
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

// Online Status Indicator with Tooltip
const OnlineIndicator = ({ online, lastSeen }: { online: boolean; lastSeen?: string }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const pulseRef = useRef<HTMLDivElement>(null);
  const color = online ? "#0D3CFC" : "#999";
  
  useEffect(() => {
    if (online && pulseRef.current) {
      gsap.to(pulseRef.current, {
        scale: 2.5,
        opacity: 0.05,
        duration: 1.5,
        repeat: -1,
        ease: "power1.inOut",
        yoyo: true,
      });
    }
  }, [online]);
  
  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        style={{ cursor: "pointer" }}
      >
        <div style={{
          width: "10px",
          height: "10px",
          borderRadius: "50%",
          backgroundColor: color,
          position: "relative",
          transition: "all 0.3s ease",
          boxShadow: online ? "0 0 12px rgba(13,60,252,0.4)" : "none",
        }}>
          {online && (
            <div
              ref={pulseRef}
              style={{
                position: "absolute",
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                backgroundColor: color,
                opacity: 0.2,
                pointerEvents: "none",
                top: "0px",
                left: "0px",
              }}
            />
          )}
        </div>
      </div>
      {showTooltip && (
        <div style={{
          position: "absolute",
          bottom: "calc(100% + 10px)",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "#1a1a1a",
          color: "#ffffff",
          padding: "6px 14px",
          borderRadius: "8px",
          fontSize: "13px",
          fontWeight: 500,
          whiteSpace: "nowrap",
          zIndex: 100,
          border: "1px solid rgba(255,255,255,0.08)",
          fontFamily: FONT_FAMILY,
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}>
          {online ? "🟢 Online" : (lastSeen || "Offline")}
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

// Read Status with bright color
const ReadStatus = ({ msg, isMine }: { msg: Message; isMine: boolean }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  if (!isMine) return null;
  
  const status = (() => {
    if (msg.senderId !== auth?.currentUser?.uid) return null;
    if (msg.read && msg.readAt) {
      return { icon: "✓✓", color: "#00D4FF", label: "Dibaca", bg: "rgba(0,212,255,0.15)" };
    }
    return { icon: "✓", color: "#FFD700", label: "Terkirim", bg: "rgba(255,215,0,0.15)" };
  })();
  
  if (!status) return null;
  
  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <span 
        style={{
          fontSize: "11px",
          color: status.color,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: FONT_FAMILY,
          textShadow: "0 0 8px rgba(0,0,0,0.2)",
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
          padding: "4px 12px",
          borderRadius: "6px",
          fontSize: "12px",
          fontWeight: 500,
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

// Stories Component
const StoriesSection = ({ userEmail, onImageClick }: { userEmail: string; onImageClick: (url: string) => void }) => {
  const [storyImages] = useState([10, 11, 12, 13, 14, 15]);
  const isAdmin = userEmail === ADMIN_EMAIL;

  if (!isAdmin) return null;

  return (
    <div style={{ width: "100%", marginBottom: "16px" }}>
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "8px",
        borderBottom: "1px solid #f0f0f0",
        paddingBottom: "6px",
      }}>
        <span style={{ 
          fontSize: "14px", 
          fontWeight: 600, 
          color: "#000000", 
          fontFamily: FONT_FAMILY,
        }}>
          Photos
        </span>
        <span style={{ 
          fontSize: "11px", 
          color: "#999", 
          fontFamily: FONT_FAMILY,
        }}>
          {storyImages.length} photos
        </span>
      </div>
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(3, 1fr)", 
        gap: "6px",
      }}>
        {storyImages.map((num) => (
          <div
            key={num}
            style={{
              aspectRatio: "3/4",
              backgroundColor: "#f0f0f0",
              borderRadius: "8px",
              overflow: "hidden",
              border: "1px solid #e8e8e8",
              position: "relative",
              cursor: "pointer",
              transition: "transform 0.2s ease",
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            onClick={() => onImageClick(`/images/${num}.jpg`)}
          >
            <img
              src={`/images/${num}.jpg`}
              alt={`Photo ${num}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  parent.style.backgroundColor = "#f0f0f0";
                  parent.style.display = "flex";
                  parent.style.alignItems = "center";
                  parent.style.justifyContent = "center";
                  const span = document.createElement("span");
                  span.textContent = `${num}`;
                  span.style.color = "#999";
                  span.style.fontSize = "12px";
                  span.style.fontFamily = FONT_FAMILY;
                  parent.appendChild(span);
                }
              }}
            />
          </div>
        ))}
      </div>
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
  const [totalUnread, setTotalUnread] = useState(0);
  const [showPinnedUsers, setShowPinnedUsers] = useState(false);
  const [showPinnedChats, setShowPinnedChats] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddGroup, setShowAddGroup] = useState(false);
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
  const [showBlockDropdown, setShowBlockDropdown] = useState(false);
  const [showFullImage, setShowFullImage] = useState<string | null>(null);
  const [showAddMemberToGroup, setShowAddMemberToGroup] = useState(false);
  const [selectedGroupMember, setSelectedGroupMember] = useState("");
  const [chatButtonMessages, setChatButtonMessages] = useState<string[]>([]);
  const [chatButtonIndex, setChatButtonIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const blockDropdownRef = useRef<HTMLDivElement>(null);
  const [typingUsersMap, setTypingUsersMap] = useState<{ [key: string]: string[] }>({});

  // SEARCH STATE
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchExpandedRef = useRef<HTMLDivElement>(null);

  // ROLLING TEXT SEARCH
  const searchRollingTexts = [
    "Tentang Note", 
    "Tentang Donasi", 
    "Tentang Blog", 
    "Tentang Shop", 
    "Tentang Pusat bantuan"
  ];
  const [rollingIndex, setRollingIndex] = useState(0);
  const [rollingText, setRollingText] = useState(searchRollingTexts[0]);
  const rollingRef = useRef<HTMLSpanElement>(null);

  // GREETING - DETEKSI WAKTU OTOMATIS
  const [greetingText, setGreetingText] = useState(getGreeting());
  const greetingRef = useRef<HTMLSpanElement>(null);

  // Update greeting every minute
  useEffect(() => {
    const updateGreeting = () => {
      const newGreeting = getGreeting();
      setGreetingText(newGreeting);
      if (greetingRef.current) {
        gsap.fromTo(greetingRef.current,
          { opacity: 0.5, scale: 0.95 },
          { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" }
        );
      }
    };
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  // Group Chat States
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [selectedGroupMembers, setSelectedGroupMembers] = useState<string[]>([]);
  const [groupAdmins, setGroupAdmins] = useState<string[]>([]);

  const [searchUserInput, setSearchUserInput] = useState("");
  const [searchUserResult, setSearchUserResult] = useState<ChatUser | null>(null);
  const [searchUserStatus, setSearchUserStatus] = useState("");

  const [blockedByBanner, setBlockedByBanner] = useState<{userId: string, userName: string} | null>(null);

  const [showUpdate, setShowUpdate] = useState(false);
  const [selectedUpdateId, setSelectedUpdateId] = useState<string | null>(null);
  
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  const [blockNotification, setBlockNotification] = useState<string | null>(null);

  // ===== PROFILE DROPDOWN STATE =====
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // ===== SAVED MESSAGES STATE =====
  const [savedMessages, setSavedMessages] = useState<SavedMessage[]>([]);
  const [showSavedMessages, setShowSavedMessages] = useState(false);
  const [totalSavedCount, setTotalSavedCount] = useState(0);

  // ===== NOTIFICATION STATE =====
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // ===== REFS UNTUK ROLLING TEXT NAVBAR =====
  const navItemRefs = useRef<(HTMLSpanElement | null)[]>([]);

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

  const isAdmin = user?.email === ADMIN_EMAIL;

  // ===== ROLLING TEXT SEARCH EFFECT =====
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

  // ===== SEARCH EXPAND EFFECT =====
  useEffect(() => {
    if (isSearchOpen && searchExpandedRef.current) {
      gsap.fromTo(searchExpandedRef.current,
        { height: 0, opacity: 0, y: -10 },
        { height: "auto", opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
      );
      setTimeout(() => searchInputRef.current?.focus(), 300);
    }
  }, [isSearchOpen]);

  // ===== SEARCH OUTSIDE CLICK =====
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
        setSearchQuery("");
        setSearchResults([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ===== PROFILE DROPDOWN OUTSIDE CLICK =====
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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

  useEffect(() => {
    setSearchResults([]);
  }, [searchQuery]);

  const handleSearchSelect = (item: string) => {
    console.log("Selected:", item);
    setIsSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const isUserBlocked = (userId: string) => {
    if (!user || !userId) return false;
    const currentUserData = users.find(u => u.id === user.uid);
    return (currentUserData?.blocked || []).includes(userId);
  };

  const isBlockedByUser = (userId: string) => {
    if (!user || !userId) return false;
    const targetUser = users.find(u => u.id === userId);
    return (targetUser?.blockedBy || []).includes(user.uid);
  };

  const getTypingUsersDisplay = (room: ChatRoom) => {
    if (!room.typingUsers || room.typingUsers.length === 0) return null;
    const names = room.typingUsers;
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} and ${names[1]}`;
    const last = names[names.length - 1];
    const rest = names.slice(0, -1);
    return `${rest.join(', ')} and ${last}`;
  };

  const getRegularTypingUsers = () => {
    if (!selectedChat) return [];
    const usersTyping = typingUsersMap[selectedChat.id] || [];
    return usersTyping;
  };

  const regularTypingUsers = getRegularTypingUsers();

  const getTypingUsersText = (typingUsers: string[]) => {
    if (!typingUsers || typingUsers.length === 0) return null;
    if (typingUsers.length === 1) return `${typingUsers[0]} is typing...`;
    if (typingUsers.length === 2) return `${typingUsers[0]} and ${typingUsers[1]} are typing...`;
    const last = typingUsers[typingUsers.length - 1];
    const rest = typingUsers.slice(0, -1);
    return `${rest.join(', ')} and ${last} are typing...`;
  };

  // ===== GET ONLINE MEMBERS IN GROUP =====
  const getOnlineGroupMembers = (groupMembers: string[]) => {
    if (!groupMembers) return [];
    return users.filter(u => groupMembers.includes(u.id) && u.online && u.id !== user?.uid);
  };

  const handleSearchUser = async () => {
    if (!searchUserInput.trim() || !db) {
      setSearchUserStatus("Masukkan email");
      return;
    }

    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", searchUserInput.trim()));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setSearchUserStatus("User tidak ditemukan di database");
        setSearchUserResult(null);
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      
      if (userDoc.id === user.uid) {
        setSearchUserStatus("Ini adalah akun Anda sendiri");
        setSearchUserResult(null);
        return;
      }

      const foundUser: ChatUser = {
        id: userDoc.id,
        ...userData,
        isPinned: userData.isPinned || false,
        isAdmin: userData.isAdmin || false,
        online: userData.online || false,
        lastSeen: userData.lastSeen || null,
        typing: userData.typing || false,
        blocked: userData.blocked || [],
        blockedBy: userData.blockedBy || []
      };

      setSearchUserResult(foundUser);
      setSearchUserStatus(`User ditemukan: ${foundUser.name}`);
      
    } catch (error) {
      console.error("Error searching user:", error);
      setSearchUserStatus("Terjadi kesalahan saat mencari user");
    }
  };

  const handleAddManualUser = async () => {
    if (!searchUserResult || !user || !db) return;

    if (isUserBlocked(searchUserResult.id) || isBlockedByUser(searchUserResult.id)) {
      setSearchUserStatus("User ini diblokir");
      return;
    }

    try {
      const chatId = [user.uid, searchUserResult.id].sort().join("_");
      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);
      
      if (chatSnap.exists()) {
        setSearchUserStatus(`Chat dengan ${searchUserResult.name} sudah ada`);
        return;
      }

      await setDoc(chatRef, {
        participants: [user.uid, searchUserResult.id],
        createdAt: serverTimestamp(),
        isPinned: false,
        isGroup: false
      });

      setSearchUserStatus(`Chat dengan ${searchUserResult.name} berhasil dibuat!`);
      setSearchUserResult(null);
      setSearchUserInput("");
      
      setTimeout(() => setSearchUserStatus(""), 3000);
      
    } catch (error) {
      console.error("Error adding manual user:", error);
      setSearchUserStatus("Gagal menambahkan user");
    }
  };

  // ===== SAVE MESSAGE =====
  const handleSaveMessage = async (chatId: string, messageId: string, currentSaved: boolean) => {
    if (!db || !user) return;
    
    try {
      const msgRef = doc(db, "chats", chatId, "messages", messageId);
      const msgSnap = await getDoc(msgRef);
      
      if (!msgSnap.exists()) return;
      const msgData = msgSnap.data() as Message;
      
      if (currentSaved) {
        const savedRef = collection(db, "users", user.uid, "savedMessages");
        const q = query(savedRef, where("messageId", "==", messageId));
        const querySnap = await getDocs(q);
        querySnap.forEach(async (doc) => {
          await deleteDoc(doc.ref);
        });
        
        await updateDoc(msgRef, {
          savedBy: arrayRemove(user.uid)
        });
        
        setShowMessageMenu(null);
      } else {
        const savedRef = collection(db, "users", user.uid, "savedMessages");
        await addDoc(savedRef, {
          messageId: messageId,
          chatId: chatId,
          text: msgData.text,
          senderName: msgData.senderName,
          senderId: msgData.senderId,
          timestamp: msgData.timestamp,
          savedAt: serverTimestamp(),
          isGroupMessage: msgData.isGroupMessage || false,
          groupName: selectedChat?.groupName || null
        });
        
        await updateDoc(msgRef, {
          savedBy: arrayUnion(user.uid)
        });
        
        setShowMessageMenu(null);
      }
      
      loadSavedMessages();
      
    } catch (error) {
      console.error("Error saving message:", error);
    }
  };

  // ===== LOAD SAVED MESSAGES =====
  const loadSavedMessages = async () => {
    if (!db || !user) return;
    
    try {
      const savedRef = collection(db, "users", user.uid, "savedMessages");
      const q = query(savedRef, orderBy("savedAt", "desc"));
      const querySnap = await getDocs(q);
      
      const savedList: SavedMessage[] = [];
      querySnap.forEach((doc) => {
        savedList.push({ id: doc.id, ...doc.data() } as SavedMessage);
      });
      
      setSavedMessages(savedList);
      setTotalSavedCount(savedList.length);
    } catch (error) {
      console.error("Error loading saved messages:", error);
    }
  };

  // ===== CHECK IF MESSAGE IS SAVED =====
  const isMessageSaved = (messageId: string) => {
    return savedMessages.some(s => s.messageId === messageId);
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
              lastSeen: serverTimestamp()
            });
          }
          
          const updatedSnap = await getDoc(userRef);
          const updatedData = updatedSnap.data();
          if (updatedData) {
            setUser((prev: any) => ({
              ...prev,
              photoURL: updatedData.photoURL || prev.photoURL || "",
              displayName: updatedData.name || prev.displayName || prev.email,
              blocked: updatedData.blocked || [],
              blockedBy: updatedData.blockedBy || []
            }));
          }
          
          loadSavedMessages();
          
        } catch (error) {
          console.error("Error saving user:", error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

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
                photoURL: data.photoURL || "",
                isAdmin: data.isAdmin || false,
                blocked: data.blocked || [],
                blockedBy: data.blockedBy || [],
                isGroup: data.isGroup || false,
                groupName: data.groupName || "",
                groupDescription: data.groupDescription || "",
                groupMembers: data.groupMembers || [],
                groupAdmins: data.groupAdmins || [],
                createdBy: data.createdBy || ""
              } as ChatUser);
            }
          });
          
          const selfUser: ChatUser = {
            id: user.uid,
            name: user.displayName || user.email || "Me",
            email: user.email || "",
            photoURL: user.photoURL || "",
            isPinned: false,
            isAdmin: isAdmin,
            online: true,
            lastSeen: null,
            typing: false,
            blocked: user.blocked || [],
            blockedBy: user.blockedBy || []
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
                isAdmin: isAdmin,
                blocked: user.blocked || [],
                blockedBy: user.blockedBy || []
              };
            }
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
      const allMessages: string[] = [];
      
      let blockedByUser = null;
      for (const u of users) {
        if (u.id !== user.uid && (u.blockedBy || []).includes(user.uid)) {
          blockedByUser = u;
          break;
        }
      }
      
      if (blockedByUser) {
        setBlockedByBanner({
          userId: blockedByUser.id,
          userName: blockedByUser.name
        });
      } else {
        setBlockedByBanner(null);
      }
      
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        if (data.participants && data.participants.includes(user.uid)) {
          const isGroup = data.isGroup || false;
          
          if (!isGroup) {
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
              
              unreadSnap.forEach((doc) => {
                const msg = doc.data() as Message;
                allMessages.push(`${otherUser.name}: ${msg.text.substring(0, 30)}${msg.text.length > 30 ? '...' : ''}`);
              });
              
              const isBlocked = isUserBlocked(otherId) || isBlockedByUser(otherId);
              
              rooms.push({
                id: docSnap.id,
                participants: data.participants,
                lastMessage: isBlocked ? "Blocked" : lastMessage,
                lastMessageTime: lastMessageTime,
                lastMessageSenderId: lastMessageSenderId,
                unreadCount: isBlocked ? 0 : unreadCount,
                isPinned: data.isPinned || false,
                typingUsers: [],
                typingUsersId: [],
                isBlocked: isBlocked,
                isGroup: false
              });
            }
          } else {
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
            
            unreadSnap.forEach((doc) => {
              const msg = doc.data() as Message;
              const sender = users.find(u => u.id === msg.senderId);
              allMessages.push(`${data.groupName || 'Group'}: ${sender?.name || 'Unknown'}: ${msg.text.substring(0, 30)}${msg.text.length > 30 ? '...' : ''}`);
            });
            
            rooms.push({
              id: docSnap.id,
              participants: data.participants,
              lastMessage: lastMessage || "No messages",
              lastMessageTime: lastMessageTime,
              lastMessageSenderId: lastMessageSenderId,
              unreadCount: unreadCount,
              isPinned: data.isPinned || false,
              typingUsers: [],
              typingUsersId: [],
              isBlocked: false,
              isGroup: true,
              groupName: data.groupName || "Group Chat",
              groupDescription: data.groupDescription || "",
              groupMembers: data.groupMembers || [],
              groupAdmins: data.groupAdmins || [],
              createdBy: data.createdBy || ""
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
      
      if (allMessages.length > 0) {
        setChatButtonMessages(allMessages);
        setChatButtonIndex(0);
      } else {
        setChatButtonMessages(["Chat with Menuru"]);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [user, users]);

  // Load messages for chat
  useEffect(() => {
    if (!selectedChat || !user || !db) return;

    const chatId = selectedChat.isGroup ? selectedChat.id : [user.uid, selectedChat.id].sort().join("_");
    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const messageList: Message[] = [];
      const pinnedList: Message[] = [];
      
      snapshot.forEach((doc) => {
        const msg = { id: doc.id, ...doc.data() } as Message;
        if (selectedChat.isGroup && !msg.groupId) {
          msg.groupId = chatId;
        }
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

  // LISTEN FOR TYPING STATUS
  useEffect(() => {
    if (!db || !user) return;

    const usersRef = collection(db, "users");
    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const typingMap: { [key: string]: { names: string[], ids: string[] } } = {};
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.typing && data.id !== user?.uid) {
          const foundUser = users.find(u => u.id === data.id);
          if (foundUser) {
            chatRooms.forEach(room => {
              if (room.participants && room.participants.includes(data.id)) {
                if (!typingMap[room.id]) {
                  typingMap[room.id] = { names: [], ids: [] };
                }
                if (!typingMap[room.id].names.includes(foundUser.name)) {
                  typingMap[room.id].names.push(foundUser.name);
                  typingMap[room.id].ids.push(data.id);
                }
              }
            });
          }
        }
      });
      
      const newTypingMap: { [key: string]: string[] } = {};
      Object.keys(typingMap).forEach(roomId => {
        newTypingMap[roomId] = typingMap[roomId].names;
      });
      setTypingUsersMap(newTypingMap);
      
      setChatRooms(prev => prev.map(room => {
        const typingData = typingMap[room.id];
        return {
          ...room,
          typingUsers: typingData?.names || [],
          typingUsersId: typingData?.ids || []
        };
      }));
    });

    return () => unsubscribe();
  }, [user, users, chatRooms]);

  useEffect(() => {
    if (!selectedChat || !user || !db) return;
    
    return () => {
      const userRef = doc(db, "users", user.uid);
      updateDoc(userRef, { typing: false }).catch(() => {});
    };
  }, [selectedChat, user, db]);

  // Chat button message rotation
  useEffect(() => {
    if (chatButtonMessages.length > 1) {
      const interval = setInterval(() => {
        setChatButtonIndex((prev) => (prev + 1) % chatButtonMessages.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [chatButtonMessages]);

  // Load saved messages on user change
  useEffect(() => {
    if (user) {
      loadSavedMessages();
    }
  }, [user]);

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
      setShowProfileDropdown(false);
      setShowSavedMessages(false);
      setShowNotifications(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleChatToggle = () => {
    if (!user) return;
    setIsChatOpen(!isChatOpen);
    if (!isChatOpen) {
      setSelectedChat(null);
      setShowAddUser(false);
      setShowAddGroup(false);
      setReplyTo(null);
      setShowProfile(false);
      setProfileUser(null);
      setShowPrivacyPolicy(false);
      setShowUpdate(false);
      setSelectedUpdateId(null);
      setSearchUserInput("");
      setSearchUserResult(null);
      setSearchUserStatus("");
      setShowProfileDropdown(false);
      setShowSavedMessages(false);
      setShowNotifications(false);
    }
  };

  const handleTyping = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);
    
    if (!selectedChat || !user || !db) return;
    
    if (isUserBlocked(selectedChat.id) || isBlockedByUser(selectedChat.id)) return;
    
    const userRef = doc(db, "users", user.uid);
    
    if (value.length > 0) {
      await updateDoc(userRef, {
        typing: true
      });
    } else {
      await updateDoc(userRef, {
        typing: false
      });
    }
    
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

  const handleOpenProfile = (chatUser: ChatUser) => {
    if (!chatUser || !user) return;
    
    setProfileUser(chatUser);
    setShowProfile(true);
    setShowBlockDropdown(false);
    setShowAddMemberToGroup(false);
    setShowProfileDropdown(false);
  };

  const handleCloseProfile = () => {
    setShowProfile(false);
    setProfileUser(null);
    setShowBlockDropdown(false);
    setShowAddMemberToGroup(false);
  };

  const handleBlockUser = async (userId: string, isBlocked: boolean) => {
    if (!db || !user || !userId) return;
    
    try {
      const userRef = doc(db, "users", user.uid);
      const targetRef = doc(db, "users", userId);
      
      if (isBlocked) {
        await updateDoc(userRef, {
          blocked: arrayRemove(userId)
        });
        await updateDoc(targetRef, {
          blockedBy: arrayRemove(user.uid)
        });
        
        setUser((prev: any) => ({
          ...prev,
          blocked: (prev.blocked || []).filter((id: string) => id !== userId)
        }));
        
        setUsers(prev => prev.map(u => {
          if (u.id === user.uid) {
            return { ...u, blocked: (u.blocked || []).filter((id: string) => id !== userId) };
          }
          if (u.id === userId) {
            return { ...u, blockedBy: (u.blockedBy || []).filter((id: string) => id !== user.uid) };
          }
          return u;
        }));
        
        if (blockedByBanner?.userId === userId) {
          setBlockedByBanner(null);
        }
        
        setBlockNotification(null);
        
      } else {
        await updateDoc(userRef, {
          blocked: arrayUnion(userId)
        });
        await updateDoc(targetRef, {
          blockedBy: arrayUnion(user.uid)
        });
        
        setUser((prev: any) => ({
          ...prev,
          blocked: [...(prev.blocked || []), userId]
        }));
        
        setUsers(prev => prev.map(u => {
          if (u.id === user.uid) {
            return { ...u, blocked: [...(u.blocked || []), userId] };
          }
          if (u.id === userId) {
            return { ...u, blockedBy: [...(u.blockedBy || []), user.uid] };
          }
          return u;
        }));
        
        const blockedUser = users.find(u => u.id === userId);
        setBlockNotification(`Akun ${blockedUser?.name || 'User'} telah diblokir oleh anda`);
        
        setTimeout(() => setBlockNotification(null), 5000);
      }
      
      setShowBlockDropdown(false);
      
    } catch (error) {
      console.error("Error blocking/unblocking user:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedChat || !user || !message.trim() || !db) return;

    if (isUserBlocked(selectedChat.id) || isBlockedByUser(selectedChat.id)) {
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { typing: false });
      
      const chatId = selectedChat.isGroup ? selectedChat.id : [user.uid, selectedChat.id].sort().join("_");
      
      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);
      if (!chatSnap.exists()) {
        if (selectedChat.isGroup) {
          await setDoc(chatRef, {
            participants: selectedChat.groupMembers || [user.uid],
            createdAt: serverTimestamp(),
            isPinned: false,
            isGroup: true,
            groupName: selectedChat.groupName || "Group Chat",
            groupDescription: selectedChat.groupDescription || "",
            groupMembers: selectedChat.groupMembers || [],
            groupAdmins: selectedChat.groupAdmins || [],
            createdBy: selectedChat.createdBy || user.uid
          });
        } else {
          await setDoc(chatRef, {
            participants: [user.uid, selectedChat.id],
            createdAt: serverTimestamp(),
            isPinned: false,
            isGroup: false
          });
        }
      }
      
      const encryptedText = encryptMessage(message.trim());
      
      const messagesRef = collection(db, "chats", chatId, "messages");
      const msgData: any = {
        text: encryptedText,
        senderId: user.uid,
        senderName: user.displayName || user.email || "User",
        receiverId: selectedChat.isGroup ? chatId : selectedChat.id,
        timestamp: serverTimestamp(),
        read: false,
        isPinned: false,
        pinnedAt: null,
        isShared: false,
        isGroupMessage: selectedChat.isGroup || false,
        groupId: selectedChat.isGroup ? chatId : null,
        savedBy: [],
        encrypted: true
      };
      
      if (replyTo) {
        msgData.replyTo = replyTo.id;
        msgData.replyToText = encryptMessage(replyTo.text);
        msgData.replyToSender = replyTo.senderName;
      }
      
      await addDoc(messagesRef, msgData);

      setMessage("");
      setReplyTo(null);
      
      if (typingTimeout) {
        clearTimeout(typingTimeout);
        setTypingTimeout(null);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleShareMessage = async () => {
    if (!shareMessage || !selectedShareUser || !user || !db) return;
    
    if (isUserBlocked(selectedShareUser) || isBlockedByUser(selectedShareUser)) {
      setShowShareModal(false);
      setShareMessage(null);
      setSelectedShareUser("");
      return;
    }
    
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
          isGroup: false
        });
      }
      
      const messagesRef = collection(db, "chats", chatId, "messages");
      const sharedText = `From ${shareMessage.senderName}: ${shareMessage.text}`;
      await addDoc(messagesRef, {
        text: encryptMessage(sharedText),
        senderId: user.uid,
        senderName: user.displayName || user.email || "User",
        receiverId: targetUser.id,
        timestamp: serverTimestamp(),
        read: false,
        isPinned: false,
        pinnedAt: null,
        isShared: true,
        sharedFrom: shareMessage.senderId,
        sharedFromName: shareMessage.senderName,
        groupId: null,
        savedBy: [],
        encrypted: true
      });
      
      setShowShareModal(false);
      setShareMessage(null);
      setSelectedShareUser("");
    } catch (error) {
      console.error("Error sharing message:", error);
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
    
    if (isUserBlocked(selectedChat.id) || isBlockedByUser(selectedChat.id)) {
      return;
    }
    
    try {
      const chatId = selectedChat.isGroup ? selectedChat.id : [user.uid, selectedChat.id].sort().join("_");
      const messagesRef = collection(db, "chats", chatId, "messages");
      const decryptedText = msg.encrypted ? decryptMessage(msg.text) : msg.text;
      await addDoc(messagesRef, {
        text: encryptMessage(decryptedText),
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
        replyToSender: null,
        groupId: selectedChat.isGroup ? chatId : null,
        savedBy: [],
        encrypted: true
      });
      
      setShowMessageMenu(null);
    } catch (error) {
      console.error("Error resending message:", error);
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
    
    if (isUserBlocked(selectedNewUser) || isBlockedByUser(selectedNewUser)) {
      setAddUserStatus("User is blocked");
      return;
    }
    
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
          isGroup: false
        });
        setAddUserStatus(`Chat with ${targetUser.name} created`);
      } else {
        setAddUserStatus(`Chat with ${targetUser.name} already exists`);
      }
      
      setSelectedNewUser("");
      setShowAddUser(false);
      
    } catch (error) {
      console.error("Error adding user:", error);
      setAddUserStatus("Failed to add user");
    }
  };

  const handleAddMemberToGroup = async () => {
    if (!profileUser || !selectedGroupMember || !user || !db) return;
    
    if (!profileUser.isGroup) return;
    
    try {
      const targetUser = users.find(u => u.id === selectedGroupMember);
      if (!targetUser) {
        setAddUserStatus("User not found");
        return;
      }
      
      const groupRef = doc(db, "chats", profileUser.id);
      const groupSnap = await getDoc(groupRef);
      
      if (groupSnap.exists()) {
        const groupData = groupSnap.data();
        const currentMembers = groupData.groupMembers || [];
        
        if (currentMembers.includes(selectedGroupMember)) {
          setAddUserStatus(`${targetUser.name} already in group`);
          return;
        }
        
        const newMembers = [...currentMembers, selectedGroupMember];
        const newParticipants = [...groupData.participants, selectedGroupMember];
        
        await updateDoc(groupRef, {
          groupMembers: newMembers,
          participants: newParticipants
        });
        
        setProfileUser({
          ...profileUser,
          groupMembers: newMembers
        });
        
        setUsers(prev => prev.map(u => {
          if (u.id === profileUser.id) {
            return { ...u, groupMembers: newMembers };
          }
          return u;
        }));
        
        setChatRooms(prev => prev.map(room => {
          if (room.id === profileUser.id) {
            return { ...room, groupMembers: newMembers, participants: newParticipants };
          }
          return room;
        }));
        
        setAddUserStatus(`${targetUser.name} added to group!`);
        setSelectedGroupMember("");
        setShowAddMemberToGroup(false);
        setTimeout(() => setAddUserStatus(""), 3000);
      }
    } catch (error) {
      console.error("Error adding member to group:", error);
      setAddUserStatus("Failed to add member");
    }
  };

  const handleCreateGroup = async () => {
    if (!user || !db || !groupName.trim() || selectedGroupMembers.length === 0) {
      setAddUserStatus("Please fill in all fields");
      return;
    }

    try {
      const existingGroup = chatRooms.find(room => 
        room.isGroup && room.groupName === groupName.trim()
      );
      
      if (existingGroup) {
        setAddUserStatus(`Group "${groupName}" already exists!`);
        return;
      }

      const members = [user.uid, ...selectedGroupMembers];
      const admins = [user.uid, ...groupAdmins];
      const groupId = `group_${Date.now()}`;
      
      const chatRef = doc(db, "chats", groupId);
      await setDoc(chatRef, {
        participants: members,
        createdAt: serverTimestamp(),
        isPinned: false,
        isGroup: true,
        groupName: groupName.trim(),
        groupDescription: groupDescription.trim() || "",
        groupMembers: members,
        groupAdmins: admins,
        createdBy: user.uid
      });

      setAddUserStatus(`Group "${groupName}" created successfully!`);
      setGroupName("");
      setGroupDescription("");
      setSelectedGroupMembers([]);
      setGroupAdmins([]);
      setShowAddGroup(false);
      
      const newGroup: ChatUser = {
        id: groupId,
        name: groupName.trim(),
        email: "",
        photoURL: "",
        isGroup: true,
        groupName: groupName.trim(),
        groupDescription: groupDescription.trim() || "",
        groupMembers: members,
        groupAdmins: admins,
        createdBy: user.uid,
        online: false,
        lastSeen: null,
        typing: false,
        isPinned: false,
        isAdmin: false,
        blocked: [],
        blockedBy: []
      };
      
      setUsers(prev => [...prev, newGroup]);
      
      setTimeout(() => setAddUserStatus(""), 3000);
    } catch (error) {
      console.error("Error creating group:", error);
      setAddUserStatus("Failed to create group");
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
    if (chatUser.id === user?.uid) return false;
    return chatUser.typing || false;
  };

  const pinnedUsers = users.filter(u => u.isPinned && !u.isGroup);
  const pinnedChats = chatRooms.filter(r => r.isPinned);
  const unpinnedChats = chatRooms.filter(r => !r.isPinned);
  
  const availableUsers = users.filter(u => 
    u.id !== user?.uid && 
    !chatRooms.some(room => room.participants.includes(u.id)) &&
    !isUserBlocked(u.id) &&
    !isBlockedByUser(u.id) &&
    !u.isGroup
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMessageMenu(null);
      }
      if (blockDropdownRef.current && !blockDropdownRef.current.contains(event.target as Node)) {
        setShowBlockDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const hasBlockedUsers = Object.keys(chatRooms).some(key => {
    const room = chatRooms[key];
    if (room.isGroup) return false;
    const otherId = room.participants?.find((id: string) => id !== user?.uid);
    return otherId && isUserBlocked(otherId);
  });

  const hasBlockedByUsers = Object.keys(chatRooms).some(key => {
    const room = chatRooms[key];
    if (room.isGroup) return false;
    const otherId = room.participants?.find((id: string) => id !== user?.uid);
    return otherId && isBlockedByUser(otherId);
  });

  const chatButtonDisplay = chatButtonMessages.length > 0 ? chatButtonMessages[chatButtonIndex] : "Chat with Menuru";

  // ===== HANDLER ROLLING TEXT NAVBAR =====
  const handleNavItemEnter = (index: number) => {
    const el = navItemRefs.current[index];
    if (el) {
      gsap.to(el, {
        x: 20,
        duration: 0.4,
        ease: "power2.out",
        onComplete: () => {
          gsap.to(el, {
            x: 0,
            duration: 0.4,
            ease: "power2.inOut",
          });
        }
      });
    }
  };

  const handleNavItemLeave = (index: number) => {
    const el = navItemRefs.current[index];
    if (el) {
      gsap.to(el, {
        x: 0,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  };

  // ===== NAVBAR ITEMS =====
  const navItems = ["Note", "Donations", "News", "Calendar"];

  return (
    <>
      <Head>
        <title>Menuru Official | Home</title>
        <meta name="description" content="Menuru Brand from Love yourself" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#0D3CFC" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Menuru" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        <link rel="icon" href="/images/ai.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/images/ai.jpg" />
        
        <meta property="og:title" content="Menuru Official | Home" />
        <meta property="og:description" content="Menuru Brand from Love yourself" />
        <meta property="og:image" content="/images/ai.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Menuru Official" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Menuru Official | Home" />
        <meta name="twitter:description" content="Menuru Brand from Love yourself" />
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

        {/* Block Notification Banner */}
        <AnimatePresence>
          {blockNotification && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              style={{
                position: "fixed",
                top: "70px",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 1000,
                backgroundColor: "#0D3CFC",
                color: "#ffffff",
                padding: "12px 24px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 500,
                fontFamily: FONT_FAMILY,
                boxShadow: "0 4px 20px rgba(13,60,252,0.3)",
                textAlign: "center",
                maxWidth: "90%",
              }}
            >
              {blockNotification}
            </motion.div>
          )}
        </AnimatePresence>

        {isChatOpen && blockedByBanner && (
          <div style={{
            position: "fixed",
            top: "70px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            backgroundColor: "#ef4444",
            color: "#ffffff",
            padding: "12px 24px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 500,
            fontFamily: FONT_FAMILY,
            boxShadow: "0 4px 20px rgba(239,68,68,0.3)",
            textAlign: "center",
            maxWidth: "90%",
          }}>
            {blockedByBanner.userName} telah memblokir anda
          </div>
        )}

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
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <span
                style={{
                  fontSize: "48px",
                  fontWeight: 700,
                  color: "#000000",
                  fontFamily: FONT_FAMILY,
                  letterSpacing: "-0.03em",
                  background: "transparent",
                }}
              >
                Menuru
              </span>
            </motion.div>

            {/* SEARCH BUTTON */}
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

              {/* SEARCH EXPANDED */}
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

          {/* ===== TENGAH: Note Donations News Calendar - ROLLING TEXT GSAP ===== */}
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
            {navItems.map((item, index) => (
              <div
                key={item}
                style={{
                  overflow: "hidden",
                  display: "inline-block",
                  cursor: "pointer",
                }}
                onMouseEnter={() => handleNavItemEnter(index)}
                onMouseLeave={() => handleNavItemLeave(index)}
              >
                <span
                  ref={(el) => {
                    navItemRefs.current[index] = el;
                  }}
                  style={{
                    fontSize: "29px",
                    fontWeight: 500,
                    color: "#000000",
                    fontFamily: FONT_FAMILY,
                    letterSpacing: "-0.02em",
                    display: "inline-block",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item}
                </span>
              </div>
            ))}
          </motion.div>

          {/* ===== KANAN: Shop + Pusat bantuan + Notif + Profile ===== */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Shop Button */}
            <motion.button
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
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.04)"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              onClick={() => console.log("Shop clicked")}
            >
              <StoreIcon size={22} />
              <span>Shop</span>
            </motion.button>

            {/* Help Center Button */}
            <Link href="/pusat-bantuan" passHref>
              <motion.a
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
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
                <HelpDeskIcon size={22} />
                <span>Pusat bantuan</span>
              </motion.a>
            </Link>

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
                    {chatRooms.filter(r => r.unreadCount > 0).length === 0 ? (
                      <div style={{ padding: "24px 16px", textAlign: "center", color: "#999", fontSize: "13px" }}>
                        Tidak ada notifikasi
                      </div>
                    ) : (
                      chatRooms.filter(r => r.unreadCount > 0).map((room) => {
                        if (room.isGroup) {
                          return (
                            <div key={room.id} style={{ padding: "10px 16px", borderBottom: "1px solid #f5f5f5", cursor: "pointer" }}
                              onClick={() => {
                                const groupUser: ChatUser = {
                                  id: room.id,
                                  name: room.groupName || "Group Chat",
                                  email: "",
                                  photoURL: "",
                                  isGroup: true,
                                  groupName: room.groupName,
                                  groupDescription: room.groupDescription,
                                  groupMembers: room.groupMembers,
                                  groupAdmins: room.groupAdmins,
                                  createdBy: room.createdBy,
                                  online: false,
                                  lastSeen: null,
                                  typing: false,
                                  isPinned: room.isPinned,
                                  isAdmin: false,
                                  blocked: [],
                                  blockedBy: []
                                };
                                setSelectedChat(groupUser);
                                setShowNotifications(false);
                              }}
                            >
                              <div style={{ fontSize: "13px", fontWeight: 500, color: "#000" }}>{room.groupName || "Group Chat"}</div>
                              <div style={{ fontSize: "11px", color: "#666" }}>{room.unreadCount} pesan baru</div>
                            </div>
                          );
                        }
                        const otherId = room.participants?.find(id => id !== user?.uid);
                        const otherUser = users.find(u => u.id === otherId);
                        if (!otherUser) return null;
                        return (
                          <div key={room.id} style={{ padding: "10px 16px", borderBottom: "1px solid #f5f5f5", cursor: "pointer" }}
                            onClick={() => {
                              setSelectedChat(otherUser);
                              setShowNotifications(false);
                            }}
                          >
                            <div style={{ fontSize: "13px", fontWeight: 500, color: "#000" }}>{otherUser.name}</div>
                            <div style={{ fontSize: "11px", color: "#666" }}>{room.unreadCount} pesan baru</div>
                          </div>
                        );
                      })
                    )}
                    <div style={{ padding: "8px 16px", borderTop: "1px solid #f0f0f0", textAlign: "center" }}>
                      <button style={{ background: "none", border: "none", color: "#0D3CFC", fontSize: "12px", cursor: "pointer", fontFamily: FONT_FAMILY }}
                        onClick={() => {
                          setShowNotifications(false);
                          setIsChatOpen(true);
                          setSelectedChat(null);
                        }}
                      >
                        Lihat semua pesan
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ===== PROFILE PHOTO WITH DROPDOWN ===== */}
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
                          onClick={() => {
                            const selfUser = users.find(u => u.id === user.uid);
                            if (selfUser) {
                              handleOpenProfile(selfUser);
                              setShowProfileDropdown(false);
                            }
                          }}
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
                          onClick={() => {
                            console.log("Transactions clicked");
                            setShowProfileDropdown(false);
                          }}
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
                          onClick={() => {
                            setShowSavedMessages(!showSavedMessages);
                            setShowProfileDropdown(false);
                            if (!showSavedMessages) {
                              loadSavedMessages();
                            }
                          }}
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
                          <SaveIcon filled={true} />
                          <span>Pesan Tersimpan ({totalSavedCount})</span>
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
                  {users.filter(u => 
                    u.id !== user.uid && 
                    u.id !== shareMessage.senderId &&
                    !isUserBlocked(u.id) &&
                    !isBlockedByUser(u.id) &&
                    !u.isGroup
                  ).map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                      {u.isAdmin && <InstagramVerifiedBadge size={14} />}
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
                      backgroundColor: selectedShareUser ? "#0D3CFC" : "#ccc",
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

        {/* Full Image Modal */}
        <AnimatePresence>
          {showFullImage && (
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
                backgroundColor: "rgba(0,0,0,0.85)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                zIndex: 9999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
              onClick={() => setShowFullImage(null)}
            >
              <motion.img
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                src={showFullImage}
                alt="Full view"
                style={{
                  maxWidth: "90%",
                  maxHeight: "90%",
                  borderRadius: "12px",
                  objectFit: "contain",
                  cursor: "default",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Saved Messages Modal */}
        <AnimatePresence>
          {showSavedMessages && (
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
              onClick={() => setShowSavedMessages(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                transition={{ type: "spring", damping: 20 }}
                style={{
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  padding: "24px",
                  maxWidth: "500px",
                  width: "90%",
                  maxHeight: "80vh",
                  border: "1px solid #e0e0e0",
                  fontFamily: FONT_FAMILY,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#000", fontFamily: FONT_FAMILY }}>
                    <SaveIcon filled={true} style={{ marginRight: "8px" }} />
                    Pesan Tersimpan ({totalSavedCount})
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowSavedMessages(false)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#999",
                      padding: "4px",
                    }}
                  >
                    <CloseIcon />
                  </motion.button>
                </div>
                <div style={{ flex: 1, overflowY: "auto", paddingRight: "4px" }}>
                  {savedMessages.length === 0 ? (
                    <div style={{ textAlign: "center", color: "#999", padding: "40px 0", fontSize: "14px" }}>
                      <div style={{ fontSize: "32px", marginBottom: "8px" }}>📂</div>
                      <div>Belum ada pesan tersimpan</div>
                    </div>
                  ) : (
                    savedMessages.map((saved) => (
                      <div key={saved.id} style={{
                        padding: "12px 14px",
                        borderBottom: "1px solid #f0f0f0",
                        backgroundColor: "#fafafa",
                        borderRadius: "8px",
                        marginBottom: "8px",
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "12px", fontWeight: 500, color: "#0D3CFC" }}>
                              {saved.senderName}
                              {saved.isGroupMessage && saved.groupName && (
                                <span style={{ fontSize: "10px", color: "#999", fontWeight: 400, marginLeft: "6px" }}>
                                  • {saved.groupName}
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: "14px", color: "#000", marginTop: "2px" }}>
                              {saved.text}
                            </div>
                            <div style={{ fontSize: "10px", color: "#bbb", marginTop: "4px" }}>
                              Disimpan {formatTime(saved.savedAt)}
                            </div>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={async () => {
                              if (!db) return;
                              try {
                                const savedRef = doc(db, "users", user.uid, "savedMessages", saved.id);
                                await deleteDoc(savedRef);
                                const msgRef = doc(db, "chats", saved.chatId, "messages", saved.messageId);
                                await updateDoc(msgRef, {
                                  savedBy: arrayRemove(user.uid)
                                });
                                loadSavedMessages();
                              } catch (error) {
                                console.error("Error removing saved message:", error);
                              }
                            }}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#ef4444",
                              cursor: "pointer",
                              padding: "4px 8px",
                              fontSize: "12px",
                              fontFamily: FONT_FAMILY,
                            }}
                          >
                            Hapus
                          </motion.button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== CHAT - INTEGRATED WITH MAIN PAGE (No Modal) ===== */}
        {user ? (
          // User logged in - show chat interface integrated with page
          <>
            {/* Chat toggle button - only text, no button styling */}
            <div
              onClick={handleChatToggle}
              style={{
                position: "fixed",
                bottom: "40px",
                right: "40px",
                zIndex: 100,
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                fontFamily: FONT_FAMILY,
                userSelect: "none",
                transition: "opacity 0.2s ease",
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.7"}
              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
            >
              <ChatBubbleIcon size={24} style={{ color: "#0D3CFC" }} />
              <span style={{ color: "#0D3CFC", fontWeight: 600, fontSize: "18px", letterSpacing: "-0.01em" }}>
                {isChatOpen ? "Tutup Chat" : "Buka Chat"}
              </span>
              {totalUnread > 0 && !isChatOpen && (
                <span style={{
                  backgroundColor: "#ef4444",
                  color: "#fff",
                  fontSize: "11px",
                  fontWeight: 700,
                  borderRadius: "50%",
                  width: "22px",
                  height: "22px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: FONT_FAMILY,
                }}>
                  {totalUnread > 9 ? "9+" : totalUnread}
                </span>
              )}
            </div>

            {/* Chat body - merges with page background, no modal styling */}
            <AnimatePresence>
              {isChatOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.97 }}
                  transition={{ type: "spring", damping: 25 }}
                  style={{
                    position: "fixed",
                    bottom: "90px",
                    right: "40px",
                    zIndex: 99,
                    width: "620px",
                    maxHeight: "720px",
                    backgroundColor: "transparent",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    fontFamily: FONT_FAMILY,
                    border: "1px solid rgba(0,0,0,0.06)",
                    borderRadius: "16px",
                    background: "#ffffff",
                    boxShadow: "0 8px 40px rgba(0,0,0,0.06)",
                  }}
                >
                  {/* Chat Header */}
                  <div
                    style={{
                      padding: "16px 20px",
                      borderBottom: "none",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      backgroundColor: "#0D3CFC",
                      flexShrink: 0,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
                      <span
                        style={{
                          fontSize: "18px",
                          fontWeight: 600,
                          color: "#ffffff",
                          letterSpacing: "-0.01em",
                          fontFamily: FONT_FAMILY,
                        }}
                      >
                        {selectedUpdateId && selectedUpdate ? "Update Detail" : (showUpdate ? "Update System" : (showPrivacyPolicy ? "Privacy Policy" : (showProfile ? "Profile" : (selectedChat ? (selectedChat.isGroup ? selectedChat.groupName || "Group Chat" : selectedChat.name) : "Messages"))))}
                      </span>
                      {!showProfile && !showPrivacyPolicy && !showUpdate && !selectedUpdateId && selectedChat && !selectedChat.isGroup && (
                        <>
                          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", fontFamily: FONT_FAMILY }}>
                            {selectedChat.email}
                          </span>
                          <OnlineIndicator 
                            online={getOnlineStatus(selectedChat.id)} 
                            lastSeen={getLastSeen(selectedChat.id)}
                          />
                        </>
                      )}
                      {!showProfile && !showPrivacyPolicy && !showUpdate && !selectedUpdateId && selectedChat && selectedChat.isGroup && selectedChat.groupMembers && (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", fontFamily: FONT_FAMILY }}>
                            {selectedChat.groupMembers.length} members
                          </span>
                          {(() => {
                            const onlineMembers = getOnlineGroupMembers(selectedChat.groupMembers || []);
                            if (onlineMembers.length > 0) {
                              return (
                                <span style={{ fontSize: "10px", color: "#c5e800", fontFamily: FONT_FAMILY, display: "flex", alignItems: "center", gap: "2px" }}>
                                  <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#c5e800" }} />
                                  {onlineMembers.map(m => m.name).join(", ")}
                                </span>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      )}
                      {!showProfile && !showPrivacyPolicy && !showUpdate && !selectedUpdateId && !selectedChat && totalUnread > 0 && (
                        <span
                          style={{
                            backgroundColor: "#c5e800",
                            color: "#000000",
                            padding: "2px 10px",
                            borderRadius: "4px",
                            fontSize: "12px",
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
                        background: "rgba(255,255,255,0.15)",
                        border: "none",
                        cursor: "pointer",
                        color: "#ffffff",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        transition: "all .2s ease",
                        display: "flex",
                        alignItems: "center",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.25)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.15)";
                      }}
                    >
                      <CloseIcon />
                    </motion.button>
                  </div>

                  {/* Content */}
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
                                  <NorthEastArrow />
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
                    <div style={{ padding: "24px 28px", overflowY: "auto", flex: 1, maxHeight: "640px", fontFamily: FONT_FAMILY }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", width: "100%" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
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
                              padding: "4px 0",
                              transition: "color 0.2s ease",
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = "#000"}
                            onMouseLeave={(e) => e.currentTarget.style.color = "#666"}
                          >
                            <BackIcon />
                            <span>Back</span>
                          </motion.button>

                          {!profileUser.isGroup && profileUser.id !== user.uid && (
                            <div ref={blockDropdownRef} style={{ position: "relative" }}>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowBlockDropdown(!showBlockDropdown)}
                                style={{
                                  padding: "6px 14px",
                                  backgroundColor: isUserBlocked(profileUser.id) ? "#ef4444" : "#000",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: "6px",
                                  fontSize: "13px",
                                  cursor: "pointer",
                                  fontFamily: FONT_FAMILY,
                                  transition: "all 0.2s ease",
                                }}
                              >
                                {isUserBlocked(profileUser.id) ? "Unblock" : "Block"}
                              </motion.button>
                              
                              <AnimatePresence>
                                {showBlockDropdown && (
                                  <motion.div
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                    style={{
                                      position: "absolute",
                                      top: "calc(100% + 4px)",
                                      right: 0,
                                      backgroundColor: "#ffffff",
                                      borderRadius: "8px",
                                      padding: "4px",
                                      minWidth: "140px",
                                      boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                                      zIndex: 60,
                                      border: "1px solid #f0f0f0",
                                    }}
                                  >
                                    <motion.button
                                      whileHover={{ backgroundColor: "#f5f5f5" }}
                                      onClick={() => {
                                        const isBlocked = isUserBlocked(profileUser.id);
                                        handleBlockUser(profileUser.id, isBlocked);
                                      }}
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px",
                                        padding: "8px 14px",
                                        width: "100%",
                                        background: "none",
                                        border: "none",
                                        color: isUserBlocked(profileUser.id) ? "#22c55e" : "#ef4444",
                                        fontSize: "13px",
                                        cursor: "pointer",
                                        borderRadius: "6px",
                                        transition: "all 0.2s ease",
                                        fontFamily: FONT_FAMILY,
                                      }}
                                    >
                                      <span>{isUserBlocked(profileUser.id) ? "Unblock User" : "Block User"}</span>
                                    </motion.button>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}
                        </div>

                        {!profileUser.isGroup && (isUserBlocked(profileUser.id) || isBlockedByUser(profileUser.id)) && (
                          <div style={{ 
                            width: "100%", 
                            marginTop: "16px",
                            padding: "16px",
                            backgroundColor: "#0D3CFC",
                            borderRadius: "8px",
                            border: "none",
                            textAlign: "center",
                            fontFamily: FONT_FAMILY,
                          }}>
                            <div style={{ fontSize: "14px", color: "#ffffff", fontWeight: 500, fontFamily: FONT_FAMILY }}>
                              {isUserBlocked(profileUser.id) ? "Akun ini telah diblokir" : "Anda telah diblokir oleh user ini"}
                            </div>
                            <div style={{ fontSize: "12px", color: "#ffffff", marginTop: "4px", fontFamily: FONT_FAMILY }}>
                              {isUserBlocked(profileUser.id) ? "Silahkan buka block untuk melanjutkan chat" : "Anda tidak dapat mengirim pesan ke user ini"}
                            </div>
                          </div>
                        )}

                        {profileUser.isGroup && (
                          <div style={{ width: "100%", marginBottom: "16px" }}>
                            <div style={{ 
                              display: "flex",
                              alignItems: "center",
                              gap: "16px",
                              marginBottom: "16px",
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              handleCloseProfile();
                              setSelectedChat(profileUser);
                            }}
                            >
                              <div
                                style={{
                                  width: "64px",
                                  height: "64px",
                                  borderRadius: "8px",
                                  backgroundColor: "#0D3CFC",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "28px",
                                  color: "#fff",
                                  fontWeight: 700,
                                  fontFamily: FONT_FAMILY,
                                }}
                              >
                                {profileUser.groupName?.charAt(0)?.toUpperCase() || "G"}
                              </div>
                              <div>
                                <div style={{ fontSize: "20px", fontWeight: 600, color: "#000", fontFamily: FONT_FAMILY }}>
                                  {profileUser.groupName || "Group Chat"}
                                </div>
                                <div style={{ fontSize: "13px", color: "#666", fontFamily: FONT_FAMILY }}>
                                  {profileUser.groupMembers?.length || 0} members
                                </div>
                                <div style={{ fontSize: "12px", color: "#999", fontFamily: FONT_FAMILY }}>
                                  Created by: {users.find(u => u.id === profileUser.createdBy)?.name || "Unknown"}
                                </div>
                                {(() => {
                                  const onlineMembers = getOnlineGroupMembers(profileUser.groupMembers || []);
                                  if (onlineMembers.length > 0) {
                                    return (
                                      <div style={{ fontSize: "11px", color: "#0D3CFC", marginTop: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
                                        <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#0D3CFC" }} />
                                        Online: {onlineMembers.map(m => m.name).join(", ")}
                                      </div>
                                    );
                                  }
                                  return null;
                                })()}
                                {(() => {
                                  const typingMembers = profileUser.groupMembers?.filter(id => {
                                    const u = users.find(user => user.id === id);
                                    return u?.typing && u.id !== user?.uid;
                                  }) || [];
                                  if (typingMembers.length > 0) {
                                    const names = typingMembers.map(id => {
                                      const u = users.find(user => user.id === id);
                                      return u?.name || "";
                                    }).filter(Boolean);
                                    return (
                                      <div style={{ fontSize: "11px", color: "#666", fontStyle: "italic", marginTop: "2px" }}>
                                        {names.join(", ")} typing...
                                      </div>
                                    );
                                  }
                                  return null;
                                })()}
                              </div>
                            </div>

                            {profileUser.groupDescription && (
                              <div style={{ 
                                fontSize: "14px", 
                                color: "#333", 
                                fontFamily: FONT_FAMILY,
                                marginBottom: "12px",
                                padding: "12px",
                                backgroundColor: "#f5f5f5",
                                borderRadius: "8px",
                              }}>
                                {profileUser.groupDescription}
                              </div>
                            )}

                            <div style={{ fontSize: "14px", fontWeight: 600, color: "#000", marginBottom: "8px", fontFamily: FONT_FAMILY }}>
                              Members {(() => {
                                const onlineCount = (profileUser.groupMembers || []).filter(id => {
                                  const u = users.find(user => user.id === id);
                                  return u?.online && u.id !== user?.uid;
                                }).length;
                                if (onlineCount > 0) {
                                  return <span style={{ fontSize: "11px", fontWeight: 400, color: "#0D3CFC", marginLeft: "6px" }}>• {onlineCount} online</span>;
                                }
                                return null;
                              })()}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                              {profileUser.groupMembers?.map((memberId) => {
                                const member = users.find(u => u.id === memberId);
                                const isGroupAdmin = profileUser.groupAdmins?.includes(memberId);
                                const isOnline = member?.online || false;
                                const isTyping = member?.typing || false;
                                return member ? (
                                  <div key={memberId} style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    padding: "6px 12px",
                                    backgroundColor: isGroupAdmin ? "#0D3CFC" : "#f5f5f5",
                                    borderRadius: "6px",
                                    fontFamily: FONT_FAMILY,
                                    cursor: member.id !== user.uid ? "pointer" : "default",
                                  }}
                                  onClick={() => {
                                    if (member.id !== user.uid) {
                                      handleOpenProfile(member);
                                    }
                                  }}
                                  >
                                    <span style={{
                                      fontSize: "13px",
                                      color: isGroupAdmin ? "#ffffff" : "#000",
                                      fontWeight: isGroupAdmin ? 500 : 400,
                                    }}>
                                      {member.name}
                                      {isGroupAdmin && (
                                        <span style={{
                                          marginLeft: "6px",
                                          fontSize: "9px",
                                          fontWeight: 600,
                                          backgroundColor: "#c5e800",
                                          color: "#000",
                                          padding: "1px 8px",
                                          borderRadius: "10px",
                                          letterSpacing: "0.3px",
                                        }}>
                                          Admin
                                        </span>
                                      )}
                                      {isOnline && <span style={{ marginLeft: "6px", fontSize: "10px", color: isGroupAdmin ? "#aaddff" : "#0D3CFC" }}>● Online</span>}
                                      {isTyping && member.id !== user?.uid && <span style={{ marginLeft: "6px", fontSize: "10px", fontStyle: "italic", color: isGroupAdmin ? "#aaddff" : "#666" }}>typing...</span>}
                                    </span>
                                    {member.isAdmin && <InstagramVerifiedBadge size={12} />}
                                  </div>
                                ) : null;
                              })}
                            </div>

                            {profileUser.createdBy === user.uid && (
                              <div style={{ marginTop: "12px" }}>
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => setShowAddMemberToGroup(!showAddMemberToGroup)}
                                  style={{
                                    padding: "6px 14px",
                                    backgroundColor: "#0D3CFC",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "6px",
                                    fontSize: "12px",
                                    cursor: "pointer",
                                    fontFamily: FONT_FAMILY,
                                  }}
                                >
                                  + Add Member
                                </motion.button>
                                
                                <AnimatePresence>
                                  {showAddMemberToGroup && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      exit={{ opacity: 0, height: 0 }}
                                      style={{ marginTop: "8px", overflow: "hidden" }}
                                    >
                                      <select
                                        value={selectedGroupMember}
                                        onChange={(e) => setSelectedGroupMember(e.target.value)}
                                        style={{
                                          width: "100%",
                                          padding: "8px 12px",
                                          border: "1px solid #e0e0e0",
                                          borderRadius: "6px",
                                          fontSize: "13px",
                                          outline: "none",
                                          fontFamily: FONT_FAMILY,
                                          marginBottom: "8px",
                                          backgroundColor: "#fff",
                                          color: "#000",
                                        }}
                                      >
                                        <option value="">Select user...</option>
                                        {users.filter(u => 
                                          u.id !== user.uid &&
                                          !profileUser.groupMembers?.includes(u.id) &&
                                          !u.isGroup &&
                                          !isUserBlocked(u.id) &&
                                          !isBlockedByUser(u.id)
                                        ).map((u) => (
                                          <option key={u.id} value={u.id}>
                                            {u.name}
                                          </option>
                                        ))}
                                      </select>
                                      <div style={{ display: "flex", gap: "8px" }}>
                                        <motion.button
                                          whileHover={{ scale: 1.02 }}
                                          whileTap={{ scale: 0.98 }}
                                          onClick={handleAddMemberToGroup}
                                          disabled={!selectedGroupMember}
                                          style={{
                                            backgroundColor: selectedGroupMember ? "#0D3CFC" : "#ccc",
                                            color: "#fff",
                                            border: "none",
                                            padding: "6px 14px",
                                            borderRadius: "6px",
                                            fontSize: "12px",
                                            cursor: selectedGroupMember ? "pointer" : "not-allowed",
                                            fontFamily: FONT_FAMILY,
                                          }}
                                        >
                                          Add
                                        </motion.button>
                                        <motion.button
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                          onClick={() => setShowAddMemberToGroup(false)}
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
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            )}

                            <div style={{ display: "flex", gap: "8px", marginTop: "16px", width: "100%" }}>
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
                                  backgroundColor: "#0D3CFC",
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
                                Go to Group Chat
                              </motion.button>
                            </div>
                          </div>
                        )}

                        {!profileUser.isGroup && (
                          <>
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
                                  cursor: "pointer",
                                }}
                                onClick={() => {
                                  if (profileUser.photoURL) {
                                    setShowFullImage(profileUser.photoURL);
                                  }
                                }}
                              >
                                {profileUser.photoURL ? (
                                  <img src={profileUser.photoURL} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                ) : (
                                  <span style={{ color: "#000", fontFamily: FONT_FAMILY }}>{profileUser.name?.charAt(0)?.toUpperCase() || "?"}</span>
                                )}
                              </motion.div>
                              <div>
                                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                  <span style={{ fontSize: "18px", fontWeight: 500, color: "#000", fontFamily: FONT_FAMILY }}>
                                    {profileUser.name}
                                  </span>
                                  {profileUser.isAdmin && <InstagramVerifiedBadge size={16} />}
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

                            <StoriesSection 
                              userEmail={profileUser.email} 
                              onImageClick={(url) => setShowFullImage(url)}
                            />

                            <div style={{ display: "flex", gap: "8px", width: "100%" }}>
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                  if (isUserBlocked(profileUser.id) || isBlockedByUser(profileUser.id)) {
                                    return;
                                  }
                                  handleCloseProfile();
                                  setSelectedChat(profileUser);
                                }}
                                style={{
                                  flex: 1,
                                  padding: "10px",
                                  backgroundColor: (isUserBlocked(profileUser.id) || isBlockedByUser(profileUser.id)) ? "#ccc" : "#0D3CFC",
                                  border: "none",
                                  borderRadius: "8px",
                                  color: (isUserBlocked(profileUser.id) || isBlockedByUser(profileUser.id)) ? "#999" : "#fff",
                                  fontSize: "14px",
                                  fontWeight: 500,
                                  cursor: (isUserBlocked(profileUser.id) || isBlockedByUser(profileUser.id)) ? "not-allowed" : "pointer",
                                  fontFamily: FONT_FAMILY,
                                  transition: "opacity 0.2s ease",
                                }}
                                onMouseEnter={(e) => {
                                  if (!isUserBlocked(profileUser.id) && !isBlockedByUser(profileUser.id)) {
                                    e.currentTarget.style.opacity = "0.8";
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!isUserBlocked(profileUser.id) && !isBlockedByUser(profileUser.id)) {
                                    e.currentTarget.style.opacity = "1";
                                  }
                                }}
                              >
                                {(isUserBlocked(profileUser.id) || isBlockedByUser(profileUser.id)) ? "Cannot Send Message" : "Send Message"}
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
                          </>
                        )}
                      </div>
                    </div>
                  ) : !selectedChat ? (
                    // Chat List View
                    <div style={{ padding: "8px 12px", overflowY: "auto", flex: 1, maxHeight: "640px", fontFamily: FONT_FAMILY }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "10px 14px",
                          backgroundColor: "#c5e800",
                          borderRadius: "8px",
                          marginBottom: "10px",
                          border: "none",
                          fontFamily: FONT_FAMILY,
                        }}
                      >
                        <div>
                          <div style={{ fontSize: "12px", fontWeight: 600, color: "#000", fontFamily: FONT_FAMILY }}>
                            Announcement
                          </div>
                          <div style={{ fontSize: "11px", color: "#000", fontFamily: FONT_FAMILY }}>
                            Chat feature is under development.
                          </div>
                        </div>
                      </div>

                      {hasBlockedUsers && (
                        <div style={{ 
                          width: "100%", 
                          marginBottom: "10px",
                          padding: "12px 16px",
                          backgroundColor: "#0D3CFC",
                          borderRadius: "8px",
                          border: "none",
                          textAlign: "center",
                          fontFamily: FONT_FAMILY,
                        }}>
                          <div style={{ fontSize: "13px", color: "#ffffff", fontWeight: 500, fontFamily: FONT_FAMILY }}>
                            Anda telah memblock beberapa akun. Klik "Unblock" untuk membuka block.
                          </div>
                        </div>
                      )}

                      {hasBlockedByUsers && (
                        <div style={{ 
                          width: "100%", 
                          marginBottom: "10px",
                          padding: "12px 16px",
                          backgroundColor: "#ef4444",
                          borderRadius: "8px",
                          border: "none",
                          textAlign: "center",
                          fontFamily: FONT_FAMILY,
                        }}>
                          <div style={{ fontSize: "13px", color: "#ffffff", fontWeight: 500, fontFamily: FONT_FAMILY }}>
                            {blockedByBanner?.userName || "Beberapa akun"} telah memblokir anda
                          </div>
                          <div style={{ fontSize: "11px", color: "#ffffff", marginTop: "4px", fontFamily: FONT_FAMILY }}>
                            Anda tidak dapat mengirim pesan ke akun yang memblokir anda
                          </div>
                        </div>
                      )}

                      <div style={{
                        padding: "14px",
                        backgroundColor: "#f8f8f8",
                        borderRadius: "12px",
                        marginBottom: "12px",
                        border: "1px solid #e8e8e8",
                      }}>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: "#000", marginBottom: "8px", fontFamily: FONT_FAMILY }}>
                          Tambah User Manual
                        </div>
                        <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                          <input
                            type="text"
                            placeholder="Masukkan email user..."
                            value={searchUserInput}
                            onChange={(e) => setSearchUserInput(e.target.value)}
                            style={{
                              flex: 1,
                              padding: "8px 12px",
                              border: "1px solid #e0e0e0",
                              borderRadius: "6px",
                              fontSize: "13px",
                              outline: "none",
                              fontFamily: FONT_FAMILY,
                              backgroundColor: "#fff",
                              color: "#000",
                            }}
                          />
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSearchUser}
                            style={{
                              padding: "8px 16px",
                              backgroundColor: "#0D3CFC",
                              color: "#fff",
                              border: "none",
                              borderRadius: "6px",
                              fontSize: "13px",
                              cursor: "pointer",
                              fontFamily: FONT_FAMILY,
                              whiteSpace: "nowrap",
                            }}
                          >
                            Cari
                          </motion.button>
                        </div>
                        
                        {searchUserStatus && (
                          <div style={{ 
                            fontSize: "12px", 
                            color: searchUserResult ? "#22c55e" : "#ef4444",
                            marginBottom: "8px",
                            fontFamily: FONT_FAMILY,
                          }}>
                            {searchUserStatus}
                          </div>
                        )}

                        {searchUserResult && (
                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "10px 12px",
                            backgroundColor: "#fff",
                            borderRadius: "6px",
                            border: "1px solid #e0e0e0",
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <div style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "6px",
                                backgroundColor: "#f0f0f0",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                overflow: "hidden",
                              }}>
                                {searchUserResult.photoURL ? (
                                  <img src={searchUserResult.photoURL} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                ) : (
                                  <span style={{ fontSize: "14px", color: "#000" }}>{searchUserResult.name?.charAt(0)?.toUpperCase() || "?"}</span>
                                )}
                              </div>
                              <div>
                                <div style={{ fontSize: "13px", fontWeight: 500, color: "#000" }}>
                                  {searchUserResult.name}
                                  {searchUserResult.isAdmin && <InstagramVerifiedBadge size={12} />}
                                </div>
                                <div style={{ fontSize: "11px", color: "#999" }}>{searchUserResult.email}</div>
                              </div>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={handleAddManualUser}
                              disabled={isUserBlocked(searchUserResult.id) || isBlockedByUser(searchUserResult.id)}
                              style={{
                                padding: "4px 14px",
                                backgroundColor: (isUserBlocked(searchUserResult.id) || isBlockedByUser(searchUserResult.id)) ? "#ccc" : "#0D3CFC",
                                color: "#fff",
                                border: "none",
                                borderRadius: "6px",
                                fontSize: "12px",
                                cursor: (isUserBlocked(searchUserResult.id) || isBlockedByUser(searchUserResult.id)) ? "not-allowed" : "pointer",
                                fontFamily: FONT_FAMILY,
                              }}
                            >
                              Add Chat
                            </motion.button>
                          </div>
                        )}
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
                          marginBottom: "8px",
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

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowAddGroup(!showAddGroup)}
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
                            transform: showAddGroup ? "rotate(45deg)" : "rotate(0deg)",
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
                          New Group
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
                                  {u.isAdmin && <InstagramVerifiedBadge size={12} />}
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
                                  backgroundColor: selectedNewUser ? "#0D3CFC" : "#ccc",
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

                      <AnimatePresence>
                        {showAddGroup && (
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
                              Create Group Chat
                            </div>
                            <input
                              type="text"
                              placeholder="Group Name"
                              value={groupName}
                              onChange={(e) => setGroupName(e.target.value)}
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
                            />
                            <input
                              type="text"
                              placeholder="Group Description (optional)"
                              value={groupDescription}
                              onChange={(e) => setGroupDescription(e.target.value)}
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
                            />
                            <div style={{ fontSize: "12px", fontWeight: 500, color: "#000", marginBottom: "8px", fontFamily: FONT_FAMILY }}>
                              Select Members
                            </div>
                            {availableUsers.map((u) => (
                              <div key={u.id} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                                <input
                                  type="checkbox"
                                  checked={selectedGroupMembers.includes(u.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedGroupMembers([...selectedGroupMembers, u.id]);
                                    } else {
                                      setSelectedGroupMembers(selectedGroupMembers.filter(id => id !== u.id));
                                      setGroupAdmins(groupAdmins.filter(id => id !== u.id));
                                    }
                                  }}
                                  style={{ cursor: "pointer" }}
                                />
                                <span style={{ fontSize: "13px", color: "#000", fontFamily: FONT_FAMILY }}>{u.name}</span>
                                {u.isAdmin && <InstagramVerifiedBadge size={12} />}
                                {selectedGroupMembers.includes(u.id) && (
                                  <button
                                    onClick={() => {
                                      if (groupAdmins.includes(u.id)) {
                                        setGroupAdmins(groupAdmins.filter(id => id !== u.id));
                                      } else {
                                        setGroupAdmins([...groupAdmins, u.id]);
                                      }
                                    }}
                                    style={{
                                      fontSize: "10px",
                                      backgroundColor: groupAdmins.includes(u.id) ? "#0D3CFC" : "#f0f0f0",
                                      color: groupAdmins.includes(u.id) ? "#fff" : "#000",
                                      border: "none",
                                      padding: "2px 10px",
                                      borderRadius: "12px",
                                      cursor: "pointer",
                                      fontFamily: FONT_FAMILY,
                                    }}
                                  >
                                    {groupAdmins.includes(u.id) ? "Admin" : "Make Admin"}
                                  </button>
                                )}
                              </div>
                            ))}
                            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleCreateGroup}
                                style={{
                                  backgroundColor: "#0D3CFC",
                                  color: "#fff",
                                  border: "none",
                                  padding: "8px 16px",
                                  borderRadius: "8px",
                                  fontSize: "12px",
                                  cursor: "pointer",
                                  fontWeight: 500,
                                  transition: "all .2s ease",
                                  fontFamily: FONT_FAMILY,
                                }}
                              >
                                Create Group
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  setShowAddGroup(false);
                                  setGroupName("");
                                  setGroupDescription("");
                                  setSelectedGroupMembers([]);
                                  setGroupAdmins([]);
                                }}
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
                            <span style={{ fontSize: "11px", color: "#999", fontFamily: FONT_FAMILY }}>
                              {showPinnedUsers ? "▼" : "▶"}
                            </span>
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
                                        cursor: "pointer",
                                      }}
                                      onClick={() => {
                                        if (u.photoURL) {
                                          setShowFullImage(u.photoURL);
                                        }
                                      }}
                                    >
                                      {u.photoURL ? (
                                        <img src={u.photoURL} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                      ) : (
                                        <span style={{ color: "#000", fontFamily: FONT_FAMILY }}>{u.name?.charAt(0)?.toUpperCase() || "?"}</span>
                                      )}
                                    </div>
                                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "6px" }}>
                                      <div>
                                        <div 
                                          style={{ fontSize: "12px", fontWeight: 500, color: "#000", cursor: "pointer", fontFamily: FONT_FAMILY }}
                                          onClick={() => handleOpenProfile(u)}
                                        >
                                          {u.name}
                                          {u.isAdmin && <InstagramVerifiedBadge size={12} />}
                                        </div>
                                        <div style={{ fontSize: "9px", color: "#999", fontFamily: FONT_FAMILY }}>
                                          {u.email}
                                        </div>
                                      </div>
                                      <OnlineIndicator online={u.online || false} lastSeen={getLastSeen(u.id)} />
                                    </div>
                                    <div style={{ display: "flex", gap: "4px" }}>
                                      {u.id !== user.uid && !u.isGroup && (
                                        <motion.button
                                          whileHover={{ scale: 1.1 }}
                                          whileTap={{ scale: 0.9 }}
                                          onClick={() => {
                                            const isBlocked = isUserBlocked(u.id);
                                            handleBlockUser(u.id, isBlocked);
                                          }}
                                          style={{
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            color: isUserBlocked(u.id) ? "#ef4444" : "#666",
                                            padding: "2px 8px",
                                            fontSize: "11px",
                                            fontFamily: FONT_FAMILY,
                                          }}
                                        >
                                          {isUserBlocked(u.id) ? "Unblock" : "Block"}
                                        </motion.button>
                                      )}
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
                                  </div>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}

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
                            <span style={{ fontSize: "11px", color: "#999", fontFamily: FONT_FAMILY }}>
                              {showPinnedChats ? "▼" : "▶"}
                            </span>
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
                                  if (room.isGroup) {
                                    return (
                                      <motion.div
                                        key={room.id}
                                        whileHover={{ scale: 1.02 }}
                                        onClick={() => {
                                          const groupUser: ChatUser = {
                                            id: room.id,
                                            name: room.groupName || "Group Chat",
                                            email: "",
                                            photoURL: "",
                                            isGroup: true,
                                            groupName: room.groupName,
                                            groupDescription: room.groupDescription,
                                            groupMembers: room.groupMembers,
                                            groupAdmins: room.groupAdmins,
                                            createdBy: room.createdBy,
                                            online: false,
                                            lastSeen: null,
                                            typing: false,
                                            isPinned: room.isPinned,
                                            isAdmin: false,
                                            blocked: [],
                                            blockedBy: []
                                          };
                                          setSelectedChat(groupUser);
                                        }}
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
                                            backgroundColor: "#0D3CFC",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "14px",
                                            color: "#fff",
                                            flexShrink: 0,
                                          }}
                                        >
                                          G
                                        </div>
                                        <div style={{ flex: 1 }}>
                                          <div style={{ fontSize: "12px", fontWeight: 500, color: "#000", fontFamily: FONT_FAMILY }}>
                                            {room.groupName || "Group Chat"}
                                          </div>
                                          <div style={{ fontSize: "9px", color: "#999", fontFamily: FONT_FAMILY }}>
                                            {room.groupMembers?.length || 0} members
                                          </div>
                                        </div>
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
                                  }

                                  const otherId = room.participants.find(id => id !== user.uid);
                                  const otherUser = users.find(u => u.id === otherId);
                                  if (!otherUser) return null;
                                  const isBlocked = isUserBlocked(otherId) || isBlockedByUser(otherId);
                                  
                                  return (
                                    <motion.div
                                      key={room.id}
                                      whileHover={{ scale: 1.02 }}
                                      onClick={() => {
                                        if (!isBlocked) {
                                          setSelectedChat(otherUser);
                                        }
                                      }}
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px",
                                        padding: "6px 10px",
                                        borderRadius: "6px",
                                        cursor: isBlocked ? "not-allowed" : "pointer",
                                        backgroundColor: isBlocked ? "#f5f5f5" : "#fafafa",
                                        opacity: isBlocked ? 0.6 : 1,
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
                                          cursor: "pointer",
                                        }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (otherUser.photoURL) {
                                            setShowFullImage(otherUser.photoURL);
                                          }
                                        }}
                                      >
                                        {otherUser.photoURL ? (
                                          <img src={otherUser.photoURL} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        ) : (
                                          <span style={{ color: "#000", fontFamily: FONT_FAMILY }}>{otherUser.name?.charAt(0)?.toUpperCase() || "?"}</span>
                                        )}
                                      </div>
                                      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "6px" }}>
                                        <div>
                                          <div 
                                            style={{ fontSize: "12px", fontWeight: 500, color: isBlocked ? "#999" : "#000", cursor: isBlocked ? "not-allowed" : "pointer", fontFamily: FONT_FAMILY }}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (!isBlocked) {
                                                handleOpenProfile(otherUser);
                                              }
                                            }}
                                          >
                                            {otherUser.name}
                                            {otherUser.isAdmin && <InstagramVerifiedBadge size={12} />}
                                          </div>
                                          <div style={{ fontSize: "9px", color: isBlocked ? "#ccc" : "#999", fontFamily: FONT_FAMILY }}>
                                            {isBlocked ? "Blocked" : (room.lastMessage ? room.lastMessage.substring(0, 25) + (room.lastMessage.length > 25 ? "..." : "") : "No messages")}
                                          </div>
                                        </div>
                                        {!isBlocked && <OnlineIndicator online={otherUser.online || false} lastSeen={getLastSeen(otherUser.id)} />}
                                      </div>
                                      {room.unreadCount > 0 && !isBlocked && (
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
                                      {!isBlocked && (
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
                                      )}
                                      {isBlocked && (
                                        <motion.button
                                          whileHover={{ scale: 1.1 }}
                                          whileTap={{ scale: 0.9 }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const blocked = isUserBlocked(otherId);
                                            handleBlockUser(otherId, blocked);
                                          }}
                                          style={{
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            color: "#ef4444",
                                            padding: "2px 8px",
                                            fontSize: "11px",
                                            fontFamily: FONT_FAMILY,
                                          }}
                                        >
                                          Unblock
                                        </motion.button>
                                      )}
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
                            if (room.isGroup) {
                              const typingDisplay = getTypingUsersDisplay(room);
                              return (
                                <motion.div
                                  key={room.id}
                                  whileHover={{ scale: 1.02 }}
                                  onClick={() => {
                                    const groupUser: ChatUser = {
                                      id: room.id,
                                      name: room.groupName || "Group Chat",
                                      email: "",
                                      photoURL: "",
                                      isGroup: true,
                                      groupName: room.groupName,
                                      groupDescription: room.groupDescription,
                                      groupMembers: room.groupMembers,
                                      groupAdmins: room.groupAdmins,
                                      createdBy: room.createdBy,
                                      online: false,
                                      lastSeen: null,
                                      typing: false,
                                      isPinned: room.isPinned,
                                      isAdmin: false,
                                      blocked: [],
                                      blockedBy: []
                                    };
                                    setSelectedChat(groupUser);
                                  }}
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
                                      backgroundColor: "#0D3CFC",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontSize: "20px",
                                      flexShrink: 0,
                                      color: "#fff",
                                    }}
                                  >
                                    G
                                  </div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: "14px", fontWeight: 500, color: "#000", display: "flex", alignItems: "center", gap: "4px", fontFamily: FONT_FAMILY }}>
                                      <span>{room.groupName || "Group Chat"}</span>
                                    </div>
                                    <div style={{ fontSize: "11px", color: "#999", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: FONT_FAMILY }}>
                                      {typingDisplay ? (
                                        <span style={{ color: "#000", fontStyle: "italic" }}>
                                          {typingDisplay.includes(',') || typingDisplay.includes(' and ') ? (
                                            `${typingDisplay} are typing...`
                                          ) : (
                                            `${typingDisplay} is typing...`
                                          )}
                                        </span>
                                      ) : (
                                        `${room.groupMembers?.length || 0} members • ${room.lastMessage || "No messages"}`
                                      )}
                                    </div>
                                  </div>
                                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
                                    {room.lastMessageTime && (
                                      <span style={{ fontSize: "9px", color: "#bbb", fontFamily: FONT_FAMILY }}>
                                        {formatTime(room.lastMessageTime)}
                                      </span>
                                    )}
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
                                  </div>
                                </motion.div>
                              );
                            }

                            const otherId = room.participants.find(id => id !== user.uid);
                            const otherUser = users.find(u => u.id === otherId);
                            if (!otherUser) return null;
                            
                            const isBlocked = isUserBlocked(otherId) || isBlockedByUser(otherId);
                            const isLastMessageFromMe = room.lastMessageSenderId === user.uid;
                            const typingDisplay = getTypingUsersDisplay(room);
                            
                            return (
                              <motion.div
                                key={room.id}
                                whileHover={{ scale: 1.02 }}
                                onClick={() => {
                                  setSelectedChat(otherUser);
                                }}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "10px",
                                  padding: "10px 12px",
                                  borderRadius: "8px",
                                  cursor: "pointer",
                                  transition: "all .2s ease",
                                  marginBottom: "2px",
                                  backgroundColor: isBlocked ? "#f5f5f5" : (room.unreadCount > 0 ? "rgba(197,232,0,0.06)" : "transparent"),
                                  opacity: isBlocked ? 0.8 : 1,
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
                                    cursor: "pointer",
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (otherUser.photoURL) {
                                      setShowFullImage(otherUser.photoURL);
                                    }
                                  }}
                                >
                                  {otherUser.photoURL ? (
                                    <img 
                                      src={otherUser.photoURL} 
                                      alt="avatar" 
                                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    />
                                  ) : (
                                    <span style={{ color: "#000", fontFamily: FONT_FAMILY }}>{otherUser.name?.charAt(0)?.toUpperCase() || "?"}</span>
                                  )}
                                  {otherUser.isAdmin && (
                                    <div style={{ position: "absolute", bottom: -2, right: -2 }}>
                                      <InstagramVerifiedBadge size={12} />
                                    </div>
                                  )}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontSize: "14px", fontWeight: 500, color: isBlocked ? "#999" : "#000", display: "flex", alignItems: "center", gap: "4px", fontFamily: FONT_FAMILY }}>
                                    <span 
                                      style={{ cursor: "pointer" }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenProfile(otherUser);
                                      }}
                                    >
                                      {otherUser.name}
                                      {otherUser.isAdmin && <InstagramVerifiedBadge size={12} />}
                                    </span>
                                    {!isBlocked && <OnlineIndicator online={otherUser.online || false} lastSeen={getLastSeen(otherUser.id)} />}
                                  </div>
                                  <div style={{ fontSize: "11px", color: isBlocked ? "#ccc" : "#999", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: FONT_FAMILY }}>
                                    {isBlocked ? (
                                      <span style={{ color: "#000" }}>Akun diblok - klik untuk chat</span>
                                    ) : typingDisplay ? (
                                      <span style={{ color: "#000", fontStyle: "italic" }}>
                                        {typingDisplay.includes(',') || typingDisplay.includes(' and ') ? (
                                          `${typingDisplay} are typing...`
                                        ) : (
                                          `${typingDisplay} is typing...`
                                        )}
                                      </span>
                                    ) : (
                                      room.lastMessage ? (
                                        <>
                                          {isLastMessageFromMe && "Messages: "}
                                          {room.lastMessage}
                                        </>
                                      ) : (
                                        "No messages"
                                      )
                                    )}
                                  </div>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
                                  {room.lastMessageTime && !isBlocked && (
                                    <span style={{ fontSize: "9px", color: "#bbb", fontFamily: FONT_FAMILY }}>
                                      {formatTime(room.lastMessageTime)}
                                    </span>
                                  )}
                                  {room.unreadCount > 0 && !isBlocked && (
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
                                  {isBlocked ? (
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const blocked = isUserBlocked(otherId);
                                        handleBlockUser(otherId, blocked);
                                      }}
                                      style={{
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        color: "#ef4444",
                                        padding: "2px 8px",
                                        fontSize: "11px",
                                        fontFamily: FONT_FAMILY,
                                      }}
                                    >
                                      Unblock
                                    </motion.button>
                                  ) : (
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
                                  )}
                                </div>
                              </motion.div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  ) : (
                    // Chat View
                    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
                      {/* Chat Header */}
                      <div
                        style={{
                          padding: "12px 16px",
                          borderBottom: "none",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          backgroundColor: "#0D3CFC",
                          flexShrink: 0,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              setSelectedChat(null);
                              setReplyTo(null);
                            }}
                            style={{
                              background: "rgba(255,255,255,0.15)",
                              border: "none",
                              cursor: "pointer",
                              color: "#ffffff",
                              padding: "4px 6px",
                              borderRadius: "4px",
                              transition: "all .2s ease",
                              display: "flex",
                              alignItems: "center",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.25)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.15)";
                            }}
                          >
                            <BackIcon />
                          </motion.button>
                          
                          {selectedChat.isGroup ? (
                            <div
                              style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "8px",
                                backgroundColor: "rgba(255,255,255,0.2)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "18px",
                                color: "#fff",
                                flexShrink: 0,
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                handleOpenProfile(selectedChat);
                              }}
                            >
                              G
                            </div>
                          ) : (
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "8px",
                                backgroundColor: "rgba(255,255,255,0.2)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "16px",
                                overflow: "hidden",
                                color: "#fff",
                                position: "relative",
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                handleOpenProfile(selectedChat);
                              }}
                            >
                              {selectedChat.photoURL ? (
                                <img 
                                  src={selectedChat.photoURL} 
                                  alt="avatar" 
                                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                              ) : (
                                <span style={{ fontFamily: FONT_FAMILY, fontWeight: 600 }}>{selectedChat.name?.charAt(0)?.toUpperCase() || "?"}</span>
                              )}
                            </motion.div>
                          )}
                          
                          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1px", minWidth: 0 }}>
                            <div 
                              style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", flexWrap: "wrap" }}
                              onClick={() => {
                                if (!selectedChat.isGroup) {
                                  handleOpenProfile(selectedChat);
                                }
                              }}
                            >
                              <span style={{ fontSize: "17px", fontWeight: 600, color: "#ffffff", fontFamily: FONT_FAMILY }}>
                                {selectedChat.isGroup ? (selectedChat.groupName || "Group Chat") : selectedChat.name}
                              </span>
                              {!selectedChat.isGroup && selectedChat.isAdmin && <InstagramVerifiedBadge size={14} />}
                              {selectedChat.isGroup && (
                                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", fontFamily: FONT_FAMILY }}>
                                  {selectedChat.groupMembers?.length || 0} members
                                </span>
                              )}
                            </div>
                            {selectedChat.isGroup && selectedChat.groupMembers && (
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.6)", fontFamily: FONT_FAMILY }}>
                                  {selectedChat.groupMembers.map(id => {
                                    const member = users.find(u => u.id === id);
                                    return member ? member.name : "";
                                  }).filter(Boolean).join(", ")}
                                </div>
                                {(() => {
                                  const onlineMembers = getOnlineGroupMembers(selectedChat.groupMembers || []);
                                  if (onlineMembers.length > 0) {
                                    return (
                                      <span style={{ fontSize: "9px", color: "#c5e800", fontFamily: FONT_FAMILY, display: "flex", alignItems: "center", gap: "2px" }}>
                                        <span style={{ display: "inline-block", width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#c5e800" }} />
                                        {onlineMembers.map(m => m.name).join(", ")}
                                      </span>
                                    );
                                  }
                                  return null;
                                })()}
                                {(() => {
                                  const typingMembers = selectedChat.groupMembers?.filter(id => {
                                    const u = users.find(user => user.id === id);
                                    return u?.typing && u.id !== user?.uid;
                                  }) || [];
                                  if (typingMembers.length > 0) {
                                    const names = typingMembers.map(id => {
                                      const u = users.find(user => user.id === id);
                                      return u?.name || "";
                                    }).filter(Boolean);
                                    return (
                                      <span style={{ fontSize: "9px", color: "#ffd700", fontStyle: "italic", fontFamily: FONT_FAMILY }}>
                                        {names.join(", ")} typing...
                                      </span>
                                    );
                                  }
                                  return null;
                                })()}
                              </div>
                            )}
                            {!selectedChat.isGroup && !(isUserBlocked(selectedChat.id) || isBlockedByUser(selectedChat.id)) && (
                              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <OnlineIndicator 
                                  online={getOnlineStatus(selectedChat.id)} 
                                  lastSeen={getLastSeen(selectedChat.id)}
                                />
                                {getOnlineStatus(selectedChat.id) ? (
                                  <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.6)", fontFamily: FONT_FAMILY }}>
                                    {getTypingStatus(selectedChat.id) ? "typing..." : "Online"}
                                  </span>
                                ) : (
                                  <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.6)", fontFamily: FONT_FAMILY }}>
                                    {getLastSeen(selectedChat.id)}
                                  </span>
                                )}
                              </div>
                            )}
                            {(isUserBlocked(selectedChat.id) || isBlockedByUser(selectedChat.id)) && (
                              <span style={{ fontSize: "10px", color: "#ff6b6b", fontFamily: FONT_FAMILY }}>
                                {isUserBlocked(selectedChat.id) ? "Blocked" : "Blocked by user"}
                              </span>
                            )}
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handlePinUser(selectedChat.id, selectedChat.isPinned || false)}
                            style={{
                              background: "rgba(255,255,255,0.15)",
                              border: "none",
                              cursor: "pointer",
                              color: selectedChat.isPinned ? "#c5e800" : "rgba(255,255,255,0.5)",
                              padding: "4px 8px",
                              borderRadius: "4px",
                              display: "flex",
                              alignItems: "center",
                              transition: "all .2s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.25)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.15)";
                            }}
                          >
                            <GooglePinIcon filled={selectedChat.isPinned || false} />
                          </motion.button>
                        </div>
                      </div>

                      {/* Chat View */}
                      <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
                        {/* Pinned Messages */}
                        {pinnedMessages.length > 0 && !(isUserBlocked(selectedChat.id) || isBlockedByUser(selectedChat.id)) && (
                          <div
                            style={{
                              padding: "6px 14px",
                              backgroundColor: "rgba(0,0,0,0.02)",
                              borderBottom: "1px solid rgba(0,0,0,0.04)",
                              fontFamily: FONT_FAMILY,
                              flexShrink: 0,
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
                                <GooglePinIcon filled={true} />
                                <span style={{ fontSize: "11px", fontWeight: 500, color: "#666", fontFamily: FONT_FAMILY }}>
                                  Pinned Messages ({pinnedMessages.length})
                                </span>
                              </div>
                              <span style={{ fontSize: "11px", color: "#999", fontFamily: FONT_FAMILY }}>
                                {showPinnedMessages ? "▼" : "▶"}
                              </span>
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
                                          backgroundColor: isMine ? "rgba(74,144,217,0.1)" : "rgba(255,107,107,0.1)",
                                          fontSize: "11px",
                                          display: "flex",
                                          justifyContent: "space-between",
                                          alignItems: "center",
                                          fontFamily: FONT_FAMILY,
                                        }}
                                      >
                                        <div style={{ flex: 1 }}>
                                          <span style={{ color: "#999", fontSize: "9px", fontFamily: FONT_FAMILY }}>
                                            {isMine ? "Messages: " : `${msg.senderName}: `}
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
                        {replyTo && !(isUserBlocked(selectedChat.id) || isBlockedByUser(selectedChat.id)) && (
                          <div
                            style={{
                              padding: "4px 14px",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              fontFamily: FONT_FAMILY,
                              flexShrink: 0,
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
                            fontFamily: FONT_FAMILY,
                            minHeight: 0,
                          }}
                        >
                          {(isUserBlocked(selectedChat.id) || isBlockedByUser(selectedChat.id)) ? (
                            <div
                              style={{
                                textAlign: "center",
                                color: "#999",
                                fontSize: "14px",
                                marginTop: "60px",
                                fontFamily: FONT_FAMILY,
                              }}
                            >
                              <div style={{ fontWeight: 500, color: "#000", fontFamily: FONT_FAMILY }}>
                                {isUserBlocked(selectedChat.id) ? "Akun sudah di block oleh anda" : "Anda diblokir oleh user ini"}
                              </div>
                              <div style={{ fontSize: "12px", marginTop: "4px", color: "#000", fontFamily: FONT_FAMILY }}>
                                {isUserBlocked(selectedChat.id) ? "Maaf akun ini sudah tidak bisa di chat, silahkan buka block" : "Anda tidak dapat mengirim pesan ke user ini"}
                              </div>
                              {isUserBlocked(selectedChat.id) && (
                                <div style={{ marginTop: "12px" }}>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                      const blocked = isUserBlocked(selectedChat.id);
                                      handleBlockUser(selectedChat.id, blocked);
                                    }}
                                    style={{
                                      padding: "8px 20px",
                                      backgroundColor: "#ef4444",
                                      color: "#fff",
                                      border: "none",
                                      borderRadius: "6px",
                                      fontSize: "13px",
                                      cursor: "pointer",
                                      fontFamily: FONT_FAMILY,
                                    }}
                                  >
                                    Unblock User
                                  </motion.button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <>
                              {selectedChat.isGroup && regularTypingUsers.length > 0 && (
                                <div
                                  style={{
                                    textAlign: "left",
                                    fontSize: "14px",
                                    color: "#666666",
                                    padding: "6px 0 10px 0",
                                    fontStyle: "italic",
                                    fontFamily: FONT_FAMILY,
                                    backgroundColor: "transparent",
                                    fontWeight: 400,
                                  }}
                                >
                                  {getTypingUsersText(regularTypingUsers)}
                                </div>
                              )}

                              {!selectedChat.isGroup && regularTypingUsers.length > 0 && (
                                <div
                                  style={{
                                    textAlign: "left",
                                    fontSize: "14px",
                                    color: "#666666",
                                    padding: "4px 0 8px 0",
                                    fontStyle: "italic",
                                    fontFamily: FONT_FAMILY,
                                    backgroundColor: "transparent",
                                    fontWeight: 400,
                                  }}
                                >
                                  {getTypingUsersText(regularTypingUsers)}
                                </div>
                              )}

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
                                  const chatId = selectedChat.isGroup ? selectedChat.id : [user.uid, selectedChat.id].sort().join("_");
                                  const showDate = idx === 0 || !messages[idx-1]?.timestamp || 
                                    formatDate(msg.timestamp) !== formatDate(messages[idx-1]?.timestamp);
                                  
                                  const replySenderName = msg.replyToSender === user?.displayName ? "You" : msg.replyToSender;
                                  const displayText = msg.encrypted ? decryptMessage(msg.text) : msg.text;
                                  const displayReplyText = msg.replyToText && msg.encrypted ? decryptMessage(msg.replyToText) : msg.replyToText;
                                  
                                  const messageColor = isMine ? "#4A90D9" : "#FF6B6B";
                                  const isSaved = isMessageSaved(msg.id);
                                  const showSenderName = selectedChat.isGroup && !isMine;
                                  
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
                                          maxWidth: "75%",
                                          minWidth: "60px",
                                          padding: "10px 14px",
                                          borderRadius: "12px",
                                          backgroundColor: messageColor,
                                          color: "#ffffff",
                                          fontSize: "14px",
                                          lineHeight: 1.5,
                                          position: "relative",
                                          boxShadow: msg.isPinned ? "0 0 20px rgba(0,0,0,0.15)" : "none",
                                          fontFamily: FONT_FAMILY,
                                        }}
                                      >
                                        {isSaved && (
                                          <div
                                            style={{
                                              position: "absolute",
                                              top: "-8px",
                                              right: "-8px",
                                              backgroundColor: "#0D3CFC",
                                              borderRadius: "50%",
                                              padding: "2px",
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                            }}
                                          >
                                            <SaveIcon filled={true} style={{ width: "12px", height: "12px", color: "#fff" }} />
                                          </div>
                                        )}
                                        {showSenderName && (
                                          <div
                                            style={{
                                              fontSize: "11px",
                                              fontWeight: 600,
                                              color: "rgba(255,255,255,0.85)",
                                              marginBottom: "4px",
                                              fontFamily: FONT_FAMILY,
                                            }}
                                          >
                                            {msg.senderName}
                                          </div>
                                        )}
                                        {msg.isShared && msg.sharedFromName && (
                                          <div
                                            style={{
                                              fontSize: "10px",
                                              color: "rgba(255,255,255,0.7)",
                                              marginBottom: "4px",
                                              fontStyle: "italic",
                                              fontFamily: FONT_FAMILY,
                                            }}
                                          >
                                            From {msg.sharedFromName}
                                          </div>
                                        )}
                                        
                                        {msg.replyTo && displayReplyText && (
                                          <div
                                            style={{
                                              fontSize: "11px",
                                              color: "rgba(255,255,255,0.7)",
                                              padding: "4px 8px",
                                              borderLeft: `2px solid rgba(255,255,255,0.3)`,
                                              marginBottom: "6px",
                                              backgroundColor: "rgba(255,255,255,0.1)",
                                              borderRadius: "4px",
                                              fontFamily: FONT_FAMILY,
                                            }}
                                          >
                                            <span style={{ fontWeight: 500, fontFamily: FONT_FAMILY }}>
                                              {isMine ? `Reply: ${replySenderName}` : `Reply: ${msg.replyToSender}`}
                                            </span>
                                            <span style={{ fontFamily: FONT_FAMILY }}> {displayReplyText}</span>
                                          </div>
                                        )}
                                        
                                        <span style={{ fontFamily: FONT_FAMILY, wordBreak: "break-word" }}>{displayText}</span>
                                        
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
                                              color: "rgba(255,255,255,0.6)",
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
                                              color: "rgba(255,255,255,0.4)",
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
                                                  minWidth: "150px",
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
                                                  <GooglePinIcon filled={msg.isPinned || false} />
                                                  <span>{msg.isPinned ? "Unpin" : "Pin"}</span>
                                                </motion.button>
                                                <motion.button
                                                  whileHover={{ backgroundColor: "#f5f5f5" }}
                                                  onClick={() => {
                                                    handleSaveMessage(chatId, msg.id, isSaved);
                                                  }}
                                                  style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "8px",
                                                    padding: "6px 12px",
                                                    width: "100%",
                                                    background: "none",
                                                    border: "none",
                                                    color: isSaved ? "#0D3CFC" : "#000",
                                                    fontSize: "12px",
                                                    cursor: "pointer",
                                                    borderRadius: "6px",
                                                    transition: "all .2s ease",
                                                    fontFamily: FONT_FAMILY,
                                                  }}
                                                >
                                                  <SaveIcon filled={isSaved} />
                                                  <span>{isSaved ? "Unsave" : "Save"}</span>
                                                </motion.button>
                                                {msg.encrypted && (
                                                  <div style={{ 
                                                    padding: "4px 12px", 
                                                    fontSize: "9px", 
                                                    color: "#22c55e",
                                                    borderTop: "1px solid #f0f0f0",
                                                    marginTop: "2px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "4px",
                                                    fontFamily: FONT_FAMILY,
                                                  }}>
                                                    <span>🔒</span>
                                                    <span>Terenkripsi</span>
                                                  </div>
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
                                            color: "#999",
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
                                          <GooglePinIcon filled={true} />
                                          <span>Pin • {formatTime(msg.pinnedAt || msg.timestamp)}</span>
                                        </div>
                                      )}
                                      {msg.encrypted && !isMine && !showSenderName && (
                                        <div
                                          style={{
                                            alignSelf: "flex-start",
                                            fontSize: "8px",
                                            color: "#22c55e",
                                            marginTop: "-2px",
                                            marginBottom: "4px",
                                            padding: "0 4px",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "4px",
                                            fontFamily: FONT_FAMILY,
                                          }}
                                        >
                                          <span>🔒</span>
                                          <span>End-to-end encrypted</span>
                                        </div>
                                      )}
                                    </React.Fragment>
                                  );
                                })
                              )}
                            </>
                          )}
                          <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div
                          style={{
                            padding: "10px 14px 14px",
                            borderTop: "1px solid rgba(0,0,0,0.04)",
                            display: "flex",
                            flexDirection: "column",
                            gap: "4px",
                            backgroundColor: "#ffffff",
                            fontFamily: FONT_FAMILY,
                            position: "relative",
                            flexShrink: 0,
                          }}
                        >
                          {!(isUserBlocked(selectedChat.id) || isBlockedByUser(selectedChat.id)) && (
                            <>
                              {selectedChat.isGroup && regularTypingUsers.length > 0 && (
                                <div
                                  style={{
                                    textAlign: "left",
                                    fontSize: "13px",
                                    color: "#666666",
                                    padding: "2px 4px 6px 4px",
                                    fontStyle: "italic",
                                    fontFamily: FONT_FAMILY,
                                    backgroundColor: "transparent",
                                    fontWeight: 400,
                                  }}
                                >
                                  {getTypingUsersText(regularTypingUsers)}
                                </div>
                              )}
                              {!selectedChat.isGroup && regularTypingUsers.length > 0 && (
                                <div
                                  style={{
                                    textAlign: "left",
                                    fontSize: "13px",
                                    color: "#666666",
                                    padding: "2px 4px 6px 4px",
                                    fontStyle: "italic",
                                    fontFamily: FONT_FAMILY,
                                    backgroundColor: "transparent",
                                    fontWeight: 400,
                                  }}
                                >
                                  {getTypingUsersText(regularTypingUsers)}
                                </div>
                              )}
                            </>
                          )}
                          <div style={{ display: "flex", gap: "8px" }}>
                            <input
                              type="text"
                              placeholder={(isUserBlocked(selectedChat.id) || isBlockedByUser(selectedChat.id)) ? "Cannot send message" : (replyTo ? "Type a reply..." : "Type a message...")}
                              value={message}
                              onChange={handleTyping}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey && !(isUserBlocked(selectedChat.id) || isBlockedByUser(selectedChat.id))) {
                                  e.preventDefault();
                                  handleSendMessage();
                                }
                              }}
                              disabled={isUserBlocked(selectedChat.id) || isBlockedByUser(selectedChat.id)}
                              style={{
                                flex: 1,
                                padding: "10px 16px",
                                border: "1px solid #e8e8e8",
                                borderRadius: "8px",
                                fontSize: "14px",
                                outline: "none",
                                fontFamily: FONT_FAMILY,
                                transition: "all .2s ease",
                                backgroundColor: (isUserBlocked(selectedChat.id) || isBlockedByUser(selectedChat.id)) ? "#f5f5f5" : "#f5f5f5",
                                color: (isUserBlocked(selectedChat.id) || isBlockedByUser(selectedChat.id)) ? "#999" : "#000",
                                cursor: (isUserBlocked(selectedChat.id) || isBlockedByUser(selectedChat.id)) ? "not-allowed" : "text",
                              }}
                              onFocus={(e) => {
                                if (!(isUserBlocked(selectedChat.id) || isBlockedByUser(selectedChat.id))) {
                                  e.currentTarget.style.borderColor = "#0D3CFC";
                                  e.currentTarget.style.backgroundColor = "#ffffff";
                                }
                              }}
                              onBlur={(e) => {
                                if (!(isUserBlocked(selectedChat.id) || isBlockedByUser(selectedChat.id))) {
                                  e.currentTarget.style.borderColor = "#e8e8e8";
                                  e.currentTarget.style.backgroundColor = "#f5f5f5";
                                }
                              }}
                            />
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={handleSendMessage}
                              disabled={isUserBlocked(selectedChat.id) || isBlockedByUser(selectedChat.id)}
                              style={{
                                backgroundColor: (isUserBlocked(selectedChat.id) || isBlockedByUser(selectedChat.id)) ? "#ccc" : "#0D3CFC",
                                border: "none",
                                padding: "10px 20px",
                                borderRadius: "8px",
                                fontSize: "14px",
                                fontWeight: 500,
                                color: (isUserBlocked(selectedChat.id) || isBlockedByUser(selectedChat.id)) ? "#999" : "#fff",
                                cursor: (isUserBlocked(selectedChat.id) || isBlockedByUser(selectedChat.id)) ? "not-allowed" : "pointer",
                                transition: "all .2s ease",
                                whiteSpace: "nowrap",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                fontFamily: FONT_FAMILY,
                              }}
                              onMouseEnter={(e) => {
                                if (!(isUserBlocked(selectedChat.id) || isBlockedByUser(selectedChat.id))) {
                                  e.currentTarget.style.backgroundColor = "#0a2fc9";
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!(isUserBlocked(selectedChat.id) || isBlockedByUser(selectedChat.id))) {
                                  e.currentTarget.style.backgroundColor = "#0D3CFC";
                                }
                              }}
                            >
                              <span>Send</span>
                              <SendIcon />
                            </motion.button>
                          </div>
                          <div style={{ fontSize: "8px", color: "#22c55e", textAlign: "right", padding: "2px 4px 0", fontFamily: FONT_FAMILY }}>
                            🔒 Pesan dienkripsi end-to-end
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          // ===== BEFORE LOGIN: LIKE PUSAT BANTUAN - Blue text, 2 lines =====
          <div
            style={{
              position: "fixed",
              bottom: "40px",
              right: "40px",
              zIndex: 100,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "2px",
              fontFamily: FONT_FAMILY,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <ChatBubbleIcon size={28} style={{ color: "#0D3CFC" }} />
              <span
                style={{
                  fontSize: "24px",
                  fontWeight: 700,
                  color: "#0D3CFC",
                  letterSpacing: "-0.01em",
                }}
              >
                Live Chat
              </span>
            </div>
            <span
              style={{
                fontSize: "16px",
                fontWeight: 500,
                color: "#0D3CFC",
                opacity: 0.8,
              }}
            >
              Silakan login untuk menggunakan Live Chat
            </span>
          </div>
        )}

        <style jsx>{`
          @keyframes awwwardsPulse {
            0% {
              transform: scale(0.5);
              opacity: 0.2;
            }
            50% {
              transform: scale(1.8);
              opacity: 0.05;
            }
            100% {
              transform: scale(0.5);
              opacity: 0.2;
            }
          }
        `}</style>
      </div>
    </>
  );
}
