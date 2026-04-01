'use client';

import { useEffect, useState } from 'react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    
    setDeferredPrompt(null);
  };

  if (showPrompt && !isInstalled) {
    return (
      <div style={styles.installBanner}>
        <div style={styles.installContent}>
          <div style={styles.installIcon}>📱</div>
          <div style={styles.installText}>
            <div style={styles.installTitle}>Install Aplikasi</div>
            <div style={styles.installDesc}>Install Menuru untuk akses lebih cepat</div>
          </div>
          <button onClick={handleInstall} style={styles.installButton}>
            Install
          </button>
          <button onClick={() => setShowPrompt(false)} style={styles.closeButton}>
            ✕
          </button>
        </div>
      </div>
    );
  }

  return null;
}

const styles = {
  installBanner: {
    position: 'fixed' as const,
    bottom: '20px',
    left: '20px',
    right: '20px',
    backgroundColor: '#1c1c1e',
    borderRadius: '16px',
    padding: '16px',
    zIndex: 1000,
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    animation: 'slideUp 0.3s ease',
  },
  installContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  installIcon: {
    fontSize: '32px',
  },
  installText: {
    flex: 1,
  },
  installTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '2px',
  },
  installDesc: {
    fontSize: '12px',
    color: '#8e8e93',
  },
  installButton: {
    backgroundColor: '#8be9fd',
    border: 'none',
    borderRadius: '20px',
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#000',
    cursor: 'pointer',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: '#8e8e93',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '4px',
  },
};
