// app/onboarding/page.tsx
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

  // Auto slide every 3 seconds
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
        fontFamily: 'Helvetica, Arial, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {/* Header with skip button - top right */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'flex-end',
          zIndex: 20,
        }}
      >
        <button
          onClick={handleSkip}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '16px',
            color: '#fff',
            cursor: 'pointer',
            fontFamily: 'Helvetica, Arial, sans-serif',
            padding: '8px 16px',
            borderRadius: '30px',
            backgroundColor: 'rgba(255,255,255,0.05)',
          }}
        >
          Lewati
        </button>
      </div>

      {/* Main content - centered vertically */}
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
        {/* Illustration Image */}
        <div
          style={{
            width: '280px',
            height: '280px',
            maxWidth: '70vw',
            maxHeight: '70vw',
            marginBottom: '40px',
            borderRadius: '24px',
            overflow: 'hidden',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={currentIndex}
              src={onboardingData[currentIndex].image}
              alt={onboardingData[currentIndex].title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4 }}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              onError={(e) => {
                e.currentTarget.src = `https://picsum.photos/id/${currentIndex + 1}/400/400`;
              }}
            />
          </AnimatePresence>
        </div>

        {/* Title */}
        <motion.h1
          key={`title-${currentIndex}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{
            fontSize: '28px',
            fontWeight: '600',
            color: '#fff',
            textAlign: 'center',
            marginBottom: '12px',
            fontFamily: 'Helvetica, Arial, sans-serif',
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
            color: '#888',
            textAlign: 'center',
            lineHeight: '1.5',
            maxWidth: '280px',
            marginBottom: '32px',
            fontFamily: 'Helvetica, Arial, sans-serif',
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
                width: index === currentIndex ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                backgroundColor: index === currentIndex ? '#fff' : '#333',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>

      {/* Bottom Button */}
      <div
        style={{
          padding: '20px 24px',
          paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
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
            fontSize: '16px',
            fontWeight: '500',
            color: '#000',
            cursor: 'pointer',
            fontFamily: 'Helvetica, Arial, sans-serif',
          }}
        >
          Mulai
        </button>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        style={{
          position: 'fixed',
          left: '16px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '40px',
          width: '44px',
          height: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 20,
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
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
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '40px',
          width: '44px',
          height: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 20,
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}
