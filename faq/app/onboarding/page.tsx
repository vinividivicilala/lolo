'use client';

import React, { useState, useEffect } from 'react';
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
];

export default function Onboarding() {
  const router = useRouter();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleStart = () => {
    localStorage.setItem('onboarded', 'true');
    router.push('/');
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.app}>
        
        {/* Header */}
        <div style={styles.header}>
          <span style={styles.logo}>Kliktron</span>
          <button style={styles.skip} onClick={handleStart}>
            Lewati
          </button>
        </div>

        {/* Content */}
        <div style={styles.content}>
          
          {/* Image */}
          <div style={styles.imageBox}>
            <AnimatePresence mode="wait">
              <motion.img
                key={index}
                src={slides[index].image}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                style={styles.image}
              />
            </AnimatePresence>
          </div>

          {/* Text */}
          <motion.h2
            key={slides[index].title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={styles.title}
          >
            {slides[index].title}
          </motion.h2>

          <motion.p
            key={slides[index].desc}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={styles.desc}
          >
            {slides[index].desc}
          </motion.p>

          {/* Dots */}
          <div style={styles.dots}>
            {slides.map((_, i) => (
              <div
                key={i}
                style={{
                  ...styles.dot,
                  width: i === index ? 24 : 8,
                  background: i === index ? '#000' : '#ccc',
                }}
              />
            ))}
          </div>
        </div>

        {/* Bottom Button */}
        <div style={styles.bottom}>
          <button style={styles.button} onClick={handleStart}>
            Mulai
          </button>
        </div>

      </div>
    </div>
  );
}

const styles: any = {
  wrapper: {
    background: '#f5f6f8',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
  },

  app: {
    width: '100%',
    maxWidth: '420px',
    height: '100vh',
    background: '#fff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '20px',
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  logo: {
    fontWeight: '600',
    fontSize: '16px',
  },

  skip: {
    background: 'none',
    border: 'none',
    color: '#007aff',
    fontSize: '14px',
    cursor: 'pointer',
  },

  content: {
    textAlign: 'center',
    marginTop: '40px',
  },

  imageBox: {
    width: '100%',
    maxWidth: '280px',
    margin: '0 auto 30px',
  },

  image: {
    width: '100%',
    borderRadius: '20px',
  },

  title: {
    fontSize: '22px',
    fontWeight: '600',
    marginBottom: '10px',
  },

  desc: {
    fontSize: '14px',
    color: '#666',
    maxWidth: '280px',
    margin: '0 auto',
  },

  dots: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '20px',
    gap: '6px',
  },

  dot: {
    height: '8px',
    borderRadius: '10px',
    transition: '0.3s',
  },

  bottom: {
    paddingBottom: '20px',
  },

  button: {
    width: '100%',
    padding: '14px',
    background: '#000',
    color: '#fff',
    border: 'none',
    borderRadius: '30px',
    fontSize: '16px',
    cursor: 'pointer',
  },
};
