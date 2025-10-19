[file name]: app/page.tsx
[file content begin]
'use client';

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, onSnapshot, collection, getDocs } from "firebase/firestore";

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
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchStatus, setSearchStatus] = useState<"idle" | "searching" | "empty" | "results" | "updated">("idle");
  const router = useRouter();
  const timeRef = useRef<NodeJS.Timeout | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const textScrollRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Database kota-kota Indonesia
  const indonesiaCities = [
    { city: "Jakarta", region: "DKI Jakarta" },
    { city: "Surabaya", region: "Jawa Timur" },
    { city: "Bandung", region: "Jawa Barat" },
    { city: "Bekasi", region: "Jawa Barat" },
    { city: "Medan", region: "Sumatera Utara" },
    { city: "Depok", region: "Jawa Barat" },
    { city: "Tangerang", region: "Banten" },
    { city: "Palembang", region: "Sumatera Selatan" },
    { city: "Semarang", region: "Jawa Tengah" },
    { city: "Makassar", region: "Sulawesi Selatan" },
    { city: "South Tangerang", region: "Banten" },
    { city: "Batam", region: "Kepulauan Riau" },
    { city: "Bandar Lampung", region: "Lampung" },
    { city: "Bogor", region: "Jawa Barat" },
    { city: "Pekanbaru", region: "Riau" },
    { city: "Padang", region: "Sumatera Barat" },
    { city: "Malang", region: "Jawa Timur" },
    { city: "Samarinda", region: "Kalimantan Timur" },
    { city: "Denpasar", region: "Bali" },
    { city: "Tasikmalaya", region: "Jawa Barat" },
    { city: "Serang", region: "Banten" },
    { city: "Balikpapan", region: "Kalimantan Timur" },
    { city: "Pontianak", region: "Kalimantan Barat" },
    { city: "Banjarmasin", region: "Kalimantan Selatan" },
    { city: "Jambi", region: "Jambi" },
    { city: "Surakarta", region: "Jawa Tengah" },
    { city: "Cimahi", region: "Jawa Barat" },
    { city: "Manado", region: "Sulawesi Utara" },
    { city: "Mataram", region: "Nusa Tenggara Barat" },
    { city: "Yogyakarta", region: "DI Yogyakarta" },
    { city: "Cilegon", region: "Banten" },
    { city: "Palu", region: "Sulawesi Tengah" },
    { city: "Kupang", region: "Nusa Tenggara Timur" },
    { city: "Bengkulu", region: "Bengkulu" },
    { city: "Majalengka", region: "Jawa Barat" },
    { city: "Tegal", region: "Jawa Tengah" },
    { city: "Kediri", region: "Jawa Timur" },
    { city: "Binjai", region: "Sumatera Utara" },
    { city: "Pematang Siantar", region: "Sumatera Utara" },
    { city: "Karawang", region: "Jawa Barat" },
    { city: "Cirebon", region: "Jawa Barat" },
    { city: "Lhokseumawe", region: "Aceh" },
    { city: "Pekalongan", region: "Jawa Tengah" },
    { city: "Cibinong", region: "Jawa Barat" },
    { city: "Madiun", region: "Jawa Timur" },
    { city: "Ambon", region: "Maluku" },
    { city: "Langsa", region: "Aceh" },
    { city: "Banda Aceh", region: "Aceh" },
    { city: "Bontang", region: "Kalimantan Timur" },
    { city: "Probolinggo", region: "Jawa Timur" },
    { city: "Singkawang", region: "Kalimantan Barat" },
    { city: "Batu", region: "Jawa Timur" },
    { city: "Sungaipenuh", region: "Jambi" },
    { city: "Blitar", region: "Jawa Timur" },
    { city: "Bitung", region: "Sulawesi Utara" },
    { city: "Tanjung Pinang", region: "Kepulauan Riau" },
    { city: "Mojokerto", region: "Jawa Timur" },
    { city: "Gorontalo", region: "Gorontalo" },
    { city: "Magelang", region: "Jawa Tengah" },
    { city: "Teluknaga", region: "Banten" },
    { city: "Ternate", region: "Maluku Utara" },
    { city: "Banjarbaru", region: "Kalimantan Selatan" },
    { city: "Pangkal Pinang", region: "Kepulauan Bangka Belitung" },
    { city: "Tarakan", region: "Kalimantan Utara" },
    { city: "Lubuklinggau", region: "Sumatera Selatan" },
    { city: "Palangkaraya", region: "Kalimantan Tengah" },
    { city: "Metro", region: "Lampung" },
    { city: "Tebing Tinggi", region: "Sumatera Utara" },
    { city: "Bima", region: "Nusa Tenggara Barat" },
    { city: "Pasuruan", region: "Jawa Timur" },
    { city: "Salatiga", region: "Jawa Tengah" },
    { city: "Ciamis", region: "Jawa Barat" },
    { city: "Lahat", region: "Sumatera Selatan" },
    { city: "Sampit", region: "Kalimantan Tengah" },
    { city: "Rantau Prapat", region: "Sumatera Utara" },
    { city: "Cikarang", region: "Jawa Barat" },
    { city: "Purwakarta", region: "Jawa Barat" },
    { city: "Sorong", region: "Papua Barat" },
    { city: "Subang", region: "Jawa Barat" },
    { city: "Indramayu", region: "Jawa Barat" },
    { city: "Sumber", region: "Jawa Barat" },
    { city: "Pandeglang", region: "Banten" },
    { city: "Kuningan", region: "Jawa Barat" },
    { city: "Sumedang", region: "Jawa Barat" },
    { city: "Banyuwangi", region: "Jawa Timur" },
    { city: "Purwodadi", region: "Jawa Tengah" },
    { city: "Bondowoso", region: "Jawa Timur" },
    { city: "Jayapura", region: "Papua" },
    { city: "Sleman", region: "DI Yogyakarta" },
    { city: "Bantul", region: "DI Yogyakarta" },
    { city: "Gunungsitoli", region: "Sumatera Utara" },
    { city: "Padang Sidempuan", region: "Sumatera Utara" },
    { city: "Sawangan", region: "Jawa Barat" },
    { city: "Sibolga", region: "Sumatera Utara" },
    { city: "Tanjung Balai", region: "Sumatera Utara" },
    { city: "Singaraja", region: "Bali" },
    { city: "Martapura", region: "Kalimantan Selatan" },
    { city: "Kuta", region: "Bali" },
    { city: "Meulaboh", region: "Aceh" },
    { city: "Sabang", region: "Aceh" },
    { city: "Tanjung Pandan", region: "Kepulauan Bangka Belitung" },
    { city: "Sumbawa Besar", region: "Nusa Tenggara Barat" },
    { city: "Raba", region: "Nusa Tenggara Barat" },
    { city: "Waingapu", region: "Nusa Tenggara Timur" },
    { city: "Maumere", region: "Nusa Tenggara Timur" },
    { city: "Ende", region: "Nusa Tenggara Timur" },
    { city: "Labuhan Bajo", region: "Nusa Tenggara Timur" },
    { city: "Ruteng", region: "Nusa Tenggara Timur" },
    { city: "Bau-Bau", region: "Sulawesi Tenggara" },
    { city: "Buton", region: "Sulawesi Tenggara" },
    { city: "Kendari", region: "Sulawesi Tenggara" },
    { city: "Parepare", region: "Sulawesi Selatan" },
    { city: "Palopo", region: "Sulawesi Selatan" },
    { city: "Masohi", region: "Maluku" },
    { city: "Dobo", region: "Maluku" },
    { city: "Tual", region: "Maluku" },
    { city: "Soe", region: "Nusa Tenggara Timur" },
    { city: "Kefamenanu", region: "Nusa Tenggara Timur" },
    { city: "Atambua", region: "Nusa Tenggara Timur" },
    { city: "Kalabahi", region: "Nusa Tenggara Timur" },
    { city: "Merauke", region: "Papua" },
    { city: "Wamena", region: "Papua" },
    { city: "Biak", region: "Papua" },
    { city: "Nabire", region: "Papua" },
    { city: "Timika", region: "Papua" },
    { city: "Agats", region: "Papua" },
    { city: "Manokwari", region: "Papua Barat" },
    { city: "Sorong", region: "Papua Barat" },
    { city: "Fakfak", region: "Papua Barat" },
    { city: "Kaimana", region: "Papua Barat" },
    { city: "Bintuni", region: "Papua Barat" },
    { city: "Tempuran", region: "Jawa Barat" }
  ];

  // Generate atau load user ID
  useEffect(() => {
    const initializeUser = async () => {
      let userId = localStorage.getItem('userId');
      if (!userId) {
        userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('userId', userId);
      }
      setCurrentUserId(userId);
      
      // Load location dari Firestore
      await loadLocationFromFirestore(userId);
    };

    initializeUser();
  }, []);

  // Animasi banner dengan GSAP
  useEffect(() => {
    if (showBanner && bannerRef.current) {
      const tl = gsap.timeline();
      
      // Animasi masuk banner dari atas
      tl.fromTo(bannerRef.current,
        { 
          y: -100,
          opacity: 0
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "back.out(1.7)"
        }
      );
    }
  }, [showBanner]);

  // Animasi search dengan GSAP
  useEffect(() => {
    if (searchRef.current) {
      if (showSearch) {
        // Animasi masuk search
        gsap.fromTo(searchRef.current,
          {
            scale: 0.8,
            opacity: 0,
            y: -20
          },
          {
            scale: 1,
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "back.out(1.7)"
          }
        );
        
        // Focus ke input setelah animasi
        setTimeout(() => {
          if (searchInputRef.current) {
            searchInputRef.current.focus();
          }
        }, 400);
      } else {
        // Animasi keluar search
        gsap.to(searchRef.current, {
          scale: 0.8,
          opacity: 0,
          y: -20,
          duration: 0.4,
          ease: "back.in(1.7)"
        });
      }
    }
  }, [showSearch]);

  // Handle keyboard shortcut untuk search (Ctrl+K atau Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        toggleSearch();
      }
      
      if (e.key === 'Escape' && showSearch) {
        setShowSearch(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showSearch]);

  // Fungsi untuk toggle search
  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (!showSearch) {
      setSearchQuery("");
      setSearchStatus("idle");
    }
  };

  // Fungsi untuk handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.length === 0) {
      setSearchStatus("idle");
    } else if (value.length < 2) {
      setSearchStatus("searching");
    } else {
      // Simulasi pencarian
      setSearchStatus("searching");
      setTimeout(() => {
        const hasResults = Math.random() > 0.5; // Simulasi hasil
        setSearchStatus(hasResults ? "results" : "empty");
      }, 800);
    }
  };

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
      tl.to(textArray[5], { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)" }, "+=0.2");
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
      delay: 0.1 
    },
    { 
      name: "(02) WORK", 
      delay: 0.2 
    },
    { 
      name: "(03) ABOUT", 
      delay: 0.3 
    },
    { 
      name: "(04) CONTACT", 
      delay: 0.4 
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
              backgroundColor: '#CCFF00',
              padding: '0.8rem 2rem',
              zIndex: 45,
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
            transition={{ duration: 0.6, ease: "back.out(1.7)" }}
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
                color: 'black'
              }}
            >
              <span>WEBSITE NOTE SEDANG DALAM PERSIAPAN -</span>
              <motion.span
                onClick={handleBannerClick}
                style={{
                  color: 'black',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
                whileHover={{ color: '#333' }}
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
                background: 'rgba(0,0,0,0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '14px',
                color: 'black'
              }}
              whileHover={{ 
                backgroundColor: 'rgba(0,0,0,0.2)',
                scale: 1.1
              }}
              whileTap={{ scale: 0.9 }}
            >
              ×
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Screen */}
      <AnimatePresence>
        {showLoading && (
          <motion.div
            ref={loadingRef}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'black',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 50,
              fontFamily: 'Arame Mono, monospace'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div ref={textScrollRef} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
              overflow: 'hidden',
              height: '60px'
            }}>
              <div style={{ fontSize: '1.2rem', color: '#CCFF00', fontWeight: 'bold' }}>WELCOME TO THE FUTURE</div>
              <div style={{ fontSize: '1.2rem', color: '#CCFF00', fontWeight: 'bold' }}>INNOVATION AT ITS PEAK</div>
              <div style={{ fontSize: '1.2rem', color: '#CCFF00', fontWeight: 'bold' }}>DESIGN MEETS FUNCTION</div>
              <div style={{ fontSize: '1.2rem', color: '#CCFF00', fontWeight: 'bold' }}>TECHNOLOGY REDEFINED</div>
              <div style={{ fontSize: '1.2rem', color: '#CCFF00', fontWeight: 'bold' }}>CREATING TOMORROW</div>
              <div style={{ fontSize: '2rem', color: '#CCFF00', fontWeight: 'bold' }}>NOTED</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      {!showLoading && (
        <div style={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          padding: showBanner ? '4rem 2rem 2rem 2rem' : '2rem',
          boxSizing: 'border-box'
        }}>

          {/* Search Component */}
          <AnimatePresence>
            {showSearch && (
              <motion.div
                ref={searchRef}
                style={{
                  position: 'fixed',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '90%',
                  maxWidth: '600px',
                  backgroundColor: 'rgba(20, 20, 20, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(204, 255, 0, 0.3)',
                  borderRadius: '16px',
                  padding: '2rem',
                  zIndex: 60,
                  boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
                }}
                initial={{ scale: 0.8, opacity: 0, y: -20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: -20 }}
              >
                {/* Search Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    <motion.div
                      animate={{ rotate: [0, 10, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#CCFF00" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="m21 21-4.3-4.3"/>
                      </svg>
                    </motion.div>
                    <h3 style={{
                      color: '#CCFF00',
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      margin: 0
                    }}>
                      SEARCH
                    </h3>
                  </div>
                  
                  {/* Close Button */}
                  <motion.button
                    onClick={toggleSearch}
                    style={{
                      background: 'rgba(204, 255, 0, 0.1)',
                      border: '1px solid rgba(204, 255, 0, 0.3)',
                      borderRadius: '8px',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: '#CCFF00',
                      fontSize: '16px'
                    }}
                    whileHover={{ 
                      backgroundColor: 'rgba(204, 255, 0, 0.2)',
                      scale: 1.1
                    }}
                    whileTap={{ scale: 0.9 }}
                  >
                    ×
                  </motion.button>
                </div>

                {/* Search Input */}
                <div style={{
                  position: 'relative',
                  marginBottom: '1.5rem'
                }}>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={handleSearch}
                    placeholder="Type to search..."
                    style={{
                      width: '100%',
                      padding: '1rem 1rem 1rem 3rem',
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      border: `1px solid ${
                        searchStatus === 'empty' ? '#ff4444' : 
                        searchStatus === 'results' ? '#00ff88' : 
                        'rgba(204, 255, 0, 0.3)'
                      }`,
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '1rem',
                      fontFamily: 'Arame Mono, monospace',
                      outline: 'none',
                      transition: 'all 0.3s ease'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#CCFF00'
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="m21 21-4.3-4.3"/>
                    </svg>
                  </div>
                  
                  {/* Keyboard Shortcut Badge */}
                  <div style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(204, 255, 0, 0.1)',
                    border: '1px solid rgba(204, 255, 0, 0.3)',
                    borderRadius: '6px',
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.75rem',
                    color: '#CCFF00',
                    fontFamily: 'Arame Mono, monospace'
                  }}>
                    Ctrl+K
                  </div>
                </div>

                {/* Search Status */}
                <AnimatePresence mode="wait">
                  {searchStatus !== 'idle' && (
                    <motion.div
                      style={{
                        padding: '1rem',
                        borderRadius: '8px',
                        backgroundColor: 
                          searchStatus === 'empty' ? 'rgba(255, 68, 68, 0.1)' :
                          searchStatus === 'results' ? 'rgba(0, 255, 136, 0.1)' :
                          searchStatus === 'updated' ? 'rgba(204, 255, 0, 0.1)' :
                          'rgba(204, 255, 0, 0.1)',
                        border: `1px solid ${
                          searchStatus === 'empty' ? 'rgba(255, 68, 68, 0.3)' :
                          searchStatus === 'results' ? 'rgba(0, 255, 136, 0.3)' :
                          searchStatus === 'updated' ? 'rgba(204, 255, 0, 0.3)' :
                          'rgba(204, 255, 0, 0.3)'
                        }`,
                        marginBottom: '1rem'
                      }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        color: 
                          searchStatus === 'empty' ? '#ff4444' :
                          searchStatus === 'results' ? '#00ff88' :
                          searchStatus === 'updated' ? '#CCFF00' :
                          '#CCFF00'
                      }}>
                        {/* Status Icon */}
                        {searchStatus === 'searching' && (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                            </svg>
                          </motion.div>
                        )}
                        
                        {searchStatus === 'empty' && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="15" y1="9" x2="9" y2="15"/>
                            <line x1="9" y1="9" x2="15" y2="15"/>
                          </svg>
                        )}
                        
                        {searchStatus === 'results' && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 6 9 17l-5-5"/>
                          </svg>
                        )}
                        
                        {searchStatus === 'updated' && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14,2 14,8 20,8"/>
                            <circle cx="12" cy="15" r="1"/>
                            <circle cx="16" cy="15" r="1"/>
                            <circle cx="8" cy="15" r="1"/>
                          </svg>
                        )}

                        {/* Status Text */}
                        <span style={{
                          fontSize: '0.9rem',
                          fontWeight: '500'
                        }}>
                          {searchStatus === 'searching' && 'Searching through database...'}
                          {searchStatus === 'empty' && 'No results found. Try different keywords.'}
                          {searchStatus === 'results' && 'Found matching results. Loading...'}
                          {searchStatus === 'updated' && 'Search index updated. Try searching again.'}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Search Suggestions */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '0.75rem',
                  marginTop: '1rem'
                }}>
                  {['notes', 'users', 'projects', 'settings'].map((suggestion) => (
                    <motion.button
                      key={suggestion}
                      onClick={() => setSearchQuery(suggestion)}
                      style={{
                        padding: '0.75rem 1rem',
                        backgroundColor: 'rgba(204, 255, 0, 0.05)',
                        border: '1px solid rgba(204, 255, 0, 0.1)',
                        borderRadius: '8px',
                        color: '#CCFF00',
                        fontSize: '0.85rem',
                        fontFamily: 'Arame Mono, monospace',
                        cursor: 'pointer',
                        textAlign: 'left',
                        textTransform: 'capitalize'
                      }}
                      whileHover={{
                        backgroundColor: 'rgba(204, 255, 0, 0.1)',
                        borderColor: 'rgba(204, 255, 0, 0.3)'
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {suggestion}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search Overlay */}
          <AnimatePresence>
            {showSearch && (
              <motion.div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  backdropFilter: 'blur(5px)',
                  zIndex: 55
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={toggleSearch}
              />
            )}
          </AnimatePresence>

          {/* Visitor Info */}
          <motion.div
            style={{
              position: 'absolute',
              top: showBanner ? '5rem' : '2rem',
              left: '2rem',
              color: '#CCFF00',
              fontFamily: 'Arame Mono, monospace',
              fontSize: '0.9rem',
              zIndex: 10
            }}
            initial="hidden"
            animate="visible"
            variants={timeVariants}
          >
            <div style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>
              VISITOR: {currentUserId ? `USER_${currentUserId.substring(5, 11)}` : 'LOADING...'}
            </div>
            <div style={{ marginBottom: '0.25rem' }}>{visitorTime.time} {visitorTime.timezone}</div>
            <div style={{ marginBottom: '0.5rem' }}>{visitorTime.date}</div>
            
            {/* Location Info */}
            {!isLoadingLocation && (
              <motion.div
                style={{
                  marginTop: '0.5rem',
                  padding: '0.5rem 0',
                  borderTop: '1px solid rgba(204, 255, 0, 0.3)'
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span>📍 {visitorLocation.city}, {visitorLocation.region}</span>
                  {visitorLocation.isManual && (
                    <motion.span
                      style={{
                        fontSize: '0.7rem',
                        backgroundColor: 'rgba(204, 255, 0, 0.2)',
                        padding: '0.1rem 0.4rem',
                        borderRadius: '4px'
                      }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      Manual
                    </motion.span>
                  )}
                </div>
                <motion.button
                  onClick={openLocationModal}
                  style={{
                    background: 'none',
                    border: '1px solid rgba(204, 255, 0, 0.3)',
                    color: '#CCFF00',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                    fontFamily: 'Arame Mono, monospace',
                    marginTop: '0.25rem'
                  }}
                  whileHover={{ backgroundColor: 'rgba(204, 255, 0, 0.1)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  Change Location
                </motion.button>
              </motion.div>
            )}
          </motion.div>

          {/* Search Button */}
          <motion.button
            onClick={toggleSearch}
            style={{
              position: 'absolute',
              top: showBanner ? '5rem' : '2rem',
              right: '2rem',
              background: 'rgba(204, 255, 0, 0.1)',
              border: '1px solid rgba(204, 255, 0, 0.3)',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              color: '#CCFF00',
              fontFamily: 'Arame Mono, monospace',
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              zIndex: 10
            }}
            whileHover={{
              backgroundColor: 'rgba(204, 255, 0, 0.2)',
              scale: 1.05
            }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.3-4.3"/>
            </svg>
            Search
            <span style={{
              fontSize: '0.7rem',
              backgroundColor: 'rgba(204, 255, 0, 0.2)',
              padding: '0.1rem 0.4rem',
              borderRadius: '4px'
            }}>
              Ctrl+K
            </span>
          </motion.button>

          {/* Main Title */}
          <motion.div
            style={{
              textAlign: 'center',
              marginBottom: '3rem'
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <h1 style={{
              fontSize: '4rem',
              fontWeight: 'bold',
              color: '#CCFF00',
              margin: 0,
              letterSpacing: '-0.02em',
              lineHeight: 1
            }}>
              NOTED
            </h1>
            <motion.p
              style={{
                fontSize: '1.2rem',
                color: '#CCFF00',
                opacity: 0.8,
                margin: '1rem 0 0 0',
                fontWeight: '300',
                letterSpacing: '0.1em'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ duration: 1, delay: 1 }}
            >
              DIGITAL NOTE-TAKING PLATFORM
            </motion.p>
          </motion.div>

          {/* Menu Button */}
          <motion.button
            variants={menuButtonVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            whileTap="tap"
            onClick={toggleMenu}
            onMouseEnter={handleMenuHover}
            onMouseLeave={handleMenuLeave}
            style={{
              position: 'absolute',
              bottom: '2rem',
              right: '2rem',
              background: 'rgba(204, 255, 0, 0.1)',
              border: '1px solid rgba(204, 255, 0, 0.3)',
              borderRadius: '50px',
              padding: '1rem 2rem',
              color: '#CCFF00',
              fontFamily: 'Arame Mono, monospace',
              fontSize: '1rem',
              cursor: 'pointer',
              zIndex: 20,
              backdropFilter: 'blur(10px)'
            }}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={menuText}
                variants={textVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                {menuText}
              </motion.span>
            </AnimatePresence>
          </motion.button>

          {/* Menu Overlay */}
          <AnimatePresence>
            {showMenu && (
              <>
                {/* Background Overlay */}
                <motion.div
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(5px)',
                    zIndex: 30
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={toggleMenu}
                />

                {/* Menu Content */}
                <motion.div
                  style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    width: '100%',
                    maxWidth: '500px',
                    height: '100%',
                    backgroundColor: 'rgba(10, 10, 10, 0.95)',
                    borderLeft: '1px solid rgba(204, 255, 0, 0.3)',
                    padding: '4rem 3rem',
                    zIndex: 40,
                    display: 'flex',
                    flexDirection: 'column',
                    backdropFilter: 'blur(20px)'
                  }}
                  variants={menuVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                >
                  {/* Close Button */}
                  <motion.button
                    variants={closeButtonVariants}
                    initial="closed"
                    animate="open"
                    exit="closed"
                    onClick={toggleMenu}
                    onMouseEnter={() => setIsCloseHovered(true)}
                    onMouseLeave={() => setIsCloseHovered(false)}
                    style={{
                      position: 'absolute',
                      top: '2rem',
                      right: '2rem',
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      border: '1px solid rgba(204, 255, 0, 0.3)',
                      backgroundColor: isCloseHovered ? 'rgba(204, 255, 0, 0.1)' : 'rgba(204, 255, 0, 0.05)',
                      color: '#CCFF00',
                      fontSize: '1.5rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease'
                    }}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    ×
                  </motion.button>

                  {/* Menu Items */}
                  <div style={{ marginTop: '3rem' }}>
                    {menuItems.map((item, index) => (
                      <motion.div
                        key={item.name}
                        custom={index}
                        variants={menuItemVariants}
                        initial="closed"
                        animate="open"
                        exit="closed"
                        onMouseEnter={() => setHoveredItem(item.name)}
                        onMouseLeave={() => setHoveredItem(null)}
                        style={{
                          marginBottom: '1.5rem',
                          cursor: 'pointer',
                          padding: '0.5rem 0',
                          borderBottom: '1px solid rgba(204, 255, 0, 0.1)'
                        }}
                        whileHover={{ x: 10 }}
                      >
                        <div style={{
                          fontSize: '1.5rem',
                          color: hoveredItem === item.name ? '#CCFF00' : 'rgba(204, 255, 0, 0.7)',
                          fontWeight: hoveredItem === item.name ? 'bold' : 'normal',
                          transition: 'all 0.3s ease'
                        }}>
                          {item.name}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Additional Options */}
                  <motion.div
                    style={{
                      marginTop: 'auto',
                      paddingTop: '2rem',
                      borderTop: '1px solid rgba(204, 255, 0, 0.2)'
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <motion.button
                      onClick={openAllUsersModal}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        backgroundColor: 'rgba(204, 255, 0, 0.05)',
                        border: '1px solid rgba(204, 255, 0, 0.2)',
                        borderRadius: '8px',
                        color: '#CCFF00',
                        fontFamily: 'Arame Mono, monospace',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        marginBottom: '1rem'
                      }}
                      whileHover={{ backgroundColor: 'rgba(204, 255, 0, 0.1)' }}
                      whileTap={{ scale: 0.98 }}
                    >
                      View All Users
                    </motion.button>
                    
                    <motion.button
                      onClick={navigateToNotes}
                      style={{
                        width: '100%',
                        padding: '1rem',
                        backgroundColor: 'rgba(204, 255, 0, 0.1)',
                        border: '1px solid rgba(204, 255, 0, 0.3)',
                        borderRadius: '8px',
                        color: '#CCFF00',
                        fontFamily: 'Arame Mono, monospace',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                      whileHover={{ backgroundColor: 'rgba(204, 255, 0, 0.2)' }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Go to Notes
                    </motion.button>
                  </motion.div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Location Modal */}
          <AnimatePresence>
            {showLocationModal && (
              <>
                <motion.div
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(5px)',
                    zIndex: 60
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowLocationModal(false)}
                />

                <motion.div
                  style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '90%',
                    maxWidth: '500px',
                    backgroundColor: 'rgba(20, 20, 20, 0.95)',
                    border: '1px solid rgba(204, 255, 0, 0.3)',
                    borderRadius: '16px',
                    padding: '2rem',
                    zIndex: 70,
                    backdropFilter: 'blur(20px)'
                  }}
                  initial={{ opacity: 0, scale: 0.8, y: -50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -50 }}
                >
                  <h3 style={{ color: '#CCFF00', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
                    Set Your Location
                  </h3>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', color: '#CCFF00', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                      City
                    </label>
                    <input
                      type="text"
                      value={tempLocation.city}
                      onChange={(e) => setTempLocation({ ...tempLocation, city: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        border: '1px solid rgba(204, 255, 0, 0.3)',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '1rem',
                        fontFamily: 'Arame Mono, monospace'
                      }}
                      placeholder="Start typing city name..."
                    />
                    
                    {/* City Suggestions */}
                    {tempLocation.city.length > 1 && (
                      <div style={{
                        maxHeight: '200px',
                        overflowY: 'auto',
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        border: '1px solid rgba(204, 255, 0, 0.2)',
                        borderRadius: '8px',
                        marginTop: '0.5rem'
                      }}>
                        {filteredCities.slice(0, 10).map((city, index) => (
                          <div
                            key={index}
                            onClick={() => setTempLocation({ city: city.city, region: city.region })}
                            style={{
                              padding: '0.75rem',
                              cursor: 'pointer',
                              borderBottom: '1px solid rgba(204, 255, 0, 0.1)',
                              color: 'white',
                              fontSize: '0.9rem'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(204, 255, 0, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            {city.city}, {city.region}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', color: '#CCFF00', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                      Region
                    </label>
                    <input
                      type="text"
                      value={tempLocation.region}
                      onChange={(e) => setTempLocation({ ...tempLocation, region: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        border: '1px solid rgba(204, 255, 0, 0.3)',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '1rem',
                        fontFamily: 'Arame Mono, monospace'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <motion.button
                      onClick={() => setShowLocationModal(false)}
                      style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: '8px',
                        color: 'white',
                        fontFamily: 'Arame Mono, monospace',
                        cursor: 'pointer'
                      }}
                      whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      onClick={saveManualLocation}
                      style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: 'rgba(204, 255, 0, 0.2)',
                        border: '1px solid rgba(204, 255, 0, 0.3)',
                        borderRadius: '8px',
                        color: '#CCFF00',
                        fontFamily: 'Arame Mono, monospace',
                        cursor: 'pointer'
                      }}
                      whileHover={{ backgroundColor: 'rgba(204, 255, 0, 0.3)' }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Save Location
                    </motion.button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* All Users Modal */}
          <AnimatePresence>
            {showAllUsers && (
              <>
                <motion.div
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    backdropFilter: 'blur(10px)',
                    zIndex: 80
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowAllUsers(false)}
                />

                <motion.div
                  style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '90%',
                    maxWidth: '800px',
                    maxHeight: '80vh',
                    backgroundColor: 'rgba(10, 10, 10, 0.95)',
                    border: '1px solid rgba(204, 255, 0, 0.3)',
                    borderRadius: '16px',
                    padding: '2rem',
                    zIndex: 90,
                    backdropFilter: 'blur(20px)',
                    overflow: 'auto'
                  }}
                  initial={{ opacity: 0, scale: 0.8, y: -50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -50 }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem'
                  }}>
                    <h3 style={{ color: '#CCFF00', fontSize: '1.5rem', margin: 0 }}>
                      All Users ({allUsersData.length})
                    </h3>
                    <motion.button
                      onClick={() => setShowAllUsers(false)}
                      style={{
                        background: 'rgba(204, 255, 0, 0.1)',
                        border: '1px solid rgba(204, 255, 0, 0.3)',
                        borderRadius: '8px',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#CCFF00',
                        fontSize: '18px'
                      }}
                      whileHover={{ backgroundColor: 'rgba(204, 255, 0, 0.2)', scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      ×
                    </motion.button>
                  </div>

                  {isLoadingAllUsers ? (
                    <div style={{ textAlign: 'center', color: '#CCFF00', padding: '2rem' }}>
                      Loading users data...
                    </div>
                  ) : (
                    <div style={{
                      display: 'grid',
                      gap: '1rem'
                    }}>
                      {allUsersData.map((user, index) => (
                        <motion.div
                          key={user.id}
                          style={{
                            padding: '1rem',
                            backgroundColor: 'rgba(204, 255, 0, 0.05)',
                            border: '1px solid rgba(204, 255, 0, 0.1)',
                            borderRadius: '8px',
                            color: '#CCFF00'
                          }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ backgroundColor: 'rgba(204, 255, 0, 0.1)' }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>
                                USER_{user.id.substring(5, 11)}
                              </div>
                              <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                                {user.city}, {user.region}
                              </div>
                            </div>
                            <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>
                              {user.lastUpdated ? new Date(user.lastUpdated).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              }) : 'Unknown'}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
[file content end]
