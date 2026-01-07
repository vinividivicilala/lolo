'use client';

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  getAuth, 
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updatePassword,
  signOut,
  User
} from "firebase/auth";
import { initializeApp } from "firebase/app";

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

interface ForgotPasswordPageProps {
  onClose?: () => void;
}

export default function ForgotPasswordPage({ onClose }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTopics, setShowTopics] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [tempUser, setTempUser] = useState<User | null>(null);
  const [verificationStep, setVerificationStep] = useState<'email' | 'otp' | 'newPassword'>('email');
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpExpiry, setOtpExpiry] = useState<number | null>(null);
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

  // OTP expiry timer
  useEffect(() => {
    if (otpExpiry && Date.now() > otpExpiry) {
      setError("OTP telah kadaluarsa. Silakan minta OTP baru.");
      setOtp("");
      setGeneratedOtp("");
      setOtpExpiry(null);
      setVerificationStep('email');
    }
  }, [otpExpiry]);

  const handleTopicsClick = () => {
    setShowTopics(!showTopics);
  };

  // Generate random OTP
  const generateOtp = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    
    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Format email tidak valid. Contoh: nama@email.com");
      return;
    }

    setLoading(true);

    try {
      // Coba login dengan password dummy untuk verifikasi email
      // Jika berhasil, berarti email terdaftar
      try {
        // Coba login dengan password dummy (ini akan gagal, tapi kita bisa cek error)
        await signInWithEmailAndPassword(auth, email, "DUMMY_PASSWORD_123");
      } catch (loginError: any) {
        // Periksa error yang diterima
        if (loginError.code === 'auth/user-not-found') {
          // Email tidak terdaftar
          setError("❌ Email tidak terdaftar di sistem Firebase Auth.");
          setLoading(false);
          return;
        } else if (loginError.code === 'auth/wrong-password') {
          // Email terdaftar (password salah, tapi email ada)
          // Lanjutkan ke OTP verification
        } else if (loginError.code === 'auth/invalid-email') {
          setError("❌ Format email tidak valid.");
          setLoading(false);
          return;
        } else {
          // Error lain, lanjutkan untuk keamanan
          console.log("Other login error:", loginError.code);
        }
      }

      // Jika sampai sini, email kemungkinan terdaftar
      // Generate OTP
      const newOtp = generateOtp();
      setGeneratedOtp(newOtp);
      
      // Set OTP expiry 5 menit dari sekarang
      setOtpExpiry(Date.now() + 5 * 60 * 1000);
      
      // Simulate sending OTP (in real app, send via email/SMS)
      console.log(`OTP untuk ${email}: ${newOtp}`); // Hapus ini di production
      
      setVerifiedEmail(email);
      setVerificationStep('otp');
      setSuccessMessage(`✅ OTP telah dikirim ke ${email}. OTP: ${newOtp} (ini hanya demo)`);
      
    } catch (err: any) {
      console.error("Error verifying email:", err);
      setError("❌ Terjadi kesalahan saat memverifikasi email.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!otp) {
      setError("Masukkan OTP yang diterima.");
      return;
    }

    if (otpExpiry && Date.now() > otpExpiry) {
      setError("OTP telah kadaluarsa. Silakan minta OTP baru.");
      setOtp("");
      setGeneratedOtp("");
      setOtpExpiry(null);
      setVerificationStep('email');
      return;
    }

    if (otp !== generatedOtp) {
      setError("OTP tidak valid. Silakan coba lagi.");
      return;
    }

    // OTP valid, lanjut ke form password baru
    setVerificationStep('newPassword');
    setSuccessMessage("✅ OTP terverifikasi! Silakan buat password baru.");
  };

  const handleResendOtp = () => {
    const newOtp = generateOtp();
    setGeneratedOtp(newOtp);
    setOtpExpiry(Date.now() + 5 * 60 * 1000);
    setOtp("");
    setSuccessMessage(`✅ OTP baru telah dikirim. OTP: ${newOtp}`);
    console.log(`OTP baru untuk ${verifiedEmail}: ${newOtp}`); // Hapus ini di production
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    // Validasi
    if (newPassword !== confirmPassword) {
      setError("Password baru dan konfirmasi password tidak cocok.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    // Untuk keamanan, kita perlu user login dulu sebelum ganti password
    // Karena Firebase tidak izinkan updatePassword tanpa user login
    // Solusi: Minta user login dulu dengan password lama, lalu update
    
    setLoading(true);

    try {
      // Langkah 1: Minta user login dengan password lama via modal
      // Tapi karena kita tidak mau minta password lama, alternatif:
      
      // Gunakan approach: Kirim email reset, user klik link, lalu update password
      // Tapi karena kita tidak mau lewat email, kita gunakan temporary login
      
      // **ALTERNATIF UNTUK DEMO**: Login dengan password dummy, lalu logout setelah update
      // **CATATAN**: Di production, gunakan proper authentication flow
      
      // Untuk demo, kita akan langsung update password dengan asumsi user sudah verified
      // Di real app, ini harus menggunakan proper authentication
      
      setSuccessMessage("⚠️ Sistem demo: Di production, user harus login terlebih dahulu.");
      
      // Redirect ke signin dengan pesan
      setTimeout(() => {
        router.push('/signin');
      }, 3000);
      
    } catch (err: any) {
      console.error("Error changing password:", err);
      
      if (err.code === 'auth/requires-recent-login') {
        setError("🔄 Sesi telah habis. Silakan login ulang terlebih dahulu.");
        router.push('/signin');
      } else if (err.code === 'auth/weak-password') {
        setError("🔒 Password terlalu lemah. Gunakan kombinasi yang lebih kuat.");
      } else {
        setError("⚠️ Gagal mengubah password. Silakan coba lagi.");
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
      minHeight: '400px',
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
            ...styles.modal
          }}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
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

          {/* Step 1: Email Verification */}
          {verificationStep === 'email' && (
            <>
              <h2 style={{
                color: 'white',
                fontWeight: '600',
                marginBottom: '1rem',
                textAlign: 'left',
                fontFamily: 'Arame Mono, monospace',
                ...styles.title
              }}>
                Verifikasi Email
              </h2>

              <p style={{
                color: 'rgba(255,255,255,0.8)',
                marginBottom: '2rem',
                textAlign: 'left',
                fontFamily: 'Arame Mono, monospace',
                ...styles.description
              }}>
                Masukkan email yang terdaftar di Firebase Auth
              </p>

              <form onSubmit={handleEmailSubmit} style={{ width: '100%' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    color: 'white',
                    marginBottom: '0.5rem',
                    fontSize: isMobile ? '0.8rem' : '0.9rem',
                    fontFamily: 'Arame Mono, monospace'
                  }}>
                    Email Firebase Auth
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@terdaftar.com"
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

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    background: loading ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '6px',
                    color: 'white',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    marginBottom: '1rem',
                    fontFamily: 'Arame Mono, monospace',
                    opacity: loading ? 0.7 : 1,
                    ...styles.button
                  }}
                >
                  {loading ? 'Memverifikasi...' : 'Verifikasi Email'}
                </button>
              </form>

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
                  padding: 0
                }}
              >
                ← Kembali ke Login
              </button>
            </>
          )}

          {/* Step 2: OTP Verification */}
          {verificationStep === 'otp' && (
            <>
              <h2 style={{
                color: 'white',
                fontWeight: '600',
                marginBottom: '1rem',
                textAlign: 'left',
                fontFamily: 'Arame Mono, monospace',
                ...styles.title
              }}>
                Verifikasi OTP
              </h2>

              <div style={{
                color: '#00c853',
                fontSize: '0.9rem',
                marginBottom: '1.5rem',
                fontFamily: 'Arame Mono, monospace',
                padding: '0.75rem',
                background: 'rgba(0, 200, 83, 0.1)',
                borderRadius: '6px',
                border: '1px solid rgba(0, 200, 83, 0.3)'
              }}>
                ✅ OTP telah dikirim ke: <strong>{verifiedEmail}</strong>
                {generatedOtp && (
                  <div style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                    <strong>Demo OTP:</strong> {generatedOtp} (kadaluarsa 5 menit)
                  </div>
                )}
              </div>

              <form onSubmit={handleOtpSubmit} style={{ width: '100%' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    color: 'white',
                    marginBottom: '0.5rem',
                    fontSize: isMobile ? '0.8rem' : '0.9rem',
                    fontFamily: 'Arame Mono, monospace'
                  }}>
                    6-digit OTP
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    maxLength={6}
                    required
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      borderRadius: '6px',
                      color: 'white',
                      outline: 'none',
                      fontFamily: 'Arame Mono, monospace',
                      textAlign: 'center',
                      fontSize: '1.5rem',
                      letterSpacing: '0.5rem',
                      ...styles.input
                    }}
                  />
                </div>

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

                {successMessage && (
                  <div style={{
                    color: '#00c853',
                    fontSize: '0.875rem',
                    marginBottom: '1rem',
                    fontFamily: 'Arame Mono, monospace',
                    padding: '0.75rem',
                    background: 'rgba(0, 200, 83, 0.1)',
                    borderRadius: '6px',
                    border: '1px solid rgba(0, 200, 83, 0.3)'
                  }}>
                    ✅ {successMessage}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      background: 'rgba(255,255,255,0.2)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      borderRadius: '6px',
                      color: 'white',
                      cursor: 'pointer',
                      fontFamily: 'Arame Mono, monospace',
                      ...styles.button
                    }}
                  >
                    Verifikasi OTP
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    style={{
                      flex: 0.5,
                      background: 'rgba(0, 100, 255, 0.2)',
                      border: '1px solid rgba(0, 100, 255, 0.3)',
                      borderRadius: '6px',
                      color: 'rgba(255,255,255,0.9)',
                      cursor: 'pointer',
                      fontFamily: 'Arame Mono, monospace',
                      fontSize: '0.8rem',
                      padding: '0.6rem'
                    }}
                  >
                    Kirim Ulang
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setVerificationStep('email');
                    setOtp("");
                    setGeneratedOtp("");
                    setOtpExpiry(null);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgba(255,255,255,0.8)',
                    cursor: 'pointer',
                    fontSize: isMobile ? '0.8rem' : '0.9rem',
                    textDecoration: 'underline',
                    fontFamily: 'Arame Mono, monospace',
                    alignSelf: 'flex-start',
                    padding: 0
                  }}
                >
                  ← Ganti Email
                </button>
              </form>
            </>
          )}

          {/* Step 3: New Password */}
          {verificationStep === 'newPassword' && (
            <>
              <h2 style={{
                color: 'white',
                fontWeight: '600',
                marginBottom: '1rem',
                textAlign: 'left',
                fontFamily: 'Arame Mono, monospace',
                ...styles.title
              }}>
                Password Baru
              </h2>

              <div style={{
                color: '#00c853',
                fontSize: '0.9rem',
                marginBottom: '1.5rem',
                fontFamily: 'Arame Mono, monospace',
                padding: '0.75rem',
                background: 'rgba(0, 200, 83, 0.1)',
                borderRadius: '6px',
                border: '1px solid rgba(0, 200, 83, 0.3)'
              }}>
                ✅ Email terverifikasi: <strong>{verifiedEmail}</strong>
              </div>

              <form onSubmit={handleChangePassword} style={{ width: '100%' }}>
                <div style={{ marginBottom: '1.5rem' }}>
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
                    placeholder="Minimal 6 karakter"
                    required
                    minLength={6}
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
                    placeholder="Ketik ulang password baru"
                    required
                    minLength={6}
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

                {successMessage && (
                  <div style={{
                    color: '#00c853',
                    fontSize: '0.875rem',
                    marginBottom: '1rem',
                    fontFamily: 'Arame Mono, monospace',
                    padding: '0.75rem',
                    background: 'rgba(0, 200, 83, 0.1)',
                    borderRadius: '6px',
                    border: '1px solid rgba(0, 200, 83, 0.3)'
                  }}>
                    ✅ {successMessage}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      flex: 1,
                      background: loading ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      borderRadius: '6px',
                      color: 'white',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontFamily: 'Arame Mono, monospace',
                      opacity: loading ? 0.7 : 1,
                      ...styles.button
                    }}
                  >
                    {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setVerificationStep('otp');
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
                    Kembali
                  </button>
                </div>
              </form>
            </>
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
      </motion.div>
    </AnimatePresence>
  );
}
