'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
  
  // Donation History State
  const [donationHistory, setDonationHistory] = useState([
    { id: 1, amount: 50000, date: new Date(), campaign: 'Bantu Anak Yatim', status: 'success' },
    { id: 2, amount: 100000, date: new Date(Date.now() - 86400000), campaign: 'Kebersihan Lingkungan', status: 'success' },
    { id: 3, amount: 75000, date: new Date(Date.now() - 172800000), campaign: 'Donasi Bencana Alam', status: 'success' },
    { id: 4, amount: 200000, date: new Date(Date.now() - 259200000), campaign: 'Pendidikan Anak', status: 'success' },
    { id: 5, amount: 50000, date: new Date(Date.now() - 345600000), campaign: 'Bantuan Sembako', status: 'success' },
  ]);
  
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffHours < 1) return 'Baru saja';
    if (diffHours < 24) return `${diffHours} jam lalu`;
    if (diffHours < 48) return 'Kemarin';
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
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
    
    // Add to donation history automatically
    const newDonation = {
      id: Date.now(),
      amount: addAmount,
      date: new Date(),
      campaign: 'Donasi Mandiri',
      status: 'success' as const,
    };
    setDonationHistory(prev => [newDonation, ...prev]);
    
    const element = document.querySelector('.donation-total');
    if (element) {
      element.classList.add('animate-pulse');
      setTimeout(() => {
        element.classList.remove('animate-pulse');
      }, 500);
    }
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

  const handleCarouselScroll = () => {
    if (carouselRef.current) {
      const scrollPosition = carouselRef.current.scrollLeft;
      const cardWidth = carouselRef.current.clientWidth;
      const newIndex = Math.round(scrollPosition / cardWidth);
      setActiveCardIndex(newIndex);
    }
  };

  const scrollToCard = (index: number) => {
    if (carouselRef.current) {
      const cardWidth = carouselRef.current.clientWidth;
      carouselRef.current.scrollTo({
        left: cardWidth * index,
        behavior: 'smooth',
      });
      setActiveCardIndex(index);
    }
  };

  // Handle touch events for carousel
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && activeCardIndex < 1) {
        scrollToCard(activeCardIndex + 1);
      } else if (diff < 0 && activeCardIndex > 0) {
        scrollToCard(activeCardIndex - 1);
      }
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        {/* Header - Navbar */}
        <div style={styles.header}>
          <div style={styles.userInfo}>
            <div style={styles.userAvatar}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <span style={styles.userName}>{userName.split(' ')[0]}</span>
          </div>
          
          <div style={styles.navRight}>
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

        {/* Scrollable Main Content */}
        <div 
          ref={mainContentRef}
          style={styles.mainContent}
        >
          {/* Carousel Section */}
          <div style={styles.carouselSection}>
            <div 
              ref={carouselRef}
              style={styles.carouselContainer}
              onScroll={handleCarouselScroll}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Card 1 - Donation Card */}
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>Jumlah Donasi</h3>
                  <button 
                    onClick={handleReload} 
                    style={styles.reloadButton}
                    disabled={isLoading}
                  >
                    <svg 
                      width="18" 
                      height="18" 
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
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              </div>

              {/* Card 2 - Donation History Card */}
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>Riwayat Donasi</h3>
                  <div style={styles.historyIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 8v4l3 3M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                    </svg>
                  </div>
                </div>
                
                <div style={styles.historyList}>
                  {donationHistory.length === 0 ? (
                    <div style={styles.emptyHistory}>Belum ada riwayat donasi</div>
                  ) : (
                    donationHistory.map(donation => (
                      <div key={donation.id} style={styles.historyItem}>
                        <div style={styles.historyLeft}>
                          <div style={styles.historyAmount}>{formatRupiah(donation.amount)}</div>
                          <div style={styles.historyCampaign}>{donation.campaign}</div>
                        </div>
                        <div style={styles.historyRight}>
                          <div style={styles.historyDate}>{formatDate(donation.date)}</div>
                          <div style={styles.historyStatus}>{donation.status === 'success' ? '✓ Berhasil' : 'Pending'}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            
            {/* Dot Pagination */}
            <div style={styles.pagination}>
              {[0, 1].map((index) => (
                <button
                  key={index}
                  onClick={() => scrollToCard(index)}
                  style={{
                    ...styles.paginationDot,
                    backgroundColor: activeCardIndex === index ? '#4cd964' : '#3a3a3c',
                    width: activeCardIndex === index ? '24px' : '8px',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Additional Content Space */}
          <div style={styles.extraSpace} />
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
                  backgroundColor: msg.sender === 'user' ? '#4cd964' : '#2c2c2e',
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
            transform: scale(1.02);
          }
          100% {
            transform: scale(1);
          }
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
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
    marginBottom: '20px',
    flexShrink: 0,
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  userAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#4cd964',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: '18px',
  },
  userName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#fff',
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
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
    backgroundColor: '#4cd964',
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
  mainContent: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    marginRight: '-24px',
    paddingRight: '24px',
    scrollbarWidth: 'thin',
    scrollbarColor: '#4cd964 #2c2c2e',
  },
  carouselSection: {
    marginBottom: '20px',
  },
  carouselContainer: {
    display: 'flex',
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
    scrollBehavior: 'smooth',
    gap: '16px',
    paddingBottom: '12px',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    WebkitOverflowScrolling: 'touch',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },
  card: {
    flex: '0 0 100%',
    scrollSnapAlign: 'start',
    backgroundColor: '#1c1c1e',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  cardTitle: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#8e8e93',
    margin: 0,
  },
  reloadButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#8e8e93',
    padding: '6px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  historyIcon: {
    color: '#8e8e93',
  },
  donationTotal: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '20px',
    textAlign: 'left',
    transition: 'all 0.3s ease',
  },
  skeletonLoader: {
    height: '38px',
    backgroundColor: '#2c2c2e',
    borderRadius: '6px',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: '20px',
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
    width: '48px',
    height: '48px',
    backgroundColor: '#4cd964',
    border: 'none',
    borderRadius: '50%',
    color: '#000',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginTop: '8px',
  },
  historyList: {
    maxHeight: '280px',
    overflowY: 'auto',
    marginTop: '8px',
  },
  historyItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #2c2c2e',
  },
  historyLeft: {
    flex: 1,
  },
  historyAmount: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '4px',
  },
  historyCampaign: {
    fontSize: '12px',
    color: '#8e8e93',
  },
  historyRight: {
    textAlign: 'right',
  },
  historyDate: {
    fontSize: '11px',
    color: '#8e8e93',
    marginBottom: '2px',
  },
  historyStatus: {
    fontSize: '11px',
    color: '#4cd964',
    fontWeight: '500',
  },
  emptyHistory: {
    textAlign: 'center',
    color: '#8e8e93',
    fontSize: '13px',
    padding: '40px 0',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    marginTop: '12px',
    paddingBottom: '4px',
  },
  paginationDot: {
    height: '8px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    padding: 0,
  },
  extraSpace: {
    height: '20px',
  },
  homeIndicator: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
    paddingTop: '8px',
    flexShrink: 0,
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
    background: '#4cd964',
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
