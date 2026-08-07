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
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
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

const NotificationsIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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

const EditIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 20H21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16.5 3.5L20.5 7.5L7 21L3 21L3 17L16.5 3.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
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

// ===== DEFAULT TERMS CONTENT =====
const DEFAULT_TERMS = `
**Ketentuan Layanan Menuru**

1. **Penerimaan Syarat** – Dengan mengakses dan menggunakan layanan Menuru, Anda menyetujui untuk terikat dengan Ketentuan Layanan ini. Jika Anda tidak setuju, harap tidak menggunakan layanan kami.

2. **Perubahan Ketentuan** – Kami berhak untuk mengubah atau memperbarui ketentuan ini sewaktu-waktu tanpa pemberitahuan sebelumnya. Perubahan akan berlaku segera setelah dipublikasikan.

3. **Akun Pengguna** – Anda bertanggung jawab penuh atas kerahasiaan kata sandi dan semua aktivitas yang terjadi di akun Anda. Beri tahu kami segera jika ada akses tidak sah.

4. **Privasi** – Pengumpulan dan penggunaan data pribadi Anda diatur dalam Kebijakan Privasi kami.

5. **Penggunaan yang Dilarang** – Anda tidak boleh menggunakan layanan untuk tujuan ilegal, mengganggu, atau merugikan pengguna lain.

6. **Hak Kekayaan Intelektual** – Semua konten di Menuru dilindungi oleh hak cipta dan merek dagang. Dilarang menyalin, mendistribusikan, atau membuat karya turunan tanpa izin.

7. **Penghentian Layanan** – Kami berhak untuk menangguhkan atau menghentikan akun Anda jika terjadi pelanggaran ketentuan.

8. **Tautan ke Pihak Ketiga** – Layanan kami mungkin berisi tautan ke situs eksternal. Kami tidak bertanggung jawab atas konten atau kebijakan mereka.

9. **Ganti Rugi** – Anda setuju untuk mengganti rugi Menuru dari klaim atau kerugian yang timbul dari pelanggaran ketentuan ini.

10. **Hukum yang Berlaku** – Ketentuan ini diatur oleh hukum yang berlaku di Indonesia.

Dengan menggunakan Menuru, Anda menyatakan telah membaca, memahami, dan menyetujui semua ketentuan di atas.
`;

export default function SignUpPage() {
  // ===== STATE =====
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
  const [termsContent, setTermsContent] = useState(DEFAULT_TERMS);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditingTerms, setIsEditingTerms] = useState(false);
  const [editTermsContent, setEditTermsContent] = useState(DEFAULT_TERMS);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [pinError, setPinError] = useState("");
  const [pinSuccess, setPinSuccess] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [rollingIndex, setRollingIndex] = useState(0);
  const [rollingText, setRollingText] = useState(searchRollingTexts[0]);
  
  // ===== REFS =====
  const rollingRef = useRef<HTMLSpanElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchExpandedRef = useRef<HTMLDivElement>(null);
  const termsContentRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // ===== EFFECTS =====
  // 1. Mobile detection - HANYA di client
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 2. Admin check
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAdmin(user?.email === ADMIN_EMAIL);
    });
    return () => unsubscribe();
  }, []);

  // 3. Load Terms
  useEffect(() => {
    if (!db) return;
    const loadTerms = async () => {
      try {
        const docRef = doc(db, "terms", "main");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const content = docSnap.data().content || DEFAULT_TERMS;
          setTermsContent(content);
          setEditTermsContent(content);
        } else {
          await setDoc(docRef, { content: DEFAULT_TERMS });
        }
      } catch (error) {
        console.error("Error loading terms:", error);
      }
    };
    loadTerms();

    const docRef = doc(db, "terms", "main");
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const content = docSnap.data().content || DEFAULT_TERMS;
        setTermsContent(content);
        setEditTermsContent(content);
      }
    });
    return () => unsubscribe();
  }, []);

  // 4. GSAP terms animation
  useEffect(() => {
    if (isTermsOpen && termsContentRef.current) {
      gsap.fromTo(termsContentRef.current,
        { height: 0, opacity: 0 },
        { height: 'auto', opacity: 1, duration: 0.5, ease: 'power2.out' }
      );
    } else if (!isTermsOpen && termsContentRef.current) {
      gsap.to(termsContentRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.in'
      });
    }
  }, [isTermsOpen]);

  // 5. Rolling text
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

  // 6. Search expand
  useEffect(() => {
    if (isSearchOpen && searchExpandedRef.current) {
      gsap.fromTo(searchExpandedRef.current,
        { height: 0, opacity: 0, y: -10 },
        { height: "auto", opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
      );
      setTimeout(() => searchInputRef.current?.focus(), 300);
    }
  }, [isSearchOpen]);

  // 7. Click outside
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

  // 8. Reset search results
  useEffect(() => {
    setSearchResults([]);
  }, [searchQuery]);

  // ===== FUNGSI =====
  const saveTerms = async () => {
    if (!db || !isAdmin) return;
    try {
      const docRef = doc(db, "terms", "main");
      await setDoc(docRef, { content: editTermsContent });
      setTermsContent(editTermsContent);
      setIsEditingTerms(false);
    } catch (error) {
      console.error("Error saving terms:", error);
    }
  };

  const handlePinChange = (index: number, value: string) => {
    const newPin = [...pin];
    newPin[index] = value.replace(/\D/g, '').slice(0, 1);
    setPin(newPin);
    setPinError("");
    if (value && index < 5) {
      const nextInput = document.getElementById(`pin-${index+1}`);
      if (nextInput) (nextInput as HTMLInputElement).focus();
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      const prevInput = document.getElementById(`pin-${index-1}`);
      if (prevInput) (prevInput as HTMLInputElement).focus();
    }
  };

  const handlePinSubmit = async () => {
    const pinString = pin.join('');
    if (pinString.length !== 6) {
      setPinError("Harap masukkan 6 digit angka.");
      return;
    }
    if (!auth || !auth.currentUser) {
      setPinError("User tidak terautentikasi.");
      return;
    }
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, { pin: pinString });
      setPinSuccess(true);
      setShowPinModal(false);
      setTimeout(() => router.push('/'), 1500);
    } catch (error) {
      console.error("Error saving PIN:", error);
      setPinError("Gagal menyimpan PIN. Silakan coba lagi.");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      setError("Harap setujui Syarat & Ketentuan terlebih dahulu.");
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

      const userRef = doc(db, "users", userCredential.user.uid);
      await setDoc(userRef, {
        name: formData.name,
        email: formData.email,
        createdAt: new Date().toISOString(),
        pin: null,
      });

      setShowPinModal(true);
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

  // ===== RENDER =====
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
        .terms-content {
          line-height: 1.8;
          white-space: pre-wrap;
          font-size: 22px;
        }
        .terms-content strong {
          font-weight: 600;
          color: #0D3CFC;
        }
        .pin-input {
          width: 48px;
          height: 56px;
          text-align: center;
          font-size: 24px;
          font-weight: 600;
          border: 2px solid #e8e8e8;
          border-radius: 8px;
          outline: none;
          transition: all 0.2s ease;
          font-family: ${FONT_FAMILY};
          color: #0D3CFC;
        }
        .pin-input:focus {
          border-color: #0D3CFC;
          box-shadow: 0 0 0 3px rgba(13,60,252,0.1);
        }
        .pin-input-filled {
          border-color: #0D3CFC;
          background-color: rgba(13,60,252,0.04);
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
                  background: "transparent",
                  textDecoration: "none",
                  cursor: "pointer",
                }}
              >
                Menuru
              </motion.a>
            </Link>

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
                <NotificationsIcon size={24} />
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
                      minWidth: "280px",
                      backgroundColor: "#ffffff",
                      borderRadius: "12px",
                      boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
                      border: "1px solid rgba(0,0,0,0.04)",
                      zIndex: 60,
                      fontFamily: FONT_FAMILY,
                      padding: "16px",
                      textAlign: "center",
                      color: "#999",
                      fontSize: "14px",
                    }}
                  >
                    Tidak ada notifikasi
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

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

        {/* KONTEN SIGN UP */}
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
            suppressHydrationWarning
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

              <div style={{
                position: "relative",
                marginBottom: "16px",
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

              <div style={{ marginBottom: "16px" }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  flexWrap: "wrap",
                  marginBottom: "8px",
                }}>
                  <button
                    type="button"
                    onClick={() => setIsTermsOpen(!isTermsOpen)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "22px",
                      fontWeight: 500,
                      color: "#0D3CFC",
                      fontFamily: FONT_FAMILY,
                      padding: "4px 0",
                      textDecoration: "underline",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span>Ketentuan Layanan Menuru</span>
                    <span style={{
                      fontSize: "20px",
                      transform: isTermsOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.3s ease",
                      display: "inline-block",
                    }}>
                      ▼
                    </span>
                  </button>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingTerms(!isEditingTerms);
                        setEditTermsContent(termsContent);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#0D3CFC",
                        padding: "4px",
                        display: "inline-flex",
                        alignItems: "center",
                      }}
                    >
                      <EditIcon size={18} />
                    </button>
                  )}
                </div>

                <div
                  ref={termsContentRef}
                  style={{
                    height: 0,
                    overflow: 'hidden',
                    opacity: 0,
                  }}
                >
                  <div
                    className="terms-content"
                    style={{
                      padding: "8px 0 12px 0",
                      fontSize: "22px",
                      color: "#333",
                      fontFamily: FONT_FAMILY,
                      lineHeight: 1.8,
                      whiteSpace: "pre-wrap",
                    }}
                    suppressHydrationWarning
                  >
                    {isEditingTerms ? (
                      <div>
                        <textarea
                          value={editTermsContent}
                          onChange={(e) => setEditTermsContent(e.target.value)}
                          style={{
                            width: "100%",
                            minHeight: "300px",
                            padding: "12px",
                            fontSize: "18px",
                            fontFamily: FONT_FAMILY,
                            border: "2px solid #0D3CFC",
                            borderRadius: "8px",
                            outline: "none",
                            color: "#333",
                            backgroundColor: "#fafafa",
                            resize: "vertical",
                          }}
                        />
                        <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                          <button
                            onClick={saveTerms}
                            style={{
                              padding: "6px 20px",
                              backgroundColor: "#0D3CFC",
                              color: "#fff",
                              border: "none",
                              borderRadius: "6px",
                              fontSize: "14px",
                              fontFamily: FONT_FAMILY,
                              cursor: "pointer",
                              fontWeight: 500,
                            }}
                          >
                            Simpan Perubahan
                          </button>
                          <button
                            onClick={() => {
                              setIsEditingTerms(false);
                              setEditTermsContent(termsContent);
                            }}
                            style={{
                              padding: "6px 20px",
                              backgroundColor: "transparent",
                              color: "#666",
                              border: "1px solid #ccc",
                              borderRadius: "6px",
                              fontSize: "14px",
                              fontFamily: FONT_FAMILY,
                              cursor: "pointer",
                            }}
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div dangerouslySetInnerHTML={{ 
                        __html: termsContent ? termsContent.replace(/\n/g, '<br/>') : ''
                      }} />
                    )}
                  </div>
                </div>

                <label style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  fontSize: "16px",
                  color: "#333",
                  fontFamily: FONT_FAMILY,
                  cursor: "pointer",
                  padding: "4px 0",
                  marginTop: "8px",
                }}>
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    style={{
                      width: "20px",
                      height: "20px",
                      accentColor: "#0D3CFC",
                      cursor: "pointer",
                      borderRadius: "4px",
                    }}
                  />
                  <span>
                    Saya telah membaca dan menyetujui{" "}
                    <span style={{ color: "#0D3CFC", fontWeight: 500 }}>Ketentuan Layanan</span>
                  </span>
                </label>
              </div>

              <motion.button
                type="submit"
                disabled={isLoading || !acceptedTerms}
                style={{
                  width: "100%",
                  padding: "16px 20px",
                  backgroundColor: (isLoading || !acceptedTerms) ? "#ccc" : "#0D3CFC",
                  color: "#fff",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "18px",
                  fontWeight: 600,
                  fontFamily: FONT_FAMILY,
                  cursor: (isLoading || !acceptedTerms) ? "not-allowed" : "pointer",
                  opacity: (isLoading || !acceptedTerms) ? 0.7 : 1,
                  transition: "all 0.3s ease",
                }}
                whileHover={(!isLoading && acceptedTerms) ? { scale: 1.02, backgroundColor: "#0a2fc9" } : {}}
                whileTap={(!isLoading && acceptedTerms) ? { scale: 0.98 } : {}}
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

      {/* MODAL PIN */}
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
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(10px)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "20px",
                padding: "40px 32px",
                maxWidth: "480px",
                width: "100%",
                boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
                fontFamily: FONT_FAMILY,
              }}
            >
              {pinSuccess ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    textAlign: "center",
                    padding: "20px 0",
                  }}
                >
                  <div style={{
                    fontSize: "48px",
                    marginBottom: "16px",
                  }}>✅</div>
                  <h2 style={{
                    fontSize: "28px",
                    fontWeight: 600,
                    color: "#0D3CFC",
                    fontFamily: FONT_FAMILY,
                    margin: "0 0 8px 0",
                  }}>
                    PIN Berhasil Disimpan!
                  </h2>
                  <p style={{
                    fontSize: "16px",
                    color: "#666",
                    fontFamily: FONT_FAMILY,
                    margin: 0,
                  }}>
                    Mengalihkan ke halaman utama...
                  </p>
                </motion.div>
              ) : (
                <>
                  <h2 style={{
                    fontSize: "28px",
                    fontWeight: 600,
                    color: "#0D3CFC",
                    fontFamily: FONT_FAMILY,
                    margin: "0 0 8px 0",
                    textAlign: "center",
                  }}>
                    🔒 Atur PIN Keamanan
                  </h2>
                  <p style={{
                    fontSize: "16px",
                    color: "#666",
                    fontFamily: FONT_FAMILY,
                    textAlign: "center",
                    marginBottom: "24px",
                  }}>
                    Masukkan 6 digit angka untuk keamanan akun Anda
                  </p>

                  <div style={{
                    display: "flex",
                    gap: "12px",
                    justifyContent: "center",
                    marginBottom: "24px",
                  }}>
                    {pin.map((digit, index) => (
                      <input
                        key={index}
                        id={`pin-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handlePinChange(index, e.target.value)}
                        onKeyDown={(e) => handlePinKeyDown(index, e)}
                        className={`pin-input ${digit ? 'pin-input-filled' : ''}`}
                        autoFocus={index === 0}
                        style={{
                          width: "48px",
                          height: "56px",
                          textAlign: "center",
                          fontSize: "24px",
                          fontWeight: 600,
                          border: `2px solid ${digit ? '#0D3CFC' : '#e8e8e8'}`,
                          borderRadius: "8px",
                          outline: "none",
                          transition: "all 0.2s ease",
                          fontFamily: FONT_FAMILY,
                          color: "#0D3CFC",
                          backgroundColor: digit ? "rgba(13,60,252,0.04)" : "#ffffff",
                          boxShadow: digit ? "0 0 0 3px rgba(13,60,252,0.1)" : "none",
                        }}
                      />
                    ))}
                  </div>

                  {pinError && (
                    <p style={{
                      color: "#ef4444",
                      fontSize: "14px",
                      fontFamily: FONT_FAMILY,
                      textAlign: "center",
                      marginBottom: "16px",
                    }}>
                      {pinError}
                    </p>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePinSubmit}
                    disabled={pin.some(d => d === '')}
                    style={{
                      width: "100%",
                      padding: "14px",
                      backgroundColor: pin.some(d => d === '') ? "#ccc" : "#0D3CFC",
                      color: "#fff",
                      border: "none",
                      borderRadius: "12px",
                      fontSize: "18px",
                      fontWeight: 600,
                      fontFamily: FONT_FAMILY,
                      cursor: pin.some(d => d === '') ? "not-allowed" : "pointer",
                      opacity: pin.some(d => d === '') ? 0.7 : 1,
                      transition: "all 0.3s ease",
                    }}
                  >
                    Simpan PIN
                  </motion.button>

                  <button
                    onClick={() => {
                      setShowPinModal(false);
                      router.push('/');
                    }}
                    style={{
                      display: "block",
                      margin: "12px auto 0",
                      background: "none",
                      border: "none",
                      color: "#999",
                      fontSize: "14px",
                      fontFamily: FONT_FAMILY,
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                  >
                    Lewati (tidak disarankan)
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
