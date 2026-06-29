'use client';

import React from "react";

export default function HomePage(): React.JSX.Element {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#ffffff',
      margin: 0,
      padding: 0,
      position: 'relative',
      fontFamily: 'Inter, "Inter Fallback"'
    }}>
      {/* Teks judul "Menuru" di pojok kiri atas - font 70px */}
      <div style={{
        position: 'absolute',
        top: '40px',
        left: '40px',
        zIndex: 10,
        fontFamily: 'Inter, "Inter Fallback"',
        fontSize: '70px',
        fontWeight: 400,
        color: '#000000',
        letterSpacing: '-0.02em'
      }}>
        Menuru
      </div>

      {/* Icon Pesan + Teks Pesan - pindah dari bawah ke atas, font 90px */}
      <div style={{
        position: 'absolute',
        top: '40px',
        right: '40px',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        backgroundColor: '#c5e800',
        padding: '16px 24px',
        borderRadius: '60px',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        boxShadow: '0 4px 12px rgba(197, 232, 0, 0.3)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(197, 232, 0, 0.5)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(197, 232, 0, 0.3)';
      }}
      >
        {/* SVG Icon Pesan */}
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          style={{ flexShrink: 0 }}
        >
          <path 
            d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" 
            stroke="#000000" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <path 
            d="M8 9H16" 
            stroke="#000000" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <path 
            d="M8 13H12" 
            stroke="#000000" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>

        {/* Teks Pesan - font 90px */}
        <span style={{
          fontFamily: 'Inter, "Inter Fallback"',
          fontSize: '90px',
          fontWeight: 500,
          color: '#000000',
          letterSpacing: '-0.02em',
          lineHeight: 1
        }}>
          Pesan
        </span>
      </div>
    </div>
  );
}
