'use client';

import React, { useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { motion } from 'framer-motion';
import gsap from 'gsap';

const FONT_FAMILY = "'Poppins', 'Poppins Fallback', sans-serif";

export default function PusatBantuanPage() {
  useEffect(() => {
    // Animasi GSAP untuk teks "Pusat Bantuan"
    gsap.fromTo(
      '.hero-text',
      { scale: 0.8, opacity: 0, y: 50 },
      { scale: 1, opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.2 }
    );
  }, []);

  return (
    <>
      <Head>
        <title>Pusat Bantuan | Menuru</title>
        <meta name="description" content="Pusat Bantuan Menuru - Bantuan dan dukungan" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link rel="icon" href="/images/ai.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/images/ai.jpg" />
      </Head>

      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#ffffff",
          margin: 0,
          padding: 0,
          fontFamily: FONT_FAMILY,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* ===== BANNER SAMA SEPERTI HALAMAN UTAMA ===== */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            width: "100%",
            backgroundColor: "#0D3CFC",
            padding: "14px 20px",
            zIndex: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderBottom: "none",
            gap: "20px",
          }}
        >
          <span
            style={{
              fontSize: "24px",
              fontWeight: 600,
              color: "#ffffff",
              fontFamily: FONT_FAMILY,
              letterSpacing: "-0.01em",
              textAlign: "center",
            }}
          >
            Website sedang dalam pengembangan, Terima kasih
          </span>
          <div
            style={{
              backgroundColor: "#EB2227",
              padding: "6px 16px",
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "#ffffff",
                fontFamily: FONT_FAMILY,
                letterSpacing: "-0.01em",
              }}
            >
              #lifeatmenuru
            </span>
          </div>
        </motion.div>

        {/* ===== HEADER SAMA SEPERTI HALAMAN UTAMA ===== */}
        <div style={{
          position: "absolute",
          top: "80px",
          left: "40px",
          right: "40px",
          zIndex: 15,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          {/* KIRI: Menuru + Search (sama) */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Link href="/" style={{ textDecoration: "none" }}>
                <span
                  style={{
                    fontSize: "48px",
                    fontWeight: 700,
                    color: "#000000",
                    fontFamily: FONT_FAMILY,
                    letterSpacing: "-0.03em",
                    background: "transparent",
                    cursor: "pointer",
                  }}
                >
                  Menuru
                </span>
              </Link>
            </motion.div>

            {/* Search - sama persis */}
            <div style={{ position: "relative" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  backgroundColor: "#0D3CFC",
                  borderRadius: "12px",
                  padding: "4px 8px",
                  border: "none",
                  position: "relative",
                  minWidth: "240px",
                  width: "240px",
                  boxShadow: "0 2px 12px rgba(13,60,252,0.2)",
                  cursor: "pointer",
                }}
              >
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 16px",
                  color: "#ffffff",
                  width: "100%",
                  justifyContent: "space-between",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="11" cy="11" r="7" stroke="white" strokeWidth="1.5"/>
                      <path d="M16 16L21 21" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <span style={{ color: "#ffffff", fontWeight: 400, fontSize: "14px" }}>
                      Cari di Pusat Bantuan
                    </span>
                  </div>
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", fontWeight: 300 }}>
                    ⌘K
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* TENGAH: Note Donations News Calendar - 29px (sama) */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "40px",
              padding: "0 20px",
            }}
          >
            <Link href="/" style={{ textDecoration: "none" }}>
              <span style={{
                fontSize: "29px",
                fontWeight: 500,
                color: "#000000",
                fontFamily: FONT_FAMILY,
                letterSpacing: "-0.02em",
                cursor: "pointer",
              }}>
                Note
              </span>
            </Link>
            <Link href="/" style={{ textDecoration: "none" }}>
              <span style={{
                fontSize: "29px",
                fontWeight: 500,
                color: "#000000",
                fontFamily: FONT_FAMILY,
                letterSpacing: "-0.02em",
                cursor: "pointer",
              }}>
                Donations
              </span>
            </Link>
            <Link href="/" style={{ textDecoration: "none" }}>
              <span style={{
                fontSize: "29px",
                fontWeight: 500,
                color: "#000000",
                fontFamily: FONT_FAMILY,
                letterSpacing: "-0.02em",
                cursor: "pointer",
              }}>
                News
              </span>
            </Link>
            <Link href="/" style={{ textDecoration: "none" }}>
              <span style={{
                fontSize: "29px",
                fontWeight: 500,
                color: "#000000",
                fontFamily: FONT_FAMILY,
                letterSpacing: "-0.02em",
                cursor: "pointer",
              }}>
                Calendar
              </span>
            </Link>
          </motion.div>

          {/* KANAN: Shop + Pusat bantuan + Notif + Profile (sama) */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Shop Button */}
            <Link href="/" style={{ textDecoration: "none" }}>
              <motion.button
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#000000",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "16px",
                  fontWeight: 500,
                  fontFamily: FONT_FAMILY,
                  padding: "8px 12px",
                  borderRadius: "30px",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.04)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 7H20M4 7L3 12H21L20 7M4 7L5 20H19L20 7" />
                  <path d="M9 12V16H15V12" />
                </svg>
                <span>Shop</span>
              </motion.button>
            </Link>

            {/* Help Center Button - active (tidak bisa diklik) */}
            <div
              style={{
                background: "transparent",
                border: "none",
                color: "#0D3CFC",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "16px",
                fontWeight: 600,
                fontFamily: FONT_FAMILY,
                padding: "8px 12px",
                borderRadius: "30px",
                backgroundColor: "rgba(13,60,252,0.08)",
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0D3CFC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12V15" />
                <path d="M5 15C5 13.8954 5.89543 13 7 13H8C9.10457 13 10 13.8954 10 15V17C10 18.1046 9.10457 19 8 19H7C5.89543 19 5 18.1046 5 17V15Z" />
                <path d="M19 15C19 13.8954 18.1046 13 17 13H16C14.8954 13 14 13.8954 14 15V17C14 18.1046 14.8954 19 16 19H17C18.1046 19 19 18.1046 19 17V15Z" />
                <path d="M8 13V11C8 8.79086 9.79086 7 12 7C14.2091 7 16 8.79086 16 11V13" />
              </svg>
              <span>Pusat bantuan</span>
            </div>

            {/* Notification Button - dummy */}
            <div style={{ position: "relative" }}>
              <div
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#000000",
                  padding: "8px 8px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  opacity: 0.5,
                  cursor: "default",
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" />
                  <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" />
                </svg>
              </div>
            </div>

            {/* Profile Photo - dummy */}
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "8px",
                backgroundColor: "#f0f0f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid #e0e0e0",
                opacity: 0.5,
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4" />
                <path d="M5 20V19C5 15.6863 7.68629 13 11 13H13C16.3137 13 19 15.6863 19 19V20" />
              </svg>
            </div>
          </div>
        </div>

        {/* ===== HERO: PUSAT BANTUAN 200px ===== */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "100%",
            textAlign: "center",
            padding: "0 20px",
          }}
        >
          <motion.h1
            className="hero-text"
            style={{
              fontSize: "200px",
              fontWeight: 700,
              color: "#0D3CFC",
              fontFamily: FONT_FAMILY,
              letterSpacing: "-0.05em",
              lineHeight: 1,
              margin: 0,
              padding: 0,
              textShadow: "0 4px 40px rgba(13,60,252,0.08)",
            }}
          >
            Pusat Bantuan
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "power2.out", delay: 0.6 }}
            style={{
              fontSize: "20px",
              fontWeight: 400,
              color: "#666666",
              fontFamily: FONT_FAMILY,
              marginTop: "16px",
              maxWidth: "500px",
              marginLeft: "auto",
              marginRight: "auto",
              lineHeight: 1.6,
            }}
          >
            Temukan jawaban dan dukungan untuk semua pertanyaan Anda
          </motion.p>

          {/* Grid Fitur Bantuan */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "20px",
              marginTop: "48px",
              maxWidth: "700px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            {[
              { icon: "📖", title: "Panduan", desc: "Pelajari semua fitur" },
              { icon: "❓", title: "FAQ", desc: "Pertanyaan umum" },
              { icon: "💬", title: "Live Chat", desc: "Bicara langsung" },
              { icon: "📧", title: "Email", desc: "support@menuru.com" },
            ].map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  backgroundColor: "#f8f8f8",
                  borderRadius: "16px",
                  padding: "20px 16px",
                  textAlign: "center",
                  border: "1px solid #f0f0f0",
                  transition: "all 0.2s ease",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#0D3CFC";
                  e.currentTarget.style.boxShadow = "0 4px 20px rgba(13,60,252,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#f0f0f0";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ fontSize: "32px", marginBottom: "6px" }}>{item.icon}</div>
                <div style={{ fontSize: "15px", fontWeight: 600, color: "#000000", fontFamily: FONT_FAMILY }}>
                  {item.title}
                </div>
                <div style={{ fontSize: "12px", color: "#666666", fontFamily: FONT_FAMILY, marginTop: "2px" }}>
                  {item.desc}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Footer - sama dengan halaman utama */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          style={{
            position: "absolute",
            bottom: "30px",
            left: 0,
            right: 0,
            textAlign: "center",
            padding: "0 20px",
          }}
        >
          <span
            style={{
              fontSize: "13px",
              color: "#999",
              fontFamily: FONT_FAMILY,
            }}
          >
            © 2026 Menuru. All rights reserved.
          </span>
        </motion.div>
      </div>
    </>
  );
}