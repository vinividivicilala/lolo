'use client';

import React from "react";

export default function HomePage(): React.JSX.Element {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'black',
      margin: 0,
      padding: 0,
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'Helvetica, Arial, sans-serif',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale'
    }}>
      {/* Framed Layout - Membingkai area dengan space dari tepi */}
      <div style={{
        position: 'fixed',
        top: '2rem',
        left: '2rem',
        right: '2rem',
        bottom: '2rem',
        backgroundColor: '#dbd6c9',
        zIndex: 1,
        pointerEvents: 'none' // Agar tidak mengganggu interaksi dengan konten di dalamnya
      }} />
      
      {/* Area konten utama dengan padding yang sama agar konten berada di dalam frame */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        width: '100%',
        height: '100vh',
        padding: '2rem',
        boxSizing: 'border-box'
      }}>
        {/* Konten dapat ditambahkan di sini nanti */}
      </div>
    </div>
  );
}
