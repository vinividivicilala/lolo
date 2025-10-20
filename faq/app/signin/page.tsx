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
        {/* Portrait Image - Half Page Size */}
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundImage: 'url(/images/5.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            borderRadius: '20px 0 0 20px'
          }}
        />
        
        {/* Text Section with Black Background */}
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#000000',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '2rem',
            borderRadius: '0 20px 20px 0'
          }}
        >
          <h1
            style={{
              fontFamily: "'Inter', 'Arial', sans-serif",
              fontSize: '3.5rem',
              fontWeight: 'bold',
              color: '#ffffff',
              marginBottom: '1rem',
              textAlign: 'center'
            }}
          >
            Welcome back
          </h1>
          <p
            style={{
              fontFamily: "'Inter', 'Arial', sans-serif",
              fontSize: '1.2rem',
              color: '#cccccc',
              textAlign: 'center',
              lineHeight: '1.6'
            }}
          >
            Sign in to your account to continue
          </p>
        </div>
      </div>
    </div>
  );
}

