'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

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

  // North West Arrow
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

  // Simple Dot - No Colors
  const SimpleDot = ({ isActive = false, isCompleted = false }) => (
    <div style={{
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      backgroundColor: '#ffffff',
      opacity: isActive ? 1 : (isCompleted ? 0.8 : 0.3),
      transition: 'opacity 0.2s ease'
    }} />
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
    // Jika klik nomor yang sama, tutup. Jika berbeda, buka.
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
      
      {/* Animated Background Grid - Very Subtle */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.01) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
        opacity: 0.2,
        zIndex: 1
      }} />

      {/* Main Content */}
      <div style={{ 
        position: 'relative', 
        zIndex: 10, 
        maxWidth: '1200px', 
        margin: '0 auto'
      }}>
        
        {/* Home Button */}
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
            fontSize: 'clamp(2.5rem, 5vw, 4rem)', 
            marginBottom: '0.5rem',
            fontWeight: 300,
            letterSpacing: '-0.02em',
            color: '#ffffff'
          }}>
            Project Timeline
          </h1>
          
          <p style={{ 
            fontSize: '1.1rem', 
            opacity: 0.6,
            marginBottom: '4rem',
            maxWidth: '600px',
            color: '#ffffff'
          }}>
            Development progress visualized through minimalist timeline
          </p>

          {/* Timeline Container */}
          <div style={{
            position: 'relative',
            maxWidth: '1000px',
            margin: '0 auto'
          }}>
            
            {/* Timeline Steps */}
            {timelineSteps.map((step, index) => {
              const isExpanded = selectedStep === step.id;
              
              return (
                <div key={step.id} style={{ marginBottom: isExpanded ? '1rem' : '3rem' }}>
                  {/* Timeline Row - Always Visible */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: 1, 
                      x: 0,
                      transition: { delay: index * 0.1 }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      position: 'relative',
                      cursor: 'pointer',
                      opacity: selectedStep && selectedStep !== step.id ? 0.3 : 1,
                      transition: 'opacity 0.2s ease'
                    }}
                    onClick={() => handleStepClick(step.id)}
                  >
                    {/* Kolom 1: Angka */}
                    <div style={{
                      width: '120px',
                      display: 'flex',
                      justifyContent: 'flex-end',
                      paddingRight: '30px'
                    }}>
                      <div style={{
                        fontSize: '1.5rem',
                        fontFamily: 'monospace',
                        fontWeight: 400,
                        color: '#ffffff',
                        opacity: step.status === 'pending' ? 0.3 : 0.8
                      }}>
                        {String(index + 1).padStart(2, '0')}
                      </div>
                    </div>

                    {/* Kolom 2: Dots */}
                    <div style={{
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      width: '100px',
                      minHeight: '80px'
                    }}>
                      {/* Vertical Dots Line */}
                      <div style={{
                        color: '#ffffff',
                        fontSize: '0.8rem',
                        letterSpacing: '3px',
                        fontFamily: 'monospace',
                        writingMode: 'vertical-rl',
                        textOrientation: 'mixed',
                        height: '80px',
                        opacity: 0.2,
                        position: 'absolute',
                        left: '50%',
                        transform: 'translateX(-50%)'
                      }}>
                        ••••••••••
                      </div>

                      {/* Center Dot */}
                      <div style={{
                        position: 'absolute',
                        top: '32px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 3,
                        backgroundColor: '#000000',
                        padding: '4px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <SimpleDot 
                          isActive={step.status === 'current'} 
                          isCompleted={step.status === 'completed'}
                        />
                      </div>

                      {/* Horizontal Dots */}
                      <div style={{
                        position: 'absolute',
                        top: '32px',
                        left: '50%',
                        width: '60px',
                        transform: 'translateY(0)',
                        display: 'flex',
                        justifyContent: 'flex-start'
                      }}>
                        <div style={{
                          color: '#ffffff',
                          fontSize: '0.8rem',
                          letterSpacing: '3px',
                          fontFamily: 'monospace',
                          opacity: 0.2,
                          marginLeft: '20px'
                        }}>
                          ••••••••
                        </div>
                      </div>
                    </div>

                    {/* Kolom 3: Title & Date */}
                    <div style={{
                      flex: 1,
                      marginLeft: '30px',
                      paddingTop: '12px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <h3 style={{
                          fontSize: '1.8rem',
                          fontWeight: 350,
                          margin: 0,
                          color: '#ffffff',
                          letterSpacing: '-0.01em'
                        }}>
                          {step.title}
                        </h3>
                        
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          opacity: 0.6
                        }}>
                          <span style={{
                            fontSize: '1.1rem',
                            fontFamily: 'monospace',
                            color: '#ffffff'
                          }}>
                            {step.date}
                          </span>
                          <div style={{ opacity: 0.5 }}>
                            <SoutheastArrow />
                          </div>
                        </div>
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        marginTop: '0.25rem'
                      }}>
                        <span style={{ 
                          fontSize: '0.9rem', 
                          color: '#ffffff',
                          opacity: 0.4,
                          textTransform: 'uppercase',
                          letterSpacing: '1px'
                        }}>
                          {step.status}
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  {/* SHADOW PAGE - MENYATU DENGAN HALAMAN UTAMA */}
                  {/* Setiap nomor memiliki halaman bayangan sendiri yang muncul saat diklik */}
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        marginLeft: '150px', // Sejajar dengan konten timeline
                        marginTop: '1.5rem',
                        marginBottom: '2.5rem',
                        padding: '2rem 2rem 2rem 2.5rem',
                        backgroundColor: '#0a0a0a',
                        borderLeft: '1px solid rgba(255,255,255,0.1)',
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        position: 'relative',
                        width: 'calc(100% - 150px)'
                      }}
                    >
                      {/* Page Number - Very Subtle */}
                      <div style={{
                        position: 'absolute',
                        bottom: '1rem',
                        right: '1.5rem',
                        fontSize: '0.7rem',
                        opacity: 0.1,
                        fontFamily: 'monospace',
                        letterSpacing: '2px'
                      }}>
                        {String(step.id).padStart(2, '0')} / 05
                      </div>

                      {/* Content - Pure Black & White, No Colors */}
                      <div style={{ maxWidth: '700px' }}>
                        {/* Title */}
                        <div style={{
                          fontSize: '2.2rem',
                          fontWeight: 300,
                          marginBottom: '1.25rem',
                          color: '#ffffff',
                          lineHeight: '1.2'
                        }}>
                          {step.title}
                        </div>
                        
                        {/* Description */}
                        <p style={{
                          fontSize: '1.1rem',
                          lineHeight: '1.7',
                          opacity: 0.7,
                          marginBottom: '2rem',
                          color: '#ffffff',
                          fontWeight: 300
                        }}>
                          {step.details}
                        </p>
                        
                        {/* Info Grid - Minimal, No Colors */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(2, 1fr)',
                          gap: '1.5rem 3rem',
                          marginTop: '1rem',
                          paddingTop: '1.5rem',
                          borderTop: '1px solid rgba(255,255,255,0.08)'
                        }}>
                          <div>
                            <div style={{ fontSize: '0.7rem', opacity: 0.3, fontFamily: 'monospace', marginBottom: '0.35rem' }}>
                              TIMELINE
                            </div>
                            <div style={{ fontSize: '1.2rem', fontFamily: 'monospace', opacity: 0.9 }}>{step.date}</div>
                          </div>
                          
                          <div>
                            <div style={{ fontSize: '0.7rem', opacity: 0.3, fontFamily: 'monospace', marginBottom: '0.35rem' }}>
                              STATUS
                            </div>
                            <div style={{ 
                              fontSize: '1.2rem',
                              opacity: step.status === 'pending' ? 0.4 : 0.9,
                              textTransform: 'uppercase'
                            }}>
                              {step.status}
                            </div>
                          </div>
                          
                          <div>
                            <div style={{ fontSize: '0.7rem', opacity: 0.3, fontFamily: 'monospace', marginBottom: '0.35rem' }}>
                              MILESTONE
                            </div>
                            <div style={{ fontSize: '1.2rem', fontFamily: 'monospace', opacity: 0.9 }}>MS-{step.id * 100}</div>
                          </div>
                          
                          <div>
                            <div style={{ fontSize: '0.7rem', opacity: 0.3, fontFamily: 'monospace', marginBottom: '0.35rem' }}>
                              PROGRESS
                            </div>
                            <div style={{ fontSize: '1.2rem', fontFamily: 'monospace', opacity: 0.9 }}>
                              {step.status === 'completed' ? '100%' : 
                               step.status === 'current' ? '65%' : '0%'}
                            </div>
                          </div>
                        </div>

                        {/* Additional Info - Very Subtle */}
                        <div style={{
                          marginTop: '1.5rem',
                          fontSize: '0.75rem',
                          opacity: 0.2,
                          fontFamily: 'monospace',
                          display: 'flex',
                          gap: '1.5rem'
                        }}>
                          <span>PROJECT: TIMELINE-{step.id}</span>
                          <span>UPDATED: Q1 2025</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
