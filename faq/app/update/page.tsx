'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function UpdatePage() {
  const router = useRouter();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'black',
      color: 'white',
      padding: '2rem',
      fontFamily: 'Helvetica, Arial, sans-serif'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '3rem', marginRight: '1rem' }}>Website Title</h1>
        <span style={{ 
          fontSize: '3rem',
          color: 'rgba(255,255,255,0.8)'
        }}>
          Menuru
        </span>
      </div>
    </div>
  );
}
