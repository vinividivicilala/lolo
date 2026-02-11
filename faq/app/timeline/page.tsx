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
        opacity: [0.7, 1, 0.7]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        {/* Lingkaran luar berkedip */}
        <motion.circle
          cx="12"
          cy="12"
          r="10"
          stroke="#ffffff"
          strokeWidth="1.5"
          fill="none"
          animate={{ strokeOpacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        {/* Lingkaran tengah */}
        <motion.circle
          cx="12"
          cy="12"
          r="6"
          stroke="#ffffff"
          strokeWidth="1.5"
          fill="none"
          animate={{ strokeOpacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
        />
        {/* Titik tengah */}
        <circle cx="12" cy="12" r="3" fill="#ffffff" />
      </svg>
    </motion.div>
  );

  const SouthEastArrow = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.5">
      <path d="M7 7l10 10m0 0V7m0 10H7" strokeLinecap="round" strokeLinejoin="round"/>
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
          padding: '0.75rem 1.5rem',
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
          gap: '0.5rem'
        }}
        whileHover={{ borderColor: 'rgba(255,255,255,0.3)' }}
        whileTap={{ scale: 0.98 }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
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
          fontSize: 'clamp(2.5rem, 5vw, 4rem)', 
          marginBottom: '0.5rem',
          fontWeight: 300,
          letterSpacing: '-0.02em',
          color: '#ffffff'
        }}>
          Project Timeline
        </h1>
        
        <p style={{ 
          fontSize: '1rem', 
          opacity: 0.6,
          marginBottom: '4rem',
          maxWidth: '600px',
          color: '#ffffff'
        }}>
          Development progress visualized through minimalist timeline with real-time status indicators
        </p>

        {/* Main Timeline Container */}
        <div style={{
          position: 'relative',
          maxWidth: '900px',
          margin: '0 auto',
          padding: '2rem 0'
        }}>
          
          {/* Timeline Steps dengan semua penghubung titik-titik PUTIH */}
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
                marginBottom: '3rem',
                position: 'relative',
                minHeight: '80px'
              }}
            >
              {/* Kolom 1: Nomor Step dengan penghubung vertikal titik-titik */}
              <div style={{
                width: '80px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative'
              }}>
                {/* Nomor Step */}
                <div style={{
                  fontSize: '0.875rem',
                  opacity: step.status === 'pending' ? 0.3 : 0.8,
                  fontFamily: 'monospace',
                  marginBottom: '8px',
                  color: '#ffffff'
                }}>
                  {String(index + 1).padStart(2, '0')}
                </div>
                
                {/* Titik-titik vertikal ke bawah - PUTIH */}
                {index < timelineSteps.length - 1 && (
                  <div style={{
                    color: '#ffffff',
                    fontSize: '0.7rem',
                    letterSpacing: '2px',
                    fontFamily: 'monospace',
                    writingMode: 'vertical-rl',
                    textOrientation: 'mixed',
                    height: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0.7
                  }}>
                    ................
                  </div>
                )}
              </div>

              {/* Kolom 2: Garis vertikal utama titik-titik - PUTIH */}
              <div style={{
                width: '40px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative'
              }}>
                {/* Titik-titik vertikal penuh - PUTIH */}
                <div style={{
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  letterSpacing: '2px',
                  fontFamily: 'monospace',
                  writingMode: 'vertical-rl',
                  textOrientation: 'mixed',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0.7
                }}>
                  ................
                </div>
              </div>

              {/* Kolom 3: Indikator Status di tengah garis vertikal */}
              <div style={{
                position: 'absolute',
                left: '120px', // 80px (kolom1) + 40px (kolom2)
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2
              }}>
                {step.status === 'current' ? (
                  // Pemancar berkedip di tengah garis vertikal
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#000000',
                    borderRadius: '50%'
                  }}>
                    <TransmitterIcon />
                  </div>
                ) : step.status === 'completed' ? (
                  // Dot solid di tengah garis vertikal
                  <div style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    border: '3px solid #000000',
                    boxShadow: '0 0 10px rgba(255,255,255,0.5)'
                  }} />
                ) : (
                  // Titik-titik di tengah garis vertikal - PUTIH
                  <div style={{
                    color: '#ffffff',
                    fontSize: '0.8rem',
                    letterSpacing: '2px',
                    fontFamily: 'monospace',
                    backgroundColor: '#000000',
                    padding: '0 5px',
                    opacity: 0.7
                  }}>
                    ......
                  </div>
                )}
              </div>

              {/* Kolom 4: Titik-titik horizontal ke konten - PUTIH */}
              <div style={{
                width: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                paddingTop: '20px'
              }}>
                <div style={{
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  letterSpacing: '2px',
                  fontFamily: 'monospace',
                  opacity: 0.7
                }}>
                  ................
                </div>
              </div>

              {/* Kolom 5: Konten Step */}
              <div style={{
                flex: 1,
                paddingLeft: '0.5rem',
                paddingTop: '20px'
              }}>
                {/* Baris 1: Judul dengan titik-titik di awal - PUTIH */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '0.5rem'
                }}>
                  <div style={{
                    color: '#ffffff',
                    fontSize: '0.7rem',
                    letterSpacing: '2px',
                    fontFamily: 'monospace',
                    opacity: step.status === 'current' ? 0.9 : 0.7
                  }}>
                    ................
                  </div>
                  
                  <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: 400,
                    margin: 0,
                    opacity: step.status === 'pending' ? 0.5 : 1,
                    color: '#ffffff'
                  }}>
                    {step.title}
                  </h3>
                  
                  {step.status === 'current' && (
                    <motion.div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: '0.25rem 0.75rem',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        color: '#ffffff'
                      }}
                      animate={{ opacity: [1, 0.7, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <div style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: '#00ff00'
                      }} />
                      TRANSMITTING
                    </motion.div>
                  )}
                </div>
                
                {/* Baris 2: Garis pemisah dengan titik-titik - PUTIH */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '0.5rem',
                  opacity: 0.7
                }}>
                  <div style={{
                    color: '#ffffff',
                    fontSize: '0.6rem',
                    letterSpacing: '3px',
                    fontFamily: 'monospace',
                    marginRight: '0.5rem'
                  }}>
                    ........................
                  </div>
                </div>
                
                {/* Baris 3: Tanggal dan Status */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  opacity: step.status === 'pending' ? 0.3 : 0.8
                }}>
                  <span style={{
                    fontSize: '0.875rem',
                    fontFamily: 'monospace',
                    opacity: 0.8,
                    color: '#ffffff'
                  }}>
                    {step.date}
                  </span>
                  
                  {/* Titik-titik penghubung - PUTIH */}
                  <div style={{
                    color: '#ffffff',
                    fontSize: '0.7rem',
                    letterSpacing: '2px',
                    fontFamily: 'monospace',
                    opacity: step.status === 'current' ? 0.9 : 0.7
                  }}>
                    ................
                  </div>
                  
                  {step.status === 'completed' && (
                    <span style={{ fontSize: '0.875rem', color: '#ffffff' }}>Completed</span>
                  )}
                  
                  {step.status === 'pending' && (
                    <span style={{ fontSize: '0.875rem', opacity: 0.5, color: '#ffffff' }}>Upcoming</span>
                  )}
                </div>
              </div>

              {/* Southeast Arrow hanya untuk step aktif */}
              {step.status === 'current' && (
                <motion.div
                  style={{
                    marginLeft: '1rem',
                    marginTop: '20px',
                    opacity: 0.8
                  }}
                  animate={{ x: [0, 5, 0] }}
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
