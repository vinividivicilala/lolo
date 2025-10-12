'use client';

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import gsap from "gsap";

export default function HomePage(): React.JSX.Element {
  const [showLoading, setShowLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (showMenu && menuRef.current) {
      // GSAP Animation for menu items
      const tl = gsap.timeline();
      
      // Animate menu items
      tl.fromTo(".menu-item", 
        { 
          x: -100, 
          opacity: 0,
        },
        { 
          x: 0, 
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out"
        }
      );

      // Animate social links at the bottom
      tl.fromTo(".social-link",
        {
          y: 50,
          opacity: 0
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "back.out(1.7)"
        },
        "-=0.4"
      );
    }
  }, [showMenu]);

  const navigateToNotes = () => {
    setShowLoading(true);
    setTimeout(() => {
      router.push('/notes');
    }, 1000);
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const menuItems = [
    { name: "HOME", delay: 0.3 },
    { name: "WORK", delay: 0.4 },
    { name: "ABOUT", delay: 0.5 },
    { name: "CONTACT", delay: 0.6 }
  ];

  const socialLinks = [
    { name: "INSTAGRAM", url: "https://instagram.com" },
    { name: "TWITTER", url: "https://twitter.com" },
    { name: "LINKEDIN", url: "https://linkedin.com" },
    { name: "DRIBBBLE", url: "https://dribbble.com" },
    { name: "BEHANCE", url: "https://behance.net" }
  ];

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
      fontFamily: 'Saans Trial, sans-serif',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale'
    }}>
      {/* Menu Button */}
      <motion.div
        onClick={toggleMenu}
        style={{
          position: 'absolute',
          top: '2rem',
          right: '2rem',
          fontSize: '1.2rem',
          fontWeight: '500',
          color: 'white',
          cursor: 'pointer',
          fontFamily: 'Saans Trial, sans-serif',
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
              ref={menuRef}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: '#CCFF00',
                zIndex: 25,
                display: 'flex',
                flexDirection: 'column',
                padding: '2rem'
              }}
              initial={{ scaleY: 0, transformOrigin: "top" }}
              animate={{ scaleY: 1 }}
              exit={{ scaleY: 0 }}
              transition={{ 
                duration: 0.8,
                ease: [0.76, 0, 0.24, 1]
              }}
            >
              {/* Website Name - Top Left */}
              <motion.div
                style={{
                  position: 'absolute',
                  left: '2rem',
                  top: '2rem',
                  fontSize: '1.8rem',
                  fontWeight: '400',
                  color: 'black',
                  fontFamily: 'Saans Trial, sans-serif',
                  lineHeight: 1,
                  letterSpacing: '1px',
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale'
                }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ 
                  duration: 0.6,
                  delay: 0.4,
                  ease: "easeOut"
                }}
              >
                sorusuru
              </motion.div>

              {/* Main Content - Navigation Menu */}
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                paddingLeft: '2rem'
              }}>
                {/* Menu Items - Very tight spacing */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0rem'
                }}>
                  {menuItems.map((item, index) => (
                    <div
                      key={item.name}
                      className="menu-item"
                      style={{
                        position: 'relative',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      onMouseEnter={(e) => {
                        gsap.to(e.currentTarget, {
                          x: 10,
                          duration: 0.3,
                          ease: "power2.out"
                        });
                      }}
                      onMouseLeave={(e) => {
                        gsap.to(e.currentTarget, {
                          x: 0,
                          duration: 0.3,
                          ease: "power2.out"
                        });
                      }}
                    >
                      {/* Menu Text */}
                      <div style={{
                        fontSize: '3.5rem',
                        fontWeight: '400',
                        color: 'black',
                        fontFamily: 'Saans Trial, sans-serif',
                        lineHeight: 0.8,
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                        padding: '0rem 0',
                        margin: '0rem 0'
                      }}>
                        {item.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Links - Bottom Section */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                marginTop: 'auto',
                paddingBottom: '2rem'
              }}>
                {/* Social Links - Extremely tight spacing */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.02rem' // Very very close gap
                }}>
                  {socialLinks.map((social, index) => (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        textDecoration: 'none',
                        color: 'black',
                        padding: '0.02rem 0', // Very very thin padding
                        cursor: 'pointer',
                        lineHeight: 0.9 // Tight line height
                      }}
                      onMouseEnter={(e) => {
                        gsap.to(e.currentTarget, {
                          x: 5,
                          duration: 0.3,
                          ease: "power2.out"
                        });
                        gsap.to(e.currentTarget.querySelector('.social-arrow'), {
                          x: 5,
                          duration: 0.3,
                          ease: "power2.out"
                        });
                      }}
                      onMouseLeave={(e) => {
                        gsap.to(e.currentTarget, {
                          x: 0,
                          duration: 0.3,
                          ease: "power2.out"
                        });
                        gsap.to(e.currentTarget.querySelector('.social-arrow'), {
                          x: 0,
                          duration: 0.3,
                          ease: "power2.out"
                        });
                      }}
                    >
                      <div style={{
                        fontSize: '1rem',
                        fontWeight: '700',
                        letterSpacing: '1px',
                        textTransform: 'uppercase'
                      }}>
                        {social.name}
                      </div>
                      
                      {/* Arrow SVG */}
                      <div className="social-arrow">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="3" y1="9" x2="15" y2="9" />
                          <polyline points="12 6 15 9 12 12" />
                        </svg>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
            
            {/* Close Button */}
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

      {/* Loading and Main Content */}
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
              zIndex: 10
            }}
            initial={{ opacity: 1 }}
            exit={{ 
              opacity: 0,
              transition: { duration: 0.6, ease: "easeInOut" }
            }}
          >
            <motion.div
              style={{
                fontSize: '4rem',
                fontWeight: '900',
                color: 'white',
                fontFamily: 'Saans Trial, sans-serif',
                textAlign: 'center',
                letterSpacing: '8px',
                position: 'relative'
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
              padding: '2rem'
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
                fontFamily: 'Saans Trial, sans-serif',
                textAlign: 'center',
                marginBottom: '1rem'
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
                fontFamily: 'Saans Trial, sans-serif',
                textAlign: 'center',
                maxWidth: '500px',
                lineHeight: '1.6'
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
                fontFamily: 'Saans Trial, sans-serif',
                letterSpacing: '2px'
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

      {/* Font import */}
      <style jsx>{`
        @import url('https://fonts.cdnfonts.com/css/saans-trial');
      `}</style>
    </div>
  );
}

