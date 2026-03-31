'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const onboardingData = [
  {
    id: 1,
    image: '/images/5.jpg',
    title: 'Mulai Berbagi Kebaikan',
    description: 'Buat kegiatan donasi dan bagikan kebaikan kepada yang membutuhkan',
  },
  {
    id: 2,
    image: '/images/6.jpg',
    title: 'Donasi dengan Mudah',
    description: 'Donasi kapan saja, di mana saja dengan proses yang cepat dan aman',
  },
  {
    id: 3,
    image: '/images/7.jpg',
    title: 'Bagikan Cerita',
    description: 'Ceritakan pengalaman donasi Anda dan inspirasi orang lain',
  },
  {
    id: 4,
    image: '/images/8.jpg',
    title: 'Leaderboard Donatur',
    description: 'Lihat peringkat donatur dan berkompetisi dalam kebaikan',
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % onboardingData.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % onboardingData.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + onboardingData.length) % onboardingData.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const handleSkip = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    router.push('/');
  };

  const handleGetStarted = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    router.push('/');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#000',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {/* Status Bar untuk iOS/Android */}
      <div
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          backgroundColor: '#000',
          height: '44px',
          width: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
        }}
      />

      {/* Header dengan tombol Lewati di kanan atas */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: '12px 20px',
          paddingTop: 'max(12px, env(safe-area-inset-top))',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          zIndex: 20,
        }}
      >
        <button
          onClick={handleSkip}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            fontSize: '15px',
            fontWeight: '500',
            color: '#fff',
            cursor: 'pointer',
            fontFamily: 'inherit',
            padding: '8px 20px',
            borderRadius: '30px',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            transition: 'all 0.2s ease',
          }}
        >
          Lewati
        </button>
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 24px',
        }}
      >
        {/* Illustration Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            width: '100%',
            maxWidth: '340px',
            marginBottom: '48px',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '1 / 1',
              borderRadius: '32px',
              overflow: 'hidden',
              backgroundColor: '#111',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            }}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={currentIndex}
                src={onboardingData[currentIndex].image}
                alt={onboardingData[currentIndex].title}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
                onError={(e) => {
                  e.currentTarget.src = `https://picsum.photos/id/${currentIndex + 5}/400/400`;
                }}
              />
            </AnimatePresence>
            
            {/* Gradient Overlay */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '40%',
                background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)',
                pointerEvents: 'none',
              }}
            />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          key={`title-${currentIndex}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#fff',
            textAlign: 'center',
            marginBottom: '12px',
            fontFamily: 'inherit',
            letterSpacing: '-0.3px',
          }}
        >
          {onboardingData[currentIndex].title}
        </motion.h1>

        {/* Description */}
        <motion.p
          key={`desc-${currentIndex}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          style={{
            fontSize: '15px',
            color: '#8e8e93',
            textAlign: 'center',
            lineHeight: '1.4',
            maxWidth: '300px',
            marginBottom: '32px',
            fontFamily: 'inherit',
          }}
        >
          {onboardingData[currentIndex].description}
        </motion.p>

        {/* Pagination Dots */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '48px',
          }}
        >
          {onboardingData.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              style={{
                width: index === currentIndex ? '28px' : '8px',
                height: '8px',
                borderRadius: '4px',
                backgroundColor: index === currentIndex ? '#fff' : '#3a3a3c',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>

      {/* Bottom Button */}
      <div
        style={{
          padding: '20px 20px',
          paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
          backgroundColor: 'transparent',
        }}
      >
        <button
          onClick={handleGetStarted}
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: '#fff',
            border: 'none',
            borderRadius: '30px',
            fontSize: '17px',
            fontWeight: '600',
            color: '#000',
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f5f5f7';
            e.currentTarget.style.transform = 'scale(0.98)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#fff';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          Mulai
        </button>
      </div>

      {/* Navigation Arrows - iOS Style */}
      <button
        onClick={prevSlide}
        style={{
          position: 'fixed',
          left: '16px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '40px',
          width: '48px',
          height: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 30,
          transition: 'all 0.2s ease',
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      <button
        onClick={nextSlide}
        style={{
          position: 'fixed',
          right: '16px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '40px',
          width: '48px',
          height: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 30,
          transition: 'all 0.2s ease',
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      {/* Meta viewport untuk mobile */}
      <style jsx global>{`
        @viewport {
          width: device-width;
          initial-scale: 1;
          maximum-scale: 1;
          user-scalable: no;
        }
        
        * {
          -webkit-tap-highlight-color: transparent;
        }
        
        body {
          overscroll-behavior: none;
          -webkit-overflow-scrolling: touch;
        }
      `}</style>
    </div>
  );
}
