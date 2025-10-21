'use client';

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ForgotPasswordPageProps {
  onClose: () => void;
  onSwitchToSignIn: () => void;
}

export default function ForgotPasswordPage({ onClose, onSwitchToSignIn }: ForgotPasswordPageProps) {
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
          zIndex: 1000
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Line Box yang lebih besar */}
        <motion.div
          style={{
            background: 'transparent',
            borderRadius: '12px',
            width: '600px',
            height: '400px',
            position: 'relative',
            border: '1px solid rgba(255,255,255,0.3)',
          }}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </motion.div>
    </AnimatePresence>
  );
}
