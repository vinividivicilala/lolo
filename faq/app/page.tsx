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
  const [randomNumber, setRandomNumber] = useState("0000");
  const router = useRouter();
  const timeRef = useRef<NodeJS.Timeout | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLDivElement>(null);
  const horizontalScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showLoading) {
      startGSAPLoadingAnimation();
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

  const startGSAPLoadingAnimation = () => {
    const tl = gsap.timeline();
    
    // Background animation
    tl.fromTo(loadingRef.current,
      {
        opacity: 0,
      },
      {
        opacity: 1,
        duration: 0.5,
        ease: "power2.out"
      }
    );

    // Single random number animation
    if (numberRef.current) {
      // Initial position - center
      gsap.set(numberRef.current, {
        scale: 0,
        rotation: 0,
        opacity: 0
      });

      // Big entrance animation
      tl.fromTo(numberRef.current,
        {
          scale: 0,
          opacity: 0,
        },
        {
          scale: 1,
          opacity: 1,
          duration: 1,
          ease: "back.out(1.7)"
        }
      );

      // Continuous rapid random number changes
      const changeNumber = () => {
        const newNumber = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        setRandomNumber(newNumber);
      };

      // Very fast number changes (50 changes in 2 seconds)
      tl.to({}, {
        duration: 0.04, // Very fast changes
        onRepeat: changeNumber,
        repeat: 50
      });

      // Final number and scaling up
      tl.to(numberRef.current, {
        scale: 1.3,
        duration: 0.3,
        ease: "power2.out"
      });
    }

    // Horizontal scroll animation for images
    if (horizontalScrollRef.current) {
      const imageContainers = horizontalScrollRef.current.children;
      
      // Set initial positions for top row (scroll left to right)
      gsap.set(Array.from(imageContainers).slice(0, 6), {
        x: -2000, // Start from far left
        opacity: 0,
        scale: 0.8
      });

      // Set initial positions for bottom row (scroll right to left)
      gsap.set(Array.from(imageContainers).slice(6), {
        x: 2000, // Start from far right
        opacity: 0,
        scale: 0.8
      });

      // Staggered entrance for top row (left to right)
      tl.fromTo(Array.from(imageContainers).slice(0, 6),
        {
          x: -2000,
          opacity: 0,
          scale: 0.8
        },
        {
          x: 0,
          opacity: 1,
          scale: 1,
          duration: 1.5,
          stagger: 0.1,
          ease: "power2.out"
        },
        "-=1"
      );

      // Staggered entrance for bottom row (right to left)
      tl.fromTo(Array.from(imageContainers).slice(6),
        {
          x: 2000,
          opacity: 0,
          scale: 0.8
        },
        {
          x: 0,
          opacity: 1,
          scale: 1,
          duration: 1.5,
          stagger: 0.1,
          ease: "power2.out"
        },
        "-=1.2"
      );

      // Continuous fast horizontal scrolling
      // Top row scroll right
      tl.to(Array.from(imageContainers).slice(0, 6), {
        x: 2000,
        duration: 2,
        ease: "none",
        stagger: 0.05
      }, "+=0.5");

      // Bottom row scroll left
      tl.to(Array.from(imageContainers).slice(6), {
        x: -2000,
        duration: 2,
        ease: "none",
        stagger: 0.05
      }, "-=2");

      // Reset positions and loop
      tl.to(Array.from(imageContainers).slice(0, 6), {
        x: -2000,
        duration: 0,
      });

      tl.to(Array.from(imageContainers).slice(6), {
        x: 2000,
        duration: 0,
      });

      // Second loop - even faster
      tl.to(Array.from(imageContainers).slice(0, 6), {
        x: 2000,
        duration: 1.5,
        ease: "none",
        stagger: 0.03
      });

      tl.to(Array.from(imageContainers).slice(6), {
        x: -2000,
        duration: 1.5,
        ease: "none",
        stagger: 0.03
      }, "-=1.5");
    }

    // Final exit animation
    tl.to({}, {
      duration: 1,
      onComplete: () => {
        gsap.to(loadingRef.current, {
          opacity: 0,
          duration: 0.8,
          ease: "power2.inOut",
          onComplete: () => setShowLoading(false)
        });
      }
    });
  };

  const updateVisitorTime = () => {
    const now = new Date();
    
    // Get visitor's timezone automatically
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Format time based on visitor's timezone
    const time = now.toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    // Format date
    const date = now.toLocaleDateString('en-US', {
      timeZone: timezone,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Get timezone abbreviation (WIB, WITA, WIT, etc)
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
        // Setelah selesai, kembali ke MENU
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
      name: "HOME", 
      delay: 0.1 
    },
    { 
      name: "WORK", 
      delay: 0.2 
    },
    { 
      name: "ABOUT", 
      delay: 0.3 
    },
    { 
      name: "CONTACT", 
      delay: 0.4 
    }
  ];

  // SVG Icons
  const HomeIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );

  const WorkIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  );

  const AboutIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );

  const ContactIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  );

  const getIcon = (name: string) => {
    switch (name) {
      case "HOME": return <HomeIcon />;
      case "WORK": return <WorkIcon />;
      case "ABOUT": return <AboutIcon />;
      case "CONTACT": return <ContactIcon />;
      default: return <HomeIcon />;
    }
  };

  // Image data - using placeholder images from public folder
  // Replace these with your actual image paths in public folder
  const images = [
    { id: 1, src: "/images/photo1.jpg", alt: "Photo 1" },
    { id: 2, src: "/images/photo2.jpg", alt: "Photo 2" },
    { id: 3, src: "/images/photo3.jpg", alt: "Photo 3" },
    { id: 4, src: "/images/photo4.jpg", alt: "Photo 4" },
    { id: 5, src: "/images/photo5.jpg", alt: "Photo 5" },
    { id: 6, src: "/images/photo6.jpg", alt: "Photo 6" },
    { id: 7, src: "/images/photo7.jpg", alt: "Photo 7" },
    { id: 8, src: "/images/photo8.jpg", alt: "Photo 8" },
    { id: 9, src: "/images/photo9.jpg", alt: "Photo 9" },
    { id: 10, src: "/images/photo10.jpg", alt: "Photo 10" },
    { id: 11, src: "/images/photo11.jpg", alt: "Photo 11" },
    { id: 12, src: "/images/photo12.jpg", alt: "Photo 12" }
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
                flexDirection: 'column',
                padding: '2rem'
              }}
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
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
                exit={{ opacity: 0, y: -10 }}
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

              {/* Main Content - Navigation Menu */}
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                paddingLeft: '2rem',
                marginTop: '6rem'
              }}>
                {/* Menu Items */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0rem'
                }}>
                  {menuItems.map((item, index) => (
                    <motion.div
                      key={item.name}
                      style={{
                        position: 'relative',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0.1rem 0',
                        margin: '-0.2rem 0'
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
                      {/* SVG Icon */}
                      <motion.div
                        style={{
                          marginRight: '0.8rem',
                          opacity: 0.8,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        animate={{
                          scale: hoveredItem === item.name ? 1.2 : 1,
                          transition: { duration: 0.2 }
                        }}
                      >
                        {getIcon(item.name)}
                      </motion.div>

                      {/* Menu Text */}
                      <motion.div
                        style={{
                          fontSize: '2.8rem',
                          fontWeight: '300',
                          color: 'rgba(0,0,0,0.8)',
                          fontFamily: 'Arame Mono, monospace',
                          lineHeight: 0.8,
                          letterSpacing: '-0.5px',
                          textTransform: 'uppercase',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                        animate={{
                          color: hoveredItem === item.name ? '#000' : 'rgba(0,0,0,0.8)',
                          transition: { duration: 0.2 }
                        }}
                      >
                        {item.name}
                        
                        {/* Animated Arrow */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ 
                            opacity: hoveredItem === item.name ? 1 : 0,
                            scale: hoveredItem === item.name ? 1 : 0.8
                          }}
                          transition={{ duration: 0.2 }}
                          style={{
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                          </svg>
                        </motion.div>
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

      {/* GSAP Loading Screen dengan 1 Angka Random dan Horizontal Scroll */}
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
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden'
            }}
          >
            {/* Single Random Number - Center */}
            <div
              ref={numberRef}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '6rem',
                fontWeight: '900',
                color: '#CCFF00',
                fontFamily: 'Arame Mono, monospace',
                textShadow: '0 0 30px rgba(204, 255, 0, 0.8)',
                zIndex: 10,
                opacity: 0
              }}
            >
              {randomNumber}
            </div>

            {/* Horizontal Scroll Container */}
            <div
              ref={horizontalScrollRef}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-around',
                padding: '2rem 0'
              }}
            >
              {/* Top Row - Scroll Left to Right */}
              <div style={{
                display: 'flex',
                gap: '2rem',
                marginBottom: '1rem'
              }}>
                {images.slice(0, 6).map((image) => (
                  <div
                    key={image.id}
                    style={{
                      width: '200px',
                      height: '120px',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      flexShrink: 0,
                      opacity: 0
                    }}
                  >
                    <img
                      src={image.src}
                      alt={image.alt}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        // Fallback jika gambar tidak ada
                        e.currentTarget.style.backgroundColor = '#333';
                        e.currentTarget.style.display = 'flex';
                        e.currentTarget.style.justifyContent = 'center';
                        e.currentTarget.style.alignItems = 'center';
                        e.currentTarget.style.color = '#666';
                        e.currentTarget.innerHTML = 'Image';
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Bottom Row - Scroll Right to Left */}
              <div style={{
                display: 'flex',
                gap: '2rem',
                justifyContent: 'flex-end'
              }}>
                {images.slice(6).map((image) => (
                  <div
                    key={image.id}
                    style={{
                      width: '200px',
                      height: '120px',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      flexShrink: 0,
                      opacity: 0
                    }}
                  >
                    <img
                      src={image.src}
                      alt={image.alt}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        // Fallback jika gambar tidak ada
                        e.currentTarget.style.backgroundColor = '#333';
                        e.currentTarget.style.display = 'flex';
                        e.currentTarget.style.justifyContent = 'center';
                        e.currentTarget.style.alignItems = 'center';
                        e.currentTarget.style.color = '#666';
                        e.currentTarget.innerHTML = 'Image';
                      }}
                    />
                  </div>
                ))}
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

      {/* Font import */}
      <style jsx>{`
        @import url('https://fonts.cdnfonts.com/css/arame-mono');
      `}</style>
    </div>
  );
}
