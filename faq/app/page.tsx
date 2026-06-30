'use client';

import React from "react";

export default function HomePage(): React.JSX.Element {
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
    </div>
  );
}
