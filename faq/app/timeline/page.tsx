'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function TimelinePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedStep, setSelectedStep] = useState(null);
  const [notifications, setNotifications] = useState([]);
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

  // Notification Bell Icon
  const NotificationBell = ({ hasNotification }) => (
    <svg 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="#ffffff" 
      strokeWidth="2"
    >
      <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 17V18C9 18.7956 9.31607 19.5587 9.87868 20.1213C10.4413 20.6839 11.2044 21 12 21C12.7956 21 13.5587 20.6839 14.1213 20.1213C14.6839 19.5587 15 18.7956 15 18V17" strokeLinecap="round" strokeLinejoin="round"/>
      {hasNotification && (
        <circle cx="20" cy="4" r="3" fill="#ff4d4d" stroke="none" />
      )}
    </svg>
  );

  // Admin Notification Panel
  const NotificationPanel = () => {
    const addNotification = (message) => {
      const newNotification = {
        id: Date.now(),
        message,
        timestamp: new Date().toLocaleTimeString(),
        read: false
      };
      setNotifications([newNotification, ...notifications]);
      
      localStorage.setItem('timelineNotification', JSON.stringify({
        ...newNotification,
        admin: 'faridardiansyah061@gmail.com'
      }));
    };

    useEffect(() => {
      const handleStorageChange = (e) => {
        if (e.key === 'timelineNotification' && e.newValue) {
          const notification = JSON.parse(e.newValue);
          setNotifications(prev => [notification, ...prev]);
        }
      };

      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return (
      <div style={{
        position: 'fixed',
        top: '2rem',
        right: '2rem',
        zIndex: 1000,
        maxWidth: '400px',
        width: '100%'
      }}>
        {/* Admin Controls */}
        <div style={{
          marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <NotificationBell hasNotification={notifications.some(n => !n.read)} />
            <span style={{ fontSize: '1.1rem', fontWeight: 500 }}>Admin Panel</span>
            <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>faridardiansyah061@gmail.com</span>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => addNotification('Timeline updated: Development Phase 65% complete')}
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'rgba(0,255,157,0.1)',
                border: '1px solid rgba(0,255,157,0.3)',
                borderRadius: '4px',
                color: '#00ff9d',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Update Progress
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => addNotification('New milestone: Testing phase scheduled')}
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '4px',
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Schedule Update
            </motion.button>
          </div>
        </div>

        {/* Notifications List */}
        <div style={{
          backgroundColor: '#000000',
          maxHeight: '300px',
          overflowY: 'auto'
        }}>
          {notifications.length === 0 ? (
            <div style={{ padding: '1.5rem 0', textAlign: 'center', opacity: 0.5 }}>
              No notifications
            </div>
          ) : (
            notifications.map((notif) => (
              <div 
                key={notif.id}
                style={{
                  padding: '1rem 0',
                  borderBottom: '1px solid rgba(255,255,255,0.05)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.85rem', color: '#00ff9d' }}>Admin Update</span>
                  <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>{notif.timestamp}</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.95rem' }}>{notif.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

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

      {/* Notification Panel */}
      <NotificationPanel />

      {/* Main Content */}
      <div style={{ position: 'relative', zIndex: 10, maxWidth: '1400px', margin: '0 auto' }}>
        
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
                    marginBottom: selectedStep === step.id ? '2rem' : '4rem',
                    position: 'relative',
                    minHeight: '100px',
                    cursor: 'pointer',
                    transition: 'margin-bottom 0.2s ease'
                  }}
                  onClick={() => handleStepClick(step.id)}
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

                    {/* Titik Bulat Pemancar */}
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
                    {/* Judul dengan Arrow di Sisi Kanan */}
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
                      
                      {/* Southeast Arrow */}
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
                </motion.div>

                {/* BLACK SHADOW PAGE - Halaman Utama yang Memanfaatkan Ruang Kosong */}
                {selectedStep === step.id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      marginLeft: '190px',
                      marginBottom: '4rem',
                      marginTop: '-1rem',
                      padding: '2rem 0 2rem 2rem',
                      backgroundColor: '#000000',
                      position: 'relative',
                      color: '#ffffff'
                    }}
                  >
                    {/* Page Number - Very Subtle */}
                    <div style={{
                      position: 'absolute',
                      bottom: '1rem',
                      right: '0',
                      fontSize: '0.7rem',
                      opacity: 0.15,
                      fontFamily: 'monospace',
                      letterSpacing: '2px'
                    }}>
                      {String(step.id).padStart(2, '0')} / 05
                    </div>

                    {/* Main Content - Clean, No Borders, No Boxes */}
                    <div style={{ maxWidth: '800px' }}>
                      <div style={{
                        fontSize: '2.8rem',
                        fontWeight: 300,
                        marginBottom: '1.5rem',
                        color: '#ffffff',
                        opacity: 0.9
                      }}>
                        {step.title}
                      </div>
                      
                      <p style={{
                        fontSize: '1.3rem',
                        lineHeight: '1.6',
                        opacity: 0.8,
                        marginBottom: '2.5rem',
                        color: '#ffffff'
                      }}>
                        {step.details}
                      </p>
                      
                      {/* Simple Info Lines - No Cards */}
                      <div style={{ marginTop: '2rem' }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'baseline',
                          marginBottom: '0.75rem'
                        }}>
                          <span style={{ 
                            fontSize: '0.9rem', 
                            opacity: 0.4, 
                            width: '100px',
                            fontFamily: 'monospace'
                          }}>
                            TIMELINE
                          </span>
                          <span style={{ 
                            fontSize: '1.2rem', 
                            fontFamily: 'monospace',
                            opacity: 0.9
                          }}>
                            {step.date}
                          </span>
                        </div>
                        
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'baseline',
                          marginBottom: '0.75rem'
                        }}>
                          <span style={{ 
                            fontSize: '0.9rem', 
                            opacity: 0.4, 
                            width: '100px',
                            fontFamily: 'monospace'
                          }}>
                            STATUS
                          </span>
                          <span style={{ 
                            fontSize: '1.2rem',
                            color: step.status === 'completed' ? '#ffffff' : 
                                   step.status === 'current' ? '#00ff9d' : '#666666',
                            opacity: 0.9
                          }}>
                            {step.status.toUpperCase()}
                          </span>
                        </div>
                        
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'baseline'
                        }}>
                          <span style={{ 
                            fontSize: '0.9rem', 
                            opacity: 0.4, 
                            width: '100px',
                            fontFamily: 'monospace'
                          }}>
                            MILESTONE
                          </span>
                          <span style={{ 
                            fontSize: '1.2rem', 
                            fontFamily: 'monospace',
                            opacity: 0.9
                          }}>
                            MS-{step.id * 100}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </React.Fragment>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
