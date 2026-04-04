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

  // DATA
  const tableData = [
    { year: "interview 2023", title: "Top Interactive Agencies Interview" },
    { year: "interview 2022", title: "Lovers Magazine Interview" },
    { year: "publication 2020", title: "Centogene Solutions" },
    { year: "talk 2020", title: "Creative collaboration at WeTransfer" },
    { year: "publication 2020", title: "Madeleine Dalla Site of the Month Insight" },
    { year: "talk 2020", title: "Rendering Illusions at Awwwards" },
    { year: "publication 2019", title: "Real-time Multiside Refraction in Three Steps" },
    { year: "publication 2019", title: "Making a connected flip-dot installation" },
    { year: "publication 2019", title: "Bandito Immersive Experience" },
    { year: "publication 2018", title: "Resn’s Little Help AR" },
  ];

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

      {/* HEADER BACK */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        padding: isMobile ? '1.5rem' : '2rem',
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
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M17 7L7 17" />
            <path d="M7 7h10v10" />
          </svg>
          <span style={{ color: 'white', fontSize: '1rem' }}>Back</span>
        </motion.div>
      </div>

      {/* CONTENT CENTER */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100%',
        maxWidth: '1100px',
        padding: isMobile ? '0 1.5rem' : '0 3rem'
      }}>

        {/* HERO TEXT */}
        <div style={{ marginBottom: '4rem' }}>
          <span style={{
            color: 'white',
            fontSize: isMobile ? '3rem' : '80px',
            fontWeight: '400',
            lineHeight: 1.2,
            display: 'block'
          }}>
            Tell Donate Record With All Your Heart
          </span>
          <span style={{
            color: 'white',
            fontSize: isMobile ? '3rem' : '80px',
            fontWeight: '400',
            lineHeight: 1.2,
            display: 'block'
          }}>
            Logic Feelings
          </span>
        </div>

        {/* DESCRIPTION */}
        <div style={{ marginBottom: '4rem' }}>
          <p style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: isMobile ? '1rem' : '24px',
            lineHeight: 1.5,
            maxWidth: '600px',
            margin: 0
          }}>
            From concept to code, I work hand-in-hand with developers and designers—juxtaposing the intuitive with the curious to create delightful and engaging experiences for the world wide web
          </p>
        </div>

        {/* LINE */}
        <div style={{
          width: '100%',
          height: '1px',
          backgroundColor: 'rgba(255,255,255,0.2)',
          marginBottom: '1rem'
        }} />

        {/* ✅ TABLE */}
        <div style={{ width: '100%' }}>
          {tableData.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: isMobile ? '1.5rem 0' : '2rem 0',
                borderBottom: '1px solid rgba(255,255,255,0.2)',
                cursor: 'pointer'
              }}
              whileHover={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                paddingLeft: '12px'
              }}
            >

              {/* LEFT */}
              <div style={{
                minWidth: isMobile ? '140px' : '220px'
              }}>
                <span style={{
                  color: 'white',
                  fontSize: isMobile ? '1rem' : '1.1rem',
                  textTransform: 'lowercase',
                  letterSpacing: '0.5px'
                }}>
                  {item.year}
                </span>
              </div>

              {/* CENTER */}
              <div style={{
                flex: 1,
                paddingLeft: '2rem',
                paddingRight: '2rem'
              }}>
                <span style={{
                  color: 'white',
                  fontSize: isMobile ? '1.2rem' : '1.5rem',
                  lineHeight: 1.4
                }}>
                  {item.title}
                </span>
              </div>

              {/* RIGHT ARROW */}
              <div>
                <svg
                  width={isMobile ? "26" : "32"}
                  height={isMobile ? "26" : "32"}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M7 17L17 7" />
                  <path d="M7 7h10v10" />
                </svg>
              </div>

            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}
