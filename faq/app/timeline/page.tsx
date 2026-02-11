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
        width: '50px',
        height: '50px'
      }}
      animate={{ 
        scale: [1, 1.3, 1],
        opacity: [0.8, 1, 0.8]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        {/* Lingkaran luar berkedip */}
        <motion.circle
          cx="16"
          cy="16"
          r="14"
          stroke="#ffffff"
          strokeWidth="2"
          fill="none"
          animate={{ strokeOpacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        {/* Lingkaran tengah */}
        <motion.circle
          cx="16"
          cy="16"
          r="9"
          stroke="#ffffff"
          strokeWidth="2"
          fill="none"
          animate={{ strokeOpacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
        />
        {/* Titik tengah */}
        <circle cx="16" cy="16" r="5" fill="#ffffff" />
      </svg>
    </motion.div>
  );

  const SouthEastArrow = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#ffffff" strokeWidth="2">
      <path d="M10 10l12 12m0 0V10m0 12H10" strokeLinecap="round" strokeLinejoin="round"/>
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
          maxWidth: '1000px',
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
                marginBottom: '3rem',
                position: 'relative',
                minHeight: '100px'
              }}
            >
              {/* Kolom 1: Nomor Step TANPA titik */}
              <div style={{
                width: '100px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                position: 'relative',
                paddingRight: '2rem'
              }}>
                {/* Nomor Step */}
                <div style={{
                  fontSize: '1.5rem',
                  opacity: step.status === 'pending' ? 0.4 : 1,
                  fontFamily: 'monospace',
                  fontWeight: 500,
                  color: '#ffffff'
                }}>
                  {String(index + 1).padStart(2, '0')}
                </div>
              </div>

              {/* Kolom 2: Garis vertikal utama titik-titik */}
              <div style={{
                width: '60px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative'
              }}>
                {/* Titik-titik vertikal penuh */}
                <div style={{
                  color: '#ffffff',
                  fontSize: '1.2rem',
                  letterSpacing: '3px',
                  fontFamily: 'monospace',
                  writingMode: 'vertical-rl',
                  textOrientation: 'mixed',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0.8
                }}>
                  ................
                </div>
              </div>

              {/* Kolom 3: Indikator Status di tengah garis vertikal */}
              <div style={{
                position: 'absolute',
                left: '160px', // 100px (kolom1) + 60px (kolom2)
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
                    width: '60px',
                    height: '60px',
                    backgroundColor: '#000000',
                    borderRadius: '50%'
                  }}>
                    <TransmitterIcon />
                  </div>
                ) : step.status === 'completed' ? (
                  // Dot solid di tengah garis vertikal
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    border: '4px solid #000000',
                    boxShadow: '0 0 15px rgba(255,255,255,0.7)'
                  }} />
                ) : (
                  // Titik-titik di tengah garis vertikal untuk pending
                  <div style={{
                    color: '#ffffff',
                    fontSize: '1.2rem',
                    letterSpacing: '3px',
                    fontFamily: 'monospace',
                    backgroundColor: '#000000',
                    padding: '5px 10px',
                    opacity: 0.6
                  }}>
                    ......
                  </div>
                )}
              </div>

              {/* Kolom 4: Titik-titik horizontal dari tengah ke judul */}
              <div style={{
                width: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                paddingTop: '25px'
              }}>
                <div style={{
                  color: '#ffffff',
                  fontSize: '1.2rem',
                  letterSpacing: '3px',
                  fontFamily: 'monospace',
                  opacity: step.status === 'current' ? 0.9 : 0.7
                }}>
                  ................
                </div>
              </div>

              {/* Kolom 5: Konten Step */}
              <div style={{
                flex: 1,
                paddingLeft: '1rem',
                paddingTop: '25px'
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
                        gap: '0.5rem',
                        padding: '0.5rem 1.25rem',
                        backgroundColor: 'rgba(255,255,255,0.15)',
                        borderRadius: '20px',
                        fontSize: '1rem',
                        color: '#ffffff'
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
                
                {/* Baris 2: Garis pemisah dengan titik-titik */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '0.75rem',
                  opacity: 0.8
                }}>
                  <div style={{
                    color: '#ffffff',
                    fontSize: '1rem',
                    letterSpacing: '4px',
                    fontFamily: 'monospace'
                  }}>
                    ........................
                  </div>
                </div>
                
                {/* Baris 3: Tanggal dan Status */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  opacity: step.status === 'pending' ? 0.4 : 0.9
                }}>
                  <span style={{
                    fontSize: '1.2rem',
                    fontFamily: 'monospace',
                    fontWeight: 500,
                    color: '#ffffff'
                  }}>
                    {step.date}
                  </span>
                  
                  {step.status === 'completed' && (
                    <>
                      <div style={{
                        color: '#ffffff',
                        fontSize: '1rem',
                        letterSpacing: '3px',
                        fontFamily: 'monospace',
                        opacity: 0.7
                      }}>
                        ................
                      </div>
                      <span style={{ 
                        fontSize: '1.2rem', 
                        color: '#ffffff',
                        fontWeight: 500 
                      }}>
                        Completed
                      </span>
                    </>
                  )}
                  
                  {step.status === 'pending' && (
                    <>
                      <div style={{
                        color: '#ffffff',
                        fontSize: '1rem',
                        letterSpacing: '3px',
                        fontFamily: 'monospace',
                        opacity: 0.5
                      }}>
                        ................
                      </div>
                      <span style={{ 
                        fontSize: '1.2rem', 
                        opacity: 0.6, 
                        color: '#ffffff',
                        fontWeight: 500 
                      }}>
                        Upcoming
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Southeast Arrow hanya untuk step aktif */}
              {step.status === 'current' && (
                <motion.div
                  style={{
                    marginLeft: '2rem',
                    marginTop: '25px',
                    opacity: 0.9
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
