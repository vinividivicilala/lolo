'use client';

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function HomePage(): React.JSX.Element {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

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
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Helvetica, Arial, sans-serif',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale'
    }}>

      {/* Header Section */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        padding: isMobile ? '1rem' : '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 100,
        boxSizing: 'border-box'
      }}>
        {/* Teks "MENURU" */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <h1 style={{
            fontSize: isMobile ? '1.5rem' : '2.5rem',
            fontWeight: '300',
            fontFamily: 'Helvetica, Arial, sans-serif',
            margin: 0,
            letterSpacing: '2px',
            lineHeight: 1,
            textTransform: 'uppercase',
            color: 'white'
          }}>
            MENURU
          </h1>
        </motion.div>

        {/* Sign In Button */}
        <motion.button
          onClick={() => router.push('/signin')}
          style={{
            padding: isMobile ? '0.4rem 1rem' : '0.6rem 1.5rem',
            fontSize: isMobile ? '0.9rem' : '1.5rem',
            fontWeight: '300',
            color: 'white',
            backgroundColor: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontFamily: 'Helvetica, Arial, sans-serif',
            backdropFilter: 'blur(10px)',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? '0.3rem' : '0.5rem',
            margin: 0,
            maxWidth: isMobile ? '120px' : 'none'
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
          <svg 
            width={isMobile ? "18" : "30"} 
            height={isMobile ? "18" : "30"} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          {isMobile ? 'SIGN IN' : 'SIGN IN'}
        </motion.button>
      </div>
	  
	  {/* Main Card */}
      <motion.div
        style={{
          width: isMobile ? '95%' : '90%',
          maxWidth: '2800px',
          height: isMobile ? '350px' : '480px',
          backgroundColor: '#CCFF00',
          borderRadius: isMobile ? '20px' : '40px',
          padding: isMobile ? '1.5rem' : '3rem',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'center' : 'left',
          gap: isMobile ? '1.5rem' : '3rem',
          cursor: 'pointer',
          margin: isMobile ? '5rem auto 2rem' : '4rem auto 2rem',
          boxShadow: '0 10px 40px rgba(204, 255, 0, 0.3)',
          boxSizing: 'border-box'
        }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.7 }}
        whileHover={{
          scale: isMobile ? 1 : 1.02,
          backgroundColor: '#D4FF33',
          transition: { duration: 0.3 }
        }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Content Section */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: isMobile ? '1rem' : '1.5rem',
          textAlign: isMobile ? 'center' : 'left',
          width: '100%'
        }}>
          <h3 style={{
            color: 'black',
            fontSize: isMobile ? '1.8rem' : '3rem',
            fontWeight: '800',
            fontFamily: 'Arame Mono, monospace',
            margin: 0,
            lineHeight: 1.1,
            letterSpacing: isMobile ? '-0.5px' : '-1px'
          }}>
            INNOVATIVE{isMobile ? ' ' : <br/>}SOLUTIONS
          </h3>
          
          <p style={{
            color: 'rgba(0,0,0,0.8)',
            fontSize: isMobile ? '0.9rem' : '1.2rem',
            lineHeight: 1.5,
            fontFamily: 'Arame Mono, monospace',
            margin: 0,
            maxWidth: '600px',
            width: '100%'
          }}>
            Transforming ideas into visually stunning experiences with cutting-edge technology and modern design approach.
          </p>
          
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: 'center',
            gap: isMobile ? '1rem' : '1.5rem',
            marginTop: isMobile ? '0.5rem' : '1rem',
            justifyContent: isMobile ? 'center' : 'flex-start',
            width: '100%'
          }}>
            <motion.div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? '0.5rem' : '0.8rem',
                color: 'black'
              }}
              whileHover={{ x: isMobile ? 0 : 8 }}
              transition={{ duration: 0.2 }}
            >
              <span style={{
                fontSize: isMobile ? '0.9rem' : '1rem',
                fontWeight: '600',
                fontFamily: 'Arame Mono, monospace'
              }}>
                DISCOVER MORE
              </span>
              <svg 
                width={isMobile ? "20" : "24"} 
                height={isMobile ? "20" : "24"} 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </motion.div>
            
            <span style={{
              color: 'rgba(0,0,0,0.6)',
              fontSize: isMobile ? '0.8rem' : '0.9rem',
              fontWeight: '500',
              fontFamily: 'Arame Mono, monospace',
              backgroundColor: 'rgba(0,0,0,0.1)',
              padding: isMobile ? '0.4rem 1rem' : '0.6rem 1.2rem',
              borderRadius: '15px',
              textAlign: 'center'
            }}>
              LATEST PROJECT
            </span>
          </div>
        </div>
        
        {/* Decorative Element - Hidden on Mobile */}
        {!isMobile && (
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
        )}
      </motion.div>

      {/* Additional Mobile-only Elements */}
      {isMobile && (
        <motion.div
          style={{
            width: '60px',
            height: '60px',
            backgroundColor: 'black',
            borderRadius: '15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: '1rem'
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#CCFF00" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </motion.div>
      )}
    </div>
  );
}
