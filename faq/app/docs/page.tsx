'use client';

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("pembuka");
  const [isMobile, setIsMobile] = useState(false);
  const [showPembukaDropdown, setShowPembukaDropdown] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowPembukaDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Data navigasi dengan dropdown untuk pembuka
  const navItems = [
    { 
      id: "pembuka", 
      title: "PEMBUKA",
      hasDropdown: true,
      dropdownItems: ["SALAM", "TUTUP"]
    },
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
        width: '240px',
        padding: '3rem 1.5rem',
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
          fontSize: '1.8rem',
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
          gap: '0.4rem',
        }}>
          {navItems.map((item) => (
            <div 
              key={item.id}
              style={{ position: 'relative' }}
            >
              <div
                onClick={() => {
                  setActiveSection(item.id);
                  if (item.id !== "pembuka") {
                    setShowPembukaDropdown(false);
                  }
                }}
                style={{
                  fontSize: '1rem',
                  fontWeight: activeSection === item.id ? '700' : '400',
                  cursor: 'pointer',
                  padding: '0.4rem 0.5rem',
                  opacity: activeSection === item.id ? 1 : 0.6,
                  transition: 'all 0.2s ease',
                  letterSpacing: '0.5px',
                  lineHeight: '1.2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
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
                <span>{item.title}</span>
                {item.hasDropdown && (
                  <span 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPembukaDropdown(!showPembukaDropdown);
                    }}
                    style={{
                      fontSize: '1.2rem',
                      cursor: 'pointer',
                      opacity: 0.7,
                      transition: 'all 0.3s ease',
                      transform: showPembukaDropdown ? 'rotate(45deg)' : 'rotate(0deg)',
                      marginLeft: '0.5rem'
                    }}
                  >
                    +
                  </span>
                )}
              </div>
              
              {/* Dropdown Minimalist untuk Pembuka */}
              {item.id === "pembuka" && showPembukaDropdown && (
                <motion.div
                  ref={dropdownRef}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    position: 'absolute',
                    left: '100%',
                    top: 0,
                    backgroundColor: 'rgba(20, 20, 20, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '4px',
                    padding: '0.5rem 0',
                    minWidth: '120px',
                    zIndex: 100
                  }}
                >
                  {item.dropdownItems?.map((dropdownItem, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        // Handle dropdown item click
                        console.log(`${dropdownItem} clicked`);
                        setShowPembukaDropdown(false);
                      }}
                      style={{
                        padding: '0.6rem 1rem',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        opacity: 0.8,
                        transition: 'all 0.2s ease',
                        whiteSpace: 'nowrap'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '1';
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '0.8';
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      {dropdownItem}
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content - DIGESER LEBIH KE KANAN */}
      <div style={{
        marginLeft: '240px', // Jarak dari navigasi
        flex: 1,
        padding: '4rem 3rem 4rem 6rem', // Padding kiri lebih besar untuk geser ke kanan
        minHeight: '100vh',
        marginRight: '2rem' // Tambahan margin kanan
      }}>
        <div ref={contentRef} style={{ maxWidth: '800px' }}>
          
          {/* Judul Besar */}
          <div style={{
            fontSize: '4.5rem',
            fontWeight: '900',
            lineHeight: 1,
            letterSpacing: '-1px',
            marginBottom: '2rem',
            paddingLeft: '1rem' // Tambahan padding untuk geser lebih ke kanan
          }}>
            {contentData[activeSection as keyof typeof contentData]?.title}
          </div>

          {/* Deskripsi - JELAS DAN DI GESER KE KANAN */}
          <div style={{
            fontSize: '1.15rem',
            lineHeight: 1.7,
            opacity: 0.9,
            fontWeight: '300',
            letterSpacing: '0.2px',
            paddingLeft: '1rem', // Geser ke kanan
            paddingRight: '2rem'
          }}>
            {contentData[activeSection as keyof typeof contentData]?.description}
          </div>

          {/* Additional Content */}
          <div style={{
            marginTop: '4rem',
            paddingTop: '2rem',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            maxWidth: '800px',
            paddingLeft: '1rem' // Geser ke kanan
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
