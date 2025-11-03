'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function UpdatePage() {
  const router = useRouter();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'black',
      color: 'white',
      padding: '2rem',
      fontFamily: 'Helvetica, Arial, sans-serif'
    }}>
      <motion.button
        onClick={() => router.back()}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '8px',
          color: 'white',
          cursor: 'pointer',
          marginBottom: '2rem',
          backdropFilter: 'blur(10px)'
        }}
        whileHover={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
        whileTap={{ scale: 0.95 }}
      >
        ← Back
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Updates</h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>
          Latest updates and news will be posted here. Coming soon!
        </p>
      </motion.div>
    </div>
  );
}