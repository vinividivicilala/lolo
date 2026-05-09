// app/page.tsx (Halaman Utama) - dengan fitur chat realtime di shadow page

'use client';

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import Link from "next/link";
import Image from "next/image";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged, signOut } from "firebase/auth";

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
const auth = getAuth(app);

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);
}

// Interface untuk pesan
interface ChatMessage {
  id: string;
  text: string;
  userName: string;
  userId: string;
  timestamp: Date;
  isAdmin: boolean;
}

// Interface untuk user online
interface OnlineUser {
  id: string;
  userName: string;
  isAdmin: boolean;
  lastSeen: Date;
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
  const [noteHover, setNoteHover] = useState(false);
  const [communityHover, setCommunityHover] = useState(false);
  const [calendarHover, setCalendarHover] = useState(false);
  const [blogHover, setBlogHover] = useState(false);
  const [donationHover, setDonationHover] = useState(false);
  
  // State untuk warna background section Features
  const [featuresBgColor, setFeaturesBgColor] = useState('#0000ff');
  const [featuresTextColor, setFeaturesTextColor] = useState('#ffffff');
  
  // State untuk Shadow Page (halaman bayangan hitam)
  const [showShadowPage, setShowShadowPage] = useState(false);
  const [isShadowTransitioning, setIsShadowTransitioning] = useState(false);
  const shadowPageRef = useRef<HTMLDivElement>(null);
  
  // State untuk Chat
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState<any>(null);
  const [userName, setUserName] = useState("");
  const [isUserNameSet, setIsUserNameSet] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [chatInputRef, setChatInputRef] = useState<HTMLInputElement | null>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const ADMIN_EMAILS = ["admin@menuru.com", "farid@menuru.com"]; // Daftar email admin
  
  const acceptBtnRef = useRef<HTMLButtonElement>(null);
  const declineBtnRef = useRef<HTMLButtonElement>(null);
  const contactBtnRef = useRef<HTMLButtonElement>(null);
  const smootherRef = useRef<any>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  
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
  const bottomLeftTextRef = useRef<HTMLDivElement>(null);
  const studioContainerRef = useRef<HTMLDivElement>(null);
  
  // Section Features Refs
  const featuresSectionRef = useRef<HTMLDivElement>(null);
  const featuresSection2Ref = useRef<HTMLDivElement>(null);
  const featuresSection3Ref = useRef<HTMLDivElement>(null);
  const featuresSection4Ref = useRef<HTMLDivElement>(null);
  const featuresSection5Ref = useRef<HTMLDivElement>(null);
  const featuresTitleRef = useRef<HTMLDivElement>(null);
  const featuresLeftNumberRef = useRef<HTMLDivElement>(null);
  const featuresRightTextRef = useRef<HTMLDivElement>(null);
  const featuresOverlayRef = useRef<HTMLDivElement>(null);
  const featuresArrowRef = useRef<HTMLDivElement>(null);
  const hoverContainerRef = useRef<HTMLDivElement>(null);
  const noteTextRef = useRef<HTMLDivElement>(null);
  const updateContainerRef = useRef<HTMLDivElement>(null);
  const circleImagesRef = useRef<HTMLDivElement>(null);
  
  const featuresLeftNumber2Ref = useRef<HTMLDivElement>(null);
  const featuresRightText2Ref = useRef<HTMLDivElement>(null);
  const featuresOverlay2Ref = useRef<HTMLDivElement>(null);
  const featuresArrow2Ref = useRef<HTMLDivElement>(null);
  const hoverContainer2Ref = useRef<HTMLDivElement>(null);
  const updateContainer2Ref = useRef<HTMLDivElement>(null);
  const circleImages2Ref = useRef<HTMLDivElement>(null);
  
  const featuresLeftNumber3Ref = useRef<HTMLDivElement>(null);
  const featuresRightText3Ref = useRef<HTMLDivElement>(null);
  const featuresOverlay3Ref = useRef<HTMLDivElement>(null);
  const featuresArrow3Ref = useRef<HTMLDivElement>(null);
  const hoverContainer3Ref = useRef<HTMLDivElement>(null);
  const updateContainer3Ref = useRef<HTMLDivElement>(null);
  const circleImages3Ref = useRef<HTMLDivElement>(null);
  
  const featuresLeftNumber4Ref = useRef<HTMLDivElement>(null);
  const featuresRightText4Ref = useRef<HTMLDivElement>(null);
  const featuresOverlay4Ref = useRef<HTMLDivElement>(null);
  const featuresArrow4Ref = useRef<HTMLDivElement>(null);
  const hoverContainer4Ref = useRef<HTMLDivElement>(null);
  const updateContainer4Ref = useRef<HTMLDivElement>(null);
  const circleImages4Ref = useRef<HTMLDivElement>(null);
  
  const featuresLeftNumber5Ref = useRef<HTMLDivElement>(null);
  const featuresRightText5Ref = useRef<HTMLDivElement>(null);
  const featuresOverlay5Ref = useRef<HTMLDivElement>(null);
  const featuresArrow5Ref = useRef<HTMLDivElement>(null);
  const hoverContainer5Ref = useRef<HTMLDivElement>(null);
  const updateContainer5Ref = useRef<HTMLDivElement>(null);
  const circleImages5Ref = useRef<HTMLDivElement>(null);
  
  const trustedSectionRef = useRef<HTMLDivElement>(null);
  const trustedTextRef = useRef<HTMLDivElement>(null);
  
  const img1Ref = useRef<HTMLDivElement>(null);
  const img2Ref = useRef<HTMLDivElement>(null);
  
  const circleImg1Ref = useRef<HTMLDivElement>(null);
  const circleImg2Ref = useRef<HTMLDivElement>(null);
  const circleImg1_2Ref = useRef<HTMLDivElement>(null);
  const circleImg2_2Ref = useRef<HTMLDivElement>(null);
  const circleImg1_3Ref = useRef<HTMLDivElement>(null);
  const circleImg2_3Ref = useRef<HTMLDivElement>(null);
  const circleImg1_4Ref = useRef<HTMLDivElement>(null);
  const circleImg2_4Ref = useRef<HTMLDivElement>(null);
  const circleImg1_5Ref = useRef<HTMLDivElement>(null);
  const circleImg2_5Ref = useRef<HTMLDivElement>(null);

  // Firebase Chat Functions
  useEffect(() => {
    // Sign in anonymously
    signInAnonymously(auth).catch((error) => {
      console.error("Error signing in:", error);
    });

    // Listen to auth state
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribeAuth();
  }, []);

  // Load messages from Firebase
  useEffect(() => {
    const messagesQuery = query(collection(db, "messages"), orderBy("timestamp", "asc"));
    
    const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
      const loadedMessages: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        loadedMessages.push({
          id: doc.id,
          text: data.text,
          userName: data.userName,
          userId: data.userId,
          timestamp: data.timestamp?.toDate() || new Date(),
          isAdmin: data.isAdmin || false,
        });
      });
      setMessages(loadedMessages);
      
      // Scroll to bottom
      setTimeout(() => {
        if (chatMessagesRef.current) {
          chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
        }
      }, 100);
    });

    return () => unsubscribeMessages();
  }, []);

  // Track online users
  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, "onlineUsers", user.uid);
    const onlineUsersQuery = query(collection(db, "onlineUsers"), orderBy("lastSeen", "desc"));

    // Set user as online
    const setUserOnline = async () => {
      await setDoc(userRef, {
        userId: user.uid,
        userName: userName || "Anonymous",
        isAdmin: isAdmin,
        lastSeen: serverTimestamp(),
      });
    };

    setUserOnline();

    // Listen to online users
    const unsubscribeOnline = onSnapshot(onlineUsersQuery, (snapshot) => {
      const users: OnlineUser[] = [];
      const now = new Date();
      snapshot.forEach((doc) => {
        const data = doc.data();
        const lastSeen = data.lastSeen?.toDate() || new Date();
        // Consider user offline if last seen > 2 minutes ago
        const timeDiff = (now.getTime() - lastSeen.getTime()) / 1000 / 60;
        if (timeDiff < 2) {
          users.push({
            id: doc.id,
            userName: data.userName,
            isAdmin: data.isAdmin,
            lastSeen: lastSeen,
          });
        }
      });
      setOnlineUsers(users);
    });

    // Update last seen periodically
    const interval = setInterval(async () => {
      await updateDoc(userRef, {
        lastSeen: serverTimestamp(),
      });
    }, 30000);

    return () => {
      clearInterval(interval);
      unsubscribeOnline();
      // Set user as offline when component unmounts
      updateDoc(userRef, {
        lastSeen: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      }).catch(() => {});
    };
  }, [user, userName, isAdmin]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;
    if (!userName && !isUserNameSet) {
      alert("Please enter your name first");
      return;
    }

    try {
      await addDoc(collection(db, "messages"), {
        text: newMessage,
        userName: userName,
        userId: user.uid,
        timestamp: serverTimestamp(),
        isAdmin: isAdmin,
      });
      setNewMessage("");
      
      // Focus back to input
      if (chatInputRef) {
        chatInputRef.focus();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSetUserName = () => {
    if (userName.trim()) {
      setIsUserNameSet(true);
      // Check if user is admin
      setIsAdmin(ADMIN_EMAILS.includes(userName.toLowerCase()));
    }
  };

  const handleLogout = async () => {
    if (user) {
      const userRef = doc(db, "onlineUsers", user.uid);
      await updateDoc(userRef, {
        lastSeen: new Date(Date.now() - 5 * 60 * 1000),
      }).catch(() => {});
    }
    setIsUserNameSet(false);
    setUserName("");
    setIsAdmin(false);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    }
  };

  const carouselItems = [
    {
      id: 1,
      image: "/images/lkhh.jpg",
      brand: "LKHH Studio",
      description: "Creative digital agency specializing in branding and web design."
    },
    {
      id: 2,
      image: "/images/ai.jpg",
      brand: "AI Creative",
      description: "Artificial intelligence solutions for modern businesses."
    },
    {
      id: 3,
      image: "/images/5.jpg",
      brand: "Farid Corp",
      description: "Technology consulting and software development."
    },
    {
      id: 4,
      image: "/images/lkhh.jpg",
      brand: "Studio Beta",
      description: "UI/UX design and product innovation."
    },
    {
      id: 5,
      image: "/images/ai.jpg",
      brand: "Gamma Labs",
      description: "Research and development in emerging technologies."
    },
    {
      id: 6,
      image: "/images/5.jpg",
      brand: "Delta Creative",
      description: "Content creation and digital marketing."
    }
  ];

  const originalTexts = {
    ig: 'Instagram',
    x: 'X',
    linkedin: 'LinkedIn'
  };

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(today.getDate() + 2);

  const timeSlots = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];

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

  const handleStudioHoverEnter = () => {
    setHoverActive(true);
    
    gsap.killTweensOf([img1Ref.current, img2Ref.current]);
    
    gsap.set(img1Ref.current, { 
      x: -200, 
      y: 0, 
      rotation: -10, 
      scale: 0.8, 
      opacity: 0
    });
    gsap.to(img1Ref.current, {
      x: 0,
      y: 0,
      rotation: 0,
      scale: 1,
      opacity: 1,
      duration: 0.4,
      ease: "back.out(0.8)",
      delay: 0
    });
    
    gsap.set(img2Ref.current, { 
      x: 200, 
      y: 0, 
      rotation: 10, 
      scale: 0.8, 
      opacity: 0
    });
    gsap.to(img2Ref.current, {
      x: 0,
      y: 0,
      rotation: 0,
      scale: 1,
      opacity: 1,
      duration: 0.4,
      ease: "back.out(0.8)",
      delay: 0.1
    });
  };

  const handleStudioHoverLeave = () => {
    setHoverActive(false);
    
    gsap.to([img1Ref.current, img2Ref.current], {
      opacity: 0,
      scale: 0.6,
      duration: 0.3,
      ease: "power2.in"
    });
  };

  // Fungsi untuk reset warna teks ke default berdasarkan background
  const resetTextColorsToDefault = () => {
    const leftNumbers = [
      featuresLeftNumberRef.current,
      featuresLeftNumber2Ref.current,
      featuresLeftNumber3Ref.current,
      featuresLeftNumber4Ref.current,
      featuresLeftNumber5Ref.current
    ];
    
    const rightTexts = [
      featuresRightTextRef.current,
      featuresRightText2Ref.current,
      featuresRightText3Ref.current,
      featuresRightText4Ref.current,
      featuresRightText5Ref.current
    ];
    
    const arrows = [
      featuresArrowRef.current,
      featuresArrow2Ref.current,
      featuresArrow3Ref.current,
      featuresArrow4Ref.current,
      featuresArrow5Ref.current
    ];
    
    const updateNumbers = document.querySelectorAll('.update-number');
    
    const targetColor = featuresTextColor;
    
    leftNumbers.forEach(num => {
      if (num && !noteHover && !communityHover && !calendarHover && !blogHover && !donationHover) {
        gsap.to(num, { color: targetColor, duration: 0.2 });
      }
    });
    
    rightTexts.forEach(text => {
      if (text && !noteHover && !communityHover && !calendarHover && !blogHover && !donationHover) {
        gsap.to(text, { color: targetColor, duration: 0.2 });
      }
    });
    
    updateNumbers.forEach(num => {
      const element = num as HTMLElement;
      if (!noteHover && !communityHover && !calendarHover && !blogHover && !donationHover) {
        gsap.to(element, { color: targetColor, duration: 0.2 });
      }
    });
    
    arrows.forEach(arrow => {
      if (arrow && !noteHover && !communityHover && !calendarHover && !blogHover && !donationHover) {
        const svg = arrow.querySelector('svg');
        if (svg) {
          gsap.to(svg, { stroke: targetColor, duration: 0.2 });
        }
      }
    });
  };

  const handleNoteHoverEnter = () => {
    setNoteHover(true);
    
    gsap.set(featuresOverlayRef.current, { opacity: 1 });
    
    gsap.to(updateContainerRef.current, {
      opacity: 1,
      x: 0,
      duration: 0.2,
      ease: "power2.out"
    });
    
    gsap.to(circleImagesRef.current, {
      opacity: 1,
      x: 0,
      duration: 0.2,
      ease: "power2.out"
    });
    
    // Saat hover, semua teks jadi putih
    gsap.to(featuresLeftNumberRef.current, {
      color: '#ffffff',
      duration: 0.2,
      ease: "power2.out"
    });
    
    gsap.to('.update-number', {
      color: '#ffffff',
      duration: 0.2,
      ease: "power2.out"
    });
    
    gsap.to(featuresRightTextRef.current, {
      color: '#ffffff',
      duration: 0.2,
      ease: "power2.out"
    });
    
    if (featuresArrowRef.current) {
      gsap.to(featuresArrowRef.current, {
        rotation: 0,
        duration: 0.2,
        ease: "back.out(0.6)"
      });
      gsap.to('.features-right-arrow svg', {
        stroke: '#ffffff',
        duration: 0.2,
        ease: "power2.out"
      });
    }
    
    gsap.to([circleImg1Ref.current, circleImg2Ref.current], {
      scale: 1.2,
      duration: 0.2,
      ease: "back.out(0.6)",
      stagger: 0.05
    });
  };

  const handleNoteHoverLeave = () => {
    setNoteHover(false);
    
    gsap.set(featuresOverlayRef.current, { opacity: 0 });
    
    gsap.to(updateContainerRef.current, {
      opacity: 0,
      x: 50,
      duration: 0.2,
      ease: "power2.in"
    });
    
    gsap.to(circleImagesRef.current, {
      opacity: 0,
      x: 20,
      duration: 0.2,
      ease: "power2.in"
    });
    
    // Kembalikan ke warna default berdasarkan background
    const targetColor = featuresTextColor;
    
    gsap.to(featuresLeftNumberRef.current, {
      color: targetColor,
      duration: 0.2,
      ease: "power2.out"
    });
    
    gsap.to('.update-number', {
      color: targetColor,
      duration: 0.2,
      ease: "power2.out"
    });
    
    gsap.to(featuresRightTextRef.current, {
      color: targetColor,
      duration: 0.2,
      ease: "power2.out"
    });
    
    if (featuresArrowRef.current) {
      gsap.to(featuresArrowRef.current, {
        rotation: 45,
        duration: 0.2,
        ease: "back.inOut(0.6)"
      });
      gsap.to('.features-right-arrow svg', {
        stroke: targetColor,
        duration: 0.2,
        ease: "power2.out"
      });
    }
    
    gsap.to([circleImg1Ref.current, circleImg2Ref.current], {
      scale: 1,
      duration: 0.2,
      ease: "power2.in"
    });
  };

  const handleCommunityHoverEnter = () => {
    setCommunityHover(true);
    
    gsap.set(featuresOverlay2Ref.current, { opacity: 1 });
    
    gsap.to(updateContainer2Ref.current, {
      opacity: 1,
      x: 0,
      duration: 0.2,
      ease: "power2.out"
    });
    
    gsap.to(circleImages2Ref.current, {
      opacity: 1,
      x: 0,
      duration: 0.2,
      ease: "power2.out"
    });
    
    gsap.to(featuresLeftNumber2Ref.current, {
      color: '#ffffff',
      duration: 0.2,
      ease: "power2.out"
    });
    
    gsap.to('.update-number', {
      color: '#ffffff',
      duration: 0.2,
      ease: "power2.out"
    });
    
    gsap.to(featuresRightText2Ref.current, {
      color: '#ffffff',
      duration: 0.2,
      ease: "power2.out"
    });
    
    if (featuresArrow2Ref.current) {
      gsap.to(featuresArrow2Ref.current, {
        rotation: 0,
        duration: 0.2,
        ease: "back.out(0.6)"
      });
      gsap.to('.features-right-arrow-2 svg', {
        stroke: '#ffffff',
        duration: 0.2,
        ease: "power2.out"
      });
    }
    
    gsap.to([circleImg1_2Ref.current, circleImg2_2Ref.current], {
      scale: 1.2,
      duration: 0.2,
      ease: "back.out(0.6)",
      stagger: 0.05
    });
  };

  const handleCommunityHoverLeave = () => {
    setCommunityHover(false);
    
    gsap.set(featuresOverlay2Ref.current, { opacity: 0 });
    
    gsap.to(updateContainer2Ref.current, {
      opacity: 0,
      x: 50,
      duration: 0.2,
      ease: "power2.in"
    });
    
    gsap.to(circleImages2Ref.current, {
      opacity: 0,
      x: 20,
      duration: 0.2,
      ease: "power2.in"
    });
    
    const targetColor = featuresTextColor;
    
    gsap.to(featuresLeftNumber2Ref.current, {
      color: targetColor,
      duration: 0.2,
      ease: "power2.out"
    });
    
    gsap.to('.update-number', {
      color: targetColor,
      duration: 0.2,
      ease: "power2.out"
    });
    
    gsap.to(featuresRightText2Ref.current, {
      color: targetColor,
      duration: 0.2,
      ease: "power2.out"
    });
    
    if (featuresArrow2Ref.current) {
      gsap.to(featuresArrow2Ref.current, {
        rotation: 45,
        duration: 0.2,
        ease: "back.inOut(0.6)"
      });
      gsap.to('.features-right-arrow-2 svg', {
        stroke: targetColor,
        duration: 0.2,
        ease: "power2.out"
      });
    }
    
    gsap.to([circleImg1_2Ref.current, circleImg2_2Ref.current], {
      scale: 1,
      duration: 0.2,
      ease: "power2.in"
    });
  };

  const handleCalendarHoverEnter = () => {
    setCalendarHover(true);
    
    gsap.set(featuresOverlay3Ref.current, { opacity: 1 });
    
    gsap.to(updateContainer3Ref.current, {
      opacity: 1,
      x: 0,
      duration: 0.2,
      ease: "power2.out"
    });
    
    gsap.to(circleImages3Ref.current, {
      opacity: 1,
      x: 0,
      duration: 0.2,
      ease: "power2.out"
    });
    
    gsap.to(featuresLeftNumber3Ref.current, {
      color: '#ffffff',
      duration: 0.2,
      ease: "power2.out"
    });
    
    gsap.to('.update-number', {
      color: '#ffffff',
      duration: 0.2,
      ease: "power2.out"
    });
    
    gsap.to(featuresRightText3Ref.current, {
      color: '#ffffff',
      duration: 0.2,
      ease: "power2.out"
    });
    
    if (featuresArrow3Ref.current) {
      gsap.to(featuresArrow3Ref.current, {
        rotation: 0,
        duration: 0.2,
        ease: "back.out(0.6)"
      });
      gsap.to('.features-right-arrow-3 svg', {
        stroke: '#ffffff',
        duration: 0.2,
        ease: "power2.out"
      });
    }
    
    gsap.to([circleImg1_3Ref.current, circleImg2_3Ref.current], {
      scale: 1.2,
      duration: 0.2,
      ease: "back.out(0.6)",
      stagger: 0.05
    });
  };

  const handleCalendarHoverLeave = () => {
    setCalendarHover(false);
    
    gsap.set(featuresOverlay3Ref.current, { opacity: 0 });
    
    gsap.to(updateContainer3Ref.current, {
      opacity: 0,
      x: 50,
      duration: 0.2,
      ease: "power2.in"
    });
    
    gsap.to(circleImages3Ref.current, {
      opacity: 0,
      x: 20,
      duration: 0.2,
      ease: "power2.in"
    });
    
    const targetColor = featuresTextColor;
    
    gsap.to(featuresLeftNumber3Ref.current, {
      color: targetColor,
      duration: 0.2,
      ease: "power2.out"
    });
    
    gsap.to('.update-number', {
      color: targetColor,
      duration: 0.2,
      ease: "power2.out"
    });
    
    gsap.to(featuresRightText3Ref.current, {
      color: targetColor,
      duration: 0.2,
      ease: "power2.out"
    });
    
    if (featuresArrow3Ref.current) {
      gsap.to(featuresArrow3Ref.current, {
        rotation: 45,
        duration: 0.2,
        ease: "back.inOut(0.6)"
      });
      gsap.to('.features-right-arrow-3 svg', {
        stroke: targetColor,
        duration: 0.2,
        ease: "power2.out"
      });
    }
    
    gsap.to([circleImg1_3Ref.current, circleImg2_3Ref.current], {
      scale: 1,
      duration: 0.2,
      ease: "power2.in"
    });
  };

  const handleBlogHoverEnter = () => {
    setBlogHover(true);
    
    gsap.set(featuresOverlay4Ref.current, { opacity: 1 });
    
    gsap.to(updateContainer4Ref.current, {
      opacity: 1,
      x: 0,
      duration: 0.2,
      ease: "power2.out"
    });
    
    gsap.to(circleImages4Ref.current, {
      opacity: 1,
      x: 0,
      duration: 0.2,
      ease: "power2.out"
    });
    
    gsap.to(featuresLeftNumber4Ref.current, {
      color: '#ffffff',
      duration: 0.2,
      ease: "power2.out"
    });
    
    gsap.to('.update-number', {
      color: '#ffffff',
      duration: 0.2,
      ease: "power2.out"
    });
    
    gsap.to(featuresRightText4Ref.current, {
      color: '#ffffff',
      duration: 0.2,
      ease: "power2.out"
    });
    
    if (featuresArrow4Ref.current) {
      gsap.to(featuresArrow4Ref.current, {
        rotation: 0,
        duration: 0.2,
        ease: "back.out(0.6)"
      });
      gsap.to('.features-right-arrow-4 svg', {
        stroke: '#ffffff',
        duration: 0.2,
        ease: "power2.out"
      });
    }
    
    gsap.to([circleImg1_4Ref.current, circleImg2_4Ref.current], {
      scale: 1.2,
      duration: 0.2,
      ease: "back.out(0.6)",
      stagger: 0.05
    });
  };

  const handleBlogHoverLeave = () => {
    setBlogHover(false);
    
    gsap.set(featuresOverlay4Ref.current, { opacity: 0 });
    
    gsap.to(updateContainer4Ref.current, {
      opacity: 0,
      x: 50,
      duration: 0.2,
      ease: "power2.in"
    });
    
    gsap.to(circleImages4Ref.current, {
      opacity: 0,
      x: 20,
      duration: 0.2,
      ease: "power2.in"
    });
    
    const targetColor = featuresTextColor;
    
    gsap.to(featuresLeftNumber4Ref.current, {
      color: targetColor,
      duration: 0.2,
      ease: "power2.out"
    });
    
    gsap.to('.update-number', {
      color: targetColor,
      duration: 0.2,
      ease: "power2.out"
    });
    
    gsap.to(featuresRightText4Ref.current, {
      color: targetColor,
      duration: 0.2,
      ease: "power2.out"
    });
    
    if (featuresArrow4Ref.current) {
      gsap.to(featuresArrow4Ref.current, {
        rotation: 45,
        duration: 0.2,
        ease: "back.inOut(0.6)"
      });
      gsap.to('.features-right-arrow-4 svg', {
        stroke: targetColor,
        duration: 0.2,
        ease: "power2.out"
      });
    }
    
    gsap.to([circleImg1_4Ref.current, circleImg2_4Ref.current], {
      scale: 1,
      duration: 0.2,
      ease: "power2.in"
    });
  };

  const handleDonationHoverEnter = () => {
    setDonationHover(true);
    
    gsap.set(featuresOverlay5Ref.current, { opacity: 1 });
    
    gsap.to(updateContainer5Ref.current, {
      opacity: 1,
      x: 0,
      duration: 0.2,
      ease: "power2.out"
    });
    
    gsap.to(circleImages5Ref.current, {
      opacity: 1,
      x: 0,
      duration: 0.2,
      ease: "power2.out"
    });
    
    gsap.to(featuresLeftNumber5Ref.current, {
      color: '#ffffff',
      duration: 0.2,
      ease: "power2.out"
    });
    
    gsap.to('.update-number', {
      color: '#ffffff',
      duration: 0.2,
      ease: "power2.out"
    });
    
    gsap.to(featuresRightText5Ref.current, {
      color: '#ffffff',
      duration: 0.2,
      ease: "power2.out"
    });
    
    if (featuresArrow5Ref.current) {
      gsap.to(featuresArrow5Ref.current, {
        rotation: 0,
        duration: 0.2,
        ease: "back.out(0.6)"
      });
      gsap.to('.features-right-arrow-5 svg', {
        stroke: '#ffffff',
        duration: 0.2,
        ease: "power2.out"
      });
    }
    
    gsap.to([circleImg1_5Ref.current, circleImg2_5Ref.current], {
      scale: 1.2,
      duration: 0.2,
      ease: "back.out(0.6)",
      stagger: 0.05
    });
  };

  const handleDonationHoverLeave = () => {
    setDonationHover(false);
    
    gsap.set(featuresOverlay5Ref.current, { opacity: 0 });
    
    gsap.to(updateContainer5Ref.current, {
      opacity: 0,
      x: 50,
      duration: 0.2,
      ease: "power2.in"
    });
    
    gsap.to(circleImages5Ref.current, {
      opacity: 0,
      x: 20,
      duration: 0.2,
      ease: "power2.in"
    });
    
    const targetColor = featuresTextColor;
    
    gsap.to(featuresLeftNumber5Ref.current, {
      color: targetColor,
      duration: 0.2,
      ease: "power2.out"
    });
    
    gsap.to('.update-number', {
      color: targetColor,
      duration: 0.2,
      ease: "power2.out"
    });
    
    gsap.to(featuresRightText5Ref.current, {
      color: targetColor,
      duration: 0.2,
      ease: "power2.out"
    });
    
    if (featuresArrow5Ref.current) {
      gsap.to(featuresArrow5Ref.current, {
        rotation: 45,
        duration: 0.2,
        ease: "back.inOut(0.6)"
      });
      gsap.to('.features-right-arrow-5 svg', {
        stroke: targetColor,
        duration: 0.2,
        ease: "power2.out"
      });
    }
    
    gsap.to([circleImg1_5Ref.current, circleImg2_5Ref.current], {
      scale: 1,
      duration: 0.2,
      ease: "power2.in"
    });
  };

  // Effect untuk Shadow Page (deteksi scroll di bagian footer)
  useEffect(() => {
    if (isLoading) return;

    const handleShadowPageScroll = () => {
      if (!mainContentRef.current || !shadowPageRef.current) return;
      
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const distanceToBottom = documentHeight - (scrollY + windowHeight);
      const threshold = 100; // Jarak threshold untuk memicu
      
      // Cek apakah sudah hampir sampai bawah
      const shouldShowShadow = distanceToBottom <= threshold;
      
      if (shouldShowShadow && !showShadowPage && !isShadowTransitioning) {
        // Tampilkan shadow page dengan animasi lambat
        setIsShadowTransitioning(true);
        setShowShadowPage(true);
        
        // Animate shadow page muncul dari bawah
        gsap.set(shadowPageRef.current, { y: "100%" });
        gsap.to(shadowPageRef.current, {
          y: "0%",
          duration: 0.8,
          ease: "power3.inOut",
          onComplete: () => {
            setIsShadowTransitioning(false);
          }
        });
        
        // Animate main content sedikit ke atas (opsional)
        gsap.to(mainContentRef.current, {
          y: "-5vh",
          duration: 0.6,
          ease: "power2.inOut"
        });
        
      } else if (!shouldShowShadow && showShadowPage && !isShadowTransitioning) {
        // Sembunyikan shadow page dengan animasi lambat saat scroll ke atas
        setIsShadowTransitioning(true);
        
        // Animate main content kembali
        gsap.to(mainContentRef.current, {
          y: "0%",
          duration: 0.6,
          ease: "power2.inOut"
        });
        
        // Animate shadow page keluar
        gsap.to(shadowPageRef.current, {
          y: "100%",
          duration: 0.8,
          ease: "power3.inOut",
          onComplete: () => {
            setShowShadowPage(false);
            setIsShadowTransitioning(false);
            setShowChat(false); // Close chat when shadow page hides
          }
        });
      }
    };
    
    window.addEventListener('scroll', handleShadowPageScroll);
    
    return () => {
      window.removeEventListener('scroll', handleShadowPageScroll);
    };
  }, [isLoading, showShadowPage, isShadowTransitioning]);

  useEffect(() => {
    if (isLoading) return;
    
    const carousel = carouselRef.current;
    if (!carousel) return;

    let isScrolling = false;
    
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      
      e.preventDefault();
      if (isScrolling) return;
      
      isScrolling = true;
      const scrollAmount = e.deltaY > 0 ? 400 : -400;
      carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      
      setTimeout(() => {
        isScrolling = false;
      }, 200);
    };
    
    carousel.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      carousel.removeEventListener('wheel', handleWheel);
    };
  }, [isLoading]);

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

  // Efek scroll untuk FEATURES section - DIPERBAIKI
  useEffect(() => {
    if (isLoading) return;

    const handleScroll = () => {
      if (!featuresSectionRef.current) return;
      
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // Dapatkan posisi semua section Features
      const featuresSections = [
        featuresSectionRef.current,
        featuresSection2Ref.current,
        featuresSection3Ref.current,
        featuresSection4Ref.current,
        featuresSection5Ref.current
      ].filter(Boolean);
      
      const trustedSection = trustedSectionRef.current;
      
      if (!trustedSection) return;
      
      // Cek apakah scroll berada di atas batas section Trusted Collabs
      const trustedTop = trustedSection.offsetTop;
      const isAboveTrusted = scrollPosition + windowHeight/2 < trustedTop;
      
      // Cek apakah scroll berada di dalam area Features (salah satu section Features)
      let isInFeatures = false;
      featuresSections.forEach(section => {
        if (section) {
          const sectionTop = section.offsetTop;
          const sectionBottom = sectionTop + section.offsetHeight;
          if (scrollPosition + windowHeight/2 >= sectionTop && scrollPosition + windowHeight/2 <= sectionBottom) {
            isInFeatures = true;
          }
        }
      });
      
      // Update warna berdasarkan posisi scroll
      if (isInFeatures && isAboveTrusted) {
        // Masih di area Features dan belum mencapai Trusted Collabs - warna biru dengan teks putih
        if (featuresBgColor !== '#0000ff') {
          setFeaturesBgColor('#0000ff');
          setFeaturesTextColor('#ffffff');
          updateFeaturesColors('#0000ff', '#ffffff');
        }
      } else if (!isAboveTrusted || !isInFeatures) {
        // Sudah melewati batas Trusted Collabs atau keluar area Features - warna putih dengan teks hitam
        if (featuresBgColor !== '#ffffff') {
          setFeaturesBgColor('#ffffff');
          setFeaturesTextColor('#000000');
          updateFeaturesColors('#ffffff', '#000000');
        }
      }
    };
    
    const updateFeaturesColors = (bgColor: string, textColor: string) => {
      // Update semua section Features
      const featuresSections = [
        featuresSectionRef.current,
        featuresSection2Ref.current,
        featuresSection3Ref.current,
        featuresSection4Ref.current,
        featuresSection5Ref.current
      ].filter(Boolean);
      
      featuresSections.forEach(section => {
        if (section) {
          gsap.to(section, {
            backgroundColor: bgColor,
            duration: 0.3,
            ease: "power2.inOut"
          });
        }
      });
      
      // Update title Features
      if (featuresTitleRef.current) {
        gsap.to(featuresTitleRef.current, {
          color: textColor,
          duration: 0.3,
          ease: "power2.inOut"
        });
      }
      
      // Update semua teks Features (angka, teks, panah) kecuali yang sedang hover
      const leftNumbers = [
        featuresLeftNumberRef.current,
        featuresLeftNumber2Ref.current,
        featuresLeftNumber3Ref.current,
        featuresLeftNumber4Ref.current,
        featuresLeftNumber5Ref.current
      ];
      
      const rightTexts = [
        featuresRightTextRef.current,
        featuresRightText2Ref.current,
        featuresRightText3Ref.current,
        featuresRightText4Ref.current,
        featuresRightText5Ref.current
      ];
      
      const arrows = [
        featuresArrowRef.current,
        featuresArrow2Ref.current,
        featuresArrow3Ref.current,
        featuresArrow4Ref.current,
        featuresArrow5Ref.current
      ];
      
      const updateNumbers = document.querySelectorAll('.update-number');
      
      leftNumbers.forEach(num => {
        if (num && !noteHover && !communityHover && !calendarHover && !blogHover && !donationHover) {
          gsap.to(num, { color: textColor, duration: 0.2 });
        }
      });
      
      rightTexts.forEach(text => {
        if (text && !noteHover && !communityHover && !calendarHover && !blogHover && !donationHover) {
          gsap.to(text, { color: textColor, duration: 0.2 });
        }
      });
      
      updateNumbers.forEach(num => {
        const element = num as HTMLElement;
        if (!noteHover && !communityHover && !calendarHover && !blogHover && !donationHover) {
          gsap.to(element, { color: textColor, duration: 0.2 });
        }
      });
      
      arrows.forEach(arrow => {
        if (arrow && !noteHover && !communityHover && !calendarHover && !blogHover && !donationHover) {
          const svg = arrow.querySelector('svg');
          if (svg) {
            gsap.to(svg, { stroke: textColor, duration: 0.2 });
          }
        }
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Panggil sekali untuk inisialisasi
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoading, featuresBgColor, noteHover, communityHover, calendarHover, blogHover, donationHover]);

  // Efek scroll untuk TRUSTED COLLABS section
  useEffect(() => {
    if (isLoading) return;

    const handleScroll = () => {
      if (!trustedSectionRef.current) return;
      
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const sectionTop = trustedSectionRef.current.offsetTop;
      const sectionBottom = sectionTop + trustedSectionRef.current.offsetHeight;
      
      const isInSection = scrollPosition + windowHeight/2 >= sectionTop && scrollPosition + windowHeight/2 <= sectionBottom;
      
      if (isInSection) {
        gsap.to(trustedSectionRef.current, {
          backgroundColor: '#000000',
          duration: 0.3,
          ease: "power2.inOut"
        });
        if (trustedTextRef.current) {
          gsap.to(trustedTextRef.current, {
            color: '#ffffff',
            duration: 0.3,
            ease: "power2.inOut"
          });
        }
        gsap.to('.carousel-brand, .carousel-desc', {
          color: '#ffffff',
          duration: 0.3,
          ease: "power2.inOut"
        });
      } else {
        gsap.to(trustedSectionRef.current, {
          backgroundColor: '#ffffff',
          duration: 0.3,
          ease: "power2.inOut"
        });
        if (trustedTextRef.current) {
          gsap.to(trustedTextRef.current, {
            color: 'rgb(21, 22, 26)',
            duration: 0.3,
            ease: "power2.inOut"
          });
        }
        gsap.to('.carousel-brand, .carousel-desc', {
          color: 'rgb(21, 22, 26)',
          duration: 0.3,
          ease: "power2.inOut"
        });
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoading]);

  // Animasi SplitText untuk FEATURES title
  useEffect(() => {
    if (isLoading) return;

    const titleElement = featuresTitleRef.current;
    
    if (titleElement) {
      const split = new SplitText(titleElement, {
        type: "chars, words",
        charsClass: "features-char"
      });
      gsap.set(split.chars, {
        opacity: 0,
        y: 100,
        rotationX: -90,
        transformPerspective: 800,
        filter: 'blur(20px)'
      });
      ScrollTrigger.create({
        trigger: featuresSectionRef.current,
        start: "top 80%",
        end: "bottom 20%",
        onEnter: () => {
          gsap.to(split.chars, {
            opacity: 1,
            y: 0,
            rotationX: 0,
            filter: 'blur(0px)',
            duration: 1.2,
            stagger: { each: 0.06, from: "start", ease: "power2.out" },
            ease: "back.out(0.6)"
          });
        },
        onLeaveBack: () => {
          gsap.to(split.chars, {
            opacity: 0,
            y: 100,
            rotationX: -90,
            filter: 'blur(20px)',
            duration: 0.8,
            stagger: { each: 0.02, from: "start" },
          });
        },
        toggleActions: "play none none reverse"
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [isLoading]);

  // Animasi SplitText untuk TRUSTED COLLABS
  useEffect(() => {
    if (isLoading) return;

    const trustedElement = trustedTextRef.current;
    if (!trustedElement) return;

    const splitTrusted = new SplitText(trustedElement, {
      type: "chars, words",
      charsClass: "trusted-char"
    });

    gsap.set(splitTrusted.chars, {
      opacity: 0,
      y: 100,
      rotationX: -90,
      transformPerspective: 800,
      filter: 'blur(20px)'
    });

    ScrollTrigger.create({
      trigger: trustedSectionRef.current,
      start: "top 80%",
      end: "bottom 20%",
      onEnter: () => {
        gsap.to(splitTrusted.chars, {
          opacity: 1,
          y: 0,
          rotationX: 0,
          filter: 'blur(0px)',
          duration: 1.2,
          stagger: { each: 0.03, from: "start", ease: "power2.out" },
          ease: "back.out(0.6)"
        });
      },
      onLeaveBack: () => {
        gsap.to(splitTrusted.chars, {
          opacity: 0,
          y: 100,
          rotationX: -90,
          filter: 'blur(20px)',
          duration: 0.8,
          stagger: { each: 0.02, from: "start" },
        });
      },
      toggleActions: "play none none reverse"
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [isLoading]);

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

  const NorthEastArrow = ({ size = 50 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const StraightLine = ({ size = 50 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );

  const days = getDaysInMonth(currentMonth);
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Questrial&display=swap');
        
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

        .trusted-char {
          display: inline-block;
          will-change: transform, opacity, filter;
          transform-style: preserve-3d;
        }

        .features-char {
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

        /* Animasi untuk Shadow Page fade in */
        @keyframes shadowFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* Chat animations */
        @keyframes chatSlideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes messageIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
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
        }
        
        .studio-text:hover {
          opacity: 0.8;
        }

        .studio-hover-images {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 150;
        }

        .floating-img-studio {
          position: absolute;
          width: 400px;
          height: 500px;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
          opacity: 0;
          background-color: #f5f5f5;
        }

        .bottom-left-text {
          font-family: 'HelveticaNowDisplay', 'Arial', sans-serif;
          font-weight: 400;
          font-size: 40px;
          color: rgb(16, 16, 16);
          letter-spacing: -0.02em;
          line-height: 1.3;
        }

        /* SECTION FEATURES */
        .features-section {
          min-height: 25vh;
          width: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: background-color 0.3s ease;
          position: relative;
          z-index: 5;
          padding: 40px 80px 40px 80px;
          box-sizing: border-box;
          overflow: visible;
          border-bottom: 1px solid rgba(255,255,255,0.15);
        }

        .features-top {
          width: 100%;
          display: flex;
          justify-content: flex-start;
          margin-bottom: 30px;
        }

        .features-title {
          font-family: 'Aeonik-Regular', Helvetica, Arial, sans-serif;
          font-weight: 400;
          font-size: 300px;
          color: #ffffff;
          letter-spacing: -0.02em;
          line-height: 1;
          margin: 0;
          transition: color 0.3s ease;
        }

        .features-bottom {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          position: relative;
          z-index: 10;
        }

        .features-left-number {
          font-family: 'Aeonik-Regular', Helvetica, Arial, sans-serif;
          font-weight: 400;
          font-size: 150px;
          letter-spacing: -0.02em;
          line-height: 1;
          margin: 0;
          transition: color 0.2s ease;
        }

        /* Hover Container */
        .hover-container {
          position: relative;
          cursor: pointer;
          z-index: 20;
          display: flex;
          align-items: center;
          gap: 25px;
        }

        .features-right-text {
          font-family: 'Aeonik-Regular', Helvetica, Arial, sans-serif;
          font-weight: 400;
          font-size: 150px;
          letter-spacing: -0.02em;
          line-height: 1;
          margin: 0;
          transition: color 0.2s ease;
          display: inline-block;
          z-index: 2;
          position: relative;
        }

        /* Update container */
        .update-container {
          opacity: 0;
          transform: translateX(50px);
          transition: opacity 0.2s ease, transform 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          position: relative;
        }

        .update-number {
          font-family: 'Aeonik-Regular', Helvetica, Arial, sans-serif;
          font-size: 70px;
          font-weight: 400;
          line-height: 1;
          transition: color 0.2s ease;
        }

        .update-number sup {
          font-size: 35px;
        }

        /* Arrow */
        .features-right-arrow {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease;
          z-index: 2;
          position: relative;
        }

        .features-right-arrow svg {
          width: 50px;
          height: 50px;
          stroke: currentColor;
          transition: stroke 0.2s ease, transform 0.2s ease;
        }

        /* Circle Images container */
        .circle-images-container {
          opacity: 0;
          transform: translateX(20px);
          transition: opacity 0.2s ease, transform 0.2s ease;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-left: 10px;
          z-index: 2;
          position: relative;
        }

        .circle-img {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          overflow: hidden;
          position: relative;
          transition: transform 0.2s ease;
          border: 2px solid #ffffff;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }

        /* Overlay hitam - full width ke kiri mentok */
        .features-overlay {
          position: absolute;
          top: -20px;
          left: -100vw;
          right: -200px;
          bottom: -20px;
          background-color: #000000;
          opacity: 0;
          pointer-events: none;
          z-index: 1;
          border-radius: 0px;
          transition: opacity 0.2s ease;
          width: calc(100% + 100vw + 200px);
        }

        /* Hover container saat hover */
        .hover-container:hover .features-overlay {
          opacity: 1;
        }

        .hover-container:hover .update-container {
          opacity: 1;
          transform: translateX(0);
        }

        .hover-container:hover .circle-images-container {
          opacity: 1;
          transform: translateX(0);
        }

        /* SECTION TRUSTED COLLABS */
        .trusted-section {
          min-height: 100vh;
          width: 100%;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: flex-start;
          transition: background-color 0.3s ease;
          position: relative;
          z-index: 5;
          padding-left: 80px;
          padding-top: 80px;
          padding-bottom: 80px;
          box-sizing: border-box;
          overflow-x: hidden;
        }

        .trusted-text {
          font-family: 'Aeonik-Regular', Helvetica, Arial, sans-serif;
          font-weight: 400;
          font-size: 150px;
          color: rgb(21, 22, 26);
          letter-spacing: -0.02em;
          line-height: 1.2;
          text-align: left;
          margin: 0;
          transition: color 0.3s ease;
          margin-bottom: 60px;
        }

        /* Carousel Horizontal Styles */
        .carousel-container {
          width: 100%;
          overflow-x: auto;
          overflow-y: hidden;
          cursor: grab;
          scroll-behavior: smooth;
          padding-bottom: 40px;
        }
        
        .carousel-container:active {
          cursor: grabbing;
        }
        
        .carousel-track {
          display: flex;
          gap: 30px;
          padding-right: 80px;
        }
        
        .carousel-item {
          flex-shrink: 0;
          width: 380px;
          background: transparent;
          border-radius: 24px;
          transition: all 0.3s ease;
        }
        
        .carousel-item:hover {
          transform: translateY(-10px);
        }
        
        .carousel-image {
          width: 100%;
          height: 380px;
          border-radius: 20px;
          overflow: hidden;
          position: relative;
          margin-bottom: 20px;
        }
        
        .carousel-brand {
          font-family: 'Aeonik-Regular', Helvetica, Arial, sans-serif;
          font-weight: 500;
          font-size: 24px;
          color: rgb(21, 22, 26);
          margin: 0 0 8px 0;
          transition: color 0.3s ease;
          letter-spacing: -0.02em;
        }
        
        .carousel-desc {
          font-family: 'Questrial', sans-serif;
          font-weight: 400;
          font-size: 14px;
          color: rgb(21, 22, 26);
          line-height: 1.5;
          transition: color 0.3s ease;
          opacity: 0.8;
        }

        .carousel-container::-webkit-scrollbar {
          height: 4px;
          display: block;
        }
        
        .carousel-container::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }
        
        .carousel-container::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 10px;
        }
        
        .trusted-section .carousel-container::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.2);
        }
        
        .trusted-section .carousel-container::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.5);
        }

        /* Chat Component Styles */
        .chat-container {
          position: absolute;
          bottom: 40px;
          right: 40px;
          width: 380px;
          height: 600px;
          background: white;
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: chatSlideIn 0.3s ease;
          z-index: 100;
        }

        .chat-header {
          background: linear-gradient(135deg, #1a1a1a 0%, #000000 100%);
          color: white;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
        }

        .chat-title {
          font-size: 18px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .online-indicator {
          width: 10px;
          height: 10px;
          background-color: #4caf50;
          border-radius: 50%;
          display: inline-block;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
          100% { opacity: 1; transform: scale(1); }
        }

        .close-chat {
          cursor: pointer;
          font-size: 24px;
          line-height: 1;
          transition: opacity 0.2s;
        }

        .close-chat:hover {
          opacity: 0.7;
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          background: #f5f5f5;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .message {
          max-width: 80%;
          animation: messageIn 0.2s ease;
        }

        .message-user {
          align-self: flex-start;
        }

        .message-admin {
          align-self: flex-end;
        }

        .message-other {
          align-self: flex-start;
        }

        .message-bubble {
          padding: 10px 14px;
          border-radius: 18px;
          position: relative;
          word-wrap: break-word;
        }

        .message-user .message-bubble {
          background: white;
          border: 1px solid #e0e0e0;
          border-bottom-left-radius: 4px;
        }

        .message-admin .message-bubble {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-bottom-right-radius: 4px;
        }

        .message-other .message-bubble {
          background: white;
          border: 1px solid #e0e0e0;
          border-bottom-left-radius: 4px;
        }

        .message-name {
          font-size: 11px;
          font-weight: 600;
          margin-bottom: 4px;
          color: #666;
        }

        .message-admin .message-name {
          color: rgba(255, 255, 255, 0.8);
        }

        .message-text {
          font-size: 14px;
          line-height: 1.4;
        }

        .message-time {
          font-size: 10px;
          margin-top: 4px;
          opacity: 0.6;
        }

        .chat-input-area {
          padding: 16px;
          background: white;
          border-top: 1px solid #e0e0e0;
          display: flex;
          gap: 12px;
        }

        .chat-input {
          flex: 1;
          padding: 10px 14px;
          border: 1px solid #e0e0e0;
          border-radius: 24px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }

        .chat-input:focus {
          border-color: #667eea;
        }

        .send-button {
          padding: 8px 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 24px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: transform 0.2s, opacity 0.2s;
        }

        .send-button:hover {
          transform: scale(1.05);
          opacity: 0.9;
        }

        .name-input-container {
          padding: 20px;
          background: white;
          border-top: 1px solid #e0e0e0;
        }

        .name-input {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid #e0e0e0;
          border-radius: 24px;
          font-size: 14px;
          margin-bottom: 10px;
          outline: none;
        }

        .set-name-button {
          width: 100%;
          padding: 10px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 24px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
        }

        .online-users {
          padding: 12px 16px;
          background: #f9f9f9;
          border-bottom: 1px solid #e0e0e0;
          font-size: 12px;
          color: #666;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .online-user {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: white;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
        }

        .admin-badge {
          background: #764ba2;
          color: white;
          padding: 2px 6px;
          border-radius: 12px;
          font-size: 9px;
          margin-left: 4px;
        }

        .logout-button {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          padding: 4px 10px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 12px;
          transition: background 0.2s;
        }

        .logout-button:hover {
          background: rgba(255, 255, 255, 0.3);
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
                onMouseEnter={handleStudioHoverEnter}
                onMouseLeave={handleStudioHoverLeave}
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

              {/* Floating Images */}
              <div className="studio-hover-images">
                <div
                  ref={img1Ref}
                  className="floating-img-studio"
                  style={{
                    left: '0%',
                    top: '50%',
                    transform: 'translateY(-50%)'
                  }}
                >
                  <Image
                    src="/images/lkhh.jpg"
                    alt="Gallery 1"
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>

                <div
                  ref={img2Ref}
                  className="floating-img-studio"
                  style={{
                    right: '0%',
                    top: '50%',
                    transform: 'translateY(-50%)'
                  }}
                >
                  <Image
                    src="/images/ai.jpg"
                    alt="Gallery 2"
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              </div>
            </div>

            {/* SECTION FEATURES - 01 NOTE */}
            <div
              ref={featuresSectionRef}
              className="features-section"
              style={{
                backgroundColor: featuresBgColor,
              }}
            >
              <div className="features-top">
                <div
                  ref={featuresTitleRef}
                  className="features-title"
                  style={{ color: featuresTextColor }}
                >
                  Features
                </div>
              </div>
              <div className="features-bottom">
                <div
                  ref={featuresLeftNumberRef}
                  className="features-left-number"
                  style={{ color: featuresTextColor }}
                >
                  01
                </div>
                
                <div 
                  ref={hoverContainerRef}
                  className="hover-container"
                  onMouseEnter={handleNoteHoverEnter}
                  onMouseLeave={handleNoteHoverLeave}
                >
                  <div
                    ref={featuresRightTextRef}
                    className="features-right-text"
                    style={{ color: featuresTextColor }}
                  >
                    Note
                  </div>
                  
                  <div ref={updateContainerRef} className="update-container">
                    <div className="update-number" style={{ color: featuresTextColor }}>
                      Update<sup>¹</sup>
                    </div>
                  </div>
                  
                  <div 
                    ref={featuresArrowRef}
                    className="features-right-arrow"
                  >
                    {noteHover ? (
                      <StraightLine size={50} />
                    ) : (
                      <NorthEastArrow size={50} />
                    )}
                  </div>
                  
                  <div ref={circleImagesRef} className="circle-images-container">
                    <div
                      ref={circleImg1Ref}
                      className="circle-img"
                    >
                      <Image
                        src="/images/lkhh.jpg"
                        alt="circle 1"
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <div
                      ref={circleImg2Ref}
                      className="circle-img"
                    >
                      <Image
                        src="/images/ai.jpg"
                        alt="circle 2"
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  </div>
                  
                  <div ref={featuresOverlayRef} className="features-overlay" />
                </div>
              </div>
            </div>

            {/* SECTION FEATURES - 02 COMMUNITY */}
            <div
              ref={featuresSection2Ref}
              className="features-section"
              style={{
                backgroundColor: featuresBgColor,
              }}
            >
              <div className="features-bottom">
                <div
                  ref={featuresLeftNumber2Ref}
                  className="features-left-number"
                  style={{ color: featuresTextColor }}
                >
                  02
                </div>
                
                <div 
                  ref={hoverContainer2Ref}
                  className="hover-container"
                  onMouseEnter={handleCommunityHoverEnter}
                  onMouseLeave={handleCommunityHoverLeave}
                >
                  <div
                    ref={featuresRightText2Ref}
                    className="features-right-text"
                    style={{ color: featuresTextColor }}
                  >
                    Community
                  </div>
                  
                  <div ref={updateContainer2Ref} className="update-container">
                    <div className="update-number" style={{ color: featuresTextColor }}>
                      Join<sup>²</sup>
                    </div>
                  </div>
                  
                  <div 
                    ref={featuresArrow2Ref}
                    className="features-right-arrow"
                  >
                    {communityHover ? (
                      <StraightLine size={50} />
                    ) : (
                      <NorthEastArrow size={50} />
                    )}
                  </div>
                  
                  <div ref={circleImages2Ref} className="circle-images-container">
                    <div
                      ref={circleImg1_2Ref}
                      className="circle-img"
                    >
                      <Image
                        src="/images/ai.jpg"
                        alt="circle 1"
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <div
                      ref={circleImg2_2Ref}
                      className="circle-img"
                    >
                      <Image
                        src="/images/lkhh.jpg"
                        alt="circle 2"
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  </div>
                  
                  <div ref={featuresOverlay2Ref} className="features-overlay" />
                </div>
              </div>
            </div>

            {/* SECTION FEATURES - 03 CALENDAR */}
            <div
              ref={featuresSection3Ref}
              className="features-section"
              style={{
                backgroundColor: featuresBgColor,
              }}
            >
              <div className="features-bottom">
                <div
                  ref={featuresLeftNumber3Ref}
                  className="features-left-number"
                  style={{ color: featuresTextColor }}
                >
                  03
                </div>
                
                <div 
                  ref={hoverContainer3Ref}
                  className="hover-container"
                  onMouseEnter={handleCalendarHoverEnter}
                  onMouseLeave={handleCalendarHoverLeave}
                >
                  <div
                    ref={featuresRightText3Ref}
                    className="features-right-text"
                    style={{ color: featuresTextColor }}
                  >
                    Calendar
                  </div>
                  
                  <div ref={updateContainer3Ref} className="update-container">
                    <div className="update-number" style={{ color: featuresTextColor }}>
                      Schedule<sup>³</sup>
                    </div>
                  </div>
                  
                  <div 
                    ref={featuresArrow3Ref}
                    className="features-right-arrow"
                  >
                    {calendarHover ? (
                      <StraightLine size={50} />
                    ) : (
                      <NorthEastArrow size={50} />
                    )}
                  </div>
                  
                  <div ref={circleImages3Ref} className="circle-images-container">
                    <div
                      ref={circleImg1_3Ref}
                      className="circle-img"
                    >
                      <Image
                        src="/images/5.jpg"
                        alt="circle 1"
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <div
                      ref={circleImg2_3Ref}
                      className="circle-img"
                    >
                      <Image
                        src="/images/lkhh.jpg"
                        alt="circle 2"
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  </div>
                  
                  <div ref={featuresOverlay3Ref} className="features-overlay" />
                </div>
              </div>
            </div>

            {/* SECTION FEATURES - 04 BLOG */}
            <div
              ref={featuresSection4Ref}
              className="features-section"
              style={{
                backgroundColor: featuresBgColor,
              }}
            >
              <div className="features-bottom">
                <div
                  ref={featuresLeftNumber4Ref}
                  className="features-left-number"
                  style={{ color: featuresTextColor }}
                >
                  04
                </div>
                
                <div 
                  ref={hoverContainer4Ref}
                  className="hover-container"
                  onMouseEnter={handleBlogHoverEnter}
                  onMouseLeave={handleBlogHoverLeave}
                >
                  <div
                    ref={featuresRightText4Ref}
                    className="features-right-text"
                    style={{ color: featuresTextColor }}
                  >
                    Blog
                  </div>
                  
                  <div ref={updateContainer4Ref} className="update-container">
                    <div className="update-number" style={{ color: featuresTextColor }}>
                      Read<sup>⁴</sup>
                    </div>
                  </div>
                  
                  <div 
                    ref={featuresArrow4Ref}
                    className="features-right-arrow"
                  >
                    {blogHover ? (
                      <StraightLine size={50} />
                    ) : (
                      <NorthEastArrow size={50} />
                    )}
                  </div>
                  
                  <div ref={circleImages4Ref} className="circle-images-container">
                    <div
                      ref={circleImg1_4Ref}
                      className="circle-img"
                    >
                      <Image
                        src="/images/ai.jpg"
                        alt="circle 1"
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <div
                      ref={circleImg2_4Ref}
                      className="circle-img"
                    >
                      <Image
                        src="/images/5.jpg"
                        alt="circle 2"
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  </div>
                  
                  <div ref={featuresOverlay4Ref} className="features-overlay" />
                </div>
              </div>
            </div>

            {/* SECTION FEATURES - 05 DONATION */}
            <div
              ref={featuresSection5Ref}
              className="features-section"
              style={{
                backgroundColor: featuresBgColor,
              }}
            >
              <div className="features-bottom">
                <div
                  ref={featuresLeftNumber5Ref}
                  className="features-left-number"
                  style={{ color: featuresTextColor }}
                >
                  05
                </div>
                
                <div 
                  ref={hoverContainer5Ref}
                  className="hover-container"
                  onMouseEnter={handleDonationHoverEnter}
                  onMouseLeave={handleDonationHoverLeave}
                >
                  <div
                    ref={featuresRightText5Ref}
                    className="features-right-text"
                    style={{ color: featuresTextColor }}
                  >
                    Donation
                  </div>
                  
                  <div ref={updateContainer5Ref} className="update-container">
                    <div className="update-number" style={{ color: featuresTextColor }}>
                      Support<sup>⁵</sup>
                    </div>
                  </div>
                  
                  <div 
                    ref={featuresArrow5Ref}
                    className="features-right-arrow"
                  >
                    {donationHover ? (
                      <StraightLine size={50} />
                    ) : (
                      <NorthEastArrow size={50} />
                    )}
                  </div>
                  
                  <div ref={circleImages5Ref} className="circle-images-container">
                    <div
                      ref={circleImg1_5Ref}
                      className="circle-img"
                    >
                      <Image
                        src="/images/lkhh.jpg"
                        alt="circle 1"
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <div
                      ref={circleImg2_5Ref}
                      className="circle-img"
                    >
                      <Image
                        src="/images/ai.jpg"
                        alt="circle 2"
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  </div>
                  
                  <div ref={featuresOverlay5Ref} className="features-overlay" />
                </div>
              </div>
            </div>

            {/* SECTION TRUSTED COLLABS */}
            <div
              ref={trustedSectionRef}
              className="trusted-section"
              style={{
                backgroundColor: '#ffffff',
              }}
            >
              <div
                ref={trustedTextRef}
                className="trusted-text"
              >
                TRUSTED COLLABS
              </div>

              <div 
                ref={carouselRef}
                className="carousel-container"
              >
                <div className="carousel-track">
                  {carouselItems.map((item) => (
                    <div key={item.id} className="carousel-item">
                      <div className="carousel-image">
                        <Image
                          src={item.image}
                          alt={item.brand}
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                      <h3 className="carousel-brand">{item.brand}</h3>
                      <p className="carousel-desc">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bagian footer - hanya berisi teks MENURU besar tanpa background hitam */}
            <div style={{
              width: '100%',
              position: 'relative',
              backgroundColor: 'white',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              alignItems: 'center',
              minHeight: '60vh'
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

              {/* Hanya teks MENURU besar tanpa background hitam */}
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
                zIndex: 1,
                marginTop: '40px'
              }}>
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
                    marginRight: '0',
                    backgroundColor: 'transparent'
                  }}>
                  MENURU
                </span>
              </footer>
            </div>
          </div>
        </div>
      </div>

      {/* SHADOW PAGE - Halaman bayangan hitam dengan chat */}
      <div
        ref={shadowPageRef}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          backgroundColor: '#000000',
          zIndex: 9998,
          transform: 'translateY(100%)',
          pointerEvents: showShadowPage ? 'auto' : 'none',
        }}
      >
        {/* Konten Shadow Page - Let's Talk dan Chat */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '60px',
          boxSizing: 'border-box',
          fontFamily: 'Questrial, sans-serif'
        }}>
          {/* Teks "Let's Talk" dari kiri atas */}
          <div style={{
            position: 'absolute',
            top: '80px',
            left: '80px',
          }}>
            <h1 style={{
              fontSize: '80px',
              color: '#ffffff',
              fontFamily: 'Questrial, sans-serif',
              fontWeight: '400',
              letterSpacing: '-0.02em',
              margin: 0,
              animation: 'modalFadeIn 0.5s ease'
            }}>
              Let's Talk
            </h1>
            <div style={{
              width: '100px',
              height: '2px',
              backgroundColor: '#ffffff',
              marginTop: '20px',
              animation: 'modalFadeIn 0.6s ease'
            }} />
          </div>

          {/* Tombol Chat */}
          <button
            onClick={() => setShowChat(!showChat)}
            style={{
              position: 'absolute',
              bottom: '40px',
              right: '40px',
              padding: '16px 32px',
              backgroundColor: showChat ? '#ffffff' : 'transparent',
              color: showChat ? '#000000' : '#ffffff',
              border: showChat ? 'none' : '2px solid #ffffff',
              borderRadius: '60px',
              cursor: 'pointer',
              fontSize: '18px',
              fontWeight: '600',
              fontFamily: 'Questrial, sans-serif',
              transition: 'all 0.3s ease',
              zIndex: 101,
              backdropFilter: showChat ? 'none' : 'blur(10px)',
            }}
            onMouseEnter={(e) => {
              if (!showChat) {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.color = '#000000';
              }
            }}
            onMouseLeave={(e) => {
              if (!showChat) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#ffffff';
              }
            }}
          >
            {showChat ? 'Close Chat 💬' : 'Open Chat 💬'}
          </button>

          {/* Chat Component */}
          {showChat && (
            <div className="chat-container" style={{
              position: 'absolute',
              bottom: '100px',
              right: '40px',
            }}>
              <div className="chat-header" onClick={() => setShowChat(false)}>
                <div className="chat-title">
                  <span className="online-indicator"></span>
                  Live Chat Support
                </div>
                <div className="close-chat">×</div>
              </div>
              
              {!isUserNameSet ? (
                <div className="name-input-container">
                  <input
                    type="text"
                    placeholder="Enter your name..."
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="name-input"
                    onKeyPress={(e) => e.key === 'Enter' && handleSetUserName()}
                  />
                  <button onClick={handleSetUserName} className="set-name-button">
                    Start Chatting
                  </button>
                </div>
              ) : (
                <>
                  <div className="online-users">
                    <span>👥 Online ({onlineUsers.length}):</span>
                    {onlineUsers.map((user, idx) => (
                      <span key={idx} className="online-user">
                        {user.userName}
                        {user.isAdmin && <span className="admin-badge">Admin</span>}
                      </span>
                    ))}
                    <button onClick={handleLogout} className="logout-button">
                      Logout
                    </button>
                  </div>
                  
                  <div className="chat-messages" ref={chatMessagesRef}>
                    {messages.map((msg) => {
                      const isCurrentUser = msg.userId === user?.uid;
                      const isMessageAdmin = msg.isAdmin;
                      let messageClass = "message message-other";
                      if (isCurrentUser) messageClass = "message message-user";
                      else if (isMessageAdmin) messageClass = "message message-admin";
                      
                      // Group messages by date
                      const showDate = messages.findIndex(m => m.id === msg.id) === 0 || 
                        (messages[messages.findIndex(m => m.id === msg.id) - 1] && 
                         formatDate(messages[messages.findIndex(m => m.id === msg.id) - 1].timestamp) !== formatDate(msg.timestamp));
                      
                      return (
                        <div key={msg.id}>
                          {showDate && (
                            <div style={{
                              textAlign: 'center',
                              fontSize: '11px',
                              color: '#999',
                              margin: '10px 0',
                            }}>
                              {formatDate(msg.timestamp)}
                            </div>
                          )}
                          <div className={messageClass}>
                            <div className="message-bubble">
                              <div className="message-name">
                                {msg.userName}
                                {msg.isAdmin && " ⭐"}
                              </div>
                              <div className="message-text">{msg.text}</div>
                              <div className="message-time">{formatTime(msg.timestamp)}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="chat-input-area">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="chat-input"
                      ref={(input) => setChatInputRef(input)}
                    />
                    <button onClick={sendMessage} className="send-button">
                      Send
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
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
