'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuth, signInAnonymously, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

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

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Email chatbot (Akun Anda)
const CHATBOT_EMAIL = 'faridardiansyah061@gmail.com';
const CHATBOT_NAME = 'Menuru (Chatbot)';

export default function ChatbotPage() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('Guest');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginForm, setShowLoginForm] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize chatbot account on first load
  useEffect(() => {
    const initializeChatbotAccount = async () => {
      try {
        // Create or get chatbot user document
        const chatbotRef = doc(db, 'users', CHATBOT_EMAIL);
        const chatbotDoc = await getDoc(chatbotRef);
        
        if (!chatbotDoc.exists()) {
          await setDoc(chatbotRef, {
            email: CHATBOT_EMAIL,
            name: CHATBOT_NAME,
            role: 'chatbot',
            createdAt: serverTimestamp(),
            status: 'online'
          });
          console.log('Chatbot account initialized');
        }
      } catch (error) {
        console.error('Error initializing chatbot:', error);
      }
    };

    initializeChatbotAccount();
  }, []);

  // Initialize user session
  useEffect(() => {
    const initUser = async () => {
      try {
        // Try anonymous sign in first
        const userCredential = await signInAnonymously(auth);
        const user = userCredential.user;
        
        setUserId(user.uid);
        setUserEmail('anonymous@guest.com');
        setUserName('Guest');
        setIsLoggedIn(false);
        
        // Load chat history
        loadChatHistory();
        
        // Send welcome message from chatbot
        setTimeout(() => {
          sendChatbotMessage(`Halo! Saya ${CHATBOT_NAME}, asisten chatbot dari Note. Ada yang bisa saya bantu?`);
        }, 1000);
        
      } catch (error) {
        console.error('Error initializing user:', error);
      }
    };

    initUser();
  }, []);

  const loadChatHistory = () => {
    const messagesRef = collection(db, 'chats');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(loadedMessages);
    });

    return unsubscribe;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const saveMessageToFirestore = async (messageData) => {
    try {
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

  const sendChatbotMessage = async (text) => {
    const chatbotMessage = {
      text: text,
      sender: 'chatbot',
      senderEmail: CHATBOT_EMAIL,
      senderName: CHATBOT_NAME,
      receiverId: userId,
      receiverEmail: userEmail,
      timestamp: new Date()
    };

    await saveMessageToFirestore(chatbotMessage);
    
    // Send notification to user
    await addDoc(collection(db, 'notifications'), {
      userId: userId,
      message: `Pesan baru dari ${CHATBOT_NAME}: ${text.substring(0, 50)}...`,
      type: 'message',
      timestamp: serverTimestamp(),
      read: false
    });
  };

  const handleSendMessage = async () => {
    if (inputText.trim() === '') return;

    const userMessage = {
      text: inputText,
      sender: 'user',
      senderId: userId,
      senderEmail: userEmail,
      senderName: userName,
      receiverEmail: CHATBOT_EMAIL,
      timestamp: new Date()
    };

    // Save user message
    await saveMessageToFirestore(userMessage);
    
    // Save to conversation log
    await addDoc(collection(db, 'conversations'), {
      userId: userId,
      userEmail: userEmail,
      userName: userName,
      chatbotEmail: CHATBOT_EMAIL,
      message: inputText,
      type: 'user_to_chatbot',
      timestamp: serverTimestamp()
    });
    
    setInputText('');
    setIsLoading(true);

    // Simulate chatbot typing delay
    setTimeout(async () => {
      // This is where YOU would respond from faridardiansyah061@gmail.com
      // For now, using auto-responses
      const responses = [
        `Terima kasih pesannya! Saya ${CHATBOT_NAME} (faridardiansyah061@gmail.com) sedang online dan membaca pesan Anda.`,
        `Pesan diterima! Sebagai akun chatbot dari Note, saya akan membalas pesan Anda segera.`,
        `Hai ${userName}! Saya mencatat pertanyaan Anda. Mohon tunggu balasan dari akun chatbot.`,
        `Noted! Pesan Anda sudah sampai ke ${CHATBOT_EMAIL}. Saya sedang memproses permintaan Anda.`,
        `Pertanyaan yang bagus! Saya akan membalas dari akun chatbot resmi untuk membantu Anda.`
      ];
      
      const response = responses[Math.floor(Math.random() * responses.length)];
      await sendChatbotMessage(response);
      
      setIsLoading(false);
    }, 2000);
  };

  const handleLogin = async () => {
    try {
      let userCredential;
      
      if (loginEmail && loginPassword) {
        // Try to login with email/password
        userCredential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      } else {
        // Create new account if doesn't exist
        userCredential = await createUserWithEmailAndPassword(auth, loginEmail, loginPassword);
        
        // Create user document
        await setDoc(doc(db, 'users', loginEmail), {
          email: loginEmail,
          name: loginEmail.split('@')[0],
          role: 'user',
          createdAt: serverTimestamp()
        });
      }
      
      const user = userCredential.user;
      setUserId(user.uid);
      setUserEmail(loginEmail);
      setUserName(loginEmail.split('@')[0]);
      setIsLoggedIn(true);
      setShowLoginForm(false);
      
      // Send welcome message
      await sendChatbotMessage(`Selamat datang kembali, ${loginEmail.split('@')[0]}! Senang bisa membantu Anda lagi.`);
      
    } catch (error) {
      console.error('Login error:', error);
      alert('Login gagal: ' + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      
      // Anonymous sign in
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;
      
      setUserId(user.uid);
      setUserEmail('anonymous@guest.com');
      setUserName('Guest');
      setIsLoggedIn(false);
      
      await sendChatbotMessage('Anda sekarang menggunakan akun Guest. Silakan login untuk pengalaman lebih baik.');
      
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
    if (date.toDate) {
      date = date.toDate();
    }
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'black',
      color: 'white',
      padding: '2rem',
      fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        maxWidth: '1400px',
        marginBottom: '3rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <motion.h1
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              fontSize: '3.5rem',
              fontWeight: '300',
              letterSpacing: '-0.02em',
              margin: 0
            }}
          >
            chatbot
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{
              fontSize: '0.9rem',
              color: '#666',
              backgroundColor: '#111',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              border: '1px solid #333'
            }}
          >
            Two-way Communication System
          </motion.div>
        </div>

        {/* User Info Section */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem'
          }}
        >
          {/* User Profile */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            backgroundColor: '#111',
            padding: '0.75rem 1.5rem',
            borderRadius: '25px',
            border: '1px solid #333'
          }}>
            <div style={{
              width: '45px',
              height: '45px',
              borderRadius: '50%',
              backgroundColor: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
              fontWeight: 'bold',
              color: '#fff'
            }}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: '500' }}>
                {userName}
              </div>
              <div style={{ 
                fontSize: '0.8rem', 
                color: isLoggedIn ? '#4CAF50' : '#888',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: isLoggedIn ? '#4CAF50' : '#888'
                }}></div>
                {isLoggedIn ? 'Logged In' : 'Guest Mode'}
              </div>
            </div>
          </div>

          {/* Login/Logout Button */}
          {!isLoggedIn ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowLoginForm(!showLoginForm)}
              style={{
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
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Login
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              style={{
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
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Logout
            </motion.button>
          )}
        </motion.div>
      </div>

      {/* Login Form */}
      {showLoginForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            backgroundColor: '#111',
            padding: '2rem',
            borderRadius: '20px',
            border: '1px solid #333',
            width: '100%',
            maxWidth: '400px',
            marginBottom: '2rem'
          }}
        >
          <h3 style={{ marginBottom: '1rem', color: '#fff' }}>Login / Register</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="email"
              placeholder="Email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              style={{
                backgroundColor: '#222',
                border: '1px solid #444',
                color: 'white',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                fontSize: '0.9rem'
              }}
            />
            <input
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              style={{
                backgroundColor: '#222',
                border: '1px solid #444',
                color: 'white',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                fontSize: '0.9rem'
              }}
            />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogin}
                style={{
                  flex: 1,
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Login / Register
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowLoginForm(false)}
                style={{
                  backgroundColor: '#333',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Chat Container - VERY LARGE */}
      <div style={{
        display: 'flex',
        width: '100%',
        maxWidth: '1400px',
        gap: '2rem',
        height: '750px' // VERY LARGE
      }}>
        {/* Left Panel - Chatbot Profile */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            flex: '0 0 300px',
            backgroundColor: '#111',
            borderRadius: '25px',
            padding: '2rem',
            border: '1px solid #333',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            backgroundColor: '#2a2a2a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#fff',
            border: '3px solid #3a3a3a',
            marginBottom: '1.5rem'
          }}>
            MB
          </div>
          
          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: '400',
            color: '#fff',
            marginBottom: '0.5rem'
          }}>
            {CHATBOT_NAME}
          </h2>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#4CAF50',
              animation: 'pulse 2s infinite'
            }}></div>
            <span style={{
              fontSize: '1rem',
              color: '#b0b0b0',
              fontWeight: '300'
            }}>
              Online • Chatbot Account
            </span>
          </div>
          
          <div style={{
            textAlign: 'center',
            fontSize: '0.9rem',
            color: '#888',
            marginBottom: '2rem',
            lineHeight: '1.5'
          }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>Email:</strong><br />
              {CHATBOT_EMAIL}
            </div>
            <div>
              <strong>Role:</strong><br />
              Primary Chatbot Responder
            </div>
          </div>
          
          <div style={{
            backgroundColor: '#222',
            padding: '1rem',
            borderRadius: '15px',
            width: '100%',
            marginTop: 'auto'
          }}>
            <div style={{
              fontSize: '0.8rem',
              color: '#666',
              marginBottom: '0.5rem'
            }}>
              SYSTEM STATUS
            </div>
            <div style={{
              fontSize: '0.9rem',
              color: '#4CAF50',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#4CAF50'
              }}></div>
              Connected to Firebase
            </div>
            <div style={{
              fontSize: '0.8rem',
              color: '#888',
              marginTop: '0.5rem'
            }}>
              All messages will be responded from this account
            </div>
          </div>
        </motion.div>

        {/* Right Panel - Chat Messages */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{
            flex: 1,
            backgroundColor: '#111',
            borderRadius: '25px',
            padding: '2rem',
            border: '1px solid #333',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Messages Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid #333'
          }}>
            <div style={{ fontSize: '1.2rem', fontWeight: '500' }}>
              Conversation with {CHATBOT_NAME}
            </div>
            <div style={{
              fontSize: '0.8rem',
              color: '#888',
              backgroundColor: '#222',
              padding: '0.5rem 1rem',
              borderRadius: '15px'
            }}>
              {messages.length} messages
            </div>
          </div>

          {/* Messages Area - VERY LARGE */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            marginBottom: '1.5rem',
            paddingRight: '1rem',
            backgroundColor: '#0a0a0a',
            borderRadius: '15px',
            padding: '1.5rem'
          }}>
            {messages.length === 0 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: '#444',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💬</div>
                <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                  Start a conversation
                </div>
                <div style={{ fontSize: '0.9rem' }}>
                  Send a message to {CHATBOT_NAME}
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    marginBottom: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    maxWidth: '80%',
                    flexDirection: message.sender === 'user' ? 'row-reverse' : 'row'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: message.sender === 'user' ? '#2563eb' : '#2a2a2a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      flexShrink: 0
                    }}>
                      {message.sender === 'user' ? 'U' : 'C'}
                    </div>
                    <div style={{
                      backgroundColor: message.sender === 'user' ? '#2563eb' : '#222',
                      padding: '1rem 1.5rem',
                      borderRadius: '20px',
                      borderTopLeftRadius: message.sender === 'user' ? '20px' : '5px',
                      borderTopRightRadius: message.sender === 'user' ? '5px' : '20px',
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
                    }}>
                      <div style={{ 
                        fontSize: '1.1rem',
                        lineHeight: '1.5',
                        marginBottom: '0.5rem'
                      }}>
                        {message.text}
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.75rem',
                        color: message.sender === 'user' ? 'rgba(255,255,255,0.8)' : '#888'
                      }}>
                        <div>
                          <strong>{message.sender === 'user' ? userName : CHATBOT_NAME}</strong>
                          <span style={{ margin: '0 0.5rem' }}>•</span>
                          {message.senderEmail && (
                            <span>{message.senderEmail}</span>
                          )}
                        </div>
                        <div>
                          {formatTime(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
            
            {/* Loading Indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  marginBottom: '1.5rem'
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#2a2a2a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  flexShrink: 0
                }}>
                  C
                </div>
                <div style={{
                  backgroundColor: '#222',
                  padding: '1rem 1.5rem',
                  borderRadius: '20px',
                  borderTopLeftRadius: '5px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: '#4CAF50'
                        }}
                      />
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: '#4CAF50'
                        }}
                      />
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }}
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: '#4CAF50'
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '0.9rem', color: '#aaa' }}>
                      {CHATBOT_NAME} is typing...
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area - LARGE */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'flex-end',
            borderTop: '1px solid #333',
            paddingTop: '1.5rem'
          }}>
            <div style={{
              flex: 1,
              backgroundColor: '#222',
              borderRadius: '25px',
              padding: '1rem 1.5rem',
              border: '2px solid #444',
              minHeight: '60px',
              display: 'flex',
              alignItems: 'center',
              transition: 'border-color 0.3s'
            }}>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Ketik pesan untuk ${CHATBOT_NAME}...`}
                style={{
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
                }}
                rows="2"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.1, backgroundColor: '#1d4ed8' }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSendMessage}
              disabled={isLoading || inputText.trim() === ''}
              style={{
                backgroundColor: inputText.trim() === '' ? '#333' : '#2563eb',
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
                cursor: inputText.trim() === '' ? 'not-allowed' : 'pointer',
                opacity: inputText.trim() === '' ? 0.6 : 1,
                transition: 'all 0.3s',
                height: '60px'
              }}
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
              Send
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Footer Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        style={{
          marginTop: '2rem',
          padding: '1rem 2rem',
          backgroundColor: '#111',
          borderRadius: '15px',
          border: '1px solid #333',
          fontSize: '0.9rem',
          color: '#666',
          textAlign: 'center',
          maxWidth: '1400px',
          width: '100%'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#4CAF50'
          }}></div>
          <span>Two-Way Chat System • Chatbot Account: </span>
          <span style={{ color: '#2563eb', fontWeight: '500' }}>{CHATBOT_EMAIL}</span>
          <span style={{ margin: '0 1rem' }}>•</span>
          <span>User: {userEmail} ({isLoggedIn ? 'Logged In' : 'Guest'})</span>
        </div>
      </motion.div>

      {/* Add CSS for pulse animation and scrollbar */}
      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
        
        ::-webkit-scrollbar {
          width: 10px;
        }
        
        ::-webkit-scrollbar-track {
          background: #222;
          border-radius: 5px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #444;
          border-radius: 5px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
        
        textarea::-webkit-scrollbar {
          width: 6px;
        }
        
        textarea::-webkit-scrollbar-track {
          background: #333;
          border-radius: 3px;
        }
        
        textarea::-webkit-scrollbar-thumb {
          background: #555;
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
}
