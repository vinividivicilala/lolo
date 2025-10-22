'use client';

import SignInPage from '../components/auth/signin-page';
import SignUpPage from '../components/auth/signup-page';
import ForgotPasswordPage from '../components/auth/forgot-password-page';
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
  
  // State untuk navbar dropdown
  const [showNavDropdown, setShowNavDropdown] = useState(false);
  const [navDropdownType, setNavDropdownType] = useState<"home" | "topics" | null>(null);
  
  // State untuk search
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchStatus, setSearchStatus] = useState<"empty" | "recent" | "updated" | "loading">("empty");

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
  
  // Refs untuk dropdown
  const dropdownRef = useRef<HTMLDivElement>(null);

  // PERBAIKAN: Sistem z-index terorganisir - FIXED
  const zIndexes = {
    base: 10,        // Element biasa
    navbar: 50,      // Semua elemen navbar
    banner: 100,     // Banner
    dropdown: 150,   // Dropdown navbar
    search: 200,     // Search overlay
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
            ease: "back.out(1.7)"
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

  // Fungsi untuk toggle navbar dropdown
  const toggleNavDropdown = (type: "home" | "topics") => {
    if (showNavDropdown && navDropdownType === type) {
      setShowNavDropdown(false);
      setNavDropdownType(null);
    } else {
      setShowNavDropdown(true);
      setNavDropdownType(type);
    }
  };

  // Fungsi untuk menutup dropdown
  const closeNavDropdown = () => {
    setShowNavDropdown(false);
    setNavDropdownType(null);
  };

  // Effect untuk menutup dropdown ketika klik di luar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeNavDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  // Menu items yang disederhanakan - HAPUS HOME DAN TOPICS
  const menuItems = [
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
      {/* Search Component - PERBAIKAN z-index */}
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
            transition={{ duration: 0.5, ease: "back.out(1.7)" }}
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
                SEARCH
              </h3>
              <motion.button
                onClick={closeSearch}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '4px'
                }}
                whileHover={{ 
                  color: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }}
                transition={{ duration: 0.2 }}
              >
                ✕
              </motion.button>
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearchSubmit}>
              <motion.input
                ref={searchInputRef}
                type="text"
                placeholder="Type to search..."
                value={searchQuery}
                onChange={handleSearchChange}
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '1rem 1.5rem',
                  color: 'white',
                  fontSize: '1.1rem',
                  fontFamily: 'Arame Mono, monospace',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                whileFocus={{
                  borderColor: 'rgba(204, 255, 0, 0.5)',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)'
                }}
              />
            </form>

            {/* Search Status */}
            <AnimatePresence mode="wait">
              {searchStatus !== "empty" && (
                <motion.div
                  ref={searchStatusRef}
                  style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.05)'
                  }}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <p style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.9rem',
                    margin: 0,
                    fontFamily: 'Arame Mono, monospace'
                  }}>
                    {searchStatus === "loading" && "Searching..."}
                    {searchStatus === "recent" && "Recent searches will appear here"}
                    {searchStatus === "updated" && `Search results for "${searchQuery}"`}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Search Tips */}
            <div style={{
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <p style={{
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '0.8rem',
                margin: 0,
                fontFamily: 'Arame Mono, monospace'
              }}>
                Press <span style={{ color: 'rgba(204, 255, 0, 0.8)' }}>ESC</span> to close • 
                Press <span style={{ color: 'rgba(204, 255, 0, 0.8)' }}>⌘K</span> or <span style={{ color: 'rgba(204, 255, 0, 0.8)' }}>Ctrl+K</span> to open
              </p>
            </div>
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
              zIndex: zIndexes.loading,
              color: 'white',
              fontFamily: 'Arame Mono, monospace'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div ref={textScrollRef} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              overflow: 'hidden',
              height: '60px'
            }}>
              <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>WELCOME TO</div>
              <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>NOTED</div>
              <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>YOUR ULTIMATE</div>
              <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>NOTE-TAKING</div>
              <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>COMPANION</div>
              <div style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold',
                color: '#CCFF00',
                marginTop: '1rem'
              }}>
                NOTED
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      {!showLoading && (
        <div style={{
          width: '100%',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}>
          {/* Banner */}
          <AnimatePresence>
            {showBanner && (
              <motion.div
                ref={bannerRef}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  backgroundColor: '#CCFF00',
                  color: 'black',
                  padding: '1rem 2rem',
                  textAlign: 'center',
                  zIndex: zIndexes.banner,
                  cursor: isBannerHovered ? 'pointer' : 'default',
                  fontFamily: 'Arame Mono, monospace',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -100, opacity: 0 }}
                transition={{ duration: 0.8, ease: "back.out(1.7)" }}
                onMouseEnter={() => setIsBannerHovered(true)}
                onMouseLeave={() => setIsBannerHovered(false)}
                onClick={handleBannerClick}
              >
                <span style={{ flex: 1, textAlign: 'center' }}>
                  🚀 CREATE YOUR FIRST NOTE - CLICK HERE TO GET STARTED
                </span>
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeBanner();
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'black',
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    marginLeft: '1rem'
                  }}
                  whileHover={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    scale: 1.1
                  }}
                  transition={{ duration: 0.2 }}
                >
                  ✕
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navbar */}
          <nav style={{
            position: 'fixed',
            top: showBanner ? '60px' : '0',
            left: 0,
            right: 0,
            padding: '1rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: zIndexes.navbar,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            {/* Left Section - Logo */}
            <motion.div
              style={{
                color: 'white',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                fontFamily: 'Arame Mono, monospace'
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              NOTED
            </motion.div>

            {/* Center Section - Navigation Links */}
            <div style={{
              display: 'flex',
              gap: '3rem',
              alignItems: 'center'
            }}>
              {/* Home Dropdown */}
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <motion.button
                  onClick={() => toggleNavDropdown("home")}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontFamily: 'Arame Mono, monospace',
                    cursor: 'pointer',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    backgroundColor: showNavDropdown && navDropdownType === "home" ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
                  }}
                  whileHover={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#CCFF00'
                  }}
                  transition={{ duration: 0.3 }}
                >
                  HOME
                </motion.button>

                {/* Home Dropdown Menu */}
                <AnimatePresence>
                  {showNavDropdown && navDropdownType === "home" && (
                    <motion.div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.95)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        padding: '0.5rem 0',
                        minWidth: '200px',
                        zIndex: zIndexes.dropdown,
                        backdropFilter: 'blur(10px)',
                        marginTop: '0.5rem'
                      }}
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      <motion.button
                        style={{
                          width: '100%',
                          background: 'none',
                          border: 'none',
                          color: 'white',
                          fontSize: '0.9rem',
                          fontFamily: 'Arame Mono, monospace',
                          textAlign: 'left',
                          padding: '0.75rem 1.5rem',
                          cursor: 'pointer'
                        }}
                        whileHover={{
                          backgroundColor: 'rgba(204, 255, 0, 0.1)',
                          color: '#CCFF00'
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        HOME
                      </motion.button>
                      <motion.button
                        style={{
                          width: '100%',
                          background: 'none',
                          border: 'none',
                          color: 'white',
                          fontSize: '0.9rem',
                          fontFamily: 'Arame Mono, monospace',
                          textAlign: 'left',
                          padding: '0.75rem 1.5rem',
                          cursor: 'pointer'
                        }}
                        whileHover={{
                          backgroundColor: 'rgba(204, 255, 0, 0.1)',
                          color: '#CCFF00'
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        TOPICS
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Topics Dropdown */}
              <div style={{ position: 'relative' }}>
                <motion.button
                  onClick={() => toggleNavDropdown("topics")}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    fontSize: '0.9rem',
                    fontFamily: 'Arame Mono, monospace',
                    cursor: 'pointer',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    backgroundColor: showNavDropdown && navDropdownType === "topics" ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
                  }}
                  whileHover={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#CCFF00'
                  }}
                  transition={{ duration: 0.3 }}
                >
                  TOPICS
                </motion.button>

                {/* Topics Dropdown Menu */}
                <AnimatePresence>
                  {showNavDropdown && navDropdownType === "topics" && (
                    <motion.div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.95)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        padding: '0.5rem 0',
                        minWidth: '200px',
                        zIndex: zIndexes.dropdown,
                        backdropFilter: 'blur(10px)',
                        marginTop: '0.5rem'
                      }}
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      <motion.button
                        style={{
                          width: '100%',
                          background: 'none',
                          border: 'none',
                          color: 'white',
                          fontSize: '0.9rem',
                          fontFamily: 'Arame Mono, monospace',
                          textAlign: 'left',
                          padding: '0.75rem 1.5rem',
                          cursor: 'pointer'
                        }}
                        whileHover={{
                          backgroundColor: 'rgba(204, 255, 0, 0.1)',
                          color: '#CCFF00'
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        TECHNOLOGY
                      </motion.button>
                      <motion.button
                        style={{
                          width: '100%',
                          background: 'none',
                          border: 'none',
                          color: 'white',
                          fontSize: '0.9rem',
                          fontFamily: 'Arame Mono, monospace',
                          textAlign: 'left',
                          padding: '0.75rem 1.5rem',
                          cursor: 'pointer'
                        }}
                        whileHover={{
                          backgroundColor: 'rgba(204, 255, 0, 0.1)',
                          color: '#CCFF00'
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        DESIGN
                      </motion.button>
                      <motion.button
                        style={{
                          width: '100%',
                          background: 'none',
                          border: 'none',
                          color: 'white',
                          fontSize: '0.9rem',
                          fontFamily: 'Arame Mono, monospace',
                          textAlign: 'left',
                          padding: '0.75rem 1.5rem',
                          cursor: 'pointer'
                        }}
                        whileHover={{
                          backgroundColor: 'rgba(204, 255, 0, 0.1)',
                          color: '#CCFF00'
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        BUSINESS
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Regular Links */}
              <motion.button
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  fontSize: '0.9rem',
                  fontFamily: 'Arame Mono, monospace',
                  cursor: 'pointer',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px'
                }}
                whileHover={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#CCFF00'
                }}
                transition={{ duration: 0.3 }}
              >
                NOTES
              </motion.button>
              <motion.button
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  fontSize: '0.9rem',
                  fontFamily: 'Arame Mono, monospace',
                  cursor: 'pointer',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px'
                }}
                whileHover={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#CCFF00'
                }}
                transition={{ duration: 0.3 }}
              >
                ABOUT
              </motion.button>
            </div>

            {/* Right Section - Search & Menu */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              alignItems: 'center'
            }}>
              {/* Search Button */}
              <motion.button
                onClick={toggleSearch}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  fontSize: '0.9rem',
                  fontFamily: 'Arame Mono, monospace',
                  cursor: 'pointer',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px'
                }}
                whileHover={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#CCFF00'
                }}
                transition={{ duration: 0.3 }}
              >
                SEARCH
              </motion.button>

              {/* Menu Button */}
              <motion.button
                onClick={toggleMenu}
                onMouseEnter={handleMenuHover}
                onMouseLeave={handleMenuLeave}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  fontSize: '0.9rem',
                  fontFamily: 'Arame Mono, monospace',
                  cursor: 'pointer',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(204, 255, 0, 0.1)',
                  border: '1px solid rgba(204, 255, 0, 0.3)'
                }}
                variants={menuButtonVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                whileTap="tap"
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
            </div>
          </nav>

          {/* Main Content Area */}
          <div style={{
            marginTop: showBanner ? '120px' : '60px',
            padding: '2rem',
            width: '100%',
            minHeight: 'calc(100vh - 120px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* Visitor Info */}
            <motion.div
              style={{
                color: 'white',
                textAlign: 'center',
                marginBottom: '3rem'
              }}
              initial="hidden"
              animate="visible"
              variants={timeVariants}
            >
              <div style={{
                fontSize: '1.2rem',
                fontWeight: 'bold',
                marginBottom: '0.5rem',
                color: '#CCFF00'
              }}>
                {visitorTime.time} {visitorTime.timezone}
              </div>
              <div style={{
                fontSize: '0.9rem',
                color: 'rgba(255, 255, 255, 0.7)',
                marginBottom: '1rem'
              }}>
                {visitorTime.date}
              </div>
              <div style={{
                fontSize: '0.8rem',
                color: 'rgba(255, 255, 255, 0.5)'
              }}>
                {visitorLocation.city}, {visitorLocation.region}, {visitorLocation.country}
                {visitorLocation.isManual && ' • Manual'}
              </div>
            </motion.div>

            {/* Main Title */}
            <motion.h1
              style={{
                color: 'white',
                fontSize: '4rem',
                fontWeight: 'bold',
                textAlign: 'center',
                marginBottom: '1rem',
                fontFamily: 'Arame Mono, monospace'
              }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              NOTED
            </motion.h1>

            <motion.p
              style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '1.2rem',
                textAlign: 'center',
                maxWidth: '600px',
                marginBottom: '3rem',
                fontFamily: 'Arame Mono, monospace'
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              Your ultimate note-taking companion for organized thoughts and ideas.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '3rem'
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <motion.button
                onClick={navigateToNotes}
                style={{
                  backgroundColor: '#CCFF00',
                  color: 'black',
                  border: 'none',
                  padding: '1rem 2rem',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  fontFamily: 'Arame Mono, monospace',
                  cursor: 'pointer'
                }}
                whileHover={{
                  scale: 1.05,
                  backgroundColor: '#E8FF66'
                }}
                whileTap={{
                  scale: 0.95
                }}
                transition={{ duration: 0.3 }}
              >
                GET STARTED
              </motion.button>

              <motion.button
                onClick={openLocationModal}
                style={{
                  backgroundColor: 'transparent',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  padding: '1rem 2rem',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  fontFamily: 'Arame Mono, monospace',
                  cursor: 'pointer'
                }}
                whileHover={{
                  scale: 1.05,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }}
                whileTap={{
                  scale: 0.95
                }}
                transition={{ duration: 0.3 }}
              >
                SET LOCATION
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div
              style={{
                display: 'flex',
                gap: '3rem',
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.9rem'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#CCFF00' }}>10K+</div>
                <div>ACTIVE USERS</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#CCFF00' }}>50K+</div>
                <div>NOTES CREATED</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#CCFF00' }}>99%</div>
                <div>SATISFACTION</div>
              </div>
            </motion.div>
          </div>

          {/* Menu Overlay - PERBAIKAN: z-index menu harus paling tinggi */}
          <AnimatePresence>
            {showMenu && (
              <motion.div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'black',
                  zIndex: zIndexes.menu,
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '2rem'
                }}
                variants={menuVariants}
                initial="closed"
                animate="open"
                exit="closed"
              >
                {/* Close Button */}
                <motion.button
                  onClick={toggleMenu}
                  onMouseEnter={() => setIsCloseHovered(true)}
                  onMouseLeave={() => setIsCloseHovered(false)}
                  style={{
                    position: 'absolute',
                    top: '2rem',
                    right: '2rem',
                    background: 'none',
                    border: 'none',
                    color: isCloseHovered ? '#CCFF00' : 'white',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    borderRadius: '4px'
                  }}
                  variants={closeButtonVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                  whileHover={{
                    scale: 1.1,
                    rotate: 90
                  }}
                  whileTap={{
                    scale: 0.9
                  }}
                >
                  CLOSE
                </motion.button>

                {/* Menu Items */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  height: '100%',
                  gap: '1.5rem',
                  marginLeft: '4rem'
                }}>
                  {menuItems.map((item, index) => (
                    <motion.button
                      key={item.name}
                      onClick={item.action}
                      onMouseEnter={() => setHoveredItem(item.name)}
                      onMouseLeave={() => setHoveredItem(null)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: hoveredItem === item.name ? '#CCFF00' : 'white',
                        fontSize: '3rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontFamily: 'Arame Mono, monospace',
                        textAlign: 'left',
                        padding: '0.5rem 0'
                      }}
                      variants={menuItemVariants}
                      initial="closed"
                      animate="open"
                      exit="closed"
                      custom={index}
                      whileHover={{
                        x: 20,
                        transition: { duration: 0.3 }
                      }}
                    >
                      {item.name}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Location Modal */}
          <AnimatePresence>
            {showLocationModal && (
              <motion.div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
                    backgroundColor: 'rgba(20, 20, 20, 0.95)',
                    padding: '2rem',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    maxWidth: '500px',
                    width: '100%',
                    backdropFilter: 'blur(10px)'
                  }}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.5, ease: "back.out(1.7)" }}
                >
                  <h3 style={{
                    color: 'white',
                    fontSize: '1.5rem',
                    marginBottom: '1rem',
                    fontFamily: 'Arame Mono, monospace'
                  }}>
                    SET YOUR LOCATION
                  </h3>
                  
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '0.9rem',
                      marginBottom: '0.5rem',
                      display: 'block',
                      fontFamily: 'Arame Mono, monospace'
                    }}>
                      City
                    </label>
                    <input
                      type="text"
                      value={tempLocation.city}
                      onChange={(e) => setTempLocation(prev => ({ ...prev, city: e.target.value }))}
                      style={{
                        width: '100%',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '6px',
                        padding: '0.75rem',
                        color: 'white',
                        fontSize: '1rem',
                        fontFamily: 'Arame Mono, monospace',
                        outline: 'none'
                      }}
                      placeholder="Type your city..."
                    />
                  </div>

                  <div style={{ marginBottom: '2rem' }}>
                    <label style={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '0.9rem',
                      marginBottom: '0.5rem',
                      display: 'block',
                      fontFamily: 'Arame Mono, monospace'
                    }}>
                      Region
                    </label>
                    <select
                      value={tempLocation.region}
                      onChange={(e) => setTempLocation(prev => ({ ...prev, region: e.target.value }))}
                      style={{
                        width: '100%',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '6px',
                        padding: '0.75rem',
                        color: 'white',
                        fontSize: '1rem',
                        fontFamily: 'Arame Mono, monospace',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="">Select region</option>
                      {Array.from(new Set(indonesiaCities.map(city => city.region))).map(region => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                  </div>

                  {/* City Suggestions */}
                  {tempLocation.city.length > 0 && (
                    <div style={{
                      maxHeight: '200px',
                      overflowY: 'auto',
                      marginBottom: '1.5rem',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '6px'
                    }}>
                      {filteredCities.slice(0, 10).map((city, index) => (
                        <div
                          key={index}
                          onClick={() => setTempLocation({ city: city.city, region: city.region })}
                          style={{
                            padding: '0.75rem',
                            cursor: 'pointer',
                            color: 'white',
                            fontFamily: 'Arame Mono, monospace',
                            fontSize: '0.9rem',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                            backgroundColor: tempLocation.city === city.city && tempLocation.region === city.region 
                              ? 'rgba(204, 255, 0, 0.1)' 
                              : 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 
                              tempLocation.city === city.city && tempLocation.region === city.region 
                                ? 'rgba(204, 255, 0, 0.1)' 
                                : 'transparent';
                          }}
                        >
                          {city.city}, {city.region}
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'flex-end'
                  }}>
                    <motion.button
                      onClick={() => setShowLocationModal(false)}
                      style={{
                        backgroundColor: 'transparent',
                        color: 'white',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        fontFamily: 'Arame Mono, monospace',
                        cursor: 'pointer'
                      }}
                      whileHover={{
                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      CANCEL
                    </motion.button>
                    <motion.button
                      onClick={saveManualLocation}
                      disabled={!tempLocation.city || !tempLocation.region}
                      style={{
                        backgroundColor: tempLocation.city && tempLocation.region ? '#CCFF00' : 'rgba(255, 255, 255, 0.1)',
                        color: tempLocation.city && tempLocation.region ? 'black' : 'rgba(255, 255, 255, 0.3)',
                        border: 'none',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        fontFamily: 'Arame Mono, monospace',
                        cursor: tempLocation.city && tempLocation.region ? 'pointer' : 'not-allowed'
                      }}
                      whileHover={tempLocation.city && tempLocation.region ? {
                        backgroundColor: '#E8FF66'
                      } : {}}
                      transition={{ duration: 0.2 }}
                    >
                      SAVE LOCATION
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* All Users Modal */}
          <AnimatePresence>
            {showAllUsers && (
              <motion.div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
                    backgroundColor: 'rgba(20, 20, 20, 0.95)',
                    padding: '2rem',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    maxWidth: '800px',
                    width: '100%',
                    maxHeight: '80vh',
                    overflowY: 'auto',
                    backdropFilter: 'blur(10px)'
                  }}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.5, ease: "back.out(1.7)" }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem'
                  }}>
                    <h3 style={{
                      color: 'white',
                      fontSize: '1.5rem',
                      fontFamily: 'Arame Mono, monospace'
                    }}>
                      ALL USERS ({allUsersData.length})
                    </h3>
                    <motion.button
                      onClick={() => setShowAllUsers(false)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        borderRadius: '4px'
                      }}
                      whileHover={{
                        color: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      ✕
                    </motion.button>
                  </div>

                  {isLoadingAllUsers ? (
                    <div style={{
                      color: 'white',
                      textAlign: 'center',
                      padding: '2rem',
                      fontFamily: 'Arame Mono, monospace'
                    }}>
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
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            padding: '1rem',
                            borderRadius: '8px',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                          }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <div style={{
                            color: 'white',
                            fontFamily: 'Arame Mono, monospace',
                            fontSize: '0.9rem'
                          }}>
                            <div style={{ marginBottom: '0.5rem' }}>
                              <strong>User ID:</strong> {user.id.substring(0, 8)}...
                            </div>
                            <div style={{ marginBottom: '0.5rem' }}>
                              <strong>Location:</strong> {user.city}, {user.region}, {user.country}
                            </div>
                            <div style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                              <strong>Last Updated:</strong> {user.lastUpdated ? new Date(user.lastUpdated).toLocaleString() : 'Unknown'}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
