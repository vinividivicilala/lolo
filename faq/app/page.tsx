'use client';

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";

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
    city: "Jakarta",
    region: "DKI Jakarta", 
    country: "Indonesia"
  });
  const [isDetectingLocation, setIsDetectingLocation] = useState(true);
  const router = useRouter();
  const timeRef = useRef<NodeJS.Timeout | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const textScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showLoading) {
      startTextScrollAnimation();
    }

    // Initialize visitor time and location
    updateVisitorTime();
    detectVisitorLocation();
    
    // Update time every second
    timeRef.current = setInterval(updateVisitorTime, 1000);

    return () => {
      if (timeRef.current) {
        clearInterval(timeRef.current);
      }
    };
  }, [showLoading]);

  // Fungsi utama untuk mendeteksi lokasi berdasarkan informasi browser
  const detectVisitorLocation = async () => {
    setIsDetectingLocation(true);
    
    try {
      // Method 1: Geolocation browser (paling akurat jika diizinkan)
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const location = getLocationFromCoordinates(
              position.coords.latitude, 
              position.coords.longitude
            );
            setVisitorLocation(location);
            setIsDetectingLocation(false);
          },
          () => {
            // Jika geolocation ditolak, gunakan metode lain
            const location = getLocationFromBrowserInfo();
            setVisitorLocation(location);
            setIsDetectingLocation(false);
          },
          {
            enableHighAccuracy: false, // Tidak perlu high accuracy untuk kota
            timeout: 3000,
            maximumAge: 300000 // 5 menit cache
          }
        );
      } else {
        // Browser tidak support geolocation
        const location = getLocationFromBrowserInfo();
        setVisitorLocation(location);
        setIsDetectingLocation(false);
      }
    } catch (error) {
      console.log('Location detection failed:', error);
      const location = getLocationFromBrowserInfo();
      setVisitorLocation(location);
      setIsDetectingLocation(false);
    }
  };

  // Deteksi lokasi dari koordinat GPS
  const getLocationFromCoordinates = (lat: number, lng: number) => {
    // Mapping koordinat ke kota-kota utama Indonesia
    const cityCoordinates = [
      { city: "Jakarta", region: "DKI Jakarta", lat: -6.2088, lng: 106.8456 },
      { city: "Surabaya", region: "Jawa Timur", lat: -7.2504, lng: 112.7688 },
      { city: "Bandung", region: "Jawa Barat", lat: -6.9175, lng: 107.6191 },
      { city: "Medan", region: "Sumatera Utara", lat: 3.5952, lng: 98.6722 },
      { city: "Makassar", region: "Sulawesi Selatan", lat: -5.1477, lng: 119.4327 },
      { city: "Semarang", region: "Jawa Tengah", lat: -6.9667, lng: 110.4167 },
      { city: "Palembang", region: "Sumatera Selatan", lat: -2.9761, lng: 104.7754 },
      { city: "Denpasar", region: "Bali", lat: -8.6705, lng: 115.2126 },
      { city: "Balikpapan", region: "Kalimantan Timur", lat: -1.2379, lng: 116.8529 },
      { city: "Manado", region: "Sulawesi Utara", lat: 1.4748, lng: 124.8421 },
      { city: "Yogyakarta", region: "DI Yogyakarta", lat: -7.7956, lng: 110.3695 },
      { city: "Malang", region: "Jawa Timur", lat: -7.9666, lng: 112.6326 },
      { city: "Bekasi", region: "Jawa Barat", lat: -6.2383, lng: 106.9756 },
      { city: "Tangerang", region: "Banten", lat: -6.1783, lng: 106.6319 },
      { city: "Bogor", region: "Jawa Barat", lat: -6.5971, lng: 106.8060 },
      { city: "Depok", region: "Jawa Barat", lat: -6.4025, lng: 106.7942 },
      { city: "Cimahi", region: "Jawa Barat", lat: -6.8722, lng: 107.5422 },
      { city: "Padang", region: "Sumatera Barat", lat: -0.9471, lng: 100.4172 },
      { city: "Bandar Lampung", region: "Lampung", lat: -5.4294, lng: 105.2621 },
      { city: "Pekanbaru", region: "Riau", lat: 0.5071, lng: 101.4478 },
      { city: "Batam", region: "Kepulauan Riau", lat: 1.0456, lng: 104.0305 },
      { city: "Banjarmasin", region: "Kalimantan Selatan", lat: -3.3194, lng: 114.5911 },
      { city: "Samarinda", region: "Kalimantan Timur", lat: -0.5022, lng: 117.1536 },
      { city: "Pontianak", region: "Kalimantan Barat", lat: -0.0226, lng: 109.3307 },
      { city: "Cirebon", region: "Jawa Barat", lat: -6.7320, lng: 108.5523 },
      { city: "Sukabumi", region: "Jawa Barat", lat: -6.9197, lng: 106.9272 },
      { city: "Tasikmalaya", region: "Jawa Barat", lat: -7.3257, lng: 108.2144 },
      { city: "Serang", region: "Banten", lat: -6.1153, lng: 106.1544 },
      { city: "Purwokerto", region: "Jawa Tengah", lat: -7.4244, lng: 109.2344 },
      { city: "Kediri", region: "Jawa Timur", lat: -7.8467, lng: 112.0178 },
      { city: "Jambi", region: "Jambi", lat: -1.6100, lng: 103.6071 },
      { city: "Bengkulu", region: "Bengkulu", lat: -3.7956, lng: 102.2592 },
      { city: "Palu", region: "Sulawesi Tengah", lat: -0.8950, lng: 119.8594 },
      { city: "Kendari", region: "Sulawesi Tenggara", lat: -3.9675, lng: 122.5947 },
      { city: "Gorontalo", region: "Gorontalo", lat: 0.5333, lng: 123.0667 },
      { city: "Ambon", region: "Maluku", lat: -3.6954, lng: 128.1814 },
      { city: "Ternate", region: "Maluku Utara", lat: 0.7833, lng: 127.3667 },
      { city: "Manokwari", region: "Papua Barat", lat: -0.8667, lng: 134.0833 },
      { city: "Jayapura", region: "Papua", lat: -2.5333, lng: 140.7167 }
    ];

    // Cari kota terdekat berdasarkan koordinat
    let nearestCity = cityCoordinates[0];
    let minDistance = Number.MAX_SAFE_INTEGER;

    for (const city of cityCoordinates) {
      const distance = Math.sqrt(
        Math.pow(city.lat - lat, 2) + Math.pow(city.lng - lng, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestCity = city;
      }
    }

    return {
      city: nearestCity.city,
      region: nearestCity.region,
      country: "Indonesia"
    };
  };

  // Deteksi lokasi dari informasi browser (timezone, language, dll)
  const getLocationFromBrowserInfo = () => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const language = navigator.language;
    
    // Mapping timezone ke kota di Indonesia
    const timezoneMap: { [key: string]: { city: string, region: string } } = {
      'Asia/Jakarta': { city: "Jakarta", region: "DKI Jakarta" },
      'Asia/Makassar': { city: "Makassar", region: "Sulawesi Selatan" },
      'Asia/Jayapura': { city: "Jayapura", region: "Papua" },
      'Asia/Pontianak': { city: "Pontianak", region: "Kalimantan Barat" }
    };

    // Coba deteksi dari timezone
    if (timezoneMap[timezone]) {
      return {
        ...timezoneMap[timezone],
        country: "Indonesia"
      };
    }

    // Jika bahasa Indonesia, beri prioritas kota besar di Indonesia
    if (language.includes('id')) {
      const indonesianCities = [
        { city: "Jakarta", region: "DKI Jakarta" },
        { city: "Surabaya", region: "Jawa Timur" },
        { city: "Bandung", region: "Jawa Barat" },
        { city: "Medan", region: "Sumatera Utara" },
        { city: "Makassar", region: "Sulawesi Selatan" }
      ];
      const randomCity = indonesianCities[Math.floor(Math.random() * indonesianCities.length)];
      return {
        ...randomCity,
        country: "Indonesia"
      };
    }

    // Default fallback
    return {
      city: "Jakarta",
      region: "DKI Jakarta",
      country: "Indonesia"
    };
  };

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

  // Array teks menu yang akan berganti saat hover
  const menuTextVariants = ["EXPLORE", "NAVIGATE", "DISCOVER", "BROWSE"];
  const animationRef = useRef<NodeJS.Timeout | null>(null);

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
      {/* Menu Button with Framer Motion */}
      <motion.div
        onClick={toggleMenu}
        onMouseEnter={handleMenuHover}
        onMouseLeave={handleMenuLeave}
        style={{
          position: 'absolute',
          top: '2rem',
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
                {/* Website Name - Top Left */}
                <motion.div
                  style={{
                    position: 'absolute',
                    left: '2rem',
                    top: '2rem',
                    fontSize: '1.2rem',
                    fontWeight: '300',
                    color: 'rgba(0,0,0,0.6)',
                    fontFamily: 'Arame Mono, monospace',
                    lineHeight: 1,
                    letterSpacing: '0.5px'
                  }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.4,
                    delay: 0.3
                  }}
                >
                  PORTFOLIO
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
                      {visitorLocation.city}, {visitorLocation.country}
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
            {/* Location Display - Automatic di halaman utama */}
            <motion.div
              style={{
                position: 'absolute',
                top: '2rem',
                left: '2rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '0.3rem'
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <motion.div
                style={{
                  fontSize: '1.1rem',
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
                {isDetectingLocation ? (
                  <motion.span
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                  >
                    Mendeteksi lokasi...
                  </motion.span>
                ) : (
                  `${visitorLocation.city}, ${visitorLocation.country}`
                )}
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
              </motion.div>
            </motion.div>

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
