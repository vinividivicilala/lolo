
'use client';

import React, { useState } from "react";
import { motion } from "framer-motion";

interface SignUpPageProps {
  onClose: () => void;
  onSwitchToSignIn: () => void;
}

export default function SignUpPage({ onClose, onSwitchToSignIn }: SignUpPageProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulasi proses pendaftaran
    setTimeout(() => {
      setIsLoading(false);
      onClose();
    }, 1500);
  };

  const handleSocialSignUp = (provider: string) => {
    console.log(`Sign up with ${provider}`);
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
        zIndex: 1000,
        padding: '2rem'
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
          maxHeight: '90vh',
          overflowY: 'auto',
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
            Join MENURU
          </motion.h2>
          <motion.p
            style={{
              fontSize: '1rem',
              color: '#666',
              margin: 0,
              fontFamily: 'Arame Mono, monospace'
            }}
          >
            Create your account and start your creative journey
          </motion.p>
        </div>

        {/* Social Sign Up */}
        <motion.div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            {/* Google, GitHub, Discord buttons - sama seperti di Sign In */}
          </div>
        </motion.div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '2rem 0', color: '#999' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#ddd' }}></div>
          <span style={{ padding: '0 1rem', fontSize: '0.9rem' }}>atau</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#ddd' }}></div>
        </div>

        {/* Sign Up Form */}
        <form onSubmit={handleSignUp}>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Nama Lengkap"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
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

          <div style={{ marginBottom: '1rem' }}>
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
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

          <div style={{ marginBottom: '1rem' }}>
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
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

          <div style={{ marginBottom: '1.5rem' }}>
            <input
              type="password"
              placeholder="Konfirmasi Password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
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
            Daftar
          </motion.button>
        </form>

        {/* Sign In Link */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#666' }}>
          Sudah punya akun?{' '}
          <motion.button
            type="button"
            onClick={onSwitchToSignIn}
            style={{
              background: 'none',
              border: 'none',
              color: '#667eea',
              cursor: 'pointer',
              fontWeight: '600'
            }}
            whileHover={{ color: '#764ba2' }}
          >
            Masuk
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
