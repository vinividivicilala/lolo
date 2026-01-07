'use client';

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
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
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState<1 | 2>(1); // 1: Email verification, 2: New password
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [tempUser, setTempUser] = useState<any>(null); // Untuk menyimpan user sementara

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

  // Cek apakah email terdaftar (simulasi)
  const checkRegisteredEmail = async (email: string) => {
    try {
      // Di sini Anda bisa menambahkan logika untuk memeriksa ke database
      // Untuk sekarang kita asumsikan semua email valid
      // Anda bisa menambahkan API call ke database Anda untuk memverifikasi
      return true;
    } catch (error) {
      console.error("Error checking email:", error);
      return false;
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validasi email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Format email tidak valid");
      }

      // Cek apakah email terdaftar
      const isRegistered = await checkRegisteredEmail(email);
      if (!isRegistered) {
        throw new Error("Email belum terdaftar");
      }

      // Simpan email dan lanjut ke step 2
      setTempUser({ email });
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validasi password
      if (newPassword.length < 6) {
        throw new Error("Password minimal 6 karakter");
      }

      if (newPassword !== confirmPassword) {
        throw new Error("Password tidak cocok");
      }

      // Catatan: Di aplikasi nyata, Anda perlu verifikasi email dulu
      // Karena ini demo, kita langsung update password
      // Di production, Anda perlu:
      // 1. Verifikasi email dengan OTP/kode khusus
      // 2. Atau gunakan Firebase Auth reset dengan custom backend
      
      // Untuk demo, kita tampilkan success message
      setTimeout(() => {
        setSuccess(true);
        setIsLoading(false);
        
        // Reset form setelah 3 detik
        setTimeout(() => {
          if (onClose && typeof onClose === 'function') {
            onClose();
          } else {
            router.push('/signin');
          }
        }, 3000);
      }, 1500);

    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  const handleBackToStep1 = () => {
    setStep(1);
    setError(null);
  };

  const handleBackToSignIn = () => {
    if (onClose && typeof onClose === 'function') {
      onClose();
    } else {
      router.push('/signin');
    }
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
      minHeight: step === 1 ? '400px' : '450px',
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
      width: step === 1 ? '450px' : '500px',
      height: 'auto',
      minHeight: step === 1 ? '450px' : '500px',
      padding: '3rem',
      marginBottom: '3rem',
      marginTop: '2rem',
    },
    title: {
      fontSize: '1.8rem',
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

          {/* Success State */}
          {success ? (
            <div style={{ 
              textAlign: 'center', 
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              padding: isMobile ? '1rem' : '2rem'
            }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                style={{ 
                  fontSize: isMobile ? '3rem' : '4rem', 
                  marginBottom: '1.5rem' 
                }}
              >
                ✅
              </motion.div>
              
              <h3 style={{
                color: 'white',
                fontSize: isMobile ? '1.3rem' : '1.8rem',
                marginBottom: '1rem',
                fontFamily: 'Arame Mono, monospace'
              }}>
                Password Berhasil Diubah!
              </h3>
              
              <p style={{
                color: 'rgba(255,255,255,0.8)',
                fontSize: isMobile ? '0.9rem' : '1rem',
                marginBottom: '2rem',
                fontFamily: 'Arame Mono, monospace',
                textAlign: 'center'
              }}>
                Password Anda telah berhasil diperbarui. Anda akan diarahkan ke halaman login dalam beberapa detik.
              </p>
            </div>
          ) : step === 1 ? (
            // Step 1: Email Verification
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
                Masukkan email terdaftar untuk melanjutkan proses reset password
              </p>

              {/* Error Message */}
              {error && (
                <div style={{
                  backgroundColor: 'rgba(255, 59, 48, 0.1)',
                  border: '1px solid rgba(255, 59, 48, 0.3)',
                  borderRadius: '6px',
                  padding: '0.75rem',
                  marginBottom: '1.5rem',
                  color: '#ff3b30',
                  fontSize: isMobile ? '0.8rem' : '0.9rem',
                  fontFamily: 'Arame Mono, monospace',
                }}>
                  {error}
                </div>
              )}

              {/* Form Email */}
              <form onSubmit={handleEmailSubmit} style={{ width: '100%' }}>
                {/* Email Input */}
                <div style={{ marginBottom: '2rem' }}>
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
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError(null);
                    }}
                    placeholder="masukkan email terdaftar"
                    required
                    disabled={isLoading}
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.1)',
                      border: error ? '1px solid #ff3b30' : '1px solid rgba(255,255,255,0.3)',
                      borderRadius: '6px',
                      color: 'white',
                      outline: 'none',
                      fontFamily: 'Arame Mono, monospace',
                      ...styles.input,
                      opacity: isLoading ? 0.7 : 1
                    }}
                  />
                  <p style={{
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: isMobile ? '0.7rem' : '0.8rem',
                    marginTop: '0.5rem',
                    fontFamily: 'Arame Mono, monospace'
                  }}>
                    *Email harus sudah terdaftar di sistem
                  </p>
                </div>

                {/* Tombol Lanjut */}
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    background: isLoading 
                      ? 'rgba(255,255,255,0.1)' 
                      : 'rgba(255,255,255,0.2)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '6px',
                    color: isLoading ? 'rgba(255,255,255,0.5)' : 'white',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    marginBottom: '1rem',
                    fontFamily: 'Arame Mono, monospace',
                    ...styles.button,
                    position: 'relative'
                  }}
                >
                  {isLoading ? (
                    <>
                      <span style={{ opacity: 0.7 }}>Memverifikasi...</span>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        style={{
                          position: 'absolute',
                          right: '1rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        ↻
                      </motion.span>
                    </>
                  ) : (
                    'Lanjutkan'
                  )}
                </button>
              </form>

              {/* Tombol Kembali ke Login */}
              <button
                onClick={handleBackToSignIn}
                disabled={isLoading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: isLoading ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.8)',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: isMobile ? '0.8rem' : '0.9rem',
                  textDecoration: 'underline',
                  fontFamily: 'Arame Mono, monospace',
                  alignSelf: 'flex-start',
                  padding: 0,
                  marginTop: '0.5rem'
                }}
              >
                Kembali ke Sign In
              </button>
            </>
          ) : (
            // Step 2: New Password
            <>
              {/* Progress Indicator */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '2rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.8rem',
                    fontFamily: 'Arame Mono, monospace'
                  }}>
                    1
                  </div>
                  <span style={{
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '0.8rem',
                    fontFamily: 'Arame Mono, monospace'
                  }}>
                    Email
                  </span>
                </div>
                
                <div style={{
                  flex: 1,
                  height: '1px',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  margin: '0 1rem'
                }} />
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'black',
                    fontSize: '0.8rem',
                    fontFamily: 'Arame Mono, monospace'
                  }}>
                    2
                  </div>
                  <span style={{
                    color: 'white',
                    fontSize: '0.8rem',
                    fontFamily: 'Arame Mono, monospace'
                  }}>
                    Password Baru
                  </span>
                </div>
              </div>

              <h2 style={{
                color: 'white',
                fontWeight: '600',
                marginBottom: '0.5rem',
                textAlign: 'left',
                fontFamily: 'Arame Mono, monospace',
                ...styles.title
              }}>
                Buat Password Baru
              </h2>

              <p style={{
                color: 'rgba(255,255,255,0.8)',
                marginBottom: '2rem',
                textAlign: 'left',
                fontFamily: 'Arame Mono, monospace',
                ...styles.description
              }}>
                Masukkan password baru untuk akun: 
                <span style={{ fontWeight: '600', marginLeft: '0.5rem' }}>
                  {tempUser?.email}
                </span>
              </p>

              {/* Error Message */}
              {error && (
                <div style={{
                  backgroundColor: 'rgba(255, 59, 48, 0.1)',
                  border: '1px solid rgba(255, 59, 48, 0.3)',
                  borderRadius: '6px',
                  padding: '0.75rem',
                  marginBottom: '1.5rem',
                  color: '#ff3b30',
                  fontSize: isMobile ? '0.8rem' : '0.9rem',
                  fontFamily: 'Arame Mono, monospace',
                }}>
                  {error}
                </div>
              )}

              {/* Form Password Baru */}
              <form onSubmit={handlePasswordChange} style={{ width: '100%' }}>
                {/* New Password Input */}
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
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setError(null);
                    }}
                    placeholder="minimal 6 karakter"
                    required
                    disabled={isLoading}
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      borderRadius: '6px',
                      color: 'white',
                      outline: 'none',
                      fontFamily: 'Arame Mono, monospace',
                      ...styles.input,
                      opacity: isLoading ? 0.7 : 1
                    }}
                  />
                </div>

                {/* Confirm Password Input */}
                <div style={{ marginBottom: '2rem' }}>
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
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError(null);
                    }}
                    placeholder="ulangi password baru"
                    required
                    disabled={isLoading}
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.1)',
                      border: error ? '1px solid #ff3b30' : '1px solid rgba(255,255,255,0.3)',
                      borderRadius: '6px',
                      color: 'white',
                      outline: 'none',
                      fontFamily: 'Arame Mono, monospace',
                      ...styles.input,
                      opacity: isLoading ? 0.7 : 1
                    }}
                  />
                </div>

                {/* Button Container */}
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  marginBottom: '1rem'
                }}>
                  {/* Tombol Kembali */}
                  <button
                    type="button"
                    onClick={handleBackToStep1}
                    disabled={isLoading}
                    style={{
                      flex: 1,
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '6px',
                      color: isLoading ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.8)',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      fontFamily: 'Arame Mono, monospace',
                      padding: '0.75rem',
                      fontSize: '0.9rem'
                    }}
                  >
                    Kembali
                  </button>

                  {/* Tombol Simpan */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      flex: 2,
                      background: isLoading 
                        ? 'rgba(255,255,255,0.1)' 
                        : 'rgba(255,255,255,0.2)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      borderRadius: '6px',
                      color: isLoading ? 'rgba(255,255,255,0.5)' : 'white',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      fontFamily: 'Arame Mono, monospace',
                      padding: '0.75rem',
                      fontSize: '0.9rem',
                      position: 'relative'
                    }}
                  >
                    {isLoading ? (
                      <>
                        <span style={{ opacity: 0.7 }}>Menyimpan...</span>
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          style={{
                            position: 'absolute',
                            right: '1rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          ↻
                        </motion.span>
                      </>
                    ) : (
                      'Simpan Password Baru'
                    )}
                  </button>
                </div>
              </form>

              {/* Password Requirements */}
              <div style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: '6px',
                padding: '1rem',
                marginTop: '1rem',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <p style={{
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '0.8rem',
                  fontFamily: 'Arame Mono, monospace',
                  margin: 0,
                  marginBottom: '0.5rem'
                }}>
                  <strong>Persyaratan Password:</strong>
                </p>
                <ul style={{
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: '0.75rem',
                  fontFamily: 'Arame Mono, monospace',
                  margin: 0,
                  paddingLeft: '1rem',
                  listStyleType: 'disc'
                }}>
                  <li>Minimal 6 karakter</li>
                  <li>Gunakan kombinasi huruf dan angka</li>
                  <li>Pastikan kedua password sama</li>
                </ul>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
