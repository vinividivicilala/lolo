'use client';

import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { initializeApp, getApps } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword,
  updatePassword,
  sendPasswordResetEmail,
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
} from "firebase/firestore";
import gsap from 'gsap';

// Firebase Config (sama dengan yang lain)
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

// ===== ICONS (sama seperti SignInPage) =====
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

const ShopIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 7L4 20H20L21 7H3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M7 7L8 4H16L17 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 11V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M15 11V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
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

// ===== SEARCH ROLLING TEXT =====
const searchRollingTexts = [
  "Tentang Note", 
  "Tentang Donasi", 
  "Tentang Blog", 
  "Tentang Shop", 
  "Tentang Pusat bantuan"
];

export default function ForgotPasswordPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  // State untuk search
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [rollingText, setRollingText] = useState<string>(searchRollingTexts[0]);
  const rollingRef = useRef<HTMLSpanElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchExpandedRef = useRef<HTMLDivElement>(null);

  // State untuk opsi lupa
  const [selectedOption, setSelectedOption] = useState<'password' | 'email' | 'pin' | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    pin: "",
  });
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [ticketId, setTicketId] = useState("");

  // State untuk menampilkan pernyataan persetujuan (GSAP)
  const [showAgreement, setShowAgreement] = useState(false);
  const agreementRef = useRef<HTMLDivElement>(null);

  // ===== MOUNTING =====
  useEffect(() => {
    setIsMounted(true);
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

  // ===== ROLLING TEXT =====
  useEffect(() => {
    if (!isMounted) return;
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
  }, [isMounted]);

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
      // Validasi dasar
      if (selectedOption === 'password') {
        if (!formData.email || !formData.name) {
          setError("Email dan Nama harus diisi.");
          setLoading(false);
          return;
        }
        // Kirim email reset password
        await sendPasswordResetEmail(auth, formData.email);
      } else if (selectedOption === 'email') {
        if (!formData.name) {
          setError("Nama harus diisi.");
          setLoading(false);
          return;
        }
        // Untuk lupa email, kita hanya butuh name, nanti agent akan membantu
      } else if (selectedOption === 'pin') {
        if (!formData.email || !formData.name) {
          setError("Email dan Nama harus diisi.");
          setLoading(false);
          return;
        }
      }

      // Buat ticket di Firestore (livechat_tickets)
      const ticketData = {
        userId: null, // karena belum login
        userName: formData.name || "Pengguna",
        userEmail: formData.email || "tidakada@email.com",
        topic: selectedOption === 'password' ? 'Lupa Password' :
               selectedOption === 'email' ? 'Lupa Email' : 'Lupa Pola Sandi',
        status: 'waiting',
        createdAt: serverTimestamp(),
        unreadCount: 0,
        typing: false,
        typingUserId: null,
        typingUserName: null,
        // tambahan informasi
        detail: selectedOption === 'password' ? `Email: ${formData.email}` :
                selectedOption === 'email' ? `Nama: ${formData.name}` :
                `Email: ${formData.email}, Nama: ${formData.name}`,
      };

      const docRef = await addDoc(collection(db, "livechat_tickets"), ticketData);
      setTicketId(docRef.id);
      setSuccess(true);
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
    setFormData({ email: "", name: "", currentPassword: "", newPassword: "", confirmPassword: "", pin: "" });
    setAgreed(false);
    setError("");
    setSuccess(false);
    setTicketId("");
    setShowAgreement(false);
    if (agreementRef.current) {
      gsap.set(agreementRef.current, { height: 0, opacity: 0 });
    }
  };

  // ===== RENDER =====
  if (!isMounted) {
    return (
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

        {/* ===== HEADER (sama seperti SignInPage) ===== */}
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
            <Link href="/" passHref style={{ textDecoration: "none" }}>
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
                          fontFamily: FONT_FAMILY,
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

          {/* KANAN: Shop + Pusat bantuan + Notif + Profile */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Link href="/shop" passHref style={{ textDecoration: "none" }}>
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

            <Link href="/pusat-bantuan" passHref style={{ textDecoration: "none" }}>
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

            {/* Notification */}
            <div style={{ position: "relative" }}>
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
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
                <NotificationsIcon size={24} hasBadge={false} />
              </motion.button>
            </div>

            {/* Profile - Login/Signup link */}
            <div style={{ position: "relative" }}>
              <Link href="/signin" passHref style={{ textDecoration: "none" }}>
                <motion.a
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 12px",
                    borderRadius: "30px",
                    backgroundColor: "transparent",
                    color: "#000000",
                    fontSize: "16px",
                    fontWeight: 500,
                    fontFamily: FONT_FAMILY,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.04)"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  <UserAvatarIcon size={22} />
                  <span>Login</span>
                </motion.a>
              </Link>
            </div>
          </div>
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
          justifyContent: "center",
        }}>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "power2.out" }}
            style={{
              width: "100%",
              maxWidth: "800px",
            }}
          >
            {!selectedOption && !success ? (
              // ===== TAMPILAN AWAL: 3 OPSI =====
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
                  marginBottom: "40px",
                }}>
                  Pilih masalah yang Anda alami:
                </p>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                  gap: '24px',
                  width: '100%',
                }}>
                  {[
                    { id: 'password', label: 'Lupa Password', icon: '🔑', desc: 'Reset password Anda' },
                    { id: 'email', label: 'Lupa Email', icon: '📧', desc: 'Cari tahu email terdaftar' },
                    { id: 'pin', label: 'Lupa Pola Sandi', icon: '🔒', desc: 'Reset PIN 6 digit' },
                  ].map((item) => (
                    <motion.div
                      key={item.id}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      style={{
                        padding: '30px 20px',
                        backgroundColor: '#f8faff',
                        borderRadius: '16px',
                        border: '2px solid #e8e8e8',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'border-color 0.2s ease',
                      }}
                      onClick={() => setSelectedOption(item.id as any)}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#0D3CFC'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e8e8e8'}
                    >
                      <div style={{ fontSize: '48px', marginBottom: '12px' }}>{item.icon}</div>
                      <h3 style={{
                        fontSize: '24px',
                        fontWeight: 600,
                        color: '#0D3CFC',
                        fontFamily: FONT_FAMILY,
                        marginBottom: '8px',
                      }}>
                        {item.label}
                      </h3>
                      <p style={{
                        fontSize: '16px',
                        color: '#666',
                        fontFamily: FONT_FAMILY,
                        margin: 0,
                      }}>
                        {item.desc}
                      </p>
                    </motion.div>
                  ))}
                </div>

                <div style={{
                  marginTop: '40px',
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '16px',
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
                </div>
              </>
            ) : success ? (
              // ===== SUKSES =====
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: '100%',
                  padding: '40px 0',
                }}
              >
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
                <h2 style={{
                  fontSize: '32px',
                  fontWeight: 600,
                  color: '#0D3CFC',
                  fontFamily: FONT_FAMILY,
                  marginBottom: '12px',
                }}>
                  Tiket Berhasil Dibuat!
                </h2>
                <p style={{
                  fontSize: '18px',
                  color: '#666',
                  fontFamily: FONT_FAMILY,
                  textAlign: 'center',
                  maxWidth: '500px',
                }}>
                  Permintaan Anda telah dikirim ke tim support. Kami akan segera merespon melalui email atau live chat.
                  <br />
                  <span style={{ fontSize: '14px', color: '#999', marginTop: '8px', display: 'block' }}>
                    ID Tiket: {ticketId}
                  </span>
                </p>
                <div style={{ display: 'flex', gap: '16px', marginTop: '30px' }}>
                  <button
                    onClick={resetForm}
                    style={{
                      padding: '12px 28px',
                      backgroundColor: '#0D3CFC',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      cursor: 'pointer',
                      fontFamily: FONT_FAMILY,
                    }}
                  >
                    Buat Tiket Baru
                  </button>
                  <Link href="/">
                    <button
                      style={{
                        padding: '12px 28px',
                        backgroundColor: 'transparent',
                        color: '#0D3CFC',
                        border: '2px solid #0D3CFC',
                        borderRadius: '8px',
                        fontSize: '16px',
                        cursor: 'pointer',
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      Ke Beranda
                    </button>
                  </Link>
                </div>
              </motion.div>
            ) : (
              // ===== FORM TIKET =====
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                style={{ width: '100%' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                  <button
                    onClick={resetForm}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#0D3CFC',
                      fontSize: '24px',
                      cursor: 'pointer',
                      fontFamily: FONT_FAMILY,
                    }}
                  >
                    ←
                  </button>
                  <h2 style={{
                    fontSize: '32px',
                    fontWeight: 600,
                    color: '#0D3CFC',
                    fontFamily: FONT_FAMILY,
                    margin: 0,
                  }}>
                    {selectedOption === 'password' && 'Lupa Password'}
                    {selectedOption === 'email' && 'Lupa Email'}
                    {selectedOption === 'pin' && 'Lupa Pola Sandi'}
                  </h2>
                </div>

                <form onSubmit={handleSubmitTicket} style={{ width: '100%', maxWidth: '500px' }}>
                  {/* Input fields sesuai opsi */}
                  {selectedOption === 'password' && (
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

                  {selectedOption === 'email' && (
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
                  <div style={{ marginBottom: '20px' }}>
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

                    {/* Konten Pernyataan Persetujuan (expand dengan GSAP) */}
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
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '16px',
                      backgroundColor: loading ? '#ccc' : '#0D3CFC',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '18px',
                      fontWeight: 600,
                      fontFamily: FONT_FAMILY,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {loading ? 'Mengirim...' : 'Kirim Tiket'}
                  </button>
                </form>

                {/* Link Kebijakan & Ketentuan */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '24px',
                  marginTop: '30px',
                  flexWrap: 'wrap',
                }}>
                  <Link href="/kebijakan" style={{
                    color: '#666',
                    fontSize: '14px',
                    fontFamily: FONT_FAMILY,
                    textDecoration: 'underline',
                  }}>
                    Kebijakan Privasi
                  </Link>
                  <Link href="/ketentuan" style={{
                    color: '#666',
                    fontSize: '14px',
                    fontFamily: FONT_FAMILY,
                    textDecoration: 'underline',
                  }}>
                    Ketentuan Kami
                  </Link>
                  <Link href="/pusat-bantuan" style={{
                    color: '#666',
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
        </div>
      </div>
    </>
  );
}
