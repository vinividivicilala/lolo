'use client';

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function DocsPage() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [activeSection, setActiveSection] = useState("pembuka");
  const [cursorType, setCursorType] = useState("default");
  const [cursorText, setCursorText] = useState("");
  const cursorRef = useRef<HTMLDivElement>(null);
  const isDarkMode = true; // Selalu dark mode

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Custom cursor animation
    const moveCursor = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
      }
    };

    document.addEventListener('mousemove', moveCursor);

    return () => {
      window.removeEventListener('resize', checkMobile);
      document.removeEventListener('mousemove', moveCursor);
    };
  }, []);

  // Handler untuk cursor hover
  const handleLinkHover = (type: string, text: string = "") => {
    setCursorType(type);
    setCursorText(text);
  };

  const handleLinkLeave = () => {
    setCursorType("default");
    setCursorText("");
  };

  // Data navigasi
  const navSections = [
    {
      id: "pendahuluan",
      title: "PENDAHULUAN",
      items: [
        { id: "pembuka", title: "Pembuka", number: "01" },
        { id: "salam", title: "Salam", number: "02" },
        { id: "tujuan", title: "Tujuan", number: "03" }
      ]
    },
    {
      id: "note",
      title: "CATATAN",
      items: [
        { id: "penggunaan", title: "Penggunaan", number: "04" },
        { id: "batasan", title: "Batasan", number: "05" },
        { id: "keamanan", title: "Keamanan", number: "06" }
      ]
    },
    {
      id: "konsep",
      title: "KONSEP",
      items: [
        { id: "arsitektur", title: "Arsitektur", number: "07" },
        { id: "prinsip", title: "Prinsip", number: "08" },
        { id: "komponen", title: "Komponen", number: "09" }
      ]
    },
    {
      id: "implementasi",
      title: "IMPLEMENTASI",
      items: [
        { id: "instalasi", title: "Instalasi", number: "10" },
        { id: "konfigurasi", title: "Konfigurasi", number: "11" },
        { id: "deploy", title: "Deployment", number: "12" }
      ]
    }
  ];

  // Data konten
  const contentData = {
    pembuka: {
      title: "Pembuka",
      number: "01",
      description: "Selamat datang di dokumentasi MENURU. Platform ini dirancang untuk memberikan pengalaman optimal dalam membaca, menulis, dan mengeksplorasi konten digital."
    },
    salam: {
      title: "Salam",
      number: "02",
      description: "Halo! Kami senang Anda memilih MENURU sebagai platform digital Anda. Kami berkomitmen memberikan pengalaman terbaik."
    },
    tujuan: {
      title: "Tujuan",
      number: "03",
      description: "Menyediakan lingkungan yang aman, efisien, dan menyenangkan untuk berinteraksi dengan konten digital."
    },
    penggunaan: {
      title: "Penggunaan",
      number: "04",
      description: "Panduan lengkap tentang cara menggunakan platform MENURU secara efektif dan maksimal."
    },
    batasan: {
      title: "Batasan",
      number: "05",
      description: "Informasi mengenai batasan teknis dan kebijakan penggunaan platform."
    },
    keamanan: {
      title: "Keamanan",
      number: "06",
      description: "Kebijakan dan praktik keamanan yang kami terapkan untuk melindungi data Anda."
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'black',
      margin: 0,
      padding: 0,
      width: '100%',
      display: 'flex',
      fontFamily: 'Helvetica, Arial, sans-serif',
      cursor: 'none',
      position: 'relative'
    }}>

      {/* Custom Cursor */}
      <div
        ref={cursorRef}
        style={{
          position: 'fixed',
          width: cursorType === "link" ? '100px' : '20px',
          height: cursorType === "link" ? '40px' : '20px',
          backgroundColor: cursorType === "link" ? '#6366F1' : '#EC4899',
          borderRadius: cursorType === "link" ? '20px' : '50%',
          pointerEvents: 'none',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: '600',
          color: 'white',
          transform: 'translate(-50%, -50%)',
          transition: 'all 0.2s ease'
        }}
      >
        {cursorType === "link" && cursorText}
      </div>

      {/* Header */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        padding: '1.5rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 100,
        backgroundColor: 'rgba(0,0,0,0.9)',
        backdropFilter: 'blur(10px)'
      }}>
        {/* Home Button */}
        <motion.div
          onClick={() => router.push('/')}
          onMouseEnter={() => handleLinkHover("link", "HOME")}
          onMouseLeave={handleLinkLeave}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'none'
          }}
          whileHover={{ x: 5 }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#CCFF00" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <span style={{
            color: '#CCFF00',
            fontSize: '1rem',
            fontWeight: '600'
          }}>
            HOME
          </span>
        </motion.div>

        {/* Docs Title */}
        <h1 style={{
          color: 'white',
          fontSize: '1.5rem',
          fontWeight: '600',
          margin: 0
        }}>
          DOCS
        </h1>

        {/* Sign In */}
        <motion.div
          onClick={() => router.push('/signin')}
          onMouseEnter={() => handleLinkHover("link", "SIGN IN")}
          onMouseLeave={handleLinkLeave}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'none',
            padding: '0.5rem 1rem',
            backgroundColor: '#CCFF00',
            borderRadius: '25px'
          }}
          whileHover={{ scale: 1.05 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span style={{
            color: 'black',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}>
            SIGN IN
          </span>
        </motion.div>
      </div>

      {/* Main Content */}
      <div style={{
        display: 'flex',
        width: '100%',
        height: '100vh',
        paddingTop: '5rem'
      }}>
        {/* Left Space - Kosong */}
        <div style={{
          flex: 1,
          backgroundColor: 'black'
        }} />

        {/* Middle Content - BESAR */}
        <div style={{
          flex: 3,
          padding: '2rem',
          overflowY: 'auto',
          height: 'calc(100vh - 5rem)'
        }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              style={{
                maxWidth: '800px',
                margin: '0 auto'
              }}
            >
              {/* Content Number */}
              <div style={{
                color: '#CCFF00',
                fontSize: '5rem',
                fontWeight: '800',
                fontFamily: 'Verdana, sans-serif',
                lineHeight: 1,
                marginBottom: '1rem'
              }}>
                {contentData[activeSection as keyof typeof contentData]?.number}
              </div>

              {/* Content Title */}
              <h1 style={{
                color: 'white',
                fontSize: '3rem',
                fontWeight: '700',
                margin: '0 0 2rem 0',
                lineHeight: 1.2
              }}>
                {contentData[activeSection as keyof typeof contentData]?.title}
              </h1>

              {/* Content Description */}
              <p style={{
                color: 'rgba(255,255,255,0.8)',
                fontSize: '1.2rem',
                lineHeight: 1.6,
                marginBottom: '3rem'
              }}>
                {contentData[activeSection as keyof typeof contentData]?.description}
              </p>

              {/* Content Details */}
              <div style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: '10px',
                padding: '2rem',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <h3 style={{
                  color: '#CCFF00',
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  marginBottom: '1rem'
                }}>
                  Detail Informasi
                </h3>
                
                <p style={{
                  color: 'rgba(255,255,255,0.7)',
                  lineHeight: 1.7,
                  fontSize: '1.1rem'
                }}>
                  Dokumentasi ini menyediakan panduan lengkap untuk menggunakan platform MENURU. 
                  Setiap section akan menjelaskan aspek tertentu dari platform dengan detail yang 
                  diperlukan untuk pengguna pemula maupun berpengalaman.
                </p>

                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  marginTop: '2rem',
                  flexWrap: 'wrap'
                }}>
                  <div style={{
                    padding: '1rem',
                    backgroundColor: 'rgba(204, 255, 0, 0.1)',
                    borderRadius: '8px',
                    flex: 1,
                    minWidth: '200px'
                  }}>
                    <div style={{
                      color: '#CCFF00',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      marginBottom: '0.5rem'
                    }}>
                      VERSI
                    </div>
                    <div style={{
                      color: 'white',
                      fontSize: '1.2rem',
                      fontWeight: '600'
                    }}>
                      1.0.0
                    </div>
                  </div>

                  <div style={{
                    padding: '1rem',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    borderRadius: '8px',
                    flex: 1,
                    minWidth: '200px'
                  }}>
                    <div style={{
                      color: '#6366F1',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      marginBottom: '0.5rem'
                    }}>
                      UPDATE
                    </div>
                    <div style={{
                      color: 'white',
                      fontSize: '1.2rem',
                      fontWeight: '600'
                    }}>
                      Dec 2024
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Navigation */}
        <div style={{
          flex: 1,
          padding: '2rem',
          backgroundColor: 'rgba(0,0,0,0.8)',
          borderLeft: '1px solid rgba(255,255,255,0.1)',
          height: 'calc(100vh - 5rem)',
          overflowY: 'auto'
        }}>
          <div style={{
            position: 'sticky',
            top: '2rem'
          }}>
            <h3 style={{
              color: '#CCFF00',
              fontSize: '1rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              marginBottom: '2rem'
            }}>
              NAVIGASI
            </h3>

            {navSections.map((section) => (
              <div key={section.id} style={{ marginBottom: '2rem' }}>
                <div style={{
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '0.5rem'
                }}>
                  {section.title}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  {section.items.map((item) => (
                    <motion.div
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      onMouseEnter={() => handleLinkHover("link", "VIEW")}
                      onMouseLeave={handleLinkLeave}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '0.8rem',
                        cursor: 'none',
                        borderRadius: '8px',
                        backgroundColor: activeSection === item.id 
                          ? 'rgba(204, 255, 0, 0.2)' 
                          : 'transparent',
                        border: activeSection === item.id 
                          ? '1px solid #CCFF00' 
                          : '1px solid transparent'
                      }}
                      whileHover={{ 
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)'
                      }}
                    >
                      <div style={{
                        color: activeSection === item.id ? '#CCFF00' : 'rgba(255,255,255,0.5)',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        fontFamily: 'Verdana, sans-serif',
                        minWidth: '30px'
                      }}>
                        {item.number}
                      </div>
                      
                      <div style={{
                        color: activeSection === item.id ? 'white' : 'rgba(255,255,255,0.7)',
                        fontSize: '1rem',
                        fontWeight: activeSection === item.id ? '600' : '400',
                        flex: 1
                      }}>
                        {item.title}
                      </div>

                      {activeSection === item.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" 
                            stroke="#CCFF00" strokeWidth="2"
                          >
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                          </svg>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}

            {/* Quick Links */}
            <div style={{ marginTop: '3rem' }}>
              <h3 style={{
                color: '#CCFF00',
                fontSize: '0.9rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                marginBottom: '1rem'
              }}>
                LINK CEPAT
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {['Chatbot', 'Update', 'Timeline'].map((item) => (
                  <motion.div
                    key={item}
                    onClick={() => router.push(`/${item.toLowerCase()}`)}
                    onMouseEnter={() => handleLinkHover("link", "VIEW")}
                    onMouseLeave={handleLinkLeave}
                    style={{
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: '0.9rem',
                      padding: '0.5rem',
                      cursor: 'none',
                      borderRadius: '4px'
                    }}
                    whileHover={{ 
                      color: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }}
                  >
                    → {item}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
