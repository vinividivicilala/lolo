'use client';

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  getAuth, 
  signInWithEmailAndPassword,
  updatePassword
} from "firebase/auth";
import { initializeApp, getApps } from "firebase/app";

// Konfigurasi Firebase (hanya objek, tidak diinisialisasi)
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

interface ForgotPasswordPageProps {
  onClose?: () => void;
}

export default function ForgotPasswordPage({ onClose }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isClient, setIsClient] = useState(false); // State untuk cek client/server
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [showTopics, setShowTopics] = useState(false);

  // Deteksi client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Inisialisasi Firebase HANYA di client side
  useEffect(() => {
    if (!isClient) return;

    try {
      if (getApps().length === 0) {
        initializeApp(firebaseConfig);
      }
    } catch (error) {
      console.error('Firebase initialization error:', error);
    }
  }, [isClient]);

  // Check if mobile on component mount and window resize
  useEffect(() => {
    if (!isClient) return;

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, [isClient]);

  // Fungsi untuk mendapatkan auth instance
  const getAuthInstance = () => {
    if (!isClient) return null;
    return getAuth();
  };

  const handleTopicsClick = () => {
    setShowTopics(!showTopics);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!isClient) return;

    try {
      const authInstance = getAuthInstance();
      if (!authInstance) return;

      // Cek apakah email terdaftar dengan mencoba sign in
      await signInWithEmailAndPassword(authInstance, email, "dummyPassword123!");
      
    } catch (err: any) {
      // Jika error adalah "wrong-password", berarti email terdaftar
      if (err.code === 'auth/wrong-password') {
        setShowResetForm(true);
        setSuccess("Email verified. Please enter your current password to continue.");
      } else if (err.code === 'auth/user-not-found') {
        setError("Email not found. Please check your email address.");
      } else if (err.code === 'auth/invalid-email') {
        setError("Invalid email address.");
      } else if (err.code === 'auth/too-many-requests') {
        setError("Too many attempts. Please try again later.");
      } else {
        setShowResetForm(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validasi password
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    if (!currentPassword) {
      setError("Please enter your current password.");
      return;
    }

    if (!isClient) return;

    setIsLoading(true);

    try {
      const authInstance = getAuthInstance();
      if (!authInstance) return;

      // 1. Login dengan password lama
      const userCredential = await signInWithEmailAndPassword(authInstance, email, currentPassword);
      const user = userCredential.user;
      
      // 2. Update password ke password baru
      await updatePassword(user, newPassword);
      
      // 3. Tampilkan pesan sukses
      setSuccess("Password updated successfully!");
      setIsSubmitted(true);
      
      // 4. Auto redirect setelah 3 detik
      setTimeout(() => {
        router.push('/signin');
      }, 3000);
      
    } catch (err: any) {
      switch (err.code) {
        case 'auth/wrong-password':
          setError("Current password is incorrect.");
          break;
        case 'auth/weak-password':
          setError("New password is too weak. Please use a stronger password.");
          break;
        case 'auth/requires-recent-login':
          setError("For security, please login again and try resetting password.");
          break;
        case 'auth/user-not-found':
          setError("User not found. Please check your email.");
          break;
        case 'auth/too-many-requests':
          setError("Too many attempts. Please try again later.");
          break;
        default:
          setError("An error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
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
      minHeight: '450px',
      padding: '3rem',
      marginBottom: '2rem',
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

  // Loading state untuk server rendering
  if (!isClient) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{ color: 'white', fontSize: '1rem' }}>Loading...</div>
      </div>
    );
  }

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

          {!isSubmitted ? (
            !showResetForm ? (
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
                  Forgot Password
                </h2>

                {/* Deskripsi */}
                <p style={{
                  color: 'rgba(255,255,255,0.8)',
                  marginBottom: '2rem',
                  textAlign: 'left',
                  fontFamily: 'Arame Mono, monospace',
                  ...styles.description
                }}>
                  Enter your registered email to reset password
                </p>

                {/* Error Message */}
                {error && (
                  <div style={{
                    backgroundColor: 'rgba(255, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 0, 0, 0.3)',
                    borderRadius: '6px',
                    padding: '0.75rem',
                    marginBottom: '1.5rem',
                    color: '#ff6b6b',
                    fontSize: isMobile ? '0.8rem' : '0.9rem',
                    fontFamily: 'Arame Mono, monospace'
                  }}>
                    {error}
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                  {/* Email Input */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{
                      display: 'block',
                      color: 'white',
                      marginBottom: '0.5rem',
                      fontSize: isMobile ? '0.8rem' : '0.9rem',
                      fontFamily: 'Arame Mono, monospace'
                    }}>
                      Registered Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your registered email"
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

                  {/* Tombol Kirim */}
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
                      opacity: isLoading ? 0.7 : 1
                    }}
                  >
                    {isLoading ? 'Verifying...' : 'Verify Email'}
                  </button>
                </form>

                {/* Tombol Kembali */}
                <button
                  onClick={handleBackToSignIn}
                  disabled={isLoading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: isLoading ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.8)',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    fontSize: isMobile ? '0.8rem' : '0.9rem',
                    textDecoration: 'underline',
                    fontFamily: 'Arame Mono, monospace',
                    alignSelf: 'flex-start',
                    padding: 0
                  }}
                >
                  Back to Sign In
                </button>
              </>
            ) : (
              /* Reset Password Form */
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
                  Enter your current password and new password
                </p>

                {/* Success Message */}
                {success && (
                  <div style={{
                    backgroundColor: 'rgba(0, 255, 0, 0.1)',
                    border: '1px solid rgba(0, 255, 0, 0.3)',
                    borderRadius: '6px',
                    padding: '0.75rem',
                    marginBottom: '1.5rem',
                    color: '#51cf66',
                    fontSize: isMobile ? '0.8rem' : '0.9rem',
                    fontFamily: 'Arame Mono, monospace'
                  }}>
                    {success}
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div style={{
                    backgroundColor: 'rgba(255, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 0, 0, 0.3)',
                    borderRadius: '6px',
                    padding: '0.75rem',
                    marginBottom: '1.5rem',
                    color: '#ff6b6b',
                    fontSize: isMobile ? '0.8rem' : '0.9rem',
                    fontFamily: 'Arame Mono, monospace'
                  }}>
                    {error}
                  </div>
                )}

                {/* Reset Password Form */}
                <form onSubmit={handleResetPassword} style={{ width: '100%' }}>
                  {/* Current Password Input */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{
                      display: 'block',
                      color: 'white',
                      marginBottom: '0.5rem',
                      fontSize: isMobile ? '0.8rem' : '0.9rem',
                      fontFamily: 'Arame Mono, monospace'
                    }}>
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter your current password"
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

                  {/* New Password Input */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{
                      display: 'block',
                      color: 'white',
                      marginBottom: '0.5rem',
                      fontSize: isMobile ? '0.8rem' : '0.9rem',
                      fontFamily: 'Arame Mono, monospace'
                    }}>
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min 6 characters)"
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
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{
                      display: 'block',
                      color: 'white',
                      marginBottom: '0.5rem',
                      fontSize: isMobile ? '0.8rem' : '0.9rem',
                      fontFamily: 'Arame Mono, monospace'
                    }}>
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your new password"
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

                  {/* Tombol Reset Password */}
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
                      opacity: isLoading ? 0.7 : 1
                    }}
                  >
                    {isLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </form>

                {/* Tombol Kembali */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%'
                }}>
                  <button
                    onClick={() => setShowResetForm(false)}
                    disabled={isLoading}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: isLoading ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.8)',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      fontSize: isMobile ? '0.8rem' : '0.9rem',
                      textDecoration: 'underline',
                      fontFamily: 'Arame Mono, monospace',
                      padding: 0
                    }}
                  >
                    Back to Email
                  </button>

                  <button
                    onClick={handleBackToSignIn}
                    disabled={isLoading}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: isLoading ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.8)',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      fontSize: isMobile ? '0.8rem' : '0.9rem',
                      textDecoration: 'underline',
                      fontFamily: 'Arame Mono, monospace',
                      padding: 0
                    }}
                  >
                    Back to Sign In
                  </button>
                </div>
              </>
            )
          ) : (
            /* Success State */
            <div style={{ 
              textAlign: 'center', 
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%'
            }}>
              <div style={{ 
                fontSize: isMobile ? '2rem' : '3rem', 
                marginBottom: '1rem' 
              }}>✅</div>
              <h3 style={{
                color: 'white',
                fontSize: isMobile ? '1.2rem' : '1.5rem',
                marginBottom: '1rem',
                fontFamily: 'Arame Mono, monospace'
              }}>
                Password Updated!
              </h3>
              <p style={{
                color: 'rgba(255,255,255,0.8)',
                fontSize: isMobile ? '0.9rem' : '1rem',
                marginBottom: '2rem',
                fontFamily: 'Arame Mono, monospace'
              }}>
                Your password has been successfully updated.
                <br />
                Redirecting to sign in...
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
                  fontFamily: 'Arame Mono, monospace'
                }}
              >
                Go to Sign In
              </button>
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
