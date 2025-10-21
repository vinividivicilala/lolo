'use client';

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ForgotPasswordPageProps {
  onClose: () => void;
  onSwitchToSignIn: () => void;
}

export default function ForgotPasswordPage({ onClose, onSwitchToSignIn }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic untuk reset password
    setIsSubmitted(true);
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
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Background Portrait Image - Large and Centered */}
        <motion.div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '300px',
            height: '500px',
            backgroundImage: 'url(images/5.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            borderRadius: '15px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
          }}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
        />

        {/* White Overlay Box - Covering the form area */}
        <motion.div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '320px',
            height: '520px',
            backgroundColor: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(25px)',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.3)',
            boxShadow: '0 25px 80px rgba(0,0,0,0.4)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '2.5rem'
          }}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Close Button */}
          <motion.button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.4)',
              borderRadius: '50%',
              width: '35px',
              height: '35px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
              fontSize: '1.1rem',
              backdropFilter: 'blur(10px)'
            }}
            whileHover={{ 
              backgroundColor: 'rgba(255,255,255,0.3)', 
              scale: 1.1,
              border: '1px solid rgba(255,255,255,0.6)'
            }}
            whileTap={{ scale: 0.9 }}
          >
            ×
          </motion.button>

          {/* Header Section */}
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <motion.h2
              style={{
                fontSize: '1.8rem',
                fontWeight: '700',
                color: 'white',
                margin: '0 0 1rem 0',
                fontFamily: 'Arame Mono, monospace',
                textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                letterSpacing: '1px'
              }}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              RESET PASSWORD
            </motion.h2>
            <motion.p
              style={{
                fontSize: '0.9rem',
                color: 'rgba(255,255,255,0.9)',
                margin: 0,
                fontFamily: 'Arame Mono, monospace',
                lineHeight: '1.5',
                textShadow: '0 1px 5px rgba(0,0,0,0.3)'
              }}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {isSubmitted 
                ? "Cek inbox email Anda untuk instruksi reset password" 
                : "Masukkan email terdaftar untuk mendapatkan link reset"
              }
            </motion.p>
          </div>

          {!isSubmitted ? (
            <motion.form 
              onSubmit={handleSubmit}
              style={{ width: '100%' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Email Input */}
              <div style={{ marginBottom: '2rem', position: 'relative' }}>
                <motion.input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  required
                  style={{
                    width: '100%',
                    padding: '1rem 1.2rem',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '12px',
                    fontSize: '0.95rem',
                    fontFamily: 'Arame Mono, monospace',
                    color: 'white',
                    backdropFilter: 'blur(10px)',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  whileFocus={{
                    background: 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(255,255,255,0.6)',
                    boxShadow: '0 0 20px rgba(255,255,255,0.2)'
                  }}
                />
                <motion.span
                  style={{
                    position: 'absolute',
                    left: '1.2rem',
                    top: '-0.6rem',
                    background: 'rgba(0,0,0,0.4)',
                    padding: '0 0.5rem',
                    fontSize: '0.75rem',
                    color: 'rgba(255,255,255,0.9)',
                    fontFamily: 'Arame Mono, monospace'
                  }}
                >
                  Email
                </motion.span>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                style={{
                  width: '100%',
                  padding: '1.1rem',
                  background: 'linear-gradient(135deg, rgba(102,126,234,0.9) 0%, rgba(118,75,162,0.9) 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontFamily: 'Arame Mono, monospace',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
                whileHover={{ 
                  scale: 1.03, 
                  boxShadow: '0 10px 25px rgba(102,126,234,0.4)',
                  background: 'linear-gradient(135deg, rgba(102,126,234,1) 0%, rgba(118,75,162,1) 100%)'
                }}
                whileTap={{ scale: 0.97 }}
              >
                Kirim Link Reset
              </motion.button>
            </motion.form>
          ) : (
            <motion.div
              style={{ textAlign: 'center' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div 
                style={{ 
                  fontSize: '3.5rem', 
                  marginBottom: '1.5rem',
                  filter: 'drop-shadow(0 5px 15px rgba(0,0,0,0.3))'
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
              >
                ✉️
              </motion.div>
              <p style={{ 
                color: 'rgba(255,255,255,0.95)', 
                marginBottom: '2rem', 
                fontFamily: 'Arame Mono, monospace',
                fontSize: '0.95rem',
                lineHeight: '1.6',
                textShadow: '0 1px 5px rgba(0,0,0,0.3)'
              }}>
                Link reset password telah dikirim ke email Anda. Silakan cek folder spam jika tidak ditemukan.
              </p>
            </motion.div>
          )}

          {/* Back to Sign In */}
          <motion.div 
            style={{ textAlign: 'center', marginTop: '2rem' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <motion.button
              onClick={onSwitchToSignIn}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.9)',
                cursor: 'pointer',
                fontFamily: 'Arame Mono, monospace',
                fontSize: '0.85rem',
                textDecoration: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease'
              }}
              whileHover={{ 
                color: 'white',
                border: '1px solid rgba(255,255,255,0.4)',
                background: 'rgba(255,255,255,0.1)',
                scale: 1.05
              }}
            >
              ← Kembali ke Sign In
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
