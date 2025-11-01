'use client';

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";

export default function HomePage(): React.JSX.Element {
  const router = useRouter();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'black',
      margin: 0,
      padding: 0,
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Arame Mono, monospace',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale'
    }}>

      {/* Teks "MENURU" di Pojok Kiri Agak ke Kanan */}
      <motion.div
        style={{
          position: 'fixed',
          top: '2rem',
          left: '3rem',
          color: 'white',
          zIndex: 90
        }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <h1 style={{
          fontSize: '4rem',
          fontWeight: '300',
          fontFamily: 'Helvetica, Arial, sans-serif',
          margin: 0,
          letterSpacing: '2px',
          lineHeight: 1,
          textTransform: 'uppercase'
        }}>
          MENURU
        </h1>
      </motion.div>

      {/* Sign In Button - Ke Kanan Tapi Agak ke Kiri */}
      <motion.button
        onClick={() => router.push('/signin')}
        style={{
          position: 'fixed',
          top: '2rem',
          right: '3rem',
          padding: '0.6rem 1.5rem',
          fontSize: '1.5rem',
          fontWeight: '300',
          color: 'white',
          backgroundColor: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '8px',
          cursor: 'pointer',
          fontFamily: 'Helvetica, Arial, sans-serif',
          backdropFilter: 'blur(10px)',
          whiteSpace: 'nowrap',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        whileHover={{ 
          backgroundColor: 'rgba(255,255,255,0.15)',
          scale: 1.05,
          transition: { duration: 0.2 }
        }}
        whileTap={{ scale: 0.95 }}
      >
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        SIGN IN
      </motion.button>
	  
	  {/* Single Large Horizontal Card with Bright Background */}
      <motion.div
        style={{
          width: '90%',
          maxWidth: '1900px',
          height: '480px',
          backgroundColor: '#CCFF00',
          borderRadius: '40px',
          padding: '3rem',
          display: 'flex',
          alignItems: 'left',
          gap: '3rem',
          cursor: 'pointer',
          margin: '4rem auto 2rem',
          boxShadow: '0 10px 40px rgba(204, 255, 0, 0.3)'
        }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.7 }}
        whileHover={{
          scale: 1.02,
          backgroundColor: '#D4FF33',
          transition: { duration: 0.3 }
        }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Content Section - Full Width */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          <h3 style={{
            color: 'black',
            fontSize: '3rem',
            fontWeight: '800',
            fontFamily: 'Arame Mono, monospace',
            margin: 0,
            lineHeight: 1.1,
            letterSpacing: '-1px'
          }}>
            INNOVATIVE<br/>SOLUTIONS
          </h3>
          
          <p style={{
            color: 'rgba(0,0,0,0.8)',
            fontSize: '1.2rem',
            lineHeight: 1.5,
            fontFamily: 'Arame Mono, monospace',
            margin: 0,
            maxWidth: '600px'
          }}>
            Transforming ideas into visually stunning experiences with cutting-edge technology and modern design approach.
          </p>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            marginTop: '1rem'
          }}>
            <motion.div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                color: 'black'
              }}
              whileHover={{ x: 8 }}
              transition={{ duration: 0.2 }}
            >
              <span style={{
                fontSize: '1rem',
                fontWeight: '600',
                fontFamily: 'Arame Mono, monospace'
              }}>
                DISCOVER MORE
              </span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </motion.div>
            
            <span style={{
              color: 'rgba(0,0,0,0.6)',
              fontSize: '0.9rem',
              fontWeight: '500',
              fontFamily: 'Arame Mono, monospace',
              backgroundColor: 'rgba(0,0,0,0.1)',
              padding: '0.6rem 1.2rem',
              borderRadius: '15px'
            }}>
              LATEST PROJECT
            </span>
          </div>
        </div>
        
        {/* Decorative Element */}
        <motion.div
          style={{
            width: '80px',
            height: '80px',
            backgroundColor: 'black',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
          whileHover={{ rotate: 90 }}
          transition={{ duration: 0.3 }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#CCFF00" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
}
