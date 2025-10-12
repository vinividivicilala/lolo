'use client';

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function HomePage(): React.JSX.Element {
  const [showLoading, setShowLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const navigateToNotes = () => {
    setShowLoading(true);
    setTimeout(() => {
      router.push('/notes');
    }, 1000);
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'black',
      margin: 0,
      padding: 0,
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'sans-serif',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale'
    }}>
      {/* Menu Button - Simple Text */}
      <motion.div
        onClick={toggleMenu}
        style={{
          position: 'absolute',
          top: '2rem',
          right: '2rem',
          fontSize: '1.2rem',
          fontWeight: '700',
          color: 'white',
          cursor: 'pointer',
          fontFamily: 'sans-serif',
          letterSpacing: '2px',
          zIndex: 20,
          padding: '0.5rem 0',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale'
        }}
        whileHover={{ 
          scale: 1.05,
          color: '#CCFF00'
        }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        メニュー
      </motion.div>

      {/* Menu Overlay */}
      <AnimatePresence>
        {showMenu && (
          <>
            {/* Background Overlay */}
            <motion.div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: '#CCFF00',
                zIndex: 25
              }}
              initial={{ scaleY: 0, transformOrigin: "top" }}
              animate={{ scaleY: 1 }}
              exit={{ scaleY: 0 }}
              transition={{ 
                duration: 0.8,
                ease: [0.76, 0, 0.24, 1]
              }}
            />
            
            {/* Close Button - Bigger Size */}
            <motion.button
              onClick={toggleMenu}
              style={{
                position: 'fixed',
                top: '1.5rem',
                right: '1.5rem',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: 'black',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 30
              }}
              whileHover={{ 
                scale: 1.1,
                backgroundColor: '#333'
              }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, rotate: -180 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 180 }}
              transition={{ 
                duration: 0.6,
                ease: "easeOut",
                delay: 0.2
              }}
            >
              {/* Big X Icon */}
              <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                stroke="#CCFF00"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <motion.line
                  x1="12"
                  y1="12"
                  x2="28"
                  y2="28"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                />
                <motion.line
                  x1="28"
                  y1="12"
                  x2="12"
                  y2="28"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                />
              </svg>
            </motion.button>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLoading && (
          <motion.div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'black',
              zIndex: 10,
              fontFamily: 'sans-serif',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale'
            }}
            initial={{ opacity: 1 }}
            exit={{ 
              opacity: 0,
              transition: { duration: 0.6, ease: "easeInOut" }
            }}
          >
            {/* Main Animated Text */}
            <motion.div
              style={{
                fontSize: '4rem',
                fontWeight: '900',
                color: 'white',
                fontFamily: 'sans-serif',
                textAlign: 'center',
                letterSpacing: '8px',
                position: 'relative',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale'
              }}
              initial={{ 
                scale: 0.5, 
                opacity: 0, 
                rotateY: 180,
                filter: 'blur(20px)'
              }}
              animate={{ 
                scale: [0.8, 1.1, 1],
                opacity: [0, 1, 1],
                rotateY: [180, 0, 0],
                filter: ['blur(20px)', 'blur(5px)', 'blur(0px)'],
                textShadow: [
                  '0 0 0px rgba(255,255,255,0)',
                  '0 0 30px rgba(255,255,255,0.8)',
                  '0 0 20px rgba(255,255,255,0.4)'
                ]
              }}
              transition={{ 
                duration: 2,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
            >
              ノートとは何ですか
              
              {/* Glow Effect */}
              <motion.div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '400px',
                  height: '150px',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
                  filter: 'blur(30px)',
                  zIndex: -1
                }}
                animate={{
                  scale: [0.8, 1.2, 0.9],
                  opacity: [0, 0.6, 0],
                }}
                transition={{
                  duration: 2,
                  ease: "easeOut"
                }}
              />
            </motion.div>

            {/* Floating Text Particles */}
            <motion.div
              style={{
                position: 'absolute',
                fontSize: '1.2rem',
                fontWeight: '700',
                color: 'rgba(255,255,255,0.1)',
                fontFamily: 'sans-serif',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale'
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              ノート
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content After Loading */}
      <AnimatePresence>
        {!showLoading && (
          <motion.div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2rem',
              padding: '2rem',
              fontFamily: 'sans-serif',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.h1
              style={{
                fontSize: '3rem',
                fontWeight: '900',
                color: 'white',
                fontFamily: 'sans-serif',
                textAlign: 'center',
                marginBottom: '1rem',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale'
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              ようこそ
            </motion.h1>
            
            <motion.p
              style={{
                fontSize: '1.2rem',
                color: 'rgba(255,255,255,0.8)',
                fontFamily: 'sans-serif',
                textAlign: 'center',
                maxWidth: '500px',
                lineHeight: '1.6',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              あなたの思考を記録する場所へ
            </motion.p>

            <motion.button
              onClick={navigateToNotes}
              style={{
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                fontWeight: '700',
                color: 'black',
                backgroundColor: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontFamily: 'sans-serif',
                letterSpacing: '2px',
                transition: 'all 0.3s ease',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale'
              }}
              whileHover={{ 
                scale: 1.05,
                backgroundColor: '#f0f0f0',
                boxShadow: '0 0 20px rgba(255,255,255,0.3)'
              }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
            >
              ノートを見る
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
