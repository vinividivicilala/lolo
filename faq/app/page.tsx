'use client';

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import Link from "next/link";
import Image from "next/image";
import Lenis from "@studio-freight/lenis";

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);
}

export default function HomePage(): React.JSX.Element {
  const [isLoading, setIsLoading] = useState(true);
  const [showScrollDown, setShowScrollDown] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const textRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);

  // Refs
  const headerTextRef = useRef<HTMLDivElement>(null);
  const headerSectionRef = useRef<HTMLDivElement>(null);
  const scrollDownRef = useRef<HTMLDivElement>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const loadingOverlayRef = useRef<HTMLDivElement>(null);
  const menuruTopTextRef = useRef<HTMLDivElement>(null);
  const brandTextRef = useRef<HTMLDivElement>(null);
  const yearTextRef = useRef<HTMLDivElement>(null);
  const studioTextRef = useRef<HTMLDivElement>(null);
  const studioContainerRef = useRef<HTMLDivElement>(null);
  const bottomLeftTextRef = useRef<HTMLDivElement>(null);
  const smootherRef = useRef<any>(null);
  
  const [headerScrollProgress, setHeaderScrollProgress] = useState(0);
  
  const marqueeContainerRef = useRef<HTMLDivElement>(null);
  const marqueeContentRef = useRef<HTMLDivElement>(null);

  // Rotating texts untuk floating button
  const rotatingTexts = [
    "Open this",
    "Hey there",
    "Welcome back",
    "Good to see you",
    "Explore now",
    "Join the journey",
    "Stay inspired",
    "Click to begin"
  ];

  // Efek untuk scroll down mengikuti cursor
  useEffect(() => {
    if (isLoading || !showScrollDown) return;
    
    let mouseX = 0;
    let mouseY = 0;
    let rafId: number | null = null;
    
    const updatePosition = () => {
      if (scrollDownRef.current) {
        scrollDownRef.current.style.transform = `translate(${mouseX + 20}px, ${mouseY + 20}px)`;
      }
      rafId = requestAnimationFrame(updatePosition);
    };
    
    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    
    document.addEventListener('mousemove', onMouseMove);
    rafId = requestAnimationFrame(updatePosition);
    
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isLoading, showScrollDown]);

  // Efek untuk animasi marquee dengan GSAP
  useEffect(() => {
    if (isLoading) return;
    
    const timer = setTimeout(() => {
      const container = marqueeContainerRef.current;
      const content = marqueeContentRef.current;
      
      if (!container || !content) return;
      
      if (content.getAttribute('data-cloned') === 'true') return;
      
      const originalWidth = content.scrollWidth;
      const clone = content.cloneNode(true) as HTMLDivElement;
      content.parentNode?.appendChild(clone);
      
      content.setAttribute('data-cloned', 'true');
      
      gsap.set(content, { x: 0 });
      gsap.set(clone, { x: originalWidth });
      
      const animation = gsap.to([content, clone], {
        x: `-=${originalWidth}`,
        duration: 30,
        ease: "none",
        repeat: -1,
        modifiers: {
          x: (x) => {
            const parseX = parseFloat(x);
            return (parseX % originalWidth) + "px";
          }
        }
      });
      
      const handleMouseEnter = () => animation.pause();
      const handleMouseLeave = () => animation.resume();
      
      container.addEventListener("mouseenter", handleMouseEnter);
      container.addEventListener("mouseleave", handleMouseLeave);
      
      return () => {
        animation.kill();
        container.removeEventListener("mouseenter", handleMouseEnter);
        container.removeEventListener("mouseleave", handleMouseLeave);
        if (clone && clone.parentNode) {
          clone.parentNode.removeChild(clone);
        }
      };
    }, 100);
    
    return () => clearTimeout(timer);
  }, [isLoading]);

  // Efek untuk animasi scroll header MENURU (300px → 60px)
  useEffect(() => {
    if (isLoading) return;
    
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: headerSectionRef.current,
        start: "top top",
        end: "+=500",
        pin: true,
        pinSpacing: true,
        scrub: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          setHeaderScrollProgress(progress);
          
          if (headerTextRef.current) {
            const fontSize = 300 - (progress * 240);
            const newFontSize = Math.max(60, fontSize);
            headerTextRef.current.style.fontSize = `${newFontSize}px`;
          }
        }
      });
    });
    
    return () => ctx.revert();
  }, [isLoading]);

  // Scroll handler untuk scroll down hilang saat scroll
  useEffect(() => {
    if (isLoading) return;
    
    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      if (scrollY > 50 && showScrollDown) {
        setShowScrollDown(false);
      } else if (scrollY <= 10 && !showScrollDown) {
        setShowScrollDown(true);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoading, showScrollDown]);

  // Loading animation
  useEffect(() => {
    if (!isLoading || !loadingOverlayRef.current) return;

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
        gsap.to(loadingOverlayRef.current, {
          x: '-100%',
          duration: 1,
          ease: "power3.inOut",
          onComplete: () => {
            setIsLoading(false);
            gsap.fromTo(mainContentRef.current,
              { x: '100%', opacity: 0.5 },
              { x: '0%', opacity: 1, duration: 1, ease: "power3.inOut" }
            );
            animateStudioText();
          }
        });
      }
    });

    if (splitMenuruLoading.chars) {
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
    }

    if (splitBrand.chars) {
      loadingTimeline.to(splitBrand.chars, {
        opacity: 1,
        x: 0,
        rotationY: 0,
        filter: 'blur(0px)',
        duration: 1,
        stagger: { each: 0.04, from: "end", ease: "power2.out" },
        ease: "back.out(1)"
      }, 0.2);
    }

    if (splitYear.chars) {
      loadingTimeline.to(splitYear.chars, {
        opacity: 1,
        y: 0,
        rotationX: 0,
        filter: 'blur(0px)',
        duration: 0.9,
        stagger: { each: 0.08, from: "start", ease: "bounce.out" },
        ease: "back.out(1.1)"
      }, 0.4);
    }

    return () => {
      loadingTimeline.kill();
    };
  }, [isLoading]);

  const animateStudioText = () => {
    if (studioTextRef.current) {
      gsap.set(studioTextRef.current, { opacity: 0, y: 50 });
      gsap.to(studioTextRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        delay: 0.3
      });
    }

    if (bottomLeftTextRef.current) {
      gsap.set(bottomLeftTextRef.current, { opacity: 0, y: 50 });
      gsap.to(bottomLeftTextRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        delay: 0.45
      });
    }
  };

  // ScrollSmoother init
  useEffect(() => {
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

  // Lenis init
  useEffect(() => {
    if (isLoading) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      smoothTouch: false,
      touchMultiplier: 1.5,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, [isLoading]);

  // Efek GSAP untuk pergantian teks floating button
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    const changeText = () => {
      if (!textRef.current) return;
      
      gsap.to(textRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.4,
        ease: "power2.in",
        onComplete: () => {
          setCurrentTextIndex((prev) => (prev + 1) % rotatingTexts.length);
          gsap.fromTo(textRef.current, 
            { y: -20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }
          );
        }
      });
    };
    
    if (!isHovering) {
      intervalId = setInterval(changeText, 8000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isHovering, rotatingTexts.length]);

  const handleTextHover = () => {
    setIsHovering(true);
    if (!textRef.current) return;
    
    gsap.to(textRef.current, {
      y: 20,
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        const randomIndex = Math.floor(Math.random() * rotatingTexts.length);
        setCurrentTextIndex(randomIndex);
        gsap.fromTo(textRef.current,
          { y: -20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.3, ease: "power2.out" }
        );
      }
    });
    
    setTimeout(() => {
      setIsHovering(false);
    }, 3000);
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Questrial&display=swap');

        @keyframes marqueeScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(5px); }
        }

        @font-face {
          font-family: 'Aeonik-Regular';
          src: url('/fonts/Aeonik-Regular.woff2') format('woff2'),
               url('/fonts/Aeonik-Regular.woff') format('woff');
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }

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
          min-height: 100vh;
          width: 100%;
          will-change: transform;
        }

        .split-char-loading {
          display: inline-block;
          will-change: transform, opacity, filter;
          transform-style: preserve-3d;
        }

        .studio-text {
          font-family: 'HelveticaNowDisplay', 'Arial', sans-serif;
          font-weight: 400;
          font-size: 80px;
          color: rgb(16, 16, 16);
          letter-spacing: -0.02em;
          line-height: 1.2;
        }

        .bottom-left-text {
          font-family: 'HelveticaNowDisplay', 'Arial', sans-serif;
          font-weight: 400;
          font-size: 40px;
          color: rgb(16, 16, 16);
          letter-spacing: -0.02em;
          line-height: 1.3;
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
              minHeight: '100vh',
              backgroundColor: 'white',
              margin: 0,
              padding: 0,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              fontFamily: 'Questrial, sans-serif',
              position: 'relative',
              opacity: isLoading ? 0 : 1,
              transform: isLoading ? 'translateX(100%)' : 'translateX(0)',
              transition: 'all 0.01s ease'
            }}
          >
            {/* HEADER SECTION - MENURU dengan efek PINNED */}
            <div
              ref={headerSectionRef}
              style={{
                position: 'relative',
                width: '100%',
                height: '100vh',
                backgroundColor: 'transparent',
                zIndex: 10,
                paddingBottom: '100px'
              }}
            >
              <div
                style={{
                  position: 'relative',
                  top: 0,
                  left: 0,
                  right: 0,
                  padding: '40px 0 0 40px'
                }}
              >
                {/* Teks MENURU besar - 300px */}
                <div
                  ref={headerTextRef}
                  style={{
                    fontFamily: 'Inter, "Helvetica Neue", sans-serif',
                    fontWeight: '400',
                    fontSize: '300px',
                    lineHeight: '1',
                    color: '#000000',
                    letterSpacing: '-0.02em',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                    display: 'inline-block'
                  }}
                >
                  MENURU
                </div>

                {/* MARQUEE SECTION - Teks berjalan dari kanan ke kiri (font 300px) */}
                <div
                  ref={marqueeContainerRef}
                  style={{
                    position: 'relative',
                    width: '100%',
                    marginTop: '80px',
                    marginBottom: '0px',
                    overflow: 'hidden',
                    backgroundColor: 'transparent'
                  }}
                >
                  <div
                    ref={marqueeContentRef}
                    style={{
                      display: 'flex',
                      whiteSpace: 'nowrap',
                      willChange: 'transform'
                    }}
                  >
                    {[...Array(3)].map((_, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '50px',
                          marginRight: '80px'
                        }}
                      >
                        <span
                          style={{
                            fontFamily: 'Inter, "Helvetica Neue", sans-serif',
                            fontWeight: '700',
                            fontSize: '300px',
                            color: '#000000',
                            letterSpacing: '-0.03em',
                            textTransform: 'uppercase',
                            lineHeight: '1',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          SUBSCRIBE
                        </span>
                        
                        {/* Foto vertikal */}
                        <div
                          style={{
                            width: '220px',
                            height: '300px',
                            backgroundColor: '#e0e0e0',
                            borderRadius: '24px',
                            overflow: 'hidden',
                            position: 'relative',
                            flexShrink: 0,
                            boxShadow: '0 15px 35px rgba(0,0,0,0.15)'
                          }}
                        >
                          <Image
                            src="/images/5.jpg"
                            alt="Subscribe"
                            fill
                            style={{ objectFit: 'cover' }}
                          />
                        </div>
                        
                        {/* Panah dekorasi */}
                        <svg 
                          width="70" 
                          height="70" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          xmlns="http://www.w3.org/2000/svg"
                          style={{ stroke: '#000000', strokeWidth: '1.5', flexShrink: 0 }}
                        >
                          <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 1 - MENURU.STUDIO */}
            <div
              ref={studioContainerRef}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                justifyContent: 'center',
                minHeight: '100vh',
                paddingRight: '80px',
                position: 'relative',
              }}
            >
              <div
                ref={studioTextRef}
                className="studio-text"
                style={{
                  textAlign: 'right',
                  opacity: 0
                }}
              >
                <div>MENURU.STUDIO – Jakarta UX/UI Design</div>
                <div>Personal for Note, Donation & Calendar</div>
              </div>

              <div
                ref={bottomLeftTextRef}
                className="bottom-left-text"
                style={{
                  position: 'absolute',
                  bottom: '5%',
                  left: '80px',
                  textAlign: 'left',
                  opacity: 0,
                }}
              >
                IDN
                <br />
                MN'RU© - 26'
              </div>

              {/* ABOUT SECTION */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '5%',
                  right: '80px',
                  textAlign: 'left',
                  maxWidth: '800px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '24px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div
                    style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      color: '#000000',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      fontFamily: 'Questrial, sans-serif',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    ABOUT
                  </div>

                  <div
                    style={{
                      fontSize: '20px',
                      lineHeight: '1.4',
                      fontWeight: 400,
                      color: '#000000',
                      letterSpacing: '-0.02em',
                      fontFamily: 'Questrial, sans-serif',
                      flex: 1,
                      display: 'flex',
                      alignItems: 'baseline',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <span>
                      I am a developer based in Jakarta focused on creating
                      interactive digital experiences on the web, working with brands
                      and industry leaders such personal others to achieve this.
                    </span>
                    
                    <Link href="/profile">
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '12px',
                          cursor: 'pointer',
                          transition: 'opacity 0.2s ease',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                      >
                        <span
                          style={{
                            fontSize: '50px',
                            fontWeight: 500,
                            color: '#000000',
                            fontFamily: 'Questrial, sans-serif',
                            letterSpacing: '-0.02em',
                          }}
                        >
                          Profile
                        </span>
                        <svg
                          width="50"
                          height="50"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          style={{ stroke: '#000000', strokeWidth: '1.5' }}
                        >
                          <path
                            d="M7 17L17 7M17 7H7M17 7V17"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* SCROLL DOWN - Teks yang mengikuti cursor */}
            {showScrollDown && !isLoading && (
              <div
                ref={scrollDownRef}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  zIndex: 9999,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontFamily: 'Questrial, sans-serif',
                  userSelect: 'none',
                  backgroundColor: 'rgba(0, 0, 0, 0.85)',
                  padding: '10px 20px',
                  borderRadius: '60px',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap'
                }}
              >
                <span style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '0.1em', color: '#ffffff' }}>
                  SCROLL DOWN
                </span>
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ animation: 'bounce 1.2s ease infinite' }}
                >
                  <path d="M12 5V19M12 19L5 12M12 19L19 12" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}

            {/* FLOATING BUTTON */}
            <div
              style={{
                position: 'fixed',
                bottom: '30px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 99999,
              }}
            >
              <div
                style={{
                  background: '#050505',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: isMenuOpen ? '28px' : '999px',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
                  width: '1000px',
                  maxWidth: '92vw',
                  transition: 'all .7s cubic-bezier(.16,1,.3,1)',
                  overflow: 'hidden',
                }}
              >
                {/* KONTEN MENU - Bagian Atas (muncul saat expand) */}
                <div
                  style={{
                    maxHeight: isMenuOpen ? '800px' : '0',
                    opacity: isMenuOpen ? 1 : 0,
                    visibility: isMenuOpen ? 'visible' : 'hidden',
                    transition: 'max-height .7s cubic-bezier(.16,1,.3,1), opacity .45s ease .15s, visibility .45s ease .15s',
                    overflow: 'hidden',
                  }}
                >
                  {/* HEADER DENGAN FOTO DAN NAMA WEBSITE BESAR */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '30px',
                      borderBottom: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <img
                        src="/images/lkhh.jpg"
                        alt="Menuru Brand"
                        style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '16px',
                          objectFit: 'cover',
                        }}
                      />
                      <div>
                        <div
                          style={{
                            color: '#fff',
                            fontSize: '48px',
                            lineHeight: '1',
                            fontWeight: 600,
                            fontFamily: 'Questrial, sans-serif',
                            letterSpacing: '-0.02em',
                          }}
                        >
                          MENURU
                        </div>
                        <div
                          style={{
                            color: '#8a8a8a',
                            marginTop: '8px',
                            fontSize: '14px',
                            fontFamily: 'Questrial, sans-serif',
                          }}
                        >
                          Creative Digital Studio
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        background: '#fff',
                        color: '#000',
                        padding: '10px 24px',
                        borderRadius: '999px',
                        fontSize: '14px',
                        fontWeight: 500,
                        cursor: 'pointer',
                      }}
                    >
                      Let's Talk
                    </div>
                  </div>

                  {/* MENU LIST */}
                  {[
                    { name: 'Homepage', link: '/' },
                    { name: 'Studios', link: '/studios' },
                    { name: 'Recognition', link: '/recognition' },
                    { name: 'Work', link: '/work' },
                    { name: 'Blog', link: '/blog' },
                    { name: 'Contact', link: '/contact' },
                  ].map((item, index) => (
                    <Link href={item.link} key={index} style={{ textDecoration: 'none' }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '22px 30px',
                          borderBottom: index !== 5 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                          cursor: 'pointer',
                          transition: 'all .3s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <span
                          style={{
                            color: '#fff',
                            fontSize: '28px',
                            fontWeight: 400,
                            fontFamily: 'Questrial, sans-serif',
                          }}
                        >
                          {item.name}
                        </span>
                        <span
                          style={{
                            color: '#777',
                            fontSize: '14px',
                            fontFamily: 'Questrial, sans-serif',
                          }}
                        >
                          View
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* TOMBOL BAWAH - Bagian Bawah yang SELALU TERLIHAT */}
                <div
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 24px',
                    height: '68px',
                    cursor: 'pointer',
                    borderTop: isMenuOpen ? '1px solid rgba(255,255,255,0.08)' : 'none',
                    background: '#050505',
                  }}
                >
                  {/* TEKS KIRI - BERUBAH DENGAN GSAP */}
                  <div
                    ref={textRef}
                    onMouseEnter={handleTextHover}
                    style={{
                      color: '#fff',
                      fontSize: '18px',
                      fontFamily: 'Questrial, sans-serif',
                      cursor: 'pointer',
                      display: 'inline-block',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {rotatingTexts[currentTextIndex]}
                  </div>

                  {/* BAGIAN KANAN - HOMEPAGE + TANDA + */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                    }}
                  >
                    <Link href="/" style={{ textDecoration: 'none' }}>
                      <div
                        style={{
                          background: '#fff',
                          color: '#000',
                          borderRadius: '999px',
                          padding: '8px 24px',
                          fontSize: '16px',
                          fontWeight: 500,
                          fontFamily: 'Questrial, sans-serif',
                        }}
                      >
                        Homepage
                      </div>
                    </Link>
                    <span
                      style={{
                        color: '#fff',
                        fontSize: '28px',
                        fontWeight: 300,
                        cursor: 'pointer',
                      }}
                    >
                      {isMenuOpen ? '−' : '+'}
                    </span>
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
