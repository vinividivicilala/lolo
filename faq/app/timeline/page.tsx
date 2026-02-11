'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

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
      status: 'completed'
    },
    { 
      id: 2,
      title: 'Concept Design', 
      date: 'Q2 2024', 
      status: 'completed'
    },
    { 
      id: 3,
      title: 'Development Phase', 
      date: 'Q3 2024', 
      status: 'current'
    },
    { 
      id: 4,
      title: 'Testing & QA', 
      date: 'Q4 2024', 
      status: 'pending'
    },
    { 
      id: 5,
      title: 'Launch', 
      date: 'Q1 2025', 
      status: 'pending'
    },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < timelineSteps.length - 1 ? prev + 1 : 0));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Notification system
  const showNotification = (message) => {
    setNotification({ message, id: Date.now() });
    setTimeout(() => setNotification(null), 5000);
  };

  const updateTimelineData = (stepId, updatedData) => {
    setTimelineSteps(prev => 
      prev.map(step => 
        step.id === stepId ? { ...step, ...updatedData } : step
      )
    );
    showNotification(`🚀 Timeline updated by admin faridardiansyah061@gmail.com`);
    console.log(`🔄 Timeline update broadcast to all users - Admin: faridardiansyah061@gmail.com`);
  };

  // North West Arrow Component
  const NorthWestArrow = () => (
    <svg 
      width="48" 
      height="48" 
      viewBox="0 0 48 48" 
      fill="none" 
      stroke="#ffffff" 
      strokeWidth="2.5"
    >
      <path 
        d="M32 16L16 16M16 16V32M16 16L32 32" 
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

  // Admin Controls
  const AdminControls = ({ step }) => {
    return (
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        display: 'flex',
        gap: '10px',
        zIndex: 100
      }}>
        <button
          onClick={() => updateTimelineData(step.id, { status: 'completed' })}
          style={{
            padding: '8px 16px',
            background: 'rgba(0,255,157,0.1)',
            border: '1px solid #00ff9d',
            borderRadius: '4px',
            color: '#00ff9d',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Mark Complete
        </button>
        <button
          onClick={() => updateTimelineData(step.id, { status: 'current' })}
          style={{
            padding: '8px 16px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '4px',
            color: '#ffffff',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Set In Progress
        </button>
      </div>
    );
  };

  // Halaman Kedua - Muncul di atas halaman utama
  const SecondPage = ({ step, isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#000000',
        zIndex: 9999,
        overflow: 'hidden'
      }}>
        {/* Background Grid - Sama seperti halaman utama */}
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

        {/* Halaman Utama Link - Sama persis */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '15px',
          margin: '40px',
          position: 'relative',
          zIndex: 10
        }}>
          <NorthWestArrow />
          <span style={{
            fontSize: '24px',
            fontWeight: 500,
            letterSpacing: '2px',
            color: '#ffffff'
          }}>
            HALAMAN UTAMA
          </span>
        </div>

        {/* Nomor Halaman */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '120px',
          fontFamily: 'monospace',
          fontWeight: 600,
          color: 'rgba(255,255,255,0.05)',
          zIndex: 5,
          letterSpacing: '-5px'
        }}>
          {String(step.id).padStart(2, '0')}
        </div>

        {/* Tombol Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '40px',
            right: '40px',
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#ffffff',
            fontSize: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 100
          }}
        >
          ×
        </button>

        {/* Admin Controls */}
        <AdminControls step={step} />
      </div>
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#000000',
      color: '#ffffff',
      padding: '40px',
      fontFamily: 'Helvetica, Arial, sans-serif',
      position: 'relative'
    }}>
      
      {/* Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '12px 24px',
          background: '#000000',
          border: '1px solid #00ff9d',
          borderRadius: '4px',
          zIndex: 10000,
          color: '#ffffff',
          fontSize: '14px',
          borderLeft: '4px solid #00ff9d'
        }}>
          {notification.message}
        </div>
      )}

      {/* Background Grid */}
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

      {/* Halaman Utama - Tanpa border box dan teks tambahan */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '15px',
        marginBottom: '40px',
        position: 'relative',
        zIndex: 10
      }}>
        <NorthWestArrow />
        <span style={{
          fontSize: '24px',
          fontWeight: 500,
          letterSpacing: '2px',
          color: '#ffffff'
        }}>
          HALAMAN UTAMA
        </span>
      </div>

      <div style={{ position: 'relative', zIndex: 10 }}>
        <h1 style={{ 
          fontSize: '48px', 
          marginBottom: '10px',
          fontWeight: 300,
          letterSpacing: '-1px',
          color: '#ffffff'
        }}>
          Project Timeline
        </h1>
        
        <p style={{ 
          fontSize: '16px', 
          opacity: 0.7,
          marginBottom: '60px',
          maxWidth: '600px',
          color: '#ffffff'
        }}>
          Development progress visualized through minimalist timeline with real-time status indicators
        </p>

        {/* Timeline Container */}
        <div style={{
          position: 'relative',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          
          {/* Timeline Steps */}
          {timelineSteps.map((step, index) => (
            <div
              key={step.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '60px',
                position: 'relative',
                minHeight: '80px'
              }}
            >
              {/* Kolom 1: Angka */}
              <div style={{
                width: '150px',
                display: 'flex',
                justifyContent: 'flex-end',
                paddingRight: '40px',
                position: 'relative'
              }}>
                <div
                  onClick={() => setSelectedStep(step.id)}
                  style={{
                    cursor: 'pointer',
                    position: 'relative',
                    padding: '10px'
                  }}
                >
                  {/* Shadow Hitam */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '100px',
                    height: '100px',
                    backgroundColor: '#000000',
                    boxShadow: '0 0 50px rgba(0,0,0,0.8)',
                    borderRadius: '50%',
                    opacity: 0.9
                  }} />
                  
                  <div style={{
                    fontSize: '24px',
                    fontFamily: 'monospace',
                    fontWeight: 500,
                    color: '#ffffff',
                    opacity: step.status === 'pending' ? 0.5 : 1,
                    position: 'relative',
                    zIndex: 2
                  }}>
                    {String(index + 1).padStart(2, '0')}
                  </div>
                </div>
              </div>

              {/* Kolom 2: Titik */}
              <div style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '140px',
                height: '80px'
              }}>
                <div style={{
                  color: '#ffffff',
                  fontSize: '12px',
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
                  ••••••••••••••••••
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
                  ) : (
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: '#ffffff',
                      opacity: step.status === 'pending' ? 0.3 : 0.8
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
                    fontSize: '12px',
                    letterSpacing: '4px',
                    fontFamily: 'monospace',
                    opacity: 0.6,
                    marginLeft: '25px'
                  }}>
                    ••••••••••••
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
                  marginBottom: '10px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px'
                  }}>
                    <h3 style={{
                      fontSize: '24px',
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
                        gap: '8px',
                        padding: '6px 16px',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        borderRadius: '20px',
                        fontSize: '12px',
                        color: '#ffffff'
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
                    opacity: step.status === 'pending' ? 0.3 : 0.8,
                    marginLeft: '20px'
                  }}>
                    <SoutheastArrow />
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px'
                }}>
                  <span style={{
                    fontSize: '16px',
                    fontFamily: 'monospace',
                    color: '#ffffff',
                    opacity: 0.9
                  }}>
                    {step.date}
                  </span>
                  
                  <span style={{ 
                    fontSize: '16px', 
                    color: '#ffffff',
                    opacity: step.status === 'pending' ? 0.5 : 0.8
                  }}>
                    {step.status === 'completed' && '✓ Completed'}
                    {step.status === 'current' && '⚡ In Progress'}
                    {step.status === 'pending' && '○ Upcoming'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Second Page - Full screen di atas halaman utama */}
      {selectedStep && (
        <SecondPage 
          step={timelineSteps.find(s => s.id === selectedStep)} 
          isOpen={selectedStep !== null}
          onClose={() => setSelectedStep(null)}
        />
      )}
    </div>
  );
}
