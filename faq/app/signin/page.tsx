'use client';

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface SignInPageProps {
  onClose: () => void;
  onSwitchToSignUp: () => void;
  onSwitchToForgotPassword: () => void;
}

declare global {
  interface Window {
    gsap: any;
  }
}

export default function SignInPage({ onClose, onSwitchToSignUp, onSwitchToForgotPassword }: SignInPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const modalRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const leftSideRef = useRef<HTMLDivElement>(null);
  const rightSideRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Dynamic import untuk GSAP
    const loadGSAP = async () => {
      const gsapModule = await import('gsap');
      window.gsap = gsapModule.gsap;
      
      // Animasi masuk
      if (modalRef.current && containerRef.current) {
        window.gsap.fromTo(modalRef.current, 
          { opacity: 0 },
          { opacity: 1, duration: 0.4, ease: "power2.out" }
        );
        
        window.gsap.fromTo(containerRef.current, 
          { scale: 0.8, opacity: 0, y: 50 },
          { scale: 1, opacity: 1, y: 0, duration: 0.6, ease: "back.out(1.7)" }
        );
        
        // Animasi untuk sisi kiri dan kanan
        if (leftSideRef.current && rightSideRef.current) {
          window.gsap.fromTo(leftSideRef.current,
            { x: -50, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.5, delay: 0.2 }
          );
          
          window.gsap.fromTo(rightSideRef.current,
            { x: 50, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.5, delay: 0.3 }
          );
        }
      }
    };

    loadGSAP();
  }, []);

  const handleClose = () => {
    if (window.gsap && modalRef.current && containerRef.current) {
      window.gsap.to(containerRef.current, {
        scale: 0.8,
        opacity: 0,
        y: 50,
        duration: 0.4,
        ease: "power2.in",
        onComplete: onClose
      });
      
      window.gsap.to(modalRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in"
      });
    } else {
      onClose();
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulasi proses login
    setTimeout(() => {
      setIsLoading(false);
      handleClose();
      router.push('/dashboard');
    }, 1500);
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`Login with ${provider}`);
    // Animasi tombol sosial media
    if (window.gsap) {
      const button = document.querySelector(`[data-provider="${provider}"]`);
      if (button) {
        window.gsap.to(button, {
          scale: 0.95,
          duration: 0.1,
          yoyo: true,
          repeat: 1
        });
      }
    }
  };

  return (
    <div
      ref={modalRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '1rem'
      }}
    >
      <div
        ref={containerRef}
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          maxWidth: '1000px',
          width: '100%',
          height: '550px',
          position: 'relative',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'white',
            fontSize: '1.5rem',
            fontWeight: '300',
            zIndex: 10,
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          ×
        </button>

        {/* Left Side - Image */}
        <div
          ref={leftSideRef}
          style={{
            flex: 1,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            zIndex: 2,
            position: 'relative'
          }}>
            <h3 style={{
              fontSize: '2rem',
              fontWeight: '700',
              marginBottom: '1rem',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              Welcome Back
            </h3>
            <p style={{
              fontSize: '1rem',
              opacity: 0.9,
              lineHeight: '1.6',
              maxWidth: '300px',
              margin: '0 auto'
            }}>
              Sign in to your account to continue your journey with us
            </p>
          </div>
          
          {/* Background Pattern */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            zIndex: 1
          }}></div>
        </div>

        {/* Right Side - Login Form */}
        <div
          ref={rightSideRef}
          style={{
            flex: 1,
            padding: '3rem 2.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            background: 'white',
            position: 'relative'
          }}
        >
          {/* White border line effect */}
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            right: '10px',
            bottom: '10px',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '15px',
            pointerEvents: 'none'
          }}></div>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#111827',
              margin: '0 0 0.5rem 0'
            }}>
              Sign In
            </h2>
            <p style={{
              color: '#6B7280',
              fontSize: '0.9rem'
            }}>
              Enter your credentials to access your account
            </p>
          </div>

          {/* Social Login Buttons */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                data-provider="google"
                onClick={() => handleSocialLogin('google')}
                style={{
                  padding: '0.75rem',
                  border: '1px solid #D1D5DB',
                  background: 'white',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '50px',
                  height: '50px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </button>
              
              <button
                type="button"
                data-provider="github"
                onClick={() => handleSocialLogin('github')}
                style={{
                  padding: '0.75rem',
                  border: '1px solid #D1D5DB',
                  background: 'white',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '50px',
                  height: '50px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#333">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </button>
              
              <button
                type="button"
                data-provider="discord"
                onClick={() => handleSocialLogin('discord')}
                style={{
                  padding: '0.75rem',
                  border: '1px solid #D1D5DB',
                  background: 'white',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '50px',
                  height: '50px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#5865F2">
                  <path d="M19.73 4.87a18.2 18.2 0 0 0-4.6-1.44c-.21.4-.4.8-.58 1.21-1.69-.25-3.4-.25-5.1 0-.18-.41-.37-.82-.59-1.21-1.6.27-3.14.75-4.6 1.44C2.2 9.13 1.5 13.28 1.9 17.37c1.9 1.4 4.1 2.3 6.3 2.8.5-.7 1-1.5 1.4-2.3-.8-.3-1.5-.7-2.1-1.2.2-.1.4-.3.6-.4 4.5 2.1 9.4 2.1 13.9 0 .2.1.4.3.6.4-.6.5-1.3.9-2.1 1.2.4.8.9 1.6 1.4 2.3 2.2-.5 4.4-1.4 6.3-2.8.5-4.9-.8-9-2.4-12.5zM8.7 15.1c-1.1 0-2-1-2-2.2 0-1.2.9-2.2 2-2.2 1.1 0 2 1 2 2.2 0 1.2-.9 2.2-2 2.2zm6.6 0c-1.1 0-2-1-2-2.2 0-1.2.9-2.2 2-2.2 1.1 0 2 1 2 2.2 0 1.2-.9 2.2-2 2.2z"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            margin: '1.5rem 0',
            color: '#6B7280'
          }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }}></div>
            <span style={{ 
              padding: '0 1rem', 
              fontSize: '0.75rem', 
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Or continue with email
            </span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }}></div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSignIn}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151'
              }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  transition: 'all 0.3s ease',
                  backgroundColor: 'white',
                  outline: 'none'
                }}
                placeholder="Enter your email"
                onFocus={(e) => {
                  e.target.style.borderColor = '#3B82F6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#D1D5DB';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151'
                }}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={onSwitchToForgotPassword}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#6B7280',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    transition: 'color 0.2s ease',
                    padding: 0
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#374151';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#6B7280';
                  }}
                >
                  Forgot your password?
                </button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  transition: 'all 0.3s ease',
                  backgroundColor: 'white',
                  outline: 'none'
                }}
                placeholder="Enter your password"
                onFocus={(e) => {
                  e.target.style.borderColor = '#3B82F6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#D1D5DB';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                marginBottom: '1.5rem',
                opacity: isLoading ? 0.7 : 1,
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Sign Up Link */}
          <div style={{
            textAlign: 'center',
            fontSize: '0.875rem',
            color: '#6B7280'
          }}>
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToSignUp}
              style={{
                background: 'none',
                border: 'none',
                color: '#667eea',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600',
                textDecoration: 'underline',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#764ba2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#667eea';
              }}
            >
              Sign up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
