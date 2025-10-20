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
      {/* Line Box Container dengan Border Radius */}
      <div
        style={{
          width: '1300px',
          height: '800px',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.3)', // Border putih transparan
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)', // Shadow lebih soft
          backdropFilter: 'blur(10px)', // Efek blur untuk transparansi
        }}
      />
    </div>
  );
}

