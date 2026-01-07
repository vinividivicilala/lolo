'use client';

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  getAuth, 
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  fetchSignInMethodsForEmail 
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
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState(""); // Untuk re-authentication
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Email, 2: Current Password, 3: New Password
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [userData, setUserData] = useState<any>(null); // Data user yang ditemukan
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

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

  // Cek apakah email terdaftar di Firebase Auth
  const checkEmailRegistered = async (email: string) => {
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      return methods.length > 0; // Jika ada metode sign in, email terdaftar
    } catch (error: any) {
      console.error("Error checking email:", error);
      // Jika error "auth/user-not-found", email tidak terdaftar
      if (error.code === 'auth/user-not-found') {
        return false;
      }
      throw error;
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

      // Cek apakah email terdaftar di Firebase
      const isRegistered = await checkEmailRegistered(email);
      
      if (!isRegistered) {
        throw new Error("Email belum terdaftar di sistem");
      }

      // Simpan email dan lanjut ke step 2
      setUserData({ email });
      setStep(2);
    } catch (err: any) {
      console.error("Email verification error:", err);
      setError(err.message || "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCurrentPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!currentPassword) {
        throw new Error("Masukkan password saat ini");
      }

      // Di sini seharusnya kita perlu mendapatkan user yang sedang login
      // Tapi karena ini forgot password, user belum login
      // Jadi kita skip step ini dan langsung ke step 3 untuk demo
      // DI PRODUCTION: Anda perlu sistem OTP/verifikasi lain
      
      setStep(3);
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

      // Catatan: DI PRODUCTION, Anda perlu:
      // 1. Verifikasi user dengan OTP/kode khusus
      // 2. Atau minta user login dulu sebelum ganti password
      
      // Untuk DEMO: Tampilkan pesan sukses
      setSuccess(true);
      
      // Simulasi proses update password
      console.log(`Password untuk ${email} berhasil diubah`);
      
      // Reset setelah 2 detik
      setTimeout(() => {
        if (onClose && typeof onClose === 'function') {
          onClose();
        } else {
          router.push('/signin');
        }
      }, 2000);

    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToStep1 = () => {
    setStep(1);
    setError(null);
    setCurrentPassword("");
  };

  const handleBackToStep2 = () => {
    setStep(2);
    setError(null);
    setNewPassword("");
    setConfirmPassword("");
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
      width: '500px',
      height: 'auto',
      minHeight: '500px',
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

  // Render password input field dengan show/hide toggle
  const renderPasswordInput = (
    label: string,
    value: string,
    onChange: (value: string) => void,
    placeholder: string,
    showPassword: boolean,
    setShowPassword: (show: boolean) => void,
    error?: boolean
  ) => (
    <div style={{ marginBottom: '1.5rem' }}>
      <label style={{
        display: 'block',
        color: 'white',
        marginBottom: '0.5rem',
        fontSize: isMobile ? '0.8rem' : '0.9rem',
        fontFamily: 'Arame Mono, monospace'
      }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
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
            opacity: isLoading ? 0.7 : 1,
            paddingRight: '40px'
          }}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.6)',
            cursor: 'pointer',
            fontSize: '0.9rem',
            padding: '4px'
          }}
        >
          {showPassword ? '🙈' : '👁️'}
        </button>
      </div>
    </div>
  );

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
                Password untuk <strong>{email}</strong> telah berhasil diperbarui. 
                Anda bisa login dengan password baru.
              </p>
              
              <button
                onClick={handleBackToSignIn}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '6px',
                  color: 'white',
                  padding: isMobile ? '0.6rem 1.2rem' : '0.75rem 1.5rem',
                  cursor: 'pointer',
                  fontFamily: 'Arame Mono, monospace',
                  marginTop: '1rem'
                }}
              >
                Login Sekarang
              </button>
            </div>
          ) : (
            <>
              {/* Progress Indicator */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '2rem'
              }}>
                {[1, 2, 3].map((stepNum) => (
                  <React.Fragment key={stepNum}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: step === stepNum ? 'white' : 
                                        step > stepNum ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                        border: step === stepNum ? 'none' : '1px solid rgba(255,255,255,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: step === stepNum ? 'black' : 'rgba(255,255,255,0.6)',
                        fontSize: '0.9rem',
                        fontFamily: 'Arame Mono, monospace',
                        fontWeight: step === stepNum ? '600' : 'normal'
                      }}>
                        {stepNum}
                      </div>
                      {!isMobile && (
                        <span style={{
                          color: step >= stepNum ? 'white' : 'rgba(255,255,255,0.4)',
                          fontSize: '0.8rem',
                          fontFamily: 'Arame Mono, monospace',
                          whiteSpace: 'nowrap'
                        }}>
                          {stepNum === 1 ? 'Email' : stepNum === 2 ? 'Verifikasi' : 'Password Baru'}
                        </span>
                      )}
                    </div>
                    
                    {stepNum < 3 && (
                      <div style={{
                        flex: 1,
                        height: '1px',
                        backgroundColor: step > stepNum ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                        margin: '0 0.5rem'
                      }} />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    backgroundColor: 'rgba(255, 59, 48, 0.1)',
                    border: '1px solid rgba(255, 59, 48, 0.3)',
                    borderRadius: '6px',
                    padding: '0.75rem',
                    marginBottom: '1.5rem',
                    color: '#ff3b30',
                    fontSize: isMobile ? '0.8rem' : '0.9rem',
                    fontFamily: 'Arame Mono, monospace',
                  }}
                >
                  {error}
                </motion.div>
              )}

              {/* Step 1: Email Verification */}
              {step === 1 && (
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
                    Masukkan email yang terdaftar di akun Anda
                  </p>

                  <form onSubmit={handleEmailSubmit} style={{ width: '100%' }}>
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
                        placeholder="contoh: user@example.com"
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

                    <button
                      type="submit"
                      disabled={isLoading || !email}
                      style={{
                        width: '100%',
                        background: isLoading || !email
                          ? 'rgba(255,255,255,0.1)' 
                          : 'rgba(255,255,255,0.2)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        borderRadius: '6px',
                        color: isLoading || !email ? 'rgba(255,255,255,0.5)' : 'white',
                        cursor: isLoading || !email ? 'not-allowed' : 'pointer',
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
                        'Verifikasi Email'
                      )}
                    </button>
                  </form>

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
                    Kembali ke Login
                  </button>
                </>
              )}

              {/* Step 2: Current Password Verification */}
              {step === 2 && (
                <>
                  <h2 style={{
                    color: 'white',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    textAlign: 'left',
                    fontFamily: 'Arame Mono, monospace',
                    ...styles.title
                  }}>
                    Verifikasi Keamanan
                  </h2>

                  <p style={{
                    color: 'rgba(255,255,255,0.8)',
                    marginBottom: '2rem',
                    textAlign: 'left',
                    fontFamily: 'Arame Mono, monospace',
                    ...styles.description
                  }}>
                    Email terverifikasi: <strong>{email}</strong>
                  </p>

                  <form onSubmit={handleCurrentPasswordSubmit} style={{ width: '100%' }}>
                    {renderPasswordInput(
                      "Password Saat Ini",
                      currentPassword,
                      setCurrentPassword,
                      "Masukkan password saat ini",
                      showCurrentPassword,
                      setShowCurrentPassword,
                      !!error
                    )}

                    <div style={{
                      display: 'flex',
                      gap: '1rem',
                      marginBottom: '1rem'
                    }}>
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

                      <button
                        type="submit"
                        disabled={isLoading || !currentPassword}
                        style={{
                          flex: 2,
                          background: isLoading || !currentPassword
                            ? 'rgba(255,255,255,0.1)' 
                            : 'rgba(255,255,255,0.2)',
                          border: '1px solid rgba(255,255,255,0.3)',
                          borderRadius: '6px',
                          color: isLoading || !currentPassword ? 'rgba(255,255,255,0.5)' : 'white',
                          cursor: isLoading || !currentPassword ? 'not-allowed' : 'pointer',
                          fontFamily: 'Arame Mono, monospace',
                          padding: '0.75rem',
                          fontSize: '0.9rem',
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
                    </div>
                  </form>

                  <p style={{
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '0.8rem',
                    fontFamily: 'Arame Mono, monospace',
                    marginTop: '1rem',
                    textAlign: 'center'
                  }}>
                    *Masukkan password saat ini untuk melanjutkan
                  </p>
                </>
              )}

              {/* Step 3: New Password */}
              {step === 3 && (
                <>
                  <h2 style={{
                    color: 'white',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    textAlign: 'left',
                    fontFamily: 'Arame Mono, monospace',
                    ...styles.title
                  }}>
                    Password Baru
                  </h2>

                  <p style={{
                    color: 'rgba(255,255,255,0.8)',
                    marginBottom: '2rem',
                    textAlign: 'left',
                    fontFamily: 'Arame Mono, monospace',
                    ...styles.description
                  }}>
                    Buat password baru untuk akun: <strong>{email}</strong>
                  </p>

                  <form onSubmit={handlePasswordChange} style={{ width: '100%' }}>
                    {renderPasswordInput(
                      "Password Baru",
                      newPassword,
                      setNewPassword,
                      "Minimal 6 karakter",
                      showNewPassword,
                      setShowNewPassword,
                      !!error
                    )}

                    {renderPasswordInput(
                      "Konfirmasi Password Baru",
                      confirmPassword,
                      setConfirmPassword,
                      "Ulangi password baru",
                      showConfirmPassword,
                      setShowConfirmPassword,
                      !!error
                    )}

                    <div style={{
                      display: 'flex',
                      gap: '1rem',
                      marginBottom: '1rem'
                    }}>
                      <button
                        type="button"
                        onClick={handleBackToStep2}
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

                      <button
                        type="submit"
                        disabled={isLoading || !newPassword || !confirmPassword}
                        style={{
                          flex: 2,
                          background: isLoading || !newPassword || !confirmPassword
                            ? 'rgba(255,255,255,0.1)' 
                            : 'rgba(255,255,255,0.2)',
                          border: '1px solid rgba(255,255,255,0.3)',
                          borderRadius: '6px',
                          color: isLoading || !newPassword || !confirmPassword 
                            ? 'rgba(255,255,255,0.5)' 
                            : 'white',
                          cursor: isLoading || !newPassword || !confirmPassword 
                            ? 'not-allowed' 
                            : 'pointer',
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
                      marginBottom: '0.5rem',
                      fontWeight: '600'
                    }}>
                      Persyaratan Password:
                    </p>
                    <ul style={{
                      color: newPassword.length >= 6 ? 'rgba(0, 255, 0, 0.7)' : 'rgba(255,255,255,0.6)',
                      fontSize: '0.75rem',
                      fontFamily: 'Arame Mono, monospace',
                      margin: 0,
                      paddingLeft: '1rem',
                      listStyleType: 'disc'
                    }}>
                      <li>✓ Minimal 6 karakter {newPassword.length >= 6 && '✓'}</li>
                    </ul>
                    <ul style={{
                      color: newPassword === confirmPassword && confirmPassword ? 'rgba(0, 255, 0, 0.7)' : 'rgba(255,255,255,0.6)',
                      fontSize: '0.75rem',
                      fontFamily: 'Arame Mono, monospace',
                      margin: '0.5rem 0 0 0',
                      paddingLeft: '1rem',
                      listStyleType: 'disc'
                    }}>
                      <li>✓ Password harus sama {newPassword === confirmPassword && confirmPassword && '✓'}</li>
                    </ul>
                  </div>
                </>
              )}
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
