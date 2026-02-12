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

// Interface untuk user login history
interface LoginHistory {
  id: string;
  email: string;
  displayName: string;
  photoURL: string;
  provider: string;
  lastLogin: any;
  uid: string;
}

interface LocalUser extends LoginHistory {
  password?: string;
  autoLoginEnabled?: boolean;
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
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [showAutoLoginModal, setShowAutoLoginModal] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [autoLoginInProgress, setAutoLoginInProgress] = useState(false);
  
  // --- STATE UNTUK FIREBASE (HANYA CLIENT) ---
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);
  const [firebaseApp, setFirebaseApp] = useState<any>(null);
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
      
      setFirebaseApp(app);
      setFirebaseAuth(auth);
      setFirebaseDb(db);
      setFirebaseInitialized(true);
      
      console.log("Firebase initialized successfully");
    } catch (error) {
      console.error("Firebase initialization error:", error);
    }
  }, [isMounted, firebaseInitialized]);

  // ============================================
  // 4. FUNGSI ANIMASI GSAP
  // ============================================
  const startMarqueeLeft = () => {
    if (!marqueeLeftRef.current) return;
    
    try {
      if (marqueeLeftAnimation.current) {
        marqueeLeftAnimation.current.kill();
      }
      
      marqueeLeftAnimation.current = gsap.fromTo(marqueeLeftRef.current, 
        { x: '-100%' },
        { 
          x: '100%', 
          duration: 50, 
          repeat: -1, 
          ease: 'none',
          repeatDelay: 0,
          overwrite: true
        }
      );
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
      
      marqueeRightAnimation.current = gsap.fromTo(marqueeRightRef.current, 
        { x: '100%' },
        { 
          x: '-100%', 
          duration: 60, 
          repeat: -1, 
          ease: 'none',
          repeatDelay: 0,
          overwrite: true
        }
      );
    } catch (error) {
      console.error("GSAP Right Animation Error:", error);
    }
  };

  // ============================================
  // 5. MULAI ANIMASI GSAP - SETELAH SEMUA SIAP
  // ============================================
  useEffect(() => {
    if (!isMounted) return;
    
    // Beri waktu agar DOM benar-benar siap
    const timer = setTimeout(() => {
      startMarqueeLeft();
      startMarqueeRight();
    }, 500);
    
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
  // 7. FUNGSI FIRESTORE
  // ============================================
  const saveLoginHistory = async (userData: any, provider: string, userPassword?: string) => {
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
      
      if (rememberMe && userPassword) {
        saveUserToLocalStorage(historyData, userPassword);
      }
    } catch (error) {
      console.error("Error saving login history:", error);
    }
  };

  const fetchLoginHistory = async () => {
    if (!firebaseDb) return [];
    
    try {
      const historyRef = collection(firebaseDb, "loginHistory");
      const q = query(historyRef, orderBy("lastLogin", "desc"), limit(10));
      const querySnapshot = await getDocs(q);
      
      const history: LoginHistory[] = [];
      querySnapshot.forEach((doc) => {
        history.push(doc.data() as LoginHistory);
      });
      
      setLoginHistory(history);
      return history;
    } catch (error) {
      console.error("Error fetching login history:", error);
      return [];
    }
  };

  // ============================================
  // 8. LOCAL STORAGE FUNCTIONS
  // ============================================
  const getLocalLoginHistory = (): LocalUser[] => {
    try {
      const savedUsers = localStorage.getItem('savedLoginUsers');
      if (savedUsers) {
        return JSON.parse(savedUsers);
      }
    } catch (error) {
      console.error("Error getting local history:", error);
    }
    return [];
  };

  const saveUserToLocalStorage = (userData: any, plainPassword?: string) => {
    try {
      const savedUsers = localStorage.getItem('savedLoginUsers');
      let users: LocalUser[] = savedUsers ? JSON.parse(savedUsers) : [];
      
      const existingIndex = users.findIndex((u: LocalUser) => u.uid === userData.uid);
      
      const userToSave: LocalUser = {
        uid: userData.uid,
        id: userData.id || userData.uid,
        email: userData.email,
        displayName: userData.displayName || userData.email?.split('@')[0],
        photoURL: userData.photoURL || `https://ui-avatars.com/api/?name=${userData.email}&background=random`,
        provider: userData.provider || 'email',
        lastLogin: userData.lastLogin || new Date().toISOString(),
        password: plainPassword,
        autoLoginEnabled: rememberMe
      };
      
      if (existingIndex >= 0) {
        users[existingIndex] = userToSave;
      } else {
        users.unshift(userToSave);
        if (users.length > 5) {
          users = users.slice(0, 5);
        }
      }
      
      localStorage.setItem('savedLoginUsers', JSON.stringify(users));
      setLoginHistory(users);
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  };

  const removeUserFromLocalStorage = (uid: string) => {
    try {
      const savedUsers = localStorage.getItem('savedLoginUsers');
      if (savedUsers) {
        let users = JSON.parse(savedUsers);
        users = users.filter((u: any) => u.uid !== uid);
        localStorage.setItem('savedLoginUsers', JSON.stringify(users));
        setLoginHistory(users);
        
        if (firebaseDb) {
          deleteDoc(doc(firebaseDb, "loginHistory", uid)).catch(() => {
            console.log("User not found in Firestore");
          });
        }
      }
    } catch (error) {
      console.error("Error removing user:", error);
    }
  };

  // ============================================
  // 9. CEK AUTO LOGIN
  // ============================================
  useEffect(() => {
    if (!isMounted || !firebaseInitialized) return;
    
    const checkSavedUser = async () => {
      setTimeout(async () => {
        const currentUser = firebaseAuth?.currentUser;
        
        if (!currentUser) {
          const localHistory = getLocalLoginHistory();
          if (localHistory.length > 0) {
            setShowAutoLoginModal(true);
            setLoginHistory(localHistory);
          }
          
          try {
            await fetchLoginHistory();
          } catch (error) {
            console.error("Failed to fetch from Firestore:", error);
          }
        }
      }, 1000);
    };

    checkSavedUser();
  }, [isMounted, firebaseInitialized, firebaseAuth]);

  // ============================================
  // 10. AUTH STATE CHANGED LISTENER
  // ============================================
  useEffect(() => {
    if (!isMounted || !firebaseAuth || !firebaseInitialized) return;
    
    const unsubscribe = onAuthStateChanged(firebaseAuth, (currentUser: any) => {
      setUser(currentUser);
      if (currentUser) {
        console.log("User logged in:", currentUser.email);
        setShowAutoLoginModal(false);
        setEmail("");
        setPassword("");
        router.push('/notes');
      }
    });

    return () => unsubscribe();
  }, [router, isMounted, firebaseAuth, firebaseInitialized]);

  // ============================================
  // 11. LOGIN HANDLERS
  // ============================================
  const handleGoogleLogin = async () => {
    if (!firebaseAuth) return;
    
    setLoading(true);
    setError("");
    setShowAutoLoginModal(false);
    
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
    setShowAutoLoginModal(false);
    
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
    setShowAutoLoginModal(false);
    
    try {
      const result = await signInWithEmailAndPassword(firebaseAuth, email, password);
      const user = result.user;
      console.log("Email login successful");
      await saveLoginHistory(user, 'email', password);
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

  const handleQuickLogin = async (savedUser: LocalUser) => {
    if (!firebaseAuth) return;
    
    setAutoLoginInProgress(true);
    setShowAutoLoginModal(false);
    
    try {
      if (savedUser.provider === 'email') {
        setEmail(savedUser.email);
        
        if (savedUser.password) {
          setPassword(savedUser.password);
          
          setTimeout(async () => {
            try {
              setLoading(true);
              const result = await signInWithEmailAndPassword(firebaseAuth, savedUser.email, savedUser.password!);
              const user = result.user;
              console.log("Auto login successful for:", savedUser.email);
              await saveLoginHistory(user, 'email', savedUser.password);
            } catch (error: any) {
              console.error("Auto login error:", error);
              if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
                removeUserFromLocalStorage(savedUser.uid);
                setError("Password telah berubah. Silakan login manual.");
              } else {
                setError("Login otomatis gagal. Silakan login manual.");
              }
            } finally {
              setLoading(false);
              setAutoLoginInProgress(false);
            }
          }, 100);
        } else {
          setEmail(savedUser.email);
          setError("Silakan masukkan password untuk melanjutkan");
          setAutoLoginInProgress(false);
          setTimeout(() => {
            const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement;
            if (passwordInput) passwordInput.focus();
          }, 50);
        }
      } else if (savedUser.provider === 'google') {
        await handleGoogleLogin();
      } else if (savedUser.provider === 'github') {
        await handleGitHubLogin();
      }
    } catch (error) {
      console.error("Quick login error:", error);
      setError("Gagal login dengan akun yang disimpan");
      setAutoLoginInProgress(false);
    }
  };

  const handleLogout = async () => {
    if (!firebaseAuth) return;
    
    try {
      await signOut(firebaseAuth);
      console.log("User logged out");
      setEmail("");
      setPassword("");
      setTimeout(() => {
        const localHistory = getLocalLoginHistory();
        if (localHistory.length > 0) {
          setShowAutoLoginModal(true);
        }
      }, 500);
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

  const handleCloseModal = () => {
    setShowAutoLoginModal(false);
  };

  // ============================================
  // 12. FIX HYDRATION: JIKA BELUM MOUNT, TAMPILKAN LOADING
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
  // 13. KOMPONEN CONNECTION
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
  // 14. KOMPONEN MODAL AUTO LOGIN
  // ============================================
  const AutoLoginModal = () => (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(10px)',
    }}>
      <div style={{
        backgroundColor: 'rgba(30, 30, 30, 0.95)',
        borderRadius: '20px',
        padding: '30px',
        width: isMobile ? '90%' : '400px',
        maxWidth: '500px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
      }}>
        <h2 style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center', fontFamily: 'Helvetica, Arial, sans-serif' }}>
          Pilih Akun untuk Login
        </h2>
        <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', marginBottom: '25px', textAlign: 'center', fontFamily: 'Helvetica, Arial, sans-serif' }}>
          Klik akun untuk login otomatis
        </p>
        <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
          {loginHistory.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.5)', padding: '20px', fontFamily: 'Helvetica, Arial, sans-serif' }}>
              Tidak ada akun yang tersimpan
            </div>
          ) : (
            loginHistory.map((user) => (
              <div
                key={user.id}
                onClick={() => handleQuickLogin(user as LocalUser)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '15px',
                  marginBottom: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                <img 
                  src={user.photoURL} 
                  alt={user.displayName}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    marginRight: '15px',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'white', fontWeight: '500', fontSize: '16px', marginBottom: '5px', fontFamily: 'Helvetica, Arial, sans-serif' }}>
                    {user.displayName}
                  </div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px', fontFamily: 'Helvetica, Arial, sans-serif' }}>
                    {user.email}
                  </div>
                  <div style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '11px', marginTop: '5px', textTransform: 'capitalize', fontFamily: 'Helvetica, Arial, sans-serif' }}>
                    {user.provider} • {(user as LocalUser).password ? "Password tersimpan" : "Login terakhir"}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeUserFromLocalStorage(user.uid);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.5)',
                    cursor: 'pointer',
                    padding: '5px',
                    fontSize: '20px',
                    width: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
                  }}
                  title="Hapus dari daftar"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={handleCloseModal}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.3s ease',
              fontFamily: 'Helvetica, Arial, sans-serif',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'; }}
          >
            Gunakan Akun Lain
          </button>
          <button
            onClick={handleCloseModal}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: 'rgba(255, 255, 255, 0.7)',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.3s ease',
              fontFamily: 'Helvetica, Arial, sans-serif',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            Batal
          </button>
        </div>
        <div style={{ marginTop: '20px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px', fontFamily: 'Helvetica, Arial, sans-serif' }}>
          Akun disimpan secara lokal di browser Anda
        </div>
      </div>
    </div>
  );

  // ============================================
  // 15. KOMPONEN MARQUEE - TEKS BERJALAN
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
        }}
      >
        {[...Array(3)].map((_, i) => (
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
              fill="white"
            >
              <path d="M12 4L10.6 5.4L13.2 8H4V10H13.2L10.6 12.6L12 14L17 9L12 4Z" fill="white"/>
              <path d="M4 16V18H20V16H4Z" fill="white"/>
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
        }}
      >
        {[...Array(3)].map((_, i) => (
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
              fill="white"
            >
              <path d="M11 7L9.6 8.4L12.2 11H2V13H12.2L9.6 15.6L11 17L16 12L11 7Z" fill="white"/>
              <path d="M20 19H12V21H20C21.1 21 22 20.1 22 19V5C22 3.9 21.1 3 20 3H12V5H20V19Z" fill="white"/>
            </svg>
          </div>
        ))}
      </div>
    </div>
  );

  // ============================================
  // 16. RENDER UTAMA
  // ============================================
  return (
    <>
      {showAutoLoginModal && !user && <AutoLoginModal />}
      
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: isMobile ? 'flex-start' : 'center',
          alignItems: 'center',
          padding: isMobile ? '20px 15px' : '40px 20px',
          fontFamily: 'Helvetica, Arial, sans-serif',
          position: 'relative',
        }}
      >
        {/* HALAMAN UTAMA - SISI KANAN ATAS */}
        <div style={{
          position: 'absolute',
          top: isMobile ? '30px' : '50px',
          right: isMobile ? '20px' : '50px',
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
              textDecoration: 'none',
            }}>
              HALAMAN UTAMA
            </span>
            {/* NORTH WEST ARROW SVG - EKOR PENDEK */}
            <svg 
              width={isMobile ? '40' : '60'} 
              height={isMobile ? '40' : '60'} 
              viewBox="0 0 24 24" 
              fill="none"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ transition: 'transform 0.2s ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translate(-3px, -3px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translate(0, 0)'; }}
            >
              <path d="M5 5L15 5" stroke="white" strokeWidth="1.5"/>
              <path d="M5 5L5 15" stroke="white" strokeWidth="1.5"/>
              <path d="M5 5L19 19" stroke="white" strokeWidth="1.5"/>
            </svg>
          </Link>
        </div>

        {/* TEKS BERJALAN 1 - KIRI KE KANAN */}
        <MarqueeLeftText />

        {/* MAIN SIGN IN CONTAINER */}
        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'center' : 'flex-start',
            justifyContent: isMobile ? 'center' : 'flex-end',
            gap: isMobile ? '30px' : '60px',
            marginBottom: isMobile ? '30px' : '40px',
            marginTop: isMobile ? '20px' : '30px',
            width: '100%',
            maxWidth: isMobile ? '100%' : '1200px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              marginTop: isMobile ? '0' : '40px',
              width: isMobile ? '100%' : 'auto',
              maxWidth: isMobile ? '400px' : '500px',
              marginRight: isMobile ? '0' : '100px',
            }}
          >
            {/* WELCOME TEXT */}
            <div style={{ 
              marginBottom: isMobile ? '30px' : '40px',
              textAlign: isMobile ? 'center' : 'left'
            }}>
              <h1 style={{ 
                fontFamily: 'Helvetica, Arial, sans-serif', 
                fontSize: isMobile ? '32px' : '48px', 
                fontWeight: 'bold', 
                color: '#ffffff', 
                marginBottom: '15px', 
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)' 
              }}>
                {user ? `Welcome, ${user.displayName || user.email}` : 'Welcome back'}
              </h1>
              <p style={{ 
                fontFamily: 'Helvetica, Arial, sans-serif', 
                fontSize: isMobile ? '16px' : '18px', 
                color: '#ffffff', 
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)' 
              }}>
                {user ? 'You are signed in' : 'Sign in to your account to continue'}
              </p>
              
              {/* ERROR MESSAGE */}
              {error && (
                <div style={{ 
                  backgroundColor: 'rgba(255, 0, 0, 0.1)', 
                  border: '1px solid rgba(255, 0, 0, 0.3)', 
                  borderRadius: '8px', 
                  padding: '12px', 
                  marginTop: '15px', 
                  color: '#ff6b6b', 
                  fontSize: '14px', 
                  fontFamily: 'Helvetica, Arial, sans-serif' 
                }}>
                  {error}
                </div>
              )}
              
              {/* AUTO LOGIN PROGRESS */}
              {autoLoginInProgress && (
                <div style={{ 
                  backgroundColor: 'rgba(0, 255, 0, 0.1)', 
                  border: '1px solid rgba(0, 255, 0, 0.3)', 
                  borderRadius: '8px', 
                  padding: '12px', 
                  marginTop: '15px', 
                  color: '#00ff00', 
                  fontSize: '14px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px', 
                  fontFamily: 'Helvetica, Arial, sans-serif' 
                }}>
                  <div style={{ 
                    width: '20px', 
                    height: '20px', 
                    border: '2px solid #00ff00', 
                    borderTop: '2px solid transparent', 
                    borderRadius: '50%', 
                    animation: 'spin 1s linear infinite' 
                  }} />
                  <span>Melakukan login otomatis...</span>
                </div>
              )}
              
              {/* LOGOUT BUTTON */}
              {user && (
                <button 
                  onClick={handleLogout} 
                  style={{ 
                    marginTop: '20px', 
                    padding: '10px 20px', 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                    border: '1px solid rgba(255, 255, 255, 0.3)', 
                    borderRadius: '8px', 
                    color: 'white', 
                    cursor: 'pointer', 
                    transition: 'all 0.3s ease', 
                    fontFamily: 'Helvetica, Arial, sans-serif' 
                  }}
                >
                  Sign Out
                </button>
              )}
            </div>

            {/* FORM LOGIN - HANYA TAMPIL JIKA BELUM LOGIN */}
            {!user && (
              <>
                {/* SOCIAL LOGIN BUTTONS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
                  {/* Google Login */}
                  <div 
                    onClick={handleGoogleLogin} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      padding: '15px 20px', 
                      border: '2px solid rgba(255, 255, 255, 0.3)', 
                      borderRadius: '12px', 
                      backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                      backdropFilter: 'blur(10px)', 
                      cursor: loading ? 'not-allowed' : 'pointer', 
                      transition: 'all 0.3s ease', 
                      opacity: loading ? 0.7 : 1 
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" style={{ marginRight: '12px' }}>
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span style={{ 
                      fontFamily: 'Helvetica, Arial, sans-serif', 
                      fontSize: isMobile ? '14px' : '16px', 
                      color: '#ffffff', 
                      fontWeight: '500' 
                    }}>
                      {loading ? 'Loading...' : 'Continue with Google'}
                    </span>
                  </div>

                  {/* GitHub Login */}
                  <div 
                    onClick={handleGitHubLogin} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      padding: '15px 20px', 
                      border: '2px solid rgba(255, 255, 255, 0.3)', 
                      borderRadius: '12px', 
                      backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                      backdropFilter: 'blur(10px)', 
                      cursor: loading ? 'not-allowed' : 'pointer', 
                      transition: 'all 0.3s ease', 
                      opacity: loading ? 0.7 : 1 
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" style={{ marginRight: '12px' }}>
                      <path fill="#ffffff" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                    </svg>
                    <span style={{ 
                      fontFamily: 'Helvetica, Arial, sans-serif', 
                      fontSize: isMobile ? '14px' : '16px', 
                      color: '#ffffff', 
                      fontWeight: '500' 
                    }}>
                      {loading ? 'Loading...' : 'Continue with GitHub'}
                    </span>
                  </div>
                </div>

                {/* EMAIL/PASSWORD FORM */}
                <form onSubmit={(e) => handleEmailLogin(e)}>
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '20px', 
                    padding: isMobile ? '20px' : '25px', 
                    border: '2px solid rgba(255, 255, 255, 0.3)', 
                    borderRadius: '12px', 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                    backdropFilter: 'blur(10px)', 
                    marginBottom: '20px' 
                  }}>
                    {/* EMAIL INPUT */}
                    <div>
                      <label style={{ 
                        display: 'block', 
                        fontFamily: 'Helvetica, Arial, sans-serif', 
                        fontSize: '14px', 
                        fontWeight: '500', 
                        color: '#ffffff', 
                        marginBottom: '8px' 
                      }}>
                        Email
                      </label>
                      <input 
                        type="email" 
                        placeholder="Enter your email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        style={{ 
                          width: '100%', 
                          padding: '12px 15px', 
                          border: '1px solid rgba(255, 255, 255, 0.3)', 
                          borderRadius: '8px', 
                          backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                          color: '#ffffff', 
                          fontFamily: 'Helvetica, Arial, sans-serif', 
                          fontSize: '14px', 
                          outline: 'none' 
                        }} 
                      />
                    </div>

                    {/* PASSWORD INPUT */}
                    <div>
                      <label style={{ 
                        display: 'block', 
                        fontFamily: 'Helvetica, Arial, sans-serif', 
                        fontSize: '14px', 
                        fontWeight: '500', 
                        color: '#ffffff', 
                        marginBottom: '8px' 
                      }}>
                        Password
                      </label>
                      <div style={{ position: 'relative', width: '100%' }}>
                        <input 
                          type={showPassword ? "text" : "password"} 
                          placeholder="Enter your password" 
                          value={password} 
                          onChange={(e) => setPassword(e.target.value)} 
                          required 
                          style={{ 
                            width: '100%', 
                            padding: '12px 15px', 
                            paddingRight: '45px', 
                            border: '1px solid rgba(255, 255, 255, 0.3)', 
                            borderRadius: '8px', 
                            backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                            color: '#ffffff', 
                            fontFamily: 'Helvetica, Arial, sans-serif', 
                            fontSize: '14px', 
                            outline: 'none' 
                          }} 
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPassword(!showPassword)} 
                          style={{ 
                            position: 'absolute', 
                            right: '12px', 
                            top: '50%', 
                            transform: 'translateY(-50%)', 
                            background: 'none', 
                            border: 'none', 
                            cursor: 'pointer', 
                            padding: '5px' 
                          }}
                        >
                          {showPassword ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="rgba(255,255,255,0.6)">
                              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" fill="rgba(255,255,255,0.6)"/>
                            </svg>
                          ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="rgba(255,255,255,0.6)">
                              <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27z" fill="rgba(255,255,255,0.6)"/>
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* REMEMBER ME CHECKBOX */}
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                      <input 
                        type="checkbox" 
                        id="rememberMe" 
                        checked={rememberMe} 
                        onChange={(e) => setRememberMe(e.target.checked)} 
                        style={{ marginRight: '8px', width: '16px', height: '16px' }} 
                      />
                      <label htmlFor="rememberMe" style={{ 
                        color: 'rgba(255, 255, 255, 0.8)', 
                        fontSize: '13px', 
                        cursor: 'pointer', 
                        fontFamily: 'Helvetica, Arial, sans-serif' 
                      }}>
                        Ingat saya dan simpan untuk login otomatis
                      </label>
                    </div>

                    {/* SUBMIT BUTTON */}
                    <button 
                      type="submit" 
                      disabled={loading || autoLoginInProgress} 
                      style={{ 
                        width: '100%', 
                        padding: '14px', 
                        border: 'none', 
                        borderRadius: '8px', 
                        backgroundColor: (loading || autoLoginInProgress) ? 'rgba(255, 255, 255, 0.5)' : '#ffffff', 
                        color: '#000000', 
                        fontFamily: 'Helvetica, Arial, sans-serif', 
                        fontSize: isMobile ? '14px' : '16px', 
                        fontWeight: '600', 
                        cursor: (loading || autoLoginInProgress) ? 'not-allowed' : 'pointer', 
                        transition: 'all 0.3s ease', 
                        marginTop: '10px' 
                      }}
                    >
                      {loading ? 'Signing In...' : autoLoginInProgress ? 'Auto Login...' : 'Sign In'}
                    </button>
                  </div>
                </form>

                {/* AKUN TERSIMPAN */}
                {getLocalLoginHistory().length > 0 && (
                  <button 
                    onClick={() => setShowAutoLoginModal(true)} 
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                      border: '1px solid rgba(255, 255, 255, 0.2)', 
                      borderRadius: '8px', 
                      color: 'rgba(255, 255, 255, 0.8)', 
                      cursor: 'pointer', 
                      fontSize: '14px', 
                      marginBottom: '20px', 
                      transition: 'all 0.3s ease', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '8px', 
                      fontFamily: 'Helvetica, Arial, sans-serif' 
                    }}
                  >
                    <span>👤</span>
                    Lihat {getLocalLoginHistory().length} Akun Tersimpan
                  </button>
                )}

                {/* FORGOT PASSWORD & SIGN UP */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%' }}>
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: isMobile ? 'column' : 'row', 
                    justifyContent: isMobile ? 'center' : 'space-between', 
                    alignItems: 'center', 
                    gap: isMobile ? '15px' : '0', 
                    fontFamily: 'Helvetica, Arial, sans-serif', 
                    fontSize: '14px' 
                  }}>
                    <button 
                      onClick={handleForgotPassword} 
                      style={{ 
                        border: 'none', 
                        background: 'none', 
                        color: '#ffffff', 
                        cursor: 'pointer', 
                        textDecoration: 'underline', 
                        opacity: '0.8', 
                        transition: 'all 0.3s ease', 
                        fontFamily: 'Helvetica, Arial, sans-serif', 
                        fontSize: isMobile ? '13px' : '14px' 
                      }}
                    >
                      Forgot your password?
                    </button>
                    <div>
                      <span style={{ 
                        color: '#ffffff', 
                        opacity: '0.8', 
                        fontSize: isMobile ? '13px' : '14px', 
                        fontFamily: 'Helvetica, Arial, sans-serif' 
                      }}>
                        Don't have an account?{' '}
                      </span>
                      <button 
                        onClick={handleSignUp} 
                        style={{ 
                          border: 'none', 
                          background: 'none', 
                          color: '#ffffff', 
                          cursor: 'pointer', 
                          textDecoration: 'underline', 
                          fontWeight: '600', 
                          transition: 'all 0.3s ease', 
                          fontFamily: 'Helvetica, Arial, sans-serif', 
                          fontSize: isMobile ? '13px' : '14px' 
                        }}
                      >
                        Sign up
                      </button>
                    </div>
                  </div>

                  {/* KEBIJAKAN PRIVASI & KETENTUAN KAMI */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: isMobile ? 'center' : 'flex-start', 
                    gap: isMobile ? '20px' : '30px', 
                    marginTop: '5px' 
                  }}>
                    <Link href="#" style={{ 
                      color: 'rgba(255, 255, 255, 0.7)', 
                      fontSize: isMobile ? '0.8rem' : '0.9rem', 
                      fontFamily: 'Helvetica, Arial, sans-serif', 
                      textDecoration: 'underline', 
                      textUnderlineOffset: '3px', 
                      opacity: 0.8, 
                      transition: 'opacity 0.2s ease', 
                      letterSpacing: '0.5px' 
                    }}>
                      KEBIJAKAN PRIVASI
                    </Link>
                    <Link href="#" style={{ 
                      color: 'rgba(255, 255, 255, 0.7)', 
                      fontSize: isMobile ? '0.8rem' : '0.9rem', 
                      fontFamily: 'Helvetica, Arial, sans-serif', 
                      textDecoration: 'underline', 
                      textUnderlineOffset: '3px', 
                      opacity: 0.8, 
                      transition: 'opacity 0.2s ease', 
                      letterSpacing: '0.5px' 
                    }}>
                      KETENTUAN KAMI
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* LETS JOIN US NOTE THINK */}
        <div style={{ 
          position: 'relative', 
          textAlign: isMobile ? 'center' : 'left', 
          marginTop: isMobile ? '2rem' : '4rem', 
          width: '100%', 
          maxWidth: isMobile ? '100%' : '1200px', 
          padding: isMobile ? '1rem' : '2rem', 
          marginLeft: isMobile ? '0' : '2rem', 
          marginBottom: isMobile ? '1rem' : '2rem' 
        }}>
          <div style={{ 
            marginBottom: isMobile ? '2rem' : '4rem', 
            padding: isMobile ? '0 1rem' : '0' 
          }}>
            <p style={{ 
              color: 'rgba(255,255,255,0.9)', 
              fontSize: isMobile ? '2.5rem' : '5rem', 
              fontFamily: 'Helvetica, Arial, sans-serif', 
              margin: '0 0 0.3rem 0', 
              lineHeight: '1.1', 
              fontWeight: '600' 
            }}>
              LETS JOIN US
            </p>
            <p style={{ 
              color: 'rgba(255,255,255,0.9)', 
              fontSize: isMobile ? '2.5rem' : '5rem', 
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
            gap: isMobile ? '2rem 3rem' : '2rem 8rem', 
            marginTop: '0rem', 
            padding: isMobile ? '0 1rem' : '0', 
            justifyContent: isMobile ? 'center' : 'flex-start' 
          }}>
            <div>
              <h4 style={{ 
                color: 'white', 
                fontSize: isMobile ? '1.8rem' : '4rem', 
                fontWeight: '600', 
                margin: '0 0 0.5rem 0', 
                marginBottom: isMobile ? '3rem' : '5rem', 
                fontFamily: 'Helvetica, Arial, sans-serif' 
              }}>
                MENU
              </h4>
            </div>
            <div>
              <h4 style={{ 
                color: 'white', 
                fontSize: isMobile ? '1.8rem' : '4rem', 
                fontWeight: '600', 
                margin: '0 0 0.5rem 0', 
                marginBottom: isMobile ? '3rem' : '5rem', 
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
                fontSize: isMobile ? '1.8rem' : '4rem', 
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
                fontSize: isMobile ? '1.8rem' : '4rem', 
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
                fontSize: isMobile ? '1.8rem' : '4rem', 
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
      `}</style>
    </>
  );
}
