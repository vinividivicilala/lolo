'use client';

import React, { useState, useEffect, useRef } from "react";
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
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";

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

// Provider untuk berbagai platform
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

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

// Komponen Connection dengan animasi minimalis
const ConnectionMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  
  const socialLinks = [
    { name: "GitHub", url: "https://github.com" },
    { name: "Instagram", url: "https://instagram.com" },
    { name: "Twitter", url: "https://twitter.com" },
    { name: "Quora", url: "https://quora.com" },
    { name: "YouTube", url: "https://youtube.com" }
  ];

  useEffect(() => {
    if (isOpen && menuRef.current) {
      gsap.fromTo(
        menuRef.current,
        { 
          opacity: 0,
          scale: 0.95,
          y: 10
        },
        { 
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.3,
          ease: "power2.out"
        }
      );
    }
  }, [isOpen]);

  return (
    <div style={{
      position: 'relative',
      display: 'inline-block',
    }}>
      {/* Teks CONNECT minimalis */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          cursor: 'pointer',
          position: 'relative',
        }}
      >
        <motion.h4 
          className="connect-text"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            color: 'white',
            fontSize: '4rem',
            fontWeight: '600',
            margin: '0 0 0.5rem 0',
            fontFamily: 'Arame Mono, monospace',
          }}
        >
          CONNECT
        </motion.h4>
      </div>

      {/* Menu Social Media minimalis */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              top: '100%',
              left: '0',
              backgroundColor: 'rgba(0, 0, 0, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              padding: '20px',
              minWidth: '180px',
              zIndex: 1000,
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}>
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 5 }}
                  style={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    textDecoration: 'none',
                    fontSize: '16px',
                    fontFamily: 'Arame Mono, monospace',
                    fontWeight: '500',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)';
                  }}
                >
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <span style={{
                      fontSize: '12px',
                      opacity: 0.7,
                    }}>↘</span>
                    {social.name}
                  </span>
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function SignInPage({ onClose, onSwitchToSignUp, onSwitchToForgotPassword }: any) {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState("");
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [showAutoLoginModal, setShowAutoLoginModal] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [autoLoginInProgress, setAutoLoginInProgress] = useState(false);

  // Fungsi untuk menyimpan login history ke Firestore
  const saveLoginHistory = async (userData: any, provider: string, userPassword?: string) => {
    try {
      const historyRef = doc(db, "loginHistory", userData.uid);
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

  // Fungsi untuk mengambil login history dari Firestore
  const fetchLoginHistory = async () => {
    try {
      const historyRef = collection(db, "loginHistory");
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

  // Fungsi untuk mengambil login history dari localStorage
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

  // Cek apakah ada user yang tersimpan untuk auto-login
  useEffect(() => {
    const checkSavedUser = async () => {
      setTimeout(async () => {
        const currentUser = auth.currentUser;
        
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
  }, []);

  // Mendengarkan perubahan status autentikasi
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser: any) => {
      setUser(currentUser);
      if (currentUser) {
        console.log("User logged in:", currentUser.email);
        setShowAutoLoginModal(false);
        setEmail("");
        setPassword("");
        router.push('/notes');
      }
    });

    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
      unsubscribe();
    };
  }, [router]);

  // Fungsi untuk menyimpan user ke localStorage
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

  // Fungsi untuk menghapus user dari localStorage
  const removeUserFromLocalStorage = (uid: string) => {
    try {
      const savedUsers = localStorage.getItem('savedLoginUsers');
      if (savedUsers) {
        let users = JSON.parse(savedUsers);
        users = users.filter((u: any) => u.uid !== uid);
        localStorage.setItem('savedLoginUsers', JSON.stringify(users));
        
        setLoginHistory(users);
        
        deleteDoc(doc(db, "loginHistory", uid)).catch(() => {
          console.log("User not found in Firestore");
        });
      }
    } catch (error) {
      console.error("Error removing user:", error);
    }
  };

  // Login dengan Google
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    setShowAutoLoginModal(false);
    try {
      googleProvider.addScope('profile');
      googleProvider.addScope('email');
      
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      console.log("Google login successful:", user);
      await saveLoginHistory(user, 'google');
      
    } catch (error: any) {
      console.error("Google login error:", error);
      setError(error.message || "Login dengan Google gagal");
      
      if (error.code === 'auth/popup-closed-by-user') {
        setError("Popup login ditutup. Silakan coba lagi.");
      } else if (error.code === 'auth/popup-blocked') {
        setError("Popup diblokir oleh browser. Izinkan popup untuk situs ini.");
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        setError("Akun sudah terdaftar dengan metode login yang berbeda. Coba login dengan metode lain.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Login dengan GitHub
  const handleGitHubLogin = async () => {
    setLoading(true);
    setError("");
    setShowAutoLoginModal(false);
    try {
      githubProvider.addScope('repo');
      githubProvider.addScope('user');
      
      const result = await signInWithPopup(auth, githubProvider);
      const user = result.user;
      
      console.log("GitHub login successful:", user);
      await saveLoginHistory(user, 'github');
      
    } catch (error: any) {
      console.error("GitHub login error:", error);
      setError(error.message || "Login dengan GitHub gagal");
      
      if (error.code === 'auth/popup-closed-by-user') {
        setError("Popup login ditutup. Silakan coba lagi.");
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        setError("Akun sudah terdaftar dengan metode login yang berbeda. Coba login dengan metode lain.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Login dengan email/password
  const handleEmailLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    setLoading(true);
    setError("");
    setShowAutoLoginModal(false);
    
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
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

  // Login dengan user yang sudah tersimpan
  const handleQuickLogin = async (savedUser: LocalUser) => {
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
              const result = await signInWithEmailAndPassword(auth, savedUser.email, savedUser.password!);
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
            if (passwordInput) {
              passwordInput.focus();
            }
          }, 50);
        }
      } 
      else if (savedUser.provider === 'google') {
        await handleGoogleLogin();
      } 
      else if (savedUser.provider === 'github') {
        await handleGitHubLogin();
      }
      
    } catch (error) {
      console.error("Quick login error:", error);
      setError("Gagal login dengan akun yang disimpan");
      setAutoLoginInProgress(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
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

  // Komponen Modal Auto Login minimalis
  const AutoLoginModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(5px)',
      }}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 20 }}
        style={{
          backgroundColor: 'rgba(20, 20, 20, 0.95)',
          borderRadius: '15px',
          padding: '25px',
          width: isMobile ? '90%' : '380px',
          maxWidth: '450px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 15px 50px rgba(0, 0, 0, 0.5)',
          position: 'relative',
        }}
      >
        <h2 style={{
          color: 'white',
          fontSize: '20px',
          fontWeight: 'bold',
          marginBottom: '15px',
          textAlign: 'center',
          fontFamily: "'Roboto', sans-serif",
        }}>
          Pilih Akun untuk Login
        </h2>
        
        <p style={{
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '13px',
          marginBottom: '20px',
          textAlign: 'center',
        }}>
          Klik akun untuk login otomatis
        </p>
        
        {/* Daftar User yang Tersimpan */}
        <div style={{
          maxHeight: '250px',
          overflowY: 'auto',
          marginBottom: '20px',
        }}>
          {loginHistory.length === 0 ? (
            <div style={{
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.5)',
              padding: '20px',
            }}>
              Tidak ada akun yang tersimpan
            </div>
          ) : (
            loginHistory.map((user) => (
              <motion.div
                key={user.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleQuickLogin(user as LocalUser)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px',
                  marginBottom: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <img 
                  src={user.photoURL} 
                  alt={user.displayName}
                  style={{
                    width: '35px',
                    height: '35px',
                    borderRadius: '50%',
                    marginRight: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{
                    color: 'white',
                    fontWeight: '500',
                    fontSize: '14px',
                    marginBottom: '3px',
                  }}>
                    {user.displayName}
                  </div>
                  <div style={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '11px',
                  }}>
                    {user.email}
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
                    color: 'rgba(255, 255, 255, 0.4)',
                    cursor: 'pointer',
                    padding: '4px',
                    fontSize: '18px',
                    width: '25px',
                    height: '25px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)';
                  }}
                  title="Hapus dari daftar"
                >
                  ×
                </button>
              </motion.div>
            ))
          )}
        </div>
        
        {/* Tautan Kebijakan dan Ketentuan dalam modal - MINIMALIS */}
        <div style={{
          marginBottom: '15px',
        }}>
          <p style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '12px',
            marginBottom: '8px',
            textAlign: 'center',
          }}>
            Kebijakan dan Ketentuan
          </p>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}>
            <motion.a
              href="/privacy-policy"
              whileHover={{ x: 3 }}
              style={{
                color: 'rgba(255, 255, 255, 0.8)',
                textDecoration: 'none',
                fontSize: '12px',
                padding: '4px 8px',
                borderRadius: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
              }}
            >
              <span style={{ fontSize: '12px' }}>→</span>
              Privacy Policy
            </motion.a>
            
            <motion.a
              href="/terms-of-service"
              whileHover={{ x: 3 }}
              style={{
                color: 'rgba(255, 255, 255, 0.8)',
                textDecoration: 'none',
                fontSize: '12px',
                padding: '4px 8px',
                borderRadius: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
              }}
            >
              <span style={{ fontSize: '12px' }}>→</span>
              Terms of Service
            </motion.a>
            
            <motion.a
              href="/cookie-policy"
              whileHover={{ x: 3 }}
              style={{
                color: 'rgba(255, 255, 255, 0.8)',
                textDecoration: 'none',
                fontSize: '12px',
                padding: '4px 8px',
                borderRadius: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
              }}
            >
              <span style={{ fontSize: '12px' }}>→</span>
              Cookie Policy
            </motion.a>
            
            <motion.a
              href="/community-guidelines"
              whileHover={{ x: 3 }}
              style={{
                color: 'rgba(255, 255, 255, 0.8)',
                textDecoration: 'none',
                fontSize: '12px',
                padding: '4px 8px',
                borderRadius: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
              }}
            >
              <span style={{ fontSize: '12px' }}>→</span>
              Community Guidelines
            </motion.a>
          </div>
        </div>
        
        {/* Tombol Login dengan Metode Lain */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          <motion.button
            onClick={() => setShowAutoLoginModal(false)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '13px',
              transition: 'all 0.2s ease',
            }}
          >
            Gunakan Akun Lain
          </motion.button>
          
          <motion.button
            onClick={() => setShowAutoLoginModal(false)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              color: 'rgba(255, 255, 255, 0.6)',
              cursor: 'pointer',
              fontSize: '13px',
              transition: 'all 0.2s ease',
            }}
          >
            Batal
          </motion.button>
        </div>
        
        <div style={{
          marginTop: '15px',
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.4)',
          fontSize: '11px',
        }}>
          Akun disimpan secara lokal di browser Anda
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <>
      <AnimatePresence>
        {showAutoLoginModal && !user && <AutoLoginModal />}
      </AnimatePresence>
      
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: isMobile ? 'flex-start' : 'center',
          alignItems: 'center',
          padding: isMobile ? '20px 15px' : '40px 20px',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* Main Sign In Container */}
        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'center' : 'flex-start',
            gap: isMobile ? '30px' : '60px',
            marginBottom: isMobile ? '30px' : '40px',
            width: '100%',
            maxWidth: isMobile ? '100%' : '1200px',
          }}
        >
          {/* Container Foto dan Kebijakan */}
          {!isMobile && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: '500px',
              }}
            >
              {/* Foto Portrait */}
              <div
                style={{
                  width: '100%',
                  height: '500px',
                  backgroundImage: 'url(/images/5.jpg)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  borderRadius: '20px 20px 0 0',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                }}
              />
              
              {/* Container Kebijakan dan Ketentuan - MINIMALIS */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{
                  backgroundColor: 'rgba(20, 20, 20, 0.9)',
                  padding: '25px',
                  borderRadius: '0 0 20px 20px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderTop: 'none',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                }}
              >
                {/* Teks Kebijakan */}
                <p
                  style={{
                    color: 'rgba(255, 255, 255, 0.95)',
                    fontSize: '22px',
                    lineHeight: '1.4',
                    marginBottom: '15px',
                    fontFamily: 'Arame Mono, monospace',
                    textAlign: 'left',
                    fontWeight: '600',
                  }}
                >
                  POLICY & TERMS
                </p>
                
                <p
                  style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    marginBottom: '20px',
                    fontFamily: 'Arame Mono, monospace',
                    textAlign: 'left',
                  }}
                >
                  By continuing, you agree to our Privacy Policy and Terms of Service.
                </p>
                
                {/* Tautan Kebijakan dan Ketentuan - MINIMALIS tanpa border */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <motion.a
                    href="/privacy-policy"
                    whileHover={{ x: 5 }}
                    style={{
                      color: 'rgba(255,255,255,0.9)',
                      textDecoration: 'none',
                      fontSize: '15px',
                      fontFamily: 'Arame Mono, monospace',
                      transition: 'all 0.2s ease',
                      padding: '6px 0',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span style={{ fontSize: '14px' }}>→</span>
                    Privacy Policy
                  </motion.a>
                  
                  <motion.a
                    href="/terms-of-service"
                    whileHover={{ x: 5 }}
                    style={{
                      color: 'rgba(255,255,255,0.9)',
                      textDecoration: 'none',
                      fontSize: '15px',
                      fontFamily: 'Arame Mono, monospace',
                      transition: 'all 0.2s ease',
                      padding: '6px 0',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span style={{ fontSize: '14px' }}>→</span>
                    Terms of Service
                  </motion.a>
                  
                  <motion.a
                    href="/cookie-policy"
                    whileHover={{ x: 5 }}
                    style={{
                      color: 'rgba(255,255,255,0.9)',
                      textDecoration: 'none',
                      fontSize: '15px',
                      fontFamily: 'Arame Mono, monospace',
                      transition: 'all 0.2s ease',
                      padding: '6px 0',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span style={{ fontSize: '14px' }}>→</span>
                    Cookie Policy
                  </motion.a>
                  
                  <motion.a
                    href="/community-guidelines"
                    whileHover={{ x: 5 }}
                    style={{
                      color: 'rgba(255,255,255,0.9)',
                      textDecoration: 'none',
                      fontSize: '15px',
                      fontFamily: 'Arame Mono, monospace',
                      transition: 'all 0.2s ease',
                      padding: '6px 0',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span style={{ fontSize: '14px' }}>→</span>
                    Community Guidelines
                  </motion.a>
                </div>
                
                {/* Hak Cipta */}
                <div style={{
                  marginTop: '25px',
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '12px',
                  fontFamily: 'Arame Mono, monospace',
                  textAlign: 'left',
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                  paddingTop: '15px',
                }}>
                  © {new Date().getFullYear()} NoteThink. All rights reserved.
                </div>
              </motion.div>
            </div>
          )}

          {/* Container Teks dan Login Options */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              marginTop: isMobile ? '0' : '40px',
              width: isMobile ? '100%' : 'auto',
              maxWidth: isMobile ? '400px' : 'none',
            }}
          >
            {/* Teks Welcome */}
            <div style={{ 
              marginBottom: isMobile ? '30px' : '40px',
              textAlign: isMobile ? 'center' : 'left'
            }}>
              <h1
                style={{
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: isMobile ? '32px' : '48px',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  marginBottom: '15px',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                }}
              >
                {user ? `Welcome, ${user.displayName || user.email}` : 'Welcome back'}
              </h1>
              <p
                style={{
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: isMobile ? '16px' : '18px',
                  color: '#ffffff',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                }}
              >
                {user ? 'You are signed in' : 'Sign in to your account to continue'}
              </p>
              
              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    backgroundColor: 'rgba(255, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 0, 0, 0.2)',
                    borderRadius: '8px',
                    padding: '12px',
                    marginTop: '15px',
                    color: '#ff6b6b',
                    fontSize: '14px',
                  }}
                >
                  {error}
                </motion.div>
              )}
              
              {/* Auto Login Progress Indicator */}
              {autoLoginInProgress && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    backgroundColor: 'rgba(0, 255, 0, 0.1)',
                    border: '1px solid rgba(0, 255, 0, 0.2)',
                    borderRadius: '8px',
                    padding: '12px',
                    marginTop: '15px',
                    color: '#00ff00',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid #00ff00',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  <span>Melakukan login otomatis...</span>
                </motion.div>
              )}
              
              {/* Logout Button (if logged in) */}
              {user && (
                <motion.button
                  onClick={handleLogout}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    marginTop: '20px',
                    padding: '10px 20px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                >
                  Sign Out
                </motion.button>
              )}
            </div>

            {/* Social Login Options */}
            {!user && (
              <>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px',
                    marginBottom: '30px',
                  }}
                >
                  {/* Google Login */}
                  <motion.div
                    onClick={handleGoogleLogin}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '15px 20px',
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      backdropFilter: 'blur(10px)',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.7 : 1,
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" style={{ marginRight: '12px' }}>
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span style={{ 
                      fontFamily: "'Roboto', sans-serif",
                      fontSize: isMobile ? '14px' : '16px', 
                      color: '#ffffff',
                      fontWeight: '500',
                    }}>
                      {loading ? 'Loading...' : 'Continue with Google'}
                    </span>
                  </motion.div>

                  {/* GitHub Login */}
                  <motion.div
                    onClick={handleGitHubLogin}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '15px 20px',
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      backdropFilter: 'blur(10px)',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.7 : 1,
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" style={{ marginRight: '12px' }}>
                      <path fill="#ffffff" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                    </svg>
                    <span style={{ 
                      fontFamily: "'Roboto', sans-serif",
                      fontSize: isMobile ? '14px' : '16px', 
                      color: '#ffffff',
                      fontWeight: '500',
                    }}>
                      {loading ? 'Loading...' : 'Continue with GitHub'}
                    </span>
                  </motion.div>
                </div>

                {/* Email dan Password Form */}
                <form onSubmit={(e) => handleEmailLogin(e)}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '15px',
                      padding: isMobile ? '20px' : '22px',
                      border: '2px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      backdropFilter: 'blur(10px)',
                      marginBottom: '20px',
                    }}
                  >
                    {/* Email Input */}
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontFamily: "'Roboto', sans-serif",
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#ffffff',
                          marginBottom: '8px',
                        }}
                      >
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
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          color: '#ffffff',
                          fontFamily: "'Roboto', sans-serif",
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'all 0.2s ease',
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                          e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                          e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                        }}
                      />
                    </div>

                    {/* Password Input */}
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontFamily: "'Roboto', sans-serif",
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#ffffff',
                          marginBottom: '8px',
                        }}
                      >
                        Password
                      </label>
                      <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{
                          width: '100%',
                          padding: '12px 15px',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          color: '#ffffff',
                          fontFamily: "'Roboto', sans-serif",
                          fontSize: '14px',
                          outline: 'none',
                          transition: 'all 0.2s ease',
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                          e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                          e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                        }}
                      />
                    </div>

                    {/* Remember Me Checkbox */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginTop: '5px',
                    }}>
                      <input
                        type="checkbox"
                        id="rememberMe"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        style={{
                          marginRight: '8px',
                          width: '16px',
                          height: '16px',
                          accentColor: 'rgba(255, 255, 255, 0.8)',
                        }}
                      />
                      <label
                        htmlFor="rememberMe"
                        style={{
                          color: 'rgba(255, 255, 255, 0.8)',
                          fontSize: '13px',
                          cursor: 'pointer',
                        }}
                      >
                        Ingat saya dan simpan untuk login otomatis
                      </label>
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      disabled={loading || autoLoginInProgress}
                      whileHover={!loading && !autoLoginInProgress ? { scale: 1.02 } : {}}
                      whileTap={!loading && !autoLoginInProgress ? { scale: 0.98 } : {}}
                      style={{
                        width: '100%',
                        padding: '14px',
                        border: 'none',
                        borderRadius: '8px',
                        backgroundColor: (loading || autoLoginInProgress) ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.9)',
                        color: '#000000',
                        fontFamily: "'Roboto', sans-serif",
                        fontSize: isMobile ? '14px' : '16px',
                        fontWeight: '600',
                        cursor: (loading || autoLoginInProgress) ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        marginTop: '5px',
                      }}
                    >
                      {loading ? 'Signing In...' : autoLoginInProgress ? 'Auto Login...' : 'Sign In'}
                    </motion.button>
                  </motion.div>
                </form>

                {/* Tombol Lihat Akun Tersimpan */}
                {getLocalLoginHistory().length > 0 && (
                  <motion.button
                    onClick={() => setShowAutoLoginModal(true)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      width: '100%',
                      padding: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: 'rgba(255, 255, 255, 0.8)',
                      cursor: 'pointer',
                      fontSize: '14px',
                      marginBottom: '20px',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    <span>👤</span>
                    Lihat {getLocalLoginHistory().length} Akun Tersimpan
                  </motion.button>
                )}

                {/* Footer Links */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    justifyContent: isMobile ? 'center' : 'space-between',
                    alignItems: isMobile ? 'center' : 'center',
                    gap: isMobile ? '15px' : '0',
                    fontFamily: "'Roboto', sans-serif",
                    fontSize: '14px',
                  }}
                >
                  {/* Lupa Password Link */}
                  <motion.button
                    onClick={handleForgotPassword}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      border: 'none',
                      background: 'none',
                      color: '#ffffff',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      opacity: '0.8',
                      fontFamily: "'Roboto', sans-serif",
                      fontSize: isMobile ? '13px' : '14px',
                    }}
                  >
                    Forgot your password?
                  </motion.button>

                  {/* Sign Up Link */}
                  <div>
                    <span style={{ color: '#ffffff', opacity: '0.8', fontSize: isMobile ? '13px' : '14px' }}>
                      Don't have an account?{' '}
                    </span>
                    <motion.button
                      onClick={handleSignUp}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        border: 'none',
                        background: 'none',
                        color: '#ffffff',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        fontWeight: '600',
                        fontFamily: "'Roboto', sans-serif",
                        fontSize: isMobile ? '13px' : '14px',
                      }}
                    >
                      Sign up
                    </motion.button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Teks LETS JOIN US NOTE THINK dan kelompok di bawah */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            position: 'relative',
            textAlign: isMobile ? 'center' : 'left',
            marginTop: isMobile ? '2rem' : '4rem',
            width: '100%',
            maxWidth: isMobile ? '100%' : '1200px',
            padding: isMobile ? '1rem' : '2rem',
            marginLeft: isMobile ? '0' : '2rem',
            marginBottom: isMobile ? '1rem' : '2rem'
          }}
        >
          {/* Teks LETS JOIN US NOTE THINK 2 baris */}
          <div style={{ 
            marginBottom: isMobile ? '2rem' : '4rem',
            padding: isMobile ? '0 1rem' : '0'
          }}>
            <p style={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: isMobile ? '2.5rem' : '5rem',
              fontFamily: 'Arame Mono, monospace',
              margin: '0 0 0.3rem 0',
              lineHeight: '1.1',
              fontWeight: '600'
            }}>
              LETS JOIN US
            </p>
            <p style={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: isMobile ? '2.5rem' : '5rem',
              fontFamily: 'Arame Mono, monospace',
              margin: 0,
              lineHeight: '1.1',
              fontWeight: '600'
            }}>
              NOTE THINK.
            </p>
          </div>

          {/* 6 Kelompok Menu */}
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
                fontFamily: 'Arame Mono, monospace'
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
                fontFamily: 'Arame Mono, monospace'
              }}>
                PRODUCT
              </h4>
            </div>
            
            {/* Ganti CONNECT dengan komponen ConnectionMenu */}
            <div>
              <ConnectionMenu />
            </div>
            
            <div>
              <h4 style={{
                color: 'white',
                fontSize: isMobile ? '1.8rem' : '4rem',
                fontWeight: '600',
                margin: '0 0 0.5rem 0',
                marginBottom: isMobile ? '8rem' : '15rem',
                fontFamily: 'Arame Mono, monospace'
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
                fontFamily: 'Arame Mono, monospace'
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
                fontFamily: 'Arame Mono, monospace'
              }}>
                BLOG
              </h4>
            </div>
          </div>
        </motion.div>
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
