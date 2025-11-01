'use client';

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface ForgotPasswordPageProps {
  onClose?: () => void;
}

export default function ForgotPasswordPage({ onClose }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();
  const [showTopics, setShowTopics] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on component mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const handleTopicsClick = () => {
    setShowTopics(!showTopics);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic untuk reset password
    console.log("Reset password for:", email);
    setIsSubmitted(true);
  };

  const handleBackToSignIn = () => {
    router.push('/signin');
  };

  const handleClose = () => {
    if (onClose && typeof onClose === 'function') {
      onClose();
    } else {
      router.back();
    }
  };

  // Mobile-specific styles
  const mobileStyles = {
    container: {
      padding: '1rem 0',
      justifyContent: 'flex-start' as const,
    },
    modal: {
      width: '90%',
      height: 'auto',
      minHeight: '400px',
      padding: '1.5rem',
      marginBottom: '2rem',
      marginTop: '1rem',
    },
    title: {
      fontSize: '1.5rem',
    },
    description: {
      fontSize: '0.9rem',
    },
    input: {
      padding: '0.6rem',
      fontSize: '0.9rem',
    },
    button: {
      padding: '0.6rem',
      fontSize: '0.9rem',
    },
    closeButton: {
      width: '25px',
      height: '25px',
      fontSize: '1rem',
    }
  };

  // Desktop styles
  const desktopStyles = {
    container: {
      padding: '2rem 0',
    },
    modal: {
      width: '600px',
      height: '400px',
      padding: '3rem',
      marginBottom: '5rem',
      marginTop: '2rem',
    },
    title: {
      fontSize: '2rem',
    },
    description: {
      fontSize: '1rem',
    },
    input: {
      padding: '0.75rem',
      fontSize: '1rem',
    },
    button: {
      padding: '0.75rem',
      fontSize: '1rem',
    },
    closeButton: {
      width: '30px',
      height: '30px',
      fontSize: '1.2rem',
    }
  };

  const styles = isMobile ? mobileStyles : desktopStyles;

  return (
    <AnimatePresence>
      <motion.div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'center',
          zIndex: 1000,
          overflowY: 'auto',
          ...styles.container
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Modal Box */}
        <motion.div
          style={{
            background: 'transparent',
            borderRadius: '12px',
            position: 'relative',
            border: '1px solid rgba(255,255,255,0.3)',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'rgba(0,0,0,0.7)',
            ...styles.modal
          }}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
              fontFamily: 'Arame Mono, monospace',
              ...styles.closeButton
            }}
          >
            ×
          </button>

          {!isSubmitted ? (
            <>
              {/* Judul */}
              <h2 style={{
                color: 'white',
                fontWeight: '600',
                marginBottom: '1rem',
                textAlign: 'left',
                fontFamily: 'Arame Mono, monospace',
                ...styles.title
              }}>
                Forgot Password
              </h2>

              {/* Deskripsi */}
              <p style={{
                color: 'rgba(255,255,255,0.8)',
                marginBottom: '2rem',
                textAlign: 'left',
                fontFamily: 'Arame Mono, monospace',
                ...styles.description
              }}>
                Enter your email to receive a password reset link
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                {/* Email Input */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    color: 'white',
                    marginBottom: '0.5rem',
                    fontSize: isMobile ? '0.8rem' : '0.9rem',
                    fontFamily: 'Arame Mono, monospace'
                  }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      borderRadius: '6px',
                      color: 'white',
                      outline: 'none',
                      fontFamily: 'Arame Mono, monospace',
                      ...styles.input
                    }}
                  />
                </div>

                {/* Tombol Kirim */}
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.2)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '6px',
                    color: 'white',
                    cursor: 'pointer',
                    marginBottom: '1rem',
                    fontFamily: 'Arame Mono, monospace',
                    ...styles.button
                  }}
                >
                  Send Reset Email
                </button>
              </form>

              {/* Tombol Kembali */}
              <button
                onClick={handleBackToSignIn}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.8)',
                  cursor: 'pointer',
                  fontSize: isMobile ? '0.8rem' : '0.9rem',
                  textDecoration: 'underline',
                  fontFamily: 'Arame Mono, monospace',
                  alignSelf: 'flex-start',
                  padding: 0
                }}
              >
                Back to Sign In
              </button>
            </>
          ) : (
            /* Success State */
            <div style={{ 
              textAlign: 'center', 
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%'
            }}>
              <div style={{ 
                fontSize: isMobile ? '2rem' : '3rem', 
                marginBottom: '1rem' 
              }}>📧</div>
              <h3 style={{
                color: 'white',
                fontSize: isMobile ? '1.2rem' : '1.5rem',
                marginBottom: '1rem',
                fontFamily: 'Arame Mono, monospace'
              }}>
                Check Your Email
              </h3>
              <p style={{
                color: 'rgba(255,255,255,0.8)',
                fontSize: isMobile ? '0.9rem' : '1rem',
                marginBottom: '2rem',
                fontFamily: 'Arame Mono, monospace'
              }}>
                We've sent a password reset link to your email
              </p>
              <button
                onClick={handleBackToSignIn}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '6px',
                  color: 'white',
                  padding: isMobile ? '0.6rem 1.2rem' : '0.75rem 1.5rem',
                  cursor: 'pointer',
                  fontFamily: 'Arame Mono, monospace'
                }}
              >
                Back to Sign In
              </button>
            </div>
          )}
        </motion.div>

        {/* Content Section - Responsive */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          style={{
            position: 'relative',
            textAlign: 'left',
            marginTop: isMobile ? '1rem' : '2rem',
            width: '100%',
            maxWidth: '1200px',
            padding: isMobile ? '0 1rem' : '0 2rem'
          }}
        >
          {/* Teks LETS JOIN US NOTE THINK */}
          <div style={{ 
            marginBottom: isMobile ? '2rem' : '4rem',
            textAlign: isMobile ? 'center' : 'left'
          }}>
            <p style={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: isMobile ? '2.5rem' : '5rem',
              fontFamily: 'Arame Mono, monospace',
              margin: '0 0 0.3rem 0',
              lineHeight: '1.1',
              fontWeight: '600'
            }}>
              LETS JOIN US
            </p>
            <p style={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: isMobile ? '2.5rem' : '5rem',
              fontFamily: 'Arame Mono, monospace',
              margin: 0,
              lineHeight: '1.1',
              fontWeight: '600'
            }}>
              NOTE THINK.
            </p>
          </div>

          {/* Menu Grid - Responsive */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, auto)',
            gap: isMobile ? '1.5rem' : '2rem 8rem',
            marginTop: '0rem'
          }}>
            <div>
              <h4 style={{
                color: 'white',
                fontSize: isMobile ? '2rem' : '4rem',
                fontWeight: '600',
                margin: '0 0 0.5rem 0',
                marginBottom: isMobile ? '2rem' : '5rem',
                fontFamily: 'Arame Mono, monospace'
              }}>
                MENU
              </h4>
              
              {/* Menu Items */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: isMobile ? '1rem' : '2rem',
                marginTop: isMobile ? '1rem' : '2rem'
              }}>
                {['Home', 'Topics', 'Blog', 'Roadmap', 'Note'].map((item) => (
                  <div 
                    key={item} 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: isMobile ? '0.5rem' : '1rem',
                      cursor: 'pointer'
                    }}
                    onClick={item === 'Topics' ? handleTopicsClick : undefined}
                  >
                    <span style={{
                      color: 'white',
                      fontSize: isMobile ? '2rem' : '5rem',
                      fontFamily: 'Arame Mono, monospace',
                      fontWeight: '500'
                    }}>
                      {item}
                    </span>
                    <motion.svg
                      width={isMobile ? "40" : "60"}
                      height={isMobile ? "40" : "60"}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      animate={{ rotate: item === 'Topics' && showTopics ? 45 : 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <motion.line
                        x1="12"
                        y1="5"
                        x2="12"
                        y2="19"
                        animate={{ 
                          opacity: item === 'Topics' && showTopics ? 0 : 1,
                          scale: item === 'Topics' && showTopics ? 0 : 1
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    </motion.svg>
                  </div>
                ))}
                
                {showTopics && (
                  <div>
                    <h4 style={{
                      color: 'white',
                      fontSize: isMobile ? '1.5rem' : '4rem',
                      fontWeight: '600',
                      margin: '0 0 0.5rem 0',
                      marginBottom: isMobile ? '2rem' : '5rem',
                      fontFamily: 'Arame Mono, monospace'
                    }}>
                      TOPICS
                    </h4>

                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: isMobile ? '1rem' : '2rem',
                      marginTop: isMobile ? '1rem' : '2rem'
                    }}>
                      {[
                        { name: 'Web Development', description: 'Frontend & Backend technologies' },
                        { name: 'Mobile Apps', description: 'iOS & Android development' },
                        { name: 'UI/UX Design', description: 'User interface and experience' },
                        { name: 'Data Science', description: 'AI, ML and analytics' },
                        { name: 'DevOps', description: 'Cloud and infrastructure' }
                      ].map((topic) => (
                        <div key={topic.name} style={{
                          borderBottom: '1px solid rgba(255,255,255,0.2)',
                          paddingBottom: isMobile ? '1rem' : '1.5rem'
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer'
                          }}>
                            <div>
                              <div style={{
                                color: 'white',
                                fontSize: isMobile ? '1.5rem' : '3.5rem',
                                fontFamily: 'Arame Mono, monospace',
                                fontWeight: '500',
                                marginBottom: '0.5rem'
                              }}>
                                {topic.name}
                              </div>
                              <div style={{
                                color: 'rgba(255,255,255,0.7)',
                                fontSize: isMobile ? '0.9rem' : '1.8rem',
                                fontFamily: 'Arame Mono, monospace'
                              }}>
                                {topic.description}
                              </div>
                            </div>
                            
                            <svg
                              width={isMobile ? "30" : "70"}
                              height={isMobile ? "30" : "70"}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="white"
                              strokeWidth="1.5"
                              style={{
                                transform: 'rotate(45deg)',
                                transition: 'transform 0.3s ease'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.transform = 'rotate(45deg) scale(1.1)'}
                              onMouseLeave={(e) => e.currentTarget.style.transform = 'rotate(45deg) scale(1)'}
                            >
                              <line x1="5" y1="12" x2="19" y2="12" />
                              <polyline points="12 5 19 12 12 19" />
                            </svg>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Other Menu Items */}
            {[
              { title: 'PRODUCT', margin: '5rem' },
              { title: 'CONNECT', margin: '5rem' },
              { title: 'Features', margin: '15rem' },
              { title: 'Community', margin: '15rem' },
              { title: 'BLOG', margin: '15rem' }
            ].map((item, index) => (
              <div key={index}>
                <h4 style={{
                  color: 'white',
                  fontSize: isMobile ? '1.5rem' : '4rem',
                  fontWeight: '600',
                  margin: '0 0 0.5rem 0',
                  marginBottom: isMobile ? '1rem' : item.margin,
                  fontFamily: 'Arame Mono, monospace'
                }}>
                  {item.title}
                </h4>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Large Horizontal Card - Responsive */}
        <motion.div
          style={{
            width: isMobile ? '95%' : '90%',
            maxWidth: '1900px',
            height: 'auto',
            backgroundColor: '#CCFF00',
            borderRadius: isMobile ? '20px' : '40px',
            padding: isMobile ? '1.5rem' : '3rem',
            display: 'flex',
            alignItems: 'left',
            gap: isMobile ? '1.5rem' : '3rem',
            cursor: 'pointer',
            margin: isMobile ? '1rem auto' : '2rem auto',
            boxShadow: '0 10px 40px rgba(204, 255, 0, 0.3)',
            flexDirection: isMobile ? 'column' : 'row'
          }}
          whileHover={{
            scale: isMobile ? 1 : 1.02,
            backgroundColor: '#D4FF33',
            transition: { duration: 0.3 }
          }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Content Section */}
          <div style={{
            display: 'flex',
            width: '100%',
            gap: isMobile ? '1.5rem' : '3rem',
            flexDirection: isMobile ? 'column' : 'row'
          }}>
            {/* Left Section - MENURU */}
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: isMobile ? '1rem' : '1.5rem'
            }}>
              <h3 style={{
                color: 'black',
                fontSize: isMobile ? '3rem' : '10rem',
                fontWeight: '2800',
                fontFamily: 'Verdana, Geneva, sans-serif',
                margin: 0,
                lineHeight: 1.1,
                letterSpacing: '-1px'
              }}>
                MENURU<br/>
              </h3>

              {/* Daftar Website Pribadi Section */}
              <motion.div
                style={{
                  width: '100%',
                  marginTop: isMobile ? '0.5rem' : '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: isMobile ? '0.3rem' : '0.5rem'
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: isMobile ? '0.2rem' : '0.3rem'
                }}>
                  {/* Portfolio */}
                  <motion.div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: isMobile ? '1rem' : '1.5rem',
                      padding: isMobile ? '0.6rem 0' : '0.8rem 0',
                      borderBottom: '1px solid rgba(0,0,0,0.1)',
                      cursor: 'pointer'
                    }}
                    whileHover={{ 
                      x: isMobile ? 5 : 10,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <span style={{
                      color: 'black',
                      fontSize: isMobile ? '1.2rem' : '3rem',
                      fontFamily: 'Verdana, Geneva, sans-serif',
                      minWidth: isMobile ? '20px' : '30px'
                    }}>
                      01
                    </span>
                    
                    <span style={{
                      color: 'black',
                      fontSize: isMobile ? '1.2rem' : '3rem',
                      fontWeight: '500',
                      fontFamily: 'Verdana, Geneva, sans-serif',
                      flex: 1
                    }}>
                      Portfolio
                    </span>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: isMobile ? '0.5rem' : '0.8rem',
                      color: 'black',
                      fontSize: isMobile ? '1rem' : '3rem',
                      fontFamily: 'Verdana, Geneva, sans-serif'
                    }}>
                      <svg width={isMobile ? "20" : "40"} height={isMobile ? "20" : "40"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      <span>Dec 2024</span>
                    </div>

                    <motion.svg
                      width={isMobile ? "20" : "40"}
                      height={isMobile ? "20" : "40"}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="black"
                      strokeWidth="2"
                      whileHover={{ x: 3 }}
                      transition={{ duration: 0.2 }}
                    >
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </motion.svg>
                  </motion.div>

                  {/* Photography */}
                  <motion.div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: isMobile ? '1rem' : '1.5rem',
                      padding: isMobile ? '0.6rem 0' : '0.8rem 0',
                      borderBottom: '1px solid rgba(0,0,0,0.1)',
                      cursor: 'pointer'
                    }}
                    whileHover={{ 
                      x: isMobile ? 5 : 10,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <span style={{
                      color: 'black',
                      fontSize: isMobile ? '1.2rem' : '3rem',
                      fontFamily: 'Verdana, Geneva, sans-serif',
                      minWidth: isMobile ? '20px' : '30px'
                    }}>
                      02
                    </span>
                    
                    <span style={{
                      color: 'black',
                      fontSize: isMobile ? '1.2rem' : '3rem',
                      fontWeight: '500',
                      fontFamily: 'Verdana, Geneva, sans-serif',
                      flex: 1
                    }}>
                      Photography
                    </span>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: isMobile ? '0.5rem' : '0.8rem',
                      color: 'black',
                      fontSize: isMobile ? '1rem' : '3rem',
                      fontFamily: 'Verdana, Geneva, sans-serif'
                    }}>
                      <svg width={isMobile ? "20" : "40"} height={isMobile ? "20" : "40"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      <span>Jan 2025</span>
                    </div>

                    <motion.svg
                      width={isMobile ? "20" : "40"}
                      height={isMobile ? "20" : "40"}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="black"
                      strokeWidth="2"
                      whileHover={{ x: 3 }}
                      transition={{ duration: 0.2 }}
                    >
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </motion.svg>
                  </motion.div>

                  {/* Forum */}
                  <motion.div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: isMobile ? '1rem' : '1.5rem',
                      padding: isMobile ? '0.6rem 0' : '0.8rem 0',
                      borderBottom: '1px solid rgba(0,0,0,0.1)',
                      cursor: 'pointer'
                    }}
                    whileHover={{ 
                      x: isMobile ? 5 : 10,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <span style={{
                      color: 'black',
                      fontSize: isMobile ? '1.2rem' : '3rem',
                      fontFamily: 'Verdana, Geneva, sans-serif',
                      minWidth: isMobile ? '20px' : '30px'
                    }}>
                      03
                    </span>
                    
                    <span style={{
                      color: 'black',
                      fontSize: isMobile ? '1.2rem' : '3rem',
                      fontWeight: '500',
                      fontFamily: 'Verdana, Geneva, sans-serif',
                      flex: 1
                    }}>
                      Forum
                    </span>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: isMobile ? '0.5rem' : '0.8rem',
                      color: 'black',
                      fontSize: isMobile ? '1rem' : '3rem',
                      fontFamily: 'Verdana, Geneva, sans-serif'
                    }}>
                      <svg width={isMobile ? "20" : "40"} height={isMobile ? "20" : "40"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      <span>Feb 2025</span>
                    </div>

                    <motion.svg
                      width={isMobile ? "20" : "40"}
                      height={isMobile ? "20" : "40"}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="black"
                      strokeWidth="2"
                      whileHover={{ x: 3 }}
                      transition={{ duration: 0.2 }}
                    >
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </motion.svg>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Right Section - LETS COLLABORATE */}
            <div style={{
              flex: isMobile ? 'none' : 0.6,
              display: 'flex',
              flexDirection: 'column',
              alignItems: isMobile ? 'flex-start' : 'flex-start',
              justifyContent: 'center',
              gap: isMobile ? '1rem' : '2rem'
            }}>
              <h3 style={{
                color: 'black',
                fontSize: isMobile ? '2rem' : '5rem',
                fontWeight: '800',
                fontFamily: 'Verdana, Geneva, sans-serif',
                margin: 0,
                lineHeight: 1.1,
                letterSpacing: '-1px'
              }}>
                LETS
                <br />
                COLLABORATE
              </h3>
              
              <a href="/book-call" style={{
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? '0.8rem' : '1.5rem',
                cursor: 'pointer',
                textDecoration: 'none',
                color: 'black',
                padding: '0.5rem 0'
              }}>
                <span style={{
                  fontSize: isMobile ? '1rem' : '1.5rem',
                  fontWeight: '600',
                  fontFamily: 'Verdana, Geneva, sans-serif'
                }}>
                  BOOK A CALL
                </span>
                
                <svg width={isMobile ? "20" : "24"} height={isMobile ? "20" : "24"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </a>

              <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'flex-start' : 'center',
                gap: isMobile ? '0.8rem' : '2rem',
                marginTop: isMobile ? '0.5rem' : '1rem'
              }}>
                <a href="/terms" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? '0.3rem' : '0.5rem',
                  textDecoration: 'none',
                  color: 'rgba(0,0,0,0.7)',
                  fontSize: isMobile ? '0.9rem' : '3rem',
                  fontFamily: 'Verdana, Geneva, sans-serif',
                  transition: 'color 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'black'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(0,0,0,0.7)'}>
                  Ketentuan Kami
                  <svg width={isMobile ? "16" : "100"} height={isMobile ? "16" : "100"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 17L17 7M17 7H7M17 7V17"/>
                  </svg>
                </a>
                
                <a href="/privacy" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? '0.3rem' : '0.5rem',
                  textDecoration: 'none',
                  color: 'rgba(0,0,0,0.7)',
                  fontSize: isMobile ? '0.9rem' : '3rem',
                  fontFamily: 'Verdana, Geneva, sans-serif',
                  transition: 'color 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'black'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(0,0,0,0.7)'}>
                  Kebijakan Privasi
                  <svg width={isMobile ? "16" : "100"} height={isMobile ? "16" : "100"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 17L17 7M17 7H7M17 7V17"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
