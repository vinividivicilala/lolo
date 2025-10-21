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
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Main Line Box Container */}
        <motion.div
          style={{
            background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: '20px',
            padding: '0',
            maxWidth: '450px',
            width: '90%',
            position: 'relative',
            border: '1px solid rgba(255,255,255,0.8)',
            boxShadow: `
              0 25px 50px rgba(0,0,0,0.25),
              inset 0 1px 0 rgba(255,255,255,0.8),
              inset 0 -1px 0 rgba(0,0,0,0.1)
            `,
            overflow: 'hidden'
          }}
          initial={{ scale: 0.8, opacity: 0, y: 50, rotateX: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50, rotateX: 10 }}
          transition={{ duration: 0.6, ease: "backOut" }}
        >
          {/* Decorative Top Accent */}
          <div style={{
            height: '4px',
            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
            width: '100%'
          }} />

          {/* Close Button */}
          <motion.button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1.2rem',
              right: '1.5rem',
              background: 'rgba(0,0,0,0.05)',
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b',
              fontSize: '1.3rem',
              fontWeight: '300',
              backdropFilter: 'blur(10px)'
            }}
            whileHover={{ 
              backgroundColor: 'rgba(0,0,0,0.1)', 
              scale: 1.1,
              border: '1px solid rgba(0,0,0,0.2)'
            }}
            whileTap={{ scale: 0.9 }}
          >
            ×
          </motion.button>

          {/* Content Container */}
          <div style={{ padding: '3rem 2.5rem 2.5rem 2.5rem' }}>
            
            {/* Header Section with Enhanced Design */}
            <motion.div 
              style={{ 
                textAlign: 'center', 
                marginBottom: '2.5rem',
                position: 'relative'
              }}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {/* Icon Container */}
              <div style={{
                width: '70px',
                height: '70px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem auto',
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
              }}>
                <span style={{ fontSize: '1.8rem', color: 'white' }}>🔒</span>
              </div>

              {/* Title */}
              <motion.h2
                style={{
                  fontSize: '2rem',
                  fontWeight: '700',
                  color: '#1e293b',
                  margin: '0 0 0.8rem 0',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.5px'
                }}
              >
                Forgot Password
              </motion.h2>

              {/* Description */}
              <motion.p
                style={{
                  fontSize: '1rem',
                  color: '#64748b',
                  margin: 0,
                  fontFamily: 'Inter, system-ui, sans-serif',
                  lineHeight: '1.6',
                  fontWeight: '400'
                }}
              >
                Enter your email to receive a password reset link
              </motion.p>
            </motion.div>

            {!isSubmitted ? (
              <motion.form 
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {/* Email Input with Enhanced Design */}
                <div style={{ marginBottom: '2rem' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '0.75rem',
                      fontFamily: 'Inter, system-ui, sans-serif',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Email Address
                  </label>
                  
                  <motion.input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    style={{
                      width: '100%',
                      padding: '1rem 1.2rem',
                      background: 'rgba(255,255,255,0.8)',
                      border: '2px solid #e2e8f0',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      fontFamily: 'Inter, system-ui, sans-serif',
                      color: '#1e293b',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                    }}
                    whileFocus={{
                      border: '2px solid #667eea',
                      background: 'rgba(255,255,255,1)',
                      boxShadow: '0 4px 20px rgba(102, 126, 234, 0.15)'
                    }}
                  />
                </div>

                {/* Submit Button with Enhanced Design */}
                <motion.button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '1.1rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.3)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  Send Reset Email
                </motion.button>
              </motion.form>
            ) : (
              <motion.div
                style={{ textAlign: 'center', padding: '2rem 0' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div 
                  style={{ 
                    fontSize: '4rem', 
                    marginBottom: '1.5rem',
                    filter: 'drop-shadow(0 8px 20px rgba(102, 126, 234, 0.3))'
                  }}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6, type: "spring" }}
                >
                  ✉️
                </motion.div>
                <p style={{ 
                  color: '#64748b', 
                  marginBottom: '0', 
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontSize: '1rem',
                  lineHeight: '1.6',
                  fontWeight: '500'
                }}>
                  Password reset email has been sent to your email address
                </p>
              </motion.div>
            )}

            {/* Back to Sign In with Enhanced Design */}
            <motion.div 
              style={{ 
                textAlign: 'center', 
                marginTop: '2rem',
                paddingTop: '2rem',
                borderTop: '1px solid #f1f5f9'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <motion.button
                onClick={onSwitchToSignIn}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.3s ease'
                }}
                whileHover={{ 
                  color: '#667eea',
                  border: '1px solid #667eea',
                  background: 'rgba(102, 126, 234, 0.05)',
                  scale: 1.05
                }}
              >
                ← Back to Sign In
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
