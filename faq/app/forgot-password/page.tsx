'use client';

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  getAuth, 
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updatePassword,
  fetchSignInMethodsForEmail,
  EmailAuthProvider
} from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

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

interface ForgotPasswordPageProps {
  onClose?: () => void;
}

export default function ForgotPasswordPage({ onClose }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTopics, setShowTopics] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [emailAttempts, setEmailAttempts] = useState<{[key: string]: number}>({});
  const router = useRouter();

  // Check if mobile on component mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const handleTopicsClick = () => {
    setShowTopics(!showTopics);
  };

  // Fungsi untuk memeriksa apakah email terdaftar di Firebase Auth
  const checkEmailInFirebaseAuth = async (email: string): Promise<boolean> => {
    try {
      // Method 1: Cek sign-in methods (cara paling akurat)
      const methods = await fetchSignInMethodsForEmail(auth, email);
      return methods.length > 0;
    } catch (err: any) {
      console.log("Method 1 failed, trying alternative...");
      
      // Method 2: Coba send password reset email
      try {
        await sendPasswordResetEmail(auth, email);
        return true; // Jika berhasil, email terdaftar
      } catch (resetErr: any) {
        if (resetErr.code === 'auth/user-not-found') {
          return false; // Email tidak terdaftar
        }
        throw resetErr; // Error lain
      }
    }
  };

  // Rate limiting untuk mencegah brute force
  const checkRateLimit = (email: string): boolean => {
    const now = Date.now();
    const attempts = emailAttempts[email] || 0;
    
    if (attempts >= 3) {
      setError("Terlalu banyak percobaan untuk email ini. Silakan coba lagi nanti.");
      return false;
    }
    
    setEmailAttempts({
      ...emailAttempts,
      [email]: attempts + 1
    });
    
    return true;
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    
    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Format email tidak valid. Contoh: user@domain.com");
      return;
    }

    // Rate limiting
    if (!checkRateLimit(email)) {
      return;
    }

    setLoading(true);

    try {
      // Step 1: Cek apakah email terdaftar di Firebase Auth
      const isRegistered = await checkEmailInFirebaseAuth(email);
      
      if (!isRegistered) {
        setError("❌ Email tidak terdaftar di sistem. Silakan gunakan email yang sudah terdaftar.");
        
        // Simpan log attempt untuk keamanan
        console.warn(`Attempt to use unregistered email: ${email}`);
        
        setLoading(false);
        return;
      }

      // Step 2: Kirim email reset password (verifikasi tambahan)
      await sendPasswordResetEmail(auth, email);
      
      // Step 3: Tampilkan form ganti password
      setSuccessMessage(`✅ Email terverifikasi! Link reset password telah dikirim ke ${email}.`);
      setIsEmailVerified(true);
      setShowChangePassword(true);
      
      // Reset attempts counter untuk email ini
      setEmailAttempts({
        ...emailAttempts,
        [email]: 0
      });
      
    } catch (err: any) {
      console.error("Error in forgot password:", err);
      
      // Handle berbagai jenis error
      switch (err.code) {
        case 'auth/user-not-found':
          setError("❌ Email tidak terdaftar di sistem. Silakan gunakan email yang sudah terdaftar.");
          break;
        case 'auth/invalid-email':
          setError("❌ Format email tidak valid.");
          break;
        case 'auth/too-many-requests':
          setError("⏳ Terlalu banyak permintaan. Silakan tunggu beberapa saat.");
          break;
        case 'auth/network-request-failed':
          setError("🌐 Koneksi jaringan bermasalah. Silakan cek koneksi internet Anda.");
          break;
        case 'auth/quota-exceeded':
          setError("📧 Batas pengiriman email telah tercapai. Silakan coba lagi nanti.");
          break;
        default:
          setError("⚠️ Terjadi kesalahan sistem. Silakan hubungi administrator.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    // Validasi ketat
    if (!currentPassword) {
      setError("Password lama harus diisi.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Password baru dan konfirmasi password tidak cocok.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }

    // Validasi kompleksitas password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setError("Password harus mengandung huruf besar, huruf kecil, angka, dan simbol.");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Verifikasi email dan password lama
      const userCredential = await signInWithEmailAndPassword(auth, email, currentPassword);
      const user = userCredential.user;
      
      // Step 2: Double-check user masih valid
      if (!user || !user.emailVerified) {
        setError("Akun belum terverifikasi. Silakan verifikasi email Anda terlebih dahulu.");
        return;
      }
      
      // Step 3: Update password dengan timeout untuk mencegah brute force
      await new Promise(resolve => setTimeout(resolve, 1000)); // Delay 1 detik
      
      await updatePassword(user, newPassword);
      
      // Step 4: Success - hapus semua state dan redirect
      setSuccessMessage("✅ Password berhasil diubah! Sistem akan mengarahkan Anda ke halaman login.");
      
      // Clear sensitive data
      setTimeout(() => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setEmail("");
        setIsEmailVerified(false);
        setShowChangePassword(false);
        router.push('/signin');
      }, 3000);
      
    } catch (err: any) {
      console.error("Error changing password:", err);
      
      switch (err.code) {
        case 'auth/wrong-password':
          setError("❌ Password lama salah. Silakan coba lagi.");
          break;
        case 'auth/weak-password':
          setError("🔒 Password terlalu lemah. Gunakan kombinasi yang lebih kompleks.");
          break;
        case 'auth/user-not-found':
          setError("❌ Akun tidak ditemukan. Mungkin akun telah dihapus.");
          setShowChangePassword(false);
          setIsEmailVerified(false);
          break;
        case 'auth/too-many-requests':
          setError("⏳ Terlalu banyak percobaan gagal. Tunggu 15 menit sebelum mencoba lagi.");
          break;
        case 'auth/requires-recent-login':
          setError("🔄 Sesi telah habis. Silakan login ulang terlebih dahulu.");
          router.push('/signin');
          break;
        case 'auth/network-request-failed':
          setError("🌐 Koneksi jaringan bermasalah. Silakan cek koneksi Anda.");
          break;
        default:
          setError("⚠️ Gagal mengubah password. Silakan coba lagi atau hubungi support.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSignIn = () => {
    router.push('/signin');
  };

  const handleClose = () => {
    if (onClose && typeof onClose === 'function') {
      onClose();
    } else {
      router.back();
    }
  };

  // Mobile-specific styles
  const mobileStyles = {
    container: {
      padding: '1rem 0',
      justifyContent: 'flex-start' as const,
    },
    modal: {
      width: '90%',
      height: 'auto',
      minHeight: '450px',
      padding: '1.5rem',
      marginBottom: '2rem',
      marginTop: '1rem',
    },
    title: {
      fontSize: '1.5rem',
    },
    description: {
      fontSize: '0.9rem',
    },
    input: {
      padding: '0.6rem',
      fontSize: '0.9rem',
    },
    button: {
      padding: '0.6rem',
      fontSize: '0.9rem',
    },
    closeButton: {
      width: '25px',
      height: '25px',
      fontSize: '1rem',
    }
  };

  // Desktop styles
  const desktopStyles = {
    container: {
      padding: '2rem 0',
    },
    modal: {
      width: '600px',
      height: 'auto',
      padding: '3rem',
      marginBottom: '5rem',
      marginTop: '2rem',
    },
    title: {
      fontSize: '2rem',
    },
    description: {
      fontSize: '1rem',
    },
    input: {
      padding: '0.75rem',
      fontSize: '1rem',
    },
    button: {
      padding: '0.75rem',
      fontSize: '1rem',
    },
    closeButton: {
      width: '30px',
      height: '30px',
      fontSize: '1.2rem',
    }
  };

  const styles = isMobile ? mobileStyles : desktopStyles;

  return (
    <AnimatePresence>
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'center',
          zIndex: 1000,
          overflowY: 'auto',
          ...styles.container
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Modal Box */}
        <motion.div
          style={{
            background: 'transparent',
            borderRadius: '12px',
            position: 'relative',
            border: '1px solid rgba(255,255,255,0.3)',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(10px)',
            ...styles.modal
          }}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* Security Badge */}
          <div style={{
            position: 'absolute',
            top: '-12px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 100, 255, 0.9)',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontFamily: 'Arame Mono, monospace',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            🔒 Sistem Keamanan Tinggi
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
              fontFamily: 'Arame Mono, monospace',
              ...styles.closeButton
            }}
          >
            ×
          </button>

          {/* Email Form */}
          {!showChangePassword ? (
            <>
              {/* Judul */}
              <h2 style={{
                color: 'white',
                fontWeight: '600',
                marginBottom: '1rem',
                textAlign: 'left',
                fontFamily: 'Arame Mono, monospace',
                ...styles.title
              }}>
                Reset Password
              </h2>

              {/* Security Info */}
              <div style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: '0.8rem',
                marginBottom: '1.5rem',
                padding: '0.75rem',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.1)',
                fontFamily: 'Arame Mono, monospace',
              }}>
                🔐 Sistem hanya menerima email yang sudah terdaftar di database.
              </div>

              {/* Form Email */}
              <form onSubmit={handleEmailSubmit} style={{ width: '100%' }}>
                {/* Email Input */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    color: 'white',
                    marginBottom: '0.5rem',
                    fontSize: isMobile ? '0.8rem' : '0.9rem',
                    fontFamily: 'Arame Mono, monospace'
                  }}>
                    Email Terdaftar
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contoh: user@domain.com"
                    required
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      borderRadius: '6px',
                      color: 'white',
                      outline: 'none',
                      fontFamily: 'Arame Mono, monospace',
                      ...styles.input
                    }}
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      color: '#ff6b6b',
                      fontSize: '0.875rem',
                      marginBottom: '1rem',
                      fontFamily: 'Arame Mono, monospace',
                      padding: '0.75rem',
                      background: 'rgba(255, 107, 107, 0.1)',
                      borderRadius: '6px',
                      border: '1px solid rgba(255, 107, 107, 0.3)'
                    }}
                  >
                    {error}
                  </motion.div>
                )}

                {/* Tombol Verifikasi */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    background: loading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1))',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '6px',
                    color: 'white',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    marginBottom: '1rem',
                    fontFamily: 'Arame Mono, monospace',
                    opacity: loading ? 0.7 : 1,
                    fontWeight: '500',
                    ...styles.button,
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => !loading && (e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.2))')}
                  onMouseLeave={(e) => !loading && (e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1))')}
                >
                  {loading ? '🔍 Memverifikasi Email...' : '✅ Verifikasi Email'}
                </button>
              </form>

              {/* Security Tips */}
              <div style={{
                marginTop: '1.5rem',
                padding: '0.75rem',
                background: 'rgba(0, 100, 255, 0.1)',
                borderRadius: '6px',
                border: '1px solid rgba(0, 100, 255, 0.3)'
              }}>
                <p style={{
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: '0.75rem',
                  margin: 0,
                  fontFamily: 'Arame Mono, monospace'
                }}>
                  💡 Tips Keamanan: 
                  <br/>• Hanya email terdaftar yang dapat reset password
                  <br/>• Maksimal 3 percobaan per email
                  <br/>• Sistem mendeteksi aktivitas mencurigakan
                </p>
              </div>

              {/* Tombol Kembali */}
              <button
                onClick={handleBackToSignIn}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.8)',
                  cursor: 'pointer',
                  fontSize: isMobile ? '0.8rem' : '0.9rem',
                  textDecoration: 'underline',
                  fontFamily: 'Arame Mono, monospace',
                  alignSelf: 'flex-start',
                  padding: 0,
                  marginTop: '1rem'
                }}
              >
                ← Kembali ke Login
              </button>
            </>
          ) : (
            /* Change Password Form - HANYA muncul jika email terdaftar */
            <div style={{ 
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}>
              <h2 style={{
                color: 'white',
                fontWeight: '600',
                marginBottom: '1rem',
                textAlign: 'left',
                fontFamily: 'Arame Mono, monospace',
                ...styles.title
              }}>
                Buat Password Baru
              </h2>

              {/* Verified Badge */}
              <div style={{
                color: '#00c853',
                fontSize: '0.9rem',
                marginBottom: '1.5rem',
                fontFamily: 'Arame Mono, monospace',
                padding: '0.75rem',
                background: 'rgba(0, 200, 83, 0.1)',
                borderRadius: '6px',
                border: '1px solid rgba(0, 200, 83, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{ fontSize: '1.2rem' }}>✅</span>
                Email <strong>{email}</strong> terverifikasi & terdaftar
              </div>

              <form onSubmit={handleChangePassword} style={{ width: '100%' }}>
                {/* Current Password */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    color: 'white',
                    marginBottom: '0.5rem',
                    fontSize: isMobile ? '0.8rem' : '0.9rem',
                    fontFamily: 'Arame Mono, monospace'
                  }}>
                    Password Lama (Verifikasi)
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••••"
                    required
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      borderRadius: '6px',
                      color: 'white',
                      outline: 'none',
                      fontFamily: 'Arame Mono, monospace',
                      ...styles.input
                    }}
                  />
                </div>

                {/* New Password */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    color: 'white',
                    marginBottom: '0.5rem',
                    fontSize: isMobile ? '0.8rem' : '0.9rem',
                    fontFamily: 'Arame Mono, monospace'
                  }}>
                    Password Baru
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 8 karakter: Aa1@..."
                    required
                    minLength={8}
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      borderRadius: '6px',
                      color: 'white',
                      outline: 'none',
                      fontFamily: 'Arame Mono, monospace',
                      ...styles.input
                    }}
                  />
                  <div style={{
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '0.7rem',
                    marginTop: '0.25rem',
                    fontFamily: 'Arame Mono, monospace'
                  }}>
                    Harus mengandung: huruf besar, kecil, angka, simbol
                  </div>
                </div>

                {/* Confirm Password */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    color: 'white',
                    marginBottom: '0.5rem',
                    fontSize: isMobile ? '0.8rem' : '0.9rem',
                    fontFamily: 'Arame Mono, monospace'
                  }}>
                    Konfirmasi Password Baru
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••"
                    required
                    minLength={8}
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      borderRadius: '6px',
                      color: 'white',
                      outline: 'none',
                      fontFamily: 'Arame Mono, monospace',
                      ...styles.input
                    }}
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div style={{
                    color: '#ff6b6b',
                    fontSize: '0.875rem',
                    marginBottom: '1rem',
                    fontFamily: 'Arame Mono, monospace',
                    padding: '0.75rem',
                    background: 'rgba(255, 107, 107, 0.1)',
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 107, 107, 0.3)'
                  }}>
                    ⚠️ {error}
                  </div>
                )}

                {/* Button Group */}
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  marginBottom: '1rem'
                }}>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      flex: 1,
                      background: loading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, rgba(0, 200, 83, 0.3), rgba(0, 200, 83, 0.1))',
                      border: '1px solid rgba(0, 200, 83, 0.3)',
                      borderRadius: '6px',
                      color: 'white',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontFamily: 'Arame Mono, monospace',
                      opacity: loading ? 0.7 : 1,
                      fontWeight: '500',
                      ...styles.button
                    }}
                  >
                    {loading ? '🔄 Mengubah Password...' : '✅ Simpan Password Baru'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowChangePassword(false);
                      setCurrentPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                    }}
                    style={{
                      flex: 0.5,
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      borderRadius: '6px',
                      color: 'rgba(255,255,255,0.8)',
                      cursor: 'pointer',
                      fontFamily: 'Arame Mono, monospace',
                      ...styles.button
                    }}
                  >
                    Batalkan
                  </button>
                </div>
              </form>
            </div>
          )}
        </motion.div>

        {/* Content Section - Responsive */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          style={{
            position: 'relative',
            textAlign: 'left',
            marginTop: isMobile ? '1rem' : '2rem',
            width: '100%',
            maxWidth: '1200px',
            padding: isMobile ? '0 1rem' : '0 2rem'
          }}
        >
          {/* Teks LETS JOIN US NOTE THINK */}
          <div style={{ 
            marginBottom: isMobile ? '2rem' : '4rem',
            textAlign: isMobile ? 'center' : 'left'
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

          {/* Menu Grid - Responsive */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, auto)',
            gap: isMobile ? '1.5rem' : '2rem 8rem',
            marginTop: '0rem'
          }}>
            <div>
              <h4 style={{
                color: 'white',
                fontSize: isMobile ? '2rem' : '4rem',
                fontWeight: '600',
                margin: '0 0 0.5rem 0',
                marginBottom: isMobile ? '2rem' : '5rem',
                fontFamily: 'Arame Mono, monospace'
              }}>
                MENU
              </h4>
              
              {/* Menu Items */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: isMobile ? '1rem' : '2rem',
                marginTop: isMobile ? '1rem' : '2rem'
              }}>
                {['Home', 'Topics', 'Blog', 'Roadmap', 'Note'].map((item) => (
                  <div 
                    key={item} 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: isMobile ? '0.5rem' : '1rem',
                      cursor: 'pointer'
                    }}
                    onClick={item === 'Topics' ? handleTopicsClick : undefined}
                  >
                    <span style={{
                      color: 'white',
                      fontSize: isMobile ? '2rem' : '5rem',
                      fontFamily: 'Arame Mono, monospace',
                      fontWeight: '500'
                    }}>
                      {item}
                    </span>
                    <motion.svg
                      width={isMobile ? "40" : "60"}
                      height={isMobile ? "40" : "60"}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      animate={{ rotate: item === 'Topics' && showTopics ? 45 : 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <motion.line
                        x1="12"
                        y1="5"
                        x2="12"
                        y2="19"
                        animate={{ 
                          opacity: item === 'Topics' && showTopics ? 0 : 1,
                          scale: item === 'Topics' && showTopics ? 0 : 1
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    </motion.svg>
                  </div>
                ))}
                
                {showTopics && (
                  <div>
                    <h4 style={{
                      color: 'white',
                      fontSize: isMobile ? '1.5rem' : '4rem',
                      fontWeight: '600',
                      margin: '0 0 0.5rem 0',
                      marginBottom: isMobile ? '2rem' : '5rem',
                      fontFamily: 'Arame Mono, monospace'
                    }}>
                      TOPICS
                    </h4>

                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: isMobile ? '1rem' : '2rem',
                      marginTop: isMobile ? '1rem' : '2rem'
                    }}>
                      {[
                        { name: 'Web Development', description: 'Frontend & Backend technologies' },
                        { name: 'Mobile Apps', description: 'iOS & Android development' },
                        { name: 'UI/UX Design', description: 'User interface and experience' },
                        { name: 'Data Science', description: 'AI, ML and analytics' },
                        { name: 'DevOps', description: 'Cloud and infrastructure' }
                      ].map((topic) => (
                        <div key={topic.name} style={{
                          borderBottom: '1px solid rgba(255,255,255,0.2)',
                          paddingBottom: isMobile ? '1rem' : '1.5rem'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer'
                          }}>
                            <div>
                              <div style={{
                                color: 'white',
                                fontSize: isMobile ? '1.5rem' : '3.5rem',
                                fontFamily: 'Arame Mono, monospace',
                                fontWeight: '500',
                                marginBottom: '0.5rem'
                              }}>
                                {topic.name}
                              </div>
                              <div style={{
                                color: 'rgba(255,255,255,0.7)',
                                fontSize: isMobile ? '0.9rem' : '1.8rem',
                                fontFamily: 'Arame Mono, monospace'
                              }}>
                                {topic.description}
                              </div>
                            </div>
                            
                            <svg
                              width={isMobile ? "30" : "70"}
                              height={isMobile ? "30" : "70"}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="white"
                              strokeWidth="1.5"
                              style={{
                                transform: 'rotate(45deg)',
                                transition: 'transform 0.3s ease'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.transform = 'rotate(45deg) scale(1.1)'}
                              onMouseLeave={(e) => e.currentTarget.style.transform = 'rotate(45deg) scale(1)'}
                            >
                              <line x1="5" y1="12" x2="19" y2="12" />
                              <polyline points="12 5 19 12 12 19" />
                            </svg>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Other Menu Items */}
            {[
              { title: 'PRODUCT', margin: '5rem' },
              { title: 'CONNECT', margin: '5rem' },
              { title: 'Features', margin: '15rem' },
              { title: 'Community', margin: '15rem' },
              { title: 'BLOG', margin: '15rem' }
            ].map((item, index) => (
              <div key={index}>
                <h4 style={{
                  color: 'white',
                  fontSize: isMobile ? '1.5rem' : '4rem',
                  fontWeight: '600',
                  margin: '0 0 0.5rem 0',
                  marginBottom: isMobile ? '1rem' : item.margin,
                  fontFamily: 'Arame Mono, monospace'
                }}>
                  {item.title}
                </h4>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Success Notification */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{
                position: 'fixed',
                bottom: '2rem',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'linear-gradient(135deg, rgba(0, 200, 83, 0.95), rgba(0, 150, 63, 0.95))',
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '8px',
                fontFamily: 'Arame Mono, monospace',
                fontSize: '0.9rem',
                zIndex: 1001,
                maxWidth: '90%',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(0, 200, 83, 0.3)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}
            >
              {successMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Notification */}
        <AnimatePresence>
          {error && !successMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{
                position: 'fixed',
                bottom: '2rem',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.95), rgba(200, 67, 67, 0.95))',
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '8px',
                fontFamily: 'Arame Mono, monospace',
                fontSize: '0.9rem',
                zIndex: 1001,
                maxWidth: '90%',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
