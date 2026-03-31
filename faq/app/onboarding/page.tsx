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
    image: '/images/6.jpg',
    title: 'Donasi dengan Mudah',
    desc: 'Donasi kapan saja, di mana saja dengan proses yang cepat dan aman',
  },
  {
    image: '/images/7.jpg',
    title: 'Bagikan Cerita',
    desc: 'Ceritakan pengalaman donasi Anda dan inspirasi orang lain',
  },
  {
    image: '/images/8.jpg',
    title: 'Leaderboard Donatur',
    desc: 'Lihat peringkat donatur dan berkompetisi dalam kebaikan',
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Progress bar animation for each slide
  useEffect(() => {
    // Reset progress when slide changes
    setProgress(0);
    
    // Clear existing interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    // Start new progress animation (3 seconds total)
    const stepTime = 30; // 30ms per step
    const totalSteps = 3000 / stepTime; // 100 steps
    let currentStep = 0;
    
    progressIntervalRef.current = setInterval(() => {
      currentStep++;
      const newProgress = (currentStep / totalSteps) * 100;
      
      if (newProgress >= 100) {
        // Progress complete, move to next slide
        setProgress(100);
        clearInterval(progressIntervalRef.current!);
        
        // Auto move to next slide after a short delay
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
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logo}>Menuru</div>
          <button onClick={handleSkip} style={styles.skipButton}>
            Lewati
          </button>
        </div>

        {/* Main Content */}
        <div style={styles.content}>
          {/* Image */}
          <div style={styles.imageWrapper}>
            <AnimatePresence mode="wait">
              <motion.img
                key={currentIndex}
                src={slides[currentIndex].image}
                alt={slides[currentIndex].title}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                style={styles.image}
                onError={(e) => {
                  e.currentTarget.src = `https://picsum.photos/id/${currentIndex + 5}/320/320`;
                }}
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

          {/* Pagination Dots with Progress Fill */}
          <div style={styles.dotsContainer}>
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                style={styles.dotWrapper}
              >
                <div
                  style={{
                    ...styles.dotBg,
                    backgroundColor: idx === currentIndex ? '#3a6ea5' : '#2c2c2e',
                  }}
                >
                  <div
                    style={{
                      ...styles.dotFill,
                      width: idx === currentIndex ? `${progress}%` : '0%',
                      backgroundColor: '#5e9bff',
                    }}
                  />
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
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
  },
  container: {
    width: '100%',
    maxWidth: '400px',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '20px 24px',
    backgroundColor: '#000',
    color: '#fff',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 'env(safe-area-inset-top)',
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
    marginBottom: '48px',
  },
  image: {
    width: '280px',
    height: '280px',
    borderRadius: '28px',
    objectFit: 'cover',
    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
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
    gap: '10px',
    marginTop: '40px',
  },
  dotWrapper: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
  },
  dotBg: {
    width: '28px',
    height: '4px',
    borderRadius: '2px',
    overflow: 'hidden',
    position: 'relative' as const,
  },
  dotFill: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 0.03s linear',
  },
  bottom: {
    paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
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
};
