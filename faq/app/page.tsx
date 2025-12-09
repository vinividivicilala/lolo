'use client';

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import gsap from "gsap";

export default function HomePage(): React.JSX.Element {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [loadingText, setLoadingText] = useState("NURU");
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [currentView, setCurrentView] = useState<"main" | "index" | "grid">("main");
  const [sliderPosition, setSliderPosition] = useState<"index" | "grid">("grid");
  const [hoveredTopic, setHoveredTopic] = useState<number | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isProgressActive, setIsProgressActive] = useState(true);
  const [showCookieNotification, setShowCookieNotification] = useState(false);
  const [showMenuruFullPage, setShowMenuruFullPage] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const topNavRef = useRef<HTMLDivElement>(null);
  const scrollTextRef = useRef<HTMLDivElement>(null);
  const topicContainerRef = useRef<HTMLDivElement>(null);
  const progressAnimationRef = useRef<gsap.core.Tween | null>(null);
  const menuruButtonRef = useRef<HTMLDivElement>(null);
  const plusSignRef = useRef<HTMLDivElement>(null);
  const backslashRef = useRef<HTMLDivElement>(null);

  // Animasi loading text
  const loadingTexts = [
    "NURU", "MBACA", "NULIS", "NGEXPLORASI", 
    "NEMUKAN", "NCIPTA", "NGGALI", "NARIK",
    "NGAMATI", "NANCANG", "NGEMBANGKAN", "NYUSUN"
  ];

  // Data foto untuk progress bar
  const progressPhotos = [
    { id: 1, src: "images/5.jpg", alt: "Photo 1" },
    { id: 2, src: "images/6.jpg", alt: "Photo 2" },
    { id: 3, src: "images/5.jpg", alt: "Photo 3" }
  ];

  // Data untuk Roles
  const rolesData = [
    { title: "My Roles", description: "Branding & Creative Direction" },
    { title: "Design", description: "Visual identity & UI/UX" },
    { title: "Development", description: "Frontend & Backend" },
    { title: "Features", description: "Functionality & Integration" }
  ];

  useEffect(() => {
    // Cek apakah user sudah menyetujui cookies
    const cookieAccepted = localStorage.getItem('cookiesAccepted');
    if (!cookieAccepted) {
      setTimeout(() => {
        setShowCookieNotification(true);
      }, 2000);
    }

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Animasi loading text
    let currentIndex = 0;
    const textInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % loadingTexts.length;
      setLoadingText(loadingTexts[currentIndex]);
    }, 500);

    // Hentikan loading setelah selesai
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
      clearInterval(textInterval);
    }, 3000);

    // Animasi teks berjalan dari atas ke bawah
    const setupAutoScroll = () => {
      if (scrollTextRef.current) {
        const itemHeight = isMobile ? 80 : 100;
        const totalItems = 15;
        const totalScrollDistance = totalItems * itemHeight - window.innerHeight;
        
        // Hapus animasi sebelumnya jika ada
        gsap.killTweensOf(scrollTextRef.current);
        
        // Animasi infinite loop dari atas ke bawah
        gsap.to(scrollTextRef.current, {
          y: -totalScrollDistance,
          duration: 20,
          ease: "none",
          repeat: -1,
          yoyo: false
        });
      }
    };

    // Setup auto scroll setelah component mount
    setTimeout(setupAutoScroll, 100);
    window.addEventListener('resize', setupAutoScroll);

    // Keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevPhoto();
      } else if (e.key === 'ArrowRight') {
        nextPhoto();
      }
      // ESC untuk keluar dari halaman full page
      if (e.key === 'Escape' && showMenuruFullPage) {
        handleCloseMenuruFullPage();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('resize', setupAutoScroll);
      clearInterval(textInterval);
      clearTimeout(loadingTimeout);
      document.removeEventListener('keydown', handleKeyDown);
      if (scrollTextRef.current) {
        gsap.killTweensOf(scrollTextRef.current);
      }
      if (progressAnimationRef.current) {
        progressAnimationRef.current.kill();
      }
      // Cleanup GSAP animations
      if (plusSignRef.current) {
        gsap.killTweensOf(plusSignRef.current);
      }
      if (backslashRef.current) {
        gsap.killTweensOf(backslashRef.current);
      }
    };
  }, [isMobile, showMenuruFullPage]);

  // Animasi GSAP untuk tanda + di tombol Menuru (hanya pulsing, tidak berputar)
  useEffect(() => {
    if (plusSignRef.current && !showMenuruFullPage) {
      // Hapus animasi sebelumnya
      gsap.killTweensOf(plusSignRef.current);
      
      // Animasi pulsing untuk tanda + (hanya di tombol utama)
      gsap.to(plusSignRef.current, {
        scale: 1.1,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut"
      });
    }
  }, [showMenuruFullPage]);

  // Animasi GSAP untuk tanda \ di halaman full page
  useEffect(() => {
    if (backslashRef.current && showMenuruFullPage) {
      // Hapus animasi sebelumnya
      gsap.killTweensOf(backslashRef.current);
      
      // Animasi continuous rotation untuk tanda \ (360 derajat)
      gsap.to(backslashRef.current, {
        rotation: 360,
        duration: 8,
        repeat: -1,
        ease: "linear"
      });
    }
  }, [showMenuruFullPage]);

  // Fungsi untuk handle cookie acceptance
  const handleAcceptCookies = () => {
    localStorage.setItem('cookiesAccepted', 'true');
    setShowCookieNotification(false);
    
    // Set cookie untuk 30 hari
    const date = new Date();
    date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000));
    document.cookie = `cookiesAccepted=true; expires=${date.toUTCString()}; path=/`;
    
    // Simpan preferensi tema jika ada
    if (localStorage.getItem('themePreference')) {
      const themePref = localStorage.getItem('themePreference');
      document.cookie = `themePreference=${themePref}; expires=${date.toUTCString()}; path=/`;
    }
  };

  // Fungsi untuk maju ke foto berikutnya
  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => {
      const nextIndex = (prev + 1) % progressPhotos.length;
      return nextIndex;
    });
  };

  // Fungsi untuk mundur ke foto sebelumnya
  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => {
      const prevIndex = (prev - 1 + progressPhotos.length) % progressPhotos.length;
      return prevIndex;
    });
  };

  // Start progress animation
  const startProgressAnimation = () => {
    // Hentikan animasi sebelumnya
    if (progressAnimationRef.current) {
      progressAnimationRef.current.kill();
    }

    // Reset semua bar progress menjadi kosong
    const progressFills = document.querySelectorAll('.progress-fill');
    progressFills.forEach(fill => {
      (fill as HTMLElement).style.width = '0%';
    });

    // Mulai animasi untuk bar yang aktif
    const currentFill = document.querySelector(`.progress-fill[data-index="${currentPhotoIndex}"]`) as HTMLElement;
    
    if (currentFill) {
      progressAnimationRef.current = gsap.to(currentFill, {
        width: '100%',
        duration: 15, // SANGAT LAMBAT: 15 detik
        ease: "linear",
        onComplete: () => {
          // Setelah bar penuh, pindah ke foto berikutnya
          if (isProgressActive) {
            nextPhoto();
          }
        }
      });
    }
  };

  // Mulai animasi progress ketika currentPhotoIndex berubah
  useEffect(() => {
    if (isProgressActive) {
      startProgressAnimation();
    }
  }, [currentPhotoIndex, isProgressActive]);

  // Fungsi toggle dark/light mode
  const toggleColorMode = () => {
    setIsDarkMode(!isDarkMode);
    // Simpan preferensi tema ke cookies jika sudah diterima
    const cookieAccepted = localStorage.getItem('cookiesAccepted');
    if (cookieAccepted) {
      localStorage.setItem('themePreference', !isDarkMode ? 'light' : 'dark');
      const date = new Date();
      date.setTime(date.getTime() + (30 * 24 * 60 * 60 * 1000));
      document.cookie = `themePreference=${!isDarkMode ? 'light' : 'dark'}; expires=${date.toUTCString()}; path=/`;
    }
  };

  // Handler untuk topic hover
  const handleTopicHover = (topicId: number | null) => {
    setHoveredTopic(topicId);
  };

  // Fungsi untuk toggle slider
  const toggleSlider = () => {
    if (sliderPosition === "index") {
      setSliderPosition("grid");
      setCurrentView("main");
    } else {
      setSliderPosition("index");
      setCurrentView("index");
    }
  };

  // Fungsi untuk toggle halaman full page MENURU
  const toggleMenuruFullPage = () => {
    setShowMenuruFullPage(!showMenuruFullPage);
  };

  // Handler untuk klik tombol MENURU
  const handleMenuruClick = () => {
    toggleMenuruFullPage();
  };

  // Fungsi untuk menutup halaman full page MENURU (klik tanda \ untuk kembali)
  const handleCloseMenuruFullPage = () => {
    setShowMenuruFullPage(false);
  };

  // Data untuk halaman Index
  const indexTopics = [
    {
      id: 1,
      title: "Personal Journey",
      description: "Exploring self-discovery.",
      date: "2024-03-15"
    },
    {
      id: 2,
      title: "Creative Process",
      description: "Ideas evolution documentation.",
      date: "2024-03-10"
    },
    {
      id: 3,
      title: "Visual Storytelling",
      description: "Photography for personal growth.",
      date: "2024-03-05"
    },
    {
      id: 4,
      title: "Emotional Archive",
      description: "Collection of feelings.",
      date: "2024-02-28"
    },
    {
      id: 5,
      title: "Growth Metrics",
      description: "Tracking development goals.",
      date: "2024-02-20"
    }
  ];

  // Handler untuk klik foto (kiri/kanan)
  const handlePhotoClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    
    // Klik di bagian kiri foto (40% pertama) -> previous
    if (clickX < width * 0.4) {
      prevPhoto();
    }
    // Klik di bagian kanan foto (40% terakhir) -> next
    else if (clickX > width * 0.6) {
      nextPhoto();
    }
    // Klik di tengah -> tidak melakukan apa-apa
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: isDarkMode ? 'black' : '#ff0028',
      margin: 0,
      padding: 0,
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      position: 'relative',
      overflow: 'auto',
      fontFamily: 'Helvetica, Arial, sans-serif',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
      transition: 'background-color 0.5s ease'
    }}>

      {/* Halaman Full Page MENURU */}
      <AnimatePresence>
        {showMenuruFullPage && (
          <motion.div
            key="menuru-fullpage"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'black',
              zIndex: 9998,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Header dengan MENURU \ dan angka di kiri atas */}
            <div style={{
              position: 'absolute',
              top: isMobile ? '3.5rem' : '4.5rem',
              left: 0,
              width: '100%',
              padding: isMobile ? '1rem' : '2rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              boxSizing: 'border-box'
            }}>
              {/* Bagian kiri - MENURU \ dan angka */}
              <div style={{
                display: 'flex',
                flexDirection: 'column'
              }}>
                {/* Teks MENURU \ di kiri */}
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  style={{
                    color: 'white',
                    fontSize: isMobile ? '2rem' : '3rem',
                    fontWeight: '300',
                    fontFamily: 'NeueHaasGrotesk, "Helvetica Neue", Helvetica, Arial, sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: '3px',
                    lineHeight: 1
                  }}
                >
                  MENURU \
                </motion.div>

                {/* Angka 99887 dengan jarak dari judul */}
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  style={{
                    color: 'white',
                    fontSize: isMobile ? '1.5rem' : '2rem',
                    fontWeight: '400',
                    fontFamily: 'NeueHaasGrotesk, "Helvetica Neue", Helvetica, Arial, sans-serif',
                    letterSpacing: '2px',
                    marginTop: isMobile ? '1.5rem' : '2rem'
                  }}
                >
                  99887
                </motion.div>
              </div>

              {/* Tanda \ di kanan dengan animasi GSAP - KLIK UNTUK KEMBALI */}
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                onClick={handleCloseMenuruFullPage}
                style={{
                  width: isMobile ? '40px' : '50px',
                  height: isMobile ? '40px' : '50px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'absolute',
                  right: isMobile ? '1rem' : '2rem',
                  top: isMobile ? '0' : '0.5rem'
                }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Tanda \ (backslash) dengan animasi GSAP */}
                <div 
                  ref={backslashRef}
                  style={{
                    position: 'absolute',
                    width: isMobile ? '25px' : '30px',
                    height: '3px',
                    backgroundColor: 'white',
                    borderRadius: '2px',
                    transform: 'rotate(45deg)',
                    transformOrigin: 'center'
                  }}
                />
              </motion.div>
            </div>

            {/* KONTEN UTAMA DI TENGAH - DIPISAH DARI HEADER */}
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: isMobile ? '1rem' : '2rem',
              width: '100%',
              marginTop: isMobile ? '6rem' : '8rem'
            }}>
              {/* Deskripsi di tengah - BESAR */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                style={{
                  color: 'white',
                  fontSize: isMobile ? '1.2rem' : '1.8rem',
                  fontWeight: '400',
                  fontFamily: 'NeueHaasGrotesk, "Helvetica Neue", Helvetica, Arial, sans-serif',
                  lineHeight: 1.6,
                  textAlign: 'center',
                  maxWidth: isMobile ? '90%' : '70%',
                  marginBottom: isMobile ? '3rem' : '4rem'
                }}
              >
                A personal branding journal documenting emotional journeys and creative exploration through visual storytelling and self-discovery narratives.
              </motion.div>

              {/* Foto di bawah deskripsi - BESAR */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                style={{
                  width: isMobile ? '90%' : '70%',
                  height: isMobile ? '300px' : '500px',
                  overflow: 'hidden',
                  borderRadius: '15px',
                  boxShadow: '0 15px 40px rgba(0,0,0,0.7)',
                  border: '2px solid rgba(255,255,255,0.15)'
                }}
              >
                <img 
                  src="images/5.jpg" 
                  alt="Menuru Visual"
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'block',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    e.currentTarget.style.backgroundColor = '#333';
                    e.currentTarget.style.display = 'flex';
                    e.currentTarget.style.alignItems = 'center';
                    e.currentTarget.style.justifyContent = 'center';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.innerHTML = '<div style="padding: 1rem; text-align: center;">Menuru Image</div>';
                  }}
                />
              </motion.div>

              {/* Roles List di bagian bawah */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: isMobile ? '1.5rem' : '2rem',
                  marginTop: isMobile ? '3rem' : '4rem',
                  maxWidth: isMobile ? '90%' : '60%'
                }}
              >
                {rolesData.map((role, index) => (
                  <motion.div
                    key={role.title}
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.6 + (index * 0.1) }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center'
                    }}
                  >
                    {/* Role title */}
                    <div style={{
                      color: 'white',
                      fontSize: isMobile ? '1rem' : '1.3rem',
                      fontWeight: '500',
                      fontFamily: 'NeueHaasGrotesk, "Helvetica Neue", Helvetica, Arial, sans-serif',
                      letterSpacing: '0.5px',
                      marginBottom: '0.3rem'
                    }}>
                      {role.title}
                    </div>
                    
                    {/* Role description */}
                    <div style={{
                      color: 'white',
                      fontSize: isMobile ? '0.9rem' : '1rem',
                      fontWeight: '400',
                      fontFamily: 'NeueHaasGrotesk, "Helvetica Neue", Helvetica, Arial, sans-serif',
                      opacity: 0.9
                    }}>
                      {role.description}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navigation Bar */}
      <div 
        ref={topNavRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          padding: isMobile ? '0.8rem 1rem' : '1rem 2rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 101,
          boxSizing: 'border-box',
          opacity: 1
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? '1rem' : '2rem',
          backgroundColor: 'transparent',
          backdropFilter: 'blur(10px)',
          borderRadius: '50px',
          padding: isMobile ? '0.6rem 1rem' : '0.8rem 1.5rem',
          border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.3)'}`,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          {/* Docs */}
          <motion.div
            onClick={() => router.push('/docs')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              padding: '0.4rem 0.8rem',
              borderRadius: '25px',
              backgroundColor: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.95)',
              border: isDarkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.3)',
              transition: 'all 0.3s ease'
            }}
            whileHover={{ 
              backgroundColor: 'white',
              scale: 1.05,
              border: '1px solid white'
            }}
          >
            <svg 
              width={isMobile ? "18" : "20"} 
              height={isMobile ? "18" : "20"} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#6366F1"
              strokeWidth="2"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
            <span style={{
              color: '#6366F1',
              fontSize: isMobile ? '0.8rem' : '0.9rem',
              fontWeight: '600',
              fontFamily: 'Helvetica, Arial, sans-serif'
            }}>
              Docs
            </span>
            <div style={{
              backgroundColor: '#EC4899',
              color: 'white',
              fontSize: '0.7rem',
              fontWeight: '700',
              padding: '0.1rem 0.4rem',
              borderRadius: '10px',
              marginLeft: '0.3rem',
              border: 'none'
            }}>
              NEW
            </div>
          </motion.div>

          {/* Chatbot */}
          <motion.div
            onClick={() => router.push('/chatbot')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              padding: '0.4rem 0.8rem',
              borderRadius: '25px',
              backgroundColor: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.95)',
              border: isDarkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.3)',
              transition: 'all 0.3s ease'
            }}
            whileHover={{ 
              backgroundColor: 'white',
              scale: 1.05,
              border: '1px solid white'
            }}
          >
            <svg 
              width={isMobile ? "18" : "20"} 
              height={isMobile ? "18" : "20"} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#6366F1"
              strokeWidth="2"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              <line x1="8" y1="7" x2="16" y2="7"/>
              <line x1="8" y1="11" x2="12" y2="11"/>
            </svg>
            <span style={{
              color: '#6366F1',
              fontSize: isMobile ? '0.8rem' : '0.9rem',
              fontWeight: '600',
              fontFamily: 'Helvetica, Arial, sans-serif'
            }}>
              Chatbot
            </span>
            <div style={{
              backgroundColor: '#EC4899',
              color: 'white',
              fontSize: '0.7rem',
              fontWeight: '700',
              padding: '0.1rem 0.4rem',
              borderRadius: '10px',
              marginLeft: '0.3rem',
              border: 'none'
            }}>
              NEW
            </div>
          </motion.div>

          {/* Update */}
          <motion.div
            onClick={() => router.push('/update')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              padding: '0.4rem 0.8rem',
              borderRadius: '25px',
              backgroundColor: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.95)',
              border: isDarkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.3)',
              transition: 'all 0.3s ease'
            }}
            whileHover={{ 
              backgroundColor: 'white',
              scale: 1.05,
              border: '1px solid white'
            }}
          >
            <svg 
              width={isMobile ? "18" : "20"} 
              height={isMobile ? "18" : "20"} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#6366F1"
              strokeWidth="2"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
            <span style={{
              color: '#6366F1',
              fontSize: isMobile ? '0.8rem' : '0.9rem',
              fontWeight: '600',
              fontFamily: 'Helvetica, Arial, sans-serif'
            }}>
              Update
            </span>
            <div style={{
              backgroundColor: '#EC4899',
              color: 'white',
              fontSize: '0.7rem',
              fontWeight: '700',
              padding: '0.1rem 0.4rem',
              borderRadius: '10px',
              marginLeft: '0.3rem',
              border: 'none'
            }}>
              NEW
            </div>
          </motion.div>

          {/* Timeline */}
          <motion.div
            onClick={() => router.push('/timeline')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              padding: '0.4rem 0.8rem',
              borderRadius: '25px',
              backgroundColor: isDarkMode ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.95)',
              border: isDarkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.3)',
              transition: 'all 0.3s ease'
            }}
            whileHover={{ 
              backgroundColor: 'white',
              scale: 1.05,
              border: '1px solid white'
            }}
          >
            <svg 
              width={isMobile ? "18" : "20"} 
              height={isMobile ? "18" : "20"} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#6366F1"
              strokeWidth="2"
            >
              <polyline points="1 4 1 10 7 10"/>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
              <line x1="12" y1="7" x2="12" y2="13"/>
              <line x1="16" y1="11" x2="12" y2="7"/>
            </svg>
            <span style={{
              color: '#6366F1',
              fontSize: isMobile ? '0.8rem' : '0.9rem',
              fontWeight: '600',
              fontFamily: 'Helvetica, Arial, sans-serif'
            }}>
              Timeline
            </span>
            <div style={{
              backgroundColor: '#EC4899',
              color: 'white',
              fontSize: '0.7rem',
              fontWeight: '700',
              padding: '0.1rem 0.4rem',
              borderRadius: '10px',
              marginLeft: '0.3rem',
              border: 'none'
            }}>
              NEW
            </div>
          </motion.div>
        </div>
      </div>

      {/* Header Section */}
      <div 
        ref={headerRef}
        style={{
          position: 'fixed',
          top: isMobile ? '3.5rem' : '4.5rem',
          left: 0,
          width: '100%',
          padding: isMobile ? '1rem' : '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 100,
          boxSizing: 'border-box',
          opacity: 1
        }}
      >
        {/* Teks "MENURU" dengan animasi loading hanya di bagian NURU */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div style={{
            fontSize: isMobile ? '1.5rem' : '2.5rem',
            fontWeight: '300',
            fontFamily: 'Helvetica, Arial, sans-serif',
            margin: 0,
            letterSpacing: '2px',
            lineHeight: 1,
            textTransform: 'uppercase',
            color: isDarkMode ? 'white' : 'black',
            minHeight: isMobile ? '1.8rem' : '2.8rem',
            display: 'flex',
            alignItems: 'center',
            transition: 'color 0.5s ease'
          }}>
            ME
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.span
                  key={loadingText}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    display: 'inline-block'
                  }}
                >
                  {loadingText}
                </motion.span>
              ) : (
                <motion.span
                  key="nuru-final"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  NURU
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Right Side Buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? '0.8rem' : '1rem'
        }}>
          {/* Color Mode Toggle Button */}
          <motion.button
            onClick={toggleColorMode}
            style={{
              padding: isMobile ? '0.4rem 0.8rem' : '0.6rem 1rem',
              fontSize: isMobile ? '0.8rem' : '1rem',
              fontWeight: '600',
              color: 'white',
              backgroundColor: 'transparent',
              border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.3)'}`,
              borderRadius: '50px',
              cursor: 'pointer',
              fontFamily: 'Helvetica, Arial, sans-serif',
              backdropFilter: 'blur(10px)',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '0.3rem' : '0.5rem',
              margin: 0,
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            whileHover={{ 
              backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
              scale: 1.05,
              border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.5)'}`,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ rotate: isDarkMode ? 0 : 180 }}
              transition={{ duration: 0.5 }}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </motion.div>
            {isMobile ? '' : (isDarkMode ? 'LIGHT' : 'DARK')}
          </motion.button>

          {/* Sign In Button */}
          <motion.button
            onClick={() => router.push('/signin')}
            style={{
              padding: isMobile ? '0.4rem 1rem' : '0.6rem 1.5rem',
              fontSize: isMobile ? '0.9rem' : '1.5rem',
              fontWeight: '600',
              color: 'white',
              backgroundColor: 'transparent',
              border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.3)'}`,
              borderRadius: '50px',
              cursor: 'pointer',
              fontFamily: 'Helvetica, Arial, sans-serif',
              backdropFilter: 'blur(10px)',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '0.3rem' : '0.5rem',
              margin: 0,
              maxWidth: isMobile ? '120px' : 'none',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            whileHover={{ 
              backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
              scale: 1.05,
              border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.5)'}`,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.95 }}
          >
            <svg 
              width={isMobile ? "18" : "30"} 
              height={isMobile ? "18" : "30"} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            {isMobile ? 'SIGN IN' : 'SIGN IN'}
          </motion.button>
        </div>
      </div>

      {/* Main Content Container */}
      <div style={{
        width: '100%',
        paddingTop: isMobile ? '8rem' : '12rem',
        boxSizing: 'border-box',
        zIndex: 10,
        position: 'relative'
      }}>
        {/* AnimatePresence untuk transisi antara view */}
        <AnimatePresence mode="wait">
          {currentView === "main" && (
            <motion.div
              key="main-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Deskripsi MENURU - 3 baris */}
              <div style={{
                marginBottom: isMobile ? '2rem' : '3rem',
                paddingLeft: isMobile ? '0.5rem' : '1rem',
                paddingRight: isMobile ? '0.5rem' : '1rem'
              }}>
                <p style={{
                  color: isDarkMode ? 'white' : 'black',
                  fontSize: isMobile ? '1.8rem' : '3.5rem',
                  fontWeight: '400',
                  fontFamily: 'HelveticaNowDisplay, Arial, sans-serif',
                  lineHeight: 1.3,
                  margin: 0,
                  marginBottom: isMobile ? '1.5rem' : '2rem',
                  transition: 'color 0.5s ease',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word'
                }}>
                  Menuru is a branding personal journal life with a experiences of self about happy, sad, angry, etc. It's a creative exploration of personal growth and emotional journey. Through visual storytelling we capture moments of transformation and self-discovery.
                </p>

                {/* Container untuk 2 foto - LEBIH MENTOK KE LAYAR */}
                <div style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: isMobile ? '1rem' : '0.3rem',
                  width: 'calc(100% - 2rem)',
                  marginLeft: isMobile ? '0.5rem' : '1rem',
                  marginRight: isMobile ? '0.5rem' : '1rem',
                  marginTop: '1rem'
                }}>
                  {/* Foto 1 - Sisi kiri, SANGAT PANJANG */}
                  <div style={{
                    flex: 1,
                    overflow: 'hidden',
                    borderRadius: '25px',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                    border: `3px solid ${isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
                    width: '100%',
                    position: 'relative',
                    zIndex: 1,
                    height: isMobile ? '500px' : '1200px'
                  }}>
                    <img 
                      src="images/5.jpg" 
                      alt="Menuru Visual Left"
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'block',
                        objectFit: 'cover',
                        borderRadius: '22px'
                      }}
                      onError={(e) => {
                        console.error("Gambar kiri tidak ditemukan:", e);
                        e.currentTarget.style.backgroundColor = isDarkMode ? '#333' : '#eee';
                        e.currentTarget.style.display = 'flex';
                        e.currentTarget.style.alignItems = 'center';
                        e.currentTarget.style.justifyContent = 'center';
                        e.currentTarget.style.color = isDarkMode ? '#fff' : '#000';
                        e.currentTarget.style.height = '100%';
                        e.currentTarget.innerHTML = '<div style="padding: 2rem; text-align: center;">Left Image</div>';
                      }}
                    />
                  </div>

                  {/* Foto 2 - Sisi kanan, SANGAT PANJANG */}
                  <div style={{
                    flex: 1,
                    overflow: 'hidden',
                    borderRadius: '25px',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                    border: `3px solid ${isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
                    width: '100%',
                    position: 'relative',
                    zIndex: 1,
                    height: isMobile ? '500px' : '1200px'
                  }}>
                    <img 
                      src="images/6.jpg" 
                      alt="Menuru Visual Right"
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'block',
                        objectFit: 'cover',
                        borderRadius: '22px'
                      }}
                      onError={(e) => {
                        console.error("Gambar kanan tidak ditemukan:", e);
                        e.currentTarget.style.backgroundColor = isDarkMode ? '#333' : '#eee';
                        e.currentTarget.style.display = 'flex';
                        e.currentTarget.style.alignItems = 'center';
                        e.currentTarget.style.justifyContent = 'center';
                        e.currentTarget.style.color = isDarkMode ? '#fff' : '#000';
                        e.currentTarget.style.height = '100%';
                        e.currentTarget.innerHTML = '<div style="padding: 2rem; text-align: center;">Right Image</div>';
                      }}
                    />
                  </div>
                </div>

                {/* Card #0050B7 dengan 4 foto images/5.jpg - FOTO LEBIH LEBAR KE SAMPING */}
                <div
                  style={{
                    width: 'calc(100% - 4rem)',
                    marginLeft: isMobile ? '1rem' : '2rem',
                    marginRight: isMobile ? '1rem' : '2rem',
                    backgroundColor: '#0050B7',
                    borderRadius: '25px',
                    height: isMobile ? '500px' : '800px',
                    marginTop: isMobile ? '1rem' : '1.5rem',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                    position: 'relative',
                    overflow: 'hidden',
                    border: '3px solid rgba(255,255,255,0.1)',
                    padding: isMobile ? '1.5rem' : '2rem',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start'
                  }}
                >
                  {/* Container untuk 4 foto images/5.jpg - GRID TETAP SAMA */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                    gridTemplateRows: '1fr',
                    gap: isMobile ? '1rem' : '1.5rem',
                    width: '100%',
                    height: '100%',
                    alignItems: 'flex-start',
                    justifyContent: 'center'
                  }}>
                    {/* Foto 1 - images/5.jpg - LEBIH LEBAR KE SAMPING */}
                    <div style={{
                      overflow: 'hidden',
                      borderRadius: '20px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                      border: '2px solid rgba(255,255,255,0.2)',
                      width: '100%',
                      height: isMobile ? '600px' : '600px',
                      position: 'relative'
                    }}>
                      <img 
                        src="images/5.jpg" 
                        alt="Portrait 1"
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'block',
                          objectFit: 'cover',
                          borderRadius: '18px'
                        }}
                        onError={(e) => {
                          console.error("Gambar portrait 1 tidak ditemukan:", e);
                          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                          e.currentTarget.style.display = 'flex';
                          e.currentTarget.style.alignItems = 'center';
                          e.currentTarget.style.justifyContent = 'center';
                          e.currentTarget.style.color = 'white';
                          e.currentTarget.innerHTML = '<div style="padding: 1rem; text-align: center;">Image 5</div>';
                        }}
                      />
                    </div>

                    {/* Foto 2 - images/5.jpg - LEBIH LEBAR KE SAMPING */}
                    <div style={{
                      overflow: 'hidden',
                      borderRadius: '20px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                      border: '2px solid rgba(255,255,255,0.2)',
                      width: '100%',
                      height: isMobile ? '600px' : '600px',
                      position: 'relative'
                    }}>
                      <img 
                        src="images/5.jpg" 
                        alt="Portrait 2"
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'block',
                          objectFit: 'cover',
                          borderRadius: '18px'
                        }}
                        onError={(e) => {
                          console.error("Gambar portrait 2 tidak ditemukan:", e);
                          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                          e.currentTarget.style.display = 'flex';
                          e.currentTarget.style.alignItems = 'center';
                          e.currentTarget.style.justifyContent = 'center';
                          e.currentTarget.style.color = 'white';
                          e.currentTarget.innerHTML = '<div style="padding: 1rem; text-align: center;">Image 5</div>';
                        }}
                      />
                    </div>

                    {/* Foto 3 - images/5.jpg - LEBIH LEBAR KE SAMPING */}
                    <div style={{
                      overflow: 'hidden',
                      borderRadius: '20px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                      border: '2px solid rgba(255,255,255,0.2)',
                      width: '100%',
                      height: isMobile ? '600px' : '600px',
                      position: 'relative'
                    }}>
                      <img 
                        src="images/5.jpg" 
                        alt="Portrait 3"
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'block',
                          objectFit: 'cover',
                          borderRadius: '18px'
                        }}
                        onError={(e) => {
                          console.error("Gambar portrait 3 tidak ditemukan:", e);
                          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                          e.currentTarget.style.display = 'flex';
                          e.currentTarget.style.alignItems = 'center';
                          e.currentTarget.style.justifyContent = 'center';
                          e.currentTarget.style.color = 'white';
                          e.currentTarget.innerHTML = '<div style="padding: 1rem; text-align: center;">Image 5</div>';
                        }}
                      />
                    </div>

                    {/* Foto 4 - images/5.jpg - LEBIH LEBAR KE SAMPING */}
                    <div style={{
                      overflow: 'hidden',
                      borderRadius: '20px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                      border: '2px solid rgba(255,255,255,0.2)',
                      width: '100%',
                      height: isMobile ? '600px' : '600px',
                      position: 'relative'
                    }}>
                      <img 
                        src="images/5.jpg" 
                        alt="Portrait 4"
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'block',
                          objectFit: 'cover',
                          borderRadius: '18px'
                        }}
                        onError={(e) => {
                          console.error("Gambar portrait 4 tidak ditemukan:", e);
                          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                          e.currentTarget.style.display = 'flex';
                          e.currentTarget.style.alignItems = 'center';
                          e.currentTarget.style.justifyContent = 'center';
                          e.currentTarget.style.color = 'white';
                          e.currentTarget.innerHTML = '<div style="padding: 1rem; text-align: center;">Image 5</div>';
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Container untuk Tombol Slider dan Teks MENURU + di sebelah kanan */}
                <div style={{
                  position: 'relative',
                  marginTop: isMobile ? '3rem' : '4rem',
                  marginBottom: isMobile ? '4rem' : '6rem',
                  paddingLeft: isMobile ? '1rem' : '2rem',
                  paddingRight: isMobile ? '1rem' : '2rem',
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  justifyContent: 'space-between',
                  alignItems: isMobile ? 'flex-start' : 'center',
                  gap: isMobile ? '2rem' : '0'
                }}>
                  {/* Tombol Slider Index/Grid di kiri */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.5rem'
                  }}>
                    {/* Tombol Slider - lebih besar */}
                    <motion.button
                      onClick={toggleSlider}
                      style={{
                        width: '120px',
                        height: '50px',
                        backgroundColor: '#0050B7',
                        border: 'none',
                        borderRadius: '25px',
                        cursor: 'pointer',
                        padding: 0,
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        overflow: 'hidden'
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {/* Track */}
                      <div style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0 15px',
                        boxSizing: 'border-box'
                      }}>
                        <span style={{
                          color: 'white',
                          fontSize: '1rem',
                          fontWeight: '700',
                          fontFamily: 'Helvetica, Arial, sans-serif',
                          opacity: sliderPosition === "index" ? 1 : 0.5
                        }}>
                          INDEX
                        </span>
                        <span style={{
                          color: 'white',
                          fontSize: '1rem',
                          fontWeight: '700',
                          fontFamily: 'Helvetica, Arial, sans-serif',
                          opacity: sliderPosition === "grid" ? 1 : 0.5
                        }}>
                          GRID
                        </span>
                      </div>
                      
                      {/* Slider Dot - Hijau cerah lebih besar */}
                      <motion.div
                        animate={{ x: sliderPosition === "index" ? 15 : 65 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        style={{
                          width: '35px',
                          height: '35px',
                          backgroundColor: '#00FF00',
                          borderRadius: '50%',
                          position: 'absolute',
                          left: '7px',
                          boxShadow: '0 0 15px rgba(0, 255, 0, 0.7)'
                        }}
                      />
                    </motion.button>

                    {/* Label status - lebih besar */}
                    <div style={{
                      color: isDarkMode ? 'white' : 'black',
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      fontFamily: 'Helvetica, Arial, sans-serif'
                    }}>
                      {sliderPosition === "index" ? "Index View" : "Grid View"}
                    </div>
                  </div>

                  {/* Teks MENURU dengan animasi Plus (+) di sebelah kanan - TAMPIL DI SEMUA DEVICE */}
                  <motion.div
                    ref={menuruButtonRef}
                    onClick={handleMenuruClick}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: '0.5rem',
                      cursor: 'pointer',
                      marginTop: isMobile ? '1rem' : '0',
                      width: isMobile ? '100%' : 'auto'
                    }}
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div style={{
                      color: isDarkMode ? 'white' : 'black',
                      fontSize: isMobile ? '1.8rem' : '2rem',
                      fontWeight: '300',
                      fontFamily: 'Helvetica, Arial, sans-serif',
                      textTransform: 'uppercase',
                      letterSpacing: '2px',
                      position: 'relative'
                    }}>
                      MENURU
                    </div>
                    
                    {/* Simbol Plus (+) dengan animasi GSAP (hanya pulsing) */}
                    <div 
                      ref={plusSignRef}
                      className="plus-sign" 
                      style={{
                        width: isMobile ? '35px' : '40px',
                        height: isMobile ? '35px' : '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        marginLeft: '0.5rem'
                      }}
                    >
                      {/* Garis vertikal */}
                      <div style={{
                        position: 'absolute',
                        width: '2px',
                        height: isMobile ? '18px' : '20px',
                        backgroundColor: isDarkMode ? 'white' : 'black',
                        borderRadius: '1px'
                      }} />
                      {/* Garis horizontal */}
                      <div style={{
                        position: 'absolute',
                        width: isMobile ? '18px' : '20px',
                        height: '2px',
                        backgroundColor: isDarkMode ? 'white' : 'black',
                        borderRadius: '1px'
                      }} />
                    </div>
                  </motion.div>
                </div>

                {/* Progress Bar dengan 3 Foto - DIPERBAIKI */}
                <div style={{
                  width: '100%',
                  padding: isMobile ? '1rem' : '2rem',
                  marginTop: isMobile ? '2rem' : '3rem',
                  marginBottom: isMobile ? '2rem' : '3rem',
                  boxSizing: 'border-box'
                }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: isMobile ? '1.5rem' : '2rem',
                    alignItems: 'center',
                    maxWidth: '800px',
                    margin: '0 auto'
                  }}>
                    {/* Container Progress Bar - PANJANG dan GEMUK */}
                    <div style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: isMobile ? '0.5rem' : '0.8rem',
                      marginBottom: '1rem'
                    }}>
                      {progressPhotos.map((_, index) => (
                        <div 
                          key={index}
                          style={{
                            flex: 1,
                            height: '12px',
                            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            position: 'relative'
                          }}
                        >
                          {/* Progress Fill - PUTIH GEMUK */}
                          <div
                            className="progress-fill"
                            data-index={index}
                            style={{
                              position: 'absolute',
                              left: 0,
                              top: 0,
                              bottom: 0,
                              backgroundColor: 'white',
                              borderRadius: '6px',
                              width: index === currentPhotoIndex ? '100%' : (index < currentPhotoIndex ? '100%' : '0%')
                            }}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Foto Portrait - PANJANG KE BAWAH */}
                    <motion.div
                      onClick={handlePhotoClick}
                      style={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: '600px',
                        height: isMobile ? '600px' : '900px',
                        borderRadius: '15px',
                        overflow: 'hidden',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.4)',
                        border: `2px solid ${isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`,
                        cursor: 'pointer',
                        margin: '0 auto'
                      }}
                      whileHover={{ scale: 1.01 }}
                    >
                      {/* Foto Aktif */}
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentPhotoIndex}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          style={{
                            width: '100%',
                            height: '100%'
                          }}
                        >
                          <img 
                            src={progressPhotos[currentPhotoIndex].src}
                            alt={progressPhotos[currentPhotoIndex].alt}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              display: 'block'
                            }}
                            onError={(e) => {
                              e.currentTarget.style.backgroundColor = isDarkMode ? '#222' : '#ddd';
                              e.currentTarget.style.display = 'flex';
                              e.currentTarget.style.alignItems = 'center';
                              e.currentTarget.style.justifyContent = 'center';
                              e.currentTarget.style.color = isDarkMode ? '#fff' : '#000';
                              e.currentTarget.innerHTML = `<div style="padding: 2rem; text-align: center;">Photo ${currentPhotoIndex + 1}</div>`;
                            }}
                          />
                        </motion.div>
                      </AnimatePresence>

                      {/* Overlay untuk navigasi klik */}
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        pointerEvents: 'none'
                      }}>
                        {/* Area klik kiri (40% pertama) */}
                        <div 
                          style={{
                            flex: 4,
                            backgroundColor: 'transparent',
                            pointerEvents: 'auto',
                            cursor: 'pointer'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            prevPhoto();
                          }}
                        />
                        
                        {/* Area tengah (20%) - tidak melakukan apa-apa */}
                        <div style={{
                          flex: 2,
                          backgroundColor: 'transparent'
                        }} />
                        
                        {/* Area klik kanan (40% terakhir) */}
                        <div 
                          style={{
                            flex: 4,
                            backgroundColor: 'transparent',
                            pointerEvents: 'auto',
                            cursor: 'pointer'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            nextPhoto();
                          }}
                        />
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Content tambahan untuk membuat halaman lebih panjang */}
                <div style={{
                  height: '100vh',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: isMobile ? '3rem' : '5rem',
                  zIndex: 10,
                  position: 'relative'
                }}>
                  <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    style={{
                      color: isDarkMode ? 'white' : 'black',
                      fontSize: isMobile ? '1.5rem' : '2rem',
                      fontWeight: '300',
                      textAlign: 'center',
                      maxWidth: '600px',
                      padding: '0 2rem'
                    }}
                  >
                    More content coming soon...
                  </motion.p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Halaman Index */}
          {currentView === "index" && (
            <motion.div
              key="index-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                width: '100%',
                minHeight: '100vh',
                padding: isMobile ? '1rem' : '2rem',
                boxSizing: 'border-box',
                position: 'relative'
              }}
            >
              {/* Garis bawah di atas MENURU - putih pudar */}
              <div style={{
                width: '100%',
                height: '1px',
                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                marginBottom: '3rem'
              }}></div>

              {/* Container utama untuk halaman Index - 4 kolom (MENURU + Gambar + Topics + Deskripsi) */}
              <div ref={topicContainerRef} style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? '1.5rem' : '4rem',
                width: '100%',
                fontFamily: 'Helvetica, Arial, sans-serif',
                position: 'relative'
              }}>
                {/* Kolom 1 - MENURU */}
                <div style={{
                  flex: 1
                }}>
                  <div style={{
                    color: isDarkMode ? 'white' : 'black',
                    fontSize: isMobile ? '1.8rem' : '2.5rem',
                    fontWeight: '300',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    lineHeight: 1
                  }}>
                    MENURU
                  </div>
                </div>

                {/* Kolom 2 - Gambar Hover */}
                <div style={{
                  flex: 1,
                  position: 'relative',
                  minHeight: isMobile ? '400px' : '600px'
                }}>
                  <AnimatePresence>
                    {hoveredTopic !== null && (
                      <motion.div
                        key="hovered-image"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%'
                        }}
                      >
                        {/* Gambar normal */}
                        <motion.div
                          initial={{ scale: 0.95 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0.95 }}
                          transition={{ duration: 0.4 }}
                          style={{
                            width: '100%',
                            height: '100%',
                            overflow: 'hidden',
                            borderRadius: '15px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                            border: '1px solid rgba(255,255,255,0.1)'
                          }}
                        >
                          <img 
                            src="images/5.jpg" 
                            alt={`Topic ${hoveredTopic}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              display: 'block',
                              objectFit: 'cover'
                            }}
                            onError={(e) => {
                              console.error("Gambar topic tidak ditemukan:", e);
                              e.currentTarget.style.backgroundColor = isDarkMode ? '#333' : '#eee';
                              e.currentTarget.style.display = 'flex';
                              e.currentTarget.style.alignItems = 'center';
                              e.currentTarget.style.justifyContent = 'center';
                              e.currentTarget.style.color = isDarkMode ? '#fff' : '#000';
                              e.currentTarget.innerHTML = '<div style="padding: 2rem; text-align: center;">Topic Image</div>';
                            }}
                          />
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Kolom 3 - Topics */}
                <div style={{
                  flex: 1,
                  position: 'relative'
                }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.3rem',
                    fontFamily: 'Helvetica, Arial, sans-serif'
                  }}>
                    {indexTopics.map((topic, index) => (
                      <div 
                        key={topic.id}
                        onMouseEnter={() => handleTopicHover(topic.id)}
                        onMouseLeave={() => handleTopicHover(null)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          position: 'relative',
                          padding: isMobile ? '0.8rem 0' : '1rem 0',
                          cursor: 'pointer'
                        }}
                      >
                        {/* Garis putih pudar saat hover - mentok ke kanan */}
                        <AnimatePresence>
                          {hoveredTopic === topic.id && (
                            <motion.div
                              initial={{ width: 0, opacity: 0 }}
                              animate={{ width: '100%', opacity: 1 }}
                              exit={{ width: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              style={{
                                position: 'absolute',
                                left: 0,
                                top: '50%',
                                height: '1px',
                                backgroundColor: 'rgba(255,255,255,0.3)',
                                transform: 'translateY(-50%)',
                                zIndex: 1
                              }}
                            />
                          )}
                        </AnimatePresence>

                        {/* Teks topic */}
                        <motion.div
                          style={{
                            color: isDarkMode ? 'white' : 'black',
                            fontSize: isMobile ? '1.2rem' : '1.5rem',
                            fontWeight: hoveredTopic === topic.id ? '600' : '400',
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            lineHeight: 1.1,
                            position: 'relative',
                            zIndex: 2,
                            transition: 'font-weight 0.2s ease'
                          }}
                          whileHover={{ x: 5 }}
                        >
                          {topic.title}
                        </motion.div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Kolom 4 - Deskripsi dan Tanggal SEJAJAR */}
                <div style={{
                  flex: 1
                }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.3rem',
                    fontFamily: 'Helvetica, Arial, sans-serif'
                  }}>
                    {indexTopics.map((topic, index) => (
                      <div 
                        key={topic.id}
                        onMouseEnter={() => handleTopicHover(topic.id)}
                        onMouseLeave={() => handleTopicHover(null)}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          padding: isMobile ? '0.8rem 0' : '1rem 0',
                          cursor: 'pointer'
                        }}
                      >
                        {/* Container untuk deskripsi dan tanggal SEJAJAR */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'baseline',
                          gap: '0.5rem'
                        }}>
                          <motion.div
                            style={{
                              color: isDarkMode ? 'white' : 'black',
                              fontSize: isMobile ? '1.2rem' : '1.5rem',
                              fontWeight: hoveredTopic === topic.id ? '600' : '400',
                              fontFamily: 'Helvetica, Arial, sans-serif',
                              lineHeight: 1.1,
                              transition: 'font-weight 0.2s ease'
                            }}
                            whileHover={{ x: 5 }}
                          >
                            {topic.description}
                          </motion.div>
                          {/* Tanggal SEJAJAR dengan deskripsi */}
                          <div style={{
                            color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
                            fontSize: isMobile ? '1.2rem' : '1.5rem',
                            fontWeight: '400',
                            fontFamily: 'Helvetica, Arial, sans-serif',
                            lineHeight: 1.1
                          }}>
                            {topic.date}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Container untuk Tombol Slider */}
              <div style={{
                position: 'relative',
                marginTop: '4rem',
                marginBottom: '4rem',
                paddingLeft: isMobile ? '1rem' : '2rem',
                paddingRight: isMobile ? '1rem' : '2rem',
                display: 'flex',
                justifyContent: 'flex-start'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem'
                }}>
                  {/* Tombol Slider - lebih besar */}
                  <motion.button
                    onClick={toggleSlider}
                    style={{
                      width: '120px',
                      height: '50px',
                      backgroundColor: '#0050B7',
                      border: 'none',
                      borderRadius: '25px',
                      cursor: 'pointer',
                      padding: 0,
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      overflow: 'hidden'
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* Track */}
                    <div style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0 15px',
                      boxSizing: 'border-box'
                    }}>
                      <span style={{
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: '700',
                        fontFamily: 'Helvetica, Arial, sans-serif',
                        opacity: 1
                      }}>
                        INDEX
                      </span>
                      <span style={{
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: '700',
                        fontFamily: 'Helvetica, Arial, sans-serif',
                        opacity: 0.5
                      }}>
                        GRID
                      </span>
                    </div>
                    
                    {/* Slider Dot - Hijau cerah lebih besar */}
                    <motion.div
                      animate={{ x: 15 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      style={{
                        width: '35px',
                        height: '35px',
                        backgroundColor: '#00FF00',
                        borderRadius: '50%',
                        position: 'absolute',
                        left: '7px',
                        boxShadow: '0 0 15px rgba(0, 255, 0, 0.7)'
                      }}
                    />
                  </motion.button>

                  {/* Label status - lebih besar */}
                  <div style={{
                    color: isDarkMode ? 'white' : 'black',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    fontFamily: 'Helvetica, Arial, sans-serif'
                  }}>
                    Index View
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Halaman Grid (placeholder) */}
          {currentView === "grid" && (
            <motion.div
              key="grid-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                width: '100%',
                minHeight: '100vh',
                padding: isMobile ? '1rem' : '2rem',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <h2 style={{
                color: isDarkMode ? 'white' : 'black',
                fontSize: isMobile ? '2rem' : '3rem',
                fontWeight: '300',
                marginBottom: '2rem'
              }}>
                Grid View - Coming Soon
              </h2>
              
              {/* Tombol Slider di bawah content */}
              <div style={{
                marginTop: '3rem',
                display: 'flex',
                justifyContent: 'center'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem'
                }}>
                  {/* Tombol Slider - lebih besar */}
                  <motion.button
                    onClick={toggleSlider}
                    style={{
                      width: '120px',
                      height: '50px',
                      backgroundColor: '#0050B7',
                      border: 'none',
                      borderRadius: '25px',
                      cursor: 'pointer',
                      padding: 0,
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      overflow: 'hidden'
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* Track */}
                    <div style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0 15px',
                      boxSizing: 'border-box'
                    }}>
                      <span style={{
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: '700',
                        fontFamily: 'Helvetica, Arial, sans-serif',
                        opacity: 0.5
                      }}>
                        INDEX
                      </span>
                      <span style={{
                        color: 'white',
                        fontSize: '1rem',
                        fontWeight: '700',
                        fontFamily: 'Helvetica, Arial, sans-serif',
                        opacity: 1
                      }}>
                        GRID
                      </span>
                    </div>
                    
                    {/* Slider Dot - Hijau cerah lebih besar */}
                    <motion.div
                      animate={{ x: 65 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      style={{
                        width: '35px',
                        height: '35px',
                        backgroundColor: '#00FF00',
                        borderRadius: '50%',
                        position: 'absolute',
                        left: '7px',
                        boxShadow: '0 0 15px rgba(0, 255, 0, 0.7)'
                      }}
                    />
                  </motion.button>

                  {/* Label status - lebih besar */}
                  <div style={{
                    color: isDarkMode ? 'white' : 'black',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    fontFamily: 'Helvetica, Arial, sans-serif'
                  }}>
                    Grid View
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Cookie Notification */}
      <AnimatePresence>
        {showCookieNotification && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'fixed',
              bottom: '1rem',
              left: '50%',
              transform: 'translateX(-50%)',
              width: isMobile ? '90%' : '700px',
              backgroundColor: 'white',
              borderRadius: '15px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
              zIndex: 1000,
              overflow: 'hidden',
              display: 'flex',
              border: '2px solid rgba(0,0,0,0.1)'
            }}
          >
            {/* Bagian putih untuk teks dan icon */}
            <div style={{
              flex: 1,
              padding: isMobile ? '1.2rem' : '1.8rem',
              backgroundColor: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '0.8rem' : '1.2rem'
            }}>
              {/* Icon Cookies */}
              <div style={{
                width: isMobile ? '40px' : '50px',
                height: isMobile ? '40px' : '50px',
                backgroundColor: '#FBBF24',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <svg 
                  width={isMobile ? "20" : "25"} 
                  height={isMobile ? "20" : "25"} 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="#92400E"
                  strokeWidth="2"
                >
                  <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/>
                  <path d="M8.5 8.5v.01"/>
                  <path d="M16 15.5v.01"/>
                  <path d="M12 12v.01"/>
                  <path d="M11 17v.01"/>
                  <path d="M7 14v.01"/>
                </svg>
              </div>
              
              {/* Teks Cookies */}
              <div style={{
                flex: 1
              }}>
                <p style={{
                  margin: 0,
                  fontSize: isMobile ? '0.85rem' : '0.95rem',
                  color: 'black',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  lineHeight: 1.5
                }}>
                  Kami menggunakan cookie untuk meningkatkan pengalaman Anda di website ini. 
                  Cookie membantu kami mengingat preferensi Anda dan membuat website berfungsi lebih baik.
                </p>
              </div>
            </div>

            {/* Tombol OK - Hitam */}
            <button
              onClick={handleAcceptCookies}
              style={{
                width: isMobile ? '80px' : '100px',
                backgroundColor: 'black',
                color: 'white',
                border: 'none',
                fontSize: isMobile ? '0.9rem' : '1rem',
                fontWeight: '600',
                fontFamily: 'Helvetica, Arial, sans-serif',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                padding: 0
              }}
            >
              OK
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
