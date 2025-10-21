'use client';

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
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

  const handleSignIn = () => {
    onClose();
    router.push('/signin');
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
          backgroundColor: 'rgba(0,0,0,0.9)',
          display: 'flex',
          zIndex: 1000
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Foto Portrait di Kiri - Full Height */}
        <motion.div
          style={{
            flex: 1,
            position: 'relative',
            height: '100vh'
          }}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Image
            src="/images/5.jpg"
            alt="Portrait"
            fill
            style={{
              objectFit: 'cover',
              display: 'block'
            }}
            priority
          />
        </motion.div>

        {/* Konten Form di Kanan */}
        <motion.div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '3rem',
            maxWidth: '500px',
            margin: '0 auto'
          }}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {/* Judul dan Deskripsi - Rata Kiri */}
          <div style={{ marginBottom: '3rem' }}>
            <motion.h1
              style={{
                fontSize: '3rem',
                fontWeight: '700',
                color: 'white',
                margin: '0 0 1rem 0',
                fontFamily: 'Arame Mono, monospace',
                lineHeight: '1.2',
                textAlign: 'left'
              }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              Create an account
            </motion.h1>

            <motion.p
              style={{
                fontSize: '1.2rem',
                color: 'rgba(255,255,255,0.8)',
                margin: 0,
                fontFamily: 'Arame Mono, monospace',
                lineHeight: '1.5',
                textAlign: 'left'
              }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              Sign up to join our community
            </motion.p>
          </div>

          {/* Form Sign Up */}
          <motion.form
            onSubmit={handleSignUp}
            style={{
              width: '100%'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            {/* Full Name Input */}
            <div style={{ marginBottom: '1.5rem' }}>
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                style={{
                  width: '100%',
                  padding: '1rem 1.5rem',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontFamily: 'Arame Mono, monospace',
                  background: 'rgba(255,255,255,0.08)',
                  color: 'white',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }}
                onFocus={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.12)';
                  e.target.style.borderColor = 'rgba(255,255,255,0.4)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.08)';
                  e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Email Input */}
            <div style={{ marginBottom: '1.5rem' }}>
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                style={{
                  width: '100%',
                  padding: '1rem 1.5rem',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontFamily: 'Arame Mono, monospace',
                  background: 'rgba(255,255,255,0.08)',
                  color: 'white',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }}
                onFocus={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.12)';
                  e.target.style.borderColor = 'rgba(255,255,255,0.4)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.08)';
                  e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Password Input */}
            <div style={{ marginBottom: '2.5rem' }}>
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                style={{
                  width: '100%',
                  padding: '1rem 1.5rem',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontFamily: 'Arame Mono, monospace',
                  background: 'rgba(255,255,255,0.08)',
                  color: 'white',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }}
                onFocus={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.12)';
                  e.target.style.borderColor = 'rgba(255,255,255,0.4)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.08)';
                  e.target.style.borderColor = 'rgba(255,255,255,0.2)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Modern Sign Up Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '1.2rem 2rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontFamily: 'Arame Mono, monospace',
                marginBottom: '2rem',
                opacity: isLoading ? 0.7 : 1,
                position: 'relative',
                overflow: 'hidden'
              }}
              whileHover={!isLoading ? { 
                scale: 1.02,
                boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)'
              } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
            >
              {isLoading ? (
                <motion.div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid transparent',
                      borderTop: '2px solid white',
                      borderRadius: '50%'
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Creating Account...
                </motion.div>
              ) : (
                <motion.div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  Get Started
                  <motion.svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </motion.svg>
                </motion.div>
              )}
            </motion.button>
          </motion.form>

          {/* Sign In Link */}
          <motion.div
            style={{
              textAlign: 'center',
              fontSize: '1rem',
              color: 'rgba(255,255,255,0.7)',
              fontFamily: 'Arame Mono, monospace'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            Already have an account?{' '}
            <motion.button
              type="button"
              onClick={handleSignIn}
              style={{
                background: 'none',
                border: 'none',
                color: '#667eea',
                cursor: 'pointer',
                fontFamily: 'Arame Mono, monospace',
                fontSize: '1rem',
                fontWeight: '600',
                textDecoration: 'none',
                padding: '0.25rem 0.5rem',
                borderRadius: '6px',
                transition: 'all 0.3s ease'
              }}
              whileHover={{ 
                color: '#764ba2',
                background: 'rgba(102, 126, 234, 0.1)'
              }}
            >
              Sign in
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
