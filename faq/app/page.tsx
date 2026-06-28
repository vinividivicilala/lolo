'use client';

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function HomePage(): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const textWrapperRef = useRef<HTMLDivElement>(null);
  const [charElements, setCharElements] = useState<HTMLElement[]>([]);

  const text = "perfectionism • aesthetics • minimalism •";

  useEffect(() => {
    // Kumpulkan semua elemen karakter
    const container = containerRef.current;
    if (!container) return;

    const chars = container.querySelectorAll('.char');
    setCharElements(Array.from(chars) as HTMLElement[]);
  }, []);

  // Animasi teks berjalan dengan JavaScript
  useEffect(() => {
    const wrapper = textWrapperRef.current;
    if (!wrapper) return;

    let position = 0;
    let animationId: number;

    const animate = () => {
      position -= 1; // Kecepatan gerak
      wrapper.style.transform = `translateX(${position}px)`;
      
      // Reset posisi jika sudah melewati setengah dari total lebar
      const wrapperWidth = wrapper.scrollWidth / 2;
      if (Math.abs(position) >= wrapperWidth) {
        position = 0;
      }
      
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  // Efek perubahan warna per huruf
  useEffect(() => {
    const imageElement = imageRef.current;
    if (!imageElement || charElements.length === 0) return;

    const checkPosition = () => {
      const imageRect = imageElement.getBoundingClientRect();
      
      charElements.forEach((char) => {
        const charRect = char.getBoundingClientRect();
        const charCenter = charRect.left + charRect.width / 2;
        
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
      {/* Teks "Menuru" di pojok kiri atas */}
      <div style={{
        position: 'absolute',
        top: '40px',
        left: '40px',
        zIndex: 10,
        fontFamily: 'aktiv_grotesk, sans-serif',
        fontSize: '24px',
        fontWeight: 400,
        color: 'rgb(17, 17, 17)',
        letterSpacing: '-0.02em'
      }}>
        Menuru
      </div>

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
          ref={textWrapperRef}
          style={{
            display: 'inline-block',
            fontFamily: 'aktiv_grotesk, sans-serif',
            fontWeight: 400,
            fontSize: '200px',
            color: 'rgb(17, 17, 17)',
            lineHeight: 'normal',
            letterSpacing: '2px',
            willChange: 'transform'
          }}
        >
          <span ref={containerRef}>
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
          </span>
          <span>
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
          </span>
        </div>
      </div>
    </div>
  );
}
