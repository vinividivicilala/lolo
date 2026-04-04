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
      {/* Header hanya dengan tombol back dan tanda panah */}
      <div style={{
        position: 'sticky',
        top: 0,
        left: 0,
        width: '100%',
        padding: isMobile ? '1.5rem' : '2rem',
        backgroundColor: 'black',
        zIndex: 10
      }}>
        {/* NORTH WEST ARROW - tombol back */}
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

      {/* Teks di sisi kiri tengah - 2 baris */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: isMobile ? '1.5rem' : '2rem',
        transform: 'translateY(-50%)'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}
        >
          {/* Baris 1 */}
          <div style={{
            display: 'flex',
            gap: '2rem',
            flexWrap: 'wrap'
          }}>
            <span style={{
              color: 'white',
              fontSize: '24px',
              fontWeight: '400',
              fontFamily: 'NeueHaasGrotesk, "Helvetica Neue", Helvetica, Arial, sans-serif',
              letterSpacing: '0.5px'
            }}>
              tell
            </span>
            <span style={{
              color: 'white',
              fontSize: '24px',
              fontWeight: '400',
              fontFamily: 'NeueHaasGrotesk, "Helvetica Neue", Helvetica, Arial, sans-serif',
              letterSpacing: '0.5px'
            }}>
              donate
            </span>
            <span style={{
              color: 'white',
              fontSize: '24px',
              fontWeight: '400',
              fontFamily: 'NeueHaasGrotesk, "Helvetica Neue", Helvetica, Arial, sans-serif',
              letterSpacing: '0.5px'
            }}>
              record with all your heart
            </span>
          </div>

          {/* Baris 2 */}
          <div style={{
            display: 'flex',
            gap: '2rem',
            flexWrap: 'wrap'
          }}>
            <span style={{
              color: 'white',
              fontSize: '24px',
              fontWeight: '400',
              fontFamily: 'NeueHaasGrotesk, "Helvetica Neue", Helvetica, Arial, sans-serif',
              letterSpacing: '0.5px'
            }}>
              logic
            </span>
            <span style={{
              color: 'white',
              fontSize: '24px',
              fontWeight: '400',
              fontFamily: 'NeueHaasGrotesk, "Helvetica Neue", Helvetica, Arial, sans-serif',
              letterSpacing: '0.5px'
            }}>
              feelings
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
