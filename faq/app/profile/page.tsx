'use client';

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Lenis from '@studio-freight/lenis';

export default function ProfilePage() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const lenisRef = useRef(null);

  useEffect(() => {
    // Check mobile
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Show scroll to top button after scrolling
    lenis.on('scroll', (e) => {
      if (e.animatedScroll > 300) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    });

    return () => {
      window.removeEventListener('resize', checkMobile);
      lenis.destroy();
    };
  }, []);

  const scrollToTop = () => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: false });
    }
  };

  const tableData = [
    { year: "interview 2023", title: "Top Interactive Agencies Interview" },
    { year: "interview 2022", title: "Lovers Magazine Interview" },
    { year: "publication 2020", title: "Centogene Solutions" },
    { year: "talk 2020", title: "Creative collaboration at WeTransfer" },
    { year: "publication 2020", title: "Madeleine Dalla Site of the Month Insight" },
    { year: "talk 2020", title: "Rendering Illusions at Awwwards" },
    { year: "publication 2019", title: "Real-time Multiside Refraction in Three Steps" },
    { year: "publication 2019", title: "Making a connected flip-dot installation" },
    { year: "publication 2019", title: "Bandito Immersive Experience" },
    { year: "publication 2018", title: "Resn’s Little Help AR" },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'black',
      fontFamily: 'NeueHaasGrotesk, "Helvetica Neue", Helvetica, Arial, sans-serif',
      paddingTop: '120px',
      paddingBottom: '80px'
    }}>

      {/* HEADER with Breadcrumb */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        padding: isMobile ? '1.5rem' : '2rem',
        zIndex: 10,
        backgroundColor: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '1100px',
          margin: '0 auto',
          padding: isMobile ? '0 1.5rem' : '0 3rem'
        }}>
          {/* Back button */}
          <motion.div
            onClick={() => router.back()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.8rem',
              cursor: 'pointer',
              width: 'fit-content'
            }}
            whileHover={{ x: -3 }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M17 7L7 17" />
              <path d="M7 7h10v10" />
            </svg>
            <span style={{ color: 'white', fontWeight: 'normal' }}>Back</span>
          </motion.div>

          {/* Breadcrumb: Home > Profile */}
          <motion.div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'white',
              fontSize: isMobile ? '0.9rem' : '1rem'
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.span
              onClick={() => router.push('/')}
              style={{
                cursor: 'pointer',
                color: 'rgba(255,255,255,0.6)',
                fontWeight: 'normal',
                transition: 'color 0.2s ease'
              }}
              whileHover={{ color: 'white' }}
            >
              Home
            </motion.span>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>/</span>
            <span style={{ color: 'white', fontWeight: 'normal' }}>Profile</span>
          </motion.div>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: isMobile ? '0 1.5rem' : '0 3rem'
      }}>

        {/* HERO - Fixed 2 lines, not bold */}
        <motion.div 
          style={{ marginBottom: '4rem' }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 style={{
            color: 'white',
            fontSize: isMobile ? '2.5rem' : '80px',
            lineHeight: 1.1,
            margin: 0,
            whiteSpace: 'nowrap',
            fontWeight: 'normal'
          }}>
            Tell Donate Record With All Your Heart
          </h1>

          <h1 style={{
            color: 'white',
            fontSize: isMobile ? '2.5rem' : '80px',
            lineHeight: 1.1,
            margin: 0,
            whiteSpace: 'nowrap',
            fontWeight: 'normal'
          }}>
            Logic Feelings
          </h1>
        </motion.div>

        {/* DESC */}
        <motion.p 
          style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: isMobile ? '1rem' : '24px',
            maxWidth: '600px',
            marginBottom: '4rem',
            fontWeight: 'normal'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          From concept to code, I work hand-in-hand with developers and designers—juxtaposing the intuitive with the curious to create delightful and engaging experiences for the world wide web
        </motion.p>

        {/* LINE */}
        <div style={{
          height: '1px',
          backgroundColor: 'rgba(255,255,255,0.2)',
          marginBottom: '1rem'
        }} />

        {/* TABLE */}
        <div>
          {tableData.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: isMobile ? '1.5rem 0' : '2rem 0',
                borderBottom: '1px solid rgba(255,255,255,0.2)',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
              whileHover={{
                backgroundColor: 'rgba(255,255,255,0.05)'
              }}
            >
              {/* LEFT */}
              <div style={{
                minWidth: isMobile ? '160px' : '240px'
              }}>
                <span style={{
                  color: 'white',
                  fontSize: isMobile ? '1.1rem' : '1.4rem',
                  fontWeight: '500'
                }}>
                  {item.year}
                </span>
              </div>

              {/* CENTER */}
              <div style={{
                flex: 1,
                padding: '0 2rem'
              }}>
                <span style={{
                  color: 'white',
                  fontSize: isMobile ? '1.3rem' : '1.7rem',
                  fontWeight: 'normal'
                }}>
                  {item.title}
                </span>
              </div>

              {/* RIGHT */}
              <svg
                width={isMobile ? "28" : "34"}
                height={isMobile ? "28" : "34"}
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                style={{ flexShrink: 0 }}
              >
                <path d="M7 17L17 7" />
                <path d="M7 7h10v10" />
              </svg>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Scroll to Top Button */}
      <motion.button
        onClick={scrollToTop}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          backgroundColor: 'white',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: showScrollButton ? 1 : 0,
          scale: showScrollButton ? 1 : 0,
          pointerEvents: showScrollButton ? 'auto' : 'none'
        }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="black" 
          strokeWidth="2.5"
        >
          <path d="M12 19V5M5 12L12 5L19 12" />
        </svg>
      </motion.button>
    </div>
  );
}
