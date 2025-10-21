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
            padding: '0',
            maxWidth: '1000px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'hidden',
            position: 'relative',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex'
          }}
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ duration: 0.5, ease: "back.out(1.7)" }}
        >
          {/* Foto Portrait di Kiri */}
          <motion.div
            style={{
              flex: 1,
              position: 'relative',
              minHeight: '600px'
            }}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {/* Close Button di atas foto */}
            <motion.button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '1.5rem',
                left: '1.5rem',
                background: 'rgba(0,0,0,0.5)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white',
                fontSize: '1.2rem',
                zIndex: 10
              }}
              whileHover={{ backgroundColor: 'rgba(0,0,0,0.7)', scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              ×
            </motion.button>

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

          {/* Konten Teks di Kanan */}
          <motion.div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '3rem',
              textAlign: 'center'
            }}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {/* Judul Besar */}
            <motion.h1
              style={{
                fontSize: '3.5rem',
                fontWeight: '700',
                color: '#333',
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

            {/* Deskripsi */}
            <motion.p
              style={{
                fontSize: '1.4rem',
                color: '#666',
                margin: 0,
                fontFamily: 'Arame Mono, monospace',
                lineHeight: '1.6',
                maxWidth: '400px'
              }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              Sign up to join our community
            </motion.p>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
