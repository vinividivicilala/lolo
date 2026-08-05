'use client';

import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut,
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  query, 
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { initializeApp, getApps } from "firebase/app";

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

// ===== SVG ICONS =====
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

const UserAvatarIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M5 20V19C5 15.6863 7.68629 13 11 13H13C16.3137 13 19 15.6863 19 19V20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
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

const InstagramVerifiedBadge = ({ size = 16 }: { size?: number }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ marginLeft: "4px", display: "inline-block", verticalAlign: "middle", cursor: "pointer" }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <path fill="#0095F6" d="M12 2.2C13.6 3.8 16.2 3.8 17.8 2.2C18.6 3.8 20.2 5.4 21.8 6.2C20.2 7.8 20.2 10.4 21.8 12C20.2 13.6 20.2 16.2 21.8 17.8C20.2 18.6 18.6 20.2 17.8 21.8C16.2 20.2 13.6 20.2 12 21.8C10.4 20.2 7.8 20.2 6.2 21.8C5.4 20.2 3.8 18.6 2.2 17.8C3.8 16.2 3.8 13.6 2.2 12C3.8 10.4 3.8 7.8 2.2 6.2C3.8 5.4 5.4 3.8 6.2 2.2C7.8 3.8 10.4 3.8 12 2.2Z" />
        <path d="M9.2 12.3l2 2 4.6-4.6" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {showTooltip && (
        <div style={{ position: "absolute", bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)", backgroundColor: "#1a1a1a", color: "#fff", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", whiteSpace: "nowrap", zIndex: 100, border: "1px solid rgba(255,255,255,0.05)", fontFamily: FONT_FAMILY }}>
          Official Account
          <div style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", border: "6px solid transparent", borderTopColor: "#1a1a1a" }} />
        </div>
      )}
    </div>
  );
};

const OnlineIndicator = ({ online }: { online: boolean }) => {
  const color = online ? "#0D3CFC" : "#999";
  return (
    <div style={{ display: "inline-flex", alignItems: "center" }}>
      <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: color, transition: "all 0.3s ease" }} />
    </div>
  );
};

// ===== GREETING =====
const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 10) return "Selamat pagi";
  if (hour >= 10 && hour < 15) return "Selamat siang";
  if (hour >= 15 && hour < 18) return "Selamat sore";
  return "Selamat malam";
};

// ===== DATA FAQ =====
const faqData = [
  {
    id: "blog",
    title: "Blog",
    items: [
      {
        question: "Bagaimana cara menulis blog di Menuru?",
        answer: "Anda dapat menulis blog melalui dashboard akun Anda. Klik menu 'Buat Blog Baru', lalu isi judul, konten, dan tag yang sesuai. Setelah selesai, klik 'Publikasikan' untuk mempublikasikan blog Anda."
      },
      {
        question: "Apakah blog saya bisa dilihat oleh semua orang?",
        answer: "Ya, blog yang Anda publikasikan akan terlihat oleh semua pengunjung Menuru. Anda juga bisa mengatur privasi blog menjadi 'Draft' jika belum siap dipublikasikan."
      },
      {
        question: "Bagaimana cara mengedit blog yang sudah dipublikasikan?",
        answer: "Buka dashboard akun Anda, pilih 'Kelola Blog', lalu klik tombol 'Edit' pada blog yang ingin Anda ubah. Setelah selesai mengedit, klik 'Perbarui' untuk menyimpan perubahan."
      }
    ]
  },
  {
    id: "shop",
    title: "Shop",
    items: [
      {
        question: "Bagaimana cara berbelanja di Menuru Shop?",
        answer: "Anda dapat menjelajahi produk di halaman Shop, pilih produk yang diinginkan, lalu klik 'Tambah ke Keranjang'. Setelah selesai berbelanja, lanjutkan ke proses checkout dan ikuti instruksi pembayaran."
      },
      {
        question: "Metode pembayaran apa saja yang tersedia?",
        answer: "Kami menerima pembayaran melalui transfer bank, e-wallet (GoPay, OVO, Dana), dan kartu kredit/debit. Semua transaksi diproses secara aman."
      },
      {
        question: "Berapa lama waktu pengiriman barang?",
        answer: "Waktu pengiriman bervariasi tergantung lokasi Anda. Untuk wilayah Jabodetabek, estimasi 1-3 hari kerja. Untuk luar Jawa, estimasi 3-7 hari kerja."
      }
    ]
  },
  {
    id: "donation",
    title: "Donation",
    items: [
      {
        question: "Bagaimana cara melakukan donasi?",
        answer: "Anda dapat melakukan donasi melalui halaman Donasi. Pilih nominal donasi yang diinginkan, lalu ikuti instruksi pembayaran. Donasi Anda akan disalurkan kepada penerima yang membutuhkan."
      },
      {
        question: "Apakah donasi saya bisa digunakan untuk program tertentu?",
        answer: "Ya, Anda dapat memilih program donasi yang ingin Anda dukung. Setiap program memiliki deskripsi dan tujuan yang jelas."
      },
      {
        question: "Bagaimana saya bisa melihat laporan donasi?",
        answer: "Laporan donasi dapat diakses melalui dashboard akun Anda. Di sana Anda dapat melihat riwayat donasi dan program yang telah Anda dukung."
      }
    ]
  },
  {
    id: "news",
    title: "News",
    items: [
      {
        question: "Bagaimana cara mendapatkan berita terbaru dari Menuru?",
        answer: "Anda dapat mengikuti halaman News atau berlangganan newsletter kami. Kami akan mengirimkan berita terbaru langsung ke email Anda."
      },
      {
        question: "Apakah saya bisa mengirimkan berita atau artikel?",
        answer: "Ya, Anda dapat mengirimkan artikel atau berita melalui form kontribusi yang tersedia di halaman News. Tim kami akan meninjau dan mempublikasikannya jika sesuai."
      }
    ]
  },
  {
    id: "calendar",
    title: "Calendar",
    items: [
      {
        question: "Apa fungsi Calendar di Menuru?",
        answer: "Calendar digunakan untuk menampilkan jadwal acara, webinar, dan kegiatan penting lainnya yang diselenggarakan oleh Menuru atau komunitas."
      },
      {
        question: "Bagaimana cara menambahkan acara ke Calendar?",
        answer: "Jika Anda memiliki akun dengan izin khusus, Anda dapat menambahkan acara melalui tombol 'Tambah Acara' di halaman Calendar. Isi detail acara dan klik 'Simpan'."
      }
    ]
  },
  {
    id: "note",
    title: "Note",
    items: [
      {
        question: "Apa itu fitur Note di Menuru?",
        answer: "Note adalah fitur catatan pribadi yang memungkinkan Anda menyimpan ide, daftar tugas, atau informasi penting lainnya dengan aman."
      },
      {
        question: "Apakah catatan saya aman dan pribadi?",
        answer: "Ya, catatan Anda bersifat pribadi dan hanya dapat diakses oleh Anda. Semua catatan disimpan dengan enkripsi untuk menjaga keamanan data Anda."
      },
      {
        question: "Bisakah saya berbagi catatan dengan orang lain?",
        answer: "Saat ini, fitur Note bersifat pribadi. Namun, kami sedang mengembangkan fitur berbagi catatan untuk rilis mendatang."
      }
    ]
  }
];

export default function PusatBantuanPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [greetingText, setGreetingText] = useState(getGreeting());
  const greetingRef = useRef<HTMLSpanElement>(null);

  // Search state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchExpandedRef = useRef<HTMLDivElement>(null);

  // Rolling text search
  const searchRollingTexts = ["Tentang Note", "Tentang Donasi", "Tentang Blog", "Tentang Shop", "Tentang Pusat bantuan"];
  const [rollingText, setRollingText] = useState(searchRollingTexts[0]);
  const rollingRef = useRef<HTMLSpanElement>(null);

  // Profile dropdown
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Notification dropdown
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const [totalUnread, setTotalUnread] = useState(0);

  // FAQ accordion state
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  // Update greeting
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

  // Auth
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        setIsAdmin(currentUser.email === ADMIN_EMAIL);
        try {
          const userRef = doc(db, "users", currentUser.uid);
          await updateDoc(userRef, {
            online: true,
            lastSeen: serverTimestamp()
          });
        } catch (e) {}
      }
    });
    return () => unsubscribe();
  }, []);

  // Load unread count
  useEffect(() => {
    if (!db || !user) return;
    const chatsRef = collection(db, "chats");
    const unsubscribe = onSnapshot(chatsRef, async (snapshot) => {
      let count = 0;
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        if (data.participants && data.participants.includes(user.uid)) {
          const messagesRef = collection(db, "chats", docSnap.id, "messages");
          const q = query(messagesRef);
          const msgSnap = await import('firebase/firestore').then(({ getDocs, query, where }) => 
            getDocs(query(messagesRef, where("read", "==", false), where("senderId", "!=", user.uid)))
          );
          count += msgSnap.size;
        }
      }
      setTotalUnread(count);
    });
    return () => unsubscribe();
  }, [user]);

  // Logout
  const handleLogout = async () => {
    if (!auth) return;
    try {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { online: false, lastSeen: serverTimestamp() });
      }
      await signOut(auth);
      setShowProfileDropdown(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // GSAP animation for FAQ items with plus sign
  useEffect(() => {
    const plusSigns = document.querySelectorAll('.plus-sign-faq');
    plusSigns.forEach((plus) => {
      const el = plus as HTMLElement;
      el.addEventListener('mouseenter', () => {
        gsap.to(el, { rotate: 90, duration: 0.3, ease: "power2.out" });
      });
      el.addEventListener('mouseleave', () => {
        gsap.to(el, { rotate: 0, duration: 0.3, ease: "power2.out" });
      });
    });
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#ffffff", fontFamily: FONT_FAMILY }}>
        <div style={{ fontSize: "18px", color: "#000" }}>Loading...</div>
      </div>
    );
  }

  const toggleFaq = (id: string) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <>
      <Head>
        <title>Pusat Bantuan | Menuru</title>
        <meta name="description" content="Pusat Bantuan Menuru" />
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
        overflow: "hidden",
      }}>
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
              <Link href="/" style={{ textDecoration: "none" }}>
                <span style={{
                  fontSize: "48px",
                  fontWeight: 700,
                  color: "#000000",
                  fontFamily: FONT_FAMILY,
                  letterSpacing: "-0.03em",
                  background: "transparent",
                  cursor: "pointer",
                }}>
                  Menuru
                </span>
              </Link>
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
                      <span ref={rollingRef} style={{ color: "#ffffff", fontWeight: 400, display: "inline-block", fontSize: "14px" }}>
                        {rollingText}
                      </span>
                    </div>
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", fontWeight: 300 }}>⌘K</span>
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
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", minHeight: "200px" }}>
                      <div style={{ color: "#ffffff", fontSize: "16px", fontFamily: FONT_FAMILY, padding: "30px 0", textAlign: "center", fontWeight: 400 }}>
                        Tidak ada hasil
                      </div>
                    </div>
                    <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                      <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px", fontFamily: FONT_FAMILY }}>ESC untuk keluar</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* KANAN: Shop + Pusat bantuan + Notif + Profile */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Link href="/shop" style={{ textDecoration: "none" }}>
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
              >
                <StoreIcon size={22} />
                <span>Shop</span>
              </motion.button>
            </Link>

            {/* Pusat bantuan - active */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "16px",
                fontWeight: 500,
                fontFamily: FONT_FAMILY,
                padding: "8px 12px",
                borderRadius: "30px",
                backgroundColor: "rgba(13,60,252,0.08)",
                color: "#0D3CFC",
              }}
            >
              <HelpDeskIcon size={22} />
              <span>Pusat bantuan</span>
            </motion.div>

            {/* Notification */}
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
                        {totalUnread} pesan belum dibaca
                      </div>
                    )}
                    <div style={{ padding: "8px 16px", borderTop: "1px solid #f0f0f0", textAlign: "center" }}>
                      <Link href="/" style={{ background: "none", border: "none", color: "#0D3CFC", fontSize: "12px", cursor: "pointer", fontFamily: FONT_FAMILY, textDecoration: "none" }}
                        onClick={() => setShowNotifications(false)}
                      >
                        Lihat semua pesan
                      </Link>
                    </div>
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
                      <img src={user.photoURL} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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
                            setShowProfileDropdown(false);
                            window.location.href = '/';
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

        {/* ===== KONTEN UTAMA ===== */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-start",
          padding: "140px 40px 60px 40px",
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
          minHeight: "100vh",
        }}>
          {/* Teks "Pusat Bantuan" - 200px */}
          <motion.h1
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "power3.out", delay: 0.2 }}
            style={{
              fontSize: "200px",
              fontWeight: 700,
              color: "#0D3CFC",
              fontFamily: FONT_FAMILY,
              letterSpacing: "-0.05em",
              lineHeight: 1,
              margin: 0,
              padding: 0,
              textAlign: "left",
              textShadow: "0 4px 40px rgba(13,60,252,0.08)",
              wordBreak: "break-word",
              width: "100%",
            }}
          >
            Pusat Bantuan
          </motion.h1>

          {/* ===== FAQ ACCORDION ===== */}
          <div style={{
            marginTop: "60px",
            width: "100%",
            maxWidth: "900px",
          }}>
            {faqData.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.08, ease: "power2.out" }}
                style={{
                  marginBottom: "24px",
                  borderBottom: index < faqData.length - 1 ? "1px solid #f0f0f0" : "none",
                  paddingBottom: index < faqData.length - 1 ? "24px" : "0",
                }}
              >
                {/* Judul Section - biru */}
                <div
                  onClick={() => toggleFaq(section.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    cursor: "pointer",
                    padding: "8px 0",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.paddingLeft = "8px";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.paddingLeft = "0";
                  }}
                >
                  <span className="plus-sign-faq" style={{
                    fontSize: "32px",
                    fontWeight: 300,
                    color: "#0D3CFC",
                    display: "inline-block",
                    transition: "transform 0.3s ease",
                    width: "40px",
                    textAlign: "center",
                    transform: openFaqId === section.id ? "rotate(45deg)" : "rotate(0deg)",
                  }}>
                    +
                  </span>
                  <span style={{
                    fontSize: "28px",
                    fontWeight: 600,
                    color: "#0D3CFC",
                    fontFamily: FONT_FAMILY,
                    letterSpacing: "-0.02em",
                  }}>
                    {section.title}
                  </span>
                </div>

                {/* Konten FAQ - hitam */}
                <AnimatePresence>
                  {openFaqId === section.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: "power2.out" }}
                      style={{
                        overflow: "hidden",
                        paddingLeft: "56px",
                      }}
                    >
                      <div style={{
                        paddingTop: "8px",
                        paddingBottom: "4px",
                      }}>
                        {section.items.map((item, idx) => (
                          <div key={idx} style={{
                            marginBottom: "20px",
                            padding: "16px 20px",
                            backgroundColor: "#f8f8f8",
                            borderRadius: "8px",
                            borderLeft: "3px solid #0D3CFC",
                          }}>
                            <div style={{
                              fontSize: "16px",
                              fontWeight: 600,
                              color: "#000000",
                              fontFamily: FONT_FAMILY,
                              marginBottom: "6px",
                            }}>
                              {item.question}
                            </div>
                            <div style={{
                              fontSize: "15px",
                              color: "#333333",
                              fontFamily: FONT_FAMILY,
                              lineHeight: 1.7,
                            }}>
                              {item.answer}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
