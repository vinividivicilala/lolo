'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function TimelinePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedStep, setSelectedStep] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [selectedTimelineForNotification, setSelectedTimelineForNotification] = useState(3);
  
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

  // Notification Bell Icon with Counter
  const NotificationBell = ({ count }) => (
    <div style={{ position: 'relative', display: 'inline-block' }}>
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
      </svg>
      {count > 0 && (
        <div style={{
          position: 'absolute',
          top: '-8px',
          right: '-8px',
          backgroundColor: '#ff4d4d',
          color: 'white',
          borderRadius: '50%',
          width: '18px',
          height: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '11px',
          fontWeight: 'bold'
        }}>
          {count}
        </div>
      )}
    </div>
  );

  // Admin Notification Panel - Only Timeline Updates
  const NotificationPanel = () => {
    const unreadCount = notifications.filter(n => !n.read).length;
    
    const addNotification = (timelineId) => {
      const step = timelineSteps.find(s => s.id === timelineId);
      const progressMessages = {
        1: 'Research phase completed with 200+ user interviews',
        2: 'Design system finalized with 50+ components',
        3: `Development ${Math.floor(Math.random() * 30) + 50}% complete - API integration ongoing`,
        4: 'Testing environment prepared, test cases written',
        5: 'Launch preparation: documentation and deployment strategy'
      };
      
      const message = `Timeline Update - ${step.title}: ${progressMessages[timelineId]}`;
      
      const newNotification = {
        id: Date.now(),
        message,
        timestamp: new Date().toLocaleTimeString(),
        read: false,
        timelineId: timelineId,
        admin: 'faridardiansyah061@gmail.com'
      };
      setNotifications([newNotification, ...notifications]);
      
      localStorage.setItem('timelineNotification', JSON.stringify(newNotification));
    };

    const markAsRead = (id) => {
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
    };

    const markAllAsRead = () => {
      setNotifications(notifications.map(n => ({ ...n, read: true })));
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
        maxWidth: '420px',
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '12px',
        padding: '1.5rem'
      }}>
        {/* Admin Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          paddingBottom: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <NotificationBell count={unreadCount} />
            <div>
              <span style={{ fontSize: '1.1rem', fontWeight: 600, display: 'block' }}>
                Timeline Updates
              </span>
              <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>
                faridardiansyah061@gmail.com
              </span>
            </div>
          </div>
          
          {unreadCount > 0 && (
            <motion.button
              whileHover={{ opacity: 0.8 }}
              onClick={markAllAsRead}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#ffffff',
                padding: '0.4rem 0.8rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              Mark all read
            </motion.button>
          )}
        </div>

        {/* Admin Controls - Send Update for Timeline Numbers */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '0.75rem' }}>
            SEND UPDATE FOR TIMELINE:
          </div>
          <div style={{ 
            display: 'flex', 
            gap: '0.5rem',
            flexWrap: 'wrap'
          }}>
            {[1, 2, 3, 4, 5].map((num) => (
              <motion.button
                key={num}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => addNotification(num)}
                style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: selectedTimelineForNotification === num ? 'rgba(0,255,157,0.2)' : 'rgba(255,255,255,0.05)',
                  border: selectedTimelineForNotification === num ? '1px solid #00ff9d' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: selectedTimelineForNotification === num ? '#00ff9d' : '#ffffff',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={() => setSelectedTimelineForNotification(num)}
                onMouseLeave={() => setSelectedTimelineForNotification(3)}
              >
                {num}
              </motion.button>
            ))}
          </div>
          <div style={{
            fontSize: '0.75rem',
            marginTop: '0.5rem',
            opacity: 0.5,
            textAlign: 'center'
          }}>
            Click number to send update for that timeline
          </div>
        </div>

        {/* Notifications List - Only Timeline History */}
        <div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.75rem'
          }}>
            <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>
              UPDATE HISTORY ({notifications.length})
            </span>
          </div>
          
          <div style={{
            maxHeight: '300px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            {notifications.length === 0 ? (
              <div style={{ 
                padding: '2rem 0', 
                textAlign: 'center', 
                opacity: 0.5,
                fontSize: '0.9rem'
              }}>
                No timeline updates yet
              </div>
            ) : (
              notifications.map((notif) => (
                <motion.div 
                  key={notif.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => markAsRead(notif.id)}
                  style={{
                    padding: '1rem',
                    backgroundColor: !notif.read ? 'rgba(0,255,157,0.05)' : 'transparent',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      color: '#00ff9d',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      <span style={{
                        display: 'inline-block',
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: !notif.read ? '#00ff9d' : 'transparent',
                        marginRight: '4px'
                      }} />
                      Timeline {notif.timelineId}
                    </span>
                    <span style={{ fontSize: '0.65rem', opacity: 0.5 }}>{notif.timestamp}</span>
                  </div>
                  <p style={{ 
                    margin: '0.25rem 0 0 0', 
                    fontSize: '0.85rem',
                    opacity: 0.9,
                    lineHeight: '1.4'
                  }}>
                    {notif.message}
                  </p>
                </motion.div>
              ))
            )}
          </div>
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

      {/* Shadow Page - Full Half Screen */}
      <AnimatePresence>
        {selectedStep && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'tween', duration: 0.3 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              width: '50%',
              height: '100vh',
              backgroundColor: '#0a0a0a',
              zIndex: 50,
              borderLeft: '1px solid rgba(255,255,255,0.1)',
              overflowY: 'auto',
              padding: '3rem',
              boxShadow: '-10px 0 30px rgba(0,0,0,0.8)'
            }}
          >
            {timelineSteps.map((step) => (
              step.id === selectedStep && (
                <div key={step.id} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {/* Page Number */}
                  <div style={{
                    position: 'absolute',
                    bottom: '2rem',
                    right: '2rem',
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
                      top: '2rem',
                      right: '2rem',
                      background: 'transparent',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: '#ffffff',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      cursor: 'pointer',
                      zIndex: 51
                    }}
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    ×
                  </motion.button>

                  {/* Main Content */}
                  <div style={{ 
                    maxWidth: '600px',
                    marginTop: '4rem'
                  }}>
                    <div style={{
                      fontSize: '0.9rem',
                      opacity: 0.5,
                      fontFamily: 'monospace',
                      marginBottom: '1rem',
                      letterSpacing: '2px'
                    }}>
                      TIMELINE DETAIL
                    </div>
                    
                    <div style={{
                      fontSize: '3.5rem',
                      fontWeight: 300,
                      marginBottom: '2rem',
                      color: '#ffffff',
                      lineHeight: '1.2'
                    }}>
                      {step.title}
                    </div>
                    
                    <p style={{
                      fontSize: '1.3rem',
                      lineHeight: '1.7',
                      opacity: 0.8,
                      marginBottom: '3rem',
                      color: '#ffffff',
                      fontWeight: 300
                    }}>
                      {step.details}
                    </p>
                    
                    {/* Info Grid */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '120px 1fr',
                      gap: '1.2rem',
                      marginTop: '2rem',
                      paddingTop: '2rem',
                      borderTop: '1px solid rgba(255,255,255,0.1)'
                    }}>
                      <div style={{ fontSize: '0.85rem', opacity: 0.4, fontFamily: 'monospace' }}>TIMELINE</div>
                      <div style={{ fontSize: '1.3rem', fontFamily: 'monospace', opacity: 0.9 }}>{step.date}</div>
                      
                      <div style={{ fontSize: '0.85rem', opacity: 0.4, fontFamily: 'monospace' }}>STATUS</div>
                      <div style={{ 
                        fontSize: '1.3rem',
                        color: step.status === 'completed' ? '#ffffff' : 
                               step.status === 'current' ? '#00ff9d' : '#666666',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                      }}>
                        {step.status === 'current' && <BlinkingDot />}
                        {step.status.toUpperCase()}
                      </div>
                      
                      <div style={{ fontSize: '0.85rem', opacity: 0.4, fontFamily: 'monospace' }}>MILESTONE</div>
                      <div style={{ fontSize: '1.3rem', fontFamily: 'monospace', opacity: 0.9 }}>MS-{step.id * 100}</div>
                      
                      <div style={{ fontSize: '0.85rem', opacity: 0.4, fontFamily: 'monospace' }}>PROGRESS</div>
                      <div style={{ fontSize: '1.3rem', fontFamily: 'monospace', opacity: 0.9 }}>
                        {step.status === 'completed' ? '100%' : 
                         step.status === 'current' ? '65%' : '0%'}
                      </div>
                    </div>

                    {/* Recent Updates */}
                    <div style={{ marginTop: '3rem' }}>
                      <div style={{
                        fontSize: '0.85rem',
                        opacity: 0.4,
                        fontFamily: 'monospace',
                        marginBottom: '1rem'
                      }}>
                        RECENT UPDATES
                      </div>
                      <div style={{
                        backgroundColor: 'rgba(255,255,255,0.02)',
                        padding: '1.5rem',
                        borderRadius: '4px'
                      }}>
                        {notifications
                          .filter(n => n.timelineId === step.id)
                          .slice(0, 2)
                          .map(n => (
                            <div key={n.id} style={{ 
                              marginBottom: '1rem',
                              paddingBottom: '1rem',
                              borderBottom: '1px solid rgba(255,255,255,0.05)'
                            }}>
                              <div style={{ fontSize: '0.75rem', opacity: 0.5, marginBottom: '0.25rem' }}>
                                {n.timestamp}
                              </div>
                              <div style={{ fontSize: '0.95rem' }}>{n.message}</div>
                            </div>
                          ))}
                        {notifications.filter(n => n.timelineId === step.id).length === 0 && (
                          <div style={{ opacity: 0.5, fontSize: '0.9rem' }}>
                            No updates yet
                          </div>
                        )}
                      </div>
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
        maxWidth: selectedStep ? 'calc(50% - 4rem)' : '1400px', 
        margin: '0 auto',
        transition: 'max-width 0.3s ease',
        paddingRight: selectedStep ? '2rem' : '0'
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
                    opacity: selectedStep && selectedStep !== step.id ? 0.5 : 1,
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
