// faq/app/not-found.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // Redirect ke halaman utama
    router.replace('/');
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      fontFamily: "'Geist', 'Geist Fallback'",
      backgroundColor: '#ffffff',
      padding: '20px',
    }}>
      <h1 style={{ fontSize: '48px', fontWeight: 700, margin: 0, color: '#000' }}>404</h1>
      <p style={{ fontSize: '16px', color: '#666', marginTop: '8px' }}>Halaman tidak ditemukan</p>
      <button
        onClick={() => router.push('/')}
        style={{
          marginTop: '16px',
          padding: '8px 20px',
          backgroundColor: '#000',
          color: '#fff',
          borderRadius: '6px',
          border: 'none',
          cursor: 'pointer',
          fontFamily: "'Geist', 'Geist Fallback'",
          fontSize: '14px',
        }}
      >
        Kembali ke Beranda
      </button>
    </div>
  );
}
