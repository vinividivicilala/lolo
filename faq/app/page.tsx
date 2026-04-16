'use client';

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import Lenis from '@studio-freight/lenis';

export default function HomePage(): React.JSX.Element {
  const [showPopup, setShowPopup] = useState(false);
  const acceptBtnRef = useRef<HTMLButtonElement>(null);
  const declineBtnRef = useRef<HTMLButtonElement>(null);
  const contactBtnRef = useRef<HTMLButtonElement>(null);

  // Inisialisasi Lenis scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
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
      // Animasi hover untuk tombol Accept
      const acceptBtn = acceptBtnRef.current;
      const declineBtn = declineBtnRef.current;

      const createHoverAnimation = (btn: HTMLButtonElement) => {
        const tl = gsap.timeline({ paused: true });
        
        // Efek warna dari bawah (background clip)
        tl.to(btn, {
          color: '#ffffff',
          duration: 0.3,
          ease: "power2.out",
        }).to(btn, {
          backgroundPosition: '0% 0%',
          duration: 0.3,
          ease: "power2.out",
        }, 0);

        btn.addEventListener('mouseenter', () => {
          tl.play();
        });
        
        btn.addEventListener('mouseleave', () => {
          tl.reverse();
        });
      };

      // Apply style untuk pseudo-element efek bawah
      [acceptBtn, declineBtn].forEach(btn => {
        btn.style.position = 'relative';
        btn.style.overflow = 'hidden';
        btn.style.zIndex = '1';
        
        // Buat pseudo-element untuk efek dari bawah
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
    // Tambahkan logika contact di sini
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'black',
      margin: 0,
      padding: 0,
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'Questrial, sans-serif',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* Konten utama - scrollable */}
      <div style={{
        height: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        {/* Halaman kosong dengan konten minimal */}
        <div style={{
          textAlign: 'center',
          color: 'white',
          fontSize: '24px',
          opacity: 0.5
        }}>
          Scroll down ↓
        </div>
      </div>

      {/* Bagian footer dengan konten di atasnya */}
      <div style={{
        width: '100%',
        minHeight: '100vh',
        position: 'relative',
        backgroundColor: 'black',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: '100px'
      }}>
        
        {/* Konten di atas footer */}
        <div style={{
          width: '100%',
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '40px',
          marginBottom: '80px'
        }}>
          {/* Teks "Mencatat apa yang kamu inginkan" */}
          <div style={{
            fontSize: '64px',
            fontFamily: 'Questrial, sans-serif',
            color: 'white',
            textAlign: 'center',
            fontWeight: '400',
            letterSpacing: '-0.02em',
            lineHeight: '1.2',
            maxWidth: '900px'
          }}>
            Mencatat apa yang kamu inginkan
          </div>

          {/* Tombol Contact dengan panah SVG North East */}
          <button
            ref={contactBtnRef}
            onClick={handleContact}
            onMouseEnter={(e) => {
              gsap.to(e.currentTarget, {
                scale: 1.05,
                duration: 0.3,
                ease: "power2.out"
              });
            }}
            onMouseLeave={(e) => {
              gsap.to(e.currentTarget, {
                scale: 1,
                duration: 0.3,
                ease: "power2.out"
              });
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 32px',
              backgroundColor: 'transparent',
              color: 'white',
              border: '2px solid white',
              borderRadius: '60px',
              cursor: 'pointer',
              fontSize: '20px',
              fontWeight: '500',
              fontFamily: 'Questrial, sans-serif',
              transition: 'all 0.3s ease',
              background: 'transparent'
            }}
          >
            Contact
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              style={{
                transition: 'transform 0.3s ease'
              }}
            >
              <path 
                d="M7 17L17 7M17 7H7M17 7V17" 
                stroke="white" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Footer dengan teks MENURU - Font Bebas Neue, ukuran 600px, digeser ke kanan */}
        <footer style={{
          position: 'relative',
          bottom: 0,
          left: 0,
          right: 0,
          width: '100%',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          padding: '20px 40px 20px 20px',
          pointerEvents: 'none',
          zIndex: 1
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
            lineHeight: '0.85',
            whiteSpace: 'nowrap',
            transform: 'translateY(12%)',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            fontKerning: 'normal',
            marginRight: '20px'
          }}>
            MENURU
          </span>
        </footer>
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
              
              @keyframes fadeIn {
                from {
                  opacity: 0;
                }
                to {
                  opacity: 1;
                }
              }

              @media (max-width: 1600px) {
                .menuru-text {
                  font-size: 450px !important;
                }
              }

              @media (max-width: 1200px) {
                .menuru-text {
                  font-size: 350px !important;
                }
              }

              @media (max-width: 900px) {
                .menuru-text {
                  font-size: 250px !important;
                }
              }

              @media (max-width: 768px) {
                .menuru-text {
                  font-size: 160px !important;
                }
              }

              @media (max-width: 480px) {
                .menuru-text {
                  font-size: 80px !important;
                }
              }
            `}
          </style>
          
          {/* Bagian kiri: Header dan deskripsi */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            {/* Header dengan icon */}
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
            
            {/* Teks deskripsi */}
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
          
          {/* Tombol-tombol */}
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
    </div>
  );
}
