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
  doc, 
  setDoc, 
  Timestamp
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

// Data media sosial
const socialConnections = [
  { id: 1, name: "GitHub" },
  { id: 2, name: "Instagram" },
  { id: 3, name: "Twitter" },
  { id: 4, name: "Quora" },
  { id: 5, name: "YouTube" }
];

export default function SignInPage() {
  const router = useRouter();
  
  // State
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState("");
  const [firebaseAuth, setFirebaseAuth] = useState<any>(null);
  const [firebaseDb, setFirebaseDb] = useState<any>(null);
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);
  
  // Refs untuk animasi
  const marqueeLeftRef = useRef<HTMLDivElement>(null);
  const marqueeRightRef = useRef<HTMLDivElement>(null);
  const marqueeLeftAnimation = useRef<gsap.core.Tween | null>(null);
  const marqueeRightAnimation = useRef<gsap.core.Tween | null>(null);
  const [connectionsOpen, setConnectionsOpen] = useState(false);
  const socialItemsRef = useRef<(HTMLDivElement | null)[]>([]);

  // SOUTH WEST ARROW SVG Component
  const SouthWestArrow = ({ size = 60 }) => (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ opacity: 0.9 }}
    >
      <path d="M17 17L7 17" stroke="white" strokeWidth="1.5"/>
      <path d="M7 17L7 7" stroke="white" strokeWidth="1.5"/>
      <path d="M17 17L3 3" stroke="white" strokeWidth="1.5"/>
    </svg>
  );

  // NORTH EAST ARROW SVG Component
  const NorthEastArrow = ({ size = 60 }) => (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 7L17 7" stroke="white" strokeWidth="1.5"/>
      <path d="M7 7L7 17" stroke="white" strokeWidth="1.5"/>
      <path d="M7 7L21 21" stroke="white" strokeWidth="1.5"/>
    </svg>
  );

  // ============================================
  // HYDRATION FIX
  // ============================================
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

  // ============================================
  // FIREBASE INIT
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
    } catch (error) {
      console.error("Firebase initialization error:", error);
    }
  }, [isMounted, firebaseInitialized]);

  // ============================================
  // GSAP ANIMATIONS
  // ============================================
  const startMarqueeLeft = () => {
    if (!marqueeLeftRef.current) return;
    
    try {
      if (marqueeLeftAnimation.current) marqueeLeftAnimation.current.kill();
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
      if (marqueeRightAnimation.current) marqueeRightAnimation.current.kill();
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

  useEffect(() => {
    if (!isMounted) return;
    const timer = setTimeout(() => {
      startMarqueeLeft();
      startMarqueeRight();
    }, 300);
    return () => {
      clearTimeout(timer);
      if (marqueeLeftAnimation.current) marqueeLeftAnimation.current.kill();
      if (marqueeRightAnimation.current) marqueeRightAnimation.current.kill();
    };
  }, [isMounted]);

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
  // AUTH FUNCTIONS
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
    } catch (error) {
      console.error("Error saving login history:", error);
    }
  };

  useEffect(() => {
    if (!isMounted || !firebaseAuth || !firebaseInitialized) return;
    const unsubscribe = onAuthStateChanged(firebaseAuth, (currentUser: any) => {
      setUser(currentUser);
      if (currentUser) {
        setEmail("");
        setPassword("");
        router.push('/notes');
      }
    });
    return () => unsubscribe();
  }, [router, isMounted, firebaseAuth, firebaseInitialized]);

  const handleGoogleLogin = async () => {
    if (!firebaseAuth) return;
    setLoading(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(firebaseAuth, provider);
      await saveLoginHistory(result.user, 'google');
    } catch (error: any) {
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
      const result = await signInWithPopup(firebaseAuth, provider);
      await saveLoginHistory(result.user, 'github');
    } catch (error: any) {
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
      await saveLoginHistory(result.user, 'email');
    } catch (error: any) {
      switch (error.code) {
        case 'auth/invalid-email': setError("EMAIL TIDAK VALID"); break;
        case 'auth/user-disabled': setError("AKUN DINONAKTIFKAN"); break;
        case 'auth/user-not-found': setError("AKUN TIDAK DITEMUKAN"); break;
        case 'auth/wrong-password': setError("PASSWORD SALAH"); break;
        case 'auth/too-many-requests': setError("TERLALU BANYAK PERCOBAAN"); break;
        default: setError("LOGIN GAGAL");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!firebaseAuth) return;
    try {
      await signOut(firebaseAuth);
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (!isMounted) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'black',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        fontSize: '2rem',
        fontFamily: 'Helvetica, Arial, sans-serif',
      }}>
        LOADING...
      </div>
    );
  }

  // ============================================
  // CONNECTION COMPONENT
  // ============================================
  const ConnectionComponent = () => (
    <div style={{ position: 'relative', zIndex: 10 }}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{ cursor: 'pointer', userSelect: 'none' }}
        onClick={() => setConnectionsOpen(!connectionsOpen)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <h4 style={{
            color: 'white',
            fontSize: isMobile ? '32px' : '64px',
            fontWeight: '400',
            margin: '0',
            fontFamily: 'Helvetica, Arial, sans-serif',
            letterSpacing: '2px',
          }}>
            CONNECT
          </h4>
          <span style={{
            color: 'white',
            fontSize: isMobile ? '20px' : '32px',
            opacity: 0.7,
            fontFamily: 'Helvetica, Arial, sans-serif',
          }}>
            ({socialConnections.length.toString().padStart(2, '0')})
          </span>
          <SouthWestArrow size={isMobile ? 40 : 50} />
        </div>
      </motion.div>

      <AnimatePresence>
        {connectionsOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden', marginTop: '20px' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {socialConnections.map((social, index) => (
                <motion.div
                  key={social.id}
                  ref={el => { socialItemsRef.current[index] = el; }}
                  style={{ display: 'flex', alignItems: 'center', gap: '20px' }}
                >
                  <span style={{
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: isMobile ? '20px' : '28px',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    width: '60px',
                  }}>
                    ({index.toString().padStart(2, '0')})
                  </span>
                  <span style={{
                    color: 'white',
                    fontSize: isMobile ? '24px' : '36px',
                    fontWeight: '400',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    letterSpacing: '1px',
                  }}>
                    {social.name}
                  </span>
                  <SouthWestArrow size={isMobile ? 30 : 40} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // ============================================
  // MARQUEE COMPONENTS
  // ============================================
  const MarqueeLeftText = () => (
    <div style={{
      width: '100%',
      overflow: 'hidden',
      marginTop: isMobile ? '100px' : '150px',
      marginBottom: isMobile ? '60px' : '80px',
    }}>
      <div
        ref={marqueeLeftRef}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? '60px' : '120px',
          whiteSpace: 'nowrap',
          width: 'fit-content',
        }}
      >
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '40px' : '80px' }}>
            <span style={{
              color: 'white',
              fontSize: isMobile ? '48px' : '80px',
              fontFamily: 'Helvetica, Arial, sans-serif',
              fontWeight: '400',
              letterSpacing: '4px',
            }}>
              CREATE FREE ACCESS ACCOUNT
            </span>
            <NorthEastArrow size={isMobile ? 60 : 100} />
          </div>
        ))}
      </div>
    </div>
  );

  const MarqueeRightText = () => (
    <div style={{
      width: '100%',
      overflow: 'hidden',
      marginTop: isMobile ? '60px' : '80px',
      marginBottom: isMobile ? '40px' : '60px',
    }}>
      <div
        ref={marqueeRightRef}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? '60px' : '120px',
          whiteSpace: 'nowrap',
          width: 'fit-content',
        }}
      >
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '40px' : '80px' }}>
            <span style={{
              color: 'white',
              fontSize: isMobile ? '64px' : '100px',
              fontFamily: 'Helvetica, Arial, sans-serif',
              fontWeight: '400',
              letterSpacing: '6px',
            }}>
              SIGN IN
            </span>
            <NorthEastArrow size={isMobile ? 80 : 120} />
          </div>
        ))}
      </div>
    </div>
  );

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'black',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      padding: isMobile ? '30px 20px' : '40px 60px',
      fontFamily: 'Helvetica, Arial, sans-serif',
      position: 'relative',
    }}>
      
      {/* HALAMAN UTAMA - TOP LEFT */}
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
        }}>
          <span style={{
            fontSize: isMobile ? '24px' : '32px',
            fontFamily: 'Helvetica, Arial, sans-serif',
            fontWeight: '400',
            letterSpacing: '2px',
            color: 'white',
          }}>
            HALAMAN UTAMA
          </span>
          <SouthWestArrow size={isMobile ? 35 : 45} />
        </Link>
      </div>

      {/* MARQUEE 1 */}
      <MarqueeLeftText />

      {/* MAIN CONTENT - LEFT ALIGNED */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        width: '100%',
        maxWidth: '1000px',
        marginLeft: '0',
      }}>
        
        {/* WELCOME TEXT */}
        <div style={{ width: '100%', marginBottom: '60px' }}>
          <h1 style={{ 
            fontSize: isMobile ? '48px' : '80px', 
            fontWeight: '400', 
            color: 'white', 
            margin: '0 0 10px 0',
            letterSpacing: '2px',
            lineHeight: '1',
          }}>
            {user ? `WELCOME, ${(user.displayName || user.email).toUpperCase()}` : 'WELCOME BACK'}
          </h1>
          <p style={{ 
            fontSize: isMobile ? '32px' : '48px', 
            color: 'white', 
            margin: '0',
            fontWeight: '400',
            letterSpacing: '1px',
            opacity: 0.9,
          }}>
            {user ? 'YOU ARE SIGNED IN' : 'SIGN IN TO YOUR ACCOUNT'}
          </p>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div style={{ 
            color: 'white', 
            fontSize: isMobile ? '20px' : '24px', 
            marginBottom: '30px',
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
              marginBottom: '40px', 
              padding: '0',
              backgroundColor: 'transparent', 
              border: 'none', 
              color: 'white', 
              fontSize: isMobile ? '28px' : '36px',
              fontWeight: '400',
              letterSpacing: '2px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
            }}
          >
            SIGN OUT
            <SouthWestArrow size={isMobile ? 35 : 45} />
          </button>
        )}

        {/* LOGIN FORM - NO LINES, NO BOXES */}
        {!user && (
          <>
            {/* SOCIAL LOGIN */}
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '20px', 
              width: '100%',
              maxWidth: '800px',
              marginBottom: '50px',
            }}>
              <div 
                onClick={handleGoogleLogin} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '10px 0',
                  backgroundColor: 'transparent', 
                  cursor: loading ? 'not-allowed' : 'pointer', 
                  opacity: loading ? 0.5 : 1,
                }}
              >
                <span style={{ 
                  fontSize: isMobile ? '28px' : '36px', 
                  color: 'white', 
                  fontWeight: '400',
                  letterSpacing: '2px',
                }}>
                  {loading ? 'LOADING...' : 'CONTINUE WITH GOOGLE'}
                </span>
                <SouthWestArrow size={isMobile ? 35 : 45} />
              </div>

              <div 
                onClick={handleGitHubLogin} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '10px 0',
                  backgroundColor: 'transparent', 
                  cursor: loading ? 'not-allowed' : 'pointer', 
                  opacity: loading ? 0.5 : 1,
                }}
              >
                <span style={{ 
                  fontSize: isMobile ? '28px' : '36px', 
                  color: 'white', 
                  fontWeight: '400',
                  letterSpacing: '2px',
                }}>
                  {loading ? 'LOADING...' : 'CONTINUE WITH GITHUB'}
                </span>
                <SouthWestArrow size={isMobile ? 35 : 45} />
              </div>
            </div>

            {/* EMAIL/PASSWORD FORM - NO BORDERS */}
            <form onSubmit={handleEmailLogin} style={{ width: '100%', maxWidth: '800px' }}>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '40px', 
                marginBottom: '50px',
              }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: isMobile ? '24px' : '28px', 
                    fontWeight: '400', 
                    color: 'white', 
                    marginBottom: '10px',
                    letterSpacing: '1px',
                  }}>
                    EMAIL
                  </label>
                  <input 
                    type="email" 
                    placeholder="YOUR EMAIL" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    style={{ 
                      width: '100%', 
                      padding: '10px 0', 
                      border: 'none',
                      backgroundColor: 'transparent', 
                      color: 'white', 
                      fontSize: isMobile ? '24px' : '28px', 
                      outline: 'none',
                      letterSpacing: '1px',
                      fontFamily: 'Helvetica, Arial, sans-serif',
                    }} 
                  />
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: isMobile ? '24px' : '28px', 
                    fontWeight: '400', 
                    color: 'white', 
                    marginBottom: '10px',
                    letterSpacing: '1px',
                  }}>
                    PASSWORD
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="YOUR PASSWORD" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required 
                      style={{ 
                        width: '100%', 
                        padding: '10px 0', 
                        border: 'none',
                        backgroundColor: 'transparent', 
                        color: 'white', 
                        fontSize: isMobile ? '24px' : '28px', 
                        outline: 'none',
                        letterSpacing: '1px',
                        fontFamily: 'Helvetica, Arial, sans-serif',
                      }} 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)} 
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        cursor: 'pointer',
                        color: 'white',
                        fontSize: isMobile ? '20px' : '24px',
                        letterSpacing: '1px',
                      }}
                    >
                      {showPassword ? 'HIDE' : 'SHOW'}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading} 
                  style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '15px 0',
                    border: 'none', 
                    backgroundColor: 'transparent', 
                    color: 'white', 
                    fontSize: isMobile ? '28px' : '36px', 
                    fontWeight: '400',
                    letterSpacing: '2px',
                    cursor: loading ? 'not-allowed' : 'pointer', 
                    opacity: loading ? 0.5 : 1,
                    marginTop: '20px',
                  }}
                >
                  <span>{loading ? 'SIGNING IN...' : 'SIGN IN'}</span>
                  <SouthWestArrow size={isMobile ? 35 : 45} />
                </button>
              </div>
            </form>

            {/* FORGOT PASSWORD & SIGN UP */}
            <div style={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row', 
              justifyContent: 'space-between', 
              alignItems: isMobile ? 'flex-start' : 'center', 
              gap: isMobile ? '30px' : '0', 
              width: '100%',
              maxWidth: '800px',
              marginBottom: '50px',
            }}>
              <button 
                onClick={handleForgotPassword} 
                style={{ 
                  border: 'none', 
                  background: 'none', 
                  color: 'white', 
                  cursor: 'pointer', 
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ 
                  color: 'white', 
                  fontSize: isMobile ? '24px' : '28px',
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
                    color: 'white', 
                    cursor: 'pointer', 
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

            {/* PRIVACY & TERMS */}
            <div style={{ 
              display: 'flex', 
              gap: isMobile ? '40px' : '60px', 
              flexWrap: 'wrap',
            }}>
              <Link href="#" style={{ 
                color: 'white', 
                fontSize: isMobile ? '20px' : '24px', 
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
                color: 'white', 
                fontSize: isMobile ? '20px' : '24px', 
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
          </>
        )}
      </div>

      {/* LETS JOIN US SECTION */}
      <div style={{ 
        width: '100%',
        maxWidth: '1400px',
        marginTop: isMobile ? '100px' : '150px', 
        marginBottom: isMobile ? '60px' : '80px',
      }}>
        <div style={{ marginBottom: isMobile ? '50px' : '70px' }}>
          <p style={{ 
            color: 'white', 
            fontSize: isMobile ? '48px' : '80px', 
            margin: '0 0 10px 0', 
            lineHeight: '1', 
            fontWeight: '400',
            letterSpacing: '2px',
          }}>
            LETS JOIN US
          </p>
          <p style={{ 
            color: 'white', 
            fontSize: isMobile ? '48px' : '80px', 
            margin: 0, 
            lineHeight: '1', 
            fontWeight: '400',
            letterSpacing: '2px',
          }}>
            NOTE THINK.
          </p>
        </div>

        {/* MENU GRID */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, auto)', 
          gap: isMobile ? '40px 60px' : '60px 120px', 
          justifyContent: 'flex-start',
          alignItems: 'start',
        }}>
          <div>
            <h4 style={{ 
              color: 'white', 
              fontSize: isMobile ? '32px' : '64px', 
              fontWeight: '400', 
              margin: '0 0 10px 0', 
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
              color: 'white', 
              fontSize: isMobile ? '32px' : '64px', 
              fontWeight: '400', 
              margin: '0 0 10px 0', 
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
              color: 'white', 
              fontSize: isMobile ? '32px' : '64px', 
              fontWeight: '400', 
              margin: '0 0 10px 0', 
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
              color: 'white', 
              fontSize: isMobile ? '32px' : '64px', 
              fontWeight: '400', 
              margin: '0 0 10px 0', 
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
              color: 'white', 
              fontSize: isMobile ? '32px' : '64px', 
              fontWeight: '400', 
              margin: '0 0 10px 0', 
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

      {/* MARQUEE 2 */}
      <MarqueeRightText />
    </div>
  );
}
