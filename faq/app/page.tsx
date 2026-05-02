// app/page.tsx (Halaman Utama)
'use client';

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import Link from "next/link";

// Dynamic import untuk Firebase agar tidak di-load saat build
let db: any = null;
let getFirestore: any = null;
let doc: any = null;
let getDoc: any = null;
let initializeApp: any = null;

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);
  
  // Load Firebase hanya di client side
  const loadFirebase = async () => {
    const firebaseModule = await import('firebase/app');
    const firestoreModule = await import('firebase/firestore');
    
    initializeApp = firebaseModule.initializeApp;
    getFirestore = firestoreModule.getFirestore;
    doc = firestoreModule.doc;
    getDoc = firestoreModule.getDoc;
    
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "YOUR_API_KEY",
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "YOUR_APP_ID"
    };
    
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  };
  
  loadFirebase();
}

export default function HomePage(): React.JSX.Element {
  const [showPopup, setShowPopup] = useState(false);
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const acceptBtnRef = useRef<HTMLButtonElement>(null);
  const declineBtnRef = useRef<HTMLButtonElement>(null);
  const contactBtnRef = useRef<HTMLButtonElement>(null);
  const smootherRef = useRef<any>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);
  
  // Refs untuk teks yang akan di-split
  const mencatatTextRef = useRef<HTMLDivElement>(null);
  const menuruTextRef = useRef<HTMLSpanElement>(null);
  const menuruTopTextRef = useRef<HTMLDivElement>(null);
  const menuruTopMainRef = useRef<HTMLDivElement>(null);
  const brandTextRef = useRef<HTMLDivElement>(null);
  const yearTextRef = useRef<HTMLDivElement>(null);
  const contactTextRef = useRef<HTMLSpanElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLDivElement>(null);
  const igRef = useRef<HTMLDivElement>(null);
  const xRef = useRef<HTMLDivElement>(null);
  const linkedinRef = useRef<HTMLDivElement>(null);
  const loadingOverlayRef = useRef<HTMLDivElement>(null);
  const callTextRef = useRef<HTMLDivElement>(null);

  // Set isClient to true after mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Variabel untuk menyimpan teks asli medsos
  const originalTexts = {
    ig: 'Instagram',
    x: 'X',
    linkedin: 'LinkedIn'
  };

  // Fetch announcement from Firebase (only on client)
  useEffect(() => {
    const fetchAnnouncement = async () => {
      if (!isClient) return;
      
      try {
        if (db && doc && getDoc) {
          const announcementRef = doc(db, 'announcements', 'current');
          const announcementSnap = await getDoc(announcementRef);
          
          if (announcementSnap.exists()) {
            const data = announcementSnap.data();
            if (data.expiryDate && new Date(data.expiryDate) > new Date()) {
              setAnnouncement(data.message);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching announcement:', error);
      }
    };
    
    fetchAnnouncement();
  }, [isClient]);

  // Fungsi untuk mendapatkan huruf random (A-Z)
  const getRandomChar = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    return chars[Math.floor(Math.random() * chars.length)];
  };

  // Fungsi untuk mengacak huruf pada teks
  const randomizeText = (element: HTMLElement, originalText: string, duration: number = 0.5) => {
    if (typeof window === 'undefined') return;
    
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
    if (typeof window === 'undefined') return;
    
    if (!element.getAttribute('data-original')) {
      element.setAttribute('data-original', originalText);
    }
    
    const interval = randomizeText(element, originalText, 0.6);
    element.setAttribute('data-interval', String(interval));
  };
  
  const handleSocialLeave = (element: HTMLElement, originalText: string) => {
    if (typeof window === 'undefined') return;
    
    const interval = element.getAttribute('data-interval');
    if (interval) {
      clearInterval(Number(interval));
    }
    element.textContent = originalText;
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Initialize ScrollSmoother
    const initSmoother = () => {
      if (!smootherRef.current) {
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

  // Animasi loading overlay dengan SplitText modern
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (isLoading && loadingOverlayRef.current) {
      const splitMenuruLoading = new SplitText(menuruTopTextRef.current, {
        type: "chars, words",
        charsClass: "split-char-loading"
      });

      const splitBrand = new SplitText(brandTextRef.current, {
        type: "chars, words",
        charsClass: "split-char-loading"
      });

      const splitYear = new SplitText(yearTextRef.current, {
        type: "chars",
        charsClass: "split-char-loading"
      });

      if (splitMenuruLoading.chars) {
        gsap.set(splitMenuruLoading.chars, {
          opacity: 0,
          y: 120,
          rotationX: -120,
          rotationY: 45,
          transformPerspective: 1200,
          filter: 'blur(25px)',
          transformOrigin: '50% 50% -80px'
        });
      }

      if (splitBrand.chars) {
        gsap.set(splitBrand.chars, {
          opacity: 0,
          x: 100,
          rotationY: 90,
          transformPerspective: 1200,
          filter: 'blur(20px)',
          transformOrigin: '50% 50% -50px'
        });
      }

      if (splitYear.chars) {
        gsap.set(splitYear.chars, {
          opacity: 0,
          y: 80,
          rotationX: -60,
          transformPerspective: 1000,
          filter: 'blur(15px)',
          transformOrigin: '50% 50% -30px'
        });
      }

      const loadingTimeline = gsap.timeline({
        onComplete: () => {
          // Overlay geser ke kiri
          gsap.to(loadingOverlayRef.current, {
            x: '-100%',
            duration: 1,
            ease: "power3.inOut",
            onComplete: () => {
              setIsLoading(false);
              // Animasi MENURU muncul dari kiri ke kanan
              animateMenuruMain();
              // Animasi teks Call Farid
              animateCallText();
            }
          });
          
          // Halaman utama geser dari kanan ke kiri
          gsap.fromTo(mainContentRef.current,
            {
              x: '100%',
              opacity: 0.5
            },
            {
              x: '0%',
              opacity: 1,
              duration: 1,
              ease: "power3.inOut"
            }
          );
        }
      });

      loadingTimeline.to(splitMenuruLoading.chars, {
        opacity: 1,
        y: 0,
        rotationX: 0,
        rotationY: 0,
        filter: 'blur(0px)',
        duration: 1.2,
        stagger: { each: 0.05, from: "start", ease: "back.out(1.2)" },
        ease: "back.out(0.8)"
      }, 0);

      loadingTimeline.to(splitBrand.chars, {
        opacity: 1,
        x: 0,
        rotationY: 0,
        filter: 'blur(0px)',
        duration: 1,
        stagger: { each: 0.04, from: "end", ease: "power2.out" },
        ease: "back.out(1)"
      }, 0.2);

      loadingTimeline.to(splitYear.chars, {
        opacity: 1,
        y: 0,
        rotationX: 0,
        filter: 'blur(0px)',
        duration: 0.9,
        stagger: { each: 0.08, from: "start", ease: "bounce.out" },
        ease: "back.out(1.1)"
      }, 0.4);

      return () => {
        loadingTimeline.kill();
      };
    }
  }, [isLoading]);

  // Animasi MENURU di halaman utama - SLIDE IN DARI KIRI KE KANAN, DIAM
  const animateMenuruMain = () => {
    if (typeof window === 'undefined') return;
    
    if (menuruTopMainRef.current) {
      // Set initial state: di luar layar sebelah kiri
      gsap.set(menuruTopMainRef.current, {
        x: -500,
        opacity: 0
      });

      // Animasi slide in dari kiri ke kanan, lalu diam
      gsap.to(menuruTopMainRef.current, {
        x: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power2.out",
        delay: 0.1
      });
    }
  };

  // Animasi teks Call Farid
  const animateCallText = () => {
    if (typeof window === 'undefined') return;
    
    if (callTextRef.current) {
      const splitCall = new SplitText(callTextRef.current, {
        type: "lines",
        linesClass: "split-line"
      });

      gsap.fromTo(splitCall.lines,
        {
          opacity: 0,
          y: 50,
          filter: 'blur(10px)'
        },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 1,
          stagger: 0.2,
          ease: "power3.out",
          delay: 0.3
        }
      );
    }
  };

  // GSAP SplitText animations untuk konten utama lainnya
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (!isLoading) {
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
          stagger: { each: 0.04, from: "start", ease: "power2.out" },
          ease: "back.out(0.8)",
          scrollTrigger: {
            trigger: menuruTextRef.current,
            start: "top 85%",
            end: "bottom 65%",
            toggleActions: "play none none reverse",
          }
        });
      }

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
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [isLoading]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const consent = localStorage.getItem('cookieConsent');
    if (consent === null) {
      setShowPopup(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
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
            background-color: #ffffff;
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
            color: #000000 !important;
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
    if (typeof window === 'undefined') return;
    localStorage.setItem('cookieConsent', 'accepted');
    setShowPopup(false);
  };

  const handleDecline = () => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('cookieConsent', 'declined');
    setShowPopup(false);
  };

  const handleContact = () => {};

  const handleEmailClick = () => {
    if (typeof window === 'undefined') return;
    window.location.href = 'mailto:contact.menuru@gmail.com';
  };

  const handleSocialClick = (platform: string) => {};

  // Prevent hydration errors by not rendering GSAP-dependent content until client-side
  if (!isClient) {
    return null;
  }

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

        .split-char-loading {
          display: inline-block;
          will-change: transform, opacity, filter;
          transform-style: preserve-3d;
        }

        .split-line {
          display: block;
          overflow: hidden;
          will-change: transform, opacity, filter;
        }

        .contact-btn-effect {
          position: relative;
          isolation: isolate;
          transition: all 0.3s ease;
          background-color: #ffffff !important;
          color: #000000 !important;
          border: 1.5px solid #cccccc !important;
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
          color: #ffffff !important;
          border-color: #333333 !important;
        }

        .contact-btn-effect .dot-small {
          background-color: #000000 !important;
        }

        .contact-btn-effect:hover .dot-small {
          opacity: 0 !important;
          transform: scale(0) !important;
        }

        .circle-large-white {
          background-color: #000000 !important;
        }

        .circle-large-white svg path {
          stroke: #ffffff !important;
        }

        .contact-btn-effect:hover .circle-large-white {
          background-color: #ffffff !important;
          opacity: 1 !important;
          transform: scale(1) !important;
        }

        .contact-btn-effect:hover .circle-large-white svg path {
          stroke: #000000 !important;
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

        .cookie-link {
          transition: opacity 0.3s ease;
        }
        
        .cookie-link:hover {
          opacity: 0.7;
        }

        .call-text-line {
          display: block;
          margin-bottom: 5px;
        }
      `}</style>
      
      {/* LOADING OVERLAY */}
      {isLoading && (
        <div
          ref={loadingOverlayRef}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: '#000000',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'auto',
          }}
        >
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '40px',
            fontFamily: 'Inter, "Helvetica Neue", sans-serif',
            fontWeight: '400',
            fontSize: '219px',
            lineHeight: '219px',
            color: '#ffffff',
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}>
            <span ref={menuruTopTextRef}>MENURU</span>
          </div>

          <div style={{
            position: 'absolute',
            top: '50%',
            right: '60px',
            transform: 'translateY(-50%)',
            fontFamily: 'Inter, "Helvetica Neue", sans-serif',
            fontWeight: '400',
            fontSize: '219px',
            lineHeight: '219px',
            color: '#ffffff',
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            textAlign: 'right',
          }}>
            <span ref={brandTextRef}>BRAND</span>
          </div>

          <div style={{
            position: 'absolute',
            bottom: '40px',
            right: '60px',
            fontFamily: 'Inter, "Helvetica Neue", sans-serif',
            fontWeight: '400',
            fontSize: '219px',
            lineHeight: '219px',
            color: '#ffffff',
            letterSpacing: '-0.02em',
            whiteSpace: 'nowrap',
          }}>
            <span ref={yearTextRef}>2026</span>
          </div>
        </div>
      )}

      <div id="smooth-wrapper">
        <div id="smooth-content">
          <div 
            ref={mainContentRef}
            style={{
              minHeight: '200vh',
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
              opacity: isLoading ? 0 : 1,
              transform: isLoading ? 'translateX(100%)' : 'translateX(0)',
              transition: 'all 0.01s ease'
            }}
          >
            {/* TEKS MENURU DI HALAMAN UTAMA - SLIDE IN DARI KIRI KE KANAN, DIAM */}
            <div
              ref={menuruTopMainRef}
              style={{
                position: 'absolute',
                top: '10px',
                left: '40px',
                zIndex: 10,
                fontFamily: 'Inter, "Helvetica Neue", sans-serif',
                fontWeight: '400',
                fontSize: '213px',
                lineHeight: '213px',
                color: '#000000',
                letterSpacing: '-0.02em',
                textTransform: 'uppercase',
                margin: 0,
                padding: 0,
                whiteSpace: 'nowrap',
                pointerEvents: 'auto',
                opacity: 0,
                transform: 'translateX(-500px)'
              }}
            >
              MENURU
            </div>

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
                color: 'black',
                fontSize: '24px',
                opacity: 0.5
              }}>
                Scroll down ↓
              </div>
              
              <div style={{
                position: 'absolute',
                bottom: '8%',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                gap: '40px',
                width: '85%',
                maxWidth: '1400px'
              }}>
                {/* LEFT SIDE - Call Farid Text */}
                <div
                  ref={callTextRef}
                  style={{
                    flex: 1,
                    textAlign: 'left',
                    fontFamily: "'Questrial', sans-serif",
                    fontSize: '28px',
                    color: '#000000',
                    fontWeight: '400',
                    letterSpacing: '-0.02em',
                    lineHeight: '1.3',
                    marginBottom: '10px'
                  }}
                >
                  <div style={{ marginBottom: '8px' }}>Ready to surpass your</div>
                  <div style={{ marginBottom: '8px' }}>wildest dreams?</div>
                  <div style={{ fontWeight: '500', color: '#333333' }}>Call Farid.</div>
                </div>

                {/* RIGHT SIDE - Existing content */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: '40px'
                }}>
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
                        color: 'black',
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
                      color: 'black',
                      fontWeight: '400',
                      lineHeight: '1'
                    }}>.</span>
                  </div>

                  <Link href="/contact">
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
                        border: '1.5px solid #cccccc',
                        backgroundColor: '#ffffff',
                        color: '#000000'
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
                          backgroundColor: '#000000',
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
                          backgroundColor: '#000000',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: 0,
                          transform: 'scale(0.8)',
                          transition: 'opacity 0.3s ease, transform 0.3s ease, background-color 0.3s ease'
                        }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7 17L17 7M17 7H7M17 7V17" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </div>
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Bagian footer */}
            <div style={{
              width: '100%',
              position: 'relative',
              backgroundColor: 'white',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              alignItems: 'center',
              minHeight: '100vh'
            }}>
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
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
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
                    <span ref={igRef} className="social-text" style={{
                      fontFamily: "'Questrial', sans-serif",
                      fontSize: '28px',
                      color: '#000000',
                      fontWeight: '400',
                      letterSpacing: '0.02em'
                    }}>Instagram</span>
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
                    <span ref={xRef} className="social-text" style={{
                      fontFamily: "'Questrial', sans-serif",
                      fontSize: '28px',
                      color: '#000000',
                      fontWeight: '400',
                      letterSpacing: '0.02em'
                    }}>X</span>
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
                    <span ref={linkedinRef} className="social-text" style={{
                      fontFamily: "'Questrial', sans-serif",
                      fontSize: '28px',
                      color: '#000000',
                      fontWeight: '400',
                      letterSpacing: '0.02em'
                    }}>LinkedIn</span>
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
      </div>

      {/* Cookie Popup */}
      {showPopup && !isLoading && (
        <div style={{
          position: 'fixed',
          bottom: '30px',
          left: '30px',
          right: '30px',
          backgroundColor: '#000000',
          color: '#ffffff',
          borderRadius: '32px',
          padding: '28px 40px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3), 0 5px 12px rgba(0,0,0,0.1)',
          zIndex: 1000,
          fontFamily: 'Questrial, sans-serif',
          animation: 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '40px',
          flexWrap: 'wrap',
        }}>
          <style>
            {`
              @keyframes slideUp {
                from { opacity: 0; transform: translateY(30px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}
          </style>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '48px', display: 'inline-block' }}>🍪</span>
              <span style={{ 
                fontWeight: '700', 
                fontSize: '32px',
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #ffffff 0%, #cccccc 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                fontFamily: 'Questrial, sans-serif'
              }}>Cookies Notice</span>
            </div>
            
            <p style={{
              fontSize: '18px',
              lineHeight: '1.5',
              marginBottom: 0,
              color: '#ffffff',
              fontWeight: '400',
              letterSpacing: '-0.01em',
              maxWidth: '600px',
              fontFamily: 'Questrial, sans-serif'
            }}>
              This site uses cookies to provide you with the best user experience. 
              By using this website, you accept our use of cookies.
            </p>
            
            <Link href="/privacy-policy" passHref>
              <span 
                className="cookie-link"
                style={{ 
                  color: '#aaaaaa', 
                  fontSize: '16px', 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  marginTop: '4px',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontFamily: 'Questrial, sans-serif',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#aaaaaa'}
              >
                Show details
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </Link>

            {/* Announcement notification */}
            {announcement && (
              <div style={{
                marginTop: '12px',
                padding: '10px 16px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: '12px',
                borderLeft: '3px solid #ffffff',
                fontSize: '14px',
                color: '#e0e0e0'
              }}>
                📢 {announcement}
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-start', flexShrink: 0 }}>
            <button
              ref={declineBtnRef}
              onClick={handleDecline}
              style={{
                padding: '12px 28px',
                backgroundColor: '#000000',
                color: '#ffffff',
                border: '1.5px solid #333333',
                borderRadius: '60px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                letterSpacing: '-0.01em',
                fontFamily: 'Questrial, sans-serif',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden',
                zIndex: 1,
                background: '#000000'
              }}
            >
              Decline
            </button>
            <button
              ref={acceptBtnRef}
              onClick={handleAccept}
              style={{
                padding: '12px 28px',
                backgroundColor: '#000000',
                color: '#ffffff',
                border: '1.5px solid #ffffff',
                borderRadius: '60px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                letterSpacing: '-0.01em',
                fontFamily: 'Questrial, sans-serif',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden',
                zIndex: 1,
                background: '#000000'
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
