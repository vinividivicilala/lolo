'use client';

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("pembuka");
  const [isMobile, setIsMobile] = useState(false);
  const [isPlusOpen, setIsPlusOpen] = useState(false);
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

  // Handle plus sign click
  const handlePlusClick = () => {
    setIsPlusOpen(!isPlusOpen);
    
    if (plusRef.current) {
      if (!isPlusOpen) {
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
      
      {/* Left Navigation */}
      <div style={{
        width: isMobile ? '120px' : '280px',
        padding: isMobile ? '1rem' : '2.5rem',
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        backgroundColor: 'black',
        zIndex: 10,
        borderRight: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{
          fontSize: isMobile ? '1.3rem' : '1.8rem',
          fontWeight: '800',
          marginBottom: isMobile ? '1rem' : '2rem',
          lineHeight: 1,
          opacity: 0.9
        }}>
          DOCS
        </div>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: isMobile ? '0.1rem' : '0.2rem'
        }}>
          {navItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              style={{
                fontSize: isMobile ? '0.85rem' : '1.1rem',
                fontWeight: activeSection === item.id ? '700' : '400',
                cursor: 'pointer',
                padding: isMobile ? '0.25rem 0' : '0.4rem 0',
                opacity: activeSection === item.id ? 1 : 0.6,
                transition: 'all 0.2s ease',
                letterSpacing: '0.5px',
                lineHeight: '1.2'
              }}
              onMouseEnter={(e) => {
                if (activeSection !== item.id) {
                  e.currentTarget.style.opacity = '0.9';
                }
              }}
              onMouseLeave={(e) => {
                if (activeSection !== item.id) {
                  e.currentTarget.style.opacity = '0.6';
                }
              }}
            >
              {item.title}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        marginLeft: isMobile ? '120px' : '280px',
        flex: 1,
        padding: isMobile ? '2rem 1.5rem' : '4rem 3.5rem',
        minHeight: '100vh'
      }}>
        <div ref={contentRef}>
          
          {/* Plus Sign Section */}
          <div style={{
            marginBottom: '3rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem'
          }}>
            <div 
              ref={plusRef}
              onClick={handlePlusClick}
              style={{
                fontSize: '2.5rem',
                cursor: 'pointer',
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              +
            </div>
            
            {/* Sub Judul yang muncul ketika plus diklik */}
            {isPlusOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  display: 'flex',
                  gap: '2rem'
                }}
              >
                <div 
                  style={{
                    fontSize: '1rem',
                    cursor: 'pointer',
                    opacity: 0.8,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '0.8';
                  }}
                >
                  SALAM
                </div>
                <div 
                  style={{
                    fontSize: '1rem',
                    cursor: 'pointer',
                    opacity: 0.8,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '0.8';
                  }}
                >
                  TUTUP
                </div>
              </motion.div>
            )}
          </div>

          {/* Judul Besar */}
          <div style={{
            fontSize: isMobile ? '3.5rem' : '5rem',
            fontWeight: '900',
            lineHeight: 1,
            marginBottom: isMobile ? '1.5rem' : '2rem',
            letterSpacing: '-1px'
          }}>
            {contentData[activeSection as keyof typeof contentData]?.title}
          </div>

          {/* Deskripsi - Kelihatan Jelas */}
          <div style={{
            fontSize: isMobile ? '1rem' : '1.3rem',
            lineHeight: 1.7,
            maxWidth: '800px',
            opacity: 0.9,
            marginBottom: '3rem'
          }}>
            {contentData[activeSection as keyof typeof contentData]?.description}
          </div>

          {/* Additional Content */}
          <div style={{
            marginTop: '4rem',
            paddingTop: '2rem',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            maxWidth: '800px'
          }}>
            <div style={{
              fontSize: '0.9rem',
              opacity: 0.5,
              letterSpacing: '0.5px'
            }}>
              Dokumentasi Terakhir Diperbarui: Desember 2024
            </div>
            <div style={{
              fontSize: '0.9rem',
              opacity: 0.5,
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
