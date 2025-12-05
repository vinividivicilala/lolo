'use client';

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import gsap from "gsap";

export default function HomePage(): React.JSX.Element {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [loadingText, setLoadingText] = useState("NURU");
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [cursorType, setCursorType] = useState("default");
  const [cursorText, setCursorText] = useState("");
  const [hoveredLink, setHoveredLink] = useState("");
  const headerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const topNavRef = useRef<HTMLDivElement>(null);
  const scrollTextRef = useRef<HTMLDivElement>(null);

  // Animasi loading text
  const loadingTexts = [
    "NURU", "MBACA", "NULIS", "NGEXPLORASI", 
    "NEMUKAN", "NCIPTA", "NGGALI", "NARIK",
    "NGAMATI", "NANCANG", "NGEMBANGKAN", "NYUSUN"
  ];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Animasi loading text
    let currentIndex = 0;
    const textInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % loadingTexts.length;
      setLoadingText(loadingTexts[currentIndex]);
    }, 500);

    // Hentikan loading setelah selesai
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
      clearInterval(textInterval);
    }, 3000);

    // Animasi teks berjalan dari atas ke bawah
    const setupAutoScroll = () => {
      if (scrollTextRef.current) {
        const itemHeight = isMobile ? 80 : 100;
        const totalItems = 15;
        const totalScrollDistance = totalItems * itemHeight - window.innerHeight;
        
        // Hapus animasi sebelumnya jika ada
        gsap.killTweensOf(scrollTextRef.current);
        
        // Animasi infinite loop dari atas ke bawah
        gsap.to(scrollTextRef.current, {
          y: -totalScrollDistance,
          duration: 20,
          ease: "none",
          repeat: -1,
          yoyo: false
        });
      }
    };

    // Setup auto scroll setelah component mount
    setTimeout(setupAutoScroll, 100);
    window.addEventListener('resize', setupAutoScroll);

    // Custom cursor animation
    const moveCursor = (e: MouseEvent) => {
      if (cursorRef.current) {
        gsap.to(cursorRef.current, {
          x: e.clientX,
          y: e.clientY,
          duration: 0.1,
          ease: "power2.out"
        });
      }
    };

    document.addEventListener('mousemove', moveCursor);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('resize', setupAutoScroll);
      clearInterval(textInterval);
      clearTimeout(loadingTimeout);
      document.removeEventListener('mousemove', moveCursor);
      if (scrollTextRef.current) {
        gsap.killTweensOf(scrollTextRef.current);
      }
    };
  }, [isMobile]);

  // Fungsi toggle dark/light mode
  const toggleColorMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Handler untuk cursor hover
  const handleLinkHover = (type: string, text: string = "", linkName: string = "") => {
    setCursorType(type);
    setCursorText(text);
    setHoveredLink(linkName);
  };

  const handleLinkLeave = () => {
    setCursorType("default");
    setCursorText("");
    setHoveredLink("");
  };

  // Warna cursor
  const getCursorColors = () => {
    if (cursorType === "link") {
      return {
        dotColor: '#6366F1',
        textColor: 'white'
      };
    }
    
    return {
      dotColor: '#EC4899',
      textColor: 'white'
    };
  };

  const cursorColors = getCursorColors();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: isDarkMode ? 'black' : '#ff0028',
      margin: 0,
      padding: 0,
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      position: 'relative',
      overflow: 'auto',
      fontFamily: 'Helvetica, Arial, sans-serif',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
      transition: 'background-color 0.5s ease',
      cursor: 'none'
    }}>

      {/* Custom Cursor */}
      <div
        ref={cursorRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: cursorType === "link" ? '140px' : '20px',
          height: cursorType === "link" ? '60px' : '20px',
          backgroundColor: cursorColors.dotColor,
          borderRadius: cursorType === "link" ? '30px' : '50%',
          pointerEvents: 'none',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          fontWeight: '700',
          color: cursorColors.textColor,
          textAlign: 'center',
          transition: 'all 0.2s ease',
          transform: 'translate(-50%, -50%)',
          padding: cursorType === "link" ? '0 20px' : '0',
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
          border: 'none'
        }}
      >
        {cursorType === "link" && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ 
              fontSize: '14px', 
              fontWeight: '700',
              letterSpacing: '0.5px',
              whiteSpace: 'nowrap'
            }}>
              {cursorText}
            </span>
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke={cursorColors.textColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 17L17 7M17 7H7M17 7V17"/>
            </svg>
          </div>
        )}
      </div>

      {/* Top Navigation Bar */}
      <div 
        ref={topNavRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          padding: isMobile ? '0.8rem 1rem' : '1rem 2rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 101,
          boxSizing: 'border-box',
          opacity: 1
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? '1rem' : '2rem',
          backgroundColor: 'transparent',
          backdropFilter: 'blur(10px)',
          borderRadius: '50px',
          padding: isMobile ? '0.6rem 1rem' : '0.8rem 1.5rem',
          border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.3)'}`,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          {/* Docs */}
          <motion.div
            onClick={() => router.push('/docs')}
            onMouseEnter={() => handleLinkHover("link", "VIEW", "docs")}
            onMouseLeave={handleLinkLeave}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'none',
              padding: '0.4rem 0.8rem',
              borderRadius: '25px',
              backgroundColor: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.95)',
              border: isDarkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.3)',
              transition: 'all 0.3s ease'
            }}
            whileHover={{ 
              backgroundColor: 'white',
              scale: 1.05,
              border: '1px solid white'
            }}
          >
            <svg 
              width={isMobile ? "18" : "20"} 
              height={isMobile ? "18" : "20"} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#6366F1"
              strokeWidth="2"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
            <span style={{
              color: '#6366F1',
              fontSize: isMobile ? '0.8rem' : '0.9rem',
              fontWeight: '600',
              fontFamily: 'Helvetica, Arial, sans-serif'
            }}>
              Docs
            </span>
            <div style={{
              backgroundColor: '#EC4899',
              color: 'white',
              fontSize: '0.7rem',
              fontWeight: '700',
              padding: '0.1rem 0.4rem',
              borderRadius: '10px',
              marginLeft: '0.3rem',
              border: 'none'
            }}>
              NEW
            </div>
          </motion.div>

          {/* Chatbot */}
          <motion.div
            onClick={() => router.push('/chatbot')}
            onMouseEnter={() => handleLinkHover("link", "VIEW", "chatbot")}
            onMouseLeave={handleLinkLeave}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'none',
              padding: '0.4rem 0.8rem',
              borderRadius: '25px',
              backgroundColor: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.95)',
              border: isDarkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.3)',
              transition: 'all 0.3s ease'
            }}
            whileHover={{ 
              backgroundColor: 'white',
              scale: 1.05,
              border: '1px solid white'
            }}
          >
            <svg 
              width={isMobile ? "18" : "20"} 
              height={isMobile ? "18" : "20"} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#6366F1"
              strokeWidth="2"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              <line x1="8" y1="7" x2="16" y2="7"/>
              <line x1="8" y1="11" x2="12" y2="11"/>
            </svg>
            <span style={{
              color: '#6366F1',
              fontSize: isMobile ? '0.8rem' : '0.9rem',
              fontWeight: '600',
              fontFamily: 'Helvetica, Arial, sans-serif'
            }}>
              Chatbot
            </span>
            <div style={{
              backgroundColor: '#EC4899',
              color: 'white',
              fontSize: '0.7rem',
              fontWeight: '700',
              padding: '0.1rem 0.4rem',
              borderRadius: '10px',
              marginLeft: '0.3rem',
              border: 'none'
            }}>
              NEW
            </div>
          </motion.div>

          {/* Update */}
          <motion.div
            onClick={() => router.push('/update')}
            onMouseEnter={() => handleLinkHover("link", "VIEW", "update")}
            onMouseLeave={handleLinkLeave}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'none',
              padding: '0.4rem 0.8rem',
              borderRadius: '25px',
              backgroundColor: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.95)',
              border: isDarkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.3)',
              transition: 'all 0.3s ease'
            }}
            whileHover={{ 
              backgroundColor: 'white',
              scale: 1.05,
              border: '1px solid white'
            }}
          >
            <svg 
              width={isMobile ? "18" : "20"} 
              height={isMobile ? "18" : "20"} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#6366F1"
              strokeWidth="2"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
            <span style={{
              color: '#6366F1',
              fontSize: isMobile ? '0.8rem' : '0.9rem',
              fontWeight: '600',
              fontFamily: 'Helvetica, Arial, sans-serif'
            }}>
              Update
            </span>
            <div style={{
              backgroundColor: '#EC4899',
              color: 'white',
              fontSize: '0.7rem',
              fontWeight: '700',
              padding: '0.1rem 0.4rem',
              borderRadius: '10px',
              marginLeft: '0.3rem',
              border: 'none'
            }}>
              NEW
            </div>
          </motion.div>

          {/* Timeline */}
          <motion.div
            onClick={() => router.push('/timeline')}
            onMouseEnter={() => handleLinkHover("link", "VIEW", "timeline")}
            onMouseLeave={handleLinkLeave}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'none',
              padding: '0.4rem 0.8rem',
              borderRadius: '25px',
              backgroundColor: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.95)',
              border: isDarkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.3)',
              transition: 'all 0.3s ease'
            }}
            whileHover={{ 
              backgroundColor: 'white',
              scale: 1.05,
              border: '1px solid white'
            }}
          >
            <svg 
              width={isMobile ? "18" : "20"} 
              height={isMobile ? "18" : "20"} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#6366F1"
              strokeWidth="2"
            >
              <polyline points="1 4 1 10 7 10"/>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
              <line x1="12" y1="7" x2="12" y2="13"/>
              <line x1="16" y1="11" x2="12" y2="7"/>
            </svg>
            <span style={{
              color: '#6366F1',
              fontSize: isMobile ? '0.8rem' : '0.9rem',
              fontWeight: '600',
              fontFamily: 'Helvetica, Arial, sans-serif'
            }}>
              Timeline
            </span>
            <div style={{
              backgroundColor: '#EC4899',
              color: 'white',
              fontSize: '0.7rem',
              fontWeight: '700',
              padding: '0.1rem 0.4rem',
              borderRadius: '10px',
              marginLeft: '0.3rem',
              border: 'none'
            }}>
              NEW
            </div>
          </motion.div>
        </div>
      </div>

      {/* Header Section */}
      <div 
        ref={headerRef}
        style={{
          position: 'fixed',
          top: isMobile ? '3.5rem' : '4.5rem',
          left: 0,
          width: '100%',
          padding: isMobile ? '1rem' : '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 100,
          boxSizing: 'border-box',
          opacity: 1
        }}
      >
        {/* Teks "MENURU" dengan animasi loading hanya di bagian NURU */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div style={{
            fontSize: isMobile ? '1.5rem' : '2.5rem',
            fontWeight: '300',
            fontFamily: 'Helvetica, Arial, sans-serif',
            margin: 0,
            letterSpacing: '2px',
            lineHeight: 1,
            textTransform: 'uppercase',
            color: isDarkMode ? 'white' : 'black',
            minHeight: isMobile ? '1.8rem' : '2.8rem',
            display: 'flex',
            alignItems: 'center',
            transition: 'color 0.5s ease'
          }}>
            ME
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.span
                  key={loadingText}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    display: 'inline-block'
                  }}
                >
                  {loadingText}
                </motion.span>
              ) : (
                <motion.span
                  key="nuru-final"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  NURU
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Right Side Buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? '0.8rem' : '1rem'
        }}>
          {/* Color Mode Toggle Button */}
          <motion.button
            onClick={toggleColorMode}
            onMouseEnter={() => handleLinkHover("link", "VIEW", "theme")}
            onMouseLeave={handleLinkLeave}
            style={{
              padding: isMobile ? '0.4rem 0.8rem' : '0.6rem 1rem',
              fontSize: isMobile ? '0.8rem' : '1rem',
              fontWeight: '600',
              color: 'white',
              backgroundColor: 'transparent',
              border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.3)'}`,
              borderRadius: '50px',
              cursor: 'none',
              fontFamily: 'Helvetica, Arial, sans-serif',
              backdropFilter: 'blur(10px)',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '0.3rem' : '0.5rem',
              margin: 0,
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            whileHover={{ 
              backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
              scale: 1.05,
              border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.5)'}`,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ rotate: isDarkMode ? 0 : 180 }}
              transition={{ duration: 0.5 }}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </motion.div>
            {isMobile ? '' : (isDarkMode ? 'LIGHT' : 'DARK')}
          </motion.button>

          {/* Sign In Button */}
          <motion.button
            onClick={() => router.push('/signin')}
            onMouseEnter={() => handleLinkHover("link", "VIEW", "signin")}
            onMouseLeave={handleLinkLeave}
            style={{
              padding: isMobile ? '0.4rem 1rem' : '0.6rem 1.5rem',
              fontSize: isMobile ? '0.9rem' : '1.5rem',
              fontWeight: '600',
              color: 'white',
              backgroundColor: 'transparent',
              border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.3)'}`,
              borderRadius: '50px',
              cursor: 'none',
              fontFamily: 'Helvetica, Arial, sans-serif',
              backdropFilter: 'blur(10px)',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '0.3rem' : '0.5rem',
              margin: 0,
              maxWidth: isMobile ? '120px' : 'none',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            whileHover={{ 
              backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
              scale: 1.05,
              border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.5)'}`,
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
      </div>

      {/* Main Content Container */}
      <div style={{
        width: '100%',
        paddingTop: isMobile ? '8rem' : '12rem',
        paddingLeft: isMobile ? '1rem' : '2rem',
        paddingRight: isMobile ? '1rem' : '2rem',
        boxSizing: 'border-box',
        zIndex: 10,
        position: 'relative'
      }}>
        {/* Deskripsi MENURU */}
        <div style={{
          marginBottom: isMobile ? '2rem' : '3rem'
        }}>
          <p style={{
            color: isDarkMode ? 'white' : 'black',
            fontSize: isMobile ? '1.8rem' : '3.5rem',
            fontWeight: '400',
            fontFamily: 'HelveticaNowDisplay, Arial, sans-serif',
            lineHeight: 1.1,
            margin: 0,
            marginBottom: isMobile ? '1.5rem' : '2rem',
            transition: 'color 0.5s ease',
            wordWrap: 'break-word',
            overflowWrap: 'break-word'
          }}>
            Menuru is a branding personal journal life with a experiences of self about happy, sad, angry, etc.
          </p>

          {/* Foto di bawah teks deskripsi */}
          <div style={{
            width: isMobile ? 'calc(100% - 0.5rem)' : '650px',
            marginLeft: isMobile ? '0.5rem' : '1.5rem',
            overflow: 'hidden',
            borderRadius: '15px',
            boxShadow: '0 15px 40px rgba(0,0,0,0.4)',
            border: `2px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            marginTop: '1rem'
          }}>
            <img 
              src="images/5.jpg" 
              alt="Menuru Visual"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                objectFit: 'cover',
                borderRadius: '13px'
              }}
              onError={(e) => {
                console.error("Gambar tidak ditemukan:", e);
                e.currentTarget.style.backgroundColor = isDarkMode ? '#333' : '#eee';
                e.currentTarget.style.display = 'flex';
                e.currentTarget.style.alignItems = 'center';
                e.currentTarget.style.justifyContent = 'center';
                e.currentTarget.style.color = isDarkMode ? '#fff' : '#000';
                e.currentTarget.style.height = '400px';
                e.currentTarget.innerHTML = '<div style="padding: 2rem; text-align: center;">Image: 5.jpg</div>';
              }}
            />
          </div>
        </div>

        {/* Content tambahan untuk membuat halaman lebih panjang */}
        <div style={{
          height: '100vh',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: isMobile ? '3rem' : '5rem',
          zIndex: 10,
          position: 'relative'
        }}>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            style={{
              color: isDarkMode ? 'white' : 'black',
              fontSize: isMobile ? '1.5rem' : '2rem',
              fontWeight: '300',
              textAlign: 'center',
              maxWidth: '600px',
              padding: '0 2rem'
            }}
          >
            More content coming soon...
          </motion.p>
        </div>
      </div>
    </div>
  );
}
