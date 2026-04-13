'use client';

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export default function HomePage(): React.JSX.Element {
  const [showPopup, setShowPopup] = useState(false);
  const acceptBtnRef = useRef<HTMLButtonElement>(null);
  const declineBtnRef = useRef<HTMLButtonElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (consent === null) {
      setShowPopup(true);
    }
  }, []);

  useEffect(() => {
    if (showPopup && acceptBtnRef.current && declineBtnRef.current) {
      // Animasi hover untuk tombol Accept & Decline
      const acceptBtn = acceptBtnRef.current;
      const declineBtn = declineBtnRef.current;

      [acceptBtn, declineBtn].forEach(btn => {
        btn.style.position = 'relative';
        btn.style.overflow = 'hidden';
        btn.style.zIndex = '1';
        
        const pseudoStyle = document.createElement('style');
        pseudoStyle.textContent = `
          .btn-hover-effect {
            position: relative;
            isolation: isolate;
          }
          .btn-hover-effect::before {
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
          .btn-hover-effect:hover::before {
            height: 100%;
          }
          .btn-hover-effect {
            transition: color 0.3s ease;
          }
          .btn-hover-effect:hover {
            color: white !important;
          }
        `;
        document.head.appendChild(pseudoStyle);
        btn.classList.add('btn-hover-effect');
      });

      return () => {
        [acceptBtn, declineBtn].forEach(btn => {
          const styles = document.querySelectorAll('style');
          styles.forEach(style => {
            if (style.textContent?.includes('btn-hover-effect')) {
              style.remove();
            }
          });
        });
      };
    }
  }, [showPopup]);

  useEffect(() => {
    // Efek scroll zoom in/out untuk foto
    if (imageRef.current && containerRef.current) {
      // Set initial state
      gsap.set(imageRef.current, {
        rotation: -8,
        scale: 1,
        borderRadius: "24px",
        transformOrigin: "center center",
      });

      // Create scroll trigger animation
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.5,
          pin: false,
          markers: false,
          invalidateOnRefresh: true
        }
      });

      // Scroll ke bawah: foto menjadi besar, vertikal, dan berubah bentuk
      scrollTl.to(imageRef.current, {
        scale: 2.5,
        rotation: 0,
        borderRadius: "8px",
        duration: 1,
        ease: "power2.inOut",
      }, 0)
      .to(imageRef.current, {
        width: "auto",
        height: "auto",
        duration: 1,
        ease: "power2.inOut",
      }, 0);

      // Cleanup
      return () => {
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      };
    }
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
    <div 
      ref={containerRef}
      style={{
        minHeight: '200vh', // Membuat halaman cukup panjang untuk efek scroll
        backgroundColor: 'black',
        margin: 0,
        padding: 0,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        fontFamily: 'ev-light, sans-serif',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        position: 'relative'
      }}
    >
      {/* Container untuk foto portrait */}
      <div style={{
        position: 'sticky',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        pointerEvents: 'none'
      }}>
        <div
          ref={imageRef}
          style={{
            width: '280px',
            height: 'auto',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            pointerEvents: 'auto',
            transform: 'rotate(-8deg)',
            transition: 'box-shadow 0.3s ease'
          }}
        >
          <img 
            src="/images/5.jpg" 
            alt="Portrait"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block'
            }}
            onError={(e) => {
              // Fallback jika gambar tidak ditemukan
              const target = e.target as HTMLImageElement;
              target.src = 'https://picsum.photos/id/64/400/500';
            }}
          />
        </div>
      </div>

      {/* Konten tambahan untuk efek scroll */}
      <div style={{
        position: 'relative',
        zIndex: 5,
        width: '100%',
        marginTop: '100vh'
      }}>
        <div style={{
          backgroundColor: '#111',
          padding: '80px 20px',
          textAlign: 'center',
          color: 'white'
        }}>
          <h2 style={{ fontSize: '48px', marginBottom: '20px' }}>Scroll Down</h2>
          <p style={{ fontSize: '20px', maxWidth: '600px', margin: '0 auto' }}>
            Lihat efek zoom pada foto di atas saat Anda scroll ke bawah dan ke atas
          </p>
        </div>
      </div>

      {/* Cookie Popup - Bottom Right dengan desain Awwwards */}
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
