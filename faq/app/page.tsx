'use client';

import React, { useState, useEffect } from "react";

export default function HomePage(): React.JSX.Element {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookieConsent');
    if (consent === null) {
      setShowPopup(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowPopup(false);
    // Here you can initialize analytics or tracking
    console.log('Cookies accepted');
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setShowPopup(false);
    console.log('Cookies declined');
  };

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
      fontFamily: 'ev-light, sans-serif',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
      position: 'relative'
    }}>
      {/* Halaman kosong */}

      {/* Cookie Popup - Bottom Right */}
      {showPopup && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          maxWidth: '320px',
          backgroundColor: '#1a1a1a',
          color: '#e0e0e0',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          zIndex: 1000,
          fontFamily: 'ev-light, sans-serif',
          border: '1px solid #333',
          backdropFilter: 'blur(8px)',
          animation: 'fadeInUp 0.3s ease-out'
        }}>
          <style>
            {`
              @keyframes fadeInUp {
                from {
                  opacity: 0;
                  transform: translateY(20px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `}
          </style>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '12px'
          }}>
            <span style={{ fontSize: '24px' }}>🍪</span>
            <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Cookie Consent</span>
          </div>
          <p style={{
            fontSize: '13px',
            lineHeight: '1.5',
            marginBottom: '20px',
            color: '#b0b0b0'
          }}>
            I use cookies to understand how you navigate this site and what topics interest you most. 
            No ads, no data sold ever.
          </p>
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            <button
              onClick={handleDecline}
              style={{
                padding: '8px 20px',
                backgroundColor: 'transparent',
                color: '#e0e0e0',
                border: '1px solid #555',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2a2a2a';
                e.currentTarget.style.borderColor = '#777';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = '#555';
              }}
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              style={{
                padding: '8px 20px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#45a049';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#4CAF50';
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
