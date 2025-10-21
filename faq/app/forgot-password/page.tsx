'use client';

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface ForgotPasswordPageProps {
  onClose?: () => void;
}

export default function ForgotPasswordPage({ onClose }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic untuk reset password
    console.log("Reset password for:", email);
    setIsSubmitted(true);
  };

  const handleBackToSignIn = () => {
    // Gunakan router untuk kembali ke halaman signin
    router.push('/signin'); // Ganti dengan route halaman signin Anda
  };

  const handleClose = () => {
    if (onClose && typeof onClose === 'function') {
      onClose();
    } else {
      // Jika tidak ada onClose, gunakan router untuk kembali
      router.back();
    }
  };

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
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Line Box */}
        <motion.div
          style={{
            background: 'transparent',
            borderRadius: '12px',
            width: '600px',
            height: '400px',
            position: 'relative',
            border: '1px solid rgba(255,255,255,0.3)',
            display: 'flex',
            flexDirection: 'column',
            padding: '3rem',
            backgroundColor: 'rgba(0,0,0,0.7)'
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
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
              fontSize: '1.2rem',
              fontFamily: 'Arame Mono, monospace'
            }}
          >
            ×
          </button>

          {!isSubmitted ? (
            <>
              {/* Judul */}
              <h2 style={{
                color: 'white',
                fontSize: '2rem',
                fontWeight: '600',
                marginBottom: '1rem',
                textAlign: 'left',
                fontFamily: 'Arame Mono, monospace'
              }}>
                Forgot Password
              </h2>

              {/* Deskripsi */}
              <p style={{
                color: 'rgba(255,255,255,0.8)',
                fontSize: '1rem',
                marginBottom: '2rem',
                textAlign: 'left',
                fontFamily: 'Arame Mono, monospace'
              }}>
                Enter your email to receive a password reset link
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                {/* Email Input */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    color: 'white',
                    marginBottom: '0.5rem',
                    fontSize: '0.9rem',
                    fontFamily: 'Arame Mono, monospace'
                  }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      borderRadius: '6px',
                      color: 'white',
                      fontSize: '1rem',
                      outline: 'none',
                      fontFamily: 'Arame Mono, monospace'
                    }}
                  />
                </div>

                {/* Tombol Kirim */}
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(255,255,255,0.2)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    marginBottom: '1rem',
                    fontFamily: 'Arame Mono, monospace'
                  }}
                >
                  Send Reset Email
                </button>
              </form>

              {/* Tombol Kembali */}
              <button
                onClick={handleBackToSignIn}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.8)',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
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
            /* Success State */
            <div style={{ textAlign: 'center', width: '100%' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
              <h3 style={{
                color: 'white',
                fontSize: '1.5rem',
                marginBottom: '1rem',
                fontFamily: 'Arame Mono, monospace'
              }}>
                Check Your Email
              </h3>
              <p style={{
                color: 'rgba(255,255,255,0.8)',
                fontSize: '1rem',
                marginBottom: '2rem',
                fontFamily: 'Arame Mono, monospace'
              }}>
                We've sent a password reset link to your email
              </p>
              <button
                onClick={handleBackToSignIn}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '6px',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  cursor: 'pointer',
                  fontFamily: 'Arame Mono, monospace'
                }}
              >
                Back to Sign In
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
