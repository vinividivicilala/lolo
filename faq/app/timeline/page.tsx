'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function TimelinePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [expandedStep, setExpandedStep] = useState(null);
  const [notification, setNotification] = useState(null);
  const [timelineSteps, setTimelineSteps] = useState([
    { 
      id: 1,
      title: 'Research & Discovery', 
      date: 'Q1 2024', 
      status: 'completed',
      details: {
        overview: 'Market research, user interviews, and competitive analysis conducted to identify key opportunities and user pain points.',
        milestones: ['20 user interviews completed', 'Market analysis report', 'Competitor benchmarking'],
        team: ['Farid Ardiansyah', 'Sarah Chen', 'Mike Johnson'],
        documents: ['Research_Report_Q1_2024.pdf', 'User_Personas.pdf', 'Competitive_Analysis.xlsx']
      }
    },
    { 
      id: 2,
      title: 'Concept Design', 
      date: 'Q2 2024', 
      status: 'completed',
      details: {
        overview: 'Initial wireframes, high-fidelity mockups, and interactive prototypes developed based on research insights.',
        milestones: ['Wireframes v1.0', 'Design system established', 'User flow validation'],
        team: ['Farid Ardiansyah', 'Emily Rodriguez', 'David Kim'],
        documents: ['Wireframes.fig', 'Design_System.pdf', 'Prototype_Link.txt']
      }
    },
    { 
      id: 3,
      title: 'Development Phase', 
      date: 'Q3 2024', 
      status: 'current',
      details: {
        overview: 'Frontend and backend development in progress. Core features being implemented with daily builds.',
        milestones: ['API integration 70%', 'UI components library', 'Database schema finalized'],
        team: ['Farid Ardiansyah', 'Alex Thompson', 'Maria Garcia'],
        documents: ['API_Documentation.md', 'Component_Library.zip', 'Schema.sql']
      }
    },
    { 
      id: 4,
      title: 'Testing & QA', 
      date: 'Q4 2024', 
      status: 'pending',
      details: {
        overview: 'Comprehensive testing including unit tests, integration tests, and user acceptance testing.',
        milestones: ['Test plan creation', 'Automated testing setup', 'Security audit'],
        team: ['Farid Ardiansyah', 'James Wilson', 'Lisa Anderson'],
        documents: ['Test_Plan.pdf', 'QA_Checklist.xlsx', 'Performance_Metrics.md']
      }
    },
    { 
      id: 5,
      title: 'Launch', 
      date: 'Q1 2025', 
      status: 'pending',
      details: {
        overview: 'Final deployment, marketing campaign, and post-launch monitoring.',
        milestones: ['Deployment script', 'Marketing materials', 'Monitoring setup'],
        team: ['Farid Ardiansyah', 'Rachel Lee', 'Tom Martinez'],
        documents: ['Launch_Checklist.pdf', 'Marketing_Plan.pptx', 'Rollback_Strategy.md']
      }
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
    // Simulasi update data (di sini Anda bisa integrasi dengan WebSocket/API)
    setTimelineSteps(prev => 
      prev.map(step => 
        step.id === stepId ? { ...step, ...updatedData } : step
      )
    );
    
    // Notifikasi ke semua user (simulasi)
    showNotification(`🚀 Timeline updated by admin: ${updatedData.title || 'Changes applied'}`, 'update');
    
    // Broadcast ke console (simulasi real-time)
    console.log(`🔄 Timeline update broadcast to all users - Admin: faridardiansyah061@gmail.com`);
    console.log(`📊 Updated data:`, updatedData);
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

  // Admin Controls Component
  const AdminControls = ({ step }) => {
    const isAdmin = true; // Dalam implementasi nyata, ini dari auth context
    const adminEmail = "faridardiansyah061@gmail.com";

    if (!isAdmin) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ color: '#00ff9d', fontSize: '0.9rem' }}>⚡ Admin: {adminEmail}</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => updateTimelineData(step.id, { status: 'completed' })}
            style={{
              padding: '0.5rem 1rem',
              background: 'rgba(0,255,157,0.1)',
              border: '1px solid #00ff9d',
              borderRadius: '4px',
              color: '#00ff9d',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Mark Complete
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => updateTimelineData(step.id, { status: 'current' })}
            style={{
              padding: '0.5rem 1rem',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '4px',
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Set In Progress
          </motion.button>
        </div>
      </motion.div>
    );
  };

  // Detail Panel Component
  const DetailPanel = ({ step, isExpanded }) => {
    if (!isExpanded) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        style={{
          marginTop: '2rem',
          marginLeft: '350px',
          padding: '2rem',
          background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(10,10,10,0.98) 100%)',
          borderLeft: '4px solid #00ff9d',
          borderRadius: '0 12px 12px 0',
          boxShadow: '0 20px 40px rgba(0,0,0,0.8), 0 0 0 1px rgba(0,255,157,0.1)',
          backdropFilter: 'blur(10px)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background effect */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 0% 0%, rgba(0,255,157,0.03) 0%, transparent 50%)',
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h4 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 500, 
              margin: 0,
              color: '#00ff9d',
              letterSpacing: '1px'
            }}>
              {step.title} - Details
            </h4>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setExpandedStep(null)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#ffffff',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem'
              }}
            >
              ×
            </motion.button>
          </div>

          {/* Overview */}
          <div style={{ marginBottom: '2rem' }}>
            <h5 style={{ fontSize: '1rem', opacity: 0.7, marginBottom: '0.5rem', color: '#ffffff' }}>OVERVIEW</h5>
            <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#ffffff' }}>{step.details.overview}</p>
          </div>

          {/* Milestones */}
          <div style={{ marginBottom: '2rem' }}>
            <h5 style={{ fontSize: '1rem', opacity: 0.7, marginBottom: '0.5rem', color: '#ffffff' }}>MILESTONES</h5>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {step.details.milestones.map((item, idx) => (
                <span key={idx} style={{
                  padding: '0.4rem 1rem',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '20px',
                  fontSize: '0.95rem',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#ffffff'
                }}>
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Team */}
          <div style={{ marginBottom: '2rem' }}>
            <h5 style={{ fontSize: '1rem', opacity: 0.7, marginBottom: '0.5rem', color: '#ffffff' }}>TEAM</h5>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {step.details.team.map((member, idx) => (
                <span key={idx} style={{
                  padding: '0.4rem 1rem',
                  background: 'rgba(0,255,157,0.1)',
                  borderRadius: '20px',
                  fontSize: '0.95rem',
                  border: '1px solid rgba(0,255,157,0.3)',
                  color: '#00ff9d'
                }}>
                  {member}
                </span>
              ))}
            </div>
          </div>

          {/* Documents */}
          <div>
            <h5 style={{ fontSize: '1rem', opacity: 0.7, marginBottom: '0.5rem', color: '#ffffff' }}>DOCUMENTS</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {step.details.documents.map((doc, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.5rem',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '4px',
                  border: '1px solid rgba(255,255,255,0.05)',
                  color: '#ffffff'
                }}>
                  <span style={{ fontSize: '1.2rem' }}>📄</span>
                  <span style={{ fontSize: '0.95rem' }}>{doc}</span>
                </div>
              ))}
            </div>
          </div>

          <AdminControls step={step} />
        </div>
      </motion.div>
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
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            style={{
              position: 'fixed',
              top: '2rem',
              right: '2rem',
              padding: '1rem 2rem',
              background: notification.type === 'update' 
                ? 'linear-gradient(135deg, rgba(0,255,157,0.2) 0%, rgba(0,200,100,0.2) 100%)'
                : 'rgba(255,255,255,0.1)',
              border: `1px solid ${notification.type === 'update' ? '#00ff9d' : 'rgba(255,255,255,0.3)'}`,
              borderRadius: '8px',
              backdropFilter: 'blur(10px)',
              zIndex: 1000,
              color: '#ffffff',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
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
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '2rem',
          padding: '1rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          cursor: 'pointer'
        }}
        onClick={() => router.push('/')}
      >
        <NorthWestArrow />
        <span style={{
          fontSize: '2.5rem',
          fontWeight: 500,
          letterSpacing: '2px',
          color: '#ffffff',
          textTransform: 'uppercase'
        }}>
          Halaman Utama
        </span>
        <span style={{
          fontSize: '1rem',
          opacity: 0.5,
          marginLeft: 'auto',
          color: '#ffffff'
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
            <React.Fragment key={step.id}>
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
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                    style={{
                      cursor: 'pointer',
                      position: 'relative',
                      padding: '0.5rem',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {/* Shadow effect */}
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '80px',
                      height: '80px',
                      background: 'radial-gradient(circle, rgba(0,255,157,0.2) 0%, transparent 70%)',
                      borderRadius: '50%',
                      filter: 'blur(15px)',
                      opacity: expandedStep === step.id ? 0.8 : 0.4,
                      transition: 'opacity 0.3s ease'
                    }} />
                    
                    <div style={{
                      fontSize: '1.6rem',
                      fontFamily: 'monospace',
                      fontWeight: 500,
                      color: expandedStep === step.id ? '#00ff9d' : '#ffffff',
                      opacity: step.status === 'pending' ? 0.4 : 1,
                      textShadow: expandedStep === step.id ? '0 0 20px rgba(0,255,157,0.5)' : 'none',
                      position: 'relative',
                      zIndex: 2
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
                      {step.status === 'completed' && '✓ Completed'}
                      {step.status === 'current' && '⚡ In Progress'}
                      {step.status === 'pending' && '○ Upcoming'}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Detail Panel */}
              <DetailPanel step={step} isExpanded={expandedStep === step.id} />
            </React.Fragment>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
