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
        width: '100%',
        maxWidth: '100%',
        backgroundColor: '#000',
        fontFamily: 'Helvetica, Arial, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {/* Status Bar untuk efek seperti app mobile */}
      <div
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          backgroundColor: '#000',
          height: '44px',
          width: '100%',
        }}
      />

      {/* Header - Kiri nama website, Kanan lewatin */}
      <div
        style={{
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
        }}
      >
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
            transition: 'all 0.2s ease',
            backgroundColor: 'rgba(255,255,255,0.05)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
          }}
        >
          Lewatin
        </button>
      </div>

      {/* Main Content - Semua konten di tengah secara vertikal */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px 24px',
          width: '100%',
        }}
      >
        {/* Image Container */}
        <div
          style={{
            position: 'relative',
            width: '280px',
            height: '280px',
            maxWidth: '80vw',
            maxHeight: '80vw',
            marginBottom: '48px',
            borderRadius: '28px',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={currentIndex}
              src={onboardingImages[currentIndex].src}
              alt={onboardingImages[currentIndex].title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
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

        {/* Title and Description */}
        <motion.div
          key={`text-${currentIndex}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          style={{
            textAlign: 'center',
            marginBottom: '32px',
            width: '100%',
            maxWidth: '300px',
          }}
        >
          <h2
            style={{
              fontSize: '26px',
              fontWeight: '600',
              color: '#fff',
              marginBottom: '12px',
              fontFamily: 'Helvetica, Arial, sans-serif',
              letterSpacing: '-0.3px',
            }}
          >
            {onboardingImages[currentIndex].title}
          </h2>
          <p
            style={{
              fontSize: '15px',
              color: '#888',
              lineHeight: '1.5',
              fontFamily: 'Helvetica, Arial, sans-serif',
            }}
          >
            {onboardingImages[currentIndex].description}
          </p>
        </motion.div>

        {/* Pagination Dots */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '48px',
          }}
        >
          {onboardingImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              style={{
                width: index === currentIndex ? '28px' : '8px',
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

      {/* Bottom Buttons - Masuk dan Daftar */}
      <div
        style={{
          padding: '20px 24px',
          paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
          backgroundColor: '#000',
          display: 'flex',
          gap: '12px',
          width: '100%',
        }}
      >
        <button
          onClick={handleSignIn}
          style={{
            flex: 1,
            padding: '16px',
            backgroundColor: 'transparent',
            border: '1px solid #333',
            borderRadius: '30px',
            fontSize: '16px',
            fontWeight: '500',
            color: '#fff',
            cursor: 'pointer',
            fontFamily: 'Helvetica, Arial, sans-serif',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#fff';
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#333';
            e.currentTarget.style.backgroundColor = 'transparent';
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
            borderRadius: '30px',
            fontSize: '16px',
            fontWeight: '500',
            color: '#000',
            cursor: 'pointer',
            fontFamily: 'Helvetica, Arial, sans-serif',
            transition: 'all 0.2s ease',
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

      {/* Navigation Arrows - Untuk navigasi slide */}
      <button
        onClick={prevSlide}
        style={{
          position: 'fixed',
          left: '16px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(0,0,0,0.6)',
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
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
          e.currentTarget.style.backdropFilter = 'blur(10px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(0,0,0,0.6)';
          e.currentTarget.style.backdropFilter = 'blur(10px)';
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
          background: 'rgba(0,0,0,0.6)',
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
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
          e.currentTarget.style.backdropFilter = 'blur(10px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(0,0,0,0.6)';
          e.currentTarget.style.backdropFilter = 'blur(10px)';
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      {/* CSS untuk safe area dan responsive */}
      <style jsx>{`
        @media (max-width: 768px) {
          body {
            overflow-x: hidden;
          }
        }
        
        @supports (padding: max(0px)) {
          .safe-area {
            padding-bottom: max(20px, env(safe-area-inset-bottom));
          }
        }
      `}</style>
    </div>
  );
}
