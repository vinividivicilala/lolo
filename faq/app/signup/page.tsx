'use client';

import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { initializeApp, getApps } from "firebase/app";
import { 
  getAuth, 
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
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
const HelpDeskIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M5 15C5 13.8954 5.89543 13 7 13H8C9.10457 13 10 13.8954 10 15V17C10 18.1046 9.10457 19 8 19H7C5.89543 19 5 18.1046 5 17V15Z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M19 15C19 13.8954 18.1046 13 17 13H16C14.8954 13 14 13.8954 14 15V17C14 18.1046 14.8954 19 16 19H17C18.1046 19 19 18.1046 19 17V15Z" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M8 13V11C8 8.79086 9.79086 7 12 7C14.2091 7 16 8.79086 16 11V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
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

const CheckCircleIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="#0D3CFC" strokeWidth="2"/>
    <path d="M9 12L11 14L15 10" stroke="#0D3CFC" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function ForgotPasswordPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [liveChatMessage, setLiveChatMessage] = useState("");
  const [liveChatMessages, setLiveChatMessages] = useState<{type: 'agent' | 'user', text: string}[]>([]);
  
  // State untuk navbar
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuOverlayRef = useRef<HTMLDivElement>(null);
  const plusIconRef = useRef<HTMLSpanElement>(null);
  
  // State untuk preloader
  const [showMain, setShowMain] = useState(false);
  const preloaderRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    setTimeout(() => startPreloaderAnimation(), 500);
  }, []);

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

  useEffect(() => {
    if (!isMounted) return;
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [isMounted]);

  // Toggle Menu
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

  // Cek apakah email terdaftar di Firestore
  const checkEmailExists = async (email: string): Promise<boolean> => {
    if (!db) return false;
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error("Error checking email:", error);
      return false;
    }
  };

  // Handle Forgot Password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setShowLiveChat(false);
    
    if (!email) {
      setError("Masukkan alamat email Anda");
      return;
    }

    setIsLoading(true);

    try {
      // Cek apakah email terdaftar di Firebase Auth
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      
      if (signInMethods.length === 0) {
        // Email tidak terdaftar di Auth
        setError("Email tidak terdaftar. Silakan hubungi live chat agent untuk bantuan.");
        setShowLiveChat(true);
        setIsLoading(false);
        return;
      }

      // Cek apakah email terdaftar di Firestore
      const emailExistsInFirestore = await checkEmailExists(email);
      
      if (!emailExistsInFirestore) {
        // Email tidak terdaftar di Firestore
        setError("Email tidak terdaftar. Silakan hubungi live chat agent untuk bantuan.");
        setShowLiveChat(true);
        setIsLoading(false);
        return;
      }

      // Email terdaftar di Auth dan Firestore - TAPI KITA TIDAK KIRIM EMAIL RESET
      // Kita hanya tampilkan pesan sukses dan arahkan ke live chat
      setSuccess(true);
      setShowLiveChat(true);
      
      // Tambahkan pesan agent
      setLiveChatMessages([
        { type: 'agent', text: 'Halo! Saya agen bantuan Menuru. Saya melihat Anda memerlukan bantuan untuk mereset password.' },
        { type: 'agent', text: 'Silakan kirimkan konfirmasi bahwa Anda adalah pemilik akun ini, dan saya akan membantu mereset password Anda secara manual.' }
      ]);
      
      setIsLoading(false);
      
    } catch (error: any) {
      console.error("Forgot password error:", error);
      setError("Terjadi kesalahan. Silakan coba lagi.");
      setShowLiveChat(true);
      setIsLoading(false);
    }
  };

  // Handle Live Chat send
  const handleSendLiveChat = () => {
    if (!liveChatMessage.trim()) return;
    
    setLiveChatMessages(prev => [...prev, { type: 'user', text: liveChatMessage }]);
    
    // Auto reply dari agent
    setTimeout(() => {
      setLiveChatMessages(prev => [...prev, { 
        type: 'agent', 
        text: 'Terima kasih atas konfirmasinya. Saya akan memproses reset password Anda. Mohon tunggu sebentar...' 
      }]);
    }, 1000);
    
    setLiveChatMessage("");
  };

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
        <title>Lupa Password | Menuru</title>
        <meta name="description" content="Reset password akun Menuru" />
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
          {/* KIRI: Menuru - Sembunyikan saat menu terbuka */}
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

        {/* Menu Overlay - z-index: 100 (di bawah navbar) */}
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
          
          <div style={{
            marginTop: "120px",
            color: "#ffffff",
            fontSize: "24px",
            fontFamily: FONT_FAMILY,
          }}>
            {/* Menu items akan ditambahkan di sini */}
          </div>
        </div>

        {/* ===== KONTEN FORGOT PASSWORD ===== */}
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
            <h1 style={{
              fontSize: isMobile ? "80px" : "180px",
              fontWeight: 700,
              color: "#0D3CFC",
              fontFamily: FONT_FAMILY,
              letterSpacing: "-0.05em",
              lineHeight: 1,
              margin: "0 0 10px 0",
              textAlign: "left",
              wordBreak: "break-word",
            }}>
              Forgot Password
            </h1>

            <p style={{
              fontSize: "18px",
              color: "#666666",
              fontFamily: FONT_FAMILY,
              marginBottom: "32px",
              textAlign: "left",
            }}>
              Masukkan email Anda untuk verifikasi. Jika email terdaftar, agen kami akan membantu Anda mereset password.
            </p>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{
                    color: "#EB2227",
                    fontSize: "15px",
                    fontFamily: FONT_FAMILY,
                    marginBottom: "16px",
                    padding: "12px 16px",
                    backgroundColor: "#FEE2E2",
                    borderRadius: "8px",
                  }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Message */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{
                    color: "#0D3CFC",
                    fontSize: "15px",
                    fontFamily: FONT_FAMILY,
                    marginBottom: "16px",
                    padding: "12px 16px",
                    backgroundColor: "#E0E7FF",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <CheckCircleIcon size={20} />
                  <span>Email terverifikasi! Agen kami akan membantu Anda.</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.form
              onSubmit={handleForgotPassword}
              style={{ width: "100%" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
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
                {isLoading ? "Memverifikasi..." : "Verifikasi Email"}
              </motion.button>
            </motion.form>

            <div style={{
              textAlign: "center",
              fontSize: "16px",
              color: "#666666",
              fontFamily: FONT_FAMILY,
              marginTop: "16px",
            }}>
              Ingat password?{" "}
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

            {/* ===== LIVE CHAT ===== */}
            {showLiveChat && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                  marginTop: "24px",
                  border: "2px solid #0D3CFC",
                  borderRadius: "16px",
                  padding: "20px",
                  backgroundColor: "#F8FAFF",
                }}
              >
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "16px",
                }}>
                  <div style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor: "#22C55E",
                    display: "inline-block",
                    animation: "pulse 1.5s infinite",
                  }} />
                  <span style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#0D3CFC",
                    fontFamily: FONT_FAMILY,
                  }}>
                    Live Chat Agent
                  </span>
                  <span style={{
                    fontSize: "12px",
                    color: "#666",
                    fontFamily: FONT_FAMILY,
                  }}>
                    • Online
                  </span>
                </div>

                <div style={{
                  maxHeight: "200px",
                  overflowY: "auto",
                  marginBottom: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  scrollbarWidth: "none",
                }}>
                  {liveChatMessages.map((msg, index) => (
                    <div
                      key={index}
                      style={{
                        alignSelf: msg.type === 'agent' ? 'flex-start' : 'flex-end',
                        backgroundColor: msg.type === 'agent' ? '#E0E7FF' : '#0D3CFC',
                        color: msg.type === 'agent' ? '#000' : '#fff',
                        padding: "10px 14px",
                        borderRadius: msg.type === 'agent' ? '12px 12px 12px 4px' : '12px 12px 4px 12px',
                        maxWidth: "80%",
                        fontSize: "14px",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      {msg.text}
                    </div>
                  ))}
                </div>

                <div style={{
                  display: "flex",
                  gap: "8px",
                }}>
                  <input
                    type="text"
                    placeholder="Ketik pesan..."
                    value={liveChatMessage}
                    onChange={(e) => setLiveChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendLiveChat()}
                    style={{
                      flex: 1,
                      padding: "10px 14px",
                      border: "2px solid #e8e8e8",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontFamily: FONT_FAMILY,
                      outline: "none",
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = "#0D3CFC"}
                    onBlur={(e) => e.currentTarget.style.borderColor = "#e8e8e8"}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSendLiveChat}
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "#0D3CFC",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: 600,
                      fontFamily: FONT_FAMILY,
                      cursor: "pointer",
                    }}
                  >
                    Kirim
                  </motion.button>
                </div>
              </motion.div>
            )}

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

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </>
  );
}
