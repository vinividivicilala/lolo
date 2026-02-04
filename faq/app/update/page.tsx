'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function UpdatePage() {
  const router = useRouter();

  const updates = [
    {
      id: 1,
      date: '2024-03-15',
      title: 'Peluncuran Versi Beta',
      category: 'Perkembangan Website',
      description: 'Website resmi diluncurkan dalam versi beta dengan fitur-fitur utama yang sudah berfungsi. Fase pengujian pengguna dimulai.',
      status: 'Selesai',
      source: 'Tim Pengembangan'
    },
    {
      id: 2,
      date: '2024-03-10',
      title: 'Integrasi Sistem Backend',
      category: 'Teknis',
      description: 'Menyelesaikan integrasi database dan API untuk mendukung fitur dinamik. Optimasi performa server dilakukan.',
      status: 'Selesai',
      source: 'Tim Backend'
    },
    {
      id: 3,
      date: '2024-03-05',
      title: 'Redesign Antarmuka Pengguna',
      category: 'UI/UX',
      description: 'Melakukan overhaul desain UI dengan pendekatan minimalis dan meningkatkan pengalaman pengguna di berbagai perangkat.',
      status: 'Selesai',
      source: 'Tim Desain'
    },
    {
      id: 4,
      date: '2024-02-28',
      title: 'Pengembangan Fitur Forum',
      category: 'Fitur Baru',
      description: 'Memulai pengembangan forum komunitas dengan sistem thread, komentar, dan moderasi otomatis.',
      status: 'Dalam Pengembangan',
      source: 'Tim Fitur'
    },
    {
      id: 5,
      date: '2024-02-20',
      title: 'Optimasi Mobile Responsive',
      category: 'Teknis',
      description: 'Meningkatkan kompatibilitas website di berbagai ukuran layar mobile dengan performa yang lebih baik.',
      status: 'Selesai',
      source: 'Tim Frontend'
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'black',
      color: 'white',
      padding: '2rem',
      fontFamily: 'Helvetica, Arial, sans-serif'
    }}>
      <motion.button
        onClick={() => router.back()}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '8px',
          color: 'white',
          cursor: 'pointer',
          marginBottom: '2rem',
          backdropFilter: 'blur(10px)'
        }}
        whileHover={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
        whileTap={{ scale: 0.95 }}
      >
        ← Back
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
          <h1 style={{ fontSize: '3rem', marginRight: '1rem' }}>Updates</h1>
          <span style={{ 
            fontSize: '1rem', 
            backgroundColor: 'rgba(255,255,255,0.1)', 
            padding: '0.3rem 0.8rem', 
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            Menuru
          </span>
        </div>
        
        <p style={{ fontSize: '1.2rem', opacity: 0.8, marginBottom: '3rem' }}>
          Timeline perkembangan dan pembaruan website. Terus pantau untuk informasi terbaru!
        </p>

        {/* Timeline Container */}
        <div style={{ position: 'relative', maxWidth: '800px', margin: '0 auto' }}>
          {/* Vertical Line */}
          <div style={{
            position: 'absolute',
            left: '24px',
            top: '0',
            bottom: '0',
            width: '2px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            zIndex: 0
          }}></div>

          {updates.map((update, index) => (
            <motion.div
              key={update.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              style={{
                position: 'relative',
                marginBottom: '3rem',
                paddingLeft: '60px'
              }}
            >
              {/* Timeline Dot */}
              <div style={{
                position: 'absolute',
                left: '16px',
                top: '8px',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: 'black',
                border: '3px solid white',
                zIndex: 1
              }}></div>

              {/* Date */}
              <div style={{
                fontSize: '0.9rem',
                color: 'rgba(255,255,255,0.6)',
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                {update.date}
              </div>

              {/* Title and Category */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.5rem', marginRight: '1rem', marginBottom: '0.5rem' }}>
                  {update.title}
                </h2>
                <span style={{
                  fontSize: '0.8rem',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.3)'
                }}>
                  {update.category}
                </span>
              </div>

              {/* Description */}
              <p style={{
                fontSize: '1rem',
                lineHeight: '1.6',
                opacity: 0.9,
                marginBottom: '0.8rem'
              }}>
                {update.description}
              </p>

              {/* Status and Source */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.9rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: '12px',
                    backgroundColor: update.status === 'Selesai' ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 255, 0, 0.1)',
                    color: update.status === 'Selesai' ? '#4CAF50' : '#FFC107',
                    border: `1px solid ${update.status === 'Selesai' ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255, 193, 7, 0.3)'}`,
                    marginRight: '1rem'
                  }}>
                    {update.status}
                  </span>
                  <span style={{ opacity: 0.7 }}>
                    Source: {update.source}
                  </span>
                </div>
                
                {/* North East Arrow SVG */}
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  style={{ opacity: 0.6 }}
                >
                  <line x1="7" y1="17" x2="17" y2="7"></line>
                  <polyline points="7 7 17 7 17 17"></polyline>
                </svg>
              </div>

              {/* Dotted Line Separator */}
              {index < updates.length - 1 && (
                <div style={{
                  height: '2px',
                  backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
                  backgroundSize: '8px 2px',
                  backgroundRepeat: 'repeat-x',
                  marginTop: '1.5rem',
                  marginLeft: '-60px',
                  opacity: 0.5
                }}></div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          style={{
            marginTop: '4rem',
            padding: '2rem',
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)',
            textAlign: 'center'
          }}
        >
          <p style={{ fontSize: '1rem', opacity: 0.7 }}>
            Website ini terus dikembangkan untuk memberikan pengalaman terbaik.
            <br />
            Pantau terus halaman ini untuk update selanjutnya.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
