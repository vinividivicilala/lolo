'use client';

import { useRouter } from "next/navigation";

export default function TermsOfServicePage() {
  const router = useRouter();

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        overflowX: "auto",
        overflowY: "hidden",
        whiteSpace: "nowrap",
        backgroundColor: "#ffffff",
        fontFamily: "Helvetica, Arial, sans-serif",
      }}
    >
      <div
        style={{
          display: "inline-block",
          height: "100vh",
          padding: "2rem",
        }}
      >
        <div style={{ fontWeight: "700", fontSize: "700px", lineHeight: "1" }}>
          TERMS OF SERVICES
        </div>
      </div>
    </div>
  );
}
