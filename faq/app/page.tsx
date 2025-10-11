'use client';

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function HomePage(): React.JSX.Element {
  const [showLoading, setShowLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("");

  useEffect(() => {
    // Teks "Apa itu note" dalam gaya Jepang modern
    const fullText = "ノートとは何ですか";
    let currentIndex = 0;

    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setLoadingText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        
        // Setelah selesai mengetik, tunggu sebentar lalu sembunyikan loading
        setTimeout(() => {
          setShowLoading(false);
        }, 1500);
      }
    }, 100);

    return () => clearInterval(typingInterval);
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
          {/* Motion Graphic Background */}
          <motion.div
            style={{
              position: 'absolute',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              border: '2px solid rgba(255, 255, 255, 0.1)',
            }}
            animate={{
              scale: [1, 1.5, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          
          <motion.div
            style={{
              position: 'absolute',
              width: '150px',
              height: '150px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
            }}
            animate={{
              scale: [1.2, 0.8, 1.2],
              rotate: [45, 135, 225, 315],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Loading Text */}
          <motion.div
            style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: 'white',
              fontFamily: "'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', sans-serif",
              textAlign: 'center',
              position: 'relative',
              zIndex: 2,
              letterSpacing: '2px'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {loadingText}
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              style={{ marginLeft: '2px' }}
            >
              |
            </motion.span>
          </motion.div>

          {/* Loading Dots */}
          <motion.div
            style={{
              display: 'flex',
              gap: '8px',
              marginTop: '20px'
            }}
          >
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: 'white'
                }}
                animate={{
                  scale: [0.8, 1.2, 0.8],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: index * 0.2,
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
      
      {/* Konten utama setelah loading selesai */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showLoading ? 0 : 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{
          color: 'white',
          textAlign: 'center',
          padding: '20px'
        }}
      >
        <motion.h1
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          style={{
            fontSize: '3rem',
            marginBottom: '20px',
            fontFamily: "'Noto Sans JP', sans-serif"
          }}
        >
          ようこそ
        </motion.h1>
        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          style={{
            fontSize: '1.2rem',
            fontFamily: "'Noto Sans JP', sans-serif"
          }}
        >
          ノートアプリへ
        </motion.p>
      </motion.div>

      {/* Styles untuk font */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&display=swap');
      `}</style>
    </div>
  );
}
