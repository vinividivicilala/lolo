'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function TimelinePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedStep, setSelectedStep] = useState(null);
  
  const timelineSteps = [
    { 
      id: 1,
      title: 'Research & Discovery', 
      date: 'Q1 2024', 
      status: 'completed',
      details: 'Market research, competitor analysis, user interviews, and initial requirements gathering completed successfully.'
    },
    { 
      id: 2,
      title: 'Concept Design', 
      date: 'Q2 2024', 
      status: 'completed',
      details: 'Wireframing, prototyping, UI/UX design, and design system creation completed.'
    },
    { 
      id: 3,
      title: 'Development Phase', 
      date: 'Q3 2024', 
      status: 'current',
      details: 'Frontend and backend development in progress. Core features implementation and API integration.'
    },
    { 
      id: 4,
      title: 'Testing & QA', 
      date: 'Q4 2024', 
      status: 'pending',
      details: 'Comprehensive testing, bug fixes, performance optimization, and quality assurance.'
    },
    { 
      id: 5,
      title: 'Launch', 
      date: 'Q1 2025', 
      status: 'pending',
      details: 'Production deployment, monitoring setup, and official product launch.'
    },
  ];

  // North West Arrow - BESAR, KIRI ATAS
  const NorthwestArrow = () => (
    <svg 
      width="48" 
      height="48" 
      viewBox="0 0 48 48" 
      fill="none" 
      stroke="#ffffff" 
      strokeWidth="2.5"
    >
      <path 
        d="M32 16L16 32m0-16h16v16" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );

  // Modern Blinking Dot
  const BlinkingDot = () => (
    <motion.div
      style={{
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        backgroundColor: '#00ff9d',
        boxShadow: '0 0 20px #00ff9d',
      }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [1, 0.8, 1],
        boxShadow: [
          '0 0 20px #00ff9d',
          '0 0 35px #00ff9d',
          '0 0 20px #00ff9d'
        ]
      }}
      transition={{
        duration: 1.2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );

  // Southeast Arrow
  const SoutheastArrow = () => (
    <svg 
      width="48" 
      height="48" 
      viewBox="0 0 48 48" 
      fill="none" 
      stroke="#ffffff" 
      strokeWidth="2.5"
    >
      <path 
        d="M16 16l16 16m0 0V16m0 16H16" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < timelineSteps.length - 1 ? prev + 1 : 0));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleStepClick = (stepId) => {
    setSelectedStep(selectedStep === stepId ? null : stepId);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000000',
      color: '#ffffff',
      padding: '2rem',
      fontFamily: 'Helvetica, Arial, sans-serif',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      
      {/* Animated Background Grid */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
        opacity: 0.3,
        zIndex: 1
      }} />

      {/* SHADOW PAGE - FULL SETENGAH LAYAR DARI KIRI, KANAN, BAWAH */}
      <AnimatePresence>
        {selectedStep && (
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'tween', duration: 0.4, ease: "easeInOut" }}
            style={{
              position: 'fixed',
              left: 0,
              right: 0,
              bottom: 0,
              height: '50vh', // SETENGAH LAYAR DARI BAWAH
              width: '100%',
              backgroundColor: '#0a0a0a',
              zIndex: 100,
              borderTop: '1px solid rgba(0,255,157,0.2)',
              boxShadow: '0 -20px 40px rgba(0,0,0,0.8)',
              overflowY: 'auto',
              padding: '3rem 4rem',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {timelineSteps.map((step) => (
              step.id === selectedStep && (
                <div key={step.id} style={{ 
                  height: '100%', 
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative'
                }}>
                  {/* Page Number - Bottom Right */}
                  <div style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    fontSize: '0.8rem',
                    opacity: 0.15,
                    fontFamily: 'monospace',
                    letterSpacing: '4px'
                  }}>
                    {String(step.id).padStart(2, '0')} / 05
                  </div>

                  {/* Close Button */}
                  <motion.button
                    onClick={() => setSelectedStep(null)}
                    style={{
                      position: 'absolute',
                      top: '0',
                      right: '0',
                      background: 'transparent',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: '#ffffff',
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      cursor: 'pointer',
                      zIndex: 101
                    }}
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    ×
                  </motion.button>

                  {/* Main Content - Full Width */}
                  <div style={{ 
                    maxWidth: '1200px',
                    width: '100%',
                    margin: '0 auto',
                    padding: '1rem 0'
                  }}>
                    {/* Timeline ID Badge */}
                    <div style={{
                      display: 'inline-block',
                      padding: '0.35rem 1rem',
                      border: '1px solid rgba(0,255,157,0.3)',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      color: '#00ff9d',
                      marginBottom: '1.5rem',
                      letterSpacing: '1px'
                    }}>
                      TIMELINE {step.id} · {step.status.toUpperCase()}
                    </div>
                    
                    {/* Title */}
                    <div style={{
                      fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                      fontWeight: 300,
                      marginBottom: '1.5rem',
                      color: '#ffffff',
                      lineHeight: '1.1',
                      letterSpacing: '-0.02em'
                    }}>
                      {step.title}
                    </div>
                    
                    {/* Description */}
                    <p style={{
                      fontSize: '1.25rem',
                      lineHeight: '1.6',
                      opacity: 0.8,
                      marginBottom: '2.5rem',
                      color: '#ffffff',
                      fontWeight: 300,
                      maxWidth: '800px'
                    }}>
                      {step.details}
                    </p>
                    
                    {/* Info Grid - 4 Columns */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '2rem',
                      marginTop: '1rem',
                      paddingTop: '2rem',
                      borderTop: '1px solid rgba(255,255,255,0.1)'
                    }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.4, fontFamily: 'monospace', marginBottom: '0.5rem' }}>
                          TIMELINE
                        </div>
                        <div style={{ fontSize: '1.5rem', fontFamily: 'monospace', fontWeight: 500 }}>{step.date}</div>
                      </div>
                      
                      <div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.4, fontFamily: 'monospace', marginBottom: '0.5rem' }}>
                          STATUS
                        </div>
                        <div style={{ 
                          fontSize: '1.5rem',
                          color: step.status === 'completed' ? '#ffffff' : 
                                 step.status === 'current' ? '#00ff9d' : '#666666',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          fontWeight: 500
                        }}>
                          {step.status === 'current' && <BlinkingDot />}
                          {step.status === 'completed' && '✓'}
                          {step.status.toUpperCase()}
                        </div>
                      </div>
                      
                      <div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.4, fontFamily: 'monospace', marginBottom: '0.5rem' }}>
                          MILESTONE
                        </div>
                        <div style={{ fontSize: '1.5rem', fontFamily: 'monospace', fontWeight: 500 }}>MS-{step.id * 100}</div>
                      </div>
                      
                      <div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.4, fontFamily: 'monospace', marginBottom: '0.5rem' }}>
                          PROGRESS
                        </div>
                        <div style={{ fontSize: '1.5rem', fontFamily: 'monospace', fontWeight: 500 }}>
                          {step.status === 'completed' ? '100%' : 
                           step.status === 'current' ? '65%' : '0%'}
                        </div>
                      </div>
                    </div>

                    {/* Additional Metadata */}
                    <div style={{
                      display: 'flex',
                      gap: '2rem',
                      marginTop: '2rem',
                      paddingTop: '1rem',
                      fontSize: '0.85rem',
                      opacity: 0.6,
                      fontFamily: 'monospace'
                    }}>
                      <span>LAST UPDATED: Q1 2025</span>
                      <span>PROJECT ID: TIMELINE-{step.id}</span>
                      <span>LEAD: FARID ARDIANSYAH</span>
                    </div>
                  </div>
                </div>
              )
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div style={{ 
        position: 'relative', 
        zIndex: 10, 
        maxWidth: '1400px', 
        margin: '0 auto'
      }}>
        
        {/* Home Button - Large dengan North West Arrow */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: '3rem' }}
        >
          <motion.button
            onClick={() => router.push('/')}
            style={{
              padding: 0,
              backgroundColor: 'transparent',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              fontSize: '2rem',
              fontWeight: 300,
              letterSpacing: '2px'
            }}
            whileHover={{ opacity: 0.8 }}
            whileTap={{ scale: 0.98 }}
          >
            <NorthwestArrow />
            HALAMAN UTAMA
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
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
            margin: '0 auto'
          }}>
            
            {/* Timeline Steps */}
            {timelineSteps.map((step, index) => (
              <React.Fragment key={index}>
                <motion.div
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
                    minHeight: '100px',
                    cursor: 'pointer',
                    opacity: selectedStep && selectedStep !== step.id ? 0.3 : 1,
                    transition: 'opacity 0.2s ease'
                  }}
                  onClick={() => handleStepClick(step.id)}
                  whileHover={{ opacity: 1 }}
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

                  {/* Kolom 2: Titik Vertikal + Titik Bulat + Titik Horizontal */}
                  <div style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '140px',
                    height: '100px'
                  }}>
                    {/* Titik Vertikal */}
                    <div style={{
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      letterSpacing: '4px',
                      fontFamily: 'monospace',
                      writingMode: 'vertical-rl',
                      textOrientation: 'mixed',
                      height: '100%',
                      opacity: 0.6,
                      position: 'absolute',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      ••••••••••••••••••••••
                    </div>

                    {/* Titik Bulat */}
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      zIndex: 3,
                      backgroundColor: '#000000',
                      padding: '6px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {step.status === 'current' ? (
                        <BlinkingDot />
                      ) : (
                        <div style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: '#ffffff',
                          boxShadow: '0 0 15px rgba(255,255,255,0.8)',
                          opacity: step.status === 'pending' ? 0.5 : 1
                        }} />
                      )}
                    </div>

                    {/* Titik Horizontal */}
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      width: '70px',
                      transform: 'translateY(-50%)',
                      display: 'flex',
                      justifyContent: 'flex-start'
                    }}>
                      <div style={{
                        color: '#ffffff',
                        fontSize: '0.9rem',
                        letterSpacing: '4px',
                        fontFamily: 'monospace',
                        opacity: 0.6,
                        marginLeft: '25px'
                      }}>
                        ••••••••••••••••
                      </div>
                    </div>
                  </div>

                  {/* Kolom 3: Konten */}
                  <div style={{
                    flex: 1,
                    marginLeft: '60px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.75rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.5rem'
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
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1.25rem',
                            backgroundColor: 'rgba(255,255,255,0.15)',
                            borderRadius: '20px',
                            fontSize: '1rem',
                            color: '#ffffff',
                            fontWeight: 500,
                            letterSpacing: '0.5px'
                          }}>
                            <BlinkingDot />
                            TRANSMITTING
                          </div>
                        )}
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: step.status === 'pending' ? 0.4 : 0.9,
                        marginLeft: '1rem'
                      }}>
                        <SoutheastArrow />
                      </div>
                    </div>
                    
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
                </motion.div>
              </React.Fragment>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
