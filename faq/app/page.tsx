
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
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L3 7V21H21V7L12 2Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 12L11 14L15 10" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.div>
            
            {/* Text */}
            <motion.div
              style={{
                color: 'black',
                fontSize: '0.9rem',
                fontWeight: '500',
                letterSpacing: '-0.02em'
              }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              New features available! Check out the latest updates.
            </motion.div>
            
            {/* Button */}
            <motion.button
              onClick={handleBannerClick}
              style={{
                background: 'black',
                color: '#CCFF00',
                border: 'none',
                padding: '0.4rem 1rem',
                borderRadius: '4px',
                fontSize: '0.8rem',
                fontWeight: '500',
                cursor: 'pointer',
                fontFamily: 'Arame Mono, monospace',
                letterSpacing: '-0.02em',
                marginLeft: 'auto'
              }}
              whileHover={{
                scale: 1.05,
                backgroundColor: '#333'
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              Explore Now
            </motion.button>
            
            {/* Close Button */}
            <motion.button
              onClick={closeBanner}
              style={{
                background: 'none',
                border: 'none',
                color: 'black',
                cursor: 'pointer',
                padding: '0.2rem',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              whileHover={{
                scale: 1.1,
                backgroundColor: 'rgba(0,0,0,0.1)'
              }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
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
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 50,
              color: 'white',
              flexDirection: 'column'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div ref={textScrollRef} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              overflow: 'hidden',
              height: '60px'
            }}>
              <div style={{ fontSize: '1rem', fontWeight: '300', letterSpacing: '0.2em' }}>WELCOME TO</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '400', letterSpacing: '0.15em' }}>DIGITAL SPACE</div>
              <div style={{ fontSize: '1.2rem', fontWeight: '500', letterSpacing: '0.1em' }}>CREATIVE STUDIO</div>
              <div style={{ fontSize: '1.3rem', fontWeight: '600', letterSpacing: '0.05em' }}>INNOVATION HUB</div>
              <div style={{ fontSize: '1.4rem', fontWeight: '700', letterSpacing: '0em' }}>FUTURE LAB</div>
              <div style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.02em' }}>NOTED</div>
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
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: showBanner ? '4rem 2rem 2rem 2rem' : '2rem',
          boxSizing: 'border-box',
          position: 'relative'
        }}>
          {/* Top Bar - Time and Location */}
          <div style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            position: 'relative',
            zIndex: 10
          }}>
            {/* Visitor Time */}
            <motion.div
              style={{
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem'
              }}
              initial="hidden"
              animate="visible"
              variants={timeVariants}
            >
              <div style={{ fontSize: '1.8rem', fontWeight: '500', letterSpacing: '-0.02em' }}>
                {visitorTime.time}
              </div>
              <div style={{ 
                fontSize: '0.9rem', 
                fontWeight: '300', 
                opacity: 0.7,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span>{visitorTime.timezone}</span>
                <span>•</span>
                <span>{visitorTime.date}</span>
              </div>
            </motion.div>

            {/* Visitor Location */}
            <motion.div
              style={{
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '0.25rem',
                cursor: 'pointer'
              }}
              initial="hidden"
              animate="visible"
              variants={timeVariants}
              whileHover={{ opacity: 0.7 }}
              onClick={openLocationModal}
            >
              <div style={{ fontSize: '1rem', fontWeight: '400', letterSpacing: '-0.01em' }}>
                {visitorLocation.city}
              </div>
              <div style={{ 
                fontSize: '0.85rem', 
                fontWeight: '300', 
                opacity: 0.7,
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                <span>{visitorLocation.region}</span>
                <span>•</span>
                <span>{visitorLocation.country}</span>
                {visitorLocation.isManual && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{ fontSize: '0.7rem', opacity: 0.5 }}
                  >
                    (Manual)
                  </motion.span>
                )}
              </div>
            </motion.div>
          </div>

          {/* Center Content - Title */}
          <motion.div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
              textAlign: 'center',
              position: 'relative',
              zIndex: 10
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.h1
              style={{
                color: 'white',
                fontSize: 'clamp(3rem, 8vw, 8rem)',
                fontWeight: '800',
                letterSpacing: '-0.03em',
                lineHeight: '0.9',
                margin: 0
              }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              NOTED
            </motion.h1>
            <motion.p
              style={{
                color: 'rgba(255,255,255,0.6)',
                fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)',
                fontWeight: '300',
                letterSpacing: '0.1em',
                maxWidth: '500px',
                lineHeight: '1.4'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Digital innovation and creative solutions
            </motion.p>
          </motion.div>

          {/* Bottom Bar - Menu Button and Navigation */}
          <div style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            position: 'relative',
            zIndex: 10
          }}>
            {/* Left Side - Empty for balance */}
            <div style={{ width: '120px' }}></div>

            {/* Center - Navigation Buttons */}
            <motion.div
              style={{
                display: 'flex',
                gap: '2rem',
                alignItems: 'center'
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <motion.button
                onClick={navigateToNotes}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  fontSize: '0.9rem',
                  fontWeight: '400',
                  letterSpacing: '0.1em',
                  cursor: 'pointer',
                  padding: '0.5rem 1rem',
                  position: 'relative',
                  fontFamily: 'Arame Mono, monospace'
                }}
                whileHover={{
                  color: '#CCFF00'
                }}
                whileTap={{ scale: 0.95 }}
              >
                ENTER NOTED
                <motion.div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    width: '0%',
                    height: '1px',
                    backgroundColor: '#CCFF00'
                  }}
                  whileHover={{
                    width: '100%',
                    left: '0%'
                  }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>

              <motion.button
                onClick={openAllUsersModal}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  fontSize: '0.9rem',
                  fontWeight: '400',
                  letterSpacing: '0.1em',
                  cursor: 'pointer',
                  padding: '0.5rem 1rem',
                  position: 'relative',
                  fontFamily: 'Arame Mono, monospace'
                }}
                whileHover={{
                  color: '#CCFF00'
                }}
                whileTap={{ scale: 0.95 }}
              >
                VIEW USERS
                <motion.div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    width: '0%',
                    height: '1px',
                    backgroundColor: '#CCFF00'
                  }}
                  whileHover={{
                    width: '100%',
                    left: '0%'
                  }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </motion.div>

            {/* Right Side - Menu Button */}
            <motion.button
              ref={marqueeRef}
              variants={menuButtonVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
              whileTap="tap"
              onClick={toggleMenu}
              onMouseEnter={handleMenuHover}
              onMouseLeave={handleMenuLeave}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '0.9rem',
                fontWeight: '400',
                letterSpacing: '0.1em',
                cursor: 'pointer',
                padding: '0.5rem 0',
                width: '120px',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                fontFamily: 'Arame Mono, monospace',
                position: 'relative'
              }}
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={menuText}
                  variants={textVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  style={{ display: 'block' }}
                >
                  {menuText}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </div>

          {/* Search Component */}
          <AnimatePresence>
            {showSearch && (
              <motion.div
                ref={searchContainerRef}
                style={{
                  position: 'fixed',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '90%',
                  maxWidth: '600px',
                  backgroundColor: 'rgba(0, 0, 0, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  padding: '2rem',
                  zIndex: 60,
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
                    margin: 0
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

          {/* Search Trigger Button */}
          {!showSearch && (
            <motion.button
              onClick={toggleSearch}
              style={{
                position: 'fixed',
                bottom: '2rem',
                right: '2rem',
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
                zIndex: 40
              }}
              whileHover={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                scale: 1.05
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
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

          {/* Menu Overlay */}
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
                  zIndex: 40,
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
                    background: 'none',
                    border: 'none',
                    color: isCloseHovered ? '#CCFF00' : 'white',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    zIndex: 41
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </motion.button>

                {/* Menu Items */}
                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: '1.5rem',
                  maxWidth: '1200px',
                  margin: '0 auto',
                  width: '100%'
                }}>
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
                        position: 'relative',
                        cursor: 'pointer'
                      }}
                    >
                      <motion.div
                        style={{
                          color: hoveredItem === item.name ? '#CCFF00' : 'white',
                          fontSize: 'clamp(2rem, 5vw, 4rem)',
                          fontWeight: '700',
                          letterSpacing: '-0.02em',
                          lineHeight: '1',
                          textTransform: 'uppercase'
                        }}
                        whileHover={{
                          x: 20,
                          transition: { duration: 0.3 }
                        }}
                      >
                        {item.name}
                      </motion.div>
                      
                      {/* Hover Line */}
                      <motion.div
                        style={{
                          position: 'absolute',
                          bottom: '-10px',
                          left: 0,
                          width: '0%',
                          height: '2px',
                          backgroundColor: '#CCFF00'
                        }}
                        initial={{ width: 0 }}
                        animate={{
                          width: hoveredItem === item.name ? '100%' : '0%'
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Bottom Text */}
                <motion.div
                  style={{
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: '0.9rem',
                    textAlign: 'center',
                    padding: '2rem 0 1rem 0',
                    borderTop: '1px solid rgba(255,255,255,0.1)'
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                >
                  NOTED © 2024 — DIGITAL CREATIVE STUDIO
                </motion.div>
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
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 50,
                  padding: '2rem'
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  style={{
                    backgroundColor: 'rgba(20,20,20,0.95)',
                    padding: '2rem',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    maxWidth: '500px',
                    width: '100%',
                    backdropFilter: 'blur(10px)'
                  }}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: "spring", damping: 20 }}
                >
                  <h3 style={{ color: 'white', marginBottom: '1.5rem' }}>
                    Set Your Location
                  </h3>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ 
                      color: 'rgba(255,255,255,0.7)', 
                      fontSize: '0.9rem',
                      display: 'block',
                      marginBottom: '0.5rem'
                    }}>
                      City
                    </label>
                    <input
                      type="text"
                      value={tempLocation.city}
                      onChange={(e) => setTempLocation({...tempLocation, city: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '6px',
                        color: 'white',
                        fontSize: '1rem',
                        outline: 'none'
                      }}
                      placeholder="Start typing city name..."
                    />
                    
                    {/* City Suggestions */}
                    {tempLocation.city.length > 0 && (
                      <div style={{
                        maxHeight: '200px',
                        overflowY: 'auto',
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '6px',
                        marginTop: '0.5rem'
                      }}>
                        {filteredCities.slice(0, 10).map((city, index) => (
                          <div
                            key={index}
                            onClick={() => setTempLocation({
                              city: city.city,
                              region: city.region
                            })}
                            style={{
                              padding: '0.75rem',
                              cursor: 'pointer',
                              color: 'white',
                              borderBottom: '1px solid rgba(255,255,255,0.05)',
                              fontSize: '0.9rem'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
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
                    <label style={{ 
                      color: 'rgba(255,255,255,0.7)', 
                      fontSize: '0.9rem',
                      display: 'block',
                      marginBottom: '0.5rem'
                    }}>
                      Region
                    </label>
                    <input
                      type="text"
                      value={tempLocation.region}
                      onChange={(e) => setTempLocation({...tempLocation, region: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '6px',
                        color: 'white',
                        fontSize: '1rem',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'flex-end'
                  }}>
                    <button
                      onClick={() => setShowLocationModal(false)}
                      style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: 'transparent',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '6px',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveManualLocation}
                      style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#CCFF00',
                        border: 'none',
                        borderRadius: '6px',
                        color: 'black',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                      }}
                    >
                      Save Location
                    </button>
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
                  backgroundColor: 'rgba(0,0,0,0.9)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 50,
                  padding: '2rem'
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  style={{
                    backgroundColor: 'rgba(20,20,20,0.95)',
                    padding: '2rem',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    maxWidth: '800px',
                    width: '100%',
                    maxHeight: '80vh',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    backdropFilter: 'blur(10px)'
                  }}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ type: "spring", damping: 20 }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem'
                  }}>
                    <h3 style={{ color: 'white', margin: 0 }}>
                      All Users ({allUsersData.length})
                    </h3>
                    <button
                      onClick={() => setShowAllUsers(false)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'rgba(255,255,255,0.6)',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        borderRadius: '6px'
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>

                  {isLoadingAllUsers ? (
                    <div style={{
                      color: 'white',
                      textAlign: 'center',
                      padding: '2rem'
                    }}>
                      Loading users data...
                    </div>
                  ) : (
                    <div style={{
                      flex: 1,
                      overflowY: 'auto',
                      paddingRight: '0.5rem'
                    }}>
                      {allUsersData.map((user, index) => (
                        <motion.div
                          key={user.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '1rem',
                            backgroundColor: 'rgba(255,255,255,0.02)',
                            borderRadius: '8px',
                            marginBottom: '0.5rem',
                            border: '1px solid rgba(255,255,255,0.05)'
                          }}
                        >
                          <div>
                            <div style={{ color: 'white', fontWeight: '500' }}>
                              {user.city}, {user.region}
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>
                              {user.country} • {user.lastUpdated ? new Date(user.lastUpdated).toLocaleDateString() : 'Unknown date'}
                            </div>
                          </div>
                          <div style={{
                            color: 'rgba(255,255,255,0.3)',
                            fontSize: '0.8rem'
                          }}>
                            #{index + 1}
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
