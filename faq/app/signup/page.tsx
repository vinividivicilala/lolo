'use client';
import React, { useState, useEffect } from "react";
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
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
          flexDirection: 'column',
          zIndex: 1000,
          overflowY: 'auto'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Container utama untuk foto dan form */}
        <div style={{
          display: 'flex',
          flex: 1,
          minHeight: '100vh',
          flexDirection: isMobile ? 'column' : 'row'
        }}>
          {/* Container untuk foto dan teks - disembunyikan di mobile */}
          {!isMobile && (
            <div style={{
              flex: 0.7,
              position: 'relative',
              height: '100vh',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Foto di kiri */}
              <motion.div
                style={{
                  flex: 1,
                  position: 'relative'
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

              {/* Teks di bawah foto */}
              <motion.div
                style={{
                  padding: '2rem',
                  textAlign: 'center'
                }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
              </motion.div>
            </div>
          )}

          {/* Konten form di kanan */}
          <motion.div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: isMobile ? 'flex-start' : 'center',
              padding: isMobile ? '2rem 1.5rem' : '3rem',
              maxWidth: isMobile ? '100%' : '500px',
              margin: isMobile ? '2rem auto 0' : '0 auto',
              paddingTop: isMobile ? '4rem' : '3rem'
            }}
            initial={{ opacity: 0, x: isMobile ? 0 : 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {/* Judul */}
            <div style={{ 
              marginBottom: isMobile ? '2rem' : '3rem',
              textAlign: isMobile ? 'center' : 'left'
            }}>
              <motion.h1
                style={{
                  fontSize: isMobile ? '2.5rem' : '3rem',
                  fontWeight: '700',
                  color: 'white',
                  margin: '0 0 1rem 0',
                  fontFamily: 'Arame Mono, monospace',
                  textAlign: isMobile ? 'center' : 'left'
                }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                Create an account
              </motion.h1>

              <motion.p
                style={{
                  fontSize: isMobile ? '1.1rem' : '1.2rem',
                  color: 'rgba(255,255,255,0.8)',
                  margin: 0,
                  fontFamily: 'Arame Mono, monospace',
                  textAlign: isMobile ? 'center' : 'left'
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
                style={{
                  ...inputStyle,
                  fontSize: isMobile ? '16px' : '1rem', // Prevent zoom on iOS
                  padding: isMobile ? '1.2rem 1.5rem' : '1rem 1.5rem'
                }}
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                style={{
                  ...inputStyle,
                  fontSize: isMobile ? '16px' : '1rem',
                  padding: isMobile ? '1.2rem 1.5rem' : '1rem 1.5rem'
                }}
              />
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                style={{
                  ...inputStyle,
                  fontSize: isMobile ? '16px' : '1rem',
                  padding: isMobile ? '1.2rem 1.5rem' : '1rem 1.5rem'
                }}
              />

              <motion.button
                type="submit"
                disabled={isLoading}
                style={{
                  ...buttonStyle,
                  padding: isMobile ? '1.4rem 2rem' : '1.2rem 2rem',
                  fontSize: isMobile ? '1.2rem' : '1.1rem',
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
                fontSize: isMobile ? '1.1rem' : '1rem',
                color: 'rgba(255,255,255,0.7)',
                fontFamily: 'Arame Mono, monospace',
                marginTop: isMobile ? '1.5rem' : '0'
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
        </div>

        {/* Teks LETS JOIN US NOTE THINK dan kelompok di bawah foto dan form */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          style={{
            position: 'relative',
            textAlign: isMobile ? 'center' : 'left',
            marginTop: isMobile ? '3rem' : '2rem',
            width: '100%',
            maxWidth: '1200px',
            padding: isMobile ? '1.5rem' : '2rem',
            marginLeft: isMobile ? '0' : '2rem',
            marginBottom: isMobile ? '2rem' : '2rem',
            margin: isMobile ? '3rem auto 2rem' : '2rem 0 2rem 2rem'
          }}
        >
          {/* Teks LETS JOIN US NOTE THINK 2 baris */}
          <div style={{ 
            marginBottom: isMobile ? '3rem' : '4rem',
            padding: isMobile ? '0 1rem' : '0'
          }}>
            <p style={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: isMobile ? '3rem' : '5rem',
              fontFamily: 'Arame Mono, monospace',
              margin: '0 0 0.3rem 0',
              lineHeight: '1.1',
              fontWeight: '600'
            }}>
              LETS JOIN US
            </p>
            <p style={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: isMobile ? '3rem' : '5rem',
              fontFamily: 'Arame Mono, monospace',
              margin: 0,
              lineHeight: '1.1',
              fontWeight: '600'
            }}>
              NOTE THINK.
            </p>
          </div>

          {/* 6 Kelompok Menu */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, auto)',
            gap: isMobile ? '3rem 2rem' : '2rem 8rem',
            marginTop: '0rem',
            padding: isMobile ? '0 1rem' : '0'
          }}>
            <div>
              <h4 style={{
                color: 'white',
                fontSize: isMobile ? '2rem' : '4rem',
                fontWeight: '600',
                margin: '0 0 0.5rem 0',
                marginBottom: isMobile ? '3rem' : '5rem',
                fontFamily: 'Arame Mono, monospace'
              }}>
                MENU
              </h4>
            </div>
            <div>
              <h4 style={{
                color: 'white',
                fontSize: isMobile ? '2rem' : '4rem',
                fontWeight: '600',
                margin: '0 0 0.5rem 0',
                marginBottom: isMobile ? '3rem' : '5rem',
                fontFamily: 'Arame Mono, monospace'
              }}>
                PRODUCT
              </h4>
            </div>
            <div>
              <h4 style={{
                color: 'white',
                fontSize: isMobile ? '2rem' : '4rem',
                fontWeight: '600',
                margin: '0 0 0.5rem 0',
                marginBottom: isMobile ? '3rem' : '5rem',
                fontFamily: 'Arame Mono, monospace'
              }}>
                CONNECT
              </h4>
            </div>
            <div>
              <h4 style={{
                color: 'white',
                fontSize: isMobile ? '2rem' : '4rem',
                fontWeight: '600',
                margin: '0 0 0.5rem 0',
                marginBottom: isMobile ? '8rem' : '15rem',
                fontFamily: 'Arame Mono, monospace'
              }}>
                Features
              </h4>
            </div>
            <div>
              <h4 style={{
                color: 'white',
                fontSize: isMobile ? '2rem' : '4rem',
                fontWeight: '600',
                margin: '0 0 0.5rem 0',
                marginBottom: isMobile ? '8rem' : '15rem',
                fontFamily: 'Arame Mono, monospace'
              }}>
                Community
              </h4>
            </div>
            <div>
              <h4 style={{
                color: 'white',
                fontSize: isMobile ? '2rem' : '4rem',
                fontWeight: '600',
                margin: '0 0 0.5rem 0',
                marginBottom: isMobile ? '8rem' : '15rem',
                fontFamily: 'Arame Mono, monospace'
              }}>
                BLOG
              </h4>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// 🎨 Style terpisah biar rapi
const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: '12px',
  fontFamily: 'Arame Mono, monospace',
  background: 'rgba(255,255,255,0.08)',
  color: 'white',
  outline: 'none',
  marginBottom: '1.5rem',
  backdropFilter: 'blur(10px)'
};

const buttonStyle: React.CSSProperties = {
  width: '100%',
  background: '#000',
  border: 'none',
  borderRadius: '12px',
  color: 'white',
  fontWeight: '600',
  fontFamily: 'Arame Mono, monospace',
  marginBottom: '2rem',
  transition: 'all 0.3s ease'
};
