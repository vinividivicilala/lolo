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
      justifyContent: 'flex-end', // Mengubah menjadi flex-end agar konten di bawah
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

      {/* Card Design - Posisi Paling Bawah Menempel */}
      <motion.div
        style={{
          width: isMobile ? '100%' : '90%',
          maxWidth: isMobile ? '100%' : '1900px',
          height: 'auto',
          backgroundColor: '#CCFF00',
          borderRadius: isMobile ? '30px 30px 0 0' : '40px',
          padding: isMobile ? '2rem 1.5rem 3rem' : '3rem',
          display: 'flex',
          alignItems: 'left',
          gap: isMobile ? '1.5rem' : '3rem',
          cursor: 'pointer',
          margin: 0,
          boxShadow: '0 -10px 40px rgba(204, 255, 0, 0.3)',
          flexDirection: 'column',
          boxSizing: 'border-box'
        }}
        initial={{ opacity: 0, y: 100 }}
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
          display: 'flex',
          width: '100%',
          gap: isMobile ? '1.5rem' : '3rem',
          flexDirection: isMobile ? 'column' : 'row'
        }}>
          {/* Left Section - MENURU */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? '1rem' : '1.5rem'
          }}>
            <h3 style={{
              color: 'black',
              fontSize: isMobile ? '3rem' : '10rem',
              fontWeight: isMobile ? '800' : '2800',
              fontFamily: 'Verdana, Geneva, sans-serif',
              margin: 0,
              lineHeight: 1.1,
              letterSpacing: isMobile ? '-0.5px' : '-1px'
            }}>
              MENURU{isMobile ? '' : <br/>}
            </h3>

            {/* Daftar Website Pribadi Section - Responsive */}
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
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? '0.8rem' : '1.5rem',
                    padding: isMobile ? '0.6rem 0' : '0.8rem 0',
                    borderBottom: '1px solid rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    flexWrap: isMobile ? 'wrap' : 'nowrap'
                  }}
                  whileHover={{ 
                    x: isMobile ? 0 : 10,
                    transition: { duration: 0.2 }
                  }}
                >
                  <span style={{
                    color: 'black',
                    fontSize: isMobile ? '1rem' : '3rem',
                    fontFamily: 'Verdana, Geneva, sans-serif',
                    minWidth: isMobile ? '25px' : '30px'
                  }}>
                    01
                  </span>
                  
                  <span style={{
                    color: 'black',
                    fontSize: isMobile ? '1.2rem' : '3rem',
                    fontWeight: '500',
                    fontFamily: 'Verdana, Geneva, sans-serif',
                    flex: 1
                  }}>
                    Portfolio
                  </span>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? '0.4rem' : '0.8rem',
                    color: 'black',
                    fontSize: isMobile ? '0.9rem' : '3rem',
                    fontFamily: 'Verdana, Geneva, sans-serif'
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
                    stroke="black"
                    strokeWidth="2"
                    whileHover={{ x: isMobile ? 0 : 3 }}
                    transition={{ duration: 0.2 }}
                  >
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </motion.svg>
                </motion.div>

                {/* Photography */}
                <motion.div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? '0.8rem' : '1.5rem',
                    padding: isMobile ? '0.6rem 0' : '0.8rem 0',
                    borderBottom: '1px solid rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    flexWrap: isMobile ? 'wrap' : 'nowrap'
                  }}
                  whileHover={{ 
                    x: isMobile ? 0 : 10,
                    transition: { duration: 0.2 }
                  }}
                >
                  <span style={{
                    color: 'black',
                    fontSize: isMobile ? '1rem' : '3rem',
                    fontFamily: 'Verdana, Geneva, sans-serif',
                    minWidth: isMobile ? '25px' : '30px'
                  }}>
                    02
                  </span>
                  
                  <span style={{
                    color: 'black',
                    fontSize: isMobile ? '1.2rem' : '3rem',
                    fontWeight: '500',
                    fontFamily: 'Verdana, Geneva, sans-serif',
                    flex: 1
                  }}>
                    Photography
                  </span>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? '0.4rem' : '0.8rem',
                    color: 'black',
                    fontSize: isMobile ? '0.9rem' : '3rem',
                    fontFamily: 'Verdana, Geneva, sans-serif'
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
                    stroke="black"
                    strokeWidth="2"
                    whileHover={{ x: isMobile ? 0 : 3 }}
                    transition={{ duration: 0.2 }}
                  >
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </motion.svg>
                </motion.div>

                {/* Forum */}
                <motion.div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? '0.8rem' : '1.5rem',
                    padding: isMobile ? '0.6rem 0' : '0.8rem 0',
                    borderBottom: '1px solid rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    flexWrap: isMobile ? 'wrap' : 'nowrap'
                  }}
                  whileHover={{ 
                    x: isMobile ? 0 : 10,
                    transition: { duration: 0.2 }
                  }}
                >
                  <span style={{
                    color: 'black',
                    fontSize: isMobile ? '1rem' : '3rem',
                    fontFamily: 'Verdana, Geneva, sans-serif',
                    minWidth: isMobile ? '25px' : '30px'
                  }}>
                    03
                  </span>
                  
                  <span style={{
                    color: 'black',
                    fontSize: isMobile ? '1.2rem' : '3rem',
                    fontWeight: '500',
                    fontFamily: 'Verdana, Geneva, sans-serif',
                    flex: 1
                  }}>
                    Forum
                  </span>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: isMobile ? '0.4rem' : '0.8rem',
                    color: 'black',
                    fontSize: isMobile ? '0.9rem' : '3rem',
                    fontFamily: 'Verdana, Geneva, sans-serif'
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
                    stroke="black"
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

          {/* Right Section - LETS COLLABORATE */}
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
              color: 'black',
              fontSize: isMobile ? '2rem' : '5rem',
              fontWeight: '800',
              fontFamily: 'Verdana, Geneva, sans-serif',
              margin: 0,
              lineHeight: 1.1,
              letterSpacing: isMobile ? '-0.5px' : '-1px'
            }}>
              LETS
              <br />
              COLLABORATE
            </h3>
            
            <a href="/book-call" style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '0.8rem' : '1.5rem',
              cursor: 'pointer',
              textDecoration: 'none',
              color: 'black',
              padding: '0.5rem 0'
            }}>
              <span style={{
                fontSize: isMobile ? '1rem' : '1.5rem',
                fontWeight: '600',
                fontFamily: 'Verdana, Geneva, sans-serif'
              }}>
                BOOK A CALL
              </span>
              
              <svg 
                width={isMobile ? "18" : "24"} 
                height={isMobile ? "18" : "24"} 
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
            </a>

            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: 'center',
              gap: isMobile ? '0.8rem' : '2rem',
              marginTop: isMobile ? '0.5rem' : '1rem'
            }}>
              <a href="/terms" style={{
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? '0.3rem' : '0.5rem',
                textDecoration: 'none',
                color: 'rgba(0,0,0,0.7)',
                fontSize: isMobile ? '0.9rem' : '3rem',
                fontFamily: 'Verdana, Geneva, sans-serif',
                transition: 'color 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'black'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(0,0,0,0.7)'}>
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
              
              <a href="/privacy" style={{
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? '0.3rem' : '0.5rem',
                textDecoration: 'none',
                color: 'rgba(0,0,0,0.7)',
                fontSize: isMobile ? '0.9rem' : '3rem',
                fontFamily: 'Verdana, Geneva, sans-serif',
                transition: 'color 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'black'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(0,0,0,0.7)'}>
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
