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
  const [currentView, setCurrentView] = useState<"main" | "index" | "grid">("main"); // Tambahan: state untuk view
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

  // Fungsi untuk mengubah view
  const handleViewChange = (view: "main" | "index" | "grid") => {
    setCurrentView(view);
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

  // Data untuk halaman Index
  const indexTopics = [
    {
      id: 1,
      title: "Personal Journey",
      description: "A deep exploration of self-discovery through daily reflections and emotional documentation.",
      date: "2024-03-15",
      category: "Emotional"
    },
    {
      id: 2,
      title: "Creative Process",
      description: "Documenting the evolution of ideas from conception to execution in various creative projects.",
      date: "2024-03-10",
      category: "Creative"
    },
    {
      id: 3,
      title: "Visual Storytelling",
      description: "Using photography and design to capture moments of personal significance and growth.",
      date: "2024-03-05",
      category: "Visual"
    },
    {
      id: 4,
      title: "Emotional Archive",
      description: "A collection of feelings, thoughts, and experiences categorized for future reflection.",
      date: "2024-02-28",
      category: "Archive"
    },
    {
      id: 5,
      title: "Growth Metrics",
      description: "Tracking personal development through measurable goals and achievement milestones.",
      date: "2024-02-20",
      category: "Development"
    }
  ];

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
        boxSizing: 'border-box',
        zIndex: 10,
        position: 'relative'
      }}>
        {/* AnimatePresence untuk transisi antara view */}
        <AnimatePresence mode="wait">
          {currentView === "main" && (
            <motion.div
              key="main-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Deskripsi MENURU - 3 baris */}
              <div style={{
                marginBottom: isMobile ? '2rem' : '3rem',
                paddingLeft: isMobile ? '0.5rem' : '1rem',
                paddingRight: isMobile ? '0.5rem' : '1rem'
              }}>
                <p style={{
                  color: isDarkMode ? 'white' : 'black',
                  fontSize: isMobile ? '1.8rem' : '3.5rem',
                  fontWeight: '400',
                  fontFamily: 'HelveticaNowDisplay, Arial, sans-serif',
                  lineHeight: 1.3,
                  margin: 0,
                  marginBottom: isMobile ? '1.5rem' : '2rem',
                  transition: 'color 0.5s ease',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word'
                }}>
                  Menuru is a branding personal journal life with a experiences of self about happy, sad, angry, etc. It's a creative exploration of personal growth and emotional journey. Through visual storytelling we capture moments of transformation and self-discovery.
                </p>

                {/* Container untuk 2 foto - LEBIH MENTOK KE LAYAR */}
                <div style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: isMobile ? '1rem' : '0.3rem',
                  width: 'calc(100% - 2rem)',
                  marginLeft: isMobile ? '0.5rem' : '1rem',
                  marginRight: isMobile ? '0.5rem' : '1rem',
                  marginTop: '1rem'
                }}>
                  {/* Foto 1 - Sisi kiri, SANGAT PANJANG */}
                  <div style={{
                    flex: 1,
                    overflow: 'hidden',
                    borderRadius: '25px',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                    border: `3px solid ${isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
                    width: '100%',
                    position: 'relative',
                    zIndex: 1,
                    height: isMobile ? '500px' : '1200px'
                  }}>
                    <img 
                      src="images/5.jpg" 
                      alt="Menuru Visual Left"
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'block',
                        objectFit: 'cover',
                        borderRadius: '22px'
                      }}
                      onError={(e) => {
                        console.error("Gambar kiri tidak ditemukan:", e);
                        e.currentTarget.style.backgroundColor = isDarkMode ? '#333' : '#eee';
                        e.currentTarget.style.display = 'flex';
                        e.currentTarget.style.alignItems = 'center';
                        e.currentTarget.style.justifyContent = 'center';
                        e.currentTarget.style.color = isDarkMode ? '#fff' : '#000';
                        e.currentTarget.style.height = '100%';
                        e.currentTarget.innerHTML = '<div style="padding: 2rem; text-align: center;">Left Image</div>';
                      }}
                    />
                  </div>

                  {/* Foto 2 - Sisi kanan, SANGAT PANJANG */}
                  <div style={{
                    flex: 1,
                    overflow: 'hidden',
                    borderRadius: '25px',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                    border: `3px solid ${isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
                    width: '100%',
                    position: 'relative',
                    zIndex: 1,
                    height: isMobile ? '500px' : '1200px'
                  }}>
                    <img 
                      src="images/6.jpg" 
                      alt="Menuru Visual Right"
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'block',
                        objectFit: 'cover',
                        borderRadius: '22px'
                      }}
                      onError={(e) => {
                        console.error("Gambar kanan tidak ditemukan:", e);
                        e.currentTarget.style.backgroundColor = isDarkMode ? '#333' : '#eee';
                        e.currentTarget.style.display = 'flex';
                        e.currentTarget.style.alignItems = 'center';
                        e.currentTarget.style.justifyContent = 'center';
                        e.currentTarget.style.color = isDarkMode ? '#fff' : '#000';
                        e.currentTarget.style.height = '100%';
                        e.currentTarget.innerHTML = '<div style="padding: 2rem; text-align: center;">Right Image</div>';
                      }}
                    />
                  </div>
                </div>

                {/* Card #0050B7 dengan 4 foto images/5.jpg - FOTO LEBIH LEBAR KE SAMPING */}
                <div
                  style={{
                    width: 'calc(100% - 4rem)',
                    marginLeft: isMobile ? '1rem' : '2rem',
                    marginRight: isMobile ? '1rem' : '2rem',
                    backgroundColor: '#0050B7',
                    borderRadius: '25px',
                    height: isMobile ? '500px' : '800px',
                    marginTop: isMobile ? '1rem' : '1.5rem',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                    position: 'relative',
                    overflow: 'hidden',
                    border: '3px solid rgba(255,255,255,0.1)',
                    padding: isMobile ? '1.5rem' : '2rem',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start'
                  }}
                >
                  {/* Container untuk 4 foto images/5.jpg - GRID TETAP SAMA */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                    gridTemplateRows: '1fr',
                    gap: isMobile ? '1rem' : '1.5rem',
                    width: '100%',
                    height: '100%',
                    alignItems: 'flex-start',
                    justifyContent: 'center'
                  }}>
                    {/* Foto 1 - images/5.jpg - LEBIH LEBAR KE SAMPING */}
                    <div style={{
                      overflow: 'hidden',
                      borderRadius: '20px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                      border: '2px solid rgba(255,255,255,0.2)',
                      width: '100%',
                      height: isMobile ? '600px' : '600px',
                      position: 'relative'
                    }}>
                      <img 
                        src="images/5.jpg" 
                        alt="Portrait 1"
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'block',
                          objectFit: 'cover',
                          borderRadius: '18px'
                        }}
                        onError={(e) => {
                          console.error("Gambar portrait 1 tidak ditemukan:", e);
                          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                          e.currentTarget.style.display = 'flex';
                          e.currentTarget.style.alignItems = 'center';
                          e.currentTarget.style.justifyContent = 'center';
                          e.currentTarget.style.color = 'white';
                          e.currentTarget.innerHTML = '<div style="padding: 1rem; text-align: center;">Image 5</div>';
                        }}
                      />
                    </div>

                    {/* Foto 2 - images/5.jpg - LEBIH LEBAR KE SAMPING */}
                    <div style={{
                      overflow: 'hidden',
                      borderRadius: '20px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                      border: '2px solid rgba(255,255,255,0.2)',
                      width: '100%',
                      height: isMobile ? '600px' : '600px',
                      position: 'relative'
                    }}>
                      <img 
                        src="images/5.jpg" 
                        alt="Portrait 2"
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'block',
                          objectFit: 'cover',
                          borderRadius: '18px'
                        }}
                        onError={(e) => {
                          console.error("Gambar portrait 2 tidak ditemukan:", e);
                          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                          e.currentTarget.style.display = 'flex';
                          e.currentTarget.style.alignItems = 'center';
                          e.currentTarget.style.justifyContent = 'center';
                          e.currentTarget.style.color = 'white';
                          e.currentTarget.innerHTML = '<div style="padding: 1rem; text-align: center;">Image 5</div>';
                        }}
                      />
                    </div>

                    {/* Foto 3 - images/5.jpg - LEBIH LEBAR KE SAMPING */}
                    <div style={{
                      overflow: 'hidden',
                      borderRadius: '20px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                      border: '2px solid rgba(255,255,255,0.2)',
                      width: '100%',
                      height: isMobile ? '600px' : '600px',
                      position: 'relative'
                    }}>
                      <img 
                        src="images/5.jpg" 
                        alt="Portrait 3"
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'block',
                          objectFit: 'cover',
                          borderRadius: '18px'
                        }}
                        onError={(e) => {
                          console.error("Gambar portrait 3 tidak ditemukan:", e);
                          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                          e.currentTarget.style.display = 'flex';
                          e.currentTarget.style.alignItems = 'center';
                          e.currentTarget.style.justifyContent = 'center';
                          e.currentTarget.style.color = 'white';
                          e.currentTarget.innerHTML = '<div style="padding: 1rem; text-align: center;">Image 5</div>';
                        }}
                      />
                    </div>

                    {/* Foto 4 - images/5.jpg - LEBIH LEBAR KE SAMPING */}
                    <div style={{
                      overflow: 'hidden',
                      borderRadius: '20px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                      border: '2px solid rgba(255,255,255,0.2)',
                      width: '100%',
                      height: isMobile ? '600px' : '600px',
                      position: 'relative'
                    }}>
                      <img 
                        src="images/5.jpg" 
                        alt="Portrait 4"
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'block',
                          objectFit: 'cover',
                          borderRadius: '18px'
                        }}
                        onError={(e) => {
                          console.error("Gambar portrait 4 tidak ditemukan:", e);
                          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                          e.currentTarget.style.display = 'flex';
                          e.currentTarget.style.alignItems = 'center';
                          e.currentTarget.style.justifyContent = 'center';
                          e.currentTarget.style.color = 'white';
                          e.currentTarget.innerHTML = '<div style="padding: 1rem; text-align: center;">Image 5</div>';
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tombol Navigasi Index/Grid di bawah card */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '2rem',
                marginTop: isMobile ? '2rem' : '3rem',
                marginBottom: isMobile ? '2rem' : '3rem'
              }}>
                {/* Tombol Index */}
                <motion.button
                  onClick={() => handleViewChange("index")}
                  onMouseEnter={() => handleLinkHover("link", "VIEW", "index")}
                  onMouseLeave={handleLinkLeave}
                  style={{
                    padding: isMobile ? '0.8rem 1.5rem' : '1rem 2rem',
                    fontSize: isMobile ? '1rem' : '1.2rem',
                    fontWeight: '600',
                    color: isDarkMode ? 'white' : 'black',
                    backgroundColor: 'transparent',
                    border: `2px solid ${isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}`,
                    borderRadius: '50px',
                    cursor: 'none',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    backdropFilter: 'blur(10px)',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    margin: 0,
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                  }}
                  whileHover={{ 
                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    scale: 1.05,
                    border: `2px solid ${isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'}`,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke={isDarkMode ? 'white' : 'black'}
                    strokeWidth="2"
                  >
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                  INDEX
                </motion.button>

                {/* Tombol Grid */}
                <motion.button
                  onClick={() => handleViewChange("grid")}
                  onMouseEnter={() => handleLinkHover("link", "VIEW", "grid")}
                  onMouseLeave={handleLinkLeave}
                  style={{
                    padding: isMobile ? '0.8rem 1.5rem' : '1rem 2rem',
                    fontSize: isMobile ? '1rem' : '1.2rem',
                    fontWeight: '600',
                    color: isDarkMode ? 'white' : 'black',
                    backgroundColor: 'transparent',
                    border: `2px solid ${isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}`,
                    borderRadius: '50px',
                    cursor: 'none',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    backdropFilter: 'blur(10px)',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    margin: 0,
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                  }}
                  whileHover={{ 
                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    scale: 1.05,
                    border: `2px solid ${isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'}`,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke={isDarkMode ? 'white' : 'black'}
                    strokeWidth="2"
                  >
                    <rect x="3" y="3" width="7" height="7"/>
                    <rect x="14" y="3" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/>
                  </svg>
                  GRID
                </motion.button>
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
            </motion.div>
          )}

          {/* Halaman Index */}
          {currentView === "index" && (
            <motion.div
              key="index-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                width: '100%',
                minHeight: '100vh',
                padding: isMobile ? '1rem' : '2rem',
                boxSizing: 'border-box'
              }}
            >
              {/* Garis horizontal hitam di atas */}
              <div style={{
                width: '100%',
                height: '2px',
                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
                marginBottom: isMobile ? '1.5rem' : '2rem',
                marginTop: '1rem'
              }}></div>

              {/* Container utama untuk halaman Index */}
              <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? '2rem' : '3rem',
                width: '100%',
                minHeight: 'calc(100vh - 200px)'
              }}>
                {/* Kolom kiri - MENURU */}
                <div style={{
                  flex: isMobile ? '0 0 auto' : 1,
                  paddingRight: isMobile ? '0' : '2rem',
                  borderRight: isMobile ? 'none' : `1px solid ${isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`
                }}>
                  <h2 style={{
                    color: isDarkMode ? 'white' : 'black',
                    fontSize: isMobile ? '2rem' : '3rem',
                    fontWeight: '300',
                    margin: '0 0 1.5rem 0',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    MENURU
                  </h2>
                  <p style={{
                    color: isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)',
                    fontSize: isMobile ? '1rem' : '1.1rem',
                    lineHeight: 1.6,
                    margin: 0
                  }}>
                    A personal branding journal documenting the emotional journey of self-discovery, creative exploration, and visual storytelling through daily experiences.
                  </p>
                </div>

                {/* Kolom tengah - Jenis Topics */}
                <div style={{
                  flex: isMobile ? '0 0 auto' : 2,
                  paddingRight: isMobile ? '0' : '2rem',
                  borderRight: isMobile ? 'none' : `1px solid ${isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`
                }}>
                  <h3 style={{
                    color: isDarkMode ? 'white' : 'black',
                    fontSize: isMobile ? '1.5rem' : '2rem',
                    fontWeight: '400',
                    margin: '0 0 1.5rem 0',
                    textTransform: 'uppercase'
                  }}>
                    Topics
                  </h3>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                  }}>
                    {indexTopics.map((topic) => (
                      <motion.div
                        key={topic.id}
                        whileHover={{ x: 5 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          padding: '0.8rem 0',
                          borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                          cursor: 'pointer'
                        }}
                        onMouseEnter={() => handleLinkHover("link", "VIEW", `topic-${topic.id}`)}
                        onMouseLeave={handleLinkLeave}
                      >
                        <div style={{
                          color: isDarkMode ? 'white' : 'black',
                          fontSize: isMobile ? '1.1rem' : '1.3rem',
                          fontWeight: '500',
                          marginBottom: '0.3rem'
                        }}>
                          {topic.title}
                        </div>
                        <div style={{
                          display: 'flex',
                          gap: '1rem',
                          alignItems: 'center'
                        }}>
                          <span style={{
                            color: '#6366F1',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            backgroundColor: isDarkMode ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.15)',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '12px'
                          }}>
                            {topic.category}
                          </span>
                          <span style={{
                            color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
                            fontSize: '0.8rem'
                          }}>
                            {topic.date}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Kolom kanan - Deskripsi + Tanggal */}
                <div style={{
                  flex: isMobile ? '0 0 auto' : 1.5
                }}>
                  {indexTopics.map((topic) => (
                    <motion.div
                      key={topic.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: topic.id * 0.1 }}
                      style={{
                        marginBottom: '2rem',
                        padding: '1.5rem',
                        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                        borderRadius: '15px',
                        border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                      }}
                    >
                      <div style={{
                        color: isDarkMode ? 'white' : 'black',
                        fontSize: isMobile ? '1.2rem' : '1.4rem',
                        fontWeight: '500',
                        marginBottom: '0.8rem'
                      }}>
                        {topic.title}
                      </div>
                      <p style={{
                        color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                        fontSize: isMobile ? '0.9rem' : '1rem',
                        lineHeight: 1.6,
                        margin: '0 0 1rem 0'
                      }}>
                        {topic.description}
                      </p>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingTop: '0.8rem',
                        borderTop: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                      }}>
                        <span style={{
                          color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
                          fontSize: '0.85rem'
                        }}>
                          Published: {topic.date}
                        </span>
                        <motion.button
                          onMouseEnter={() => handleLinkHover("link", "READ", `read-${topic.id}`)}
                          onMouseLeave={handleLinkLeave}
                          style={{
                            padding: '0.4rem 0.8rem',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            color: '#6366F1',
                            backgroundColor: 'transparent',
                            border: `1px solid #6366F1`,
                            borderRadius: '20px',
                            cursor: 'none',
                            transition: 'all 0.2s ease'
                          }}
                          whileHover={{ 
                            backgroundColor: '#6366F1',
                            color: 'white',
                            scale: 1.05
                          }}
                        >
                          Read More
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Tombol kembali ke Main View */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '3rem',
                marginBottom: '3rem'
              }}>
                <motion.button
                  onClick={() => handleViewChange("main")}
                  onMouseEnter={() => handleLinkHover("link", "BACK", "main")}
                  onMouseLeave={handleLinkLeave}
                  style={{
                    padding: isMobile ? '0.8rem 1.5rem' : '1rem 2rem',
                    fontSize: isMobile ? '1rem' : '1.2rem',
                    fontWeight: '600',
                    color: isDarkMode ? 'white' : 'black',
                    backgroundColor: 'transparent',
                    border: `2px solid ${isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}`,
                    borderRadius: '50px',
                    cursor: 'none',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    backdropFilter: 'blur(10px)',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    margin: 0,
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                  }}
                  whileHover={{ 
                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    scale: 1.05,
                    border: `2px solid ${isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'}`,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke={isDarkMode ? 'white' : 'black'}
                    strokeWidth="2"
                  >
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                  BACK TO MAIN
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Halaman Grid (placeholder) */}
          {currentView === "grid" && (
            <motion.div
              key="grid-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                width: '100%',
                minHeight: '100vh',
                padding: isMobile ? '1rem' : '2rem',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <h2 style={{
                color: isDarkMode ? 'white' : 'black',
                fontSize: isMobile ? '2rem' : '3rem',
                fontWeight: '300',
                marginBottom: '2rem'
              }}>
                Grid View - Coming Soon
              </h2>
              <motion.button
                onClick={() => handleViewChange("main")}
                onMouseEnter={() => handleLinkHover("link", "BACK", "main")}
                onMouseLeave={handleLinkLeave}
                style={{
                  padding: isMobile ? '0.8rem 1.5rem' : '1rem 2rem',
                  fontSize: isMobile ? '1rem' : '1.2rem',
                  fontWeight: '600',
                  color: isDarkMode ? 'white' : 'black',
                  backgroundColor: 'transparent',
                  border: `2px solid ${isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}`,
                  borderRadius: '50px',
                  cursor: 'none',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  backdropFilter: 'blur(10px)',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  margin: 0,
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                }}
                whileHover={{ 
                  backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                  scale: 1.05,
                  border: `2px solid ${isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'}`,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.95 }}
              >
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke={isDarkMode ? 'white' : 'black'}
                  strokeWidth="2"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                BACK TO MAIN
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
