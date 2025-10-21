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
        {/* Line Box Container */}
        <motion.div
          style={{
            background: 'white',
            borderRadius: '8px',
            padding: '2rem',
            maxWidth: '400px',
            width: '90%',
            position: 'relative',
            border: '2px solid #e0e0e0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* Close Button */}
          <motion.button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '0.5rem',
              right: '0.5rem',
              background: 'none',
              border: 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#666',
              fontSize: '1.2rem',
              fontWeight: '300'
            }}
            whileHover={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
            whileTap={{ scale: 0.9 }}
          >
            ×
          </motion.button>

          {/* Header Section inside Line Box */}
          <div style={{ 
            textAlign: 'left', 
            marginBottom: '1.5rem',
            borderBottom: '1px solid #f0f0f0',
            paddingBottom: '1rem'
          }}>
            <motion.h2
              style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#1a1a1a',
                margin: '0 0 0.5rem 0',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}
            >
              Forgot Password
            </motion.h2>
            <motion.p
              style={{
                fontSize: '0.9rem',
                color: '#666',
                margin: 0,
                fontFamily: 'system-ui, -apple-system, sans-serif',
                lineHeight: '1.4'
              }}
            >
              Enter your email to receive a password reset link
            </motion.p>
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit}>
              {/* Email Label */}
              <div style={{ marginBottom: '0.5rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    color: '#1a1a1a',
                    marginBottom: '0.5rem',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                  }}
                >
                  Email
                </label>
              </div>

              {/* Email Input */}
              <div style={{ marginBottom: '1.5rem' }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '0.9rem',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#007bff',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  marginBottom: '1rem'
                }}
                whileHover={{ backgroundColor: '#0056b3' }}
                whileTap={{ scale: 0.98 }}
              >
                Send Reset Email
              </motion.button>
            </form>
          ) : (
            <motion.div
              style={{ textAlign: 'center', padding: '1rem 0' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📧</div>
              <p style={{ 
                color: '#666', 
                marginBottom: '1rem', 
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: '0.9rem'
              }}>
                Password reset email has been sent to your email address
              </p>
            </motion.div>
          )}

          {/* Back to Sign In */}
          <div style={{ textAlign: 'center', paddingTop: '1rem', borderTop: '1px solid #f0f0f0' }}>
            <motion.button
              onClick={onSwitchToSignIn}
              style={{
                background: 'none',
                border: 'none',
                color: '#007bff',
                cursor: 'pointer',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: '0.9rem',
                textDecoration: 'none'
              }}
              whileHover={{ color: '#0056b3' }}
            >
              Back to Sign In
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
