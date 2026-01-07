'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { initializeApp } from "firebase/app";
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
  where, 
  orderBy,
  limit,
  Timestamp,
  deleteDoc 
} from "firebase/firestore";

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

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Provider untuk berbagai platform
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

// Fungsi hash sederhana untuk password
const simpleHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString();
};

// Interface untuk user login history
interface LoginHistory {
  id: string;
  email: string;
  displayName: string;
  photoURL: string;
  provider: string;
  lastLogin: any;
  uid: string;
  passwordHash?: string;
  autoLoginEnabled?: boolean;
}

interface LocalUser extends LoginHistory {
  passwordHash?: string;
  autoLoginEnabled?: boolean;
}

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
  const [autoLoginAttempted, setAutoLoginAttempted] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Fungsi untuk menyimpan login history ke Firestore
  const saveLoginHistory = async (userData: any, provider: string, userPassword?: string) => {
    try {
      const historyRef = doc(db, "loginHistory", userData.uid);
      const passwordHash = userPassword ? simpleHash(userPassword) : null;
      
      const historyData = {
        id: userData.uid,
        email: userData.email,
        displayName: userData.displayName || userData.email?.split('@')[0],
        photoURL: userData.photoURL || `https://ui-avatars.com/api/?name=${userData.email}&background=random`,
        provider: provider,
        lastLogin: Timestamp.now(),
        uid: userData.uid,
        passwordHash: provider === 'email' ? passwordHash : null,
        autoLoginEnabled: provider === 'email' ? rememberMe : null
      };
      
      await setDoc(historyRef, historyData, { merge: true });
      console.log("Login history saved for:", userData.email);
      
      // Simpan ke localStorage juga
      saveUserToLocalStorage(historyData, userPassword);
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

  // Fungsi untuk mencoba auto-login dari localStorage
  const tryAutoLogin = async () => {
    if (autoLoginAttempted) return false;
    
    const savedUsers = getLocalLoginHistory();
    if (savedUsers.length === 0) return false;
    
    // Prioritaskan user dengan autoLoginEnabled terakhir login
    const sortedUsers = [...savedUsers]
      .sort((a, b) => new Date(b.lastLogin).getTime() - new Date(a.lastLogin).getTime());
    
    const autoLoginUser = sortedUsers.find(user => user.autoLoginEnabled);
    if (!autoLoginUser) return false;
    
    setAutoLoginAttempted(true);
    
    try {
      if (autoLoginUser.provider === 'email' && autoLoginUser.email) {
        // Cari user dengan password di localStorage
        const userWithPassword = savedUsers.find(u => 
          u.uid === autoLoginUser.uid && u.passwordHash
        );
        
        if (userWithPassword && userWithPassword.passwordHash) {
          console.log("Found saved user with password hash:", autoLoginUser.email);
          // Auto-fill email dan fokus ke password
          setEmail(autoLoginUser.email);
          setTimeout(() => {
            const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement;
            if (passwordInput) {
              passwordInput.focus();
              setError("Masukkan password untuk melanjutkan");
            }
          }, 100);
          return false;
        }
      } else if (autoLoginUser.provider === 'google') {
        // Langsung coba login dengan Google
        console.log("Attempting Google auto-login");
        await handleGoogleLogin();
        return true;
      } else if (autoLoginUser.provider === 'github') {
        // Langsung coba login dengan GitHub
        console.log("Attempting GitHub auto-login");
        await handleGitHubLogin();
        return true;
      }
    } catch (error) {
      console.error("Auto-login failed:", error);
      setShowAutoLoginModal(true);
    }
    
    return false;
  };

  // Cek apakah ada user yang tersimpan untuk auto-login
  useEffect(() => {
    const checkSavedUser = async () => {
      // Tunggu sebentar untuk memastikan Firebase auth sudah siap
      setTimeout(async () => {
        const currentUser = auth.currentUser;
        
        if (!currentUser) {
          // Coba auto-login terlebih dahulu
          const autoLoginSuccess = await tryAutoLogin();
          
          if (!autoLoginSuccess) {
            const localHistory = getLocalLoginHistory();
            if (localHistory.length > 0) {
              // Tampilkan modal pilih akun
              setShowAutoLoginModal(true);
              setLoginHistory(localHistory);
            }
            
            // Juga ambil dari Firestore jika ada
            try {
              await fetchLoginHistory();
            } catch (error) {
              console.error("Failed to fetch from Firestore:", error);
            }
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
        // Tutup modal jika sedang terbuka
        setShowAutoLoginModal(false);
        // Redirect langsung ke /notes
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
      
      // Cek apakah user sudah ada
      const existingIndex = users.findIndex((u: LocalUser) => u.uid === userData.uid);
      
      const userToSave: LocalUser = {
        uid: userData.uid,
        id: userData.id || userData.uid,
        email: userData.email,
        displayName: userData.displayName || userData.email?.split('@')[0],
        photoURL: userData.photoURL || `https://ui-avatars.com/api/?name=${userData.email}&background=random`,
        provider: userData.provider || 'email',
        lastLogin: userData.lastLogin || new Date().toISOString(),
        passwordHash: userData.passwordHash || (plainPassword ? simpleHash(plainPassword) : undefined) || 
                     (existingIndex >= 0 ? users[existingIndex].passwordHash : undefined),
        autoLoginEnabled: userData.autoLoginEnabled !== undefined ? userData.autoLoginEnabled : 
                         (existingIndex >= 0 ? users[existingIndex].autoLoginEnabled : true)
      };
      
      if (existingIndex >= 0) {
        // Update existing user
        users[existingIndex] = userToSave;
      } else {
        // Tambah user baru
        users.unshift(userToSave);
        
        // Batasi hanya 5 user terakhir
        if (users.length > 5) {
          users = users.slice(0, 5);
        }
      }
      
      localStorage.setItem('savedLoginUsers', JSON.stringify(users));
      
      // Update state login history
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
        
        // Update state
        setLoginHistory(users);
        
        // Juga hapus dari Firestore
        deleteDoc(doc(db, "loginHistory", uid)).catch(() => {
          console.log("User not found in Firestore");
        });
      }
    } catch (error) {
      console.error("Error removing user:", error);
    }
  };

  // Toggle auto-login untuk user
  const toggleAutoLogin = (uid: string, enable: boolean) => {
    try {
      const savedUsers = localStorage.getItem('savedLoginUsers');
      if (savedUsers) {
        let users: LocalUser[] = JSON.parse(savedUsers);
        const userIndex = users.findIndex(u => u.uid === uid);
        
        if (userIndex >= 0) {
          users[userIndex].autoLoginEnabled = enable;
          localStorage.setItem('savedLoginUsers', JSON.stringify(users));
          setLoginHistory(users);
        }
      }
    } catch (error) {
      console.error("Error toggling auto-login:", error);
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
      
      // Simpan history dengan auto-login enabled
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
      
      // Simpan history dengan auto-login enabled
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
  const handleEmailLogin = async (e?: React.FormEvent, userData?: any, userPassword?: string) => {
    if (e) e.preventDefault();
    
    const loginEmail = userData?.email || email;
    const loginPassword = userPassword || password;
    
    if (!loginEmail || !loginPassword) {
      setError("Email dan password diperlukan");
      return;
    }
    
    setLoading(true);
    setError("");
    setShowAutoLoginModal(false);
    
    try {
      const result = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      const user = result.user;
      
      console.log("Email login successful");
      
      // Simpan history dengan password hash dan auto-login enabled
      await saveLoginHistory(user, 'email', loginPassword);
      
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
    setLoading(true);
    
    try {
      // Untuk email login, kita otomatis isi form dan login jika ada password tersimpan
      if (savedUser.provider === 'email') {
        // Set email untuk form
        setEmail(savedUser.email);
        
        // Fokus ke password field
        setTimeout(() => {
          const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement;
          if (passwordInput) {
            passwordInput.focus();
          }
        }, 50);
        
        setShowAutoLoginModal(false);
        setError("Masukkan password untuk melanjutkan");
      } 
      // Untuk Google/GitHub, langsung login dengan popup
      else if (savedUser.provider === 'google') {
        setShowAutoLoginModal(false);
        await handleGoogleLogin();
        return;
      } 
      else if (savedUser.provider === 'github') {
        setShowAutoLoginModal(false);
        await handleGitHubLogin();
        return;
      }
      
    } catch (error) {
      console.error("Quick login error:", error);
      setError("Gagal login dengan akun yang disimpan");
      setShowAutoLoginModal(true);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk langsung login ketika user memilih akun dari modal
  const handleInstantLogin = async (savedUser: LocalUser) => {
    if (savedUser.provider === 'google') {
      await handleGoogleLogin();
    } else if (savedUser.provider === 'github') {
      await handleGitHubLogin();
    } else {
      // Untuk email, akan diproses oleh handleQuickLogin
      await handleQuickLogin(savedUser);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User logged out");
      // Tampilkan modal lagi setelah logout
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

  // Komponen Modal Auto Login
  const AutoLoginModal = () => (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(10px)',
    }}>
      <div style={{
        backgroundColor: 'rgba(20, 20, 20, 0.98)',
        borderRadius: '20px',
        padding: '30px',
        width: isMobile ? '90%' : '450px',
        maxWidth: '500px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.8)',
        animation: 'modalAppear 0.3s ease-out'
      }}>
        <h2 style={{
          color: 'white',
          fontSize: '26px',
          fontWeight: 'bold',
          marginBottom: '15px',
          textAlign: 'center',
          fontFamily: "'Roboto', sans-serif",
          background: 'linear-gradient(90deg, #fff, #aaa)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Pilih Akun untuk Login
        </h2>
        
        <p style={{
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '14px',
          marginBottom: '25px',
          textAlign: 'center',
          lineHeight: '1.5'
        }}>
          Klik akun untuk login otomatis. <br />
          Email: Password diisi otomatis • Google/GitHub: Login langsung
        </p>
        
        {/* Daftar User yang Tersimpan */}
        <div style={{
          maxHeight: '350px',
          overflowY: 'auto',
          marginBottom: '25px',
          paddingRight: '5px',
        }}>
          {loginHistory.length === 0 ? (
            <div style={{
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.5)',
              padding: '30px 20px',
              border: '2px dashed rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
            }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>👤</div>
              Tidak ada akun yang tersimpan
            </div>
          ) : (
            loginHistory.map((user) => (
              <div
                key={user.id}
                onClick={() => handleInstantLogin(user as LocalUser)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px',
                  marginBottom: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '15px',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: (user as LocalUser).autoLoginEnabled ? 
                    'linear-gradient(90deg, #00ff00, #00cc00)' : 
                    'linear-gradient(90deg, #666, #333)',
                }} />
                
                <img 
                  src={user.photoURL} 
                  alt={user.displayName}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    marginRight: '16px',
                    border: '3px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${user.displayName}&background=random&color=fff&size=48`;
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '16px',
                    marginBottom: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    {user.displayName}
                    {(user as LocalUser).autoLoginEnabled && (
                      <span style={{
                        fontSize: '10px',
                        backgroundColor: 'rgba(0, 255, 0, 0.15)',
                        color: '#00ff00',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontWeight: 'bold',
                        border: '1px solid rgba(0, 255, 0, 0.3)',
                      }}>
                        AUTO
                      </span>
                    )}
                    <span style={{
                      fontSize: '10px',
                      backgroundColor: user.provider === 'google' ? 'rgba(66, 133, 244, 0.15)' : 
                                     user.provider === 'github' ? 'rgba(24, 23, 23, 0.15)' : 
                                     'rgba(100, 100, 255, 0.15)',
                      color: user.provider === 'google' ? '#4285F4' : 
                             user.provider === 'github' ? '#ffffff' : '#6495ff',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      textTransform: 'uppercase',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}>
                      {user.provider}
                    </span>
                  </div>
                  <div style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '13px',
                    marginBottom: '4px',
                    wordBreak: 'break-all',
                  }}>
                    {user.email}
                  </div>
                  <div style={{
                    color: 'rgba(255, 255, 255, 0.4)',
                    fontSize: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <span>Terakhir login</span>
                    <span>•</span>
                    <span>Klik untuk login</span>
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  marginLeft: '10px',
                }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeUserFromLocalStorage(user.uid);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255, 100, 100, 0.7)',
                      cursor: 'pointer',
                      padding: '6px',
                      fontSize: '18px',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)';
                      e.currentTarget.style.transform = 'rotate(90deg)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'rgba(255, 100, 100, 0.7)';
                      e.currentTarget.style.transform = 'rotate(0deg)';
                    }}
                    title="Hapus dari daftar"
                  >
                    ×
                  </button>
                  
                  {/* Toggle Auto Login */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleAutoLogin(user.uid, !(user as LocalUser).autoLoginEnabled);
                    }}
                    style={{
                      background: (user as LocalUser).autoLoginEnabled ? 
                        'rgba(0, 255, 0, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid',
                      borderColor: (user as LocalUser).autoLoginEnabled ? 
                        'rgba(0, 255, 0, 0.3)' : 'rgba(255, 255, 255, 0.2)',
                      color: (user as LocalUser).autoLoginEnabled ? '#00ff00' : 'rgba(255, 255, 255, 0.5)',
                      cursor: 'pointer',
                      padding: '6px',
                      fontSize: '14px',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!(user as LocalUser).autoLoginEnabled) {
                        e.currentTarget.style.backgroundColor = 'rgba(0, 255, 0, 0.15)';
                        e.currentTarget.style.borderColor = 'rgba(0, 255, 0, 0.4)';
                        e.currentTarget.style.color = '#00ff00';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!(user as LocalUser).autoLoginEnabled) {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
                      }
                    }}
                    title={(user as LocalUser).autoLoginEnabled ? 
                      "Nonaktifkan auto-login" : "Aktifkan auto-login"}
                  >
                    ⚡
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Tombol Login dengan Metode Lain */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          <button
            onClick={() => {
              setShowAutoLoginModal(false);
            }}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '10px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              letterSpacing: '0.5px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Login dengan Akun Lain
          </button>
          
          <div style={{
            display: 'flex',
            gap: '12px',
          }}>
            <button
              onClick={() => {
                setShowAutoLoginModal(false);
                handleSignUp();
              }}
              style={{
                flex: 1,
                padding: '14px',
                backgroundColor: 'transparent',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '10px',
                color: 'rgba(255, 255, 255, 0.8)',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.95)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Buat Akun Baru
            </button>
            
            <button
              onClick={() => setShowAutoLoginModal(false)}
              style={{
                flex: 1,
                padding: '14px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '2px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                color: 'rgba(255, 255, 255, 0.6)',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
              }}
            >
              Nanti Saja
            </button>
          </div>
        </div>
        
        <div style={{
          marginTop: '20px',
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.4)',
          fontSize: '11px',
          lineHeight: '1.5',
          paddingTop: '15px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          <div>✅ Akun disimpan secara lokal di browser Anda</div>
          <div style={{ marginTop: '3px' }}>
            🔒 Data login aman dengan enkripsi lokal
          </div>
          <div style={{ marginTop: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span>⚡ Google/GitHub: Login otomatis</span>
            <span>•</span>
            <span>📧 Email: Password diisi otomatis</span>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes modalAppear {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        ::-webkit-scrollbar {
          width: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );

  // Tampilkan password manager suggestion
  useEffect(() => {
    if (email && !password) {
      // Cari password yang tersimpan untuk email ini
      const localUsers = getLocalLoginHistory();
      const userWithPassword = localUsers.find(u => 
        u.email === email && u.passwordHash
      );
      
      if (userWithPassword) {
        // Tampilkan saran untuk mengisi password
        console.log("Password tersimpan untuk email ini");
      }
    }
  }, [email, password]);

  // Auto-focus password field ketika email diisi dari modal
  useEffect(() => {
    if (email && showAutoLoginModal === false) {
      const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement;
      if (passwordInput && !password) {
        setTimeout(() => {
          passwordInput.focus();
        }, 100);
      }
    }
  }, [email, showAutoLoginModal, password]);

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
          fontFamily: "'Inter', sans-serif",
          position: 'relative',
          overflowX: 'hidden',
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
          {/* Foto Portrait - Hidden on mobile */}
          {!isMobile && (
            <div
              style={{
                width: '500px',
                height: '700px',
                backgroundImage: 'url(/images/5.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                borderRadius: '20px',
                boxShadow: '0 15px 40px rgba(0,0,0,0.4)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '30px',
                background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                color: 'white',
                fontFamily: "'Roboto', sans-serif",
              }}>
                <h3 style={{ fontSize: '24px', marginBottom: '10px', fontWeight: '600' }}>
                  Selamat Datang Kembali
                </h3>
                <p style={{ fontSize: '16px', opacity: 0.9 }}>
                  Login cepat dengan akun yang sudah tersimpan atau buat akun baru
                </p>
              </div>
            </div>
          )}

          {/* Container Teks dan Login Options */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              marginTop: isMobile ? '0' : '40px',
              width: isMobile ? '100%' : 'auto',
              maxWidth: isMobile ? '400px' : '500px',
              flex: 1,
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
                  textShadow: '2px 2px 8px rgba(0,0,0,0.7)',
                  background: 'linear-gradient(90deg, #fff, #aaa)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {user ? `Welcome, ${user.displayName || user.email}` : 'Welcome back'}
              </h1>
              <p
                style={{
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: isMobile ? '16px' : '18px',
                  color: 'rgba(255, 255, 255, 0.9)',
                  textShadow: '1px 1px 3px rgba(0,0,0,0.5)',
                  marginBottom: '10px',
                }}
              >
                {user ? 'You are signed in' : 'Sign in to your account to continue'}
              </p>
              
              {!user && (
                <p style={{
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  marginTop: '5px',
                }}>
                  ⚡ Login otomatis tersedia untuk akun yang sudah tersimpan
                </p>
              )}
              
              {/* Error Message */}
              {error && (
                <div style={{
                  backgroundColor: 'rgba(255, 0, 0, 0.1)',
                  border: '1px solid rgba(255, 0, 0, 0.3)',
                  borderRadius: '10px',
                  padding: '15px',
                  marginTop: '20px',
                  color: '#ff6b6b',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}>
                  <span style={{ fontSize: '18px' }}>⚠️</span>
                  <span>{error}</span>
                </div>
              )}
              
              {/* Logout Button (if logged in) */}
              {user && (
                <div style={{ marginTop: '25px' }}>
                  <button
                    onClick={handleLogout}
                    style={{
                      padding: '12px 25px',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '10px',
                      color: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      fontSize: '15px',
                      fontWeight: '500',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    Sign Out
                  </button>
                </div>
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
                  <div
                    onClick={handleGoogleLogin}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '16px 20px',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      backdropFilter: 'blur(10px)',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      opacity: loading ? 0.7 : 1,
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.3)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      left: '15px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                    }}>
                      <svg width="24" height="24" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    </div>
                    <span style={{ 
                      fontFamily: "'Roboto', sans-serif",
                      fontSize: isMobile ? '14px' : '16px', 
                      color: '#ffffff',
                      fontWeight: '600',
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
                      padding: '16px 20px',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      backdropFilter: 'blur(10px)',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      opacity: loading ? 0.7 : 1,
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.3)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      left: '15px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                    }}>
                      <svg width="24" height="24" viewBox="0 0 24 24">
                        <path fill="#ffffff" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                      </svg>
                    </div>
                    <span style={{ 
                      fontFamily: "'Roboto', sans-serif",
                      fontSize: isMobile ? '14px' : '16px', 
                      color: '#ffffff',
                      fontWeight: '600',
                    }}>
                      {loading ? 'Loading...' : 'Continue with GitHub'}
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  margin: '25px 0',
                  color: 'rgba(255, 255, 255, 0.5)',
                }}>
                  <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />
                  <div style={{ padding: '0 15px', fontSize: '14px' }}>atau dengan email</div>
                  <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />
                </div>

                {/* Email dan Password Form */}
                <form onSubmit={(e) => handleEmailLogin(e)}>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '20px',
                      padding: isMobile ? '20px' : '25px',
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '15px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(10px)',
                      marginBottom: '25px',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                    }}
                  >
                    {/* Email Input dengan autocomplete */}
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontFamily: "'Roboto', sans-serif",
                          fontSize: '14px',
                          fontWeight: '600',
                          color: 'rgba(255, 255, 255, 0.9)',
                          marginBottom: '10px',
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
                        autoComplete="username email"
                        style={{
                          width: '100%',
                          padding: '14px 16px',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          borderRadius: '10px',
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          color: '#ffffff',
                          fontFamily: "'Roboto', sans-serif",
                          fontSize: '15px',
                          outline: 'none',
                          transition: 'all 0.3s ease',
                          boxSizing: 'border-box',
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = 'rgba(255, 255, 255, 0.7)';
                          e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
                          e.target.style.boxShadow = '0 0 0 3px rgba(255, 255, 255, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                          e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>

                    {/* Password Input dengan autocomplete */}
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontFamily: "'Roboto', sans-serif",
                          fontSize: '14px',
                          fontWeight: '600',
                          color: 'rgba(255, 255, 255, 0.9)',
                          marginBottom: '10px',
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
                        autoComplete="current-password"
                        style={{
                          width: '100%',
                          padding: '14px 16px',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          borderRadius: '10px',
                          backgroundColor: 'rgba(255, 255, 255, 0.08)',
                          color: '#ffffff',
                          fontFamily: "'Roboto', sans-serif",
                          fontSize: '15px',
                          outline: 'none',
                          transition: 'all 0.3s ease',
                          boxSizing: 'border-box',
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = 'rgba(255, 255, 255, 0.7)';
                          e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
                          e.target.style.boxShadow = '0 0 0 3px rgba(255, 255, 255, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                          e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>

                    {/* Checkbox untuk mengingat saya */}
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
                          marginRight: '10px',
                          width: '18px',
                          height: '18px',
                          cursor: 'pointer',
                          accentColor: '#4285f4',
                        }}
                      />
                      <label
                        htmlFor="rememberMe"
                        style={{
                          color: 'rgba(255, 255, 255, 0.9)',
                          fontSize: '14px',
                          cursor: 'pointer',
                          fontFamily: "'Roboto', sans-serif",
                          fontWeight: '500',
                        }}
                      >
                        Ingat saya dan simpan untuk login otomatis
                      </label>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        width: '100%',
                        padding: '16px',
                        border: 'none',
                        borderRadius: '10px',
                        backgroundColor: loading ? 'rgba(255, 255, 255, 0.5)' : '#ffffff',
                        color: '#000000',
                        fontFamily: "'Roboto', sans-serif",
                        fontSize: isMobile ? '15px' : '16px',
                        fontWeight: '700',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        marginTop: '15px',
                        letterSpacing: '0.5px',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                      onMouseEnter={(e) => {
                        if (!loading) {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                          e.currentTarget.style.transform = 'translateY(-3px)';
                          e.currentTarget.style.boxShadow = '0 10px 25px rgba(255, 255, 255, 0.3)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!loading) {
                          e.currentTarget.style.backgroundColor = '#ffffff';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }
                      }}
                    >
                      {loading ? (
                        <>
                          <span style={{ opacity: 0.8 }}>Signing In...</span>
                          <span style={{
                            position: 'absolute',
                            right: '20px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: '20px',
                            animation: 'spin 1s linear infinite'
                          }}>↻</span>
                        </>
                      ) : 'Sign In'}
                    </button>
                    
                    {/* Tombol untuk melihat akun tersimpan */}
                    <button
                      type="button"
                      onClick={() => {
                        const localUsers = getLocalLoginHistory();
                        if (localUsers.length > 0) {
                          setShowAutoLoginModal(true);
                        } else {
                          setError("Tidak ada akun yang tersimpan");
                        }
                      }}
                      style={{
                        marginTop: '15px',
                        background: 'none',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontSize: '13px',
                        cursor: 'pointer',
                        padding: '10px',
                        borderRadius: '8px',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                      }}
                    >
                      <span>👤</span>
                      Lihat Akun Tersimpan ({getLocalLoginHistory().length})
                    </button>
                  </div>
                </form>

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
                    marginTop: '10px',
                  }}
                >
                  {/* Lupa Password Link */}
                  <button
                    onClick={handleForgotPassword}
                    style={{
                      border: 'none',
                      background: 'none',
                      color: 'rgba(255, 255, 255, 0.9)',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      opacity: '0.9',
                      transition: 'all 0.3s ease',
                      fontFamily: "'Roboto', sans-serif",
                      fontSize: isMobile ? '13px' : '14px',
                      fontWeight: '500',
                      padding: '5px 10px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '1';
                      e.currentTarget.style.color = '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '0.9';
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)';
                    }}
                  >
                    Lupa password?
                  </button>

                  {/* Sign Up Link */}
                  <div>
                    <span style={{ color: 'rgba(255, 255, 255, 0.9)', opacity: '0.9', fontSize: isMobile ? '13px' : '14px' }}>
                      Belum punya akun?{' '}
                    </span>
                    <button
                      onClick={handleSignUp}
                      style={{
                        border: 'none',
                        background: 'none',
                        color: '#ffffff',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        fontWeight: '700',
                        transition: 'all 0.3s ease',
                        fontFamily: "'Roboto', sans-serif",
                        fontSize: isMobile ? '13px' : '14px',
                        padding: '5px 10px',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.9';
                        e.currentTarget.style.color = '#6495ff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1';
                        e.currentTarget.style.color = '#ffffff';
                      }}
                    >
                      Daftar sekarang
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Teks LETS JOIN US NOTE THINK dan kelompok di bawah */}
        <div
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
              color: 'rgba(255,255,255,0.95)',
              fontSize: isMobile ? '2.5rem' : '5rem',
              fontFamily: 'Arame Mono, monospace',
              margin: '0 0 0.3rem 0',
              lineHeight: '1.1',
              fontWeight: '800',
              letterSpacing: '-1px',
              textShadow: '0 5px 15px rgba(0,0,0,0.5)',
            }}>
              LETS JOIN US
            </p>
            <p style={{
              color: 'rgba(255,255,255,0.95)',
              fontSize: isMobile ? '2.5rem' : '5rem',
              fontFamily: 'Arame Mono, monospace',
              margin: 0,
              lineHeight: '1.1',
              fontWeight: '800',
              letterSpacing: '-1px',
              textShadow: '0 5px 15px rgba(0,0,0,0.5)',
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
                fontWeight: '700',
                margin: '0 0 0.5rem 0',
                marginBottom: isMobile ? '3rem' : '5rem',
                fontFamily: 'Arame Mono, monospace',
                textShadow: '0 3px 10px rgba(0,0,0,0.4)',
              }}>
                MENU
              </h4>
            </div>
            <div>
              <h4 style={{
                color: 'white',
                fontSize: isMobile ? '1.8rem' : '4rem',
                fontWeight: '700',
                margin: '0 0 0.5rem 0',
                marginBottom: isMobile ? '3rem' : '5rem',
                fontFamily: 'Arame Mono, monospace',
                textShadow: '0 3px 10px rgba(0,0,0,0.4)',
              }}>
                PRODUCT
              </h4>
            </div>
            <div>
              <h4 style={{
                color: 'white',
                fontSize: isMobile ? '1.8rem' : '4rem',
                fontWeight: '700',
                margin: '0 0 0.5rem 0',
                marginBottom: isMobile ? '3rem' : '5rem',
                fontFamily: 'Arame Mono, monospace',
                textShadow: '0 3px 10px rgba(0,0,0,0.4)',
              }}>
                CONNECT
              </h4>
            </div>
            <div>
              <h4 style={{
                color: 'white',
                fontSize: isMobile ? '1.8rem' : '4rem',
                fontWeight: '700',
                margin: '0 0 0.5rem 0',
                marginBottom: isMobile ? '8rem' : '15rem',
                fontFamily: 'Arame Mono, monospace',
                textShadow: '0 3px 10px rgba(0,0,0,0.4)',
              }}>
                Features
              </h4>
            </div>
            <div>
              <h4 style={{
                color: 'white',
                fontSize: isMobile ? '1.8rem' : '4rem',
                fontWeight: '700',
                margin: '0 0 0.5rem 0',
                marginBottom: isMobile ? '8rem' : '15rem',
                fontFamily: 'Arame Mono, monospace',
                textShadow: '0 3px 10px rgba(0,0,0,0.4)',
              }}>
                Community
              </h4>
            </div>
            <div>
              <h4 style={{
                color: 'white',
                fontSize: isMobile ? '1.8rem' : '4rem',
                fontWeight: '700',
                margin: '0 0 0.5rem 0',
                marginBottom: isMobile ? '8rem' : '15rem',
                fontFamily: 'Arame Mono, monospace',
                textShadow: '0 3px 10px rgba(0,0,0,0.4)',
              }}>
                BLOG
              </h4>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes spin {
          from { transform: translateY(-50%) rotate(0deg); }
          to { transform: translateY(-50%) rotate(360deg); }
        }
        
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px rgba(20, 20, 20, 0.8) inset !important;
          -webkit-text-fill-color: white !important;
          transition: background-color 5000s ease-in-out 0s;
        }
        
        @media (max-width: 768px) {
          .mobile-hidden {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
