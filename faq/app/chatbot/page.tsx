'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

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

// Email target untuk notifikasi
const TARGET_EMAIL = 'faridardiansyah061@gmail.com';

export default function ChatbotPage() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState('');
  const [userEmail, setUserEmail] = useState('user@anonymous.com');
  const messagesEndRef = useRef(null);

  // Inisialisasi user dan load chat history
  useEffect(() => {
    const initFirebase = async () => {
      try {
        // Sign in secara anonymous
        const userCredential = await signInAnonymously(auth);
        const user = userCredential.user;
        setUserId(user.uid);
        
        // Set email anonymous untuk user
        setUserEmail(`user_${user.uid.substring(0, 8)}@anonymous.com`);
        
        // Load chat history dari Firestore
        loadChatHistory();
        
        // Kirim notifikasi awal bahwa user baru bergabung
        await addDoc(collection(db, 'chat_logs'), {
          type: 'SYSTEM',
          message: `User baru bergabung ke chat: ${user.uid}`,
          userEmail: TARGET_EMAIL,
          timestamp: serverTimestamp(),
          userId: user.uid
        });
        
      } catch (error) {
        console.error('Error initializing Firebase:', error);
      }
    };

    initFirebase();
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
        timestamp: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error saving message:', error);
      return null;
    }
  };

  const logToEmail = async (message, type = 'USER_QUERY') => {
    try {
      await addDoc(collection(db, 'chat_logs'), {
        type: type,
        message: message,
        userEmail: TARGET_EMAIL,
        timestamp: serverTimestamp(),
        userId: userId,
        userAnonymousEmail: userEmail
      });
    } catch (error) {
      console.error('Error logging to email:', error);
    }
  };

  const handleSendMessage = async () => {
    if (inputText.trim() === '') return;

    const userMessage = {
      text: inputText,
      sender: 'user',
      userId: userId,
      userEmail: userEmail,
      timestamp: new Date()
    };

    // Simpan pesan user ke Firestore
    await saveMessageToFirestore(userMessage);
    
    // Log ke email Anda
    await logToEmail(inputText, 'USER_QUERY');
    
    setInputText('');
    setIsLoading(true);

    // Simpan pesan loading
    const loadingMessage = {
      text: 'Menuru sedang mengetik...',
      sender: 'bot',
      userId: userId,
      timestamp: new Date(),
      isTyping: true
    };
    
    // Simulasi delay untuk bot response
    setTimeout(async () => {
      const botResponses = [
        `Terima kasih atas pertanyaannya! Sebagai asisten dari Note, saya akan membantu Anda. Pertanyaan ini telah dicatat dan dikirim ke ${TARGET_EMAIL}.`,
        `Pertanyaan yang bagus! Saya memproses permintaan Anda dan sudah mengirimkannya ke email admin untuk tindak lanjut.`,
        `Saya memahami pertanyaan Anda. Sebagai chatbot dengan akun user terintegrasi, sistem saya akan mencatat ini di riwayat ${TARGET_EMAIL}.`,
        `Noted! Pertanyaan Anda sudah tercatat di sistem. Admin akan melihat riwayat ini melalui email ${TARGET_EMAIL}.`,
        `Terima kasih sudah menghubungi. Saya telah mengirimkan pertanyaan Anda ke akun admin untuk diproses lebih lanjut.`
      ];
      
      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
      
      const botMessage = {
        text: randomResponse,
        sender: 'bot',
        userId: userId,
        timestamp: new Date()
      };

      // Simpan response bot ke Firestore
      await saveMessageToFirestore(botMessage);
      
      // Log response ke email
      await logToEmail(`Bot response: ${randomResponse}`, 'BOT_RESPONSE');
      
      setIsLoading(false);
    }, 2000);
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
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        marginTop: '4rem',
        marginBottom: '2rem'
      }}>
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            fontSize: '5rem',
            fontWeight: '300',
            letterSpacing: '-0.02em',
            margin: 0,
            textAlign: 'center'
          }}
        >
          chatbot
        </motion.h1>
      </div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '2rem',
          width: '100%',
          maxWidth: '1200px',
          paddingLeft: '2rem'
        }}
      >
        <div style={{
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          backgroundColor: '#2a2a2a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.8rem',
          fontWeight: 'bold',
          color: '#fff',
          border: '2px solid #3a3a3a'
        }}>
          FP
        </div>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem'
        }}>
          <span style={{
            fontSize: '1.8rem',
            fontWeight: '400',
            color: '#fff'
          }}>
            Menuru
          </span>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
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
              Online - Connected to Firebase
            </span>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            style={{
              fontSize: '1rem',
              color: '#888',
              marginTop: '0.5rem',
              fontStyle: 'italic',
              maxWidth: '600px'
            }}
          >
            Asisten chatbot dari Note - Semua pertanyaan user dikirim ke {TARGET_EMAIL} melalui Firebase
          </motion.div>
          <div style={{
            fontSize: '0.8rem',
            color: '#666',
            marginTop: '0.25rem'
          }}>
            User ID: {userId ? userId.substring(0, 12) + '...' : 'Connecting...'}
          </div>
        </div>
      </motion.div>

      {/* Chat Container - DIPERBESAR */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{
          width: '100%',
          maxWidth: '1200px',
          height: '650px', // DIPERBESAR
          margin: '1rem auto',
          backgroundColor: '#111',
          borderRadius: '25px',
          padding: '2.5rem',
          border: '1px solid #333',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Messages Area - DIPERBESAR */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          marginBottom: '1.5rem',
          paddingRight: '1rem'
        }}>
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: '#666',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👋</div>
              <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                Selamat datang di Chatbot Menuru
              </div>
              <div style={{ fontSize: '0.9rem' }}>
                Mulai percakapan dengan mengetik pesan di bawah
              </div>
            </motion.div>
          ) : (
            messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: '1.5rem'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  flexDirection: message.sender === 'user' ? 'row-reverse' : 'row'
                }}>
                  <div style={{
                    width: '45px',
                    height: '45px',
                    borderRadius: '50%',
                    backgroundColor: message.sender === 'user' ? '#3a3a3a' : '#2a2a2a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    border: '2px solid #444'
                  }}>
                    {message.sender === 'user' ? 'YOU' : 'AI'}
                  </div>
                  <div style={{
                    maxWidth: '75%',
                    backgroundColor: message.sender === 'user' ? '#2563eb' : '#333',
                    padding: '1rem 1.25rem',
                    borderRadius: '20px',
                    borderTopLeftRadius: message.sender === 'user' ? '20px' : '8px',
                    borderTopRightRadius: message.sender === 'user' ? '8px' : '20px',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
                  }}>
                    <div style={{ 
                      fontSize: '1.05rem', // DIPERBESAR
                      lineHeight: '1.5',
                      wordBreak: 'break-word'
                    }}>
                      {message.text}
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '0.75rem'
                    }}>
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#aaa'
                      }}>
                        {message.userEmail ? message.userEmail.substring(0, 20) + '...' : 'Anonymous'}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#aaa',
                        textAlign: 'right'
                      }}>
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
                gap: '0.75rem',
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
                fontSize: '0.9rem',
                fontWeight: 'bold',
                border: '2px solid #444'
              }}>
                AI
              </div>
              <div style={{
                backgroundColor: '#333',
                padding: '1rem 1.25rem',
                borderRadius: '20px',
                borderTopLeftRadius: '8px'
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
                    Menuru sedang mengetik...
                  </span>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area - DIPERBESAR */}
        <div style={{
          display: 'flex',
          gap: '1.5rem',
          alignItems: 'flex-end',
          borderTop: '1px solid #333',
          paddingTop: '1.5rem'
        }}>
          <div style={{
            flex: 1,
            backgroundColor: '#222',
            borderRadius: '30px',
            padding: '1rem 2rem',
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
              placeholder="Ketik pesan Anda di sini... Semua pesan akan dikirim ke faridardiansyah061@gmail.com"
              style={{
                width: '100%',
                backgroundColor: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '1.05rem', // DIPERBESAR
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
              borderRadius: '50%',
              width: '60px',
              height: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: inputText.trim() === '' ? 'not-allowed' : 'pointer',
              opacity: inputText.trim() === '' ? 0.6 : 1,
              transition: 'all 0.3s'
            }}
          >
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="3"
            >
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </motion.button>
        </div>
      </motion.div>

      {/* Firebase Status */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        style={{
          marginTop: '1.5rem',
          padding: '1rem 2rem',
          backgroundColor: '#111',
          borderRadius: '15px',
          border: '1px solid #333',
          fontSize: '0.9rem',
          color: '#888',
          textAlign: 'center',
          maxWidth: '1200px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#4CAF50'
          }}></div>
          <span>Firebase Connected • Semua percakapan tersimpan di cloud • Email target: </span>
          <span style={{ color: '#2563eb', fontWeight: '500' }}>{TARGET_EMAIL}</span>
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
