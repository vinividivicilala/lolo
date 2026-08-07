'use client';

import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { initializeApp, getApps } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  GithubAuthProvider, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  Timestamp 
} from "firebase/firestore";
import gsap from 'gsap';

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
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
}

const FONT_FAMILY = "'Poppins', 'Poppins Fallback', sans-serif";

// ===== ICONS (sama seperti Sign Up) =====
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

export default function SignInPage() {
  const router = useRouter();
  
  // --- STATE ---
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState("");
  
  // PIN state
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [storedPin, setStoredPin] = useState("");
  const [userData, setUserData] = useState<any>(null);
  
  // Search
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [rollingText, setRollingText] = useState<string>(searchRollingTexts[0]);
  const rollingRef = useRef<HTMLSpanElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchExpandedRef = useRef<HTMLDivElement>(null);

  // Notification
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // ===== EFFECTS =====
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const checkScreenSize = () => setIsMobile(window.innerWidth < 768);
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [isMounted]);

  // Rolling text
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

  // Click outside search & notification
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

  // Auth state listener
  useEffect(() => {
    if (!isMounted || !auth) return;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Cek apakah user punya PIN
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.pin) {
              setStoredPin(data.pin);
              setUserData(data);
              setShowPinModal(true); // Tampilkan modal PIN
              setUser(currentUser);
              return;
            }
          }
          // Tidak ada PIN -> langsung redirect
          setUser(currentUser);
          router.push('/');
        } catch (error) {
          console.error("Error checking PIN:", error);
          setUser(currentUser);
          router.push('/');
        }
      } else {
        setUser(null);
        setShowPinModal(false);
        setPinInput("");
        setPinError("");
      }
    });
    return () => unsubscribe();
  }, [isMounted, router]);

  // ===== LOGIN HANDLERS =====
  const handleGoogleLogin = async () => {
    if (!auth) return;
    setLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // onAuthStateChanged akan handle sisanya
    } catch (error: any) {
      setError(error.message || "Google login gagal");
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    if (!auth) return;
    setLoading(true);
    setError("");
    try {
      const provider = new GithubAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      setError(error.message || "GitHub login gagal");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!auth) return;
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle PIN check
    } catch (error: any) {
      switch (error.code) {
        case 'auth/invalid-email': setError("Email tidak valid"); break;
        case 'auth/user-disabled': setError("Akun dinonaktifkan"); break;
        case 'auth/user-not-found': setError("Akun tidak ditemukan"); break;
        case 'auth/wrong-password': setError("Password salah"); break;
        default: setError("Login gagal. Periksa email dan password Anda");
      }
    } finally {
      setLoading(false);
    }
  };

  // ===== PIN VERIFICATION =====
  const handlePinSubmit = () => {
    if (pinInput.length !== 6) {
      setPinError("PIN harus 6 digit");
      return;
    }
    if (pinInput === storedPin) {
      setShowPinModal(false);
      setPinInput("");
      setPinError("");
      router.push('/');
    } else {
      setPinError("PIN salah");
      setPinInput("");
    }
  };

  // ===== SIGN OUT =====
  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      setUser(null);
      setShowPinModal(false);
      setPinInput("");
      setPinError("");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // ===== RENDER (hanya jika sudah mounted) =====
  if (!isMounted) {
    return <div style={{ minHeight: '100vh', backgroundColor: '#fff' }} />;
  }

  return (
    <>
      <Head>
        <title>Sign In | Menuru</title>
        <meta name="description" content="Masuk ke akun Menuru" />
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
        body::-webkit-scrollbar { display: none; }
        * { scrollbar-width: none; }
        *::-webkit-scrollbar { display: none; }
        input::placeholder {
          color: #bbb;
          font-weight: 300;
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
          <div style={{
            backgroundColor: "#EB2227",
            padding: "6px 16px",
            borderRadius: "20px",
          }}>
            <span style={{
              fontSize: "18px",
              fontWeight: 700,
              color: "#ffffff",
              fontFamily: FONT_FAMILY,
              letterSpacing: "-0.01em",
            }}>
              #lifeatmenuru
            </span>
          </div>
        </motion.div>

        {/* HEADER */}
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

          {/* TENGAH */}
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
            <span style={{ fontSize: "29px", fontWeight: 500, color: "#000000", fontFamily: FONT_FAMILY }}>Note</span>
            <span style={{ fontSize: "29px", fontWeight: 500, color: "#000000", fontFamily: FONT_FAMILY }}>Donations</span>
            <span style={{ fontSize: "29px", fontWeight: 500, color: "#000000", fontFamily: FONT_FAMILY }}>News</span>
            <span style={{ fontSize: "29px", fontWeight: 500, color: "#000000", fontFamily: FONT_FAMILY }}>Calendar</span>
          </motion.div>

          {/* KANAN */}
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
                <NotificationsIcon size={24} hasBadge={false} />
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
                    <div style={{ padding: "24px 16px", textAlign: "center", color: "#999", fontSize: "13px" }}>
                      Tidak ada notifikasi
                    </div>
                    <div style={{ padding: "8px 16px", borderTop: "1px solid #f0f0f0", textAlign: "center" }}>
                      <Link href="/" style={{ background: "none", border: "none", color: "#0D3CFC", fontSize: "12px", cursor: "pointer", fontFamily: FONT_FAMILY, textDecoration: "none" }}>
                        Lihat semua pesan
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile - Login */}
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

        {/* ===== KONTEN SIGN IN ===== */}
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
          {/* SISI KIRI */}
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
              Sign In
            </h1>

            <p style={{
              fontSize: "18px",
              color: "#666666",
              fontFamily: FONT_FAMILY,
              marginBottom: "32px",
              textAlign: "left",
            }}>
              Masuk ke akun Menuru Anda
            </p>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{
                  color: "#0D3CFC",
                  fontSize: "15px",
                  fontFamily: FONT_FAMILY,
                  marginBottom: "16px",
                }}
              >
                {error}
              </motion.div>
            )}

            {/* Social Login */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px', width: '100%' }}>
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 20px',
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #e8e8e8',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontFamily: FONT_FAMILY,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  color: '#000',
                  width: '100%',
                }}
                onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#eeeeee')}
                onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#f5f5f5')}
              >
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>{loading ? 'Loading...' : 'Continue with Google'}</span>
              </button>

              <button
                onClick={handleGitHubLogin}
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 20px',
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #e8e8e8',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontFamily: FONT_FAMILY,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  color: '#000',
                  width: '100%',
                }}
                onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#eeeeee')}
                onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#f5f5f5')}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#181717">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                <span>{loading ? 'Loading...' : 'Continue with GitHub'}</span>
              </button>
            </div>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', width: '100%' }}>
              <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #e8e8e8' }} />
              <span style={{ color: '#999', fontSize: '14px', fontFamily: FONT_FAMILY }}>atau</span>
              <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #e8e8e8' }} />
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleEmailLogin} style={{ width: '100%' }}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

              <div style={{ position: 'relative', marginBottom: '24px' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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
                  }}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "16px 20px",
                  backgroundColor: loading ? "#ccc" : "#0D3CFC",
                  color: "#fff",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "18px",
                  fontWeight: 600,
                  fontFamily: FONT_FAMILY,
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                  transition: "all 0.3s ease",
                }}
                whileHover={!loading ? { scale: 1.02, backgroundColor: "#0a2fc9" } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
              >
                {loading ? "Signing In..." : "Sign In"}
              </motion.button>
            </form>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '16px',
              width: '100%',
              fontFamily: FONT_FAMILY,
            }}>
              <Link
                href="/forgot-password"
                style={{
                  color: "#0D3CFC",
                  fontSize: "14px",
                  textDecoration: "none",
                }}
              >
                Lupa password?
              </Link>
              <Link
                href="/signup"
                style={{
                  color: "#0D3CFC",
                  fontSize: "14px",
                  textDecoration: "none",
                }}
              >
                Buat akun
              </Link>
            </div>

            <div style={{
              textAlign: "center",
              marginTop: "24px",
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

          {/* SISI KANAN kosong */}
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

      {/* ===== PIN MODAL ===== */}
      <AnimatePresence>
        {showPinModal && (
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
              backgroundColor: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(8px)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              padding: "20px",
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              style={{
                maxWidth: "480px",
                width: "100%",
                backgroundColor: "#ffffff",
                borderRadius: "20px",
                padding: "40px",
                boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
                border: "1px solid #f0f0f0",
                fontFamily: FONT_FAMILY,
              }}
            >
              <h2 style={{
                fontSize: "32px",
                fontWeight: 600,
                color: "#0D3CFC",
                fontFamily: FONT_FAMILY,
                marginBottom: "8px",
                textAlign: "center",
              }}>
                Verifikasi PIN
              </h2>
              <p style={{
                fontSize: "16px",
                color: "#666",
                fontFamily: FONT_FAMILY,
                textAlign: "center",
                marginBottom: "32px",
              }}>
                Masukkan PIN 6 digit untuk keamanan
              </p>

              <div style={{
                display: "flex",
                justifyContent: "center",
                gap: "12px",
                marginBottom: "24px",
              }}>
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: "48px",
                      height: "56px",
                      borderBottom: `3px solid ${pinInput.length > i ? '#0D3CFC' : '#ddd'}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "28px",
                      fontWeight: 600,
                      color: "#0D3CFC",
                      fontFamily: FONT_FAMILY,
                    }}
                  >
                    {pinInput[i] || ''}
                  </div>
                ))}
              </div>

              {pinError && (
                <div style={{
                  color: "#ef4444",
                  fontSize: "14px",
                  textAlign: "center",
                  marginBottom: "16px",
                  fontFamily: FONT_FAMILY,
                }}>
                  {pinError}
                </div>
              )}

              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={pinInput}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= 6) setPinInput(val);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handlePinSubmit();
                }}
                autoFocus
                style={{
                  position: "absolute",
                  opacity: 0,
                  width: 0,
                  height: 0,
                  pointerEvents: "none",
                }}
              />

              <div style={{
                display: "flex",
                gap: "12px",
                justifyContent: "center",
              }}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowPinModal(false);
                    setPinInput("");
                    setPinError("");
                    handleLogout();
                  }}
                  style={{
                    padding: "10px 24px",
                    backgroundColor: "transparent",
                    color: "#666",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "16px",
                    cursor: "pointer",
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  Keluar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePinSubmit}
                  style={{
                    padding: "10px 24px",
                    backgroundColor: "#0D3CFC",
                    color: "#fff",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "16px",
                    cursor: "pointer",
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  Verifikasi
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
