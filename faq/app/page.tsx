'use client';

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from '@studio-freight/lenis';
import LocomotiveScroll from "locomotive-scroll";


// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

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
  const cardRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const topNavRef = useRef<HTMLDivElement>(null);

  // Animasi loading text
  const loadingTexts = [
    "NURU", "MBACA", "NULIS", "NGEXPLORASI", 
    "NEMUKAN", "NCIPTA", "NGGALI", "NARIK",
    "NGAMATI", "NANCANG", "NGEMBANGKAN", "NYUSUN"
  ];
  
  
  const [cursorTrail, setCursorTrail] = useState([]);
const cursorCount = 10; // Total number of images in the trail

useEffect(() => {
  // Create the initial array for cursor images
  setCursorTrail(Array.from({ length: cursorCount }).map((_, i) => ({
    id: i,
    x: 0,
    y: 0,
    isActive: false, // Track whether image is in the trail
  })));
}, []);

const moveCursor = (e: MouseEvent) => {
  // Update the trail with the current cursor position
  setCursorTrail((prevTrail) => {
    const newTrail = [...prevTrail];

    // Shift positions of images in the trail
    for (let i = cursorCount - 1; i > 0; i--) {
      newTrail[i] = newTrail[i - 1];
    }

    // Add the new image at the front of the trail
    newTrail[0] = {
      ...newTrail[0],
      x: e.clientX,
      y: e.clientY,
      isActive: true, // Activate this image
    };

    // Deactivate images that move off the trail
    newTrail.forEach((image, index) => {
      if (index === cursorCount - 1) {
        image.isActive = false;
      }
    });

    // Animate the images to follow the cursor
    newTrail.forEach((image, index) => {
      if (image.isActive) {
        gsap.to(`#cursor-image-${image.id}`, {
          x: image.x,
          y: image.y,
          duration: 0.1,
          ease: "power2.out",
          delay: index * 0.05, // Add stagger effect for the trail
        });
      }
    });

    return newTrail;
  });
};

useEffect(() => {
  document.addEventListener("mousemove", moveCursor);
  return () => document.removeEventListener("mousemove", moveCursor);
}, []);

  
  

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

    // GSAP Scroll Animation untuk header dan top nav
    if (headerRef.current && topNavRef.current) {
      gsap.to([headerRef.current, topNavRef.current], {
        opacity: 0,
        y: -100,
        duration: 0.5,
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top 10%",
          end: "bottom 20%",
          scrub: true,
          onEnter: () => {
            gsap.to([headerRef.current, topNavRef.current], { opacity: 0, y: -100, duration: 0.3 });
          },
          onLeaveBack: () => {
            gsap.to([headerRef.current, topNavRef.current], { opacity: 1, y: 0, duration: 0.3 });
          }
        }
      });
    }

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
      clearInterval(textInterval);
      clearTimeout(loadingTimeout);
      document.removeEventListener('mousemove', moveCursor);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

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

  // Warna cursor - DIPERBAIKI: Warna cerah yang bagus
  const getCursorColors = () => {
    if (cursorType === "link") {
      return {
        dotColor: '#6366F1', // Indigo cerah
        textColor: 'white'
      };
    }
    
    // Default cursor
    return {
      dotColor: '#EC4899', // Pink cerah
      textColor: 'white'
    };
  };

  const cursorColors = getCursorColors();

  // Fungsi untuk mendapatkan warna teks berdasarkan hover state
  const getLinkColor = (linkName: string) => {
    const isHovered = hoveredLink === linkName;
    if (isHovered) {
      return isDarkMode ? 'black' : '#CCFF00';
    }
    return isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(204,255,0,0.7)';
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: isDarkMode ? 'black' : '#ff0028',
      margin: 0,
      padding: 0,
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      alignItems: 'center',
      position: 'relative',
      overflow: 'auto', // Ubah dari 'hidden' ke 'auto' untuk enable scroll
      fontFamily: 'Helvetica, Arial, sans-serif',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
      transition: 'background-color 0.5s ease',
      cursor: 'none'
    }}>
	
	
	<div>
  {cursorTrail.map((image, index) => (
    image.isActive && (
      <img
        key={image.id}
        id={`cursor-image-${image.id}`}
        src="/images/5.jpg" // Your image path
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '30px', // Adjust size of each image
          height: '30px', // Adjust size of each image
          pointerEvents: 'none',
          zIndex: 9999,
          opacity: 0.8, // You can adjust the opacity to make it more subtle
        }}
      />
    )
  ))}
</div>


      {/* Custom Cursor - DIPERBAIKI: Warna cerah yang bagus */}
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

      {/* Top Navigation Bar - DIPERBAIKI: Warna biru agar tidak tabrakan dengan background hijau */}
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
          boxSizing: 'border-box'
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? '1rem' : '2rem',
          backgroundColor: 'transparent', // Biru indigo
          backdropFilter: '#FF007F',
          borderRadius: '50px',
          padding: isMobile ? '0.6rem 1rem' : '0.8rem 1.5rem',
          border: `1px solid rgba(255,255,255,0.2)`,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          {/* Docs - DIPERBAIKI: Background biru muda */}
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
              backgroundColor: 'rgba(255,255,255,0.9)', // Putih solid
              transition: 'all 0.3s ease'
            }}
            whileHover={{ 
              backgroundColor: 'white',
              scale: 1.05
            }}
          >
            <svg 
              width={isMobile ? "18" : "20"} 
              height={isMobile ? "18" : "20"} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#6366F1" // Biru indigo
              strokeWidth="2"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
            <span style={{
              color: '#6366F1', // Biru indigo
              fontSize: isMobile ? '0.8rem' : '0.9rem',
              fontWeight: '600',
              fontFamily: 'Helvetica, Arial, sans-serif'
            }}>
              Docs
            </span>
            <div style={{
              backgroundColor: '#EC4899', // Pink cerah
              color: 'white',
              fontSize: '0.7rem',
              fontWeight: '700',
              padding: '0.1rem 0.4rem',
              borderRadius: '10px',
              marginLeft: '0.3rem'
            }}>
              NEW
            </div>
          </motion.div>

          {/* Chatbot - DIPERBAIKI: Background biru muda */}
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
              backgroundColor: 'rgba(255,255,255,0.9)', // Putih solid
              transition: 'all 0.3s ease'
            }}
            whileHover={{ 
              backgroundColor: 'white',
              scale: 1.05
            }}
          >
            <svg 
              width={isMobile ? "18" : "20"} 
              height={isMobile ? "18" : "20"} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#6366F1" // Biru indigo
              strokeWidth="2"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              <line x1="8" y1="7" x2="16" y2="7"/>
              <line x1="8" y1="11" x2="12" y2="11"/>
            </svg>
            <span style={{
              color: '#6366F1', // Biru indigo
              fontSize: isMobile ? '0.8rem' : '0.9rem',
              fontWeight: '600',
              fontFamily: 'Helvetica, Arial, sans-serif'
            }}>
              Chatbot
            </span>
            <div style={{
              backgroundColor: '#EC4899', // Pink cerah
              color: 'white',
              fontSize: '0.7rem',
              fontWeight: '700',
              padding: '0.1rem 0.4rem',
              borderRadius: '10px',
              marginLeft: '0.3rem'
            }}>
              NEW
            </div>
          </motion.div>

          {/* Update - DIPERBAIKI: Background biru muda */}
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
              backgroundColor: 'rgba(255,255,255,0.9)', // Putih solid
              transition: 'all 0.3s ease'
            }}
            whileHover={{ 
              backgroundColor: 'white',
              scale: 1.05
            }}
          >
            <svg 
              width={isMobile ? "18" : "20"} 
              height={isMobile ? "18" : "20"} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#6366F1" // Biru indigo
              strokeWidth="2"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
            <span style={{
              color: '#6366F1', // Biru indigo
              fontSize: isMobile ? '0.8rem' : '0.9rem',
              fontWeight: '600',
              fontFamily: 'Helvetica, Arial, sans-serif'
            }}>
              Update
            </span>
            <div style={{
              backgroundColor: '#EC4899', // Pink cerah
              color: 'white',
              fontSize: '0.7rem',
              fontWeight: '700',
              padding: '0.1rem 0.4rem',
              borderRadius: '10px',
              marginLeft: '0.3rem'
            }}>
              NEW
            </div>
          </motion.div>

          {/* Timeline - DIPERBAIKI: Background biru muda */}
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
              backgroundColor: 'rgba(255,255,255,0.9)', // Putih solid
              transition: 'all 0.3s ease'
            }}
            whileHover={{ 
              backgroundColor: 'white',
              scale: 1.05
            }}
          >
            <svg 
              width={isMobile ? "18" : "20"} 
              height={isMobile ? "18" : "20"} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#6366F1" // Biru indigo
              strokeWidth="2"
            >
              <polyline points="1 4 1 10 7 10"/>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
              <line x1="12" y1="7" x2="12" y2="13"/>
              <line x1="16" y1="11" x2="12" y2="7"/>
            </svg>
            <span style={{
              color: '#6366F1', // Biru indigo
              fontSize: isMobile ? '0.8rem' : '0.9rem',
              fontWeight: '600',
              fontFamily: 'Helvetica, Arial, sans-serif'
            }}>
              Timeline
            </span>
            <div style={{
              backgroundColor: '#EC4899', // Pink cerah
              color: 'white',
              fontSize: '0.7rem',
              fontWeight: '700',
              padding: '0.1rem 0.4rem',
              borderRadius: '10px',
              marginLeft: '0.3rem'
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
          boxSizing: 'border-box'
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
              color: 'black',
              backgroundColor: '#CCFF00',
              border: 'none',
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
              backgroundColor: '#D4FF33',
              scale: 1.05,
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
              color: 'black',
              backgroundColor: '#CCFF00',
              border: 'none',
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
              backgroundColor: '#D4FF33',
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
      </div>

      {/* Deskripsi MENURU di Body Halaman Utama - TAMBAHAN BARU */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, delay: 0.9 }}
  style={{
    position: 'fixed',
    top: isMobile ? '7rem' : '10rem',
    left: isMobile ? '1rem' : '2rem',
    width: isMobile ? 'calc(100% - 2rem)' : '800px', // Lebar lebih besar untuk font besar
    maxWidth: '800px',
    textAlign: 'left'
  }}
>
  <p style={{
    color: isDarkMode ? 'white' : 'black',
    fontSize: isMobile ? '1.8rem' : '3.5rem', // FONT SANGAT BESAR
    fontWeight: '400',
    fontFamily: 'HelveticaNowDisplay, Arial, sans-serif',
    lineHeight: 1.1, // Line height sangat ketat agar tidak turun
    margin: 0,
    transition: 'color 0.5s ease',
    wordWrap: 'break-word',
    overflowWrap: 'break-word'
  }}>
    Menuru is a branding personal journal life with a experiences of self about happy, sad, angry, etc.
  </p>
</motion.div>


	 
	  {/* Card Design - TETAP SAMA seperti design awal */}
      <motion.div
        ref={cardRef}
        style={{
          width: isMobile ? '100%' : '90%',
    maxWidth: isMobile ? '100%' : '1900px',
    height: 'auto',
    backgroundColor: isDarkMode ? '#CCFF00' : 'black',
    borderRadius: isMobile ? '30px 30px 0 0' : '40px',
    padding: isMobile ? '2rem 1.5rem 3rem' : '3rem',
    display: 'flex',
    alignItems: 'left',
    gap: isMobile ? '1.5rem' : '3rem',
    cursor: 'none',
    margin: 0,
    boxShadow: isDarkMode 
      ? '0 -10px 40px rgba(204, 255, 0, 0.3)' 
      : '0 -10px 40px rgba(0, 0, 0, 0.3)',
    flexDirection: 'column',
    boxSizing: 'border-box',
    transition: 'all 0.5s ease',
    position: 'sticky',
    bottom: 0,
    zIndex: 98,
    marginTop: '100vh' // TAMBAHKAN margin top
	
        }}
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.7 }}
        whileHover={{
          scale: isMobile ? 1 : 1.02,
          backgroundColor: isDarkMode ? '#D4FF33' : '#111111',
          transition: { duration: 0.3 }
        }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Content Section - TETAP SAMA */}
        <div style={{
          display: 'flex',
          width: '100%',
          gap: isMobile ? '1.5rem' : '3rem',
          flexDirection: isMobile ? 'column' : 'row'
        }}>
          {/* Left Section - MENURU - TETAP SAMA */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? '1rem' : '1.5rem'
          }}>
            <h3 style={{
              color: isDarkMode ? 'black' : '#CCFF00',
              fontSize: isMobile ? '3rem' : '10rem',
              fontWeight: isMobile ? '800' : '2800',
              fontFamily: 'Verdana, Geneva, sans-serif',
              margin: 0,
              lineHeight: 1.1,
              letterSpacing: isMobile ? '-0.5px' : '-1px',
              transition: 'color 0.5s ease'
            }}>
              MENURU{isMobile ? '' : <br/>}
            </h3>

            {/* Daftar Website Pribadi Section - Responsive - TETAP SAMA */}
            <motion.div
              style={{
                width: '100%',
                marginTop: isMobile ? '0.5rem' : '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: isMobile ? '0.3rem' : '0.5rem'
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: isMobile ? '0.2rem' : '0.3rem'
              }}>
                {/* Portfolio */}
                <motion.div
                  onMouseEnter={() => handleLinkHover("link", "COMING SOON", "portfolio")}
                  onMouseLeave={handleLinkLeave}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? '0.8rem' : '1.5rem',
                    padding: isMobile ? '0.6rem 0' : '0.8rem 0',
                    borderBottom: `1px solid ${isDarkMode ? 'rgba(0,0,0,0.1)' : 'rgba(204,255,0,0.3)'}`,
                    cursor: 'none',
                    flexWrap: isMobile ? 'wrap' : 'nowrap'
                  }}
                  whileHover={{ 
                    x: isMobile ? 0 : 10,
                    transition: { duration: 0.2 }
                  }}
                >
                  <span style={{
                    color: isDarkMode ? 'black' : '#CCFF00',
                    fontSize: isMobile ? '1rem' : '3rem',
                    fontFamily: 'Verdana, Geneva, sans-serif',
                    minWidth: isMobile ? '25px' : '30px',
                    transition: 'color 0.5s ease'
                  }}>
                    01
                  </span>
                  
                  <span style={{
                    color: isDarkMode ? 'black' : '#CCFF00',
                    fontSize: isMobile ? '1.2rem' : '3rem',
                    fontWeight: '500',
                    fontFamily: 'Verdana, Geneva, sans-serif',
                    flex: 1,
                    transition: 'color 0.5s ease'
                  }}>
                    Portfolio
                  </span>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? '0.4rem' : '0.8rem',
                    color: isDarkMode ? 'black' : '#CCFF00',
                    fontSize: isMobile ? '0.9rem' : '3rem',
                    fontFamily: 'Verdana, Geneva, sans-serif',
                    transition: 'color 0.5s ease'
                  }}>
                    <svg 
                      width={isMobile ? "20" : "40"} 
                      height={isMobile ? "20" : "40"} 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <span>{isMobile ? 'Dec 24' : 'Dec 2024'}</span>
                  </div>

                  <motion.svg
                    width={isMobile ? "20" : "40"}
                    height={isMobile ? "20" : "40"}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={isDarkMode ? 'black' : '#CCFF00'}
                    strokeWidth="2"
                    whileHover={{ x: isMobile ? 0 : 3 }}
                    transition={{ duration: 0.2 }}
                  >
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </motion.svg>
                </motion.div>

                {/* Photography */}
                <motion.div
                  onMouseEnter={() => handleLinkHover("link", "COMING SOON", "photography")}
                  onMouseLeave={handleLinkLeave}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? '0.8rem' : '1.5rem',
                    padding: isMobile ? '0.6rem 0' : '0.8rem 0',
                    borderBottom: `1px solid ${isDarkMode ? 'rgba(0,0,0,0.1)' : 'rgba(204,255,0,0.3)'}`,
                    cursor: 'none',
                    flexWrap: isMobile ? 'wrap' : 'nowrap'
                  }}
                  whileHover={{ 
                    x: isMobile ? 0 : 10,
                    transition: { duration: 0.2 }
                  }}
                >
                  <span style={{
                    color: isDarkMode ? 'black' : '#CCFF00',
                    fontSize: isMobile ? '1rem' : '3rem',
                    fontFamily: 'Verdana, Geneva, sans-serif',
                    minWidth: isMobile ? '25px' : '30px',
                    transition: 'color 0.5s ease'
                  }}>
                    02
                  </span>
                  
                  <span style={{
                    color: isDarkMode ? 'black' : '#CCFF00',
                    fontSize: isMobile ? '1.2rem' : '3rem',
                    fontWeight: '500',
                    fontFamily: 'Verdana, Geneva, sans-serif',
                    flex: 1,
                    transition: 'color 0.5s ease'
                  }}>
                    Photography
                  </span>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? '0.4rem' : '0.8rem',
                    color: isDarkMode ? 'black' : '#CCFF00',
                    fontSize: isMobile ? '0.9rem' : '3rem',
                    fontFamily: 'Verdana, Geneva, sans-serif',
                    transition: 'color 0.5s ease'
                  }}>
                    <svg 
                      width={isMobile ? "20" : "40"} 
                      height={isMobile ? "20" : "40"} 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <span>{isMobile ? 'Jan 25' : 'Jan 2025'}</span>
                  </div>

                  <motion.svg
                    width={isMobile ? "20" : "40"}
                    height={isMobile ? "20" : "40"}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={isDarkMode ? 'black' : '#CCFF00'}
                    strokeWidth="2"
                    whileHover={{ x: isMobile ? 0 : 3 }}
                    transition={{ duration: 0.2 }}
                  >
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </motion.svg>
                </motion.div>

                {/* Forum */}
                <motion.div
                  onMouseEnter={() => handleLinkHover("link", "COMING SOON", "forum")}
                  onMouseLeave={handleLinkLeave}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? '0.8rem' : '1.5rem',
                    padding: isMobile ? '0.6rem 0' : '0.8rem 0',
                    borderBottom: `1px solid ${isDarkMode ? 'rgba(0,0,0,0.1)' : 'rgba(204,255,0,0.3)'}`,
                    cursor: 'none',
                    flexWrap: isMobile ? 'wrap' : 'nowrap'
                  }}
                  whileHover={{ 
                    x: isMobile ? 0 : 10,
                    transition: { duration: 0.2 }
                  }}
                >
                  <span style={{
                    color: isDarkMode ? 'black' : '#CCFF00',
                    fontSize: isMobile ? '1rem' : '3rem',
                    fontFamily: 'Verdana, Geneva, sans-serif',
                    minWidth: isMobile ? '25px' : '30px',
                    transition: 'color 0.5s ease'
                  }}>
                    03
                  </span>
                  
                  <span style={{
                    color: isDarkMode ? 'black' : '#CCFF00',
                    fontSize: isMobile ? '1.2rem' : '3rem',
                    fontWeight: '500',
                    fontFamily: 'Verdana, Geneva, sans-serif',
                    flex: 1,
                    transition: 'color 0.5s ease'
                  }}>
                    Forum
                  </span>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? '0.4rem' : '0.8rem',
                    color: isDarkMode ? 'black' : '#CCFF00',
                    fontSize: isMobile ? '0.9rem' : '3rem',
                    fontFamily: 'Verdana, Geneva, sans-serif',
                    transition: 'color 0.5s ease'
                  }}>
                    <svg 
                      width={isMobile ? "20" : "40"} 
                      height={isMobile ? "20" : "40"} 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <span>{isMobile ? 'Feb 25' : 'Feb 2025'}</span>
                  </div>

                  <motion.svg
                    width={isMobile ? "20" : "40"}
                    height={isMobile ? "20" : "40"}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={isDarkMode ? 'black' : '#CCFF00'}
                    strokeWidth="2"
                    whileHover={{ x: isMobile ? 0 : 3 }}
                    transition={{ duration: 0.2 }}
                  >
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </motion.svg>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Right Section - LETS COLLABORATE - DIPERBAIKI: Book a Call seperti design awal tapi lebih besar */}
          <div style={{
            flex: isMobile ? 1 : 0.6,
            display: 'flex',
            flexDirection: 'column',
            alignItems: isMobile ? 'center' : 'flex-start',
            justifyContent: 'center',
            gap: isMobile ? '1rem' : '2rem',
            textAlign: isMobile ? 'center' : 'left'
          }}>
            <h3 style={{
              color: isDarkMode ? 'black' : '#CCFF00',
              fontSize: isMobile ? '2rem' : '5rem',
              fontWeight: '800',
              fontFamily: 'Verdana, Geneva, sans-serif',
              margin: 0,
              lineHeight: 1.1,
              letterSpacing: isMobile ? '-0.5px' : '-1px',
              transition: 'color 0.5s ease'
            }}>
              LETS
              <br />
              COLLABORATE
            </h3>
            
            {/* Book a Call - DIPERBAIKI: Design seperti awal tapi lebih besar dengan pemancar di samping icon */}
            <a 
              href="/book-call" 
              onMouseEnter={() => handleLinkHover("link", "VIEW", "bookcall")}
              onMouseLeave={handleLinkLeave}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? '0.8rem' : '1.5rem',
                cursor: 'none',
                textDecoration: 'none',
                color: getLinkColor("bookcall"),
                padding: isMobile ? '0.5rem 0' : '0.5rem 0',
                transition: 'color 0.3s ease',
                position: 'relative'
              }}
            >
              <span style={{
                fontSize: isMobile ? '1.2rem' : '2.5rem', // Teks lebih besar
                fontWeight: '600',
                fontFamily: 'Verdana, Geneva, sans-serif'
              }}>
                BOOK A CALL
              </span>
              
              {/* Container untuk icon dan pemancar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                position: 'relative'
              }}>
               
               
                <svg 
                  width={isMobile ? "20" : "40"} 
                  height={isMobile ? "20" : "40"} 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
            </a>

            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: 'center',
              gap: isMobile ? '0.8rem' : '2rem',
              marginTop: isMobile ? '0.5rem' : '1rem'
            }}>
              <a 
                href="/terms" 
                onMouseEnter={() => handleLinkHover("link", "COMING SOON", "terms")}
                onMouseLeave={handleLinkLeave}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? '0.3rem' : '0.5rem',
                  textDecoration: 'none',
                  color: getLinkColor("terms"),
                  fontSize: isMobile ? '0.9rem' : '3rem',
                  fontFamily: 'Verdana, Geneva, sans-serif',
                  transition: 'color 0.3s ease',
                  cursor: 'none'
                }}
              >
                {isMobile ? 'Terms' : 'Ketentuan Kami'}
                <svg 
                  width={isMobile ? "16" : "100"} 
                  height={isMobile ? "16" : "100"} 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <path d="M7 17L17 7M17 7H7M17 7V17"/>
                </svg>
              </a>
              
              <a 
                href="/privacy" 
                onMouseEnter={() => handleLinkHover("link", "COMING SOON", "privacy")}
                onMouseLeave={handleLinkLeave}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? '0.3rem' : '0.5rem',
                  textDecoration: 'none',
                  color: getLinkColor("privacy"),
                  fontSize: isMobile ? '0.9rem' : '3rem',
                  fontFamily: 'Verdana, Geneva, sans-serif',
                  transition: 'color 0.3s ease',
                  cursor: 'none'
                }}
              >
                {isMobile ? 'Privacy' : 'Kebijakan Privasi'}
                <svg 
                  width={isMobile ? "16" : "100"} 
                  height={isMobile ? "16" : "100"} 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <path d="M7 17L17 7M17 7H7M17 7V17"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
