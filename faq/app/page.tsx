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
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale'
    }}>
      {/* Framed Layout */}
      <div style={{
        position: 'fixed',
        top: '2rem',
        left: '2rem',
        right: '2rem',
        bottom: '2rem',
        backgroundColor: '#dbd6c9',
        borderRadius: '20px',
        zIndex: 1,
        pointerEvents: 'none'
      }} />
      
      {/* Teks MENURU */}
      <div style={{
        position: 'fixed',
        top: 'calc(2rem + 16px)',
        left: 'calc(2rem + 20px)',
        zIndex: 2,
        pointerEvents: 'none'
      }}>
        <span style={{
          fontFamily: 'Inter Tight',
          fontWeight: 400,
          fontStyle: 'normal',
          color: 'rgb(0, 20, 70)',
          fontSize: '13px',
          lineHeight: '13px'
        }}>
          MENURU
        </span>
      </div>
      
      {/* Area konten */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        width: '100%',
        height: '100vh',
        padding: '2rem',
        boxSizing: 'border-box'
      }} />
    </div>
  );
}
