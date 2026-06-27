'use client';

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function HomePage(): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const [charElements, setCharElements] = useState<HTMLElement[]>([]);

  const text = "• perfectionis • aesthetics • minimalis •";

  useEffect(() => {
    // Kumpulkan semua elemen karakter
    const container = containerRef.current;
    if (!container) return;

    const chars = container.querySelectorAll('.char');
    setCharElements(Array.from(chars) as HTMLElement[]);
  }, []);

  useEffect(() => {
    const imageElement = imageRef.current;
    if (!imageElement || charElements.length === 0) return;

    const checkPosition = () => {
      const imageRect = imageElement.getBoundingClientRect();
      
      charElements.forEach((char) => {
        const charRect = char.getBoundingClientRect();
        const charCenter = charRect.left + charRect.width / 2;
        
        // Cek apakah karakter berada di atas foto
        if (charCenter >= imageRect.left && charCenter <= imageRect.right) {
          char.style.color = '#ffffff';
          char.style.textShadow = '0 0 20px rgba(0,0,0,0.5)';
        } else {
          char.style.color = 'rgb(17, 17, 17)';
          char.style.textShadow = 'none';
        }
      });
    };

    let animationFrame: number;
    const update = () => {
      checkPosition();
      animationFrame = requestAnimationFrame(update);
    };
    update();

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [charElements]);

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

      {/* Teks berjalan di atas foto - MARQUEE style */}
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
          ref={containerRef}
          style={{
            display: 'inline-block',
            animation: 'scrollText 12s linear infinite',
            fontFamily: 'Outfit, system-ui, sans-serif',
            fontWeight: 400,
            fontSize: '200px',
            color: 'rgb(17, 17, 17)',
            lineHeight: 'normal',
            letterSpacing: '2px',
            willChange: 'transform'
          }}
        >
          {/* Duplikat teks agar tidak ada jeda */}
          {text.split('').map((char, index) => (
            <span
              key={`first-${index}`}
              className="char"
              style={{
                display: 'inline-block',
                transition: 'color 0.05s ease, text-shadow 0.05s ease',
                color: 'rgb(17, 17, 17)'
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
          {text.split('').map((char, index) => (
            <span
              key={`second-${index}`}
              className="char"
              style={{
                display: 'inline-block',
                transition: 'color 0.05s ease, text-shadow 0.05s ease',
                color: 'rgb(17, 17, 17)'
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes scrollText {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}
