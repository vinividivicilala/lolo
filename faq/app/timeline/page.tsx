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
          
          {/* Animated Timeline Line */}
          <div style={{
            position: 'absolute',
            left: '50px',
            top: '0',
            bottom: '0',
            width: '2px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            overflow: 'hidden'
          }}>
            {/* Animated Line Glow */}
            <motion.div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(255,255,255,0.8)',
                boxShadow: '0 0 10px rgba(255,255,255,0.5)'
              }}
              animate={{ y: ['0%', '100%', '0%'] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
          </div>

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
                position: 'relative'
              }}
            >
              {/* Step Indicator */}
              <div style={{
                position: 'relative',
                width: '100px',
                display: 'flex',
                justifyContent: 'center'
              }}>
                
                {/* Connection Line */}
                <div style={{
                  width: '40px',
                  height: '2px',
                  backgroundColor: step.status === 'completed' ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.1)',
                  position: 'absolute',
                  right: '0',
                  top: '50%',
                  transform: 'translateY(-50%)'
                }} />
                
                {/* Animated Dot */}
                <motion.div
                  style={{
                    width: step.status === 'current' ? '20px' : '12px',
                    height: step.status === 'current' ? '20px' : '12px',
                    borderRadius: '50%',
                    backgroundColor: step.status === 'completed' ? '#ffffff' : 
                                    step.status === 'current' ? '#ffffff' : 'rgba(255,255,255,0.1)',
                    border: step.status === 'current' ? '2px solid rgba(255,255,255,0.8)' : 'none',
                    position: 'relative',
                    zIndex: 2
                  }}
                  animate={
                    step.status === 'current' ? {
                      boxShadow: [
                        '0 0 0 0 rgba(255,255,255,0.2)',
                        '0 0 0 10px rgba(255,255,255,0)',
                        '0 0 0 0 rgba(255,255,255,0)'
                      ]
                    } : {}
                  }
                  transition={
                    step.status === 'current' ? {
                      duration: 1.5,
                      repeat: Infinity
                    } : {}
                  }
                >
                  {/* Blinking Inner Dot */}
                  {step.status === 'current' && (
                    <motion.div
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '4px',
                        height: '4px',
                        borderRadius: '50%',
                        backgroundColor: '#000000'
                      }}
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    />
                  )}
                </motion.div>

                {/* Step Number */}
                <div style={{
                  position: 'absolute',
                  left: '-40px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '0.875rem',
                  opacity: 0.5
                }}>
                  {String(index + 1).padStart(2, '0')}
                </div>
              </div>

              {/* Step Content */}
              <div style={{
                flex: 1,
                paddingLeft: '2rem'
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
                      IN PROGRESS
                    </motion.div>
                  )}
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  opacity: 0.7
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

              {/* Southeast Arrow for current step */}
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

          {/* Progress Indicator */}
          <motion.div
            style={{
              marginTop: '4rem',
              padding: '2rem',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '4px',
              position: 'relative',
              overflow: 'hidden'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <span style={{ fontSize: '0.875rem', opacity: 0.7 }}>OVERALL PROGRESS</span>
              <span style={{ fontSize: '0.875rem', fontFamily: 'monospace' }}>
                {Math.round((timelineSteps.filter(s => s.status === 'completed').length / timelineSteps.length) * 100)}%
              </span>
            </div>
            
            {/* Progress Bar */}
            <div style={{
              height: '2px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: '1px',
              overflow: 'hidden'
            }}>
              <motion.div
                style={{
                  height: '100%',
                  backgroundColor: '#ffffff',
                  width: `${(timelineSteps.filter(s => s.status === 'completed').length / timelineSteps.length) * 100}%`
                }}
                initial={{ width: 0 }}
                animate={{ width: `${(timelineSteps.filter(s => s.status === 'completed').length / timelineSteps.length) * 100}%` }}
                transition={{ duration: 1, delay: 0.2 }}
              />
            </div>

            {/* Animated Dots in Progress Bar */}
            <motion.div
              style={{
                position: 'absolute',
                top: '50%',
                left: '0%',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                transform: 'translateY(-50%)'
              }}
              animate={{
                left: `${(timelineSteps.filter(s => s.status === 'completed').length / timelineSteps.length) * 100}%`,
                opacity: [1, 0, 1]
              }}
              transition={{
                left: { duration: 1, delay: 0.2 },
                opacity: { duration: 1, repeat: Infinity }
              }}
            />
          </motion.div>
        </div>

        {/* Footer Note */}
        <motion.div
          style={{
            marginTop: '4rem',
            textAlign: 'center',
            opacity: 0.5,
            fontSize: '0.875rem'
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 1 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <motion.div
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#ffffff'
              }}
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            Real-time status updates • Minimalist visualization • Active development tracking
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
