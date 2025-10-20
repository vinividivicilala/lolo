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
        {/* Portrait Image - Large with Partial Border Radius */}
        <div
          style={{
            width: '85%',
            height: '100%',
            backgroundImage: 'url(/images/5.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            borderRadius: '20px 0 0 20px' // Radius hanya di kiri
          }}
        />
        
        {/* Text Section - Positioned to the right */}
        <div
          style={{
            position: 'absolute',
            right: '5%',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            zIndex: 3,
            maxWidth: '40%'
          }}
        >
          <h1
            style={{
              fontFamily: "'Inter', 'Arial', sans-serif",
              fontSize: '50px',
              fontWeight: 'bold',
              color: '#ffffff',
              marginBottom: '1rem',
              textAlign: 'right',
              lineHeight: '1',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
            }}
          >
            Welcome back
          </h1>
          <p
            style={{
              fontFamily: "'Inter', 'Arial', sans-serif",
              fontSize: '20px',
              color: '#ffffff',
              textAlign: 'right',
              lineHeight: '1.2',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
            }}
          >
            Sign in to your account to continue
          </p>
        </div>
      </div>
    </div>
  );
}
