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
      
      {/* Left Navigation - TANPA BG PUTIH, JARAK DEKAT */}
      <div style={{
        width: '250px',
        padding: '3rem 2rem',
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
          fontSize: '2rem',
          fontWeight: '800',
          marginBottom: '2.5rem',
          lineHeight: 1,
          opacity: 0.9
        }}>
          DOCS
        </div>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.2rem', // JARAK SANGAT DEKAT
        }}>
          {navItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              style={{
                fontSize: '1.1rem', // UKURAN SEDANG TIDAK TERLALU BESAR
                fontWeight: activeSection === item.id ? '700' : '400',
                cursor: 'pointer',
                padding: '0.3rem 0', // PADDING KECIL
                opacity: activeSection === item.id ? 1 : 0.6,
                transition: 'all 0.2s ease',
                letterSpacing: '0.5px',
                lineHeight: '1.2',
                // TANPA BACKGROUND COLOR PUTIH
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

      {/* Main Content - JAGA JARAK DARI NAVIGASI */}
      <div style={{
        marginLeft: '250px', // JARAK DARI NAVIGASI
        flex: 1,
        padding: '4rem 5rem 4rem 3rem', // PADDING KIRI LEBIH KECIL
        minHeight: '100vh'
      }}>
        <div ref={contentRef}>
          
          {/* Header dengan judul dan plus sign di sampingnya */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '2rem',
            position: 'relative'
          }}>
            {/* Judul Besar */}
            <div style={{
              fontSize: '5rem',
              fontWeight: '900',
              lineHeight: 1,
              letterSpacing: '-1px',
              marginRight: '2rem' // JARAK DARI PLUS SIGN
            }}>
              {contentData[activeSection as keyof typeof contentData]?.title}
            </div>
            
            {/* Plus Sign HANYA untuk PEMBUKA di samping judul */}
            {activeSection === "pembuka" && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                position: 'relative'
              }}>
                <div 
                  ref={plusRef}
                  onClick={handlePlusClick}
                  style={{
                    fontSize: '3rem',
                    cursor: 'pointer',
                    width: '50px',
                    height: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    marginLeft: '1rem'
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
                
                {/* Dropdown SALAM & TUTUP di samping plus sign */}
                {isPlusOpen && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      position: 'absolute',
                      left: '60px', // POSISI DI SAMPING PLUS SIGN
                      top: '0',
                      display: 'flex',
                      flexDirection: 'column', // VERTIKAL KE BAWAH
                      gap: '0.5rem',
                      backgroundColor: 'rgba(0,0,0,0.9)',
                      padding: '1rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.2)',
                      zIndex: 100
                    }}
                  >
                    <div 
                      style={{
                        fontSize: '1rem',
                        cursor: 'pointer',
                        opacity: 0.8,
                        transition: 'all 0.2s ease',
                        padding: '0.5rem 1rem',
                        whiteSpace: 'nowrap'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '1';
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '0.8';
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      SALAM
                    </div>
                    <div 
                      style={{
                        fontSize: '1rem',
                        cursor: 'pointer',
                        opacity: 0.8,
                        transition: 'all 0.2s ease',
                        padding: '0.5rem 1rem',
                        whiteSpace: 'nowrap'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '1';
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '0.8';
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      TUTUP
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {/* Deskripsi - JELAS DAN JAGA JARAK DARI NAVIGASI */}
          <div style={{
            fontSize: '1.2rem',
            lineHeight: 1.8,
            maxWidth: '800px',
            opacity: 0.95, // LEBIH JELAS
            fontWeight: '300',
            letterSpacing: '0.3px',
            paddingRight: '2rem',
            // JARAK DARI JUDUL
            marginTop: '1rem'
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
