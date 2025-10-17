'use client';

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";

export default function HomePage(): React.JSX.Element {
  // ... semua state dan ref yang sudah ada tetap sama ...
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
    country: "",
    isp: "",
    coordinates: ""
  });
  const [isLocationVisible, setIsLocationVisible] = useState(false);
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
    getVisitorLocation();
    
    // Update time every second
    timeRef.current = setInterval(updateVisitorTime, 1000);

    return () => {
      if (timeRef.current) {
        clearInterval(timeRef.current);
      }
    };
  }, [showLoading]);

  // Fungsi untuk mendapatkan lokasi visitor berdasarkan IP
  const getVisitorLocation = async () => {
    try {
      // Method 1: Menggunakan Web API Geolocation (lebih akurat)
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            
            // Reverse geocoding sederhana tanpa API external
            const locationData = await reverseGeocode(latitude, longitude);
            setVisitorLocation(locationData);
          },
          // Fallback ke IP-based location jika geolocation gagal
          async (error) => {
            console.log('Geolocation failed, using IP-based location:', error);
            await getIPBasedLocation();
          }
        );
      } else {
        // Fallback ke IP-based location
        await getIPBasedLocation();
      }
    } catch (error) {
      console.log('Location detection failed:', error);
      // Set default location
      setVisitorLocation({
        city: "Jakarta",
        region: "DKI Jakarta",
        country: "Indonesia",
        isp: "Local Network",
        coordinates: "-6.2088, 106.8456"
      });
    }
  };

  // Reverse geocoding sederhana untuk koordinat Indonesia
  const reverseGeocode = async (lat: number, lng: number): Promise<any> => {
    // Database sederhana koordinat daerah di Indonesia
    const indonesiaLocations = [
      { city: "Ciracas", region: "Jakarta Timur", lat: -6.3293, lng: 106.8795, country: "Indonesia" },
      { city: "Pasar Minggu", region: "Jakarta Selatan", lat: -6.2922, lng: 106.8435, country: "Indonesia" },
      { city: "Tanah Abang", region: "Jakarta Pusat", lat: -6.1866, lng: 106.8086, country: "Indonesia" },
      { city: "Cengkareng", region: "Jakarta Barat", lat: -6.1522, lng: 106.7395, country: "Indonesia" },
      { city: "Cilincing", region: "Jakarta Utara", lat: -6.1149, lng: 106.9462, country: "Indonesia" },
      { city: "Bandung", region: "Jawa Barat", lat: -6.9175, lng: 107.6191, country: "Indonesia" },
      { city: "Surabaya", region: "Jawa Timur", lat: -7.2504, lng: 112.7688, country: "Indonesia" },
      { city: "Medan", region: "Sumatera Utara", lat: 3.5952, lng: 98.6722, country: "Indonesia" },
      { city: "Makassar", region: "Sulawesi Selatan", lat: -5.1477, lng: 119.4327, country: "Indonesia" },
      { city: "Semarang", region: "Jawa Tengah", lat: -6.9667, lng: 110.4167, country: "Indonesia" },
      { city: "Palembang", region: "Sumatera Selatan", lat: -2.9761, lng: 104.7754, country: "Indonesia" },
      { city: "Denpasar", region: "Bali", lat: -8.6705, lng: 115.2126, country: "Indonesia" },
      { city: "Balikpapan", region: "Kalimantan Timur", lat: -1.2379, lng: 116.8529, country: "Indonesia" },
      { city: "Manado", region: "Sulawesi Utara", lat: 1.4748, lng: 124.8421, country: "Indonesia" },
      { city: "Yogyakarta", region: "DI Yogyakarta", lat: -7.7956, lng: 110.3695, country: "Indonesia" }
    ];

    // Cari lokasi terdekat dalam database
    let nearestLocation = indonesiaLocations[0];
    let minDistance = Number.MAX_SAFE_INTEGER;

    for (const location of indonesiaLocations) {
      const distance = Math.sqrt(
        Math.pow(location.lat - lat, 2) + Math.pow(location.lng - lng, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestLocation = location;
      }
    }

    // Jika koordinat cukup dekat dengan lokasi yang diketahui
    if (minDistance < 1.0) { // Dalam 1 derajat (~111 km)
      return {
        city: nearestLocation.city,
        region: nearestLocation.region,
        country: nearestLocation.country,
        isp: "Local ISP",
        coordinates: `${lat.toFixed(4)}, ${lng.toFixed(4)}`
      };
    }

    // Jika tidak ada yang cocok, gunakan IP-based location
    return await getIPBasedLocation();
  };

  // Mendapatkan lokasi berdasarkan IP (fallback method)
  const getIPBasedLocation = async (): Promise<any> => {
    try {
      // Method sederhana: Deteksi timezone dan bahasa
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const language = navigator.language;
      
      // Mapping timezone ke lokasi di Indonesia
      const timezoneMap: { [key: string]: { city: string, region: string } } = {
        'Asia/Jakarta': { city: "Jakarta", region: "DKI Jakarta" },
        'Asia/Makassar': { city: "Makassar", region: "Sulawesi Selatan" },
        'Asia/Jayapura': { city: "Jayapura", region: "Papua" },
        'Asia/Pontianak': { city: "Pontianak", region: "Kalimantan Barat" }
      };

      let detectedLocation = timezoneMap[timezone] || { city: "Jakarta", region: "DKI Jakarta" };

      // Deteksi berdasarkan bahasa
      if (language.includes('id')) {
        detectedLocation = { city: "Jakarta", region: "DKI Jakarta" };
      }

      return {
        city: detectedLocation.city,
        region: detectedLocation.region,
        country: "Indonesia",
        isp: "Local ISP",
        coordinates: "Approximate Location"
      };

    } catch (error) {
      // Default location
      return {
        city: "Jakarta",
        region: "DKI Jakarta",
        country: "Indonesia",
        isp: "Local Network",
        coordinates: "Unknown"
      };
    }
  };

  const startTextScrollAnimation = () => {
    // ... kode animasi text scroll tetap sama ...
    const tl = gsap.timeline();
    
    // Background animation
    tl.fromTo(loadingRef.current,
      {
        opacity: 0,
      },
      {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out"
      }
    );

    // ... rest of the animation code remains the same ...
    if (textScrollRef.current) {
      const textLines = textScrollRef.current.children;
      const textArray = Array.from(textLines);
      
      gsap.set(textArray, {
        y: -1000,
        opacity: 0,
        scale: 1
      });

      // ... animation sequences remain the same ...
      tl.to(textArray[0], {
        y: 0,
        opacity: 1,
        duration: 0.4,
        ease: "power2.out"
      }, "+=0.1");

      tl.to(textArray[0], {
        y: 1000,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in"
      }, "+=0.1");

      // ... continue with other text animations ...

      // Final exit animation
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
    }
  };

  const updateVisitorTime = () => {
    // ... kode update waktu tetap sama ...
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
      'Asia/Pontianak': 'WIB',
      'Asia/Makassar': 'WITA',
      'Asia/Bali': 'WITA',
      'Asia/Jayapura': 'WIT',
      'Asia/Singapore': 'SGT',
      'Asia/Tokyo': 'JST',
      'Asia/Seoul': 'KST',
      'Asia/Shanghai': 'CST',
      'Asia/Bangkok': 'ICT',
      'Asia/Kolkata': 'IST',
      'Europe/London': 'GMT',
      'Europe/Paris': 'CET',
      'America/New_York': 'EST',
      'America/Los_Angeles': 'PST',
      'America/Chicago': 'CST',
      'Australia/Sydney': 'AEST'
    };

    return timezoneMap[timezone] || timezone.split('/')[1] || 'LOCAL';
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

  const toggleLocationVisibility = () => {
    setIsLocationVisible(!isLocationVisible);
  };

  // ... semua fungsi menu dan variants tetap sama ...

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

  // ... semua variants tetap sama ...

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
      {/* Location Display Button - BOTTOM LEFT */}
      <motion.button
        onClick={toggleLocationVisibility}
        style={{
          position: 'absolute',
          bottom: '2rem',
          left: '2rem',
          fontSize: '0.9rem',
          fontWeight: '300',
          color: 'rgba(255,255,255,0.7)',
          cursor: 'pointer',
          fontFamily: 'Arame Mono, monospace',
          letterSpacing: '0.5px',
          zIndex: 20,
          padding: '0.8rem 1.5rem',
          borderRadius: '25px',
          border: '1px solid rgba(255,255,255,0.2)',
          background: 'rgba(0,0,0,0.3)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem'
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        whileHover={{ 
          scale: 1.05,
          backgroundColor: 'rgba(0,0,0,0.5)',
          color: '#CCFF00',
          transition: { duration: 0.2 }
        }}
        whileTap={{ scale: 0.95 }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
        SHARE LOCATION
      </motion.button>

      {/* Location Display Panel */}
      <AnimatePresence>
        {isLocationVisible && (
          <motion.div
            style={{
              position: 'absolute',
              bottom: '5rem',
              left: '2rem',
              background: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '15px',
              padding: '1.5rem',
              color: 'white',
              fontFamily: 'Arame Mono, monospace',
              fontSize: '0.9rem',
              maxWidth: '300px',
              zIndex: 25
            }}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#CCFF00" stroke="#CCFF00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span style={{ fontWeight: '500', color: '#CCFF00' }}>Your Location</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.7 }}>City:</span>
                <span style={{ fontWeight: '300' }}>{visitorLocation.city}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.7 }}>Region:</span>
                <span style={{ fontWeight: '300' }}>{visitorLocation.region}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.7 }}>Country:</span>
                <span style={{ fontWeight: '300' }}>{visitorLocation.country}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.7 }}>ISP:</span>
                <span style={{ fontWeight: '300' }}>{visitorLocation.isp}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.7 }}>Coordinates:</span>
                <span style={{ fontWeight: '300', fontSize: '0.8rem' }}>{visitorLocation.coordinates}</span>
              </div>
            </div>

            <motion.button
              onClick={toggleLocationVisibility}
              style={{
                marginTop: '1rem',
                width: '100%',
                padding: '0.5rem',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '8px',
                color: 'rgba(255,255,255,0.8)',
                cursor: 'pointer',
                fontFamily: 'Arame Mono, monospace',
                fontSize: '0.8rem'
              }}
              whileHover={{ background: 'rgba(255,255,255,0.2)' }}
              whileTap={{ scale: 0.95 }}
            >
              CLOSE
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

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

                {/* Visitor Time Display - TOP CENTER */}
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

                  {/* Timezone & Date */}
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
                      {visitorTime.date}
                    </span>
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
