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
          background: 'white',
          borderRadius: '20px',
          width: '1000px',
          height: '600px',
          position: 'relative',
          display: 'flex',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
        }}
      >
        {/* Full Size Image - Cover Entire Container */}
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundImage: 'url(/images/5.jpg)',
            backgroundSize: '120%', // Diperbesar
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            borderRadius: '20px'
          }}
        />
        
        {/* Line Box Overlay */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            right: '40px',
            transform: 'translateY(-50%)',
            width: '380px',
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '40px',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            border: '1px solid #e1e1e1'
          }}
        >
          {/* Title */}
          <div style={{ marginBottom: '30px' }}>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#000000',
              marginBottom: '8px'
            }}>
              Welcome back
            </h1>
            <p style={{
              fontSize: '14px',
              color: '#666666'
            }}>
              Sign in to your account to continue
            </p>
          </div>

          {/* Social Login Buttons */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            marginBottom: '20px'
          }}>
            <button style={{
              padding: '12px',
              border: '1px solid #e1e1e1',
              borderRadius: '8px',
              backgroundColor: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}>
              Google
            </button>
            <button style={{
              padding: '12px',
              border: '1px solid #e1e1e1',
              borderRadius: '8px',
              backgroundColor: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}>
              GitHub
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            marginBottom: '30px'
          }}>
            <button style={{
              padding: '12px',
              border: '1px solid #e1e1e1',
              borderRadius: '8px',
              backgroundColor: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}>
              Discord
            </button>
            <button style={{
              padding: '12px',
              border: '1px solid #e1e1e1',
              borderRadius: '8px',
              backgroundColor: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}>
              OR CONTINUE WITH
            </button>
          </div>

          {/* Email Input */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '8px',
              color: '#333333'
            }}>
              Email
            </label>
            <input
              type="email"
              placeholder="example@gmail.com"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e1e1e1',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          {/* Password Input */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '8px',
              color: '#333333'
            }}>
              Password
            </label>
            <input
              type="password"
              placeholder="***********"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e1e1e1',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          {/* Sign In Button */}
          <button style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#000000',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            marginBottom: '20px'
          }}>
            Sign In with Email
          </button>

          {/* Footer Links */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '14px'
          }}>
            <button 
              onClick={onSwitchToForgotPassword}
              style={{
                border: 'none',
                background: 'none',
                color: '#666666',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Forgot your password?
            </button>
            <div>
              <span style={{ color: '#666666' }}>Don't have an account? </span>
              <button 
                onClick={onSwitchToSignUp}
                style={{
                  border: 'none',
                  background: 'none',
                  color: '#000000',
                  fontWeight: '500',
                  cursor: 'pointer',
                  textDecoration: 'underline'
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
