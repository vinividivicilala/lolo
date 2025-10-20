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
        {/* Portrait Image - Scaled Larger (130%) on Left */}
        <div
          style={{
            width: '80%',
            height: '100%',
            backgroundImage: 'url(/images/5.jpg)',
            backgroundSize: '130%',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            borderRadius: '20px 0 0 20px',
            transform: 'scale(1.1)',
            transformOrigin: 'left center'
          }}
        />
        
        {/* Text Section with Black Background - Smaller (20%) on Right */}
        <div
          style={{
            width: '20%',
            height: '100%',
            backgroundColor: '#000000',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start', // Diubah ke flex-start untuk sejajar kiri
            padding: '2rem',
            borderRadius: '0 20px 20px 0',
            position: 'relative',
            zIndex: 2
          }}
        >
          <h1
            style={{
              fontFamily: "'Inter', 'Arial', sans-serif",
              fontSize: '50px', // Minimal 50px
              fontWeight: 'bold',
              color: '#ffffff',
              marginBottom: '1.5rem',
              textAlign: 'left', // Diubah ke left
              lineHeight: '1.1',
              wordWrap: 'break-word',
              width: '100%'
            }}
          >
            Welcome back
          </h1>
          <p
            style={{
              fontFamily: "'Inter', 'Arial', sans-serif",
              fontSize: '20px', // Diperbesar
              color: '#cccccc',
              textAlign: 'left', // Diubah ke left
              lineHeight: '1.3',
              wordWrap: 'break-word',
              width: '100%'
            }}
          >
            Sign in to your account to continue
          </p>
        </div>
      </div>
    </div>
  );
}
