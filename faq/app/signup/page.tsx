'use client';

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
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
      router.push('/dashboard');
    }, 1500);
  };

  // Klik "Sign in" langsung pindah halaman
  const handleSignInClick = (e: React.MouseEvent) => {
    e.preventDefault();
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
        {/* Foto di kiri */}
        <motion.div
          style={{
            flex: 0.7,
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
            style={{ objectFit: 'cover', display: 'block' }}
            priority
          />
        </motion.div>

        {/* Konten form di kanan */}
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
          {/* Judul */}
          <div style={{ marginBottom: '3rem' }}>
            <motion.h1
              style={{
                fontSize: '3rem',
                fontWeight: '700',
                color: 'white',
                margin: '0 0 1rem 0',
                fontFamily: 'Arame Mono, monospace',
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
                textAlign: 'left'
              }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              Sign up to join our community
            </motion.p>
          </div>

          {/* Form */}
          <motion.form
            onSubmit={handleSignUp}
            style={{ width: '100%' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              style={inputStyle}
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              style={inputStyle}
            />
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              style={inputStyle}
            />

            <motion.button
              type="submit"
              disabled={isLoading}
              style={{
                ...buttonStyle,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1
              }}
              whileHover={!isLoading ? { scale: 1.02, background: '#333' } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
            >
              {isLoading ? 'Creating Account...' : 'Get Started'}
            </motion.button>
          </motion.form>

          {/* Link ke Sign in */}
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
            <a
              href="/signin"
              onClick={handleSignInClick}
              style={{
                color: '#ffffff',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Sign in
            </a>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// 🔹 Style terpisah biar rapi
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '1rem 1.5rem',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: '12px',
  fontSize: '1rem',
  fontFamily: 'Arame Mono, monospace',
  background: 'rgba(255,255,255,0.08)',
  color: 'white',
  outline: 'none',
  marginBottom: '1.5rem',
  backdropFilter: 'blur(10px)'
};

const buttonStyle: React.CSSProperties = {
  width: '100%',
  padding: '1.2rem 2rem',
  background: '#000',
  border: 'none',
  borderRadius: '12px',
  color: 'white',
  fontSize: '1.1rem',
  fontWeight: '600',
  fontFamily: 'Arame Mono, monospace',
  marginBottom: '2rem',
  transition: 'all 0.3s ease'
};
