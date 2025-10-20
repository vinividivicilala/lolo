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
        {/* Portrait Image - Full Size Background */}
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
        
        {/* Black Overlay on Right Side with Text */}
        <div
          style={{
            position: 'absolute',
            right: '0',
            top: '0',
            width: '40%', // Sesuaikan lebar sesuai porsi yang sudah ada
            height: '100%',
            backgroundColor: '#000',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            padding: '0 3rem',
            borderRadius: '0 20px 20px 0'
          }}
        >
          {/* Judul Besar + Tebal */}
          <h1
            style={{
              fontFamily: 'Arial, sans-serif',
              fontSize: '3.5rem',
              fontWeight: 'bold',
              color: '#fff',
              marginBottom: '1rem',
              lineHeight: '1.2'
            }}
          >
            Welcome back
          </h1>
          
          {/* Deskripsi */}
          <p
            style={{
              fontFamily: 'Arial, sans-serif',
              fontSize: '1.2rem',
              color: '#ccc',
              margin: 0,
              lineHeight: '1.5'
            }}
          >
            Sign in to your account to continue
          </p>
        </div>
      </div>
    </div>
  );
}
