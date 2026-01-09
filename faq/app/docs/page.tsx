'use client';

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("pembuka");
  const [isMobile, setIsMobile] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  
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
    // GSAP animation for content entrance
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
      );
    }

    // GSAP animation for plus sign
    const plusSigns = document.querySelectorAll('.plus-sign');
    plusSigns.forEach((sign) => {
      gsap.to(sign, {
        rotation: 360,
        duration: 2,
        repeat: -1,
        ease: "none"
      });
    });

  }, [activeSection]);

  // Data navigasi - TANPA ANGKA, JARAK SANGAT DEKAT
  const navItems = [
    { id: "pembuka", title: "PEMBUKA" },
    { id: "salam", title: "SALAM" },
    { id: "tujuan", title: "TUJUAN" },
    { id: "penggunaan", title: "PENGGUNAAN" },
    { id: "batasan", title: "BATASAN" },
    { id: "keamanan", title: "KEAMANAN" },
    { id: "arsitektur", title: "ARSITEKTUR" },
    { id: "prinsip", title: "PRINSIP" },
    { id: "komponen", title: "KOMPONEN" },
    { id: "instalasi", title: "INSTALASI" }
  ];

  // Data konten dengan 2 sub isi
  const contentData = {
    pembuka: {
      title: "PEMBUKA",
      content: "Selamat datang di dokumentasi platform MENURU. Platform ini dirancang untuk memberikan pengalaman optimal dalam membaca, menulis, dan mengeksplorasi berbagai jenis konten digital.",
      sub1: "Dokumentasi ini mencakup semua aspek penggunaan platform dari tingkat dasar hingga lanjutan.",
      sub2: "Setiap section menyediakan informasi spesifik yang diperlukan untuk memahami dan memaksimalkan penggunaan fitur yang tersedia."
    },
    salam: {
      title: "SALAM",
      content: "Kami mengucapkan terima kasih telah memilih MENURU sebagai platform digital Anda. Komitmen kami adalah memberikan pengalaman terbaik dengan antarmuka yang intuitif dan fitur yang powerful.",
      sub1: "Platform terus dikembangkan dengan memperhatikan feedback dari pengguna.",
      sub2: "Update rutin dilakukan untuk meningkatkan performa dan menambahkan fitur baru."
    },
    tujuan: {
      title: "TUJUAN",
      content: "Platform memiliki tujuan utama untuk menciptakan lingkungan digital yang aman, efisien, dan menyenangkan bagi semua pengguna dari berbagai latar belakang.",
      sub1: "Menyediakan akses yang mudah ke berbagai jenis konten digital.",
      sub2: "Memberikan alat yang powerful untuk membuat dan mengelola konten."
    },
    penggunaan: {
      title: "PENGGUNAAN",
      content: "Platform dapat digunakan untuk berbagai keperluan mulai dari konsumsi konten hingga produksi konten dengan alat-alat yang tersedia.",
      sub1: "Antarmuka yang sederhana memudahkan navigasi dan penggunaan.",
      sub2: "Dokumentasi lengkap tersedia untuk setiap fitur yang ada."
    },
    batasan: {
      title: "BATASAN",
      content: "Seperti platform lainnya, terdapat batasan teknis tertentu yang perlu dipahami untuk penggunaan yang optimal.",
      sub1: "Batasan kapasitas penyimpanan berdasarkan paket yang dipilih.",
      sub2: "Batasan jumlah pengguna dan fitur yang tersedia."
    },
    keamanan: {
      title: "KEAMANAN",
      content: "Keamanan data dan privasi pengguna adalah prioritas utama dalam pengembangan platform ini.",
      sub1: "Semua data dienkripsi menggunakan protokol keamanan terbaru.",
      sub2: "Sistem monitoring aktif untuk mendeteksi dan mencegah ancaman keamanan."
    },
    arsitektur: {
      title: "ARSITEKTUR",
      content: "Platform dibangun dengan arsitektur modern yang scalable dan reliable untuk menangani berbagai beban kerja.",
      sub1: "Menggunakan teknologi terbaru untuk performa optimal.",
      sub2: "Struktur yang modular memudahkan pengembangan dan pemeliharaan."
    },
    prinsip: {
      title: "PRINSIP",
      content: "Platform mengikuti prinsip-prinsip desain yang berfokus pada pengalaman pengguna dan aksesibilitas.",
      sub1: "Desain minimalis untuk mengurangi kebingungan pengguna.",
      sub2: "Aksesibilitas untuk semua kalangan dengan berbagai kemampuan."
    },
    komponen: {
      title: "KOMPONEN",
      content: "Terdapat beberapa komponen utama yang bekerja sama untuk memberikan pengalaman yang seamless.",
      sub1: "Sistem autentikasi dan manajemen pengguna.",
      sub2: "Sistem manajemen konten dan alat kolaborasi."
    },
    instalasi: {
      title: "INSTALASI",
      content: "Proses instalasi didesain untuk sederhana dan cepat tanpa memerlukan keahlian teknis khusus.",
      sub1: "Dukungan untuk berbagai lingkungan dan sistem operasi.",
      sub2: "Dokumentasi instalasi lengkap dengan troubleshooting."
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
      
      {/* Left Navigation - JARAK SANGAT DEKAT, TANPA ANGKA */}
      <div ref={navRef} style={{
        width: isMobile ? '120px' : '300px',
        padding: isMobile ? '1rem' : '2rem',
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        overflowY: 'auto',
        backgroundColor: 'black',
        zIndex: 10
      }}>
        <div style={{
          fontSize: isMobile ? '1.5rem' : '2rem',
          fontWeight: '800',
          marginBottom: isMobile ? '1rem' : '1.5rem',
          lineHeight: 1,
          opacity: 0.9
        }}>
          DOCS
        </div>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: isMobile ? '0.1rem' : '0.15rem' // JARAK SANGAT DEKAT
        }}>
          {navItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              style={{
                fontSize: isMobile ? '0.8rem' : '1.1rem',
                fontWeight: activeSection === item.id ? '700' : '400',
                cursor: 'pointer',
                padding: isMobile ? '0.15rem 0' : '0.2rem 0',
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
        marginLeft: isMobile ? '120px' : '300px',
        flex: 1,
        padding: isMobile ? '1.5rem' : '3rem',
        minHeight: '100vh'
      }}>
        <div ref={contentRef}>
          {/* Judul Besar */}
          <div style={{
            fontSize: isMobile ? '4rem' : '6rem',
            fontWeight: '900',
            lineHeight: 0.9,
            marginBottom: isMobile ? '1.5rem' : '2rem',
            letterSpacing: '-1px'
          }}>
            {contentData[activeSection as keyof typeof contentData]?.title}
          </div>

          {/* Plus Sign Animation */}
          <div style={{
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div 
              className="plus-sign"
              style={{
                fontSize: '2rem',
                opacity: 0.8,
                display: 'inline-block'
              }}
            >
              +
            </div>
            <div style={{
              fontSize: '0.9rem',
              opacity: 0.6,
              letterSpacing: '1px'
            }}>
              MENURU DOCUMENTATION
            </div>
          </div>

          {/* Konten Utama */}
          <div style={{
            fontSize: isMobile ? '1rem' : '1.2rem',
            lineHeight: 1.7,
            maxWidth: '900px',
            marginBottom: '3rem',
            opacity: 0.9
          }}>
            {contentData[activeSection as keyof typeof contentData]?.content}
          </div>

          {/* 2 Sub Isi */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            maxWidth: '900px',
            marginTop: '2rem'
          }}>
            <div style={{
              fontSize: isMobile ? '0.95rem' : '1.1rem',
              lineHeight: 1.6,
              opacity: 0.8,
              paddingLeft: '1rem',
              borderLeft: '2px solid rgba(255,255,255,0.3)'
            }}>
              {contentData[activeSection as keyof typeof contentData]?.sub1}
            </div>
            
            <div style={{
              fontSize: isMobile ? '0.95rem' : '1.1rem',
              lineHeight: 1.6,
              opacity: 0.8,
              paddingLeft: '1rem',
              borderLeft: '2px solid rgba(255,255,255,0.3)'
            }}>
              {contentData[activeSection as keyof typeof contentData]?.sub2}
            </div>
          </div>

          {/* Footer Minimal */}
          <div style={{
            fontSize: isMobile ? '0.8rem' : '0.9rem',
            opacity: 0.4,
            marginTop: '4rem',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(255,255,255,0.1)'
          }}>
            MENURU • 2024
          </div>
        </div>
      </div>
    </div>
  );
}
