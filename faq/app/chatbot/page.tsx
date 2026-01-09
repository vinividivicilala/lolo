'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
// Firebase imports - TIDAK diinisialisasi di tingkat modul
import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';

// Konfigurasi Firebase (hanya objek, tidak diinisialisasi)
const firebaseConfig = {
  apiKey: "AIzaSyD_htQZ1TClnXKZGRJ4izbMQ02y6V3aNAQ",
  authDomain: "wawa44-58d1e.firebaseapp.com",
  databaseURL: "https://wawa44-58d1e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "wawa44-58d1e",
  storageBucket: "wawa44-58d1e.firebasestorage.app",
  messagingSenderId: "836899520599",
  appId: "1:836899520599:web:b346e4370ecfa9bb89e312",
  measurementId: "G-8LMP7F4BE9"
};

let app = null;
let auth = null;
let db = null;

if (typeof window !== "undefined") {
  app = getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApps()[0];

  auth = getAuth(app);
  db = getFirestore(app);
}




const CHATBOT_EMAIL = 'faridardiansyah061@gmail.com';
const CHATBOT_NAME = 'Menuru (Chatbot)';
const CHATBOT_ID = 'chatbot_account_001';

export default function ChatbotPage() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isClient, setIsClient] = useState(false); // State untuk cek client/server
  const messagesEndRef = useRef(null);

  // Deteksi client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Inisialisasi Firebase HANYA di client side
  useEffect(() => {
    if (!isClient) return; // Jangan jalankan di server

    try {
      // Inisialisasi Firebase
      let app;
      if (getApps().length === 0) {
        app = initializeApp(firebaseConfig);
      } else {
        app = getApps()[0];
      }

      // Setup auth listener
      const auth = getAuth(app);
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          const userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Guest',
            isAnonymous: firebaseUser.isAnonymous
          };
          
          setUser(userData);
          loadChatHistory(firebaseUser.uid);
          
          // Kirim welcome message dari chatbot
          setTimeout(() => {
            sendChatbotMessage(
              `Halo ${userData.name}! 👋 Saya ${CHATBOT_NAME}, asisten chatbot dari Note. Ada yang bisa saya bantu?`, 
              firebaseUser.uid
            );
          }, 1500);
          
        } else {
          // Jika belum login, redirect ke sign-in
          router.push('/sign-in');
        }
        
        setIsInitializing(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Firebase initialization error:', error);
      setIsInitializing(false);
    }
  }, [isClient, router]);

  const loadChatHistory = (userId) => {
    if (!isClient) return;

    try {
      const db = getFirestore();
      const messagesRef = collection(db, 'chats');
      const q = query(
        messagesRef,
        orderBy('timestamp', 'asc')
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const userMessages = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .filter(msg => 
            msg.receiverId === userId || 
            msg.senderId === userId ||
            (msg.receiverId === 'all' && msg.senderId === CHATBOT_ID)
          );
        
        setMessages(userMessages);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isClient) {
      scrollToBottom();
    }
  }, [messages, isClient]);

  const saveMessageToFirestore = async (messageData) => {
    if (!isClient) return null;

    try {
      const db = getFirestore();
      const docRef = await addDoc(collection(db, 'chats'), {
        ...messageData,
        timestamp: serverTimestamp(),
        read: false
      });
      return docRef.id;
    } catch (error) {
      console.error('Error saving message:', error);
      return null;
    }
  };

  const sendChatbotMessage = async (text, receiverId) => {
    if (!isClient || !user) return;

    const chatbotMessage = {
      text: text,
      senderId: CHATBOT_ID,
      senderEmail: CHATBOT_EMAIL,
      senderName: CHATBOT_NAME,
      receiverId: receiverId,
      receiverEmail: user?.email || 'unknown@user.com',
      timestamp: new Date(),
      type: 'chatbot_response'
    };

    await saveMessageToFirestore(chatbotMessage);
  };

  const handleSendMessage = async () => {
    if (inputText.trim() === '' || !user || !isClient) return;

    const userMessage = {
      text: inputText,
      senderId: user.uid,
      senderEmail: user.email,
      senderName: user.name,
      receiverId: CHATBOT_ID,
      receiverEmail: CHATBOT_EMAIL,
      timestamp: new Date(),
      type: 'user_query'
    };

    await saveMessageToFirestore(userMessage);
    
    setInputText('');
    setIsLoading(true);

    setTimeout(async () => {
      const responses = [
        `Terima kasih pesannya ${user.name}! 🙏 Saya ${CHATBOT_NAME} akan membalas segera.`,
        `Pesan diterima! ✅ Sebagai akun chatbot dari Note, saya memproses pertanyaan Anda.`,
        `Hai ${user.name}! 👋 Pertanyaan Anda sudah tercatat.`,
        `Noted! 📝 Saya akan merespons segera.`,
        `Pertanyaan yang bagus ${user.name}! 💡 Saya sedang mempersiapkan jawaban.`
      ];
      
      const response = responses[Math.floor(Math.random() * responses.length)];
      await sendChatbotMessage(response, user.uid);
      
      setIsLoading(false);
    }, 2000);
  };

  // TOMBOL BARU: Navigasi ke Admin Dashboard
  const handleGoToAdmin = () => {
    router.push('/admin/chat');
  };

  const handleLogout = async () => {
    if (!isClient) return;

    try {
      const auth = getAuth();
      await signOut(auth);
      router.push('/sign-in');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    if (date.toDate) date = date.toDate();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Loading state untuk server side rendering
  if (!isClient || isInitializing) {
    return (
      <div style={styles.loadingContainer}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={styles.spinner}
        />
        <div style={styles.loadingText}>Loading Chatbot...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header dengan TOMBOL ADMIN khusus untuk faridardiansyah061@gmail.com */}
      <div style={styles.header}>
        <motion.h1
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          style={styles.title}
        >
          chatbot
        </motion.h1>

        {/* User Info dengan TOMBOL ADMIN */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          style={styles.userContainer}
        >
          <div style={styles.userInfo}>
            <div style={{
              ...styles.userAvatar,
              backgroundColor: user?.isAnonymous ? '#666' : '#2563eb'
            }}>
              {user?.name?.charAt(0).toUpperCase() || 'G'}
            </div>
            <div>
              <div style={styles.userName}>{user?.name || 'Guest'}</div>
              <div style={styles.userStatus}>
                <div style={{
                  ...styles.statusDot,
                  backgroundColor: user?.isAnonymous ? '#888' : '#4CAF50'
                }}></div>
                {user?.isAnonymous ? 'Guest Mode' : 'Signed In'}
                {user && !user.isAnonymous && (
                  <span style={styles.userEmail}> {user.email}</span>
                )}
              </div>
            </div>
          </div>

          {/* TOMBOL ADMIN - Hanya tampil untuk faridardiansyah061@gmail.com */}
          {user?.email === CHATBOT_EMAIL && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGoToAdmin}
              style={styles.adminButton}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"></path>
              </svg>
              Admin Dashboard
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            style={styles.logoutButton}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Logout
          </motion.button>
        </motion.div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Left Panel - Chatbot Profile */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={styles.profilePanel}
        >
          <div style={styles.profileHeader}>
            <div style={styles.profileAvatar}>MB</div>
            <h2 style={styles.profileName}>{CHATBOT_NAME}</h2>
            <div style={styles.profileStatus}>
              <div style={styles.statusDotOnline}></div>
              <span>Online • Ready to Chat</span>
            </div>
          </div>
          
          <div style={styles.infoBox}>
            <div style={styles.infoTitle}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <strong>Chatbot Email:</strong>
            </div>
            <div style={styles.emailBox}>{CHATBOT_EMAIL}</div>
          </div>
          
          <div style={styles.infoBox}>
            <div style={styles.infoTitle}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 16v-4"></path>
                <path d="M12 8h.01"></path>
              </svg>
              <strong>About This Chatbot:</strong>
            </div>
            <div style={styles.aboutText}>
              Two-way communication system. Responses come from chatbot account.
            </div>
          </div>
          
          <div style={styles.systemStatus}>
            <div style={styles.systemTitle}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                <line x1="6" y1="1" x2="6" y2="4"></line>
                <line x1="10" y1="1" x2="10" y2="4"></line>
                <line x1="14" y1="1" x2="14" y2="4"></line>
              </svg>
              SYSTEM STATUS
            </div>
            <div style={statusConnected}>
              <div style={styles.connectedDot}></div>
              Connected to Firebase
            </div>
            <div style={styles.statusDetails}>
              Messages: {messages.length} • User: {user?.uid?.substring(0, 8) || 'unknown'}...
            </div>
          </div>
        </motion.div>

        {/* Right Panel - Chat Messages */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={styles.chatPanel}
        >
          <div style={styles.chatHeader}>
            <div style={styles.chatTitle}>
              <span>💬</span>
              <span>Chat with {CHATBOT_NAME}</span>
            </div>
            <div style={styles.chatBadge}>
              <div style={styles.badgeDot}></div>
              Real-time Chat
            </div>
          </div>

          <div style={styles.messagesArea}>
            {messages.length === 0 ? (
              <div style={styles.emptyChat}>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  style={{ fontSize: '4rem', marginBottom: '1rem' }}
                >
                  👋
                </motion.div>
                <div style={styles.emptyTitle}>Start chatting with {CHATBOT_NAME}</div>
                <div style={styles.emptySubtitle}>Type your message below to begin</div>
              </div>
            ) : (
              messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  style={{
                    ...styles.messageContainer,
                    alignItems: message.senderId === CHATBOT_ID ? 'flex-start' : 'flex-end'
                  }}
                >
                  <div style={{
                    ...styles.messageBubble,
                    flexDirection: message.senderId === CHATBOT_ID ? 'row' : 'row-reverse'
                  }}>
                    <div style={{
                      ...styles.messageAvatar,
                      backgroundColor: message.senderId === CHATBOT_ID ? '#2a2a2a' : '#2563eb',
                      borderColor: message.senderId === CHATBOT_ID ? '#3a3a3a' : '#1d4ed8'
                    }}>
                      {message.senderId === CHATBOT_ID ? 'C' : user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div style={{
                      ...styles.messageContent,
                      backgroundColor: message.senderId === CHATBOT_ID ? '#222' : '#2563eb',
                      borderTopLeftRadius: message.senderId === CHATBOT_ID ? '5px' : '20px',
                      borderTopRightRadius: message.senderId === CHATBOT_ID ? '20px' : '5px'
                    }}>
                      <div style={styles.messageText}>{message.text}</div>
                      <div style={styles.messageMeta}>
                        <div>
                          <strong>{message.senderId === CHATBOT_ID ? CHATBOT_NAME : user?.name || 'User'}</strong>
                          {message.senderId === CHATBOT_ID && (
                            <span style={styles.chatbotEmail}> ({CHATBOT_EMAIL})</span>
                          )}
                        </div>
                        <div>{formatTime(message.timestamp)}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
            
            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.typingIndicator}>
                <div style={styles.typingAvatar}>C</div>
                <div style={styles.typingBubble}>
                  <div style={styles.typingDots}>
                    <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} />
                    <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} />
                    <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} />
                  </div>
                  <span>{CHATBOT_NAME} is typing...</span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={styles.inputArea}>
            <div style={styles.inputContainer}>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Type your message to ${CHATBOT_NAME}... (Press Enter to send)`}
                style={styles.textarea}
                rows="2"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: '#1d4ed8' }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSendMessage}
              disabled={isLoading || inputText.trim() === ''}
              style={{
                ...styles.sendButton,
                backgroundColor: inputText.trim() ? '#2563eb' : '#333',
                opacity: inputText.trim() ? 1 : 0.6,
                cursor: inputText.trim() ? 'pointer' : 'not-allowed'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
              Send
            </motion.button>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
        ::-webkit-scrollbar { width: 10px; }
        ::-webkit-scrollbar-track { background: #222; border-radius: 5px; }
        ::-webkit-scrollbar-thumb { background: #444; border-radius: 5px; }
        ::-webkit-scrollbar-thumb:hover { background: #555; }
        textarea::-webkit-scrollbar { width: 6px; }
        textarea::-webkit-scrollbar-track { background: #333; border-radius: 3px; }
        textarea::-webkit-scrollbar-thumb { background: #555; border-radius: 3px; }
      `}</style>
    </div>
  );
}

// Styles object (sama seperti sebelumnya)
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: 'black',
    color: 'white',
    padding: '2rem',
    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
    display: 'flex',
    flexDirection: 'column'
  },
  loadingContainer: {
    minHeight: '100vh',
    backgroundColor: 'black',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif"
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '3px solid #333',
    borderTopColor: '#2563eb',
    borderRadius: '50%',
    marginBottom: '1rem'
  },
  loadingText: {
    fontSize: '1rem',
    color: '#666'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '3rem'
  },
  title: {
    fontSize: '4rem',
    fontWeight: '300',
    letterSpacing: '-0.02em',
    margin: 0
  },
  userContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    backgroundColor: '#111',
    padding: '0.75rem 1.5rem',
    borderRadius: '25px',
    border: '1px solid #333'
  },
  userAvatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#fff'
  },
  userName: {
    fontSize: '1.1rem',
    fontWeight: '500'
  },
  userStatus: {
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem'
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%'
  },
  userEmail: {
    color: '#666',
    marginLeft: '0.5rem'
  },
  adminButton: {
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '25px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  logoutButton: {
    backgroundColor: '#111',
    color: 'white',
    border: '1px solid #333',
    padding: '0.75rem 1.5rem',
    borderRadius: '25px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  mainContent: {
    display: 'flex',
    gap: '2rem',
    flex: 1,
    height: 'calc(100vh - 200px)'
  },
  profilePanel: {
    flex: '0 0 350px',
    backgroundColor: '#111',
    borderRadius: '25px',
    padding: '2rem',
    border: '1px solid #333',
    display: 'flex',
    flexDirection: 'column'
  },
  profileHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '2rem'
  },
  profileAvatar: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    backgroundColor: '#2a2a2a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#fff',
    border: '3px solid #3a3a3a',
    marginBottom: '1.5rem'
  },
  profileName: {
    fontSize: '1.8rem',
    fontWeight: '400',
    color: '#fff',
    marginBottom: '0.5rem',
    textAlign: 'center'
  },
  profileStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1rem'
  },
  statusDotOnline: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: '#4CAF50',
    animation: 'pulse 2s infinite'
  },
  infoBox: {
    backgroundColor: '#222',
    padding: '1.5rem',
    borderRadius: '20px',
    marginBottom: '1.5rem'
  },
  infoTitle: {
    fontSize: '0.9rem',
    color: '#888',
    marginBottom: '0.8rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  emailBox: {
    fontSize: '0.95rem',
    color: '#2563eb',
    wordBreak: 'break-all',
    backgroundColor: '#1a1a1a',
    padding: '0.8rem',
    borderRadius: '10px',
    border: '1px solid #333'
  },
  aboutText: {
    fontSize: '0.9rem',
    color: '#aaa',
    lineHeight: '1.5'
  },
  systemStatus: {
    backgroundColor: '#1a1a1a',
    padding: '1rem',
    borderRadius: '15px',
    marginTop: 'auto',
    border: '1px solid #333'
  },
  systemTitle: {
    fontSize: '0.8rem',
    color: '#666',
    marginBottom: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  statusConnected: {
    fontSize: '0.9rem',
    color: '#4CAF50',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  connectedDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#4CAF50'
  },
  statusDetails: {
    fontSize: '0.8rem',
    color: '#888',
    marginTop: '0.5rem'
  },
  chatPanel: {
    flex: 1,
    backgroundColor: '#111',
    borderRadius: '25px',
    padding: '2rem',
    border: '1px solid #333',
    display: 'flex',
    flexDirection: 'column'
  },
  chatHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #333'
  },
  chatTitle: {
    fontSize: '1.3rem',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  chatBadge: {
    fontSize: '0.9rem',
    color: '#888',
    backgroundColor: '#222',
    padding: '0.5rem 1rem',
    borderRadius: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  badgeDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#4CAF50'
  },
  messagesArea: {
    flex: 1,
    overflowY: 'auto',
    marginBottom: '1.5rem',
    paddingRight: '1rem',
    backgroundColor: '#0a0a0a',
    borderRadius: '15px',
    padding: '1.5rem'
  },
  emptyChat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#444',
    textAlign: 'center'
  },
  emptyTitle: {
    fontSize: '1.3rem',
    marginBottom: '0.5rem',
    color: '#666'
  },
  emptySubtitle: {
    fontSize: '0.9rem',
    color: '#555'
  },
  messageContainer: {
    marginBottom: '1.5rem',
    display: 'flex',
    flexDirection: 'column'
  },
  messageBubble: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    maxWidth: '85%'
  },
  messageAvatar: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    fontWeight: 'bold',
    flexShrink: 0,
    border: '2px solid'
  },
  messageContent: {
    padding: '1rem 1.5rem',
    borderRadius: '20px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
  },
  messageText: {
    fontSize: '1.1rem',
    lineHeight: '1.5',
    marginBottom: '0.5rem'
  },
  messageMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.8rem'
  },
  chatbotEmail: {
    marginLeft: '0.5rem',
    color: '#666'
  },
  typingIndicator: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    marginBottom: '1.5rem'
  },
  typingAvatar: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    backgroundColor: '#2a2a2a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    fontWeight: 'bold',
    flexShrink: 0,
    border: '2px solid #3a3a3a'
  },
  typingBubble: {
    backgroundColor: '#222',
    padding: '1rem 1.5rem',
    borderRadius: '20px',
    borderTopLeftRadius: '5px',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  typingDots: {
    display: 'flex',
    gap: '0.5rem',
    '& div': {
      width: '10px',
      height: '10px',
      borderRadius: '50%',
      backgroundColor: '#4CAF50'
    }
  },
  inputArea: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-end',
    borderTop: '1px solid #333',
    paddingTop: '1.5rem'
  },
  inputContainer: {
    flex: 1,
    backgroundColor: '#222',
    borderRadius: '25px',
    padding: '1rem 1.5rem',
    border: '2px solid #444',
    minHeight: '60px',
    display: 'flex',
    alignItems: 'center',
    transition: 'border-color 0.3s'
  },
  textarea: {
    width: '100%',
    backgroundColor: 'transparent',
    border: 'none',
    color: 'white',
    fontSize: '1.05rem',
    fontFamily: 'inherit',
    resize: 'none',
    outline: 'none',
    maxHeight: '150px',
    lineHeight: '1.5'
  },
  sendButton: {
    color: 'white',
    border: 'none',
    borderRadius: '20px',
    padding: '1rem 2rem',
    fontSize: '1rem',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    transition: 'all 0.3s',
    height: '60px'
  }
};

