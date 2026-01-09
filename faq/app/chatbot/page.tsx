'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function ChatbotPage() {
  const router = useRouter();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'black',
      color: 'white',
      padding: '2rem',
      fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif"
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        marginTop: '4rem'
      }}>
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            fontSize: '5rem',
            fontWeight: '300',
            letterSpacing: '-0.02em',
            margin: 0,
            textAlign: 'center'
          }}
        >
          chatbot
        </motion.h1>
      </div>

      {/* Profile Section - Below chatbot text, aligned to left */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginTop: '3rem',
          marginLeft: '2rem',
          position: 'relative'
        }}
      >
        {/* Profile Picture */}
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#2a2a2a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#fff',
          border: '2px solid #3a3a3a'
        }}>
          FP
        </div>
        
        {/* Name and Status */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem'
        }}>
          <span style={{
            fontSize: '1.5rem',
            fontWeight: '400',
            color: '#fff'
          }}>
            Menuru
          </span>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#4CAF50',
              animation: 'pulse 2s infinite'
            }}></div>
            <span style={{
              fontSize: '0.9rem',
              color: '#b0b0b0',
              fontWeight: '300'
            }}>
              Online
            </span>
          </div>
        </div>
      </motion.div>

      {/* Add CSS for pulse animation */}
      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
