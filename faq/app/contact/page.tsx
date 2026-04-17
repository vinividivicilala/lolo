// app/contact/page.tsx (Halaman Contact)
'use client';

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import Link from "next/link";

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);
}

export default function ContactPage(): React.JSX.Element {
  const [showPopup, setShowPopup] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const acceptBtnRef = useRef<HTMLButtonElement>(null);
  const declineBtnRef = useRef<HTMLButtonElement>(null);
  const smootherRef = useRef<any>(null);
  
  // Refs untuk teks yang akan di-split
  const menuruTextRef = useRef<HTMLSpanElement>(null);
  const contactTitleRef = useRef<HTMLDivElement>(null);
  const contactUnderlineRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLDivElement>(null);
  const igRef = useRef<HTMLDivElement>(null);
  const xRef = useRef<HTMLDivElement>(null);
  const linkedinRef = useRef<HTMLDivElement>(null);
  const infoTextRef = useRef<HTMLDivElement>(null);
  
  // Refs untuk hover items
  const item01Ref = useRef<HTMLDivElement>(null);
  const item02Ref = useRef<HTMLDivElement>(null);
  const item03Ref = useRef<HTMLDivElement>(null);
  const item04Ref = useRef<HTMLDivElement>(null);
  const hoverTextRef = useRef<HTMLDivElement>(null);

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

  // Animasi hover untuk item 01-04 menggunakan GSAP
  useEffect(() => {
    if (hoveredItem === '01' && hoverTextRef.current && item01Ref.current) {
      gsap.fromTo(hoverTextRef.current,
        {
          opacity: 0,
          x: -20,
          filter: 'blur(5px)'
        },
        {
          opacity: 1,
          x: 0,
          filter: 'blur(0px)',
          duration: 0.4,
          ease: "power2.out"
        }
      );
      gsap.to(item01Ref.current, {
        scale: 1.02,
        duration: 0.3,
        ease: "power2.out"
      });
    } else if (hoveredItem !== '01' && hoverTextRef.current) {
      gsap.to(hoverTextRef.current, {
        opacity: 0,
        duration: 0.2,
        ease: "power2.in"
      });
      if (item01Ref.current) {
        gsap.to(item01Ref.current, {
          scale: 1,
          duration: 0.3,
          ease: "power2.out"
        });
      }
    }
  }, [hoveredItem]);

  useEffect(() => {
    if (hoveredItem === '02' && item02Ref.current) {
      gsap.to(item02Ref.current, {
        scale: 1.02,
        duration: 0.3,
        ease: "power2.out"
      });
    } else if (hoveredItem !== '02' && item02Ref.current) {
      gsap.to(item02Ref.current, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out"
      });
    }
  }, [hoveredItem]);

  useEffect(() => {
    if (hoveredItem === '03' && item03Ref.current) {
      gsap.to(item03Ref.current, {
        scale: 1.02,
        duration: 0.3,
        ease: "power2.out"
      });
    } else if (hoveredItem !== '03' && item03Ref.current) {
      gsap.to(item03Ref.current, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out"
      });
    }
  }, [hoveredItem]);

  useEffect(() => {
    if (hoveredItem === '04' && item04Ref.current) {
      gsap.to(item04Ref.current, {
        scale: 1.02,
        duration: 0.3,
        ease: "power2.out"
      });
    } else if (hoveredItem !== '04' && item04Ref.current) {
      gsap.to(item04Ref.current, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out"
      });
    }
  }, [hoveredItem]);

  useEffect(() => {
    const initSmoother = () => {
      if (typeof window !== 'undefined' && !smootherRef.current) {
        smootherRef.current = ScrollSmoother.create({
          wrapper: "#smooth-wrapper-contact",
          content: "#smooth-content-contact",
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
    // Split text untuk "Contact"
    if (contactTitleRef.current) {
      const splitContact = new SplitText(contactTitleRef.current, {
        type: "chars",
        charsClass: "split-char-contact"
      });

      gsap.fromTo(splitContact.chars,
        {
          opacity: 0,
          x: -50,
          filter: 'blur(10px)'
        },
        {
          opacity: 1,
          x: 0,
          filter: 'blur(0px)',
          duration: 1,
          stagger: 0.04,
          ease: "back.out(1.2)",
          scrollTrigger: {
            trigger: contactTitleRef.current,
            start: "top 85%",
            end: "bottom 70%",
            toggleActions: "play none none reverse",
          }
        }
      );
    }

    // Animasi garis bawah teks Contact
    if (contactUnderlineRef.current) {
      gsap.fromTo(contactUnderlineRef.current,
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
            trigger: contactUnderlineRef.current,
            start: "top 85%",
            end: "bottom 70%",
            toggleActions: "play none none reverse",
          }
        }
      );
    }

    // Split text untuk info text
    if (infoTextRef.current) {
      const splitInfo = new SplitText(infoTextRef.current, {
        type: "chars",
        charsClass: "split-char"
      });

      gsap.fromTo(splitInfo.chars,
        {
          opacity: 0,
          y: 30,
          filter: 'blur(5px)'
        },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.8,
          stagger: 0.02,
          ease: "power2.out",
          scrollTrigger: {
            trigger: infoTextRef.current,
            start: "top 85%",
            end: "bottom 70%",
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

    // Animasi garis hitam
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
          background-color: white;
        }
        
        #smooth-wrapper-contact {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: 1;
        }
        
        #smooth-content-contact {
          min-height: 250vh;
          width: 100%;
          will-change: transform;
        }

        .split-char {
          display: inline-block;
          will-change: transform, opacity, filter;
        }

        .split-char-contact {
          display: inline-block;
          will-change: transform, opacity, filter;
        }

        .split-char-menuru {
          display: inline-block;
          will-change: transform, opacity, filter;
          transform-style: preserve-3d;
        }

        .social-item {
          transition: all 0.3s ease;
        }
      `}</style>
      
      <div id="smooth-wrapper-contact">
        <div id="smooth-content-contact">
          <div style={{
            minHeight: '250vh',
            backgroundColor: 'white',
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
            {/* Tombol Back ke Home */}
            <div style={{
              position: 'fixed',
              top: '40px',
              left: '40px',
              zIndex: 100
            }}>
              <Link href="/">
                <button style={{
                  fontFamily: "'Questrial', sans-serif",
                  fontSize: '16px',
                  color: '#000000',
                  backgroundColor: 'transparent',
                  border: '1px solid #000000',
                  borderRadius: '60px',
                  padding: '10px 24px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#000000';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#000000';
                }}>
                  ← Back to Home
                </button>
              </Link>
            </div>

            {/* Judul Website MENURU - pojok kanan atas */}
            <div style={{
              position: 'fixed',
              top: '40px',
              right: '40px',
              zIndex: 100,
              pointerEvents: 'none'
            }}>
              <span style={{
                fontFamily: "'Bebas Neue', 'Impact', 'Arial Black', sans-serif",
                fontWeight: 'normal',
                fontSize: '48px',
                color: '#000000',
                letterSpacing: '-0.02em',
                textTransform: 'uppercase',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale'
              }}>
                MENURU
              </span>
            </div>

            {/* Teks Contact besar 300px */}
            <div style={{
              position: 'relative',
              top: '120px',
              left: '40px',
              zIndex: 10,
              width: 'calc(100% - 80px)',
              marginBottom: '100px'
            }}>
              <div 
                ref={contactTitleRef}
                style={{
                  fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
                  fontSize: '300px',
                  fontWeight: '300',
                  color: '#000000',
                  textAlign: 'left',
                  letterSpacing: '-0.02em',
                  textTransform: 'none',
                  lineHeight: '1',
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale'
                }}>
                Contact
              </div>
              {/* Garis bawah teks Contact */}
              <div
                ref={contactUnderlineRef}
                style={{
                  width: '0%',
                  height: '2px',
                  backgroundColor: '#000000',
                  marginTop: '20px',
                  opacity: 0
                }}
              />
            </div>

            {/* Info Text di bawah garis */}
            <div style={{
              position: 'relative',
              top: '150px',
              left: '40px',
              right: '40px',
              zIndex: 10,
              marginBottom: '200px'
            }}>
              <div 
                ref={infoTextRef}
                style={{
                  fontFamily: "'Questrial', sans-serif",
                  fontSize: '64px',
                  fontWeight: '400',
                  color: '#000000',
                  textAlign: 'center',
                  letterSpacing: '-0.01em',
                  lineHeight: '1.2',
                  marginBottom: '100px'
                }}>
                You can know contact Website this Menuru
              </div>

              {/* Daftar item 01-04 - semua angka 300px */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '60px',
                marginLeft: '80px',
                marginBottom: '150px'
              }}>
               {/* 01 - Note */}
<div
  ref={item01Ref}
  style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: '800px',
    cursor: 'pointer',
    transition: 'transform 0.3s ease'
  }}
  onMouseEnter={() => setHoveredItem('01')}
  onMouseLeave={() => setHoveredItem(null)}
>
  <span style={{
    fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
    fontSize: '90px',
    fontWeight: '300',
    color: '#000000',
    letterSpacing: '-0.02em',
    lineHeight: '1'
  }}>
    01
  </span>
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '30px'
  }}>
    <span style={{
      fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
      fontSize: '300px',
      fontWeight: '300',
      color: '#000000',
      letterSpacing: '-0.02em'
    }}>
      Note
    </span>
    {/* Hover text untuk 01 - muncul di samping kanan */}
    {hoveredItem === '01' && (
      <div
        ref={hoverTextRef}
        style={{
          fontFamily: "'Questrial', sans-serif",
          fontSize: '20px',
          fontWeight: '400',
          color: '#000000',
          whiteSpace: 'nowrap'
        }}
      >
        / kamu bisa mencatat apa yang kamu inginkan
      </div>
    )}


                {/* 02 - Calendar */}
                <div
                  ref={item02Ref}
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    maxWidth: '600px',
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease'
                  }}
                  onMouseEnter={() => setHoveredItem('02')}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <span style={{
                    fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
                    fontSize: '90px',
                    fontWeight: '300',
                    color: '#000000',
                    letterSpacing: '-0.02em',
                    lineHeight: '1'
                  }}>
                    02
                  </span>
                  <span style={{
                    fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
                    fontSize: '300px',
                    fontWeight: '300',
                    color: '#000000',
                    letterSpacing: '-0.02em'
                  }}>
                    Calendar
                  </span>
                </div>

                {/* 03 - Donation */}
                <div
                  ref={item03Ref}
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    maxWidth: '600px',
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease'
                  }}
                  onMouseEnter={() => setHoveredItem('03')}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <span style={{
                    fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
                    fontSize: '90px',
                    fontWeight: '300',
                    color: '#000000',
                    letterSpacing: '-0.02em',
                    lineHeight: '1'
                  }}>
                    03
                  </span>
                  <span style={{
                    fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
                    fontSize: '300px',
                    fontWeight: '300',
                    color: '#000000',
                    letterSpacing: '-0.02em'
                  }}>
                    Donation
                  </span>
                </div>

                {/* 04 - Community */}
                <div
                  ref={item04Ref}
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    maxWidth: '600px',
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease'
                  }}
                  onMouseEnter={() => setHoveredItem('04')}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <span style={{
                    fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
                    fontSize: '90px',
                    fontWeight: '300',
                    color: '#000000',
                    letterSpacing: '-0.02em',
                    lineHeight: '1'
                  }}>
                    04
                  </span>
                  <span style={{
                    fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
                    fontSize: '300px',
                    fontWeight: '300',
                    color: '#000000',
                    letterSpacing: '-0.02em'
                  }}>
                    Community
                  </span>
                </div>
              </div>
            </div>

            {/* Email dan Medsos - di bagian bawah */}
            <div style={{
              position: 'relative',
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              padding: '0 80px',
              marginBottom: '30px',
              boxSizing: 'border-box',
              marginTop: 'auto'
            }}>
              {/* Email - Sisi Kiri */}
              <div 
                ref={emailRef}
                onClick={handleEmailClick}
                style={{
                  fontFamily: "'Questrial', sans-serif",
                  fontSize: '32px',
                  color: '#000000',
                  fontWeight: '400',
                  letterSpacing: '0.02em',
                  cursor: 'pointer',
                  transition: 'opacity 0.3s ease',
                  opacity: 1,
                  marginBottom: '20px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.5'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                contact.menuru@gmail.com
              </div>

              {/* Medsos - Sisi Tengah 3 baris */}
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
                      color: '#000000',
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
                      color: '#000000',
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
                      color: '#000000',
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
              {/* Garis hitam */}
              <div
                ref={lineRef}
                style={{
                  width: '0%',
                  height: '2px',
                  backgroundColor: '#000000',
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
                  color: '#000000',
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
