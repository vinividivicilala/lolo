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
  const [isComingSoonHovered, setIsComingSoonHovered] = useState(false);
  const router = useRouter();
  const timeRef = useRef<NodeJS.Timeout | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const textScrollRef = useRef<HTMLDivElement>(null);
  const comingSoonRef = useRef<HTMLDivElement>(null);
  const previewImageRef = useRef<HTMLDivElement>(null);
  const viewCircleRef = useRef<HTMLDivElement>(null);

  // Sample project images for coming soon preview
  const projectImages = [
    { id: 1, src: "/images/1.jpg", alt: "Project 1", title: "Creative Studio" },
    { id: 2, src: "/images/2.jpg", alt: "Project 2", title: "Brand Identity" },
    { id: 3, src: "/images/3.jpg", alt: "Project 3", title: "Web Design" },
    { id: 4, src: "/images/4.jpg", alt: "Project 4", title: "Photography" },
    { id: 5, src: "/images/5.jpg", alt: "Project 5", title: "Motion Graphics" },
    { id: 6, src: "/images/6.jpg", alt: "Project 6", title: "UI/UX Design" }
  ];

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

  // GSAP animation for coming soon hover effect
  useEffect(() => {
    if (comingSoonRef.current && previewImageRef.current && viewCircleRef.current) {
      const ctx = gsap.context(() => {
        // Initial state
        gsap.set(previewImageRef.current, {
          scale: 0.8,
          opacity: 0,
          x: 100
        });

        gsap.set(viewCircleRef.current, {
          scale: 0,
          opacity: 0
        });
      }, comingSoonRef);

      return () => ctx.revert();
    }
  }, []);

  const handleComingSoonHover = () => {
    setIsComingSoonHovered(true);
    
    if (previewImageRef.current && viewCircleRef.current) {
      const tl = gsap.timeline();
      
      // Random project image
      const randomImage = projectImages[Math.floor(Math.random() * projectImages.length)];
      
      // Update preview image
      const img = previewImageRef.current.querySelector('img');
      if (img) {
        img.src = randomImage.src;
        img.alt = randomImage.alt;
      }

      // Preview image animation
      tl.to(previewImageRef.current, {
        scale: 1,
        opacity: 1,
        x: 0,
        duration: 0.6,
        ease: "back.out(1.7)"
      });

      // View circle animation
      tl.to(viewCircleRef.current, {
        scale: 1,
        opacity: 1,
        duration: 0.4,
        ease: "power2.out"
      }, "-=0.3");

      // Floating animation
      tl.to(previewImageRef.current, {
        y: -10,
        duration: 2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1
      });
    }
  };

  const handleComingSoonLeave = () => {
    setIsComingSoonHovered(false);
    
    if (previewImageRef.current && viewCircleRef.current) {
      const tl = gsap.timeline();
      
      // Hide preview image
      tl.to(previewImageRef.current, {
        scale: 0.8,
        opacity: 0,
        x: 100,
        duration: 0.4,
        ease: "power2.in"
      });

      // Hide view circle
      tl.to(viewCircleRef.current, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in"
      }, "-=0.4");
    }
  };

  const startTextScrollAnimation = () => {
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

    // High-speed text scroll animation
    if (textScrollRef.current) {
      const textLines = textScrollRef.current.children;
      const textArray = Array.from(textLines);
      
      // Set initial positions - semua teks di atas layar
      gsap.set(textArray, {
        y: -1000,
        opacity: 0,
        scale: 1
      });

      // ANIMASI SCROLL CEPAT: Teks masuk dari atas dengan kecepatan tinggi
      // Line 1: Scroll ultra cepat
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

      // Line 2: Scroll lebih cepat
      tl.to(textArray[1], {
        y: 0,
        opacity: 1,
        duration: 0.35,
        ease: "power2.out"
      }, "-=0.2");

      tl.to(textArray[1], {
        y: 1000,
        opacity: 0,
        duration: 0.25,
        ease: "power2.in"
      }, "+=0.1");

      // Line 3: Scroll sangat cepat
      tl.to(textArray[2], {
        y: 0,
        opacity: 1,
        duration: 0.3,
        ease: "power2.out"
      }, "-=0.15");

      tl.to(textArray[2], {
        y: 1000,
        opacity: 0,
        duration: 0.2,
        ease: "power2.in"
      }, "+=0.1");

      // Line 4: Scroll hyper cepat
      tl.to(textArray[3], {
        y: 0,
        opacity: 1,
        duration: 0.25,
        ease: "power2.out"
      }, "-=0.1");

      tl.to(textArray[3], {
        y: 1000,
        opacity: 0,
        duration: 0.15,
        ease: "power2.in"
      }, "+=0.1");

      // Line 5: Scroll paling cepat
      tl.to(textArray[4], {
        y: 0,
        opacity: 1,
        duration: 0.2,
        ease: "power2.out"
      }, "-=0.05");

      tl.to(textArray[4], {
        y: 1000,
        opacity: 0,
        duration: 0.1,
        ease: "power2.in"
      }, "+=0.1");

      // FINAL TEXT: Muncul dan tetap
      tl.to(textArray[5], {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.6,
        ease: "back.out(1.7)"
      }, "+=0.2");

      // Final text animation
      tl.to(textArray[5], {
        scale: 1.1,
        duration: 0.3,
        ease: "power2.out"
      }, "+=0.5");

      tl.to(textArray[5], {
        scale: 1,
        duration: 0.2,
        ease: "power2.in"
      });

      // Glitch effect pada final text
      tl.to(textArray[5], {
        x: 10,
        duration: 0.05,
        ease: "power1.inOut"
      });

      tl.to(textArray[5], {
        x: -10,
        duration: 0.05,
        ease: "power1.inOut"
      });

      tl.to(textArray[5], {
        x: 0,
        duration: 0.05,
        ease: "power1.inOut"
      });
    }

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
              {/* Navigation Menu - Left Side */}
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                paddingLeft: '2rem'
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

              {/* Coming Soon Section - Right Side */}
              <div
                ref={comingSoonRef}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'flex-end',
                  paddingRight: '2rem',
                  position: 'relative'
                }}
              >
                {/* Coming Soon Text */}
                <motion.div
                  style={{
                    fontSize: '5rem',
                    fontWeight: '300',
                    color: 'rgba(0,0,0,0.8)',
                    fontFamily: 'Arame Mono, monospace',
                    lineHeight: 0.9,
                    letterSpacing: '-2px',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    textAlign: 'right'
                  }}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  whileHover={{ color: '#000' }}
                  onMouseEnter={handleComingSoonHover}
                  onMouseLeave={handleComingSoonLeave}
                >
                  COMING<br />SOON
                  <motion.span
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: '300',
                      color: 'rgba(0,0,0,0.6)',
                      marginLeft: '0.5rem'
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    (1)
                  </motion.span>
                </motion.div>

                {/* Preview Image - Hidden by default */}
                <div
                  ref={previewImageRef}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    right: '120%',
                    transform: 'translateY(-50%)',
                    width: '300px',
                    height: '400px',
                    borderRadius: '15px',
                    overflow: 'hidden',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                    border: '2px solid rgba(0,0,0,0.1)',
                    opacity: 0,
                    scale: 0.8
                  }}
                >
                  <img
                    src=""
                    alt="Project Preview"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.currentTarget.style.backgroundColor = '#222';
                      e.currentTarget.style.display = 'flex';
                      e.currentTarget.style.justifyContent = 'center';
                      e.currentTarget.style.alignItems = 'center';
                      e.currentTarget.style.color = '#CCFF00';
                      e.currentTarget.style.fontFamily = 'Arame Mono, monospace';
                      e.currentTarget.style.fontSize = '1rem';
                      e.currentTarget.innerHTML = 'Project Preview';
                    }}
                  />
                </div>

                {/* View Circle with Text - Hidden by default */}
                <div
                  ref={viewCircleRef}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    right: '150%',
                    transform: 'translateY(-50%)',
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    backgroundColor: 'black',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: '#CCFF00',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    fontFamily: 'Arame Mono, monospace',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    opacity: 0,
                    scale: 0
                  }}
                >
                  VIEW
                </div>
              </div>

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
            </
