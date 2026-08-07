'use client';

import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { initializeApp, getApps } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  updateProfile 
} from "firebase/auth";
import gsap from 'gsap';

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

let app = null;
let auth = null;

if (typeof window !== "undefined") {
  app = getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApps()[0];

  auth = getAuth(app);
}

const FONT_FAMILY = "'Poppins', 'Poppins Fallback', sans-serif";

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

// ===== ICON MATA UNTUK PASSWORD =====
const EyeIcon = ({ open }: { open: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {open ? (
      <>
        <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </>
    ) : (
      <>
        <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3 3L21 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </>
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

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [rollingIndex, setRollingIndex] = useState(0);
  const [rollingText, setRollingText] = useState(searchRollingTexts[0]);
  const rollingRef = useRef<HTMLSpanElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchExpandedRef = useRef<HTMLDivElement>(null);
  const termsContainerRef = useRef<HTMLDivElement>(null);
  const checkboxRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
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

  // Click outside search
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

  // Scroll detection untuk terms
  useEffect(() => {
    const handleScroll = () => {
      if (termsContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = termsContainerRef.current;
        const isBottom = scrollTop + clientHeight >= scrollHeight - 10;
        setIsScrolledToBottom(isBottom);
        
        // GSAP animasi border saat mencapai bottom
        if (isBottom) {
          gsap.to(termsContainerRef.current, {
            borderColor: '#22c55e',
            duration: 0.5,
            ease: 'power2.out',
          });
        } else {
          gsap.to(termsContainerRef.current, {
            borderColor: '#e8e8e8',
            duration: 0.3,
            ease: 'power2.in',
          });
        }
      }
    };
    
    const container = termsContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // GSAP animasi checkbox saat dicentang
  useEffect(() => {
    if (checkboxRef.current) {
      if (acceptedTerms) {
        gsap.fromTo(checkboxRef.current,
          { scale: 0.8 },
          { scale: 1, duration: 0.3, ease: 'back.out(1.7)' }
        );
      }
    }
  }, [acceptedTerms]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms || !isScrolledToBottom) {
      setError("Harap baca dan setujui syarat & ketentuan terlebih dahulu.");
      return;
    }
    
    setIsLoading(true);
    setError("");

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      await updateProfile(userCredential.user, {
        displayName: formData.name
      });

      console.log("User created successfully:", userCredential.user);
      router.push('/');
      
    } catch (error: any) {
      console.error("Sign up error:", error);
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError("Email sudah digunakan. Coba email lain atau login.");
          break;
        case 'auth/invalid-email':
          setError("Email tidak valid.");
          break;
        case 'auth/weak-password':
          setError("Password terlalu lemah. Minimal 6 karakter.");
          break;
        case 'auth/operation-not-allowed':
          setError("Registrasi email/password tidak diaktifkan.");
          break;
        default:
          setError("Terjadi kesalahan. Silakan coba lagi.");
      }
      
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sign Up | Menuru</title>
        <meta name="description" content="Buat akun Menuru" />
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
        .terms-scroll::-webkit-scrollbar {
          width: 4px;
          display: block;
        }
        .terms-scroll::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        .terms-scroll::-webkit-scrollbar-thumb {
          background: #0D3CFC;
          border-radius: 4px;
        }
        .terms-scroll {
          scrollbar-width: thin;
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

        {/* ===== KONTEN SIGN UP ===== */}
        <div style={{
          marginTop: "180px",
          padding: "0 40px 80px",
          width: "100%",
          maxWidth: "1400px",
          marginLeft: "auto",
          marginRight: "auto",
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? "40px" : "80px",
          alignItems: isMobile ? "center" : "flex-start",
          minHeight: "calc(100vh - 260px)",
          justifyContent: "center",
        }}>
          {/* SISI KIRI: Sign Up 200px + Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "power2.out" }}
            style={{
              flex: isMobile ? "1" : "0 0 55%",
              maxWidth: isMobile ? "100%" : "600px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            {/* Teks Sign Up 200px */}
            <h1 style={{
              fontSize: isMobile ? "80px" : "200px",
              fontWeight: 700,
              color: "#0D3CFC",
              fontFamily: FONT_FAMILY,
              letterSpacing: "-0.05em",
              lineHeight: 1,
              margin: "0 0 10px 0",
              textAlign: "left",
              wordBreak: "break-word",
            }}>
              Sign Up
            </h1>

            <p style={{
              fontSize: "18px",
              color: "#666666",
              fontFamily: FONT_FAMILY,
              marginBottom: "32px",
              textAlign: "left",
            }}>
              Create your account to join the Menuru community
            </p>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{
                    backgroundColor: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.3)",
                    borderRadius: "8px",
                    padding: "12px 16px",
                    marginBottom: "16px",
                    color: "#ef4444",
                    fontSize: "14px",
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <motion.form
              onSubmit={handleSignUp}
              style={{ width: "100%" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                style={{
                  width: "100%",
                  padding: "16px 20px",
                  border: "2px solid #e8e8e8",
                  borderRadius: "12px",
                  fontSize: "16px",
                  fontFamily: FONT_FAMILY,
                  background: "#ffffff",
                  color: "#000000",
                  outline: "none",
                  marginBottom: "16px",
                  transition: "border-color 0.2s ease",
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = "#0D3CFC"}
                onBlur={(e) => e.currentTarget.style.borderColor = "#e8e8e8"}
              />
              
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                style={{
                  width: "100%",
                  padding: "16px 20px",
                  border: "2px solid #e8e8e8",
                  borderRadius: "12px",
                  fontSize: "16px",
                  fontFamily: FONT_FAMILY,
                  background: "#ffffff",
                  color: "#000000",
                  outline: "none",
                  marginBottom: "16px",
                  transition: "border-color 0.2s ease",
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = "#0D3CFC"}
                onBlur={(e) => e.currentTarget.style.borderColor = "#e8e8e8"}
              />

              {/* Password dengan icon mata */}
              <div style={{
                position: "relative",
                marginBottom: "12px",
              }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password (min. 6 characters)"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                  style={{
                    width: "100%",
                    padding: "16px 50px 16px 20px",
                    border: "2px solid #e8e8e8",
                    borderRadius: "12px",
                    fontSize: "16px",
                    fontFamily: FONT_FAMILY,
                    background: "#ffffff",
                    color: "#000000",
                    outline: "none",
                    transition: "border-color 0.2s ease",
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = "#0D3CFC"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "#e8e8e8"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#999",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>

              {/* ===== PERNYATAAN PERSETUJUAN DENGAN SCROLL ===== */}
              <div style={{ marginBottom: "12px" }}>
                <div
                  ref={termsContainerRef}
                  className="terms-scroll"
                  style={{
                    maxHeight: "120px",
                    overflowY: "auto",
                    padding: "12px 16px",
                    border: `2px solid ${isScrolledToBottom ? '#22c55e' : '#e8e8e8'}`,
                    borderRadius: "8px",
                    fontSize: "13px",
                    color: "#666",
                    fontFamily: FONT_FAMILY,
                    lineHeight: 1.6,
                    transition: "border-color 0.3s ease",
                    backgroundColor: "#fafafa",
                    marginBottom: "10px",
                  }}
                >
                  <p style={{ margin: "0 0 8px 0", fontWeight: 600, color: "#333" }}>📋 Persyaratan Layanan:</p>
                  <p style={{ margin: "0 0 6px 0" }}>
                    1. Anda setuju untuk menggunakan layanan ini sesuai dengan ketentuan yang berlaku.
                  </p>
                  <p style={{ margin: "0 0 6px 0" }}>
                    2. Data pribadi Anda akan dilindungi sesuai dengan Kebijakan Privasi kami.
                  </p>
                  <p style={{ margin: "0 0 6px 0" }}>
                    3. Anda bertanggung jawab penuh atas akun dan aktivitas Anda.
                  </p>
                  <p style={{ margin: "0 0 6px 0" }}>
                    4. Kami berhak mengubah ketentuan ini setiap saat dengan pemberitahuan.
                  </p>
                  <p style={{ margin: "0 0 6px 0" }}>
                    5. Penggunaan layanan ini menunjukkan persetujuan Anda terhadap semua ketentuan.
                  </p>
                  <p style={{ margin: "0 0 6px 0" }}>
                    6. Dilarang menggunakan layanan untuk tujuan ilegal atau merugikan.
                  </p>
                  <p style={{ margin: "0 0 6px 0" }}>
                    7. Akun yang melanggar ketentuan dapat ditangguhkan atau dihapus.
                  </p>
                  <p style={{ margin: "0 0 6px 0" }}>
                    8. Kami tidak bertanggung jawab atas kerugian yang timbul dari penggunaan layanan.
                  </p>
                  <p style={{ 
                    margin: "6px 0 0 0", 
                    color: isScrolledToBottom ? "#22c55e" : "#999",
                    fontWeight: 500,
                    transition: "color 0.3s ease",
                  }}>
                    {isScrolledToBottom ? "✓ Telah membaca semua syarat" : "⬇️ Gulir ke bawah untuk menyetujui"}
                  </p>
                </div>

                {/* Checkbox Persetujuan */}
                <label style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  fontSize: "14px",
                  color: "#333",
                  fontFamily: FONT_FAMILY,
                  cursor: "pointer",
                  padding: "4px 0",
                }}>
                  <input
                    ref={checkboxRef}
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    disabled={!isScrolledToBottom}
                    style={{
                      width: "20px",
                      height: "20px",
                      minWidth: "20px",
                      accentColor: "#0D3CFC",
                      cursor: isScrolledToBottom ? "pointer" : "not-allowed",
                      borderRadius: "4px",
                      opacity: isScrolledToBottom ? 1 : 0.5,
                    }}
                  />
                  <span>
                    Saya telah membaca dan menyetujui{" "}
                    <Link href="/ketentuan" style={{ color: "#0D3CFC", textDecoration: "underline" }}>
                      Syarat & Ketentuan
                    </Link>
                    {" "}dan{" "}
                    <Link href="/kebijakan" style={{ color: "#0D3CFC", textDecoration: "underline" }}>
                      Kebijakan Privasi
                    </Link>
                  </span>
                </label>
              </div>

              <motion.button
                type="submit"
                disabled={isLoading || !acceptedTerms || !isScrolledToBottom}
                style={{
                  width: "100%",
                  padding: "16px 20px",
                  backgroundColor: (isLoading || !acceptedTerms || !isScrolledToBottom) ? "#ccc" : "#0D3CFC",
                  color: "#fff",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "18px",
                  fontWeight: 600,
                  fontFamily: FONT_FAMILY,
                  cursor: (isLoading || !acceptedTerms || !isScrolledToBottom) ? "not-allowed" : "pointer",
                  opacity: (isLoading || !acceptedTerms || !isScrolledToBottom) ? 0.7 : 1,
                  transition: "all 0.3s ease",
                }}
                whileHover={(!isLoading && acceptedTerms && isScrolledToBottom) ? { scale: 1.02, backgroundColor: "#0a2fc9" } : {}}
                whileTap={(!isLoading && acceptedTerms && isScrolledToBottom) ? { scale: 0.98 } : {}}
              >
                {isLoading ? "Creating Account..." : "Get Started"}
              </motion.button>
            </motion.form>

            {/* Link ke Sign In */}
            <div style={{
              textAlign: "center",
              fontSize: "16px",
              color: "#666666",
              fontFamily: FONT_FAMILY,
              marginTop: "16px",
            }}>
              Already have an account?{" "}
              <Link
                href="/signin"
                style={{
                  color: "#0D3CFC",
                  textDecoration: "underline",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Sign in
              </Link>
            </div>

            {/* Pusat Bantuan */}
            <div style={{
              textAlign: "center",
              marginTop: "20px",
              paddingTop: "20px",
              borderTop: "1px solid #f0f0f0",
            }}>
              <Link
                href="/pusat-bantuan"
                style={{
                  color: "#0D3CFC",
                  fontSize: "15px",
                  fontWeight: 500,
                  fontFamily: FONT_FAMILY,
                  textDecoration: "none",
                  transition: "color 0.2s ease",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
                onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
                onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}
              >
                <HelpDeskIcon size={18} />
                <span>Pusat Bantuan</span>
              </Link>
            </div>
          </motion.div>

          {/* SISI KANAN: Kosong */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "power2.out" }}
            style={{
              flex: isMobile ? "0" : "1",
              display: isMobile ? "none" : "block",
            }}
          />
        </div>
      </div>
    </>
  );
}
