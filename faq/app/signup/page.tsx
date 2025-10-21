'use client';

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface SignUpPageProps {
  onClose: () => void;
  onSwitchToSignIn: () => void;
}

export default function SignUpPage({ onClose, onSwitchToSignIn }: SignUpPageProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    
    // Simulasi proses pendaftaran
    setTimeout(() => {
      setIsLoading(false);
      onClose();
      // Redirect setelah sign up berhasil
      router.push('/dashboard');
    }, 1500);
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
          zIndex: 1000,
          padding: '1rem'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          style={{
            background: 'white',
            borderRadius: '12px',
            padding: '3rem',
            maxWidth: '500px',
            width: '100%',
            position: 'relative',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            border: '2px solid #667eea'
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
              top: '1rem',
              right: '1rem',
              background: 'rgba(0,0,0,0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#333',
              fontSize: '1rem',
              zIndex: 1001
            }}
            whileHover={{ backgroundColor: 'rgba(0,0,0,0.2)', scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            ×
          </motion.button>

          {/* Header Section */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2
              style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: '#333',
                margin: '0 0 0.5rem 0',
                fontFamily: 'Arame Mono, monospace',
                lineHeight: '1.2'
              }}
            >
              Create an account
            </h2>
            
            <p
              style={{
                fontSize: '1.1rem',
                color: '#666',
                margin: 0,
                fontFamily: 'Arame Mono, monospace',
                lineHeight: '1.5'
              }}
            >
              Sign up to join our community
            </p>
          </div>

          {/* Sign Up Form */}
          <form onSubmit={handleSignUp}>
            <div style={{ marginBottom: '1.5rem' }}>
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontFamily: 'Arame Mono, monospace',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#ddd'}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontFamily: 'Arame Mono, monospace',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#ddd'}
              />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontFamily: 'Arame Mono, monospace',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#ddd'}
              />
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '1rem',
                background: '#667eea',
                border: '2px solid #667eea',
                borderRadius: '8px',
                color: 'white',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontFamily: 'Arame Mono, monospace',
                marginBottom: '1.5rem',
                opacity: isLoading ? 0.7 : 1,
                transition: 'all 0.3s ease'
              }}
              whileHover={!isLoading ? { 
                backgroundColor: 'white', 
                color: '#667eea',
                scale: 1.02
              } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
            >
              {isLoading ? 'Signing Up...' : 'Sign Up'}
            </motion.button>
          </form>

          {/* Sign In Link */}
          <div
            style={{
              textAlign: 'center',
              fontSize: '1rem',
              color: '#666',
              fontFamily: 'Arame Mono, monospace'
            }}
          >
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToSignIn}
              style={{
                background: 'none',
                border: 'none',
                color: '#667eea',
                cursor: 'pointer',
                fontFamily: 'Arame Mono, monospace',
                fontSize: '1rem',
                fontWeight: '600',
                textDecoration: 'underline',
                padding: 0
              }}
            >
              Sign in
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
