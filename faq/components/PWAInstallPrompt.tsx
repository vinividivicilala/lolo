'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Cek apakah sudah pernah dismiss
    const dismissed = localStorage.getItem('pwa_install_dismissed');
    if (dismissed === 'true') return;

    // Cek iOS
    const iOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as any).MSStream;
    setIsIOS(iOS);

    // iOS: show custom prompt karena tidak support beforeinstallprompt
    if (iOS) {
      const isStandalone = (window.navigator as any).standalone === true;
      if (!isStandalone) {
        setTimeout(() => setShowPrompt(true), 3000);
      }
      return;
    }

    // Android/Desktop: tangkap beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Detect sudah terinstall
    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App installed');
      setShowPrompt(false);
      setDeferredPrompt(null);
      localStorage.setItem('pwa_install_dismissed', 'true');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('[PWA] User choice:', outcome);
      if (outcome === 'accepted') {
        setShowPrompt(false);
        localStorage.setItem('pwa_install_dismissed', 'true');
      }
      setDeferredPrompt(null);
    } catch (error) {
      console.error('[PWA] Install error:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_install_dismissed', 'true');
  };

  if (!showPrompt) return null;

  // ===== iOS Guide Modal =====
  if (showIOSGuide) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          fontFamily: "'Poppins', sans-serif",
        }}
        onClick={() => setShowIOSGuide(false)}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '28px 24px',
            maxWidth: '380px',
            width: '100%',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📱</div>
          <h3
            style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#0D3CFC',
              marginBottom: '8px',
            }}
          >
            Install Menuru di iPhone
          </h3>
          <p
            style={{
              fontSize: '14px',
              color: '#666',
              lineHeight: 1.6,
              marginBottom: '20px',
            }}
          >
            Untuk install di iPhone/iPad:
            <br />
            1. Tap ikon <strong>Share</strong> ⬆️ di Safari
            <br />
            2. Pilih <strong>"Add to Home Screen"</strong>
            <br />
            3. Tap <strong>"Add"</strong>
          </p>
          <button
            onClick={() => setShowIOSGuide(false)}
            style={{
              padding: '10px 24px',
              backgroundColor: '#0D3CFC',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            Mengerti
          </button>
        </div>
      </div>
    );
  }

  // ===== Install Prompt Banner =====
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        right: '24px',
        maxWidth: '420px',
        margin: '0 auto',
        zIndex: 99998,
        backgroundColor: '#0D3CFC',
        color: '#FFFFFF',
        borderRadius: '16px',
        padding: '18px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        boxShadow: '0 12px 40px rgba(13,60,252,0.4)',
        fontFamily: "'Poppins', sans-serif",
        animation: 'slideUp 0.4s ease-out',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        <img
          src="/icons/icon-192x192.png"
          alt="Menuru"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '2px' }}>
          Install Menuru
        </div>
        <div style={{ fontSize: '12px', opacity: 0.9 }}>
          Akses cepat dari home screen Anda
        </div>
      </div>
      <button
        onClick={handleInstall}
        style={{
          padding: '8px 16px',
          backgroundColor: '#FFFFFF',
          color: '#0D3CFC',
          border: 'none',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: 800,
          cursor: 'pointer',
          fontFamily: "'Poppins', sans-serif",
          flexShrink: 0,
        }}
      >
        Install
      </button>
      <button
        onClick={handleDismiss}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#FFFFFF',
          fontSize: '20px',
          cursor: 'pointer',
          padding: 0,
          lineHeight: 1,
          opacity: 0.7,
          flexShrink: 0,
        }}
      >
        ×
      </button>

      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
