'use client';

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("pembuka");
  const [isMobile, setIsMobile] = useState(false);
  
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

  // Data navigasi - JUDUL BESAR, JARAK DEKAT
  const navItems = [
    { id: "pembuka", title: "PEMBUKA", number: "01" },
    { id: "salam", title: "SALAM", number: "02" },
    { id: "tujuan", title: "TUJUAN", number: "03" },
    { id: "penggunaan", title: "PENGGUNAAN", number: "04" },
    { id: "batasan", title: "BATASAN", number: "05" },
    { id: "keamanan", title: "KEAMANAN", number: "06" },
    { id: "arsitektur", title: "ARSITEKTUR", number: "07" },
    { id: "prinsip", title: "PRINSIP", number: "08" },
    { id: "komponen", title: "KOMPONEN", number: "09" },
    { id: "instalasi", title: "INSTALASI", number: "10" }
  ];

  // Data konten
  const contentData = {
    pembuka: {
      title: "PEMBUKA",
      content: "Dokumentasi MENURU menyediakan panduan lengkap untuk memahami dan menggunakan platform. Platform ini dirancang untuk memberikan pengalaman optimal dalam membaca, menulis, dan mengeksplorasi konten digital."
    },
    salam: {
      title: "SALAM",
      content: "Selamat datang di dokumentasi MENURU. Kami berkomitmen untuk memberikan pengalaman terbaik dan mendukung kebutuhan digital Anda dengan solusi yang efektif dan efisien."
    },
    tujuan: {
      title: "TUJUAN",
      content: "Tujuan utama platform adalah menyediakan lingkungan yang aman, efisien, dan menyenangkan untuk berinteraksi dengan berbagai jenis konten digital."
    },
    penggunaan: {
      title: "PENGGUNAAN",
      content: "Platform dapat digunakan untuk berbagai keperluan mulai dari membaca konten, menulis dokumen, hingga mengeksplorasi informasi dengan antarmuka yang intuitif."
    },
    batasan: {
      title: "BATASAN",
      content: "Setiap platform memiliki batasan teknis tertentu. Batasan ini mencakup kapasitas penyimpanan, jumlah pengguna, dan fitur tertentu yang mungkin tersedia berdasarkan paket yang dipilih."
    },
    keamanan: {
      title: "KEAMANAN",
      content: "Keamanan data pengguna adalah prioritas utama. Semua data dienkripsi dan dilindungi dengan protokol keamanan terbaru untuk memastikan privasi dan keamanan informasi."
    },
    arsitektur: {
      title: "ARSITEKTUR",
      content: "Arsitektur platform dibangun dengan teknologi modern yang scalable dan reliable. Sistem dirancang untuk menangani berbagai jenis beban kerja dengan performa optimal."
    },
    prinsip: {
      title: "PRINSIP",
      content: "Platform mengikuti prinsip-prinsip desain yang berfokus pada pengalaman pengguna, aksesibilitas, dan kemudahan penggunaan untuk semua kalangan."
    },
    komponen: {
      title: "KOMPONEN",
      content: "Terdapat beberapa komponen utama dalam platform termasuk sistem autentikasi, manajemen konten, alat kolaborasi, dan sistem analitik untuk tracking penggunaan."
    },
    instalasi: {
      title: "INSTALASI",
      content: "Proses instalasi sederhana dan dapat dilakukan dalam beberapa langkah mudah. Platform mendukung berbagai lingkungan deployment sesuai dengan kebutuhan pengguna."
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
      color: 'white'
    }}>
      
      {/* Left Navigation - GESER KANAN LAGI, FONT BESAR */}
      <div style={{
        width: isMobile ? '150px' : '350px',
        padding: isMobile ? '1.5rem 1rem' : '3rem 2rem',
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        overflowY: 'auto',
        backgroundColor: 'rgba(0,0,0,0.95)',
        borderRight: '1px solid rgba(255,255,255,0.1)',
        zIndex: 10
      }}>
        <div style={{
          fontSize: isMobile ? '2rem' : '3rem',
          fontWeight: '800',
          marginBottom: isMobile ? '1.5rem' : '2rem',
          lineHeight: 1
        }}>
          DOCS
        </div>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: isMobile ? '0.3rem' : '0.5rem' // JARAK DEKAT ANTAR ITEM
        }}>
          {navItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              style={{
                fontSize: isMobile ? '0.9rem' : '1.2rem',
                fontWeight: activeSection === item.id ? '700' : '400',
                cursor: 'pointer',
                padding: isMobile ? '0.3rem 0' : '0.4rem 0',
                opacity: activeSection === item.id ? 1 : 0.6,
                transition: 'all 0.3s ease',
                letterSpacing: '0.5px'
              }}
              onMouseEnter={(e) => {
                if (activeSection !== item.id) {
                  e.currentTarget.style.opacity = '0.8';
                  e.currentTarget.style.transform = 'translateX(5px)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeSection !== item.id) {
                  e.currentTarget.style.opacity = '0.6';
                  e.currentTarget.style.transform = 'translateX(0)';
                }
              }}
            >
              {item.number} {item.title}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content - GESER KE TENGAH KANAN */}
      <div style={{
        marginLeft: isMobile ? '150px' : '350px',
        flex: 1,
        padding: isMobile ? '2rem 1.5rem' : '4rem 3rem',
        minHeight: '100vh'
      }}>
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Judul Besar */}
          <div style={{
            fontSize: isMobile ? '5rem' : '8rem',
            fontWeight: '900',
            lineHeight: 0.9,
            marginBottom: isMobile ? '2rem' : '3rem',
            letterSpacing: '-2px'
          }}>
            {contentData[activeSection as keyof typeof contentData]?.title}
          </div>

          {/* Konten - TANPA LINEBOX, TANPA JUDUL TAMBAHAN */}
          <div style={{
            fontSize: isMobile ? '1.1rem' : '1.4rem',
            lineHeight: 1.6,
            maxWidth: '800px',
            opacity: 0.9,
            marginBottom: '3rem'
          }}>
            {contentData[activeSection as keyof typeof contentData]?.content}
          </div>

          {/* Additional Info - SANGAT SIMPLE */}
          <div style={{
            fontSize: isMobile ? '0.9rem' : '1rem',
            opacity: 0.5,
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: '1rem',
            marginTop: '2rem'
          }}>
            Dokumentasi MENURU • Versi 1.0.0
          </div>
        </motion.div>
      </div>
    </div>
  );
}
