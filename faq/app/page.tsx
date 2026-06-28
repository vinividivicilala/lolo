'use client';

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";

export default function HomePage(): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const textWrapperRef = useRef<HTMLDivElement>(null);
  const [charElements, setCharElements] = useState<HTMLElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const loadingRef = useRef<HTMLDivElement>(null);
  const leftTextRef = useRef<HTMLDivElement>(null);
  const centerTextRef = useRef<HTMLDivElement>(null);
  const rightTextRef = useRef<HTMLDivElement>(null);
  const [currentText, setCurrentText] = useState(0);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const textIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const text = "perfectionism • aesthetics • minimalism •";
  const rollingTexts = ["Design", "Innovation", "Creativity", "Vision"];

  // Ganti teks tengah bergantian dengan GSAP
  useEffect(() => {
    if (!isLoading) return;

    // Fungsi untuk mengganti teks dengan GSAP
    const changeText = () => {
      setCurrentText((prev) => {
        const next = (prev + 1) % rollingTexts.length;
        if (centerTextRef.current) {
          // Animasi keluar dengan GSAP
          gsap.to(centerTextRef.current, {
            opacity: 0,
            y: -30,
            rotationX: 20,
            duration: 0.5,
            ease: "power2.in",
            onComplete: () => {
              // Ganti teks
              setCurrentText(next);
              // Animasi masuk dengan GSAP
              gsap.fromTo(centerTextRef.current,
                { opacity: 0, y: 30, rotationX: -20 },
                { opacity: 1, y: 0, rotationX: 0, duration: 0.5, ease: "power2.out" }
              );
            }
          });
        }
        return next;
      });
    };

    // Mulai ganti teks setiap 2 detik
    textIntervalRef.current = setInterval(changeText, 2000);

    return () => {
      if (textIntervalRef.current) {
        clearInterval(textIntervalRef.current);
        textIntervalRef.current = null;
      }
    };
  }, [isLoading]);

  // Animasi loading GSAP
  useEffect(() => {
    if (!isLoading) return;

    const tl = gsap.timeline({
      onComplete: () => {
        // Hentikan ganti teks
        if (textIntervalRef.current) {
          clearInterval(textIntervalRef.current);
          textIntervalRef.current = null;
        }

        // Animasi keluar loading
        gsap.to(loadingRef.current, {
          opacity: 0,
          duration: 0.8,
          ease: "power2.inOut",
          onComplete: () => {
            setIsLoading(false);
            gsap.fromTo(mainContentRef.current,
              { opacity: 0, scale: 0.98 },
              { opacity: 1, scale: 1, duration: 0.8, ease: "power2.out" }
            );
          }
        });
      }
    });

    // Animasi teks kiri (Menuru) - dari kiri ujung
    if (leftTextRef.current) {
      gsap.set(leftTextRef.current, { opacity: 0, x: -80 });
      tl.to(leftTextRef.current, {
        opacity: 1,
        x: 0,
        duration: 0.8,
        ease: "power3.out"
      }, 0);
    }

    // Animasi teks kanan (Studio) - dari kanan ujung
    if (rightTextRef.current) {
      gsap.set(rightTextRef.current, { opacity: 0, x: 80 });
      tl.to(rightTextRef.current, {
        opacity: 1,
        x: 0,
        duration: 0.8,
        ease: "power3.out"
      }, 0.2);
    }

    // Animasi teks tengah - muncul
    if (centerTextRef.current) {
      gsap.set(centerTextRef.current, { opacity: 0, y: 30, scale: 0.8 });
      tl.to(centerTextRef.current, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: "back.out(1.5)"
      }, 0.4);
    }

    return () => {
      tl.kill();
    };
  }, [isLoading]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chars = container.querySelectorAll('.char');
    setCharElements(Array.from(chars) as HTMLElement[]);
  }, []);

  // Animasi teks berjalan
  useEffect(() => {
    if (isLoading) return;
    
    const wrapper = textWrapperRef.current;
    if (!wrapper) return;

    let position = 0;
    let animationId: number;

    const animate = () => {
      position -= 1;
      wrapper.style.transform = `translateX(${position}px)`;
      
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
  }, [isLoading]);

  // Efek perubahan warna per huruf
  useEffect(() => {
    if (isLoading) return;
    
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
  }, [charElements, isLoading]);

  return (
    <>
      {/* LOADING SCREEN */}
      {isLoading && (
        <div
          ref={loadingRef}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: '#ffffff',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'aktiv_grotesk, sans-serif'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            maxWidth: '1400px',
            width: '100%',
            padding: '0 60px'
          }}>
            {/* Kiri: Menuru - di ujung kiri */}
            <div
              ref={leftTextRef}
              style={{
                fontSize: '50px',
                fontWeight: 400,
                color: '#000000',
                opacity: 0,
                fontFamily: 'aktiv_grotesk, sans-serif'
              }}
            >
              Menuru
            </div>

            {/* Tengah: Teks bergantian dengan GSAP */}
            <div
              ref={centerTextRef}
              style={{
                fontSize: '50px',
                fontWeight: 400,
                color: '#000000',
                opacity: 0,
                fontFamily: 'aktiv_grotesk, sans-serif',
                textAlign: 'center',
                minWidth: '200px'
              }}
            >
              {rollingTexts[currentText]}
            </div>

            {/* Kanan: Studio - di ujung kanan */}
            <div
              ref={rightTextRef}
              style={{
                fontSize: '50px',
                fontWeight: 400,
                color: '#000000',
                opacity: 0,
                fontFamily: 'aktiv_grotesk, sans-serif'
              }}
            >
              Studio
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div 
        ref={mainContentRef}
        style={{ 
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
          position: 'relative',
          opacity: 0
        }}
      >
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
    </>
  );
}
