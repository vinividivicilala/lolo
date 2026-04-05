'use client';

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";
import { initializeApp, getApps } from "firebase/app";
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
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
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  where,
  getDocs
} from "firebase/firestore";

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

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

// Providers untuk login
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

export default function ProfilePage() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [authError, setAuthError] = useState("");
  const chatEndRef = useRef(null);
  
  const ADMIN_EMAIL = "faridardiansyah061@gmail.com";

  // Check if user is admin
  const checkIsAdmin = (user) => {
    return user?.email === ADMIN_EMAIL;
  };

  useEffect(() => {
    // Check mobile
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Show scroll to top button
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    // Firebase Auth State Listener
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in
        const isAdmin = checkIsAdmin(user);
        const userData = {
          uid: user.uid,
          name: user.displayName || user.email.split('@')[0],
          email: user.email,
          isAdmin: isAdmin,
          photoURL: user.photoURL
        };
        setCurrentUser(userData);
        setIsAdminMode(isAdmin);
        
        // Save user to Firestore
        await setDoc(doc(db, "users", user.uid), {
          name: userData.name,
          email: userData.email,
          isAdmin: isAdmin,
          lastSeen: serverTimestamp()
        }, { merge: true });
      } else {
        // User is signed out
        setCurrentUser(null);
        setIsAdminMode(false);
      }
    });

    // Load messages from Firestore
    const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));
    const unsubscribeMessages = onSnapshot(q, (snapshot) => {
      const messagesData = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        messagesData.push({
          id: doc.id,
          text: data.text,
          sender: data.sender,
          userId: data.userId,
          userName: data.userName,
          userEmail: data.userEmail,
          timestamp: data.timestamp?.toDate() || new Date()
        });
      });
      
      if (messagesData.length === 0) {
        // Add welcome message if no messages
        addDoc(collection(db, "messages"), {
          text: "Welcome to live chat! Please login to start chatting. Admin: faridardiansyah061@gmail.com",
          sender: 'system',
          userId: 'system',
          userName: 'System',
          userEmail: null,
          timestamp: serverTimestamp()
        });
      } else {
        setMessages(messagesData);
      }
    });

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('scroll', handleScroll);
      unsubscribeAuth();
      unsubscribeMessages();
    };
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleAuth = async () => {
    setAuthError("");
    
    try {
      if (isLoginMode) {
        // Sign in
        const userCredential = await signInWithEmailAndPassword(auth, authEmail, authPassword);
        console.log("User signed in:", userCredential.user.email);
      } else {
        // Sign up
        const userCredential = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
        console.log("User created:", userCredential.user.email);
      }
      setShowAuthModal(false);
      setAuthEmail("");
      setAuthPassword("");
    } catch (error) {
      console.error("Auth error:", error);
      setAuthError(error.message);
    }
  };

  const handleSocialLogin = async (provider) => {
    setAuthError("");
    try {
      await signInWithPopup(auth, provider);
      setShowAuthModal(false);
    } catch (error) {
      console.error("Social login error:", error);
      setAuthError(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setIsAdminMode(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;
    if (!currentUser) {
      alert("Please login first!");
      return;
    }

    try {
      await addDoc(collection(db, "messages"), {
        text: inputMessage,
        sender: currentUser.isAdmin ? 'admin' : 'user',
        userId: currentUser.uid,
        userName: currentUser.name,
        userEmail: currentUser.email,
        timestamp: serverTimestamp()
      });
      setInputMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message");
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
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return `Today at ${formatTime(timestamp)}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${formatTime(timestamp)}`;
    } else {
      return `${date.toLocaleDateString()} at ${formatTime(timestamp)}`;
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
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

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'black',
      fontFamily: 'NeueHaasGrotesk, "Helvetica Neue", Helvetica, Arial, sans-serif',
      paddingTop: '120px',
      paddingBottom: '80px'
    }}>

      {/* HEADER with Breadcrumb */}
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
            {currentUser && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {currentUser.photoURL && (
                  <img 
                    src={currentUser.photoURL} 
                    alt={currentUser.name}
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%'
                    }}
                  />
                )}
                <span style={{ color: 'white', fontSize: '0.875rem' }}>
                  👤 {currentUser.name}
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

      {/* CHAT BUTTON */}
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

      {/* CHAT WIDGET */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, x: -100, y: 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: -100, y: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed',
              bottom: '6rem',
              left: '2rem',
              width: isMobile ? 'calc(100% - 2rem)' : '450px',
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
                  {isAdminMode ? 'Admin Panel' : 'Live Chat'}
                </span>
                {currentUser && (
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
                    ({currentUser.name})
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {!currentUser && (
                  <motion.button
                    onClick={() => setShowAuthModal(true)}
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: 'none',
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.75rem'
                    }}
                    whileHover={{ scale: 1.05 }}
                  >
                    Login / Sign Up
                  </motion.button>
                )}
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
            </div>

            {/* Auth Modal */}
            {showAuthModal && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.95)',
                zIndex: 300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  backgroundColor: '#2a2a2a',
                  padding: '2rem',
                  borderRadius: '12px',
                  width: '320px',
                  maxWidth: '90%'
                }}>
                  <h3 style={{ color: 'white', marginBottom: '1rem' }}>
                    {isLoginMode ? 'Login' : 'Sign Up'}
                  </h3>
                  
                  {authError && (
                    <div style={{
                      backgroundColor: 'rgba(255,0,0,0.1)',
                      color: '#ff6b6b',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      marginBottom: '1rem',
                      fontSize: '0.875rem'
                    }}>
                      {authError}
                    </div>
                  )}
                  
                  <input
                    type="email"
                    placeholder="Email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      marginBottom: '1rem',
                      borderRadius: '4px',
                      border: '1px solid rgba(255,255,255,0.2)',
                      backgroundColor: '#1a1a1a',
                      color: 'white',
                      fontSize: '0.9rem'
                    }}
                  />
                  
                  <input
                    type="password"
                    placeholder="Password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      marginBottom: '1rem',
                      borderRadius: '4px',
                      border: '1px solid rgba(255,255,255,0.2)',
                      backgroundColor: '#1a1a1a',
                      color: 'white',
                      fontSize: '0.9rem'
                    }}
                  />
                  
                  <button
                    onClick={handleAuth}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      marginBottom: '1rem'
                    }}
                  >
                    {isLoginMode ? 'Login' : 'Sign Up'}
                  </button>
                  
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                    <button
                      onClick={() => handleSocialLogin(googleProvider)}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        borderRadius: '4px',
                        color: 'white',
                        cursor: 'pointer'
                      }}
                    >
                      Google
                    </button>
                    <button
                      onClick={() => handleSocialLogin(githubProvider)}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        borderRadius: '4px',
                        color: 'white',
                        cursor: 'pointer'
                      }}
                    >
                      GitHub
                    </button>
                  </div>
                  
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', textAlign: 'center' }}>
                    {isLoginMode ? "Don't have an account? " : "Already have an account? "}
                    <span
                      onClick={() => {
                        setIsLoginMode(!isLoginMode);
                        setAuthError("");
                      }}
                      style={{ color: 'white', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      {isLoginMode ? 'Sign Up' : 'Login'}
                    </span>
                  </p>
                  
                  <button
                    onClick={() => setShowAuthModal(false)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      backgroundColor: 'transparent',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '4px',
                      color: 'white',
                      cursor: 'pointer',
                      marginTop: '0.5rem'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Chat Messages */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              {messages.map((msg, index) => {
                const isCurrentUser = currentUser && msg.userId === currentUser.uid;
                const showDate = index === 0 || (messages[index - 1] && 
                  new Date(msg.timestamp).toDateString() !== new Date(messages[index - 1].timestamp).toDateString());
                
                return (
                  <React.Fragment key={msg.id}>
                    {showDate && (
                      <div style={{
                        textAlign: 'center',
                        margin: '0.5rem 0',
                        fontSize: '0.7rem',
                        color: 'rgba(255,255,255,0.5)'
                      }}>
                        {formatDate(msg.timestamp).split(' at ')[0]}
                      </div>
                    )}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        display: 'flex',
                        justifyContent: msg.sender === 'system' ? 'center' : (isCurrentUser ? 'flex-end' : 'flex-start')
                      }}
                    >
                      <div style={{
                        maxWidth: msg.sender === 'system' ? '90%' : '80%',
                        padding: msg.sender === 'system' ? '0.5rem 1rem' : '0.75rem 1rem',
                        borderRadius: msg.sender === 'system' ? '8px' : '12px',
                        backgroundColor: msg.sender === 'system' ? 'rgba(255,255,255,0.1)' :
                                       msg.sender === 'admin' ? '#2a2a2a' : 
                                       isCurrentUser ? '#fff' : '#2a2a2a',
                        color: msg.sender === 'system' ? 'rgba(255,255,255,0.7)' :
                              (msg.sender === 'user' && isCurrentUser) ? '#000' : '#fff'
                      }}>
                        {msg.sender !== 'system' && (
                          <div style={{ 
                            fontSize: '0.7rem', 
                            marginBottom: '0.25rem', 
                            opacity: 0.7,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}>
                            {msg.userName}
                            {msg.userEmail === ADMIN_EMAIL && (
                              <span style={{ 
                                fontSize: '0.6rem', 
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                padding: '0.1rem 0.3rem',
                                borderRadius: '3px'
                              }}>
                                Admin
                              </span>
                            )}
                          </div>
                        )}
                        <div style={{ fontSize: '0.85rem', wordWrap: 'break-word', lineHeight: 1.4 }}>
                          {msg.text}
                        </div>
                        <div style={{
                          fontSize: '0.6rem',
                          marginTop: '0.25rem',
                          opacity: 0.5,
                          textAlign: 'right'
                        }}>
                          {formatTime(msg.timestamp)}
                        </div>
                      </div>
                    </motion.div>
                  </React.Fragment>
                );
              })}
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ display: 'flex', justifyContent: 'flex-start' }}
                >
                  <div style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    backgroundColor: '#2a2a2a',
                    color: '#fff'
                  }}>
                    <div style={{ fontSize: '0.7rem', marginBottom: '0.25rem' }}>Someone is typing</div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <span className="typing-dot">•</span>
                      <span className="typing-dot">•</span>
                      <span className="typing-dot">•</span>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            {currentUser && (
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
                    placeholder={`Type your message as ${currentUser.name}...`}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.2)',
                      backgroundColor: '#2a2a2a',
                      color: 'white',
                      fontSize: '0.85rem',
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
                    fontSize: '0.65rem',
                    color: 'rgba(255,255,255,0.5)',
                    marginTop: '0.5rem',
                    textAlign: 'center'
                  }}>
                    💬 Admin: faridardiansyah061@gmail.com
                  </div>
                )}
              </div>
            )}
            
            {!currentUser && (
              <div style={{
                padding: '2rem',
                textAlign: 'center',
                color: 'rgba(255,255,255,0.6)',
                fontSize: '0.9rem'
              }}>
                Please login to start chatting
                <button
                  onClick={() => setShowAuthModal(true)}
                  style={{
                    display: 'block',
                    margin: '1rem auto 0',
                    padding: '0.5rem 1rem',
                    backgroundColor: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Login / Sign Up
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONTENT */}
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
        
        .typing-dot {
          animation: typing 1.4s infinite;
          animation-fill-mode: both;
          font-size: 20px;
        }
        
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        
        @keyframes typing {
          0%, 60%, 100% {
            opacity: 0.3;
            transform: translateY(0);
          }
          30% {
            opacity: 1;
            transform: translateY(-4px);
          }
        }
      `}</style>
    </div>
  );
}
