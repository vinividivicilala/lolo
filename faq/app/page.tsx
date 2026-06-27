'use client';

import React, { useEffect, useRef } from "react";
import Image from "next/image";

export default function HomePage(): React.JSX.Element {
  const textRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const textElement = textRef.current;
    const imageElement = imageRef.current;
    
    if (!textElement || !imageElement) return;

    const handleScroll = () => {
      const textRect = textElement.getBoundingClientRect();
      const imageRect = imageElement.getBoundingClientRect();
      
      // Cek apakah teks berada di atas foto (secara horizontal)
      const textCenter = textRect.left + textRect.width / 2;
      const imageLeft = imageRect.left;
      const imageRight = imageRect.right;
      
      // Jika teks berada di atas foto, warna putih, selain itu hitam
      if (textCenter >= imageLeft && textCenter <= imageRight) {
        textElement.style.color = '#ffffff';
      } else {
        textElement.style.color = 'rgb(17, 17, 17)';
      }
    };

    // Jalankan setiap frame animasi
    let animationFrame: number;
    const update = () => {
      handleScroll();
      animationFrame = requestAnimationFrame(update);
    };
    update();

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#ffffff',
      margin: 0,
      padding: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      fontFamily: 'Arial, sans-serif',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Foto tengah */}
      <div 
        ref={imageRef}
        style={{
          position: 'relative',
          width: '600px',
          height: '600px',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          zIndex: 1
        }}
      >
        <Image
          src="/images/11.jpg"
          alt="Center Image"
          fill
          style={{ objectFit: 'cover' }}
        />
      </div>

      {/* Teks berjalan di atas foto */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '0',
        transform: 'translateY(-50%)',
        width: '100%',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        zIndex: 2,
        pointerEvents: 'none'
      }}>
        <div
          ref={textRef}
          style={{
            display: 'inline-block',
            animation: 'scrollText 8s linear infinite',
            fontFamily: 'Outfit, system-ui, sans-serif',
            fontWeight: 400,
            fontSize: '16px',
            color: 'rgb(17, 17, 17)',
            lineHeight: 'normal',
            letterSpacing: '2px',
            transition: 'color 0.1s ease'
          }}
        >
          <span style={{ marginRight: '20px' }}>•</span>
          passion
          <span style={{ marginLeft: '20px', marginRight: '20px' }}>•</span>
          passion
          <span style={{ marginLeft: '20px', marginRight: '20px' }}>•</span>
          passion
          <span style={{ marginLeft: '20px', marginRight: '20px' }}>•</span>
          passion
          <span style={{ marginLeft: '20px', marginRight: '20px' }}>•</span>
          passion
          <span style={{ marginLeft: '20px', marginRight: '20px' }}>•</span>
          passion
          <span style={{ marginLeft: '20px', marginRight: '20px' }}>•</span>
          passion
        </div>
      </div>

      <style jsx>{`
        @keyframes scrollText {
          0% {
            transform: translateX(100vw);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  );
}
