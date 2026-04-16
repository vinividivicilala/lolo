'use client';

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
}

export default function HomePage(): React.JSX.Element {
  const [showPopup, setShowPopup] = useState(false);
  const acceptBtnRef = useRef<HTMLButtonElement>(null);
  const declineBtnRef = useRef<HTMLButtonElement>(null);
  const contactBtnRef = useRef<HTMLButtonElement>(null);
  const smootherRef = useRef<any>(null);

  useEffect(() => {
    // Initialize ScrollSmoother
    const initSmoother = () => {
      if (typeof window !== 'undefined' && !smootherRef.current) {
        smootherRef.current = ScrollSmoother.create({
          wrapper: "#smooth-wrapper",
          content: "#smooth-content",
          smooth: 1.2,
          effects: true,
          smoothTouch: 0.5,
          normalizeScroll: true,
          ignoreMobileResize: true,
          onUpdate: () => {},
        });
      }
    };

    const timer = setTimeout(() => {
      initSmoother();
    }, 100);

    return () => {
      clearTimeout(timer);
      if (smootherRef.current) {
        smootherRef.current.kill();
        smootherRef.current = null;
      }
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (consent === null) {
      setShowPopup(true);
    }
  }, []);

  useEffect(() => {
    if (showPopup && acceptBtnRef.current && declineBtnRef.current) {
      const acceptBtn = acceptBtnRef.current;
      const declineBtn = declineBtnRef.current;

      [acceptBtn, declineBtn].forEach(btn => {
        btn.style.position = 'relative';
        btn.style.overflow = 'hidden';
        btn.style.zIndex = '1';
        
        const pseudoStyle = document.createElement('style');
        pseudoStyle.textContent = `
          .btn-hover-effect {
            position: relative;
            isolation: isolate;
          }
          .btn-hover-effect::before {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 0%;
            background-color: #000000;
            transition: height 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
            z-index: -1;
            border-radius: 60px;
          }
          .btn-hover-effect:hover::before {
            height: 100%;
          }
          .btn-hover-effect {
            transition: color 0.3s ease;
          }
          .btn-hover-effect:hover {
            color: white !important;
          }
        `;
        document.head.appendChild(pseudoStyle);
        btn.classList.add('btn-hover-effect');
      });

      return () => {
        [acceptBtn, declineBtn].forEach(btn => {
          const styles = document.querySelectorAll('style');
          styles.forEach(style => {
            if (style.textContent?.includes('btn-hover-effect')) {
              style.remove();
            }
          });
        });
      };
    }
  }, [showPopup]);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowPopup(false);
    console.log('Cookies accepted');
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setShowPopup(false);
    console.log('Cookies declined');
  };

  const handleContact = () => {
    console.log('Contact clicked');
  };

  return (
    <>
      <style jsx global>{`
        * {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        *::-webkit-scrollbar {
          display: none;
        }
        
        html, body {
          margin: 0;
          padding: 0;
          height: 100%;
          width: 100%;
          overflow: hidden;
          background-color: black;
        }
        
        #smooth-wrapper {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: 1;
        }
        
        #smooth-content {
          min-height: 200vh;
          width: 100%;
          will-change: transform;
        }

        /* Hover effect untuk contact button */
        .contact-btn-effect {
          position: relative;
          isolation: isolate;
          transition: color 0.3s ease;
        }
        
        .contact-btn-effect::before {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 0%;
          background-color: #000000;
          transition: height 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
          z-index: -1;
          border-radius: 60px;
        }
        
        .contact-btn-effect:hover::before {
          height: 100%;
        }
        
        .contact-btn-effect:hover {
          color: white !important;
        }

        /* Sembunyikan titik bulat kecil saat hover */
        .contact-btn-effect:hover .dot-small {
          opacity: 0 !important;
          transform: scale(0) !important;
        }

        /* Tampilkan lingkaran besar dengan panah saat hover */
        .contact-btn-effect:hover .circle-large {
          opacity: 1 !important;
          transform: scale(1) !important;
        }

        /* Animasi untuk titik kecil */
        .dot-small {
          transition: opacity 0.3s ease, transform 0.3s ease;
        }

        /* Animasi untuk lingkaran besar */
        .circle-large {
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
      `}</style>
      
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <div style={{
            minHeight: '200vh',
            backgroundColor: 'black',
            margin: 0,
            padding: 0,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'Questrial, sans-serif',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            position: 'relative',
          }}>
            {/* Konten pertama - 100vh dengan teks Scroll down di tengah */}
            <div style={{
              height: '100vh',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
            }}>
              <div style={{
                textAlign: 'center',
                color: 'white',
                fontSize: '24px',
                opacity: 0.5
              }}>
                Scroll down ↓
              </div>
              
              {/* Teks dan tombol dinaikkan dekat dengan Scroll down */}
              <div style={{
                position: 'absolute',
                bottom: '30%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '40px',
                width: '100%'
              }}>
                {/* Teks "Mencatat apa yang kamu inginkan" - 1 baris */}
                <div style={{
                  fontSize: '64px',
                  fontFamily: 'Questrial, sans-serif',
                  color: 'white',
                  textAlign: 'center',
                  fontWeight: '400',
                  letterSpacing: '-0.02em',
                  lineHeight: '1.2',
                  whiteSpace: 'nowrap'
                }}>
                  Mencatat apa yang kamu inginkan
                </div>

                {/* Tombol Contact dengan titik bulat kecil, hover jadi lingkaran besar + panah putih */}
                <button
                  ref={contactBtnRef}
                  onClick={handleContact}
                  className="contact-btn-effect"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '14px 36px',
                    backgroundColor: '#ffffff',
                    color: '#000000',
                    border: '1.5px solid #e0e0e0',
                    borderRadius: '60px',
                    cursor: 'pointer',
                    fontSize: '20px',
                    fontWeight: '600',
                    letterSpacing: '-0.01em',
                    fontFamily: 'Questrial, sans-serif',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    zIndex: 1,
                    background: '#ffffff'
                  }}
                >
                  <span>Contact</span>
                  
                  {/* Container untuk titik dan lingkaran */}
                  <div style={{
                    position: 'relative',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {/* Titik bulat kecil hitam (awal) */}
                    <div className="dot-small" style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#000000',
                      opacity: 1,
                      transform: 'scale(1)',
                      transition: 'opacity 0.3s ease, transform 0.3s ease',
                      position: 'absolute'
                    }}></div>
                    
                    {/* Lingkaran besar dengan panah SVG warna putih (saat hover) */}
                    <div className="circle-large" style={{
                      position: 'absolute',
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: 'transparent',
                      border: '2px solid white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transform: 'scale(0.8)',
                      transition: 'opacity 0.3s ease, transform 0.3s ease'
                    }}>
                      <svg 
                        width="20" 
                        height="20" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path 
                          d="M17 7L7 17M7 17H17M7 17V7" 
                          stroke="#FFFFFF" 
                          strokeWidth="2.5" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Bagian footer dengan teks MENURU - mentok di paling bawah tanpa space */}
            <div style={{
              width: '100%',
              position: 'relative',
              backgroundColor: 'black',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              alignItems: 'center',
              minHeight: '100vh'
            }}>
              <footer style={{
                position: 'relative',
                bottom: 0,
                left: 0,
                right: 0,
                width: '100%',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'flex-end',
                padding: 0,
                margin: 0,
                pointerEvents: 'none',
                zIndex: 1,
                lineHeight: 0
              }}>
                <span style={{
                  fontFamily: "'Bebas Neue', 'Impact', 'Arial Black', sans-serif",
                  fontWeight: 'normal',
                  fontSize: '600px',
                  color: 'white',
                  textAlign: 'right',
                  letterSpacing: '-0.02em',
                  opacity: 0.95,
                  textTransform: 'uppercase',
                  lineHeight: '0.7',
                  whiteSpace: 'nowrap',
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                  fontKerning: 'normal',
                  margin: 0,
                  padding: 0,
                  transform: 'translateY(10px)'
                }}>
                  MENURU
                </span>
              </footer>
            </div>
          </div>
        </div>
      </div>

      {/* Cookie Popup - Bottom Left */}
      {showPopup && (
        <div style={{
          position: 'fixed',
          bottom: '30px',
          left: '30px',
          width: 'auto',
          maxWidth: 'calc(100vw - 60px)',
          backgroundColor: '#ffffff',
          color: '#000000',
          borderRadius: '32px',
          padding: '24px 32px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15), 0 5px 12px rgba(0,0,0,0.05)',
          zIndex: 1000,
          fontFamily: 'Questrial, sans-serif',
          animation: 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          border: '1px solid rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '32px',
          flexWrap: 'wrap',
        }}>
          <style>
            {`
              @keyframes slideUp {
                from {
                  opacity: 0;
                  transform: translateY(30px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `}
          </style>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ fontSize: '56px', display: 'inline-block' }}>🍪</span>
              <span style={{ 
                fontWeight: '700', 
                fontSize: '36px',
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #000000 0%, #333333 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                fontFamily: 'Questrial, sans-serif'
              }}>
                cookies.
              </span>
            </div>
            
            <p style={{
              fontSize: '20px',
              lineHeight: '1.4',
              marginBottom: 0,
              color: '#1a1a1a',
              fontWeight: '400',
              letterSpacing: '-0.01em',
              maxWidth: '280px',
              fontFamily: 'Questrial, sans-serif'
            }}>
              I use cookies to understand how you navigate<br />
              this site and what topics interest you most.
            </p>
            <span style={{ 
              color: '#666', 
              fontSize: '18px',
              display: 'inline-block',
              marginTop: '4px',
              fontFamily: 'Questrial, sans-serif'
            }}>
              No ads, no data sold ever.
            </span>
          </div>
          
          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'flex-start',
            flexShrink: 0,
          }}>
            <button
              ref={declineBtnRef}
              onClick={handleDecline}
              style={{
                padding: '14px 32px',
                backgroundColor: '#ffffff',
                color: '#000000',
                border: '1.5px solid #e0e0e0',
                borderRadius: '60px',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: '600',
                letterSpacing: '-0.01em',
                fontFamily: 'Questrial, sans-serif',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden',
                zIndex: 1,
                background: '#ffffff'
              }}
            >
              Decline
            </button>
            <button
              ref={acceptBtnRef}
              onClick={handleAccept}
              style={{
                padding: '14px 32px',
                backgroundColor: '#ffffff',
                color: '#000000',
                border: '1.5px solid #e0e0e0',
                borderRadius: '60px',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: '600',
                letterSpacing: '-0.01em',
                fontFamily: 'Questrial, sans-serif',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden',
                zIndex: 1,
                background: '#ffffff'
              }}
            >
              Accept
            </button>
          </div>
        </div>
      )}
    </>
  );
}
