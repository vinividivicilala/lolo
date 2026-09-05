'use client';

import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
import { getFirestore, collection, query, where, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, orderBy, getDocs, deleteDoc, setDoc } from "firebase/firestore";
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

const MegaphoneIcon = ({ size = 20, color = "currentColor" }: { size?: number, color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 11L11 7V17L3 13V11Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M11 10L18 6V18L11 14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18 10C19.1046 10 20 10.8954 20 12C20 13.1046 19.1046 14 18 14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BroadcastIcon = ({ size = 20, color = "currentColor" }: { size?: number, color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="12" r="2" fill={color}/>
    <circle cx="12" cy="12" r="6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeDasharray="2 2"/>
  </svg>
);

const UserIcon = ({ size = 20, color = "currentColor" }: { size?: number, color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LogoutIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SendIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CloseIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const EditIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Footer links - lengkap dengan Live Chat dan Live Chat Agent
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
  { name: "Live Chat Agent", number: "04" },
  { name: "Donation", number: "05" },
  { name: "Contact", number: "06" },
  { name: "Note", number: "07" }
];

// ===== PULSING DOTS =====
const PulsingDots = ({ active }: { active: boolean }) => {
  if (!active) return <span style={{ color: '#999', fontSize: '11px' }}>● Offline</span>;
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

// ===== MAIN PAGE =====
export default function LiveChatPage(): React.JSX.Element {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showMain, setShowMain] = useState(false);
  
  // Live Chat Agent States
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState("");
  const [agentOnline, setAgentOnline] = useState(false);
  const [agentDescription, setAgentDescription] = useState("Saya siap membantu Anda dengan segala pertanyaan seputar produk dan layanan Menuru.");
  const [agentPhoto, setAgentPhoto] = useState("/images/ai.jpg");
  const [agentName, setAgentName] = useState(AGENT_NAME);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastToAll, setBroadcastToAll] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [announcementText, setAnnouncementText] = useState("");
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState(AGENT_NAME);
  const [editDescription, setEditDescription] = useState("Saya siap membantu Anda dengan segala pertanyaan seputar produk dan layanan Menuru.");
  const [editPhoto, setEditPhoto] = useState("/images/ai.jpg");
  const [showProfile, setShowProfile] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatMessagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const liveChatTitleRef = useRef<HTMLDivElement>(null);

  // Preloader refs
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

  // Set mounted state
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auth
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

  // Start preloader after auth check
  useEffect(() => {
    if (!isMounted || loading) return;
    setTimeout(() => startPreloaderAnimation(), 500);
  }, [isMounted, loading]);

  // Live Chat Agent - Fetch Tickets
  useEffect(() => {
    if (!db || !user || !isMounted || !showMain) return;
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
      const ticketList: any[] = [];
      snapshot.forEach((doc) => {
        ticketList.push({ id: doc.id, ...doc.data() });
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
  }, [db, user, isAdmin, selectedTicket, isMounted, showMain]);

  // Live Chat Agent - Fetch Messages
  useEffect(() => {
    if (!db || !selectedTicket || !isMounted || !showMain) return;
    const q = query(
      collection(db, "livechat_tickets", selectedTicket.id, "messages"),
      orderBy("timestamp", "asc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgList: any[] = [];
      snapshot.forEach((doc) => {
        msgList.push({ id: doc.id, ...doc.data() });
      });
      setMessages(msgList);
      setTimeout(() => {
        scrollToBottom();
      }, 50);
    });
    return () => unsubscribe();
  }, [db, selectedTicket, isMounted, showMain]);

  // Fetch Announcements
  useEffect(() => {
    if (!db || !isMounted || !showMain) return;
    const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setAnnouncements(list);
    });
    return () => unsubscribe();
  }, [db, isMounted, showMain]);

  // Agent Online Status
  useEffect(() => {
    if (!db || !isMounted || !showMain) return;
    const q = query(collection(db, "users"), where("email", "==", ADMIN_EMAIL));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const data = doc.data();
        setAgentOnline(data.online || false);
      }
    });
    return () => unsubscribe();
  }, [db, isMounted, showMain]);

  // GSAP SplitText untuk judul Live Chat Agent
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

  // GSAP animation for menu drawer opening
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

  // GSAP for Menuru text in footer
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

  // ===== LIVE CHAT AGENT FUNCTIONS =====
  const scrollToBottom = () => {
    if (chatMessagesContainerRef.current) {
      chatMessagesContainerRef.current.scrollTop = chatMessagesContainerRef.current.scrollHeight;
    }
  };

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

  const formatTime = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
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
      const senderName = isAdmin ? agentName : (user.displayName || user.email || "User");
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
        agentName: isAdmin ? agentName : selectedTicket.agentName,
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
        agentName: agentName,
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

  const handleBroadcast = async () => {
    if (!db || !broadcastMessage.trim() || !isAdmin) return;
    try {
      // Broadcast to all active tickets
      const activeTickets = tickets.filter(t => t.status === 'active' || t.status === 'waiting');
      for (const ticket of activeTickets) {
        await addDoc(collection(db, "livechat_tickets", ticket.id, "messages"), {
          senderId: user.uid,
          senderName: agentName,
          text: `📢 PENGUMUMAN: ${broadcastMessage.trim()}`,
          timestamp: serverTimestamp(),
          read: false,
          isBroadcast: true,
        });
        await updateDoc(doc(db, "livechat_tickets", ticket.id), {
          lastMessage: `📢 PENGUMUMAN: ${broadcastMessage.trim()}`,
          lastMessageTime: serverTimestamp(),
        });
      }
      
      // Save as announcement
      await addDoc(collection(db, "announcements"), {
        text: broadcastMessage.trim(),
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        createdByName: agentName,
      });
      
      setBroadcastMessage("");
      setShowBroadcast(false);
      alert("Pesan broadcast berhasil dikirim ke semua chat aktif!");
    } catch (error) {
      console.error("Error broadcasting:", error);
      alert("Gagal mengirim broadcast. Silakan coba lagi.");
    }
  };

  const handleAnnouncement = async () => {
    if (!db || !announcementText.trim() || !isAdmin) return;
    try {
      await addDoc(collection(db, "announcements"), {
        text: announcementText.trim(),
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        createdByName: agentName,
        isAnnouncement: true,
      });
      setAnnouncementText("");
      setShowAnnouncement(false);
      alert("Pengumuman berhasil diposting!");
    } catch (error) {
      console.error("Error posting announcement:", error);
      alert("Gagal memposting pengumuman. Silakan coba lagi.");
    }
  };

  const saveProfile = async () => {
    if (!db || !user || !isAdmin) return;
    try {
      setAgentName(editName);
      setAgentDescription(editDescription);
      setAgentPhoto(editPhoto);
      
      // Save to user profile
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        displayName: editName,
        photoURL: editPhoto,
        description: editDescription,
      });
      
      // Update profile in all tickets
      const activeTickets = tickets.filter(t => t.status === 'active' || t.status === 'waiting');
      for (const ticket of activeTickets) {
        await updateDoc(doc(db, "livechat_tickets", ticket.id), {
          agentName: editName,
        });
      }
      
      setShowEditProfile(false);
      setShowProfile(false);
      alert("Profil berhasil diperbarui!");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Gagal menyimpan profil. Silakan coba lagi.");
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
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // ===== CHAT INTERFACE COMPONENT =====
  const ChatInterface = () => {
    if (!user) {
      return (
        <div style={{ 
          padding: "40px 20px", 
          textAlign: "center",
          backgroundColor: "#f9f9f9",
          borderRadius: "12px",
          border: "1px solid #e8e8e8",
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>💬</div>
          <h3 style={{ fontFamily: FONT_FAMILY, color: "#0D3CFC", marginBottom: "8px" }}>Live Chat Agent</h3>
          <p style={{ fontFamily: FONT_FAMILY, color: "#666", fontSize: "14px", marginBottom: "16px" }}>
            Silakan login untuk menggunakan Live Chat Agent
          </p>
          <Link href="/" style={{ textDecoration: "none" }}>
            <button style={{
              padding: "8px 24px",
              backgroundColor: "#0D3CFC",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: FONT_FAMILY,
            }}>
              Login
            </button>
          </Link>
        </div>
      );
    }

    if (!isAdmin) {
      // User View - Simple Chat List
      return (
        <div style={{ 
          display: "flex", 
          gap: "16px", 
          height: "500px",
          backgroundColor: "#fff",
          borderRadius: "12px",
          border: "1px solid #e8e8e8",
          overflow: "hidden",
        }}>
          {/* Left - Ticket List */}
          <div style={{
            width: "280px",
            backgroundColor: "#0D3CFC",
            padding: "16px 0",
            overflowY: "auto",
            flexShrink: 0,
          }}>
            <div style={{
              padding: "0 16px 12px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.15)",
              color: "#fff",
              fontFamily: FONT_FAMILY,
              fontSize: "14px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <span>Riwayat Chat</span>
              <span style={{
                fontSize: "11px",
                backgroundColor: "rgba(255,255,255,0.2)",
                padding: "2px 10px",
                borderRadius: "12px",
              }}>{tickets.length}</span>
            </div>
            <div style={{ overflowY: "auto", height: "380px" }}>
              {tickets.map((ticket) => {
                const statusLabel = ticket.status === 'waiting' ? 'Menunggu' :
                                    ticket.status === 'active' ? 'Aktif' : 'Selesai';
                return (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    style={{
                      padding: "10px 16px",
                      borderLeft: selectedTicket?.id === ticket.id ? "3px solid #fff" : "3px solid transparent",
                      backgroundColor: selectedTicket?.id === ticket.id ? "rgba(255,255,255,0.1)" : "transparent",
                      cursor: "pointer",
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div style={{ fontWeight: 500, fontSize: "13px", color: "#fff", fontFamily: FONT_FAMILY }}>
                      {ticket.userName}
                    </div>
                    <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", fontFamily: FONT_FAMILY }}>
                      {ticket.topic}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                      <span style={{
                        fontSize: "9px",
                        backgroundColor: ticket.status === 'waiting' ? '#fef3c7' : '#d1fae5',
                        color: ticket.status === 'waiting' ? '#92400e' : '#065f46',
                        padding: "1px 8px",
                        borderRadius: "10px",
                        fontWeight: 500,
                      }}>
                        {statusLabel}
                      </span>
                      <span style={{ fontSize: "8px", color: "rgba(255,255,255,0.4)" }}>
                        {generateTicketId(ticket.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })}
              {tickets.length === 0 && (
                <div style={{ padding: "30px 16px", textAlign: "center", color: "rgba(255,255,255,0.5)", fontSize: "12px", fontFamily: FONT_FAMILY }}>
                  Belum ada chat
                </div>
              )}
            </div>
          </div>

          {/* Right - Chat Area */}
          <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#fff",
          }}>
            {selectedTicket ? (
              <>
                <div style={{
                  padding: "12px 16px",
                  backgroundColor: "#f8f9fa",
                  borderBottom: "1px solid #e8e8e8",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "14px", fontFamily: FONT_FAMILY }}>
                      {selectedTicket.userName}
                      <span style={{ fontSize: "11px", fontWeight: 400, color: "#666", marginLeft: "8px" }}>
                        {selectedTicket.topic}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "10px", color: "#999" }}>
                      <span>{generateTicketId(selectedTicket.createdAt)}</span>
                      <span>•</span>
                      <span style={{ color: selectedTicket.status === 'waiting' ? '#f59e0b' : '#22c55e' }}>
                        {selectedTicket.status === 'waiting' ? 'Menunggu' : 'Aktif'}
                      </span>
                      {selectedTicket.typing && (
                        <span style={{ color: "#0D3CFC", fontStyle: "italic" }}>
                          {selectedTicket.typingUserName} mengetik...
                        </span>
                      )}
                    </div>
                  </div>
                  {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                    <button
                      onClick={() => resolveTicket(selectedTicket.id)}
                      style={{
                        padding: "4px 12px",
                        backgroundColor: "#22c55e",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        fontSize: "11px",
                        cursor: "pointer",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      Selesaikan
                    </button>
                  )}
                </div>

                <div 
                  ref={chatMessagesContainerRef}
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  {messages.length === 0 ? (
                    <div style={{ textAlign: "center", color: "#999", fontSize: "13px", padding: "40px 0", fontFamily: FONT_FAMILY }}>
                      Belum ada pesan. Mulai percakapan!
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isMine = msg.senderId === user.uid;
                      const isAgent = !isMine && msg.senderName === agentName;
                      const isBroadcast = msg.isBroadcast || false;
                      return (
                        <div
                          key={idx}
                          style={{
                            alignSelf: isMine ? "flex-end" : "flex-start",
                            maxWidth: isBroadcast ? "90%" : "75%",
                            padding: "6px 12px",
                            borderRadius: "8px",
                            backgroundColor: isBroadcast ? "#fef3c7" : isMine ? "#0D3CFC" : "#f0f0f0",
                            color: isBroadcast ? "#92400e" : isMine ? "#fff" : "#000",
                            fontSize: "13px",
                            fontFamily: FONT_FAMILY,
                            wordBreak: "break-word",
                            border: isBroadcast ? "1px solid #f59e0b" : "none",
                          }}
                        >
                          {!isMine && (
                            <div style={{ 
                              fontSize: "10px", 
                              fontWeight: 500, 
                              color: isBroadcast ? "#92400e" : "#0D3CFC", 
                              marginBottom: "2px",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}>
                              {isBroadcast && "📢 "}
                              {msg.senderName}
                              {isAgent && " ⭐"}
                            </div>
                          )}
                          <div>{msg.text}</div>
                          <div style={{ 
                            fontSize: "9px", 
                            color: isMine ? "rgba(255,255,255,0.6)" : "#999", 
                            marginTop: "4px",
                            textAlign: "right",
                          }}>
                            {formatTime(msg.timestamp)}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                  <div style={{
                    padding: "8px 12px",
                    borderTop: "1px solid #e8e8e8",
                    display: "flex",
                    gap: "8px",
                    backgroundColor: "#fff",
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
                        padding: "8px 12px",
                        border: "1px solid #e0e0e0",
                        borderRadius: "6px",
                        fontSize: "13px",
                        outline: "none",
                        fontFamily: FONT_FAMILY,
                        backgroundColor: selectedTicket.status === 'waiting' ? "#f5f5f5" : "#fff",
                      }}
                      onFocus={(e) => { if (selectedTicket.status !== 'waiting') e.currentTarget.style.borderColor = "#0D3CFC"; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "#e0e0e0"; }}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={selectedTicket.status === 'waiting' || !messageText.trim()}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: (selectedTicket.status === 'waiting' || !messageText.trim()) ? "#ccc" : "#0D3CFC",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: (selectedTicket.status === 'waiting' || !messageText.trim()) ? "not-allowed" : "pointer",
                        fontFamily: FONT_FAMILY,
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "13px",
                      }}
                    >
                      <SendIcon size={14} />
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
                fontSize: "14px",
                fontFamily: FONT_FAMILY,
              }}>
                Pilih chat dari daftar di kiri
              </div>
            )}
          </div>
        </div>
      );
    }

    // ADMIN VIEW - Full featured chat
    const waitingTickets = tickets.filter(t => t.status === 'waiting');
    const activeTickets = tickets.filter(t => t.status === 'active');
    const resolvedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed');

    return (
      <div>
        {/* Agent Profile & Controls */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
          padding: "12px 16px",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
          marginBottom: "16px",
          border: "1px solid #e8e8e8",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div 
              onClick={() => setShowProfile(!showProfile)}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                overflow: "hidden",
                cursor: "pointer",
                border: "2px solid #0D3CFC",
                flexShrink: 0,
              }}
            >
              <img src={agentPhoto} alt="Agent" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ fontWeight: 600, fontSize: "14px", fontFamily: FONT_FAMILY }}>{agentName}</span>
                <span style={{
                  backgroundColor: "#d1fae5",
                  color: "#065f46",
                  fontSize: "9px",
                  fontWeight: 600,
                  padding: "1px 8px",
                  borderRadius: "10px",
                }}>Agent</span>
                <PulsingDots active={agentOnline} />
              </div>
              <div style={{ fontSize: "11px", color: "#666", fontFamily: FONT_FAMILY }}>
                {agentDescription}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              onClick={() => setShowEditProfile(true)}
              style={{
                padding: "4px 12px",
                backgroundColor: "transparent",
                color: "#0D3CFC",
                border: "1px solid #0D3CFC",
                borderRadius: "4px",
                fontSize: "11px",
                cursor: "pointer",
                fontFamily: FONT_FAMILY,
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <EditIcon size={12} />
              Edit Profil
            </button>
            <button
              onClick={() => setShowBroadcast(!showBroadcast)}
              style={{
                padding: "4px 12px",
                backgroundColor: "#8b5cf6",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                fontSize: "11px",
                cursor: "pointer",
                fontFamily: FONT_FAMILY,
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <BroadcastIcon size={14} color="#fff" />
              Broadcast
            </button>
            <button
              onClick={() => setShowAnnouncement(!showAnnouncement)}
              style={{
                padding: "4px 12px",
                backgroundColor: "#f59e0b",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                fontSize: "11px",
                cursor: "pointer",
                fontFamily: FONT_FAMILY,
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <MegaphoneIcon size={14} color="#fff" />
              Pengumuman
            </button>
            <button
              onClick={handleLogout}
              style={{
                padding: "4px 12px",
                backgroundColor: "transparent",
                color: "#ef4444",
                border: "1px solid #ef4444",
                borderRadius: "4px",
                fontSize: "11px",
                cursor: "pointer",
                fontFamily: FONT_FAMILY,
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <LogoutIcon size={13} />
              Logout
            </button>
          </div>
        </div>

        {/* Broadcast Panel */}
        {showBroadcast && (
          <div style={{
            padding: "12px 16px",
            backgroundColor: "#f5f3ff",
            borderRadius: "8px",
            marginBottom: "12px",
            border: "1px solid #8b5cf6",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontWeight: 600, fontSize: "13px", fontFamily: FONT_FAMILY, color: "#6d28d9" }}>
                <BroadcastIcon size={16} color="#6d28d9" style={{ marginRight: "6px" }} />
                Broadcast Pesan
              </span>
              <button onClick={() => setShowBroadcast(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#999" }}>
                <CloseIcon size={16} />
              </button>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Tulis pesan broadcast ke semua chat..."
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  fontSize: "13px",
                  outline: "none",
                  fontFamily: FONT_FAMILY,
                }}
              />
              <button
                onClick={handleBroadcast}
                disabled={!broadcastMessage.trim()}
                style={{
                  padding: "8px 16px",
                  backgroundColor: broadcastMessage.trim() ? "#8b5cf6" : "#ccc",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: broadcastMessage.trim() ? "pointer" : "not-allowed",
                  fontFamily: FONT_FAMILY,
                  fontSize: "13px",
                }}
              >
                Kirim ke {tickets.filter(t => t.status === 'active' || t.status === 'waiting').length} chat
              </button>
            </div>
          </div>
        )}

        {/* Announcement Panel */}
        {showAnnouncement && (
          <div style={{
            padding: "12px 16px",
            backgroundColor: "#fffbeb",
            borderRadius: "8px",
            marginBottom: "12px",
            border: "1px solid #f59e0b",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontWeight: 600, fontSize: "13px", fontFamily: FONT_FAMILY, color: "#d97706" }}>
                <MegaphoneIcon size={16} color="#d97706" style={{ marginRight: "6px" }} />
                Posting Pengumuman
              </span>
              <button onClick={() => setShowAnnouncement(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#999" }}>
                <CloseIcon size={16} />
              </button>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder="Tulis pengumuman untuk semua user..."
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  fontSize: "13px",
                  outline: "none",
                  fontFamily: FONT_FAMILY,
                }}
              />
              <button
                onClick={handleAnnouncement}
                disabled={!announcementText.trim()}
                style={{
                  padding: "8px 16px",
                  backgroundColor: announcementText.trim() ? "#f59e0b" : "#ccc",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: announcementText.trim() ? "pointer" : "not-allowed",
                  fontFamily: FONT_FAMILY,
                  fontSize: "13px",
                }}
              >
                Posting
              </button>
            </div>
          </div>
        )}

        {/* Announcements List */}
        {announcements.length > 0 && (
          <div style={{
            padding: "8px 12px",
            backgroundColor: "#fffbeb",
            borderRadius: "8px",
            marginBottom: "12px",
            border: "1px solid #fde68a",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexWrap: "wrap",
          }}>
            <MegaphoneIcon size={16} color="#d97706" />
            <span style={{ fontSize: "11px", color: "#666", fontFamily: FONT_FAMILY }}>Pengumuman:</span>
            {announcements.slice(0, 3).map((ann, idx) => (
              <span key={idx} style={{
                fontSize: "11px",
                backgroundColor: "#fff",
                padding: "2px 10px",
                borderRadius: "12px",
                border: "1px solid #fde68a",
                fontFamily: FONT_FAMILY,
                color: "#92400e",
              }}>
                {ann.text}
              </span>
            ))}
            {announcements.length > 3 && (
              <span style={{ fontSize: "10px", color: "#999", fontFamily: FONT_FAMILY }}>
                +{announcements.length - 3} lagi
              </span>
            )}
          </div>
        )}

        {/* Edit Profile Modal */}
        {showEditProfile && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <div style={{
              backgroundColor: "#fff",
              borderRadius: "12px",
              padding: "24px",
              maxWidth: "400px",
              width: "90%",
              maxHeight: "80vh",
              overflowY: "auto",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ fontFamily: FONT_FAMILY, margin: 0, color: "#0D3CFC" }}>Edit Profil Agent</h3>
                <button onClick={() => setShowEditProfile(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px" }}>✕</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12px", color: "#666", fontFamily: FONT_FAMILY, display: "block", marginBottom: "4px" }}>Foto Profil URL</label>
                  <input
                    type="text"
                    value={editPhoto}
                    onChange={(e) => setEditPhoto(e.target.value)}
                    placeholder="URL foto profil"
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "13px",
                      fontFamily: FONT_FAMILY,
                    }}
                  />
                  <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                    <button onClick={() => setEditPhoto("/images/ai.jpg")} style={{ fontSize: "10px", padding: "2px 8px", border: "1px solid #ddd", borderRadius: "4px", cursor: "pointer", background: "none" }}>Default</button>
                    <button onClick={() => setEditPhoto("/images/p0l.jpg")} style={{ fontSize: "10px", padding: "2px 8px", border: "1px solid #ddd", borderRadius: "4px", cursor: "pointer", background: "none" }}>Foto 1</button>
                    <button onClick={() => setEditPhoto("/images/xxz.jpg")} style={{ fontSize: "10px", padding: "2px 8px", border: "1px solid #ddd", borderRadius: "4px", cursor: "pointer", background: "none" }}>Foto 2</button>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "#666", fontFamily: FONT_FAMILY, display: "block", marginBottom: "4px" }}>Nama Agent</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "13px",
                      fontFamily: FONT_FAMILY,
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", color: "#666", fontFamily: FONT_FAMILY, display: "block", marginBottom: "4px" }}>Deskripsi Agent</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      fontSize: "13px",
                      fontFamily: FONT_FAMILY,
                      resize: "vertical",
                    }}
                  />
                </div>
                <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                  <button
                    onClick={saveProfile}
                    style={{
                      flex: 1,
                      padding: "8px",
                      backgroundColor: "#0D3CFC",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontFamily: FONT_FAMILY,
                      fontSize: "13px",
                    }}
                  >
                    Simpan
                  </button>
                  <button
                    onClick={() => setShowEditProfile(false)}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "transparent",
                      color: "#666",
                      border: "1px solid #ddd",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontFamily: FONT_FAMILY,
                    }}
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profile Modal */}
        {showProfile && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <div style={{
              backgroundColor: "#fff",
              borderRadius: "12px",
              padding: "24px",
              maxWidth: "350px",
              width: "90%",
              textAlign: "center",
            }}>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button onClick={() => setShowProfile(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px" }}>✕</button>
              </div>
              <div style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                overflow: "hidden",
                margin: "0 auto 12px",
                border: "3px solid #0D3CFC",
              }}>
                <img src={agentPhoto} alt="Agent" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <h3 style={{ fontFamily: FONT_FAMILY, margin: "0 0 4px 0", color: "#0D3CFC" }}>{agentName}</h3>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                <span style={{
                  backgroundColor: "#d1fae5",
                  color: "#065f46",
                  fontSize: "10px",
                  fontWeight: 600,
                  padding: "1px 10px",
                  borderRadius: "10px",
                }}>Agent</span>
                <PulsingDots active={agentOnline} />
              </div>
              <p style={{ fontFamily: FONT_FAMILY, fontSize: "13px", color: "#666", margin: "0 0 12px 0" }}>
                {agentDescription}
              </p>
              <div style={{ fontSize: "11px", color: "#999", fontFamily: FONT_FAMILY }}>
                {tickets.filter(t => t.status === 'active').length} chat aktif • {tickets.filter(t => t.status === 'waiting').length} menunggu
              </div>
              <button
                onClick={() => { setShowProfile(false); setShowEditProfile(true); }}
                style={{
                  marginTop: "12px",
                  padding: "6px 16px",
                  backgroundColor: "transparent",
                  color: "#0D3CFC",
                  border: "1px solid #0D3CFC",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontFamily: FONT_FAMILY,
                  fontSize: "12px",
                }}
              >
                Edit Profil
              </button>
            </div>
          </div>
        )}

        {/* Main Chat Interface - Full Width */}
        <div style={{ 
          display: "flex", 
          gap: "0",
          height: "550px",
          backgroundColor: "#fff",
          borderRadius: "12px",
          border: "1px solid #e8e8e8",
          overflow: "hidden",
        }}>
          {/* Left - Ticket List with Categories */}
          <div style={{
            width: "280px",
            backgroundColor: "#f8f9fa",
            overflowY: "auto",
            flexShrink: 0,
            borderRight: "1px solid #e8e8e8",
          }}>
            {/* Waiting Tickets */}
            {waitingTickets.length > 0 && (
              <div>
                <div style={{
                  padding: "8px 12px",
                  backgroundColor: "#fef3c7",
                  fontWeight: 600,
                  fontSize: "11px",
                  color: "#92400e",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontFamily: FONT_FAMILY,
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                }}>
                  ⏳ Menunggu ({waitingTickets.length})
                </div>
                {waitingTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => { setSelectedTicket(ticket); takeTicket(ticket.id); }}
                    style={{
                      padding: "10px 12px",
                      borderBottom: "1px solid #f0f0f0",
                      cursor: "pointer",
                      backgroundColor: selectedTicket?.id === ticket.id ? "rgba(13,60,252,0.06)" : "transparent",
                      borderLeft: selectedTicket?.id === ticket.id ? "3px solid #0D3CFC" : "3px solid transparent",
                    }}
                  >
                    <div style={{ fontWeight: 500, fontSize: "13px", color: "#0D3CFC", fontFamily: FONT_FAMILY }}>{ticket.userName}</div>
                    <div style={{ fontSize: "11px", color: "#666", fontFamily: FONT_FAMILY }}>{ticket.topic}</div>
                    {ticket.typing && <div style={{ fontSize: "9px", color: "#0D3CFC", fontStyle: "italic", fontFamily: FONT_FAMILY }}>{ticket.typingUserName} mengetik...</div>}
                  </div>
                ))}
              </div>
            )}

            {/* Active Tickets */}
            {activeTickets.length > 0 && (
              <div>
                <div style={{
                  padding: "8px 12px",
                  backgroundColor: "#d1fae5",
                  fontWeight: 600,
                  fontSize: "11px",
                  color: "#065f46",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontFamily: FONT_FAMILY,
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                }}>
                  💬 Aktif ({activeTickets.length})
                </div>
                {activeTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    style={{
                      padding: "10px 12px",
                      borderBottom: "1px solid #f0f0f0",
                      cursor: "pointer",
                      backgroundColor: selectedTicket?.id === ticket.id ? "rgba(13,60,252,0.06)" : "transparent",
                      borderLeft: selectedTicket?.id === ticket.id ? "3px solid #0D3CFC" : "3px solid transparent",
                    }}
                  >
                    <div style={{ fontWeight: 500, fontSize: "13px", color: "#0D3CFC", fontFamily: FONT_FAMILY }}>{ticket.userName}</div>
                    <div style={{ fontSize: "11px", color: "#666", fontFamily: FONT_FAMILY }}>{ticket.topic}</div>
                    {ticket.typing && <div style={{ fontSize: "9px", color: "#0D3CFC", fontStyle: "italic", fontFamily: FONT_FAMILY }}>{ticket.typingUserName} mengetik...</div>}
                    {ticket.lastMessage && <div style={{ fontSize: "9px", color: "#999", marginTop: "2px", fontFamily: FONT_FAMILY }}>{ticket.lastMessage.substring(0, 30)}{ticket.lastMessage.length > 30 ? "..." : ""}</div>}
                  </div>
                ))}
              </div>
            )}

            {/* Resolved Tickets */}
            {resolvedTickets.length > 0 && (
              <div>
                <div style={{
                  padding: "8px 12px",
                  backgroundColor: "#e5e7eb",
                  fontWeight: 600,
                  fontSize: "11px",
                  color: "#6b7280",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontFamily: FONT_FAMILY,
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                }}>
                  ✅ Selesai ({resolvedTickets.length})
                </div>
                {resolvedTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    style={{
                      padding: "10px 12px",
                      borderBottom: "1px solid #f0f0f0",
                      cursor: "pointer",
                      backgroundColor: selectedTicket?.id === ticket.id ? "rgba(13,60,252,0.06)" : "transparent",
                      borderLeft: selectedTicket?.id === ticket.id ? "3px solid #0D3CFC" : "3px solid transparent",
                      opacity: 0.7,
                    }}
                  >
                    <div style={{ fontWeight: 500, fontSize: "13px", color: "#0D3CFC", fontFamily: FONT_FAMILY }}>{ticket.userName}</div>
                    <div style={{ fontSize: "10px", color: "#999", fontFamily: FONT_FAMILY }}>{generateTicketId(ticket.createdAt)}</div>
                  </div>
                ))}
              </div>
            )}

            {waitingTickets.length === 0 && activeTickets.length === 0 && resolvedTickets.length === 0 && (
              <div style={{ padding: "30px 16px", textAlign: "center", color: "#999", fontSize: "12px", fontFamily: FONT_FAMILY }}>
                Tidak ada chat masuk
              </div>
            )}
          </div>

          {/* Right - Chat Area */}
          <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#fff",
            minWidth: 0,
          }}>
            {selectedTicket ? (
              <>
                <div style={{
                  padding: "10px 16px",
                  backgroundColor: "#0D3CFC",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexShrink: 0,
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "14px", color: "#fff", fontFamily: FONT_FAMILY }}>
                      {selectedTicket.userName}
                      <span style={{ fontSize: "11px", fontWeight: 400, color: "rgba(255,255,255,0.7)", marginLeft: "8px" }}>
                        {selectedTicket.topic}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "10px", color: selectedTicket.status === 'waiting' ? "#fef3c7" : "#d1fae5", fontFamily: FONT_FAMILY }}>
                        {selectedTicket.status === 'waiting' ? '⏳ Menunggu' : '💬 Aktif'}
                      </span>
                      {selectedTicket.typing && selectedTicket.status !== 'resolved' && (
                        <span style={{ fontSize: "9px", color: "#ffd700", fontStyle: "italic", fontFamily: FONT_FAMILY }}>
                          {selectedTicket.typingUserName} mengetik...
                        </span>
                      )}
                      <span style={{ fontSize: "8px", color: "rgba(255,255,255,0.4)", fontFamily: FONT_FAMILY }}>
                        {generateTicketId(selectedTicket.createdAt)}
                      </span>
                    </div>
                  </div>
                  {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                    <button
                      onClick={() => resolveTicket(selectedTicket.id)}
                      style={{
                        padding: "4px 12px",
                        backgroundColor: "#22c55e",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        fontSize: "11px",
                        cursor: "pointer",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      Selesaikan
                    </button>
                  )}
                </div>

                <div 
                  ref={chatMessagesContainerRef}
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "12px 16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    minHeight: 0,
                  }}
                >
                  {messages.length === 0 ? (
                    <div style={{ textAlign: "center", color: "#999", fontSize: "13px", padding: "40px 0", fontFamily: FONT_FAMILY }}>
                      Belum ada pesan
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const isMine = msg.senderId === user.uid;
                      const isAgent = !isMine && msg.senderName === agentName;
                      const isBroadcast = msg.isBroadcast || false;
                      return (
                        <div
                          key={idx}
                          style={{
                            alignSelf: isMine ? "flex-end" : "flex-start",
                            maxWidth: isBroadcast ? "90%" : "75%",
                            padding: "6px 12px",
                            borderRadius: "8px",
                            backgroundColor: isBroadcast ? "#fef3c7" : isMine ? "#0D3CFC" : "#f0f0f0",
                            color: isBroadcast ? "#92400e" : isMine ? "#fff" : "#000",
                            fontSize: "13px",
                            fontFamily: FONT_FAMILY,
                            wordBreak: "break-word",
                            border: isBroadcast ? "1px solid #f59e0b" : "none",
                          }}
                        >
                          {!isMine && (
                            <div style={{ 
                              fontSize: "10px", 
                              fontWeight: 500, 
                              color: isBroadcast ? "#92400e" : "#0D3CFC", 
                              marginBottom: "2px",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}>
                              {isBroadcast && "📢 "}
                              {msg.senderName}
                              {isAgent && " ⭐"}
                            </div>
                          )}
                          <div>{msg.text}</div>
                          <div style={{ 
                            fontSize: "9px", 
                            color: isMine ? "rgba(255,255,255,0.6)" : "#999", 
                            marginTop: "4px",
                            textAlign: "right",
                          }}>
                            {formatTime(msg.timestamp)}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                  <div style={{
                    padding: "8px 12px",
                    borderTop: "1px solid #e8e8e8",
                    display: "flex",
                    gap: "8px",
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
                        padding: "8px 12px",
                        border: "1px solid #e0e0e0",
                        borderRadius: "6px",
                        fontSize: "13px",
                        outline: "none",
                        fontFamily: FONT_FAMILY,
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = "#0D3CFC"}
                      onBlur={(e) => e.currentTarget.style.borderColor = "#e0e0e0"}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!messageText.trim()}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: messageText.trim() ? "#0D3CFC" : "#ccc",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: messageText.trim() ? "pointer" : "not-allowed",
                        fontFamily: FONT_FAMILY,
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "13px",
                      }}
                    >
                      <SendIcon size={14} />
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
                fontSize: "14px",
                fontFamily: FONT_FAMILY,
                flexDirection: "column",
                gap: "8px",
              }}>
                <div style={{ fontSize: "40px" }}>💬</div>
                <div>Pilih chat dari daftar di kiri</div>
                <div style={{ fontSize: "12px", color: "#ccc" }}>
                  {waitingTickets.length} menunggu • {activeTickets.length} aktif
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Loading state
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
        <title>Live Chat Agent | Menuru Official</title>
        <meta name="description" content="Live Chat Agent Menuru - Chat langsung dengan agent kami" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#0D3CFC" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Menuru" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="icon" href="/images/ai.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/images/ai.jpg" />
        <meta property="og:title" content="Live Chat Agent | Menuru Official" />
        <meta property="og:description" content="Live Chat Agent Menuru - Chat langsung dengan agent kami" />
        <meta property="og:image" content="/images/ai.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Live Chat Agent | Menuru Official" />
        <meta name="twitter:description" content="Live Chat Agent Menuru - Chat langsung dengan agent kami" />
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
            minHeight: "50vh",
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
                {`Chat langsung dengan agent kami\nuntuk bantuan cepat dan tepat`}
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

            {/* Teks "Live Chat Agent" besar warna biru */}
            <div
              style={{
                marginTop: "60px",
                width: "100%",
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                gap: "20px",
                flexWrap: "wrap",
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
                Live Chat Agent
              </span>
              {user && isAdmin && (
                <span style={{
                  fontSize: "16px",
                  color: "#22c55e",
                  fontFamily: FONT_FAMILY,
                  backgroundColor: "#dcfce7",
                  padding: "4px 16px",
                  borderRadius: "20px",
                  fontWeight: 500,
                }}>
                  <PulsingDots active={agentOnline} /> {agentOnline ? "Online" : "Offline"}
                </span>
              )}
            </div>

            {/* Hi + Nama User */}
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
                    {isAdmin && (
                      <span style={{ fontSize: "16px", fontWeight: 400, color: "#666", marginLeft: "12px" }}>
                        (Agent Mode)
                      </span>
                    )}
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

        {/* CHAT INTERFACE - Full Width */}
        <div style={{ padding: "0 40px 40px 40px", maxWidth: "1400px", margin: "0 auto", width: "100%" }}>
          <ChatInterface />
        </div>

        {/* FOOTER - lengkap dengan Live Chat dan Live Chat Agent */}
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
          {/* Foto Kiri */}
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

          {/* Foto Kanan */}
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

        {/* MENURU Text - 450px, left aligned */}
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
                href={item.name === "Live Chat Agent" ? "/live-chat-agent" : "/"}
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
