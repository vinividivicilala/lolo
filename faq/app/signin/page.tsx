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
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '40px',
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        }}
      >
        {/* Foto Portrait di Kiri */}
        <div
          style={{
            width: '400px',
            height: '500px',
            backgroundImage: 'url(/images/5.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            borderRadius: '15px',
          }}
        />

        {/* Teks di Sebelah Kanan */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
        >
          <h1
            style={{
              fontSize: '36px',
              fontWeight: 'bold',
              color: '#000000',
              marginBottom: '10px',
            }}
          >
            Welcome back
          </h1>
          <p
            style={{
              fontSize: '16px',
              color: '#666666',
            }}
          >
            Sign in to your account to continue
          </p>
        </div>
      </div>
    </div>
  );
}
