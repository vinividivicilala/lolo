'use client';

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  getAuth, 
  sendPasswordResetEmail,
  updatePassword,
  confirmPasswordReset,
  verifyPasswordResetCode,
  checkActionCode
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
  const [actionCode, setActionCode] = useState<string | null>(null);
  const [resetCodeVerified, setResetCodeVerified] = useState(false);
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

  // Check for password reset link in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const oobCode = urlParams.get('oobCode');
    const mode = urlParams.get('mode');
    
    if (mode === 'resetPassword' && oobCode) {
      handlePasswordResetLink(oobCode);
    }
  }, []);

  const handlePasswordResetLink = async (oobCode: string) => {
    try {
      setLoading(true);
      
      // Verify the password reset code
      const emailFromCode = await verifyPasswordResetCode(auth, oobCode);
      
      if (emailFromCode) {
        setActionCode(oobCode);
        setVerifiedEmail(emailFromCode);
        setResetCodeVerified(true);
        setShowChangePassword(true);
        setIsEmailVerified(true);
        setSuccessMessage("✅ Link reset password valid! Silakan buat password baru.");
        
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (error: any) {
      console.error("Error verifying reset code:", error);
      setError("❌ Link reset password tidak valid atau telah kadaluarsa.");
    } finally {
      setLoading(false);
    }
  };

  const handleTopicsClick = () => {
    setShowTopics(!showTopics);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Format email tidak valid. Contoh: nama@email.com");
      setLoading(false);
      return;
    }

    try {
      // Langsung coba kirim reset password email
      // Firebase akan throw error 'auth/user-not-found' jika email tidak terdaftar
      await sendPasswordResetEmail(auth, email);
      
      // Jika berhasil sampai sini, berarti email TERDAFTAR di Firebase
      setVerifiedEmail(email);
      setSuccessMessage(`✅ Link reset password telah dikirim ke ${email}. Silakan cek email Anda (termasuk folder spam).`);
      setIsEmailVerified(true);
      
    } catch (err: any) {
      console.error("Error sending reset email:", err);
      
      // Firebase akan memberikan error spesifik untuk email tidak terdaftar
      if (err.code === 'auth/user-not-found') {
        setError("❌ Email tidak terdaftar di sistem Firebase Auth kami.");
      } else if (err.code === 'auth/invalid-email') {
        setError("❌ Format email tidak valid.");
      } else if (err.code === 'auth/too-many-requests') {
        setError("⏳ Terlalu banyak permintaan. Silakan coba lagi nanti.");
      } else if (err.code === 'auth/network-request-failed') {
        setError("🌐 Koneksi jaringan bermasalah. Silakan cek koneksi internet.");
      } else {
        setError(`⚠️ Terjadi kesalahan: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
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

    setLoading(true);

    try {
      if (resetCodeVerified && actionCode) {
        // Jika menggunakan reset link dari email
        await confirmPasswordReset(auth, actionCode, newPassword);
        setSuccessMessage("✅ Password berhasil diubah! Silakan login dengan password baru.");
        
        setTimeout(() => {
          router.push('/signin');
        }, 2000);
      } else if (verifiedEmail) {
        // Jika user datang langsung ke halaman (tanpa reset link)
        // NOTE: Untuk reset tanpa password lama, user HARUS menggunakan link dari email
        // Ini hanya fallback jika ada masalah teknis
        setError("⚠️ Silakan gunakan link reset password yang dikirim ke email Anda.");
        setLoading(false);
        return;
      }
    } catch (err: any) {
      console.error("Error changing password:", err);
      
      if (err.code === 'auth/weak-password') {
        setError("🔒 Password terlalu lemah. Gunakan kombinasi yang lebih kuat.");
      } else if (err.code === 'auth/expired-action-code') {
        setError("⏳ Link reset password telah kadaluarsa. Silakan minta link baru.");
        setShowChangePassword(false);
        setIsEmailVerified(false);
      } else if (err.code === 'auth/invalid-action-code') {
        setError("❌ Link reset password tidak valid. Silakan minta link baru.");
        setShowChangePassword(false);
        setIsEmailVerified(false);
      } else {
        setError("⚠️ Gagal mengubah password. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!verifiedEmail) return;
    
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, verifiedEmail);
      setSuccessMessage(`✅ Link reset password baru telah dikirim ke ${verifiedEmail}`);
    } catch (err: any) {
      setError("⚠️ Gagal mengirim ulang email. Silakan coba lagi.");
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
          {/* Security Badge */}
          <div style={{
            position: 'absolute',
            top: '-12px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(220, 53, 69, 0.9)',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontFamily: 'Arame Mono, monospace',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontWeight: '500'
          }}>
            🔐 HANYA EMAIL FIREBASE AUTH
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

              {/* Deskripsi */}
              <p style={{
                color: 'rgba(255,255,255,0.8)',
                marginBottom: '2rem',
                textAlign: 'left',
                fontFamily: 'Arame Mono, monospace',
                ...styles.description
              }}>
                Sistem hanya menerima email yang terdaftar di Firebase Auth
              </p>

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
                    Email Firebase Auth
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@firebase-auth.com"
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
                    ⚠️ {error}
                  </motion.div>
                )}

                {/* Success Message */}
                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      color: '#00c853',
                      fontSize: '0.875rem',
                      marginBottom: '1rem',
                      fontFamily: 'Arame Mono, monospace',
                      padding: '0.75rem',
                      background: 'rgba(0, 200, 83, 0.1)',
                      borderRadius: '6px',
                      border: '1px solid rgba(0, 200, 83, 0.3)'
                    }}
                  >
                    ✅ {successMessage}
                  </motion.div>
                )}

                {/* Tombol Kirim */}
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
                  {loading ? 'Memverifikasi...' : 'Kirim Link Reset Password'}
                </button>
              </form>

              {/* Info Firebase */}
              <div style={{
                marginTop: '1.5rem',
                padding: '0.75rem',
                background: 'rgba(220, 53, 69, 0.1)',
                borderRadius: '6px',
                border: '1px solid rgba(220, 53, 69, 0.3)'
              }}>
                <p style={{
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: '0.75rem',
                  margin: 0,
                  fontFamily: 'Arame Mono, monospace',
                  lineHeight: '1.4'
                }}>
                  🔒 <strong>Sistem Firebase Auth:</strong><br/>
                  • Hanya email terdaftar yang bisa reset<br/>
                  • Link reset dikirim ke email terverifikasi<br/>
                  • Tidak perlu password lama<br/>
                  • Email tidak terdaftar = DITOLAK
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
            /* Change Password Form - Hanya muncul jika ada reset link valid */
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

              {/* Verified Info */}
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
                <div>
                  <div style={{ fontWeight: '500' }}>Email Terverifikasi di Firebase</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>{verifiedEmail}</div>
                </div>
              </div>

              <form onSubmit={handleChangePassword} style={{ width: '100%' }}>
                {/* New Password */}
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

                {/* Success Message */}
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
                    {loading ? 'Mengubah...' : 'Simpan Password Baru'}
                  </button>

                  {!resetCodeVerified && (
                    <button
                      type="button"
                      onClick={handleResendEmail}
                      disabled={loading}
                      style={{
                        flex: 0.5,
                        background: 'rgba(0, 100, 255, 0.2)',
                        border: '1px solid rgba(0, 100, 255, 0.3)',
                        borderRadius: '6px',
                        color: 'rgba(255,255,255,0.9)',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontFamily: 'Arame Mono, monospace',
                        opacity: loading ? 0.7 : 1,
                        ...styles.button
                      }}
                    >
                      Kirim Ulang
                    </button>
                  )}
                </div>
              </form>

              {/* Info Reset Link */}
              {!resetCodeVerified && (
                <div style={{
                  marginTop: '1.5rem',
                  padding: '0.75rem',
                  background: 'rgba(255, 193, 7, 0.1)',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 193, 7, 0.3)'
                }}>
                  <p style={{
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: '0.75rem',
                    margin: 0,
                    fontFamily: 'Arame Mono, monospace',
                    lineHeight: '1.4'
                  }}>
                    📧 <strong>Petunjuk:</strong><br/>
                    1. Cek email Anda untuk link reset password<br/>
                    2. Klik link tersebut<br/>
                    3. Anda akan diarahkan kembali ke halaman ini<br/>
                    4. Buat password baru di form di atas
                  </p>
                </div>
              )}
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
      </motion.div>
    </AnimatePresence>
  );
}
