// app/donatur/page.tsx
'use client';

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Link from "next/link";
import { initializeApp, getApps } from "firebase/app";
import { 
  getAuth, 
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut 
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  query, 
  orderBy, 
  Timestamp,
  addDoc,
  onSnapshot
} from "firebase/firestore";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Konfigurasi Firebase
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

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

interface Donation {
  id?: string;
  donorName: string;
  donorEmail: string;
  donorPhoto?: string;
  description: string;
  totalAmount: number;
  organization: string;
  date: string;
  createdAt: Date;
}

export default function DonaturPage(): React.JSX.Element {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [isMenuHovered, setIsMenuHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDonationFormOpen, setIsDonationFormOpen] = useState(false);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [formData, setFormData] = useState({
    donorName: '',
    description: '',
    totalAmount: '',
    organization: '',
    date: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const acceptBtnRef = useRef<HTMLButtonElement>(null);
  const declineBtnRef = useRef<HTMLButtonElement>(null);
  
  const menuruTextRef = useRef<HTMLSpanElement>(null);
  const donaturTitleRef = useRef<HTMLDivElement>(null);
  const donaturUnderlineRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLDivElement>(null);
  const igRef = useRef<HTMLDivElement>(null);
  const xRef = useRef<HTMLDivElement>(null);
  const linkedinRef = useRef<HTMLDivElement>(null);
  const infoTextRef = useRef<HTMLDivElement>(null);
  const footerEmailRef = useRef<HTMLDivElement>(null);
  const footerIgRef = useRef<HTMLDivElement>(null);
  const footerXRef = useRef<HTMLDivElement>(null);
  const footerLinkedinRef = useRef<HTMLDivElement>(null);
  const footerMenuruRef = useRef<HTMLSpanElement>(null);
  
  const menuButtonRef = useRef<HTMLDivElement>(null);
  const menuDrawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLDivElement>(null);
  const menuMenuruTextRef = useRef<HTMLSpanElement>(null);
  const createDonationBtnRef = useRef<HTMLButtonElement>(null);

  const menuItemRefs = {
    note: useRef<HTMLDivElement>(null),
    blog: useRef<HTMLDivElement>(null),
    community: useRef<HTMLDivElement>(null),
    donation: useRef<HTMLDivElement>(null),
    calendar: useRef<HTMLDivElement>(null),
    contact: useRef<HTMLDivElement>(null),
  };

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        setFormData(prev => ({ ...prev, donorName: user.displayName || '' }));
      }
    });
    return () => unsubscribe();
  }, []);

  // Load donations from Firebase with realtime listener
  useEffect(() => {
    const q = query(collection(db, "donations"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedDonations: Donation[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        loadedDonations.push({ 
          id: doc.id, 
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date()
        } as Donation);
      });
      setDonations(loadedDonations);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      setFormData(prev => ({ ...prev, donorName: result.user.displayName || '' }));
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const generatePDF = (donation: Donation) => {
    const doc = new jsPDF();
    
    doc.setFont("helvetica");
    doc.setFontSize(24);
    doc.text("MENURU", 105, 30, { align: "center" });
    
    doc.setFontSize(16);
    doc.text("Donation Receipt", 105, 50, { align: "center" });
    
    doc.setFontSize(10);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 70);
    doc.text(`Receipt No: ${donation.id?.slice(-8).toUpperCase()}`, 150, 70);
    
    autoTable(doc, {
      startY: 85,
      head: [["Description", "Details"]],
      body: [
        ["Donor Name", donation.donorName],
        ["Donor Email", donation.donorEmail],
        ["Organization", donation.organization],
        ["Description", donation.description],
        ["Total Amount", `Rp ${donation.totalAmount.toLocaleString('id-ID')}`],
        ["Donation Date", new Date(donation.date).toLocaleDateString('id-ID')],
      ],
      theme: "plain",
      styles: { fontSize: 10, cellPadding: 5 },
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
    });
    
    doc.setFontSize(10);
    const finalY = (doc as any).lastAutoTable?.finalY || 150;
    doc.text("Thank you for your donation!", 105, finalY + 20, { align: "center" });
    doc.text("MENURU - Berbagi Kebaikan", 105, finalY + 30, { align: "center" });
    
    doc.save(`donation_${donation.id?.slice(-8)}.pdf`);
  };

  const handleCreateDonation = async () => {
    if (!user) {
      alert("Please login first to create donation");
      return;
    }
    if (!formData.donorName.trim() || !formData.description.trim() || !formData.totalAmount || !formData.organization.trim() || !formData.date) {
      return;
    }

    setIsSubmitting(true);
    try {
      const newDonation = {
        donorName: formData.donorName,
        donorEmail: user.email || '',
        donorPhoto: user.photoURL || '',
        description: formData.description,
        totalAmount: parseFloat(formData.totalAmount),
        organization: formData.organization,
        date: formData.date,
        createdAt: Timestamp.fromDate(new Date())
      };

      await addDoc(collection(db, "donations"), newDonation);
      
      setFormData({ donorName: user.displayName || '', description: '', totalAmount: '', organization: '', date: '' });
      setIsDonationFormOpen(false);
    } catch (error) {
      console.error("Error creating donation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animasi menu drawer
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
        menuItemRefs.donation, menuItemRefs.calendar, menuItemRefs.contact
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
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "back.out(0.8)" }
      );
      
      gsap.fromTo(overlay,
        { opacity: 0 },
        { opacity: 1, duration: 0.2 }
      );
    } else if (!isDonationFormOpen && modal && overlay) {
      gsap.to(modal, {
        scale: 0.95, opacity: 0, y: 20, duration: 0.2,
        onComplete: () => {
          if (modal) modal.style.display = 'none';
          if (overlay) overlay.style.display = 'none';
        }
      });
      gsap.to(overlay, { opacity: 0, duration: 0.2 });
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

  // GSAP SplitText animations
  useEffect(() => {
    const timer = setTimeout(() => {
      // Animasi Donatur Title
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

      // Animasi Donatur Underline
      if (donaturUnderlineRef.current) {
        gsap.fromTo(donaturUnderlineRef.current,
          { width: '0%', opacity: 0, x: 100 },
          { width: '100%', opacity: 1, x: 0, duration: 1.2, ease: "power3.out",
            scrollTrigger: { trigger: donaturUnderlineRef.current, start: "top 85%", end: "bottom 70%", toggleActions: "play none none reverse" }
          }
        );
      }

      // Animasi Info Text
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

      // Animasi Email Contact
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

      // Animasi Footer Email
      if (footerEmailRef.current) {
        const splitFooterEmail = new SplitText(footerEmailRef.current, {
          type: "chars",
          charsClass: "split-char-footer"
        });
        gsap.fromTo(splitFooterEmail.chars,
          { opacity: 0, y: 30, filter: 'blur(5px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, stagger: 0.02,
            scrollTrigger: { trigger: footerEmailRef.current, start: "top 85%", end: "bottom 70%", toggleActions: "play none none reverse" }
          }
        );
      }

      // Animasi Footer Instagram
      if (footerIgRef.current) {
        const splitIg = new SplitText(footerIgRef.current, {
          type: "chars",
          charsClass: "split-char-footer"
        });
        gsap.fromTo(splitIg.chars,
          { opacity: 0, y: 30, filter: 'blur(5px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, stagger: 0.02,
            scrollTrigger: { trigger: footerIgRef.current, start: "top 85%", end: "bottom 70%", toggleActions: "play none none reverse" }
          }
        );
      }

      // Animasi Footer X
      if (footerXRef.current) {
        const splitX = new SplitText(footerXRef.current, {
          type: "chars",
          charsClass: "split-char-footer"
        });
        gsap.fromTo(splitX.chars,
          { opacity: 0, y: 30, filter: 'blur(5px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, stagger: 0.02,
            scrollTrigger: { trigger: footerXRef.current, start: "top 85%", end: "bottom 70%", toggleActions: "play none none reverse" }
          }
        );
      }

      // Animasi Footer LinkedIn
      if (footerLinkedinRef.current) {
        const splitLinkedin = new SplitText(footerLinkedinRef.current, {
          type: "chars",
          charsClass: "split-char-footer"
        });
        gsap.fromTo(splitLinkedin.chars,
          { opacity: 0, y: 30, filter: 'blur(5px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, stagger: 0.02,
            scrollTrigger: { trigger: footerLinkedinRef.current, start: "top 85%", end: "bottom 70%", toggleActions: "play none none reverse" }
          }
        );
      }

      // Animasi Footer MENURU besar
      if (footerMenuruRef.current) {
        const splitMenuru = new SplitText(footerMenuruRef.current, {
          type: "chars",
          charsClass: "split-char-menuru-footer"
        });
        gsap.set(splitMenuru.chars, { opacity: 0, y: 200, rotationY: 90, transformPerspective: 800, filter: 'blur(20px)' });
        gsap.to(splitMenuru.chars, {
          opacity: 1, y: 0, rotationY: 0, filter: 'blur(0px)', duration: 1.5, stagger: { each: 0.04, from: "start" },
          scrollTrigger: { trigger: footerMenuruRef.current, start: "top 85%", end: "bottom 65%", toggleActions: "play none none reverse" }
        });
      }
      
      ScrollTrigger.refresh();
    }, 300);

    return () => {
      clearTimeout(timer);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  // Cookie consent
  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (consent === null) setShowPopup(true);
  }, []);

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: 'white',
        fontFamily: "'Questrial', sans-serif"
      }}>
        Loading...
      </div>
    );
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
          background-color: white;
          overflow-x: hidden;
          overflow-y: auto;
        }

        .split-char {
          display: inline-block;
          will-change: transform, opacity, filter;
        }

        .split-char-donatur {
          display: inline-block;
          will-change: transform, opacity, filter;
        }

        .split-char-menuru-footer {
          display: inline-block;
          will-change: transform, opacity, filter;
          transform-style: preserve-3d;
        }

        .split-char-menuru-menu {
          display: inline-block;
          will-change: transform, opacity, filter;
          transform-style: preserve-3d;
        }

        .split-char-footer {
          display: inline-block;
          will-change: transform, opacity, filter;
        }

        .social-item {
          transition: all 0.3s ease;
        }

        input, textarea, select {
          background: transparent;
          border: none;
          border-bottom: 1px solid #e0e0e0;
          font-family: 'Questrial', sans-serif;
          font-size: 16px;
          padding: 12px 0;
          transition: border-color 0.3s ease;
          outline: none;
          width: 100%;
        }
        
        input:focus, textarea:focus, select:focus {
          border-bottom-color: #000000;
        }
        
        textarea {
          resize: vertical;
          min-height: 80px;
        }
      `}</style>
      
      {/* Main Content */}
      <div style={{
        minHeight: '100vh',
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
        overflowX: 'hidden'
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

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            marginTop: '120px',
            marginLeft: '40px'
          }}>
            <div
              ref={menuItemRefs.note}
              onMouseEnter={() => handleMenuItemHover(menuItemRefs.note, true)}
              onMouseLeave={() => handleMenuItemHover(menuItemRefs.note, false)}
              onClick={() => handleMenuItemClick(menuItemRefs.note, '/note')}
              style={{ display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', opacity: 0 }}
            >
              <span style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif", fontSize: '64px', fontWeight: '300', color: '#ffffff', letterSpacing: '-0.02em' }}>Note</span>
            </div>

            <div
              ref={menuItemRefs.blog}
              onMouseEnter={() => handleMenuItemHover(menuItemRefs.blog, true)}
              onMouseLeave={() => handleMenuItemHover(menuItemRefs.blog, false)}
              onClick={() => handleMenuItemClick(menuItemRefs.blog, '/blog')}
              style={{ display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', opacity: 0 }}
            >
              <span style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif", fontSize: '64px', fontWeight: '300', color: '#ffffff', letterSpacing: '-0.02em' }}>Blog</span>
            </div>

            <div
              ref={menuItemRefs.community}
              onMouseEnter={() => handleMenuItemHover(menuItemRefs.community, true)}
              onMouseLeave={() => handleMenuItemHover(menuItemRefs.community, false)}
              onClick={() => handleMenuItemClick(menuItemRefs.community, '/community')}
              style={{ display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', opacity: 0 }}
            >
              <span style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif", fontSize: '64px', fontWeight: '300', color: '#ffffff', letterSpacing: '-0.02em' }}>Community</span>
            </div>

            <div
              ref={menuItemRefs.donation}
              onMouseEnter={() => handleMenuItemHover(menuItemRefs.donation, true)}
              onMouseLeave={() => handleMenuItemHover(menuItemRefs.donation, false)}
              onClick={() => handleMenuItemClick(menuItemRefs.donation, '/donation')}
              style={{ display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', opacity: 0 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <span style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif", fontSize: '64px', fontWeight: '300', color: '#ffffff', letterSpacing: '-0.02em' }}>Donation</span>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
              <span style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif", fontSize: '64px', fontWeight: '300', color: '#ffffff', letterSpacing: '-0.02em' }}>Calendar</span>
            </div>

            <div
              ref={menuItemRefs.contact}
              onMouseEnter={() => handleMenuItemHover(menuItemRefs.contact, true)}
              onMouseLeave={() => handleMenuItemHover(menuItemRefs.contact, false)}
              onClick={() => handleMenuItemClick(menuItemRefs.contact, '/contact')}
              style={{ display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', opacity: 0 }}
            >
              <span style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif", fontSize: '64px', fontWeight: '300', color: '#ffffff', letterSpacing: '-0.02em' }}>Contact</span>
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

        {/* Judul Website MENURU */}
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '120px',
          zIndex: 100,
          pointerEvents: 'none'
        }}>
          <span style={{
            fontFamily: "'Bebas Neue', 'Impact', 'Arial Black', sans-serif",
            fontWeight: 'normal',
            fontSize: '48px',
            color: '#000000',
            letterSpacing: '-0.02em',
            textTransform: 'uppercase'
          }}>
            MENURU
          </span>
        </div>

        {/* Navbar Kanan: Create Donation + Nama User */}
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '40px',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          pointerEvents: 'auto'
        }}>
          {user ? (
            <>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                {user.photoURL && (
                  <img 
                    src={user.photoURL} 
                    alt="Profile" 
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                  />
                )}
                <span style={{
                  fontFamily: "'Questrial', sans-serif",
                  fontSize: '16px',
                  color: '#000000'
                }}>
                  {user.displayName?.split(' ')[0] || 'User'}
                </span>
              </div>
              
              <button
                onClick={handleLogout}
                style={{
                  fontFamily: "'Questrial', sans-serif",
                  fontSize: '14px',
                  color: '#999',
                  backgroundColor: 'transparent',
                  border: '1px solid #e0e0e0',
                  borderRadius: '60px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => { 
                  e.currentTarget.style.borderColor = '#000000'; 
                  e.currentTarget.style.color = '#000000'; 
                }}
                onMouseLeave={(e) => { 
                  e.currentTarget.style.borderColor = '#e0e0e0'; 
                  e.currentTarget.style.color = '#999'; 
                }}
              >
                Logout
              </button>

              <button
                ref={createDonationBtnRef}
                onClick={openDonationForm}
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '18px',
                  fontWeight: '500',
                  color: '#ffffff',
                  backgroundColor: '#000000',
                  border: 'none',
                  borderRadius: '60px',
                  padding: '14px 32px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'transform 0.3s ease',
                  letterSpacing: '-0.02em'
                }}
                onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.05, duration: 0.2 })}
                onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, duration: 0.2 })}
              >
                <span>Create Donation</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 7L7 17M7 17H17M7 17V7" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </>
          ) : (
            <button
              onClick={handleGoogleLogin}
              style={{
                fontFamily: "'Questrial', sans-serif",
                fontSize: '16px',
                color: '#000000',
                backgroundColor: 'transparent',
                border: '1px solid #000000',
                borderRadius: '60px',
                padding: '10px 24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => { 
                e.currentTarget.style.backgroundColor = '#000000'; 
                e.currentTarget.style.color = '#ffffff'; 
              }}
              onMouseLeave={(e) => { 
                e.currentTarget.style.backgroundColor = 'transparent'; 
                e.currentTarget.style.color = '#000000'; 
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>
          )}
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
          maxWidth: '550px',
          backgroundColor: '#ffffff',
          zIndex: 301,
          display: 'none',
          borderRadius: '24px',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '40px', position: 'relative' }}>
            <button
              onClick={closeDonationForm}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="#000000" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>

            <h2 style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '28px',
              fontWeight: '400',
              color: '#000000',
              marginBottom: '32px',
              letterSpacing: '-0.02em'
            }}>
              Create Donation
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={{ fontFamily: "'Questrial', sans-serif", fontSize: '13px', color: '#999', display: 'block', marginBottom: '6px' }}>Donor Name</label>
                <input
                  type="text"
                  value={formData.donorName}
                  onChange={(e) => setFormData({ ...formData, donorName: e.target.value })}
                  placeholder="Your name"
                  disabled={!!user}
                />
              </div>

              <div>
                <label style={{ fontFamily: "'Questrial', sans-serif", fontSize: '13px', color: '#999', display: 'block', marginBottom: '6px' }}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What this donation for..."
                  rows={3}
                />
              </div>

              <div>
                <label style={{ fontFamily: "'Questrial', sans-serif", fontSize: '13px', color: '#999', display: 'block', marginBottom: '6px' }}>Total Amount (IDR)</label>
                <input
                  type="number"
                  value={formData.totalAmount}
                  onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                  placeholder="e.g., 10000000"
                />
              </div>

              <div>
                <label style={{ fontFamily: "'Questrial', sans-serif", fontSize: '13px', color: '#999', display: 'block', marginBottom: '6px' }}>Organization / PT</label>
                <input
                  type="text"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  placeholder="Institution name"
                />
              </div>

              <div>
                <label style={{ fontFamily: "'Questrial', sans-serif", fontSize: '13px', color: '#999', display: 'block', marginBottom: '6px' }}>Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <button
                onClick={handleCreateDonation}
                disabled={isSubmitting || !user}
                style={{
                  fontFamily: "'Questrial', sans-serif",
                  fontSize: '16px',
                  color: '#ffffff',
                  backgroundColor: '#000000',
                  border: 'none',
                  borderRadius: '60px',
                  padding: '14px 28px',
                  cursor: (isSubmitting || !user) ? 'not-allowed' : 'pointer',
                  marginTop: '12px',
                  opacity: (isSubmitting || !user) ? 0.5 : 1,
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => !isSubmitting && user && gsap.to(e.currentTarget, { scale: 1.02, duration: 0.2 })}
                onMouseLeave={(e) => !isSubmitting && user && gsap.to(e.currentTarget, { scale: 1, duration: 0.2 })}
              >
                {!user ? 'Please Login First' : (isSubmitting ? 'Creating...' : 'Create Donation')}
              </button>
            </div>
          </div>
        </div>

        {/* Konten Utama */}
        <div style={{ flex: 1 }}>
          {/* Teks Donatur besar */}
          <div style={{
            position: 'relative',
            top: '120px',
            left: '40px',
            width: 'calc(100% - 80px)',
            marginBottom: '80px'
          }}>
            <div 
              ref={donaturTitleRef}
              style={{
                fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
                fontSize: '280px',
                fontWeight: '300',
                color: '#000000',
                textAlign: 'left',
                letterSpacing: '-0.02em',
                lineHeight: '0.9'
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

          {/* Info Text - JARAK JAUH KE BAWAH */}
          <div style={{
            position: 'relative',
            top: '100px',
            left: '40px',
            right: '40px',
            marginBottom: '200px'
          }}>
            <div 
              ref={infoTextRef}
              style={{
                fontFamily: "'Questrial', sans-serif",
                fontSize: '56px',
                fontWeight: '400',
                color: '#000000',
                textAlign: 'center',
                letterSpacing: '-0.01em',
                lineHeight: '1.2'
              }}>
              Terima kasih untuk para donatur yang telah berbagi kebaikan
            </div>
          </div>

          {/* Recent Donations */}
          <div style={{
            position: 'relative',
            width: 'calc(100% - 160px)',
            margin: '0 auto 80px auto',
            padding: '0 40px'
          }}>
            <h3 style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '28px',
              fontWeight: '400',
              color: '#000000',
              marginBottom: '40px',
              letterSpacing: '-0.02em',
              borderBottom: '1px solid #e0e0e0',
              paddingBottom: '16px'
            }}>
              Recent Donations
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {donations.length === 0 ? (
                <p style={{ fontFamily: "'Questrial', sans-serif", fontSize: '18px', color: '#999', textAlign: 'center', padding: '60px 0' }}>
                  No donations yet. Create one above.
                </p>
              ) : (
                donations.map((donation) => (
                  <div 
                    key={donation.id} 
                    style={{
                      borderBottom: '1px solid #f0f0f0',
                      paddingBottom: '28px',
                      transition: 'transform 0.2s ease'
                    }}
                    onMouseEnter={(e) => gsap.to(e.currentTarget, { x: 10, duration: 0.2 })}
                    onMouseLeave={(e) => gsap.to(e.currentTarget, { x: 0, duration: 0.2 })}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px', flexWrap: 'wrap' }}>
                          {donation.donorPhoto && (
                            <img src={donation.donorPhoto} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                          )}
                          <h4 style={{ fontFamily: "'Inter', sans-serif", fontSize: '24px', fontWeight: '500', color: '#000000', margin: 0 }}>
                            {donation.donorName}
                          </h4>
                          <span style={{ fontFamily: "'Questrial', sans-serif", fontSize: '16px', color: '#aaa' }}>•</span>
                          <span style={{ fontFamily: "'Questrial', sans-serif", fontSize: '16px', color: '#aaa' }}>
                            {donation.organization}
                          </span>
                        </div>
                        <p style={{ fontFamily: "'Questrial', sans-serif", fontSize: '18px', color: '#666', margin: '12px 0 0 0', lineHeight: '1.5' }}>
                          {donation.description}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '28px', fontWeight: '500', color: '#000000', margin: 0 }}>
                          {formatCurrency(donation.totalAmount)}
                        </p>
                        <p style={{ fontFamily: "'Questrial', sans-serif", fontSize: '14px', color: '#bbb', margin: '12px 0 0 0' }}>
                          {new Date(donation.date).toLocaleDateString('id-ID')}
                        </p>
                        <button
                          onClick={() => generatePDF(donation)}
                          style={{
                            fontFamily: "'Questrial', sans-serif",
                            fontSize: '13px',
                            color: '#999',
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            marginTop: '12px',
                            textDecoration: 'underline'
                          }}
                          onMouseEnter={(e) => { (e.target as HTMLElement).style.color = '#000000'; }}
                          onMouseLeave={(e) => { (e.target as HTMLElement).style.color = '#999'; }}
                        >
                          Download PDF
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* FOOTER - Tanpa line, hanya email, medsos, dan teks MENURU besar */}
        <div style={{
          width: '100%',
          backgroundColor: 'white',
          marginTop: 'auto',
          padding: '0 80px',
          boxSizing: 'border-box',
          borderTop: '1px solid #f0f0f0'
        }}>
          {/* Email dan Medsos */}
          <div style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '80px',
            marginTop: '50px',
            position: 'relative'
          }}>
            {/* Email - di kiri */}
            <div 
              ref={footerEmailRef}
              onClick={handleEmailClick}
              style={{
                fontFamily: "'Questrial', sans-serif",
                fontSize: '28px',
                color: '#000000',
                fontWeight: '400',
                letterSpacing: '0.02em',
                cursor: 'pointer',
                transition: 'opacity 0.3s ease'
              }}
              onMouseEnter={(e) => { (e.target as HTMLElement).style.opacity = '0.5'; }}
              onMouseLeave={(e) => { (e.target as HTMLElement).style.opacity = '1'; }}
            >
              contact.menuru@gmail.com
            </div>

            {/* Medsos - di TENGAH */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              textAlign: 'center'
            }}>
              <div 
                className="social-item"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}
                onMouseEnter={(e) => {
                  const textElement = e.currentTarget.querySelector('.social-text-footer') as HTMLElement;
                  if (textElement) handleSocialHover(textElement, 'Instagram');
                }}
                onMouseLeave={(e) => {
                  const textElement = e.currentTarget.querySelector('.social-text-footer') as HTMLElement;
                  if (textElement) handleSocialLeave(textElement, 'Instagram');
                }}
                onClick={() => handleSocialClick('Instagram')}
              >
                <span ref={footerIgRef} className="social-text-footer" style={{ fontFamily: "'Questrial', sans-serif", fontSize: '28px', color: '#000000', fontWeight: '400', letterSpacing: '0.02em' }}>Instagram</span>
              </div>
              <div 
                className="social-item"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}
                onMouseEnter={(e) => {
                  const textElement = e.currentTarget.querySelector('.social-text-footer') as HTMLElement;
                  if (textElement) handleSocialHover(textElement, 'X');
                }}
                onMouseLeave={(e) => {
                  const textElement = e.currentTarget.querySelector('.social-text-footer') as HTMLElement;
                  if (textElement) handleSocialLeave(textElement, 'X');
                }}
                onClick={() => handleSocialClick('X')}
              >
                <span ref={footerXRef} className="social-text-footer" style={{ fontFamily: "'Questrial', sans-serif", fontSize: '28px', color: '#000000', fontWeight: '400', letterSpacing: '0.02em' }}>X</span>
              </div>
              <div 
                className="social-item"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}
                onMouseEnter={(e) => {
                  const textElement = e.currentTarget.querySelector('.social-text-footer') as HTMLElement;
                  if (textElement) handleSocialHover(textElement, 'LinkedIn');
                }}
                onMouseLeave={(e) => {
                  const textElement = e.currentTarget.querySelector('.social-text-footer') as HTMLElement;
                  if (textElement) handleSocialLeave(textElement, 'LinkedIn');
                }}
                onClick={() => handleSocialClick('LinkedIn')}
              >
                <span ref={footerLinkedinRef} className="social-text-footer" style={{ fontFamily: "'Questrial', sans-serif", fontSize: '28px', color: '#000000', fontWeight: '400', letterSpacing: '0.02em' }}>LinkedIn</span>
              </div>
            </div>

            {/* Spacer kanan untuk balance */}
            <div style={{ width: '250px' }} />
          </div>

          {/* Teks MENURU besar - MENTOK DI PALING BAWAH LAYAR */}
          <div style={{ textAlign: 'right', paddingBottom: '40px' }}>
            <span ref={footerMenuruRef} style={{ 
              fontFamily: "'Bebas Neue', 'Impact', 'Arial Black', sans-serif", 
              fontWeight: 'normal', 
              fontSize: '600px', 
              color: '#000000', 
              letterSpacing: '-0.02em', 
              textTransform: 'uppercase', 
              lineHeight: '0.7', 
              whiteSpace: 'nowrap', 
              display: 'inline-block'
            }}>
              MENURU
            </span>
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
          <style>{`
            @keyframes slideUp { 
              from { opacity: 0; transform: translateY(30px); } 
              to { opacity: 1; transform: translateY(0); } 
            }
          `}</style>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '56px', display: 'inline-block' }}>🍪</span>
              <span style={{ fontWeight: '700', fontSize: '36px', letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #000000 0%, #333333 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent', fontFamily: 'Questrial, sans-serif' }}>
                cookies.
              </span>
            </div>
            <p style={{ fontSize: '20px', lineHeight: '1.4', marginBottom: 0, color: '#1a1a1a', fontWeight: '400', letterSpacing: '-0.01em', maxWidth: '280px', fontFamily: 'Questrial, sans-serif' }}>
              I use cookies to understand how you navigate<br />this site and what topics interest you most.
            </p>
            <span style={{ color: '#666', fontSize: '18px', display: 'inline-block', marginTop: '4px', fontFamily: 'Questrial, sans-serif' }}>
              No ads, no data sold ever.
            </span>
          </div>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-start', flexShrink: 0 }}>
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
