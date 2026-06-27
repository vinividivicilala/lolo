'use client';

import React from "react";
import Image from "next/image";

export default function HomePage(): React.JSX.Element {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#ffffff',
      margin: 0,
      padding: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        position: 'relative',
        width: '800px',
        height: '600px',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
      }}>
        <Image
          src="/images/lkhh.jpg"
          alt="Center Image"
          fill
          style={{ objectFit: 'cover' }}
        />
      </div>
    </div>
  );
}
