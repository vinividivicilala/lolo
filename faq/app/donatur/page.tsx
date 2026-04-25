// app/donation/page.tsx (Halaman Donation)
'use client';

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import Link from "next/link";
import { initializeApp, getApps } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot,
  Timestamp,
  doc,
  updateDoc,
  increment,
  arrayUnion
} from "firebase/firestore";
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";

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

// Icons
const NorthEastArrow = ({ size = 24, color = "#000" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 7 L17 7 L17 17" />
    <path d="M17 7 L7 17" />
  </svg>
);

const NorthWestArrow = ({ size = 24, color = "#000" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 7 L7 7 L7 17" />
    <path d="M7 7 L17 17" />
  </svg>
);

const PlusIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const CloseIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const CalendarIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const UserIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="12" cy="8" r="4"/>
    <path d="M5 20v-2a7 7 0 0 1 14 0v2"/>
  </svg>
);

const HeartIcon = ({ size = 18, filled = false }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "#000" : "none"} stroke="currentColor" strokeWidth="1.5">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const SendIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const InstagramVerifiedBadge = ({ size = 16 }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', marginLeft: '4px' }}>
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path fill="#0095F6" d="M12 2.2 C13.6 3.8 16.2 3.8 17.8 2.2 C18.6 3.8 20.2 5.4 21.8 6.2 C20.2 7.8 20.2 10.4 21.8 12 C20.2 13.6 20.2 16.2 21.8 17.8 C20.2 18.6 18.6 20.2 17.8 21.8 C16.2 20.2 13.6 20.2 12 21.8 C10.4 20.2 7.8 20.2 6.2 21.8 C5.4 20.2 3.8 18.6 2.2 17.8 C3.8 16.2 3.8 13.6 2.2 12 C3.8 10.4 3.8 7.8 2.2 6.2 C3.8 5.4 5.4 3.8 6.2 2.2 C7.8 3.8 10.4 3.8 12 2.2 Z"/>
      <path d="M9.2 12.3l2 2 4.6-4.6" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </span>
);

interface DonationItem {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  organizationName: string;
  organizationEmail: string;
  location: string;
  endDate: Date;
  createdAt: Date;
  createdBy: string;
  createdByName: string;
  donors: Donor[];
  likes: string[];
}

interface Donor {
  id: string;
  name: string;
  email: string;
  amount: number;
  message: string;
  createdAt: Date;
}

export default function DonationPage(): React.JSX.Element {
  const [showPopup, setShowPopup] = useState(false);
  const [isMenuHovered, setIsMenuHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<DonationItem | null>(null);
  const [donationAmount, setDonationAmount] = useState("");
  const [donationMessage, setDonationMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  const acceptBtnRef = useRef<HTMLButtonElement>(null);
  const declineBtnRef = useRef<HTMLButtonElement>(null);
  const smootherRef = useRef<any>(null);
  
  // Firebase
  const [firebaseDb, setFirebaseDb] = useState<any>(null);
  const [firebaseAuth, setFirebaseAuth] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [donations, setDonations] = useState<DonationItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    targetAmount: "",
    organizationName: "",
    location: "",
    endDate: ""
  });
  
  // Refs untuk teks split
  const menuruTextRef = useRef<HTMLSpanElement>(null);
  const donationTitleRef = useRef<HTMLDivElement>(null);
  const donationUnderlineRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const infoTextRef = useRef<HTMLDivElement>(null);
  
  // Menu refs
  const menuButtonRef = useRef<HTMLDivElement>(null);
  const menuDrawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLDivElement>(null);
  const menuMenuruTextRef = useRef<HTMLSpanElement>(null);
  
  const menuItemRefs = {
    note: useRef<HTMLDivElement>(null),
    blog: useRef<HTMLDivElement>(null),
    community: useRef<HTMLDivElement>(null),
    donation: useRef<HTMLDivElement>(null),
    calendar: useRef<HTMLDivElement>(null),
    contact: useRef<HTMLDivElement>(null),
  };

  // Format Rupiah
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumberWithDots = (value: string) => {
    const number = value.replace(/[^\d]/g, '');
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const parseNumberFromDots = (value: string) => {
    return parseInt(value.replace(/[^\d]/g, '')) || 0;
  };

  const formatDate = (date: any) => {
    if (!date) return "-";
    try {
      const d = date.toDate ? date.toDate() : new Date(date);
      if (isNaN(d.getTime())) return "-";
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return "-";
    }
  };

  const formatTime = (date: any) => {
    if (!date) return "Baru saja";
    try {
      const d = date.toDate ? date.toDate() : new Date(date);
      if (isNaN(d.getTime())) return "Baru saja";
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 1) return 'Baru saja';
      if (diffMins < 60) return `${diffMins} menit lalu`;
      if (diffHours < 24) return `${diffHours} jam lalu`;
      if (diffDays === 1) return 'Kemarin';
      if (diffDays < 7) return `${diffDays} hari lalu`;
      return d.toLocaleDateString('id-ID');
    } catch {
      return "Baru saja";
    }
  };

  const getPercentage = (current: number, target: number) => {
    if (target === 0) return 0;
    return Math.min(Math.floor((current / target) * 100), 100);
  };

  const getDaysRemaining = (endDate: any) => {
    if (!endDate) return 0;
    try {
      const d = endDate.toDate ? endDate.toDate() : new Date(endDate);
      if (isNaN(d.getTime())) return 0;
      const today = new Date();
      const diffTime = d.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 0;
    } catch {
      return 0;
    }
  };

  // Handle Create Donation
  const handleCreateDonation = async () => {
    if (!user) {
      alert("Silakan login terlebih dahulu");
      return;
    }
    
    if (!formData.title.trim() || !formData.description.trim()) {
      alert("Judul dan deskripsi harus diisi");
      return;
    }
    
    const targetAmount = parseNumberFromDots(formData.targetAmount);
    if (targetAmount < 10000) {
      alert("Target donasi minimal Rp 10.000");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const donationData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        targetAmount: targetAmount,
        currentAmount: 0,
        organizationName: formData.organizationName.trim() || user.displayName || user.email?.split('@')[0],
        organizationEmail: user.email,
        location: formData.location.trim() || "Online",
        endDate: formData.endDate ? new Date(formData.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        createdBy: user.uid,
        createdByName: user.displayName || user.email?.split('@')[0],
        donors: [],
        likes: []
      };
      
      const donationsRef = collection(firebaseDb, 'donations');
      await addDoc(donationsRef, {
        ...donationData,
        createdAt: Timestamp.fromDate(donationData.createdAt),
        endDate: Timestamp.fromDate(donationData.endDate)
      });
      
      setFormData({
        title: "",
        description: "",
        targetAmount: "",
        organizationName: "",
        location: "",
        endDate: ""
      });
      setIsCreateModalOpen(false);
      setSuccessMessage("Donation created successfully!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
    } catch (error) {
      console.error("Error creating donation:", error);
      alert("Gagal membuat donasi");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Donate
  const handleDonate = async () => {
    if (!user) {
      alert("Silakan login terlebih dahulu");
      return;
    }
    
    if (!selectedDonation) return;
    
    const amount = parseNumberFromDots(donationAmount);
    if (amount < 10000) {
      alert("Donasi minimal Rp 10.000");
      return;
    }
    
    if (!donationMessage.trim()) {
      alert("Silakan tulis pesan donasi");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const donationRef = doc(firebaseDb, 'donations', selectedDonation.id);
      const newDonor = {
        id: `${Date.now()}_${user.uid}`,
        name: user.displayName || user.email?.split('@')[0],
        email: user.email,
        amount: amount,
        message: donationMessage,
        createdAt: new Date()
      };
      
      await updateDoc(donationRef, {
        currentAmount: increment(amount),
        donors: arrayUnion(newDonor)
      });
      
      setDonationAmount("");
      setDonationMessage("");
      setIsDonateModalOpen(false);
      setSuccessMessage(`Thank you for donating ${formatRupiah(amount)}!`);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
    } catch (error) {
      console.error("Error donating:", error);
      alert("Gagal mengirim donasi");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Like
  const handleLike = async (donationId: string) => {
    if (!user) return;
    
    try {
      const donationRef = doc(firebaseDb, 'donations', donationId);
      const donation = donations.find(d => d.id === donationId);
      
      if (donation?.likes.includes(user.uid)) {
        await updateDoc(donationRef, {
          likes: donation.likes.filter(uid => uid !== user.uid)
        });
      } else {
        await updateDoc(donationRef, {
          likes: [...(donation?.likes || []), user.uid]
        });
      }
    } catch (error) {
      console.error("Error liking:", error);
    }
  };

  // Menu animations
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
      
      const menuItems = [menuItemRefs.note, menuItemRefs.blog, menuItemRefs.community, menuItemRefs.donation, menuItemRefs.calendar, menuItemRefs.contact];
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
      gsap.to(ref.current, { x: isHover ? 15 : 0, duration: 0.3, ease: "power2.out" });
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

  // GSAP Scroll animations
  useEffect(() => {
    const initSmoother = () => {
      if (typeof window !== 'undefined' && !smootherRef.current) {
        smootherRef.current = ScrollSmoother.create({
          wrapper: "#smooth-wrapper-donation",
          content: "#smooth-content-donation",
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
      if (smootherRef.current) { smootherRef.current.kill(); smootherRef.current = null; }
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  useEffect(() => {
    if (donationTitleRef.current) {
      const splitDonation = new SplitText(donationTitleRef.current, { type: "chars", charsClass: "split-char-donation" });
      gsap.fromTo(splitDonation.chars,
        { opacity: 0, x: -50, filter: 'blur(10px)' },
        { opacity: 1, x: 0, filter: 'blur(0px)', duration: 1, stagger: 0.04, ease: "back.out(1.2)",
          scrollTrigger: { trigger: donationTitleRef.current, start: "top 85%", toggleActions: "play none none reverse" }
        }
      );
    }
    if (donationUnderlineRef.current) {
      gsap.fromTo(donationUnderlineRef.current,
        { width: '0%', opacity: 0, x: 100 },
        { width: '100%', opacity: 1, x: 0, duration: 1.2, ease: "power3.out",
          scrollTrigger: { trigger: donationUnderlineRef.current, start: "top 85%", toggleActions: "play none none reverse" }
        }
      );
    }
    if (infoTextRef.current) {
      const splitInfo = new SplitText(infoTextRef.current, { type: "chars", charsClass: "split-char" });
      gsap.fromTo(splitInfo.chars,
        { opacity: 0, y: 30, filter: 'blur(5px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, stagger: 0.02, ease: "power2.out",
          scrollTrigger: { trigger: infoTextRef.current, start: "top 85%", toggleActions: "play none none reverse" }
        }
      );
    }
    if (menuruTextRef.current) {
      const splitMenuru = new SplitText(menuruTextRef.current, { type: "chars", charsClass: "split-char-menuru" });
      gsap.set(splitMenuru.chars, { opacity: 0, y: 200, rotationY: 90, transformPerspective: 800, filter: 'blur(20px)' });
      gsap.to(splitMenuru.chars, {
        opacity: 1, y: 0, rotationY: 0, filter: 'blur(0px)', duration: 1.5, stagger: { each: 0.04, from: "start" }, ease: "back.out(0.8)",
        scrollTrigger: { trigger: menuruTextRef.current, start: "top 85%", toggleActions: "play none none reverse" }
      });
    }
    if (lineRef.current) {
      gsap.fromTo(lineRef.current,
        { width: '0%', opacity: 0, x: 100 },
        { width: '100%', opacity: 1, x: 0, duration: 1.2, ease: "power3.out",
          scrollTrigger: { trigger: lineRef.current, start: "top 85%", toggleActions: "play none none reverse" }
        }
      );
    }
  }, []);

  // Cookie popup
  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (consent === null) setShowPopup(true);
  }, []);

  useEffect(() => {
    if (showPopup && acceptBtnRef.current && declineBtnRef.current) {
      const pseudoStyle = document.createElement('style');
      pseudoStyle.textContent = `
        .btn-hover-effect { position: relative; isolation: isolate; }
        .btn-hover-effect::before { content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 0%; background-color: #000000; transition: height 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1); z-index: -1; border-radius: 60px; }
        .btn-hover-effect:hover::before { height: 100%; }
        .btn-hover-effect { transition: color 0.3s ease; }
        .btn-hover-effect:hover { color: white !important; }
      `;
      document.head.appendChild(pseudoStyle);
      [acceptBtnRef.current, declineBtnRef.current].forEach(btn => btn?.classList.add('btn-hover-effect'));
      return () => { pseudoStyle.remove(); };
    }
  }, [showPopup]);

  const handleAccept = () => { localStorage.setItem('cookieConsent', 'accepted'); setShowPopup(false); };
  const handleDecline = () => { localStorage.setItem('cookieConsent', 'declined'); setShowPopup(false); };
  const handleMenuClick = () => setIsMenuOpen(true);
  const handleCloseMenu = () => setIsMenuOpen(false);

  // Firebase initialization
  useEffect(() => {
    try {
      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
      const auth = getAuth(app);
      const db = getFirestore(app);
      setFirebaseAuth(auth);
      setFirebaseDb(db);
    } catch (error) {
      console.error("Firebase initialization error:", error);
    }
  }, []);

  useEffect(() => {
    if (!firebaseAuth) return;
    const unsubscribe = onAuthStateChanged(firebaseAuth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [firebaseAuth]);

  useEffect(() => {
    if (!firebaseDb) return;
    const donationsRef = collection(firebaseDb, 'donations');
    const q = query(donationsRef, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const donationsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || "",
          description: data.description || "",
          targetAmount: data.targetAmount || 0,
          currentAmount: data.currentAmount || 0,
          organizationName: data.organizationName || "",
          organizationEmail: data.organizationEmail || "",
          location: data.location || "",
          endDate: data.endDate?.toDate ? data.endDate.toDate() : new Date(),
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
          createdBy: data.createdBy || "",
          createdByName: data.createdByName || "",
          donors: data.donors || [],
          likes: data.likes || []
        };
      });
      setDonations(donationsData);
    });
    return () => unsubscribe();
  }, [firebaseDb]);

  const handleGoogleLogin = async () => {
    if (!firebaseAuth) return;
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(firebaseAuth, provider);
    } catch (error) { console.error("Google login error:", error); }
  };

  const handleLogout = async () => {
    if (!firebaseAuth) return;
    try { await signOut(firebaseAuth); } catch (error) { console.error("Logout error:", error); }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: "'Inter', sans-serif" }}>
        <div style={{ fontSize: '14px', color: '#999' }}>Loading...</div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        * { -ms-overflow-style: none; scrollbar-width: none; }
        *::-webkit-scrollbar { display: none; }
        html, body { margin: 0; padding: 0; height: 100%; width: 100%; overflow: hidden; background-color: white; }
        #smooth-wrapper-donation { position: fixed; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; z-index: 1; }
        #smooth-content-donation { min-height: 250vh; width: 100%; will-change: transform; }
        .split-char { display: inline-block; will-change: transform, opacity, filter; }
        .split-char-donation { display: inline-block; will-change: transform, opacity, filter; }
        .split-char-menuru { display: inline-block; will-change: transform, opacity, filter; transform-style: preserve-3d; }
        .split-char-menuru-menu { display: inline-block; will-change: transform, opacity, filter; transform-style: preserve-3d; }
        .donation-card { transition: all 0.3s ease; }
        .donation-card:hover { transform: translateY(-4px); }
      `}</style>
      
      <div id="smooth-wrapper-donation">
        <div id="smooth-content-donation">
          <div style={{
            minHeight: '250vh',
            backgroundColor: '#fff',
            margin: 0,
            padding: 0,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
            WebkitFontSmoothing: 'antialiased',
            position: 'relative',
          }}>
            {/* Menu Button */}
            <div
              ref={menuButtonRef}
              onClick={handleMenuClick}
              onMouseEnter={() => setIsMenuHovered(true)}
              onMouseLeave={() => setIsMenuHovered(false)}
              style={{
                position: 'fixed',
                top: '24px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 100,
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '14px 32px',
                backgroundColor: '#000',
                borderRadius: '100px',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '16px', fontWeight: '400', color: '#fff', letterSpacing: '0.02em' }}>Menu</span>
              <div style={{ position: 'relative', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: isMenuHovered ? '32px' : '8px', height: isMenuHovered ? '32px' : '8px', borderRadius: '50%', backgroundColor: '#e49366', position: 'absolute', transition: 'width 0.3s ease, height 0.3s ease', opacity: isMenuHovered ? 0 : 1 }} />
                <div style={{ width: isMenuHovered ? '32px' : '0px', height: isMenuHovered ? '32px' : '0px', borderRadius: '50%', backgroundColor: '#e49366', position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '5px', transition: 'width 0.3s ease, height 0.3s ease', opacity: isMenuHovered ? 1 : 0 }}>
                  <div style={{ width: '16px', height: '1.5px', backgroundColor: '#000', borderRadius: '1px' }} />
                  <div style={{ width: '16px', height: '1.5px', backgroundColor: '#000', borderRadius: '1px' }} />
                </div>
              </div>
            </div>

            {/* Menu Drawer */}
            <div
              ref={menuDrawerRef}
              style={{
                position: 'fixed', bottom: 0, left: 0, right: 0, width: '100%', height: '100%',
                backgroundColor: '#000', zIndex: 200, display: 'none', flexDirection: 'column',
                alignItems: 'flex-start', justifyContent: 'flex-start', padding: '60px', boxSizing: 'border-box', overflow: 'hidden'
              }}
            >
              <div
                ref={closeButtonRef}
                onClick={handleCloseMenu}
                onMouseEnter={(e) => gsap.to(e.currentTarget, { scale: 1.1, duration: 0.2 })}
                onMouseLeave={(e) => gsap.to(e.currentTarget, { scale: 1, duration: 0.2 })}
                style={{ position: 'absolute', top: '40px', right: '40px', width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#e49366', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <CloseIcon size={24} />
              </div>
              <div ref={menuMenuruTextRef} style={{ position: 'absolute', bottom: '40px', right: '40px', fontFamily: "'Archivo Black', sans-serif", fontSize: '160px', fontWeight: '400', color: 'rgba(255,255,255,0.08)', letterSpacing: '-0.02em', textTransform: 'uppercase', lineHeight: '0.8', pointerEvents: 'none', whiteSpace: 'nowrap' }}>MENURU</div>
              <div style={{ position: 'absolute', top: '40px', left: '40px', fontFamily: "'Bebas Neue', sans-serif", fontSize: '40px', color: '#fff', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>MENURU</div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '100px', marginLeft: '40px' }}>
                <div ref={menuItemRefs.note} onMouseEnter={() => handleMenuItemHover(menuItemRefs.note, true)} onMouseLeave={() => handleMenuItemHover(menuItemRefs.note, false)} onClick={() => handleMenuItemClick(menuItemRefs.note, '/note')} style={{ display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', opacity: 0 }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '56px', fontWeight: '300', color: '#fff', letterSpacing: '-0.02em' }}>Note</span>
                </div>
                <div ref={menuItemRefs.blog} onMouseEnter={() => handleMenuItemHover(menuItemRefs.blog, true)} onMouseLeave={() => handleMenuItemHover(menuItemRefs.blog, false)} onClick={() => handleMenuItemClick(menuItemRefs.blog, '/blog')} style={{ display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', opacity: 0 }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '56px', fontWeight: '300', color: '#fff', letterSpacing: '-0.02em' }}>Blog</span>
                </div>
                <div ref={menuItemRefs.community} onMouseEnter={() => handleMenuItemHover(menuItemRefs.community, true)} onMouseLeave={() => handleMenuItemHover(menuItemRefs.community, false)} onClick={() => handleMenuItemClick(menuItemRefs.community, '/community')} style={{ display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', opacity: 0 }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '56px', fontWeight: '300', color: '#fff', letterSpacing: '-0.02em' }}>Community</span>
                </div>
                <div ref={menuItemRefs.donation} onClick={() => handleMenuItemClick(menuItemRefs.donation, '/donation')} style={{ display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', opacity: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '56px', fontWeight: '300', color: '#fff', letterSpacing: '-0.02em' }}>Donation</span>
                    <NorthEastArrow size={28} color="#fff" />
                  </div>
                </div>
                <div ref={menuItemRefs.calendar} onMouseEnter={() => handleMenuItemHover(menuItemRefs.calendar, true)} onMouseLeave={() => handleMenuItemHover(menuItemRefs.calendar, false)} onClick={() => handleMenuItemClick(menuItemRefs.calendar, '/calendar')} style={{ display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', opacity: 0 }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '56px', fontWeight: '300', color: '#fff', letterSpacing: '-0.02em' }}>Calendar</span>
                </div>
                <div ref={menuItemRefs.contact} onMouseEnter={() => handleMenuItemHover(menuItemRefs.contact, true)} onMouseLeave={() => handleMenuItemHover(menuItemRefs.contact, false)} onClick={() => handleMenuItemClick(menuItemRefs.contact, '/contact')} style={{ display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer', opacity: 0 }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '56px', fontWeight: '300', color: '#fff', letterSpacing: '-0.02em' }}>Contact</span>
                </div>
              </div>
            </div>

            {/* Back to Home */}
            <div style={{ position: 'fixed', top: '24px', left: '40px', zIndex: 100 }}>
              <Link href="/">
                <button style={{
                  fontFamily: "'Inter', sans-serif", fontSize: '14px', color: '#000', backgroundColor: 'transparent',
                  border: '1px solid #e0e0e0', borderRadius: '100px', padding: '8px 20px', cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#000'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#000'; }}>
                  ← Back to Home
                </button>
              </Link>
            </div>

            {/* MENURU Logo */}
            <div style={{ position: 'fixed', top: '24px', right: '40px', zIndex: 100, pointerEvents: 'none' }}>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontWeight: 'normal', fontSize: '32px', color: '#000', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>MENURU</span>
            </div>

            {/* Title Section */}
            <div style={{ position: 'relative', top: '100px', left: '40px', zIndex: 10, width: 'calc(100% - 80px)', marginBottom: '80px' }}>
              <div ref={donationTitleRef} style={{ fontFamily: "'Inter', sans-serif", fontSize: '200px', fontWeight: '300', color: '#000', textAlign: 'left', letterSpacing: '-0.03em', lineHeight: '0.9' }}>Donation</div>
              <div ref={donationUnderlineRef} style={{ width: '0%', height: '1px', backgroundColor: '#000', marginTop: '20px', opacity: 0 }} />
            </div>

            {/* Info Text + Create Button */}
            <div style={{ position: 'relative', top: '120px', left: '40px', right: '40px', zIndex: 10, marginBottom: '100px' }}>
              <div ref={infoTextRef} style={{ fontFamily: "'Inter', sans-serif", fontSize: '20px', fontWeight: '400', color: '#666', textAlign: 'left', letterSpacing: '-0.01em', lineHeight: '1.5', marginBottom: '60px', maxWidth: '600px' }}>
                Support meaningful causes through donations. Every contribution makes a difference.
              </div>
              
              {user && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '12px',
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: 0, fontFamily: "'Inter', sans-serif"
                  }}
                  onMouseEnter={(e) => {
                    const span = e.currentTarget.querySelector('span');
                    const svg = e.currentTarget.querySelector('svg');
                    if (span) span.style.transform = 'translateX(8px)';
                    if (svg) svg.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    const span = e.currentTarget.querySelector('span');
                    const svg = e.currentTarget.querySelector('svg');
                    if (span) span.style.transform = 'translateX(0)';
                    if (svg) svg.style.transform = 'translateX(0)';
                  }}
                >
                  <span style={{ fontSize: '18px', fontWeight: '400', color: '#000', transition: 'transform 0.3s ease' }}>Create a Donation</span>
                  <NorthEastArrow size={20} color="#000" style={{ transition: 'transform 0.3s ease' }} />
                </button>
              )}
            </div>

            {/* Donations List */}
            <div style={{ position: 'relative', left: '40px', right: '40px', zIndex: 10, marginBottom: '120px', maxWidth: '900px' }}>
              {donations.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 20px', color: '#999', borderTop: '1px solid #eee' }}>
                  <p style={{ fontSize: '16px', marginBottom: '20px' }}>No donations yet</p>
                  {!user && (
                    <button onClick={handleGoogleLogin} style={{ background: 'none', border: '1px solid #e0e0e0', padding: '10px 24px', borderRadius: '100px', fontSize: '14px', cursor: 'pointer' }}>Login to create one</button>
                  )}
                </div>
              ) : (
                donations.map((donation) => {
                  const isLiked = donation.likes.includes(user?.uid);
                  const percentage = getPercentage(donation.currentAmount, donation.targetAmount);
                  const daysLeft = getDaysRemaining(donation.endDate);
                  
                  return (
                    <div key={donation.id} className="donation-card" style={{ marginBottom: '60px', borderTop: '1px solid #eee', paddingTop: '40px' }}>
                      {/* Header */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <UserIcon size={20} color="#999" />
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '15px', fontWeight: '500', color: '#000' }}>{donation.organizationName}</span>
                              <InstagramVerifiedBadge size={14} />
                            </div>
                            <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>{formatTime(donation.createdAt)} • {donation.location}</div>
                          </div>
                        </div>
                      </div>

                      {/* Title */}
                      <h2 style={{ fontSize: '28px', fontWeight: '500', marginBottom: '12px', color: '#000', letterSpacing: '-0.02em' }}>{donation.title}</h2>
                      
                      {/* Description */}
                      <p style={{ fontSize: '15px', color: '#666', lineHeight: '1.6', marginBottom: '28px', maxWidth: '700px' }}>{donation.description}</p>
                      
                      {/* Progress */}
                      <div style={{ marginBottom: '24px', maxWidth: '500px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '10px', color: '#999' }}>
                          <span>Raised</span>
                          <span style={{ color: '#000' }}>{formatRupiah(donation.currentAmount)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '10px', color: '#999' }}>
                          <span>Target</span>
                          <span style={{ color: '#000' }}>{formatRupiah(donation.targetAmount)}</span>
                        </div>
                        <div style={{ height: '2px', backgroundColor: '#f0f0f0', borderRadius: '1px', overflow: 'hidden', marginTop: '16px' }}>
                          <div style={{ width: `${percentage}%`, height: '100%', backgroundColor: '#000', borderRadius: '1px' }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '12px', color: '#999' }}>
                          <span>{percentage}% funded</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>{daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}</span>
                        </div>
                      </div>

                      {/* Donors Messages */}
                      {donation.donors.length > 0 && (
                        <div style={{ marginBottom: '24px' }}>
                          <div style={{ fontSize: '13px', fontWeight: '500', color: '#000', marginBottom: '16px', letterSpacing: '-0.01em' }}>Recent Donors</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {donation.donors.slice(-3).reverse().map((donor) => (
                              <div key={donor.id} style={{ borderLeft: '1px solid #eee', paddingLeft: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '4px', flexWrap: 'wrap', gap: '8px' }}>
                                  <span style={{ fontSize: '13px', fontWeight: '500', color: '#000' }}>{donor.name}</span>
                                  <span style={{ fontSize: '12px', color: '#999' }}>{formatRupiah(donor.amount)}</span>
                                </div>
                                <p style={{ fontSize: '13px', color: '#666', margin: 0, fontStyle: 'italic' }}>"{donor.message}"</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
                        <button onClick={() => handleLike(donation.id)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', fontSize: '13px', color: isLiked ? '#000' : '#999', cursor: 'pointer' }}>
                          <HeartIcon size={18} filled={isLiked} />
                          <span>{donation.likes.length}</span>
                        </button>
                        <button onClick={() => { setSelectedDonation(donation); setIsDonateModalOpen(true); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', fontSize: '13px', color: '#000', cursor: 'pointer', marginLeft: 'auto' }}>
                          <SendIcon size={16} />
                          <span>Donate</span>
                          <NorthEastArrow size={14} color="#000" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <footer style={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', padding: '0 40px 0 0', margin: 0, pointerEvents: 'none', zIndex: 1 }}>
              <div ref={lineRef} style={{ width: '0%', height: '1px', backgroundColor: '#000', marginRight: '0', marginBottom: '40px', opacity: 0 }} />
              <span ref={menuruTextRef} style={{ fontFamily: "'Bebas Neue', sans-serif", fontWeight: 'normal', fontSize: '400px', color: '#000', textAlign: 'right', letterSpacing: '-0.02em', opacity: 1, textTransform: 'uppercase', lineHeight: '0.7', whiteSpace: 'nowrap', margin: 0, padding: 0 }}>MENURU</span>
            </footer>
          </div>
        </div>
      </div>

      {/* Create Donation Modal */}
      {isCreateModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} onClick={() => setIsCreateModalOpen(false)}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '560px', padding: '48px', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setIsCreateModalOpen(false)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer' }}><CloseIcon size={20} /></button>
            
            <h2 style={{ fontSize: '28px', fontWeight: '400', color: '#000', marginBottom: '8px', letterSpacing: '-0.02em' }}>Create Donation</h2>
            <p style={{ fontSize: '14px', color: '#999', marginBottom: '40px' }}>Start a campaign to make an impact</p>
            
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Campaign Title" style={{ width: '100%', padding: '16px 0', border: 'none', borderBottom: '1px solid #e0e0e0', fontSize: '16px', color: '#000', outline: 'none', marginBottom: '28px', fontFamily: "'Inter', sans-serif" }} />
            
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Campaign Description" rows={4} style={{ width: '100%', padding: '16px 0', border: 'none', borderBottom: '1px solid #e0e0e0', fontSize: '15px', color: '#000', outline: 'none', resize: 'none', marginBottom: '28px', fontFamily: "'Inter', sans-serif" }} />
            
            <input type="text" value={formData.targetAmount} onChange={(e) => setFormData({ ...formData, targetAmount: formatNumberWithDots(e.target.value) })} placeholder="Target Amount (IDR)" style={{ width: '100%', padding: '16px 0', border: 'none', borderBottom: '1px solid #e0e0e0', fontSize: '16px', color: '#000', outline: 'none', marginBottom: '28px', fontFamily: "'Inter', sans-serif" }} />
            
            <input type="text" value={formData.organizationName} onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })} placeholder="Organization / PT Name" style={{ width: '100%', padding: '16px 0', border: 'none', borderBottom: '1px solid #e0e0e0', fontSize: '16px', color: '#000', outline: 'none', marginBottom: '28px', fontFamily: "'Inter', sans-serif" }} />
            
            <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="Location" style={{ width: '100%', padding: '16px 0', border: 'none', borderBottom: '1px solid #e0e0e0', fontSize: '16px', color: '#000', outline: 'none', marginBottom: '28px', fontFamily: "'Inter', sans-serif" }} />
            
            <input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} style={{ width: '100%', padding: '16px 0', border: 'none', borderBottom: '1px solid #e0e0e0', fontSize: '14px', color: '#000', outline: 'none', marginBottom: '40px', fontFamily: "'Inter', sans-serif" }} />
            
            <button onClick={handleCreateDonation} disabled={isSubmitting || !formData.title || !formData.description || !formData.targetAmount} style={{ width: '100%', padding: '14px', background: '#000', border: 'none', color: '#fff', fontSize: '14px', fontWeight: '400', cursor: (isSubmitting || !formData.title || !formData.description || !formData.targetAmount) ? 'not-allowed' : 'pointer', opacity: (isSubmitting || !formData.title || !formData.description || !formData.targetAmount) ? 0.5 : 1, fontFamily: "'Inter', sans-serif" }}>
              {isSubmitting ? 'Creating...' : 'Create Campaign'}
            </button>
          </div>
        </div>
      )}

      {/* Donate Modal */}
      {isDonateModalOpen && selectedDonation && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} onClick={() => setIsDonateModalOpen(false)}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '480px', padding: '48px', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setIsDonateModalOpen(false)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer' }}><CloseIcon size={20} /></button>
            
            <h2 style={{ fontSize: '24px', fontWeight: '400', color: '#000', marginBottom: '8px', letterSpacing: '-0.02em' }}>Make a Donation</h2>
            <p style={{ fontSize: '13px', color: '#999', marginBottom: '32px' }}>{selectedDonation.title}</p>
            
            <input type="text" value={donationAmount} onChange={(e) => setDonationAmount(formatNumberWithDots(e.target.value))} placeholder="Amount (IDR) - Min Rp 10,000" style={{ width: '100%', padding: '16px 0', border: 'none', borderBottom: '1px solid #e0e0e0', fontSize: '20px', color: '#000', outline: 'none', marginBottom: '28px', fontFamily: "'Inter', sans-serif" }} />
            
            <textarea value={donationMessage} onChange={(e) => setDonationMessage(e.target.value)} placeholder="Leave a message of support..." rows={3} style={{ width: '100%', padding: '16px 0', border: 'none', borderBottom: '1px solid #e0e0e0', fontSize: '14px', color: '#000', outline: 'none', resize: 'none', marginBottom: '40px', fontFamily: "'Inter', sans-serif" }} />
            
            <button onClick={handleDonate} disabled={isSubmitting || !donationAmount || !donationMessage} style={{ width: '100%', padding: '14px', background: '#000', border: 'none', color: '#fff', fontSize: '14px', fontWeight: '400', cursor: (isSubmitting || !donationAmount || !donationMessage) ? 'not-allowed' : 'pointer', opacity: (isSubmitting || !donationAmount || !donationMessage) ? 0.5 : 1, fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              {isSubmitting ? 'Processing...' : 'Donate'}
              <NorthWestArrow size={16} color="#fff" />
            </button>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {showSuccess && (
        <div style={{ position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', background: '#000', color: '#fff', padding: '10px 24px', borderRadius: '100px', fontSize: '13px', zIndex: 400, fontFamily: "'Inter', sans-serif" }}>
          {successMessage}
        </div>
      )}

      {/* Cookie Popup */}
      {showPopup && (
        <div style={{ position: 'fixed', bottom: '24px', left: '24px', backgroundColor: '#fff', borderRadius: '16px', padding: '20px 24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #e0e0e0', zIndex: 1000, fontFamily: "'Inter', sans-serif", maxWidth: '360px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <span style={{ fontSize: '28px' }}>🍪</span>
            <span style={{ fontSize: '20px', fontWeight: '400', color: '#000' }}>cookies.</span>
          </div>
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '20px', lineHeight: '1.5' }}>We use cookies to understand how you navigate this site.</p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button ref={declineBtnRef} onClick={handleDecline} style={{ padding: '8px 20px', background: '#fff', border: '1px solid #e0e0e0', borderRadius: '100px', fontSize: '12px', cursor: 'pointer' }}>Decline</button>
            <button ref={acceptBtnRef} onClick={handleAccept} style={{ padding: '8px 20px', background: '#000', border: 'none', borderRadius: '100px', fontSize: '12px', color: '#fff', cursor: 'pointer' }}>Accept</button>
          </div>
        </div>
      )}
    </>
  );
}
