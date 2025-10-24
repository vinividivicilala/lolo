'use client';

import SignInPage from '../components/auth/signin-page';
import SignUpPage from '../components/auth/signup-page';
import ForgotPasswordPage from '../components/auth/forgot-password-page';
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, onSnapshot, collection, getDocs } from "firebase/firestore";
import { signInAnonymously, getAuth } from "firebase/auth";

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCYbxo8n1zn-Y3heCIn_PmrsK44_OrdEw4",
  authDomain: "noted-a3498.firebaseapp.com",
  databaseURL: "https://noted-a3498-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "noted-a3498",
  storageBucket: "noted-a3498.firebasestorage.app",
  messagingSenderId: "1077214793842",
  appId: "1:1077214793842:web:a70cc3643eceb53e3932eb",
  measurementId: "G-SENDQS5Y7K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Data untuk Home dan Topics dengan gambar
const homeContent = [
  {
    id: 1,
    title: "Creative Design",
    description: "Innovative design solutions that transform ideas into visually stunning experiences",
    color: "#FF6B6B",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop",
    category: "Design"
  },
  {
    id: 2,
    title: "Digital Strategy",
    description: "Comprehensive digital strategies to elevate your brand in the online space",
    color: "#4ECDC4",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
    category: "Strategy"
  },
  {
    id: 3,
    title: "User Experience",
    description: "Creating seamless and intuitive user experiences that drive engagement",
    color: "#45B7D1",
    image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=300&fit=crop",
    category: "UX/UI"
  },
  {
    id: 4,
    title: "Brand Identity",
    description: "Developing unique brand identities that resonate with your target audience",
    color: "#96CEB4",
    image: "https://images.unsplash.com/photo-1567446537711-4302c76c2904?w=400&h=300&fit=crop",
    category: "Branding"
  },
  {
    id: 5,
    title: "Web Development",
    description: "Modern web development using cutting-edge technologies and best practices",
    color: "#FFEAA7",
    image: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=300&fit=crop",
    category: "Development"
  }
];

const topicsContent = [
  {
    id: 1,
    title: "Artificial Intelligence",
    description: "Exploring the future of AI and machine learning technologies",
    color: "#6C5CE7",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop",
    category: "Technology"
  },
  {
    id: 2,
    title: "Blockchain Technology",
    description: "Understanding decentralized systems and cryptocurrency innovations",
    color: "#FD79A8",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=300&fit=crop",
    category: "Technology"
  },
  {
    id: 3,
    title: "Sustainable Design",
    description: "Eco-friendly design principles for a better tomorrow",
    color: "#00B894",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=300&fit=crop",
    category: "Design"
  },
  {
    id: 4,
    title: "Mobile Development",
    description: "Creating powerful mobile applications for iOS and Android",
    color: "#FDCB6E",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop",
    category: "Development"
  },
  {
    id: 5,
    title: "Data Analytics",
    description: "Transforming raw data into actionable insights and intelligence",
    color: "#E17055",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
    category: "Analytics"
  },
  {
    id: 6,
    title: "Cloud Computing",
    description: "Leveraging cloud infrastructure for scalable solutions",
    color: "#74B9FF",
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=300&fit=crop",
    category: "Technology"
  },
  {
    id: 7,
    title: "Cybersecurity",
    description: "Protecting digital assets with advanced security measures",
    color: "#A29BFE",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=300&fit=crop",
    category: "Security"
  },
  {
    id: 8,
    title: "IoT Solutions",
    description: "Connecting devices and creating smart ecosystems",
    color: "#55E6C1",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
    category: "Technology"
  },
  {
    id: 9,
    title: "AR/VR Development",
    description: "Building immersive augmented and virtual reality experiences",
    color: "#FF7675",
    image: "https://images.unsplash.com/photo-1592478411213-6153e4ebc696?w=400&h=300&fit=crop",
    category: "Development"
  },
  {
    id: 10,
    title: "Quantum Computing",
    description: "Exploring the next frontier in computational power",
    color: "#BADCDD",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop",
    category: "Technology"
  }
];

export default function HomePage(): React.JSX.Element {
  const [showLoading, setShowLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isCloseHovered, setIsCloseHovered] = useState(false);
  const [menuText, setMenuText] = useState("MENU");
  const [isAnimating, setIsAnimating] = useState(false);
  const [visitorTime, setVisitorTime] = useState({
    time: "",
    timezone: "",
    date: ""
  });
  const [visitorLocation, setVisitorLocation] = useState({
    city: "",
    region: "",
    country: "Indonesia",
    isManual: false
  });
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [tempLocation, setTempLocation] = useState({ city: "", region: "" });
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [allUsersData, setAllUsersData] = useState<any[]>([]);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [isLoadingAllUsers, setIsLoadingAllUsers] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [isBannerHovered, setIsBannerHovered] = useState(false);
  
  // State untuk menu Home dan Topics
  const [activeSection, setActiveSection] = useState<"home" | "topics" | null>(null);
  const [showContent, setShowContent] = useState(false);
  
  // State untuk navbar dropdown
  const [showHomeDropdown, setShowHomeDropdown] = useState(false);
  const [showTopicsDropdown, setShowTopicsDropdown] = useState(false);
  
  // State untuk search
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchStatus, setSearchStatus] = useState<"empty" | "recent" | "updated" | "loading">("empty");

  // State untuk update label
  const [isUpdateBlinking, setIsUpdateBlinking] = useState(true);
  
  const router = useRouter();
  const timeRef = useRef<NodeJS.Timeout | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const textScrollRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  
  // Refs untuk search
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchStatusRef = useRef<HTMLDivElement>(null);
  
  // Refs untuk content
  const contentContainerRef = useRef<HTMLDivElement>(null);
  const contentItemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const horizontalScrollRef = useRef<HTMLDivElement>(null);
  
  // Refs untuk dropdown
  const homeDropdownRef = useRef<HTMLDivElement>(null);
  const topicsDropdownRef = useRef<HTMLDivElement>(null);

  // State untuk cookie consent
  const [showCookieConsent, setShowCookieConsent] = useState(false);
  const [cookiesAccepted, setCookiesAccepted] = useState(false);
  const [userIP, setUserIP] = useState("");
  const [isCollectingData, setIsCollectingData] = useState(false);
  const [networkType, setNetworkType] = useState("");

  // PERBAIKAN: Sistem z-index terorganisir - FIXED
  const zIndexes = {
    base: 10,        // Element biasa
    navbar: 50,      // Semua elemen navbar
    banner: 100,     // Banner
    dropdown: 150,   // Dropdown navbar
    search: 200,     // Search overlay
    content: 250,    // Content overlay
    menu: 1000,      // Menu overlay - HARUS PALING TINGGI
    modal: 1100,     // Modal
    loading: 1200    // Loading screen
  };

  // Database kota-kota Indonesia
  const indonesiaCities = [
    { city: "Jakarta", region: "DKI Jakarta" },
    { city: "Surabaya", region: "Jawa Timur" },
    { city: "Bandung", region: "Jawa Barat" },
    { city: "Medan", region: "Sumatera Utara" },
    { city: "Semarang", region: "Jawa Tengah" },
    { city: "Makassar", region: "Sulawesi Selatan" },
    { city: "Palembang", region: "Sumatera Selatan" },
    { city: "Denpasar", region: "Bali" },
    { city: "Batam", region: "Kepulauan Riau" },
    { city: "Pekanbaru", region: "Riau" },
    { city: "Bandar Lampung", region: "Lampung" },
    { city: "Padang", region: "Sumatera Barat" },
    { city: "Malang", region: "Jawa Timur" },
    { city: "Samarinda", region: "Kalimantan Timur" },
    { city: "Banjarmasin", region: "Kalimantan Selatan" },
    { city: "Serang", region: "Banten" },
    { city: "Jambi", region: "Jambi" },
    { city: "Pontianak", region: "Kalimantan Barat" },
    { city: "Manado", region: "Sulawesi Utara" },
    { city: "Cirebon", region: "Jawa Barat" },
    { city: "Balikpapan", region: "Kalimantan Timur" },
    { city: "Bogor", region: "Jawa Barat" },
    { city: "Yogyakarta", region: "DI Yogyakarta" },
    { city: "Tangerang", region: "Banten" },
    { city: "Bekasi", region: "Jawa Barat" },
    { city: "Sukabumi", region: "Jawa Barat" },
    { city: "Tasikmalaya", region: "Jawa Barat" },
    { city: "Pekalongan", region: "Jawa Tengah" },
    { city: "Depok", region: "Jawa Barat" },
    { city: "Cimahi", region: "Jawa Barat" },
    { city: "Palu", region: "Sulawesi Tengah" },
    { city: "Kupang", region: "Nusa Tenggara Timur" },
    { city: "Binjai", region: "Sumatera Utara" },
    { city: "Mataram", region: "Nusa Tenggara Barat" },
    { city: "Banda Aceh", region: "Aceh" },
    { city: "Jayapura", region: "Papua" },
    { city: "Singkawang", region: "Kalimantan Barat" },
    { city: "Tegal", region: "Jawa Tengah" },
    { city: "Kediri", region: "Jawa Timur" },
    { city: "Blitar", region: "Jawa Timur" },
    { city: "Madiun", region: "Jawa Timur" },
    { city: "Pasuruan", region: "Jawa Timur" },
    { city: "Magelang", region: "Jawa Tengah" },
    { city: "Probolinggo", region: "Jawa Timur" },
    { city: "Salatiga", region: "Jawa Tengah" },
    { city: "Bitung", region: "Sulawesi Utara" },
    { city: "Tanjung Pinang", region: "Kepulauan Riau" },
    { city: "Ternate", region: "Maluku Utara" },
    { city: "Bontang", region: "Kalimantan Timur" },
    { city: "Bau-bau", region: "Sulawesi Tenggara" },
    { city: "Tidore", region: "Maluku Utara" },
    { city: "Gorontalo", region: "Gorontalo" },
    { city: "Prabumulih", region: "Sumatera Selatan" },
    { city: "Lubuklinggau", region: "Sumatera Selatan" },
    { city: "Pageralam", region: "Sumatera Selatan" },
    { city: "Pagaralam", region: "Sumatera Selatan" },
    { city: "Sawahlunto", region: "Sumatera Barat" },
    { city: "Solok", region: "Sumatera Barat" },
    { city: "Payakumbuh", region: "Sumatera Barat" },
    { city: "Bukittinggi", region: "Sumatera Barat" },
    { city: "Pariaman", region: "Sumatera Barat" },
    { city: "Padang Panjang", region: "Sumatera Barat" },
    { city: "Sibolga", region: "Sumatera Utara" },
    { city: "Tanjungbalai", region: "Sumatera Utara" },
    { city: "Pematangsiantar", region: "Sumatera Utara" },
    { city: "Tebing Tinggi", region: "Sumatera Utara" },
    { city: "Kisaran", region: "Sumatera Utara" },
    { city: "Gunungsitoli", region: "Sumatera Utara" },
    { city: "Padangsidempuan", region: "Sumatera Utara" },
    { city: "Sungai Penuh", region: "Jambi" },
    { city: "Jambi", region: "Jambi" },
    { city: "Bengkulu", region: "Bengkulu" },
    { city: "Curup", region: "Bengkulu" },
    { city: "Manna", region: "Bengkulu" },
    { city: "Argamakmur", region: "Bengkulu" },
    { city: "Muko-muko", region: "Bengkulu" },
    { city: "Kaur", region: "Bengkulu" },
    { city: "Kepahiang", region: "Bengkulu" },
    { city: "Lebong", region: "Bengkulu" },
    { city: "Seluma", region: "Bengkulu" },
    { city: "Lahat", region: "Sumatera Selatan" },
    { city: "Lubuk Linggau", region: "Sumatera Selatan" },
    { city: "Pagar Alam", region: "Sumatera Selatan" },
    { city: "Prabumulih", region: "Sumatera Selatan" },
    { city: "Muara Enim", region: "Sumatera Selatan" },
    { city: "Banyuasin", region: "Sumatera Selatan" },
    { city: "Ogan Komering Ilir", region: "Sumatera Selatan" },
    { city: "Ogan Komering Ulu", region: "Sumatera Selatan" },
    { city: "Empat Lawang", region: "Sumatera Selatan" },
    { city: "Musi Rawas", region: "Sumatera Selatan" },
    { city: "Musi Banyuasin", region: "Sumatera Selatan" },
    { city: "Bangka", region: "Kepulauan Bangka Belitung" },
    { city: "Belitung", region: "Kepulauan Bangka Belitung" },
    { city: "Pangkal Pinang", region: "Kepulauan Bangka Belitung" },
    { city: "Sungai Liat", region: "Kepulauan Bangka Belitung" },
    { city: "Tanjung Pandan", region: "Kepulauan Bangka Belitung" },
    { city: "Manggar", region: "Kepulauan Bangka Belitung" },
    { city: "Koba", region: "Kepulauan Bangka Belitung" },
    { city: "Tempuran", region: "Jawa Barat" }
  ];

 
 
 
 
 
 // Data untuk dropdown Home dengan label UPDATE dan blink
const homeDropdownItems = [
  {
    title: "Home Overview",
    description: "Welcome to your personal dashboard",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    )
  },
  {
    title: "Dashboard",
    description: "Your main control center",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7"/>
        <rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/>
      </svg>
    )
  }
];

// Data untuk dropdown Topics dengan label UPDATE dan blink
const topicsDropdownItems = [
  {
    title: "Technology",
    description: "Latest tech trends and innovations",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
    )
  },
  {
    title: "Design",
    description: "Creative design and UI/UX resources",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
        <line x1="7" y1="7" x2="7.01" y2="7"/>
      </svg>
    )
  },
  {
    title: "Business",
    description: "Business strategies and insights",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
    )
  }
];

 
 
 
 

  
  
  
  
  // Effect untuk blink update label
useEffect(() => {
  const blinkInterval = setInterval(() => {
    setIsUpdateBlinking(prev => !prev);
  }, 800);

  return () => clearInterval(blinkInterval);
}, []);

// Setup GSAP ScrollTrigger untuk horizontal scroll
useEffect(() => {
  if (showContent && horizontalScrollRef.current) {
    const sections = gsap.utils.toArray('.scroll-section');
    const container = horizontalScrollRef.current;

    // Kill existing ScrollTriggers to avoid conflicts
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());

    gsap.to(sections, {
      xPercent: -100 * (sections.length - 1),
      ease: "none",
      scrollTrigger: {
        trigger: container,
        pin: true,
        scrub: 1,
        snap: 1 / (sections.length - 1),
        end: () => "+=" + (container.offsetWidth * (sections.length - 1)),
        invalidateOnRefresh: true
      }
    });

    // Add GSAP animations for content items
    gsap.utils.toArray('.content-item').forEach((item: any, index) => {
      gsap.fromTo(item, 
        {
          opacity: 0,
          x: 100,
          scale: 0.9
        },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.8,
          delay: index * 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: item,
            containerAnimation: ScrollTrigger.getById("horizontal-scroll"),
            start: "left 80%",
            end: "right 20%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });
  }

  return () => {
    // Cleanup ScrollTriggers when component unmounts or content closes
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  };
}, [showContent, activeSection]);
  
  

  
  
  
  
  
  
  
  
  

  // Fungsi untuk mendeteksi tipe koneksi
  const detectNetworkType = () => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      if ('connection' in navigator) {
        const conn = (navigator as any).connection;
        if (conn) {
          const type = conn.type || 'unknown';
          if (type === 'wifi') return 'WiFi Mobile';
          if (type === 'cellular') return 'Mobile Data';
          return type;
        }
      }
      return 'Mobile Device';
    } else {
      return 'WiFi/LAN Desktop';
    }
  };

  // Fungsi untuk mendapatkan IP real melalui WebRTC
  const getRealIPFromWebRTC = (): Promise<string> => {
    return new Promise((resolve) => {
      const RTCPeerConnection = (window as any).RTCPeerConnection || 
                               (window as any).mozRTCPeerConnection || 
                               (window as any).webkitRTCPeerConnection;
      
      if (!RTCPeerConnection) {
        resolve("unknown");
        return;
      }

      try {
        const pc = new RTCPeerConnection({ iceServers: [] });
        pc.createDataChannel("");
        
        pc.createOffer()
          .then(offer => pc.setLocalDescription(offer))
          .catch(() => resolve("unknown"));

        let foundIP = false;
        
        pc.onicecandidate = (ice) => {
          if (!ice || !ice.candidate || !ice.candidate.candidate) {
            if (!foundIP) resolve("unknown");
            return;
          }

          const candidate = ice.candidate.candidate;
          const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/;
          const ipMatch = candidate.match(ipRegex);
          
          if (ipMatch) {
            const ip = ipMatch[1];
            foundIP = true;
            if (!ip.match(/^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|169\.254\.|127\.|::1|fe80::)/)) {
              resolve(ip);
            } else {
              resolve(ip);
            }
          }
        };

        setTimeout(() => {
          if (!foundIP) resolve("unknown");
        }, 3000);

      } catch (error) {
        resolve("unknown");
      }
    });
  };

  // Fungsi untuk mendapatkan info koneksi lengkap
  const getConnectionInfo = () => {
    const info = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      languages: navigator.languages,
      cookieEnabled: navigator.cookieEnabled,
      deviceMemory: (navigator as any).deviceMemory || 'unknown',
      hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
      screen: `${window.screen.width}x${window.screen.height}`,
      colorDepth: window.screen.colorDepth,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      networkType: detectNetworkType()
    };
    
    return info;
  };

  // Fungsi untuk check cookie consent dari Firebase
  const checkCookieConsentFromFirebase = async (userId: string) => {
    try {
      const userDocRef = doc(db, 'userConsents', userId);
      const userSnapshot = await getDoc(userDocRef);
      
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        if (userData.cookieConsent === 'accepted') {
          setCookiesAccepted(true);
          setShowCookieConsent(false);
          return true;
        } else if (userData.cookieConsent === 'declined') {
          setCookiesAccepted(false);
          setShowCookieConsent(false);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error checking cookie consent from Firebase:', error);
      return false;
    }
  };

  // Fungsi untuk save cookie consent ke Firebase
  const saveCookieConsentToFirebase = async (userId: string, consent: string, ipAddress: string, connectionInfo: any) => {
    try {
      const userDocRef = doc(db, 'userConsents', userId);
      await setDoc(userDocRef, {
        cookieConsent: consent,
        ipAddress: ipAddress,
        connectionInfo: connectionInfo,
        timestamp: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      }, { merge: true });
      
      console.log('Cookie consent saved to Firebase');
      return true;
    } catch (error) {
      console.error('Error saving cookie consent to Firebase:', error);
      return false;
    }
  };

  // Fungsi untuk collect user data setelah consent
  const collectUserData = async (userId: string, ipAddress: string) => {
    try {
      setIsCollectingData(true);
      
      const connectionInfo = getConnectionInfo();
      
      // Simpan data analytics ke Firebase
      const analyticsDocRef = doc(db, 'userAnalytics', userId);
      await setDoc(analyticsDocRef, {
        ipAddress: ipAddress,
        connectionInfo: connectionInfo,
        timestamp: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      }, { merge: true });
      
      console.log('User analytics data collected');
    } catch (error) {
      console.error('Error collecting user data:', error);
    } finally {
      setIsCollectingData(false);
    }
  };

  // Effect untuk initialize user dan cookie consent
  useEffect(() => {
    const initializeUserAndConsent = async () => {
      try {
        // Sign in anonymously ke Firebase Auth
        const userCredential = await signInAnonymously(auth);
        const user = userCredential.user;
        
        setCurrentUserId(user.uid);
        
        // Deteksi tipe jaringan
        const network = detectNetworkType();
        setNetworkType(network);
        
        // Get real IP address dari WebRTC
        const ip = await getRealIPFromWebRTC();
        setUserIP(ip);
        
        console.log('Network detected:', network);
        console.log('IP detected:', ip);
        
        // Check cookie consent dari Firebase
        const hasConsent = await checkCookieConsentFromFirebase(user.uid);
        
        if (!hasConsent) {
          // Tampilkan banner cookie setelah loading selesai
          setTimeout(() => {
            setShowCookieConsent(true);
          }, 2000);
        } else if (cookiesAccepted) {
          // Jika sudah accept, collect data
          await collectUserData(user.uid, ip);
        }
        
      } catch (error) {
        console.error('Error initializing user:', error);
      }
    };

    initializeUserAndConsent();
  }, []);

  // Fungsi untuk handle cookie acceptance
  const handleAcceptCookies = async () => {
    if (!currentUserId) return;
    
    try {
      const connectionInfo = getConnectionInfo();
      
      // Save consent ke Firebase
      const success = await saveCookieConsentToFirebase(currentUserId, 'accepted', userIP, connectionInfo);
      
      if (success) {
        setCookiesAccepted(true);
        setShowCookieConsent(false);
        
        // Collect user data setelah consent
        await collectUserData(currentUserId, userIP);
        
        console.log('Cookies accepted - user data collected');
      }
    } catch (error) {
      console.error('Error accepting cookies:', error);
    }
  };

  // Fungsi untuk handle decline cookies
  const handleDeclineCookies = async () => {
    if (!currentUserId) return;
    
    try {
      const connectionInfo = getConnectionInfo();
      
      // Save decline consent ke Firebase
      const success = await saveCookieConsentToFirebase(currentUserId, 'declined', userIP || 'unknown', connectionInfo);
      
      if (success) {
        setCookiesAccepted(false);
        setShowCookieConsent(false);
        console.log('Cookies declined');
      }
    } catch (error) {
      console.error('Error declining cookies:', error);
    }
  };

  // Animasi banner dengan GSAP
  useEffect(() => {
    if (showBanner && bannerRef.current) {
      const tl = gsap.timeline();
      
      tl.fromTo(bannerRef.current,
        { 
          y: -100,
          opacity: 0
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "easeOut"
        }
      );
    }
  }, [showBanner]);

  // Effect untuk menutup dropdown ketika klik di luar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (homeDropdownRef.current && !homeDropdownRef.current.contains(event.target as Node)) {
        setShowHomeDropdown(false);
      }
      if (topicsDropdownRef.current && !topicsDropdownRef.current.contains(event.target as Node)) {
        setShowTopicsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fungsi untuk close banner
  const closeBanner = () => {
    if (bannerRef.current) {
      gsap.to(bannerRef.current, {
        y: -100,
        opacity: 0,
        duration: 0.6,
        ease: "back.in(1.7)",
        onComplete: () => setShowBanner(false)
      });
    }
  };

  // Fungsi untuk handle click banner (ke halaman notes)
  const handleBannerClick = () => {
    navigateToNotes();
  };

  // Load location dari Firestore
  const loadLocationFromFirestore = async (userId: string) => {
    try {
      setIsLoadingLocation(true);
      const userDocRef = doc(db, 'userLocations', userId);
      const userSnapshot = await getDoc(userDocRef);
      
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        setVisitorLocation({
          city: userData.city,
          region: userData.region,
          country: userData.country || "Indonesia",
          isManual: true
        });
      } else {
        // Jika tidak ada data di Firestore, coba deteksi otomatis
        tryAutoLocation(userId);
      }
    } catch (error) {
      console.error('Error loading location from Firestore:', error);
      // Fallback ke deteksi otomatis
      tryAutoLocation(userId);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Save location ke Firestore
  const saveLocationToFirestore = async (userId: string, location: any) => {
    try {
      const userDocRef = doc(db, 'userLocations', userId);
      await setDoc(userDocRef, {
        city: location.city,
        region: location.region,
        country: location.country || "Indonesia",
        lastUpdated: new Date().toISOString(),
        userId: userId
      }, { merge: true });
      
      console.log('Location saved to Firestore successfully');
      return true;
    } catch (error) {
      console.error('Error saving location to Firestore:', error);
      return false;
    }
  };

  // Coba deteksi lokasi otomatis sederhana
  const tryAutoLocation = async (userId: string) => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    const timezoneMap: { [key: string]: { city: string, region: string } } = {
      'Asia/Jakarta': { city: "Jakarta", region: "DKI Jakarta" },
      'Asia/Makassar': { city: "Makassar", region: "Sulawesi Selatan" },
      'Asia/Jayapura': { city: "Jayapura", region: "Papua" },
      'Asia/Pontianak': { city: "Pontianak", region: "Kalimantan Barat" }
    };

    const detectedLocation = timezoneMap[timezone];
    
    if (detectedLocation) {
      const location = {
        ...detectedLocation,
        country: "Indonesia",
        isManual: false
      };
      setVisitorLocation(location);
      // Simpan ke Firestore juga
      await saveLocationToFirestore(userId, location);
    } else {
      // Default location
      const defaultLocation = {
        city: "Jakarta",
        region: "DKI Jakarta",
        country: "Indonesia",
        isManual: false
      };
      setVisitorLocation(defaultLocation);
      await saveLocationToFirestore(userId, defaultLocation);
    }
  };

  // Fungsi untuk mengambil semua data user
  const fetchAllUsersData = async () => {
    try {
      setIsLoadingAllUsers(true);
      const usersCollection = collection(db, 'userLocations');
      const usersSnapshot = await getDocs(usersCollection);
      
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Urutkan berdasarkan lastUpdated (terbaru pertama)
      usersData.sort((a: any, b: any) => {
        const dateA = a.lastUpdated ? new Date(a.lastUpdated).getTime() : 0;
        const dateB = b.lastUpdated ? new Date(b.lastUpdated).getTime() : 0;
        return dateB - dateA;
      });
      
      setAllUsersData(usersData);
      setShowAllUsers(true);
    } catch (error) {
      console.error('Error fetching all users data:', error);
      alert('Gagal mengambil data users. Silakan coba lagi.');
    } finally {
      setIsLoadingAllUsers(false);
    }
  };

  // Fungsi untuk membuka modal semua users
  const openAllUsersModal = () => {
    fetchAllUsersData();
  };

  // Fungsi untuk toggle search
  const toggleSearch = () => {
    if (showSearch) {
      closeSearch();
    } else {
      openSearch();
    }
  };

  // Fungsi untuk membuka search dengan animasi GSAP
  const openSearch = () => {
    setShowSearch(true);
    
    // Reset status search
    setSearchStatus("empty");
    setSearchQuery("");
    
    setTimeout(() => {
      if (searchContainerRef.current && searchInputRef.current) {
        const tl = gsap.timeline();
        
        // Animasi container search
        tl.fromTo(searchContainerRef.current,
          {
            scale: 0.8,
            opacity: 0,
            y: -20
          },
          {
            scale: 1,
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "easeOut"
          }
        );
        
        // Animasi input field
        tl.fromTo(searchInputRef.current,
          {
            width: "0%",
            opacity: 0
          },
          {
            width: "100%",
            opacity: 1,
            duration: 0.4,
            ease: "power2.out"
          },
          "-=0.2"
        );
        
        // Focus ke input setelah animasi
        setTimeout(() => {
          if (searchInputRef.current) {
            searchInputRef.current.focus();
          }
        }, 300);
      }
    }, 10);
  };

  // Fungsi untuk menutup search dengan animasi GSAP
  const closeSearch = () => {
    if (searchContainerRef.current) {
      const tl = gsap.timeline();
      
      tl.to(searchContainerRef.current, {
        scale: 0.8,
        opacity: 0,
        y: -20,
        duration: 0.3,
        ease: "back.in(1.7)",
        onComplete: () => setShowSearch(false)
      });
    } else {
      setShowSearch(false);
    }
  };

  // Fungsi untuk handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Update search status berdasarkan input
    if (value.length === 0) {
      setSearchStatus("empty");
    } else if (value.length > 0 && value.length < 3) {
      setSearchStatus("loading");
      
      // Simulasi loading
      setTimeout(() => {
        if (searchQuery === value) {
          setSearchStatus("recent");
        }
      }, 500);
    } else {
      setSearchStatus("updated");
    }
  };

  // Fungsi untuk handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Logic untuk search bisa ditambahkan di sini
      console.log("Search for:", searchQuery);
      
      // Tampilkan status updated
      setSearchStatus("updated");
      
      // Close search setelah submit (opsional)
      setTimeout(() => {
        closeSearch();
      }, 1000);
    }
  };

  // Effect untuk keyboard shortcut (Ctrl+K atau Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        toggleSearch();
      }
      
      if (e.key === 'Escape' && showSearch) {
        closeSearch();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showSearch]);

  // Effect untuk animasi status search
  useEffect(() => {
    if (searchStatusRef.current) {
      const tl = gsap.timeline();
      
      tl.fromTo(searchStatusRef.current,
        {
          y: 10,
          opacity: 0
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.3,
          ease: "power2.out"
        }
      );
    }
  }, [searchStatus]);

  // Fungsi untuk toggle dropdown
  const toggleHomeDropdown = () => {
    setShowHomeDropdown(!showHomeDropdown);
    setShowTopicsDropdown(false);
  };

  const toggleTopicsDropdown = () => {
    setShowTopicsDropdown(!showTopicsDropdown);
    setShowHomeDropdown(false);
  };

  // Fungsi untuk membuka section Home atau Topics dengan animasi GSAP
  const openSection = (section: "home" | "topics") => {
    setActiveSection(section);
    setShowContent(true);
    
    // Tutup menu
    setShowMenu(false);
    
    // Animasi GSAP untuk content
    setTimeout(() => {
      if (contentContainerRef.current) {
        const tl = gsap.timeline();
        
        // Animasi container
        tl.fromTo(contentContainerRef.current,
          {
            scale: 0.9,
            opacity: 0,
            y: 50
          },
          {
            scale: 1,
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "easeOut"
          }
        );
      }
    }, 100);
  };

  // Fungsi untuk menutup content dengan animasi GSAP
  const closeContent = () => {
    // Kill all ScrollTriggers when closing content
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());

    if (contentContainerRef.current) {
      const tl = gsap.timeline();
      
      tl.to(contentContainerRef.current, {
        scale: 0.9,
        opacity: 0,
        y: 50,
        duration: 0.4,
        ease: "back.in(1.7)",
        onComplete: () => {
          setShowContent(false);
          setActiveSection(null);
        }
      });
    } else {
      setShowContent(false);
      setActiveSection(null);
    }
  };

  useEffect(() => {
    if (showLoading) {
      startTextScrollAnimation();
    }

    // Initialize visitor time
    updateVisitorTime();
    
    // Update time every second
    timeRef.current = setInterval(updateVisitorTime, 1000);

    return () => {
      if (timeRef.current) {
        clearInterval(timeRef.current);
      }
    };
  }, [showLoading]);

  const startTextScrollAnimation = () => {
    const tl = gsap.timeline();
    
    tl.fromTo(loadingRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.3, ease: "power2.out" }
    );

    if (textScrollRef.current) {
      const textLines = textScrollRef.current.children;
      const textArray = Array.from(textLines);
      
      gsap.set(textArray, { y: -1000, opacity: 0, scale: 1 });

      tl.to(textArray[0], { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" }, "+=0.1");
      tl.to(textArray[0], { y: 1000, opacity: 0, duration: 0.3, ease: "power2.in" }, "+=0.1");
      tl.to(textArray[1], { y: 0, opacity: 1, duration: 0.35, ease: "power2.out" }, "-=0.2");
      tl.to(textArray[1], { y: 1000, opacity: 0, duration: 0.25, ease: "power2.in" }, "+=0.1");
      tl.to(textArray[2], { y: 0, opacity: 1, duration: 0.3, ease: "power2.out" }, "-=0.15");
      tl.to(textArray[2], { y: 1000, opacity: 0, duration: 0.2, ease: "power2.in" }, "+=0.1");
      tl.to(textArray[3], { y: 0, opacity: 1, duration: 0.25, ease: "power2.out" }, "-=0.1");
      tl.to(textArray[3], { y: 1000, opacity: 0, duration: 0.15, ease: "power2.in" }, "+=0.1");
      tl.to(textArray[4], { y: 0, opacity: 1, duration: 0.2, ease: "power2.out" }, "-=0.05");
      tl.to(textArray[4], { y: 1000, opacity: 0, duration: 0.1, ease: "power2.in" }, "+=0.1");
     tl.to(textArray[5], { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: "easeOut" }, "+=0.2");
      tl.to(textArray[5], { scale: 1.1, duration: 0.3, ease: "power2.out" }, "+=0.5");
      tl.to(textArray[5], { scale: 1, duration: 0.2, ease: "power2.in" });
    }

    tl.to({}, {
      duration: 1,
      onComplete: () => {
        gsap.to(loadingRef.current, {
          opacity: 0,
          duration: 0.5,
          ease: "power2.inOut",
          onComplete: () => setShowLoading(false)
        });
      }
    });
  };

  const updateVisitorTime = () => {
    const now = new Date();
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    const time = now.toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const date = now.toLocaleDateString('en-US', {
      timeZone: timezone,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const timezoneAbbr = getTimezoneAbbreviation(timezone);

    setVisitorTime({
      time: time,
      timezone: timezoneAbbr,
      date: date
    });
  };

  const getTimezoneAbbreviation = (timezone: string): string => {
    const timezoneMap: { [key: string]: string } = {
      'Asia/Jakarta': 'WIB',
      'Asia/Makassar': 'WITA', 
      'Asia/Jayapura': 'WIT'
    };
    return timezoneMap[timezone] || 'LOCAL';
  };

  const navigateToNotes = () => {
    setShowLoading(true);
    setTimeout(() => {
      router.push('/notes');
    }, 1000);
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  // Fungsi untuk membuka modal set lokasi
  const openLocationModal = () => {
    setTempLocation({
      city: visitorLocation.city,
      region: visitorLocation.region
    });
    setShowLocationModal(true);
  };

  // Fungsi untuk menyimpan lokasi manual
  const saveManualLocation = async () => {
    if (tempLocation.city && tempLocation.region && currentUserId) {
      const newLocation = {
        ...tempLocation,
        country: "Indonesia",
        isManual: true
      };
      
      setVisitorLocation(newLocation);
      
      // Simpan ke Firestore
      const success = await saveLocationToFirestore(currentUserId, newLocation);
      
      if (success) {
        setShowLocationModal(false);
      } else {
        alert('Gagal menyimpan lokasi. Silakan coba lagi.');
      }
    }
  };

  // Filter kota berdasarkan input
  const filteredCities = indonesiaCities.filter(city =>
    city.city.toLowerCase().includes(tempLocation.city.toLowerCase()) ||
    city.region.toLowerCase().includes(tempLocation.city.toLowerCase())
  );

  // Array teks menu yang akan berganti saat hover
  const menuTextVariants = ["EXPLORE", "NAVIGATE", "DISCOVER", "BROWSE"];

  const handleMenuHover = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    let currentIndex = 0;

    const animateText = () => {
      if (currentIndex < menuTextVariants.length) {
        setMenuText(menuTextVariants[currentIndex]);
        currentIndex++;
        animationRef.current = setTimeout(animateText, 100);
      } else {
        setTimeout(() => {
          setMenuText("MENU");
          setIsAnimating(false);
        }, 100);
      }
    };

    animateText();
  };

  const handleMenuLeave = () => {
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
    setIsAnimating(false);
    setMenuText("MENU");
  };

  // Variants for modern animations
  const menuVariants = {
    closed: {
      clipPath: "circle(0% at 95% 5%)",
      transition: {
        duration: 0.8,
        ease: [0.76, 0, 0.24, 1]
      }
    },
    open: {
      clipPath: "circle(150% at 95% 5%)",
      transition: {
        duration: 0.8,
        ease: [0.76, 0, 0.24, 1]
      }
    }
  };

  const menuItemVariants = {
    closed: {
      x: -50,
      opacity: 0,
      transition: {
        duration: 0.5
      }
    },
    open: (i: number) => ({
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        delay: 0.1 + (i * 0.1),
        ease: "circOut"
      }
    })
  };

  const closeButtonVariants = {
    closed: {
      opacity: 0,
      rotate: -90,
      scale: 0
    },
    open: {
      opacity: 1,
      rotate: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        delay: 0.4,
        ease: "backOut"
      }
    }
  };

  const menuButtonVariants = {
    initial: {
      opacity: 0,
      y: -20
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay: 1.2,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.05,
      color: "#CCFF00",
      transition: {
        duration: 0.3
      }
    },
    tap: {
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    }
  };

  // Variants untuk animasi teks menu
  const textVariants = {
    enter: {
      y: -10,
      opacity: 0,
      transition: {
        duration: 0.1
      }
    },
    center: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.1
      }
    },
    exit: {
      y: 10,
      opacity: 0,
      transition: {
        duration: 0.1
      }
    }
  };

  // Variants untuk animasi waktu
  const timeVariants = {
    hidden: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.6
      }
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const menuItems = [
    { 
      name: "(01) HOME", 
      delay: 0.1,
      action: () => openSection("home")
    },
    { 
      name: "(02) TOPICS", 
      delay: 0.2,
      action: () => openSection("topics")
    },
    { 
      name: "(03) NOTES", 
      delay: 0.3,
      action: navigateToNotes
    },
    { 
      name: "(04) ABOUT", 
      delay: 0.4,
      action: () => console.log("About clicked")
    },
    { 
      name: "(05) CONTACT", 
      delay: 0.5,
      action: () => console.log("Contact clicked")
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'black',
      margin: 0,
      padding: 0,
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Arame Mono, monospace',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale'
    }}>
      
      {/* Search Component */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            ref={searchContainerRef}
            style={{
              position: 'fixed',
              top: '20%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%',
              maxWidth: '600px',
              backgroundColor: 'rgba(0, 0, 0, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '2rem',
              zIndex: zIndexes.search,
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(10px)'
            }}
            initial={{ scale: 0.8, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {/* Search Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{
                color: 'white',
                fontSize: '1.2rem',
                fontWeight: '600',
                margin: 0,
                fontFamily: 'Arame Mono, monospace'
              }}>
                Search
              </h3>
              
              {/* Close Button */}
              <motion.button
                onClick={closeSearch}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.6)',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                whileHover={{
                  color: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.button>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearchSubmit} style={{ marginBottom: '1rem' }}>
              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}>
                {/* Search Icon */}
                <motion.div
                  style={{
                    position: 'absolute',
                    left: '12px',
                    color: 'rgba(255,255,255,0.4)'
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" 
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </motion.div>

                {/* Search Input */}
                <motion.input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search for anything..."
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 40px',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '1rem',
                    fontFamily: 'Arame Mono, monospace',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  whileFocus={{
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.3)'
                  }}
                />

                {/* Keyboard Shortcut Hint */}
                <motion.div
                  style={{
                    position: 'absolute',
                    right: '12px',
                    color: 'rgba(255,255,255,0.3)',
                    fontSize: '0.75rem',
                    border: '1px solid rgba(255,255,255,0.1)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontFamily: 'Arame Mono, monospace'
                  }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  ⌘K
                </motion.div>
              </div>
            </form>

            {/* Search Status */}
            <AnimatePresence mode="wait">
              <motion.div
                ref={searchStatusRef}
                key={searchStatus}
                style={{
                  padding: '0.75rem',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontFamily: 'Arame Mono, monospace'
                }}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Status Icon */}
                {searchStatus === "empty" && (
                  <>
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" 
                          stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </motion.div>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>
                      Type to start searching...
                    </span>
                  </>
                )}
                
                {searchStatus === "loading" && (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2V6M12 18V22M6 12H2M22 12H18M19.07 4.93L16.24 7.76M7.76 16.24L4.93 19.07M19.07 19.07L16.24 16.24M7.76 7.76L4.93 4.93" 
                          stroke="#CCFF00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </motion.div>
                    <span style={{ color: '#CCFF00' }}>
                      Searching...
                    </span>
                  </>
                )}
                
                {searchStatus === "recent" && (
                  <>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 8V12L14 14M20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12Z" 
                          stroke="#CCFF00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </motion.div>
                    <span style={{ color: '#CCFF00' }}>
                      Showing recent results...
                    </span>
                  </>
                )}
                
                {searchStatus === "updated" && (
                  <>
                    <motion.div
                      animate={{ 
                        scale: [1, 1.3, 1],
                        color: ['#CCFF00', '#88FF00', '#CCFF00']
                      }}
                      transition={{ duration: 0.6 }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </motion.div>
                    <span style={{ color: '#88FF00' }}>
                      Results updated successfully!
                    </span>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Search Tips */}
            <motion.div
              style={{
                marginTop: '1rem',
                padding: '1rem',
                backgroundColor: 'rgba(255,255,255,0.02)',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.05)'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <div style={{
                color: 'rgba(255,255,255,0.4)',
                fontSize: '0.8rem',
                fontFamily: 'Arame Mono, monospace'
              }}>
                <div style={{ marginBottom: '0.5rem', fontWeight: '500' }}>Quick tips:</div>
                <div>• Press <span style={{ color: 'rgba(255,255,255,0.6)' }}>⌘K</span> to open search anytime</div>
                <div>• Use <span style={{ color: 'rgba(255,255,255,0.6)' }}>ESC</span> to close</div>
                <div>• Type at least 3 characters for better results</div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

     
	 
	 
	 
	 
	 
	 
	 
	 // Content Overlay untuk Home dan Topics dengan Horizontal Scroll GSAP
<AnimatePresence>
  {showContent && (
    <motion.div
      ref={contentContainerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.98)',
        zIndex: zIndexes.content,
        overflow: 'hidden'
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Header */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        padding: '2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: zIndexes.content + 1,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, transparent 100%)'
      }}>
        <h2 style={{
          color: 'white',
          fontSize: '2.5rem',
          fontWeight: '600',
          margin: 0,
          fontFamily: 'Arame Mono, monospace'
        }}>
          {activeSection === 'home' ? 'HOME CONTENT' : 'TOPICS COLLECTION'}
        </h2>
        
        <motion.button
          onClick={closeContent}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'white',
            cursor: 'pointer',
            padding: '0.8rem 1.5rem',
            borderRadius: '8px',
            fontSize: '1rem',
            fontFamily: 'Arame Mono, monospace',
            backdropFilter: 'blur(10px)'
          }}
          whileHover={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            scale: 1.05
          }}
          whileTap={{ scale: 0.95 }}
        >
          CLOSE
        </motion.button>
      </div>

      {/* Horizontal Scroll Container dengan GSAP */}
      <div
        ref={horizontalScrollRef}
        style={{
          width: '100%',
          height: '100%',
          overflowX: 'auto',
          overflowY: 'hidden',
          display: 'flex',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          cursor: 'grab'
        }}
        onMouseDown={() => {
          document.body.style.cursor = 'grabbing';
        }}
        onMouseUp={() => {
          document.body.style.cursor = 'grab';
        }}
        onMouseLeave={() => {
          document.body.style.cursor = 'default';
        }}
      >
        {/* Content Sections dengan GSAP Animations */}
        {(activeSection === 'home' ? homeContent : topicsContent).map((item, index, array) => (
          <div
            key={item.id}
            className="scroll-section content-item"
            style={{
              minWidth: '100vw',
              height: '100vh',
              scrollSnapAlign: 'start',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '6rem 2rem 2rem 2rem',
              flexShrink: 0
            }}
          >
            <motion.div
              style={{
                width: '90%',
                maxWidth: '1200px',
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: `1px solid ${item.color}20`,
                borderRadius: '20px',
                overflow: 'hidden',
                position: 'relative',
                backdropFilter: 'blur(20px)',
                cursor: 'pointer'
              }}
              whileHover={{
                scale: 1.02,
                borderColor: `${item.color}60`,
                boxShadow: `0 20px 40px ${item.color}20`
              }}
              transition={{ duration: 0.3 }}
            >
              {/* Image Section */}
              <div style={{
                height: '400px',
                backgroundImage: `url(${item.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative'
              }}>
                {/* Overlay */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.8))'
                }}></div>
                
                {/* Category Badge */}
                <div style={{
                  position: 'absolute',
                  top: '2rem',
                  right: '2rem',
                  backgroundColor: item.color,
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '25px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  fontFamily: 'Arame Mono, monospace'
                }}>
                  {item.category}
                </div>

                {/* Item Number */}
                <div style={{
                  position: 'absolute',
                  bottom: '2rem',
                  left: '2rem',
                  color: 'white',
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  fontFamily: 'Arame Mono, monospace'
                }}>
                  {String(index + 1).padStart(2, '0')}
                </div>
              </div>

              {/* Content Section */}
              <div style={{
                padding: '3rem'
              }}>
                <h3 style={{
                  color: 'white',
                  fontSize: '2.5rem',
                  fontWeight: '600',
                  margin: '0 0 1rem 0',
                  fontFamily: 'Arame Mono, monospace'
                }}>
                  {item.title}
                </h3>
                
                <p style={{
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: '1.2rem',
                  lineHeight: 1.6,
                  margin: '0 0 2rem 0',
                  fontFamily: 'Arame Mono, monospace'
                }}>
                  {item.description}
                </p>

                <motion.button
                  style={{
                    backgroundColor: item.color,
                    color: 'white',
                    border: 'none',
                    padding: '1rem 2rem',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontFamily: 'Arame Mono, monospace'
                  }}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: `0 10px 30px ${item.color}40`
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  EXPLORE MORE
                </motion.button>
              </div>
            </motion.div>
          </div>
        ))}
      </div>

      {/* Scroll Progress Indicator */}
      <div style={{
        position: 'fixed',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '200px',
        height: '4px',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: '2px',
        overflow: 'hidden',
        zIndex: zIndexes.content + 1
      }}>
        <motion.div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#CCFF00',
            borderRadius: '2px'
          }}
          animate={{
            scaleX: activeSection === 'home' ? 
              (1 / homeContent.length) : 
              (1 / topicsContent.length)
          }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  )}
</AnimatePresence>
	 
	 
	 
	 
	 
	 
	 
	 
	 
	 

      {/* Search Trigger Button */}
      {!showSearch && !showLoading && (
        <motion.button
          onClick={toggleSearch}
          style={{
            position: 'fixed',
            top: showBanner ? '4.5rem' : '2rem',
            right: '11rem',
            backgroundColor: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontFamily: 'Arame Mono, monospace',
            fontSize: '0.85rem',
            backdropFilter: 'blur(10px)',
            zIndex: zIndexes.banner,
            height: '48px'
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          whileHover={{
            backgroundColor: 'rgba(255,255,255,0.15)',
            scale: 1.05
          }}
          whileTap={{ scale: 0.95 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" 
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Search
          <span style={{
            fontSize: '0.7rem',
            color: 'rgba(255,255,255,0.5)',
            backgroundColor: 'rgba(255,255,255,0.1)',
            padding: '2px 6px',
            borderRadius: '4px',
            marginLeft: '0.25rem'
          }}>
            ⌘K
          </span>
        </motion.button>
      )}

      {/* Top Banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            ref={bannerRef}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              backgroundColor: '#FF4444',
              padding: '0.8rem 2rem',
              zIndex: zIndexes.banner,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              fontFamily: 'Arame Mono, monospace',
              boxShadow: '0 2px 20px rgba(0,0,0,0.1)',
              borderBottom: '1px solid rgba(0,0,0,0.1)'
            }}
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* SVG Icon */}
            <motion.div
              animate={{
                rotate: [0, -5, 5, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </motion.div>

            {/* Banner Text */}
            <motion.div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: '500',
                color: 'white'
              }}
            >
              <span>WEBSITE NOTE SEDANG DALAM PERSIAPAN -</span>
              <motion.span
                onClick={handleBannerClick}
                style={{
                  color: 'white',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
                whileHover={{ color: '#FFCCCB' }}
                whileTap={{ scale: 0.95 }}
              >
                Klik untuk melihat progress
              </motion.span>
            </motion.div>

            {/* Close Button */}
            <motion.button
              onClick={closeBanner}
              style={{
                position: 'absolute',
                right: '1rem',
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white'
              }}
              whileHover={{
                backgroundColor: 'rgba(255,255,255,0.3)',
                scale: 1.1,
                color: 'white'
              }}
              whileTap={{ scale: 0.9 }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Location Display */}
      <motion.div
        onClick={openLocationModal}
        style={{
          position: 'absolute',
          top: showBanner ? '4.5rem' : '2rem',
          left: '2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '0.3rem',
          cursor: 'pointer',
          padding: '0.8rem 1.2rem',
          borderRadius: '12px',
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)',
          maxWidth: '250px',
          zIndex: zIndexes.banner
        }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        whileHover={{
          background: 'rgba(255,255,255,0.08)',
          transition: { duration: 0.2 }
        }}
      >
        <motion.div
          style={{
            fontSize: '1rem',
            fontWeight: '400',
            color: 'white',
            fontFamily: 'Arame Mono, monospace',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          {isLoadingLocation ? (
            <motion.span
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
            >
              Loading...
            </motion.span>
          ) : visitorLocation.city ? (
            `${visitorLocation.city}, ${visitorLocation.country}`
          ) : (
            <span style={{ opacity: 0.7 }}>Klik untuk set lokasi</span>
          )}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </motion.div>
        <motion.div
          style={{
            fontSize: '0.8rem',
            fontWeight: '300',
            color: 'rgba(255,255,255,0.7)',
            fontFamily: 'Arame Mono, monospace'
          }}
        >
          {visitorTime.time} • {visitorTime.timezone}
          {visitorLocation.isManual && (
            <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', opacity: 0.5 }}>
              (manual)
            </span>
          )}
        </motion.div>
      </motion.div>

    




{/* ✅ HOME DROPDOWN BUTTON */}
<div ref={homeDropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
  <motion.button
    onClick={toggleHomeDropdown}
    style={{
      position: 'fixed',
      top: showBanner ? '4.5rem' : '2rem',
      left: '50%',
      transform: 'translateX(-120%)',
      padding: '0.6rem 1.5rem',
      fontSize: '0.85rem',
      fontWeight: '400',
      color: 'white',
      backgroundColor: 'rgba(255,255,255,0.1)',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '8px',
      cursor: 'pointer',
      fontFamily: 'Arame Mono, monospace',
      backdropFilter: 'blur(10px)',
      whiteSpace: 'nowrap',
      zIndex: zIndexes.banner,
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    }}
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 1.2, duration: 0.6 }}
    whileHover={{ 
      backgroundColor: 'rgba(255,255,255,0.15)',
      scale: 1.05,
      transition: { duration: 0.2 }
    }}
    whileTap={{ scale: 0.95 }}
  >
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
    HOME

    {/* UPDATE Label dengan Blink Effect */}
    <motion.div
      style={{
        backgroundColor: '#CCFF00',
        color: 'black',
        padding: '0.2rem 0.4rem',
        borderRadius: '4px',
        fontSize: '0.6rem',
        fontWeight: '700',
        marginLeft: '0.3rem',
        opacity: isUpdateBlinking ? 1 : 0.3
      }}
      animate={{ opacity: isUpdateBlinking ? 1 : 0.3 }}
      transition={{ duration: 0.5 }}
    >
      UPDATE
    </motion.div>

    {/* Blinking Dot */}
    <motion.div
      style={{
        width: '6px',
        height: '6px',
        backgroundColor: '#CCFF00',
        borderRadius: '50%',
        marginLeft: '0.2rem'
      }}
      animate={{ 
        opacity: [0, 1, 0],
        scale: [0.8, 1.2, 0.8]
      }}
      transition={{ 
        duration: 1.5, 
        repeat: Infinity,
        repeatType: "reverse"
      }}
    />

    <motion.svg 
      width="12" 
      height="12" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      animate={{ rotate: showHomeDropdown ? 180 : 0 }}
      transition={{ duration: 0.3 }}
    >
      <polyline points="6 9 12 15 18 9"/>
    </motion.svg>
  </motion.button>
</div>


{/* ✅ HOME DROPDOWN MENU */}
<AnimatePresence>
  {showHomeDropdown && (
    <motion.div
      style={{
        position: 'fixed',
        top: showBanner ? '7.5rem' : '5rem',
        left: '50%',
        transform: 'translateX(-120%)',
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '1rem',
        minWidth: '280px',
        zIndex: zIndexes.dropdown,
        backdropFilter: 'blur(20px)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {homeDropdownItems.map((item, index) => (
        <motion.div
          key={index}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
            padding: '1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            marginBottom: '0.5rem',
            backgroundColor: 'rgba(255, 255, 255, 0.03)'
          }}
          whileHover={{
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            scale: 1.02
          }}
          transition={{ duration: 0.2 }}
        >
          <div style={{
            color: '#CCFF00',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '24px'
          }}>
            {item.icon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              color: 'white',
              fontSize: '0.9rem',
              fontWeight: '500',
              fontFamily: 'Arame Mono, monospace',
              marginBottom: '0.25rem'
            }}>
              {item.title}
            </div>
            <div style={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '0.8rem',
              fontFamily: 'Arame Mono, monospace',
              lineHeight: 1.4
            }}>
              {item.description}
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )}
</AnimatePresence>


{/* ✅ TOPICS DROPDOWN BUTTON */}
<div ref={topicsDropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
  <motion.button
    onClick={toggleTopicsDropdown}
    style={{
      position: 'fixed',
      top: showBanner ? '4.5rem' : '2rem',
      left: '50%',
      transform: 'translateX(20%)',
      padding: '0.6rem 1.5rem',
      fontSize: '0.85rem',
      fontWeight: '400',
      color: 'white',
      backgroundColor: 'rgba(255,255,255,0.1)',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '8px',
      cursor: 'pointer',
      fontFamily: 'Arame Mono, monospace',
      backdropFilter: 'blur(10px)',
      whiteSpace: 'nowrap',
      zIndex: zIndexes.banner,
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    }}
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 1.2, duration: 0.6 }}
    whileHover={{ 
      backgroundColor: 'rgba(255,255,255,0.15)',
      scale: 1.05,
      transition: { duration: 0.2 }
    }}
    whileTap={{ scale: 0.95 }}
  >
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
    </svg>
    TOPICS

    {/* UPDATE Label dengan Blink Effect */}
    <motion.div
      style={{
        backgroundColor: '#CCFF00',
        color: 'black',
        padding: '0.2rem 0.4rem',
        borderRadius: '4px',
        fontSize: '0.6rem',
        fontWeight: '700',
        marginLeft: '0.3rem',
        opacity: isUpdateBlinking ? 1 : 0.3
      }}
      animate={{ opacity: isUpdateBlinking ? 1 : 0.3 }}
      transition={{ duration: 0.5 }}
    >
      UPDATE
    </motion.div>

    {/* Blinking Dot */}
    <motion.div
      style={{
        width: '6px',
        height: '6px',
        backgroundColor: '#CCFF00',
        borderRadius: '50%',
        marginLeft: '0.2rem'
      }}
      animate={{ 
        opacity: [0, 1, 0],
        scale: [0.8, 1.2, 0.8]
      }}
      transition={{ 
        duration: 1.5, 
        repeat: Infinity,
        repeatType: "reverse"
      }}
    />

    <motion.svg 
      width="12" 
      height="12" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      animate={{ rotate: showTopicsDropdown ? 180 : 0 }}
      transition={{ duration: 0.3 }}
    >
      <polyline points="6 9 12 15 18 9"/>
    </motion.svg>
  </motion.button>
</div>


{/* ✅ TOPICS DROPDOWN MENU */}
<AnimatePresence>
  {showTopicsDropdown && (
    <motion.div
      style={{
        position: 'fixed',
        top: showBanner ? '7.5rem' : '5rem',
        left: '50%',
        transform: 'translateX(20%)',
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '1rem',
        minWidth: '280px',
        zIndex: zIndexes.dropdown,
        backdropFilter: 'blur(20px)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {topicsDropdownItems.map((item, index) => (
        <motion.div
          key={index}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
            padding: '1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            marginBottom: '0.5rem',
            backgroundColor: 'rgba(255, 255, 255, 0.03)'
          }}
          whileHover={{
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            scale: 1.02
          }}
          transition={{ duration: 0.2 }}
        >
          <div style={{
            color: '#CCFF00',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '24px'
          }}>
            {item.icon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              color: 'white',
              fontSize: '0.9rem',
              fontWeight: '500',
              fontFamily: 'Arame Mono, monospace',
              marginBottom: '0.25rem'
            }}>
              {item.title}
            </div>
            <div style={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '0.8rem',
              fontFamily: 'Arame Mono, monospace',
              lineHeight: 1.4
            }}>
              {item.description}
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )}
</AnimatePresence>











	  
	  
	  
	  
	  
	  
	  
	  
	  
	  
	  

      {/* Sign In Button - Navbar Tengah */}
      <motion.button
        onClick={() => router.push('/signin')}
        style={{
          position: 'fixed',
          top: showBanner ? '4.5rem' : '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '0.6rem 1.5rem',
          fontSize: '0.85rem',
          fontWeight: '400',
          color: 'white',
          backgroundColor: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '8px',
          cursor: 'pointer',
          fontFamily: 'Arame Mono, monospace',
          backdropFilter: 'blur(10px)',
          whiteSpace: 'nowrap',
          zIndex: zIndexes.banner,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        whileHover={{ 
          backgroundColor: 'rgba(255,255,255,0.15)',
          scale: 1.05,
          transition: { duration: 0.2 }
        }}
        whileTap={{ scale: 0.95 }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        SIGN IN
      </motion.button>

      {/* Button untuk melihat semua users */}
      <motion.button
        onClick={openAllUsersModal}
        style={{
          position: 'absolute',
          top: showBanner ? '4.5rem' : '2rem',
          left: '16rem',
          padding: '0.6rem 1.2rem',
          fontSize: '0.8rem',
          fontWeight: '300',
          color: 'white',
          backgroundColor: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '8px',
          cursor: 'pointer',
          fontFamily: 'Arame Mono, monospace',
          backdropFilter: 'blur(10px)',
          whiteSpace: 'nowrap',
          zIndex: zIndexes.banner
        }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.0, duration: 0.6 }}
        whileHover={{ 
          backgroundColor: 'rgba(255,255,255,0.15)',
          scale: 1.05,
          transition: { duration: 0.2 }
        }}
        whileTap={{ scale: 0.95 }}
      >
        VIEW ALL USERS
      </motion.button>

      {/* Menu Button */}
      <motion.div
        onClick={toggleMenu}
        onMouseEnter={handleMenuHover}
        onMouseLeave={handleMenuLeave}
        style={{
          position: 'absolute',
          top: showBanner ? '4.5rem' : '2rem',
          right: '2rem',
          fontSize: '1.2rem',
          fontWeight: '300',
          color: 'white',
          cursor: 'pointer',
          fontFamily: 'Arame Mono, monospace',
          letterSpacing: '1.5px',
          zIndex: zIndexes.banner,
          padding: '1rem 1.8rem',
          borderRadius: '30px',
          border: '1px solid rgba(255,255,255,0.15)',
          background: 'rgba(0,0,0,0.3)',
          backdropFilter: 'blur(15px)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          minWidth: '160px',
          justifyContent: 'center'
        }}
        variants={menuButtonVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
        whileTap="tap"
      >
        {/* Animated hamburger icon */}
        <motion.div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            width: '20px'
          }}
          animate={showMenu ? "open" : "closed"}
        >
          <motion.span
            style={{
              width: '100%',
              height: '2px',
              backgroundColor: 'currentColor',
              borderRadius: '1px'
            }}
            variants={{
              closed: { rotate: 0, y: 0 },
              open: { rotate: 45, y: 6 }
            }}
            transition={{ duration: 0.3 }}
          />
          <motion.span
            style={{
              width: '100%',
              height: '2px',
              backgroundColor: 'currentColor',
              borderRadius: '1px'
            }}
            variants={{
              closed: { opacity: 1 },
              open: { opacity: 0 }
            }}
            transition={{ duration: 0.3 }}
          />
          <motion.span
            style={{
              width: '100%',
              height: '2px',
              backgroundColor: 'currentColor',
              borderRadius: '1px'
            }}
            variants={{
              closed: { rotate: 0, y: 0 },
              open: { rotate: -45, y: -6 }
            }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
        
        {/* Menu Text dengan animasi berganti */}
        <div
          style={{
            fontSize: '1.1rem',
            fontWeight: '300',
            minWidth: '90px',
            textAlign: 'center',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}
        >
          <AnimatePresence mode="popLayout">
            <motion.span
              key={menuText}
              variants={textVariants}
              initial="enter"
              animate="center"
              exit="exit"
              style={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                whiteSpace: 'nowrap'
              }}
            >
              {menuText}
            </motion.span>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* High-Speed Text Scroll Loading Animation */}
      <AnimatePresence>
        {showLoading && (
          <div
            ref={loadingRef}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'black',
              zIndex: zIndexes.loading,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden'
            }}
          >
            {/* Text Scroll Container */}
            <div
              ref={textScrollRef}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0rem'
              }}
            >
              {/* High-speed scrolling text lines */}
              <div style={{
                fontSize: '8rem',
                fontWeight: '900',
                color: 'white',
                fontFamily: 'Arame Mono, monospace',
                textTransform: 'uppercase',
                letterSpacing: '-3px',
                lineHeight: 0.8,
                opacity: 0
              }}>
                CREATIVE
              </div>
              
              <div style={{
                fontSize: '8rem',
                fontWeight: '900',
                color: 'white',
                fontFamily: 'Arame Mono, monospace',
                textTransform: 'uppercase',
                letterSpacing: '-3px',
                lineHeight: 0.8,
                opacity: 0
              }}>
                PORTFOLIO
              </div>
              
              <div style={{
                fontSize: '8rem',
                fontWeight: '900',
                color: 'white',
                fontFamily: 'Arame Mono, monospace',
                textTransform: 'uppercase',
                letterSpacing: '-3px',
                lineHeight: 0.8,
                opacity: 0
              }}>
                INNOVATION
              </div>
              
              <div style={{
                fontSize: '8rem',
                fontWeight: '900',
                color: 'white',
                fontFamily: 'Arame Mono, monospace',
                textTransform: 'uppercase',
                letterSpacing: '-3px',
                lineHeight: 0.8,
                opacity: 0
              }}>
                DESIGN
              </div>
              
              <div style={{
                fontSize: '8rem',
                fontWeight: '900',
                color: 'white',
                fontFamily: 'Arame Mono, monospace',
                textTransform: 'uppercase',
                letterSpacing: '-3px',
                lineHeight: 0.8,
                opacity: 0
              }}>
                VISION
              </div>
              
              {/* Final text that stays */}
              <div style={{
                fontSize: '8rem',
                fontWeight: '900',
                color: '#CCFF00',
                fontFamily: 'Arame Mono, monospace',
                textTransform: 'uppercase',
                letterSpacing: '-3px',
                lineHeight: 0.8,
                opacity: 0,
                textShadow: '0 0 30px rgba(204, 255, 0, 0.5)'
              }}>
                WELCOME
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Cookie Consent Banner */}
      <AnimatePresence>
        {showCookieConsent && (
          <motion.div
            style={{
              position: 'fixed',
              bottom: '1rem',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '95%',
              maxWidth: '700px',
              backgroundColor: 'rgba(0, 0, 0, 0.98)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '20px',
              padding: '2rem',
              zIndex: zIndexes.modal,
              backdropFilter: 'blur(25px)',
              boxShadow: '0 25px 80px rgba(0, 0, 0, 0.7)'
            }}
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem'
            }}>
              {/* Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '0.5rem'
              }}>
                <motion.div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: '#CCFF00',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                </motion.div>
                
                <h3 style={{
                  color: 'white',
                  fontSize: '1.5rem',
                  fontWeight: '500',
                  margin: 0,
                  fontFamily: 'Arame Mono, monospace'
                }}>
                  Network Analytics Detection
                </h3>
              </div>

              {/* Real Network Information */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <motion.div
                  style={{
                    padding: '1rem',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem'
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CCFF00" strokeWidth="2">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                    </svg>
                    <span style={{
                      color: 'white',
                      fontSize: '0.85rem',
                      fontWeight: '500',
                      fontFamily: 'Arame Mono, monospace'
                    }}>
                      Connection Type
                    </span>
                  </div>
                  <p style={{
                    color: '#CCFF00',
                    fontSize: '0.9rem',
                    margin: 0,
                    fontFamily: 'Arame Mono, monospace',
                    fontWeight: '500'
                  }}>
                    {networkType}
                  </p>
                </motion.div>

                <motion.div
                  style={{
                    padding: '1rem',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem'
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CCFF00" strokeWidth="2">
                      <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/>
                      <rect x="2" y="14" width="20" height="8" rx="2" ry="2"/>
                      <line x1="6" y1="6" x2="6.01" y2="6"/>
                      <line x1="6" y1="18" x2="6.01" y2="18"/>
                    </svg>
                    <span style={{
                      color: 'white',
                      fontSize: '0.85rem',
                      fontWeight: '500',
                      fontFamily: 'Arame Mono, monospace'
                    }}>
                      IP Address
                    </span>
                  </div>
                  <p style={{
                    color: userIP === 'unknown' ? 'rgba(255,255,255,0.6)' : '#CCFF00',
                    fontSize: '0.8rem',
                    margin: 0,
                    fontFamily: 'Arame Mono, monospace',
                    fontWeight: userIP === 'unknown' ? '400' : '500',
                    wordBreak: 'break-all'
                  }}>
                    {userIP === 'unknown' ? 'Tidak terdeteksi' : userIP}
                  </p>
                </motion.div>

                <motion.div
                  style={{
                    padding: '1rem',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem'
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CCFF00" strokeWidth="2">
                      <path d="M12 2a10 10 0 0 1 7.38 16.75A10 10 0 0 1 12 2z"/>
                      <path d="M12 2v20"/>
                      <path d="M2 12h20"/>
                    </svg>
                    <span style={{
                      color: 'white',
                      fontSize: '0.85rem',
                      fontWeight: '500',
                      fontFamily: 'Arame Mono, monospace'
                    }}>
                      Device
                    </span>
                  </div>
                  <p style={{
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: '0.8rem',
                    margin: 0,
                    fontFamily: 'Arame Mono, monospace'
                  }}>
                    {/Mobile/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop'}
                  </p>
                </motion.div>
              </div>

              {/* Description */}
              <motion.div
                style={{
                  padding: '1.2rem',
                  backgroundColor: 'rgba(255, 68, 68, 0.1)',
                  border: '1px solid rgba(255, 68, 68, 0.3)',
                  borderRadius: '12px'
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <p style={{
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: '0.85rem',
                  lineHeight: '1.5',
                  margin: '0 0 0.5rem 0',
                  fontFamily: 'Arame Mono, monospace'
                }}>
                  <strong>Deteksi Jaringan Real-time:</strong> Sistem mendeteksi koneksi {networkType.toLowerCase()} 
                  {userIP !== 'unknown' && ` dengan IP ${userIP}`} untuk memantau perkembangan website.
                </p>
                <p style={{
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '0.8rem',
                  lineHeight: '1.4',
                  margin: 0,
                  fontFamily: 'Arame Mono, monospace'
                }}>
                  Data digunakan secara anonim untuk analytics development. Tidak ada biaya atau API external.
                </p>
              </motion.div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'flex-end',
                flexWrap: 'wrap'
              }}>
                <motion.button
                  onClick={handleDeclineCookies}
                  style={{
                    padding: '0.8rem 1.5rem',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    borderRadius: '8px',
                    color: 'rgba(255,255,255,0.8)',
                    cursor: 'pointer',
                    fontFamily: 'Arame Mono, monospace',
                    fontSize: '0.85rem',
                    fontWeight: '400'
                  }}
                  whileHover={{
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    scale: 1.05
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  Tolak
                </motion.button>
                
                <motion.button
                  onClick={handleAcceptCookies}
                  disabled={isCollectingData}
                  style={{
                    padding: '0.8rem 1.5rem',
                    backgroundColor: isCollectingData ? 'rgba(204, 255, 0, 0.6)' : '#CCFF00',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'black',
                    cursor: isCollectingData ? 'not-allowed' : 'pointer',
                    fontFamily: 'Arame Mono, monospace',
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  whileHover={!isCollectingData ? {
                    backgroundColor: '#ddff33',
                    scale: 1.05
                  } : {}}
                  whileTap={{ scale: 0.95 }}
                >
                  {isCollectingData ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 12a9 9 0 11-6.219-8.56"/>
                        </svg>
                      </motion.div>
                      Mendeteksi...
                    </>
                  ) : (
                    'Izinkan Analytics'
                  )}
                </motion.button>
              </div>

              {/* Footer Note */}
              <div style={{
                textAlign: 'center',
                marginTop: '0.5rem'
              }}>
                <p style={{
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '0.7rem',
                  margin: 0,
                  fontFamily: 'Arame Mono, monospace',
                  lineHeight: '1.4'
                }}>
                  Deteksi jaringan langsung dari browser • Tidak menggunakan API external • Gratis 100%
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Menu Overlay */}
      <AnimatePresence>
        {showMenu && (
          <>
            {/* Background Overlay - COVER SEMUA ELEMEN */}
            <motion.div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: '#FF4444',
                zIndex: zIndexes.menu - 1,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
            
            {/* Main Menu Content */}
            <motion.div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: zIndexes.menu,
                display: 'flex',
                padding: '2rem',
                pointerEvents: 'auto'
              }}
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              {/* Main Content - Navigation Menu */}
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                paddingLeft: '4rem',
                position: 'relative'
              }}>
                {/* Website Name - Top Left */}
                <motion.div
                  style={{
                    position: 'absolute',
                    left: '2rem',
                    top: '2rem',
                    fontSize: '4rem',
                    fontWeight: '800',
                    color: 'rgba(255,255,255,1)',
                    fontFamily: 'Arame Mono, monospace',
                    lineHeight: 1,
                    letterSpacing: '1.5px',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                    zIndex: zIndexes.menu + 1
                  }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  MENURU
                </motion.div>

                {/* Visitor Time & Location Display - TOP CENTER */}
                <motion.div
                  style={{
                    position: 'absolute',
                    top: '2rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.3rem',
                    zIndex: zIndexes.menu + 1
                  }}
                  variants={timeVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
                  {/* Time */}
                  <motion.div
                    style={{
                      fontSize: '2.5rem',
                      fontWeight: '400',
                      color: 'rgba(255,255,255,0.9)',
                      fontFamily: 'Arame Mono, monospace',
                      fontFeatureSettings: '"tnum"',
                      fontVariantNumeric: 'tabular-nums',
                      letterSpacing: '2px'
                    }}
                    animate={{
                      scale: [1, 1.02, 1],
                    }}
                    transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                  >
                    {visitorTime.time}
                  </motion.div>

                  {/* Location & Timezone */}
                  <motion.div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      fontSize: '0.9rem',
                      fontWeight: '400',
                      color: 'rgba(255,255,255,0.8)',
                      fontFamily: 'Arame Mono, monospace'
                    }}
                  >
                    <span style={{ 
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '12px',
                      fontWeight: '500'
                    }}>
                      {visitorTime.timezone}
                    </span>
                    <span>
                      {visitorLocation.city ? `${visitorLocation.city}, ${visitorLocation.country}` : 'Lokasi belum diatur'}
                    </span>
                  </motion.div>

                  {/* Date */}
                  <motion.div
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: '300',
                      color: 'rgba(255,255,255,0.7)',
                      fontFamily: 'Arame Mono, monospace'
                    }}
                  >
                    {visitorTime.date}
                  </motion.div>
                </motion.div>

                {/* Menu Items */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2rem'
                }}>
                  {menuItems.map((item, index) => (
                    <motion.div
                      key={item.name}
                      style={{
                        position: 'relative',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        padding: '0.5rem 0'
                      }}
                      onMouseEnter={() => setHoveredItem(item.name)}
                      onMouseLeave={() => setHoveredItem(null)}
                      variants={menuItemVariants}
                      initial="closed"
                      animate="open"
                      exit="closed"
                      custom={index}
                      whileHover={{
                        x: 15,
                        transition: { duration: 0.2, ease: "easeOut" }
                      }}
                      onClick={item.action}
                    >
                      {/* Menu Text */}
                      <motion.div
                        style={{
                          fontSize: '80px',
                          fontWeight: '300',
                          color: 'rgba(255,255,255,0.8)',
                          fontFamily: 'Arame Mono, monospace',
                          lineHeight: 1,
                          letterSpacing: '-2px',
                          textTransform: 'uppercase',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          gap: '1rem'
                        }}
                        animate={{
                          color: hoveredItem === item.name ? '#FFFFFF' : 'rgba(255,255,255,0.8)',
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        {item.name}
                        
                        {/* Line bawah */}
                        <motion.div
                          style={{
                            width: '100%',
                            height: '3px',
                            backgroundColor: hoveredItem === item.name ? '#FFFFFF' : 'rgba(255,255,255,0.3)',
                          }}
                          animate={{
                            backgroundColor: hoveredItem === item.name ? '#FFFFFF' : 'rgba(255,255,255,0.3)',
                            height: hoveredItem === item.name ? '4px' : '3px'
                          }}
                          transition={{ duration: 0.3 }}
                        />
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
            
            {/* Close Button - PALING ATAS */}
            <motion.button
              onClick={toggleMenu}
              onMouseEnter={() => setIsCloseHovered(true)}
              onMouseLeave={() => setIsCloseHovered(false)}
              style={{
                position: 'fixed',
                top: '1.8rem',
                right: '1.8rem',
                width: '100px',
                height: '45px',
                borderRadius: '25px',
                border: 'none',
                backgroundColor: 'rgba(255,255,255,0.2)',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: zIndexes.menu + 10, // PALING TINGGI
                backdropFilter: 'blur(10px)',
                padding: '0 1.5rem',
                fontFamily: 'Arame Mono, monospace',
                fontSize: '0.9rem',
                fontWeight: '300',
                color: 'rgba(255,255,255,0.9)',
                overflow: 'hidden'
              }}
              variants={closeButtonVariants}
              initial="closed"
              animate="open"
              exit="closed"
              whileHover={{ 
                scale: 1.05,
                backgroundColor: 'rgba(255,255,255,0.3)',
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  position: 'relative',
                  width: '100%',
                  justifyContent: 'center'
                }}
              >
                {/* X Icon */}
                <motion.svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ scale: 1, opacity: 1 }}
                  animate={{ 
                    scale: isCloseHovered ? 0 : 1,
                    opacity: isCloseHovered ? 0 : 1
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </motion.svg>

                {/* Close Text */}
                <motion.span
                  style={{
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    whiteSpace: 'nowrap',
                    fontSize: '0.9rem',
                    fontWeight: '300',
                    letterSpacing: '0.5px'
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: isCloseHovered ? 1 : 0,
                    opacity: isCloseHovered ? 1 : 0
                  }}
                  transition={{ duration: 0.2 }}
                >
                  CLOSE
                </motion.span>
              </motion.div>
            </motion.button>
          </>
        )}
      </AnimatePresence>

      {/* Modal untuk set lokasi manual */}
      <AnimatePresence>
        {showLocationModal && (
          <motion.div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0,0,0,0.8)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: zIndexes.modal,
              padding: '2rem'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              style={{
                background: 'white',
                borderRadius: '15px',
                padding: '2rem',
                maxWidth: '500px',
                width: '100%',
                maxHeight: '80vh',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <h3 style={{ 
                marginBottom: '1.5rem', 
                color: 'black',
                fontFamily: 'Arame Mono, monospace',
                fontWeight: '400'
              }}>
                Set Lokasi Anda
              </h3>
              
              <div style={{ marginBottom: '1rem' }}>
                <input
                  type="text"
                  placeholder="Cari kota atau provinsi..."
                  value={tempLocation.city}
                  onChange={(e) => setTempLocation(prev => ({ ...prev, city: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontFamily: 'Arame Mono, monospace',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div style={{ 
                flex: 1, 
                overflowY: 'auto',
                maxHeight: '300px',
                marginBottom: '1.5rem'
              }}>
                {filteredCities.slice(0, 10).map((city, index) => (
                  <motion.div
                    key={`${city.city}-${city.region}`}
                    onClick={() => {
                      setTempLocation({
                        city: city.city,
                        region: city.region
                      });
                    }}
                    style={{
                      padding: '0.8rem',
                      borderBottom: '1px solid #f0f0f0',
                      cursor: 'pointer',
                      backgroundColor: tempLocation.city === city.city ? '#f8f8f8' : 'transparent',
                      fontFamily: 'Arame Mono, monospace',
                      fontSize: '0.9rem'
                    }}
                    whileHover={{ backgroundColor: '#f0f0f0' }}
                  >
                    <div style={{ fontWeight: '500', color: 'black' }}>{city.city}</div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{city.region}</div>
                  </motion.div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <motion.button
                  onClick={() => setShowLocationModal(false)}
                  style={{
                    padding: '0.6rem 1.2rem',
                    border: '1px solid #ddd',
                    background: 'transparent',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontFamily: 'Arame Mono, monospace'
                  }}
                  whileHover={{ background: '#f8f8f8' }}
                >
                  Batal
                </motion.button>
                <motion.button
                  onClick={saveManualLocation}
                  disabled={!tempLocation.city}
                  style={{
                    padding: '0.6rem 1.2rem',
                    border: 'none',
                    background: tempLocation.city ? '#FF4444' : '#ccc',
                    color: 'white',
                    borderRadius: '6px',
                    cursor: tempLocation.city ? 'pointer' : 'not-allowed',
                    fontFamily: 'Arame Mono, monospace',
                    fontWeight: '500'
                  }}
                  whileHover={tempLocation.city ? { scale: 1.05 } : {}}
                >
                  Simpan
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal untuk menampilkan semua users */}
      <AnimatePresence>
        {showAllUsers && (
          <motion.div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0,0,0,0.9)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: zIndexes.modal,
              padding: '2rem'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              style={{
                background: 'white',
                borderRadius: '15px',
                padding: '2rem',
                maxWidth: '700px',
                width: '100%',
                maxHeight: '80vh',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{ 
                  color: 'black',
                  fontFamily: 'Arame Mono, monospace',
                  fontWeight: '400',
                  margin: 0
                }}>
                  All Users Location Data
                </h3>
                <motion.button
                  onClick={() => setShowAllUsers(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: '#666',
                    padding: '0.5rem',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  whileHover={{ 
                    backgroundColor: '#f0f0f0',
                    color: '#000'
                  }}
                >
                  ×
                </motion.button>
              </div>

              {isLoadingAllUsers ? (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '3rem',
                  flexDirection: 'column',
                  gap: '1rem'
                }}>
                  <motion.div
                    style={{
                      width: '40px',
                      height: '40px',
                      border: '3px solid #f0f0f0',
                      borderTop: '3px solid #FF4444',
                      borderRadius: '50%'
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <div style={{
                    fontFamily: 'Arame Mono, monospace',
                    color: '#666',
                    fontSize: '0.9rem'
                  }}>
                    Loading users data...
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ 
                    flex: 1, 
                    overflowY: 'auto',
                    maxHeight: '400px',
                    marginBottom: '1rem'
                  }}>
                    {allUsersData.length === 0 ? (
                      <div style={{
                        textAlign: 'center',
                        padding: '3rem',
                        color: '#666',
                        fontFamily: 'Arame Mono, monospace'
                      }}>
                        No users data found
                      </div>
                    ) : (
                      allUsersData.map((user, index) => (
                        <motion.div
                          key={user.id}
                          style={{
                            padding: '1.2rem',
                            borderBottom: '1px solid #f0f0f0',
                            backgroundColor: user.id === currentUserId ? '#f8f8f8' : 'transparent',
                            fontFamily: 'Arame Mono, monospace',
                            borderLeft: user.id === currentUserId ? '4px solid #FF4444' : '4px solid transparent'
                          }}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ backgroundColor: '#fafafa' }}
                        >
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '0.8rem'
                          }}>
                            <div style={{ 
                              fontWeight: '500', 
                              color: 'black',
                              fontSize: '1rem'
                            }}>
                              User {index + 1} 
                              {user.id === currentUserId && (
                                <span style={{ 
                                  marginLeft: '0.5rem',
                                  backgroundColor: '#FF4444',
                                  color: 'white',
                                  padding: '0.2rem 0.6rem',
                                  borderRadius: '12px',
                                  fontSize: '0.7rem',
                                  fontWeight: '500'
                                }}>
                                  YOU
                                </span>
                              )}
                            </div>
                            <div style={{ 
                              fontSize: '0.7rem', 
                              color: '#666',
                              backgroundColor: '#f0f0f0',
                              padding: '0.3rem 0.6rem',
                              borderRadius: '8px',
                              fontFamily: 'monospace'
                            }}>
                              ID: {user.id.substring(0, 10)}...
                            </div>
                          </div>
                          
                          <div style={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.8rem',
                            marginBottom: '0.5rem'
                          }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                              <circle cx="12" cy="10" r="3"/>
                            </svg>
                            <span style={{ fontSize: '0.9rem', color: '#333', fontWeight: '500' }}>
                              {user.city || 'Unknown'}, {user.region || 'Unknown'}
                            </span>
                          </div>
                          
                          <div style={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.8rem',
                            marginBottom: '0.5rem'
                          }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                              <line x1="16" y1="2" x2="16" y2="6"/>
                              <line x1="8" y1="2" x2="8" y2="6"/>
                              <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            <span style={{ fontSize: '0.8rem', color: '#666' }}>
                              {user.lastUpdated ? new Date(user.lastUpdated).toLocaleString('id-ID') : 'No timestamp'}
                            </span>
                          </div>

                          {user.isManual && (
                            <div style={{ 
                              fontSize: '0.7rem', 
                              color: '#FF4444',
                              backgroundColor: 'rgba(255, 68, 68, 0.1)',
                              padding: '0.2rem 0.6rem',
                              borderRadius: '8px',
                              display: 'inline-block',
                              marginTop: '0.3rem'
                            }}>
                              Manual Location
                            </div>
                          )}
                        </motion.div>
                      ))
                    )}
                  </div>

                  <div style={{ 
                    marginTop: '1rem',
                    fontSize: '0.8rem',
                    color: '#666',
                    textAlign: 'center',
                    padding: '1rem',
                    backgroundColor: '#f8f8f8',
                    borderRadius: '8px'
                  }}>
                    Total <strong>{allUsersData.length}</strong> users found
                    {allUsersData.length > 0 && (
                      <span style={{ marginLeft: '1rem' }}>
                        • Last updated: {new Date().toLocaleString('id-ID')}
                      </span>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
