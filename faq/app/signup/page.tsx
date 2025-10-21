'use client';

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface SignUpPageProps {
  onClose: () => void;
  onSwitchToSignIn: () => void;
}

export default function SignUpPage({ onClose, onSwitchToSignIn }: SignUpPageProps) {
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

        {/* Konten Teks di Kanan - Tanpa Background */}
        <motion.div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center'
          }}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {/* Judul Besar */}
          <motion.h1
            style={{
              fontSize: '4rem',
              fontWeight: '700',
              color: 'white',
              margin: '0 0 2rem 0',
              fontFamily: 'Arame Mono, monospace',
              lineHeight: '1.2',
              textShadow: '0 2px 10px rgba(0,0,0,0.5)'
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            Create an account
          </motion.h1>

          {/* Deskripsi */}
          <motion.p
            style={{
              fontSize: '1.8rem',
              color: 'rgba(255,255,255,0.9)',
              margin: 0,
              fontFamily: 'Arame Mono, monospace',
              lineHeight: '1.6',
              maxWidth: '500px',
              textShadow: '0 2px 8px rgba(0,0,0,0.5)'
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            Sign up to join our community
          </motion.p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
