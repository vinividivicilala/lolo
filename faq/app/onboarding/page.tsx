'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

const slides = [
  {
    image: '/images/5.jpg',
    title: 'Mulai Berbagi Kebaikan',
    desc: 'Buat kegiatan donasi dan bagikan kebaikan kepada yang membutuhkan',
  },
  {
    image: '/images/5.jpg',
    title: 'Donasi dengan Mudah',
    desc: 'Donasi kapan saja, di mana saja dengan proses yang cepat dan aman',
  },
  {
    image: '/images/5.jpg',
    title: 'Bagikan Cerita',
    desc: 'Ceritakan pengalaman donasi Anda dan inspirasi orang lain',
  },
  {
    image: '/images/5.jpg',
    title: 'Leaderboard Donatur',
    desc: 'Lihat peringkat donatur dan berkompetisi dalam kebaikan',
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Progress bar animation for each slide
  useEffect(() => {
    setProgress(0);
    
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    const stepTime = 30;
    const totalSteps = 3000 / stepTime;
    let currentStep = 0;
    
    progressIntervalRef.current = setInterval(() => {
      currentStep++;
      const newProgress = (currentStep / totalSteps) * 100;
      
      if (newProgress >= 100) {
        setProgress(100);
        clearInterval(progressIntervalRef.current!);
        
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % slides.length);
        }, 50);
      } else {
        setProgress(newProgress);
      }
    }, stepTime);
    
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [currentIndex]);

  // Mouse/Touch drag handlers for swipe
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setDragStartX(clientX);
  };

  const handleDragEnd = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX;
    const diff = clientX - dragStartX;
    const threshold = 50;
    
    if (diff > threshold) {
      setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    } else if (diff < -threshold) {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }
  };

  const goToSlide = (index: number) => {
    if (index === currentIndex) return;
    setCurrentIndex(index);
  };

  const handleSkip = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    router.push('/');
  };

  const handleSignUp = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    router.push('/register');
  };

  const handleSignIn = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    router.push('/login');
  };

  return (
    <div style={styles.wrapper}>
      <div 
        style={styles.container}
        onMouseDown={handleDragStart}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchEnd={handleDragEnd}
      >
        {/* Header - iOS Style */}
        <div style={styles.header}>
          <div style={styles.logo}>Menuru</div>
          <button onClick={handleSkip} style={styles.skipButton}>
            Lewati
          </button>
        </div>

        {/* Main Content */}
        <div style={styles.content}>
          {/* Image - Portrait */}
          <div style={styles.imageWrapper}>
            <AnimatePresence mode="wait">
              <motion.img
                key={currentIndex}
                src={slides[currentIndex].image}
                alt={slides[currentIndex].title}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                style={styles.image}
                draggable={false}
              />
            </AnimatePresence>
          </div>

          {/* Title */}
          <motion.h2
            key={`title-${currentIndex}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={styles.title}
          >
            {slides[currentIndex].title}
          </motion.h2>

          {/* Description */}
          <motion.p
            key={`desc-${currentIndex}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            style={styles.description}
          >
            {slides[currentIndex].desc}
          </motion.p>

          {/* Pagination Dots - Small dot becomes wide bar when active */}
          <div style={styles.dotsContainer}>
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                style={styles.dotWrapper}
              >
                {idx === currentIndex ? (
                  // Active slide - Wide bar with fill animation
                  <div style={styles.activeDotContainer}>
                    <div style={styles.activeDotBg}>
                      <motion.div
                        style={{
                          ...styles.activeDotFill,
                          width: `${progress}%`,
                          backgroundColor: '#8be9fd',
                        }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.03 }}
                      />
                    </div>
                  </div>
                ) : (
                  // Inactive slide - Small dot
                  <div style={styles.inactiveDot} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Buttons - iOS Style */}
        <div style={styles.bottom}>
          <button onClick={handleSignUp} style={styles.primaryButton}>
            Daftar
          </button>
          <div style={styles.signInWrapper}>
            <span style={styles.signInText}>Sudah punya akun? </span>
            <button onClick={handleSignIn} style={styles.linkButton}>
              Masuk
            </button>
          </div>
        </div>

        {/* Home Indicator for iOS */}
        <div style={styles.homeIndicator}>
          <div style={styles.homeIndicatorBar} />
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  wrapper: {
    height: '100vh',
    width: '100vw',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
    overflow: 'hidden',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    width: '100%',
    maxWidth: '400px',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '20px 24px 0 24px',
    backgroundColor: '#000',
    color: '#fff',
    position: 'relative',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    cursor: 'grab',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 'env(safe-area-inset-top)',
    position: 'relative',
    zIndex: 10,
  },
  logo: {
    fontSize: '22px',
    fontWeight: '600',
    color: '#fff',
    letterSpacing: '-0.3px',
  },
  skipButton: {
    background: 'none',
    border: 'none',
    fontSize: '15px',
    fontWeight: '500',
    color: '#8e8e93',
    cursor: 'pointer',
    fontFamily: 'inherit',
    padding: '8px 12px',
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  imageWrapper: {
    marginBottom: '40px',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
  image: {
    width: '280px',
    height: '360px',
    borderRadius: '28px',
    objectFit: 'cover',
    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
    pointerEvents: 'none',
  },
  title: {
    fontSize: '26px',
    fontWeight: '600',
    marginBottom: '12px',
    color: '#fff',
    letterSpacing: '-0.3px',
  },
  description: {
    fontSize: '15px',
    color: '#8e8e93',
    lineHeight: '1.4',
    maxWidth: '280px',
    margin: '0 auto',
  },
  dotsContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '12px',
    marginTop: '48px',
  },
  dotWrapper: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
  },
  // Inactive dot - small circle
  inactiveDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#3a3a3c',
    transition: 'all 0.3s ease',
  },
  // Active dot container - wide bar
  activeDotContainer: {
    width: '48px',
    height: '8px',
  },
  activeDotBg: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2c2c2e',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  activeDotFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.03s linear',
  },
  bottom: {
    paddingBottom: '12px',
    position: 'relative',
    zIndex: 10,
  },
  primaryButton: {
    width: '100%',
    padding: '16px',
    borderRadius: '30px',
    border: 'none',
    backgroundColor: '#fff',
    color: '#000',
    fontSize: '17px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'inherit',
    marginBottom: '16px',
    transition: 'opacity 0.2s',
  },
  signInWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '4px',
  },
  signInText: {
    fontSize: '15px',
    color: '#8e8e93',
  },
  linkButton: {
    background: 'none',
    border: 'none',
    fontSize: '15px',
    fontWeight: '500',
    color: '#fff',
    cursor: 'pointer',
    fontFamily: 'inherit',
    padding: '4px 8px',
  },
  homeIndicator: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
    paddingTop: '8px',
  },
  homeIndicatorBar: {
    width: '140px',
    height: '5px',
    backgroundColor: '#3a3a3c',
    borderRadius: '3px',
  },
};
