'use client';

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function HomePage(): React.JSX.Element {
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

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
      overflow: 'hidden'
    }}>
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
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'black',
              zIndex: 10
            }}
            initial={{ opacity: 1 }}
            exit={{ 
              opacity: 0,
              transition: { duration: 0.8, ease: "easeInOut" }
            }}
          >
            {/* Modern Geometric Motion Background */}
            <motion.div
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(45deg, #000000 0%, #1a1a1a 100%)',
              }}
              animate={{
                background: [
                  'linear-gradient(45deg, #000000 0%, #1a1a1a 100%)',
                  'linear-gradient(135deg, #000000 0%, #2a2a2a 100%)',
                  'linear-gradient(225deg, #000000 0%, #1a1a1a 100%)',
                ]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Animated Grid Lines */}
            <motion.div
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px',
              }}
              animate={{
                backgroundPosition: ['0px 0px', '50px 50px'],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
            />

            {/* Main Loading Text */}
            <motion.div
              style={{
                fontSize: '3.5rem',
                fontWeight: '900',
                color: 'white',
                fontFamily: "'Noto Sans JP', sans-serif",
                textAlign: 'center',
                position: 'relative',
                zIndex: 2,
                letterSpacing: '4px',
                textShadow: '0 0 30px rgba(255,255,255,0.3)'
              }}
              initial={{ scale: 0.8, opacity: 0, rotateY: 90 }}
              animate={{ 
                scale: 1, 
                opacity: 1, 
                rotateY: 0,
                textShadow: [
                  '0 0 30px rgba(255,255,255,0.3)',
                  '0 0 50px rgba(255,255,255,0.5)',
                  '0 0 30px rgba(255,255,255,0.3)',
                ]
              }}
              transition={{ 
                duration: 1.5,
                ease: "easeOut"
              }}
            >
              ノートとは何ですか
            </motion.div>

            {/* Subtle Glow Effect */}
            <motion.div
              style={{
                position: 'absolute',
                width: '400px',
                height: '200px',
                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                filter: 'blur(20px)',
                zIndex: 1
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Modern Loading Bar */}
            <motion.div
              style={{
                width: '300px',
                height: '3px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '2px',
                marginTop: '40px',
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              <motion.div
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'white',
                  borderRadius: '2px',
                  position: 'absolute',
                  left: '-100%'
                }}
                animate={{
                  left: ['-100%', '100%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>

            {/* Floating Particles */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                style={{
                  position: 'absolute',
                  width: '4px',
                  height: '4px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  opacity: 0.6
                }}
                animate={{
                  y: [0, -100, 0],
                  x: [0, Math.sin(i) * 50, 0],
                  opacity: [0.3, 0.8, 0.3],
                  scale: [1, 1.5, 1]
                }}
                transition={{
                  duration: 2 + i * 0.5,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeInOut"
                }}
              />
            ))}

            {/* Corner Accents */}
            <motion.div
              style={{
                position: 'absolute',
                top: '40px',
                left: '40px',
                width: '2px',
                height: '40px',
                backgroundColor: 'white'
              }}
              animate={{
                height: ['40px', '60px', '40px'],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              style={{
                position: 'absolute',
                top: '40px',
                left: '40px',
                width: '40px',
                height: '2px',
                backgroundColor: 'white'
              }}
              animate={{
                width: ['40px', '60px', '40px'],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 0.5,
                ease: "easeInOut"
              }}
            />

            <motion.div
              style={{
                position: 'absolute',
                bottom: '40px',
                right: '40px',
                width: '2px',
                height: '40px',
                backgroundColor: 'white'
              }}
              animate={{
                height: ['40px', '60px', '40px'],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 0.3,
                ease: "easeInOut"
              }}
            />
            <motion.div
              style={{
                position: 'absolute',
                bottom: '40px',
                right: '40px',
                width: '40px',
                height: '2px',
                backgroundColor: 'white'
              }}
              animate={{
                width: ['40px', '60px', '40px'],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 0.8,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Konten utama setelah loading selesai */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: showLoading ? 0 : 1, y: showLoading ? 50 : 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        style={{
          color: 'white',
          textAlign: 'center',
          padding: '20px'
        }}
      >
        <motion.h1
          style={{
            fontSize: '3rem',
            marginBottom: '20px',
            fontFamily: "'Noto Sans JP', sans-serif",
            fontWeight: '700'
          }}
        >
          ようこそ
        </motion.h1>
        <motion.p
          style={{
            fontSize: '1.2rem',
            fontFamily: "'Noto Sans JP', sans-serif",
            opacity: 0.8
          }}
        >
          ノートアプリへ
        </motion.p>
      </motion.div>

      {/* Font import */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&display=swap');
      `}</style>
    </div>
  );
}
