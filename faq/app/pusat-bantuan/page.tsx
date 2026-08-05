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
  query, 
  onSnapshot,
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
  updateDoc,
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

const FONT_FAMILY = "'Poppins', 'Poppins Fallback', sans-serif";
const ADMIN_EMAIL = "faridardiansyah061@gmail.com";

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

const HelpDeskIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M5 15C5 13.8954 5.89543 13 7 13H8C9.10457 13 10 13.8954 10 15V17C10 18.1046 9.10457 19 8 19H7C5.89543 19 5 18.1046 5 17V15Z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M19 15C19 13.8954 18.1046 13 17 13H16C14.8954 13 14 13.8954 14 15V17C14 18.1046 14.8954 19 16 19H17C18.1046 19 19 18.1046 19 17V15Z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M8 13V11C8 8.79086 9.79086 7 12 7C14.2091 7 16 8.79086 16 11V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
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

const UserAvatarIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M5 20V19C5 15.6863 7.68629 13 11 13H13C16.3137 13 19 15.6863 19 19V20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

// ===== SEARCH ROLLING TEXT =====
const searchRollingTexts = [
  "Tentang Note", 
  "Tentang Donasi", 
  "Tentang Blog", 
  "Tentang Shop", 
  "Tentang Pusat bantuan"
];

// ===== GREETING =====
const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 10) return "Selamat pagi";
  if (hour >= 10 && hour < 15) return "Selamat siang";
  if (hour >= 15 && hour < 18) return "Selamat sore";
  return "Selamat malam";
};

// ===== FAQ DATA =====
const faqData = {
  Blog: [
    { q: "Apa itu Blog Menuru?", a: "Blog Menuru adalah platform untuk berbagi artikel, tips, dan informasi seputar gaya hidup, pengembangan diri, dan teknologi." },
    { q: "Bagaimana cara menulis artikel di Blog Menuru?", a: "Untuk menulis artikel, Anda harus login sebagai kontributor. Hubungi tim admin untuk mendapatkan akses." },
    { q: "Apakah ada biaya untuk membaca blog?", a: "Tidak, semua artikel di Blog Menuru dapat dibaca secara gratis." },
  ],
  Shop: [
    { q: "Produk apa saja yang dijual di Shop Menuru?", a: "Shop Menuru menjual merchandise eksklusif seperti kaos, tas, dan aksesoris dengan desain khas Menuru." },
    { q: "Bagaimana cara melakukan pembelian?", a: "Pilih produk, tambahkan ke keranjang, lalu ikuti proses checkout. Pembayaran melalui transfer bank atau e-wallet." },
    { q: "Apakah tersedia pengiriman internasional?", a: "Saat ini pengiriman hanya untuk wilayah Indonesia. Kami akan segera membuka pengiriman internasional." },
  ],
  Donation: [
    { q: "Bagaimana cara berdonasi?", a: "Anda dapat berdonasi melalui tombol Donasi di halaman utama, atau transfer ke rekening resmi Menuru yang tertera." },
    { q: "Kemana donasi disalurkan?", a: "Donasi disalurkan untuk kegiatan sosial, pendidikan, dan pengembangan komunitas." },
    { q: "Apakah donasi bisa mendapatkan laporan?", a: "Ya, setiap donasi akan dilaporkan secara transparan di halaman Laporan Donasi." },
  ],
  News: [
    { q: "Berita apa saja yang dimuat di News?", a: "News berisi berita terbaru seputar kegiatan Menuru, pencapaian, dan acara mendatang." },
    { q: "Apakah bisa berlangganan newsletter?", a: "Ya, Anda bisa berlangganan newsletter melalui form di halaman News." },
    { q: "Bagaimana cara mengirimkan berita?", a: "Kirimkan berita ke email redaksi@menuru.com untuk dipertimbangkan." },
  ],
  Calendar: [
    { q: "Apa fungsi Calendar?", a: "Calendar menampilkan jadwal acara, webinar, dan kegiatan komunitas Menuru." },
    { q: "Bagaimana cara menambahkan acara ke Calendar?", a: "Acara ditambahkan oleh tim admin. Jika Anda ingin mengusulkan acara, hubungi kami." },
    { q: "Apakah Calendar bisa di-sync ke Google Calendar?", a: "Ya, ada tombol sinkronisasi untuk menambahkan acara ke Google Calendar Anda." },
  ],
  Note: [
    { q: "Apa itu Note?", a: "Note adalah fitur untuk mencatat ide, catatan pribadi, atau hal penting lainnya." },
    { q: "Apakah Note bisa dibagikan?", a: "Saat ini Note bersifat pribadi. Fitur berbagi akan segera hadir." },
    { q: "Bagaimana cara menyimpan Note?", a: "Cukup tulis catatan Anda dan klik simpan. Note akan tersimpan di akun Anda." },
  ]
};

// ===== KOMPONEN FAQ ITEM =====
const FaqItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);

  const toggleFaq = () => {
    setIsOpen(!isOpen);
    if (contentRef.current) {
      if (!isOpen) {
        gsap.fromTo(contentRef.current,
          { height: 0, opacity: 0 },
          { height: 'auto', opacity: 1, duration: 0.4, ease: 'power2.out' }
        );
        gsap.to(iconRef.current, {
          rotate: 45,
          duration: 0.3,
          ease: 'power2.out'
        });
      } else {
        gsap.to(contentRef.current, {
          height: 0,
          opacity: 0,
          duration: 0.3,
          ease: 'power2.in'
        });
        gsap.to(iconRef.current, {
          rotate: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    }
  };

  return (
    <div style={{ borderBottom: '1px solid #e8e8e8', padding: '16px 0' }}>
      <div 
        onClick={toggleFaq}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          padding: '4px 0',
        }}
      >
        <span style={{
          fontSize: '30px',
          fontWeight: 500,
          color: '#0D3CFC',
          fontFamily: FONT_FAMILY,
        }}>
          {question}
        </span>
        <span ref={iconRef} style={{
          fontSize: '36px',
          fontWeight: 300,
          color: '#0D3CFC',
          transition: 'transform 0.3s ease',
          display: 'inline-block',
          flexShrink: 0,
          marginLeft: '20px',
        }}>
          +
        </span>
      </div>
      <div ref={contentRef} style={{ height: 0, overflow: 'hidden', opacity: 0 }}>
        <div style={{
          padding: '16px 0 8px 0',
          fontSize: '30px',
          color: '#333333',
          fontFamily: FONT_FAMILY,
          lineHeight: 1.6,
        }}>
          {answer}
        </div>
      </div>
    </div>
  );
};

// ===== KOMPONEN UTAMA =====
export default function PusatBantuanPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchExpandedRef = useRef<HTMLDivElement>(null);
  const [rollingIndex, setRollingIndex] = useState(0);
  const [rollingText, setRollingText] = useState(searchRollingTexts[0]);
  const rollingRef = useRef<HTMLSpanElement>(null);
  const [greetingText, setGreetingText] = useState(getGreeting());
  const greetingRef = useRef<HTMLSpanElement>(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const [totalUnread, setTotalUnread] = useState(0);
  const [users, setUsers] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

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
          setIsAdmin(isAdminUser);
          
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
            await updateDoc(userRef, {
              online: true,
              lastSeen: serverTimestamp()
            });
          }
        } catch (error) {
          console.error("Error saving user:", error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Load users untuk online status
  useEffect(() => {
    if (!db || !user) return;
    const usersRef = collection(db, "users");
    const q = query(usersRef);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userList: any[] = [];
      snapshot.forEach((doc) => {
        if (doc.id !== user.uid) {
          userList.push({ id: doc.id, ...doc.data() });
        }
      });
      setUsers(userList);
    });
    return () => unsubscribe();
  }, [user]);

  // Load chat rooms untuk notifikasi
  useEffect(() => {
    if (!db || !user) return;
    const chatsRef = collection(db, "chats");
    const q = query(chatsRef);
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      let total = 0;
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        if (data.participants && data.participants.includes(user.uid)) {
          const messagesRef = collection(db, "chats", docSnap.id, "messages");
          const unreadQuery = query(
            messagesRef, 
            where("read", "==", false),
            where("senderId", "!=", user.uid)
          );
          const unreadSnap = await getDocs(unreadQuery);
          total += unreadSnap.size;
        }
      }
      setTotalUnread(total);
    });
    return () => unsubscribe();
  }, [user]);

  // Rolling text search
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

  // Search expand
  useEffect(() => {
    if (isSearchOpen && searchExpandedRef.current) {
      gsap.fromTo(searchExpandedRef.current,
        { height: 0, opacity: 0, y: -10 },
        { height: "auto", opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
      );
      setTimeout(() => searchInputRef.current?.focus(), 300);
    }
  }, [isSearchOpen]);

  // Click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
        setSearchQuery("");
        setSearchResults([]);
      }
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
      setShowProfileDropdown(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#ffffff", fontFamily: FONT_FAMILY }}>
        <div style={{ fontSize: "18px", color: "#000", fontFamily: FONT_FAMILY }}>Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Pusat Bantuan | Menuru</title>
        <meta name="description" content="Pusat Bantuan Menuru - Bantuan dan dukungan" />
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
        overflowX: "hidden",
      }}>
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
            <Link href="/" passHref>
              <motion.a
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                style={{
                  fontSize: "48px",
                  fontWeight: 700,
                  color: "#000000",
                  fontFamily: FONT_FAMILY,
                  letterSpacing: "-0.03em",
                  background: "transparent",
                  textDecoration: "none",
                  cursor: "pointer",
                }}
              >
                Menuru
              </motion.a>
            </Link>

            {/* Search */}
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

              {/* Search Expanded */}
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

          {/* TENGAH: Note Donations News Calendar */}
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
            <span style={{
              fontSize: "29px",
              fontWeight: 500,
              color: "#000000",
              fontFamily: FONT_FAMILY,
              letterSpacing: "-0.02em",
            }}>
              Note
            </span>
            <span style={{
              fontSize: "29px",
              fontWeight: 500,
              color: "#000000",
              fontFamily: FONT_FAMILY,
              letterSpacing: "-0.02em",
            }}>
              Donations
            </span>
            <span style={{
              fontSize: "29px",
              fontWeight: 500,
              color: "#000000",
              fontFamily: FONT_FAMILY,
              letterSpacing: "-0.02em",
            }}>
              News
            </span>
            <span style={{
              fontSize: "29px",
              fontWeight: 500,
              color: "#000000",
              fontFamily: FONT_FAMILY,
              letterSpacing: "-0.02em",
            }}>
              Calendar
            </span>
          </motion.div>

          {/* KANAN: Shop + Pusat bantuan (biru) + Notif + Profile */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Shop Button */}
            <Link href="/shop" passHref>
              <motion.a
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
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.04)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                <StoreIcon size={22} />
                <span>Shop</span>
              </motion.a>
            </Link>

            {/* Help Center Button - BIRU (aktif) */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              style={{
                background: "transparent",
                border: "none",
                color: "#0D3CFC",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "16px",
                fontWeight: 600,
                fontFamily: FONT_FAMILY,
                padding: "8px 12px",
                borderRadius: "30px",
                cursor: "default",
                backgroundColor: "rgba(13,60,252,0.08)",
              }}
            >
              <HelpDeskIcon size={22} />
              <span>Pusat bantuan</span>
            </motion.div>

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
                    {totalUnread === 0 ? (
                      <div style={{ padding: "24px 16px", textAlign: "center", color: "#999", fontSize: "13px" }}>
                        Tidak ada notifikasi
                      </div>
                    ) : (
                      <div style={{ padding: "16px", textAlign: "center", color: "#666", fontSize: "13px" }}>
                        Anda memiliki {totalUnread} pesan belum dibaca.
                        <br />
                        <Link href="/" style={{ color: "#0D3CFC", fontWeight: 500, textDecoration: "none" }}>
                          Kembali ke Beranda
                        </Link>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile */}
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
                              <span style={{ fontSize: "11px", color: "#0095F6", fontWeight: 500 }}>Admin</span>
                            </div>
                          )}
                        </div>

                        <motion.button
                          whileHover={{ backgroundColor: "#f5f5f5" }}
                          onClick={() => setShowProfileDropdown(false)}
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
                          onClick={() => setShowProfileDropdown(false)}
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

        {/* ===== KONTEN PUSAT BANTUAN ===== */}
        <div style={{
          marginTop: "180px",
          padding: "0 40px 60px",
          width: "100%",
          maxWidth: "1400px",
          marginLeft: "auto",
          marginRight: "auto",
        }}>
          {/* Judul "Pusat Bantuan" 200px biru */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "power3.out" }}
            style={{
              fontSize: "200px",
              fontWeight: 700,
              color: "#0D3CFC",
              fontFamily: FONT_FAMILY,
              letterSpacing: "-0.05em",
              lineHeight: 1,
              margin: "0 0 40px 0",
              textAlign: "center",
              wordBreak: "break-word",
            }}
          >
            Pusat Bantuan
          </motion.h1>

          {/* ===== KATEGORI: Blog, Shop, Donation, News, Calendar, Note ===== */}
          {Object.keys(faqData).map((category, catIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + catIndex * 0.1 }}
              style={{ marginBottom: "60px" }}
            >
              {/* Judul Kategori 70px biru - kiri */}
              <h2 style={{
                fontSize: "70px",
                fontWeight: 700,
                color: "#0D3CFC",
                fontFamily: FONT_FAMILY,
                letterSpacing: "-0.03em",
                lineHeight: 1.2,
                margin: "0 0 20px 0",
                textAlign: "left",
              }}>
                {category}
              </h2>

              {/* Daftar FAQ - tanpa background, kiri */}
              <div style={{ maxWidth: "100%" }}>
                {faqData[category as keyof typeof faqData].map((item, idx) => (
                  <FaqItem key={idx} question={item.q} answer={item.a} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
}
