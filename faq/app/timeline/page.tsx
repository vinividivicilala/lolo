'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function TimelinePage() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  
  const timelineSteps = [
    { title: 'Research & Discovery', date: 'Jan 2024' },
    { title: 'Concept Design', date: 'Mar 2024' },
    { title: 'Development', date: 'Jun 2024' },
    { title: 'Testing Phase', date: 'Sep 2024' },
    { title: 'Launch Preparation', date: 'Dec 2024' },
  ];

  useEffect(() => {
    setActiveIndex(timelineSteps.length - 1);
  }, []);

  const SouthEastArrow = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M7 7l10 10m0 0V7m0 10H7" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const BlinkingDot = ({ isActive, size = 16 }) => (
    <motion.div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: isActive ? '#ffffff' : 'rgba(255,255,255,0.1)',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      animate={isActive ? {
        boxShadow: [
          '0 0 0 0 rgba(255,255,255,0.7)',
          '0 0 0 12px rgba(255,255,255,0)',
        ]
      } : {}}
      transition={isActive ? {
        duration: 1.2,
        repeat: Infinity,
        ease: "easeOut"
      } : {}}
    >
      {isActive && (
        <motion.div
          style={{
            width: size * 0.3,
            height: size * 0.3,
            borderRadius: '50%',
            backgroundColor: '#000000'
          }}
          animate={{
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            times: [0, 0.5, 1],
            ease: "easeInOut"
          }}
        />
      )}
    </motion.div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000000',
      color: '#ffffff',
      padding: '2rem',
      fontFamily: 'Helvetica, Arial, sans-serif',
    }}>
      <motion.button
        onClick={() => router.back()}
        style={{
          padding: '0.75rem 1.25rem',
          backgroundColor: 'transparent',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '4px',
          color: 'white',
          cursor: 'pointer',
          marginBottom: '3rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem'
        }}
        whileHover={{ borderColor: 'rgba(255,255,255,0.3)' }}
        whileTap={{ scale: 0.98 }}
      >
        ← Back
      </motion.button>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <h1 style={{ 
          fontSize: 'clamp(2rem, 4vw, 3rem)', 
          marginBottom: '0.25rem',
          fontWeight: 300,
          letterSpacing: '-0.02em'
        }}>
          Timeline
        </h1>
        
        <p style={{ 
          fontSize: '0.95rem', 
          opacity: 0.6,
          marginBottom: '4rem'
        }}>
          Current development status
        </p>

        {/* Timeline Container */}
        <div style={{
          position: 'relative',
          maxWidth: '700px',
          margin: '0 auto'
        }}>
          
          {/* Vertical Dotted Line */}
          <div style={{
            position: 'absolute',
            left: '19px',
            top: '30px',
            bottom: '30px',
            width: '1px',
            background: 'linear-gradient(to bottom, 
              transparent, 
              transparent 50%, 
              rgba(255,255,255,0.2) 50%, 
              rgba(255,255,255,0.2)
            )',
            backgroundSize: '1px 20px'
          }} />

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
                marginBottom: '3.5rem',
                position: 'relative'
              }}
            >
              {/* Step Indicator */}
              <div style={{
                position: 'relative',
                width: '40px',
                marginRight: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                {/* Step Number */}
                <div style={{
                  fontSize: '0.75rem',
                  opacity: index === activeIndex ? 1 : 0.4,
                  marginBottom: '0.75rem',
                  fontFamily: 'monospace'
                }}>
                  {String(index + 1).padStart(2, '0')}
                </div>

                {/* Blinking Dot */}
                <div style={{ position: 'relative' }}>
                  <BlinkingDot 
                    isActive={index === activeIndex} 
                    size={index === activeIndex ? 18 : 12}
                  />
                  
                  {/* Connection dot untuk non-active */}
                  {!isActive && (
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '4px',
                      height: '4px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255,255,255,0.2)'
                    }} />
                  )}
                </div>

                {/* Southeast Arrow hanya untuk yang aktif */}
                {index === activeIndex && (
                  <motion.div
                    style={{
                      marginTop: '0.75rem',
                      opacity: 0.9
                    }}
                    animate={{ 
                      x: [0, 4, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <SouthEastArrow />
                  </motion.div>
                )}
              </div>

              {/* Step Content */}
              <div style={{
                flex: 1,
                paddingTop: '0.25rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '0.25rem'
                }}>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: 400,
                    margin: 0,
                    opacity: index === activeIndex ? 1 : 0.5
                  }}>
                    {step.title}
                  </h3>
                  
                  {index === activeIndex && (
                    <motion.div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.2rem 0.75rem',
                        backgroundColor: 'rgba(255,255,255,0.08)',
                        borderRadius: '12px',
                        fontSize: '0.7rem',
                        letterSpacing: '0.05em'
                      }}
                      animate={{ 
                        backgroundColor: [
                          'rgba(255,255,255,0.08)',
                          'rgba(255,255,255,0.12)',
                          'rgba(255,255,255,0.08)'
                        ]
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <motion.div
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: '#ffffff'
                        }}
                        animate={{ 
                          scale: [1, 1.2, 1],
                          opacity: [1, 0.7, 1]
                        }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      />
                      ACTIVE
                    </motion.div>
                  )}
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  opacity: index === activeIndex ? 0.9 : 0.4
                }}>
                  <span style={{
                    fontSize: '0.8rem',
                    fontFamily: 'monospace'
                  }}>
                    {step.date}
                  </span>
                  
                  {index === activeIndex && (
                    <>
                      <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>•</span>
                      <motion.span 
                        style={{ fontSize: '0.8rem' }}
                        animate={{ opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        In progress
                      </motion.span>
                    </>
                  )}
                </div>

                {/* Active Step Details */}
                {index === activeIndex && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ delay: 0.3 }}
                    style={{
                      marginTop: '1.5rem',
                      padding: '1.5rem',
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: '4px',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Pulsing Border Effect */}
                    <motion.div
                      style={{
                        position: 'absolute',
                        top: -1,
                        left: -1,
                        right: -1,
                        bottom: -1,
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '5px'
                      }}
                      animate={{ 
                        borderColor: [
                          'rgba(255,255,255,0.1)',
                          'rgba(255,255,255,0.2)',
                          'rgba(255,255,255,0.1)'
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    
                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '1rem'
                      }}>
                        <motion.div
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: '#ffffff'
                          }}
                          animate={{ 
                            scale: [1, 1.5, 1],
                          }}
                          transition={{ 
                            duration: 1.5, 
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                        <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                          Current Focus
                        </span>
                      </div>
                      
                      <p style={{
                        fontSize: '0.875rem',
                        opacity: 0.8,
                        lineHeight: 1.6,
                        margin: 0
                      }}>
                        Finalizing deployment pipeline and preparing for launch. 
                        All systems are in active development with continuous integration.
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
