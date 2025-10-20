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
      {/* Container untuk foto dan teks */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '60px',
        }}
      >
        {/* Foto Portrait */}
        <div
          style={{
            width: '500px',
            height: '700px',
            backgroundImage: 'url(/images/5.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          }}
        />

        {/* Teks di Sebelah Kanan */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <h1
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#ffffff',
              marginBottom: '15px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            }}
          >
            Welcome back
          </h1>
          <p
            style={{
              fontSize: '18px',
              color: '#ffffff',
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
            }}
          >
            Sign in to your account to continue
          </p>
        </div>
      </div>
    </div>
  );
}
