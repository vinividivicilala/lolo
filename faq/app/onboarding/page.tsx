'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// Images data
const onboardingImages = [
  {
    id: 1,
    src: '/images/5.jpg',
    title: 'Mulai Berbagi Kebaikan',
    description: 'Buat kegiatan donasi dan bagikan kebaikan kepada yang membutuhkan'
  },
  {
    id: 2,
    src: '/images/6.jpg',
    title: 'Donasi dengan Mudah',
    description: 'Donasi kapan saja, di mana saja dengan proses yang cepat dan aman'
  },
  {
    id: 3,
    src: '/images/7.jpg',
    title: 'Bagikan Cerita',
    description: 'Ceritakan pengalaman donasi Anda dan inspirasi orang lain'
  },
  {
    id: 4,
    src: '/images/8.jpg',
    title: 'Leaderboard Donatur',
    description: 'Lihat peringkat donatur dan berkompetisi dalam kebaikan'
  }
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto slide every 3 seconds
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % onboardingImages.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  // Handle manual navigation
  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    // Resume auto play after 5 seconds of inactivity
    setTimeout(() => {
      setIsAutoPlaying(true);
    }, 5000);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % onboardingImages.length);
    setIsAutoPlaying(false);
    setTimeout(() => {
      setIsAutoPlaying(true);
    }, 5000);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + onboardingImages.length) % onboardingImages.length);
    setIsAutoPlaying(false);
    setTimeout(() => {
      setIsAutoPlaying(true);
    }, 5000);
  };

  const handleSkip = () => {
    router.push('/');
  };

  const handleSignIn = () => {
    router.push('/');
  };

  const handleSignUp = () => {
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
        overflow: 'hidden',
      }}
    >
      {/* Header - Left: Website Name, Right: Skip */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          padding: '24px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 20,
          backgroundColor: 'transparent',
        }}
      >
        {/* Left - Website Name */}
        <div
          style={{
            fontSize: '28px',
            fontWeight: '600',
            color: '#fff',
            fontFamily: 'Helvetica, Arial, sans-serif',
            letterSpacing: '-0.5px',
          }}
        >
          Menuru
        </div>

        {/* Right - Skip Button */}
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
            borderRadius: '40px',
            transition: 'opacity 0.3s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          Lewatin
        </button>
      </div>

      {/* Main Content - Center Image */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 24px 120px 24px',
        }}
      >
        {/* Image Container */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '400px',
            height: '400px',
            marginBottom: '32px',
            overflow: 'hidden',
            borderRadius: '24px',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={currentIndex}
              src={onboardingImages[currentIndex].src}
              alt={onboardingImages[currentIndex].title}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '24px',
              }}
              onError={(e) => {
                // Fallback if image doesn't exist
                e.currentTarget.src = 'https://via.placeholder.com/400x400/111/fff?text=Menuru';
              }}
            />
          </AnimatePresence>
        </div>

        {/* Title and Description */}
        <motion.div
          key={`text-${currentIndex}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            textAlign: 'center',
            marginBottom: '32px',
          }}
        >
          <h2
            style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#fff',
              marginBottom: '12px',
              fontFamily: 'Helvetica, Arial, sans-serif',
            }}
          >
            {onboardingImages[currentIndex].title}
          </h2>
          <p
            style={{
              fontSize: '16px',
              color: '#888',
              maxWidth: '300px',
              margin: '0 auto',
              fontFamily: 'Helvetica, Arial, sans-serif',
              lineHeight: '1.5',
            }}
          >
            {onboardingImages[currentIndex].description}
          </p>
        </motion.div>

        {/* Pagination Dots */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '48px',
          }}
        >
          {onboardingImages.map((_, index) => (
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

      {/* Bottom Buttons - Sign In and Sign Up */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '24px 32px',
          backgroundColor: '#000',
          borderTop: '1px solid #222',
          display: 'flex',
          gap: '16px',
          zIndex: 20,
        }}
      >
        <button
          onClick={handleSignIn}
          style={{
            flex: 1,
            padding: '16px',
            backgroundColor: 'transparent',
            border: '1px solid #333',
            borderRadius: '40px',
            fontSize: '16px',
            fontWeight: '500',
            color: '#fff',
            cursor: 'pointer',
            fontFamily: 'Helvetica, Arial, sans-serif',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#fff';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#333';
            e.currentTarget.style.color = '#fff';
          }}
        >
          Masuk
        </button>
        <button
          onClick={handleSignUp}
          style={{
            flex: 1,
            padding: '16px',
            backgroundColor: '#fff',
            border: 'none',
            borderRadius: '40px',
            fontSize: '16px',
            fontWeight: '500',
            color: '#000',
            cursor: 'pointer',
            fontFamily: 'Helvetica, Arial, sans-serif',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f0f0f0';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#fff';
          }}
        >
          Daftar
        </button>
      </div>

      {/* Navigation Arrows (Optional) */}
      <button
        onClick={prevSlide}
        style={{
          position: 'fixed',
          left: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(0,0,0,0.5)',
          border: '1px solid #333',
          borderRadius: '50%',
          width: '44px',
          height: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 20,
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(0,0,0,0.5)';
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
          right: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(0,0,0,0.5)',
          border: '1px solid #333',
          borderRadius: '50%',
          width: '44px',
          height: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 20,
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(0,0,0,0.5)';
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}
