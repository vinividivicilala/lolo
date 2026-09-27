'use client';

import { useEffect, useState } from 'react';

export default function ServiceWorkerRegister() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) {
      console.warn('[PWA] Service Worker tidak didukung browser ini');
      return;
    }

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });
        console.log('[PWA] Service Worker registered:', registration);

        // Detect update
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // Update available
                console.log('[PWA] New content available, please refresh.');
                setUpdateAvailable(true);
                setWaitingWorker(installingWorker);
              } else {
                console.log('[PWA] Content cached for offline use.');
              }
            }
          };
        };
      } catch (error) {
        console.error('[PWA] Service Worker registration failed:', error);
      }
    };

    registerSW();

    // Auto-refresh when SW takes control
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      setUpdateAvailable(false);
    }
  };

  if (!updateAvailable) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 99999,
        backgroundColor: '#0D3CFC',
        color: '#FFFFFF',
        padding: '14px 24px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        boxShadow: '0 12px 40px rgba(13,60,252,0.4)',
        fontFamily: "'Poppins', sans-serif",
        fontSize: '14px',
        fontWeight: 600,
      }}
    >
      <span>🚀 Versi baru tersedia!</span>
      <button
        onClick={handleUpdate}
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
        }}
      >
        Refresh
      </button>
    </div>
  );
}
