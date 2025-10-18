
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
  const router = useRouter();
  const timeRef = useRef<NodeJS.Timeout | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const textScrollRef = useRef<HTMLDivElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);

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
    { city: "Kendari", region: "Sulawesi Tenggara" },
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
                color: 'rgba(0,0,0,0.6)'
              }}
              whileHover={{
                backgroundColor: 'rgba(0,0,0,0.2)',
                scale: 1.1,
                color: 'rgba(0,0,0,0.9)'
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

      {/* Location Display - Bisa diklik untuk edit */}
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
          maxWidth: '250px'
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


{/* Marquee Text MENURU */}
<motion.div
  style={{
    position: 'absolute',
    top: showBanner ? '9rem' : '6.5rem',
    left: 0,
    width: '100%',
    overflow: 'hidden',
    zIndex: 5,
    pointerEvents: 'none'
  }}
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 1.2, duration: 0.8 }}
>
  <motion.div
    style={{
      display: 'flex',
      width: 'fit-content'
    }}
    animate={{
      x: [0, -1030]
    }}
    transition={{
      x: {
        duration: 15,
        repeat: Infinity,
        repeatType: "loop",
        ease: "linear"
      }
    }}
  >
    {[...Array(6)].map((_, index) => (
      <div
        key={index}
        style={{
          fontSize: '6rem',
          fontWeight: '900',
          color: 'rgba(255,255,255,0.03)',
          fontFamily: 'Arame Mono, monospace',
          textTransform: 'uppercase',
          letterSpacing: '-2px',
          lineHeight: 1,
          whiteSpace: 'nowrap',
          padding: '0 1rem',
          WebkitTextStroke: '1px rgba(255,255,255,0.05)',
          textShadow: '0 0 30px rgba(255,255,255,0.1)'
        }}
      >
        MENURU
      </div>
    ))}
  </motion.div>
</motion.div>


      

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
          whiteSpace: 'nowrap'
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
              zIndex: 100,
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
                    background: tempLocation.city ? '#CCFF00' : '#ccc',
                    color: 'black',
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
              zIndex: 100,
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
                      borderTop: '3px solid #CCFF00',
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
                            borderLeft: user.id === currentUserId ? '4px solid #CCFF00' : '4px solid transparent'
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
                                  backgroundColor: '#CCFF00',
                                  color: 'black',
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
                              color: '#CCFF00',
                              backgroundColor: 'rgba(204, 255, 0, 0.1)',
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

      {/* Menu Button dengan Framer Motion */}
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
          zIndex: 20,
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

      {/* Menu Overlay */}
      <AnimatePresence>
        {showMenu && (
          <>
            {/* Background Overlay - Light Green */}
            <motion.div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: '#CCFF00',
                zIndex: 25,
                display: 'flex',
                padding: '2rem'
              }}
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              {/* Main Content - Navigation Menu - FULL WIDTH */}
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                paddingLeft: '4rem',
                position: 'relative'
              }}>
                {/* Website Name - Top Left - DIUBAH MENJADI MENURU */}
                <motion.div
                  style={{
                    position: 'absolute',
                    left: '2rem',
                    top: '2rem',
                    fontSize: '4rem',
                    fontWeight: '800',
                    color: 'rgba(0,0,0,1)',
                    fontFamily: 'Arame Mono, monospace',
                    lineHeight: 1,
                    letterSpacing: '1.5px',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
                  }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.4,
                    delay: 0.3
                  }}
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
                    gap: '0.3rem'
                  }}
                  variants={timeVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
                  {/* Time - Font Besar */}
                  <motion.div
                    style={{
                      fontSize: '2.5rem',
                      fontWeight: '400',
                      color: 'rgba(0,0,0,0.9)',
                      fontFamily: 'Arame Mono, monospace',
                      fontFeatureSettings: '"tnum"',
                      fontVariantNumeric: 'tabular-nums',
                      letterSpacing: '2px'
                    }}
                    animate={{
                      scale: [1, 1.02, 1],
                      transition: {
                        duration: 1,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }
                    }}
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
                      color: 'rgba(0,0,0,0.8)',
                      fontFamily: 'Arame Mono, monospace'
                    }}
                  >
                    <span style={{ 
                      backgroundColor: 'rgba(0,0,0,0.1)',
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
                      color: 'rgba(0,0,0,0.7)',
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
                    >
                      {/* Menu Text dengan font besar 80px */}
                      <motion.div
                        style={{
                          fontSize: '80px',
                          fontWeight: '300',
                          color: 'rgba(0,0,0,0.8)',
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
                          color: hoveredItem === item.name ? '#000' : 'rgba(0,0,0,0.8)',
                          transition: { duration: 0.2 }
                        }}
                      >
                        {item.name}
                        
                        {/* Line bawah - TETAP ADA TANPA HOVER */}
                        <motion.div
                          style={{
                            width: '100%',
                            height: '3px',
                            backgroundColor: hoveredItem === item.name ? '#000' : 'rgba(0,0,0,0.3)',
                            transition: 'all 0.3s ease'
                          }}
                          animate={{
                            backgroundColor: hoveredItem === item.name ? '#000' : 'rgba(0,0,0,0.3)',
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
            
            {/* Close Button */}
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
                backgroundColor: 'rgba(0,0,0,0.1)',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 30,
                backdropFilter: 'blur(10px)',
                padding: '0 1.5rem',
                fontFamily: 'Arame Mono, monospace',
                fontSize: '0.9rem',
                fontWeight: '300',
                color: 'rgba(0,0,0,0.7)',
                overflow: 'hidden'
              }}
              variants={closeButtonVariants}
              initial="closed"
              animate="open"
              exit="closed"
              whileHover={{ 
                scale: 1.05,
                backgroundColor: 'rgba(0,0,0,0.2)',
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.95 }}
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
              zIndex: 50,
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

      {/* Main Content After Loading */}
      <AnimatePresence>
        {!showLoading && (
          <motion.div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.5rem',
              padding: '2rem',
              zIndex: 10
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.h1
              style={{
                fontSize: '2.5rem',
                fontWeight: '300',
                color: 'white',
                fontFamily: 'Arame Mono, monospace',
                textAlign: 'center',
                marginBottom: '0.5rem',
                letterSpacing: '2px'
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              WELCOME
            </motion.h1>
            
            <motion.p
              style={{
                fontSize: '1rem',
                fontWeight: '300',
                color: 'rgba(255,255,255,0.7)',
                fontFamily: 'Arame Mono, monospace',
                textAlign: 'center',
                maxWidth: '400px',
                lineHeight: '1.5',
                letterSpacing: '0.5px'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              Your space for creative thoughts and ideas
            </motion.p>

            <motion.button
              onClick={navigateToNotes}
              style={{
                padding: '0.8rem 1.8rem',
                fontSize: '0.9rem',
                fontWeight: '300',
                color: 'black',
                backgroundColor: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontFamily: 'Arame Mono, monospace',
                letterSpacing: '1px'
              }}
              whileHover={{ 
                scale: 1.03,
                backgroundColor: '#f8f8f8',
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              VIEW NOTES
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
[file content end]



