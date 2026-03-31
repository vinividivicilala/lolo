'use client';

import { useState, useEffect } from 'react';
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
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSkip = () => {
    router.push('/');
  };

  const handleSignIn = () => {
    router.push('/login');
  };

  const handleSignUp = () => {
    router.push('/register');
  };

  return (
    <div style={wrap}>
      <div style={app}>
        {/* HEADER */}
        <div style={header}>
          <div style={logo}>Menuru</div>
          <button onClick={handleSkip} style={skip}>
            Lewati
          </button>
        </div>

        {/* CONTENT */}
        <div style={content}>
          {/* IMAGE */}
          <div style={imageWrapper}>
            <AnimatePresence mode="wait">
              <motion.img
                key={index}
                src={slides[index].image}
                alt={slides[index].title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.4 }}
                style={image}
                onError={(e) => {
                  e.currentTarget.src = `https://picsum.photos/id/${index + 5}/300/300`;
                }}
              />
            </AnimatePresence>
          </div>

          {/* TEXT */}
          <motion.h2
            key={`title-${index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            style={title}
          >
            {slides[index].title}
          </motion.h2>
          
          <motion.p
            key={`desc-${index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            style={desc}
          >
            {slides[index].desc}
          </motion.p>

          {/* DOTS */}
          <div style={dots}>
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                style={{
                  ...dot,
                  width: i === index ? 24 : 6,
                  backgroundColor: i === index ? '#fff' : '#3a3a3c',
                }}
              />
            ))}
          </div>
        </div>

        {/* BOTTOM BUTTONS */}
        <div style={bottom}>
          <button onClick={handleSignUp} style={btnPrimary}>
            Daftar
          </button>
          <div style={signInWrapper}>
            <span style={signInText}>Sudah punya akun? </span>
            <button onClick={handleSignIn} style={btnLink}>
              Masuk
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== STYLES ==========

const wrap: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  background: '#000',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
};

const app: React.CSSProperties = {
  width: '100%',
  maxWidth: '420px',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  padding: '20px 24px',
  background: '#000',
  color: '#fff',
};

const header: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingTop: 'env(safe-area-inset-top)',
};

const logo: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: '600',
  letterSpacing: '-0.3px',
  color: '#fff',
};

const skip: React.CSSProperties = {
  background: 'none',
  border: 'none',
  fontSize: '15px',
  color: '#8e8e93',
  cursor: 'pointer',
  fontFamily: 'inherit',
  padding: '8px 12px',
  borderRadius: '20px',
  transition: 'opacity 0.2s',
};

const content: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
};

const imageWrapper: React.CSSProperties = {
  marginBottom: '48px',
};

const image: React.CSSProperties = {
  width: '260px',
  height: '260px',
  borderRadius: '28px',
  objectFit: 'cover',
  boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
};

const title: React.CSSProperties = {
  fontSize: '28px',
  fontWeight: '600',
  marginBottom: '12px',
  letterSpacing: '-0.3px',
  color: '#fff',
};

const desc: React.CSSProperties = {
  fontSize: '15px',
  color: '#8e8e93',
  lineHeight: '1.4',
  maxWidth: '280px',
  margin: '0 auto',
};

const dots: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  gap: '8px',
  marginTop: '32px',
};

const dot: React.CSSProperties = {
  height: '6px',
  borderRadius: '3px',
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  padding: 0,
};

const bottom: React.CSSProperties = {
  paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
};

const btnPrimary: React.CSSProperties = {
  width: '100%',
  padding: '16px',
  borderRadius: '30px',
  border: 'none',
  background: '#fff',
  color: '#000',
  fontSize: '17px',
  fontWeight: '600',
  cursor: 'pointer',
  fontFamily: 'inherit',
  marginBottom: '16px',
  transition: 'all 0.2s ease',
};

const signInWrapper: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '4px',
};

const signInText: React.CSSProperties = {
  fontSize: '15px',
  color: '#8e8e93',
};

const btnLink: React.CSSProperties = {
  background: 'none',
  border: 'none',
  fontSize: '15px',
  fontWeight: '500',
  color: '#fff',
  cursor: 'pointer',
  fontFamily: 'inherit',
  padding: '4px 8px',
  transition: 'opacity 0.2s',
};
