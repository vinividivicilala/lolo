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
        {/* Portrait Image - Full Width with Border Radius */}
        <div
          style={{
            width: '75%',
            height: '100%',
            backgroundImage: 'url(/images/5.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            borderRadius: '20px' // Full border radius
          }}
        />
        
        {/* Text Section with Black Background - Overlay on Right */}
        <div
          style={{
            width: '30%',
            height: '100%',
            backgroundColor: '#000000',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '2rem',
            position: 'absolute',
            right: 0,
            top: 0,
            borderRadius: '0 20px 20px 0',
            zIndex: 3
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              textAlign: 'center'
            }}
          >
            <h1
              style={{
                fontFamily: "'Inter', 'Arial', sans-serif",
                fontSize: '36px',
                fontWeight: 'bold',
                color: '#ffffff',
                marginBottom: '1rem',
                textAlign: 'center',
                lineHeight: '1.1',
                width: '100%',
                wordBreak: 'keep-all'
              }}
            >
              Welcome back
            </h1>
            <p
              style={{
                fontFamily: "'Inter', 'Arial', sans-serif",
                fontSize: '14px',
                color: '#cccccc',
                textAlign: 'center',
                lineHeight: '1.3',
                width: '100%',
                wordBreak: 'keep-all'
              }}
            >
              Sign in to your account to continue
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
