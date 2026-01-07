'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ChatbotPage() {
  const router = useRouter();
  const [isHover, setIsHover] = useState(false);
  const [isTap, setIsTap] = useState(false);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'black',
      color: 'white',
      padding: '2rem',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }}>
      <button
        onClick={() => router.back()}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        onMouseDown={() => setIsTap(true)}
        onMouseUp={() => setIsTap(false)}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: isHover ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '8px',
          color: 'white',
          cursor: 'pointer',
          marginBottom: '2rem',
          backdropFilter: 'blur(10px)',
          transform: isTap ? 'scale(0.95)' : 'scale(1)',
          transition: 'all 0.2s ease',
          outline: 'none'
        }}
      >
        ← Back
      </button>

      <div
        style={{
          opacity: 0,
          animation: 'fadeInUp 0.5s ease forwards',
          height: 'calc(100vh - 6rem)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}
      >
        <h1 style={{
          fontSize: '6rem',
          fontWeight: 300,
          letterSpacing: '-0.02em',
          lineHeight: 1
        }}>
          chatbot
        </h1>
      </div>

      <style jsx global>{`
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
      `}</style>
    </div>
  );
}
