'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  where, 
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc
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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const CHATBOT_EMAIL = 'faridardiansyah061@gmail.com';
const CHATBOT_NAME = 'Menuru (Chatbot)';
const CHATBOT_ID = 'chatbot_account_001';

export default function AdminChatDashboard() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('unreplied'); // 'all', 'unreplied', 'replied'
  const [stats, setStats] = useState({
    total: 0,
    unreplied: 0,
    replied: 0
  });

  // Cek apakah user adalah admin
  useEffect(() => {
    const checkAdmin = async () => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user && user.email === CHATBOT_EMAIL) {
          // User adalah admin (faridardiansyah061@gmail.com)
          setAdminUser({
            uid: user.uid,
            email: user.email,
            name: CHATBOT_NAME
          });
          
          // Load semua percakapan
          loadConversations();
          
          // Setup real-time listener untuk percakapan baru
          setupRealtimeListeners();
          
          setIsLoading(false);
        } else {
          // Bukan admin, redirect ke login
          router.push('/sign-in?redirect=/admin/chat');
        }
      });
      
      return () => unsubscribe();
    };
    
    checkAdmin();
  }, [router]);

  // Load semua percakapan dari berbagai user
  const loadConversations = async () => {
    try {
      // Ambil semua user yang pernah chat
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      const users = usersSnapshot.docs
        .filter(doc => doc.data().email !== CHATBOT_EMAIL)
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      
      // Untuk setiap user, ambil percakapan terakhir
      const conversationsData = [];
      
      for (const user of users) {
        // Ambil pesan terakhir dari user ini
        const messagesRef = collection(db, 'chats');
        const q = query(
          messagesRef,
          where('senderId', '==', user.id),
          orderBy('timestamp', 'desc'),
          where('receiverId', '==', CHATBOT_ID)
        );
        
        const messagesSnapshot = await getDocs(q);
        
        if (!messagesSnapshot.empty) {
          const lastMessage = messagesSnapshot.docs[0].data();
          const totalMessages = messagesSnapshot.size;
          
          // Cek apakah ada balasan dari chatbot
          const replyQuery = query(
            messagesRef,
            where('senderId', '==', CHATBOT_ID),
            where('receiverId', '==', user.id),
            orderBy('timestamp', 'desc')
          );
          
          const replySnapshot = await getDocs(replyQuery);
          const hasReply = !replySnapshot.empty;
          const lastReply = hasReply ? replySnapshot.docs[0].data() : null;
          
          conversationsData.push({
            userId: user.id,
            userEmail: user.email || 'unknown@user.com',
            userName: user.name || 'Anonymous User',
            lastMessage: lastMessage.text,
            lastMessageTime: lastMessage.timestamp,
            messageCount: totalMessages,
            hasReply: hasReply,
            lastReplyTime: hasReply ? lastReply.timestamp : null,
            unread: !hasReply // Tandai sebagai belum dibaca jika belum ada balasan
          });
        }
      }
      
      // Urutkan berdasarkan waktu pesan terakhir (terbaru di atas)
      conversationsData.sort((a, b) => 
        new Date(b.lastMessageTime?.toDate?.() || b.lastMessageTime) - 
        new Date(a.lastMessageTime?.toDate?.() || a.lastMessageTime)
      );
      
      setConversations(conversationsData);
      calculateStats(conversationsData);
      
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  // Setup real-time listeners
  const setupRealtimeListeners = () => {
    // Listen untuk pesan baru dari user ke chatbot
    const messagesRef = collection(db, 'chats');
    const q = query(
      messagesRef,
      where('receiverId', '==', CHATBOT_ID),
      orderBy('timestamp', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Update conversations ketika ada pesan baru
      loadConversations();
      
      // Jika ada conversation yang sedang dilihat, update messages juga
      if (selectedConversation) {
        loadMessages(selectedConversation.userId);
      }
    });
    
    return unsubscribe;
  };

  // Hitung statistik
  const calculateStats = (convs) => {
    const total = convs.length;
    const unreplied = convs.filter(c => !c.hasReply).length;
    const replied = convs.filter(c => c.hasReply).length;
    
    setStats({ total, unreplied, replied });
  };

  // Filter conversations berdasarkan tab aktif
  const getFilteredConversations = () => {
    switch (activeTab) {
      case 'unreplied':
        return conversations.filter(c => !c.hasReply);
      case 'replied':
        return conversations.filter(c => c.hasReply);
      default:
        return conversations;
    }
  };

  // Load messages untuk conversation tertentu
  const loadMessages = async (userId) => {
    try {
      const messagesRef = collection(db, 'chats');
      const q = query(
        messagesRef,
        where('senderId', 'in', [userId, CHATBOT_ID]),
        where('receiverId', 'in', [userId, CHATBOT_ID]),
        orderBy('timestamp', 'asc')
      );
      
      const snapshot = await getDocs(q);
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setMessages(messagesData);
      
      // Tandai sebagai sudah dibaca
      const conversation = conversations.find(c => c.userId === userId);
      if (conversation && conversation.unread) {
        updateConversationReadStatus(userId);
      }
      
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  // Update status baca conversation
  const updateConversationReadStatus = async (userId) => {
    // Di implementasi nyata, Anda bisa menambahkan field 'read' di conversation
    // Untuk sekarang, kita update state lokal saja
    setConversations(prev => prev.map(conv => 
      conv.userId === userId ? { ...conv, unread: false } : conv
    ));
  };

  // Handle pilih conversation
  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    loadMessages(conversation.userId);
    setReplyText('');
  };

  // Kirim balasan sebagai chatbot
  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedConversation) return;
    
    try {
      // Simpan pesan balasan
      const replyMessage = {
        text: replyText,
        senderId: CHATBOT_ID,
        senderEmail: CHATBOT_EMAIL,
        senderName: CHATBOT_NAME,
        receiverId: selectedConversation.userId,
        receiverEmail: selectedConversation.userEmail,
        timestamp: new Date(),
        type: 'admin_reply',
        isFromAdmin: true
      };
      
      await addDoc(collection(db, 'chats'), {
        ...replyMessage,
        timestamp: serverTimestamp()
      });
      
      // Tambahkan ke messages state
      setMessages(prev => [...prev, {
        ...replyMessage,
        id: `temp-${Date.now()}`
      }]);
      
      // Update conversation status
      setConversations(prev => prev.map(conv => 
        conv.userId === selectedConversation.userId 
          ? { ...conv, hasReply: true, lastReplyTime: new Date(), unread: false }
          : conv
      ));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        unreplied: Math.max(0, prev.unreplied - 1),
        replied: prev.replied + 1
      }));
      
      // Reset input
      setReplyText('');
      
      // Tampilkan notifikasi sukses
      alert('✅ Balasan berhasil dikirim ke user!');
      
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('❌ Gagal mengirim balasan: ' + error.message);
    }
  };

  // Format waktu
  const formatTime = (date) => {
    if (!date) return '';
    if (date.toDate) {
      date = date.toDate();
    }
    const now = new Date();
    const messageDate = new Date(date);
    
    // Jika hari ini
    if (messageDate.toDateString() === now.toDateString()) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Jika kemarin
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Kemarin';
    }
    
    // Format tanggal biasa
    return messageDate.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short'
    });
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/sign-in');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Loading state
  if (isLoading) {
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
            width: '60px',
            height: '60px',
            border: '4px solid #333',
            borderTopColor: '#2563eb',
            borderRadius: '50%',
            marginBottom: '1.5rem'
          }}
        />
        <div style={{ fontSize: '1.2rem', color: '#666' }}>
          Verifying Admin Access...
        </div>
        <div style={{ fontSize: '0.9rem', color: '#444', marginTop: '0.5rem' }}>
          Checking: {CHATBOT_EMAIL}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      color: 'white',
      fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif"
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#111',
        borderBottom: '1px solid #333',
        padding: '1.5rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            fontWeight: 'bold'
          }}>
            A
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '600', margin: 0 }}>
              Chatbot Admin Dashboard
            </h1>
            <div style={{ fontSize: '0.9rem', color: '#888', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#4CAF50'
              }}></div>
              Logged in as: {adminUser?.email}
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            backgroundColor: '#222',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            fontSize: '0.9rem'
          }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#888' }}>Total</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>{stats.total}</div>
              </div>
              <div style={{ borderLeft: '1px solid #333', paddingLeft: '1rem' }}>
                <div style={{ fontSize: '0.8rem', color: '#888' }}>Unreplied</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#ef4444' }}>{stats.unreplied}</div>
              </div>
              <div style={{ borderLeft: '1px solid #333', paddingLeft: '1rem' }}>
                <div style={{ fontSize: '0.8rem', color: '#888' }}>Replied</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#4CAF50' }}>{stats.replied}</div>
              </div>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            style={{
              backgroundColor: '#222',
              color: 'white',
              border: '1px solid #444',
              padding: '0.6rem 1.2rem',
              borderRadius: '20px',
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
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        display: 'flex',
        height: 'calc(100vh - 80px)'
      }}>
        {/* Left Panel - Conversations List */}
        <div style={{
          width: '400px',
          backgroundColor: '#111',
          borderRight: '1px solid #333',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Tabs */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid #333',
            backgroundColor: '#151515'
          }}>
            {[
              { id: 'all', label: 'All', count: stats.total },
              { id: 'unreplied', label: 'Unreplied', count: stats.unreplied },
              { id: 'replied', label: 'Replied', count: stats.replied }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  padding: '1rem',
                  backgroundColor: activeTab === tab.id ? '#222' : 'transparent',
                  color: activeTab === tab.id ? 'white' : '#888',
                  border: 'none',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  borderBottom: activeTab === tab.id ? '2px solid #2563eb' : 'none'
                }}
              >
                {tab.label}
                <span style={{
                  backgroundColor: activeTab === tab.id ? '#2563eb' : '#444',
                  color: 'white',
                  padding: '0.1rem 0.5rem',
                  borderRadius: '10px',
                  fontSize: '0.8rem'
                }}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
          
          {/* Search/Filter */}
          <div style={{ padding: '1rem', borderBottom: '1px solid #333' }}>
            <div style={{
              backgroundColor: '#222',
              borderRadius: '20px',
              padding: '0.7rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Search conversations..."
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'white',
                  fontSize: '0.9rem',
                  width: '100%',
                  outline: 'none'
                }}
              />
            </div>
          </div>
          
          {/* Conversations List */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0.5rem'
          }}>
            {getFilteredConversations().length === 0 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: '#444',
                textAlign: 'center',
                padding: '2rem'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
                <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                  {activeTab === 'unreplied' ? 'No unreplied conversations' : 
                   activeTab === 'replied' ? 'No replied conversations' : 
                   'No conversations yet'}
                </div>
                <div style={{ fontSize: '0.9rem', color: '#555' }}>
                  User messages will appear here
                </div>
              </div>
            ) : (
              getFilteredConversations().map((conv) => (
                <motion.div
                  key={conv.userId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ backgroundColor: '#1a1a1a' }}
                  onClick={() => handleSelectConversation(conv)}
                  style={{
                    backgroundColor: selectedConversation?.userId === conv.userId ? '#1a1a1a' : 'transparent',
                    border: selectedConversation?.userId === conv.userId ? '1px solid #333' : '1px solid transparent',
                    borderRadius: '15px',
                    padding: '1rem',
                    marginBottom: '0.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: conv.hasReply ? '#4CAF50' : '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        flexShrink: 0
                      }}>
                        {conv.userName.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '0.25rem'
                        }}>
                          <div style={{ 
                            fontSize: '0.95rem', 
                            fontWeight: '600',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {conv.userName}
                          </div>
                          {conv.unread && (
                            <div style={{
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              backgroundColor: '#2563eb'
                            }}></div>
                          )}
                        </div>
                        <div style={{ 
                          fontSize: '0.85rem', 
                          color: '#aaa',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          marginBottom: '0.25rem'
                        }}>
                          {conv.userEmail}
                        </div>
                        <div style={{ 
                          fontSize: '0.85rem', 
                          color: conv.hasReply ? '#888' : '#ddd',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {conv.lastMessage.length > 40 ? conv.lastMessage.substring(0, 40) + '...' : conv.lastMessage}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ 
                      fontSize: '0.75rem', 
                      color: '#666',
                      textAlign: 'right',
                      flexShrink: 0,
                      marginLeft: '0.5rem'
                    }}>
                      {formatTime(conv.lastMessageTime)}
                      <div style={{ 
                        fontSize: '0.7rem', 
                        color: conv.hasReply ? '#4CAF50' : '#ef4444',
                        marginTop: '0.25rem'
                      }}>
                        {conv.hasReply ? 'Replied' : 'Waiting'}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '0.75rem',
                    fontSize: '0.75rem',
                    color: '#666'
                  }}>
                    <div>
                      Messages: <span style={{ color: '#888', fontWeight: '500' }}>{conv.messageCount}</span>
                    </div>
                    <div>
                      {conv.hasReply ? (
                        <span style={{ color: '#4CAF50', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          Replied
                        </span>
                      ) : (
                        <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                          </svg>
                          Needs reply
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel - Chat Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div style={{
                backgroundColor: '#111',
                borderBottom: '1px solid #333',
                padding: '1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    backgroundColor: selectedConversation.hasReply ? '#4CAF50' : '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    fontWeight: 'bold'
                  }}>
                    {selectedConversation.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>
                      {selectedConversation.userName}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#888' }}>
                      {selectedConversation.userEmail}
                    </div>
                  </div>
                </div>
                
                <div style={{ 
                  fontSize: '0.9rem', 
                  color: selectedConversation.hasReply ? '#4CAF50' : '#ef4444',
                  backgroundColor: '#222',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  {selectedConversation.hasReply ? (
                    <>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#4CAF50'
                      }}></div>
                      Replied • {selectedConversation.messageCount} messages
                    </>
                  ) : (
                    <>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#ef4444'
                      }}></div>
                      Waiting for reply • {selectedConversation.messageCount} messages
                    </>
                  )}
                </div>
              </div>
              
              {/* Messages Area */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1.5rem',
                backgroundColor: '#0a0a0a'
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
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📨</div>
                    <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                      Loading conversation...
                    </div>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        marginBottom: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: msg.senderId === CHATBOT_ID ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <div style={{
                        maxWidth: '70%',
                        backgroundColor: msg.senderId === CHATBOT_ID ? '#2563eb' : '#222',
                        padding: '0.8rem 1.2rem',
                        borderRadius: '18px',
                        borderTopLeftRadius: msg.senderId === CHATBOT_ID ? '18px' : '5px',
                        borderTopRightRadius: msg.senderId === CHATBOT_ID ? '5px' : '18px'
                      }}>
                        <div style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                          {msg.text}
                        </div>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '0.75rem',
                          color: msg.senderId === CHATBOT_ID ? 'rgba(255,255,255,0.8)' : '#888'
                        }}>
                          <div>
                            <strong>{msg.senderId === CHATBOT_ID ? 'You (Admin)' : selectedConversation.userName}</strong>
                          </div>
                          <div>
                            {formatTime(msg.timestamp)}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
              
              {/* Reply Input */}
              <div style={{
                backgroundColor: '#111',
                borderTop: '1px solid #333',
                padding: '1.5rem'
              }}>
                <div style={{ 
                  fontSize: '0.9rem', 
                  color: '#888',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                  Reply as {CHATBOT_NAME}
                </div>
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'flex-end'
                }}>
                  <div style={{
                    flex: 1,
                    backgroundColor: '#222',
                    borderRadius: '20px',
                    padding: '1rem 1.5rem',
                    border: '2px solid #444',
                    minHeight: '60px',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Type your reply to ${selectedConversation.userName}...`}
                      style={{
                        width: '100%',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: 'white',
                        fontSize: '1rem',
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
                    whileHover={{ scale: 1.05, backgroundColor: '#1d4ed8' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSendReply}
                    disabled={!replyText.trim()}
                    style={{
                      backgroundColor: replyText.trim() ? '#2563eb' : '#333',
                      color: 'white',
                      border: 'none',
                      borderRadius: '20px',
                      padding: '1rem 2rem',
                      fontSize: '1rem',
                      fontWeight: '500',
                      cursor: replyText.trim() ? 'pointer' : 'not-allowed',
                      opacity: replyText.trim() ? 1 : 0.6,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                    Send Reply
                  </motion.button>
                </div>
              </div>
            </>
          ) : (
            /* Empty State - No conversation selected */
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#444',
              textAlign: 'center',
              padding: '2rem'
            }}>
              <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>👑</div>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#666' }}>
                Admin Dashboard
              </div>
              <div style={{ fontSize: '1rem', color: '#555', maxWidth: '500px', lineHeight: '1.6' }}>
                Select a conversation from the left panel to view messages and reply to users.
                <br />
                You can see all user conversations and respond as <strong>{CHATBOT_NAME}</strong>.
              </div>
              <div style={{
                backgroundColor: '#111',
                padding: '1.5rem',
                borderRadius: '15px',
                marginTop: '2rem',
                textAlign: 'left',
                maxWidth: '500px',
                border: '1px solid #333'
              }}>
                <div style={{ fontSize: '0.9rem', color: '#888', marginBottom: '0.5rem' }}>Quick Stats:</div>
                <div style={{ display: 'flex', gap: '2rem' }}>
                  <div>
                    <div style={{ fontSize: '2rem', fontWeight: '600' }}>{stats.total}</div>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>Total Conversations</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '2rem', fontWeight: '600', color: '#ef4444' }}>{stats.unreplied}</div>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>Needs Reply</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '2rem', fontWeight: '600', color: '#4CAF50' }}>{stats.replied}</div>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>Replied</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add CSS for scrollbar */}
      <style jsx>{`
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #222;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #444;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
}
