'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';

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
      details: 'Market research, competitor analysis, user interviews, and initial requirements gathering completed successfully.',
      longDescription: 'Tim riset melakukan analisis mendalam terhadap 15 kompetitor utama di industri, mewawancarai 50+ pengguna potensial dari 5 negara berbeda, dan mengumpulkan 200+ poin requirement. Proses discovery menghasilkan 3 persona pengguna utama dan 8 user journey maps yang menjadi fondasi pengembangan produk. Data kuantitatif dari 1000+ responden survei menunjukkan 78% pengguna menginginkan integrasi AI dalam workflow mereka. Temuan utama: kebutuhan akan otomatisasi proses manual, dashboard real-time, dan kolaborasi tim yang lebih seamless. Riset kompetitor mengungkapkan celah pasar di sektor enterprise dengan skala menengah yang selama ini terabaikan.',
      image: '/images/5.jpg'
    },
    { 
      id: 2,
      title: 'Concept Design', 
      date: 'Q2 2024', 
      status: 'completed',
      details: 'Wireframing, prototyping, UI/UX design, and design system creation completed.',
      longDescription: 'Tim desain menghasilkan 120+ wireframe yang mencakup seluruh fitur utama, 30+ high-fidelity prototype dengan interaksi lengkap, dan design system dengan 200+ komponen reusable. Proses iterasi melibatkan 5 putaran user testing dengan 40 partisipan, menghasilkan peningkatan skor usability dari 65 menjadi 92. Design system yang dibangun mencakup color palette dengan 16 warna, tipografi dengan 6 level heading, icon set dengan 150+ ikon kustom, dan komponen UI seperti button, form, card, modal, dan navigation patterns. Seluruh aset desain telah didokumentasikan di Figma dengan 50+ halaman dan library terpusat untuk memudahkan kolaborasi dengan tim developer.',
      image: '/images/5.jpg'
    },
    { 
      id: 3,
      title: 'Development Phase', 
      date: 'Q3 2024', 
      status: 'current',
      details: 'Frontend and backend development in progress. Core features implementation and API integration.',
      longDescription: 'Pengembangan berjalan dengan 4 sprint parallel: Frontend menggunakan Next.js 14 dengan TypeScript, Tailwind CSS, dan Framer Motion untuk animasi. Backend menggunakan Node.js dengan Express, PostgreSQL untuk database utama, dan Redis untuk caching. API Gateway menangani 25+ endpoint REST dan 10+ GraphQL queries. Fitur authentication telah selesai dengan OAuth2 dan JWT, real-time notifications menggunakan WebSocket, dashboard analytics dengan Chart.js, dan file management system dengan upload/download terenkripsi. Tim development terdiri dari 3 frontend engineer, 2 backend engineer, 1 DevOps, dan 1 QA engineer. Progress saat ini 65% dengan target feature complete dalam 6 minggu.',
      image: '/images/5.jpg'
    },
    { 
      id: 4,
      title: 'Testing & QA', 
      date: 'Q4 2024', 
      status: 'pending',
      details: 'Comprehensive testing, bug fixes, performance optimization, and quality assurance.',
      longDescription: 'Rencana pengujian mencakup 5 fase: Unit testing dengan Jest (target coverage 85%), Integration testing untuk API endpoints (200+ test cases), E2E testing dengan Cypress (50+ user scenarios), Performance testing dengan k6 (simulasi 10,000 concurrent users), dan Security testing meliputi penetration testing, SQL injection, XSS, dan CSRF protection. QA team akan melakukan regression testing pada setiap sprint, cross-browser testing di 5 browser berbeda, dan responsive testing di 20+ device. Target: 95% bug terselesaikan sebelum production, load time < 2 detik, dan zero critical vulnerabilities.',
      image: '/images/5.jpg'
    },
    { 
      id: 5,
      title: 'Launch', 
      date: 'Q1 2025', 
      status: 'pending',
      details: 'Production deployment, monitoring setup, and official product launch.',
      longDescription: 'Strategi launch mencakup 3 tahap: Soft launch untuk 100 early adopters (2 minggu), Beta launch untuk 1000 pengguna terdaftar (4 minggu), dan Public launch dengan campaign global. Infrastructure setup menggunakan AWS dengan auto-scaling, load balancer, multi-AZ deployment, dan disaster recovery plan. Monitoring stack: Datadog untuk APM, Sentry untuk error tracking, LogDNA untuk log management, dan PagerDuty untuk incident response. Marketing campaign: landing page baru, press release ke 20+ media, webinar dengan 500+ target attendees, dan email marketing ke 50,000+ leads. Success metrics: 99.9% uptime, < 500ms response time, 1000+ pengguna aktif di minggu pertama.',
      image: '/images/5.jpg'
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
              <div key={step.id}>
                {/* Timeline Row */}
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
                    transition: 'margin-bottom 0.2s ease',
                    opacity: selectedStep && selectedStep !== step.id ? 0.4 : 1
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

                {/* SHADOW PAGE - Halaman Utama yang Memanfaatkan Ruang Kosong */}
                {/* DENGAN FOTO DARI /images/5.jpg - TANPA TEKS */}
                {selectedStep === step.id && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      marginLeft: '190px',
                      marginBottom: '5rem',
                      marginTop: '-0.5rem',
                      padding: '2.5rem 0 2.5rem 2rem',
                      backgroundColor: '#000000',
                      position: 'relative',
                      color: '#ffffff',
                      borderLeft: 'none',
                      borderBottom: 'none',
                      borderTop: '1px solid rgba(255,255,255,0.05)'
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

                    {/* Main Content - With Image from /images/5.jpg - NO TEXT CAPTION */}
                    <div style={{ 
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '2.5rem',
                      maxWidth: '1100px'
                    }}>
                      {/* Left Column - Text Content */}
                      <div>
                        <div style={{
                          fontSize: '2.8rem',
                          fontWeight: 300,
                          marginBottom: '1.5rem',
                          color: '#ffffff',
                          opacity: 0.9,
                          lineHeight: '1.2'
                        }}>
                          {step.title}
                        </div>
                        
                        {/* Short Details */}
                        <p style={{
                          fontSize: '1.1rem',
                          lineHeight: '1.6',
                          opacity: 0.7,
                          marginBottom: '1.5rem',
                          color: '#ffffff',
                          fontStyle: 'italic',
                          borderLeft: '2px solid rgba(255,255,255,0.2)',
                          paddingLeft: '1.2rem'
                        }}>
                          {step.details}
                        </p>
                        
                        {/* Long Description - More Detailed */}
                        <div style={{
                          marginBottom: '2rem'
                        }}>
                          <div style={{
                            fontSize: '0.85rem',
                            opacity: 0.5,
                            fontFamily: 'monospace',
                            marginBottom: '0.75rem',
                            letterSpacing: '1px'
                          }}>
                            DETAILED REPORT
                          </div>
                          <p style={{
                            fontSize: '1rem',
                            lineHeight: '1.8',
                            opacity: 0.85,
                            color: '#ffffff',
                            margin: 0,
                            textAlign: 'justify'
                          }}>
                            {step.longDescription}
                          </p>
                        </div>
                        
                        {/* Info Grid */}
                        <div style={{ 
                          display: 'grid',
                          gridTemplateColumns: 'repeat(2, 1fr)',
                          gap: '1.2rem',
                          marginTop: '1.5rem',
                          paddingTop: '1.5rem',
                          borderTop: '1px solid rgba(255,255,255,0.08)'
                        }}>
                          <div>
                            <span style={{ 
                              fontSize: '0.75rem', 
                              opacity: 0.4, 
                              fontFamily: 'monospace',
                              display: 'block',
                              marginBottom: '0.25rem'
                            }}>
                              TIMELINE
                            </span>
                            <span style={{ 
                              fontSize: '1.1rem', 
                              fontFamily: 'monospace',
                              opacity: 0.9
                            }}>
                              {step.date}
                            </span>
                          </div>
                          
                          <div>
                            <span style={{ 
                              fontSize: '0.75rem', 
                              opacity: 0.4, 
                              fontFamily: 'monospace',
                              display: 'block',
                              marginBottom: '0.25rem'
                            }}>
                              STATUS
                            </span>
                            <span style={{ 
                              fontSize: '1.1rem',
                              color: step.status === 'completed' ? '#ffffff' : 
                                     step.status === 'current' ? '#00ff9d' : '#666666',
                              opacity: 0.9
                            }}>
                              {step.status.toUpperCase()}
                            </span>
                          </div>
                          
                          <div>
                            <span style={{ 
                              fontSize: '0.75rem', 
                              opacity: 0.4, 
                              fontFamily: 'monospace',
                              display: 'block',
                              marginBottom: '0.25rem'
                            }}>
                              MILESTONE
                            </span>
                            <span style={{ 
                              fontSize: '1.1rem', 
                              fontFamily: 'monospace',
                              opacity: 0.9
                            }}>
                              MS-{step.id * 100}
                            </span>
                          </div>
                          
                          <div>
                            <span style={{ 
                              fontSize: '0.75rem', 
                              opacity: 0.4, 
                              fontFamily: 'monospace',
                              display: 'block',
                              marginBottom: '0.25rem'
                            }}>
                              PROGRESS
                            </span>
                            <span style={{ 
                              fontSize: '1.1rem', 
                              fontFamily: 'monospace',
                              opacity: 0.9
                            }}>
                              {step.status === 'completed' ? '100%' : 
                               step.status === 'current' ? '65%' : '0%'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Column - Image from /images/5.jpg - NO TEXT, NO CAPTION, NO OVERLAY */}
                      <div style={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        minHeight: '500px'
                      }}>
                        <div style={{
                          position: 'relative',
                          width: '100%',
                          height: '100%',
                          minHeight: '500px',
                          backgroundColor: '#0a0a0a',
                          border: '1px solid rgba(255,255,255,0.1)',
                          overflow: 'hidden'
                        }}>
                          {/* REAL IMAGE FROM /images/5.jpg - PURE IMAGE, NO TEXT, NO CAPTION, NO OVERLAY */}
                          <Image
                            src="/images/5.jpg"
                            alt=""
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            style={{ 
                              objectFit: 'cover',
                              objectPosition: 'center'
                            }}
                            priority
                          />
                          
                          {/* ABSOLUTELY NO TEXT, NO CAPTION, NO OVERLAY - HANYA FOTO MURNI */}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
