'use client';

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);
}

export default function HomePage(): React.JSX.Element {
  const [showPopup, setShowPopup] = useState(false);
  const acceptBtnRef = useRef<HTMLButtonElement>(null);
  const declineBtnRef = useRef<HTMLButtonElement>(null);
  const contactBtnRef = useRef<HTMLButtonElement>(null);
  const smootherRef = useRef<any>(null);
  
  // Refs untuk teks yang akan di-split
  const mencatatTextRef = useRef<HTMLDivElement>(null);
  const menuruTextRef = useRef<HTMLSpanElement>(null);
  const contactTextRef = useRef<HTMLSpanElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLDivElement>(null);
  const igRef = useRef<HTMLDivElement>(null);
  const xRef = useRef<HTMLDivElement>(null);
  const linkedinRef = useRef<HTMLDivElement>(null);

  // Variabel untuk menyimpan teks asli medsos
  const originalTexts = {
    ig: 'Instagram',
    x: 'X',
    linkedin: 'LinkedIn'
  };

  // Fungsi untuk mendapatkan huruf random (A-Z)
  const getRandomChar = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    return chars[Math.floor(Math.random() * chars.length)];
  };

  // Fungsi untuk mengacak huruf pada teks
  const randomizeText = (element: HTMLElement, originalText: string, duration: number = 0.5) => {
    const originalChars = originalText.split('');
    const totalSteps = 15;
    let currentStep = 0;
    
    const interval = setInterval(() => {
      if (currentStep < totalSteps) {
        const randomized = originalChars.map(() => getRandomChar()).join('');
        element.textContent = randomized;
        currentStep++;
      } else {
        clearInterval(interval);
        element.textContent = originalText;
      }
    }, duration * 1000 / totalSteps);
    
    return interval;
  };

  // Animasi hover random huruf untuk medsos
  const handleSocialHover = (element: HTMLElement, originalText: string) => {
    if (!element.getAttribute('data-original')) {
      element.setAttribute('data-original', originalText);
    }
    
    const interval = randomizeText(element, originalText, 0.6);
    element.setAttribute('data-interval', String(interval));
  };
  
  const handleSocialLeave = (element: HTMLElement, originalText: string) => {
    const interval = element.getAttribute('data-interval');
    if (interval) {
      clearInterval(Number(interval));
    }
    element.textContent = originalText;
  };

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

  // GSAP SplitText animations
  useEffect(() => {
    // Split text untuk "Mencatat apa yang kamu inginkan"
    if (mencatatTextRef.current) {
      const splitMencatat = new SplitText(mencatatTextRef.current, {
        type: "chars",
        charsClass: "split-char"
      });

      gsap.fromTo(splitMencatat.chars,
        {
          opacity: 0,
          y: 100,
          rotateX: -90,
          filter: 'blur(10px)'
        },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          filter: 'blur(0px)',
          duration: 1.2,
          stagger: 0.03,
          ease: "back.out(1.2)",
          scrollTrigger: {
            trigger: mencatatTextRef.current,
            start: "top 80%",
            end: "bottom 60%",
            toggleActions: "play none none reverse",
          }
        }
      );
    }

    // Split text untuk email
    if (emailRef.current) {
      const splitEmail = new SplitText(emailRef.current, {
        type: "chars",
        charsClass: "split-char"
      });

      gsap.fromTo(splitEmail.chars,
        {
          opacity: 0,
          x: -30,
          filter: 'blur(5px)'
        },
        {
          opacity: 1,
          x: 0,
          filter: 'blur(0px)',
          duration: 0.8,
          stagger: 0.02,
          ease: "power2.out",
          scrollTrigger: {
            trigger: emailRef.current,
            start: "top 85%",
            end: "bottom 70%",
            toggleActions: "play none none reverse",
          }
        }
      );
    }

    // Split text untuk "MENURU" besar di footer
    if (menuruTextRef.current) {
      const splitMenuru = new SplitText(menuruTextRef.current, {
        type: "chars",
        charsClass: "split-char-menuru"
      });

      gsap.set(splitMenuru.chars, {
        opacity: 0,
        y: 200,
        rotationY: 90,
        transformPerspective: 800,
        filter: 'blur(20px)'
      });

      gsap.to(splitMenuru.chars, {
        opacity: 1,
        y: 0,
        rotationY: 0,
        filter: 'blur(0px)',
        duration: 1.5,
        stagger: {
          each: 0.04,
          from: "start",
          ease: "power2.out"
        },
        ease: "back.out(0.8)",
        scrollTrigger: {
          trigger: menuruTextRef.current,
          start: "top 85%",
          end: "bottom 65%",
          toggleActions: "play none none reverse",
        }
      });
    }

    // Split text untuk "Contact" pada tombol
    if (contactTextRef.current) {
      const splitContact = new SplitText(contactTextRef.current, {
        type: "chars",
        charsClass: "split-char"
      });

      gsap.fromTo(splitContact.chars,
        {
          opacity: 0,
          x: -20,
          filter: 'blur(5px)'
        },
        {
          opacity: 1,
          x: 0,
          filter: 'blur(0px)',
          duration: 0.8,
          stagger: 0.05,
          ease: "power2.out",
          scrollTrigger: {
            trigger: contactTextRef.current,
            start: "top 85%",
            end: "bottom 65%",
            toggleActions: "play none none reverse",
          }
        }
      );
    }

    // Animasi garis putih
    if (lineRef.current) {
      gsap.fromTo(lineRef.current,
        {
          width: '0%',
          opacity: 0,
          x: 100
        },
        {
          width: '100%',
          opacity: 1,
          x: 0,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: lineRef.current,
            start: "top 85%",
            end: "bottom 70%",
            toggleActions: "play none none reverse",
          }
        }
      );
    }

    return () => {
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

  const handleEmailClick = () => {
    window.location.href = 'mailto:contact.menuru@gmail.com';
  };

  const handleSocialClick = (platform: string) => {
    console.log(`${platform} clicked`);
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

        .split-char {
          display: inline-block;
          will-change: transform, opacity, filter;
        }

        .split-char-menuru {
          display: inline-block;
          will-change: transform, opacity, filter;
          transform-style: preserve-3d;
        }

        /* Hover effect untuk contact button */
        .contact-btn-effect {
          position: relative;
          isolation: isolate;
          transition: all 0.3s ease;
          background-color: #000000 !important;
          color: #ffffff !important;
          border: 1.5px solid #333333 !important;
        }
        
        .contact-btn-effect::before {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 0%;
          background-color: #ffffff;
          transition: height 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
          z-index: -1;
          border-radius: 60px;
        }
        
        .contact-btn-effect:hover::before {
          height: 100%;
        }
        
        .contact-btn-effect:hover {
          color: #000000 !important;
          border-color: #e0e0e0 !important;
        }

        .contact-btn-effect .dot-small {
          background-color: #ffffff !important;
        }

        .contact-btn-effect:hover .dot-small {
          opacity: 0 !important;
          transform: scale(0) !important;
        }

        .circle-large-white {
          background-color: #ffffff !important;
        }

        .circle-large-white svg path {
          stroke: #000000 !important;
        }

        .contact-btn-effect:hover .circle-large-white {
          background-color: #000000 !important;
          opacity: 1 !important;
          transform: scale(1) !important;
        }

        .contact-btn-effect:hover .circle-large-white svg path {
          stroke: #ffffff !important;
        }

        .dot-small {
          transition: opacity 0.3s ease, transform 0.3s ease;
        }

        .circle-large-white {
          transition: opacity 0.3s ease, transform 0.3s ease, background-color 0.3s ease;
        }

        .social-item {
          transition: all 0.3s ease;
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
            {/* Konten pertama - 100vh */}
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
              
              <div style={{
                position: 'absolute',
                bottom: '8%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '40px',
                width: '100%'
              }}>
                {/* Teks "Mencatat apa yang kamu inginkan" dengan titik besar di akhir */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <div 
                    ref={mencatatTextRef}
                    style={{
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
                  <span style={{
                    fontSize: '80px',
                    color: 'white',
                    fontWeight: '400',
                    lineHeight: '1'
                  }}>.</span>
                </div>

                {/* Tombol Contact */}
                <button
                  ref={contactBtnRef}
                  onClick={handleContact}
                  className="contact-btn-effect"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '14px 36px',
                    borderRadius: '60px',
                    cursor: 'pointer',
                    fontSize: '20px',
                    fontWeight: '600',
                    letterSpacing: '-0.01em',
                    fontFamily: 'Questrial, sans-serif',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    zIndex: 1,
                    border: '1.5px solid #333333',
                    backgroundColor: '#000000',
                    color: '#ffffff'
                  }}
                >
                  <span ref={contactTextRef}>Contact</span>
                  
                  <div style={{
                    position: 'relative',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <div className="dot-small" style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#ffffff',
                      opacity: 1,
                      transform: 'scale(1)',
                      transition: 'opacity 0.3s ease, transform 0.3s ease',
                      position: 'absolute'
                    }}></div>
                    
                    <div className="circle-large-white" style={{
                      position: 'absolute',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transform: 'scale(0.8)',
                      transition: 'opacity 0.3s ease, transform 0.3s ease, background-color 0.3s ease'
                    }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 17L17 7M17 7H7M17 7V17" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Bagian footer */}
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
              {/* Email dan Medsos */}
              <div style={{
                position: 'relative',
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                padding: '0 80px',
                marginBottom: '30px',
                boxSizing: 'border-box'
              }}>
                {/* Email - Sisi Kiri (lebih ke bawah) */}
                <div 
                  ref={emailRef}
                  onClick={handleEmailClick}
                  style={{
                    fontFamily: "'Questrial', sans-serif",
                    fontSize: '32px',
                    color: '#FFFFFF',
                    fontWeight: '400',
                    letterSpacing: '0.02em',
                    cursor: 'pointer',
                    transition: 'opacity 0.3s ease',
                    opacity: 1,
                    marginBottom: '20px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  contact.menuru@gmail.com
                </div>

                {/* Medsos - Sisi Tengah 3 baris, tanpa panah SVG, jarak dekat */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  position: 'absolute',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginBottom: '20px'
                }}>
                  {/* Instagram */}
                  <div 
                    className="social-item"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      const textElement = e.currentTarget.querySelector('.social-text') as HTMLElement;
                      if (textElement) handleSocialHover(textElement, originalTexts.ig);
                    }}
                    onMouseLeave={(e) => {
                      const textElement = e.currentTarget.querySelector('.social-text') as HTMLElement;
                      if (textElement) handleSocialLeave(textElement, originalTexts.ig);
                    }}
                    onClick={() => handleSocialClick('Instagram')}
                  >
                    <span 
                      ref={igRef}
                      className="social-text"
                      style={{
                        fontFamily: "'Questrial', sans-serif",
                        fontSize: '28px',
                        color: '#FFFFFF',
                        fontWeight: '400',
                        letterSpacing: '0.02em'
                      }}
                    >
                      Instagram
                    </span>
                  </div>
                  
                  {/* X */}
                  <div 
                    className="social-item"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      const textElement = e.currentTarget.querySelector('.social-text') as HTMLElement;
                      if (textElement) handleSocialHover(textElement, originalTexts.x);
                    }}
                    onMouseLeave={(e) => {
                      const textElement = e.currentTarget.querySelector('.social-text') as HTMLElement;
                      if (textElement) handleSocialLeave(textElement, originalTexts.x);
                    }}
                    onClick={() => handleSocialClick('X')}
                  >
                    <span 
                      ref={xRef}
                      className="social-text"
                      style={{
                        fontFamily: "'Questrial', sans-serif",
                        fontSize: '28px',
                        color: '#FFFFFF',
                        fontWeight: '400',
                        letterSpacing: '0.02em'
                      }}
                    >
                      X
                    </span>
                  </div>
                  
                  {/* LinkedIn */}
                  <div 
                    className="social-item"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      const textElement = e.currentTarget.querySelector('.social-text') as HTMLElement;
                      if (textElement) handleSocialHover(textElement, originalTexts.linkedin);
                    }}
                    onMouseLeave={(e) => {
                      const textElement = e.currentTarget.querySelector('.social-text') as HTMLElement;
                      if (textElement) handleSocialLeave(textElement, originalTexts.linkedin);
                    }}
                    onClick={() => handleSocialClick('LinkedIn')}
                  >
                    <span 
                      ref={linkedinRef}
                      className="social-text"
                      style={{
                        fontFamily: "'Questrial', sans-serif",
                        fontSize: '28px',
                        color: '#FFFFFF',
                        fontWeight: '400',
                        letterSpacing: '0.02em'
                      }}
                    >
                      LinkedIn
                    </span>
                  </div>
                </div>
              </div>

              <footer style={{
                position: 'relative',
                bottom: 0,
                left: 0,
                right: 0,
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                padding: '0 80px 0 0',
                margin: 0,
                pointerEvents: 'none',
                zIndex: 1
              }}>
                {/* Garis putih - jarak ke bawah ditambah */}
                <div
                  ref={lineRef}
                  style={{
                    width: '0%',
                    height: '2px',
                    backgroundColor: '#FFFFFF',
                    marginRight: '0',
                    marginBottom: '60px',
                    opacity: 0
                  }}
                />
                
                {/* Teks MENURU besar */}
                <span 
                  ref={menuruTextRef}
                  style={{
                    fontFamily: "'Bebas Neue', 'Impact', 'Arial Black', sans-serif",
                    fontWeight: 'normal',
                    fontSize: '600px',
                    color: '#FFFFFF',
                    textAlign: 'right',
                    letterSpacing: '-0.02em',
                    opacity: 1,
                    textTransform: 'uppercase',
                    lineHeight: '0.7',
                    whiteSpace: 'nowrap',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                    fontKerning: 'normal',
                    margin: 0,
                    padding: 0,
                    transform: 'translateY(10px)',
                    marginRight: '0'
                  }}>
                  MENURU
                </span>
              </footer>
            </div>
          </div>
        </div>
      </div>

      {/* Cookie Popup */}
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
