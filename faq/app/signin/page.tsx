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
  // 8. AUTH STATE CHANGED LISTENER
  // ============================================
  useEffect(() => {
    if (!isMounted || !firebaseAuth || !firebaseInitialized) return;
    
    const unsubscribe = onAuthStateChanged(firebaseAuth, (currentUser: any) => {
      setUser(currentUser);
      if (currentUser) {
        console.log("User logged in:", currentUser.email);
        setEmail("");
        setPassword("");
        router.push('/notes');
      }
    });

    return () => unsubscribe();
  }, [router, isMounted, firebaseAuth, firebaseInitialized]);

  // ============================================
  // 9. LOGIN HANDLERS
  // ============================================
  const handleGoogleLogin = async () => {
    if (!firebaseAuth) return;
    
    setLoading(true);
    setError("");
    
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
  // 13. SOUTH WEST ARROW SVG COMPONENT
  // ============================================
  const SouthWestArrow = ({ size = isMobile ? 40 : 60 }) => (
    <svg 
      width={size} 
      height={size} 
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
    >
      <path d="M17 17L7 17" stroke="white" strokeWidth="1"/>
      <path d="M7 17L7 7" stroke="white" strokeWidth="1"/>
      <path d="M17 17L3 3" stroke="white" strokeWidth="1"/>
    </svg>
  );

  // ============================================
  // 14. RENDER UTAMA - TAMPILAN SISI KIRI DIPERBAIKI
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
          alignItems: 'flex-start',
          padding: isMobile ? '20px 15px' : '40px 60px',
          fontFamily: 'Helvetica, Arial, sans-serif',
          position: 'relative',
        }}
      >
        {/* HALAMAN UTAMA - POSISI KIRI ATAS */}
        <div style={{
          position: 'absolute',
          top: isMobile ? '30px' : '50px',
          left: isMobile ? '20px' : '60px',
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          zIndex: 50,
        }}>
          <Link href="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            textDecoration: 'none',
            color: 'white',
          }}>
            <span style={{
              fontSize: isMobile ? '1.8rem' : '2.5rem',
              fontFamily: 'Helvetica, Arial, sans-serif',
              fontWeight: '400',
              letterSpacing: '2px',
              color: 'white',
            }}>
              HALAMAN UTAMA
            </span>
            <SouthWestArrow size={isMobile ? 40 : 60} />
          </Link>
        </div>

        {/* TEKS BERJALAN 1 */}
        <MarqueeLeftText />

        {/* MAIN SIGN IN CONTAINER - FULL SISI KIRI */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            gap: isMobile ? '30px' : '40px',
            marginBottom: isMobile ? '30px' : '40px',
            marginTop: isMobile ? '20px' : '30px',
            width: '100%',
            maxWidth: isMobile ? '100%' : '800px',
            marginLeft: '0',
            marginRight: '0',
          }}
        >
          {/* WELCOME TEXT - FULL KIRI, TEKS PUTIH BESAR */}
          <div style={{ 
            width: '100%',
            textAlign: 'left'
          }}>
            <h1 style={{ 
              fontFamily: 'Helvetica, Arial, sans-serif', 
              fontSize: isMobile ? '48px' : '72px', 
              fontWeight: '600', 
              color: '#ffffff', 
              marginBottom: '20px', 
              marginTop: '0',
              letterSpacing: '2px',
              lineHeight: '1.1',
            }}>
              {user ? `WELCOME, ${(user.displayName || user.email).toUpperCase()}` : 'WELCOME BACK'}
            </h1>
            <p style={{ 
              fontFamily: 'Helvetica, Arial, sans-serif', 
              fontSize: isMobile ? '32px' : '48px', 
              color: '#ffffff', 
              marginBottom: '40px',
              marginTop: '0',
              fontWeight: '400',
              letterSpacing: '1px',
            }}>
              {user ? 'YOU ARE SIGNED IN' : 'SIGN IN TO YOUR ACCOUNT'}
            </p>
            
            {/* ERROR MESSAGE - TETAP PUTIH */}
            {error && (
              <div style={{ 
                padding: '20px 0', 
                color: '#ffffff', 
                fontSize: isMobile ? '20px' : '24px', 
                fontFamily: 'Helvetica, Arial, sans-serif',
                fontWeight: '400',
                letterSpacing: '1px',
              }}>
                {error}
              </div>
            )}
            
            {/* LOGOUT BUTTON */}
            {user && (
              <button 
                onClick={handleLogout} 
                style={{ 
                  marginTop: '30px', 
                  padding: '20px 40px', 
                  backgroundColor: 'transparent', 
                  border: '2px solid white', 
                  color: 'white', 
                  fontSize: isMobile ? '24px' : '32px',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  fontWeight: '400',
                  letterSpacing: '2px',
                  cursor: 'pointer', 
                  transition: 'all 0.3s ease',
                }}
              >
                SIGN OUT
              </button>
            )}
          </div>

          {/* FORM LOGIN - HANYA TAMPIL JIKA BELUM LOGIN */}
          {!user && (
            <>
              {/* SOCIAL LOGIN BUTTONS - TEKS PUTIH BESAR */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '25px', 
                width: '100%',
                maxWidth: '600px',
                marginBottom: '30px',
              }}>
                {/* Google Login */}
                <div 
                  onClick={handleGoogleLogin} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'flex-start', 
                    padding: '20px 0', 
                    border: 'none',
                    borderBottom: '1px solid rgba(255,255,255,0.3)',
                    backgroundColor: 'transparent', 
                    cursor: loading ? 'not-allowed' : 'pointer', 
                    transition: 'all 0.3s ease', 
                    opacity: loading ? 0.7 : 1,
                    width: '100%',
                  }}
                >
                  <svg width="40" height="40" viewBox="0 0 24 24" style={{ marginRight: '20px' }}>
                    <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#ffffff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#ffffff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#ffffff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span style={{ 
                    fontFamily: 'Helvetica, Arial, sans-serif', 
                    fontSize: isMobile ? '28px' : '36px', 
                    color: '#ffffff', 
                    fontWeight: '400',
                    letterSpacing: '2px',
                  }}>
                    {loading ? 'LOADING...' : 'CONTINUE WITH GOOGLE'}
                  </span>
                </div>

                {/* GitHub Login */}
                <div 
                  onClick={handleGitHubLogin} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'flex-start', 
                    padding: '20px 0', 
                    border: 'none',
                    borderBottom: '1px solid rgba(255,255,255,0.3)',
                    backgroundColor: 'transparent', 
                    cursor: loading ? 'not-allowed' : 'pointer', 
                    transition: 'all 0.3s ease', 
                    opacity: loading ? 0.7 : 1,
                    width: '100%',
                  }}
                >
                  <svg width="40" height="40" viewBox="0 0 24 24" style={{ marginRight: '20px' }}>
                    <path fill="#ffffff" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  <span style={{ 
                    fontFamily: 'Helvetica, Arial, sans-serif', 
                    fontSize: isMobile ? '28px' : '36px', 
                    color: '#ffffff', 
                    fontWeight: '400',
                    letterSpacing: '2px',
                  }}>
                    {loading ? 'LOADING...' : 'CONTINUE WITH GITHUB'}
                  </span>
                </div>
              </div>

              {/* EMAIL/PASSWORD FORM - TANPA LINEBOX */}
              <form onSubmit={(e) => handleEmailLogin(e)} style={{ width: '100%', maxWidth: '600px' }}>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '30px', 
                  padding: '0',
                  backgroundColor: 'transparent', 
                  marginBottom: '30px',
                  width: '100%',
                }}>
                  {/* EMAIL INPUT */}
                  <div style={{ width: '100%' }}>
                    <label style={{ 
                      display: 'block', 
                      fontFamily: 'Helvetica, Arial, sans-serif', 
                      fontSize: isMobile ? '24px' : '28px', 
                      fontWeight: '400', 
                      color: '#ffffff', 
                      marginBottom: '15px',
                      letterSpacing: '1px',
                    }}>
                      EMAIL
                    </label>
                    <input 
                      type="email" 
                      placeholder="ENTER YOUR EMAIL" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required 
                      style={{ 
                        width: '100%', 
                        padding: '15px 0', 
                        border: 'none',
                        borderBottom: '1px solid rgba(255,255,255,0.5)',
                        backgroundColor: 'transparent', 
                        color: '#ffffff', 
                        fontFamily: 'Helvetica, Arial, sans-serif', 
                        fontSize: isMobile ? '24px' : '28px', 
                        outline: 'none',
                        letterSpacing: '1px',
                      }} 
                    />
                  </div>

                  {/* PASSWORD INPUT */}
                  <div style={{ width: '100%' }}>
                    <label style={{ 
                      display: 'block', 
                      fontFamily: 'Helvetica, Arial, sans-serif', 
                      fontSize: isMobile ? '24px' : '28px', 
                      fontWeight: '400', 
                      color: '#ffffff', 
                      marginBottom: '15px',
                      letterSpacing: '1px',
                    }}>
                      PASSWORD
                    </label>
                    <div style={{ position: 'relative', width: '100%' }}>
                      <input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="ENTER YOUR PASSWORD" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        style={{ 
                          width: '100%', 
                          padding: '15px 0', 
                          border: 'none',
                          borderBottom: '1px solid rgba(255,255,255,0.5)',
                          backgroundColor: 'transparent', 
                          color: '#ffffff', 
                          fontFamily: 'Helvetica, Arial, sans-serif', 
                          fontSize: isMobile ? '24px' : '28px', 
                          outline: 'none',
                          letterSpacing: '1px',
                          paddingRight: '60px',
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
                          padding: '10px',
                          color: 'white',
                          fontSize: isMobile ? '20px' : '24px',
                        }}
                      >
                        {showPassword ? 'HIDE' : 'SHOW'}
                      </button>
                    </div>
                  </div>

                  {/* SUBMIT BUTTON */}
                  <button 
                    type="submit" 
                    disabled={loading} 
                    style={{ 
                      width: '100%', 
                      padding: '25px 0', 
                      border: '2px solid white', 
                      backgroundColor: 'transparent', 
                      color: '#ffffff', 
                      fontFamily: 'Helvetica, Arial, sans-serif', 
                      fontSize: isMobile ? '28px' : '36px', 
                      fontWeight: '400',
                      letterSpacing: '2px',
                      cursor: loading ? 'not-allowed' : 'pointer', 
                      transition: 'all 0.3s ease', 
                      marginTop: '20px',
                    }}
                  >
                    {loading ? 'SIGNING IN...' : 'SIGN IN'}
                  </button>
                </div>
              </form>

              {/* FORGOT PASSWORD & SIGN UP - TANPA UNDERLINE, PAKAI SOUTH WEST ARROW */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '30px', 
                width: '100%',
                maxWidth: '600px',
              }}>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: isMobile ? 'column' : 'row', 
                  justifyContent: 'space-between', 
                  alignItems: isMobile ? 'flex-start' : 'center', 
                  gap: isMobile ? '20px' : '0', 
                  fontFamily: 'Helvetica, Arial, sans-serif', 
                  fontSize: isMobile ? '24px' : '28px',
                  width: '100%',
                }}>
                  <button 
                    onClick={handleForgotPassword} 
                    style={{ 
                      border: 'none', 
                      background: 'none', 
                      color: '#ffffff', 
                      cursor: 'pointer', 
                      fontFamily: 'Helvetica, Arial, sans-serif', 
                      fontSize: isMobile ? '24px' : '28px',
                      fontWeight: '400',
                      letterSpacing: '1px',
                      padding: '0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '15px',
                    }}
                  >
                    FORGOT PASSWORD
                    <SouthWestArrow size={isMobile ? 30 : 40} />
                  </button>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                  }}>
                    <span style={{ 
                      color: '#ffffff', 
                      fontSize: isMobile ? '24px' : '28px',
                      fontFamily: 'Helvetica, Arial, sans-serif',
                      fontWeight: '400',
                      letterSpacing: '1px',
                    }}>
                      NO ACCOUNT?
                    </span>
                    <button 
                      onClick={handleSignUp} 
                      style={{ 
                        border: 'none', 
                        background: 'none', 
                        color: '#ffffff', 
                        cursor: 'pointer', 
                        fontFamily: 'Helvetica, Arial, sans-serif', 
                        fontSize: isMobile ? '24px' : '28px',
                        fontWeight: '400',
                        letterSpacing: '1px',
                        padding: '0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                      }}
                    >
                      SIGN UP
                      <SouthWestArrow size={isMobile ? 30 : 40} />
                    </button>
                  </div>
                </div>

                {/* KEBIJAKAN PRIVASI & KETENTUAN KAMI - TANPA UNDERLINE, PAKAI SOUTH WEST ARROW */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'flex-start', 
                  gap: isMobile ? '40px' : '60px', 
                  marginTop: '20px',
                  flexWrap: 'wrap',
                }}>
                  <Link href="#" style={{ 
                    color: '#ffffff', 
                    fontSize: isMobile ? '20px' : '24px', 
                    fontFamily: 'Helvetica, Arial, sans-serif', 
                    textDecoration: 'none',
                    letterSpacing: '1px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}>
                    KEBIJAKAN PRIVASI
                    <SouthWestArrow size={isMobile ? 25 : 30} />
                  </Link>
                  <Link href="#" style={{ 
                    color: '#ffffff', 
                    fontSize: isMobile ? '20px' : '24px', 
                    fontFamily: 'Helvetica, Arial, sans-serif', 
                    textDecoration: 'none',
                    letterSpacing: '1px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}>
                    KETENTUAN KAMI
                    <SouthWestArrow size={isMobile ? 25 : 30} />
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* LETS JOIN US NOTE THINK */}
        <div style={{ 
          position: 'relative', 
          textAlign: 'left', 
          marginTop: isMobile ? '4rem' : '6rem', 
          width: '100%', 
          maxWidth: isMobile ? '100%' : '1200px', 
          padding: '0',
          marginLeft: '0', 
          marginBottom: isMobile ? '2rem' : '3rem',
        }}>
          <div style={{ 
            marginBottom: isMobile ? '3rem' : '5rem', 
            padding: '0',
          }}>
            <p style={{ 
              color: '#ffffff', 
              fontSize: isMobile ? '48px' : '80px', 
              fontFamily: 'Helvetica, Arial, sans-serif', 
              margin: '0 0 0.3rem 0', 
              lineHeight: '1.1', 
              fontWeight: '600',
              letterSpacing: '2px',
            }}>
              LETS JOIN US
            </p>
            <p style={{ 
              color: '#ffffff', 
              fontSize: isMobile ? '48px' : '80px', 
              fontFamily: 'Helvetica, Arial, sans-serif', 
              margin: 0, 
              lineHeight: '1.1', 
              fontWeight: '600',
              letterSpacing: '2px',
            }}>
              NOTE THINK.
            </p>
          </div>

          {/* 6 KELOMPOK MENU - SEMUA PAKAI SOUTH WEST ARROW */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, auto)', 
            gap: isMobile ? '3rem 4rem' : '3rem 8rem', 
            marginTop: '0', 
            padding: '0', 
            justifyContent: 'flex-start',
            alignItems: 'start',
          }}>
            <div>
              <h4 style={{ 
                color: '#ffffff', 
                fontSize: isMobile ? '32px' : '64px', 
                fontWeight: '600', 
                margin: '0 0 0.5rem 0', 
                marginBottom: isMobile ? '3rem' : '5rem', 
                fontFamily: 'Helvetica, Arial, sans-serif',
                letterSpacing: '2px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
              }}>
                MENU
                <SouthWestArrow size={isMobile ? 35 : 50} />
              </h4>
            </div>
            <div>
              <h4 style={{ 
                color: '#ffffff', 
                fontSize: isMobile ? '32px' : '64px', 
                fontWeight: '600', 
                margin: '0 0 0.5rem 0', 
                marginBottom: isMobile ? '3rem' : '5rem', 
                fontFamily: 'Helvetica, Arial, sans-serif',
                letterSpacing: '2px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
              }}>
                PRODUCT
                <SouthWestArrow size={isMobile ? 35 : 50} />
              </h4>
            </div>
            <div>
              <ConnectionComponent />
            </div>
            <div>
              <h4 style={{ 
                color: '#ffffff', 
                fontSize: isMobile ? '32px' : '64px', 
                fontWeight: '600', 
                margin: '0 0 0.5rem 0', 
                marginBottom: isMobile ? '8rem' : '15rem', 
                fontFamily: 'Helvetica, Arial, sans-serif',
                letterSpacing: '2px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
              }}>
                FEATURES
                <SouthWestArrow size={isMobile ? 35 : 50} />
              </h4>
            </div>
            <div>
              <h4 style={{ 
                color: '#ffffff', 
                fontSize: isMobile ? '32px' : '64px', 
                fontWeight: '600', 
                margin: '0 0 0.5rem 0', 
                marginBottom: isMobile ? '8rem' : '15rem', 
                fontFamily: 'Helvetica, Arial, sans-serif',
                letterSpacing: '2px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
              }}>
                COMMUNITY
                <SouthWestArrow size={isMobile ? 35 : 50} />
              </h4>
            </div>
            <div>
              <h4 style={{ 
                color: '#ffffff', 
                fontSize: isMobile ? '32px' : '64px', 
                fontWeight: '600', 
                margin: '0 0 0.5rem 0', 
                marginBottom: isMobile ? '8rem' : '15rem', 
                fontFamily: 'Helvetica, Arial, sans-serif',
                letterSpacing: '2px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
              }}>
                BLOG
                <SouthWestArrow size={isMobile ? 35 : 50} />
              </h4>
            </div>
          </div>
        </div>

        {/* TEKS BERJALAN 2 */}
        <MarqueeRightText />
      </div>
    </>
  );
}
