'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const i = setInterval(() => {
      setIndex((p) => (p + 1) % slides.length);
    }, 3000);
    return () => clearInterval(i);
  }, []);

  return (
    <div style={wrap}>
      <div style={app}>
        
        {/* HEADER */}
        <div style={header}>
          <div style={{ fontWeight: 600 }}>Kliktron</div>
          <div style={skip}>Lewati</div>
        </div>

        {/* CONTENT */}
        <div style={content}>

          {/* IMAGE */}
          <AnimatePresence mode="wait">
            <motion.img
              key={index}
              src={slides[index].image}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={image}
            />
          </AnimatePresence>

          {/* TEXT */}
          <h2 style={title}>{slides[index].title}</h2>
          <p style={desc}>{slides[index].desc}</p>

          {/* DOT */}
          <div style={dots}>
            {slides.map((_, i) => (
              <div
                key={i}
                style={{
                  ...dot,
                  width: i === index ? 18 : 6,
                  opacity: i === index ? 1 : 0.3,
                }}
              />
            ))}
          </div>
        </div>

        {/* BUTTON */}
        <div style={bottom}>
          <button style={btn}>Mulai</button>
        </div>

      </div>
    </div>
  );
}

const wrap = {
  height: '100vh',
  display: 'flex',
  justifyContent: 'center',
  background: '#fff',
};

const app = {
  width: '100%',
  maxWidth: '420px',
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  padding: '20px',
};

const header = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '14px',
};

const skip = {
  color: '#007aff',
};

const content = {
  textAlign: 'center',
  marginTop: '40px',
};

const image = {
  width: '260px',
  margin: '0 auto 40px',
};

const title = {
  fontSize: '24px',
  fontWeight: 600,
  marginBottom: '10px',
};

const desc = {
  fontSize: '14px',
  color: '#8e8e93',
  maxWidth: '280px',
  margin: '0 auto',
};

const dots = {
  display: 'flex',
  justifyContent: 'center',
  gap: '6px',
  marginTop: '20px',
};

const dot = {
  height: '6px',
  background: '#000',
  borderRadius: '10px',
  transition: '0.3s',
};

const bottom = {
  paddingBottom: '20px',
};

const btn = {
  width: '100%',
  padding: '14px',
  borderRadius: '30px',
  border: 'none',
  background: '#000',
  color: '#fff',
};
