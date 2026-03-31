'use client';

import { useState, useEffect } from 'react';
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

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('hasSeenOnboarding');
    localStorage.removeItem('userName');
    router.push('/onboarding');
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
        {/* Header - iOS Style dengan Navbar */}
        <div style={styles.header}>
          <div style={styles.logo}>Menuru</div>
          <div style={styles.navRight}>
            {/* User Name */}
            <div style={styles.userInfo}>
              <div style={styles.userAvatar}>
                {userName.charAt(0).toUpperCase()}
              </div>
              <span style={styles.userName}>{userName.split(' ')[0]}</span>
            </div>
            
            {/* Notifications */}
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
            
            {/* Live Chat */}
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

        {/* Main Content - Sama seperti onboarding (terpusat) */}
        <div style={styles.content}>
          {/* Image - Portrait */}
          <div style={styles.imageWrapper}>
            <img
              src="/images/5.jpg"
              alt="Welcome"
              style={styles.image}
            />
          </div>

          {/* Title */}
          <h2 style={styles.title}>
            Selamat Datang!
          </h2>

          {/* Description */}
          <p style={styles.description}>
            {userName}
          </p>
          <p style={styles.subDescription}>
            Platform donasi online untuk berbagi kebaikan
          </p>

          {/* Optional: Welcome Message */}
          <div style={styles.welcomeCard}>
            <div style={styles.welcomeIcon}>✨</div>
            <p style={styles.welcomeText}>Siap berbagi kebaikan hari ini?</p>
          </div>
        </div>

        {/* Bottom Buttons - Sama seperti onboarding */}
        <div style={styles.bottom}>
          <button onClick={handleLogout} style={styles.primaryButton}>
            Keluar
          </button>
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
  },
  imageWrapper: {
    marginBottom: '40px',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
  image: {
    width: '280px',
    height: '360px',
    borderRadius: '28px',
    objectFit: 'cover',
    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
    pointerEvents: 'none',
  },
  title: {
    fontSize: '26px',
    fontWeight: '600',
    marginBottom: '12px',
    color: '#fff',
    letterSpacing: '-0.3px',
  },
  description: {
    fontSize: '18px',
    color: '#8be9fd',
    marginBottom: '8px',
    fontWeight: '500',
  },
  subDescription: {
    fontSize: '15px',
    color: '#8e8e93',
    lineHeight: '1.4',
    maxWidth: '280px',
    margin: '0 auto',
  },
  welcomeCard: {
    marginTop: '32px',
    padding: '20px',
    backgroundColor: '#1c1c1e',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '280px',
  },
  welcomeIcon: {
    fontSize: '32px',
    marginBottom: '8px',
  },
  welcomeText: {
    fontSize: '14px',
    color: '#8e8e93',
  },
  bottom: {
    paddingBottom: '12px',
    position: 'relative',
    zIndex: 10,
  },
  primaryButton: {
    width: '100%',
    padding: '16px',
    borderRadius: '30px',
    border: 'none',
    backgroundColor: '#fff',
    color: '#000',
    fontSize: '17px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'inherit',
    marginBottom: '16px',
    transition: 'opacity 0.2s',
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
