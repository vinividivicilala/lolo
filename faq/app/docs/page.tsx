'use client';

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function DocsPage() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [activeSection, setActiveSection] = useState("pembuka");
  
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
      content: "Selamat datang di dokumentasi MENURU. Platform ini dirancang untuk memberikan pengalaman optimal dalam membaca, menulis, dan mengeksplorasi konten digital."
    },
    salam: {
      title: "Salam",
      number: "02",
      content: "Halo! Kami senang Anda memilih MENURU sebagai platform digital Anda. Kami berkomitmen memberikan pengalaman terbaik."
    },
    tujuan: {
      title: "Tujuan",
      number: "03",
      content: "Menyediakan lingkungan yang aman, efisien, dan menyenangkan untuk berinteraksi dengan konten digital."
    },
    penggunaan: {
      title: "Penggunaan",
      number: "04",
      content: "Panduan lengkap tentang cara menggunakan platform MENURU secara efektif dan maksimal."
    },
    batasan: {
      title: "Batasan",
      number: "05",
      content: "Informasi mengenai batasan teknis dan kebijakan penggunaan platform."
    },
    keamanan: {
      title: "Keamanan",
      number: "06",
      content: "Kebijakan dan praktik keamanan yang kami terapkan untuk melindungi data Anda."
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
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* Header */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        padding: '2rem',
        zIndex: 100,
        backgroundColor: 'rgba(0,0,0,0.9)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{
          fontSize: '1.5rem',
          fontWeight: '600'
        }}>
          MENURU
        </div>
        
        <div 
          onClick={() => router.push('/')}
          style={{
            fontSize: '1rem',
            fontWeight: '400',
            cursor: 'pointer',
            opacity: 0.7,
            transition: 'opacity 0.3s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
        >
          HOME
        </div>
      </div>

      {/* Main Layout */}
      <div style={{
        display: 'flex',
        width: '100%',
        height: '100vh',
        paddingTop: '6rem'
      }}>
        
        {/* Left Navigation */}
        <div style={{
          width: isMobile ? '100px' : '250px',
          padding: '2rem',
          borderRight: '1px solid rgba(255,255,255,0.1)',
          overflowY: 'auto',
          height: 'calc(100vh - 6rem)'
        }}>
          {navSections.map((section) => (
            <div key={section.id} style={{ marginBottom: '2rem' }}>
              <div style={{
                fontSize: isMobile ? '0.8rem' : '0.9rem',
                fontWeight: '600',
                marginBottom: '1rem',
                opacity: 0.5,
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                {section.title}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {section.items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    style={{
                      fontSize: isMobile ? '0.9rem' : '1rem',
                      padding: '0.5rem',
                      cursor: 'pointer',
                      backgroundColor: activeSection === item.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                      borderRadius: '4px',
                      transition: 'background-color 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      if (activeSection !== item.id) {
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeSection !== item.id) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    {item.number} {isMobile ? '' : `- ${item.title}`}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Middle Content */}
        <div style={{
          flex: 1,
          padding: isMobile ? '1.5rem' : '3rem',
          overflowY: 'auto',
          height: 'calc(100vh - 6rem)'
        }}>
          <motion.div
            key={activeSection}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{
              maxWidth: '800px',
              margin: '0 auto'
            }}
          >
            {/* Section Number */}
            <div style={{
              fontSize: isMobile ? '4rem' : '6rem',
              fontWeight: '800',
              lineHeight: 1,
              marginBottom: '1rem',
              opacity: 0.2
            }}>
              {contentData[activeSection as keyof typeof contentData]?.number}
            </div>

            {/* Section Title */}
            <h1 style={{
              fontSize: isMobile ? '2.5rem' : '4rem',
              fontWeight: '600',
              margin: '0 0 2rem 0',
              lineHeight: 1.2
            }}>
              {contentData[activeSection as keyof typeof contentData]?.title}
            </h1>

            {/* Section Content */}
            <div style={{
              fontSize: isMobile ? '1rem' : '1.2rem',
              lineHeight: 1.6,
              marginBottom: '2rem'
            }}>
              {contentData[activeSection as keyof typeof contentData]?.content}
            </div>

            {/* Additional Content */}
            <div style={{
              marginTop: '3rem',
              padding: '2rem',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px'
            }}>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                marginBottom: '1rem'
              }}>
                Informasi Tambahan
              </div>
              
              <div style={{
                fontSize: '1rem',
                lineHeight: 1.6,
                opacity: 0.8
              }}>
                Dokumentasi ini akan terus diperbarui sesuai dengan perkembangan platform. 
                Pastikan untuk selalu memeriksa pembaruan terbaru untuk informasi yang akurat.
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Space - Kosong */}
        <div style={{
          width: isMobile ? '0' : '200px',
          borderLeft: '1px solid rgba(255,255,255,0.1)'
        }} />
      </div>
    </div>
  );
}
