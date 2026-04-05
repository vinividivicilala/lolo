'use client';

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { initializeApp, getApps } from "firebase/app";
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  GithubAuthProvider
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot,
  where,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  getDocs
} from "firebase/firestore";

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

// Initialize Firebase
let app = null;
let auth = null;
let db = null;

if (typeof window !== "undefined") {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  auth = getAuth(app);
  db = getFirestore(app);
}

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

export default function ProfilePage() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [chatUsers, setChatUsers] = useState([]);
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [adminData, setAdminData] = useState(null);
  const chatEndRef = useRef(null);

  const ADMIN_EMAIL = "faridardiansyah061@gmail.com";

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const handleScroll = () => {
      setShowScrollButton(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Auth state listener
  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Save user to Firestore
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
            photoURL: user.photoURL || null,
            isAdmin: user.email === ADMIN_EMAIL,
            createdAt: new Date().toISOString(),
            lastSeen: new Date().toISOString()
          });
        }

        // If user is not admin, get admin data
        if (user.email !== ADMIN_EMAIL) {
          const usersQuery = query(collection(db, 'users'), where('isAdmin', '==', true));
          const usersSnapshot = await getDocs(usersQuery);
          if (!usersSnapshot.empty) {
            const adminDoc = usersSnapshot.docs[0];
            setAdminData({
              id: adminDoc.id,
              ...adminDoc.data()
            });
          }
        } else {
          // If user is admin, load all users
          loadAllUsers();
        }
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadAllUsers = async () => {
    if (!db) return;
    
    const usersQuery = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      const usersList = [];
      snapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.uid !== currentUser?.uid) {
          usersList.push({
            id: doc.id,
            ...userData
          });
        }
      });
      setChatUsers(usersList);
      
      if (usersList.length > 0 && !selectedChatUser) {
        setSelectedChatUser(usersList[0]);
      }
    });
    
    return () => unsubscribe();
  };

  // Load messages for selected chat
  useEffect(() => {
    if (!db || !currentUser) return;
    
    let chatId = null;
    
    // Determine chat ID
    if (currentUser.email === ADMIN_EMAIL && selectedChatUser) {
      // Admin chatting with regular user
      chatId = [currentUser.uid, selectedChatUser.id].sort().join('_');
    } else if (currentUser.email !== ADMIN_EMAIL && adminData) {
      // Regular user chatting with admin
      chatId = [currentUser.uid, adminData.id].sort().join('_');
    }
    
    if (chatId) {
      console.log("Loading messages for chat:", chatId);
      
      const messagesQuery = query(
        collection(db, 'chats', chatId, 'messages'),
        orderBy('createdAt', 'asc')
      );
      
      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const messagesList = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          messagesList.push({
            id: doc.id,
            ...data,
          });
        });
        setMessages(messagesList);
        setTimeout(() => {
          chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      });
      
      return () => unsubscribe();
    }
  }, [currentUser, selectedChatUser, adminData]);

  const handleLogin = async (providerType) => {
    try {
      const provider = providerType === 'google' ? googleProvider : githubProvider;
      const result = await signInWithPopup(auth, provider);
      console.log("Login success:", result.user);
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed: " + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setMessages([]);
      setSelectedChatUser(null);
      setAdminData(null);
      setChatUsers([]);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !currentUser || !db) {
      console.log("Cannot send message:", { inputMessage, currentUser, db });
      return;
    }
    
    let chatId = null;
    
    // Determine chat ID
    if (currentUser.email === ADMIN_EMAIL && selectedChatUser) {
      chatId = [currentUser.uid, selectedChatUser.id].sort().join('_');
    } else if (currentUser.email !== ADMIN_EMAIL && adminData) {
      chatId = [currentUser.uid, adminData.id].sort().join('_');
    }
    
    if (!chatId) {
      console.log("No chat ID found");
      alert("Please wait, loading chat...");
      return;
    }
    
    try {
      console.log("Sending message to chat:", chatId);
      
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text: inputMessage,
        senderId: currentUser.uid,
        senderName: currentUser.displayName || currentUser.email?.split('@')[0],
        senderEmail: currentUser.email,
        createdAt: new Date().toISOString(),
        isAdmin: currentUser.email === ADMIN_EMAIL
      });
      
      setInputMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message: " + error.message);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return "";
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    try {
      const date = new Date(timestamp);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (date.toDateString() === today.toDateString()) {
        return "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
      } else {
        return date.toLocaleDateString();
      }
    } catch (error) {
      return "";
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const tableData = [
    { year: "interview 2023", title: "Top Interactive Agencies Interview" },
    { year: "interview 2022", title: "Lovers Magazine Interview" },
    { year: "publication 2020", title: "Centogene Solutions" },
    { year: "talk 2020", title: "Creative collaboration at WeTransfer" },
    { year: "publication 2020", title: "Madeleine Dalla Site of the Month Insight" },
    { year: "talk 2020", title: "Rendering Illusions at Awwwards" },
    { year: "publication 2019", title: "Real-time Multiside Refraction in Three Steps" },
    { year: "publication 2019", title: "Making a connected flip-dot installation" },
    { year: "publication 2019", title: "Bandito Immersive Experience" },
    { year: "publication 2018", title: "Resn's Little Help AR" },
  ];

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'black',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ color: 'white' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'black',
      fontFamily: 'NeueHaasGrotesk, "Helvetica Neue", Helvetica, Arial, sans-serif',
      paddingTop: '120px',
      paddingBottom: '80px'
    }}>
      {/* HEADER */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        padding: isMobile ? '1.5rem' : '2rem',
        zIndex: 10,
        backgroundColor: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '1100px',
          margin: '0 auto',
          padding: isMobile ? '0 1.5rem' : '0 3rem'
        }}>
          <motion.div
            onClick={() => router.back()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.8rem',
              cursor: 'pointer',
              width: 'fit-content'
            }}
            whileHover={{ x: -3 }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M17 7L7 17" />
              <path d="M7 7h10v10" />
            </svg>
            <span style={{ color: 'white', fontWeight: 'normal' }}>Back</span>
          </motion.div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {currentUser.photoURL && (
                  <img src={currentUser.photoURL} alt="avatar" style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%'
                  }} />
                )}
                <span style={{ color: 'white', fontSize: '0.875rem' }}>
                  {currentUser.displayName || currentUser.email?.split('@')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.75rem'
                  }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => handleLogin('google')}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.75rem'
                  }}
                >
                  Google Login
                </button>
                <button
                  onClick={() => handleLogin('github')}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.75rem'
                  }}
                >
                  GitHub Login
                </button>
              </div>
            )}
            
            <motion.div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: 'white',
                fontSize: isMobile ? '0.9rem' : '1rem'
              }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.span
                onClick={() => router.push('/')}
                style={{
                  cursor: 'pointer',
                  color: 'rgba(255,255,255,0.6)',
                  fontWeight: 'normal',
                  transition: 'color 0.2s ease'
                }}
                whileHover={{ color: 'white' }}
              >
                Home
              </motion.span>
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>/</span>
              <span style={{ color: 'white', fontWeight: 'normal' }}>Profile</span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* CHAT BUTTON - Only show if user is logged in */}
      {currentUser && (
        <motion.button
          onClick={() => setIsChatOpen(!isChatOpen)}
          style={{
            position: 'fixed',
            bottom: '2rem',
            left: '2rem',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#fff',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </motion.button>
      )}

      {/* CHAT WIDGET */}
      <AnimatePresence>
        {isChatOpen && currentUser && (
          <motion.div
            initial={{ opacity: 0, x: -100, y: 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: -100, y: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed',
              bottom: '6rem',
              left: '2rem',
              width: isMobile ? 'calc(100% - 2rem)' : currentUser.email === ADMIN_EMAIL ? '800px' : '450px',
              height: '600px',
              backgroundColor: '#1a1a1a',
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 199,
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            {/* Chat Header */}
            <div style={{
              padding: '1rem',
              backgroundColor: '#2a2a2a',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: '#4ade80',
                  animation: 'pulse 2s infinite'
                }} />
                <span style={{ color: 'white', fontWeight: '500' }}>
                  {currentUser.email === ADMIN_EMAIL ? 'Admin Chat Panel' : 'Live Chat'}
                </span>
                {selectedChatUser && (
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
                    Chatting with: {selectedChatUser.displayName}
                  </span>
                )}
                {!selectedChatUser && currentUser.email !== ADMIN_EMAIL && adminData && (
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
                    Chatting with: {adminData.displayName || 'Admin'}
                  </span>
                )}
              </div>
              <motion.button
                onClick={() => setIsChatOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px'
                }}
                whileHover={{ scale: 1.1 }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M18 6L6 18" />
                  <path d="M6 6l12 12" />
                </svg>
              </motion.button>
            </div>

            {/* Chat Container */}
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: currentUser.email === ADMIN_EMAIL ? 'row' : 'column'
            }}>
              {/* Admin User List */}
              {currentUser.email === ADMIN_EMAIL && (
                <div style={{
                  width: '250px',
                  borderRight: '1px solid rgba(255,255,255,0.1)',
                  overflowY: 'auto',
                  backgroundColor: '#151515'
                }}>
                  <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <h4 style={{ color: 'white', margin: 0, fontSize: '0.875rem' }}>Users ({chatUsers.length})</h4>
                  </div>
                  {chatUsers.length === 0 ? (
                    <div style={{ padding: '1rem', color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>
                      No users yet
                    </div>
                  ) : (
                    chatUsers.map((user) => (
                      <motion.div
                        key={user.id}
                        onClick={() => setSelectedChatUser(user)}
                        style={{
                          padding: '1rem',
                          cursor: 'pointer',
                          backgroundColor: selectedChatUser?.id === user.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                          borderBottom: '1px solid rgba(255,255,255,0.05)'
                        }}
                        whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {user.photoURL && (
                            <img src={user.photoURL} alt="avatar" style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%'
                            }} />
                          )}
                          <div>
                            <div style={{ color: 'white', fontSize: '0.875rem' }}>
                              {user.displayName}
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              )}

              {/* Messages Area */}
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  {messages.length === 0 ? (
                    <div style={{
                      textAlign: 'center',
                      color: 'rgba(255,255,255,0.5)',
                      padding: '2rem'
                    }}>
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    messages.map((msg, index) => {
                      const showDate = index === 0 || formatDate(msg.createdAt) !== formatDate(messages[index - 1]?.createdAt);
                      
                      return (
                        <React.Fragment key={msg.id}>
                          {showDate && (
                            <div style={{
                              textAlign: 'center',
                              margin: '0.5rem 0',
                              fontSize: '0.7rem',
                              color: 'rgba(255,255,255,0.4)'
                            }}>
                              {formatDate(msg.createdAt)}
                            </div>
                          )}
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                              display: 'flex',
                              justifyContent: msg.senderId === currentUser.uid ? 'flex-end' : 'flex-start'
                            }}
                          >
                            <div style={{
                              maxWidth: '70%',
                              padding: '0.75rem 1rem',
                              borderRadius: '12px',
                              backgroundColor: msg.senderId === currentUser.uid ? '#fff' : '#2a2a2a',
                              color: msg.senderId === currentUser.uid ? '#000' : '#fff'
                            }}>
                              {msg.senderId !== currentUser.uid && (
                                <div style={{ fontSize: '0.7rem', marginBottom: '0.25rem', opacity: 0.7 }}>
                                  {msg.senderName}
                                </div>
                              )}
                              <div style={{ fontSize: '0.9rem', wordWrap: 'break-word' }}>
                                {msg.text}
                              </div>
                              <div style={{
                                fontSize: '0.65rem',
                                marginTop: '0.25rem',
                                opacity: 0.5,
                                textAlign: 'right'
                              }}>
                                {formatTime(msg.createdAt)}
                              </div>
                            </div>
                          </motion.div>
                        </React.Fragment>
                      );
                    })
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Chat Input */}
                <div style={{
                  padding: '1rem',
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                  backgroundColor: '#1a1a1a'
                }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={`Type your message as ${currentUser.displayName || currentUser.email?.split('@')[0]}...`}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        backgroundColor: '#2a2a2a',
                        color: 'white',
                        fontSize: '0.9rem',
                        resize: 'none',
                        fontFamily: 'inherit',
                        outline: 'none'
                      }}
                      rows="2"
                    />
                    <motion.button
                      onClick={sendMessage}
                      style={{
                        padding: '0 1rem',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: '#fff',
                        color: '#000',
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Send
                    </motion.button>
                  </div>
                  {currentUser.email !== ADMIN_EMAIL && (
                    <div style={{
                      fontSize: '0.7rem',
                      color: 'rgba(255,255,255,0.5)',
                      marginTop: '0.5rem',
                      textAlign: 'center'
                    }}>
                      💬 Chat with admin: faridardiansyah061@gmail.com
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT */}
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: isMobile ? '0 1.5rem' : '0 3rem'
      }}>
        <motion.div 
          style={{ marginBottom: '4rem' }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 style={{
            color: 'white',
            fontSize: isMobile ? '2.5rem' : '80px',
            lineHeight: 1.1,
            margin: 0,
            whiteSpace: 'nowrap',
            fontWeight: 'normal'
          }}>
            Tell Donate Record With All Your Heart
          </h1>
          <h1 style={{
            color: 'white',
            fontSize: isMobile ? '2.5rem' : '80px',
            lineHeight: 1.1,
            margin: 0,
            whiteSpace: 'nowrap',
            fontWeight: 'normal'
          }}>
            Logic Feelings
          </h1>
        </motion.div>

        <motion.p 
          style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: isMobile ? '1rem' : '24px',
            maxWidth: '600px',
            marginBottom: '4rem',
            fontWeight: 'normal'
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          From concept to code, I work hand-in-hand with developers and designers—juxtaposing the intuitive with the curious to create delightful and engaging experiences for the world wide web
        </motion.p>

        <div style={{
          height: '1px',
          backgroundColor: 'rgba(255,255,255,0.2)',
          marginBottom: '1rem'
        }} />

        <div>
          {tableData.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: isMobile ? '1.5rem 0' : '2rem 0',
                borderBottom: '1px solid rgba(255,255,255,0.2)',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
              whileHover={{
                backgroundColor: 'rgba(255,255,255,0.05)'
              }}
            >
              <div style={{
                minWidth: isMobile ? '160px' : '240px'
              }}>
                <span style={{
                  color: 'white',
                  fontSize: isMobile ? '1.1rem' : '1.4rem',
                  fontWeight: '500'
                }}>
                  {item.year}
                </span>
              </div>
              <div style={{
                flex: 1,
                padding: '0 2rem'
              }}>
                <span style={{
                  color: 'white',
                  fontSize: isMobile ? '1.3rem' : '1.7rem',
                  fontWeight: 'normal'
                }}>
                  {item.title}
                </span>
              </div>
              <svg
                width={isMobile ? "28" : "34"}
                height={isMobile ? "28" : "34"}
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                style={{ flexShrink: 0 }}
              >
                <path d="M7 17L17 7" />
                <path d="M7 7h10v10" />
              </svg>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Scroll to Top Button */}
      <motion.button
        onClick={scrollToTop}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          backgroundColor: 'white',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: showScrollButton ? 1 : 0,
          scale: showScrollButton ? 1 : 0,
          pointerEvents: showScrollButton ? 'auto' : 'none'
        }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="black" 
          strokeWidth="2.5"
        >
          <path d="M12 19V5M5 12L12 5L19 12" />
        </svg>
      </motion.button>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
