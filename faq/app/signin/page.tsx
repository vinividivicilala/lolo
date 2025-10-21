'use client';

import React from "react";
import { useRouter } from "next/navigation";

export default function SignInPage({ onClose, onSwitchToSignUp, onSwitchToForgotPassword }: any) {
  const router = useRouter();

  const handleSignUp = () => {
    router.push('/signup');
  };

  const handleForgotPassword = () => {
    router.push('/forgot-password');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px 20px',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Main Sign In Container */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '60px',
          marginBottom: '80px',
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

        {/* Container Teks dan Login Options */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginTop: '40px',
          }}
        >
          {/* Teks Welcome */}
          <div style={{ marginBottom: '40px' }}>
            <h1
              style={{
                fontFamily: "'Roboto', sans-serif",
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
                fontFamily: "'Roboto', sans-serif",
                fontSize: '18px',
                color: '#ffffff',
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              }}
            >
              Sign in to your account to continue
            </p>
          </div>

          {/* Social Login Options */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
              marginBottom: '30px',
            }}
          >
            {/* Google Login */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '15px 20px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" style={{ marginRight: '12px' }}>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span style={{ 
                fontFamily: "'Roboto', sans-serif",
                fontSize: '16px', 
                color: '#ffffff',
                fontWeight: '500'
              }}>
                Continue with Google
              </span>
            </div>

            {/* Discord Login */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '15px 20px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" style={{ marginRight: '12px' }}>
                <path fill="#5865F2" d="M19.73 4.87a18.2 18.2 0 0 0-4.6-1.44c-.21.4-.4.8-.58 1.21a16.6 16.6 0 0 0-4.33 0c-.18-.41-.38-.81-.59-1.21-1.62.27-3.14.77-4.6 1.44A19 19 0 0 0 .96 17.07a18.4 18.4 0 0 0 5.63 2.87c.45-.6.85-1.24 1.2-1.92a12 12 0 0 1-1.89-.92c.16-.12.31-.24.46-.37 3.58 1.68 7.46 1.68 11 0 .15.13.3.25.46.37-.61.37-1.25.69-1.89.92.35.68.75 1.32 1.2 1.92a18.4 18.4 0 0 0 5.63-2.87c-.42-4.4-2.1-8.3-4.73-12.2zM8.3 15.12c-1.1 0-2-1.02-2-2.27 0-1.25.89-2.27 2-2.27 1.1 0 2 1.02 2 2.27 0 1.25-.9 2.27-2 2.27zm7.4 0c-1.1 0-2-1.02-2-2.27 0-1.25.9-2.27 2-2.27 1.1 0 2 1.02 2 2.27 0 1.25-.89 2.27-2 2.27z"/>
              </svg>
              <span style={{ 
                fontFamily: "'Roboto', sans-serif",
                fontSize: '16px', 
                color: '#ffffff',
                fontWeight: '500'
              }}>
                Continue with Discord
              </span>
            </div>

            {/* GitHub Login */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '15px 20px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" style={{ marginRight: '12px' }}>
                <path fill="#ffffff" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              <span style={{ 
                fontFamily: "'Roboto', sans-serif",
                fontSize: '16px', 
                color: '#ffffff',
                fontWeight: '500'
              }}>
                Continue with GitHub
              </span>
            </div>
          </div>

          {/* Email dan Password Form */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              padding: '25px',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              marginBottom: '20px',
            }}
          >
            {/* Email Input */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#ffffff',
                  marginBottom: '8px',
                }}
              >
                Email
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.7)';
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                }}
              />
            </div>

            {/* Password Input */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#ffffff',
                  marginBottom: '8px',
                }}
              >
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                style={{
                  width: '100%',
                  padding: '12px 15px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.7)';
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              style={{
                width: '100%',
                padding: '14px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                color: '#000000',
                fontFamily: "'Roboto', sans-serif",
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                marginTop: '10px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Sign In
            </button>
          </div>

          {/* Footer Links */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontFamily: "'Roboto', sans-serif",
              fontSize: '14px',
            }}
          >
            {/* Lupa Password Link */}
            <button
              onClick={handleForgotPassword}
              style={{
                border: 'none',
                background: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                textDecoration: 'underline',
                opacity: '0.8',
                transition: 'all 0.3s ease',
                fontFamily: "'Roboto', sans-serif",
                fontSize: '14px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '0.8';
              }}
            >
              Forgot your password?
            </button>

            {/* Sign Up Link */}
            <div>
              <span style={{ color: '#ffffff', opacity: '0.8' }}>
                Don't have an account?{' '}
              </span>
              <button
                onClick={handleSignUp}
                style={{
                  border: 'none',
                  background: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: '14px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                Sign up
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer seperti di foto - WHITE BACKGROUND */}
      <div
        style={{
          width: '100%',
          maxWidth: '1200px',
          backgroundColor: '#ffffff', // Background putih
          color: '#000000', // Text hitam
          padding: '80px 60px', // Padding lebih besar
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '60px',
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {/* Left Section - Main Content */}
        <div style={{ flex: '1' }}>
          <h1
            style={{
              fontSize: '72px', // Font sangat besar
              fontWeight: 'bold',
              lineHeight: '0.9',
              marginBottom: '30px',
              letterSpacing: '-0.03em',
            }}
          >
            Get in touch.
          </h1>
          
          <div style={{ marginBottom: '50px' }}>
            <p
              style={{
                fontSize: '20px',
                marginBottom: '8px',
                opacity: '0.8',
              }}
            >
              Let's start a conversation
            </p>
            <p
              style={{
                fontSize: '18px',
                opacity: '0.8',
              }}
            >
              higsimplestudio.is
            </p>
          </div>

          <div style={{ marginBottom: '40px' }}>
            <p
              style={{
                fontSize: '16px',
                opacity: '0.7',
                marginBottom: '12px',
              }}
            >
              Based on
            </p>
            <p
              style={{
                fontSize: '18px',
                marginBottom: '6px',
              }}
            >
              Madrid, ES
            </p>
            <p
              style={{
                fontSize: '18px',
              }}
            >
              Montevideo, UY
            </p>
          </div>

          <div>
            <p
              style={{
                fontSize: '16px',
                opacity: '0.7',
                marginBottom: '15px',
              }}
            >
              Follow us
            </p>
            <div
              style={{
                display: 'flex',
                gap: '25px',
              }}
            >
              {['dribbble', 'linkedin', 'instagram', 'twitter'].map((platform) => (
                <span
                  key={platform}
                  style={{
                    fontSize: '18px',
                    cursor: 'pointer',
                    transition: 'opacity 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.7';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  {platform}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Section - Studio Info */}
        <div style={{ 
          textAlign: 'right',
          alignSelf: 'flex-end', // Posisi di bagian bawah
        }}>
          <p
            style={{
              fontSize: '28px',
              fontWeight: 'bold',
              marginBottom: '15px',
            }}
          >
            Simple Studio*
          </p>
          <p
            style={{
              fontSize: '14px',
              opacity: '0.6',
            }}
          >
            © 2025 Simple Studio LLC. All Rights Reserved
          </p>
        </div>
      </div>
    </div>
  );
}
