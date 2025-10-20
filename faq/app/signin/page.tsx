'use client';

import React from "react";
import { useRouter } from "next/navigation";



export default function SignInPage({ onClose, onSwitchToSignUp, onSwitchToForgotPassword }: SignInPageProps) {
  const router = useRouter();

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '1rem'
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '20px',
          width: '1000px',
          height: '900px',
          position: 'relative',
          display: 'flex',
          overflow: 'hidden',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
        }}
      >
        {/* Bagian Kiri - Gambar */}
        <div
          style={{
            width: '50%',
            height: '100%',
            backgroundImage: 'url(/images/5.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            borderTopLeftRadius: '20px',
            borderBottomLeftRadius: '20px'
          }}
        />

        {/* Bagian Kanan - Teks */}
        <div
          style={{
            width: '50%',
            padding: '80px 60px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            backgroundColor: '#fff'
          }}
        >
          {/* Judul Besar */}
          <h1
            style={{
              fontFamily: 'Arame, sans-serif',
              fontSize: '64px',
              fontWeight: 'bold',
              marginBottom: '20px',
              color: '#000',
              lineHeight: 1.1
            }}
          >
            Welcome Back
          </h1>

          {/* Deskripsi */}
          <p
            style={{
              fontSize: '18px',
              color: '#555',
              fontFamily: 'Inter, sans-serif',
              lineHeight: 1.6,
              marginBottom: '40px'
            }}
          >
            Sign in to your account to continue.
          </p>

          {/* Contoh tombol / aksi tambahan */}
          <button
            onClick={() => router.push('/signin')}
            style={{
              backgroundColor: '#000',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '14px 28px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: '0.3s',
              fontFamily: 'Inter, sans-serif'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#222')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#000')}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
