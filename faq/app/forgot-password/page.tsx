'use client';

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ForgotPasswordPageProps {
  onClose: () => void;
  onSwitchToSignIn: () => void;
}

export default function ForgotPasswordPage({ onClose, onSwitchToSignIn }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic untuk reset password
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
        {/* Line Box yang lebih besar */}
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
            justifyContent: 'center',
            alignItems: 'center',
            padding: '2rem'
          }}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* Judul */}
          <h2 style={{
            color: 'white',
            fontSize: '2rem',
            fontWeight: '600',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            Forgot Password
          </h2>

          {/* Deskripsi */}
          <p style={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: '1rem',
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            Enter your email to receive a password reset link
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ width: '80%' }}>
            {/* Email Input */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                color: 'white',
                marginBottom: '0.5rem',
                fontSize: '0.9rem'
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
                  outline: 'none'
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
                marginBottom: '1rem'
              }}
            >
              Send Reset Email
            </button>
          </form>

          {/* Tombol Kembali */}
          <button
            onClick={onSwitchToSignIn}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.8)',
              cursor: 'pointer',
              fontSize: '0.9rem',
              textDecoration: 'underline'
            }}
          >
            Back to Sign In
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
