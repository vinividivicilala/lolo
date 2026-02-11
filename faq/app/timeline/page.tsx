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

  // Modern Transmitter Animation - ONLY THIS PART CHANGED
  const ModernTransmitter = () => (
    <div style={{
      position: 'relative',
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Pulsing Rings - Modern Awwards Style */}
      <motion.div
        style={{
          position: 'absolute',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: '1px solid rgba(255, 255, 255, 0.3)',
        }}
        animate={{
          scale: [1, 1.8, 2.2],
          opacity: [0.5, 0.2, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeOut"
        }}
      />
      <motion.div
        style={{
          position: 'absolute',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
        animate={{
          scale: [1, 1.5, 2],
          opacity: [0.4, 0.15, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeOut",
          delay: 0.5
        }}
      />
      <motion.div
        style={{
          position: 'absolute',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
        animate={{
          scale: [1, 1.3, 1.8],
          opacity: [0.3, 0.1, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeOut",
          delay: 1
        }}
      />
      
      {/* Central Dot with Modern Glow */}
      <motion.div
        style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          position: 'relative',
          zIndex: 10,
          boxShadow: '0 0 20px rgba(255, 255, 255, 0.8)'
        }}
        animate={{
          scale: [1, 1.1, 1],
          boxShadow: [
            '0 0 20px rgba(255, 255, 255, 0.8)',
            '0 0 30px rgba(255, 255, 255, 1)',
            '0 0 20px rgba(255, 255, 255, 0.8)'
          ]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Inner Dot with Green Glow */}
        <motion.div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            backgroundColor: '#00ff9d',
            boxShadow: '0 0 8px #00ff9d'
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [1, 0.6, 1]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>
    </div>
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
                marginBottom: '4rem',
                position: 'relative',
                minHeight: '100px'
              }}
            >
              {/* Kolom 1: Angka */}
              <div style={{
                width: '150px',
                display: 'flex',
                justifyContent: 'flex-end',
                paddingRight: '40px'
              }}>
                <div style={{
                  fontSize: '1.6rem',
                  fontFamily: 'monospace',
                  fontWeight: 500,
                  color: '#ffffff',
                  opacity: step.status === 'pending' ? 0.4 : 1
                }}>
                  {String(index + 1).padStart(2, '0')}
                </div>
              </div>

              {/* Kolom 2: Titik Vertikal + Horizontal + Indikator */}
              <div style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '120px',
                height: '100px'
              }}>
                {/* Titik Vertikal */}
                <div style={{
                  color: '#ffffff',
                  fontSize: '1rem',
                  letterSpacing: '4px',
                  fontFamily: 'monospace',
                  writingMode: 'vertical-rl',
                  textOrientation: 'mixed',
                  height: '100%',
                  opacity: 0.8,
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)'
                }}>
                  ....................
                </div>

                {/* Modern Transmitter or Indicator */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 2,
                  backgroundColor: '#000000',
                  padding: '5px',
                  borderRadius: '50%'
                }}>
                  {step.status === 'current' ? (
                    <ModernTransmitter />
                  ) : step.status === 'completed' ? (
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: '#ffffff',
                      border: '4px solid #000000',
                      boxShadow: '0 0 15px rgba(255,255,255,0.8)'
                    }} />
                  ) : (
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: '#ffffff',
                      border: '4px solid #000000',
                      boxShadow: '0 0 15px rgba(255,255,255,0.8)',
                      opacity: 0.5
                    }} />
                  )}
                </div>

                {/* Titik Horizontal */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '60px',
                  transform: 'translateY(-50%)'
                }}>
                  <div style={{
                    color: '#ffffff',
                    fontSize: '1rem',
                    letterSpacing: '4px',
                    fontFamily: 'monospace',
                    opacity: 0.8
                  }}>
                    ................
                  </div>
                </div>
              </div>

              {/* Kolom 3: Konten */}
              <div style={{
                flex: 1,
                marginLeft: '80px'
              }}>
                {/* Judul */}
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
                        backgroundColor: '#00ff9d',
                        boxShadow: '0 0 8px #00ff9d'
                      }} />
                      TRANSMITTING
                    </motion.div>
                  )}
                </div>
                
                {/* Tanggal dan Status */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem'
                }}>
                  <span style={{
                    fontSize: '1.3rem',
                    fontFamily: 'monospace',
                    fontWeight: 500,
                    color: '#ffffff',
                    opacity: 0.9
                  }}>
                    {step.date}
                  </span>
                  
                  <span style={{ 
                    fontSize: '1.3rem', 
                    color: '#ffffff',
                    fontWeight: 500,
                    opacity: step.status === 'pending' ? 0.6 : 0.9
                  }}>
                    {step.status === 'completed' && 'Completed'}
                    {step.status === 'current' && 'In Progress'}
                    {step.status === 'pending' && 'Upcoming'}
                  </span>
                </div>
              </div>

              {/* Southeast Arrow */}
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
