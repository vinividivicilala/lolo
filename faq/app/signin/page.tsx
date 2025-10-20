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
        {/* Left Side - Text Content */}
        <div
          style={{
            width: '50%',
            padding: '4rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            backgroundColor: 'white'
          }}
        >
          {/* Judul Besar - Arame */}
          <h1
            style={{
              fontFamily: 'Arial, sans-serif',
              fontSize: '6rem',
              fontWeight: 'bold',
              color: '#000',
              margin: '0 0 3rem 0',
              lineHeight: '1',
              letterSpacing: '2px'
            }}
          >
            ARAME
          </h1>
          
          {/* Welcome Back Title */}
          <h2
            style={{
              fontFamily: 'Arial, sans-serif',
              fontSize: '3.5rem',
              fontWeight: '700',
              color: '#000',
              margin: '0 0 1.5rem 0',
              lineHeight: '1.2'
            }}
          >
            Welcome Back
          </h2>
          
          {/* Description */}
          <p
            style={{
              fontFamily: 'Arial, sans-serif',
              fontSize: '1.8rem',
              color: '#666',
              margin: '0',
              lineHeight: '1.4',
              fontWeight: '400'
            }}
          >
            Sign in to your account to continue
          </p>
        </div>

        {/* Right Side - Portrait Image */}
        <div
          style={{
            width: '50%',
            height: '100%',
            backgroundImage: 'url(/images/5.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            borderRadius: '20px'
          }}
        />
      </div>
    </div>
  );
}
