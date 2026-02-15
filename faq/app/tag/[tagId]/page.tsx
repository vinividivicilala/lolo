'use client';

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap"; // Perbaikan: dari 'gsat' menjadi 'gsap'

// Firebase
import { initializeApp, getApps } from "firebase/app";
import { 
  getAuth, 
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut 
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  orderBy, 
  Timestamp,
  deleteDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  where,
  addDoc,
  onSnapshot,
  increment
} from "firebase/firestore";

// Konfigurasi Firebase
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

// Data blog posts dengan tags
const BLOG_POSTS = [
  {
    id: 'gunadarma-article',
    title: 'Bagaimana Rasa nya Masuk Kuliah Di Universitas Gunadarma',
    slug: 'gunadarma',
    excerpt: 'Pengalaman pribadi menjalani perkuliahan di Universitas Gunadarma, dari akademik hingga organisasi.',
    tags: ['kuliah', 'gunadarma'],
    date: '2026-02-13',
    readTime: 8,
  },
  {
    id: 'memilih-jurusan',
    title: 'Mengapa saya memilih jurusan tersebut',
    slug: 'memilih-jurusan',
    excerpt: 'Alasan di balik keputusan memilih program studi yang tepat.',
    tags: ['jurusan', 'kuliah', 'karir'],
    date: '2026-02-13',
    readTime: 10,
  },
  {
    id: 'tips-belajar-coding',
    title: 'Tips Belajar Coding untuk Pemula',
    slug: 'tips-belajar-coding',
    excerpt: 'Panduan praktis memulai perjalanan sebagai programmer.',
    tags: ['it', 'kuliah', 'karir'],
    date: '2026-02-13',
    readTime: 6,
    isNew: false
  },
  {
    id: 'Coming Soon',
    title: 'Coming Soon',
    slug: 'Coming Soon',
    excerpt: 'Coming Soon.',
    tags: ['it', 'karir'],
    date: '2026-02-13',
    readTime: 7,
    isNew: false
  },
  {
    id: 'tips-memilih-jurusan',
    title: 'Tips Memilih Jurusan Kuliah',
    slug: 'tips-memilih-jurusan',
    excerpt: 'Panduan lengkap memilih jurusan yang tepat untuk masa depan.',
    tags: ['jurusan', 'kuliah'],
    date: '2026-02-13',
    readTime: 6,
    isNew: false
  },
  {
    id: 'pengalaman-magang',
    title: 'Pengalaman PKL di Perusahaan KRL',
    slug: 'pengalaman-pkl',
    excerpt: 'Cerita pkl dan persiapan memasuki dunia kerja.',
    tags: ['sekolah','karir', 'kuliah'],
    date: '2026-02-13',
    readTime: 5,
    isNew: false
  }
];

// Data tag dan deskripsinya
const TAG_INFO: { [key: string]: { name: string, description: string } } = {
  kuliah: {
    name: 'Kuliah',
    description: 'Kumpulan artikel tentang pengalaman, tips, dan cerita seputar perkuliahan.'
  },
  gunadarma: {
    name: 'Gunadarma',
    description: 'Artikel-artikel yang membahas tentang Universitas Gunadarma, dari sejarah hingga kehidupan kampus.'
  },
  jurusan: {
    name: 'Jurusan',
    description: 'Informasi dan tips seputar pemilihan jurusan kuliah yang tepat.'
  },
  it: {
    name: 'IT',
    description: 'Artikel tentang dunia teknologi informasi, programming, dan perkembangan digital.'
  },
  karir: {
    name: 'Karir',
    description: 'Tips dan informasi seputar persiapan karir dan dunia kerja.'
  },
   sekolah: {
    name: 'sekolah',
    description: 'Tips dan informasi seputar persiapan sekolah dan dunia kerja.'
  }
};

// Email penulis
const authorEmail = "faridardiansyah061@gmail.com";

// Icons
const CalendarIcon = ({ width, height }: { width: number, height: number }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor"/>
    <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor"/>
    <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor"/>
    <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor"/>
  </svg>
);

const ClockIcon = ({ width, height }: { width: number, height: number }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
    <circle cx="12" cy="12" r="10" stroke="currentColor"/>
    <polyline points="12 6 12 12 16 14" stroke="currentColor"/>
  </svg>
);

const TagIcon = ({ width, height }: { width: number, height: number }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);

// North West Arrow SVG
const NorthWestArrow = ({ width, height, style }: { width: number | string, height: number | string, style?: React.CSSProperties }) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 24 24" 
    fill="none"
    stroke="white"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
  >
    <path d="M17 17L7 7" stroke="white"/>
    <path d="M17 7H7" stroke="white"/>
    <path d="M7 7V17" stroke="white"/>
  </svg>
);

// North East Arrow SVG
const NorthEastArrow = ({ width, height, style }: { width: number | string, height: number | string, style?: React.CSSProperties }) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 24 24" 
    fill="none"
    stroke="white"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
  >
    <path d="M7 7L17 17" stroke="white"/>
    <path d="M7 7H17" stroke="white"/>
    <path d="M7 17V7" stroke="white"/>
  </svg>
);

// South West Arrow SVG
const SouthWestArrow = ({ width, height, style }: { width: number | string, height: number | string, style?: React.CSSProperties }) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 24 24" 
    fill="none"
    stroke="white"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
  >
    <path d="M17 7L7 17" stroke="white"/>
    <path d="M17 7H7" stroke="white"/>
    <path d="M17 7V17" stroke="white"/>
  </svg>
);

// Message Icon
const MessageIcon = ({ width, height }: { width: number, height: number }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

// Send Icon
const SendIcon = ({ width, height }: { width: number, height: number }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

// Reply Icon
const ReplyIcon = ({ width, height }: { width: number, height: number }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    <polyline points="10 11 13 14 10 17"/>
  </svg>
);

// Check Icon
const CheckIcon = ({ width, height }: { width: number, height: number }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

// History Icon
const HistoryIcon = ({ width, height }: { width: number, height: number }) => (
  <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

export default function TagPage() {
  const router = useRouter();
  const params = useParams();
  const tagId = params.tagId as string;
  
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Firebase State
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);
  const [firebaseAuth, setFirebaseAuth] = useState<any>(null);
  const [firebaseDb, setFirebaseDb] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // State untuk Chat/Message
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [userMessages, setUserMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [messageLoading, setMessageLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [showUserMessageHistory, setShowUserMessageHistory] = useState(false);
  const [showUserMessageModal, setShowUserMessageModal] = useState(false);
  const [selectedUserMessage, setSelectedUserMessage] = useState<any>(null);
  
  // Refs untuk GSAP animations
  const bannerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const emoji1Ref = useRef<HTMLDivElement>(null);
  const emoji2Ref = useRef<HTMLDivElement>(null);

  // Filter posts berdasarkan tag
  const filteredPosts = BLOG_POSTS.filter(post => post.tags.includes(tagId));
  const currentTag = TAG_INFO[tagId] || { name: tagId, description: '' };
  const otherTags = Object.keys(TAG_INFO).filter(t => t !== tagId);

  // ===== FUNGSI UNTUK MENDAPATKAN POST TERBARU =====
  const getNewestPosts = () => {
    return [...BLOG_POSTS].slice(0, 2);
  };

  // ===== FUNGSI UNTUK MENDAPATKAN POST TERAKHIR =====
  const getLastPosts = () => {
    return [...BLOG_POSTS].slice(-2);
  };

  // Get recommended posts
  const getRecommendedPosts = () => {
    const otherPosts = BLOG_POSTS.filter(post => !post.tags.includes(tagId));
    const shuffled = [...otherPosts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  };

  const newestPosts = getNewestPosts();
  const lastPosts = getLastPosts();
  const recommendedPosts = getRecommendedPosts();

  // ============================================
  // FIREBASE INITIALIZATION
  // ============================================
  useEffect(() => {
    setIsMounted(true);
    
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    try {
      const app = getApps().length === 0
        ? initializeApp(firebaseConfig)
        : getApps()[0];
      
      const auth = getAuth(app);
      const db = getFirestore(app);
      
      setFirebaseAuth(auth);
      setFirebaseDb(db);
      setFirebaseInitialized(true);
      
    } catch (error) {
      console.error("Firebase initialization error:", error);
    }
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // ============================================
  // AUTH STATE LISTENER
  // ============================================
  useEffect(() => {
    if (!firebaseAuth || !firebaseInitialized) return;
    
    const unsubscribe = onAuthStateChanged(firebaseAuth, (currentUser: any) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firebaseAuth, firebaseInitialized]);

  // ============================================
  // LOAD MESSAGES (REAL-TIME)
  // ============================================
  useEffect(() => {
    if (!firebaseDb || !firebaseInitialized) return;

    const messagesRef = collection(firebaseDb, "authorMessages");
    const q = query(
      messagesRef,
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      }));
      setMessages(messagesData);
      
      // Hitung pesan yang belum dibaca (jika user adalah penulis)
      if (user && user.email === authorEmail) {
        const unread = messagesData.filter((msg: any) => !msg.isRead).length;
        setUnreadCount(unread);
      }

      // Filter pesan untuk user yang sedang login (bukan penulis)
      if (user && user.email !== authorEmail) {
        const userMsgs = messagesData.filter((msg: any) => msg.userId === user.uid);
        setUserMessages(userMsgs);
      }
    }, (error) => {
      console.error("Error loading messages:", error);
    });

    return () => unsubscribe();
  }, [firebaseDb, firebaseInitialized, user]);

  // ============================================
  // HANDLE GOOGLE LOGIN
  // ============================================
  const handleGoogleLogin = async () => {
    if (!firebaseAuth) return;
    
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(firebaseAuth, provider);
    } catch (error) {
      console.error("Google login error:", error);
    }
  };

  // ============================================
  // HANDLE LOGOUT
  // ============================================
  const handleLogout = async () => {
    if (!firebaseAuth) return;
    
    try {
      await signOut(firebaseAuth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // ============================================
  // HANDLE SEND MESSAGE TO AUTHOR
  // ============================================
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      handleGoogleLogin();
      return;
    }
    if (!firebaseDb || !newMessage.trim()) return;

    setMessageLoading(true);
    
    try {
      const messagesRef = collection(firebaseDb, "authorMessages");
      
      await addDoc(messagesRef, {
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
        userEmail: user.email,
        userPhoto: user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=random&color=fff`,
        message: newMessage,
        isRead: false,
        replies: [],
        createdAt: Timestamp.now(),
        type: 'saran'
      });

      setNewMessage("");
      setShowMessageModal(false);
      showNotification("Saran berhasil dikirim ke penulis");
      
    } catch (error) {
      console.error("Error sending message:", error);
      showNotification("Gagal mengirim saran", "error");
    } finally {
      setMessageLoading(false);
    }
  };

  // ============================================
  // HANDLE REPLY TO MESSAGE (UNTUK PENULIS)
  // ============================================
  const handleReplyToMessage = async (messageId: string) => {
    if (!user || user.email !== authorEmail) return;
    if (!firebaseDb || !replyMessage.trim()) return;

    try {
      const messageRef = doc(firebaseDb, "authorMessages", messageId);
      const messageDoc = await getDoc(messageRef);
      
      if (!messageDoc.exists()) return;
      
      const replyData = {
        id: `${Date.now()}_${user.uid}`,
        userId: user.uid,
        userName: user.displayName || "Farid Ardiansyah",
        userPhoto: user.photoURL || `https://ui-avatars.com/api/?name=Farid+Ardiansyah&background=random&color=fff`,
        text: replyMessage,
        createdAt: Timestamp.now()
      };

      await updateDoc(messageRef, {
        replies: arrayUnion(replyData),
        isRead: true
      });

      setReplyMessage("");
      setSelectedMessage(null);
      showNotification("Balasan berhasil dikirim ke user");
      
    } catch (error) {
      console.error("Error replying to message:", error);
      showNotification("Gagal mengirim balasan", "error");
    }
  };

  // ============================================
  // HANDLE MARK AS READ (UNTUK PENULIS)
  // ============================================
  const handleMarkAsRead = async (messageId: string) => {
    if (!user || user.email !== authorEmail) return;
    if (!firebaseDb) return;

    try {
      const messageRef = doc(firebaseDb, "authorMessages", messageId);
      await updateDoc(messageRef, {
        isRead: true
      });
      
      showNotification("Pesan ditandai telah dibaca");
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  // ============================================
  // NOTIFICATION FUNCTION
  // ============================================
  const showNotification = (message: string, type: "success" | "error" = "success") => {
    const notification = document.createElement("div");
    notification.style.position = "fixed";
    notification.style.bottom = "20px";
    notification.style.left = "20px";
    notification.style.backgroundColor = "rgba(255,255,255,0.1)";
    notification.style.color = "white";
    notification.style.padding = "12px 24px";
    notification.style.borderRadius = "30px";
    notification.style.fontSize = "0.95rem";
    notification.style.zIndex = "10001";
    notification.style.border = "1px solid rgba(255,255,255,0.2)";
    notification.style.backdropFilter = "blur(10px)";
    notification.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
    notification.style.animation = "slideIn 0.3s ease";
    notification.innerText = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease";
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };

  // GSAP Animations
  useEffect(() => {
    if (!isMounted) return;

    if (bannerRef.current) {
      gsap.fromTo(bannerRef.current,
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      );
    }

    if (emoji1Ref.current && emoji2Ref.current) {
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 3 });
      
      tl.to([emoji1Ref.current, emoji2Ref.current], {
        rotation: 10,
        duration: 0.2,
        ease: "power1.inOut"
      })
      .to([emoji1Ref.current, emoji2Ref.current], {
        rotation: -10,
        duration: 0.3,
        ease: "power1.inOut"
      })
      .to([emoji1Ref.current, emoji2Ref.current], {
        rotation: 10,
        duration: 0.2,
        ease: "power1.inOut"
      })
      .to([emoji1Ref.current, emoji2Ref.current], {
        rotation: 0,
        duration: 0.3,
        ease: "power1.inOut"
      });
    }

    if (headerRef.current) {
      gsap.fromTo(headerRef.current,
        { x: 20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, delay: 0.3, ease: "power2.out" }
      );
    }

  }, [isMounted]);

  if (!isMounted || loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#000000',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'Helvetica, Arial, sans-serif',
      }}>
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ color: 'white', fontSize: '1rem' }}
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  if (!TAG_INFO[tagId]) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#000000',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'Helvetica, Arial, sans-serif',
        padding: '20px',
        textAlign: 'center',
      }}>
        <h1 style={{ color: 'white', fontSize: '3rem', marginBottom: '20px' }}>404</h1>
        <p style={{ color: '#999999', fontSize: '1.2rem', marginBottom: '30px' }}>
          Tag tidak ditemukan
        </p>
        <button
          onClick={() => router.push('/blog')}
          style={{
            padding: '12px 32px',
            background: 'white',
            border: 'none',
            borderRadius: '30px',
            color: 'black',
            fontSize: '1rem',
            cursor: 'pointer',
          }}
        >
          Kembali ke Blog
        </button>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000000',
      fontFamily: 'Helvetica, Arial, sans-serif',
      color: 'white',
      position: 'relative',
      padding: isMobile ? '20px' : '40px',
      paddingTop: isMobile ? '100px' : '120px',
    }}>
      
      {/* ===== TEKS BERJALAN ===== */}
      <div
        ref={bannerRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          backgroundColor: 'rgba(0,0,0,0.95)',
          color: 'white',
          padding: '20px 0',
          borderBottom: '2px solid rgba(255,255,255,0.2)',
          backdropFilter: 'blur(12px)',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          width: '100vw',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        }}
      >
        <motion.div
          animate={{
            x: [0, -2500]
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
            repeatType: "loop"
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '60px',
            fontSize: isMobile ? '1.8rem' : '2.5rem',
            fontWeight: 'bold',
            letterSpacing: '2px',
            paddingLeft: '30px',
          }}
        >
          <NorthWestArrow width={isMobile ? 40 : 60} height={isMobile ? 40 : 60} style={{ strokeWidth: 2 }} />
          <span style={{ background: 'linear-gradient(45deg, #fff, #aaa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>NOTE ADALAH TEMAN TERBAIK MU</span>
          <NorthWestArrow width={isMobile ? 40 : 60} height={isMobile ? 40 : 60} style={{ strokeWidth: 2 }} />
          <span style={{ background: 'linear-gradient(45deg, #fff, #aaa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>NOTE ADALAH TEMAN TERBAIK MU</span>
          <NorthWestArrow width={isMobile ? 40 : 60} height={isMobile ? 40 : 60} style={{ strokeWidth: 2 }} />
          <span style={{ background: 'linear-gradient(45deg, #fff, #aaa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>NOTE ADALAH TEMAN TERBAIK MU</span>
          <NorthWestArrow width={isMobile ? 40 : 60} height={isMobile ? 40 : 60} style={{ strokeWidth: 2 }} />
          <span style={{ background: 'linear-gradient(45deg, #fff, #aaa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>NOTE ADALAH TEMAN TERBAIK MU</span>
          <NorthWestArrow width={isMobile ? 40 : 60} height={isMobile ? 40 : 60} style={{ strokeWidth: 2 }} />
          <span style={{ background: 'linear-gradient(45deg, #fff, #aaa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>NOTE ADALAH TEMAN TERBAIK MU</span>
        </motion.div>
      </div>

      {/* HEADER - NAMA USER + PANAH BESAR + TOMBOL SARAN */}
      <div
        ref={headerRef}
        style={{
          position: 'fixed',
          top: isMobile ? '90px' : '110px',
          right: isMobile ? '20px' : '40px',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
          maxWidth: 'calc(100% - 80px)',
        }}
      >
        {/* Tombol Saran ke Penulis */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (!user) {
              handleGoogleLogin();
            } else {
              setShowMessageModal(true);
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: showMessageModal ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '40px',
            padding: '12px 24px',
            color: 'white',
            fontSize: '0.95rem',
            cursor: 'pointer',
            position: 'relative',
          }}
        >
          <MessageIcon width={20} height={20} />
          <span>💡 Beri Saran</span>
          {user && user.email !== authorEmail && userMessages.filter(m => m.replies?.length > 0).length > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                background: '#FF6B00',
                color: 'white',
                fontSize: '0.7rem',
                minWidth: '18px',
                height: '18px',
                borderRadius: '9px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid black',
              }}
            >
              {userMessages.filter(m => m.replies?.length > 0).length}
            </span>
          )}
        </motion.button>

        {/* Tombol Riwayat Pesan (untuk user biasa) */}
        {user && user.email !== authorEmail && userMessages.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowUserMessageModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '40px',
              padding: '12px 20px',
              color: 'white',
              fontSize: '0.95rem',
              cursor: 'pointer',
            }}
          >
            <HistoryIcon width={18} height={18} />
            <span>Pesan Saya ({userMessages.length})</span>
          </motion.button>
        )}

        {/* User Info / Login Button + PANAH BESAR */}
        {user ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              padding: '8px 20px',
              borderRadius: '40px',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <motion.img 
              whileHover={{ scale: 1.1 }}
              src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email || 'User')}&background=random&color=fff`} 
              alt={user.displayName || 'User'}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                objectFit: 'cover',
              }}
              onError={(e) => {
                e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email || 'User')}&background=random&color=fff`;
              }}
            />
            <span style={{
              fontSize: '1rem',
              color: 'white',
              fontWeight: '500',
            }}>
              {user.displayName || user.email?.split('@')[0] || 'User'}
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '30px',
                padding: '6px 16px',
                color: 'white',
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Logout
            </motion.button>
            {/* PANAH BESAR DI SAMPING USER */}
            <SouthWestArrow width={40} height={40} />
          </motion.div>
        ) : (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGoogleLogin}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '40px',
              padding: '12px 24px',
              color: 'white',
              fontSize: '0.95rem',
              cursor: 'pointer',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#ffffff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#ffffff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#ffffff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Login dengan Google</span>
          </motion.button>
        )}
      </div>

      {/* ===== MODAL KIRIM SARAN ===== */}
      <AnimatePresence>
        {showMessageModal && user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(8px)',
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
            onClick={() => setShowMessageModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              style={{
                background: '#1a1a1a',
                borderRadius: '32px',
                padding: '40px',
                maxWidth: '500px',
                width: '100%',
                border: '1px solid #333333',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px',
              }}>
                <div>
                  <motion.h3 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    style={{
                      fontSize: '2rem',
                      fontWeight: 'normal',
                      color: 'white',
                      margin: '0 0 8px 0',
                    }}
                  >
                    💡 Beri Saran
                  </motion.h3>
                  <motion.p
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    style={{
                      fontSize: '0.95rem',
                      color: '#999999',
                      margin: 0,
                    }}
                  >
                    Kirim saran, kritik, atau ide untuk blog ini
                  </motion.p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowMessageModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#999999',
                    fontSize: '2rem',
                    cursor: 'pointer',
                    lineHeight: 1,
                  }}
                >
                  ×
                </motion.button>
              </div>

              <motion.form
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                onSubmit={handleSendMessage}
              >
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Tulis saran Anda di sini..."
                  rows={6}
                  required
                  style={{
                    width: '100%',
                    padding: '20px',
                    background: '#2a2a2a',
                    border: '1px solid #444444',
                    borderRadius: '20px',
                    color: 'white',
                    fontSize: '1rem',
                    outline: 'none',
                    resize: 'vertical',
                    marginBottom: '20px',
                  }}
                />
                
                <div style={{
                  display: 'flex',
                  gap: '15px',
                  justifyContent: 'flex-end',
                }}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => setShowMessageModal(false)}
                    style={{
                      padding: '12px 24px',
                      background: 'none',
                      border: '1px solid #333333',
                      borderRadius: '30px',
                      color: '#999999',
                      fontSize: '1rem',
                      cursor: 'pointer',
                    }}
                  >
                    Batal
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={messageLoading || !newMessage.trim()}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px 32px',
                      background: messageLoading || !newMessage.trim() ? '#333333' : 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '30px',
                      color: messageLoading || !newMessage.trim() ? '#999999' : 'white',
                      fontSize: '1rem',
                      fontWeight: '500',
                      cursor: messageLoading || !newMessage.trim() ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <SendIcon width={18} height={18} />
                    <span>{messageLoading ? 'Mengirim...' : 'Kirim Saran'}</span>
                  </motion.button>
                </div>
              </motion.form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== MODAL PESAN DARI PENULIS (UNTUK USER) ===== */}
      <AnimatePresence>
        {showUserMessageModal && user && user.email !== authorEmail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(8px)',
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
            onClick={() => setShowUserMessageModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              style={{
                background: '#1a1a1a',
                borderRadius: '32px',
                padding: '40px',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '80vh',
                overflowY: 'auto',
                border: '1px solid #333333',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px',
              }}>
                <div>
                  <motion.h3 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    style={{
                      fontSize: '2rem',
                      fontWeight: 'normal',
                      color: 'white',
                      margin: '0 0 8px 0',
                    }}
                  >
                    💬 Pesan dari Penulis
                  </motion.h3>
                  <motion.p
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    style={{
                      fontSize: '0.95rem',
                      color: '#999999',
                      margin: 0,
                    }}
                  >
                    {userMessages.length} pesan • Balasan dari Farid Ardiansyah
                  </motion.p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowUserMessageModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#999999',
                    fontSize: '2rem',
                    cursor: 'pointer',
                    lineHeight: 1,
                  }}
                >
                  ×
                </motion.button>
              </div>

              {userMessages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    padding: '40px',
                    textAlign: 'center',
                    color: '#666666',
                    border: '1px dashed #333333',
                    borderRadius: '24px',
                  }}
                >
                  <MessageIcon width={40} height={40} />
                  <p style={{ fontSize: '1.1rem', margin: '15px 0 0 0' }}>
                    Belum ada pesan dari penulis.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowUserMessageModal(false);
                      setShowMessageModal(true);
                    }}
                    style={{
                      marginTop: '20px',
                      padding: '10px 24px',
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '30px',
                      color: 'white',
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                    }}
                  >
                    Kirim Saran Baru
                  </motion.button>
                </motion.div>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                }}>
                  {userMessages.map((msg, index) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      style={{
                        padding: '24px',
                        background: msg.replies?.length > 0 ? 'rgba(0,204,136,0.05)' : 'rgba(255,255,255,0.02)',
                        borderRadius: '24px',
                        border: msg.replies?.length > 0 ? '1px solid rgba(0,204,136,0.2)' : '1px solid rgba(255,255,255,0.05)',
                        cursor: 'pointer',
                      }}
                      onClick={() => setSelectedUserMessage(selectedUserMessage === msg.id ? null : msg.id)}
                    >
                      {/* Header Pesan */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '15px',
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                        }}>
                          <img 
                            src={msg.userPhoto}
                            alt={msg.userName}
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                            }}
                            onError={(e) => {
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.userName || 'User')}&background=random&color=fff`;
                            }}
                          />
                          <div>
                            <span style={{
                              fontSize: '1.1rem',
                              fontWeight: '500',
                              color: 'white',
                              display: 'block',
                              marginBottom: '4px',
                            }}>
                              {msg.userName} (Anda)
                            </span>
                            <span style={{
                              fontSize: '0.85rem',
                              color: '#999999',
                            }}>
                              {msg.createdAt?.toLocaleDateString?.('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) || new Date().toLocaleDateString('id-ID')}
                            </span>
                          </div>
                        </div>
                        
                        {msg.replies?.length > 0 && (
                          <span style={{
                            padding: '4px 12px',
                            background: 'rgba(0,204,136,0.1)',
                            border: '1px solid rgba(0,204,136,0.3)',
                            borderRadius: '20px',
                            color: '#00cc88',
                            fontSize: '0.8rem',
                          }}>
                            Ada balasan
                          </span>
                        )}
                      </div>

                      {/* Isi Pesan */}
                      <p style={{
                        fontSize: '1rem',
                        lineHeight: '1.6',
                        color: '#e0e0e0',
                        margin: '0 0 15px 0',
                        padding: '15px',
                        background: 'rgba(0,0,0,0.2)',
                        borderRadius: '16px',
                        borderLeft: '2px solid rgba(255,255,255,0.2)',
                      }}>
                        {msg.message}
                      </p>

                      {/* Balasan dari Penulis */}
                      {selectedUserMessage === msg.id && msg.replies && msg.replies.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          transition={{ duration: 0.3 }}
                          style={{
                            marginTop: '15px',
                            paddingLeft: '20px',
                            borderLeft: '2px solid rgba(0,204,136,0.3)',
                          }}
                        >
                          <span style={{
                            fontSize: '0.9rem',
                            color: '#00cc88',
                            display: 'block',
                            marginBottom: '10px',
                          }}>
                            Balasan dari Penulis:
                          </span>
                          {msg.replies.map((reply: any) => (
                            <div key={reply.id} style={{
                              marginBottom: '15px',
                              padding: '15px',
                              background: 'rgba(0,204,136,0.02)',
                              borderRadius: '12px',
                            }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '8px',
                              }}>
                                <img 
                                  src={reply.userPhoto}
                                  alt={reply.userName}
                                  style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                  }}
                                  onError={(e) => {
                                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(reply.userName || 'Penulis')}&background=random&color=fff`;
                                  }}
                                />
                                <span style={{
                                  fontSize: '0.9rem',
                                  fontWeight: '500',
                                  color: '#00cc88',
                                }}>
                                  {reply.userName}
                                </span>
                                <span style={{
                                  fontSize: '0.75rem',
                                  color: '#666666',
                                }}>
                                  {reply.createdAt?.toDate?.()?.toLocaleDateString?.('id-ID', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  }) || ''}
                                </span>
                              </div>
                              <p style={{
                                fontSize: '0.95rem',
                                color: '#cccccc',
                                margin: 0,
                                lineHeight: '1.6',
                              }}>
                                {reply.text}
                              </p>
                            </div>
                          ))}
                        </motion.div>
                      )}

                      {msg.replies?.length > 0 && selectedUserMessage !== msg.id && (
                        <div style={{
                          textAlign: 'right',
                          color: '#666666',
                          fontSize: '0.85rem',
                        }}>
                          Klik untuk lihat balasan
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: isMobile ? '60px 0 40px' : '80px 0 60px',
      }}>
        
        {/* Tag Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            marginBottom: '50px',
          }}
        >
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 24px',
            backgroundColor: '#222222',
            border: '1px solid #444444',
            borderRadius: '40px',
            marginBottom: '20px',
          }}>
            <TagIcon width={20} height={20} />
            <span style={{
              fontSize: isMobile ? '1.5rem' : '2rem',
              color: 'white',
            }}>
              #{currentTag.name}
            </span>
          </div>
          
          <p style={{
            fontSize: isMobile ? '1rem' : '1.1rem',
            color: '#999999',
            maxWidth: '600px',
            lineHeight: '1.6',
          }}>
            {currentTag.description}
          </p>
          
          <div style={{
            marginTop: '15px',
            color: '#666666',
            fontSize: '1rem',
          }}>
            {filteredPosts.length} artikel tersedia
          </div>
        </motion.div>

        {/* Articles List */}
        {filteredPosts.length > 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '30px',
          }}>
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link 
                  href={`/blog/${post.slug}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{
                    padding: '30px',
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    borderRadius: '24px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                  >

                    {/* Konten Artikel */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '20px',
                    }}>
                      <div style={{
                        flex: 1,
                      }}>
                        <h2 style={{
                          fontSize: isMobile ? '1.6rem' : '2rem',
                          fontWeight: 'normal',
                          color: 'white',
                          margin: index < 2 ? '30px 0 15px 0' : '0 0 15px 0',
                        }}>
                          {post.title}
                        </h2>
                        
                        <p style={{
                          fontSize: isMobile ? '1rem' : '1.1rem',
                          color: '#999999',
                          marginBottom: '20px',
                          lineHeight: '1.6',
                        }}>
                          {post.excerpt}
                        </p>
                        
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '10px',
                          marginBottom: '20px',
                        }}>
                          {post.tags.map(tag => (
                            <span
                              key={tag}
                              onClick={(e) => {
                                e.preventDefault();
                                router.push(`/tag/${tag}`);
                              }}
                              style={{
                                padding: '4px 12px',
                                backgroundColor: '#222222',
                                border: '1px solid #444444',
                                borderRadius: '20px',
                                color: '#cccccc',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#333333';
                                e.currentTarget.style.borderColor = '#666666';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#222222';
                                e.currentTarget.style.borderColor = '#444444';
                              }}
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                        
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '20px',
                          color: '#666666',
                          fontSize: '0.9rem',
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}>
                            <CalendarIcon width={16} height={16} />
                            <span>{new Date(post.date).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}</span>
                          </div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}>
                            <ClockIcon width={16} height={16} />
                            <span>{post.readTime} menit membaca</span>
                          </div>
                        </div>
                      </div>

                      {/* Tanda Panah SVG untuk setiap blog */}
                      <motion.div
                        whileHover={{ x: 5, y: -5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: isMobile ? 40 : 50,
                        }}
                      >
                        <NorthEastArrow 
                          width={isMobile ? 40 : 50} 
                          height={isMobile ? 40 : 50} 
                        />
                      </motion.div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              padding: '60px',
              textAlign: 'center',
              color: '#666666',
              border: '1px dashed #333333',
              borderRadius: '24px',
            }}
          >
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '20px' }}>🏷️</span>
            <p style={{ fontSize: '1.2rem', margin: 0 }}>Belum ada artikel dengan tag ini.</p>
          </motion.div>
        )}

        {/* ===== POST BLOG TERBARU (NEWEST) ===== */}
        {newestPosts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{
              marginTop: '80px',
              paddingTop: '40px',
              borderTop: '1px solid #333333',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              marginBottom: '30px',
            }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 'normal',
                color: 'white',
                margin: 0,
              }}>
                📌 Postingan Terbaru
              </h3>
              <span style={{
                fontSize: '0.9rem',
                color: '#666666',
                background: 'rgba(255,255,255,0.05)',
                padding: '4px 12px',
                borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.1)',
              }}>
                Newest
              </span>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}>
              {newestPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + (index * 0.1) }}
                >
                  <Link 
                    href={`/blog/${post.slug}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '20px',
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      borderRadius: '16px',
                      border: '1px solid rgba(255,255,255,0.05)',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                      e.currentTarget.style.transform = 'translateX(5px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        flex: 1,
                      }}>
                        <span style={{
                          fontSize: '1.5rem',
                          color: '#666666',
                        }}>
                          {index + 1}.
                        </span>
                        <div>
                          <h4 style={{
                            fontSize: '1.2rem',
                            fontWeight: '500',
                            color: 'white',
                            margin: '0 0 5px 0',
                          }}>
                            {post.title}
                          </h4>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px',
                            color: '#666666',
                            fontSize: '0.85rem',
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                            }}>
                              <CalendarIcon width={14} height={14} />
                              <span>{new Date(post.date).toLocaleDateString('id-ID')}</span>
                            </div>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                            }}>
                              <ClockIcon width={14} height={14} />
                              <span>{post.readTime} menit</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <motion.div
                        whileHover={{ x: 3 }}
                      >
                        <SouthWestArrow width={20} height={20} />
                      </motion.div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ===== POST BLOG TERAKHIR (LAST) ===== */}
        {lastPosts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            style={{
              marginTop: '60px',
              paddingTop: '40px',
              borderTop: '1px solid #333333',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              marginBottom: '30px',
            }}>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 'normal',
                color: 'white',
                margin: 0,
              }}>
                📚 Postingan Terakhir
              </h3>
              <span style={{
                fontSize: '0.9rem',
                color: '#666666',
                background: 'rgba(255,255,255,0.05)',
                padding: '4px 12px',
                borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.1)',
              }}>
                Last Posts
              </span>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}>
              {lastPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + (index * 0.1) }}
                >
                  <Link 
                    href={`/blog/${post.slug}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '20px',
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      borderRadius: '16px',
                      border: '1px solid rgba(255,255,255,0.05)',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                      e.currentTarget.style.transform = 'translateX(5px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        flex: 1,
                      }}>
                        <span style={{
                          fontSize: '1.5rem',
                          color: '#666666',
                        }}>
                          {index + 1}.
                        </span>
                        <div>
                          <h4 style={{
                            fontSize: '1.2rem',
                            fontWeight: '500',
                            color: 'white',
                            margin: '0 0 5px 0',
                          }}>
                            {post.title}
                          </h4>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px',
                            color: '#666666',
                            fontSize: '0.85rem',
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                            }}>
                              <CalendarIcon width={14} height={14} />
                              <span>{new Date(post.date).toLocaleDateString('id-ID')}</span>
                            </div>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                            }}>
                              <ClockIcon width={14} height={14} />
                              <span>{post.readTime} menit</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <motion.div
                        whileHover={{ x: 3 }}
                      >
                        <SouthWestArrow width={20} height={20} />
                      </motion.div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ===== REKOMENDASI POST BLOG ===== */}
        {recommendedPosts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            style={{
              marginTop: '80px',
              paddingTop: '40px',
              borderTop: '1px solid #333333',
            }}
          >
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: 'normal',
              color: 'white',
              marginBottom: '30px',
            }}>
              Rekomendasi Untukmu
            </h3>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '30px',
            }}>
              {recommendedPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 + (index * 0.1) }}
                >
                  <Link 
                    href={`/blog/${post.slug}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <div style={{
                      padding: '30px',
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      borderRadius: '24px',
                      border: '1px solid rgba(255,255,255,0.05)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      position: 'relative',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                      e.currentTarget.style.transform = 'translateY(-4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                    >
                      {/* Konten Artikel */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: '20px',
                      }}>
                        <div style={{
                          flex: 1,
                        }}>
                          <h2 style={{
                            fontSize: isMobile ? '1.6rem' : '2rem',
                            fontWeight: 'normal',
                            color: 'white',
                            margin: '0 0 15px 0',
                          }}>
                            {post.title}
                          </h2>
                          
                          <p style={{
                            fontSize: isMobile ? '1rem' : '1.1rem',
                            color: '#999999',
                            marginBottom: '20px',
                            lineHeight: '1.6',
                          }}>
                            {post.excerpt}
                          </p>
                          
                          <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '10px',
                            marginBottom: '20px',
                          }}>
                            {post.tags.map(tag => (
                              <span
                                key={tag}
                                onClick={(e) => {
                                  e.preventDefault();
                                  router.push(`/tag/${tag}`);
                                }}
                                style={{
                                  padding: '4px 12px',
                                  backgroundColor: '#222222',
                                  border: '1px solid #444444',
                                  borderRadius: '20px',
                                  color: '#cccccc',
                                  fontSize: '0.85rem',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = '#333333';
                                  e.currentTarget.style.borderColor = '#666666';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = '#222222';
                                  e.currentTarget.style.borderColor = '#444444';
                                }}
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                          
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '20px',
                            color: '#666666',
                            fontSize: '0.9rem',
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}>
                              <CalendarIcon width={16} height={16} />
                              <span>{new Date(post.date).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}</span>
                            </div>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}>
                              <ClockIcon width={16} height={16} />
                              <span>{post.readTime} menit membaca</span>
                            </div>
                          </div>
                        </div>

                        {/* Tanda Panah SVG */}
                        <motion.div
                          whileHover={{ x: 5, y: -5 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: isMobile ? 40 : 50,
                          }}
                        >
                          <NorthEastArrow 
                            width={isMobile ? 40 : 50} 
                            height={isMobile ? 40 : 50} 
                          />
                        </motion.div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Other Tags */}
        {otherTags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            style={{
              marginTop: '60px',
              paddingTop: '40px',
              borderTop: '1px solid #333333',
            }}
          >
            <h3 style={{
              fontSize: '1.3rem',
              fontWeight: 'normal',
              color: 'white',
              marginBottom: '20px',
            }}>
              Tags Lainnya
            </h3>
            
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
            }}>
              {otherTags.map((otherTag) => (
                <Link
                  key={otherTag}
                  href={`/tag/${otherTag}`}
                  style={{ textDecoration: 'none' }}
                >
                  <motion.span
                    whileHover={{ x: 5 }}
                    style={{
                      display: 'inline-block',
                      padding: '8px 20px',
                      backgroundColor: '#222222',
                      border: '1px solid #444444',
                      borderRadius: '30px',
                      color: '#cccccc',
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                    }}
                  >
                    #{TAG_INFO[otherTag].name}
                  </motion.span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Tambahkan CSS untuk animasi notifikasi */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(-100%);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
