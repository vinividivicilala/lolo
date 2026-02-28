'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
// Firebase imports
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

// Konfigurasi Firebase
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

// Inisialisasi Firebase dengan pengecekan client-side
const getFirebaseApp = () => {
  if (typeof window === 'undefined') return null;
  
  if (getApps().length === 0) {
    return initializeApp(firebaseConfig);
  }
  return getApps()[0];
};

const CHATBOT_EMAIL = 'faridardiansyah061@gmail.com';
const CHATBOT_NAME = 'Menuru (Chatbot)';
const CHATBOT_ID = 'chatbot_account_001';

// Daftar topik yang tersedia
const CHAT_TOPICS = [
  {
    id: 1,
    icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
    title: 'Cara Login',
    description: 'Panduan login ke aplikasi',
    response: 'Untuk login ke aplikasi, Anda dapat mengklik tombol "Sign In" di pojok kanan atas. Gunakan email dan password yang sudah terdaftar. Jika belum memiliki akun, silakan hubungi admin untuk pendaftaran.'
  },
  {
    id: 2,
    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    title: 'Cara Chat',
    description: 'Cara menggunakan fitur chat',
    response: 'Untuk menggunakan fitur chat, pastikan Anda sudah login. Ketik pesan Anda di kolom input bagian bawah, lalu tekan Enter atau klik tombol Send. Pesan Anda akan langsung terkirim dan chatbot akan merespons.'
  },
  {
    id: 3,
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    title: 'Fitur Keamanan',
    description: 'Informasi keamanan akun',
    response: 'Keamanan akun Anda adalah prioritas kami. Semua chat terenkripsi dan tersimpan aman di database Firebase. Pastikan Anda tidak membagikan kredensial login kepada siapapun. Admin akan segera menghubungi jika ada aktivitas mencurigakan.'
  },
  {
    id: 4,
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    title: 'Respon Cepat',
    description: 'Kecepatan respons chatbot',
    response: 'Chatbot kami dirancang untuk memberikan respons cepat dalam waktu 1-2 detik. Jika Anda mengalami keterlambatan, periksa koneksi internet Anda. Untuk pertanyaan kompleks, admin akan merespons secara manual.'
  },
  {
    id: 5,
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    title: 'Jam Operasional',
    description: 'Kapan admin online?',
    response: 'Chatbot tersedia 24/7 untuk merespons pertanyaan umum. Untuk bantuan dari admin langsung, jam operasional adalah Senin-Jumat pukul 08:00-20:00 WIB. Di luar jam tersebut, chatbot akan mencatat pesan Anda dan admin akan merespons di hari kerja berikutnya.'
  },
  {
    id: 6,
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    title: 'Akun Guest',
    description: 'Info tentang mode guest',
    response: 'Mode guest memungkinkan Anda mencoba fitur chat tanpa login. Namun, riwayat chat tidak akan tersimpan dan Anda tidak bisa menerima notifikasi. Untuk pengalaman terbaik, silakan login dengan akun terdaftar.'
  }
];

export default function ChatbotPage() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [firebaseError, setFirebaseError] = useState(null);
  const [showTopics, setShowTopics] = useState(false);
  const messagesEndRef = useRef(null);

  // Deteksi client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Inisialisasi Firebase dan auth listener
  useEffect(() => {
    if (!isClient) return;

    try {
      const app = getFirebaseApp();
      if (!app) {
        console.log('Firebase app not initialized (server-side)');
        setIsInitializing(false);
        return;
      }

      const auth = getAuth(app);
      const db = getFirestore(app);

      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          const userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Guest',
            isAnonymous: firebaseUser.isAnonymous
          };
          
          setUser(userData);
          setFirebaseError(null);
          
          // Load chat history
          loadChatHistory(firebaseUser.uid, db);
          
          // Kirim welcome message dari chatbot
          setTimeout(() => {
            sendChatbotMessage(
              `Halo ${userData.name}! 👋 Saya ${CHATBOT_NAME}, asisten chatbot dari Note. Ada yang bisa saya bantu? Silakan pilih topik di bawah atau ketik pertanyaan Anda.`, 
              firebaseUser.uid,
              db
            );
          }, 1500);
          
        } else {
          setUser(null);
          setMessages([]);
        }
        
        setIsInitializing(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Firebase initialization error:', error);
      setFirebaseError(error.message);
      setIsInitializing(false);
    }
  }, [isClient]);

  const loadChatHistory = (userId, db) => {
    if (!isClient || !db || !userId) return;

    try {
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
      }, (error) => {
        console.error('Error loading chat history:', error);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up chat listener:', error);
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (isClient) {
      scrollToBottom();
    }
  }, [messages, isClient]);

  const saveMessageToFirestore = async (messageData) => {
    if (!isClient || !user) return null;

    try {
      const app = getFirebaseApp();
      if (!app) return null;
      
      const db = getFirestore(app);
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

  const sendChatbotMessage = async (text, receiverId, db) => {
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

  const handleTopicClick = async (topic) => {
    if (!user || !isClient) return;

    // Kirim pesan user (memilih topik)
    const userMessage = {
      text: `Saya ingin tahu tentang: ${topic.title}`,
      senderId: user.uid,
      senderEmail: user.email,
      senderName: user.name,
      receiverId: CHATBOT_ID,
      receiverEmail: CHATBOT_EMAIL,
      timestamp: new Date(),
      type: 'user_query'
    };

    await saveMessageToFirestore(userMessage);
    
    setIsLoading(true);
    setShowTopics(false);

    // Simulasi delay untuk respons
    setTimeout(async () => {
      const app = getFirebaseApp();
      if (app) {
        const db = getFirestore(app);
        await sendChatbotMessage(topic.response, user.uid, db);
        
        // Kirim pesan tambahan dengan saran topik lain
        setTimeout(async () => {
          await sendChatbotMessage(
            'Apakah ada topik lain yang ingin Anda tanyakan? Anda bisa memilih dari daftar topik yang tersedia.',
            user.uid,
            db
          );
          setShowTopics(true);
        }, 1000);
      }
      
      setIsLoading(false);
    }, 1500);
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
    setShowTopics(false);

    setTimeout(async () => {
      const app = getFirebaseApp();
      if (app) {
        const db = getFirestore(app);
        
        // Respons berdasarkan kata kunci
        const lowerInput = inputText.toLowerCase();
        let response = '';
        
        if (lowerInput.includes('login') || lowerInput.includes('masuk')) {
          response = 'Untuk login, klik tombol "Sign In" di pojok kanan atas. Gunakan email dan password terdaftar. Butuh bantuan lebih lanjut?';
        } else if (lowerInput.includes('chat') || lowerInput.includes('pesan')) {
          response = 'Fitur chat mudah digunakan! Ketik pesan di kolom bawah, tekan Enter untuk kirim. Chatbot akan merespons otomatis.';
        } else if (lowerInput.includes('aman') || lowerInput.includes('keamanan')) {
          response = 'Keamanan data Anda terjamin dengan enkripsi Firebase. Kami tidak menyimpan password dan semua chat terproteksi.';
        } else if (lowerInput.includes('cepat') || lowerInput.includes('lambat')) {
          response = 'Chatbot merespons dalam 1-2 detik. Jika lambat, periksa koneksi internet Anda atau hubungi admin.';
        } else if (lowerInput.includes('jam') || lowerInput.includes('operasional')) {
          response = 'Chatbot online 24/7. Admin online Senin-Jumat 08:00-20:00 WIB. Di luar jam itu, pesan akan direspons di hari kerja.';
        } else if (lowerInput.includes('guest') || lowerInput.includes('tamu')) {
          response = 'Mode guest memungkinkan chat tanpa login, tapi riwayat tidak tersimpan. Login untuk pengalaman lengkap!';
        } else {
          response = `Terima kasih pesannya! Saya akan memproses pertanyaan Anda: "${inputText}". Silakan pilih topik yang tersedia untuk informasi lebih cepat.`;
        }
        
        await sendChatbotMessage(response, user.uid, db);
        
        // Tampilkan topik setelah respons
        setTimeout(async () => {
          await sendChatbotMessage(
            'Berikut topik-topik yang mungkin membantu:',
            user.uid,
            db
          );
          setShowTopics(true);
        }, 1000);
      }
      
      setIsLoading(false);
    }, 2000);
  };

  // TOMBOL NAVIGASI
  const handleGoToAdmin = () => {
    router.push('/admin/chat');
  };

  const handleLogin = () => {
    router.push('/signin');
  };

  const handleLogout = async () => {
    if (!isClient) return;

    try {
      const app = getFirebaseApp();
      if (!app) return;
      
      const auth = getAuth(app);
      await signOut(auth);
      setUser(null);
      setMessages([]);
      setShowTopics(false);
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
    try {
      if (date.toDate) date = date.toDate();
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return '';
    }
  };

  // Icon components dengan SVG modern
  const Icons = {
    Chat: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 12H8.01M12 12H12.01M16 12H16.01M21 12C21 16.4183 17.4183 20 13 20C12.0429 20 11.1309 19.8286 10.2913 19.5138L4 21L6.14532 15.3883C5.41955 14.3422 5 13.1045 5 11.7778C5 7.35951 8.58172 4 13 4C17.4183 4 21 7.58172 21 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    Send: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    Logout: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17 16L21 12M21 12L17 8M21 12L7 12M13 16V17C13 19.2091 11.2091 21 9 21H6C3.79086 21 2 19.2091 2 17V7C2 4.79086 3.79086 3 6 3H9C11.2091 3 13 4.79086 13 7V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    Login: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H15M10 17L15 12M15 12L10 7M15 12H3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    Admin: () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 20V19C5 15.6863 7.68629 13 11 13H13C16.3137 13 19 15.6863 19 19V20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    User: () => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    Email: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    Info: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    System: () => (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 8H19C20.1046 8 21 8.89543 21 10V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V10C3 8.89543 3.89543 8 5 8H6M18 8V6C18 4.89543 17.1046 4 16 4H8C6.89543 4 6 4.89543 6 6V8M18 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    Status: () => (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    )
  };

  // Loading state untuk server side rendering
  if (!isClient) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingText}>Loading...</div>
      </div>
    );
  }

  if (isInitializing) {
    return (
      <div style={styles.loadingContainer}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={styles.spinner}
        />
        <div style={styles.loadingText}>Initializing Chatbot...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <motion.h1
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          style={styles.title}
        >
          chatbot
        </motion.h1>

        {/* User Info */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          style={styles.userContainer}
        >
          {user ? (
            <>
              <div style={styles.userInfo}>
                <div style={styles.userAvatar}>
                  {user?.name?.charAt(0).toUpperCase() || 'G'}
                </div>
                <div>
                  <div style={styles.userName}>{user?.name || 'Guest'}</div>
                  <div style={styles.userStatus}>
                    <span style={styles.statusText}>
                      {user?.isAnonymous ? 'Guest Mode' : 'Signed In'}
                    </span>
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
                  <Icons.Admin />
                  Admin Dashboard
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                style={styles.logoutButton}
              >
                <Icons.Logout />
                Logout
              </motion.button>
            </>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogin}
              style={styles.loginButton}
            >
              <Icons.Login />
              Sign In
            </motion.button>
          )}
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
            <div style={styles.profileAvatar}>
              <Icons.Chat />
            </div>
            <h2 style={styles.profileName}>{CHATBOT_NAME}</h2>
            <div style={styles.profileStatus}>
              <span>Online • Ready to Chat</span>
            </div>
          </div>
          
          <div style={styles.infoBox}>
            <div style={styles.infoTitle}>
              <Icons.Email />
              <strong>Chatbot Email:</strong>
            </div>
            <div style={styles.emailBox}>{CHATBOT_EMAIL}</div>
          </div>
          
          <div style={styles.infoBox}>
            <div style={styles.infoTitle}>
              <Icons.Info />
              <strong>About This Chatbot:</strong>
            </div>
            <div style={styles.aboutText}>
              Two-way communication system with intelligent topic suggestions.
              {!user && (
                <div style={{ marginTop: '10px', color: '#fff' }}>
                  ⚠️ Please sign in to start chatting
                </div>
              )}
            </div>
          </div>
          
          <div style={styles.systemStatus}>
            <div style={styles.systemTitle}>
              <Icons.System />
              SYSTEM STATUS
            </div>
            <div style={styles.statusConnected}>
              <Icons.Status />
              {user ? 'Connected to Firebase' : 'Authentication Required'}
            </div>
            <div style={styles.statusDetails}>
              Messages: {messages.length} • Status: {user ? 'Signed In' : 'Not Signed In'}
            </div>
            {firebaseError && (
              <div style={styles.errorText}>
                ⚠️ Error: {firebaseError}
              </div>
            )}
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
              <Icons.Chat />
              <span>Chat with {CHATBOT_NAME}</span>
            </div>
            <div style={styles.chatBadge}>
              {user ? 'Real-time Chat' : 'Sign in to Chat'}
            </div>
          </div>

          <div style={styles.messagesArea}>
            {!user ? (
              <div style={styles.emptyChat}>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  style={{ marginBottom: '1rem' }}
                >
                  <Icons.Chat />
                </motion.div>
                <div style={styles.emptyTitle}>Please Sign In to Chat</div>
                <div style={styles.emptySubtitle}>You need to be signed in to send and receive messages</div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogin}
                  style={styles.signInButton}
                >
                  <Icons.Login />
                  Sign In to Continue
                </motion.button>
              </div>
            ) : messages.length === 0 ? (
              <div style={styles.emptyChat}>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  style={{ marginBottom: '1rem' }}
                >
                  <Icons.Chat />
                </motion.div>
                <div style={styles.emptyTitle}>Start chatting with {CHATBOT_NAME}</div>
                <div style={styles.emptySubtitle}>Type your message below or choose a topic</div>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id || index}
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
                        backgroundColor: message.senderId === CHATBOT_ID ? '#1a1a1a' : '#1a1a1a',
                        borderColor: '#333'
                      }}>
                        {message.senderId === CHATBOT_ID ? <Icons.Chat /> : <Icons.User />}
                      </div>
                      <div style={{
                        ...styles.messageContent,
                        backgroundColor: message.senderId === CHATBOT_ID ? '#1a1a1a' : '#1a1a1a',
                        border: '1px solid #333'
                      }}>
                        <div style={styles.messageText}>{message.text}</div>
                        <div style={styles.messageMeta}>
                          <div>
                            <strong>{message.senderId === CHATBOT_ID ? CHATBOT_NAME : user?.name || 'User'}</strong>
                          </div>
                          <div>{formatTime(message.timestamp)}</div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Topic Suggestions */}
                {showTopics && user && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={styles.topicsContainer}
                  >
                    <div style={styles.topicsTitle}>
                      <Icons.Info />
                      <span>Pilih topik yang Anda butuhkan:</span>
                    </div>
                    <div style={styles.topicsGrid}>
                      {CHAT_TOPICS.map((topic) => (
                        <motion.button
                          key={topic.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleTopicClick(topic)}
                          style={styles.topicButton}
                        >
                          <div style={styles.topicIcon}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d={topic.icon} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div style={styles.topicContent}>
                            <div style={styles.topicTitle}>{topic.title}</div>
                            <div style={styles.topicDescription}>{topic.description}</div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {isLoading && user && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.typingIndicator}>
                    <div style={styles.typingAvatar}>
                      <Icons.Chat />
                    </div>
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
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={styles.inputArea}>
            <div style={{
              ...styles.inputContainer,
              opacity: user ? 1 : 0.5,
              cursor: user ? 'text' : 'not-allowed'
            }}>
              <textarea
                value={inputText}
                onChange={(e) => user && setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={user 
                  ? `Type your message to ${CHATBOT_NAME}... (Press Enter to send)`
                  : 'Please sign in to send messages...'
                }
                style={styles.textarea}
                rows="2"
                disabled={!user}
              />
            </div>
            <motion.button
              whileHover={user && inputText.trim() ? { scale: 1.05 } : {}}
              whileTap={user && inputText.trim() ? { scale: 0.95 } : {}}
              onClick={handleSendMessage}
              disabled={isLoading || inputText.trim() === '' || !user}
              style={{
                ...styles.sendButton,
                opacity: user && inputText.trim() ? 1 : 0.5,
                cursor: user && inputText.trim() ? 'pointer' : 'not-allowed'
              }}
            >
              <Icons.Send />
              Send
            </motion.button>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        ::-webkit-scrollbar { width: 10px; }
        ::-webkit-scrollbar-track { background: #1a1a1a; border-radius: 5px; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 5px; }
        ::-webkit-scrollbar-thumb:hover { background: #444; }
        textarea::-webkit-scrollbar { width: 6px; }
        textarea::-webkit-scrollbar-track { background: #1a1a1a; border-radius: 3px; }
        textarea::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
      `}</style>
    </div>
  );
}

// Styles object - Semua warna putih/hitam
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#000',
    color: '#fff',
    padding: '2rem',
    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
    display: 'flex',
    flexDirection: 'column'
  },
  loadingContainer: {
    minHeight: '100vh',
    backgroundColor: '#000',
    color: '#fff',
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
    borderTopColor: '#fff',
    borderRadius: '50%',
    marginBottom: '1rem'
  },
  loadingText: {
    fontSize: '1rem',
    color: '#fff'
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
    margin: 0,
    color: '#fff'
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
    backgroundColor: '#1a1a1a',
    padding: '0.75rem 1.5rem',
    borderRadius: '25px',
    border: '1px solid #333'
  },
  userAvatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: '#1a1a1a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#fff',
    border: '2px solid #333'
  },
  userName: {
    fontSize: '1.1rem',
    fontWeight: '500',
    color: '#fff'
  },
  userStatus: {
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
    color: '#fff'
  },
  statusText: {
    color: '#fff'
  },
  userEmail: {
    color: '#fff',
    marginLeft: '0.5rem'
  },
  loginButton: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    border: '1px solid #333',
    padding: '0.75rem 1.5rem',
    borderRadius: '25px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  adminButton: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    border: '1px solid #333',
    padding: '0.75rem 1.5rem',
    borderRadius: '25px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  logoutButton: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    border: '1px solid #333',
    padding: '0.75rem 1.5rem',
    borderRadius: '25px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  signInButton: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    border: '1px solid #333',
    padding: '0.75rem 1.5rem',
    borderRadius: '25px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: '1rem'
  },
  mainContent: {
    display: 'flex',
    gap: '2rem',
    flex: 1,
    height: 'calc(100vh - 200px)'
  },
  profilePanel: {
    flex: '0 0 350px',
    backgroundColor: '#1a1a1a',
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
    backgroundColor: '#1a1a1a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    color: '#fff',
    border: '3px solid #333',
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
    marginBottom: '1rem',
    color: '#fff'
  },
  infoBox: {
    backgroundColor: '#1a1a1a',
    padding: '1.5rem',
    borderRadius: '20px',
    marginBottom: '1.5rem',
    border: '1px solid #333'
  },
  infoTitle: {
    fontSize: '0.9rem',
    color: '#fff',
    marginBottom: '0.8rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  emailBox: {
    fontSize: '0.95rem',
    color: '#fff',
    wordBreak: 'break-all',
    backgroundColor: '#1a1a1a',
    padding: '0.8rem',
    borderRadius: '10px',
    border: '1px solid #333'
  },
  aboutText: {
    fontSize: '0.9rem',
    color: '#fff',
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
    color: '#fff',
    marginBottom: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  statusConnected: {
    fontSize: '0.9rem',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  connectedDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#fff'
  },
  statusDetails: {
    fontSize: '0.8rem',
    color: '#fff',
    marginTop: '0.5rem'
  },
  errorText: {
    fontSize: '0.8rem',
    color: '#fff',
    marginTop: '0.5rem',
    backgroundColor: '#1a1a1a',
    padding: '0.5rem',
    borderRadius: '5px',
    border: '1px solid #333'
  },
  chatPanel: {
    flex: 1,
    backgroundColor: '#1a1a1a',
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
    gap: '0.5rem',
    color: '#fff'
  },
  chatBadge: {
    fontSize: '0.9rem',
    color: '#fff',
    backgroundColor: '#1a1a1a',
    padding: '0.5rem 1rem',
    borderRadius: '15px',
    border: '1px solid #333',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  badgeDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#fff'
  },
  messagesArea: {
    flex: 1,
    overflowY: 'auto',
    marginBottom: '1.5rem',
    paddingRight: '1rem',
    backgroundColor: '#000',
    borderRadius: '15px',
    padding: '1.5rem'
  },
  emptyChat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#fff',
    textAlign: 'center'
  },
  emptyTitle: {
    fontSize: '1.3rem',
    marginBottom: '0.5rem',
    color: '#fff'
  },
  emptySubtitle: {
    fontSize: '0.9rem',
    color: '#fff'
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
    flexShrink: 0,
    border: '2px solid #333',
    color: '#fff'
  },
  messageContent: {
    padding: '1rem 1.5rem',
    borderRadius: '20px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5)',
    color: '#fff'
  },
  messageText: {
    fontSize: '1.1rem',
    lineHeight: '1.5',
    marginBottom: '0.5rem',
    color: '#fff'
  },
  messageMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.8rem',
    color: '#fff'
  },
  chatbotEmail: {
    marginLeft: '0.5rem',
    color: '#fff'
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
    backgroundColor: '#1a1a1a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    fontWeight: 'bold',
    flexShrink: 0,
    border: '2px solid #333',
    color: '#fff'
  },
  typingBubble: {
    backgroundColor: '#1a1a1a',
    padding: '1rem 1.5rem',
    borderRadius: '20px',
    borderTopLeftRadius: '5px',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    border: '1px solid #333',
    color: '#fff'
  },
  typingDots: {
    display: 'flex',
    gap: '0.5rem',
    '& div': {
      width: '10px',
      height: '10px',
      borderRadius: '50%',
      backgroundColor: '#fff'
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
    backgroundColor: '#1a1a1a',
    borderRadius: '25px',
    padding: '1rem 1.5rem',
    border: '2px solid #333',
    minHeight: '60px',
    display: 'flex',
    alignItems: 'center',
    transition: 'border-color 0.3s'
  },
  textarea: {
    width: '100%',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '1.05rem',
    fontFamily: 'inherit',
    resize: 'none',
    outline: 'none',
    maxHeight: '150px',
    lineHeight: '1.5'
  },
  sendButton: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    border: '1px solid #333',
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
  },
  // Topics styles
  topicsContainer: {
    marginBottom: '2rem',
    padding: '1.5rem',
    backgroundColor: '#1a1a1a',
    borderRadius: '15px',
    border: '1px solid #333'
  },
  topicsTitle: {
    fontSize: '1rem',
    color: '#fff',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  topicsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '1rem'
  },
  topicButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '12px',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
    transition: 'all 0.3s',
    color: '#fff'
  },
  topicIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: '#1a1a1a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #333',
    color: '#fff'
  },
  topicContent: {
    flex: 1
  },
  topicTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    marginBottom: '0.2rem',
    color: '#fff'
  },
  topicDescription: {
    fontSize: '0.85rem',
    color: '#fff'
  }
};
