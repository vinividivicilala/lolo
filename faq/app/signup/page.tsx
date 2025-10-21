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
            alignItems: 'center',
            padding: '3rem'
          }}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {/* Judul dan Deskripsi */}
          <div style={{ textAlign: 'center', marginBottom: '3rem', width: '100%', maxWidth: '400px' }}>
            <motion.h1
              style={{
                fontSize: '3rem',
                fontWeight: '700',
                color: 'white',
                margin: '0 0 1rem 0',
                fontFamily: 'Arame Mono, monospace',
                lineHeight: '1.2'
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
                lineHeight: '1.5'
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
              width: '100%',
              maxWidth: '400px'
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
                  padding: '1rem',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontFamily: 'Arame Mono, monospace',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.2)';
                  e.target.style.borderColor = 'rgba(255,255,255,0.5)';
                }}
                onBlur={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.1)';
                  e.target.style.borderColor = 'rgba(255,255,255,0.3)';
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
                  padding: '1rem',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontFamily: 'Arame Mono, monospace',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.2)';
                  e.target.style.borderColor = 'rgba(255,255,255,0.5)';
                }}
                onBlur={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.1)';
                  e.target.style.borderColor = 'rgba(255,255,255,0.3)';
                }}
              />
            </div>

            {/* Password Input */}
            <div style={{ marginBottom: '2rem' }}>
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontFamily: 'Arame Mono, monospace',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.2)';
                  e.target.style.borderColor = 'rgba(255,255,255,0.5)';
                }}
                onBlur={(e) => {
                  e.target.style.background = 'rgba(255,255,255,0.1)';
                  e.target.style.borderColor = 'rgba(255,255,255,0.3)';
                }}
              />
            </div>

            {/* Sign Up Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '1rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontFamily: 'Arame Mono, monospace',
                marginBottom: '2rem',
                opacity: isLoading ? 0.7 : 1
              }}
              whileHover={!isLoading ? { scale: 1.02 } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </motion.button>
          </motion.form>

          {/* Sign In Link */}
          <motion.div
            style={{
              textAlign: 'center',
              fontSize: '0.9rem',
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
              onClick={onSwitchToSignIn}
              style={{
                background: 'none',
                border: 'none',
                color: '#667eea',
                cursor: 'pointer',
                fontFamily: 'Arame Mono, monospace',
                fontSize: '0.9rem',
                fontWeight: '600',
                textDecoration: 'underline'
              }}
              whileHover={{ color: '#764ba2' }}
            >
              Sign in
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
