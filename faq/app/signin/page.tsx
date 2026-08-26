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
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  serverTimestamp,
  collection,
  addDoc,
  query,
  where,
  getDocs
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

export default function SignInPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState("");
  
  // State untuk preloader
  const [showMain, setShowMain] = useState(false);
  
  // State untuk navbar
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuOverlayRef = useRef<HTMLDivElement>(null);
  const plusIconRef = useRef<HTMLSpanElement>(null);
  
  // State untuk PIN
  const [showPinScreen, setShowPinScreen] = useState(false);
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [pinError, setPinError] = useState("");
  const [isNewPin, setIsNewPin] = useState(false);
  const [tempUser, setTempUser] = useState<any>(null);

  // State untuk search
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [rollingText, setRollingText] = useState<string>("");
  const rollingRef = useRef<HTMLSpanElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchExpandedRef = useRef<HTMLDivElement>(null);

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
    const searchRollingTexts = [
      "Tentang Note", 
      "Tentang Donasi", 
      "Tentang Blog", 
      "Tentang Shop", 
      "Tentang Pusat bantuan"
    ];
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

  // ===== SAVE LOGIN HISTORY =====
  const saveLoginHistory = async (user: any, provider: string) => {
    if (!db) return;
    try {
      // Cek apakah user sudah ada di loginHistory
      const loginHistoryRef = collection(db, "loginHistory");
      const q = query(loginHistoryRef, where("email", "==", user.email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        // Buat baru jika belum ada
        await addDoc(collection(db, "loginHistory"), {
          email: user.email,
          displayName: user.displayName || user.email?.split('@')[0] || "Pengguna",
          name: user.displayName || user.email?.split('@')[0] || "Pengguna",
          provider: provider,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          uid: user.uid,
          photoURL: user.photoURL || null,
        });
      } else {
        // Update lastLogin
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, {
          lastLogin: serverTimestamp(),
          displayName: user.displayName || user.email?.split('@')[0] || "Pengguna",
          photoURL: user.photoURL || null,
        });
      }
    } catch (error) {
      console.error("Error saving login history:", error);
    }
  };

  // ===== AUTH STATE LISTENER =====
  useEffect(() => {
    if (!showMain || !auth) return;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Simpan ke login history
        await saveLoginHistory(currentUser, "email");
        
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        const userData = userDoc.data();
        if (userData && userData.pin) {
          setTempUser(currentUser);
          setShowPinScreen(true);
          setIsNewPin(false);
          setUser(null);
        } else {
          setTempUser(currentUser);
          setShowPinScreen(true);
          setIsNewPin(true);
          setUser(null);
        }
      } else {
        setUser(null);
        setShowPinScreen(false);
        setTempUser(null);
      }
    });
    return () => unsubscribe();
  }, [showMain]);

  // ===== SAVE PIN =====
  const savePin = async (uid: string, pinValue: string) => {
    if (!db) return;
    const userRef = doc(db, "users", uid);
    await setDoc(userRef, { pin: pinValue }, { merge: true });
  };

  // ===== HANDLE PIN SUBMIT =====
  const handlePinSubmit = async () => {
    if (isNewPin) {
      if (pin.length !== 6) {
        setPinError("PIN harus 6 digit");
        return;
      }
      if (pin !== pinConfirm) {
        setPinError("PIN tidak cocok");
        return;
      }
      setPinError("");
      await savePin(tempUser.uid, pin);
      setUser(tempUser);
      setShowPinScreen(false);
      setTempUser(null);
      router.push('/');
    } else {
      if (pin.length !== 6) {
        setPinError("PIN harus 6 digit");
        return;
      }
      const userDoc = await getDoc(doc(db, "users", tempUser.uid));
      const userData = userDoc.data();
      if (userData && userData.pin === pin) {
        setUser(tempUser);
        setShowPinScreen(false);
        setTempUser(null);
        router.push('/');
      } else {
        setPinError("PIN salah");
      }
    }
  };

  const resetPin = () => {
    setPin("");
    setPinConfirm("");
    setPinError("");
  };

  // ===== LOGIN HANDLERS =====
  const handleGoogleLogin = async () => {
    if (!auth) return;
    setLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Simpan ke login history dengan provider Google
      await saveLoginHistory(user, "google");
      
      // Update displayName jika kosong
      if (!user.displayName) {
        await updateProfile(user, {
          displayName: user.email?.split('@')[0] || "Pengguna"
        });
      }
    } catch (error: any) {
      setError(error.message || "Login dengan Google gagal");
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
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Simpan ke login history dengan provider GitHub
      await saveLoginHistory(user, "github");
      
      // Update displayName jika kosong
      if (!user.displayName) {
        await updateProfile(user, {
          displayName: user.email?.split('@')[0] || "Pengguna"
        });
      }
    } catch (error: any) {
      setError(error.message || "Login dengan GitHub gagal");
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
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;
      
      // Simpan ke login history dengan provider email
      await saveLoginHistory(user, "email");
    } catch (error: any) {
      switch (error.code) {
        case 'auth/invalid-email':
          setError("Email tidak valid");
          break;
        case 'auth/user-not-found':
          setError("Akun tidak ditemukan");
          break;
        case 'auth/wrong-password':
          setError("Password salah");
          break;
        default:
          setError("Login gagal. Periksa email dan password Anda");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = () => {
    router.push('/signup');
  };

  const handleForgotPassword = () => {
    router.push('/forgot-password');
  };

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      setUser(null);
      setShowPinScreen(false);
      setTempUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // ===== RENDER =====
  if (!isMounted || !showMain) {
    return <Preloader onComplete={handlePreloaderComplete} />;
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
            {/* Baris atas: Shop, About, Sign Up */}
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
              <Link href="/signup">
                <div style={{ display: "inline-flex", alignItems: "center", cursor: "pointer" }}>
                  <span style={{ fontSize: "16px", fontWeight: 500, color: "#0D3CFC", fontFamily: FONT_FAMILY }}>Sign Up</span>
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
            {!showPinScreen && !user ? (
              // === FORM SIGN IN ===
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
                  Sign In
                </h1>

                <p style={{
                  fontSize: "18px",
                  color: "#666666",
                  fontFamily: FONT_FAMILY,
                  marginBottom: "32px",
                  textAlign: "left",
                }}>
                  Welcome back! Sign in to your account
                </p>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
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

                {/* SOCIAL LOGIN */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                  <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px 20px',
                      border: '2px solid #e8e8e8',
                      borderRadius: '12px',
                      background: '#ffffff',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      width: '100%',
                      fontFamily: FONT_FAMILY,
                      fontSize: '16px',
                      color: '#333',
                    }}
                    onMouseEnter={(e) => !loading && (e.currentTarget.style.borderColor = '#0D3CFC')}
                    onMouseLeave={(e) => !loading && (e.currentTarget.style.borderColor = '#e8e8e8')}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  <button
                    onClick={handleGitHubLogin}
                    disabled={loading}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px 20px',
                      border: '2px solid #e8e8e8',
                      borderRadius: '12px',
                      background: '#ffffff',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      width: '100%',
                      fontFamily: FONT_FAMILY,
                      fontSize: '16px',
                      color: '#333',
                    }}
                    onMouseEnter={(e) => !loading && (e.currentTarget.style.borderColor = '#0D3CFC')}
                    onMouseLeave={(e) => !loading && (e.currentTarget.style.borderColor = '#e8e8e8')}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24">
                      <path fill="#333" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                    </svg>
                    <span>Continue with GitHub</span>
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                  <div style={{ flex: 1, height: '1px', backgroundColor: '#e8e8e8' }} />
                  <span style={{ color: '#999', fontSize: '14px', fontFamily: FONT_FAMILY }}>or</span>
                  <div style={{ flex: 1, height: '1px', backgroundColor: '#e8e8e8' }} />
                </div>

                {/* EMAIL/PASSWORD FORM */}
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

                  <div style={{ position: "relative", marginBottom: "24px" }}>
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
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
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

                {/* Forgot Password & Sign Up */}
                <div style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  justifyContent: 'space-between',
                  alignItems: isMobile ? 'flex-start' : 'center',
                  marginTop: '20px',
                  gap: '12px',
                }}>
                  <button
                    onClick={handleForgotPassword}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#0D3CFC',
                      fontSize: '15px',
                      cursor: 'pointer',
                      fontFamily: FONT_FAMILY,
                      textDecoration: 'underline',
                    }}
                  >
                    Forgot password?
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#666', fontSize: '15px', fontFamily: FONT_FAMILY }}>Don't have an account?</span>
                    <button
                      onClick={handleSignUp}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#0D3CFC',
                        fontSize: '15px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        fontFamily: FONT_FAMILY,
                        textDecoration: 'underline',
                      }}
                    >
                      Sign up
                    </button>
                  </div>
                </div>

                {/* Pusat Bantuan link */}
                <div style={{
                  textAlign: "center",
                  marginTop: "30px",
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

                {/* Kebijakan Privasi & Ketentuan Kami */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '24px',
                  marginTop: '16px',
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
                </div>
              </>
            ) : (
              // === PIN SCREEN ===
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
                  {isNewPin ? "Buat PIN 6 Digit" : "Masukkan PIN"}
                </h2>
                <p style={{
                  fontSize: "18px",
                  color: "#666",
                  fontFamily: FONT_FAMILY,
                  marginBottom: "32px",
                  textAlign: "center",
                }}>
                  {isNewPin ? "Buat PIN 6 digit untuk keamanan tambahan" : "Masukkan PIN 6 digit Anda"}
                </p>

                {isNewPin ? (
                  <div style={{ display: 'flex', gap: '24px', width: '100%', maxWidth: '400px', marginBottom: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '14px', color: '#666', fontFamily: FONT_FAMILY, display: 'block', marginBottom: '4px' }}>
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
                      <label style={{ fontSize: '14px', color: '#666', fontFamily: FONT_FAMILY, display: 'block', marginBottom: '4px' }}>
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
                ) : (
                  <div style={{ width: '100%', maxWidth: '200px', marginBottom: '16px' }}>
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
                )}

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

                <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
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
                    {isNewPin ? "Simpan PIN" : "Verifikasi"}
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
