'use client';

import React from "react";

export default function HomePage(): React.JSX.Element {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#ffffff',
      margin: 0,
      padding: 0,
      position: 'relative'
    }}>
      {/* Teks judul "Menuru" di pojok kiri atas */}
      <div style={{
        position: 'absolute',
        top: '40px',
        left: '40px',
        zIndex: 10,
        fontFamily: 'aktiv_grotesk, sans-serif',
        fontSize: '50px',
        fontWeight: 400,
        color: '#000000',
        letterSpacing: '-0.02em'
      }}>
        Menuru
      </div>
    </div>
  );
}
