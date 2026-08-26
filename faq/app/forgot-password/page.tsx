'use client';

import React, { useState, useEffect, useRef, Suspense } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { initializeApp, getApps } from "firebase/app";
import { 
  getAuth, 
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  orderBy,
  updateDoc,
} from "firebase/firestore";
import gsap from 'gsap';

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

const NorthEastArrow = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 7L17 17M17 7V17H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

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

const ShieldCheck = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L3 6V12C3 16.97 6.84 21.67 12 22C17.16 21.67 21 16.97 21 12V6L12 2Z" stroke="#0D3CFC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 12L11 14L15 10" stroke="#0D3CFC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ShoppingBag = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 6H18L19 18H5L6 6Z" stroke="#0D3CFC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 10V6C9 4.34315 10.3431 3 12 3C13.6569 3 15 4.34315 15 6V10" stroke="#0D3CFC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

// ===== LIVE CHAT AGENT COMPONENT (GUEST) =====
interface LiveChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: any;
  read: boolean;
}

const LiveChatAgentGuest = ({ 
  ticketId, 
  onClose,
}: { 
  ticketId: string;
  onClose: () => void;
}) => {
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [agentOnline, setAgentOnline] = useState(false);
  const [agentName, setAgentName] = useState(AGENT_NAME);
  const [ticketStatus, setTicketStatus] = useState<string>("waiting");
  const [userName, setUserName] = useState<string>("Pengguna");
  const [userEmail, setUserEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!db || !ticketId) return;
    const ticketRef = doc(db, "livechat_tickets", ticketId);
    const unsubscribe = onSnapshot(ticketRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setUserName(data.userName || "Pengguna");
        setUserEmail(data.userEmail || "");
        setTicketStatus(data.status || "waiting");
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [ticketId]);

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "users"), where("email", "==", ADMIN_EMAIL));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const data = doc.data();
        setAgentOnline(data.online || false);
        if (data.displayName) setAgentName(data.displayName);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!db || !ticketId) return;
    const q = query(
      collection(db, "livechat_tickets", ticketId, "messages"),
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
  }, [ticketId]);

  const sendMessage = async () => {
    if (!db || !ticketId || !messageText.trim()) return;
    if (ticketStatus === "resolved" || ticketStatus === "closed") {
      alert("Chat ini sudah selesai. Silahkan buat ticket baru.");
      return;
    }
    try {
      const ticketRef = doc(db, "livechat_tickets", ticketId);
      await addDoc(collection(db, "livechat_tickets", ticketId, "messages"), {
        senderId: "guest_" + ticketId,
        senderName: userName || "Pengguna",
        text: messageText.trim(),
        timestamp: serverTimestamp(),
        read: false,
      });
      await updateDoc(ticketRef, {
        lastMessage: messageText.trim(),
        lastMessageTime: serverTimestamp(),
        status: "active",
      });
      setMessageText("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const isResolved = ticketStatus === "resolved" || ticketStatus === "closed";

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#999', fontFamily: FONT_FAMILY }}>Memuat chat...</div>;
  }

  return (
    <div style={{
      marginTop: "40px",
      borderTop: "1px solid #e8e8e8",
      paddingTop: "40px",
      width: "100%",
      maxWidth: "700px",
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
      }}>
        <div>
          <h3 style={{
            fontSize: "24px",
            fontWeight: 600,
            color: "#0D3CFC",
            fontFamily: FONT_FAMILY,
            margin: 0,
          }}>
            Live Chat Agent
          </h3>
          <div style={{
            fontSize: "14px",
            color: "#666",
            fontFamily: FONT_FAMILY,
            marginTop: "2px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexWrap: "wrap",
          }}>
            <span style={{
              display: "inline-block",
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: agentOnline ? "#22c55e" : "#999",
            }} />
            <span style={{ color: agentOnline ? "#22c55e" : "#999" }}>
              {agentOnline ? "Online" : "Offline"}
            </span>
            <span style={{ color: "#ccc" }}>•</span>
            <span style={{ color: "#0D3CFC" }}>
              Agent: <strong>{agentName}</strong>
              <span style={{
                backgroundColor: "#d1fae5",
                color: "#065f46",
                fontSize: "10px",
                fontWeight: 600,
                padding: "1px 10px",
                borderRadius: "12px",
                marginLeft: "6px",
              }}>
                Agent
              </span>
            </span>
            <span style={{ color: "#ccc" }}>•</span>
            <span style={{ color: "#999", fontSize: "12px" }}>
              {userName}
            </span>
            {isResolved && (
              <span style={{
                backgroundColor: "#e5e7eb",
                color: "#6b7280",
                fontSize: "10px",
                padding: "2px 12px",
                borderRadius: "12px",
              }}>
                Selesai
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "#999",
            cursor: "pointer",
            fontSize: "20px",
            padding: "4px 8px",
          }}
        >
          ✕
        </button>
      </div>

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
            <div style={{
              textAlign: "center",
              color: "#999",
              fontSize: "14px",
              padding: "40px 0",
              fontFamily: FONT_FAMILY,
            }}>
              Belum ada pesan. Mulai chat dengan agent.
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.senderId === "guest_" + ticketId;
              return (
                <div
                  key={msg.id}
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
                      {msg.senderName === AGENT_NAME && (
                        <span style={{
                          backgroundColor: "#d1fae5",
                          color: "#065f46",
                          fontSize: "8px",
                          fontWeight: 600,
                          padding: "1px 8px",
                          borderRadius: "10px",
                        }}>
                          Agent
                        </span>
                      )}
                    </div>
                  )}
                  <div>{msg.text}</div>
                  <div style={{
                    fontSize: "9px",
                    color: isMine ? "rgba(255,255,255,0.6)" : "#999",
                    marginTop: "4px",
                  }}>
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
              );
            })
          )}
          {isResolved && (
            <div style={{
              textAlign: "center",
              color: "#6b7280",
              fontSize: "14px",
              padding: "20px",
              fontFamily: FONT_FAMILY,
              borderTop: "1px solid #e8e8e8",
              marginTop: "8px",
            }}>
              Chat ini sudah selesai. Terima kasih telah menggunakan layanan kami.
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        {!isResolved && (
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
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && messageText.trim()) {
                  sendMessage();
                }
              }}
              placeholder="Ketik pesan..."
              style={{
                flex: 1,
                padding: "10px 14px",
                border: "1px solid #e8e8e8",
                borderRadius: "8px",
                fontSize: "14px",
                outline: "none",
                fontFamily: FONT_FAMILY,
              }}
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
              }}
            >
              <span>Kirim</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ===== KOMPONEN UTAMA =====
function ForgotPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // State untuk preloader
  const [showMain, setShowMain] = useState(false);
  const preloaderRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  // State untuk navbar
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuOverlayRef = useRef<HTMLDivElement>(null);
  const plusIconRef = useRef<HTMLSpanElement>(null);

  // State untuk search
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchExpandedRef = useRef<HTMLDivElement>(null);

  // State untuk notifikasi
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // State untuk opsi lupa
  const [selectedOption, setSelectedOption] = useState<'password' | 'email' | 'pin' | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
  });
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [isResolved, setIsResolved] = useState(false);

  // State untuk pernyataan persetujuan
  const [showAgreement, setShowAgreement] = useState(false);
  const agreementRef = useRef<HTMLDivElement>(null);

  // State untuk daftar user dari loginHistory
  const [registeredUsers, setRegisteredUsers] = useState<{email: string, name: string}[]>([]);
  const [registeredEmails, setRegisteredEmails] = useState<string[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isSearchingName, setIsSearchingName] = useState(false);
  const [nameSearchResult, setNameSearchResult] = useState<{email: string, name: string} | null>(null);
  const [nameNotFound, setNameNotFound] = useState(false);

  // ===== PRELOADER ANIMATION =====
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

  // ===== LOAD ALL REGISTERED USERS FROM LOGIN HISTORY =====
  useEffect(() => {
    if (!db) return;
    
    const loadRegisteredUsers = async () => {
      try {
        setIsLoadingUsers(true);
        
        const loginHistoryRef = collection(db, "loginHistory");
        const querySnapshot = await getDocs(loginHistoryRef);
        
        const users: {email: string, name: string}[] = [];
        const emails: string[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.email) {
            emails.push(data.email);
            // Ambil nama dari berbagai field yang mungkin ada
            let userName = "";
            if (data.displayName) {
              userName = data.displayName;
            } else if (data.name) {
              userName = data.name;
            } else if (data.userName) {
              userName = data.userName;
            } else {
              // Jika tidak ada nama, ambil dari email (bagian sebelum @)
              userName = data.email.split('@')[0];
            }
            users.push({
              email: data.email,
              name: userName
            });
          }
        });
        
        // Tambahkan email admin
        if (ADMIN_EMAIL) {
          emails.push(ADMIN_EMAIL);
          const adminName = ADMIN_EMAIL.split('@')[0];
          users.push({
            email: ADMIN_EMAIL,
            name: AGENT_NAME || adminName
          });
        }
        
        const uniqueEmails = [...new Set(emails)];
        const uniqueUsers = users.filter((user, index, self) => 
          index === self.findIndex((u) => u.email === user.email)
        );
        
        setRegisteredEmails(uniqueEmails);
        setRegisteredUsers(uniqueUsers);
        console.log("Registered users from loginHistory:", uniqueUsers);
        console.log("Registered emails from loginHistory:", uniqueEmails);
        setIsLoadingUsers(false);
      } catch (error) {
        console.error("Error loading registered users from loginHistory:", error);
        setIsLoadingUsers(false);
      }
    };
    
    loadRegisteredUsers();
  }, []);

  // ===== Mounting =====
  useEffect(() => {
    setIsMounted(true);
    setTimeout(() => startPreloaderAnimation(), 500);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [isMounted]);

  // ===== BACA TICKET ID DARI URL =====
  useEffect(() => {
    if (!isMounted || !showMain) return;
    const ticketParam = searchParams?.get('ticket');
    if (ticketParam) {
      setTicketId(ticketParam);
      setShowLiveChat(true);
    }
  }, [searchParams, isMounted, showMain]);

  // ===== SEARCH EXPAND =====
  useEffect(() => {
    if (isSearchOpen && searchExpandedRef.current) {
      gsap.fromTo(searchExpandedRef.current,
        { height: 0, opacity: 0, y: -10 },
        { height: "auto", opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
      );
      setTimeout(() => searchInputRef.current?.focus(), 300);
    }
  }, [isSearchOpen]);

  // ===== CLICK OUTSIDE =====
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
        setSearchQuery("");
        setSearchResults([]);
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

  // ===== GSAP UNTUK PERNYATAAN PERSETUJUAN =====
  const toggleAgreement = () => {
    setShowAgreement(!showAgreement);
    if (!showAgreement && agreementRef.current) {
      gsap.fromTo(agreementRef.current,
        { height: 0, opacity: 0 },
        { height: 'auto', opacity: 1, duration: 0.5, ease: 'power2.out' }
      );
    } else if (agreementRef.current) {
      gsap.to(agreementRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.in'
      });
    }
  };

  // ===== TOGGLE MENU =====
  const toggleMenu = () => {
    if (!isMenuOpen) {
      setIsMenuOpen(true);
      if (menuOverlayRef.current) {
        gsap.fromTo(menuOverlayRef.current,
          { y: "-100%", opacity: 0 },
          { y: "0%", opacity: 1, duration: 0.6, ease: "power2.out" }
        );
      }
      if (plusIconRef.current) {
        gsap.to(plusIconRef.current, {
          rotation: 45,
          duration: 0.4,
          ease: "power2.out"
        });
      }
    } else {
      if (menuOverlayRef.current) {
        gsap.to(menuOverlayRef.current, {
          y: "-100%",
          opacity: 0,
          duration: 0.5,
          ease: "power2.in",
          onComplete: () => {
            setIsMenuOpen(false);
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

  // ===== VALIDASI EMAIL TERDAFTAR =====
  const checkEmailExists = async (email: string): Promise<boolean> => {
    if (registeredEmails.includes(email)) {
      console.log(`Email ${email} ditemukan di database loginHistory`);
      return true;
    }
    
    try {
      const loginHistoryRef = collection(db, "loginHistory");
      const q = query(loginHistoryRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        console.log(`Email ${email} ditemukan di Firestore loginHistory`);
        setRegisteredEmails(prev => [...prev, email]);
        return true;
      }
      
      const usersRef = collection(db, "users");
      const usersQuery = query(usersRef, where("email", "==", email));
      const usersSnapshot = await getDocs(usersQuery);
      
      if (!usersSnapshot.empty) {
        console.log(`Email ${email} ditemukan di koleksi users`);
        setRegisteredEmails(prev => [...prev, email]);
        return true;
      }
      
      try {
        const methods = await fetchSignInMethodsForEmail(auth, email);
        if (methods && methods.length > 0) {
          console.log(`Email ${email} ditemukan di Firebase Auth`);
          setRegisteredEmails(prev => [...prev, email]);
          return true;
        }
      } catch (authError) {
        console.log("Auth check error:", authError);
      }
      
      console.log(`Email ${email} tidak ditemukan`);
      return false;
    } catch (error) {
      console.error("Error checking email:", error);
      return false;
    }
  };

  // ===== CEK NAMA USER DI LOGIN HISTORY =====
  const findEmailByName = async (name: string): Promise<{email: string, name: string} | null> => {
    setIsSearchingName(true);
    setNameSearchResult(null);
    setNameNotFound(false);
    setError("");
    
    try {
      // Cek di data yang sudah dimuat
      const foundUser = registeredUsers.find(user => 
        user.name.toLowerCase() === name.toLowerCase()
      );
      
      if (foundUser) {
        console.log(`Nama ${name} ditemukan di data yang sudah dimuat, email: ${foundUser.email}`);
        setIsSearchingName(false);
        setNameSearchResult(foundUser);
        setNameNotFound(false);
        return foundUser;
      }
      
      // Cari di Firestore loginHistory dengan berbagai field
      const loginHistoryRef = collection(db, "loginHistory");
      
      // Cari dengan field displayName
      const q1 = query(loginHistoryRef, where("displayName", "==", name));
      const snapshot1 = await getDocs(q1);
      
      if (!snapshot1.empty) {
        const data = snapshot1.docs[0].data();
        if (data.email) {
          const result = {
            email: data.email,
            name: data.displayName || data.name || data.userName || name
          };
          console.log(`Nama ${name} ditemukan di Firestore loginHistory dengan email: ${result.email}`);
          setNameSearchResult(result);
          setNameNotFound(false);
          setIsSearchingName(false);
          return result;
        }
      }
      
      // Cari dengan field name
      const q2 = query(loginHistoryRef, where("name", "==", name));
      const snapshot2 = await getDocs(q2);
      
      if (!snapshot2.empty) {
        const data = snapshot2.docs[0].data();
        if (data.email) {
          const result = {
            email: data.email,
            name: data.displayName || data.name || data.userName || name
          };
          console.log(`Nama ${name} ditemukan di Firestore loginHistory dengan email: ${result.email}`);
          setNameSearchResult(result);
          setNameNotFound(false);
          setIsSearchingName(false);
          return result;
        }
      }
      
      // Cari dengan field userName
      const q3 = query(loginHistoryRef, where("userName", "==", name));
      const snapshot3 = await getDocs(q3);
      
      if (!snapshot3.empty) {
        const data = snapshot3.docs[0].data();
        if (data.email) {
          const result = {
            email: data.email,
            name: data.displayName || data.name || data.userName || name
          };
          console.log(`Nama ${name} ditemukan di Firestore loginHistory dengan email: ${result.email}`);
          setNameSearchResult(result);
          setNameNotFound(false);
          setIsSearchingName(false);
          return result;
        }
      }
      
      // Cari di koleksi users
      const usersRef = collection(db, "users");
      const usersQuery = query(usersRef, where("displayName", "==", name));
      const usersSnapshot = await getDocs(usersQuery);
      
      if (!usersSnapshot.empty) {
        const data = usersSnapshot.docs[0].data();
        if (data.email) {
          const result = {
            email: data.email,
            name: data.displayName || data.name || data.userName || name
          };
          console.log(`Nama ${name} ditemukan di koleksi users dengan email: ${result.email}`);
          setNameSearchResult(result);
          setNameNotFound(false);
          setIsSearchingName(false);
          return result;
        }
      }
      
      // Jika tidak ditemukan di database, coba ambil dari email (bagian sebelum @)
      // Cek apakah ada email yang memiliki nama (bagian sebelum @) sama dengan input
      const foundByEmailName = registeredUsers.find(user => {
        const emailName = user.email.split('@')[0];
        return emailName.toLowerCase() === name.toLowerCase();
      });
      
      if (foundByEmailName) {
        console.log(`Nama ${name} ditemukan dari email (bagian sebelum @): ${foundByEmailName.email}`);
        setIsSearchingName(false);
        setNameSearchResult(foundByEmailName);
        setNameNotFound(false);
        return foundByEmailName;
      }
      
      console.log(`Nama ${name} tidak ditemukan`);
      setNameNotFound(true);
      setIsSearchingName(false);
      return null;
    } catch (error) {
      console.error("Error searching name:", error);
      setNameNotFound(true);
      setIsSearchingName(false);
      return null;
    }
  };

  // ===== SUBMIT TICKET =====
  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setError("Anda harus menyetujui Pernyataan Persetujuan.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      let userEmail = formData.email;
      let userName = formData.name;

      if (selectedOption === 'email') {
        if (!formData.name) {
          setError("Nama harus diisi.");
          setLoading(false);
          return;
        }
        
        const result = await findEmailByName(formData.name);
        if (!result) {
          setError("Maaf tidak ada nama yang terdaftar");
          setLoading(false);
          return;
        }
        
        userEmail = result.email;
        userName = result.name;
        formData.email = result.email;
        formData.name = result.name;
      }

      if (selectedOption === 'password' || selectedOption === 'pin') {
        if (!formData.email) {
          setError("Email harus diisi.");
          setLoading(false);
          return;
        }
        
        const emailExists = await checkEmailExists(formData.email);
        if (!emailExists) {
          setError("Email tidak terdaftar. Silakan gunakan email yang sudah terdaftar atau buat akun baru.");
          setLoading(false);
          return;
        }
        userEmail = formData.email;
        userName = formData.name || "Pengguna";
      }

      const ticketData = {
        userId: null,
        userName: userName,
        userEmail: userEmail,
        topic: selectedOption === 'password' ? 'Lupa Password' :
               selectedOption === 'email' ? 'Lupa Email' : 'Lupa Pola Sandi',
        status: 'waiting',
        createdAt: serverTimestamp(),
        unreadCount: 0,
        typing: false,
        typingUserId: null,
        typingUserName: null,
        detail: selectedOption === 'password' ? `Email: ${userEmail}` :
                selectedOption === 'email' ? `Nama: ${userName}, Email ditemukan: ${userEmail}` :
                `Email: ${userEmail}, Nama: ${userName}`,
      };

      const docRef = await addDoc(collection(db, "livechat_tickets"), ticketData);
      const newTicketId = docRef.id;
      
      router.push(`/forgot-password?ticket=${newTicketId}`);
      setTicketId(newTicketId);
      setShowLiveChat(true);
      setLoading(false);
    } catch (err: any) {
      console.error("Error creating ticket:", err);
      setError(err.message || "Terjadi kesalahan. Silakan coba lagi.");
      setLoading(false);
    }
  };

  // ===== RESET FORM =====
  const resetForm = () => {
    setSelectedOption(null);
    setFormData({ email: "", name: "" });
    setAgreed(false);
    setError("");
    setShowLiveChat(false);
    setTicketId(null);
    setIsResolved(false);
    setShowAgreement(false);
    setNameSearchResult(null);
    setNameNotFound(false);
    if (agreementRef.current) {
      gsap.set(agreementRef.current, { height: 0, opacity: 0 });
    }
    router.push('/forgot-password');
  };

  // ===== HANDLE NAME INPUT CHANGE =====
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, name: value });
    setNameSearchResult(null);
    setNameNotFound(false);
    setError("");
  };

  // ===== HANDLE ENTER KEY PRESS =====
  const handleNameKeyPress = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && formData.name.trim()) {
      e.preventDefault();
      const result = await findEmailByName(formData.name);
      if (result) {
        setFormData({ ...formData, email: result.email, name: result.name });
        setNameSearchResult(result);
        setNameNotFound(false);
        setError("");
      } else {
        setNameSearchResult(null);
        setNameNotFound(true);
        setError("Maaf tidak ada nama yang terdaftar");
      }
    }
  };

  // ===== RENDER PRELOADER =====
  if (!isMounted || !showMain) {
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
        <title>Lupa Akses | Menuru</title>
        <meta name="description" content="Pusat Bantuan Lupa Password, Email, atau Pola Sandi" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link rel="icon" href="/images/ai.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/images/ai.jpg" />
      </Head>

      <style jsx global>{`
        body {
          overflow-y: scroll;
          scrollbar-width: none;
          -ms-overflow-style: none;
          scroll-behavior: smooth;
          margin: 0;
          padding: 0;
          background-color: #ffffff !important;
        }
        body::-webkit-scrollbar {
          display: none;
        }
        * {
          scrollbar-width: none;
        }
        *::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div style={{
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        margin: 0,
        padding: 0,
        position: "relative",
        fontFamily: FONT_FAMILY,
        overflowX: "hidden",
        overflowY: "auto",
      }}>
        {/* ===== HEADER / NAVBAR ===== */}
        <div style={{
          position: "fixed",
          top: "40px",
          left: "40px",
          right: "40px",
          zIndex: 101,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pointerEvents: "none",
        }}>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "16px", 
            pointerEvents: "auto",
            opacity: isMenuOpen ? 0 : 1,
            transition: "opacity 0.3s ease",
          }}>
            <Link href="/" passHref style={{ textDecoration: "none" }}>
              <h1
                style={{
                  fontSize: "48px",
                  fontWeight: 700,
                  color: "#000000",
                  fontFamily: FONT_FAMILY,
                  letterSpacing: "-0.03em",
                  margin: 0,
                  padding: 0,
                  lineHeight: 1,
                  cursor: "pointer",
                  background: "transparent",
                }}
              >
                Menuru
              </h1>
            </Link>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "8px",
              padding: "0 16px",
              borderRadius: "12px",
              backgroundColor: isMenuOpen ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0)",
              backdropFilter: isMenuOpen ? "blur(20px)" : "blur(0px)",
              transition: "all 0.3s ease",
              pointerEvents: "auto",
              boxShadow: isMenuOpen ? "0 4px 20px rgba(0,0,0,0.1)" : "none",
              position: "relative",
              zIndex: 102,
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
                  <ShoppingBag size={20} />
                  <span style={{ fontSize: "16px", fontWeight: 500, color: "#0D3CFC", fontFamily: FONT_FAMILY }}>Shop</span>
                </div>
              </Link>
              <Link href="/profile">
                <div style={{ display: "inline-flex", alignItems: "center", cursor: "pointer" }}>
                  <span style={{ fontSize: "16px", fontWeight: 500, color: "#0D3CFC", fontFamily: FONT_FAMILY }}>About</span>
                </div>
              </Link>
              <Link href="/signin">
                <div style={{ display: "inline-flex", alignItems: "center", cursor: "pointer" }}>
                  <span style={{ fontSize: "16px", fontWeight: 500, color: "#0D3CFC", fontFamily: FONT_FAMILY }}>Sign In</span>
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
                <ShieldCheck size={28} />
                <span style={{ fontSize: "30px", fontWeight: 500, color: "#0D3CFC", fontFamily: FONT_FAMILY, lineHeight: 1 }}>Anti-Fraud</span>
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "0" }}>
                <ShieldCheck size={28} />
                <span style={{ fontSize: "30px", fontWeight: 500, color: "#0D3CFC", fontFamily: FONT_FAMILY, lineHeight: 1 }}>Anti-Bot</span>
              </div>
              <Link href="/contact">
                <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", border: "2px solid #0D3CFC", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", backgroundColor: "transparent" }}>
                  <span style={{ fontSize: "16px", fontWeight: 500, color: "#0D3CFC", fontFamily: FONT_FAMILY }}>Get in touch</span>
                  <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", backgroundColor: "#0D3CFC", borderRadius: "4px", padding: "4px", color: "#ffffff" }}>
                    <SouthEastArrow size={24} />
                  </div>
                </div>
              </Link>
              <Link href="/pusat-bantuan">
                <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", border: "2px solid #000000", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", backgroundColor: "transparent" }}>
                  <span style={{ fontSize: "16px", fontWeight: 500, color: "#000000", fontFamily: FONT_FAMILY }}>Pusat Bantuan</span>
                  <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", backgroundColor: "#000000", borderRadius: "4px", padding: "4px", color: "#ffffff" }}>
                    <NorthWestArrow size={24} />
                  </div>
                </div>
              </Link>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", border: "2px solid #000000", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", backgroundColor: "transparent" }} onClick={toggleMenu}>
                <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", backgroundColor: "#000000", borderRadius: "4px", padding: "4px", color: "#ffffff" }}>
                  <span ref={plusIconRef} style={{ fontSize: isMenuOpen ? "24px" : "28px", fontWeight: isMenuOpen ? 400 : 300, fontFamily: FONT_FAMILY, lineHeight: 1, display: "inline-block" }}>
                    {isMenuOpen ? "✕" : "+"}
                  </span>
                </div>
                <span style={{ fontSize: "16px", fontWeight: 500, color: "#000000", fontFamily: FONT_FAMILY, letterSpacing: "0.02em" }}>
                  {isMenuOpen ? "Close" : "Menu"}
                </span>
              </div>
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
            zIndex: 100,
            display: isMenuOpen ? "flex" : "none",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "flex-start",
            transform: "translateY(-100%)",
            opacity: 0,
            pointerEvents: isMenuOpen ? "auto" : "none",
            padding: "40px",
          }}
        >
          <h1
            style={{
              fontSize: "48px",
              fontWeight: 700,
              color: "#ffffff",
              fontFamily: FONT_FAMILY,
              letterSpacing: "-0.03em",
              margin: 0,
              padding: 0,
              lineHeight: 1,
              opacity: 0.9,
              position: "absolute",
              top: "40px",
              left: "40px",
            }}
          >
            Menuru
          </h1>
        </div>

        {/* ===== KONTEN UTAMA ===== */}
        <div style={{
          marginTop: "180px",
          padding: "0 40px 80px",
          width: "100%",
          maxWidth: "1400px",
          marginLeft: "auto",
          marginRight: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          minHeight: "calc(100vh - 260px)",
          justifyContent: "flex-start",
          position: "relative",
          zIndex: 1,
        }}>
          {!showLiveChat ? (
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "power2.out" }}
              style={{
                width: "100%",
                maxWidth: "900px",
              }}
            >
              {!selectedOption ? (
                <>
                  <h1 style={{
                    fontSize: isMobile ? "60px" : "120px",
                    fontWeight: 700,
                    color: "#0D3CFC",
                    fontFamily: FONT_FAMILY,
                    letterSpacing: "-0.03em",
                    lineHeight: 1,
                    margin: "0 0 20px 0",
                    textAlign: "left",
                  }}>
                    Lupa Akses
                  </h1>
                  <p style={{
                    fontSize: "18px",
                    color: "#666",
                    fontFamily: FONT_FAMILY,
                    marginBottom: "48px",
                  }}>
                    Pilih masalah yang Anda alami:
                  </p>

                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    width: '100%',
                    maxWidth: '500px',
                  }}>
                    {[
                      { id: 'password', label: 'Lupa Password' },
                      { id: 'email', label: 'Lupa Email' },
                      { id: 'pin', label: 'Lupa Pola Sandi' },
                    ].map((item) => (
                      <motion.div
                        key={item.id}
                        whileHover={{ x: 8 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '16px 0',
                          cursor: 'pointer',
                          borderBottom: '1px solid #f0f0f0',
                        }}
                        onClick={() => {
                          setSelectedOption(item.id as any);
                          setNameSearchResult(null);
                          setNameNotFound(false);
                          setError("");
                          setFormData({ email: "", name: "" });
                        }}
                      >
                        <span style={{
                          fontSize: '24px',
                          fontWeight: 400,
                          color: '#0D3CFC',
                          fontFamily: FONT_FAMILY,
                        }}>
                          {item.label}
                        </span>
                        <NorthEastArrow size={40} />
                      </motion.div>
                    ))}
                  </div>

                  <div style={{
                    marginTop: '48px',
                    display: 'flex',
                    gap: '24px',
                    flexWrap: 'wrap',
                  }}>
                    <Link href="/signin" style={{
                      color: '#0D3CFC',
                      fontSize: '16px',
                      fontFamily: FONT_FAMILY,
                      textDecoration: 'underline',
                    }}>
                      Kembali ke Sign In
                    </Link>
                    <span style={{ color: '#ccc' }}>|</span>
                    <Link href="/signup" style={{
                      color: '#0D3CFC',
                      fontSize: '16px',
                      fontFamily: FONT_FAMILY,
                      textDecoration: 'underline',
                    }}>
                      Buat Akun Baru
                    </Link>
                    <span style={{ color: '#ccc' }}>|</span>
                    <Link href="/pusat-bantuan" style={{
                      color: '#0D3CFC',
                      fontSize: '16px',
                      fontFamily: FONT_FAMILY,
                      textDecoration: 'underline',
                    }}>
                      Pusat Bantuan
                    </Link>
                  </div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  style={{ width: '100%' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                    <button
                      onClick={() => {
                        setSelectedOption(null);
                        setNameSearchResult(null);
                        setNameNotFound(false);
                        setError("");
                        setFormData({ email: "", name: "" });
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#0D3CFC',
                        fontSize: '24px',
                        cursor: 'pointer',
                        fontFamily: FONT_FAMILY,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <NorthEastArrow size={30} style={{ transform: 'rotate(180deg)' }} />
                      <span style={{ fontSize: '18px' }}>Kembali</span>
                    </button>
                  </div>

                  <h2 style={{
                    fontSize: '32px',
                    fontWeight: 600,
                    color: '#0D3CFC',
                    fontFamily: FONT_FAMILY,
                    marginBottom: '8px',
                  }}>
                    {selectedOption === 'password' && 'Lupa Password'}
                    {selectedOption === 'email' && 'Lupa Email'}
                    {selectedOption === 'pin' && 'Lupa Pola Sandi'}
                  </h2>
                  <p style={{
                    fontSize: '16px',
                    color: '#666',
                    fontFamily: FONT_FAMILY,
                    marginBottom: '32px',
                  }}>
                    {selectedOption === 'password' && 'Masukkan email terdaftar Anda. Agent akan membantu reset password.'}
                    {selectedOption === 'email' && 'Masukkan nama lengkap Anda yang terdaftar di login history untuk menemukan email Anda. Tekan Enter untuk mencari.'}
                    {selectedOption === 'pin' && 'Masukkan email dan nama Anda untuk reset pola sandi.'}
                  </p>

                  <form onSubmit={handleSubmitTicket} style={{ width: '100%', maxWidth: '500px' }}>
                    {selectedOption === 'password' && (
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '14px', color: '#666', marginBottom: '4px', fontFamily: FONT_FAMILY }}>
                          Email Terdaftar
                        </label>
                        <input
                          type="email"
                          placeholder="Masukkan email Anda"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          style={{
                            width: '100%',
                            padding: '14px 16px',
                            border: '2px solid #e8e8e8',
                            borderRadius: '12px',
                            fontSize: '16px',
                            fontFamily: FONT_FAMILY,
                            outline: 'none',
                            transition: 'border-color 0.2s ease',
                          }}
                          onFocus={(e) => e.currentTarget.style.borderColor = '#0D3CFC'}
                          onBlur={(e) => e.currentTarget.style.borderColor = '#e8e8e8'}
                        />
                      </div>
                    )}

                    {selectedOption === 'email' && (
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '14px', color: '#666', marginBottom: '4px', fontFamily: FONT_FAMILY }}>
                          Nama Lengkap (sesuai saat login)
                        </label>
                        <input
                          type="text"
                          placeholder="Masukkan nama lengkap Anda, lalu tekan Enter"
                          value={formData.name}
                          onChange={handleNameChange}
                          onKeyPress={handleNameKeyPress}
                          required
                          style={{
                            width: '100%',
                            padding: '14px 16px',
                            border: '2px solid #e8e8e8',
                            borderRadius: '12px',
                            fontSize: '16px',
                            fontFamily: FONT_FAMILY,
                            outline: 'none',
                            transition: 'border-color 0.2s ease',
                          }}
                          onFocus={(e) => e.currentTarget.style.borderColor = '#0D3CFC'}
                          onBlur={(e) => e.currentTarget.style.borderColor = '#e8e8e8'}
                        />
                        {isSearchingName && (
                          <div style={{ fontSize: '14px', color: '#0D3CFC', marginTop: '8px', fontFamily: FONT_FAMILY }}>
                            Mencari nama...
                          </div>
                        )}
                        {nameSearchResult && (
                          <div style={{ 
                            fontSize: '14px', 
                            color: '#22c55e', 
                            marginTop: '8px', 
                            fontFamily: FONT_FAMILY,
                          }}>
                            Nama ditemukan! Email: {nameSearchResult.email}
                          </div>
                        )}
                        {nameNotFound && (
                          <div style={{ 
                            fontSize: '14px', 
                            color: '#0D3CFC', 
                            marginTop: '8px', 
                            fontFamily: FONT_FAMILY,
                          }}>
                            Maaf tidak ada nama yang terdaftar
                          </div>
                        )}
                        <div style={{
                          fontSize: '12px',
                          color: '#999',
                          marginTop: '4px',
                          fontFamily: FONT_FAMILY,
                        }}>
                          Masukkan nama lengkap yang Anda gunakan saat login, lalu tekan Enter untuk mencari email
                        </div>
                      </div>
                    )}

                    {selectedOption === 'pin' && (
                      <>
                        <div style={{ marginBottom: '16px' }}>
                          <label style={{ display: 'block', fontSize: '14px', color: '#666', marginBottom: '4px', fontFamily: FONT_FAMILY }}>
                            Nama Lengkap
                          </label>
                          <input
                            type="text"
                            placeholder="Masukkan nama Anda"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            style={{
                              width: '100%',
                              padding: '14px 16px',
                              border: '2px solid #e8e8e8',
                              borderRadius: '12px',
                              fontSize: '16px',
                              fontFamily: FONT_FAMILY,
                              outline: 'none',
                              transition: 'border-color 0.2s ease',
                            }}
                            onFocus={(e) => e.currentTarget.style.borderColor = '#0D3CFC'}
                            onBlur={(e) => e.currentTarget.style.borderColor = '#e8e8e8'}
                          />
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                          <label style={{ display: 'block', fontSize: '14px', color: '#666', marginBottom: '4px', fontFamily: FONT_FAMILY }}>
                            Email Terdaftar
                          </label>
                          <input
                            type="email"
                            placeholder="Masukkan email Anda"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            style={{
                              width: '100%',
                              padding: '14px 16px',
                              border: '2px solid #e8e8e8',
                              borderRadius: '12px',
                              fontSize: '16px',
                              fontFamily: FONT_FAMILY,
                              outline: 'none',
                              transition: 'border-color 0.2s ease',
                            }}
                            onFocus={(e) => e.currentTarget.style.borderColor = '#0D3CFC'}
                            onBlur={(e) => e.currentTarget.style.borderColor = '#e8e8e8'}
                          />
                        </div>
                      </>
                    )}

                    {/* Pernyataan Persetujuan */}
                    <div style={{ marginBottom: '20px', marginTop: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <input
                          type="checkbox"
                          id="agree"
                          checked={agreed}
                          onChange={() => setAgreed(!agreed)}
                          style={{
                            width: '20px',
                            height: '20px',
                            marginTop: '2px',
                            accentColor: '#0D3CFC',
                            cursor: 'pointer',
                          }}
                        />
                        <label
                          htmlFor="agree"
                          style={{
                            fontSize: '16px',
                            color: '#0D3CFC',
                            fontFamily: FONT_FAMILY,
                            cursor: 'pointer',
                            lineHeight: 1.5,
                          }}
                          onClick={toggleAgreement}
                        >
                          Saya menyetujui <strong>Pernyataan Persetujuan</strong>
                        </label>
                      </div>

                      <div
                        ref={agreementRef}
                        style={{
                          overflow: 'hidden',
                          height: 0,
                          opacity: 0,
                          marginTop: '12px',
                        }}
                      >
                        <div style={{
                          padding: '16px 0',
                          fontSize: '16px',
                          color: '#333',
                          lineHeight: 1.8,
                          fontFamily: FONT_FAMILY,
                          maxHeight: '300px',
                          overflowY: 'auto',
                          scrollbarWidth: 'none',
                          msOverflowStyle: 'none',
                        }}>
                          <h4 style={{ fontSize: '18px', fontWeight: 600, color: '#0D3CFC', marginBottom: '12px' }}>
                            Pernyataan Persetujuan
                          </h4>
                          <p><strong>1. Tujuan Pengumpulan Data</strong></p>
                          <p style={{ marginLeft: '20px' }}>1.1 Data yang Anda berikan akan digunakan untuk memproses permintaan bantuan Anda.</p>
                          <p style={{ marginLeft: '20px' }}>1.2 Tim support akan menghubungi Anda melalui email atau live chat.</p>
                          <p><strong>2. Keamanan Data</strong></p>
                          <p style={{ marginLeft: '20px' }}>2.1 Data Anda akan dilindungi sesuai dengan Kebijakan Privasi Menuru.</p>
                          <p style={{ marginLeft: '20px' }}>2.2 Kami tidak akan membagikan data Anda ke pihak ketiga tanpa izin.</p>
                          <p><strong>3. Proses Bantuan</strong></p>
                          <p style={{ marginLeft: '20px' }}>3.1 Tim support akan merespons dalam waktu 1x24 jam.</p>
                          <p style={{ marginLeft: '20px' }}>3.2 Anda dapat melihat status tiket melalui live chat agent.</p>
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div style={{
                        color: '#0D3CFC',
                        fontSize: '15px',
                        fontFamily: FONT_FAMILY,
                        marginBottom: '16px',
                      }}>
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading || isSearchingName}
                      style={{
                        width: '100%',
                        padding: '16px',
                        backgroundColor: (loading || isSearchingName) ? '#ccc' : '#0D3CFC',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '18px',
                        fontWeight: 600,
                        fontFamily: FONT_FAMILY,
                        cursor: (loading || isSearchingName) ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {loading ? 'Mengirim...' : isSearchingName ? 'Mencari...' : 'Kirim Tiket'}
                    </button>
                  </form>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    gap: '24px',
                    marginTop: '30px',
                    flexWrap: 'wrap',
                  }}>
                    <Link href="/kebijakan" style={{
                      color: '#0D3CFC',
                      fontSize: '14px',
                      fontFamily: FONT_FAMILY,
                      textDecoration: 'underline',
                    }}>
                      Kebijakan Privasi
                    </Link>
                    <Link href="/ketentuan" style={{
                      color: '#0D3CFC',
                      fontSize: '14px',
                      fontFamily: FONT_FAMILY,
                      textDecoration: 'underline',
                    }}>
                      Ketentuan Kami
                    </Link>
                    <Link href="/pusat-bantuan" style={{
                      color: '#0D3CFC',
                      fontSize: '14px',
                      fontFamily: FONT_FAMILY,
                      textDecoration: 'underline',
                    }}>
                      Pusat Bantuan
                    </Link>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                width: '100%',
                maxWidth: '800px',
              }}
            >
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{
                  fontSize: '28px',
                  fontWeight: 600,
                  color: '#0D3CFC',
                  fontFamily: FONT_FAMILY,
                  marginBottom: '4px',
                }}>
                  Tiket Aktif
                </h2>
                <p style={{
                  fontSize: '16px',
                  color: '#666',
                  fontFamily: FONT_FAMILY,
                }}>
                  Chat dengan agent. Pesan akan tetap tersimpan meskipun Anda refresh halaman.
                </p>
                <p style={{
                  fontSize: '14px',
                  color: '#999',
                  fontFamily: FONT_FAMILY,
                  marginTop: '4px',
                }}>
                  ID Tiket: <strong style={{ color: '#0D3CFC' }}>{ticketId}</strong>
                </p>
                {isResolved && (
                  <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    fontFamily: FONT_FAMILY,
                    marginTop: '4px',
                  }}>
                    Chat ini sudah selesai. Terima kasih.
                  </p>
                )}
              </div>

              {ticketId && (
                <LiveChatAgentGuest
                  ticketId={ticketId}
                  onClose={() => {
                    resetForm();
                  }}
                />
              )}

              <div style={{
                marginTop: '30px',
                display: 'flex',
                gap: '16px',
                flexWrap: 'wrap',
              }}>
                <Link href="/" style={{
                  color: '#0D3CFC',
                  fontSize: '16px',
                  fontFamily: FONT_FAMILY,
                  textDecoration: 'underline',
                }}>
                  Ke Beranda
                </Link>
                <Link href="/signin" style={{
                  color: '#0D3CFC',
                  fontSize: '16px',
                  fontFamily: FONT_FAMILY,
                  textDecoration: 'underline',
                }}>
                  Sign In
                </Link>
                <button
                  onClick={() => {
                    resetForm();
                  }}
                  style={{
                    color: '#666',
                    fontSize: '16px',
                    fontFamily: FONT_FAMILY,
                    textDecoration: 'underline',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Buat Tiket Baru
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}

// ===== WRAPPER DENGAN SUSPENSE UNTUK useSearchParams =====
export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: FONT_FAMILY,
      }}>
        <div style={{ color: '#000', fontSize: '1.5rem' }}>Loading...</div>
      </div>
    }>
      <ForgotPasswordContent />
    </Suspense>
  );
}

export const dynamic = 'force-dynamic';
