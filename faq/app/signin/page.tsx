'use client';

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
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
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  orderBy,
  limit,
  Timestamp,
  deleteDoc 
} from "firebase/firestore";
import Link from "next/link";

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

// Data media sosial untuk komponen Connection
const socialConnections = [
  { id: 1, name: "GitHub" },
  { id: 2, name: "Instagram" },
  { id: 3, name: "Twitter" },
  { id: 4, name: "Quora" },
  { id: 5, name: "YouTube" }
];

interface LoginHistory {
  id: string;
  email: string;
  displayName: string;
  photoURL: string;
  provider: string;
  lastLogin: any;
  uid: string;
}

export default function SignInPage() {
  const router = useRouter();
  
  // --- STATE UNTUK HYDRATION FIX ---
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // --- STATE UNTUK FORM LOGIN ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);
  
  // --- STATE UNTUK FIREBASE (HANYA CLIENT) ---
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);
  const [firebaseAuth, setFirebaseAuth] = useState<any>(null);
  const [firebaseDb, setFirebaseDb] = useState<any>(null);
  
  // --- REFS UNTUK ANIMASI GSAP ---
  const marqueeLeftRef = useRef<HTMLDivElement>(null);
  const marqueeRightRef = useRef<HTMLDivElement>(null);
  const marqueeLeftAnimation = useRef<gsap.core.Tween | null>(null);
  const marqueeRightAnimation = useRef<gsap.core.Tween | null>(null);
  
  // --- REFS UNTUK KONEKSI ---
  const [connectionsOpen, setConnectionsOpen] = useState(false);
  const socialItemsRef = useRef<(HTMLDivElement | null)[]>([]);

  // ============================================
  // 1. FIX HYDRATION: TANDAI KOMPONEN SUDAH DI-MOUNT
  // ============================================
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ============================================
  // 2. CEK UKURAN LAYAR - HANYA DI CLIENT
  // ============================================
  useEffect(() => {
    if (!isMounted) return;
    
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [isMounted]);

  // ============================================
  // 3. INISIALISASI FIREBASE - HANYA DI CLIENT
  // ============================================
  useEffect(() => {
    if (!isMounted || firebaseInitialized) return;
    
    try {
      const app = getApps().length === 0
        ? initializeApp(firebaseConfig)
        : getApps()[0];
      
      const auth = getAuth(app);
      const db = getFirestore(app);
      
      setFirebaseAuth(auth);
      setFirebaseDb(db);
      setFirebaseInitialized(true);
      
      console.log("Firebase initialized successfully");
    } catch (error) {
      console.error("Firebase initialization error:", error);
    }
  }, [isMounted, firebaseInitialized]);

  // ============================================
  // 4. FUNGSI ANIMASI GSAP YANG DIPERBAIKI
  // ============================================
  const startMarqueeLeft = () => {
    if (!marqueeLeftRef.current) return;
    
    try {
      if (marqueeLeftAnimation.current) {
        marqueeLeftAnimation.current.kill();
      }
      
      gsap.set(marqueeLeftRef.current, { x: '-50%' });
      
      marqueeLeftAnimation.current = gsap.to(marqueeLeftRef.current, {
        x: '0%',
        duration: 80,
        repeat: -1,
        ease: 'none',
        modifiers: {
          x: (x) => {
            const value = parseFloat(x);
            if (value >= 0) {
              gsap.set(marqueeLeftRef.current, { x: '-50%' });
              return '-50%';
            }
            return x;
          }
        }
      });
    } catch (error) {
      console.error("GSAP Left Animation Error:", error);
    }
  };

  const startMarqueeRight = () => {
    if (!marqueeRightRef.current) return;
    
    try {
      if (marqueeRightAnimation.current) {
        marqueeRightAnimation.current.kill();
      }
      
      gsap.set(marqueeRightRef.current, { x: '0%' });
      
      marqueeRightAnimation.current = gsap.to(marqueeRightRef.current, {
        x: '-50%',
        duration: 100,
        repeat: -1,
        ease: 'none',
        modifiers: {
          x: (x) => {
            const value = parseFloat(x);
            if (value <= -50) {
              gsap.set(marqueeRightRef.current, { x: '0%' });
              return '0%';
            }
            return x;
          }
        }
      });
    } catch (error) {
      console.error("GSAP Right Animation Error:", error);
    }
  };

  // ============================================
  // 5. MULAI ANIMASI GSAP - SETELAH DOM SIAP
  // ============================================
  useEffect(() => {
    if (!isMounted) return;
    
    const timer = setTimeout(() => {
      startMarqueeLeft();
      startMarqueeRight();
    }, 300);
    
    return () => {
      clearTimeout(timer);
      if (marqueeLeftAnimation.current) {
        marqueeLeftAnimation.current.kill();
      }
      if (marqueeRightAnimation.current) {
        marqueeRightAnimation.current.kill();
      }
    };
  }, [isMounted]);

  // ============================================
  // 6. ANIMASI GSAP UNTUK CONNECTION
  // ============================================
  useEffect(() => {
    if (!isMounted) return;
    
    if (connectionsOpen) {
      const validRefs = socialItemsRef.current.filter(Boolean);
      if (validRefs.length > 0) {
        gsap.set(validRefs, { y: 30, opacity: 0 });
        gsap.to(validRefs, {
          y: 0,
          opacity: 1,
          duration: 0.4,
          stagger: 0.1,
          ease: "power2.out"
        });
      }
    } else {
      const validRefs = socialItemsRef.current.filter(Boolean);
      if (validRefs.length > 0) {
        gsap.to(validRefs, {
          y: 30,
          opacity: 0,
          duration: 0.3,
          stagger: 0.05,
          ease: "power2.in"
        });
      }
    }
  }, [connectionsOpen, isMounted]);

  // ============================================
  // 7. FUNGSI FIRESTORE - TANPA SIMPAN PASSWORD
  // ============================================
  const saveLoginHistory = async (userData: any, provider: string) => {
    if (!firebaseDb || !firebaseAuth) return;
    
    try {
      const historyRef = doc(firebaseDb, "loginHistory", userData.uid);
      const historyData = {
        id: userData.uid,
        email: userData.email,
        displayName: userData.displayName || userData.email?.split('@')[0],
        photoURL: userData.photoURL || `https://ui-avatars.com/api/?name=${userData.email}&background=random`,
        provider: provider,
        lastLogin: Timestamp.now(),
        uid: userData.uid
      };
      
      await setDoc(historyRef, historyData, { merge: true });
      console.log("Login history saved for:", userData.email);
    } catch (error) {
      console.error("Error saving login history:", error);
    }
  };

  // ============================================
  // 8. AUTH STATE CHANGED LISTENER - TANPA REDIRECT OTOMATIS
  // ============================================
  useEffect(() => {
    if (!isMounted || !firebaseAuth || !firebaseInitialized) return;
    
    const unsubscribe = onAuthStateChanged(firebaseAuth, (currentUser: any) => {
      setUser(currentUser);
      if (currentUser) {
        console.log("User logged in:", currentUser.email);
        setEmail("");
        setPassword("");
        setLoginSuccess(true);
        // HAPUS redirect otomatis ke /notes
        // router.push('/notes');  // COMMENTED OUT - TIDAK LANGSUNG REDIRECT
      }
    });

    return () => unsubscribe();
  }, [router, isMounted, firebaseAuth, firebaseInitialized]);

  // ============================================
  // 9. LOGIN HANDLERS - DENGAN SUCCESS STATE
  // ============================================
  const handleGoogleLogin = async () => {
    if (!firebaseAuth) return;
    
    setLoading(true);
    setError("");
    setLoginSuccess(false);
    
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      
      const result = await signInWithPopup(firebaseAuth, provider);
      const user = result.user;
      console.log("Google login successful:", user);
      await saveLoginHistory(user, 'google');
    } catch (error: any) {
      console.error("Google login error:", error);
      setError(error.message || "Login dengan Google gagal");
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    if (!firebaseAuth) return;
    
    setLoading(true);
    setError("");
    setLoginSuccess(false);
    
    try {
      const provider = new GithubAuthProvider();
      provider.addScope('repo');
      provider.addScope('user');
      
      const result = await signInWithPopup(firebaseAuth, provider);
      const user = result.user;
      console.log("GitHub login successful:", user);
      await saveLoginHistory(user, 'github');
    } catch (error: any) {
      console.error("GitHub login error:", error);
      setError(error.message || "Login dengan GitHub gagal");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!firebaseAuth) return;
    
    setLoading(true);
    setError("");
    setLoginSuccess(false);
    
    try {
      const result = await signInWithEmailAndPassword(firebaseAuth, email, password);
      const user = result.user;
      console.log("Email login successful");
      await saveLoginHistory(user, 'email');
    } catch (error: any) {
      console.error("Email login error:", error);
      
      switch (error.code) {
        case 'auth/invalid-email':
          setError("Email tidak valid");
          break;
        case 'auth/user-disabled':
          setError("Akun dinonaktifkan");
          break;
        case 'auth/user-not-found':
          setError("Akun tidak ditemukan");
          break;
        case 'auth/wrong-password':
          setError("Password salah");
          break;
        case 'auth/too-many-requests':
          setError("Terlalu banyak percobaan gagal. Coba lagi nanti");
          break;
        default:
          setError("Login gagal. Periksa email dan password Anda");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!firebaseAuth) return;
    
    try {
      await signOut(firebaseAuth);
      console.log("User logged out");
      setEmail("");
      setPassword("");
      setUser(null);
      setLoginSuccess(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleSignUp = () => {
    router.push('/signup');
  };

  const handleForgotPassword = () => {
    router.push('/forgot-password');
  };

  const handleGoToNotes = () => {
    router.push('/notes');
  };

  // ============================================
  // 10. FIX HYDRATION: JIKA BELUM MOUNT, TAMPILKAN LOADING
  // ============================================
  if (!isMounted) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'Helvetica, Arial, sans-serif',
      }}>
        <div style={{
          color: 'white',
          fontSize: '1.5rem',
        }}>
          Loading...
        </div>
      </div>
    );
  }

  // ============================================
  // 11. KOMPONEN CONNECTION
  // ============================================
  const ConnectionComponent = () => (
    <div style={{ position: 'relative', width: isMobile ? '100%' : 'auto', zIndex: 10 }}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{ cursor: 'pointer', userSelect: 'none', marginBottom: connectionsOpen ? '15px' : '0' }}
        onClick={() => setConnectionsOpen(!connectionsOpen)}
      >
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h4 style={{
            color: 'white',
            fontSize: isMobile ? '1.8rem' : '4rem',
            fontWeight: '600',
            margin: '0',
            fontFamily: 'Helvetica, Arial, sans-serif',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          }}>
            CONNECT
          </h4>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              bottom: isMobile ? '-5px' : '-10px',
              right: isMobile ? '-20px' : '-40px',
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: isMobile ? '0.7rem' : '1rem',
              fontWeight: 'normal',
              fontFamily: 'Helvetica, Arial, sans-serif',
            }}
          >
            ({socialConnections.length.toString().padStart(2, '0')})
          </motion.div>
        </div>
      </motion.div>

      <AnimatePresence>
        {connectionsOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: isMobile ? '8px' : '12px',
              paddingTop: '10px',
            }}>
              {socialConnections.map((social, index) => (
                <motion.div
                  key={social.id}
                  ref={el => { socialItemsRef.current[index] = el; }}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 20, opacity: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.08 }}
                  whileHover={{ x: 5 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'default' }}
                >
                  <div style={{
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: isMobile ? '1rem' : '1.5rem',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    width: isMobile ? '30px' : '50px',
                    textAlign: 'right',
                  }}>
                    ({index.toString().padStart(2, '0')})
                  </div>
                  <p style={{
                    color: 'white',
                    fontSize: isMobile ? '1.2rem' : '1.8rem',
                    fontWeight: '600',
                    margin: '0',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                    letterSpacing: '0.5px',
                  }}>
                    {social.name}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // ============================================
  // 12. KOMPONEN MARQUEE DENGAN SVG MINIMALIST
  // ============================================
  const MarqueeLeftText = () => (
    <div style={{
      width: '100%',
      overflow: 'hidden',
      position: 'relative',
      marginTop: isMobile ? '80px' : '120px',
      marginBottom: isMobile ? '40px' : '60px',
      padding: '0',
      backgroundColor: 'transparent',
      border: 'none',
      pointerEvents: 'none',
    }}>
      <div
        ref={marqueeLeftRef}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? '80px' : '150px',
          whiteSpace: 'nowrap',
          width: 'fit-content',
          willChange: 'transform',
          position: 'relative',
          left: '0',
        }}
      >
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? '40px' : '80px',
          }}>
            <span style={{
              color: 'white',
              fontSize: isMobile ? '5rem' : '8rem',
              fontFamily: 'Helvetica, Arial, sans-serif',
              fontWeight: '400',
              letterSpacing: '8px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            }}>
              CREATE FREE ACCESS ACCOUNT
            </span>
            <svg 
              width={isMobile ? '80' : '120'} 
              height={isMobile ? '80' : '120'} 
              viewBox="0 0 24 24" 
              fill="none"
              stroke="white"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ opacity: 0.9 }}
            >
              <path d="M7 7L17 7" stroke="white" strokeWidth="1"/>
              <path d="M7 7L7 17" stroke="white" strokeWidth="1"/>
              <path d="M7 7L21 21" stroke="white" strokeWidth="1"/>
            </svg>
          </div>
        ))}
      </div>
    </div>
  );

  const MarqueeRightText = () => (
    <div style={{
      width: '100%',
      overflow: 'hidden',
      position: 'relative',
      marginTop: isMobile ? '40px' : '60px',
      marginBottom: isMobile ? '20px' : '30px',
      padding: '0',
      backgroundColor: 'transparent',
      border: 'none',
      pointerEvents: 'none',
    }}>
      <div
        ref={marqueeRightRef}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? '80px' : '150px',
          whiteSpace: 'nowrap',
          width: 'fit-content',
          willChange: 'transform',
          position: 'relative',
          left: '0',
        }}
      >
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? '40px' : '80px',
          }}>
            <span style={{
              color: 'white',
              fontSize: isMobile ? '6rem' : '10rem',
              fontFamily: 'Helvetica, Arial, sans-serif',
              fontWeight: '400',
              letterSpacing: '10px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            }}>
              SIGN IN
            </span>
            <svg 
              width={isMobile ? '100' : '160'} 
              height={isMobile ? '100' : '160'} 
              viewBox="0 0 24 24" 
              fill="none"
              stroke="white"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ opacity: 0.9 }}
            >
              <path d="M7 7L17 7" stroke="white" strokeWidth="1"/>
              <path d="M7 7L7 17" stroke="white" strokeWidth="1"/>
              <path d="M7 7L21 21" stroke="white" strokeWidth="1"/>
            </svg>
          </div>
        ))}
      </div>
    </div>
  );

  // ============================================
  // 13. RENDER UTAMA - TANPA REDIRECT OTOMATIS
  // ============================================
  return (
    <>
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: isMobile ? 'flex-start' : 'center',
          alignItems: isMobile ? 'center' : 'flex-start',
          padding: isMobile ? '20px 25px' : '60px 80px',
          fontFamily: 'Helvetica, Arial, sans-serif',
          position: 'relative',
        }}
      >
        {/* HALAMAN UTAMA - SISI KANAN ATAS DENGAN SVG BESAR */}
        <div style={{
          position: 'absolute',
          top: isMobile ? '30px' : '50px',
          right: isMobile ? '20px' : '50px',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          zIndex: 50,
        }}>
          <Link href="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            textDecoration: 'none',
            color: 'white',
          }}>
            <span style={{
              fontSize: isMobile ? '2.2rem' : '3rem',
              fontFamily: 'Helvetica, Arial, sans-serif',
              fontWeight: '400',
              letterSpacing: '2px',
              textDecoration: 'none',
            }}>
              HALAMAN UTAMA
            </span>
            <svg 
              width={isMobile ? '50' : '80'} 
              height={isMobile ? '50' : '80'} 
              viewBox="0 0 24 24" 
              fill="none"
              stroke="white"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ 
                transition: 'transform 0.2s ease',
                opacity: 0.9
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translate(3px, -3px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translate(0, 0)'; }}
            >
              <path d="M7 7L17 7" stroke="white" strokeWidth="1"/>
              <path d="M7 7L7 17" stroke="white" strokeWidth="1"/>
              <path d="M7 7L21 21" stroke="white" strokeWidth="1"/>
            </svg>
          </Link>
        </div>

        {/* TEKS BERJALAN 1 - KIRI KE KANAN */}
        <MarqueeLeftText />

        {/* MAIN SIGN IN CONTAINER - FULL LEFT, NO LINES, BIG TEXT */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            width: '100%',
            maxWidth: isMobile ? '100%' : '800px',
            marginLeft: '0',
            paddingLeft: '0',
          }}
        >
          {/* WELCOME TEXT - EXTRA LARGE, NO LINES, NO BOXES */}
          <div style={{ 
            marginBottom: isMobile ? '50px' : '80px',
            width: '100%'
          }}>
            <h1 style={{ 
              fontFamily: 'Helvetica, Arial, sans-serif', 
              fontSize: isMobile ? '4rem' : '6rem', 
              fontWeight: '400', 
              color: '#ffffff', 
              marginBottom: '20px', 
              marginTop: '0',
              lineHeight: '1',
              letterSpacing: '-1px'
            }}>
              {user ? `Welcome, ${user.displayName || user.email}` : 'Welcome back'}
            </h1>
            <p style={{ 
              fontFamily: 'Helvetica, Arial, sans-serif', 
              fontSize: isMobile ? '1.8rem' : '2.4rem', 
              color: '#ffffff', 
              opacity: '0.8',
              marginBottom: '30px',
              fontWeight: '300',
              letterSpacing: '1px'
            }}>
              {user ? 'You are signed in' : 'Sign in to your account to continue'}
            </p>
            
            {/* LOGIN SUCCESS MESSAGE - TAMBAHAN */}
            {loginSuccess && user && (
              <div style={{ 
                marginTop: '30px',
                marginBottom: '20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '20px'
              }}>
                <p style={{ 
                  color: '#ffffff', 
                  fontSize: isMobile ? '1.8rem' : '2.2rem', 
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  fontWeight: '300',
                  opacity: 0.9,
                  margin: 0
                }}>
                  ✓ Login successful!
                </p>
                <button 
                  onClick={handleGoToNotes} 
                  style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    padding: '0', 
                    border: 'none', 
                    backgroundColor: 'transparent', 
                    color: '#ffffff', 
                    fontFamily: 'Helvetica, Arial, sans-serif', 
                    fontSize: isMobile ? '1.8rem' : '2.2rem', 
                    fontWeight: '300',
                    cursor: 'pointer', 
                    transition: 'opacity 0.2s ease', 
                    letterSpacing: '2px',
                    opacity: 0.8
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
                >
                  GO TO NOTES
                  <svg 
                    width={isMobile ? '40' : '60'} 
                    height={isMobile ? '40' : '60'} 
                    viewBox="0 0 24 24" 
                    fill="none"
                    stroke="white"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7 7L17 7" stroke="white"/>
                    <path d="M7 7L7 17" stroke="white"/>
                    <path d="M7 7L21 21" stroke="white"/>
                  </svg>
                </button>
              </div>
            )}
            
            {/* ERROR MESSAGE - MINIMAL */}
            {error && (
              <div style={{ 
                color: '#ff8a8a', 
                fontSize: isMobile ? '1.2rem' : '1.4rem', 
                marginTop: '20px', 
                marginBottom: '20px',
                fontFamily: 'Helvetica, Arial, sans-serif',
                fontWeight: '300'
              }}>
                {error}
              </div>
            )}
            
            {/* LOGOUT BUTTON - NO LINE, BIG TEXT */}
            {user && !loginSuccess && (
              <button 
                onClick={handleLogout} 
                style={{ 
                  marginTop: '30px', 
                  padding: '0', 
                  background: 'none', 
                  border: 'none', 
                  color: 'white', 
                  cursor: 'pointer', 
                  transition: 'opacity 0.2s ease', 
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  fontSize: isMobile ? '1.6rem' : '2rem',
                  fontWeight: '300',
                  letterSpacing: '4px',
                  opacity: 0.8
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
              >
                SIGN OUT
              </button>
            )}
          </div>

          {/* FORM LOGIN - HANYA TAMPIL JIKA BELUM LOGIN */}
          {!user && (
            <>
              {/* SOCIAL LOGIN BUTTONS - NO LINES, BIG TEXT, BIG ARROWS */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '30px', 
                marginBottom: '60px',
                width: '100%',
                maxWidth: '600px'
              }}>
                {/* Google Login */}
                <div 
                  onClick={handleGoogleLogin} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '20px',
                    padding: '0', 
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer', 
                    transition: 'opacity 0.2s ease', 
                    opacity: loading ? 0.5 : 0.8,
                    width: '100%'
                  }}
                  onMouseEnter={(e) => !loading && (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={(e) => !loading && (e.currentTarget.style.opacity = '0.8')}
                >
                  <svg width={isMobile ? '32' : '40'} height={isMobile ? '32' : '40'} viewBox="0 0 24 24" style={{ marginRight: '5px' }}>
                    <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#ffffff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#ffffff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#ffffff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span style={{ 
                    fontFamily: 'Helvetica, Arial, sans-serif', 
                    fontSize: isMobile ? '1.8rem' : '2.4rem', 
                    color: '#ffffff', 
                    fontWeight: '300',
                    letterSpacing: '2px'
                  }}>
                    {loading ? 'Loading...' : 'Continue with Google'}
                  </span>
                  <svg 
                    width={isMobile ? '40' : '60'} 
                    height={isMobile ? '40' : '60'} 
                    viewBox="0 0 24 24" 
                    fill="none"
                    stroke="white"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ marginLeft: '10px', opacity: 0.7 }}
                  >
                    <path d="M17 7L7 17" stroke="white"/>
                    <path d="M17 7H7" stroke="white"/>
                    <path d="M17 7V17" stroke="white"/>
                  </svg>
                </div>

                {/* GitHub Login */}
                <div 
                  onClick={handleGitHubLogin} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '20px',
                    padding: '0', 
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer', 
                    transition: 'opacity 0.2s ease', 
                    opacity: loading ? 0.5 : 0.8,
                    width: '100%'
                  }}
                  onMouseEnter={(e) => !loading && (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={(e) => !loading && (e.currentTarget.style.opacity = '0.8')}
                >
                  <svg width={isMobile ? '32' : '40'} height={isMobile ? '32' : '40'} viewBox="0 0 24 24" style={{ marginRight: '5px' }}>
                    <path fill="#ffffff" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  <span style={{ 
                    fontFamily: 'Helvetica, Arial, sans-serif', 
                    fontSize: isMobile ? '1.8rem' : '2.4rem', 
                    color: '#ffffff', 
                    fontWeight: '300',
                    letterSpacing: '2px'
                  }}>
                    {loading ? 'Loading...' : 'Continue with GitHub'}
                  </span>
                  <svg 
                    width={isMobile ? '40' : '60'} 
                    height={isMobile ? '40' : '60'} 
                    viewBox="0 0 24 24" 
                    fill="none"
                    stroke="white"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ marginLeft: '10px', opacity: 0.7 }}
                  >
                    <path d="M17 7L7 17" stroke="white"/>
                    <path d="M17 7H7" stroke="white"/>
                    <path d="M17 7V17" stroke="white"/>
                  </svg>
                </div>
              </div>

              {/* EMAIL/PASSWORD FORM - NO LINES, BIG TEXT */}
              <form onSubmit={(e) => handleEmailLogin(e)} style={{ width: '100%', maxWidth: '600px' }}>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '35px', 
                  marginBottom: '50px',
                  width: '100%'
                }}>
                  {/* EMAIL INPUT - NO BORDER */}
                  <div style={{ width: '100%' }}>
                    <input 
                      type="email" 
                      placeholder="Email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required 
                      style={{ 
                        width: '100%', 
                        padding: '0 0 5px 0', 
                        border: 'none', 
                        backgroundColor: 'transparent', 
                        color: '#ffffff', 
                        fontFamily: 'Helvetica, Arial, sans-serif', 
                        fontSize: isMobile ? '1.8rem' : '2.2rem', 
                        outline: 'none',
                        fontWeight: '300',
                        letterSpacing: '1px'
                      }} 
                    />
                  </div>

                  {/* PASSWORD INPUT - NO BORDER */}
                  <div style={{ position: 'relative', width: '100%' }}>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required 
                      style={{ 
                        width: '100%', 
                        padding: '0 50px 5px 0', 
                        border: 'none', 
                        backgroundColor: 'transparent', 
                        color: '#ffffff', 
                        fontFamily: 'Helvetica, Arial, sans-serif', 
                        fontSize: isMobile ? '1.8rem' : '2.2rem', 
                        outline: 'none',
                        fontWeight: '300',
                        letterSpacing: '1px'
                      }} 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)} 
                      style={{ 
                        position: 'absolute', 
                        right: '0', 
                        top: '50%', 
                        transform: 'translateY(-50%)', 
                        background: 'none', 
                        border: 'none', 
                        cursor: 'pointer', 
                        padding: '5px',
                        opacity: 0.6
                      }}
                    >
                      {showPassword ? (
                        <svg width={isMobile ? '32' : '40'} height={isMobile ? '32' : '40'} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="white"/>
                          <circle cx="12" cy="12" r="3" stroke="white"/>
                        </svg>
                      ) : (
                        <svg width={isMobile ? '32' : '40'} height={isMobile ? '32' : '40'} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="white"/>
                          <line x1="1" y1="1" x2="23" y2="23" stroke="white"/>
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* SUBMIT BUTTON - NO LINE, BIG TEXT, BIG ARROW */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '20px' }}>
                    <button 
                      type="submit" 
                      disabled={loading} 
                      style={{ 
                        padding: '0', 
                        border: 'none', 
                        backgroundColor: 'transparent', 
                        color: '#ffffff', 
                        fontFamily: 'Helvetica, Arial, sans-serif', 
                        fontSize: isMobile ? '2rem' : '2.6rem', 
                        fontWeight: '300',
                        cursor: loading ? 'not-allowed' : 'pointer', 
                        transition: 'opacity 0.2s ease', 
                        letterSpacing: '4px',
                        opacity: loading ? 0.5 : 0.8
                      }}
                      onMouseEnter={(e) => !loading && (e.currentTarget.style.opacity = '1')}
                      onMouseLeave={(e) => !loading && (e.currentTarget.style.opacity = '0.8')}
                    >
                      {loading ? 'SIGNING IN...' : 'SIGN IN'}
                    </button>
                    <svg 
                      width={isMobile ? '50' : '70'} 
                      height={isMobile ? '50' : '70'} 
                      viewBox="0 0 24 24" 
                      fill="none"
                      stroke="white"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ opacity: 0.7 }}
                    >
                      <path d="M17 7L7 17" stroke="white"/>
                      <path d="M17 7H7" stroke="white"/>
                      <path d="M17 7V17" stroke="white"/>
                    </svg>
                  </div>
                </div>
              </form>

              {/* FORGOT PASSWORD & SIGN UP - BIG TEXT, BIG ARROWS, NO UNDERLINE */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '30px', 
                width: '100%',
                maxWidth: '600px',
                marginTop: '20px'
              }}>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: isMobile ? 'column' : 'row', 
                  justifyContent: 'flex-start', 
                  alignItems: isMobile ? 'flex-start' : 'center', 
                  gap: isMobile ? '25px' : '50px', 
                  fontFamily: 'Helvetica, Arial, sans-serif'
                }}>
                  <button 
                    onClick={handleForgotPassword} 
                    style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '15px',
                      border: 'none', 
                      background: 'none', 
                      color: '#ffffff', 
                      cursor: 'pointer', 
                      opacity: 0.7, 
                      transition: 'opacity 0.2s ease', 
                      fontFamily: 'Helvetica, Arial, sans-serif', 
                      fontSize: isMobile ? '1.6rem' : '2rem',
                      fontWeight: '300',
                      padding: '0',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                  >
                    Forgot your password?
                    <svg 
                      width={isMobile ? '35' : '50'} 
                      height={isMobile ? '35' : '50'} 
                      viewBox="0 0 24 24" 
                      fill="none"
                      stroke="white"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17 7L7 17" stroke="white"/>
                      <path d="M17 7H7" stroke="white"/>
                      <path d="M17 7V17" stroke="white"/>
                    </svg>
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ 
                      color: '#ffffff', 
                      opacity: '0.6', 
                      fontSize: isMobile ? '1.6rem' : '2rem', 
                      fontFamily: 'Helvetica, Arial, sans-serif',
                      fontWeight: '300'
                    }}>
                      Don't have an account?
                    </span>
                    <button 
                      onClick={handleSignUp} 
                      style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        border: 'none', 
                        background: 'none', 
                        color: '#ffffff', 
                        cursor: 'pointer', 
                        opacity: 0.8, 
                        transition: 'opacity 0.2s ease', 
                        fontFamily: 'Helvetica, Arial, sans-serif', 
                        fontSize: isMobile ? '1.6rem' : '2rem',
                        fontWeight: '400',
                        padding: '0',
                        textDecoration: 'none'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
                    >
                      Sign up
                      <svg 
                        width={isMobile ? '35' : '50'} 
                        height={isMobile ? '35' : '50'} 
                        viewBox="0 0 24 24" 
                        fill="none"
                        stroke="white"
                        strokeWidth="1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17 7L7 17" stroke="white"/>
                        <path d="M17 7H7" stroke="white"/>
                        <path d="M17 7V17" stroke="white"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* KEBIJAKAN PRIVASI & KETENTUAN KAMI - BIG TEXT, BIG ARROWS, NO UNDERLINE */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'flex-start', 
                  gap: isMobile ? '40px' : '60px', 
                  marginTop: '30px',
                  flexWrap: 'wrap'
                }}>
                  <Link href="#" style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    color: 'rgba(255, 255, 255, 0.7)', 
                    fontSize: isMobile ? '1.4rem' : '1.8rem', 
                    fontFamily: 'Helvetica, Arial, sans-serif', 
                    textDecoration: 'none', 
                    opacity: 0.7, 
                    transition: 'opacity 0.2s ease', 
                    letterSpacing: '2px',
                    fontWeight: '300'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                  >
                    KEBIJAKAN PRIVASI
                    <svg 
                      width={isMobile ? '30' : '45'} 
                      height={isMobile ? '30' : '45'} 
                      viewBox="0 0 24 24" 
                      fill="none"
                      stroke="white"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17 7L7 17" stroke="white"/>
                      <path d="M17 7H7" stroke="white"/>
                      <path d="M17 7V17" stroke="white"/>
                    </svg>
                  </Link>
                  <Link href="#" style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    color: 'rgba(255, 255, 255, 0.7)', 
                    fontSize: isMobile ? '1.4rem' : '1.8rem', 
                    fontFamily: 'Helvetica, Arial, sans-serif', 
                    textDecoration: 'none', 
                    opacity: 0.7, 
                    transition: 'opacity 0.2s ease', 
                    letterSpacing: '2px',
                    fontWeight: '300'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                  >
                    KETENTUAN KAMI
                    <svg 
                      width={isMobile ? '30' : '45'} 
                      height={isMobile ? '30' : '45'} 
                      viewBox="0 0 24 24" 
                      fill="none"
                      stroke="white"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17 7L7 17" stroke="white"/>
                      <path d="M17 7H7" stroke="white"/>
                      <path d="M17 7V17" stroke="white"/>
                    </svg>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* LETS JOIN US NOTE THINK */}
        <div style={{ 
          position: 'relative', 
          textAlign: isMobile ? 'center' : 'left', 
          marginTop: isMobile ? '6rem' : '8rem', 
          width: '100%', 
          maxWidth: isMobile ? '100%' : '1200px', 
          padding: isMobile ? '2rem 0' : '3rem 0', 
          marginLeft: isMobile ? '0' : '0', 
          marginBottom: isMobile ? '2rem' : '3rem' 
        }}>
          <div style={{ 
            marginBottom: isMobile ? '3rem' : '5rem', 
            padding: isMobile ? '0' : '0' 
          }}>
            <p style={{ 
              color: 'rgba(255,255,255,0.9)', 
              fontSize: isMobile ? '3.5rem' : '7rem', 
              fontFamily: 'Helvetica, Arial, sans-serif', 
              margin: '0 0 0.5rem 0', 
              lineHeight: '1.1', 
              fontWeight: '600' 
            }}>
              LETS JOIN US
            </p>
            <p style={{ 
              color: 'rgba(255,255,255,0.9)', 
              fontSize: isMobile ? '3.5rem' : '7rem', 
              fontFamily: 'Helvetica, Arial, sans-serif', 
              margin: 0, 
              lineHeight: '1.1', 
              fontWeight: '600' 
            }}>
              NOTE THINK.
            </p>
          </div>

          {/* 6 KELOMPOK MENU */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, auto)', 
            gap: isMobile ? '3rem 4rem' : '3rem 10rem', 
            marginTop: '1rem', 
            padding: isMobile ? '0' : '0', 
            justifyContent: isMobile ? 'center' : 'flex-start' 
          }}>
            <div>
              <h4 style={{ 
                color: 'white', 
                fontSize: isMobile ? '2.2rem' : '4.5rem', 
                fontWeight: '600', 
                margin: '0 0 0.5rem 0', 
                marginBottom: isMobile ? '4rem' : '6rem', 
                fontFamily: 'Helvetica, Arial, sans-serif' 
              }}>
                MENU
              </h4>
            </div>
            <div>
              <h4 style={{ 
                color: 'white', 
                fontSize: isMobile ? '2.2rem' : '4.5rem', 
                fontWeight: '600', 
                margin: '0 0 0.5rem 0', 
                marginBottom: isMobile ? '4rem' : '6rem', 
                fontFamily: 'Helvetica, Arial, sans-serif' 
              }}>
                PRODUCT
              </h4>
            </div>
            <div>
              <ConnectionComponent />
            </div>
            <div>
              <h4 style={{ 
                color: 'white', 
                fontSize: isMobile ? '2.2rem' : '4.5rem', 
                fontWeight: '600', 
                margin: '0 0 0.5rem 0', 
                marginBottom: isMobile ? '8rem' : '15rem', 
                fontFamily: 'Helvetica, Arial, sans-serif' 
              }}>
                Features
              </h4>
            </div>
            <div>
              <h4 style={{ 
                color: 'white', 
                fontSize: isMobile ? '2.2rem' : '4.5rem', 
                fontWeight: '600', 
                margin: '0 0 0.5rem 0', 
                marginBottom: isMobile ? '8rem' : '15rem', 
                fontFamily: 'Helvetica, Arial, sans-serif' 
              }}>
                Community
              </h4>
            </div>
            <div>
              <h4 style={{ 
                color: 'white', 
                fontSize: isMobile ? '2.2rem' : '4.5rem', 
                fontWeight: '600', 
                margin: '0 0 0.5rem 0', 
                marginBottom: isMobile ? '8rem' : '15rem', 
                fontFamily: 'Helvetica, Arial, sans-serif' 
              }}>
                BLOG
              </h4>
            </div>
          </div>
        </div>

        {/* TEKS BERJALAN 2 - KANAN KE KIRI */}
        <MarqueeRightText />
      </div>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        input::placeholder {
          color: rgba(255, 255, 255, 0.3);
          font-weight: 300;
          letter-spacing: 1px;
        }
      `}</style>
    </>
  );
}
