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
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="3" fill="currentColor" />
      <circle cx="12" cy="12" r="6" stroke="currentColor" strokeOpacity="0.5" />
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" />
      <circle cx="12" cy="12" r="12" stroke="currentColor" strokeOpacity="0.1" />
    </svg>
  );

  const SouthEastArrow = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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
          color: 'white',
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
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
          letterSpacing: '-0.02em'
        }}>
          Project Timeline
        </h1>
        
        <p style={{ 
          fontSize: '1rem', 
          opacity: 0.6,
          marginBottom: '4rem',
          maxWidth: '600px'
        }}>
          Development progress visualized through minimalist timeline with real-time status indicators
        </p>

        {/* Main Timeline Container */}
        <div style={{
          position: 'relative',
          maxWidth: '800px',
          margin: '0 auto',
          padding: '2rem 0'
        }}>
          
          {/* Timeline Steps dengan penghubung titik-titik */}
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
                alignItems: 'flex-start',
                marginBottom: '4rem',
                position: 'relative',
                minHeight: '60px'
              }}
            >
              {/* Bagian Kiri: Nomor dan titik-titik penghubung vertikal */}
              <div style={{
                width: '100px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative'
              }}>
                
                {/* Nomor Step */}
                <div style={{
                  fontSize: '0.875rem',
                  opacity: step.status === 'pending' ? 0.3 : 0.5,
                  fontFamily: 'monospace',
                  marginBottom: '0.5rem'
                }}>
                  {String(index + 1).padStart(2, '0')}
                </div>
                
                {/* Titik-titik penghubung vertikal ke step berikutnya */}
                {index < timelineSteps.length - 1 && (
                  <div style={{
                    color: 'rgba(255,255,255,0.1)',
                    fontSize: '0.8rem',
                    letterSpacing: '1px',
                    fontFamily: 'monospace',
                    writingMode: 'vertical-rl',
                    textOrientation: 'mixed',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    .......
                  </div>
                )}
              </div>

              {/* Bagian Tengah: Indikator Status dengan titik-titik penghubung horizontal */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '60px',
                position: 'relative'
              }}>
                
                {/* Indikator Status */}
                {step.status === 'current' ? (
                  // Pemancar berkedip untuk step aktif
                  <motion.div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '40px',
                      height: '40px'
                    }}
                    animate={{ 
                      scale: [1, 1.1, 1],
                      opacity: [0.8, 1, 0.8]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <TransmitterIcon />
                  </motion.div>
                ) : step.status === 'completed' ? (
                  // Dot solid untuk step selesai
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    margin: '14px 0'
                  }} />
                ) : (
                  // Titik-titik untuk step pending
                  <div style={{
                    color: 'rgba(255,255,255,0.2)',
                    fontSize: '1.2rem',
                    letterSpacing: '2px',
                    fontFamily: 'monospace',
                    margin: '14px 0'
                  }}>
                    .......
                  </div>
                )}
                
                {/* Titik-titik penghubung horizontal ke konten */}
                <div style={{
                  color: 'rgba(255,255,255,0.1)',
                  fontSize: '0.8rem',
                  letterSpacing: '1px',
                  fontFamily: 'monospace',
                  marginTop: '8px'
                }}>
                  .......
                </div>
              </div>

              {/* Bagian Kanan: Konten Step */}
              <div style={{
                flex: 1,
                paddingLeft: '1rem',
                position: 'relative'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '0.25rem'
                }}>
                  {/* Titik-titik penghubung ke judul */}
                  <div style={{
                    color: step.status === 'current' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                    fontSize: '0.8rem',
                    letterSpacing: '1px',
                    fontFamily: 'monospace'
                  }}>
                    .......
                  </div>
                  
                  <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: 400,
                    margin: 0,
                    opacity: step.status === 'pending' ? 0.5 : 1
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
                        fontSize: '0.75rem'
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
                
                {/* Garis pemisah dengan titik-titik */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '0.5rem',
                  opacity: 0.3
                }}>
                  <div style={{
                    color: 'rgba(255,255,255,0.1)',
                    fontSize: '0.7rem',
                    letterSpacing: '1px',
                    fontFamily: 'monospace',
                    marginRight: '0.5rem'
                  }}>
                    ..........
                  </div>
                  <div style={{
                    width: '1px',
                    height: '12px',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    marginRight: '0.5rem'
                  }} />
                </div>
                
                {/* Tanggal dan Status */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  opacity: step.status === 'pending' ? 0.3 : 0.7
                }}>
                  <span style={{
                    fontSize: '0.875rem',
                    fontFamily: 'monospace'
                  }}>
                    {step.date}
                  </span>
                  
                  {step.status === 'completed' && (
                    <>
                      <div style={{
                        color: 'rgba(255,255,255,0.2)',
                        fontSize: '0.8rem',
                        letterSpacing: '1px',
                        fontFamily: 'monospace'
                      }}>
                        ......
                      </div>
                      <span style={{ fontSize: '0.875rem' }}>Completed</span>
                    </>
                  )}
                  
                  {step.status === 'pending' && (
                    <>
                      <div style={{
                        color: 'rgba(255,255,255,0.2)',
                        fontSize: '0.8rem',
                        letterSpacing: '1px',
                        fontFamily: 'monospace'
                      }}>
                        ......
                      </div>
                      <span style={{ fontSize: '0.875rem', opacity: 0.5 }}>Upcoming</span>
                    </>
                  )}
                </div>
              </div>

              {/* Southeast Arrow hanya untuk step aktif */}
              {step.status === 'current' && (
                <motion.div
                  style={{
                    marginLeft: '1rem',
                    opacity: 0.8,
                    alignSelf: 'center'
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
