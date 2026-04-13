'use client';

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function HomePage(): React.JSX.Element {
  const [showPopup, setShowPopup] = useState(false);
  const acceptBtnRef = useRef<HTMLButtonElement>(null);
  const declineBtnRef = useRef<HTMLButtonElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (consent === null) {
      setShowPopup(true);
    }
  }, []);

  // GSAP hover effect for buttons
  useEffect(() => {
    if (showPopup && acceptBtnRef.current && declineBtnRef.current) {
      const acceptBtn = acceptBtnRef.current;
      const declineBtn = declineBtnRef.current;

      const createHoverAnimation = (btn: HTMLButtonElement) => {
        const style = document.createElement('style');
        const btnId = `btn-${Math.random()}`;
        btn.classList.add(btnId);
        
        style.textContent = `
          .${btnId} {
            position: relative;
            isolation: isolate;
            transition: color 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1);
          }
          .${btnId}::before {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 0%;
            background-color: #000000;
            transition: height 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1);
            z-index: -1;
            border-radius: 60px;
          }
          .${btnId}:hover::before {
            height: 100%;
          }
          .${btnId}:hover {
            color: #ffffff !important;
            border-color: #000000 !important;
          }
        `;
        document.head.appendChild(style);
      };

      createHoverAnimation(acceptBtn);
      createHoverAnimation(declineBtn);

      return () => {
        const styles = document.querySelectorAll('style');
        styles.forEach(style => {
          if (style.textContent?.includes('::before')) {
            style.remove();
          }
        });
      };
    }
  }, [showPopup]);

  // GSAP scroll zoom in/out effect for portrait
  useEffect(() => {
    if (!portraitRef.current || !imageRef.current) return;

    // Set initial state: agak miring ke kiri, ukuran normal (scale 1)
    gsap.set(portraitRef.current, {
      rotation: -6,
      scale: 1,
      transformOrigin: "center center",
    });

    // Create scroll trigger for zoom in/out
    ScrollTrigger.create({
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      scrub: 1.2, // Smooth scrubbing
      onUpdate: (self) => {
        const progress = self.progress; // 0 at top, 1 at bottom
        
        // Scroll ke bawah: zoom in (scale membesar)
        // Scroll ke atas: zoom out (scale mengecil kembali ke 1)
        // Scale from 1 to 1.8
        const scaleValue = 1 + (progress * 0.8); // 1 → 1.8
        const rotationValue = -6 + (progress * 3); // -6° → -3°
        
        gsap.to(portraitRef.current, {
          scale: scaleValue,
          rotation: rotationValue,
          duration: 0.1,
          ease: "power2.out",
        });
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowPopup(false);
    console.log('Cookies accepted');
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setShowPopup(false);
    console.log('Cookies declined');
  };

  return (
    <div style={{
      minHeight: '200vh',
      backgroundColor: '#f5f5f5',
      margin: 0,
      padding: 0,
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
      position: 'relative'
    }}>
      {/* Hero section dengan foto portrait di tengah */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        flexDirection: 'column',
        gap: '40px'
      }}>
        {/* Foto Portrait besar di tengah, agak miring ke kiri */}
        <div
          ref={portraitRef}
          style={{
            width: '400px',
            height: 'auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            willChange: 'transform',
          }}
        >
          <img
            ref={imageRef}
            src="/images/5.jpg"
            alt="Portrait"
            style={{
              width: '100%',
              height: 'auto',
              objectFit: 'cover',
              borderRadius: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
              display: 'block',
            }}
            onError={(e) => {
              console.error('Failed to load image: /images/5.jpg');
              e.currentTarget.src = 'https://via.placeholder.com/500x600?text=Portrait+Image';
            }}
          />
        </div>
        
        <p style={{
          fontSize: '14px',
          color: '#999',
          marginTop: '20px',
          letterSpacing: '0.5px'
        }}>
          Scroll ↓ — zoom in / zoom out
        </p>
      </div>

      {/* Cookie Popup - Bottom Right dengan desain Awwwards (TIDAK DIUBAH) */}
      {showPopup && (
        <div style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          width: '480px',
          maxWidth: 'calc(100vw - 60px)',
          backgroundColor: '#ffffff',
          color: '#000000',
          borderRadius: '32px',
          padding: '40px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15), 0 5px 12px rgba(0,0,0,0.05)',
          zIndex: 1000,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          animation: 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          border: '1px solid rgba(0,0,0,0.05)'
        }}>
          <style>
            {`
              @keyframes slideUp {
                from {
                  opacity: 0;
                  transform: translateY(30px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `}
          </style>
          
          {/* Header dengan icon */}
          <div style={{
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '48px', display: 'inline-block' }}>🍪</span>
            <span style={{ 
              fontWeight: '700', 
              fontSize: '28px',
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #000000 0%, #333333 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent'
            }}>
              cookies.
            </span>
          </div>
          
          {/* Teks deskripsi - font besar minimalist */}
          <p style={{
            fontSize: '18px',
            lineHeight: '1.4',
            marginBottom: '32px',
            color: '#1a1a1a',
            fontWeight: '400',
            letterSpacing: '-0.01em',
            maxWidth: '90%'
          }}>
            I use cookies to understand how you navigate<br />
            this site and what topics interest you most.<br />
            <span style={{ color: '#666', fontSize: '16px', marginTop: '8px', display: 'inline-block' }}>
              No ads, no data sold ever.
            </span>
          </p>
          
          {/* Tombol-tombol dengan border radius besar */}
          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'flex-start'
          }}>
            <button
              ref={declineBtnRef}
              onClick={handleDecline}
              style={{
                padding: '14px 32px',
                backgroundColor: '#ffffff',
                color: '#000000',
                border: '1.5px solid #e0e0e0',
                borderRadius: '60px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                letterSpacing: '-0.01em',
                fontFamily: 'inherit',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden',
                zIndex: 1,
                background: '#ffffff'
              }}
            >
              Decline
            </button>
            <button
              ref={acceptBtnRef}
              onClick={handleAccept}
              style={{
                padding: '14px 32px',
                backgroundColor: '#ffffff',
                color: '#000000',
                border: '1.5px solid #e0e0e0',
                borderRadius: '60px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                letterSpacing: '-0.01em',
                fontFamily: 'inherit',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden',
                zIndex: 1,
                background: '#ffffff'
              }}
            >
              Accept
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
