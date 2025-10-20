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
        justifyContent: 'left',
        alignItems: 'left',
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
          overflow: 'hidden'
        }}
      >
        {/* Portrait Image - Full Left Side */}
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundImage: 'url(/images/5.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            borderRadius: '20px'
          }}
        />
        
        {/* Text Overlay on Right Side */}
        <div
          style={{
            position: 'absolute',
            right: '0',
            top: '0',
            width: '50%',
            height: '100%',
            background: 'linear-gradient(to left, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            padding: '0 4rem'
          }}
        >
          {/* Judul Besar + Tebal */}
          <h1
            style={{
              fontFamily: 'Arial, sans-serif', // Ganti dengan 'Arame' jika font tersedia
              fontSize: '3.5rem',
              fontWeight: 'bold',
              color: '#000',
              marginBottom: '1rem',
              lineHeight: '1.2',
              textAlign: 'left'
            }}
          >
            Welcome back
          </h1>
          
          {/* Deskripsi */}
          <p
            style={{
              fontFamily: 'Arial, sans-serif', // Ganti dengan 'Arame' jika font tersedia
              fontSize: '1.2rem',
              color: '#666',
              margin: 0,
              lineHeight: '1.5',
              textAlign: 'left'
            }}
          >
            Sign in to your account to continue
          </p>
        </div>
      </div>
    </div>
  );
}
