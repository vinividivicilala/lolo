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
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Progress animation for each slide
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

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchEndX.current - touchStartX.current;
    const threshold = 50;
    
    if (diff > threshold) {
      // Swipe kanan - slide sebelumnya
      setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    } else if (diff < -threshold) {
      // Swipe kiri - slide berikutnya
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }
    
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  // Mouse handlers for drag (desktop)
  const handleMouseDown = (e: React.MouseEvent) => {
    touchStartX.current = e.clientX;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    const diff = e.clientX - touchStartX.current;
    const threshold = 50;
    
    if (diff > threshold) {
      setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    } else if (diff < -threshold) {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }
    
    touchStartX.current = 0;
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
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.logo}>Menuru</div>
        <button onClick={handleSkip} style={styles.skipButton}>
          Lewati
        </button>
      </div>

      {/* Main Content - Swipeable */}
      <div
        style={styles.content}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        {/* Image */}
        <div style={styles.imageWrapper}>
          <AnimatePresence mode="wait">
            <motion.img
              key={currentIndex}
              src={slides[currentIndex].image}
              alt={slides[currentIndex].title}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              style={styles.image}
              draggable={false}
            />
          </AnimatePresence>
        </div>

        {/* Title */}
        <AnimatePresence mode="wait">
          <motion.h2
            key={`title-${currentIndex}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            style={styles.title}
          >
            {slides[currentIndex].title}
          </motion.h2>
        </AnimatePresence>

        {/* Description */}
        <AnimatePresence mode="wait">
          <motion.p
            key={`desc-${currentIndex}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            style={styles.description}
          >
            {slides[currentIndex].desc}
          </motion.p>
        </AnimatePresence>

        {/* Pagination Dots with Fill Animation */}
        <div style={styles.dotsContainer}>
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              style={styles.dotButton}
            >
              <div style={styles.dotWrapper}>
                <div
                  style={{
                    ...styles.dotBg,
                    backgroundColor: idx === currentIndex ? '#2c2c2e' : '#2c2c2e',
                  }}
                >
                  <div
                    style={{
                      ...styles.dotFill,
                      width: idx === currentIndex ? `${progress}%` : idx < currentIndex ? '100%' : '0%',
                      backgroundColor: '#8be9fd',
                    }}
                  />
                </div>
              </div>
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
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    height: '100vh',
    width: '100vw',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: '#000',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    paddingTop: 'max(20px, env(safe-area-inset-top))',
    backgroundColor: '#000',
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
    cursor: 'grab',
    touchAction: 'pan-y',
  },
  imageWrapper: {
    marginBottom: '48px',
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
    padding: '0 20px',
  },
  dotButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    flex: 1,
    maxWidth: '60px',
  },
  dotWrapper: {
    width: '100%',
    height: '6px',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  dotBg: {
    width: '100%',
    height: '100%',
    borderRadius: '3px',
    overflow: 'hidden',
    position: 'relative' as const,
  },
  dotFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.03s linear',
  },
  bottom: {
    padding: '20px 24px',
    paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
    backgroundColor: '#000',
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
};
