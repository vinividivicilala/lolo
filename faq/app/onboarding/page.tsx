'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useDrag } from '@use-gesture/react';

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
  const containerRef = useRef<HTMLDivElement>(null);
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

  // Mouse/Touch drag handlers
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
      // Swipe right - previous slide
      setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    } else if (diff < -threshold) {
      // Swipe left - next slide
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

  // Next slide manual
  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div style={styles.wrapper}>
      <div 
        ref={containerRef}
        style={styles.container}
        onMouseDown={handleDragStart}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchEnd={handleDragEnd}
      >
        {/* Header */}
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
                transition={{ duration: 0.3 }}
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

          {/* Pagination Dots - Active dot becomes wider */}
          <div style={styles.dotsContainer}>
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                style={styles.dotWrapper}
              >
                <div
                  style={{
                    ...styles.dot,
                    width: idx === currentIndex ? '32px' : '8px',
                    backgroundColor: idx === currentIndex ? '#8be9fd' : '#2c2c2e',
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Buttons */}
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

        {/* Navigation Arrows */}
        <button onClick={prevSlide} style={styles.leftArrow}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <button onClick={nextSlide} style={styles.rightArrow}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
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
    padding: '20px 24px',
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
    color: '#fff',
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
    gap: '10px',
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
  dot: {
    height: '8px',
    borderRadius: '4px',
    transition: 'all 0.3s ease',
  },
  bottom: {
    paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
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
  leftArrow: {
    position: 'absolute',
    left: '8px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'rgba(0,0,0,0.4)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '40px',
    width: '44px',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 20,
    transition: 'all 0.2s ease',
  },
  rightArrow: {
    position: 'absolute',
    right: '8px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'rgba(0,0,0,0.4)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '40px',
    width: '44px',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 20,
    transition: 'all 0.2s ease',
  },
};
