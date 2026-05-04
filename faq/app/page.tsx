// app/page.tsx (Halaman Utama) - FULL CODE dengan 2 foto (kiri dan kanan)

'use client';

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import Link from "next/link";
import Image from "next/image";

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);
}

export default function HomePage(): React.JSX.Element {
  const [showPopup, setShowPopup] = useState(false);
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [meetingType, setMeetingType] = useState<string>("Online");
  const [location, setLocation] = useState<string>("");
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [hoverActive, setHoverActive] = useState(false);
  
  const acceptBtnRef = useRef<HTMLButtonElement>(null);
  const declineBtnRef = useRef<HTMLButtonElement>(null);
  const contactBtnRef = useRef<HTMLButtonElement>(null);
  const smootherRef = useRef<any>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  
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
  const profileRef = useRef<HTMLDivElement>(null);
  const bottomContentRef = useRef<HTMLDivElement>(null);
  const calendarBtnRef = useRef<HTMLButtonElement>(null);
  const studioTextRef = useRef<HTMLDivElement>(null);
  
  // Refs untuk gambar-gambar (hanya kiri dan kanan)
  const imgLeftRef = useRef<HTMLDivElement>(null);
  const imgRightRef = useRef<HTMLDivElement>(null);

  // Variabel untuk menyimpan teks asli medsos
  const originalTexts = {
    ig: 'Instagram',
    x: 'X',
    linkedin: 'LinkedIn'
  };

  // Get current date info
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(today.getDate() + 2);

  // Available time slots
  const timeSlots = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getDayColor = (date: Date) => {
    if (date.toDateString() === today.toDateString()) return "#4a90e2";
    if (date.toDateString() === tomorrow.toDateString()) return "#c5e800";
    return "#ff69b4";
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleScheduleMeeting = () => {
    if (selectedDate && selectedTime) {
      alert(`Meeting scheduled for ${selectedDate.toLocaleDateString()} at ${selectedTime}\nType: ${meetingType}\nLocation: ${location || 'Not specified'}`);
      setShowCalendarModal(false);
      setSelectedDate(null);
      setSelectedTime("");
    } else {
      alert("Please select date and time");
    }
  };

  const changeMonth = (increment: number) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(currentMonth.getMonth() + increment);
    setCurrentMonth(newDate);
  };

  const getRandomChar = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    return chars[Math.floor(Math.random() * chars.length)];
  };

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

  // Animasi hover untuk menampilkan gambar dari kiri dan kanan
  const handleStudioHoverEnter = () => {
    setHoverActive(true);
    
    // Animasi gambar muncul dari kiri dan kanan
    gsap.killTweensOf([imgLeftRef.current, imgRightRef.current]);
    
    // Gambar KIRI - muncul dari luar layar sisi kiri
    gsap.set(imgLeftRef.current, { x: -300, opacity: 0, rotation: -5 });
    gsap.to(imgLeftRef.current, {
      x: 0,
      opacity: 1,
      rotation: -3,
      duration: 0.7,
      ease: "back.out(0.8)",
      delay: 0
    });
    
    // Gambar KANAN - muncul dari luar layar sisi kanan
    gsap.set(imgRightRef.current, { x: 300, opacity: 0, rotation: 5 });
    gsap.to(imgRightRef.current, {
      x: 0,
      opacity: 1,
      rotation: 3,
      duration: 0.7,
      ease: "back.out(0.8)",
      delay: 0.1
    });
  };

  const handleStudioHoverLeave = () => {
    setHoverActive(false);
    
    // Animasi gambar menghilang
    gsap.to([imgLeftRef.current, imgRightRef.current], {
      opacity: 0,
      scale: 0.8,
      duration: 0.3,
      ease: "power2.in",
      stagger: 0.05
    });
  };

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
            animateMenuruMain();
            animateStudioText();
            animateBottomContent();
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

  const animateMenuruMain = () => {
    if (menuruTopMainRef.current) {
      gsap.set(menuruTopMainRef.current, { x: -500, opacity: 0 });
      gsap.to(menuruTopMainRef.current, {
        x: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power2.out",
        delay: 0.1
      });
    }
  };

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
  };

  const animateBottomContent = () => {
    if (bottomContentRef.current) {
      gsap.fromTo(bottomContentRef.current,
        { opacity: 0, y: 50, filter: 'blur(10px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 1,
          ease: "power3.out",
          delay: 0.5
        }
      );
    }
  };

  useEffect(() => {
    if (isLoading) return;

    if (emailRef.current) {
      const splitEmail = new SplitText(emailRef.current, {
        type: "chars",
        charsClass: "split-char"
      });

      gsap.fromTo(splitEmail.chars,
        { opacity: 0, x: -30, filter: 'blur(5px)' },
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

    if (lineRef.current) {
      gsap.fromTo(lineRef.current,
        { width: '0%', opacity: 0, x: 100 },
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
  }, [isLoading]);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (consent === null) {
      setShowPopup(true);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowCalendarModal(false);
      }
    };
    
    if (showCalendarModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendarModal]);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowPopup(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setShowPopup(false);
  };

  const handleContact = () => {};

  const handleEmailClick = () => {
    window.location.href = 'mailto:contact.menuru@gmail.com';
  };

  const handleSocialClick = (platform: string) => {};

  const handleCalendarCall = () => {
    setShowCalendarModal(true);
  };

  const ArrowIcon = ({ size = 24 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const days = getDaysInMonth(currentMonth);
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Questrial&display=swap');
        
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

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        .call-farid-text {
          font-family: 'HelveticaNowDisplay', 'Arial', sans-serif;
          font-weight: 400;
          font-size: 60px;
          line-height: 66px;
          color: rgb(16, 16, 16);
          text-align: left;
        }

        .email-text {
          font-family: 'HelveticaNowDisplay', 'Arial', sans-serif;
          font-weight: 400;
          font-size: 32px;
          color: rgb(16, 16, 16);
          letter-spacing: 0.02em;
        }

        .badge-founder {
          display: inline-flex;
          align-items: center;
          padding: 10px 28px;
          background-color: #000000;
          border-radius: 60px;
          font-family: 'Questrial', sans-serif;
          font-size: 30px;
          font-weight: 500;
          color: #ffffff;
          border: 1px solid #333333;
        }

        .calendar-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 28px;
          background-color: #c5e800;
          border: none;
          border-radius: 60px;
          cursor: pointer;
          font-family: 'Questrial', sans-serif;
          font-size: 20px;
          font-weight: 600;
          color: #000000;
          transition: all 0.3s ease;
          white-space: nowrap;
        }
        
        .calendar-btn:hover {
          background-color: #b0d100;
          transform: scale(1.02);
        }

        .email-wrapper {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: opacity 0.3s ease;
        }
        
        .email-wrapper:hover {
          opacity: 0.7;
        }

        .calendar-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: modalFadeIn 0.3s ease;
        }

        .calendar-modal {
          background-color: #ffffff;
          border-radius: 32px;
          width: 90%;
          max-width: 1300px;
          max-height: 85vh;
          overflow-y: auto;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: modalFadeIn 0.3s ease;
        }

        .calendar-day {
          transition: all 0.2s ease;
          cursor: pointer;
          border-radius: 12px;
        }
        
        .calendar-day:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .time-slot {
          transition: all 0.2s ease;
          cursor: pointer;
          border-radius: 8px;
        }
        
        .time-slot:hover {
          transform: scale(1.02);
          background-color: #f0f0f0 !important;
        }

        .selected-date {
          box-shadow: 0 0 0 3px #000000;
        }

        .studio-text {
          font-family: 'HelveticaNowDisplay', 'Arial', sans-serif;
          font-weight: 400;
          font-size: 80px;
          color: rgb(16, 16, 16);
          letter-spacing: -0.02em;
          line-height: 1.2;
          cursor: pointer;
          transition: opacity 0.3s ease;
          position: relative;
          z-index: 50;
        }
        
        .studio-text:hover {
          opacity: 0.8;
        }

        /* Floating images container */
        .floating-images {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 200;
          overflow: visible;
        }

        .floating-img {
          position: absolute;
          width: 450px;
          height: 600px;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3);
          opacity: 0;
          background-color: #f5f5f5;
          transition: box-shadow 0.3s ease, transform 0.3s ease;
          z-index: 201;
        }
        
        .floating-img:hover {
          box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.4);
          transform: scale(1.02) rotate(0deg) !important;
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
            {/* HEADER SECTION - MENURU */}
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 100,
              pointerEvents: 'none',
              padding: '20px 0 0 40px'
            }}>
              <div
                ref={menuruTopMainRef}
                style={{
                  fontFamily: 'Inter, "Helvetica Neue", sans-serif',
                  fontWeight: '400',
                  fontSize: '213px',
                  lineHeight: '213px',
                  color: '#000000',
                  letterSpacing: '-0.02em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  opacity: 0,
                  transform: 'translateX(-500px)'
                }}
              >
                MENURU
              </div>
            </div>

            {/* MENURU.STUDIO TEXT - Di sisi kanan, 2 baris dengan hover effect */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                minHeight: '100vh',
                paddingRight: '80px',
                position: 'relative',
                zIndex: 50
              }}
            >
              <div
                ref={studioTextRef}
                className="studio-text"
                style={{
                  textAlign: 'right',
                  opacity: 0
                }}
                onMouseEnter={handleStudioHoverEnter}
                onMouseLeave={handleStudioHoverLeave}
              >
                <div>MENURU.STUDIO – Jakarta UX/UI Design</div>
                <div>Personal for Note, Donation & Calendar</div>
              </div>
            </div>

            {/* Floating Images - Muncul saat hover - 2 foto di sisi kiri dan kanan */}
            <div className="floating-images">
              {/* Gambar 1 - Sisi KIRI - ae.jpg */}
              <div
                ref={imgLeftRef}
                className="floating-img"
                style={{
                  top: '50%',
                  left: '5%',
                  transform: 'translateY(-50%) rotate(-3deg)'
                }}
              >
                <Image
                  src="/images/ae.jpg"
                  alt="Gallery ae"
                  fill
                  style={{ objectFit: 'cover', objectPosition: 'center' }}
                  priority
                />
              </div>

              {/* Gambar 2 - Sisi KANAN - ai.jpg */}
              <div
                ref={imgRightRef}
                className="floating-img"
                style={{
                  top: '50%',
                  right: '5%',
                  transform: 'translateY(-50%) rotate(3deg)'
                }}
              >
                <Image
                  src="/images/ai.jpg"
                  alt="Gallery ai"
                  fill
                  style={{ objectFit: 'cover', objectPosition: 'center' }}
                  priority
                />
              </div>
            </div>

            {/* Bagian footer dengan semua konten */}
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
              <div
                ref={bottomContentRef}
                style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '40px',
                  marginBottom: '80px',
                  paddingLeft: '80px',
                  opacity: 0
                }}
              >
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
                      textAlign: 'left',
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

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '30px',
                  flexWrap: 'wrap',
                  width: '100%'
                }}>
                  <div ref={callTextRef} className="call-farid-text">
                    <div>Ready to surpass your</div>
                    <div>wildest dreams?</div>
                    <div>Call Farid.</div>
                  </div>

                  <button ref={calendarBtnRef} onClick={handleCalendarCall} className="calendar-btn">
                    <ArrowIcon size={24} />
                    Calendar call
                  </button>
                </div>

                <div
                  ref={profileRef}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    gap: '24px',
                    width: '100%',
                    marginTop: '10px'
                  }}
                >
                  <div style={{
                    width: '80px',
                    height: '100px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    position: 'relative',
                    border: '2px solid #e0e0e0'
                  }}>
                    <Image
                      src="/images/5.jpg"
                      alt="Farid Ardiansyah"
                      fill
                      style={{ objectFit: 'cover', objectPosition: 'center' }}
                    />
                  </div>

                  <div style={{
                    fontFamily: "'Questrial', sans-serif",
                    fontSize: '40px',
                    fontWeight: '400',
                    color: 'rgb(16, 16, 16)',
                    letterSpacing: '-0.02em'
                  }}>
                    Farid Ardiansyah
                  </div>

                  <div className="badge-founder">
                    Founder & Programmer
                  </div>
                </div>
              </div>

              {/* Email dan Social Media Section */}
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
                  className="email-wrapper"
                  style={{ marginBottom: '20px' }}
                >
                  <ArrowIcon size={24} />
                  <span className="email-text">contact.menuru@gmail.com</span>
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

      {/* Calendar Call Modal */}
      {showCalendarModal && (
        <div className="calendar-modal-overlay">
          <div ref={modalRef} className="calendar-modal">
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              height: '100%',
              minHeight: '600px'
            }}>
              <div style={{
                flex: 1.2,
                padding: '32px',
                borderRight: '1px solid #e0e0e0',
                display: 'flex',
                flexDirection: 'column',
                gap: '28px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  paddingBottom: '20px',
                  borderBottom: '1px solid #e0e0e0'
                }}>
                  <div style={{
                    width: '70px',
                    height: '90px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    position: 'relative',
                    border: '2px solid #e0e0e0'
                  }}>
                    <Image
                      src="/images/5.jpg"
                      alt="Farid Ardiansyah"
                      fill
                      style={{ objectFit: 'cover', objectPosition: 'center' }}
                    />
                  </div>
                  <div>
                    <div style={{
                      fontFamily: "'Questrial', sans-serif",
                      fontSize: '28px',
                      fontWeight: '600',
                      color: '#000000'
                    }}>Farid Ardiansyah</div>
                    <div style={{
                      fontFamily: "'Questrial', sans-serif",
                      fontSize: '16px',
                      color: '#666666'
                    }}>Founder & Programmer</div>
                  </div>
                </div>

                <div>
                  <div style={{
                    fontFamily: "'Questrial', sans-serif",
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#000000',
                    marginBottom: '12px'
                  }}>📋 Tentang Kerjasama</div>
                  <div style={{
                    fontFamily: "'Questrial', sans-serif",
                    fontSize: '14px',
                    color: '#666666',
                    lineHeight: '1.6'
                  }}>
                    Diskusi tentang kolaborasi pengembangan website, aplikasi mobile, 
                    atau konsultasi teknologi. Saya siap membantu mewujudkan ide digital Anda!
                  </div>
                </div>

                <div>
                  <div style={{
                    fontFamily: "'Questrial', sans-serif",
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#000000',
                    marginBottom: '8px'
                  }}>⏱️ Waktu Tunggu Respon</div>
                  <div style={{
                    fontFamily: "'Questrial', sans-serif",
                    fontSize: '14px',
                    color: '#c5e800',
                    backgroundColor: '#1a1a1a',
                    display: 'inline-block',
                    padding: '6px 16px',
                    borderRadius: '60px'
                  }}>Maksimal 1x24 jam</div>
                </div>

                <div>
                  <div style={{
                    fontFamily: "'Questrial', sans-serif",
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#000000',
                    marginBottom: '12px'
                  }}>📍 Tipe Meeting</div>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {["Online", "Offline", "Hybrid"].map((type) => (
                      <button
                        key={type}
                        onClick={() => setMeetingType(type)}
                        style={{
                          padding: '10px 24px',
                          borderRadius: '60px',
                          border: meetingType === type ? '2px solid #000000' : '1px solid #cccccc',
                          backgroundColor: meetingType === type ? '#000000' : '#ffffff',
                          color: meetingType === type ? '#ffffff' : '#000000',
                          cursor: 'pointer',
                          fontFamily: "'Questrial', sans-serif",
                          fontSize: '14px',
                          fontWeight: '500',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{
                    fontFamily: "'Questrial', sans-serif",
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#000000',
                    marginBottom: '8px'
                  }}>📍 Lokasi (opsional)</div>
                  <input
                    type="text"
                    placeholder="Kota / Alamat lengkap"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid #cccccc',
                      fontFamily: "'Questrial', sans-serif",
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{
                flex: 2,
                padding: '32px',
                borderRight: '1px solid #e0e0e0',
                overflowY: 'auto'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '24px'
                }}>
                  <button
                    onClick={() => changeMonth(-1)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: '1px solid #cccccc',
                      backgroundColor: '#ffffff',
                      cursor: 'pointer',
                      fontFamily: "'Questrial', sans-serif"
                    }}
                  >
                    ← Prev
                  </button>
                  <div style={{
                    fontFamily: "'Questrial', sans-serif",
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#000000'
                  }}>
                    {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </div>
                  <button
                    onClick={() => changeMonth(1)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: '1px solid #cccccc',
                      backgroundColor: '#ffffff',
                      cursor: 'pointer',
                      fontFamily: "'Questrial', sans-serif"
                    }}
                  >
                    Next →
                  </button>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '8px',
                  marginBottom: '12px'
                }}>
                  {weekDays.map((day) => (
                    <div key={day} style={{
                      textAlign: 'center',
                      fontFamily: "'Questrial', sans-serif",
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#999999',
                      padding: '8px'
                    }}>
                      {day}
                    </div>
                  ))}
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '8px'
                }}>
                  {days.map((date, index) => (
                    <div
                      key={index}
                      onClick={() => date && handleDateSelect(date)}
                      className="calendar-day"
                      style={{
                        textAlign: 'center',
                        padding: '12px 8px',
                        backgroundColor: date ? getDayColor(date) : 'transparent',
                        color: date ? '#ffffff' : 'transparent',
                        cursor: date ? 'pointer' : 'default',
                        fontWeight: date ? '600' : 'normal',
                        borderRadius: '12px',
                        opacity: date ? 1 : 0.3,
                        boxShadow: selectedDate?.toDateString() === date?.toDateString() ? '0 0 0 3px #000000' : 'none'
                      }}
                    >
                      {date ? date.getDate() : ''}
                    </div>
                  ))}
                </div>

                {selectedDate && (
                  <div style={{ marginTop: '32px' }}>
                    <div style={{
                      fontFamily: "'Questrial', sans-serif",
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#000000',
                      marginBottom: '16px'
                    }}>
                      Pilih Waktu untuk {selectedDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className="time-slot"
                          style={{
                            padding: '10px 20px',
                            borderRadius: '60px',
                            border: selectedTime === time ? '2px solid #000000' : '1px solid #cccccc',
                            backgroundColor: selectedTime === time ? '#000000' : '#ffffff',
                            color: selectedTime === time ? '#ffffff' : '#000000',
                            cursor: 'pointer',
                            fontFamily: "'Questrial', sans-serif",
                            fontSize: '14px',
                            fontWeight: '500'
                          }}
                        >
                          {time} WIB
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div style={{
                flex: 1,
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px'
              }}>
                <div style={{
                  fontFamily: "'Questrial', sans-serif",
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#000000',
                  paddingBottom: '12px',
                  borderBottom: '2px solid #e0e0e0'
                }}>
                  📅 Jadwal Mendatang
                </div>

                <div style={{
                  padding: '16px',
                  backgroundColor: '#c5e800',
                  borderRadius: '20px',
                  color: '#000000'
                }}>
                  <div style={{
                    fontFamily: "'Questrial', sans-serif",
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}>🌟 Besok</div>
                  <div style={{
                    fontFamily: "'Questrial', sans-serif",
                    fontSize: '24px',
                    fontWeight: '700',
                    marginBottom: '4px'
                  }}>
                    {tomorrow.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <div style={{
                    fontFamily: "'Questrial', sans-serif",
                    fontSize: '18px',
                    fontWeight: '500'
                  }}>
                    {timeSlots[2]} - {timeSlots[4]} WIB
                  </div>
                  <div style={{
                    fontFamily: "'Questrial', sans-serif",
                    fontSize: '14px',
                    marginTop: '8px',
                    opacity: 0.8
                  }}>⚡ Slot terbaik</div>
                </div>

                <div style={{
                  padding: '16px',
                  backgroundColor: '#ff69b4',
                  borderRadius: '20px',
                  color: '#ffffff'
                }}>
                  <div style={{
                    fontFamily: "'Questrial', sans-serif",
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}>💫 Lusa</div>
                  <div style={{
                    fontFamily: "'Questrial', sans-serif",
                    fontSize: '20px',
                    fontWeight: '700',
                    marginBottom: '4px'
                  }}>
                    {dayAfterTomorrow.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <div style={{
                    fontFamily: "'Questrial', sans-serif",
                    fontSize: '16px',
                    fontWeight: '500'
                  }}>
                    {timeSlots[1]} - {timeSlots[3]} WIB
                  </div>
                </div>

                <button
                  onClick={handleScheduleMeeting}
                  style={{
                    marginTop: 'auto',
                    padding: '14px 24px',
                    backgroundColor: '#000000',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '60px',
                    cursor: 'pointer',
                    fontFamily: "'Questrial', sans-serif",
                    fontSize: '16px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  Schedule Meeting →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
