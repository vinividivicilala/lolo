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
          
          {/* Timeline Steps - Tanpa garis */}
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
                minHeight: '60px'
              }}
            >
              {/* Step Indicator dengan titik-titik (.......) untuk step yang belum aktif */}
              <div style={{
                position: 'relative',
                width: '100px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                
                {/* Step Number */}
                <div style={{
                  position: 'absolute',
                  left: '-40px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '0.875rem',
                  opacity: 0.5,
                  fontFamily: 'monospace'
                }}>
                  {String(index + 1).padStart(2, '0')}
                </div>
                
                {/* Dot atau titik-titik berdasarkan status */}
                {step.status === 'current' ? (
                  // Blinking dot untuk step aktif
                  <motion.div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: '#ffffff',
                      border: '2px solid rgba(255,255,255,0.8)',
                      position: 'relative',
                      zIndex: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    animate={{
                      boxShadow: [
                        '0 0 0 0 rgba(255,255,255,0.2)',
                        '0 0 0 10px rgba(255,255,255,0)',
                        '0 0 0 0 rgba(255,255,255,0)'
                      ]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity
                    }}
                  >
                    {/* Inner blinking dot */}
                    <motion.div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#000000'
                      }}
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    />
                  </motion.div>
                ) : step.status === 'completed' ? (
                  // Dot untuk step yang sudah selesai
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    position: 'relative',
                    zIndex: 2
                  }} />
                ) : (
                  // Titik-titik (.......) untuk step yang pending
                  <div style={{
                    color: 'rgba(255,255,255,0.2)',
                    fontSize: '1.5rem',
                    letterSpacing: '2px',
                    fontFamily: 'monospace'
                  }}>
                    .......
                  </div>
                )}
              </div>

              {/* Step Content */}
              <div style={{
                flex: 1,
                paddingLeft: '2rem',
                borderLeft: step.status === 'current' ? '1px solid rgba(255,255,255,0.1)' : 'none',
                marginLeft: step.status === 'current' ? '-1px' : '0'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '0.5rem'
                }}>
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
                      LIVE
                    </motion.div>
                  )}
                </div>
                
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
                      <span style={{ fontSize: '0.875rem', opacity: 0.5 }}>→</span>
                      <span style={{ fontSize: '0.875rem' }}>Completed</span>
                    </>
                  )}
                </div>
              </div>

              {/* Southeast Arrow hanya untuk step aktif */}
              {step.status === 'current' && (
                <motion.div
                  style={{
                    marginLeft: '2rem',
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
