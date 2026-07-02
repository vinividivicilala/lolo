'use client';

import React, { useState } from "react";

export default function HomePage(): React.JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        margin: 0,
        padding: 0,
        position: "relative",
        fontFamily: "Inter, 'Inter Fallback'"
      }}
    >
      {/* Logo */}
      <div
        style={{
          position: "absolute",
          top: "40px",
          left: "40px",
          zIndex: 10,
          fontSize: "56px",
          fontWeight: 400,
          color: "#000",
          letterSpacing: "-0.02em",
          lineHeight: 1,
        }}
      >
        Menuru
      </div>

      {/* Tombol Chat with Menuru */}
      <div
        style={{
          position: "absolute",
          top: "40px",
          right: "40px",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: "12px",
          backgroundColor: "#c5e800",
          padding: "12px 20px",
          borderRadius: "999px",
          cursor: "pointer",
          transition: "all .25s ease",
          boxShadow: "0 4px 12px rgba(197,232,0,.3)",
          userSelect: "none",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.05)";
          e.currentTarget.style.boxShadow =
            "0 8px 24px rgba(197,232,0,.5)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow =
            "0 4px 12px rgba(197,232,0,.3)";
        }}
        onClick={() => setIsModalOpen(true)}
      >
        {/* Icon SVG Chat Modern - Style Awwwards */}
        <svg
          width="30"
          height="30"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ flexShrink: 0 }}
        >
          <path
            d="M21 11.5C21 16.1944 17.1944 20 12.5 20C11.1912 20 9.9431 19.7087 8.82046 19.1826L4 20.5L6.11053 16.3718C5.41056 15.1532 5 13.7705 5 12.5C5 7.80558 8.80558 4 13.5 4C18.1944 4 21 7.80558 21 11.5Z"
            stroke="#000000"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="9" cy="11" r="0.5" fill="#000000" stroke="#000000" strokeWidth="1.5" />
          <circle cx="13" cy="11" r="0.5" fill="#000000" stroke="#000000" strokeWidth="1.5" />
          <circle cx="17" cy="11" r="0.5" fill="#000000" stroke="#000000" strokeWidth="1.5" />
        </svg>

        <span
          style={{
            fontSize: "30px",
            fontWeight: 500,
            color: "#000",
            letterSpacing: "-0.02em",
            lineHeight: 1,
            whiteSpace: "nowrap",
          }}
        >
          Chat with Menuru
        </span>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <>
          {/* Overlay */}
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(8px)",
              zIndex: 999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "fadeIn 0.3s ease",
            }}
            onClick={() => setIsModalOpen(false)}
          >
            {/* Modal Content */}
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "24px",
                padding: "48px 56px",
                maxWidth: "480px",
                width: "90%",
                textAlign: "center",
                boxShadow: "0 40px 80px rgba(0, 0, 0, 0.2)",
                animation: "scaleIn 0.3s ease",
                position: "relative",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Icon */}
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "50%",
                  backgroundColor: "#c5e800",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 24px",
                  fontSize: "36px",
                }}
              >
                🚀
              </div>

              {/* Title */}
              <h2
                style={{
                  fontSize: "28px",
                  fontWeight: 600,
                  color: "#000",
                  margin: "0 0 12px",
                  fontFamily: "Inter, 'Inter Fallback'",
                  letterSpacing: "-0.02em",
                }}
              >
                Fitur Sedang Dikembangkan
              </h2>

              {/* Description */}
              <p
                style={{
                  fontSize: "18px",
                  fontWeight: 400,
                  color: "#666",
                  margin: "0 0 32px",
                  fontFamily: "Inter, 'Inter Fallback'",
                  lineHeight: 1.6,
                }}
              >
                Silahkan coba lagi nanti. Tim kami sedang bekerja keras untuk
                menghadirkan pengalaman terbaik untuk Anda.
              </p>

              {/* Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  backgroundColor: "#000",
                  color: "#fff",
                  border: "none",
                  padding: "14px 40px",
                  borderRadius: "60px",
                  fontSize: "16px",
                  fontWeight: 500,
                  fontFamily: "Inter, 'Inter Fallback'",
                  cursor: "pointer",
                  transition: "all .25s ease",
                  letterSpacing: "-0.01em",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.backgroundColor = "#1a1a1a";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.backgroundColor = "#000";
                }}
              >
                Mengerti
              </button>
            </div>
          </div>

          {/* Animasi CSS */}
          <style jsx>{`
            @keyframes fadeIn {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }
            @keyframes scaleIn {
              from {
                transform: scale(0.9);
                opacity: 0;
              }
              to {
                transform: scale(1);
                opacity: 1;
              }
            }
          `}</style>
        </>
      )}
    </div>
  );
}
