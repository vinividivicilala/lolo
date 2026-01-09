'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, setDoc, getDoc } from 'firebase/firestore';
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

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Email chatbot (Akun Anda)
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
  const messagesEndRef = useRef(null);

  // Initialize chatbot account and auto-login
  useEffect(() => {
    const initializeSystem = async () => {
      try {
        // 1. Create chatbot account if not exists
        const chatbotRef = doc(db, 'users', CHATBOT_ID);
        const chatbotDoc = await getDoc(chatbotRef);
        
        if (!chatbotDoc.exists()) {
          await setDoc(chatbotRef, {
            email: CHATBOT_EMAIL,
            name: CHATBOT_NAME,
            role: 'chatbot',
            createdAt: serverTimestamp(),
            status: 'online',
            userId: CHATBOT_ID
          });
          console.log('✅ Chatbot account initialized');
        }

        // 2. Listen for auth state changes (auto-login from sign in page)
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            // User is signed in from sign in page
            console.log('✅ User auto-logged in:', firebaseUser.email);
            
            const userRef = doc(db, 'users', firebaseUser.uid);
            const userDoc = await getDoc(userRef);
            
            let userData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
              isAnonymous: firebaseUser.isAnonymous
            };
            
            if (!userDoc.exists()) {
              await setDoc(userRef, {
                ...userData,
                createdAt: serverTimestamp(),
                status: 'online'
              });
            } else {
              userData = { ...userData, ...userDoc.data() };
            }
            
            setUser(userData);
            
            // 3. Load chat history for this user
            loadChatHistory(firebaseUser.uid);
            
            // 4. Send welcome message from chatbot
            setTimeout(() => {
              sendChatbotMessage(`Halo ${userData.name}! 👋 Saya ${CHATBOT_NAME}, asisten chatbot dari Note. Ada yang bisa saya bantu?`, firebaseUser.uid);
            }, 1500);
            
          } else {
            // No user signed in, create anonymous user
            console.log('⚠️ No user found, creating anonymous session...');
            router.push('/sign-in'); // Redirect to sign in page
          }
          
          setIsInitializing(false);
        });

        return () => unsubscribe();
        
      } catch (error) {
        console.error('❌ Error initializing system:', error);
        setIsInitializing(false);
      }
    };

    initializeSystem();
  }, [router]);

  const loadChatHistory = (userId) => {
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
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!isInitializing) {
      scrollToBottom();
    }
  }, [messages, isInitializing]);

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

  const sendChatbotMessage = async (text, receiverId) => {
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
    
    // Send notification to user
    await addDoc(collection(db, 'notifications'), {
      userId: receiverId,
      message: `Pesan baru dari ${CHATBOT_NAME}`,
      type: 'message',
      timestamp: serverTimestamp(),
      read: false
    });
    
    console.log('💬 Chatbot message sent:', text);
  };

  const handleSendMessage = async () => {
    if (inputText.trim() === '' || !user) return;

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

    // Save user message
    await saveMessageToFirestore(userMessage);
    
    // Save to conversation log
    await addDoc(collection(db, 'conversations'), {
      userId: user.uid,
      userEmail: user.email,
      userName: user.name,
      chatbotEmail: CHATBOT_EMAIL,
      message: inputText,
      type: 'user_to_chatbot',
      timestamp: serverTimestamp()
    });
    
    console.log('📤 User message sent:', inputText);
    
    setInputText('');
    setIsLoading(true);

    // Simulate chatbot typing delay
    setTimeout(async () => {
      // Auto-response from chatbot (faridardiansyah061@gmail.com)
      const responses = [
        `Terima kasih pesannya ${user.name}! 🙏 Saya ${CHATBOT_NAME} (${CHATBOT_EMAIL}) sedang memproses pertanyaan Anda.`,
        `Pesan diterima! ✅ Sebagai akun chatbot dari Note, saya akan membalas dari email ${CHATBOT_EMAIL}.`,
        `Hai ${user.name}! 👋 Pertanyaan Anda sudah tercatat. Saya akan merespons segera dari akun chatbot.`,
        `Noted! 📝 Pesan Anda sudah sampai ke ${CHATBOT_EMAIL}. Mohon tunggu balasan saya.`,
        `Pertanyaan yang bagus ${user.name}! 💡 Saya sedang mempersiapkan jawaban terbaik untuk Anda.`
      ];
      
      const response = responses[Math.floor(Math.random() * responses.length)];
      await sendChatbotMessage(response, user.uid);
      
      setIsLoading(false);
    }, 2000);
  };

  const handleLogout = async () => {
    try {
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
    if (date.toDate) {
      date = date.toDate();
    }
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Show loading while initializing
  if (isInitializing) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'black',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif"
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={{
            width: '50px',
            height: '50px',
            border: '3px solid #333',
            borderTopColor: '#2563eb',
            borderRadius: '50%',
            marginBottom: '1rem'
          }}
        />
        <div style={{ fontSize: '1rem', color: '#666' }}>
          Loading Chatbot System...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'black',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif"
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔒</div>
        <div style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
          Please sign in first
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/sign-in')}
          style={{
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '10px',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          Go to Sign In
        </motion.button>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'black',
      color: 'white',
      padding: '2rem',
      fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '3rem'
      }}>
        <motion.h1
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            fontSize: '4rem',
            fontWeight: '300',
            letterSpacing: '-0.02em',
            margin: 0
          }}
        >
          chatbot
        </motion.h1>

        {/* User Info */}
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
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              backgroundColor: user.isAnonymous ? '#666' : '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              color: '#fff'
            }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: '500' }}>
                {user.name}
              </div>
              <div style={{ 
                fontSize: '0.9rem', 
                color: user.isAnonymous ? '#888' : '#4CAF50',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: user.isAnonymous ? '#888' : '#4CAF50'
                }}></div>
                {user.isAnonymous ? 'Guest Mode' : 'Signed In'}
                {!user.isAnonymous && (
                  <span style={{ marginLeft: '0.5rem', color: '#666' }}>
                    {user.email}
                  </span>
                )}
              </div>
            </div>
          </div>

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
        </motion.div>
      </div>

      {/* Main Content */}
      <div style={{
        display: 'flex',
        gap: '2rem',
        flex: 1,
        height: 'calc(100vh - 200px)'
      }}>
        {/* Left Panel - Chatbot Profile */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            flex: '0 0 350px',
            backgroundColor: '#111',
            borderRadius: '25px',
            padding: '2rem',
            border: '1px solid #333',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '2rem'
          }}>
            <div style={{
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
            }}>
              MB
            </div>
            
            <h2 style={{
              fontSize: '1.8rem',
              fontWeight: '400',
              color: '#fff',
              marginBottom: '0.5rem',
              textAlign: 'center'
            }}>
              {CHATBOT_NAME}
            </h2>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem'
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
                Online • Ready to Chat
              </span>
            </div>
          </div>
          
          <div style={{
            backgroundColor: '#222',
            padding: '1.5rem',
            borderRadius: '20px',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              fontSize: '0.9rem',
              color: '#888',
              marginBottom: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <strong>Chatbot Email:</strong>
            </div>
            <div style={{
              fontSize: '0.95rem',
              color: '#2563eb',
              wordBreak: 'break-all',
              backgroundColor: '#1a1a1a',
              padding: '0.8rem',
              borderRadius: '10px',
              border: '1px solid #333'
            }}>
              {CHATBOT_EMAIL}
            </div>
          </div>
          
          <div style={{
            backgroundColor: '#222',
            padding: '1.5rem',
            borderRadius: '20px',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              fontSize: '0.9rem',
              color: '#888',
              marginBottom: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 16v-4"></path>
                <path d="M12 8h.01"></path>
              </svg>
              <strong>About This Chatbot:</strong>
            </div>
            <div style={{
              fontSize: '0.9rem',
              color: '#aaa',
              lineHeight: '1.5'
            }}>
              This is a two-way communication system. All responses come from the chatbot account ({CHATBOT_EMAIL}). Your messages are logged and will receive personalized responses.
            </div>
          </div>
          
          <div style={{
            backgroundColor: '#1a1a1a',
            padding: '1rem',
            borderRadius: '15px',
            marginTop: 'auto',
            border: '1px solid #333'
          }}>
            <div style={{
              fontSize: '0.8rem',
              color: '#666',
              marginBottom: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                <line x1="6" y1="1" x2="6" y2="4"></line>
                <line x1="10" y1="1" x2="10" y2="4"></line>
                <line x1="14" y1="1" x2="14" y2="4"></line>
              </svg>
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
              Messages: {messages.length} • User: {user.uid.substring(0, 8)}...
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
            <div style={{ 
              fontSize: '1.3rem', 
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span>💬</span>
              <span>Chat with {CHATBOT_NAME}</span>
            </div>
            <div style={{
              fontSize: '0.9rem',
              color: '#888',
              backgroundColor: '#222',
              padding: '0.5rem 1rem',
              borderRadius: '15px',
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
              Real-time Chat
            </div>
          </div>

          {/* Messages Area */}
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
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  style={{ fontSize: '4rem', marginBottom: '1rem' }}
                >
                  👋
                </motion.div>
                <div style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: '#666' }}>
                  Start chatting with {CHATBOT_NAME}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#555' }}>
                  Type your message below to begin the conversation
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  style={{
                    marginBottom: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: message.senderId === CHATBOT_ID ? 'flex-start' : 'flex-end'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    maxWidth: '85%',
                    flexDirection: message.senderId === CHATBOT_ID ? 'row' : 'row-reverse'
                  }}>
                    <div style={{
                      width: '45px',
                      height: '45px',
                      borderRadius: '50%',
                      backgroundColor: message.senderId === CHATBOT_ID ? '#2a2a2a' : '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      flexShrink: 0,
                      border: '2px solid',
                      borderColor: message.senderId === CHATBOT_ID ? '#3a3a3a' : '#1d4ed8'
                    }}>
                      {message.senderId === CHATBOT_ID ? 'C' : user.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{
                      backgroundColor: message.senderId === CHATBOT_ID ? '#222' : '#2563eb',
                      padding: '1rem 1.5rem',
                      borderRadius: '20px',
                      borderTopLeftRadius: message.senderId === CHATBOT_ID ? '5px' : '20px',
                      borderTopRightRadius: message.senderId === CHATBOT_ID ? '20px' : '5px',
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
                        fontSize: '0.8rem',
                        color: message.senderId === CHATBOT_ID ? '#888' : 'rgba(255,255,255,0.8)'
                      }}>
                        <div>
                          <strong>{message.senderId === CHATBOT_ID ? CHATBOT_NAME : user.name}</strong>
                          {message.senderId === CHATBOT_ID && (
                            <span style={{ marginLeft: '0.5rem', color: '#666' }}>
                              ({CHATBOT_EMAIL})
                            </span>
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
                      {CHATBOT_NAME} is typing a response...
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
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
                placeholder={`Type your message to ${CHATBOT_NAME}... (Press Enter to send)`}
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
          border: '1px solid #333', // FIXED: was '1px solid '#333'
          fontSize: '0.9rem',
          color: '#666',
          textAlign: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#4CAF50'
            }}></div>
            <span>Two-Way Chat System</span>
          </div>
          <div style={{ color: '#444' }}>•</div>
          <div>
            <strong>Chatbot Account:</strong> <span style={{ color: '#2563eb' }}>{CHATBOT_EMAIL}</span>
          </div>
          <div style={{ color: '#444' }}>•</div>
          <div>
            <strong>Your Account:</strong> {user.email} ({user.isAnonymous ? 'Guest' : 'Registered'})
          </div>
          <div style={{ color: '#444' }}>•</div>
          <div>
            <strong>Messages:</strong> {messages.length}
          </div>
        </div>
      </motion.div>

      {/* Add CSS */}
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
          background: '#555',
          border-radius: 3px;
        }
        
        textarea::-webkit-scrollbar-thumb:hover {
          background: '#666',
        }
      `}</style>
    </div>
  );
}
