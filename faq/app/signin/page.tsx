'use client';

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface SignInPageProps {
  onClose: () => void;
  onSwitchToSignUp: () => void;
  onSwitchToForgotPassword: () => void;
}

export default function SignInPage({ onClose, onSwitchToSignUp, onSwitchToForgotPassword }: SignInPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulasi proses login
    setTimeout(() => {
      setIsLoading(false);
      onClose();
      router.push('/dashboard');
    }, 1500);
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`Login with ${provider}`);
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
            padding: '2rem',
            maxWidth: '400px',
            width: '100%',
            position: 'relative',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
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
              background: 'transparent',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#6B7280',
              fontSize: '1.5rem',
              fontWeight: '300'
            }}
            whileHover={{ backgroundColor: 'rgba(0,0,0,0.05)', scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            ×
          </motion.button>

          {/* Header Section */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <motion.h2
              style={{
                fontSize: '1.875rem',
                fontWeight: '700',
                color: '#111827',
                margin: '0 0 0.5rem 0',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              Welcome back
            </motion.h2>
            
            <motion.p
              style={{
                fontSize: '0.875rem',
                color: '#6B7280',
                margin: 0,
                fontFamily: 'system-ui, -apple-system, sans-serif',
                lineHeight: '1.5'
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              Sign in to your account to continue
            </motion.p>
          </div>

          {/* Social Login Buttons */}
          <motion.div
            style={{ marginBottom: '1.5rem' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <motion.button
                type="button"
                onClick={() => handleSocialLogin('google')}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid #D1D5DB',
                  background: 'white',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  transition: 'all 0.2s ease'
                }}
                whileHover={{ 
                  backgroundColor: '#F9FAFB',
                  borderColor: '#9CA3AF'
                }}
                whileTap={{ scale: 0.98 }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </motion.button>
              
              <motion.button
                type="button"
                onClick={() => handleSocialLogin('github')}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid #D1D5DB',
                  background: 'white',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  transition: 'all 0.2s ease'
                }}
                whileHover={{ 
                  backgroundColor: '#F9FAFB',
                  borderColor: '#9CA3AF'
                }}
                whileTap={{ scale: 0.98 }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </motion.button>

              <motion.button
                type="button"
                onClick={() => handleSocialLogin('discord')}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid #D1D5DB',
                  background: 'white',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  transition: 'all 0.2s ease'
                }}
                whileHover={{ 
                  backgroundColor: '#F9FAFB',
                  borderColor: '#9CA3AF'
                }}
                whileTap={{ scale: 0.98 }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#7289da">
                  <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.24 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08-.01-.11c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09-.01.11c-.52.31-1.07.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.03.01.06.02.09.01c1.72-.53 3.45-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.83 2.12-1.89 2.12z"/>
                </svg>
                Discord
              </motion.button>
            </div>
          </motion.div>

          {/* Divider */}
          <motion.div
            style={{
              display: 'flex',
              alignItems: 'center',
              margin: '1.5rem 0',
              color: '#6B7280'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }}></div>
            <span style={{ 
              padding: '0 1rem', 
              fontSize: '0.75rem', 
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              OR CONTINUE WITH
            </span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }}></div>
          </motion.div>

          {/* Login Form */}
          <motion.form
            onSubmit={handleSignIn}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  transition: 'all 0.2s ease',
                  backgroundColor: 'white',
                  outline: 'none'
                }}
                placeholder="example@gmail.com"
                onFocus={(e) => {
                  e.target.style.borderColor = '#3B82F6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#D1D5DB';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  fontFamily: 'system-ui, -apple-system, sans-serif'
                }}>
                  Password
                </label>
                <motion.button
                  type="button"
                  onClick={onSwitchToForgotPassword}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#6B7280',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    textDecoration: 'underline',
                    transition: 'color 0.2s ease',
                    padding: 0
                  }}
                  whileHover={{ color: '#374151' }}
                >
                  Forgot your password?
                </motion.button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  transition: 'all 0.2s ease',
                  backgroundColor: 'white',
                  outline: 'none'
                }}
                placeholder="••••••••"
                onFocus={(e) => {
                  e.target.style.borderColor = '#3B82F6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#D1D5DB';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Sign In Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: '#111827',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                marginBottom: '1.5rem',
                opacity: isLoading ? 0.7 : 1,
                transition: 'all 0.2s ease'
              }}
              whileHover={!isLoading ? { 
                backgroundColor: '#374151',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
            >
              {isLoading ? 'Signing in...' : 'Sign In with Email'}
            </motion.button>
          </motion.form>

          {/* Sign Up Link */}
          <motion.div
            style={{
              textAlign: 'center',
              fontSize: '0.875rem',
              color: '#6B7280',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              borderTop: '1px solid #E5E7EB',
              paddingTop: '1.5rem'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.3 }}
          >
            Don't have an account?{' '}
            <motion.button
              type="button"
              onClick={onSwitchToSignUp}
              style={{
                background: 'none',
                border: 'none',
                color: '#111827',
                cursor: 'pointer',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: '0.875rem',
                fontWeight: '600',
                textDecoration: 'underline',
                transition: 'color 0.2s ease'
              }}
              whileHover={{ color: '#374151' }}
            >
              Sign up
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
