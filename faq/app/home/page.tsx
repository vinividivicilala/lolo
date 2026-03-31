'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function HomePage() {
  const router = useRouter();
  const [userName, setUserName] = useState('Budi Santoso');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Donasi baru sebesar Rp 100.000', read: false },
    { id: 2, text: 'Kegiatan "Bantu Anak Yatim" telah selesai', read: false },
    { id: 3, text: 'Selamat! Anda mendapatkan badge baru', read: false },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, text: 'Halo! Ada yang bisa dibantu?', sender: 'bot', time: '10:00' },
  ]);
  const [newMessage, setNewMessage] = useState('');
  
  // Donation State
  const [donationTotal, setDonationTotal] = useState(1250000);
  const [isLoading, setIsLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Dummy data for donation cards (pagination)
  const donationCards = [
    { id: 1, amount: 500000, title: 'Donasi Terbaru', date: 'Hari ini' },
    { id: 2, amount: 300000, title: 'Donasi Minggu Ini', date: '3 hari lalu' },
    { id: 3, amount: 450000, title: 'Donasi Bulan Ini', date: '2 minggu lalu' },
  ];

  // Progress animation for pagination dots
  useEffect(() => {
    setProgress(0);
    
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    const stepTime = 30;
    const totalSteps = 3000 / stepTime;
    let currentStep = 0;
    
    progressIntervalRef.current = setInterval(() => {
      currentStep++;
      const newProgress = (currentStep / totalSteps) * 100;
      
      if (newProgress >= 100) {
        setProgress(100);
        clearInterval(progressIntervalRef.current!);
        
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % donationCards.length);
        }, 50);
      } else {
        setProgress(newProgress);
      }
    }, stepTime);
    
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [currentIndex]);

  const goToSlide = (index: number) => {
    if (index === currentIndex) return;
    setCurrentIndex(index);
  };

  const handleReload = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };

  const handleAddDonation = () => {
    const addAmount = 50000;
    setDonationTotal(prev => prev + addAmount);
    
    // Animation effect
    const element = document.querySelector('.donation-total');
    if (element) {
      element.classList.add('animate-pulse');
      setTimeout(() => {
        element.classList.remove('animate-pulse');
      }, 500);
    }
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const markAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(notif => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      setChatMessages(prev => [
        ...prev,
        { id: Date.now(), text: newMessage, sender: 'user', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
      setNewMessage('');
      
      setTimeout(() => {
        setChatMessages(prev => [
          ...prev,
          { id: Date.now(), text: 'Terima kasih! Tim kami akan segera merespon.', sender: 'bot', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]);
      }, 1000);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        {/* Header - Navbar */}
        <div style={styles.header}>
          <div style={styles.logo}>Menuru</div>
          <div style={styles.navRight}>
            <div style={styles.userInfo}>
              <div style={styles.userAvatar}>
                {userName.charAt(0).toUpperCase()}
              </div>
              <span style={styles.userName}>{userName.split(' ')[0]}</span>
            </div>
            
            <div style={styles.notificationWrapper}>
              <button 
                style={styles.iconButton}
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadCount > 0 && (
                  <span style={styles.badge}>{unreadCount}</span>
                )}
              </button>
              
              {showNotifications && (
                <div style={styles.notificationDropdown}>
                  <div style={styles.dropdownHeader}>
                    <span>Notifikasi</span>
                    <button onClick={() => setShowNotifications(false)} style={styles.closeDropdown}>×</button>
                  </div>
                  {notifications.length === 0 ? (
                    <div style={styles.emptyState}>Tidak ada notifikasi</div>
                  ) : (
                    notifications.map(notif => (
                      <div 
                        key={notif.id} 
                        style={{...styles.notificationItem, opacity: notif.read ? 0.6 : 1}}
                        onClick={() => markAsRead(notif.id)}
                      >
                        <div style={styles.notificationDot} />
                        <span style={styles.notificationText}>{notif.text}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            
            <button 
              style={styles.iconButton}
              onClick={() => setIsChatOpen(!isChatOpen)}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Main Content - Card Donation */}
        <div style={styles.content}>
          {/* Card with border radius */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Jumlah Donasi</h3>
              <button 
                onClick={handleReload} 
                style={styles.reloadButton}
                disabled={isLoading}
              >
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  style={{
                    animation: isLoading ? 'spin 0.8s linear infinite' : 'none',
                  }}
                >
                  <path d="M23 4v6h-6M1 20v-6h6" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
              </button>
            </div>
            
            <div className="donation-total" style={styles.donationTotal}>
              {isLoading ? (
                <div style={styles.skeletonLoader}>
                  <div style={styles.skeletonShimmer} />
                </div>
              ) : (
                formatRupiah(donationTotal)
              )}
            </div>
            
            <button onClick={handleAddDonation} style={styles.addButton}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Tambah Donasi</span>
            </button>
          </div>

          {/* Pagination Dots like Onboarding */}
          <div style={styles.dotsContainer}>
            {donationCards.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                style={styles.dotWrapper}
              >
                {idx === currentIndex ? (
                  <div style={styles.activeDotContainer}>
                    <div style={styles.activeDotBg}>
                      <motion.div
                        style={{
                          ...styles.activeDotFill,
                          width: `${progress}%`,
                          backgroundColor: '#8be9fd',
                        }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.03 }}
                      />
                    </div>
                  </div>
                ) : (
                  <div style={styles.inactiveDot} />
                )}
              </button>
            ))}
          </div>

          {/* Donation Info Card (based on current index) */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              style={styles.infoCard}
            >
              <div style={styles.infoCardTitle}>{donationCards[currentIndex].title}</div>
              <div style={styles.infoCardAmount}>{formatRupiah(donationCards[currentIndex].amount)}</div>
              <div style={styles.infoCardDate}>{donationCards[currentIndex].date}</div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Home Indicator for iOS */}
        <div style={styles.homeIndicator}>
          <div style={styles.homeIndicatorBar} />
        </div>
      </div>

      {/* Live Chat Modal */}
      {isChatOpen && (
        <div style={styles.chatModal}>
          <div style={styles.chatHeader}>
            <div style={styles.chatHeaderLeft}>
              <div style={styles.chatStatusDot} />
              <span style={styles.chatTitle}>Live Chat Support</span>
            </div>
            <button onClick={() => setIsChatOpen(false)} style={styles.closeChat}>×</button>
          </div>
          
          <div style={styles.chatMessages}>
            {chatMessages.map(msg => (
              <div 
                key={msg.id} 
                style={{
                  ...styles.message,
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  ...styles.messageBubble,
                  backgroundColor: msg.sender === 'user' ? '#8be9fd' : '#2c2c2e',
                  color: msg.sender === 'user' ? '#000' : '#fff'
                }}>
                  {msg.text}
                </div>
                <span style={styles.messageTime}>{msg.time}</span>
              </div>
            ))}
          </div>
          
          <div style={styles.chatInputContainer}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ketik pesan..."
              style={styles.chatInput}
            />
            <button onClick={sendMessage} style={styles.sendButton}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }
        
        .animate-pulse {
          animation: pulse 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  wrapper: {
    height: '100vh',
    width: '100vw',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
    overflow: 'hidden',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    width: '100%',
    maxWidth: '400px',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '20px 24px 0 24px',
    backgroundColor: '#000',
    color: '#fff',
    position: 'relative',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 'env(safe-area-inset-top)',
    position: 'relative',
    zIndex: 10,
  },
  logo: {
    fontSize: '22px',
    fontWeight: '600',
    color: '#fff',
    letterSpacing: '-0.3px',
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px 6px 8px',
    borderRadius: '30px',
    backgroundColor: '#1c1c1e',
  },
  userAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#8be9fd',
    color: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: '12px',
  },
  userName: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#fff',
  },
  iconButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#fff',
    padding: '8px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    transition: 'background 0.2s',
  },
  badge: {
    position: 'absolute',
    top: '2px',
    right: '2px',
    backgroundColor: '#ff3b30',
    color: '#fff',
    fontSize: '10px',
    fontWeight: '600',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationWrapper: {
    position: 'relative',
  },
  notificationDropdown: {
    position: 'absolute',
    top: '45px',
    right: '0',
    width: '280px',
    backgroundColor: '#1c1c1e',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    zIndex: 200,
    overflow: 'hidden',
  },
  dropdownHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid #2c2c2e',
    fontWeight: '600',
    fontSize: '14px',
  },
  closeDropdown: {
    background: 'none',
    border: 'none',
    color: '#8e8e93',
    fontSize: '20px',
    cursor: 'pointer',
  },
  notificationItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderBottom: '1px solid #2c2c2e',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  notificationDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#8be9fd',
  },
  notificationText: {
    fontSize: '13px',
    color: '#fff',
  },
  emptyState: {
    padding: '20px',
    textAlign: 'center',
    color: '#8e8e93',
    fontSize: '13px',
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    gap: '24px',
  },
  card: {
    backgroundColor: '#1c1c1e',
    borderRadius: '24px',
    padding: '24px',
    width: '100%',
    maxWidth: '320px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#8e8e93',
    margin: 0,
  },
  reloadButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#8e8e93',
    padding: '8px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  donationTotal: {
    fontSize: '36px',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '24px',
    textAlign: 'center',
    transition: 'all 0.3s ease',
  },
  skeletonLoader: {
    height: '44px',
    backgroundColor: '#2c2c2e',
    borderRadius: '8px',
    position: 'relative',
    overflow: 'hidden',
  },
  skeletonShimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
    animation: 'shimmer 1s infinite',
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '12px',
    backgroundColor: '#8be9fd',
    border: 'none',
    borderRadius: '30px',
    color: '#000',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  dotsContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '12px',
    marginTop: '8px',
  },
  dotWrapper: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
  },
  inactiveDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#3a3a3c',
    transition: 'all 0.3s ease',
  },
  activeDotContainer: {
    width: '48px',
    height: '8px',
  },
  activeDotBg: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2c2c2e',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  activeDotFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.03s linear',
  },
  infoCard: {
    backgroundColor: '#111',
    borderRadius: '20px',
    padding: '20px',
    width: '100%',
    maxWidth: '320px',
    border: '1px solid #2c2c2e',
  },
  infoCardTitle: {
    fontSize: '14px',
    color: '#8e8e93',
    marginBottom: '8px',
  },
  infoCardAmount: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#8be9fd',
    marginBottom: '4px',
  },
  infoCardDate: {
    fontSize: '12px',
    color: '#5e5e62',
  },
  homeIndicator: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
    paddingTop: '8px',
  },
  homeIndicatorBar: {
    width: '140px',
    height: '5px',
    backgroundColor: '#3a3a3c',
    borderRadius: '3px',
  },
  chatModal: {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '320px',
    height: '460px',
    backgroundColor: '#1c1c1e',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    zIndex: 300,
    overflow: 'hidden',
  },
  chatHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 16px',
    borderBottom: '1px solid #2c2c2e',
    backgroundColor: '#000',
  },
  chatHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  chatStatusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#4cd964',
  },
  chatTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#fff',
  },
  closeChat: {
    background: 'none',
    border: 'none',
    color: '#8e8e93',
    fontSize: '24px',
    cursor: 'pointer',
  },
  chatMessages: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  message: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: '10px 14px',
    borderRadius: '18px',
    fontSize: '13px',
    lineHeight: '1.4',
  },
  messageTime: {
    fontSize: '10px',
    color: '#8e8e93',
    marginLeft: '12px',
  },
  chatInputContainer: {
    display: 'flex',
    padding: '12px',
    borderTop: '1px solid #2c2c2e',
    gap: '8px',
  },
  chatInput: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: '24px',
    border: '1px solid #2c2c2e',
    backgroundColor: '#000',
    color: '#fff',
    fontSize: '13px',
    outline: 'none',
    fontFamily: 'inherit',
  },
  sendButton: {
    background: '#8be9fd',
    border: 'none',
    borderRadius: '50%',
    width: '38px',
    height: '38px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#000',
  },
};
