import React from "react";

export default function AvailablePage() {
  return (
    <>
      {/* Import font Geist */}
      <link
        href="https://fonts.googleapis.com/css2?family=Geist:wght@400;600;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        body, html, #root {
          margin: 0;
          padding: 0;
          height: 100%;
          background-color: #000;
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000", // hitam full
          color: "#f1f5f9",
          fontFamily: "'Geist', sans-serif",
          textAlign: "center",
          padding: "40px",
        }}
      >
        <h1
          style={{
            fontSize: "3.5rem",
            fontWeight: "700",
            marginBottom: "1.5rem",
            letterSpacing: "-1px",
          }}
        >
          AVAILABLE FOR WORK
        </h1>

        <p
          style={{
            fontSize: "1.3rem",
            maxWidth: "700px",
            lineHeight: "1.8",
          }}
        >
          Saya terbuka untuk{" "}
          <span
            style={{
              backgroundColor: "#3b82f6",
              padding: "2px 6px",
              borderRadius: "4px",
              fontWeight: "600",
              color: "#fff",
            }}
          >
            peluang kerja
          </span>{" "}
          baru 🚀 <br />
          Jika tertarik untuk berkolaborasi, silakan hubungi saya melalui{" "}
          <span
            style={{
              backgroundColor: "#ef4444",
              padding: "2px 6px",
              borderRadius: "4px",
              fontWeight: "600",
              color: "#fff",
            }}
          >
            kontak
          </span>{" "}
          yang tersedia. Saya juga menyukai{" "}
          <span
            style={{
              backgroundColor: "#22c55e",
              padding: "2px 6px",
              borderRadius: "4px",
              fontWeight: "600",
              color: "#fff",
            }}
          >
            project kreatif
          </span>{" "}
          yang menantang.
        </p>

        <a
          href="/"
          style={{
            marginTop: "2rem",
            padding: "12px 20px",
            border: "2px solid #3b82f6",
            borderRadius: "6px",
            color: "#3b82f6",
            textDecoration: "none",
            fontWeight: "bold",
            transition: "all 0.3s ease",
          }}
        >
          ⬅ Back to Home
        </a>
      </div>
    </>
  );
}
