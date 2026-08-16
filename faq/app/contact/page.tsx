// app/contact/page.tsx (Halaman Contact)
'use client';

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);
}

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyD_htQZ1TClnXKZGRJ4izbMQ02y6V3aNAQ",
  authDomain: "wawa44-58d1e.firebaseapp.com",
  databaseURL: "https://wawa44-58d1e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "wawa44-58d1e",
  storageBucket: "wawa44-58d1e.firebasestorage.app",
  messagingSenderId: "836899520599",
  appId: "1:836899520599:web:b346e4370ecfa9bb89e312",
  measurementId: "G-8LMP7F4BE9"
};

let app = null;
let db = null;

if (typeof window !== "undefined") {
  app = getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApps()[0];
  db = getFirestore(app);
}

// SVG Icons
const SouthEastArrow = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 17L17 7M17 17V7H7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const NorthWestArrow = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 17L7 7M7 17V7H17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const NorthEastArrow = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 7L17 17M17 7V17H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ArrowRight = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const FONT_FAMILY = "'Poppins', 'Poppins Fallback', sans-serif";

// FAQ Data
const faqData = [
  {
    id: 'shop',
    question: 'Shop',
    answer: 'Kamu bisa membeli produk-produk menarik dari komunitas Menuru. Tersedia berbagai merchandise eksklusif dan produk kreatif dari para creator.',
  },
  {
    id: 'blog',
    question: 'Blog',
    answer: 'Temukan artikel-artikel inspiratif, tutorial, dan berita terbaru seputar kreativitas, teknologi, dan pengembangan diri di blog Menuru.',
  },
  {
    id: 'donation',
    question: 'Donation',
    answer: 'Salurkan donasi Anda untuk membantu mereka yang membutuhkan. Setiap donasi akan disalurkan dengan transparan dan tepat sasaran.',
  },
  {
    id: 'note',
    question: 'Note',
    answer: 'Catat ide-ide kreatif Anda dengan mudah. Fitur note memungkinkan Anda menyimpan, mengatur, dan berbagi inspirasi kapan saja.',
  },
  {
    id: 'community',
    question: 'Community',
    answer: 'Bergabunglah dengan komunitas kreatif Menuru. Temukan teman baru, kolaborasi, dan dukungan untuk mengembangkan potensi Anda.',
  },
  {
    id: 'calendar',
    question: 'Calendar',
    answer: 'Atur jadwal Anda dengan mudah. Fitur calendar membantu Anda merencanakan aktivitas, deadline, dan event penting.',
  },
];

export default function ContactPage(): React.JSX.Element {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isMenuHovered, setIsMenuHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const smootherRef = useRef<any>(null);
  
  // Refs untuk teks yang akan di-split
  const contactTitleRef = useRef<HTMLDivElement>(null);
  
  // Refs untuk hover items
  const item01Ref = useRef<HTMLDivElement>(null);
  const item02Ref = useRef<HTMLDivElement>(null);
  const item03Ref = useRef<HTMLDivElement>(null);
  const item04Ref = useRef<HTMLDivElement>(null);
  const item05Ref = useRef<HTMLDivElement>(null);
  const hoverText01Ref = useRef<HTMLDivElement>(null);
  const hoverText02Ref = useRef<HTMLDivElement>(null);
  const hoverText03Ref = useRef<HTMLDivElement>(null);
  const hoverText04Ref = useRef<HTMLDivElement>(null);
  const hoverText05Ref = useRef<HTMLDivElement>(null);
  
  // Ref untuk menu button dan menu drawer
  const menuButtonRef = useRef<HTMLDivElement>(null);
  const menuDrawerRef = useRef<HTMLDivElement>(null);
  const plusIconRef = useRef<HTMLSpanElement>(null);

  // Refs untuk menu items di drawer
  const menuItemRefs = {
    note: useRef<HTMLDivElement>(null),
    blog: useRef<HTMLDivElement>(null),
    community: useRef<HTMLDivElement>(null),
    donation: useRef<HTMLDivElement>(null),
    calendar: useRef<HTMLDivElement>(null),
    contact: useRef<HTMLDivElement>(null),
  };

  // Animasi menu drawer muncul dari bawah ke atas
  useEffect(() => {
    if (isMenuOpen && menuDrawerRef.current) {
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
            if (menuDrawerRef.current) {
              menuDrawerRef.current.style.overflow = 'hidden';
            }
          }
        }
      );
      
      const menuItems = [
        menuItemRefs.note,
        menuItemRefs.blog,
        menuItemRefs.community,
        menuItemRefs.donation,
        menuItemRefs.calendar,
        menuItemRefs.contact
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

  // Animasi hover untuk item 01-05 menggunakan GSAP
  useEffect(() => {
    if (hoveredItem === '01' && hoverText01Ref.current && item01Ref.current) {
      gsap.fromTo(hoverText01Ref.current,
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
    } else if (hoveredItem !== '01' && hoverText01Ref.current) {
      gsap.to(hoverText01Ref.current, {
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
    if (hoveredItem === '02' && hoverText02Ref.current && item02Ref.current) {
      gsap.fromTo(hoverText02Ref.current,
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
      gsap.to(item02Ref.current, {
        scale: 1.02,
        duration: 0.3,
        ease: "power2.out"
      });
    } else if (hoveredItem !== '02' && hoverText02Ref.current) {
      gsap.to(hoverText02Ref.current, {
        opacity: 0,
        duration: 0.2,
        ease: "power2.in"
      });
      if (item02Ref.current) {
        gsap.to(item02Ref.current, {
          scale: 1,
          duration: 0.3,
          ease: "power2.out"
        });
      }
    }
  }, [hoveredItem]);

  useEffect(() => {
    if (hoveredItem === '03' && hoverText03Ref.current && item03Ref.current) {
      gsap.fromTo(hoverText03Ref.current,
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
      gsap.to(item03Ref.current, {
        scale: 1.02,
        duration: 0.3,
        ease: "power2.out"
      });
    } else if (hoveredItem !== '03' && hoverText03Ref.current) {
      gsap.to(hoverText03Ref.current, {
        opacity: 0,
        duration: 0.2,
        ease: "power2.in"
      });
      if (item03Ref.current) {
        gsap.to(item03Ref.current, {
          scale: 1,
          duration: 0.3,
          ease: "power2.out"
        });
      }
    }
  }, [hoveredItem]);

  useEffect(() => {
    if (hoveredItem === '04' && hoverText04Ref.current && item04Ref.current) {
      gsap.fromTo(hoverText04Ref.current,
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
      gsap.to(item04Ref.current, {
        scale: 1.02,
        duration: 0.3,
        ease: "power2.out"
      });
    } else if (hoveredItem !== '04' && hoverText04Ref.current) {
      gsap.to(hoverText04Ref.current, {
        opacity: 0,
        duration: 0.2,
        ease: "power2.in"
      });
      if (item04Ref.current) {
        gsap.to(item04Ref.current, {
          scale: 1,
          duration: 0.3,
          ease: "power2.out"
        });
      }
    }
  }, [hoveredItem]);

  useEffect(() => {
    if (hoveredItem === '05' && hoverText05Ref.current && item05Ref.current) {
      gsap.fromTo(hoverText05Ref.current,
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
      gsap.to(item05Ref.current, {
        scale: 1.02,
        duration: 0.3,
        ease: "power2.out"
      });
    } else if (hoveredItem !== '05' && hoverText05Ref.current) {
      gsap.to(hoverText05Ref.current, {
        opacity: 0,
        duration: 0.2,
        ease: "power2.in"
      });
      if (item05Ref.current) {
        gsap.to(item05Ref.current, {
          scale: 1,
          duration: 0.3,
          ease: "power2.out"
        });
      }
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

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const handleMenuClick = () => {
    if (!isMenuOpen) {
      setIsMenuOpen(true);
      if (plusIconRef.current) {
        gsap.to(plusIconRef.current, {
          rotation: 45,
          duration: 0.4,
          ease: "power2.out"
        });
      }
    } else {
      if (menuDrawerRef.current) {
        gsap.to(menuDrawerRef.current, {
          y: '100%',
          opacity: 0,
          duration: 0.6,
          ease: "power3.in",
          onComplete: () => {
            setIsMenuOpen(false);
            if (menuDrawerRef.current) {
              menuDrawerRef.current.style.display = 'none';
            }
          }
        });
      } else {
        setIsMenuOpen(false);
      }
      if (plusIconRef.current) {
        gsap.to(plusIconRef.current, {
          rotation: 0,
          duration: 0.4,
          ease: "power2.in"
        });
      }
    }
  };

  const toggleFaq = (id: string) => {
    if (activeFaq === id) {
      setActiveFaq(null);
    } else {
      setActiveFaq(id);
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setSubscribeStatus('error');
      setTimeout(() => setSubscribeStatus('idle'), 3000);
      return;
    }

    setIsSubmitting(true);
    setSubscribeStatus('idle');

    try {
      if (!db) {
        throw new Error('Firebase not initialized');
      }
      
      await addDoc(collection(db, 'subscribers'), {
        email: email,
        subscribedAt: new Date().toISOString(),
        source: 'contact_page'
      });

      setSubscribeStatus('success');
      setEmail('');
      setTimeout(() => setSubscribeStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving email:', error);
      setSubscribeStatus('error');
      setTimeout(() => setSubscribeStatus('idle'), 3000);
    } finally {
      setIsSubmitting(false);
    }
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
          min-height: 560vh;
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

        .split-char-menuru-menu {
          display: inline-block;
          will-change: transform, opacity, filter;
          transform-style: preserve-3d;
        }

        .subscribe-input {
          background: transparent;
          border: none;
          border-bottom: none;
          outline: none;
          font-family: 'Poppins', sans-serif;
          font-size: 18px;
          padding: 12px 16px;
          width: 100%;
          color: #000000;
          background: #f5f5f5;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .subscribe-input:focus {
          background: #eeeeee;
          box-shadow: 0 0 0 2px #0D3CFC;
        }

        .subscribe-input::placeholder {
          color: #999;
          font-weight: 300;
        }
      `}</style>
      
      <div id="smooth-wrapper-contact">
        <div id="smooth-content-contact">
          <div style={{
            minHeight: '560vh',
            backgroundColor: 'white',
            margin: 0,
            padding: 0,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: FONT_FAMILY,
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            position: 'relative',
          }}>
            {/* JUDUL WEBSITE - pojok kiri atas */}
            <div style={{
              position: 'fixed',
              top: '40px',
              left: '40px',
              zIndex: isMenuOpen ? 98 : 100,
              pointerEvents: 'none'
            }}>
              <span style={{
                fontFamily: FONT_FAMILY,
                fontWeight: 700,
                fontSize: '48px',
                color: '#000000',
                letterSpacing: '-0.03em',
                textTransform: 'none',
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale'
              }}>
                Menuru
              </span>
            </div>

            {/* NAVBAR - pojok kanan atas */}
            <div style={{
              position: 'fixed',
              top: '40px',
              right: '40px',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 16px',
              borderRadius: '12px',
              backgroundColor: isMenuOpen ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0)',
              backdropFilter: isMenuOpen ? 'blur(20px)' : 'blur(0px)',
              transition: 'all 0.3s ease',
              pointerEvents: 'auto',
              boxShadow: isMenuOpen ? '0 4px 20px rgba(0,0,0,0.1)' : 'none',
            }}>
              {/* Get in Touch */}
              <Link href="/contact">
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    border: '2px solid #0D3CFC',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    backgroundColor: 'transparent',
                  }}
                >
                  <span
                    style={{
                      fontSize: '16px',
                      fontWeight: 500,
                      color: '#0D3CFC',
                      fontFamily: FONT_FAMILY,
                      display: 'inline-block',
                    }}
                  >
                    Get in touch
                  </span>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#0D3CFC',
                      borderRadius: '4px',
                      padding: '4px',
                      color: '#ffffff',
                    }}
                  >
                    <SouthEastArrow size={24} />
                  </div>
                </div>
              </Link>

              {/* Pusat Bantuan */}
              <Link href="/pusat-bantuan">
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    border: '2px solid #000000',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    backgroundColor: 'transparent',
                  }}
                >
                  <span
                    style={{
                      fontSize: '16px',
                      fontWeight: 500,
                      color: '#000000',
                      fontFamily: FONT_FAMILY,
                      display: 'inline-block',
                    }}
                  >
                    Pusat Bantuan
                  </span>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#000000',
                      borderRadius: '4px',
                      padding: '4px',
                      color: '#ffffff',
                    }}
                  >
                    <NorthWestArrow size={24} />
                  </div>
                </div>
              </Link>

              {/* Menu */}
              <div
                ref={menuButtonRef}
                onClick={handleMenuClick}
                onMouseEnter={() => setIsMenuHovered(true)}
                onMouseLeave={() => setIsMenuHovered(false)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  border: '2px solid #000000',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  backgroundColor: 'transparent',
                }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#000000',
                    borderRadius: '4px',
                    padding: '4px',
                    color: '#ffffff',
                  }}
                >
                  <span
                    ref={plusIconRef}
                    style={{
                      fontSize: '28px',
                      fontWeight: 300,
                      fontFamily: FONT_FAMILY,
                      lineHeight: 1,
                      display: 'inline-block',
                      transform: 'rotate(0deg)',
                    }}
                  >
                    +
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '16px',
                    fontWeight: 500,
                    color: '#000000',
                    fontFamily: FONT_FAMILY,
                    letterSpacing: '0.02em',
                    display: 'inline-block',
                  }}
                >
                  Menu
                </span>
              </div>
            </div>

            {/* Menu Drawer - BG BIRU #0D3CFC */}
            <div
              ref={menuDrawerRef}
              style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                width: '100%',
                height: '100%',
                backgroundColor: '#0D3CFC',
                zIndex: 99,
                display: 'none',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                transform: 'translateY(-100%)',
                opacity: 0,
                pointerEvents: isMenuOpen ? 'auto' : 'none',
                padding: '40px',
                boxSizing: 'border-box',
                overflow: 'hidden'
              }}
            >
              {/* Judul MENURU putih di bg menu */}
              <h1
                style={{
                  position: 'absolute',
                  top: '40px',
                  left: '40px',
                  fontSize: '48px',
                  fontWeight: 700,
                  color: '#ffffff',
                  fontFamily: FONT_FAMILY,
                  letterSpacing: '-0.03em',
                  margin: 0,
                  padding: 0,
                  lineHeight: 1,
                  opacity: 0.9,
                }}
              >
                Menuru
              </h1>

              {/* Menu items - tengah */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  gap: '30px',
                }}
              >
                <Link href="/" style={{ 
                  color: '#ffffff', 
                  fontSize: '48px', 
                  textDecoration: 'none',
                  fontFamily: FONT_FAMILY,
                  fontWeight: 500,
                  transition: 'opacity 0.3s',
                  opacity: 0.8,
                }}>Home</Link>
                <Link href="/about" style={{ 
                  color: '#ffffff', 
                  fontSize: '48px', 
                  textDecoration: 'none',
                  fontFamily: FONT_FAMILY,
                  fontWeight: 500,
                  transition: 'opacity 0.3s',
                  opacity: 0.8,
                }}>About</Link>
                <Link href="/contact" style={{ 
                  color: '#ffffff', 
                  fontSize: '48px', 
                  textDecoration: 'none',
                  fontFamily: FONT_FAMILY,
                  fontWeight: 500,
                  transition: 'opacity 0.3s',
                  opacity: 0.8,
                }}>Contact</Link>
                <Link href="/pusat-bantuan" style={{ 
                  color: '#ffffff', 
                  fontSize: '48px', 
                  textDecoration: 'none',
                  fontFamily: FONT_FAMILY,
                  fontWeight: 500,
                  transition: 'opacity 0.3s',
                  opacity: 0.8,
                }}>Pusat Bantuan</Link>
              </div>
            </div>

            {/* Teks Contact besar 300px */}
            <div style={{
              position: 'relative',
              top: '120px',
              left: '40px',
              zIndex: 10,
              width: 'calc(100% - 80px)',
              marginBottom: '40px'
            }}>
              <div 
                ref={contactTitleRef}
                style={{
                  fontFamily: FONT_FAMILY,
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
            </div>

            {/* Teks subtitle dan tombol di bawah Contact */}
            <div style={{
              position: 'relative',
              top: '120px',
              left: '40px',
              zIndex: 10,
              width: 'calc(100% - 80px)',
              marginBottom: '100px'
            }}>
              <p
                style={{
                  fontSize: '40px',
                  fontWeight: 400,
                  color: '#0D3CFC',
                  fontFamily: FONT_FAMILY,
                  lineHeight: 1.2,
                  margin: 0,
                  padding: 0,
                  paddingBottom: '30px',
                  whiteSpace: 'pre-line',
                }}
              >
                {`You can take notes, find ideas,\nand donate money to those in need`}
              </p>

              {/* Tombol dan Arrow */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '20px' }}>
                <Link href="/signup">
                  <div
                    style={{
                      display: 'inline-block',
                      border: '2px solid #0D3CFC',
                      borderRadius: '8px',
                      padding: '12px 28px',
                      cursor: 'pointer',
                      backgroundColor: 'transparent',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '18px',
                        fontWeight: 500,
                        color: '#0D3CFC',
                        fontFamily: FONT_FAMILY,
                        letterSpacing: '0.02em',
                      }}
                    >
                      Let's build now
                    </span>
                  </div>
                </Link>

                <Link href="/signup">
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid #0D3CFC',
                      borderRadius: '8px',
                      padding: '10px',
                      cursor: 'pointer',
                      backgroundColor: '#0D3CFC',
                      color: '#ffffff',
                      width: '50px',
                      height: '50px',
                    }}
                  >
                    <NorthEastArrow size={24} />
                  </div>
                </Link>
              </div>
            </div>

            {/* 01-05 Items */}
            <div style={{
              position: 'relative',
              top: '150px',
              left: '40px',
              right: '40px',
              zIndex: 10,
              marginBottom: '40px'
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '40px',
                marginLeft: '80px',
                marginBottom: '60px',
                maxWidth: '900px',
              }}>
                {/* 01 - Note */}
                <div
                  ref={item01Ref}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease'
                  }}
                  onMouseEnter={() => setHoveredItem('01')}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <span style={{
                      fontFamily: FONT_FAMILY,
                      fontSize: '60px',
                      fontWeight: '300',
                      color: '#000000',
                      letterSpacing: '-0.02em',
                      lineHeight: '1'
                    }}>
                      01
                    </span>
                    <span style={{
                      fontFamily: FONT_FAMILY,
                      fontSize: '160px',
                      fontWeight: '300',
                      color: '#000000',
                      letterSpacing: '-0.02em'
                    }}>
                      Note
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
                    <span style={{
                      fontFamily: FONT_FAMILY,
                      fontSize: '16px',
                      fontWeight: '500',
                      color: '#ffffff',
                      backgroundColor: '#0D3CFC',
                      padding: '8px 20px',
                      borderRadius: '8px',
                      letterSpacing: '0.02em',
                      border: '2px solid #0D3CFC',
                    }}>
                      ComingSoon
                    </span>
                    {hoveredItem === '01' && (
                      <div
                        ref={hoverText01Ref}
                        style={{
                          fontFamily: FONT_FAMILY,
                          fontSize: '18px',
                          fontWeight: '400',
                          color: '#000000',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        / kamu bisa mencatat apa yang kamu inginkan
                      </div>
                    )}
                  </div>
                </div>

                {/* 02 - Calendar */}
                <div
                  ref={item02Ref}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease'
                  }}
                  onMouseEnter={() => setHoveredItem('02')}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <span style={{
                      fontFamily: FONT_FAMILY,
                      fontSize: '60px',
                      fontWeight: '300',
                      color: '#000000',
                      letterSpacing: '-0.02em',
                      lineHeight: '1'
                    }}>
                      02
                    </span>
                    <span style={{
                      fontFamily: FONT_FAMILY,
                      fontSize: '160px',
                      fontWeight: '300',
                      color: '#000000',
                      letterSpacing: '-0.02em'
                    }}>
                      Calendar
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
                    <span style={{
                      fontFamily: FONT_FAMILY,
                      fontSize: '16px',
                      fontWeight: '500',
                      color: '#ffffff',
                      backgroundColor: '#0D3CFC',
                      padding: '8px 20px',
                      borderRadius: '8px',
                      letterSpacing: '0.02em',
                      border: '2px solid #0D3CFC',
                    }}>
                      ComingSoon
                    </span>
                    {hoveredItem === '02' && (
                      <div
                        ref={hoverText02Ref}
                        style={{
                          fontFamily: FONT_FAMILY,
                          fontSize: '18px',
                          fontWeight: '400',
                          color: '#000000',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        / kamu bisa memikirkan jadwal apa yang kamu inginkan
                      </div>
                    )}
                  </div>
                </div>

                {/* 03 - Donation */}
                <div
                  ref={item03Ref}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease'
                  }}
                  onMouseEnter={() => setHoveredItem('03')}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <span style={{
                      fontFamily: FONT_FAMILY,
                      fontSize: '60px',
                      fontWeight: '300',
                      color: '#000000',
                      letterSpacing: '-0.02em',
                      lineHeight: '1'
                    }}>
                      03
                    </span>
                    <span style={{
                      fontFamily: FONT_FAMILY,
                      fontSize: '160px',
                      fontWeight: '300',
                      color: '#000000',
                      letterSpacing: '-0.02em'
                    }}>
                      Donation
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
                    <span style={{
                      fontFamily: FONT_FAMILY,
                      fontSize: '16px',
                      fontWeight: '500',
                      color: '#ffffff',
                      backgroundColor: '#0D3CFC',
                      padding: '8px 20px',
                      borderRadius: '8px',
                      letterSpacing: '0.02em',
                      border: '2px solid #0D3CFC',
                    }}>
                      ComingSoon
                    </span>
                    {hoveredItem === '03' && (
                      <div
                        ref={hoverText03Ref}
                        style={{
                          fontFamily: FONT_FAMILY,
                          fontSize: '18px',
                          fontWeight: '400',
                          color: '#000000',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        / kamu bisa membagikan uang apa yang kamu inginkan
                      </div>
                    )}
                  </div>
                </div>

                {/* 04 - Community */}
                <div
                  ref={item04Ref}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease'
                  }}
                  onMouseEnter={() => setHoveredItem('04')}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <span style={{
                      fontFamily: FONT_FAMILY,
                      fontSize: '60px',
                      fontWeight: '300',
                      color: '#000000',
                      letterSpacing: '-0.02em',
                      lineHeight: '1'
                    }}>
                      04
                    </span>
                    <span style={{
                      fontFamily: FONT_FAMILY,
                      fontSize: '160px',
                      fontWeight: '300',
                      color: '#000000',
                      letterSpacing: '-0.02em'
                    }}>
                      Community
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
                    <span style={{
                      fontFamily: FONT_FAMILY,
                      fontSize: '16px',
                      fontWeight: '500',
                      color: '#ffffff',
                      backgroundColor: '#0D3CFC',
                      padding: '8px 20px',
                      borderRadius: '8px',
                      letterSpacing: '0.02em',
                      border: '2px solid #0D3CFC',
                    }}>
                      ComingSoon
                    </span>
                    {hoveredItem === '04' && (
                      <div
                        ref={hoverText04Ref}
                        style={{
                          fontFamily: FONT_FAMILY,
                          fontSize: '18px',
                          fontWeight: '400',
                          color: '#000000',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        / kamu bisa mencari apa yang kamu inginkan
                      </div>
                    )}
                  </div>
                </div>

                {/* 05 - Shop */}
                <div
                  ref={item05Ref}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    cursor: 'pointer',
                    transition: 'transform 0.3s ease'
                  }}
                  onMouseEnter={() => setHoveredItem('05')}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <span style={{
                      fontFamily: FONT_FAMILY,
                      fontSize: '60px',
                      fontWeight: '300',
                      color: '#000000',
                      letterSpacing: '-0.02em',
                      lineHeight: '1'
                    }}>
                      05
                    </span>
                    <span style={{
                      fontFamily: FONT_FAMILY,
                      fontSize: '160px',
                      fontWeight: '300',
                      color: '#000000',
                      letterSpacing: '-0.02em'
                    }}>
                      Shop
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
                    <span style={{
                      fontFamily: FONT_FAMILY,
                      fontSize: '16px',
                      fontWeight: '500',
                      color: '#ffffff',
                      backgroundColor: '#0D3CFC',
                      padding: '8px 20px',
                      borderRadius: '8px',
                      letterSpacing: '0.02em',
                      border: '2px solid #0D3CFC',
                    }}>
                      ComingSoon
                    </span>
                    {hoveredItem === '05' && (
                      <div
                        ref={hoverText05Ref}
                        style={{
                          fontFamily: FONT_FAMILY,
                          fontSize: '18px',
                          fontWeight: '400',
                          color: '#000000',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        / kamu bisa membeli apa yang kamu inginkan
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* FAQ Section */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginLeft: '80px',
                marginTop: '60px',
                maxWidth: '1100px',
                gap: '40px',
              }}>
                {/* Kiri - FAQ + "Apakah kamu punya kesulitan?" */}
                <div style={{
                  flex: '0 0 350px',
                  position: 'sticky',
                  top: '200px',
                }}>
                  <h2 style={{
                    fontFamily: FONT_FAMILY,
                    fontSize: '50px',
                    fontWeight: '600',
                    color: '#000000',
                    margin: 0,
                    letterSpacing: '-0.02em',
                    lineHeight: 1.2,
                  }}>
                    FAQ
                  </h2>
                  <p style={{
                    fontFamily: FONT_FAMILY,
                    fontSize: '50px',
                    fontWeight: '400',
                    color: '#0D3CFC',
                    margin: 0,
                    marginTop: '20px',
                    letterSpacing: '-0.01em',
                    lineHeight: 1.2,
                  }}>
                    Apakah kamu punya kesulitan?
                  </p>
                </div>

                {/* Kanan - FAQ Items + Subscribe + Product */}
                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '15px',
                }}>
                  {faqData.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        borderBottom: '1px solid #e8e8e8',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Pertanyaan - Biru 50px */}
                      <div
                        onClick={() => toggleFaq(item.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          padding: '15px 0',
                          transition: 'all 0.3s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '0.7';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '1';
                        }}
                      >
                        <span style={{
                          fontFamily: FONT_FAMILY,
                          fontSize: '50px',
                          fontWeight: '500',
                          color: '#0D3CFC',
                          letterSpacing: '-0.02em',
                          lineHeight: '1.2',
                        }}>
                          {item.question}
                        </span>
                        <motion.div
                          animate={{
                            rotate: activeFaq === item.id ? 45 : 0,
                          }}
                          transition={{ duration: 0.3 }}
                          style={{
                            fontSize: '30px',
                            fontWeight: 300,
                            color: '#0D3CFC',
                            cursor: 'pointer',
                            flexShrink: 0,
                          }}
                        >
                          +
                        </motion.div>
                      </div>

                      {/* Jawaban - Hitam 30px */}
                      <AnimatePresence>
                        {activeFaq === item.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: 'easeInOut' }}
                            style={{
                              overflow: 'hidden',
                            }}
                          >
                            <p style={{
                              fontFamily: FONT_FAMILY,
                              fontSize: '30px',
                              fontWeight: '300',
                              color: '#000000',
                              padding: '0 0 20px 0',
                              margin: 0,
                              lineHeight: 1.5,
                              letterSpacing: '-0.01em',
                            }}>
                              {item.answer}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}

                  {/* FOOTER SECTION - Talk with an Menuru (Kiri) + Product (Tengah) */}
                  <div style={{
                    marginTop: '60px',
                    borderTop: '2px solid #e0e0e0',
                    paddingTop: '50px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '40px',
                  }}>
                    {/* Kiri - Talk with an Menuru */}
                    <div style={{
                      flex: '0 0 45%',
                    }}>
                      <h3 style={{
                        fontFamily: FONT_FAMILY,
                        fontSize: '32px',
                        fontWeight: '600',
                        color: '#0D3CFC',
                        margin: 0,
                        marginBottom: '8px',
                        letterSpacing: '-0.01em',
                      }}>
                        Talk with an Menuru
                      </h3>
                      <p style={{
                        fontFamily: FONT_FAMILY,
                        fontSize: '14px',
                        fontWeight: '300',
                        color: '#666',
                        margin: 0,
                        marginBottom: '16px',
                        letterSpacing: '0.01em',
                      }}>
                        Get the latest updates from Menuru
                      </p>

                      <form onSubmit={handleSubscribe} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                      }}>
                        <input
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="subscribe-input"
                          style={{
                            flex: 1,
                            background: '#f5f5f5',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '10px 14px',
                            fontSize: '14px',
                            fontFamily: FONT_FAMILY,
                            outline: 'none',
                            transition: 'all 0.3s ease',
                            color: '#000000',
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.boxShadow = '0 0 0 2px #0D3CFC';
                            e.currentTarget.style.background = '#eeeeee';
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.boxShadow = 'none';
                            e.currentTarget.style.background = '#f5f5f5';
                          }}
                        />
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#0D3CFC',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '10px 14px',
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            color: '#ffffff',
                            transition: 'all 0.3s ease',
                            opacity: isSubmitting ? 0.6 : 1,
                            flexShrink: 0,
                          }}
                          onMouseEnter={(e) => {
                            if (!isSubmitting) {
                              e.currentTarget.style.backgroundColor = '#000000';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSubmitting) {
                              e.currentTarget.style.backgroundColor = '#0D3CFC';
                            }
                          }}
                        >
                          <ArrowRight size={20} />
                        </button>
                      </form>

                      {subscribeStatus === 'success' && (
                        <p style={{
                          fontFamily: FONT_FAMILY,
                          fontSize: '13px',
                          color: '#0D3CFC',
                          marginTop: '8px',
                          marginBottom: 0,
                        }}>
                          ✓ Berhasil berlangganan!
                        </p>
                      )}
                      {subscribeStatus === 'error' && (
                        <p style={{
                          fontFamily: FONT_FAMILY,
                          fontSize: '13px',
                          color: '#ff4444',
                          marginTop: '8px',
                          marginBottom: 0,
                        }}>
                          ✗ Email tidak valid atau terjadi kesalahan
                        </p>
                      )}
                    </div>

                    {/* Tengah - Product */}
                    <div style={{
                      flex: '0 0 35%',
                    }}>
                      <h3 style={{
                        fontFamily: FONT_FAMILY,
                        fontSize: '28px',
                        fontWeight: '600',
                        color: '#000000',
                        margin: 0,
                        marginBottom: '16px',
                        letterSpacing: '-0.01em',
                      }}>
                        Product
                      </h3>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                      }}>
                        <span style={{
                          fontFamily: FONT_FAMILY,
                          fontSize: '50px',
                          fontWeight: '400',
                          color: '#0D3CFC',
                          letterSpacing: '-0.01em',
                          lineHeight: 1.2,
                        }}>
                          Shop
                        </span>
                        <span style={{
                          fontFamily: FONT_FAMILY,
                          fontSize: '50px',
                          fontWeight: '400',
                          color: '#0D3CFC',
                          letterSpacing: '-0.01em',
                          lineHeight: 1.2,
                        }}>
                          Note
                        </span>
                        <span style={{
                          fontFamily: FONT_FAMILY,
                          fontSize: '50px',
                          fontWeight: '400',
                          color: '#0D3CFC',
                          letterSpacing: '-0.01em',
                          lineHeight: 1.2,
                        }}>
                          Calendar
                        </span>
                        <span style={{
                          fontFamily: FONT_FAMILY,
                          fontSize: '50px',
                          fontWeight: '400',
                          color: '#0D3CFC',
                          letterSpacing: '-0.01em',
                          lineHeight: 1.2,
                        }}>
                          Blog
                        </span>
                        <span style={{
                          fontFamily: FONT_FAMILY,
                          fontSize: '50px',
                          fontWeight: '400',
                          color: '#0D3CFC',
                          letterSpacing: '-0.01em',
                          lineHeight: 1.2,
                        }}>
                          Donation
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
