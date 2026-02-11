'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function TimelinePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const timelineSteps = [
    { title: 'Research & Discovery', date: 'Q1 2024', status: 'completed' },
    { title: 'Concept Design', date: 'Q2 2024', status: 'completed' },
    { title: 'Development Phase', date: 'Q3 2024', status: 'current' },
    { title: 'Testing & QA', date: 'Q4 2024', status: 'pending' },
    { title: 'Launch', date: 'Q1 2025', status: 'pending' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < timelineSteps.length - 1 ? prev + 1 : 0));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const TransmitterIcon = () => (
    <motion.div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
        height: '40px'
      }}
      animate={{ 
        scale: [1, 1.2, 1],
        opacity: [0.8, 1, 0.8]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        {/* Lingkaran luar berkedip */}
        <motion.circle
          cx="14"
          cy="14"
          r="12"
          stroke="#ffffff"
          strokeWidth="2"
          fill="none"
          animate={{ strokeOpacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        {/* Lingkaran tengah */}
        <motion.circle
          cx="14"
          cy="14"
          r="8"
          stroke="#ffffff"
          strokeWidth="2"
          fill="none"
          animate={{ strokeOpacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
        />
        {/* Titik tengah */}
        <circle cx="14" cy="14" r="4" fill="#ffffff" />
      </svg>
    </motion.div>
  );

  const SouthEastArrow = () => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#ffffff" strokeWidth="2">
      <path d="M8 8l10 10m0 0V8m0 10H8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000000',
      color: '#ffffff',
      padding: '2rem',
      fontFamily: 'Helvetica, Arial, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* Animated Background Grid */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
        opacity: 0.3
      }} />

      <motion.button
        onClick={() => router.back()}
        style={{
          padding: '1rem 2rem',
          backgroundColor: 'transparent',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '4px',
          color: '#ffffff',
          cursor: 'pointer',
          marginBottom: '3rem',
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '1.1rem'
        }}
        whileHover={{ borderColor: 'rgba(255,255,255,0.3)' }}
        whileTap={{ scale: 0.98 }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5">
          <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back
      </motion.button>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{ position: 'relative', zIndex: 10 }}
      >
        <h1 style={{ 
          fontSize: 'clamp(3rem, 6vw, 5rem)', 
          marginBottom: '0.5rem',
          fontWeight: 300,
          letterSpacing: '-0.02em',
          color: '#ffffff'
        }}>
          Project Timeline
        </h1>
        
        <p style={{ 
          fontSize: '1.2rem', 
          opacity: 0.7,
          marginBottom: '4rem',
          maxWidth: '600px',
          color: '#ffffff'
        }}>
          Development progress visualized through minimalist timeline with real-time status indicators
        </p>

        {/* Main Timeline Container */}
        <div style={{
          position: 'relative',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '2rem 0'
        }}>
          
          {/* Timeline Steps */}
          {timelineSteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ 
                opacity: 1, 
                x: 0,
                transition: { delay: index * 0.1 }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '3.5rem',
                position: 'relative',
                minHeight: '100px'
              }}
            >
              {/* Kolom 1: Angka dengan jarak dari garis */}
              <div style={{
                width: '180px',
                display: 'flex',
                justifyContent: 'flex-end',
                paddingRight: '50px' // Jarak dari garis timeline
              }}>
                <div style={{
                  fontSize: '1.6rem',
                  opacity: 1, // Selalu penuh
                  fontFamily: 'monospace',
                  fontWeight: 500,
                  color: '#ffffff'
                }}>
                  {String(index + 1).padStart(2, '0')}
                </div>
              </div>

              {/* Kolom 2: Garis Vertikal Titik-titik dengan Blinking Dot di Tengah */}
              <div style={{
                position: 'relative',
                width: '40px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100px'
              }}>
                {/* Garis titik-titik vertikal - panjang dari atas ke bawah */}
                <div style={{
                  color: '#ffffff',
                  fontSize: '1rem',
                  letterSpacing: '4px',
                  fontFamily: 'monospace',
                  writingMode: 'vertical-rl',
                  textOrientation: 'mixed',
                  height: '100%',
                  opacity: 0.8,
                  position: 'absolute'
                }}>
                  ....................
                </div>

                {/* Indikator di tengah garis titik-titik */}
                {step.status === 'current' ? (
                  // Blinking dot di tengah titik-titik
                  <div style={{
                    position: 'absolute',
                    zIndex: 2,
                    backgroundColor: '#000000',
                    padding: '5px'
                  }}>
                    <TransmitterIcon />
                  </div>
                ) : step.status === 'completed' ? (
                  // Bulatan putih di tengah titik-titik
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    border: '4px solid #000000',
                    boxShadow: '0 0 15px rgba(255,255,255,0.8)',
                    position: 'absolute',
                    zIndex: 2
                  }} />
                ) : (
                  // Titik-titik untuk pending - SAMA dengan desain completed
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    border: '4px solid #000000',
                    boxShadow: '0 0 15px rgba(255,255,255,0.8)',
                    position: 'absolute',
                    zIndex: 2,
                    opacity: 0.5
                  }} />
                )}
              </div>

              {/* Kolom 3: Garis Horizontal Titik-titik ke Awal Huruf Judul */}
              <div style={{
                width: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  color: '#ffffff',
                  fontSize: '1rem',
                  letterSpacing: '4px',
                  fontFamily: 'monospace',
                  opacity: 0.8
                }}>
                  ........................
                </div>
              </div>

              {/* Kolom 4: Konten Step - TEKS PUTIH TANPA PUDAR */}
              <div style={{
                flex: 1,
                paddingLeft: '1rem'
              }}>
                {/* Baris 1: Judul */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem',
                  marginBottom: '0.75rem'
                }}>
                  <h3 style={{
                    fontSize: '2rem',
                    fontWeight: 400,
                    margin: 0,
                    color: '#ffffff' // Putih penuh, tidak pudar
                  }}>
                    {step.title}
                  </h3>
                  
                  {step.status === 'current' && (
                    <motion.div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1.25rem',
                        backgroundColor: 'rgba(255,255,255,0.15)',
                        borderRadius: '20px',
                        fontSize: '1rem',
                        color: '#ffffff',
                        fontWeight: 500
                      }}
                      animate={{ opacity: [1, 0.7, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <div style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: '#00ff00'
                      }} />
                      TRANSMITTING
                    </motion.div>
                  )}
                </div>
                
                {/* Baris 2: Tanggal dan Status - TEKS PUTIH TANPA PUDAR */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem'
                }}>
                  <span style={{
                    fontSize: '1.3rem',
                    fontFamily: 'monospace',
                    fontWeight: 500,
                    color: '#ffffff', // Putih penuh
                    opacity: 1
                  }}>
                    {step.date}
                  </span>
                  
                  {step.status === 'completed' && (
                    <span style={{ 
                      fontSize: '1.3rem', 
                      color: '#ffffff', // Putih penuh
                      fontWeight: 500,
                      opacity: 1
                    }}>
                      Completed
                    </span>
                  )}
                  
                  {(step.status === 'pending' || step.status === 'current') && (
                    <span style={{ 
                      fontSize: '1.3rem', 
                      color: '#ffffff', // Putih penuh
                      fontWeight: 500,
                      opacity: 1
                    }}>
                      {step.status === 'current' ? 'In Progress' : 'Upcoming'}
                    </span>
                  )}
                </div>
              </div>

              {/* Southeast Arrow hanya untuk step aktif */}
              {step.status === 'current' && (
                <motion.div
                  style={{
                    marginLeft: '2rem',
                    opacity: 1
                  }}
                  animate={{ x: [0, 8, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <SouthEastArrow />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
