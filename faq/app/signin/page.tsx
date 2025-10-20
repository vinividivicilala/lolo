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
            borderRadius: '20px'
          }}
        />

        {/* Content Overlay - Right Side */}
        <div
          style={{
            position: 'absolute',
            right: '4rem',
            top: '50%',
            transform: 'translateY(-50%)',
            textAlign: 'right',
            color: 'white',
            maxWidth: '400px'
          }}
        >
          {/* Judul Besar - Arame */}
          <h1
            style={{
              fontFamily: 'Roboto',
              fontSize: '4rem',
              fontWeight: 'bold',
              margin: '0 0 2rem 0',
              lineHeight: '1.1',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
            }}
          >
            ARAME
          </h1>
          
          {/* Welcome Back Title */}
          <h2
            style={{
              fontFamily: 'Roboto',
              fontSize: '2.5rem',
              fontWeight: '600',
              margin: '0 0 1rem 0',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
            }}
          >
            Welcome Back
          </h2>
          
          {/* Description */}
          <p
            style={{
              fontFamily: 'Roboto',
              fontSize: '1.1rem',
              margin: '0',
              lineHeight: '1.5',
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
            }}
          >
            Sign in to your account to continue
          </p>
        </div>
      </div>
    </div>
  );
}
