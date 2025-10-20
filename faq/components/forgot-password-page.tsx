'use client';

import React, { useState } from "react";
import { motion } from "framer-motion";

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
    <motion.div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.9)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '20px',
          padding: '3rem',
          maxWidth: '450px',
          width: '100%',
          position: 'relative',
          backdropFilter: 'blur(20px)'
        }}
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
      >
        {/* Close Button */}
        <motion.button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
            background: 'rgba(0,0,0,0.1)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#333',
            fontSize: '1.2rem'
          }}
          whileHover={{ backgroundColor: 'rgba(0,0,0,0.2)', scale: 1.1 }}
        >
          ×
        </motion.button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <motion.h2
            style={{
              fontSize: '2rem',
              fontWeight: '600',
              color: '#333',
              margin: '0 0 0.5rem 0',
              fontFamily: 'Arame Mono, monospace'
            }}
          >
            Lupa Password
          </motion.h2>
          <motion.p
            style={{
              fontSize: '1rem',
              color: '#666',
              margin: 0,
              fontFamily: 'Arame Mono, monospace'
            }}
          >
            {isSubmitted 
              ? "Cek email Anda untuk link reset password" 
              : "Masukkan email Anda untuk reset password"
            }
          </motion.p>
        </div>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan email Anda"
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontFamily: 'Arame Mono, monospace'
                }}
              />
            </div>

            <motion.button
              type="submit"
              style={{
                width: '100%',
                padding: '1rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                fontFamily: 'Arame Mono, monospace'
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Kirim Link Reset
            </motion.button>
          </form>
        ) : (
          <motion.div
            style={{ textAlign: 'center' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>
              Link reset password telah dikirim ke email Anda
            </p>
          </motion.div>
        )}

        {/* Back to Sign In */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <motion.button
            onClick={onSwitchToSignIn}
            style={{
              background: 'none',
              border: 'none',
              color: '#667eea',
              cursor: 'pointer',
              fontFamily: 'Arame Mono, monospace',
              fontSize: '0.9rem',
              textDecoration: 'underline'
            }}
            whileHover={{ color: '#764ba2' }}
          >
            Kembali ke halaman Masuk
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
