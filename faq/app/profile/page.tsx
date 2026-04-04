'use client';

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'black',
      margin: 0,
      padding: 0,
      width: '100%',
      fontFamily: 'NeueHaasGrotesk, "Helvetica Neue", Helvetica, Arial, sans-serif',
      position: 'relative'
    }}>
      {/* Header dengan tombol back */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        padding: isMobile ? '1.5rem' : '2rem',
        backgroundColor: 'transparent',
        zIndex: 10
      }}>
        <motion.div
          onClick={() => router.back()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            cursor: 'pointer',
            width: 'fit-content'
          }}
          whileHover={{ x: -3 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg
            width={isMobile ? "28" : "32"}
            height={isMobile ? "28" : "32"}
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 7L7 17" />
            <path d="M7 7h10v10" />
          </svg>
          <span style={{
            color: 'white',
            fontSize: isMobile ? '1rem' : '1.2rem',
            fontWeight: '300',
            letterSpacing: '1px',
            fontFamily: 'NeueHaasGrotesk, "Helvetica Neue", Helvetica, Arial, sans-serif'
          }}>
            Back
          </span>
        </motion.div>
      </div>

      {/* Konten utama - rata kiri, posisi tengah vertikal */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: isMobile ? '1.5rem' : '3rem',
        right: isMobile ? '1.5rem' : '3rem',
        transform: 'translateY(-50%)'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            textAlign: 'left',
            maxWidth: '800px'
          }}
        >
          {/* Teks utama 80px - 2 baris */}
          <div style={{
            marginBottom: '2rem'
          }}>
            <div>
              <span style={{
                color: 'white',
                fontSize: isMobile ? '3rem' : '80px',
                fontWeight: '400',
                fontFamily: 'NeueHaasGrotesk, "Helvetica Neue", Helvetica, Arial, sans-serif',
                textTransform: 'capitalize',
                lineHeight: 1.2,
                display: 'block'
              }}>
                Tell Donate Record
              </span>
            </div>
            <div>
              <span style={{
                color: 'white',
                fontSize: isMobile ? '3rem' : '80px',
                fontWeight: '400',
                fontFamily: 'NeueHaasGrotesk, "Helvetica Neue", Helvetica, Arial, sans-serif',
                textTransform: 'capitalize',
                lineHeight: 1.2,
                display: 'block'
              }}>
                With All Your Heart
              </span>
            </div>
            <div>
              <span style={{
                color: 'white',
                fontSize: isMobile ? '3rem' : '80px',
                fontWeight: '400',
                fontFamily: 'NeueHaasGrotesk, "Helvetica Neue", Helvetica, Arial, sans-serif',
                textTransform: 'capitalize',
                lineHeight: 1.2,
                display: 'block'
              }}>
                Logic Feelings
              </span>
            </div>
          </div>

          {/* Teks deskripsi 24px */}
          <div>
            <p style={{
              color: 'rgba(255,255,255,0.7)',
              fontSize: isMobile ? '1rem' : '24px',
              fontWeight: '400',
              fontFamily: 'NeueHaasGrotesk, "Helvetica Neue", Helvetica, Arial, sans-serif',
              lineHeight: 1.5,
              margin: 0,
              maxWidth: '600px'
            }}>
              From concept to code, I work hand-in-hand with developers and designers—juxtaposing the intuitive with the curious to create delightful and engaging experiences for the world wide web
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
