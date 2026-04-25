// app/donatur/page.tsx (Halaman Donatur)
'use client';

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import Link from "next/link";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);
}

// Donation type definition
interface Donation {
  id?: string;
  title: string;
  description: string;
  totalAmount: number;
  organization: string;
  date: string;
  createdAt: Date;
}

export default function DonaturPage(): React.JSX.Element {
  const [showPopup, setShowPopup] = useState(false);
  const [isMenuHovered, setIsMenuHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDonationFormOpen, setIsDonationFormOpen] = useState(false);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    totalAmount: '',
    organization: '',
    date: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
  const createDonationBtnRef = useRef<HTMLButtonElement>(null);

  // Refs untuk menu items di drawer
  const menuItemRefs = {
    note: useRef<HTMLDivElement>(null),
    blog: useRef<HTMLDivElement>(null),
    community: useRef<HTMLDivElement>(null),
    donation: useRef<HTMLDivElement>(null),
    calendar: useRef<HTMLDivElement>(null),
  };

  // Load donations from Firebase
  useEffect(() => {
    loadDonations();
  }, []);

  const loadDonations = async () => {
    try {
      const q = query(collection(db, "donations"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const loadedDonations: Donation[] = [];
      querySnapshot.forEach((doc) => {
        loadedDonations.push({ id: doc.id, ...doc.data() } as Donation);
      });
      setDonations(loadedDonations);
    } catch (error) {
      console.error("Error loading donations:", error);
    }
  };

  const handleCreateDonation = async () => {
    if (!formData.title.trim() || !formData.description.trim() || !formData.totalAmount || !formData.organization.trim() || !formData.date) {
      return;
    }

    setIsSubmitting(true);
    try {
      const newDonation: Omit<Donation, 'id'> = {
        title: formData.title,
        description: formData.description,
        totalAmount: parseFloat(formData.totalAmount),
        organization: formData.organization,
        date: formData.date,
        createdAt: new Date()
      };

      const docRef = await addDoc(collection(db, "donations"), newDonation);
      setDonations([{ id: docRef.id, ...newDonation }, ...donations]);
      
      // Reset form and close
      setFormData({ title: '', description: '', totalAmount: '', organization: '', date: '' });
      setIsDonationFormOpen(false);
    } catch (error) {
      console.error("Error creating donation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animasi menu drawer muncul dari bawah ke atas
  useEffect(() => {
    if (isMenuOpen && menuDrawerRef.current) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      
      gsap.fromTo(menuDrawerRef.current,
        { y: '100%', opacity: 0 },
        { y: '0%', opacity: 1, duration: 0.8, ease: "power3.out", display: 'flex' }
      );
      
      if (menuMenuruTextRef.current) {
        const splitMenuMenuru = new SplitText(menuMenuruTextRef.current, {
          type: "chars",
          charsClass: "split-char-menuru-menu"
        });
        
        gsap.fromTo(splitMenuMenuru.chars,
          { opacity: 0, y: 100, rotationX: -90, filter: 'blur(10px)' },
          { opacity: 1, y: 0, rotationX: 0, filter: 'blur(0px)', duration: 1, stagger: 0.03, ease: "back.out(1.2)" }
        );
      }
      
      const menuItems = [
        menuItemRefs.note, menuItemRefs.blog, menuItemRefs.community,
        menuItemRefs.donation, menuItemRefs.calendar
      ];
      
      menuItems.forEach((item, index) => {
        if (item.current) {
          gsap.fromTo(item.current,
            { opacity: 0, x: -50, filter: 'blur(10px)' },
            { opacity: 1, x: 0, filter: 'blur(0px)', duration: 0.6, delay: 0.2 + (index * 0.08), ease: "power2.out" }
          );
        }
      });
    } else if (!isMenuOpen && menuDrawerRef.current) {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      
      gsap.to(menuDrawerRef.current, {
        y: '100%', opacity: 0, duration: 0.6, ease: "power3.in",
        onComplete: () => { if (menuDrawerRef.current) menuDrawerRef.current.style.display = 'none'; }
      });
    }
  }, [isMenuOpen]);

  // Donation Form Modal Animation
  useEffect(() => {
    const modal = document.getElementById('donation-modal');
    const overlay = document.getElementById('donation-overlay');
    
    if (isDonationFormOpen && modal && overlay) {
      modal.style.display = 'block';
      overlay.style.display = 'block';
      
      gsap.fromTo(modal,
        { scale: 0.95, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: "back.out(0.8)" }
      );
      
      gsap.fromTo(overlay,
        { opacity: 0 },
        { opacity: 1, duration: 0.3 }
      );
    } else if (!isDonationFormOpen && modal && overlay) {
      gsap.to(modal, {
        scale: 0.95, opacity: 0, y: 20, duration: 0.3,
        onComplete: () => {
          modal.style.display = 'none';
          overlay.style.display = 'none';
        }
      });
      gsap.to(overlay, { opacity: 0, duration: 0.3 });
    }
  }, [isDonationFormOpen]);

  // Animasi hover menu button
  useEffect(() => {
    if (menuButtonRef.current) {
      gsap.to(menuButtonRef.current, {
        scale: isMenuHovered ? 1.05 : 1,
        duration: 0.3,
        ease: "power2.out"
      });
    }
  }, [isMenuHovered]);

  // Animasi hover untuk menu items di drawer
  const handleMenuItemHover = (ref: React.RefObject<HTMLDivElement>, isHover: boolean) => {
    if (ref.current) {
      gsap.to(ref.current, {
        x: isHover ? 15 : 0,
        duration: 0.3,
        ease: "power2.out"
      });
    }
  };

  const handleMenuItemClick = (ref: React.RefObject<HTMLDivElement>, href: string) => {
    if (ref.current) {
      gsap.to(ref.current, {
        scale: 0.95, duration: 0.15, ease: "power2.in",
        onComplete: () => {
          gsap.to(ref.current, {
            scale: 1, duration: 0.15, ease: "power2.out",
            onComplete: () => {
              setIsMenuOpen(false);
              setTimeout(() => { window.location.href = href; }, 300);
            }
          });
        }
      });
    } else {
      setIsMenuOpen(false);
      setTimeout(() => { window.location.href = href; }, 300);
    }
  };

  // Fungsi untuk mendapatkan huruf random (A-Z)
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
    if (interval) clearInterval(Number(interval));
    element.textContent = originalText;
  };

  // Inisialisasi ScrollSmoother
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
        });
      }
    };

    const timer = setTimeout(initSmoother, 100);
    return () => {
      clearTimeout(timer);
      if (smootherRef.current) smootherRef.current.kill();
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
        { opacity: 0, x: -50, filter: 'blur(10px)' },
        { opacity: 1, x: 0, filter: 'blur(0px)', duration: 1, stagger: 0.04, ease: "back.out(1.2)",
          scrollTrigger: { trigger: donaturTitleRef.current, start: "top 85%", end: "bottom 70%", toggleActions: "play none none reverse" }
        }
      );
    }

    if (donaturUnderlineRef.current) {
      gsap.fromTo(donaturUnderlineRef.current,
        { width: '0%', opacity: 0, x: 100 },
        { width: '100%', opacity: 1, x: 0, duration: 1.2, ease: "power3.out",
          scrollTrigger: { trigger: donaturUnderlineRef.current, start: "top 85%", end: "bottom 70%", toggleActions: "play none none reverse" }
        }
      );
    }

    if (infoTextRef.current) {
      const splitInfo = new SplitText(infoTextRef.current, {
        type: "chars",
        charsClass: "split-char"
      });
      gsap.fromTo(splitInfo.chars,
        { opacity: 0, y: 30, filter: 'blur(5px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, stagger: 0.02,
          scrollTrigger: { trigger: infoTextRef.current, start: "top 85%", end: "bottom 70%", toggleActions: "play none none reverse" }
        }
      );
    }

    if (emailRef.current) {
      const splitEmail = new SplitText(emailRef.current, {
        type: "chars",
        charsClass: "split-char"
      });
      gsap.fromTo(splitEmail.chars,
        { opacity: 0, x: -30, filter: 'blur(5px)' },
        { opacity: 1, x: 0, filter: 'blur(0px)', duration: 0.8, stagger: 0.02,
          scrollTrigger: { trigger: emailRef.current, start: "top 85%", end: "bottom 70%", toggleActions: "play none none reverse" }
        }
      );
    }

    if (menuruTextRef.current) {
      const splitMenuru = new SplitText(menuruTextRef.current, {
        type: "chars",
        charsClass: "split-char-menuru"
      });
      gsap.set(splitMenuru.chars, { opacity: 0, y: 200, rotationY: 90, transformPerspective: 800, filter: 'blur(20px)' });
      gsap.to(splitMenuru.chars, {
        opacity: 1, y: 0, rotationY: 0, filter: 'blur(0px)', duration: 1.5, stagger: { each: 0.04, from: "start" },
        scrollTrigger: { trigger: menuruTextRef.current, start: "top 85%", end: "bottom 65%", toggleActions: "play none none reverse" }
      });
    }

    if (lineRef.current) {
      gsap.fromTo(lineRef.current,
        { width: '0%', opacity: 0, x: 100 },
        { width: '100%', opacity: 1, x: 0, duration: 1.2,
          scrollTrigger: { trigger: lineRef.current, start: "top 85%", end: "bottom 70%", toggleActions: "play none none reverse" }
        }
      );
    }

    return () => ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  }, []);

  // Cookie consent
  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (consent === null) setShowPopup(true);
  }, []);

  // Cookie popup hover effect
  useEffect(() => {
    if (showPopup && acceptBtnRef.current && declineBtnRef.current) {
      const style = document.createElement('style');
      style.textContent = `
        .btn-hover-effect { position: relative; isolation: isolate; }
        .btn-hover-effect::before {
          content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 0%;
          background-color: #000000; transition: height 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
          z-index: -1; border-radius: 60px;
        }
        .btn-hover-effect:hover::before { height: 100%; }
        .btn-hover-effect { transition: color 0.3s ease; }
        .btn-hover-effect:hover { color: white !important; }
      `;
      document.head.appendChild(style);
      [acceptBtnRef.current, declineBtnRef.current].forEach(btn => btn.classList.add('btn-hover-effect'));
      return () => style.remove();
    }
  }, [showPopup]);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowPopup(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setShowPopup(false);
  };

  const handleEmailClick = () => window.location.href = 'mailto:contact.menuru@gmail.com';
  const handleSocialClick = (platform: string) => console.log(`${platform} clicked`);
  const handleMenuClick = () => setIsMenuOpen(true);
  const handleCloseMenu = () => setIsMenuOpen(false);
  const openDonationForm = () => setIsDonationFormOpen(true);
  const closeDonationForm = () => setIsDonationFormOpen(false);

  return (
    <>
      <style jsx global>{`
        * { -ms-overflow-style: none; scrollbar-width: none; }
        *::-webkit-scrollbar { display: none; }
        html, body { margin: 0; padding: 0; height: 100%; width: 100%; overflow: hidden; background-color: white; }
        #smooth-wrapper-donatur { position: fixed; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; z-index: 1; }
        #smooth-content-donatur { min-height: 250vh; width: 100%; will-change: transform; }
        .split-char, .split-char-donatur, .split-char-menuru, .split-char-menuru-menu { display: inline-block; will-change: transform, opacity, filter; }
        .split-char-menuru, .split-char-menuru-menu { transform-style: preserve-3d; }
        .social-item { transition: all 0.3s ease; }
        input, textarea, select {
          background: transparent;
          border: none;
          border-bottom: 1px solid #e0e0e0;
          font-family: 'Questrial', sans-serif;
          font-size: 16px;
          padding: 12px 0;
          transition: border-color 0.3s ease;
          outline: none;
        }
        input:focus, textarea:focus, select:focus {
          border-bottom-color: #000000;
        }
        textarea {
          resize: vertical;
          min-height: 80px;
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
                cursor: 'pointer'
              }}
            >
              <span style={{ fontFamily: "'Questrial', sans-serif", fontSize: '24px', color: '#ffffff' }}>Menu</span>
              <div style={{ position: 'relative', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                  width: isMenuHovered ? '40px' : '10px',
                  height: isMenuHovered ? '40px' : '10px',
                  borderRadius: '50%',
                  backgroundColor: '#e49366',
                  position: 'absolute',
                  transition: 'width 0.3s ease, height 0.3s ease',
                  opacity: isMenuHovered ? 0 : 1
                }} />
                <div style={{
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
                }}>
                  <div style={{ width: '20px', height: '2px', backgroundColor: '#000000', borderRadius: '2px' }} />
                  <div style={{ width: '20px', height: '2px', backgroundColor: '#000000', borderRadius: '2px' }} />
                </div>
              </div>
            </div>

            {/* Menu Drawer */}
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
              <div
                ref={closeButtonRef}
                onClick={handleCloseMenu}
                onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.1, duration: 0.2 })}
                onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, duration: 0.2 })}
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
                  cursor: 'pointer'
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="#000000" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>

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
              >MENURU</div>

              <div style={{
                position: 'absolute',
                top: '40px',
                left: '40px',
                fontFamily: "'Bebas Neue', 'Impact', sans-serif",
                fontSize: '48px',
                color: '#ffffff',
                textTransform: 'uppercase'
              }}>MENURU</div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '120px', marginLeft: '40px' }}>
                <div
                  ref={menuItemRefs.note}
                  onMouseEnter={() => handleMenuItemHover(menuItemRefs.note, true)}
                  onMouseLeave={() => handleMenuItemHover(menuItemRefs.note, false)}
                  onClick={() => handleMenuItemClick(menuItemRefs.note, '/note')}
                  style={{ display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', opacity: 0 }}
                >
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '64px', fontWeight: '300', color: '#ffffff' }}>Note</span>
                </div>

                <div
                  ref={menuItemRefs.blog}
                  onMouseEnter={() => handleMenuItemHover(menuItemRefs.blog, true)}
                  onMouseLeave={() => handleMenuItemHover(menuItemRefs.blog, false)}
                  onClick={() => handleMenuItemClick(menuItemRefs.blog, '/blog')}
                  style={{ display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', opacity: 0 }}
                >
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '64px', fontWeight: '300', color: '#ffffff' }}>Blog</span>
                </div>

                <div
                  ref={menuItemRefs.community}
                  onMouseEnter={() => handleMenuItemHover(menuItemRefs.community, true)}
                  onMouseLeave={() => handleMenuItemHover(menuItemRefs.community, false)}
                  onClick={() => handleMenuItemClick(menuItemRefs.community, '/community')}
                  style={{ display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', opacity: 0 }}
                >
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '64px', fontWeight: '300', color: '#ffffff' }}>Community</span>
                </div>

                {/* Donation - with arrow */}
                <div
                  ref={menuItemRefs.donation}
                  onMouseEnter={() => handleMenuItemHover(menuItemRefs.donation, true)}
                  onMouseLeave={() => handleMenuItemHover(menuItemRefs.donation, false)}
                  onClick={() => handleMenuItemClick(menuItemRefs.donation, '/donation')}
                  style={{ display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', opacity: 0 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '64px', fontWeight: '300', color: '#ffffff' }}>Donation</span>
                    {/* North East Arrow SVG */}
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 17L17 7M17 7H7M17 7V17" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>

                <div
                  ref={menuItemRefs.calendar}
                  onMouseEnter={() => handleMenuItemHover(menuItemRefs.calendar, true)}
                  onMouseLeave={() => handleMenuItemHover(menuItemRefs.calendar, false)}
                  onClick={() => handleMenuItemClick(menuItemRefs.calendar, '/calendar')}
                  style={{ display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', opacity: 0 }}
                >
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '64px', fontWeight: '300', color: '#ffffff' }}>Calendar</span>
                </div>
              </div>
            </div>

            {/* Tombol Back ke Home */}
            <div style={{ position: 'fixed', top: '20px', left: '40px', zIndex: 100 }}>
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
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#000000'; e.currentTarget.style.color = '#ffffff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#000000'; }}>
                  ← Back to Home
                </button>
              </Link>
            </div>

            {/* Judul Website MENURU */}
            <div style={{ position: 'fixed', top: '20px', right: '40px', zIndex: 100, pointerEvents: 'none' }}>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '48px', color: '#000000', textTransform: 'uppercase' }}>MENURU</span>
            </div>

            {/* CREATE DONATION BUTTON */}
            <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 100 }}>
              <button
                ref={createDonationBtnRef}
                onClick={openDonationForm}
                style={{
                  fontFamily: "'Questrial', sans-serif",
                  fontSize: '18px',
                  color: '#ffffff',
                  backgroundColor: '#000000',
                  border: 'none',
                  borderRadius: '60px',
                  padding: '16px 32px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'transform 0.3s ease'
                }}
                onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.05, duration: 0.3 })}
                onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, duration: 0.3 })}
              >
                <span>Create Donation</span>
                {/* North West Arrow SVG */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 7L7 17M7 17H17M7 17V7" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* Donation Form Modal */}
            <div id="donation-overlay" style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0,0,0,0.8)',
              zIndex: 300,
              display: 'none'
            }} />
            
            <div id="donation-modal" style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%',
              maxWidth: '600px',
              backgroundColor: '#ffffff',
              zIndex: 301,
              display: 'none',
              borderRadius: '24px',
              overflow: 'hidden'
            }}>
              <div style={{ padding: '48px', position: 'relative' }}>
                <button
                  onClick={closeDonationForm}
                  style={{
                    position: 'absolute',
                    top: '24px',
                    right: '24px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px'
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6L18 18" stroke="#000000" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>

                <h2 style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '28px',
                  fontWeight: '300',
                  color: '#000000',
                  marginBottom: '32px',
                  letterSpacing: '-0.02em'
                }}>Create New Donation</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                  <div>
                    <label style={{ fontFamily: "'Questrial', sans-serif", fontSize: '14px', color: '#666', display: 'block', marginBottom: '8px' }}>Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Education Fund"
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontFamily: "'Questrial', sans-serif", fontSize: '14px', color: '#666', display: 'block', marginBottom: '8px' }}>Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe the purpose of this donation..."
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontFamily: "'Questrial', sans-serif", fontSize: '14px', color: '#666', display: 'block', marginBottom: '8px' }}>Total Amount (IDR)</label>
                    <input
                      type="number"
                      value={formData.totalAmount}
                      onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                      placeholder="e.g., 10000000"
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontFamily: "'Questrial', sans-serif", fontSize: '14px', color: '#666', display: 'block', marginBottom: '8px' }}>Organization / PT / Institution</label>
                    <input
                      type="text"
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      placeholder="e.g., Yayasan ABC"
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontFamily: "'Questrial', sans-serif", fontSize: '14px', color: '#666', display: 'block', marginBottom: '8px' }}>Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <button
                    onClick={handleCreateDonation}
                    disabled={isSubmitting}
                    style={{
                      fontFamily: "'Questrial', sans-serif",
                      fontSize: '16px',
                      color: '#ffffff',
                      backgroundColor: '#000000',
                      border: 'none',
                      borderRadius: '60px',
                      padding: '14px 28px',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      marginTop: '16px',
                      opacity: isSubmitting ? 0.6 : 1,
                      transition: 'transform 0.3s ease'
                    }}
                    onMouseEnter={(e) => !isSubmitting && gsap.to(e.currentTarget, { scale: 1.02, duration: 0.3 })}
                    onMouseLeave={(e) => !isSubmitting && gsap.to(e.currentTarget, { scale: 1, duration: 0.3 })}
                  >
                    {isSubmitting ? 'Creating...' : 'Create Donation'}
                  </button>
                </div>
              </div>
            </div>

            {/* Teks Donatur besar */}
            <div style={{ position: 'relative', top: '120px', left: '40px', zIndex: 10, width: 'calc(100% - 80px)', marginBottom: '100px' }}>
              <div ref={donaturTitleRef} style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '300px',
                fontWeight: '300',
                color: '#000000',
                textAlign: 'left',
                letterSpacing: '-0.02em',
                lineHeight: '1'
              }}>Donatur</div>
              <div ref={donaturUnderlineRef} style={{ width: '0%', height: '2px', backgroundColor: '#000000', marginTop: '20px', opacity: 0 }} />
            </div>

            {/* Info Text */}
            <div style={{ position: 'relative', top: '150px', left: '40px', right: '40px', zIndex: 10, marginBottom: '200px' }}>
              <div ref={infoTextRef} style={{
                fontFamily: "'Questrial', sans-serif",
                fontSize: '64px',
                color: '#000000',
                textAlign: 'center',
                lineHeight: '1.2',
                marginBottom: '100px'
              }}>Terima kasih untuk para donatur yang telah berbagi kebaikan</div>
            </div>

            {/* Donations List */}
            <div style={{
              position: 'relative',
              width: 'calc(100% - 160px)',
              margin: '0 auto 150px auto',
              padding: '0 40px'
            }}>
              <h3 style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '24px',
                fontWeight: '400',
                color: '#000000',
                marginBottom: '48px',
                letterSpacing: '-0.02em',
                borderBottom: '1px solid #e0e0e0',
                paddingBottom: '16px'
              }}>Recent Donations</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {donations.length === 0 ? (
                  <p style={{ fontFamily: "'Questrial', sans-serif", fontSize: '18px', color: '#999', textAlign: 'center', padding: '60px 0' }}>No donations yet. Create one above.</p>
                ) : (
                  donations.map((donation) => (
                    <div key={donation.id} style={{
                      borderBottom: '1px solid #e0e0e0',
                      paddingBottom: '24px',
                      transition: 'transform 0.3s ease'
                    }}
                    onMouseEnter={(e) => gsap.to(e.currentTarget, { x: 10, duration: 0.3 })}
                    onMouseLeave={(e) => gsap.to(e.currentTarget, { x: 0, duration: 0.3 })}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                        <div>
                          <h4 style={{ fontFamily: "'Inter', sans-serif", fontSize: '20px', fontWeight: '500', color: '#000000', margin: 0 }}>{donation.title}</h4>
                          <p style={{ fontFamily: "'Questrial', sans-serif", fontSize: '14px', color: '#666', margin: '8px 0 4px 0' }}>{donation.organization}</p>
                          <p style={{ fontFamily: "'Questrial', sans-serif", fontSize: '16px', color: '#333', margin: '8px 0 0 0', lineHeight: '1.4' }}>{donation.description}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '28px', fontWeight: '500', color: '#000000', margin: 0 }}>Rp {donation.totalAmount.toLocaleString('id-ID')}</p>
                          <p style={{ fontFamily: "'Questrial', sans-serif", fontSize: '14px', color: '#999', margin: '8px 0 0 0' }}>{new Date(donation.date).toLocaleDateString('id-ID')}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Email dan Medsos - Contact section tetap */}
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
                  cursor: 'pointer',
                  transition: 'opacity 0.3s ease',
                  marginBottom: '20px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.5'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >contact.menuru@gmail.com</div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                marginBottom: '20px'
              }}>
                <div className="social-item" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                  onMouseEnter={(e) => { const text = e.currentTarget.querySelector('.social-text') as HTMLElement; if (text) handleSocialHover(text, 'Instagram'); }}
                  onMouseLeave={(e) => { const text = e.currentTarget.querySelector('.social-text') as HTMLElement; if (text) handleSocialLeave(text, 'Instagram'); }}
                  onClick={() => handleSocialClick('Instagram')}>
                  <span ref={igRef} className="social-text" style={{ fontFamily: "'Questrial', sans-serif", fontSize: '28px', color: '#000000' }}>Instagram</span>
                </div>
                <div className="social-item" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                  onMouseEnter={(e) => { const text = e.currentTarget.querySelector('.social-text') as HTMLElement; if (text) handleSocialHover(text, 'X'); }}
                  onMouseLeave={(e) => { const text = e.currentTarget.querySelector('.social-text') as HTMLElement; if (text) handleSocialLeave(text, 'X'); }}
                  onClick={() => handleSocialClick('X')}>
                  <span ref={xRef} className="social-text" style={{ fontFamily: "'Questrial', sans-serif", fontSize: '28px', color: '#000000' }}>X</span>
                </div>
                <div className="social-item" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                  onMouseEnter={(e) => { const text = e.currentTarget.querySelector('.social-text') as HTMLElement; if (text) handleSocialHover(text, 'LinkedIn'); }}
                  onMouseLeave={(e) => { const text = e.currentTarget.querySelector('.social-text') as HTMLElement; if (text) handleSocialLeave(text, 'LinkedIn'); }}
                  onClick={() => handleSocialClick('LinkedIn')}>
                  <span ref={linkedinRef} className="social-text" style={{ fontFamily: "'Questrial', sans-serif", fontSize: '28px', color: '#000000' }}>LinkedIn</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <footer style={{
              position: 'relative',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              padding: '0 80px 0 0',
              margin: 0,
              pointerEvents: 'none',
              zIndex: 1
            }}>
              <div ref={lineRef} style={{ width: '0%', height: '2px', backgroundColor: '#000000', marginBottom: '60px', opacity: 0 }} />
              <span ref={menuruTextRef} style={{ 
                fontFamily: "'Bebas Neue', sans-serif", 
                fontSize: '600px', 
                color: '#000000', 
                textAlign: 'right', 
                letterSpacing: '-0.02em', 
                textTransform: 'uppercase', 
                lineHeight: '0.7', 
                whiteSpace: 'nowrap',
                transform: 'translateY(10px)'
              }}>MENURU</span>
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
          backgroundColor: '#ffffff',
          borderRadius: '32px',
          padding: '24px 32px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          zIndex: 1000,
          fontFamily: 'Questrial, sans-serif',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '32px',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '56px' }}>🍪</span>
              <span style={{ fontSize: '36px', fontWeight: '700', letterSpacing: '-0.02em' }}>cookies.</span>
            </div>
            <p style={{ fontSize: '20px', lineHeight: '1.4', maxWidth: '280px' }}>I use cookies to understand how you navigate<br />this site and what topics interest you most.</p>
            <span style={{ color: '#666', fontSize: '18px' }}>No ads, no data sold ever.</span>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button ref={declineBtnRef} onClick={handleDecline} style={{ padding: '14px 32px', backgroundColor: '#ffffff', border: '1.5px solid #e0e0e0', borderRadius: '60px', cursor: 'pointer', fontSize: '18px', fontWeight: '600' }}>Decline</button>
            <button ref={acceptBtnRef} onClick={handleAccept} style={{ padding: '14px 32px', backgroundColor: '#ffffff', border: '1.5px solid #e0e0e0', borderRadius: '60px', cursor: 'pointer', fontSize: '18px', fontWeight: '600' }}>Accept</button>
          </div>
        </div>
      )}
    </>
  );
}
