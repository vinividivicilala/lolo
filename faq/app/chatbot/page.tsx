'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function ChatbotPage() {
  const router = useRouter();

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
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '8px',
          color: 'white',
          cursor: 'pointer',
          marginBottom: '2rem',
          backdropFilter: 'blur(10px)',
          transition: 'background-color 0.2s, transform 0.1s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        ← Back
      </button>

      <div
        style={{
          opacity: 0,
          transform: 'translateY(20px)',
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
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
