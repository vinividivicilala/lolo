'use client';

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("pembuka");
  const [isMobile, setIsMobile] = useState(false);
  const [isPlusOpen, setIsPlusOpen] = useState(false);
  const [showSalamTutup, setShowSalamTutup] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const plusRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    // GSAP animation for content
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" }
      );
    }
  }, [activeSection]);

  // Handle plus sign click - khusus untuk section "pembuka"
  const handlePlusClick = () => {
    if (activeSection === "pembuka") {
      const newState = !isPlusOpen;
      setIsPlusOpen(newState);
      setShowSalamTutup(newState);
      
      if (plusRef.current) {
        if (newState) {
          // Rotate to X
          gsap.to(plusRef.current, {
            rotation: 45,
            duration: 0.3,
            ease: "power2.out"
          });
        } else {
          // Rotate back to +
          gsap.to(plusRef.current, {
            rotation: 0,
            duration: 0.3,
            ease: "power2.out"
          });
        }
      }
    }
  };

  // Data navigasi
  const navItems = [
    { id: "pembuka", title: "PEMBUKA" },
    { id: "arsitektur", title: "ARSITEKTUR" },
    { id: "instalasi", title: "INSTALASI" },
    { id: "penggunaan", title: "PENGGUNAAN" },
    { id: "keamanan", title: "KEAMANAN" },
    { id: "troubleshoot", title: "TROUBLESHOOT" }
  ];

  // Data konten
  const contentData = {
    pembuka: {
      title: "PEMBUKA",
      description: "Selamat datang di dokumentasi platform MENURU. Platform ini dirancang untuk memberikan pengalaman optimal dalam membaca, menulis, dan mengeksplorasi berbagai jenis konten digital dengan antarmuka yang intuitif dan performa yang handal."
    },
    arsitektur: {
      title: "ARSITEKTUR",
      description: "Platform MENURU dibangun dengan arsitektur modern yang scalable dan reliable. Menggunakan teknologi terbaru untuk memastikan performa optimal dan keamanan data pengguna dalam berbagai skenario penggunaan."
    },
    instalasi: {
      title: "INSTALASI",
      description: "Proses instalasi platform dirancang sederhana dan cepat. Panduan lengkap tersedia untuk berbagai lingkungan deployment dengan opsi konfigurasi yang fleksibel sesuai kebutuhan pengguna."
    },
    penggunaan: {
      title: "PENGGUNAAN",
      description: "Platform menyediakan berbagai fitur untuk kebutuhan digital sehari-hari. Antarmuka yang intuitif memudahkan navigasi dan penggunaan tanpa memerlukan pelatihan khusus."
    },
    keamanan: {
      title: "KEAMANAN",
      description: "Keamanan data dan privasi pengguna adalah prioritas utama. Platform menerapkan enkripsi end-to-end dan protokol keamanan terkini untuk melindungi semua informasi yang disimpan."
    },
    troubleshoot: {
      title: "TROUBLESHOOT",
      description: "Dokumentasi ini menyediakan solusi untuk masalah umum yang mungkin dihadapi pengguna. Setiap solusi dijelaskan dengan langkah-langkah yang jelas dan mudah diikuti."
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
      color: 'white',
      cursor: 'default'
    }}>
      
      {/* Left Navigation - Font lebih besar */}
      <div style={{
        width: isMobile ? '150px' : '320px', // Lebih lebar
        padding: isMobile ? '1.5rem' : '3rem', // Padding lebih besar
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        backgroundColor: 'black',
        zIndex: 10,
        borderRight: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          fontSize: isMobile ? '1.5rem' : '2.2rem', // Lebih besar
          fontWeight: '800',
          marginBottom: isMobile ? '1.5rem' : '2.5rem', // Margin lebih besar
          lineHeight: 1,
          opacity: 0.9
        }}>
          DOCS
        </div>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: isMobile ? '0.5rem' : '0.8rem', // Gap lebih besar
          flex: 1
        }}>
          {navItems.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                setActiveSection(item.id);
                if (item.id !== "pembuka") {
                  setIsPlusOpen(false);
                  setShowSalamTutup(false);
                }
              }}
              style={{
                fontSize: isMobile ? '1.1rem' : '1.4rem', // Font lebih besar
                fontWeight: activeSection === item.id ? '800' : '500', // Font weight lebih tebal
                cursor: 'pointer',
                padding: isMobile ? '0.5rem 0' : '0.8rem 0.5rem', // Padding lebih besar
                opacity: activeSection === item.id ? 1 : 0.7,
                transition: 'all 0.3s ease',
                letterSpacing: '1px', // Letter spacing lebih lebar
                lineHeight: '1.3',
                borderRadius: '4px',
                backgroundColor: activeSection === item.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                borderLeft: activeSection === item.id ? '3px solid white' : '3px solid transparent'
              }}
              onMouseEnter={(e) => {
                if (activeSection !== item.id) {
                  e.currentTarget.style.opacity = '0.9';
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeSection !== item.id) {
                  e.currentTarget.style.opacity = '0.7';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {item.title}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content - Bergeser lebih ke kanan */}
      <div style={{
        marginLeft: isMobile ? '150px' : '320px', // Margin lebih besar ke kanan
        flex: 1,
        padding: isMobile ? '2rem 2rem' : '4rem 5rem', // Padding kanan lebih besar
        minHeight: '100vh',
        paddingLeft: isMobile ? '2.5rem' : '4rem' // Padding kiri lebih besar
      }}>
        <div ref={contentRef}>
          
          {/* Plus Sign Section - hanya muncul di section "pembuka" */}
          {activeSection === "pembuka" && (
            <div style={{
              marginBottom: '3rem',
              display: 'flex',
              alignItems: 'flex-start', // Align items ke atas
              gap: '1.5rem',
              flexDirection: 'column' // Mengatur layout vertikal
            }}>
              <div 
                ref={plusRef}
                onClick={handlePlusClick}
                style={{
                  fontSize: '3rem', // Lebih besar
                  cursor: 'pointer',
                  width: '60px',
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '50%'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.8';
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                }}
              >
                +
              </div>
              
              {/* Salam dan Tutup muncul ke bawah */}
              {showSalamTutup && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column', // Vertikal ke bawah
                    gap: '1.5rem',
                    marginTop: '1rem',
                    paddingLeft: '0.5rem'
                  }}
                >
                  <div 
                    style={{
                      fontSize: '1.4rem',
                      cursor: 'pointer',
                      opacity: 0.9,
                      transition: 'all 0.3s ease',
                      padding: '0.8rem 1.5rem',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      borderRadius: '6px',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '1';
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                      e.currentTarget.style.transform = 'translateX(10px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '0.9';
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    SALAM
                  </div>
                  <div 
                    style={{
                      fontSize: '1.4rem',
                      cursor: 'pointer',
                      opacity: 0.9,
                      transition: 'all 0.3s ease',
                      padding: '0.8rem 1.5rem',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      borderRadius: '6px',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '1';
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                      e.currentTarget.style.transform = 'translateX(10px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '0.9';
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    TUTUP
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* Judul Besar */}
          <div style={{
            fontSize: isMobile ? '3.5rem' : '5rem',
            fontWeight: '900',
            lineHeight: 1,
            marginBottom: isMobile ? '2rem' : '2.5rem',
            letterSpacing: '-1px',
            marginLeft: isMobile ? '0' : '1rem' // Geser sedikit ke kanan
          }}>
            {contentData[activeSection as keyof typeof contentData]?.title}
          </div>

          {/* Deskripsi - Kelihatan Jelas dan lebih ke kanan */}
          <div style={{
            fontSize: isMobile ? '1.2rem' : '1.5rem', // Font lebih besar
            lineHeight: 1.8, // Line height lebih longgar
            maxWidth: '900px', // Lebar maksimal lebih besar
            opacity: 0.95, // Opacity lebih jelas
            marginBottom: '3rem',
            marginLeft: isMobile ? '0' : '1.5rem', // Geser ke kanan
            fontWeight: '300', // Font weight lebih ringan untuk kontras
            letterSpacing: '0.3px', // Letter spacing lebih baik
            paddingRight: isMobile ? '0' : '2rem' // Padding kanan lebih besar
          }}>
            {contentData[activeSection as keyof typeof contentData]?.description}
          </div>

          {/* Additional Content */}
          <div style={{
            marginTop: '5rem',
            paddingTop: '2.5rem',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            maxWidth: '800px',
            marginLeft: isMobile ? '0' : '1.5rem' // Geser ke kanan
          }}>
            <div style={{
              fontSize: '1rem',
              opacity: 0.6,
              letterSpacing: '0.5px'
            }}>
              Dokumentasi Terakhir Diperbarui: Desember 2024
            </div>
            <div style={{
              fontSize: '1rem',
              opacity: 0.6,
              marginTop: '0.5rem',
              letterSpacing: '0.5px'
            }}>
              Versi Platform: 1.0.0
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
