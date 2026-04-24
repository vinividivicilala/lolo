// app/donatur/page.tsx (Halaman Donatur)
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

export default function DonaturPage(): React.JSX.Element {
  const [showPopup, setShowPopup] = useState(false);
  const [isMenuHovered, setIsMenuHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const acceptBtnRef = useRef<HTMLButtonElement>(null);
  const declineBtnRef = useRef<HTMLButtonElement>(null);
  const smootherRef = useRef<any>(null);
  
  // Refs untuk teks yang akan di-split
  const menuruTextRef = useRef<HTMLSpanElement>(null);
  const donaturTitleRef = useRef<HTMLDivElement>(null);
  const donaturUnderlineRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLDivElement>(null);
  const igRef = useRef<HTMLDivElement>(null);
  const xRef = useRef<HTMLDivElement>(null);
  const linkedinRef = useRef<HTMLDivElement>(null);
  const infoTextRef = useRef<HTMLDivElement>(null);
  
  // Ref untuk menu button dan menu drawer
  const menuButtonRef = useRef<HTMLDivElement>(null);
  const menuDrawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLDivElement>(null);
  const menuMenuruTextRef = useRef<HTMLSpanElement>(null);

  // Refs untuk menu items di drawer
  const menuItemRefs = {
    note: useRef<HTMLDivElement>(null),
    blog: useRef<HTMLDivElement>(null),
    community: useRef<HTMLDivElement>(null),
    donation: useRef<HTMLDivElement>(null),
    calendar: useRef<HTMLDivElement>(null),
    donatur: useRef<HTMLDivElement>(null),
  };

  // Variabel untuk menyimpan teks asli medsos
  const originalTexts = {
    ig: 'Instagram',
    x: 'X',
    linkedin: 'LinkedIn'
  };

  // Animasi menu drawer muncul dari bawah ke atas
  useEffect(() => {
    if (isMenuOpen && menuDrawerRef.current) {
      // Disable scroll pada body saat menu terbuka
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      
      gsap.fromTo(menuDrawerRef.current,
        {
          y: '100%',
          opacity: 0
        },
        {
          y: '0%',
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          display: 'flex',
          onComplete: () => {
            // Pastikan tidak ada scroll
            if (menuDrawerRef.current) {
              menuDrawerRef.current.style.overflow = 'hidden';
            }
          }
        }
      );
      
      // Animasi teks MENURU besar di halaman menu
      if (menuMenuruTextRef.current) {
        const splitMenuMenuru = new SplitText(menuMenuruTextRef.current, {
          type: "chars",
          charsClass: "split-char-menuru-menu"
        });
        
        gsap.fromTo(splitMenuMenuru.chars,
          {
            opacity: 0,
            y: 100,
            rotationX: -90,
            filter: 'blur(10px)'
          },
          {
            opacity: 1,
            y: 0,
            rotationX: 0,
            filter: 'blur(0px)',
            duration: 1,
            stagger: 0.03,
            ease: "back.out(1.2)"
          }
        );
      }
      
      // Animasi menu items
      const menuItems = [
        menuItemRefs.note,
        menuItemRefs.blog,
        menuItemRefs.community,
        menuItemRefs.donation,
        menuItemRefs.calendar,
        menuItemRefs.donatur
      ];
      
      menuItems.forEach((item, index) => {
        if (item.current) {
          gsap.fromTo(item.current,
            {
              opacity: 0,
              x: -50,
              filter: 'blur(10px)'
            },
            {
              opacity: 1,
              x: 0,
              filter: 'blur(0px)',
              duration: 0.6,
              delay: 0.2 + (index * 0.08),
              ease: "power2.out"
            }
          );
        }
      });
    } else if (!isMenuOpen && menuDrawerRef.current) {
      // Enable scroll kembali saat menu tertutup
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      
      gsap.to(menuDrawerRef.current, {
        y: '100%',
        opacity: 0,
        duration: 0.6,
        ease: "power3.in",
        onComplete: () => {
          if (menuDrawerRef.current) {
            menuDrawerRef.current.style.display = 'none';
          }
        }
      });
    }
  }, [isMenuOpen]);

  // Animasi hover menu button
  useEffect(() => {
    if (menuButtonRef.current) {
      if (isMenuHovered) {
        gsap.to(menuButtonRef.current, {
          scale: 1.05,
          duration: 0.3,
          ease: "power2.out"
        });
      } else {
        gsap.to(menuButtonRef.current, {
          scale: 1,
          duration: 0.3,
          ease: "power2.out"
        });
      }
    }
  }, [isMenuHovered]);

  // Animasi hover untuk menu items di drawer
  const handleMenuItemHover = (ref: React.RefObject<HTMLDivElement>, isHover: boolean) => {
    if (ref.current) {
      if (isHover) {
        gsap.to(ref.current, {
          x: 15,
          duration: 0.3,
          ease: "power2.out"
        });
      } else {
        gsap.to(ref.current, {
          x: 0,
          duration: 0.3,
          ease: "power2.out"
        });
      }
    }
  };

  // Animasi saat klik menu item
  const handleMenuItemClick = (ref: React.RefObject<HTMLDivElement>, href: string) => {
    if (ref.current) {
      gsap.to(ref.current, {
        scale: 0.95,
        duration: 0.15,
        ease: "power2.in",
        onComplete: () => {
          gsap.to(ref.current, {
            scale: 1,
            duration: 0.15,
            ease: "power2.out",
            onComplete: () => {
              setIsMenuOpen(false);
              setTimeout(() => {
                window.location.href = href;
              }, 300);
            }
          });
        }
      });
    } else {
      setIsMenuOpen(false);
      setTimeout(() => {
        window.location.href = href;
      }, 300);
    }
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
    const initSmoother = () => {
      if (typeof window !== 'undefined' && !smootherRef.current) {
        smootherRef.current = ScrollSmoother.create({
          wrapper: "#smooth-wrapper-donatur",
          content: "#smooth-content-donatur",
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
    if (donaturTitleRef.current) {
      const splitDonatur = new SplitText(donaturTitleRef.current, {
        type: "chars",
        charsClass: "split-char-donatur"
      });

      gsap.fromTo(splitDonatur.chars,
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
            trigger: donaturTitleRef.current,
            start: "top 85%",
            end: "bottom 70%",
            toggleActions: "play none none reverse",
          }
        }
      );
    }

    if (donaturUnderlineRef.current) {
      gsap.fromTo(donaturUnderlineRef.current,
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
            trigger: donaturUnderlineRef.current,
            start: "top 85%",
            end: "bottom 70%",
            toggleActions: "play none none reverse",
          }
        }
      );
    }

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

  const handleMenuClick = () => {
    setIsMenuOpen(true);
  };

  const handleCloseMenu = () => {
    setIsMenuOpen(false);
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
        
        #smooth-wrapper-donatur {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: 1;
        }
        
        #smooth-content-donatur {
          min-height: 250vh;
          width: 100%;
          will-change: transform;
        }

        .split-char {
          display: inline-block;
          will-change: transform, opacity, filter;
        }

        .split-char-donatur {
          display: inline-block;
          will-change: transform, opacity, filter;
        }

        .split-char-menuru {
          display: inline-block;
          will-change: transform, opacity, filter;
          transform-style: preserve-3d;
        }

        .split-char-menuru-menu {
          display: inline-block;
          will-change: transform, opacity, filter;
          transform-style: preserve-3d;
        }

        .social-item {
          transition: all 0.3s ease;
        }
      `}</style>
      
      <div id="smooth-wrapper-donatur">
        <div id="smooth-content-donatur">
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
            {/* Tombol Menu */}
            <div
              ref={menuButtonRef}
              onClick={handleMenuClick}
              onMouseEnter={() => setIsMenuHovered(true)}
              onMouseLeave={() => setIsMenuHovered(false)}
              style={{
                position: 'fixed',
                top: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 100,
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                padding: '20px 40px',
                backgroundColor: '#000000',
                borderRadius: '80px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              <span style={{
                fontFamily: "'Questrial', sans-serif",
                fontSize: '24px',
                fontWeight: '400',
                color: '#ffffff',
                letterSpacing: '0.02em'
              }}>
                Menu
              </span>
              
              <div style={{
                position: 'relative',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div
                  style={{
                    width: isMenuHovered ? '40px' : '10px',
                    height: isMenuHovered ? '40px' : '10px',
                    borderRadius: '50%',
                    backgroundColor: '#e49366',
                    position: 'absolute',
                    transition: 'width 0.3s ease, height 0.3s ease',
                    opacity: isMenuHovered ? 0 : 1
                  }}
                />
                <div
                  style={{
                    width: isMenuHovered ? '40px' : '0px',
                    height: isMenuHovered ? '40px' : '0px',
                    borderRadius: '50%',
                    backgroundColor: '#e49366',
                    position: 'absolute',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'width 0.3s ease, height 0.3s ease',
                    opacity: isMenuHovered ? 1 : 0
                  }}
                >
                  <div style={{ width: '20px', height: '2px', backgroundColor: '#000000', borderRadius: '2px' }} />
                  <div style={{ width: '20px', height: '2px', backgroundColor: '#000000', borderRadius: '2px' }} />
                </div>
              </div>
            </div>

            {/* Menu Drawer - tanpa scroll */}
            <div
              ref={menuDrawerRef}
              style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                width: '100%',
                height: '100%',
                backgroundColor: '#000000',
                zIndex: 200,
                display: 'none',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                padding: '60px',
                boxSizing: 'border-box',
                overflow: 'hidden'
              }}
            >
              {/* Tombol Close (X) besar bulat */}
              <div
                ref={closeButtonRef}
                onClick={handleCloseMenu}
                onMouseEnter={(e) => {
                  gsap.to(e.currentTarget, { scale: 1.1, duration: 0.2 });
                }}
                onMouseLeave={(e) => {
                  gsap.to(e.currentTarget, { scale: 1, duration: 0.2 });
                }}
                style={{
                  position: 'absolute',
                  top: '40px',
                  right: '40px',
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: '#e49366',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              {/* Teks MENURU besar di sisi kanan bawah - font Archivo Black */}
              <div
                ref={menuMenuruTextRef}
                style={{
                  position: 'absolute',
                  bottom: '40px',
                  right: '40px',
                  fontFamily: "'Archivo Black', 'Impact', sans-serif",
                  fontSize: '180px',
                  fontWeight: '400',
                  color: 'rgba(255,255,255,0.15)',
                  letterSpacing: '-0.02em',
                  textTransform: 'uppercase',
                  lineHeight: '0.8',
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap'
                }}
              >
                MENURU
              </div>

              {/* Teks judul web di samping kiri atas */}
              <div style={{
                position: 'absolute',
                top: '40px',
                left: '40px',
                fontFamily: "'Bebas Neue', 'Impact', 'Arial Black', sans-serif",
                fontSize: '48px',
                color: '#ffffff',
                letterSpacing: '-0.02em',
                textTransform: 'uppercase'
              }}>
                MENURU
              </div>

              {/* 6 Menu Items - di sisi kiri tengah, jarak dekat */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                marginTop: '120px',
                marginLeft: '40px'
              }}>
                {/* Note */}
                <div
                  ref={menuItemRefs.note}
                  onMouseEnter={() => handleMenuItemHover(menuItemRefs.note, true)}
                  onMouseLeave={() => handleMenuItemHover(menuItemRefs.note, false)}
                  onClick={() => handleMenuItemClick(menuItemRefs.note, '/note')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    cursor: 'pointer',
                    opacity: 0
                  }}
                >
                  <span style={{
                    fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
                    fontSize: '64px',
                    fontWeight: '300',
                    color: '#ffffff',
                    letterSpacing: '-0.02em'
                  }}>
                    Note
                  </span>
                </div>

                {/* Blog */}
                <div
                  ref={menuItemRefs.blog}
                  onMouseEnter={() => handleMenuItemHover(menuItemRefs.blog, true)}
                  onMouseLeave={() => handleMenuItemHover(menuItemRefs.blog, false)}
                  onClick={() => handleMenuItemClick(menuItemRefs.blog, '/blog')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    cursor: 'pointer',
                    opacity: 0
                  }}
                >
                  <span style={{
                    fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
                    fontSize: '64px',
                    fontWeight: '300',
                    color: '#ffffff',
                    letterSpacing: '-0.02em'
                  }}>
                    Blog
                  </span>
                </div>

                {/* Community */}
                <div
                  ref={menuItemRefs.community}
                  onMouseEnter={() => handleMenuItemHover(menuItemRefs.community, true)}
                  onMouseLeave={() => handleMenuItemHover(menuItemRefs.community, false)}
                  onClick={() => handleMenuItemClick(menuItemRefs.community, '/community')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    cursor: 'pointer',
                    opacity: 0
                  }}
                >
                  <span style={{
                    fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
                    fontSize: '64px',
                    fontWeight: '300',
                    color: '#ffffff',
                    letterSpacing: '-0.02em'
                  }}>
                    Community
                  </span>
                </div>

                {/* Donation */}
                <div
                  ref={menuItemRefs.donation}
                  onMouseEnter={() => handleMenuItemHover(menuItemRefs.donation, true)}
                  onMouseLeave={() => handleMenuItemHover(menuItemRefs.donation, false)}
                  onClick={() => handleMenuItemClick(menuItemRefs.donation, '/donation')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    cursor: 'pointer',
                    opacity: 0
                  }}
                >
                  <span style={{
                    fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
                    fontSize: '64px',
                    fontWeight: '300',
                    color: '#ffffff',
                    letterSpacing: '-0.02em'
                  }}>
                    Donation
                  </span>
                </div>

                {/* Calendar */}
                <div
                  ref={menuItemRefs.calendar}
                  onMouseEnter={() => handleMenuItemHover(menuItemRefs.calendar, true)}
                  onMouseLeave={() => handleMenuItemHover(menuItemRefs.calendar, false)}
                  onClick={() => handleMenuItemClick(menuItemRefs.calendar, '/calendar')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    cursor: 'pointer',
                    opacity: 0
                  }}
                >
                  <span style={{
                    fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
                    fontSize: '64px',
                    fontWeight: '300',
                    color: '#ffffff',
                    letterSpacing: '-0.02em'
                  }}>
                    Calendar
                  </span>
                </div>

                {/* Donatur - dengan panah SVG */}
                <div
                  ref={menuItemRefs.donatur}
                  onClick={() => handleMenuItemClick(menuItemRefs.donatur, '/donatur')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    cursor: 'pointer',
                    opacity: 0
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <span style={{
                      fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
                      fontSize: '64px',
                      fontWeight: '300',
                      color: '#ffffff',
                      letterSpacing: '-0.02em'
                    }}>
                      Donatur
                    </span>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 17L17 7M17 7H7M17 7V17" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Tombol Back ke Home */}
            <div style={{
              position: 'fixed',
              top: '20px',
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
              top: '20px',
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

            {/* Teks Donatur besar 300px */}
            <div style={{
              position: 'relative',
              top: '120px',
              left: '40px',
              zIndex: 10,
              width: 'calc(100% - 80px)',
              marginBottom: '100px'
            }}>
              <div 
                ref={donaturTitleRef}
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
                Donatur
              </div>
              <div
                ref={donaturUnderlineRef}
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
                Terima kasih untuk para donatur yang telah berbagi kebaikan
              </div>
            </div>

            {/* Email dan Medsos */}
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

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                marginBottom: '20px'
              }}>
                <div 
                  className="social-item"
                  style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
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
                  <span ref={igRef} className="social-text" style={{ fontFamily: "'Questrial', sans-serif", fontSize: '28px', color: '#000000', fontWeight: '400', letterSpacing: '0.02em' }}>Instagram</span>
                </div>
                <div 
                  className="social-item"
                  style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
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
                  <span ref={xRef} className="social-text" style={{ fontFamily: "'Questrial', sans-serif", fontSize: '28px', color: '#000000', fontWeight: '400', letterSpacing: '0.02em' }}>X</span>
                </div>
                <div 
                  className="social-item"
                  style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
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
                  <span ref={linkedinRef} className="social-text" style={{ fontFamily: "'Questrial', sans-serif", fontSize: '28px', color: '#000000', fontWeight: '400', letterSpacing: '0.02em' }}>LinkedIn</span>
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
              <div ref={lineRef} style={{ width: '0%', height: '2px', backgroundColor: '#000000', marginRight: '0', marginBottom: '60px', opacity: 0 }} />
              <span ref={menuruTextRef} style={{ fontFamily: "'Bebas Neue', 'Impact', 'Arial Black', sans-serif", fontWeight: 'normal', fontSize: '600px', color: '#000000', textAlign: 'right', letterSpacing: '-0.02em', opacity: 1, textTransform: 'uppercase', lineHeight: '0.7', whiteSpace: 'nowrap', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale', fontKerning: 'normal', margin: 0, padding: 0, transform: 'translateY(10px)', marginRight: '0' }}>MENURU</span>
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
          <style>{`@keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }`}</style>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '56px', display: 'inline-block' }}>🍪</span>
              <span style={{ fontWeight: '700', fontSize: '36px', letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #000000 0%, #333333 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent', fontFamily: 'Questrial, sans-serif' }}>cookies.</span>
            </div>
            <p style={{ fontSize: '20px', lineHeight: '1.4', marginBottom: 0, color: '#1a1a1a', fontWeight: '400', letterSpacing: '-0.01em', maxWidth: '280px', fontFamily: 'Questrial, sans-serif' }}>I use cookies to understand how you navigate<br />this site and what topics interest you most.</p>
            <span style={{ color: '#666', fontSize: '18px', display: 'inline-block', marginTop: '4px', fontFamily: 'Questrial, sans-serif' }}>No ads, no data sold ever.</span>
          </div>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-start', flexShrink: 0 }}>
            <button ref={declineBtnRef} onClick={handleDecline} style={{ padding: '14px 32px', backgroundColor: '#ffffff', color: '#000000', border: '1.5px solid #e0e0e0', borderRadius: '60px', cursor: 'pointer', fontSize: '18px', fontWeight: '600', letterSpacing: '-0.01em', fontFamily: 'Questrial, sans-serif', transition: 'all 0.2s ease', position: 'relative', overflow: 'hidden', zIndex: 1, background: '#ffffff' }}>Decline</button>
            <button ref={acceptBtnRef} onClick={handleAccept} style={{ padding: '14px 32px', backgroundColor: '#ffffff', color: '#000000', border: '1.5px solid #e0e0e0', borderRadius: '60px', cursor: 'pointer', fontSize: '18px', fontWeight: '600', letterSpacing: '-0.01em', fontFamily: 'Questrial, sans-serif', transition: 'all 0.2s ease', position: 'relative', overflow: 'hidden', zIndex: 1, background: '#ffffff' }}>Accept</button>
          </div>
        </div>
      )}
    </>
  );
}
