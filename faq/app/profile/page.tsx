'use client';

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'black',
      margin: 0,
      padding: 0,
      width: '100%',
      fontFamily: 'NeueHaasGrotesk, "Helvetica Neue", Helvetica, Arial, sans-serif',
      position: 'relative'
    }}>
      {/* Header dengan tombol back */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        padding: isMobile ? '1.5rem' : '2rem',
        backgroundColor: 'transparent',
        zIndex: 10
      }}>
        <motion.div
          onClick={() => router.back()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            cursor: 'pointer',
            width: 'fit-content'
          }}
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg
            width={isMobile ? "28" : "32"}
            height={isMobile ? "28" : "32"}
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 7L7 17" />
            <path d="M7 7h10v10" />
          </svg>
          <span style={{
            color: 'white',
            fontSize: isMobile ? '1rem' : '1.2rem',
            fontWeight: '300',
            letterSpacing: '1px',
            fontFamily: 'NeueHaasGrotesk, "Helvetica Neue", Helvetica, Arial, sans-serif'
          }}>
            Back
          </span>
        </motion.div>
      </div>

      {/* Teks di tengah - setiap kata di baris baru */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? '1rem' : '1.5rem'
          }}
        >
          <span style={{
            color: 'white',
            fontSize: isMobile ? '2.5rem' : '4rem',
            fontWeight: '400',
            fontFamily: 'NeueHaasGrotesk, "Helvetica Neue", Helvetica, Arial, sans-serif',
            letterSpacing: '-0.02em',
            textTransform: 'capitalize'
          }}>
            Tell
          </span>
          <span style={{
            color: 'white',
            fontSize: isMobile ? '2.5rem' : '4rem',
            fontWeight: '400',
            fontFamily: 'NeueHaasGrotesk, "Helvetica Neue", Helvetica, Arial, sans-serif',
            letterSpacing: '-0.02em',
            textTransform: 'capitalize'
          }}>
            Donate
          </span>
          <span style={{
            color: 'white',
            fontSize: isMobile ? '2rem' : '3rem',
            fontWeight: '400',
            fontFamily: 'NeueHaasGrotesk, "Helvetica Neue", Helvetica, Arial, sans-serif',
            letterSpacing: '-0.02em',
            textTransform: 'capitalize',
            whiteSpace: 'nowrap'
          }}>
            Record With All Your Heart
          </span>
          <span style={{
            color: 'white',
            fontSize: isMobile ? '2.5rem' : '4rem',
            fontWeight: '400',
            fontFamily: 'NeueHaasGrotesk, "Helvetica Neue", Helvetica, Arial, sans-serif',
            letterSpacing: '-0.02em',
            textTransform: 'capitalize'
          }}>
            Logic
          </span>
          <span style={{
            color: 'white',
            fontSize: isMobile ? '2.5rem' : '4rem',
            fontWeight: '400',
            fontFamily: 'NeueHaasGrotesk, "Helvetica Neue", Helvetica, Arial, sans-serif',
            letterSpacing: '-0.02em',
            textTransform: 'capitalize'
          }}>
            Feelings
          </span>
        </motion.div>
      </div>
    </div>
  );
}
