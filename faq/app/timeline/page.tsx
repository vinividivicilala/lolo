'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function TimelinePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedStep, setSelectedStep] = useState(null);
  const [notification, setNotification] = useState(null);
  const [timelineSteps, setTimelineSteps] = useState([
    { 
      id: 1,
      title: 'Research & Discovery', 
      date: 'Q1 2024', 
      status: 'completed',
      pageContent: 'Halaman untuk Research & Discovery - Kosong'
    },
    { 
      id: 2,
      title: 'Concept Design', 
      date: 'Q2 2024', 
      status: 'completed',
      pageContent: 'Halaman untuk Concept Design - Kosong'
    },
    { 
      id: 3,
      title: 'Development Phase', 
      date: 'Q3 2024', 
      status: 'current',
      pageContent: 'Halaman untuk Development Phase - Kosong'
    },
    { 
      id: 4,
      title: 'Testing & QA', 
      date: 'Q4 2024', 
      status: 'pending',
      pageContent: 'Halaman untuk Testing & QA - Kosong'
    },
    { 
      id: 5,
      title: 'Launch', 
      date: 'Q1 2025', 
      status: 'pending',
      pageContent: 'Halaman untuk Launch - Kosong'
    },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < timelineSteps.length - 1 ? prev + 1 : 0));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Notification system
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type, id: Date.now() });
    setTimeout(() => setNotification(null), 5000);
  };

  const updateTimelineData = (stepId, updatedData) => {
    setTimelineSteps(prev => 
      prev.map(step => 
        step.id === stepId ? { ...step, ...updatedData } : step
      )
    );
    
    showNotification(`🚀 Timeline updated by admin faridardiansyah061@gmail.com`, 'update');
    console.log(`🔄 Timeline update broadcast to all users - Admin: faridardiansyah061@gmail.com`);
  };

  // North West Arrow Component
  const NorthWestArrow = () => (
    <svg 
      width="64" 
      height="64" 
      viewBox="0 0 64 64" 
      fill="none" 
      stroke="#ffffff" 
      strokeWidth="3"
    >
      <path 
        d="M48 16L16 16M16 16V48M16 16L48 48" 
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

  // Admin Controls Component
  const AdminControls = ({ step }) => {
    const isAdmin = true;
    const adminEmail = "faridardiansyah061@gmail.com";

    if (!isAdmin) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          position: 'absolute',
          bottom: '2rem',
          right: '2rem',
          display: 'flex',
          gap: '1rem',
          zIndex: 100
        }}
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => updateTimelineData(step.id, { status: 'completed' })}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'rgba(0,255,157,0.1)',
            border: '1px solid #00ff9d',
            borderRadius: '4px',
            color: '#00ff9d',
            cursor: 'pointer',
            fontSize: '0.9rem',
            backdropFilter: 'blur(10px)'
          }}
        >
          Mark Complete
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => updateTimelineData(step.id, { status: 'current' })}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '4px',
            color: '#ffffff',
            cursor: 'pointer',
            fontSize: '0.9rem',
            backdropFilter: 'blur(10px)'
          }}
        >
          Set In Progress
        </motion.button>
      </motion.div>
    );
  };

  // Full Page Component
  const FullPagePanel = ({ step, isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: '50%' }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ 
            duration: 0.5,
            ease: [0.4, 0, 0.2, 1]
          }}
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: '50vh',
            backgroundColor: '#000000',
            borderTop: '2px solid #00ff9d',
            boxShadow: '0 -20px 40px rgba(0,255,157,0.1)',
            zIndex: 1000,
            overflow: 'hidden'
          }}
        >
          {/* Background Grid */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'linear-gradient(rgba(0,255,157,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,157,0.05) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            opacity: 0.2
          }} />

          <div style={{
            position: 'relative',
            zIndex: 2,
            padding: '3rem',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2rem'
              }}>
                <span style={{
                  fontSize: '3rem',
                  fontFamily: 'monospace',
                  color: '#00ff9d',
                  fontWeight: 600,
                  textShadow: '0 0 20px rgba(0,255,157,0.3)'
                }}>
                  {String(step.id).padStart(2, '0')}
                </span>
                <h2 style={{
                  fontSize: '2.5rem',
                  fontWeight: 400,
                  margin: 0,
                  color: '#ffffff'
                }}>
                  {step.title}
                </h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#ffffff',
                  fontSize: '1.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)'
                }}
              >
                ×
              </motion.button>
            </div>

            {/* Content - KOSONG */}
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{
                fontSize: '5rem',
                opacity: 0.2,
                color: '#ffffff'
              }}>
                ○
              </div>
              <p style={{
                fontSize: '1.5rem',
                opacity: 0.5,
                color: '#ffffff',
                fontFamily: 'monospace'
              }}>
                {step.pageContent}
              </p>
              <div style={{
                width: '200px',
                height: '1px',
                background: 'linear-gradient(90deg, transparent, #00ff9d, transparent)',
                marginTop: '1rem'
              }} />
            </div>

            {/* Admin Controls */}
            <AdminControls step={step} />
          </div>
        </motion.div>
      </AnimatePresence>
    );
  };

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
      
      {/* Notification Component */}
      <AnimatePresence>
        {notification && (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            style={{
              position: 'fixed',
              top: '2rem',
              right: '2rem',
              padding: '1rem 2rem',
              background: 'rgba(0,0,0,0.9)',
              border: '1px solid #00ff9d',
              borderRadius: '8px',
              backdropFilter: 'blur(10px)',
              zIndex: 2000,
              color: '#ffffff',
              boxShadow: '0 0 30px rgba(0,255,157,0.2)',
              borderLeft: '4px solid #00ff9d'
            }}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* North West Arrow - Halaman Utama */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        onClick={() => router.push('/')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '1.5rem',
          marginBottom: '3rem',
          padding: '1rem 2rem',
          cursor: 'pointer',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          background: 'rgba(255,255,255,0.02)',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease',
          position: 'relative',
          zIndex: 10
        }}
        whileHover={{
          borderColor: '#00ff9d',
          background: 'rgba(0,255,157,0.05)',
          scale: 1.02
        }}
      >
        <NorthWestArrow />
        <span style={{
          fontSize: '2.8rem',
          fontWeight: 600,
          letterSpacing: '4px',
          color: '#ffffff',
          textTransform: 'uppercase',
          textShadow: '0 0 20px rgba(255,255,255,0.3)'
        }}>
          Halaman Utama
        </span>
        <span style={{
          fontSize: '1.2rem',
          opacity: 0.7,
          color: '#00ff9d',
          marginLeft: '1rem'
        }}>
          ← Kembali
        </span>
      </motion.div>

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
              key={step.id}
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
              {/* Kolom 1: Angka dengan efek bayangan */}
              <div style={{
                width: '150px',
                display: 'flex',
                justifyContent: 'flex-end',
                paddingRight: '40px',
                position: 'relative'
              }}>
                <motion.div
                  whileHover={{ 
                    scale: 1.2,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedStep(selectedStep === step.id ? null : step.id)}
                  style={{
                    cursor: 'pointer',
                    position: 'relative',
                    padding: '0.5rem'
                  }}
                >
                  {/* Shadow effect - Lebih besar */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '120px',
                    height: '120px',
                    background: `radial-gradient(circle, ${
                      selectedStep === step.id 
                        ? 'rgba(0,255,157,0.4)' 
                        : step.status === 'completed' 
                          ? 'rgba(255,255,255,0.2)' 
                          : 'rgba(255,255,255,0.1)'
                    } 0%, transparent 70%)`,
                    borderRadius: '50%',
                    filter: 'blur(20px)',
                    opacity: selectedStep === step.id ? 0.8 : 0.4,
                    transition: 'all 0.3s ease'
                  }} />
                  
                  <div style={{
                    fontSize: '2rem',
                    fontFamily: 'monospace',
                    fontWeight: 600,
                    color: selectedStep === step.id ? '#00ff9d' : '#ffffff',
                    opacity: step.status === 'pending' ? 0.5 : 1,
                    textShadow: selectedStep === step.id 
                      ? '0 0 30px rgba(0,255,157,0.8)' 
                      : 'none',
                    position: 'relative',
                    zIndex: 2,
                    transition: 'all 0.3s ease'
                  }}>
                    {String(index + 1).padStart(2, '0')}
                  </div>
                </motion.div>
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
                  ) : step.status === 'completed' ? (
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: '#ffffff',
                      boxShadow: '0 0 15px rgba(255,255,255,0.8)'
                    }} />
                  ) : (
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: '#ffffff',
                      boxShadow: '0 0 15px rgba(255,255,255,0.8)',
                      opacity: 0.5
                    }} />
                  )}
                </div>

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
                      color: selectedStep === step.id ? '#00ff9d' : '#ffffff',
                      transition: 'color 0.3s ease'
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
                    {step.status === 'completed' && '✓ Completed'}
                    {step.status === 'current' && '⚡ In Progress'}
                    {step.status === 'pending' && '○ Upcoming'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Full Page Panel - Setengah Layar Bawah */}
      <FullPagePanel 
        step={timelineSteps.find(s => s.id === selectedStep)} 
        isOpen={selectedStep !== null}
        onClose={() => setSelectedStep(null)}
      />
    </div>
  );
}
