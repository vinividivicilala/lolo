'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  addDoc,
  serverTimestamp,
  getDocs,
  doc,
  getDoc
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyD_htQZ1TClnXKZGRJ4izbMQ02y6V3aNAQ",
  authDomain: "wawa44-58d1e.firebaseapp.com",
  projectId: "wawa44-58d1e",
  storageBucket: "wawa44-58d1e.firebasestorage.app",
  messagingSenderId: "836899520599",
  appId: "1:836899520599:web:b346e4370ecfa9bb89e312"
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

export default function AdminChatDashboard() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, unreplied: 0, replied: 0 });
  const [allUsers, setAllUsers] = useState({});

  // Cek admin dan load data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && firebaseUser.email === CHATBOT_EMAIL) {
        console.log('✅ Admin logged in:', firebaseUser.email);
        
        setAdminUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: CHATBOT_NAME
        });
        
        // Load semua user terlebih dahulu
        await loadAllUsers();
        
        // Load semua percakapan
        loadAllConversations();
        
        // Setup real-time listener
        setupRealtimeListener();
        
        setIsLoading(false);
      } else {
        console.log('❌ Not admin, redirecting...');
        router.push('/sign-in?redirect=/admin/chat');
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Load semua user dari collection 'users'
  const loadAllUsers = async () => {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      const usersMap = {};
      
      snapshot.forEach(doc => {
        usersMap[doc.id] = { id: doc.id, ...doc.data() };
      });
      
      console.log('📋 Users loaded:', Object.keys(usersMap).length);
      setAllUsers(usersMap);
      
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  // Load SEMUA percakapan dengan query yang benar
  const loadAllConversations = async () => {
    try {
      console.log('🔄 Loading all conversations...');
      
      // Query untuk mengambil SEMUA pesan yang dikirim KE chatbot
      const messagesRef = collection(db, 'chats');
      const q = query(
        messagesRef,
        where('receiverId', '==', CHATBOT_ID),
        orderBy('timestamp', 'desc')
      );
      
      const snapshot = await getDocs(q);
      console.log('📨 Total messages to chatbot:', snapshot.size);
      
      // Group messages by user
      const conversationsByUser = {};
      
      snapshot.forEach(doc => {
        const message = {
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate?.() || new Date()
        };
        
        const userId = message.senderId;
        
        if (!conversationsByUser[userId]) {
          conversationsByUser[userId] = {
            userId: userId,
            userEmail: message.senderEmail || 'unknown@user.com',
            userName: message.senderName || 'Unknown User',
            lastMessage: message.text,
            lastMessageTime: message.timestamp,
            messageCount: 1,
            messages: [message],
            hasReply: false,
            unread: true
          };
        } else {
          conversationsByUser[userId].messageCount += 1;
          conversationsByUser[userId].messages.push(message);
          
          // Update last message if newer
          if (message.timestamp > conversationsByUser[userId].lastMessageTime) {
            conversationsByUser[userId].lastMessage = message.text;
            conversationsByUser[userId].lastMessageTime = message.timestamp;
          }
        }
      });
      
      // Check for replies from chatbot
      for (const userId in conversationsByUser) {
        const replyQuery = query(
          messagesRef,
          where('senderId', '==', CHATBOT_ID),
          where('receiverId', '==', userId),
          orderBy('timestamp', 'desc')
        );
        
        const replySnapshot = await getDocs(replyQuery);
        conversationsByUser[userId].hasReply = !replySnapshot.empty;
        
        if (!replySnapshot.empty) {
          const lastReply = replySnapshot.docs[0].data();
          conversationsByUser[userId].lastReplyTime = lastReply.timestamp?.toDate?.() || new Date();
          conversationsByUser[userId].unread = false;
        }
      }
      
      // Convert to array and sort
      const conversationsArray = Object.values(conversationsByUser);
      conversationsArray.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
      
      console.log('💬 Conversations loaded:', conversationsArray.length);
      setConversations(conversationsArray);
      updateStats(conversationsArray);
      
    } catch (error) {
      console.error('❌ Error loading conversations:', error);
    }
  };

  // Setup real-time listener untuk pesan baru
  const setupRealtimeListener = () => {
    const messagesRef = collection(db, 'chats');
    const q = query(
      messagesRef,
      where('receiverId', '==', CHATBOT_ID),
      orderBy('timestamp', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      console.log('🔄 Real-time update:', snapshot.size, 'messages');
      loadAllConversations();
    });
  };

  // Update statistics
  const updateStats = (convs) => {
    const total = convs.length;
    const unreplied = convs.filter(c => !c.hasReply).length;
    const replied = convs.filter(c => c.hasReply).length;
    
    setStats({ total, unreplied, replied });
  };

  // Load messages untuk user tertentu
  const loadUserMessages = async (userId) => {
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
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.() || new Date()
      }));
      
      console.log(`📩 Messages for user ${userId}:`, messagesData.length);
      setMessages(messagesData);
      
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  // Handle select conversation
  const handleSelectConversation = (conversation) => {
    console.log('👤 Selected conversation:', conversation.userId);
    setSelectedConversation(conversation);
    loadUserMessages(conversation.userId);
    setReplyText('');
  };

  // Send reply as chatbot
  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedConversation) return;
    
    try {
      const replyMessage = {
        text: replyText,
        senderId: CHATBOT_ID,
        senderEmail: CHATBOT_EMAIL,
        senderName: CHATBOT_NAME,
        receiverId: selectedConversation.userId,
        receiverEmail: selectedConversation.userEmail,
        timestamp: new Date(),
        type: 'admin_reply'
      };
      
      await addDoc(collection(db, 'chats'), {
        ...replyMessage,
        timestamp: serverTimestamp()
      });
      
      console.log('✅ Reply sent to user:', selectedConversation.userId);
      
      // Update local state
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
      
      setReplyText('');
      alert('✅ Balasan berhasil dikirim!');
      
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('❌ Gagal mengirim balasan: ' + error.message);
    }
  };

  // Format time
  const formatTime = (date) => {
    if (!date) return '';
    const now = new Date();
    const messageDate = new Date(date);
    
    if (messageDate.toDateString() === now.toDateString()) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Kemarin ' + messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    return messageDate.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle logout
  const handleLogout = async () => {
    await signOut(auth);
    router.push('/sign-in');
  };

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={styles.spinner}
        />
        <div style={styles.loadingText}>Loading Admin Dashboard...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.adminBadge}>A</div>
          <div>
            <h1 style={styles.title}>Chatbot Admin Dashboard</h1>
            <div style={styles.subtitle}>
              <div style={styles.statusDot}></div>
              Logged in as: {adminUser?.email}
            </div>
          </div>
        </div>
        
        <div style={styles.statsContainer}>
          <div style={styles.statBox}>
            <div style={styles.statLabel}>Total</div>
            <div style={styles.statValue}>{stats.total}</div>
          </div>
          <div style={styles.statBox}>
            <div style={styles.statLabel}>Unreplied</div>
            <div style={{...styles.statValue, color: '#ef4444'}}>{stats.unreplied}</div>
          </div>
          <div style={styles.statBox}>
            <div style={styles.statLabel}>Replied</div>
            <div style={{...styles.statValue, color: '#10b981'}}>{stats.replied}</div>
          </div>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Left Panel - Conversations */}
        <div style={styles.leftPanel}>
          <div style={styles.panelHeader}>
            <h2 style={styles.panelTitle}>All Conversations</h2>
            <div style={styles.countBadge}>{conversations.length}</div>
          </div>
          
          <div style={styles.searchBox}>
            <input 
              type="text" 
              placeholder="Search users..."
              style={styles.searchInput}
            />
          </div>
          
          <div style={styles.conversationsList}>
            {conversations.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>💬</div>
                <div style={styles.emptyText}>No conversations yet</div>
                <div style={styles.emptySubtext}>User messages will appear here</div>
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.userId}
                  onClick={() => handleSelectConversation(conv)}
                  style={{
                    ...styles.conversationItem,
                    backgroundColor: selectedConversation?.userId === conv.userId ? '#1a1a1a' : 'transparent',
                    border: selectedConversation?.userId === conv.userId ? '1px solid #333' : '1px solid transparent'
                  }}
                >
                  <div style={styles.convHeader}>
                    <div style={styles.convAvatar}>
                      {conv.userName.charAt(0).toUpperCase()}
                    </div>
                    <div style={styles.convInfo}>
                      <div style={styles.convName}>{conv.userName}</div>
                      <div style={styles.convEmail}>{conv.userEmail}</div>
                    </div>
                    <div style={styles.convTime}>
                      {formatTime(conv.lastMessageTime)}
                    </div>
                  </div>
                  
                  <div style={styles.convMessage}>
                    {conv.lastMessage.length > 50 
                      ? conv.lastMessage.substring(0, 50) + '...' 
                      : conv.lastMessage}
                  </div>
                  
                  <div style={styles.convFooter}>
                    <div style={styles.messageCount}>
                      {conv.messageCount} message{conv.messageCount > 1 ? 's' : ''}
                    </div>
                    <div style={{
                      ...styles.statusBadge,
                      backgroundColor: conv.hasReply ? '#10b98120' : '#ef444420',
                      color: conv.hasReply ? '#10b981' : '#ef4444'
                    }}>
                      {conv.hasReply ? 'Replied' : 'Needs Reply'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel - Chat */}
        <div style={styles.rightPanel}>
          {selectedConversation ? (
            <>
              <div style={styles.chatHeader}>
                <div style={styles.chatUserInfo}>
                  <div style={{
                    ...styles.chatAvatar,
                    backgroundColor: selectedConversation.hasReply ? '#10b981' : '#ef4444'
                  }}>
                    {selectedConversation.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={styles.chatUserName}>{selectedConversation.userName}</div>
                    <div style={styles.chatUserEmail}>{selectedConversation.userEmail}</div>
                  </div>
                </div>
                <div style={styles.chatStats}>
                  <div style={styles.chatStat}>
                    <strong>{selectedConversation.messageCount}</strong> messages
                  </div>
                  <div style={{
                    ...styles.chatStatus,
                    color: selectedConversation.hasReply ? '#10b981' : '#ef4444'
                  }}>
                    {selectedConversation.hasReply ? '✓ Replied' : '● Waiting reply'}
                  </div>
                </div>
              </div>
              
              <div style={styles.messagesContainer}>
                {messages.length === 0 ? (
                  <div style={styles.noMessages}>No messages found</div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      style={{
                        ...styles.messageBubble,
                        alignSelf: msg.senderId === CHATBOT_ID ? 'flex-end' : 'flex-start',
                        backgroundColor: msg.senderId === CHATBOT_ID ? '#2563eb' : '#222'
                      }}
                    >
                      <div style={styles.messageText}>{msg.text}</div>
                      <div style={styles.messageMeta}>
                        <span style={styles.messageSender}>
                          {msg.senderId === CHATBOT_ID ? 'You (Admin)' : selectedConversation.userName}
                        </span>
                        <span style={styles.messageTime}>
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div style={styles.replySection}>
                <div style={styles.replyHeader}>
                  Reply as {CHATBOT_NAME}
                </div>
                <div style={styles.replyInputContainer}>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Type your reply to ${selectedConversation.userName}...`}
                    style={styles.replyTextarea}
                    rows="3"
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={!replyText.trim()}
                    style={{
                      ...styles.sendButton,
                      opacity: replyText.trim() ? 1 : 0.5,
                      cursor: replyText.trim() ? 'pointer' : 'not-allowed'
                    }}
                  >
                    Send Reply
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div style={styles.emptyChat}>
              <div style={styles.emptyChatIcon}>👑</div>
              <div style={styles.emptyChatTitle}>Admin Dashboard</div>
              <div style={styles.emptyChatText}>
                Select a conversation from the left panel to view messages and reply to users.
              </div>
              <div style={styles.emptyChatStats}>
                <div style={styles.emptyStat}>
                  <div style={styles.emptyStatValue}>{stats.total}</div>
                  <div style={styles.emptyStatLabel}>Total Conversations</div>
                </div>
                <div style={styles.emptyStat}>
                  <div style={{...styles.emptyStatValue, color: '#ef4444'}}>{stats.unreplied}</div>
                  <div style={styles.emptyStatLabel}>Needs Reply</div>
                </div>
                <div style={styles.emptyStat}>
                  <div style={{...styles.emptyStatValue, color: '#10b981'}}>{stats.replied}</div>
                  <div style={styles.emptyStatLabel}>Replied</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0a0a0a',
    color: 'white',
    fontFamily: "'Inter', sans-serif"
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh'
  },
  spinner: {
    width: '60px',
    height: '60px',
    border: '4px solid #333',
    borderTopColor: '#2563eb',
    borderRadius: '50%',
    marginBottom: '20px'
  },
  loadingText: {
    fontSize: '1.2rem',
    color: '#666'
  },
  header: {
    backgroundColor: '#111',
    padding: '20px 30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #333'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  adminBadge: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: '#2563eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: 'bold'
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '600',
    margin: 0
  },
  subtitle: {
    fontSize: '0.9rem',
    color: '#888',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '5px'
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#10b981'
  },
  statsContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  statBox: {
    textAlign: 'center',
    padding: '0 15px'
  },
  statLabel: {
    fontSize: '0.8rem',
    color: '#888',
    marginBottom: '5px'
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: '600'
  },
  logoutButton: {
    backgroundColor: '#333',
    color: 'white',
    border: '1px solid #555',
    padding: '10px 20px',
    borderRadius: '25px',
    cursor: 'pointer',
    marginLeft: '10px'
  },
  mainContent: {
    display: 'flex',
    height: 'calc(100vh - 100px)'
  },
  leftPanel: {
    width: '400px',
    backgroundColor: '#111',
    borderRight: '1px solid #333',
    display: 'flex',
    flexDirection: 'column'
  },
  panelHeader: {
    padding: '20px',
    borderBottom: '1px solid #333',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  panelTitle: {
    fontSize: '1.2rem',
    fontWeight: '500',
    margin: 0
  },
  countBadge: {
    backgroundColor: '#2563eb',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.9rem',
    fontWeight: '500'
  },
  searchBox: {
    padding: '15px 20px',
    borderBottom: '1px solid #333'
  },
  searchInput: {
    width: '100%',
    backgroundColor: '#222',
    border: '1px solid #444',
    color: 'white',
    padding: '10px 15px',
    borderRadius: '25px',
    fontSize: '0.9rem',
    outline: 'none'
  },
  conversationsList: {
    flex: 1,
    overflowY: 'auto',
    padding: '10px'
  },
  conversationItem: {
    backgroundColor: '#1a1a1a',
    borderRadius: '12px',
    padding: '15px',
    marginBottom: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: '1px solid transparent'
  },
  convHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px'
  },
  convAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#2563eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '1rem',
    flexShrink: 0
  },
  convInfo: {
    flex: 1,
    minWidth: 0
  },
  convName: {
    fontWeight: '500',
    fontSize: '0.95rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  convEmail: {
    fontSize: '0.8rem',
    color: '#888',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  convTime: {
    fontSize: '0.75rem',
    color: '#666',
    flexShrink: 0
  },
  convMessage: {
    fontSize: '0.9rem',
    color: '#ccc',
    marginBottom: '10px',
    lineHeight: '1.4'
  },
  convFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  messageCount: {
    fontSize: '0.75rem',
    color: '#888'
  },
  statusBadge: {
    fontSize: '0.75rem',
    padding: '4px 10px',
    borderRadius: '12px',
    fontWeight: '500'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: '40px',
    color: '#555',
    textAlign: 'center'
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '15px'
  },
  emptyText: {
    fontSize: '1.1rem',
    marginBottom: '5px'
  },
  emptySubtext: {
    fontSize: '0.9rem'
  },
  rightPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  chatHeader: {
    padding: '20px 30px',
    borderBottom: '1px solid #333',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#111'
  },
  chatUserInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  chatAvatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '1.2rem'
  },
  chatUserName: {
    fontSize: '1.2rem',
    fontWeight: '500'
  },
  chatUserEmail: {
    fontSize: '0.9rem',
    color: '#888',
    marginTop: '3px'
  },
  chatStats: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  chatStat: {
    fontSize: '0.9rem',
    color: '#888'
  },
  chatStatus: {
    fontSize: '0.9rem',
    fontWeight: '500'
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px 30px',
    backgroundColor: '#0a0a0a'
  },
  messageBubble: {
    maxWidth: '70%',
    padding: '12px 18px',
    borderRadius: '18px',
    marginBottom: '15px',
    borderTopLeftRadius: '5px'
  },
  messageText: {
    fontSize: '0.95rem',
    lineHeight: '1.4',
    marginBottom: '8px'
  },
  messageMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.7)'
  },
  messageSender: {
    fontWeight: '500'
  },
  messageTime: {
    marginLeft: '10px'
  },
  noMessages: {
    textAlign: 'center',
    color: '#555',
    padding: '40px',
    fontSize: '1.1rem'
  },
  replySection: {
    borderTop: '1px solid #333',
    padding: '20px 30px',
    backgroundColor: '#111'
  },
  replyHeader: {
    fontSize: '0.9rem',
    color: '#888',
    marginBottom: '10px'
  },
  replyInputContainer: {
    display: 'flex',
    gap: '15px',
    alignItems: 'flex-end'
  },
  replyTextarea: {
    flex: 1,
    backgroundColor: '#222',
    border: '1px solid #444',
    color: 'white',
    padding: '15px',
    borderRadius: '12px',
    fontSize: '0.95rem',
    resize: 'none',
    outline: 'none',
    fontFamily: 'inherit',
    minHeight: '80px'
  },
  sendButton: {
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    padding: '12px 25px',
    borderRadius: '25px',
    fontSize: '0.95rem',
    fontWeight: '500',
    cursor: 'pointer',
    height: '50px'
  },
  emptyChat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#555',
    textAlign: 'center',
    padding: '40px'
  },
  emptyChatIcon: {
    fontSize: '4rem',
    marginBottom: '20px'
  },
  emptyChatTitle: {
    fontSize: '1.5rem',
    marginBottom: '10px',
    color: '#666'
  },
  emptyChatText: {
    fontSize: '1rem',
    maxWidth: '500px',
    lineHeight: '1.5',
    marginBottom: '30px'
  },
  emptyChatStats: {
    display: 'flex',
    gap: '30px'
  },
  emptyStat: {
    textAlign: 'center'
  },
  emptyStatValue: {
    fontSize: '2rem',
    fontWeight: '600',
    marginBottom: '5px'
  },
  emptyStatLabel: {
    fontSize: '0.9rem',
    color: '#888'
  }
};

