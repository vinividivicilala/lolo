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

  // Modern Awwards-style Transmitter Animation
  const ModernTransmitter = ({ isActive }) => (
    <div style={{
      position: 'relative',
      width: '60px',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Pulsing Rings - Modern Awwards Style */}
      {isActive && (
        <>
          <motion.div
            style={{
              position: 'absolute',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              border: '1px solid rgba(255, 255, 255, 0.3)',
            }}
            animate={{
              scale: [1, 1.5, 2],
              opacity: [0.5, 0.25, 0],
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
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              border: '1px solid rgba(255, 255, 255, 0.4)',
            }}
            animate={{
              scale: [1, 1.8, 2.2],
              opacity: [0.6, 0.3, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut",
              delay: 0.5
            }}
          />
        </>
      )}
      
      {/* Central Dot with Glow */}
      <motion.div
        style={{
          width: isActive ? '16px' : '14px',
          height: isActive ? '16px' : '14px',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          position: 'relative',
          zIndex: 10,
          boxShadow: isActive 
            ? '0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(255, 255, 255, 0.4)' 
            : '0 0 10px rgba(255, 255, 255, 0.5)'
        }}
        animate={
          isActive ? {
            scale: [1, 1.1, 1],
            boxShadow: [
              '0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(255, 255, 255, 0.4)',
              '0 0 30px rgba(255, 255, 255, 1), 0 0 60px rgba(255, 255, 255, 0.6)',
              '0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(255, 255, 255, 0.4)'
            ]
          } : {}
        }
        transition={
          isActive ? {
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          } : {}
        }
      >
        {/* Inner Glow for Active State */}
        {isActive && (
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
              filter: 'blur(1px)'
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [1, 0.5, 1]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
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
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* Modern Gradient Background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.05) 0%, transparent 50%)',
        opacity: 0.3
      }} />

      {/* Grid Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
                         linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px)`,
        backgroundSize: '50px 50px',
        opacity: 0.2
      }} />

      <motion.button
        onClick={() => router.back()}
        style={{
          padding: '1rem 2rem',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          color: '#ffffff',
          cursor: 'pointer',
          marginBottom: '3rem',
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '1rem',
          fontWeight: 500,
          letterSpacing: '0.5px'
        }}
        whileHover={{ 
          background: 'rgba(255, 255, 255, 0.1)',
          borderColor: 'rgba(255, 255, 255, 0.2)',
          transform: 'translateY(-2px)'
        }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ position: 'relative', zIndex: 10 }}
      >
        <h1 style={{ 
          fontSize: 'clamp(3.5rem, 7vw, 6rem)', 
          marginBottom: '1rem',
          fontWeight: 300,
          letterSpacing: '-0.03em',
          color: '#ffffff',
          lineHeight: 1.1
        }}>
          Project<br />Timeline
        </h1>
        
        <p style={{ 
          fontSize: '1.2rem', 
          opacity: 0.6,
          marginBottom: '4rem',
          maxWidth: '500px',
          color: '#ffffff',
          lineHeight: 1.6,
          fontWeight: 300
        }}>
          Visualizing development milestones with real-time transmission status
        </p>

        {/* Main Timeline Container */}
        <div style={{
          position: 'relative',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '3rem 0'
        }}>
          
          {/* Timeline Steps */}
          {timelineSteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -30 }}
              animate={{ 
                opacity: 1, 
                x: 0,
                transition: { 
                  delay: index * 0.15,
                  duration: 0.6,
                  ease: "easeOut"
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '3rem',
                position: 'relative',
                minHeight: '100px'
              }}
            >
              {/* Step Number - Modern Design */}
              <div style={{
                width: '140px',
                display: 'flex',
                justifyContent: 'flex-end',
                paddingRight: '40px'
              }}>
                <div style={{
                  fontSize: '1.4rem',
                  fontFamily: 'monospace',
                  fontWeight: 400,
                  color: '#ffffff',
                  opacity: step.status === 'pending' ? 0.4 : 0.8,
                  letterSpacing: '2px'
                }}>
                  {String(index + 1).padStart(2, '0')}
                </div>
              </div>

              {/* Dotted Line Connection */}
              <div style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100px',
                height: '100px'
              }}>
                {/* Vertical Dots */}
                <div style={{
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  letterSpacing: '6px',
                  fontFamily: 'monospace',
                  writingMode: 'vertical-rl',
                  textOrientation: 'mixed',
                  height: '100%',
                  opacity: 0.3,
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)'
                }}>
                  ••••••••••••••••••••••
                </div>

                {/* Modern Transmitter at Connection Point */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 2
                }}>
                  <ModernTransmitter isActive={step.status === 'current'} />
                </div>

                {/* Horizontal Dots to Content */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '80px',
                  transform: 'translateY(-50%)'
                }}>
                  <div style={{
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    letterSpacing: '6px',
                    fontFamily: 'monospace',
                    opacity: 0.3
                  }}>
                    ••••••••••••••••
                  </div>
                </div>
              </div>

              {/* Content Area */}
              <div style={{
                flex: 1,
                marginLeft: '80px',
                paddingTop: '2px' // Fine-tune alignment
              }}>
                {/* Title with Status Badge */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem',
                  marginBottom: '0.5rem'
                }}>
                  <h3 style={{
                    fontSize: '2.2rem',
                    fontWeight: 300,
                    margin: 0,
                    color: '#ffffff',
                    letterSpacing: '-0.01em'
                  }}>
                    {step.title}
                  </h3>
                  
                  {step.status === 'current' && (
                    <motion.div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.4rem 1.2rem',
                        background: 'linear-gradient(135deg, rgba(0, 255, 157, 0.1), rgba(0, 200, 255, 0.1))',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(0, 255, 157, 0.2)',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        color: '#00ff9d',
                        fontWeight: 500,
                        letterSpacing: '1px'
                      }}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ 
                        delay: 0.5,
                        duration: 0.3 
                      }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <motion.div
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: 'radial-gradient(circle, #00ff9d, #00ccff)',
                          boxShadow: '0 0 10px #00ff9d'
                        }}
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [1, 0.7, 1]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity
                        }}
                      />
                      TRANSMITTING
                    </motion.div>
                  )}
                </div>
                
                {/* Date and Status */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem',
                  marginTop: '0.5rem'
                }}>
                  <span style={{
                    fontSize: '1.1rem',
                    fontFamily: 'monospace',
                    fontWeight: 400,
                    color: '#ffffff',
                    opacity: 0.7,
                    letterSpacing: '1px'
                  }}>
                    {step.date}
                  </span>
                  
                  <div style={{
                    height: '1px',
                    width: '40px',
                    background: 'rgba(255, 255, 255, 0.2)'
                  }} />
                  
                  <span style={{ 
                    fontSize: '1.1rem', 
                    color: '#ffffff',
                    fontWeight: 400,
                    opacity: step.status === 'pending' ? 0.4 : 0.8
                  }}>
                    {step.status === 'completed' && 'Completed'}
                    {step.status === 'current' && 'Live'}
                    {step.status === 'pending' && 'Upcoming'}
                  </span>
                </div>
              </div>

              {/* Modern Arrow for Current Step */}
              {step.status === 'current' && (
                <motion.div
                  style={{
                    marginLeft: '2rem',
                    opacity: 0.8
                  }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 0.8, x: 0 }}
                  transition={{ delay: 0.8 }}
                  whileHover={{ opacity: 1 }}
                >
                  <div style={{
                    padding: '0.8rem',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <SouthEastArrow />
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Footer Note - Modern Style */}
        <motion.div
          style={{
            marginTop: '5rem',
            paddingTop: '3rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            fontSize: '0.9rem',
            color: 'rgba(255, 255, 255, 0.5)',
            fontWeight: 300,
            letterSpacing: '1px'
          }}>
            <motion.div
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #00ff9d, transparent)',
                boxShadow: '0 0 10px #00ff9d'
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [1, 0.5, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity
              }}
            />
            REAL-TIME UPDATES • MINIMALIST DESIGN • ACTIVE TRANSMISSION
            <motion.div
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #00ff9d, transparent)',
                boxShadow: '0 0 10px #00ff9d'
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [1, 0.5, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 1
              }}
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
