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
import { 
  getFirestore, 
  doc, 
  setDoc,
  serverTimestamp 
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

// ===== NAVBAR ICONS SAMA SEPERTI HALAMAN UTAMA =====
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

// ===== SEARCH ROLLING TEXT =====
const searchRollingTexts = [
  "Tentang Note", 
  "Tentang Donasi", 
  "Tentang Blog", 
  "Tentang Shop", 
  "Tentang Pusat bantuan"
];

// ===== PRELOADER =====
const Preloader = ({ onComplete }: { onComplete: () => void }) => {
  const preloaderRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        if (preloaderRef.current) {
          gsap.to(preloaderRef.current, {
            opacity: 0,
            duration: 0.6,
            ease: "power2.inOut",
            onComplete: onComplete
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
  }, [onComplete]);

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
};

export default function SignUpPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // State untuk Persetujuan
  const [agreed, setAgreed] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);
  const agreementRef = useRef<HTMLDivElement>(null);
  
  // State untuk PIN
  const [showPinScreen, setShowPinScreen] = useState(false);
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [pinError, setPinError] = useState("");
  const [tempUser, setTempUser] = useState<any>(null);
  
  // State untuk navbar
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuOverlayRef = useRef<HTMLDivElement>(null);
  const plusIconRef = useRef<HTMLSpanElement>(null);
  
  // State untuk search
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [rollingText, setRollingText] = useState<string>(searchRollingTexts[0]);
  const rollingRef = useRef<HTMLSpanElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchExpandedRef = useRef<HTMLDivElement>(null);
  
  // State untuk preloader
  const [showMain, setShowMain] = useState(false);
  
  const router = useRouter();

  // ===== PRELOADER =====
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handlePreloaderComplete = () => {
    setShowMain(true);
  };

  // ===== MOBILE CHECK =====
  useEffect(() => {
    if (!showMain) return;
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [showMain]);

  // ===== ROLLING TEXT =====
  useEffect(() => {
    if (!showMain) return;
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
  }, [showMain]);

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

  // ===== TOGGLE AGREEMENT =====
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

  // ===== SAVE USER TO FIRESTORE =====
  const saveUserToFirestore = async (uid: string, email: string, name: string, pinValue: string) => {
    if (!db) return;
    const userRef = doc(db, "users", uid);
    await setDoc(userRef, {
      email: email,
      displayName: name,
      name: name,
      pin: pinValue,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
  };

  // ===== HANDLE SIGN UP =====
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setError("Anda harus menyetujui Pernyataan Persetujuan");
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
      
      // Simpan user sementara untuk PIN
      setTempUser(userCredential.user);
      setShowPinScreen(true);
      setIsLoading(false);
      
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

  // ===== HANDLE PIN SUBMIT =====
  const handlePinSubmit = async () => {
    if (pin.length !== 6) {
      setPinError("PIN harus 6 digit");
      return;
    }
    if (pin !== pinConfirm) {
      setPinError("PIN tidak cocok");
      return;
    }
    setPinError("");
    
    // Simpan user ke koleksi "users" dengan PIN
    await saveUserToFirestore(tempUser.uid, tempUser.email, formData.name, pin);
    
    // Redirect ke halaman utama
    router.push('/');
  };

  const resetPin = () => {
    setPin("");
    setPinConfirm("");
    setPinError("");
  };

  // ===== RENDER =====
  if (!isMounted || !showMain) {
    return <Preloader onComplete={handlePreloaderComplete} />;
  }

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
        {/* ===== HEADER / NAVBAR SAMA SEPERTI HALAMAN UTAMA ===== */}
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
          {/* KIRI: Menuru */}
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

          {/* KANAN: NAVBAR */}
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
            {/* Baris atas: Shop, About, Sign In */}
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

            {/* Baris bawah: Anti-Fraud, Anti-Bot, Get in touch, Pusat Bantuan, Menu */}
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
          position: "relative",
          zIndex: 1,
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
            {!showPinScreen ? (
              // === FORM SIGN UP ===
              <>
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
                        color: "#0D3CFC",
                        fontSize: "15px",
                        fontFamily: FONT_FAMILY,
                        marginBottom: "16px",
                        padding: "0",
                      }}
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

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
                    marginBottom: "20px",
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

                  {/* ===== CEKLIST PERNYATAAN PERSETUJUAN ===== */}
                  <div style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "12px",
                    marginBottom: "8px",
                  }}>
                    <input
                      type="checkbox"
                      id="agree"
                      checked={agreed}
                      onChange={() => setAgreed(!agreed)}
                      style={{
                        width: "20px",
                        height: "20px",
                        marginTop: "2px",
                        accentColor: "#0D3CFC",
                        cursor: "pointer",
                      }}
                    />
                    <label
                      htmlFor="agree"
                      style={{
                        fontSize: "16px",
                        color: "#0D3CFC",
                        fontFamily: FONT_FAMILY,
                        cursor: "pointer",
                        lineHeight: 1.5,
                      }}
                      onClick={toggleAgreement}
                    >
                      Saya menyetujui <strong>Pernyataan Persetujuan</strong>
                    </label>
                  </div>

                  {/* ===== ISI PERNYATAAN PERSETUJUAN ===== */}
                  <div
                    ref={agreementRef}
                    style={{
                      overflow: 'hidden',
                      height: 0,
                      opacity: 0,
                      marginBottom: '0',
                    }}
                  >
                    <div style={{
                      padding: '20px 0',
                      fontSize: '18px',
                      color: '#1a1a1a',
                      lineHeight: 1.8,
                      fontFamily: FONT_FAMILY,
                      maxHeight: '400px',
                      overflowY: 'auto',
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none',
                    }}>
                      <h3 style={{ fontSize: '24px', fontWeight: 600, color: '#0D3CFC', marginBottom: '16px' }}>
                        Pernyataan Persetujuan
                      </h3>
                      <p><strong>1. Pengumpulan Data</strong></p>
                      <p style={{ marginLeft: '20px' }}>1.1 Kami mengumpulkan data nama, email, dan informasi profil yang Anda berikan.</p>
                      <p style={{ marginLeft: '20px' }}>1.2 Data digunakan untuk mengelola akun dan memberikan layanan terbaik.</p>
                      <p style={{ marginLeft: '20px' }}>1.3 Data tidak akan dibagikan kepada pihak ketiga tanpa izin Anda.</p>
                      <br />
                      <p><strong>2. Penggunaan Layanan</strong></p>
                      <p style={{ marginLeft: '20px' }}>2.1 Anda setuju untuk menggunakan layanan sesuai dengan ketentuan yang berlaku.</p>
                      <p style={{ marginLeft: '20px' }}>2.2 Anda bertanggung jawab atas semua aktivitas yang terjadi di akun Anda.</p>
                      <p style={{ marginLeft: '20px' }}>2.3 Kami berhak menghentikan akun yang melanggar ketentuan.</p>
                      <br />
                      <p><strong>3. Keamanan</strong></p>
                      <p style={{ marginLeft: '20px' }}>3.1 Kami melindungi data Anda dengan enkripsi dan protokol keamanan.</p>
                      <p style={{ marginLeft: '20px' }}>3.2 Anda wajib menjaga kerahasiaan kata sandi dan PIN Anda.</p>
                      <p style={{ marginLeft: '20px' }}>3.3 Laporkan segera jika ada aktivitas mencurigakan.</p>
                      <br />
                      <p><strong>4. Perubahan Ketentuan</strong></p>
                      <p style={{ marginLeft: '20px' }}>4.1 Ketentuan dapat berubah sewaktu-waktu dan akan diberitahukan.</p>
                      <p style={{ marginLeft: '20px' }}>4.2 Dengan terus menggunakan layanan, Anda menyetujui perubahan tersebut.</p>
                    </div>
                  </div>

                  {/* ===== LINK KEBIJAKAN & KETENTUAN ===== */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    flexWrap: 'wrap',
                    marginBottom: '24px',
                    fontSize: '14px',
                    color: '#666',
                    fontFamily: FONT_FAMILY,
                  }}>
                    <span>Dengan mendaftar, Anda menyetujui</span>
                    <Link href="/kebijakan" style={{
                      color: '#0D3CFC',
                      textDecoration: 'underline',
                      fontWeight: 500,
                    }}>
                      Kebijakan Privasi
                    </Link>
                    <span style={{ color: '#ccc' }}>•</span>
                    <Link href="/ketentuan" style={{
                      color: '#0D3CFC',
                      textDecoration: 'underline',
                      fontWeight: 500,
                    }}>
                      Ketentuan Layanan
                    </Link>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      width: "100%",
                      padding: "16px 20px",
                      backgroundColor: isLoading ? "#ccc" : "#0D3CFC",
                      color: "#fff",
                      border: "none",
                      borderRadius: "12px",
                      fontSize: "18px",
                      fontWeight: 600,
                      fontFamily: FONT_FAMILY,
                      cursor: isLoading ? "not-allowed" : "pointer",
                      opacity: isLoading ? 0.7 : 1,
                      transition: "all 0.3s ease",
                    }}
                    whileHover={!isLoading ? { scale: 1.02, backgroundColor: "#0a2fc9" } : {}}
                    whileTap={!isLoading ? { scale: 0.98 } : {}}
                  >
                    {isLoading ? "Creating Account..." : "Get Started"}
                  </motion.button>
                </motion.form>

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
              </>
            ) : (
              // === POLA PIN 6 ANGKA ===
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <h2 style={{
                  fontSize: "36px",
                  fontWeight: 600,
                  color: "#0D3CFC",
                  fontFamily: FONT_FAMILY,
                  marginBottom: "8px",
                }}>
                  Buat PIN 6 Digit
                </h2>
                <p style={{
                  fontSize: "18px",
                  color: "#666",
                  fontFamily: FONT_FAMILY,
                  marginBottom: "32px",
                  textAlign: "center",
                }}>
                  Buat PIN 6 digit untuk keamanan tambahan
                </p>

                <div style={{
                  display: 'flex',
                  gap: '24px',
                  width: '100%',
                  maxWidth: '400px',
                  marginBottom: '16px',
                }}>
                  <div style={{ flex: 1 }}>
                    <label style={{
                      fontSize: '14px',
                      color: '#666',
                      fontFamily: FONT_FAMILY,
                      display: 'block',
                      marginBottom: '4px',
                    }}>
                      PIN
                    </label>
                    <input
                      type="password"
                      maxLength={6}
                      value={pin}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (val.length <= 6) setPin(val);
                      }}
                      style={{
                        width: '100%',
                        padding: '20px',
                        fontSize: '32px',
                        textAlign: 'center',
                        border: '2px solid #e8e8e8',
                        borderRadius: '12px',
                        fontFamily: FONT_FAMILY,
                        outline: 'none',
                        letterSpacing: '8px',
                        transition: 'border-color 0.2s ease',
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#0D3CFC'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#e8e8e8'}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{
                      fontSize: '14px',
                      color: '#666',
                      fontFamily: FONT_FAMILY,
                      display: 'block',
                      marginBottom: '4px',
                    }}>
                      Konfirmasi PIN
                    </label>
                    <input
                      type="password"
                      maxLength={6}
                      value={pinConfirm}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (val.length <= 6) setPinConfirm(val);
                      }}
                      style={{
                        width: '100%',
                        padding: '20px',
                        fontSize: '32px',
                        textAlign: 'center',
                        border: '2px solid #e8e8e8',
                        borderRadius: '12px',
                        fontFamily: FONT_FAMILY,
                        outline: 'none',
                        letterSpacing: '8px',
                        transition: 'border-color 0.2s ease',
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = '#0D3CFC'}
                      onBlur={(e) => e.currentTarget.style.borderColor = '#e8e8e8'}
                    />
                  </div>
                </div>

                {pinError && (
                  <div style={{
                    color: '#0D3CFC',
                    fontSize: '16px',
                    fontFamily: FONT_FAMILY,
                    marginBottom: '16px',
                  }}>
                    {pinError}
                  </div>
                )}

                <div style={{
                  display: 'flex',
                  gap: '16px',
                  marginTop: '8px',
                }}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetPin}
                    style={{
                      padding: '12px 28px',
                      backgroundColor: 'transparent',
                      color: '#666',
                      border: '2px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '16px',
                      cursor: 'pointer',
                      fontFamily: FONT_FAMILY,
                    }}
                  >
                    Reset
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePinSubmit}
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
                    Simpan PIN
                  </motion.button>
                </div>
              </motion.div>
            )}
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
    </>
  );
}
