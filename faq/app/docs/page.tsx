'use client';

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function DocsPage() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [cursorType, setCursorType] = useState("default");
  const [cursorText, setCursorText] = useState("");
  const [hoveredLink, setHoveredLink] = useState("");
  const [activeSection, setActiveSection] = useState("pembuka");
  const [expandedSections, setExpandedSections] = useState({
    pendahuluan: true,
    note: false,
    konsep: false,
    implementasi: false,
    referensi: false
  });
  const cursorRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

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

    // GSAP animation for content
    if (contentRef.current) {
      gsap.from(contentRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        delay: 0.3,
        ease: "power3.out"
      });
    }

    return () => {
      window.removeEventListener('resize', checkMobile);
      document.removeEventListener('mousemove', moveCursor);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

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

  // Toggle expand section
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  };

  // Navigasi item
  const navItems = [
    {
      id: "pendahuluan",
      title: "PENDAHULUAN",
      subsections: [
        { id: "pembuka", title: "Pembuka" },
        { id: "salam", title: "Salam" },
        { id: "tujuan", title: "Tujuan" }
      ]
    },
    {
      id: "note",
      title: "CATATAN PENTING",
      subsections: [
        { id: "penggunaan", title: "Penggunaan" },
        { id: "batasan", title: "Batasan" },
        { id: "keamanan", title: "Keamanan" }
      ]
    },
    {
      id: "konsep",
      title: "KONSEP DASAR",
      subsections: [
        { id: "arsitektur", title: "Arsitektur" },
        { id: "prinsip", title: "Prinsip Desain" },
        { id: "komponen", title: "Komponen Utama" }
      ]
    },
    {
      id: "implementasi",
      title: "IMPLEMENTASI",
      subsections: [
        { id: "instalasi", title: "Instalasi" },
        { id: "konfigurasi", title: "Konfigurasi" },
        { id: "deploy", title: "Deployment" }
      ]
    },
    {
      id: "referensi",
      title: "REFERENSI",
      subsections: [
        { id: "api", title: "API Reference" },
        { id: "contoh", title: "Contoh Kode" },
        { id: "troubleshoot", title: "Troubleshooting" }
      ]
    }
  ];

  // Konten untuk setiap section
  const contentData = {
    pembuka: {
      title: "Pembuka",
      description: "Selamat datang di dokumentasi MENURU. Platform ini dirancang untuk memberikan pengalaman yang optimal dalam membaca, menulis, dan mengeksplorasi konten digital.",
      content: "Dokumentasi ini akan memandu Anda melalui semua fitur dan kemampuan yang tersedia dalam platform MENURU. Kami berkomitmen untuk memberikan pengalaman pengguna yang seamless dan intuitif."
    },
    salam: {
      title: "Salam",
      description: "Halo! Kami sangat senang Anda memilih MENURU sebagai platform untuk kebutuhan digital Anda.",
      content: "Kami percaya bahwa setiap orang berhak mendapatkan akses ke alat yang powerful dan mudah digunakan. Dengan MENURU, kami berusaha untuk mendemokratisasi akses ke teknologi canggih."
    },
    tujuan: {
      title: "Tujuan",
      description: "Tujuan utama dari platform MENURU adalah menyediakan lingkungan yang aman, efisien, dan menyenangkan untuk berinteraksi dengan konten digital.",
      content: "Platform ini dibangun dengan beberapa tujuan utama: 1) Aksesibilitas, 2) Keamanan, 3) Performa tinggi, 4) User experience yang optimal."
    },
    penggunaan: {
      title: "Penggunaan Platform",
      description: "Panduan lengkap tentang cara menggunakan platform MENURU secara efektif.",
      content: "Platform ini dirancang untuk intuitif. Namun, untuk memaksimalkan pengalaman, pastikan untuk membaca panduan ini dengan seksama."
    },
    batasan: {
      title: "Batasan Penggunaan",
      description: "Informasi mengenai batasan teknis dan kebijakan penggunaan platform.",
      content: "Setiap platform memiliki batasan teknis. Kami terus bekerja untuk meningkatkan kapasitas dan kemampuan platform."
    },
    keamanan: {
      title: "Keamanan Data",
      description: "Kebijakan dan praktik keamanan yang kami terapkan untuk melindungi data Anda.",
      content: "Keamanan adalah prioritas utama. Semua data dienkripsi end-to-end dan kami mengikuti praktik terbaik industri."
    }
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

  // Toggle color mode
  const toggleColorMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: isDarkMode ? '#0a0a0a' : '#f8f9fa',
      margin: 0,
      padding: 0,
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
      cursor: 'none'
    }}>

      {/* Custom Cursor */}
      <div
        ref={cursorRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: cursorType === "link" ? '120px' : '20px',
          height: cursorType === "link" ? '50px' : '20px',
          backgroundColor: cursorColors.dotColor,
          borderRadius: cursorType === "link" ? '25px' : '50%',
          pointerEvents: 'none',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: '600',
          color: cursorColors.textColor,
          textAlign: 'center',
          transition: 'all 0.2s ease',
          transform: 'translate(-50%, -50%)',
          padding: cursorType === "link" ? '0 15px' : '0',
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
        }}
      >
        {cursorType === "link" && cursorText}
      </div>

      {/* Top Navigation Bar */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        padding: isMobile ? '1rem' : '1.5rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 100,
        backgroundColor: isDarkMode ? 'rgba(10, 10, 10, 0.9)' : 'rgba(248, 249, 250, 0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <motion.div
            onClick={() => router.push('/')}
            onMouseEnter={() => handleLinkHover("link", "HOME", "home")}
            onMouseLeave={handleLinkLeave}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              backgroundColor: isDarkMode ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.1)',
              transition: 'all 0.3s ease'
            }}
            whileHover={{ 
              backgroundColor: isDarkMode ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.2)'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isDarkMode ? '#6366F1' : '#6366F1'} strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span style={{
              color: isDarkMode ? '#6366F1' : '#6366F1',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}>
              Home
            </span>
          </motion.div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <motion.button
            onClick={toggleColorMode}
            onMouseEnter={() => handleLinkHover("link", "THEME", "theme")}
            onMouseLeave={handleLinkLeave}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: 'black',
              backgroundColor: '#CCFF00',
              border: 'none',
              borderRadius: '8px',
              cursor: 'none',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isDarkMode ? '☀️ LIGHT' : '🌙 DARK'}
          </motion.button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        display: 'flex',
        flex: 1,
        paddingTop: isMobile ? '4rem' : '5rem',
        height: 'calc(100vh - 5rem)',
        overflow: 'hidden'
      }}>
        {/* Sidebar Navigation */}
        <div style={{
          width: isMobile ? '100%' : '300px',
          height: '100%',
          backgroundColor: isDarkMode ? '#111111' : '#ffffff',
          borderRight: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
          padding: isMobile ? '1rem' : '2rem',
          overflowY: 'auto',
          display: isMobile ? 'none' : 'block'
        }}>
          <h3 style={{
            color: isDarkMode ? '#CCFF00' : '#000',
            fontSize: '1rem',
            fontWeight: '700',
            marginBottom: '2rem',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            DAFTAR ISI
          </h3>

          {/* Vertical Line */}
          <div style={{
            position: 'absolute',
            left: '50px',
            top: '120px',
            bottom: '2rem',
            width: '1px',
            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            zIndex: 1
          }} />

          {navItems.map((section, index) => (
            <div key={section.id} style={{ position: 'relative', marginBottom: '1.5rem' }}>
              {/* Section Title with Toggle */}
              <motion.div
                onClick={() => toggleSection(section.id)}
                onMouseEnter={() => handleLinkHover("link", "TOGGLE", section.id)}
                onMouseLeave={handleLinkLeave}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  cursor: 'none',
                  marginBottom: '1rem',
                  position: 'relative',
                  zIndex: 2
                }}
                whileHover={{ x: 5 }}
              >
                {/* Dot on vertical line */}
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: expandedSections[section.id as keyof typeof expandedSections] 
                    ? '#CCFF00' 
                    : (isDarkMode ? '#444' : '#ccc'),
                  border: `2px solid ${isDarkMode ? '#222' : '#fff'}`,
                  position: 'relative',
                  zIndex: 2
                }} />
                
                <span style={{
                  color: expandedSections[section.id as keyof typeof expandedSections]
                    ? '#CCFF00'
                    : (isDarkMode ? '#888' : '#666'),
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  flex: 1
                }}>
                  {section.title}
                </span>

                <motion.div
                  animate={{ rotate: expandedSections[section.id as keyof typeof expandedSections] ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" 
                    stroke={expandedSections[section.id as keyof typeof expandedSections] ? '#CCFF00' : (isDarkMode ? '#888' : '#666')} 
                    strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </motion.div>
              </motion.div>

              {/* Subsections */}
              <AnimatePresence>
                {expandedSections[section.id as keyof typeof expandedSections] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ overflow: 'hidden' }}
                  >
                    {section.subsections.map((subsection, subIndex) => (
                      <motion.div
                        key={subsection.id}
                        onClick={() => setActiveSection(subsection.id)}
                        onMouseEnter={() => handleLinkHover("link", "VIEW", subsection.id)}
                        onMouseLeave={handleLinkLeave}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          cursor: 'none',
                          padding: '0.75rem 0 0.75rem 2rem',
                          marginLeft: '0.5rem',
                          borderLeft: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                          position: 'relative',
                          backgroundColor: activeSection === subsection.id 
                            ? (isDarkMode ? 'rgba(204, 255, 0, 0.1)' : 'rgba(204, 255, 0, 0.1)')
                            : 'transparent'
                        }}
                        whileHover={{ 
                          backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                          paddingLeft: '2.5rem'
                        }}
                      >
                        {/* Sub-dot */}
                        <div style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: activeSection === subsection.id 
                            ? '#CCFF00' 
                            : (isDarkMode ? '#666' : '#999'),
                          position: 'absolute',
                          left: '-3px'
                        }} />
                        
                        <span style={{
                          color: activeSection === subsection.id
                            ? '#CCFF00'
                            : (isDarkMode ? '#aaa' : '#555'),
                          fontSize: '0.9rem',
                          fontWeight: activeSection === subsection.id ? '600' : '400',
                          flex: 1
                        }}>
                          {subsection.title}
                        </span>

                        {activeSection === subsection.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: '#CCFF00'
                            }} />
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Main Content Area */}
        <div ref={contentRef} style={{
          flex: 1,
          height: '100%',
          overflowY: 'auto',
          padding: isMobile ? '1.5rem' : '3rem',
          backgroundColor: isDarkMode ? '#0a0a0a' : '#f8f9fa'
        }}>
          {/* Breadcrumb */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '2rem',
            color: isDarkMode ? '#888' : '#666',
            fontSize: '0.9rem'
          }}>
            <span>Home</span>
            <span>/</span>
            <span>Docs</span>
            <span>/</span>
            <span style={{ color: isDarkMode ? '#CCFF00' : '#000', fontWeight: '600' }}>
              {contentData[activeSection as keyof typeof contentData]?.title || 'Documentation'}
            </span>
          </div>

          {/* Content */}
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 style={{
              color: isDarkMode ? '#fff' : '#000',
              fontSize: isMobile ? '2.5rem' : '3.5rem',
              fontWeight: '800',
              marginBottom: '1rem',
              lineHeight: 1.2
            }}>
              {contentData[activeSection as keyof typeof contentData]?.title}
            </h1>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                width: '60px',
                height: '1px',
                backgroundColor: '#CCFF00'
              }} />
              <span style={{
                color: '#CCFF00',
                fontSize: '0.9rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Section
              </span>
            </div>

            <p style={{
              color: isDarkMode ? '#ccc' : '#555',
              fontSize: '1.1rem',
              lineHeight: 1.6,
              marginBottom: '2rem',
              maxWidth: '800px'
            }}>
              {contentData[activeSection as keyof typeof contentData]?.description}
            </p>

            <div style={{
              backgroundColor: isDarkMode ? '#111' : '#fff',
              borderRadius: '12px',
              padding: '2rem',
              border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              marginBottom: '2rem'
            }}>
              <h3 style={{
                color: isDarkMode ? '#fff' : '#000',
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '1rem'
              }}>
                Detail
              </h3>
              
              <p style={{
                color: isDarkMode ? '#aaa' : '#666',
                lineHeight: 1.7
              }}>
                {contentData[activeSection as keyof typeof contentData]?.content}
              </p>
            </div>

            {/* Navigation Buttons */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '3rem',
              paddingTop: '2rem',
              borderTop: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
            }}>
              <motion.button
                onMouseEnter={() => handleLinkHover("link", "PREV", "prev")}
                onMouseLeave={handleLinkLeave}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                  border: 'none',
                  borderRadius: '8px',
                  color: isDarkMode ? '#fff' : '#000',
                  cursor: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}
                whileHover={{ 
                  backgroundColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" 
                  stroke={isDarkMode ? '#fff' : '#000'} strokeWidth="2"
                >
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                Previous
              </motion.button>

              <motion.button
                onMouseEnter={() => handleLinkHover("link", "NEXT", "next")}
                onMouseLeave={handleLinkLeave}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#CCFF00',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#000',
                  cursor: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}
                whileHover={{ 
                  backgroundColor: '#D4FF33',
                  scale: 1.05
                }}
              >
                Next
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" 
                  stroke="#000" strokeWidth="2"
                >
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Mobile Sidebar Toggle */}
        {isMobile && (
          <motion.button
            onClick={() => {/* Add mobile sidebar toggle logic */}}
            style={{
              position: 'fixed',
              bottom: '2rem',
              right: '2rem',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#CCFF00',
              border: 'none',
              cursor: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 90,
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </motion.button>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: isMobile ? '1.5rem' : '2rem',
        backgroundColor: isDarkMode ? '#111' : '#fff',
        borderTop: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        textAlign: 'center'
      }}>
        <p style={{
          color: isDarkMode ? '#888' : '#666',
          fontSize: '0.9rem',
          margin: 0
        }}>
          © 2024 MENURU Documentation. All rights reserved.
        </p>
      </div>
    </div>
  );
}
