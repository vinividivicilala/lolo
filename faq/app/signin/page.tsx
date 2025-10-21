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
        backgroundColor: '#f5f5f5',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Main Card Container */}
      <div
        style={{
          display: 'flex',
          maxWidth: '1200px',
          width: '100%',
          minHeight: '600px',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          overflow: 'hidden',
        }}
      >
        {/* Left Section - Contact Info */}
        <div
          style={{
            flex: '0 0 40%',
            backgroundColor: '#000000',
            color: '#ffffff',
            padding: '60px 40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          {/* Main Title */}
          <div>
            <h1
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                lineHeight: '1.1',
                marginBottom: '30px',
                letterSpacing: '-0.02em',
              }}
            >
              Get in touch.
            </h1>
            <p
              style={{
                fontSize: '18px',
                opacity: '0.8',
                marginBottom: '40px',
                lineHeight: '1.5',
              }}
            >
              Let's start a conversation
            </p>
            <p
              style={{
                fontSize: '16px',
                opacity: '0.8',
                marginBottom: '5px',
              }}
            >
              higsimplestudio.is
            </p>
          </div>

          {/* Location Info */}
          <div style={{ marginBottom: '40px' }}>
            <p
              style={{
                fontSize: '14px',
                opacity: '0.7',
                marginBottom: '5px',
              }}
            >
              Based on
            </p>
            <p
              style={{
                fontSize: '16px',
                marginBottom: '3px',
              }}
            >
              Madrid, ES
            </p>
            <p
              style={{
                fontSize: '16px',
              }}
            >
              Montevideo, UY
            </p>
          </div>

          {/* Social Links */}
          <div style={{ marginBottom: '40px' }}>
            <p
              style={{
                fontSize: '14px',
                opacity: '0.7',
                marginBottom: '15px',
              }}
            >
              Follow us
            </p>
            <div
              style={{
                display: 'flex',
                gap: '20px',
                flexWrap: 'wrap',
              }}
            >
              {['dribbble', 'linkedin', 'instagram', 'twitter'].map((platform) => (
                <span
                  key={platform}
                  style={{
                    fontSize: '16px',
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

          {/* Footer */}
          <div>
            <p
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                marginBottom: '10px',
              }}
            >
              Simple Studio*
            </p>
            <p
              style={{
                fontSize: '12px',
                opacity: '0.6',
              }}
            >
              © 2025 Simple Studio LLC. All Rights Reserved
            </p>
          </div>
        </div>

        {/* Right Section - Sign In Form */}
        <div
          style={{
            flex: '0 0 60%',
            padding: '60px 40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          {/* Welcome Text */}
          <div style={{ marginBottom: '40px' }}>
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

          {/* Social Login Options */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginBottom: '30px',
            }}
          >
            {/* Google Login */}
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px 20px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '14px',
                fontWeight: '500',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#4285F4';
                e.currentTarget.style.backgroundColor = '#f8f9fa';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e0e0e0';
                e.currentTarget.style.backgroundColor = '#ffffff';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" style={{ marginRight: '12px' }}>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            {/* Discord Login */}
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px 20px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '14px',
                fontWeight: '500',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#5865F2';
                e.currentTarget.style.backgroundColor = '#f8f9fa';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e0e0e0';
                e.currentTarget.style.backgroundColor = '#ffffff';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" style={{ marginRight: '12px' }}>
                <path fill="#5865F2" d="M19.73 4.87a18.2 18.2 0 0 0-4.6-1.44c-.21.4-.4.8-.58 1.21a16.6 16.6 0 0 0-4.33 0c-.18-.41-.38-.81-.59-1.21-1.62.27-3.14.77-4.6 1.44A19 19 0 0 0 .96 17.07a18.4 18.4 0 0 0 5.63 2.87c.45-.6.85-1.24 1.2-1.92a12 12 0 0 1-1.89-.92c.16-.12.31-.24.46-.37 3.58 1.68 7.46 1.68 11 0 .15.13.3.25.46.37-.61.37-1.25.69-1.89.92.35.68.75 1.32 1.2 1.92a18.4 18.4 0 0 0 5.63-2.87c-.42-4.4-2.1-8.3-4.73-12.2zM8.3 15.12c-1.1 0-2-1.02-2-2.27 0-1.25.89-2.27 2-2.27 1.1 0 2 1.02 2 2.27 0 1.25-.9 2.27-2 2.27zm7.4 0c-1.1 0-2-1.02-2-2.27 0-1.25.9-2.27 2-2.27 1.1 0 2 1.02 2 2.27 0 1.25-.89 2.27-2 2.27z"/>
              </svg>
              Continue with Discord
            </button>

            {/* GitHub Login */}
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px 20px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '14px',
                fontWeight: '500',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#000000';
                e.currentTarget.style.backgroundColor = '#f8f9fa';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e0e0e0';
                e.currentTarget.style.backgroundColor = '#ffffff';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" style={{ marginRight: '12px' }}>
                <path fill="#000000" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              Continue with GitHub
            </button>
          </div>

          {/* Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '30px',
            }}
          >
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e0e0e0' }} />
            <span style={{ padding: '0 15px', color: '#666666', fontSize: '14px' }}>
              Or continue with email
            </span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e0e0e0' }} />
          </div>

          {/* Email dan Password Form */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              marginBottom: '25px',
            }}
          >
            {/* Email Input */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#000000',
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
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  color: '#000000',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#000000';
                  e.target.style.backgroundColor = '#fafafa';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0e0e0';
                  e.target.style.backgroundColor = '#ffffff';
                }}
              />
            </div>

            {/* Password Input */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#000000',
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
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  color: '#000000',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#000000';
                  e.target.style.backgroundColor = '#fafafa';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0e0e0';
                  e.target.style.backgroundColor = '#ffffff';
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
                backgroundColor: '#000000',
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                marginTop: '10px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#333333';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#000000';
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
              fontSize: '14px',
            }}
          >
            {/* Forgot Password Link */}
            <button
              onClick={handleForgotPassword}
              style={{
                border: 'none',
                background: 'none',
                color: '#666666',
                cursor: 'pointer',
                textDecoration: 'underline',
                transition: 'all 0.3s ease',
                fontSize: '14px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#000000';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#666666';
              }}
            >
              Forgot your password?
            </button>

            {/* Sign Up Link */}
            <div>
              <span style={{ color: '#666666' }}>
                Don't have an account?{' '}
              </span>
              <button
                onClick={handleSignUp}
                style={{
                  border: 'none',
                  background: 'none',
                  color: '#000000',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  fontSize: '14px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.8';
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
    </div>
  );
}
